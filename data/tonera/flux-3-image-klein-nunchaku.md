# tonera/flux-3-image-klein-nunchaku

## Resumen

`tonera/flux-3-image-klein-nunchaku` es una versión cuantizada a 4 bits del transformador de imagen de FLUX 3 Image Klein, el modelo de generación y edición de imágenes de Black Forest Labs. La cuantización la firma el usuario tonera mediante SVDQuant, una técnica que combina pesos y activaciones de 4 bits con una rama de bajo rango de rango 32 para absorber los valores atípicos que la cuantización naive destruye. El resultado se ejecuta con el runtime Nunchaku y se integra en el pipeline original de diffusers sin cambiar el VAE, el tokenizador ni los ajustes de muestreo.

El modelo resuelve un problema muy concreto: FLUX 3 Image Klein en BF16 ocupa 18,76 GiB solo en pesos y alcanza 21,25 GiB de pico durante la generación a 1024×1024 con 16 pasos, lo que lo deja fuera de casi cualquier GPU de consumo. Con esta versión, los pesos bajan a 7,82 GiB y el pico de generación a 10,34 GiB, con una aceleración de estado estacionario de 3,12× en una RTX 5090. El transformador cuantizado tiene 5.548.681.984 parámetros y el repositorio pesa 29,2 GB, incluyendo VAE, text encoder y configuraciones en BF16.

Es relevante ahora porque demuestra que un modelo de imagen de última generación puede correr en hardware Blackwell de consumo (y en RTX 30/40 con la variante INT4) manteniendo una fidelidad razonable respecto al original: PSNR medio de 20,22 y SSIM medio de 0,798 sobre 40 imágenes comparadas con la misma semilla y prompt. La licencia es "other", heredada del modelo base, y conviene revisarla antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para texto-a-imagen, cuantizado con SVDQuant; pipeline diffusers |
| Parametros totales | 5.548.681.984 (transformador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4, pesos y activaciones) con rama de bajo rango r32; INT4 con rama r32; BF16 para VAE y text encoder |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de black-forest-labs/flux-3-image-klein) |
| Formato de pesos | safetensors (`svdq-fp4_r32-...`, `svdq-int4_r32-...`), más `modular_model_index.json` y subcarpetas `vae/`, `text_encoder/`, `transformer/` en BF16 |

## Arquitectura y entrenamiento

El modelo base es FLUX 3 Image Klein, un transformer de difusión (DiT) de Black Forest Labs para generación y edición de imágenes. Esta ficha no documenta la arquitectura interna del modelo original ni sus datos de entrenamiento: la model card del repositorio cuantizado no los detalla y no se dispone de información adicional al respecto.

La innovación técnica de esta versión es la cuantización SVDQuant: pesos y activaciones a 4 bits acompañados de una rama de bajo rango de rango 32 que captura los valores atípicos, ejecutada por el runtime Nunchaku. Se ofrecen dos variantes: NVFP4 para GPUs Blackwell (RTX 50) e INT4 para RTX 30 y 40. El VAE, el tokenizador, el text encoder y los ajustes de muestreo no se modifican; el transformador cuantizado se intercambia en el pipeline original. El autor recomienda acompañarlo de un text encoder Qwen3-VL-4B-Instruct en INT4 y de un upsampler de prompts (`flux-3-image-klein-pup`) también en INT4.

## Capacidades

- Generación de texto a imagen a 1024×1024 con 16 pasos por defecto.
- Edición de imágenes: el flujo de ComfyUI conecta la imagen de referencia a `ReferenceMultiLatent`.
- Upsampling de prompts: expansión de prompts cortos mediante el upsampler INT4 recomendado, con 1,90 s de tiempo y 7,02 GiB de pico.
- Integración en pipelines diffusers mediante `NunchakuFlux3Transformer2DModel`.
- Integración en ComfyUI mediante el plugin Vitoom Nunchaku (requiere ComfyUI 0.44 o superior con `--enable-manager`).
- Soporte de dos precisiones según generación de GPU: NVFP4 en Blackwell, INT4 en RTX 30/40.
- Tool calling, agentes, razonamiento multi-paso, visión de entrada y audio: no disponibles (es un modelo de imagen).

## Casos de uso

- Generación de imágenes en GPU de consumo: con 10,34 GiB de pico de generación, cabe en una RTX 5090 y, con la variante INT4, en GPUs de 30 y 40 series con suficiente VRAM, algo inviable con el modelo en BF16 (21,25 GiB de pico).
- Prototipado rápido en ComfyUI: el plugin Vitoom Nunchaku y el workflow `example_workflows/flux3_klein.json` permiten tener un grafo funcional en minutos, con carga hasta listo en 1,63 s frente a 5,32 s en BF16.
- Edición de imágenes con referencia: el nodo `ReferenceMultiLatent` permite condicionar la generación sobre una imagen existente, útil para retoques guiados y variaciones.
- Iteración de prompts asistida: el upsampler INT4 expande un prompt corto en 1,90 s con 7,02 GiB de pico, lo que permite flujos de refinamiento sin reescribir manualmente las descripciones.
- Servicios de generación de imágenes con requisitos de latencia: 1,43 s de generación en estado estacionario a 1024×1024 y 16 pasos en RTX 5090, adecuado para APIs interactivas.
- Despliegue en estaciones de trabajo con una sola GPU: los 7,82 GiB de pesos totales (incluido el VAE) dejan margen para el resto del stack en GPUs de 16-24 GB.
- Evaluación comparativa de cuantizaciones: las métricas PSNR/SSIM/LPIPS publicadas sobre 40 imágenes permiten medir la degradación frente a BF16 antes de adoptar la variante cuantizada en producción.

## Benchmarks y rendimiento

Rendimiento medido en RTX 5090 con ajustes por defecto (1024×1024, 16 pasos), semilla 1 y el mismo caption ya upsampled. BF16 es el transformador y text encoder originales; Nunchaku es el transformador FP4 de este repositorio más el text encoder INT4.

| Métrica | BF16 | Nunchaku | Mejora |
|---|---:|---:|---:|
| Carga hasta listo | 5,32 s | 1,63 s | 3,26× |
| Generación (en frío) | 4,98 s | 1,96 s | 2,55× |
| Generación (estado estacionario) | 4,45 s | 1,43 s | 3,12× |
| De lo cual denoising (estado estacionario) | 4,28 s | 1,26 s | 3,41× |

| Memoria | BF16 | Nunchaku | Ahorro |
|---|---:|---:|---:|
| Transformador | 10,34 GiB | 4,22 GiB | 6,12 GiB (59,2%) |
| Text encoder | 8,27 GiB | 3,45 GiB | 4,82 GiB (58,3%) |
| Pesos totales (incl. VAE 0,16 GiB) | 18,76 GiB | 7,82 GiB | 10,94 GiB (58,3%) |
| Pico de generación | 21,25 GiB | 10,34 GiB | 10,91 GiB (51,3%) |

Calidad frente a BF16, sobre 40 imágenes con el mismo prompt y semilla:

| Métrica | Media | p50 | p90 | Mejor | Peor |
|---|---:|---:|---:|---:|---:|
| PSNR ↑ | 20,22 | 20,35 | 23,56 | 26,75 | 13,58 |
| SSIM ↑ | 0,798 | 0,810 | 0,883 | 0,939 | 0,608 |
| LPIPS ↓ | 0,167 | 0,140 | 0,288 | 0,046 | 0,348 |

Con upsampling de prompts (upsampler INT4, resto igual): pesos del upsampler 6,68 GiB (`lm_head` 0,50 GiB), pico de upsampling 7,02 GiB, tiempo de upsampling 1,90 s, carga y traslado a CUDA del upsampler 2,85 s, generación en frío 1,55 s y en estado estacionario 1,44 s, pico total de la ejecución 10,34 GiB. Mantener upsampler y pipeline simultáneamente en GPU requiere unos 17,4 GiB (estimación del autor sumando ambos picos).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; las métricas anteriores son de fidelidad y rendimiento, no de calidad semántica frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: 10,34 GiB de pico de generación con FP4 en RTX 5090; unos 17,4 GiB si se mantienen upsampler y pipeline simultáneamente en GPU.
- Pesos totales en disco/VRAM: 7,82 GiB (transformador 4,22 GiB + text encoder 3,45 GiB + VAE 0,16 GiB).
- GPU recomendadas: RTX 5090 (Blackwell) para la variante NVFP4; RTX 30 y 40 series para la variante INT4.
- Cabe en GPU de consumo: sí, en RTX 5090 con la variante FP4; en 30/40 series con la variante INT4, sujeto a disponer de al menos ~11 GiB libres para el pico de generación.
- Opciones de despliegue: diffusers con `NunchakuFlux3Transformer2DModel` y wheels precompilados de Nunchaku; ComfyUI 0.44 o superior con `--enable-manager` y el plugin Vitoom Nunchaku.
- Latencia y throughput: 1,43 s de generación en estado estacionario y 1,26 s de denoising a 1024×1024 y 16 pasos en RTX 5090; 1,63 s de carga hasta listo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flux-3-image-klein-nunchaku (este) | 5.548.681.984 (transformador) | no disponible | NVFP4 / INT4 r32 | other | HuggingFace, diffusers, ComfyUI |
| black-forest-labs/flux-3-image-klein (BF16) | no disponible | no disponible | BF16 | other | HuggingFace |
| tonera/Qwen3-VL-4B-Instruct-Nunchaku (text encoder recomendado) | no disponible | no disponible | INT4 | no disponible | HuggingFace |
| tonera/flux-3-image-klein-pup-nunchaku (upsampler recomendado) | no disponible | no disponible | INT4 | no disponible | HuggingFace |

La comparación relevante es contra el modelo base en BF16: misma arquitectura y mismos ajustes de muestreo, con 58,3% menos peso en disco, 51,3% menos pico de memoria y 3,12× más velocidad en estado estacionario, a cambio de un PSNR medio de 20,22 y SSIM de 0,798 frente al original. No se dispone de datos para comparar con otros modelos de texto-a-imagen de la misma categoría.

## Limitaciones y advertencias

- Degradación de calidad medible: PSNR medio de 20,22 y caso peor de 13,58; SSIM mínimo de 0,608 y LPIPS máximo de 0,348. En algunas imágenes la diferencia con BF16 es perceptible.
- Licencia "other" heredada del modelo base: es imprescindible revisar los términos de black-forest-labs/flux-3-image-klein antes de cualquier uso comercial; la model card no los detalla.
- Dependencia de hardware específico: la variante FP4 requiere GPUs Blackwell (RTX 50); la INT4 está pensada para RTX 30 y 40. No se documenta soporte para otras arquitecturas.
- Dependencia de software: requiere el runtime Nunchaku con wheels precompilados y, en ComfyUI, la versión 0.44 o superior con `--enable-manager` y el plugin Vitoom Nunchaku.
- El upsampling de prompts añade 6,68 GiB de pesos y 7,02 GiB de pico; mantenerlo junto al pipeline en GPU eleva el requisito a unos 17,4 GiB.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de imagen, los riesgos se refieren a fidelidad prompt-imagen y sesgos del dataset de entrenamiento del modelo base, no descritos aquí.
- Idiomas soportados: no disponibles; la model card está en inglés y chino, pero no se especifica cobertura lingüística del modelo.
- Longitud de contexto: no disponible.
- Las cifras de rendimiento proceden de una única configuración (RTX 5090, 1024×1024, 16 pasos, semilla 1) y no deben extrapolarse sin medir en el hardware objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tonera/flux-3-image-klein-nunchaku
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Text encoder recomendado (INT4): https://huggingface.co/tonera/Qwen3-VL-4B-Instruct-Nunchaku
- Upsampler de prompts (INT4): https://huggingface.co/tonera/flux-3-image-klein-pup-nunchaku
- Plugin de ComfyUI (Vitoom Nunchaku): https://github.com/tonera/vitoom-nunchaku-comfy
- README en chino: README_CN.md (en el propio repositorio)
