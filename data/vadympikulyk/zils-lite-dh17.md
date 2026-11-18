# VadymPikulyk/zils-lite-dh17

## Resumen

zils-lite-dh17 es un modelo de decisión ("decision model") derivado de Qwen/Qwen3.5-0.8B, publicado por el usuario VadymPikulyk en Hugging Face. Forma parte del ecosistema Zils, asociado al subnet 127 de Bittensor, y se presenta como un "soup body" en el chasis d3-lite: es decir, un cuerpo de pesos de lenguaje y visión obtenido por interpolación de modelos y destilación, no un modelo entrenado desde cero. Cuenta con 852.985.920 parámetros totales según los pesos en safetensors, un tamaño de repositorio de 1,7 GB y licencia Apache-2.0.

El modelo parte de la media uniforme de dos cuerpos d3-lite previos (joamCriff123/zils-lite-l1116b y joamCriff123/zils-lite-l1116a) y añade un LoRA fusionado de rango 64 entrenado durante una época con learning rate 5e-5 sobre 60.000 filas de preguntas de decisión tipadas. Su propósito declarado es servir como componente de decisión dentro de la arquitectura Zils, respondiendo a preguntas con formato estructurado en lugar de generar texto libre.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado, sin idiomas especificados y sin benchmarks publicados. Resulta útil para quienes siguen el ecosistema Bittensor/Zils o experimentan con destilación de modelos de decisión sobre bases pequeñas, pero no para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; tag `qwen3_5`), con código personalizado (`custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros, reempaquetado en el "chasis" d3-lite del proyecto Zils. El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga del modelo requiere `trust_remote_code=True` y depende de la implementación del autor. No se documenta la longitud de contexto efectiva ni la composición del vocabulario o de las capas de visión más allá de la mención a "language and vision weights".

El entrenamiento combina dos etapas. Primero, una interpolación de pesos (model soup) por media uniforme de los dos cuerpos d3-lite del 17 de noviembre de 2026. Segundo, la fusión de un LoRA de rango 64, learning rate 5e-5 y una época, entrenado con `python -m zils.teacher train` sobre 60.000 filas de decisiones tipadas: 20.000 respuestas del profesor Zils Relay (probabilidades de vllm-sr/d3-ultra sobre preguntas de decisión reconstruidas), 20.000 filas con licencia comercial de tasksource/tasksource-jev-typed-decisions más glaive-function-calling-v2 y filas aritméticas/rúbricas generadas por reglas, 10.000 filas de splits TRAIN de Social IQa, PIQA, MNLI, RTE, 20 Newsgroups, QNLI, CLINC150 y CMUdict, y 10.000 decisiones tipadas de splits TRAIN públicos (ARC, MMLU auxiliary train, OpenBookQA, QuaRTz, WinoGrande, COPA, GSM8K, CommonsenseQA, SciQ, CoLA, MRPC, PAWS, SciTail, SMS Spam, BoolQ, dair-ai/emotion, TweetEval irony, Rotten Tomatoes, SST-5, entre otros). Los objetivos no provenientes del relay son una mezcla 0,5 × etiqueta dorada + 0,5 × respuesta del propio soup inicial, una técnica de regularización hacia el modelo de partida.

El autor declara explícitamente que no se usaron ítems del examen del validador, ítems públicos del examen semilla ni datos de clientes. No se documentan etapas de RLHF o DPO, ni innovaciones de decodificación como decodificación especulativa o atención lineal.

## Capacidades

- Respuesta a preguntas de decisión tipadas: el modelo está entrenado para producir decisiones estructuradas sobre opciones, no texto libre genérico.
- Razonamiento sobre opciones múltiples y tareas de sentido común (COPA, PIQA, WinoGrande, Social IQa, CommonsenseQA).
- Clasificación de texto e inferencia de lenguaje natural (MNLI, RTE, QNLI, MRPC, PAWS, CoLA, SST-5, Rotten Tomatoes).
- Clasificación de intenciones en dominios de asistente (CLINC150) y detección de spam (SMS Spam).
- Uso de herramientas y function calling, por la inclusión de glaive-function-calling-v2 en el entrenamiento.
- Aritmética y evaluación por rúbricas generadas por reglas.
- Pesos de visión heredados de la base Qwen3.5-0.8B, según la model card, aunque no se detallan las capacidades multimodales efectivas.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Modo de razonamiento extendido (thinking), audio o agentes multi-paso: no documentados.

## Casos de uso

- Enrutamiento de decisiones en pipelines de agentes: el modelo puede actuar como cabecera de decisión que elige entre acciones o herramientas predefinidas, dado su entrenamiento con glaive-function-calling-v2 y decisiones tipadas; encaja donde se necesita baja latencia y un modelo de menos de 1.000 millones de parámetros.
- Clasificación de intenciones en asistentes conversacionales: su exposición a CLINC150 permite etiquetar la intención del usuario antes de derivar la consulta a un modelo mayor, reduciendo coste por consulta.
- Filtrado y moderación de contenido: con datos de SMS Spam y TweetEval irony en el entrenamiento, puede usarse como clasificador previo para descartar entradas antes de procesamiento más caro.
- Evaluación automática de respuestas: las filas de rúbricas y cobertura de pasajes permiten emplearlo como juez ligero en pipelines de evaluación de calidad de generaciones.
- Experimentación en el subnet 127 de Bittensor: sirve como cuerpo candidato ("soup body") para validadores y mineros que participan en el ecosistema Zils, comparando su rendimiento frente a otros cuerpos d3-lite.
- Investigación en destilación de modelos de decisión: su receta documentada (soup + LoRA rank 64 + mezcla 0,5/0,5 hacia el modelo de partida) es reproducible y útil para estudiar el efecto de la destilación desde un profesor mayor (d3-ultra) sobre una base pequeña.
- Prototipado de bajo coste en hardware de consumo: con menos de 1.000 millones de parámetros, cabe en GPU de gama media para pruebas de concepto de clasificación y decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7-2,0 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB, aunque el autor no publica variantes GGUF y sería necesario convertir los safetensors.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); para despliegue con mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070 y superiores, así como en Apple Silicon con memoria unificada.
- Opciones de despliegue: al usar `custom_code`, la carga requiere `trust_remote_code=True`; es compatible con transformers y, previsiblemente, con vLLM si la implementación personalizada lo permite, pero no se documenta soporte para llama.cpp, Ollama ni TGI. La conversión a GGUF requeriría trabajo adicional por el código personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| VadymPikulyk/zils-lite-dh17 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Modelo de decisión derivado de Qwen3.5-0.8B, con código personalizado |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones | no disponible | no disponible en la informacion | Hugging Face (modelo base) | Base directa del modelo; capacidades generales de lenguaje y visión |
| joamCriff123/zils-lite-l1116a | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo d3-lite previo, uno de los dos promediados |
| joamCriff123/zils-lite-l1116b | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo d3-lite previo, el otro promediado |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.
- Sin benchmarks publicados: no es posible verificar su calidad frente a la base Qwen3.5-0.8B ni frente a otros modelos de decisión.
- Requiere `trust_remote_code=True` por el uso de código personalizado, lo que introduce riesgo de seguridad y de mantenimiento si el repositorio cambia o desaparece.
- El entrenamiento con objetivos mezclados al 50% con las propias respuestas del modelo de partida puede producir un sesgo hacia las salidas del soup inicial y limitar la corrección de errores heredados.
- Riesgo de alucinación en tareas fuera del dominio de decisión tipada para el que fue entrenado; no debe usarse como generador de texto libre sin evaluación previa.
- Idiomas soportados no documentados: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas distintos del inglés, dominante en los datasets de entrenamiento citados.
- Longitud de contexto no documentada: no se debe asumir la ventana de la base Qwen3.5-0.8B sin verificación.
- Aunque la licencia es Apache-2.0, el autor pide citar tasksource, Zils Relay y los datasets originales; conviene revisar las licencias de los datasets de entrenamiento para uso comercial.
- El modelo está vinculado al subnet 127 de Bittensor; su comportamiento puede depender de las convenciones del chasis d3-lite y no ser portable fuera de ese ecosistema sin adaptación.
- No se documentan sesgos específicos, pero los datasets de entrenamiento (redes sociales, noticias, sentido común en inglés) pueden introducir sesgos de dominio y culturales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh17
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo previo l1116a: https://huggingface.co/joamCriff123/zils-lite-l1116a
- Cuerpo previo l1116b: https://huggingface.co/joamCriff123/zils-lite-l1116b
- Profesor d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Dataset de respuestas del profesor: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de function calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
