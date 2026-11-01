# tachara-ai/Decisio-12b-tuned-fp8-commit

## Resumen

Decisio-12b-tuned-fp8-commit es un modelo derivado de Google Gemma 4 12B IT, publicado por tachara-ai, especializado en la emisión de decisiones tipadas: dado un estado descrito en lenguaje natural, el modelo devuelve una probabilidad calibrada para cada opción de un conjunto cerrado de respuestas. La variante `commit` añade sobre las probabilidades calibradas una regla de compromiso para preguntas de sí/no: cualquier probabilidad estrictamente entre 0,20 y 0,80 se reporta en el borde de esa banda del lado correspondiente (0,80 por encima de 0,5; 0,20 en o por debajo), de modo que la respuesta nunca cambia, pero sí su calibración.

El repositorio contiene los pesos en FP8 (float8 e4m3) con escalas de pesos por canal y cuantización dinámica de activaciones por token (`FP8_DYNAMIC`), generados con llm-compressor 0.14.0.1 a partir de los pesos bf16 de `tachara-ai/Decisio-12b-tuned-commit`. El adaptador se fusionó en la base en fp32 y se redondeó una sola vez a bf16 (de forma estocástica, semilla 0) antes de cuantizar. Cuenta con 11.959.730.224 parámetros y un tamaño de repositorio de 13,1 GB.

Su relevancia es doble: por un lado, ofrece una ruta de despliegue en FP8 con requisitos de VRAM reducidos frente al modelo bf16; por otro, introduce un contrato de inferencia propio (layout de prompt, lectura de letras de opción, temperaturas por tipo de pregunta y regla de commit) que no aplica vLLM por sí solo, sino que requiere el paquete `decisio` 0.33.0 o superior. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), pesos cuantizados en FP8 |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (float8 e4m3), escalas de pesos por canal, activaciones dinamicas por token (`FP8_DYNAMIC`); pesos base en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache License 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 12B IT de Google, un transformer decoder-only. Sobre esa base, tachara-ai ha aplicado un ajuste fino orientado a la tarea de decisión: el modelo recibe preguntas tipadas sobre un estado y emite una distribución de probabilidad sobre las opciones disponibles, con una lectura basada en las letras de opción y temperaturas ajustadas por tipo de pregunta y banda de elección. Las temperaturas se ajustaron por mínima log loss sobre la lectura plana del modelo bf16 y se reutilizan sin cambios en esta versión FP8.

El proceso de cuantización partió de los pesos bf16 de `Decisio-12b-tuned-commit`, fusionando primero el adaptador en la base en fp32 y redondeando una sola vez a bf16 con redondeo estocástico (semilla 0). La cuantización a FP8 se realizó con llm-compressor 0.14.0.1. El fichero `decision_config.json` lista cada fichero por sha256 y documenta el proceso, y `SHA256SUMS` enumera los ficheros del repositorio. Los datos de entrenamiento no se han divulgado; el autor indica que no se usaron ítems de evaluación de Decision Index ni de JevBench en entrenamiento ni en selección de checkpoint, y que los datos se descontaminaron contra los conjuntos de test públicos de ambos boards. El entrenamiento incluyó splits oficiales de entrenamiento de algunos benchmarks públicos, bajo sus licencias, sin usar ítems de test o evaluación de esos benchmarks.

La innovación destacable no está en la arquitectura, sino en el contrato de inferencia y en la regla de commit: la variante `commit` y la `calibrated` comparten pesos y difieren únicamente en `decision_config.json`. Además, `decisio` 0.33.0 activa la emulación de casts de precisión de torch para bases FP8 (`--emulate-precision-casts auto`), lo que reduce la diferencia entre dos arranques en frío del mismo modelo FP8.

## Capacidades

- Emisión de decisiones tipadas: dado un estado y un conjunto de opciones, devuelve una probabilidad por opción con lectura por letra de opción.
- Calibración de probabilidades por tipo de pregunta y banda de elección, con temperaturas ajustadas por mínima log loss.
- Regla de commit para preguntas de sí/no: probabilidades estrictamente entre 0,20 y 0,80 se reportan en el borde de la banda del lado correspondiente.
- Generación de texto y razonamiento heredados de Gemma 4 12B IT (capacidades específicas no detalladas en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Triaje automatizado de incidencias: el modelo recibe la descripción de un estado (por ejemplo, una alerta de monitorización) y un conjunto cerrado de categorías de triaje, y devuelve la probabilidad de cada una; la regla de commit permite fijar umbrales operativos claros en decisiones binarias como escalar o no escalar.
- Enrutamiento de tickets de soporte: con opciones tipadas (equipo de red, equipo de aplicaciones, seguridad, etc.), las probabilidades calibradas permiten derivar el ticket al equipo correcto y mantener una cola de revisión humana para los casos en la banda intermedia.
- Moderación de contenido con decisión binaria: la regla de commit acota la incertidumbre en la franja 0,20-0,80, lo que facilita definir políticas de revisión manual consistentes entre ejecuciones.
- Sistemas de recomendación con opciones discretas: selección entre un conjunto finito de acciones (mostrar promoción, no mostrar, mostrar variante) con probabilidad asociada para priorizar experimentos.
- Verificación de hipótesis en pipelines de datos: dado un estado tabular descrito en lenguaje natural y un conjunto de hipótesis, obtener una distribución de probabilidad que alimente un paso posterior de agregación o votación.
- Despliegue en infraestructura con VRAM limitada: al estar cuantizado en FP8, el modelo reduce el espacio de pesos respecto a bf16 (13,1 GB de repositorio), lo que permite servirlo en GPUs con soporte FP8 que no alojarían cómodamente la versión bf16.
- Evaluación reproducible de decisiones: la combinación de `decision_config.json` con hashes sha256 y `SHA256SUMS` permite auditar qué configuración exacta produjo cada respuesta en producción.

## Benchmarks y rendimiento

El autor reporta comparaciones contra el repositorio bf16 (`Decisio-12b-tuned-calibrated`) sobre preguntas cribadas contra sus datos de entrenamiento. La métrica es la respuesta top contra la clave, con diferencia pareada en puntos y un intervalo del 90%.

| Conjunto | bf16 | FP8 commit | Diferencia (IC 90%) |
|---|---|---|---|
| Decisiones duras multidominio (525 preguntas) | 75,05 | 75,24 | +0,19 (-1,14 a +1,52) |
| Ítems mixtos de desarrollo (430) | 66,28 | 66,05 | -0,23 (-1,63 a +1,16) |
| Redacción natural (939) | 69,01 | 69,22 | +0,21 (-0,53 a +0,96) |

Datos adicionales reportados por el autor:

| Métrica | Valor |
|---|---|
| Misma respuesta top que bf16 (decisiones duras) | 94,3% |
| Misma respuesta top que bf16 (mixtos de desarrollo) | 94,9% |
| Misma respuesta top que bf16 (redacción natural) | 97,0% |
| Misma respuesta top que la variante calibrated (430 ítems mixtos) | 100% |
| Precisión sí/no con regla de commit (125 preguntas) | 88,0% (igual que bf16) |
| Consistencia entre dos arranques en frío (variante calibrated, 500 preguntas) | respuestas idénticas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan aproximadamente 12 GB (11.959.730.224 parámetros a 1 byte por parámetro); el repositorio completo pesa 13,1 GB. Hay que añadir memoria para caché KV y activaciones, no cuantificada en la información disponible.
- GPU recomendadas: se requiere una GPU con soporte FP8. No se especifican modelos concretos en la información proporcionada.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; depende del soporte FP8 de la GPU y del contexto utilizado.
- Opciones de despliegue: el autor documenta el servidor propio de `decisio` mediante `uv run python -m decisio.serve.vllm_engine --base tachara-ai/Decisio-12b-tuned-fp8-commit`, que requiere `decisio` 0.33.0 o superior. vLLM por sí solo carga los pesos como un checkpoint Gemma 4 FP8 ordinario, pero no aplica el layout de prompt, la lectura de letras de opción, las temperaturas ni la regla de commit de decisio.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decisio-12b-tuned-fp8-commit | 11.959.730.224 | no disponible | FP8 (e4m3, dinámica por token) | Apache 2.0 | HuggingFace (22 descargas) |
| tachara-ai/Decisio-12b-tuned-commit | no disponible (base bf16 del mismo ajuste) | no disponible | bf16 | Apache 2.0 | HuggingFace |
| tachara-ai/Decisio-12b-tuned-fp8-calibrated | mismos pesos que este repositorio | no disponible | FP8 (e4m3, dinámica por token) | Apache 2.0 | HuggingFace |
| google/gemma-4-12B-it | no disponible en la información | no disponible | bf16 (modelo base) | Apache 2.0 (según el autor) | HuggingFace |

La comparación con modelos de la misma categoría (modelos de decisión tipada) no está disponible en la información proporcionada. Frente a las alternativas de la misma familia, la diferencia es de configuración y precisión: la variante `calibrated` y la `commit` comparten pesos y solo difieren en `decision_config.json`; el modelo bf16 sirve de referencia de calidad, con diferencias dentro de 0,3 puntos en los conjuntos reportados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al heredar Gemma 4 12B IT, arrastra los sesgos del modelo base, no documentados aquí.
- Riesgo de alucinación: el modelo está diseñado para emitir probabilidades sobre opciones cerradas, no para generar hechos; aun así, las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la información disponible.
- La regla de commit altera la calibración reportada, no la respuesta: una probabilidad entre 0,20 y 0,80 se presenta en el borde de la banda, lo que puede inducir a interpretar una confianza mayor o menor de la real si no se conoce la regla.
- El modelo requiere `decisio` 0.33.0 o superior para aplicar el layout de prompt, la lectura de opciones, las temperaturas y la regla de commit; servirlo solo con vLLM produce un Gemma 4 FP8 sin ese contrato.
- Requiere GPU con soporte FP8; no se especifican los modelos compatibles.
- Los datos de entrenamiento no se han divulgado, lo que limita la reproducibilidad y la evaluación de sesgos.
- Restricciones de licencia: Apache 2.0, con `LICENSE` y `NOTICE` en el repositorio; el modelo base es de Google.
- El autor reporta que la cuantización no es una copia respuesta a respuesta del bf16: cambia la respuesta top en aproximadamente 3 a 6 de cada 100 preguntas, lo que debe tenerse en cuenta al migrar un sistema en producción.
- Los benchmarks reportados son internos y sobre preguntas cribadas contra los datos de entrenamiento, no sobre conjuntos estándar independientes.

## Enlaces

- HuggingFace: https://huggingface.co/tachara-ai/Decisio-12b-tuned-fp8-commit
- Modelo bf16 de referencia: https://huggingface.co/tachara-ai/Decisio-12b-tuned-commit
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Variante calibrated: https://huggingface.co/tachara-ai/Decisio-12b-tuned-fp8-calibrated
- Paper, blog, repositorio o demo de decisio: no disponible en la información proporcionada.
