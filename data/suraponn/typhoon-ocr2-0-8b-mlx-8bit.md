# Suraponn/typhoon-ocr2-0.8b-MLX-8bit

## Resumen

Typhoon OCR V2 0.8B MLX 8bit es la conversión a formato MLX del modelo Typhoon OCR V2 0.8B, un parser de documentos especializado en tailandés e inglés desarrollado por el equipo de Typhoon (SCB 10X). El modelo base es un VLM ligero (etiquetado internamente como `qwen3_5` en los metadatos) que recibe la imagen de una página y devuelve sus elementos de maquetación en orden de lectura, cada uno con categoría, bounding box y texto extraído. Las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown. Además, responde preguntas sobre documentos y extrae información estructurada en JSON.

Esta versión concreta, publicada por el usuario Suraponn, aplica cuantización afín de 8 bits con group size 64 sobre los pesos originales, reduciendo el repositorio a aproximadamente 1,02 GB frente a los 1,73 GB de la versión bf16. Según la model card, la precisión se mantiene e incluso mejora ligeramente respecto a bf16 en el benchmark MDPBench (77,4 frente a 76,3), lo que la convierte en la opción recomendada para despliegue en Apple Silicon mediante `mlx-vlm`.

Con 852.985.920 parámetros (~0,85B), el modelo está pensado para ejecutarse en hardware modesto, incluyendo Macs con memoria unificada. Su relevancia actual radica en cubrir OCR documental de calidad en tailandés, un idioma con poca cobertura en modelos generalistas, manteniendo un tamaño que permite inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (VLM) basado en transformer; etiqueta interna `qwen3_5`, con adaptador multimodal (image-text-to-text) |
| Parametros totales | 852.985.920 (~0,85B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card usa `--max-tokens 16384` para generación; no se especifica la ventana de contexto de entrada) |
| Tipos de cuantizacion | 8-bit affine, group size 64 (esta versión); existen variantes bf16 y 4-bit del mismo modelo base |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | apache-2.0 (sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors (MLX), librería `mlx` |
| Tamaño del repositorio | 1,0 GB (pesos 8-bit: ~1,02 GB) |
| Pipeline | image-text-to-text |
| Modelo base | typhoon-ai/typhoon-ocr2-0.8b |
| Resolución de imagen recomendada | hasta 16,7 MP (`--max-pixels 16777216`); el processor config por defecto limita a 4 MP |

## Arquitectura y entrenamiento

El modelo base Typhoon OCR V2 0.8B es un VLM de tipo image-text-to-text con backbone transformer y etiqueta interna `qwen3_5`, lo que sugiere una arquitectura derivada de la familia Qwen 3.5 adaptada a tareas de parsing documental. Recibe una imagen de página completa y genera una lista JSON de elementos de maquetación con bounding boxes normalizados en una rejilla 0–1000 relativa al ancho y alto de la página. El modelo fue entrenado con un conjunto fijo de prompts; la model card indica que los detalles completos de entrenamiento, composición del dataset y benchmarks están en la model card del modelo base, no en esta conversión.

La innovación principal de esta versión es puramente de despliegue: cuantización afín de 8 bits con group size 64 aplicada con `mlx-vlm` para ejecución nativa en Apple Silicon vía MLX. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición del dataset, RLHF/DPO ni técnicas como decodificación especulativa o atención lineal. El modelo soporta un modo "thinking" heredado del backbone (desactivable con `--enable-thinking`), aunque la model card recomienda mantenerlo desactivado para esta tarea.

## Capacidades

- Parsing de documentos página completa: extrae elementos de maquetación (header, title, text, figure, table, formula, figure_caption, table_caption, formula_caption, figure_footnote, table_footnote, page_footnote, footer) con bounding boxes y orden de lectura.
- Conversión de formato por categoría: tablas a HTML, fórmulas a LaTeX, texto general a Markdown.
- OCR bilingüe tailandés-inglés con preservación exacta del texto original (sin traducción ni reescritura).
- Question answering sobre documentos: responde preguntas sobre el contenido de una imagen de página.
- Extracción de información estructurada en JSON.
- Salida estructurada: devuelve una lista JSON dentro de un bloque de código `json`, con bounding boxes en rejilla 0–1000.
- Procesamiento de imágenes de alta resolución (hasta 16,7 MP) para mejorar la lectura de texto pequeño.
- Soporte de modo thinking (desaconsejado para esta tarea).
- No se documenta soporte de tool calling, function calling, agentes multi-step, audio ni visión más allá del parsing de imágenes de página.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo procesa páginas escaneadas o fotografiadas y devuelve la estructura en JSON con texto en Markdown, adecuado para pipelines de ingesta documental en organismos públicos o empresas con corpus en tailandés.
- Extracción de tablas a HTML para sistemas de BI: al emitir tablas como HTML con bounding boxes, permite reconstruir tablas financieras o de inventario y cargarlas en bases de datos relacionales sin post-procesado manual intensivo.
- Conversión de papers y documentación técnica con fórmulas: las fórmulas salen como LaTeX, lo que facilita su integración en sistemas de gestión de conocimiento científico o wikis técnicas.
- QA sobre contratos y documentos legales: el modelo responde preguntas sobre el contenido de una página, útil para asistentes de revisión documental bilingües th/en.
- Extracción de campos clave a JSON: para automatizar la captura de datos de facturas, formularios o certificados, alimentando sistemas de RPA.
- Despliegue local en Mac para equipos de investigación: gracias a la cuantización 8-bit (~1 GB) y a `mlx-vlm`, puede ejecutarse en Apple Silicon sin GPU dedicada, ideal para prototipado y procesamiento offline de documentos sensibles.
- Preprocesado para RAG documental: el Markdown estructurado en orden de lectura sirve como entrada limpia para pipelines de recuperación aumentada, preservando jerarquía de títulos y captions.

## Benchmarks y rendimiento

Los únicos datos disponibles corresponden a MDPBench (320 páginas tailandesas e inglesas, digitales y fotografiadas), evaluado con decodificación greedy, thinking off e imágenes de hasta 16,7 MP:

| Pesos | Tamaño | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|
| Originales (bf16, vLLM) | – | 77,4 | 77,2 |
| MLX bf16 (sin cuantización) | 1,73 GB | 76,3 | 77,1 |
| **Esta versión (8-bit affine, group 64)** | 1,02 GB | 77,4 | 77,6 |
| MLX 4-bit (affine, group 64) | 645 MB | 67,6 | 64,3 |

Las puntuaciones MLX se obtuvieron con `mlx_vlm.server` (mlx 0.32.4, mlx-vlm 0.7.12) sobre la build CUDA de MLX en una NVIDIA H100, no en hardware Apple. El autor advierte que diferencias de unas décimas entre versiones están dentro de la variación entre ejecuciones. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: ~1,02 GB solo para pesos en 8-bit; con overhead de activaciones y buffers de imagen de alta resolución, se recomienda al menos 4–6 GB de memoria unificada o VRAM.
- GPU recomendadas: cualquier GPU con soporte MLX (la build CUDA de MLX se validó en NVIDIA H100); en Apple Silicon, chips M1/M2/M3/M4 con 8 GB o más de memoria unificada.
- Cabe en GPU de consumo: sí, en cualquier Mac Apple Silicon reciente y en GPUs NVIDIA con 8 GB o más si se usa la build CUDA de MLX.
- Opciones de despliegue: `mlx_vlm.server` (endpoint compatible con OpenAI), API Python `mlx_vlm.load`/`generate`, y `mlx-vlm` como librería. El modelo base original puede desplegarse con vLLM.
- Latencia y throughput: no disponible en la información proporcionada.
- Nota: el processor config limita imágenes a 4 MP por defecto; para evaluación y uso real se recomienda `--max-pixels 16777216`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | MDPBench |
|---|---|---|---|---|---|---|
| **Typhoon OCR V2 0.8B MLX 8bit** | ~0,85B | no disponible | th, en | apache-2.0 (OpenTyphoon T&C) | safetensors MLX | 77,4 / 77,6 (th) |
| Typhoon OCR V2 0.8B MLX bf16 | ~0,85B | no disponible | th, en | apache-2.0 | safetensors MLX | 76,3 / 77,1 (th) |
| Typhoon OCR V2 0.8B MLX 4bit | ~0,85B | no disponible | th, en | apache-2.0 | safetensors MLX | 67,6 / 64,3 (th) |
| Typhoon OCR V2 0.8B original (vLLM) | ~0,85B | no disponible | th, en | apache-2.0 | safetensors | 77,4 / 77,2 (th) |

No se dispone en la información proporcionada de comparaciones con modelos OCR de otros fabricantes (por ejemplo, variantes de Qwen-VL, Donut o PaddleOCR); por tanto, esa comparativa se indica como no disponible.

## Limitaciones y advertencias

- Solo soporta tailandés e inglés; otros idiomas no están cubiertos.
- La cuantización 4-bit degrada gravemente el rendimiento en tailandés (caída de ~13 puntos); no se recomienda para documentos en ese idioma.
- El modelo fue entrenado con un conjunto fijo de prompts; desviarse del prompt de parsing puede degradar la salida estructurada.
- El modo thinking debe permanecer desactivado; activarlo puede alterar el formato de salida esperado.
- Riesgo de alucinación en textos pequeños o imágenes de baja calidad; el autor recomienda hasta 16,7 MP para mitigarlo.
- La evaluación MLX se realizó en una build CUDA sobre H100, no en Apple Silicon; el comportamiento en Mac no está verificado por el autor.
- La licencia apache-2.0 está condicionada por los OpenTyphoon Terms and Conditions; es necesario revisarlos antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una conversión de terceros, no oficial de Typhoon.
- No se documentan sesgos específicos ni límites de longitud de contexto de entrada.
- El parser de salida debe manejar truncamientos por límite de tokens (la model card incluye un helper que descarta el último elemento incompleto).

## Enlaces

- Modelo en Hugging Face (esta versión): https://huggingface.co/Suraponn/typhoon-ocr2-0.8b-MLX-8bit
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Versión MLX bf16: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-bf16
- Versión MLX 4-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-4bit
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Términos y condiciones OpenTyphoon: https://opentyphoon.ai/tac
