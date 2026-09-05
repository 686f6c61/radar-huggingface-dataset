# WaveCut/Qwen3-VL-8B-Instruct-SDNQ-int8-static

## Resumen

WaveCut/Qwen3-VL-8B-Instruct-SDNQ-int8-static es una cuantización estática INT8 (weight-only) del modelo multimodal Qwen3-VL-8B-Instruct, desarrollada por WaveCut. Está pensada para reducir el consumo de memoria del encoder de instrucciones (mllm) en los pipelines de generación de imágenes Boogu Image 0.1, pasando de ~17,5 GiB en bf16 a ~9,4 GiB en disco y RAM. El modelo conserva el checkpoint completo (procesador y tokenizador) y carga con transformers tras importar la librería sdnq. Con 8.774 millones de parámetros, es una solución práctica para desplegar modelos multimodales en entornos con recursos limitados, manteniendo una fidelidad alta en el modo weight-only (coseno medio de 0,999 en los embeddings de salida).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) con codificador de visión, basado en Qwen3-VL-8B-Instruct |
| Parametros totales | 8.774.313.952 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 estático SDNQ (weight-only); bf16 para embeddings, lm_head, multi_modal_projector y patch_embed de visión |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (con configuración SDNQ) |

## Arquitectura y entrenamiento

El modelo es una cuantización estática INT8 del checkpoint Qwen/Qwen3-VL-8B-Instruct (snapshot `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`). No se trata de un entrenamiento desde cero, sino de una conversión de pesos mediante SDNQ 0.2.5 con `weights_dtype=int8`, `group_size=0` y `dequantize_fp32=True`. Se mantienen en bf16 las embeddings, el `lm_head`, el `multi_modal_projector`, el `patch_embed` de visión y los módulos por debajo del umbral de tamaño de SDNQ. El resultado son 368 capas cuantizadas y 7.517.270.016 parámetros en INT8, con un tamaño guardado de 9,37 GiB frente a los 16,33 GiB del original en bf16. La verificación save/load confirma que todos los parámetros son bit-idénticos tras la carga.

La innovación técnica principal es la reducción de memoria sin necesidad de reentrenar el modelo. El modo recomendado (`int8-wo`) desactiva la cuantización de activaciones, lo que preserva la salida del encoder con un coseno medio de 0,999 respecto al modelo bf16, frente al 0,965 del modo con activaciones cuantizadas.

## Capacidades

- Comprensión de imágenes y texto (image-text-to-text), heredada del modelo base Qwen3-VL-8B-Instruct.
- Generación de texto a partir de instrucciones multimodales.
- Uso como encoder de instrucciones (mllm) en los pipelines Boogu Image 0.1 Turbo y Edit.
- Carga con transformers mediante `import sdnq`; se puede usar con `AutoProcessor` y `Qwen3VLForConditionalGeneration`.
- Modo weight-only (`int8-wo`) recomendado, que mantiene la salida del encoder con un coseno medio de 0,999 respecto a bf16.
- Compatibilidad con sequential CPU offload para reducir el pico de VRAM.
- Soporte de prompts largos en múltiples idiomas (el benchmark incluye inglés, ruso y chino), aunque los idiomas no están documentados en la ficha.

## Casos de uso

- Despliegue de Boogu Image 0.1 en servidores con RAM limitada: el encoder cuantizado reduce la RAM del host de ~17,5 GiB a ~9,4 GiB, permitiendo ejecutar el pipeline completo en máquinas de 16 GiB.
- Servicio de dibujo por IA (aifarm draw service): el modelo se carga con `sdnq.loader` en CPU y se mueven capas secuencialmente, reduciendo el pico de VRAM a 2446 MiB en una RTX 4090.
- Generación de imágenes en GPU de consumo: la cuantización INT8 permite ejecutar el encoder en tarjetas de 12-16 GB sin necesidad de A100 o H100.
- Investigación en cuantización de modelos multimodales: los benchmarks A/B proporcionan métricas de fidelidad (PSNR, SSIM, LPIPS, coseno de embeddings) para comparar estrategias INT8 y UINT4.
- Integración en pipelines existentes de Diffusers: el checkpoint es un reemplazo directo del encoder bf16, solo requiere añadir `import sdnq` y ajustar el dtype a `bfloat16`.
- Procesamiento de prompts largos y multilingües en generación de imágenes: el benchmark incluye prompts de tipografía, diagramas y textos en inglés, ruso y chino, con resultados de coseno de embeddings superiores a 0,998 en modo weight-only.

## Benchmarks y rendimiento

El autor publica mediciones A/B del pipeline Boogu Image 0.1 Turbo (1024x1024, 4 pasos DMD) comparando el encoder bf16 con distintas cuantizaciones. Entorno: torch 2.10.0+cu130, transformers 4.57.1, diffusers 0.39.0.dev0, sdnq 0.2.5, RTX 4090, Python 3.12.3.

| Encoder | PSNR | SSIM | LPIPS | Embed cos | Embed rel-L2 |
|---|---:|---:|---:|---:|---:|
| bf16 (referencia) | - | - | - | - | - |
| int8-wo (este repo) | 20,40 | 0,7507 | 0,1837 | 0,99901 | 0,03786 |
| int8 | 14,66 | 0,6070 | 0,3689 | 0,96518 | 0,23915 |
| uint4-svd32 | 13,72 | 0,5794 | 0,4101 | 0,91081 | 0,36603 |
| uint4-svd32-wo | 13,90 | 0,5969 | 0,3834 | 0,92782 | 0,32357 |

| Encoder | Gen mean s | Encode mean s | Peak VRAM MiB | Host RSS tras carga GiB |
|---|---:|---:|---:|---:|
| bf16 (referencia) | 20,01 | 1,27 | 2446 | 1,33 |
| int8-wo (este repo) | 18,86 | 1,65 | 2446 | 1,34 |
| int8 | 19,48 | 3,52 | 2446 | 1,34 |

El rango de PSNR por prompt en modo int8-wo va de 14,41 a 34,89, y el coseno de embeddings se mantiene por encima de 0,998 en todos los prompts evaluados. No se han publicado resultados de benchmarks de tareas de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El autor reporta un pico de VRAM de 2446 MiB para el pipeline completo Boogu Image 0.1 (encoder + transformer + VAE) con sequential CPU offload en una NVIDIA GeForce RTX 4090.
- El modelo aislado en INT8 ocupa aproximadamente 9,4 GiB en disco/RAM (host), frente a los ~17,5 GiB del checkpoint bf16.
- GPU recomendada: RTX 4090 (usada en los benchmarks). Se espera que funcione en GPUs de consumo con 12-16 GB de VRAM, aunque no se proporcionan datos directos para el modelo aislado.
- Opciones de despliegue: transformers (con `import sdnq`), Diffusers, `sdnq.loader` para carga en CPU con offload secuencial, y endpoints compatibles de HuggingFace.
- Latencia: en el benchmark del pipeline, el encoder tarda 1,65 s por pasada en modo int8-wo frente a 1,27 s en bf16; el tiempo total de generación es de 18,86 s frente a 20,01 s.

## Comparativa con modelos similares

Las alternativas más cercanas son las variantes de cuantización del propio modelo base. No se dispone de comparativas con otros modelos de la misma categoría en la información proporcionada.

| Variante | Tamaño guardado | PSNR | SSIM | LPIPS | Embed cos |
|---|---:|---:|---:|---:|---:|
| bf16 (base) | 16,33 GiB | - | - | - | - |
| int8-wo (este repo) | 9,37 GiB | 20,40 | 0,7507 | 0,1837 | 0,99901 |
| int8 (activaciones cuantizadas) | 9,37 GiB | 14,66 | 0,6070 | 0,3689 | 0,96518 |
| uint4-svd32 | No disponible | 13,72 | 0,5794 | 0,4101 | 0,91081 |

## Limitaciones y advertencias

- La cuantización introduce una pérdida de calidad medible en la salida de imagen: el PSNR medio es 20,40, el SSIM 0,7507 y el LPIPS 0,1837 en modo int8-wo, en comparación con el encoder bf16.
- El modo int8 con activaciones cuantizadas (sin el sufijo `-wo`) degrada notablemente la fidelidad (coseno de embeddings 0,965) y no es recomendado por el autor.
- Los idiomas soportados no están documentados en la ficha; el benchmark solo incluye inglés, ruso y chino.
- El modelo requiere la librería `sdnq` para cargarse con transformers; sin ella, la carga fallará.
- No se han publicado benchmarks de tareas de lenguaje como MMLU, HumanEval o GSM8K; la evaluación se centra exclusivamente en el pipeline de generación de imágenes.
- Es un modelo reciente con 0 descargas y 0 likes en HuggingFace, por lo que su fiabilidad en producción aún no está validada por la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero hay que verificar las condiciones del modelo base y de las librerías dependientes (sdnq, diffusers).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WaveCut/Qwen3-VL-8B-Instruct-SDNQ-int8-static
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Pipeline Boogu Image 0.1 Turbo SDNQ uint4: https://huggingface.co/WaveCut/Boogu-Image-0.1-Turbo-SDNQ-uint4-static
