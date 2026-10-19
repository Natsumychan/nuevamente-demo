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
} from "lucide-react";

import { Button } from "@/shared/ui/Button";
import { Card, CardHeader } from "@/shared/ui/Card";
import { AdaptationCard } from "@/entities/adaptation/ui/AdaptationCard";
import { documentsApi, adaptationsApi } from "@/shared/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

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
		.filter((score) => typeof score === "number" && !Number.isNaN(score));

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
			label: "Score promedio Critic",
			value: averageScore !== null ? `${Math.round(averageScore * 100)}%` : "—",
			icon: TrendingUp,
			color: "text-emerald-400",
			bg: "bg-emerald-400/10",
		},
	];
}

// ── Data hook ────────────────────────────────────────────────────────────────

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

				setError(
					err.message ?? "No se pudieron cargar los datos del dashboard.",
				);
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

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, bg }) {
	return (
		<Card className='flex flex-col gap-3'>
			<div
				className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
				<Icon className={`w-5 h-5 ${color}`} />
			</div>

			<div>
				<p className='text-2xl font-bold text-slate-50'>{value}</p>

				<p className='text-xs text-slate-500 mt-0.5'>{label}</p>
			</div>
		</Card>
	);
}

// ── Page ─────────────────────────────────────────────────────────────────────

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
		<div className='space-y-8 animate-fade-in'>
			{/* Hero header */}
			<div className='flex flex-col sm:flex-row sm:items-end justify-between gap-4'>
				<div>
					<div className='flex items-center gap-2 mb-2'>
						<div className='w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center'>
							<Cpu className='w-4 h-4 text-white' />
						</div>
					</div>

					<h1 className='page-title gradient-text'>NuevaMente</h1>

					<p className='text-slate-400 mt-1'>
						Sistema Inteligente de Adaptación y Generación de Contenido
						Educativo
					</p>
				</div>

				<Link to='/new'>
					<Button
						variant='primary'
						size='lg'
						leftIcon={<PlusCircle className='w-4 h-4' />}>
						Nueva Adaptación
					</Button>
				</Link>
			</div>

			{/* Error de carga */}
			{error && (
				<Card className='border border-red-500/20 bg-red-500/5'>
					<div className='flex items-start gap-3'>
						<div className='mt-0.5'>
							<FileText className='w-5 h-5 text-red-400' />
						</div>

						<div>
							<p className='text-sm font-medium text-red-300'>
								No se pudieron cargar los datos del dashboard
							</p>

							<p className='text-xs text-slate-400 mt-1'>{error}</p>
							<Button
								variant='secondary'
								size='sm'
								onClick={reload}>
								Reintentar
							</Button>
						</div>
					</div>
				</Card>
			)}

			{/* Stats */}
			{!loading && !error && (
				<div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
					{stats.map((stat) => (
						<StatCard
							key={stat.label}
							{...stat}
						/>
					))}
				</div>
			)}

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Recent adaptations */}
				<div className='lg:col-span-2 space-y-4'>
					<CardHeader
						title='Adaptaciones recientes'
						action={
							<Link
								to='/history'
								className='text-sm text-brand-400 hover:text-brand-300 transition-colors'>
								Ver todas →
							</Link>
						}
					/>

					{loading ? (
						<Card>
							<p className='text-sm text-slate-400'>Cargando adaptaciones...</p>
						</Card>
					) : recentAdaptations.length === 0 ? (
						<Card>
							<div className='text-center py-6'>
								<FileText className='w-8 h-8 text-slate-600 mx-auto mb-3' />

								<p className='text-sm font-medium text-slate-300'>
									Aún no hay adaptaciones
								</p>

								<p className='text-xs text-slate-500 mt-1'>
									Crea tu primera adaptación para verla aquí.
								</p>

								<Link
									to='/new'
									className='inline-block mt-4'>
									<Button
										variant='primary'
										size='sm'
										leftIcon={<PlusCircle className='w-4 h-4' />}>
										Crear adaptación
									</Button>
								</Link>
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
				</div>

				{/* Quick actions */}
				<div className='space-y-6'>
					{/* Quick actions */}
					<div>
						<p className='section-title mb-4'>Inicio rápido</p>

						<Card className='flex flex-col gap-3'>
							<p className='text-sm text-slate-400'>
								Cargá un documento técnico y seleccioná perfil, formato y nicho
								para generar contenido educativo adaptado.
							</p>

							<Link to='/new'>
								<Button
									variant='primary'
									fullWidth
									leftIcon={<PlusCircle className='w-4 h-4' />}>
									Crear adaptación
								</Button>
							</Link>

							<Link to='/history'>
								<Button
									variant='secondary'
									fullWidth
									leftIcon={<History className='w-4 h-4' />}>
									Ver historial
								</Button>
							</Link>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
