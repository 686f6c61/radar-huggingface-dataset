# tiondoubl/wai-illustrious-sdxl-GGUF

## Resumen

WAI-illustrious-SDXL-GGUF es una distribucion en formato GGUF del modelo de difusion WAI-illustrious-SDXL, un checkpoint de Stable Diffusion XL orientado a la generacion de ilustracion y personajes de estilo anime. El modelo original lo desarrolla WAI0731 y se publica en Civitai; esta version concreta la mantiene el usuario tiondoubl en Hugging Face, con cuantizaciones realizadas por void-gryph. El repositorio empaqueta los pesos UNet cuantizados junto con los componentes CLIP y VAE necesarios para su uso en ComfyUI.

El problema que resuelve es el de la huella de memoria: un checkpoint SDXL completo en fp16 ronda los 6,5 GB solo en el UNet, lo que complica su ejecucion en GPUs de consumo con poca VRAM. Las cuantizaciones GGUF (Q4_K_M, Q5_K_M, Q8_0) reducen ese peso y permiten desplegar el modelo en tarjetas de gama media, manteniendo un compromiso ajustable entre calidad y velocidad. El modelo cuenta con aproximadamente 2.567 millones de parametros en el UNet, segun los metadatos del repositorio.

Es relevante ahora porque el ecosistema ComfyUI ha adoptado de forma amplia el cargador GGUF de city96, lo que facilita flujos de trabajo de generacion de imagen en local con requisitos de hardware mas bajos. No obstante, conviene subrayar que no es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso. Es un modelo texto-a-imagen especializado en ilustracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (UNet + CLIP text encoder + VAE), difusion latente |
| Parametros totales | 2.567.463.684 (UNet, segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; sin ventana de contexto textual) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (GGUF) |
| Idiomas soportados | no disponible (prompts en ingles por convencion del ecosistema; sin declaracion oficial) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | GGUF (UNet cuantizado) + CLIP y VAE incluidos en el repo |

## Arquitectura y entrenamiento

El modelo base es un checkpoint SDXL, es decir, una arquitectura de difusion latente con un UNet como red principal de denoising, un doble text encoder CLIP y un VAE para codificar y decodificar imagenes en el espacio latente. SDXL opera de forma nativa a resoluciones de 1024x1024, y la model card recomienda dimensiones originales iguales o superiores a 1024x1024. El checkpoint WAI-illustrious-SDXL deriva de la familia Illustrious, orientada a ilustracion anime, y ha recibido ajustes sucesivos (la model card menciona versiones hasta v16) que segun el autor mejoran la limpieza visual y la precision de personajes.

Esta publicacion no entrena el modelo: solo lo cuantiza. El proceso de cuantizacion GGUF reduce la precision de los pesos del UNet (por ejemplo, a 4, 5 u 8 bits segun la variante) para disminuir el uso de VRAM. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens de imagen, ni si hubo etapas de RLHF, DPO o fine-tuning por preferencias. Tampoco se detalla la innovacion tecnica del modelo base mas alla de su pertenencia a la familia Illustrious/SDXL.

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de prompts descriptivos (tags y lenguaje natural).
- Estilo ilustracion/anime con enfasis en personajes, segun la orientacion declarada del modelo base.
- Soporte de prompts negativos para filtrar contenido no deseado (calidad, censura, etc.).
- Flujos de image-to-image y Hires Fix con control de denoising (rangos recomendados de 0,35 a 0,65).
- Etiquetas de clasificacion de seguridad en la generacion (general, sensitive, nsfw, explicit) segun la model card.
- Integracion con ComfyUI mediante el nodo ComfyUI-GGUF.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada ni audio.
- Capacidades multilingues: no disponibles; el ecosistema emplea habitualmente prompts en ingles.

## Casos de uso

- Generacion de ilustraciones para juegos indie: el modelo produce arte de personajes en estilo anime a 1024x1024, adecuado para prototipado rapido de assets en un pipeline de ComfyUI con cuantizacion Q5_K_M.
- Creacion de avatares y retratos de personaje: con prompts de tags y CFG entre 4,0 y 6,5, se obtienen retratos coherentes con el estilo del checkpoint, utiles en comunidades o apps de perfil.
- Bocetado rapido de conceptos: con 15-20 pasos y Q4_K_M se generan previsualizaciones veloces para explorar composiciones antes de un render final a mas pasos.
- Refinado de imagenes existentes: mediante image-to-image con denoising de 0,35 a 0,45 se limpian artefactos y se anade detalle sin alterar la estructura original.
- Ampliacion de resolucion (Hires Fix): con upscale 1,5x, 20 pasos y upscaler R-ESRGAN 4x+ Anime6B, se escala una imagen base manteniendo el estilo.
- Produccion en local con VRAM limitada: las variantes Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPUs de consumo, lo que habilita estudios pequenos o creadores individuales sin acceso a hardware de datacenter.
- Generacion por lotes en un servidor: con Q8_0 y una GPU con suficiente memoria se pueden procesar colas de imagenes manteniendo la maxima calidad de la cuantizacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la variante. Q4_K_M ronda los 5-7 GB de peso y Q5_K_M los 8-10 GB; a ello hay que sumar el CLIP, el VAE y los latentes en memoria, por lo que conviene reservar margen adicional.
- GPU recomendadas: no hay una lista oficial; por tamano, una RTX 3060 de 12 GB o superior puede alojar Q5_K_M, mientras que Q8_0 requiere GPUs de 16 GB o mas (RTX 4080/4090, A100, H100) para operar con holgura.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para Q4_K_M y con 12-16 GB para Q5_K_M/Q8_0, sujeto a la memoria adicional de CLIP y VAE.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF (metodo documentado por el autor); el ecosistema GGUF tambien permite otros cargadores compatibles, aunque no se detallan en la informacion disponible.
- Latencia y throughput: no disponibles. La model card solo indica que 15-20 pasos se consideran "ultra rapido" y 25-35 pasos el rango optimo, sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros (UNet) | Contexto/resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WAI-illustrious-SDXL-GGUF (este) | ~2.567 M | 1024x1024 nativo | GGUF | other | Hugging Face (0 descargas) |
| WAI-illustrious-SDXL original | no disponible | 1024x1024 nativo | safetensors/checkpoint | other | Civitai |
| SDXL base | no disponible en la informacion | 1024x1024 nativo | safetensors | no disponible en la informacion | Hugging Face / Stability |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la comparativa se limita a formato, tamano y disponibilidad.

## Limitaciones y advertencias

- Licencia "other": no se especifican terminos concretos, por lo que el uso comercial no esta garantizado y debe verificarse con el autor original (WAI0731) antes de cualquier despliegue productivo.
- Contenido sensible: el modelo base admite etiquetas nsfw/explicit y el autor recomienda anadir "nsfw" a los prompts negativos para filtrar; sin filtros adicionales puede generar contenido inapropiado.
- Riesgo de sesgos y estilos: al ser un checkpoint orientado a anime, puede sobrerrepresentar ciertos estilos y personajes y producir resultados poco diversos fuera de ese dominio.
- Fidelidad de personajes: el autor advierte que anadir demasiados tags de calidad/estetica o prompts negativos muy largos reduce la calidad y emborrona la imagen.
- Alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, texto ilegible o detalles incoherentes, especialmente con prompts ambiguos.
- Idioma: no hay soporte multilingue declarado; los prompts en idiomas distintos del ingles pueden degradar el resultado.
- Cuantizacion: las variantes Q4_K_M y Q5_K_M introducen perdida de calidad respecto al original; para maxima fidelidad debe usarse Q8_0 o el checkpoint original.
- Madurez del repo: 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria ni pipeline declarado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tiondoubl/wai-illustrious-sdxl-GGUF
- Modelo original en Civitai: https://civitai.com/models/827184
- Perfil del autor original: https://civitai.com/user/WAI0731
- Perfil del cuantizador: https://huggingface.co/void-gryph
- Nodo ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Generacion online (Tensor.art): https://tensor.art/u/762555264535746522
- Herramienta Character Select SAA: https://github.com/mirabarukaso/character_select_stand_alone_app
- Space de busqueda de personajes: https://huggingface.co/spaces/flagrantia/character_select_saa
