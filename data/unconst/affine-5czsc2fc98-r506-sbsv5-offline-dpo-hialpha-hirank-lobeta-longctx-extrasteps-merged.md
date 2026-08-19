# unconst/Affine-5czsc2fc98-r506-sbsv5-offline-dpo-hialpha-hirank-lobeta-longctx-extrasteps-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r506-sbsv5-offline-dpo-hialpha-hirank-lobeta-longctx-extrasteps-merged` es un checkpoint intermedio de un proceso de fine-tuning con DPO (offline) sobre un modelo base de tipo Qwen3.5 MoE. Lo desarrolla el usuario `unconst` y se presenta como un "salvage" (rescate) de un merge de LoRA sobre el modelo `kevin954/Affine-5dfqbbh8ev-sft`. Con 35.107 millones de parámetros, es un modelo de gran tamaño que emplea una arquitectura de mezcla de expertos (MoE), aunque no se especifican los parámetros activos.

El modelo está pensado para generación de texto y conversación, con etiquetas que sugieren capacidad multimodal (image-text-to-text), aunque el pipeline declarado es solo text-generation. No tiene descargas ni likes, y la model card indica que es un checkpoint privado de "seguro TTL" que no se considera una entrega final hasta que pase una fase de validación (Stage-5 gate). Esto lo convierte en un artefacto experimental, no apto para producción sin una evaluación adicional.

Su relevancia radica en ser un ejemplo de fine-tuning con DPO sobre una arquitectura MoE moderna, pero la falta de documentación, licencia y benchmarks limita su utilidad práctica para desarrolladores e investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (mezcla de expertos) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el nombre sugiere "longctx", pero sin valor concreto) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 MoE, una variante de transformer con mezcla de expertos, aunque no se detallan el número de expertos ni los parámetros activos. El proceso de entrenamiento combina un fine-tuning inicial (SFT) sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft` seguido de una etapa de DPO offline con hiperparámetros específicos: alpha alto (`hialpha`), rank alto (`hirank`), beta bajo (`lobeta`), contexto largo (`longctx`) y pasos extra (`extrasteps`). El resultado es un merge de LoRA que produce este checkpoint.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas adicionales como RLHF o decodificación especulativa. La model card solo indica que es un "checkpoint de rescate" y que no es una entrega oficial.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation).
- Posible capacidad multimodal (image-text-to-text) según las etiquetas, aunque no se confirma en la documentación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

Dado el carácter experimental del modelo y la ausencia de documentación, los casos de uso son limitados y deben considerarse con cautela:

- Investigación académica: como punto de partida para estudiar el efecto del DPO offline con hiperparámetros extremos (alpha alto, beta bajo) en modelos MoE.
- Desarrollo de prototipos: para probar la generación de texto en entornos controlados, siempre que se valide su comportamiento antes de cualquier uso.
- Fine-tuning adicional: como base para continuar el entrenamiento con otros datasets o técnicas de alineación.
- Evaluación comparativa: para medir el impacto de la longitud de contexto extendida en tareas de razonamiento de largo alcance.
- Experimentación con LoRA: para analizar la calidad del merge de LoRA en arquitecturas MoE.
- Pruebas de inferencia: para medir requisitos de hardware y latencia en GPUs de alta gama.

No se recomienda su uso en producción debido a la falta de licencia, benchmarks y garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35,1 B parámetros, en FP16 se necesitan aproximadamente 70 GB de VRAM; en int8 unos 35 GB; en int4 unos 18 GB. Al ser MoE, los parámetros activos podrían reducir la memoria efectiva, pero no se conoce su proporción.
- GPU recomendadas: para FP16 se requieren GPUs de clase A100 80 GB, H100 80 GB o similares. Para cuantización int4 podría caber en una RTX 4090 (24 GB) o A6000 (48 GB), pero sin confirmación.
- Si cabe en consumer GPU: solo con cuantización agresiva (int4) y posiblemente con offloading a CPU, pero no está garantizado.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay soporte nativo documentado para Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo pertenece a la familia Qwen3.5 MoE, pero no se conocen sus parámetros activos ni su rendimiento. Alternativas genéricas de tamaño similar (35-50 B) incluyen Mixtral 8x7B (47 B totales, 13 B activos) o Qwen3-30B-A3B (30 B totales, 3 B activos), pero no hay datos para comparar directamente.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; el autor lo describe como "salvage" y no lo considera una entrega hasta superar una validación.
- Licencia no disponible: impide cualquier uso comercial o redistribución legal.
- Sin benchmarks: no hay evidencia de calidad o seguridad.
- Sesgos y alucinaciones: no documentados; al ser un modelo sin alineación verificada, el riesgo es alto.
- Limitaciones de contexto e idioma: desconocidas; el nombre sugiere contexto largo, pero no se especifica el valor.
- Riesgo de sobreajuste: los hiperparámetros extremos (alpha alto, beta bajo) pueden provocar degradación en tareas generales.
- Repo sin actividad: cero descargas y cero likes indican que no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r506-sbsv5-offline-dpo-hialpha-hirank-lobeta-longctx-extrasteps-merged
- Checkpoint similar (r497): https://huggingface.co/unconst/Affine-5czsc2fc98-r497-sbsv5-offline-dpo-hialpha-midrank-lobeta-midctx-extrasteps-merged
- LoRA base (r22): https://huggingface.co/unconst/Affine-5czsc2fc98-r22-lora
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
- Despliegue en FriendliAI (variante h6): https://friendli.ai/models/unconst/Affine-5czsc2fc98-h6-merged
