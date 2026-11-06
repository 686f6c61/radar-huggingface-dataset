# T0mSIlver/nemotron-labs-unified-asr-0.6b-4bit

## Resumen

`T0mSIlver/nemotron-labs-unified-asr-0.6b-4bit` es una conversion a formato MLX y cuantizacion de 4 bits del modelo `nvidia/nemotron-labs-unified-asr-0.6b`, un sistema de reconocimiento automatico del habla (ASR) desarrollado por NVIDIA. El checkpoint original esta pensado para transcribir audio de forma offline y tambien en streaming, con un unico modelo que cubre ambos regimenes y anade puntuacion y mayusculas al texto generado. La version aqui descrita la mantiene el usuario T0mSIlver y esta optimizada para ejecutarse en hardware Apple Silicon mediante la libreria `mlx-audio`.

El modelo emplea una arquitectura de tipo RNNT (Recurrent Neural Network Transducer), segun indican las etiquetas del repositorio, con aproximadamente 626,7 millones de parametros. Su interes practico reside en que unifica transcripcion offline y streaming en un solo checkpoint, soporta 25 idiomas europeos y ofrece latencias de streaming configurables entre 160 ms y 2,08 s. Esto lo hace util para dictado en tiempo real, subtitulado y asistentes de voz en entornos locales.

La relevancia de esta ficha concreta es que la conversion a 4 bits reduce el peso del repositorio a unos 472 MB (0,5 GB en total), lo que permite desplegar el modelo en portatiles y equipos de sobremesa con Apple Silicon sin depender de GPUs dedicadas. Es una derivacion del modelo de NVIDIA, por lo que su uso queda sujeto a la licencia OpenMDW 1.1 del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNNT (transducer) para ASR, segun etiquetas del repositorio |
| Parametros totales | 626.702.592 (aprox. 0,63 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana de texto; en streaming re-codifica 5,6 s de contexto izquierdo por paso |
| Tipos de cuantizacion | 4 bits (grupo 64) en capas Linear y Embedding; resto en bfloat16. Existen variantes bf16 (1,25 GB) y 8 bits (744 MB) |
| Idiomas soportados | 25 idiomas europeos: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | OpenMDW 1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como un sistema ASR basado en RNNT (transducer), una arquitectura clasica en reconocimiento del habla que combina un encoder acustico, un predictor y una red de union para alinear audio y tokens de texto. El modelo base es `nvidia/nemotron-labs-unified-asr-0.6b`, en su revision `023ce907`, y esta disenado para operar tanto en modo offline como en streaming con un unico conjunto de pesos. La entrada es audio mono a 16 kHz con una duracion minima de 80 ms.

La conversion a MLX se realizo con la herramienta `nemotron_asr.convert` de `mlx-audio`: las capas Linear y Embedding se cuantizaron a 4 bits con grupo de 64, mientras que el resto de pesos se mantienen en bfloat16. El autor reporta paridad con el streaming con buffer de NeMo 3.1: el port de `mlx-audio` en float32 produce tramas del encoder con una diferencia de 8,2e-6 respecto a NeMo y los mismos tokens en varias configuraciones de contexto y latencia. No se detallan en la informacion proporcionada el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

Una innovacion destacable es el esquema de streaming con buffer: en cada paso se re-codifican 5,6 s de contexto izquierdo junto con el nuevo fragmento y su contexto derecho. El autor advierte que mantener el contexto izquierdo en 2 s o mas es importante, ya que por debajo NVIDIA reporta degradacion de la precision. Tambien se senala que, a baja latencia, el modo `auto` de deteccion de idioma puede emitir los primeros tokens en un idioma incorrecto, por lo que se recomienda indicar explicitamente el idioma hablado.

## Capacidades

- Transcripcion de voz offline de audio mono a 16 kHz, con puntuacion y mayusculas.
- Transcripcion en streaming con latencias configurables entre 160 ms y 2,08 s.
- Soporte de 25 idiomas europeos en un unico checkpoint.
- Deteccion automatica de idioma (`auto`), con la salvedad de posibles errores en los primeros tokens a baja latencia.
- Generacion de texto con capitalizacion y puntuacion integradas, sin postprocesado adicional.
- Integracion en Python mediante `mlx-audio` (`model.generate`, `create_streaming_session`) y en Swift mediante `mlx-audio-swift`.
- Ejecucion local en hardware Apple Silicon, sin necesidad de GPU dedicada.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Dictado en tiempo real en macOS: el modelo puede crear una sesion de streaming con `create_streaming_session` y una latencia de 320 ms, transcribiendo mientras el usuario habla y anadiendo puntuacion, lo que lo hace adecuado para editores de texto y notas de voz.
- Subtitulado de reuniones y videollamadas: con latencias de 160 ms a 2,08 s y contexto izquierdo de 5,6 s, puede generar subtitulos en directo en cualquiera de los 25 idiomas soportados, ejecutandose localmente en un portatil Apple Silicon.
- Transcripcion por lotes de archivos de audio: el modo offline permite procesar grabaciones completas (podcasts, entrevistas, clases) con un unico checkpoint, sin depender de servicios en la nube.
- Asistentes de voz locales: al ejecutarse con `mlx-audio` en Python o Swift y ocupar unos 472 MB en 4 bits, puede integrarse en aplicaciones de escritorio o moviles que necesiten privacidad y funcionamiento sin conexion.
- Accesibilidad: conversion de voz a texto en tiempo real para personas con discapacidad auditiva, con la ventaja de que el procesamiento ocurre en el dispositivo y no requiere enviar audio a terceros.
- Investigacion en ASR multilingue: el soporte de 25 idiomas europeos y la paridad reportada con NeMo permiten usarlo como referencia o baseline en experimentos de reconocimiento del habla, comparando variantes de cuantizacion (4 bits, 8 bits, bf16).
- Prototipado rapido en Swift: la API `mlx-audio-swift` permite incorporar transcripcion en streaming a aplicaciones nativas de Apple con pocas lineas de codigo.

## Benchmarks y rendimiento

El autor no publica tablas de WER propias para esta conversion; remite a las tablas de NVIDIA (FLEURS, MCV, MLS y conjuntos Open ASR en ingles) del modelo bf16 en NeMo. Los datos disponibles en la model card son los siguientes:

| Metrica | Valor reportado |
|---|---|
| Paridad con NeMo 3.1 (float32, mlx-audio) | Tramas del encoder dentro de 8,2e-6; mismos tokens en configuraciones 5,6 s / 80 ms / 240 ms, 0,8 s / 80 ms / 240 ms y 0,8 s / 160 ms / 400 ms |
| Paridad con NeMo (Swift, bfloat16) | Texto identico en 10 de 12 clips; 3 ediciones de palabra sobre 355 palabras |
| Streaming a 320 ms, conjunto de dictado EN/FR de 260 clips, 8 bits | Recuerdo de terminos 60,7 %; WER en el resto de palabras 6,5 % (frente a 55,5 % y 11,7 % de `mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit`) |
| Tiempo medio por paso de 80 ms en M1 Pro (Swift, 320 ms de latencia) | 8 bits: 68,6 ms; 4 bits: 68,7 ms; bf16: 64,8 ms; float16 en activaciones: 57,4 ms (ahorro del 16 %, misma precision) |
| Chunk de 160 ms con 160 ms de contexto derecho | 34,7 ms por paso (mitad de GPU) con +0,6 puntos de WER en FLEURS; con activaciones float16, 26,9 ms por paso y 896 MB de memoria pico, estable durante 30 minutos |

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio 4 bits ocupa unos 472 MB (0,5 GB en total); la variante 8 bits, 744 MB; la bf16, 1,25 GB. El autor reporta 896 MB de memoria pico en la configuracion de 160 ms con activaciones float16.
- GPU recomendadas: el modelo esta empaquetado para MLX, por lo que el hardware objetivo es Apple Silicon (serie M). El autor aporta mediciones en un M1 Pro.
- Compatibilidad con GPU de consumo: si, en equipos Apple Silicon; no se documenta soporte para GPUs NVIDIA o AMD en esta conversion.
- Opciones de despliegue: `mlx-audio` (Python) y `mlx-audio-swift` (Swift). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en un M1 Pro, el paso de 80 ms tarda entre 57,4 y 68,7 ms segun cuantizacion y tipo de activaciones; con chunk de 160 ms y activaciones float16 baja a 26,9 ms por paso. La cuantizacion ahorra memoria, no tiempo, porque el paso esta limitado por computo a 75 tramas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/streaming | Licencia | Formato |
|---|---|---|---|---|---|
| T0mSIlver/nemotron-labs-unified-asr-0.6b-4bit | 626,7 M | 25 europeos | Streaming 160 ms-2,08 s; offline | OpenMDW 1.1 | MLX safetensors 4 bits |
| T0mSIlver/nemotron-labs-unified-asr-0.6b-8bit | 626,7 M | 25 europeos | Igual que el 4 bits | OpenMDW 1.1 | MLX safetensors 8 bits |
| T0mSIlver/nemotron-labs-unified-asr-0.6b-bf16 | 626,7 M | 25 europeos | Igual que el 4 bits | OpenMDW 1.1 | MLX safetensors bf16 |
| mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit | no disponible | no disponible | Streaming | no disponible | MLX 8 bits |
| nvidia/nemotron-labs-unified-asr-0.6b (original) | 626,7 M | 25 europeos | Streaming y offline | OpenMDW 1.1 | NeMo (bf16) |

La comparacion directa con `mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit` en el conjunto de dictado EN/FR de 260 clips favorece a esta conversion: 60,7 % de recuerdo de terminos y 6,5 % de WER frente a 55,5 % y 11,7 %. No se dispone de datos de benchmarks frente a otros sistemas ASR como Whisper en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo base es de NVIDIA y esta licenciado bajo OpenMDW 1.1; los pesos convertidos son una obra derivada y su uso comercial queda sujeto a los terminos de dicha licencia.
- A baja latencia, el modo `auto` de deteccion de idioma puede emitir los primeros tokens en un idioma incorrecto; se recomienda pasar el idioma de forma explicita.
- El contexto izquierdo debe mantenerse en 2 s o mas; por debajo, NVIDIA reporta degradacion de la precision.
- La cuantizacion a 4 bits reduce memoria pero no acelera la inferencia: el paso esta limitado por computo a 75 tramas.
- Solo soporta 25 idiomas europeos; no cubre otras familias linguisticas.
- La entrada debe ser audio mono a 16 kHz con al menos 80 ms de duracion; no se documenta soporte para otros formatos o frecuencias.
- El modelo esta empaquetado exclusivamente para MLX y Apple Silicon; no hay soporte documentado para CUDA, ROCm ni otras plataformas.
- Riesgo de alucinacion y errores de transcripcion en audio ruidoso o con acentos no representados en los datos de entrenamiento; no se detallan sesgos conocidos en la informacion disponible.
- La model card no incluye tablas de WER propias para esta conversion; los datos de precision de NVIDIA corresponden al modelo bf16 en NeMo y no necesariamente se trasladan a la version cuantizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/T0mSIlver/nemotron-labs-unified-asr-0.6b-4bit
- Modelo base: https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b
- Variante bf16: https://huggingface.co/T0mSIlver/nemotron-labs-unified-asr-0.6b-bf16
- Variante 8 bits: https://huggingface.co/T0mSIlver/nemotron-labs-unified-asr-0.6b-8bit
- Modelo comparado: https://huggingface.co/mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit
- Licencia OpenMDW 1.1: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
