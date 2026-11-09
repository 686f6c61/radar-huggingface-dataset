# typhoon-ai/typhoon-ocr2-2b-MLX-8bit

## Resumen

Typhoon OCR V2 2B MLX 8bit es una conversión al formato MLX del modelo Typhoon OCR V2 2B, un parser de documentos desarrollado por Typhoon AI (OpenTyphoon) especializado en tailandés e inglés. Dada una imagen de una página, el modelo devuelve los elementos de maquetación en orden de lectura, cada uno con su categoría, su caja delimitadora (bbox) y su texto: las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown. Además, responde preguntas sobre un documento y extrae información clave en formato JSON.

Se trata de un modelo de 2.213.241.664 parámetros (aproximadamente 2,2 mil millones) construido sobre la arquitectura `qwen3_5` según las etiquetas del repositorio, con pipeline `image-text-to-text` y licencia Apache 2.0. Esta variante concreta aplica cuantización afín de 8 bits con tamaño de grupo 64 mediante `mlx-vlm`, lo que reduce el peso del repositorio a 2,7 GB (2,68 GB de pesos) frente a los 4,45 GB de la versión bf16, manteniendo una precisión prácticamente idéntica.

Su relevancia actual radica en que ofrece un OCR estructurado (no solo texto plano) para un par de idiomas poco cubierto por los modelos occidentales, el tailandés, con un formato de salida directamente consumible por pipelines de RAG y digitalización documental. La versión 8 bits es la recomendada por el propio autor: obtiene 79,3 en MDPBench frente a 78,9 de bf16, con la mitad de tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (modelo multimodal image-text-to-text, según etiquetas del repo) |
| Parametros totales | 2.213.241.664 (~2,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la configuración de generación usa `max_tokens` de 16384, no se especifica la ventana de contexto) |
| Tipos de cuantizacion | 8-bit afín, group size 64 (esta variante); existen variantes MLX bf16 y MLX 4-bit del mismo modelo base |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (sujeto además a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`), 8-bit |
| Modelo base | typhoon-ai/typhoon-ocr2-2b |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 2,7 GB (2,68 GB de pesos) |
| Fecha de publicacion | 2026-11-09 |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo image-text-to-text etiquetado como `qwen3_5`, es decir, un modelo de lenguaje con codificador visual que procesa la imagen de la página junto con un prompt textual y genera una secuencia estructurada. Esta variante MLX no reentrena el modelo: únicamente convierte los pesos originales a formato MLX con cuantización afín de 8 bits y tamaño de grupo 64, mediante la herramienta `mlx-vlm`. Los detalles completos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) se remiten a la model card del modelo base, que no está incluida en la información disponible.

La innovación técnica destacable no está en la arquitectura sino en el formato de salida y en el ajuste fino sobre prompts fijos: el modelo fue entrenado con un conjunto fijo de prompts y devuelve un único objeto JSON con una lista de elementos de maquetación, cada uno con `bbox` (rejilla 0–1000 relativa al ancho y alto de la página), `category` (entre 13 categorías predefinidas: header, title, text, figure, table, formula, figure_caption, table_caption, formula_caption, figure_footnote, table_footnote, page_footnote, footer) y `text`. Las tablas se serializan como HTML, las fórmulas como LaTeX y el texto general como Markdown, lo que convierte la salida en un documento estructurado directamente. El autor recomienda desactivar el modo thinking (`--enable-thinking` desactivado) y usar decodificación greedy con temperatura 0.0.

## Capacidades

- Análisis de maquetación de páginas: extrae elementos con bbox, categoría y texto en orden de lectura humano.
- OCR de texto en tailandés e inglés, incluyendo documentos digitales y páginas fotografiadas.
- Serialización estructurada de tablas como HTML.
- Serialización de fórmulas matemáticas como LaTeX.
- Formateo del texto general como Markdown.
- Respuesta a preguntas sobre el contenido de un documento (document QA).
- Extracción de información clave en formato JSON.
- Procesamiento de imágenes de alta resolución: hasta 16,7 MP (16.777.216 píxeles) en la evaluación del autor, con `min_pixels` de 2048.
- Salida en un único objeto JSON dentro de un bloque de código `json`, apta para parseo programático.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni visión general fuera del ámbito documental.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo convierte escaneos de formularios y expedientes en JSON estructurado con bboxes y categorías, lo que permite indexar y buscar por región de la página sin post-procesado manual de maquetación.
- Construcción de pipelines RAG sobre PDFs mixtos: al devolver tablas en HTML y texto en Markdown, el contenido se puede trocear y embeber respetando la estructura original, algo crítico en documentos financieros y técnicos bilingües th/en.
- Extracción de datos de facturas y recibos: el modo de extracción JSON y la respuesta a preguntas sobre el documento permiten obtener campos clave (importes, fechas, emisores) a partir de una imagen de la página.
- Procesamiento de documentación técnica con fórmulas: la salida LaTeX hace posible reutilizar ecuaciones de manuales y papers directamente en sistemas de composición o en bases de conocimiento matemáticas.
- Digitalización de prensa y publicaciones históricas en tailandés: la preservación del orden de lectura y de las categorías (títulos, pies de figura, notas al pie) facilita la reconstrucción fiel del artículo original.
- Automatización de la accesibilidad documental: la estructura de maquetación extraída (títulos, tablas, figuras y sus leyendas) sirve para generar versiones navegables o etiquetadas de documentos escaneados.
- Ejecución local en hardware Apple Silicon: al estar en formato MLX, encaja en flujos de trabajo en Mac con `mlx-vlm`, útil para prototipado y para procesar documentos sensibles sin enviarlos a la nube.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de MDPBench (320 páginas tailandesas e inglesas, digitales y fotografiadas), con decodificación greedy, thinking desactivado e imágenes de hasta 16,7 MP:

| Pesos | Tamano | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | 79,8 | 81,3 |
| MLX bf16 (sin cuantizar) | 4,45 GB | 78,9 | 80,0 |
| **MLX 8-bit (este repo)** | 2,68 GB | 79,3 | 80,6 |
| MLX 4-bit | 1,74 GB | 73,3 | 70,5 |

Las puntuaciones MLX se obtuvieron con `mlx_vlm.server` (mlx 0.32.4 con mlx-cuda-13, mlx-vlm 0.7.12) sobre una NVIDIA H100 con el build CUDA de MLX en Linux; el autor advierte que no dispone de hardware Apple y no ha verificado las salidas en Mac. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos de esta variante ocupan 2,68 GB, por lo que la inferencia cabe holgadamente en GPUs con 8 GB o más, dejando margen para el codificador visual y el procesamiento de imágenes de hasta 16,7 MP.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el autor validó el rendimiento en una NVIDIA H100, pero el modelo está pensado para ejecutarse en Apple Silicon mediante MLX.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090; en Mac, en equipos con memoria unificada de 8 GB o más.
- Opciones de despliegue: `mlx_vlm.server` (endpoint compatible con la API de OpenAI) y la API Python de `mlx-vlm` (`load`, `generate`). Para los pesos originales bf16, el autor cita vLLM. No se documenta soporte de llama.cpp, Ollama ni TGI para esta variante MLX.
- Latencia y throughput: no disponible; no se publican cifras de latencia ni de tokens por segundo.
- Recomendación del autor: usar la variante 8-bit (precisión equivalente a bf16 con la mitad de tamaño) y evitar la 4-bit en documentos tailandeses, donde pierde unos 10 puntos (70,5 frente a 80,6).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MDPBench | Licencia | Formato |
|---|---|---|---|---|---|
| Typhoon OCR V2 2B MLX 8bit (este) | ~2,2 B | no disponible | 79,3 (th: 80,6) | Apache 2.0 | MLX safetensors 8-bit |
| Typhoon OCR V2 2B MLX bf16 | ~2,2 B | no disponible | 78,9 (th: 80,0) | Apache 2.0 | MLX safetensors bf16 |
| Typhoon OCR V2 2B MLX 4bit | ~2,2 B | no disponible | 73,3 (th: 70,5) | Apache 2.0 | MLX safetensors 4-bit |
| Typhoon OCR V2 2B (original) | ~2,2 B | no disponible | 79,8 (th: 81,3) | Apache 2.0 | safetensors bf16 (vLLM) |

No se dispone en la información proporcionada de datos de benchmarks de otros modelos OCR comparables (por ejemplo, de la familia Qwen-VL, Donut o PaddleOCR) que permitan una comparación cruzada rigurosa; por tanto, esa comparación se indica como no disponible.

## Limitaciones y advertencias

- Ámbito restringido a OCR y parsing documental: no es un modelo de propósito general ni se documentan capacidades de razonamiento, código o matemáticas fuera del contexto de extracción.
- Idiomas limitados a tailandés e inglés; el rendimiento en otros idiomas no está evaluado.
- El prompt debe usarse exactamente como se especifica para el parsing de página completa, ya que el modelo fue entrenado con un conjunto fijo de prompts; desviarse de ellos puede degradar la salida.
- Riesgo de alucinación en la transcripción: aunque el prompt exige texto literal sin traducción ni reescritura, no hay garantía formal de fidelidad en documentos de baja calidad o con tipografías complejas.
- La salida puede truncarse al alcanzar el límite de tokens (`max_tokens` 16384); el código de ejemplo del autor incluye un parser que descarta el último elemento incompleto.
- La configuración del procesador del repositorio limita las imágenes a 4 MP; es necesario pasar `--max-pixels 16777216` para aprovechar la resolución de evaluación, y el texto pequeño se lee con más precisión a esa resolución.
- El modo thinking debe permanecer desactivado; activarlo no está recomendado para este modelo.
- La licencia Apache 2.0 se complementa con los OpenTyphoon Terms and Conditions, que deben revisarse antes de un uso comercial.
- Las puntuaciones MLX se obtuvieron en el build CUDA de MLX sobre H100 y no han sido verificadas en hardware Apple; el comportamiento en Mac puede diferir.
- La variante 4-bit no es adecuada para tailandés (pérdida de ~10 puntos), por lo que no debe elegirse por ahorro de memoria en ese idioma.
- Sesgos conocidos: no disponible; la información proporcionada no documenta sesgos específicos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-8bit
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Variante MLX bf16: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-bf16
- Variante MLX 4-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-4bit
- Términos y condiciones de OpenTyphoon: https://opentyphoon.ai/tac
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
