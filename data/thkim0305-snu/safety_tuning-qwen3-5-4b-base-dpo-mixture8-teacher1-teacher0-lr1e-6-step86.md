# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step86

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step86 es un checkpoint de ajuste fino por preferencias (DPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario thkim0305-SNU en Hugging Face. El modelo conserva la arquitectura multimodal del base (pipeline image-text-to-text) y sus 4.659.865.088 parámetros, y se distribuye con licencia Apache 2.0.

El objetivo declarado es el *safety tuning*: alinear las respuestas del modelo hacia comportamientos más seguros mediante pares de preferencia generados por un modelo profesor (Qwen3.8-27B) que puntúa las respuestas con una etiqueta binaria (1 = elegida, 0 = rechazada). El entrenamiento se realizó sobre una mezcla de ocho conjuntos de datos con 5.493 pares de preferencia distribuidos en 1.755 prompts, durante una época y 86 pasos de optimización.

Es relevante como ejemplo reproducible de un pipeline de alineación ligero sobre un modelo de 4B con capacidades de visión, aunque su madurez es muy temprana: cero descargas, cero likes y una model card mínima. La información disponible no documenta resultados de evaluación ni detalles sobre el contenido de los ocho datasets.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5; incluye pesos de visión y MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base en la revisión `1001bb4d826a52d1f399e183466143f4da7b741b`. Se trata de un transformer multimodal con torre de visión y pesos MTP (multi-token prediction), que el export preserva intactos; solo se reentrenan los pesos del lenguaje mediante DPO. No se especifica en la información disponible el número de capas, dimensión oculta, cabezas de atención ni la longitud de contexto nativa del base.

El entrenamiento aplica DPO con beta 0,1, tamaño de lote de 64 pares y tasa de aprendizaje máxima de 1e-6, durante 1 época y 86 actualizaciones del optimizador. Los pares de preferencia se generaron haciendo que Qwen3.8-27B produjera ambas respuestas para cada prompt y asignara una puntuación binaria: la respuesta con score 1 se usó como *chosen* y la de score 0 como *rejected*. La mezcla combina ocho datasets con 5.493 pares sobre 1.755 prompts, lo que da una media de aproximadamente 3,1 pares por prompt. No se documenta filtrado de datos, temperatura de muestreo ni criterios de seguridad explícitos.

## Capacidades

- Generación de texto conversacional en formato multi-turno, heredada del base Qwen3.5-4B.
- Procesamiento de imagen y texto conjuntamente (pipeline image-text-to-text), con pesos de visión preservados del base.
- Predicción multi-token (MTP) conservada en el export, potencialmente útil para decodificación especulativa.
- Alineación orientada a seguridad: el DPO busca favorecer respuestas con puntuación de seguridad alta según el profesor.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking* explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en alineación: sirve como punto de comparación controlado para estudiar el efecto de DPO con profesor sintético sobre un base de 4B, ya que el checkpoint intermedio (paso 86) permite analizar la evolución del entrenamiento.
- Filtrado de respuestas en asistentes conversacionales: el ajuste de seguridad puede emplearse para reducir salidas dañinas en despliegues de bajo riesgo, siempre con una capa de moderación adicional.
- Prototipado multimodal: al conservar la torre de visión, permite experimentar con tareas image-text-to-text (descripción de imágenes, VQA sencilla) en entornos de investigación con GPUs de gama media.
- Generación de datos sintéticos de preferencia: el modelo puede usarse como generador de respuestas candidatas en pipelines de anotación, que luego se filtran con un modelo profesor mayor.
- Evaluación de robustez: útil para medir la degradación de capacidades tras un DPO agresivo con lr 1e-6 y solo 86 pasos, comparando frente al base sin ajustar.
- Docencia y reproducibilidad: el repositorio documenta hiperparámetros y origen de datos, lo que facilita replicar el experimento en cursos o talleres de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, unos 2,5-3 GB, aunque no se publican versiones cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes y contextos largos; RTX 4090 (24 GB) para inferencia en bf16 sin problemas; RTX 3090 (24 GB) también viable.
- GPU de consumo: cabe en RTX 4080 (16 GB) y RTX 4070 Ti (12 GB) en bf16 con contexto moderado; en 4 bits podría ejecutarse en GPUs de 8 GB, previa conversión manual.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI para servir en fp16; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO (este) | 4,66 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint DPO de seguridad, multimodal |
| Qwen/Qwen3.5-4B-Base | ~4 B | no disponible | Apache 2.0 | Hugging Face (oficial) | Base sin alinear; referencia directa |
| Qwen/Qwen3.5-4B-Instruct (si existe) | ~4 B | no disponible | Apache 2.0 | no confirmado en la información | Alternativa alineada oficial, sin datos verificados aquí |
| Llama 3.2 3B Instruct | 3,2 B | 128 K | Llama 3.2 Community | Hugging Face | Alternativa multimodal de tamaño similar, licencia más restrictiva |

La comparación con Qwen3.5-4B-Instruct y Llama 3.2 3B se ofrece solo como referencia de categoría; no se dispone de métricas de este checkpoint para contrastar rendimiento.

## Limitaciones y advertencias

- No se han publicado evaluaciones de seguridad, sesgo ni calidad; el ajuste DPO con profesor sintético puede introducir sobreajuste a los criterios del profesor (Qwen3.8-27B) sin garantizar seguridad real.
- Riesgo de alucinación heredado del base, no mitigado por el DPO, que solo optimiza preferencias sobre respuestas generadas.
- El checkpoint corresponde al paso 86 de una única época: es un estado intermedio, no necesariamente convergido.
- La model card no documenta la composición de los ocho datasets ni los prompts utilizados, lo que impide auditar la cobertura de riesgos.
- Idiomas soportados y longitud de contexto no documentados; no se debe asumir el contexto nativo del base sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere evaluación propia.
- Repositorio con cero descargas y sin validación comunitaria: tratar como experimental.
- El pipeline declarado es image-text-to-text, pero no se detalla el rendimiento de la torre de visión tras el ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step86
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Revisión del base usada: `1001bb4d826a52d1f399e183466143f4da7b741b`
- Paper de DPO: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
