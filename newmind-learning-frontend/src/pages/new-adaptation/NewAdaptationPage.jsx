import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	UploadCloud,
	Settings,
	Lightbulb,
	FileText,
	CircleHelp,
	LoaderCircle,
	CheckCircle2,
} from "lucide-react";

import { DocumentUploader } from "@/widgets/document-uploader/DocumentUploader";
import { AdaptationForm } from "@/widgets/adaptation-form/AdaptationForm";
import { documentsApi, adaptationsApi } from "@/shared/api";
import { Card } from "@/shared/ui/Card";
import { Alert } from "@/shared/ui/Alert";
import { cn } from "@/shared/utils";

// ── Ayuda contextual reutilizable ────────────────────────────────────────────

function ContextHelp({ title, children, icon: Icon = Lightbulb }) {
	return (
		<aside className='flex gap-3 rounded-xl border border-slate-700/70 bg-slate-800/40 p-4'>
			<div className='shrink-0 text-brand-400'>
				<Icon
					className='h-5 w-5'
					aria-hidden='true'
				/>
			</div>

			<div className='min-w-0'>
				<p className='text-sm font-semibold text-slate-200'>{title}</p>
				<div className='mt-1 text-sm leading-relaxed text-slate-400'>
					{children}
				</div>
			</div>
		</aside>
	);
}

// ── Indicador de pasos ────────────────────────────────────────────────────────

function StepHeader({ number, icon: Icon, title, subtitle, active }) {
	return (
		<div className='mb-5 flex items-center gap-3'>
			<div
				className={cn(
					"flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-all",
					active
						? "border-brand-600/30 bg-brand-600/20 text-brand-400"
						: "border-slate-700 bg-slate-800 text-slate-600",
				)}>
				{number}
			</div>

			<div>
				<p
					className={cn(
						"flex items-center gap-2 font-semibold transition-colors",
						active ? "text-slate-200" : "text-slate-500",
					)}>
					<Icon
						className='h-4 w-4'
						aria-hidden='true'
					/>
					{title}
				</p>
				<p className='text-xs text-slate-500'>{subtitle}</p>
			</div>
		</div>
	);
}

// ── Lógica de carga del documento ─────────────────────────────────────────────

function useDocumentUpload() {
	const [uploading, setUploading] = useState(false);
	const [uploadedDoc, setUploadedDoc] = useState(null);
	const [uploadError, setUploadError] = useState(null);

	const handleFileSelect = async (file) => {
		setUploadError(null);
		setUploading(true);

		try {
			const document = await documentsApi.upload(file);
			setUploadedDoc(document);
		} catch (err) {
			setUploadedDoc(null);
			setUploadError(
				err.message ?? "Error al subir el archivo. Intentá de nuevo.",
			);
		} finally {
			setUploading(false);
		}
	};

	return { uploading, uploadedDoc, uploadError, handleFileSelect };
}

function formatCreationError(error) {
	const detail =
		error instanceof Error && error.message ? ` Detalle: ${error.message}` : "";

	return `No pudimos iniciar la generación.${detail} Revisa tu conexión e intentá de nuevo.`;
}

// ── Página ────────────────────────────────────────────────────────────────────

export function NewAdaptationPage() {
	const navigate = useNavigate();

	const { uploading, uploadedDoc, uploadError, handleFileSelect } =
		useDocumentUpload();

	const [generating, setGenerating] = useState(false);
	const [globalError, setGlobalError] = useState(null);

	const handleGenerate = async (formValues) => {
		if (!uploadedDoc) {
			setGlobalError("Primero cargá un documento.");
			return;
		}

		setGlobalError(null);
		setGenerating(true);

		try {
			const adaptation = await adaptationsApi.create({
				documentId: uploadedDoc.id,
				...formValues,
			});

			navigate(`/result/${adaptation.id}`, {
				state: { adaptation },
			});
		} catch (err) {
			setGlobalError(formatCreationError(err));
		} finally {
			setGenerating(false);
		}
	};

	return (
		<div className='mx-auto max-w-3xl space-y-8 animate-fade-in'>
			{/* Volver */}
			<Link
				to='/'
				className='btn-ghost inline-flex items-center gap-1.5 text-sm'>
				<ArrowLeft
					className='h-4 w-4'
					aria-hidden='true'
				/>
				Volver al dashboard
			</Link>

			{/* Encabezado */}
			<div>
				<h1 className='page-title'>Nueva Adaptación</h1>
				<p className='mt-1 text-slate-400'>
					Cargá tu documento y configurá los parámetros de adaptación educativa.
				</p>
			</div>

			{/* Error general */}
			{globalError && <Alert variant='error'>{globalError}</Alert>}

			{/* Paso 1: cargar documento */}
			<Card>
				<StepHeader
					number={1}
					icon={UploadCloud}
					title='Cargar documento'
					subtitle='PDF, Markdown o TXT · máx. 20 MB'
					active
				/>

				<div className='space-y-4'>
					<ContextHelp
						title='¿Qué documento puedes cargar?'
						icon={FileText}>
						<p>
							Seleccioná un archivo PDF, Markdown o TXT de hasta 20 MB.
							Considera usar documentos con texto legible y relacionado con el
							tema que querés estudiar.
						</p>
						<p className='mt-2'>
							Antes de continuar, verifica que el documento sea el correcto y
							que contenga la información que necesitas trabajar.
						</p>
					</ContextHelp>

					<DocumentUploader
						onFileSelect={handleFileSelect}
						uploading={uploading}
						error={uploadError}
						success={!!uploadedDoc}
					/>

					{/* Ayuda específica si falla la carga */}
					{uploadError && (
						<ContextHelp
							title='¿Cómo puedes resolverlo?'
							icon={CircleHelp}>
							Verifica el formato y el tamaño del archivo. Si el problema
							continúa, intenta nuevamente y revisa tu conexión.
						</ContextHelp>
					)}

					{/* Estado de carga */}
					{uploading && (
						<div
							role='status'
							aria-live='polite'
							className='flex items-center gap-2 text-sm text-slate-400'>
							<LoaderCircle className='h-4 w-4 animate-spin' />
							Estamos cargando tu documento. Espera a que termine el proceso.
						</div>
					)}

					{/* Confirmación de carga */}
					{uploadedDoc && !uploading && (
						<div
							role='status'
							className='flex items-start gap-2 text-sm text-emerald-400'>
							<CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0' />
							<p>
								<span className='font-medium'>{uploadedDoc.title}</span> está
								listo para procesar. Ya puedes configurar tu recurso.
							</p>
						</div>
					)}
				</div>
			</Card>

			{/* Paso 2: configurar adaptación */}
			<Card>
				<StepHeader
					number={2}
					icon={Settings}
					title='Configurar adaptación'
					subtitle='Perfil, formato, nicho y nivel de detalle'
					active={!!uploadedDoc}
				/>

				{uploadedDoc ? (
					<div className='space-y-4'>
						<ContextHelp title='Personaliza tu recurso educativo'>
							Elige las opciones del formulario según tu objetivo de
							aprendizaje. Tener en cuenta a quién va dirigido el recurso, el
							formato que te resulte más útil y el nivel de detalle que
							necesitas.
						</ContextHelp>

						<AdaptationForm
							onSubmit={handleGenerate}
							loading={generating}
						/>

						{/* Estado visible durante la generación */}
						{generating && (
							<div
								role='status'
								aria-live='polite'
								className='flex items-start gap-3 rounded-xl border border-brand-600/30 bg-brand-600/10 p-4'>
								<LoaderCircle className='mt-0.5 h-5 w-5 shrink-0 animate-spin text-brand-400' />
								<div>
									<p className='text-sm font-semibold text-slate-200'>
										Estamos preparando tu recurso
									</p>
									<p className='mt-1 text-sm text-slate-400'>
										Espera mientras NuevaMente procesa la solicitud. Evita
										enviar el formulario nuevamente durante este proceso.
									</p>
								</div>
							</div>
						)}
					</div>
				) : (
					<div className='space-y-4'>
						<p className='py-2 text-center text-sm text-slate-500'>
							Primero carga un documento para habilitar este paso.
						</p>

						<ContextHelp title='¿Por qué debo cargar un documento primero?'>
							NuevaMente necesita un documento de referencia para generar un
							recurso basado en el contenido que queries trabajar. Cuando termine
							la carga, puedes configurar la adaptación.
						</ContextHelp>
					</div>
				)}
			</Card>

			{/* Recordatorio final */}
			{uploadedDoc && !generating && (
				<ContextHelp title='Un consejo antes de comenzar'>
					Después de generar el recurso, revisa el contenido y contrasta los
					datos importantes con el documento original. Las métricas de similitud
					ayudan a interpretar la recuperación de información, pero no
					garantizan por sí solas que el contenido sea correcto.
				</ContextHelp>
			)}
		</div>
	);
}
