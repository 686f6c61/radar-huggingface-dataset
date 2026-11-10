# vladkens/gigaam-multilingual-large-ctc-gguf

## Resumen

GigaAM-Multilingual large-ctc en formato GGUF es una conversión cuantizada del modelo de reconocimiento automático del habla (ASR) `large_ctc` de la familia GigaAM-Multilingual, desarrollada por el equipo GigaAM de Sber (salute-developers). El modelo original es un Conformer de aproximadamente 585 millones de parámetros con una cabeza CTC a nivel de carácter, entrenado para transcribir audio en ruso, inglés, kazajo, kirguís y uzbeko. Esta versión GGUF la publica el desarrollador independiente vladkens para su uso con las herramientas `wavo` y `transcribe.cpp`.

El problema que resuelve es la transcripción multilingüe de audio en cinco idiomas, con especial énfasis en ruso y lenguas túrquicas de Asia Central, un nicho con menos cobertura que el inglés en los modelos ASR comerciales. Al estar empaquetado en GGUF Q8_0 (712 MB), el modelo puede ejecutarse en CPU o GPU de consumo sin necesidad de un stack de PyTorch, lo que facilita el despliegue local y en entornos con recursos limitados.

Es relevante ahora porque democratiza el acceso a un ASR de Sber de tamaño medio con licencia MIT, formato portable y soporte para herramientas de inferencia ligeras. La conversión preserva el comportamiento del modelo original: salida en minúsculas, sin puntuación y con los números escritos como palabras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con cabeza CTC a nivel de carácter (variante `large_ctc`) |
| Parametros totales | 585.330.119 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrenado con fragmentos de audio de hasta 25 s |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | ru, en, kk, ky, uz |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo `gigaam-multilingual-large-ctc-Q8_0.gguf`, 712 MB) |

## Arquitectura y entrenamiento

El modelo base es un Conformer, es decir, una arquitectura híbrida que combina bloques convolucionales con mecanismos de autoatención, habitual en ASR por su capacidad de capturar dependencias locales y globales en la señal de audio. La variante `large_ctc` emplea una cabeza CTC (Connectionist Temporal Classification) a nivel de carácter, lo que permite alineamientos sin necesidad de un modelo de lenguaje externo y produce transcripciones directas en minúsculas, sin puntuación y con los números verbalizados.

Los detalles concretos de entrenamiento (número de horas de audio, composición del dataset, uso de aumentación o ajuste fino) no están disponibles en la información proporcionada; la model card remite al paper `arxiv:2607.10371` y a la model card original de `ai-sage/GigaAM-Multilingual` para esos datos. Esta versión GGUF se generó a partir del snapshot `large_ctc` del repositorio original (commit 3905cd5) mediante el script `convert-gigaam.py` del PR #251 de transcribe.cpp y se cuantizó con `transcribe-quantize --quant Q8_0`. No se modificó el conversor respecto al original.

## Capacidades

- Reconocimiento automático del habla (ASR) en ruso, inglés, kazajo, kirguís y uzbeko.
- Transcripción con marcas de tiempo por token, según indica la model card (`wavo` proporciona los mismos tiempos de token que transcribe.cpp).
- Salida en minúsculas, sin puntuación, con números escritos como palabras.
- Procesamiento de audio de hasta 25 s por fragmento; para audio más largo es necesario cortar en pausas (la herramienta `wavo run` lo hace automáticamente).
- Acepta cualquier formato y frecuencia de muestreo a través de `wavo`; con `transcribe.cpp` requiere WAV mono a 16 kHz.
- No dispone de tool calling, capacidades de agente, visión, audio generativo ni modo de razonamiento; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en ruso: el modelo convierte audio de hasta 25 s por segmento en texto plano, y con `wavo` se pueden encadenar segmentos cortados en pausas para actas o resúmenes posteriores.
- Subtitulado automático de vídeo en inglés y ruso: la salida con tiempos por token permite generar subtítulos sincronizados sin depender de servicios en la nube.
- Atención al cliente en kazajo, kirguís y uzbeko: permite transcribir llamadas o mensajes de voz en lenguas túrquicas de Asia Central, un nicho con poca cobertura en ASR comerciales.
- Indexación y búsqueda de archivos de audio: al ejecutarse en CPU con un GGUF de 712 MB, se puede procesar un archivo histórico de grabaciones en local y volcar el texto a un motor de búsqueda.
- Investigación lingüística y corpus: útil para generar transcripciones de corpus orales en ruso y lenguas de Asia Central con licencia MIT, sin restricciones de uso comercial.
- Despliegue en dispositivos sin GPU: al ser un GGUF Q8_0 de menos de 1 GB, cabe en portátiles y servidores modestos mediante `transcribe.cpp`, sin necesidad de PyTorch ni CUDA.
- Preprocesamiento en pipelines de datos: transcripción por lotes de audio para alimentar sistemas de análisis de sentimiento o clasificación de llamadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper `arxiv:2607.10371` y a la model card original de `ai-sage/GigaAM-Multilingual` para datos de precisión, pero no incluye cifras de WER ni comparativas en esta ficha.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 ocupa 712 MB; en inferencia se puede ejecutar en CPU sin GPU, o en GPU con menos de 1 GB de VRAM adicional para buffers.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU de consumo (GTX 1060, RTX 3060, RTX 4090) es suficiente, e incluso CPU de portátil.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño reducido del archivo.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli -m ... audio.wav`) y `wavo` (`wavo pull gigaam-multilingual` y `wavo run gigaam-multilingual audio.m4a`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato ASR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto audio | Licencia | Formato |
|---|---|---|---|---|---|
| GigaAM-Multilingual large-ctc (este) | 585 M | ru, en, kk, ky, uz | fragmentos de hasta 25 s | MIT | GGUF Q8_0 |
| Whisper large-v3 (OpenAI) | no disponible en la información | multilingüe amplio | 30 s | MIT | safetensors, GGUF, etc. |
| Whisper small (OpenAI) | no disponible en la información | multilingüe amplio | 30 s | MIT | safetensors, GGUF, etc. |

No se dispone de datos de rendimiento comparativo (WER) en la información proporcionada para establecer una comparación cuantitativa con Whisper u otros ASR. La comparativa anterior es estructural y de licencia, no de precisión.

## Limitaciones y advertencias

- Salida sin puntuación ni mayúsculas, y con números escritos como palabras; requiere postprocesado si se necesita texto formateado.
- Entrenado con fragmentos de hasta 25 s: audio más largo debe cortarse en pausas, lo que puede degradar la coherencia en transcripciones de discursos continuos.
- Solo cubre cinco idiomas (ru, en, kk, ky, uz); no es un modelo multilingüe general.
- Riesgo de alucinación y errores en audio con ruido, acentos no vistos o solapamiento de hablantes; no se han publicado métricas de WER en esta ficha para acotar el riesgo.
- Sesgos: no se documentan en la información disponible; al ser un modelo entrenado por Sber, puede reflejar sesgos de los corpus rusófonos utilizados.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright del archivo `LICENSE` y citar al equipo GigaAM de Sber.
- Esta es una conversión no oficial de un tercero (vladkens); para producción crítica conviene validar contra el modelo original en PyTorch.
- No soporta tool calling, agentes ni otras capacidades más allá de ASR.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/vladkens/gigaam-multilingual-large-ctc-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-Multilingual
- Repositorio GigaAM de Sber: https://github.com/salute-developers/GigaAM
- Paper: https://arxiv.org/abs/2607.10371
- wavo: https://github.com/vladkens/wavo
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- PR de conversión (transcribe.cpp #251): https://github.com/handy-computer/transcribe.cpp/pull/251
