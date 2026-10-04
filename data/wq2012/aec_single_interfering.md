# wq2012/aec_single_interfering

## Resumen

`wq2012/aec_single_interfering` (nombre interno `AecSingleInterfering`) es un modelo neuronal de cancelación de eco acústico (AEC, *Acoustic Echo Cancellation*) basado en una arquitectura sequence-to-sequence con atención multi-fuente, publicado en Hugging Face por el usuario `wq2012`. Forma parte de la reproducción open source del trabajo *Textual Echo Cancellation* (IEEE SLT 2021, arXiv:2008.06006v4), implementada con la librería Lingvo y TensorFlow, sin usar código propietario de Google.

El modelo aborda un problema clásico en dispositivos con reproducción y captura simultánea (altavoces y micrófono): eliminar del micrófono la señal del altavoz (el eco). La particularidad de esta variante es que, además de la señal mixta del micrófono, recibe como entrada lateral la señal de referencia del altavoz ("single interfering voice"), es decir, una única voz interferente sintetizada con LJ Speech. Se entrenó sobre voz de usuario de LibriTTS a 24 kHz mezclada a 0 dB de SNR con LJ Speech reverberado. El checkpoint incluye también una versión cuantizada en TensorFlow Lite (`model.tflite`) para inferencia en dispositivo.

La relevancia actual del modelo es doble: por un lado, sirve como baseline reproducible y comparable frente a variantes más eficientes como `TecSingleInterfering` (que reduce la entrada lateral de 243 KB a 0,076 KB); por otro, demuestra que un modelo seq2seq con doble codificador de audio puede superar ampliamente a un AEC clásico NLMS en condiciones de eco reverberado. El repositorio ocupa 0,2 GB y no registra descargas ni *likes* en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sequence-to-sequence con atención multi-fuente y doble codificador de audio (`SpeechEncoderV1`), implementada en Lingvo/TensorFlow |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; la model card no especifica duración de ventana) |
| Tipos de cuantización | Dynamic-range quantized TensorFlow Lite (`model.tflite`); checkpoint TensorFlow/Lingvo en precisión no especificada |
| Idiomas soportados | no disponible como soporte declarado; los corpus de entrenamiento (LibriTTS, LJ Speech) son en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint TensorFlow/Lingvo (`best.ckpt.data-00000-of-00001`, `best.ckpt.index`, `best.ckpt.meta`, `checkpoint`) y TensorFlow Lite FlatBuffer (`model.tflite`) |

Otros datos técnicos declarados: frecuencia de muestreo de 24 kHz, complejidad computacional de 9,51 GFLOPS, tamaño de entrada lateral de 243,465 KB (`test-clean`) y 209,085 KB (`test-other`).

## Arquitectura y entrenamiento

El modelo es un seq2seq con atención multi-fuente que emplea dos codificadores de audio `SpeechEncoderV1`: uno procesa la mezcla captada por el micrófono y el otro procesa la señal de referencia completa del altavoz (la reproducción TTS). La señal de referencia actúa como entrada lateral (*side input*) de aproximadamente 240-310 KB, lo que permite al decodificador disponer de información sobre la voz interferente que debe eliminar. La salida es un espectrograma log-Mel de la señal limpia estimada.

El entrenamiento se realizó sobre voz de usuario de LibriTTS a 24 kHz mezclada a 0 dB de SNR con audio reverberado de LJ Speech (interferencia de una sola voz). La evaluación se hizo sobre `test-clean` y `test-other` de LibriTTS, mezclados a 0 dB de SNR con respuestas impulsivas de sala sintéticas (RT60 = 0,25 s) en la condición "single interfering voice". No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (poco habituales en modelos de mejora de voz). El proyecto se presenta explícitamente como una reproducción open source independiente sobre Lingvo, sin infraestructura de entrenamiento interna de Google.

## Capacidades

- Cancelación de eco acústico en la condición de una única voz interferente, con supresión de la señal de reproducción captada por el micrófono.
- Aprovechamiento de una entrada lateral de referencia (señal TTS completa) para guiar la supresión del eco.
- Mejora de la señal de voz: reconstrucción de un espectrograma log-Mel limpio a partir de la mezcla.
- Inferencia en dispositivo mediante el modelo TFLite cuantizado de rango dinámico.
- Evaluación orientada a inteligibilidad (WER calculado con reconocimiento automático de voz) y a distorsión espectral (MCD con 13 coeficientes MFCC y DTW).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni modo "thinking".
- Capacidad multilingüe: no disponible; los datos de entrenamiento y evaluación son en inglés.

## Casos de uso

- Cancelación de eco en llamadas manos libres: el modelo puede limpiar la señal del micrófono cuando el altavoz está reproduciendo audio, usando la propia señal de reproducción como referencia lateral, y así mejorar la inteligibilidad en el extremo receptor.
- Preprocesado para ASR en dispositivos con altavoz: al reducir el WER de 90,45 % (señal de micrófono sin procesar) a 12,06 % en `test-clean`, la salida del modelo puede alimentar directamente un reconocedor en escenarios de conversación con eco.
- Videoconferencia en salas pequeñas con reverberación moderada: la evaluación con RT60 = 0,25 s cubre condiciones realistas de oficina o sala doméstica, donde el eco reververado degrada la señal.
- Sistemas de asistente por voz con reproducción simultánea de TTS: si el asistente necesita escuchar al usuario mientras habla (barge-in), la referencia del TTS se usa como entrada lateral para cancelar su propio eco.
- Despliegue en dispositivo con recursos limitados: el `model.tflite` cuantizado permite ejecutar la inferencia en hardware de bajo consumo, aunque la model card no detalla latencias concretas.
- Investigación y benchmarking de AEC neuronal: sirve como baseline reproducible frente a `TecSingleInterfering`, NLMS y variantes sin entrada lateral, con métricas WER y MCD verificadas en `evaluation_metrics.json`.
- Mejora de audio previa a transcripción de reuniones grabadas: cuando se dispone del audio de reproducción por separado, el modelo puede usarse en post-proceso para separar la voz del participante remoto.

## Benchmarks y rendimiento

Resultados de la reproducción open source, evaluados sobre LibriTTS a 24 kHz mezclado a 0 dB de SNR con respuestas impulsivas sintéticas (RT60 = 0,25 s), con WER calculado con `Qwen3-ASR-0.6B-F16` vía `audio.cpp` y MCD con DTW de 13 MFCC:

| Métrica | `test-clean` | `test-other` | Referencia del paper (`AEC-Seq2seq`) |
|---|---|---|---|
| WER (%) ↓ | 12,06 % (24/199) | 23,16 % (41/177) | 8,30 % / 24,3 % |
| MCD (dB) ↓ | 8,85 dB | 9,86 dB | 6,38 dB / 7,07 dB |
| Entrada lateral (KB) ↓ | 243,465 KB | 209,085 KB | 310 KB |
| Complejidad computacional ↓ | 9,51 GFLOPS | 9,51 GFLOPS | 9,51 GFLOPS |

Comparativa completa publicada por el autor para la condición de una única voz interferente (LibriTTS + LJ Speech):

| Método | Modelo en Hugging Face | WER test-clean ↓ | WER test-other ↓ | MCD test-clean ↓ | MCD test-other ↓ | Entrada lateral test-clean (KB) ↓ |
|---|---|---|---|---|---|---|
| `GroundTruth` | — | 3,52 | 6,78 | 0,00 | 0,00 | 0,000 |
| `MicrophoneSignal` | — | 90,45 | 114,12 | 12,86 | 14,61 | 0,000 |
| `NlmsAec` | — | 88,44 | 107,34 | 12,80 | 14,48 | 243,465 |
| `NoSideInputSingleInterfering` | `wq2012/vanilla_seq2seq_single_interfering` | 45,23 | 91,53 | 9,58 | 11,34 | 0,000 |
| `AecSingleInterfering` | `wq2012/aec_single_interfering` | 12,06 | 23,16 | 8,85 | 9,86 | 243,465 |
| `TecSingleInterfering` | `wq2012/tec_single_interfering` | 21,61 | 46,89 | 8,24 | 9,28 | 0,076 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la model card no publica el número de parámetros ni el consumo de memoria.
- Complejidad computacional declarada: 9,51 GFLOPS por inferencia.
- GPU recomendadas: no disponible. No se especifican modelos de GPU objetivos.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen. El repositorio incluye un modelo TensorFlow Lite con cuantización de rango dinámico descrito por el autor como apto para inferencia en dispositivo (*on-device*), lo que apunta a perfiles de cómputo reducidos, pero sin cifras publicadas de memoria.
- Opciones de despliegue: TensorFlow/Lingvo con el checkpoint `best.ckpt` (vía el paquete `textual-echo-cancellation` y `scripts/inference.py`), o TensorFlow Lite con `model.tflite`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de audio.
- Latencia y throughput: no disponibles. El pipeline `audio` y el número de descargas figuran como no disponibles o cero en Hugging Face.

## Comparativa con modelos similares

| Modelo | Condición | WER test-clean ↓ | WER test-other ↓ | MCD test-clean ↓ | Entrada lateral (KB) ↓ | Licencia / disponibilidad |
|---|---|---|---|---|---|---|
| `wq2012/aec_single_interfering` | Una voz interferente | 12,06 | 23,16 | 8,85 | 243,465 | Apache-2.0 en Hugging Face |
| `wq2012/tec_single_interfering` | Una voz interferente | 21,61 | 46,89 | 8,24 | 0,076 | Disponible en Hugging Face |
| `wq2012/vanilla_seq2seq_single_interfering` | Una voz interferente | 45,23 | 91,53 | 9,58 | 0,000 | Disponible en Hugging Face |
| `wq2012/aec_multi_interfering` | Múltiples voces | 8,54 | 22,22 | 7,80 | 186,922 | Disponible en Hugging Face |
| `NlmsAec` (AEC-NLMS clásico) | Una voz interferente | 88,44 | 107,34 | 12,80 | 243,465 | Baseline, sin modelo publicado |
| `AEC-Seq2seq` (paper) | Una voz interferente | 8,30 | 24,30 | 6,38 | 310 | Referencia del paper, no reproduce exactamente el pipeline open source |

El compromiso principal es claro: `AecSingleInterfering` obtiene mejor WER que `TecSingleInterfering` (12,06 frente a 21,61 en `test-clean`) pero necesita una entrada lateral unas 3.200 veces mayor (243,465 KB frente a 0,076 KB) y presenta peor MCD en `test-clean` (8,85 frente a 8,24 dB). No hay datos de parámetros ni de licencia de los checkpoints comparados más allá de lo indicado.

## Limitaciones y advertencias

- Solo cubre la condición de una única voz interferente (LJ Speech). Para múltiples voces existe otro modelo del mismo autor (`aec_multi_interfering`).
- Requiere la señal de reproducción completa como entrada lateral de unos 240-310 KB; si no se dispone de esa referencia, el modelo no puede usarse y el WER se degrada drásticamente (hasta 45,23 % en `test-clean` sin entrada lateral).
- La evaluación se realizó con respuestas impulsivas de sala sintéticas (RT60 = 0,25 s) y mezclas a 0 dB de SNR; el comportamiento en condiciones reales con reverberación distinta, ruido de fondo o no linealidades del altavoz no está documentado.
- El WER se calculó con `Qwen3-ASR-0.6B-F16` mediante `audio.cpp`, y el MCD con DTW de 13 MFCC; son métricas dependientes del pipeline de evaluación y no directamente comparables con cifras obtenidas con otros reconocedores.
- El MCD en `test-clean` (8,85 dB) es notablemente peor que el de la referencia del paper (6,38 dB), lo que sugiere mayor distorsión espectral en la señal reconstruida.
- Idiomas: los corpus son en inglés; no hay evidencia de generalización a otros idiomas.
- Sesgos conocidos: no disponibles. Los autores no documentan análisis de sesgo demográfico, acento o género.
- Riesgo de alucinación o artefactos de generación: al ser un modelo generativo seq2seq sobre espectrogramas, puede introducir artefactos espectrales en la señal de salida; no se cuantifica en la información disponible.
- Licencia Apache-2.0, que permite uso comercial, pero la model card incluye un aviso de que se trata de una reproducción open source independiente y no del modelo interno de Google.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y con fecha de creación y actualización de 2026-10-04; conviene verificar la vigencia y el mantenimiento del proyecto antes de usarlo en producción.
- La model card disponible está truncada al final (se corta dentro del ejemplo de uso de TFLite), por lo que parte de la documentación de inferencia en dispositivo no es consultable en el material proporcionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/aec_single_interfering
- Repositorio GitHub de la reproducción: https://github.com/wq2012/tec
- Paquete PyPI: https://pypi.org/project/textual-echo-cancellation/
- Paper (IEEE SLT 2021, arXiv:2008.06006v4): https://arxiv.org/pdf/2008.06006
- Página de demos de audio: https://google.github.io/speaker-id/publications/TEC/
- Modelos comparados citados en la model card: https://huggingface.co/wq2012/tec_single_interfering, https://huggingface.co/wq2012/vanilla_seq2seq_single_interfering, https://huggingface.co/wq2012/aec_multi_interfering, https://huggingface.co/wq2012/tec_multi_interfering, https://huggingface.co/wq2012/vanilla_seq2seq_multi_interfering
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos por la búsqueda no guardan ninguna relación con el modelo ni con cancelación de eco acústico, por lo que se descartan.
