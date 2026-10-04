# wq2012/tec_single_interfering

## Resumen

`wq2012/tec_single_interfering` es una implementación preentrenada de Textual Echo Cancellation (TEC), un modelo de cancelación de eco que utiliza la transcripción del audio reproducido como señal lateral para reconstruir la voz limpia del usuario. Lo publica Quan Wang (usuario `wq2012`) como reproducción de código abierto del trabajo presentado en IEEE SLT 2021 (arXiv:2008.06006), construida íntegramente sobre la librería Lingvo y TensorFlow, sin dependencia del código interno propietario de Google.

El modelo aborda la condición de "una única voz interferente": la señal de micrófono contiene la voz del usuario mezclada a 0 dB SNR con una voz TTS reverberante (LJ Speech) generada por el propio dispositivo. En lugar de estimar la señal de referencia a partir del audio del altavoz —lo que exige una señal de eco de cientos de kilobytes, como en los modelos AEC—, TEC recibe únicamente el texto sintetizado, de menos de 0,1 KB, y el espectrograma ruidoso del micrófono.

La arquitectura es un modelo secuencia a secuencia con atención multi-fuente, con dos codificadores (`SpeechEncoderV1` para el audio y `TtsEncoderV2` para el texto) y decodificación de espectrograma log-Mel a 24 kHz. Se distribuye como checkpoint de TensorFlow/Lingvo y como modelo TFLite cuantizado de rango dinámico para inferencia en dispositivo, con un coste de 7,27 GFLOPS por pasada y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Secuencia a secuencia (seq2seq) con atención multi-fuente; codificador de audio `SpeechEncoderV1`, codificador de texto `TtsEncoderV2` y decodificador de espectrograma |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en tokens; el codificador consume la señal de audio completa y el texto lateral ocupa 0,076 KB (test-clean) y 0,068 KB (test-other) |
| Tipos de cuantizacion | Pesos en coma flotante en el checkpoint de Lingvo; `model.tflite` con cuantización de rango dinámico (dynamic-range quantized) |
| Idiomas soportados | no declarados en la model card; los corpus de entrenamiento (LibriTTS y LJ Speech) son en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | TensorFlow/Lingvo checkpoint (`best.ckpt.data-00000-of-00001`, `best.ckpt.index`, `best.ckpt.meta`, `checkpoint`) y TensorFlow Lite FlatBuffer (`model.tflite`) |
| Frecuencia de muestreo | 24 kHz |
| Tamano del repositorio | 0,3 GB |
| Coste computacional | 7,27 GFLOPS por inferencia |
| Fecha de publicacion | 2026-10-04 |

## Arquitectura y entrenamiento

TEC es un modelo seq2seq de atención multi-fuente que combina dos entradas heterogéneas: el espectrograma log-Mel de la señal captada por el micrófono, procesado por `SpeechEncoderV1`, y la transcripción del texto sintetizado por el sistema TTS, procesada por `TtsEncoderV2`. El decodificador reconstruye el espectrograma log-Mel de la voz limpia del usuario. La innovación central frente a la cancelación de eco acústico (AEC) clásica es que la referencia del eco no se obtiene del audio del altavoz sino del texto que se está reproduciendo: esto reduce el tamaño de la señal lateral de 243,465 KB (AEC-NLMS) a 0,076 KB en la condición de una voz interferente, es decir, más de tres órdenes de magnitud menos información auxiliar.

El entrenamiento se realizó sobre habla de usuario en inglés de LibriTTS a 24 kHz, mezclada a 0 dB SNR con voz TTS reverberante de LJ Speech, aplicando respuestas impulsivas de sala sintéticas con RT60 = 0,25 s. El modelo forma parte de una familia de variantes: `NoSideInputSingleInterfering` (sin señal lateral), `AecSingleInterfering` (referencia acústica) y `TecSingleInterfering` (referencia textual), además de las versiones equivalentes para múltiples voces interferentes. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Reconstrucción de espectrograma log-Mel de voz limpia a partir de una señal de micrófono con eco y reverberación.
- Cancelación de eco de una única voz TTS interferente (LJ Speech) mezclada a 0 dB SNR.
- Uso de texto como señal lateral de referencia: el modelo recibe la transcripción del audio reproducido en lugar de la señal acústica del altavoz.
- Codificación de audio mediante `SpeechEncoderV1` y codificación de texto mediante `TtsEncoderV2`.
- Salida en forma de espectrograma log-Mel (`predicted_mel`), no de forma de onda directa.
- Inferencia en dispositivo mediante la versión cuantizada `model.tflite`.
- Evaluación objetiva mediante WER (reconocimiento automático de voz) y MCD (13-MFCC Dynamic Time Warping).
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso ni capacidades multimodales de visión o generación de lenguaje; es un modelo exclusivamente de mejora de habla.

## Casos de uso

- Videollamadas y conferencias: eliminar la voz del asistente TTS que sale por el altavoz y vuelve a entrar por el micrófono. Como el sistema conoce el texto sintetizado, puede enviarlo como señal lateral de 0,076 KB en lugar de transmitir la señal de referencia completa.
- Asistentes de voz en altavoces inteligentes y móviles: el propio dispositivo genera el texto de respuesta, por lo que dispone de la referencia textual sin coste adicional de ancho de banda. La variante TFLite permite ejecutar la cancelación localmente.
- Auriculares y dispositivos wearables con reproducción TTS: reducción del eco residual en escenarios de manos libres donde no hay acceso limpio a la señal del altavoz.
- Preprocesado para ASR en kioscos e IVR: mejorar la relación señal-ruido antes de pasar la señal a un reconocedor, usando el texto de los mensajes pregrabados o sintetizados como referencia. Con WER de 21,61 % en test-clean, es adecuado como etapa de limpieza previa, no como sustituto del reconocedor.
- Audioguías y sistemas de navegación en vehículo: la voz sintetizada del sistema se mezcla con la voz del ocupante; TEC puede separar ambas usando el texto de la indicación reproducida.
- Dictado y notas de voz en aplicaciones móviles: limpieza de grabaciones contaminadas por la reproducción de contenido TTS en el propio dispositivo, con inferencia en TFLite y sin enviar audio a la nube.
- Limpieza de grabaciones de campo con eco conocido: si se dispone de la transcripción del audio amplificado en la sala, el modelo puede emplearse para reconstruir la voz del hablante principal.

## Benchmarks y rendimiento

Evaluación de `TecSingleInterfering` frente a la referencia del artículo (condición de una voz interferente, LibriTTS `test-clean` y `test-other` mezclados a 0 dB SNR con respuestas impulsivas sintéticas de RT60 = 0,25 s; WER medido con `Qwen3-ASR-0.6B-F16` mediante `audio.cpp` y MCD con 13-MFCC DTW):

| Metrica | `test-clean` | `test-other` | Referencia del articulo (`TEC (proposed)`) |
|---|---|---|---|
| WER (%) ↓ | 21,61 % (43/199) | 46,89 % (83/177) | 15,5 % / 39,8 % |
| MCD (dB) ↓ | 8,24 dB | 9,28 dB | 7,51 dB / 8,54 dB |
| Tamano de senal lateral (KB) ↓ | 0,076 KB | 0,068 KB | 0,10 KB |
| Complejidad computacional ↓ | 7,27 GFLOPS | 7,27 GFLOPS | 7,27 GFLOPS |

Comparativa completa de todos los modelos preentrenados y líneas base de la familia:

| Condicion | Metodo | Modelo en Hugging Face | WER test-clean ↓ | WER test-other ↓ | MCD test-clean ↓ | MCD test-other ↓ | Senal lateral test-clean (KB) ↓ |
|---|---|---|---|---|---|---|---|
| Una voz interferente (LibriTTS + LJSpeech) | `GroundTruth` | — | 3,52 | 6,78 | 0,00 | 0,00 | 0,000 |
| | `MicrophoneSignal` | — | 90,45 | 114,12 | 12,86 | 14,61 | 0,000 |
| | `NlmsAec` (AEC-NLMS) | — | 88,44 | 107,34 | 12,80 | 14,48 | 243,465 |
| | `NoSideInputSingleInterfering` | `wq2012/vanilla_seq2seq_single_interfering` | 45,23 | 91,53 | 9,58 | 11,34 | 0,000 |
| | `AecSingleInterfering` | `wq2012/aec_single_interfering` | 12,06 | 23,16 | 8,85 | 9,86 | 243,465 |
| | **`TecSingleInterfering`** | **`wq2012/tec_single_interfering`** | **21,61** | **46,89** | **8,24** | **9,28** | **0,076** |
| Multiples voces interferentes (LibriTTS + VCTK) | `GroundTruth` | — | 5,03 | 7,82 | 0,00 | 0,00 | 0,000 |
| | `MicrophoneSignal` | — | 34,17 | 48,97 | 7,67 | 7,70 | 0,000 |
| | `NlmsAec` (AEC-NLMS) | — | 28,64 | 34,98 | 7,92 | 8,40 | 186,922 |
| | `NoSideInputMultiInterfering` | `wq2012/vanilla_seq2seq_multi_interfering` | 31,16 | 42,39 | 7,93 | 8,72 | 0,000 |
| | `AecMultiInterfering` | `wq2012/aec_multi_interfering` | 8,54 | 22,22 | 7,80 | 7,88 | 186,922 |
| | **`TecMultiInterfering`** | **`wq2012/tec_multi_interfering`** | **26,63** | **45,27** | **7,96** | **8,40** | **0,037** |

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio completo ocupa 0,3 GB, incluyendo el checkpoint de Lingvo, los metadatos y el modelo TFLite, por lo que los pesos quedan por debajo de esa cifra.
- GPU recomendadas: no se especifica ninguna. Con 7,27 GFLOPS por inferencia, el modelo no requiere GPU y puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con unos pocos gigabytes de memoria. El caso de uso principal es la inferencia en dispositivo mediante TFLite.
- Opciones de despliegue: paquete PyPI `textual-echo-cancellation` sobre TensorFlow/Lingvo (API de Python `tec.inference.run_inference_on_wav` y CLI `scripts/inference.py`), y `model.tflite` para inferencia cuantizada en dispositivo. No se mencionan vLLM, TGI, llama.cpp ni Ollama, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. El único dato de coste es 7,27 GFLOPS por inferencia, idéntico en `test-clean` y `test-other`.

## Comparativa con modelos similares

| Modelo | Tipo de referencia | Paramatros | WER test-clean | WER test-other | MCD test-clean | Senal lateral | Licencia |
|---|---|---|---|---|---|---|---|
| `wq2012/tec_single_interfering` | Texto (TTS) | no disponible | 21,61 % | 46,89 % | 8,24 dB | 0,076 KB | Apache 2.0 |
| `wq2012/aec_single_interfering` | Audio del altavoz | no disponible | 12,06 % | 23,16 % | 8,85 dB | 243,465 KB | Apache 2.0 |
| `wq2012/vanilla_seq2seq_single_interfering` | Ninguna | no disponible | 45,23 % | 91,53 % | 9,58 dB | 0,000 KB | Apache 2.0 |
| `NlmsAec` (AEC-NLMS, linea base) | Audio del altavoz | no aplica | 88,44 % | 107,34 % | 12,80 dB | 243,465 KB | no disponible |

La comparación directa muestra el compromiso que caracteriza a TEC: reduce la señal lateral en más de tres órdenes de magnitud respecto a AEC (0,076 KB frente a 243,465 KB) y mejora el MCD (8,24 dB frente a 8,85 dB), a costa de un WER peor (21,61 % frente a 12,06 % en test-clean). No se dispone de comparativas con modelos de cancelación de eco de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento en `test-other` es notablemente peor que en `test-clean`: WER del 46,89 % y MCD de 9,28 dB, frente a 21,61 % y 8,24 dB respectivamente.
- En la condición de una voz interferente, TEC obtiene peor WER que el modelo basado en referencia acústica (`AecSingleInterfering`: 12,06 % / 23,16 %). Textual Echo Cancellation prioriza el ahorro de ancho de banda sobre la calidad de cancelación.
- El modelo requiere obligatoriamente la transcripción del texto sintetizado. Si el sistema no controla la fuente TTS o no dispone del texto, no puede aplicarse.
- Está entrenado específicamente para la condición de una única voz interferente procedente de LJ Speech; no cubre múltiples voces (para eso existe `wq2012/tec_multi_interfering`).
- Las condiciones de evaluación suponen respuestas impulsivas de sala sintéticas con RT60 = 0,25 s y una SNR de mezcla de 0 dB. El comportamiento fuera de ese régimen no está documentado.
- Los corpus de entrenamiento (LibriTTS y LJ Speech) son en inglés; la model card no declara idiomas soportados, por lo que el comportamiento multilingüe es desconocido.
- Los valores de WER publicados se obtuvieron con `Qwen3-ASR-0.6B-F16` mediante `audio.cpp`, un reconocedor distinto del usado en el artículo original (15,5 % / 39,8 %), por lo que las cifras no son directamente comparables entre sí.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. No se declaran restricciones adicionales.
- Riesgo de alucinación acústica: al ser un modelo generativo de espectrograma, puede introducir artefactos o componentes espectrales no presentes en la señal original. No se han publicado métricas de artefactos ni evaluaciones subjetivas (MOS) en la información disponible.
- No se han publicado datos sobre sesgos demográficos, acentos o tipos de voz en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/tec_single_interfering
- Repositorio GitHub de la reproducción: https://github.com/wq2012/tec
- Paquete PyPI: https://pypi.org/project/textual-echo-cancellation/
- Artículo (IEEE SLT 2021, arXiv:2008.06006v4): https://arxiv.org/pdf/2008.06006
- Página de demostración de audio: https://google.github.io/speaker-id/publications/TEC/
- Perfil del autor en GitHub: https://github.com/wq2012
- Modelo relacionado (`AecSingleInterfering`): https://huggingface.co/wq2012/aec_single_interfering
- Modelo relacionado (`NoSideInputSingleInterfering`): https://huggingface.co/wq2012/vanilla_seq2seq_single_interfering
- Modelo relacionado (`TecMultiInterfering`): https://huggingface.co/wq2012/tec_multi_interfering
