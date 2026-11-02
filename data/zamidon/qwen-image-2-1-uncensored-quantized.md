# Zamidon/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es una redistribucion cuantizada del modelo de generacion de imagenes Qwen/Qwen-Image-2.1, publicada por el usuario Zamidon (con enlaces de descarga que apuntan al espacio abenzerps). El paquete reune los pesos del transformer de difusion en multiples formatos (GGUF, safetensors FP8/INT8/NVFP4 y MLX) junto con el text encoder Qwen3-VL 8B y el VAE necesarios para ejecutarlo en ComfyUI, lo que facilita la inferencia local en hardware de consumo.

El modelo resuelve el problema del despliegue local de un generador texto-a-imagen de gran tamano: el transformer original BF16 ocupa 14,23 GB, mientras que las variantes cuantizadas bajan hasta 4,00-4,60 GB (MLX 4-bit, NVFP4, Q4_0, Q4_K_M), permitiendo ejecutarlo en GPUs de 8-12 GB de VRAM o en Apple Silicon. La etiqueta "Uncensored" indica que se han retirado o relajado los filtros de contenido del modelo base, lo que condiciona su uso etico y legal.

La relevancia actual radica en la combinacion de un text encoder potente (Qwen3-VL 8B, con capacidad de comprension visual) y un conjunto de cuantizaciones optimizadas por backend (GGUF para llama.cpp/ComfyUI-GGUF, NVFP4 para GPUs Blackwell, MLX para Apple Silicon), empaquetadas en un unico repositorio de 105,2 GB. El modelo cuenta con 7.115.124.736 parametros en el transformer de difusion segun los safetensors publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (transformer de difusion; detalles internos no disponibles) |
| Parametros totales | 7.115.124.736 (transformer de difusion, segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; el text encoder Qwen3-VL 8B tiene su propio contexto, no especificado en la informacion) |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4/6/8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible (prompts en lenguaje natural; el text encoder Qwen3-VL 8B es multilingue, pero no se detalla) |
| Licencia | qwen-research (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF, safetensors (FP8, INT8, NVFP4, MLX), BF16 GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del transformer de difusion de Qwen-Image-2.1 (numero de bloques, tipo de atencion, mecanismo de condicionamiento). Se sabe que el pipeline emplea un text encoder Qwen3-VL 8B en BF16 (17,53 GB) o INT8 ConvRot (9,35 GB) y un VAE propio (qwen_image_2.1_vae_bf16, 676 MB), empaquetados para ComfyUI. El transformer de difusion tiene 7.115.124.736 parametros y los pesos BF16 ocupan 14,23 GB, lo que es coherente con esa cifra.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o filtrado de contenido. La variante "Uncensored" implica una modificacion de los pesos o del pipeline respecto al modelo base para reducir las restricciones de generacion, pero el autor no documenta el procedimiento exacto (fine-tuning, merging, ablacion de direcciones de rechazo, etc.). Las cuantizaciones incluyen innovaciones de backend como INT8 ConvRot (rotacion de canales para preservar precision) y NVFP4 (formato de 4 bits nativo de GPUs NVIDIA Blackwell), orientadas a mantener calidad con menor huella de memoria.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image) mediante difusion.
- Comprension de prompts complejos gracias al text encoder Qwen3-VL 8B, que aporta capacidad de razonamiento visual y linguistico.
- Generacion sin filtros de contenido (variante "Uncensored"), incluyendo material que el modelo base rechazaria.
- Ejecucion local en ComfyUI mediante el nodo ComfyUI-GGUF (fork de leejet con soporte nativo para Qwen-Image 2.1).
- Soporte de multiples backends de cuantizacion: GGUF (CPU/GPU via llama.cpp-style), FP8/INT8/NVFP4 (GPUs NVIDIA), MLX (Apple Silicon).
- No se documentan capacidades de tool calling, agentes, audio ni modo thinking; es un modelo puramente generativo de imagen.

## Casos de uso

- Generacion de ilustraciones y concept art en estaciones de trabajo locales: con la cuantizacion Q4_K_M (4,60 GB) o NVFP4 (4,20 GB) el modelo cabe en GPUs de 8-12 GB, permitiendo iterar prompts sin coste por API.
- Creacion de contenido para videojuegos y prototipado rapido: el pipeline ComfyUI permite encadenar el modelo con nodos de upscaling, inpainting o controlnet para producir assets coherentes en un flujo de trabajo reproducible.
- Investigacion sobre seguridad y alineacion de modelos generativos: la variante "Uncensored" sirve para estudiar que contenido se filtra en el modelo base y como se comportan los clasificadores de seguridad, en entornos controlados.
- Despliegue en Apple Silicon para disenadores: las variantes MLX 4-bit (4,00 GB) y 6-bit (5,78 GB) permiten generar imagenes en Macs con memoria unificada, sin GPU dedicada.
- Generacion de imagenes por lotes en servidores con GPUs Blackwell: NVFP4 (4,20 GB) e INT8 ConvRot (6,76 GB) reducen el uso de VRAM y aumentan el throughput en comparacion con BF16.
- Fine-tuning o LoRA sobre el modelo cuantizado: los pesos GGUF y safetensors permiten experimentar con adaptadores sobre una base ligera antes de escalar a BF16.
- Prototipado de pipelines texto-a-imagen en ComfyUI: el repositorio incluye text encoder y VAE empaquetados, lo que simplifica la instalacion y reduce errores de compatibilidad.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) pero no se proporcionan los valores numericos en texto. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo transformer de difusion): BF16 ~14,23 GB; FP8/INT8 ~6,6-6,8 GB; NVFP4 ~4,20 GB; GGUF Q4_K_M ~4,60 GB; MLX 4-bit ~4,00 GB.
- A esa cifra hay que sumar el text encoder: Qwen3-VL 8B en BF16 ocupa 17,53 GB, o 9,35 GB en INT8 ConvRot (recomendado para menor memoria), mas el VAE (676 MB).
- GPU recomendadas: NVIDIA H100/A100 para BF16; RTX 4090 (24 GB) para BF16 o FP8; RTX 4080/4070 Ti (12-16 GB) para Q4_K_M o FP8 con text encoder INT8; GPUs Blackwell para NVFP4.
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_M, Q4_0, NVFP4 o MLX 4-bit, siempre que se use el text encoder en INT8 y se gestione la memoria por etapas.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork de leejet), MLX para Apple Silicon, y safetensors FP8/INT8/NVFP4 en pipelines compatibles con PyTorch.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Quantized | 7.115.124.736 (transformer) | No disponible | qwen-research | HuggingFace (GGUF, safetensors, MLX) |
| Qwen/Qwen-Image-2.1 (base) | No disponible en la informacion | No disponible | qwen-research | HuggingFace |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo con otros generadores texto-a-imagen (FLUX, Stable Diffusion 3, etc.) en la informacion proporcionada, por lo que no se puede establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La variante "Uncensored" elimina o relaja los filtros del modelo base; puede generar contenido sexual, violento u ofensivo, con implicaciones legales y eticas segun la jurisdiccion.
- La licencia qwen-research suele restringir el uso comercial; es imprescindible revisar los terminos exactos antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay validacion de la comunidad sobre la calidad de las cuantizaciones.
- Los enlaces de descarga de la model card apuntan al espacio abenzerps, no al repositorio Zamidon, lo que puede indicar una redistribucion no oficial.
- No se documentan sesgos especificos, pero al derivar de un modelo entrenado con datos web, es probable que herede sesgos de representacion.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar detalles anatomicos o textuales incorrectos, especialmente con prompts complejos.
- El text encoder Qwen3-VL 8B en BF16 (17,53 GB) es el mayor consumidor de memoria; usar INT8 ConvRot es casi obligatorio en GPUs de consumo.
- No hay informacion sobre el contexto maximo del text encoder ni sobre el soporte real de idiomas distintos del ingles.
- La fecha de creacion (2026) y la ausencia de benchmarks numericos impiden verificar las afirmaciones de calidad del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Zamidon/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork con soporte Qwen-Image 2.1): https://github.com/leejet/ComfyUI-GGUF
- Solicitudes de modelos (mencionado en la model card): https://abenzerps.com/request-a-model/
