import { useState } from "react";
import {
	BookOpen,
	Check,
	CheckCircle2,
	CircleCheck,
	ClipboardCheck,
	Copy,
	Lightbulb,
	ListChecks,
	Terminal,
} from "lucide-react";

function TutorialStep({ step, index }) {
	const [copied, setCopied] = useState(false);

	const title =
		step.titulo_paso ?? step.title ?? `Paso ${step.paso ?? index + 1}`;

	const description =
		step.descripcion ?? step.content ?? step.description ?? "";

	const command = step.comando_o_codigo ?? step.command ?? step.code ?? "";

	const verification = step.verificacion ?? step.verification ?? "";

	const hint = step.pista_didactica ?? step.example ?? step.hint ?? "";

	const stepNumber = step.paso ?? index + 1;

	async function copyCommand() {
		try {
			await navigator.clipboard.writeText(String(command));
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	}

	return (
		<article className='relative pl-10 sm:pl-14'>
			{/* Línea de progreso */}
			<div className='absolute left-[13px] top-10 bottom-[-24px] w-px bg-slate-200 last:hidden' />

			{/* Número del paso */}
			<div className='absolute left-0 top-0 z-10 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-xs font-bold text-white shadow-sm ring-1 ring-blue-100'>
				{stepNumber}
			</div>

			<div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md'>
				{/* Encabezado del paso */}
				<div className='border-b border-slate-100 bg-slate-50/80 px-4 py-4 sm:px-6'>
					<div className='mb-2 flex flex-wrap items-center gap-2'>
						<span className='rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700'>
							Paso {stepNumber}
						</span>

						{command && (
							<span className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600'>
								<Terminal size={12} />
								Incluye código
							</span>
						)}
					</div>

					<h3 className='text-base font-bold leading-snug text-slate-900 sm:text-lg'>
						{title}
					</h3>
				</div>

				<div className='space-y-5 p-4 sm:p-6'>
					{/* Explicación */}
					{description && (
						<div>
							<h4 className='mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500'>
								¿Qué debes hacer?
							</h4>
							<p className='text-sm leading-7 text-slate-700'>{description}</p>
						</div>
					)}

					{/* Comando o código */}
					{command && (
						<div className='overflow-hidden rounded-xl border border-slate-700 bg-slate-950'>
							<div className='flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3'>
								<div className='flex items-center gap-2 text-xs font-medium text-slate-300'>
									<Terminal
										size={15}
										className='text-blue-400'
									/>
									Comando o código
								</div>

								<button
									type='button'
									onClick={copyCommand}
									className='inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-blue-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400'
									aria-label='Copiar comando o código'>
									{copied ? (
										<>
											<Check size={14} />
											Copiado
										</>
									) : (
										<>
											<Copy size={14} />
											Copiar
										</>
									)}
								</button>
							</div>

							<pre className='overflow-x-auto p-4 text-sm leading-6 text-blue-100'>
								<code>{String(command)}</code>
							</pre>
						</div>
					)}

					{/* Verificación */}
					{verification && (
						<div className='flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4'>
							<div className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700'>
								<ClipboardCheck size={17} />
							</div>

							<div>
								<h4 className='mb-1 text-sm font-semibold text-emerald-900'>
									Verifica el resultado
								</h4>
								<p className='text-sm leading-6 text-emerald-800'>
									{verification}
								</p>
							</div>
						</div>
					)}

					{/* Pista didáctica o ejemplo */}
					{hint && (
						<div className='flex items-start gap-3 rounded-xl bg-amber-50 p-4'>
							<Lightbulb
								size={19}
								className='mt-0.5 shrink-0 text-amber-600'
							/>
							<div>
								<h4 className='mb-1 text-sm font-semibold text-amber-900'>
									Pista didáctica
								</h4>
								<p className='text-sm leading-6 text-amber-800'>{hint}</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</article>
	);
}

export function TutorialView({ content }) {
	const title =
		content?.titulo ?? content?.title ?? "Guía práctica de aprendizaje";

	const introduction =
		content?.introduccion_contextualizada ??
		content?.introduction ??
		content?.introduccion ??
		"";

	// Admite tanto el esquema actual del backend como el anterior.
	const rawSteps = Array.isArray(content?.items)
		? content.items
		: Array.isArray(content?.steps)
			? content.steps
			: [];

	const steps = rawSteps.filter(
		(step) => step !== null && typeof step === "object",
	);

	const conclusion = content?.conclusion ?? "";

	if (!content || typeof content !== "object") {
		return (
			<div className='rounded-2xl border border-slate-200 bg-white p-8 text-center'>
				<BookOpen
					className='mx-auto mb-3 text-slate-400'
					size={32}
				/>
				<h2 className='font-semibold text-slate-800'>Tutorial no disponible</h2>
				<p className='mt-2 text-sm text-slate-500'>
					No hay contenido para mostrar en este momento.
				</p>
			</div>
		);
	}

	return (
		<section className='space-y-7'>
			{/* Portada */}
			<header className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-indigo-800 to-violet-600 p-6 text-white shadow-lg sm:p-8'>
				<div className='pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5' />
				<div className='pointer-events-none absolute -bottom-20 right-20 h-48 w-48 rounded-full bg-sky-300/10' />

				<div className='relative'>
					<div className='mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50'>
						<BookOpen size={15} />
						Guía de aprendizaje
					</div>

					<h2 className='max-w-3xl text-2xl font-bold leading-tight sm:text-3xl'>
						{title}
					</h2>

					{introduction && (
						<p className='mt-4 max-w-3xl text-sm leading-7 text-blue-50 sm:text-base'>
							{introduction}
						</p>
					)}

					<div className='mt-6 flex flex-wrap items-center gap-3 text-sm text-blue-50'>
						<span className='inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2'>
							<ListChecks size={16} />
							{steps.length} {steps.length === 1 ? "paso" : "pasos"}
						</span>

						<span className='inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2'>
							<CircleCheck size={16} />
							Aprende a tu ritmo
						</span>
					</div>
				</div>
			</header>

			{/* Introducción a los pasos */}
			<div className='flex items-center gap-3'>
				<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700'>
					<ListChecks size={21} />
				</div>

				<div>
					<h3 className='text-lg font-bold text-slate-300'>
						Desarrollo paso a paso
					</h3>
					<p className='text-sm text-slate-500'>
						Sigue las instrucciones y comprueba cada resultado.
					</p>
				</div>
			</div>

			{/* Lista de pasos */}
			{steps.length > 0 ? (
				<div className='space-y-6'>
					{steps.map((step, index) => (
						<TutorialStep
							key={`${step.paso ?? index}-${step.titulo_paso ?? step.title ?? ""}`}
							step={step}
							index={index}
						/>
					))}
				</div>
			) : (
				<div className='rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center'>
					<ListChecks
						className='mx-auto mb-3 text-slate-400'
						size={30}
					/>
					<h4 className='font-semibold text-slate-800'>
						No hay pasos disponibles
					</h4>
					<p className='mt-2 text-sm leading-6 text-slate-500'>
						El contenido recibido no incluye pasos estructurados. Revisa la
						respuesta del backend para este tutorial.
					</p>
				</div>
			)}

			{/* Conclusión opcional */}
			{conclusion && (
				<div className='flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6'>
					<CheckCircle2
						size={22}
						className='mt-0.5 shrink-0 text-emerald-700'
					/>
					<div>
						<h3 className='font-bold text-emerald-950'>Para finalizar</h3>
						<p className='mt-2 text-sm leading-7 text-emerald-900'>
							{conclusion}
						</p>
					</div>
				</div>
			)}
		</section>
	);
}
