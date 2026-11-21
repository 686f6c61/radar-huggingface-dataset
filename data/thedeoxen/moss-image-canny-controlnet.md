# thedeoxen/MOSS-Image-canny-controlnet

## Resumen

MOSS-Image-canny-controlnet es un adaptador LoRA de tipo ControlNet para el modelo de generación y edición de imágenes MOSS-Image-SFT, desarrollado por el usuario thedeoxen y publicado bajo licencia Apache 2.0. No se trata de un ControlNet completo ni del adaptador oficial de concatenación de color/profundidad de MOSS, sino de una LoRA que reproduce el comportamiento de un ControlNet: recibe un mapa de bordes Canny (líneas blancas sobre fondo negro) y condiciona la generación para que respete contornos, encuadre y bordes finos, mientras el prompt de texto define identidad, materiales, ropa y estilo.

El adaptador se entrenó como edit adapter sobre OpenMOSS-Team/MOSS-Image-SFT, con rango 64 en capas lineales y rango 16 en convoluciones, y el checkpoint seleccionado corresponde al paso de entrenamiento 4500. El repositorio ocupa 0,3 GB e incluye los pesos en formato safetensors y un workflow de ComfyUI listo para usar. Su relevancia práctica es que aporta control estructural preciso a un modelo de edición de imágenes sin necesidad de desplegar un ControlNet completo, integrándose en pipelines de ComfyUI mediante el nodo Text Encode MOSS-Image Edit.

La ficha se centra en el adaptador; los datos del modelo base MOSS-Image-SFT que no aparecen en la información proporcionada se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de control (tipo ControlNet) sobre el modelo de difusión MOSS-Image-SFT; rango 64 en capas lineales, rango 16 en convoluciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); no disponible para el text encoder |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors; el modelo base usa UNet int8 convrot y text encoder w4a8 GPTQ segun el workflow |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (moss_image_sft_canny_control_lora.safetensors) |

## Arquitectura y entrenamiento

El adaptador es una LoRA de control entrenada sobre MOSS-Image-SFT como edit adapter: la imagen de control (mapa Canny) actúa como referencia y el prompt describe la imagen a generar. La LoRA tiene rango 64 en las capas lineales y rango 16 en las convoluciones, y se entrenó con kv cache activado, lo que obliga a configurar el formato de edición `ai-toolkit` tanto en la codificación positiva como en la negativa. El checkpoint publicado corresponde al paso 4500 de entrenamiento.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a adaptadores de difusión). El modelo base MOSS-Image-SFT emplea un UNet (moss_image_sft_int8_convrot.safetensors), un text encoder basado en Qwen3.5 9B (qwen3.5_9b_w4a8_gptq.safetensors con tipo `moss_image`) y un VAE (flux2-vae_small.safetensors), según el workflow incluido.

## Capacidades

- Control estructural por mapa Canny: sigue contornos de objetos, encuadre y bordes finos a partir de un mapa de líneas blancas sobre fondo negro.
- Generación guiada por prompt: la identidad, los materiales, la ropa, la iluminación y el estilo se definen en el texto, mientras el mapa de bordes fija la composición.
- Edición imagen-a-imagen: funciona como adaptador de control de una sola imagen de referencia para MOSS-Image-SFT.
- Integración con ComfyUI: incluye workflow con el nodo Canny Edge de comfyui_controlnet_aux (umbrales bajo 100, alto 200) y el nodo Text Encode MOSS-Image Edit.
- Ajuste de rigidez del control mediante la fuerza de la LoRA (valor entrenado 1.0; se puede bajar hacia 0.7 si el control resulta demasiado rígido).
- Sin trigger word: no requiere palabra de activación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; es un adaptador específico de generación de imagen.

## Casos de uso

- Recoloreado de composiciones manteniendo el contorno: se extrae el mapa Canny de una imagen existente y se genera una nueva versión con otra paleta o materiales, conservando la silueta y el encuadre originales.
- Transformación de material y estilo de una foto: a partir de los bordes de una fotografía se genera la misma escena con otro acabado (por ejemplo, ilustración, pintura o render), útil en dirección de arte y previsualización.
- Estudios de layout con silueta fija: diseñadores que necesitan mantener la posición de los elementos mientras prueban variaciones de vestuario, ambientación o iluminación definidas en el prompt.
- Previsualización de personajes en encuadre controlado: el prompt define el personaje y el vestuario (por ejemplo, un maestro de ceremonias de circo con frac escarlata) mientras el mapa Canny fija la pose y el encuadre de cuerpo completo.
- Iteración rápida en ComfyUI: el workflow incluido permite cargar una foto, extraer bordes, codificar con el prompt y muestrear con 30 pasos, CFG 4, sampler euler y scheduler simple, lo que facilita prototipado en producción de imágenes.
- Control de encuadre en pipelines de generación por lotes: al fijar la estructura con el mapa de bordes, se pueden generar múltiples variaciones de una misma composición cambiando solo el prompt, útil para catálogos o series visuales coherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,3 GB en safetensors; el requisito real de VRAM lo determina el modelo base MOSS-Image-SFT, para el que no se dispone de cifras oficiales en la información proporcionada.
- El workflow usa el UNet en int8 (moss_image_sft_int8_convrot.safetensors) y el text encoder en w4a8 GPTQ (Qwen3.5 9B), lo que reduce el consumo frente a precisión completa, pero no se especifica la VRAM total necesaria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en tarjetas como RTX 4090.
- Despliegue: ComfyUI con diffusers como librería; requiere comfyui_controlnet_aux para el nodo Canny Edge y el nodo Text Encode MOSS-Image Edit.
- Latencia y throughput: no disponible; el workflow de referencia usa 30 pasos con CFG 4, sampler euler y scheduler simple.

## Comparativa con modelos similares

| Modelo | Tipo | Control estructural | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-canny-controlnet | LoRA de control (tipo ControlNet) sobre MOSS-Image-SFT | Canny | no disponible | apache-2.0 | Hugging Face, ComfyUI |
| Adaptador oficial de color/profundidad de MOSS | Adaptador de concatenación del modelo base | Color y profundidad | no disponible | no disponible | referenciado en la model card del adaptador |
| ControlNet completo (familia estándar) | Modelo ControlNet independiente | Canny, depth, pose, etc. | no disponible | variable según modelo | ecosistema diffusers/ComfyUI |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés (`language: en`) según los metadatos del repositorio.
- Está diseñado exclusivamente para MOSS-Image-SFT; no es un ControlNet genérico ni funciona con otros modelos de difusión.
- Requiere configurar el formato de edición `ai-toolkit` en la codificación positiva y negativa, y fue entrenado con kv cache activado; una configuración incorrecta degrada los resultados.
- El control puede resultar demasiado rígido si el mapa Canny contiene ruido o motas; se recomienda subir los umbrales de Canny o bajar la fuerza de la LoRA hacia 0.7.
- Funciona mejor con bordes blancos finos y limpios sobre fondo negro; mapas con líneas gruesas o invertidos pueden dar resultados pobres.
- No se documentan sesgos específicos del adaptador; al heredar el modelo base, puede reproducir sesgos de sus datos de entrenamiento.
- Riesgo de alucinación visual: el prompt puede introducir elementos no presentes en el mapa de control, y el modelo puede inventar detalles en zonas sin bordes definidos.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base MOSS-Image-SFT y de los componentes asociados (text encoder Qwen3.5, VAE flux2) antes de desplegar en producción.
- Solo hay 3 likes y 1196 descargas en el momento de la consulta, lo que indica una validación comunitaria limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-canny-controlnet
- Pesos: https://huggingface.co/thedeoxen/MOSS-Image-canny-controlnet/blob/main/moss_image_sft_canny_control_lora.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-canny-controlnet/blob/main/moss_image_canny_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- comfyui_controlnet_aux: https://github.com/Fannovel16/comfyui_controlnet_aux
