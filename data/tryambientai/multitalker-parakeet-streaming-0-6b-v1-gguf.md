# tryambientai/multitalker-parakeet-streaming-0.6b-v1-gguf

## Resumen

multitalker-parakeet-streaming-0.6b-v1 es un modelo de reconocimiento automatico del habla (ASR) en ingles desarrollado por NVIDIA, distribuido aqui como conversion GGUF por tryambientai para su uso con el runtime transcribe.cpp. Se trata de un sistema de transcripcion streaming y cache-aware construido sobre un encoder FastConformer con decodificador transducer RNN-T, afinado a partir de nvidia/nemotron-speech-streaming-en-0.6b. Su rasgo diferencial es la capacidad de diarizacion integrada: los bundles GGUF incorporan el diarizador streaming Sortformer (nvidia/diar_streaming_sortformer_4spk-v2.1), lo que permite transcribir hasta cuatro hablantes solapados con etiquetas de hablante.

El modelo resuelve el problema de la transcripcion en tiempo real con atribucion de hablante en un unico artefacto, sin necesidad de encadenar por separado un ASR y un diarizador. Con 739.989.513 parametros totales (etiquetado comercialmente como 0.6B) y un repositorio de 0.9 GB, esta pensado para despliegue en CPU y GPU de consumo, con soporte de aceleracion Metal y Vulkan.

Su relevancia actual radica en la combinacion de latencia baja (mascara de atencion cache-aware con att_context_size=[70, 13], equivalente a 1,12 s), cuantizaciones k-quant que practicamente no degradan el WER (2,18 % en LibriSpeech test-clean frente a 2,19 % en F32) y un formato GGUF ejecutable fuera del ecosistema NeMo. La licencia es la NVIDIA Open Model License, no una licencia open source permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNN-T transducer (decoder); diarizador Sortformer en bundles |
| Parametros totales | 739.989.513 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; ventana de atencion cache-aware att_context_size=[70, 13] (1,12 s) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | GGUF (transcribe.cpp); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer, una variante del Conformer con atencion por bloques que reduce el coste computacional del encoder, acoplada a un decodificador transducer RNN-T. La innovacion central es la mascara de atencion cache-aware con att_context_size=[70, 13], que preserva el contexto de 1,12 s del modelo upstream y habilita inferencia streaming con cuatro configuraciones de lookahead seleccionables. El modelo base fue afinado por NVIDIA desde nvidia/nemotron-speech-streaming-en-0.6b.

En los bundles multitalker se embebe adicionalmente el diarizador streaming Sortformer de nvidia/diar_streaming_sortformer_4spk-v2.1, que opera en paralelo al ASR para asignar hablante a cada token transcrito. La conversion GGUF se realizo desde el commit upstream 8749fc7 (fijado el 2026-07-12) y se valido contra la referencia NeMo en el commit 3083021 de transcribe.cpp el 2026-08-03. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Transcripcion de voz a texto en ingles, en modo offline y streaming cache-aware.
- Puntuacion y capitalizacion automaticas (PnC) en la salida.
- Diarizacion integrada con hasta cuatro hablantes solapados mediante `--diarize` en los bundles GGUF.
- Timestamps a nivel de token.
- Seleccion entre cuatro configuraciones de lookahead de latencia.
- Decodificacion greedy RNN-T.
- Modo `single_speaker_mode` para los GGUF simples (sin diarizacion).
- No soporta traduccion (`translate: false`).
- No soporta deteccion de idioma (`lang_detect: false`).
- No soporta otros idiomas distintos del ingles.

## Casos de uso

- Transcripcion de reuniones y actas: los bundles multitalker permiten generar un acta con hablantes etiquetados (hasta cuatro) en una sola pasada, sin pipeline separado de diarizacion; el cpWER de 19,35 % en AMI-IHM test (16 reuniones) es indicativo del rendimiento en este escenario.
- Subtitulado y transcripcion en directo: la mascara cache-aware con contexto de 1,12 s y los cuatro niveles de lookahead permiten ajustar la latencia al flujo de audio en emisiones o videollamadas.
- Notas de voz y dictado en aplicaciones de escritorio: con Q4_K_M (617 MB) o Q5_K_M (681 MB) cabe en memoria de sistemas modestos y se ejecuta en CPU con un RTF de 13,41 en Ryzen 4750U.
- Despliegue en macOS con aceleracion Metal: el RTF medido en M4 es de 32,72 en CPU y 217,47 en Metal, lo que viabiliza transcripcion en tiempo real en portatiles Apple.
- Analisis de llamadas de atencion al cliente: la diarizacion a cuatro hablantes y los timestamps por token permiten segmentar intervenciones de agente y cliente para auditoria o analitica.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: el formato GGUF y el runtime transcribe.cpp evitan dependencias de CUDA o NeMo, simplificando el empaquetado en contenedores.
- Transcripcion de entrevistas y grupos focales: la salida con etiquetas de hablante reduce el trabajo manual de postprocesado en investigacion cualitativa.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| LibriSpeech test-clean (offline, 2.620 enunciados) | WER F32 | 2,19 % |
| LibriSpeech test-clean (offline) | WER F16 | 2,19 % |
| LibriSpeech test-clean (offline) | WER Q8_0 | 2,18 % |
| LibriSpeech test-clean (offline) | WER Q6_K | 2,20 % |
| LibriSpeech test-clean (offline) | WER Q5_K_M | 2,18 % |
| LibriSpeech test-clean (offline) | WER Q4_K_M | 2,18 % |
| FLEURS en | WER Q8_0 | 6,52 % |
| AMI-IHM test (16 reuniones, bundle F32) | cpWER kernel | 19,35 % |
| AMI-IHM test (16 reuniones, bundle F32) | cpWER masked | 23,73 % |
| Referencia NeMo, AMI-IHM test | cpWER kernel / masked | 21,39 % / 24,00 % |
| Ryzen 4750U | RTF CPU | 13,41 |
| Ryzen 4750U | RTF Vulkan | 26,34 |
| Apple M4 | RTF CPU | 32,72 |
| Apple M4 | RTF Metal | 217,47 |

La referencia NeMo en modo `single_speaker_mode` y el dato autodeclarado por NVIDIA en LibriSpeech test-clean coinciden ambos en 2,19 % de WER. La evaluacion se realizo con decodificacion greedy RNN-T y normalizador whisper (puntuacion y capitalizacion eliminadas para el calculo).

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB en F32, 1,5 GB en F16 y entre 0,6 y 0,9 GB en cuantizaciones k-quant (Q4_K_M a Q8_0), segun el tamano de archivo publicado.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; el modelo esta validado con aceleracion Metal (Apple M4) y Vulkan (Ryzen 4750U con GPU integrada).
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 1-3 GB de memoria libre segun cuantizacion; tambien funciona en CPU pura.
- Opciones de despliegue: transcribe.cpp (runtime de referencia, repositorio de handy-computer); no se indica soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: RTF de 13,41 (CPU Ryzen 4750U), 26,34 (Vulkan Ryzen 4750U), 32,72 (CPU M4) y 217,47 (Metal M4). No se proporcionan cifras de latencia absoluta en milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Diarizacion | Licencia | Formato |
|---|---|---|---|---|---|---|
| multitalker-parakeet-streaming-0.6b-v1 (esta ficha) | 739.989.513 | att_context_size=[70, 13], 1,12 s | en | si (Sortformer, 4 hablantes) | nvidia-open-model-license | GGUF |
| nvidia/multitalker-parakeet-streaming-0.6b-v1 | no disponible | att_context_size=[70, 13], 1,12 s | en | si (Sortformer, 4 hablantes) | nvidia-open-model-license | safetensors (NeMo) |
| nvidia/nemotron-speech-streaming-en-0.6b | no disponible | no disponible | en | no | nvidia-open-model-license | no disponible |
| nvidia/diar_streaming_sortformer_4spk-v2.1 | no disponible | no disponible | no aplica (diarizador) | si (4 hablantes) | no disponible | no disponible |

El modelo base y esta conversion comparten arquitectura y pesos; las diferencias son el formato (GGUF frente a safetensors/NeMo) y el runtime (transcribe.cpp frente a NeMo). El modelo del que se afino, nemotron-speech-streaming-en-0.6b, carece de diarizacion integrada. No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada mas alla de las referencias NeMo ya citadas.

## Limitaciones y advertencias

- Solo admite ingles; no hay soporte multilingue ni deteccion de idioma.
- No realiza traduccion.
- La diarizacion esta limitada a cuatro hablantes solapados como maximo.
- El rendimiento en audio con ruido, acentos no nativos o dominios muy alejados del entrenamiento no esta documentado en la informacion disponible.
- Riesgo de alucinacion en pasajes de silencio o audio de baja calidad, comun en modelos transducer; no cuantificado en la informacion proporcionada.
- La licencia nvidia-open-model-license no es una licencia open source permisiva: conviene revisar sus terminos antes de uso comercial o redistribucion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la conversion no procede del autor original del modelo, sino de un tercero (tryambientai); la validacion se realizo contra la referencia NeMo, pero la trazabilidad de futuras actualizaciones depende de ese tercero.
- El cpWER en AMI-IHM (19,35 % en modo kernel) es sensiblemente superior al WER en audio limpio; en escenarios de reunion reales la precision es notablemente menor.
- No se documentan sesgos demograficos o acusticos especificos en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tryambientai/multitalker-parakeet-streaming-0.6b-v1-gguf
- Modelo base: https://huggingface.co/nvidia/multitalker-parakeet-streaming-0.6b-v1
- Commit upstream de referencia: https://huggingface.co/nvidia/multitalker-parakeet-streaming-0.6b-v1/commit/8749fc7
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3083021
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Papers referenciados en los tags: arxiv:2506.22646, arxiv:2408.13106, arxiv:2305.05084, arxiv:2409.06656, arxiv:2507.18446, arxiv:1706.03762, arxiv:2310.12371
