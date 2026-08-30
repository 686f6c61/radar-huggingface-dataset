# zviratko/Qwen3.8-27B-Brainwaves-WFH-oQ4e-mtp

## Resumen

El modelo `zviratko/Qwen3.8-27B-Brainwaves-WFH-oQ4e-mtp` es una cuantización mixta de 4 bits (oQ, oMLX v0.6.4) del modelo `nightmedia/Qwen3.8-27B-Brainwaves-WFH`, un fine-tuning del Qwen3.8-27B de Alibaba. El objetivo de esta versión es permitir la ejecución del modelo en hardware Apple Silicon mediante la librería MLX, reduciendo el uso de memoria y acelerando la inferencia en comparación con los pesos en precisión completa.

El modelo base Qwen3.8-27B es un modelo denso multimodal de 27 000 millones de parámetros con atención híbrida (lineal en 48 de 64 capas), torre de visión, un cabezal de decodificación MTP (multi-token prediction) y una ventana de contexto nativa de 262 000 tokens, extensible a 1 000 000. La cuantización oQ4e-mtp conserva la arquitectura y el cabezal MTP, aunque el número de parámetros reportado en los safetensors (4 939 569 392) es notablemente inferior al esperado para un modelo de 27B, lo que sugiere una posible discrepancia en el registro o un modelo base de menor tamaño real.

Esta ficha se centra en la versión cuantizada, pero las capacidades funcionales derivan del modelo base, ya que la cuantización no altera la arquitectura ni el entrenamiento, solo la representación de los pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (lineal en 48/64 capas), visión y MTP |
| Parametros totales | 4 939 569 392 (según safetensors; el nombre indica 27B, discrepancia sin aclarar) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072 tokens (configuración del benchmark omlx.ai; el modelo base soporta 262 000) |
| Tipos de cuantizacion | 4 bits, group size 64, mixed-precision (oQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa con una combinación de atención lineal y atención estándar: 48 de las 64 capas usan atención lineal para reducir el coste computacional en contextos largos, mientras que las 16 restantes mantienen atención completa. Incluye una torre de visión para entrada multimodal y un cabezal MTP que predice múltiples tokens por paso, acelerando la decodificación. El fine-tuning "Brainwaves-WFH" de `nightmedia` no tiene documentación pública disponible, por lo que se desconocen los datos de entrenamiento y el método de ajuste (RLHF, DPO, etc.).

La cuantización oQ4e-mtp aplica una cuantización mixta de 4 bits con group size 64, optimizada para MLX. El proceso oQ (oMLX) selecciona dinámicamente qué capas cuantizar y con qué precisión para minimizar la pérdida de calidad. El cabezal MTP se conserva en la cuantización, lo que permite mantener la velocidad de decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento multi-step, incluyendo modo "thinking" (el benchmark muestra `enable_thinking: true`).
- Comprensión multimodal: entrada de imágenes a través de la torre de visión del modelo base.
- Generación de código y automatización de tareas de oficina (según la descripción oficial de Qwen3.8-27B).
- Soporte de tool calling y flujos agénticos, heredado del modelo base.
- Decodificación MTP (multi-token prediction) para reducir la latencia de generación.
- Multilingüismo: no se han publicado los idiomas soportados para esta cuantización, pero el modelo base de Qwen soporta múltiples idiomas, incluido el chino y el inglés.

## Casos de uso

- Asistente de programación local en Mac: el modelo puede generar, revisar y refactorizar código en varios lenguajes, aprovechando el soporte de tool calling para integrarse en editores o pipelines de CI/CD. La cuantización 4-bit permite ejecutarlo en equipos con 16 GB de RAM unificada.
- Automatización de oficina: redacción de documentos, resúmenes de correos, generación de presentaciones y análisis de hojas de cálculo, gracias a su capacidad de razonamiento y manejo de contexto largo.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o gráficos y extraer información relevante, útil en entornos de soporte técnico o investigación.
- Agente conversacional con memoria extendida: con 131 000 tokens de contexto (configuración del benchmark), puede mantener conversaciones de larga duración o procesar documentos extensos sin perder el hilo.
- Prototipado de aplicaciones de IA en Apple Silicon: desarrolladores que usan MLX pueden desplegar este modelo en local para experimentar con agentes, RAG o generación aumentada, sin depender de APIs externas.
- Investigación en eficiencia de cuantización: al ser una cuantización oQ de 4 bits, sirve como caso de estudio para comparar la degradación de rendimiento frente a versiones de 8 bits o el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. El benchmark de omlx.ai muestra una configuración de inferencia (contexto 131 072, max_tokens 16 384, thinking habilitado) pero no incluye métricas de calidad como MMLU o HumanEval. El modelo base Qwen3.8-27B reporta resultados en tareas como MathVision, pero no se dispone de los valores numéricos en las fuentes consultadas. Se recomienda consultar la documentación oficial de Qwen para obtener datos comparativos del modelo sin cuantizar.

## Requisitos de hardware

- Plataforma: Apple Silicon (M1, M2, M3, M4 o posteriores) con MLX instalado.
- Memoria unificada: se estima que un modelo de 27B en 4 bits ocupa aproximadamente 13,5 GB de pesos, más overhead de KV cache y activaciones. Con contexto de 131 000 tokens, se recomienda al menos 32 GB de RAM unificada para un uso cómodo; con 16 GB puede funcionar con contextos más cortos.
- GPUs compatibles: no aplica a GPUs NVIDIA o AMD, ya que MLX está diseñado exclusivamente para Apple Silicon.
- Opciones de despliegue: MLX (librería oficial), integración con Hugging Face Hub, y herramientas como `mlx-lm` o `mlx_lm.generate`.
- Latencia y throughput: no se han publicado mediciones específicas. La decodificación MTP y la cuantización 4-bit deberían reducir la latencia frente a la versión sin cuantizar, pero los valores dependen del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K (1M extendido) | FP16/BF16 | Apache 2.0 (según Qwen) | Hugging Face |
| zviratko/Qwen3.8-27B-Brainwaves-oQ8e-mtp | 27B (nombre) | 131K (benchmark) | 8-bit oQ | No disponible | Hugging Face |
| zviratko/Qwen3.8-27B-Brainwaves-WFH-oQ4e-mtp | 4,9B (safetensors) | 131K (benchmark) | 4-bit oQ | No disponible | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de otros modelos comparables (como Llama 3.1 8B o Mistral 7B) en el contexto de esta ficha.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido. Se recomienda contactar al autor antes de usar el modelo en producción.
- El número de parámetros reportado (4,9B) contradice el nombre del modelo (27B). Esto puede deberse a un error en el registro de Hugging Face o a que el modelo base real es de menor tamaño. Verificar antes de asumir capacidades.
- La cuantización de 4 bits puede degradar la calidad de generación, especialmente en tareas de razonamiento complejo o matemáticas, en comparación con el modelo original.
- El contexto máximo en el benchmark es de 131 072 tokens, inferior a los 262 000 del modelo base. Esto puede deberse a limitaciones de memoria en la configuración de prueba, no a una restricción del modelo.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas de este fine-tuning.
- El modelo está diseñado exclusivamente para Apple Silicon; no es compatible con CUDA o ROCm sin conversión previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zviratko/Qwen3.8-27B-Brainwaves-WFH-oQ4e-mtp
- Modelo base (fine-tuning): https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves-WFH
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Benchmark de omlx.ai para esta cuantización: https://omlx.ai/benchmarks/performance/u87fx0eo
- Librería oMLX (oQ): https://github.com/jundot/omlx
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
