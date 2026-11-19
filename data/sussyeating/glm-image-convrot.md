# SUSSYEATING/GLM-Image-ConvRot

## Resumen

GLM-Image-ConvRot es un conjunto de checkpoints cuantizados de alta fidelidad del modelo de generación de imágenes zai-org/GLM-Image, publicado por el usuario SUSSYEATING. Se trata de una conversión de pesos, no de un modelo entrenado desde cero: aplica técnicas de cuantización ConvRot (INT8, W6A8 e INT4 W4A8) sobre los dos componentes principales del modelo base, el VLM autorregresivo de 9B parámetros y el decodificador de difusión DiT de 7B parámetros, con el objetivo de reducir el uso de VRAM y acelerar la inferencia sin degradar de forma significativa la calidad visual.

La relevancia de esta ficha radica en que permite ejecutar un modelo de texto-a-imagen de 16B parámetros combinados en GPUs de consumo, algo imposible con los pesos BF16 originales (34,08 GB). El tier INT4 reduce el peso a 12,91 GB con un pico de VRAM de 19,40 GB, mientras que el INT8 mantiene una calidad casi indistinguible del original (SSIM superior a 0,995) con 18,10 GB de pesos. La arquitectura híbrida combina un VLM autorregresivo que genera tokens visuales discretos con un DiT que los decodifica en píxeles, y el paquete incluye kernels Tensor Core específicos a través de la librería comfy-kitchen.

El modelo está pensado para desarrolladores que trabajan con pipelines de difusión en diffusers o ComfyUI y necesitan desplegar generación de imágenes de alta calidad con tipografía controlada en entornos con VRAM limitada. Soporta chino e inglés, se distribuye bajo licencia MIT y depende del modelo base zai-org/GLM-Image, que debe descargarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: VLM autorregresivo (9B) + decodificador de difusión DiT (7B) + text encoder ByT5 + VAE |
| Parametros totales | 16B combinados (9B VLM + 7B DiT) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot-256, INT6 W6A8 ConvRot-256, INT4 W4A8 ConvRot-256 (asimétrica) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | MIT (los pesos VQ tokenizer y ViT de X-Omni/X-Omni-En quedan bajo Apache 2.0) |
| Formato de pesos | safetensors (un fichero por tier para transformer y otro para VLM) |
| Tamano del repositorio | 46,9 GB |
| Libreria | diffusers + comfy-kitchen >= 0.2.41 |
| Pipeline | text-to-image |
| Modelo base | zai-org/GLM-Image |

## Arquitectura y entrenamiento

El modelo base GLM-Image emplea una arquitectura híbrida poco habitual en generación de imágenes: un VLM autorregresivo de 9B parámetros que genera 4.096 tokens visuales discretos de forma secuencial, seguido de un decodificador de difusión DiT de 7B parámetros que transforma esos tokens en píxeles. Esta ficha no entrena ningún componente nuevo; aplica cuantización post-entrenamiento sobre los pesos del modelo base.

La cuantización ConvRot se aplica de forma selectiva. En el DiT se cuantizan las 180 capas lineales de los bloques de atención y FFN con ConvRot-256, además de 30 capas de modulación AdaLN (norm1.linear) que se mantienen en INT8 en todos los tiers. Quedan en BF16 el prior_token_embedding, glyph_projector, image_projector, time_condition_embed, norm_out y proj_out. En el VLM de 9B se cuantizan las 40 capas del LLM autorregresivo con SmoothQuant + ConvRot-256 en q_proj, o_proj y mlp.gate_up_proj, y con INT8 ConvRot-64 en mlp.down_proj (K=13696, divisible por 64) para compatibilidad con W6A8 y W4A8. Los 40 bloques ViT se cuantizan a INT8 ConvRot-256, mientras que k_proj, v_proj, embed_tokens, lm_head y vqmodel permanecen en BF16 para preservar la precisión del KV-cache y de los tokens visuales discretos. El text encoder ByT5 y el VAE se cargan sin cuantizar desde el modelo base (1,68 GB combinados) para mantener la fidelidad tipográfica y de píxeles.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024x1024 con control de tipografía y renderizado de texto legible en la imagen (gracias al text encoder ByT5 sin cuantizar).
- Generación de escenas fotorrealistas, pósters, ilustraciones y detalles macro con calidad cercana al modelo BF16 en el tier INT8.
- Soporte bilingüe chino-inglés en los prompts.
- Tres niveles de cuantización seleccionables (INT8, INT6, INT4) con distintos compromisos de VRAM y calidad.
- Integración con diffusers y con comfy-kitchen para kernels Tensor Core INT8/W6A8/W4A8.
- No se documentan capacidades de tool calling, agentes, visión de entrada ni audio en la información disponible; es un pipeline exclusivamente text-to-image.

## Casos de uso

- Despliegue en GPUs de consumo: el tier INT4 (12,91 GB de pesos, 19,40 GB de pico de VRAM) permite ejecutar un modelo de 16B combinados en tarjetas de 24 GB como la RTX 4090, algo inviable con los 34,08 GB del BF16.
- Generación de pósters y material gráfico con texto: el text encoder ByT5 sin cuantizar y el glyph_projector en BF16 preservan la legibilidad tipográfica, útil para carteles, banners y mockups publicitarios.
- Prototipado rápido de pipelines de difusión: el tier INT8 ofrece un 46,9% menos de peso y un 1,26x de aceleración en el calentamiento del DiT con SSIM superior a 0,995, adecuado para iterar prompts en desarrollo.
- Servicios de generación de imágenes por API con presupuesto de VRAM ajustado: el tier INT6 (15,88 GB, 22,31 GB de pico) equilibra calidad y coste para despliegues multiusuario en una sola GPU.
- Investigación en cuantización de modelos híbridos AR+DiT: los checkpoints permiten reproducir los experimentos de fidelidad DiT-aislada y de concordancia de tokens visuales con teacher forcing del VLM.
- Integración en ComfyUI: la dependencia de comfy-kitchen y el formato de pesos por tier facilitan su uso en flujos de trabajo nodales para artistas técnicos y equipos de contenido.

## Benchmarks y rendimiento

Resultados verificados a 1024x1024, 50 pasos de DiT, guidance_scale=1.5:

| Tier | Tamano DiT + VLM | Pico VRAM | Tiempo calentamiento DiT | PSNR DiT-aislado (cabin / poster / watch) | SSIM DiT-aislado | VLM Top-1 / KL (teacher-forced) |
|---|---|---|---|---|---|---|
| BF16 baseline | 34,08 GB (13,85 + 20,23) | 40,55 GB | 21,60 s | Referencia | 1,0000 | 100,0% / 0,000 |
| INT8 ConvRot | 18,10 GB (7,07 + 11,03, -46,9%) | 24,59 GB | 17,21 s (1,26x) | 47,21 / 42,83 / 38,65 dB | 0,9982 / 0,9965 / 0,9957 | 89,71% / 0,081 |
| INT6 (w6w8) ConvRot | 15,88 GB (5,94 + 9,94, -53,4%) | 22,31 GB | 17,95 s (1,20x) | 41,74 / 39,73 / 36,68 dB | 0,9966 / 0,9941 / 0,9933 | 89,19% / 0,082 |
| INT4 (w4w8) ConvRot | 12,91 GB (4,43 + 8,48, -62,1%) | 19,40 GB | 17,80 s (1,21x) | 30,44 / 30,55 / 26,37 dB | 0,9723 / 0,9650 / 0,9608 | 79,62% / 0,316 |

Nota del autor: en el muestreo extremo a extremo el VLM autorregresivo genera 4.096 tokens visuales discretos, por lo que pequeños desplazamientos en los logits producen composiciones válidas distintas para el mismo prompt; por eso se reportan por separado la reconstrucción DiT-aislada (mismos tokens previos BF16) y la concordancia de tokens visuales con teacher forcing del VLM.

## Requisitos de hardware

- VRAM estimada (pico medido): INT8 24,59 GB; INT6 22,31 GB; INT4 19,40 GB; BF16 de referencia 40,55 GB.
- GPU recomendadas: A100 40/80 GB o H100 para BF16; RTX 4090 (24 GB) para INT8 e INT6; RTX 3090 (24 GB) o RTX 4080 (16 GB, solo INT4 con margen ajustado) para el tier INT4.
- Cabe en GPU de consumo: sí, los tres tiers cuantizados caben en 24 GB; el INT4 es el único que deja margen razonable en tarjetas de 16 GB.
- Opciones de despliegue: diffusers con comfy-kitchen >= 0.2.41 (flujo documentado), ComfyUI mediante comfy-kitchen; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: tiempo de calentamiento del DiT de 17,21 s (INT8), 17,95 s (INT6) y 17,80 s (INT4) frente a 21,60 s en BF16, es decir, aceleraciones de 1,26x, 1,20x y 1,21x respectivamente. No se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM pico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-Image-ConvRot (este) | 16B combinados (9B + 7B) | no disponible | INT8, INT6, INT4 | 19,40–24,59 GB | MIT | Hugging Face, diffusers, comfy-kitchen |
| zai-org/GLM-Image (BF16) | 16B combinados (9B + 7B) | no disponible | BF16 | 40,55 GB | MIT | Hugging Face, diffusers |
| X-Omni/X-Omni-En (componentes ViT y VQ) | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de otros modelos de texto-a-imagen en la información proporcionada, por lo que no se incluyen comparaciones de rendimiento con alternativas como Flux, SDXL o similar.

## Limitaciones y advertencias

- El tier INT4 degrada notablemente la fidelidad: PSNR DiT-aislado de 26,37–30,55 dB y SSIM de 0,9608–0,9723, además de una caída del Top-1 del VLM a 79,62% y un KL de 0,316 frente a 0,081 en INT8.
- La naturaleza autorregresiva del VLM implica que pequeñas variaciones en los logits producen composiciones distintas para el mismo prompt; la reproducibilidad exacta entre tiers no está garantizada.
- Solo soporta chino e inglés; no se documentan otros idiomas.
- Requiere descargar el modelo base zai-org/GLM-Image por separado (los pesos cuantizados no son autónomos) y la librería comfy-kitchen, lo que añade dependencias específicas de CUDA y Tensor Cores.
- Los pesos del VQ tokenizer y del ViT incorporados desde X-Omni/X-Omni-En están sujetos a Apache 2.0, no a la MIT del conjunto, lo que debe revisarse para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente más allá de los benchmarks del autor.
- No se documentan sesgos específicos ni tasas de alucinación; como todo modelo generativo de imágenes, puede producir contenido factualmente incorrecto o estereotipado según el prompt.

## Enlaces

- Hugging Face: https://huggingface.co/SUSSYEATING/GLM-Image-ConvRot
- Modelo base: https://huggingface.co/zai-org/GLM-Image
- Repositorio comfy-kitchen: https://github.com/Comfy-Org/comfy-kitchen
- Componentes X-Omni: https://huggingface.co/X-Omni/X-Omni-En
