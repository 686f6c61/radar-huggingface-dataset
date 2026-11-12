# VGhost9081/stable-diffusion-v1-5

## Resumen

Stable Diffusion v1-5 es un modelo de difusión latente (Latent Diffusion Model, LDM) para generación de imágenes a partir de texto, desarrollado originalmente por Robin Rombach y Patrick Esser (CompVis/Stability AI) y publicado en 2022. Este repositorio concreto, `VGhost9081/stable-diffusion-v1-5`, es un espejo del checkpoint original alojado previamente en `runwayml/stable-diffusion-v1-5`, que fue deprecado. El autor del espejo no tiene relación con RunwayML ni con los desarrolladores originales.

El modelo parte de los pesos de Stable Diffusion v1-2 y se afina durante 595.000 pasos a resolución 512x512 sobre el subconjunto "laion-aesthetics v2 5+", aplicando un 10% de dropout en el condicionamiento textual para mejorar el muestreo con classifier-free guidance. Emplea un autoencoder variacional (VAE) que comprime las imágenes a un espacio latente de menor dimensionalidad, un UNet como red de denoising y un codificador de texto CLIP ViT-L/14 congelado.

Es relevante ahora como referencia histórica y como base para fine-tunes, LoRAs y pipelines de generación de imágenes en entornos con recursos limitados: con unos 860 millones de parámetros en el UNet y pesos en fp16, es ejecutable en GPUs de consumo. Su licencia CreativeML OpenRAIL-M permite uso comercial con restricciones de uso responsable, aunque el modelo original se declara "solo para investigación".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (LDM): VAE + UNet + codificador de texto CLIP ViT-L/14 |
| Parametros totales | 859.520.964 (según safetensors del repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto; CLIP ViT-L/14 limita a 77 tokens) |
| Tipos de cuantizacion | fp16 (recomendado para inferencia); fp32; el ecosistema admite GGUF y otras cuantizaciones vía herramientas de terceros |
| Idiomas soportados | inglés (según la model card); otros idiomas no disponibles de forma oficial |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (también disponible en formato diffusers); checkpoints `v1-5-pruned-emaonly.safetensors` y `v1-5-pruned.safetensors` |

## Arquitectura y entrenamiento

Stable Diffusion v1-5 es un modelo de difusión latente. Un VAE comprime las imágenes de 512x512 a un espacio latente de 64x64x4, donde un UNet aprende a revertir el proceso de ruido de forma iterativa. El condicionamiento textual se realiza mediante un codificador CLIP ViT-L/14 congelado, cuya salida se inyecta en el UNet mediante cross-attention. La innovación central del LDM frente a la difusión en píxeles es que el denoising se ejecuta en el espacio latente, lo que reduce drásticamente el coste computacional.

El entrenamiento consistió en afinar el checkpoint de Stable Diffusion v1-2 durante 595.000 pasos a 512x512 sobre "laion-aesthetics v2 5+", con un 10% de dropout en el condicionamiento de texto para habilitar classifier-free guidance. La model card no detalla el número total de tokens de imagen vistos ni la composición exacta del dataset más allá de la referencia a LAION.

## Capacidades

- Generación de imágenes fotorrealistas e ilustraciones a partir de prompts de texto en inglés.
- Modificación de imágenes (img2img) y edición guiada mediante pipelines de diffusers.
- Inpainting y outpainting a través de pipelines derivados y herramientas de terceros.
- Control fino de la generación mediante classifier-free guidance, pasos de muestreo y schedulers intercambiables.
- Base para fine-tuning, DreamBooth, LoRA y textual inversion.
- Integración con interfaces de usuario como ComfyUI, Automatic1111, SD.Next e InvokeAI.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- No soporta visión de entrada ni audio.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el modelo produce borradores visuales rápidos a 512x512 que los equipos de diseño pueden iterar antes de encargar arte final.
- Creación de assets para videojuegos y entornos creativos: texturas, conceptos de personajes y fondos generados por lotes con prompts controlados.
- Fine-tuning con DreamBooth o LoRA para estilos de marca: partiendo de este checkpoint se entrena un modelo especializado con pocas imágenes de referencia.
- Investigación sobre sesgos y seguridad en modelos generativos: la model card lo declara explícitamente como uso previsto, permitiendo estudiar estereotipos y contenido dañino.
- Herramientas educativas de arte generativo: integración en talleres y demos donde el coste de cómputo debe ser bajo.
- Edición de imágenes en pipelines internos: img2img e inpainting para retocar fotografías o eliminar elementos con máscaras.
- Generación en local en GPUs de consumo: despliegue con ComfyUI o Automatic1111 en equipos con 6-8 GB de VRAM usando fp16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4-6 GB en fp16 con el checkpoint `v1-5-pruned-emaonly.safetensors`; más de 8 GB si se usa el checkpoint completo `v1-5-pruned.safetensors` o fp32.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. En GPUs de gama alta el cuello de botella es la latencia de muestreo, no la memoria.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores; también en GPUs con 4 GB aplicando optimizaciones de atención y offloading.
- Opciones de despliegue: diffusers (Python), ComfyUI, Automatic1111, SD.Next, InvokeAI; el repositorio de RunwayML está deprecado.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del número de pasos de muestreo, scheduler y GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stable Diffusion v1-5 (este repo) | ~860 M | 77 tokens de prompt | 512x512 | CreativeML OpenRAIL-M | Hugging Face (espejo) |
| Stable Diffusion v1-2 | no disponible | 77 tokens de prompt | 512x512 | CreativeML OpenRAIL-M | Hugging Face (CompVis) |
| Stable Diffusion 2.1 | no disponible | 77 tokens de prompt | 768x768 | CreativeML OpenRAIL++-M | Hugging Face (Stability AI) |
| Stable Diffusion XL | no disponible | 77 tokens de prompt | 1024x1024 | CreativeML OpenRAIL++-M | Hugging Face (Stability AI) |

Los datos de parámetros y contexto de los modelos comparados no están disponibles en la información proporcionada; solo se confirma que v1-5 se inicializó desde v1-2 y que ambos comparten la licencia OpenRAIL-M.

## Limitaciones y advertencias

- El modelo no genera representaciones factuales de personas o eventos; su uso para ese fin queda fuera de alcance según la model card.
- Riesgo de sesgos: entrenado sobre LAION, puede reproducir estereotipos históricos y actuales.
- Riesgo de alucinación visual: puede producir imágenes plausibles pero incorrectas en anatomía, texto y composición.
- Idiomas: solo inglés de forma oficial; los prompts en otros idiomas degradan la calidad.
- Licencia CreativeML OpenRAIL-M: permite uso comercial pero impone restricciones de uso responsable; el modelo original se declara "solo para investigación", lo que genera ambigüedad para producción.
- Este repositorio es un espejo no oficial: no hay garantía de mantenimiento, soporte ni integridad de los pesos más allá de lo indicado por el autor del espejo.
- El repositorio original de RunwayML está deprecado; para uso en producción conviene referenciar `sd-legacy/stable-diffusion-v1-5`.
- Resolución nativa limitada a 512x512; generar a resoluciones mayores requiere upscalers o pipelines específicos.
- No es un modelo de lenguaje: no soporta razonamiento, código ni agentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VGhost9081/stable-diffusion-v1-5
- Checkpoint original de referencia: https://huggingface.co/sd-legacy/stable-diffusion-v1-5
- Repositorio original de RunwayML (deprecado): https://github.com/runwayml/stable-diffusion
- Repositorio de CompVis: https://github.com/CompVis/stable-diffusion
- Blog de Stable Diffusion en Hugging Face: https://huggingface.co/blog/stable_diffusion
- Paper LDM (Rombach et al., 2022): https://arxiv.org/abs/2112.10752
- Paper classifier-free guidance: https://arxiv.org/abs/2207.12598
- Paper CLIP: https://arxiv.org/abs/2103.00020
- Paper Imagen: https://arxiv.org/abs/2205.11487
- Paper DDPM: https://arxiv.org/abs/1910.09700
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Automatic1111: https://github.com/AUTOMATIC1111/stable-diffusion-webui
- SD.Next: https://github.com/vladmandic/automatic
- InvokeAI: https://github.com/invoke-ai/InvokeAI
