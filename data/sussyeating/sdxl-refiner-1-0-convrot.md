# SUSSYEATING/SDXL-Refiner-1.0-ConvRot

## Resumen

SDXL Refiner 1.0 ConvRot es una versión cuantizada a INT8 del refinador de Stable Diffusion XL (SDXL) 1.0 de Stability AI, publicada por el usuario SUSSYEATING. Se trata de un checkpoint de un solo archivo en formato safetensors pensado para su uso directo en ComfyUI, que cuantiza las 484 capas lineales de la UNet a INT8 simétrico mediante una técnica de rotación de Hadamard con corrección de sesgo por calibración, mientras mantiene las capas Conv2d, el codificador de texto OpenCLIP-G y el VAE en FP16.

El modelo base, SDXL Refiner 1.0, es la etapa de refinado del pipeline SDXL: no genera imágenes desde cero, sino que recibe latentes (o una imagen) producidos por el modelo base y aplica una pasada adicional de difusión para mejorar el detalle y la calidad de la imagen final. Esta versión cuantizada reduce el tamaño del archivo de 6,08 GB a 4,64 GB (-23,6%) manteniendo una fidelidad prácticamente indistinguible del original según las métricas publicadas por el autor.

Su relevancia es práctica: permite ejecutar la etapa de refinado de SDXL en GPUs con menos VRAM o con mayor eficiencia de memoria, integrándose en flujos de trabajo de ComfyUI existentes sin cambios en el grafo (nodo `Load Checkpoint` estándar). La licencia es CreativeML Open RAIL++-M, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusión (SDXL Refiner) con codificador de texto OpenCLIP-G y VAE; capas lineales de la UNet cuantizadas a INT8 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolución de trabajo 1024×1024 en las evaluaciones) |
| Tipos de cuantizacion | INT8 simétrico con rotación de Hadamard y corrección de sesgo por calibración (484/484 capas lineales de la UNet); Conv2d, text encoder y VAE en FP16 |
| Idiomas soportados | no disponible (modelo texto-a-imagen; el prompt se procesa vía OpenCLIP-G) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | safetensors (checkpoint único para ComfyUI) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `stabilityai/stable-diffusion-xl-refiner-1.0`, que emplea una arquitectura de difusión latente con una UNet como red de denoising, un codificador de texto OpenCLIP-G y un VAE. El refinador de SDXL opera como segunda etapa del pipeline: recibe los latentes generados por el modelo base y aplica pasos adicionales de difusión para mejorar la nitidez y el detalle. No se dispone de información sobre el entrenamiento original más allá de lo publicado por Stability AI para el modelo base.

La innovación técnica de esta ficha es la cuantización ConvRot: todas las 484 capas lineales de la UNet se convierten a INT8 simétrico aplicando previamente una rotación de Hadamard, que reduce los valores atípicos y mejora la distribución de la cuantización, junto con una corrección de sesgo calibrada para las capas lineales elegibles. Las capas convolucionales (Conv2d), el codificador de texto y el VAE se mantienen en FP16 para preservar la calidad. El resultado es un archivo de 4,64 GB frente a los 6,08 GB del FP16, con una reducción del 23,6%.

## Capacidades

- Refinado de imágenes en el pipeline SDXL: recibe latentes o imágenes de la etapa base y aplica una pasada de difusión adicional para mejorar detalle y calidad.
- Generación image-to-image: pipeline declarado como `image-to-image`.
- Integración directa en ComfyUI mediante el nodo `Load Checkpoint` estándar (requiere ComfyUI >= v0.45.0).
- Compatible con el flujo Base+Refiner de SDXL (evaluado con handoff a 40 pasos y 1024×1024).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingües: no disponible; la comprensión de prompts depende del codificador OpenCLIP-G del modelo base.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales más allá de la generación de imagen.

## Casos de uso

- Refinado de imágenes en producción con SDXL: sustituir el refinador FP16 por esta versión INT8 en un pipeline Base+Refiner para reducir el uso de VRAM y el tiempo de carga del checkpoint sin cambios en el grafo de ComfyUI, gracias a la fidelidad medida (SSIM medio 0,99154 frente a FP16).
- Despliegue en GPUs de gama consumer: al ocupar 4,64 GB en disco y requerir menos memoria en inferencia que el FP16, permite ejecutar la etapa de refinado en tarjetas con 8-12 GB de VRAM junto con el modelo base cuantizado del mismo autor.
- Flujos de trabajo en ComfyUI para artistas e ilustradores: cargar el checkpoint con el nodo estándar y encadenarlo tras el base para obtener imágenes finales de mayor detalle en 1024×1024.
- Prototipado rápido de pipelines image-to-image: la reducción de tamaño acelera la carga del modelo en entornos de desarrollo y pruebas iterativas.
- Servicios de generación de imágenes con restricciones de memoria: en despliegues con múltiples modelos cargados simultáneamente, el ahorro de 1,44 GB por checkpoint libera VRAM para otros componentes del pipeline.
- Investigación sobre cuantización de modelos de difusión: sirve como referencia reproducible para estudiar el impacto de INT8 con rotación de Hadamard en la calidad de imagen, con métricas publicadas y script de verificación incluido.

## Benchmarks y rendimiento

Evaluación del autor en A100, ComfyUI v0.45.0, 8 prompts × 1024×1024, comparando contra el checkpoint FP16 sin cuantizar (`sd_xl_refiner_1.0_fp16.safetensors`), con BF16 sin cuantizar como referencia:

| Metrica vs FP16 | INT8 ConvRot (484/484) | Referencia BF16 sin cuantizar |
|---|---|---|
| Similitud coseno de latentes (media / mínima) | 0,99989 / 0,99982 | 0,99992 / 0,99986 |
| SSIM (media / mínima) | 0,99154 / 0,98751 | 0,99087 / 0,98572 |
| PSNR (media / mínima) | 42,96 / 40,60 dB | 42,88 / 40,00 dB |

No se han publicado otros resultados de benchmarks (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint ocupa 4,64 GB en disco frente a 6,08 GB del FP16, por lo que la huella en memoria se reduce en la misma proporción para las capas cuantizadas.
- GPU recomendadas: el autor evalúa en A100; por tamaño, es apto para GPUs consumer de gama alta y media.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8-12 GB de VRAM o más, especialmente si se combina con el modelo base cuantizado del mismo autor; no se especifican cifras exactas.
- Opciones de despliegue: ComfyUI (>= v0.45.0) mediante el nodo `Load Checkpoint`; no se mencionan otros runners (diffusers, vLLM, TGI) en la información disponible.
- Latencia y throughput: no disponibles; las evaluaciones se realizaron con handoff Base+Refiner a 40 pasos en A100, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDXL Refiner 1.0 ConvRot (este) | no disponible | no aplica | safetensors INT8, 4,64 GB | Open RAIL++-M | Hugging Face (SUSSYEATING) |
| stabilityai/stable-diffusion-xl-refiner-1.0 (FP16) | no disponible | no aplica | safetensors FP16, 6,08 GB | Open RAIL++-M | Hugging Face (Stability AI) |
| SUSSYEATING/SDXL-Base-1.0-ConvRot | no disponible | no aplica | safetensors INT8 | Open RAIL++-M | Hugging Face (SUSSYEATING) |
| SUSSYEATING/SDXL-Lightning-ConvRot | no disponible | no aplica | safetensors INT8 | Open RAIL++-M | Hugging Face (SUSSYEATING) |

Los tres repositorios ConvRot del mismo autor comparten la técnica de cuantización; el Base y el Lightning son alternativas para la etapa de generación inicial, mientras que este modelo cubre la etapa de refinado.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: requiere un modelo base SDXL (o latentes previos) para producir imágenes; usarlo solo no genera resultados desde cero.
- Riesgo de sesgos y alucinaciones visuales heredado del modelo base SDXL, no evaluado específicamente en esta cuantización.
- La cuantización INT8 introduce pequeñas desviaciones frente al FP16 (SSIM mínimo 0,98751, PSNR mínimo 40,60 dB); en casos extremos podría haber diferencias perceptibles en detalles finos.
- Licencia CreativeML Open RAIL++-M: incluye restricciones de uso (cláusulas de uso aceptable); es obligatorio redistribuir `LICENSE.md` y `NOTICE` junto con el modelo.
- Requiere ComfyUI >= v0.45.0 para cargar el checkpoint con el nodo estándar.
- Sin datos publicados sobre rendimiento en otros runners (diffusers, A1111) ni sobre latencia en GPUs consumer.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/SUSSYEATING/SDXL-Refiner-1.0-ConvRot
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0
- SDXL Base 1.0 ConvRot: https://huggingface.co/SUSSYEATING/SDXL-Base-1.0-ConvRot
- SDXL Lightning ConvRot: https://huggingface.co/SUSSYEATING/SDXL-Lightning-ConvRot
- SDXL Turbo ConvRot: https://huggingface.co/SUSSYEATING/SDXL-Turbo-ConvRot
- Script de verificación: `scripts/verify_sdxl_quant.py` (incluido en el repositorio)
- Métricas: `metrics/a100_refiner_int8_summary.json` (incluido en el repositorio)
