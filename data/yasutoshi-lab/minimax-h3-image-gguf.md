# yasutoshi-lab/MiniMax-H3-Image-GGUF

## Resumen

MiniMax-H3-Image GGUF es una cuantización comunitaria del modelo de generación y edición de imágenes MiniMax-H3-Image, desarrollado originalmente por MiniMax. El repositorio, mantenido por el usuario yasutoshi-lab, convierte los pesos oficiales a formato GGUF para su uso con stable-diffusion.cpp, con el objetivo de reducir los requisitos de memoria y permitir la ejecución en hardware más modesto. No se trata de una distribución oficial de MiniMax.

El modelo base es un sistema de difusión con arquitectura DiT (Diffusion Transformer) que combina un codificador de texto derivado de Qwen3-VL-32B, un transformador de difusión y un VAE. El total de parámetros reportado en safetensors es de 25.935.746.560 (aproximadamente 25,9 mil millones), y el repositorio completo ocupa 337,2 GB debido a la inclusión de múltiples variantes de cuantización.

La relevancia de esta ficha radica en que permite ejecutar un modelo de generación de imágenes de gran tamaño en entornos locales con GPUs de consumo, a costa de una reducción en la calidad para las cuantizaciones más agresivas. Además, incorpora soporte de edición de imágenes mediante una referencia visual, lo que amplía sus aplicaciones más allá del text-to-image puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con codificador de texto Qwen3-VL-32B truncado y VAE |
| Parametros totales | 25.935.746.560 (dato de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_S, IQ3_XXS, IQ2_S, IQ2_XS (para DiT y TE) |
| Idiomas soportados | no disponibles |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | GGUF (DiT y TE), safetensors (VAE) |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3-Image emplea una arquitectura de difusión basada en un Diffusion Transformer (DiT). El pipeline se compone de tres partes: un codificador de texto derivado de Qwen3-VL-32B (del que se conservan las 50 primeras capas, eliminando las capas 50 a 63), un transformador de difusión que genera las imágenes y un VAE que las decodifica al espacio de píxeles. La cuantización comunitaria reorganiza el DiT en un único archivo legible por stable-diffusion.cpp y precalcula las salidas de AdaLN para los 7 tiempos correspondientes a 6 pasos de muestreo (6 sigmas más 0,999 para la imagen de referencia), almacenándolas en una tabla `adaln_t_table`. Esto implica que el modelo solo puede usarse con exactamente 6 pasos de muestreo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card del repositorio cuantizado indica explícitamente que no se han modificado los pesos mediante entrenamiento, solo se han reorganizado y cuantizado. El codificador de texto se cuantiza con llama.cpp, y las variantes IQ utilizan imatrix. El VAE se mantiene sin cambios respecto al original.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución configurable, por ejemplo 1024x1024.
- Edición de imágenes basada en una imagen de referencia, permitiendo modificar elementos concretos manteniendo el resto sin cambios.
- Soporte de instrucciones en lenguaje natural para la edición, con referencias a la imagen mediante marcadores como `<Picture 1>`.
- Integración con stable-diffusion.cpp mediante la CLI `sd-cli`, con parámetros para modelo de difusión, codificador de texto, VAE y proyección visual.
- Capacidad multimodal en el codificador de texto gracias al componente de visión (`mmproj-F16.gguf`), necesario para la edición de imágenes.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo de generación de imágenes.

## Casos de uso

- Generación de ilustraciones conceptuales: el modelo puede crear imágenes fotorrealistas o estilizadas a partir de descripciones textuales, útil para prototipado rápido de ideas en diseño gráfico. La cuantización Q4_K_M mantiene la composición respecto a BF16, lo que permite iterar con requisitos de memoria reducidos.
- Edición de fotografías con instrucciones textuales: gracias al soporte de imagen de referencia y al componente de visión, se puede pedir que se sustituya un objeto (por ejemplo, una manzana roja por una pera verde) manteniendo el resto de la escena. Es adecuado para retoques localizados sin herramientas de edición manual.
- Creación de material para marketing: generación de imágenes de producto en distintos entornos o variaciones de color, usando el modo de edición para conservar la identidad visual del producto original.
- Prototipado de assets para videojuegos: generación de texturas, fondos o conceptos de personajes en resoluciones de 1024x1024, con la posibilidad de ejecutar en local sin depender de APIs externas.
- Automatización de pipelines de contenido: integración en scripts mediante `sd-cli` para generar lotes de imágenes a partir de listas de prompts, con control de pasos y escala de CFG fijos.
- Investigación en difusión: el repositorio permite experimentar con distintas combinaciones de cuantización (10 variantes de DiT y 10 de TE) para estudiar el impacto de la precisión en la calidad de generación y edición, con la advertencia de que las variantes IQ2 degradan la generación desde texto.
- Educación y demos locales: ejecución en una GPU de consumo con cuantizaciones IQ3 o IQ4, útil para talleres o demostraciones sin acceso a infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta una verificación funcional: se probaron 28 combinaciones de 10 variantes de DiT y 10 de TE en una NVIDIA RTX PRO 6000 de 96 GB, con stable-diffusion.cpp `32d516c` y llama.cpp `aa75ff323`, y todas produjeron imágenes tanto en generación como en edición. No se aportan métricas de calidad objetivas como FID, CLIP score o similares.

## Requisitos de hardware

- VRAM estimada: depende de la combinación de cuantizaciones. La tabla de la model card indica el tamaño en disco de los archivos, no el consumo en ejecución, que puede ser superior. Combinaciones de referencia: BF16 + BF16 ocupa 94,54 GB (95,73 GB con edición); Q8_0 + Q8_0, 51,44 GB; Q4_K_M + Q4_K_M, 30,78 GB; IQ3_XXS + IQ3_XXS, 20,46 GB; IQ2_XS + IQ2_XS, 16,32 GB.
- GPU recomendadas: la verificación se realizó en una NVIDIA RTX PRO 6000 de 96 GB, suficiente para BF16. Para cuantizaciones Q4 o inferiores, GPUs con 24-48 GB (RTX 4090, A6000, L40S) pueden ser viables, aunque el consumo real de memoria no está documentado.
- ¿Cabe en GPU de consumo? Las cuantizaciones IQ3 e IQ2 (16-23 GB en disco) podrían caber en GPUs de 24 GB como la RTX 4090, pero el consumo en ejecución no se especifica y podría exceder el tamaño de los archivos.
- Opciones de despliegue: stable-diffusion.cpp (verificado), con soporte de llama.cpp para el codificador de texto. No se mencionan vLLM, Ollama ni TGI, que no son aplicables a este tipo de modelo de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generación de imágenes con los que comparar de forma rigurosa. Se puede señalar que el modelo base compite en la categoría de modelos de difusión de gran tamaño con edición integrada, pero no se aportan cifras comparativas.

## Limitaciones y advertencias

- La licencia MiniMax-H3-Image Community License Agreement excluye expresamente el uso, la reproducción y la distribución en la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos (Excluded Territories). Esto impide su uso comercial o personal en esos territorios.
- El modelo solo funciona con exactamente 6 pasos de muestreo, ya que las salidas de AdaLN se precalculan para esos tiempos. No se puede aumentar o reducir el número de pasos.
- Las cuantizaciones IQ4_XS e IQ3 cambian la composición de las imágenes con mayor frecuencia; las IQ2 degradan la generación desde texto (aunque la edición se mantiene aceptablemente hasta IQ2_S). La degradación se debe principalmente al DiT, no al codificador de texto, que apenas afecta a la calidad hasta Q5_K_M.
- El consumo real de memoria en ejecución no coincide con el tamaño de los archivos, por lo que las estimaciones de VRAM basadas en disco pueden quedarse cortas.
- No se dispone de información sobre sesgos, riesgo de alucinación visual, idiomas soportados ni limitaciones de contexto del codificador de texto.
- Al ser una cuantización comunitaria no oficial, no hay garantía de soporte ni de paridad exacta con el modelo original.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yasutoshi-lab/MiniMax-H3-Image-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repositorio GitHub de MiniMax-H3-Image: https://github.com/MiniMax-AI/MiniMax-H3-Image
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- llama.cpp: https://github.com/ggml-org/llama.cpp
- ModelScope: https://modelscope.cn/models/MiniMax/MiniMax-H3-Image
- API de MiniMax: https://platform.minimax.io
- Sitio web de MiniMax: https://www.minimax.io
- Hailuo AI: https://hailuoai.video
- Discord de MiniMax: https://discord.com/invite/dbMxutw7tP
