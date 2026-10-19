import { useState } from "react";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Cloud,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers3,
  GraduationCap,
} from "lucide-react";
import { FlashCard } from "../components/FlashCard";

export function FlashcardsView({ result }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (result.status === "invalid") {
    return (
      <div
        role="alert"
        className="mx-auto max-w-3xl px-4 py-16 text-center"
      >
        <div className="rounded-2xl border border-rose-900/60 bg-rose-950/30 p-8">
          <p className="text-lg font-semibold text-rose-300">
            No fue posible mostrar las tarjetas
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            La respuesta recibida no cumple el contrato de flashcards.
          </p>
        </div>
      </div>
    );
  }

  if (result.status === "empty") {
    return (
      <div
        role="status"
        className="mx-auto max-w-3xl px-4 py-16 text-center"
      >
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-indigo-300">
            <Layers3 className="h-8 w-8" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-100">
            Aún no hay tarjetas de estudio
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
            No hay flashcards para mostrar. Cuando haya contenido disponible,
            podrás repasarlo desde esta sección.
          </p>
        </div>
      </div>
    );
  }

  const {
    title,
    introduction,
    profile,
    studyTime,
    keyConcepts,
    qualityScore,
    remarks,
    bucket,
    objectId,
    items,
  } = result.viewModel;

  const total = items.length;
  const currentItem = items[currentIndex];
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;
  const qualityPercent = Number.isFinite(qualityScore)
    ? Math.round(qualityScore * 100)
    : null;

  const handleNext = () => {
    setCurrentIndex((previous) => Math.min(previous + 1, total - 1));
  };

  const handlePrev = () => {
    setCurrentIndex((previous) => Math.max(previous - 1, 0));
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* CABECERA DEL MATERIAL */}

        <header className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-6 shadow-xl shadow-black/10 sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl"
          />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-200">
                <Sparkles className="h-3.5 w-3.5" />
                Material de aprendizaje
              </span>

              {profile && (
                <span className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-300">
                  Perfil: {profile}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              {title}
            </h1>

            {introduction && (
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                {introduction}
              </p>
            )}

            {/* METADATOS */}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {studyTime != null && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-950/40 p-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-indigo-300">
                    <Clock className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Tiempo estimado
                    </p>
                    <p className="mt-0.5 font-semibold text-slate-100">
                      {studyTime} min
                    </p>
                  </div>
                </div>
              )}

              {qualityPercent !== null && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-950/40 p-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-400">
                        Anclaje RAG
                      </p>
                      <span className="text-sm font-semibold text-emerald-300">
                        {qualityPercent}%
                      </span>
                    </div>

                    <div
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700"
                      role="progressbar"
                      aria-label="Calidad del anclaje RAG"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.min(
                        100,
                        Math.max(0, qualityPercent),
                      )}
                    >
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, qualityPercent))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CONCEPTOS CLAVE */}

            {keyConcepts?.length > 0 && (
              <div className="mt-6 border-t border-slate-800 pt-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <BookOpen className="h-4 w-4 text-indigo-300" />
                  Conceptos clave
                </div>

                <div className="flex flex-wrap gap-2">
                  {keyConcepts.map((concept, index) => (
                    <span
                      key={`${concept}-${index}`}
                      className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-300"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ÁREA DE REPASO */}

        <section
          aria-label="Repaso de flashcards"
          className="rounded-3xl border border-slate-800 bg-slate-900/50 p-4 sm:p-6"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-100">
                  Repasa y aprende
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Avanza a tu ritmo por las tarjetas
                </p>
              </div>
            </div>

            <span className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300">
              Tarjeta {currentIndex + 1} de {total}
            </span>
          </div>

          {/* PROGRESO */}

          <div className="mb-6">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-slate-800"
              role="progressbar"
              aria-label="Progreso de tarjetas"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={currentIndex + 1}
            >
              <div
                className="h-full rounded-full bg-indigo-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* TARJETA ACTUAL */}

          <FlashCard
            key={currentIndex}
            item={currentItem}
            index={currentIndex}
            total={total}
          />

          {/* NAVEGACIÓN */}

          <nav
            aria-label="Navegación entre tarjetas"
            className="mx-auto mt-6 flex max-w-xl items-center justify-between gap-3"
          >
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>

            <span
              aria-live="polite"
              className="text-sm font-medium tabular-nums text-slate-400"
            >
              {currentIndex + 1} / {total}
            </span>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === total - 1}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </section>

        {/* INFORMACIÓN DE PERSISTENCIA Y OBSERVACIONES */}

        {(bucket || objectId || remarks) && (
          <footer className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              {(bucket || objectId) && (
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                    <Cloud className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-300">
                      Persistencia en OCI
                    </p>

                    {bucket && (
                      <p className="mt-1 break-all text-xs text-slate-400">
                        Bucket: {bucket}
                      </p>
                    )}

                    {objectId && (
                      <p className="mt-1 break-all text-xs text-slate-400">
                        ID:{" "}
                        <code className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">
                          {objectId}
                        </code>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {remarks && (
                <p className="max-w-xl text-xs leading-relaxed text-slate-400">
                  {remarks}
                </p>
              )}
            </div>
          </footer>
        )}
      </div>
    </main>
  );
}
