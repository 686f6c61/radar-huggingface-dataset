# SUSSYEATING/BAGEL-7B-MoT-Turbo-ConvRot

## Resumen

BAGEL-7B-MoT-Turbo-ConvRot es un conjunto de checkpoints cuantizados en un solo archivo del modelo multimodal BAGEL-7B-MoT-Turbo, publicado por el usuario SUSSYEATING en Hugging Face. Empaqueta el modelo base en tres niveles de precision (INT8, INT6 e INT4) mediante una combinacion de ConvRot-256, SmoothQuant, GPTQ y descenso por coordenadas en CUDA, aplicada sobre las 392 capas lineales del backbone MoT (196 de comprension y 196 de generacion). El objetivo es claro: hacer viable la inferencia multimodal (texto a imagen, edicion de imagen, comprension de imagen y razonamiento con modo `<think>`) en GPUs de consumo de 12 a 24 GB.

El modelo hereda la arquitectura Mixture-of-Transformers de BAGEL, con un backbone de aproximadamente 7.000 millones de parametros que combina un transformador autorregresivo para texto y un transformador de difusion para la generacion de imagenes. La version "Turbo" del modelo base esta optimizada para generar en 8 pasos de Euler con `CFG = 1.0`, lo que reduce drasticamente el coste computacional frente a los 50 pasos del modelo base original.

La relevancia de esta publicacion es practica: el BF16 original ocupa 29,21 GB en disco y requiere entre 30 y 31 GB de VRAM, lo que lo excluye de la mayoria de equipos consumer. Con estas cuantizaciones se reduce el tamano hasta un 64,2 % y la VRAM maxima hasta 2,6 veces, manteniendo velocidades de 2,69 a 3,50 segundos por imagen de 1024x1024 en una RTX PRO 6000 Blackwell. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT): backbone autorregresivo de texto + transformador de difusion para imagenes |
| Parametros totales | 7B (aproximado, segun el nombre del modelo; no se detalla el desglose exacto) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (W8A8, `int8_tensorwise`), INT6 (W6A8 g16), INT4 (W4A8 g16), todas con ConvRot-256 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file, `diffusion-single-file` para ComfyUI) |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Transformers con dos ramas acopladas: una autorregresiva para modelar texto y otra de difusion para sintetizar imagenes, ambas compartiendo un unico backbone de aproximadamente 7B parametros. La variante Turbo esta calibrada para trayectorias de `CFG = 1.0`, `timestep_shift = 3.0` y `num_timesteps = 9` (8 pasos de Euler), lo que permite generar imagenes de 1024x1024 sin classifier-free guidance y en muy pocos pasos. El modo `<think>` activa una expansion de razonamiento autoregresiva de unas 90 a 140 palabras antes del proceso de denoising, lo que mejora la coherencia semantica de la escena.

La cuantizacion de esta ficha aplica ConvRot-256 (una rotacion de Hadamard por convolucion) combinada con SmoothQuant y GPTQ, mas un ajuste fino mediante descenso por coordenadas en CUDA. El calibrado se realizo especificamente sobre las trayectorias del modelo Turbo, no sobre el BAGEL original, lo que explica que las metricas de fidelidad se midan contra el BF16 Turbo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto a imagen (T2I) a 1024x1024 con 8 pasos de Euler y `CFG = 1.0`.
- Generacion de imagen con razonamiento explicito mediante el modo `<think>`, que produce una expansion textual antes de la sintesis visual.
- Edicion de imagen (image-to-image) guiada por instrucciones en lenguaje natural.
- Comprension de imagen (image understanding): descripcion de escenas y respuesta a preguntas sobre el contenido visual.
- Generacion multimodal any-to-any: el pipeline declarado del repositorio es `any-to-any`.
- Integracion nativa con ComfyUI mediante el nodo personalizado `ComfyUI-BAGEL/` incluido en el repositorio.
- Soporte de cuantizacion INT8, INT6 e INT4 dentro del mismo flujo de trabajo, con seleccion de checkpoint segun VRAM disponible.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni audio en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes en estaciones de trabajo con GPU de 16 GB: el checkpoint INT6 ocupa 13,73 GB en disco y consume 14,69 GB de VRAM pico en T2I, por lo que encaja en tarjetas como la RTX 4080 o la RTX 4060 Ti de 16 GB sin necesidad de descargar capas a RAM.
- Edicion de imagenes por instrucciones en equipos de 12 GB: el checkpoint INT4 requiere 11,41 GB en T2I y 12,42 GB en edicion, lo que permite flujos de retoque fotografico o variaciones de producto en GPUs como la RTX 3060 de 12 GB.
- Prototipado rapido en ComfyUI: el repositorio incluye el nodo `ComfyUI-BAGEL/` y una configuracion recomendada (`num_timesteps = 9`, `timestep_shift = 3.0`, `cfg_text_scale = 1.0`, `cfg_img_scale = 1.0`, `cfg_interval = 0.0`), lo que reduce el tiempo de puesta en marcha a copiar el directorio, instalar dependencias y colocar el VAE FLUX en `models/vae/`.
- Generacion con planificacion previa: el modo `<think>` es util para escenas complejas donde se necesita coherencia entre objetos, iluminacion y composicion; el modelo escribe primero una descripcion razonada de 90 a 140 palabras y despues sintetiza la imagen.
- Descripcion automatica de imagenes y alt-text: la capacidad de image understanding funciona en los tres niveles de cuantizacion con resultados identicos palabra por palabra en INT8 e INT6 respecto al BF16, con tiempos de 1,63 a 1,86 segundos.
- Evaluacion comparativa de tecnicas de cuantizacion: al publicar metricas PSNR, SSIM y similitud coseno frente al BF16 Turbo, junto con los JSON por ejecucion en `metrics/`, el repositorio sirve como referencia reproducible para investigar el impacto de ConvRot-256 en modelos multimodales.
- Despliegue en produccion con restricciones de memoria: el checkpoint INT8 ofrece la mayor fidelidad (32,05 a 38,48 dB de PSNR en T2I y edicion) y cabe en GPUs de 24 GB como la RTX 4090 o la A10G, con tiempos de 2,69 a 3,35 segundos por imagen.

## Benchmarks y rendimiento

Las metricas se midieron contra el BF16 Turbo a 1024x1024, con `num_timesteps = 9`, `timestep_shift = 3.0` y `CFG = 1.0`, en una NVIDIA RTX PRO 6000 Blackwell de 98 GB con PyTorch SDPA.

| Tier | T2I Cabin PSNR / SSIM / Cos | T2I Watch PSNR / SSIM / Cos | Image Edit PSNR / SSIM / Cos | T2I + `<think>` Cos / SSIM |
|---|---|---|---|---|
| INT8 ConvRot (16,18 GB) | 32,05 dB / 0,9653 / 0,9967 | 32,48 dB / 0,9858 / 0,9984 | 38,48 dB / 0,9930 / 0,9996 | 0,7653 / 0,6405 |
| INT6 ConvRot (13,73 GB) | 32,22 dB / 0,9677 / 0,9974 | 30,98 dB / 0,9806 / 0,9974 | 35,62 dB / 0,9912 / 0,9990 | 0,7056 / 0,6016 |
| INT4 ConvRot (10,47 GB) | 23,53 dB / 0,8389 / 0,9708 | 25,89 dB / 0,9486 / 0,9892 | 28,18 dB / 0,9728 / 0,9943 | 0,8012 / 0,6741 |

| Tier | Tiempo de carga | T2I Watch | Image Edit | VRAM pico T2I / Edit | Image understanding |
|---|---|---|---|---|---|
| BF16 Turbo (29,21 GB) | 16,38 s | 3,98 s | 3,09 s | 30,25 / 31,26 GB | 1,53 s (referencia) |
| INT8 ConvRot (16,18 GB) | 9,41 s | 3,35 s | 2,69 s | 17,12 / 18,13 GB | 1,74 s, identico palabra por palabra |
| INT6 ConvRot (13,73 GB) | 8,22 s | 3,50 s | 2,80 s | 14,69 / 15,70 GB | 1,63 s, identico palabra por palabra |
| INT4 ConvRot (10,47 GB) | 6,51 s | 3,47 s | 2,76 s | 11,41 / 12,42 GB | 1,86 s, descripcion precisa de dos frases |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 17,12 GB (INT8, T2I), 14,69 GB (INT6, T2I), 11,41 GB (INT4, T2I); en edicion de imagen sube a 18,13 GB, 15,70 GB y 12,42 GB respectivamente.
- GPU recomendadas: RTX PRO 6000 Blackwell (mediciones oficiales), A100 o H100 para INT8 con margen amplio; RTX 4090 y A10G de 24 GB para INT8; RTX 4080 y RTX 4060 Ti de 16 GB para INT6; RTX 3060 de 12 GB para INT4.
- Cabe en GPU consumer: si, en las tres variantes segun el limite de VRAM indicado.
- Opciones de despliegue: ComfyUI mediante el nodo `ComfyUI-BAGEL/` incluido; se requiere el VAE oficial FLUX (`ae.safetensors`) en `ComfyUI/models/vae/` y el paquete `comfy-kitchen` con soporte ConvRot. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 2,69 a 3,50 segundos por imagen de 1024x1024 en RTX PRO 6000 Blackwell; tiempos de carga de 6,51 a 9,41 segundos. No se proporcionan cifras de throughput para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / VRAM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAGEL-7B-MoT-Turbo-ConvRot (esta ficha) | 7B | no disponible | safetensors INT8/INT6/INT4, 11,4 a 18,1 GB de VRAM | Apache 2.0 | Hugging Face, 33 descargas |
| SUSSYEATING/BAGEL-7B-MoT-Turbo (base) | 7B | no disponible | safetensors BF16, 29,21 GB en disco, 30,25 a 31,26 GB de VRAM | Apache 2.0 | Hugging Face |
| BAGEL original (referencia en la model card) | 7B | no disponible | BF16, calibrado para 50 pasos con CFG | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base porque la informacion proporcionada no incluye datos de rendimiento de otros modelos multimodales de tamano similar. No se dispone de cifras de MMLU, HumanEval ni otros benchmarks que permitan una comparacion cruzada rigurosa.

## Limitaciones y advertencias

- El checkpoint INT4 muestra una perdida de fidelidad notable en T2I: 23,53 dB de PSNR y 0,8389 de SSIM en la escena del cabin, frente a 32,05 dB y 0,9653 del INT8. No es recomendable para produccion con requisitos de calidad alta.
- El modo `<think>` presenta variaciones de redaccion durante la decodificacion greedy del texto, lo que desplaza la posicion de objetos aunque preserve la semantica de la escena; los valores de similitud coseno bajan a 0,70-0,80 en todos los niveles.
- Las metricas se han medido en una unica GPU (RTX PRO 6000 Blackwell de 98 GB) con PyTorch SDPA; el rendimiento en otras GPU puede diferir y no se documenta.
- El modelo base es una variante "Turbo" calibrada para 8 pasos y `CFG = 1.0`; usar otros valores de pasos o de escala de guiado puede degradar la calidad y no esta validado en esta publicacion.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos del modelo base; se desconoce la composicion del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de BAGEL y de FLUX VAE, cuyas condiciones de atribucion deben verificarse por separado.
- El repositorio tiene 33 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.
- La fecha de creacion indicada (2026-11-20) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SUSSYEATING/BAGEL-7B-MoT-Turbo-ConvRot
- Modelo base BF16: https://huggingface.co/SUSSYEATING/BAGEL-7B-MoT-Turbo
- Script de evaluacion: `scripts/eval_bagel_turbo.py` (incluido en el repositorio)
- Logs de metricas: `metrics/` (incluido en el repositorio)
- Nodo ComfyUI: `ComfyUI-BAGEL/` (incluido en el repositorio)
- Comparativas visuales: `comparisons/` (incluido en el repositorio)
- VAE requerido: FLUX `ae.safetensors` (no se proporciona enlace directo en la informacion disponible)
