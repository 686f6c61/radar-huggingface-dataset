# Wenvia/Hyderabad_OCR

## Resumen

Arjuna-OCR [Te&En] es un sistema de OCR para documentos impresos en telugu e inglés, publicado por Wenvia bajo el identificador `Wenvia/Hyderabad_OCR`. No es un único modelo, sino un pipeline de tres modelos ONNX: un modelo de layout, un detector de texto y un reconocedor CTC telugu+inglés. El reconocedor es el trabajo original del autor; el layout y el detector se reutilizan sin cambios del proyecto previo `anandkaman/arjuna-ocr-kn-en` (kannada+inglés), validados sobre páginas en telugu antes de su reutilización.

El sistema está diseñado para ejecución exclusiva en CPU, sin GPU y sin modelo de lenguaje auxiliar, lo que lo hace adecuado para despliegues ligeros en entornos con recursos limitados. El reconocedor es un SVTRv2-B con adaptadores LoRA/ConvLoRA fusionados y una cabeza CTC de 206 clases, entrenado sobre un corpus sintético de aproximadamente 398 000 líneas con 53 tipografías, mezclado con líneas reales etiquetadas en proporción 0,85/0,15.

La relevancia actual del modelo reside en su enfoque en un idioma poco cubierto por los sistemas OCR comerciales (telugu, con más de 80 millones de hablantes) y en la publicación de métricas de error medidas sobre un conjunto de test congelado de libros no vistos durante el entrenamiento, algo poco habitual en modelos de OCR de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de tres modelos ONNX: layout (DocLayout-YOLO lineage), detector de texto (PP-OCRv6 lineage) y reconocedor SVTRv2-B con LoRA/ConvLoRA fusionados y cabeza CTC de 206 clases |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de reconocimiento de línea, no de contexto de tokens) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, sin variantes cuantizadas publicadas) |
| Idiomas soportados | telugu (te) e inglés (en) |
| Licencia | Apache-2.0 para el reconocedor y `predict_te.py`; AGPL-3.0 para el modelo de layout |
| Formato de pesos | ONNX (`models/rec/arjuna_rec_te.onnx`, `models/det/inference.onnx`, `models/layout/arjuna_layout_v15.onnx`) |
| Tamano del repositorio | 0,2 GB |
| Libreria de inferencia | onnxruntime |
| Pipeline declarado | image-to-text |

## Arquitectura y entrenamiento

El reconocedor es un SVTRv2-B con adaptadores LoRA y ConvLoRA fusionados en los pesos base, seguido de una cabeza CTC de 206 clases. El entrenamiento combina un corpus sintético de telugu+inglés de aproximadamente 398 000 líneas generadas con 53 tipografías, mezclado con líneas reales de libros etiquetadas en una proporción 0,85/0,15. Las imágenes de entrenamiento se renderizan desde un punto de vista de 150 DPI y cada recorte se normaliza a 32 píxeles de alto. El modelo de layout cubre 15 clases y proviene de la línea DocLayout-YOLO; el detector de texto pertenece a la línea PP-OCRv6. Ambos se reutilizan del release de kannada+inglés y se validaron sobre páginas en telugu antes de su reutilización.

La innovación técnica principal es la combinación de un reconocedor CTC ligero con adaptadores LoRA fusionados, lo que permite un modelo compacto que se ejecuta en CPU sin dependencia de un modelo de lenguaje para corrección posterior. El pipeline completo (layout, detección, orden de lectura, tablas y salida en Markdown/hOCR/ALTO) se distribuye a través del paquete `arjuna-ocr`, mientras que `predict_te.py` reproduce exactamente la ruta de inferencia evaluada para recortes de línea individuales.

## Capacidades

- Reconocimiento de texto impreso en telugu e inglés sobre recortes de línea, con normalización de recortes a 32 píxeles de alto.
- Análisis de layout de página con 15 clases (bloques de texto, tablas, figuras, etc.) mediante el modelo de layout.
- Detección de regiones de texto en página completa mediante el detector PP-OCRv6.
- Orden de lectura y reconstrucción de tablas en la salida del runtime completo.
- Generación de salida en formatos Markdown, hOCR y ALTO a través del paquete `arjuna-ocr`.
- Inferencia en CPU exclusivamente, sin GPU ni modelo de lenguaje.
- Procesamiento por lotes de recortes con salida JSON (`predict_te.py crops/*.png --json`).
- Manejo de dígitos ASCII con una precisión del 98,5 % y sin descartes en el conjunto de test.

## Casos de uso

- Digitalización de libros y publicaciones en telugu: el pipeline completo permite procesar páginas escaneadas, detectar bloques de texto y extraer el contenido en Markdown u hOCR, adecuado para bibliotecas digitales y archivos que necesitan preservar textos en telugu sin depender de servicios OCR comerciales.
- Extracción de texto de documentos administrativos bilingües telugu-inglés: el reconocedor maneja ambos idiomas en la misma línea, lo que resulta útil en formularios, notificaciones y documentos oficiales de la India con mezcla de scripts.
- Procesamiento de recortes de línea en pipelines de document AI: `predict_te.py` acepta recortes de línea y devuelve texto con salida JSON, lo que facilita su integración en flujos existentes de preprocesado y postprocesado.
- Indexación y búsqueda de contenido en corpus de libros en telugu: la salida estructurada (Markdown/hOCR/ALTO) permite alimentar motores de búsqueda o sistemas de recuperación de información sobre textos previamente no digitalizados.
- Automatización de la extracción de tablas en informes y documentos técnicos: el modelo de layout de 15 clases identifica regiones de tabla y el runtime reconstruye su estructura, útil para digitalizar informes financieros o técnicos bilingües.
- Despliegue en entornos sin GPU: al ejecutarse exclusivamente en CPU con onnxruntime, el sistema puede desplegarse en servidores modestos, contenedores sin aceleración o dispositivos de borde donde no hay acceso a GPU.
- Preservación de patrimonio documental en telugu: la combinación de detector y reconocedor validados sobre páginas reales permite procesar colecciones de libros antiguos escaneados a 150 DPI o superior.

## Benchmarks y rendimiento

Conjunto de test congelado de 200 recortes de línea reales procedentes de 12 libros no vistos durante el entrenamiento:

| Slice | Lineas | CER | Precision de caracteres | Lineas totalmente correctas |
|---|---|---|---|---|
| Todas | 200 | 3,95 | 96,05 % | 48,0 % |
| Telugu | 168 | 4,13 | 95,87 % | 38,1 % |
| Inglés | 9 | 0,00 | 100,00 % | 100,0 % |
| 24–32 px | 81 | 3,43 | 96,57 % | 40,7 % |
| 32–48 px | 83 | 3,98 | 96,02 % | 53,0 % |
| 48+ px | 30 | 6,66 | 93,34 % | 50,0 % |

Debilidades medidas por el autor:

| Debilidad | Dato medido |
|---|---|
| Palabras aisladas | 89,1 % de precisión de caracteres frente a 96,4 % en líneas de 4–7 palabras |
| Espaciado | 28 % de todas las operaciones de edición son solo espaciado |
| Números en telugu | Una línea solo de dígitos a veces se emite vacía (n=3 en el test); los dígitos ASCII tienen 98,5 % de precisión sin descartes |
| Pares visualmente similares | `ద/డ`, `వ/ప`, `స/న` son las sustituciones más frecuentes |

Nota del autor: la cifra de inglés se basa en 9 líneas y 209 caracteres, insuficiente para afirmar una precisión de inglés; el conjunto sintético de validación en inglés (419 líneas, ~95 % de precisión por línea) no ha transferido a páginas reales en este proyecto. La evaluación con lotes con padding da 4,08 de CER frente a 3,95 con un recorte a la vez, que es la ruta que reproduce `predict_te.py`.

## Requisitos de hardware

- VRAM estimada: no aplica; el sistema está diseñado para ejecución exclusiva en CPU con onnxruntime.
- GPU recomendadas: no aplica; no requiere GPU.
- Compatibilidad con GPU de consumo: no aplica; no se ejecuta en GPU por diseño.
- Opciones de despliegue: onnxruntime (CPU), paquete `arjuna-ocr` para el pipeline completo de página, `predict_te.py` para recortes de línea. Dependencias: `onnxruntime` y `opencv-python-headless`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Tamano del repositorio: 0,2 GB, lo que permite su despliegue en entornos con almacenamiento limitado.

## Comparativa con modelos similares

| Modelo | Idiomas | Arquitectura | Licencia | Contexto / alcance | Notas |
|---|---|---|---|---|---|
| Wenvia/Hyderabad_OCR (Arjuna-OCR Te&En) | telugu, inglés | Pipeline ONNX: layout + detector + SVTRv2-B CTC | Apache-2.0 (reconocedor y script); AGPL-3.0 (layout) | Recortes de línea y páginas completas vía runtime | CPU only, sin modelo de lenguaje |
| anandkaman/arjuna-ocr-kn-en | kannada, inglés | Pipeline ONNX con detector y layout reutilizados | no disponible | Recortes de línea y páginas completas | Origen del detector y layout reutilizados; el reconocedor es distinto |
| Tesseract OCR | más de 100 idiomas, incluido telugu | LSTM + motor de segmentación | Apache-2.0 | Páginas completas | No disponible comparación de métricas en la información proporcionada |
| PaddleOCR | multilingüe, incluido telugu | PP-OCR (detector + reconocedor) | Apache-2.0 | Páginas completas | El detector de este modelo pertenece a la línea PP-OCRv6; no disponible comparación de métricas |

No se han publicado resultados de benchmarks comparativos con estos modelos en la información disponible.

## Limitaciones y advertencias

- El reconocedor está entrenado exclusivamente para telugu e inglés; no cubre otros idiomas ni scripts.
- Las palabras aisladas rinden notablemente peor (89,1 % de precisión de caracteres) que las líneas con contexto (96,4 %), por lo que el modelo no es adecuado para reconocimiento de tokens sueltos.
- El 28 % de las operaciones de edición corresponden solo a espaciado; algunas líneas perfectamente legibles puntúan como error por este motivo.
- Las líneas compuestas únicamente por dígitos en telugu pueden emitirse vacías en algunos casos (n=3 en el test).
- Existen confusiones sistemáticas entre pares de caracteres visualmente similares: `ద/డ`, `వ/ప`, `స/న`.
- La cifra de precisión en inglés (100 % sobre 9 líneas) no es evidencia suficiente; el autor lo advierte explícitamente.
- El modelo de layout se distribuye bajo AGPL-3.0, lo que impone obligaciones de copyleft si se usa en un servicio en red; el reconocedor y el detector son Apache-2.0 y funcionan sin el layout.
- No hay datos publicados sobre sesgos demográficos o de dominio; el entrenamiento se basa en un corpus sintético con 53 tipografías y líneas reales de libros, lo que puede limitar la generalización a otros tipos de documento (formularios, manuscritos, prensa).
- No se han publicado resultados de benchmarks comparativos con otros sistemas OCR en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero el CTC puede producir sustituciones de caracteres en pasajes degradados o de baja resolución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wenvia/Hyderabad_OCR
- Modelo de origen del detector y layout (kannada+inglés): https://huggingface.co/anandkaman/arjuna-ocr-kn-en
- Contacto del autor: kamananand98@gmail.com
