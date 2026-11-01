# tryambientai/Voxtral-Small-24B-2507-gguf

## Resumen

Voxtral-Small-24B-2507 es un modelo de audio-lenguaje desarrollado por Mistral AI que combina un codificador de audio bidireccional tipo Whisper-large-v3 con un decodificador causal Mistral-Small-24B. Resuelve el problema de la transcripción y traducción de voz de alta calidad en un único modelo, eliminando la necesidad de encadenar un sistema ASR con un LLM separado. Es relevante porque ofrece transcripción multilingüe, comprensión de audio y function calling directo desde la voz con una licencia Apache-2.0 permisiva.

La ficha que nos ocupa corresponde a la conversión GGUF realizada por tryambientai para su uso con transcribe.cpp, una implementación en C++ orientada a inferencia local y offline. El modelo base cuenta con 24.261.827.088 parámetros y un contexto de 32.000 tokens, lo que permite procesar audios de hasta 30 minutos para transcripción y 40 minutos para comprensión. La conversión incluye cuantizaciones desde BF16 hasta Q4_K_M, con una degradación de WER muy contenida en la mayoría de los niveles.

La relevancia actual de esta conversión radica en que hace viable ejecutar un modelo de 24B con capacidades de audio en hardware de consumo y en entornos sin conexión, algo que hasta ahora requería infraestructura de servidor. El compromiso entre tamaño de archivo (14,30 GB en Q4_K_M) y calidad (2,11% de WER) lo sitúa como una opción práctica para despliegues locales de transcripción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador de audio bidireccional (Whisper-large-v3) + proyector de 4 frame-groups + decodificador causal Mistral-Small-24B (40 capas, GQA 32/8, NEOX RoPE, SwiGLU) |
| Parametros totales | 24.261.827.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (hasta 30 min de audio para transcripción, 40 min para comprensión) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, it, pt, nl, hi |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de inyección de tokens de audio en un LLM causal. Un codificador de audio bidireccional basado en Whisper-large-v3 procesa la señal, y un proyector de 4 frame-groups comprime la representación a 375 tokens de audio por cada fragmento de 30 segundos. Estos tokens se inyectan en el decodificador Mistral-Small-24B, que consta de 40 capas con atención de consultas agrupadas (GQA) de 32 cabezas de consulta y 8 de clave/valor, RoPE en variante NEOX y activación SwiGLU. La entrada es un WAV mono a 16 kHz y la decodificación es voraz (greedy).

El modelo base es un refinamiento de Mistral Small 3 con capacidades de audio añadidas, y conserva el rendimiento de texto de su backbone lingüístico. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La conversión GGUF fue validada contra la referencia de Transformers en el commit dac22fa de transcribe.cpp, con paridad numérica a nivel de tensor establecida por el modelo hermano Voxtral Mini 3B, que comparte arquitectura, codificador, proyector y tokenizador.

## Capacidades

- Transcripción de voz a texto con detección automática del idioma de origen.
- Traducción de voz a texto entre los ocho idiomas soportados.
- Comprensión de audio: preguntas y respuestas directamente sobre el contenido de la grabación.
- Resumen estructurado de audio sin necesidad de un ASR y un LLM separados.
- Function calling directo desde la voz para disparar APIs, flujos de trabajo o funciones de backend.
- Capacidades de texto heredadas de Mistral Small 3.1 (razonamiento, generación y comprensión escrita).
- Procesamiento de audio largo: hasta 30 minutos para transcripción y 40 minutos para comprensión.
- Multilingüismo nativo en inglés, francés, alemán, español, italiano, portugués, neerlandés e hindi.
- Soporte de marcas de tiempo: no disponible en esta conversión (timestamps: none).
- Streaming: no soportado (streaming: false).
- Traducción: soportada (translate: true).
- Detección de idioma: soportada (lang_detect: true).

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar grabaciones de hasta 30 minutos en una sola pasada gracias a su contexto de 32.000 tokens, generando la transcripción completa con detección automática del idioma y sin necesidad de segmentar manualmente el audio.
- Subtitulado y traducción de contenido audiovisual: con soporte de traducción y ocho idiomas, permite generar subtítulos traducidos de vídeos o pódcast directamente desde el audio, integrándose en un pipeline con ffmpeg para la conversión previa a WAV mono a 16 kHz.
- Atención al cliente por voz: el function calling desde la voz permite interpretar la intención del usuario hablado y disparar llamadas a APIs de backend, lo que habilita sistemas de IVR inteligentes sin un componente ASR separado.
- Análisis y resumen de llamadas: el modelo puede responder preguntas sobre el contenido de una conversación grabada y producir resúmenes estructurados, útil en entornos de compliance, calidad o análisis de ventas.
- Transcripción offline en hardware de consumo: la cuantización Q4_K_M de 14,30 GB permite ejecutar el modelo en una GPU consumer con suficiente VRAM, adecuado para aplicaciones de escritorio o entornos sin conectividad.
- Investigación en lingüística computacional: la licencia Apache-2.0 y la disponibilidad de múltiples cuantizaciones facilitan la experimentación académica con un modelo de 24B sin restricciones de uso comercial.
- Accesibilidad: generación de transcripciones y traducciones de audio en tiempo no real para personas con discapacidad auditiva, desplegable localmente con transcribe.cpp.

## Benchmarks y rendimiento

| Metrica | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,56 | 1,57 | 1,56 | 1,58 | 1,60 | 2,11 |
| Tamano del archivo (GB) | 48,54 | 48,55 | 25,81 | 19,94 | 17,14 | 14,30 |

El WER se midió sobre la partición completa de LibriSpeech test-clean (2.620 enunciados) con el normalizador de texto inglés de Whisper, decodificación voraz, batch size 8 y una NVIDIA A100 de 80 GB. La referencia de HuggingFace Transformers en la misma máquina (VoxtralForConditionalGeneration, BF16, greedy) obtuvo un 1,57%, por lo que el GGUF BF16 iguala el resultado con un 1,56%.

Como dato adicional de rendimiento, el RTF (real-time factor) en un chip Apple M4 Max con backend Metal es de 3,2, lo que indica que procesa audio aproximadamente 3,2 veces más rápido que tiempo real en ese hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 49 GB en BF16/F16, 26 GB en Q8_0, 20 GB en Q6_K, 17 GB en Q5_K_M y 14,3 GB en Q4_K_M (el tamaño del archivo es una aproximación ajustada del consumo de memoria).
- GPU recomendadas: NVIDIA A100 80 GB o H100 para BF16/F16; RTX 4090 (24 GB) para Q8_0 o Q6_K; GPUs con 16-24 GB para Q5_K_M y Q4_K_M.
- Cabe en GPU consumer: sí, en Q4_K_M (14,30 GB) y Q5_K_M (17,14 GB) en tarjetas de 16 GB o más; Q6_K y Q8_0 requieren 20-24 GB.
- Opciones de despliegue: transcribe.cpp (librería nativa del repositorio), con backend Metal validado en Apple M4 Max. No se indica soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: RTF de 3,2 en Apple M4 Max con Metal; no se dispone de datos de throughput en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Voxtral-Small-24B-2507 (esta ficha) | 24,26B | 32.000 tokens | 8 | Apache-2.0 | GGUF |
| Voxtral Mini 3B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Whisper-large-v3 | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo hermano Voxtral Mini 3B, del que se indica que comparte codificador, proyector, frontend y tokenizador, con un decodificador de menor tamaño (3B frente a 24B). No se dispone de datos de benchmarks, contexto ni licencia de Whisper-large-v3 en la información consultada, por lo que la comparativa completa queda como no disponible.

## Limitaciones y advertencias

- No soporta streaming: la inferencia es offline y de audio completo, lo que impide su uso en aplicaciones de transcripción en tiempo real.
- No genera marcas de tiempo: la conversión declara timestamps: none, lo que limita su uso en subtitulado que requiera alineación temporal precisa.
- La cuantización Q4_K_M degrada el WER de forma notable (2,11% frente a 1,56% en BF16), por lo que en aplicaciones sensibles a la precisión conviene usar Q5_K_M o superior.
- Riesgo de alucinación inherente a los modelos de lenguaje: en pasajes de audio con ruido, silencios largos o habla solapada puede generar texto no presente en la señal.
- Sesgos potenciales en el reconocimiento de acentos, dialectos y habla no nativa, no cuantificados en la información disponible.
- Cobertura lingüística limitada a ocho idiomas; el rendimiento en idiomas no listados no está garantizado.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene consultar la model card de Mistral AI para los términos completos.
- La validación numérica a nivel de tensor se estableció con el modelo hermano Voxtral Mini 3B; para esta variante la validación es end-to-end mediante WER.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/tryambientai/Voxtral-Small-24B-2507-gguf
- Modelo base: https://huggingface.co/mistralai/Voxtral-Small-24B-2507
- Commit del modelo base referenciado: https://huggingface.co/mistralai/Voxtral-Small-24B-2507/commit/da5b424
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/dac22fa
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/voxtral-small-24b-2507.md
- Blog de Mistral AI sobre Voxtral: https://mistral.ai/news/voxtral
- Paper de investigación: https://arxiv.org/abs/2507.13264
- Descarga BF16: https://huggingface.co/handy-computer/Voxtral-Small-24B-2507-gguf/resolve/main/Voxtral-Small-24B-2507-BF16.gguf
- Descarga F16: https://huggingface.co/handy-computer/Voxtral-Small-24B-2507-gguf/resolve/main/Voxtral-Small-24B-2507-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/Voxtral-Small-24B-2507-gguf/resolve/main/Voxtral-Small-24B-2507-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/handy-computer/Voxtral-Small-24B-2507-gguf/resolve/main/Voxtral-Small-24B-2507-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/handy-computer/Voxtral-Small-24B-2507-gguf/resolve/main/Voxtral-Small-24B-2507-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/handy-computer/Voxtral-Small-24B-2507-gguf/resolve/main/Voxtral-Small-24B-2507-Q4_K_M.gguf
- Mistral Small 3 (backbone textual): https://huggingface.co/mistralai/Mistral-Small-24B-Base-2501
