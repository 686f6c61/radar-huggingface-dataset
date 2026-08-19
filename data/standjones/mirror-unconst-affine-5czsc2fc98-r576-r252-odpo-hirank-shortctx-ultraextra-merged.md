# standjones/mirror-unconst-affine-5czsc2fc98-r576-r252-odpo-hirank-shortctx-ultraextra-merged

## Resumen

El modelo `standjones/mirror-unconst-affine-5czsc2fc98-r576-r252-odpo-hirank-shortctx-ultraextra-merged` es un fine-tuning de la familia Qwen3.5 MoE (arquitectura affine) desarrollado por el usuario standjones. Parte del modelo base `unconst/Affine-5czsc2fc98-r252-merged`, que a su vez es una iteración de un proyecto de "reinados" (reigns) sobre arquitecturas MoE de 35.107 millones de parámetros totales. El objetivo declarado es mejorar las capacidades de razonamiento mediante *Offline DPO* (Direct Preference Optimization) sobre pares de preferencia generados por un modelo "teacher", con un filtro específico de contexto corto y ranking de alta relevancia.

El modelo se presenta como un experimento dentro de un pipeline de investigación más amplio (SN120, Reason v3) y no incluye métricas de evaluación publicadas. Su relevancia radica en ser un ejemplo de aplicación de DPO offline para ajustar modelos MoE de razonamiento, con una licencia Apache-2.0 que permite uso comercial. Sin embargo, al carecer de benchmarks y documentación detallada de arquitectura, su adopción en producción requiere validación adicional por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (affine) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (max_len de entrenamiento: 6144) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantificable a posteriori) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Qwen3.5 (etiquetado como `qwen3_5_moe` y `affine`), con 35.107 millones de parámetros totales. No se especifican los parámetros activos ni el número de expertos, aunque por el tamaño total y la familia se infiere una arquitectura de mezcla de expertos típica de Qwen. El entrenamiento consiste en un ajuste fino mediante *Offline DPO* sobre pares de preferencia de razonamiento (`dpo_duel_reason.jsonl`), donde la opción "chosen" se selecciona por una mayor puntuación `lpC(y_C|z) − lpC(y_C|∅)` (probablemente una medida de verosimilitud condicionada a un pensamiento o razonamiento previo). Se aplicó un filtro ShortCtx HiRank (contexto corto y ranking alto) y se usó LoRA con r=64, α=128, β=0.02, longitud máxima de 6144 tokens y un máximo de 2400 pasos (detenido en 221 por agotamiento de datos). El entrenamiento se realizó en 2 GPUs B300 (8×B300 en total para el cluster) y el proceso incluyó fusión de pesos y subida a HuggingFace.

No se detallan innovaciones técnicas adicionales más allá del uso de DPO offline con anclaje a un modelo teacher, ni se especifica la composición del dataset de entrenamiento más allá de su origen en "duelos" (duel-derived).

## Capacidades

- Razonamiento: el objetivo principal del DPO es mejorar la calidad del razonamiento paso a paso, especialmente en tareas que requieren cadenas de pensamiento.
- Generación de texto: heredada del modelo base, con capacidad de producir texto coherente en tareas generales.
- Multilingüismo: probablemente heredado de Qwen3.5, pero no confirmado en la documentación.
- Tool calling / function calling: no se menciona, aunque es probable que el modelo base lo soporte (Qwen3.5 suele incluirlo), pero no hay evidencia en esta ficha.
- Modo pensamiento (thinking mode): el entrenamiento con pares de razonamiento sugiere que el modelo puede generar razonamientos explícitos, pero no se documenta un modo especial.

## Casos de uso

- Resolución de problemas matemáticos y lógicos: el DPO sobre razonamiento puede mejorar la precisión en tareas de matemáticas y lógica formal, útil para asistentes educativos o herramientas de cálculo simbólico.
- Análisis de datos y generación de informes: con su capacidad de razonamiento, puede estructurar conclusiones a partir de datos tabulares o textuales, aunque requiere validación empírica.
- Asistencia en programación: si el modelo base soporta código, el fine-tuning podría mantener esa capacidad; se puede usar para generar explicaciones de algoritmos o depurar código con razonamiento explícito.
- Investigación académica: como modelo experimental, sirve para estudiar el impacto del DPO offline en MoE de razonamiento, comparando con el modelo base.
- Prototipado de agentes conversacionales: al poder generar cadenas de pensamiento, puede usarse en sistemas que requieran explicar sus decisiones, como chatbots de soporte técnico.
- Fine-tuning posterior: al ser Apache-2.0, puede servir como punto de partida para tareas específicas mediante ajuste adicional con LoRA o full fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una "sim evidence" con n80 y una regla de decisión basada en margen pareado, pero no se proporcionan números concretos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 35.107 millones de parámetros, en FP16 se necesitan ~70 GB (el repo pesa 70.2 GB). Con cuantización a 8 bits se reduce a ~35 GB, y a 4 bits a ~17.5 GB.
- GPU recomendadas: para FP16, una A100 80GB o H100 80GB. Para 8 bits, una RTX 4090 (24GB) o A6000 (48GB) es suficiente. Para 4 bits, una RTX 3090/4090 (24GB) o incluso una GPU de 16GB con cuantización agresiva.
- Despliegue: compatible con vLLM, llama.cpp, Ollama (si se convierte a GGUF) y TGI. Al ser safetensors, se puede cuantizar con GPTQ/AWQ.
- Latencia y throughput: no disponibles, dependen del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Como referencia estructural, se puede comparar con otros MoE de tamaño similar como Qwen3-30B-A3B (30B totales, 3B activos) o Mixtral 8x7B (47B totales), pero sin métricas no es posible establecer una comparativa objetiva. La información disponible no permite una tabla comparativa fiable.

## Limitaciones y advertencias

- Sesgos: al ser un fine-tuning sobre un modelo base no documentado en profundidad, puede heredar sesgos de género, cultura o idioma del corpus original.
- Alucinación: no se ha evaluado la tasa de alucinación; el DPO puede mejorar la fidelidad al razonamiento, pero no garantiza veracidad.
- Contexto limitado: el entrenamiento usó max_len=6144, lo que sugiere que el modelo puede no manejar bien contextos más largos (aunque el base podría soportar más, no está confirmado).
- Documentación escasa: no hay papers, benchmarks ni detalles de arquitectura más allá de la model card, lo que dificulta su uso en producción sin pruebas propias.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base `unconst/Affine-...` también debe cumplir su licencia (no especificada aquí, aunque probablemente también Apache-2.0).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/standjones/mirror-unconst-affine-5czsc2fc98-r576-r252-odpo-hirank-shortctx-ultraextra-merged
- Modelo base: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
- Búsqueda de fine-tunes del modelo base: https://huggingface.co/models?other=base_model:finetune:unconst/Affine-5czsc2fc98-r252-merged
