# Suraponn/typhoon-ocr2-2b-MLX-bf16

## Resumen

Typhoon OCR V2 2B MLX bf16 es la conversión a formato MLX del modelo Typhoon OCR V2 2B, un parser de documentos desarrollado por Typhoon AI (SCB 10X) especializado en tailandés e inglés. Dada una imagen de una página, el modelo devuelve los elementos de maquetación en orden de lectura, cada uno con su categoría, su caja delimitadora (bounding box) y su texto. Las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown.

La variante aquí descrita, publicada por el usuario Suraponn, mantiene los pesos en bfloat16 sin cuantización y está pensada para ejecutarse con la librería mlx-vlm sobre hardware Apple Silicon, aunque la evaluación reportada por el autor se realizó sobre la build CUDA de MLX en una NVIDIA H100. El modelo base cuenta con 2.213.241.664 parámetros y una arquitectura de tipo transformer multimodal (imagen-texto) derivada de la familia Qwen.

Su relevancia actual reside en la combinación de tres factores: un tamaño reducido que permite despliegue en hardware modesto, un enfoque específico en parsing de documentos con salida estructurada (JSON con bounding boxes) y un rendimiento competitivo en MDPBench, el benchmark propio de Typhoon AI para documentos tailandeses e ingleses. La licencia Apache 2.0 del artefacto se ve matizada por los términos de uso de OpenTyphoon que impone el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal imagen-texto (familia Qwen, tag `qwen3_5`) |
| Parámetros totales | 2.213.241.664 (2,21 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 sin cuantización en este repo; existen variantes MLX 8-bit (group size 64) y 4-bit (group size 64) |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (sujeta a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors (MLX), bfloat16 |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo image-text-to-text con 2,21 mil millones de parámetros, construido sobre la arquitectura Qwen (tag `qwen3_5` en el repositorio) y adaptado por Typhoon AI para parsing de documentos. El modelo base `typhoon-ai/typhoon-ocr2-2b` fue entrenado por Typhoon AI con un conjunto fijo de prompts orientados a la extracción de maquetación, y esta variante es una conversión directa de esos pesos a MLX en bfloat16, sin cuantización ni reentrenamiento.

La model card de esta conversión no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO; esa información se remite a la model card del modelo base. La innovación técnica destacable no está en la arquitectura sino en el formato de salida: el modelo produce un objeto JSON con una lista de elementos, cada uno con `bbox` en una rejilla normalizada de 0 a 1000 relativa al ancho y alto de la página, `category` (una de trece categorías predefinidas: header, title, text, figure, table, formula, figure_caption, table_caption, formula_caption, figure_footnote, table_footnote, page_footnote, footer) y `text`. Las tablas se serializan como HTML y las fórmulas como LaTeX.

## Capacidades

- Parsing de documentos página completa: extrae elementos de maquetación en orden de lectura humano con categoría, bounding box y texto.
- Conversión de tablas a HTML y de fórmulas a LaTeX, con el resto de texto en Markdown.
- Respuesta a preguntas sobre el contenido de un documento.
- Extracción de información clave en formato JSON.
- Procesamiento bilingüe tailandés-inglés.
- Procesamiento de imágenes de hasta 16,7 MP (16.777.216 píxeles) cuando se configura `max_pixels` adecuadamente; el valor por defecto del repo limita a 4 MP.
- Modo "thinking" disponible en mlx-vlm pero desaconsejado para este modelo (debe mantenerse desactivado).
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo procesa páginas escaneadas o fotografiadas y devuelve la estructura completa con bounding boxes, lo que permite reconstruir documentos indexables preservando la posición de cada bloque.
- Extracción de tablas financieras a HTML: adecuado para informes y estados contables en tailandés e inglés, ya que las tablas se emiten directamente en HTML listo para parsear con BeautifulSoup o similares.
- Conversión de documentación técnica con fórmulas a Markdown con LaTeX: útil para migrar manuales y papers a wikis o bases de conocimiento, manteniendo las fórmulas en formato renderizable.
- Preguntas y respuestas sobre documentos: el modelo responde consultas sobre el contenido de una imagen de página, lo que sirve para asistentes de consulta documental en atención al ciudadano o soporte interno.
- Extracción de campos clave como JSON: permite alimentar pipelines de ingesta estructurada (por ejemplo, extraer datos de facturas o formularios) sin necesidad de un segundo modelo.
- Procesamiento por lotes en Mac con Apple Silicon: al ser una conversión MLX, puede ejecutarse localmente en equipos Apple con mlx-vlm, útil para flujos de digitalización con requisitos de privacidad que impiden enviar documentos a la nube.
- Evaluación y prototipado de pipelines OCR: la variante bf16 sirve como referencia de calidad frente a las versiones 8-bit y 4-bit al comparar resultados en MDPBench.

## Benchmarks y rendimiento

| Pesos | Tamaño | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | 79,8 | 81,3 |
| Este repo (bfloat16, sin cuantización) | 4,45 GB | 78,9 | 80,0 |
| typhoon-ai/typhoon-ocr2-2b-MLX-8bit (8-bit affine, group size 64) | 2,68 GB | 79,3 | 80,6 |
| typhoon-ai/typhoon-ocr2-2b-MLX-4bit (4-bit affine, group size 64) | 1,74 GB | 73,3 | 70,5 |

MDPBench consta de 320 páginas tailandesas e inglesas, tanto digitales como fotografiadas. Las puntuaciones MLX se obtuvieron con `mlx_vlm.server` (mlx 0.32.4 con mlx-cuda-13, mlx-vlm 0.7.12), decodificación greedy, thinking desactivado e imágenes de hasta 16,7 MP, sobre una NVIDIA H100 con la build CUDA de MLX. El autor advierte que las diferencias de unas décimas entre versiones están dentro de la variación entre ejecuciones.

## Requisitos de hardware

- VRAM estimada: el repo pesa 4,4 GB (4,45 GB de pesos bf16), por lo que la inferencia requiere aproximadamente 5-6 GB de memoria considerando overhead de activaciones y procesador de imagen.
- GPU recomendadas: el autor validó la build CUDA de MLX en una NVIDIA H100, pero el destino natural de MLX es Apple Silicon; no se han publicado cifras de latencia ni throughput.
- Compatibilidad con GPU de consumo: los 4,45 GB de pesos bf16 caben en GPUs de consumo con 8 GB o más; la variante 8-bit (2,68 GB) y la 4-bit (1,74 GB) reducen aún más el requisito.
- Despliegue: `mlx_vlm.server` con endpoint compatible con OpenAI, o la API Python de mlx-vlm (`load`, `generate`, `apply_chat_template`). Requiere `pip install -U mlx-vlm`.
- Configuración recomendada: `--min-pixels 2048 --max-pixels 16777216 --max-tokens 16384`, sin `--enable-thinking`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MDPBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Typhoon OCR V2 2B MLX bf16 (este repo) | 2,21 B | no disponible | 78,9 (Thai 80,0) | Apache 2.0 + OpenTyphoon T&C | Hugging Face, MLX |
| typhoon-ai/typhoon-ocr2-2b-MLX-8bit | 2,21 B | no disponible | 79,3 (Thai 80,6) | Apache 2.0 + OpenTyphoon T&C | Hugging Face, MLX |
| typhoon-ai/typhoon-ocr2-2b-MLX-4bit | 2,21 B | no disponible | 73,3 (Thai 70,5) | Apache 2.0 + OpenTyphoon T&C | Hugging Face, MLX |
| typhoon-ai/typhoon-ocr2-2b (original) | 2,21 B | no disponible | 79,8 (Thai 81,3) | Apache 2.0 + OpenTyphoon T&C | Hugging Face, vLLM |

No se dispone en la información proporcionada de comparaciones con modelos OCR de otros desarrolladores (por ejemplo, de la familia Qwen-VL o Donut).

## Limitaciones y advertencias

- El modelo está especializado en tailandés e inglés; no se documenta soporte de otros idiomas y su uso fuera de ese par lingüístico no está validado.
- El repositorio limita las imágenes a 4 MP por defecto en el processor config; para texto pequeño debe pasarse `--max-pixels 16777216`, lo que incrementa el coste computacional.
- La versión 4-bit pierde aproximadamente 10 puntos en tailandés (70,5 frente a 80,6 de la 8-bit); el autor desaconseja su uso para documentos tailandeses.
- El modelo fue entrenado con un conjunto fijo de prompts; desviarse del prompt de parsing puede degradar la calidad de la salida.
- El modo thinking debe permanecer desactivado; activarlo no está validado para esta tarea.
- Las puntuaciones MLX se obtuvieron en la build CUDA de MLX sobre H100; el autor no ha verificado las salidas en hardware Apple, por lo que el comportamiento en Mac puede diferir.
- La licencia Apache 2.0 del artefacto está sujeta a los OpenTyphoon Terms and Conditions del modelo base; conviene revisarlos antes de un uso comercial.
- No se documentan sesgos específicos ni tasas de alucinación; como todo modelo generativo, puede producir texto inexistente en la imagen, especialmente en documentos de baja calidad o con tipografías poco habituales.
- No se documenta longitud de contexto, lo que limita la planificación de documentos de muchas páginas en una sola llamada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Suraponn/typhoon-ocr2-2b-MLX-bf16
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Variante MLX 8-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-8bit
- Variante MLX 4-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-4bit
- Términos de uso OpenTyphoon: https://opentyphoon.ai/tac
- MLX: https://github.com/ml-explore/mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
