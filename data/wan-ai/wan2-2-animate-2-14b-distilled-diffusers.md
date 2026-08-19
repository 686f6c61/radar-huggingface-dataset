# Wan-AI/Wan2.2-Animate-2-14B-Distilled-Diffusers

## Resumen

Wan2.2-Animate-2-14B-Distilled es un modelo de animación de personajes desarrollado por el equipo Wan-AI de Alibaba, presentado como parte de la familia Wan2.2. Se trata de la versión destilada del modelo Wan2.2-Animate-14B, que introduce un framework end-to-end de animación de personajes capaz de consumir directamente vídeos de conducción (driving videos) en un Diffusion Transformer rediseñado, eliminando la necesidad de extractores de movimiento intermedios. Esto permite replicar movimientos y expresiones faciales con alta fidelidad mientras se preserva la identidad del personaje de origen.

El modelo añade además control de punto de vista de cámara mediante texto, lo que desacopla la perspectiva de la cámara del vídeo de conducción original. Con aproximadamente 16.400 millones de parámetros en sus pesos safetensors, está diseñado para tareas de síntesis de vídeo a partir de texto y vídeo, y se distribuye bajo licencia Apache-2.0, lo que facilita su adopción tanto en investigación como en producción. Su integración en la librería Diffusers mediante la pipeline `WanAnimate2Pipeline` simplifica su uso en entornos Python estándar.

La versión destilada (Distilled) está optimizada para reducir el número de pasos de inferencia y mejorar el rendimiento en tiempo real, aunque los detalles técnicos específicos del proceso de destilación no se han publicado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) rediseñado para animación de personajes |
| Parametros totales | 16.394.878.784 (16,39 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | no disponible (el modelo procesa vídeo; el control de cámara por texto está documentado en chino e inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Wan2.2-Animate-2-14B-Distilled se basa en un Diffusion Transformer (DiT) rediseñado específicamente para animación de personajes. A diferencia de enfoques anteriores que dependían de extractores de movimiento intermedios (como modelos de pose o keypoints), este framework consume directamente el vídeo de conducción completo, lo que permite una replicación holística del movimiento y las expresiones faciales. El modelo integra además un mecanismo de control de punto de vista por texto, que desacopla la perspectiva de la cámara del vídeo de entrada, ofreciendo flexibilidad creativa adicional.

No se dispone de información pública sobre los datos de entrenamiento, el número de tokens o pasos de optimización, ni sobre el uso de técnicas como RLHF o DPO. El sufijo "Distilled" indica que se trata de una versión destilada del modelo original Wan2.2-Animate-14B, probablemente entrenada mediante destilación de conocimiento para reducir el número de pasos de muestreo en inferencia, aunque no se han publicado detalles del proceso.

## Capacidades

- Animación de personajes a partir de un vídeo de conducción: el modelo transfiere el movimiento y las expresiones de un actor real a un personaje estático (imagen o vídeo) manteniendo la identidad visual del personaje.
- Replicación holística de movimiento: al eliminar extractores de movimiento intermedios, captura gestos sutiles, expresiones faciales y movimientos corporales completos con alta fidelidad.
- Control de punto de vista de cámara mediante texto: permite cambiar la perspectiva de la cámara del vídeo generado independientemente del vídeo de conducción original.
- Preservación de identidad: el modelo mantiene la apariencia del personaje original (rasgos faciales, vestimenta, estilo) durante la animación.
- Reemplazo de personaje: puede sustituir un personaje en un vídeo existente por otro manteniendo el movimiento original.
- Integración con Diffusers: disponible como pipeline `WanAnimate2Pipeline` en la librería Diffusers, lo que facilita su uso en flujos de trabajo estándar de Python.

## Casos de uso

- Producción audiovisual y postproducción: el modelo puede reemplazar actores en escenas ya filmadas, manteniendo el movimiento y las expresiones del actor original, útil para doblajes, reshoots o ajustes de casting.
- Animación de avatares para videojuegos: los desarrolladores pueden animar personajes 3D o 2D a partir de actuaciones capturadas con una cámara convencional, sin necesidad de trajes de captura de movimiento.
- Creación de contenido para redes sociales: permite generar vídeos animados de personajes propios (ilustraciones, mascotas, avatares) usando el movimiento de un vídeo de referencia, ideal para creadores sin equipo de animación profesional.
- Doblaje y sincronización labial: aunque no está confirmado explícitamente, la capacidad de replicar expresiones faciales sugiere su uso para sincronizar el movimiento de los labios con pistas de audio en diferentes idiomas.
- Publicidad y marketing: las marcas pueden animar sus mascotas o personajes de marca en campañas personalizadas, controlando el punto de vista de cámara mediante texto para adaptar el encuadre al formato del anuncio.
- Investigación en visión por computador: sirve como herramienta para estudiar la transferencia de movimiento, la síntesis de vídeo condicionada y el control de cámara en modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas cuantitativas como FID, LPIPS o precisión de movimiento que permitan comparar objetivamente este modelo con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 78,7 GB, lo que sugiere que los pesos en FP16/BF16 requieren aproximadamente 33 GB solo para el modelo principal (16,39 B parámetros), más espacio para el VAE y el text encoder. Se recomienda una GPU con al menos 40 GB de VRAM para inferencia completa.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), o GPUs de consumo de gama alta con 24 GB como la RTX 4090 podrían funcionar con cuantización o particionado, aunque no se ha confirmado.
- Si cabe en consumer GPU: probablemente no en GPUs de 16 GB o menos sin cuantización agresiva. Con cuantización a 8 bits, el modelo podría ocupar ~16 GB, pero no se ha verificado.
- Opciones de despliegue: la integración con Diffusers permite usar la pipeline `WanAnimate2Pipeline` en entornos Python. No se mencionan soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser una versión destilada, se espera que requiera menos pasos de muestreo que la versión original, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|
| Wan2.2-Animate-14B (original) | ~14 B (peso real no confirmado) | Apache-2.0 | Animación de personajes end-to-end con control de cámara por texto | Hugging Face, ModelScope |
| Wan2.2-Animate-2-14B-Distilled (este) | 16,39 B (safetensors) | Apache-2.0 | Versión destilada del anterior, optimizada para inferencia | Hugging Face |
| Animate Anyone (Alibaba) | no disponible | no disponible | Animación de personajes basada en pose | no disponible |
| Champ (no disponible) | no disponible | no disponible | Animación de personajes 2D | no disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos. La versión destilada debería ofrecer menor latencia que la original, pero no hay métricas publicadas.

## Limitaciones y advertencias

- La model card en Hugging Face es extremadamente escasa: solo contiene instrucciones de descarga en chino y no ofrece detalles técnicos, ejemplos de uso ni advertencias.
- No se ha publicado información sobre sesgos, alucinaciones visuales o artefactos en el vídeo generado. Es probable que el modelo herede sesgos de los datos de entrenamiento, pero no hay documentación al respecto.
- El control de cámara por texto puede no ser perfecto: la desacoplar la perspectiva del vídeo de conducción puede producir inconsistencias en escenas complejas.
- El tamaño del repositorio (78,7 GB) implica requisitos de almacenamiento y memoria significativos, lo que limita su uso en entornos con recursos limitados.
- Al ser un modelo de vídeo, no está diseñado para tareas de lenguaje natural; su uso en chatbots o generación de texto no es aplicable.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos completos de la licencia y las condiciones de uso del equipo Wan-AI.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que su rendimiento en casos de uso específicos debe validarse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B-Distilled-Diffusers
- Repositorio de Wan-Animate-2: https://github.com/Wan-Video/Wan-Animate-2
- Repositorio de Wan2.2: https://github.com/Wan-Video/Wan2.2
- Modelo original en Hugging Face: https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
- Modelo en ModelScope: https://www.modelscope.cn/models/Wan-AI/Wan2.2-Animate-2-14B
