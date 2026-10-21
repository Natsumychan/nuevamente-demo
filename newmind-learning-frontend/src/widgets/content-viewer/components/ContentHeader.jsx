
import { Badge } from "@/shared/ui/Badge";
import { ScoreRing } from "@/shared/ui/Alert";

const APPROVAL_THRESHOLD = 0.8;

const FORMAT_LABELS = {
  Flashcards: "Tarjetas de estudio",
  Tutorial: "Tutorial paso a paso",
  Quiz: "Cuestionario",
  "Resumen Ejecutivo": "Resumen ejecutivo",
  Guion: "Guion de clase o video",
};

const PROFILE_LABELS = {
  Principiante: "Principiante",
  Junior: "Desarrollador junior / semisenior",
  Senior: "Desarrollador senior",
  Lider: "Líder técnico / arquitecto",
  Gestor: "Gestor / ejecutivo",
};

const INDUSTRY_LABELS = {
  General: "General",
  Fintech: "Fintech",
  Salud: "Salud",
  "E-commerce": "Comercio electrónico",
};

function getValidScore(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const score = Number(value);

  return Number.isFinite(score) && score >= 0 && score <= 1
    ? score
    : null;
}

function getEvaluationMessage(evaluation, score) {
  if (score !== null) {
    if (score < APPROVAL_THRESHOLD) {
      return {
        title:
          "El indicador de similitud no alcanzó el umbral de referencia del 80 %.",
        description:
          "Revisa el resultado y contrasta la información importante con el documento original antes de utilizarla.",
        tone: "warning",
      };
    }

    return {
      title:
        "El indicador de similitud alcanzó el umbral de referencia del 80 %.",
      description:
        "El resultado alcanzó el umbral establecido para este indicador. Aun así, verifica la información importante con el documento original.",
      tone: "success",
    };
  }

  if (typeof evaluation?.approved === "boolean") {
    return {
      title: evaluation.approved
        ? "La evaluación registrada indica que se alcanzó el umbral de referencia."
        : "La evaluación registrada indica que no se alcanzó el umbral de referencia.",
      description:
        "Contrasta la información importante con el documento original. No hay un valor numérico válido disponible para mostrar el indicador.",
      tone: evaluation.approved ? "success" : "warning",
    };
  }

  return {
    title: "El indicador de similitud no está disponible.",
    description:
      "Puedes consultar el contenido generado, pero verifica la información importante con el documento original.",
    tone: "neutral",
  };
}

const TONE_CLASSES = {
  warning: {
    container: "border-amber-800/70 bg-amber-950/30",
    title: "text-amber-300",
  },
  success: {
    container: "border-emerald-800/70 bg-emerald-950/30",
    title: "text-emerald-300",
  },
  neutral: {
    container: "border-slate-700 bg-slate-900/50",
    title: "text-slate-200",
  },
};

export function ContentHeader({
  adaptation,
  FormatIcon,
  evaluation,
}) {
  const formatLabel =
    FORMAT_LABELS[adaptation?.format] ??
    adaptation?.format ??
    "Contenido educativo";

  const profileLabel =
    PROFILE_LABELS[adaptation?.profile] ?? adaptation?.profile;

  const industryLabel =
    INDUSTRY_LABELS[adaptation?.industry] ?? adaptation?.industry;

  const score = getValidScore(evaluation?.score);

  const evaluationMessage = evaluation
    ? getEvaluationMessage(evaluation, score)
    : null;

  const tone = evaluationMessage
    ? TONE_CLASSES[evaluationMessage.tone]
    : null;

  return (
    <section
      className="flex flex-col gap-5 rounded-xl border border-slate-700/50 bg-slate-800/60 p-5 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Información del contenido generado"
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500">
          {FormatIcon && (
            <FormatIcon
              className="h-5 w-5 text-white"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold text-slate-100">
            {formatLabel}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Documento:{" "}
            {adaptation?.documentTitle || "Documento cargado"}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {profileLabel && (
              <Badge variant="brand" size="sm">
                Perfil: {profileLabel}
              </Badge>
            )}

            {industryLabel && (
              <Badge variant="default" size="sm">
                Área: {industryLabel}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {evaluation && (
        <div className="flex min-w-0 items-center gap-4 border-t border-slate-700/60 pt-4 sm:max-w-md sm:border-l sm:border-t-0 sm:pt-0 sm:pl-5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-200">
              Evaluación automática
            </p>

            {evaluationMessage && (
              <div
                className={`mt-2 rounded-lg border p-3 ${tone.container}`}
                role="status"
              >
                <p className={`text-sm font-medium ${tone.title}`}>
                  {evaluationMessage.title}
                </p>

                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {evaluationMessage.description}
                </p>
              </div>
            )}

            {score !== null && (
              <p className="mt-2 text-xs text-slate-500">
                Indicador de similitud de la recuperación de información.
              </p>
            )}
          </div>

          {score !== null && (
            <div
              className="shrink-0"
              aria-label={`Similitud de la recuperación: ${Math.round(score * 100)} %`}
            >
              <ScoreRing score={score} size={64} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
