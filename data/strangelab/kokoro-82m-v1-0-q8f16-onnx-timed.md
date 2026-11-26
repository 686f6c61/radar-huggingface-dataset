# strangelab/kokoro-82m-v1.0-q8f16-onnx-timed

## Resumen

Kokoro-82M-v1.0-q8f16-onnx-timed es una variante del modelo de sintesis de voz Kokoro v1.0, un TTS de 82 millones de parametros desarrollado originalmente por Hexgrad. El repositorio lo publica Strange Lab como un grafo ONNX cuantizado en q8f16 (pesos de 8 bits y activaciones en float16) que anade una segunda salida llamada `duration`, con los recuentos enteros de frames que el decodificador de Kokoro emplea para generar la forma de onda. Esa salida permite al lector continuo de la libreria `kokoro-onnx` 0.6.1 unir ventanas de un pasaje largo y devolver marcas de inicio y fin para cada fonema.

La relevancia de esta variante es el tamano: el grafo ocupa 86,03 MB frente a los 114,12 MB del grafo INT8 con timestamps oficial, un ahorro de 28,09 MB (24,6 %). El modelo base pesa unos 82 M de parametros y esta pensado para sintesis de voz offline en CPU, con un banco de voces separado (`voices-v1.0.bin`) que se mantiene compatible con la version oficial. La licencia Apache 2.0 permite uso comercial.

Se trata de un modelo unicamente en ingles, orientado a lectura continua de pasajes con marcas de tiempo por fonema. No es un modelo de proposito general: es un artefacto de inferencia especializado para pipelines de TTS que necesitan alineacion temporal fina y un tamano de descarga reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 con decodificador iSTFTNet (TTS no autorregresivo basado en difusion/estilo) |
| Parametros totales | 82 M (modelo base Kokoro v1.0) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje; procesa por ventanas de texto) |
| Tipos de cuantizacion | q8f16 (pesos 8 bits, activaciones float16) en ONNX |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (grafo unico de 86.033.696 bytes) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Kokoro v1.0, que combina StyleTTS 2 para el modelado de estilo y prosodia con un decodificador iSTFTNet para la generacion de la forma de onda a 24 kHz. Es un sistema no autorregresivo que produce audio a partir de fonemas y un vector de estilo asociado a la voz seleccionada. Strange Lab no reentrena los tensores aprendidos: parte del checkpoint q8f16 exportado por ONNX Community y anade una segunda salida `duration` con los recuentos enteros de frames que el decodificador usa internamente. El vocabulario incluido coincide con el del modelo Python oficial y con el valor por defecto del paquete 0.6.1.

Los datos de entrenamiento originales no se detallan en la informacion disponible mas alla de las fuentes citadas por Hexgrad: grabaciones tnc de Koniwa (CC BY 3.0) y el corpus SIWIS (CC BY 4.0). No se especifica el numero de tokens ni de horas de audio, ni si hubo etapas de RLHF o DPO (en TTS no es el paradigma habitual). La innovacion tecnica de esta variante es la exposicion de los recuentos de frames como salida ONNX adicional, que el lector continuo de `kokoro-onnx` usa para concatenar ventanas sin cortes y emitir marcas temporales por fonema. El grafo usa exclusivamente operadores estandar de ONNX y ONNX Runtime.

## Capacidades

- Sintesis de voz en ingles a 24 kHz a partir de texto, con banco de voces externo (`voices-v1.0.bin`, 54 voces).
- Lectura continua de pasajes largos mediante el modo `continuous=True` del lector Python, que une ventanas de sintesis.
- Emision de marcas temporales por fonema: inicio y fin de cada unidad en segundos (5.084 spans ordenados en la validacion del autor).
- Salida `duration` con recuentos enteros de frames que permiten alineacion con la forma de onda generada.
- Compatibilidad con el servicio HTTP Elvenspeak sin modificaciones, mediante el ajuste de nombre de fichero de modelo existente.
- Ejecucion offline en CPU con ONNX Runtime; no requiere GPU.
- No soporta tool calling, agentes, vision, audio de entrada ni modo thinking: es exclusivamente TTS.

## Casos de uso

- Audiolibros y lectura de pasajes largos: el modo continuo del lector une ventanas de sintesis y las marcas por fonema permiten generar subtitulos o karaoke sincronizado con el audio a nivel de fonema.
- Subtitulado y alineacion forzada: las marcas de inicio y fin por fonema sirven para alinear transcripciones con el audio generado en pipelines de accesibilidad o doblaje.
- Asistentes de voz offline en dispositivos: con 86 MB de grafo y ejecucion en CPU via ONNX Runtime, cabe en entornos con poca memoria y sin conexion, por ejemplo aplicaciones de escritorio o sistemas empotrados.
- Generacion de narracion en CI/CD: el modelo se puede empaquetar como dependencia Python (`kokoro-onnx==0.6.1`, `onnxruntime==1.32.0`) y generar audio de prueba en pipelines automatizados con un coste de descarga reducido.
- Servicios HTTP de TTS: integrable en Elvenspeak u otros servicios que acepten grafos ONNX de Kokoro, devolviendo audio de 24 kHz y spans de caracteres ordenados.
- Prototipado de interfaces de voz: el banco de voces oficial y el compacto sin perdida (54 voces) permiten alternar timbres sin cambiar el grafo, util para demos y pruebas de UX.
- Investigacion en prosodia y timing: la exposicion de los recuentos de frames facilita experimentos sobre duracion de fonemas y su relacion con la forma de onda generada.

## Benchmarks y rendimiento

| Medicion | INT8 timed oficial | Este grafo |
|---|---:|---:|
| Bytes del grafo | 114.119.327 | 86.033.696 |
| Errores de palabra en lectura Whisper sobre 880 palabras de referencia | 52 | 54 |

Validacion del autor: cuatro pasajes de libros en ingles, dos voces de stock, ocho lecturas emparejadas en CPU Apple M4. Sobre 19 ventanas, el nuevo grafo reprodujo todas las muestras de su fuente q8f16 con entradas identicas. El lector continuo devolvio 5.084 spans de fonema ordenados en las ocho lecturas. El tiempo mediano de sintesis por segundo de audio aumento un 5,1 %; la lectura mas lenta tardo 0,181 s de computo por segundo de audio. La comparacion cubrio ingles, dos voces, velocidad 1.0 y el execution provider de CPU. El acuerdo con anotaciones humanas de timing y las preferencias de oyentes no se han medido. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM: no requiere GPU; el grafo de 86 MB se ejecuta en CPU con ONNX Runtime. La memoria RAM necesaria es del orden de cientos de MB incluyendo runtime y banco de voces.
- GPU recomendadas: no aplica; el autor valido en CPU Apple M4 y el execution provider de CPU. Cualquier GPU compatible con ONNX Runtime CUDA podria usarse, pero no se aportan datos.
- Cabe en cualquier equipo consumer: la descarga total con banco de voces oficial es de 114,25 MB (frente a 142,33 MB con el grafo INT8 timed); con el banco compacto sin perdida, 103,72 MB.
- Despliegue: `kokoro-onnx` 0.6.1 sobre `onnxruntime` 1.32.0, con `soundfile` y `huggingface_hub` como dependencias. Tambien se ha probado con el servicio HTTP Elvenspeak en Python 3.13.
- Latencia y throughput: 0,181 s de computo por segundo de audio en el peor caso medido (CPU Apple M4, ingles, velocidad 1.0); el tiempo mediano por segundo de audio es un 5,1 % superior al del grafo INT8 timed oficial. Los tiempos dependen del host y del runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Timestamps |
|---|---|---|---|---|---|
| Kokoro-82M-v1.0-q8f16-onnx-timed (este) | 82 M | no aplica (TTS por ventanas) | ONNX q8f16, 86 MB | Apache 2.0 | Si, por fonema (salida `duration`) |
| onnx-community/Kokoro-82M-v1.0-ONNX (q8f16 estandar) | 82 M | no aplica | ONNX q8f16, mismo tamano | Apache 2.0 | No |
| Kokoro v1.0 timed INT8 oficial | 82 M | no aplica | ONNX INT8, 114 MB | Apache 2.0 | Si, estimaciones fraccionarias antes de redondear |
| hexgrad/Kokoro-82M (original PyTorch) | 82 M | no aplica | safetensors/PyTorch | Apache 2.0 | No por defecto |

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues.
- Es un modelo TTS, no un modelo de lenguaje: no genera texto, codigo ni razonamiento.
- El acuerdo con anotaciones humanas de timing y las preferencias de oyentes no se han medido; las marcas por fonema verifican cobertura y consistencia con el audio, no precision perceptiva.
- Los errores de lectura Whisper aumentan ligeramente (54 frente a 52 sobre 880 palabras), lo que sugiere una fidelidad de pronunciacion marginalmente inferior.
- El tiempo de sintesis mediano por segundo de audio es un 5,1 % superior al grafo INT8 timed oficial.
- Riesgo de artefactos o prosodia imperfecta en pasajes muy largos si el modo continuo no se configura correctamente; el modelo procesa por ventanas.
- Los sesgos del banco de voces (54 timbres) no estan documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero las fuentes de entrenamiento citadas (tnc de Koniwa CC BY 3.0, SIWIS CC BY 4.0) imponen atribucion; conviene revisar los creditos originales antes de distribuir.
- Dependencia de versiones concretas (`kokoro-onnx==0.6.1`, `onnxruntime==1.32.0`); cambios de version pueden romper la compatibilidad del vocabulario o del lector continuo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/strangelab/kokoro-82m-v1.0-q8f16-onnx-timed
- Grafo fuente: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/tree/1939ad2a8e416c0acfeecc08a694d14ef25f2231/onnx
- Modelo y creditos originales (Hexgrad): https://huggingface.co/hexgrad/Kokoro-82M
- Runtime Python kokoro-onnx: https://github.com/thewh1teagle/kokoro-onnx
- Ficheros de modelo oficiales (releases v1.1): https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1
- Banco de voces compacto sin perdida: https://huggingface.co/strangelab/kokoro-82m-voices-v1.0-lossless
- Fuente de Elvenspeak probada: https://github.com/promptctl/elvenspeak/tree/6925a7809413f5000ec470a600de64016be97ec5
