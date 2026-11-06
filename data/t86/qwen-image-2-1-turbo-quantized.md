# T86/Qwen-Image-2.1-Turbo-Quantized

## Resumen

Qwen-Image-2.1-Turbo-Quantized es un paquete de cuantizaciones del modelo de generación de imágenes Qwen-Image-2.1-Turbo, publicado por el usuario T86 (también identificado como abenzerps en los enlaces internos de la model card). No se trata de un modelo entrenado desde cero, sino de una redistribución en formatos ligeros (GGUF, FP8, INT8 ConvRot, NVFP4 y MLX en 4, 6 y 8 bits) de los pesos originales de Alibaba/Qwen, pensada para su uso en ComfyUI, stable-diffusion.cpp y MFLUX. El modelo base es un sistema texto-a-imagen de arquitectura de difusión con aproximadamente 7.115 millones de parámetros.

La relevancia de esta publicación es práctica: el modelo original requiere BF16 y un text encoder Qwen3-VL de 8B en BF16 (17,53 GB), lo que lo sitúa fuera del alcance de muchas GPU de consumo. Las cuantizaciones reducen el UNet de difusión a entre 4,00 y 7,59 GB y el text encoder a 9,35 GB en INT8, permitiendo ejecutar generación a 1024 × 1024 en GPUs de 12-16 GB de VRAM. El modelo base es de generación "turbo", con 8 pasos de denoising y CFG = 1, lo que reduce la latencia a 10-20 segundos por imagen en GPU tras el calentamiento.

Es importante señalar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que la licencia es `qwen-research` (marcada como `other`), lo que tiene implicaciones directas para uso comercial que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (base Qwen-Image-2.1-Turbo), con text encoder Qwen3-VL 8B y VAE propio |
| Parametros totales | 7.115.124.736 (7,1B, pesos safetensors del modelo de difusión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0), FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit |
| Idiomas soportados | No disponible (el prompt se procesa vía text encoder Qwen3-VL 8B; no se documenta lista de idiomas) |
| Licencia | `qwen-research` (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (FP8, INT8 ConvRot, NVFP4, MLX), GGUF (Q8_0 a Q4_0); text encoder y VAE en safetensors BF16/INT8 |

Tamaños de archivo por cuantización del modelo de difusión:

| Cuantizacion | Tamano |
|---|---:|
| FP8 | 7,13 GB |
| INT8 ConvRot | 7,26 GB |
| NVFP4 | 4,20 GB |
| MLX 4-bit | 4,00 GB |
| MLX 6-bit | 5,78 GB |
| MLX 8-bit | 7,56 GB |
| Q8_0 | 7,59 GB |
| Q6_K | 5,88 GB |
| Q5_K_M | 4,94 GB |
| Q4_K_M | 4,05 GB |
| Q4_0 | 4,05 GB |

Componentes auxiliares: text encoder `qwen3vl_8b_bf16.safetensors` (17,53 GB) o `qwen3vl_8b_int8_convrot.safetensors` (9,35 GB); VAE `qwen_image_2.1_vae_bf16.safetensors` (0,68 GB). Tamaño total del repositorio: 90,0 GB.

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1-Turbo es un sistema de difusión para texto-a-imagen de la familia Qwen-Image, con aproximadamente 7,1B de parámetros en el módulo de difusión. La model card del paquete cuantizado no detalla la arquitectura interna (tipo de backbone, mecanismo de atención, variante de scheduler más allá del schedule sigma oficial), ni los datos de entrenamiento, número de tokens, composición del dataset o si hubo RLHF/DPO. Toda esa información corresponde al modelo original de Qwen y no se reproduce aquí.

La innovación técnica destacable es el modo "turbo": el modelo está diseñado para 8 pasos de denoising con CFG = 1 (baseline recomendado: sampler Euler, CFG 1.0, 8 steps, schedule sigma oficial, 1024 × 1024, batch 1). Esto reduce drásticamente el coste computacional frente a modelos de difusión estándar de 20-50 pasos. El text encoder es Qwen3-VL 8B, lo que sugiere capacidad de condicionamiento multimodal (el "VL" implica visión-lenguaje), aunque la model card no documenta explícitamente el uso de imágenes de referencia en el pipeline texto-a-imagen.

El trabajo de este repositorio es exclusivamente de cuantización y empaquetado: no se documentan cambios en los pesos más allá de la reducción de precisión (FP8, INT8 con rotación convolucional, NVFP4, MLX de 4/6/8 bits y GGUF K-quants). No se especifican métricas de degradación por cuantización.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024 × 1024 con 8 pasos de denoising y CFG = 1.
- Generación "turbo" de baja latencia: aproximadamente 10-20 segundos por imagen en GPU tras el calentamiento, según hardware.
- Generación de imágenes sin filtro de seguridad integrado ni content checker en el modelo base, según declara el autor (véase la sección de limitaciones).
- El modelo base Qwen-Image-2.1 soporta, según la documentación de Alibaba Cloud, transparencia nativa y generación/edición unificada, además de edición versátil con múltiples referencias y control local; estas capacidades pertenecen al modelo original y no se detalla en este repositorio cómo se exponen en las cuantizaciones.
- Compatibilidad con ComfyUI mediante nodos GGUF y safetensors, con plantilla oficial "Qwen Image 2.1 Turbo — Text to Image".
- Compatibilidad con stable-diffusion.cpp para uso en línea de comandos.
- Compatibilidad con MLX / MFLUX en macOS mediante los pesos MLX 4/6/8-bit.
- Soporte de text encoder Qwen3-VL 8B, que aporta condicionamiento basado en un modelo de visión-lenguaje.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Generación de imágenes en ComfyUI en GPU de consumo: cargando `qwen-image-2.1-turbo-Q4_K_M.gguf` (4,05 GB) junto con el text encoder INT8 (9,35 GB) y el VAE (0,68 GB), el pipeline completo cabe en GPUs de 12-16 GB de VRAM, lo que permite iterar localmente sin depender de APIs.
- Prototipado rápido de conceptos visuales: con 8 pasos y CFG = 1, cada imagen tarda 10-20 segundos en GPU, lo que hace viable generar decenas de variantes por sesión para exploración de estilo o composición.
- Integración en pipelines de automatización con stable-diffusion.cpp: al disponer de GGUF, se puede invocar desde scripts de línea de comandos en servidores sin entorno gráfico, por ejemplo para generar ilustraciones de artículos o assets de marketing por lotes.
- Despliegue en macOS con MLX/MFLUX: los pesos MLX 4-bit (4,00 GB) permiten ejecutar el modelo en equipos Apple Silicon con memoria unificada, útil para equipos de diseño que trabajan en Mac sin GPU dedicada.
- Generación de material gráfico para previsualización en estudios pequeños: la licencia `qwen-research` restringe el uso comercial, pero permite uso interno de investigación y evaluación, por ejemplo para comparar calidad frente a otros modelos antes de decidir una integración comercial con el modelo base bajo licencia adecuada.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece el mismo modelo en 11 formatos, lo que permite medir empíricamente la degradación de calidad y el ahorro de VRAM entre Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0, FP8, INT8 ConvRot y NVFP4 manteniendo la semilla fija, tal como recomienda el autor.
- Experimentación con transparencia nativa y edición (capacidades del modelo base): útil en investigación sobre generación de assets con canal alfa, aunque el repositorio no documenta workflows específicos para ello.

## Benchmarks y rendimiento

La model card incluye una imagen de comparación de benchmarks (`assets/Qwen-Image-2.1-Benchmark.png`) y enlaces a la documentación de Alibaba Cloud, pero no se proporcionan los valores numéricos en el texto disponible. No se han publicado resultados de benchmarks en la información disponible.

Datos de rendimiento operativo sí documentados:

| Metrica | Valor |
|---|---|
| Resolucion de generacion | 1024 × 1024 |
| Pasos de denoising | 8 |
| CFG | 1,0 |
| Sampler recomendado | Euler |
| Latencia (GPU, tras warm-up) | 10-20 s por imagen (dependiente de hardware) |
| Batch recomendado | 1 |

## Requisitos de hardware

- VRAM estimada para el pipeline completo (difusión + text encoder + VAE): aproximadamente 14-17 GB con Q4_K_M (4,05 GB) + text encoder INT8 (9,35 GB) + VAE (0,68 GB), más overhead de runtime; aproximadamente 24-26 GB con FP8 (7,13 GB) + text encoder BF16 (17,53 GB) + VAE.
- GPU recomendadas: A100, H100 o RTX 4090 para FP8/BF16 sin compromisos; RTX 3090/4080 (24/16 GB) para INT8 ConvRot; RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB o RTX 3080 12 GB para Q4_K_M con text encoder INT8.
- Cabe en GPU de consumo: sí, con Q4_K_M o Q4_0 y text encoder INT8 en GPUs de 12-16 GB; también en Apple Silicon vía MLX 4-bit (4,00 GB) con memoria unificada.
- Opciones de despliegue: ComfyUI (nodos GGUF y safetensors), stable-diffusion.cpp (GGUF y safetensors compatibles), MLX / MFLUX (pesos MLX). No se documenta soporte de vLLM, TGI ni Ollama (no aplican a modelos de difusión en este formato).
- Latencia y throughput: 10-20 s por imagen a 1024 × 1024 en GPU tras el calentamiento; no se documenta throughput para batch > 1 ni latencia en CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks numéricos en la información proporcionada para comparar rendimiento. Comparativa a nivel de especificaciones y disponibilidad:

| Modelo | Parametros | Contexto | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo-Quantized (este repo) | 7,1B (difusion) | No disponible | GGUF, FP8, INT8, NVFP4, MLX | `qwen-research` | Hugging Face (0 descargas) |
| Qwen-Image-2.1-Turbo (base) | 7,1B (difusion) | No disponible | Safetensors BF16 | `qwen-research` | Hugging Face (Qwen), Alibaba Cloud Model Studio |
| Alternativas de difusion texto-a-imagen de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la información disponible modelos comparables adicionales con datos verificables de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Licencia `qwen-research`: restringe el uso a investigación; no se autoriza explícitamente el uso comercial. Cualquier despliegue en producción comercial requiere revisar los términos del modelo base Qwen-Image-2.1-Turbo y, probablemente, obtener una licencia distinta.
- Ausencia de filtro de seguridad: el autor declara que el modelo base no incluye safety checker ni content filter. Esto traslada toda la responsabilidad de moderación al operador y supone un riesgo legal y reputacional en entornos públicos.
- Riesgo de sesgos: no se documenta la composición del dataset de entrenamiento ni evaluaciones de sesgo demográfico, de género o cultural. Al ser un modelo de generación visual, puede reproducir estereotipos presentes en los datos originales.
- Degradación por cuantización no medida: no se publican métricas de FID, CLIP score ni comparaciones cualitativas entre Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0, FP8, INT8 y NVFP4. La calidad a 4 bits no está validada numéricamente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-11-06). No hay evidencia de validación por parte de la comunidad ni de mantenimiento continuado.
- Dependencia de componentes externos: requiere descargar por separado el text encoder Qwen3-VL 8B y el VAE; un error de versión o de carpeta en ComfyUI impide la ejecución.
- Idioma del prompt: no se documenta la lista de idiomas soportados por el text encoder en este contexto; el rendimiento con prompts en castellano no está verificado.
- Restricciones de resolución y sampling: el baseline turbo está calibrado para 8 pasos, CFG 1,0, sampler Euler y schedule sigma oficial; desviarse de estos parámetros puede degradar notablemente la calidad.
- Modelo de difusión, no de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso; no debe evaluarse con benchmarks de LLM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/T86/Qwen-Image-2.1-Turbo-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Documentación de Alibaba Cloud Model Studio: https://www.alibabacloud.com/help/en/model-studio/qwen-image-2-1-turbo
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantilla oficial de workflow: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_turbo_t2i.json
- GitHub del autor: https://github.com/abenzerps
- Formulario de peticiones de modelos del autor: https://abenzerps.com/request-a-model/
- Archivos de cuantización (ejemplos): https://huggingface.co/abenzerps/Qwen-Image-2.1-Turbo-Quantized/blob/main/qwen-image-2.1-turbo-Q4_K_M.gguf , https://huggingface.co/abenzerps/Qwen-Image-2.1-Turbo-Quantized/blob/main/qwen-image-2.1-turbo-int8_convrot.safetensors , https://huggingface.co/abenzerps/Qwen-Image-2.1-Turbo-Quantized/blob/main/qwen-image-2.1-turbo-NVFP4.safetensors , https://huggingface.co/abenzerps/Qwen-Image-2.1-Turbo-Quantized/blob/main/qwen-image-2.1-turbo-MLX-4bit.safetensors
- Text encoder y VAE: https://huggingface.co/abenzerps/Qwen-Image-2.1-Turbo-Quantized/blob/main/text_encoders/qwen3vl_8b_int8_convrot.safetensors , https://huggingface.co/abenzerps/Qwen-Image-2.1-Turbo-Quantized/blob/main/vae/qwen_image_2.1_vae_bf16.safetensors
