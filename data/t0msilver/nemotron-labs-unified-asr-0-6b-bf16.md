# T0mSIlver/nemotron-labs-unified-asr-0.6b-bf16

## Resumen

Nemotron-labs-unified-asr-0.6b es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por NVIDIA y redistribuido aquí en formato MLX por el usuario T0mSIlver. Se trata de un checkpoint unificado que cubre tanto transcripción offline como streaming de baja latencia en 25 idiomas europeos, con puntuación y capitalización automáticas. El modelo base es `nvidia/nemotron-labs-unified-asr-0.6b` (revisión `023ce907`), convertido a MLX mediante la herramienta `nemotron_asr.convert` de mlx-audio.

La relevancia de esta conversión radica en que permite ejecutar el modelo de forma nativa en hardware Apple Silicon (M-series) a través de MLX, con pesos en bfloat16 y variantes cuantizadas de 8 y 4 bits. El modelo emplea una arquitectura RNNT (Recurrent Neural Network Transducer) con encoder y decoder, y está diseñado para transcripción con latencia configurable entre 160 ms y 2,08 s según el modo de streaming elegido.

Con 626,7 millones de parámetros y un tamaño de repositorio de 1,3 GB, el modelo se posiciona como una alternativa ligera para dictado, subtitulado y transcripción en tiempo real en entornos de desarrollo con hardware de consumo, sin necesidad de GPUs dedicadas de datacenter.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RNNT (Recurrent Neural Network Transducer), encoder-decoder |
| Parámetros totales | 626.702.592 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada de al menos 80 ms; contexto izquierdo recomendado ≥ 2 s en streaming) |
| Tipos de cuantización | bf16 (este repo), 8-bit, 4-bit (repos separados) |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk (25 idiomas) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un RNNT (Recurrent Neural Network Transducer), una arquitectura clásica de ASR que combina un encoder acústico con un predictor y una red de unión para emitir tokens de forma secuencial. La conversión a MLX mantiene la estructura del modelo original de NVIDIA y no altera el grafo computacional; únicamente cambia el backend de ejecución y el formato de los pesos. El checkpoint está en bfloat16 con un tamaño de 1,25 GB.

En cuanto al entrenamiento, la información disponible no detalla el número de horas de audio, la composición del dataset ni si hubo etapas de ajuste fino con RLHF o DPO. Lo que sí se documenta es el comportamiento en streaming: el modo buffered re-codifica 5,6 s de contexto izquierdo junto con el chunk nuevo y su contexto derecho en cada paso. La entrada debe ser audio mono a 16 kHz con una duración mínima de 80 ms. El autor de la conversión reporta paridad numérica con NeMo 3.1: el port en float32 produce frames de encoder con una diferencia máxima de 8,2e-6 respecto a NeMo y los mismos tokens en varias configuraciones de contexto y latencia.

## Capacidades

- Transcripción de voz a texto offline en 25 idiomas europeos.
- Streaming ASR con latencia configurable entre 160 ms y 2,08 s.
- Puntuación y capitalización automáticas en la salida.
- Manejo de contexto izquierdo para streaming (recomendado ≥ 2 s para evitar degradación de precisión).
- Selección explícita de idioma (se recomienda pasarlo manualmente; el modo `auto` puede cometer errores en los primeros tokens a baja latencia).
- Ejecución nativa en Apple Silicon mediante MLX (Python con mlx-audio y Swift con mlx-audio-swift).
- No se documentan capacidades de tool calling, agentes, visión, audio generation ni modo thinking.

## Casos de uso

- Dictado en tiempo real en aplicaciones de escritorio para macOS: el modelo puede crear sesiones de streaming con `transcription_delay_ms` de 320 ms y transcribir voz con puntuación automática, aprovechando la ejecución nativa en MLX sobre Apple Silicon.
- Subtitulado de vídeo y reuniones: con latencia de 160 ms a 2,08 s, es adecuado para generar subtítulos en directo en 25 idiomas europeos, incluyendo escenarios multilingües donde se especifica el idioma por sesión.
- Transcripción offline de archivos de audio: el modo offline procesa grabaciones completas con puntuación y capitalización, útil para pipelines de post-procesado de entrevistas, podcasts o actas.
- Asistentes de voz locales en hardware de consumo: al caber en 472 MB en cuantización 4-bit, puede integrarse en aplicaciones de escritorio o portátiles sin GPU dedicada, con inferencia en CPU/GPU unificada de Apple.
- Accesibilidad y toma de notas: transcripción en vivo de conversaciones para personas con dificultades auditivas, con latencia baja y sin dependencia de servicios en la nube.
- Procesamiento por lotes de audio multilingüe: el soporte de 25 idiomas permite enrutar audios por idioma detectado o especificado y transcribir grandes volúmenes en local, reduciendo costes de API.
- Integración en apps Swift/iOS/macOS: mediante mlx-audio-swift se puede incrustar el modelo en aplicaciones nativas con sesiones de streaming y chunks de 320 ms.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos (WER en FLEURS, MCV, MLS, etc.) para esta conversión MLX en la información disponible. El autor indica explícitamente que las tablas de WER de NVIDIA corresponden al modelo NeMo en bf16, no a esta conversión.

Datos de rendimiento reportados por el autor de la conversión:

| Métrica | Valor |
|---|---|
| Paridad con NeMo (float32) | Frames de encoder dentro de 8,2e-6; mismos tokens en 5,6 s/80 ms/240 ms, 0,8 s/80 ms/240 ms y 0,8 s/160 ms/400 ms |
| Paridad con NeMo (Swift, bf16) | Texto idéntico en 10 de 12 clips (3 ediciones de palabra en 355 palabras) |
| WER en dictado EN/FR (320 ms, 8-bit) | 6,5 % en palabras no-término; recall de términos 60,7 % |
| Comparación con `mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit` | 55,5 % recall de términos y 11,7 % WER en el resto |
| Tiempo medio por paso de 80 ms (M1 Pro, Swift, 320 ms latencia) | 8-bit: 68,6 ms; 4-bit: 68,7 ms; bf16: 64,8 ms |
| Con activaciones float16 | 57,4 ms (16 % menos, misma precisión) |
| Chunk de 160 ms con 160 ms de contexto derecho | 34,7 ms por paso (+0,6 puntos de WER en FLEURS) |
| Con activaciones float16 y chunk de 160 ms | 26,9 ms por paso, 896 MB de pico de memoria, estable durante 30 minutos |

## Requisitos de hardware

- VRAM/memoria estimada: bf16 ≈ 1,25 GB de pesos; 8-bit ≈ 744 MB; 4-bit ≈ 472 MB. El pico de memoria reportado en streaming con float16 y chunk de 160 ms es de 896 MB.
- GPU recomendadas: Apple Silicon (M1 Pro o superior es el hardware de referencia reportado). No se documentan requisitos para GPUs NVIDIA/AMD en esta conversión MLX.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; el modelo es lo suficientemente pequeño para ejecutarse en memoria unificada de 8 GB o más.
- Opciones de despliegue: mlx-audio (Python) y mlx-audio-swift (Swift). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: en M1 Pro con Swift, 64,8–68,7 ms por paso de 80 ms a 320 ms de latencia; con float16 y chunk de 160 ms, 26,9 ms por paso. La cuantización reduce memoria pero no tiempo, ya que el paso está limitado por cómputo a 75 frames.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Streaming | Licencia | Formato |
|---|---|---|---|---|---|
| T0mSIlver/nemotron-labs-unified-asr-0.6b-bf16 | 626,7 M | 25 europeos | Sí (160 ms–2,08 s) | OpenMDW 1.1 | MLX safetensors |
| nvidia/nemotron-labs-unified-asr-0.6b | 626,7 M | 25 europeos | Sí | OpenMDW 1.1 | NeMo |
| mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit | no disponible | no disponible | Sí | no disponible | MLX 8-bit |
| Whisper large-v3 | no disponible en la información | ~99 | No nativo | MIT (según información pública, no verificada aquí) | safetensors/GGUF |

La comparación directa con `mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit` en el set de dictado EN/FR muestra mejor recall de términos (60,7 % frente a 55,5 %) y menor WER en el resto de palabras (6,5 % frente a 11,7 %). No se dispone de datos comparativos con Whisper u otros modelos en la información proporcionada.

## Limitaciones y advertencias

- El modo `auto` de detección de idioma puede comprometer los primeros tokens en la lengua equivocada a baja latencia; se recomienda especificar el idioma manualmente.
- Con contexto izquierdo inferior a 2 s, NVIDIA reporta degradación de precisión.
- Las tablas de WER de NVIDIA corresponden al modelo NeMo en bf16, no a esta conversión MLX; el rendimiento exacto de esta conversión puede diferir.
- La cuantización a 8/4 bits reduce memoria pero no mejora la latencia, ya que el paso está limitado por cómputo.
- Solo se soportan 25 idiomas europeos; no hay soporte documentado para otras lenguas.
- La licencia OpenMDW 1.1 es una licencia "other" que debe revisarse antes de uso comercial; los pesos son un derivado del modelo de NVIDIA y su uso se rige por el acuerdo OpenMDW 1.1.
- No se documentan sesgos específicos, pero al ser un modelo ASR entrenado con datos no detallados, pueden existir sesgos acústicos y léxicos por idioma, género o acento.
- Riesgo de alucinación en pasajes de audio ambiguo o con ruido, habitual en modelos ASR.
- No se documenta soporte para tool calling, agentes ni otras capacidades beyond ASR.

## Enlaces

- HuggingFace (esta conversión): https://huggingface.co/T0mSIlver/nemotron-labs-unified-asr-0.6b-bf16
- Variante 8-bit: https://huggingface.co/T0mSIlver/nemotron-labs-unified-asr-0.6b-8bit
- Variante 4-bit: https://huggingface.co/T0mSIlver/nemotron-labs-unified-asr-0.6b-4bit
- Modelo base NVIDIA: https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b
- Licencia OpenMDW 1.1: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
