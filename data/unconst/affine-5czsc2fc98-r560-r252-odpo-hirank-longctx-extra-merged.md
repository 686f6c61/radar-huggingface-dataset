# unconst/Affine-5czsc2fc98-r560-r252-odpo-hirank-longctx-extra-merged

## Resumen

Este modelo es un checkpoint fusionado de LoRA (LoRA-merged) sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`, publicado por el usuario `unconst` en Hugging Face. Según la model card, se trata de un "salvamento de checkpoint H1" con fines privados de seguro TTL, y no constituye una presentación oficial hasta que se supere una fase de validación (Stage-5 gate). El repositorio no incluye documentación técnica adicional, licencia ni idiomas declarados.

El modelo tiene 35.107.181.936 parámetros (aproximadamente 35,1 mil millones), lo que lo sitúa en la gama de modelos grandes. Los tags indican que se basa en la arquitectura `qwen3_5_moe` (mezcla de expertos) y que soporta entrada de imagen y texto (`image-text-to-text`), aunque el pipeline declarado es `text-generation`. El tamaño del repositorio es de 70,2 GB en formato `safetensors`. Dado que no hay información pública sobre su entrenamiento, capacidades o rendimiento, esta ficha se limita a los datos disponibles y marca explícitamente los campos no documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 (según tag `qwen3_5_moe`), sin confirmación oficial |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato original en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados. El tag `qwen3_5_moe` sugiere que se trata de un modelo de mezcla de expertos derivado de la familia Qwen3.5, pero no hay confirmación oficial ni documentación técnica. El modelo es el resultado de fusionar adaptadores LoRA sobre el checkpoint base `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un fine-tune de otro modelo. La model card indica que es un "salvamento" privado, lo que implica que no se ha diseñado para distribución pública ni para uso en producción.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que se espera que pueda generar texto, aunque no hay ejemplos ni documentación.
- Conversación: el tag `conversational` sugiere soporte para diálogos multi-turno, sin confirmación.
- Entrada multimodal: el tag `image-text-to-text` indica posible procesamiento de imágenes junto con texto, pero no hay detalles sobre el tipo de imágenes ni el mecanismo.
- No se dispone de información sobre tool calling, razonamiento avanzado, matemáticas, código u otras capacidades específicas.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dado que es un checkpoint experimental de fusión LoRA con fines privados, no se recomienda su uso en aplicaciones reales sin una evaluación previa. Los posibles escenarios genéricos (generación de texto, chat) no están validados y carecen de soporte técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35,1 B de parámetros, se requieren aproximadamente 70 GB en FP16, 35 GB en int8 y 17,5 GB en int4 (cálculo estándar, no confirmado para este modelo).
- GPU recomendadas: para FP16 se necesitaría una GPU con al menos 80 GB (A100 80GB, H100) o varias GPUs en paralelo. Con cuantización int4 podría caber en una RTX 4090 (24 GB) o similar, pero no hay garantía.
- Opciones de despliegue: al ser un modelo de transformers, podría usarse con vLLM, TGI o llama.cpp si se convierte a GGUF, pero no hay instrucciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo no tiene benchmarks publicados ni documentación técnica. Se podría comparar con otros MoE de tamaño similar (por ejemplo, Mixtral 8x22B o Qwen3-32B), pero al no haber datos de rendimiento, cualquier comparación sería especulativa. Se indica "no disponible".

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo es de uso libre, comercial o restringido. No debe utilizarse en producción sin aclarar este punto.
- Sin documentación: no hay model card técnica, ni detalles de entrenamiento, ni ejemplos de uso.
- Modelo experimental: la model card lo describe como un "salvamento" privado, no como un lanzamiento oficial. Puede contener artefactos o degradaciones de calidad.
- Riesgo de alucinación y sesgos: al no haber evaluación, se desconocen los sesgos y la fiabilidad de las respuestas.
- Sin soporte: el autor no ofrece garantías ni canal de soporte.
- Fecha de creación futura (2026-08-16): el modelo está fechado en el futuro, lo que sugiere que puede ser un artefacto de pruebas o un error en la metadata.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unconst/Affine-5czsc2fc98-r560-r252-odpo-hirank-longctx-extra-merged
- Checkpoint relacionado (r480): https://huggingface.co/unconst/Affine-5czsc2fc98-r480-offline-dpo-hialpha-hirank-longctx-extrasteps-merged
- Checkpoint relacionado (r32): https://huggingface.co/unconst/Affine-5czsc2fc98-r32-merged
- Checkpoint relacionado (h56): https://huggingface.co/unconst/Affine-5czsc2fc98-h56-merged
- Checkpoint relacionado (r4-fullft): https://huggingface.co/unconst/Affine-5czsc2fc98-r4-fullft
