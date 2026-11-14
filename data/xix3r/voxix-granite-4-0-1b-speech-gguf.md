# xix3r/voxix-granite-4.0-1b-speech-gguf

## Resumen

Voxix Granite 4.0 1B Speech GGUF es una conversión a formato GGUF del modelo `ibm-granite/granite-4.0-1b-speech` de IBM, publicada por el usuario xix3r. Se trata de un modelo de voz a texto (ASR) multilingüe y de traducción automática de voz (AST) bidireccional, pensado para ejecutarse de forma totalmente offline mediante el runtime `transcribe.cpp`. El modelo base es un audio-LLM que combina un codificador Conformer con atención Shaw de bloque local, un proyector Q-Former de BLIP-2 y el LLM `granite-4.0-1b-base` como decodificador autorregresivo.

La relevancia de esta conversión radica en que empaqueta un modelo de 2.313.228.092 parámetros en cuantizaciones que van desde 1,60 GB (Q4_K_M) hasta 4,63 GB (BF16/F16), lo que permite transcripción multilingüe en hardware de consumo y en CPU. El modelo transcribe inglés, francés, alemán, español, portugués y japonés, y traduce entre inglés y cada uno de esos cinco idiomas en ambos sentidos, siempre pasando por inglés.

La licencia Apache-2.0 heredada del modelo base facilita el uso comercial. El repositorio tiene un tamaño de 1,8 GB y, en el momento de la consulta, registra 27 descargas y 0 likes. La conversión está anclada al commit `bd87ab8` del modelo upstream (fijado el 2026-05-17) y validada contra la referencia de Transformers en el commit `275332d` de `transcribe.cpp`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador Conformer con atención Shaw de bloque local + proyector Q-Former (BLIP-2) + decodificador LLM Granite-4.0-1b-base |
| Parametros totales | 2.313.228.092 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, pt, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un audio-LLM compuesto por tres bloques: un codificador Conformer con atención Shaw de bloque local que procesa audio a 16 kHz mono, un proyector Q-Former inspirado en BLIP-2 que alinea las representaciones acústicas con el espacio del LLM, y el modelo de lenguaje `granite-4.0-1b-base` que actúa como decodificador autorregresivo y es el que genera el texto. La entrada es un WAV de 16 kHz mono y la salida es una transcripción.

Según la model card upstream, el entrenamiento se realizó alineando modalidades sobre `granite-4.0-1b-base` con corpus públicos de ASR y AST, complementados con datasets sintéticos para ASR de japonés, ASR con sesgo por palabras clave y traducción de voz. Respecto a `granite-speech-3.3-2b` y `granite-speech-3.3-8b`, esta versión incorpora soporte multilingüe (seis idiomas), mayor precisión en ASR inglés, inferencia más rápida gracias a un mejor entrenamiento del codificador y a decodificación especulativa, la mitad de parámetros que el modelo de 2B y capacidad de sesgo por lista de palabras clave para mejorar el reconocimiento de nombres y acrónimos. No se dispone del número exacto de tokens de entrenamiento ni de detalles sobre RLHF/DPO en la información proporcionada.

## Capacidades

- Transcripción de voz a texto (ASR) en inglés, francés, alemán, español, portugués y japonés.
- Traducción automática de voz (AST) bidireccional entre inglés y cada uno de los otros cinco idiomas (en ↔ fr, en ↔ de, en ↔ es, en ↔ pt, en ↔ ja), siempre con el inglés como pivote; no hay traducción directa fr↔de ni combinaciones equivalentes.
- Sesgo por lista de palabras clave (keyword list biasing) para mejorar el reconocimiento de nombres propios y acrónimos.
- Funcionamiento totalmente offline sobre audio WAV de 16 kHz mono.
- Capacidad de traducción marcada como `translate: true` en los metadatos de la conversión.
- No soporta streaming (`streaming: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No genera timestamps (`timestamps: none`).

## Casos de uso

- Transcripción offline de reuniones y entrevistas: el modelo procesa audio WAV de 16 kHz mono de forma local, sin enviar datos a servicios en la nube, lo que encaja en entornos con requisitos de privacidad o sin conectividad.
- Subtitulado multilingüe de contenido audiovisual: permite transcribir material en inglés, francés, alemán, español, portugués o japonés y, adicionalmente, traducir entre inglés y esos idiomas para generar pistas de subtítulos bilingües.
- Traducción de voz en atención al cliente internacional: con la traducción bidireccional vía inglés, se pueden gestionar llamadas entre hablantes de español y de japonés pasando por una etapa intermedia en inglés.
- Dictado y notas de voz en aplicaciones de escritorio: al caber en cuantizaciones de 1,60 GB (Q4_K_M) y ejecutarse en CPU, es viable integrarlo en utilidades de escritorio sin GPU dedicada.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: los ratios de tiempo real medidos en CPU (RTF 1,6 en Ryzen 4750U y 5-6 en CPU de MacBook) permiten transcribir lotes de audio en hardware modesto.
- Reconocimiento de entidades y terminología específica: la capacidad de sesgo por lista de palabras clave permite mejorar la transcripción de nombres de producto, acrónimos y jerga técnica en dominios concretos.
- Investigación en ASR multilingüe: sirve como referencia reproducible con WER medido sobre LibriSpeech test-clean y validación numérica contra Transformers, útil para comparar cuantizaciones.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean (2620 utterances, decodificación greedy, normalizador `EnglishTextNormalizer` de Whisper):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,63 GB | 1,42 % |
| F16 | 4,63 GB | 1,42 % |
| Q8_0 | 2,56 GB | 1,44 % |
| Q6_K | 2,02 GB | 1,41 % |
| Q5_K_M | 1,83 GB | 1,42 % |
| Q4_K_M | 1,60 GB | 1,48 % |

El baseline BF16 reproducido localmente (1,42 %) coincide exactamente con el número publicado en Open ASR Leaderboard para el modelo upstream.

Ratios de tiempo real (RTF) medidos con transcribe.cpp:

| Hardware | Backend | RTF |
|---|---|---:|
| MacBook M4 Max | Metal | 36,5 |
| MacBook M4 Max | CPU | 6 |
| MacBook M4 | Metal | 11 |
| MacBook M4 | CPU | 5 |
| Ryzen 4750U | Vulkan | 2,95 |
| Ryzen 4750U | CPU | 1,6 |

No se han publicado en la información disponible resultados de benchmarks del modelo upstream en otros conjuntos (MMLU, HumanEval, GSM8K u otros), por lo que no se incluyen.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q4_K_M ~1,60 GB, Q5_K_M ~1,83 GB, Q6_K ~2,02 GB, Q8_0 ~2,56 GB, BF16/F16 ~4,63 GB (tamaños de archivo; el consumo real añade overhead del runtime y buffers de audio).
- GPU recomendadas: no se especifican modelos concretos en la información disponible; se han validado backends Metal (Apple Silicon M4 y M4 Max) y Vulkan (Ryzen 4750U con GPU integrada).
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos ~2 GB de VRAM libre para cuantizaciones Q4_K_M a Q8_0; las cuantizaciones BF16/F16 requieren ~5 GB.
- Funciona en CPU: sí, con RTF de 1,6 en Ryzen 4750U y de 5-6 en CPU de Apple M4/M4 Max.
- Opciones de despliegue: `transcribe.cpp` (runtime específico, compilado desde fuente con CMake). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: expresados como RTF; un RTF de 36,5 en Metal sobre M4 Max implica procesar audio unas 36,5 veces más rápido que tiempo real; en CPU de Ryzen 4750U el RTF de 1,6 indica procesamiento algo más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|---|
| Voxix Granite 4.0 1B Speech GGUF (este) | 2.313.228.092 | en, fr, de, es, pt, ja | no disponible | Apache-2.0 | GGUF | WER 1,42 % en LibriSpeech test-clean (BF16); traducción vía inglés; sin streaming ni timestamps |
| ibm-granite/granite-4.0-1b-speech | no disponible en la información | en, fr, de, es, pt, ja | no disponible | Apache-2.0 | safetensors (upstream) | Modelo base; mismas capacidades; requiere Transformers |
| ibm-granite/granite-speech-3.3-2b | ~2B (según nomenclatura) | no disponible | no disponible | no disponible | no disponible | Predecesor; el modelo actual tiene la mitad de parámetros y añade multilingüismo |
| ibm-granite/granite-speech-3.3-8b | ~8B (según nomenclatura) | no disponible | no disponible | no disponible | no disponible | Predecesor de mayor tamaño; sin datos de benchmarks en la información disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, salvo la afirmación upstream de que esta versión ofrece mayor precisión en ASR inglés y inferencia más rápida que los modelos 3.3.

## Limitaciones y advertencias

- Solo acepta audio WAV de 16 kHz mono; es necesario convertir otros formatos con ffmpeg antes de la inferencia.
- No soporta streaming: debe procesarse el audio completo, lo que limita su uso en aplicaciones de transcripción en vivo.
- No genera timestamps, por lo que no sirve directamente para subtitulado sincronizado a nivel de palabra o segmento.
- No realiza detección automática de idioma; el idioma debe gestionarse externamente o inferirse por el contexto de uso.
- La traducción solo es posible entre inglés y los otros cinco idiomas, siempre con inglés como pivote; no hay traducción directa entre, por ejemplo, francés y alemán.
- Riesgo de alucinación inherente a los modelos generativos: el decodificador LLM puede producir texto no presente en el audio, especialmente con audio ruidoso o fuera de dominio.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al entrenarse con corpus públicos, puede heredar sesgos de esos datasets.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda consultar la model card upstream como fuente autoritativa de los términos.
- El repositorio tiene muy poca tracción (27 descargas, 0 likes) y fue creado recientemente; conviene validar la conversión en el propio entorno antes de usarla en producción.
- El runtime `transcribe.cpp` debe compilarse desde fuente y no se indica soporte para otros motores de inferencia habituales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-granite-4.0-1b-speech-gguf
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b-speech
- Commit upstream de referencia: https://huggingface.co/ibm-granite/granite-4.0-1b-speech/commit/bd87ab8
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/275332d
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-4.0-1b-speech.md
- Pesos GGUF (espejo handy-computer): https://huggingface.co/handy-computer/granite-4.0-1b-speech-gguf
- Modelo predecesor 2B: https://huggingface.co/ibm-granite/granite-speech-3.3-2b
- Modelo predecesor 8B: https://huggingface.co/ibm-granite/granite-speech-3.3-8b
- LLM base: https://huggingface.co/ibm-granite/granite-4.0-1b-base
- Paper referenciado (arXiv:2505.08699): https://arxiv.org/abs/2505.08699
- Paper referenciado (arXiv:2603.11243): https://arxiv.org/abs/2603.11243
