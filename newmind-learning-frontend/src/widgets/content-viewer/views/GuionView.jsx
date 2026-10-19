
import {
  BookOpenText,
  Clock3,
  FileText,
  ListVideo,
  Lightbulb,
} from "lucide-react";

function isText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function formatLabel(value) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function StructuredValue({ value }) {
  if (value === null || value === undefined) return null;

  if (isText(value)) {
    return (
      <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
        {value}
      </p>
    );
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return (
      <p className="text-sm leading-7 text-slate-300">
        {String(value)}
      </p>
    );
  }

  if (Array.isArray(value)) {
    const items = value.filter(
      (item) =>
        item !== null &&
        item !== undefined &&
        item !== ""
    );

    if (items.length === 0) return null;

    return (
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 rounded-xl border border-slate-700/70 bg-slate-900/30 p-3"
          >
            <span
              className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-400"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <StructuredValue value={item} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value).filter(
      ([, item]) =>
        item !== null &&
        item !== undefined &&
        item !== "" &&
        !(Array.isArray(item) && item.length === 0)
    );

    if (entries.length === 0) return null;

    return (
      <dl className="space-y-4">
        {entries.map(([key, item]) => (
          <div key={key} className="min-w-0">
            <dt className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {formatLabel(key)}
            </dt>
            <dd>
              <StructuredValue value={item} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return null;
}

function ScriptSection({ item, index }) {
  const sectionTitle =
    item.seccion ??
    item.titulo ??
    item.title ??
    item.nombre ??
    `Sección ${index + 1}`;

  const sectionContent =
    item.contenido ??
    item.descripcion ??
    item.description ??
    item.content;

  const teachingHint =
    item.pista_didactica ??
    item.pista ??
    item.hint ??
    item.example;

  const excludedKeys = new Set([
    "seccion",
    "titulo",
    "title",
    "nombre",
    "contenido",
    "descripcion",
    "description",
    "content",
    "pista_didactica",
    "pista",
    "hint",
    "example",
  ]);

  const extraEntries = Object.entries(item).filter(
    ([key, value]) =>
      !excludedKeys.has(key) &&
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0)
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-800/50 shadow-sm transition duration-200 hover:border-brand-400/40">
      <div className="flex items-start gap-3 border-b border-slate-700/70 bg-slate-800/70 p-4 sm:p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 text-brand-300">
          <ListVideo className="h-4 w-4" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
            Sección {index + 1}
          </p>
          <h3 className="font-bold leading-snug text-slate-100">
            {String(sectionTitle)}
          </h3>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        {sectionContent !== undefined &&
          sectionContent !== null &&
          sectionContent !== "" && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Desarrollo
              </h4>
              <StructuredValue value={sectionContent} />
            </div>
          )}

        {teachingHint !== undefined &&
          teachingHint !== null &&
          teachingHint !== "" && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <Lightbulb
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <h4 className="mb-1 text-sm font-semibold text-amber-200">
                  Pista didáctica
                </h4>
                <div className="text-sm leading-6 text-amber-100/90">
                  <StructuredValue value={teachingHint} />
                </div>
              </div>
            </div>
          )}

        {extraEntries.length > 0 && (
          <div className="border-t border-slate-700/70 pt-4">
            <StructuredValue
              value={Object.fromEntries(extraEntries)}
            />
          </div>
        )}
      </div>
    </article>
  );
}

export function GuionView({ content }) {
  if (
    content === null ||
    content === undefined ||
    (typeof content === "object" &&
      Object.keys(content).length === 0)
  ) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-slate-700 bg-slate-800/60 p-8 text-center"
      >
        <FileText
          className="mx-auto mb-3 h-8 w-8 text-slate-400"
          aria-hidden="true"
        />
        <h3 className="text-base font-semibold text-slate-200">
          Guion no disponible
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
          No se recibió contenido para mostrar en esta vista.
        </p>
      </div>
    );
  }

  const isObject =
    typeof content === "object" && !Array.isArray(content);

  const title = isObject
    ? content.titulo ??
      content.title ??
      content.nombre ??
      content.name
    : null;

  const description = isObject
    ? content.introduccion_contextualizada ??
      content.introduccion ??
      content.introduction ??
      content.descripcion ??
      content.description
    : null;

  const duration = isObject
    ? content.duracion ??
      content.duration ??
      content.estimated_duration
    : null;

  const canonicalItems = Array.isArray(content?.items)
    ? content.items
    : null;

  const legacySections = isObject
    ? Object.entries(content).filter(
        ([key, value]) =>
          ![
            "titulo",
            "title",
            "nombre",
            "name",
            "introduccion_contextualizada",
            "introduccion",
            "introduction",
            "descripcion",
            "description",
            "duracion",
            "duration",
            "estimated_duration",
            "items",
          ].includes(key) &&
          value !== null &&
          value !== undefined &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
      )
    : [];

  const sections = canonicalItems
    ? canonicalItems.filter(
        (item) =>
          item !== null &&
          item !== undefined &&
          (typeof item === "object" || isText(item))
      )
    : [];

  return (
    <section
      className="space-y-5"
      aria-label="Guion de la lección"
    >
      <header className="overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 shadow-lg">
        <div className="p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand-400/20 bg-brand-500/15 text-brand-300">
              <BookOpenText
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">
                Material de estudio
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
                {isText(title)
                  ? title
                  : "Guion de la lección"}
              </h2>

              {isText(description) && (
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">
                  {description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {duration !== null &&
                  duration !== undefined &&
                  duration !== "" && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/50 px-3 py-1.5 text-xs font-medium text-slate-300">
                      <Clock3
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Duración: {String(duration)}
                    </span>
                  )}

                {canonicalItems && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/50 px-3 py-1.5 text-xs font-medium text-slate-300">
                    <ListVideo
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                    {sections.length}{" "}
                    {sections.length === 1
                      ? "sección"
                      : "secciones"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {sections.length > 0 ? (
        <div className="space-y-4">
          {sections.map((item, index) =>
            typeof item === "object" ? (
              <ScriptSection
                key={`${item.seccion ?? item.titulo ?? index}-${index}`}
                item={item}
                index={index}
              />
            ) : (
              <article
                key={index}
                className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5"
              >
                <h3 className="mb-3 font-bold text-slate-100">
                  Sección {index + 1}
                </h3>
                <StructuredValue value={item} />
              </article>
            )
          )}
        </div>
      ) : legacySections.length > 0 ? (
        <div className="space-y-4">
          {legacySections.map(([key, value]) => (
            <article
              key={key}
              className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 sm:p-6"
            >
              <h3 className="mb-4 font-bold text-slate-100">
                {formatLabel(key)}
              </h3>
              <StructuredValue value={value} />
            </article>
          ))}
        </div>
      ) : !isText(description) ? (
        <article className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 sm:p-6">
          <p className="text-sm leading-7 text-slate-400">
            El guion no contiene secciones desarrolladas todavía.
          </p>
        </article>
      ) : null}
    </section>
  );
}
