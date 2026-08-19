# stable-diffusion-v1-5/stable-diffusion-v1-5

## Resumen

Stable Diffusion v1.5 es un modelo de difusión latente para generación de imágenes a partir de texto, desarrollado por Robin Rombach y Patrick Esser en el marco del proyecto Stable Diffusion de RunwayML y CompVis. Este repositorio concreto es un espejo no oficial del checkpoint original, que fue retirado de Hugging Face. El modelo se inicializó con los pesos de Stable Diffusion v1.2 y se afinó durante 595 000 pasos a una resolución de 512×512 sobre el subconjunto «laion-aesthetics v2 5+», con un 10 % de descarte del condicionamiento de texto para mejorar el muestreo con classifier-free guidance.

La arquitectura combina un autoencoder con factor de reducción 8 (VAE), una red UNet de aproximadamente 860 millones de parámetros como denoiser latente y un codificador de texto CLIP ViT-L/14 fijo. El número total de parámetros según los pesos en safetensors es de 859 520 964. El modelo es capaz de generar imágenes fotorrealistas de 512×512 píxeles a partir de cualquier entrada de texto en inglés, y sirvió como base para numerosos desarrollos posteriores en el ecosistema de difusión. Su relevancia histórica es alta: fue uno de los primeros modelos de texto a imagen de código abierto que democratizó la generación de imágenes en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (VAE + UNet + CLIP ViT-L/14) |
| Parametros totales | 859 520 964 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de difusion; genera imagenes de 512×512) |
| Tipos de cuantizacion | fp16, fp32 (comunmente usados); no se documentan cuantizaciones oficiales adicionales |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (tambien disponible .ckpt y .bin en el ecosistema) |

## Arquitectura y entrenamiento

Stable Diffusion v1.5 es un modelo de difusión latente que opera en un espacio latente de menor dimensionalidad que el espacio de píxeles. Un autoencoder (VAE) comprime las imágenes a un espacio latente de 64×64, donde un UNet denoisa iterativamente una representación ruidosa guiado por las embeddings de texto proporcionadas por un codificador CLIP ViT-L/14 preentrenado y congelado. Finalmente, el decodificador del VAE reconstruye la imagen de 512×512.

El entrenamiento partió de los pesos de Stable Diffusion v1.2 y se continuó durante 595 000 pasos a resolución 512×512 sobre el dataset LAION-aesthetics v2 5+. Se aplicó un 10 % de descarte del condicionamiento de texto para permitir el uso de classifier-free guidance, técnica que mejora la adherencia al prompt. No se emplearon métodos de alineación como RLHF o DPO. El modelo fue diseñado para investigación y uso creativo, pero no para generar representaciones factuales de personas o eventos.

## Capacidades

- Generación de imágenes fotorrealistas de 512×512 a partir de descripciones textuales en inglés.
- Edición de imágenes mediante técnicas como img2img e inpainting, utilizando el mismo pipeline de difusión.
- Generación de variaciones de una imagen de entrada, manteniendo la estructura general pero alterando detalles.
- Soporte de classifier-free guidance para ajustar el equilibrio entre fidelidad al prompt y diversidad.
- Integración con el ecosistema de Diffusers y herramientas como ComfyUI, Automatic1111, SD.Next e InvokeAI.
- Capacidad de generar imágenes artísticas en diversos estilos, aunque limitada al idioma inglés para el condicionamiento textual.
- No dispone de capacidades multimodales más allá de texto a imagen; no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Creación de arte conceptual y bocetos para diseño gráfico: el modelo puede producir imágenes de alta calidad a partir de descripciones, facilitando la exploración rápida de ideas en fases iniciales de proyectos creativos.
- Prototipado de diseño de producto: se pueden generar visualizaciones de objetos o escenas a partir de especificaciones textuales, reduciendo el tiempo de iteración en equipos de diseño.
- Generación de assets para videojuegos y entornos virtuales: permite crear texturas, fondos o elementos decorativos con prompts específicos, acelerando el pipeline de producción.
- Edición de fotografías con inpainting: se puede eliminar o reemplazar objetos en una imagen existente, útil en retoque fotográfico y restauración de imágenes.
- Investigación en modelos generativos: sirve como punto de partida para estudios sobre sesgos, interpretabilidad y seguridad en IA generativa, dado su uso extendido y documentación.
- Creación de contenido para publicidad y marketing: se pueden generar imágenes de muestra para campañas, ahorrando costes de producción en fases de concepto.
- Generación de imágenes para ilustración de artículos o blogs: permite obtener visuales personalizados sin depender de bancos de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Aunque el modelo es ampliamente conocido, la model card no incluye métricas cuantitativas como FID o CLIP score, y la búsqueda web no arrojó datos adicionales. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB con fp16 y resolución 512×512, dependiendo del tamaño de lote y del uso de attention slicing.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4090). Para mayor velocidad, se recomienda una GPU con tensor cores (serie RTX 20 o superior).
- Es viable en GPUs de consumo: sí, es uno de los modelos de difusión más ligeros y se ejecuta sin problemas en hardware doméstico.
- Opciones de despliegue: se puede usar con la librería Diffusers de Hugging Face, así como con interfaces gráficas como ComfyUI, Automatic1111, SD.Next e InvokeAI. También se puede servir mediante APIs con vLLM o TGI (aunque estos están orientados a modelos de lenguaje, no a difusión; para difusión se usan soluciones como Stable Diffusion WebUI o APIs propias).
- Latencia y throughput: no disponible en la información proporcionada; depende de la GPU y de la configuración de pasos de inferencia (típicamente 20-50 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stable Diffusion v1.4 | ~860M | 512×512 | CreativeML OpenRAIL-M | Publico |
| Stable Diffusion v1.5 | 859 520 964 | 512×512 | CreativeML OpenRAIL-M | Publico (espejo) |
| Stable Diffusion 2.1 | ~865M | 768×768 | CreativeML OpenRAIL-M | Publico |
| SDXL | ~2.6B | 1024×1024 | CreativeML OpenRAIL-M | Publico |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparativa se limita a características generales. Stable Diffusion v1.5 es prácticamente idéntico a v1.4 en arquitectura y parámetros, diferenciándose en el entrenamiento adicional. SD 2.1 ofrece mayor resolución y un codificador de texto diferente, mientras que SDXL es significativamente más grande y produce imágenes de mayor resolución.

## Limitaciones y advertencias

- Sesgos conocidos: entrenado sobre LAION, que contiene sesgos de género, raza y cultura; puede generar estereotipos o representaciones desequilibradas.
- Riesgo de alucinación: el modelo no está entrenado para ser factual; puede generar imágenes que no corresponden a la realidad o a personas reales.
- Limitaciones de idioma: solo soporta prompts en inglés; el uso de otros idiomas degrada la calidad de la generación.
- Restricciones de licencia: CreativeML OpenRAIL-M permite uso comercial, pero prohíbe usos ilegales o dañinos, como generar contenido que fomente violencia, odio o explotación.
- Limitaciones de contexto: no maneja texto de entrada más allá de la descripción de la imagen; no es un modelo multimodal general.
- Adecuación para producción: requiere control de calidad manual; las imágenes generadas pueden contener artefactos o inconsistencias, especialmente en rostros y manos.
- Este repositorio es un espejo no oficial; el modelo original fue retirado de Hugging Face, por lo que la procedencia y el mantenimiento pueden ser menos fiables que el original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Paper de Latent Diffusion: https://arxiv.org/abs/2112.10752
- Blog de Diffusers sobre Stable Diffusion: https://huggingface.co/blog/stable_diffusion
- Repositorio original de Stable Diffusion (CompVis): https://github.com/CompVis/stable-diffusion
- Repositorio de RunwayML (deprecated): https://github.com/runwayml/stable-diffusion
- Herramienta ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Herramienta Automatic1111: https://github.com/AUTOMATIC1111/stable-diffusion-webui
