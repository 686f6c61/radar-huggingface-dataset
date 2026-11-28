# unsloth/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de desarrollador: sistemas agénticos con uso de herramientas, asistentes de código, chatbots y pipelines de generación aumentada por recuperación (RAG). El repositorio de Unsloth (`unsloth/Inkling-2-Mini`) redistribuye los pesos originales en formatos cuantizados, incluyendo versiones GGUF, lo que facilita su despliegue en hardware de consumo.

Arquitectura y escala son sus rasgos diferenciales. Se trata de un transformer decoder-only de 24 capas con capas de alimentación directa de tipo Mixture-of-Experts disperso: cada token se enruta a 8 de 128 expertos por capa. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa a partir de 24 capas de pesos. El modelo totaliza 26.400 millones de parámetros, con 3.400 millones activos por pasada y unos 5.400 millones efectivos por token al ejecutarse con tres pasadas del bucle. La atención combina capas locales y globales, y la modalidad visual se incorpora mediante un vision transformer que proyecta imágenes y texto a un espacio oculto compartido.

La ventana de contexto alcanza 1.000.000 de tokens, un valor muy por encima de lo habitual en modelos de este tamaño, lo que lo sitúa como candidato para tareas de documento largo, análisis de repositorios completos y conversaciones de muchas vueltas. Los pesos se distribuyen en un único checkpoint de unos 20 GB en precisiones mixtas NVFP4 y MXFP8, y el modelo puede ejecutarse en un NVIDIA DGX Spark, en Apple Silicon con 32 GB o más de memoria unificada, o en GPUs con 32 GB o más de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y bucle de capas compartidas (looped transformer) |
| Parametros totales | 26.400 millones (26.388.646.440 según safetensors) |
| Parametros activos | 3.400 millones por pasada; 5.400 millones efectivos por token (tres pasadas) |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 (checkpoint oficial); GGUF cuantizado vía Unsloth y llama.cpp; 8-bit (tag del repo) |
| Idiomas soportados | Inglés y soporte multilingüe general (no se detalla lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF en la redistribución de Unsloth |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo multimodal con 24 capas y capas MoE dispersas en las posiciones de feed-forward: cada token se enruta a 8 de 128 expertos por capa. La innovación estructural principal es el bucle de capas: las 12 capas centrales se aplican tres veces con pesos compartidos, de modo que un token recibe 48 aplicaciones de capa a partir de solo 24 conjuntos de pesos. Según la model card, cada pasada adicional por las capas en bucle añade aproximadamente 1.000 millones de parámetros activos efectivos, lo que explica la diferencia entre los 3.400 millones activos por pasada y los 5.400 millones efectivos por token. La atención es híbrida, con capas locales y globales combinadas, y la entrada visual se procesa mediante un vision transformer cuyas representaciones se proyectan al mismo espacio oculto que el texto, de forma que el decoder procesa conjuntamente ambas modalidades.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet y repositorios accesibles, de terceros, generados internamente y sintéticos o aumentados. El proceso de curación comprende limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y para objetivos de seguridad. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco detalla innovaciones de decodificación como decodificación especulativa. La información disponible no permite confirmar estos extremos.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, con soporte de instrucciones y uso conversacional general.
- Comprensión de imágenes: entrada de cualquier imagen basada en píxeles, con rendimiento óptimo cuando cada dimensión está entre 40 y 4096 píxeles.
- Procesamiento conjunto de imagen y texto en un espacio oculto compartido, lo que habilita tareas de image-text-to-text como descripción, respuesta a preguntas visuales y extracción de información de documentos.
- Generación de código en múltiples lenguajes de programación, según indica la model card.
- Soporte multilingüe general, con inglés como idioma principal.
- Uso en sistemas agénticos y de uso de herramientas, según la orientación declarada por el autor para aplicaciones de desarrollador.
- Contexto largo de hasta 1.000.000 de tokens para conversaciones multi-turno y documentos extensos.
- Ajuste fino posterior soportado mediante las plataformas Miles y SkyRL, y acceso a fine-tuning vía Tinker.
- No se documentan capacidades de audio ni un modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Análisis de documentos largos y repositorios completos: con 1.000.000 de tokens de contexto, el modelo puede ingerir bases de código, expedientes o informes extensos en una sola pasada y responder preguntas que requieren cruzar información distribuida a lo largo de todo el documento, sin necesidad de fragmentación ni recuperación externa.
- Asistentes de código en producción: la model card declara soporte de múltiples lenguajes de programación y uso en asistentes de codificación; el modelo puede integrarse en pipelines de revisión, generación de parches y explicación de código, y su tamaño de 26.400 millones con 5.400 millones activos efectivos permite desplegarlo en una GPU de 32 GB o en Apple Silicon con 32 GB de memoria unificada.
- Sistemas agénticos con uso de herramientas: el autor lo orienta explícitamente a sistemas agénticos y tool-use, de modo que puede encadenar llamadas a funciones, consultas a APIs y pasos intermedios de razonamiento dentro de un bucle de agente, apoyándose en el contexto largo para mantener el estado de la tarea.
- Generación aumentada por recuperación (RAG): el modelo está diseñado para pipelines RAG; puede recibir varios documentos recuperados junto con la consulta del usuario y sintetizar una respuesta citando y contrastando fragmentos, con la ventaja de que el contexto de 1M tokens reduce la necesidad de recortar pasajes.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con historial extenso, incluyendo la posibilidad de adjuntar capturas de pantalla o documentos del cliente gracias a la entrada de imagen, y mantener coherencia a lo largo de interacciones largas sin perder el hilo.
- Extracción de información de documentos visuales: facturas, formularios, tablas e infografías pueden procesarse directamente como imagen y texto combinados, con el rango recomendado de 40 a 4096 píxeles por dimensión, para extraer campos estructurados y devolverlos como texto.
- Despliegue en hardware de consumo y estaciones locales: al caber en un DGX Spark, en Mac con 32 GB o más, y en GPUs de 32 GB de VRAM, es adecuado para prototipado local, entornos con requisitos de privacidad y aplicaciones de escritorio mediante Ollama, llama.cpp o Llama App.
- Ajuste fino específico de dominio: las plataformas Miles y SkyRL permiten post-entrenamiento sobre los pesos abiertos, útil para adaptar el modelo a vocabulario técnico, normativa interna o estilo de marca manteniendo la licencia Apache 2.0.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero en la información proporcionada la tabla aparece truncada y no se exponen los valores numéricos de ninguna métrica ni de ninguno de los modelos. Por tanto, no es posible presentar resultados concretos.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint oficial ocupa unos 20 GB en precisiones mixtas NVFP4 y MXFP8; se recomiendan 32 GB o más de VRAM para otras GPUs y plataformas.
- GPU recomendadas: NVIDIA DGX Spark (soporte oficial); GPUs con 32 GB o más de VRAM en general. No se especifican modelos concretos como A100, H100 o RTX 4090 en la información disponible.
- Apple Silicon: MacBooks, Mac mini y Mac Studio con 32 GB o más de memoria unificada.
- Cabe en GPU de consumo: sí, siempre que se disponga de 32 GB o más de VRAM; las versiones GGUF cuantizadas de Unsloth y llama.cpp reducen adicionalmente el requisito.
- Opciones de despliegue: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp, Llama App, y en Apple Silicon Ollama y Exo Labs. Para post-entrenamiento: Miles y SkyRL. Acceso gestionado vía Tinker (API y playground).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La model card cita como comparables Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los datos de esos modelos en la información disponible aparecen truncados. La siguiente tabla recoge únicamente los datos confirmados de Inkling 2 Mini y marca el resto como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 5,4B efectivos | 1.000.000 tokens | Apache 2.0 | Pesos abiertos en Hugging Face; API vía Tinker | No disponible |
| Gemma 4 31B | No disponible | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer | No disponible | No disponible | No disponible | No disponible | No disponible |
| Qwen3.8-27B | No disponible | No disponible | No disponible | No disponible | No disponible |
| Nemotron 3.5 Super VL | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni resultados de evaluaciones de sesgo; al entrenarse con datos de internet, es esperable que herede sesgos presentes en esas fuentes, pero no hay cuantificación pública en la información disponible.
- Riesgo de alucinación: no se han publicado métricas de fidelidad ni de tasa de alucinación; como modelo generativo de propósito general, debe validarse la salida en aplicaciones de alta criticidad.
- Idiomas: el modelo está orientado principalmente al inglés, con soporte multilingüe general no detallado; el rendimiento en castellano u otros idiomas distintos del inglés no está cuantificado.
- Contexto: aunque la ventana es de 1.000.000 de tokens, no se documenta la degradación del rendimiento en longitudes extremas ni la estrategia de atención empleada para sostener ese contexto.
- Licencia: Apache 2.0 permite uso comercial, pero el autor remite a una Política de Uso Aceptable separada (`thinkingmachines.ai/model-acceptable-use-policy/`) que conviene revisar antes de desplegar en producción.
- Precisión numérica: el checkpoint oficial usa NVFP4 y MXFP8, formatos que pueden no estar soportados en todo el hardware; para GPUs sin soporte nativo de estos formatos será necesario recurrir a las versiones GGUF cuantizadas.
- Imágenes: el rendimiento óptimo se da con dimensiones entre 40 y 4096 píxeles; fuera de ese rango la calidad puede degradarse.
- Datos de entrenamiento incompletos: no se especifican el volumen de tokens, la composición exacta del dataset ni las etapas de alineación (RLHF/DPO), lo que limita la evaluación independiente del modelo.
- El repositorio de Unsloth es una redistribución de terceros; para trazabilidad y soporte conviene contrastar con el repositorio oficial de Thinking Machines.

## Enlaces

- Repositorio de Unsloth en Hugging Face: https://huggingface.co/unsloth/Inkling-2-Mini
- Repositorio oficial del modelo: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face sobre el modelo: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers en PyPI: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentación de Unsloth para el modelo: https://unsloth.ai/docs/models/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de Uso Aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
