# standjones/mirror-unconst-affine-5czsc2fc98-r579-r252-odpo-midrank-longctx-megaextra-merged

## Resumen

El modelo `mirror-unconst-affine-5czsc2fc98-r579-r252-odpo-midrank-longctx-megaextra-merged` es un fine-tuning experimental de tipo MoE (mezcla de expertos) con 35.107.181.936 parámetros totales, desarrollado por el usuario `standjones` sobre el modelo base `unconst/Affine-5czsc2fc98-r252-merged`. Según las etiquetas de HuggingFace, se basa en la arquitectura `qwen3_5_moe` e incorpora modificaciones denominadas "affine" (posiblemente relacionadas con capas de atención afín, aunque no se detalla). El entrenamiento emplea *offline DPO* (Direct Preference Optimization) sobre pares de preferencia de razonamiento generados por un teacher, con el objetivo de mejorar la capacidad de razonamiento en contextos largos (etiqueta `reason-v3`).

El modelo se presenta como un experimento de investigación dentro de una serie de variantes (LongCtx×MidRank MegaExtraSteps) y no incluye una documentación pública extensa más allá de la ficha de entrenamiento. Su licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque al ser un artefacto de investigación con pocas descargas y sin benchmarks publicados, su aplicabilidad en producción es limitada y requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Qwen3.5 MoE según tags) con modificaciones "affine" |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenamiento con max_len=16384) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors, probablemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo de mezcla de expertos (MoE) basado en la familia Qwen3.5, según la etiqueta `qwen3_5_moe`. El término "affine" en el nombre sugiere la incorporación de capas afines o mecanismos de atención afín, pero no se proporcionan detalles técnicos adicionales en la documentación disponible. El entrenamiento consistió en un fine-tuning mediante *offline DPO* sobre pares de preferencia de razonamiento generados por un teacher (el modelo base). El método selecciona como "chosen" aquella respuesta con mayor diferencia de log-probabilidad condicionada al pensamiento (`lpC(y_C|z)−lpC(y_C|∅)`), optimizando exclusivamente para la versión Reason v3.

Los hiperparámetros del fine-tuning incluyen una tasa de aprendizaje de `5e-6`, LoRA con rango `r=32` y alpha `α=128`, beta `β=0.02`, longitud máxima de secuencia de `16384` tokens y un máximo de `3600` pasos, aunque el entrenamiento se detuvo en el paso `312` por agotamiento de datos. El dataset utilizado (`dpo_duel_reason.jsonl`) contiene pares de preferencia derivados de duelos entre respuestas, filtrados con el criterio LongCtx MidRank. El entrenamiento se realizó en GPUs B200 (crown GPUs 6 y 7) y el proceso de merge y subida a HuggingFace se ejecutó en un sistema con 8×B200.

## Capacidades

- Razonamiento: el modelo está optimizado para tareas de razonamiento (etiqueta `reason-v3`), aunque no se especifican los tipos concretos de razonamiento (matemático, lógico, etc.).
- Generación de texto: al ser un LLM MoE de gran tamaño, es capaz de generar texto coherente en tareas generales, pero no hay evidencia publicada.
- Contexto largo: el entrenamiento utilizó secuencias de hasta 16384 tokens, lo que sugiere cierta capacidad para manejar contextos extensos, aunque no se confirma la longitud de contexto de inferencia.
- Fine-tuning específico: el modelo está diseñado para funcionar como un componente en pipelines de razonamiento con preferencias ancladas por teacher, lo que puede ser útil en entornos de investigación.

No se dispone de información sobre tool calling, capacidades multimodales o multilingüismo.

## Casos de uso

No se han documentado casos de uso específicos en la información proporcionada. Al tratarse de un modelo experimental de investigación, los posibles escenarios de aplicación son:

- Investigación en fine-tuning con DPO: el modelo sirve como referencia para estudiar el efecto del *offline DPO* con filtros de contexto largo y ranking medio en modelos MoE.
- Desarrollo de pipelines de razonamiento: puede integrarse en sistemas que requieran generar razonamientos anclados por un teacher, aunque requiere validación adicional.
- Experimentación académica: útil para comparar variantes de entrenamiento (como las series R567, R570, R575 mencionadas en la ficha) en entornos de laboratorio.
- Pruebas de concepto en generación de texto: dado su tamaño y licencia abierta, podría emplearse en prototipos que no requieran garantías de rendimiento.
- Análisis de sesgos en DPO: permite estudiar cómo el filtrado de preferencias afecta al comportamiento del modelo.
- Benchmarking de eficiencia: su arquitectura MoE puede interesar para evaluar el equilibrio entre parámetros totales y activos, aunque estos últimos no se han publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha menciona una "evidencia Sim" (n80) con una regla de decisión basada en margen pareado, mediana de pensamiento y umbral B, pero no se incluyen valores numéricos concretos ni comparaciones con otros modelos. Por tanto, no es posible presentar una tabla de rendimiento objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que el repositorio ocupa 70,2 GB y contiene pesos en safetensors (probablemente bf16), una carga completa requeriría al menos ~70 GB de VRAM, pero al ser MoE los requisitos reales dependen de los parámetros activos, que no se han publicado.
- GPU recomendadas: no disponible. El entrenamiento se realizó en GPUs B200, pero no se indica qué hardware es necesario para inferencia.
- Compatibilidad con GPU de consumo: no disponible. Sin conocer los parámetros activos ni la cuantización, no se puede determinar si cabe en GPUs como RTX 4090 (24 GB) o similares.
- Opciones de despliegue: no se mencionan herramientas específicas. Al estar en formato safetensors, podría cargarse con frameworks como Transformers, vLLM o llama.cpp (si se convierte a GGUF), pero no hay garantías de compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro de la misma serie o de la misma familia. El propio autor menciona variantes (R567, R570, R575, etc.) pero no ofrece datos comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos. Al ser un fine-tuning con DPO sobre preferencias generadas por un teacher, podría heredar o amplificar sesgos presentes en el dataset de preferencias, pero no hay evidencia pública.
- Riesgo de alucinacion: no se ha evaluado formalmente. Como cualquier LLM, existe riesgo de generar contenido falso o no verificado.
- Limitaciones de contexto o idioma: la longitud de contexto de inferencia no está publicada; el entrenamiento usó 16384 tokens, pero no se garantiza que el modelo funcione correctamente con esa longitud en producción. Los idiomas soportados no se especifican.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero el modelo es un artefacto experimental sin garantías de calidad o soporte.
- Caveat para produccion: al ser un modelo de investigación con pocas descargas y sin benchmarks, no se recomienda su uso en entornos productivos sin una validación exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/standjones/mirror-unconst-affine-5czsc2fc98-r579-r252-odpo-midrank-longctx-megaextra-merged
- Modelo base: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
- Otros enlaces relevantes: no se han encontrado papers, repositorios o demos adicionales en la búsqueda web.
