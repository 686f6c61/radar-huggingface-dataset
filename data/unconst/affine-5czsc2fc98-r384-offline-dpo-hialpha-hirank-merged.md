# unconst/Affine-5czsc2fc98-r384-offline-dpo-hialpha-hirank-merged

## Resumen

`unconst/Affine-5czsc2fc98-r384-offline-dpo-hialpha-hirank-merged` es un checkpoint intermedio creado por el usuario `unconst` a partir de una fusión LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según las etiquetas de HuggingFace, emplea una arquitectura MoE basada en Qwen 3.5 (`qwen3_5_moe`) y admite entrada multimodal imagen-texto (`image-text-to-text`), aunque el pipeline declarado es `text-generation`. El modelo cuenta con aproximadamente 35 107 millones de parámetros y un tamaño de repositorio de 70,2 GB en formato `safetensors`.

La model card lo describe como un «salvamento de checkpoint fusionado H1» (H1 merged checkpoint salvage), indicando que es un resultado privado de un proceso de ajuste con DPO (offline, con `hialpha` y `hirank`) fusionado sobre un SFT previo. El autor aclara que no es una versión final ni una presentación oficial, sino una copia de seguridad intermedia («Private TTL insurance; not a submission until Stage-5 gate clears»). Esto implica que el modelo puede ser inestable, incompleto o no representativo del rendimiento final esperado.

La relevancia de esta publicación es limitada: sirve como referencia para desarrolladores que quieran inspeccionar el estado de un experimento de fusión LoRA sobre una arquitectura MoE multimodal, pero no debe considerarse un modelo listo para uso en producción. No se proporcionan detalles sobre entrenamiento, datos, licencia ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Qwen 3.5 (segun etiqueta `qwen3_5_moe`), multimodal imagen-texto |
| Parametros totales | 35 107 181 936 (~35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en `safetensors`, sin cuantizacion publicada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada. Las etiquetas indican que se trata de un modelo de mezcla de expertos (MoE) basado en Qwen 3.5, con capacidad para procesar tanto texto como imágenes (etiqueta `image-text-to-text`). No se especifica el número de expertos, la dimensión de los mismos ni el mecanismo de selección.

El proceso de entrenamiento, según la model card y el nombre del archivo, consiste en una fusión LoRA sobre un checkpoint previo `kevin954/Affine-5dfqbbh8ev-sft`. El nombre sugiere que se aplicó un ajuste con DPO (offline) con parámetros `hialpha` y `hirank`, y posteriormente se fusionaron los pesos LoRA con el modelo base. No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si se usaron otras técnicas como RLHF o PPO.

## Capacidades

- Generación de texto y conversación (etiqueta `conversational`, pipeline `text-generation`).
- Procesamiento multimodal imagen-texto (etiqueta `image-text-to-text`), aunque no se detalla qué tareas concretas (captioning, VQA, etc.) puede realizar.
- Al ser un checkpoint intermedio, las capacidades reales no han sido verificadas ni documentadas por el autor.

## Casos de uso

No se dispone de documentación que describa casos de uso reales o recomendados. Dado su carácter experimental y la falta de evaluación, cualquier aplicación práctica es especulativa. A modo orientativo, por su arquitectura MoE multimodal podría explorarse en tareas como:

- Prototipado de asistentes conversacionales con entrada visual: el modelo podría integrarse en demos que combinen imágenes y texto, aunque su estabilidad no está garantizada.
- Investigación sobre fusión LoRA y ajuste con DPO en arquitecturas MoE: sirve como referencia para estudiar el efecto de los hiperparámetros `hialpha` y `hirank`.
- Evaluación comparativa de checkpoints intermedios: útil para analizar la evolución del rendimiento durante el entrenamiento, si se dispone de otros checkpoints del mismo proceso.
- Pruebas de cuantización y despliegue en hardware limitado: al tener 35B parámetros, se pueden probar técnicas de cuantización (GGUF, AWQ) para medir la degradación.
- Análisis de sesgos y robustez en modelos MoE multimodales: aunque no hay datos, el modelo podría usarse en estudios exploratorios.
- Verificación de compatibilidad con librerías de inferencia (vLLM, TGI, llama.cpp) para arquitecturas MoE basadas en Qwen.

En todos los casos, se recomienda tratar el modelo como un artefacto de laboratorio y no como una solución estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se proporcionan requisitos oficiales. A partir del número de parámetros (35,1 B) y el tamaño del repositorio (70,2 GB, que corresponde aproximadamente a pesos en FP16), se pueden estimar los siguientes requisitos:

- VRAM para inferencia en FP16: ~70 GB, lo que requiere una GPU profesional como NVIDIA A100 (80 GB) o H100 (80 GB).
- Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ), la VRAM necesaria se reduciría a ~18-20 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Opciones de despliegue: vLLM, TensorRT-LLM, llama.cpp (si se convierte a GGUF), Ollama (si se genera un GGUF), Hugging Face TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos. El modelo no tiene benchmarks publicados, ni se conoce su rendimiento real. Se podría comparar con otros MoE de tamaño similar (por ejemplo, Mixtral 8x7B, Qwen 2.5 MoE), pero al no haber datos de evaluación, cualquier comparación sería especulativa. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- Checkpoint experimental: el propio autor indica que no es una versión final ni una presentación oficial. Puede contener artefactos de entrenamiento, inestabilidad o degradación de rendimiento.
- Sin licencia especificada: no se puede determinar si su uso comercial está permitido. Se recomienda contactar al autor antes de cualquier uso.
- Sin documentación de sesgos ni alucinaciones: no hay estudios de sesgos, riesgos de alucinación o limitaciones idiomáticas.
- Sin soporte garantizado: al ser un modelo personal con 0 descargas y 0 likes, no hay comunidad ni mantenimiento.
- Requisitos de hardware elevados: para una inferencia completa en FP16 se necesitan GPUs de gama alta con al menos 80 GB de VRAM.
- Fecha de creación futura (2026-08-16): el modelo está fechado en el futuro, lo que sugiere que podría tratarse de un error de metadatos o de un experimento con datos simulados; conviene verificar la autenticidad antes de usarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r384-offline-dpo-hialpha-hirank-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft

No se han encontrado otros enlaces (papers, blogs, repositorios de código) en la información proporcionada.
