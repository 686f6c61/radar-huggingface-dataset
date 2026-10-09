# webmp3/Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF

## Resumen

Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF es una cuantizacion comunitaria en formato GGUF de Qwen/Qwen-Image-2.1-Turbo, el modelo de generacion de imagen a partir de texto de 7B parametros publicado por Alibaba Qwen. Lo distribuye el usuario webmp3 bajo la denominacion Sakura e introduce una modificacion relevante frente al original: el codificador de texto Qwen3-VL-8B ha sido "abliterado" con la herramienta Heretic (ablacion direccional sobre las proyecciones `o_proj` y `down_proj`), de modo que deja de rechazar la mayoria de prompts considerados daninos. El componente de generacion visual (un DiT de 7B, 32 capas Single-Stream) no se ha alterado en su comportamiento, solo cuantizado.

El repositorio contiene tres ficheros: dos variantes del modelo de difusion (Q5_K_M de 4,60 GiB y Q4_K_M de 3,77 GiB) y un codificador de texto de 4,68 GiB en Q4_K_M. No incluye el VAE oficial, que debe descargarse aparte. Esta pensado para ejecutarse con stable-diffusion.cpp (`sd-cli` / `sd-server`) y queda sujeto a la Qwen Research License, que limita el uso a investigacion y prohibe el uso comercial.

Su interes practico es doble: permite ejecutar el modelo Turbo destilado a 8 pasos en hardware modesto (el autor reporta 12-15 s por imagen a 512x512 en una GPU integrada Radeon 8060S con Vulkan) y documenta de forma cuantitativa el efecto de la ablacion sobre los rechazos, un nivel de detalle poco habitual en publicaciones de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer), 32 capas Single-Stream; codificador de texto Qwen3-VL-8B |
| Parametros totales | 7.115.124.736 (~7,1B) en el componente de generacion visual, mas un codificador de texto de ~8B |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplicable; el limite practico lo fija la longitud de prompt admitida por el codificador de texto (no disponible) |
| Tipos de cuantizacion | Q5_K_M y Q4_K_M (modelo de imagen); Q4_K_M de 4 bits (codificador de texto) |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (Qwen Research License Agreement); solo investigacion, uso no comercial |
| Formato de pesos | GGUF; el VAE oficial requerido esta en safetensors |

## Arquitectura y entrenamiento

El modelo de imagen es un Diffusion Transformer (DiT) de aproximadamente 7B parametros organizado en 32 capas Single-Stream, que unifica generacion a partir de texto y edicion de imagen en una sola arquitectura. La variante Turbo sobre la que se basa esta destilada para funcionar en 8 pasos de muestreo con CFG 1.0, usando un calendario de sigmas propio (`1.0, 0.978453, 0.95418, 0.926626, 0.89508, 0.845148, 0.704534, 0.414568, 0.0`). El autor no ha reentrenado ni modificado los pesos del DiT: unicamente los ha cuantizado con las recetas uniformes de stable-diffusion.cpp.

La innovacion de esta publicacion reside en el codificador de texto. Partiendo de Qwen3-VL-8B, se aplico ablacion direccional con Heretic sobre `o_proj` y `down_proj`, seguida de una cuantizacion GGUF Q4_K_M. El autor reporta que los rechazos medidos con el codificador como modelo de chat pasaron de 100/100 a 8/100 en los prompts de evaluacion de Heretic, con una divergencia KL de 0,047 en la distribucion del primer token. No se ha medido en detalle como afecta esa ablacion a las imagenes generadas; las unicas comparaciones publicadas se hicieron con prompts neutros.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) con el modelo DiT de 7B.
- Edicion de imagen y generacion con transparencia RGBA nativa, heredadas de Qwen-Image-2.1.
- Generacion en 8 pasos con CFG 1.0 gracias a la destilacion Turbo, lo que reduce notablemente el coste de inferencia.
- Renderizado de texto integrado en la imagen (el autor lo prueba con un prompt de poster con texto).
- Codificador de texto abliterado: responde a prompts que el codificador oficial rechazaria de forma explicita.
- Ejecucion offline y local mediante stable-diffusion.cpp, sin dependencia de APIs en la nube.
- No se documentan capacidades de vision de entrada, tool calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje conversacional.

## Casos de uso

- Ilustracion y concept art: el modelo genera imagenes de 1024x1024 en 8 pasos, lo que permite iterar bocetos rapidamente en un equipo de diseno sin esperar lotes largos.
- Prototipado de assets para videojuegos indie: al ser local y ligero (unos 10 GiB en memoria con el encoder y el VAE), encaja en estaciones de trabajo con GPU de gama media para producir variaciones de sprites, fondos o texturas.
- Generacion de posters y carteles con texto: la capacidad de renderizar texto dentro de la imagen permite crear carteles promocionales y mockups sin salir del flujo local.
- Edicion de imagenes y composiciones con transparencia: el componente de edicion y el soporte RGBA de Qwen-Image-2.1 facilitan preparar recortes y capas para pipelines de diseno grafico.
- Investigacion sobre alineacion y seguridad: la publicacion incluye mediciones de rechazos y divergencia KL, lo que la convierte en un caso de estudio util para analizar el efecto de la ablacion direccional en un codificador multimodal.
- Contenido para adultos o tematicas restringidas: el encoder abliterado evita el bloqueo de prompts, aunque su uso queda limitado a investigacion por licencia y sujeto a la legislacion aplicable en cada jurisdiccion.
- Integracion en un servidor de generacion propio: `sd-server` permite exponer el modelo como servicio interno para un equipo, evitando enviar prompts a proveedores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de difusion. El autor si publica mediciones de fidelidad frente a la referencia Q8_0 y de rechazos del codificador de texto.

Fidelidad del modelo de imagen frente a la referencia Q8_0 (8 prompts neutros, semilla 42, 512x512, 8 pasos):

| Fichero | Tamano | PSNR vs Q8_0 | SSIM vs Q8_0 |
|---|---:|---:|---:|
| Q5_K | 4,60 GiB | 24,77 dB | 0,906 |
| Q4_K | 3,77 GiB | 21,46 dB | 0,842 |

Rechazos del codificador de texto usado como modelo de chat (llama.cpp, Q4_K_M, temperatura 0, 120 tokens, 104 prompts daninos retenidos):

| Codificador (Q4_K_M) | Rechazos estrictos | Marcadores amplios de rechazo |
|---|---:|---:|
| Oficial, sin modificar | 58 / 104 | 98 / 104 |
| Sakura (Heretic) | 0 / 104 | 9 / 104 |

Efecto del codificador sobre las imagenes (modelo Q8_0, 8 prompts neutros, semilla 42, referencia = mismo Q8_0 con el encoder int8 oficial):

| Codificador | PSNR vs referencia | SSIM vs referencia |
|---|---:|---:|
| Oficial como GGUF Q4_K_M | 20,75 dB | 0,830 |
| Sakura (Heretic) Q4_K_M | 18,70 dB | (valor no disponible en la informacion proporcionada) |

## Requisitos de hardware

- Pesos en memoria con la combinacion Q5_K_M: aproximadamente 4,6 GiB (DiT) + 4,7 GiB (encoder) + 0,6 GiB (VAE) = unos 10 GiB. Con Q4_K_M baja a unos 9 GiB. El autor no midio el pico de VRAM de esa combinacion exacta.
- Prueba real del autor: 512x512, 8 pasos, entre 12 y 15 s por imagen en una Radeon 8060S (GPU integrada) con backend Vulkan. No se probo a 1024x1024, que es el tamano habitual del modelo.
- Cabe en GPU de consumo con 12 GB o mas de VRAM (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4080) si se reparte la carga o se usa Q4_K_M. No hay datos medidos para estas GPU concretas.
- Despliegue recomendado con stable-diffusion.cpp (`sd-cli` y `sd-server`) del maestro de leejet, commit `228c707` probado. Requiere indicar explicitamente el modelo de difusion, el VAE y el encoder mediante los flags `--diffusion-model`, `--vae` y `--llm`.
- No se documentan estimaciones de throughput para GPU dedicadas ni soporte para vLLM o TGI, que no aplican a este tipo de modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Encoder | Licencia | Uso comercial |
|---|---|---:|---|---|---|
| Sakura-Qwen-Image-2.1-Turbo-Uncensored (este) | 7B DiT + 8B encoder | GGUF (Q4_K, Q5_K) | Qwen3-VL-8B abliterado con Heretic | qwen-research | No |
| Qwen/Qwen-Image-2.1-Turbo (base) | 7B DiT + encoder original | Safetensors | Qwen3-VL-8B oficial | qwen-research | No |
| KasugaiSakura/Qwen-Image-2.1-Uncensored-GGUF | 7B DiT | GGUF (incluye Q6_K) | No especificado | No disponible | No disponible |
| kkguku/Qwen-Image-2.1-Uncensored-GGUF | 7B DiT | GGUF | Requiere `qwen3vl_8b_bf16` (int8) | No disponible | No disponible |

## Limitaciones y advertencias

- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar detalles anatomicos, textuales o geometricos incoherentes, sobre todo con prompts poco concretos.
- Fidelidad reducida en las cuantizaciones mas agresivas: el Q4_K baja a 21,46 dB de PSNR y 0,842 de SSIM frente al Q8_0, lo que se traduce en desviaciones visibles en detalles finos.
- La ablacion del encoder altera los embeddings, pero el autor no ha medido el efecto real sobre la calidad ni la composicion de las imagenes con contenido restringido.
- La licencia qwen-research excluye el uso comercial. Cualquier despliegue en producto queda fuera de los terminos de la licencia tal como esta publicada.
- Contenido no apto para todos los publicos: el repositorio esta marcado como `not-for-all-audiences` y no incluye imagenes de muestra de contenido restringido. La responsabilidad legal por lo que se genere recae en el usuario.
- No hay informacion sobre idiomas soportados ni sobre la longitud de prompt admitida.
- El VAE no esta incluido; quien no descargue `qwen_image_2.1_vae_bf16.safetensors` desde Comfy-Org no podra ejecutar el modelo.
- Dependencia de una build concreta de stable-diffusion.cpp (maestro, commit `228c707`); el calendario de sigmas debe respetarse exactamente o la calidad cae.
- No se ha validado el funcionamiento a 1024x1024 en esta cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webmp3/Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- VAE oficial requerido: https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/vae/qwen_image_2.1_vae_bf16.safetensors
- Repositorio oficial Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp/releases
- Heretic: https://github.com/p-e-w/heretic
- Alternativa KasugaiSakura: https://huggingface.co/KasugaiSakura/Qwen-Image-2.1-Uncensored-GGUF
- Alternativa kkguku: https://huggingface.co/kkguku/Qwen-Image-2.1-Uncensored-GGUF
- Analisis tecnico de MarkTechPost: https://www.marktechpost.com/2026/09/21/alibaba-qwen-releases-qwen-image-2-1/
- Guia practica en stashbase.ai: https://stashbase.ai/blog/run-qwen-image-2-1-locally-uncensored/
