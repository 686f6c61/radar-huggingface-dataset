# thedeoxen/MOSS-Image-pose-control-lora

## Resumen

MOSS-Image-pose-control-lora es un adaptador LoRA de control de pose (estilo ControlNet) para el modelo de generación y edición de imágenes MOSS-Image-SFT, desarrollado por el usuario thedeoxen y publicado en Hugging Face. El adaptador permite condicionar la generación de imágenes a un esqueleto OpenPose/DWPose, de modo que el modelo respeta la estructura corporal, de manos y de rostro del control mientras el prompt de texto define la identidad, la ropa, los materiales y la escena.

Técnicamente no es un ControlNet completo ni el adaptador oficial de concatenación de color/profundidad de MOSS, sino una LoRA entrenada como adaptador de edición: la imagen de control actúa como referencia y el prompt describe la imagen a generar. Se carga con un cargador de LoRA sobre el UNet del modelo base y se utiliza con el nodo Text Encode MOSS-Image Edit de ComfyUI, con un formato de edición específico (`ai-toolkit`).

El checkpoint publicado corresponde al paso de entrenamiento 4500 y el repositorio ocupa 0,3 GB. Es relevante para flujos de trabajo de animación, ilustración y storyboarding donde la consistencia de la pose es crítica y se quiere cambiar el aspecto del personaje sin reentrenar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de control tipo ControlNet) sobre MOSS-Image-SFT; rank 64 en capas lineales y rank 16 en convoluciones |
| Parametros totales | no disponible (pesos del adaptador en un unico safetensors; el modelo base no se incluye) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base se usa con UNet `moss_image_sft_int8_convrot.safetensors` y text encoder `qwen3.5_9b_w4a8_gptq.safetensors` |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`moss_image_sft_pose_control_lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es una LoRA de control de pose entrenada sobre el modelo base OpenMOSS-Team/MOSS-Image-SFT. Según la model card, se configura con rank 64 en las capas lineales y rank 16 en las convoluciones, y se entrena como adaptador de edición: la imagen de control (esqueleto DWPose sobre fondo negro) actúa como referencia y el prompt de texto describe la imagen objetivo. El checkpoint seleccionado es el paso 4500. La LoRA se entrenó con la caché KV activada, lo que obliga a fijar el formato de edición `ai-toolkit` tanto en la codificación positiva como en la negativa.

No se especifican en la información disponible el número de tokens, la composición del dataset de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. El adaptador sigue los keypoints de cuerpo, manos y rostro del esqueleto OpenPose/DWPose y deja al prompt la definición de identidad, materiales, ropa y estilo. No requiere palabra de activación (trigger word).

## Capacidades

- Control de pose corporal, de manos y de rostro a partir de esqueletos OpenPose/DWPose.
- Generación de imágenes condicionada por prompt de texto para identidad, ropa, materiales y escena.
- Funciona como adaptador de control de una sola imagen de referencia para MOSS-Image-SFT.
- Integración con ComfyUI mediante el nodo Text Encode MOSS-Image Edit y el cargador de LoRA.
- Extracción de esqueleto con DWPose (cuerpo, manos y rostro) vía comfyui_controlnet_aux.
- Transferencia de pose desde una foto a otro personaje.
- No soporta tool calling ni function calling (no aplica a un modelo de imagen).
- No soporta agentes ni razonamiento multi-paso (no aplica).
- Capacidades multilingües limitadas al inglés en los prompts (idioma declarado: en).

## Casos de uso

- Ilustración de personajes con pose fija: se introduce un esqueleto DWPose y un prompt que describe al personaje, su ropa y el entorno, manteniendo la estructura corporal exacta del control.
- Transferencia de pose desde fotografía: se extrae el esqueleto de una foto real con DWPose y se genera otro personaje en esa misma pose, útil para referencias de modelado o concept art.
- Storyboarding y keyframes de animación: se generan fotogramas clave donde el cuerpo debe coincidir entre planos, usando el mismo esqueleto y variando el prompt para cambiar vestuario o escenario.
- Diseño de vestuario sobre una pose concreta: se mantiene la pose del maniquí o del modelo y se itera el prompt para probar distintas prendas, materiales y estilos sin alterar la estructura.
- Previsualización de escenas de acción: poses dinámicas (saltos, patadas, extensiones) definidas por el esqueleto permiten explorar composiciones de escena con el prompt describiendo el entorno.
- Producción de arte conceptual para videojuegos: combinación de esqueletos de referencia con prompts de estilo para generar variantes de personajes en poses coherentes dentro de una misma línea visual.
- Iteración de rigidez del control: con fuerza de LoRA ajustable (1.0 valor entrenado, hasta 0.7 si el control resulta demasiado rígido) se pueden generar variaciones más o menos apegadas al esqueleto para exploración creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB en safetensors; el requisito real de VRAM lo determina el modelo base MOSS-Image-SFT, no la LoRA.
- El modelo base se usa con UNet cuantizado int8 (`moss_image_sft_int8_convrot.safetensors`) y text encoder `qwen3.5_9b_w4a8_gptq.safetensors` (9B, cuantización w4a8 GPTQ), lo que reduce los requisitos frente a precisión completa.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: ComfyUI con diffusers; se requiere el cargador de LoRA, el nodo Text Encode MOSS-Image Edit y comfyui_controlnet_aux para DWPose. No se documentan otros backends (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponibles; la configuración de muestreo recomendada es 30 pasos, CFG 4, sampler `euler` con scheduler `simple`.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-pose-control-lora | LoRA de control de pose (rank 64 lineal / 16 conv) | MOSS-Image-SFT | OpenPose/DWPose | apache-2.0 | Hugging Face, 1985 descargas, 26 likes |
| ControlNet oficial para MOSS-Image | Adaptador de concatenación color/profundidad | MOSS-Image-SFT | Color/profundidad | no disponible | no disponible |
| ControlNet estándar para modelos de difusión (p. ej. SD) | ControlNet completo | Modelos de difusión tipo SD | Pose y otros | variable según modelo | ecosistema amplio |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Está entrenado y recomendado exclusivamente con OpenMOSS-Team/MOSS-Image-SFT; su uso con otros modelos base no está soportado.
- Requiere fijar el formato de edición `ai-toolkit` en la codificación positiva y negativa porque se entrenó con caché KV activada; no hacerlo puede degradar los resultados.
- Si el esqueleto no incluye una articulación (miembro ausente), el prompt no puede inventarla de forma fiable.
- El control debe ser un esqueleto coloreado sobre fondo negro, con manos y rostro incluidos, para coincidir con los controles de entrenamiento.
- Con fuerza 1.0 el control puede resultar demasiado rígido; se sugiere bajar a 0.7 si es necesario, aunque 1.0 es el valor entrenado.
- Los prompts están en inglés (idioma declarado: en); no se documenta soporte multilingüe.
- Riesgo de alucinación y sesgos: no se documentan sesgos conocidos ni evaluaciones de alucinación en la información disponible; como modelo generativo de imágenes, puede producir anatomía incorrecta pese al control de pose.
- La licencia apache-2.0 permite uso comercial, pero el modelo base MOSS-Image-SFT tiene su propia licencia que debe verificarse por separado.
- El prompt negativo de referencia es `nsfw, worst quality, bad anatomy, watermark, jpeg artifact`; no se garantiza el filtrado de contenido no deseado sin ese negativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-pose-control-lora
- Repositorio del adaptador: https://huggingface.co/thedeoxen/MOSS-Image-pose-controlnet
- Pesos: https://huggingface.co/thedeoxen/MOSS-Image-pose-controlnet/blob/main/moss_image_sft_pose_control_lora.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-pose-controlnet/blob/main/moss_image_pose_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- comfyui_controlnet_aux (DWPose): https://github.com/Fannovel16/comfyui_controlnet_aux
