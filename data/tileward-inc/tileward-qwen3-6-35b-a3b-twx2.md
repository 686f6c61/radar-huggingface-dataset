# Tileward-Inc/Tileward-Qwen3.6-35B-A3B-TWX2

## Resumen

Tileward-Qwen3.6-35B-A3B-TWX2 es una compresión del modelo Qwen3.6-35B-A3B desarrollada por Tileward-Inc mediante su formato propietario TWX2. Se trata de una cuantización agresiva que reduce el peso en disco de los 71,9 GB del modelo original a 16,05 GB, lo que supone una reducción del 78 % (4,5 veces) respecto al original y un 31 % menos que la build NVFP4 de NVIDIA (23,4 GB). El modelo base es un transformer de tipo Mixture of Experts (MoE) con 35 000 millones de parámetros totales y 3 000 millones activos por token, desarrollado por el equipo Qwen y publicado bajo licencia Apache-2.0.

La relevancia de esta ficha radica en que demuestra que es posible mantener un rendimiento cercano al original (81,9 en MMLU 5-shot frente a 82,8 de la build TWX4) con un footprint de memoria muy reducido: 13,5 GiB cargado en tarjeta frente a los 21,0 GiB de TWX4. Esto abre la puerta a desplegar un MoE de 35B en GPUs de consumo alto o en una sola tarjeta de datacenter con margen para el contexto.

No obstante, conviene subrayar una advertencia importante: los pesos **no están publicados** en Hugging Face. El repositorio existe, pero el acceso al modelo es bajo petición mediante una reunión con un ingeniero de Tileward. La licencia declarada es Apache-2.0 (heredada del modelo base), pero la disponibilidad real es restringida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), basada en Qwen3.6-35B-A3B |
| Parámetros totales | 35 000 millones (35B) |
| Parámetros activos | 3 000 millones (3B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | TWX2 (formato propietario de Tileward); también existe build TWX4 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (pesos no publicados en el repositorio) |
| Tamaño en disco | 16,05 GB (TWX2); 24,1 GB (TWX4); 71,9 GB (original) |
| Memoria en tarjeta | 13,5 GiB (TWX2); 21,0 GiB (TWX4) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Relación con el base | quantized |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B: un transformer con capas de mezcla de expertos (MoE) en el que cada token activa aproximadamente 3 000 millones de parámetros de un total de 35 000 millones. Esta configuración permite un coste computacional por token similar al de un modelo denso de 3B, manteniendo la capacidad representacional de un modelo mucho mayor. Tileward no aporta detalles adicionales sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la información disponible.

La innovación técnica de esta ficha es el formato de compresión TWX2, desarrollado por Tileward. Según la model card, TWX2 reduce el peso a 16,05 GB con una pérdida de 0,85 puntos en MMLU respecto a la build TWX4 del mismo autor (81,9 frente a 82,8). En la comparativa de una sesión sobre una sola tarjeta, TWX2 presenta un 3,2 % de hechos inventados al redactar documentos (frente al 2,2 % de TWX4) y 112 llamadas a herramientas correctas de 120 con thinking activado (frente a 118 de TWX4), mientras que con thinking desactivado la diferencia se reduce a 117 frente a 118. Estos datos sugieren que la compresión afecta ligeramente a la fiabilidad factual y al uso de herramientas en modo razonamiento, pero apenas al modo directo.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.6-35B-A3B.
- Soporte de tool calling / function calling: la model card reporta 112/120 llamadas correctas con thinking activo y 117/120 con thinking desactivado en la build TWX2.
- Modo thinking (razonamiento extendido) y modo directo, según se desprende de las métricas separadas con thinking on/off.
- Redacción de documentos con control de factualidad: la model card mide un 3,2 % de hechos inventados en esta tarea.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el soporte de tool calling es un indicio.

## Casos de uso

- Despliegue en una sola GPU de consumo alto: con 13,5 GiB cargado en tarjeta, el modelo cabe en tarjetas de 16 GB o 24 GB, lo que permite ejecutar un MoE de 35B en estaciones de trabajo con una RTX 4090 o similar, dejando margen para el contexto y el KV cache.
- Asistentes con tool calling en producción: las 117/120 llamadas correctas con thinking desactivado indican que el modelo es adecuado para pipelines de agentes que invocan APIs, bases de datos o funciones internas sin necesidad de razonamiento extendido.
- Redacción asistida de documentación técnica: el 3,2 % de hechos inventados en la tarea de redacción de documentos lo hace viable para borradores que pasan por revisión humana, aunque no para publicación automática sin verificación.
- Servicio de inferencia con API compatible con OpenAI: Tileward ofrece un endpoint OpenAI-compatible en `https://api.tileward.com/v1`, lo que permite integrar el modelo en aplicaciones existentes sin cambiar el cliente.
- Prototipado rápido en entornos con VRAM limitada: la reducción del 78 % respecto al original permite iterar sobre un MoE de 35B en hardware que de otro modo no podría cargarlo.
- Evaluación comparativa de técnicas de cuantización: investigadores que estudien el impacto de la compresión en factualidad y tool calling pueden usar las métricas publicadas (MMLU, hechos inventados, llamadas correctas) como referencia reproducible.
- Chat multi-turno con contexto moderado: aunque la longitud de contexto no está disponible, el tamaño reducido en tarjeta deja espacio para el KV cache en GPUs de 24 GB.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Modelo | Tamaño en disco | MMLU (5-shot) |
|---|---|---|
| Qwen3.6-35B-A3B (original) | 71,9 GB | no disponible |
| Tileward 35B-A3B TWX4 | 24,1 GB | 82,8 |
| Qwen3.6-35B-A3B-NVFP4 (NVIDIA) | 23,4 GB | no disponible |
| **Tileward 35B-A3B TWX2** | **16,05 GB** | **81,9** |

Comparativa TWX4 frente a TWX2 en una sesión sobre una sola tarjeta:

| Métrica | TWX4 | TWX2 |
|---|---|---|
| Hechos inventados al redactar documentos (menor es mejor) | 2,2 % | 3,2 % |
| Llamadas a herramientas correctas de 120, thinking activo | 118 | 112 |
| Llamadas a herramientas correctas de 120, thinking desactivado | 118 | 117 |
| Memoria cargada en tarjeta | 21,0 GiB | 13,5 GiB |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 13,5 GiB cargado en tarjeta según la model card, más el espacio necesario para el KV cache y el contexto.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM para el modelo en TWX2; una RTX 4090 (24 GB) o una A100 (40/80 GB) ofrecen margen para contexto largo.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más (RTX 4080/4090, RTX 5070 Ti y superiores), siempre que el runtime soporte el formato TWX2.
- Opciones de despliegue: no se especifican en la información disponible. El formato TWX2 es propietario, por lo que no se puede asumir compatibilidad con vLLM, llama.cpp, Ollama o TGI sin confirmación del autor. La alternativa es usar la API OpenAI-compatible de Tileward en `https://api.tileward.com/v1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tileward-Qwen3.6-35B-A3B-TWX2 | 35B totales / 3B activos | no disponible | 81,9 | Apache-2.0 | Bajo petición (pesos no publicados) |
| Tileward-Qwen3.6-35B-A3B (TWX4) | 35B totales / 3B activos | no disponible | 82,8 | Apache-2.0 | Bajo petición |
| Qwen3.6-35B-A3B (original) | 35B totales / 3B activos | no disponible | no disponible | Apache-2.0 | Público en Hugging Face |
| Qwen3.6-35B-A3B-NVFP4 (NVIDIA) | 35B totales / 3B activos | no disponible | no disponible | Apache-2.0 | Público (build de NVIDIA) |

## Limitaciones y advertencias

- Los pesos no están publicados en Hugging Face: el acceso requiere solicitar una reunión con un ingeniero de Tileward. Esto limita la reproducibilidad y la auditoría independiente.
- El formato TWX2 es propietario; no hay confirmación de que sea compatible con runtimes estándar como vLLM, llama.cpp, Ollama o TGI.
- La compresión incrementa los hechos inventados del 2,2 % (TWX4) al 3,2 % (TWX2) en la tarea de redacción de documentos, lo que desaconseja su uso sin verificación humana en contextos factuales críticos.
- El tool calling con thinking activo pierde 6 llamadas correctas respecto a TWX4 (112 frente a 118 de 120), un deterioro relevante para agentes que dependen del razonamiento extendido.
- Los resultados de MMLU (81,9) están declarados por el autor y marcados como no verificados (`verified: false`); no hay evaluación independiente.
- No se dispone de información sobre sesgos, idiomas soportados, longitud de contexto ni comportamiento en dominios específicos.
- Aunque la licencia declarada es Apache-2.0, la restricción práctica de acceso a los pesos puede condicionar el uso comercial y la redistribución.
- No hay datos de latencia ni throughput, lo que impide estimar costes de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-Qwen3.6-35B-A3B-TWX2
- Build TWX4 del mismo autor: https://huggingface.co/Tileward-Inc/Tileward-Qwen3.6-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Artículo de investigación: https://tileward.com/research/a-16gb-qwen3-6-35b-a3b/
- Metodología de evaluación: https://tileward.com/evals/#compressed-model-a3b-twx2
- Investigación de Tileward: https://tileward.com/research/
- Plataforma y API: https://app.tileward.com/?join=explore
- Sitio de Tileward: https://tileward.com
- Reserva de reunión con ingeniero: https://calendar.app.google/hg2DzFTxKJgwFWm19
