# SUSSYEATING/SDXL-ConvRot

## Resumen

SDXL-ConvRot es una familia de checkpoints de Stable Diffusion XL (SDXL) cuantizados con la técnica ConvRot, publicados por el usuario SUSSYEATING en Hugging Face. El repositorio incluye versiones cuantizadas del modelo base SDXL 1.0, del refiner SDXL 1.0 y de SDXL-Lightning de 4 pasos, en formatos INT8, híbridos W6/W8 e INT6. El objetivo es reducir el tamaño de los pesos manteniendo la calidad visual lo más cerca posible del checkpoint FP16 original, para facilitar el despliegue en ComfyUI con menor huella de VRAM.

La cuantización se aplica únicamente a las capas lineales del UNet (hasta 739 capas en el caso del base), mientras que los text encoders CLIP y el VAE se mantienen sin cuantizar. Se incluye una corrección de sesgo de calibración denominada "Card 1 calibration bias correction". Los checkpoints se distribuyen como archivos single-file `.safetensors` listos para colocar en `models/checkpoints/` de ComfyUI, además de variantes empaquetadas de 6 bits que requieren un script de desempaquetado.

El modelo está pensado para usuarios de ComfyUI que quieran ejecutar SDXL con requisitos de memoria reducidos. La licencia es openrail++, heredada de los modelos base de Stability AI, y el repositorio ocupa 28,1 GB en total. No se han publicado datos sobre idiomas soportados ni sobre el proceso de entrenamiento más allá de la cuantización post-entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusión (SDXL) con text encoders CLIP; cuantización ConvRot sobre capas lineales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (all-lin), híbrido W6/W8 (top120), INT6 (top0), INT6 top80; CLIP y VAE sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | openrail++ |
| Formato de pesos | safetensors (single-file para ComfyUI; variantes packed para INT6) |

## Arquitectura y entrenamiento

El modelo parte de SDXL, una arquitectura de difusión latente con un UNet como red principal y dos text encoders (CLIP). ConvRot es una técnica de cuantización post-entrenamiento que transforma los pesos de las capas lineales del UNet a precisión reducida (INT8 o INT6) aplicando una rotación de convolución que reduce el error de cuantización. En el caso del base se cuantizan las 739 capas lineales; en el refiner, 484; y en Lightning, 659 de 739 (dejando las top-80 en FP16 en la variante top80).

No se dispone de información sobre el dataset de entrenamiento original de SDXL ni sobre el número de tokens, ya que este repositorio no reentrena el modelo, sino que aplica cuantización sobre checkpoints existentes. La innovación técnica principal es la corrección de sesgo de calibración ("Card 1 calibration bias correction") y la provisión de variantes híbridas que combinan capas INT6 e INT8 para equilibrar tamaño y fidelidad. Las variantes INT6 empaquetadas requieren el script `scripts/unpack_int6.py` para su desempaquetado antes de usarse en ComfyUI.

## Capacidades

- Generación de imágenes texto-a-imagen con SDXL Base 1.0, con resolución nativa de 1024×1024.
- Refinamiento de imágenes con SDXL Refiner 1.0, para mejorar detalles en una segunda pasada.
- Generación rápida con SDXL-Lightning de 4 pasos, que reduce el número de pasos de muestreo necesarios.
- Compatibilidad directa con ComfyUI como checkpoint single-file en `models/checkpoints/`.
- Variantes INT8 listas para usar sin desempaquetado; variantes INT6 packed requieren el script de desempaquetado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión más allá de la generación de imágenes.
- Capacidades multilingües: no disponibles (los prompts dependen del text encoder CLIP original, pero no se especifica cobertura idiomática).

## Casos de uso

- Generación de imágenes en ComfyUI con VRAM limitada: los checkpoints INT8 reducen el tamaño del UNet entre un 23,6% y un 32,0% respecto a FP16, lo que permite cargar SDXL en GPUs con menos memoria sin cambiar el flujo de trabajo.
- Prototipado rápido de pipelines texto-a-imagen: la variante Lightning de 4 pasos con cuantización INT8 permite iterar con tiempos de generación de aproximadamente 0,35 s por imagen en la GPU de evaluación (G4), frente a 0,15 s en FP16.
- Despliegue en entornos con almacenamiento restringido: las variantes INT6 packed reducen el tamaño hasta un 40,0% (4,16 GB frente a 6,94 GB), útiles para distribuir checkpoints en contenedores o sistemas con cuotas de disco.
- Refinamiento de imágenes en dos etapas: el refiner cuantizado INT8 (4,64 GB frente a 6,08 GB, -23,6%) permite ejecutar el pipeline base+refiner con menor huella de memoria.
- Evaluación de técnicas de cuantización: el repositorio incluye métricas (CosMean, SSIM, PSNR) y comparaciones visuales que permiten estudiar el impacto de INT8, W6/W8 e INT6 en la calidad de generación.
- Uso educativo o de investigación sobre cuantización post-entrenamiento en modelos de difusión: los informes JSON en `metrics/` y los scripts de desempaquetado facilitan reproducir y analizar los resultados.

## Benchmarks y rendimiento

Los datos de evaluación comparan las imágenes generadas por los checkpoints cuantizados frente al checkpoint FP16 sin cuantizar, usando 8 prompts a 1024×1024 en una GPU G4 con ComfyUI v0.45.0. Se incluye la deriva BF16 vs FP16 como referencia de equivalencia visual.

| Modelo y variante | CosMean / Min | SSIM Mean / Min | PSNR Mean / Min | Ref BF16 (Cos / SSIM / PSNR) | Velocidad media (warm) |
|---|---|---|---|---|---|
| Base INT8 (all-lin) | 0,99433 / 0,98653 | 0,95213 / 0,91965 | 32,82 / 30,11 dB | 0,99186 / 0,94269 / 32,20 dB | 4,63 s (FP16: 2,90 s) |
| Base Hybrid top120 W6/W8 | 0,95784 / 0,89655 | 0,84762 / 0,72200 | 24,78 / 20,07 dB | 0,99186 / 0,94269 / 32,20 dB | 4,69 s |
| Base INT6 top0 (W6/A8) | 0,95743 / 0,89424 | 0,84064 / 0,72535 | 24,57 / 20,38 dB | 0,99186 / 0,94269 / 32,20 dB | 4,62 s |
| Lightning INT8 top80 | 0,99401 / 0,97584 | 0,95126 / 0,89363 | 33,42 / 29,28 dB | 0,99348 / 0,94868 / 32,76 dB | 0,35 s (FP16: 0,15 s) |
| Lightning INT6 top80 | 0,97686 / 0,95608 | 0,88127 / 0,83725 | 26,20 / 22,48 dB | 0,99348 / 0,94868 / 32,76 dB | 0,35 s |
| Lightning INT6 top0 | 0,97232 / 0,94586 | 0,86867 / 0,81594 | 26,20 / 22,48 dB | 0,99348 / 0,94868 / 32,76 dB | 0,37 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo de generación de imágenes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño de los archivos va de 4,16 GB (INT6 packed) a 5,04 GB (Lightning INT6 top80), y el repo completo ocupa 28,1 GB.
- GPU recomendadas: no se especifican modelos concretos; la evaluación se realizó en una GPU denominada "G4" (no se detalla el modelo exacto).
- Cabe en GPU consumer: no confirmado en la información disponible; los tamaños de archivo reducidos sugieren que las variantes INT8 e INT6 podrían caber en GPUs con 8-12 GB de VRAM, pero no se aporta confirmación.
- Opciones de despliegue: ComfyUI (formato single-file en `models/checkpoints/`); las variantes INT6 packed requieren `scripts/unpack_int6.py` antes de su uso.
- Latencia y throughput: en la GPU G4 de evaluación, Base INT8 tarda 4,63 s de media (FP16: 2,90 s) y Lightning INT8 top80 tarda 0,35 s (FP16: 0,15 s) por imagen a 1024×1024.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDXL-ConvRot (este) | no disponible | no disponible | CosMean 0,99433 (Base INT8); PSNR 32,82 dB | openrail++ | Hugging Face, ComfyUI |
| SDXL Base 1.0 (FP16) | no disponible | no disponible | Referencia sin cuantizar (tamaño 6,94 GB) | openrail++ | Hugging Face |
| SDXL Refiner 1.0 (FP16) | no disponible | no disponible | Referencia sin cuantizar (tamaño 6,08 GB) | openrail++ | Hugging Face |
| SDXL-Lightning 4-step (FP16) | no disponible | no disponible | Referencia sin cuantizar (tamaño 6,94 GB) | openrail++ | Hugging Face |

No se dispone de datos de otros modelos de cuantización comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: en Base INT8 el PSNR medio es 32,82 dB y el SSIM medio 0,95213, ligeramente por debajo de la referencia BF16 (32,20 dB y 0,94269), pero las variantes INT6 caen a PSNR de 24,57-26,20 dB y SSIM de 0,84-0,88, lo que indica pérdida de calidad visual apreciable.
- Las variantes híbridas W6/W8 e INT6 top0 presentan una correlación coseno mínima de 0,894-0,896, frente a 0,986 en INT8, lo que refleja mayor divergencia en casos desfavorables.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos, pero al derivar de SDXL hereda los sesgos del dataset original de Stability AI, no disponible en esta ficha.
- Los idiomas soportados no están documentados; el comportamiento multilingüe depende del text encoder CLIP original.
- La licencia openrail++ impone restricciones de uso comercial; es necesario revisar los términos de Stability AI antes de desplegar en producción.
- Las variantes INT6 packed no son plug-and-play: requieren ejecutar `scripts/unpack_int6.py` antes de cargarlas en ComfyUI.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- La fecha de creación indicada (2026-11-15) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad y procedencia de los archivos.

## Enlaces

- Hugging Face: https://huggingface.co/SUSSYEATING/SDXL-ConvRot
- SDXL Turbo ConvRot (repositorio separado): https://huggingface.co/SUSSYEATING/SDXL-Turbo-ConvRot
- SDXL Base 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- SDXL Refiner 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0
- SDXL-Lightning: https://huggingface.co/ByteDance/SDXL-Lightning
