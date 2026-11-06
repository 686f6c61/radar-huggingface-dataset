# tonera/FLUX.2-klein-4B-Nunchaku

## Resumen

FLUX.2-klein-4B-Nunchaku es una versión cuantizada del modelo de difusión FLUX.2-klein-4B de Black Forest Labs, publicada por el usuario tonera. Se trata de un modelo de generación y edición de imágenes (image-to-image y text-to-image) que aplica la técnica SVDQuant de Nunchaku para comprimir el transformer de difusión a precisiones FP4 o INT4 manteniendo los pesos en un formato que permite inferencia acelerada en GPU. El repositorio contiene únicamente el transformer cuantizado; el pipeline completo requiere además un text encoder (Qwen3-4B, también cuantizado en un repo aparte) y el VAE `flux2-vae.safetensors`.

El modelo base, FLUX.2-klein-4B, es una variante destilada de la familia FLUX.2 con aproximadamente 3.875 millones de parámetros en el transformer (3.875.544.576 según los safetensors). La destilación permite generar imágenes con muy pocos pasos de inferencia (4 pasos recomendados) y `guidance_scale` de 1.0, lo que reduce drásticamente el coste computacional frente a modelos de difusión no destilados.

La relevancia de esta ficha radica en que el soporte oficial de FLUX.2 Klein en Nunchaku aún no se ha fusionado en el repositorio upstream (PR #926 pendiente), por lo que tonera distribuye un fork comunitario (`vitoom-nunchaku`) con wheels precompilados y un plugin para ComfyUI. Esto permite ejecutar un modelo de edición de imágenes de última generación en GPUs de consumo con cuantización de 4 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) FLUX.2, destilado, cuantizado con SVDQuant |
| Parámetros totales | 3.875.544.576 (transformer) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP4 (RTX 50), INT4 (RTX 30/40), con rango de rango 32 (`r32`) |
| Idiomas soportados | no disponible (prompts recomendados en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`svdq-fp4_r32-...` / `svdq-int4_r32-...`) |
| Pipeline | image-to-image (y text-to-image omitiendo la imagen de referencia) |
| Modelo base | black-forest-labs/FLUX.2-klein-4B |
| Tamaño del repo | 21.0 GB |
| Descargas | 917 |
| Likes | 6 |
| Creado | 2026-06-19 |
| Actualizado | 2026-11-06 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de difusión (DiT) perteneciente a la familia FLUX.2 de Black Forest Labs, en su variante "klein" de 4B, que es una versión destilada. La destilación reduce el número de pasos de inferencia necesarios: la model card recomienda 4 pasos con `guidance_scale=1.0`, valores típicos de modelos destilados de esta familia. El transformer original tiene 3.875.544.576 parámetros.

Sobre esta base, tonera aplica SVDQuant, una técnica de cuantización post-entrenamiento que descompone los pesos en una parte de bajo rango y un residuo de baja precisión (FP4 o INT4), con un rango de descomposición de 32 (`r32`). El resultado se empaqueta en archivos safetensors que el runtime Nunchaku carga como `NunchakuFlux2Transformer2DModel`. No se dispone de información sobre el dataset de entrenamiento original (número de tokens, composición, uso de RLHF/DPO) en la información proporcionada; esos detalles corresponden a la model card del modelo base de Black Forest Labs, no incluida aquí.

La innovación destacable es la propia cuantización SVDQuant combinada con el fork comunitario `vitoom-nunchaku`, que añade soporte para FLUX.2 Klein (inferencia FP4/INT4) cuando el repositorio upstream de Nunchaku todavía no lo ha integrado. El pipeline se ejecuta con `Flux2KleinPipeline` de Diffusers (instalado desde el código fuente de GitHub).

## Capacidades

- Generación de imágenes a partir de texto (text-to-image): se omite la imagen de referencia en el pipeline.
- Edición de imágenes image-to-image: se pasa una imagen de referencia y un prompt describiendo la edición; la referencia se conecta mediante `ReferenceLatent`.
- Edición multi-referencia: soportada a través de la plataforma vitoom (Web UI con gestión de múltiples referencias).
- Inferencia acelerada con cuantización FP4/INT4 mediante SVDQuant y el runtime Nunchaku.
- Integración con ComfyUI mediante el plugin Vitoom Nunchaku (requiere ComfyUI 0.44 o superior con `--enable-manager`).
- Gestión de LoRA: la plataforma vitoom incluye administración de LoRA.
- Generación con pocos pasos (4 pasos recomendados) gracias a la destilación del modelo base.
- Soporte de prompts en inglés (la model card indica "Describe your edit in English…").
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo "thinking"; es un modelo exclusivamente de imagen.

## Casos de uso

- Edición fotográfica asistida: dado un retrato o una foto de producto, el modelo aplica cambios descritos en el prompt (cambio de fondo, iluminación, estilo) en 4 pasos de inferencia, lo que permite iterar rápidamente en un flujo de retoque.
- Prototipado de conceptos visuales: un diseñador genera variaciones de una imagen de referencia con distintos prompts para explorar direcciones creativas antes de producir assets finales.
- Generación de imágenes en estaciones de trabajo con GPU de consumo: la cuantización INT4 permite ejecutar el transformer en GPUs RTX 30/40 y FP4 en RTX 50, acercando la edición de imágenes de alta calidad a equipos no servidor.
- Integración en pipelines de ComfyUI: estudios pequeños pueden montar un grafo con el plugin Vitoom Nunchaku, el text encoder Qwen3-4B cuantizado y el VAE para automatizar la generación por lotes de imágenes de catálogo.
- Edición multi-referencia en producción de contenido: la plataforma vitoom permite combinar varias imágenes de referencia y gestionar LoRA, útil para mantener coherencia de estilo entre piezas de una campaña.
- Sustitución de referencias en flujos de diseño de producto: conectar una imagen base de un objeto y editar color, material o entorno mediante prompts, aprovechando el modo image-to-image y la referencia por `ReferenceLatent`.
- Experimentación en investigación sobre cuantización: el repo sirve como caso práctico para evaluar SVDQuant (FP4/INT4) sobre un DiT destilado, comparando calidad frente al modelo completo de Black Forest Labs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la model card. El transformer cuantizado a 4 bits (FP4/INT4) con rango 32 reduce el peso de los pesos respecto al modelo completo, pero el pipeline completo incluye además el text encoder Qwen3-4B cuantizado y el VAE, por lo que la VRAM total depende de la configuración.
- GPU recomendadas: RTX 50 series para los pesos FP4 (`svdq-fp4_r32-...`); RTX 30 y 40 series para los pesos INT4 (`svdq-int4_r32-...`). No se especifican modelos de datacenter (A100, H100) en la información disponible.
- ¿Cabe en GPU de consumo? Sí: la propia model card segmenta los pesos por generación de GPU de consumo (RTX 30/40/50), lo que indica que está pensado para ese entorno.
- Opciones de despliegue:
  - Diffusers con `Flux2KleinPipeline` (instalado desde el repositorio de GitHub, no desde PyPI).
  - Runtime `vitoom-nunchaku` con wheels precompilados (PyTorch 2.11, CUDA 12.8 o 13.0; también hay builds para cp310 y ARM64 aarch64).
  - ComfyUI 0.44 o superior con `--enable-manager` y el plugin Vitoom Nunchaku.
  - Plataforma vitoom (Docker + Docker Compose, imágenes de inferencia `cu130`).
- Requisitos de software: PyTorch 2.11 (cu128 o cu130), driver NVIDIA compatible con CUDA 13.0 para las imágenes de vitoom. Se recomienda `pipe.enable_model_cpu_offload()` si la VRAM es ajustada.
- Latencia y throughput: no disponibles. La model card solo indica 4 pasos de inferencia y `guidance_scale=1.0`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tonera/FLUX.2-klein-4B-Nunchaku | 3.875.544.576 (transformer) | no disponible | FP4 / INT4 (SVDQuant r32) | Apache 2.0 | HuggingFace, ComfyUI, vitoom |
| black-forest-labs/FLUX.2-klein-4B | ~4B (transformer) | no disponible | pesos completos (bf16) | no disponible en esta información | HuggingFace (modelo base) |
| Nunchaku upstream (FLUX.2 Klein) | no disponible | no disponible | FP4 / INT4 | no disponible | PR #926 pendiente, sin fusión |
| tonera/Qwen3-4B-text-Nunchaku | ~4B (text encoder) | no disponible | INT4 (SVDQuant) | no disponible | HuggingFace (componente del pipeline) |

La comparativa se limita a las variantes directamente relacionadas con este repositorio, ya que la información proporcionada no incluye datos de rendimiento de alternativas de otros proveedores. No se dispone de cifras de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- El repositorio contiene solo el transformer cuantizado; no es un pipeline autónomo. Requiere el text encoder Qwen3-4B cuantizado (`tonera/Qwen3-4B-text-Nunchaku`) y el VAE `flux2-vae.safetensors`, que deben descargarse por separado.
- El soporte de FLUX.2 Klein en Nunchaku upstream no está fusionado (PR #926 pendiente desde hace tiempo); la model card advierte explícitamente de no copiar archivos de parche manualmente y de usar los wheels de `vitoom-nunchaku`.
- Dependencia de versiones concretas: PyTorch 2.11 (cu128 o cu130), CUDA 13.0 para las imágenes de vitoom, ComfyUI 0.44 o superior con `--enable-manager`. Un desajuste de versiones puede impedir la carga de los pesos.
- La cuantización a 4 bits puede introducir degradación de calidad frente al modelo de precisión completa; no se han publicado métricas de fidelidad en la información disponible.
- Los prompts se recomiendan en inglés; no se documenta soporte multilingüe.
- No se dispone de información sobre sesgos del modelo base ni sobre tasas de alucinación visual (por ejemplo, generación de texto ilegible en imágenes).
- La licencia Apache 2.0 del repositorio cuantizado no garantiza por sí sola los términos del modelo base de Black Forest Labs; conviene verificar la licencia del modelo original antes de uso comercial.
- Los archivos se distribuyen como safetensors; no se mencionan versiones GGUF ni otros formatos.
- El número de descargas (917) y likes (6) es bajo, lo que sugiere una comunidad pequeña y menos validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tonera/FLUX.2-klein-4B-Nunchaku
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Text encoder cuantizado: https://huggingface.co/tonera/Qwen3-4B-text-Nunchaku
- Runtime vitoom-nunchaku (wheels): https://huggingface.co/tonera/vitoom-nunchaku
- Repositorio vitoom: https://github.com/tonera/vitoom
- Instrucciones Docker de vitoom: https://github.com/tonera/vitoom/blob/main/docker-usage-en.md
- Plugin ComfyUI Vitoom Nunchaku: https://github.com/tonera/vitoom-nunchaku-comfy
- Nunchaku upstream: https://github.com/nunchaku-ai/nunchaku
- PR de soporte FLUX.2 Klein en Nunchaku: https://github.com/nunchaku-ai/nunchaku/pull/926
- Diffusers (instalación desde fuente): https://github.com/huggingface/diffusers.git
