# unsloth/Qwen-Image-2.1-Turbo-FP8

## Resumen

Qwen-Image-2.1-Turbo-FP8 es una versión cuantizada del checkpoint Turbo de Qwen-Image-2.1, un modelo de generación y edición de imágenes desarrollado por el equipo Qwen (Alibaba). La cuantización la publica unsloth, que distribuye tres variantes de pesos comprimidos (FP8 e INT8) que reducen el transformer de 14,2 GB en bf16 a entre 7,1 y 7,3 GB, manteniendo la misma arquitectura de generación visual de 7B parámetros.

El modelo base Turbo es un checkpoint destilado para generar imágenes en solo 8 pasos de denoising con CFG=1, lo que lo hace especialmente adecuado para despliegues con requisitos de latencia ajustados. Esta versión cuantizada conserva el pipeline `QwenImage21Pipeline` de Diffusers y reutiliza el text encoder y el VAE del modelo original, por lo que la migración desde el checkpoint bf16 es directa.

La relevancia actual radica en que permite ejecutar un modelo de generación de imágenes de 7B en hardware con VRAM limitada, con una degradación perceptual muy contenida: la variante INT8-ConvRot alcanza un LPIPS de 0,037 frente al bf16, el valor más bajo de las tres alternativas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion visual (familia Qwen-Image 2.1), con text encoder y VAE separados |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 e4m3 con escalas por fila; INT8 W8A8 con rotacion Hadamard group-256; INT8 W8A8 sin rotacion |
| Idiomas soportados | en, zh |
| Licencia | qwen-research (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1-Turbo es un checkpoint acelerado de Qwen-Image-2.1, destilado para funcionar con 8 pasos de denoising y CFG=1 por defecto. Comparte la arquitectura de generación visual de 7B del modelo original e incluye un calendario de sigmas de muestreo preconfigurado, de modo que no requiere ajuste manual del scheduler. Emplea cacheo KV de prefijo para reutilizar el contexto del texto y de la imagen de referencia a lo largo de los pasos de denoising, lo que reduce el coste computacional por iteración.

La cuantización de unsloth se construyó a partir de la revisión `d65dbc9a7e8f6b5479e33dee6030eaab2a906509` del checkpoint Turbo, aplicando la misma receta que en `unsloth/Qwen-Image-2.1-FP8`: las capas de normalización, modulación, embeddings de timestep y (en INT8) `txt_in` permanecen en bf16, mientras que el resto de capas lineales se cuantizan. La variante INT8-ConvRot aplica una rotación Hadamard por grupos de 256 elementos antes de la cuantización, lo que reduce el error perceptual de forma notable. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación del modelo base en la documentación proporcionada.

## Capacidades

- Generación de imágenes texto-a-imagen con 8 pasos de denoising y CFG=1.
- Edición de imágenes, incluyendo el uso de imágenes de referencia como contexto (prefix KV caching).
- Renderizado de texto dentro de la imagen, con soporte para rótulos y menús (los ejemplos de la model card incluyen una pizarra de cafetería con el texto "FRESH COFFEE 2.50").
- Generación fotorrealista con control de profundidad de campo e iluminación (ejemplo del cachorro golden retriever en hojas de otoño).
- Soporte bilingüe de prompts en inglés y chino.
- Integración con Diffusers mediante `QwenImage21Pipeline`.
- No se ha documentado soporte de tool calling, agentes ni otras modalidades (audio, vídeo) en la información disponible.

## Casos de uso

- Generación de imágenes bajo demanda en aplicaciones web: el checkpoint Turbo con 8 pasos y CFG=1 reduce el tiempo de inferencia frente a modelos de 20-50 pasos, y la variante FP8 de 7,1 GB permite servirlo en GPUs de gama media.
- Edición de imágenes con referencia: el cacheo KV de prefijo reutiliza el contexto de la imagen de referencia entre pasos, lo que resulta adecuado para flujos de retoque o variación de producto en comercio electrónico.
- Creación de material gráfico con texto integrado: la capacidad de renderizar rótulos legibles permite generar carteles, menús y mockups publicitarios sin postprocesado tipográfico.
- Prototipado rápido en investigación: al cargarse directamente con `QwenImage21Pipeline` y safetensors (sin pickle), se puede integrar en notebooks y pipelines de experimentación sin ejecutar código arbitrario al cargar los pesos.
- Despliegue en hardware con VRAM limitada: las variantes INT8 y FP8 reducen el transformer a ~7,2 GB, lo que facilita ejecutar el modelo en GPUs consumer de 16-24 GB junto con el text encoder y el VAE.
- Generación de ilustraciones para contenidos en inglés y chino: el soporte bilingüe cubre casos de localización de material gráfico para mercados anglófonos y sinófonos.
- Evaluación comparativa de técnicas de cuantización: las tres variantes publicadas (FP8, INT8, INT8-ConvRot) con sus valores LPIPS permiten estudiar el impacto de la rotación Hadamard en modelos de difusión.

## Benchmarks y rendimiento

La model card publica una comparación de calidad perceptual (LPIPS AlexNet) frente al transformer bf16 del checkpoint Turbo, con 8 prompts x 2 semillas, 8 pasos, CFG=1, calendario de sigmas incluido y resolución 1024x1024, usando el mismo text encoder bf16 en todas las ejecuciones:

| Variante | Tamano | Esquema | LPIPS vs bf16 (menor es mejor) |
|---|---|---|---|
| INT8-ConvRot | 7,26 GB | INT8 W8A8, rotacion Hadamard group-256 | 0,037 |
| INT8 | 7,26 GB | INT8 W8A8, sin rotacion | 0,089 |
| FP8 | 7,12 GB | FP8 e4m3, escalas por fila | 0,125 |
| bf16 (referencia) | 14,2 GB | bf16 | 0 (referencia) |

No se han publicado resultados de benchmarks estándar (FID, CLIP score, GenEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para el transformer: ~7,1-7,3 GB en las variantes cuantizadas, frente a ~14,2 GB en bf16. Hay que sumar el text encoder (FP8 disponible en `unsloth/Qwen-Image-2.1-FP8`) y el VAE en bf16.
- GPU recomendadas: no especificadas en la documentación. Por tamaño, cabría en GPUs consumer de 16 GB o más (RTX 4080, RTX 4090, RTX 5080/5090) y en GPUs de datacenter (A100, H100) para despliegues concurrentes.
- Cabe en GPU consumer: sí, previsiblemente en modelos con 16 GB o más de VRAM, aunque el requisito exacto depende del text encoder y del VAE.
- Opciones de despliegue: Diffusers (build main con soporte de sigmas configuradas por pipeline, PR #14950), `transformers>=5.17.0`, `accelerate` y `pillow`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLMs, no a difusión).
- Latencia y throughput: no disponibles. El checkpoint Turbo está optimizado para 8 pasos con CFG=1, lo que reduce el número de evaluaciones del transformer frente a modelos de 20-50 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / pasos | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| unsloth/Qwen-Image-2.1-Turbo-FP8 | 7,1B | 8 pasos, CFG=1 | qwen-research | safetensors (FP8/INT8) | Cuantizado, LPIPS 0,037-0,125 |
| Qwen/Qwen-Image-2.1-Turbo | 7,1B | 8 pasos, CFG=1 | qwen-research | safetensors bf16 | Referencia sin cuantizar, 14,2 GB |
| Qwen/Qwen-Image-2.1 | no disponible | no disponible | qwen-research | safetensors | Modelo base completo, mas pasos |
| unsloth/Qwen-Image-2.1-FP8 | no disponible | no disponible | qwen-research | safetensors (FP8) | Version cuantizada del modelo base, comparte text encoder y VAE |

No se dispone de datos de benchmarks comparativos con otros modelos de generación de imágenes (Flux, SD3, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Licencia `qwen-research`: restringe el uso comercial; es necesario revisar los términos completos en el enlace de licencia del modelo base antes de desplegarlo en producción.
- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado con prompts en castellano u otras lenguas.
- La cuantización introduce degradación perceptual medible (LPIPS de 0,037 a 0,125 según variante); para máxima fidelidad hay que usar el checkpoint bf16.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir texto ilegible o incoherente en imágenes con rótulos complejos, y anatomías o perspectivas incorrectas.
- Sesgos del dataset de entrenamiento del modelo base no documentados en la información disponible; se recomienda evaluar sesgos demográficos y culturales antes de un despliegue público.
- Requiere una build main de Diffusers con soporte de sigmas configuradas por pipeline (PR #14950); versiones estables anteriores pueden no cargar el checkpoint correctamente.
- El repo ocupa 54,1 GB, por lo que la descarga y el almacenamiento requieren planificación.
- No se documentan límites de resolución, aunque los ejemplos y la evaluación LPIPS se realizan a 1024x1024.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unsloth/Qwen-Image-2.1-Turbo-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Modelo Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Version FP8 del modelo base: https://huggingface.co/unsloth/Qwen-Image-2.1-FP8
- Guia de unsloth para Qwen-Image-2.1: https://unsloth.ai/docs/models/qwen-image-2.1
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Blog de Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1-Turbo
- Discord de Qwen: https://discord.gg/BEYSk3pkSu
- Licencia: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
- PR de Diffusers con soporte de sigmas por pipeline: https://github.com/huggingface/diffusers/pull/14950
- Repositorio GitHub de unsloth: https://github.com/unslothai/unsloth
- Documentacion de unsloth: https://unsloth.ai/docs
- Discord de unsloth: https://discord.gg/unsloth
