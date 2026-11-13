# storyteller-platform/quartznet15x5-ar

## Resumen

QuartzNet 15x5 Arabic es un modelo de reconocimiento automático del habla (ASR) para árabe, basado en la arquitectura QuartzNet 15x5 originalmente propuesta por NVIDIA. El modelo fue entrenado por Mohammadawad1 y esta version concreta la publica storyteller-platform como espejo dentro de su registro de modelos de Storyteller, una plataforma de narracion y sincronizacion de audio con texto. El repositorio no contiene pesos en formato nativo de entrenamiento, sino conversiones a ONNX (single y fp16) y a safetensors para el cargador de MLX.

La relevancia de esta ficha es practica: se trata de un modelo pequeno (repo de 0,2 GB) pensado para inferencia local en dispositivos con recursos limitados, con el front end mel integrado en el grafo ONNX para que funcione sobre cualquier execution provider de onnxruntime sin extractor de caracteristicas separado. La licencia CC-BY-4.0 permite uso comercial con atribucion.

No se dispone de informacion sobre el rendimiento del modelo, el numero exacto de parametros ni los datos de entrenamiento en la documentacion proporcionada; esta ficha lo indica explicitamente en cada apartado afectado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (red convolucional 1D con bloques residuales y separable convolutions) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no generativo) |
| Tipos de cuantizacion | fp32 (ONNX) y fp16 (ONNX); safetensors para MLX |
| Idiomas soportados | arabe (segun el nombre del modelo y el autor original) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (model.onnx, model_fp16.onnx), safetensors (model.safetensors) |

## Arquitectura y entrenamiento

QuartzNet es una arquitectura convolucional para ASR que sustituye las capas recurrentes por bloques de convolucion separable en profundidad con conexiones residuales, lo que reduce drasticamente el coste computacional manteniendo precision competitiva. La variante 15x5 indica 15 bloques con kernel 5, un diseno estandar de la familia QuartzNet de NVIDIA. El modelo original fue entrenado por Mohammadawad1 para arabe; no se dispone de informacion sobre el numero de horas de audio, la composicion del corpus ni si se aplico alguna tecnica de aumento de datos.

La version publicada por storyteller-platform es una conversion: los pesos se reorganizan al layout que espera el cargador de MLX y se exporta un nuevo grafo ONNX en el que el front end mel (pre-enfasis, padding reflectivo, STFT como convolucion, proyeccion mel, logaritmo y normalizacion por caracteristica) forma parte del propio modelo. Esto permite ejecutar el modelo en cualquier execution provider de onnxruntime sin necesidad de un extractor de caracteristicas externo. La version fp16 mantiene el front end en precision simple y solo convierte el encoder a media precision.

## Capacidades

- Reconocimiento automatico del habla en arabe a partir de audio.
- Inferencia via ONNX Runtime en CPU, GPU y otros execution providers sin dependencias de NeMo.
- Inferencia via MLX en hardware Apple Silicon gracias a los pesos en safetensors.
- Front end mel integrado en el grafo, sin necesidad de calcular caracteristicas por separado.
- Variante fp16 para reducir uso de memoria y acelerar la inferencia en hardware compatible.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente acustico.
- Capacidades multilingues: no disponibles; el modelo esta orientado a arabe.

## Casos de uso

- Transcripcion de audio en arabe en local: el modelo puede ejecutarse en un portatil o en un servidor modesto gracias a su tamano reducido y a la disponibilidad de ONNX y MLX, sin depender de servicios en la nube.
- Subtitulado y sincronizacion en Storyteller: es el caso de uso nativo del repositorio, que instala el modelo a traves de ghost-story para alinear narracion y texto en la plataforma.
- Pipeline de transcripcion por lotes: al ser un grafo ONNX autocontenido, se puede integrar en un proceso batch con onnxruntime sin gestionar un extractor de caracteristicas aparte.
- Aplicaciones moviles o embebidas: la variante fp16 y el tamano del repositorio (0,2 GB) permiten desplegar el modelo en dispositivos con memoria limitada.
- Prototipado de ASR en arabe: util como linea base rapida para comparar con modelos mas grandes antes de invertir en infraestructura.
- Investigacion en arquitecturas convolucionales para ASR: QuartzNet 15x5 es una referencia clasica para estudiar el equilibrio entre precision y coste computacional en reconocimiento de voz.
- Despliegue en Apple Silicon: la version MLX permite aprovechar la GPU unificada de los chips M-series para transcripcion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio completo ocupa 0,2 GB, por lo que el modelo es muy ligero y probablemente cabe en menos de 1 GB de memoria en fp16.
- GPU recomendadas: cualquier GPU compatible con onnxruntime (CUDA, ROCm, DirectML) o con MLX en Apple Silicon; no se requiere una GPU de datacenter.
- Cabe en GPU consumer: si, con margen amplio, incluidas GPU integradas y portatiles.
- Opciones de despliegue: onnxruntime (cualquier execution provider), MLX en Apple Silicon. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuartzNet 15x5 Arabic (este) | QuartzNet 15x5 | no disponible | no aplica | CC-BY-4.0 | ONNX, safetensors |
| Mohammadawad1/stt_ar_quartznet15x5 | QuartzNet 15x5 | no disponible | no aplica | CC-BY-4.0 | pesos originales |
| OpenVoiceOS/Mohammadawad1-stt_ar_quartznet15x5_onnx | QuartzNet 15x5 | no disponible | no aplica | no disponible | ONNX |
| Whisper (variantes) | Transformer encoder-decoder | segun variante | 30 s de audio | MIT | multiples |

La comparativa se limita a los modelos citados en la documentacion; no se dispone de datos de rendimiento para establecer una comparacion cuantitativa con Whisper u otras alternativas.

## Limitaciones y advertencias

- No se han publicado metricas de error (WER/CER) ni benchmarks; no se puede evaluar su calidad objetiva a partir de la informacion disponible.
- El modelo esta orientado exclusivamente a arabe; no se documenta soporte para otros idiomas ni para cambio de idioma.
- Es un modelo ASR puro: no genera texto libre, no razona y no soporta instrucciones ni tool calling.
- Riesgo de alucinacion en la transcripcion: como todo modelo acustico, puede producir palabras plausibles en audio ruidoso o con acentos no representados en el entrenamiento.
- No se dispone de informacion sobre sesgos demograficos, dialectos cubiertos ni calidad en audio telefónico o con ruido de fondo.
- La licencia CC-BY-4.0 exige atribucion; es compatible con uso comercial, pero conviene revisar los terminos del modelo original y del export de OpenVoiceOS antes de redistribuir.
- La fecha de creacion del repositorio (2026-11-13) y el numero de descargas (0) indican que el modelo es muy reciente y sin validacion de la comunidad.
- El front end integrado en ONNX asume una senal pre-enfatizada y con padding reflectivo; usarlo con otra preparacion de audio puede degradar los resultados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-ar
- Modelo original: https://huggingface.co/Mohammadawad1/stt_ar_quartznet15x5
- Export ONNX de referencia: https://huggingface.co/OpenVoiceOS/Mohammadawad1-stt_ar_quartznet15x5_onnx
- Repositorio Storyteller en GitLab: https://gitlab.com/storyteller-platform/storyteller
- Scripts de conversion y exportacion: https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
