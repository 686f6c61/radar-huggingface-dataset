# supertavo/LUSTIFY-v2.0

## Resumen

LUSTIFY! v2.0 es un checkpoint de generacion de imagenes (text-to-image) basado en Stable Diffusion XL 1.0, orientado a la generacion de imagenes fotorrealistas, con enfasis tanto en contenido NSFW como SFW. Lo publica el autor bajo el alias coyotte en Civitai y lo redistribuye en Hugging Face el usuario supertavo bajo el identificador `supertavo/LUSTIFY-v2.0`. No es un modelo de lenguaje: es un modelo de difusion para sintesis de imagenes, por lo que esta ficha adapta la estructura habitual a esa naturaleza.

El modelo parte de una mezcla de checkpoints SDXL (un finetune propio no publicado, bigASP y Pyro's NSFW) que se entreno posteriormente sobre un dataset curado de 1000 imagenes para ajuste estetico. La version 2.0 fusiona la v1 con el checkpoint NatVis al 20% y se entrena durante unos 26 535 pasos adicionales sobre 1700 imagenes nuevas, lo que segun el autor mejora la variedad de estilos, la comprension de prompts en lenguaje natural y la adherencia al prompt, a costa de una menor consistencia en escenas de contenido explicito.

Su relevancia es practica: se distribuye como checkpoint completo SDXL en formato safetensors, compatible con el pipeline `StableDiffusionXLPipeline` de diffusers y con herramientas de la comunidad como Automatic1111, ComfyUI o Fooocus. El repositorio ocupa 27,8 GB y contiene pesos de aproximadamente 2567 millones de parametros, coherente con la arquitectura UNet de SDXL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (SDXL 1.0): UNet + doble text encoder (CLIP ViT-L y OpenCLIP ViT-bigG) + VAE |
| Parametros totales | 2.567.463.684 (pesos en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen); limite practico de tokens de prompt segun el text encoder de SDXL (77 tokens por chunk) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors se puede convertir a fp16/bf16 y, mediante herramientas externas, a GGUF para algunos backends |
| Idiomas soportados | no disponible; los prompts se procesan con los text encoders de SDXL (predominantemente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

La arquitectura es la de SDXL 1.0: un UNet con bloques de atencion y un VAE, acompanados de dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG) que permiten condicionamiento textual mas rico que SD 1.5. El modelo es un checkpoint completo (no un LoRA), por lo que sustituye los pesos base de SDXL y se carga con `StableDiffusionXLPipeline` en diffusers.

El entrenamiento descrito por el autor combina mezcla de modelos y finetuning supervisado sobre imagenes. La receta de la v1 fue aproximadamente 0,55 x (finetune SDXL propio no publicado) + 0,45 x (0,5 x bigASP + 0,5 x Pyro's NSFW), seguida de un finetuning sobre 1000 imagenes curadas. Para la v2.0 se fusiono la v1 con NatVis al 20% y se entreno durante unos 26 535 pasos adicionales sobre 1700 imagenes nuevas. El autor indica que el modelo entiende tanto tags estilo Danbooru como prompting en lenguaje natural, porque se entreno con ambas convenciones. No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa (no aplicables a este tipo de modelo).

## Capacidades

- Generacion de imagenes fotorrealistas a partir de texto (text-to-image) con SDXL como base.
- Generacion de contenido NSFW explicito sin necesidad de LoRAs adicionales, aunque el autor recomienda combinarlo con LoRAs de concepto para mayor consistencia.
- Generacion de contenido SFW (objetos, animales, criaturas fantasticas, retratos, escenas), con menor especializacion segun el propio autor.
- Comprension de prompts en lenguaje natural y de tags estilo Danbooru.
- Sensibilidad a tags de estilo fotografico: tipos de camara ("shot on Polaroid SX-70", "shot on GoPro Hero"), estilos ("analog photo", "glamour photography"), iluminacion ("cinematic lighting", "neon lighting"), peliculas ("Ilford HP5 Plus", "Fujicolor Pro"), fotografos (Alessio Albi, Martin Schoeller, Tim Walker) y otros ("bokeh", "dreamy haze", "technicolor").
- Soporte de highres.fix y adetailer/inpainting para corregir manos y caras en planos lejanos.
- No soporta tool calling, agentes, vision ni audio: es exclusivamente un modelo de sintesis de imagen.

## Casos de uso

- Generacion de retratos fotorrealistas para proyectos creativos: el modelo responde bien a tags de camara, iluminacion y fotografo, lo que permite dirigir la estetica de forma precisa en prompts de una sola pasada.
- Produccion de imagenes de estilo analogico o cinematografico: combinando tags como "analog photo", "Ilford HP5 Plus" o "cinematic lighting" se obtienen resultados con grano y colorimetria coherentes, utiles para moodboards y previsualizacion.
- Ilustracion de contenido para adultos en entornos controlados: el checkpoint genera escenas NSFW sin LoRAs, lo que simplifica el pipeline frente a configuraciones que requieren multiples adaptadores.
- Generacion de imagenes SFW de objetos, animales y criaturas fantasticas: util para concept art y assets de baja/media fidelidad, aunque el autor advierte que el modelo esta sesgado hacia contenido adulto y hay que "convencerlo" con prompts.
- Flujos de trabajo con highres.fix y adetailer: para planos de personas a distancia, el pipeline recomendado (upscale 1,4-1,5 con denoising ~0,4 y adetailer) permite recuperar caras y manos, integrable en ComfyUI o Automatic1111.
- Integracion via diffusers en servicios Python: al cargarse con `StableDiffusionXLPipeline`, se puede exponer como endpoint text-to-image (el repo esta marcado como `endpoints_compatible`) para prototipos y demos.
- Exploracion estilistica y experimentacion: la sensibilidad a tags de fotografo y pelicula lo hace util para comparar estilos visuales de forma rapida en sesiones de prompting iterativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no aporta metricas cuantitativas (FID, CLIP score, etc.) ni comparaciones numericas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como checkpoint SDXL completo, en fp16 requiere del orden de 8-10 GB de VRAM para resoluciones base (1024x1024); el dato no lo aporta el autor y debe tomarse como estimacion orientativa de la arquitectura, no del modelo.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de checkpoint SDXL, GPUs con 12-16 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, A100, H100) son las habituales para este tipo de modelo.
- Cabe en GPU consumer: si, en GPUs consumer con VRAM suficiente para SDXL (12 GB o mas en fp16); en GPUs con menos VRAM se requiere offloading o cuantizacion, no documentada por el autor.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline`), Automatic1111/Forge, ComfyUI, Fooocus (con la advertencia de desactivar el estilo "Fooocus Enhance"), y backends que acepten safetensors SDXL.
- Latencia y throughput: no disponibles. Dependen del hardware, del sampler (el autor recomienda DPM++ 2M SDE o DPM++ 3M SDE con scheduler Exponential/Karras, 30 pasos, CFG 4-7) y del uso de highres.fix.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LUSTIFY! v2.0 | SDXL 1.0 | 2.567.463.684 | Fotorrealismo NSFW/SFW | no disponible | Hugging Face (supertavo/LUSTIFY-v2.0), Civitai (573152) |
| SDXL 1.0 (base) | SDXL | ~2.567 M (misma arquitectura) | Fotorrealismo general SFW | CreativeML Open RAIL++-M (segun SDXL) | Stability AI, Hugging Face |
| bigASP | SDXL | no disponible | Fotorrealismo | no disponible | Civitai (502468) |
| Pyro's NSFW | SDXL | no disponible | NSFW | no disponible | Civitai (133808) |
| NatVis | SDXL | no disponible | Fotorrealismo | no disponible | Civitai (617652) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a base, enfoque y disponibilidad.

## Limitaciones y advertencias

- Contenido NSFW explicito: el modelo esta disenado para generar material para adultos; su uso en produccion exige verificacion de edad, cumplimiento legal y moderacion.
- Manos y caras defectuosas en planos lejanos: el propio autor reconoce este problema y recomienda highres.fix y adetailer en lugar de considerarlo un fallo corregible por finetuning.
- Menor consistencia en escenas explicitas en v2.0 respecto a v1: el autor lo admite y avisa de que requerira mas rerolls.
- Sesgo estetico y de contenido: es un modelo "opinionado", entrenado para los flujos del autor; puede no responder bien a workflows que funcionan con otros checkpoints.
- Comprension de prompts limitada a la de SDXL: los text encoders procesan principalmente ingles y tienen limite de 77 tokens por chunk; no hay soporte multilingue documentado.
- Licencia no disponible: no se puede confirmar si permite uso comercial; debe consultarse al autor antes de usarlo en produccion.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, artefactos y texto ilegible en las imagenes.
- Compatibilidad: en Fooocus hay que desactivar el estilo "Fooocus Enhance" para evitar salidas rotas.
- Repositorio con 0 descargas y 0 likes en Hugging Face en el momento de la consulta: es una redistribucion de un checkpoint de Civitai, no una publicacion oficial del autor original.

## Enlaces

- Hugging Face: https://huggingface.co/supertavo/LUSTIFY-v2.0
- Civitai (modelo original): https://civitai.com/models/573152
- bigASP (Civitai): https://civitai.com/models/502468?modelVersionId=558487
- Pyro's NSFW (Civitai): https://civitai.com/models/133808?modelVersionId=324958
- NatVis (Civitai): https://civitai.com/models/617652?modelVersionId=690475
- Guia de prompting de PromptGeek: https://civitai.com/models/118213/creating-photorealistic-images-with-ai-using-stable-diffusion
- Perfil de PromptGeek: https://civitai.com/user/PromptGeek
