# tutuchen2000/Qwen-Image-Edit-Rapid-AIO-NSFW-v23-NVFP4-GGUF

## Resumen

Qwen-Image-Edit-Rapid-AIO-NSFW-v23-NVFP4-GGUF es una cuantización NVFP4 (4-bit NVIDIA FP4) del checkpoint original de Phr00t, un modelo de edición de imágenes y generación de texto a imagen basado en la arquitectura MMDiT (Mixture of Diffusion Transformers) con un codificador de texto Qwen2.5-VL-7B. El modelo original, desarrollado por Phr00t, es un merge de aceleradores Lightning LoRA, VAE y CLIP que permite inferencia rápida en 4 pasos con CFG=1, manteniendo una adherencia fuerte al prompt. Esta versión concreta, publicada por tutuchen2000, convierte los componentes del checkpoint original (diffusion backbone de ~20.4B parámetros y text encoder de 7B) a formato GGUF cuantizado en NVFP4, reduciendo el peso total a 23.6 GB y permitiendo su ejecución en GPUs NVIDIA Blackwell con unos 10 GB de VRAM.

La relevancia de este modelo reside en que acerca la edición de imágenes de alta calidad (con soporte NSFW en esta versión) a equipos con GPUs de gama media-consumer, aprovechando la cuantización de 4 bits de NVIDIA y el ecosistema ComfyUI-GGUF. No obstante, su licencia es de investigación propietaria, lo que limita su uso comercial, y requiere hardware específico (RTX 50-series) para desplegar la cuantización NVFP4.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT (diffusion transformer) con text encoder Qwen2.5-VL-7B y VAE |
| Parametros totales | 20.430.401.088 (safetensors original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (aplica al text encoder, sin especificar) |
| Tipos de cuantizacion | NVFP4 (4-bit NVIDIA FP4) — único formato provisto; otros posibles (Q4_K_M, Q5_K_M, Q6_K, Q8_0) no incluidos |
| Idiomas soportados | no disponible (Qwen2.5-VL es multilingue, pero no se indica en la card) |
| Licencia | proprietary-research (investigación propietaria) |
| Formato de pesos | GGUF (NVFP4) para diffusion y text encoder; VAE en safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en un backbone de difusión MMDiT (Mixture of Diffusion Transformers) de aproximadamente 20.400 millones de parámetros, acompañado de un codificador de texto Qwen2.5-VL-7B y un VAE en BF16. El checkpoint original, creado por Phr00t, es un merge de aceleradores Lightning LoRA, VAE y CLIP, diseñado para edición de imágenes con fuerte adherencia al prompt y generación de texto a imagen. La versión NVFP4 aquí presentada no introduce nuevas técnicas de entrenamiento; es una conversión de cuantización: el checkpoint original en FP8 se dividió en tres componentes, cada uno convertido a FP16 mediante conversión por bloques para evitar OOM, y luego cuantizado a NVFP4 usando `llama-quantize.exe` (commit `dd7cad7`). El text encoder se parcheó para usar la arquitectura `qwen2` en GGUF. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de entrenamiento del modelo base.

## Capacidades

- Edición de imágenes (image-to-image) con adherencia fuerte al prompt, afinada en la versión v23.
- Generación de texto a imagen (text-to-image).
- Inferencia rápida: 4 pasos (estilo Lightning LoRA) con CFG=1, reduciendo el tiempo de generación.
- Soporte de contenido NSFW en esta versión específica.
- Integración con ComfyUI mediante ComfyUI-GGUF para carga directa de los componentes cuantizados.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni agentes.

## Casos de uso

- **Edición de imágenes en producción**: el modelo permite modificar imágenes existentes con instrucciones textuales precisas, adecuado para flujos de trabajo de fotografía o diseño gráfico que requieran iteraciones rápidas.
- **Generación de imágenes para contenido digital**: con 4 pasos de inferencia y CFG=1, es viable para generar imágenes en tiempo real o semireal en aplicaciones de creación de contenido.
- **Integración en pipelines de automatización**: al ejecutarse en ComfyUI, puede integrarse en flujos de trabajo con nodos personalizados para generar y editar imágenes de forma programática.
- **Prototipado rápido de conceptos visuales**: diseñadores y artistas pueden generar variantes de una imagen con prompts editados sin esperas largas.
- **Creación de contenido para marketing**: la generación de imágenes con estilos específicos y la edición de productos para campañas publicitarias se benefician de la adherencia al prompt.
- **Investigación en generación de imágenes**: el modelo sirve como referencia para estudiar el efecto de la cuantización NVFP4 en la calidad de salida de modelos de difusión de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como FID, CLIP score ni comparaciones con otros modelos. El único dato de rendimiento es el tamaño de VRAM estimado (~10 GB) y la velocidad de inferencia (4 pasos, CFG=1) mencionada en el modelo original, pero sin valores numéricos concretos.

## Requisitos de hardware

- **GPU**: obligatoria NVIDIA Blackwell (RTX 50-series) con CUDA 13.0+ para soporte de NVFP4. No funciona en arquitecturas anteriores.
- **VRAM**: aproximadamente 10 GB para el modelo de difusión + text encoder + VAE (según la card del autor).
- **RAM**: 32 GB de sistema recomendados.
- **Despliegue**: ComfyUI con el plugin ComfyUI-GGUF; el text encoder también se usa con llama.cpp (commit `dd7cad5`).
- **Latencia**: no especificada; la inferencia de 4 pasos sugiere tiempos bajos, pero sin datos numéricos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-Image-Edit-Rapid-AIO-NSFW-v23 (original) | 20.4B | no disponible | FP8 safetensors | proprietary-research | Versión original de Phr00t, sin cuantizar |
| Qwen-Image-Edit-Rapid-AIO (versión anterior) | ~20B | no disponible | FP8 | proprietary-research | Merge de aceleradores, sin cuantización GGUF |
| Qwen-Image-Edit-Rapid-AIO-GGUF (Phil2Sat) | ~20B | no disponible | GGUF (varios) | proprietary-research | Otra conversión GGUF de la misma serie, con más cuantizaciones (Q4_K_M, etc.) |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Contenido NSFW**: este modelo está etiquetado como NSFW y no es apto para todos los públicos; su uso debe restringirse a contextos legales y éticos.
- **Cuantización lossy**: la cuantización NVFP4 es de 4 bits y puede degradar la calidad de las imágenes en comparación con el checkpoint FP8 original, aunque el autor menciona que la pérdida es menor.
- **Hardware restringido**: requiere exclusivamente GPUs NVIDIA Blackwell (RTX 50-series) con CUDA 13.0+; no es compatible con GPUs anteriores (Ampere, Ada, etc.).
- **Licencia de investigación**: la licencia `proprietary-research` limita el uso a fines de investigación; no se permite uso comercial sin autorización.
- **Sin datos de idiomas**: no se especifica qué idiomas soporta el text encoder, aunque Qwen2.5-VL es multilingüe.
- **Sin benchmarks publicados**: no hay métricas de rendimiento verificables en la información disponible.
- **Dependencia de ComfyUI-GGUF**: la integración depende de la compatibilidad de ComfyUI-GGUF con NVFP4, que aún es experimental.

## Enlaces

- [Modelo en Hugging Face (tutuchen2000)](https://huggingface.co/tutuchen2000/Qwen-Image-Edit-Rapid-AIO-NSFW-v23-NVFP4-GGUF)
- [Modelo original (Phr00t)](https://huggingface.co/Phr00t/Qwen-Image-Edit-Rapid-AIO-NSFW-v23)
- [Repositorio de Phr00t (versión AIO)](https://huggingface.co/Phr00t/Qwen-Image-Edit-Rapid-AIO)
- [ComfyUI-GGUF (GitHub)](https://github.com/city96/ComfyUI-GGUF)
- [llama.cpp (GitHub)](https://github.com/ggml-org/llama.cpp)
- [GitHub de la variante v23](https://github.com/LucyFairies/qwen-image-edit-rapid-aio-v23)
