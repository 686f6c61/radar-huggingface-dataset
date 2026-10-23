# tdvipp/sd-class-butterflies-64

## Resumen

`tdvipp/sd-class-butterflies-64` es un modelo de difusión de generación de imágenes incondicional, es decir, produce imágenes de mariposas de 64×64 píxeles sin ningún tipo de condicionamiento textual ni de etiqueta de clase. Lo publica el usuario `tdvipp` en Hugging Face y está etiquetado como material de la Unidad 1 del curso Diffusion Models Class de Hugging Face, por lo que se trata de un modelo docente y no de un modelo de producción.

Arquitectónicamente es un DDPM (denoising diffusion probabilistic model) con una U-Net de aproximadamente 113,7 millones de parámetros, empaquetado para la librería `diffusers` y consumible mediante `DDPMPipeline`. El repositorio ocupa unos 0,5 GB y se distribuye en formato `safetensors` bajo licencia MIT.

Su relevancia es formativa: sirve como ejemplo mínimo y reproducible para entender el pipeline completo de difusión (forward process, entrenamiento del denoiser y muestreo iterativo), para hacer pruebas de integración de `diffusers` y como base para experimentos de ajuste fino. No compite con modelos texto-a-imagen modernos ni cubre casos de uso generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DDPM (denoising diffusion probabilistic model) con U-Net; pipeline `DDPMPipeline` en `diffusers` |
| Parámetros totales | 113.673.219 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de imagen, no de texto); resolución de salida 64×64 píxeles |
| Tipos de cuantización | no disponible; no se publican variantes de 8 o 4 bits ni GGUF en el repositorio |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (formato `diffusers`), framework PyTorch |
| Tarea | `unconditional-image-generation` |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo sigue el esquema DDPM canónico: un proceso forward que añade ruido gaussiano progresivamente a la imagen durante un número fijo de pasos y una red neuronal que aprende a predecir el ruido en cada paso. La red es una U-Net convolucional con bloques residuales, normalización por grupos, embeddings sinusoidales de paso temporal y capas de auto-atención en las resoluciones espaciales más bajas, tal como se implementa en la clase `UNet2DModel` de `diffusers`. El muestreo se realiza con `DDPMPipeline`, que aplica por defecto un `DDPMScheduler` con 1000 pasos de denoising.

La model card no documenta el número de tokens ni de imágenes de entrenamiento, la composición exacta del dataset, la duración del entrenamiento ni si hubo ajuste posterior con RLHF, DPO o preferencias humanas; nada de ello está disponible. El propio nombre del checkpoint (`-64`) y el contexto del curso apuntan a un subconjunto de imágenes de mariposas a 64×64 píxeles, y las etiquetas `diffusion-models-class` confirman su origen docente, pero no se especifica la fuente ni el tamaño del conjunto de datos. Tampoco se describen innovaciones técnicas: no hay decodificación especulativa, atención lineal, destilación por pasos ni variantes de muestreo acelerado.

## Capacidades

- Generación de imágenes incondicional: produce una imagen de 64×64 píxeles a partir de ruido puro, sin prompt de texto, sin etiqueta de clase y sin imagen de referencia.
- Dominio restringido: el modelo está entrenado para un único concepto visual (mariposas estilizadas); no generaliza a otras categorías de imagen.
- Muestreo configurable: al ser un `diffusers` pipeline, permite cambiar el scheduler, el número de pasos de inferencia y la semilla para reproducibilidad.
- Ejecución en CPU y GPU: su tamaño reducido permite inferencia sin acelerador dedicado.
- Ajuste fino: sirve como punto de partida para reentrenar la U-Net con un dataset propio de imágenes a 64×64.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicables (el modelo no procesa texto).
- Capacidades especiales (visión de entrada, audio, thinking mode): no disponibles; no es un modelo multimodal ni acepta imagen de entrada.

## Casos de uso

- Material didáctico sobre difusión: usar el modelo para recorrer paso a paso el proceso de denoising, visualizar la evolución de la muestra desde ruido hasta imagen y explicar el papel del scheduler en un curso o taller.
- Prueba de integración de `diffusers` en CI: cargar el pipeline con `DDPMPipeline.from_pretrained('tdvipp/sd-class-butterflies-64')`, generar una imagen de 64×64 y verificar que el flujo de inferencia funciona tras actualizar versiones de la librería o de PyTorch.
- Aumentación de datos sintéticos: generar cientos de imágenes de mariposas a 64×64 para ampliar un dataset de clasificación de insectos de baja resolución, útil cuando la recolección de imágenes reales es costosa.
- Generación de texturas y patrones para diseño: producir mosaicos de mariposas para fondos, estampados o recursos de prototipado web, aceptando la resolución limitada y el reescalado posterior.
- Ajuste fino con dominio propio: reentrenar la U-Net con un conjunto de imágenes de 64×64 (logos, iconos, motivos florales) para obtener un generador específico de dominio con coste computacional bajo.
- Investigación en muestreo: comparar schedulers (`DDPMScheduler`, `DDIMScheduler`, `PNDMScheduler`) y número de pasos sobre el mismo checkpoint para medir la relación entre coste y calidad en un modelo de 113 M de parámetros.
- Base para calcular métricas generativas: emplear el modelo como referencia pequeña en la implementación de FID o IS, o como línea base en experimentos de evaluación de modelos generativos.
- Prototipado de interfaces de generación: validar la UX de una aplicación de generación de imágenes con un modelo ligero antes de migrar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, IS, precision/recall, ni comparaciones cuantitativas con otros modelos, y no se ha encontrado documentación adicional al respecto. No se deben asumir cifras de calidad para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB con lote de tamaño 1, suficiente para cualquier GPU de consumo de los últimos años. Los pesos en precisión de 32 bits ocupan alrededor de 455 MB y en 16 bits alrededor de 227 MB.
- GPU recomendadas: no requiere hardware de gama alta; funcionan RTX 4090, RTX 3090, RTX 3060, GTX 1660, T4, A100 o H100, aunque estas últimas quedan muy sobredimensionadas para 113,7 M de parámetros.
- Compatibilidad con GPU de consumo: sí, en prácticamente cualquier GPU con 2 GB o más de VRAM; también es viable en CPU, con latencias mayores.
- Opciones de despliegue: `diffusers` con PyTorch (GPU o CPU), exportación a ONNX mediante `optimum` para inferencia sin PyTorch, y scripts propios basados en `DDPMPipeline`. vLLM, llama.cpp, Ollama y TGI no son aplicables: no hay pesos GGUF ni se trata de un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones. Como referencia de orden de magnitud, el muestreo con 1000 pasos DDPM implica 1000 evaluaciones de la U-Net y suele tardar del orden de segundos en una GPU moderna y de decenas de segundos a minutos en CPU; reducir el número de pasos o usar un scheduler DDIM disminuye el coste de forma aproximadamente lineal.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tdvipp/sd-class-butterflies-64` | 113,7 M | 64×64 | Ninguno (incondicional) | MIT | Hugging Face, `diffusers` |
| `google/ddpm-cifar10-32` | ~35,7 M (aproximado) | 32×32 | Ninguno (incondicional) | Apache 2.0 según model card | Hugging Face, `diffusers` |
| `google/ddpm-celebahq-256` | ~113 M (aproximado) | 256×256 | Ninguno (incondicional) | Apache 2.0 según model card | Hugging Face, `diffusers` |
| `stable-diffusion-v1-5` (referencia de la categoría texto-a-imagen) | ~860 M (U-Net) | 512×512 | Texto | CreativeML OpenRAIL-M | Hugging Face, `diffusers` |

Las cifras de parámetros de los modelos de Google son aproximadas y deben verificarse en sus respectivas model cards antes de citarlas. La comparación relevante es con los DDPM incondicionales de `diffusers`: este checkpoint destaca por su licencia MIT y su tamaño intermedio, mientras que los modelos de Stable Diffusion pertenecen a otra categoría funcional (texto-a-imagen) y no son sustituibles entre sí.

## Limitaciones y advertencias

- Dominio y diversidad muy limitados: el modelo solo genera mariposas a 64×64 píxeles; cualquier expectativa de generación generalista es irreal.
- Riesgo de sobreajuste: con un dataset de clase probablemente pequeño, es esperable que reproduzca motivos vistos durante el entrenamiento; no se documenta ningún análisis de memorización.
- Calidad no evaluada: no hay FID ni ninguna otra métrica publicada, por lo que la calidad percibida puede variar mucho según la semilla y el scheduler.
- Alucinación en sentido estricto no aplica al no haber texto, pero sí hay riesgo de artefactos morfológicos (alas deformes, simetrías imposibles) inherentes a la resolución de 64×64.
- Idiomas y contexto: no disponibles porque el modelo no procesa lenguaje; no admite prompts ni instrucciones.
- Licencia MIT: permite uso comercial y modificación, pero la procedencia y las condiciones del dataset de entrenamiento no están documentadas, lo que conviene verificar antes de un uso comercial de las imágenes generadas.
- Sin mantenimiento aparente: 0 descargas, 0 likes y actualización en 2026-10-22; no hay garantía de soporte ni de corrección de errores.
- No apto para producción en flujos que requieran alta resolución, condicionamiento por texto o resultados verificables.
- La búsqueda web realizada no devolvió información técnica ni documentación adicional sobre este checkpoint; los resultados obtenidos no eran relevantes y se han descartado por completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tdvipp/sd-class-butterflies-64
- Repositorio del curso Diffusion Models Class: https://github.com/huggingface/diffusion-models-class
- Documentación de `DDPMPipeline` en `diffusers`: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
- Artículo original de DDPM (Ho, Jain, Abbeel, 2020): https://arxiv.org/abs/2006.11239
- No se han encontrado otros enlaces (papers, blogs, demos o repositorios) específicos de este modelo en la búsqueda web disponible.
