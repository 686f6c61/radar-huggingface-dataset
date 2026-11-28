# typhoon-ai/typhoon-ocr2-2b-MLX-8bit

## Resumen

Typhoon OCR V2 2B MLX 8bit es una cuantización de 8 bits en formato MLX del modelo Typhoon OCR V2 2B, un parser de documentos desarrollado por Typhoon AI (SCB 10X) especializado en tailandés e inglés. Dada una imagen de una página, el modelo devuelve los elementos de maquetación en orden de lectura, cada uno con su categoría, su *bounding box* y su texto: las tablas se emiten como HTML, las fórmulas como LaTeX y el resto del texto como Markdown. Además, responde preguntas sobre un documento y extrae información clave en JSON.

El modelo original tiene 2.213.241.664 parámetros (aproximadamente 2,2 mil millones) y se basa en una arquitectura multimodal de la familia Qwen 3.5, con pipeline `image-text-to-text`. Esta variante concreta ha sido convertida a MLX mediante `mlx-vlm` con cuantización afín de 8 bits y tamaño de grupo 64, lo que reduce el peso del repositorio a 2,68 GB frente a los 4,45 GB de la versión bf16 sin cuantización.

Su relevancia práctica radica en que permite ejecutar un parser de documentos de calidad casi idéntica a la del modelo original (79,3 frente a 79,8 en MDPBench global, y 80,6 frente a 81,3 en tailandés) con la mitad de memoria, lo que lo hace viable en hardware Apple Silicon mediante MLX. La licencia declarada es Apache 2.0, aunque el uso está sujeto a los términos y condiciones de OpenTyphoon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen 3.5), pipeline `image-text-to-text` |
| Parámetros totales | 2.213.241.664 (~2,2 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la configuración de ejemplo limita a 16.384 tokens de salida) |
| Tipos de cuantización | 8 bits afín, tamaño de grupo 64 (esta variante); existen bf16 y 4 bits afín grupo 64 en el mismo repositorio de autor |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 (sujeta a OpenTyphoon Terms and Conditions) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`, `mlx-vlm`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y del pipeline `image-text-to-text`, lo que indica un modelo multimodal con codificador visual y decodificador de lenguaje basado en la familia Qwen 3.5. El modelo está entrenado específicamente para parsing de documentos: recibe una imagen de página y produce un único objeto JSON con los elementos de maquetación en orden de lectura, cada uno con `bbox` en formato `[x1, y1, x2, y2]`, categoría (entre 13 clases predefinidas como `header`, `title`, `text`, `figure`, `table`, `formula`, `footer`, etc.) y contenido textual formateado según el tipo.

El modelo fue entrenado con un conjunto fijo de prompts; la model card insiste en usar exactamente el prompt de parsing de página completa que se proporciona. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El informe técnico referenciado (arXiv:2611.27494) describe el método y la evaluación, pero su contenido no forma parte de los datos proporcionados. La innovación destacable de esta variante es la conversión a MLX con cuantización afín de 8 bits y grupo 64, que preserva la precisión del bf16 con aproximadamente la mitad del tamaño.

## Capacidades

- Parsing de documentos completos: extracción de elementos de maquetación en orden de lectura con categoría, *bounding box* y texto.
- Conversión de tablas a HTML y de fórmulas a LaTeX; el resto de texto se emite en Markdown.
- Respuesta a preguntas sobre el contenido de un documento (*document QA*).
- Extracción de información clave estructurada en JSON.
- Procesamiento de documentos digitales y fotografías de páginas.
- Soporte bilingüe tailandés e inglés.
- Modo *thinking* disponible en `mlx-vlm` mediante `--enable-thinking`, aunque la model card recomienda mantenerlo desactivado para este modelo.
- No se documentan en la información disponible capacidades de *tool calling*, agentes, audio o vídeo.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo convierte páginas escaneadas o fotografiadas en Markdown estructurado con tablas en HTML, lo que permite indexar el contenido en sistemas de búsqueda o RAG sin transcripción manual.
- Extracción de datos de facturas y formularios: usando el prompt de parsing y el modo de extracción JSON, se pueden obtener campos clave (importes, fechas, referencias) junto con sus coordenadas para su validación posterior.
- Procesamiento de documentación técnica con fórmulas: la salida en LaTeX de los elementos `formula` facilita la reutilización en entornos científicos o de ingeniería que renderizan matemáticas.
- Asistente de consulta sobre documentos: el modelo responde preguntas sobre una página o conjunto de páginas, útil en atención al cliente o soporte interno donde el agente necesita localizar información concreta.
- Digitalización de documentos bilingües tailandés-inglés: adecuado para organizaciones que operan en Tailandia y necesitan preservar ambos idiomas sin traducción, ya que el modelo está instruido para no traducir ni reescribir el texto.
- Despliegue local en Mac con Apple Silicon: gracias a la cuantización de 8 bits (2,68 GB), es posible ejecutar el parser en un portátil mediante `mlx_vlm.server` con una API compatible con OpenAI, sin depender de servicios en la nube.
- Preprocesamiento en pipelines de RAG documental: la salida JSON con *bounding boxes* permite conservar la trazabilidad de cada fragmento de texto hasta su posición original en la página.

## Benchmarks y rendimiento

| Pesos | Tamaño | MDPBench ↑ | MDPBench Thai ↑ |
|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | 79,8 | 81,3 |
| typhoon-ocr2-2b-MLX-bf16 (bfloat16, sin cuantización) | 4,45 GB | 78,9 | 80,0 |
| **este repositorio** (8 bits afín, grupo 64) | 2,68 GB | 79,3 | 80,6 |
| typhoon-ocr2-2b-MLX-4bit (4 bits afín, grupo 64) | 1,74 GB | 73,3 | 70,5 |

MDPBench consta de 320 páginas en tailandés e inglés, tanto digitales como fotografiadas. Las puntuaciones MLX se obtuvieron con `mlx_vlm.server` (mlx 0.32.4, mlx-vlm 0.7.12), decodificación greedy, *thinking* desactivado e imágenes de hasta 16,7 MP, sobre la build Linux CUDA de MLX en una NVIDIA H100 (el autor no dispone de hardware Apple para la evaluación). Los pesos son los mismos en un Mac, pero no se han verificado sus salidas. La model card advierte que diferencias de unas décimas entre versiones están dentro de la variación entre ejecuciones.

## Requisitos de hardware

- VRAM/espacio en disco: el repositorio ocupa 2,68 GB en 8 bits; la versión bf16 ocupa 4,45 GB y la de 4 bits, 1,74 GB.
- GPU recomendadas: la evaluación se realizó en una NVIDIA H100 con la build CUDA de MLX; en el ecosistema MLX el objetivo natural es Apple Silicon (Mac con chip M-series), aunque el autor no ha verificado las salidas en Mac.
- Cabe en GPU de consumo: sí, con 2,68 GB de pesos en 8 bits es viable en GPUs de consumo con suficiente memoria, aunque la información disponible no especifica requisitos mínimos exactos.
- Despliegue: `mlx-vlm` (servidor con endpoint compatible con OpenAI mediante `mlx_vlm.server`, o uso en Python con `mlx_vlm.load` y `mlx_vlm.generate`). La versión original puede desplegarse con vLLM.
- Configuración recomendada: `--min-pixels 2048 --max-pixels 16777216 --max-tokens 16384`, temperatura 0,0 y *thinking* desactivado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MDPBench | Licencia | Formato |
|---|---|---|---|---|---|
| typhoon-ocr2-2b-MLX-8bit (este) | ~2,2 B | no disponible | 79,3 | Apache 2.0 (sujeta a OpenTyphoon T&C) | MLX safetensors 8 bits |
| typhoon-ocr2-2b-MLX-bf16 | ~2,2 B | no disponible | 78,9 | Apache 2.0 (sujeta a OpenTyphoon T&C) | MLX safetensors bf16 |
| typhoon-ocr2-2b-MLX-4bit | ~2,2 B | no disponible | 73,3 | Apache 2.0 (sujeta a OpenTyphoon T&C) | MLX safetensors 4 bits |
| typhoon-ocr2-2b (original) | ~2,2 B | no disponible | 79,8 | Apache 2.0 (sujeta a OpenTyphoon T&C) | safetensors bf16 |

No se dispone en la información proporcionada de datos de benchmarks de modelos de OCR comparables de otros autores.

## Limitaciones y advertencias

- El modelo está entrenado con un conjunto fijo de prompts; desviarse del prompt de parsing puede degradar la calidad de la salida.
- Requiere ampliar las imágenes para que el lado largo mida al menos 1.600 píxeles; con imágenes pequeñas el rendimiento cae, especialmente en tailandés.
- La versión de 4 bits pierde aproximadamente 10 puntos en tailandés (70,5 frente a 80,6 en 8 bits); no se recomienda para documentos en ese idioma.
- Solo soporta tailandés e inglés; otros idiomas no están cubiertos.
- Riesgo de alucinación y de errores de transcripción en textos densos o de baja calidad, aunque no se cuantifica en la información disponible.
- No se documentan sesgos específicos en la información proporcionada.
- El uso está sujeto a los OpenTyphoon Terms and Conditions además de la licencia Apache 2.0; conviene revisarlos antes de un uso comercial.
- Las puntuaciones MLX se obtuvieron en hardware NVIDIA con la build CUDA de MLX; el comportamiento en Apple Silicon no ha sido verificado por el autor.
- El modo *thinking* debe permanecer desactivado para este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-8bit
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Variante bf16 MLX: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-bf16
- Variante 4 bits MLX: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-MLX-4bit
- Informe técnico: https://arxiv.org/abs/2611.27494
- MLX: https://github.com/ml-explore/mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Términos y condiciones de OpenTyphoon: https://opentyphoon.ai/tac
