# turintech/pplx-decider-27B-Artemis-GGUF

## Resumen

pplx-decider-27B-Artemis-GGUF es una cuantización GGUF del modelo perplexity-ai/pplx-decider-v1.1-27b, publicada por TurinTech bajo el paraguas de su herramienta de compresión Artemis. No es un modelo conversacional: se trata de un modelo de decisión ("decider") que responde preguntas tipadas (sí/no, elección única, puntuación) sobre texto o imágenes, devolviendo una probabilidad para cada respuesta en una sola pasada. El modelo base procede de Perplexity AI y cuenta con aproximadamente 26.900 millones de parámetros.

La relevancia de esta publicación es práctica: reduce el peso del modelo de 50,8 GiB (formato original) a 15,28 GB en cuantización Q4_K_S, permitiendo ejecutarlo en una GPU de 24 GB con un consumo medido de 16,6 GiB. Según el autor, esta compresión conserva el 96,8 % de las respuestas idénticas al modelo original, frente al 95,7 % de una cuantización Q4_K_M estándar.

El modelo se sirve exclusivamente a través del endpoint `/v1/systemone` de llama-server, una interfaz específica para decisiones tipadas que no soporta chat multi-turno convencional. Requiere llama.cpp de 9 de octubre de 2026 o posterior. Está orientado a clasificación y enrutamiento de decisiones estructuradas, no a generación libre de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no publicados) |
| Parámetros totales | 26.895.998.464 (~26,9 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos de despliegue usan `-c 16384` y se documentan entradas de hasta 4.983 tokens |
| Tipos de cuantización | Q4_K_S (15,28 GB), IQ3_M; el repositorio incluye también archivos de proyector de visión etiquetados `:BF16` y `:Q8_0` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería `gguf`, para llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base pplx-decider-v1.1-27b en la documentación proporcionada. Por el tamaño (26,9 mil millones de parámetros) y el pipeline declarado (text-classification), se trata de un transformer de gran tamaño adaptado a tareas de decisión tipada en lugar de generación de texto libre. La model card menciona capacidades multimodales (procesamiento de texto e imágenes), con archivos de proyector de visión separados en el repositorio.

El trabajo de TurinTech (Artemis) se centra en la compresión: la cuantización Q4_K_S reduce el modelo a 15,28 GB manteniendo un 96,8 % de coincidencia con las respuestas del original en el conjunto de test `LocalLLaMA/typed-decisions`. No se detallan en la información disponible los datos de entrenamiento del modelo base, la composición del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Respuesta a preguntas tipadas sobre texto: sí/no (`noul`), elección única y puntuaciones, con probabilidad asociada a cada respuesta.
- Respuesta a preguntas tipadas sobre imágenes (soporte multimodal mediante proyector de visión).
- Salida de probabilidades calibradas por respuesta en una sola pasada de inferencia.
- Clasificación y enrutamiento de decisiones estructuradas (urgencia, categoría, selección entre opciones).
- No soporta conversación multi-turno: el endpoint `/v1/systemone` no es un endpoint de chat.
- Soporte de entradas largas: se documenta una entrada de 4.983 tokens respondida correctamente.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Triaje de tickets de soporte: enviar el texto del ticket como `state` y preguntar por la urgencia (`noul`) o la categoría (elección única), obteniendo una probabilidad por respuesta que permite priorizar la cola automáticamente.
- Enrutamiento de correo entrante: clasificar cada mensaje en un conjunto cerrado de departamentos con una sola pasada, sin generación de texto, lo que reduce latencia y coste frente a un LLM conversacional.
- Moderación de contenido: preguntas tipadas de sí/no sobre texto o imágenes para decidir si un contenido requiere revisión humana, aprovechando la salida probabilística para fijar umbrales.
- Verificación de imágenes en pipelines de datos: usar el proyector de visión para responder preguntas binarias o de selección sobre imágenes (por ejemplo, presencia de un objeto o cumplimiento de un criterio visual).
- Filtrado previo en pipelines de anotación: descartar o etiquetar muestras automáticamente antes de la revisión manual, con el modelo ejecutándose en una única GPU de 24 GB.
- Clasificación de intención en asistentes: determinar la intención del usuario entre un conjunto fijo de opciones antes de derivar la petición al sistema correspondiente.
- Despliegue en hardware de gama alta de consumo: servir el modelo en local (RTX 4090 o similar con 24 GB) para decisiones sensibles que no deben salir de la infraestructura propia.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el conjunto `LocalLLaMA/typed-decisions`:

| Tarea | Métrica | Valor |
|---|---|---|
| Acuerdo con el original | Misma respuesta (%) | 96,8 |
| Acuerdo con el original | Cambios en respuestas seguras | 0 |
| Decisiones tipadas | Precisión (%) | 70,8 |

Comparación de compresión indicada en la model card:

| Formato | Tamaño | Memoria GPU | Misma respuesta que el original |
|---|---|---|---|
| Original | 50,8 GiB | 50,8 GiB | referencia |
| Q4_K_M estándar | no disponible | no disponible | 95,7 % |
| Q4_K_S (Artemis) | 15,28 GB | 16,6 GiB | 96,8 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 16,6 GiB medidos con la cuantización Q4_K_S y dos slots (`--parallel 2`); el original requiere 50,8 GiB.
- GPU recomendadas: tarjetas con 24 GB de VRAM (RTX 4090, RTX 5090, A10G, L4 de 24 GB); con más VRAM se puede aumentar el contexto o el número de slots.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 5090 con la cuantización Q4_K_S; las variantes IQ3_M reducen aún más el requisito.
- Despliegue: llama.cpp (llama-server) versión del 9 de octubre de 2026 o posterior, probado en los builds `1e6f04a` (b11540) y b11572; también disponible en Ollama (`turintech/pplx-decider-27b-artemis`) y LM Studio.
- Comando de referencia: `llama-server -hf turintech/pplx-decider-27B-Artemis-GGUF:Q4_K_S --port 8080 -c 16384 -ub 4096 -b 4096 --no-mmproj`.
- Notas de rendimiento: el tamaño de batch afecta ligeramente a las probabilidades (0,876 con batch 512 frente a 0,897 con batch 4096 en una entrada de 923 tokens); para varios clientes concurrentes se documenta `-np 8 -c 32768 --cache-ram 0`, que consume unos 1,5 GiB más de VRAM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pplx-decider-27B-Artemis-GGUF (Q4_K_S) | ~26,9 mil millones | no disponible (entradas documentadas de hasta ~5.000 tokens) | GGUF | Apache 2.0 | Decisor tipado, 16,6 GiB de VRAM, 96,8 % de acuerdo con el original |
| pplx-decider-v1.1-27b (original) | ~26,9 mil millones | no disponible | safetensors | no disponible | Modelo base sin comprimir, 50,8 GiB de VRAM |
| Cuantización Q4_K_M estándar del mismo modelo | ~26,9 mil millones | no disponible | GGUF | Apache 2.0 | 95,7 % de acuerdo con el original según el autor |

No se dispone de información sobre otros modelos de decisión comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: no mantiene diálogos multi-turno ni genera texto libre; solo responde preguntas tipadas a través de `/v1/systemone`.
- Dependencia estricta de la versión de llama.cpp (9 de octubre de 2026 o posterior); versiones anteriores no soportan el endpoint.
- La precisión declarada en decisiones tipadas es del 70,8 %, lo que exige validación en el dominio concreto antes de usarlo en producción.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- El tamaño de batch modifica ligeramente las probabilidades de salida; conviene fijar `-ub 4096 -b 4096` para reproducir las mediciones.
- No se documentan sesgos conocidos, cobertura idiomática ni comportamiento ante entradas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de un modelo de Perplexity AI conviene revisar los términos del modelo base.
- El riesgo de alucinación en sentido clásico es limitado al no generar texto libre, pero las probabilidades pueden estar mal calibradas en dominios alejados de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/pplx-decider-27B-Artemis-GGUF
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
- Resultados declarados: https://huggingface.co/turintech/pplx-decider-27B-Artemis-GGUF#results
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Ollama: https://ollama.com/turintech/pplx-decider-27b-artemis
- LM Studio: https://lmstudio.ai/turintech/pplx-decider-27b-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
