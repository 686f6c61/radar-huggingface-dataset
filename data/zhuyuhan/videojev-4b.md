# ZhuYuhan/VideoJev-4B

## Resumen

VideoJev-4B es un modelo especializado en comprensión de vídeo desarrollado por Yuhan Zhu y colaboradores (MCG-NJU), construido mediante fine-tuning sobre Qwen/Qwen3.5-4B. Su particularidad es que no genera texto libre: es un "System One model" que realiza puntuación directa de candidatos, lo que le permite resolver tareas de localización temporal (temporal grounding) y preguntas de opción múltiple sobre vídeo (multiple-choice video QA) con una latencia muy reducida frente a modelos generativos equivalentes.

El modelo tiene 4.471.106.560 parámetros y se distribuye en formato safetensors con licencia Apache 2.0. Se integra en el ecosistema transformers mediante código personalizado (`trust_remote_code=True`) y requiere dependencias específicas como flash-linear-attention y flash-attn. La inferencia se realiza procesando fotogramas a una tasa configurable (por defecto 2 FPS) con un límite de hasta 2048 fotogramas y un contexto de 8192 tokens.

Su relevancia actual radica en el enfoque de "decisión directa": en lugar de generar una respuesta autoregresiva token a token, el modelo produce puntuaciones sigmoid para intervalos temporales o softmax sobre opciones, lo que reduce drásticamente el coste computacional en tareas de vídeo donde la latencia es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con código personalizado (custom_code); detalles completos no disponibles |
| Parametros totales | 4.471.106.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (parámetro `context` en `predict_video`) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el ejemplo oficial) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VideoJev-4B parte de Qwen/Qwen3.5-4B y se ajusta mediante fine-tuning para convertirse en un modelo de decisión directa ("System One"). En lugar de generar texto, el modelo puntúa candidatos: para temporal grounding emite puntuaciones sigmoid independientes por intervalo temporal, y para video QA emite una distribución softmax sobre las opciones proporcionadas. El procesamiento de vídeo se realiza extrayendo fotogramas a una tasa configurable (2 FPS en el ejemplo oficial), con un máximo de 2048 fotogramas y un contexto de 8192 tokens.

El stack de inferencia requiere `flash-linear-attention` (0.4.2), `fla-core` (0.4.2), `flash-attn`, `causal-conv1d` y `transformers==5.14.1`, lo que sugiere el uso de capas de atención lineal o híbridas en la arquitectura. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Localización temporal (temporal grounding): identifica el intervalo de tiempo (en segundos) de un evento descrito en lenguaje natural dentro de un vídeo.
- Preguntas de opción múltiple sobre vídeo (multiple-choice video QA): selecciona la respuesta correcta entre opciones dadas con puntuaciones de probabilidad.
- Puntuación directa de candidatos: devuelve probabilidades (sigmoid para grounding, softmax para QA) en lugar de texto generado.
- Procesamiento de vídeo a tasa de fotogramas configurable (por defecto 2 FPS) con hasta 2048 fotogramas.
- Extracción de características (`feature-extraction` como pipeline declarado).
- Umbral de grounding configurable (por defecto 0.25; se puede sobrescribir, por ejemplo a 0.4).
- No se documentan capacidades de tool calling, agentes, multilingüismo ni audio.

## Casos de uso

- Búsqueda de momentos concretos en vídeo: dado un vídeo largo y una descripción textual ("la mujer de verde come pasta"), el modelo devuelve el intervalo temporal exacto en segundos, útil para indexación y navegación de archivos audiovisuales.
- Moderación y anotación automática de contenido: localizar eventos específicos en grandes volúmenes de vídeo para revisión humana posterior, aprovechando la baja latencia del enfoque de puntuación directa.
- Sistemas de preguntas y respuestas sobre vídeo: integrar el modelo en interfaces donde el usuario elige entre opciones predefinidas y el modelo puntúa cada una con softmax.
- Generación de clips destacados: combinar el grounding temporal con un pipeline de corte para extraer automáticamente fragmentos relevantes de retransmisiones o grabaciones.
- Evaluación de modelos de vídeo: usar las probabilidades de grounding como métrica cuantitativa en pipelines de investigación.
- Análisis de vídeo deportivo o de vigilancia: localizar acciones descritas textualmente en secuencias largas con contexto de 8192 tokens y hasta 2048 fotogramas.
- Preetiquetado para datasets de vídeo: generar intervalos candidatos que aceleren la anotación manual en proyectos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye únicamente gráficas comparativas de calidad y latencia (`assets/benchmark-grounding.png` y `assets/benchmark-qa.png`) sin valores textuales extraíbles.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 4.471 millones de parámetros en bfloat16 se requieren aproximadamente 9 GB solo para pesos, más overhead de activaciones y procesamiento de vídeo.
- GPU recomendadas: el ejemplo oficial se probó en una NVIDIA H200.
- GPU de consumo: no confirmado; por tamaño de pesos podría caber en GPUs con 16-24 GB, pero no hay validación publicada.
- Despliegue: transformers (5.14.1) con `trust_remote_code=True`, `flash_attention_2`, `flash-linear-attention`, `flash-attn` y `causal-conv1d`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Software: Python 3.12, PyTorch 2.8, CUDA 12.8.
- Latencia y throughput: no disponibles como cifras; la model card destaca latencia reducida frente a modelos generativos, pero sin valores numéricos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo puntúa candidatos, por lo que no sirve para respuestas abiertas.
- No se documentan idiomas soportados; el comportamiento multilingüe es incierto.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- Dependencias muy específicas (transformers 5.14.1, flash-linear-attention 0.4.2, flash-attn) pueden complicar el despliegue y la reproducibilidad.
- No hay información sobre sesgos, riesgo de alucinación ni robustez en dominios distintos al de entrenamiento.
- El límite de 2048 fotogramas y contexto de 8192 tokens restringe la duración de vídeo procesable en una sola llamada.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías ni se documentan restricciones adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/ZhuYuhan/VideoJev-4B
- Paper: https://arxiv.org/abs/2610.18615
- Página del proyecto: https://mcg-nju.github.io/VideoJev
- Código: https://github.com/MCG-NJU/VideoJev
- Guía de uso: https://huggingface.co/ZhuYuhan/VideoJev-4B/blob/main/USAGE.md
- Dataset de demostración: https://huggingface.co/datasets/ZhuYuhan/VideoJev-Demo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
