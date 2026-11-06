# yushengsu/Qwen3-8B-2layer-MoE-8E4A

## Resumen

Qwen3-8B-2layer-MoE-8E4A es un modelo borrador (draft model) para decodificación especulativa construido sobre Qwen/Qwen3-8B. No es un modelo generativo autónomo: es un cabezal auxiliar de dos capas que propone tokens candidatos que el modelo objetivo Qwen3-8B verifica después. Lo desarrolla el usuario yushengsu en el contexto del ecosistema SpecForge (sgl-project), la herramienta de entrenamiento de modelos especulativos asociada a SGLang.

La particularidad del modelo es que sus capas feed-forward son de tipo mixture-of-experts (MoE): 8 expertos enrutados de dimensión 1536 con top-4 activos por token, sin experto compartido. Esto lo distingue de los borradores densos habituales y de las variantes top-1 y top-2 del mismo autor, que forman parte de la misma familia experimental. El entrenamiento sigue la receta del PR #1003 de SpecForge, con pérdida de balanceo de carga por lote y sesgo de selección por experto.

El modelo tiene aproximadamente 0,48B parámetros totales y 0,33B activos por token, sin contar el embedding y el LM head del objetivo, que se reutilizan congelados. Su relevancia es fundamentalmente de investigación: explora cómo afecta el número de expertos activos en un borrador MoE a la longitud de aceptación en decodificación especulativa. La model card lo marca como pendiente de entrenamiento (estado en cola a fecha de publicación), por lo que no hay métricas finales publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador de 2 capas decoder con FFN MoE (DSpark draft sobre Qwen3-8B) |
| Parametros totales | ~0,48B (sin embedding ni LM head del objetivo) |
| Parametros activos | ~0,33B por token |
| Longitud de contexto | no disponible (entrenado con longitud maxima 8192) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (config.json + model.safetensors + tokenizer de Qwen3-8B) |

## Arquitectura y entrenamiento

El borrador consta de 2 capas decoder con hidden size 4096, 8 cabezas de atención y 2 cabezas KV (head dim 128), tamaño de bloque 16 y atención causal dentro del bloque. Se condiciona sobre los estados ocultos de Qwen3-8B en las capas 1, 9, 17, 25 y 33 mediante el proyector DSpark, e incorpora un cabezal Markov vanilla de rango 256 sin cabezal de confianza. Cada capa aplica un FFN MoE con 8 expertos SwiGLU enrutados de dimensión 1536, top-4, sin experto compartido, con router softmax sin renormalización top-k (cada experto seleccionado pondera su propia probabilidad softmax). El coste de FLOPs en el FFN por token es 4 veces el de un borrador denso de 1/8.

El entrenamiento usa 1.420.903 prompts de Open Perfect Blend con respuestas regeneradas por Qwen3-8B (temperatura 0, thinking desactivado), plantilla qwen3-instruct y longitud máxima 8192. Se ejecutan 5 épocas en una sola tirada, equivalentes a 53.822 pasos de optimizador con 132 secuencias por paso (batch 2, acumulación 11, 6 rangos DDP), AdamW con lr 6e-4, schedule coseno, 4% de warmup, grad clip 1.0 y semilla 42. La función de pérdida combina 0.1 de entropía cruzada y 0.9 de L1 con 512 anchors y loss_decay_gamma 7, más una pérdida de balanceo de carga por lote con coeficiente 0.005 y un sesgo de selección por experto en fp32 actualizado a 0.001 por paso hacia los expertos infrautilizados. El hardware empleado es un nodo de 8x H200 con 2 servidores de captura SGLang (GPUs 0-1) y 6 rangos de entrenamiento (GPUs 2-7).

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-8B; no es un modelo de chat autónomo.
- Aceleración de inferencia del modelo objetivo mediante verificación de propuestas en bloque (block size 16).
- Condicionamiento multi-capa sobre estados ocultos del objetivo (capas 1, 9, 17, 25, 33) para alinear las propuestas con la distribución del modelo grande.
- Enrutamiento MoE con top-4 expertos por token y sesgo de selección aplicado en la selección top-k durante el serving.
- Integración con SGLang mediante el bloque `Qwen3MoeDSparkModel` (requiere el PR sgl-project/sglang#47181).
- Verificación de paridad serving-entrenamiento: el FFN MoE de cada capa se comprueba contra `DFlashMoE` de SGLang, exigiendo coincidencia del 100% en los conjuntos de expertos elegidos y diferencia relativa L2 inferior al 0,5%.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking propias; hereda el comportamiento del objetivo Qwen3-8B en la generación final.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el borrador propone bloques de hasta 16 tokens que el objetivo verifica en paralelo, reduciendo el número de pasos de decodificación en despliegues con SGLang y GPUs H200.
- Investigación sobre decodificación especulativa con borradores MoE: permite comparar la longitud de aceptación frente a las variantes top-1 y top-2 del mismo autor para estudiar el compromiso entre FLOPs de FFN y tasa de aceptación.
- Evaluación de recetas de balanceo de carga: el sesgo de selección y la pérdida de balanceo por lote son configurables, lo que sirve para estudiar la estabilidad del enrutamiento en borradores de pocas capas.
- Servicio de bajo lote con latencia crítica: al ser un borrador de 0,33B activos, el coste adicional por paso es reducido frente al objetivo de 8B, adecuado para entornos interactivos donde la latencia por token es el cuello de botella.
- Validación de pipelines de exportación SpecForge a SGLang: cada carpeta de época es un export servible con verificación automática de paridad, útil como caso de prueba de la cadena de herramientas.
- Reproducción de experimentos: la configuración, el log de W&B y la rama de código están publicados, lo que permite replicar el entrenamiento en un nodo de 8x H200 y extenderlo a otros números de expertos activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de métricas por época (accuracy, entropía cruzada, longitud de aceptación de walk, carga máxima/media por experto) pero en la fecha de consulta solo figura la primera época con valores pendientes ("-") y checkpoint "pending".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~0,48B parámetros en fp16 el peso ronda 1 GB, más el coste del modelo objetivo Qwen3-8B (~16 GB en fp16) que debe residir junto al borrador.
- GPU recomendadas: el entrenamiento se realizó en 8x H200; para serving se asume un despliegue con el objetivo y el borrador co-localizados, por lo que se recomiendan H100/H200 o A100 de 80 GB para el pipeline completo.
- GPU de consumo: no hay datos publicados sobre ejecución en RTX 4090 u otras consumer; el borrador por sí solo cabría, pero el objetivo Qwen3-8B en fp16 requiere al menos 16 GB y en cuantización de 4 bits podría ajustarse a 24 GB, sin confirmación del autor.
- Opciones de despliegue: SGLang con el bloque `Qwen3MoeDSparkModel` (PR sgl-project/sglang#47181). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo indica que los FLOPs de FFN por token son 4 veces los de un borrador denso de 1/8, lo que anticipa mayor coste por paso a cambio de presumiblemente mayor aceptación.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos activos | Capas | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3-8B-2layer-MoE-8E4A (este) | ~0,48B totales / 0,33B activos | 4 de 8 | 2 | Apache 2.0 | Entrenamiento en cola |
| qwen3-8b-dspark-moe-batch-wise-0.005-selection-bias-only-5epoch | no disponible | 1 de 8 | 2 | Apache 2.0 | Misma receta, top-1 |
| qwen3-8b-dspark-moe-8expert-2activate-batch-wise-0.005-selection-bias-only-5epoch | no disponible | 2 de 8 | 2 | Apache 2.0 | Misma receta, top-2 |
| Borrador denso de 1/8 (referencia de FLOPs) | no disponible | n/a | 2 | n/a | Referencia citada en la model card |

La comparación con alternativas fuera de la familia del autor no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un generador autónomo: requiere Qwen3-8B como objetivo y el stack SGLang con el PR #47181; sin ellos no es utilizable.
- Estado de entrenamiento incierto: la model card indica que el run estaba en cola al publicarse y que las métricas por época aún no se han volcado, por lo que no hay evidencia publicada de la calidad final del borrador.
- Sin datos de benchmarks, longitud de aceptación ni throughput: no se puede evaluar su ganancia real frente a borradores densos o frente a las variantes top-1 y top-2.
- Riesgo de alucinación: como borrador, sus propuestas son verificadas por el objetivo, pero una baja tasa de aceptación degradaría el rendimiento en lugar de mejorarlo; no hay métricas para descartarlo.
- Sesgos: no documentados; al entrenarse sobre respuestas regeneradas por Qwen3-8B, hereda los sesgos del objetivo y del dataset Open Perfect Blend.
- Idiomas: no declarados en los metadatos; el dataset de entrenamiento y la plantilla qwen3-instruct sugieren cobertura multilingüe, pero no está confirmado por el autor.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la dependencia del código SGLang y del PR asociado puede introducir requisitos adicionales de la licencia de SGLang.
- Despliegue: la paridad serving-entrenamiento exige aplicar el sesgo de selección en la selección top-k; omitirlo en el servidor produciría divergencia respecto al modelo entrenado.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yushengsu/Qwen3-8B-2layer-MoE-8E4A
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Variante top-1: https://huggingface.co/yushengsu/qwen3-8b-dspark-moe-batch-wise-0.005-selection-bias-only-5epoch
- Variante top-2: https://huggingface.co/yushengsu/qwen3-8b-dspark-moe-8expert-2activate-batch-wise-0.005-selection-bias-only-5epoch
- PR de SpecForge con la receta: https://github.com/sgl-project/SpecForge/pull/1003
- Rama de entrenamiento (fork): https://github.com/yushengsu-thu/SpecForge/tree/exp/qwen3-8b-dspark-moe-8expert-4activate-selection-bias
- PR de la rama de entrenamiento: https://github.com/yushengsu-thu/SpecForge/pull/13
- PR de SGLang con el bloque de serving: https://github.com/sgl-project/sglang/pull/47181
- Log de entrenamiento (W&B): https://forge.coreweave.com/wandb/eigent_radixark_training/qwen3-8b-dspark/runs/pg20at1t
