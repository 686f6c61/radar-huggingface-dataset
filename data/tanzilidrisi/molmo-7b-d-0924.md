# tanzilidrisi/Molmo-7B-D-0924

## Resumen

Molmo 7B-D es un modelo multimodal de visión y lenguaje (image-text-to-text) desarrollado por el Allen Institute for AI (Ai2). Se trata de una variante de la familia Molmo construida sobre el modelo de lenguaje Qwen2-7B y el backbone visual OpenAI CLIP ViT-L/14-336, entrenada sobre el dataset PixMo (aproximadamente 1 millón de pares imagen-texto altamente curados). El checkpoint aquí referenciado es un espejo del original `allenai/Molmo-7B-D-0924` publicado por el usuario `tanzilidrisi`.

El modelo resuelve tareas de descripción de imágenes, respuesta a preguntas visuales, conteo de objetos, lectura de texto en imágenes y razonamiento visual básico, con un rendimiento que el propio autor sitúa entre GPT-4V y GPT-4o en benchmarks académicos y en evaluación humana. Es relevante por su carácter completamente abierto (pesos, datos y código publicados de forma progresiva) y por su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales.

Con 8.021 millones de parámetros y un repo de 32,1 GB en formato safetensors, el modelo está pensado para despliegue en una única GPU de 24 GB o superior con precisión bf16, y admite ejecución con `transformers` mediante código personalizado (`trust_remote_code=True`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: LLM Qwen2-7B + vision encoder OpenAI CLIP ViT-L/14-336 |
| Parametros totales | 8.021.025.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (se documenta ejecucion en float32 y bfloat16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un codificador visual CLIP ViT-L/14-336 con el modelo de lenguaje Qwen2-7B, conectados mediante un adaptador multimodal entrenado de extremo a extremo. El entrenamiento se realizó sobre PixMo, un conjunto de aproximadamente 1 millón de pares imagen-texto curados específicamente para tareas de visión y lenguaje de alta calidad, lo que explica el rendimiento destacado del modelo en tareas de descripción detallada y conteo. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

El modelo se distribuye como un checkpoint de vista previa (preview) del release Molmo; el autor indica que los artefactos completos (dataset PixMo, código de entrenamiento, evaluaciones y checkpoints intermedios) se publicarán en una fase posterior. La inferencia se documenta con `transformers` usando `trust_remote_code=True`, con soporte para `torch.autocast` en bf16 y para pesos en bf16, aunque el propio autor advierte que ejecutar con pesos bf16 puede alterar las salidas respecto a float32. También se documenta soporte en vLLM, con la recomendación de usar versiones anteriores o iguales a 0.7.2 hasta que se resuelva un bug de preprocesamiento en el repositorio de vLLM.

## Capacidades

- Generación de descripciones detalladas de imágenes, incluyendo perspectiva, objetos, materiales y contexto.
- Respuesta a preguntas visuales (VQA) sobre contenido de la imagen.
- Conteo de objetos en escenas complejas.
- Lectura y transcripción de texto presente en imágenes (OCR visual).
- Razonamiento visual de un solo paso sobre relaciones espaciales y atributos.
- Generación de texto e instrucciones en inglés (idioma declarado: en).
- Conversación multimodal multi-turno mediante el pipeline `image-text-to-text`.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la información disponible.
- No se documenta soporte de audio ni de vídeo en la información disponible.

## Casos de uso

- Descripción automática de imágenes para accesibilidad: el modelo genera descripciones ricas en detalle que pueden alimentar lectores de pantalla o etiquetas alt en catálogos web, aprovechando el entrenamiento sobre pares imagen-texto curados.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios para detectar contenido no deseado antes de su publicación, usando el modelo como primer filtro descriptivo.
- Extracción de información de documentos escaneados: lectura de texto en imágenes (OCR visual) para digitalizar facturas, formularios o etiquetas y estructurar los datos extraídos.
- Automatización de comercio electrónico: generación de fichas de producto y descripciones a partir de fotografías de catálogo, con conteo de artículos y atributos visibles.
- Asistencia en investigación con imágenes científicas: descripción y respuesta a preguntas sobre muestras, gráficos o capturas de laboratorio en inglés, integrable en pipelines de `transformers` con `device_map='auto'`.
- Análisis de imágenes en atención al cliente: interpretación de capturas de pantalla o fotos enviadas por el usuario para diagnosticar incidencias y responder con texto en inglés.
- Evaluación comparativa de modelos visuales: uso del checkpoint como referencia abierta con licencia Apache 2.0 para reproducir las métricas publicadas de la familia Molmo.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Modelo | Media en 11 benchmarks académicos | Elo de preferencia humana |
|---|---|---|
| Molmo 72B | 81,2 | 1077 |
| Molmo 7B-D (este modelo) | 77,3 | 1056 |
| Molmo 7B-O | 74,6 | 1051 |
| MolmoE 1B | 68,6 | 1032 |
| GPT-4o | 78,5 | 1079 |
| GPT-4V | 71,1 | 1041 |
| Gemini 1.5 Pro | 78,3 | 1074 |
| Gemini 1.5 Flash | 75,1 | 1054 |
| Claude 3.5 Sonnet | 76,7 | 1069 |
| Claude 3 Opus | 66,4 | 971 |
| Claude 3 Haiku | 65,3 | 999 |
| Qwen VL2 72B | 79,4 | no disponible en el fragmento proporcionado |

No se han publicado resultados desagregados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: en torno a 32 GB solo para pesos, más activaciones y caché KV; requiere GPU de 40 GB o superior (A100 40GB, A100 80GB, H100).
- VRAM estimada en bfloat16: aproximadamente 16 GB para pesos, más overhead de activaciones y KV; encaja en GPU de 24 GB como RTX 4090 o L40S con margen limitado.
- El repo ocupa 32,1 GB, coherente con pesos en float32; la descarga completa requiere ese espacio en disco.
- GPU recomendadas: A100 40GB/80GB o H100 para float32; RTX 4090, L40S o A6000 para bf16.
- Cabe en GPU consumer de gama alta (RTX 4090 24 GB) en bf16, con posible ajuste adicional mediante cuantización no documentada en la información disponible.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `device_map='auto'`; vLLM (versión ≤ 0.7.2 por el bug de preprocesamiento); no se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media 11 benchmarks | Elo humano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Molmo 7B-D | 8,02 B | no disponible | 77,3 | 1056 | Apache 2.0 | Pesos abiertos en HF |
| Molmo 7B-O | no disponible | no disponible | 74,6 | 1051 | Apache 2.0 | Pesos abiertos en HF |
| Molmo 72B | no disponible | no disponible | 81,2 | 1077 | Apache 2.0 | Pesos abiertos en HF |
| Qwen VL2 72B | no disponible | no disponible | 79,4 | no disponible | no disponible | Pesos abiertos |
| GPT-4V | propietario | no disponible | 71,1 | 1041 | propietaria | Solo API |
| Gemini 1.5 Flash | propietario | no disponible | 75,1 | 1054 | propietaria | Solo API |

## Limitaciones y advertencias

- Modelo entrenado y declarado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Checkpoint de vista previa (preview): los artefactos completos de entrenamiento y evaluación aún no están publicados, lo que dificulta la reproducibilidad total.
- Riesgo de alucinación en descripciones de imágenes ambiguas o de baja resolución; el modelo puede inventar detalles no presentes en la imagen.
- Ejecutar con pesos bf16 puede alterar las salidas respecto a float32, según advierte el propio autor; las evaluaciones publicadas se hicieron con autocast y pesos float32.
- Dependencia de `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio y revisarlo antes de usarlo en producción.
- En vLLM, usar versión ≤ 0.7.2 hasta que se resuelva el bug de preprocesamiento documentado en el issue 26451.
- No se documentan sesgos específicos conocidos en la información proporcionada; al heredar el LLM base Qwen2-7B, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los componentes base (Qwen2-7B y CLIP ViT-L/14-336) antes de redistribuir.
- Este repositorio es un espejo publicado por un tercero (`tanzilidrisi`); para producción se recomienda referenciar el repositorio oficial `allenai/Molmo-7B-D-0924`.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/tanzilidrisi/Molmo-7B-D-0924
- Repositorio oficial: https://huggingface.co/allenai/Molmo-7B-D-0924
- Colección de la familia Molmo: https://huggingface.co/collections/allenai/molmo-66f379e6fe3b8ef090a8ca19
- Blog del anuncio: https://molmo.allenai.org/blog
- Paper: https://molmo.allenai.org/paper.pdf
- Paper en Hugging Face: https://huggingface.co/papers/2409.17146
- Demo: https://molmo.allenai.org/
- Modelo base LLM: https://huggingface.co/Qwen/Qwen2-7B
- Backbone visual: https://huggingface.co/openai/clip-vit-large-patch14-336
- Issue de vLLM sobre preprocesamiento: https://github.com/vllm-project/vllm/issues/26451
