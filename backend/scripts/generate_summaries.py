#!/usr/bin/env python3
"""
Generate biologist-facing summaries for VCell biomodels and store them in Supabase.

Run from the backend directory, because app.core.config resolves .env relative to
the working directory:

    cd backend
    poetry run python scripts/generate_summaries.py --limit 10
    poetry run python scripts/generate_summaries.py --only 308709601 --force
    poetry run python scripts/generate_summaries.py            # the whole catalogue

The job bills LiteLLM with the master key rather than a user's virtual key, since
there is no logged-in user; see _key_for_model in app/services/llms_service.py for
the existing precedent.

A re-run skips any model whose assembled inputs and SKILL.md are both unchanged,
so it is cheap to re-run after a partial failure. Failures are recorded with
status='failed' instead of aborting the run, and a plain re-run retries them.
"""

import argparse
import asyncio
import sys
import time
from pathlib import Path

# Allow `poetry run python scripts/generate_summaries.py` from backend/.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.config import settings  # noqa: E402
from app.core.logger import get_logger  # noqa: E402
from app.schemas.vcelldb_schema import BiomodelRequestParams  # noqa: E402
from app.services.model_summary_service import (  # noqa: E402
    collect_summary_inputs,
    generate_summary,
    get_existing_hashes,
    load_skill_prompt,
    upsert_summary,
)
from app.services.publications_service import sync_publications  # noqa: E402
from app.services.vcelldb_service import fetch_biomodels  # noqa: E402

logger = get_logger("generate_summaries")


async def load_catalogue(limit: int | None, only: list[str] | None) -> list[dict]:
    """
    Fetch the biomodels to process.

    Args:
        limit (int | None): Cap on how many models to return.
        only (list[str] | None): Explicit biomodel keys, overriding the catalogue.

    Returns:
        list[dict]: Biomodel metadata records.
    """
    if only:
        models = []
        for bm_key in only:
            result = await fetch_biomodels(BiomodelRequestParams(bmId=bm_key, maxRows=1))
            data = result.get("data") or []
            if data:
                models.append(data[0])
            else:
                print(f"  ! {bm_key}: not found in the catalogue")
        return models

    result = await fetch_biomodels(BiomodelRequestParams(maxRows=100000))
    models = result.get("data") or []
    return models[:limit] if limit else models


def should_skip(bm_key: str, input_hash: str, skill_hash: str, existing: dict) -> bool:
    """
    Decide whether a model already has a current summary.

    Args:
        bm_key (str): Biomodel key.
        input_hash (str): Hash of the freshly assembled inputs.
        skill_hash (str): Hash of the current SKILL.md.
        existing (dict): Stored hashes, keyed by biomodel key.

    Returns:
        bool: True when the stored summary is still valid.
    """
    row = existing.get(str(bm_key))
    return bool(
        row
        and row.get("status") == "ok"
        and row.get("input_hash") == input_hash
        and row.get("skill_hash") == skill_hash
    )


async def process_model(
    biomodel: dict,
    existing: dict,
    args: argparse.Namespace,
    skill_hash: str,
    semaphore: asyncio.Semaphore,
    counters: dict,
) -> None:
    """
    Generate and store the summary for one biomodel.

    Failures are recorded rather than raised, so one bad model cannot end the run.
    """
    bm_key = str(biomodel.get("bmKey"))
    name = (biomodel.get("name") or "")[:40]

    async with semaphore:
        started = time.monotonic()
        try:
            # Assembled once and reused: it yields both the skip hash and the
            # prompt, and refetching would mean pulling the VCML twice.
            inputs = await collect_summary_inputs(bm_key)

            if not args.force and should_skip(
                bm_key, inputs["input_hash"], skill_hash, existing
            ):
                counters["skipped"] += 1
                print(f"  = {bm_key} {name}: unchanged, skipped")
                return

            if args.dry_run:
                counters["dry_run"] += 1
                chars = len(inputs["summary_input"])
                print(
                    f"  ~ {bm_key} {name}: {chars} chars (~{chars // 4} tokens), "
                    f"bngl={inputs['used_bngl']}, pubs={len(inputs['pub_keys'])}"
                )
                return

            row = await generate_summary(
                bm_key, args.virtual_key, args.model, inputs=inputs
            )
            upsert_summary(row)
            counters["generated"] += 1
            print(
                f"  + {bm_key} {name}: {len(row['summary_md'])} chars "
                f"in {time.monotonic() - started:.1f}s"
            )

        except Exception as e:
            counters["failed"] += 1
            print(f"  ! {bm_key} {name}: {str(e)[:160]}")
            try:
                upsert_summary(
                    {
                        "bm_key": int(bm_key),
                        "model_name": biomodel.get("name"),
                        "owner_name": biomodel.get("ownerName"),
                        "summary_md": None,
                        "status": "failed",
                        "error": str(e)[:2000],
                        "input_hash": "",
                        "skill_hash": skill_hash,
                        "llm_model": args.model,
                        "used_bngl": False,
                        "pub_keys": [],
                    }
                )
            except Exception as store_error:
                logger.warning(f"Could not record failure for {bm_key}: {store_error}")


async def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, help="Process at most this many biomodels")
    parser.add_argument("--only", help="Comma-separated biomodel keys to process")
    parser.add_argument(
        "--force", action="store_true", help="Regenerate even if inputs are unchanged"
    )
    parser.add_argument("--concurrency", type=int, default=5)
    parser.add_argument("--model", default="openai-model", help="LiteLLM model alias")
    parser.add_argument(
        "--skip-publications",
        action="store_true",
        help="Don't refresh the publications tables first",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Assemble inputs and report sizes without calling the LLM",
    )
    args = parser.parse_args()

    if not settings.LITELLM_MASTER_KEY:
        print("LITELLM_MASTER_KEY is not set; cannot run without a LiteLLM key.")
        return 1
    args.virtual_key = settings.LITELLM_MASTER_KEY

    _, skill_hash = load_skill_prompt()
    print(f"SKILL.md hash: {skill_hash[:12]}  model: {args.model}")

    if not args.skip_publications:
        print("\nSyncing publications...")
        stats = await sync_publications()
        print(
            f"  {stats['publications']} publications, {stats['biomodel_links']} links "
            f"over {stats['biomodels_with_publications']} biomodels, "
            f"{stats['with_abstract']} with abstracts"
        )

    only = [key.strip() for key in args.only.split(",")] if args.only else None
    print("\nLoading catalogue...")
    models = await load_catalogue(args.limit, only)
    print(f"  {len(models)} biomodels to consider")

    existing = {} if args.force else get_existing_hashes()
    counters = {"generated": 0, "skipped": 0, "failed": 0, "dry_run": 0}
    semaphore = asyncio.Semaphore(args.concurrency)

    print(f"\nProcessing (concurrency {args.concurrency})...")
    started = time.monotonic()
    await asyncio.gather(
        *(
            process_model(model, existing, args, skill_hash, semaphore, counters)
            for model in models
        )
    )

    elapsed = time.monotonic() - started
    print(
        f"\nDone in {elapsed:.0f}s: {counters['generated']} generated, "
        f"{counters['skipped']} skipped, {counters['failed']} failed"
        + (f", {counters['dry_run']} dry-run" if counters["dry_run"] else "")
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
