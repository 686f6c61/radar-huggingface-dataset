# sumitramurmu6666/Z-Image-Turbo

## Resumen

Z-Image-Turbo es un modelo de generación de imágenes texto-a-imagen de 6.154.908.736 parámetros (aproximadamente 6B) desarrollado por el equipo Tongyi-MAI de Alibaba. Se trata de la variante destilada de la familia Z-Image, construida sobre un Diffusion Transformer de flujo único (single-stream Diffusion Transformer) y entrenada para funcionar con solo 8 evaluaciones de función (NFE), lo que reduce drásticamente el coste computacional frente a los pipelines de difusión convencionales que requieren decenas de pasos.

El modelo destaca por ofrecer latencia de inferencia inferior al segundo en GPUs de clase empresarial H800 y por caber en dispositivos de consumo con 16 GB de VRAM. Está orientado a generación fotorrealista, renderizado de texto bilingüe (inglés y chino) y adherencia robusta a instrucciones. La versión alojada en el repositorio `sumitramurmu6666/Z-Image-Turbo` es un espejo del checkpoint oficial publicado por Tongyi-MAI bajo licencia Apache 2.0.

Este checkpoint es relevante para desarrolladores que necesitan integrar generación de imágenes de alta calidad en producción con requisitos de latencia estrictos, ya que combina un tamaño de 6B con un régimen de 8 pasos, lo que lo sitúa en un punto de equilibrio poco habitual entre calidad y eficiencia. Al estar disponible en formato `diffusers` y `safetensors`, se integra directamente en pipelines existentes de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Single-stream Diffusion Transformer (DiT) |
| Parametros totales | 6.154.908.736 (aprox. 6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (inglés); el modelo card menciona renderizado de texto bilingüe inglés-chino |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato diffusers) |

## Arquitectura y entrenamiento

Z-Image-Turbo es un Diffusion Transformer de flujo único (single-stream DiT). El modelo card describe la familia Z-Image como un "Efficient Image Generation Foundation Model with Single-Stream Diffusion Transformer". El modelo base Z-Image se preentrena y posteriormente se somete a SFT; la variante Turbo añade una fase de RL sobre ese proceso. El resultado es un modelo destilado que opera con 8 NFE y sin classifier-free guidance (CFG desactivado en la tabla del model zoo), frente a los 50 pasos y CFG activo del modelo base Z-Image.

La destilación a 8 pasos es la innovación técnica central: reduce el número de evaluaciones de función necesarias por imagen, lo que se traduce en latencia sub-segundo en H800 y viabilidad en GPUs de consumo con 16 GB de VRAM. El entrenamiento incluye fases de preentrenamiento, SFT y RL según la tabla del model zoo. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni detalles del esquema de RLHF/DPO empleado.

## Capacidades

- Generación de imágenes texto-a-imagen fotorrealistas de alta calidad.
- Renderizado de texto bilingüe (inglés y chino) dentro de la imagen generada.
- Adherencia robusta a instrucciones complejas de prompt.
- Inferencia rápida con solo 8 NFE, lo que habilita latencia sub-segundo en hardware empresarial.
- Ejecución en dispositivos de consumo con 16 GB de VRAM.
- Integración nativa con la librería `diffusers` mediante `ZImagePipeline`.
- No soporta tool calling ni function calling (es un modelo de generación de imágenes, no un LLM).
- No dispone de modo thinking, visión de entrada ni audio.
- Capacidades multilingües limitadas al inglés y chino en el renderizado de texto.

## Casos de uso

- Generación de imágenes bajo demanda en aplicaciones web: el modelo puede servirse con 8 NFE y latencia sub-segundo en H800, lo que permite responder a peticiones de usuarios en tiempo casi real sin encolar trabajos.
- Creación de material gráfico para marketing: genera imágenes fotorrealistas con texto renderizado en inglés o chino, útil para banners, carteles y creatividades que requieren tipografía legible dentro de la imagen.
- Prototipado rápido de conceptos visuales: al caber en 16 GB de VRAM, un desarrollador puede iterar localmente en una RTX 4090 o similar sin depender de infraestructura cloud.
- Generación de ilustraciones para contenidos editoriales: el modelo produce imágenes de alta calidad estética adecuadas para acompañar artículos, blogs y publicaciones.
- Integración en pipelines de `diffusers`: al ser compatible con `ZImagePipeline`, se puede encadenar con otros componentes (upscalers, post-procesado) en flujos automatizados de generación por lotes.
- Pruebas de concepto y demos interactivas: los Spaces oficiales en Hugging Face y ModelScope demuestran el despliegue en entornos ligeros, replicable para demos internas.
- Generación de assets para videojuegos o aplicaciones: útil para producir variaciones de personajes, entornos o iconos con prompts controlados, aunque la diversidad es limitada según el model zoo (diversity: Low).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo card indica que cabe en dispositivos de consumo con 16 GB de VRAM. Con 6.154.908.736 parámetros en safetensors, los pesos en precisión completa ocuparían aproximadamente 12,3 GB (FP16) o 24,6 GB (FP32); la afirmación de 16 GB sugiere el uso de precisión reducida o cuantización, aunque los tipos de cuantización no se detallan.
- GPU recomendadas: H800 para latencia sub-segundo según el model card; GPUs de consumo con 16 GB o más de VRAM (por ejemplo, RTX 4090, RTX 4080, RTX 3090) para ejecución local.
- Cabe en GPU de consumo: sí, según el model card, en dispositivos con 16 GB de VRAM.
- Opciones de despliegue: `diffusers` (librería oficial, pipeline `ZImagePipeline`), Spaces de Hugging Face y ModelScope. No se especifican en la información proporcionada soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLMs, no a difusión).
- Latencia y throughput: latencia sub-segundo en H800 con 8 NFE; no se proporcionan cifras de throughput ni latencia para otras GPUs.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables (parámetros, contexto, rendimiento, licencia) que permitan una comparación rigurosa. La familia Z-Image incluye otras variantes del mismo equipo que sí aparecen en el model zoo:

| Modelo | Parámetros | Pasos | CFG | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Z-Image-Turbo | 6B | 8 | No | Generación | apache-2.0 | Hugging Face, ModelScope |
| Z-Image | 6B (familia) | 50 | Sí | Generación | no disponible en la información | Hugging Face, ModelScope |
| Z-Image-Omni-Base | 6B (familia) | 50 | Sí | Generación y edición | no disponible en la información | Pendiente de publicación |
| Z-Image-Edit | 6B (familia) | 50 | Sí | Edición | no disponible en la información | Pendiente de publicación |

## Limitaciones y advertencias

- Diversidad baja: la tabla del model zoo clasifica Z-Image-Turbo con diversidad "Low", lo que implica menor variedad de identidades, poses y composiciones que el modelo base Z-Image.
- No apto para fine-tuning: la columna "Fine-Tunability" indica "N/A" para Turbo, por lo que no se recomienda como base para ajuste fino; para ello está Z-Image u Omni-Base.
- Sesgos conocidos: no se detallan en la información proporcionada, pero al ser un modelo entrenado con datos web es probable que herede sesgos de representación; se recomienda evaluar antes de uso en producción.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes plausibles pero factualmente incorrectas, especialmente en texto renderizado o escenas con detalles específicos.
- Limitaciones de idioma: el renderizado de texto está optimizado para inglés y chino; otros idiomas pueden degradarse.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar la procedencia de los datos de entrenamiento y las políticas de uso aceptable del proyecto original.
- Caveat de producción: la latencia sub-segundo solo está documentada para H800; en GPUs de consumo la latencia será mayor y debe medirse empíricamente.
- Repositorio espejo: el checkpoint aquí listado pertenece a un usuario tercero (`sumitramurmu6666`); para producción conviene usar el checkpoint oficial de `Tongyi-MAI` para garantizar integridad y actualizaciones.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/sumitramurmu6666/Z-Image-Turbo
- Hugging Face (checkpoint oficial): https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- GitHub oficial: https://github.com/Tongyi-MAI/Z-Image
- Blog oficial: https://tongyi-mai.github.io/Z-Image-blog/
- Paper (arXiv 2511.22699): https://arxiv.org/abs/2511.22699
- Paper (arXiv 2511.22677): https://arxiv.org/abs/2511.22677
- Paper (arXiv 2511.13649): https://arxiv.org/abs/2511.13649
- Demo online (Hugging Face Space): https://huggingface.co/spaces/Tongyi-MAI/Z-Image-Turbo
- Demo móvil (Hugging Face Space): https://huggingface.co/spaces/akhaliq/Z-Image-Turbo
- ModelScope (checkpoint): https://www.modelscope.cn/models/Tongyi-MAI/Z-Image-Turbo
- ModelScope (demo): https://www.modelscope.cn/aigc/imageGeneration?tab=advanced&versionId=469191&modelType=Checkpoint&sdVersion=Z_IMAGE_TURBO&modelUrl=modelscope%3A%2F%2FTongyi-MAI%2FZ-Image-Turbo%3Frevision%3Dmaster
- Galería de arte (PDF): assets/Z-Image-Gallery.pdf
- Galería web: https://modelscope.cn/studios/Tongyi-MAI/Z-Image-Gallery/summary
