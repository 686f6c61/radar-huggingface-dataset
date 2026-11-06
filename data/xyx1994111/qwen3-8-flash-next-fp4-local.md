# xyx1994111/Qwen3.8-Flash-Next-FP4-Local

## Resumen

Qwen3.8-Flash-Next-FP4-Local es una versión cuantizada en NVFP4 del modelo multimodal Qwen3.8-Flash-Next de Alibaba, publicada por el usuario xyx1994111 (repositorio espejo de la release oficial de NVIDIA). El modelo base es un transformer autorregresivo con codificador de visión, atención híbrida (Gated DeltaNet y Qwen Sparse Attention), mezcla de expertos (MoE), flujos residuales con compuerta y embeddings n-gram. La cuantización se ha realizado con NVIDIA Model Optimizer (nvidia-modelopt v0.47.0) mediante destilación consciente de cuantización (QAD), lo que permite reducir el peso en disco a aproximadamente 96 GiB manteniendo la precisión del modelo original.

El modelo resuelve el problema de desplegar un modelo multimodal de gran escala (125B parámetros totales, 6B activos) en hardware local de gama alta, en concreto GPUs Blackwell como la RTX PRO 6000 o el DGX Spark. Su ventana de contexto nativa es de 262K tokens, extensible hasta 1M, y acepta entradas de texto, imagen y vídeo, generando únicamente texto. Está pensado para sistemas de agentes, chatbots, RAG y otras aplicaciones de IA que requieren inferencia local con requisitos de memoria ajustados.

La relevancia actual radica en que combina una arquitectura MoE con atención híbrida y cuantización FP4 de última generación, lo que permite ejecutar un modelo de 125B parámetros en una única GPU profesional Blackwell con caché KV en FP8 de hasta 850K tokens (o 1M con offload de la tabla de embeddings n-gram en DGX Spark). El checkpoint requiere contenedores específicos de vLLM porque el formato de compresión sin pérdidas de los factores de escala NVFP4 aún no está soportado en el vLLM upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (Gated DeltaNet y Qwen Sparse Attention), Mixture-of-Experts, flujos residuales con compuerta y embeddings n-gram; codificador de visión (`Qwen4ExpForConditionalGeneration`) |
| Parametros totales | 125B (según model card); 96.486.615.005 en safetensors |
| Parametros activos | 6B (MoE); adicionalmente 51B en embeddings n-gram y 4B en MTP |
| Longitud de contexto | 262K tokens nativos, extensible hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (QAD, factores de escala en formato de compresión sin pérdidas); caché KV en FP8 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (modelo base bajo Qwen Community License 1.0) |
| Formato de pesos | safetensors (cuantizado NVFP4, librería Model Optimizer) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura transformer autorregresiva con atención híbrida que combina Gated DeltaNet (atención lineal con estado recurrente) y Qwen Sparse Attention, junto con una capa de mezcla de expertos que activa 6B parámetros de un total de 125B. Incorpora además flujos residuales con compuerta, una tabla de embeddings n-gram de 51B parámetros y un módulo MTP (multi-token prediction) de 4B. Dispone de un codificador de visión que permite entradas de imagen y vídeo además de texto.

La versión FP4 se ha obtenido mediante destilación consciente de cuantización (QAD) con NVIDIA Model Optimizer v0.47.0, utilizando como conjunto de calibración un subconjunto de Nemotron-Post-Training-Dataset-v3 y v2, y de Nemotron-Pretraining-Dataset. No se detallan en la información disponible el número de tokens de entrenamiento del modelo base ni la composición completa del dataset, ni si hubo RLHF o DPO. La innovación técnica principal es la cuantización NVFP4 con factores de escala comprimidos sin pérdidas, que reduce el checkpoint a unos 96 GiB y permite su ejecución en una sola GPU Blackwell.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de texto, imagen (RGB) y vídeo (MP4/WebM), y produce texto.
- Procesamiento de contexto largo: ventana nativa de 262K tokens extensible a 1M, adecuada para documentos extensos y conversaciones multi-turno.
- Mezcla de expertos con activación eficiente: 6B parámetros activos por token sobre 125B totales, lo que reduce el coste computacional por inferencia.
- Predicción multi-token (MTP): módulo de 4B parámetros que puede acelerar la decodificación.
- Capacidades de agente y razonamiento multi-paso: orientado a sistemas de agentes y pipelines de IA según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Agentes autónomos locales: el modelo puede ejecutarse en una única GPU Blackwell con contexto de hasta 1M tokens, lo que permite mantener el estado de un agente con historial largo y múltiples herramientas sin salir del hardware local.
- Asistentes conversacionales multi-turno: la ventana de 262K tokens nativos permite gestionar conversaciones extensas y documentos adjuntos sin truncamiento agresivo.
- RAG sobre documentación extensa: la combinación de contexto largo y entrada multimodal permite indexar y consultar manuales, informes y capturas de pantalla en un mismo flujo.
- Análisis de vídeo e imagen: el codificador de visión admite entradas MP4/WebM y RGB, útil para inspección de contenido audiovisual, moderación o extracción de información de grabaciones.
- Despliegue en estaciones de trabajo profesionales: validado en RTX PRO 6000 Blackwell con offload de la tabla n-gram y 850K tokens de caché KV FP8, adecuado para equipos de desarrollo con GPU única.
- Inferencia en dispositivos compactos: validado en NVIDIA DGX Spark con o sin offload de PLE y hasta 1M tokens de caché KV FP8, lo que permite prototipado y demos en hardware de sobremesa.
- Sistemas de atención al cliente con contexto largo: la ventana extendida y la naturaleza MoE permiten gestionar hilos de conversación con historial completo y adjuntos sin degradar el coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa aproximadamente 96 GiB en disco; se recomienda una GPU con al menos 96 GB de memoria para cargar los pesos FP4 sin offload.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (validada, GPU única con offload de PLE y 850K tokens de caché KV FP8) y NVIDIA DGX Spark (validada, con o sin offload de PLE y 1M tokens de caché KV FP8 con offload).
- Compatibilidad con GPU de consumo: no disponible; la model card solo valida hardware Blackwell profesional y no menciona GPUs consumer como RTX 4090.
- Opciones de despliegue: vLLM en contenedores específicos proporcionados por el autor; el vLLM upstream aún no soporta el formato de compresión de los factores de escala NVFP4.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Sistema operativo: Linux.
- Microarquitectura soportada: NVIDIA Blackwell.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP4-Local (este) | 125B totales / 6B activos | 262K nativo, hasta 1M | NVIDIA Open Model Agreement | Hugging Face (repo espejo) |
| Qwen3.8-Flash-Next (base) | 125B totales / 6B activos | 262K nativo, hasta 1M | Qwen Community License 1.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de otros modelos comparables de la misma categoría (MoE multimodal de ~125B con cuantización FP4) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Requiere contenedores específicos de vLLM: los factores de escala NVFP4 usan un formato de compresión sin pérdidas no soportado aún por el vLLM upstream, por lo que no es posible desplegarlo con la versión estándar.
- Compatibilidad de hardware restringida: solo validado en NVIDIA Blackwell (RTX PRO 6000 y DGX Spark); no hay validación en GPUs consumer ni en arquitecturas anteriores.
- Licencia dual: el modelo cuantizado se rige por el NVIDIA Open Model Agreement, mientras que el modelo base Qwen3.8-Flash-Next se rige por la Qwen Community License 1.0; es necesario revisar ambas para uso comercial.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo generativo de gran escala, es esperable, pero no se aportan evaluaciones.
- Limitaciones de idioma: la lista de idiomas soportados no está disponible, por lo que no se puede garantizar cobertura multilingüe.
- Repositorio espejo de terceros: el checkpoint ha sido publicado por el usuario xyx1994111, no por NVIDIA directamente; la release oficial se referencia en la model card como https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una réplica reciente sin validación comunitaria independiente.
- Uso en producción: la model card recomienda pruebas específicas del caso de uso siguiendo la metodología V-model antes de desplegar en sistemas de IA.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xyx1994111/Qwen3.8-Flash-Next-FP4-Local
- Release oficial de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Blog sobre QAD: https://developer.nvidia.com/blog/how-quantization-aware-training-enables-low-precision-accuracy-recovery/
- Nemotron-Post-Training-Dataset-v3: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Nemotron-Pretraining-Dataset: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
