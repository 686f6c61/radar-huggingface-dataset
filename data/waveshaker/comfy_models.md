# waveshaker/comfy_models

## Resumen

`waveshaker/comfy_models` no es un modelo único, sino un repositorio agregador de conversiones cuantizadas de modelos de difusión para ComfyUI. El autor, waveshaker, publica versiones INT8 (mayoritariamente con la técnica ConvRot) y FP8 de checkpoints ajenos, orientadas a entornos con VRAM limitada. El repo ocupa 507,2 GB y contiene pesos en formato safetensors y `.pt`, con pipeline declarado `image-to-image`.

El modelo base declarado en la ficha de Hugging Face es Qwen/Qwen-Image-Edit-2511, aunque el contenido real abarca múltiples familias: Qwen Image Edit (incluida la variante Rapid-AIO v23), SAM3 de Meta, MOSS Image, Krea 2, Flux, Flux2, Pony, SD1.5 y Anima. La licencia indicada es `qwen-research-license`, lo que condiciona el uso comercial de al menos parte del contenido.

Su relevancia práctica es acotada pero concreta: permite ejecutar modelos de edición y generación de imagen de gran tamano en GPUs de consumo mediante cuantización INT8/INT6, a costa de posibles pérdidas de calidad y de un rendimiento que el propio autor reconoce irregular. La model card incluye benchmarks informales que advierten de que la cuantización INT8 resulta más lenta que el original en arquitecturas SD1.5 y SDXL por cuellos de botella de ancho de banda de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (agregado de modelos de difusion: UNet/DiT segun checkpoint) |
| Parametros totales | no disponible (variable por archivo) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (modelos de imagen) |
| Tipos de cuantizacion | INT8 ConvRot, INT6 W6A8 (qic), FP8, FP16, mixed FP8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research-license |
| Formato de pesos | safetensors, .pt |

## Arquitectura y entrenamiento

El repositorio no entrena modelos: redistribuye conversiones de cuantizacion de checkpoints existentes. Las herramientas citadas por el autor son `silveroxides/convert_to_quant`, `Comfy-Org/comfy-model-tools` (script `quant_int8_convrot.py`) y `Starnodes2024/comfyui-starnodes-modelconverter`. La técnica ConvRot aplica rotaciones de canales antes de la cuantizacion INT8 para reducir el error de redondeo, un enfoque similar en espiritu a las rotaciones tipo QuaRot/SmoothQuant.

Los modelos de origen incluyen arquitecturas DiT (Qwen Image Edit, MOSS Image, Krea 2, Flux/Flux2) y UNet clásicas (SD1.5, SDXL/Pony). El autor documenta que en SD1.5 y SDXL la cuantizacion INT8 no aporta velocidad por el coste de des-cuantizacion en tiempo de ejecucion y el ancho de banda de VRAM; solo la variante Illustrious mostro mejora en sus pruebas. Para SDXL advierte ademas del problema de los dobles CLIP acoplados al UNet, que complican el empaquetado.

## Capacidades

- Generacion de imagen texto-a-imagen en los checkpoints base (Qwen Image, MOSS, Krea 2, Flux, SD1.5).
- Edicion de imagen e image-to-image, especialmente con Qwen Image Edit y sus variantes.
- Segmentacion y enmascarado con SAM3 (FP16, mixed FP8 y FP8), integrable via nodos ComfyUI-Easy-Sam3 y ComfyUI-RMBG.
- Ejecucion en ComfyUI como libreria nativa (`library_name: comfyui`).
- Variantes con LoRA DMD2 fusionada para generacion en 8 pasos (MOSS Image 8steps-dmd2).
- Versiones orientadas a bajo consumo de VRAM mediante INT8/INT6.
- No ofrece capacidades de texto, razonamiento, tool calling ni agentes: es exclusivamente un agregado de modelos visuales.

## Casos de uso

- Edicion de imagen en local con Qwen Image Edit: usar las conversiones INT8/INT6 del UNet de Qwen-Rapid-AIO v23 para ejecutar edicion guiada por instrucciones en GPUs de 8-16 GB, donde el checkpoint FP16 no cabria.
- Segmentacion automatica de objetos en pipelines de retoque: cargar `sam3_*.pt` en `ComfyUI/models/sam3` y combinarlo con nodos RMBG para generar mascaras de primer plano en flujos de eliminacion de fondo.
- Generacion rapida de imagenes con MOSS Image 8 pasos: emplear la variante con DMD2 fusionada para reducir el numero de pasos de muestreo y bajar la latencia en prototipado.
- Pruebas de calidad de cuantizacion: comparar el checkpoint original frente a la version INT8 ConvRot para medir degradacion perceptual antes de adoptar cuantizacion en produccion.
- Despliegue en estaciones de trabajo con VRAM ajustada: servir Krea 2 Turbo INT8 en ComfyUI para generacion de bocetos en un equipo con una sola GPU consumer.
- Investigacion sobre tecnicas de cuantizacion post-entrenamiento: el repo sirve como corpus de referencia de conversiones ConvRot e INT6 W6A8 aplicadas a distintas arquitecturas de difusion.
- Flujos de img2img con modelos SD1.5/Pony cuantizados en entornos de muy baja VRAM, aceptando la penalizacion de velocidad documentada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye observaciones cualitativas del autor: en sus pruebas, las versiones INT8 de SD1.5 y SDXL (incluido Pony) resultaron mas lentas que los originales por cuello de botella de ancho de banda de VRAM y sobrecoste de des-cuantizacion; solo la variante Illustrious INT8 mostro mejora de velocidad.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende de cada checkpoint. Las variantes INT8/INT6 estan pensadas para reducir el pico de memoria frente a FP16, pero el autor no publica cifras.
- GPU recomendadas: no disponible. El objetivo declarado son entornos de baja VRAM y GPUs de consumo.
- Cabe en GPU consumer: si, es el proposito de las conversiones INT8/INT6, aunque sin cifras concretas de VRAM por archivo.
- Despliegue: ComfyUI como entorno principal; SAM3 requiere nodos ComfyUI-Easy-Sam3 o ComfyUI-RMBG.
- Latencia y throughput: no disponibles; el autor advierte de que la cuantizacion puede ser mas lenta que el modelo original en varias arquitecturas.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| waveshaker/comfy_models | Agregado de conversiones para ComfyUI | INT8 ConvRot, INT6 W6A8, FP8, FP16 | qwen-research-license | Hugging Face, 507,2 GB |
| Comfy-Org/Krea-2 | Checkpoint original | FP16/FP8 segun publicacion | no disponible | Hugging Face |
| OpenMOSS-Team/MOSS-Image-SFT | Checkpoint original | FP16 | no disponible | Hugging Face |
| facebook/sam3 | Modelo de segmentacion | FP32 oficial | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es una redistribucion de conversiones; los meritos y defectos de calidad corresponden a los modelos de origen.
- La cuantizacion INT8 puede degradar la calidad de imagen y, segun el propio autor, reducir la velocidad en SD1.5 y SDXL.
- La licencia declarada, `qwen-research-license`, restringe el uso comercial de al menos parte del contenido; conviene verificar la licencia de cada checkpoint de origen por separado.
- El repositorio mezcla modelos con licencias distintas (Meta SAM3, checkpoints de Civitai, etc.), lo que complica el cumplimiento legal en produccion.
- Varios checkpoints de Civitai tienen contenido NSFW explicito en su denominacion; no aptos para entornos corporativos sin filtrado.
- El tamano del repo (507,2 GB) hace inviable su descarga completa en la mayoria de entornos; hay que seleccionar archivos individuales.
- No hay datos de benchmarks ni de calidad objetiva publicados; las afirmaciones de rendimiento son anecdoticas.
- Riesgo de alucinacion: no aplica en el sentido de texto, pero si existe riesgo de artefactos visuales derivados de la cuantizacion agresiva (INT6).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/waveshaker/comfy_models
- Modelo base declarado: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Herramienta de conversion: https://github.com/silveroxides/convert_to_quant
- Herramientas de Comfy-Org: https://github.com/Comfy-Org/comfy-model-tools
- Conversor Starnodes: https://github.com/Starnodes2024/comfyui-starnodes-modelconverter
- Qwen-Image-Edit-Rapid-AIO: https://huggingface.co/Phr00t/Qwen-Image-Edit-Rapid-AIO
- SAM3: https://huggingface.co/facebook/sam3
- Nodos ComfyUI-Easy-Sam3: https://github.com/yolain/ComfyUI-Easy-Sam3
- Nodos ComfyUI-RMBG: https://github.com/1038lab/ComfyUI-RMBG
- MOSS Image SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Krea 2 (Comfy-Org): https://huggingface.co/Comfy-Org/Krea-2
- Kromoss: https://huggingface.co/lodestones/Kromoss
