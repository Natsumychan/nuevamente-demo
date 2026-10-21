import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	PlusCircle,
	History,
	FileText,
	Cpu,
	BookOpen,
	Zap,
	TrendingUp,
	UploadCloud,
	SlidersHorizontal,
	Sparkles,
	CheckCircle2,
	ArrowRight,
	Lightbulb,
} from "lucide-react";

import { Button } from "@/shared/ui/Button";
import { Card, CardHeader } from "@/shared/ui/Card";
import { AdaptationCard } from "@/entities/adaptation/ui/AdaptationCard";
import { documentsApi, adaptationsApi } from "@/shared/api";

// ── Helpers ────────────────────────────────────────────────────────────────

function getRecentAdaptations(adaptations = []) {
	return [...adaptations]
		.sort((a, b) => {
			const dateA = new Date(a.createdAt ?? 0).getTime();
			const dateB = new Date(b.createdAt ?? 0).getTime();

			return dateB - dateA;
		})
		.slice(0, 3);
}

function getDashboardStats(documents = [], adaptations = []) {
	const completedAdaptations = adaptations.filter(
		(adaptation) => adaptation.status === "completed",
	);

	const formats = new Set(
		completedAdaptations.map((adaptation) => adaptation.format).filter(Boolean),
	);

	const scores = completedAdaptations
		.map((adaptation) => adaptation.evaluation?.score)
		.filter(
			(score) =>
				typeof score === "number" &&
				Number.isFinite(score) &&
				score >= 0 &&
				score <= 1,
		);

	const averageScore =
		scores.length > 0
			? scores.reduce((total, score) => total + score, 0) / scores.length
			: null;

	return [
		{
			label: "Documentos cargados",
			value: documents.length,
			icon: FileText,
			color: "text-blue-400",
			bg: "bg-blue-400/10",
		},
		{
			label: "Adaptaciones generadas",
			value: completedAdaptations.length,
			icon: Zap,
			color: "text-brand-400",
			bg: "bg-brand-400/10",
		},
		{
			label: "Formatos distintos",
			value: formats.size,
			icon: BookOpen,
			color: "text-violet-400",
			bg: "bg-violet-400/10",
		},
		{
			label: "Similitud promedio de recuperación",
			value: averageScore !== null ? `${Math.round(averageScore * 100)}%` : "—",
			icon: TrendingUp,
			color: "text-emerald-400",
			bg: "bg-emerald-400/10",
		},
	];
}

// ── Data hook ───────────────────────────────────────────────────────────────

function useDashboardData() {
	const [documents, setDocuments] = useState([]);
	const [adaptations, setAdaptations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [reloadKey, setReloadKey] = useState(0);

	useEffect(() => {
		let ignore = false;

		const loadDashboardData = async () => {
			try {
				setLoading(true);
				setError(null);

				const [documentsResponse, adaptationsResponse] = await Promise.all([
					documentsApi.list(),
					adaptationsApi.list(),
				]);

				if (ignore) return;

				setDocuments(
					Array.isArray(documentsResponse)
						? documentsResponse
						: (documentsResponse?.items ?? []),
				);

				setAdaptations(
					Array.isArray(adaptationsResponse)
						? adaptationsResponse
						: (adaptationsResponse?.items ?? []),
				);
			} catch (err) {
				if (ignore) return;

				setError(err.message ?? "No se pudieron cargar los datos del panel.");
			} finally {
				if (!ignore) {
					setLoading(false);
				}
			}
		};

		loadDashboardData();

		return () => {
			ignore = true;
		};
	}, [reloadKey]);

	return {
		documents,
		adaptations,
		loading,
		error,
		reload: () => setReloadKey((current) => current + 1),
	};
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, bg }) {
	return (
		<Card className='flex flex-col gap-3'>
			<div
				className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
				<Icon
					className={`h-5 w-5 ${color}`}
					aria-hidden='true'
				/>
			</div>

			<div>
				<p className='text-2xl font-bold text-slate-200'>{value}</p>
				<p className='mt-1 text-xs leading-relaxed text-slate-400'>{label}</p>
			</div>
		</Card>
	);
}

const learningSteps = [
	{
		number: "01",
		title: "Carga tu documento",
		description:
			"Selecciona el documento con el contenido que quieres estudiar.",
		icon: UploadCloud,
	},
	{
		number: "02",
		title: "Personaliza tu recurso",
		description: "Elige el formato, el perfil y el área temática disponibles.",
		icon: SlidersHorizontal,
	},
	{
		number: "03",
		title: "Genera el contenido",
		description:
			"Deja que NuevaMente prepare un recurso adaptado a tu objetivo.",
		icon: Sparkles,
	},
	{
		number: "04",
		title: "Revisa y aprende",
		description:
			"Consulta el resultado y contrasta los datos importantes con la fuente original.",
		icon: CheckCircle2,
	},
];

function WelcomeGuide() {
	return (
		<section
			className='relative overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/80 p-6 sm:p-8'
			aria-labelledby='welcome-title'>
			<div
				className='pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl'
				aria-hidden='true'
			/>

			<div className='relative'>
				<div className='mb-5 flex items-center gap-2'>
					<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500'>
						<Cpu
							className='h-5 w-5 text-white'
							aria-hidden='true'
						/>
					</div>

					<div>
						<p className='text-sm font-semibold text-slate-100'>NuevaMente</p>
						<p className='text-xs text-slate-400'>
							Aprende de una nueva manera
						</p>
					</div>
				</div>

				<div className='grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]'>
					<div>
						<p className='mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300'>
							Tu aprendizaje comienza aquí
						</p>

						<h1
							id='welcome-title'
							className='max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl'>
							¡Bienvenido a <span className='gradient-text'>NuevaMente!</span>
						</h1>

						<p className='mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base'>
							Transforma tus documentos en recursos educativos adaptados a tus
							necesidades. Organiza la información, explora diferentes formatos
							de aprendizaje y estudia los temas que más te interesan.
						</p>

						<div className='mt-6 flex flex-col gap-3 sm:flex-row'>
							<Link to='/new'>
								<Button
									variant='primary'
									size='lg'
									leftIcon={<PlusCircle className='h-4 w-4' />}>
									Crear mi primer recurso
								</Button>
							</Link>

							<Link to='/history'>
								<Button
									variant='secondary'
									size='lg'
									leftIcon={<History className='h-4 w-4' />}>
									Consultar historial
								</Button>
							</Link>
						</div>
					</div>

					<div className='hidden lg:flex lg:justify-center'>
						<div className='relative flex h-52 w-52 items-center justify-center rounded-full border border-brand-400/20 bg-brand-500/5'>
							<div className='absolute inset-5 rounded-full border border-slate-700/70' />
							<div className='flex h-28 w-28 items-center justify-center rounded-3xl border border-brand-400/30 bg-slate-800 shadow-xl shadow-brand-500/10'>
								<BookOpen
									className='h-14 w-14 text-brand-300'
									aria-hidden='true'
								/>
							</div>

							<div className='absolute right-3 top-5 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800'>
								<Sparkles
									className='h-5 w-5 text-violet-300'
									aria-hidden='true'
								/>
							</div>

							<div className='absolute bottom-5 left-2 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800'>
								<FileText
									className='h-5 w-5 text-blue-300'
									aria-hidden='true'
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className='relative mt-8 border-t border-slate-700/70 pt-6'>
				<div className='mb-4 flex items-center gap-2'>
					<Lightbulb
						className='h-5 w-5 text-amber-300'
						aria-hidden='true'
					/>
					<h2 className='text-sm font-semibold text-slate-100'>
						¿Cómo funciona?
					</h2>
				</div>

				<div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
					{learningSteps.map((step) => {
						const StepIcon = step.icon;

						return (
							<div
								key={step.number}
								className='rounded-xl border border-slate-700/70 bg-slate-950/50 p-4'>
								<div className='mb-3 flex items-center justify-between'>
									<span className='text-xs font-bold tracking-wider text-brand-300'>
										PASO {step.number}
									</span>

									<StepIcon
										className='h-5 w-5 text-slate-400'
										aria-hidden='true'
									/>
								</div>

								<h3 className='text-sm font-semibold text-slate-100'>
									{step.title}
								</h3>

								<p className='mt-2 text-xs leading-5 text-slate-400'>
									{step.description}
								</p>
							</div>
						);
					})}
				</div>

				<p className='mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-300'>
					<Lightbulb
						className='mt-0.5 h-4 w-4 shrink-0'
						aria-hidden='true'
					/>
					Recomendación: revisa el contenido generado y contrasta la información
					importante con el documento original. El indicador de similitud no
					garantiza por sí solo la exactitud del resultado.
				</p>
			</div>
		</section>
	);
}

// ── Page ────────────────────────────────────────────────────────────────────

export function DashboardPage() {
	const navigate = useNavigate();

	const { documents, adaptations, loading, error, reload } = useDashboardData();

	const stats = getDashboardStats(documents, adaptations);
	const recentAdaptations = getRecentAdaptations(adaptations);

	const handleAdaptationClick = (adaptation) => {
		navigate(`/result/${adaptation.id}`, {
			state: { adaptation },
		});
	};

	return (
		<div className='animate-fade-in space-y-8'>
			<WelcomeGuide />

			{error && (
				<Card className='border border-red-500/20 bg-red-500/5'>
					<div className='flex items-start gap-3'>
						<FileText
							className='mt-0.5 h-5 w-5 text-red-400'
							aria-hidden='true'
						/>

						<div className='flex-1'>
							<p className='text-sm font-medium text-red-300'>
								No se pudieron cargar los datos del panel
							</p>

							<p className='mt-1 text-xs text-slate-400'>{error}</p>

							<div className='mt-3'>
								<Button
									variant='secondary'
									size='sm'
									onClick={reload}>
									Reintentar
								</Button>
							</div>
						</div>
					</div>
				</Card>
			)}

			{!loading && !error && (
				<section aria-label='Resumen de actividad'>
					<div className='mb-4'>
						<h2 className='text-lg font-semibold text-slate-100'>
							Tu actividad
						</h2>
						<p className='mt-1 text-sm text-slate-400'>
							Consulta un resumen de tus documentos y recursos educativos.
						</p>
					</div>

					<div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
						{stats.map((stat) => (
							<StatCard
								key={stat.label}
								{...stat}
							/>
						))}
					</div>
				</section>
			)}

			<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
				<section
					className='space-y-4 lg:col-span-2'
					aria-label='Adaptaciones recientes'>
					<CardHeader
						title='Tus recursos recientes'
						action={
							<Link
								to='/history'
								className='text-sm text-brand-400 transition-colors hover:text-brand-300'>
								Ver historial →
							</Link>
						}
					/>

					{loading ? (
						<Card>
							<p className='text-sm text-slate-400'>Cargando tus recursos...</p>
						</Card>
					) : recentAdaptations.length === 0 ? (
						<Card>
							<div className='py-6 text-center'>
								<div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800'>
									<BookOpen
										className='h-6 w-6 text-slate-400'
										aria-hidden='true'
									/>
								</div>

								<h3 className='text-sm font-semibold text-slate-200'>
									Aquí aparecerán tus recursos
								</h3>

								<p className='mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-400'>
									Cuando generes tu primer recurso educativo, podrás volver a
									consultarlo desde esta sección.
								</p>

								<div className='mt-4'>
									<Link to='/new'>
										<Button
											variant='primary'
											size='sm'
											leftIcon={<PlusCircle className='h-4 w-4' />}>
											Crear mi primer recurso
										</Button>
									</Link>
								</div>
							</div>
						</Card>
					) : (
						<div className='space-y-3'>
							{recentAdaptations.map((adaptation) => (
								<AdaptationCard
									key={adaptation.id}
									adaptation={adaptation}
									onClick={() => handleAdaptationClick(adaptation)}
								/>
							))}
						</div>
					)}
				</section>

				<aside className='space-y-4'>
					<h2 className='text-lg font-semibold text-slate-100'>
						Accesos rápidos
					</h2>

					<Card className='flex flex-col gap-3'>
						<div className='flex items-start gap-3'>
							<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-400/10'>
								<PlusCircle
									className='h-5 w-5 text-brand-400'
									aria-hidden='true'
								/>
							</div>

							<div>
								<h3 className='text-sm font-semibold text-slate-200'>
									Nuevo recurso
								</h3>
								<p className='mt-1 text-xs leading-relaxed text-slate-400'>
									Carga un documento y elige cómo quieres transformar su
									contenido.
								</p>
							</div>
						</div>

						<Link
							to='/new'
							className='block'>
							<Button
								variant='primary'
								fullWidth
								leftIcon={<PlusCircle className='h-4 w-4' />}>
								Crear recurso
								<ArrowRight className='h-4 w-4' />
							</Button>
						</Link>

						<div className='my-1 border-t border-slate-700/70' />

						<div className='flex items-start gap-3'>
							<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10'>
								<History
									className='h-5 w-5 text-blue-400'
									aria-hidden='true'
								/>
							</div>

							<div>
								<h3 className='text-sm font-semibold text-slate-200'>
									Historial
								</h3>
								<p className='mt-1 text-xs leading-relaxed text-slate-400'>
									Encuentra y consulta tus adaptaciones anteriores.
								</p>
							</div>
						</div>

						<Link
							to='/history'
							className='block'>
							<Button
								variant='secondary'
								fullWidth
								leftIcon={<History className='h-4 w-4' />}>
								Ver mis recursos
							</Button>
						</Link>
					</Card>

					<div className='rounded-xl border border-slate-700/70 bg-slate-900/50 p-4'>
						<div className='flex items-center gap-2'>
							<Lightbulb
								className='h-5 w-5 text-amber-300'
								aria-hidden='true'
							/>
							<h3 className='text-sm font-semibold text-slate-200'>
								Aprende con confianza
							</h3>
						</div>

						<p className='mt-2 text-xs leading-relaxed text-slate-400'>
							Usa el contenido generado como apoyo para tu aprendizaje. Verifica
							los conceptos, datos y afirmaciones importantes en la fuente
							original.
						</p>
					</div>
				</aside>
			</div>
		</div>
	);
}
