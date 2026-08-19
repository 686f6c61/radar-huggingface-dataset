# unconst/Affine-5czsc2fc98-r174-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r174-merged` es un checkpoint resultante de la fusión de un adaptador LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez es un fine-tuning de un modelo con arquitectura Qwen3.5 MoE, según los tags del repositorio. El autor lo describe como un "H1 merged checkpoint salvage" y un "Private TTL insurance", lo que sugiere que se trata de un experimento técnico privado, no de un modelo destinado a producción. Con 35.107.181.936 parámetros totales (aproximadamente 35,1 mil millones) y un tamaño de repositorio de 70,2 GB en formato safetensors, el modelo está diseñado para generación de texto y, según los tags, podría tener capacidades multimodales (image-text-to-text), aunque no se proporcionan detalles al respecto.

El modelo fue creado el 14 de agosto de 2026 y no registra descargas ni interacciones en HuggingFace. Su licencia no está especificada, y no se ha publicado información sobre idiomas soportados, longitud de contexto, cuantizaciones ni resultados de benchmarks. En resumen, se trata de un artefacto de investigación con documentación mínima, cuya utilidad práctica queda limitada a la experimentación técnica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags sugieren qwen3_5_moe, sin confirmar) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible (probablemente MoE, sin dato oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible es muy limitada. El modelo es el resultado de fusionar un adaptador LoRA sobre el checkpoint `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez es un fine-tuning de un modelo base etiquetado como `qwen3_5_moe`. Esto indica que la arquitectura subyacente es probablemente un transformer de mezcla de expertos (MoE) de la familia Qwen3.5, aunque no se especifican detalles como el número de expertos, el tamaño de los parámetros activos ni la composición del dataset de entrenamiento. El tag `image-text-to-text` sugiere que el modelo podría aceptar entradas multimodales, pero no hay confirmación en la model card. No se mencionan técnicas de entrenamiento como RLHF, DPO ni innovaciones específicas. El autor indica que el checkpoint es un "salvamento" privado y que no es una submission hasta que se supere una fase de validación (Stage-5 gate).

## Capacidades

No se han documentado capacidades específicas en la model card. A partir de los tags y del pipeline declarado (`text-generation`), se puede inferir lo siguiente, aunque sin confirmación oficial:

- Generación de texto conversacional (tag `conversational`).
- Posible procesamiento de imágenes y texto (tag `image-text-to-text`), aunque no hay ejemplos ni documentación.
- Compatibilidad con la librería `transformers` y con endpoints de HuggingFace (tag `endpoints_compatible`).
- Sin información sobre tool calling, razonamiento multi-step, agentes o capacidades multilingües.

## Casos de uso

No se dispone de casos de uso documentados ni validados. Dado el carácter experimental del modelo y la ausencia de documentación, no es recomendable utilizarlo en entornos de producción. Posibles escenarios de uso, siempre bajo estricta evaluación previa:

- Investigación y experimentación: como referencia para estudiar el efecto de la fusión LoRA sobre un modelo MoE base.
- Pruebas de compatibilidad: para verificar que el formato safetensors y la integración con `transformers` funcionan correctamente en pipelines de texto.
- Desarrollo de prototipos internos: si se valida su comportamiento, podría servir como base para tareas de generación de texto o diálogo, siempre que se complete la documentación de licencia y rendimiento.
- Análisis de arquitectura MoE: para estudiar el comportamiento de un modelo de 35B parámetros con posible activación parcial de expertos.
- Evaluación de sesgos y alucinaciones: como caso de estudio para medir riesgos en modelos sin entrenamiento alineado explícito.
- Comparativa de técnicas de fusión: para contrastar este checkpoint con otros modelos resultantes de merges LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco hay comparaciones con modelos similares.

## Requisitos de hardware

Dado que el modelo tiene 35.107.181.936 parámetros y el repositorio ocupa 70,2 GB en safetensors (presumiblemente en precisión fp16), se puede estimar lo siguiente:

- VRAM estimada para inferencia: al menos 70 GB para cargar los pesos en fp16 sin cuantización. Con cuantización a 8 bits, se reduciría a unos 35-40 GB; a 4 bits, a unos 18-20 GB, pero no se dispone de archivos GGUF ni de cuantizaciones oficiales.
- GPU recomendadas: para fp16 completo, una NVIDIA A100 de 80 GB o una H100 de 80 GB serían necesarias. Con cuantización, una RTX 4090 (24 GB) podría ser suficiente si se aplica una cuantización a 4 bits, aunque no hay garantía de compatibilidad sin archivos preconvertidos.
- Opciones de despliegue: al ser un modelo de la familia `transformers`, se podría servir con vLLM, Text Generation Inference (TGI) o llama.cpp si se convierte a GGUF. No hay soporte nativo documentado para Ollama.
- Latencia y throughput: no disponibles. Al ser un posible MoE, la latencia dependería del número de parámetros activos, que se desconoce.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo no tiene parámetros activos publicados, ni benchmarks, ni licencia. Se podría comparar genéricamente con otros MoE de tamaño similar, como Mixtral 8x7B (46,7B totales, 12,9B activos) o Qwen2-57B-A14B, pero sin datos de rendimiento reales la comparación carecería de valor. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- Modelo experimental y privado: el autor lo describe como un "salvamento" y no como una submission final. No ha sido validado externamente.
- Licencia no especificada: no se puede determinar si es apto para uso comercial o de investigación. Debe contactarse con el autor antes de cualquier uso.
- Sin documentación de sesgos ni alucinaciones: no hay estudios de seguridad ni evaluación de riesgos.
- Sin información sobre idiomas: se desconoce si el modelo funciona correctamente en español u otros idiomas.
- Posible falta de alineación: al ser un merge LoRA sobre un fine-tuning, no se garantiza que siga instrucciones de forma segura o coherente.
- Fecha de creación futura (2026): el modelo está fechado en agosto de 2026, lo que puede indicar que es un artefacto de un proyecto en curso.
- Tamaño y requisitos: requiere hardware de gama alta para inferencia sin cuantización, y no se ofrecen versiones cuantizadas listas para usar.
- Sin comunidad ni soporte: con 0 descargas y 0 likes, no hay evidencia de uso o validación por terceros.

## Enlaces

- Repositorio HuggingFace: [unconst/Affine-5czsc2fc98-r174-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r174-merged)
- Modelo base: [kevin954/Affine-5dfqbbh8ev-sft](https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft) (enlace inferido del campo base_model; no se ha verificado su existencia)
