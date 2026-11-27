# SUSSYEATING/SDXL-ConvRot

## Resumen

SDXL-ConvRot es una familia de checkpoints cuantizados del modelo de difusion text-to-image Stable Diffusion XL Base 1.0, publicada por el usuario SUSSYEATING en Hugging Face. El modelo original de Stability AI se ha recomprimido en tres niveles de precision (INT8, INT6 e INT4) mediante una tecnica propietaria denominada ConvRot, que combina rotacion de Hadamard por bloques, GPTQ secuencial en cuatro etapas y correccion de deriva de activaciones. El resultado son ficheros unicos en formato safetensors que se cargan directamente en ComfyUI sin nodos adicionales.

El objetivo es reducir el peso del UNet de SDXL manteniendo la fidelidad visual respecto al modelo FP16 original. Los checkpoints pasan de los 6,94 GB del FP16 a 4,72 GB (INT8), 4,31 GB (INT6) o 3,77 GB (INT4), lo que facilita su despliegue en GPU con VRAM limitada sin renunciar a la calidad de forma drastica. La cuantizacion afecta exclusivamente a las capas lineales del UNet; las convoluciones, los text encoders CLIP-L y OpenCLIP-G y el VAE permanecen en FP16.

La relevancia actual del modelo radica en que la cuantizacion de difusion esta madurando lo suficiente como para integrarse en flujos de produccion con ComfyUI nativo (version 0.45.0 o superior) y kernels CUDA propios (`comfy-kitchen`), lo que reduce la barrera de entrada para ejecutar SDXL en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion (SDXL Base 1.0) con cuantizacion de capas lineales; text encoders CLIP-L y OpenCLIP-G en FP16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | INT8 (W8A8), INT6 (W6A8), INT4 asimetrica (W4A8); GPTQ con ConvRot |
| Idiomas soportados | no disponible (los prompts dependen del text encoder CLIP, predominantemente ingles) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

El modelo base es Stable Diffusion XL Base 1.0, un modelo de difusion latente con arquitectura UNet y dos text encoders (CLIP-L y OpenCLIP-G). Sobre esta base, el autor aplica una pipeline de cuantizacion post-entrenamiento denominada ConvRot, que consta de cuatro componentes: rotacion de Hadamard por bloques (block Hadamard rotation) para reducir outliers en las activaciones; GPTQ secuencial en cuatro etapas con orden de activaciones (`H_qq`); busqueda de recorte ponderada por Hessiana por fila para INT8 y busqueda de escala de grupo en FP8 con refinamiento por descenso de coordenadas amortiguado y codebooks Lloyd-Max para INT6 e INT4; y una correccion de sesgo por deriva acumulada de activaciones.

Las 739 capas lineales del UNet se cuantizan en el nivel de precision elegido, con la excepcion de 81 capas pequenas (`K=640` y la clave de deteccion de arquitectura `to_k`) que permanecen en INT8 porque los kernels `w6a8`/`w4a8` de `comfy-kitchen` requieren `K % 256 == 0`. Las capas Conv2d, los text encoders y el VAE no se cuantizan y se mantienen en FP16. No se dispone de informacion sobre el dataset de calibracion utilizado ni sobre el numero de muestras empleadas.

## Capacidades

- Generacion de imagenes text-to-image a 1024x1024 con el mismo pipeline que SDXL Base 1.0.
- Compatible con el nodo nativo `Load Checkpoint` de ComfyUI (version 0.45.0 o superior) sin nodos extra.
- Carga directa de los tres niveles de precision (INT8, INT6, INT4) con kernels CUDA `comfy-kitchen`.
- Soporta prompts positivos y negativos, CFG, schedulers y samplers estandar de SDXL.
- Capacidad de img2img, inpainting y controlnet en la medida en que el flujo de ComfyUI lo permita con checkpoints single-file.
- Compatible con el ecosistema de LoRAs y adaptadores de SDXL, aunque no se documenta compatibilidad explicita con todos ellos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada; es exclusivamente generativo de imagen.

## Casos de uso

- Generacion de imagenes en estaciones de trabajo con GPU de 8 GB de VRAM: el checkpoint INT4 (3,77 GB) permite cargar SDXL en tarjetas consumer donde el FP16 (6,94 GB) no cabria junto con el VAE y los text encoders.
- Prototipado rapido de conceptos visuales: con el checkpoint INT8 y tiempos de 4,76 s por imagen (medidos en el entorno del autor), se pueden iterar prompts en sesiones de diseno sin esperas largas.
- Produccion de assets para videojuegos o ilustracion: el checkpoint INT6 ofrece un equilibrio entre calidad (SSIM medio 0,95011) y tamano (4,31 GB), adecuado para pipelines por lotes en servidores con varias GPU.
- Despliegue en entornos ComfyUI existentes: al ser single-file y cargarse con el nodo nativo, se integra en flujos ya montados sin reescribir grafos ni instalar custom nodes.
- Investigacion sobre cuantizacion de modelos de difusion: los informes de metricas incluidos (`metrics/g4_base_int*_summary.json`) permiten reproducir y comparar el impacto de cada nivel de precision.
- Servicios de generacion bajo demanda con restricciones de VRAM: el checkpoint INT4 reduce el footprint del UNet en un 45,6 % respecto al FP16, lo que permite multiplexar varias instancias en una misma GPU.
- Evaluacion comparativa de calidad visual: las imagenes de comparacion incluidas (`comparisons/base_p*_s42_4way.png`) sirven como referencia para decidir que nivel de precision usar en cada caso.

## Benchmarks y rendimiento

Metricas reportadas por el autor sobre 8 prompts a 1024x1024 en ComfyUI v0.45.3, comparadas contra el FP16 sin cuantizar:

| Nivel | Cosine medio / min | SSIM medio / min | PSNR medio / min | Velocidad en caliente |
|---|---|---|---|---|
| Referencia BF16 vs FP16 | 0,99186 / 0,96847 | 0,94269 / 0,85051 | 32,20 / 26,31 dB | no disponible |
| Full INT8 ConvRot | 0,99459 / 0,98156 | 0,95612 / 0,89355 | 33,28 / 27,24 dB | 4,76 s/imagen |
| Full INT6 ConvRot | 0,99381 / 0,98645 | 0,95011 / 0,91579 | 32,19 / 28,54 dB | 5,32 s/imagen |
| Full INT4 ConvRot | 0,97411 / 0,96053 | 0,87257 / 0,82174 | 26,18 / 22,86 dB | 5,40 s/imagen |

No se han publicado resultados de benchmarks estandar (FID, CLIP score, MMLU u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el UNet cuantizado ocupa entre 3,77 GB (INT4) y 4,72 GB (INT8); a esto hay que sumar el VAE, los text encoders en FP16 y el espacio de activaciones, por lo que se recomienda al menos 8 GB de VRAM para INT4 y 10-12 GB para INT8 en 1024x1024.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100 para despliegues de servidor.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas para INT4 y con 10-12 GB para INT8/INT6.
- Opciones de despliegue: ComfyUI >= v0.45.0 con kernels `comfy-kitchen` (unico entorno documentado por el autor); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a modelos de difusion.
- Latencia y throughput: 4,76 s/imagen (INT8), 5,32 s/imagen (INT6) y 5,40 s/imagen (INT4) en el entorno de medida del autor; no se especifica la GPU empleada.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDXL-ConvRot INT8 | 4,72 GB (UNet cuantizado) | no aplica | SSIM 0,95612 vs FP16 | Open RAIL++-M | Hugging Face |
| SDXL-ConvRot INT4 | 3,77 GB (UNet cuantizado) | no aplica | SSIM 0,87257 vs FP16 | Open RAIL++-M | Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | 6,94 GB FP16 | no aplica | referencia | Open RAIL++-M | Hugging Face |
| SUSSYEATING/SDXL-Lightning-ConvRot | no disponible | no aplica | no disponible | Open RAIL++-M | Hugging Face |
| SUSSYEATING/SDXL-Turbo-ConvRot | no disponible | no aplica | no disponible | Stability AI Community License | Hugging Face |

## Limitaciones y advertencias

- La cuantizacion INT4 degrada la fidelidad de forma notable: SSIM medio 0,87257 y PSNR medio 26,18 dB, con minimos de 0,82174 y 22,86 dB respectivamente, lo que puede traducirse en artefactos visibles en detalles finos.
- El modelo solo se ha validado en ComfyUI >= v0.45.0 con kernels `comfy-kitchen`; otros runners (A1111, Diffusers, InvokeAI) no estan documentados y pueden no cargar los pesos correctamente.
- Las 81 capas con `K=640` permanecen en INT8 en todas las variantes, por lo que la reduccion de tamano no es proporcional al numero de capas cuantizadas.
- Los text encoders estan entrenados predominantemente en ingles; el rendimiento con prompts en castellano u otros idiomas puede ser inferior y no se documenta soporte multilingue.
- Riesgo de sesgos y alucinacion visual inherente a SDXL Base 1.0: el modelo puede generar contenido estereotipado o inexacto segun el prompt.
- La licencia CreativeML Open RAIL++-M impone restricciones de uso basadas en casos (Use-Based Restrictions) y obliga a propagar la licencia y el fichero NOTICE en cualquier redistribucion.
- No se documenta el dataset de calibracion ni el procedimiento exacto de generacion de los codebooks, lo que limita la reproducibilidad completa de la cuantizacion.
- El modelo tiene 193 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/SUSSYEATING/SDXL-ConvRot
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Repositorio relacionado (Refiner): https://huggingface.co/SUSSYEATING/SDXL-Refiner-1.0-ConvRot
- Repositorio relacionado (Lightning): https://huggingface.co/SUSSYEATING/SDXL-Lightning-ConvRot
- Repositorio relacionado (Turbo): https://huggingface.co/SUSSYEATING/SDXL-Turbo-ConvRot
- Licencia: https://huggingface.co/SUSSYEATING/SDXL-ConvRot/blob/main/LICENSE.md
- Aviso de atribuciones: https://huggingface.co/SUSSYEATING/SDXL-ConvRot/blob/main/NOTICE
