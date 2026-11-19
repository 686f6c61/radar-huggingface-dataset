# udero/minimax-h3-turbo-gguf

## Resumen

MiniMax-H3 FL2VA 8-Step Turbo (GGUF horneado) es una suite de pesos cuantizados del modelo fundacional MiniMax-H3 en su variante FL2VA (generación de vídeo de alta definición con audio estéreo nativo sincronizado, a partir de primer fotograma o de texto). El repositorio lo publica el usuario udero y deriva del modelo base `unsloth/MiniMax-H3-GGUF`. La innovación principal no está en el modelo fundacional, sino en el proceso de empaquetado: el LoRA oficial de destilación Turbo de 8 pasos se fusiona de forma permanente en los pesos base mediante fusión matricial en FP32, de modo que la generación en 8 pasos funciona sin cargar adaptadores en tiempo de ejecución.

El modelo resuelve un problema práctico de despliegue: aplicar LoRA en tiempo de ejecución sobre pesos GGUF cuantizados provoca picos de desquantización en VRAM (con riesgo de OOM en GPUs de consumo) o fuerza una ejecución lenta en doble rama. Al hornear el adaptador, se elimina esa sobrecarga y se permite ejecutar la generación de vídeo con audio en una única GPU de 12 GB mediante streaming dinámico de capas.

El resultado es un conjunto de cinco cuantizaciones (UD-Q3_K_XL, Q4_K_M, Q5_0, Q6_K y Q8_0) que cubren desde 8,90 GiB hasta 19,97 GiB, con un total de 20.111.438.744 parámetros en el modelo de referencia. La licencia es "other" y no se especifican idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de vídeo (text-to-video / image-to-video) con audio estéreo nativo; variante FL2VA de MiniMax-H3 |
| Parámetros totales | 20.111.438.744 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | UD-Q3_K_XL, Q4_K_M, Q5_0, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF (pesos horneados con LoRA Turbo fusionado) |
| Pasos de muestreo | 8 (Euler) con CFG 1.0 |
| Salida | Vídeo sincronizado + audio estéreo nativo a 32 kHz |
| Tamaño del repo | 72,9 GB |
| Modelo base | unsloth/MiniMax-H3-GGUF |
| Adaptador fusionado | minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo fundacional MiniMax-H3 en su variante FL2VA, orientada a la generación de vídeo de alta definición con audio estéreo nativo sincronizado. El repositorio no documenta detalles internos de la arquitectura (tipo de transformer, mecanismo de atención, número de tokens de entrenamiento ni composición del dataset), por lo que esos datos deben considerarse no disponibles en esta ficha. Lo que sí se documenta es el pipeline de generación: un modelo de difusión principal (el UNet/DiT cuantizado), un VAE de vídeo en FP16, un VAE de audio en FP32 y un codificador de texto basado en Qwen3-VL de 32B (`qwen3vl_32b_minimax_h3-Q4_K_M.gguf`).

La innovación técnica del repositorio es el horneado del LoRA Turbo. El adaptador oficial de destilación de 8 pasos se fusiona offline con los pesos base mediante la fórmula W_horneado = Quantize(Dequantize(W_base) + (α/r)(B × A)), aplicada en FP32 antes de recuantizar. Esto elimina la necesidad de un nodo `LoraLoader` en ComfyUI y evita los picos de VRAM asociados a la desquantización en tiempo de ejecución. El resultado es una generación en 8 pasos con CFG 1.0 que, según el autor, mantiene fidelidad cercana a la del modelo completo de 50 pasos.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de una imagen o primer fotograma (image-to-video / first-frame latent).
- Generación de audio estéreo nativo a 32 kHz sincronizado con el vídeo.
- Generación en 8 pasos con CFG 1.0, sin necesidad de cargar adaptadores LoRA en tiempo de ejecución.
- Ejecución con streaming dinámico de capas (`--auto-fit on`) para ajustar el modelo a VRAM limitada.
- Integración con ComfyUI mediante `UnetLoaderGGUF` y con `stable-diffusion.cpp` (`sd-cli`).
- Soporte de reparto entre dos GPUs (dual-GPU splitter) según la model card.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo, dado que es un modelo generativo de vídeo, no un LLM conversacional.

## Casos de uso

- Generación de vídeo publicitario de formato corto: el modelo produce clips con audio sincronizado en 8 pasos, lo que permite iterar rápidamente sobre variaciones creativas sin reentrenar ni recargar adaptadores.
- Prototipado de escenas cinematográficas a partir de un primer fotograma: la variante FL2VA permite animar una imagen fija con movimiento y audio coherentes, útil para storyboards animados.
- Creación de contenido para redes sociales en hardware de consumo: con la cuantización UD-Q3_K_XL (8,90 GiB) cabe en una RTX 3060 de 12 GB, lo que democratiza la generación de vídeo con audio en equipos modestos.
- Doblaje y sonorización automática de clips: el audio estéreo nativo a 32 kHz sincronizado evita un pipeline separado de generación de audio y alineación.
- Integración en flujos de ComfyUI para estudios pequeños: al no requerir nodo `LoraLoader`, el grafo se simplifica y se reduce el consumo de VRAM en producción.
- Generación de vídeo por lotes en servidores con una sola GPU: el streaming dinámico de capas permite procesar colas de trabajos en GPUs de 12-24 GB sin necesidad de hardware de datacenter.
- Experimentación e investigación en destilación de modelos de difusión: el repositorio sirve como referencia de cómo hornear un LoRA Turbo en pesos GGUF manteniendo la fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un artículo técnico con análisis de memoria y rendimiento, pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas de calidad de vídeo (FVD, CLIP score, etc.) en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - UD-Q3_K_XL: 8,90 GiB (aproximadamente 3,1 GB de margen en GPUs de 12 GB).
  - Q4_K_M: 10,64 GiB (cabe en GPUs de 12 GB).
  - Q5_0: 12,97 GiB (punto de equilibrio calidad/memoria).
  - Q6_K: 15,45 GiB (mayor fidelidad en texturas finas y texto).
  - Q8_0: 19,97 GiB (recomendado para equipos con 64 GB+ de RAM).
- GPU recomendadas: RTX 3060 12 GB (confirmada por el autor con `--auto-fit on`), GPUs de 16-24 GB para Q5_0/Q6_K, y equipos con 64 GB+ de RAM para Q8_0.
- Cabe en GPU de consumo: sí, al menos en RTX 3060 12 GB con la cuantización UD-Q3_K_XL o Q4_K_M.
- Opciones de despliegue: `stable-diffusion.cpp` (`sd-cli`) y ComfyUI (`UnetLoaderGGUF`). También se menciona reparto dual-GPU.
- Dependencias adicionales: VAE de vídeo FP16 (`minimax_h3_video_vae_fp16.safetensors`), VAE de audio FP32 (`minimax_h3_audio_vae_fp32.safetensors`) y codificador de texto Qwen3-VL 32B cuantizado (`qwen3vl_32b_minimax_h3-Q4_K_M.gguf`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| udero/minimax-h3-turbo-gguf | Difusión vídeo + audio, GGUF horneado | 20.111.438.744 | no disponible | other | Hugging Face (3712 descargas) |
| unsloth/MiniMax-H3-GGUF | Difusión vídeo + audio, GGUF base | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| MiniMax-H3 original (FL2VA) | Difusión vídeo + audio, FP16 | no disponible | no disponible | no disponible | Requiere 50 pasos y LoRA en runtime |

La comparativa se limita a las variantes del mismo modelo fundacional porque la información proporcionada no incluye datos de otros modelos de generación de vídeo con audio (por ejemplo, Veo, Sora, Wan o HunyuanVideo). No se dispone de métricas de calidad comparables.

## Limitaciones y advertencias

- La licencia es "other" y no se detalla en la información disponible; es imprescindible revisar los términos del modelo base y del adaptador Turbo antes de un uso comercial.
- El modelo es una variante cuantizada y horneada de un modelo fundacional; las cuantizaciones Q3 y Q4 pueden degradar la fidelidad de texturas finas, texto en pantalla y definición de bordes.
- El horneado del LoRA es irreversible: no se puede desactivar el modo Turbo ni recuperar el comportamiento de 50 pasos desde estos pesos.
- Requiere componentes adicionales (VAE de vídeo, VAE de audio y codificador Qwen3-VL 32B) que no están incluidos en el repositorio y deben descargarse por separado.
- El streaming dinámico de capas (`--auto-fit on`) introduce latencia adicional y depende del ancho de banda de PCIe; el rendimiento en GPUs de 12 GB puede ser limitado.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos; al ser un modelo generativo de vídeo, existe riesgo de contenido no fiel a la indicación (artefactos, incoherencias temporales, desincronización audio-vídeo).
- El repositorio tiene solo 1 like y 3712 descargas, lo que sugiere una validación comunitaria limitada.
- No se han publicado benchmarks de calidad de vídeo ni de audio en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/udero/minimax-h3-turbo-gguf
- Archivos y versiones: https://huggingface.co/udero/minimax-h3-turbo-gguf/tree/main
- Modelo base: https://huggingface.co/unsloth/MiniMax-H3-GGUF
- Adaptador Turbo (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3/tree/main/loras
- Artículo técnico del autor: https://udero.io/blog/running-minimax-h3-on-a-single-rtx-3060-12gb-gpu-my-experiment-with-gguf-lora-and-dynamic-loading
- Descarga directa UD-Q3_K_XL: https://huggingface.co/udero/minimax-h3-turbo-gguf/resolve/main/minimax_h3_fl2va_turbo_baked-UD-Q3_K_XL.gguf
- Descarga directa Q4_K_M: https://huggingface.co/udero/minimax-h3-turbo-gguf/resolve/main/minimax_h3_fl2va_turbo_baked-Q4_K_M.gguf
- Descarga directa Q5_0: https://huggingface.co/udero/minimax-h3-turbo-gguf/resolve/main/minimax_h3_fl2va_turbo_baked-Q5_0.gguf
- Descarga directa Q6_K: https://huggingface.co/udero/minimax-h3-turbo-gguf/resolve/main/minimax_h3_fl2va_turbo_baked-Q6_K.gguf
- Descarga directa Q8_0: https://huggingface.co/udero/minimax-h3-turbo-gguf/resolve/main/minimax_h3_fl2va_turbo_baked-Q8_0.gguf
