# Umranz/SD1.5-Uncensored-Photoreal

## Resumen

SD1.5-Uncensored-Photoreal es un modelo de difusion texto-a-imagen publicado por el usuario Umranz en Hugging Face, basado en la arquitectura Stable Diffusion 1.5 (backbone UNet) y construido sobre el checkpoint RealisticVision V5.1. Su propuesta de valor es doble: por un lado, genera imagenes fotorrealistas; por otro, ha eliminado permanentemente su alineamiento de seguridad mediante una tecnica de "abliteracion" aplicada directamente a los pesos, eliminando el safety checker y las restricciones internas de rechazo.

El metodo de abliteracion empleado, denominado por el autor "Heretic-DiT", consiste en una proyeccion de subespacio rank-2 de forma cerrada sobre los 16 modulos `attn2.to_v` del UNet, con "covariance shielding". A diferencia de otros enfoques que aplican filtros en tiempo de inferencia, todas las modificaciones estan horneadas en los pesos, por lo que el autor afirma un sobrecoste de inferencia de 0 ms.

El modelo utiliza el VAE `stabilityai/sd-vae-ft-mse`, que segun la model card proporciona mayor contraste y evita artefactos de banding de color. Se distribuye en formato safetensors compatible con la libreria diffusers (StableDiffusionPipeline). Es relevante para desarrolladores que buscan un modelo SD 1.5 fotorrealista sin filtros, aunque su uso plantea serias consideraciones eticas y legales que se detallan mas adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet de difusion latente), base RealisticVision V5.1 |
| Parametros totales | 859.520.964 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 77 tokens (limite estandar del codificador de texto CLIP de SD 1.5) |
| Tipos de cuantizacion | no disponible (fp16 recomendado en la model card) |
| Idiomas soportados | ingles (prompts) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

El modelo se apoya en el backbone UNet de Stable Diffusion 1.5, una arquitectura de difusion latente que genera imagenes de 512x512 pixeles mediante denoising iterativo en un espacio latente comprimido por un VAE. En este caso, el checkpoint base es RealisticVision V5.1, una variante de SD 1.5 especializada en fotorealismo, y el VAE se sustituye por `stabilityai/sd-vae-ft-mse`, entrenado con perdida MSE y conocido por producir colores mas saturados y bordes mas nitidos que el VAE original.

La innovacion tecnica principal es el proceso de abliteracion descrito como "Heretic-DiT": una modificacion de forma cerrada (sin entrenamiento adicional) que aplica una proyeccion de subespacio rank-2 sobre los modulos de atencion cruzada `attn2.to_v` (16 en total en el UNet de SD 1.5), con un termino de "covariance shielding" (M_pp) para preservar la calidad generativa. La formula publicada modifica los pesos W mediante el cociente de dos matrices de proyeccion y aplica el delta resultante restringido al subespacio V2. No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de texto (pipeline text-to-image), optimizada para retratos y escenas con aspecto fotografico.
- Resolucion nativa de 512x512 pixeles, ampliable con tecnicas externas (no documentadas en la model card).
- Ausencia total de filtros de seguridad: el safety checker se elimina (`safety_checker = None`) y las restricciones internas de rechazo estan abliteradas en los pesos.
- Sin sobrecoste de inferencia por la abliteracion (0 ms segun el autor), al estar las modificaciones horneadas en los pesos.
- Compatibilidad con schedulers avanzados: la model card recomienda DPMSolverMultistepScheduler con sigmas de Karras y algoritmo dpmsolver++.
- Soporte de negative prompts para controlar artefactos y calidad.
- Carga estandar en fp16 mediante la libreria diffusers de Hugging Face.

## Casos de uso

- Generacion de retratos fotorrealistas para proyectos creativos: el modelo hereda la especializacion fotografica de RealisticVision V5.1 y el VAE ft-mse mejora el contraste y la nitidez, adecuado para ilustracion de conceptos y moodboards.
- Produccion de assets para videojuegos y entornos 3D: la generacion a 512x512 con 30 pasos y DPMSolver++ ofrece un equilibrio entre calidad y velocidad para iterar texturas y referencias visuales.
- Investigacion en alineacion y seguridad de modelos de difusion: al tratarse de un ejemplo documentado de abliteracion mediante proyeccion de subespacio, sirve como caso de estudio para analizar como se eliminan comportamientos de rechazo en modelos generativos.
- Evaluacion de tecnicas de abliteracion sin coste de inferencia: la metodologia de forma cerrada permite comparar el impacto en calidad frente a otros metodos de eliminacion de filtros.
- Prototipado rapido de pipelines diffusers: la model card incluye codigo de carga directo con StableDiffusionPipeline, lo que facilita la integracion en aplicaciones existentes basadas en SD 1.5.
- Benchmarking de VAEs: al sustituir el VAE original por sd-vae-ft-mse, es util para comparar visualmente el efecto de distintos decodificadores en banding de color y contraste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un modelo de difusion texto-a-imagen, las metricas habituales de LLM (MMLU, HumanEval, GSM8K) no aplican; tampoco se incluyen metricas especificas de generacion de imagenes (FID, CLIP Score) en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 859,5 millones de parametros en fp16, el modelo ocupa aproximadamente 1,7 GB en pesos, mas el VAE y el codificador de texto; en la practica, SD 1.5 funciona de forma comoda con 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna con soporte CUDA; una RTX 3060 de 12 GB o una RTX 4060 Ti son mas que suficientes. No se requieren A100 ni H100.
- Consumer GPUs: cabe sin problemas en GPUs de gama media (RTX 3060, 4060, 4070 e inferiores en VRAM con offloading o attention slicing).
- Opciones de despliegue: diffusers (pipeline nativo segun la model card), ComfyUI y Automatic1111 (compatibles con checkpoints SD 1.5 en safetensors), y endpoints de inferencia de Hugging Face (el repo esta marcado como `endpoints_compatible`).
- Latencia y throughput: con DPMSolverMultistepScheduler y 30 pasos a 512x512 en una GPU consumer moderna, la generacion tipica de SD 1.5 tarda en el orden de 1-3 segundos por imagen; no hay cifras oficiales publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion nativa | Filtros de seguridad | Licencia |
|---|---|---|---|---|
| SD1.5-Uncensored-Photoreal (este) | 859,5 M | 512x512 | Eliminados (abliterado) | CreativeML Open RAIL-M |
| Stable Diffusion 1.5 (original, runwayml) | ~860 M | 512x512 | Safety checker incluido | CreativeML Open RAIL-M |
| RealisticVision V5.1 (base) | ~860 M | 512x512 | Safety checker incluido (segun pipeline estandar) | CreativeML Open RAIL-M |
| SDXL 1.0 (Stability AI) | ~2.600 M (UNet) | 1024x1024 | Safety checker incluido | CreativeML Open RAIL++-M |

Frente al SD 1.5 original, este modelo ofrece el mismo tamano y resolucion pero sin filtros y con un VAE mejorado. Frente a SDXL, pierde en resolucion nativa y detalle, pero es mucho mas ligero y rapido de ejecutar en hardware modesto.

## Limitaciones y advertencias

- Riesgo de uso indebido elevado: al estar la alineacion de seguridad abliterada, el modelo puede generar contenido que otros modelos rechazarian, incluyendo material potencialmente nocivo o ilegal segun la jurisdiccion. El usuario asume toda la responsabilidad legal y etica.
- La licencia CreativeML Open RAIL-M incluye restricciones de uso que prohiben ciertas aplicaciones; la eliminacion del safety checker no exime del cumplimiento de la licencia.
- Contexto de prompt limitado a 77 tokens (codificador CLIP de SD 1.5), lo que restringe la complejidad de las descripciones.
- Resolucion nativa de 512x512: generar a resoluciones superiores sin upscaling o tecnicas adicionales puede producir artefactos (duplicacion de anatomias, composiciones rotas).
- La abliteracion puede degradar la calidad general de generacion; el metodo incluye "covariance shielding" para mitigarlo, pero no hay metricas publicadas que cuantifiquen el impacto.
- Popularidad muy baja (32 descargas y 1 like en el momento de la ficha), lo que implica escasa validacion comunitaria y posible presencia de defectos no detectados.
- La model card contiene formulas matematicas sin documentacion externa verificable (paper o repositorio de "Heretic-DiT"), por lo que la metodologia no puede auditarse independientemente con la informacion disponible.
- Sesgos: al derivar de SD 1.5 y RealisticVision, hereda los sesgos de sus datasets de entrenamiento (no documentados aqui), tipicamente sesgos demograficos y esteticos de datos web.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Umranz/SD1.5-Uncensored-Photoreal
- VAE utilizado (stabilityai/sd-vae-ft-mse): https://huggingface.co/stabilityai/sd-vae-ft-mse
- Libreria diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license

No se han encontrado enlaces a papers, repositorios de codigo adicionales ni demos en la informacion proporcionada.
