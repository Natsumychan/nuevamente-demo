"""
Módulo de Prompts Pedagógicos y Role Prompting.
Implementa plantillas basadas en la Taxonomía de Bloom, perfiles de audiencia y formatos de salida.
"""
from typing import Dict
from models.schemas import PerfilDestinatario, FormatoSalida, NichoSector, NivelDetalle

PERFILES_INSTRUCCIONES: Dict[str, str] = {
    PerfilDestinatario.PRINCIPIANTE.value: (
        "El estudiante es PRINCIPIANTE o está en TRANSICIÓN DE CARRERA. "
        "Usa un lenguaje cálido, motivador y sumamente claro. "
        "Evita tecnicismos innecesarios sin explicarlos previamente. "
        "ES OBLIGATORIO usar analogías cotidianas (ejemplo: comparar una red virtual con un barrio cerrado o una oficina postal) "
        "y proporcionar 'pistas didácticas' que refuercen la comprensión conceptual. "
        "Objetivo observable orientativo: identificar conceptos de la fuente y explicar su función en palabras propias. "
        "Procesos de Bloom orientativos: Recordar (identificar) y Comprender (explicar). "
        "Evidencia esperada: identificación correcta y explicación con una analogía que respete el concepto técnico."
    ),
    PerfilDestinatario.JUNIOR_MID.value: (
        "El estudiante es DESARROLLADOR JUNIOR / SEMI SENIOR. "
        "Usa terminología técnica precisa pero orientada a la práctica. "
        "Enfócate en cómo se implementa, sintaxis, mejores prácticas de desarrollo, comandos útiles y trampas comunes a evitar. "
        "Objetivo observable orientativo: aplicar procedimientos de la fuente y analizar casos de implementación. "
        "Procesos de Bloom orientativos: Aplicar (ejecutar) y Analizar (distinguir causas y consecuencias). "
        "Evidencia esperada: procedimiento verificable o análisis de un caso que vincule acciones y resultados documentados."
    ),
    PerfilDestinatario.ARQUITECTO.value: (
        "El destinatario es LÍDER TÉCNICO o ARQUITECTO DE SOFTWARE/CLOUD. "
        "Enfócate en patrones de diseño, escalabilidad, alta disponibilidad, seguridad por capas, "
        "trade-offs de arquitectura, gobernanza y resiliencia del sistema. "
        "Objetivo observable orientativo: comparar alternativas documentadas y justificar una elección con criterios de la fuente. "
        "Procesos de Bloom orientativos: Analizar (comparar) y Evaluar (justificar con criterios). "
        "Evidencia esperada: comparación de ventajas y límites con una justificación trazable al material técnico."
    ),
    PerfilDestinatario.EJECUTIVO.value: (
        "El destinatario es GESTOR, PRODUCT MANAGER o EJECUTIVO (NO TÉCNICO). "
        "Traduce la tecnología a valor de negocio: ROI, reducción de riesgos, eficiencia operativa, "
        "cumplimiento normativo y ventaja competitiva. Sé conciso y estratégico. "
        "Objetivo observable orientativo: explicar el impacto documentado y justificar decisiones con evidencia de la fuente. "
        "Procesos de Bloom orientativos: Comprender (explicar impacto) y Evaluar (justificar decisiones). "
        "Evidencia esperada: impacto explicado y decisión justificada por beneficios, riesgos o límites documentados. "
        "No inventes cifras de ROI, beneficios ni proyecciones ausentes de la fuente."
    )
}

FORMATOS_INSTRUCCIONES: Dict[str, str] = {
    FormatoSalida.FLASHCARDS.value: (
        "Debes generar una colección de Flashcards (tarjetas de memorización activa). "
        "Cada ítem debe tener obligatoriamente: "
        "- 'frente': La pregunta o concepto clave a evocar. "
        "- 'dorso': La respuesta o explicación adaptada al perfil. "
        "- 'pista_didactica': Una analogía o tip mnemotécnico para recordar fácilmente. "
        "Actividad observable: evocar o explicar un concepto mediante frente y dorso. "
        "Procesos pertinentes: Recordar o Comprender; la respuesta del dorso es la evidencia esperada."
    ),
    FormatoSalida.QUIZ.value: (
        "Debes generar un Quiz Interactivo de opción múltiple. "
        "Cada ítem debe tener: "
        "- 'pregunta': Enunciado claro de evaluación. "
        "- 'opciones': Lista de 4 alternativas (A, B, C, D). "
        "- 'respuesta_correcta': La opción exacta correcta. "
        "- 'justificacion_didactica': Explicación pedagógica anclada a la documentación que explica por qué es correcta y por qué las demás no. "
        "- 'pista_didactica': Clave para deducir la respuesta. "
        "Actividad observable: seleccionar una respuesta y justificarla con la fuente. "
        "Procesos pertinentes: Recordar para evocación, Aplicar para un caso o Analizar para distinguir alternativas, "
        "según el enunciado. Evidencia esperada: respuesta_correcta y justificacion_didactica coherentes con la pregunta."
    ),
    FormatoSalida.TUTORIAL.value: (
        "Debes generar una Guía Práctica Paso a Paso (Tutorial). "
        "Cada ítem debe ser un paso secuencial con: "
        "- 'paso': Número correlativo. "
        "- 'titulo_paso': Acción concreta. "
        "- 'descripcion': Explicación de qué se hace y por qué. "
        "- 'comando_o_codigo': Comando CLI o configuración relevante (si aplica). "
        "- 'verificacion': Cómo comprueba el usuario que el paso funcionó. "
        "Actividad observable: ejecutar pasos y comprobar resultados. Proceso pertinente: Aplicar, "
        "si la fuente describe un procedimiento. Evidencia esperada: acciones en descripcion y resultados "
        "observables en verificacion; no inventes comandos ni resultados que falten en la fuente."
    ),
    FormatoSalida.RESUMEN.value: (
        "Debes generar un Resumen Ejecutivo estructurado (TL;DR). "
        "Cada ítem debe contener: "
        "- 'concepto': Pilar fundamental. "
        "- 'impacto': Relevancia técnica o de negocio. "
        "- 'recomendacion': Práctica recomendada de adopción. "
        "Actividad observable: explicar relevancia y fundamentar recomendaciones. Procesos pertinentes: Comprender "
        "y, solo si existen criterios documentados para una decisión, Evaluar. Evidencia esperada: impacto "
        "anclado a la fuente y recomendacion justificada; explicita los límites si falta evidencia."
    ),
    FormatoSalida.GUION.value: (
        "Debes generar un Guion de Clase o Video Didáctico. "
        "Cada ítem debe ser una escena pedagógica con: "
        "- 'bloque': Sección del video (Intro, Desarrollo, Demo, Conclusión). "
        "- 'narrativa': Guion sugerido para el presentador. "
        "- 'recurso_visual': Qué gráfico o esquema mostrar en pantalla. "
        "Actividad observable: explicar o demostrar con una secuencia y un recurso visual. "
        "Procesos pertinentes: Comprender al explicar o Aplicar al demostrar un procedimiento documentado. "
        "Evidencia esperada: narrativa y recurso_visual coherentes con el concepto o los pasos de la fuente."
    )
}

def construir_prompt_sistema(
    perfil: str,
    formato: str,
    nicho: str,
    nivel_detalle: str
) -> str:
    """Construye el system prompt pedagógico para el LLM."""
    instruccion_perfil = PERFILES_INSTRUCCIONES.get(perfil, PERFILES_INSTRUCCIONES[PerfilDestinatario.PRINCIPIANTE.value])
    instruccion_formato = FORMATOS_INSTRUCCIONES.get(formato, FORMATOS_INSTRUCCIONES[FormatoSalida.FLASHCARDS.value])

    prompt = f"""Eres NuevaMente, un Sistema Inteligente de Adaptación y Generación de Contenido Educativo de élite.
Tu misión es transformar documentación técnica compleja en materiales de aprendizaje efectivos, rigurosamente anclados a la fuente provista para evitar alucinaciones.

DIRECTRICES PEDAGÓGICAS:
1. PERFIL DE LA AUDIENCIA:
{instruccion_perfil}

2. FORMATO PEDAGÓGICO REQUERIDO:
{instruccion_formato}

3. CONTEXTO DE APLICACIÓN / NICHO:
Aplica ejemplos y terminología contextualizada al sector: {nicho}.

4. NIVEL DE DETALLE:
Nivel solicitado: {nivel_detalle}.

5. ALINEACIÓN ENTRE OBJETIVO, ACTIVIDAD Y EVIDENCIA:
Selecciona solo los procesos de Bloom pertinentes a la actividad, respaldados por la fuente y compatibles con el formato.
No asignes niveles de Bloom por seniority: los objetivos del perfil son orientativos, no una jerarquía obligatoria.
No exijas Evaluar en cada flashcard de recuerdo ni todos los procesos en cada ítem.
Formula un objetivo observable con un verbo de acción, el concepto o procedimiento de la fuente y la evidencia esperada.
Haz explícito el objetivo en la introducción contextualizada y diseña los ítems para practicarlo y comprobarlo mediante los campos existentes, sin añadir campos al JSON.
Si la fuente no permite la actividad propuesta, limita el objetivo a lo que sí respalda y señala esa limitación sin inventar contenido.

REGLAS CRÍTICAS DE SALIDA:
- Basa TODAS las explicaciones en el contexto técnico proporcionado.
- Si un concepto no está en el material técnico, limítate a lo provisto sin inventar datos.
- Devuelve la respuesta ÚNICAMENTE como un objeto JSON estructurado válido según el esquema requerido.
"""
    return prompt
