import { useState } from "react";
import {
	Brain,
	CheckCircle2,
	CircleHelp,
	RotateCcw,
	Trophy,
} from "lucide-react";
import { Badge } from "@/shared/ui/Badge";
import { QuizQuestion } from "../components/QuizQuestion";

function normalizeQuestion(item) {
	if (!item || typeof item !== "object") return null;

	const prompt = item.question ?? item.pregunta ?? item.prompt;
	const options = item.options ?? item.opciones;

	if (typeof prompt !== "string" || !Array.isArray(options)) {
		return null;
	}

	const correctAnswer =
		item.correct_answer ??
		item.respuesta_correcta ??
		item.correctAnswer ??
		item.answer_key ??
		item.respuestaCorrecta ??
		"";

	return {
		prompt: prompt.trim(),

		options: options
			.filter((option) => typeof option === "string")
			.map((option) => option.trim())
			.filter(Boolean),

		correct_answer:
			typeof correctAnswer === "string"
				? correctAnswer.trim()
				: String(correctAnswer ?? ""),

		justification:
			item.justification ??
			item.justificacion_didactica ??
			item.justificacion ??
			"",

		hint: item.hint ?? item.pista_didactica ?? item.pista ?? "",

		difficulty: item.difficulty ?? item.dificultad ?? "",
	};
}

/**
 * Vista interactiva compatible con los campos canónicos
 * del backend y con las respuestas de formatos anteriores.
 */
export function QuizView({ content }) {
	const rawQuestions = Array.isArray(content?.questions)
		? content.questions
		: Array.isArray(content?.items)
			? content.items
			: [];

	const questions = rawQuestions
		.map(normalizeQuestion)
		.filter(
			(question) =>
				question !== null &&
				question.prompt.length > 0 &&
				question.options.length > 0,
		);

	const title = content?.titulo ?? content?.title ?? "Comprueba lo aprendido";

	const introduction =
		content?.introduccion_contextualizada ??
		content?.introduction ??
		content?.introduccion ??
		"Responde las preguntas a tu ritmo y comprueba lo que has aprendido.";

	const [answers, setAnswers] = useState({});
	const [submitted, setSubmitted] = useState({});

	if (questions.length === 0) {
		return (
			<div
				role='status'
				className='rounded-2xl border border-slate-700 bg-slate-800/60 p-8 text-center'>
				<Brain
					className='mx-auto mb-3 h-8 w-8 text-slate-400'
					aria-hidden='true'
				/>

				<h3 className='text-base font-semibold text-slate-200'>
					No hay preguntas disponibles
				</h3>

				<p className='mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400'>
					La respuesta recibida no contiene preguntas con opciones válidas para
					este quiz.
				</p>
			</div>
		);
	}

	const evaluatedQuestions = questions.filter(
		(question, index) =>
			submitted[index] &&
			typeof question.correct_answer === "string" &&
			question.correct_answer.length > 0,
	);

	const answeredCount = Object.values(submitted).filter(Boolean).length;

	const correctCount = evaluatedQuestions.filter((question) => {
		const index = questions.indexOf(question);

		return answers[index]?.trim() === question.correct_answer.trim();
	}).length;

	const allSubmitted = questions.every((_, index) => Boolean(submitted[index]));

	const progressPercent = Math.round((answeredCount / questions.length) * 100);

	const hasCompleteScore =
		allSubmitted && evaluatedQuestions.length === questions.length;

	const scorePercent = hasCompleteScore
		? Math.round((correctCount / questions.length) * 100)
		: null;

	const resetQuiz = () => {
		setAnswers({});
		setSubmitted({});
	};

	return (
		<section
			className='space-y-6'
			aria-label='Quiz interactivo'>
			{/* Encabezado */}
			<header className='overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 shadow-lg shadow-slate-950/10'>
				<div className='p-5 sm:p-7'>
					<div className='flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between'>
						<div className='flex items-start gap-4'>
							<span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-400/20 bg-brand-500/15 text-brand-300'>
								<Brain
									className='h-6 w-6'
									aria-hidden='true'
								/>
							</span>

							<div className='min-w-0'>
								<p className='mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-300'>
									Practica y aprende
								</p>

								<h2 className='text-xl font-bold tracking-tight text-slate-100 sm:text-2xl'>
									{title}
								</h2>

								<p className='mt-2 max-w-xl text-sm leading-6 text-slate-400'>
									{introduction}
								</p>
							</div>
						</div>

						<Badge
							variant='brand'
							size='lg'
              className="shrink-0 whitespace-nowrap self-start">
							{questions.length}{" "}
							{questions.length === 1 ? "pregunta" : "preguntas"}
						</Badge>
					</div>

					{/* Progreso */}
					<div className='mt-7 rounded-2xl border border-slate-700/80 bg-slate-900/40 p-4 sm:p-5'>
						<div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
							<div className='flex items-center gap-2 text-sm font-semibold text-slate-200'>
								<CheckCircle2
									className='h-4 w-4 text-brand-300'
									aria-hidden='true'
								/>
								Tu progreso
							</div>

							<span className='text-sm font-medium tabular-nums text-slate-300'>
								{answeredCount} de {questions.length} comprobadas
							</span>
						</div>

						<div
							className='h-2.5 overflow-hidden rounded-full bg-slate-700'
							role='progressbar'
							aria-label='Progreso del quiz'
							aria-valuemin={0}
							aria-valuemax={questions.length}
							aria-valuenow={answeredCount}
							aria-valuetext={`${progressPercent}% completado`}>
							<div
								className='h-full rounded-full bg-brand-400 transition-all duration-500 ease-out'
								style={{ width: `${progressPercent}%` }}
							/>
						</div>

						<div className='mt-2 flex items-center justify-between gap-3 text-xs text-slate-400'>
							<span>
								{allSubmitted
									? "Has revisado todas las preguntas"
									: "Sigue avanzando a tu ritmo"}
							</span>

							<span className='font-semibold tabular-nums text-brand-300'>
								{progressPercent}%
							</span>
						</div>
					</div>
				</div>
			</header>

			{/* Preguntas */}
			<div className='space-y-5'>
				{questions.map((question, index) => (
					<QuizQuestion
						key={`${index}-${question.prompt}`}
						question={question}
						index={index}
						selected={answers[index] ?? ""}
						submitted={Boolean(submitted[index])}
						onSelect={(option) =>
							setAnswers((current) => ({
								...current,
								[index]: option,
							}))
						}
						onSubmit={() =>
							setSubmitted((current) => ({
								...current,
								[index]: true,
							}))
						}
					/>
				))}
			</div>

			{/* Resumen final */}
			{allSubmitted && (
				<section
					aria-label='Resumen del cuestionario'
					className='overflow-hidden rounded-3xl border border-brand-400/25 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-slate-950/10'>
					<div className='p-5 sm:p-7'>
						<div className='flex flex-col gap-5 sm:flex-row sm:items-start'>
							<div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-300'>
								<Trophy
									className='h-6 w-6'
									aria-hidden='true'
								/>
							</div>

							<div className='min-w-0 flex-1'>
								<p className='text-xs font-semibold uppercase tracking-[0.16em] text-brand-300'>
									Actividad finalizada
								</p>

								<h3 className='mt-1 text-xl font-bold text-slate-100'>
									¡Quiz completado!
								</h3>

								<p className='mt-2 text-sm leading-6 text-slate-400'>
									Has revisado todas las preguntas. Consulta tu resultado y
									vuelve a intentarlo cuando quieras seguir practicando.
								</p>
							</div>

							{hasCompleteScore && (
								<div className='rounded-2xl border border-slate-700 bg-slate-900/60 px-5 py-3 text-center sm:min-w-28'>
									<p className='text-2xl font-bold tabular-nums text-slate-100'>
										{scorePercent}%
									</p>

									<p className='mt-1 text-xs text-slate-400'>Puntuación</p>
								</div>
							)}
						</div>

						<div className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3'>
							<div className='rounded-2xl border border-slate-700/80 bg-slate-900/40 p-4'>
								<p className='text-sm text-slate-400'>Preguntas revisadas</p>

								<p className='mt-2 text-2xl font-bold tabular-nums text-slate-100'>
									{answeredCount}
									<span className='ml-1 text-sm font-medium text-slate-500'>
										/ {questions.length}
									</span>
								</p>
							</div>

							<div className='rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4'>
								<p className='text-sm text-slate-400'>Respuestas correctas</p>

								<p className='mt-2 text-2xl font-bold tabular-nums text-emerald-300'>
									{correctCount}
								</p>
							</div>

							<div className='rounded-2xl border border-slate-700/80 bg-slate-900/40 p-4'>
								<p className='text-sm text-slate-400'>Sin clave de respuesta</p>

								<p className='mt-2 text-2xl font-bold tabular-nums text-slate-100'>
									{questions.length - evaluatedQuestions.length}
								</p>
							</div>
						</div>

						<p className='mt-4 rounded-xl border border-slate-700/70 bg-slate-900/30 px-4 py-3 text-sm leading-6 text-slate-300'>
							{hasCompleteScore
								? `Resultado: ${correctCount} de ${questions.length} respuestas correctas.`
								: `Se comprobaron todas las preguntas; ${evaluatedQuestions.length} tienen clave de respuesta para calcular el resultado.`}
						</p>

						<div className='mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
							<p className='flex items-center gap-2 text-sm text-slate-400'>
								<CircleHelp
									className='h-4 w-4 shrink-0'
									aria-hidden='true'
								/>
								Puedes repetir el cuestionario para practicar de nuevo.
							</p>

							<button
								type='button'
								onClick={resetQuiz}
								className='inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300'>
								<RotateCcw
									className='h-4 w-4'
									aria-hidden='true'
								/>
								Intentar de nuevo
							</button>
						</div>
					</div>
				</section>
			)}
		</section>
	);
}
