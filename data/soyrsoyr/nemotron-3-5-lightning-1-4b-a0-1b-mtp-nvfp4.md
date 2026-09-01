# soyrsoyr/Nemotron-3.5-Lightning-1.4B-A0.1B-MTP-NVFP4

## Resumen

Este repositorio contiene una cuantización NVFP4 (W4A4, FP4 con escalas FP8 por bloque) del modelo `inference-optimization/Nemotron-3.5-Lightning-1.4B-A0.1B-MTP`, realizada por el usuario soyrsoyr. Se trata de una variante de la familia Nemotron 3.5 Lightning de NVIDIA, que combina una arquitectura híbrida Mamba-Transformer con mezcla de expertos (MoE) y un mecanismo de Multi-Token Prediction (MTP) para decodificación especulativa. El modelo base tiene aproximadamente 1.000 millones de parámetros totales y unos 100 millones de parámetros activos por token.

La relevancia de esta ficha radica en que es una de las primeras cuantizaciones que incluye la capa MTP también en NVFP4, en lugar de mantenerla en precisión completa. Esto permite reducir el uso de memoria y acelerar la inferencia en GPUs Blackwell (sm100) mediante vLLM, aunque presenta limitaciones importantes en hardware Hopper. El repositorio tiene 0 descargas y 0 likes, por lo que se trata de un artefacto experimental o de nicho, orientado a desarrolladores que quieran probar la decodificación especulativa cuantizada en entornos muy concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer (MoE) con Multi-Token Prediction (MTP) |
| Parametros totales | 1.003.104.400 (según safetensors; el nombre indica 1.4B) |
| Parametros activos | 0.1B (según nomenclatura A0.1B) |
| Longitud de contexto | no disponible (la calibración se realizó con 2048 tokens) |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 con escalas FP8 por bloque, group_size 16) |
| Idiomas soportados | no disponible |
| Licencia | other (la familia base usa OpenMDW-1.1, pero este repo declara `other`) |
| Formato de pesos | safetensors (pesos empaquetados NVFP4) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Nemotron 3.5 Lightning de NVIDIA, que combina capas de atención tradicional con capas Mamba (SSM) en una arquitectura MoE. El componente MTP (Multi-Token Prediction) permite predecir varios tokens a la vez, lo que se utiliza como mecanismo de decodificación especulativa para acelerar la generación. En esta cuantización, el backbone (lineales de atención y MLP) y las lineales de atención/MLP de la capa MTP se cuantizan a NVFP4. Las proyecciones de fusión (`mtp.eh_proj`), el embedding (`mtp.embed_tokens`), todas las normalizaciones y `lm_head` se mantienen en precisión completa, ya que los motores de inferencia no soportan cargar escalas para estos módulos.

El proceso de cuantización se realizó con `llm-compressor` de vLLM, utilizando el dataset `open-platypus` con 256 muestras de calibración y una longitud máxima de secuencia de 2048 tokens. No se especifica el número total de tokens de entrenamiento del modelo base ni si se aplicaron técnicas de RLHF o DPO, aunque la familia Nemotron 3.5 Lightning está diseñada para tareas de agentes especializados.

## Capacidades

- Generación de texto y razonamiento con baja latencia gracias a la arquitectura híbrida y la cuantización NVFP4.
- Decodificación especulativa nativa mediante MTP, configurable en vLLM con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`.
- Ejecución optimizada en GPUs Blackwell (sm100) para cómputo NVFP4 nativo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado explícitamente para esta variante, aunque la familia está orientada a agentes.
- Capacidades multilingües: no disponible.
- Capacidades especiales: cuantización de la capa MTP, fusión de proyecciones q/k/v y gate/up con escala global compartida.

## Casos de uso

- Aceleración de modelos grandes mediante decodificación especulativa: este modelo puede actuar como modelo borrador (draft) para acelerar la generación de un modelo mayor de la misma familia, como el Nemotron-3.5-Lightning-30B-A3B, reduciendo la latencia por token.
- Inferencia de baja latencia en GPUs Blackwell: en entornos con B200 o GB200, el modelo puede ejecutar NVFP4 nativo, ideal para agentes en tiempo real que requieren respuestas rápidas y siempre activas.
- Despliegue en entornos con restricciones de memoria: con un repositorio de 3,1 GB y ~1B parámetros, cabe en GPUs con poca VRAM, aunque se requiere sm100 para aprovechar NVFP4.
- Investigación sobre cuantización extrema: permite estudiar el impacto de cuantizar la capa MTP a NVFP4 frente a mantenerla en precisión completa, comparando la calidad de la decodificación especulativa.
- Prototipado rápido de agentes ligeros: integrable en vLLM para probar pipelines de agentes con un modelo pequeño y rápido antes de escalar a la versión de 30B.
- Evaluación de la familia Nemotron 3.5 Lightning: útil para validar el rendimiento de la arquitectura híbrida Mamba-Transformer en tareas específicas sin necesidad de desplegar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni comparativas con otros modelos en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, aunque el tamaño del repositorio es de 3,1 GB, por lo que los pesos NVFP4 deberían ocupar menos de 1,5 GB.
- GPU recomendadas: requiere una GPU Blackwell (sm100) como B200 o GB200 para cómputo NVFP4 nativo.
- En GPUs Hopper (sm90), el backbone funciona mediante la emulación FP4 Marlin de vLLM, pero el camino de decodificación especulativa MTP no está soportado.
- Opciones de despliegue: vLLM (con configuración especulativa MTP), posiblemente otros motores que soporten NVFP4, aunque no se confirma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Cuantización | MTP | Licencia |
|---|---|---|---|---|---|
| soyrsoyr/Nemotron-3.5-Lightning-1.4B-A0.1B-MTP-NVFP4 | ~1.0B | 0.1B | NVFP4 | Sí (cuantizada) | other |
| inference-optimization/Nemotron-3.5-Lightning-1.4B-A0.1B-MTP (base) | ~1.0B | 0.1B | FP16/BF16 | Sí (precisión completa) | OpenMDW-1.1 (familia) |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 | 30B | 3B | NVFP4 | Sí | OpenMDW-1.1 |

La principal diferencia con el modelo base es la cuantización NVFP4, que reduce el uso de memoria pero requiere hardware Blackwell para aprovechar el cómputo nativo. Frente a la variante de 30B, este modelo es mucho más ligero y adecuado para entornos con recursos limitados, aunque sacrifica capacidad de razonamiento.

## Limitaciones y advertencias

- Licencia `other`: aunque la familia base usa OpenMDW-1.1, este repositorio específico declara `other`, por lo que es imprescindible revisar los términos de uso antes de cualquier despliegue comercial.
- Requiere hardware Blackwell (sm100) para aprovechar NVFP4 y MTP; en Hopper, la decodificación especulativa no funciona.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, por lo que su calidad real es desconocida.
- Dataset de calibración limitado: solo 256 muestras de `open-platypus` con 2048 tokens, lo que puede degradar la precisión en dominios fuera de distribución.
- Discrepancia en el número de parámetros: el nombre indica 1.4B, pero los safetensors suman ~1.0B, lo que puede deberse a la inclusión de embeddings o a un conteo diferente.
- Riesgo de alucinación y sesgos: no se han documentado, pero al ser un modelo pequeño y cuantizado, es probable que presente más alucinaciones que modelos mayores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/soyrsoyr/Nemotron-3.5-Lightning-1.4B-A0.1B-MTP-NVFP4
- Modelo base: https://huggingface.co/inference-optimization/Nemotron-3.5-Lightning-1.4B-A0.1B-MTP
- Variante oficial de 30B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Página de NVIDIA Developer sobre Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Documentación de la familia en GitHub: https://github.com/NVIDIA-NeMo/Nemotron/blob/main/docs/nemotron/lightning35/README.md
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
