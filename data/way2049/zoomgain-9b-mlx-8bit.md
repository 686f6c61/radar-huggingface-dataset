# way2049/ZoomGain-9B-MLX-8bit

## Resumen

ZoomGain-9B-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo multimodal ZoomGain-9B, desarrollado originalmente por inclusionAI. El modelo base está construido sobre la arquitectura Qwen3.5 y ha sido entrenado con refuerzo (RL) sobre aproximadamente 9.000 muestras del conjunto ZoomGain, con el objetivo de que el modelo pueda inspeccionar detalles pequenos en imagenes grandes en una sola pasada hacia delante, sin necesidad de invocar herramientas externas de recorte o zoom. Esta conversión concreta la publica el usuario comunitario way2049, no inclusionAI, y está pensada para ejecutarse en Apple Silicon mediante `mlx-vlm`.

El interés del modelo radica en su propuesta de "atención al detalle sin herramientas": en lugar de depender de un pipeline agéntico que recorte y reconsulte la imagen varias veces, ZoomGain intenta resolver la tarea de percepción fina en un único forward pass. Según la model card, el modelo base en BF16 obtiene 55,48 en el benchmark bilingüe completo de 1.000 preguntas del paper, frente a 32,13 de Qwen3.5-9B, lo que sugiere una mejora sustancial en tareas de atributos finos, conteo y OCR sobre imágenes.

Esta build de 8 bits ocupa 10,4 GB de repositorio y contiene 9.409.813.744 parámetros en safetensors. Es relevante para desarrolladores que quieran probar percepción visual de detalle en un Mac con memoria unificada de 24 GB o superior, aunque la precisión de esta cuantización concreta aún no ha sido medida por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (visión-lenguaje) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); existe una variante hermana de 4 bits |
| Idiomas soportados | no disponible (el benchmark del paper es bilingüe, pero no se detallan idiomas) |
| Licencia | other (los pesos upstream no declaran licencia; pendiente de respuesta de inclusionAI) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base ZoomGain-9B se apoya en la arquitectura Qwen3.5, un transformer multimodal de tipo visión-lenguaje que procesa imagen y texto conjuntamente. Sobre esa base, inclusionAI aplicó entrenamiento por refuerzo (RL) con aproximadamente 9.000 muestras del conjunto ZoomGain, orientadas a que el modelo aprenda a localizar y describir detalles pequenos dentro de imágenes de alta resolución en una única pasada, sin recortes ni llamadas a herramientas de zoom. El paper asociado es arXiv:2611.14076v1.

Esta build concreta es una cuantización a 8 bits realizada con MLX para Apple Silicon. No se trata de un reentrenamiento ni de un ajuste fino: el autor indica explícitamente que es una conversión comunitaria para `@way2049`, no una release oficial de inclusionAI, y que no se han medido aún las métricas de precisión de esta variante de 8 bits, solo pruebas de velocidad y memoria. La variante hermana de 4 bits sí fue evaluada sobre un subconjunto de 200 ítems en inglés del ZoomGainBench.

## Capacidades

- Generación de texto e imagen-a-texto conversacional (pipeline `image-text-to-text`).
- Percepción de detalles finos en imágenes grandes en una sola pasada, sin herramientas de recorte.
- Preguntas de atributos visuales (color, forma, posición de objetos pequenos).
- Conteo de objetos, con limitaciones documentadas en patrones simétricos repetidos.
- OCR de texto pequeno, categoría más débil según la evaluación de la variante de 4 bits (48,70%).
- Modo "thinking" de Qwen3.5 disponible, aunque el autor recomienda desactivarlo para respuestas cortas y greedy.
- Soporte de cuantización 8 bits para ejecución local en Apple Silicon vía `mlx-vlm`.
- No se documentan en la información disponible capacidades de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Inspección de imágenes de alta resolución en local: el modelo puede describir detalles pequenos de una fotografía sin recortar ni preprocesar la imagen, gracias a su entrenamiento específico para atención fina en una sola pasada.
- Asistencia a personas con discapacidad visual: descripción detallada de escenas y objetos pequenos en tiempo real sobre un Mac, con la ventaja de que no requiere conexión a la nube ni herramientas externas.
- Análisis de documentos y carteles: lectura de texto pequeno en señales, etiquetas o carteles, aunque el OCR es su punto más flojo y conviene validar resultados.
- Catalogación y moderación de imágenes: clasificación y descripción de contenido visual con foco en atributos concretos (color de un objeto, presencia de un elemento), útil en pipelines de revisión.
- Prototipado de producto en Apple Silicon: validar rápidamente si un modelo de 9B con capacidades de detalle visual encaja en una app de escritorio antes de invertir en infraestructura GPU.
- Investigación en percepción multimodal: reproducir y comparar el comportamiento de ZoomGain frente a Qwen3.5 y modelos agénticos con recorte, usando la build de 8 bits como referencia de calidad cercana a BF16.
- Evaluación de cuantizaciones: servir como punto de comparación entre 4 bits, 8 bits y BF16 para estudiar la degradación de precisión en tareas de detalle visual.

## Benchmarks y rendimiento

El autor no ha medido la precisión de esta build de 8 bits. La tabla siguiente reproduce los resultados de la variante hermana de 4 bits sobre un subconjunto de 200 ítems en inglés del ZoomGainBench, con semilla 20261118 y el scorer oficial, junto con referencias del modelo base y Grok 4.7.

| Configuracion | Overall | attr (94) | counting (19) | ocr (87) |
|---|---:|---:|---:|---:|
| Grok 4.7, hasta 2 autocrops (agentico) | 76,23% | 75,53% | 73,68% | 77,54% |
| ZoomGain-9B MLX 4-bit, una pasada | 52,68% | 53,19% | 68,42% | 48,70% |
| Grok 4.7, una pasada sin recorte | 33,13% | 30,85% | 63,16% | 29,04% |
| Qwen3.5-9B MLX 4-bit, una pasada | 31,69% | 23,40% | 63,16% | 33,77% |
| ZoomGain-9B MLX 8-bit (este repo) | no medido | no medido | no medido | no medido |

En el benchmark bilingüe completo de 1.000 preguntas, el paper reporta 32,13 para Qwen3.5-9B y 55,48 para ZoomGain-9B en BF16. No se dispone de resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria unificada: la build completa ocupa 10,4 GB en disco; el autor la probó en un Mac mini con M4 Pro y 24 GB de memoria unificada, por lo que se necesita al menos esa cantidad para ejecución cómoda.
- GPU recomendadas: Apple Silicon (M4 Pro y superiores) mediante MLX; no se documenta soporte para CUDA en esta build.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con 24 GB o más de memoria unificada; no se especifican requisitos para GPUs NVIDIA de consumo.
- Opciones de despliegue: `mlx-vlm >= 0.8.0` (CLI `python -m mlx_vlm generate` y API Python `mlx_vlm.load`/`generate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: el autor realizó una prueba de humo de velocidad y memoria el 2026-11-18 en macOS 26.5.1 con una imagen NASA Apollo 17, prompt de 923 tokens, temperatura 0 y máximo 128 tokens, pero la tabla de métricas aparece truncada en la información disponible, por lo que no se pueden citar cifras concretas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZoomGain-9B-MLX-8bit | 9,41B | no disponible | no medido (4-bit: 52,68% en slice de 200) | other | Hugging Face, MLX |
| Qwen3.5-9B | 9B (aprox.) | no disponible | 31,69% (4-bit MLX, una pasada); 32,13 en paper | no disponible | Hugging Face |
| Grok 4.7 (sin recorte) | no disponible | no disponible | 33,13% (una pasada) | propietaria | API |
| Grok 4.7 (agentico, 2 autocrops) | no disponible | no disponible | 76,23% | propietaria | API |
| ZoomGain-9B-MLX-4bit | 9,41B | no disponible | 52,68% (slice de 200) | other | Hugging Face, MLX |

## Limitaciones y advertencias

- La precisión de esta build de 8 bits no ha sido medida; solo se han hecho pruebas de velocidad y memoria.
- El OCR de texto pequeno es la categoría más débil según la variante de 4 bits (48,70%), con errores documentados en direcciones y logotipos.
- El conteo puede fallar en patrones repetidos sobre superficies simétricas (ejemplo documentado: respondió 6 cuando la respuesta correcta era 3).
- El scoring sensible a mayúsculas penaliza respuestas correctas con capitalización distinta (ejemplo: "Hotlink" frente a "HOTLiNK").
- Los pesos upstream no declaran licencia; el autor ha etiquetado como `other` y está a la espera de respuesta de inclusionAI, con posibilidad de retirar el repositorio. No se garantiza uso comercial.
- Es una conversión comunitaria no oficial; no hay soporte de inclusionAI.
- No se documentan idiomas soportados, longitud de contexto ni capacidades de tool calling.
- El modo thinking de Qwen3.5 está disponible pero el autor recomienda desactivarlo para respuestas cortas.
- Solo se ha probado en Apple Silicon con MLX; no hay evidencia de funcionamiento en otras plataformas.
- Riesgo de alucinación inherente a modelos de 9B en tareas de percepción fina; conviene validar en producción.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/way2049/ZoomGain-9B-MLX-8bit
- Modelo base: https://huggingface.co/inclusionAI/ZoomGain-9B
- Variante hermana de 4 bits: https://huggingface.co/way2049/ZoomGain-9B-MLX-4bit
- Paper: https://arxiv.org/abs/2611.14076
- Issue de licencia en GitHub: https://github.com/inclusionAI/ZoomGain/issues/2
