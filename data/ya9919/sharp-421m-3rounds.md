# ya9919/sharp-421m-3rounds

## Resumen

FinL three-round comparator (publicado como `ya9919/sharp-421m-3rounds`) es un modelo de decisión financiera de aproximadamente 421 millones de parámetros, desarrollado por el autor `ya9919` en el marco del proyecto S²-MAS, un entorno de simulación multiagente a escala social para estudiar cómo las decisiones heterogéneas de los hogares se agregan en resultados poblacionales. El modelo parte del encoder Laya de ConvAI Innovations (basado en ModernBERT-large) y le añade una cabeza de puntuación de opciones, de modo que no genera texto libre sino que puntúa un conjunto cerrado de alternativas para un estado de hogar y una pregunta dados.

La relevancia del modelo es acotada pero específica: actúa como política de decisión reutilizable dentro de un pipeline de simulación financiera, con una interfaz que permite servir distintas tareas (consumo, tenencia de productos financieros, elección de medios de pago) sin cambiar de arquitectura. El checkpoint ha pasado por dos etapas de SFT seguidas de RLCD nativo sobre datos de encuestas reales, con 1.721.623 observaciones de entrenamiento por idioma.

Se distribuye en formato nativo Laya/PyTorch (safetensors) para inferencia en BF16, con una variante MLX separada para FP16. El modelo es de investigación controlada, solo en inglés, y no cuenta con descargas ni validación comunitaria en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (Laya, basado en ModernBERT-large) con cabeza de puntuación de opciones |
| Parámetros totales | 421.293.830 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (nativo PyTorch); FP16 en la variante MLX; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Controlled Model Research License v1.2 (s2-mas-controlled-research-v1.2), con derechos upstream Apache-2.0 retenidos |
| Formato de pesos | safetensors (nativo Laya/PyTorch), más tokenizer y configuración de inferencia |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder Laya de ConvAI Innovations, derivado de ModernBERT-large, y lo combina con una cabeza de scoring que asigna puntuaciones a todas las alternativas candidatas de una pregunta cerrada. No es un modelo generativo: la salida es una distribución de preferencia sobre opciones discretas, lo que permite reutilizar la misma interfaz de política para tareas distintas dentro de S²-MAS. La inferencia nativa se ejecuta en BF16.

El entrenamiento consta de dos etapas de SFT seguidas de RLCD nativo, con 1.721.623 observaciones por idioma provenientes de datos de encuestas reales. El modelo base original Laya, en BF16 nativo, obtiene un 60,2080 % de accuracy y un 29,5574 % de F1 en el test compartido; tras el entrenamiento financiero, este checkpoint de tres rondas alcanza el 74,5336 % de accuracy y el 38,0164 % de F1 de macro por pregunta. Existe un checkpoint de continuación de seis rondas (FinL) que amplía la cobertura supervisada. Los registros de entrenamiento y evaluación no se distribuyen con el modelo.

## Capacidades

- Puntuación de alternativas en preguntas financieras de opción cerrada (por ejemplo, tenencia de tarjetas de crédito, cuentas de depósito a la vista, cuentas de valores o depósitos a plazo no vencidos).
- Modelado de decisiones de hogar condicionado a un estado del hogar y a una pregunta con menú de candidatos.
- Interfaz de política reutilizable: la misma cabeza de scoring sirve para distintas tareas de elección.
- Clasificación binaria y multiclase sobre clases candidatas, con métricas de accuracy y F1 macro por pregunta.
- Soporte exclusivo de inglés; no se documentan capacidades multilingües en este checkpoint.
- No se documentan tool calling, function calling, razonamiento multi-paso, agentes autónomos, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Simulación de decisiones de hogar a escala: integrado en S²-MAS, el modelo puntúa las alternativas de cada uno de los agentes sintéticos (el manuscrito evalúa 12 millones de hogares y 24 millones de elecciones) para estudiar cómo las decisiones individuales se agregan en resultados poblacionales.
- Modelado de tenencia de productos financieros: dado un estado de hogar, el modelo estima la probabilidad relativa de poseer tarjetas de crédito activas, cuentas de depósito, cuentas de valores o depósitos a plazo, útil para calibrar carteras sintéticas frente a encuestas reales.
- Análisis de elección de medios de pago y consumo: la política permite encadenar decisiones de consumo, efectivo y pago a lo largo del tiempo dentro del motor de simulación, lo que facilita estudios de trayectorias financieras.
- Evaluación de políticas y escenarios contrafactuales: al ser una política reutilizable, se puede aplicar el mismo modelo bajo condiciones cambiantes del mundo para comparar resultados poblacionales entre escenarios.
- Generación de datos sintéticos de acompañamiento: el proyecto público incluye scripts de generación de datos sintéticos independientes que pueden usar el modelo como política de referencia para producir etiquetas de elección.
- Investigación académica en finanzas del consumidor: el checkpoint de tres rondas sirve como comparador frente a la continuación de seis rondas y frente al Laya original, con métricas publicadas sobre el mismo test compartido.
- Despliegue en entornos con recursos limitados: con 421 M de parámetros y un repositorio de 0,8 GB, cabe en una sola GPU de consumo para inferencia BF16, lo que facilita experimentos de investigación sin clúster dedicado.

## Benchmarks y rendimiento

| Test | Idioma de entrada | Backend / precisión | QA (denominador) | Versiones de pregunta | Accuracy | F1 macro por pregunta |
|---|---|---|---:|---:|---:|---:|
| Preguntas financieras compartidas | Inglés | PyTorch BF16 | 240.458 | 119 | 74,5336 % | 38,0164 % |
| Test ampliado | Inglés | PyTorch BF16 | 418.597 | 862 | 56,3657 % | 19,2395 % |
| Preguntas financieras compartidas (Laya original) | Inglés | PyTorch BF16 | 240.458 | 119 | 60,2080 % | 29,5574 % |

La accuracy pondera por igual cada registro de QA; el F1 macro por pregunta promedia el F1 sobre todas las clases candidatas de cada versión de pregunta y luego pondera por igual las versiones de pregunta. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 421 M de parámetros en BF16, el peso ocupa aproximadamente 0,85 GB; sumando activaciones y overhead, el consumo cabe holgadamente en GPUs de 8 GB o menos.
- GPU recomendadas: cualquier GPU con soporte BF16, incluidas RTX 4090, RTX 3090, A100 y H100; para el checkpoint bilingüe de referencia, el manuscrito reporta tiempos de una sola petición en una NVIDIA A100 PCIe de 40 GB en FP16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en BF16; la variante MLX está pensada para FP16.
- Opciones de despliegue: inferencia nativa Laya/PyTorch en BF16 mediante `predict_example.py`; runtime MLX para la variante FP16. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el manuscrito reporta latencia y throughput para una sola petición con batch y concurrencia uno sobre tres casos chinos fijos con el checkpoint bilingüe; no se proporcionan cifras concretas en la información disponible para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en test compartido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinL three-round (este modelo) | 421 M | no disponible | 74,5336 % accuracy / 38,0164 % F1 | Controlled Model Research License v1.2 | Hugging Face, 0 descargas |
| Laya original (convaiinnovations/laya) | ~421 M (misma base) | no disponible | 60,2080 % accuracy / 29,5574 % F1 | Apache-2.0 (upstream) | Hugging Face |
| FinL seis rondas | no disponible | no disponible | no disponible en la información proporcionada | Controlled Model Research License v1.2 | Hugging Face |
| fin-laya-mlx-3-rounds | ~421 M | no disponible | mismo checkpoint en FP16 | Controlled Model Research License v1.2 | Hugging Face |

No se dispone de comparaciones con otros modelos de decisión financiera de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo admite inglés; no se documenta soporte multilingüe en este checkpoint.
- Está diseñado exclusivamente para preguntas de opción cerrada con menú de candidatos; no genera texto libre ni mantiene conversaciones.
- La accuracy cae del 74,5336 % al 56,3657 % al pasar del test compartido al test ampliado, lo que indica una generalización limitada a versiones de pregunta no vistas.
- El F1 macro por pregunta es bajo (38,0164 % en el test compartido y 19,2395 % en el ampliado), lo que refleja dificultad para discriminar entre clases candidatas en preguntas con muchas opciones.
- Riesgo de sesgo: entrenado sobre datos de encuestas reales, puede reproducir sesgos de la población encuestada y de la construcción de los estados de hogar sintéticos.
- Riesgo de alucinación acotado al formato de scoring, pero las puntuaciones pueden ser sobreconfiadas en estados de hogar fuera de la distribución de entrenamiento.
- Licencia de investigación controlada (Controlled Model Research License v1.2): el uso comercial requiere revisar los términos; se retienen derechos upstream Apache-2.0.
- Los registros de entrenamiento y evaluación no se distribuyen con el modelo, lo que limita la reproducibilidad completa.
- El motor GENESE/MAS permanece privado, por lo que la integración en el pipeline completo no es verificable de forma independiente.
- Sin descargas ni likes en Hugging Face en el momento de redactar esta ficha; no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/sharp-421m-3rounds
- Checkpoint FinL de seis rondas: https://huggingface.co/ya9919/FinL
- Variante MLX de tres rondas: https://huggingface.co/ya9919/fin-laya-mlx-3-rounds
- Checkpoint bilingüe MLX: https://huggingface.co/ya9919/fin-laya-multilingual-mlx
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Licencia: https://huggingface.co/ya9919/fin-laya-3-rounds/blob/main/LICENSE
- Manuscrito S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Repositorio del proyecto: https://github.com/KataDavidXD/s2-mas
- Ejemplos de QA: qa_examples.json (referenciado en la model card)
