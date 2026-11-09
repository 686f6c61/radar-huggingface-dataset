# Suraponn/typhoon-ocr2-2b-GGUF

## Resumen

Typhoon OCR V2 2B GGUF es la versión cuantizada en formato GGUF del modelo Typhoon OCR V2 2B, un parser de documentos desarrollado por Typhoon AI (SCB 10X) para tailandés e inglés. Esta variante, publicada por el usuario Suraponn, empaqueta los pesos originales en cuantizaciones de 16, 8 y 4 bits junto con el codificador de imagen (`mmproj`) necesario para ejecutar el modelo en llama.cpp y herramientas derivadas. El modelo base resuelve un problema concreto: convertir imágenes de páginas (PDF escaneados, fotografías de documentos) en una representación estructurada que preserva el orden de lectura, las categorías de cada elemento y sus coordenadas.

Arquitectura multimodal de tipo image-text-to-text con 1.881.825.088 parámetros totales (aproximadamente 1,9 mil millones), lo que lo sitúa en la gama de modelos pequeños desplegables en hardware modesto. La salida es un objeto JSON con una lista de elementos de maquetación, cada uno con `bbox`, `category` y `text`; las tablas se emiten como HTML, las fórmulas como LaTeX y el resto como Markdown. Está entrenado con un conjunto fijo de prompts, por lo que la fidelidad depende de usar exactamente las instrucciones previstas.

Su relevancia actual radica en dos factores: por un lado, cubre el tailandés, un idioma escasamente representado en herramientas OCR open source de calidad; por otro, la disponibilidad de GGUF permite ejecutarlo localmente con llama.cpp sin depender de GPUs de datacenter, algo relevante para pipelines de digitalización de documentos en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal image-text-to-text (codificador de imagen + modelo de lenguaje transformer) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 40.960 tokens recomendados en llama.cpp (16.384 para imagen + 16.384 para respuesta) |
| Tipos de cuantizacion | f16 (sin cuantizar), Q8_0 (8 bits), Q4_K_M (4 bits, k-quant medium); codificador de imagen en f16 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | GGUF (más `mmproj` para el codificador de imagen); pesos originales en bf16 para vLLM |

## Arquitectura y entrenamiento

El modelo es un sistema multimodal que combina un codificador de imagen con un modelo de lenguaje de aproximadamente 1,9 mil millones de parámetros. La información proporcionada no detalla la arquitectura interna del transformer ni la composición exacta del dataset de entrenamiento; la model card remite a la ficha del modelo base (`typhoon-ai/typhoon-ocr2-2b`) para los detalles de entrenamiento, los benchmarks completos y las limitaciones. Lo que sí se especifica es que el modelo fue entrenado sin bloque de razonamiento (thinking), de ahí la recomendación de usar `--reasoning off` en llama.cpp, y con un conjunto fijo de prompts para las tareas de parsing.

En el plano técnico, el tokenizador de imagen usa una rejilla de 32×32 píxeles por token, lo que con un presupuesto de 16.384 tokens de imagen permite procesar páginas de hasta 16,7 megapíxeles. Las coordenadas de los bounding boxes se emiten en una rejilla normalizada de 0 a 1000 relativa al ancho y alto de la página. La versión GGUF conserva la precisión prácticamente intacta en Q8_0 (79,5 en MDPBench frente a 79,8 de los pesos bf16 originales) y pierde alrededor de un punto en Q4_K_M.

## Capacidades

- Parsing de documentos de página completa: devuelve los elementos de maquetación en orden de lectura con categoría, bounding box y texto.
- Clasificación de 13 categorías de maquetación: `header`, `title`, `text`, `figure`, `table`, `formula`, `figure_caption`, `table_caption`, `formula_caption`, `figure_footnote`, `table_footnote`, `page_footnote`, `footer`.
- Conversión de tablas a HTML y de fórmulas a LaTeX; el texto general se emite en Markdown.
- Extracción de texto fiel, sin traducción ni reescritura, según las instrucciones de entrenamiento.
- Respuesta a preguntas sobre el contenido de un documento (document QA) enviando la pregunta como prompt de texto.
- Extracción de información clave en formato JSON.
- Procesamiento de documentos digitales y fotografías de páginas.
- Soporte bilingüe tailandés-inglés.
- Compatible con endpoint OpenAI en llama-server (`/v1/chat/completions`).
- No dispone de modo de razonamiento (thinking) ni de tool calling según la información disponible.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo convierte fotografías o escaneos de formularios y documentos oficiales en JSON estructurado, preservando el orden de lectura y las coordenadas, lo que permite indexar y buscar sobre el texto extraído.
- Extracción de tablas financieras: al emitir las tablas como HTML, se pueden postprocesar directamente con librerías de parsing HTML para poblar bases de datos o hojas de cálculo sin pasar por OCR genérico y heurísticas de reconstrucción de tablas.
- Procesamiento de documentación técnica con fórmulas: la salida en LaTeX de los elementos `formula` facilita la conversión a Markdown científico o la integración en sistemas de publicación con MathJax o KaTeX.
- Pipeline de atención al cliente sobre facturas y recibos: usando la extracción de información clave como JSON, el modelo puede alimentar un sistema que valide campos (importes, fechas, emisores) en flujos de back office.
- Document QA en sistemas de gestión documental: enviando la pregunta como prompt de texto junto a la imagen de la página, se puede construir un buscador conversacional sobre documentos escaneados sin necesidad de OCR previo ni de un pipeline separado de recuperación.
- Despliegue en local con llama.cpp: con Q8_0 (2,01 GB) o Q4_K_M (1,27 GB) más el `mmproj` de 668 MB, el modelo cabe en GPUs de consumo y permite procesar documentos en entornos con requisitos de privacidad que impiden enviar imágenes a servicios en la nube.
- Extracción de metadatos en sistemas de archivo: la combinación de categorías (`header`, `footer`, `title`) permite identificar automáticamente encabezados de página, números de página y títulos de sección para enriquecer registros de digitalización.

## Benchmarks y rendimiento

Resultados en MDPBench (320 páginas tailandesas e inglesas, digitales y fotografiadas), ejecutados con `llama-server` (build `a691b23`, CUDA, NVIDIA H100), decodificación greedy, thinking desactivado y presupuesto de imagen de 16.384 tokens:

| Archivo | Precisión | Tamaño | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | – | 79,8 | 81,3 |
| `typhoon-ocr2-2b-f16.gguf` | f16, sin cuantizar | 3,78 GB | 79,5 | 80,8 |
| `typhoon-ocr2-2b-Q8_0.gguf` | 8 bits | 2,01 GB | 79,5 | 80,4 |
| `typhoon-ocr2-2b-Q4_K_M.gguf` | 4 bits (k-quant medium) | 1,27 GB | 78,4 | 79,7 |
| `mmproj-typhoon-ocr2-2b-f16.gguf` | codificador de imagen (f16) | 668 MB | – | – |

El autor señala que las diferencias de unas décimas entre archivos están dentro de la variación entre ejecuciones. No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,7 GB con Q8_0 (2,01 GB de pesos + 668 MB de `mmproj`); aproximadamente 1,9 GB con Q4_K_M; aproximadamente 4,4 GB con f16.
- GPU recomendadas: el autor validó el modelo en NVIDIA H100 con CUDA; por tamaño, cualquier GPU con al menos 4 GB de VRAM libre debería poder cargarlo en Q8_0.
- Cabe en GPU de consumo: sí, en tarjetas con 4-6 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090); también es viable en GPUs integradas o CPU si se acepta mayor latencia, aunque el autor solo probó CUDA.
- Opciones de despliegue: llama.cpp (`llama-server` con `-hf` o archivos locales y `--mmproj`), y por extensión herramientas construidas sobre llama.cpp; los pesos originales bf16 se sirven con vLLM.
- Configuración recomendada: `-c 40960 --image-max-tokens 16384 -ngl 999 --jinja --reasoning off`; para servir varias peticiones concurrentes, añadir `-np N` y multiplicar `-c` por N.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo indica que las pruebas se hicieron en H100 y que las builds de CPU, Metal y Vulkan no fueron probadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Typhoon OCR V2 2B GGUF | 1,88 B | 40.960 tokens (recomendado) | th, en | Apache 2.0 + OpenTyphoon T&C | GGUF, bf16 | Parser estructurado con bbox, HTML y LaTeX; MDPBench 79,5 (Q8_0) |
| Typhoon OCR V2 2B (original) | 1,88 B | no disponible | th, en | Apache 2.0 + OpenTyphoon T&C | safetensors (bf16) | Pesos de referencia; MDPBench 79,8 |
| Alternativas OCR open source comparables | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks comparables en la información proporcionada |

No se han proporcionado en la información disponible resultados de otros modelos OCR (como Donut, Nougat o PaddleOCR) que permitan una comparación cuantitativa fiable; para evitar inventar cifras, la comparativa se limita a las dos variantes del propio modelo.

## Limitaciones y advertencias

- La cuantización degrada la precisión: Q8_0 pierde 0,3 puntos en MDPBench y 0,9 en tailandés respecto a bf16; Q4_K_M pierde 1,4 y 1,6 puntos respectivamente.
- Solo se probó llama.cpp en Linux con CUDA; las builds de CPU, Metal y Vulkan no fueron validadas y sus salidas pueden diferir ligeramente.
- El modelo puede entrar en bucles de repetición, según advierte el propio autor.
- Está entrenado con un conjunto fijo de prompts: usar instrucciones distintas puede degradar la calidad del parsing; para página completa hay que emplear el prompt exacto documentado.
- El modelo no tiene modo de razonamiento; activar el bloque de thinking en la plantilla de chat puede producir salidas no deseadas.
- Cobertura lingüística limitada a tailandés e inglés; no se garantiza el rendimiento en otros idiomas.
- Riesgo de alucinación en la extracción de texto: aunque las instrucciones exigen texto literal sin reescritura, no hay garantía formal de fidelidad en documentos de baja calidad o con tipografías difíciles.
- La licencia Apache 2.0 del repositorio queda supeditada a los OpenTyphoon Terms and Conditions, que deben revisarse antes de un uso comercial.
- El repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 9 de noviembre de 2026; es una publicación reciente sin validación comunitaria.
- El tamaño del repo (7,7 GB) incluye todas las cuantizaciones; conviene descargar solo el archivo necesario.
- El uso de `--image-max-tokens 16384` es necesario para no perder legibilidad en páginas grandes; sin él, llama.cpp reduce la resolución y el texto pequeño se vuelve difícil de leer.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Suraponn/typhoon-ocr2-2b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- llama.cpp: https://github.com/ggml-org/llama.cpp
- OpenTyphoon Terms and Conditions: https://opentyphoon.ai/tac
