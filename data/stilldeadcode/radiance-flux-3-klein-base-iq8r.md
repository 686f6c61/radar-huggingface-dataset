# StillDeadcode/radiance-flux-3-klein-base-iq8r

## Resumen

Radiance FLUX.3 [klein] Base IQ8R es un contenedor de inferencia cuantizado en formato `.rad` del modelo de difusion `black-forest-labs/flux-3-image-klein-base` de Black Forest Labs, adaptado por el desarrollador independiente StillDeadcode para el motor `radiance` sobre GPUs AMD con arquitectura RDNA4 y ROCm. No es una release oficial de Black Forest Labs ni cuenta con su respaldo. Resuelve el problema de ejecutar un modelo de generacion y edicion de imagenes de gran tamano en hardware AMD consumer y profesional, donde las herramientas habituales (diffusers, ComfyUI) tienen soporte limitado o ineficiente.

Tecnicamente, el contenedor empaqueta en un unico fichero de 9,34 GiB los pesos del text encoder (Qwen3-VL-4B-Instruct) y del diffusion transformer, cuantizados a int8 con escala u8 por fila y una segunda escala bf16 cada 256 elementos de K, aplicando una rotacion de Hadamard no normalizada (FWHT de 128) antes del redondeo. Las activaciones tambien se cuantizan a int8 bajo la misma rotacion (esquema W8A8). El VAE, las normas y las lineales pequenas permanecen en bf16.

Su relevancia actual radica en que es una de las primeras implementaciones publicas de cuantizacion int8 rotada para FLUX.3 [klein] orientada a ROCm, con una calidad reportada de 38,7 dB PSNR frente al contenedor bf16, muy superior a los 28,0 dB del contenedor FP8 equivalente. El modelo base soporta text-to-image, edicion de imagenes y generacion condicionada por hasta diez imagenes de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con text encoder Qwen3-VL-4B-Instruct y VAE; detalles internos del DiT no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 W8A8 con rotacion Hadamard (FWHT-128), escala u8 por fila + bf16 cada 256 de K; VAE, normas y lineales pequenas en bf16 |
| Idiomas soportados | no disponible (el text encoder Qwen3-VL-4B-Instruct es multilingue, pero no se detalla cobertura) |
| Licencia | FLUX Kommunity License (uso no comercial, con excepcion de output comercial para Qualifying Users); Qwen3-VL-4B-Instruct bajo Apache 2.0 |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance); 9,34 GiB |

## Arquitectura y entrenamiento

El modelo base es un diffusion transformer (DiT) de FLUX.3 [klein] con un text encoder Qwen3-VL-4B-Instruct y un VAE separado. La model card no detalla el numero de parametros del DiT, la composicion del dataset de entrenamiento ni si hubo fases de RLHF o DPO. Se desconoce igualmente el numero de tokens de entrenamiento y las innovaciones de atencion del modelo original.

La innovacion tecnica de este contenedor reside en el esquema de cuantizacion: las lineales del text encoder y del DiT se codifican a int8 (rango -127..127) con round-to-nearest, aplicando previamente una rotacion de Hadamard no normalizada de bloque 128 sobre cada grupo de 256 elementos de K. Cada fila lleva una escala u8 y una segunda escala bf16 cada 256 de K, con clamp simetrico y busqueda de regla (`rule=search`). Las activaciones se cuantizan a int8 bajo la misma rotacion (W8A8). El VAE, las normas y las lineales pequenas se mantienen en bf16. La receta de conversion (`flux-3-klein-iq8r.recipe`) se distribuye en el propio repositorio y se aplica mediante `rad-convert` sobre la descarga diffusers del modelo base.

## Capacidades

- Generacion de imagenes text-to-image con prompts descriptivos completos.
- Edicion de imagenes (image editing) mediante instrucciones en lenguaje natural.
- Generacion condicionada por hasta diez imagenes de referencia.
- Salidas en PNG, JPEG y WebP codificadas en `b64_json`.
- Resoluciones de hasta 2048x2048, con lados multiplos de 16 y 1024x1024 por defecto.
- Servidor compatible con la API de Images de OpenAI: `POST /v1/images/generations` y `POST /v1/images/edits` (JSON o multipart).
- Soporte de `seed`, `n` y streaming con `partial_images`.
- Solo RGB: se rechaza `background: transparent`.
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode.

## Casos de uso

- Generacion de ilustraciones y assets para videojuegos en estaciones de trabajo AMD: el contenedor permite producir imagenes de hasta 2048x2048 en un unico fichero de 9,34 GiB, adecuado para pipelines de asset generation en equipos con Radeon AI PRO R9700.
- Edicion de fotografias por lotes: mediante `POST /v1/images/edits` se pueden aplicar instrucciones de edicion a imagenes existentes, integrable en scripts que consuman la API compatible con OpenAI.
- Prototipado de productos creativos en ROCm: al ser un contenedor `.rad` para el motor radiance, permite desplegar un servidor de imagenes en infraestructura AMD sin depender de CUDA.
- Generacion condicionada por referencias (hasta diez imagenes): util para mantener consistencia de personaje o estilo en series de imagenes, usando las referencias como condicionamiento.
- Servicio interno de generacion de imagenes para equipos de diseno: el servidor expone endpoints estilo OpenAI, lo que facilita integrarlo con SDKs existentes y herramientas de automatizacion.
- Experimentacion con cuantizacion int8 rotada: el repositorio incluye la receta de conversion y permite reproducir el proceso con `rad-convert` para estudiar el impacto de la cuantizacion en calidad de imagen.
- Generacion de imagenes con upsampling de prompt: recomendado por Black Forest Labs pasar cada peticion por un upsampler (`flux-3-image-klein-pup`) antes de enviarla, lo que encaja en pipelines con un LLM previo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| PSNR frente a bf16 (FLUX.3 [klein], misma receta) | 38,7 dB |
| PSNR del contenedor FP8 equivalente | 28,0 dB |
| Latencia 1024x1024, 50 pasos guiados, Radeon AI PRO R9700 (gfx1201) | 35 segundos por imagen |

No se han publicado resultados de benchmarks estandar (FID, CLIP score, etc.) en la informacion disponible. La comparacion PSNR indicada es sobre FLUX.3 [klein] con la misma receta, no medida directamente sobre este checkpoint.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 9,34 GiB; se requiere al menos esa cantidad mas overhead de activaciones, no cuantificado en la informacion disponible.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201) es la unica verificada; el modelo esta orientado a arquitectura RDNA4 con ROCm.
- Cabe en GPU consumer AMD de gama alta con al menos 12-16 GB de VRAM, aunque no se confirma en la model card.
- No es compatible con CUDA ni con GPUs NVIDIA segun la orientacion declarada (ROCm, RDNA4).
- Despliegue: motor `radiance` compilado desde main posterior a 1.17.0 (IQ8R a una escala por 256 de K no esta en 1.17.0). Comando: `radiance --model flux-3-klein-base-iq8r.rad --host 0.0.0.0 --port 8000`.
- Latencia: 35 segundos por imagen 1024x1024 a 50 pasos guiados en Radeon AI PRO R9700. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| Radiance FLUX.3 [klein] Base IQ8R (este) | no disponible (9,34 GiB) | no disponible | `.rad` int8 W8A8 | FLUX Kommunity License | AMD RDNA4 / ROCm |
| StillDeadcode/radiance-flux-3-klein-base-fp8 | no disponible | no disponible | `.rad` FP8 | FLUX Kommunity License | AMD RDNA4 / ROCm |
| black-forest-labs/flux-3-image-klein-base | no disponible | no disponible | diffusers (bf16) | FLUX Kommunity License | GPU generica (CUDA/ROCm) |

El contenedor IQ8R sustituye al FP8 del mismo autor con el mismo numero de bits por peso, pero con una calidad notablemente superior segun el PSNR reportado (38,7 dB frente a 28,0 dB). Frente al checkpoint bf16 original, ofrece un fichero mas pequeno y un motor especifico para ROCm, a costa de una perdida de calidad no medida directamente en este checkpoint.

## Limitaciones y advertencias

- No es una release oficial de Black Forest Labs y no cuenta con su respaldo.
- Licencia FLUX Kommunity: uso no comercial, con excepcion de output comercial solo para Qualifying Users; revisar `LICENSE.md` antes de cualquier uso en produccion.
- Requiere el motor `radiance` compilado desde main posterior a 1.17.0; no funciona con la version 1.17.0.
- Solo soporta hardware AMD RDNA4 con ROCm; no hay soporte CUDA documentado.
- Solo genera imagenes RGB; se rechaza fondo transparente.
- No se ha medido la calidad frente a bf16 en este checkpoint concreto (la cifra de 38,7 dB corresponde a FLUX.3 [klein] con la misma receta).
- Riesgo de sesgos y alucinaciones visuales inherente al modelo base, no evaluado en la informacion disponible.
- Idiomas soportados no documentados; el rendimiento multilingue del text encoder Qwen3-VL-4B-Instruct no se ha caracterizado.
- Recomendacion de usar un upsampler de prompt antes de la inferencia; usarlo directamente puede degradar la calidad.
- Sin descargas ni likes en el momento de la consulta; modelo muy reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/StillDeadcode/radiance-flux-3-klein-base-iq8r
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Contenedor FP8 precedente: https://huggingface.co/StillDeadcode/radiance-flux-3-klein-base-fp8
- Repositorio del motor radiance: https://codeberg.org/StillDeadcode/radiance
- Upsampler de prompts recomendado: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
