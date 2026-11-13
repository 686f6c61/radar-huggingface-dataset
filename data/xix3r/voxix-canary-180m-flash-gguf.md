# xix3r/voxix-canary-180m-flash-gguf

## Resumen

voxix-canary-180m-flash-gguf es una conversión a formato GGUF del modelo nvidia/canary-180m-flash, un sistema de reconocimiento automático del habla (ASR) y traducción de voz desarrollado por NVIDIA. La conversión la mantiene el usuario xix3r y está pensada para su uso con transcribe.cpp, un runtime de inferencia de audio centrado en CPU, Metal y Vulkan. El modelo resuelve el problema de transcribir y traducir audio multilingüe de forma totalmente offline, sin depender de servicios en la nube y con un coste computacional muy bajo.

Arquitectónicamente es un modelo encoder-decoder de tipo multitask AED: un encoder FastConformer de 17 capas y un decoder Transformer de 4 capas, con 189.083.776 parámetros totales. Soporta reconocimiento en inglés, alemán, español y francés, además de traducción bidireccional entre inglés y cada uno de los otros tres idiomas. No es un modelo de streaming y no expone marcas de tiempo en este port (la funcionalidad de timestamps es experimental en el modelo original).

Su relevancia actual radica en la combinación de tamaño reducido (139-218 MB en cuantizaciones Q4_K_M a Q8_0), licencia permisiva CC-BY-4.0 apta para uso comercial y un rendimiento en WER que se mantiene prácticamente idéntico al del modelo en precisión completa tras la cuantización. Es una opción realista para integrar transcripción multilingüe en aplicaciones de escritorio, dispositivos con recursos limitados o pipelines que requieren privacidad de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multitask AED: FastConformer (17 capas) + Transformer decoder (4 capas) |
| Parametros totales | 189.083.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, de, es, fr |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Canary, basada en un encoder FastConformer de 17 capas que extrae características acústicas y un decoder Transformer de 4 capas que genera texto condicionado por tokens de tarea: idioma objetivo, tarea (transcripción o traducción), activación de puntuación y mayúsculas (PnC) y activación de marcas de tiempo. El tokenizador es una concatenación de tokenizadores SentencePiece individuales por idioma, lo que facilita la extensión a nuevos idiomas. La entrada es audio WAV mono a 16 kHz.

No se dispone en la información proporcionada de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo original reporta más de 1200 RTFx en los conjuntos de open-asr-leaderboard. La conversión a GGUF se realizó desde el commit b12ab41 de nvidia/canary-180m-flash y se validó contra la implementación de referencia NeMo en el commit db53eda de transcribe.cpp, con una diferencia de una sustitución sobre aproximadamente 27.000 palabras de referencia, lo que sitúa el port en el ruido de medida del framework original.

## Capacidades

- Reconocimiento automático del habla (ASR) offline en inglés, alemán, español y francés.
- Traducción de voz bidireccional: inglés a alemán, español y francés, y de estos tres idiomas a inglés.
- Generación de transcripciones con o sin puntuación y mayúsculas (PnC) mediante tokens de control.
- Marcas de tiempo a nivel de palabra y segmento: funcionalidad experimental en el modelo original, no expuesta en este port v1.
- Detección de idioma: no soportada (lang_detect: false).
- Streaming: no soportado (streaming: false).
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles (modelo puramente de voz a texto).
- Capacidades de visión o audio más allá de ASR y traducción: no disponibles.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio WAV de 16 kHz mono y genera transcripciones con puntuación y mayúsculas, adecuado para generar actas automáticas en entornos corporativos donde los datos no pueden salir de la infraestructura propia.
- Subtitulado multilingüe de vídeo: combinado con ffmpeg para extraer y remuestrear la pista de audio, permite generar subtítulos en inglés, alemán, español o francés y traducirlos al inglés (o viceversa) en un pipeline por lotes.
- Traducción de contenido audiovisual: la capacidad de traducción EN↔{DE, ES, FR} permite convertir entrevistas o ponencias en otro idioma sin pasar por un sistema de traducción de texto separado.
- Aplicaciones de escritorio y herramientas de accesibilidad: con cuantizaciones de 139-218 MB y soporte de CPU, Metal y Vulkan, puede integrarse en aplicaciones nativas de macOS, Windows o Linux para dictado o subtitulado en tiempo casi real sin GPU dedicada.
- Procesamiento por lotes en servidores sin GPU: el rendimiento en CPU (21,73 RTFx en Ryzen 4750U) permite transcribir grandes volúmenes de audio en hardware convencional, útil para digitalización de archivos de audio o compliance.
- Asistentes de voz en dispositivos con recursos limitados: el tamaño reducido y la licencia CC-BY-4.0 permiten embarcar el modelo en productos comerciales de bajo coste, como grabadoras inteligentes o terminales de atención al cliente.
- Investigación en ASR multilingüe: al ser una conversión fiel y reproducible desde NeMo, sirve como referencia para comparar implementaciones de inferencia o estudiar el efecto de la cuantización en el WER.

## Benchmarks y rendimiento

| Benchmark | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,94 | 1,94 | 1,93 | 1,93 | 1,90 | 1,93 |
| WER FLEURS en (%) | no disponible | no disponible | 5,98 | no disponible | no disponible | no disponible |
| WER FLEURS de (%) | no disponible | no disponible | 7,33 | no disponible | no disponible | no disponible |
| WER FLEURS es (%) | no disponible | no disponible | 6,54 | no disponible | no disponible | no disponible |
| WER FLEURS fr (%) | no disponible | no disponible | 8,53 | no disponible | no disponible | no disponible |

Rendimiento (RTFx, factor de tiempo real):

| Plataforma | Backend | RTFx |
|---|---|---:|
| Apple M4 Max | CPU | 78,91 |
| Apple M4 Max | Metal | 153,46 |
| AMD Ryzen 4750U | CPU | 21,73 |
| AMD Ryzen 4750U | Vulkan | 33,09 |

Datos de referencia: NVIDIA reporta 1,87 % de WER en LibriSpeech test-clean para el modelo original; la ejecución de referencia de NeMo sobre los mismos audios produce 1,93 %. Las mediciones de LibriSpeech se realizaron sobre el split completo test-clean (2.620 enunciados), batch size 1, sin marcas de tiempo y con decodificación greedy sin modelo de lenguaje externo.

## Requisitos de hardware

- VRAM estimada: el modelo completo en F32 ocupa 756 MB; en Q8_0, 218 MB; en Q4_K_M, 139 MB. La inferencia puede ejecutarse íntegramente en CPU, por lo que la VRAM no es un requisito obligatorio.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) aporta aceleración; en el M4 Max se alcanzan 153,46 RTFx con Metal frente a 78,91 en CPU.
- Cabe en cualquier GPU de consumo: las cuantizaciones Q4_K_M a Q8_0 ocupan menos de 250 MB, por lo que funcionan en iGPU y GPU de gama baja sin problema.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este runtime de audio.
- Latencia y throughput: en CPU de portátil (Ryzen 4750U) se obtienen 21,73 RTFx; con Vulkan en el mismo equipo, 33,09 RTFx. En Apple M4 Max, 78,91 RTFx en CPU y 153,46 con Metal. Esto implica que un minuto de audio se transcribe en menos de tres segundos incluso en CPU modesta.
- Requisito de entrada: audio WAV mono a 16 kHz; para otros formatos hay que convertir previamente con ffmpeg (`-ar 16000 -ac 1`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| voxix-canary-180m-flash-gguf | 189 M | en, de, es, fr | no disponible | CC-BY-4.0 | GGUF | ASR + traducción, offline, CPU/Metal/Vulkan |
| nvidia/canary-180m-flash | 182 M | en, de, es, fr | no disponible | CC-BY-4.0 | safetensors (NeMo) | Modelo original, requiere NeMo |
| Whisper small (referencia) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible | Alternativa ASR multilingüe habitual; sin datos comparativos en la informacion proporcionada |
| Whisper base (referencia) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible | Alternativa ASR multilingüe habitual; sin datos comparativos en la informacion proporcionada |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos ASR, por lo que la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere el audio completo (o segmentos) como entrada, lo que limita su uso en transcripción en vivo sin troceado manual.
- No expone marcas de tiempo en este port v1, aunque el modelo original las soporta de forma experimental.
- No realiza detección automática de idioma: el idioma de origen debe especificarse mediante el token de tarea correspondiente.
- Solo cubre cuatro idiomas (en, de, es, fr); el rendimiento en variedades dialectales o acentos no está documentado en la información disponible.
- Riesgo de alucinación inherente a los modelos encoder-decoder de ASR, especialmente con audio ruidoso, música o silencios largos; no se han publicado análisis específicos de este riesgo para este modelo.
- Sesgos: no se documentan en la información proporcionada; al heredar el modelo base de NVIDIA, arrastra los sesgos de sus datos de entrenamiento, no detallados.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución; el repositorio incluye LICENSE y NOTICE con la trazabilidad de la derivación.
- Al ser una conversión de terceros (xix3r), la autoridad sobre el modelo recae en el repositorio original de NVIDIA; conviene validar la conversión contra NeMo antes de usarla en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica que la conversión no cuenta aún con validación comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-canary-180m-flash-gguf
- Modelo base: https://huggingface.co/nvidia/canary-180m-flash
- Commit del modelo base usado: https://huggingface.co/nvidia/canary-180m-flash/commit/b12ab41
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-180m-flash.md
- Conversión GGUF de referencia (handy-computer): https://huggingface.co/handy-computer/canary-180m-flash-gguf
- Paper de Canary (arXiv 2409.13523): https://arxiv.org/abs/2409.13523
- Paper de FastConformer (arXiv 2104.02821): https://arxiv.org/abs/2104.02821
- Paper de Transformer (arXiv 1706.03762): https://arxiv.org/abs/1706.03762
- Paper citado en los tags (arXiv 2503.05931): https://arxiv.org/abs/2503.05931
