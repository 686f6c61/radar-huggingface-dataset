# stabilityai/stable-video-diffusion-img2vid-xt-1-1

## Resumen

Stable Video Diffusion (SVD) img2vid-xt 1.1 es un modelo de difusión latente de generación de vídeo a partir de una única imagen (image-to-video), desarrollado por Stability AI y publicado el 2 de febrero de 2024 como una actualización afinada de la versión 1.0. Toma una fotografía como primer fotograma y genera un clip corto con movimiento coherente, utilizando un prior de movimiento aprendido de un gran conjunto de datos de vídeo. La arquitectura deriva del modelo de imagen Stable Diffusion, al que se le anaden capas temporales para modelar la dimension de tiempo.

El repositorio pesa 18,3 GB y contiene 1.524.623.082 parámetros (aproximadamente 1,52 mil millones) en formato safetensors, con acceso restringido (gated): es necesario aceptar las condiciones de la licencia comunitaria en HuggingFace antes de poder descargarlo. Acumula 3206 descargas y 1147 likes en el momento de la consulta.

Su relevancia actual radica en que fue uno de los primeros modelos abiertos de generación de vídeo con calidad aprovechable para producción, y sigue siendo una referencia para pipelines de animación de imágenes fijas dentro del ecosistema `diffusers`. La version 1.1 incorpora mejoras de calidad y coherencia respecto a la 1.0 manteniendo la misma base arquitectonica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente de vídeo (U-Net con capas espaciales y temporales), basado en la arquitectura de Stable Diffusion |
| Parametros totales | 1.524.623.082 (aprox. 1,52 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos publicados en precision completa fp16) |
| Idiomas soportados | No disponibles (modelo de imagen/vídeo, no textual) |
| Licencia | stable-video-diffusion-1-1-community |
| Formato de pesos | safetensors |

Otros datos: pipeline `image-to-video`, libreria `diffusers` (`StableVideoDiffusionPipeline`), tamano del repositorio 18,3 GB, acceso restringido (gated) en HuggingFace.

## Arquitectura y entrenamiento

SVD img2vid-xt 1.1 es un modelo de difusión latente. Comprime las imagenes y los fotogramas de vídeo a un espacio latente mediante un VAE y realiza el proceso de eliminacion de ruido en ese espacio reducido, lo que abarata computacionalmente la generacion. Sobre la U-Net del modelo de imagen Stable Diffusion se incorporan capas de atencion temporal que permiten mantener la coherencia entre fotogramas a lo largo del tiempo. La imagen de entrada se codifica como condicionamiento (a traves de un codificador de imagen) y actua como primer fotograma del clip generado.

El modelo se entrena sobre un gran conjunto de datos de vídeo para aprender un prior de movimiento, y la variante `xt` emplea una resolucion y una longitud de clip mayores que la version base. La version 1.1 es un ajuste fino de la 1.0 orientado a mejorar la calidad visual y la estabilidad del movimiento. La informacion disponible no detalla el numero exacto de tokens o fotogramas de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. El repositorio de HuggingFace no incluye aqui datos de benchmark publicados.

## Capacidades

- Generacion de vídeo a partir de imagen: produce un clip corto animando una fotografía fija, que actua como primer fotograma.
- Generacion de movimiento con prior aprendido: sintetiza transiciones coherentes de camara y de sujeto a partir de una sola instantanea.
- Control de movimiento: el pipeline permite parametrizar la cantidad de movimiento (por ejemplo, mediante los parametros `motion_bucket_id`, `fps` y `noise_aug_strength` del `StableVideoDiffusionPipeline`).
- Generacion de fotogramas multiples con coherencia temporal gracias a las capas de atencion temporal.
- Integracion con el ecosistema `diffusers`, lo que facilita su uso en scripts de Python y en interfaces graficas.
- No dispone de tool calling, function calling ni capacidades de agente (no es un modelo de lenguaje).
- No dispone de capacidades multilingues ni de comprension textual (no procesa prompts de texto).
- No incorpora modo de razonamiento explicito (thinking mode), ni vision de alto nivel, ni procesamiento de audio.

## Casos de uso

- Animacion de imagenes de producto: a partir de una fotografia fija de un articulo se genera un breve clip con movimiento de camara sutil, util para anuncios o fichas de ecommerce sin necesidad de rodaje.
- Creacion de contenido para redes sociales: conversion de ilustraciones o fotografias en clips cortos en bucle para publicaciones, aprovechando la animacion de un unico fotograma.
- Previsualizacion en produccion audiovisual (previz): animar storyboards o conceptos artisticos para evaluar el movimiento de una escena antes de rodarla.
- Enriquecimiento de catalogos y archivos historicos: dar movimiento a fotografias antiguas o de archivo para exposiciones digitales y material divulgativo.
- Prototipado en estudios de videojuegos y animacion: generar referencias de movimiento a partir de conceptos para iterar rapidamente en preproduccion.
- Generacion de material para publicidad y marketing: crear clips de fondo animados a partir de imagenes de marca de forma automatizada en pipelines por lotes.
- Experimentacion en investigacion de generacion de vídeo: servir como base o punto de comparacion para estudios sobre difusion aplicada al vídeo y evaluacion de coherencia temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones, no confirmadas en la informacion disponible): los pesos en fp16 ocupan alrededor de 3 GB, pero la generacion de fotogramas multiples eleva el consumo real por las activaciones intermedias. Se estiman en torno a 10-16 GB de VRAM para clips cortos y resoluciones moderadas, y mas de 16 GB para clips mas largos o mayor resolucion.
- GPU recomendadas (estimacion): NVIDIA A100, H100 o RTX 4090 para mayor comodidad; tarjetas de gama alta con 16 GB o mas de VRAM para configuraciones de clip reducidas.
- Cabe en GPU de consumo (estimacion): si, en GPUs con suficiente VRAM (por ejemplo, RTX 4090 o similares); en tarjetas con menos memoria puede requerir reducir la longitud del clip o segmentar el procesamiento.
- Opciones de despliegue: `diffusers` (`StableVideoDiffusionPipeline`) es la via oficial; tambien puede integrarse en interfaces graficas como ComfyUI u otros wrappers de la comunidad.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / clip | Licencia | Disponibilidad |
|---|---|---|---|---|
| stable-video-diffusion-img2vid-xt-1-1 | Aprox. 1,52 mil millones | No disponible | stable-video-diffusion-1-1-community | Gated en HuggingFace |
| stable-video-diffusion-img2vid-xt | No disponible | No disponible | stable-video-diffusion-community | En HuggingFace |
| stable-video-diffusion-img2vid | No disponible | No disponible | stable-video-diffusion-community | En HuggingFace |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada. El modelo 1-1 es un ajuste fino de la version `xt` anterior, por lo que comparten arquitectura y tamano aproximado; otras alternativas abiertas de la misma categoria (image-to-video) no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Riesgo de artefactos y de movimiento poco realista: la calidad de la animacion depende fuertemente de la imagen de entrada; entradas ambiguas o con poco detalle pueden producir deformaciones.
- Sesgos conocidos: al entrenarse sobre grandes conjuntos de datos de vídeo, puede heredar sesgos de representacion (genero, etnia, contexto cultural) presentes en esos datos. No se documentan sesgos especificos en la informacion disponible.
- Limitacion de longitud: genera clips cortos, no secuencias largas; no esta pensado para vídeo de larga duracion ni para coherencia narrativa extendida.
- Sin entrada de texto: no acepta prompts de texto, por lo que el control del resultado se limita a la imagen de entrada y a parametros de generacion (movimiento, fps, ruido).
- Alucinacion visual: puede inventar contenido o mover elementos de forma incoherente con la escena real.
- Restricciones de licencia: usa la licencia comunitaria `stable-video-diffusion-1-1-community`, con condiciones de uso especificas. Es imprescindible revisarla antes de cualquier uso comercial; el acceso esta restringido y requiere aceptar los terminos en HuggingFace.
- Caveat de produccion: el acceso gated complica la automatizacion de descargas en CI/CD si no se gestiona la autenticacion con token.
- No se documentan en la informacion disponible los idiomas, la resolucion exacta ni el numero de fotogramas por defecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt-1-1
- Version anterior xt en HuggingFace: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt
- Pagina de producto Stable Video de Stability AI: https://stability.ai/stable-video
- Repositorio de ejemplo con interfaz grafica (Colab): https://github.com/sagiodev/stable-video-diffusion-img2vid
- Cuaderno de demostracion en Colab (mkshing/notebooks): https://colab.research.google.com/github/mkshing/notebooks/blob/main/stable_video_diffusion_img2vid.ipynb
