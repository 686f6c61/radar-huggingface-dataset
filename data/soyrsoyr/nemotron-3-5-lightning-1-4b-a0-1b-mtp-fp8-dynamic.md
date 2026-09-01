# soyrsoyr/Nemotron-3.5-Lightning-1.4B-A0.1B-MTP-FP8-Dynamic

## Resumen

El modelo `soyrsoyr/Nemotron-3.5-Lightning-1.4B-A0.1B-MTP-FP8-Dynamic` es una versión cuantizada en FP8 dinámico por tensor del modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-1.4B-A0.1B-MTP`, desarrollado por NVIDIA. La cuantización ha sido realizada por el usuario soyrsoyr utilizando la librería `llm-compressor` del ecosistema vLLM, con calibración one-shot sobre el dataset `open-platypus`. El resultado es un checkpoint de aproximadamente 1,5 GB (frente a los 2,8 GB del original), lo que permite ejecutar el modelo en hardware más modesto.

El modelo pertenece a la familia Nemotron 3.5 Lightning de NVIDIA, que según la documentación oficial es un conjunto de modelos MoE (Mixture of Experts) híbridos Mamba-Transformer con Multi-Token Prediction (MTP), diseñados para tareas especializadas en agentes de IA. Esta variante concreta, de nombre 1.4B-A0.1B, sugiere un total de 1.400 millones de parámetros con 100 millones activos, aunque los pesos reales en safetensors suman 1.003.104.400 parámetros (~1B). La cuantización FP8 reduce el tamaño y acelera la inferencia, manteniendo la mayor parte de las capas MTP en precisión reducida.

La relevancia de este modelo radica en su tamaño compacto y su formato optimizado para vLLM, lo que lo hace adecuado para despliegues en entornos con recursos limitados, como GPUs de consumo o inferencia en tiempo real. No obstante, al ser una contribución de un tercero sobre un modelo base de NVIDIA, carece de documentación oficial sobre capacidades, benchmarks o limitaciones específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Nemotron 3.5 Lightning (MoE híbrido Mamba-Transformer según documentación de NVIDIA, no confirmado para esta variante) |
| Parametros totales | 1.003.104.400 (~1B) |
| Parametros activos | No disponible (el nombre sugiere 0.1B, sin verificación) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 dinámico por tensor (FP8_DYNAMIC) |
| Idiomas soportados | No disponible |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint original de NVIDIA, no un entrenamiento desde cero. La cuantización se realizó con `llm-compressor` de vLLM, aplicando una receta FP8_DYNAMIC por tensor con calibración one-shot sobre 512 muestras de `open-platypus` con una longitud máxima de secuencia de 2048 tokens. De las 61 capas lineales del módulo MTP (Multi-Token Prediction), 59 se cuantizaron a FP8, mientras que `mtp.embed_tokens` y `mtp.eh_proj` se mantienen en bf16 por limitaciones de soporte en vLLM (las embeddings no admiten FP8 y la proyección de fusión no tiene implementación cuantizada).

No se dispone de información sobre el entrenamiento original del modelo base: número de tokens, composición del dataset, uso de RLHF/DPO o técnicas de alineación. La documentación pública de NVIDIA sobre Nemotron 3.5 Lightning menciona que la familia incluye modelos MoE híbridos Mamba-Transformer con MTP, pero no se confirma que esta variante de 1.4B utilice exactamente esa arquitectura.

## Capacidades

No se ha publicado documentación específica sobre las capacidades de esta variante cuantizada. Como modelo de lenguaje de aproximadamente 1B de parámetros, se espera que pueda realizar tareas básicas de generación de texto, pero no hay benchmarks ni ejemplos que lo confirmen. Las siguientes viñetas reflejan expectativas razonables basadas en el tamaño y la familia del modelo, no en datos verificados:

- Generación de texto: capacidad básica de producir texto coherente, aunque con limitaciones propias de un modelo pequeño.
- Razonamiento simple: puede manejar tareas de razonamiento lógico sencillo, pero con menor precisión que modelos más grandes.
- Multilingüismo: no disponible, no se especifican idiomas soportados.
- Tool calling / function calling: no disponible, no hay evidencia de soporte.
- Agentes y multi-step reasoning: no disponible, no hay documentación al respecto.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

Dado su tamaño reducido y su formato FP8 optimizado para vLLM, el modelo puede emplearse en escenarios donde se priorice la eficiencia sobre la máxima calidad. Los siguientes casos son aplicaciones prácticas razonables, aunque no están documentados oficialmente:

- Chatbots ligeros para atención al cliente: el modelo puede gestionar conversaciones sencillas de varios turnos en entornos con recursos limitados, como servidores pequeños o dispositivos edge, gracias a su bajo consumo de VRAM.
- Autocompletado de texto en tiempo real: su velocidad de inferencia en FP8 permite sugerencias de escritura en aplicaciones de edición o correo electrónico sin latencia perceptible.
- Clasificación de texto y análisis de sentimiento: al ser un modelo de lenguaje, puede adaptarse mediante fine-tuning para tareas de clasificación, aunque su tamaño limita la precisión en dominios complejos.
- Extracción de información simple: puede identificar entidades o relaciones básicas en textos cortos, útil para prototipos de sistemas de gestión documental.
- Asistentes de voz en dispositivos edge: su huella de memoria (~1,5 GB) permite ejecutarlo en GPUs integradas o de baja gama para generar respuestas de voz en tiempo real.
- Prototipado rápido de aplicaciones NLP: los desarrolladores pueden usarlo como modelo base para validar ideas antes de escalar a modelos más grandes, gracias a su facilidad de despliegue con vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo cuantizado. Tampoco se dispone de comparaciones con el modelo base en términos de degradación de rendimiento debida a la cuantización FP8.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint cuantizado ocupa ~1,5 GB, por lo que con overhead de runtime y contexto se recomienda al menos 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como A10 o T4. No requiere hardware de gama alta.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con 4 GB o más.
- Opciones de despliegue: el runtime principal es vLLM, como se indica en la model card (`vllm serve ...`). No se proporcionan archivos GGUF ni soporte para llama.cpp u Ollama en esta versión.
- Latencia y throughput: no disponible. Se espera que la cuantización FP8 acelere la inferencia frente al modelo bf16, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. A continuación se presenta una comparación estructural con otros modelos de ~1B de parámetros, basada en información pública:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Nemotron-3.5-Lightning-1.4B-A0.1B-MTP-FP8-Dynamic (este) | ~1B (1.003M) | No disponible | nvidia-open-model-license | safetensors (FP8) |
| Qwen2.5-1.5B | 1.5B | 32K (típico) | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B | 1.2B | 128K (típico) | Llama 3.2 Community License | safetensors, GGUF |

Nota: los datos de contexto de Qwen y Llama son valores típicos de esos modelos, no confirmados para esta comparativa. No hay benchmarks que permitan evaluar la calidad relativa.

## Limitaciones y advertencias

- Tamaño reducido: al ser un modelo de ~1B, su rendimiento en tareas complejas (razonamiento avanzado, matemáticas, código) será significativamente inferior al de modelos más grandes.
- Cuantización FP8: la reducción de precisión puede introducir una ligera degradación en la calidad de las respuestas respecto al modelo original en bf16, aunque no se ha cuantificado.
- Licencia: la `nvidia-open-model-license` es una licencia de NVIDIA que puede imponer condiciones específicas para uso comercial o redistribución. Se recomienda revisar el texto completo de la licencia antes de su uso en producción.
- Falta de documentación: al ser una contribución de un tercero, no hay información sobre sesgos, alucinaciones, idiomas soportados ni límites de contexto. El usuario debe asumir estos riesgos.
- Contexto no especificado: se desconoce la longitud máxima de contexto soportada. El ejemplo de serving usa `--max-model-len 4096`, pero no se confirma que sea el límite real del modelo.
- Dependencia de vLLM: el checkpoint está optimizado para vLLM; otros runtimes pueden no ser compatibles sin conversión adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/Nemotron-3.5-Lightning-1.4B-A0.1B-MTP-FP8-Dynamic
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-1.4B-A0.1B-MTP
- Licencia del modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-1.4B-A0.1B-MTP/blob/main/LICENSE.txt
- Página de NVIDIA sobre Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Documentación de Nemotron 3.5 Lightning en GitHub: https://github.com/NVIDIA-NeMo/Nemotron/blob/main/docs/nemotron/lightning35/README.md
- Repositorio GitHub de Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
