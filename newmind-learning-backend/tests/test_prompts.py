"""Deterministic instruction contracts, not generated-content quality evidence."""

from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from api.mappers import to_domain_request
from api.schemas import AdaptationCreateRequest
from application.repositories import DocumentRecord
from llm.prompts import construir_prompt_sistema
from models.schemas import FormatoSalida, NivelDetalle, PerfilDestinatario


PROFILES = [
    ("Principiante", PerfilDestinatario.PRINCIPIANTE),
    ("Junior", PerfilDestinatario.JUNIOR_MID),
    ("Senior", PerfilDestinatario.JUNIOR_MID),
    ("Lider", PerfilDestinatario.ARQUITECTO),
    ("Gestor", PerfilDestinatario.EJECUTIVO),
]

# Independent expectations: never derive these from the production templates.
PROFILE_AIMS = {
    PerfilDestinatario.PRINCIPIANTE: (
        ("identificar conceptos", "explicar su función"),
        ("Recordar", "Comprender"),
        "identificación correcta y explicación con una analogía",
    ),
    PerfilDestinatario.JUNIOR_MID: (
        ("aplicar procedimientos", "analizar casos"),
        ("Aplicar", "Analizar"),
        "procedimiento verificable o análisis de un caso",
    ),
    PerfilDestinatario.ARQUITECTO: (
        ("comparar alternativas", "justificar una elección"),
        ("Analizar", "Evaluar"),
        "comparación de ventajas y límites con una justificación",
    ),
    PerfilDestinatario.EJECUTIVO: (
        ("explicar el impacto", "justificar decisiones"),
        ("Comprender", "Evaluar"),
        "impacto explicado y decisión justificada",
    ),
}

FORMATS = [
    ("Flashcards", FormatoSalida.FLASHCARDS, "Salud", "Basico", NivelDetalle.DIDACTICO,
     ("frente", "dorso", "pista_didactica"), ("Recordar", "Comprender"), "evocar o explicar"),
    ("Tutorial", FormatoSalida.TUTORIAL, "Fintech", "Intermedio", NivelDetalle.TECNICO,
     ("paso", "titulo_paso", "descripcion", "comando_o_codigo", "verificacion"),
     ("Aplicar",), "ejecutar pasos y comprobar resultados"),
    ("Quiz", FormatoSalida.QUIZ, "E-commerce", "Didactico", NivelDetalle.DIDACTICO,
     ("pregunta", "opciones", "respuesta_correcta", "justificacion_didactica", "pista_didactica"),
     ("Recordar", "Aplicar", "Analizar"), "seleccionar una respuesta y justificarla"),
    ("Resumen Ejecutivo", FormatoSalida.RESUMEN, "General", "Detallado", NivelDetalle.TECNICO,
     ("concepto", "impacto", "recomendacion"), ("Comprender", "Evaluar"),
     "explicar relevancia y fundamentar recomendaciones"),
    ("Guion", FormatoSalida.GUION, "Salud", "Intermedio", NivelDetalle.TECNICO,
     ("bloque", "narrativa", "recurso_visual"), ("Comprender", "Aplicar"),
     "explicar o demostrar con una secuencia y un recurso visual"),
]


@pytest.fixture
def document():
    return DocumentRecord(
        id=55,
        title="Network segmentation",
        filename="networks.txt",
        type="txt",
        size=64,
        content="Private subnets separate internal traffic from public traffic.",
        created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
        storage_object_id="networks.txt",
    )


def domain_request(document, profile, output_format="Flashcards", industry="Salud", detail="Basico"):
    payload = AdaptationCreateRequest.model_validate({
        "documentId": document.id,
        "profile": profile,
        "format": output_format,
        "industry": industry,
        "detailLevel": detail,
    })
    return to_domain_request(payload, document)


def system_prompt(request):
    return construir_prompt_sistema(
        perfil=request.perfil_destinatario.value,
        formato=request.formato_salida.value,
        nicho=request.nicho_sector.value,
        nivel_detalle=request.nivel_detalle.value,
    )


@pytest.mark.parametrize("api_profile,expected_domain", PROFILES)
def test_api_profiles_map_to_expected_domain(document, api_profile, expected_domain):
    request = domain_request(document, api_profile)

    assert request.perfil_destinatario == expected_domain
    assert request.documento_titulo == document.title
    assert request.documento_contenido == document.content
    assert request.formato_salida == FormatoSalida.FLASHCARDS
    assert request.nicho_sector.value == "Salud"
    assert request.nivel_detalle == NivelDetalle.DIDACTICO


def test_junior_senior_share_domain_prompt(document):
    junior = domain_request(document, "Junior", "Tutorial", "Fintech", "Detallado")
    senior = domain_request(document, "Senior", "Tutorial", "Fintech", "Detallado")

    assert junior == senior
    assert system_prompt(junior) == system_prompt(senior)
    assert "aplicar procedimientos" in system_prompt(junior)
    assert "analizar casos" in system_prompt(senior)

    # API rejection must not change the builder's existing internal fallback.
    fallback = construir_prompt_sistema("unknown", "unknown", "Salud", "Didactico")
    assert fallback == system_prompt(domain_request(document, "Principiante"))


@pytest.mark.parametrize("api_profile,expected_domain", PROFILES)
@pytest.mark.parametrize(
    "api_format,domain_format,industry,detail,domain_detail,fields,processes,evidence", FORMATS,
)
def test_profile_format_matrix_preserves_prompt_contract(
    document, api_profile, expected_domain, api_format, domain_format,
    industry, detail, domain_detail, fields, processes, evidence,
):
    request = domain_request(document, api_profile, api_format, industry, detail)
    prompt = system_prompt(request)

    assert request.perfil_destinatario == expected_domain
    assert request.formato_salida == domain_format
    assert request.nivel_detalle == domain_detail
    assert request.documento_contenido == document.content
    assert f"sector: {industry}." in prompt
    assert f"Nivel solicitado: {domain_detail.value}." in prompt
    assert "ÚNICAMENTE como un objeto JSON estructurado válido" in prompt
    assert "Basa TODAS las explicaciones en el contexto técnico proporcionado" in prompt
    assert "sin inventar datos" in prompt
    for field in fields:
        assert f"'{field}':" in prompt
    if api_format == "Quiz":
        assert "Lista de 4 alternativas (A, B, C, D)" in prompt
    if api_format == "Tutorial":
        assert "(si aplica)" in prompt

    # Inspect the actual format section, not process names elsewhere in the prompt.
    format_section = prompt.split("2. FORMATO PEDAGÓGICO REQUERIDO:")[1].split(
        "3. CONTEXTO DE APLICACIÓN / NICHO:"
    )[0]
    assert evidence in format_section
    for process in processes:
        assert process in format_section
    assert "Selecciona solo los procesos de Bloom pertinentes a la actividad" in prompt
    assert "respaldados por la fuente y compatibles con el formato" in prompt
    assert "No asignes niveles de Bloom por seniority" in prompt
    assert "No exijas Evaluar en cada flashcard de recuerdo" in prompt
    assert "Haz explícito el objetivo en la introducción contextualizada" in prompt
    assert "sin añadir campos al JSON" in prompt
    if api_profile == "Gestor":
        assert "No inventes cifras de ROI" in prompt


@pytest.mark.parametrize("api_profile,expected_domain", PROFILES[:2] + PROFILES[3:])
def test_bloom_objectives_use_observable_verbs(document, api_profile, expected_domain):
    prompt = system_prompt(domain_request(document, api_profile))
    profile_section = prompt.split("1. PERFIL DE LA AUDIENCIA:")[1].split(
        "2. FORMATO PEDAGÓGICO REQUERIDO:"
    )[0]
    verbs, processes, evidence = PROFILE_AIMS[expected_domain]

    assert "Objetivo observable orientativo:" in profile_section
    assert "Procesos de Bloom orientativos:" in profile_section
    assert "Evidencia esperada:" in profile_section
    for verb in verbs:
        assert verb in profile_section
    for process in processes:
        assert process in profile_section
    assert evidence in profile_section
    assert "conocer" not in profile_section.lower()


def test_unknown_api_profile_is_rejected(document):
    with pytest.raises(ValidationError) as error:
        domain_request(document, "Experto")

    assert any(
        entry["loc"] == ("profile",) and entry["type"] == "enum"
        for entry in error.value.errors()
    )
