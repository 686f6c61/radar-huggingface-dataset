# storyteller-platform/citrinet1024-zh

## Resumen

Citrinet 1024 Chinese es un modelo de reconocimiento automático del habla (ASR) para chino mandarín, desarrollado originalmente por NVIDIA como `nvidia/stt_zh_citrinet_1024_gamma_0_25` y redistribuido por el proyecto Storyteller bajo el identificador `storyteller-platform/citrinet1024-zh`. No se trata de un modelo de lenguaje generativo, sino de un sistema de transcripción de audio a texto basado en la arquitectura Citrinet, una variante de convoluciones 1D con conexiones residuales y decodificación CTC.

La relevancia de esta ficha concreta radica en su empaquetado: Storyteller publica el modelo en dos formatos listos para inferencia local, ONNX (con el front-end mel integrado en el propio grafo) y MLX (pesos en `safetensors` con el layout que espera el cargador de MLX). Esto lo convierte en una opción práctica para transcripción en dispositivos Apple Silicon o en entornos que prefieran ONNX Runtime sin dependencias de NeMo.

El modelo está pensado para integrarse en el ecosistema de Storyteller (herramienta de sincronización de audiolibros y subtítulos) mediante el instalador `ghost-story`. Su licencia CC-BY-4.0 permite uso comercial con atribución. El repositorio ocupa 1,2 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Citrinet (convolucional 1D con residuales, decoder CTC) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio dependiente del front-end mel) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors y ONNX sin cuantizar declarada) |
| Idiomas soportados | chino (mandarín), segun el nombre del modelo y su origen NVIDIA `stt_zh_citrinet_1024_gamma_0_25` |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX) y ONNX |

## Arquitectura y entrenamiento

Citrinet es una arquitectura convolucional para ASR que sustituye la pila de transformers por bloques de convoluciones 1D con conexiones residuales, normalización por lotes y activaciones, seguida de una cabeza de clasificación con pérdida CTC. El sufijo `1024` hace referencia al número de canales del modelo, y `gamma_0_25` al factor de compresión temporal aplicado en las capas profundas. El front-end es un extractor de características mel que, en la exportación ONNX incluida, se ha integrado directamente en el grafo: el modelo acepta la señal pre-énfasis con padding reflectante y calcula internamente las features mel y su longitud.

El entrenamiento original fue realizado por NVIDIA y publicado en el catálogo NGC. La model card de esta réplica no detalla el volumen de datos, la composición del corpus ni si hubo ajuste con RLHF o DPO (no aplicable en un modelo CTC de ASR). La conversión a ONNX y MLX la realiza el proyecto Storyteller mediante los scripts `convert.py` y `export-onnx.py`, alojados en su repositorio de GitLab; el encoder no se modifica respecto al export de OpenVoiceOS del que parte.

## Capacidades

- Transcripción de voz a texto en chino mandarín a partir de audio.
- Extracción de características mel integrada en el modelo ONNX (no requiere un front-end externo para ese formato).
- Decodificación CTC, apta para alineamientos temporales y transcripción en streaming por tramas.
- Ejecución en dos runtimes: ONNX Runtime (formato `onnx`) y MLX (formato `mlx`, orientado a Apple Silicon).
- Integración con el pipeline de Storyteller mediante `ghost-story` para generación de subtítulos y sincronización.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo generativo).
- No dispone de capacidades de visión, audio generativo ni modo thinking.

## Casos de uso

- Subtitulado automático de audiolibros y pódcasts en chino: el modelo transcribe el audio y Storyteller alinea el texto con los tiempos para generar subtítulos sincronizados; el formato ONNX con front-end integrado simplifica el pipeline al no requerir preprocesado mel externo.
- Generación de transcripciones para archivos de vídeo en mandarín: se puede invocar el modelo ONNX desde un servicio de procesamiento batch para producir ficheros de texto con marcas temporales CTC.
- Indexación y búsqueda de contenido hablado: transcribir una biblioteca de audio en chino permite construir un índice de texto para búsqueda semántica o por palabras clave sobre el contenido original.
- Transcripción local en Mac con Apple Silicon: la variante MLX en `safetensors` permite ejecutar la inferencia en el chip sin depender de CUDA ni de servidores externos, útil para herramientas de escritorio.
- Accesibilidad: convertir audio en chino a texto para lectores de pantalla o sistemas de apoyo a personas con discapacidad auditiva, aprovechando que el modelo es ligero (repo de 1,2 GB) y puede correr en local.
- Preprocesado para pipelines de traducción: usar la transcripción en chino como entrada de un modelo de traducción automática, con la salida CTC como paso intermedio fiable y reproducible.
- Archivado y documentación de reuniones o entrevistas en mandarín: transcripción desatendida en servidor con ONNX Runtime para generar actas en texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 1,2 GB, por lo que los pesos en FP32 caben holgadamente en GPUs de gama media y en memoria unificada de Apple Silicon.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del repo, cualquier GPU con al menos 2-4 GB de memoria libre debería poder cargar el modelo; GPUs como RTX 3060, RTX 4090, A100 o H100 son sobradas para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con unos pocos GB de VRAM, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: ONNX Runtime para el formato `onnx`; MLX para el formato `mlx` en Apple Silicon; integración con Storyteller vía `ghost-story`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR convolucional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| storyteller-platform/citrinet1024-zh | Citrinet (CNN + CTC) | no disponible | no disponible | CC-BY-4.0 | safetensors, ONNX | Hugging Face, GitLab |
| nvidia/stt_zh_citrinet_1024_gamma_0_25 | Citrinet (CNN + CTC) | no disponible | no disponible | CC-BY-4.0 | NeMo (.nemo) | NGC de NVIDIA |
| OpenVoiceOS/stt_zh_citrinet_1024_gamma_0_25_onnx | Citrinet (CNN + CTC) | no disponible | no disponible | CC-BY-4.0 | ONNX | Hugging Face |
| Whisper (variantes de OpenAI) | Transformer encoder-decoder | variable (39M-1550M) | 30 s de audio | MIT (variantes abiertas) | safetensors, GGUF, ONNX | Hugging Face, múltiples |

La comparativa se limita a modelos de la misma familia o función (ASR en chino). No se dispone de datos de rendimiento comparativo (WER, CER) en la información proporcionada, por lo que no se puede establecer una jerarquía de calidad entre ellos.

## Limitaciones y advertencias

- Modelo especializado únicamente en chino mandarín; no está pensado para otros idiomas ni para code-switching.
- Al ser un modelo CTC de ASR, puede producir errores de transcripción en audio con ruido, acentos marcados o solapamiento de hablantes; no se han publicado tasas de error (WER/CER) en la información disponible.
- No es un modelo generativo: no admite instrucciones, tool calling ni razonamiento; cualquier expectativa en ese sentido es incorrecta.
- La licencia CC-BY-4.0 permite uso comercial pero exige atribución a NVIDIA y al proyecto Storyteller; conviene revisar los términos de la licencia original de NVIDIA en NGC.
- El repositorio no registra descargas ni interacciones, y la fecha de creación indicada (2026-11-13) es futura respecto a la información habitual de Hugging Face; conviene verificar la integridad y procedencia de los artefactos antes de usarlos en producción.
- No se documentan sesgos específicos del corpus de entrenamiento; al ser un modelo entrenado por NVIDIA, puede reflejar sesgos presentes en sus datos de origen, no detallados en la model card.
- El soporte de MLX está atado al layout que espera el cargador de MLX de Storyteller; fuera de ese ecosistema puede requerir adaptación.

## Enlaces

- Hugging Face: https://huggingface.co/storyteller-platform/citrinet1024-zh
- Modelo original NVIDIA en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/models/stt_zh_citrinet_1024_gamma_0_25
- Export ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_zh_citrinet_1024_gamma_0_25_onnx
- Repositorio de Storyteller (GitLab): https://gitlab.com/storyteller-platform/storyteller
- Scripts de conversión (`convert.py`, `export-onnx.py`): https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
- Modelo en el registro de Storyteller: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/citrinet1024-zh
