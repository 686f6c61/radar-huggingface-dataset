# wq2012/tec_multi_interfering

## Resumen

`TecMultiInterfering` es un modelo de cancelación de eco textual (Textual Echo Cancellation, TEC) desarrollado por el usuario wq2012 como reproducción de código abierto del trabajo presentado en IEEE SLT 2021 (arXiv:2008.06006). No es un modelo de lenguaje, sino un modelo de mejora de voz (speech enhancement) que separa la voz del usuario de una señal de micrófono contaminada por voces interferentes sintetizadas por un sistema TTS, usando como única información auxiliar la transcripción del texto TTS interferente (side input de menos de 0,1 KB). Está construido sobre Lingvo y TensorFlow.

La arquitectura es un modelo sequence-to-sequence con atención multi-fuente: un encoder (`SpeechEncoderV1`) consume el espectrograma log-Mel reverberante del micrófono y un segundo encoder (`TtsEncoderV2`) consume el texto TTS, y el decoder reconstruye el espectrograma log-Mel limpio del usuario. Se entrenó sobre voz de 24 kHz de LibriTTS mezclada a 0 dB de SNR con CSTR VCTK reverberado (interferencia de 109 hablantes TTS).

Es relevante dentro del nicho de acústica de dispositivos y asistentes de voz: aborda el problema de la cancelación de eco acústico (AEC) en escenarios donde el eco ya no es la propia señal reproducida, sino voces de un TTS ajeno, y lo hace con una huella de side input extremadamente pequeña (0,037 KB) frente a los 186,9 KB de un AEC-NLMS convencional. El repositorio ocupa 0,3 GB e incluye un checkpoint de Lingvo y un modelo TensorFlow Lite cuantizado para inferencia en dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sequence-to-sequence con atencion multi-fuente (SpeechEncoderV1 + TtsEncoderV2), implementada en Lingvo/TensorFlow |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio; opera sobre espectrogramas log-Mel, no sobre tokens de texto) |
| Tipos de cuantizacion | Cuantizacion dynamic-range en el artefacto TensorFlow Lite (`model.tflite`); checkpoint original en precision de entrenamiento |
| Idiomas soportados | no disponible (los datasets de entrenamiento son en ingles: LibriTTS y CSTR VCTK) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint TensorFlow/Lingvo (`best.ckpt.data-00000-of-00001`, `best.ckpt.index`, `best.ckpt.meta`, `checkpoint`) y FlatBuffer TensorFlow Lite (`model.tflite`) |

## Arquitectura y entrenamiento

El modelo es un seq2seq con atención multi-fuente. Dos encoders procesan entradas distintas: `SpeechEncoderV1` toma el espectrograma log-Mel del micrófono (señal mezclada y reverberante) y `TtsEncoderV2` toma la transcripción del texto TTS interferente, un side input de menos de 0,1 KB. Un decoder condicionado sobre ambas representaciones reconstruye el espectrograma log-Mel limpio de la voz del usuario. La implementación usa Lingvo y TensorFlow, y según la model card corresponde a una reproducción independiente de código abierto, sin recurrir al código propietario interno de Google ni a su infraestructura de datos.

Los datos de entrenamiento combinan voz de usuario de LibriTTS a 24 kHz mezclada a 0 dB de SNR con voz reverberante de CSTR VCTK (109 hablantes TTS). La evaluación reportada se realiza con respuestas al impulso sintéticas de sala con RT60 de 0,25 s, y la métrica ASR (WER) se calcula con `Qwen3-ASR-0.6B-F16` a través de `audio.cpp`, mientras que la distorsión espectral se mide con MCD sobre 13 coeficientes MFCC con Dynamic Time Warping. No se especifica en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (poco habituales en este tipo de modelos de audio).

## Capacidades

- Mejora de voz (speech enhancement): reconstruye el espectrograma log-Mel limpio del usuario a partir de una señal de micrófono contaminada.
- Cancelación de eco textual (TEC): utiliza la transcripción del texto reproducido por el TTS como guía para eliminar la voz interferente.
- Manejo de múltiples voces interferentes: entrenado específicamente para el escenario de interferencia con LibriTTS + VCTK (varios hablantes TTS simultáneos).
- Robustez ante reverberación: evaluación con respuestas al impulso sintéticas de sala (RT60 = 0,25 s).
- Side input extremadamente ligero: 0,037 KB (test-clean) y 0,039 KB (test-other), frente a los 186,9 KB de un AEC-NLMS.
- Inferencia en dispositivo: artefacto TensorFlow Lite cuantizado en rango dinámico.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni generación de texto: es un modelo puramente acústico.

## Casos de uso

- Cancelación de eco en asistentes de voz: cuando un dispositivo reproduce una respuesta TTS y el micrófono la recaptura, el modelo usa el texto de esa respuesta como guía para eliminar la voz sintetizada y conservar la del usuario.
- Limpieza de audio en reuniones con múltiples hablantes TTS: en entornos donde varios canales de síntesis de voz se solapan con la voz del usuario, la atención multi-fuente permite separar la señal útil.
- Preprocesado para sistemas ASR: al reducir el WER de la señal mezclada (de 34,17 % a 26,63 % en test-clean en la comparativa reportada), se puede usar como etapa previa a un reconocedor de voz.
- Despliegue en dispositivos de borde (edge): el modelo TFLite cuantizado y los 6,90 GFLOPS de complejidad permiten ejecución en hardware embebido o móvil sin GPU dedicada.
- Telefonía y VoIP con reproducción simultánea: escenarios de altavoz abierto donde el eco proviene de voces TTS de otro participante.
- Investigación en AEC basado en side information: sirve como referencia reproducible para comparar estrategias de cancelación guiada por texto frente a enfoques de señal clásicos (NLMS).
- Robótica y kioscos interactivos: dispositivos que hablan y escuchan a la vez y necesitan aislar la voz del usuario frente a su propio audio sintetizado.

## Benchmarks y rendimiento

Evaluación del modelo `TecMultiInterfering` (condición de múltiples voces interferentes con LibriTTS + VCTK, RT60 = 0,25 s) frente a la referencia del paper:

| Metrica | test-clean | test-other | Referencia del paper (TEC propuesto) |
|---|---|---|---|
| WER (%) ↓ | 26,63 % (53/199) | 45,27 % (110/243) | 14,8 % / 32,5 % |
| MCD (dB) ↓ | 7,96 dB | 8,40 dB | 6,46 dB / 7,71 dB |
| Tamano del side input (KB) ↓ | 0,037 KB | 0,039 KB | 0,06 KB |
| Complejidad computacional ↓ | 6,90 GFLOPS | 6,90 GFLOPS | 6,90 GFLOPS |

Comparativa publicada por el autor frente a otras condiciones y métodos (subconjunto relevante para múltiples voces interferentes):

| Metodo | Modelo en Hugging Face | WER test-clean ↓ | WER test-other ↓ | MCD test-clean ↓ | MCD test-other ↓ | Side input test-clean (KB) ↓ |
|---|---|---|---|---|---|---|
| GroundTruth | — | 5,03 | 7,82 | 0,00 | 0,00 | 0,000 |
| MicrophoneSignal | — | 34,17 | 48,97 | 7,67 | 7,70 | 0,000 |
| NlmsAec (AEC-NLMS) | — | 28,64 | 34,98 | 7,92 | 8,40 | 186,922 |
| NoSideInputMultiInterfering | wq2012/vanilla_seq2seq_multi_interfering | 31,16 | 42,39 | 7,93 | 8,72 | 0,000 |
| AecMultiInterfering | wq2012/aec_multi_interfering | 8,54 | 22,22 | 7,80 | 7,88 | 186,922 |
| TecMultiInterfering | wq2012/tec_multi_interfering | 26,63 | 45,27 | 7,96 | 8,40 | 0,037 |

## Requisitos de hardware

- Tamano del repositorio: 0,3 GB (incluye checkpoint de TensorFlow/Lingvo y modelo TFLite).
- VRAM estimada para inferencia: no disponible de forma explicita; dado el tamano del repositorio y los 6,90 GFLOPS reportados, es un modelo de baja huella apto para inferencia en CPU.
- GPU recomendadas: no especificadas en la informacion disponible. El modelo esta disenado para inferencia en dispositivo mediante TensorFlow Lite, por lo que no requiere GPU de datacenter (A100, H100) para su uso previsto.
- Compatibilidad con GPU de consumo: no disponible de forma explicita, pero el artefacto TFLite cuantizado esta pensado para hardware de borde y movil.
- Opciones de despliegue: TensorFlow/Lingvo para el checkpoint original; runtime TensorFlow Lite para `model.tflite`; paquete PyPI `textual-echo-cancellation` para inferencia por CLI o API Python.
- Latencia y throughput estimados: no disponibles; unica cifra publicada de coste computacional, 6,90 GFLOPS por inferencia.

## Comparativa con modelos similares

| Modelo | Condicion | WER test-clean ↓ | WER test-other ↓ | MCD test-clean ↓ | Side input (KB) ↓ | Licencia |
|---|---|---|---|---|---|---|
| wq2012/tec_multi_interfering | Multiples voces interferentes | 26,63 | 45,27 | 7,96 | 0,037 | Apache 2.0 |
| wq2012/tec_single_interfering | Voz interferente unica | 21,61 | 46,89 | 8,24 | 0,076 | Apache 2.0 |
| wq2012/aec_multi_interfering | Multiples voces interferentes (AEC) | 8,54 | 22,22 | 7,80 | 186,922 | Apache 2.0 |
| wq2012/vanilla_seq2seq_multi_interfering | Multiples voces interferentes (sin side input) | 31,16 | 42,39 | 7,93 | 0,000 | Apache 2.0 |

## Limitaciones y advertencias

- El WER de la reproduccion de codigo abierto supera al del paper de referencia (26,63 % frente a 14,8 % en test-clean; 45,27 % frente a 32,5 % en test-other), por lo que el rendimiento es inferior al descrito en la publicacion original.
- El MCD tambien es superior al de la referencia (7,96 dB frente a 6,46 dB en test-clean), lo que indica mayor distorsion espectral.
- Modelo especializado exclusivamente en mejora de voz y cancelacion de eco; no genera texto, no razona y no soporta tool calling ni agentes.
- Depende de la transcripcion del texto TTS interferente como side input; si esa transcripcion no esta disponible o es inexacta, el mecanismo de guia textual pierde eficacia.
- Entrenado y evaluado con datos en ingles (LibriTTS y CSTR VCTK); no hay informacion sobre el comportamiento en otros idiomas.
- Evaluacion basada en respuestas al impulso sinteticas (RT60 = 0,25 s), no en grabaciones reales de sala, lo que puede sobreestimar el rendimiento en condiciones reales.
- El autor no ha publicado el numero total de parametros, ni la composicion exacta del dataset, ni los detalles de la fase de optimizacion.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento (LibriTTS, CSTR VCTK) para despliegues en produccion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero el modelo puede reconstruir espectrogramas que no correspondan fielmente a la voz original, especialmente en condiciones de baja SNR o reverberacion alta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/tec_multi_interfering
- Repositorio GitHub: https://github.com/wq2012/tec
- Paquete PyPI: https://pypi.org/project/textual-echo-cancellation/
- Paper (IEEE SLT 2021, arXiv:2008.06006v4): https://arxiv.org/pdf/2008.06006
- Pagina de demos de audio: https://google.github.io/speaker-id/publications/TEC/
- Modelo relacionado: https://huggingface.co/wq2012/tec_single_interfering
- Modelo relacionado: https://huggingface.co/wq2012/aec_multi_interfering
- Modelo relacionado: https://huggingface.co/wq2012/aec_single_interfering
- Modelo relacionado: https://huggingface.co/wq2012/vanilla_seq2seq_multi_interfering
- Modelo relacionado: https://huggingface.co/wq2012/vanilla_seq2seq_single_interfering
