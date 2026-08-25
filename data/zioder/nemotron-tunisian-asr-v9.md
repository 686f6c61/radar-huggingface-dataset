# Zioder/nemotron-tunisian-asr-v9

## Resumen

El modelo `nemotron-tunisian-asr-v9` es un sistema de reconocimiento automático del habla (ASR) desarrollado por Zioder, especializado en el árabe tunecino (derja) con alternancia de código (code-switching) hacia francés e inglés. Está basado en la arquitectura `EncDecRNNTBPEModelWithPrompt` de NVIDIA NeMo, un modelo RNNT (Recurrent Neural Network Transducer) de aproximadamente 0,6 mil millones de parámetros, diseñado para funcionar en streaming con baja latencia. La versión V9 se centra en restaurar los portadores de hamza (ء, أ, إ, آ) que estaban ausentes en la versión anterior V7b, mejorando la precisión ortográfica del árabe sin recurrir a post-procesamiento externo.

El modelo se distribuye como un checkpoint de NeMo (formato `.nemo`) y está pensado para transcripción en tiempo real y por lotes. Su relevancia radica en abordar un idioma poco representado en los ASR comerciales, el árabe tunecino, con soporte explícito para la mezcla de lenguas típica de la región. Los resultados publicados son de desarrollo, no de un conjunto de prueba independiente, y muestran una mejora significativa en la métrica de F1 para hamza respecto a la versión anterior, aunque persisten limitaciones en cuanto a eliminaciones de palabras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EncDecRNNTBPEModelWithPrompt (RNNT con prompt-conditioning y cache-aware streaming) |
| Parametros totales | Aproximadamente 0,6 mil millones |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de streaming de audio, no aplica contexto de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Arabe tunecino (derja), frances, ingles (con code-switching) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | NeMo (.nemo) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura RNNT (Transductor Neuronal Recurrente) con una novedad clave: el condicionamiento por prompt (`prompt-conditioned`). Esto significa que la decodificación puede guiarse mediante metadatos de idioma proporcionados en el manifiesto de entrada, lo que permite manejar la alternancia de código entre árabe, francés e inglés de forma más precisa. Además, incorpora un mecanismo de caché consciente del streaming (`cache-aware`), optimizado para reducir la latencia en decodificación en tiempo real.

El entrenamiento se realizó sobre datos propios del autor, incluyendo los datasets `nemotron-tunisian-asr-data`, `nemotron-tunisian-podcast-cache` y `nemotron-tunisian-podcast-cache-v2`. La versión V9 aplica una política de calibración específica para los portadores de hamza: se eliminan las etiquetas de relleno que contenían formas como `آ` o `آنا` (que el modelo anterior interpretaba como marcadores de hesitación), se estandarizan variantes frecuentes como `آنا -> أنا`, y se conservan las palabras léxicas con madda como `آخر`, `آلاف` y `آية`. El entrenamiento final usó 1.500 pasos de recuperación efectivos: 1.000 sobre la versión V9a y 500 sobre un manifiesto calibrado. Se probaron y rechazaron estrategias como descongelar parcialmente el codificador o combinar pesos por ensamblado, porque no mejoraban el frente de métricas completo.

## Capacidades

- Transcripción de voz en árabe tunecino (derja) con alternancia de código hacia francés e inglés.
- Decodificación en streaming con baja latencia, adecuada para flujos de audio continuos.
- Restauración de portadores de hamza (أ, إ, آ, ؤ, ئ) en la salida escrita, sin post-procesamiento externo.
- Soporte de decodificación por haz (beam search) con tamaño de haz configurable (probado con beam size 2).
- Condicionamiento por prompt: permite especificar el idioma esperado mediante metadatos en el manifiesto de entrada.
- Salida de texto sin puntuación ni capitalización automática (a diferencia de otros modelos Nemotron ASR de NVIDIA, que sí la incluyen).

## Casos de uso

- Transcripción de podcasts y programas de radio en árabe tunecino: el modelo puede procesar audio largo en streaming, manteniendo la fidelidad de la derja y las palabras en francés o inglés que se intercalan naturalmente.
- Subtitulado automático de vídeos para plataformas locales: su capacidad de code-switching permite generar subtítulos precisos en contenidos donde se mezclan idiomas, como entrevistas o debates.
- Atención al cliente automatizada en empresas tunecinas: integrado en un sistema de IVR o chatbot, puede transcribir llamadas de clientes que hablan derja con préstamos del francés, mejorando el análisis de sentimiento y la derivación de incidencias.
- Asistente de voz para aplicaciones móviles en Túnez: al ser un modelo de streaming, puede usarse en tiempo real para comandos de voz en árabe tunecino, con latencia ajustable según el caso.
- Investigación lingüística y sociolingüística: permite transcribir corpus orales de la región para estudiar la alternancia de código y la variación dialectal, con una métrica específica de precisión de hamza que facilita el análisis ortográfico.
- Archivado y digitalización de material audiovisual histórico: el modelo puede transcribir grabaciones de archivo en derja, aunque se recomienda validar los resultados en audio de baja calidad o con ruido.

## Benchmarks y rendimiento

Los resultados publicados corresponden a un conjunto de desarrollo fijo de 232 utterances con code-switching, comparando la versión V7b con la V9. No se han publicado resultados en conjuntos de prueba independientes más amplios (el conjunto de prueba congelado de 3.074 utterances mencionado en la tarjeta de V7b no se ha actualizado para V9).

| Sistema | Surface WER | Content WER | Precision hamza | Recall hamza | F1 hamza | Tasa de falsos portadores |
|---|---:|---:|---:|---:|---:|---:|
| V7b greedy | 35,95% | 29,75% | 53,33% | 3,88% | 7,24% | 1,54% |
| V9a +1000 greedy | 32,28% | 30,09% | 64,96% | 43,20% | 51,90% | 6,15% |
| V9b +500 greedy | 31,46% | 30,02% | 70,86% | 51,94% | 59,94% | 6,15% |
| **V9b +500 beam-2** | **31,05%** | **29,68%** | **72,26%** | **54,37%** | **62,05%** | **6,15%** |

Frente a V7b, el checkpoint promovido V9 mejora el WER de superficie en 4,90 puntos absolutos y el F1 de hamza en 54,81 puntos. El intervalo de confianza al 95% (bootstrap pareado) para la mejora de V9a a V9b en WER de superficie es de -1,35 a -0,30 puntos. Sin embargo, el número de eliminaciones (deletions) es mayor que en V7b bajo beam-2 (237 frente a 194), aunque la reducción de sustituciones produce un WER total menor.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Dado el tamaño de aproximadamente 0,6 mil millones de parámetros y el formato NeMo, se estima que la inferencia puede ejecutarse en GPUs de consumo con al menos 8 GB de VRAM, aunque no hay datos confirmados.
- Para streaming en tiempo real, se recomienda una GPU con soporte CUDA y suficiente memoria para el modelo y el decodificador.
- El modelo se carga mediante la librería NeMo de NVIDIA; se ha probado con el commit `c9040511b` y Numba 0.61.2.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo sino un ASR específico de NeMo.
- La latencia y el throughput no están documentados; el autor indica que para decodificación en tiempo real se use `greedy_batch` con `max_symbols_per_step=5`.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos ASR en la información proporcionada. El modelo es específico para árabe tunecino, un dominio con pocas alternativas comerciales o de código abierto. Modelos multilingües como Whisper de OpenAI podrían ser comparables en tareas generales, pero no se han publicado resultados comparativos con este modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Los resultados reportados son de un conjunto de desarrollo pequeño (232 utterances) y no de un conjunto de prueba independiente; el rendimiento en producción puede variar.
- La licencia es "other" y no se detalla; antes de un uso comercial es necesario contactar con el autor o verificar los términos exactos.
- El modelo está especializado en árabe tunecino con code-switching; su rendimiento en otros dialectos árabes o en árabe moderno estándar no está garantizado.
- Se observa un mayor número de eliminaciones (palabras omitidas) en comparación con la versión anterior, lo que puede afectar a la integridad de la transcripción en contextos donde la precisión léxica sea crítica.
- La tasa de falsos portadores de hamza es del 6,15%, y algunos de ellos se deben a inconsistencias en las referencias (por ejemplo, `أنا/انا`), no a errores reales del modelo.
- No se proporcionan datos sobre sesgos, pero al ser un modelo entrenado con datos de podcasts y fuentes específicas, puede tener un sesgo hacia registros coloquiales o voces particulares.
- El modelo no genera puntuación ni capitalización, lo que puede requerir post-procesamiento adicional para ciertos casos de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zioder/nemotron-tunisian-asr-v9
- Dataset de entrenamiento: https://huggingface.co/datasets/Zioder/nemotron-tunisian-asr-data
- Dataset de podcasts (caché): https://huggingface.co/datasets/Zioder/nemotron-tunisian-podcast-cache
- Dataset de podcasts V2: https://huggingface.co/datasets/Zioder/nemotron-tunisian-podcast-cache-v2
- Repositorio de NVIDIA NeMo (referencia de la clase): https://github.com/NVIDIA-NeMo/Nemotron
- Página de NVIDIA sobre modelos Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Implementación alternativa en GGML (nemotron-asr.cpp): https://github.com/m1el/nemotron-asr.cpp/
