import { jsPDF } from "jspdf";

const PAGE = {
  margin: 18,
  width: 210,
  height: 297,
};

function cleanText(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  return "";
}

function safeFilename(value) {
  const name = cleanText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return name || "resultado-nuevamente";
}

function getContent(adaptation) {
  return (
    adaptation?.content ??
    adaptation?.officialResponse?.contenido_adaptado ??
    {}
  );
}

function getMetadata(adaptation) {
  return (
    adaptation?.officialResponse?.metadatos ??
    {}
  );
}

function getItems(content) {
  return Array.isArray(content?.items) ? content.items : [];
}

export function exportAdaptationPdf(adaptation) {
  if (!adaptation || adaptation.status !== "completed") {
    throw new Error(
      "Solo puedes exportar adaptaciones completadas."
    );
  }

  const content = getContent(adaptation);
  const metadata = getMetadata(adaptation);
  const items = getItems(content);

  const title =
    cleanText(content.titulo) ||
    cleanText(adaptation.documentTitle) ||
    "Contenido adaptado";

  const format = cleanText(adaptation.format) || "Material de estudio";

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let y = PAGE.margin;

  function ensureSpace(height = 8) {
    if (y + height > PAGE.height - PAGE.margin) {
      doc.addPage();
      y = PAGE.margin;
    }
  }

  function addText(
    value,
    {
      size = 10,
      bold = false,
      color = [45, 55, 72],
      indent = 0,
      gap = 3,
    } = {}
  ) {
    const text = cleanText(value);
    if (!text) return;

    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);

    const maxWidth =
      PAGE.width - PAGE.margin * 2 - indent;

    const lines = doc.splitTextToSize(text, maxWidth);
    const lineHeight = size * 0.45;

    ensureSpace(lines.length * lineHeight + gap);

    doc.text(lines, PAGE.margin + indent, y);
    y += lines.length * lineHeight + gap;
  }

  function addHeading(value) {
    ensureSpace(14);
    y += 2;

    addText(value, {
      size: 13,
      bold: true,
      color: [0, 67, 156],
      gap: 4,
    });
  }

  function addLabelValue(label, value) {
    const text = cleanText(value);
    if (!text) return;

    addText(`${label}: ${text}`, {
      size: 9,
      color: [75, 85, 99],
      gap: 2,
    });
  }

  function addBullet(value) {
    const text = cleanText(value);
    if (!text) return;

    addText(`• ${text}`, {
      size: 10,
      indent: 3,
      gap: 3,
    });
  }

  // Encabezado del documento
  doc.setFillColor(0, 67, 156);
  doc.rect(0, 0, PAGE.width, 8, "F");

  addText("NUEVAMENTE | MATERIAL DE APRENDIZAJE", {
    size: 9,
    bold: true,
    color: [0, 67, 156],
    gap: 5,
  });

  addText(title, {
    size: 19,
    bold: true,
    color: [30, 41, 59],
    gap: 5,
  });

  addLabelValue("Formato", format);
  addLabelValue("Documento de origen", adaptation.documentTitle);
  addLabelValue("Perfil destinatario", adaptation.profile);
  addLabelValue("Sector", adaptation.industry);
  addLabelValue("Nivel de detalle", adaptation.detailLevel);

  const introduction =
    content.introduccion_contextualizada ??
    content.introduccion ??
    content.introduction;

  if (introduction) {
    addHeading("Introducción");
    addText(introduction, { size: 11, gap: 4 });
  }

  // Tutorial
  if (format === "Tutorial") {
    addHeading("Pasos del tutorial");

    items.forEach((item, index) => {
      addHeading(
        cleanText(item.titulo_paso) || `Paso ${index + 1}`
      );

      addText(item.descripcion);

      if (item.comando_o_codigo) {
        addText("Comando o código:", { bold: true });
        addText(item.comando_o_codigo, {
          size: 9,
          color: [30, 41, 59],
        });
      }

      if (item.verificacion) {
        addText(`Verificación: ${item.verificacion}`);
      }

      if (item.pista_didactica) {
        addText(`Pista: ${item.pista_didactica}`, {
          color: [146, 64, 14],
        });
      }
    });
  }

  // Resumen ejecutivo
  else if (format === "Resumen Ejecutivo") {
    addHeading("Resumen ejecutivo");

    if (content.summary) {
      addText(content.summary);
    }

    items.forEach((item) => {
      addHeading(item.seccion || "Sección");
      addText(item.contenido);

      if (item.pista_didactica) {
        addText(`Pista didáctica: ${item.pista_didactica}`, {
          color: [146, 64, 14],
        });
      }
    });

    if (Array.isArray(content.key_points)) {
      addHeading("Puntos clave");
      content.key_points.forEach(addBullet);
    }

    if (Array.isArray(content.risks)) {
      addHeading("Riesgos");
      content.risks.forEach(addBullet);
    }
  }

  // Quiz
  else if (format === "Quiz") {
    addHeading("Preguntas de evaluación");

    items.forEach((item, index) => {
      addHeading(
        `Pregunta ${index + 1}: ${item.pregunta || ""}`
      );

      (Array.isArray(item.opciones) ? item.opciones : [])
        .forEach(addBullet);

      if (item.pista_didactica) {
        addText(`Pista: ${item.pista_didactica}`, {
          color: [146, 64, 14],
        });
      }
    });

    const answeredItems = items.filter(
      (item) => item.respuesta_correcta
    );

    if (answeredItems.length > 0) {
      doc.addPage();
      y = PAGE.margin;

      addHeading("Clave de respuestas");

      answeredItems.forEach((item, index) => {
        addText(
          `${index + 1}. ${item.respuesta_correcta}`,
          { bold: true }
        );

        if (item.justificacion_didactica) {
          addText(
            `Justificación: ${item.justificacion_didactica}`
          );
        }
      });
    }
  }

  // Flashcards
  else if (format === "Flashcards") {
    addHeading("Tarjetas de estudio");

    items.forEach((item, index) => {
      addHeading(`Tarjeta ${index + 1}`);

      addText("Frente:", { bold: true });
      addText(item.frente);

      addText("Reverso:", { bold: true });
      addText(item.dorso);

      if (item.pista_didactica) {
        addText(`Pista didáctica: ${item.pista_didactica}`, {
          color: [146, 64, 14],
        });
      }
    });
  }

  // Guion y otros contenidos estructurados
  else {
    if (items.length > 0) {
      addHeading("Contenido");

      items.forEach((item, index) => {
        addHeading(
          item.seccion ||
          item.titulo ||
          item.titulo_paso ||
          `Sección ${index + 1}`
        );

        addText(
          item.contenido ??
          item.descripcion ??
          item.texto ??
          ""
        );

        if (item.pista_didactica) {
          addText(`Pista: ${item.pista_didactica}`);
        }

        if (item.comando_o_codigo) {
          addText(item.comando_o_codigo, { size: 9 });
        }
      });
    } else {
      addText(
        content.contenido ??
        content.descripcion ??
        content.summary ??
        "No hay contenido estructurado disponible para exportar."
      );
    }
  }

  // Conceptos clave procedentes de los metadatos
  if (Array.isArray(metadata.conceptos_clave) &&
      metadata.conceptos_clave.length > 0) {
    addHeading("Conceptos clave");
    metadata.conceptos_clave.forEach(addBullet);
  }

  // Numeración de páginas
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);

    doc.text(
      `NuevaMente · Página ${page} de ${pageCount}`,
      PAGE.width / 2,
      PAGE.height - 8,
      { align: "center" }
    );
  }

  doc.save(`${safeFilename(title)}.pdf`);
}
