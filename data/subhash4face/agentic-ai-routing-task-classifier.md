# subhash4face/agentic-ai-routing-task-classifier

## Resumen

El modelo `subhash4face/agentic-ai-routing-task-classifier` es un clasificador de tareas basado en el modelo `microsoft/deberta-v3-small`, fine-tuneado por el desarrollador `subhash4face` para enrutar un prompt de usuario hacia una de 11 categorías de tarea. El objetivo es dotar a sistemas agénticos de un mecanismo de routing previo: antes de enviar una consulta a un LLM o a un agente especializado, el modelo determina si la tarea es de respuesta a preguntas, resumen, codificación, razonamiento, tareas agénticas, creativas, traducción, clasificación, extracción, contexto largo o tareas rápidas y simples.

Se trata de un modelo encoder-only, con 141.903.371 parámetros, lo que lo hace ligero y adecuado para inferencia de baja latencia. El repositorio incluye pesos en formato `safetensors`, tokenizer, configuración, métricas de evaluación y un script de inferencia autónomo. Su relevancia radica en permitir que pipelines de agentes tomen decisiones de enrutamiento de forma rápida y determinista, sin depender de un LLM grande para clasificar la intención.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-small) |
| Parametros totales | 141.903.371 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura DeBERTa-v3-small, un transformer encoder con atención desacoplada, perteneciente a la familia DeBERTa de Microsoft. En el proceso de fine-tune se sustituyó la cabecera de salida para clasificar secuencias en 11 clases predefinidas. El repositorio incluye un `dataset_manifest.json` con estadísticas del conjunto de datos y métricas de fuga, pero no se han proporcionado detalles sobre la composición del corpus, el número de tokens de entrenamiento ni el proceso de optimización. Tampoco se menciona el uso de técnicas como RLHF o DPO, dado que se trata de un clasificador de secuencias y no de un modelo generativo. El entrenamiento parece haber sido realizado con una configuración estándar de clasificación, según se deduce de los archivos `training_args.json` y `metrics.json` incluidos en el bundle.

## Capacidades

- Clasificación de prompts en 11 categorías: `QA`, `Summary`, `Coding`, `Reasoning`, `Agentic`, `Creative`, `Translation`, `Classification`, `Extraction`, `Long-context` y `Fast/simple`.
- Inferencia independiente mediante el script `route_prompt.py`, que carga los pesos y el tokenizer y devuelve la etiqueta y la probabilidad asociada.
- Puede integrarse como componente de routing en pipelines de agentes, permitiendo decidir qué agente o modelo debe procesar cada consulta.
- No es un modelo generativo: no produce texto ni mantiene conversaciones por sí mismo, sino que actúa como clasificador de entrada.
- No incluye soporte nativo de tool calling ni de razonamiento multi-step; su función es únicamente clasificar la tarea.

## Casos de uso

- Enrutamiento de prompts en sistemas agénticos: el modelo se coloca antes de un orquestador de agentes; ante una consulta del usuario, decide si corresponde a `Coding`, `Reasoning` o `Agentic`, y redirige la solicitud al agente adecuado.
- Optimización de costes en pipelines de LLM: una consulta clasificada como `Fast/simple` puede enrutarse a un modelo pequeño o a una respuesta plantilla, mientras que las tareas `Reasoning` o `Long-context` se envían a un modelo grande y más costoso.
- Clasificación de tickets en sistemas de atención al cliente: las solicitudes entrantes se clasifican como `QA`, `Summary`, `Translation` o `Extraction`, permitiendo automatizar el flujo de trabajo según el tipo de petición.
- Preprocesamiento en herramientas de documentación: en un sistema que genera o resume documentación, el clasificador distingue entre `Summary`, `Coding` y `Creative`, seleccionando la plantilla o el modelo adecuado para cada caso.
- Detección de tareas de contexto largo: si el prompt se clasifica como `Long-context`, el pipeline puede activar mecanismos de recuperación aumentada o ampliar la ventana de contexto antes de procesar la consulta.
- Orquestación de tareas en asistentes virtuales: el modelo permite que un asistente distribuya las peticiones entre módulos especializados (por ejemplo, traducción, extracción de datos o clasificación de intenciones) sin necesidad de recurrir a un LLM generativo para cada paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un archivo `metrics.json` con métricas de evaluación sobre el conjunto de validación, pero no se han facilitado los valores en la documentación pública.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en precisión FP32 (para los 141,9 millones de parámetros); en FP16 o cuantización 8-bit, la carga se reduce a unos 0,3 GB o 0,15 GB respectivamente.
- GPU recomendadas: cualquier tarjeta con al menos 1 GB de VRAM, incluyendo gamas bajas como NVIDIA GTX 1650 o RTX 3050. También puede ejecutarse en CPU con un coste computacional muy bajo.
- Es apto para consumer GPUs y para despliegue en entornos sin GPU.
- Opciones de despliegue: puede servirse mediante Hugging Face Transformers, ONNX Runtime, TorchServe o un contenedor FastAPI. Al ser un clasificador, no requiere vLLM ni TGI.
- Latencia esperada: en una GPU moderna, la inferencia de una sola secuencia se completa en unos pocos milisegundos; en CPU, en decenas de milisegundos, dependiendo de la longitud del texto.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No se especifica la licencia del modelo, por lo que el uso comercial requiere una verificación previa con el autor o el repositorio.
- Los idiomas soportados no están documentados. Dado que el tokenizer procede de DeBERTa-v3, es probable que el modelo funcione razonablemente en inglés, pero el rendimiento en otros idiomas no está garantizado.
- La longitud de contexto no está indicada; si se hereda la configuración de DeBERTa-v3-small, podría estar limitada a 512 tokens, lo que restringe el uso en entradas muy largas.
- No se han publicado evaluaciones de sesgos ni de alucinación. Como clasificador, no genera texto, pero puede clasificar incorrectamente prompts ambiguos.
- El repositorio no incluye información sobre el conjunto de datos de entrenamiento, su tamaño ni su procedencia, lo que dificulta la evaluación de la robustez y la generalización.
- Al tratarse de un modelo pequeño y específico, puede tener dificultades con tareas que no se correspondan claramente con las 11 clases predefinidas.

## Enlaces

- HuggingFace: https://huggingface.co/subhash4face/agentic-ai-routing-task-classifier
- Repositorio del modelo (árbol de archivos): https://huggingface.co/subhash4face/agentic-ai-routing-task-classifier/tree/main

No se encontraron enlaces adicionales relevantes en la búsqueda web.
