# speedyrulz/minimax-h3-image-int8-w4a8-hybrid

## Resumen

MiniMax-H3-Image int8 + w4a8 hybrid es una versión cuantizada y reempaquetada del modelo de difusión text-to-image MiniMax-H3-Image de MiniMaxAI, publicada por el usuario speedyrulz. El objetivo es reducir el peso del modelo original (19,5 GiB en int8 ConvRot) hasta 14,8 GiB manteniendo una fidelidad razonable respecto al modelo bf16, de forma que quepa y funcione con fluidez en GPUs de consumo de 16 GB como la RTX 5060 Ti o la RTX 4060 Ti.

La innovación principal es el esquema de precisión mixta: los bloques 0-29 usan cuantización asimétrica de pesos a 4 bits con activaciones a 8 bits (`asym_w4a8_int8`), mientras que los bloques 30-49 y el resto de tensores se mantienen en int8 tensorwise con ConvRot. El autor justifica este reparto porque los últimos 20 bloques son los más sensibles a la pérdida de precisión con pesos de 4 bits. Los tensores se copian sin recuantizar desde dos ficheros oficiales de Comfy-Org.

El modelo se distribuye como un único fichero safetensors para ComfyUI (versión 0.45.0 o superior) y es un reemplazo directo en el flujo de trabajo oficial text-to-image. No requiere hardware FP4, ya que emplea exclusivamente los kernels int8 de ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (repack cuantizado de MiniMax-H3-Image) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: `asym_w4a8_int8` (bloques 0-29: qkv_proj, out_proj, fc1, fc2) e `int8_tensorwise` ConvRot (bloques 30-49 y resto de tensores) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

El modelo subyacente es MiniMax-H3-Image, un modelo de difusión para generación de imágenes a partir de texto. Esta publicación no entrena ni ajusta el modelo: es un reempaquetado de precisión mixta que combina tensores de dos ficheros de Comfy-Org (`minimax_h3_image_pruned_w4a8` y `minimax_h3_image_pruned_int8_convrot`) sin recuantizar, verificable mediante el SHA-256 `ea736af3b44f0f8be32e3ec632e375fea0449a8c0b2e05fe121ede5719a0137b`.

La decisión de diseño central es mantener en int8 los últimos 20 bloques (30-49) porque son los que más degradan su salida con pesos de 4 bits, y aplicar w4a8 solo a las proyecciones de atención y capas fully-connected de los bloques 0-29. El autor descartó NVFP4 tras medir pérdidas del 8-12% de la salida en capas reales (frente a ~1% de int8 ConvRot y 5-6% de w4a8), atribuyendo la mitad de esa pérdida a las activaciones de 4 bits. No se dispone de información sobre los datos de entrenamiento originales, el número de tokens ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Ejecución como reemplazo directo en el flujo de trabajo oficial de ComfyUI 0.45.0 o superior.
- Inferencia en GPUs de 16 GB mediante kernels int8 de ComfyUI, sin necesidad de hardware FP4.
- Generación a resolución 2048x2048 con 6 pasos de muestreo (configuración medida por el autor).
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de imágenes en estaciones de trabajo con GPU de 16 GB: el modelo cabe en tarjetas como RTX 4060 Ti o RTX 5060 Ti, permitiendo generar imágenes 2048x2048 en 16-21 segundos totales (6 pasos) sin salir del ecosistema ComfyUI.
- Prototipado rápido de pipelines text-to-image: al ser un single-file safetensors compatible con el workflow oficial, se puede sustituir el modelo por esta variante sin reescribir el grafo de ComfyUI.
- Iteración de prompts en local: la reducción de tamaño (14,8 GiB frente a 19,5 GiB del int8) acorta el tiempo de carga del modelo en la GPU, lo que agiliza ciclos de prueba con distintos prompts y semillas.
- Despliegue en equipos con enlace PCIe lento: en la RTX 4060 Ti el híbrido reduce el tiempo por paso de 2,72 s a 2,33 s respecto al int8, algo relevante cuando el intercambio de datos entre CPU y GPU es el cuello de botella.
- Evaluación comparativa de cuantizaciones: sirve como referencia para estudiar el compromiso entre tamaño, error de salida y SSIM frente al modelo bf16 en tareas de generación de imagen.
- Generación de imágenes en entornos con restricciones de VRAM: al usar solo kernels int8, evita depender de hardware RTX 50 con soporte FP4, ampliando la base de GPUs compatibles.

## Benchmarks y rendimiento

El autor publica métricas de error de salida y SSIM frente al modelo bf16, medidas a 2048x2048 y 6 pasos:

| Modelo | Tamano | Error de salida por paso | SSIM frente a bf16 |
|---|---|---|---|
| int8 ConvRot (oficial) | 19,5 GiB | 3,5% | 0,888 |
| **este híbrido** | **14,8 GiB** | **5,2%** | **0,844** |
| w4a8 (oficial) | 11,7 GiB | 9,1% | 0,767 |

El error de salida es el error relativo de la predicción del modelo alimentando cada variante con las propias entradas del modelo bf16, promediado sobre 6 pasos y 2 prompts. El SSIM es la media sobre 6 imágenes (2 prompts, 3 semillas) generadas con la atención por defecto del modelo.

Rendimiento medido (6 pasos a 2048x2048, flujo oficial):

| GPU | int8 | híbrido | w4a8 |
|---|---|---|---|
| RTX 5060 Ti 16 GB | 1,86 s/paso, 21-23 s total | 1,85 s/paso, 16-17 s total | 1,85 s/paso, 16 s total |
| RTX 4060 Ti 16 GB | 2,72 s/paso, 27-28 s total | 2,33 s/paso, 20-21 s total | 2,27 s/paso, 19-20 s total |

Los totales incluyen la carga del modelo en la GPU. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero ocupa 14,8 GiB; se necesita una GPU de 16 GB para cargarlo completo.
- GPUs validadas por el autor: RTX 5060 Ti 16 GB (1,85 s/paso) y RTX 4060 Ti 16 GB (2,33 s/paso).
- Cabe en GPU de consumo de 16 GB; no se documenta su comportamiento en GPUs de 8-12 GB.
- No requiere hardware FP4 (RTX 50); funciona con los kernels int8 de ComfyUI.
- Despliegue: ComfyUI 0.45.0 o superior, colocando el fichero en `ComfyUI/models/diffusion_models` y seleccionándolo en el loader del flujo de trabajo oficial.
- No se documentan opciones para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo de difusión).
- Throughput: 6 pasos en 16-21 s totales en RTX 4060 Ti/5060 Ti según la tabla del autor.

## Comparativa con modelos similares

| Modelo | Tamano | Error de salida | SSIM vs bf16 | Hardware FP4 | Licencia |
|---|---|---|---|---|---|
| int8 ConvRot (oficial) | 19,5 GiB | 3,5% | 0,888 | No | MiniMax H3 Image community license |
| **híbrido (este)** | **14,8 GiB** | **5,2%** | **0,844** | No | MiniMax H3 Image community license |
| w4a8 (oficial) | 11,7 GiB | 9,1% | 0,767 | No | MiniMax H3 Image community license |
| Mejor mezcla NVFP4 (descartada) | 15,5 GiB | 8,1% | no disponible | Sí (solo RTX 50) | MiniMax H3 Image community license |

No se dispone de comparación con otros modelos text-to-image de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización: introduce un error de salida del 5,2% por paso y un SSIM de 0,844 frente al bf16, inferior a la fidelidad del int8 oficial (3,5% y 0,888).
- Los últimos 20 bloques se mantienen en int8 precisamente porque los pesos de 4 bits degradan su salida; no es un modelo de 4 bits uniforme.
- No se documentan sesgos conocidos del modelo base en la información disponible.
- Riesgo de alucinación visual (artefactos, elementos inconsistentes) inherente a los modelos de difusión; no cuantificado en la model card.
- Idiomas soportados no disponibles; el comportamiento multilingüe del prompt no está documentado.
- Licencia `minimax-h3-image-community-license-agreement`: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva estándar (Apache/MIT).
- Compatibilidad limitada a ComfyUI 0.45.0 o superior y a sus kernels int8; no se garantiza funcionamiento en otros runners.
- Solo se han validado dos GPUs (RTX 5060 Ti y RTX 4060 Ti); el rendimiento en otras tarjetas no está documentado.
- El autor no ha recuantizado tensores, pero el repack depende de dos ficheros de Comfy-Org cuya disponibilidad futura no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speedyrulz/minimax-h3-image-int8-w4a8-hybrid
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repack de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
