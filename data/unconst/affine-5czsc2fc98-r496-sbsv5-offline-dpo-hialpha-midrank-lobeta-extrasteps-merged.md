# unconst/Affine-5czsc2fc98-r496-sbsv5-offline-dpo-hialpha-midrank-lobeta-extrasteps-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r496-sbsv5-offline-dpo-hialpha-midrank-lobeta-extrasteps-merged` es un checkpoint resultante de la fusión de LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`, publicado por el usuario `unconst` en HuggingFace. Según la model card, se trata de un "H1 merged checkpoint salvage" descrito como un seguro TTL privado, no una submission definitiva hasta que se supere una fase de validación (Stage-5 gate). Esto indica que es un artefacto intermedio de un proceso de entrenamiento o fine-tuning, no un modelo final pulido para producción.

El modelo presenta 35.107.181.936 parámetros totales (aproximadamente 35,1 mil millones), un tamaño de repositorio de 70,2 GB en formato safetensors, y está etiquetado con los tags `qwen3_5_moe` e `image-text-to-text`, lo que sugiere que se basa en una arquitectura MoE (mixture of experts) de la familia Qwen 3.5 y que tiene capacidades multimodales (texto e imagen). Sin embargo, la información pública es extremadamente limitada: no se especifican detalles de arquitectura, contexto, licencia, idiomas ni benchmarks. Su relevancia actual es baja para uso directo, dado que carece de documentación y validación pública, pero puede interesar a investigadores que siguen el desarrollo de la serie Affine o que buscan explorar checkpoints intermedios de fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Qwen 3.5 (según tags `qwen3_5_moe`), multimodal texto-imagen (tag `image-text-to-text`) |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible es escasa. Por los tags de HuggingFace, el modelo pertenece a la familia `qwen3_5_moe`, lo que indica una arquitectura transformer con mezcla de expertos (MoE), probablemente con activación dispersa. También aparece el tag `image-text-to-text`, lo que sugiere que el modelo es multimodal y puede procesar tanto texto como imágenes, aunque no se detalla el mecanismo de visión (posiblemente un codificador visual integrado). El checkpoint se generó mediante la fusión de LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un fine-tune de un modelo anterior de la serie Affine. La model card menciona "offline-dpo-hialpha-midrank-lobeta-extrasteps", lo que sugiere que se aplicó un proceso de optimización con DPO (Direct Preference Optimization) con parámetros específicos de alpha, rank y beta, y pasos de entrenamiento adicionales. No se proporcionan datos sobre el dataset de entrenamiento, número de tokens, ni detalles del proceso de alineación.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Procesamiento multimodal de texto e imagen (según tag `image-text-to-text`), aunque no se especifica el detalle de las tareas de visión.
- Arquitectura MoE, que en principio permite escalar capacidad manteniendo coste computacional por token relativamente bajo.
- Compatible con la librería `transformers` y con endpoints de HuggingFace (`endpoints_compatible`).
- No se documentan capacidades específicas como tool calling, agentes, razonamiento multi-paso o modo thinking.

## Casos de uso

Dado el carácter experimental y la falta de documentación, los casos de uso son hipotéticos y dependen de la validación del modelo:

- Investigación en fine-tuning: como checkpoint intermedio de un pipeline de DPO, puede servir para estudiar el efecto de diferentes hiperparámetros (alpha, rank, beta) en la calidad del modelo final.
- Exploración de arquitecturas MoE multimodales: investigadores que trabajen con la familia Qwen 3.5 pueden analizar el comportamiento de este merge en tareas de generación de texto e imagen.
- Prototipado rápido en entornos controlados: si se valida, podría usarse para pruebas de concepto en chatbots o asistentes multimodales, siempre que se verifiquen sus limitaciones.
- Benchmarking de checkpoints intermedios: útil para comparar la evolución del rendimiento a lo largo del entrenamiento (aunque no hay datos públicos de benchmarks).
- Desarrollo de modelos derivados: como base para nuevos fine-tunes o merges, dado que ya incluye una fusión de LoRA.
- Evaluación de seguridad y alineación: el proceso DPO sugiere que se aplicó alineación con preferencias humanas, lo que podría interesar a equipos que estudian robustez y sesgos en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se ofrecen comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~35 B parámetros en MoE, la memoria necesaria depende de la cuantización y del número de expertos activos. Sin datos de cuantización ni de parámetros activos, no es posible estimar con precisión. En FP16, los pesos completos ocuparían aproximadamente 70 GB, lo que excede la VRAM de GPUs de consumo (p. ej., RTX 4090 con 24 GB). Se necesitarían GPUs de datacenter o cuantización agresiva (p. ej., 4-bit) para reducir el requisito.
- GPUs recomendadas: A100 (80 GB) o H100 (80 GB) para inferencia en FP16 sin cuantizar. Con cuantización 4-bit, podría caber en GPUs con 24-48 GB de VRAM, pero no hay confirmación.
- No se indica si es compatible con consumer GPUs; por el tamaño, no es realista en GPUs de 8-16 GB sin cuantización extrema.
- Opciones de despliegue: al ser un modelo de `transformers`, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF), pero no hay guías oficiales ni pruebas de rendimiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo parece ser un checkpoint intermedio de la serie Affine, de la que no hay datos públicos de rendimiento. Alternativas de tamaño similar (~30-40 B) en arquitectura MoE podrían ser Qwen2.5-MoE (14 B activos) o Mixtral 8x7B, pero no se pueden comparar sin benchmarks. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- Modelo sin validar: la model card lo describe como un "salvage" privado, no una submission final. Puede contener artefactos de entrenamiento o degradación de calidad.
- Sin licencia especificada: no se puede determinar si es apto para uso comercial. Se recomienda contactar al autor antes de cualquier uso.
- Sin documentación de sesgos ni alucinaciones: al ser un checkpoint intermedio, es probable que presente problemas de coherencia, alucinación y sesgos no mitigados.
- Idioma no especificado: no se sabe si el modelo funciona bien en castellano u otros idiomas.
- Contexto desconocido: la longitud de contexto no está documentada; podría ser inferior a la de modelos comerciales.
- Sin soporte oficial: no hay issues, comunidad ni mantenimiento garantizado.
- Fecha de creación futura (2026-08-16): el timestamp es posterior a la fecha actual, lo que sugiere que podría ser un error o un artefacto de un entorno de prueba; conviene verificar la autenticidad del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r496-sbsv5-offline-dpo-hialpha-midrank-lobeta-extrasteps-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft

No se encontraron papers, blogs, demos ni otros recursos adicionales en la información proporcionada.
