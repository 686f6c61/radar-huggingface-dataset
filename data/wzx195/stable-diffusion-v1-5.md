# wzx195/stable-diffusion-v1-5

## Resumen

Stable Diffusion v1-5 es un modelo de difusion latente (latent diffusion model, LDM) para generacion de imagenes a partir de descripciones textuales (text-to-image). Fue desarrollado originalmente por Robin Rombach y Patrick Esser en el entorno de CompVis y RunwayML, y el repositorio analizado (`wzx195/stable-diffusion-v1-5`) es un espejo no oficial del checkpoint `stable-diffusion-v1-5`, sin vinculacion con RunwayML ni con Stability AI. El modelo parte de los pesos de Stable Diffusion v1-2 y se ajusto posteriormente durante 595.000 pasos a resolucion 512x512 sobre el subconjunto `laion-aesthetics v2 5+`.

La relevancia de este checkpoint es historica y practica: ha sido el estandar de facto de la generacion de imagenes open source desde 2022, con un ecosistema enorme de herramientas, adaptadores (LoRA, ControlNet) y conversiones optimizadas. Su tamano compacto (del orden de 860 millones de parametros en el pipeline completo) permite ejecutarlo en GPU de consumo, lo que lo convierte en una base habitual para prototipado, investigacion y despliegues en el borde. En el momento de redactar esta ficha, el repositorio concreto analizado registra 0 descargas y 0 "likes", por lo que se trata de un espejo de bajo uso dentro del ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion-based text-to-image (Latent Diffusion Model, U-Net + VAE + text encoder CLIP ViT-L/14) |
| Parametros totales | 859.520.964 (segun safetensors del repo) |
| Longitud de contexto | 77 tokens (ventana del text encoder CLIP ViT-L/14) |
| Tipos de cuantizacion | Originales en float16 / float32 (safetensors); no se listan cuantizaciones oficiales en el repo. Existen conversiones comunitarias a int8 y GGUF |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (tambien existen `.ckpt` historicos: `v1-5-pruned-emaonly`, `v1-5-pruned`) |
| Resolucion nativa de entrenamiento | 512x512 |
| Tamano del repositorio | 47,3 GB |
| Libreria | diffusers (StableDiffusionPipeline) |
| Pipeline declarado | text-to-image |

## Arquitectura y entrenamiento

El modelo es un Diffusion Probabilistic Model en espacio latente (LDM). Utiliza un U-Net como red de denoising que opera sobre representaciones comprimidas generadas por un autoencoder variacional (VAE), en lugar de trabajar pixel a pixel. La condicion textual se inyecta mediante cross-attention y proviene de un text encoder fijo preentrenado, CLIP ViT-L/14, siguiendo el planteamiento del paper de Imagen. El pipeline completo combina, por tanto, tres componentes: text encoder (CLIP), U-Net y VAE decoder.

El entrenamiento se realizo inicializando desde los pesos de Stable Diffusion v1-2 y afinando durante 595.000 pasos a 512x512 sobre `laion-aesthetics v2 5+`. Durante ese ajuste se aplico un 10% de dropout de la condicion textual para mejorar el classifier-free guidance sampling. No se documentan en la informacion disponible fases de RLHF ni DPO, algo coherente con un modelo de difusion de esta generacion. Tampoco se detallan en la model card proporcionada innovaciones como atencion lineal o decodificacion especulativa.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de prompts textuales en ingles (512x512 de forma nativa).
- Modificacion de imagenes (image-to-image) cuando se usa a traves del pipeline de diffusers, aunque no es la tarea declarada en el pipeline del repo.
- Condicionamiento por texto con soporte de classifier-free guidance, lo que permite controlar el compromiso entre fidelidad al prompt y diversidad.
- Base para fine-tuning y para entrenamiento de adaptadores de bajo rango (LoRA), adaptadores de control (ControlNet) e inversiones textuales, dado su uso masivo en la comunidad.
- No dispone de tool calling ni function calling: no es un modelo de lenguaje.
- No dispone de modo de razonamiento, agentes ni multi-step reasoning.
- Capacidad multilingue limitada: la model card indica soporte de ingles; los prompts en otros idiomas dependen del text encoder CLIP y no estan garantizados.
- No se documentan capacidades de audio, video ni vision adicionales mas alla de la generacion de imagen a partir de texto.

## Casos de uso

- Prototipado rapido de generacion de imagen: al requerir tan solo unos pocos GB de VRAM, permite levantar un servicio de text-to-image en una unica GPU de consumo para validar una idea de producto antes de escalar a modelos mayores.
- Ilustracion y concept art para diseno: artistas y equipos de diseno pueden generar bocetos y variaciones a partir de descripciones textuales, usando la resolucion nativa de 512x512 y posterior upscaling externo.
- Generacion de assets para videojuegos y prototipos de interfaz: texturas, iconos y fondos generados por lotes que luego se refinan manualmente.
- Investigacion sobre sesgos y seguridad en modelos generativos: es una de las bases mas estudiadas de la literatura, lo que facilita comparaciones reproducibles sobre alineacion, representacion y contenido danino.
- Base para fine-tuning con LoRA o DreamBooth: entrenamiento de estilos o sujetos concretos con recursos modestos, dado el bajo numero de parametros del U-Net.
- Integracion en pipelines de generacion aumentada por recuperacion (RAG de imagenes): combinacion con un modelo de lenguaje que redacte el prompt y un sistema de recuperacion que seleccione referencias visuales.
- Despliegue en el borde y dispositivos moviles: existen conversiones optimizadas (por ejemplo, Qualcomm AI Hub) que aprovechan su tamano reducido para inferencia en hardware de baja potencia.
- Composicion de escenas con ControlNet: control de pose, profundidad y bordes usando este checkpoint como modelo base, un flujo muy extendido en produccion grafica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card proporcionada no incluye metricas como FID, CLIP score ni comparaciones cuantitativas con otros checkpoints, y el repositorio analizado declara 0 descargas y 0 "likes", por lo que no hay evaluaciones comunitarias asociadas a este espejo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: en float16 y con resolucion 512x512, el U-Net de aproximadamente 860 millones de parametros ocupa alrededor de 1,7 GB solo en pesos; sumando VAE, text encoder y activaciones, la inferencia practica suele requerir del orden de 4 GB de VRAM. Con float32 o sin optimizaciones de atencion, el requisito sube por encima de 8 GB.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM funciona para inferencia. Se han usado ampliamente RTX 3060 (12 GB), RTX 3070, RTX 3080, RTX 4060/4070/4080/4090 y modelos profesionales A100 o H100 para lotes grandes o fine-tuning.
- Cabe en GPU de consumo: si. Es uno de los pocos modelos de difusion de calidad que cabe en tarjetas como GTX 1060 6 GB, RTX 2060 o RTX 3050 aplicando fp16 y, si es necesario, attention slicing y VAE tiling.
- Opciones de despliegue: diffusers (StableDiffusionPipeline), ComfyUI, AUTOMATIC1111, SD.Next, InvokeAI, ONNX Runtime, TensorRT, y despliegue en dispositivos moviles a traves de Qualcomm AI Hub. El repositorio original de RunwayML esta marcado como obsoleto.
- Latencia y throughput: no disponible en la informacion proporcionada. Dependera fuertemente del numero de pasos de muestreo, del sampler y del hardware concreto.

## Comparativa con modelos similares

La informacion proporcionada no incluye fichas de modelos comparables con datos verificables en esta busqueda. Se ofrece una comparacion orientativa basada en caracteristicas ampliamente conocidas de la familia Stable Diffusion; los valores no proceden de la informacion de esta ficha y deben verificarse en sus repositorios respectivos.

| Modelo | Parametros (aprox.) | Resolucion nativa | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stable Diffusion v1-5 (este repo) | 859.520.964 | 512x512 | CreativeML OpenRAIL-M | HuggingFace (espejo) |
| Stable Diffusion v1-2 | no disponible en la informacion | 512x512 | CreativeML OpenRAIL-M | HuggingFace |
| Stable Diffusion 2.1 | no disponible en la informacion | 768x768 | CreativeML OpenRAIL++-M | HuggingFace |
| SDXL | no disponible en la informacion | 1024x1024 | CreativeML OpenRAIL++-M | HuggingFace |

Como alternativa de misma categoria, SD 2.1 emplea OpenCLIP en lugar de CLIP ViT-L/14 y sube la resolucion nativa a 768x768, con una licencia slightly distinta. SDXL incrementa notablemente el numero de parametros y la calidad de generacion, a costa de requisitos de VRAM mayores. Para los parametros exactos de estos modelos, consultar sus repositorios oficiales.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento sobre `laion-aesthetics v2 5+` hereda sesgos de representacion demografica, cultural y estetica del dataset LAION. La model card reconoce explicitamente el riesgo de perpetuar estereotipos historicos o actuales.
- Riesgo de alucinacion: el modelo no esta disenado para representar hechos ni personas reales de forma fiel; la model card declara ese uso fuera de alcance.
- Limitaciones de contexto e idioma: la ventana del text encoder es de 77 tokens y el soporte declarado es unicamente ingles, lo que limita prompts largos o en otros idiomas.
- Restricciones de licencia: CreativeML OpenRAIL-M permite uso comercial, pero impone restricciones de uso responsable (no generar contenido danino, no suplantar personas, cumplimiento de la legislacion aplicable). Es necesario revisar el texto completo de la licencia antes de un despliegue en produccion.
- Este repositorio concreto es un espejo no oficial con 0 descargas y 0 "likes": no esta afiliado a RunwayML ni a Stability AI. Para produccion se recomienda usar el repositorio oficial `stable-diffusion-v1-5/stable-diffusion-v1-5` o `sd-legacy/stable-diffusion-v1-5`, que incluyen la model card mantenida y garantias de integridad.
- Riesgo de cadena de suministro: al tratarse de un espejo de terceros, conviene verificar los hashes de los safetensors antes de cargarlos en un entorno de produccion.
- El tamano del repositorio (47,3 GB) incluye multiples variantes de pesos; descargar el checkpoint `v1-5-pruned-emaonly` reduce el consumo de VRAM y disco para inferencia.
- La libreria asociada original (repositorio GitHub de RunwayML) esta marcada como obsoleta por sus mantenedores.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/wzx195/stable-diffusion-v1-5
- Repositorio oficial en HuggingFace: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Espejo de referencia `sd-legacy`: https://huggingface.co/sd-legacy/stable-diffusion-v1-5
- Otro espejo comunitario: https://huggingface.co/botp/stable-diffusion-v1-5
- Model card de Qualcomm AI Hub: https://aihub.qualcomm.com/models/stable_diffusion_v1_5
- Repositorio GitHub de la comunidad: https://github.com/lizhen0211/stable-diffusion-v1-5
- Repositorio de despliegue inferless: https://github.com/inferless/Stable-diffusion-v1-5
- Repositorio original de RunwayML (obsoleto): https://github.com/runwayml/stable-diffusion
- Repositorio de CompVis: https://github.com/CompVis/stable-diffusion
- Libreria diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- AUTOMATIC1111: https://github.com/AUTOMATIC1111/stable-diffusion-webui
- SD.Next: https://github.com/vladmandic/automatic
- InvokeAI: https://github.com/invoke-ai/InvokeAI
- Blog de Stable Diffusion en HuggingFace: https://huggingface.co/blog/stable_diffusion
- Paper de Latent Diffusion Models: https://arxiv.org/abs/2112.10752
- Paper de classifier-free guidance: https://arxiv.org/abs/2207.12598
- Paper de CLIP: https://arxiv.org/abs/2103.00020
- Paper de Imagen: https://arxiv.org/abs/2205.11487
- Paper de LAION-5B: https://arxiv.org/abs/2210.08402
- Texto completo de la licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
