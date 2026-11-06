# tryambientai/granite-speech-4.1-2b-gguf

## Resumen

Granite Speech 4.1 2B es un modelo de voz a texto (ASR) y traducción automática de voz (AST) desarrollado por IBM, distribuido originalmente en formato nativo y aquí convertido a GGUF por el usuario `tryambientai` para su uso con el runtime `transcribe.cpp`. Se trata de un audio-LLM que combina un codificador convolucional Conformer con atención Shaw de bloques locales, un proyector Q-Former de tipo BLIP-2 y un decodificador autorregresivo basado en `granite-4.0-1b-base`. El modelo acepta audio WAV mono a 16 kHz y produce transcripciones o traducciones al inglés y desde el inglés.

La relevancia de esta conversión reside en que permite ejecutar un modelo de reconocimiento de voz multilingüe de 2.313 millones de parámetros en hardware de consumo mediante cuantización GGUF, con una degradación mínima de la tasa de error de palabra (WER). Según la model card, la cuantización Q4_K_M ocupa 1,60 GB y mantiene un WER del 1,37 % en LibriSpeech test-clean, frente al 1,31 % del BF16 de referencia. Esto lo sitúa como una opción práctica para transcripción offline en portátiles y equipos sin GPU dedicada de gama alta.

El modelo cubre seis idiomas (inglés, francés, alemán, español, portugués y japonés) tanto en transcripción como en traducción bidireccional con el inglés, e incorpora mejoras sobre su predecesor en puntuación, uso de mayúsculas (incluida la capitalización de sustantivos en alemán) y sesgo por listas de palabras clave. La licencia Apache-2.0 facilita su integración en productos comerciales sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: encoder Conformer con block-local Shaw attention + proyector BLIP-2 Q-Former + decoder autorregresivo Granite-4.0-1b-base |
| Parametros totales | 2.313.228.092 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, pt, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de los audio-LLM modulares: un encoder Conformer procesa la señal de audio y emplea atención Shaw de bloques locales, un proyector Q-Former inspirado en BLIP-2 alinea las representaciones acústicas con el espacio del modelo de lenguaje, y un decoder autorregresivo derivado de `granite-4.0-1b-base` genera el texto. El modelo base fue entrenado mediante alineamiento de modalidad: se parte de un checkpoint intermedio de `granite-4.0-1b-base` y se alinea con audio usando corpus públicos con pares audio-texto.

Según la model card upstream, el entrenamiento utilizó 174.000 horas de audio de corpus públicos para ASR y AST, complementadas con datasets sintéticos orientados a ASR en japonés, ASR con sesgo por palabras clave y traducción de voz. Respecto a `granite-4.0-1b-speech`, incorpora un encoder CTC de doble cabeza con salidas grafémicas y BPE, junto con muestreo de importancia por frame para concentrarse en las partes informativas del audio. También añade puntuación y truecasing en todos los idiomas mediante un cambio simple de prompt, y mejora el sesgo por listas de palabras clave para nombres, acrónimos y jerga técnica.

La conversión a GGUF fue realizada por `tryambientai` a partir del commit `8f4bb5f` del modelo upstream (fijado el 2026-05-17) y validada contra la referencia de Transformers en el commit `275332d` de `transcribe.cpp`. El repositorio ocupa 2,6 GB.

## Capacidades

- Transcripción de voz a texto (ASR) en inglés, francés, alemán, español, portugués y japonés.
- Traducción automática de voz (AST) bidireccional entre inglés y cada uno de los otros cinco idiomas (en ↔ fr, en ↔ de, en ↔ es, en ↔ pt, en ↔ ja), siempre pasando por inglés; no se soportan pares directos como fr ↔ de.
- Puntuación y uso de mayúsculas automáticos en todos los idiomas soportados, incluida la capitalización de sustantivos en alemán.
- Sesgo por listas de palabras clave (keyword biasing) para mejorar el reconocimiento de nombres propios, acrónimos y terminología técnica.
- Entrada de audio WAV mono a 16 kHz; requiere conversión previa con ffmpeg para otros formatos o frecuencias.
- No soporta streaming (`streaming: false`).
- No realiza detección de idioma (`lang_detect: false`).
- No genera marcas de tiempo (`timestamps: none`).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Transcripción offline de reuniones y entrevistas: el modelo procesa archivos WAV de 16 kHz en local sin conexión, con un WER del 1,37 % en Q4_K_M sobre LibriSpeech test-clean, adecuado para actas y notas que luego se revisan manualmente.
- Subtitulado multilingüe de contenido audiovisual: permite transcribir audio en español, francés, alemán, portugués o japonés y traducirlo al inglés (o viceversa) en un solo paso, útil para catálogos de vídeo con audiencias internacionales.
- Dictado y accesibilidad en aplicaciones de escritorio: al ocupar 1,60 GB en Q4_K_M, puede integrarse en herramientas de dictado que corren en portátiles sin GPU dedicada, con velocidades de 4× tiempo real en CPU y 12× en Metal sobre un M4.
- Documentación clínica o legal con vocabulario especializado: la función de sesgo por listas de palabras clave permite inyectar nombres de fármacos, términos jurídicos o acrónimos para reducir errores en dominios técnicos.
- Procesamiento por lotes de archivos de audio en servidores: con un RTF de 2,8 en Vulkan sobre una Ryzen 4750U, el modelo puede transcribir grandes volúmenes de grabaciones en hardware modesto, sin necesidad de GPUs de datacenter.
- Traducción de voz para atención al cliente: la traducción bidireccional vía inglés permite atender llamadas o mensajes de voz en los seis idiomas soportados y devolver la respuesta en inglés, o transcribir y traducir para agentes humanos.
- Investigación en ASR multilingüe: al ser una conversión GGUF validada numéricamente contra la referencia de Transformers, sirve como base reproducible para experimentos de cuantización y evaluación de WER en distintos backends (Metal, Vulkan, CPU).

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2620 enunciados, decodificación greedy, normalizador `EnglishTextNormalizer` de Whisper):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,63 GB | 1,31 % |
| F16 | 4,63 GB | 1,32 % |
| Q8_0 | 2,56 GB | 1,32 % |
| Q6_K | 2,02 GB | 1,29 % |
| Q5_K_M | 1,83 GB | 1,33 % |
| Q4_K_M | 1,60 GB | 1,37 % |

El baseline BF16 re-ejecutado localmente con el prompt exacto de la model card da 1,31 %, 0,02 puntos porcentuales por debajo del 1,33 % publicado por el autor upstream, diferencia atribuida a una normalización distinta y dentro del intervalo de confianza bootstrap.

Rendimiento en tiempo real (RTF, factor de tiempo real):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 33 |
| Apple M4 Max | CPU | 5,8 |
| Apple M4 | Metal | 12 |
| Apple M4 | CPU | 4 |
| AMD Ryzen 4750U | Vulkan | 2,8 |
| AMD Ryzen 4750U | CPU | 1,4 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras tareas de lenguaje, ya que el modelo está orientado exclusivamente a ASR y AST.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,6 GB en Q4_K_M, 1,83 GB en Q5_K_M, 2,02 GB en Q6_K, 2,56 GB en Q8_0 y 4,63 GB en BF16/F16.
- Cabe en GPUs de consumo con holgura: cualquier GPU con 4 GB o más de VRAM puede ejecutar las cuantizaciones Q4_K_M a Q8_0; las versiones BF16/F16 requieren unos 5 GB.
- GPUs recomendadas: no se especifican modelos concretos en la información disponible; los datos de rendimiento se han medido en Apple M4, Apple M4 Max (Metal) y AMD Ryzen 4750U (Vulkan y CPU). Para GPUs NVIDIA o AMD dedicadas no hay cifras publicadas.
- Despliegue: exclusivamente mediante `transcribe.cpp` (compilación con CMake y ejecución con `transcribe-cli`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 33 en Metal sobre M4 Max, 12 en Metal sobre M4, 5,8 en CPU sobre M4 Max, 4 en CPU sobre M4, 2,8 en Vulkan sobre Ryzen 4750U y 1,4 en CPU sobre Ryzen 4750U. Un RTF superior a 1 indica procesamiento más rápido que el tiempo real.
- El audio de entrada debe convertirse previamente a WAV mono a 16 kHz con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| granite-speech-4.1-2b (esta conversion GGUF) | 2,31 B | en, fr, de, es, pt, ja | GGUF (transcribe.cpp) | Apache-2.0 | WER 1,37 % en Q4_K_M sobre LibriSpeech test-clean; RTF 12 en Metal sobre M4 |
| ibm-granite/granite-speech-4.1-2b (upstream) | 2,31 B | en, fr, de, es, pt, ja | Safetensors (Transformers) | Apache-2.0 | Referencia BF16 con WER 1,33 % publicado; requiere Transformers y mayor huella de memoria |
| ibm-granite/granite-4.0-1b-speech (predecesor) | no disponible | no disponible | Safetensors | Apache-2.0 | Mismo recuento de parámetros según la model card; sin puntuación ni truecasing, sin encoder CTC de doble cabeza ni sesgo mejorado por palabras clave |

No se dispone de datos de benchmarks ni especificaciones de otros modelos ASR comparables (por ejemplo, Whisper) en la información proporcionada, por lo que la comparación se limita a las variantes del propio modelo Granite Speech.

## Limitaciones y advertencias

- No soporta streaming: debe procesarse el archivo de audio completo, lo que impide su uso en transcripción en vivo.
- No realiza detección automática de idioma: el idioma debe especificarse o inferirse externamente.
- No genera marcas de tiempo por segmento, lo que limita su uso en subtitulado con sincronización fina.
- La traducción solo funciona a través del inglés; no hay pares directos entre los idiomas no ingleses (por ejemplo, fr ↔ de no está soportado).
- Entrada restringida a WAV mono a 16 kHz; es necesario preprocesar otros formatos con ffmpeg.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; el WER de 1,37 % corresponde a LibriSpeech test-clean, un corpus de lectura limpia, y no es representativo de condiciones reales.
- Sesgos conocidos: no se documentan en la información disponible; al entrenarse con corpus públicos y sintéticos, puede heredar sesgos de esos datos.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones adicionales, pero se recomienda consultar la model card upstream para los términos completos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la conversión está validada contra un commit concreto de `transcribe.cpp`; cambios en el runtime pueden afectar a la compatibilidad.
- El soporte de hardware se limita a los backends de `transcribe.cpp` (Metal, Vulkan, CPU); no hay integración documentada con ecosistemas como llama.cpp u Ollama.

## Enlaces

- Repositorio Hugging Face de la conversión GGUF: https://huggingface.co/tryambientai/granite-speech-4.1-2b-gguf
- Modelo base upstream: https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Commit upstream de referencia: https://huggingface.co/ibm-granite/granite-speech-4.1-2b/commit/8f4bb5f
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/275332d
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-4.1-2b.md
- Modelo predecesor: https://huggingface.co/ibm-granite/granite-4.0-1b-speech
- Modelo de lenguaje base: https://huggingface.co/ibm-granite/granite-4.0-1b-base
- Referencias arXiv citadas en los tags: arxiv:2310.02943, arxiv:2505.08699, arxiv:2603.11243, arxiv:2604.12398, arxiv:2604.22817, arxiv:2604.11269, arxiv:2603.08397
