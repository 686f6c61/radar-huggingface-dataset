# tmllabres/sd-v1-4-ilustraciones-antiguas

## Resumen

`tmllabres/sd-v1-4-ilustraciones-antiguas` es un ajuste fino de Stable Diffusion v1.4 (CompVis) especializado en generar imágenes con la estética de los grabados y litografías de libros antiguos. Lo publica el usuario tmllabres como entrega final del módulo de generación de imagen del Máster en IA, Cloud Computing y DevOps (Pontia), y se distribuye como pipeline completo de diffusers con el LoRA ya fusionado en los pesos de la UNet, no como adaptador separado.

El modelo parte de los pesos originales de SD 1.4 y se entrena sobre 1000 ilustraciones del dataset `gigant/oldbookillustrations`, usando las columnas `1600px` e `info_alt` (imagen y descripción textual). El resultado es un modelo de difusión latente de 859.520.964 parámetros en la UNet (recuento del fichero safetensors), resolución nativa 512×512 y condicionamiento textual mediante CLIP, capaz de responder a prompts en inglés con un estilo visual muy concreto.

Su relevancia es acotada y práctica: no compite en calidad general con SDXL o modelos más recientes, pero sirve como ejemplo reproducible de ajuste fino con LoRA sobre SD 1.4 en hardware de consumo (9,2 minutos de entrenamiento en una RTX 5060 Ti) y como generador de ilustraciones de estilo histórico para proyectos editoriales, prototipos o documentación. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de sus resultados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente (latent diffusion): UNet con atención cruzada, VAE y codificador de texto CLIP ViT-L/14 |
| Parámetros totales | 859.520.964 (recuento del safetensors, correspondiente a la UNet; el pipeline completo añade VAE y text encoder) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica a generación de imagen; el codificador CLIP de SD 1.4 procesa prompts de hasta 77 tokens |
| Tipos de cuantización | Pesos en fp16 y fp32; el repositorio solo distribuye safetensors, sin versiones GGUF u ONNX |
| Idiomas soportados | No disponible en la model card; el codificador CLIP de SD 1.4 está entrenado principalmente en inglés y los ejemplos de uso son en inglés |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (librería diffusers, `StableDiffusionPipeline`) |
| Resolución nativa | 512×512 |
| Modelo base | CompVis/stable-diffusion-v1-4 |
| Dataset de ajuste | gigant/oldbookillustrations (1000 ejemplos, columnas `1600px` e `info_alt`) |
| Tamaño del repositorio | 2,7 GB |
| Pipeline declarado | text-to-image |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.4 sin modificaciones estructurales: un autoencoder variacional que comprime la imagen a un espacio latente de 4 canales, una UNet que aplica difusión denoising sobre ese latente con atención cruzada hacia las representaciones del codificador de texto CLIP ViT-L/14, y un decoder que reconstruye la imagen final. El ajuste se realiza con LoRA de rango 8 y alpha 8 sobre los módulos `to_k`, `to_q`, `to_v` y `to_out.0` de la UNet, y posteriormente se fusiona en los pesos, de modo que el artefacto publicado se carga directamente con `StableDiffusionPipeline.from_pretrained` sin cargar adaptadores adicionales.

Los datos de entrenamiento son 1000 ilustraciones del dataset `gigant/oldbookillustrations`, redimensionadas por el lado corto a 512 px con recorte central 512×512 y volteo horizontal como aumento. El entrenamiento se ejecutó durante 750 pasos (3 épocas con batch efectivo de 4), learning rate 1e-4 con scheduler cosine y 50 pasos de warmup, precisión fp16 y gradient checkpointing, en 9,2 minutos sobre una NVIDIA GeForce RTX 5060 Ti. No se documenta en la información disponible el uso de RLHF, DPO ni etapas de refinamiento por preferencias; tampoco se detalla la composición o el filtrado del dataset más allá de las dos columnas citadas.

## Capacidades

- Generación de imágenes texto-a-imagen con estilo de grabado, xilografía y litografía de libros antiguos.
- Aplicación de estilo consistente a partir de descripciones textuales en inglés (por ejemplo, "An old sailor smoking a pipe on the deck of a ship").
- Compatibilidad con los parámetros estándar del pipeline de diffusers: número de pasos de inferencia, semilla, guidance scale y prompt negativo.
- Reutilización de los mismos pesos en los pipelines `StableDiffusionImg2ImgPipeline` y `StableDiffusionInpaintPipeline` de diffusers, al conservar la arquitectura de SD 1.4 (no validado en la model card).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento.
- No se documentan capacidades multilingües; el condicionamiento textual efectivo es en inglés.

## Casos de uso

- Ilustración editorial de temática histórica: generar viñetas y grabados de época para libros, revistas o cuadernos de divulgación, controlando el estilo con prompts descriptivos y una semilla fija para mantener coherencia entre piezas.
- Prototipado rápido de portadas y material gráfico: producir bocetos en 512×512 en segundos sobre una GPU de consumo, antes de encargar la ilustración definitiva a un artista.
- Ambientación para juegos de rol de mesa y narrativa interactiva: crear ilustraciones de personajes, barcos, objetos y escenarios con estética decimonónica a partir de descripciones breves.
- Generación de material para documentación técnica y presentaciones: ilustraciones de estilo antiguo para diapositivas, artículos de blog o manuales con una dirección de arte homogénea.
- Experimentación académica y docencia: el modelo sirve como caso reproducible de ajuste fino con LoRA sobre SD 1.4, con hiperparámetros y tiempos de entrenamiento documentados, para prácticas de generación de imagen.
- Fondo de catálogo para archivos y bibliotecas digitales: generar imágenes de relleno con estética de grabado para maquetas de exposiciones o fichas de catálogo, siempre que se revise el resultado por posible parecido con obras concretas del dataset.
- Pruebas de pipelines MLOps: al ser un pipeline de diffusers de ~2,7 GB, es útil para validar despliegues con endpoints compatibles, contenedores con GPU y pruebas de latencia sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, CLIP score, comparaciones humanas ni evaluaciones cuantitativas del estilo aprendido; únicamente una imagen comparativa "antes / después" con el mismo prompt y semilla (`antes_despues.png`), que no constituye una métrica reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp16 suman aproximadamente 2,1 GB (UNet incluida en el recuento de 859,5 M de parámetros, más VAE y text encoder), por lo que el pipeline completo cabe en GPUs de 4-6 GB con atención eficiente; en fp32 la demanda de pesos se duplica.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4060 Ti, RTX 4070, RTX 5060 Ti); con 4 GB es necesario usar `enable_attention_slicing()` o `enable_model_cpu_offload()`.
- GPUs de datacenter (A100, H100, L40S) solo tienen sentido para servir muchas peticiones en paralelo o por encima de 512×512; para una sola imagen son sobredimensionadas.
- Cabe en GPU de consumo: sí, es uno de los puntos del ajuste fino, que se completó en 9,2 minutos en una RTX 5060 Ti.
- Opciones de despliegue: diffusers con `StableDiffusionPipeline`, ComfyUI, AUTOMATIC1111 / Forge, SD.Next, endpoints de Hugging Face (el modelo está marcado como `endpoints_compatible`) y exportación a ONNX o TensorRT para optimización.
- Latencia y throughput: no disponible; no se han publicado mediciones. Como referencia de orden de magnitud, a 512×512 y 30 pasos de inferencia el coste por imagen es de fracciones de segundo a pocos segundos según GPU, pero este dato no está verificado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución nativa | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sd-v1-4-ilustraciones-antiguas (este modelo) | 859,5 M en UNet | 512×512 | 77 tokens (CLIP) | CreativeML OpenRAIL-M | Hugging Face, diffusers, 0 descargas |
| Stable Diffusion 1.5 | 859,5 M en UNet | 512×512 | 77 tokens (CLIP) | CreativeML OpenRAIL-M | Amplia adopción, ecosistema LoRA y herramientas maduras |
| Stable Diffusion XL (base) | ~3,5 B (UNet de 2,6 B más dos text encoders) | 1024×1024 | 77 tokens por encoder, con concatenación | CreativeML OpenRAIL++-M | Amplia adopción, mayor calidad general y composición |
| Adaptadores LoRA de estilo sobre SD 1.4/1.5 | 1-50 M por adaptador | 512×512 | 77 tokens (CLIP) | Depende del autor y del base | Muchos publicados en Hugging Face y Civitai |

La comparación relevante no es de benchmarks, que no existen para este modelo, sino de encaje: frente a SD 1.5 ofrece una especialización de estilo concreta a costa de menor soporte comunitario y cero validación; frente a SDXL pierde resolución nativa y calidad general, pero requiere mucha menos VRAM; frente a un LoRA de estilo independiente, la ventaja es que los pesos ya vienen fusionados y se cargan en un solo paso, y la desventaja es que no se puede desactivar ni modular por peso.

## Limitaciones y advertencias

- Sobreajuste probable: 1000 imágenes y 750 pasos son suficientes para capturar un estilo, pero limitan la diversidad de composiciones y pueden reproducir motivos del dataset de forma casi literal.
- Riesgo de alucinación visual: al ser un modelo de difusión, genera detalles plausibles pero falsos (anatomías incorrectas, texto ilegible, artefactos en manos y rostros), especialmente en resoluciones distintas de 512×512.
- Sesgos esperados: las ilustraciones de libros antiguos proceden mayoritariamente de producciones occidentales de los siglos XVIII y XIX, por lo que cabe esperar representaciones estereotipadas de género, etnia y cultura colonial; no hay evaluación de sesgos en la model card.
- Limitación de idioma: el condicionamiento textual funciona de forma fiable en inglés; los prompts en castellano no están documentados ni evaluados.
- Limitación de resolución: 512×512 nativo; para imprimir o para formatos panorámicos requiere upscaling externo, con la consiguiente pérdida de fidelidad.
- Sin datos de procedencia del dataset: no se especifica en la información disponible la licencia de `gigant/oldbookillustrations` ni la verificación de dominio público de las 1000 imágenes; conviene comprobarlo antes de un uso comercial.
- Licencia CreativeML OpenRAIL-M: permite uso comercial, pero impone restricciones de uso (prohibición de usos dañinos, engañosos o ilegales) que deben propagarse a terceros y derivados; no ofrece garantías.
- Ausencia de validación comunitaria: 0 descargas y 0 likes, sin informes de terceros sobre calidad o estabilidad; tratar como artefacto académico y evaluar con prompts propios antes de producción.
- Sin mantenimiento declarado: creado y actualizado el mismo día (2026-10-19), sin historial de versiones ni issues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmllabres/sd-v1-4-ilustraciones-antiguas
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Documentación de diffusers (`StableDiffusionPipeline`): https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion/text2img
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron únicamente páginas de ayuda de YouTube sin relación con el proyecto.
