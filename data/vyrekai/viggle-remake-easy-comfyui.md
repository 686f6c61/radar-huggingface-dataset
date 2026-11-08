# vyrekai/Viggle-Remake-Easy-ComfyUI

## Resumen

Viggle Remake - EASY es un *workflow* de ComfyUI publicado por el usuario vyrekai que empaqueta dos flujos de trabajo listos para usar sobre el modelo de difusión de vídeo MiniMax H3 y los LoRA de Viggle Remake. No es un modelo de pesos en sí, sino un repositorio de orquestación (ficheros JSON de ComfyUI, nodos personalizados y una nota de descargas) que permite hacer *video-to-video* en dos modos: Swap (sustituir una persona o personaje del metraje) y Edit (cambiar objetos, fondo, clima o iluminación). Resuelve el problema de montar a mano un pipeline de edición de vídeo con difusión, que requiere encadenar modelo base, LoRA, codificador de texto, VAE de vídeo y VAE de audio, más un upscaler latente opcional.

El repositorio ofrece dos variantes según el hardware: una HQ para GPUs de 16 GB o más de VRAM, que usa MiniMax H3 en int8 junto con los LoRA de Viggle en safetensors, y otra para 12 GB de VRAM, que emplea los LoRA fusionados en GGUF Q8_0 (22,3 GB por fichero) o Q4_K_M (14,3 GB) y requiere el nodo ComfyUI-GGUF. Ambas admiten vídeos de 1 a 18 segundos y un upscale opcional a 1080p.

Es relevante ahora porque demuestra el patrón de distribución de *workflows* como artefactos versionados en Hugging Face: el usuario descarga JSON, modelos y nodos desde un único repositorio y obtiene un pipeline reproducible de edición de vídeo generativa en local, sin depender de una API. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que indica que solo contiene ficheros ligeros (JSON y ZIP), no pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Workflow de ComfyUI sobre modelo de difusión de vídeo MiniMax H3 (no se detalla la arquitectura interna de H3 en la información disponible) |
| Parametros totales | no disponible (el workflow no define un modelo propio; el modelo base es MiniMax H3 y el codificador de texto es Qwen3-VL 32B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el workflow admite vídeos de 1 a 18 s) |
| Tipos de cuantizacion | int8 (modelo base HQ), GGUF Q8_0 y Q4_K_M (variante 12 GB), NVFP4-AWQ (codificador de texto), fp16 y fp32 (VAE) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (modelo base, LoRA, VAE, codificador de texto), GGUF (variante de 12 GB), JSON (workflows) y ZIP (nodos personalizados) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una capa de configuración. El pipeline se compone de MiniMax H3 como modelo de difusión de vídeo (fichero `minimax_h3_fl2va_pruned_int8_convrot.safetensors`, 21,0 GB), dos LoRA de Viggle Remake (`viggle_remake_swap_comfyui.safetensors` y `viggle_remake_edit_comfyui.safetensors`, 3,8 GB cada uno), un codificador de texto Qwen3-VL 32B cuantizado en NVFP4-AWQ (15,7 GB), un VAE de vídeo en fp16 (5,2 GB) y un VAE de audio en fp32 (0,61 GB). Para el upscale a 1080p se añade un segundo modelo de difusión (`minimax_h3_ref2va_pruned_int8_convrot.safetensors`, 21,0 GB), un LoRA de destilación de 3 pasos, un LoRA de realismo de personas y un upscaler latente 3D.

La variante de 12 GB sustituye los tres primeros ficheros por GGUF con los LoRA ya fusionados y requiere ComfyUI-GGUF, además del flag `--reserve-vram 8`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ni sobre innovaciones de decodificación específicas del workflow. La innovación práctica es la integración de Swap y Edit en un solo grafo con longitud variable de vídeo y upscale opcional.

## Capacidades

- Edición de vídeo *video-to-video* en modo Swap: sustitución de una persona o personaje del metraje original.
- Edición de vídeo en modo Edit: cambio de objetos, fondo, clima e iluminación.
- Procesamiento de vídeos de 1 a 18 segundos de duración en un mismo workflow.
- Upscale opcional a 1080p mediante upscaler latente 3D y modelo de difusión secundario.
- Generación de audio asociada al vídeo, gracias al VAE de audio incluido en el pipeline.
- Refinado facial opcional mediante el nodo ComfyUI-H3-FaceRefine.
- Ejecución local en ComfyUI, sin dependencia de API externa.
- Soporte de cuantizaciones GGUF para GPUs de 12 GB de VRAM.
- No se documentan capacidades de *tool calling*, agentes ni multilingüismo en la información disponible.

## Casos de uso

- **Sustitución de actores en postproducción**: el modo Swap permite recastear a una persona en un clip de hasta 18 s manteniendo el movimiento original, útil para pruebas de casting o correcciones sin regrabar.
- **Cambio de localizaciones en publicidad**: el modo Edit permite modificar fondo, clima e iluminación de un plano rodado, lo que reduce costes de rodaje en exteriores y acelera iteraciones creativas.
- **Prototipado rápido de efectos visuales**: con upscale a 1080p y refinado facial, el workflow sirve para generar *previz* de calidad suficiente para presentar a clientes antes del render final.
- **Edición de contenido para redes sociales**: clips de 1 a 18 s con cambios de vestuario, objetos o ambiente se pueden regenerar en local y publicar sin salir de ComfyUI.
- **Iteración sobre metraje existente en estudios pequeños**: la variante de 12 GB permite trabajar en una RTX 3060/4070 con 32 GB de RAM de sistema, democratizando el *video-to-video* en equipos consumer.
- **Investigación en edición generativa de vídeo**: los JSON versionados y los nodos personalizados permiten reproducir experimentos y comparar configuraciones de cuantización (int8 frente a Q8_0 y Q4_K_M) sobre el mismo grafo.
- **Generación de variantes de un mismo plano**: combinando Swap y Edit se pueden producir múltiples versiones de una escena (distinto personaje, distinto fondo) para tests A/B de marketing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM**: 16 GB o más para el workflow HQ; 12 GB para la variante GGUF. El upscale a 1080p en 12 GB no ha sido probado en una tarjeta real según la model card.
- **RAM de sistema**: 32 GB mínimo; 64 GB recomendado para la variante de 12 GB, ya que el modelo se transmite desde RAM.
- **GPU recomendadas**: no se especifican modelos concretos; por VRAM encajan A100, H100, RTX 4090, RTX 4080, RTX 3090 y, en la variante de 12 GB, RTX 3060 de 12 GB o RTX 4070.
- **Cabe en GPU consumer**: sí, en GPUs de 12 GB y 16 GB con las configuraciones indicadas.
- **Despliegue**: ComfyUI (Desktop o servidor) con los nodos ComfyUI-KJNodes, comfyui-minimax-h3-audio-T8, ComfyUI-H3-FaceRefine y ComfyUI-Viggle-Remake; ComfyUI-GGUF adicional para la variante de 12 GB. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles. La model card solo indica que el workflow HQ es más rápido y el de 12 GB más lento por el *streaming* desde RAM.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|
| Viggle Remake - EASY (este repo) | Workflow ComfyUI sobre MiniMax H3 + LoRA Viggle | Vídeos de 1 a 18 s, upscale a 1080p | MIT | Hugging Face, 0 descargas |
| Viggle Remake (modelo base) | Modelo de *video-to-video* con LoRA Swap/Edit | no disponible | no disponible en la información | Hugging Face (Viggle/Viggle-Remake) |
| MiniMax H3 | Modelo de difusión de vídeo base | no disponible | no disponible en la información | Hugging Face (MiniMaxAI/MiniMax-H3) y Comfy-Org |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un conjunto de workflows y nodos; sin descargar los modelos de MiniMax H3 y Viggle Remake no funciona.
- La variante de 12 GB con upscale a 1080p no ha sido validada en hardware real según la propia model card.
- El rango de vídeo está limitado a 18 segundos; no se documenta soporte para clips más largos.
- No se especifican idiomas soportados ni sesgos conocidos del modelo base.
- Riesgo de alucinación visual y artefactos propios de la difusión de vídeo: identidades inconsistentes entre fotogramas, deformaciones en rostros y manos, y desincronización de audio.
- La licencia MIT del repositorio no cubre necesariamente los modelos de terceros descargados (MiniMax H3, LoRA de Viggle, Qwen3-VL, LoRA de fal y Kijai); hay que revisar cada licencia por separado antes de uso comercial.
- Dependencia de nodos personalizados de terceros no auditados, lo que implica riesgo de seguridad y de mantenimiento.
- El proyecto tiene 0 descargas y 0 likes y fue creado y actualizado con un minuto de diferencia, lo que sugiere un estado muy inicial y sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vyrekai/Viggle-Remake-Easy-ComfyUI
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA Viggle Remake: https://huggingface.co/Viggle/Viggle-Remake
- Página de producto Viggle Remake: https://viggle.ai/models/viggle-remake
- Nodos ComfyUI de Viggle Remake: https://huggingface.co/Viggle/Viggle-Remake/tree/main/comfyui/ComfyUI-Viggle-Remake
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- ComfyUI-KJNodes: https://github.com/kijai/ComfyUI-KJNodes
- comfyui-minimax-h3-audio-T8: https://github.com/T8mars/comfyui-minimax-h3-audio-T8
- ComfyUI-H3-FaceRefine: https://github.com/Carasibana/ComfyUI-H3-FaceRefine
- Modelos MiniMax H3 para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
- LoRA de realismo de personas: https://huggingface.co/fal/MiniMax-H3-Realism-People-LoRA
- Upscaler latente 3D: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- LoRA de 3 pasos: https://huggingface.co/Kijai/MiniMax-H3_comfy
