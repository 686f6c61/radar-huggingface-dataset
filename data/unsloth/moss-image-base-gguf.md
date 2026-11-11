# unsloth/MOSS-Image-Base-GGUF

## Resumen

MOSS-Image-Base-GGUF es la versión cuantizada en formato GGUF del modelo de generación de imágenes texto-a-imagen MOSS-Image-Base, desarrollado por OpenMOSS y cuantizado por Unsloth. Se trata de un transformer de 5.082.308.624 parámetros (aproximadamente 5,1 mil millones) especializado en síntesis de imágenes a partir de descripciones en lenguaje natural, secuencias de etiquetas y layouts en formato JSON que permiten controlar la posición del texto y la disposición de los objetos en la imagen generada.

La relevancia de esta publicación radica en que Unsloth aplica su metodología Dynamic 2.0 de cuantización de precisión mixta, donde el tipo de cada capa se selecciona mediante un escaneo de sensibilidad medido. Esto permite ejecutar un modelo de 5,1B parámetros en hardware de consumo, con el archivo recomendado UD-Q4_K_XL ocupando solo 3,42 GB y manteniendo un LPIPS de 0,179 frente al transformer en bf16. El repositorio completo ocupa 33,6 GB e incluye múltiples niveles de cuantización, desde Q3_K_XL hasta BF16.

El modelo soporta únicamente inglés y chino, se distribuye bajo licencia Apache 2.0 y está pensado para su uso con stable-diffusion.cpp (build master-975 o superior) y Unsloth Studio, tanto en CPU como en Mac y GPU. Solo contiene el transformer; el VAE y el tokenizer deben tomarse del repositorio FP8 de Unsloth, y el codificador de texto se ejecuta desde el GGUF de Qwen3.5-9B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión texto-a-imagen (text-to-image) |
| Parámetros totales | 5.082.308.624 (aproximadamente 5,1B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | UD-Q3_K_XL, Q4_K_M, UD-Q4_K_XL, UD-Q5_K_XL, UD-Q6_K_XL, Q8_0, BF16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

MOSS-Image-Base es un transformer de difusión para generación de imágenes a partir de texto, con 5.082.308.624 parámetros. El modelo base pertenece a la familia MOSS-Image de OpenMOSS y admite tres modos de condicionamiento: prompts en lenguaje natural, secuencias de etiquetas y layouts en formato JSON para controlar la colocación de texto y la disposición de objetos. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible en la documentación proporcionada.

La innovación técnica principal de esta publicación es la cuantización Dynamic 2.0 de Unsloth, que asigna a cada capa un tipo de precisión distinto según un escaneo de sensibilidad medido, en lugar de aplicar un esquema uniforme. Los archivos `UD-` son de precisión mixta. Según la model card, MOSS-Image es muy sensible a cambios numéricos mínimos: alterar un solo paso de redondeo bf16 en una capa ya desplaza las renders entre 0,053 y 0,063 LPIPS de media, por lo que las diferencias cercanas a ese umbral reflejan cambios de composición más que pérdida de calidad. La tabla de precisión se midió dequantizando los pesos GGUF dentro del pipeline de referencia, de modo que mide únicamente el efecto de los pesos.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts en lenguaje natural, con resolución de 1024x1024 por defecto.
- Condicionamiento mediante secuencias de etiquetas (tag sequences).
- Control de layout mediante JSON, permitiendo especificar la colocación de texto y la disposición de objetos en la imagen.
- Renderizado de texto dentro de la imagen, incluyendo carteles y letreros (la model card incluye un ejemplo de storefront sign con la palabra "UNSLOTH").
- Generación de escenas complejas con múltiples elementos, iluminación volumétrica, profundidad de campo y gradación de color.
- Retratos en primer plano y detalles finos como manos (incluidos como prompts de validación en la tabla de precisión).
- Ejecución en CPU, Mac y GPU mediante stable-diffusion.cpp y Unsloth Studio.
- Soporte de dos idiomas en los prompts: inglés y chino.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; no disponibles.

## Casos de uso

- Generación de ilustraciones para blogs y medios: el modelo acepta descripciones largas y detalladas (paisajes, escenas cinematográficas, iluminación concreta) y produce imágenes a 1024x1024 en 50 pasos con CFG 3, adecuadas para acompañar artículos técnicos sin depender de servicios en la nube.
- Creación de carteles y letreros con texto legible: gracias al condicionamiento por JSON y a la capacidad de renderizar texto en la imagen, se pueden generar mockups de escaparates, señales o banners con cadenas de texto específicas.
- Prototipado rápido de conceptos visuales en equipos de diseño: con el archivo UD-Q4_K_XL de 3,42 GB, un portátil con GPU de consumo puede iterar sobre variaciones de un prompt en local, reduciendo la latencia de iteración frente a APIs externas.
- Generación de material para marketing en inglés y chino: el soporte bilingüe permite producir variantes de una misma campaña para ambos mercados con el mismo modelo.
- Control de composición para maquetación editorial: el modo de layout JSON permite colocar objetos y texto en posiciones definidas, útil para generar imágenes que deben encajar en una retícula concreta.
- Pruebas de integración en pipelines de CI/CD de stable-diffusion.cpp: el formato GGUF y la CLI `sd-cli` permiten automatizar la generación de imágenes de prueba con semilla fija (`-s 42`) y verificar regresiones visuales comparando LPIPS y SSIM contra una referencia bf16.
- Investigación sobre cuantización de modelos de difusión: la tabla de LPIPS/SSIM por archivo permite estudiar el compromiso entre tamaño (2,84 GB a 10,17 GB) y fidelidad frente a bf16, con una metodología reproducible sobre 12 prompts.

## Benchmarks y rendimiento

La model card proporciona métricas de fidelidad de la cuantización frente al transformer en bf16 (LPIPS alex, menor es mejor; SSIM, mayor es mejor), medidas con el mismo prompt, semilla, ruido inicial y embeddings de texto bf16, a 1024x1024, 50 pasos y CFG 3, sobre 12 prompts (8 generales y 4 reservados: retrato en primer plano, cartel de escaparate con texto, manos haciendo origami y una descripción larga de escena).

| Archivo | Tamaño | Bits por peso | LPIPS medio vs bf16 | LPIPS máximo vs bf16 | SSIM vs bf16 |
|---|---|---|---|---|---|
| MOSS-Image-Base-UD-Q3_K_XL.gguf | 2,84 GB | 4,47 | 0,280 | 0,436 | 0,736 |
| MOSS-Image-Base-Q4_K_M.gguf | 3,20 GB | 5,04 | 0,293 | 0,415 | 0,731 |
| MOSS-Image-Base-UD-Q4_K_XL.gguf | 3,42 GB | 5,38 | 0,179 | 0,418 | 0,826 |
| MOSS-Image-Base-UD-Q5_K_XL.gguf | 3,95 GB | 6,22 | 0,138 | 0,427 | 0,863 |
| MOSS-Image-Base-UD-Q6_K_XL.gguf | 4,53 GB | 7,13 | 0,102 | 0,339 | 0,889 |
| MOSS-Image-Base-Q8_0.gguf | 5,48 GB | 8,63 | 0,081 | 0,377 | 0,917 |
| MOSS-Image-Base-BF16.gguf | 10,17 GB | 16,00 | 0,000 | 0,000 | 1,000 |

No se han publicado resultados de benchmarks de calidad de generación (FID, CLIP score, evaluaciones humanas) en la información disponible. Las únicas métricas disponibles son las de fidelidad de cuantización anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no especificada en la model card. Como referencia de tamaño de pesos, el transformer ocupa entre 2,84 GB (UD-Q3_K_XL) y 10,17 GB (BF16); a ello hay que sumar el codificador de texto Qwen3.5-9B en Q8_0 y el VAE, cuyos requisitos no se detallan.
- GPU recomendadas: no disponibles de forma explícita. La model card menciona ejecución en CPU, Mac y GPU, y que en GPU CUDA Unsloth Studio usa por defecto el archivo INT8-ConvRot del repositorio FP8 (LPIPS 0,096).
- Compatibilidad con GPU de consumo: el archivo recomendado UD-Q4_K_XL (3,42 GB) está pensado para "la mayoría de máquinas", según la model card, lo que sugiere que cabe en GPUs de consumo, aunque no se enumeran modelos concretos.
- Opciones de despliegue: Unsloth Studio (pestaña Images, con motor stable-diffusion.cpp incluido) y stable-diffusion.cpp (build master-975 o superior) mediante la CLI `sd-cli`.
- Latencia y throughput: no disponibles. Los valores por defecto de generación son 1024x1024, 50 pasos, CFG 3 y shift 5.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad de generación ni de especificaciones de modelos comparables en la información proporcionada. La model card no incluye comparaciones con otros modelos texto-a-imagen. Como referencia interna de la propia familia, se puede comparar el modelo base frente a su variante SFT (MOSS-Image-SFT), mencionada en la model card como productora de resultados distintos en el ejemplo incluido, pero sin datos cuantitativos disponibles.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| MOSS-Image-Base (este, GGUF) | 5,08B | No disponible | Apache 2.0 | GGUF |
| MOSS-Image-SFT | No disponible | No disponible | No disponible | No disponible |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado con datos web, es previsible que herede sesgos de representación, pero no se aportan detalles.
- Riesgo de alucinación visual: no cuantificado. La model card advierte que MOSS-Image es extremadamente sensible a cambios numéricos mínimos (un solo paso de redondeo bf16 en una capa desplaza las renders entre 0,053 y 0,063 LPIPS), por lo que pequeñas variaciones de cuantización producen cambios de composición, no solo de calidad.
- Limitaciones de idioma: solo inglés y chino; no hay soporte documentado de castellano ni de otros idiomas.
- El repositorio contiene únicamente el transformer. Es obligatorio descargar el VAE y el tokenizer desde unsloth/MOSS-Image-Base-FP8 y el codificador de texto desde unsloth/Qwen3.5-9B-GGUF (Qwen3.5-9B-Q8_0.gguf); usar los archivos incorrectos o builds antiguos de stable-diffusion.cpp (anteriores a master-975) impedirá la ejecución.
- El archivo Q4_K_M estándar tiene peor fidelidad que UD-Q4_K_XL (LPIPS 0,293 frente a 0,179) pese a ser más pequeño; la model card recomienda explícitamente UD-Q4_K_XL para la mayoría de máquinas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las licencias de los componentes auxiliares (VAE, tokenizer, codificador Qwen3.5-9B) que no forman parte de este repositorio.
- En producción, la fidelidad frente a bf16 depende del archivo elegido; para resultados cercanos a bf16 hay que usar UD-Q6_K_XL (LPIPS 0,102) o Q8_0 (0,081), con mayor coste de almacenamiento y memoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unsloth/MOSS-Image-Base-GGUF
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio FP8 (VAE y tokenizer): https://huggingface.co/unsloth/MOSS-Image-Base-FP8
- Codificador de texto Qwen3.5-9B GGUF: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Unsloth (GitHub): https://github.com/unslothai/unsloth/
- Documentación de Unsloth Dynamic 2.0 GGUF: https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Discord de Unsloth: https://discord.gg/unsloth
- Documentación de Unsloth: https://docs.unsloth.ai/
- Paper referenciado (arXiv:2610.23374): https://arxiv.org/abs/2610.23374
