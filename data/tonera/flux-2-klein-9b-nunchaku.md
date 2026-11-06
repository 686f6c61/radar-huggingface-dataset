# tonera/FLUX.2-klein-9B-Nunchaku

## Resumen

FLUX.2-klein-9B-Nunchaku es una versión cuantizada del modelo de difusión FLUX.2 [klein] 9B desarrollado por Black Forest Labs, publicada por el usuario tonera bajo el ecosistema Nunchaku/SVDQuant. El modelo original es un transformer de flujo (flow matching) destilado de 9.078.581.248 parámetros que soporta generación texto-a-imagen y edición multi-referencia; esta variante aplica cuantización de pesos en 4 bits (FP4 o INT4 según la GPU) para reducir drásticamente el consumo de VRAM y acelerar la inferencia.

La relevancia de esta ficha radica en que el modelo base sin cuantizar no cabe en GPUs de consumo: según los benchmarks del autor, el modelo completo produce OOM (out of memory) en una RTX 5090 de 32 GB en modo CUDA directo para edición de imagen 1024x1024. Con la cuantización del transformer y del text encoder (Qwen3) más el offload a CPU, el pico de VRAM baja a 7,52 GB manteniendo una velocidad de 1,88 it/s, lo que hace viable su ejecución en hardware de gama alta de consumo.

El repositorio se distribuye con formato safetensors, integración con Diffusers mediante `Flux2KleinPipeline` y soporte para ComfyUI a través del plugin Vitoom Nunchaku. La licencia es "other", heredada del modelo base de Black Forest Labs, por lo que las condiciones de uso comercial deben consultarse en la model card oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con flow matching (FLUX.2, destilado) |
| Parametros totales | 9.078.581.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | SVDQuant en 4 bits: FP4 (RTX 50 series) e INT4 (RTX 30/40 series); text encoder Qwen3 también cuantizado a INT4 |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de black-forest-labs/FLUX.2-klein-9B) |
| Formato de pesos | safetensors (`svdq-fp4_r32-...` / `svdq-int4_r32-...`); bundle Diffusers con VAE y text encoder en el mismo repo |

## Arquitectura y entrenamiento

El modelo base FLUX.2 [klein] 9B es un transformer de difusión basado en flow matching, destilado por Black Forest Labs para reducir el número de pasos de inferencia necesarios (los benchmarks del autor emplean 8 pasos con guidance scale de 1.0). Esta variante no reentrena el modelo: aplica la técnica SVDQuant de Nunchaku, que descompone los pesos en una parte de bajo rango más una parte cuantizada a 4 bits, preservando la calidad con una pérdida mínima. El transformer cuantizado se distribuye como archivo separado (`svdq-<precision>_r32-FLUX.2-klein-9B-Nunchaku.safetensors`), junto con el text encoder Qwen3 cuantizado (`svdq-int4-Qwen3-text-Nunchaku.safetensors`) y el VAE original (`flux2-vae.safetensors`).

La innovación técnica principal es la combinación de cuantización de pesos en 4 bits con kernels optimizados de Nunchaku, que permiten ejecutar el modelo en VRAM muy reducida sin recurrir únicamente al offload a CPU. El autor reporta métricas de fidelidad de la cuantización frente al modelo completo: PSNR medio de 17,56 (p50 17,52, p90 20,62), SSIM medio de 0,735 (p50 0,741, p90 0,837), LPIPS medio de 0,212 (p50 0,194, p90 0,300), error relativo L2 medio de aproximadamente 0,0717 y similitud coseno media de 1,000562. No se dispone de información sobre el dataset de entrenamiento del modelo base en la información proporcionada.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024x1024 con 8 pasos de inferencia y guidance scale 1.0.
- Edición de imagen (image-to-image) con soporte de referencia múltiple, gestionada mediante `ReferenceLatent` en ComfyUI.
- Integración con LoRA: el flujo de ComfyUI incluye un nodo `Vitoom Nunchaku LoRA Loader` para aplicar adaptadores sobre el transformer cuantizado.
- Inferencia con el pipeline `Flux2KleinPipeline` de Diffusers.
- Ejecución con offload a CPU selectivo (`enable-model-cpu-offload`) o secuencial (`enable-sequential-cpu-offload`) para ajustar el consumo de VRAM.
- Compatibilidad con ComfyUI 0.44 o superior mediante el plugin Vitoom Nunchaku.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo en la información disponible.

## Casos de uso

- Edición de imagen en local con GPU de consumo: con el transformer cuantizado y el text encoder cuantizado en modo offload de modelo, el pico de VRAM es de 7,52 GB y el tiempo hasta la imagen de 4 segundos, lo que permite editar imágenes 1024x1024 en tarjetas como la RTX 5090 sin agotar la memoria.
- Generación texto-a-imagen de alta velocidad: en modo CUDA directo con ambos componentes cuantizados, el modelo alcanza 8,91 it/s y produce imágenes en menos de 1 segundo, adecuado para iteración rápida en diseño o prototipado visual.
- Despliegue en ComfyUI para flujos de trabajo creativos: el plugin Vitoom Nunchaku permite encadenar el cargador DiT, el text encoder, el KSampler y el cargador de LoRA, lo que facilita la integración en pipelines de generación visual existentes.
- Edición multi-referencia: el soporte de `ReferenceLatent` permite condicionar la generación con una o varias imágenes de referencia, útil para tareas de restauración, sustitución de elementos o transferencia de estilo controlada.
- Prototipado de investigación en cuantización: las métricas PSNR, SSIM y LPIPS publicadas permiten evaluar el impacto de la cuantización SVDQuant frente al modelo completo antes de adoptar la variante cuantizada en producción.
- Ejecución en entornos con VRAM limitada mediante offload secuencial: con `enable-sequential-cpu-offload` el pico de VRAM en edición baja a 4,35 GB (solo transformer) o 7,69 GB (transformer y text encoder), a costa de un tiempo de 2 segundos por imagen, lo que permite usar GPUs de gama media.
- Integración en pipelines de Diffusers: el uso de `Flux2KleinPipeline` con la instalación desde el repositorio oficial de Diffusers permite incorporar el modelo en scripts Python personalizados para automatizar la generación por lotes.

## Benchmarks y rendimiento

Los datos de rendimiento los proporciona el autor en la model card, medidos en una RTX 5090 de 32 GB con 8 pasos y guidance scale 1.0. `Base` es el modelo sin cuantizar, `TE` el text encoder cuantizado, `TR` el transformer cuantizado, `MCO` el offload de modelo a CPU y `SCO` el offload secuencial a CPU.

Edición de imagen (1024x1024):

| Configuracion | Modo | VRAM pico | Throughput | Tiempo hasta imagen |
|---|---|---:|---:|---:|
| Base | CUDA | OOM | - | - |
| Base | MCO | 20,18 GB | 0,62 it/s | 12 s |
| Base | SCO | 2,55 GB | 0,48 it/s | 16 s |
| Base + TE | CUDA | 25,60 GB | 1,28 it/s | 6 s |
| Base + TE | MCO | 20,16 GB | 0,83 it/s | 9 s |
| Base + TE | SCO | 6,08 GB | 0,48 it/s | 16 s |
| Base + TR | CUDA | 24,51 GB | 3,79 it/s | 2 s |
| Base + TR | MCO | 17,39 GB | 1,08 it/s | 7 s |
| Base + TR | SCO | 4,35 GB | 2,70 it/s | 2 s |
| Base + TR + TE | CUDA | 14,00 GB | 3,81 it/s | 2 s |
| Base + TR + TE | MCO | 7,52 GB | 1,88 it/s | 4 s |
| Base + TR + TE | SCO | 7,69 GB | 2,68 it/s | 2 s |

Generación texto-a-imagen (1024x1024):

| Configuracion | Modo | VRAM pico | Throughput | Tiempo hasta imagen |
|---|---|---:|---:|---:|
| Base | CUDA | OOM | - | - |
| Base | MCO | 18,53 GB | 0,83 it/s | 9 s |
| Base | SCO | 2,55 GB | 0,62 it/s | 12 s |
| Base + TR + TE | CUDA | 15,21 GB | 8,91 it/s | <1 s |
| Base + TR + TE | MCO | 6,42 GB | 2,60 it/s | 3 s |
| Base + TR + TE | SCO | 7,72 GB | 3,00 it/s | 2 s |

Calidad de la cuantización (frente al modelo completo):

| Metrica | Media | p50 | p90 |
|---|---:|---:|---:|
| PSNR | 17,56 | 17,52 | 20,62 |
| SSIM | 0,735 | 0,741 | 0,837 |
| LPIPS | 0,212 | 0,194 | 0,300 |

No se han publicado resultados de benchmarks estándar de generación de imagen (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada en edición 1024x1024: 14,00 GB con transformer y text encoder cuantizados en CUDA directo; 7,52 GB con offload de modelo; 7,69 GB con offload secuencial.
- VRAM estimada en texto-a-imagen 1024x1024: 15,21 GB en CUDA directo; 6,42 GB con offload de modelo; 7,72 GB con offload secuencial.
- GPU recomendadas: RTX 5090 (32 GB) para FP4; RTX 30 y 40 series para INT4. El modelo base sin cuantizar produce OOM en CUDA directo en una RTX 5090.
- Cabe en GPU de consumo: sí, con cuantización y offload; el pico mínimo reportado es de 4,35 GB (solo transformer en modo secuencial) y de 6,42 GB para texto-a-imagen con ambos componentes cuantizados.
- Opciones de despliegue: Diffusers con `Flux2KleinPipeline` (instalación desde el repositorio oficial de Diffusers), ComfyUI 0.44 o superior con el plugin Vitoom Nunchaku, y el motor vitoom-nunchaku.
- Latencia y throughput: hasta 8,91 it/s en texto-a-imagen con CUDA directo (menos de 1 segundo por imagen) y 3,81 it/s en edición; en modo offload de modelo, 2,60 it/s y 1,88 it/s respectivamente.
- El plugin Vitoom Nunchaku requiere iniciar ComfyUI con el flag `--enable-manager` e instala automáticamente un wheel de nunchaku compatible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2-klein-9B-Nunchaku (este) | 9,08 B | no disponible | FP4 / INT4 (SVDQuant) | other | HuggingFace, Diffusers, ComfyUI |
| FLUX.2-klein-9B (base) | 9,08 B | no disponible | no (precisión completa) | other | HuggingFace, Diffusers |
| Qwen3 text encoder Nunchaku | no disponible | no disponible | INT4 | no disponible | HuggingFace |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia "other" hereda las condiciones del modelo base de Black Forest Labs; es imprescindible revisar la model card oficial antes de cualquier uso comercial.
- La cuantización introduce degradación medible: PSNR medio de 17,56, SSIM de 0,735 y LPIPS de 0,212 frente al modelo completo, con una cola de casos peores (p90 de LPIPS de 0,300) que puede afectar a detalles finos.
- El modelo base sin cuantizar no cabe en una RTX 5090 en modo CUDA directo para edición 1024x1024, por lo que la variante cuantizada es prácticamente obligatoria en hardware de consumo.
- El offload secuencial no reduce necesariamente la VRAM pico frente al offload de modelo en todos los escenarios: en edición con ambos componentes cuantizados, el pico sube de 7,52 GB a 7,69 GB.
- El soporte de FLUX.2 Klein en el Nunchaku upstream no está fusionado según la model card; se depende de la build comunitaria vitoom-nunchaku, lo que implica un riesgo de mantenimiento y compatibilidad futura.
- No se documentan sesgos conocidos, idiomas soportados ni riesgos específicos de alucinación visual en la información disponible.
- El repositorio ocupa 46,1 GB, lo que requiere espacio de almacenamiento considerable incluso para la variante cuantizada.
- La integración en ComfyUI exige una versión concreta (0.44 o superior) y el flag `--enable-manager`, lo que puede limitar su uso en instalaciones existentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tonera/FLUX.2-klein-9B-Nunchaku
- Modelo base oficial: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Text encoder cuantizado: https://huggingface.co/tonera/Qwen3-text-Nunchaku
- Motor vitoom-nunchaku: https://huggingface.co/tonera/vitoom-nunchaku
- Plugin ComfyUI Vitoom Nunchaku: https://github.com/tonera/vitoom-nunchaku-comfy
- Nunchaku upstream: https://github.com/nunchaku-ai/nunchaku
- Diffusers (instalación desde fuente): https://github.com/huggingface/diffusers
