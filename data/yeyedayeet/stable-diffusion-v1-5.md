# Yeyedayeet/stable-diffusion-v1-5

## Resumen

Stable Diffusion v1-5 es un modelo de difusión latente de texto a imagen desarrollado por Robin Rombach y Patrick Esser (CompVis, LMU Munich) y publicado originalmente por RunwayML. Este repositorio concreto (`Yeyedayeet/stable-diffusion-v1-5`) es un espejo no oficial del checkpoint original, ahora deprecado, y no está afiliado con RunwayML. El modelo genera imágenes fotorrealistas a partir de descripciones textuales mediante un proceso de difusión en un espacio latente, lo que reduce significativamente los requisitos computacionales frente a los modelos de difusión en píxeles.

El checkpoint v1-5 se inicializó con los pesos de Stable Diffusion v1-2 y se ajustó durante 595 000 pasos a resolución 512×512 sobre el subconjunto «laion-aesthetics v2 5+», con un 10 % de descarte del condicionamiento textual para mejorar el muestreo con *classifier-free guidance*. El modelo emplea un codificador de texto fijo CLIP ViT-L/14 y una arquitectura de difusión latente (LDM) con un UNet como denoiser. Con 859,5 millones de parámetros en el checkpoint (correspondientes al UNet), sigue siendo una referencia ampliamente utilizada en la comunidad de generación de imágenes, a pesar de haber sido superado por modelos posteriores.

La relevancia actual de este modelo radica en su papel como base para innumerables fine-tunings, LoRAs y herramientas de código abierto (ComfyUI, Automatic1111, InvokeAI). Su licencia CreativeML OpenRAIL-M permite uso comercial con restricciones de responsabilidad, lo que lo convierte en una opción habitual para prototipos y aplicaciones creativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (UNet + VAE + CLIP ViT-L/14) |
| Parametros totales | 859 520 964 (checkpoint safetensors, correspondiente al UNet) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | No disponible (se puede usar en fp16, pero no se especifica en la información) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Stable Diffusion v1-5 es un modelo de difusión latente (LDM) que opera en un espacio latente de menor dimensión en lugar de hacerlo directamente sobre píxeles. La arquitectura consta de tres componentes principales: un autoencoder variacional (VAE) que comprime la imagen a un espacio latente, un UNet que realiza el proceso de denoising en ese espacio, y un codificador de texto CLIP ViT-L/14 fijo que convierte el prompt en embeddings condicionantes. El entrenamiento se realizó en dos fases: primero se preentrenó el VAE y el UNet en el espacio latente, y después se ajustó el modelo completo con condicionamiento textual.

El checkpoint v1-5 parte de los pesos de v1-2 y se fine-tuneó durante 595 000 pasos a resolución 512×512 sobre el subconjunto «laion-aesthetics v2 5+». Durante el ajuste se aplicó un 10 % de descarte del condicionamiento textual, una técnica que mejora la calidad del muestreo con *classifier-free guidance* al permitir que el modelo aprenda a generar imágenes sin prompt. No se menciona el uso de RLHF ni DPO en la información disponible. El modelo se publicó con dos variantes de pesos: una solo con EMA (adecuada para inferencia) y otra con EMA+no-EMA (recomendada para fine-tuning).

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto en inglés.
- Modificación de imágenes existentes mediante técnicas de *img2img* (el modelo puede tomar una imagen inicial y un prompt para generar variaciones).
- Soporte para *inpainting* y *outpainting* cuando se combina con pipelines específicos de diffusers.
- Compatible con *classifier-free guidance* para controlar la adherencia al prompt.
- Integración con el ecosistema de herramientas de código abierto: Diffusers, ComfyUI, Automatic1111, SD.Next e InvokeAI.
- Capacidad de fine-tuning y adaptación mediante LoRA o entrenamiento completo, gracias a la disponibilidad de pesos en formato safetensors.
- Generación de imágenes a resolución 512×512 (resolución nativa de entrenamiento).

## Casos de uso

- Generación de arte conceptual y bocetos: el modelo puede producir imágenes de alta calidad a partir de descripciones textuales, lo que lo hace útil para diseñadores e ilustradores que necesitan explorar ideas rápidamente.
- Prototipado visual para marketing: se pueden generar imágenes de productos, escenas o conceptos para campañas publicitarias sin necesidad de sesiones fotográficas costosas.
- Herramientas educativas y creativas: aplicaciones que permiten a estudiantes o aficionados experimentar con la generación de imágenes a partir de texto, fomentando la comprensión de modelos generativos.
- Investigación en IA generativa: el modelo sirve como punto de partida para estudiar sesgos, limitaciones y técnicas de mejora en difusión latente, tal como se indica en la model card.
- Fine-tuning para dominios específicos: gracias a su licencia permisiva y a la disponibilidad de pesos, se puede ajustar el modelo con datasets propios para generar imágenes de estilos o temáticas concretas (por ejemplo, ilustración médica, moda o arquitectura).
- Generación de imágenes para entornos de prueba en desarrollo de videojuegos: los equipos pueden crear assets visuales provisionales a partir de prompts, acelerando el proceso de iteración en fases tempranas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original no incluye métricas cuantitativas como FID, CLIP score o comparaciones con otros modelos. Se recomienda consultar el paper original (Rombach et al., CVPR 2022) para obtener datos de evaluación, aunque no se reproducen aquí por no estar presentes en la información proporcionada.

## Requisitos de hardware

No se dispone de datos específicos sobre requisitos de hardware en la información proporcionada. Sin embargo, dado que el checkpoint tiene 859,5 millones de parámetros y es un modelo de difusión, se puede inferir que:

- Se recomienda una GPU con al menos 8 GB de VRAM para inferencia en fp16 (por ejemplo, NVIDIA RTX 2070 o superior).
- Para fine-tuning completo se necesitan GPUs con 16 GB o más (por ejemplo, RTX 3090, A100).
- El modelo es compatible con las principales librerías de despliegue: Diffusers, ComfyUI, Automatic1111, SD.Next e InvokeAI.
- No se dispone de datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Este modelo es el predecesor directo de Stable Diffusion v2 y de modelos posteriores como SDXL, pero no se incluyen métricas de rendimiento en la documentación disponible. Se recomienda consultar benchmarks externos para una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo no fue entrenado para ser factual ni representar fielmente personas o eventos reales; su uso para generar contenido verídico está fuera de su alcance.
- Puede generar contenido sesgado o estereotipado, tal como se advierte en la model card, especialmente en lo relativo a género, raza y profesiones.
- Existe riesgo de alucinación visual: el modelo puede producir imágenes con objetos o detalles que no corresponden al prompt.
- La licencia CreativeML OpenRAIL-M permite uso comercial, pero prohíbe usos maliciosos, como la generación de contenido dañino, difamatorio o que promueva la violencia.
- El idioma soportado es principalmente inglés; los prompts en otros idiomas pueden producir resultados de menor calidad.
- Este repositorio concreto es un espejo no oficial y no está afiliado con RunwayML; se recomienda verificar la procedencia de los pesos antes de su uso en producción.

## Enlaces

- Repositorio de HuggingFace (este espejo): https://huggingface.co/Yeyedayeet/stable-diffusion-v1-5
- Repositorio oficial (deprecado): https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Blog de Hugging Face sobre Stable Diffusion: https://huggingface.co/blog/stable_diffusion
- Paper original (Latent Diffusion Models): https://arxiv.org/abs/2112.10752
- Repositorio de GitHub de CompVis: https://github.com/CompVis/stable-diffusion
- Espejo en GitHub (lizhen0211): https://github.com/lizhen0211/stable-diffusion-v1-5
- Espejo en GitHub (Shan-jr): https://github.com/Shan-jr/stable-diffusion-v1-5-stable-diffusion-v1-5
