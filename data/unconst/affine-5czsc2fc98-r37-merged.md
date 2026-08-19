# unconst/Affine-5czsc2fc98-r37-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r37-merged` es un checkpoint de salvamento ("merged salvage") creado por el usuario `unconst` a partir de un merge LoRA del modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según los tags de HuggingFace, pertenece a la familia arquitectónica `qwen3_5_moe`, lo que sugiere una arquitectura de mezcla de expertos (MoE) basada en la serie Qwen 3.5, aunque no hay confirmación oficial en la documentación. El modelo tiene 34.660.610.688 parámetros totales (aproximadamente 34,66 mil millones) y se distribuye en formato `safetensors` con un tamaño de repositorio de 70,2 GB.

La model card es extremadamente escueta: indica que es un "LoRA-merged" del modelo mencionado y que se trata de un "Private TTL insurance; not a submission until Stage-5 gate clears", es decir, un checkpoint interno de respaldo temporal que no está destinado a ser una versión pública estable. No se proporcionan detalles sobre entrenamiento, datos, licencia, idiomas ni capacidades específicas. Con 0 descargas y 0 likes, es un artefacto experimental que probablemente no debería utilizarse en producción sin una evaluación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (indicado por tag `qwen3_5_moe`, no confirmado oficialmente) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors, sin GGUF ni otros formatos) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información técnica detallada sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados. Los tags sugieren que se trata de un modelo de mezcla de expertos (MoE) de la familia Qwen 3.5, con capacidades potencialmente multimodales (tag `image-text-to-text`), aunque el pipeline declarado es `text-generation`. El proceso de creación consistió en un merge LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un fine-tuning de un modelo Qwen3.5 MoE, pero no hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni el uso de técnicas como RLHF o DPO. La model card no aporta ningún detalle adicional sobre innovaciones técnicas o metodología de entrenamiento.

## Capacidades

Basándose únicamente en los tags y el pipeline declarado, se pueden inferir las siguientes capacidades, aunque ninguna está confirmada con documentación oficial:

- Generación de texto conversacional (tag `conversational`, pipeline `text-generation`).
- Posible procesamiento de entrada multimodal imagen-texto (tag `image-text-to-text`), aunque no hay evidencia concreta de pesos multimodales.
- Compatibilidad con endpoints de HuggingFace (tag `endpoints_compatible`).
- No se confirma soporte de tool calling, function calling, razonamiento multi-paso, ni modos especiales de pensamiento.

Dado el carácter experimental del checkpoint, estas capacidades deben considerarse especulativas y no verificadas.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Al tratarse de un checkpoint de salvamento privado, sin evaluación pública ni documentación, no es recomendable utilizarlo en entornos de producción. Los posibles usos serían:

- Experimentación interna para validar la arquitectura MoE de Qwen 3.5 en tareas de generación de texto.
- Investigación sobre el comportamiento de merges LoRA en modelos MoE.
- Pruebas de compatibilidad con infraestructura de inferencia (vLLM, TGI, etc.) gracias al tag `endpoints_compatible`.

Cualquier uso en aplicaciones reales requeriría una evaluación exhaustiva previa que, a día de hoy, no está disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar para este checkpoint.

## Requisitos de hardware

Dado que el modelo tiene 34.660.610.688 parámetros y solo se distribuye en `safetensors` (presumiblemente en precisión fp16 o bf16), el tamaño del repositorio de 70,2 GB sugiere un peso de aproximadamente 70 GB en fp16. Esto implica:

- VRAM estimada para inferencia en fp16: al menos 70-80 GB, requiriendo una GPU de clase profesional como A100 80GB, H100 80GB o similar.
- No cabe en GPUs de consumo (RTX 4090 tiene 24 GB, insuficiente sin cuantización).
- No se ofrecen cuantizaciones GGUF ni otras, por lo que la inferencia en CPU o GPUs pequeñas no es viable directamente.
- Opciones de despliegue: servidores de inferencia como vLLM o TGI pueden cargar el modelo en fp16 si se dispone de hardware suficiente, pero no hay documentación de rendimiento ni latencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. Aunque el tag `qwen3_5_moe` sugiere parentesco con la familia Qwen MoE (como Qwen3-30B-A3B o similares), no hay datos oficiales sobre el número de parámetros activos, contexto o rendimiento. Por tanto, no es posible comparar con alternativas como Mixtral 8x7B, Qwen MoE u otros modelos de tamaño similar sin inventar datos.

## Limitaciones y advertencias

- Es un checkpoint de salvamento privado, no una versión estable ni destinada a producción.
- No hay licencia especificada, lo que impide determinar si es legal su uso comercial.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- La arquitectura y el entrenamiento no están documentados; cualquier afirmación sobre sus capacidades es especulativa.
- No se han publicado evaluaciones de seguridad ni de rendimiento.
- El tag `image-text-to-text` no está respaldado por documentación; es posible que el modelo no tenga pesos multimodales reales.
- La fecha de creación (2026-08-14) es posterior a la fecha actual, lo que sugiere que el modelo podría ser un artefacto sintético o mal fechado; no se debe asumir su disponibilidad real.

## Enlaces

- [HuggingFace - unconst/Affine-5czsc2fc98-r37-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r37-merged)
- [Modelo base: kevin954/Affine-5dfqbbh8ev-sft](https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft) (enlace inferido del campo `base_model`, no verificado)
