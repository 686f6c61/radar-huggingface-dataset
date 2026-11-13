# xix3r/voxix-nemotron-speech-streaming-en-0.6b-gguf

## Resumen

voxix-nemotron-speech-streaming-en-0.6b-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) nvidia/nemotron-speech-streaming-en-0.6b, publicada por el usuario xix3r para su uso con el motor de inferencia transcribe.cpp. El modelo original lo desarrolla NVIDIA y está diseñado para transcripción de inglés con puntuación y capitalización nativas, empleando una arquitectura Cache-Aware FastConformer con decodificador RNN-T (transducer).

La relevancia de esta conversión radica en que permite ejecutar un modelo ASR de 618 millones de parámetros en hardware de consumo, sin depender de CUDA ni de la pila NeMo, gracias al runtime transcribe.cpp (compatible con CPU, Metal y Vulkan). La cuantización Q4_K_M reduce el peso a 453 MB manteniendo un WER de 2,38 % en LibriSpeech test-clean, apenas siete centésimas por encima del baseline F32 (2,31 %).

El modelo conserva la máscara de atención cache-aware del original con att_context_size=[70, 13] (ventana de 1,12 s), lo que lo hace apto para flujos de baja latencia, aunque la versión actual de transcribe.cpp solo expone inferencia offline y no una API de sesión en streaming. El idioma soportado es únicamente inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cache-Aware FastConformer (encoder) + RNN-T transducer (decoder) |
| Parametros totales | 618.079.745 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | attention context [70, 13] = 1,12 s de audio por ventana; sin límite de contexto textual (ASR) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | GGUF |
| Tamaño del repo | 0,7 GB |
| Frecuencia de muestreo | 16 kHz mono WAV |
| Timestamps | a nivel de token |
| Traducción | no |
| Detección de idioma | no |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cache-Aware FastConformer-RNNT de NVIDIA, un encoder Conformer con atención cache-aware que procesa el audio en fragmentos configurables (80 ms, 160 ms, 560 ms y 1120 ms) y un decodificador RNN-T que genera la transcripción de forma incremental. La máscara de atención cache-aware con att_context_size=[70, 13] se preserva de extremo a extremo en la conversión GGUF, de modo que el comportamiento numérico del encoder coincide con la referencia NeMo.

La conversión se realizó desde el commit upstream ef3bf40 (fijado el 11 de mayo de 2026) y se validó contra la referencia NeMo en el commit 12f1076 de transcribe.cpp. El modelo original fue reentrenado en marzo de 2026 sobre corpus ampliados respecto al checkpoint de enero de 2026. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; estos datos deben consultarse en la model card de NVIDIA.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización nativas.
- Arquitectura streaming cache-aware: el encoder está preparado para procesar audio por fragmentos de 80, 160, 560 o 1120 ms.
- Inferencia offline en la versión actual de transcribe.cpp (la API de sesión en streaming aún no está expuesta).
- Generación de timestamps a nivel de token.
- Ejecución en CPU, Metal (Apple Silicon) y Vulkan (GPU integradas y discretas) mediante transcribe.cpp.
- No soporta traducción, detección de idioma ni otras lenguas distintas del inglés.
- No dispone de tool calling, function calling ni capacidades de agente (es un modelo puramente ASR).

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo procesa audio de 16 kHz mono y devuelve texto con puntuación y capitalización, lo que reduce el postprocesado en herramientas de actas y resúmenes.
- Subtitulado de vídeo en inglés: los timestamps a nivel de token permiten alinear las transcripciones con la línea temporal del vídeo en pipelines de generación de subtítulos.
- Dictado local en aplicaciones de escritorio: con la cuantización Q4_K_M (453 MB) el modelo cabe en un portátil sin GPU dedicada y se ejecuta por CPU con un RTF de 7,5 en un Ryzen 4750U (más rápido que tiempo real).
- Transcripción en dispositivos Apple Silicon: el backend Metal alcanza un RTF de 154,5 en un chip M4 Max, lo que permite procesar audio en lote con latencia muy baja.
- Procesamiento por lotes de archivos de audio: la inferencia offline y el bajo coste computacional lo hacen adecuado para transcribir grandes volúmenes de grabaciones en servidores sin GPU.
- Integración en aplicaciones de accesibilidad: transcripción en tiempo casi real de conversaciones presenciales o llamadas en inglés ejecutándose localmente, sin enviar audio a servicios en la nube.
- Preprocesado para pipelines de NLP: generar transcripciones limpias y puntuadas que alimenten sistemas de búsqueda, resumen o análisis de sentimiento sobre contenido hablado.

## Benchmarks y rendimiento

| Métrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 2,31 | 2,31 | 2,31 | 2,29 | 2,34 | 2,38 |
| Tamaño (MB) | 2300 | 1160 | 696 | 573 | 514 | 453 |

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 154,5 |
| Apple M4 Max | CPU | 32,0 |
| AMD Ryzen 4750U | Vulkan | 13,0 |
| AMD Ryzen 4750U | CPU | 7,5 |

El WER se midió sobre la totalidad de LibriSpeech test-clean (2620 enunciados) con decodificación RNN-T greedy. El dato autoinformado por NVIDIA para el mismo split con att_context_size=[70, 13] y sin puntuación ni capitalización es 2,32 %, coherente con el baseline F32 de esta conversión (2,31 %).

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; Q4_K_M ocupa 453 MB y F32 2,30 GB. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no requiere GPU dedicada; funciona en Apple Silicon vía Metal y en GPU AMD/Intel vía Vulkan. En GPU NVIDIA puede ejecutarse por CPU o mediante el backend Vulkan de transcribe.cpp.
- Compatibilidad con GPU de consumo: sí, en cualquier tarjeta con soporte Vulkan o Metal, e incluso solo con CPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no un LLM.
- Throughput y latencia: RTF de 154,5 (Metal, M4 Max), 32 (CPU, M4 Max), 13 (Vulkan, Ryzen 4750U) y 7,5 (CPU, Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Streaming | Formato | Licencia |
|---|---|---:|---|---|---|
| nemotron-speech-streaming-en-0.6b (esta conversión) | 618 M | en | cache-aware (offline en transcribe.cpp) | GGUF | NVIDIA Open Model License |
| Whisper large-v3 | 1550 M | multilingüe | no nativo | safetensors, GGUF, etc. | MIT |
| Whisper small | 244 M | multilingüe | no nativo | safetensors, GGUF, etc. | MIT |
| Parakeet TDT 0.6B | ~600 M | en | limitado | NeMo, ONNX | CC-BY-4.0 |

No se dispone en la información proporcionada de resultados de benchmarks comparativos directos entre estos modelos; la comparación se limita a parámetros, idiomas, formato y licencia.

## Limitaciones y advertencias

- Solo admite inglés; no realiza detección de idioma ni traducción.
- La versión actual de transcribe.cpp no expone una API de streaming, por lo que la inferencia es offline pese a que el encoder sea cache-aware.
- El modelo puede presentar sesgos derivados de los corpus de entrenamiento de NVIDIA (acentos, variedades dialectales y dominio), no documentados en la información disponible.
- Riesgo de alucinación en audio con ruido, música o habla solapada; el WER de 2,31 % corresponde a LibriSpeech test-clean, un corpus limpio de lectura, y será peor en condiciones reales.
- Requiere audio de entrada a 16 kHz mono WAV; es necesario remuestrear con ffmpeg u otra herramienta.
- La licencia NVIDIA Open Model License impone condiciones para uso comercial; deben revisarse los términos completos antes de desplegar en producción.
- La conversión GGUF la mantiene un tercero (xix3r) y no NVIDIA; la model card upstream es la fuente autoritativa.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de adopción comunitaria.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/xix3r/voxix-nemotron-speech-streaming-en-0.6b-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Commit upstream de referencia: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b/commit/ef3bf40
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/12f1076
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/nemotron-speech-streaming-en-0.6b.md
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper RNNT cache-aware streaming (arXiv:2312.17279): https://arxiv.org/abs/2312.17279
