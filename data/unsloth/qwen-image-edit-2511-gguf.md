# unsloth/Qwen-Image-Edit-2511-GGUF

## Resumen

Qwen-Image-Edit-2511-GGUF es la versión cuantizada en formato GGUF del modelo de edición de imágenes Qwen-Image-Edit-2511, desarrollado originalmente por el equipo Qwen (Alibaba) y empaquetado por Unsloth. Se trata de un modelo de difusión para tareas image-to-image: recibe una o varias imágenes de entrada junto con un prompt textual y genera una imagen editada, preservando la identidad visual del sujeto cuando así se solicita. La versión 2511 es una mejora sobre 2509 centrada en la consistencia de personajes, la reducción del drift de imagen y la integración de capacidades LoRA.

El modelo base cuenta con aproximadamente 20.430 millones de parámetros (según los pesos en safetensors del repositorio) y está publicado bajo licencia Apache 2.0, lo que permite uso comercial. Esta variante GGUF aplica la metodología Unsloth Dynamic 2.0, que mantiene en mayor precisión las capas consideradas críticas para preservar la calidad frente al modelo original en bfloat16.

Su relevancia actual radica en que permite ejecutar un modelo de edición de imágenes de gran tamaño en hardware de consumo mediante cuantización, integrándose con ComfyUI a través de las herramientas de ComfyUI-GGUF. Con más de un millón de descargas y 658 likes en Hugging Face, se ha consolidado como una de las vías prácticas para desplegar edición de imagen local con calidad cercana al modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para edición de imagen (image-to-image); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 20.430.401.088 (aprox. 20,4 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | GGUF con metodología Unsloth Dynamic 2.0 (niveles concretos no especificados en la información proporcionada) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (versión cuantizada); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza como pipeline de edición de imagen (image-to-image) operado mediante `QwenImageEditPlusPipeline` en diffusers. El modelo acepta múltiples imágenes de entrada y un prompt, con parámetros de inferencia como `true_cfg_scale`, `num_inference_steps` (40 en el ejemplo de la model card) y `guidance_scale`. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

Las mejoras declaradas en la versión 2511 respecto a 2509 incluyen la mitigación del drift de imagen, una mayor consistencia de personajes (incluidos grupos de varias personas), la integración nativa de capacidades LoRA de la comunidad, una generación mejorada para diseño industrial y un razonamiento geométrico reforzado. La variante GGUF de Unsloth aplica su metodología Dynamic 2.0, que eleva la precisión de las capas importantes y utiliza las herramientas de ComfyUI-GGUF de city96 para la integración en flujos de trabajo de ComfyUI.

## Capacidades

- Edición de imágenes guiada por texto (image-to-image) a partir de uno o varios inputs.
- Fusión de múltiples imágenes de personas en una sola escena coherente (consistencia multi-persona).
- Edición imaginativa preservando la identidad y características visuales del sujeto retratado.
- Soporte de LoRA de la comunidad integrado en el flujo de edición.
- Generación orientada a diseño industrial.
- Razonamiento geométrico reforzado para ediciones con relaciones espaciales.
- Soporte de prompts negativos y control de escala de guiado.
- Capacidades multilingües limitadas a inglés y chino en los prompts.
- No se documenta en la información disponible soporte de tool calling, agentes ni modos de razonamiento textual.

## Casos de uso

- Edición de retratos con preservación de identidad: el modelo permite modificar un retrato (vestuario, entorno, expresión) manteniendo los rasgos del sujeto, gracias a la mejora de consistencia de personajes de la versión 2511.
- Composición de fotos de grupo: fusión de dos imágenes de personas distintas en una escena conjunta coherente, útil en estudios fotográficos y agencias de marketing.
- Prototipado de diseño industrial: generación de variantes de un producto a partir de una imagen base, aprovechando la mejora declarada en generación de diseño industrial.
- Flujos de trabajo en ComfyUI: integración como nodo GGUF en pipelines de edición por lotes para estudios de diseño y creadores de contenido que trabajan en local.
- Personalización con LoRA: aplicación de estilos o identidades entrenadas por la comunidad sobre el modelo base para producir ediciones consistentes en series de imágenes.
- Edición geométrica precisa: ajustes de perspectiva, posición y relaciones espaciales entre objetos en una escena, apoyados en el razonamiento geométrico reforzado.
- Despliegue local con cuantización: ejecución en equipos con VRAM limitada usando los pesos GGUF en lugar del modelo completo en bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo base tiene unos 20,4 mil millones de parámetros; en bfloat16 requiere del orden de 40 GB o más de VRAM solo para los pesos, además de memoria para activaciones y el codificador de texto.
- La variante GGUF reduce los requisitos según el nivel de cuantización elegido; los niveles concretos no se detallan en la información proporcionada.
- GPU de datacenter recomendadas para el modelo completo: A100 (40/80 GB) o H100.
- En GPU de consumo (RTX 4090 con 24 GB, RTX 3090, etc.) es viable únicamente con cuantizaciones GGUF agresivas y posible descarga parcial a RAM; no se garantiza en la información disponible.
- Despliegue: ComfyUI con ComfyUI-GGUF, y el pipeline `QwenImageEditPlusPipeline` de diffusers para el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| unsloth/Qwen-Image-Edit-2511-GGUF | ~20,4 mil millones | GGUF | Apache 2.0 | en, zh | Cuantización Dynamic 2.0 de Unsloth; orientado a ComfyUI |
| Qwen/Qwen-Image-Edit-2511 | ~20,4 mil millones | Safetensors (bfloat16) | Apache 2.0 | en, zh | Modelo base original; mayor requisito de VRAM |
| Qwen-Image-Edit-2509 | No disponible | No disponible | No disponible | No disponible | Versión anterior; menor consistencia de personajes según el autor |

No se dispone en la información proporcionada de datos de otros modelos de edición de imagen comparables (parámetros, contexto o rendimiento) para ampliar la comparativa.

## Limitaciones y advertencias

- El modelo solo procesa prompts en inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Riesgo de drift de imagen residual pese a las mejoras de la versión 2511, especialmente en ediciones complejas o cadenas de ediciones sucesivas.
- Posibles sesgos en la generación derivados de los datos de entrenamiento del modelo base; no se detallan en la información disponible.
- La cuantización GGUF puede introducir pérdida de calidad frente al modelo original en bfloat16, aunque Unsloth Dynamic 2.0 mitiga el efecto en capas críticas.
- El repositorio ocupa 1069 GB, lo que implica una descarga y almacenamiento considerables si se quieren todos los niveles de cuantización.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los LoRA de la comunidad que se apliquen sobre el modelo.
- No se documentan en la información disponible garantías de fidelidad en edición de texto dentro de imágenes ni en escenas con muchos sujetos.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/unsloth/Qwen-Image-Edit-2511-GGUF
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Modelo en ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-Edit-2511
- Guía de Unsloth para ejecutar Qwen-Image: https://unsloth.ai/docs/models/qwen-image-2512
- Documentación de Unsloth Dynamic 2.0: https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs
- Guía de ComfyUI en Unsloth: https://unsloth.ai/docs/new/comfyui
- ComfyUI-GGUF (city96): https://github.com/city96/ComfyUI-GGUF
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de Unsloth: https://unsloth.ai/docs
- Discord de Unsloth: https://discord.gg/unsloth
- Blog de Qwen-Image-Edit-2511: https://qwenlm.github.io/blog/qwen-image-edit-2511/
- Tech report (PDF): https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen-Image/Qwen_Image.pdf
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-Edit-2511
- Repositorio GitHub de Qwen-Image: https://github.com/QwenLM/Qwen-Image
- Qwen Chat: https://chat.qwen.ai/
- Discord de Qwen: https://discord.gg/CV4E9rpNSD
- Paper en arXiv: https://arxiv.org/abs/2508.02324
