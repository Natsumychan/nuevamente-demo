
import { CheckCircle, Loader, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/shared/utils'

const STATUS_CONFIG = {
  pending: {
    label: 'En espera',
    description: 'La adaptación está pendiente de procesamiento.',
    Icon: Clock,
    iconClass: 'text-slate-400',
  },
  processing: {
    label: 'Generando contenido...',
    description: 'El procesamiento está en curso. El agente activo y el porcentaje de avance no están disponibles.',
    Icon: Loader,
    iconClass: 'text-brand-400 animate-spin',
  },
  completed: {
    label: '¡Contenido generado!',
    description: 'La adaptación finalizó correctamente.',
    Icon: CheckCircle,
    iconClass: 'text-emerald-400',
  },
  failed: {
    label: 'Error en la generación',
    description: 'No fue posible completar la adaptación.',
    Icon: AlertCircle,
    iconClass: 'text-red-400',
  },
}

export function GenerationStatus({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  const { Icon } = config

  return (
    <div
      className="space-y-3"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          <Icon className={cn('w-5 h-5', config.iconClass)} />
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-slate-200">
            {config.label}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  )
}
