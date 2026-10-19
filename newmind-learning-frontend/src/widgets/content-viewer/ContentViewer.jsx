import { BookOpen, HelpCircle, AlignLeft, Presentation, FileCheck } from "lucide-react"
import { adaptFlashcardsResponse } from "./adaptFlashcardsResponse"
import { FlashcardsView } from "./views/FlashcardsView"
import { TutorialView } from "./views/TutorialView"
import { ExecutiveSummaryView } from "./views/ExecutiveSummaryView"
import { QuizView } from "./views/QuizView"
import { GuionView } from "./views/GuionView"
import { CanonicalContentView } from "./views/CanonicalContentView"
import { ContentHeader } from "./components/ContentHeader"
import { EvaluationBreakdown } from "./components/EvaluationBreakdown"

const FORMAT_ICONS = {
  Flashcards: HelpCircle,
  Tutorial: BookOpen,
  "Resumen Ejecutivo": FileCheck,
  Quiz: AlignLeft,
  Guion: Presentation,
}

const FORMAT_VIEWS = {
  Tutorial: TutorialView,
  "Resumen Ejecutivo": ExecutiveSummaryView,
  Quiz: QuizView,
  Guion: GuionView,
}

/** Coordinates the format-specific views for a completed adaptation. */
export function ContentViewer({ adaptation }) {
  if (!adaptation || adaptation.status !== "completed") return null

  const flashcardsResult = adaptation.format === "Flashcards"
    ? adaptFlashcardsResponse(adaptation)
    : null
  if (!adaptation.content && !flashcardsResult) return null

  const FormatIcon = FORMAT_ICONS[adaptation.format] ?? BookOpen
  const FormatView = FORMAT_VIEWS[adaptation.format]
  const evaluation = adaptation.evaluation
  const content = adaptation.content ?? {}
  const usesCanonicalBackendContent = Boolean(
    content.titulo || content.introduccion_contextualizada || Array.isArray(content.items),
  )

  return (
    <div className="space-y-6">
      <ContentHeader adaptation={adaptation} FormatIcon={FormatIcon} evaluation={evaluation} />
      {adaptation.format === "Flashcards" ? (
        <FlashcardsView result={flashcardsResult} />
          ) : FormatView ? (
        <FormatView content={content} />
          ) : usesCanonicalBackendContent ? (
        <CanonicalContentView content={content} />
          ) : (
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-900 p-5 text-sm text-slate-300">
              {JSON.stringify(content, null, 2)}
            </pre>
      )}
      <EvaluationBreakdown evaluation={evaluation} />
    </div>
  )
}
