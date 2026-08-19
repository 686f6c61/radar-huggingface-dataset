# wangpj/MiniMax-H3_dit_bf16

## Resumen

MiniMax H3 es un sistema generativo omni-modal desarrollado por MiniMax AI, diseñado para la comprensión unificada de contextos multimodales compuestos por texto, imágenes, vídeo y audio, así como para la generación de vídeo con audio estéreo nativo sincronizado en una única pasada de inferencia. El modelo es capaz de producir clips de hasta 15 segundos de duración con resoluciones de hasta 2K, integrando tanto el canal visual como el auditivo de forma coherente, lo que lo diferencia de otros generadores de vídeo que requieren pipelines separados para audio y vídeo.

Este repositorio concreto, `wangpj/MiniMax-H3_dit_bf16`, no contiene el modelo original, sino un reempaquetado de los pesos oficiales adaptado para su uso directo en ComfyUI. Incluye los modelos de difusión en varias cuantizaciones (bf16, int8_convrot, fp8_scaled), el codificador de texto Qwen3-VL-32B en tres formatos, LoRAs para inferencia acelerada (turbo de 4 y 8 pasos) y los VAE de audio y vídeo. La relevancia de este repositorio radica en que simplifica el despliegue local del modelo en un entorno de nodos visuales, evitando al usuario la tarea de convertir y organizar los archivos manualmente.

El tamaño del repositorio es de 481,4 GB, lo que refleja la magnitud del conjunto de pesos necesario para ejecutar el sistema completo. La licencia es la `minimax-h3-community-license-agreement`, una licencia comunitaria que permite uso comercial bajo ciertas condiciones, pero que conviene revisar antes de desplegar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion joint multimodal (video + audio sincronizado) con codificador de texto Qwen3-VL-32B |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de video, no de texto) |
| Tipos de cuantizacion | bf16, int8_convrot, fp8_scaled, nvfp4_awq (solo codificador de texto) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

MiniMax H3 emplea una arquitectura de difusion conjunta que procesa simultaneamente los canales de video y audio en lugar de tratarlos por separado. Esto permite que el audio generado este sincronizado temporalmente con las imagenes, incluyendo efectos sonoros, dialogo y musica ambiental coherentes con la escena. El modelo base acepta entradas multimodales (texto, imagenes, video y audio) para tareas de comprension y generacion.

El repositorio de `wangpj` organiza los componentes de la siguiente manera: los modelos de difusion principales (`minimax_h3_fl2va` y `minimax_h3_ref2va`) estan disponibles en bf16, int8_convrot y fp8_scaled. La variante `fl2va` corresponde al modelo de texto/video a video, mientras que `ref2va` es la variante de referencia. El codificador de texto es Qwen3-VL-32B, disponible en bf16, int8_convrot y nvfp4_awq, siendo esta ultima una cuantizacion que no requiere GPU Blackwell para su ejecucion. Se incluyen tambien LoRAs turbo que reducen el numero de pasos de inferencia a 4 u 8, acelerando significativamente la generacion. Los VAE de audio (fp32) y video (fp16) se proporcionan por separado.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens o el proceso de alineacion (RLHF/DPO) en la documentacion publica disponible. El modelo original de MiniMax AI no publica estos detalles en su model card oficial.

## Capacidades

- Generacion de video de alta calidad (hasta 2K, 15 segundos) con audio estéreo nativo sincronizado en una sola pasada.
- Comprension multimodal unificada: el modelo puede procesar texto, imagenes, video y audio como entrada.
- Texto a video (T2V): genera video y audio a partir de una descripcion textual.
- Imagen a video (I2V): anima una imagen estatica con movimiento y audio coherente.
- Referencia a video (R2V): genera video basandose en una imagen de referencia, manteniendo la identidad visual.
- Inferencia acelerada mediante LoRAs turbo (4 y 8 pasos) que reducen el coste computacional sin una perdida de calidad significativa.
- Compatibilidad con ComfyUI: los pesos estan reempaquetados para integrarse directamente en el ecosistema de nodos.

## Casos de uso

- Produccion audiovisual para marketing: generar clips promocionales de productos con locucion y efectos de sonido sincronizados directamente desde una descripcion textual, sin necesidad de un equipo de postproduccion.
- Creacion de contenido para redes sociales: producir videos cortos con audio para plataformas como TikTok o Instagram Reels, combinando la generacion de video y musica en un solo paso.
- Desarrollo de videojuegos y prototipos: generar secuencias cinemáticas de referencia con audio para validar conceptos de direccion de arte antes de la produccion final.
- Doblaje y localizacion de contenido: el modelo puede generar audio sincronizado con video, lo que permite crear versiones localizadas de contenido con voces y efectos coherentes.
- Educacion y formacion: crear materiales didacticos en video con narracion y diagramas animados a partir de guiones de texto, reduciendo el tiempo de produccion.
- Investigacion en IA multimodal: el modelo sirve como base para experimentos en generacion conjunta de video y audio, permitiendo estudiar la coherencia intermodal y el alineamiento temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye comparativas con otros modelos de generacion de video, ni datos sobre FVD (Fréchet Video Distance), CLIP score o metricas de calidad de audio.

## Requisitos de hardware

- El repositorio completo ocupa 481,4 GB, por lo que se requiere almacenamiento de alta velocidad (NVMe) y suficiente espacio libre.
- Los modelos de difusion en bf16 requieren una GPU con al menos 80 GB de VRAM (por ejemplo, A100 o H100) para cargar el modelo completo. Las versiones int8_convrot y fp8_scaled reducen el requisito de VRAM, aunque el valor exacto no se especifica.
- El codificador de texto Qwen3-VL-32B en nvfp4_awq esta disenado para no requerir GPU Blackwell, lo que permite su uso en GPUs como RTX 4090 (24 GB VRAM) o A100.
- Para uso en ComfyUI, se recomienda una GPU con al menos 24 GB de VRAM para las versiones cuantizadas, aunque el modelo de difusion completo en bf16 probablemente requiera mas.
- Opciones de despliegue: ComfyUI es el entorno principal soportado por este reempaquetado. No se proporcionan archivos GGUF ni integracion con vLLM o TGI.
- La inferencia con LoRAs turbo de 4 pasos reduce el tiempo de generacion, aunque no se proporcionan cifras concretas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion maxima | Duracion maxima | Audio nativo | Licencia |
|---|---|---|---|---|---|
| MiniMax H3 | Difusion multimodal | 2K | 15 s | Si | Comunitaria |
| Kling 1.5 (Kuaishou) | Difusion video | 1080p | 10 s | No | Propietaria |
| Runway Gen-3 Alpha | Difusion video | 1080p | 10 s | No | Propietaria |
| Sora (OpenAI) | Difusion video | 1080p | 60 s | No | Propietaria |

MiniMax H3 es el unico de los modelos comparados que genera audio estéreo sincronizado de forma nativa, lo que lo diferencia claramente de alternativas que requieren un paso adicional de generacion de audio. Su licencia comunitaria permite un uso mas flexible que las licencias propietarias de Kling, Runway o Sora, aunque con restricciones que deben revisarse. La duracion maxima de 15 segundos es inferior a la de Sora, pero superior a la de Kling y Gen-3 Alpha.

## Limitaciones y advertencias

- La licencia `minimax-h3-community-license-agreement` debe revisarse detenidamente antes de un uso comercial; puede imponer restricciones sobre el volumen de usuarios o el tipo de aplicaciones permitidas.
- El tamano del repositorio (481,4 GB) hace que la descarga y el almacenamiento sean un desafio logistico considerable.
- No se dispone de informacion sobre los idiomas soportados ni sobre la calidad de generacion en idiomas distintos del ingles.
- El modelo puede generar contenido que refleje sesgos presentes en los datos de entrenamiento, aunque no se han publicado evaluaciones de sesgo especificas.
- La generacion de video con audio sincronizado es computacionalmente intensiva; los requisitos de hardware pueden superar las capacidades de estaciones de trabajo convencionales.
- No se proporcionan benchmarks publicos, lo que dificulta la comparacion objetiva con otros modelos de generacion de video.
- El reempaquetado de `wangpj` no incluye el codigo de inferencia original, por lo que el usuario depende de la integracion con ComfyUI y de los nodos proporcionados por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wangpj/MiniMax-H3_dit_bf16
- Modelo original en HuggingFace: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio GitHub oficial: https://github.com/MiniMax-AI/MiniMax-H3
- Repositorio turbo (lightx2v): https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Codificador de texto NVFP4: https://huggingface.co/cybermotaz/Qwen3-VL-32B-Instruct-NVFP4
- Workflow T2V (ComfyUI): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_t2v.json
- Workflow I2V (ComfyUI): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v.json
- Workflow R2V (ComfyUI): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_r2v.json
- Documentacion tecnica en DeepWiki: https://deepwiki.com/ai-models-lab/minimax-h3/4-minimax-h3-model-reference
- Guia de archivos y descargas: https://minimaxh3.run/minimax-h3-model-files-downloads
