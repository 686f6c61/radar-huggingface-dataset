# StephC/Gemma-2-2B-Question-First-Exposure-mixed-seed20261009

## Resumen

Gemma-2-2B-Question-First-Exposure-mixed-seed20261009 es un checkpoint de investigación publicado por StephC (Stefano Civelli) como parte del estudio *Exposure to Question-First Prompts Changes How Language Models Read the Context*. Se trata de un ajuste fino completo (full fine-tuning) del modelo `google/gemma-2-2b-it` (revisión `299a8560bedf22ed1c72a8a11e7dce4a7f9f51f8`) orientado a estudiar cómo el orden de los elementos en el prompt (contexto, pregunta y opciones) afecta a la forma en que el modelo lee y procesa la información.

El modelo pertenece a una familia de nueve checkpoints liberados para una semilla fija (20261009): tres familias de modelos entrenadas con tres regímenes de orden distintos (solo CQO, solo QOC y mixto). Este checkpoint concreto corresponde al régimen mixto, en el que cada registro de entrenamiento se presenta una vez en orden CQO (contexto-pregunta-opciones) y otra en orden QOC (pregunta-opciones-contexto) a lo largo de dos pasadas.

Es relevante para la comunidad de interpretabilidad mecanicista y de evaluación de prompts, no como asistente conversacional de propósito general. El autor advierte explícitamente que los modelos se ajustaron sobre respuestas de opción múltiple y que los resultados solo conciernen a los conjuntos de datos y plantillas fijas del artículo. La arquitectura subyacente es la de Gemma 2 (transformer decoder-only) con 2.614.341.888 parámetros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), atención eager |
| Parametros totales | 2.614.341.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de `google/gemma-2-2b-it`; no especificada en la información) |
| Tipos de cuantizacion | No se han aplicado cuantizaciones; pesos en FP32 (BF16 en evaluaciones ordinarias) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Gemma (sujeta a la Sección 3.2 de los Gemma Terms y a la Prohibited Use Policy) |
| Formato de pesos | Safetensors (`model-*.safetensors`), FP32 |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-2b-it` y se somete a un ajuste fino completo (no es un adaptador LoRA). El entrenamiento emplea parámetros y estados AdamW en FP32 con autocast BF16, tasa de aprendizaje de 5e-6, tamaño de lote efectivo de 8 y atención eager. Se realizaron 1.024 actualizaciones del optimizador sobre 4.096 registros de entrenamiento, divididos a partes iguales entre RACE-M, RACE-H, LogiQA y SciQ, en dos pasadas.

La innovación metodológica reside en el régimen de exposición al orden del prompt: en la configuración mixta, cada registro se presenta una vez en orden CQO (contexto, pregunta, opciones) y otra en orden QOC (pregunta, opciones, contexto). El objetivo del estudio es medir cómo esta exposición diferencial al orden altera la lectura del contexto por parte del modelo. La ejecución de origen es `posthoc_training_v1_gemma_2_2b_it_20261009_balanced/step_1024`, y el `release_manifest.json` registra la receta y el SHA-256 original de cada fichero del checkpoint. Los tensores de pesos no han sido cuantizados, convertidos ni redistribuidos en fragmentos (resharded).

## Capacidades

- Generación de texto condicionada a plantillas de opción múltiple (contexto, pregunta, opciones).
- Resolución de tareas de comprensión lectora y razonamiento sobre RACE-M, RACE-H, LogiQA y SciQ.
- Sensibilidad medible al orden del prompt (CQO frente a QOC), objeto central del estudio.
- Soporte de evaluación mediante el arnés `qfe.evaluate` del repositorio del artículo.
- Soporte del ensayo de intercambio de pregunta (*question swap*) mediante `qfe.question_swap`, que requiere pesos FP32.
- No está diseñado como asistente conversacional de propósito general.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en interpretabilidad mecanicista: analizar cómo la exposición al orden del prompt modifica las representaciones internas del modelo, usando los checkpoints CQO, QOC y mixto como condiciones experimentales controladas.
- Reproducción de experimentos del artículo: ejecutar `qfe.evaluate` y `qfe.question_swap` con la semilla 20261009 para verificar los resultados publicados sobre los conjuntos de opción múltiple.
- Estudios de robustez frente al orden de la información: comparar el rendimiento del checkpoint mixto frente a los de orden único para cuantificar la degradación o mejora al alterar la posición del contexto.
- Evaluación de sensibilidad a plantillas: servir como línea base ajustada para medir cuánto influye la plantilla de prompt en tareas de comprensión lectora (RACE, LogiQA, SciQ).
- Análisis de sesgo posicional: instrumentar experimentos que midan la atención diferencial a opciones y contexto según su posición en la secuencia.
- Docencia y formación en evaluación de LLM: ilustrar con un caso real y reproducible cómo el orden del prompt es una variable experimental de primer orden, no un detalle de ingeniería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 10,5 GB solo para pesos (2.614.341.888 parámetros × 4 bytes), más estados de activación y caché KV; el tamaño del repositorio es de 10,5 GB.
- VRAM estimada en BF16 (evaluaciones ordinarias del artículo): aproximadamente 5,2 GB para pesos, más overhead de activaciones.
- GPU recomendadas: A100 o H100 para FP32 con margen; RTX 4090 (24 GB) o RTX A6000 (48 GB) para FP32 en inferencia individual.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080); en FP32 requiere al menos 16 GB (RTX 4090, RTX A4000 16 GB).
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; el autor recomienda usar FP32 para preservar el ensayo de intercambio de pregunta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Gemma-2-2B-Question-First-Exposure-mixed-seed20261009 | 2,61 B | No disponible | Gemma | Ajuste fino de investigación sobre orden de prompt |
| google/gemma-2-2b-it (base) | 2,61 B | No disponible | Gemma | Asistente conversacional instruction-tuned |
| Gemma-2-2B-Question-First-Exposure-CQO-only (misma familia) | 2,61 B | No disponible | Gemma | Ajuste fino solo con orden CQO |
| Gemma-2-2B-Question-First-Exposure-QOC-only (misma familia) | 2,61 B | No disponible | Gemma | Ajuste fino solo con orden QOC |

Los checkpoints CQO-only y QOC-only de la misma semilla forman parte del mismo release de nueve checkpoints descrito en la model card. No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente conversacional: fue ajustado sobre respuestas de opción múltiple y no se reclama rendimiento general de tarea o despliegue.
- Los resultados del artículo solo conciernen a los conjuntos de datos y la plantilla de prompt fijos del estudio.
- El release de una sola semilla no reproduce por sí mismo las estimaciones de incertidumbre a nivel de semilla del artículo (que reporta seis semillas).
- La semilla 20261009 se eligió por ser la primera numerada, no por rendimiento.
- Riesgo de alucinación: no evaluado en la información disponible; el ajuste sobre opción múltiple puede inducir respuestas forzadas a un conjunto de opciones aunque la pregunta no lo requiera.
- Limitación de idioma: solo inglés (`en`).
- Uso comercial restringido por la Sección 3.2 de los Gemma Terms y la Prohibited Use Policy adjunta; deben consultarse `LICENSE.txt`, `NOTICE.txt` y `USE_POLICY.txt`.
- Los ficheros `model-*.safetensors` son derivados modificados distribuidos byte a byte tal como se evaluaron; no incluyen estados del optimizador.
- No se incluye texto de entrenamiento ni credenciales en el repositorio.
- Para el ensayo de intercambio de pregunta es necesario cargar pesos FP32; usar BF16 altera ese experimento concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StephC/Gemma-2-2B-Question-First-Exposure-mixed-seed20261009
- Repositorio del artículo (paper, código, salidas y reproducción): https://github.com/Stefano-Civelli/question-first-exposure
- Repositorio de investigación original: https://github.com/Stefano-Civelli/prompt-order-sensitivity
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
