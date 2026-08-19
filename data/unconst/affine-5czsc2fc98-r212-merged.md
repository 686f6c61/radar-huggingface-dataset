# unconst/Affine-5czsc2fc98-r212-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r212-merged` es un checkpoint resultante de la fusión de LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`, etiquetado como `affine-h1-merged-salvage`. Según la model card, se trata de un "salvamento" de checkpoint fusionado, con una nota que indica que no es una presentación oficial hasta que se supere una fase de validación (Stage-5 gate). El autor es `unconst`, y el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto experimental o privado.

El modelo presenta 35.107.181.936 parámetros totales (35,1B), con pesos en formato safetensors y un tamaño de repositorio de 70,2 GB. Los tags indican que se basa en una arquitectura `qwen3_5_moe` (mezcla de expertos) y que soporta entrada de imagen y texto (`image-text-to-text`), aunque el pipeline declarado es `text-generation`. No se dispone de información sobre licencia, idiomas soportados, contexto ni detalles de entrenamiento. Su relevancia actual es limitada, ya que parece un checkpoint intermedio de un proceso de fusión, sin documentación pública de capacidades ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mezcla de expertos, segun tags) |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se infiere de los tags de HuggingFace: `qwen3_5_moe`, lo que indica un transformer basado en mezcla de expertos (MoE) de la familia Qwen 3.5. El modelo es el resultado de fusionar un LoRA sobre el checkpoint `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un fine-tuning de un modelo base anterior. No se proporcionan detalles sobre el número de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. La etiqueta `affine-h1-merged-salvage` sugiere que el checkpoint se generó como parte de un proceso de fusión experimental, posiblemente para preservar un estado intermedio. No hay información sobre innovaciones técnicas específicas más allá de la fusión LoRA.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que puede generar texto autónomamente.
- Procesamiento multimodal: los tags incluyen `image-text-to-text`, lo que sugiere capacidad de entrada de imágenes junto con texto, aunque no se confirma en la documentación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

Dado que el modelo es un checkpoint experimental sin documentación de rendimiento ni validación, los casos de uso son especulativos. No obstante, por su arquitectura MoE y su tamaño (35B), podría aplicarse en escenarios donde se requiera generación de texto con eficiencia de parámetros activos, aunque no se conocen los parámetros activos reales. Los casos concretos no pueden confirmarse sin datos de evaluación. Se recomienda tratar este modelo como un artefacto de investigación, no como un modelo listo para producción.

- Investigación de fusión LoRA: el checkpoint puede servir para estudiar el efecto de la fusión de adaptadores en modelos MoE, comparando el comportamiento antes y después del merge.
- Prototipado de pipelines multimodales: si la capacidad `image-text-to-text` es real, podría usarse en experimentos de generación de descripciones de imágenes, aunque requiere validación.
- Evaluación de continuidad de entrenamiento: al ser un "salvamento" de un proceso de fusión, puede utilizarse para reanudar experimentos o verificar la integridad de un entrenamiento interrumpido.
- Benchmarking de modelos MoE de 35B: para comparar la calidad de generación frente a otros MoE de tamaño similar, siempre que se disponga de infraestructura suficiente.
- Desarrollo de agentes conversacionales: si se confirma soporte de tool calling, podría integrarse en sistemas de diálogo, pero no hay evidencia de ello.
- Fine-tuning posterior: el checkpoint puede servir como punto de partida para nuevos fine-tunings, aunque su licencia desconocida limita su uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El repositorio no incluye métricas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 35,1B parámetros en fp16, se necesitarían al menos 70 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. En cuantización int8, unos 35-40 GB; en int4, unos 18-20 GB, pero no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: para fp16, una A100 de 80 GB o H100 de 80 GB serían necesarias. Para cuantización int4, una RTX 4090 de 24 GB podría ser insuficiente si el contexto es largo; una A6000 de 48 GB sería más segura.
- Si cabe en consumer GPU: solo con cuantización agresiva (int4) y contexto reducido, en GPUs de 24 GB como la RTX 3090/4090, pero sin garantías de rendimiento.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay integraciones específicas documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base `kevin954/Affine-5dfqbbh8ev-sft` no tiene documentación pública, y no se conocen modelos comparables de la familia `Affine`. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles, pero al ser un modelo derivado de Qwen 3.5, podría heredar sesgos de los datos de entrenamiento originales.
- Riesgo de alucinacion: no evaluado; sin benchmarks, no se puede estimar la fiabilidad factual.
- Limitaciones de contexto o idioma: desconocidas; no se especifica la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: la licencia es "no disponible", lo que impide su uso comercial sin aclaración legal.
- Caveat para produccion: el modelo se describe como un "salvamento" de un proceso de fusión, no como un release estable. No debe usarse en entornos productivos sin una validación exhaustiva.
- Integridad del checkpoint: al ser un merge experimental, podría contener artefactos o degradación de calidad no documentados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r212-merged
- Modelo base (kevin954/Affine-5dfqbbh8ev-sft): https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
- Variantes del mismo autor: https://huggingface.co/unconst/Affine-5czsc2fc98-r216-merged y https://huggingface.co/unconst/Affine-5czsc2fc98-r3-merged
- Página de FriendliAI para el modelo h1-merged (relacionado): https://friendli.ai/models/unconst/Affine-5czsc2fc98-h1-merged
