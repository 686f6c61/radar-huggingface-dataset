# xix3r/voxix-cohere-transcribe-03-2026-gguf

## Resumen

voxix-cohere-transcribe-03-2026-gguf es una conversión a formato GGUF del modelo CohereLabs/cohere-transcribe-03-2026, un sistema de reconocimiento automático del habla (ASR) de 2.000 millones de parámetros desarrollado por Cohere y Cohere Labs. La conversión la mantiene el usuario xix3r y está pensada para su uso con transcribe.cpp, una implementación en C++ orientada a inferencia local y offline. El modelo resuelve el problema de la transcripción multilingüe de audio a texto sin depender de servicios en la nube, cubriendo 14 idiomas.

La arquitectura es un encoder Conformer combinado con una cabeza encoder-decoder Transformer con atención cruzada y embeddings de tokens compartidos. La entrada es una forma de onda de audio que se convierte en un espectrograma log-Mel, remuestreado automáticamente a 16 kHz y promediado a mono si es multicanal. La decodificación es autorregresiva y el resultado es texto plano.

Su relevancia actual radica en que ofrece una alternativa Apache-2.0, ejecutable en hardware de consumo, a modelos ASR propietarios o de mayor tamaño. Las cuantizaciones publicadas van desde BF16 (4,10 GB) hasta Q4_K_M (1,55 GB), con una degradación de WER prácticamente nula (1,25%-1,27% frente al 1,26% de referencia en LibriSpeech test-clean), lo que permite desplegarlo en portátiles y equipos sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer + cabeza encoder-decoder Transformer (atención cruzada, embeddings de tokens compartidos) |
| Parametros totales | 2B (según model card upstream) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl, el, ar, ja, zh, vi, ko (14 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es un sistema audio-in/text-out dedicado a ASR. Un encoder Conformer de gran tamaño extrae representaciones acústicas a partir del espectrograma log-Mel, y una cabeza encoder-decoder Transformer con atención cruzada genera la transcripción de forma autorregresiva. Los embeddings de tokens están compartidos entre encoder y decoder. La entrada se normaliza automáticamente a 16 kHz mono antes del preprocesado.

La conversión GGUF se realizó a partir del commit upstream 76b8b23 (fijado el 2026-04-16) y se validó contra la referencia de Transformers en el commit bf0d0b7 de transcribe.cpp el 2026-04-18. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto offline en 14 idiomas: inglés, francés, alemán, español, italiano, portugués, neerlandés, polaco, griego, árabe, japonés, chino, vietnamita y coreano.
- Entrada de audio con remuestreo automático a 16 kHz y conversión de estéreo a mono durante el preprocesado.
- Decodificación autorregresiva con salida de texto plano.
- Inferencia puramente local mediante transcribe.cpp, sin dependencia de red.
- No soporta streaming (streaming: false).
- No soporta traducción (translate: false).
- No realiza detección de idioma (lang_detect: false).
- No genera marcas de tiempo (timestamps: none).
- No dispone de tool calling, function calling ni capacidades de agente.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa archivos WAV de 16 kHz mono y devuelve la transcripción completa; su tamaño reducido en Q4_K_M (1,55 GB) permite ejecutarlo en un portátil sin GPU dedicada.
- Subtitulado de contenido audiovisual: convierte la pista de audio de vídeos a texto en cualquiera de los 14 idiomas soportados; al no generar timestamps, requiere un paso posterior de alineación si se necesitan subtítulos sincronizados.
- Archivado y búsqueda de material sonoro: transcripción por lotes de grabaciones históricas o de archivo para indexar su contenido textual y hacerlo consultable.
- Asistentes de voz en local para aplicaciones de escritorio: integración mediante transcribe.cpp en herramientas que necesiten dictado o comandos de voz sin enviar audio a servidores externos.
- Documentación clínica o legal dictada: transcripción de notas de voz en entornos donde la confidencialidad exige procesamiento offline, con la ventaja de una licencia Apache-2.0 para uso comercial.
- Investigación en lingüística y análisis conversacional: generación de transcripciones multilingües reproducibles sobre corpus de audio, con cuantizaciones que permiten ejecutar experimentos en CPU (RTF 3 en Ryzen 4750U y 9 en CPU de M4 Max).
- Evaluación de pipelines ASR: uso como referencia o componente base en comparativas de sistemas de reconocimiento de voz, dado que el WER en LibriSpeech test-clean (1,25%-1,27%) está documentado por cuantización.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2.620 enunciados, decodificación greedy, sin LM externo, normalizador Whisper EnglishTextNormalizer):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,10 GB | 1,26% |
| F16 | 4,11 GB | 1,26% |
| Q8_0 | 2,41 GB | 1,27% |
| Q6_K | 1,97 GB | 1,27% |
| Q5_K_M | 1,76 GB | 1,25% |
| Q4_K_M | 1,55 GB | 1,25% |

Referencia upstream de Cohere en el mismo split: 1,25% (Open ASR Leaderboard, a fecha de 2026-03-26).

Rendimiento (RTF, real-time factor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 73 |
| Apple M4 Max | CPU | 9 |
| Ryzen 4750U | Vulkan | 8 |
| Ryzen 4750U | CPU | 3 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto en la información disponible, al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 4,10 GB en BF16, 2,41 GB en Q8_0, 1,55 GB en Q4_K_M (tamaños de archivo; el consumo real de memoria es del mismo orden).
- GPU recomendadas: no se especifican modelos concretos; se documentan backends Metal (Apple Silicon) y Vulkan (AMD/Intel/GPU compatibles).
- Cabe en GPU de consumo: sí, con cuantizaciones Q8_0 o inferiores; Q4_K_M (1,55 GB) es viable incluso en GPUs integradas y en CPU.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake; binario transcribe-cli). No se mencionan vLLM, llama.cpp, Ollama ni TGI, dado que el formato GGUF está adaptado a transcribe.cpp.
- Latencia y throughput: RTF de 73 con Metal en M4 Max, 9 en CPU de M4 Max, 8 con Vulkan en Ryzen 4750U y 3 en CPU de Ryzen 4750U. Valores superiores a 1 indican procesamiento más rápido que tiempo real.
- Requisito de entrada: WAV mono a 16 kHz; para otros formatos hay que convertir previamente con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| cohere-transcribe-03-2026 (GGUF, esta ficha) | 2B | 14 | Apache-2.0 | GGUF | WER 1,25%-1,27% en LibriSpeech test-clean; sin streaming, traducción ni timestamps |
| CohereLabs/cohere-transcribe-03-2026 (upstream) | 2B | 14 | Apache-2.0 | safetensors (Transformers) | Referencia original; WER 1,25% reportado |
| Whisper large-v3 | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | No se aportan datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks ni especificaciones de modelos alternativos en la información proporcionada que permitan una comparación cuantitativa adicional.

## Limitaciones y advertencias

- No soporta streaming: requiere el audio completo o segmentos cerrados, lo que impide transcripción en tiempo real continua.
- No realiza detección automática de idioma: el idioma debe gestionarse externamente o confiar en la cobertura multilingüe del modelo.
- No genera marcas de tiempo, lo que limita su uso directo en subtitulado sincronizado.
- No traduce: solo transcribe en el idioma hablado.
- Decodificación autorregresiva: la latencia crece con la duración del audio.
- Riesgo de alucinación en pasajes con ruido, música o silencios prolongados, comportamiento habitual en modelos ASR autorregresivos; no se documentan tasas específicas.
- Sesgos: no se documentan en la información proporcionada; cabe esperar un rendimiento desigual entre los 14 idiomas según su representación en los datos de entrenamiento.
- Requisito estricto de entrada: WAV mono a 16 kHz; otros formatos exigen conversión previa.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; conviene consultar la model card upstream para los términos completos.
- La conversión GGUF está validada contra un commit concreto de transcribe.cpp (bf0d0b7); cambios posteriores en la librería pueden afectar a la compatibilidad.
- El repositorio de la conversión registra 0 descargas y 0 likes en el momento de la consulta, por lo que su adopción y mantenimiento comunitario son limitados.

## Enlaces

- Repositorio Hugging Face de la conversión GGUF: https://huggingface.co/xix3r/voxix-cohere-transcribe-03-2026-gguf
- Modelo base en Hugging Face: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Commit upstream de referencia: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026/commit/76b8b23
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/cohere-transcribe-03-2026.md
- Cohere Labs: https://cohere.com/research
- Cohere: https://cohere.com
