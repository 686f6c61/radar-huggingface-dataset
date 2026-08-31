# taurusduan/Minimax-H3-Super-Acceleration-Comfy

## Resumen

Este repositorio es un paquete de modelos preparado para ComfyUI que implementa la técnica **H3 Super Acceleration** de NVIDIA aplicada al modelo MiniMax H3. El paquete combina los pesos de LTX-2.5 (transformador, text encoder, VAE, LoRA destilada y upscaler) con el flujo de trabajo de aceleración que usa MiniMax H3 como generador de borrador y LTX-2.5 como refinador, reduciendo drásticamente el tiempo de generación de video manteniendo el audio nativo de MiniMax H3. El repositorio tiene un tamaño de 48,3 GB y está pensado para ser colocado directamente en el directorio `ComfyUI/models` con la estructura de carpetas indicada.

El autor es taurusduan, y el paquete se apoya en el nodo de ComfyUI [MiniMax H3 Audio T8](https://github.com/T8mars/comfyui-minimax-h3-audio-T8). La model card no especifica licencia, idiomas ni pipeline, pero indica que los archivos individuales conservan las licencias de sus proyectos upstream (LTX-2.5, Gemma4, TAEHV). Es relevante porque permite ejecutar la generación de video de MiniMax H3 con una aceleración de hasta 27,7x en hardware NVIDIA GB200, según el artículo de ComfyUI Wiki.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete de modelos para ComfyUI: transformer LTX-2.5-22B + text encoder Gemma4-12B + LoRA destilada + VAE LTX-2.5 + upscaler latente + TAEHV |
| Parametros totales | No disponible (el paquete incluye varios modelos; el transformer LTX-2.5 tiene 22B según el nombre del archivo) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Los archivos del paquete incluyen `int8-convrot` en los nombres de los safetensors (transformador y text encoder); la LoRA está en `bf16` |
| Idiomas soportados | No disponible (el text encoder Gemma4-12B soporta multiples idiomas, pero no se especifica) |
| Licencia | No disponible (los archivos siguen las licencias de sus upstreams, que no se detallan) |
| Formato de pesos | safetensors (`.safetensors`), además de un archivo `.pth` para TAEHV |

## Arquitectura y entrenamiento

El paquete no es un modelo entrenado desde cero, sino una colección de pesos y adaptadores que implementan el pipeline de **H3 Super Acceleration** de NVIDIA. El flujo consiste en que MiniMax H3 genera un video borrador en 4 pasos de muestreo, y luego LTX-2.5 refina el resultado en 3 pasos adicionales, produciendo video de 5 segundos a 768p en aproximadamente 6,85 segundos en un GB200. El audio generado por MiniMax H3 se conserva y se reutiliza al final, evitando que el refinador lo modifique.

El transformador LTX-2.5-22B (22 mil millones de parámetros) actúa como refinador, acompañado de un text encoder Gemma4-12B con proyección para LTX-2.5. Se incluye una LoRA destilada de 450 pasos en `bf16` que permite reducir el número de pasos de refinamiento. El paquete también contiene un VAE de video LTX-2.5, un upscaler espacial latente x2 y el extractor de tokens TAEHV. El mecanismo de atención puede ser Sol-Attn (aceleración opcional) o Dense Attention si Sol-Attn no está instalado.

## Capacidades

- Generación de video acelerada mediante el flujo de dos etapas (borrador MiniMax H3 + refinador LTX-2.5).
- Conservación del audio nativo estéreo generado por MiniMax H3, que se reutiliza al final del pipeline.
- Soporte de resoluciones objetivo de hasta 1920×1088 (según el workflow incluido).
- Integración directa con ComfyUI mediante el nodo MiniMax H3 Audio T8.
- Uso de LoRA destilada para reducir el número de pasos de refinamiento (3 pasos por defecto).
- Aceleración opcional mediante Sol-Attn; si no está instalado, se usa atención densa automáticamente.
- Incluye upscaler latente espacial x2 y TAEHV para la tokenización de video.

## Casos de uso

- **Generación de video en local con ComfyUI**: el paquete permite crear videos de hasta 15 segundos (limitación de MiniMax H3) con audio sincronizado, directamente desde un flujo de trabajo visual, sin necesidad de servicios en la nube.
- **Prototipado rápido de ideas audiovisuales**: gracias a la aceleración de hasta 27,7x, los creadores pueden iterar sobre guiones y storyboards generando múltiples variantes en minutos en lugar de horas.
- **Postproducción y previsualización**: el upscaler latente x2 permite generar a menor resolución y luego ampliar, reduciendo el coste computacional durante el proceso creativo.
- **Investigación en generación de video**: el flujo de dos etapas (borrador + refinador) es útil para estudiar técnicas de destilación y aceleración de modelos de difusión.
- **Producción de contenido para redes sociales**: con resoluciones de hasta 1088p y audio nativo, se pueden generar clips cortos listos para plataformas como YouTube Shorts o TikTok.
- **Integración en pipelines de automatización**: al ser un paquete de ComfyUI, se puede combinar con otros nodos para crear flujos de generación de video programáticos (por ejemplo, mediante la API de ComfyUI).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la informacion disponible. Sin embargo, el artículo de ComfyUI Wiki sobre NVIDIA H3 Super Acceleration reporta los siguientes datos de rendimiento:

| Métrica | Valor |
|---|---|
| Tiempo de generación de video de 5 segundos a 768p | 6,85 segundos |
| Aceleración frente a SGLang (en un GB200) | hasta 27,7x |
| Pasos de borrador (MiniMax H3) | 4 |
| Pasos de refinamiento (LTX-2.5) | 3 |

Estos datos provienen del artículo externo y no de pruebas realizadas por el autor del repositorio.

## Requisitos de hardware

- El repositorio ocupa 48,3 GB en disco, pero los archivos suman aproximadamente 45 GB según la model card.
- Los pesos incluyen un transformer de 22B y un text encoder de 12B, por lo que se requiere una GPU con alta capacidad de VRAM. No se especifica una cifra exacta, pero para cargar el transformer en `int8` se estima al menos 16-20 GB de VRAM, y el text encoder en `int8` añade unos 8-10 GB adicionales. En total, se recomienda una GPU con 32 GB o más (por ejemplo, A100, H100, RTX 4090 con 24 GB podría quedarse corta si se cargan todos los componentes simultáneamente).
- El artículo de NVIDIA menciona un GB200, lo que sugiere que el rendimiento óptimo se obtiene en hardware de centro de datos.
- Para despliegue local, se puede usar ComfyUI con el nodo MiniMax H3 Audio T8. No se mencionan alternativas como vLLM u Ollama, ya que el paquete está diseñado específicamente para ComfyUI.
- La latencia reportada de 6,85 segundos para 5 segundos de video a 768p se logra en un GB200; en GPUs de consumo será mayor.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de generación de video. El paquete no es un modelo independiente, sino una combinación de LTX-2.5 y MiniMax H3 para aceleración. Como referencia:

| Modelo | Características | Rendimiento | Licencia |
|---|---|---|---|
| MiniMax H3 (original) | Generación omni-modal con audio nativo, hasta 2K y 15 s | Más lento sin aceleración | No especificada |
| LTX-2.5 | Modelo de difusión de video de 22B | No disponible | No especificada |
| Este paquete | Aceleración mediante refinamiento con LTX-2.5 | 27,7x más rápido que SGLang en GB200 | No disponible |

## Limitaciones y advertencias

- La licencia de este paquete no está especificada. Los archivos individuales heredan las licencias de sus proyectos upstream (LTX-2.5, Gemma4, TAEHV), que deben consultarse antes de un uso comercial.
- El paquete depende del nodo ComfyUI MiniMax H3 Audio T8 y de la instalación correcta de todos los archivos en las carpetas indicadas. Si falta algún componente, el flujo no funcionará.
- El audio de MiniMax H3 se conserva, pero el video final es generado por LTX-2.5. Esto puede provocar diferencias de estilo entre el borrador y el resultado refinado.
- La aceleración óptima (27,7x) se ha medido en hardware GB200; en GPUs de consumo la ganancia será menor.
- No se proporcionan datos sobre sesgos, alucinaciones o calidad del audio en este paquete específico.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto reciente o poco utilizado; se recomienda verificar la fiabilidad del contenido.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/taurusduan/Minimax-H3-Super-Acceleration-Comfy)
- [GitHub de MiniMax H3](https://github.com/MiniMax-AI/MiniMax-H3)
- [NVIDIA H3 Super Acceleration](https://nvlabs.github.io/Sana/Sol-Engine/H3-Super-Acceleration/)
- [Lightricks LTX-2.5 (referido en la model card)](https://huggingface.co/Lightricks/LTX-2.3)
- [TAEHV](https://github.com/madebyollin/taehv)
- [Nodo ComfyUI MiniMax H3 Audio T8](https://github.com/T8mars/comfyui-minimax-h3-audio-T8)
- [Artículo de ComfyUI Wiki sobre H3 Super Acceleration](https://comfyui-wiki.com/en/news/2026-08-17-nvidia-h3-super-acceleration)
