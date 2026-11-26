# StatsGary/Qwen-D1

## Resumen

Qwen-D1 es un modelo de decisión (decision model) desarrollado por StatsGary a partir del modelo base unsloth/Qwen3.5-4B. A diferencia de un modelo generativo convencional, Qwen-D1 no produce texto: recibe un estado de entrada (`state`) junto con preguntas tipadas (`choice`, `noul` para sí/no y `score`) y devuelve probabilidades calibradas para cada opción. Está afinado con el `FastDecisionModel` de Unsloth sobre el dataset LocalLLaMA/typed-decisions, e incorpora una cabeza de decisión específica junto con un proceso de calibración.

El modelo se presenta como un "system-one decision model" orientado a tareas de enrutamiento, clasificación y puntuación dentro de flujos conversacionales o de agentes. Su relevancia actual radica en que ofrece una alternativa determinista y probabilística a la generación de texto libre para decisiones estructuradas, lo que facilita la integración en pipelines donde se necesita una salida acotada y calibrada en lugar de una respuesta en lenguaje natural.

Qwen-D1 tiene 4.237.797.892 parámetros totales y se distribuye en tres formatos: adaptadores LoRA de Unsloth (0,2 GB), safetensors fusionados en 16 bits con cabeza de decisión (8,8 GB) y GGUF en Q8_0 y Q4_K_M (7,1 GB), este último compatible con Ollama y llama.cpp. La licencia es LGPL-3.0 y el modelo está etiquetado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B) con cabeza de decisión añadida y calibración |
| Parametros totales | 4.237.797.892 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (según ejemplo de carga con `max_seq_length = 2048`); no se especifica el máximo del modelo base |
| Tipos de cuantizacion | 16 bits (safetensors fusionado), Q8_0 y Q4_K_M (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | LGPL-3.0 |
| Formato de pesos | safetensors, GGUF, adaptadores LoRA (PEFT) |
| Modelo base | unsloth/Qwen3.5-4B |
| Dataset de ajuste | LocalLLaMA/typed-decisions |
| Tamaño del repo | 33,9 GB |
| Descargas | 230 |
| Librería | peft |

## Arquitectura y entrenamiento

Qwen-D1 parte de la arquitectura transformer de Qwen3.5-4B, un modelo de 4B parámetros, y le añade una cabeza de decisión (`joint_head.safetensors` junto con `joint_head_config.json`) que transforma las representaciones internas en distribuciones de probabilidad sobre opciones tipadas. El ajuste se realiza mediante LoRA con el framework Unsloth (`FastDecisionModel`), lo que permite entrenar de forma eficiente y conservar los adaptadores por separado (0,2 GB) además de la versión fusionada en 16 bits.

El entrenamiento se lleva a cabo sobre el dataset LocalLLaMA/typed-decisions, diseñado específicamente para decisiones tipadas con tres modalidades: elección entre criterios (`choice`), respuesta binaria sí/no (`noul`) y puntuación sobre una escala (`score`). El modelo incorpora un componente de calibración que ajusta las probabilidades de salida. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Una innovación destacable es que el modelo no genera texto: expone sus respuestas a través de un endpoint específico `/v1/systemone` en Ollama y llama.cpp, lo que lo diferencia de los modelos conversacionales convencionales.

## Capacidades

- Clasificación y enrutamiento por elección (`choice`): asigna un estado de entrada a una de varias categorías definidas con criterios descriptivos.
- Respuestas booleanas (`noul`): determina sí o no ante una pregunta concreta sobre el estado.
- Puntuación calibrada (`score`): devuelve una distribución de probabilidad sobre una escala ordinal de criterios.
- Salida de probabilidades calibradas para cada opción, lo que permite umbrales de confianza y abstención.
- Procesamiento de estados de entrada en lenguaje natural (por ejemplo, mensajes de clientes o tickets).
- Integración con tooling de agentes mediante el endpoint `/v1/systemone` compatible con Ollama y llama.cpp.
- Soporte de ajuste adicional (fine-tuning) a partir de los adaptadores LoRA incluidos.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idiomas del modelo.
- No soporta generación de texto libre, tool calling generativo ni razonamiento multi-paso en el sentido de un LLM conversacional.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto de un ticket y devuelve la probabilidad de que corresponda a facturación, soporte técnico u otras colas, permitiendo asignación automática con umbrales de confianza.
- Detección de intención de reembolso: mediante preguntas tipo `noul`, se determina si un cliente solicita un reembolso y se activa el flujo correspondiente en el CRM.
- Priorización de urgencia: con preguntas tipo `score`, se asigna una probabilidad a niveles como "no urgente", "pronto" o "hoy", útil para colas de atención con SLA.
- Moderación y clasificación de contenido: clasificación binaria o multietiqueta de mensajes según criterios predefinidos, con probabilidades que permiten revisión humana en casos dudosos.
- Triaje en pipelines de agentes: el modelo actúa como componente de decisión determinista dentro de un agente mayor, seleccionando la siguiente acción o herramienta en función del estado de la conversación.
- Automatización de encuestas y formularios: conversión de respuestas abiertas en categorías o puntuaciones calibradas para análisis posterior.
- Despliegue en local con Ollama o llama.cpp: al disponer de GGUF Q4_K_M y Q8_0, puede ejecutarse en entornos sin GPU dedicada para decisiones de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No GPU benchmarks yet. Run the Benchmark section of the notebook to add one."

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB para la versión safetensors en 16 bits; alrededor de 5-6 GB para GGUF Q8_0; en torno a 3-4 GB para Q4_K_M (estimaciones orientativas según el tamaño de los archivos, no confirmadas por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o A100/H100 permiten ejecutar la versión 16 bits con holgura; GPUs consumer de 8 GB pueden alojar Q4_K_M.
- Cabe en GPU consumer: sí, especialmente en cuantización Q4_K_M y Q8_0; la versión fusionada de 16 bits requiere al menos 10 GB de VRAM.
- Opciones de despliegue: Unsloth Decision API (`unsloth studio`), Ollama 0.35+, llama.cpp b11443+, y `FastDecisionModel` de Unsloth para Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-D1 | 4,24B | 2048 (config. de ejemplo) | Modelo de decisión (no generativo) | LGPL-3.0 | Hugging Face, GGUF, Ollama, llama.cpp |
| Qwen3.5-4B (base) | ~4B | no disponible | LLM generativo | no disponible en la información | Hugging Face |
| Modelos de clasificación tipo BERT | variable (típicamente <1B) | 512 típico | Clasificador discriminativo | variable | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de decisión tipada con salida calibrada) no está disponible en la información proporcionada. Frente a un LLM generativo como su base Qwen3.5-4B, Qwen-D1 sacrifica la generación de texto a cambio de salidas estructuradas y calibradas, lo que lo hace más adecuado para enrutamiento y clasificación, pero inútil para tareas conversacionales.

## Limitaciones y advertencias

- No genera texto: no puede usarse como chatbot ni para tareas de generación libre; solo responde en el endpoint `/v1/systemone`.
- Solo soporta inglés según la etiqueta de idiomas; el rendimiento en otros idiomas no está garantizado.
- Las cuantizaciones k-quant como Q4_K_M pueden desplazar las probabilidades y cambiar respuestas en casos ajustados; el autor recomienda Q8_0 para mayor fidelidad.
- Una carga con `AutoModelForCausalLM` ignora la cabeza de decisión; es necesario usar `FastDecisionModel` o el endpoint correspondiente.
- No hay benchmarks publicados, por lo que el rendimiento real frente a alternativas no está validado.
- Riesgo de sesgos y alucinación: al derivar de un LLM y calibrarse sobre un dataset específico, puede heredar sesgos del modelo base y del dataset typed-decisions; las probabilidades no deben interpretarse como certeza absoluta.
- Licencia LGPL-3.0: permite uso comercial, pero impone obligaciones de copyleft sobre la biblioteca modificada; conviene revisar con asesoría legal antes de integrarlo en productos propietarios.
- El modelo tiene pocas descargas (230) y un solo like, lo que sugiere poca validación comunitaria.
- La longitud de contexto efectiva no está confirmada más allá del ejemplo de 2048 tokens.

## Enlaces

- Hugging Face: https://huggingface.co/StatsGary/Qwen-D1
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Dataset: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
