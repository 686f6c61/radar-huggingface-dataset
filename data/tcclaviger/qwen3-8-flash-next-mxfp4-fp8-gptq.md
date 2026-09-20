# tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ

## Resumen

Este repositorio contiene una version cuantizada del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario tcclaviger bajo el identificador tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ. No es un modelo entrenado desde cero: es una conversion de precision mixta pensada especificamente para GPUs AMD de la arquitectura RDNA4 (AMD AI PRO R9700) bajo ROCm. El autor advierte de forma explicita en la model card que el modelo solo se ejecuta en esas GPUs, lo que lo convierte en un artefacto de despliegue muy especializado mas que en un modelo de proposito general.

El modelo base tiene 175.405.232.019 parametros segun los metadatos de safetensors (aproximadamente 175,4 mil millones) y la tarea declarada es image-text-to-text, es decir, un modelo de vision-lenguaje. Los pesos cuantizados ocupan 116 GB en total y se reparten en cuatro componentes: expertos en MXFP4 con calibracion activation-aware (64,2 GB), tabla N-Gram en int6 (41,6 GB), cabecera MTP en FP8 (2,7 GB) y atencion en FP8 (2,7 GB). El repositorio completo ocupa 233,4 GB.

La relevancia de esta ficha es doble. Por un lado, documenta una receta de cuantizacion mixta poco habitual (MXFP4 + FP8 + int6 en un mismo checkpoint) con decodificacion especulativa MTP y offload de expertos a RAM del sistema y de la tabla n-gram a NVMe. Por otro, sirve como referencia de rendimiento declarado en hardware AMD: 100 tokens/s en decodificacion de una sola peticion y 323 tokens/s con 16 peticiones concurrentes sobre dos R9700, con 82 GiB de RAM del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card. Los componentes cuantizados (expertos, cabecera MTP, atencion, tabla N-Gram) indican un transformer multimodal con mezcla de expertos (MoE), sin confirmacion explicita del autor |
| Parametros totales | 175.405.232.019 (unos 175,4 B), segun safetensors |
| Parametros activos | No disponible |
| Longitud de contexto | 262.144 tokens nativos (`original_max_position_embeddings`); la receta de 4 GPU aplica YaRN con factor 2.0 y alcanza 524.288 tokens. La receta de 2 GPU se limita a 262.144 |
| Tipos de cuantizacion | MXFP4 activation-aware (expertos, 64,2 GB), int6 (tabla N-Gram/PLE, 41,6 GB), FP8 (MTP, 2,7 GB; atencion, 2,7 GB), FP8 KV cache con escalas calibradas. Total 116 GB |
| Idiomas soportados | No disponible |
| Licencia | Metadata de HuggingFace: qwen-community-1.0. Frontmatter del README: apache-2.0 con `license_name: qwen-community-1.0`. Hay una discrepancia no resuelta entre ambas declaraciones |
| Formato de pesos | safetensors con compresion `compressed-tensors`; libreria transformers; 8-bit |
| Pipeline | image-text-to-text (vision-lenguaje) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Tamano del repositorio | 233,4 GB |
| Descargas / likes | 311 descargas, 13 likes |
| Fechas | Creado el 2026-09-13, actualizado el 2026-09-15 |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo base ni el dataset utilizado: se trata de un checkpoint cuantizado, no de un modelo entrenado por el autor del repositorio. Lo que si se documenta con detalle es la estrategia de cuantizacion. Los expertos se cuantizan a MXFP4 con calibracion sensible a activaciones, lo que reduce el dano en las capas con mayor rango dinamico; la atencion y la cabecera de prediccion multi-token (MTP) se mantienen en FP8, y la tabla N-Gram asociada al modulo PLE se comprime a int6. La cuantizacion se empaqueta en formato `compressed-tensors` y se acompanan escalas calibradas para la KV cache en FP8.

Las innovaciones tecnicas destacables no estan en la arquitectura del modelo, sino en el sistema de servicio. La receta de despliegue usa decodificacion especulativa con el metodo `mtp` y 3 tokens especulativos por paso, parser de razonamiento `qwen3`, parser de tool calling `qwen3_coder` y prefill por trozos. La configuracion de 2 GPU activa offload de expertos a 60 GiB de RAM del sistema con una cache LRU en el lado del dispositivo, ademas de offload de la tabla PLE a NVMe con una cache de filas de 8 GiB. Las rope parameters declaradas en `--hf-overrides` incluyen `rope_type: yarn`, `mrope_section: [11, 11, 10]` y `mrope_interleaved: true`, lo que confirma el uso de RoPE multimodal (mRoPE) para el procesamiento de imagen y texto.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, habilitado mediante `--reasoning-parser qwen3` y una configuracion de generacion con hasta 65.536 tokens de salida.
- Tool calling y function calling nativo, con `--tool-call-parser qwen3_coder` y `--enable-auto-tool-choice`.
- Procesamiento de entrada imagen-texto, declarado en el pipeline `image-text-to-text`. No se detalla resolucion de imagen, numero maximo de imagenes ni soporte de video.
- Contexto largo: 262.144 tokens en la receta de 2 GPU y 524.288 tokens con YaRN factor 2.0 en la receta de 4 GPU.
- Decodificacion especulativa integrada mediante cabecera MTP con 3 tokens especulativos.
- Inferencia con KV cache en FP8, lo que reduce a la mitad la memoria dedicada a cache frente a FP16.
- Capacidades multilingues: no disponible.
- No se documenta soporte de audio, video ni generacion de imagenes.

## Casos de uso

- Analisis de documentos extensos con elementos visuales: informes anuales, contratos con tablas o planos tecnicos. La ventana de 262.144 tokens permite incorporar cientos de paginas sin troceado, y la entrada multimodal permite razonar sobre los graficos presentes en el documento.
- Agentes autonomos con herramientas: el parser `qwen3_coder` y `--enable-auto-tool-choice` permiten encadenar llamadas a APIs, ejecutar consultas y verificar resultados en varios pasos dentro de un mismo turno.
- Asistencia tecnica sobre capturas de pantalla: el modelo puede recibir una captura de una interfaz o de un log y generar instrucciones de resolucion, aprovechando la combinacion de vision y modo razonamiento.
- Revision de codigo en pipelines de CI/CD: integrado como servicio compatible con la API de OpenAI en el puerto 8078, puede analizar diffs y sugerir cambios con salida estructurada.
- Procesamiento por lotes de contenido audiovisual indexado mediante OCR: con 16 peticiones concurrentes y 323 tokens/s agregados, es viable procesar volumenes medios de documentos escaneados en una ventana de mantenimiento.
- Investigacion sobre cuantizacion: este checkpoint sirve como caso de estudio reproducible de una receta MXFP4+FP8+int6 sobre un MoE de 175 B, con metricas de degradacion (PPL, KLD, Top1) publicadas por el autor.
- Despliegue de bajo coste en hardware AMD: el offload de expertos a RAM y de la tabla PLE a NVMe permite servir un modelo de 175 B sobre dos GPU R9700 en lugar de requerir cuatro, a cambio de latencia adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo publica metricas de calidad de la cuantizacion frente a una version mxfp4 anterior del mismo checkpoint, sin identificador ni enlace:

| Metrica | Este modelo (MXFP4 + FP8 + int6) | Version mxfp4 anterior | Diferencia |
|---|---|---|---|
| Perplejidad (PPL) | 4,552 | 4,603 | -0,051 (mejor) |
| Divergencia KL (KLD) | 0,0549 | 0,0638 | -0,0089 (mejor) |
| Coincidencia Top-1 | 95,17 % | 93,26 % | +1,91 puntos |

Datos de throughput declarados por el autor para la receta de 2 GPU R9700 (`tp2-expert-mem-60gb-ple-cache-8gb`):

| Metrica | Valor |
|---|---|
| Decodificacion, 1 peticion | 100 tokens/s |
| Respuesta agregada, 16 peticiones concurrentes | 323 tokens/s |
| RAM del sistema consumida | 82 GiB |
| Expertos en RAM del sistema | 60 GiB |
| Cache de filas de la tabla PLE en NVMe | 8 GiB |

## Requisitos de hardware

- Hardware obligatorio: GPUs AMD AI PRO R9700 (RDNA4). La model card indica que el modelo solo se ejecuta en esas GPUs. No hay soporte declarado para CUDA ni para otras generaciones de AMD.
- Huella de pesos: 116 GB cuantizados, mas escalas y metadatos. El repositorio completo ocupa 233,4 GB en disco antes de la conversion.
- Receta de 4 GPU (`--tensor-parallel-size 4`): los 116 GB caben en 4 x 32 GB = 128 GB de VRAM, con `--gpu-memory-utilization 0.97`, KV cache FP8 y contexto maximo de 524.288 tokens. No se publican cifras de throughput para esta configuracion.
- Receta de 2 GPU (`--tensor-parallel-size 2`): requiere offload de 60 GiB de expertos a RAM del sistema, cache LRU en disco y streaming de la tabla PLE desde NVMe con 8 GiB de cache. Consumo total de RAM del sistema: 82 GiB. Contexto limitado a 262.144 tokens.
- GPUs de consumo (RTX 4090, 3090, etc.): no compatibles. El modelo esta atado a ROCm y a RDNA4, y la huella de 116 GB excede cualquier GPU de consumo actual incluso con cuantizaciones agresivas.
- Opciones de despliegue: exclusivamente vLLM mediante la imagen Docker `tcclaviger/vllm:latest`. Se usan variables de entorno especificas de ROCm (`VLLM_ROCM_USE_AITER=0`, `PYTORCH_TUNABLEOP_ENABLED=1`, `VLLM_PLE_CPU_OFFLOAD=1`) y volumenes para caches de Triton, vLLM e Inductor. No se menciona compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: 100 tokens/s en decodificacion de una sola peticion y 323 tokens/s con 16 concurrentes en la receta de 2 GPU. No hay datos publicados para la receta de 4 GPU.

## Comparativa con modelos similares

Solo se dispone de informacion sobre el modelo base y sobre una version mxfp4 anterior del mismo autor (sin identificador publico). No se han encontrado en la busqueda web modelos comparables de la misma categoria y tamano cuantizados para AMD RDNA4.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ | 175,4 B | 262.144 / 524.288 tokens | MXFP4 + FP8 + int6, 116 GB | qwen-community-1.0 (metadata) / apache-2.0 (README) | HuggingFace, imagen Docker propia, solo AMD R9700 |
| Qwen/Qwen3.8-Flash-Next (modelo base) | 175,4 B | No disponible en la informacion proporcionada | Precision original no disponible | No disponible | HuggingFace |
| Version mxfp4 anterior (sin identificador) | No disponible | No disponible | mxfp4 | No disponible | Referenciada por el autor, sin enlace |

## Limitaciones y advertencias

- Restriccion de hardware severa: la model card afirma que el modelo solo se ejecuta en GPUs AMD AI PRO R9700. Esto lo inutiliza en cualquier infraestructura basada en NVIDIA y en la mayoria de entornos AMD anteriores a RDNA4.
- Ambiguedad de licencia: la metadata de HuggingFace declara `qwen-community-1.0` y el frontmatter del README declara `apache-2.0` con `license_name: qwen-community-1.0`. Antes de cualquier uso comercial hay que resolver esa discrepancia con el autor y revisar la licencia del modelo base, que es la que habitualmente impone las condiciones reales.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad del modelo base ni de esta cuantizacion.
- Riesgo de alucinacion: no se publican evaluaciones de fidelidad ni de tasas de alucinacion. Las metricas disponibles (PPL, KLD, Top1) miden la degradacion introducida por la cuantizacion, no la veracidad de las respuestas.
- Idiomas soportados no documentados. No se puede asumir un rendimiento homogeneo en castellano sin evaluacion propia.
- Las capacidades multimodales estan declaradas por el pipeline `image-text-to-text` pero no se detalla resolucion, numero de imagenes por peticion ni procesamiento de video.
- La receta de 2 GPU depende de offload a RAM, LRU en disco y streaming desde NVMe; el rendimiento de 100 tokens/s esta condicionado a la velocidad del almacenamiento y del bus, y puede degradarse con contextos largos o mayor concurrencia.
- No hay soporte declarado en llama.cpp, Ollama ni TGI, lo que limita las alternativas si vLLM sobre ROCm no encaja en la infraestructura existente.
- El autor es un particular (311 descargas, 13 likes en el momento de la consulta); no hay mantenimiento garantizado ni canal de soporte formal.
- La fecha de creacion del repositorio es posterior a la de las fichas habituales de este blog; conviene verificar la vigencia del tag `qwen4_exp` y de las APIs de vLLM utilizadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Informe de throughput BetterBench, pagina 1: https://huggingface.co/tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ/resolve/main/Next-Throughput-INT6PLE-28.04.8.png
- Informe de throughput BetterBench, pagina 2: https://huggingface.co/tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ/resolve/main/Next-Throughput-INT6PLE-28.04.8-pg2.png
- Imagen Docker de vLLM usada en las recetas: `tcclaviger/vllm:latest` (no se proporciona enlace al registro en la informacion disponible)
- Paper o blog tecnico del autor: no disponible
- La busqueda web realizada no devolvio resultados relevantes: los enlaces recuperados corresponden a portales de noticias generalistas (Fox News, NBC News, CNN, CBS News, Google News) sin relacion con el modelo.
