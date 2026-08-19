# Wan-AI/Wan2.2-I2V-A14B

## Resumen

Wan2.2-I2V-A14B es un modelo de generación de vídeo a partir de imágenes (image-to-video) desarrollado por Wan-AI, la división de inteligencia artificial de Alibaba. Forma parte de la familia Wan2.2, una actualización importante de los modelos fundacionales de vídeo de Wan, y está diseñado para convertir una imagen estática en un clip animado con movimiento coherente y estética cinematográfica. El modelo emplea una arquitectura Mixture-of-Experts (MoE) aplicada a la difusión de vídeo, lo que permite ampliar la capacidad total del modelo sin incrementar el coste computacional durante el denoising, separando el proceso en expertos especializados por intervalos de tiempo.

El modelo se ha entrenado con un conjunto de datos significativamente mayor que su predecesor Wan2.1, con un 65,6 % más de imágenes y un 83,2 % más de vídeos, lo que mejora la generalización en movimientos complejos, semántica y estética. Además, incorpora datos curados con etiquetas detalladas de iluminación, composición, contraste y tono de color, lo que permite un control más preciso del estilo visual. Wan2.2-I2V-A14B soporta resoluciones de 480P y 720P, y está disponible bajo licencia Apache 2.0, con integración oficial en Diffusers y ComfyUI. El repositorio tiene un tamaño de 126,2 GB, lo que indica que se distribuye en múltiples ficheros de pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre difusión de vídeo |
| Parametros totales | No especificado oficialmente; el nombre sugiere 14B activos (MoE) |
| Parametros activos | No especificado oficialmente; probablemente 14B activos |
| Longitud de contexto | No disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Wan2.2-I2V-A14B utiliza una arquitectura MoE (Mixture-of-Experts) aplicada a un modelo de difusión de vídeo. A diferencia de los modelos densos convencionales, el proceso de denoising se divide en intervalos de tiempo (timesteps) y cada intervalo es gestionado por un subconjunto de expertos especializados. Esto aumenta la capacidad total del modelo sin incrementar el coste computacional por paso de inferencia, ya que solo se activan los expertos relevantes para cada fase del proceso de generación. Esta separación por timesteps permite que el modelo capture mejor la dinámica temporal del movimiento, reduciendo movimientos de cámara no realistas y mejorando la estabilidad de la síntesis.

El entrenamiento se realizó con un conjunto de datos ampliado respecto a Wan2.1, con un 65,6 % más de imágenes y un 83,2 % más de vídeos. Además, se incorporaron datos curados con etiquetas detalladas de estética (iluminación, composición, contraste, tono de color), lo que permite generar vídeos con estilos cinematográficos personalizables. No se menciona explícitamente el uso de RLHF o DPO en la información proporcionada, pero el énfasis en la calidad estética sugiere un pipeline de curado y posiblemente ajuste fino supervisado. El modelo se distribuye en formato safetensors y está integrado en Diffusers y ComfyUI, lo que facilita su uso en entornos de producción.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video), produciendo clips animados coherentes con el contenido visual de la imagen.
- Soporte de resoluciones de 480P y 720P, con generación a 24 fps según la documentación de la familia Wan2.2.
- Generación de movimientos complejos y naturales, con reducción de movimientos de cámara no realistas gracias a la arquitectura MoE.
- Estética cinematográfica controlable mediante etiquetas de iluminación, composición, contraste y tono de color, permitiendo estilos visuales personalizados.
- Soporte multilingüe para prompts en inglés y chino (aunque el modelo procesa texto como condición, la salida es vídeo).
- Integración con Diffusers y ComfyUI, lo que permite su uso en pipelines de generación de vídeo existentes.
- Capacidad de generar escenas estilizadas diversas, mejorando la generalización semántica y estética frente a versiones anteriores.

## Casos de uso

- Publicidad y marketing: generar vídeos promocionales a partir de imágenes de producto, con movimiento de cámara controlado y estética cinematográfica. El modelo permite crear clips de 720P a 24 fps, adecuados para campañas en redes sociales o vídeo publicitario.
- Producción cinematográfica y animación: previsualización de escenas a partir de storyboards o imágenes conceptuales, permitiendo a los directores evaluar el movimiento y la iluminación antes de la producción final. La capacidad de controlar la estética mediante etiquetas facilita la coherencia visual.
- Contenido educativo: crear vídeos animados a partir de diagramas o ilustraciones estáticas para explicar conceptos complejos, con movimiento que guía la atención del espectador.
- E-commerce: generar vídeos de demostración de productos a partir de fotografías, mostrando ángulos dinámicos o interacciones, lo que aumenta la conversión en tiendas online.
- Creación de contenido para redes sociales: transformar imágenes fijas en vídeos cortos con movimiento natural, ideal para plataformas como Instagram, TikTok o YouTube Shorts.
- Diseño de interiores y arquitectura: animar renders estáticos de espacios para mostrar recorridos virtuales o cambios de iluminación, útil para presentaciones a clientes.
- Investigación en visión por computador: servir como modelo base para experimentos en generación de vídeo condicionada por imagen, gracias a su licencia Apache 2.0 y su integración con Diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas con métricas como MMLU, HumanEval o similares, ya que se trata de un modelo de generación de vídeo y no de texto. Tampoco se proporcionan métricas específicas de calidad de vídeo (por ejemplo, FVD, CLIP score) en la documentación consultada.

## Requisitos de hardware

- El repositorio tiene un tamaño de 126,2 GB, lo que indica que los pesos completos en precisión fp16 o similar requieren un espacio de almacenamiento considerable.
- Para inferencia, se estima que un modelo MoE de 14B activos necesita al menos 28 GB de VRAM en fp16, pero al tratarse de un modelo de difusión de vídeo con múltiples expertos, el requisito real puede ser mayor. Se recomienda una GPU con 40 GB o más (por ejemplo, A100 40GB, A100 80GB, H100) o múltiples GPUs.
- El modelo no está diseñado para GPUs de consumo como la RTX 4090 (24 GB), aunque la documentación menciona que el modelo TI2V-5B de la misma familia sí puede ejecutarse en una 4090. Para el I2V-A14B, se necesitaría al menos una GPU de datacenter o un sistema multi-GPU.
- Opciones de despliegue: código oficial del repositorio Wan2.2 (GitHub), Diffusers (integración oficial), ComfyUI (integración oficial). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están especificados en la información disponible. Dado el tamaño y la arquitectura MoE, se espera que la generación de un clip de vídeo (por ejemplo, 5 segundos a 720P) tome varios minutos en hardware de gama alta.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. No se mencionan modelos alternativos de generación de vídeo como CogVideoX, Mochi, Open-Sora o Kling, ni se ofrecen tablas comparativas de rendimiento. Por tanto, no es posible realizar una comparativa objetiva con los datos disponibles.

## Limitaciones y advertencias

- El modelo está diseñado específicamente para generación de vídeo a partir de imágenes; no es un modelo de texto o multimodal general, por lo que no puede utilizarse para tareas de razonamiento, código o chat.
- Los prompts de texto deben estar en inglés o chino; no se garantiza el soporte de otros idiomas.
- Aunque la arquitectura MoE reduce movimientos de cámara no realistas, puede haber alucinaciones visuales en escenas complejas o con objetos poco representados en los datos de entrenamiento.
- La generación de vídeo de alta calidad (720P) requiere hardware de gama alta (múltiples GPUs o GPUs con 40 GB+ de VRAM), lo que limita su uso en entornos con recursos limitados.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos específicos de la familia Wan2.2 en el repositorio oficial para confirmar restricciones adicionales.
- El tamaño del repositorio (126,2 GB) implica un coste de descarga y almacenamiento significativo, y la inferencia puede ser lenta en hardware no optimizado.
- No se han publicado benchmarks oficiales de calidad de vídeo en la información disponible, por lo que la evaluación del rendimiento debe realizarse mediante pruebas propias.

## Enlaces

- HuggingFace: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Repositorio GitHub: https://github.com/Wan-Video/Wan2.2
- Paper técnico (arXiv): https://arxiv.org/abs/2503.20314
- Blog de Wan: https://wan.video/welcome
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Integración Diffusers (I2V-A14B): https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Integración ComfyUI: https://docs.comfy.org/tutorials/video/wan/wan2_2
