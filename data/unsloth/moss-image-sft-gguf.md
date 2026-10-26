# unsloth/MOSS-Image-SFT-GGUF

## Resumen

unsloth/MOSS-Image-SFT-GGUF es la versión cuantizada en formato GGUF de MOSS-Image-SFT, un modelo text-to-image de la familia MOSS-Image desarrollada por OpenMOSS. Se trata de un transformer de 5.082.308.624 parámetros (5,08 B) que genera imágenes de 1024x1024 a partir de prompts en lenguaje natural, secuencias de etiquetas y layouts en JSON para controlar la colocación de texto y la disposición de objetos. El modelo base está publicado con licencia Apache 2.0 y soporta inglés y chino, lo que lo hace especialmente útil para cartelería y rótulos con texto en ambos idiomas.

La aportación de Unsloth es la cuantización: aplica su metodología Unsloth Dynamic 2.0, en la que el tipo de cada capa se elige a partir de un escaneo de sensibilidad medido y de una matriz de importancia recogida durante la generación de imágenes. El resultado son ficheros `UD-` de precisión mixta que van desde 2,84 GB (UD-Q3_K_XL) hasta 10,17 GB (BF16), con métricas LPIPS y SSIM publicadas frente al transformer en bf16, de modo que el usuario puede elegir el compromiso calidad/tamaño con datos objetivos.

El interés práctico es que estos GGUF se ejecutan en CPU, Mac y GPU mediante Unsloth Studio o stable-diffusion.cpp, sin necesidad de una GPU de datacenter. Solo se distribuye el transformer: el VAE y el tokenizer deben tomarse del repositorio FP8 de Unsloth y el codificador de texto funciona con un Qwen3.5-9B en GGUF, también de Unsloth, lo que conviene tener en cuenta al planificar el espacio en disco y la memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer text-to-image de difusión (familia MOSS-Image), con VAE y tokenizer en carpetas separadas al estilo diffusers |
| Parámetros totales | 5.082.308.624 (5,08 B), solo el transformer |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | UD-Q3_K_XL (2,84 GB), Q4_K_M (3,20 GB), UD-Q4_K_XL (3,42 GB), UD-Q5_K_XL (3,95 GB), UD-Q6_K_XL (4,53 GB), Q8_0 (5,48 GB), BF16 (10,17 GB) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformer); VAE en safetensors y tokenizer en JSON en el repo FP8; codificador de texto Qwen3.5-9B en GGUF Q8_0 |
| Resolución y ajustes por defecto | 1024x1024, 50 pasos, CFG 3,0, shift 5 |
| Tamaño del repositorio | 33,6 GB |
| Descargas / likes | 14.630 descargas, 13 likes (en el momento de la consulta) |
| Fecha de publicación | 22 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión text-to-image de 5,08 B de parámetros. La inferencia se organiza como un pipeline tipo diffusers con tres piezas independientes: el transformer (los GGUF de este repositorio), un VAE y un tokenizer que se toman del repositorio `unsloth/MOSS-Image-SFT-FP8` —que replica byte a byte las carpetas upstream— y un codificador de texto Qwen3.5-9B ejecutado en GGUF `Q8_0`. El modelo acepta tres modalidades de prompt: lenguaje natural, secuencias de etiquetas y layouts en JSON para controlar la colocación del texto y la disposición de los objetos.

MOSS-Image-SFT es el resultado de un ajuste supervisado (SFT) sobre MOSS-Image-Base, manteniendo la misma arquitectura y el mismo pipeline de inferencia; según la model card, el SFT produce una agrupación de texto más clara y layouts más organizados. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La innovación técnica documentada en esta ficha no está en el entrenamiento, sino en la cuantización: Unsloth Dynamic 2.0 elige el tipo de cada capa mediante un escaneo de sensibilidad y una matriz de importancia recolectada durante la generación de imágenes, y publica la degradación medida (LPIPS/SSIM) frente al transformer en bf16 para cada fichero.

## Capacidades

- Generación de imágenes text-to-image a 1024x1024 con 50 pasos y CFG 3 por defecto.
- Renderizado de texto legible en inglés y chino dentro de la imagen (rótulos, carteles, señalética, pizarras).
- Control de composición mediante layouts en JSON, que permiten fijar la posición del texto y la disposición de los objetos.
- Soporte de secuencias de etiquetas (tag sequences) además del prompt en lenguaje natural, útil para prompts largos y estructurados.
- Reproducibilidad mediante semilla (`-s 42` en el ejemplo de la model card) y parámetros explícitos de pasos y escala CFG.
- Ejecución local en CPU, Mac y GPU mediante stable-diffusion.cpp (build master-975 o superior) y Unsloth Studio.
- Integración con un codificador de texto Qwen3.5-9B en GGUF, lo que permite sustituir o actualizar el encoder sin cambiar el transformer.
- Capacidades de agente, tool calling, razonamiento multi-paso, visión de entrada o audio: no disponibles (el modelo solo genera imágenes).

## Casos de uso

- Cartelería y rótulos con texto: el modelo está entrenado para renderizar texto legible en inglés y chino, de modo que se puede generar un letrero de tienda con una cadena concreta y usarlo como maqueta antes de producir el arte final. El ejemplo de la model card genera un rótulo con la palabra "UNSLOTH" en letras limpias.
- Maquetas de pizarras y diagramas: con layouts en JSON se puede fijar la posición de bloques de texto y objetos, lo que sirve para generar bocetos de whiteboards, esquemas de producto o interfaces conceptuales con una disposición controlada.
- Fotografía macro y de producto simulada: los prompts de ejemplo (abeja sobre girasol con granos de polen visibles) muestran que el modelo resuelve detalle fino; es adecuado para generar imágenes de catálogo o fondos fotorrealistas sin sesión de estudio.
- Ilustración conceptual y previsualización: para equipos de diseño que necesitan variantes rápidas de una escena (por ejemplo, un caballero con armadura grabada en un patio de castillo) con una semilla fija para iterar sobre la misma composición.
- Generación local sin GPU de datacenter: al ejecutarse en CPU y Mac a través de stable-diffusion.cpp con ficheros de 3,42 GB (UD-Q4_K_XL), encaja en flujos de trabajo de portátil u oficina donde no hay acelerador dedicado.
- Procesamiento por lotes en pipelines propios: la CLI `sd-cli` acepta prompt, resolución, semilla y fichero de salida, por lo que se puede orquestar la generación de cientos de imágenes desde un script sin interfaz gráfica.
- Prototipado de assets con control de calidad medido: al existir una tabla LPIPS/SSIM por fichero, un equipo puede fijar un umbral de calidad (por ejemplo, UD-Q6_K_XL con LPIPS 0,106) y elegir la cuantización que lo cumpla con el menor tamaño posible.

## Benchmarks y rendimiento

Calidad de las cuantizaciones frente al transformer en bf16. LPIPS (alex, menor es mejor) y SSIM con el mismo prompt, semilla, ruido inicial y embeddings de texto en bf16, a 1024x1024, 50 pasos y CFG 3, sobre 12 prompts (8 generales y 4 reservados: retrato en primer plano, rótulo de tienda con texto, manos doblando origami y una descripción larga de escena):

| Fichero | Tamaño | Bits por peso | LPIPS medio vs bf16 | LPIPS máximo vs bf16 | SSIM vs bf16 |
|---|---|---|---|---|---|
| MOSS-Image-SFT-UD-Q3_K_XL.gguf | 2,84 GB | 4,47 | 0,281 | 0,493 | 0,713 |
| MOSS-Image-SFT-Q4_K_M.gguf | 3,20 GB | 5,04 | 0,294 | 0,466 | 0,714 |
| MOSS-Image-SFT-UD-Q4_K_XL.gguf | 3,42 GB | 5,38 | 0,213 | 0,412 | 0,780 |
| MOSS-Image-SFT-UD-Q5_K_XL.gguf | 3,95 GB | 6,22 | 0,121 | 0,358 | 0,862 |
| MOSS-Image-SFT-UD-Q6_K_XL.gguf | 4,53 GB | 7,13 | 0,106 | 0,354 | 0,883 |
| MOSS-Image-SFT-Q8_0.gguf | 5,48 GB | 8,63 | 0,054 | 0,202 | 0,939 |
| MOSS-Image-SFT-BF16.gguf | 10,17 GB | 16,00 | 0,000 | 0,000 | 1,000 |

Resultados a través de stable-diffusion.cpp, evaluados contra el render bf16 del propio motor sobre los 4 prompts reservados: Q8_0 0,109; UD-Q4_K_XL 0,188; Q4_K_M 0,347; UD-Q3_K_XL 0,336.

Nota metodológica del autor: el modelo es muy sensible a cambios numéricos mínimos; alterar un solo paso de redondeo bf16 en una capa ya desplaza los renders 0,041 LPIPS de media, por lo que las diferencias cercanas a ese nivel son cambios de composición más que pérdida de calidad. La tabla principal se obtuvo descomprimiendo los pesos GGUF dentro del pipeline de referencia, así que mide únicamente el efecto de los pesos. En una GPU CUDA, Unsloth Studio usa por defecto el fichero INT8-ConvRot de `unsloth/MOSS-Image-SFT-FP8` (LPIPS 0,058) en lugar de los GGUF.

No se han publicado resultados de benchmarks estándar (MMLU, GenEval, FID, CLIP-score u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia, los pesos del transformer ocupan entre 3,42 GB (UD-Q4_K_XL) y 10,17 GB (BF16); a ello hay que sumar el codificador de texto Qwen3.5-9B en Q8_0 (tamaño no indicado en la información disponible, del orden de 9-10 GB para 9 B a 8 bits) y el VAE.
- GPU recomendadas: no disponibles en la información proporcionada. Unsloth Studio selecciona automáticamente el fichero INT8-ConvRot del repo FP8 cuando detecta una GPU CUDA.
- ¿Cabe en GPU de consumo? No confirmado. Con UD-Q4_K_XL (3,42 GB) más el encoder Qwen3.5-9B en Q8_0 y el VAE, el conjunto debería ser viable en tarjetas de 24 GB (RTX 3090/4090) y ajustado en 12-16 GB; son estimaciones a partir de los tamaños de fichero, no cifras oficiales.
- Despliegue: Unsloth Studio (interfaz de escritorio, pestaña Images) y stable-diffusion.cpp, build master-975 o superior, con binario `sd-cli` para línea de comandos. Soporta CPU, Mac y GPU.
- Latencia y throughput: no disponibles. La configuración por defecto es 50 pasos a 1024x1024 con CFG 3,0 y shift 5, lo que implica 50 evaluaciones del transformer por imagen más las del encoder.
- Espacio en disco: el repositorio completo ocupa 33,6 GB, pero una instalación funcional solo necesita un fichero GGUF del transformer, el GGUF Q8_0 del encoder, el VAE y el tokenizer.

## Comparativa con modelos similares

No se han publicado en la información disponible datos comparativos frente a otros modelos text-to-image (parámetros, contexto, benchmarks o licencia) que permitan una tabla rigurosa. Los únicos puntos de comparación documentados son internos a la familia:

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| unsloth/MOSS-Image-SFT-GGUF | 5,08 B (transformer) | en, zh | Apache 2.0 | GGUF (7 variantes) | Cuantización dinámica con LPIPS/SSIM publicados; requiere VAE, tokenizer y encoder aparte |
| OpenMOSS-Team/MOSS-Image-SFT | 5,08 B | en, zh | Apache 2.0 | safetensors (diffusers) | Modelo base del que se derivan estos GGUF; misma arquitectura y pipeline |
| OpenMOSS-Team/MOSS-Image-Base | No disponible | en, zh | No disponible en la información | safetensors | Versión previa al SFT; según la model card, el SFT mejora la agrupación de texto y la organización del layout |
| unsloth/MOSS-Image-SFT-FP8 | 5,08 B | en, zh | Apache 2.0 | safetensors (FP8, INT8-ConvRot) | Incluye VAE y tokenizer; opción por defecto en GPU CUDA desde Unsloth Studio |

## Limitaciones y advertencias

- Estos ficheros contienen únicamente el transformer. Sin el VAE, el tokenizer (repo FP8) y el encoder Qwen3.5-9B en GGUF el modelo no funciona; una instalación incompleta provoca errores de carga.
- Dependencia de versión: en stable-diffusion.cpp se requiere el build master-975 o superior con soporte de MOSS-Image.
- Sensibilidad numérica alta: un solo cambio de redondeo bf16 en una capa desplaza los renders 0,041 LPIPS de media; pequeñas variaciones de versión, backend o hardware cambian la composición aunque la calidad percibida sea similar.
- Idiomas limitados a inglés y chino. El renderizado de texto en otras lenguas (castellano incluido) no está respaldado por la model card y no hay métricas al respecto.
- Riesgo de texto mal formado en imágenes: aunque el modelo está orientado a rótulos legibles, no se publican tasas de acierto por idioma ni pruebas con cadenas largas.
- Alucinación visual: no se documentan métricas de fidelidad al prompt (CLIP-score, GenEval), por lo que no se puede cuantificar el grado de seguimiento en escenas complejas.
- Sesgos: no se ha publicado información sobre la composición del dataset de entrenamiento ni sobre sesgos demográficos, culturales o de estilo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo se distribuye "tal cual", sin garantías; conviene revisar también las condiciones del encoder Qwen3.5-9B, que es una pieza separada.
- Se ha reportado en foros de la comunidad un fallo de carga de estos GGUF en la versión v0.1.910-beta de Unsloth Studio; no está confirmado ni documentado oficialmente, pero es un riesgo a verificar antes de desplegar en producción.
- Los ficheros de menor tamaño (UD-Q3_K_XL, Q4_K_M) presentan LPIPS en torno a 0,28-0,29 y SSIM próximo a 0,71, lo que implica diferencias visibles de composición frente a bf16; no son adecuados si se exige fidelidad estricta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/unsloth/MOSS-Image-SFT-GGUF
- Modelo base (OpenMOSS-Team/MOSS-Image-SFT): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo previo al SFT (MOSS-Image-Base): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repo FP8 con VAE y tokenizer: https://huggingface.co/unsloth/MOSS-Image-SFT-FP8
- Codificador de texto Qwen3.5-9B GGUF: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Notas de versión de Unsloth: https://github.com/unslothai/unsloth/releases
- Documentación de Unsloth: https://docs.unsloth.ai/
- Documentación de Unsloth Dynamic 2.0: https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs
- Servidor de Discord de Unsloth: https://discord.gg/unsloth
- Sitio web de Unsloth: https://unsloth.ai/
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Artículo de referencia (arXiv 2610.23374): https://arxiv.org/abs/2610.23374
- Hilo de la comunidad sobre la carga del modelo: https://www.reddit.com/r/unsloth/comments/1xecbd5/anyone_manage_to_get_moss_image_to_load/
