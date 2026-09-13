"""
Generation and storage of biologist-facing biomodel summaries.

Summaries are written to the structure mandated by SKILL.md at the repo root,
which is read at generation time and used as the system prompt, so it can be
edited without a code change. The hash of that file is stored with every summary,
so an edit invalidates the summaries it produced and a re-run regenerates them.

A raw VCML file averages ~215 KB, but more than half of it is the generated
<MathDescription> block, which says nothing about the biology. Only the <Model>
element is sent to the LLM, plus the BNGL export when the model is rule-based -
that export is ~1.4 KB and names the compartments, molecules, readouts and rules
the summary is supposed to describe.
"""

import hashlib
import re
from pathlib import Path
from typing import List, Optional

from langfuse import observe

from app.core.logger import get_logger
from app.core.singleton import get_supabase_client
from app.services.publications_service import get_publication_rows_for_biomodel
from app.services.vcelldb_service import (
    fetch_biomodels,
    get_bngl_file,
    get_vcml_file,
)
from app.schemas.vcelldb_schema import BiomodelRequestParams

logger = get_logger("model_summary_service")

# backend/app/services/model_summary_service.py -> repo root
SKILL_FILE = Path(__file__).resolve().parents[3] / "SKILL.md"

# ~15k tokens of model structure. Enough for the biggest models in the catalogue
# to be described accurately without the prompt dwarfing everything else.
MODEL_SECTION_CHAR_CAP = 60_000
ABSTRACT_CHAR_CAP = 4_000

# SKILL.md is written for an agent reading files off disk. This reframes those
# instructions for inputs delivered inline, and pins the output to bare Markdown.
SKILL_ADAPTER_PREAMBLE = """
You are generating one model explanation, following the instructions below exactly.

The inputs described in those instructions are supplied inline in the user message
rather than as files: the model's catalogue metadata, curator notes, any
publications that reference it (with abstracts where available), the structure
extracted from its VCML, and its rule-based definition when it has one. Treat
those inline sections as the required inputs.

Reply with the Markdown document only. Do not wrap the whole document in a code
fence, and do not add any preamble or commentary around it.

---

"""


def load_skill_prompt() -> tuple[str, str]:
    """
    Read SKILL.md and return the system prompt plus a hash of the file.

    Returns:
        tuple[str, str]: (system prompt, sha256 of SKILL.md).

    Raises:
        FileNotFoundError: If SKILL.md is missing from the repo root.
    """
    skill_text = SKILL_FILE.read_text(encoding="utf-8")
    skill_hash = hashlib.sha256(skill_text.encode("utf-8")).hexdigest()
    return SKILL_ADAPTER_PREAMBLE + skill_text, skill_hash


def extract_model_section(vcml: str) -> str:
    """
    Pull the biologically meaningful part out of a VCML document.

    Keeps the <Model> element - species, reactions, kinetics, the rule-based
    container and the curator <Annotation> blocks inside it. Everything else is
    generated math, geometry and solver configuration.

    Args:
        vcml (str): VCML document (already stripped of <ImageData> upstream).

    Returns:
        str: The extracted structure, capped in length.
    """
    sections = re.findall(r"<Model[ >].*?</Model>", vcml, flags=re.DOTALL)

    if sections:
        extracted = "\n".join(sections)
    else:
        # No <Model> element (unusual, but don't lose the model entirely): fall
        # back to the whole document minus the parts that are never useful.
        logger.warning("No <Model> element found in VCML; falling back to pruned document")
        extracted = vcml
        for tag in ("MathDescription", "Geometry", "Simulation"):
            extracted = re.sub(
                rf"<{tag}[ >].*?</{tag}>", "", extracted, flags=re.DOTALL
            )

    extracted = extracted.strip()
    if len(extracted) > MODEL_SECTION_CHAR_CAP:
        extracted = (
            extracted[:MODEL_SECTION_CHAR_CAP]
            + "\n<!-- structure truncated; the model is larger than shown -->"
        )
    return extracted


def strip_provenance(annot: Optional[str]) -> str:
    """
    Drop the "cloned from ..." lines from a biomodel annotation.

    Those lines record which user copied the model from whom and crowd out the
    curator's actual notes.

    Args:
        annot (Optional[str]): The raw `annot` field.

    Returns:
        str: The remaining notes, or "" when nothing is left.
    """
    if not annot:
        return ""
    lines = [
        line
        for line in annot.splitlines()
        if not line.strip().lower().startswith("cloned from")
    ]
    return "\n".join(lines).strip()


def _format_publication(row: dict) -> str:
    """Render one stored publication row for the prompt."""
    parts = [f"- Title: {row.get('title')}"]
    for label, key in (
        ("Authors", "authors"),
        ("Year", "year"),
        ("Citation", "citation"),
        ("DOI", "doi"),
    ):
        if row.get(key):
            parts.append(f"  {label}: {row[key]}")

    abstract = (row.get("abstract") or "").strip()
    if abstract:
        if len(abstract) > ABSTRACT_CHAR_CAP:
            abstract = abstract[:ABSTRACT_CHAR_CAP] + " [...]"
        parts.append(f"  Abstract: {abstract}")

    return "\n".join(parts)


def build_summary_input(
    biomodel: dict,
    model_section: str,
    bngl: str,
    publications: List[dict],
) -> str:
    """
    Assemble the user message describing one biomodel.

    Args:
        biomodel (dict): Catalogue metadata from fetch_biomodels.
        model_section (str): Output of extract_model_section.
        bngl (str): BNGL export, or "" when the model is not rule-based.
        publications (List[dict]): Stored publication rows referencing this model.

    Returns:
        str: The prompt body.
    """
    blocks = [
        "## Model metadata",
        f"Name: {biomodel.get('name')}",
        f"Owner: {biomodel.get('ownerName')}",
    ]

    applications = biomodel.get("applications") or []
    if applications:
        blocks.append(
            "Applications: "
            + ", ".join(app.get("name", "") for app in applications if app.get("name"))
        )

    simulations = biomodel.get("simulations") or []
    if simulations:
        blocks.append("Simulations:")
        for simulation in simulations:
            solver = simulation.get("solverName")
            blocks.append(
                f"  - {simulation.get('name')}" + (f" (solver: {solver})" if solver else "")
            )

    notes = strip_provenance(biomodel.get("annot"))
    if notes:
        blocks += ["", "## Curator notes", notes]

    if publications:
        blocks += ["", "## Publications referencing this model"]
        blocks += [_format_publication(row) for row in publications]
    else:
        blocks += [
            "",
            "## Publications referencing this model",
            "None on record. Base the explanation on the model structure below, and do "
            "not invent citations, organisms or experimental conclusions.",
        ]

    if bngl:
        blocks += [
            "",
            "## Rule-based definition of the model",
            bngl.strip(),
        ]

    blocks += [
        "",
        "## Model structure extracted from the model's VCML",
        model_section,
    ]

    return "\n".join(blocks)


def compute_input_hash(summary_input: str) -> str:
    """Hash the assembled prompt so unchanged models can be skipped on a re-run."""
    return hashlib.sha256(summary_input.encode("utf-8")).hexdigest()


async def collect_summary_inputs(bm_key: str) -> dict:
    """
    Gather everything needed to generate one summary.

    Args:
        bm_key (str): Biomodel key.

    Returns:
        dict: `biomodel`, `summary_input`, `input_hash`, `used_bngl`, `pub_keys`.

    Raises:
        ValueError: If the biomodel is not in the catalogue.
    """
    result = await fetch_biomodels(BiomodelRequestParams(bmId=str(bm_key), maxRows=1))
    models = result.get("data") or []
    if not models:
        raise ValueError(f"Biomodel {bm_key} not found")
    biomodel = models[0]

    vcml = await get_vcml_file(str(bm_key))

    # Non-rule-based models return "" here, which is the signal to skip the block.
    try:
        bngl = await get_bngl_file(str(bm_key))
    except Exception as e:
        logger.warning(f"BNGL unavailable for {bm_key}: {str(e)}")
        bngl = ""

    publications = get_publication_rows_for_biomodel(str(bm_key))
    model_section = extract_model_section(vcml)
    summary_input = build_summary_input(biomodel, model_section, bngl, publications)

    return {
        "biomodel": biomodel,
        "summary_input": summary_input,
        "input_hash": compute_input_hash(summary_input),
        "used_bngl": bool(bngl),
        "pub_keys": [row["pub_key"] for row in publications],
    }


@observe(name="GENERATE_BIOMODEL_SUMMARY")
async def generate_summary(
    bm_key: str,
    virtual_key: str,
    model: str,
    inputs: Optional[dict] = None,
) -> dict:
    """
    Generate one biomodel summary and return the row to store.

    Args:
        bm_key (str): Biomodel key.
        virtual_key (str): LiteLLM key to bill the call to.
        model (str): LiteLLM model alias.
        inputs (Optional[dict]): Pre-collected inputs from collect_summary_inputs,
            so a caller that already assembled them (to compute a skip hash, say)
            doesn't refetch the VCML.

    Returns:
        dict: A `biomodel_summaries` row with status 'ok'.
    """
    # Imported here rather than at module scope: this is the budget-aware
    # chokepoint every LLM call goes through, but pulling it in drags the whole
    # tool/knowledge-base stack along, and the read path below doesn't need it.
    from app.services.llms_service import _create_chat_completion

    skill_prompt, skill_hash = load_skill_prompt()
    if inputs is None:
        inputs = await collect_summary_inputs(bm_key)
    biomodel = inputs["biomodel"]

    completion = await _create_chat_completion(
        virtual_key,
        model,
        messages=[
            {"role": "system", "content": skill_prompt},
            {"role": "user", "content": inputs["summary_input"]},
        ],
    )
    summary_md = (completion.choices[0].message.content or "").strip()
    if not summary_md:
        raise ValueError("LLM returned an empty summary")

    return {
        "bm_key": int(bm_key),
        "model_name": biomodel.get("name"),
        "owner_name": biomodel.get("ownerName"),
        "summary_md": summary_md,
        "status": "ok",
        "error": None,
        "input_hash": inputs["input_hash"],
        "skill_hash": skill_hash,
        "llm_model": completion.model,
        "used_bngl": inputs["used_bngl"],
        "pub_keys": inputs["pub_keys"],
    }


def upsert_summary(row: dict) -> None:
    """
    Write a summary row, replacing any existing row for the same biomodel.

    Args:
        row (dict): A `biomodel_summaries` row.
    """
    supabase = get_supabase_client()
    supabase.table("biomodel_summaries").upsert(row, on_conflict="bm_key").execute()


def get_stored_summary(bm_key: str) -> Optional[dict]:
    """
    Read a stored summary.

    Args:
        bm_key (str): Biomodel key.

    Returns:
        Optional[dict]: The row, or None when nothing is stored for this biomodel.
    """
    supabase = get_supabase_client()
    response = (
        supabase.table("biomodel_summaries")
        .select("*")
        .eq("bm_key", int(bm_key))
        .limit(1)
        .execute()
    )
    return response.data[0] if response.data else None


def get_existing_hashes() -> dict:
    """
    Read the hashes of every stored summary, for skip decisions in a batch run.

    Returns:
        dict: bm_key -> {input_hash, skill_hash, status}.
    """
    supabase = get_supabase_client()
    rows: dict = {}
    page_size = 1000
    offset = 0

    while True:
        response = (
            supabase.table("biomodel_summaries")
            .select("bm_key, input_hash, skill_hash, status")
            .range(offset, offset + page_size - 1)
            .execute()
        )
        batch = response.data or []
        for row in batch:
            rows[str(row["bm_key"])] = row
        if len(batch) < page_size:
            break
        offset += page_size

    return rows
