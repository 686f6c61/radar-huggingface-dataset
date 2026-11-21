# thedeoxen/MOSS-Image-segmentation-controlnet

## Resumen

MOSS-Image-segmentation-controlnet es un adaptador de tipo ControlNet implementado como LoRA sobre el modelo base OpenMOSS-Team/MOSS-Image-SFT, un modelo de generación y edición de imágenes. Lo desarrolla el usuario thedeoxen y su función es condicionar la generación de imágenes a un mapa de segmentación de regiones en colores planos: el modelo respeta los límites y las masas del mapa de control, mientras que el prompt de texto determina la identidad, los materiales, la ropa y el estilo de cada región.

El adaptador se entrenó como un adaptador de edición: la imagen de control actúa como referencia estructural y el prompt describe la imagen a generar. No es un ControlNet completo ni el adaptador oficial de concatenación de color/profundidad de MOSS, sino una LoRA que se carga con un cargador de LoRA y recibe una única imagen de control a través del nodo Text Encode MOSS-Image Edit de ComfyUI.

El checkpoint publicado corresponde al paso de entrenamiento 4500. La LoRA tiene rango 64 en capas lineales y rango 16 en convoluciones, y se distribuye bajo licencia Apache 2.0 con pesos en formato safetensors. Es relevante para flujos de trabajo de composición controlada por regiones, blocking de escenas y color scripts donde solo se decide la forma y el prompt define el contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de control (estilo ControlNet) sobre el modelo base MOSS-Image-SFT; rango 64 en capas lineales y rango 16 en convoluciones |
| Parametros totales | no disponible (el repo ocupa 0,3 GB; el numero de parametros del adaptador no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base se usa con UNet int8 (`moss_image_sft_int8_convrot.safetensors`) y text encoder `qwen3.5_9b_w4a8_gptq.safetensors` |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`moss_image_sft_segmentation_control_lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es una LoRA de control que se acopla al UNet del modelo base MOSS-Image-SFT. Según la model card, se entrena como un adaptador de edición en el que la imagen de control es la referencia y el prompt describe la imagen a generar. La LoRA emplea rango 64 en las capas lineales y rango 16 en las convoluciones, y el checkpoint publicado corresponde al paso 4500 del entrenamiento. Se entrenó con la caché KV activada (kv cache on), lo que obliga a configurar el formato de edición `ai-toolkit` tanto en la codificación positiva como en la negativa.

Los mapas de control de entrenamiento son mapas de segmentación semántica con colores planos completamente rellenos, sin grandes zonas negras sin etiquetar. Los colores del mapa son identificadores de región, no los colores que aparecerán en el resultado. El flujo de trabajo incluido utiliza el segmentador semántico UniFormer, cuyos mapas encajan mejor con estos pesos que los de un segmentador que deja el fondo en negro. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación y edición de imágenes condicionada por un mapa de segmentación de regiones en colores planos.
- Respeto de los límites y las masas del mapa de control, con relleno de cada región según el prompt de texto.
- Control de identidad, materiales, ropa y estilo mediante el prompt, sin palabra de activación (no trigger word).
- Funciona como adaptador de control de imagen única para MOSS-Image-SFT.
- Integración con ComfyUI mediante el nodo Text Encode MOSS-Image Edit y el cargador de LoRA.
- Soporte de prompt negativo (en las muestras de entrenamiento se usó `nsfw, worst quality, bad anatomy, watermark, jpeg artifact`).
- Capacidad de ajustar la rigidez del control bajando la fuerza de la LoRA hacia 0,7 (el valor entrenado es 1,0).
- Idioma de los prompts: inglés.

## Casos de uso

- Blocking de escenas por regiones: se construye un mapa de segmentación con las masas principales (personajes, mobiliario, fondo) y el prompt reestiliza cada región, lo que permite iterar sobre la composición sin rehacer el layout.
- Color scripts y previsualización de layouts: útil en preproducción de animación o ilustración, donde solo se decide la forma de las regiones y el prompt define la apariencia final.
- Cambio de render manteniendo el layout: se conserva la disposición de personas, objetos y fondo de una imagen y se cambia el estilo de renderizado mediante el prompt.
- Restyling de una escena existente: a partir de un mapa de segmentación derivado de una foto (por ejemplo con UniFormer), se genera una nueva versión con otro sujeto y otro estilo respetando las fronteras originales.
- Generación de variaciones controladas: con un mismo mapa de control y distintos prompts se obtienen múltiples resultados coherentes en estructura, útil para explorar direcciones visuales.
- Integración en pipelines de ComfyUI: el flujo incluido carga una foto, construye el mapa de control, lo codifica con el prompt y muestrea, lo que facilita automatizar la generación por lotes con segmentadores semánticos.
- Edición guiada por regiones en producción gráfica: para sustituir materiales o vestuario en zonas concretas indicándolo en el prompt, manteniendo la silueta y la posición de cada masa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base MOSS-Image-SFT, que se carga con UNet en int8 y text encoder en W4A8 GPTQ, lo que reduce los requisitos frente a una carga en precisión completa. El adaptador en sí ocupa 0,3 GB en disco.
- GPU recomendadas: no disponible en la informacion proporcionada.
- ¿Cabe en GPU de consumo? No disponible; el uso de cuantización int8 en el UNet y W4A8 en el text encoder sugiere que está pensado para reducir huella de memoria, pero no se confirman modelos concretos de GPU.
- Opciones de despliegue: ComfyUI (flujo de trabajo incluido `moss_image_segmentation_control.json`); la librería declarada es diffusers.
- Latencia y throughput estimados: no disponible. Los ajustes de muestreo típicos del flujo son 30 pasos, CFG 4, sampler `euler` con scheduler `simple`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-segmentation-controlnet | LoRA de control (segmentación) sobre MOSS-Image-SFT | no disponible (repo 0,3 GB) | no disponible | apache-2.0 | Hugging Face, 957 descargas |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base de generación/edición de imágenes | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face (modelo base) |
| Adaptador oficial de concatenación color/profundidad de MOSS | Adaptador de control oficial | no disponible | no disponible | no disponible | Referenciado en la model card como alternativa distinta |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado y recomendado exclusivamente con OpenMOSS-Team/MOSS-Image-SFT; su uso con otros modelos base no está soportado.
- Requiere configurar el formato de edición `ai-toolkit` en la codificación positiva y negativa, y se entrenó con la caché KV activada; una configuración incorrecta degrada los resultados.
- Los mapas de control deben tener colores planos y sólidos, completamente rellenos; los degradados y las texturas confunden las regiones.
- No debe esperarse que el color de una región se convierta en ese color en la imagen resultante: el material debe indicarse en el prompt.
- Los mapas de UniFormer encajan mejor que los de un segmentador que deja el fondo en negro.
- Con fuerza de LoRA 1,0 el control puede resultar demasiado rígido; se sugiere bajarla hacia 0,7.
- Idioma de prompts limitado al inglés según la model card.
- Riesgo de alucinación visual y de artefactos propios de los modelos generativos; no se documentan sesgos específicos en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base MOSS-Image-SFT, cuya licencia no se detalla en la información proporcionada.
- No se han publicado benchmarks ni métricas cuantitativas de calidad o fidelidad al mapa de control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-segmentation-controlnet
- Pesos (safetensors): https://huggingface.co/thedeoxen/MOSS-Image-segmentation-controlnet/blob/main/moss_image_sft_segmentation_control_lora.safetensors
- Flujo de trabajo de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-segmentation-controlnet/blob/main/moss_image_segmentation_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
