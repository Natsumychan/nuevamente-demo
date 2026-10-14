# Corpus cloud autorizado para ingesta

Este corpus sintético original permite verificar la extracción y la trazabilidad
sin un bucket OCI activo. Cubre redes cloud, identidades de cargas de trabajo,
almacenamiento de documentos, gestión de incidentes y políticas de retención
ilustrativas.

## Comprobación rápida

Desde el directorio del backend, con sus dependencias existentes instaladas:

```bash
python -B -m pytest tests/test_cloud_corpus.py -q -p no:cacheprovider
```

Las pruebas envían solicitudes multipart a la ruta pública
`POST /api/v1/documents`. Usan el extractor canónico y el segmentador reales,
pero simulan el índice vectorial y el almacenamiento en memoria mediante una
aplicación FastAPI aislada. No importan `main` ni inicializan clientes OCI o Chroma;
tampoco descargan embeddings ni requieren credenciales cloud. No se agregan dependencias
de ejecución ni se modifica el extractor de producción.

## Documentos y expectativas

Solo los archivos enumerados en [`manifest.json`](manifest.json) son documentos
del corpus. No se deben cargar el manifiesto, la declaración de autorización
ni este README como muestras.

| Documento | Cobertura | Orden de lectura esperado |
| --- | --- | --- |
| `cloud-networking.md` | Encabezados, párrafos, viñetas, bloque de código, Unicode | Conservar el orden y la sintaxis del Markdown original. |
| `cloud-operations.txt` | Lista de operaciones, BOM UTF-8, acento descompuesto, líneas vacías repetidas | Eliminar el BOM, normalizar Unicode a NFC y reducir líneas vacías repetidas. |
| `cloud-retention-table.pdf` | Tabla de una página con bordes visibles y celdas de varias palabras | Título; encabezados de izquierda a derecha; filas de izquierda a derecha, de arriba abajo. |
| `cloud-network-columns.pdf` | Documento de una página con dos columnas separadas | Título; columna izquierda completa de arriba abajo; después la columna derecha completa. |

Cada entrada del manifiesto declara procedencia, autorización de uso, SHA-256
de los bytes originales, tipo MIME/formato, texto normalizado esperado completo,
extractor y número de páginas esperado. Las entradas de disposición de los PDF
declaran además secciones ordenadas o relaciones entre encabezados, filas y
valores. Las expectativas se redactan explícitamente; no se generan a partir
de la salida del extractor durante las pruebas.

Los PDF son archivos PDF 1.4 sin compresión, con texto Helvetica, codificación
WinAnsi para conservar los acentos y coordenadas de disposición explícitas.
La tabla tiene tres columnas; sus períodos de retención son datos educativos,
no recomendaciones de política. No requieren OCR. Los bytes de los PDF no deben
sufrir conversión de saltos de línea en Git; el archivo `.gitattributes` local
los preserva.

## Procedencia y límites

[`AUTHORIZATION.md`](AUTHORIZATION.md) registra la autoría sintética original
y la autorización únicamente para estos cuatro documentos. No se asignan
procedencia, licencia ni permisos a las muestras anteriores fuera de este
directorio.

Las pruebas nombradas comparan el contenido extraído completo y la estructura
normalizada, verifican metadatos HTTP y trazabilidad de origen en los segmentos,
y vinculan los bytes originales almacenados con los hashes del manifiesto.
La autorización de origen se conserva como metadato del corpus; no cambian la
API pública ni el contrato de documento normalizado.

Los casos de rechazo cubren TXT/MD/PDF vacíos, contenido formado solo por espacios
o BOM, PDF corruptos o sin texto, UTF-8 inválido y entrada UTF-16. Un documento
ingerido previamente, sus segmentos, sus bytes originales y sus respuestas
públicas deben permanecer sin cambios tras cada rechazo. El PDF sin texto
reutiliza la muestra de error de ingesta existente; no forma parte del corpus
representativo. Los mensajes de error existentes de la API se comprueban sin
traducirlos para preservar el contrato.

Estas pruebas demuestran el rechazo de entradas inválidas, no la reversión
coordinada entre almacenes tras un fallo posterior de indexación o almacenamiento.
Tampoco demuestran persistencia OCI real, fidelidad de cualquier disposición PDF,
soporte OCR ni rendimiento para más de 30 páginas. Esos aspectos quedan fuera
de la incidencia #60. Un bucket suspendido no impide estas comprobaciones.
