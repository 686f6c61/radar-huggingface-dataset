# vincentdub/Qwen3.6-35B-A3B-W8A16-GPTQ

## Resumen

Este repositorio contiene una cuantización GPTQ W8A16 del modelo Qwen/Qwen3.6-35B-A3B, realizada por el usuario vincentdub. El modelo base es un Mixture-of-Experts (MoE) de 35 mil millones de parámetros totales, de los cuales solo 3 mil millones se activan por token, lo que lo hace especialmente eficiente para inferencia. Según los resultados de búsqueda, el modelo base fue lanzado por Alibaba en abril de 2026 y combina una arquitectura híbrida con Gated DeltaNet y Gated Attention, además de un codificador visual para procesamiento multimodal (imagen y texto). Esta cuantización reduce el tamaño de los pesos a 8 bits, facilitando su despliegue en hardware con memoria limitada, aunque el repositorio ocupa 38,1 GB en total.

La cuantización se realizó con la librería `llmcompressor`, utilizando 256 muestras de calibración del dataset HuggingFaceH4/ultrachat_200k con una longitud máxima de secuencia de 4096 tokens, y se calibraron todos los expertos del MoE. El modelo resultante es compatible con la librería `transformers` y el pipeline de generación de texto, y está etiquetado como `image-text-to-text`, lo que indica que conserva las capacidades multimodales del modelo original. Aunque el repositorio no tiene descargas ni valoraciones, la cuantización puede ser útil para desarrolladores que necesiten ejecutar este modelo en GPUs de consumo o en entornos con restricciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (Gated DeltaNet + Gated Attention) con vision encoder |
| Parametros totales | 35B (modelo base); 10.903.979.696 en safetensors (posiblemente el conteo de parámetros almacenados tras cuantización) |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W8A16 (este repo); también existe NVFP4 de NVIDIA |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de arquitectura híbrida que combina Gated DeltaNet y Gated Attention, con un mecanismo de routing sparse MoE. Dispone de 35B parámetros totales, de los cuales 3B se activan por token. Además, incorpora un vision encoder que le permite procesar entradas de imagen y texto de forma unificada, según la información de los resultados de búsqueda. El modelo fue entrenado por Alibaba y lanzado el 15 de abril de 2026, aunque no se dispone de detalles sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO) en la información proporcionada.

La cuantización de este repositorio se realizó con `llmcompressor` sobre el modelo base, utilizando 256 muestras de calibración del dataset HuggingFaceH4/ultrachat_200k, con una longitud máxima de secuencia de 4096 tokens. Se calibraron todos los expertos del MoE, lo que debería preservar la calidad de la mezcla de expertos. El formato GPTQ W8A16 cuantiza los pesos a 8 bits y mantiene los activos en 16 bits, un equilibrio común entre rendimiento y precisión.

## Capacidades

- Generación de texto y conversación multi-turno, gracias a su arquitectura transformer y su entrenamiento en diálogo.
- Razonamiento multimodal: al ser `image-text-to-text`, puede procesar imágenes y texto de forma conjunta, permitiendo tareas como descripción de imágenes o respuesta a preguntas visuales.
- Razonamiento y resolución de problemas: el modelo base muestra un buen desempeño en tareas de razonamiento, como indica el benchmark SWE-bench (73,4% según fuentes externas).
- Generación de código: los modelos de la familia Qwen suelen tener capacidades de programación, aunque no se confirma explícitamente en la información disponible.
- Soporte de tool calling y agentes: no se especifica en la documentación del repositorio, pero es una característica común en modelos recientes de Qwen; no obstante, no se puede confirmar sin datos oficiales.
- Eficiencia computacional: al ser MoE con solo 3B parámetros activos, ofrece un buen equilibrio entre capacidad y velocidad de inferencia.

## Casos de uso

- Asistente de código con contexto visual: el modelo puede recibir capturas de pantalla o diagramas junto con instrucciones en texto para generar o explicar código, aprovechando su capacidad multimodal.
- Análisis de documentos técnicos: puede procesar imágenes de gráficos, tablas o esquemas junto con texto para extraer información y responder preguntas, útil en entornos de investigación y documentación.
- Chatbot de atención al cliente con soporte de imágenes: permite a los usuarios enviar fotos de productos o errores y recibir respuestas contextuales, gracias a su procesamiento multimodal.
- Generación de informes a partir de datos visuales: combina la comprensión de imágenes con la generación de texto para producir resúmenes descriptivos o reportes automáticos.
- Prototipado rápido de agentes conversacionales: su eficiencia (3B activos) permite ejecutarlo en una GPU de gama media, facilitando el desarrollo y prueba de asistentes virtuales.
- Despliegue en entornos con memoria limitada: la cuantización W8A16 reduce el uso de VRAM en comparación con el modelo en fp16, permitiendo su uso en GPUs con 24-32 GB de memoria, aunque el tamaño total del repositorio (38,1 GB) sugiere que se necesita al menos 40 GB para cargar todos los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización GPTQ en la información disponible. Sin embargo, fuentes externas citan un 73,4% en SWE-bench para el modelo base Qwen3.6-35B-A3B, aunque este dato no está verificado oficialmente y corresponde al modelo sin cuantizar. No se dispone de comparaciones directas con otras cuantizaciones ni con modelos similares en este repositorio.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 38,1 GB, lo que sugiere que se necesitan al menos 40 GB de VRAM para cargar todos los pesos en memoria (considerando overhead). Con cuantización adicional o técnicas de offloading, podría ejecutarse en GPUs con 24 GB, pero con degradación de rendimiento.
- GPU recomendadas: NVIDIA A100 (40/80 GB), A6000 (48 GB), L40S (48 GB), o múltiples GPUs en paralelo. Para GPUs de consumo, una RTX 4090 (24 GB) no es suficiente para cargar el modelo completo sin offloading a CPU.
- Al ser MoE con 3B parámetros activos, el throughput por token es alto, pero la memoria necesaria para los parámetros totales es la limitación principal.
- Opciones de despliegue: al ser compatible con `transformers`, se puede usar con vLLM, TGI o directamente con la API de Hugging Face. También se puede convertir a GGUF para usar con llama.cpp u Ollama, aunque no se proporciona en este repositorio.
- Latencia y throughput: no se dispone de datos concretos; dependerá del hardware y de la implementación de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | 3B | fp16 (original) | no disponible | no disponible | Hugging Face |
| vincentdub/Qwen3.6-35B-A3B-W8A16-GPTQ | 35B | 3B | GPTQ W8A16 | no disponible | no disponible | Hugging Face |
| nvidia/Qwen3.6-35B-A3B-NVFP4 | 35B | 3B | NVFP4 | no disponible | no disponible | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de otros MoE similares (por ejemplo, Qwen3-30B-A3B o DeepSeek-V3) en la información proporcionada, por lo que no se puede realizar una comparativa más amplia.

## Limitaciones y advertencias

- La licencia del modelo no está disponible en el repositorio, lo que impide conocer las restricciones de uso comercial y redistribución. Se debe contactar con el autor o con Alibaba para obtener claridad.
- Los idiomas soportados no están especificados; es probable que el modelo base soporte múltiples idiomas, pero no se confirma.
- La cuantización GPTQ puede introducir una ligera degradación en tareas de alta precisión (matemáticas, razonamiento lógico) en comparación con el modelo en fp16.
- El modelo fue cuantizado por un tercero (vincentdub) y no hay garantía de que la calibración sea óptima para todos los casos de uso; se recomienda validar en tareas específicas.
- Al ser un modelo multimodal, puede heredar sesgos visuales y de texto del entrenamiento original, aunque no se dispone de análisis de sesgos.
- El tamaño del repositorio (38,1 GB) puede ser un obstáculo para entornos con poco ancho de banda o almacenamiento.
- No se han publicado resultados de benchmarks para esta cuantización, por lo que su rendimiento real es incierto.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/vincentdub/Qwen3.6-35B-A3B-W8A16-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantización NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guía completa de Qwen 3.6-35B-A3B (aimadetools): https://www.aimadetools.com/blog/qwen-3-6-35b-a3b-complete-guide/
- Página en Vast.ai: https://vast.ai/model/qwen36-35b-a3b
