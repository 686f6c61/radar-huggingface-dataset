# storyteller-platform/quartznet15x5-is

## Resumen

QuartzNet 15x5 Icelandic es un modelo de reconocimiento automatico del habla (ASR) en islandes, publicado por storyteller-platform como espejo en Hugging Face del modelo originalmente entrenado por carlosdanielhernandezmena. Se trata de una red convolucional de tipo QuartzNet con 15 bloques y 5 sub-bloques por bloque (de ahi el sufijo 15x5), una arquitectura clasica de NeMo disenada para transcripcion de voz de extremo a extremo a partir de log-mel spectrograms. El modelo se distribuye con pesos en safetensors (para el cargador de MLX) y en ONNX, incluida una variante en FP16.

El modelo resuelve la transcripcion de audio en islandes, un idioma con pocos recursos para el que los modelos ASR comerciales suelen tener cobertura limitada. La version empaquetada por Storyteller se integra en su registro de modelos y se instala mediante la herramienta ghost-story, con una estructura de carpetas por formato (onnx y mlx) que incluye configuracion y vocabulario.

La relevancia actual es practica: ofrece un modelo ASR islandes ligero (repo de 0.2 GB) con licencia permisiva CC-BY-4.0, exportado a ONNX con el front-end mel integrado en el grafo, lo que simplifica el despliegue en cualquier execution provider de onnxruntime sin extractor de caracteristicas separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (CNN convolucional, NeMo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por ventanas de audio) |
| Tipos de cuantizacion | FP32 (model.onnx) y FP16 (model_fp16.onnx); pesos safetensors |
| Idiomas soportados | islandes (is) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX) y ONNX (FP32 y FP16) |

## Arquitectura y entrenamiento

QuartzNet es una arquitectura convolucional 1D con bloques residuales, pensada para ASR y caracterizada por usar convoluciones separables en profundidad en lugar de RNN, lo que reduce el coste computacional y facilita la inferencia en CPU. La variante 15x5 emplea 15 bloques con 5 sub-bloques cada uno. El modelo original fue entrenado por carlosdanielhernandezmena sobre aproximadamente 875 horas de audio islandes (segun el identificador del modelo de origen, `ft_ep56_875h`), con ajuste fino hasta la epoca 56.

La version publicada por Storyteller no reentrena el modelo: convierte los pesos desde la exportacion ONNX de OpenVoiceOS. El `model.safetensors` contiene los pesos del encoder en el layout que espera el cargador de MLX, junto con el banco de filtros mel y la ventana del front-end de NeMo. El `model.onnx` es un grafo nuevo construido por `export-onnx.py` que integra el front-end mel: recibe la senal pre-enfatizada y con padding reflectivo, ejecuta la STFT como una convolucion, aplica la proyeccion mel, el logaritmo y la normalizacion por caracteristica. Esto permite ejecutarlo en cualquier execution provider de onnxruntime sin extractor de caracteristicas externo. `model_fp16.onnx` mantiene el front-end en precision simple y el encoder en media precision.

## Capacidades

- Reconocimiento automatico del habla en islandes a partir de audio.
- Transcripcion de extremo a extremo con front-end mel integrado en el grafo ONNX.
- Inferencia en CPU y GPU mediante onnxruntime (cualquier execution provider).
- Ejecucion en Apple Silicon mediante el formato MLX (safetensors).
- Variante FP16 para reducir memoria y acelerar inferencia en hardware compatible.
- No dispone de tool calling, function calling ni capacidades de agente.
- No es un modelo generativo de texto ni multimodal: no procesa vision ni audio mas alla de la transcripcion.
- Cobertura multilingue limitada al islandes.

## Casos de uso

- Subtitulado automatico de contenido audiovisual en islandes: el modelo transcribe audio a texto y puede integrarse en pipelines de postproduccion para generar subtitulos en un idioma con poca cobertura comercial.
- Transcripcion de reuniones y notas de voz en islandes: al ejecutarse en ONNX sobre CPU, puede desplegarse en servidores sin GPU para procesar grabaciones por lotes.
- Archivado y busqueda de material audiovisual: transcripcion de archivos historicos en islandes para indexacion y busqueda textual posterior.
- Aplicaciones de accesibilidad: conversion de voz a texto en tiempo casi real para personas con discapacidad auditiva en entornos islandeses.
- Integracion en herramientas de escritorio o moviles: el formato ONNX con front-end integrado y la variante FP16 permiten empaquetar el modelo en aplicaciones ligeras sin dependencias de extraccion de caracteristicas.
- Investigacion en ASR de bajos recursos: punto de partida para ajuste fino o evaluacion de tecnicas convolucionales en islandes.
- Pipelines de narracion o doblaje (Storyteller): el modelo se instala via ghost-story dentro del ecosistema de Storyteller para tareas de transcripcion asociadas a la plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repo completo ocupa 0.2 GB, por lo que la huella en memoria es reducida y compatible con GPUs de gama baja.
- GPU recomendadas: cualquier GPU con soporte de onnxruntime (CUDA, DirectML, CoreML, ROCm); no requiere GPUs de datacenter como A100 o H100.
- Cabe en GPU consumer: si, practicamente cualquier GPU consumer moderna, e incluso en CPU.
- Opciones de despliegue: onnxruntime (todos los execution providers), MLX en Apple Silicon; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| QuartzNet 15x5 Icelandic (este) | QuartzNet 15x5 | islandes | CC-BY-4.0 | safetensors, ONNX FP32/FP16 | Front-end mel integrado en ONNX |
| stt_is_quartznet15x5_ft_ep56_875h (origen) | QuartzNet 15x5 | islandes | CC-BY-4.0 | no disponible | Modelo original de carlosdanielhernandezmena |
| OpenVoiceOS ..._onnx (exportacion) | QuartzNet 15x5 | islandes | CC-BY-4.0 | ONNX | Exportacion de la que deriva este repo |
| Wav2Vec2 / Whisper islandes | transformer | islandes | variable | variable | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en islandes; no transcribe otros idiomas.
- Al ser una red convolucional de ASR, puede degradarse con ruido de fondo, acentos no vistos en entrenamiento o audio de baja calidad.
- Riesgo de errores en nombres propios, terminologia tecnica y numeros.
- No se han publicado metricas de WER/CER en la informacion disponible, por lo que el rendimiento real no esta cuantificado.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar a los autores originales (carlosdanielhernandezmena y la cadena de conversiones).
- El repo es un espejo de Storyteller; cambios o correcciones deben consultarse en el repositorio GitLab de origen.
- La variante FP16 puede introducir pequenas diferencias de precision frente a FP32.
- No dispone de funcionalidades de agente, tool calling ni generacion de texto libre.

## Enlaces

- Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-is
- Modelo original: https://huggingface.co/carlosdanielhernandezmena/stt_is_quartznet15x5_ft_ep56_875h
- Exportacion ONNX de origen: https://huggingface.co/OpenVoiceOS/carlosdanielhernandezmena-stt_is_quartznet15x5_ft_ep56_875h_onnx
- Repositorio Storyteller (GitLab): https://gitlab.com/storyteller-platform/storyteller
- Scripts de conversion: https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
