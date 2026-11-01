# tryambientai/canary-1b-flash-gguf

## Resumen

canary-1b-flash-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) nvidia/canary-1b-flash, publicada por el usuario tryambientai y pensada para su uso con el motor de inferencia transcribe.cpp. El modelo original lo desarrolla NVIDIA dentro de la familia NeMo Canary y es un sistema multitarea de tipo attention encoder-decoder (AED) con 883 millones de parámetros, compuesto por un encoder FastConformer de 32 capas y un decoder Transformer de 4 capas. Esta conversión concreta tiene 890.042.496 parámetros en safetensors y un repositorio de 1,0 GB.

El modelo resuelve dos tareas sobre audio: transcripción (ASR) en inglés, alemán, español y francés, y traducción bidireccional entre inglés y cada uno de esos tres idiomas. Trabaja con audio de entrada en WAV mono a 16 kHz y no es un modelo de streaming; los timestamps a nivel de palabra y segmento son una funcionalidad experimental del modelo original que no se expone en este port v1.

Su relevancia radica en que ofrece un ASR multilingüe de tamaño contenido con una licencia permisiva (CC-BY-4.0), apto para uso comercial, y con cuantizaciones que van desde 677 MB (Q4_K_M) hasta 3,56 GB (F32), lo que permite ejecutarlo en hardware modesto, incluidos equipos de consumo con CPU o GPU integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multitarea (AED): encoder FastConformer de 32 capas + decoder Transformer de 4 capas |
| Parametros totales | 890.042.496 (883 M según el modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés, alemán, español, francés (ASR); traducción EN↔{DE, ES, FR} |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Canary de NVIDIA, un esquema encoder-decoder multitarea. El encoder es un FastConformer de 32 capas, una variante eficiente del Conformer que reduce el coste computacional del procesamiento de secuencias de audio largas, y el decoder es un Transformer de 4 capas que genera la salida de texto. El modelo base declara más de 1000 RTFx en los conjuntos del open-asr-leaderboard, lo que refleja un diseño orientado al rendimiento en inferencia.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del port indica que la conversión se realizó a partir del commit a9a55e0 del modelo original (fijado el 2026-05-08) y se validó contra la referencia de NeMo en el commit db53eda de transcribe.cpp. La decodificación empleada en las mediciones es greedy, sin modelo de lenguaje externo.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, alemán, español y francés.
- Traducción bidireccional entre inglés y alemán, español y francés, con o sin puntuación y capitalización (PnC).
- Procesamiento de audio de entrada en WAV mono a 16 kHz.
- Funcionalidad experimental de timestamps a nivel de palabra y segmento en el modelo original, no expuesta en este port v1.
- No soporta streaming (indicador `streaming: false` en la metadata).
- No incluye detección automática de idioma (`lang_detect: false`).
- No dispone de soporte de tool calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente de voz.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo convierte grabaciones en WAV de 16 kHz a texto en cuatro idiomas, con cuantizaciones Q5_K_M o Q4_K_M que caben en equipos sin GPU dedicada.
- Subtitulado de contenido audiovisual: permite generar transcripciones en inglés, alemán, español y francés y, combinado con la capacidad de traducción EN↔{DE, ES, FR}, producir subtítulos cruzados entre esos idiomas.
- Traducción de audio a texto entre idiomas: útil para transcribir una intervención en alemán y obtener su versión en inglés (o viceversa) sin pipeline separado de ASR y traducción.
- Procesamiento por lotes en servidores modestos: con 677 MB en Q4_K_M, se puede desplegar en instancias CPU o en GPUs de consumo para transcribir grandes volúmenes de audio offline.
- Integración en aplicaciones de escritorio o locales: al usar transcribe.cpp con soporte de Metal y Vulkan (RTF de 111,75 en Metal sobre M4 Max y 15,48 en Vulkan sobre Ryzen 4750U), encaja en herramientas de dictado o notas de voz sin conexión.
- Archivado y búsqueda de contenido hablado: la transcripción multilingüe permite indexar y buscar en archivos de audio históricos en los cuatro idiomas soportados.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en entornos multilingües, con la ventaja de una licencia permisiva para uso comercial.

## Benchmarks y rendimiento

Resultados de WER publicados en la model card del port:

| Benchmark | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| LibriSpeech test-clean (WER %) | 1,62 | 1,62 | 1,62 | 1,65 | 1,64 | 1,59 |
| FLEURS EN (WER %) | — | — | 4,75 | — | — | — |
| FLEURS DE (WER %) | — | — | 6,13 | — | — | — |
| FLEURS ES (WER %) | — | — | 6,73 | — | — | — |
| FLEURS FR (WER %) | — | — | 7,22 | — | — | — |

Métricas de velocidad (RTF, real-time factor):

| Plataforma | CPU | Aceleración |
|---|---:|---|
| Apple M4 Max | 25,43 | Metal: 111,75 |
| AMD Ryzen 4750U | 8,85 | Vulkan: 15,48 |

La cifra de referencia de NVIDIA en su model card original para LibriSpeech test-clean es 1,48 %, frente al 1,62 % medido en esta conversión con decodificación greedy y sin LM externo.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: 677 MB (Q4_K_M), 770 MB (Q5_K_M), 858 MB (Q6_K), 1,05 GB (Q8_0), 1,79 GB (F16) y 3,56 GB (F32).
- Cabe en GPUs de consumo: cualquier GPU con al menos 2 GB de memoria libre puede ejecutar las cuantizaciones Q4_K_M a Q8_0; la F16 requiere unos 2 GB y la F32 unos 4 GB.
- Funciona en CPU: el modelo está validado en CPU (RTF de 8,85 en Ryzen 4750U y 25,43 en M4 Max), por lo que es viable en portátiles sin GPU dedicada.
- Aceleración por GPU integrada: soporte de Metal en Apple Silicon (RTF 111,75 en M4 Max) y Vulkan en AMD (RTF 15,48 en Ryzen 4750U).
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake); no se mencionan otros motores como vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: los RTF indican que el modelo procesa audio varias veces más rápido que tiempo real; en Metal sobre M4 Max supera 100 veces el tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| canary-1b-flash-gguf (este) | 890 M | EN, DE, ES, FR | No disponible | CC-BY-4.0 | GGUF |
| nvidia/canary-1b-flash (base) | 883 M | EN, DE, ES, FR | No disponible | CC-BY-4.0 | NeMo (.nemo) |
| nvidia/canary-1b-v2 | No disponible | 25 idiomas europeos | No disponible | No disponible | No disponible |

La alternativa directa es el modelo base de NVIDIA, con las mismas capacidades y parámetros, pero en formato NeMo y sin las cuantizaciones GGUF que facilitan el despliegue en hardware limitado. La versión v2 de Canary amplía la cobertura a 25 idiomas europeos y mejora la predicción de timestamps, aunque no se dispone de sus especificaciones completas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de streaming: debe procesar el audio completo, lo que lo hace inadecuado para transcripción en tiempo real.
- No incluye detección automática de idioma: el idioma debe especificarse de forma explícita.
- Los timestamps a nivel de palabra y segmento son experimentales en el modelo original y no están expuestos en este port v1.
- Solo admite cuatro idiomas (inglés, alemán, español y francés); no cubre otras lenguas.
- Requiere audio de entrada en WAV mono a 16 kHz; es necesario convertir otros formatos previamente con herramientas como ffmpeg.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes, propio de los sistemas ASR.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado por NVIDIA, puede heredar sesgos de sus datos de entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario conservar la atribución a NVIDIA y al autor de la conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria amplia; conviene verificar la integridad de los pesos antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/tryambientai/canary-1b-flash-gguf
- Modelo base: https://huggingface.co/nvidia/canary-1b-flash
- Commit del modelo base usado: https://huggingface.co/nvidia/canary-1b-flash/commit/a9a55e0
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-1b-flash.md
- Canary 1B V2: https://huggingface.co/nvidia/canary-1b-v2
- Portal de desarrolladores de NVIDIA: https://developer.nvidia.com/
- NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- NVIDIA Riva Speech: https://developer.nvidia.com/riva
- Paper de referencia (arXiv:2104.02821): https://arxiv.org/abs/2104.02821
- Paper de referencia (arXiv:2503.05931): https://arxiv.org/abs/2503.05931
- Paper de referencia (arXiv:1706.03762): https://arxiv.org/abs/1706.03762
- Paper de referencia (arXiv:2409.13523): https://arxiv.org/abs/2409.13523
