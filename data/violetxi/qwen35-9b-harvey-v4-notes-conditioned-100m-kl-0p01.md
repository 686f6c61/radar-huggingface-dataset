# violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p01

## Resumen

qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p01 es un ajuste fino completo (full fine-tune) de Qwen/Qwen3.5-9B publicado por el usuario violetxi dentro de una línea de investigación sobre internalización de conocimiento ("world internalization", linaje v4). El objetivo declarado combina tres términos: predicción del siguiente token sobre notas, predicción del siguiente token sobre trayectorias condicionadas por notas (con la parte del asistente enmascarada) y una penalización KL de coeficiente 0,01 contra el modelo base congelado.

El modelo se entrenó sobre 100 millones de tokens supervisados por época (69.999.985 tokens de notas y 29.998.932 tokens de trayectorias de asistente antes del desplazamiento causal), durante 2 épocas y 3.068 actualizaciones, con filas de contexto de 16.384 tokens y un lote global de 8 sobre 2 GPU B200. El checkpoint final es checkpoint-3068 (época 2); existe además una revisión epoch1/checkpoint-1534.

Su relevancia es fundamentalmente metodológica: sirve como artefacto de investigación para estudiar cuánto conocimiento interno adquiere un modelo de 9B cuando se le entrena con notas y trayectorias, y cómo de lejos se desplaza respecto al base. El repositorio incluye pesos en safetensors (cuatro shards compuestos), tokenizer, plantilla de chat, procesadores y ajustes de generación, sin necesidad de adaptadores. La evaluación open-book nativa quedó incompleta y no se ha publicado ninguna puntuación de benchmark estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; heredada de Qwen/Qwen3.5-9B. El pipeline declarado es image-text-to-text y la clase de carga es AutoModelForImageTextToText |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | No aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible para inferencia; en entrenamiento se usaron filas de 16.384 tokens y el replay de KL un límite de 8.192 |
| Tipos de cuantización | No disponible; solo se publican pesos safetensors |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuatro shards compuestos, convertidos al dtype de servicio del base fijado) |
| Modelo base | Qwen/Qwen3.5-9B, revisión c202236235762e1c871ad0ccb60c8ee5ba337b9a |
| Tamaño del repositorio | 38,6 GB |
| Revisión evaluada | checkpoint-3068 (main, final); epoch1 (checkpoint-1534) |
| Compatibilidad | transformers, endpoints_compatible |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna más allá de lo heredado de Qwen/Qwen3.5-9B. El tag qwen3_5, el pipeline image-text-to-text y el uso de AutoModelForImageTextToText indican que se trata de un modelo multimodal texto-imagen del que se ha entrenado y convertido el bloque de pesos de texto, conservando los componentes auxiliares del base. Los cuatro shards safetensors se publican ya convertidos al dtype de servicio del modelo base fijado, de modo que no hace falta ningún adaptador ni reconstrucción local.

El entrenamiento es un full fine-tune con un objetivo de tres sumandos: predicción del siguiente token sobre notas, predicción del siguiente token sobre trayectorias condicionadas por notas con enmascaramiento del asistente y una regularización KL(base || estudiante) con coeficiente 0,01 frente a la revisión congelada del base. Cada época contiene 99.998.917 tokens supervisados antes del desplazamiento causal (69.999.985 de notas y 29.998.932 de trayectorias de asistente), que quedan en 99.993.091 tras el desplazamiento. El replay de KL procede del dataset harvey-kl-ground-sessions: 2.048 sesiones, límite de contexto 8.192 y hasta 128 posiciones de predicción del asistente por extracción, calculando la KL sobre el vocabulario completo y con la media de medias por sesión. La configuración de entrenamiento usa lote global 8, acumulación de gradiente 1, tasa de aprendizaje 5e-6 con schedule coseno, ratio de warmup 0,03, semilla 0 y 2 GPU B200 (job de Slurm 192912).

## Capacidades

- Generación de texto conversacional: el repositorio incluye plantilla de chat y ajustes de generación, y está etiquetado como conversational.
- Predicción y manejo de notas como contexto de entrada: el modelo fue entrenado específicamente con notas como condición, por lo que está diseñado para producir trayectorias de asistente condicionadas por notas.
- Recuerdo en modo closed-book: se han ejecutado 7.933 sondas de recall cerrado con puntuación determinista y sin juez GPT.
- Tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no hay evidencia publicada específica; la evaluación nativa planteaba tareas con 20 turnos, pero quedó incompleta.
- Capacidades multilingües: no disponible; no se declara ninguna lista de idiomas.
- Capacidades multimodales (visión): el pipeline declarado es image-text-to-text y se conservan procesadores y componentes auxiliares del base, pero no consta ninguna evaluación de visión en los artefactos publicados.
- Modo de razonamiento explícito ("thinking"): el dataset de evaluación asociado incluye el sufijo -think, pero no se detalla su comportamiento en la información disponible.

## Casos de uso

- Investigación en internalización de conocimiento: reproducción del experimento de linaje v4 para medir cuánta información retiene un modelo de 9B cuando se le entrena con notas y trayectorias; el checkpoint y las revisiones (epoch1, epoch2) permiten estudiar la evolución por épocas.
- Estudio de regularización KL en ajuste fino: con un coeficiente de 0,01 y una KL retenida de 0,015158521151 sobre 32.768 posiciones, sirve como caso de referencia para medir deriva respecto al base en lugar de solo la pérdida de la tarea.
- Sistemas de memoria externa basados en notas: dado que el modelo fue entrenado con notas como condición, es adecuado para prototipos en los que un agente escribe notas persistentes y luego condiciona sus respuestas sobre ellas.
- Evaluación comparativa de checkpoints: las revisiones checkpoint-1534 y checkpoint-3068 permiten analizar el efecto de una segunda época sobre el recuerdo y la deriva, sin reentrenar.
- Réplica metodológica en dominios especializados: el linaje v4 se describe en tarjetas de terceros como un estudio sobre un corpus sintético de despacho de abogados (Calderwood & Harkness), lo que lo hace utilizable como plantilla para construir experimentos equivalentes en otros dominios sintéticos.
- Generación condicionada en pipelines de transformers: al ser endpoints_compatible y cargarse con AutoModelForImageTextToText, puede desplegarse en servicios de inferencia compatibles con la API de transformers para pruebas A/B contra el modelo base.
- Auditoría de calidad de evaluación: el propio repositorio documenta fallos de grading (una respuesta diagnóstica correcta recibió notas inconsistentes de 7/7 y 6/7), por lo que sirve como caso práctico para diseñar protocolos de evaluación robustos en modelos con conocimiento cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. La evaluación open-book nativa quedó incompleta y no tiene puntuación publicada. Los únicos datos numéricos disponibles son métricas internas del entrenamiento:

| Métrica | Valor | Detalle |
|---|---|---|
| KL retenida en checkpoint-3068 | 0,015158521151 | 256 sesiones / 32.768 posiciones de predicción |
| Sondas de recall closed-book | 7.933 sondas ejecutadas | Completas, con puntuación determinista y sin juez GPT; no se publica puntuación agregada en la información disponible |
| Evaluación open-book nativa | Incompleta | 250 tareas × 4 muestras, 20 turnos, grading con GPT-5.6 Sol; falló por timeout de la API de generación |
| Limitación de grading documentada | No cuantificada | Una respuesta diagnóstica conocida como correcta recibió 7/7 y 6/7 de forma inconsistente |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): en torno a 19-20 GB solo para pesos, más memoria para el contexto y el runtime. Es una estimación a partir de los 9.653.104.368 parámetros, no un dato publicado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 10-12 GB, asumiendo overhead típico de 10-20 %. No se publican pesos cuantizados, por lo que habría que generarlos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 6-8 GB. Igualmente, no hay artefactos cuantizados en el repositorio.
- GPU recomendadas para entrenamiento: el autor usó 2 GPU B200. Para inferencia, el tamaño del repositorio (38,6 GB) sugiere A100 40/80 GB, H100 o L40S como opciones cómodas.
- GPU de consumo: con cuantización de 4 bits el modelo podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB); en bf16 no cabe en GPUs de 16 GB ni en 12 GB.
- Opciones de despliegue: transformers con AutoModelForImageTextToText (ruta documentada por el autor), y por la etiqueta endpoints_compatible, servicios que expongan la API de transformers. Para vLLM, TGI, llama.cpp u Ollama no hay artefactos publicados ni confirmación en la información disponible; en el caso de llama.cpp u Ollama sería necesaria una conversión a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p01 | 9.653.104.368 | No disponible (16.384 tokens en entrenamiento) | Apache 2.0 | Full fine-tune con 100M de tokens de notas y trayectorias, KL 0,01 |
| Qwen/Qwen3.5-9B | No disponible (9B nominal) | No disponible | No disponible en la información proporcionada | Modelo base congelado; referencia de la KL |
| violetxi/qwen35-9b-harvey-v4-notes-conditioned-30m-kl-0p01 | No disponible | No disponible | No disponible en la información proporcionada | Misma familia, condición de 30M de tokens |
| violetxi/qwen35-9b-wmrl-v4-kl-mix30m | No disponible | No disponible | Apache 2.0 | Mismo linaje v4, condición kl-mix30m; según tarjeta de terceros, full fine-tune sobre corpus sintético de despacho de abogados |

## Limitaciones y advertencias

- Deriva respecto al base: la KL retenida de 0,015158521151 indica que el modelo se ha alejado del comportamiento de Qwen/Qwen3.5-9B, por lo que no debe asumirse paridad de comportamiento general con el base.
- Evaluación incompleta: la evaluación open-book nativa falló por timeout y no existe puntuación de benchmark; cualquier afirmación de rendimiento general carece de respaldo publicado.
- Fiabilidad del grading: el propio autor documenta que una respuesta diagnóstica correcta recibió calificaciones inconsistentes (7/7 y 6/7), lo que limita la confianza en evaluaciones automáticas sobre este modelo.
- Riesgo de alucinación: no hay datos publicados sobre tasas de alucinación; el entrenamiento orientado a recuerdo cerrado puede favorecer respuestas confiadas aunque incorrectas cuando la nota o el contexto no cubren la pregunta.
- Dominio estrecho de entrenamiento: el modelo se ha entrenado sobre notas y trayectorias de un linaje de investigación concreto, no sobre un corpus generalista, por lo que su utilidad fuera de ese dominio no está verificada.
- Idiomas: no se declara ninguna lista de idiomas soportados, así que el soporte multilingüe es una incógnita.
- Contexto: la ventana de inferencia no está documentada; el único dato es el uso de 16.384 tokens por fila en entrenamiento, que no garantiza un comportamiento equivalente en longitudes mayores.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B y de los datasets asociados antes de un despliegue en producción.
- Repositorio sin tracción: el modelo tiene 0 descargas y 0 likes, y no hay evidencia de validación por terceros.
- Uso en producción: dado que no hay pesos cuantizados ni soporte confirmado en motores de inferencia de alto rendimiento, el coste de puesta en producción recae por completo en quien lo adopte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p01
- Discusiones del modelo: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p01/discussions
- Dataset de replay de KL (harvey-kl-ground-sessions): https://huggingface.co/datasets/violetxi/harvey-kl-ground-sessions/tree/5ae59c84ad92b5634084e9c4aec6e7007ef48d3d
- Dataset de evaluación de recall closed-book: https://huggingface.co/datasets/violetxi/harvey-eval-recall-qwen35-9b-notes70-notecondtraj30-100m-kl-0p01-think
- Artefactos de evaluación open-book incompletos: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p01/tree/main/evals/harvey-20260923/openbook
- Limitación de grading documentada: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p01/blob/main/evals/harvey-20260923/openbook/GRADING_LIMITATION.json
- Índice de evaluaciones y enlaces: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p01/blob/main/evals/harvey-20260923/README.md
- Run de W&B del entrenamiento: https://wandb.ai/stanford_autonomous_agent/wm-internalization/runs/a2a99e5e
- Variante de 30M de tokens: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-30m-kl-0p01
- Ficha en FriendliAI de la variante de 30M: https://friendli.ai/models/violetxi/qwen35-9b-harvey-v4-notes-conditioned-30m-kl-0p01
- Ficha en Savrn de qwen35-9b-wmrl-v4-kl-mix30m: https://savrn.com/models/qwen35-9b-wmrl-v4-kl-mix30m
