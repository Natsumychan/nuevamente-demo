
import { useState } from 'react'
import {
  ChevronRight,
  User,
  FileText,
  Building2,
  Layers,
  Lightbulb,
} from 'lucide-react'

import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/utils'
import {
  PROFILES,
  FORMATS,
  INDUSTRIES,
  DETAIL_LEVELS,
} from '@/shared/types'

// ── Constantes ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'format', label: 'Formato', icon: FileText },
  { id: 'industry', label: 'Nicho', icon: Building2 },
  { id: 'detail', label: 'Detalle', icon: Layers },
]

const STEP_IDS = STEPS.map((step) => step.id)

const INITIAL_VALUES = {
  profile: '',
  format: '',
  industry: 'General',
  detailLevel: 'Didactico',
}

// ── Ayuda contextual ──────────────────────────────────────────────────────────

const STEP_HELP = {
  profile: {
    title: 'Elige para quién estás creando el recurso',
    description:
      'Selecciona el perfil que mejor represente a la persona que utilizará el contenido. Esta elección ayuda a orientar la adaptación a sus necesidades de aprendizaje.',
    tip: 'Piensa en quién estudiará el material y qué conocimientos puede tener sobre el tema.',
  },
  format: {
    title: 'Selecciona el formato que más te sirva',
    description:
      'Cada formato permite trabajar la información de una manera diferente. Revisa el nombre y la descripción de cada opción antes de elegir.',
    tip: 'Ten presente tu objetivo: comprender un tema, repasar conceptos o estudiar de una manera más estructurada.',
  },
  industry: {
    title: 'Define el contexto del contenido',
    description:
      'Selecciona el nicho o área temática que mejor se relacione con el documento. Si el contenido no pertenece a un área específica, puedes conservar la opción General.',
    tip: 'Elige la categoría más cercana al contenido que quieres adaptar.',
  },
  detail: {
    title: 'Ajusta cuánto detalle necesitas',
    description:
      'Revisa la descripción de cada nivel y selecciona el que se ajuste a tu objetivo. Considera si necesitas una explicación breve o desarrollar los conceptos con mayor profundidad.',
    tip: 'El nivel elegido orienta la profundidad esperada del recurso; revisa después que la información importante del original esté representada.',
  },
}

function ContextTip({ stepId }) {
  const help = STEP_HELP[stepId]

  if (!help) return null

  return (
    <aside
      className="mb-5 flex gap-3 rounded-xl border border-brand-500/20 bg-brand-600/5 p-4"
      aria-live="polite"
      aria-atomic="true"
    >
      <Lightbulb
        className="mt-0.5 h-5 w-5 shrink-0 text-brand-400"
        aria-hidden="true"
      />

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-200">
          {help.title}
        </p>

        <p className="mt-1 text-sm leading-relaxed text-slate-400">
          {help.description}
        </p>

        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          <span className="font-semibold text-brand-300">Consejo: </span>
          {help.tip}
        </p>
      </div>
    </aside>
  )
}

// ── Indicador de pasos ────────────────────────────────────────────────────────

function StepIndicator({ currentStep }) {
  const currentIndex = STEP_IDS.indexOf(currentStep)

  return (
    <div
      className="mb-6 flex flex-wrap items-center gap-2"
      aria-label={`Paso ${currentIndex + 1} de ${STEPS.length}`}
    >
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const isActive = step.id === currentStep
        const isDone = i < currentIndex

        return (
          <div key={step.id} className="flex items-center gap-2">
            <div
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                isActive && 'bg-brand-600 text-white',
                isDone && 'bg-emerald-600/20 text-emerald-400',
                !isActive &&
                  !isDone &&
                  'bg-slate-800 text-slate-500'
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {step.label}
            </div>

            {i < STEPS.length - 1 && (
              <ChevronRight
                className="h-3 w-3 text-slate-600"
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Opciones en tarjetas ──────────────────────────────────────────────────────

function OptionGrid({ options, value, onChange, renderOption }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            'rounded-xl border p-4 text-left transition-all duration-200',
            value === opt.value
              ? 'border-brand-500/60 bg-brand-600/10 ring-1 ring-brand-500/40'
              : 'border-slate-700/50 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800'
          )}
        >
          {renderOption(opt)}
        </button>
      ))}
    </div>
  )
}

// ── Paso 1: perfil ────────────────────────────────────────────────────────────

function ProfileStep({ value, onChange }) {
  return (
    <div className="animate-fade-in">
      <p className="mb-4 text-sm text-slate-400">
        ¿Quién va a recibir este contenido?
      </p>

      <OptionGrid
        options={PROFILES}
        value={value}
        onChange={onChange}
        renderOption={(opt) => (
          <>
            <p className="text-sm font-medium text-slate-200">
              {opt.label}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {opt.description}
            </p>
          </>
        )}
      />
    </div>
  )
}

// ── Paso 2: formato ───────────────────────────────────────────────────────────

function FormatStep({ value, onChange }) {
  return (
    <div className="animate-fade-in">
      <p className="mb-4 text-sm text-slate-400">
        ¿Qué formato de contenido querés generar?
      </p>

      <OptionGrid
        options={FORMATS}
        value={value}
        onChange={onChange}
        renderOption={(opt) => (
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">
              {opt.icon}
            </span>

            <div>
              <p className="text-sm font-medium text-slate-200">
                {opt.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {opt.description}
              </p>
            </div>
          </div>
        )}
      />
    </div>
  )
}

// ── Paso 3: nicho ─────────────────────────────────────────────────────────────

function IndustryStep({ value, onChange }) {
  return (
    <div className="animate-fade-in">
      <p className="mb-4 text-sm text-slate-400">
        ¿Cuál es el nicho del contenido?
      </p>

      <div className="grid grid-cols-2 gap-3">
        {INDUSTRIES.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
            className={cn(
              'rounded-xl border p-4 text-center text-sm font-medium transition-all duration-200',
              value === opt.value
                ? 'border-brand-500/60 bg-brand-600/10 text-brand-300 ring-1 ring-brand-500/40'
                : 'border-slate-700/50 bg-slate-800/60 text-slate-300 hover:border-slate-600'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Paso 4: nivel de detalle ──────────────────────────────────────────────────

function DetailStep({ value, onChange }) {
  return (
    <div className="animate-fade-in">
      <p className="mb-4 text-sm text-slate-400">
        ¿Qué nivel de detalle necesitás?
      </p>

      <div className="space-y-2">
        {DETAIL_LEVELS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
            className={cn(
              'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200',
              value === opt.value
                ? 'border-brand-500/60 bg-brand-600/10 ring-1 ring-brand-500/40'
                : 'border-slate-700/50 bg-slate-800/60 hover:border-slate-600'
            )}
          >
            <div
              className={cn(
                'h-4 w-4 shrink-0 rounded-full border-2 transition-all',
                value === opt.value
                  ? 'border-brand-500 bg-brand-500'
                  : 'border-slate-600'
              )}
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-medium text-slate-200">
                {opt.label}
              </p>
              <p className="text-xs text-slate-500">
                {opt.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Validación existente ──────────────────────────────────────────────────────

const canAdvance = {
  profile: (values) => !!values.profile,
  format: (values) => !!values.format,
  industry: (values) => !!values.industry,
  detail: (values) => !!values.detailLevel,
}

// ── Formulario principal ──────────────────────────────────────────────────────

export function AdaptationForm({ onSubmit, loading = false }) {
  const [stepId, setStepId] = useState(STEP_IDS[0])
  const [values, setValues] = useState(INITIAL_VALUES)

  const set = (key) => (val) =>
    setValues((prev) => ({ ...prev, [key]: val }))

  const currentIndex = STEP_IDS.indexOf(stepId)
  const isLastStep = currentIndex === STEP_IDS.length - 1
  const isFirstStep = currentIndex === 0

  const handleNext = () => {
    if (loading || !canAdvance[stepId]?.(values)) return

    if (isLastStep) {
      onSubmit?.(values)
    } else {
      setStepId(STEP_IDS[currentIndex + 1])
    }
  }

  const handleBack = () => {
    if (!isFirstStep && !loading) {
      setStepId(STEP_IDS[currentIndex - 1])
    }
  }

  return (
    <div>
      <StepIndicator currentStep={stepId} />

      {/* La ayuda se adapta al paso actual */}
      <ContextTip stepId={stepId} />

      {stepId === 'profile' && (
        <ProfileStep
          value={values.profile}
          onChange={set('profile')}
        />
      )}

      {stepId === 'format' && (
        <FormatStep
          value={values.format}
          onChange={set('format')}
        />
      )}

      {stepId === 'industry' && (
        <IndustryStep
          value={values.industry}
          onChange={set('industry')}
        />
      )}

      {stepId === 'detail' && (
        <DetailStep
          value={values.detailLevel}
          onChange={set('detailLevel')}
        />
      )}

      {/* Navegación */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={isFirstStep || loading}
        >
          Atrás
        </Button>

        <Button
          variant="primary"
          onClick={handleNext}
          disabled={loading || !canAdvance[stepId]?.(values)}
          loading={isLastStep && loading}
          rightIcon={
            !isLastStep
              ? <ChevronRight className="h-4 w-4" />
              : undefined
          }
        >
          {isLastStep ? 'Generar contenido' : 'Siguiente'}
        </Button>
      </div>
    </div>
  )
}
