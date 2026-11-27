# Xylolabs/Ming-Image-0.2-Design-GGUF

## Resumen

Ming-Image-0.2-Design-GGUF es una conversión a formato GGUF del modelo de generación de imágenes texto-a-imagen inclusionAI/Ming-Image-0.2-Design, publicada por Xylolabs. El paquete incluye cuantizaciones tanto del transformador de difusión (DiT) como del codificador de texto, que en este caso es un modelo de mezcla de expertos (MoE) Ling-mini-2.0 con su conector, proyecciones y torre de visión. El VAE no forma parte del repositorio y debe obtenerse por separado del repositorio Comfy-Org/Ming-Image.

El objetivo de esta publicación es hacer viable la inferencia del modelo original en hardware de consumo y en herramientas de código abierto como ComfyUI o stable-diffusion.cpp, ofreciendo un abanico de cuantizaciones que van desde BF16 (12,31 GB solo el DiT) hasta Q2_K (2,65 GB). El repositorio incluye además una tabla de precisión detallada que mide el error relativo L2 del DiT frente a BF16 en cada paso de muestreo, junto con métricas LPIPS y PSNR sobre las imágenes finales.

La relevancia actual reside en que permite ejecutar un pipeline de difusión con codificador de texto MoE en GPUs de consumo, con cuantizaciones que reducen el DiT a poco más de 4 GB en Q4_K_M manteniendo una calidad razonable. La licencia MIT del modelo base se conserva, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformador de difusión (DiT) para generación de imágenes, con codificador de texto MoE Ling-mini-2.0 |
| Parámetros totales | 6.154.901.056 (según safetensors del modelo base) |
| Parámetros activos | no disponible (el codificador de texto es MoE, pero no se detalla el reparto activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K (DiT y codificador de texto por separado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el VAE externo) |

## Arquitectura y entrenamiento

El modelo base es un pipeline texto-a-imagen compuesto por un transformador de difusión (DiT) que genera las imágenes y un codificador de texto basado en el modelo Ling-mini-2.0 en configuración de mezcla de expertos (MoE), acompañado de un conector, proyecciones y una torre de visión. La conversión a GGUF fusiona las proyecciones Q/K/V del DiT en un único tensor y renombra los tensores al esquema de ComfyUI. El VAE se distribuye aparte en safetensors BF16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la documentación proporcionada. La model card de Xylolabs indica que el proceso de conversión consistió en transformar los pesos a GGUF, fusionar proyecciones y cuantizar, manteniendo el tokenizador original. El script DGL incluido reproduce la programación del pipeline original: 11 pasos de muestreo con flow shift 6.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con resolución de 1024 x 1024 en las pruebas publicadas.
- Renderizado de texto dentro de las imágenes: la model card incluye una comprobación OCR sobre 18 imágenes, con hasta 17 de 18 lecturas correctas en algunas cuantizaciones.
- Codificador de texto con arquitectura MoE y torre de visión, lo que sugiere capacidad de procesar entradas multimodales, aunque no se detalla su uso en esta conversión.
- Integración con ComfyUI mediante los nodos Unet Loader (GGUF) y CLIPLoader (GGUF), con tipo `qwen_image`.
- Ejecución en stable-diffusion.cpp mediante el script DGL incluido.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, por tratarse de un modelo de generación de imágenes.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el DiT en Q4_K_M (4,13 GB) permite iterar rápidamente en una GPU de consumo dentro de ComfyUI, generando imágenes a 1024 x 1024 con 11 pasos de muestreo.
- Creación de material gráfico con texto integrado: la comprobación OCR de la model card indica que el modelo reproduce texto legible en la imagen, útil para carteles, banners o maquetas con titulares.
- Despliegue en entornos con VRAM limitada: la cuantización Q2_K del DiT (2,65 GB) junto con el codificador de texto en Q3_K_M (9,62 GB) permite ejecutar el pipeline completo en GPUs de gama media, a costa de mayor error frente a BF16.
- Automatización de pipelines de imagen en CI/CD: stable-diffusion.cpp con el script DGL permite lanzar generaciones por línea de comandos en servidores sin interfaz gráfica, integrable en flujos de build o generación de assets.
- Investigación sobre cuantización de modelos de difusión: la tabla de precisión publicada (error L2 por paso, LPIPS, PSNR) sirve como referencia para estudiar el impacto de la cuantización en DiT con codificador MoE.
- Generación de imágenes para entornos de escritorio con ComfyUI: la disponibilidad de cuantizaciones separadas para DiT y codificador de texto permite ajustar el equilibrio entre VRAM y calidad según el hardware disponible.
- Evaluación comparativa de kernels de atención: la model card reporta que dos ejecuciones BF16 que solo difieren en el kernel de atención obtienen LPIPS 0,0339, lo que sirve de línea base para medir el ruido experimental en este pipeline.

## Benchmarks y rendimiento

La model card publica métricas de fidelidad frente a BF16 sobre 16 prompts a 1024 x 1024, con semillas 42 y 43 (32 imágenes). El error es el L2 relativo de la predicción del DiT en cada uno de los 11 pasos de muestreo; LPIPS y PSNR comparan las imágenes finales con las del par BF16 en stable-diffusion.cpp con la misma semilla. La comprobación de texto cuenta las 18 imágenes cuyo texto citado lee un OCR en su totalidad.

| Cuantización | Parte | Tamaño | Error vs BF16 | LPIPS | PSNR | Texto |
|---|---|---:|---:|---:|---:|---:|
| BF16 | DiT | 12,31 GB | 0 (referencia) | - | - | 15/18 |
| Q8_0 | DiT | 6,66 GB | 0,0137 | 0,0508 | 28,21 dB | 15/18 |
| Q6_K | DiT | 5,55 GB | 0,0346 | 0,0559 | 26,63 dB | 16/18 |
| Q5_K_M | DiT | 5,14 GB | 0,0465 | 0,0841 | 24,48 dB | 17/18 |
| Q4_K_M | DiT | 4,13 GB | 0,0842 | 0,1434 | 20,01 dB | 17/18 |
| Q3_K_M | DiT | 3,41 GB | 0,1438 | 0,1748 | 19,03 dB | 17/18 |
| Q2_K | DiT | 2,65 GB | 0,2523 | 0,2792 | 16,12 dB | 15/18 |
| Q8_0 | Codificador de texto | 19,31 GB | 0,0239 | 0,0661 | 26,94 dB | 15/18 |
| Q6_K | Codificador de texto | 15,60 GB | 0,0250 | 0,0617 | 25,95 dB | 16/18 |
| Q5_K_M | Codificador de texto | 14,25 GB | 0,0263 | 0,0514 | 26,68 dB | 14/18 |
| Q4_K_M | Codificador de texto | 11,82 GB | 0,0319 | 0,0739 | 24,45 dB | 17/18 |
| Q3_K_M | Codificador de texto | 9,62 GB | 0,0442 | 0,0871 | 23,17 dB | 16/18 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, por tratarse de un modelo de generación de imágenes.

## Requisitos de hardware

- VRAM estimada para el DiT: desde 2,65 GB (Q2_K) hasta 12,31 GB (BF16); Q4_K_M ocupa 4,13 GB.
- VRAM estimada para el codificador de texto: desde 9,62 GB (Q3_K_M) hasta 19,31 GB (Q8_0); Q4_K_M ocupa 11,82 GB.
- El pipeline completo requiere sumar DiT, codificador de texto y VAE, por lo que la configuración mínima práctica en Q4_K_M ronda los 16 GB de VRAM.
- GPU recomendadas: no disponible de forma explícita; por tamaño, una RTX 4090 (24 GB) permite ejecutar DiT y codificador en Q4_K_M o Q5_K_M con margen, mientras que GPUs de 16 GB requieren cuantizaciones más agresivas del codificador.
- Cabe en GPU de consumo: sí, con cuantizaciones Q3_K_M o Q2_K del codificador de texto y Q4_K_M o inferiores del DiT.
- Opciones de despliegue: ComfyUI v0.46.0 o superior con ComfyUI-GGUF (PR #486 para los ficheros del codificador de texto) y stable-diffusion.cpp master-1141-e637c7b o superior con el script DGL incluido.
- Latencia y throughput: no disponible; la model card solo especifica 11 pasos de muestreo con flow shift 6.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que la comparación se limita a aspectos estructurales y de licencia.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Ming-Image-0.2-Design-GGUF | 6.154.901.056 | no disponible | MIT | GGUF | Hugging Face (Xylolabs) |
| Ming-Image-0.2-Design (base) | 6.154.901.056 | no disponible | MIT | safetensors | Hugging Face (inclusionAI) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El VAE no está incluido en el repositorio; es obligatorio descargar `ming_image_vae_bf16.safetensors` desde Comfy-Org/Ming-Image para ejecutar el pipeline.
- Los ficheros del codificador de texto requieren ComfyUI-GGUF con el PR #486, lo que puede suponer una dependencia de una versión no publicada estable.
- La cuantización introduce degradación medible: Q4_K_M del DiT presenta un error relativo de 0,0842 y un PSNR de 20,01 dB frente a BF16; Q2_K alcanza 0,2523 de error y 16,12 dB, con pérdida de calidad notable.
- La reproducibilidad no es exacta: dos ejecuciones BF16 que solo difieren en el kernel de atención obtienen LPIPS 0,0339, por lo que diferencias pequeñas entre cuantizaciones pueden quedar dentro del ruido experimental.
- La comprobación de texto vía OCR no es perfecta en ninguna configuración (máximo 17/18), por lo que no se garantiza la legibilidad del texto generado.
- No se documentan sesgos conocidos, idiomas soportados ni restricciones adicionales de uso comercial más allá de la licencia MIT.
- Xylolabs no está afiliada a inclusionAI; la conversión es de terceros y no cuenta con validación oficial del autor original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Ming-Image-0.2-Design-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ming-Image-0.2-Design
- VAE (Comfy-Org): https://huggingface.co/Comfy-Org/Ming-Image/blob/main/vae/ming_image_vae_bf16.safetensors
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- PR #486 de ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF/pull/486
- Repositorio de Xylolabs (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Gráfica de precisión del DiT: https://huggingface.co/Xylolabs/Ming-Image-0.2-Design-GGUF/resolve/main/accuracy-dit.png
- Gráfica de precisión del codificador de texto: https://huggingface.co/Xylolabs/Ming-Image-0.2-Design-GGUF/resolve/main/accuracy-te.png
