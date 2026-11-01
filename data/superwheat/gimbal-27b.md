# Superwheat/Gimbal-27B

## Resumen

Gimbal-27B es un modelo de decisión tipada (typed decision model) publicado por el usuario Superwheat, obtenido mediante un fine-tuning con LoRA sobre Qwen/Qwen3.8-27B. A diferencia de un modelo generativo convencional, Gimbal no produce texto libre: recibe un estado textual y un conjunto de preguntas tipadas (elección entre opciones, sí/no o puntuación ordinal) y devuelve, para cada pregunta, una probabilidad calibrada por opción. El modelo se sirve como cross-encoder de tres clases y sigue el formato `systemone` de estilo Jev, de modo que los clientes escritos para ese formato funcionan sin cambios.

El modelo resuelve un problema concreto en pipelines de agentes y sistemas de enrutamiento: sustituir la generación de texto seguida de parseo por una interfaz estructurada con probabilidades interpretables. Esto elimina la fragilidad del parseo de salidas libres y permite umbrales de confianza explícitos. Su relevancia actual radica en que el autor declara resultados superiores al modelo alojado Jev 1.13 en las tres modalidades (sí/no, elección y puntuación) del benchmark independiente S1MB, además de una mayor consistencia ante reordenaciones de opciones.

El modelo tiene 25.624.615.424 parámetros reales según los pesos en safetensors (etiquetado comercialmente como 27B), se distribuye en bf16 fusionado junto con el adaptador LoRA original, ocupa 51,7 GB de repositorio y se publica bajo licencia Apache-2.0. Está orientado exclusivamente al inglés y su despliegue de referencia es vLLM sobre Linux con GPU NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B) fine-tuneado con LoRA como cross-encoder de 3 clases para decisiones tipadas |
| Parametros totales | 25.624.615.424 (25,6 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos bf16 fusionados; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 fusionado) + adaptador LoRA/PEFT original |
| Modelo base | Qwen/Qwen3.8-27B |
| Libreria de referencia | vLLM |
| Tamano del repositorio | 51,7 GB |
| Pipeline declarado | zero-shot-classification |

## Arquitectura y entrenamiento

Gimbal-27B parte de Qwen3.8-27B y se ajusta con LoRA (PEFT) para reformular la tarea como una clasificación de tres clases en esquema cross-encoder: el texto de estado y la descripción de la decisión se procesan conjuntamente y el modelo emite una probabilidad por cada opción candidata. Cada opción se evalúa de forma independiente contra el texto, lo que explica la estabilidad declarada frente al reordenamiento o la reformulación de las alternativas. El repositorio contiene los pesos fusionados en bf16 listos para servir con vLLM, además del adaptador original, e incluye pruebas de equivalencia entre ambos y un script para reconstruir la fusión a partir del adaptador.

El entrenamiento se complementa con un fichero `calibration.json` (calibración v2) que ajusta las probabilidades de salida; según el autor, se ajustó sobre datos de desarrollo depurando previamente cualquier caso que coincidiera o se pareciera a una entrada de S1MB. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La innovación destacable no es arquitectónica sino de interfaz: decisiones tipadas con probabilidades calibradas, sin texto libre que parsear, y una calibración explícita medida con error de calibración esperado (ECE) de 1,9 en preguntas de elección sobre jev-dev.

## Capacidades

- Clasificación zero-shot con etiquetas definidas en tiempo de petición: el usuario describe la decisión en lenguaje natural y aporta sus propias opciones, sin entrenamiento específico de tarea.
- Preguntas de elección (`choice`) entre un conjunto de criterios con etiqueta, devolviendo una probabilidad por opción.
- Preguntas booleanas (`noul`, sí/no) con probabilidad calibrada.
- Preguntas de puntuación ordinal (`score`) sobre una escala de criterios ordenados.
- Probabilidades calibradas: un valor de 0,8 corresponde aproximadamente a un 80 % de acierto según la ECE declarada.
- Consistencia ante reordenación y reformulación de opciones (estabilidad de orden de opciones de 87,5 en JevBench).
- Razonamiento aplicado a matemáticas, lógica, aplicación de reglas y lectura de registros, incluyendo familias de tareas no vistas en entrenamiento.
- Integración en pipelines de agentes y uso como juez LLM (llm-judge) o componente de enrutamiento.
- Compatibilidad con el formato `systemone` de estilo Jev, tanto en petición como en respuesta.
- No se documentan capacidades de visión, audio, tool calling generativo ni modo thinking; el modelo no genera texto libre.

## Casos de uso

- Enrutamiento de tickets de soporte: se define una pregunta `choice` con las colas disponibles (facturación, envío, técnico) y el modelo devuelve la probabilidad de cada cola; el sistema deriva al equipo con mayor probabilidad y escala a revisión humana si ninguna supera un umbral configurado.
- Triaje de urgencia en atención al cliente: una pregunta `score` con niveles ordenados ("puede esperar", "esta semana", "hoy", "ahora mismo") permite priorizar la cola con una magnitud interpretable en lugar de una etiqueta opaca.
- Moderación y clasificación de contenido: preguntas `noul` encadenadas (¿es spam?, ¿es abusivo?, ¿menciona datos personales?) sobre el mismo estado, aprovechando que cada opción se evalúa de forma independiente y estable ante reformulaciones.
- Juez automático en evaluación de LLM: dado un par pregunta-respuesta, preguntas de elección o puntuación para valorar corrección, relevancia y fidelidad, con probabilidades que permiten agregar puntuaciones y fijar umbrales de acuerdo entre anotadores.
- Verificación de reglas de negocio en pipelines de datos: comprobar si un registro cumple condiciones descritas en lenguaje natural (aplicación de reglas y lectura de registros), devolviendo sí/no con confianza para decidir si se bloquea el registro.
- Extracción de señales en analítica de conversaciones: clasificar cada mensaje según intención, sentimiento y urgencia con un único modelo y un esquema fijo, facilitando el agregado consistente entre lotes y el seguimiento temporal.
- Puerta de decisión en agentes multi-paso: usar las probabilidades como condición de parada o de escalado (por ejemplo, ¿la tarea está resuelta?, ¿requiere herramienta externa?) sin depender del parseo de texto generado.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente en la información disponible).

| Benchmark | Metrica | Gimbal-27B | Referencia declarada |
|---|---|---|---|
| S1MB english-v1, sí/no | Puntuación ajustada 0-100 | 72,7 | 64,6 (Hosted Jev 1.13) |
| S1MB english-v1, elección | Puntuación ajustada 0-100 | 72,4 | 67,2 (Hosted Jev 1.13) |
| S1MB english-v1, puntuación | Puntuación ajustada 0-100 | 58,8 | 46,9 (Hosted Jev 1.13) |
| JevBench-mini, coherencia global | coherence | 91,3 | 82,8 (Hosted Jev) |
| JevBench-mini, precisión gold | accuracy | 90,9 | no disponible |
| JevBench, estabilidad de orden de opciones | score | 87,5 | 76,4 (Hosted Jev); 73,6 (OpenJev 27B) |
| jev-dev, elección | ECE (menor es mejor) | 1,9 (calibración v2); 2,0 (original) | 8,5 (OpenJev 27B) |
| Lockbox sellado, decisiones tipadas (3.836 casos) | accuracy agrupada | 80,89 | +6,1 puntos sobre Hosted Jev (declarado) |
| Lockbox sellado, familias no vistas (1.647 casos) | accuracy agrupada | 77,29 | no disponible |
| Gimbal math (gate-math + 5 conjuntos aritméticos, 3.246 casos) | accuracy agrupada | 89,46 | no disponible |

S1MB es un benchmark de terceros con 137 benchmarks en inglés y 26.269 decisiones; según el autor, la ejecución completa se realizó el 2026-10-28 con cobertura total y cero decisiones fallidas, y el envío está pendiente de revisión.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 51 GB libres en bf16, según la guía de despliegue del autor.
- GPU recomendadas: no se especifican modelos concretos; el requisito documentado es una GPU NVIDIA con unos 51 GB libres y controlador CUDA 13.
- GPU de consumo: no cabe en GPU de consumo de 24 GB (RTX 4090) ni de 32 GB en bf16; no se documentan cuantizaciones que reduzcan el requisito.
- Sistema operativo: Linux, con cabeceras de Python 3.12.
- Opciones de despliegue: servidor de referencia `gimbal_serve` sobre vLLM (`python -m gimbal_serve.server --model gimbal-27b --port 8000`), con endpoint `/v1/systemone`; el repositorio incluye `helper/requirements.txt` y la guía `serve/SERVE.md`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gimbal-27B | 25,6 B | no disponible | Cross-encoder de decisiones tipadas con probabilidades calibradas | Apache-2.0 | Pesos abiertos en HuggingFace; despliegue vLLM |
| Hosted Jev 1.13 | no disponible | no disponible | Modelo de decisiones tipadas alojado | no disponible (servicio) | Solo API; usado como referencia de comparación |
| OpenJev 27B | 27 B (aproximado, según nombre) | no disponible | Modelo de decisiones tipadas de pesos abiertos | no disponible | Pesos abiertos; referencia en métricas de estabilidad y calibración |

Las comparaciones de rendimiento entre estos tres modelos proceden de las métricas declaradas por el autor de Gimbal (S1MB, JevBench, estabilidad de orden y ECE). No se dispone de datos independientes que permitan verificar la equivalencia de condiciones de evaluación.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés; no se declara soporte de otros idiomas, incluido el castellano.
- No genera texto libre: solo responde a preguntas tipadas con probabilidades; no es adecuado para tareas generativas, resumen o diálogo abierto.
- Los benchmarks son declarados por el autor y figuran como no verificados; el envío a S1MB está pendiente de revisión en el momento de la información disponible.
- Riesgo de alucinación no caracterizado en la información disponible; al emitir probabilidades, el riesgo principal es de sobreconfianza, mitigado parcialmente por la calibración declarada (ECE 1,9), que no cubre todos los dominios.
- Sesgos conocidos: no documentados; al heredar el modelo base Qwen3.8-27B, puede arrastrar sesgos de sus datos de entrenamiento, no evaluados en esta ficha.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con estados muy largos.
- Requisito de hardware elevado (unos 51 GB de VRAM en bf16) y dependencia de Linux con CUDA 13; sin cuantizaciones publicadas para entornos con menos memoria.
- La calibración se ajustó sobre datos de desarrollo depurados contra S1MB; la generalización de las probabilidades a dominios muy distintos no está verificada de forma independiente.
- Licencia Apache-2.0 permite uso comercial, pero la procedencia y las condiciones del modelo base Qwen3.8-27B deben revisarse por separado antes de un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Superwheat/Gimbal-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Benchmark S1MB (repositorio): https://github.com/hotchpotch/S1MB
- Historial de envío S1MB de Gimbal-27B: https://huggingface.co/datasets/hotchpotch/s1mb-result/tree/347a5d3836e15070530c30aa79ebab7278daa209/Superwheat__Gimbal-27B
- Discusión del envío S1MB: https://huggingface.co/datasets/hotchpotch/s1mb-result/discussions/114
