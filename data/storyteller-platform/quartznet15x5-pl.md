# storyteller-platform/quartznet15x5-pl

## Resumen

QuartzNet 15x5 Polish es un modelo de reconocimiento automatico del habla (ASR) para polaco, basado en la arquitectura QuartzNet 15x5 desarrollada originalmente por NVIDIA. Este repositorio, publicado por storyteller-platform, no es un entrenamiento nuevo, sino un espejo de la version `2.0.0` del modelo dentro del registro de modelos de Storyteller, con una carpeta por formato (ONNX y MLX). Los pesos proceden del modelo original de NVIDIA (`nvidia/stt_pl_quartznet15x5`), convertidos a partir de la exportacion ONNX de OpenVoiceOS.

La relevancia de esta ficha es doble: por un lado, documenta un modelo ASR compacto y ligero (repo de 0,2 GB) pensado para transcripcion en polaco; por otro lado, ilustra un patron de empaquetado orientado a despliegue multiplataforma, con un grafo ONNX que integra el front end mel completo (STFT como convolucion, proyeccion mel, log y normalizacion por caracteristica) para funcionar en cualquier execution provider de onnxruntime sin extractor de caracteristicas separado, y una variante MLX en safetensors para el ecosistema Apple.

La informacion disponible es escasa en cuanto a metricas de rendimiento, datos de entrenamiento y benchmarks: la model card se centra en el proceso de conversion y empaquetado, no en las caracteristicas del modelo original. Por tanto, muchos campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (red neuronal convolucional 1D con bloques residuales y dilatacion, familia Jasper/QuartzNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, procesa segmentos de audio, no texto) |
| Tipos de cuantizacion | FP32 (model.onnx) y FP16 (model_fp16.onnx, solo el encoder; el front end permanece en FP32) |
| Idiomas soportados | polaco (pl) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX), ONNX (FP32 y FP16) |

## Arquitectura y entrenamiento

QuartzNet 15x5 es una red neuronal convolucional 1D con 15 bloques y 5 sub-bloques por bloque, con conexiones residuales y convoluciones dilatadas, sucesora de Jasper en la linea de NVIDIA para ASR. A diferencia de los transformers, no usa atencion: procesa el espectrograma mel de entrada mediante convoluciones, lo que la hace muy eficiente en inferencia y adecuada para despliegue en CPU y dispositivos con recursos limitados. El modelo original fue entrenado por NVIDIA y publicado en el catalogo NGC como `nvidia/stt_pl_quartznet15x5`.

Este repositorio no documenta el proceso de entrenamiento (numero de tokens, horas de audio, composicion del dataset, uso de RLHF/DPO u otras tecnicas), por lo que esos datos se consideran no disponibles. La innovacion tecnica destacable esta en el empaquetado: el grafo ONNX reconstruido por `export-onnx.py` incorpora el front end mel completo (pre-enfasis, padding reflectivo, STFT implementada como convolucion, proyeccion mel, log y normalizacion por caracteristica), de modo que el modelo acepta la senal pre-enfatizada y con padding reflectivo directamente, sin un extractor de caracteristicas externo. La variante FP16 mantiene el front end en precision simple para preservar la estabilidad numerica del calculo espectral.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en polaco.
- Procesamiento de audio con front end mel integrado en el grafo ONNX.
- Ejecucion en cualquier execution provider de onnxruntime (CPU, CUDA, DirectML, CoreML, etc.) sin dependencias de extraccion de caracteristicas.
- Inferencia en precision FP32 y FP16 (encoder).
- Soporte del formato MLX para ejecucion en hardware Apple (via los pesos safetensors en el layout del loader MLX).
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento; es un modelo puramente ASR.

## Casos de uso

- Transcripcion de audio en polaco en aplicaciones de escritorio: el grafo ONNX con front end integrado permite desplegar la transcripcion con onnxruntime sin pipeline de caracteristicas adicional, lo que simplifica el empaquetado en aplicaciones nativas.
- Subtitulado automatico de contenido audiovisual en polaco: el modelo puede generar transcripciones alineadas con el audio para herramientas de subtitulado, aprovechando su bajo peso (repo de 0,2 GB) para distribucion junto a la aplicacion.
- Procesamiento por lotes de archivos de audio en servidores: la variante ONNX se puede ejecutar en CPU o GPU mediante distintos execution providers, lo que permite escalar el procesamiento de grandes volumenes de grabaciones sin GPU dedicada.
- Integracion en asistentes de voz locales: el tamano reducido y la ausencia de atencion permiten inferencia de baja latencia en dispositivos con recursos limitados, adecuada para comandos de voz y dictado.
- Despliegue en el ecosistema Apple con MLX: los pesos safetensors en el layout del loader MLX permiten ejecutar el modelo en Mac con aceleracion nativa, util para aplicaciones de transcripcion en macOS.
- Pipelines de investigacion en ASR para polaco: sirve como linea base reproducible para comparar tecnicas de conversion, cuantizacion y despliegue multiplataforma sobre un modelo convolucional establecido.
- Archivado y busqueda de contenido hablado: transcripcion de archivos de audio historicos o corporativos en polaco para indexacion y busqueda textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repo completo ocupa 0,2 GB, por lo que el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte de onnxruntime (CUDA, DirectML) o Apple Silicon via MLX; no se requiere hardware de gama alta.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: onnxruntime (cualquier execution provider), MLX (Apple), y el runtime propio de Storyteller via ghost-story.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuartzNet 15x5 Polish (este) | CNN 1D QuartzNet | no disponible | no aplica (ASR) | CC-BY-4.0 | Hugging Face, NGC, GitLab |
| nvidia/stt_pl_quartznet15x5 | CNN 1D QuartzNet | no disponible | no aplica (ASR) | CC-BY-4.0 | NGC |
| OpenVoiceOS/stt_pl_quartznet15x5_onnx | CNN 1D QuartzNet (ONNX) | no disponible | no aplica (ASR) | no disponible | Hugging Face |
| Whisper (variantes multilingues) | Transformer encoder-decoder | no disponible en la informacion | no disponible | MIT (variantes OpenAI) | Hugging Face, OpenAI |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta polaco; no es un modelo multilingue.
- Es un modelo ASR: no genera texto libre, no razona, no hace tool calling ni procesa imagenes.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado por NVIDIA sobre datos no especificados, puede presentar sesgos de dominio (acentos, ruido, vocabulario tecnico) no evaluados en esta ficha.
- Riesgo de alucinacion en la transcripcion: como todo modelo ASR, puede producir palabras o frases inexistentes en audio con ruido o fuera de dominio.
- La licencia CC-BY-4.0 permite uso comercial con atribucion; es necesario citar a NVIDIA y respetar los terminos del modelo original.
- El repositorio es un espejo de conversion, no un entrenamiento propio: la calidad final depende del modelo original de NVIDIA y del proceso de conversion (que puede introducir diferencias numericas respecto al original).
- La variante FP16 solo aplica al encoder; el front end permanece en FP32, lo que debe tenerse en cuenta al planificar memoria y precision.
- No se documentan limitaciones de longitud de audio ni de contexto; el comportamiento con segmentos muy largos no esta especificado.

## Enlaces

- Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-pl
- Modelo original en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/models/stt_pl_quartznet15x5
- Exportacion ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_pl_quartznet15x5_onnx
- Repositorio GitLab de Storyteller (modelo): https://gitlab.com/storyteller-platform/storyteller/-/ml/models/quartznet15x5-pl
- Scripts de conversion: https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
