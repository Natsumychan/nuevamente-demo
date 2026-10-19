import { Badge } from "@/shared/ui/Badge";

function formatLabel(key) {
	return key.replace(/_/g, " ");
}

function CanonicalValue({ value }) {
	if (Array.isArray(value)) {
		return (
			<ul className='space-y-1'>
				{value.map((item, i) => (
					<li key={i}>
						{typeof item === "object" ? JSON.stringify(item) : item}
					</li>
				))}
			</ul>
		);
	}

	if (value && typeof value === "object") {
		return (
			<pre className='text-xs text-slate-300 whitespace-pre-wrap bg-slate-900/70 p-3 rounded-lg overflow-x-auto'>
				{JSON.stringify(value, null, 2)}
			</pre>
		);
	}

	return <span>{value}</span>;
}

export function CanonicalContentView({ content }) {
	const items = Array.isArray(content.items) ? content.items : [];

	return (
		<div className='space-y-5'>
			{content.titulo && (
				<div>
					<p className='text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2'>
						Título
					</p>

					<p className='text-slate-100 font-semibold'>{content.titulo}</p>
				</div>
			)}

			{content.introduccion_contextualizada && (
				<div className='p-4 bg-brand-600/10 border border-brand-600/20 rounded-xl'>
					<p className='text-sm font-semibold text-brand-300 mb-2'>
						Introducción
					</p>

					<p className='text-sm text-slate-300'>
						{content.introduccion_contextualizada}
					</p>
				</div>
			)}

			{items.length > 0 && (
				<div className='space-y-3'>
					<p className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
						Elementos generados
					</p>

					{items.map((item, i) => (
						<div
							key={i}
							className='p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-3'>
							<Badge
								variant='default'
								size='sm'>
								Elemento {i + 1}
							</Badge>

							{Object.entries(item).map(([key, value]) => (
								<div key={key}>
									<p className='text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1'>
										{formatLabel(key)}
									</p>

									<div className='text-sm text-slate-300'>
										<CanonicalValue value={value} />
									</div>
								</div>
							))}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
