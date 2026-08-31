# taurusduan/MiniMax-H3

## Resumen

Este repositorio, `taurusduan/MiniMax-H3`, no contiene el modelo original sino un reempaquetado de los archivos del modelo MiniMax H3, un modelo de generación omni-modal de vídeo desarrollado por MiniMax. El paquete está preparado específicamente para su uso en ComfyUI, un entorno de generación de imágenes y vídeo por nodos. El modelo original, MiniMax H3, es un modelo de difusión que genera vídeo con audio estéreo nativo, hasta 2K de resolución y 15 segundos de duración, según la información publicada por MiniMax en su blog.

El repositorio incluye los componentes necesarios para ejecutar el modelo en ComfyUI: archivos de difusión (modelos principales), text encoder (basado en Qwen3-VL-32B), VAE de vídeo y audio, LoRAs de aceleración (para pasos reducidos) y embeddings específicos para estilos visuales. El tamaño total del repositorio es de 471 GB, lo que refleja la magnitud del modelo. La licencia es la `minimax-h3-community-license-agreement`, que debe revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion multimodal (video + audio) con text encoder Qwen3-VL-32B y VAE separados para video y audio |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8_convrot, fp8_scaled, nvfp4_awq (para el text encoder) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Según la informacion disponible, MiniMax H3 es un modelo de difusion multimodal que genera video con audio sincronizado de forma nativa. El modelo emplea un text encoder basado en Qwen3-VL-32B para la codificacion de texto e imagenes, y VAE separados para video y audio. El repositorio incluye multiples variantes del modelo de difusion (fl2va y ref2va) con distintas cuantizaciones (bf16, int8_convrot, fp8_scaled), asi como LoRAs de aceleracion para generacion en 4 u 8 pasos. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens o el proceso de alineacion (RLHF/DPO). El modelo original fue presentado por MiniMax en su blog oficial, pero los detalles tecnicos completos no estan incluidos en este repositorio.

## Capacidades

- Generacion de video a partir de texto (T2V) con audio estereo nativo.
- Generacion de video a partir de imagen (I2V) con audio sincronizado.
- Generacion de video a partir de referencia (R2V), probablemente para transferencia de estilo o identidad.
- Resolucion de hasta 2K y duracion de hasta 15 segundos (segun el blog de MiniMax).
- Soporte de embeddings de estilo (por ejemplo, `minimaxh3_art_is_explosion`, `minimaxh3_bullet_time`, etc.) para controlar la estetica del video.
- Integracion con ComfyUI mediante workflows predefinidos (T2V, I2V, R2V).

## Casos de uso

- Creacion de contenido audiovisual para redes sociales: generar clips cortos con audio sincronizado a partir de descripciones de texto, ideal para plataformas como TikTok o Instagram Reels, gracias a la generacion nativa de audio estereo.
- Produccion de storyboards animados para cine y publicidad: los modos I2V y R2V permiten partir de imagenes de referencia o bocetos para obtener secuencias animadas de hasta 15 segundos, facilitando la previsualizacion de escenas.
- Doblaje y sincronizacion de audio para videos: al generar audio nativo junto con el video, se elimina la necesidad de postproducir la pista de sonido por separado, reduciendo costes en producciones de bajo presupuesto.
- Generacion de material educativo interactivo: crear animaciones explicativas con narracion integrada a partir de guiones de texto, util para cursos online o documentales divulgativos.
- Prototipado rapido en diseno de producto: generar videos conceptuales de productos o entornos a partir de imagenes fijas, permitiendo evaluar estetica y movimiento antes de la produccion final.
- Creacion de efectos visuales personalizados: los embeddings incluidos (explosiones, flores, bullet time, etc.) permiten aplicar estilos cinematicos concretos sin necesidad de edicion manual en software de postproduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas ni metricas de rendimiento (PSNR, FID, CLIP score, etc.) para el modelo MiniMax H3.

## Requisitos de hardware

- El tamano del repositorio (471 GB) indica que el modelo completo requiere almacenamiento masivo y probablemente multiples GPUs para cargar todos los componentes en memoria.
- La cuantizacion `int8_convrot` esta recomendada para su uso con PyTorch cu130, mientras que `fp8_scaled` es una alternativa cuando no se puede usar `int8_convrot`. Esto sugiere que se necesitan GPUs con soporte para estas precisiones (por ejemplo, GPUs NVIDIA Ampere o posteriores).
- El text encoder `nvfp4_awq` no requiere GPU Blackwell, lo que amplia la compatibilidad con GPUs consumer como RTX 3090, 4090, etc., aunque el modelo de difusion principal probablemente requiera mas VRAM.
- No se especifican requisitos minimos de VRAM. Dado el tamano del modelo, es razonable estimar que se necesitan al menos 24-48 GB de VRAM para inferencia con cuantizacion bf16, y menos con int8 o fp8.
- Para despliegue, el repositorio esta orientado a ComfyUI, por lo que se recomienda usar este entorno. No se mencionan otras opciones como vLLM o TGI, que son tipicas para modelos de lenguaje, no para modelos de difusion.
- La latencia y el throughput dependen en gran medida del hardware y de la cuantizacion elegida; los LoRAs de turbo (4 y 8 pasos) reducen el numero de pasos de inferencia, acelerando la generacion.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de generacion de video como Sora (OpenAI), Runway Gen-3 o Kling (Kuaishou). La informacion disponible no incluye parametros, rendimiento ni licencias de estos modelos para establecer una comparacion objetiva. Se recomienda consultar la documentacion oficial de MiniMax para obtener detalles adicionales.

## Limitaciones y advertencias

- La licencia `minimax-h3-community-license-agreement` debe revisarse detenidamente; puede imponer restricciones al uso comercial, redistribucion o modificacion.
- El repositorio es un reempaquetado de terceros (taurusduan) y no esta afiliado oficialmente con MiniMax. La integridad y seguridad de los archivos no estan garantizadas por el desarrollador original.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto del modelo. Como modelo de generacion de video, puede producir contenido con errores visuales o de sincronizacion de audio en escenarios complejos.
- El tamano del modelo (471 GB) hace que su despliegue sea inviable en hardware de consumo habitual; se requiere infraestructura de alto rendimiento.
- La generacion de video con audio nativo puede plantear problemas legales si se utiliza para crear contenido que infrinja derechos de autor o suplante a personas reales.

## Enlaces

- Repositorio original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio Turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Text encoder NVFP4 (fuente): https://huggingface.co/cybermotaz/Qwen3-VL-32B-Instruct-NVFP4
- Workflows de ComfyUI (T2V): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_t2v.json
- Workflows de ComfyUI (I2V): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v.json
- Workflows de ComfyUI (R2V): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_r2v.json
- Documentacion de ComfyUI: https://docs.comfy.org/tutorials/video/minimax/minimax-h3
- Blog oficial de MiniMax: https://www.minimax.io/blog/minimax-h3
- Hub no oficial: https://github.com/ai-models-lab/minimax-h3
- Repositorio GitHub oficial: https://github.com/MiniMax-AI/MiniMax-H3
