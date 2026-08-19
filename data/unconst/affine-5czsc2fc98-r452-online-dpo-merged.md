# unconst/Affine-5czsc2fc98-r452-online-dpo-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r452-online-dpo-merged` es un checkpoint derivado de un proceso de fusión LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`, publicado por el usuario `unconst` en HuggingFace. Según los metadatos, se trata de un modelo de generación de texto con 35.107.181.936 parámetros (aproximadamente 35,1 mil millones), almacenado en formato `safetensors` y compatible con la librería `transformers`. Los tags asociados (`qwen3_5_moe`, `image-text-to-text`) sugieren que la arquitectura subyacente podría ser un modelo de mezcla de expertos (MoE) con capacidades multimodales, aunque no se ha publicado documentación técnica que lo confirme.

El nombre del checkpoint indica que se aplicó un ajuste fino con *online DPO* (Direct Preference Optimization) durante la fase de entrenamiento, y que se trata de un "salvamento" de un checkpoint intermedio de un proyecto mayor, con una puerta de validación pendiente (Stage-5). No se ha publicado información sobre el dataset utilizado, las condiciones de licencia ni los idiomas soportados, lo que limita su uso directo en producción sin una evaluación adicional. A pesar de su tamaño considerable, el repositorio no ha recibido descargas ni valoraciones, lo que sugiere que es un artefacto experimental o privado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5_moe` sugiere MoE, sin confirmar) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible (posible MoE, sin dato) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información oficial sobre la arquitectura interna del modelo. El tag `qwen3_5_moe` sugiere que podría estar basado en una variante de la familia Qwen3.5 con arquitectura de mezcla de expertos, pero no hay confirmación en la model card. El checkpoint es el resultado de fusionar una LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`, y el nombre `online-dpo-merged` indica que se aplicó un proceso de optimización por preferencias (DPO) en línea antes de la fusión. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación adicionales.

## Capacidades

Las capacidades documentadas son escasas. A partir de los tags y el pipeline declarado:

- Generación de texto: el pipeline es `text-generation`, por lo que puede producir texto autónomo.
- Posible procesamiento multimodal: el tag `image-text-to-text` sugiere que el modelo podría aceptar imágenes como entrada adicional, pero no se ha verificado.
- No se documentan capacidades de *tool calling*, razonamiento multi-paso, ni soporte de agentes.
- No se especifican idiomas soportados.

Dado que no hay documentación adicional, cualquier otra capacidad debe considerarse no confirmada.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Al carecer de licencia clara y de información sobre su entrenamiento y capacidades reales, no es recomendable utilizarlo en entornos de producción sin una evaluación exhaustiva. Si se confirmara su naturaleza multimodal y su arquitectura MoE de 35B, podría explorarse en tareas como:

- Generación de descripciones de imágenes en entornos de investigación.
- Experimentación con técnicas de fusión LoRA y DPO en modelos de gran escala.
- Evaluación comparativa de checkpoints intermedios en pipelines de desarrollo.

Sin embargo, estas aplicaciones son hipotéticas y no están respaldadas por documentación oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Dado el tamaño de 35.107 millones de parámetros, se estiman los siguientes requisitos para inferencia (valores orientativos basados en el peso del modelo):

- VRAM estimada en FP16: ~70 GB (no cabe en GPUs de consumo actuales).
- VRAM estimada en cuantización de 8 bits: ~35 GB (podría caber en una RTX 4090 o A6000, si se dispone de cuantización, no confirmada).
- VRAM estimada en cuantización de 4 bits: ~17,5 GB (cabría en RTX 3090/4090, si la cuantización estuviera disponible).
- GPUs recomendadas: A100 80GB, H100 80GB o múltiples GPUs para FP16.
- Opciones de despliegue: al no haber cuantizaciones publicadas, solo se podría usar con `transformers` en precisión completa o mediante herramientas que soporten carga de safetensors (vLLM, TGI) si se generan las cuantizaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos. El tag `qwen3_5_moe` podría situarlo cerca de modelos como Qwen3-30B-A3B o DeepSeek-V2-Lite, pero sin datos de rendimiento ni arquitectura confirmada, cualquier comparación sería especulativa. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos y alucinaciones: al no haber documentación sobre el dataset de entrenamiento, no se pueden evaluar sesgos potenciales. Es probable que presente alucinaciones como cualquier modelo generativo de gran tamaño.
- Riesgo de uso en producción: la licencia no está especificada, lo que impide determinar si es legal su uso comercial. Se recomienda contactar al autor antes de cualquier uso.
- Limitaciones de contexto e idioma: desconocidas.
- Estado experimental: el propio autor indica que es un "salvamento" de un checkpoint intermedio, no una versión final validada. No se recomienda su uso en aplicaciones críticas.
- Reproducibilidad: no se proporcionan detalles del proceso de entrenamiento, por lo que no es posible reproducir ni verificar los resultados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r452-online-dpo-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
