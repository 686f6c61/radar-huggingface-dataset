# vllm-sr/Decision-2.0-Vega-27B

## Resumen

Decision-2.0-Vega-27B es un modelo de decisión estructurada desarrollado por el equipo de vLLM Semantic Router, publicado en Hugging Face bajo licencia Apache-2.0. No es un modelo generativo al uso: recibe un estado de entrada (texto libre o JSON) junto con un conjunto de preguntas tipificadas (elección entre opciones, sí/no o puntuación en una escala) y devuelve, en una sola pasada forward, una probabilidad para cada respuesta posible, sin generar texto. Está construido como un adaptador sobre el modelo base Qwen/Qwen3.8-27B, con 29,37 mil millones de parámetros y una ventana de contexto de 32.768 tokens.

El modelo forma parte de la colección Decision 2.0, orientada a lo que el autor denomina "system-one": decisiones rápidas y deterministas que se integran en un enrutador semántico (vLLM Semantic Router) para clasificar peticiones, enrutarlas a equipos o modelos adecuados o activar políticas. Su relevancia actual radica en que sustituye la generación de texto por una salida probabilística estructurada, lo que reduce latencia y elimina la ambigüedad del parseo de respuestas generadas.

Según la model card, Vega-27B es el modelo más potente de la familia Decision 2.0, con una mejora de +11,2 puntos en el Jev Decision Index respecto a Decision-2.0-Lux-9B, y lidera su categoría de tamaño en JevArena con 74,0 puntos, estadísticamente a la par de AutoJev-27B (72,1). La latencia mediana declarada es de 71,4 ms por petición de una sola pregunta en una única GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer Qwen/Qwen3.8-27B (base_model_relation: adapter); requiere `trust_remote_code` y código custom |
| Parametros totales | 29,37B |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers; repo de 15,0 GB) |

## Arquitectura y entrenamiento

La información disponible indica que Decision-2.0-Vega-27B es un adaptador (adapter) sobre el modelo base Qwen/Qwen3.8-27B, por lo que hereda la arquitectura transformer del base y añade una cabeza o módulo de decisión que produce distribuciones de probabilidad sobre opciones predefinidas. El modelo se invoca mediante un método `system_one(state, questions)` que acepta tres tipos de pregunta: `choice` (selección entre criterios con descripción), `noul` (sí/no) y `score` (puntuación sobre una lista ordenada de criterios). Todas las preguntas sobre un mismo estado se resuelven en una única pasada forward.

No se dispone de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas internas (atención, decodificación, etc.) más allá de la naturaleza no generativa de la salida. La model card menciona que los datos de entrenamiento fueron auditados a nivel de fila contra todos los ítems de test del Jev Decision Index, lo que sugiere un cuidado explícito por evitar contaminación en la evaluación. El pipeline declarado en Hugging Face es `zero-shot-classification`, coherente con la tarea de clasificación probabilística sin generación.

## Capacidades

- Clasificación zero-shot con salida probabilística: devuelve una probabilidad por cada opción, sin generar texto.
- Tres tipos de decisión: elección entre opciones (`choice`), respuesta binaria sí/no (`noul`) y puntuación en escala (`score`).
- Resolución conjunta de múltiples preguntas sobre un mismo estado en una sola pasada forward.
- Entrada multimodal de formato: acepta texto libre o JSON como estado de entrada.
- Integración como pipeline de transformers (`transformers.pipeline("decision", ...)`).
- Enrutamiento y clasificación para sistemas de routing semántico (vLLM Semantic Router).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de peticiones en atención al cliente: dado un texto de ticket, el modelo decide en una sola pasada a qué equipo derivarlo (`choice` entre devoluciones, facturación, técnico) y si el cliente aporta recibo (`noul`), con probabilidades que permiten aplicar umbrales de confianza.
- Clasificación de urgencia y priorización: la pregunta tipo `score` sobre una escala (rutina, pronto, hoy) permite ordenar colas de soporte con una salida numérica calibrada en lugar de texto libre.
- Enrutador semántico de modelos en producción: integrado en vLLM Semantic Router, clasifica la intención de cada petición para dirigirla al modelo o pipeline adecuado, aprovechando su latencia mediana de 71,4 ms por pregunta.
- Moderación y políticas deterministas: preguntas sí/no sobre contenido permitido o denegado, con probabilidad asociada para auditar decisiones y fijar umbrales.
- Extracción de señales estructuradas de JSON: al aceptar JSON como estado, puede evaluar campos de un payload (por ejemplo, tipo de pedido, presencia de recibo, importe) y emitir decisiones de negocio sin parseo de texto generado.
- Automatización de triaje en pipelines de CI/CD o sistemas de tickets: la salida probabilística permite integrar el modelo como un paso de clasificación con umbrales configurables, evitando fallos por respuestas generadas malformadas.
- Evaluación comparativa de decisiones: su naturaleza determinista y su índice Jev Decision Index permiten usarlo como referencia en experimentos de routing y clasificación frente a modelos generativos.

## Benchmarks y rendimiento

Datos publicados en la model card:

| Modelo | JevArena ↑ | Human-labelled transfer ↑ | Jev Decision Index ↑ |
|---|---:|---:|---:|
| Decision-2.0-Vega-27B | 74,0 | 58,7 | 56,5 |
| AutoJev-27B | 72,1 | 58,7 | — |
| Eikos-27B | 69,3 | 58,7 | — |
| Jebadiah-27B | 65,5 | 57,8 | — |

Notas de la model card: todos los modelos responden a los mismos prompts congelados y se puntúan del mismo modo; las respuestas ausentes o inválidas cuentan como errores. "Human-labelled transfer" es la mediana del macro-F1 sobre 15 tareas etiquetadas por humanos (×100). El Jev Decision Index de Decision 2.0 es una reproducción independiente con el kit oficial 0.2.1 sobre los pesos publicados; el resto de modelos proviene de una captura pública del board del 2026-09-28. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 29,37B parámetros y pesos safetensors de 15,0 GB en el repo, la inferencia en precisión completa requiere del orden de decenas de GB de VRAM, y no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponibles en la información proporcionada; la model card solo indica que la latencia de 71,4 ms por petición se midió en una única GPU, sin especificar el modelo.
- ¿Cabe en GPU de consumo? No disponible. No se publican requisitos mínimos ni variantes cuantizadas.
- Opciones de despliegue: transformers (>=5.17) con `trust_remote_code=True`, torch, safetensors y peft; también como pipeline `decision`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: mediana de 71,4 ms por petición de una sola pregunta en una única GPU; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevArena ↑ | Human-labelled transfer ↑ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Decision-2.0-Vega-27B | 29,37B | 32.768 | 74,0 | 58,7 | Apache-2.0 | Hugging Face (vllm-sr) |
| AutoJev-27B | no disponible | no disponible | 72,1 | 58,7 | no disponible | no disponible |
| Eikos-27B | no disponible | no disponible | 69,3 | 58,7 | no disponible | no disponible |
| Jebadiah-27B | no disponible | no disponible | 65,5 | 57,8 | no disponible | no disponible |

La comparativa se limita a los cuatro modelos de mismo tamaño recogidos en la model card; no se dispone de datos de parámetros, contexto ni licencia de los competidores.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto; solo devuelve probabilidades sobre opciones predefinidas, por lo que no sirve para tareas de generación, resumen o diálogo.
- Dependencia del código custom: requiere `trust_remote_code=True` y la librería peft, lo que implica ejecutar código del autor y complica la auditoría en entornos restringidos.
- Idiomas soportados no declarados: no hay información sobre cobertura multilingüe; el uso en castellano no está garantizado.
- Riesgo de calibración: las probabilidades no están validadas externamente en la información disponible; conviene calibrar umbrales con datos propios antes de producción.
- Sesgos: no se documentan análisis de sesgo en la model card.
- Riesgo de alucinación: al no generar texto, el riesgo se traslada a clasificaciones erróneas con alta confianza; las respuestas ausentes o inválidas se contabilizan como errores en la evaluación.
- Contexto limitado a 32.768 tokens, inferior al de muchos modelos generativos actuales.
- Licencia Apache-2.0: permite uso comercial, pero al ser un adaptador sobre Qwen/Qwen3.8-27B conviene verificar la licencia del modelo base para el despliegue combinado.
- Benchmarks propios del autor (JevArena, Jev Decision Index): no son estándares de la industria y no hay resultados en MMLU, HumanEval o GSM8K.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/Decision-2.0-Vega-27B
- Colección Decision 2.0: https://huggingface.co/collections/vllm-sr/decision-20-6ab7cf7bdfb506bf8269cb00
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Sitio web de vLLM Semantic Router: https://vllm-sr.ai/
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
