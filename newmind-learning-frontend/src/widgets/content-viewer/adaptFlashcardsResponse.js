
const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isCanonicalCard = (item) =>
  item !== null &&
  typeof item === "object" &&
  isNonEmptyString(item.frente) &&
  isNonEmptyString(item.dorso);

/**
 * Convierte la respuesta del backend en el modelo
 * que necesita la vista de Flashcards.
 *
 * @param {import('@/shared/types').Adaptation} adaptation
 */
export function adaptFlashcardsResponse(adaptation) {
  const officialResponse = adaptation?.officialResponse;
  const content = officialResponse?.contenido_adaptado;
  const items = content?.items;

  if (!Array.isArray(items) || !items.every(isCanonicalCard)) {
    return { status: "invalid" };
  }

  const metadata = officialResponse?.metadatos;
  const quality = officialResponse?.evaluacion_calidad;
  const storage = officialResponse?.almacenamiento_oci;

  const normalizedItems = items.map((item) => ({
    ...item,
    pista_didactica: isNonEmptyString(item.pista_didactica)
      ? item.pista_didactica
      : "",
  }));

  const viewModel = {
    title: content.titulo ?? "Flashcards",
    introduction: content.introduccion_contextualizada ?? "",
    profile: adaptation?.profile ?? metadata?.perfil_aplicado ?? "",
    studyTime: metadata?.tiempo_estimado_estudio_minutos ?? 0,
    keyConcepts: Array.isArray(metadata?.conceptos_clave)
      ? metadata.conceptos_clave
      : [],
    qualityScore: quality?.anclaje_fuente_score ?? 0,
    remarks: quality?.observaciones ?? "",
    bucket: storage?.bucket ?? "",
    objectId: storage?.objeto_id ?? "",
    items: normalizedItems,
  };

  return {
    status: items.length === 0 ? "empty" : "ready",
    viewModel,
  };
}
