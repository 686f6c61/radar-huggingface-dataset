# transcriber-app/parakeet-tdt-0.6b-v3-mlx-8bit

## Resumen

`transcriber-app/parakeet-tdt-0.6b-v3-mlx-8bit` es una redistribución cuantizada a 8 bits del modelo de reconocimiento automatico del habla (ASR) NVIDIA Parakeet TDT 0.6B v3, adaptada al formato MLX para ejecución local sobre silicio de Apple. Lo publica el usuario `transcriber-app` partiendo de la conversión a MLX de `mlx-community/parakeet-tdt-0.6b-v3`, que a su vez deriva de los pesos oficiales de NVIDIA.

El modelo resuelve transcripción de voz a texto multilingüe en 25 idiomas europeos, con un tamaño de 627.052.166 parámetros (0,6 B) y una arquitectura FastConformer con decodificador TDT (Token-and-Duration Transducer) heredada de NeMo. Su relevancia es que reduce el peso en disco de 2,5 GB en fp32 a 744 MB manteniendo la precisión del modelo original, lo que permite ejecutar ASR de calidad en un portátil Apple sin conexión a red.

La cuantización afecta a 221 módulos `Linear` y `Embedding` (proyecciones de atención y feed-forward, proyecciones pre-encoder y joint, así como el embedding de la red de predicción) a 8 bits con grupo de tamaño 64; el resto de tensores (convoluciones, LSTM y normalizaciones) se conservan en bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT (Token-and-Duration Transducer, decoder tipo transductor) |
| Parametros totales | 627.052.166 (0,6 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits, group size 64 (affine); el autor publica tambien 6 bits y 4 bits |
| Idiomas soportados | 25: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX cuantizado, `model.safetensors`, 744 MB) |
| Libreria de carga | mlx |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base NVIDIA Parakeet TDT 0.6B v3: un encoder FastConformer (variante eficiente de Conformer con atencion subsamplada) seguido de un decodificador transductor TDT, que predice de forma conjunta tokens y sus duraciones. Los tensores incluyen proyecciones pre-encoder, una red de predicción con capas LSTM, proyecciones joint y normalizaciones, lo que confirma el esquema transductor de NeMo en lugar de un decoder autorregresivo de tipo Transformer puro.

No se aporta en la información disponible detalle sobre el dataset de entrenamiento original (número de horas, composición, corpus empleados) ni sobre fases de RLHF o DPO; esos datos corresponden a la model card del modelo base de NVIDIA, no a esta redistribución. La innovación técnica de este repositorio es exclusivamente la cuantización: se aplica `mlx.nn.quantize` a 8 bits con group size 64 y esquema affine sobre las capas `Linear` y `Embedding` (221 módulos), manteniendo convoluciones, LSTM y capas de normalización en bfloat16. Los nombres de tensores se conservan respecto al checkpoint fuente y `config.json` incorpora un bloque `"quantization": {"group_size": 64, "bits": 8}`, de modo que los cargadores que respetan ese bloque y leen el layout de mlx-community pueden cargarlo directamente.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto en 25 idiomas europeos.
- Multilingue: ingles, castellano, frances, aleman, bulgaro, croata, checo, danes, neerlandes, estonio, finlandes, griego, hungaro, italiano, leton, lituano, maltes, polaco, portugues, rumano, eslovaco, esloveno, sueco, ruso y ucraniano.
- Decodificacion codiciosa (greedy) reproducible, tal como se documenta en las mediciones del autor.
- Ejecucion en dispositivo (on-device) sobre silicio de Apple mediante MLX, sin necesidad de GPU dedicada.
- No soporta tool calling ni function calling: es un modelo de reconocimiento de voz, no un modelo generativo de texto.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision ni de audio mas alla de la transcripcion (no genera descripciones, no responde a preguntas sobre el audio).
- No dispone de modo de razonamiento (thinking) ni de generacion de codigo o matematicas.

## Casos de uso

- Transcripcion local en Mac con privacidad: el modelo se ejecuta con MLX sobre Apple silicon y un peso de 744 MB, por lo que el audio no sale del equipo. Adecuado para entornos con requisitos de confidencialidad (legal, salud, periodismo).
- Subtitulado y generacion de subtitulos para video: al cubrir 25 idiomas europeos, permite transcribir material audiovisual multilingue con una sola instalacion en lugar de desplegar un modelo por idioma.
- Analisis de llamadas en atencion al cliente: transcripcion de conversaciones telefonicas en varios idiomas europeos para su posterior explotacion (busqueda, clasificacion, control de calidad), ejecutandose en portatiles sin infraestructura GPU.
- Actas y notas de reunion: conversion de audio de reuniones a texto para alimentar sistemas de resumen o busqueda, con la ventaja de procesar localmente y a una velocidad medida de 90× tiempo real en un M4.
- Accesibilidad en aplicaciones de escritorio: integracion de dictado y subtitulado en vivo en apps macOS mediante la libreria MLX, sin coste de API y sin dependencia de servicios en la nube.
- Investigacion en ASR y evaluacion de cuantizacion: el repositorio publica sus tres variantes (8, 6 y 4 bits) con mediciones de WER comparables, lo que lo convierte en un banco de pruebas para estudiar el impacto de la cuantizacion en reconocimiento de voz.
- Procesamiento por lotes de archivos de audio: transcripcion masiva de grabaciones historicas o archivos de audio a texto en un equipo Apple, aprovechando el reducido tamaño del modelo frente a los 2,5 GB en fp32.

## Benchmarks y rendimiento

El autor publica mediciones de Word Error Rate sobre 1.000 clips en ruso (500 de FLEURS y 500 de GOLOS), con decodificacion greedy sobre un Mac M4:

| Build | Descarga | WER FLEURS | WER GOLOS | Velocidad |
|---|---:|---:|---:|---:|
| fp32 (`mlx-community/parakeet-tdt-0.6b-v3`) | 2,5 GB | 5,57 % | 3,42 % | 64× |
| 8 bits (este repositorio) | 744 MB | 5,67 % | 3,46 % | 90× |
| 6 bits | 608 MB | 5,61 % | 3,38 % | 88× |
| 5 bits (no publicado) | 540 MB | 5,93 % | 3,50 % | 87× |
| 4 bits | 472 MB | 5,95 % | 3,67 % | 90× |

Segun el autor, las variantes de 8 y 6 bits mantienen la precision de fp32 dentro del margen de ruido de medicion. Por debajo de 6 bits, la precision cae aproximadamente al nivel de un build int8 de Core ML. No se han publicado resultados de benchmarks en otros idiomas ni en tareas adicionales en la informacion disponible.

## Requisitos de hardware

- Disenado para silicio de Apple (M1, M2, M3, M4 y posteriores) mediante MLX; usa memoria unificada, no VRAM dedicada.
- Peso del modelo: 744 MB (8 bits), 608 MB (6 bits) y 472 MB (4 bits) segun la variante.
- Cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o superior; se recomienda un minimo de 16 GB para trabajar con comodidad junto a otros procesos.
- No esta pensado para GPU NVIDIA ni AMD: al estar en formato MLX, no es directamente cargable en vLLM, TGI o llama.cpp.
- Despliegue previsto a traves de MLX y de la herramienta `parakeet-mlx` (https://github.com/senstella/parakeet-mlx), que es la ruta de conversion citada por el autor.
- Velocidad medida: 90× tiempo real en un M4 con decodificacion greedy (frente a 64× del modelo en fp32).
- Latencia y throughput absolutos (por ejemplo, tokens por segundo o milisegundos por minuto de audio) no estan disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato / descarga | Licencia | Notas |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3-mlx-8bit (este) | 0,6 B | 25 europeos | MLX safetensors, 744 MB | CC-BY-4.0 | WER FLEURS ru 5,67 %, 90× |
| parakeet-tdt-0.6b-v3-mlx-6bit | 0,6 B | 25 europeos | MLX safetensors, 608 MB | CC-BY-4.0 | WER FLEURS ru 5,61 %, 88× |
| parakeet-tdt-0.6b-v3-mlx-4bit | 0,6 B | 25 europeos | MLX safetensors, 472 MB | CC-BY-4.0 | WER FLEURS ru 5,95 %, 90× |
| mlx-community/parakeet-tdt-0.6b-v3 (fp32) | 0,6 B | 25 europeos | MLX safetensors, 2,5 GB | CC-BY-4.0 | WER FLEURS ru 5,57 %, 64× |
| nvidia/parakeet-tdt-0.6b-v3 (base) | 0,6 B | 25 europeos | Peso oficial NVIDIA / NeMo | CC-BY-4.0 | Modelo de referencia del que derivan los anteriores |

No se dispone en la informacion proporcionada de comparativas con otros modelos ASR de la misma categoria (por ejemplo, Whisper large-v3 o similares), por lo que no se incluyen datos de WER frente a ellos.

## Limitaciones y advertencias

- Las mediciones de precision publicadas se han realizado exclusivamente sobre ruso (FLEURS y GOLOS); no hay datos de WER para el resto de los 24 idiomas declarados.
- Al ser una cuantizacion del modelo base, puede heredar los sesgos de los datos de entrenamiento originales de NVIDIA, sobre los que esta ficha no aporta informacion.
- Riesgo de alucinacion y de errores de transcripcion propios de cualquier sistema ASR, especialmente con audio con ruido, solapamiento de hablantes o acentos no representados en el corpus de entrenamiento.
- Es un modelo de transcripcion, no generativo: no debe utilizarse para responder preguntas, resumir ni razonar sobre el contenido del audio.
- La licencia CC-BY-4.0 obliga a atribuir la autoria (NVIDIA como autor del modelo, mlx-community por la conversion a MLX y este repositorio por la cuantizacion); permite uso comercial siempre que se mantenga la atribucion.
- Compatibilidad restringida a MLX: no se puede cargar en ecosistemas CUDA, vLLM, TGI o llama.cpp sin reconversion.
- El campo `region:us` del repositorio y la ausencia de descargas o valoraciones (0 descargas, 0 likes en el momento de la consulta) indican que es una publicacion reciente sin validacion externa amplia.
- La fecha de creacion y actualizacion registrada es 2026-10-03, dato que conviene verificar contra el repositorio para descartar problemas de marcado temporal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/transcriber-app/parakeet-tdt-0.6b-v3-mlx-8bit
- Variante 6 bits: https://huggingface.co/transcriber-app/parakeet-tdt-0.6b-v3-mlx-6bit
- Variante 4 bits: https://huggingface.co/transcriber-app/parakeet-tdt-0.6b-v3-mlx-4bit
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversion a MLX de mlx-community: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v3
- Herramienta de conversion parakeet-mlx: https://github.com/senstella/parakeet-mlx
