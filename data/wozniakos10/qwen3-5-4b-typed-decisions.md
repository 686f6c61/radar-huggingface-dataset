# wozniakos10/Qwen3.5-4B-typed-decisions

## Resumen

Qwen3.5-4B-typed-decisions es un adaptador LoRA con cabeza de decisión entrenado por el usuario wozniakos10 sobre el modelo base unsloth/Qwen3.5-4B. No es un modelo generativo al uso: en lugar de producir texto libre, recibe una pregunta tipada junto con sus posibles respuestas y devuelve, en un único forward pass, una distribución de probabilidad sobre cada opción. Su pipeline declarado en HuggingFace es zero-shot-classification y el repositorio contiene únicamente los adaptadores LoRA y la cabeza de decisión (0,3 GB), no los pesos completos del modelo base.

El modelo cubre tres tipos de pregunta: noul (sí/no con probabilidad de "sí"), choice (una opción entre criterios con nombre) y score (posición en una escala ordenada con probabilidad por nivel). La innovación práctica es que las preguntas y los criterios se definen en tiempo de inferencia, de modo que se pueden añadir nuevas etiquetas sin reentrenar. Esto lo sitúa como una pieza de infraestructura para enrutado, triaje, etiquetado y filtrado dentro de pipelines de software, más que como un asistente conversacional.

El entrenamiento se realizó con Unsloth sobre el dataset LocalLLaMA/typed-decisions (configuración "all", split de entrenamiento), con 240 pasos, 1,71 épocas, rango LoRA 16 y longitud máxima de secuencia de 2048 tokens. La licencia es Apache 2.0, heredada del modelo base, y el único idioma declarado es el inglés. El modelo es muy reciente (creado en octubre de 2026) y no registra descargas ni "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base transformer (Qwen3.5-4B) con adaptadores LoRA y cabeza de decisión de disposición "clef"; no es una arquitectura MoE ni SSM según la información disponible |
| Parametros totales | No disponible de forma explícita; aproximadamente 4.000 millones en el modelo base por nomenclatura, más la cabeza de decisión (hidden_size 2560, width 512, 4 capas, 8 cabezas, feedforward 2048) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de secuencia usada en entrenamiento); la ventana del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | Carga en 4 bits soportada en el ejemplo oficial (load_in_4bit = True); no se detallan otros esquemas (GPTQ, AWQ, GGUF) |
| Idiomas soportados | Inglés (en); otros idiomas no han sido probados según el autor |
| Licencia | Apache 2.0 (heredada del modelo base); revisar los términos de LocalLLaMA/typed-decisions para uso comercial |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA más cabeza de decisión), librería peft y Unsloth |

## Arquitectura y entrenamiento

El modelo no es un transformer generativo estándar en su salida: sobre el modelo base unsloth/Qwen3.5-4B se monta una cabeza de decisión con disposición "clef", hidden_size de 2560, anchura de 512, 2 capas de enrutado (routing_layers), 4 capas, 8 cabezas de atención y feedforward de 2048. La salida es una probabilidad por respuesta candidata en un solo forward pass, lo que evita la generación autoregresiva y reduce la latencia frente a enfoques de prompting para clasificación. Los adaptadores LoRA se entrenaron con rango 16, alpha 16 y dropout 0.

El entrenamiento se llevó a cabo con Unsloth (DecisionTrainer) sobre la configuración "all" y el split "train" del dataset LocalLLaMA/typed-decisions, con una parte de las filas reservada mediante FastDecisionModel.split_holdout. Los hiperparámetros reportados son 240 pasos, 1,71 épocas, tasa de aprendizaje 2e-5 con scheduler coseno, 10 pasos de warmup, weight decay 0,01, batch por dispositivo 2, acumulación de gradiente 4, longitud máxima 2048 y semilla 3407. La pérdida final de entrenamiento fue 0,7875 y la pérdida en el conjunto reservado en la última evaluación, 0,8747. No se menciona RLHF, DPO ni decodificación especulativa; las probabilidades de salida no están calibradas por temperatura.

## Capacidades

- Clasificación con respuesta tipada: preguntas de tipo noul (sí/no con probabilidad de "sí"), choice (selección entre criterios nombrados) y score (posición en una escala ordenada).
- Definición de preguntas y criterios en tiempo de inferencia, sin reentrenamiento para nuevas etiquetas.
- Salida de probabilidades por clase, no solo la etiqueta ganadora, lo que permite aplicar umbrales y abstención.
- Múltiples preguntas simultáneas sobre la misma entrada: el ejemplo oficial consulta equipo, necesidad de reembolso y urgencia en una sola llamada.
- Clasificación zero-shot según el pipeline declarado en HuggingFace.
- Capacidad multilingüe: no disponible; entrenado y validado únicamente en inglés.
- Tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio y modo "thinking": no disponibles en la información proporcionada; el modelo está orientado a producir juicios, no texto ni acciones.

## Casos de uso

- Enrutado de tickets de soporte: dado un mensaje de cliente, el modelo devuelve la probabilidad de que corresponda a facturación, soporte técnico o ventas, permitiendo asignar la cola con un umbral de confianza definido por el equipo.
- Triaje de urgencia: con una pregunta de tipo score sobre una escala ("no urgente", "pronto", "hoy") se puede priorizar la cola de atención antes de que un humano lea el caso, aprovechando que la salida es una distribución y no una etiqueta rígida.
- Detección de intención de reembolso, cancelación o escalado: preguntas de tipo noul sobre el texto entrante permiten disparar flujos automáticos solo cuando la probabilidad supera un umbral validado.
- Etiquetado y anotación de datasets: aplicar decenas de criterios configurables sobre corpus en inglés para preetiquetar datos antes de la revisión humana, reduciendo el coste de anotación.
- Moderación y filtrado de contenido: clasificar textos según criterios definidos en inferencia (spam, abuso, contenido fuera de política) y descartar automáticamente los casos de alta confianza.
- Cualificación de leads comerciales: una pregunta de tipo score sobre interés y otra de tipo choice sobre segmento permiten puntuar formularios o correos entrantes sin reentrenar el modelo al cambiar la política comercial.
- Enrutado dentro de pipelines de agentes: usar la salida probabilística como señal para decidir qué herramienta o subflujo activar, en lugar de pedir a un LLM generativo que emita una decisión en texto libre y parsearla después.
- Investigación sobre calibración y clasificación zero-shot: al publicar métricas de accuracy y ECE sin calibrar, sirve como punto de partida para estudiar calibración de cabezas de decisión sobre modelos pequeños.

## Benchmarks y rendimiento

Resultados de FastDecisionModel.evaluate sobre la configuración "all" y el split "test" de LocalLLaMA/typed-decisions, tal como los reporta el autor:

| Metrica | Valor |
|---|---|
| accuracy | 0,7715 |
| ece (expected calibration error) | 0,1381 |
| loss | 0,8664 |
| record_accuracy | 0,345 |

| Metrica de entrenamiento | Valor |
|---|---|
| Pérdida final de entrenamiento | 0,7875 |
| Pérdida en conjunto reservado (última evaluación) | 0,8747 |
| Pasos de entrenamiento | 240 |
| Épocas | 1,71 |

No hay resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible, ni cifras publicadas frente a modelos alternativos de clasificación. No se han publicado datos de latencia o throughput.

## Requisitos de hardware

- El repositorio ocupa 0,3 GB porque contiene solo adaptadores LoRA y la cabeza de decisión; hay que sumar los pesos del modelo base unsloth/Qwen3.5-4B.
- VRAM estimada para inferencia: en carga de 4 bits, entre 4 y 6 GB en total (pesos del modelo base más adaptadores, cabeza de decisión y activaciones con contexto de hasta 2048 tokens). En precisión completa (fp16), en torno a 9-11 GB. Son estimaciones derivadas del tamaño del modelo base, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM resulta suficiente para la carga cuantizada a 4 bits; para fp16 se recomienda 16 GB o más (RTX 4090, A100, H100, L40S).
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) usando cuantización de 4 bits.
- Opciones de despliegue: la ruta documentada es Unsloth con FastDecisionModel.from_pretrained y FastDecisionModel.for_inference, más el método predict. No se confirma soporte en vLLM, llama.cpp, Ollama o TGI, ya que la cabeza de decisión requiere código específico de Unsloth; en la información disponible figura como no disponible.
- Latencia y throughput estimados: no disponibles. El diseño de un solo forward pass sin generación autoregresiva sugiere menor coste que un LLM generativo del mismo tamaño, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de resultados comparativos ni de especificaciones de modelos alternativos en la información proporcionada. La única comparación documentable es con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-typed-decisions | ~4B (base) + cabeza de decisión | 2048 tokens en entrenamiento | Probabilidad por respuesta tipada | Apache 2.0 | Adaptador en HuggingFace (0 descargas) |
| unsloth/Qwen3.5-4B | No disponible en la información | No disponible | Texto generado | No disponible en la información | Modelo base público referenciado |
| Alternativas de clasificación zero-shot de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Las probabilidades no están calibradas por temperatura; el ECE reportado es 0,1381, por lo que los umbrales de decisión deben validarse sobre datos propios antes de usarse en producción.
- Entrenado únicamente con datos en inglés; el comportamiento en otros idiomas no ha sido probado.
- Las entradas de más de 2048 tokens quedan fuera del rango entrenado y no hay garantía de comportamiento correcto.
- Las salidas son juicios probabilísticos, no hechos: el autor recomienda mantener revisión humana en decisiones de alto impacto.
- El ratio record_accuracy es 0,345, muy inferior al accuracy de 0,7715, lo que indica que el acierto a nivel de registro completo (todas las preguntas de un caso correctas a la vez) es notablemente menor que el acierto por pregunta.
- Licencia Apache 2.0 heredada del modelo base, pero el autor advierte de que hay que revisar los términos del dataset LocalLLaMA/typed-decisions antes de un uso comercial.
- Riesgo de alucinación: al no generar texto libre el riesgo se traslada a falsos positivos en la clasificación; no hay sección específica sobre sesgos conocidos en la información disponible.
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo demográfico, temático o de dominio.
- Repositorio sin descargas ni "likes" y con fecha de creación muy reciente (octubre de 2026), por lo que no existe validación externa ni comunidad que haya replicado los resultados.
- Dependencia de código específico de Unsloth para la cabeza de decisión, lo que limita la portabilidad a otros runners de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wozniakos10/Qwen3.5-4B-typed-decisions
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Guía de Unsloth para entrenar modelos de decisión: https://unsloth.ai/docs/basics/train-your-own-decision-model-with-unsloth
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a páginas de ayuda de YouTube y no guardan relación con el modelo.
