
import { Card } from "@/shared/ui/Card";

const APPROVAL_THRESHOLD = 0.8;

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

function getIndicatorMessage(score, approved) {
  if (score !== null && score < APPROVAL_THRESHOLD) {
    return {
      title:
        "El indicador de similitud no alcanzó el umbral de referencia del 80 %.",
      description:
        "Revisa el resultado y contrasta la información importante con el documento original antes de utilizarla.",
      tone: "warning",
    };
  }

  if (score !== null) {
    return {
      title:
        "El indicador de similitud alcanzó el umbral de referencia del 80 %.",
      description:
        "El resultado alcanzó el umbral establecido para este indicador. Aun así, verifica la información importante con el documento original.",
      tone: "success",
    };
  }

  if (typeof approved === "boolean") {
    return {
      title: approved
        ? "La evaluación registrada indica que se alcanzó el umbral de referencia."
        : "La evaluación registrada indica que no se alcanzó el umbral de referencia.",
      description:
        "No hay un valor numérico válido disponible para mostrar el indicador. Contrasta la información importante con el documento original.",
      tone: approved ? "success" : "warning",
    };
  }

  return {
    title: "El indicador de similitud no está disponible.",
    description:
      "No se recibió un valor numérico válido. Verifica la información importante con el documento original.",
    tone: "neutral",
  };
}

const TONE_CLASSES = {
  warning: {
    container: "border-amber-800/70 bg-amber-950/30",
    title: "text-amber-300",
    bar: "bg-amber-500",
  },
  success: {
    container: "border-emerald-800/70 bg-emerald-950/30",
    title: "text-emerald-300",
    bar: "bg-emerald-500",
  },
  neutral: {
    container: "border-slate-700 bg-slate-900/50",
    title: "text-slate-200",
    bar: "bg-slate-500",
  },
};

export function EvaluationBreakdown({ evaluation }) {
  if (!evaluation) return null;

  const score = getValidScore(evaluation.score);
  const percentage =
    score !== null ? Math.round(score * 100) : null;

  const message = getIndicatorMessage(
    score,
    evaluation.approved
  );

  const tone = TONE_CLASSES[message.tone];

  return (
    <Card>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-100">
          Evaluación automática
        </h2>

        <p className="mt-1 text-sm leading-relaxed text-slate-400">
          Este indicador representa la similitud calculada para los
          fragmentos recuperados durante la búsqueda de información.
          No mide por sí solo la exactitud ni la calidad total del
          contenido generado.
        </p>
      </div>

      <div
        className={`rounded-lg border p-4 ${tone.container}`}
        role="status"
      >
        <p className={`text-sm font-semibold ${tone.title}`}>
          {message.title}
        </p>

        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {message.description}
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-slate-200">
            Similitud de la recuperación (RAG)
          </h3>

          <span className="text-xl font-bold tabular-nums text-slate-100">
            {percentage !== null ? `${percentage}%` : "No disponible"}
          </span>
        </div>

        {percentage !== null && (
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
            aria-label="Similitud de la recuperación"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
          >
            <div
              className={`h-full rounded-full transition-all ${tone.bar}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>Umbral de referencia: 80 %</span>
          <span>
            {percentage !== null
              ? percentage < 80
                ? "Por debajo del umbral"
                : "Umbral alcanzado"
              : "Sin datos suficientes"}
          </span>
        </div>
      </div>

      {Array.isArray(evaluation.issues) &&
        evaluation.issues.length > 0 && (
          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <h3 className="text-sm font-medium text-slate-200">
              Observaciones
            </h3>

            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-400">
              {evaluation.issues.map((issue, index) => (
                <li key={`${index}-${issue}`}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Este indicador es orientativo y no garantiza que la información
        generada sea correcta o completa. Contrasta los datos importantes
        con el documento original antes de utilizarlos.
      </p>
    </Card>
  );
}
