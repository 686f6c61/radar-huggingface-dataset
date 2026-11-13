# xix3r/voxix-nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

Voxix Nemotron 3.5 ASR Streaming 0.6B GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-3.5-asr-streaming-0.6b`, publicada por el usuario xix3r para su uso con el motor de inferencia transcribe.cpp. El modelo original lo desarrolla NVIDIA y está diseñado para transcripción de voz a texto multilingüe en tiempo real, con soporte de streaming cache-aware y puntuación y capitalización automáticas.

La arquitectura combina un codificador FastConformer de 0,6 mil millones de parámetros con un decodificador transducer RNN-T condicionado por prompt de idioma, lo que permite seleccionar el idioma destino en cada llamada o activar un modo automático que emite una etiqueta `<lang-XX>`. El modelo cubre 32 configuraciones regionales de idioma de forma nativa (el tokenizador reconoce 40, aunque 8 requieren ajuste fino) e incluye tanto una ruta offline de alta precisión como streaming por fragmentos seleccionable en tiempo de ejecución.

Su relevancia actual reside en que ofrece ASR multilingüe de calidad cercana a la referencia de NeMo en un paquete de menos de 1 GB en cuantizaciones de 8 bits, ejecutable en CPU y GPU de consumo mediante transcribe.cpp, lo que lo hace adecuado para despliegues locales, embebidos y aplicaciones de transcripción en vivo sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware (codificador) + RNN-T transducer condicionado por prompt (decodificador) |
| Parametros totales | 637.991.968 (~0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de atención offline `att_context_size=[56, 13]`, equivalente a 1,12 s; streaming por fragmentos de 1120 ms con `att_right` de 0, 3, 6 o 13) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 32 configuraciones regionales: en, es, fr, it, pt, nl, de, tr, ru, ar, hi, ja, ko, vi, uk, pl, sv, cs, nb, da, bg, fi, hr, sk, zh, hu, ro, et (tokenizador reconoce 40; 8 requieren ajuste fino) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR híbrido compuesto por un codificador FastConformer cache-aware y un decodificador transducer RNN-T. El codificador procesa audio mono a 16 kHz y la variante cache-aware permite inferencia incremental con estado persistente, lo que habilita streaming real sin recálculo completo. El decodificador RNN-T está condicionado por un prompt de idioma, de modo que la selección del idioma destino se realiza por llamada (`--language en-US`, `fr-FR`, etc.) o mediante un modo automático que emite una etiqueta `<lang-XX>`.

La ruta offline emplea `att_context_size=[56, 13]`, que corresponde a una ventana de 1,12 s y ofrece la máxima precisión. La ruta de streaming es seleccionable en tiempo de ejecución mediante `--stream-chunk-ms 1120` y `--stream-att-right {0,3,6,13}`, lo que permite intercambiar latencia por precisión. El modelo incluye detección de idioma y timestamps a nivel de token, pero no soporta traducción. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Transcripción de voz a texto multilingüe en 32 configuraciones regionales de idioma con puntuación y capitalización automáticas.
- Streaming cache-aware con latencia configurable mediante fragmentos de 1120 ms y ventana de atención derecha ajustable.
- Modo offline de alta precisión con ventana de contexto de 1,12 s.
- Selección explícita de idioma por llamada o detección automática de idioma con emisión de etiqueta `<lang-XX>`.
- Timestamps a nivel de token.
- No soporta traducción automática (`translate: false`).
- No dispone de tool calling, function calling ni capacidades de agente (es un modelo puramente ASR).

## Casos de uso

- Transcripción en vivo de reuniones y videoconferencias: el modo streaming con fragmentos de 1120 ms permite generar subtítulos incrementales en tiempo real, y la selección de idioma por llamada facilita reuniones multilingües con detección automática.
- Subtitulado de contenido audiovisual: la ruta offline con `att_context_size=[56, 13]` ofrece la máxima precisión (WER de 7,97 % en FLEURS en y 3,04 % en LibriSpeech test-clean en F32) y los timestamps a nivel de token permiten alinear subtítulos.
- Asistentes de voz locales en dispositivos de consumo: la cuantización Q4_K_M ocupa 473 MB y puede ejecutarse en CPU, lo que permite integrar ASR en aplicaciones de escritorio o móviles sin conexión.
- Dictado y notas de voz: la puntuación y capitalización automáticas reducen el postprocesado, y el soporte de 32 idiomas cubre usuarios internacionales con una sola implementación.
- Indexación y búsqueda de archivos de audio: la transcripción por lotes con la ruta offline permite generar transcripciones buscables de archivos de audio o vídeo en pipelines automatizados.
- Atención al cliente telefónica: el streaming cache-aware permite transcribir llamadas en curso con baja latencia, y la detección de idioma automática gestiona clientes de distintos países sin configuración previa.
- Investigación en ASR multilingüe: el modelo sirve como referencia de 0,6B parámetros para comparar técnicas de cuantización (los WER por cuantización están publicados) y validar implementaciones de transcribe.cpp frente a NeMo.

## Benchmarks y rendimiento

WER medido en FLEURS test en (647 enunciados, decodificación greedy RNN-T, `--language en-US`, normalizador whisper) y en LibriSpeech test-clean (2620 enunciados), ruta offline `att_context_size=[56, 13]`:

| Cuantizacion | Tamano | WER FLEURS en (%) | WER LibriSpeech test-clean (%) |
|---|---:|---:|---:|
| F32 | 2,38 GB | 7,97 | 3,04 |
| F16 | 1,19 GB | 7,97 | 3,03 |
| Q8_0 | 716 MB | 7,88 | 3,06 |
| Q6_K | 593 MB | 8,02 | 3,07 |
| Q5_K_M | 534 MB | 8,15 | 3,10 |
| Q4_K_M | 473 MB | 8,49 | 3,28 |
| Referencia NeMo | — | 7,99 (NVIDIA reporta 7,91 en-US) | 3,03 |

Rendimiento en tiempo real (RTF, factor de tiempo real):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 98 |
| Apple M4 Max | CPU | 29 |
| AMD Ryzen 4750U | Vulkan | 14,5 |
| AMD Ryzen 4750U | CPU | 7,5 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,4 GB en F32, 1,2 GB en F16, 716 MB en Q8_0, 593 MB en Q6_K, 534 MB en Q5_K_M y 473 MB en Q4_K_M.
- GPU recomendadas: no se especifican modelos concretos; el modelo se ha validado con backend Metal en Apple M4 Max y con Vulkan en AMD Ryzen 4750U. Por tamaño, cabe en cualquier GPU de consumo con 2 GB o más de memoria.
- Cabe en GPU de consumo: sí, incluidas tarjetas de gama baja y iGPU con al menos 2 GB de memoria disponible en F16; en Q4_K_M basta con menos de 500 MB.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), con compilación desde fuente mediante CMake. No se mencionan otros motores (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: RTF de 98 en Metal (M4 Max), 29 en CPU (M4 Max), 14,5 en Vulkan (Ryzen 4750U) y 7,5 en CPU (Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Formato | Licencia |
|---|---:|---|---|---|---|
| Voxix Nemotron 3.5 ASR Streaming 0.6B GGUF | 0,6B | 32 configuraciones regionales | Sí, cache-aware | GGUF (transcribe.cpp) | OpenMDW-1.1 |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 0,6B | 32 configuraciones regionales | Sí, cache-aware | safetensors (NeMo) | OpenMDW-1.1 |
| OpenAI Whisper (variantes) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría (por ejemplo, variantes de Whisper) no está disponible en la información proporcionada. El modelo original de NVIDIA es idéntico en arquitectura y parámetros; la diferencia es el formato GGUF y el motor de inferencia transcribe.cpp, que permite ejecución en CPU y GPU de consumo con cuantizaciones de hasta 4 bits.

## Limitaciones y advertencias

- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible en segmentos de audio ruidosos o silenciosos; no se han publicado métricas específicas de este comportamiento.
- Cobertura de idiomas: aunque el tokenizador reconoce 40 idiomas, solo 32 están soportados de forma nativa; los 8 restantes requieren ajuste fino.
- Sin traducción: el modelo no traduce, solo transcribe en el idioma seleccionado o detectado.
- Dependencia de transcribe.cpp: el formato GGUF de este repositorio está pensado para ese motor; no se garantiza compatibilidad con otros runners.
- Licencia OpenMDW-1.1: es una licencia "other" heredada del modelo base; deben revisarse los términos completos en la model card de NVIDIA antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 13 de noviembre de 2026; se trata de una conversión reciente sin validación comunitaria amplia.
- No se dispone de información sobre sesgos demográficos o acústicos específicos del modelo.
- El rendimiento en streaming puede degradarse respecto a la ruta offline; la ventana `att_right` seleccionada afecta a la precisión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/nemotron-3.5-asr-streaming-0.6b.md
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/909e94e
- Commit del modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/commit/24b151a
- Paper de referencia (arXiv:2312.17279): https://arxiv.org/abs/2312.17279
- Paper de referencia (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Licencia OpenMDW-1.1: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
