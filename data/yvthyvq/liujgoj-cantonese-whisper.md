# Yvthyvq/Liujgoj-Cantonese-whisper

## Resumen

Liujgoj-Cantonese-whisper es un modelo de reconocimiento automático del habla (ASR) desarrollado por Yvthyvq, un creador centrado en el ecosistema de la romanización cantonesa Liujgoj. El modelo se basa en openai/whisper-base y se ha ajustado específicamente para transcribir audio en cantonés directamente a romanización Liujgoj, sin pasar por una representación intermedia en caracteres chinos. Esta característica lo hace especialmente útil para pipelines de IA en cantonés que requieren salida fonética normalizada.

El modelo resuelve un problema concreto: la falta de sistemas ASR que produzcan directamente romanización cantonesa, lo que facilita tareas como la generación de subtítulos fonéticos, el entrenamiento de modelos de texto a voz (TTS) y la construcción de conjuntos de datos para LLM en cantonés. Con aproximadamente 72,6 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware de consumo. Se entrenó con 35.032 pares audio-romanización (18 horas de audio procedente de películas cantonesas) y se publicó bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder Transformer) |
| Parametros totales | 72.593.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en bf16; compatible con cuantizacion estandar de Transformers) |
| Idiomas soportados | Cantonés (yue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI: un encoder-decoder Transformer con atención estándar, diseñado originalmente para ASR multilingüe. En este caso, se ha ajustado el modelo base whisper-base (versión de 74 millones de parámetros, aunque el recuento real de safetensors es 72.593.920) para la tarea específica de transcripción de cantonés a romanización Liujgoj.

El entrenamiento se realizó con el framework Hugging Face Transformers, utilizando 35.032 pares de audio-romanización (18 horas en total) extraídos de películas cantonesas. El audio se normalizó a 16 kHz mono WAV. Los hiperparámetros incluyen: 3 épocas, tamaño de lote 4, tasa de aprendizaje 1e-5, optimizador AdamW y precisión bf16. El entrenamiento duró aproximadamente 23 minutos en una GPU A800 de 80 GB. La pérdida de validación alcanzó su mínimo (0,6251) en la época 3, y el autor observó un aumento posterior en épocas adicionales, lo que sugiere que el ajuste se detuvo en el punto óptimo.

Una innovación destacable es que el modelo no genera caracteres chinos intermedios: la salida es directamente romanización Liujgoj, lo que elimina la necesidad de un paso posterior de conversión y reduce errores acumulados en pipelines de procesamiento de cantonés.

## Capacidades

- Transcripción de audio en cantonés a romanización Liujgoj directamente, sin representación intermedia en caracteres chinos.
- Reconocimiento de voz nativo para cantonés, con salida fonética normalizada.
- Compatible con el ecosistema Liujgoj, incluyendo los modelos Liujgoj-Cantonese-Gemma4-12B y Liujgoj-Cantonese-Qwen para pipelines de IA completos en cantonés.
- Entrada de audio de 16 kHz mono, formato estándar para ASR.
- Integración sencilla con la librería Transformers mediante WhisperProcessor y WhisperForConditionalGeneration.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de transcripción.

## Casos de uso

- Transcripción de contenido audiovisual en cantonés: el modelo puede transcribir automáticamente películas, series o vídeos de YouTube en cantonés, generando subtítulos en romanización Liujgoj. Su salida fonética es útil para estudios lingüísticos o para crear subtítulos para estudiantes de cantonés.
- Generación de datos de entrenamiento para TTS: al producir romanización precisa, el modelo puede alimentar sistemas de texto a voz en cantonés, proporcionando la secuencia fonética necesaria para sintetizar habla.
- Construcción de conjuntos de datos para LLM en cantonés: la salida en Liujgoj permite crear corpus de texto romanizado para entrenar o ajustar modelos de lenguaje en cantonés, como los mencionados Liujgoj-Cantonese-Gemma4-12B.
- Herramientas educativas para aprender cantonés: estudiantes de cantonés pueden usar el modelo para obtener la pronunciación romanizada de cualquier audio, facilitando el estudio de tonos y pronunciación sin depender de caracteres chinos.
- Indexación y búsqueda por voz en cantonés: la transcripción a romanización permite indexar audio en cantonés con un alfabeto latino, facilitando búsquedas fonéticas en archivos de audio o vídeo.
- Preprocesamiento para traducción automática: la romanización Liujgoj puede servir como representación intermedia para sistemas de traducción que trabajen con cantonés, especialmente si el sistema está entrenado con datos romanizados.

## Benchmarks y rendimiento

El autor proporciona datos de una prueba a gran escala sobre el conjunto de datos CanCLID/zoengjyutgaai (subcarpeta mouzaakdung), con los siguientes resultados:

| Metrica | Valor |
|---|---|
| Numero de clips de audio | 4.742 |
| Total de caracteres generados | 469.105 |
| Longitud media por clip | 98,93 caracteres |
| Clips con caracteres chinos | 827 |
| Total de caracteres chinos | 16.941 |
| Numero de espacios | 73.786 |

Estos datos indican que el modelo produce mayoritariamente romanización, aunque en algunos casos (827 clips) genera caracteres chinos, lo que sugiere que la salida no es 100 % consistente. No se han publicado resultados en benchmarks estandarizados como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje general. Tampoco se comparan métricas ASR estándar como WER (Word Error Rate) o CER (Character Error Rate) con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 72,6 millones de parámetros, por lo que en bf16 ocupa aproximadamente 145 MB. Con el procesador y las activaciones, cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluyendo NVIDIA GTX 1060 (6 GB), RTX 3060, RTX 4090, o GPUs de datacenter como A10, A100 o H100. También puede ejecutarse en CPU para inferencia por lotes pequeña, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, es totalmente viable en GPUs de consumo de gama media.
- Opciones de despliegue: al ser un modelo de Transformers, se puede servir con vLLM, Hugging Face TGI, o mediante la API de FriendliAI (endpoint compatible). Para uso local, se puede cargar con la librería Transformers directamente.
- Latencia y throughput: no se han publicado mediciones formales. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por clip de audio en GPU moderna, y un throughput de cientos de clips por minuto en lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yvthyvq/Liujgoj-Cantonese-whisper | 72,6 M | 30 s audio | Romanizacion Liujgoj | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74 M | 30 s audio | Texto multilingue (incluye cantonés con caracteres chinos) | MIT | Hugging Face |
| openai/whisper-small | 244 M | 30 s audio | Texto multilingue | MIT | Hugging Face |

La principal diferencia con los modelos Whisper originales es que Liujgoj-Cantonese-whisper está especializado en cantonés y produce romanización en lugar de caracteres chinos. Whisper-base y whisper-small generan texto en cantonés con caracteres chinos, lo que puede ser menos útil para pipelines fonéticos. En términos de precisión ASR, no hay datos comparativos publicados, pero el modelo base Whisper tiene un WER conocido de aproximadamente 20-30 % en cantonés, mientras que este modelo ajustado podría mejorar en ese idioma específico, aunque no se ha verificado.

## Limitaciones y advertencias

- El modelo solo soporta cantonés; no es utilizable para otros idiomas.
- La salida es romanización Liujgoj, no caracteres chinos. Si se necesita texto en caracteres chinos, es necesario un paso adicional de conversión.
- El entrenamiento se realizó con solo 18 horas de audio procedente de películas, lo que puede limitar la generalización a otros dominios (conversaciones cotidianas, noticias, etc.).
- En la prueba a gran escala, 827 de 4.742 clips (17,4 %) contenían caracteres chinos, lo que indica que la salida no es completamente consistente en romanización.
- No se han publicado métricas estándar de ASR (WER, CER), por lo que el rendimiento real frente a otros modelos no está verificado.
- El modelo es un ajuste de whisper-base, que tiene una ventana de contexto fija de 30 segundos; audios más largos deben segmentarse.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la precisión o idoneidad para producción.
- El proyecto tiene una comunidad muy pequeña (93 descargas, 0 likes), por lo que el soporte y mantenimiento son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yvthyvq/Liujgoj-Cantonese-whisper
- Sitio web de Liujgoj (sistema de romanización): https://liujgoj.net/
- Perfil del autor en Hugging Face: https://d6108366.hf-mirror.com/Yvthyvq
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/Yvthyvq/Liujgoj-Cantonese-whisper
- Conjunto de datos de prueba CanCLID/zoengjyutgaai: https://huggingface.co/datasets/CanCLID/zoengjyutgaai
