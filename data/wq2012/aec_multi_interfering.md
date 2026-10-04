# wq2012/aec_multi_interfering

## Resumen

`wq2012/aec_multi_interfering` (nombre interno `AecMultiInterfering`) es un modelo neuronal de cancelación de eco acústico (AEC) basado en una arquitectura *multi-source attention sequence-to-sequence* (`AEC-Seq2seq`). No es un modelo de lenguaje: es un sistema de mejora de voz (speech enhancement) que recibe como entrada la señal captada por el micrófono y una señal auxiliar de referencia (el audio del TTS reproducido por el altavoz) y devuelve el espectrograma log-Mel de la voz limpia. Lo desarrolla el usuario `wq2012` como reproducción de código abierto del artículo *Textual Echo Cancellation* (IEEE SLT 2021, arXiv:2008.06006), implementada sobre Lingvo y TensorFlow, sin usar el código propietario interno de Google.

El modelo se entrena con voz de usuario de **LibriTTS a 24 kHz** mezclada a **0 dB de SNR** con voz reverberante de **CSTR VCTK** (interferencia TTS de 109 hablantes), lo que reproduce el escenario de "múltiples voces interferentes": el altavoz está reproduciendo una voz sintética que puede ser distinta de la del usuario y del propio eco. Frente a baselines clásicos como AEC-NLMS o la señal de micrófono sin procesar, reduce el WER de ASR de 34,17 % a 8,54 % en `test-clean` y de 48,97 % a 22,22 % en `test-other`, con un coste computacional de 8,62 GFLOPS y 186,9 KB de señal auxiliar en `test-clean`.

Su relevancia práctica está en que incluye un `model.tflite` cuantizado de forma dinámica para inferencia *on-device*, lo que lo hace desplegable en dispositivos con recursos limitados (altavoces inteligentes, auriculares, barras de sonido) sin necesidad de GPU. El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `AEC-Seq2seq` (encoder-decoder seq2seq con atencion multi-source; dos encoders de audio `SpeechEncoderV1`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion de rango dinamico (dynamic-range quantization) en la variante TensorFlow Lite |
| Idiomas soportados | no disponible en los metadatos; los corpus de entrenamiento (LibriTTS, VCTK) son de habla inglesa |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint de TensorFlow/Lingvo (`best.ckpt.data-00000-of-00001`, `best.ckpt.index`, `best.ckpt.meta`, `checkpoint`) y FlatBuffer TensorFlow Lite (`model.tflite`) |

Datos adicionales: frecuencia de muestreo de 24 kHz, senal auxiliar (*side input*) de 186,922 KB en `test-clean` y 206,759 KB en `test-other`, y complejidad de 8,62 GFLOPS.

## Arquitectura y entrenamiento

El modelo sigue el diseno `AEC-Seq2seq`: un esquema sequence-to-sequence con atencion multi-source que procesa dos flujos de audio en paralelo. El primero es la mezcla captada por el micrófono, que contiene la voz del usuario, el eco del TTS reproducido y posibles voces interferentes. El segundo es el audio completo de reproducción del TTS, que actúa como referencia y se codifica con un segundo encoder `SpeechEncoderV1`. Ambos flujos se combinan mediante atención, de modo que el decodificador puede suprimir selectivamente la componente correspondiente al audio de referencia. La salida se produce en el dominio de espectrograma log-Mel, tal y como refleja la API de inferencia (`result["predicted_mel"]`).

El entrenamiento se realizó sobre voz de usuario de **LibriTTS a 24 kHz** mezclada a **0 dB de SNR** con voz reverberante de **CSTR VCTK** (109 hablantes), usando respuestas impulsivas de sala sintéticas con RT60 = 0,25 s en la evaluación. En el escenario "múltiples voces interferentes" el modelo aprende a distinguir tres fuentes simultáneas: usuario, eco del TTS e interferencia adicional. La model card indica explícitamente que el modelo se entrenó con la librería de reproducción de código abierto `wq2012/tec` sobre Lingvo y TensorFlow, y no con el código ni la infraestructura de datos internos de Google. No se detalla en la información disponible el número de tokens o horas de audio de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO (procedimientos que, por otra parte, no son habituales en modelos de mejora de voz).

## Capacidades

- Cancelación de eco acústico (AEC) en el dominio espectral: separa la voz objetivo del eco generado por la reproducción de un TTS.
- Supresión de múltiples voces interferentes simultáneas, no solo del eco directo.
- Uso de *side input* textual-equivalente: acepta el audio de referencia completo (~187-230 KB) o, alternativamente, texto de la frase reproducida (`interfering_text` en la API), según el modo de inferencia.
- Salida en espectrograma log-Mel a 24 kHz, reutilizable por vocoders o *front-ends* de ASR.
- Inferencia *on-device* mediante la variante TFLite cuantizada (`model.tflite`).
- Integración vía CLI (`scripts/inference.py`) y vía API de Python (`tec.inference.run_inference_on_wav`).
- Evaluación con métricas objetivas de ASR y de distorsión: WER (con `Qwen3-ASR-0.6B-F16` mediante `audio.cpp`) y MCD con DTW sobre 13 MFCC.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, *tool calling* ni comportamiento de agente: no es un modelo de lenguaje.

## Casos de uso

- **Altavoces inteligentes y asistentes de voz:** el dispositivo reproduce música o una respuesta TTS mientras el usuario habla. El modelo elimina ese eco usando como referencia el audio reproducido, lo que permite mantener la activación por voz con la reproducción en marcha.
- **Videollamadas y conferencias en modo manos libres:** en equipos con altavoz y micrófono lejanos, la señal captada contiene el audio de los interlocutores remotos. Alimentar el modelo con la mezcla y el audio de reproducción reduce el eco y mejora la inteligibilidad antes de la codificación de voz.
- **Preprocesado en pipelines de ASR:** al reducir el WER de 34,17 % a 8,54 % en `test-clean` respecto a la señal de micrófono sin procesar, encaja como etapa previa a un sistema de reconocimiento de voz en entornos con eco.
- **Limpieza de corpus de entrenamiento ASR:** grabaciones con eco o reproducción de fondo pueden normalizarse antes de anotarlas, reduciendo ruido de etiquetado en el dataset.
- **Telefonía VoIP y auriculares con cancelación de eco:** la variante TFLite permite ejecutar el modelo en el propio dispositivo, con 8,62 GFLOPS por pasada, sin enviar audio a la nube.
- **Sistemas de karaoke e interacción con TTS concurrente:** cuando una aplicación reproduce voz sintetizada mientras el usuario canta o habla, el modelo separa la voz del usuario de la pista sintética de referencia.
- **Baseline de investigación en AEC neuronal:** sirve como punto de comparación reproducible (con `evaluation_metrics.json` verificado) para nuevos métodos de cancelación de eco, en la misma familia que `tec_multi_interfering` y `vanilla_seq2seq_multi_interfering`.
- **Barras de sonido y dispositivos de sala (smart speakers):** la señal auxiliar de ~187 KB es lo bastante pequena para transmitirse entre el subsistema de reproducción y el de captura dentro del propio dispositivo.

## Benchmarks y rendimiento

Evaluación de `AecMultiInterfering` sobre 24 kHz LibriTTS (`test-clean`, `test-other`) mezclado a 0 dB SNR con respuestas impulsivas sintéticas (RT60 = 0,25 s), condición de múltiples voces interferentes (LibriTTS + VCTK):

| Metrica | `test-clean` | `test-other` | Referencia del paper (`AEC-Seq2seq`) |
|---|---|---|---|
| WER (%) ↓ | 8,54 % (17/199) | 22,22 % (54/243) | 6,90 % / 19,8 % |
| MCD (dB) ↓ | 7,80 dB | 7,88 dB | 5,04 dB / 5,72 dB |
| Tamano del side input (KB) ↓ | 186,922 KB | 206,759 KB | 230 KB |
| Complejidad computacional ↓ | 8,62 GFLOPS | 8,62 GFLOPS | 8,62 GFLOPS |

Comparativa completa entre modelos preentrenados y baselines, condición de múltiples voces interferentes (LibriTTS + VCTK):

| Metodo | Modelo en Hugging Face | WER (%) test-clean ↓ | WER (%) test-other ↓ | MCD (dB) test-clean ↓ | MCD (dB) test-other ↓ | Side input test-clean (KB) ↓ |
|---|---|---|---|---|---|---|
| `GroundTruth` | — | 5,03 | 7,82 | 0,00 | 0,00 | 0,000 |
| `MicrophoneSignal` | — | 34,17 | 48,97 | 7,67 | 7,70 | 0,000 |
| `NlmsAec` (AEC-NLMS) | — | 28,64 | 34,98 | 7,92 | 8,40 | 186,922 |
| `NoSideInputMultiInterfering` | `wq2012/vanilla_seq2seq_multi_interfering` | 31,16 | 42,39 | 7,93 | 8,72 | 0,000 |
| **`AecMultiInterfering`** | **`wq2012/aec_multi_interfering`** | **8,54** | **22,22** | **7,80** | **7,88** | **186,922** |
| `TecMultiInterfering` | `wq2012/tec_multi_interfering` | 26,63 | 45,27 | 7,96 | 8,40 | 0,037 |

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible. No se publica el numero de parametros ni el pico de memoria del modelo.
- **GPU recomendadas:** no disponibles en la informacion proporcionada. La model card no especifica GPU de referencia.
- **Ejecucion en GPU de consumo:** no confirmada. El dato disponible es que existe una variante `model.tflite` con cuantizacion de rango dinamico, pensada para inferencia *on-device*, y que el coste es de 8,62 GFLOPS por pasada, una cifra baja en terminos relativos para modelos de audio.
- **Opciones de despliegue:** paquete `textual-echo-cancellation` desde PyPI (`pip3 install textual-echo-cancellation`), ejecucion con checkpoint TensorFlow/Lingvo vía CLI (`scripts/inference.py`) o vía API Python (`tec.inference.run_inference_on_wav`), y ejecucion con TensorFlow Lite usando `model.tflite`. Frameworks como vLLM, Ollama o TGI no aplican: no es un modelo de lenguaje.
- **Latencia y throughput:** no disponibles. Solo se documenta la complejidad de 8,62 GFLOPS por pasada.
- **Tamano en disco:** el repositorio completo ocupa 0,2 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER test-clean / test-other (%) | Side input (KB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `wq2012/aec_multi_interfering` | no disponible | no disponible | 8,54 / 22,22 | 186,922 | Apache 2.0 | Hugging Face |
| `wq2012/tec_multi_interfering` | no disponible | no disponible | 26,63 / 45,27 | 0,037 | no disponible en esta busqueda | Hugging Face |
| `wq2012/vanilla_seq2seq_multi_interfering` | no disponible | no disponible | 31,16 / 42,39 | 0,000 | no disponible en esta busqueda | Hugging Face |
| `wq2012/aec_single_interfering` (voz interferente unica) | no disponible | no disponible | 12,06 / 23,16 | 243,465 | no disponible en esta busqueda | Hugging Face |
| `NlmsAec` (baseline AEC-NLMS clasico) | no aplica | no aplica | 28,64 / 34,98 | 186,922 | no disponible | No publicado como modelo |
| `MicrophoneSignal` (sin procesar) | no aplica | no aplica | 34,17 / 48,97 | 0,000 | no aplica | No aplica |

Interpretacion: `AecMultiInterfering` obtiene el mejor WER de su categoria en `test-clean` (8,54 %) entre los modelos con side input completo, mientras que `TecMultiInterfering` reduce drasticamente el tamano del side input (0,037 KB) a costa de un WER mucho peor (26,63 %). La eleccion depende de si el dispositivo puede permitirse enviar ~187 KB de audio de referencia o solo una representacion textual minima.

## Limitaciones y advertencias

- **Especifico de dominio:** el modelo solo realiza cancelacion de eco y mejora de voz. No genera texto, no razona, no ejecuta codigo y no soporta *tool calling* ni flujos de agente.
- **Dependencia del side input:** requiere el audio de referencia de reproduccion (o su texto). Sin esa senal auxiliar, la cancelacion de eco no funciona como esta disenada.
- **Idioma:** los corpus de entrenamiento (LibriTTS, VCTK) son de habla inglesa; no se documentan capacidades multilingues. El rendimiento en otros idiomas es desconocido.
- **Degradacion en `test-other`:** el WER sube de 8,54 % a 22,22 % y el MCD apenas varia (7,80 dB frente a 7,88 dB), lo que indica que la calidad de separacion se resiente en condiciones acusticas mas dificiles.
- **Distancia respecto al limite teorico:** el `GroundTruth` de la misma condicion da 5,03 % / 7,82 % de WER y 0 dB de MCD. El modelo se queda en 7,80 dB de MCD, por lo que persiste distorsion residual audible.
- **Condiciones de entrenamiento concretas:** mezcla fija a 0 dB SNR, RT60 = 0,25 s y reverberacion sintetica. El comportamiento fuera de ese rango (SNR distinto, salas reales, RT60 mayor) no esta documentado.
- **Riesgo de sobreajuste al interferente de 109 hablantes de VCTK:** el numero de voces interferentes de entrenamiento es limitado y no se documenta su diversidad acustica completa.
- **Licencia:** el modelo se publica bajo Apache 2.0, lo que permite uso comercial. No obstante, la model card no detalla las licencias de los corpus LibriTTS y VCTK utilizados en el entrenamiento; conviene verificarlas antes de un despliegue comercial.
- **Sin benchmarks independientes:** los resultados mostrados estan autoinformados por el autor en `evaluation_metrics.json`; el modelo tiene 0 descargas y 0 *likes* en el momento de la consulta, por lo que no existe validacion externa.
- **Busqueda web sin resultados utiles:** las consultas realizadas no devolvieron ninguna fuente tecnica relevante sobre este modelo (unicamente resultados no relacionados), de modo que toda la informacion de esta ficha proviene de la model card y de los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/wq2012/aec_multi_interfering](https://huggingface.co/wq2012/aec_multi_interfering)
- Repositorio GitHub (libreria de reproduccion `tec`): [https://github.com/wq2012/tec](https://github.com/wq2012/tec)
- Paquete PyPI: [https://pypi.org/project/textual-echo-cancellation/](https://pypi.org/project/textual-echo-cancellation/)
- Paper (Textual Echo Cancellation, IEEE SLT 2021): [https://arxiv.org/pdf/2008.06006](https://arxiv.org/pdf/2008.06006)
- Pagina de demos de audio: [https://google.github.io/speaker-id/publications/TEC/](https://google.github.io/speaker-id/publications/TEC/)
- Repositorio Lingvo: [https://github.com/tensorflow/lingvo](https://github.com/tensorflow/lingvo)
- Modelos relacionados: [wq2012/tec_multi_interfering](https://huggingface.co/wq2012/tec_multi_interfering), [wq2012/vanilla_seq2seq_multi_interfering](https://huggingface.co/wq2012/vanilla_seq2seq_multi_interfering), [wq2012/aec_single_interfering](https://huggingface.co/wq2012/aec_single_interfering), [wq2012/tec_single_interfering](https://huggingface.co/wq2012/tec_single_interfering), [wq2012/vanilla_seq2seq_single_interfering](https://huggingface.co/wq2012/vanilla_seq2seq_single_interfering)
- Nota: la busqueda web realizada no devolvio ningun enlace tecnico adicional relevante sobre este modelo.
