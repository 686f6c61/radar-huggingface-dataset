# ThatWW2Nerd/anicorexl-illustrious-v6-sdxl

## Resumen

anicorexl-illustrious-v6-sdxl es un modelo de generacion de imagenes texto-a-imagen derivado de Illustrious-XL, una variante de Stable Diffusion XL especializada en estetica anime. Lo publica en Hugging Face el usuario ThatWW2Nerd, aunque el modelo original fue creado por shonzeck34263 y distribuido a traves de Civitai; el repositorio de Hugging Face actua como espejo del checkpoint original en formato diffusers y safetensors. El modelo resuelve la generacion de ilustraciones anime con enfasis declarado en anatomia, fondos, color y adherencia al prompt.

Tecnicamente es un fine-tune de OnomaAIResearch/Illustrious-xl-early-release-v0, que a su vez parte de la arquitectura Stable Diffusion XL (UNet + doble text encoder CLIP). El checkpoint contiene 2.567.463.684 parametros y ocupa 6,9 GB en el repositorio. La longitud de contexto textual viene determinada por los text encoders de SDXL (77 tokens por segmento), no por una ventana extendida propia.

Su relevancia es acotada: se trata de un modelo de nicho con 18 descargas y 0 likes en el momento de la ficha, pensado para usuarios de pipelines de difusion que buscan un estilo anime concreto. No es un modelo de proposito general ni compite en la categoria de modelos multimodales o de lenguaje; su valor esta en el ajuste estetico sobre la base Illustrious.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (UNet + VAE + doble text encoder CLIP), fine-tune de Illustrious-XL |
| Parametros totales | 2.567.463.684 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 77 tokens por segmento de prompt (limitacion estandar de los text encoders de SDXL); no disponible confirmacion de extension |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (formato nativo safetensors en fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | faipl-1.0-sd (Fair AI Public License 1.0-SD) |
| Formato de pesos | safetensors (compatible con diffusers, `StableDiffusionXLPipeline`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Stable Diffusion XL: un UNet con bloques de atencion cruzada, un VAE para codificacion y decodificacion latente, y dos text encoders CLIP (uno de ellos con proyeccion a mayor dimensionalidad). Sobre esa base, Illustrious-XL introduce un reentrenamiento orientado a ilustracion anime, y anicorexl-illustrious-v6 es un fine-tune adicional del que no se documentan detalles de dataset, numero de pasos ni composicion de datos.

No se dispone de informacion sobre el proceso de entrenamiento: no hay datos publicados sobre volumen de imagenes, uso de RLHF/DPO (no aplicable en difusion en el sentido clasico), tecnicas de regularizacion ni metodos de destilacion. La model card es minima y se limita a enlazar el modelo original en Civitai. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal; se trata de un fine-tune convencional de difusion.

## Capacidades

- Generacion de imagenes texto-a-imagen con estetica anime, con enfasis declarado en anatomia, fondos y color.
- Mejora de adherencia al prompt respecto a la base, segun los tags del autor ("prompt adherence").
- Generacion de personajes femeninos ("girls") y escenas con fondos elaborados.
- Compatible con el ecosistema diffusers mediante `StableDiffusionXLPipeline`.
- Soporte de prompts negativos y de parametros estandar de muestreo (CFG, steps, schedulers) heredados de SDXL.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de imagen.
- Capacidades multilingues limitadas al ingles en los prompts, segun el campo `language: en`.

## Casos de uso

- Ilustracion de personajes para proyectos personales: el modelo genera retratos y figuras anime con enfasis en anatomia, adecuado para fan art o prototipado visual rapido.
- Creacion de fondos para videojuegos indie o visual novels: la especializacion declarada en "backgrounds" permite generar escenarios consistentes con el estilo anime.
- Generacion de assets para maquetas de webtoon o manga: util para bocetos de paneles y pruebas de color antes de la produccion final.
- Exploracion de estilo en estudios pequenos: sirve como base para iterar variaciones de un personaje concreto mediante prompts detallados y control de semilla.
- Prototipado de concept art en pipelines de difusion locales: al ser compatible con diffusers, se integra en scripts Python para generacion por lotes.
- Pruebas de adherencia al prompt en investigacion de difusion: util como caso de estudio de fine-tunes sobre Illustrious-XL para evaluar deriva estilistica.
- Generacion de material para comunidades de rol o ficcion: imagenes de personajes con descripciones textuales largas dentro del limite de tokens de los text encoders.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 8-10 GB para SDXL estandar; con el checkpoint de 6,9 GB y overhead de VAE y text encoders, se recomienda un minimo de 10-12 GB para operar con comodidad.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para generacion rapida; RTX 3060 de 12 GB puede funcionar con atencion eficiente.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090). En tarjetas de 8 GB requiere offloading o cuantizacion.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline`), ComfyUI, Automatic1111/Forge, InvokeAI. No se documenta soporte nativo de vLLM ni llama.cpp (no aplicables a difusion).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen fuertemente de la GPU, steps y resolucion (tipicamente 20-30 steps a 1024x1024).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| anicorexl-illustrious-v6-sdxl | 2.567.463.684 | 77 tokens (text encoders SDXL) | faipl-1.0-sd | Hugging Face (18 descargas) |
| OnomaAIResearch/Illustrious-xl-early-release-v0 | no disponible en la informacion | 77 tokens (SDXL) | no disponible en la informacion | Hugging Face (modelo base) |
| Stable Diffusion XL base | no disponible en la informacion | 77 tokens | CreativeML Open RAIL++-M | Hugging Face, ampliamente extendido |

No se dispone de datos de rendimiento comparativo (benchmarks FID, CLIP score ni preferencias humanas) en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune orientado a anime y con tag "girls", puede sobrerrepresentar ciertos estereotipos de genero y estetica; no hay documentacion de mitigacion.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, manos deformadas o artefactos en fondos complejos, pese al enfasis declarado en anatomia.
- Limitacion de contexto: los text encoders de SDXL limitan el prompt a 77 tokens por segmento; prompts largos requieren tecnicas de concatenacion o prompt weighting.
- Limitacion de idioma: solo se declara soporte de ingles; los prompts en castellano pueden degradar la adherencia.
- Restricciones de licencia: la FAIpl-1.0-SD impone condiciones especificas sobre uso comercial y redistribucion; es necesario revisar los terminos en freedevproject.org antes de usarlo en produccion.
- Caveat de procedencia: el modelo se publica como espejo de un checkpoint de Civitai; no hay garantia de mantenimiento, actualizaciones ni soporte por parte del autor en Hugging Face.
- Madurez: con 18 descargas y 0 likes, la validacion comunitaria es practicamente nula; conviene probarlo en un entorno controlado antes de integrarlo en flujos de trabajo.

## Enlaces

- Hugging Face: https://huggingface.co/ThatWW2Nerd/anicorexl-illustrious-v6-sdxl
- Modelo original en Civitai: https://civitai.com/models/1367726?modelVersionId=1945914
- Perfil del autor original en Civitai: https://civitai.com/user/shonzeck34263
- Modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Licencia FAIpl-1.0-SD: https://freedevproject.org/faipl-1.0-sd/
