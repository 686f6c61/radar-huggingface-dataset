# tillknuesting/chroma1-hd-mlx

## Resumen

Chroma1-HD MLX es un port no oficial a MLX del modelo de generación de imágenes Chroma1-HD de lodestones, desarrollado por tillknuesting para ejecutarse nativamente en Apple Silicon sin depender de PyTorch. El modelo original es un transformer MMDiT de 8.900 millones de parámetros derivado de FLUX.1-schnell, orientado a text-to-image de alta calidad. Este port reimplementa en MLX todos los componentes de inferencia: el encoder de texto T5-XXL, el transformer MMDiT, el decoder VAE de FLUX, el sampler, el pipeline y la interfaz de línea de comandos.

La relevancia de este port radica en que hace viable ejecutar un modelo de imagen de casi 9.000 millones de parámetros en un Mac con 16 GB de memoria unificada, algo que con diffusers y PyTorch sobre MPS provoca swapping y tiempos sensiblemente mayores. El autor publica mediciones concretas: 3,0× más rápido por paso de denoising a 512×512 y 1,7× a 768×1024 frente a `ChromaPipeline` de diffusers, con un 41–44 % menos de memoria pico usando el transformer de 4 bits.

El repositorio incluye checkpoints del transformer cuantizados a 4 y 6 bits, un encoder T5-XXL a 8 bits y los pesos de tokenizer y VAE sin modificar respecto al modelo base. La licencia es Apache 2.0, heredada del modelo original, y el formato de pesos es safetensors con cuantización afín de MLX (group size 64).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MMDiT (transformer de difusión multimodal), derivada de FLUX.1-schnell |
| Parámetros totales | 8.900 millones (modelo base Chroma1-HD) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; el encoder T5-XXL procesa el prompt) |
| Tipos de cuantización | Transformer a 4 bits y 6 bits (MLX affine, group size 64); T5-XXL a 8 bits con FFN `wo` y embeddings en bf16 |
| Idiomas soportados | no disponible (el prompt se procesa vía T5-XXL, multilingüe por herencia del encoder) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con tokenizer y VAE en formato original de lodestones/Chroma1-HD |

## Arquitectura y entrenamiento

El modelo base Chroma1-HD emplea una arquitectura MMDiT (Multimodal Diffusion Transformer) de 8.900 millones de parámetros, construida sobre FLUX.1-schnell. El pipeline combina un encoder de texto T5-XXL que proyecta el prompt a embeddings, un transformer MMDiT que realiza el denoising iterativo en el espacio latente y un decoder VAE de FLUX que reconstruye la imagen final a partir del latente. El sampler y la pipeline gestionan la integración entre estos componentes.

Este port no entrena ni afina el modelo: reimplementa la inferencia en MLX. Una de las optimizaciones clave es que, mientras diffusers atiende a 512 tokens de texto con padding, el port conserva solo los tokens reales más uno de padding (114 y 118 tokens para el prompt y el negativo del ejemplo oficial), lo que reduce el coste de atención. Además, la pipeline mantiene un único modelo grande en memoria a la vez (primprimero T5, luego transformer, luego VAE), lo que permite ejecutar en 16 GB sin swapping. La cuantización afín de MLX con group size 64 se aplica a los pesos del transformer, y el autor reporta que el checkpoint de 6 bits es más preciso que el GGUF Q6_K equivalente (error medio de velocidad 4,13 % frente a 4,77 % respecto a float32).

## Capacidades

- Generación de imágenes text-to-image a resoluciones de 512×512, 768×1024 y 1024×1024.
- Control fino mediante prompt, prompt negativo, CFG (guidance scale), pasos de muestreo y semilla.
- Reproducibilidad: los PNG generados embeben el prompt, la semilla, todos los ajustes y el transformer utilizado en chunks de texto.
- Ejecución nativa en Apple Silicon sin PyTorch: todo el código de inferencia (T5, transformer, VAE, sampler, pipeline y CLI) está en MLX.
- Dos variantes de cuantización del transformer (4 y 6 bits) para equilibrar memoria y fidelidad.
- Flujo de trabajo con borrador rápido a 512×512 (unos 4,5 minutos en Mac mini M4 de 16 GB) y render final a 1024×1024 (unos 18 minutos).
- No soporta tool calling, agentes, razonamiento multi-step ni otras capacidades de texto; es exclusivamente un modelo de imagen.

## Casos de uso

- Generación de imágenes en local en equipos Apple Silicon sin GPU dedicada: el port permite crear imágenes de hasta 1024×1024 en un Mac mini M4 de 16 GB, con tiempos de 4,5 minutos para borradores y 18 minutos para render final, sin necesidad de servicios en la nube.
- Prototipado rápido de conceptos visuales: usar la resolución 512×512 con 3 pasos para iterar sobre prompts e ideas en menos de un minuto (38 s de run completo incluyendo carga), antes de lanzar el render definitivo.
- Automatización de pipelines de contenido gráfico en macOS: al ser código MLX puro y CLI reproducible, se puede integrar en scripts de generación por lotes con semillas y ajustes fijos, embebiendo metadatos en cada PNG para trazabilidad.
- Investigación y experimentación con cuantización: el repositorio ofrece checkpoints 4 y 6 bits con métricas de error de velocidad publicadas, útil para estudiar el compromiso entre precisión y memoria en modelos de difusión de gran tamaño.
- Desarrollo y depuración de implementaciones MLX: el código modular (`t5.py`, `transformer.py`, `quantize.py`, `vae.py`, `sampling.py`, `pipeline.py`) sirve como referencia para portar otros modelos de difusión a MLX.
- Generación de imágenes con requisitos de privacidad: al ejecutarse enteramente en local, ningún prompt ni imagen sale del equipo, adecuado para contenido sensible o entornos sin conectividad.
- Evaluación comparativa de backends: permite medir MLX frente a PyTorch/MPS en el mismo hardware con las cifras publicadas (3,0× por paso a 512×512, 41–44 % menos memoria), útil para decidir el stack de inferencia en Mac.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad y memoria frente a diffusers `ChromaPipeline` en un Mac mini M4 de 16 GB, con el prompt oficial del tigre, 3 pasos, CFG 3.8 y semilla 0:

| Métrica | 512×512 PyTorch → MLX q4 | Ganancia | 768×1024 PyTorch → MLX q4 | Ganancia |
|---|---|---|---|---|
| Tiempo por paso de denoising | 29,3 → 9,65 s | 3,0× | 50,3 → 29,3 s | 1,7× |
| Run completo de 3 pasos (con carga) | 136,3 → 38,0 s | 3,6× | 198,3 → 98,5 s | 2,0× |
| Run de 26 pasos (proyectado) | 13,5 → 4,3 min | 3,1× | 22,6 → 12,9 min | 1,8× |
| Encoding de texto + tokenizer + carga T5 | 22 → ~5 s | ~4,4× | 18 → ~5 s | ~3,6× |
| Carga del transformer (PyTorch incluye VAE) | 20 → 2,7 s | 7,4× | 21 → 2,7 s | 7,8× |
| Decode VAE | 1–2 → 0,9 s | — | 3–4 → 2,5 s | — |
| Memoria pico | 12,0 → 7,0 GiB | −41 % | 13,7 → 7,7 GiB | −44 % |
| Swapping durante el run | 2,3 GiB → 0 | — | 3,0 GiB → 0 | — |

Con el transformer q6, el tiempo por paso es similar (9,67 y 29,3 s) y la memoria pico es de 9,0 y 9,7 GiB (−25 % y −29 %). Los runs MLX de 26 pasos medidos dan 248–254 s (4,1–4,2 min) para q4 a 512×512. En precisión, el q6 presenta un error medio de velocidad del 4,13 % frente a float32, mejor que el GGUF Q6_K (4,77 %); el q4 llega al 12,76 %. No se han publicado resultados de benchmarks estándar (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- Hardware mínimo: Apple Silicon con 16 GB de memoria unificada (probado en Mac mini M4 de 16 GB).
- Espacio en disco: 19,3 GB para la descarga completa del repositorio.
- VRAM/memoria unificada estimada: 7,0–7,7 GiB de pico con transformer q4; 9,0–9,7 GiB con q6.
- GPU: exclusivamente Apple Silicon (M1/M2/M3/M4); no soporta CUDA ni ROCm en este port.
- No cabe en GPUs consumer NVIDIA por la dependencia de MLX; para esas plataformas habría que usar el modelo base con diffusers o los GGUF de silveroxides.
- Despliegue: CLI incluida (`generate_mlx.py`), instalación editable con pip o uv, Python 3.12 o superior, descarga vía `hf download`.
- Throughput medido: 9,65 s por paso a 512×512 y 29,3 s por paso a 768×1024 con q4; 4,5 min para un borrador de 512×512 y ~18 min para 1024×1024 a 26 pasos.
- Recomendación del autor: ejecutar una generación a la vez en Mac de 16 GB; la pipeline mantiene un solo modelo grande en memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Backend | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chroma1-HD MLX (este port) | 8,9 B (q4/q6) | hasta 1024×1024 | MLX (Apple Silicon) | Apache 2.0 | HuggingFace, 0 descargas |
| lodestones/Chroma1-HD (base) | 8,9 B | hasta 1024×1024 | PyTorch/diffusers | Apache 2.0 | HuggingFace |
| silveroxides/Chroma1-HD-GGUF | 8,9 B (Q6_K, 7,65 GB) | hasta 1024×1024 | llama.cpp/GGUF | Apache 2.0 | HuggingFace |
| FLUX.1-schnell (origen arquitectónico) | ~12 B | hasta 1024×1024 | PyTorch/diffusers | Apache 2.0 | HuggingFace |

La comparativa se limita al ecosistema Chroma/FLUX porque no se dispone de datos de benchmarks estándar frente a otros modelos de imagen en la información proporcionada.

## Limitaciones y advertencias

- Es un port no oficial: el autor no está afiliado a lodestones ni a Black Forest Labs; posibles bugs de implementación no presentes en el original.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA, ROCm ni CPU convencional.
- Requiere 16 GB de memoria unificada como mínimo; en equipos de 8 GB no es viable.
- Tiempos de generación altos en comparación con GPUs dedicadas: ~18 minutos para 1024×1024 en Mac mini M4.
- La cuantización q4 introduce un error de velocidad del 12,76 % frente a float32; para máxima fidelidad conviene q6 o el modelo base en bf16.
- No se han publicado evaluaciones de sesgos, alucinación visual ni calidad perceptual (FID, CLIP) en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Chroma1-HD; conviene verificar la model card original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria amplia.
- El modelo es exclusivamente text-to-image; no soporta edición, inpainting, controlnet ni otras tareas sin trabajo adicional.
- El pipeline mantiene un modelo grande en memoria a la vez, lo que limita la concurrencia a una generación simultánea en 16 GB.

## Enlaces

- HuggingFace del port: https://huggingface.co/tillknuesting/chroma1-hd-mlx
- Modelo base: https://huggingface.co/lodestones/Chroma1-HD
- GGUF de referencia usado en la comparativa: https://huggingface.co/silveroxides/Chroma1-HD-GGUF
- Paper citado en tags (arXiv:2407.12173): https://arxiv.org/abs/2407.12173
- diffusers (librería de referencia para la comparativa): https://github.com/huggingface/diffusers
- MLX (framework de Apple): https://github.com/ml-explore/mlx
