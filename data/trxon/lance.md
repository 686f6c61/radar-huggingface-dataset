# Trxon/Lance

## Resumen

Lance es un modelo multimodal unificado de 3B parámetros desarrollado por ByteDance que integra en un único framework la comprensión, generación y edición de imágenes y vídeo. El proyecto se presenta como un artefacto de investigación (no como un producto pulido) cuyo objetivo es estudiar la sinergia multitarea entre comprensión y generación visual bajo un presupuesto de cómputo contenido, con un entrenamiento realizado con hasta 128 GPU A100. La generación se entrenó hasta 768x768 píxeles en imagen y 480p a 12 FPS en vídeo.

El modelo se publica con licencia Apache 2.0 y pesos en formato safetensors, y la ficha de HuggingFace lo etiqueta como `pipeline_tag: any-to-any` con la librería `Lance`. Existe una discrepancia relevante en la información disponible: las etiquetas del repositorio indican que el modelo parte de `Qwen/Qwen2.5-VL-3B-Instruct` como base (finetune), mientras que la model card del autor afirma que Lance se entrenó desde cero ("trained from scratch"). Esa contradicción debe resolverse antes de asumir cualquiera de las dos afirmaciones.

El repositorio consultado figura bajo el identificador `Trxon/Lance`, mientras que la model card y los enlaces apuntan al proyecto oficial `bytedance-research/Lance`. No se han publicado en la información disponible resultados numéricos de benchmarks (solo se referencia una imagen de resumen de benchmarks), ni datos de idiomas soportados, contexto o cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal unificado "any-to-any" (comprensión, generación y edición de imagen y vídeo); arquitectura interna concreta no disponible |
| Parametros totales | 3B (el autor indica "3B active parameters"; no se especifica si es denso o MoE) |
| Parametros activos | 3B según el autor (denominados "active parameters") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base declarado | Qwen/Qwen2.5-VL-3B-Instruct (según etiquetas; la model card afirma entrenamiento desde cero) |
| Librería | Lance |
| Tamaño del repositorio | 30,8 GB |

## Arquitectura y entrenamiento

Lance se describe como un modelo multimodal nativo unificado de 3B parámetros que cubre imagen y vídeo tanto en entrada como en salida, abarcando comprensión, generación y edición dentro de un mismo framework ("Unified Multimodal Modeling by Multi-Task Synergy"). No se detalla en la información disponible el tipo concreto de transformer, el esquema de tokenización visual ni si emplea componentes separados (VAE, encoder visual, etc.), aunque el tamaño del repositorio (30,8 GB) es compatible con la presencia de varios submodelos además de los pesos principales.

El entrenamiento se realizó con una receta multitarea por etapas ("staged multi-task recipe") y un presupuesto de hasta 128 GPU A100, con entrenamiento de generación de imagen hasta 768x768 y de vídeo hasta 480p a 12 FPS. El autor reconoce explícitamente que la calidad puede variar según el prompt, la resolución, la duración, la complejidad del movimiento y el escenario de edición, y que la receta de post-entrenamiento es mejorable. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Comprensión de imagen y vídeo (video understanding).
- Generación de imagen a partir de texto (text-to-image) hasta 768x768 durante el entrenamiento.
- Generación de vídeo a partir de texto (text-to-video) hasta 480p a 12 FPS.
- Edición de imagen (image editing).
- Modelo "any-to-any" según la etiqueta de pipeline, lo que implica combinaciones multimodales de entrada y salida.
- Interfaz Gradio con soporte de generación, edición y comprensión de imagen y vídeo (actualización de 2026/05/26).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo "thinking", audio, etc.): no disponible.

## Casos de uso

- Generación de vídeo corto para prototipado de contenidos: Lance permite generar clips de texto a vídeo a 480p y 12 FPS, adecuado para previsualizaciones y maquetas de storyboard donde no se requiere resolución final.
- Edición de imagen asistida por instrucciones: al integrar edición en el mismo modelo que la comprensión, se puede usar para retoques guiados por lenguaje natural en flujos de post-producción.
- Búsqueda y descripción de vídeo (video understanding): indexado automático de material audiovisual generando descripciones o respuestas sobre el contenido para sistemas de catalogación.
- Generación de imágenes para ilustración o borradores: generación a 768x768 útil en iteración rápida de conceptos antes de un render de mayor calidad.
- Investigación en modelos multimodales unificados: al ser un artefacto de investigación de 3B entrenado con presupuesto limitado, sirve como base para estudiar sinergias entre comprensión y generación.
- Evaluación comparativa de pipelines any-to-any: útil para probar infraestructura (Gradio, inferencia) sobre tareas mixtas de imagen y vídeo en un solo modelo.
- Base para fine-tuning experimental: la hoja de ruta incluye la publicación del código de fine-tuning, lo que permitiría adaptaciones a dominios concretos (pendiente de publicación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card referencia una imagen de resumen de benchmarks (`assets/benchmarks/benchmark-overview.png`) para generación de imagen, edición de imagen, generación de vídeo y comprensión de vídeo, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K u otros) en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como estimación derivada del tamaño (3B parámetros), los pesos en fp16 ocuparían del orden de 6 GB, y en fp32 unos 12 GB, a lo que habría que sumar los componentes visuales y de generación (el repositorio completo ocupa 30,8 GB).
- GPU recomendadas: no disponible. El entrenamiento se realizó con hasta 128 GPU A100, lo que no implica requisitos equivalentes para inferencia.
- Encaje en GPU de consumo: no confirmado en la información disponible; probablemente viable en GPUs con suficiente VRAM una vez cuantizado, pero sin datos oficiales.
- Opciones de despliegue: la ficha menciona una demo en HuggingFace Spaces (Gradio) y una librería propia (`Lance`). No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lance | 3B | no disponible | No se han publicado cifras numéricas en la información disponible | Apache 2.0 | Pesos en safetensors; demo en HF Spaces |
| Qwen/Qwen2.5-VL-3B-Instruct | 3B | no disponible | no disponible | no disponible | Modelo base declarado por las etiquetas del repo |
| Otras alternativas multimodales unificadas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa fiable con modelos alternativos.

## Limitaciones y advertencias

- El propio autor indica que Lance es un proyecto de investigación y no un producto pulido; la calidad de salida puede variar según prompt, resolución, duración, complejidad del movimiento y escenario de edición.
- Discrepancia no resuelta sobre el origen del modelo: las etiquetas indican fine-tune sobre Qwen2.5-VL-3B-Instruct, mientras la model card afirma entrenamiento desde cero. Esto afecta a la interpretación de su procedencia y posibles sesgos heredados.
- Discrepancia de repositorio: la información de HuggingFace corresponde a `Trxon/Lance`, mientras la model card y los enlaces apuntan al proyecto oficial `bytedance-research/Lance`. Conviene verificar la procedencia y autenticidad de los pesos antes de usarlos en producción.
- No se han publicado datos de sesgos conocidos, riesgo de alucinación ni limitaciones de idioma en la información disponible.
- No se dispone de información sobre la longitud de contexto, lo que impide evaluar su comportamiento en tareas de contexto largo.
- No se detallan restricciones adicionales de licencia más allá de Apache 2.0; al ser un artefacto de investigación, se recomienda validar la calidad antes de cualquier uso comercial.
- La receta de post-entrenamiento se reconoce como mejorable, y el entrenamiento se realizó con un presupuesto de cómputo limitado (hasta 128 A100), lo que puede reflejarse en el rendimiento frente a modelos mayores.
- El código de fine-tuning y el soporte de image-to-video están en la hoja de ruta y no se confirman como disponibles.

## Enlaces

- HuggingFace (repositorio consultado): https://huggingface.co/Trxon/Lance
- HuggingFace (repositorio oficial citado en la model card): https://huggingface.co/bytedance-research/Lance
- Página del proyecto: https://lance-project.github.io/
- Paper (arXiv): http://arxiv.org/abs/2605.18678
- Código (GitHub): https://github.com/bytedance/Lance
- Demo (HuggingFace Space): https://huggingface.co/spaces/bytedance-research/Lance
