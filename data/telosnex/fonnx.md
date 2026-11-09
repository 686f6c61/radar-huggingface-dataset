# telosnex/fonnx

## Resumen

`telosnex/fonnx` no es un modelo de lenguaje único, sino un repositorio de artefactos ONNX empaquetados para su uso con [fonnx](https://github.com/Telosnex/fonnx), un runtime que ejecuta modelos ONNX en aplicaciones Flutter en todas las plataformas (Android, iOS, macOS, Windows, Linux y web). El repositorio agrupa conversores y exportaciones de terceros de modelos especializados en tareas concretas: reconocimiento automático del habla (ASR), detección de actividad de voz (VAD), síntesis de voz (TTS), detección de palabras clave, embeddings de frases, detección de inyección de prompts, clasificación de contenido y detección de idioma de ficheros.

Cada fichero tiene su propia licencia, de ahí la etiqueta `license: per-file` y el campo `license_name: per-file`. El repositorio no entrena modelos propios: actúa como espejo versionado y fijado por commit y SHA-256 (a través de `native_artifacts/manifest.json` en fonnx), de modo que las aplicaciones distribuidas descargan ficheros inmutables. Es relevante para desarrolladores que necesitan inferencia local en dispositivos móviles y de escritorio sin depender de servicios en la nube, con un conjunto curado de modelos pequeños y cuantizados (int8, int8/int4, uint8) listos para producción.

El tamaño del repositorio es de 6,4 GB y contiene tanto los ficheros fijados por fonnx como otros heredados de versiones anteriores (`whisper_{tiny,base,small}.onnx`, `bpe_decoder.onnx`, `silero_vad.onnx`, `whisper_v3_turbo_olive.onnx`). No se dispone de información sobre parámetros totales agregados, longitud de contexto o idiomas soportados globalmente, ya que depende de cada submodelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo: Zipformer (KWS), FastConformer híbrido CTC (ASR), TDT (Parakeet), transformer encoder-decoder (Whisper), StyleTTS/Kokoro (TTS), MiniLM (embeddings), VAD (Silero), clasificador (Wolf Defender), entre otros |
| Parámetros totales | No disponible (agregado); por submodelo: 3M (Zipformer KWS), 82M (Kokoro), 0,6B (Parakeet TDT v3), 8M/32M (potion), 6 capas (MiniLM), etc. |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de cada submodelo; los ASR operan por ventanas de audio) |
| Tipos de cuantización | int8, int8/int4 (Wolf Defender Edge), uint8 (Kokoro), float32/ONNX estándar en algunos ficheros |
| Idiomas soportados | No disponible a nivel de repositorio; Kokoro incluye 28 voces en inglés (US/GB); SenseVoice Small es multilingüe; FastConformer es multilingüe; Whisper es multilingüe |
| Licencia | Per-file: Apache-2.0, MIT, CC-BY-4.0, FunASR Model License, FUTO Model Weights License 1.0 |
| Formato de pesos | ONNX (`.onnx`), binarios auxiliares (`.bin`), diccionarios JSON y ficheros de tokens (`.txt`, `.json`) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos: reempaqueta y, en algunos casos, reconvierte exportaciones de terceros. Las arquitecturas subyacentes son diversas. Para ASR se incluyen exportaciones de sherpa-onnx de modelos NVIDIA NeMo (FastConformer híbrido CTC multilingüe en int8 y Parakeet TDT 0.6B v3 en int8), además de SenseVoice Small de Alibaba (Tongyi Lab) y varias variantes de Whisper (tiny, base, small y un turbo optimizado con Olive). Para TTS se usa Kokoro-82M v1.0, exportado por onnx-community en uint8 y dividido por fonnx en un modelo de prosodia y un decodificador; se incluyen las 28 voces en inglés, diccionarios de pronunciación de misaki 0.9.4, un modelo G2P de respaldo y datos de spaCy `en_core_web_sm` 3.8.0. Para VAD se usa Silero VAD v6.2.1.

El resto de componentes cubren tareas auxiliares: detección de palabras clave con un Zipformer de 3M parámetros entrenado sobre GigaSpeech; embeddings de frases con all-MiniLM-L6-v2 y msmarco-MiniLM-L-6-v3; embeddings estáticos con potion-base-8M y 32M de Minish Lab; segmentación de hablantes con pyannote/segmentation-3.0; detección de contenido con Google Magika; detección de inyección de prompts con Wolf Defender Edge de Patronus (exportación int8/int4 con variante x86); y un modelo derivado de FUTO Swipe para gestos de deslizamiento. No hay información sobre datasets de entrenamiento, número de tokens, RLHF/DPO ni innovaciones de decodificación más allá de las propias de cada arquitectura original.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe mediante FastConformer, Parakeet TDT v3, SenseVoice Small y Whisper (tiny/base/small/turbo).
- Detección de actividad de voz (VAD) con Silero VAD v6.2.1.
- Detección de palabras clave (keyword spotting) con Zipformer 3M.
- Síntesis de voz (TTS) en inglés con Kokoro-82M, 28 voces US/GB, con G2P y diccionarios de pronunciación.
- Generación de embeddings de frases para búsqueda semántica y similitud (MiniLM, msmarco-MiniLM, potion-8M/32M).
- Segmentación de hablantes (diarización) con pyannote segmentation-3.0.
- Detección de inyección de prompts con Wolf Defender Edge.
- Clasificación/detección de tipo de contenido de ficheros con Google Magika.
- Conversión de grafemas a fonemas (G2P) en inglés US.
- Reconocimiento de gestos de escritura deslizante con FUTO Swipe (derivado).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- Transcripción local en apps móviles: integrar Whisper tiny/base/small o Parakeet TDT v3 para dictado y subtitulado sin conexión, aprovechando las exportaciones int8 y el runtime Flutter multiplataforma.
- Asistentes de voz en tiempo real: combinar Silero VAD para segmentar audio, un modelo ASR para transcribir y Kokoro-82M para responder con voz sintetizada, todo en el dispositivo.
- Detección de palabras de activación ("wake words"): usar el Zipformer keyword spotter de 3M parámetros para activar el asistente con bajo consumo.
- Búsqueda semántica offline: generar embeddings con all-MiniLM-L6-v2 o potion-base-8M/32M para indexar y recuperar documentos localmente en apps de notas.
- Moderación y seguridad en LLMs: aplicar Wolf Defender Edge para detectar intentos de inyección de prompts antes de enviar entradas a un modelo generativo.
- Diarización de reuniones: usar pyannote segmentation-3.0 junto con un ASR para separar interlocutores en grabaciones.
- Clasificación de ficheros subidos por el usuario: emplear Magika para identificar el tipo real de contenido y aplicar políticas de seguridad.
- Síntesis de voz para accesibilidad: convertir texto a voz en inglés con Kokoro y sus 28 voces para lectores de pantalla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: depende del submodelo. Whisper tiny (≈39M), base (≈74M) y small (≈244M) caben en cualquier dispositivo moderno; Parakeet TDT 0,6B en int8 requiere aproximadamente 0,6-1 GB; Kokoro-82M en uint8 es muy ligero (decenas de MB); MiniLM y potion son de pocos MB.
- GPU recomendadas: no se especifican; el objetivo es ejecución en CPU/NPU móvil vía ONNX Runtime en Flutter. En escritorio puede usar GPU con los execution providers de ONNX Runtime.
- Cabe en GPU consumer: sí, todos los submodelos están pensados para dispositivos de gama baja y móviles; incluso los más grandes (Parakeet 0,6B, Whisper small) caben en GPUs de 4-8 GB.
- Opciones de despliegue: runtime fonnx sobre ONNX Runtime en Flutter; los ficheros ONNX también pueden ejecutarse con ONNX Runtime, sherpa-onnx u otras herramientas compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| telosnex/fonnx | Repositorio ONNX multi-tarea | Variable por submodelo | No aplica | Per-file | Hugging Face |
| sherpa-onnx (k2-fsa) | Runtime + modelos ONNX | Variable | No aplica | Apache-2.0 (mayoría) | GitHub/HF |
| onnx-community (varios) | Exportaciones ONNX | Variable | No aplica | Según origen | Hugging Face |
| whisper.cpp / ggml | Runtime + modelos GGUF | 39M-1,5B | 30 s por ventana | MIT | GitHub |

La comparación directa es limitada porque `fonnx` es un repositorio de artefactos, no un modelo. Frente a sherpa-onnx comparte muchos ficheros de origen (exportaciones idénticas) pero se orienta a Flutter; frente a onnx-community reutiliza exportaciones y añade divisiones propias (Kokoro); frente a whisper.cpp ofrece un conjunto más amplio de tareas (ASR, TTS, VAD, embeddings) aunque con menos modelos de lenguaje.

## Limitaciones y advertencias

- No es un modelo de lenguaje generativo: no sirve para chat, razonamiento ni generación de texto libre.
- La licencia es heterogénea por fichero; el uso comercial requiere revisar cada licencia (Apache-2.0, MIT, CC-BY-4.0, FunASR Model License, FUTO Model Weights License 1.0).
- Los ficheros `futo_swipe_*.onnx` son una conversión no oficial y obligan a mostrar al usuario que el producto usa tecnología "FUTO Swipe"; no implican patrocinio de FUTO.
- Los ficheros están fijados por commit y SHA-256: no se debe reescribir el historial ni borrar ficheros, o las apps distribuidas fallarán al descargar.
- Idiomas: Kokoro y G2P cubren solo inglés; otros submodelos tienen cobertura variable no documentada a nivel de repositorio.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR/TTS originales; no se documentan evaluaciones de sesgo.
- El repositorio incluye ficheros heredados de versiones anteriores que no están fijados por fonnx; su estabilidad no está garantizada.
- No se dispone de información sobre rendimiento, latencia ni precisión medida en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/telosnex/fonnx
- Proyecto fonnx: https://github.com/Telosnex/fonnx
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Modelos KWS de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/tag/kws-models
- Modelos ASR de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models
- NVIDIA NeMo FastConformer multilingüe: https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nemo/models/stt_multilingual_fastconformer_hybrid_large_pc
- NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Exportación ONNX de Kokoro: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- misaki: https://github.com/hexgrad/misaki
- G2P en inglés US: https://huggingface.co/PeterReid/graphemes_to_phonemes_en_us
- spaCy models: https://github.com/explosion/spacy-models
- Google Magika: https://github.com/google/magika
- all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- msmarco-MiniLM-L-6-v3: https://huggingface.co/sentence-transformers/msmarco-MiniLM-L-6-v3
- Minish Lab (potion): https://huggingface.co/minishlab
- pyannote segmentation-3.0: https://huggingface.co/pyannote/segmentation-3.0
- SenseVoice Small: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Licencia FunASR: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Silero VAD v6.2.1: https://github.com/snakers4/silero-vad/releases/tag/v6.2.1
- Whisper tiny (onnx-community): https://huggingface.co/onnx-community/whisper-tiny
- Whisper tiny (OpenAI): https://huggingface.co/openai/whisper-tiny
- Whisper base (onnx-community): https://huggingface.co/onnx-community/whisper-base
- Whisper small (onnx-community): https://huggingface.co/onnx-community/whisper-small
- Wolf Defender Edge: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-edge
