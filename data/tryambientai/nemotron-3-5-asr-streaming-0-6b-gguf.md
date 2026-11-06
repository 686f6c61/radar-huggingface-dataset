# tryambientai/nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

Nemotron 3.5 ASR streaming 0.6B es un modelo de reconocimiento automático del habla (ASR) desarrollado por NVIDIA, publicado originalmente como `nvidia/nemotron-3.5-asr-streaming-0.6b`. Esta ficha corresponde a la conversión a formato GGUF realizada por el usuario `tryambientai` para su uso con el runtime `transcribe.cpp`, una implementación en C++ orientada a inferencia local eficiente. El modelo resuelve el problema de la transcripción multilingüe en tiempo real sobre hardware modesto, combinando un encoder FastConformer cache-aware con un decoder RNN-T transductor condicionado por prompt de idioma.

Con 637.991.968 parámetros (aproximadamente 0,6B), el modelo está diseñado específicamente para streaming: soporta tanto la ruta offline de alta precisión (`att_context_size=[56, 13]`, ventana de 1,12 s) como un modo fragmentado configurable en tiempo de ejecución mediante `--stream-chunk-ms` y `--stream-att-right`. Cubre 32 locales de idioma plenamente soportados (el tokenizer reconoce 40, pero 8 requieren fine-tuning), con puntuación y capitalización automáticas.

La relevancia actual del modelo radica en su relación entre tamaño, latencia y calidad: un WER del 7,97 % en FLEURS inglés (offline) y del 3,04 % en LibriSpeech test-clean con pesos F32, con un rendimiento en tiempo real (RTF) de 98x en Metal sobre un Apple M4 Max y de 14,5x en Vulkan sobre un Ryzen 4750U. Esto lo sitúa como una opción viable para transcripción en dispositivos de consumo y entornos embebidos, algo poco habitual en modelos ASR multilingües de esta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware (encoder) + RNN-T transducer (decoder) condicionado por prompt de idioma |
| Parametros totales | 637.991.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; ventana de atencion offline `att_context_size=[56, 13]` (1,12 s); streaming configurable via `--stream-chunk-ms` y `--stream-att-right {0,3,6,13}` |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 32 locales (en, es, fr, it, pt, nl, de, tr, ru, ar, hi, ja, ko, vi, uk, pl, sv, cs, nb, da, bg, fi, hr, sk, zh, hu, ro, et); tokenizer reconoce 40, 8 adicionales requieren fine-tuning |
| Licencia | OpenMDW-1.1 (heredada del modelo base NVIDIA) |
| Formato de pesos | GGUF (para `transcribe.cpp`) |

## Arquitectura y entrenamiento

El modelo combina un encoder FastConformer con atención cache-aware, lo que permite reutilizar el estado de atención entre fragmentos de audio consecutivos sin recalcular el contexto completo. El decoder es un transductor RNN-T condicionado por prompt: el idioma objetivo se selecciona por llamada (`--language en-US`, `fr-FR`, `de-DE`, etc.) y existe un modo automático que emite una etiqueta `<lang-XX>` para la detección de idioma. Esta combinación es la habitual en la familia Parakeet de NVIDIA y está documentada en los papers arXiv:2312.17279 y arXiv:2305.05084.

La conversión GGUF se realizó a partir del commit upstream `24b151a` (fijado el 2026-06-08) y se validó numéricamente contra la referencia NeMo en el commit `909e94e` de `transcribe.cpp`. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La innovación técnica principal es la doble ruta offline/streaming seleccionable en tiempo de ejecución, que permite al mismo artefacto operar con máxima precisión o con baja latencia según el caso de uso.

## Capacidades

- Transcripción de voz a texto multilingüe en 32 locales con puntuación y capitalización automáticas.
- Detección automática de idioma mediante etiqueta `<lang-XX>` en modo auto.
- Streaming en tiempo real con fragmentos configurables (`--stream-chunk-ms`) y ventana de atención derecha ajustable (`--stream-att-right`).
- Ruta offline de alta precisión con `att_context_size=[56, 13]` y ventana de 1,12 s.
- Selección explícita de idioma por llamada (`--language en-US`, `fr-FR`, etc.).
- Timestamps a nivel de token.
- No soporta traducción (`translate: false`).
- No dispone de tool calling, function calling ni capacidades de agente (es un modelo puramente ASR).

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo procesa audio de 16 kHz mono WAV con RTF de 98x en Metal sobre un M4 Max, lo que permite transcribir horas de audio en minutos sin conexión a servicios en la nube.
- Subtitulado en directo de vídeo multilingüe: el modo streaming con fragmentos de 1120 ms y `--stream-att-right` ajustable permite generar subtítulos con latencia controlada en 32 idiomas, útil para plataformas de formación o retransmisiones.
- Asistentes de voz embebidos: con cuantización Q4_K_M (473 MB) y RTF de 14,5x en Vulkan sobre un Ryzen 4750U, el modelo cabe en dispositivos de gama media y puede alimentar dictado por voz en aplicaciones de escritorio.
- Indexación y búsqueda de archivos de audio: la transcripción con timestamps a nivel de token facilita la creación de índices buscables sobre archivos de audio corporativos o podcasts.
- Atención al cliente con análisis de llamadas: la transcripción multilingüe con detección automática de idioma permite procesar grabaciones de centros de contacto en varios idiomas con un único modelo.
- Investigación lingüística y corpus multilingües: la cobertura de 32 locales con puntuación y capitalización facilita la generación de corpus anotados para estudios comparativos entre idiomas.
- Accesibilidad: transcripción en tiempo real de conversaciones presenciales o videollamadas en hardware de consumo, integrable en aplicaciones de ayuda a personas con discapacidad auditiva.

## Benchmarks y rendimiento

WER medido por el autor de la conversión (greedy RNN-T, `--language en-US`, normalizador whisper):

| Cuantizacion | Tamano | WER FLEURS en | WER LibriSpeech test-clean |
|---|---:|---:|---:|
| F32 | 2,38 GB | 7,97 % | 3,04 % |
| F16 | 1,19 GB | 7,97 % | 3,03 % |
| Q8_0 | 716 MB | 7,88 % | 3,06 % |
| Q6_K | 593 MB | 8,02 % | 3,07 % |
| Q5_K_M | 534 MB | 8,15 % | 3,10 % |
| Q4_K_M | 473 MB | 8,49 % | 3,28 % |

Referencia NeMo sobre el mismo manifiesto: 7,99 % en FLEURS en (NVIDIA reporta 7,91 % en en-US) y 3,03 % en LibriSpeech test-clean.

Rendimiento en tiempo real (RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 98 |
| Apple M4 Max | CPU | 29 |
| AMD Ryzen 4750U | Vulkan | 14,5 |
| AMD Ryzen 4750U | CPU | 7,5 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4 GB en F32, 1,2 GB en F16, 716 MB en Q8_0 y 473 MB en Q4_K_M (los tamanos de archivo sirven como cota superior práctica).
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon M-series) o Vulkan (AMD, Intel, NVIDIA) es suficiente; no requiere GPU de datacenter.
- Cabe en GPU de consumo: sí, incluso en iGPU y en GPUs de gama baja con 2 GB o más de memoria; la cuantización Q4_K_M permite ejecución en CPU.
- Opciones de despliegue: `transcribe.cpp` (runtime principal, compilado desde fuente con CMake); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: RTF de 98x en Metal sobre M4 Max y 14,5x en Vulkan sobre Ryzen 4750U; el modo streaming introduce fragmentos de 1120 ms configurables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR streaming 0.6B (GGUF) | 0,64B | Streaming cache-aware + offline | 3,04 % (F32) | OpenMDW-1.1 | Hugging Face |
| Whisper large-v3 | no disponible | Offline | no disponible en esta ficha | MIT | Hugging Face |
| Parakeet TDT 0.6B (NVIDIA) | ~0,6B | Offline | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone en la información proporcionada de datos de benchmarks de los modelos comparables para establecer una comparación cuantitativa rigurosa. Las cifras de WER del modelo de esta ficha son las reportadas por el autor de la conversión GGUF.

## Limitaciones y advertencias

- Modelo puramente ASR: no genera texto libre, no razona, no hace tool calling ni soporta agentes.
- No soporta traducción entre idiomas (`translate: false`); solo transcribe en el idioma detectado o seleccionado.
- De los 40 idiomas que reconoce el tokenizer, 8 requieren fine-tuning para un rendimiento adecuado; los 32 restantes están plenamente soportados.
- El WER degrada con cuantizaciones agresivas: Q4_K_M sube a 8,49 % en FLEURS en frente a 7,97 % en F32, y a 3,28 % en LibriSpeech frente a 3,04 %.
- Riesgo de alucinación inherente a los modelos transductores en segmentos de silencio o ruido; no se documentan mitigaciones específicas en la información disponible.
- Licencia OpenMDW-1.1: es necesario revisar los términos completos en la model card upstream de NVIDIA antes de uso comercial.
- La conversión GGUF está validada contra NeMo en un commit concreto; cambios en `transcribe.cpp` pueden alterar la paridad numérica.
- No se documentan sesgos específicos por idioma o acento en la información proporcionada.
- Requiere audio de entrada a 16 kHz mono WAV; es necesario remuestrear con ffmpeg u otra herramienta.

## Enlaces

- Hugging Face (esta conversión GGUF): https://huggingface.co/tryambientai/nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Commit upstream fijado: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/commit/24b151a
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/909e94e
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/nemotron-3.5-asr-streaming-0.6b.md
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper relacionado (arXiv:2312.17279): https://arxiv.org/abs/2312.17279
- Licencia OpenMDW-1.1: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
