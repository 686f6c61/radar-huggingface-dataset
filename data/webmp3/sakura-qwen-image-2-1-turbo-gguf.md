# webmp3/Sakura-Qwen-Image-2.1-Turbo-GGUF

## Resumen

Sakura-Qwen-Image-2.1-Turbo-GGUF es una cuantizacion comunitaria en formato GGUF del modelo de generacion de imagenes Qwen-Image-2.1-Turbo, desarrollado por el equipo Qwen de Alibaba y publicado por el usuario webmp3 dentro del proyecto Sakura. El modelo base es un DiT (Diffusion Transformer) de 32 capas single-stream con unos 7.115 millones de parametros en su componente de generacion visual, destilado para operar en 8 pasos de muestreo (variante Turbo).

La aportacion de esta ficha es el empaquetado en tres niveles de cuantizacion (Q8_0, Q5_K y Q4_K), que permite ejecutar el modelo de imagen desde 7,07 GiB hasta 3,77 GiB y desplegarlo en stable-diffusion.cpp y ComfyUI sobre GPU de consumo. Es relevante ahora porque Qwen-Image-2.1 es un modelo unificado de generacion y edicion de imagen, y esta cuantizacion lo adapta a hardware local.

La licencia qwen-research limita el uso a fines no comerciales, un caveat determinante de cara a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer), 32 capas single-stream |
| Parametros totales | 7.115.124.736 (~7,1 B) en el componente de generacion visual |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el prompt lo procesa el codificador de texto Qwen3-VL 8B) |
| Tipos de cuantizacion | Q8_0, Q5_K (etiquetado Q5_K_M) y Q4_K (etiquetado Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (solo uso no comercial) |
| Formato de pesos | GGUF (modelo de imagen); safetensors (VAE y codificador de texto) |

## Arquitectura y entrenamiento

Qwen-Image-2.1-Turbo es un modelo unificado de generacion y edicion de imagen construido sobre un Diffusion Transformer de 32 capas single-stream con 7B de parametros en su componente visual, segun el repositorio oficial QwenLM/Qwen-Image-2.1. La variante Turbo esta destilada para generar con 8 pasos y CFG 1.0, empleando un calendario de sigmas especifico (1.0, 0.978453, 0.95418, 0.926626, 0.89508, 0.845148, 0.704534, 0.414568, 0.0). El pipeline completo combina tres piezas: el modelo de imagen DiT, un VAE (qwen_image_2.1_vae_bf16) y un codificador de texto Qwen3-VL 8B (qwen3vl_8b_int8_convrot, no incluido en este repositorio).

Esta publicacion no entrena: unicamente cuantiza. El archivo Q8_0 se genero con `sd-cli -M convert` directamente desde los pesos BF16 oficiales verificando el sha256 de los dos fragmentos, y sus tensores son identicos a los del Q8_0 de DogukanUrker (comparados tensor a tensor); los archivos Q5_K y Q4_K se derivaron de ese Q8_0 aplicando las recetas uniformes Q5_K y Q4_K de stable-diffusion.cpp. No se documentan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO).

## Capacidades

- Generacion texto-a-imagen (text-to-image): produce imagenes a partir de prompts de texto.
- Muestreo rapido: la destilacion Turbo permite generar en 8 pasos con CFG 1.0, frente a los 20-50 pasos habituales de otros modelos de difusion.
- Integracion con ComfyUI mediante Unet Loader (GGUF) para el modelo de imagen, Load CLIP con tipo `qwen_image` para el codificador y el nodo TextEncodeQwenImage21, con inyeccion manual de sigmas.
- Ejecucion en stable-diffusion.cpp (`sd-cli` / `sd-server`) con soporte de `--diffusion-fa` y `--vae-tiling`.
- Uso del modelo base Qwen-Image-2.1, que segun su repositorio oficial es un modelo unificado de generacion y edicion de imagen.
- Generacion de texto dentro de la imagen (se probo con prompts de "poster with text").
- Idiomas del prompt: no disponibles.
- No se documenta soporte de tool calling, function calling ni agentes, ya que no es un modelo de lenguaje.

## Casos de uso

- Ilustracion y concept art: generar bocetos y variaciones a partir de prompts de texto, aprovechando los 8 pasos para reducir el coste de iteracion respecto a modelos de 20-50 pasos.
- Prototipado de assets para videojuegos: producir texturas, iconos y fondos a 512x512 para iterar rapido antes de encargar el arte final; la cuantizacion Q4_K (3,77 GiB) lo hace viable en GPU de gama media.
- Pipelines de diseno grafico en ComfyUI: integrar el modelo en grafos existentes con los nodos Unet Loader (GGUF), Load CLIP (tipo `qwen_image`), Load VAE y TextEncodeQwenImage21, encadenando generacion y post-proceso.
- Generacion por lotes con servidor local: usar `sd-cli` / `sd-server` de stable-diffusion.cpp para producir imagenes en serie (por ejemplo, carteles con texto) sin depender de APIs en la nube, con `--vae-tiling` para limitar el consumo de VRAM.
- Investigacion sobre cuantizacion de modelos de difusion: los datos medidos de PSNR/SSIM (Q5_K 24,77 dB / SSIM 0,906; Q4_K 21,46 dB / SSIM 0,842 frente a Q8_0) sirven como referencia para estudiar el impacto de la cuantizacion en la calidad.
- Demos y docencia en hardware de consumo: ejecutar generacion texto-a-imagen local a 12-15 s por imagen (512x512) en un equipo con GPU integrada Radeon 8060S y backend Vulkan, sin necesidad de GPU de datacenter.
- Despliegue en entornos aislados o sin conexion: al ser pesos GGUF autocontenidos (salvo codificador y VAE), permite montar un servicio de generacion on-premise cuando se dispone de la licencia adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un modelo de generacion de imagen. El autor si publica una comparacion de desviacion de las cuantizaciones frente al archivo Q8_0 (mismas prompts, semilla 42, 512x512, 8 pasos, mismo equipo): no son una nota de calidad, sino una medida de divergencia, porque un modelo de difusion cambia detalles incluso con cambios minimos de pesos.

| Archivo | Tamano | PSNR vs Q8_0 | SSIM vs Q8_0 |
|---|---:|---:|---:|
| Q5_K | 4,60 GiB | 24,77 dB | 0,906 |
| Q4_K | 3,77 GiB | 21,46 dB | 0,842 |

Datos de rendimiento medidos por el autor: aproximadamente 12-15 s por imagen a 512x512, 8 pasos, en una Radeon 8060S con Vulkan. El Q8_0 no se comparo contra el original BF16, y no se realizaron mediciones a 1024x1024.

## Requisitos de hardware

- VRAM estimada para el pipeline completo (modelo de imagen + codificador de texto int8 + VAE), a 512x512-1024x1024: Q8_0 = 7,07 + 8,71 + 0,63 = ~16,4 GiB; Q5_K = 4,60 + 8,71 + 0,63 = ~13,9 GiB; Q4_K = 3,77 + 8,71 + 0,63 = ~13,1 GiB. El repositorio completo ocupa 17,3 GB.
- GPU recomendadas: no hay lista oficial. El autor probo en una Radeon 8060S (GPU integrada) con Vulkan. Cualquier GPU con 16-24 GB (RTX 4090, A100, H100) puede alojar el pipeline completo.
- Compatibilidad con GPU de consumo: si, siempre que se disponga de VRAM suficiente para el codificador de texto de 8,71 GiB; en tarjetas de 16 GB conviene gestionar el offloading o usar cuantizaciones del encoder. `--vae-tiling` reduce el pico de memoria del VAE.
- Opciones de despliegue: stable-diffusion.cpp (`sd-cli` / `sd-server`, master commit `228c707` probado, build Vulkan) y ComfyUI con una construccion reciente con soporte nativo de Qwen-Image 2.1 y un nodo ComfyUI-GGUF compatible. llama.cpp no aplica (es un modelo de difusion). Los forks alternativos de loader GGUF no fueron probados.
- Latencia y throughput: ~12-15 s por imagen a 512x512, 8 pasos, en Radeon 8060S con Vulkan. Sin mediciones a 1024x1024 ni en otras GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sakura-Qwen-Image-2.1-Turbo-GGUF | Cuantizacion GGUF del DiT | ~7,1 B | Q8_0, Q5_K, Q4_K | qwen-research (no comercial) | HuggingFace |
| DogukanUrker/Qwen-Image-2.1-Turbo-GGUF | Cuantizacion GGUF del DiT | ~7,1 B | Q8_0 (tensores identicos) | qwen-research | HuggingFace |
| Qwen/Qwen-Image-2.1-Turbo | Modelo original en BF16 | ~7,1 B | BF16 | qwen-research | HuggingFace |
| Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF | Cuantizacion con codificadores de texto abliterated | ~7,1 B | Q5_K, Q4_K (+ encoder 8bit y 4bit) | qwen-research | HuggingFace |

Las cuatro opciones comparten el mismo componente de imagen; la diferencia principal entre ellas es el nivel de cuantizacion y, en la variante Uncensored, la sustitucion del codificador de texto por versiones abliteradas. No se dispone de comparativas de calidad frente a otros generadores de imagen (Flux, Stable Diffusion) en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia qwen-research: uso exclusivamente no comercial. El propio autor lo indica ("Non-commercial use only"); no es apta para produccion comercial sin una licencia adicional.
- Cuantizacion con perdida: Q5_K y Q4_K se desvian del Q8_0 (PSNR 24,77 y 21,46 dB; SSIM 0,906 y 0,842). Estas cifras son medidas de desviacion, no de calidad.
- Cobertura de resolucion limitada: el autor solo probo a 512x512; el tamano nominal del modelo es 1024x1024 y no se verifico su comportamiento a esa resolucion.
- Dependencia de terceros: requiere un build reciente de ComfyUI con soporte nativo de Qwen-Image 2.1 y un nodo ComfyUI-GGUF compatible; otros forks de loader no fueron probados, y la integracion en ComfyUI esta marcada como preliminar.
- El codificador de texto no esta incluido en el repositorio: hay que descargarlo aparte desde Comfy-Org/Qwen-Image-2.1.
- Adherencia al prompt y comportamiento multilingue: no documentados; no se aportan tasas de exito ni evaluaciones de fidelidad al prompt.
- Sesgos: no documentados en la informacion disponible.
- Independencia del proyecto: es trabajo independiente, "not made or endorsed by Alibaba/Qwen", por lo que no cuenta con soporte del equipo original.
- Reproducibilidad: la calidad de la generacion depende tambien del codificador de texto y del VAE empleados, que no forman parte de esta cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webmp3/Sakura-Qwen-Image-2.1-Turbo-GGUF
- Version sin censura (codificadores abliterated): https://huggingface.co/webmp3/Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Codificador de texto y VAE oficiales (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Cuantizacion previa con tensores identicos (Q8_0): https://huggingface.co/DogukanUrker/Qwen-Image-2.1-Turbo-GGUF
- Repositorio oficial de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- stable-diffusion.cpp (leejet): https://github.com/leejet/stable-diffusion.cpp
- Guia de ejecucion local: https://stashbase.ai/blog/run-qwen-image-2-1-locally-uncensored/
- Guia general de Qwen Image: https://stable-diffusion-art.com/qwen-image/
