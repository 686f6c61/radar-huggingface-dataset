# yunyu1258/x-asr-axmodel

## Resumen

X-ASR AXMODEL es la conversión del encoder de un sistema de reconocimiento automático del habla (ASR) al formato `axmodel` propietario de los aceleradores NPU AXERA AX650. El modelo original, X-ASR-zh-en de GilgameshWind, es un transducer Zipformer2 de aproximadamente 0,16 mil millones de parámetros entrenado para reconocimiento bilingüe chino-inglés bajo licencia Apache-2.0. Este repositorio no contiene pesos nuevos ni un modelo entrenado desde cero: es un artefacto de despliegue que empaqueta el encoder en formato ejecutable por la NPU, junto con el decoder y el joiner en ONNX para ejecutarse en CPU.

El problema que resuelve es la ejecución de ASR en dispositivos de borde con aceleración hardware específica. En lugar de depender de una GPU o de la CPU del sistema, el encoder se ejecuta en la NPU AX650, lo que permite integrar transcripción de voz en equipos empotrados con bajo consumo. La arquitectura es un transducer (encoder Zipformer2 + decoder + joiner) con ventana fija de 10 segundos de features fbank a 80 dimensiones, que produce una salida de 248 frames por 512 dimensiones.

Es relevante para desarrolladores que trabajan con hardware AXERA y necesitan ASR local sin depender de servicios en la nube. El repositorio incluye el `.axmodel`, el ONNX equivalente en fp32 para validación sin placa, los componentes de decodificación en CPU, el vocabulario de 5000 tokens y audios de prueba. El tamaño total del repositorio es de 0,4 GB y el modelo soporta chino e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer Zipformer2 (encoder en NPU, decoder y joiner en CPU) |
| Parametros totales | 0,16 mil millones (aprox., modelo original X-ASR) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana fija de 10 s (1000 frames fbank); audio mas largo se trocea en ventanas con paso de 8 s |
| Tipos de cuantizacion | no disponible (el artefacto es un `.axmodel` compilado para AX650; se incluye ONNX fp32 de referencia) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.axmodel` (NPU AXERA), `.onnx` (encoder fp32, decoder, joiner), `tokens.txt` |

## Arquitectura y entrenamiento

El sistema sigue el esquema transducer clasico: un encoder Zipformer2 procesa las features acusticas y genera representaciones latentes, un decoder (predictor) modela el historial de tokens emitidos y un joiner combina ambas representaciones para producir la distribucion sobre el vocabulario. En este repositorio el encoder se ha compilado a `.axmodel` mediante Pulsar2 (el toolchain de AXERA) para ejecutarse en la NPU AX650, mientras que el decoder y el joiner permanecen en ONNX y se ejecutan en CPU mediante onnxruntime con busqueda voraz (greedy search).

La entrada del encoder es un tensor `x4d` de forma `[1, 1, 1000, 80]`, correspondiente a 10 segundos de features fbank de 80 dimensiones, y la salida es `encoder_out` de forma `[1, 248, 512]`. El vocabulario consta de 5000 tokens en una version sin puntuacion. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original; esos detalles corresponden a la model card de X-ASR-zh-en, no incluida en la informacion proporcionada. La innovacion tecnica destacable de este repositorio es la cuantizacion y compilacion del encoder a un formato ejecutable por NPU con perdida de precision minima (cosine medio 0,998101 en la simulacion de Pulsar2).

## Capacidades

- Reconocimiento automatico del habla offline en chino e ingles, con salida de texto sin puntuacion.
- Ejecucion del encoder en NPU AXERA AX650 (y series AX630C segun la model card), con decoder y joiner en CPU.
- Decodificacion transducer con busqueda voraz sobre un vocabulario de 5000 tokens.
- Procesamiento de audio de 16 kHz mono en ventanas fijas de 10 s, con troceado en pasos de 8 s para audio mas largo.
- Validacion cruzada ONNX frente a AXMODEL mediante el encoder fp32 incluido, util para verificar la integracion sin disponer de placa.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla del propio ASR.

## Casos de uso

- Transcripcion de voz en dispositivos empotrados con NPU AX650: el encoder se ejecuta en la NPU y libera la CPU para otras tareas, adecuado para equipos de bajo consumo que necesitan ASR local sin nube.
- Subtitulado offline de reuniones o entrevistas en chino e ingles: el modelo transcribe audio de 16 kHz troceando en ventanas de 10 s con paso de 8 s, apropiado para grabaciones de duracion media en entornos sin conectividad.
- Interfaces de voz para electrodomesticos o terminales industriales: al ejecutarse en hardware AXERA, permite comandos de voz bilingues en dispositivos sin GPU dedicada.
- Validacion de pipelines ASR en produccion: el ONNX fp32 incluido permite comparar la salida del `.axmodel` con la referencia y detectar regresiones de precision antes de desplegar en placa.
- Investigacion en despliegue de transducers en NPU: el repositorio sirve como ejemplo reproducible de conversion Zipformer2 a formato AXERA, con scripts enlazados en el repositorio de GitHub del autor.
- Prototipado de asistentes de transcripcion bilingues: la combinacion de encoder en NPU y decoder/joiner en CPU facilita montar un pipeline completo en un equipo de borde con onnxruntime y axengine.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| cosine medio (ONNX vs AXMODEL, Pulsar2) | 0,998101 |
| cosine minimo | 0,996739 |
| MAE | 0,08-0,14 |
| Consistencia de texto (0.wav) | completamente identica |
| Consistencia de texto (1.wav) | 10 tokens de diferencia (palabras en ingles) |
| Consistencia de texto (2.wav) | 3 tokens de diferencia |
| Consistencia de texto (3.wav) | 3 tokens de diferencia |

No se han publicado resultados de benchmarks estandar (WER, MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos anteriores miden unicamente la fidelidad de la conversion a NPU frente al ONNX de referencia, no la calidad del reconocimiento.

## Requisitos de hardware

- NPU AXERA AX650 (y series AX630C segun la model card) con el runtime `axengine` instalado.
- CPU para ejecutar decoder y joiner en ONNX mediante onnxruntime.
- Memoria: el repositorio ocupa 0,4 GB; no se especifica el consumo de VRAM o memoria de la NPU durante la inferencia.
- No cabe en GPU consumer convencional en su forma `.axmodel`; el encoder ONNX fp32 si puede ejecutarse en CPU o GPU generica para validacion.
- Despliegue: `axengine` para el encoder en NPU y onnxruntime para decoder/joiner; el script `run_asr.py` del repositorio orquesta el pipeline.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| X-ASR AXMODEL (este) | ~0,16 B | ventana fija 10 s | zh, en | Apache-2.0 | `.axmodel` + ONNX, NPU AXERA |
| X-ASR-zh-en (original) | ~0,16 B | no disponible | zh, en | Apache-2.0 | pesos originales, sin compilar a NPU |
| Whisper small | ~0,24 B | 30 s | multilingue | MIT | safetensors, GPU/CPU |
| Zipformer sherpa-onnx (generico) | variable | variable | variable | variable | ONNX, CPU |

La comparativa con Whisper small y Zipformer generico se ofrece como referencia de categoria (ASR de tamano pequeno); no se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Ventana fija de 10 s (1000 frames); audio mas largo se trocea con paso de 8 s, lo que puede introducir cortes en palabras en los limites de ventana.
- Salida sin puntuacion: el `tokens.txt` es la version sin signos de puntuacion, por lo que el texto requiere postprocesado para uso editorial.
- Dependencia de hardware propietario: requiere NPU AX650/AX630C y el runtime `axengine`; no es portable a otras plataformas sin reconvertir.
- Solo chino e ingles; no se documenta soporte de otros idiomas.
- Riesgo de alucinacion y errores en palabras en ingles (el test 1.wav muestra 10 tokens de diferencia frente a la referencia ONNX).
- No se dispone de datos sobre sesgos del modelo original ni sobre su calidad en dominios especificos (medico, legal, acentos).
- Licencia Apache-2.0 permite uso comercial, pero el modelo original y los scripts de conversion deben verificarse en sus repositorios respectivos antes de produccion.
- No se documentan requisitos de memoria de la NPU ni latencias, lo que dificulta planificar el despliegue sin pruebas en placa.

## Enlaces

- Hugging Face: https://huggingface.co/yunyu1258/x-asr-axmodel
- Modelo original X-ASR-zh-en: https://huggingface.co/GilgameshWind/X-ASR-zh-en
- Repositorio de conversion y scripts: https://github.com/yuyun2000/x-asr-axmodel
