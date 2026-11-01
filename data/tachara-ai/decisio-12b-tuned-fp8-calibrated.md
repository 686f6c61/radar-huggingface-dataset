# tachara-ai/Decisio-12b-tuned-fp8-calibrated

## Resumen

Decisio-12b-tuned-fp8-calibrated es un modelo de decisión derivado de Google Gemma 4 12B IT, desarrollado por tachara-ai. No es un modelo conversacional al uso: responde preguntas tipadas sobre un estado devolviendo una probabilidad calibrada para cada opción disponible. La variante "calibrated" ajusta las temperaturas por tipo de pregunta y banda de elección para que la confianza declarada coincida con la frecuencia real de acierto, sin regla de compromiso sí/no ni modo de razonamiento extendido.

El modelo parte de los pesos bf16 de tachara-ai/Decisio-12b-tuned-calibrated, con el adaptador fusionado en fp32 y redondeado una sola vez a bf16 antes de la cuantización. La versión de este repositorio aplica cuantización FP8 (float8 e4m3) con escalas por canal y cuantización dinámica de activaciones por token (FP8_DYNAMIC), generada con llm-compressor 0.14.0.1. El resultado pesa 13,1 GB y requiere GPU con soporte FP8.

Su relevancia es acotada pero específica: ofrece una interfaz de decisión probabilística calibrada sobre un transformer de 12B parámetros, empaquetada con un servidor vLLM propio (decisio 0.33.0 o superior) que aplica el layout de prompt, la lectura de letras de opción y las temperaturas del autor. Con 26 descargas y creado en octubre de 2026, es un artefacto de nicho orientado a pipelines de decisión automatizada más que a generación de texto general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (gemma4_unified), derivado de google/gemma-4-12B-it |
| Parámetros totales | 11.959.730.224 (11,96B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (float8 e4m3) con escalas por canal y activaciones dinámicas por token (FP8_DYNAMIC); pesos base en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 13,1 GB de repo |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 4 12B IT, un transformer denso de 11,96B parámetros. Sobre esa base, tachara-ai entrena un adaptador que convierte el modelo en un decisor: recibe una pregunta tipada junto con un estado y emite una distribución de probabilidad sobre las opciones disponibles. La variante "calibrated" ajusta las temperaturas por tipo de pregunta y banda de elección mediante minimización de log loss sobre la lectura plana del modelo bf16, y esas temperaturas se mantienen sin cambios en la versión FP8.

El proceso de cuantización partió de los pesos bf16 del repositorio Decisio-12b-tuned-calibrated: el adaptador se fusionó en la base en fp32, se redondeó estocásticamente una vez a bf16 (semilla 0) y después se cuantizó a FP8 con llm-compressor 0.14.0.1. Los datos de entrenamiento no se divulgan; el autor declara que no se usaron ítems de evaluación de Decision Index ni de JevBench y que el dataset se descontaminó contra los conjuntos de test públicos de ambos boards. Algunos benchmarks públicos aportaron sus splits oficiales de entrenamiento bajo sus licencias, sin usar sus ítems de test.

## Capacidades

- Respuesta a preguntas tipadas con una probabilidad calibrada por opción, en lugar de texto libre.
- Calibración de confianza: la probabilidad declarada se ajusta por temperatura para reflejar la tasa real de acierto.
- Decisión multdominio: evaluación medida sobre decisiones duras de varios dominios (525 preguntas) y elementos mixtos de desarrollo (430).
- Robustez ante redacción natural: conjunto específico de 939 preguntas con lenguaje natural.
- Variante de compromiso (commit) disponible en otro repositorio, con regla sí/no y precisión del 88,0% en 125 preguntas.
- Sin modo de razonamiento extendido, sin doble lectura y sin regla de compromiso en esta variante.
- Tool calling, function calling, agentes y capacidades multimodales: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Triaje automatizado de tickets: el modelo recibe el estado del ticket y una pregunta tipada (por ejemplo, categoría o prioridad) y devuelve una distribución calibrada sobre las opciones, lo que permite fijar umbrales de derivación a revisión humana según la confianza declarada.
- Enrutamiento de decisiones en pipelines de negocio: para cada solicitud se formula una pregunta con opciones cerradas y se usa la probabilidad calibrada para decidir la ruta, con la ventaja de que la confianza es interpretable y comparable entre tipos de pregunta.
- Moderación con umbrales explícitos: al emitir probabilidades calibradas, es posible configurar cortes de aceptación/rechazo por opción y auditar la tasa de error esperada a partir de la confianza declarada.
- Evaluación de riesgo en formularios estructurados: el modelo responde preguntas tipadas sobre el estado del formulario (por ejemplo, nivel de riesgo), y la calibración permite priorizar casos con probabilidad intermedia para revisión manual.
- Clasificación con opciones cerradas en producción: sustituye clasificadores ad hoc por un único modelo que responde a múltiples preguntas tipadas, con el servidor decisio gestionando el layout de prompt y la lectura de letras de opción.
- Despliegue en GPU con FP8: al pesar 13,1 GB y usar FP8_DYNAMIC, encaja en GPUs con soporte FP8 para servir decisiones con menor huella de memoria que la versión bf16, manteniendo resultados equivalentes (diferencias dentro de 0,3 puntos en los conjuntos medidos).

## Benchmarks y rendimiento

El autor publica comparaciones de la variante FP8 frente al repositorio bf16 (Decisio-12b-tuned-calibrated), con diferencia pareada en puntos y intervalo del 90%:

| Conjunto | Preguntas | bf16 | FP8 | Diferencia (IC 90%) |
|---|---|---|---|---|
| Decisiones duras multdominio | 525 | 75,05 | 75,24 | +0,19 (-1,14 a +1,52) |
| Elementos mixtos de desarrollo | 430 | 66,28 | 66,05 | -0,23 (-1,63 a +1,16) |
| Redacción natural | 939 | 69,01 | 69,22 | +0,21 (-0,53 a +0,96) |

El autor indica que la FP8 mantiene la misma respuesta principal en el 94,3%, 94,9% y 97,0% de los tres conjuntos respectivamente, y que la variante commit logra la misma respuesta principal que la calibrada en los 430 elementos mixtos, con una precisión sí/no del 88,0% en 125 preguntas, igual a la del repositorio bf16. Dos arranques en frío de la variante calibrada respondieron de forma idéntica a 500 preguntas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13-14 GB para los pesos FP8, más overhead de activaciones y KV cache; el repo pesa 13,1 GB.
- GPU recomendadas: cualquier GPU con soporte FP8 nativo (por ejemplo, H100, L40S, A100 con soporte FP8 según configuración); el autor exige explícitamente una GPU con soporte FP8.
- GPU de consumo: no disponible en la información proporcionada; el requisito de FP8 condiciona la elegibilidad de tarjetas consumer.
- Despliegue: servidor propio de decisio sobre vLLM (`uv run python -m decisio.serve.vllm_engine --base tachara-ai/Decisio-12b-tuned-fp8-calibrated`), con decisio 0.33.0 o superior. vLLM por sí solo carga los pesos como un checkpoint Gemma 4 FP8 ordinario, pero no aplica el layout de prompt, la lectura de letras, las temperaturas ni la regla de compromiso de decisio.
- Latencia y throughput: no disponibles en la información proporcionada; el autor menciona que decisio 0.33.0 activa la emulación de precisión de torch para bases FP8 (`--emulate-precision-casts auto`), lo que reduce la diferencia entre arranques en frío.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decisio-12b-tuned-fp8-calibrated | 11,96B | no disponible | Decisión probabilística calibrada, FP8 | Apache 2.0 | HuggingFace (26 descargas) |
| Decisio-12b-tuned-calibrated (bf16) | 11,96B | no disponible | Decisión probabilística calibrada, bf16 | Apache 2.0 | HuggingFace |
| Decisio-12b-tuned-fp8-commit | 11,96B | no disponible | Decisión con regla de compromiso sí/no, FP8 | Apache 2.0 | HuggingFace |
| google/gemma-4-12B-it | 12B | no disponible | Modelo conversacional general | Términos de Gemma 4 | HuggingFace |

La comparación con modelos de decisión de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión, no conversacional: no genera texto libre ni mantiene diálogos multi-turno; requiere el layout de prompt y la lectura de opciones de decisio.
- Dependencia de herramienta: sin el servidor decisio 0.33.0 o superior, vLLM carga los pesos pero no aplica temperaturas, layout ni regla de compromiso, por lo que los resultados no serán los previstos.
- Requiere GPU con soporte FP8; no se documenta compatibilidad con GPUs sin FP8 nativo.
- Datos de entrenamiento no divulgados, lo que limita la evaluación independiente de sesgos y cobertura.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al ser un derivado de Gemma 4, hereda los sesgos del modelo base.
- Idiomas soportados y longitud de contexto no disponibles; no se puede garantizar cobertura multilingüe.
- Calibración dependiente del dominio: las temperaturas se ajustaron por tipo de pregunta y banda de elección sobre datos del autor; fuera de esa distribución la calibración puede degradarse.
- Licencia Apache 2.0 para este repositorio, con los términos de Gemma 4 de Google aplicables al modelo base (ver LICENSE y NOTICE); conviene revisar ambas antes de uso comercial.
- Cambio de respuesta principal en un 3-6% de las preguntas respecto a bf16, pese a la equivalencia agregada; en producción conviene validar sobre el dominio propio.

## Enlaces

- HuggingFace: https://huggingface.co/tachara-ai/Decisio-12b-tuned-fp8-calibrated
- Repositorio bf16 de referencia: https://huggingface.co/tachara-ai/Decisio-12b-tuned-calibrated
- Variante commit: https://huggingface.co/tachara-ai/Decisio-12b-tuned-fp8-commit
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- llm-compressor: no disponible en la información proporcionada
- decisio: no disponible en la información proporcionada
