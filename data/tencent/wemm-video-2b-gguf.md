# tencent/WeMM-Video-2B-GGUF

## Resumen

WeMM-Video-2B-GGUF es la versión cuantizada en formato GGUF (receta Q4_K_M) del modelo WeMM-Video-2B, desarrollado por Tencent. Se trata de un modelo multimodal bilingüe chino-inglés orientado a la comprensión y el razonamiento conjunto de audio y vídeo (omni-modal), capaz de aceptar texto, imágenes, audio y vídeo como entrada y generar respuestas de texto. Forma parte de la familia WeMM-Video, cuyo informe técnico se publica en arXiv (2611.26409).

El bundle GGUF distribuye el modelo en tres ficheros separados: el modelo de lenguaje con tokenizer y plantilla de chat (`language.gguf`, 2,34 GiB), el codificador visual y su proyector (`mmproj.gguf`, 0,62 GiB) y el codificador de audio con su proyector (`audio.gguf`, 1,99 GiB). Este empaquetado está pensado para el runtime nativo propio de WeMM, no para llama.cpp genérico, lo que condiciona su despliegue.

El modelo base declara 1.070.382.088 parámetros en safetensors (aproximadamente 1,07 mil millones, pese al "2B" del nombre comercial) y está etiquetado con arquitectura `qwen3_5`, lo que sugiere una columna vertebral derivada de la familia Qwen 3.5. Su relevancia actual radica en ofrecer comprensión audio-visual conjunta en un tamaño reducido y con licencia Apache 2.0, algo poco habitual en modelos omni-modales abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (transformer multimodal con codificador visual y codificador de audio; etiqueta `custom_code`) |
| Parametros totales | 1.070.382.088 (modelo base en safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (tensores de atención y E/S seleccionados en BF16); no se documentan otras recetas |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (bundle de tres ficheros: `language.gguf`, `mmproj.gguf`, `audio.gguf`); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre una arquitectura de tipo transformer etiquetada como `qwen3_5`, con componentes adicionales para percepción multimodal: un codificador visual con proyector (`mmproj.gguf`) y un codificador de audio con proyector (`audio.gguf`). El modelo de lenguaje, el tokenizer y la plantilla de chat se empaquetan en `language.gguf`. La etiqueta `custom_code` en el repositorio indica que la carga requiere código específico del autor, y la model card remite al runtime nativo de WeMM para la inferencia.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se describen innovaciones técnicas concretas más allá de la integración conjunta de audio y vídeo. La model card menciona dos modos de operación (Thinking e Instruct) con parámetros de muestreo recomendados distintos, lo que sugiere un modo de razonamiento explícito ("thinking") análogo al de otras familias recientes. Para los detalles de entrenamiento y evaluación, la model card remite al informe técnico en arXiv y a la página de evaluación de la variante WeMM-Video-35B-A3B.

## Capacidades

- Comprensión de vídeo: descripción de escenas a partir de fotogramas, con control del número de frames (`--max-frames`).
- Comprensión audio-visual conjunta: procesamiento simultáneo de pistas de vídeo y audio original (`--video-audio`) para describir la escena y resumir el habla.
- Comprensión de audio: transcripción de habla (el ejemplo de la model card transcribe una grabación en inglés).
- Comprensión de imágenes: descripción y análisis de imágenes estáticas.
- Generación de texto y razonamiento: incluye un modo "Thinking" con parámetros de muestreo propios para tareas de razonamiento (el ejemplo de la model card resuelve un problema aritmético de horarios).
- Modo Instruct para tareas generales, separado del modo Thinking.
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible en la información proporcionada (el modo Thinking sugiere razonamiento interno, pero no se documentan capacidades de agente).

## Casos de uso

- Análisis de reuniones y videollamadas: el modelo puede recibir el vídeo con su pista de audio y generar un resumen de la escena junto con la transcripción o síntesis del habla, gracias al procesamiento conjunto de audio y vídeo en una sola pasada.
- Indexación y descripción automática de archivos audiovisuales: descripción de escenas a partir de un número configurable de fotogramas (`--max-frames`), útil para generar metadatos y catálogos de bibliotecas de vídeo.
- Transcripción y análisis de grabaciones de audio: el codificador de audio permite transcribir habla en inglés o chino y combinarla con tareas de razonamiento sobre el contenido.
- Asistentes de accesibilidad: generación de descripciones de contenido visual (imágenes y vídeo) y resumen del audio para usuarios con discapacidad visual o auditiva.
- Moderación y análisis de contenido multimedia: revisión de vídeos e imágenes con un modelo pequeño (1,07 mil millones de parámetros) que puede desplegarse en infraestructura modesta, reduciendo el coste frente a modelos omni-modales de mayor tamaño.
- Procesamiento en local o en el borde: el bundle GGUF Q4_K_M (unos 5 GB en total) y el runtime nativo con soporte de offload a CUDA permiten ejecutar inferencia multimodal en entornos con recursos limitados, incluyendo validación en CPU según la model card.
- Tareas de razonamiento sobre contenido multimedia: el modo Thinking permite resolver problemas aritméticos o lógicos planteados junto a una imagen, audio o vídeo (por ejemplo, calcular el final de una reunión a partir de su duración).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras propias y remite a la página de evaluación de WeMM-Video-35B-A3B para la comparativa del informe técnico, que corresponde a otra variante de la familia. La validación descrita se limita a comprobaciones de generación con el runtime nativo en CPU para texto, imagen, audio y vídeo con pista de sonido.

## Requisitos de hardware

- VRAM estimada para inferencia: el bundle Q4_K_M ocupa aproximadamente 4,95 GiB en disco (2,34 + 0,62 + 1,99 GiB); con overhead de contexto y buffers de activación, se puede estimar un uso de VRAM en el rango de 6 a 8 GB, aunque no se publica una cifra oficial.
- GPU recomendadas: no se especifican modelos concretos; el runtime nativo documenta offload a CUDA, por lo que se puede repartir la carga entre CPU y GPU.
- GPU de consumo: por tamaño, el bundle debería caber en GPUs de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070 en adelante), si bien esta estimación no está confirmada por el autor.
- Opciones de despliegue: runtime nativo de WeMM (con binarios `native/install-cpu` y soporte CUDA) mediante `native/run_hf.py`; no se indica compatibilidad con llama.cpp, Ollama, vLLM o TGI, y la etiqueta `custom_code` sugiere que los runners genéricos de GGUF no son suficientes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Video-2B-GGUF (este) | ~1,07 mil millones | no disponible | texto, imagen, audio, vídeo | Apache 2.0 | GGUF (runtime propio) |
| WeMM-Video-35B-A3B | no disponible (MoE, 3B activos según nombre) | no disponible | texto, imagen, audio, vídeo | Apache 2.0 (según colección) | no disponible |
| Alternativas omni-modales abiertas de tamaño pequeño | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con la variante mayor de la misma familia (WeMM-Video-35B-A3B), para la que no se detallan parámetros ni contexto. No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de otros autores en la información disponible.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está documentado y probablemente sea limitado.
- Contexto: no se publica la longitud máxima de contexto, lo que dificulta planificar el procesamiento de vídeos largos; el control de `--max-frames` sugiere que la ventana efectiva depende del número de fotogramas muestreados.
- Despliegue restringido: el bundle está diseñado para el runtime nativo de WeMM y requiere código personalizado (`custom_code`); no se garantiza su funcionamiento en llama.cpp, Ollama u otros runners GGUF estándar.
- Consistencia del bundle: la model card advierte de que los tres ficheros GGUF deben mantenerse en la misma revisión del Hub; mezclar revisiones puede romper la inferencia.
- Alucinación: no se documentan tasas ni evaluaciones de fidelidad; como todo modelo generativo multimodal, puede producir descripciones inexactas de escenas o transcripciones erróneas, especialmente con audio de baja calidad.
- Sesgos: no se publica información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero los componentes de terceros quedan sujetos a sus términos originales, según se indica en el repositorio de GitHub.
- Parámetros de muestreo: los ajustes recomendados varían por modalidad y modo (Thinking/Instruct) y requieren un runtime que exponga esos controles; el runner de ejemplo usa la decodificación integrada y no los aplica.
- Tamaño real: pese al nombre "2B", el recuento de safetensors es de aproximadamente 1,07 mil millones de parámetros, lo que conviene tener en cuenta al comparar con otros modelos.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/tencent/WeMM-Video-2B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Video-2B
- Colección WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Guía del runtime nativo: https://github.com/Tencent/WeMM-Video/blob/main/native/README.md
- Evaluación de WeMM-Video-35B-A3B: https://huggingface.co/tencent/WeMM-Video-35BA3B#evaluation
- Licencia y atribución de terceros: https://github.com/Tencent/WeMM-Video/blob/main/LICENSE
