# thedeoxen/MOSS-Image-pose-controlnet

## Resumen

MOSS-Image-pose-controlnet es un adaptador de control de tipo LoRA (denominado "controlnet" por su autor) para el modelo de generación y edición de imágenes MOSS-Image-SFT, desarrollado por el usuario thedeoxen sobre el modelo base de OpenMOSS-Team. Su función es transferir la estructura corporal de una imagen de control (un esqueleto OpenPose/DWPose sobre fondo negro) a la imagen generada, dejando que el prompt de texto defina identidad, ropa, materiales y escenario. No se trata de un ControlNet completo ni del adaptador oficial de concatenación de color/profundidad de MOSS, sino de una LoRA que se carga con un cargador de LoRA estándar y consume una única imagen de referencia.

El adaptador resuelve un problema concreto en flujos de trabajo de difusión: fijar la pose de un personaje sin sacrificar el control creativo sobre su apariencia. Se entrena como adaptador de edición, de modo que la imagen de control actúa como referencia estructural y el prompt describe la imagen a generar. Está pensado para integrarse en ComfyUI mediante el nodo Text Encode MOSS-Image Edit y el preprocesador DWPose de comfyui_controlnet_aux.

El checkpoint seleccionado corresponde al paso de entrenamiento 4500. El repositorio ocupa 0,3 GB y contiene los pesos en safetensors junto con un workflow de ComfyUI listo para usar. La licencia es Apache 2.0 y el idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de MOSS-Image-SFT (rank 64 en capas lineales, rank 16 en convoluciones) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base se distribuye en int8 (UNet `moss_image_sft_int8_convrot.safetensors`) y w4a8 GPTQ (text encoder `qwen3.5_9b_w4a8_gptq.safetensors`); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es una LoRA aplicada sobre las capas del UNet del modelo MOSS-Image-SFT, con rango 64 en las capas lineales y rango 16 en las convoluciones. Se entrena como adaptador de edición: la imagen de control (esqueleto OpenPose/DWPose con huesos coloreados sobre fondo negro, incluyendo cuerpo, manos y cara) se pasa como única imagen de referencia a través del nodo Text Encode MOSS-Image Edit, y el prompt describe la escena a generar. El checkpoint publicado corresponde al paso 4500 del entrenamiento.

El flujo de inferencia recomendado emplea el UNet cuantizado a int8 del modelo base, el text encoder Qwen3.5-9B en w4a8 GPTQ con tipo `moss_image` y el VAE `flux2-vae_small.safetensors`. La LoRA se carga sobre el UNet con fuerza 1.0 y se configura el formato de edición `ai-toolkit` tanto en la codificación positiva como en la negativa, ya que el adaptador se entrenó con kv cache activada. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Transferencia de pose corporal completa a partir de esqueletos OpenPose/DWPose, incluyendo keypoints de cuerpo, manos y cara.
- Generación image-to-image guiada por prompt: la identidad, la ropa, los materiales y el escenario se definen por texto, mientras la estructura la fija la imagen de control.
- Funciona como adaptador de control de una sola imagen, sin palabra de activación (no trigger word).
- Integración con ComfyUI mediante el nodo Text Encode MOSS-Image Edit y el preprocesador DWPose de comfyui_controlnet_aux.
- Ajuste de rigidez del control mediante la fuerza de la LoRA (valor entrenado 1.0; se recomienda bajar hacia 0.7 si el control resulta demasiado rígido).
- Soporte de prompt negativo (el autor cita `nsfw, worst quality, bad anatomy, watermark, jpeg artifact`).
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Posado de personajes con cambio de vestuario y estilo: se extrae el esqueleto de una referencia y se describe en el prompt el nuevo atuendo y la ambientación, manteniendo la pose exacta.
- Transferencia de pose entre personas: a partir de la foto de una persona se genera otra identidad con la misma postura, útil en ilustración comercial y previsualización de personajes.
- Keyframes y storyboards: cuando la continuidad corporal entre planos es crítica, el esqueleto garantiza que la postura coincida entre fotogramas generados.
- Ilustración de personajes para videojuegos o cómics: se fija una pose de acción (por ejemplo, patada alta o salto) y se itera sobre el diseño visual mediante variaciones de prompt.
- Previsualización de poses para animación: generar referencias rápidas de posturas complejas antes de modelar o animar en 3D, con control de manos y cara incluido.
- Prototipado de escenas con múltiples variaciones: un mismo esqueleto combinado con distintos prompts permite explorar estilos (anime, fotorrealista, ilustración) sin rehacer la composición.
- Flujos automatizados en ComfyUI: el workflow incluido permite encadenar extracción DWPose, codificación y muestreo para producción por lotes de imágenes con pose controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,3 GB en safetensors, pero requiere cargar el modelo base MOSS-Image-SFT completo (UNet int8, text encoder Qwen3.5-9B en w4a8 GPTQ y VAE) para funcionar.
- VRAM estimada para inferencia: no disponible de forma explícita; por la presencia de un text encoder de 9B cuantizado a w4a8 y un UNet int8, se requiere una GPU con VRAM considerable, aunque la cifra exacta no se especifica en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: ComfyUI es el entorno documentado (workflow incluido, nodo Text Encode MOSS-Image Edit, preprocesador comfyui_controlnet_aux); la librería declarada es diffusers. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de imágenes.
- Parámetros de muestreo recomendados: 30 pasos, CFG 4, sampler `euler` con scheduler `simple`, fuerza de LoRA 1.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-pose-controlnet | LoRA de control de pose sobre MOSS-Image-SFT | no disponible (adaptador) | no disponible | Apache 2.0 | Hugging Face, ComfyUI |
| ControlNet oficial para Stable Diffusion (p. ej. lllyasviel/ControlNet) | ControlNet completo para modelos SD | no disponible en esta ficha | no aplica | varía según checkpoint | Hugging Face, amplia adopción |
| Adaptador oficial de color/profundidad de MOSS | Adaptador de concatenación para MOSS-Image | no disponible | no aplica | según modelo base | Repositorio de OpenMOSS-Team |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés como idioma declarado; los prompts en otros idiomas pueden degradar el resultado.
- Si un miembro del esqueleto falta en la imagen de control, el prompt no puede inventar esa articulación de forma fiable.
- El control puede resultar demasiado rígido con fuerza 1.0; el autor sugiere reducirla hacia 0.7 en esos casos.
- Requiere el formato de edición `ai-toolkit` en las codificaciones positiva y negativa, y se entrenó con kv cache activada; ignorar estos ajustes puede degradar la calidad.
- Depende de un modelo base concreto (OpenMOSS-Team/MOSS-Image-SFT); no es un ControlNet genérico ni sustituye al adaptador oficial de color/profundidad.
- Riesgo de alucinación visual y de anatomía incorrecta, mitigado parcialmente con el prompt negativo sugerido (`bad anatomy`, entre otros).
- No se han publicado datos de sesgos, evaluación cuantitativa ni métricas de fidelidad de pose en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los checkpoints derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-pose-controlnet
- Pesos (safetensors): https://huggingface.co/thedeoxen/MOSS-Image-pose-controlnet/blob/main/moss_image_sft_pose_control_lora.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-pose-controlnet/blob/main/moss_image_pose_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Preprocesador DWPose para ComfyUI: https://github.com/Fannovel16/comfyui_controlnet_aux
