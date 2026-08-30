# wizdroid/comfyui-workflows

## Resumen

El repositorio `wizdroid/comfyui-workflows` no es un modelo de inteligencia artificial en sí, sino una colección de flujos de trabajo (workflows) listos para usar en ComfyUI, orientados a la generación de imágenes con consistencia de personaje, inferencia acelerada y creación automatizada de datasets para entrenamiento de LoRA. Desarrollado por el usuario wizdroid y publicado bajo licencia MIT, integra varios modelos de última generación como Flux2-Klein 9B, Qwen (texto a imagen), Z-Image-Turbo y SeedVR2, todos ellos con soporte de aceleración Nunchaku para una inferencia rápida.

La relevancia de este repositorio radica en que resuelve un problema práctico: la dificultad de mantener la identidad de un personaje a lo largo de múltiples generaciones. Sus pipelines de referencia múltiple (1, 2 o 3 imágenes) emplean inyección de Reference Latent para preservar la coherencia facial y de estilo, algo especialmente útil para producción de contenido, diseño de personajes y preparación de datos de entrenamiento. Incluye además un nodo personalizado, `WizdroidLoRADataset`, que automatiza el captioning con modelos de visión locales vía Ollama y estructura el dataset resultante.

En total se ofrecen 12 workflows JSON que cubren desde generación texto a imagen básica hasta upscaling de alta calidad con SeedVR2, pasando por un generador de datasets completo. El repositorio se actualizó por última vez en agosto de 2026 y cuenta con una guía de prompts complementaria (`PROMPTS.md`) con más de 40 variaciones para referencias de personajes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de workflows para ComfyUI; integra Flux2-Klein 9B, Qwen, Z-Image-Turbo, SeedVR2, Moondream) |
| Parametros totales | No disponible (depende de los modelos subyacentes; Flux2-Klein 9B tiene ~9 mil millones) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica a workflows; depende de los modelos de lenguaje integrados, p. ej. Qwen3 4B/8B) |
| Tipos de cuantizacion | No especificado en la documentacion; los modelos se cargan en safetensors con precision fp16 o fp32 |
| Idiomas soportados | No disponible (los prompts se escriben en ingles; los modelos subyacentes como Qwen soportan multiples idiomas) |
| Licencia | MIT |
| Formato de pesos | JSON (workflows), safetensors (modelos referenciados) |

## Arquitectura y entrenamiento

Al tratarse de un repositorio de flujos de trabajo, no existe un proceso de entrenamiento propio. La arquitectura se define por los modelos que integra: Flux2-Klein 9B es un modelo de difusion de texto a imagen con arquitectura transformer y aceleracion Nunchaku; Qwen se presenta como un modelo de lenguaje multimodal que tambien genera imagenes; Z-Image-Turbo esta optimizado para pocos pasos de inferencia; y SeedVR2 es un upscaler basado en diffusion transformer (DiT) con VAE. El nodo `WizdroidLoRADataset` utiliza Ollama con el modelo de vision Moondream para generar captions automaticamente.

Los workflows estan disenados para inyeccion de Reference Latent, una tecnica que codifica la informacion de identidad de una o varias imagenes de referencia y la inyecta en el proceso de difusion para mantener la consistencia del personaje. No se documentan detalles sobre el dataset de entrenamiento ni sobre tecnicas como RLHF o DPO, ya que no aplican a este repositorio.

## Capacidades

- Generacion de imagenes texto a imagen con Flux2-Klein 9B y Qwen, con resolucion flexible (incluye optimizacion para formato cuadrado 1:1).
- Consistencia de personaje mediante referencia de 1, 2 o 3 imagenes con inyeccion de Reference Latent.
- Inferencia acelerada con Nunchaku para Flux2-Klein y Z-Image-Turbo, reduciendo el numero de pasos necesarios.
- Upscaling de alta calidad con SeedVR2 (DiT + VAE) que incluye tiling y correccion de color, soportando factores de 2x a 4x.
- Creacion automatizada de datasets para entrenamiento LoRA: captioning con modelo de vision local (Moondream via Ollama), estructura de carpetas y validacion.
- Carga de LoRA integrada y conmutable en la mayoria de los pipelines.
- Soporte para generacion rapida de prototipos con Z-Image-Turbo (muy pocos pasos).
- Multiples variantes de workflow segun necesidad: t2i, i2i de 1 a 3 referencias, upscaler y generador de datasets.

## Casos de uso

- Diseno de personajes para videojuegos o animacion: el workflow `flux2-klein-3i2i.json` permite generar multiples vistas de un mismo personaje usando tres imagenes de referencia, manteniendo la identidad en angulos, expresiones y poses. Es adecuado porque la inyeccion de Reference Latent con triple referencia es la opcion mas robusta del repositorio para fidelidad maxima.
- Creacion de datasets de entrenamiento LoRA: el workflow `dataset-generator.json` automatiza el captioning con Moondream y estructura los datos en carpetas. Un artista puede generar cientos de variaciones de su personaje y obtener captions coherentes sin intervencion manual.
- Prototipado rapido en estudios de diseno: con `z-image-turbo-t2i.json` se obtienen generaciones en muy pocos pasos, ideal para iterar sobre ideas antes de invertir tiempo en generaciones de alta calidad.
- Generacion de imagenes de producto con consistencia de marca: usando `flux2-klein-1i2i.json`, una empresa puede mantener el mismo producto o logotipo en multiples escenarios a partir de una unica foto de referencia.
- Upscaling de ilustraciones o fotos para impresion: `seedvr2-i2i.json` ofrece un upscaler de calidad superior con tiling, adecuado para preparar imagenes de alta resolucion para carteles o publicaciones impresas.
- Generacion de concept art para produccion audiovisual: la combinacion de `flux2-klein-t2i.json` con el archivo `PROMPTS.md` permite explorar variaciones de personajes con prompts estructurados, cubriendo angulos, expresiones y tipos de plano de forma sistematica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mediciones de rendimiento, latencia ni comparativas con otros sistemas de generacion de imagenes. La unica referencia cualitativa es la afirmacion del autor de que Nunchaku proporciona "inferencia extremadamente rapida" y que SeedVR2 es "uno de los mejores upscalers disponibles", pero no se aportan numeros concretos.

## Requisitos de hardware

- No se especifican requisitos minimos en la documentacion del repositorio.
- Los modelos referenciados (Flux2-Klein 9B, Qwen3 4B/8B, SeedVR2 7B, Z-Image-Turbo) requieren GPUs con al menos 12-16 GB de VRAM para cargar en fp16; se recomienda una NVIDIA RTX 3090, RTX 4090 o superior para un uso fluido.
- La aceleracion Nunchaku esta disenada para GPUs NVIDIA con soporte de TensorRT; se recomienda verificar la compatibilidad con la tarjeta concreta.
- El workflow de dataset con Ollama y Moondream puede ejecutarse en CPU, aunque el proceso de captioning sera mas lento que en GPU.
- Opciones de despliegue: ComfyUI como interfaz principal, con instalacion de los custom nodes indicados (ComfyUI-nunchaku, ComfyUI-SeedVR2_VideoUpscaler, wizdroid-character).
- No se proporcionan datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa directa con otros repositorios de workflows de ComfyUI. El repositorio de wizdroid se distingue por su enfoque en consistencia de personaje y generacion de datasets, pero no existen datos publicos que permitan comparar su rendimiento con alternativas como los workflows oficiales de ComfyUI o los de otros creadores de la comunidad.

## Limitaciones y advertencias

- No es un modelo de IA: los workflows dependen de modelos externos que deben descargarse por separado; el repositorio no incluye los pesos de los modelos.
- Los requisitos de hardware pueden ser elevados si se utilizan todos los modelos simultaneamente; se recomienda revisar la VRAM disponible antes de ejecutar workflows complejos.
- La consistencia de personaje no esta garantizada al 100%: la inyeccion de Reference Latent reduce la deriva de identidad pero no la elimina por completo, especialmente con angulos extremos o iluminacion muy diferente.
- El generador de datasets requiere Ollama instalado y configurado; si el modelo de vision no esta disponible, el workflow fallara.
- La licencia MIT se aplica a los workflows, pero los modelos subyacentes (Flux2-Klein, Qwen, Z-Image-Turbo, SeedVR2, Moondream) tienen sus propias licencias que pueden restringir el uso comercial.
- No se documentan sesgos especificos, pero los modelos de generacion de imagenes pueden reflejar sesgos de genero, raza o cultura presentes en sus datos de entrenamiento.
- Riesgo de alucinacion en el captioning automatico: Moondream puede generar descripciones inexactas, lo que afectaria a la calidad del dataset de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wizdroid/comfyui-workflows
- Archivo de prompts complementario: https://huggingface.co/wizdroid/comfyui-workflows/blob/main/PROMPTS.md
- Repositorio de custom nodes wizdroid-character: https://github.com/wizdroid/wizdroid-character
- ComfyUI (proyecto base): https://github.com/comfyanonymous/ComfyUI
- Nunchaku (aceleracion de inferencia): https://github.com/nunchaku-tech
- SeedVR2 (upscaler): https://github.com/ainvfx/ComfyUI-SeedVR2_VideoUpscaler (referenciado en la documentacion)
