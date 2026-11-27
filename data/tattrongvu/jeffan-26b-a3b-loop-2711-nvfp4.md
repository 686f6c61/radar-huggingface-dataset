# tattrongvu/Jeffan-26B-A3B-Loop-2711-NVFP4

## Resumen

Jeffan-26B-A3B-Loop-2711-NVFP4 es una cuantización de precisión mixta del modelo Jeffan-26B-A3B-Loop-2711, desarrollado por el usuario tattrongvu sobre la base Inkling-2-Mini de Thinking Machines. No es un modelo generativo de texto al uso: es un modelo de decisión estructurada que recibe un estado (por ejemplo, el texto de un ticket) y un conjunto de preguntas tipadas (elección múltiple, sí/no y puntuación) y devuelve, en un único forward pass, una distribución de probabilidad sobre cada opción. No genera texto libre.

Arquitectura de mezcla de expertos (MoE) sobre un transformer con bucles (looped transformer), con 26.388.646.440 parámetros totales. La variante aquí descrita aplica NVFP4 (W4A4) a los expertos enrutados de las capas 0–19 y MXFP8 (W8A8) a los de las capas 20–23, manteniendo atención, routers, compuertas del bucle, embeddings, capa de salida y normas en bf16/fp32. El resultado es un checkpoint de 20,2 GB frente a los 52,2 GB del modelo base en bf16.

Su relevancia es doble: por un lado, reduce a menos de la mitad el peso en disco y memoria de un modelo de 26B mediante cuantización FP4/FP8 selectiva; por otro, expone un formato de inferencia específico para decisiones (endpoints `/v1/systemone` y `/v1/decisions` en vLLM) que convierte la tarea de clasificación/decision en una lectura directa de probabilidades, sin decodificación autoregresiva. Requiere GPUs NVIDIA Blackwell por el uso de tensor cores FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer con bucles (looped transformer); clase `Inkling2LoopForConditionalGeneration` |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible (etiqueta A3B sugiere ~3B activos, no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (expertos enrutados, capas 0–19; FP4 E2M1 en bloques de 16 con escalas FP8 E4M3); MXFP8 W8A8 (capas 20–23); resto en bf16/fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `hf_quant_config.json` (formato del checkpoint base); libreria vLLM |

## Arquitectura y entrenamiento

El modelo base es un MoE con bucles: un transformer en el que el bloque se reaplica varias veces con compuertas de mensaje y consultas propias del bucle, lo que permite profundidad efectiva adicional sin incrementar el número de parámetros. La variante NVFP4 conserva exactamente el formato del checkpoint base (`hf_quant_config.json`, `Inkling2LoopForConditionalGeneration`) y reutiliza los valores de los expertos del modelo original; únicamente cambia la precisión de almacenamiento de los expertos enrutados. La atención, los routers, las compuertas y consultas del bucle, los embeddings, la capa de salida y las normas permanecen en bf16/fp32. También se incluyen el torre de visión y el modelo draft del base tal como se distribuyen, aunque la lectura de decisiones no los utiliza.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada. La cuantización se realizó con ModelOpt (etiqueta `modelopt`) y el checkpoint está pensado para el motor vLLM en GPUs NVIDIA Blackwell; el modelo en bf16 se puede cargar con transformers.

## Capacidades

- Clasificación y decisión estructurada: respuesta a preguntas de tipo elección múltiple (hasta 255 opciones codificadas como `A`, `B`, …), sí/no (`noul`) y puntuación (`score`) sobre un estado dado.
- Salida probabilística calibrada por opción, leída de un único forward pass (sin generación autoregresiva).
- Soporte de múltiples preguntas por petición, cada una con su propio prompt construido con el tokenizador y la plantilla de chat del checkpoint.
- Endpoints específicos en vLLM: `/v1/systemone` (formato System One) y `/v1/decisions` (OpenAI Decisions API, accesible también con `client.decisions.create` del SDK de OpenAI).
- Integración con vLLM mediante el plugin `jeffan_vdec` (dos ficheros Python, Apache 2.0) que define la estrategia de lectura; sin el plugin, vLLM devuelve HTTP 501.
- Capacidades de visión y borrador (draft model) presentes en el checkpoint base, aunque no usadas en la lectura de decisiones.
- No disponible: soporte de tool calling, agentes multi-paso, capacidades multilingües o modo de razonamiento explícito (thinking mode) no documentados en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada ticket en un equipo (facturación, daños en envío, soporte técnico) con probabilidades por categoría, como muestra el ejemplo de la model card; adecuado porque devuelve una distribución calibrada en una sola pasada y con latencia de decenas de milisegundos.
- Triaje de urgencia: asignar una puntuación ordinal (baja, media, alta) a cada incidencia mediante preguntas de tipo `score`, útil en colas de atención con SLA.
- Verificación de condiciones sobre texto: preguntas sí/no (`noul`) del tipo "¿el cliente solicita un reemplazo?" para extraer predicados estructurados de correos o formularios.
- Moderación y cumplimiento: evaluar si un contenido cumple una política mediante elección múltiple entre categorías de infracción, con umbrales de probabilidad configurables.
- Clasificación de documentos en pipelines ETL: etiquetar documentos entrantes en categorías predefinidas antes de almacenarlos o derivarlos, aprovechando la API compatible con OpenAI para integrarse en orquestadores existentes.
- Toma de decisiones en agentes: usar el modelo como componente de decisión (qué herramienta invocar, qué acción tomar) dentro de un agente mayor, sustituyendo la generación de texto por una lectura probabilística sobre un conjunto finito de acciones.
- Evaluación de riesgo en crédito o seguros: preguntas de puntuación sobre descripciones de casos, con la ventaja de que las probabilidades salen de un único forward pass y son auditables.

## Benchmarks y rendimiento

Los datos publicados en la model card son de una evaluación propia, no de un leaderboard oficial, medida con el servidor vLLM en una NVIDIA B200:

| Modelo | Kit sample index (4.150 peticiones del suite público, HLE excluido) | Latencia mediana / p95 (una petición a la vez) |
|---|---:|---:|
| Jeffan-26B-A3B-Loop-2711-NVFP4 | 61,90 | 21,7 / 163 ms |

En el suite público completo, esta build obtiene 61,23 según la model card del repositorio en bf16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 20,2 GB; con overhead de KV cache y activaciones, se recomienda reservar al menos 24–32 GB de VRAM para servir con `--gpu-memory-utilization 0.9` y `--max-num-seqs 256`.
- GPU recomendadas: NVIDIA Blackwell con tensor cores FP4; la medición oficial se hizo en una NVIDIA B200. No es compatible con GPUs sin soporte FP4 (por ejemplo, Ampere o Ada) para esta variante cuantizada.
- Consumer GPU: no cabe en GPUs de consumo actuales por el requisito de FP4 y por el tamaño de pesos; la variante bf16 (52,2 GB) tampoco cabe en una sola GPU de consumo.
- Opciones de despliegue: vLLM nightly (`0.34.0rc1.dev1205+g8d5e012ab` verificado) con el plugin `jeffan_vdec` en `PYTHONPATH` y `JEFFAN_VDEC=1`; la variante bf16 se carga con transformers. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 21,7 ms y p95 de 163 ms por petición en una B200, con una petición a la vez; no se publican cifras de throughput con batching.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeffan-26B-A3B-Loop-2711-NVFP4 | 26,4B | no disponible | Decisión estructurada, MoE con bucles, FP4/FP8 | Apache 2.0 | Hugging Face, vLLM |
| Jeffan-26B-A3B-Loop-2711 (bf16) | 26,4B | no disponible | Igual, sin cuantizar (52,2 GB) | Apache 2.0 | Hugging Face, transformers |
| Inkling-2-Mini (base) | no disponible | no disponible | Modelo base del que deriva | no disponible | Hugging Face (thinkingmachines) |

No se dispone de datos de benchmarks comparables con otras familias de modelos de decisión en la información proporcionada.

## Limitaciones y advertencias

- Requiere hardware NVIDIA Blackwell: sin tensor cores FP4 el checkpoint no es utilizable; no hay fallback documentado a otras GPUs.
- Dependencia de un plugin externo (`jeffan_vdec`) y de una build nightly de vLLM; el vLLM estándar responde HTTP 501 a los endpoints de decisión para Inkling-2.
- No es un modelo generativo: no produce texto libre ni admite tool calling, agentes multi-paso ni razonamiento conversacional.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de calibración defectuosa: las probabilidades por opción deben validarse en el dominio de despliegue antes de fijar umbrales.
- Sesgos: no documentados en la información disponible; al derivar de un modelo base sin ficha de sesgos publicada, se recomienda auditoría propia.
- Idiomas: no disponible; la plantilla de chat y el tokenizador provienen del checkpoint base y no se especifican coberturas lingüísticas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Inkling-2-Mini, que no se detalla en la información disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; es un artefacto reciente y sin validación comunitaria.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/tattrongvu/Jeffan-26B-A3B-Loop-2711-NVFP4
- Modelo base en bf16: https://huggingface.co/tattrongvu/Jeffan-26B-A3B-Loop-2711
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Sección de evaluación del repositorio bf16: https://huggingface.co/tattrongvu/Jeffan-26B-A3B-Loop-2711#evaluation-full-public-suite-jev-decision-index-03
- Plugin de inferencia: `inference/vllm_decisions/` dentro del repositorio del checkpoint (paquete `jeffan_vdec`, Apache 2.0)
- Motor de decisión y renderizado: `inference/dm_decision_engine/render.py` dentro del repositorio del checkpoint
- Wheels de vLLM nightly: https://wheels.vllm.ai/8d5e012ab97fb267da35b23941538f8a523b7fc2/
