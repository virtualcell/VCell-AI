"""
Publication data from the VCell v1 API, mirrored into Supabase.

The v1 feed is the input the summary generator needs (title, citation and,
crucially, the PubMed abstract), and it doubles as the source for the
publications section on the biomodel page. It is stored rather than fetched live
because abstracts come from a second upstream (PubMed) that we don't want to hit
on every page view.

The v1 payload differs from v0 in ways that all have to be handled here:
  * `biomodelRefs` / `mathmodelRefs` instead of `biomodelReferences` / `mathmodelReferences`
  * pubKey / bmKey / ownerKey / versionFlag arrive as ints rather than strings
  * a few DOIs carry leading whitespace
  * `url` is unusable - some records literally contain the string "url", others null
  * `pubmedid` is absent on some records and the string "0" on others
  * `authors` is split on commas, so surnames and initials land in separate elements
"""

import asyncio
import re
import time
from typing import List, Optional

import httpx
from langfuse import observe

from app.core.logger import get_logger
from app.core.singleton import get_supabase_client

logger = get_logger("publications_service")

VCELL_API_V1_BASE_URL = "https://vcell-dev.cam.uchc.edu/api/v1"
PUBMED_EFETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

# NCBI accepts long id lists but asks for no more than 3 requests/second without
# an API key, so abstracts are fetched in a few large batches rather than singly.
PUBMED_BATCH_SIZE = 100
PUBMED_REQUEST_DELAY_SECONDS = 0.4

# Upstream ids that exist but mean "none".
_EMPTY_PUBMED_IDS = {"", "0", "-1", "none", "null"}


def _clean_text(value) -> Optional[str]:
    """Normalise an upstream string field to a trimmed value or None."""
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _normalize_authors(authors) -> Optional[str]:
    """
    Rejoin the API's comma-split author list into a readable string.

    ["Bener", " M. B.", " Slepchenko", " B. M.", " & Inaba", " M."]
      -> "Bener, M. B., Slepchenko, B. M., & Inaba, M."
    """
    if not authors:
        return None
    if isinstance(authors, str):
        return _clean_text(authors)

    parts = [
        part.strip()
        for part in authors
        if part and part.strip() and part.strip() not in ("&", ",")
    ]
    return ", ".join(parts) or None


def _normalize_pubmed_id(value) -> Optional[str]:
    """Return a usable PubMed id, or None for the placeholder values upstream uses."""
    text = _clean_text(value)
    if text is None or text.lower() in _EMPTY_PUBMED_IDS:
        return None
    return text if text.isdigit() else None


def _normalize_date(value) -> Optional[str]:
    """Take the calendar date off an ISO timestamp, for a DATE column."""
    text = _clean_text(value)
    if not text:
        return None
    match = re.match(r"^(\d{4}-\d{2}-\d{2})", text)
    return match.group(1) if match else None


def clean_publication(raw: dict) -> Optional[dict]:
    """
    Turn one raw v1 publication record into a `publications` row.

    Args:
        raw (dict): A record from the v1 publications feed.

    Returns:
        Optional[dict]: The row to upsert, or None if the record has no usable key.
    """
    pub_key = raw.get("pubKey")
    title = _clean_text(raw.get("title"))
    if pub_key is None or not title:
        return None

    year = raw.get("year")
    return {
        "pub_key": int(pub_key),
        "title": title,
        "authors": _normalize_authors(raw.get("authors")),
        "year": int(year) if isinstance(year, int) or str(year or "").isdigit() else None,
        "citation": _clean_text(raw.get("citation")),
        "pubmedid": _normalize_pubmed_id(raw.get("pubmedid")),
        # A few DOIs arrive with leading whitespace, which breaks doi.org links.
        "doi": _clean_text(raw.get("doi")),
        "pub_date": _normalize_date(raw.get("date")),
        "raw": raw,
    }


def extract_biomodel_links(raw: dict) -> List[dict]:
    """
    Build `biomodel_publications` rows from one publication's biomodel references.

    Args:
        raw (dict): A record from the v1 publications feed.

    Returns:
        List[dict]: One row per referenced biomodel.
    """
    pub_key = raw.get("pubKey")
    if pub_key is None:
        return []

    rows = []
    for reference in raw.get("biomodelRefs") or []:
        bm_key = reference.get("bmKey")
        if bm_key is None:
            continue
        rows.append(
            {
                "bm_key": int(bm_key),
                "pub_key": int(pub_key),
                "model_name": _clean_text(reference.get("name")),
                "owner_name": _clean_text(reference.get("ownerName")),
                "owner_key": reference.get("ownerKey"),
                "version_flag": reference.get("versionFlag"),
            }
        )
    return rows


@observe(name="FETCH_PUBLICATIONS_V1")
async def fetch_publications_v1() -> List[dict]:
    """
    Fetch the raw publication feed from the VCell v1 API.

    Returns:
        List[dict]: Raw publication records.
    """
    url = f"{VCELL_API_V1_BASE_URL}/publications"
    logger.info(f"Fetching publications from {url}")

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        payload = response.json()

    if not isinstance(payload, list):
        logger.warning(f"Unexpected publications payload: {type(payload)}")
        return []

    logger.info(f"Fetched {len(payload)} publications")
    return payload


def _parse_pubmed_abstracts(text: str) -> dict:
    """
    Split a PubMed `rettype=abstract&retmode=text` response into per-PMID text.

    Records are numbered ("1. ", "2. ", ...) and each carries its own `PMID:`
    line, which is what maps a block back to the publication that asked for it.

    Args:
        text (str): The raw efetch response body.

    Returns:
        dict: PubMed id -> abstract text.
    """
    abstracts = {}
    starts = [match.start() for match in re.finditer(r"(?m)^\d+\.\s", text)]

    for index, start in enumerate(starts):
        end = starts[index + 1] if index + 1 < len(starts) else len(text)
        block = text[start:end].strip()

        pmid_match = re.search(r"(?m)^PMID:\s*(\d+)", block)
        if not pmid_match:
            continue

        # Drop the trailing PMID/DOI bookkeeping lines; keep the prose above them.
        body = block[: pmid_match.start()].strip()
        if body:
            abstracts[pmid_match.group(1)] = body

    return abstracts


@observe(name="FETCH_PUBMED_ABSTRACTS")
async def fetch_pubmed_abstracts(pubmed_ids: List[str]) -> dict:
    """
    Fetch abstracts for a list of PubMed ids, in batches.

    A batch that fails (PubMed returns 400 for an unusable id list) is logged and
    skipped rather than failing the sync: abstracts are an enrichment, not a
    requirement.

    Args:
        pubmed_ids (List[str]): PubMed ids, already filtered to digits only.

    Returns:
        dict: PubMed id -> abstract text, for the ids PubMed returned.
    """
    unique_ids = sorted({pid for pid in pubmed_ids if pid})
    if not unique_ids:
        return {}

    abstracts: dict = {}
    async with httpx.AsyncClient(timeout=120.0) as client:
        for offset in range(0, len(unique_ids), PUBMED_BATCH_SIZE):
            batch = unique_ids[offset : offset + PUBMED_BATCH_SIZE]
            try:
                response = await client.get(
                    PUBMED_EFETCH_URL,
                    params={
                        "db": "pubmed",
                        "id": ",".join(batch),
                        "rettype": "abstract",
                        "retmode": "text",
                    },
                )
                response.raise_for_status()
                abstracts.update(_parse_pubmed_abstracts(response.text))
            except Exception as e:
                logger.warning(
                    f"PubMed batch starting at {offset} failed ({len(batch)} ids): {str(e)}"
                )

            await asyncio.sleep(PUBMED_REQUEST_DELAY_SECONDS)

    logger.info(f"Fetched {len(abstracts)} abstracts for {len(unique_ids)} PubMed ids")
    return abstracts


@observe(name="SYNC_PUBLICATIONS")
async def sync_publications(with_abstracts: bool = True) -> dict:
    """
    Refresh the `publications` and `biomodel_publications` tables from the v1 API.

    Args:
        with_abstracts (bool): Whether to also fetch PubMed abstracts.

    Returns:
        dict: Counts describing what was written.
    """
    raw_publications = await fetch_publications_v1()

    # Keyed rather than appended: Postgres rejects an upsert whose batch contains
    # the same primary key twice, and at least one publication upstream lists the
    # same biomodel in its references twice.
    rows_by_key: dict = {}
    links_by_key: dict = {}
    for raw in raw_publications:
        row = clean_publication(raw)
        if row is None:
            continue
        rows_by_key[row["pub_key"]] = row
        for link in extract_biomodel_links(raw):
            links_by_key[(link["bm_key"], link["pub_key"])] = link

    rows = list(rows_by_key.values())
    link_rows = list(links_by_key.values())

    if with_abstracts:
        abstracts = await fetch_pubmed_abstracts(
            [row["pubmedid"] for row in rows if row["pubmedid"]]
        )
        for row in rows:
            row["abstract"] = abstracts.get(row["pubmedid"]) if row["pubmedid"] else None

    supabase = get_supabase_client()
    if rows:
        supabase.table("publications").upsert(rows, on_conflict="pub_key").execute()
    if link_rows:
        supabase.table("biomodel_publications").upsert(
            link_rows, on_conflict="bm_key,pub_key"
        ).execute()

    result = {
        "publications": len(rows),
        "biomodel_links": len(link_rows),
        "biomodels_with_publications": len({row["bm_key"] for row in link_rows}),
        "with_abstract": sum(1 for row in rows if row.get("abstract")),
    }
    logger.info(f"Publications sync complete: {result}")
    return result


def get_publication_rows_for_biomodel(bm_key: str) -> List[dict]:
    """
    Read a biomodel's publications out of Supabase, newest first.

    Args:
        bm_key (str): Biomodel key.

    Returns:
        List[dict]: Joined publication rows; empty when none are stored.
    """
    supabase = get_supabase_client()
    response = (
        supabase.table("biomodel_publications")
        .select("pub_key, publications(*)")
        .eq("bm_key", int(bm_key))
        .execute()
    )

    rows = [
        item["publications"]
        for item in (response.data or [])
        if item.get("publications")
    ]
    rows.sort(key=lambda row: row.get("pub_date") or "", reverse=True)
    return rows


def get_biomodel_keys_with_publications() -> List[str]:
    """
    List every biomodel key that at least one publication references.

    Used by the search page to narrow results to published models. Returns keys
    rather than full publication rows: the set is small (a few hundred), the
    caller only needs membership, and it is fetched once per search rather than
    per result.

    Returns:
        List[str]: Biomodel keys, as strings to match the VCell API's `bmKey`.
    """
    supabase = get_supabase_client()
    keys: set = set()
    page_size = 1000
    offset = 0

    while True:
        response = (
            supabase.table("biomodel_publications")
            .select("bm_key")
            .range(offset, offset + page_size - 1)
            .execute()
        )
        batch = response.data or []
        keys.update(str(row["bm_key"]) for row in batch)
        if len(batch) < page_size:
            break
        offset += page_size

    return sorted(keys)


def to_api_shape(row: dict) -> dict:
    """
    Map a stored publication row back to the shape the biomodel page expects.

    Keeps the existing `/biomodel/{id}/publications` response identical to the
    live-fetch version so the frontend is unaffected by where the data came from.

    Args:
        row (dict): A `publications` table row.

    Returns:
        dict: The API representation of that publication.
    """
    return {
        "pubKey": str(row.get("pub_key")),
        "title": row.get("title"),
        "authors": row.get("authors"),
        "year": row.get("year"),
        "citation": row.get("citation"),
        "pubmedid": row.get("pubmedid"),
        "doi": row.get("doi"),
        "date": row.get("pub_date"),
    }


def _publication_row_to_listing(row: dict, links: List[dict]) -> dict:
    """
    Shape one publication for the published-models listing.

    Args:
        row (dict): A `publications` table row.
        links (List[dict]): Its `biomodel_publications` rows.

    Returns:
        dict: The listing representation, including the owners of the biomodels
        the publication references.
    """
    biomodels = [
        {
            "bmKey": str(link["bm_key"]),
            "name": link.get("model_name"),
            "ownerName": link.get("owner_name"),
        }
        for link in links
    ]

    # A publication can cite several models from different users, so owner is a
    # list rather than a single value. Deduplicated, order preserved.
    owners = list(
        dict.fromkeys(
            model["ownerName"] for model in biomodels if model.get("ownerName")
        )
    )

    return {
        "pubKey": str(row.get("pub_key")),
        "title": row.get("title"),
        "authors": row.get("authors"),
        "year": row.get("year"),
        "citation": row.get("citation"),
        "pubmedid": row.get("pubmedid"),
        "doi": row.get("doi"),
        "biomodels": biomodels,
        "owners": owners,
    }


# The listing is rebuilt from the live feed rather than the synced tables, so
# newly added publications appear without waiting for a sync. Everything the
# page shows - owners included - is in the upstream payload; only the PubMed
# abstracts (used for summary generation) need the stored copy. A short TTL
# keeps a burst of page loads down to one upstream call.
PUBLICATIONS_LISTING_TTL_SECONDS = 15 * 60

_listing_cache: Optional[List[dict]] = None
_listing_cached_at: float = 0.0
_listing_lock = asyncio.Lock()


def _raw_publication_to_listing(raw: dict) -> Optional[tuple]:
    """
    Shape one raw v1 record for the listing.

    Reuses the same cleaning the sync applies, so the live and stored paths
    return identical shapes rather than two nearly-alike ones.

    Args:
        raw (dict): A record from the v1 publications feed.

    Returns:
        Optional[tuple]: (publication date, listing entry), or None if the
        record has no usable key. The date is returned separately because the
        listing itself doesn't carry it, but the page orders by it.
    """
    row = clean_publication(raw)
    if row is None:
        return None
    return row.get("pub_date") or "", _publication_row_to_listing(
        row, extract_biomodel_links(raw)
    )


@observe(name="GET_PUBLICATIONS_LISTING_LIVE")
async def get_publications_listing_live() -> List[dict]:
    """
    Build the publications listing from the live VCell feed, cached briefly.

    Returns:
        List[dict]: Publications, newest first.
    """
    global _listing_cache, _listing_cached_at

    async with _listing_lock:
        is_fresh = (
            _listing_cache is not None
            and (time.monotonic() - _listing_cached_at)
            < PUBLICATIONS_LISTING_TTL_SECONDS
        )

        if not is_fresh:
            raw_publications = await fetch_publications_v1()
            entries = [
                entry
                for entry in (
                    _raw_publication_to_listing(raw) for raw in raw_publications
                )
                if entry is not None
            ]
            entries.sort(key=lambda entry: entry[0], reverse=True)

            _listing_cache = [listing for _, listing in entries]
            _listing_cached_at = time.monotonic()
            logger.info(
                f"Publications listing refreshed from the live feed: "
                f"{len(_listing_cache)} publications"
            )

        return _listing_cache


def get_publications_listing() -> List[dict]:
    """
    List every publication with the biomodels it references and their owners,
    from the synced Supabase tables.

    The fallback for get_publications_listing_live: a snapshot that keeps the
    page working when the VCell API is unreachable. Deliberately omits the
    fields the page doesn't show (pubKey aside, which is only a row key): the
    publication date, the raw payload, and math-model references.

    Returns:
        List[dict]: Publications, newest first; empty when none are stored.
    """
    supabase = get_supabase_client()

    publications = (
        supabase.table("publications")
        .select("pub_key, title, authors, year, citation, pubmedid, doi, pub_date")
        .order("pub_date", desc=True)
        .execute()
    ).data or []

    links_by_pub: dict = {}
    offset = 0
    page_size = 1000
    while True:
        batch = (
            supabase.table("biomodel_publications")
            .select("pub_key, bm_key, model_name, owner_name")
            .range(offset, offset + page_size - 1)
            .execute()
        ).data or []
        for link in batch:
            links_by_pub.setdefault(link["pub_key"], []).append(link)
        if len(batch) < page_size:
            break
        offset += page_size

    return [
        _publication_row_to_listing(row, links_by_pub.get(row["pub_key"], []))
        for row in publications
    ]


def get_publications_for_biomodel(bm_key: str) -> List[dict]:
    """
    Fetch a biomodel's publications from Supabase in API shape.

    Args:
        bm_key (str): Biomodel key.

    Returns:
        List[dict]: Publications, or an empty list if none are stored.
    """
    return [to_api_shape(row) for row in get_publication_rows_for_biomodel(bm_key)]
