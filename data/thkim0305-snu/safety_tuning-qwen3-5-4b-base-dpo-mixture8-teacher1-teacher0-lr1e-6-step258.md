# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step258

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step258` es un checkpoint de ajuste fino por preferencias (DPO) sobre la base Qwen3.5-4B-Base, publicado por el usuario thkim0305-SNU. El objetivo declarado es el *safety tuning*: alinear las respuestas del modelo hacia un comportamiento más seguro mediante pares de preferencia generados automáticamente. El checkpoint corresponde al paso 258 de optimización, tras 3 épocas de entrenamiento.

Con 4.659.865.088 parámetros reales (según safetensors) y un repositorio de 9,3 GB, se trata de un modelo multimodal de tipo image-text-to-text que conserva los pesos de visión y MTP del modelo base, además de los pesos de lenguaje entrenados. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de investigación.

Su relevancia actual radica en que documenta una receta concreta de alineación de seguridad sobre una base Qwen3.5, con hiperparámetros explícitos (beta 0,1, batch de 64 pares, lr 1e-6) y un conjunto de datos de 5.493 pares de preferencia sobre 1.755 prompts. No obstante, no se han publicado resultados de benchmarks ni detalles sobre la composición de los ocho datasets utilizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5; incluye pesos de visión y MTP |
| Parámetros totales | 4.659.865.088 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B-Base` en la revisión `1001bb4d826a52d1f399e183466143f4da7b741b`. La arquitectura subyacente es la de Qwen3.5, un transformer multimodal que procesa entradas de imagen y texto; el export preserva los pesos de visión y los pesos MTP (multi-token prediction) del modelo base, mientras que los pesos de lenguaje son los entrenados durante el DPO.

El entrenamiento consiste en optimización directa de preferencias (DPO) con beta 0,1, tamaño de lote de 64 pares y tasa de aprendizaje máxima de 1e-6, durante 258 actualizaciones del optimizador (3 épocas). Para cada prompt, ambas respuestas fueron generadas por Qwen3.8-27B: la respuesta con puntuación binaria 1 se asignó como *chosen* y la de puntuación 0 como *rejected*. La mezcla de entrenamiento contiene ocho datasets con 5.493 pares de preferencia sobre 1.755 prompts. No se especifica la composición de esos ocho datasets ni el número total de tokens vistos.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-4B-Base.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con pesos de visión preservados del base.
- Alineación de seguridad mediante DPO: el modelo ha sido entrenado para preferir respuestas consideradas seguras frente a las rechazadas.
- Predicción multi-token (MTP) conservada del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking*, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- **Filtrado de contenido en aplicaciones de chat**: el modelo puede utilizarse como generador de respuestas alineadas con criterios de seguridad en asistentes conversacionales, aprovechando el ajuste DPO para reducir salidas dañinas en dominios sensibles.
- **Investigación en alineación y DPO**: sirve como punto de comparación reproducible para estudiar el efecto de 258 pasos de DPO con beta 0,1 sobre una base Qwen3.5-4B, dado que la receta de entrenamiento está documentada con precisión.
- **Evaluación de seguridad de modelos multimodales**: al conservar los pesos de visión, permite analizar cómo el ajuste DPO afecta a respuestas que involucran imágenes, un escenario menos explorado que el texto puro.
- **Generación de datos de preferencia sintéticos**: el pipeline descrito (respuestas de un profesor de 27B puntuadas de forma binaria) puede replicarse para construir nuevos conjuntos de pares *chosen/rejected* sobre otros dominios.
- **Prototipado de asistentes con entrada visual**: con 4,66 mil millones de parámetros, es viable para demos de image-text-to-text en entornos con recursos moderados, aunque la VRAM exacta no está documentada.
- **Base para ajustes posteriores**: al ser un checkpoint intermedio (paso 258), puede servir como inicialización para experimentos de DPO adicionales o de RLHF con otras mezclas de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 4,66 mil millones de parámetros en fp16 requiere aproximadamente 9,3 GB solo para pesos, a lo que hay que sumar caché KV y el codificador visual; en cuantización de 8 bits bajaría a unos 4,7 GB y en 4 bits a unos 2,3 GB, aunque el autor no publica cifras oficiales.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar viabilidad en GPUs de 16-24 GB (RTX 4090, A100 40 GB) en fp16, pero no está confirmado por el autor.
- ¿Cabe en GPU de consumo? No confirmado; por el número de parámetros es plausible en tarjetas de 24 GB en fp16 y en tarjetas de 8-12 GB con cuantización, pero no hay datos oficiales.
- Opciones de despliegue: el modelo es compatible con `transformers` (librería declarada) y con endpoints compatibles (tag `endpoints_compatible`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step258 | 4.659.865.088 | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint DPO de seguridad sobre Qwen3.5-4B-Base |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | no disponible | Hugging Face | Modelo base sin ajuste DPO; referencia directa |
| Qwen3.8-27B (profesor) | no disponible | no disponible | no disponible | no disponible | Utilizado para generar las respuestas elegidas y rechazadas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados por el autor; al derivar de Qwen3.5-4B-Base, hereda los sesgos del modelo base, que no se detallan.
- **Riesgo de alucinación**: no evaluado; no hay benchmarks ni análisis de fidelidad factual en la información disponible.
- **Limitaciones de contexto e idioma**: la longitud de contexto y los idiomas soportados no están especificados, lo que impide garantizar un comportamiento multilingüe o ventanas largas.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B-Base, cuyos términos no se detallan en la información proporcionada.
- **Checkpoint intermedio**: al tratarse del paso 258 (3 épocas), no se garantiza que sea el punto óptimo de convergencia; no hay curvas de entrenamiento ni métricas de validación publicadas.
- **Datos de preferencia automáticos**: las etiquetas *chosen/rejected* provienen de puntuaciones binarias de un profesor (Qwen3.8-27B), lo que puede introducir sesgos del profesor y ruido en la señal de preferencia.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- **Producción**: sin datos de latencia, throughput ni estabilidad, no se recomienda su despliegue en producción sin una evaluación propia.

## Enlaces

- [Hugging Face: thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step258](https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step258)
- [Modelo base: Qwen/Qwen3.5-4B-Base](https://huggingface.co/Qwen/Qwen3.5-4B-Base)
- Revisión del modelo base: `1001bb4d826a52d1f399e183466143f4da7b741b`
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
