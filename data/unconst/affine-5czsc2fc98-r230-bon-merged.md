# unconst/Affine-5czsc2fc98-r230-bon-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r230-bon-merged` es un checkpoint experimental creado por el usuario "unconst" mediante la fusión de un LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según los metadatos de HuggingFace, se trata de un "salvage" (recuperación) de un checkpoint intermedio, descrito en la model card como "H1 merged checkpoint salvage" y con la nota "Private TTL insurance; not a submission until Stage-5 gate clears", lo que indica que es un artefacto de desarrollo privado, no una versión final destinada a publicación.

Los tags del repositorio sugieren que el modelo emplea una arquitectura de mezcla de expertos (MoE) bajo la designación `qwen3_5_moe` y que tiene capacidades multimodales de imagen a texto (`image-text-to-text`). Sin embargo, no se proporciona documentación adicional que confirme estos detalles ni que explique el proceso de entrenamiento. Con 35.107.181.936 parámetros totales (aproximadamente 35,1 mil millones) y un tamaño de repositorio de 70,2 GB en formato safetensors, el modelo es considerable, pero su relevancia práctica es limitada debido a la falta de información pública y a su carácter de checkpoint intermedio sin validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según tag `qwen3_5_moe`), no confirmado |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible es escasa. El modelo se describe como un "LoRA-merged" del checkpoint `kevin954/Affine-5dfqbbh8ev-sft`, lo que implica que se ha fusionado un adaptador LoRA con los pesos del modelo base. El tag `qwen3_5_moe` sugiere que la arquitectura subyacente es una variante de Qwen 3.5 con mezcla de expertos, aunque no hay confirmación oficial. También aparece el tag `image-text-to-text`, lo que indicaría una capacidad multimodal de procesamiento de imágenes y texto, pero no se especifica el mecanismo (por ejemplo, si se trata de un codificador visual adicional o de un modelo puramente textual con soporte de tokens de imagen).

No se dispone de datos sobre el conjunto de entrenamiento, el número de tokens procesados, ni sobre técnicas de alineación como RLHF o DPO. El autor menciona que es un "checkpoint salvage" privado, lo que sugiere que se trata de un artefacto intermedio de un proceso de desarrollo más amplio, no de un modelo final pulido.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que el modelo puede generar texto de forma autoregresiva.
- Posible capacidad multimodal: el tag `image-text-to-text` sugiere que acepta imágenes como entrada adicional al texto, aunque no hay ejemplos ni documentación que lo confirme.
- No hay información sobre soporte de tool calling, function calling, razonamiento multi-paso, ni modos especiales como "thinking mode".
- No se especifican capacidades multilingües; los idiomas soportados se indican como "no disponibles".

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Al tratarse de un checkpoint experimental sin validación, sin licencia clara y sin documentación técnica, no es recomendable utilizarlo en aplicaciones de producción. Los únicos usos plausibles serían:

- Experimentación interna: como punto de partida para investigar el comportamiento de un merge LoRA sobre una arquitectura MoE multimodal.
- Evaluación de continuidad de entrenamiento: dado que es un "salvage" de un checkpoint intermedio, podría servir para reanudar o comparar etapas de un proceso de fine-tuning.
- Análisis de arquitectura: para estudiar las características de un modelo MoE con capacidades de imagen-texto, aunque sin datos de rendimiento.

En cualquier caso, estos usos son especulativos y requieren que el usuario asuma todos los riesgos, dada la ausencia de garantías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar. Tampoco se ofrecen comparativas con modelos similares.

## Requisitos de hardware

- El modelo tiene aproximadamente 35,1 mil millones de parámetros. En precisión fp16 o bf16, los pesos ocupan unos 70,2 GB, lo que coincide con el tamaño del repositorio.
- Para inferencia en fp16 se necesitaría una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB o H100) o varias GPUs en paralelo.
- Al ser una arquitectura MoE, es posible que solo una fracción de los parámetros se active por token, pero no se conoce el número de parámetros activos, por lo que no se puede estimar una reducción de requisitos.
- No se ofrecen cuantizaciones (GGUF, GPTQ, etc.) en el repositorio, por lo que no es posible ejecutarlo en GPUs de consumo (como RTX 4090 con 24 GB) sin un proceso de cuantización manual.
- Opciones de despliegue: dado el formato safetensors y la integración con transformers, se podría usar vLLM, TGI o llama.cpp (tras conversión), pero no hay guías ni configuraciones recomendadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. Por tamaño y arquitectura (MoE), podría asemejarse a modelos como Mixtral 8x7B (47B totales, ~13B activos) o a las variantes MoE de Qwen, pero no hay datos de rendimiento ni especificaciones confirmadas que permitan una comparación objetiva. Por tanto, la comparativa se considera "no disponible".

## Limitaciones y advertencias

- Falta de documentación: no hay model card detallada, ni especificaciones de arquitectura, ni datos de entrenamiento.
- Licencia no especificada: el uso comercial o incluso la redistribución pueden ser problemáticos sin una licencia clara.
- Carácter experimental: el propio autor lo describe como un "salvage" privado, no como una versión estable.
- Riesgo de alucinación y sesgos: al no haber evaluación publicada, se desconocen los sesgos y la fiabilidad del modelo.
- Sin soporte de cuantizaciones: solo se ofrece safetensors, lo que limita su despliegue en hardware de consumo.
- Fecha de creación futura (2026-08-14) que sugiere que el modelo es muy reciente o que los metadatos son incorrectos; en cualquier caso, no hay historial de uso.

## Enlaces

- Modelo en HuggingFace: [unconst/Affine-5czsc2fc98-r230-bon-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r230-bon-merged)
- Modelo base: [kevin954/Affine-5dfqbbh8ev-sft](https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft) (enlace inferido, no verificado)
