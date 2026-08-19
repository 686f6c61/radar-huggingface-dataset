# unconst/Affine-5czsc2fc98-r575-r252-odpo-hirank-longctx-ultraextra-merged

## Resumen

Affine-5czsc2fc98-r575-r252-odpo-hirank-longctx-ultraextra-merged es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por el usuario `unconst` como parte de una serie experimental de fine-tuning sobre la familia Qwen 3.5. El modelo parte del checkpoint `Affine-5czsc2fc98-r252-merged` y se entrena mediante *offline DPO* (Direct Preference Optimization) con pares de razonamiento generados por un profesor (teacher-anchored Reason pairs), optimizado específicamente para la variante "Reason v3". Con 35.107 millones de parámetros totales, el modelo se publica bajo licencia Apache 2.0 y está pensado como un experimento de investigación para mejorar las capacidades de razonamiento en contextos largos.

La relevancia de este modelo reside en su método de entrenamiento: utiliza DPO fuera de línea con un filtrado de contexto largo (LongCtx) y una estrategia de clasificación de alta prioridad (HiRank), lo que lo diferencia de otros checkpoints de la misma serie (R568, R570, R573, etc.). Sin embargo, al tratarse de un lanzamiento reciente con cero descargas y sin documentación pública de rendimiento, su utilidad práctica aún no está validada por la comunidad. El autor proporciona una detallada descripción del proceso de entrenamiento, pero no incluye resultados de benchmarks ni ejemplos de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen 3.5 (tag `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (max_len de entrenamiento: 16.384 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información pública, pero el tag `qwen3_5_moe` indica que se trata de un modelo MoE de la familia Qwen 3.5, probablemente con una estructura de atención y capas de expertos similar a otros modelos de esa serie. El nombre "Affine" sugiere que incorpora transformaciones afines en alguna parte de su arquitectura, aunque no hay especificaciones técnicas al respecto.

El entrenamiento se realizó mediante *offline DPO* sobre pares de preferencia de razonamiento (`dpo_duel_reason.jsonl`), donde la opción elegida (chosen) corresponde a aquella con mayor puntuación `lpC(y_C|z) − lpC(y_C|∅)` según el profesor. Se aplicó un filtro de contexto largo (LongCtx) y se usaron los siguientes hiperparámetros: tasa de aprendizaje `5e-6`, LoRA con rango `r=64` y alpha `α=128`, beta `β=0.02`, longitud máxima `16.384` tokens y un máximo de 2.400 pasos, aunque el entrenamiento se detuvo en el paso 312 por agotamiento de datos. El proceso se ejecutó en GPUs B300 (8×) del nodo `gentle-wolf-8c`, usando las GPUs 4 y 5 tanto para el entrenamiento como para el merge final.

No se menciona el uso de RLHF, GRPO u otras técnicas de alineación; el enfoque se centra exclusivamente en DPO offline con un profesor anclado (teacher-anchored) para la generación de pares de razonamiento.

## Capacidades

- Generación de texto y razonamiento: al ser un modelo MoE entrenado con DPO sobre pares de razonamiento, se espera que tenga capacidades de razonamiento lógico y matemático, aunque no hay documentación oficial que lo confirme.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información).
- Soporte de agentes y multi-step reasoning: no disponible (no se menciona).
- Capacidades multilingües: no disponible (no se indican idiomas soportados).
- Capacidades especiales (thinking mode, vision, audio): no disponible. El tag `reason-v3` sugiere una variante de razonamiento, pero sin detalles.

Debido a la falta de documentación, no se pueden confirmar capacidades específicas más allá de lo inferido por el método de entrenamiento.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Al tratarse de un experimento de investigación sin validación externa, no se recomienda su uso en producción sin una evaluación previa. Los posibles escenarios de aplicación (como generación de razonamiento en contextos largos o fine-tuning adicional) son hipotéticos y no están respaldados por datos públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- Tamaño de pesos: 70,2 GB en safetensors (FP32 o FP16, no especificado).
- VRAM estimada para inferencia: con 35,1 B parámetros, en FP16 se necesitan ~70 GB de VRAM; en cuantización de 8 bits ~35 GB; en 4 bits ~17,5 GB. Sin embargo, no se han publicado cuantizaciones oficiales.
- GPUs recomendadas: para FP16 se requiere una GPU con al menos 80 GB (A100 80GB, H100) o varias GPUs en paralelo. Con cuantización a 4 bits podría caber en una RTX 4090 (24 GB) o similar, pero no está confirmado.
- Opciones de despliegue: al no haber cuantizaciones GGUF ni soporte explícito para vLLM, Ollama o TGI, se desconoce su compatibilidad con estos frameworks. Se podría intentar cargar con transformers y accelerate, pero no hay garantías.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro de la misma serie (por ejemplo, otros checkpoints de `Affine` como r67, r32 o r4-fullft) ni con otros modelos MoE de tamaño similar. No se puede realizar una comparativa objetiva sin datos de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información pública sobre sesgos; al ser un modelo derivado de Qwen, podría heredar sesgos de su base, pero no se ha evaluado.
- Riesgo de alucinación: no evaluado; el entrenamiento con DPO sobre razonamiento podría mitigar o exacerbar este riesgo, pero no hay datos.
- Limitaciones de contexto o idioma: la longitud de contexto oficial no se ha publicado; el entrenamiento usó 16.384 tokens, por lo que podría tener limitaciones en contextos más largos. Los idiomas soportados no se especifican.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial y modificación, pero al ser un modelo experimental sin documentación, su uso en producción conlleva riesgos.
- Caveat importante: el modelo tiene 0 descargas y 0 likes, y la model card es un registro interno de entrenamiento (no una guía de uso). No se recomienda su adopción sin una validación independiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/unconst/Affine-5czsc2fc98-r575-r252-odpo-hirank-longctx-ultraextra-merged)
- [Checkpoint base: Affine-5czsc2fc98-r252-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged) (referenciado en la model card)
- Otros modelos de la serie del autor (no directamente relacionados):
  - [Affine-5czsc2fc98-r67-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r67-merged)
  - [Affine-5czsc2fc98-r32-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r32-merged)
  - [Affine-5czsc2fc98-r4-fullft](https://huggingface.co/unconst/Affine-5czsc2fc98-r4-fullft)
