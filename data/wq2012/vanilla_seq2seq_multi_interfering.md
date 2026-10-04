# wq2012/vanilla_seq2seq_multi_interfering

## Resumen

Vanilla-Seq2seq Multi Interfering (`NoSideInputMultiInterfering`) es un modelo de mejora de voz (*speech enhancement*) de tipo secuencia a secuencia que actua como linea base dentro del marco de trabajo Textual Echo Cancellation (TEC). Lo desarrolla el autor `wq2012` como reproduccion de codigo abierto del paper homonimo publicado en IEEE SLT 2021 (arXiv:2008.06006), construido sobre las librerias `lingvo` y `tensorflow` de Google, sin recurrir al codigo ni a la infraestructura interna propietaria de Google.

El modelo resuelve la tarea de separar la voz objetivo de voces interferentes multiples. Concretamente, se entrena con voz de usuario de LibriTTS a 24 kHz mezclada a 0 dB de SNR con voces reverberantes de CSTR VCTK. A diferencia de las variantes TEC, esta version no recibe ninguna entrada auxiliar (*side input*), por lo que su tamano de entrada lateral es de 0.000 KB y su funcionamiento es puramente acustico, sin depender de texto de la senal interferente.

Es relevante como referencia (*baseline*) para comparar tecnicas de cancelacion de eco textual: frente a `TecMultiInterfering` y `AecMultiInterfering`, permite aislar la contribucion del texto y del filtro adaptativo. Su coste computacional es de 6.32 GFLOPS, ocupa 0.2 GB en el repositorio y se distribuye con pesos en formato TensorFlow/Lingvo y una version cuantizada en TensorFlow Lite para inferencia en dispositivo. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seq2seq (encoder-decoder) sobre espectrogramas log-Mel de audio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion de rango dinamico (TFLite); checkpoint en precision completa (TensorFlow/Lingvo) |
| Idiomas soportados | no disponible (entrenado con corpus de habla en ingles: LibriTTS y CSTR VCTK) |
| Licencia | Apache 2.0 |
| Formato de pesos | TensorFlow/Lingvo checkpoint (`best.ckpt.data-00000-of-00001`, `.index`, `.meta`) y TensorFlow Lite (`model.tflite`) |

## Arquitectura y entrenamiento

El modelo es un sistema secuencia a secuencia (*encoder-decoder*) que opera sobre representaciones de audio en espectrograma log-Mel, segun se deduce de la API de inferencia, que devuelve `predicted_mel`. La variante `NoSideInput` no incorpora entrada auxiliar, a diferencia de las arquitecturas TEC del mismo paper, que reciben el texto de la locucion interferente como condicionamiento. La complejidad computacional declarada es de 6.32 GFLOPS, identica a la del modelo de referencia del paper, lo que sugiere una topologia equivalente a la linea base publicada.

En cuanto al entrenamiento, se uso voz de usuario de 24 kHz procedente de LibriTTS como senal objetivo y CSTR VCTK reverberante como fuente de interferencia multiplе, mezcladas a 0 dB de SNR. La evaluacion se realiza sobre LibriTTS (`test-clean` y `test-other`) mezclado a 0 dB SNR con respuestas al impulso de sala (RIR) sinteticas de RT60 = 0.25 s. No se especifica en la informacion disponible el numero de tokens o muestras de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF/DPO (no procede en un modelo de audio de este tipo). La evaluacion de la tasa de error de palabra (WER) se realiza con `Qwen3-ASR-0.6B-F16` a traves de `audio.cpp`, y la distorsion (MCD) con Dynamic Time Warping sobre 13 coeficientes MFCC.

## Capacidades

- Mejora de voz monofuente: separa una voz objetivo de multiples voces interferentes presentes en la mezcla.
- Cancelacion de eco acustico sin entrada lateral (*no side input*), a diferencia de las variantes TEC y AEC.
- Procesamiento de audio a 24 kHz con salida en espectrograma log-Mel.
- Inferencia en dispositivo mediante el modelo cuantizado TFLite incluido en el repositorio.
- Evaluacion reproducible mediante `evaluation_metrics.json` con resultados verificados para `test-clean` y `test-other`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio generativo ni soporte multilingue, ya que es un modelo especifico de mejora de voz.

## Casos de uso

- Linea base de investigacion en mejora de voz: permite comparar de forma controlada el efecto de incorporar texto interferente (variantes TEC) y filtros adaptativos (variantes AEC) frente a un modelo puramente acustico. Es el punto de referencia natural para medir la ganancia de cada tecnica.
- Preprocesado de ASR en entornos ruidosos: mejora la senal antes de un sistema de reconocimiento de voz, reduciendo el WER respecto a la senal de microfono sin tratar (de 34.17% a 31.16% en `test-clean` en la condicion de voces multiples).
- Captura de voz en dispositivos de consumo: al distribuirse con un modelo TFLite cuantizado de rango dinamico, puede ejecutarse en dispositivo (moviles, auriculares, altavoces inteligentes) sin enviar audio a la nube.
- Videollamadas y conferencias: supresion de voces de fondo de otros hablantes cuando no se dispone de una senal de referencia del eco.
- Reproduccion y validacion de resultados academicos: el repositorio incluye los checkpoints y las metricas verificadas, lo que facilita replicar las tablas del paper sobre LibriTTS.
- Punto de partida para ajuste fino: al ser un modelo entrenado sobre LibriTTS/VCTK, sirve como inicializacion para dominios acusticos concretos (coches, salas de reunion) con datos propios.

## Benchmarks y rendimiento

Resultados de la reproduccion de codigo abierto sobre `NoSideInputMultiInterfering`, bajo la condicion de voces interferentes multiples (LibriTTS + VCTK) a 0 dB SNR con RIR sinteticas (RT60 = 0.25 s):

| Metrica | test-clean | test-other | Referencia del paper (Vanilla-Seq2seq) |
|---|---|---|---|
| WER (%) ↓ | 31.16% (62/199) | 42.39% (103/243) | 19.7% / 38.7% |
| MCD (dB) ↓ | 7.93 dB | 8.72 dB | 7.53 / 8.87 |
| Tamano de entrada lateral (KB) ↓ | 0.000 KB | 0.000 KB | 0 KB |
| Complejidad computacional ↓ | 6.32 GFLOPS | 6.32 GFLOPS | 6.32 GFLOPS |

Comparativa completa entre modelos preentrenados y lineas base en la condicion de voces interferentes multiples (LibriTTS + VCTK):

| Metodo | WER (%) test-clean ↓ | WER (%) test-other ↓ | MCD (dB) test-clean ↓ | MCD (dB) test-other ↓ | Entrada lateral (KB) ↓ |
|---|---|---|---|---|---|
| `GroundTruth` | 5.03 | 7.82 | 0.00 | 0.00 | 0.000 |
| `MicrophoneSignal` | 34.17 | 48.97 | 7.67 | 7.70 | 0.000 |
| `NlmsAec` (AEC-NLMS) | 28.64 | 34.98 | 7.92 | 8.40 | 186.922 |
| `NoSideInputMultiInterfering` | 31.16 | 42.39 | 7.93 | 8.72 | 0.000 |
| `AecMultiInterfering` | 8.54 | 22.22 | 7.80 | 7.88 | 186.922 |
| `TecMultiInterfering` | 26.63 | 45.27 | 7.96 | 8.40 | 0.037 |

## Requisitos de hardware

- VRAM exacta: no disponible en la informacion proporcionada. El repositorio ocupa 0.2 GB, por lo que los pesos completos caben holgadamente en cualquier GPU de consumo actual.
- Complejidad computacional: 6.32 GFLOPS, lo que lo situa como un modelo ligero apto para inferencia en tiempo real en hardware modesto.
- GPU recomendadas: no especificadas por el autor. Dado su tamano y coste, cabe esperar ejecucion comoda en GPUs de consumo (por ejemplo, gama RTX) e incluso en CPU, aunque no se publican requisitos oficiales.
- Compatibilidad con GPU de consumo: si, segun el tamano del repositorio; no se aportan cifras oficiales de latencia.
- Opciones de despliegue: TensorFlow/Lingvo (checkpoint `best.ckpt`) mediante la libreria `textual-echo-cancellation`, y TensorFlow Lite (`model.tflite`) para inferencia en dispositivo con cuantizacion de rango dinamico.
- Latencia y throughput: no disponibles.
- Dependencias de despliegue: `pip3 install textual-echo-cancellation huggingface_hub`; el modelo se descarga con `huggingface_hub.snapshot_download`.

## Comparativa con modelos similares

Comparativa dentro de la condicion de voces interferentes multiples (LibriTTS + VCTK), misma tarea de mejora de voz:

| Modelo | Enfoque | WER test-clean ↓ | WER test-other ↓ | MCD test-clean ↓ | Entrada lateral | Licencia |
|---|---|---|---|---|---|---|
| `wq2012/vanilla_seq2seq_multi_interfering` | Seq2seq sin entrada lateral | 31.16 | 42.39 | 7.93 | 0.000 KB | Apache 2.0 |
| `wq2012/aec_multi_interfering` | Cancelacion de eco con filtro adaptativo | 8.54 | 22.22 | 7.80 | 186.922 KB | Apache 2.0 (no confirmada en la informacion) |
| `wq2012/tec_multi_interfering` | Cancelacion de eco textual | 26.63 | 45.27 | 7.96 | 0.037 KB | Apache 2.0 (no confirmada en la informacion) |
| `wq2012/vanilla_seq2seq_single_interfering` | Seq2seq sin entrada lateral (un solo interferente) | 45.23 | 91.53 | 9.58 | 0.000 KB | Apache 2.0 (no confirmada en la informacion) |

El modelo se situa como la linea base mas debil en WER dentro de las variantes con texto o filtro adaptativo, pero sin coste de entrada lateral. `AecMultiInterfering` obtiene el mejor WER a cambio de una entrada lateral de 186.922 KB, mientras que `TecMultiInterfering` reduce drasticamente esa entrada (0.037 KB) manteniendo un WER intermedio.

## Limitaciones y advertencias

- Por diseno no utiliza informacion textual de la senal interferente, por lo que su WER es notablemente peor que las variantes TEC y AEC en la misma condicion.
- El WER medido (31.16% / 42.39%) esta por encima del reportado en el paper de referencia (19.7% / 38.7% en `test-clean` / `test-other`), lo que indica una brecha de reproduccion que conviene tener en cuenta antes de usarlo como referencia absoluta.
- El modelo se entrena y evalua sobre corpus de habla en ingles (LibriTTS y CSTR VCTK); no se documentan capacidades multilingues.
- No se aportan datos sobre sesgos, robustez a dominios acusticos distintos de los de entrenamiento ni comportamiento fuera de las condiciones evaluadas (0 dB SNR, RT60 = 0.25 s).
- Riesgo de alucinacion acustica en la senal reconstruida: como todo modelo generativo seq2seq sobre espectrogramas, puede introducir artefactos o distorsion cuando la mezcla se aleja de la distribucion de entrenamiento.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, que permite uso comercial; conviene verificar de forma independiente las licencias de los corpus (LibriTTS y VCTK) y de la libreria `lingvo` para produccion.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento del registro, por lo que no cuenta con validacion de la comunidad.
- La model card proporcionada aparece truncada en la seccion de uso de TFLite, por lo que los detalles completos de esa ruta de inferencia pueden no estar reflejados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/vanilla_seq2seq_multi_interfering
- Repositorio GitHub (reproduccion de codigo abierto): https://github.com/wq2012/tec
- Paquete PyPI (`textual-echo-cancellation`): https://pypi.org/project/textual-echo-cancellation/
- Paper (Textual Echo Cancellation, IEEE SLT 2021, arXiv:2008.06006v4): https://arxiv.org/pdf/2008.06006
- Pagina de demos de audio: https://google.github.io/speaker-id/publications/TEC/
- Modelo relacionado `vanilla_seq2seq_single_interfering`: https://huggingface.co/wq2012/vanilla_seq2seq_single_interfering
- Modelo relacionado `aec_single_interfering`: https://huggingface.co/wq2012/aec_single_interfering
- Modelo relacionado `tec_single_interfering`: https://huggingface.co/wq2012/tec_single_interfering
- Modelo relacionado `aec_multi_interfering`: https://huggingface.co/wq2012/aec_multi_interfering
- Modelo relacionado `tec_multi_interfering`: https://huggingface.co/wq2012/tec_multi_interfering
- Libreria Lingvo (TensorFlow): https://github.com/tensorflow/lingvo
