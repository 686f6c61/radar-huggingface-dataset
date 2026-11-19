# tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ

## Resumen
Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ es una cuantización comunitaria del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario tcclaviger. Se trata de un checkpoint de 175.409.171.859 parámetros (unos 175,4 mil millones) empaquetado en 281,3 GB de repositorio, orientado a inferencia en GPUs AMD de la arquitectura RDNA4, concretamente la Radeon AI PRO R9700. El modelo base resuelve tareas de image-text-to-text, es decir, entrada conjunta de imagen y texto con salida de texto.

La relevancia de esta ficha no está en el modelo base, sino en la receta de cuantización: mezcla MXFP4 con conciencia de activaciones para los expertos, FP8 para atención y MTP, e int6 para la tabla N-Gram, con un total de 116 GB en memoria. Incluye escalas calibradas de KV-cache en FP8 y soporte de offload a RAM del sistema y a NVMe, lo que permite ejecutarlo en configuraciones de 2 y 4 GPUs R9700.

Es un artefacto muy específico de despliegue: solo funciona con la imagen Docker `tcclaviger/vllm:latest` y con GPUs AMD R9700. No es un modelo para uso general en CUDA ni para entornos sin ROCm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con mezcla de expertos (MoE); detalles internos del modelo base no disponibles |
| Parametros totales | 175.409.171.859 (~175,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 524.288 tokens en configuración TP4 (con YaRN factor 2.0); 262.144 tokens en configuración TP2 |
| Tipos de cuantizacion | MXFP4 con cuantización activation-aware (expertos), FP8 (atención, MTP), int6 (tabla N-Gram); KV-cache FP8 con escalas calibradas |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (la model card declara además apache-2.0 en los metadatos) |
| Formato de pesos | safetensors, comprimido con compressed-tensors (8-bit) |
| Tamano en disco | 281,3 GB (repo completo); 116 GB en memoria según el autor |
| Hardware objetivo | AMD Radeon AI PRO R9700 (RDNA4), ROCm |
| Libreria | transformers; despliegue vía vLLM con imagen Docker propia |

## Arquitectura y entrenamiento
El checkpoint es una cuantización del modelo base Qwen/Qwen3.8-Flash-Next, del que no se dispone de detalles de arquitectura interna, composición del dataset ni proceso de alineación (RLHF/DPO) en la información proporcionada. Los metadatos indican que el modelo base emplea una arquitectura de mezcla de expertos con atención multimodal, y la receta de cuantización revela componentes diferenciados: expertos enrutados y expertos compartidos, módulo de atención, un cabezal MTP (multi-token prediction) y una tabla N-Gram.

La innovación técnica de esta publicación es la cuantización con conciencia de activaciones aplicada a los pesos MXFP4 de expertos y expertos compartidos, calibrada capa a capa de forma serial. Según el autor, esto mejora métricas de fidelidad respecto a una versión MXFP4 anterior: perplejidad 4,552 frente a 4,603, divergencia KL 0,0549 frente a 0,0638 y Top-1 de 95,17 % frente a 93,26 %. La decodificación especulativa se apoya en MTP con 3 tokens especulativos, y el contexto largo se extiende con RoPE YaRN (factor 2.0 sobre 262.144 posiciones originales, con mrope para el componente multimodal).

## Capacidades
- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto (pipeline image-text-to-text).
- Razonamiento explícito: el servidor de referencia activa `--reasoning-parser qwen3`, lo que indica soporte de modo de pensamiento estructurado.
- Tool calling y function calling: soportado mediante el parser `qwen3_coder` y `--enable-auto-tool-choice`.
- Decodificación especulativa nativa mediante MTP (multi-token prediction) con 3 tokens especulativos.
- Ventana de contexto muy amplia: hasta 524.288 tokens con YaRN factor 2.0.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de audio o vídeo: no disponibles.
- Servido compatible con la API de OpenAI a través de vLLM (`endpoints_compatible`).

## Casos de uso
- Documentos técnicos con imágenes: análisis de manuales, diagramas y planos donde el modelo recibe páginas escaneadas junto con preguntas en texto, aprovechando la ventana de 524.288 tokens para procesar tomos completos en una sola petición.
- Agentes con herramientas en producción: integración en flujos de automatización con function calling nativo, usando el parser `qwen3_coder` para que el modelo emita llamadas estructuradas a APIs internas.
- Asistentes de código con razonamiento multi-paso: el modo de razonamiento y la decodificación especulativa MTP permiten cadenas de pensamiento largas con latencia controlada, adecuadas para revisión de parches y generación de tests.
- Procesamiento por lotes de alto rendimiento: con la configuración TP2 el autor reporta 323 tok/s a 16 peticiones concurrentes, lo que lo hace apto para pipelines de extracción y clasificación de documentos a gran escala.
- Despliegue en infraestructura AMD on-premise: organizaciones con nodos RDNA4 que necesitan un LLM multimodal sin depender de CUDA, usando el offload de expertos a 60 GiB de RAM y la caché NVMe de 8 GiB para la tabla N-Gram.
- Evaluación e investigación de cuantización: sirve como referencia reproducible para estudiar el impacto de MXFP4 activation-aware frente a FP8 e int6 en un modelo de 175 B, con métricas de PPL, KLD y Top-1 publicadas.

## Benchmarks y rendimiento
El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Los únicos datos numéricos son métricas de fidelidad de la cuantización y de throughput.

| Metrica | Este checkpoint | Version MXFP4 anterior |
|---|---|---|
| Perplejidad (PPL) | 4,552 | 4,603 |
| Divergencia KL (KLD) | 0,0549 | 0,0638 |
| Top-1 agreement | 95,17 % | 93,26 % |

| Configuracion | Throughput |
|---|---|
| 2 x R9700, TP2, decodificacion single-request | 100 tok/s |
| 2 x R9700, TP2, 16 peticiones concurrentes | 323 tok/s de respuesta |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- GPU objetivo: exclusivamente AMD Radeon AI PRO R9700 (RDNA4). El autor advierte que solo funciona en esas GPUs.
- Memoria en dispositivo: 116 GB totales repartidos en expertos MXFP4 (64,2 GB), tabla N-Gram int6 (41,6 GB), atención FP8 (2,7 GB) y MTP FP8 (2,7 GB).
- Configuración mínima documentada: 2 x R9700 con TP2, offload de expertos a 60 GiB de RAM del sistema y caché NVMe de 8 GiB para la tabla N-Gram; 82 GiB de RAM en tiempo de ejecución.
- Configuración de referencia: 4 x R9700 con TP4, contexto máximo de 524.288 tokens y `--gpu-memory-utilization 0.97`.
- Consumer GPU: no cabe en GPUs de consumo convencionales; requiere el hardware AMD RDNA4 profesional indicado.
- Despliegue: únicamente mediante la imagen `tcclaviger/vllm:latest`; según el autor, ninguna otra imagen lee este checkpoint. No hay soporte documentado para llama.cpp, Ollama ni TGI.
- Variables de entorno relevantes: `VLLM_ROCM_USE_AITER=0`, `GPU_MAX_HW_QUEUES=1`, `HSA_ENABLE_INTERRUPT=1`, `HSA_ENABLE_MWAITX=1`, `OMP_NUM_THREADS=8`.
- Latencia y throughput: 100 tok/s en decodificación single-request y 323 tok/s con 16 peticiones concurrentes en TP2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ | 175,4 B | 524.288 (TP4) / 262.144 (TP2) | MXFP4 + FP8 + int6 | qwen-community-1.0 | AMD R9700 (ROCm) |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | pesos originales | qwen-community-1.0 | no disponible |
| Versión MXFP4 anterior del mismo autor | 175,4 B | no disponible | MXFP4 | qwen-community-1.0 | AMD R9700 |

No se dispone de datos de otros modelos comparables de la misma categoría (multimodal MoE de ~175 B) en la información proporcionada.

## Limitaciones y advertencias
- Dependencia total de hardware AMD RDNA4: no funciona en GPUs NVIDIA ni en otras arquitecturas AMD según la advertencia del autor.
- Dependencia de una imagen Docker concreta (`tcclaviger/vllm:latest`); no hay compatibilidad con el vLLM upstream documentada.
- La licencia presenta ambigüedad: los metadatos declaran apache-2.0, pero la licencia indicada es qwen-community-1.0; conviene revisar el archivo LICENSE antes de un uso comercial.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano sin evaluación propia.
- Riesgo de alucinación inherente a un modelo de 175 B sin datos de benchmarks de capacidad publicados.
- La cuantización agresiva (MXFP4 en expertos, int6 en N-Gram) introduce degradación medible: 4,83 % de desacuerdo Top-1 respecto al modelo de referencia de la comparación interna.
- El offload a RAM y NVMe en la configuración TP2 implica latencias variables según el almacenamiento; el rendimiento de 100 tok/s depende de una caché NVMe de 8 GiB correctamente dimensionada.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de seguridad del modelo base.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Imagen Docker de vLLM: https://hub.docker.com/r/tcclaviger/vllm/tags?name=latest
- Informe de throughput (PDF): https://huggingface.co/tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ/resolve/main/Next-INT6PLE-28.04.8-Throughput.pdf
- Gráfico de throughput, página 1: https://huggingface.co/tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ/resolve/main/Next-Throughput-INT6PLE-28.04.8.png
- Gráfico de throughput, página 2: https://huggingface.co/tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ/resolve/main/Next-Throughput-INT6PLE-28.04.8-pg2.png
