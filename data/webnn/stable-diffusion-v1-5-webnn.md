# webnn/stable-diffusion-v1.5-webnn

## Resumen

`webnn/stable-diffusion-v1.5-webnn` es una conversión a ONNX de Stable Diffusion 1.5 optimizada específicamente para WebNN, la API web de aceleración de inferencia sobre hardware (CPU, GPU, NPU) del W3C. El modelo base, desarrollado originalmente por Robin Rombach y Patrick Esser (CompVis/LMU Munich) y publicado por RunwayML, es un modelo de difusión latente (Latent Diffusion Model, LDM) para generación de imágenes a partir de texto. Esta variante mantiene los pesos del checkpoint v1-5 y aplica dos transformaciones clave: exportación a formato ONNX y fijación de formas de entrada estáticas, además de eliminar operadores no utilizados en el grafo.

La relevancia de esta ficha radica en que permite ejecutar Stable Diffusion 1.5 directamente en el navegador mediante WebNN, sin necesidad de servidores GPU dedicados, lo que abre la puerta a aplicaciones de generación de imágenes en cliente con privacidad de datos y sin costes de infraestructura. El modelo mantiene las limitaciones del original: resolución nativa de 512x512, encoder de texto CLIP ViT-L/14 y condicionamiento en inglés.

El repositorio ocupa 2.7 GB y está pensado, según el propio autor, para fines educativos o de prueba con la muestra de WebNN correspondiente. No se han publicado resultados de benchmarks ni métricas de rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (UNet + VAE + CLIP ViT-L/14 text encoder) |
| Parametros totales | no disponible (el checkpoint original v1-5 ronda los 860M en UNet; el total exacto no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión; el encoder de texto CLIP admite hasta 77 tokens) |
| Tipos de cuantizacion | no disponible (formato ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (según model card del modelo base) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | ONNX (formas de entrada estáticas, operadores no usados eliminados) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de difusión latente propuesta en el paper de Latent Diffusion Models (Rombach et al., CVPR 2022). Consta de tres componentes: un autoencoder variacional (VAE) que comprime imágenes a un espacio latente de menor dimensión, una UNet que realiza el proceso de denoising iterativo en ese espacio latente, y un encoder de texto CLIP ViT-L/14 que proyecta el prompt a embeddings de condicionamiento. La generación se controla mediante classifier-free guidance, con un dropout del 10% del condicionamiento de texto durante el entrenamiento para habilitar dicha técnica.

El checkpoint v1-5 se inicializó con los pesos de Stable Diffusion v1-2 y se afinó durante 595.000 pasos a resolución 512x512 sobre el subconjunto "laion-aesthetics v2 5+", con un 10% de dropping del condicionamiento textual. La variante WebNN no reentrena el modelo: únicamente lo exporta a ONNX, fija las formas de entrada para permitir optimizaciones estáticas en el runtime y poda operadores no utilizados. No se documentan datos sobre RLHF, DPO ni otras etapas de alineación adicionales.

## Capacidades

- Generación de imágenes fotorrealistas e ilustraciones a partir de prompts de texto en inglés.
- Modificación de imágenes mediante img2img (el pipeline de difusión lo permite, aunque la model card no lo detalla específicamente para esta variante ONNX).
- Inpainting y outpainting mediante los pipelines correspondientes de Diffusers (no confirmado para la variante WebNN).
- Ejecución en navegador mediante WebNN, con aceleración sobre CPU, GPU o NPU según el backend disponible.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingües limitadas al inglés por el encoder CLIP ViT-L/14.
- No dispone de modo "thinking", visión, audio ni otras capacidades multimodales más allá de texto a imagen.

## Casos de uso

- Generación de imágenes en el navegador sin servidor: el modelo se ejecuta íntegramente en cliente mediante WebNN, lo que elimina la necesidad de infraestructura GPU y permite ofrecer funciones de generación de imágenes en aplicaciones web con privacidad total para el usuario.
- Prototipado educativo de modelos de difusión: adecuado para demostraciones y cursos sobre difusión latente, ya que el ONNX estático simplifica el despliegue y la inspección del grafo.
- Herramientas de diseño asistido en entornos web: integración en editores gráficos basados en navegador para generar borradores o variaciones de ilustraciones a partir de descripciones textuales.
- Pruebas de accesibilidad y rendimiento de WebNN: sirve como caso de referencia para medir la aceleración de inferencia en distintos backends (CPU, GPU, NPU) y navegadores.
- Generación de contenido para maquetas y wireframes: creación rápida de imágenes de relleno en herramientas de diseño web que necesitan recursos visuales sin depender de servicios externos.
- Investigación sobre sesgos y seguridad en modelos generativos: al ejecutarse localmente, facilita auditorías reproducibles de sesgos y comportamientos del modelo sin enviar prompts a terceros.
- Aplicaciones offline o de baja conectividad: una vez cargado el modelo en el navegador, la generación no requiere conexión a un servidor de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint original v1-5 en fp16 requiere aproximadamente 4 GB de VRAM en GPU dedicada; la variante ONNX con formas estáticas puede reducir el pico de memoria, pero no se documenta una cifra concreta.
- GPU recomendadas: cualquier GPU compatible con el backend WebNN del navegador (DirectML en Windows, Metal en macOS, etc.). No se especifican modelos concretos.
- Compatibilidad con GPU de consumo: sí, el modelo original cabe en GPUs de consumo con 4-6 GB de VRAM (RTX 3050, RTX 3060, etc.); en WebNN la disponibilidad depende del soporte del navegador y del sistema operativo.
- Opciones de despliegue: WebNN (navegador), ONNX Runtime (con backend WebNN o CPU/GPU nativo), y potencialmente Diffusers si se convierte de vuelta a formato PyTorch (no documentado).
- Latencia y throughput: no disponibles. Dependen del backend WebNN, del hardware subyacente y del número de pasos de denoising configurados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webnn/stable-diffusion-v1.5-webnn | no disponible (~860M UNet) | 512x512, 77 tokens CLIP | ONNX (WebNN) | CreativeML OpenRAIL-M | Hugging Face |
| runwayml/stable-diffusion-v1-5 | ~860M UNet | 512x512, 77 tokens CLIP | safetensors / ckpt | CreativeML OpenRAIL-M | Hugging Face |
| stabilityai/stable-diffusion-2-1 | ~865M UNet | 768x768, 77 tokens CLIP | safetensors | CreativeML OpenRAIL++-M | Hugging Face |
| stabilityai/sdxl-turbo | ~2.6B UNet | 512x512, 77 tokens CLIP | safetensors | CreativeML OpenRAIL++-M | Hugging Face |

La comparativa se limita a modelos de la misma familia (difusión latente texto-a-imagen). La variante WebNN se distingue por su formato ONNX con formas estáticas y su orientación a ejecución en navegador, mientras que las alternativas están pensadas para inferencia en servidor con PyTorch/Diffusers.

## Limitaciones y advertencias

- El modelo está entrenado predominantemente con datos en inglés; los prompts en otros idiomas producen resultados degradados.
- Riesgo de sesgos de género, etnia y cultura heredados del dataset LAION-aesthetics, con posible infrarrepresentación de grupos minoritarios.
- Riesgo de alucinación visual: el modelo puede generar imágenes plausibles pero factualmente incorrectas, especialmente con prompts que describen escenas complejas o texto dentro de la imagen.
- Resolución nativa limitada a 512x512; resoluciones superiores requieren upscalers externos y pueden introducir artefactos.
- Licencia CreativeML OpenRAIL-M: permite uso comercial y redistribución, pero impone restricciones de uso (no generar contenido ilegal o dañino) que deben replicarse en productos derivados y comunicarse a los usuarios finales.
- El autor indica que la variante WebNN está pensada para fines educativos o de prueba; no se garantiza soporte para producción.
- Las formas de entrada estáticas limitan la flexibilidad: no se pueden variar dimensiones de imagen o longitud de prompt sin reexportar el modelo.
- No se documentan procesos de alineación adicionales (RLHF/DPO) más allá del filtrado del dataset original.
- El repositorio no incluye métricas de rendimiento ni comparativas con el modelo original en términos de calidad de imagen.

## Enlaces

- [Hugging Face: webnn/stable-diffusion-v1.5-webnn](https://huggingface.co/webnn/stable-diffusion-v1.5-webnn)
- [Modelo base: runwayml/stable-diffusion-v1-5](https://huggingface.co/runwayml/stable-diffusion-v1-5)
- [Licencia CreativeML OpenRAIL-M](https://huggingface.co/spaces/CompVis/stable-diffusion-license)
- [Paper: High-Resolution Image Synthesis with Latent Diffusion Models](https://arxiv.org/abs/2112.10752)
- [Paper: Classifier-Free Diffusion Guidance](https://arxiv.org/abs/2207.12598)
- [Paper: CLIP (ViT-L/14)](https://arxiv.org/abs/2103.00020)
- [Paper: Imagen](https://arxiv.org/abs/2205.11487)
- [Paper: Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/1910.09700)
- [Repositorio CompVis/stable-diffusion](https://github.com/CompVis/stable-diffusion)
- [Repositorio RunwayML/stable-diffusion](https://github.com/runwayml/stable-diffusion)
- [Blog de Hugging Face sobre Stable Diffusion](https://huggingface.co/blog/stable_diffusion)
- [Documentación de Diffusers](https://github.com/huggingface/diffusers#text-to-image-generation-with-stable-diffusion)
