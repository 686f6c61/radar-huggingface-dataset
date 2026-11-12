# wrldsuksgo2mars/Mistral-Large-4-EXL3-K4

## Resumen

Mistral-Large-4-EXL3-K4 es una conversión del checkpoint `mistralai/Mistral-Large-4-1T-A52B` publicada por el usuario `wrldsuksgo2mars` bajo el esquema de cuantización EXL3 en formato K4. Según la model card, el paquete conserva el núcleo original en FP8/BF16 junto con los expertos en K4, y no incluye ningún payload de núcleo cuantizado adicional. El checkpoint declara 281.611.447.840 parámetros reales en safetensors, muy por debajo del billón (1T) que sugiere el nombre del modelo base, lo que apunta a una poda o reempaquetado parcial durante el proceso de cuantización.

El modelo se apoya en el trabajo de Mistral AI sobre Mistral Large 4, un modelo de arquitectura Mixture of Experts con 1T de parámetros totales y 52B activos por token (A52B). Esta conversión concreta está pensada para servir el checkpoint en entornos con EXL3, un formato de cuantización de pesos orientado a inferencia de bajo bit-width, y se distribuye bajo la licencia `mistral-ecosystem-open-weight` heredada del modelo base.

La relevancia de esta ficha es doble: por un lado documenta una de las primeras conversiones EXL3 de un modelo de la familia Mistral Large 4; por otro, advierte de que el autor no reclama ninguna calificación de calidad de generación ni de rendimiento en serving, y que el paquete no incluye pruebas de bytes del núcleo cuantizado. Es, por tanto, un artefacto experimental de cuantización más que un checkpoint listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, derivada de Mistral Large 4 |
| Parametros totales | 281.611.447.840 (según safetensors del repo) |
| Parametros activos | 52B (según el identificador A52B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 K4 (4-bit), núcleo FP8/BF16 preservado |
| Idiomas soportados | no disponible |
| Licencia | mistral-ecosystem-open-weight (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts de Mistral AI con 1T de parámetros totales y 52B activos por token, según el identificador `Mistral-Large-4-1T-A52B`. La conversión EXL3 K4 mantiene el núcleo original en FP8/BF16 y aplica cuantización de 4 bits a los expertos, un esquema habitual en EXL3 para reducir el peso en disco y en VRAM sin tocar las capas críticas del modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

El autor declara explícitamente que este checkpoint "no incluye payload de núcleo cuantizado" y que las pruebas de bytes del núcleo original y el inventario del paquete están en `package-validation.json`. También advierte de que los diagnósticos del modelo padre describen la cuantización del padre, no el núcleo restaurado, y que no se reclama ninguna calificación de calidad de generación ni de rendimiento en serving. El dataset asociado en los tags es `wrldsuksgo2mars/agentic-quant-panel-v1`, que por el nombre parece un panel de evaluación de cuantización orientado a agentes, pero no se detalla su contenido.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Mistral Large 4, aunque no se han publicado evaluaciones específicas de esta conversión.
- Código y matemáticas: capacidades esperables del modelo base, sin benchmarks publicados para esta cuantización.
- Tool calling y function calling: no se documenta explícitamente en la model card; debe asumirse como no verificado en esta conversión.
- Soporte de agentes y razonamiento multi-paso: el dataset asociado (`agentic-quant-panel-v1`) sugiere evaluación orientada a agentes, pero no hay resultados publicados.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Evaluación de cuantización EXL3 K4: el checkpoint sirve para comparar la degradación de un MoE de gran tamaño frente a su versión FP8/BF16 en tareas de razonamiento y generación, usando el panel `agentic-quant-panel-v1` como referencia.
- Investigación en serving de MoE de bajo bit-width: permite medir throughput y latencia de un modelo de ~281B parámetros con expertos en 4 bits en GPUs de 80 GB, algo inviable con el checkpoint original de 1T.
- Reproducción de experimentos de cuantización: el archivo `package-validation.json` y las pruebas de bytes del núcleo original facilitan la verificación de integridad en pipelines de CI de modelos.
- Despliegue en clústeres multi-GPU con memoria limitada: al reducir el peso en disco a 546,5 GB, el checkpoint puede servirse en configuraciones de 8×H100 con tensor parallelism, siempre que se valide la calidad antes de usarlo en producción.
- Fine-tuning de bajo rango sobre la versión cuantizada: útil para estudiar la compatibilidad de adaptadores LoRA con expertos EXL3 K4 en un modelo grande.
- Benchmarking de herramientas de inferencia (vLLM, TGI, llama.cpp) sobre checkpoints EXL3: permite comparar el soporte de cada runtime para este formato en un modelo de escala grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no reclama ninguna calificación de calidad de generación ni de rendimiento en serving para este ensamblado.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 546,5 GB en safetensors; en inferencia, con overhead de activaciones y caché KV, se necesita al menos ~600 GB de VRAM agregada para cargar el checkpoint completo.
- GPU recomendadas: clústeres de 8×H100 80 GB o 8×A100 80 GB con tensor parallelism; también 4×H200 141 GB si el runtime soporta EXL3 K4.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090; el modelo exige un clúster multi-GPU.
- Opciones de despliegue: no se documenta soporte específico; EXL3 requiere runtimes con kernels dedicados (por ejemplo, exllamav2/exllamav3). No hay confirmación de soporte en vLLM, TGI, llama.cpp u Ollama para esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Mistral-Large-4-EXL3-K4 (este) | 281,6B | 52B | no disponible | mistral-ecosystem-open-weight | safetensors EXL3 K4 |
| mistralai/Mistral-Large-4-1T-A52B | 1T | 52B | no disponible | mistral-ecosystem-open-weight | safetensors FP8/BF16 |
| GLM-5.3-EXL3-K4-v1 | no disponible | no disponible | no disponible | no disponible | safetensors EXL3 K4 |

La comparativa con GLM-5.3-EXL3-K4-v1 se basa únicamente en la mención encontrada en el dataset `cuteafd-fidelity` del mismo autor; no se dispone de especificaciones detalladas de ese checkpoint.

## Limitaciones y advertencias

- El autor no reclama calidad de generación ni rendimiento en serving: no hay garantía de que la cuantización EXL3 K4 preserve el comportamiento del modelo base.
- El recuento real de parámetros (281,6B) no coincide con el billón del identificador del modelo base, lo que sugiere poda o reempaquetado parcial; conviene verificar la integridad antes de usar el checkpoint.
- El paquete no incluye payload de núcleo cuantizado y los diagnósticos del padre no describen el núcleo restaurado; la validación depende de `package-validation.json`.
- Riesgo de alucinación: no evaluado en esta conversión; debe medirse antes de cualquier uso en producción.
- Sesgos: no documentados; se heredan, en su caso, del modelo base Mistral Large 4.
- Idiomas soportados: no disponibles; no se puede asumir cobertura multilingüe sin verificación.
- Licencia `mistral-ecosystem-open-weight`: es una licencia "other" con términos específicos en el enlace del modelo base; revisar restricciones de uso comercial antes de desplegar.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de terceros.
- Sin soporte confirmado en los runtimes de inferencia más comunes; el despliegue requiere kernels EXL3 compatibles.

## Enlaces

- Hugging Face: https://huggingface.co/wrldsuksgo2mars/Mistral-Large-4-EXL3-K4
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Licencia del modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/f12dabdc0c1e99e7f7924461a6f308859b05af4d/LICENSE
- Dataset asociado: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
- Dataset de fidelidad del autor: https://huggingface.co/datasets/wrldsuksgo2mars/cuteafd-fidelity
