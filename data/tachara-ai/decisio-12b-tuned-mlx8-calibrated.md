# tachara-ai/Decisio-12b-tuned-mlx8-calibrated

## Resumen

Decisio-12b-tuned-mlx8-calibrated es un modelo derivado de Google Gemma 4 12B-it, ajustado por tachara-ai para una tarea muy concreta: responder preguntas tipadas sobre un estado con una probabilidad calibrada para cada opción. No es un modelo conversacional generalista, sino un "modelo de decisión" que devuelve distribuciones de probabilidad sobre opciones en lugar de texto libre. Esta variante "calibrated" aplica temperaturas ajustadas por tipo de pregunta para que la confianza declarada coincida con la frecuencia real de acierto.

El repositorio publicado es la conversión a 8 bits en formato MLX, pensada para Apple Silicon. Los pesos ocupan 12,7 GB y se generaron con mlx-lm 0.32.2 a partir de los pesos bf16 del modelo original, con cuantización afín de 8 bits por peso en grupos de 64. El autor reporta que, sobre 1.894 preguntas no vistas en entrenamiento, la respuesta top coincide con la versión bf16 en el 97,9 % de los casos y la precisión es de 69,8 % frente a 69,9 %.

La relevancia de esta ficha es doble: por un lado documenta un caso de uso poco habitual (modelos de decisión con salida probabilística calibrada frente a modelos generativos); por otro, sirve de referencia práctica para quienes despliegan modelos de 12B en Macs con memoria unificada, con cifras de memoria medidas en un M5 Pro de 64 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), ajustado como modelo de decisión; pesos en MLX |
| Parametros totales | 11.907.350.272 (11,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el autor mide memoria de estado a 8k, 16k y 32k tokens |
| Tipos de cuantizacion | MLX affine, 8 bits por peso en grupos de 64 (repo principal); existe variante de 6 bits en otro repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (licencia del modelo base, con LICENSE y NOTICE incluidos) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`), mas `decision_config.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer decoder-only de 11,9B parámetros. Sobre esa base se aplicó un ajuste (adaptador) que se fusionó en el modelo base en fp32 y se redondeó una sola vez a bf16 de forma estocástica (semilla 0) antes de la conversión a MLX 8 bits. El resultado no es un modelo generativo al uso: la salida se interpreta mediante un layout de prompt propio, una lectura por letra de opción y temperaturas por tipo de pregunta, gestionados por el paquete `decisio` (versión 0.34.0 o superior). mlx-lm por sí solo carga los pesos pero no aplica ese layout, la lectura de opciones ni las temperaturas.

No se divulga la composición del dataset de entrenamiento. El autor indica que no se usaron ítems de evaluación de Decision Index ni de JevBench, ni en entrenamiento ni en selección de checkpoint, y que los datos se descontaminaron contra los conjuntos de test públicos de ambos benchmarks. Sí se incluyeron particiones oficiales de entrenamiento de algunos benchmarks públicos bajo sus licencias. Las temperaturas se ajustaron por mínima log loss por tipo de pregunta y banda de elección sobre la lectura plana del modelo bf16, y se reutilizan sin cambios en esta versión cuantizada. La innovación principal es, por tanto, el esquema de calibración y lectura probabilística, no la arquitectura.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado con una probabilidad por opción (formato de decisión, no texto libre).
- Tipos de pregunta soportados según la model card: sí/no, elección entre opciones y puntuación (score).
- Probabilidades calibradas por tipo de pregunta y banda de elección: la confianza declarada se corresponde con la tasa de acierto observada.
- Variante "calibrated" sin regla de commit sí/no, sin doble lectura y sin modo thinking.
- Servicio mediante el motor MLX de `decisio` (`python -m decisio.serve.vllm_engine --backend mlx`), con endpoint `/health` y defaults del repositorio (`systemone.repository_defaults`, `systemone.flavor`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes, visión o audio: no disponibles en la información proporcionada para este ajuste.

## Casos de uso

- Clasificación binaria calibrada en producción: usar el tipo sí/no para decidir si un ticket debe escalarse, con una probabilidad que permite fijar umbrales según el coste de falsos positivos y negativos, en lugar de confiar en la confianza declarada por un LLM generativo.
- Enrutamiento de decisiones con múltiples opciones: el tipo "choice" devuelve una distribución sobre etiquetas (por ejemplo, categoría de incidencia), útil en pipelines donde se necesita una probabilidad por clase y no una cadena de texto que haya que parsear.
- Puntuación de riesgo o calidad: el tipo "score" permite obtener una puntuación probabilística sobre una escala definida, aplicable a triaje de contenido o priorización de colas.
- Evaluación de modelos de decisión en investigación: el repositorio sirve como referencia reproducible para estudiar calibración (comparación bf16 frente a 8 bits con métricas pareadas) y para construir bancos de prueba propios.
- Despliegue local en Apple Silicon: con 13,8 GB de pesos y un pico de 14,9 GB a 8k tokens de estado, cabe en un Mac de 32 GB de memoria unificada, lo que permite prototipar sin GPU dedicada.
- Servicio interno de decisiones con contexto largo: a 32k tokens de estado el pico medido es de 18,6 GB (16,4 GB con diez preguntas), adecuado para decisiones sobre documentos extensos en un M5 Pro de 64 GB.
- Verificación de consistencia entre cuantizaciones: útil para equipos que necesitan validar que una versión 8 bits no altera las decisiones top respecto a bf16 antes de sustituir el modelo en producción.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Sí publica métricas de equivalencia entre esta versión MLX 8 bits y el repositorio bf16 servido con los mismos ajustes:

| Metrica | Resultado |
|---|---|
| Preguntas evaluadas (no vistas en entrenamiento) | 1.894 |
| Coincidencia de respuesta top global | 97,9 % |
| Coincidencia respuesta top en sí/no | 99,7 % |
| Coincidencia respuesta top en choice | 97,4 % |
| Coincidencia respuesta top en score | 98,1 % |
| Precision MLX 8 bits | 69,8 % |
| Precision bf16 | 69,9 % |
| Diferencia de precision (IC pareado 90 %) | -0,1 puntos (-0,5 a +0,3) |
| Diferencia maxima de probabilidad (muestra de 100) | 0,048 (media 0,0095) |
| Coincidencia de respuesta top en muestra de 100 | 100 / 100 |
| Reproducibilidad tras reinicio del servidor (muestra de 150) | identica |

Memoria medida en el motor MLX de `decisio` sobre Apple M5 Pro con 64 GB, sin swap:

| Estado | Memoria pico |
|---|---|
| Pesos | 13,8 GB |
| 8k tokens de estado | 14,9 GB |
| 16k tokens de estado | 16,2 GB |
| 32k tokens de estado | 18,6 GB |
| 32k tokens con diez preguntas | 16,4 GB |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: pesos de 13,8 GB; pico de 14,9 GB a 8k tokens, 16,2 GB a 16k y 18,6 GB a 32k (medido en M5 Pro de 64 GB, sin swap).
- Cabe en Mac de 32 GB de memoria unificada según el autor; recomendable 64 GB para contextos largos.
- GPU dedicadas: no se documentan requisitos para CUDA; el repositorio es específico de MLX (Apple Silicon). Para NVIDIA habría que usar la versión bf16 o convertir pesos, algo no cubierto por la model card.
- Despliegue: `decisio` 0.34.0 o superior con backend MLX (`uv sync --extra mlx` o `pip install "decisio[mlx]"`). mlx-lm carga los pesos pero no aplica el layout de prompt, la lectura por letra, las temperaturas ni la regla de commit.
- Latencia y throughput: no disponibles en la información proporcionada.
- Existe una variante de 6 bits (Decisio-12b-tuned-mlx-calibrated y Decisio-12b-tuned-mlx-commit) con menor consumo de memoria y mayor desviación respecto a bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Decisio-12b-tuned-mlx8-calibrated | 11,9B | no disponible (medido hasta 32k de estado) | MLX safetensors 8 bits | Apache 2.0 | Decision probabilistica calibrada, Apple Silicon |
| tachara-ai/Decisio-12b-tuned-calibrated (bf16) | 11,9B | no disponible | safetensors bf16 | Apache 2.0 | Misma tarea, referencia de calibracion, precision 69,9 % |
| tachara-ai/Decisio-12b-tuned-mlx8-commit | 11,9B | no disponible | MLX safetensors 8 bits | Apache 2.0 | Mismos pesos, distinto `decision_config.json` (flavor commit) |
| google/gemma-4-12B-it | 12B | no disponible | safetensors | Apache 2.0 | Modelo base generativo e instructivo |

No se dispone de comparación con modelos de decisión calibrada de otros autores en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: sin el layout de prompt y la lectura de `decisio`, las salidas no son utilizables como decisiones; mlx-lm por sí solo no reproduce el comportamiento.
- La precisión reportada (69,8 %) es sobre preguntas del propio autor; no hay benchmarks públicos independientes que permitan comparar con otros modelos.
- Diferencias frente a bf16: hasta 0,048 en una probabilidad individual y 2,1 % de respuestas top distintas; puede ser relevante si se fijan umbrales muy ajustados.
- Datos de entrenamiento no divulgados; no es posible auditar composición ni sesgos de forma independiente.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe calibrado.
- Riesgo de alucinación: aunque la salida sea probabilística, la calibración se validó en la distribución de preguntas del autor; fuera de ella la confianza puede no corresponder a la tasa de acierto.
- Licencia Apache 2.0 heredada de Gemma 4; conviene revisar `LICENSE` y `NOTICE` y las condiciones de uso de Google para el modelo base antes de uso comercial.
- Requiere `decisio` 0.34.0 o superior; versiones anteriores no aplican los ajustes del repositorio.
- La conversión a MLX no es la oficial de `decisio`; el autor lo indica explícitamente y publica hashes sha256 de cada fichero para verificación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tachara-ai/Decisio-12b-tuned-mlx8-calibrated
- Modelo de origen bf16: https://huggingface.co/tachara-ai/Decisio-12b-tuned-calibrated
- Variante commit (mismos pesos, distinto config): https://huggingface.co/tachara-ai/Decisio-12b-tuned-mlx8-commit
- Variantes de 6 bits: https://huggingface.co/tachara-ai/Decisio-12b-tuned-mlx-calibrated y https://huggingface.co/tachara-ai/Decisio-12b-tuned-mlx-commit
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Paquete `decisio`: no disponible en la informacion proporcionada (se instala vía `pip install "decisio[mlx]"`)
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
