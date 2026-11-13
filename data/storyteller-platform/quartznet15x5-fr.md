# storyteller-platform/quartznet15x5-fr

## Resumen

QuartzNet 15x5 French es un modelo de reconocimiento automatico del habla (ASR) para frances, originalmente entrenado por NVIDIA y publicado en el catalogo NGC como `nvidia/stt_fr_quartznet15x5`. Esta ficha corresponde a la version espejo que mantiene el proyecto Storyteller en Hugging Face, que redistribuye los pesos en formatos ONNX y MLX junto con la configuracion y el vocabulario necesarios para su ejecucion.

El modelo emplea la arquitectura QuartzNet 15x5, una red convolucional de tipo 1D con 15 bloques y 5 sub-bloques por bloque, disenada especificamente para transcripcion de voz con un coste computacional contenido. Esta orientada a la inferencia local y a la integracion en aplicaciones de subtitulado o transcripcion, no a tareas generativas generales.

La relevancia de este repositorio es practica: empaqueta el modelo en dos formatos listos para produccion (ONNX con front end mel integrado y MLX para Apple Silicon), lo que simplifica el despliegue en entornos donde no se dispone de toolkits como NeMo. El repositorio ocupa aproximadamente 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (CNN 1D con bloques residuales y separable convolutions) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, procesa audio por ventanas) |
| Tipos de cuantizacion | FP32 (model.onnx) y FP16 (model_fp16.onnx); pesos en safetensors para MLX |
| Idiomas soportados | frances (fr) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX), ONNX (FP32 y FP16) |

## Arquitectura y entrenamiento

QuartzNet es una arquitectura convolucional temporal (1D) con conexiones residuales, compuesta por 15 bloques y 5 sub-bloques cada uno. Utiliza convoluciones separables en profundidad para reducir el numero de parametros manteniendo capacidad representacional. El front end clasico de NeMo aplica pre-enfasis, ventana, STFT, proyeccion mel, logaritmo y normalizacion por caracteristica antes de la red.

En esta version, el autor del espejo ha reconstruido el grafo ONNX de forma que el front end mel queda integrado en el propio modelo: la STFT se implementa como una convolucion, seguida de la proyeccion mel y la normalizacion. Esto permite ejecutar el modelo en cualquier execution provider de onnxruntime sin un extractor de caracteristicas separado. El modelo fue entrenado originalmente por NVIDIA; no se dispone en la informacion proporcionada de detalles sobre el corpus de entrenamiento, numero de horas de audio ni si se aplicaron tecnicas de aumentacion o decodificacion con language model.

## Capacidades

- Reconocimiento automatico del habla en frances (transcripcion de audio a texto).
- Ejecucion del front end mel integrado en el grafo ONNX, sin dependencias de NeMo.
- Inferencia en FP32 y FP16 (el front end permanece en FP32 incluso en la variante FP16).
- Ejecucion en CPU y GPU via onnxruntime con cualquier execution provider.
- Ejecucion en Apple Silicon mediante el formato MLX (safetensors).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo multimodal ni generativo: su unica salida es la transcripcion.

## Casos de uso

- Subtitulado automatico de video en frances: el modelo puede transcribir pistas de audio y generar subtitulos en formato SRT/VTT; su naturaleza convolucional ofrece baja latencia en CPU, adecuada para procesamiento por lotes.
- Transcripcion de reuniones y notas de voz: integrable en pipelines de post-procesado donde se requiere ejecucion local sin enviar audio a servicios externos.
- Aplicaciones de accesibilidad: conversion de audio a texto en tiempo real o cuasi real en dispositivos sin GPU dedicada gracias al grafo ONNX con front end integrado.
- Archivado y busqueda de contenido audiovisual: indexacion de transcripciones para motores de busqueda internos en archivos en frances.
- Despliegue en Apple Silicon: la variante MLX permite ejecutar la transcripcion en Macs con chip M-series dentro de aplicaciones nativas.
- Integracion en el ecosistema Storyteller: el modelo se instala automaticamente a traves de ghost-story para pipelines de lectura o sincronizacion de audio y texto.
- Prototipado rapido de ASR: al no requerir NeMo ni un extractor de caracteristicas externo, sirve como base para validar flujos de transcripcion en onnxruntime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio completo ocupa 0,2 GB, por lo que la huella en memoria es reducida y cabe holgadamente en GPUs de gama baja.
- GPU recomendadas: cualquier GPU con soporte de onnxruntime (CUDA, DirectML, CoreML); no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en CPU.
- Opciones de despliegue: onnxruntime (cualquier execution provider), MLX en Apple Silicon, y el runtime propio de Storyteller via ghost-story.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| QuartzNet 15x5 French (este) | CNN 1D | fr | CC-BY-4.0 | ONNX, safetensors (MLX) | Front end mel integrado en ONNX |
| nvidia/stt_fr_quartznet15x5 | CNN 1D | fr | CC-BY-4.0 | NeMo | Modelo original de NVIDIA |
| OpenVoiceOS/stt_fr_quartznet15x5_onnx | CNN 1D | fr | no disponible | ONNX | Exportacion previa; requiere extractor de caracteristicas |
| Whisper (variantes) | Transformer encoder-decoder | multilingue | MIT (segun variante) | multiples | Mayor tamano y coste; no comparable en huella de memoria |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en frances; no cubre otros idiomas.
- Al ser una red convolucional sin modelo de lenguaje externo, la salida puede contener errores ortograficos o de segmentacion en audio con ruido, acentos marcados o solapamiento de voces.
- No se dispone de informacion sobre sesgos del corpus de entrenamiento; es previsible un rendimiento desigual segun variedad dialectal y calidad de grabacion.
- La licencia CC-BY-4.0 permite uso comercial con atribucion; es obligatorio citar a NVIDIA como autor original y respetar los terminos de la licencia.
- El repositorio es un espejo; la version de referencia y el mantenimiento corresponden al proyecto Storyteller y a NVIDIA, no a un desarrollo propio del autor del espejo.
- No se han publicado metricas de WER en esta informacion; conviene validar el rendimiento en el dominio concreto antes de usarlo en produccion.
- La variante FP16 mantiene el front end en FP32, por lo que el ahorro de memoria es parcial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-fr
- Modelo original en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/models/stt_fr_quartznet15x5
- Exportacion ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_fr_quartznet15x5_onnx
- Repositorio Storyteller (GitLab): https://gitlab.com/storyteller-platform/storyteller
- Scripts de conversion y exportacion: https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
