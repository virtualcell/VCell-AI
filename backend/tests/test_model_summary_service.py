import pytest

from app.services.model_summary_service import (
    build_summary_input,
    extract_model_section,
    strip_provenance,
)
from app.services.publications_service import (
    clean_publication,
    extract_biomodel_links,
    _normalize_authors,
    _parse_pubmed_abstracts,
)


class TestModelSectionExtraction:
    """The VCML pruning that keeps prompts affordable."""

    def test_keeps_model_drops_generated_math(self):
        vcml = (
            "<BioModel>"
            "<Model Name='m'><Species Name='Ca'/><Annotation>curator note</Annotation></Model>"
            "<MathDescription Name='x'>lots of generated math</MathDescription>"
            "<Geometry Name='g'>mesh</Geometry>"
            "</BioModel>"
        )
        result = extract_model_section(vcml)

        assert "<Species Name='Ca'/>" in result
        assert "curator note" in result
        assert "generated math" not in result
        assert "mesh" not in result

    def test_closing_tag_is_matched_exactly(self):
        """</ModelUnitSystem> must not be mistaken for the end of <Model>."""
        vcml = (
            "<BioModel><Model Name='m'>"
            "<ModelUnitSystem>units</ModelUnitSystem>"
            "<Species Name='Ca'/>"
            "</Model></BioModel>"
        )
        result = extract_model_section(vcml)

        assert "units" in result
        assert "<Species Name='Ca'/>" in result

    def test_falls_back_when_no_model_element(self):
        vcml = "<BioModel><MathDescription>math</MathDescription><Other>keep</Other></BioModel>"
        result = extract_model_section(vcml)

        assert "keep" in result
        assert "math" not in result

    def test_truncates_oversized_structure(self):
        vcml = "<Model Name='m'>" + ("<Species/>" * 20000) + "</Model>"
        result = extract_model_section(vcml)

        assert len(result) < len(vcml)
        assert "truncated" in result


class TestProvenanceStripping:
    def test_removes_cloned_from_lines_only(self):
        annot = (
            "cloned from 'X' owned by user a\n"
            "cloned from 'Y' owned by user b\n"
            "Application of Oxo-M is from t=100-130 s."
        )
        assert strip_provenance(annot) == "Application of Oxo-M is from t=100-130 s."

    def test_handles_missing_annotation(self):
        assert strip_provenance(None) == ""
        assert strip_provenance("cloned from 'X' owned by user a") == ""


class TestSummaryInput:
    def test_states_absence_of_publications_explicitly(self):
        """~1000 models have no publication; the prompt must not invite invention."""
        prompt = build_summary_input({"name": "M", "ownerName": "o"}, "<Model/>", "", [])

        assert "None on record" in prompt
        assert "do not invent" in prompt

    def test_includes_publication_abstract_and_bngl(self):
        prompt = build_summary_input(
            {"name": "M", "ownerName": "o", "applications": [{"name": "App0"}]},
            "<Model/>",
            "begin molecule types",
            [{"title": "T", "authors": "A", "abstract": "the abstract"}],

        )

        assert "App0" in prompt
        assert "the abstract" in prompt
        assert "begin molecule types" in prompt


class TestPublicationCleaning:
    """The v1 feed's rough edges, all observed in the live payload."""

    def test_trims_doi_and_drops_placeholder_pubmed_id(self):
        row = clean_publication(
            {
                "pubKey": 1,
                "title": "T",
                "doi": " 10.1038/s42003-026-10079-1",
                "pubmedid": "0",
                "year": 2026,
                "date": "2026-02-03T00:00:00.000-05:00",
            }
        )

        assert row["doi"] == "10.1038/s42003-026-10079-1"
        assert row["pubmedid"] is None
        assert row["pub_date"] == "2026-02-03"

    def test_rejoins_comma_split_authors(self):
        authors = ["Bener", " M. B.", " Slepchenko", " B. M.", " & Inaba", " M."]
        assert _normalize_authors(authors) == "Bener, M. B., Slepchenko, B. M., & Inaba, M."

    def test_reads_v1_reference_field_name(self):
        links = extract_biomodel_links(
            {"pubKey": 7, "biomodelRefs": [{"bmKey": 42, "name": "M", "ownerKey": 1}]}
        )

        assert links == [
            {
                "bm_key": 42,
                "pub_key": 7,
                "model_name": "M",
                "owner_name": None,
                "owner_key": 1,
                "version_flag": None,
            }
        ]

    def test_ignores_record_without_key_or_title(self):
        assert clean_publication({"title": "no key"}) is None
        assert clean_publication({"pubKey": 1}) is None


class TestPubmedParsing:
    def test_splits_batched_response_by_pmid(self):
        text = (
            "1. PLoS One. 2021.\n\nFirst title.\n\nFirst abstract body.\n\n"
            "DOI: 10.1/x\nPMID: 33735291\n\n"
            "2. Biophys J. 2020.\n\nSecond title.\n\nSecond abstract body.\n\n"
            "PMID: 32255775\n"
        )
        abstracts = _parse_pubmed_abstracts(text)

        assert set(abstracts) == {"33735291", "32255775"}
        assert "First abstract body." in abstracts["33735291"]
        assert "PMID:" not in abstracts["33735291"]
        assert "Second abstract body." in abstracts["32255775"]

    def test_returns_nothing_for_an_error_body(self):
        assert _parse_pubmed_abstracts("ID list is empty!") == {}
