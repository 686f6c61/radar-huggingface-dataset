# Wh1teSpaces/OD-XL-Illustrious-BooruDPO-LoRA

## Resumen

OD-XL-Illustrious-BooruDPO-LoRA es un adaptador LoRA para el modelo de difusion Stable Diffusion XL (SDXL), desarrollado por Wh1teSpaces y publicado bajo el identificador `Wh1teSpaces/OD-XL-Illustrious-BooruDPO-LoRA`. Se entrena sobre el checkpoint base `Wh1teSpaces/OrthogonalDiffusion-XL` (variante v0.3 IllustriousStyle Boost en fp16) y aplica una optimizacion de preferencias mediante Diffusion-DPO con un dataset exclusivamente textual de pares de prompts Booru: un prompt bien formado (chosen) frente a una version degradada del mismo (rejected). No se emplean imagenes como ground truth en ninguna fase del entrenamiento.

El objetivo del adaptador no es mejorar la calidad estetica ni la anatomia del modelo base, sino reforzar el cumplimiento de la sintaxis de etiquetas Danbooru/Booru: orden canonico, uso de underscores, presencia de etiquetas de calidad como `masterpiece` o `best quality`, recuento de sujetos y coherencia del conditioning. Es, por tanto, una pieza orientada a afinar el comportamiento del text encoder frente a prompts estructurados, no a cambiar el estilo visual.

El modelo resulta relevante porque documenta de forma inusualmente detallada una tecnica poco comun: aplicar DPO a un modelo de difusion usando unicamente pares de texto, con un banco de latentes sinteticos (Tier-2, 64 latentes, DDIM de 16 pasos) como sustituto del par imagen-respuesta. El adaptador ocupa aproximadamente 0,3 GB en el repositorio y entrena 85,11 M de parametros sobre un UNet de 2.567 B (3,32 % entrenable).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de SDXL (difusion latente, transformer convolucional) con text encoders CLIP de SDXL |
| Parametros totales | 2.567 B en el UNet base; adaptador LoRA de 85,11 M entrenables (3,32 %) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens de prompt, sin chunking |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors fp32/fp16; el base se usa en fp16) |
| Idiomas soportados | no disponible (prompts en formato de etiquetas Booru, predominantemente en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors`), cargable con `diffusers` |

## Arquitectura y entrenamiento

El adaptador se inyecta como LoRA sobre el UNet de SDXL. El entrenamiento se realizo sobre 2 GPUs Tesla T4 (compute capability 7.5, sin soporte hardware de BF16), con precision FP16 en el base, autocast FP16 y master de LoRA en FP32, usando `bnb.AdamW8bit` con learning rate constante de 2e-06. Se empleo DDP/NCCL con 2 rangos, batch efectivo de 8 pares (2 por GPU x 2 GPUs x 2 de acumulacion), 215 pasos de optimizador y un pico de VRAM de 7,16 GB por GPU. El entrenamiento se detuvo por la senal `SCALE_COLLAPSE`.

La innovacion principal es el uso de **Diffusion-DPO con datos exclusivamente textuales**. Cada par comparte el mismo contenido semantico y difiere solo en la calidad de codificacion: se aplican seis operadores de degradacion (D1: eliminar etiquetas de calidad; D2: convertir a prosa; D3: barajar el orden canonico; D4: eliminar recuentos y `solo`; D5: introducir typos y quitar underscores; D6: inyectar etiquetas contradictorias). El objetivo es un DPO condicional emparejado con `beta=250.0`, timesteps en el rango [350, 999] (sesgo hacia alto ruido) y latentes de 64x64 con `add_time_ids` de 1024^2. Como sustituto de la imagen real se usa un banco de latentes sinteticos (Tier-2, 64 latentes generados con DDIM de 16 pasos).

A nivel de implementacion destacan varias decisiones tecnicas: el modelo de referencia es el mismo UNet con `set_scale(0.0)` en lugar de una copia o de `disable_adapters()`, para garantizar que policy y reference sean bit-identicos; se usa `GradScaler` con `init_scale=512` para mantener la amplificacion total (125x de `DPO_SCALE` x 512) por debajo del maximo FP16 de 65504; se aplica rollback a la ultima snapshot valida cada 100 pasos si se detectan NaN; y se gestiona con cuidado la interaccion entre gradient checkpointing y el scale de LoRA (restaurando el scale nominal antes de `backward()`).

## Capacidades

- Generacion de imagenes text-to-image condicionada por prompts en formato de etiquetas Booru/Danbooru.
- Mejora de la adherencia al formato canonico de etiquetas: orden, underscores, recuento de sujetos y presencia de etiquetas de calidad.
- Mayor sensibilidad a la presencia de `masterpiece` / `best quality` en el prompt (operador D1).
- Preferencia por formato de etiquetas frente a prosa en lenguaje natural (operador D2).
- Mejor comportamiento ante negative prompts y conditioning coherente (operador D6).
- Especializacion en estilo anime/illustrious heredada del checkpoint base.
- No soporta tool calling, agentes, vision de entrada, audio ni modo de razonamiento: es un adaptador de difusion, no un modelo de lenguaje.
- Capacidades multilingues: no documentadas; el formato Booru esta orientado a etiquetas en ingles.

## Casos de uso

- **Generacion de ilustracion anime con pipelines de etiquetas estructuradas**: integrado en un pipeline SDXL que construye prompts a partir de etiquetas Danbooru normalizadas, el LoRA refuerza el orden canonico y la sintaxis correcta, reduciendo la deriva de formato en produccion.
- **Sistemas de prompt automatico (prompt engineering asistido)**: cuando un LLM genera etiquetas Booru para un pipeline de imagen, este adaptador penaliza internamente las variantes degradadas (typos, prosa, orden alterado) y favorece la salida bien formada.
- **Herramientas de anotacion y normalizacion de datasets**: util para validar que los prompts de un dataset siguen el formato Booru esperado antes de usarlos en entrenamiento o inferencia.
- **Generacion por lotes con etiquetas de calidad**: en flujos donde se concatenan sistematicamente `masterpiece`, `best quality` y etiquetas de recuento, el adaptador aprende a responder con mas fuerza a esa estructura.
- **Investigacion en DPO aplicado a difusion**: el modelo sirve como referencia reproducible de Diffusion-DPO con datos solo textuales, util para experimentos academicos sobre optimizacion de preferencias en modelos generativos.
- **Prototipado de estilos Illustrious con control de formato**: para equipos que ya usan el checkpoint base OrthogonalDiffusion-XL y quieren mejorar la consistencia de sus prompts sin cambiar de modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, CLIP score, MMLU, etc.) en la informacion disponible. La model card reporta metricas internas de entrenamiento DPO:

| Metrica | Inicial | Final | Mejor |
|---|---|---|---|
| loss | 0,695237 | 0,907675 | no disponible |
| margin | 8e-05 | -0,002742 | no disponible |
| accuracy | 0,6 | 0,4 | 0,9 |
| ratio_w | 0,992841 | 0,975081 | 0,851721 |
| ratio_l | 1,001064 | 0,954592 | no disponible |

`ratio_w < 1` indica que la policy supera al base en el prompt *chosen*; `ratio_l > 1` indica que el base es mejor en el prompt *rejected*. Ambas son invariantes al timestep porque numerador y denominador comparten `z_t`, `eps` y `t`.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA anade un coste marginal; el pipeline SDXL completo en fp16 requiere aproximadamente 8-10 GB de VRAM en GPU, segun resolucion y batch.
- GPU recomendadas: RTX 3090/4090 (24 GB) para comodidad; A100 o H100 para lotes grandes o despliegue multiusuario. El entrenamiento del adaptador se realizo en 2x Tesla T4 con 7,16 GB de pico por GPU.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, 3070, 4060 Ti) usando fp16 y resolucion estandar; con cuantizacion adicional podria reducirse mas, aunque no se documenta.
- Opciones de despliegue: `diffusers` (con `StableDiffusionXLPipeline.from_single_file` y `load_lora_weights`), ComfyUI, Automatic1111/Forge mediante carga de LoRA, y `vLLM`/`TGI` no aplican (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Configuracion recomendada por el autor: `clip_skip=2`, `prediction_type="epsilon"`, `torch_dtype=torch.float16`, `use_safetensors=True`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OD-XL-Illustrious-BooruDPO-LoRA | LoRA DPO sobre SDXL | 85,11 M entrenables (base 2.567 B) | 77 tokens | creativeml-openrail-m | Hugging Face (diffusers) |
| SDXL base (Stability AI) | Difusion latente | 2.567 B UNet + text encoders | 77 tokens | CreativeML Open RAIL++-M | Amplia |
| Illustrious-XL | SDXL fine-tune estilo anime | ~2.567 B | 77 tokens | CreativeML Open RAIL++-M | Hugging Face |
| PixArt-Sigma | Difusion transformer | ~0,6 B | 120 tokens | OpenRAIL++-M | Hugging Face |

La comparativa con modelos de la misma categoria (LoRA DPO sobre SDXL con datos solo textuales) no esta disponible; no se han identificado alternativas publicas equivalentes en la informacion proporcionada. Frente a SDXL base e Illustrious-XL, la diferencia principal es que este adaptador no modifica el estilo visual, sino el comportamiento del conditioning frente a etiquetas Booru.

## Limitaciones y advertencias

- **Sin ground truth visual**: al entrenar solo con pares de texto, el adaptador no puede mejorar anatomia, estetica ni aprender estilos nuevos; solo refuerza el cumplimiento de formato y la respuesta al conditioning.
- **Riesgo de sobreajuste al formato**: la preferencia por etiquetas Booru bien formadas puede penalizar prompts en prosa o en otros formatos, incluso cuando estos sean validos.
- **Metricas internas inconsistentes**: el accuracy final (0,4) es inferior al inicial (0,6), y el loss final es superior al inicial; el autor reporta un mejor accuracy de 0,9 en algun punto intermedio, pero no se especifica cuando. Conviene validar el comportamiento real antes de usarlo en produccion.
- **Idiomas**: no se documenta soporte multilingue; el formato Booru esta orientado a etiquetas en ingles.
- **Contexto limitado**: 77 tokens sin chunking, lo que restringe prompts largos o descripciones detalladas.
- **Licencia**: CreativeML Open RAIL-M impone restricciones de uso (prohibicion de usos daninos y obligacion de compartir restricciones en derivados); revisar antes de uso comercial.
- **Sesgos**: heredados del checkpoint base y del dataset Booru, con posible sobrerrepresentacion de ciertos estilos y sesgos de representacion propios de Danbooru.
- **Alucinacion**: en el contexto de difusion, se traduce en artefactos visuales o interpretaciones erroneas de etiquetas ambiguas; el adaptador no corrige esto.
- **Dependencia del base**: solo funciona correctamente sobre `OrthogonalDiffusion-XL` v0.3 IllustriousStyle Boost; sobre otros checkpoints SDXL el comportamiento no esta garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wh1teSpaces/OD-XL-Illustrious-BooruDPO-LoRA
- Modelo base: https://huggingface.co/Wh1teSpaces/OrthogonalDiffusion-XL
- Paper de Diffusion-DPO: no disponible en la informacion proporcionada
- Repositorio de diffusers: https://github.com/huggingface/diffusers
- Documentacion de carga de LoRA en diffusers: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- Paper de DPO original: no disponible en la informacion proporcionada
