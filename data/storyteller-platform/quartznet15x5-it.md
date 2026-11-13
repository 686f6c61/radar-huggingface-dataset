# storyteller-platform/quartznet15x5-it

## Resumen

QuartzNet 15x5 Italian es un modelo de reconocimiento automatico del habla (ASR) para italiano, desarrollado originalmente por NVIDIA como parte de su catalogo NGC y redistribuido por storyteller-platform en este repositorio de Hugging Face. El modelo emplea la arquitectura QuartzNet, una red neuronal convolucional unidimensional de tipo CTC (Connectionist Temporal Classification) que prescinde de mecanismos de atencion, lo que la hace especialmente adecuada para inferencia de baja latencia en entornos con recursos limitados.

Esta publicacion concreta no es un entrenamiento nuevo, sino un espejo del registro de modelos de Storyteller, que instala el modelo mediante la herramienta ghost-story. Los pesos proceden de la exportacion ONNX de OpenVoiceOS (`OpenVoiceOS/stt_it_quartznet15x5_onnx`) y se han reconvertido para su uso tanto en MLX (safetensors) como en onnxruntime (ONNX y ONNX fp16). La model card detalla que el grafo ONNX integra el front-end mel dentro del propio modelo, de modo que recibe la senal preenfatizada y con relleno reflectante en lugar de caracteristicas precalculadas.

El repositorio ocupa aproximadamente 0,2 GB y esta publicado bajo licencia CC-BY-4.0. Su interes practico radica en que ofrece una alternativa compacta y ligera para transcripcion de audio en italiano, con formatos optimizados para Apple Silicon (MLX) y para despliegue generico con onnxruntime, aunque no se dispone de informacion sobre volumen de descargas, likes ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (CNN 1D con CTC, sin atencion) |
| Parametros totales | no disponible (el repositorio ocupa 0,2 GB; la cifra exacta no consta) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (model.onnx) y FP16 (model_fp16.onnx); safetensors para MLX |
| Idiomas soportados | Italiano (modelo especifico de italiano) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX), ONNX (FP32), ONNX fp16; config.json y vocab.txt |

## Arquitectura y entrenamiento

QuartzNet 15x5 es una arquitectura convolucional de tipo CTC compuesta por bloques residuales de convoluciones separables en profundidad, con 15 bloques repetidos 5 veces cada uno (de ahi la nomenclatura 15x5). A diferencia de los modelos seq2seq con atencion, el entrenamiento se realiza con la funcion de perdida CTC, lo que permite alineamientos monotonos sin necesidad de decodificacion autoregresiva. Esta eleccion arquitectonica reduce drasticamente el coste computacional en inferencia y evita el uso de memoria asociada a estados de atencion.

El entrenamiento original corre a cargo de NVIDIA para su catalogo NGC (`nvidia/stt_it_quartznet15x5`), pero esta ficha no dispone de datos sobre volumen de tokens, composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (procedimientos poco habituales en ASR CTC). Lo que si documenta la model card es el proceso de reconversion: `convert.py` genera los pesos safetensors en el formato que espera el cargador MLX, incluyendo el banco de filtros mel y la ventana del front-end NeMo; posteriormente `export-onnx.py` construye un nuevo grafo ONNX que incorpora el front-end mel completo (transformada de Fourier de corto tiempo implementada como convolucion, proyeccion mel, logaritmo y normalizacion por caracteristica), de forma que el modelo funciona con cualquier execution provider de onnxruntime sin extractor de caracteristicas externo.

## Capacidades

- Reconocimiento automatico del habla en italiano a partir de audio.
- Transcripcion con alineamiento CTC, sin decodificacion autoregresiva.
- Inferencia con front-end mel integrado en el grafo ONNX (entrada de senal preenfatizada con relleno reflectante).
- Ejecucion en onnxruntime con cualquier execution provider (CPU, CUDA, CoreML, etc.).
- Ejecucion en MLX para Apple Silicon mediante los pesos safetensors.
- Variante FP16 para reducir huella de memoria y acelerar inferencia en GPU compatibles.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de vision, audio generativo ni modo de pensamiento (thinking mode).
- Multilingue limitado: modelo especifico de italiano, no se declaran otros idiomas.

## Casos de uso

- Transcripcion de reuniones y entrevistas en italiano: el modelo puede procesar audio en streaming o por lotes con baja latencia gracias a la arquitectura CTC convolucional, que evita la decodificacion autoregresiva y el coste de atencion.
- Subtitulado automatico de video en italiano: integrado en un pipeline de onnxruntime, permite generar subtitulos sincronizados para contenido audiovisual, con la ventaja de que el front-end mel esta dentro del grafo y simplifica el preprocesado.
- Dictado por voz en aplicaciones de escritorio: la variante MLX con safetensors permite ejecutar el modelo en Macs con Apple Silicon, habilitando dictado local sin enviar audio a la nube.
- Asistentes de voz para atencion al cliente en italiano: el modelo puede transcribir consultas de usuarios en centros de contacto, con la ventaja de que su tamano compacto (0,2 GB de repositorio) permite despliegue en servidores modestos.
- Indexacion y busqueda de audio: transcripcion masiva de archivos de audio en italiano para construir indices de texto consultables, aprovechando la eficiencia de la arquitectura CTC para procesar grandes volumenes por lotes.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en tiempo real de conversaciones orales en italiano, con despliegue local mediante onnxruntime o MLX segun la plataforma.
- Investigacion en ASR de bajo recurso: uso del modelo como linea base para experimentos de ajuste fino o comparacion de arquitecturas CTC en italiano, gracias a la disponibilidad de pesos en formatos abiertos y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa 0,2 GB, por lo que la huella de memoria es reducida en comparacion con modelos transformer de ASR.
- GPU recomendadas: no disponibles; al ser un modelo convolucional compacto, deberia funcionar en GPU consumer, pero no se dispone de datos concretos sobre modelos validados.
- Cabe en GPU consumer: probablemente si, dado el tamano del repositorio (0,2 GB) y la variante FP16, pero no se dispone de confirmacion explicita.
- Opciones de despliegue: onnxruntime (model.onnx y model_fp16.onnxn con cualquier execution provider) y MLX (model.safetensors) para Apple Silicon.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuartzNet 15x5 Italian (este) | no disponible (repo 0,2 GB) | no disponible | no disponible | CC-BY-4.0 | Hugging Face, formatos ONNX y safetensors |
| nvidia/stt_it_quartznet15x5 | no disponible | no disponible | no disponible | CC-BY-4.0 | NGC de NVIDIA |
| OpenVoiceOS/stt_it_quartznet15x5_onnx | no disponible | no disponible | no disponible | no disponible en la informacion | Hugging Face, ONNX |
| Alternativas transformer de ASR en italiano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de parametros exactos para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo especifico de italiano: no se declaran capacidades multilingues, por lo que su uso en otros idiomas no esta respaldado.
- Arquitectura CTC sin atencion: puede presentar peor rendimiento en audio con ruido intenso o habla solapada que modelos seq2seq con atencion, aunque no se dispone de datos comparativos.
- Riesgo de alucinacion: en ASR CTC el riesgo se manifiesta como transcripciones erroneas o omisiones en segmentos de baja relacion senal-ruido; no se dispone de tasas de error publicadas.
- Sesgos conocidos: no se documentan sesgos especificos, pero al ser un modelo entrenado por NVIDIA sobre datos no descritos, pueden existir sesgos de dominio (acento, registro, genero) no evaluados.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar autor y licencia.
- Repositorio espejo: esta publicacion redistribuye pesos de terceros (NVIDIA, OpenVoiceOS) reconvertidos; la responsabilidad de mantenimiento recae en storyteller-platform.
- Sin datos de pipeline ni de descargas: la ausencia de pipeline declarado y de metricas de uso limita la validacion comunitaria.
- Formatos orientados a MLX y onnxruntime: no se ofrecen pesos PyTorch nativos en este repositorio, lo que puede complicar el ajuste fino directo.
- El front-end mel integrado en ONNX implica que la entrada debe ser senal preenfatizada con relleno reflectante, no caracteristicas precalculadas; un preprocesado incorrecto degradara la transcripcion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-it
- Modelo original de NVIDIA en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/models/stt_it_quartznet15x5
- Exportacion ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_it_quartznet15x5_onnx
- Registro de modelos de Storyteller (GitLab): https://gitlab.com/storyteller-platform/storyteller/-/ml/models/quartznet15x5-it
- Scripts de conversion y exportacion (GitLab): https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
