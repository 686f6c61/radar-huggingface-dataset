# YCWTG/Qwen3.5-35B-A3B-Instruct-NVFP4A16

## Resumen

El modelo **YCWTG/Qwen3.5-35B-A3B-Instruct-NVFP4A16** es una versión cuantizada del modelo Qwen3.5-35B-A3B, desarrollada por YCWTG mediante la herramienta `llm-compressor` del ecosistema vLLM. Esta cuantización emplea el esquema NVFP4A16 (pesos en FP4, activaciones en FP16), lo que reduce el tamaño del modelo de aproximadamente 72 GB (BF16 original) a unos 25 GB, una reducción del 65 %. El modelo base es un MoE multimodal de la familia Qwen3.5, con 35 107 millones de parámetros totales y 3 000 millones de parámetros activos, diseñado para tareas de imagen-texto a texto.

La relevancia de esta ficha radica en que permite ejecutar un modelo de gran tamaño en hardware más asequible, manteniendo un rendimiento cercano al original. Según los benchmarks publicados por el autor, la degradación es mínima en tareas de código (LiveCodeBench v6: 0.75 → 0.73), aunque algo mayor en razonamiento multilingüe (MMLU-ProX: 0.81 → 0.71). El modelo incluye soporte para modo instruct por defecto y modo de pensamiento (thinking mode) configurable, así como tool calling y multimodalidad, lo que lo convierte en una opción práctica para despliegues en producción con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal, con atención lineal (linear_attn) y capas visuales |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | 3 B (indicado por el sufijo A3B) |
| Longitud de contexto | No disponible (la configuracion de ejemplo usa max_model_len 143616, pero no se especifica el maximo oficial) |
| Tipos de cuantizacion | NVFP4A16 (pesos FP4, activaciones FP16); tambien se menciona una variante mixta INT4 |
| Idiomas soportados | No disponible (la familia Qwen suele ser multilingue, pero no se confirma en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B es un transformer MoE multimodal que combina un backbone de visión con un decodificador de lenguaje. La arquitectura incluye atención lineal (linear_attn) para manejar secuencias largas de manera eficiente, y un mecanismo de predicción multi-token (MTP) que mejora la velocidad de decodificación. La cuantización NVFP4A16 se aplicó con `llm-compressor`, manteniendo en 16 bits las capas críticas para la calidad: `lm_head`, `embed_tokens`, las capas visuales, los gates de los expertos (`mlp.gate`, `shared_expert_gate`), la atención lineal y las capas de MTP. Esta estrategia busca minimizar la pérdida de precisión en la proyección de salida, el procesamiento visual y el enrutamiento de expertos. No se dispone de información detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineación (RLHF/DPO), aunque el modelo es de tipo instruct y soporta thinking mode.

## Capacidades

- Generación de texto y razonamiento: el modelo puede producir respuestas coherentes y razonadas, con soporte para modo de pensamiento (thinking mode) activable mediante el cambio de `enable_thinking` en la plantilla de chat.
- Multimodalidad: al ser un modelo image-text-to-text, procesa imágenes y texto, permitiendo tareas como descripción de imágenes, respuesta a preguntas visuales y razonamiento multimodal.
- Generación de código: los benchmarks LiveCodeBench v6 indican un rendimiento sólido en tareas de programación, con una puntuación de 0.73 en la versión cuantizada.
- Tool calling: soporta llamada a herramientas (function calling) de forma automática, configurable con `--enable-auto-tool-choice` y el parser `qwen3_coder`.
- Razonamiento multilingüe: aunque no se especifican los idiomas exactos, la familia Qwen suele cubrir múltiples lenguas; el benchmark MMLU-ProX evalúa capacidades multilingües.
- Inferencia eficiente: gracias a la cuantización NVFP4A16, el modelo ocupa ~25 GB, lo que permite su ejecución en GPUs de gama alta de consumo o en entornos cloud con VRAM limitada.

## Casos de uso

- Asistente de programación en producción: el modelo puede integrarse en entornos de desarrollo (IDEs, pipelines CI/CD) para generar código, explicar fragmentos o sugerir correcciones, aprovechando su buen rendimiento en LiveCodeBench y el soporte de tool calling para interactuar con APIs.
- Análisis de documentos técnicos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o figuras junto con texto, facilitando la extracción de información de manuales o informes.
- Atención al cliente automatizada: con una ventana de contexto amplia (configurable hasta 143 616 tokens en el ejemplo), puede gestionar conversaciones multi-turno con historial largo, respondiendo consultas sobre productos o servicios.
- Razonamiento y resolución de problemas matemáticos: aunque no se dispone de benchmarks específicos de matemáticas, el modo de pensamiento y el razonamiento general lo hacen adecuado para tareas de lógica y cálculo.
- Automatización de tareas con agentes: gracias al soporte de tool calling y razonamiento multi-paso, puede actuar como agente que consulta bases de datos, ejecuta comandos o llama a APIs externas.
- Procesamiento de imágenes en entornos con recursos limitados: su tamaño reducido permite desplegarlo en GPUs como RTX 4090 o A100 para tareas de visión por computadora (clasificación, descripción, OCR) sin necesidad de clústeres grandes.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados comparativos:

| Modelo | Bits | Tamaño | LiveCodeBench v6 | MMLU-ProX | PinchBench |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (original) | BF16 | ~72 GB | 0.75 | 0.81 | 0.81 |
| Qwen3.5-35B-A3B (NVFP4A16) | NVFP4A16 | ~25 GB | 0.73 | 0.71 | 0.79 |
| Qwen3.5-35B-A3B (INT4 mixto) | INT4 | ~22 GB | 0.58 | 0.69 | 0.71 |
| Qwen3-Coder-30B-A3B | W4A16 | ~17 GB | 0.51 | 0.57 | 0.37 |

La versión NVFP4A16 mantiene una degradación mínima en código (0.73 vs 0.75) y en PinchBench (0.79 vs 0.81), pero pierde algo más en MMLU-ProX (0.71 vs 0.81). Comparado con el INT4 mixto, el NVFP4A16 es claramente superior, y supera al Qwen3-Coder-30B-A3B en todas las métricas.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan ~25 GB en NVFP4A16, por lo que se necesita al menos 25-30 GB de VRAM para inferencia en FP16 (activaciones). Con `gpu_memory_utilization` de 0.97, una GPU de 32 GB (p. ej., A100 40GB) es suficiente.
- GPUs recomendadas: NVIDIA A100 40 GB, A100 80 GB, H100, o GPUs de consumo como RTX 4090 (24 GB) si se reduce el contexto o se usa batching pequeño. Para contexto largo (143 616 tokens) se recomienda una GPU con más de 24 GB.
- Compatibilidad con consumer GPU: sí, una RTX 4090 puede ejecutarlo, aunque con limitaciones en longitud de contexto y número de secuencias simultáneas.
- Opciones de despliegue: vLLM (recomendado, con soporte para attention backend FLASHINFER), también compatible con transformers y posiblemente llama.cpp/Ollama si se convierte a GGUF (no confirmado).
- Latencia y throughput: no se proporcionan datos exactos; el uso de MTP (multi-token prediction) y atención lineal sugiere una decodificación más rápida que modelos densos equivalentes, pero depende del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | LiveCodeBench v6 | MMLU-ProX | Licencia |
|---|---|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (original) | 35B totales, 3B activos | No disponible | BF16 | ~72 GB | 0.75 | 0.81 | Apache 2.0 |
| YCWTG/Qwen3.5-35B-A3B-Instruct-NVFP4A16 | 35B totales, 3B activos | No disponible (config hasta 143k) | NVFP4A16 | ~25 GB | 0.73 | 0.71 | Apache 2.0 |
| Qwen3-Coder-30B-A3B | 30B totales, 3B activos | No disponible | W4A16 | ~17 GB | 0.51 | 0.57 | Apache 2.0 |

La versión cuantizada ofrece un equilibrio excelente entre tamaño y rendimiento, superando claramente al Qwen3-Coder-30B-A3B en las métricas publicadas, aunque con un tamaño algo mayor. La alternativa INT4 mixta es más pequeña (22 GB) pero con peor rendimiento.

## Limitaciones y advertencias

- La cuantización NVFP4A16 introduce una degradación medible en razonamiento multilingüe (MMLU-ProX cae de 0.81 a 0.71), por lo que para tareas que exijan máxima precisión lingüística puede ser preferible el modelo original.
- No se dispone de información sobre sesgos o riesgos de alucinación específicos de esta versión; como modelo generativo, puede producir contenido incorrecto o inventado, especialmente en contextos ambiguos.
- La longitud de contexto oficial no está publicada; la configuración de ejemplo usa 143 616 tokens, pero superar ese límite puede causar errores o degradación.
- Los idiomas soportados no están documentados en la ficha; aunque la familia Qwen suele ser multilingüe, no se garantiza la cobertura de lenguas específicas.
- El modo de pensamiento requiere modificar la plantilla de chat y añadir el parser `--reasoning-parser qwen3`; si no se configura correctamente, el modelo puede comportarse de forma inesperada.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la licencia del modelo base Qwen3.5-35B-A3B (también Apache 2.0) y citar la atribución correspondiente.
- Para producción, se recomienda validar el rendimiento en el caso de uso concreto, ya que los benchmarks publicados son limitados y no cubren todas las tareas posibles.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/YCWTG/Qwen3.5-35B-A3B-Instruct-NVFP4A16)
- [Modelo base Qwen/Qwen3.5-35B-A3B](https://huggingface.co/Qwen/Qwen3.5-35B-A3B)
- [llm-compressor (herramienta de cuantización)](https://github.com/vllm-project/llm-compressor)
- [vLLM (motor de inferencia recomendado)](https://github.com/vllm-project/vllm)
