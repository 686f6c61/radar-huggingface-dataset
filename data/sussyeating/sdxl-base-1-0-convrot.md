# SUSSYEATING/SDXL-Base-1.0-ConvRot

## Resumen

SDXL Base 1.0 ConvRot es una familia de checkpoints cuantizados del modelo de difusion text-to-image stabilityai/stable-diffusion-xl-base-1.0, publicados por el usuario SUSSYEATING. El objetivo es reducir el peso del UNet de SDXL (6,94 GB en FP16) manteniendo la fidelidad visual respecto al modelo original, mediante una tecnica propietaria de cuantizacion de pesos denominada ConvRot, basada en rotacion de Hadamard por bloques combinada con GPTQ secuencial en cuatro etapas. Se ofrecen tres niveles de precision: INT8, INT6 (W6A8) e INT4 (W4A8).

El modelo resuelve un problema practico de despliegue: SDXL Base ocupa demasiada VRAM para GPUs de consumo medio y para pipelines con varios checkpoints cargados simultaneamente. Con estos ficheros el UNet baja a 4,72 GB (INT8), 4,31 GB (INT6) y 3,77 GB (INT4), lo que permite ejecutar SDXL en tarjetas de 8-12 GB con margen para el VAE y los text encoders (que se mantienen en FP16).

La relevancia actual radica en que los checkpoints son single-file y cargan directamente en ComfyUI estandar (version 0.45.0 o superior) mediante los kernels CUDA nativos de comfy-kitchen, sin nodos adicionales ni desempaquetado. La licencia es CreativeML Open RAIL++-M, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion (SDXL Base 1.0) con cuantizacion ConvRot sobre capas Linear; Conv2d, text encoders (CLIP-L / OpenCLIP-G) y VAE en FP16 |
| Parametros totales | no disponible (el modelo base SDXL Base 1.0 no publica un recuento desglosado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion text-to-image; resolucion nativa 1024x1024) |
| Tipos de cuantizacion | INT8, INT6 (W6A8), INT4 (W4A8); GPTQ con rotacion Hadamard por bloques |
| Idiomas soportados | no disponible (prompts en lenguaje natural; SDXL Base soporta principalmente ingles) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | safetensors single-file para ComfyUI (`diffusion-single-file`) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento (PTQ) del UNet de SDXL Base 1.0. La tecnica ConvRot aplica una rotacion de Hadamard por bloques antes de la cuantizacion, lo que reduce los valores atipicos en las activaciones y mejora la estabilidad del rango de cuantizacion. Sobre esa base se aplica un GPTQ secuencial en cuatro etapas con orden de activaciones (`H_qq`), busqueda de clip por fila ponderada por la Hessiana para INT8, busqueda de escala de grupo FP8 a traves de la rejilla, refinamiento de codigos por descenso de coordenadas amortiguado, codebooks Lloyd-Max y una correccion acumulativa de sesgo por deriva de activaciones.

Las capas Conv2d, los text encoders CLIP-L y OpenCLIP-G y el VAE permanecen sin cuantizar en FP16. De las 739 capas Linear del UNet, en INT8 se cuantizan las 739; en INT6 e INT4 se cuantizan 658 y las 81 restantes (capas pequenas con `K=640` y la clave de deteccion de arquitectura `to_k`) se mantienen en ConvRot INT8 porque los kernels `w6a8`/`w4a8` de comfy-kitchen requieren `K % 256 == 0`. No se dispone de informacion sobre el dataset de calibracion ni sobre el numero de muestras utilizado.

## Capacidades

- Generacion de imagenes text-to-image a 1024x1024 con el mismo comportamiento que SDXL Base 1.0.
- Tres niveles de precision intercambiables segun el compromiso calidad/VRAM deseado.
- Carga directa en ComfyUI estandar mediante el nodo `Load Checkpoint` (ComfyUI >= v0.45.0), sin nodos personalizados.
- Compatible con el ecosistema de ComfyUI (samplers, schedulers, LoRAs y controlnets que operen sobre SDXL Base).
- Soporte de negative prompts, CFG y resoluciones SDXL estandar.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video: es exclusivamente un modelo de difusion para imagen.
- Capacidad multilingue limitada al comportamiento del text encoder de SDXL Base (predominantemente ingles).

## Casos de uso

- Despliegue de SDXL en GPUs de consumo: con el checkpoint INT4 (3,77 GB) el UNet cabe en tarjetas de 8 GB junto con VAE y text encoders en FP16, permitiendo generar a 1024x1024 en equipos donde el FP16 no entra.
- Pipelines con multiples checkpoints: al reducir el peso por modelo, se pueden mantener cargados SDXL Base, Refiner y variantes Lightning/Turbo del mismo autor en una sola GPU.
- Servicios de generacion de imagenes con presupuesto de VRAM ajustado: el INT8 ofrece la mayor fidelidad (cosine 0,99459) con un 32 % menos de peso, adecuado para APIs donde la calidad es prioritaria.
- Prototipado rapido en ComfyUI: al ser single-file y cargar sin nodos extra, sirve para iterar sobre flujos de trabajo SDXL en entornos con recursos limitados.
- Fine-tuning o LoRA sobre base cuantizada: util para experimentar con adaptadores sobre una base mas ligera, aunque la cuantizacion puede limitar la compatibilidad de algunos entrenamientos.
- Evaluacion comparativa de tecnicas de cuantizacion: los informes de metricas incluidos (cosine, SSIM, PSNR) permiten reproducir la comparacion frente a FP16 con el script `verify_sdxl_quant.py`.
- Generacion por lotes en produccion con throughput moderado: los tiempos medidos (4,76 s/imagen en INT8, 5,32 s en INT6, 5,40 s en INT4, en caliente) son compatibles con colas de trabajo no interactivas.

## Benchmarks y rendimiento

Metricas medidas sobre 8 prompts a 1024x1024 en ComfyUI v0.45.3 frente al FP16 sin cuantizar (`sd_xl_base_1.0.safetensors`). Referencia BF16 sin cuantizar: cosine 0,99186 (min 0,96847), SSIM 0,94269 (min 0,85051), PSNR 32,20 dB (min 26,31 dB).

| Nivel de precision | Cosine media / min | SSIM media / min | PSNR media / min | Velocidad en caliente |
|---|---|---|---|---|
| Full INT8 ConvRot | 0,99459 / 0,98156 | 0,95612 / 0,89355 | 33,28 / 27,24 dB | 4,76 s/imagen |
| Full INT6 ConvRot | 0,99381 / 0,98645 | 0,95011 / 0,91579 | 32,19 / 28,54 dB | 5,32 s/imagen |
| Full INT4 ConvRot | 0,97411 / 0,96053 | 0,87257 / 0,82174 | 26,18 / 22,86 dB | 5,40 s/imagen |

No se han publicado resultados de benchmarks estandar (FID, CLIP score) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el UNet ocupa 4,72 GB (INT8), 4,31 GB (INT6) y 3,77 GB (INT4); a ello hay que sumar VAE y text encoders en FP16 (no cuantizados), por lo que el consumo total de inferencia supera el peso del checkpoint.
- GPU recomendadas: no se especifican en la informacion proporcionada; por tamano, tarjetas de 8-12 GB pueden alojar el INT4/INT6 con margen limitado, y 16 GB o mas son recomendables para INT8 con comodidad.
- Cabe en GPU de consumo: el INT4 (3,77 GB) es el candidato mas claro para GPUs de 8 GB; el INT8 requiere al menos 8-12 GB segun resolucion y overhead de ComfyUI.
- Despliegue: ComfyUI >= v0.45.0 con kernels nativos de comfy-kitchen (CUDA). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion en este formato.
- Latencia: 4,76 s/imagen (INT8), 5,32 s/imagen (INT6) y 5,40 s/imagen (INT4) en caliente, segun las mediciones del autor; no se especifica el hardware utilizado.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDXL Base 1.0 ConvRot INT8 | no disponible | 1024x1024 | 4,72 GB | Open RAIL++-M | Hugging Face (este repo) |
| SDXL Base 1.0 ConvRot INT6 | no disponible | 1024x1024 | 4,31 GB | Open RAIL++-M | Hugging Face (este repo) |
| SDXL Base 1.0 ConvRot INT4 | no disponible | 1024x1024 | 3,77 GB | Open RAIL++-M | Hugging Face (este repo) |
| stabilityai/stable-diffusion-xl-base-1.0 (FP16) | no disponible | 1024x1024 | 6,94 GB | Open RAIL++-M | Hugging Face |
| SUSSYEATING/SDXL-Refiner-1.0-ConvRot | no disponible | 1024x1024 | no disponible | Open RAIL++-M | Hugging Face |
| SUSSYEATING/SDXL-Lightning-ConvRot | no disponible | 1024x1024 | no disponible | Open RAIL++-M | Hugging Face |
| SUSSYEATING/SDXL-Turbo-ConvRot | no disponible | 1024x1024 | no disponible | Stability AI Community License | Hugging Face |

## Limitaciones y advertencias

- La cuantizacion INT4 degrada notablemente la fidelidad: SSIM media 0,87257 y PSNR 26,18 dB, con minimos de 0,82174 y 22,86 dB; para produccion con exigencia visual se recomienda INT8 o INT6.
- Los text encoders y el VAE no estan cuantizados, por lo que el ahorro de VRAM total es menor que la reduccion del UNet.
- Las 81 capas pequenas (`K=640`) permanecen en INT8 en todas las variantes, lo que limita el ahorro adicional en INT6 e INT4.
- Requiere ComfyUI >= v0.45.0 y kernels comfy-kitchen; no es compatible con versiones anteriores ni con otros runners sin conversion.
- Licencia CreativeML Open RAIL++-M: incluye restricciones de uso basadas en el uso (Use-Based Restrictions) y obliga a propagar LICENSE.md y NOTICE en cualquier redistribucion.
- Riesgo de sesgos y alucinaciones visuales heredado del modelo base SDXL 1.0; no se documentan evaluaciones de sesgo en esta ficha.
- Soporte idiomatico limitado al comportamiento del text encoder de SDXL Base (predominantemente ingles); no se declaran idiomas soportados.
- No se especifican el dataset de calibracion ni el hardware de las mediciones, lo que dificulta reproducir los tiempos reportados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SUSSYEATING/SDXL-Base-1.0-ConvRot
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- SDXL Refiner ConvRot: https://huggingface.co/SUSSYEATING/SDXL-Refiner-1.0-ConvRot
- SDXL Lightning ConvRot: https://huggingface.co/SUSSYEATING/SDXL-Lightning-ConvRot
- SDXL Turbo ConvRot: https://huggingface.co/SUSSYEATING/SDXL-Turbo-ConvRot
- Licencia: https://huggingface.co/SUSSYEATING/SDXL-Base-1.0-ConvRot/blob/main/LICENSE.md
- Aviso de atribuciones: https://huggingface.co/SUSSYEATING/SDXL-Base-1.0-ConvRot/blob/main/NOTICE
- Script de verificacion: https://huggingface.co/SUSSYEATING/SDXL-Base-1.0-ConvRot/blob/main/scripts/verify_sdxl_quant.py
- Informe INT8: https://huggingface.co/SUSSYEATING/SDXL-Base-1.0-ConvRot/blob/main/metrics/g4_base_int8_summary.json
- Informe INT6: https://huggingface.co/SUSSYEATING/SDXL-Base-1.0-ConvRot/blob/main/metrics/g4_base_int6_summary.json
- Informe INT4: https://huggingface.co/SUSSYEATING/SDXL-Base-1.0-ConvRot/blob/main/metrics/g4_base_int4_summary.json
