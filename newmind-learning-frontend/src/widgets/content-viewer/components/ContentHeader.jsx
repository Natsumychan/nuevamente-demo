import { Badge } from '@/shared/ui/Badge'
import { ScoreRing } from '@/shared/ui/Alert'

export function ContentHeader({ adaptation, FormatIcon, evaluation }) {
  return (
    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-800/60 rounded-xl border border-slate-700/50'>
      <div className='flex items-center gap-3'>
        <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center'>
          <FormatIcon className='w-5 h-5 text-white' />
        </div>
        <div>
          <p className='font-semibold text-slate-100'>{adaptation.format}</p>
          <div className='flex items-center gap-2 mt-0.5'>
            <Badge variant='brand' size='sm'>{adaptation.profile}</Badge>
            <Badge variant='default' size='sm'>{adaptation.industry}</Badge>
          </div>
        </div>
      </div>
      {evaluation && (
        <div className='flex items-center gap-4'>
          <div className='text-right'>
            <p className='text-xs text-slate-500'>Calidad Critic</p>
            <p className='text-xs text-slate-400 mt-0.5'>{evaluation.approved ? '✅ Aprobado' : '❌ No aprobado'}</p>
          </div>
          <ScoreRing score={evaluation.score} size={64} />
        </div>
      )}
    </div>
  )
}
