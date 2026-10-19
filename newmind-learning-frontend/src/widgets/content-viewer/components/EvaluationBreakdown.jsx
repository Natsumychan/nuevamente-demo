import { Card } from '@/shared/ui/Card'

export function EvaluationBreakdown({ evaluation }) {
	if (!evaluation?.criteria) return null;

	return (
		<Card>
			<p className='text-sm font-semibold text-slate-300 mb-4'>
				Evaluación del Critic Agent
			</p>

			<div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
				{Object.entries(evaluation.criteria).map(([key, val]) => (
					<div
						key={key}
						className='text-center'>
						<p className='text-lg font-bold text-slate-100'>
							{Math.round(val * 100)}%
						</p>

						<p className='text-xs text-slate-500 mt-0.5 capitalize'>
							{key.replace(/_/g, " ")}
						</p>
					</div>
				))}
			</div>
		</Card>
	);
}

