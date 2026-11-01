# Vibrant8849/PaperVoice

## Resumen

PaperVoice es un repositorio de pesos que agrupa el conjunto de modelos necesario para el funcionamiento de PaperVoice, una aplicación de escritorio de código abierto para leer y escuchar artículos científicos en PDF de forma totalmente offline sobre CPU. No se trata de un único modelo de lenguaje, sino de un pipeline multimodal compuesto por seis componentes especializados: detección de layout de página, OCR, reconocimiento de fórmulas matemáticas a LaTeX, reconocimiento de estructura de tablas y un motor de voz neuronal basado en Kokoro-82M (StyleTTS 2).

El repositorio lo mantiene el usuario Vibrant8849 y da soporte a la versión v2.0.0 de la aplicación, publicada en GitHub. Su función principal es servir como origen de descarga verificable: la aplicación descarga automáticamente estos pesos en el primer arranque y valida cada archivo contra los checksums SHA-256 publicados en la model card. El tamaño total del repositorio es de 1,7 GB.

La relevancia de este repositorio reside en su enfoque de despliegue: todos los modelos están convertidos a ONNX y optimizados para inferencia en CPU, con un factor de tiempo real (RTF) de 0,313 a 0,447 en un Intel Core i5 de cuatro núcleos, lo que lo hace apto para equipos sin GPU. La licencia agregada se declara como "other", aunque los componentes upstream son Apache-2.0 y CDLA-Permissive-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multimodal: RT-DETR (layout), PP-OCRv6 (OCR), PP-FormulaNet+ S (fórmulas), TableFormer (tablas), StyleTTS 2 (voz) |
| Parametros totales | No disponible como cifra agregada; Kokoro-82M: 82M; PP-FormulaNet+ S: ~58M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; procesa páginas y cláusulas de 130 caracteres para TTS) |
| Tipos de cuantizacion | No disponible; pesos en ONNX (fp32/fp16 no especificado) |
| Idiomas soportados | Inglés (en) |
| Licencia | other (componentes upstream: Apache-2.0 y CDLA-Permissive-2.0) |
| Formato de pesos | ONNX, tokenizer.json, bin (embeddings de voz), dll (operador custom) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios: redistribuye pesos ya entrenados por terceros, convertidos a ONNX. El motor de layout es Docling Heron RT-DETR, un detector de objetos de página que identifica párrafos, encabezados, tablas y matemáticas en bloque, con preprocesado en NumPy puro. El OCR emplea PP-OCRv6 small junto con un clasificador de dirección de RapidOCR para documentos escaneados. El reconocimiento de fórmulas usa PP-FormulaNet+ S, que convierte recortes de página a LaTeX con aproximadamente 58M de parámetros y se declara unas 50 veces más rápido en CPU que CodeFormulaV2. La estructura de tablas se recupera con TableFormer Fast, que devuelve la rejilla de filas y columnas y las coordenadas de celda.

El motor de voz es Kokoro-82M v1.0, basado en la arquitectura StyleTTS 2, con 82M de parámetros y salida a 24 kHz. Se distribuyen tres variantes ONNX: la base, una acelerada con STFT Conv1D (378 ms más rápida por frase) y una con 48 activaciones periódicas Snake fusionadas, que alcanza 1,99 s de latencia por frase y RTF 0,313. Incluye un operador C++ personalizado (snake_op.dll) con AVX2/FMA enlazado estáticamente para ONNX Runtime en Windows, sin dependencias externas. Los embeddings de estilo de voz se almacenan en voices-v1.0.bin.

## Capacidades

- Detección de layout de página en PDF científicos: párrafos, encabezados de sección, tablas y matemáticas en bloque.
- OCR de documentos escaneados con detección y reconocimiento de texto y clasificación de orientación.
- Reconocimiento de fórmulas matemáticas a LaTeX desde recortes de página.
- Reconstrucción de estructura de tablas académicas: rejilla fila-columna y coordenadas de celda.
- Síntesis de voz neuronal en inglés a 24 kHz con prosodia natural y múltiples personalidades de voz (af_heart, entre otras).
- Resaltado palabra a palabra sincronizado con el audio (read-along) mediante la app PaperVoice.
- Narración de fórmulas matemáticas.
- Funcionamiento 100% offline en CPU, sin dependencia de GPU ni de servicios en la nube.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo de lenguaje.

## Casos de uso

- Lectura accesible de artículos científicos: la aplicación convierte un PDF en audio narrado con resaltado palabra a palabra, útil para investigadores con discapacidad visual o para consumo en movilidad.
- Digitalización de PDF escaneados: el componente OCR de RapidOCR extrae el texto de páginas sin capa de texto, permitiendo su posterior narración y búsqueda.
- Extracción de fórmulas a LaTeX: PP-FormulaNet+ S permite recuperar expresiones matemáticas de papers para reutilizarlas en documentos LaTeX o cuadernos de cálculo.
- Reconstrucción de tablas académicas: TableFormer Fast recupera la estructura de tablas complejas para exportarlas a formatos tabulares y facilitar su análisis.
- Estudio en entornos sin conectividad: al ejecutarse íntegramente en CPU y de forma offline, es adecuado para laboratorios aislados, docencia sin red o equipos de bajos recursos.
- Integración en pipelines de accesibilidad documental: los componentes ONNX pueden invocarse de forma independiente desde Python u otros runtimes para generar audiolibros técnicos o índices estructurados de repositorios de papers.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al rendimiento de inferencia en CPU, no a benchmarks de calidad de tarea:

| Metrica | Valor |
|---|---|
| Time-to-first-sound (TTFS) | 3,28 s – 4,79 s (streaming en cláusulas de 130 caracteres) |
| Real-time factor (RTF) | 0,313 – 0,447 (más de 2,2 veces más rápido que tiempo real) |
| Uso de CPU | 25% (2 hilos intra-op dedicados) |
| Fidelidad acústica | Correlación de forma de onda r = 1,000000; SNR > 95 dB |
| Latencia por frase (fused_snake) | 1,99 s |
| Aceleración de PP-FormulaNet+ S | ~50× frente a CodeFormulaV2 en CPU |
| Mejora de kokoro-v1.0.fast | 378 ms más rápido por frase |
| Hardware de referencia | Intel Core i5, 4 núcleos |

No se han publicado resultados de benchmarks de calidad (por ejemplo, exactitud de OCR, tasa de acierto en LaTeX o MOS de voz) en la información disponible.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU ni VRAM dedicada.
- Hardware de referencia: Intel Core i5 de cuatro núcleos, con 2 hilos intra-op dedicados y uso de CPU del 25%.
- El operador snake_op.dll requiere AVX2/FMA y está compilado para Windows; en otras plataformas debe usarse la variante base o fast.
- Espacio en disco: 1,7 GB para el repositorio completo; los pesos se descargan en el primer arranque.
- Despliegue mediante ONNX Runtime; la aplicación PaperVoice gestiona la descarga y verificación SHA-256 de cada archivo.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, al no tratarse de un modelo de lenguaje.
- Throughput estimado: RTF de 0,313 a 0,447, es decir, entre 2,2 y 3,2 veces más rápido que el tiempo real de reproducción del audio generado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaperVoice (este repo) | Pipeline PDF + TTS en CPU | No agregado (Kokoro 82M, FormulaNet ~58M) | No aplica | other | HuggingFace, 0 descargas |
| hexgrad/Kokoro-82M | TTS neuronal | 82M | No aplica | Apache-2.0 | HuggingFace, muy popular |
| docling-project/docling-layout-heron-onnx | Detección de layout | No disponible | No aplica | Apache-2.0 | HuggingFace |
| PaddlePaddle/PaddleOCR | OCR | No disponible | No aplica | Apache-2.0 | GitHub y HuggingFace |

La comparativa directa es limitada porque PaperVoice no es un modelo único sino un empaquetado de componentes; sus alternativas reales son los modelos upstream por separado o pipelines como Docling, que requieren ensamblar cada pieza manualmente.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües declaradas.
- La licencia agregada es "other", lo que exige revisar las condiciones de cada componente upstream antes de un uso comercial.
- La voz clásica v1 (Piper en_US-lessac-medium) es solo para investigación y se descarga bajo demanda desde el repositorio oficial de Piper.
- El operador personalizado snake_op.dll está compilado para Windows con AVX2/FMA; su uso en Linux o macOS no está cubierto.
- No es un modelo de lenguaje: no genera texto libre, no razona y no soporta tool calling ni agentes.
- No se publican métricas de calidad de OCR, reconocimiento de fórmulas ni MOS de voz, solo métricas de latencia y fidelidad de forma de onda.
- El repositorio tiene 0 descargas y 0 likes, por lo que carece de validación comunitaria independiente.
- Riesgo de errores en documentos con layouts atípicos, tablas muy complejas o fórmulas manuscritas, al no documentarse tasas de error.
- La integridad de los pesos depende de los checksums SHA-256 publicados; cualquier réplica debe verificarlos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Vibrant8849/PaperVoice
- Repositorio de la aplicación: https://github.com/Gowravsharma/PaperVoice
- Kokoro-82M upstream: https://huggingface.co/hexgrad/Kokoro-82M
- Docling Heron ONNX: https://huggingface.co/docling-project/docling-layout-heron-onnx
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Docling models (TableFormer): https://huggingface.co/docling-project/docling-models
