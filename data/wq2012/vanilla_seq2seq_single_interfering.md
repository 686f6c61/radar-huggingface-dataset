# wq2012/vanilla_seq2seq_single_interfering

## Resumen

Este repositorio contiene `NoSideInputSingleInterfering`, el baseline "Vanilla-Seq2seq" sin entrada auxiliar del proyecto Textual Echo Cancellation (TEC). No es un modelo de lenguaje: es un modelo de mejora de voz (speech enhancement) con arquitectura sequence-to-sequence que recibe audio mezclado y produce un espectrograma log-Mel de la voz limpia, sin necesidad de disponer de una senal de referencia del eco o de la voz interferente. Lo publica el usuario `wq2012` como reproduccion open source independiente del trabajo original, construida sobre Lingvo y TensorFlow en lugar del codigo interno propietario de Google.

El modelo se entrena con voz de usuario en ingles de LibriTTS a 24 kHz, mezclada a 0 dB de SNR con audio reverberante de LJ Speech. Su interes practico es doble: por un lado sirve como punto de partida reproducible para investigacion en cancelacion de eco textual; por otro, al no requerir side input, se puede desplegar en escenarios donde no hay acceso a la senal de referencia, y cuenta con una version cuantizada en TFLite pensada para inferencia en dispositivo. La complejidad declarada es de 6,32 GFLOPS por pasada y el repositorio completo ocupa 0,2 GB.

El rendimiento es claramente inferior al de las variantes con side input del mismo proyecto: 45,23 % de WER en `test-clean` y 91,53 % en `test-other`, frente al 21,61 % / 46,89 % de `TecSingleInterfering`. Su valor, por tanto, es principalmente como referencia comparativa y como modelo ligero en entornos con restricciones de side input.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sequence-to-sequence (encoder-decoder) sobre espectrograma log-Mel; variante "Vanilla-Seq2seq" sin side input (`NoSideInput`), implementada en Lingvo/TensorFlow |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float (checkpoint TensorFlow/Lingvo) y cuantizacion de rango dinamico (TFLite) |
| Idiomas soportados | no disponible (los datasets de entrenamiento, LibriTTS y LJ Speech, son en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint TensorFlow/Lingvo (`best.ckpt.data-00000-of-00001`, `best.ckpt.index`, `best.ckpt.meta`, `checkpoint`) y FlatBuffer `.tflite` |
| Tarea | Speech enhancement / cancelacion de eco con una unica voz interferente |
| Frecuencia de muestreo | 24 kHz |
| Complejidad computacional | 6,32 GFLOPS |
| Tamano del repositorio | 0,2 GB |
| Datasets de entrenamiento | LibriTTS (voz de usuario) y LJ Speech (interferente reverberante), mezcla a 0 dB SNR |
| Metricas de evaluacion | WER (ASR) y MCD (13-MFCC Dynamic Time Warping) |
| Libreria | Lingvo / TensorFlow; paquete `textual-echo-cancellation` en PyPI |
| Paper de referencia | arXiv:2008.06006 (Textual Echo Cancellation, IEEE SLT 2021) |

## Arquitectura y entrenamiento

Se trata de un modelo sequence-to-sequence (encoder-decoder) que opera sobre representaciones log-Mel del audio, en la linea del baseline "Vanilla-Seq2seq" descrito en el paper de Textual Echo Cancellation. La variante `NoSideInput` prescinde por completo de la entrada auxiliar (texto de la voz interferente o senal de eco de referencia), de modo que la unica entrada es la mezcla captada por el microfono y la salida es el espectrograma log-Mel de la voz limpia. La implementacion es una reproduccion open source independiente basada en Lingvo y TensorFlow, sin usar el codigo interno ni la infraestructura de datos de Google.

Los datos de entrenamiento combinan voz de usuario de LibriTTS a 24 kHz con audio reverberante de LJ Speech como fuente interferente, mezclados a 0 dB de SNR. La evaluacion declarada usa respuestas impulsivas de sala sinteticas con RT60 = 0,25 s, y puntua con `Qwen3-ASR-0.6B-F16` mediante `audio.cpp` para el WER y con Dynamic Time Warping sobre 13 coeficientes MFCC para el MCD. No se especifica en la informacion disponible el numero de tokens o horas de audio, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en el sentido habitual de los modelos de lenguaje, ya que es un modelo de audio). El modelo card indica explicitamente que los resultados del baseline original en el paper eran mejores (25,4 % / 54,0 % de WER), por lo que la reproduccion no alcanza la cifra publicada.

## Capacidades

- Mejora de voz de una unica fuente: separa y limpia la voz objetivo a partir de una mezcla con una voz interferente reverberante.
- Cancelacion de eco sin senal de referencia (side input de 0,000 KB en las metricas declaradas).
- Salida en dominio espectral: genera un espectrograma log-Mel predicho (`predicted_mel`), no audio waveform directo.
- Inferencia en dispositivo mediante el modelo TFLite cuantizado de rango dinamico.
- Ejecucion desde linea de comandos y desde API de Python con el paquete `textual-echo-cancellation`.
- Uso como baseline reproducible para investigacion y comparacion frente a variantes con side input.
- Puntuacion automatica de resultados con ASR (WER) y MCD como parte del flujo de evaluacion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio generativo; no es un modelo de lenguaje.

## Casos de uso

- Limpieza previa a reconocimiento automatico del habla: el modelo reduce el WER de la senal mezclada (de 90,45 % a 45,23 % en `test-clean` en la comparativa declarada) antes de pasar el audio a un sistema ASR, lo que mejora la transcripcion en entornos con una voz de fondo.
- Escenarios sin senal de eco de referencia: en dispositivos donde no se dispone de la senal reproducida por el altavoz, este baseline permite intentar la supresion usando unicamente el microfono, a diferencia de las variantes AEC que requieren 243,465 KB de side input.
- Inferencia en dispositivo o edge: gracias al `model.tflite` cuantizado y a los 6,32 GFLOPS de complejidad, es candidato para preprocesado de audio en movil o hardware embebido con el runtime de TensorFlow Lite.
- Preprocesado de corpus de audio para entrenamiento de TTS: al mejorar el MCD de la mezcla (de 12,86 dB a 9,58 dB en `test-clean`), puede usarse para limpiar grabaciones antes de entrenar sintetizadores de voz.
- Restauracion de grabaciones con voz de fondo: entrevistas, podcasts o notas de voz donde una segunda voz reverberante contamina la grabacion principal.
- Reproduccion de investigacion comparativa: sirve como punto de referencia fijo para medir la ganancia de tecnicas con side input (AEC, TEC) en el mismo pipeline de evaluacion WER/MCD.
- Integracion en un pipeline de telefonia o videoconferencia como etapa opcional cuando la supresion basada en referencia no esta disponible.

## Benchmarks y rendimiento

Todos los datos de esta seccion proceden del model card del autor. Condicion de una unica voz interferente (LibriTTS + LJ Speech):

| Metodo | WER (%) test-clean | WER (%) test-other | MCD (dB) test-clean | MCD (dB) test-other | Side input (KB) |
|---|---|---|---|---|---|
| GroundTruth | 3,52 | 6,78 | 0,00 | 0,00 | 0,000 |
| MicrophoneSignal | 90,45 | 114,12 | 12,86 | 14,61 | 0,000 |
| NlmsAec (AEC-NLMS) | 88,44 | 107,34 | 12,80 | 14,48 | 243,465 |
| NoSideInputSingleInterfering (este modelo) | 45,23 | 91,53 | 9,58 | 11,34 | 0,000 |
| AecSingleInterfering | 12,06 | 23,16 | 8,85 | 9,86 | 243,465 |
| TecSingleInterfering | 21,61 | 46,89 | 8,24 | 9,28 | 0,076 |
| Referencia del paper (Vanilla-Seq2seq) | 25,4 | 54,0 | 7,85 | 8,84 | 0 |

Condicion de multiples voces interferentes (LibriTTS + VCTK), para contexto de los modelos hermanos:

| Metodo | WER (%) test-clean | WER (%) test-other | MCD (dB) test-clean | MCD (dB) test-other | Side input (KB) |
|---|---|---|---|---|---|
| GroundTruth | 5,03 | 7,82 | 0,00 | 0,00 | 0,000 |
| MicrophoneSignal | 34,17 | 48,97 | 7,67 | 7,70 | 0,000 |
| NlmsAec (AEC-NLMS) | 28,64 | 34,98 | 7,92 | 8,40 | 186,922 |
| NoSideInputMultiInterfering | 31,16 | 42,39 | 7,93 | 8,72 | 0,000 |
| AecMultiInterfering | 8,54 | 22,22 | 7,80 | 7,88 | 186,922 |
| TecMultiInterfering | 26,63 | 45,27 | 7,96 | 8,40 | 0,037 |

## Requisitos de hardware

- El repositorio completo ocupa 0,2 GB; no se publica el consumo de memoria en inferencia ni el numero de parametros, por lo que la VRAM exacta es "no disponible".
- La complejidad declarada es de 6,32 GFLOPS por pasada, una carga baja en terminos relativos que sugiere viabilidad en hardware modesto, si bien no hay cifras oficiales de VRAM.
- Existe un `model.tflite` con cuantizacion de rango dinamico disenado explicitamente para inferencia en dispositivo, lo que apunta a CPU movil o embebida sin GPU dedicada.
- El checkpoint principal es de TensorFlow/Lingvo (`.ckpt`), lo que requiere el runtime de TensorFlow y el framework Lingvo; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Vias de despliegue documentadas: paquete `textual-echo-cancellation` desde PyPI, CLI `scripts/inference.py`, API de Python y TensorFlow Lite.
- GPU recomendadas: no disponible. No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

La comparativa natural es con los otros modelos del mismo proyecto TEC, evaluados bajo la misma condicion (una unica voz interferente):

| Modelo | Parametros | Contexto | WER test-clean / test-other | MCD test-clean / test-other | Side input | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `wq2012/vanilla_seq2seq_single_interfering` (este) | no disponible | no disponible | 45,23 / 91,53 | 9,58 / 11,34 | 0,000 KB | Apache 2.0 | HuggingFace |
| `wq2012/tec_single_interfering` | no disponible | no disponible | 21,61 / 46,89 | 8,24 / 9,28 | 0,076 KB | no indicada en la informacion disponible | HuggingFace |
| `wq2012/aec_single_interfering` | no disponible | no disponible | 12,06 / 23,16 | 8,85 / 9,86 | 243,465 KB | no indicada en la informacion disponible | HuggingFace |
| `wq2012/vanilla_seq2seq_multi_interfering` (condicion multi-voz) | no disponible | no disponible | 31,16 / 42,39 | 7,93 / 8,72 | 0,000 KB | no indicada en la informacion disponible | HuggingFace |

En la condicion multi-voz no existe una variante `NoSideInput` comparable a esta dentro de la tabla, salvo `vanilla_seq2seq_multi_interfering`. No se dispone de comparaciones con modelos externos a este proyecto.

## Limitaciones y advertencias

- Rendimiento limitado: 91,53 % de WER en `test-other` indica que la mejora es insuficiente en esa particion, con muy poca reduccion frente a la senal de microfono original.
- No alcanza la cifra del paper: la reproduccion open source declara 45,23 % / 91,53 % de WER frente al 25,4 % / 54,0 % de referencia, una divergencia notable que el propio autor reconoce.
- Al no usar side input, no puede aprovechar informacion de la voz interferente ni del eco de referencia, a diferencia de las variantes AEC y TEC, que obtienen WER mucho menores.
- Entrenado para una unica voz interferente reverberante; no esta disenado para condiciones de multiples voces (existe otro modelo para ese caso).
- Riesgo de artefactos de sobre-supresion o distorsion en la senal mejorada, medido indirectamente por el MCD (9,58 / 11,34 dB, lejos del 0 dB de la referencia limpia).
- Sesgos conocidos: no se documentan sesgos especificos, pero el entrenamiento se limita a LibriTTS y LJ Speech, corpora de lectura en ingles, lo que reduce la generalizacion a otras lenguas, acentos y condiciones acusticas.
- Idiomas: no declarados; los datasets de entrenamiento son en ingles, por lo que el comportamiento fuera del ingles es "no disponible" y presumiblemente degradado.
- Licencia Apache 2.0, que permite uso comercial, pero el model card no detalla condiciones adicionales de los datasets subyacentes.
- Poca validacion externa: 0 descargas y 0 likes en el momento de la ficha, sin pipeline declarado en HuggingFace.
- Requiere el stack TensorFlow/Lingvo para el checkpoint completo; el flujo de inferencia depende del paquete `textual-echo-cancellation`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/vanilla_seq2seq_single_interfering
- Repositorio GitHub del proyecto: https://github.com/wq2012/tec
- Paquete PyPI: https://pypi.org/project/textual-echo-cancellation/
- Paper (arXiv:2008.06006v4, Textual Echo Cancellation, IEEE SLT 2021): https://arxiv.org/pdf/2008.06006
- Pagina de demos de audio: https://google.github.io/speaker-id/publications/TEC/
- Modelos relacionados del mismo autor: https://huggingface.co/wq2012/tec_single_interfering, https://huggingface.co/wq2012/aec_single_interfering, https://huggingface.co/wq2012/vanilla_seq2seq_multi_interfering, https://huggingface.co/wq2012/aec_multi_interfering, https://huggingface.co/wq2012/tec_multi_interfering
- Framework Lingvo: https://github.com/tensorflow/lingvo
