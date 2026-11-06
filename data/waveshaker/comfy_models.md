# waveshaker/comfy_models

## Resumen

`waveshaker/comfy_models` es un repositorio de pesos cuantizados para ComfyUI que empaqueta varios modelos de generación y edición de imágenes en formatos de baja precisión (INT8, INT6, FP8, FP16) listos para su uso en flujos de trabajo de difusión. El autor, waveshaker, no entrena modelos propios: redistribuye y recuantiza checkpoints de terceros, principalmente el modelo de edición de imágenes Qwen-Image-Edit-2511 (a través del fine-tune comunitario Qwen-Image-Edit-Rapid-AIO v23) y el modelo de segmentación SAM3 de Meta. El repositorio también referencia otros ecosistemas de imagen como Flux, Pony, SD1.5, Krea2, Moss y Anima en sus etiquetas.

El interés práctico del repositorio reside en la reducción de requisitos de VRAM: al convertir pesos FP8 o FP16 a INT8 con rotación de canales (ConvRot) y esquemas mixtos W6A8, se facilita la ejecución de modelos de difusión de gran tamano en GPUs de consumo dentro de ComfyUI. El repositorio ocupa 65,7 GB y está pensado como un paquete de recursos para nodos personalizados, no como un modelo único.

La licencia declarada es la Qwen Research License, lo que condiciona el uso comercial de los pesos derivados de Qwen. No se dispone de información sobre idiomas soportados, benchmarks ni datos de entrenamiento propios, ya que el autor no publica esa información en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión (modelo base Qwen-Image-Edit-2511, fine-tune Rapid-AIO v23) y segmentación (SAM3); pesos cuantizados para ComfyUI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | INT8 ConvRot, INT6 W6A8, FP8, FP16, FP16/mixed FP8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research-license (declarada como "other" en la model card) |
| Formato de pesos | safetensors (modelos de difusión), .pt (SAM3) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado por el autor, sino artefactos derivados. El componente principal es una recuantización del checkpoint `Qwen-Rapid-AIO-NSFW-v23_diffusion_only_fp8`, un fine-tune comunitario de Qwen-Image-Edit-2511 orientado a edición de imágenes. El autor indica que el modelo original solo estaba disponible en FP8 y que él lo convierte a INT8 con rotación de canales (ConvRot) y a un esquema mixto INT6 W6A8, sin disponer de los pesos FP16 originales. Esta técnica de rotación de canales busca mitigar los valores atípicos (outliers) que degradan la calidad al cuantizar a 8 bits.

El segundo componente es SAM3 (Segment Anything Model 3) de Meta, redistribuido en versiones FP16, FP8 mixto y FP8, comparadas por el autor con la versión oficial FP32. No se publican detalles sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF, DPO o cualquier etapa de alineación, ya que el autor no entrena los modelos base. La innovación técnica del repositorio es exclusivamente de compresión y empaquetado para inferencia en ComfyUI.

## Capacidades

- Generación y edición de imágenes texto-a-imagen mediante el pipeline de difusión de Qwen-Image-Edit (a través del fine-tune Rapid-AIO).
- Edición de imágenes guiada por instrucciones, heredada de Qwen-Image-Edit-2511.
- Segmentación de imágenes con SAM3 en precisión reducida (FP16, FP8 mixto y FP8).
- Integración nativa con ComfyUI mediante nodos personalizados (ComfyUI-Easy-Sam3, ComfyUI-RMBG).
- Ejecución en precisión reducida para ahorrar VRAM en GPUs de consumo.
- Compatibilidad declarada con ecosistemas de imagen adicionales (Flux, Pony, SD1.5, Krea2, Moss, Anima) según las etiquetas del repositorio, aunque la model card solo detalla Qwen Image Edit y SAM3.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje, al tratarse de un paquete de modelos de visión.

## Casos de uso

- Edición de imágenes por instrucciones en local: cargar el checkpoint INT8 de Qwen-Rapid-AIO en ComfyUI y aplicar ediciones guiadas por prompt sobre imágenes existentes, aprovechando la cuantización para reducir la VRAM necesaria frente al FP8 original.
- Segmentación automática de objetos para pipelines de recorte: usar SAM3 en FP16 o FP8 con ComfyUI-Easy-Sam3 para generar máscaras de sujetos y alimentar flujos de eliminación de fondo o composición.
- Eliminación de fondo en producción gráfica: combinar SAM3 con ComfyUI-RMBG (que requiere el archivo nombrado exactamente `sam3.pt`) para automatizar recortes en lotes de imágenes.
- Prototipado rápido en estaciones con GPU de consumo: desplegar los pesos INT8/INT6 para iterar sobre prompts y estilos sin necesidad de GPUs de centro de datos.
- Automatización de retoque fotográfico: encadenar edición por prompt y segmentación para aislar regiones y aplicar cambios localizados en flujos de ComfyUI.
- Investigación en cuantización de modelos de difusión: comparar la calidad visual entre las variantes INT8 ConvRot, INT6 W6A8 y FP8 que ofrece el repositorio para estudiar el impacto de la precisión en la generación de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; al tratarse de un modelo de difusión de gran tamano en INT8/INT6/FP8, se espera que las variantes cuantizadas reduzcan el consumo frente a FP16, pero el autor no publica cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada por el autor; la motivación declarada de la cuantización es facilitar su uso en ComfyUI, lo que sugiere orientación a GPUs de consumo, pero sin datos verificables.
- Opciones de despliegue: ComfyUI (librería declarada); nodos ComfyUI-Easy-Sam3 y ComfyUI-RMBG para SAM3.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| waveshaker/comfy_models | Paquete de pesos cuantizados (Qwen-Image-Edit + SAM3) | INT8, INT6, FP8, FP16 | qwen-research-license | Hugging Face, 8 descargas |
| Qwen/Qwen-Image-Edit-2511 | Modelo base de edición de imágenes | FP8 (según el autor) | Qwen Research License | Hugging Face (oficial) |
| Phr00t/Qwen-Image-Edit-Rapid-AIO | Fine-tune comunitario de Qwen-Image-Edit | FP8 | no disponible | Hugging Face |
| facebook/sam3 | Segmentación de imágenes | FP32 (oficial) | no disponible | Hugging Face (oficial) |

## Limitaciones y advertencias

- El repositorio no es un modelo entrenado por el autor: es una redistribución y recuantización de pesos de terceros; la calidad depende de los checkpoints originales.
- La cuantización a INT8 ConvRot e INT6 W6A8 puede introducir degradación visual respecto al FP8 original; el autor no publica comparativas de calidad.
- El checkpoint de Qwen se deriva de un fine-tune etiquetado como NSFW (Rapid-AIO), lo que puede producir contenido no apto para todos los entornos y exige filtrado en producción.
- La licencia Qwen Research License restringe el uso comercial de los pesos derivados de Qwen; es imprescindible revisar sus términos antes de desplegar.
- No se documentan idiomas soportados ni sesgos conocidos.
- SAM3 en FP8/mixed FP8 puede perder precisión en máscaras finas frente a la versión FP32 oficial.
- ComfyUI-RMBG solo lee el archivo si se nombra exactamente `sam3.pt`, lo que limita la flexibilidad de nombres.
- No hay benchmarks publicados que permitan validar el rendimiento frente a alternativas.
- El repositorio es de gran tamano (65,7 GB) y requiere espacio de almacenamiento considerable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/waveshaker/comfy_models
- Carpeta de modelos de difusión Qwen: https://huggingface.co/waveshaker/comfy_models/tree/main/qwen/diffusion_models
- Carpeta de SAM3: https://huggingface.co/waveshaker/comfy_models/tree/main/sam3
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Fine-tune Qwen-Image-Edit-Rapid-AIO: https://huggingface.co/Phr00t/Qwen-Image-Edit-Rapid-AIO
- SAM3 oficial: https://huggingface.co/facebook/sam3
- Nodo ComfyUI-Easy-Sam3: https://github.com/yolain/ComfyUI-Easy-Sam3
- Nodo ComfyUI-RMBG: https://github.com/1038lab/ComfyUI-RMBG
