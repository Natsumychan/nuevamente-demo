"""Validate reusable references and rubric annotations, not generated quality."""

import json
from pathlib import Path

import pytest

from api.schemas import FormatValue, ProfileValue
from models.schemas import ContenidoAdaptado, FlashcardItem, QuizItem, TutorialStepItem


SAMPLES_PATH = Path(__file__).parent / "fixtures/pedagogy/profile_samples.json"
DIMENSIONS = {"objective", "cognitive_process", "fidelity", "format"}


@pytest.fixture(scope="module")
def evidence_pack():
    assert SAMPLES_PATH.is_file(), "Reusable synthetic samples and rubric are missing"
    return json.loads(SAMPLES_PATH.read_text(encoding="utf-8"))


def rubric_accepts(scores, rubric):
    """Apply only the declared score gates; never infer scores from prose."""
    return (
        set(scores) == DIMENSIONS
        and all(type(score) is int and 1 <= score <= 2 for score in scores.values())
        and all(scores[dimension] == required for dimension, required in rubric["gates"].items())
        and sum(scores.values()) >= rubric["minimum_total"]
    )


def test_synthetic_pack_covers_api_profiles_and_formats(evidence_pack):
    positive = [sample for sample in evidence_pack["samples"] if sample["expected_pass"]]
    assert len(positive) == 5
    assert {sample["profile"] for sample in positive} == {profile.value for profile in ProfileValue}
    assert {sample["format"] for sample in positive} == {output.value for output in FormatValue}
    assert len(evidence_pack["samples"]) == 6
    assert evidence_pack["provenance"] == "authored_synthetic"
    assert evidence_pack["review_kind"] == "author_scored_reference"
    assert evidence_pack["generated_by_provider"] is False
    assert evidence_pack["source"]["id"] == "segmentation-policy"
    assert evidence_pack["source"]["text"]


def test_samples_preserve_existing_output_fields(evidence_pack):
    for sample in evidence_pack["samples"]:
        ProfileValue(sample["profile"])
        output_format = FormatValue(sample["format"])
        content = ContenidoAdaptado.model_validate(sample["content"])
        assert set(sample["content"]) == {"titulo", "introduccion_contextualizada", "items"}
        assert content.items
        for item in content.items:
            if output_format == FormatValue.FLASHCARDS:
                FlashcardItem.model_validate(item)
            elif output_format == FormatValue.TUTORIAL:
                TutorialStepItem.model_validate(item)
            elif output_format == FormatValue.QUIZ:
                QuizItem.model_validate(item)
                assert len(item["opciones"]) == 4
                assert item["respuesta_correcta"] in item["opciones"]
            else:
                fields = (
                    {"concepto", "impacto", "recomendacion"}
                    if output_format == FormatValue.EXECUTIVE_SUMMARY
                    else {"bloque", "narrativa", "recurso_visual"}
                )
                assert set(item) == fields
                assert all(isinstance(value, str) and value.strip() for value in item.values())


def test_declared_rubric_scores_have_traceable_annotations(evidence_pack):
    rubric = evidence_pack["rubric"]
    assert set(rubric["dimensions"]) == DIMENSIONS
    assert rubric["minimum_total"] == 7
    assert rubric["gates"] == {"fidelity": 2, "format": 2}
    for anchors in rubric["dimensions"].values():
        assert set(anchors) == {"0", "1", "2"}
        assert all(anchors.values())
    for sample in evidence_pack["samples"]:
        assert sample["source_id"] == evidence_pack["source"]["id"]
        assert sample["objective"] and sample["cognitive_process"]
        assert set(sample["rationale"]) == DIMENSIONS
        assert all(sample["rationale"].values())
        scores = sample["scores"]
        assert set(scores) == DIMENSIONS
        assert all(type(value) is int and 0 <= value <= 2 for value in scores.values())
        assert rubric_accepts(scores, rubric) is sample["expected_pass"]
        # The excerpts make annotations auditable; tests do not judge their meaning.
        assert sample["evidence_excerpt"] in json.dumps(sample["content"], ensure_ascii=False)


def test_valid_json_and_fidelity_do_not_pass_pedagogical_misalignment(evidence_pack):
    negative, = [sample for sample in evidence_pack["samples"] if not sample["expected_pass"]]
    assert negative["profile"] == "Principiante"
    FlashcardItem.model_validate(negative["content"]["items"][0])
    assert negative["scores"] == {"objective": 0, "cognitive_process": 0, "fidelity": 2, "format": 2}
    assert not rubric_accepts(negative["scores"], evidence_pack["rubric"])


@pytest.mark.parametrize("scores,accepted", [
    ({"objective": 1, "cognitive_process": 2, "fidelity": 2, "format": 2}, True),
    ({"objective": 1, "cognitive_process": 1, "fidelity": 2, "format": 2}, False),
    ({"objective": 2, "cognitive_process": 2, "fidelity": 1, "format": 2}, False),
    ({"objective": 2, "cognitive_process": 2, "fidelity": 2, "format": 1}, False),
    ({"objective": 0, "cognitive_process": 2, "fidelity": 2, "format": 2}, False),
])
def test_rubric_threshold_and_hard_gates(evidence_pack, scores, accepted):
    assert rubric_accepts(scores, evidence_pack["rubric"]) is accepted
