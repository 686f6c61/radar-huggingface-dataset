# thedeoxen/MOSS-Image-pose-controlnet

## Resumen

MOSS-Image-pose-controlnet es un adaptador LoRA de control de pose (estilo ControlNet) para el modelo de generacion y edicion de imagenes MOSS-Image-SFT, desarrollado por el usuario thedeoxen y publicado en Hugging Face bajo licencia Apache 2.0. El adaptador permite condicionar la generacion de imagenes a un esqueleto OpenPose/DWPose, de modo que el modelo base reproduce la estructura corporal, de manos y de rostro indicada por el esqueleto, mientras que el prompt de texto define la identidad del personaje, la ropa, los materiales y el entorno.

Tecnicamente no es un ControlNet clasico con un codificador adicional, sino una LoRA de edicion (rank 64 en capas lineales y rank 16 en convoluciones) que se carga sobre el UNet del modelo base y recibe la imagen de control como imagen de referencia unica a traves del nodo de codificacion de texto de edicion de MOSS-Image. El checkpoint publicado corresponde al paso de entrenamiento 4500.

Su relevancia es practica: aporta control estructural de pose a un modelo de edicion de imagenes reciente sin necesidad de reentrenar el modelo completo, y se distribuye con un workflow de ComfyUI listo para usar, lo que reduce la barrera de adopcion para artistas tecnicos y equipos de generacion de contenido visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de edicion) sobre UNet de MOSS-Image-SFT; condicionamiento por esqueleto OpenPose/DWPose |
| Parametros totales | no disponible (el repo pesa 0,3 GB; solo se publican los pesos del adaptador, no del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors; el modelo base recomendado usa UNet int8 (`moss_image_sft_int8_convrot.safetensors`), text encoder `qwen3.5_9b_w4a8_gptq.safetensors` (W4A8 GPTQ) y VAE `flux2-vae_small.safetensors` |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA); workflow en JSON para ComfyUI |

## Arquitectura y entrenamiento

El adaptador es una LoRA de edicion entrenada sobre el UNet de OpenMOSS-Team/MOSS-Image-SFT. La configuracion de rango es 64 en capas lineales y 16 en capas convolucionales. El mecanismo de control no anade un branch tipo ControlNet: la imagen de control (esqueleto coloreado sobre fondo negro) se introduce como imagen de referencia unica en el nodo de codificacion de edicion de MOSS-Image, y la LoRA modifica el comportamiento del UNet para que respete los keypoints de cuerpo, manos y rostro. El prompt de texto sigue describiendo la escena y el personaje.

El entrenamiento se realizo con la cache KV activada y con el formato de edicion `ai-toolkit`, un detalle critico porque el workflow debe configurar ese mismo formato tanto en la codificacion positiva como en la negativa. El checkpoint seleccionado es el paso 4500. No se especifican en la informacion disponible el numero de tokens, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un adaptador de difusion de este tipo). El prompt negativo usado en las muestras de entrenamiento fue `nsfw, worst quality, bad anatomy, watermark, jpeg artifact`.

## Capacidades

- Control de pose corporal, de manos y de rostro a partir de esqueletos OpenPose/DWPose generados con DWPose (cuerpo, manos y cara activados).
- Generacion image-to-image condicionada: la imagen de control fija la estructura y el prompt define identidad, materiales, ropa y estilo.
- Transferencia de pose entre sujetos: a partir de la pose de una foto se puede generar otra persona en la misma postura.
- Compatibilidad con el nodo nativo Text Encode MOSS-Image Edit de ComfyUI, con formato de edicion `ai-toolkit`.
- Ajuste de intensidad del control (fuerza 1.0 recomendada; 0.7 si el control resulta demasiado rigido).
- Sin trigger word: el control lo aporta la imagen de esqueleto, no el texto.
- Capacidades multilingues limitadas al ingles segun los metadatos del modelo.
- No se documentan capacidades de tool calling, agentes, audio ni modos de razonamiento (no aplicables a este tipo de modelo).

## Casos de uso

- Posing de personajes con cambio de vestuario y estilo: se introduce un esqueleto con la postura deseada y un prompt que describa el nuevo atuendo y la ambientacion; el adaptador mantiene la estructura mientras el modelo base reinterpreta la apariencia.
- Transferencia de pose desde una fotografia: se extrae el esqueleto con DWPose de una foto real y se genera otra persona (otro personaje, otro estilo artistico) en la misma postura, util para fichas de personaje o pruebas de vestuario.
- Keyframes y storyboards: en produccion de animacion o prevision de planos, se fijan poses clave con esqueletos y se generan variantes coherentes de cuerpo para cada fotograma de referencia.
- Ilustracion anime y manga: el ejemplo de la model card (idol cibernetico en salto) muestra el flujo tipico de ilustracion de cuerpo completo con control exacto de la pose y libertad total en el diseno del personaje.
- Prototipado de escenas de accion: saltos, escaleras, puertas y demas poses dinamicas documentadas en los ejemplos del repo permiten iterar rapidamente sobre composiciones con cuerpos en movimiento.
- Integracion en pipelines de ComfyUI para equipos creativos: el workflow incluido encadena carga de foto, extraccion de esqueleto con comfyui_controlnet_aux, codificacion con prompt y muestreo, lo que permite automatizar lotes de variantes con la misma pose.
- Generacion de material de referencia para modelado 3D o pintura: poses controladas con descripciones de materiales y ropa sirven como referencias visuales consistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas de fidelidad de pose, similitud de identidad ni comparaciones numericas con otros adaptadores.

## Requisitos de hardware

- El adaptador LoRA en si ocupa aproximadamente 0,3 GB (tamano del repo), por lo que su carga es ligera; el requisito real lo marca el modelo base MOSS-Image-SFT.
- El modelo base recomendado usa el UNet en int8 (`moss_image_sft_int8_convrot.safetensors`) y un text encoder Qwen de 9B en W4A8 GPTQ, lo que reduce la huella de VRAM frente a pesos en precision completa; no se dispone de cifras exactas de VRAM en la informacion proporcionada.
- GPU recomendadas: no disponible de forma explicita; por el tamano del text encoder (9B cuantizado) y el UNet int8, es previsible que requiera GPU de gama alta (A100, H100 o RTX 4090) para un funcionamiento comodo, aunque esta estimacion no esta confirmada por el autor.
- Compatibilidad con GPU de consumo: no confirmada; depende de la implementacion del modelo base en ComfyUI y de la VRAM disponible.
- Despliegue: ComfyUI con el workflow incluido, el nodo Text Encode MOSS-Image Edit y la extension comfyui_controlnet_aux para la extraccion DWPose. La libreria declarada es diffusers. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion en este formato).
- Parametros de muestreo recomendados: 30 pasos, CFG 4, sampler `euler` con scheduler `simple`, fuerza LoRA 1.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-pose-controlnet | LoRA de control de pose sobre MOSS-Image-SFT | no disponible (adaptador de 0,3 GB) | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face, ComfyUI |
| ControlNet OpenPose para Stable Diffusion 1.5 / SDXL | ControlNet clasico | no disponible en esta ficha | no aplica | ampliamente validado en la comunidad, sin cifras aqui | normalmente abierta (varia por checkpoint) | Hugging Face, ComfyUI, Automatic1111 |
| Adaptadores de pose para Flux | LoRA/ControlNet sobre Flux | no disponible en esta ficha | no aplica | sin cifras verificadas aqui | varía segun autor | Hugging Face, ComfyUI |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; la diferencia principal de este adaptador es su acoplamiento especifico al modelo MOSS-Image-SFT y su formato de edicion `ai-toolkit`, que lo hace incompatible con pipelines de Stable Diffusion o Flux sin adaptacion.

## Limitaciones y advertencias

- Dependencia estricta del modelo base OpenMOSS-Team/MOSS-Image-SFT y de sus pesos concretos (UNet int8, text encoder Qwen 9B W4A8 GPTQ, VAE flux2-vae_small); no funciona con otros modelos de difusion.
- Requiere configurar el formato de edicion `ai-toolkit` en las codificaciones positiva y negativa; un error en este ajuste degrada o anula el control.
- Si el esqueleto no incluye una articulacion (por ejemplo, una mano o un pie), el modelo no puede inventarla de forma fiable; la calidad del control depende de la extraccion DWPose.
- El control puede resultar demasiado rigido a fuerza 1.0; se sugiere bajar a 0.7, lo que reduce la fidelidad de la pose.
- Idioma soportado limitado al ingles segun los metadatos; los prompts en otros idiomas pueden degradar el resultado.
- Riesgo de alucinacion visual y de artefactos anatomicos, especialmente en poses complejas o con oclusiones; el prompt negativo de entrenamiento incluye `bad anatomy`, lo que sugiere que el autor observo este problema.
- No se documentan sesgos especificos, pero al ser un adaptador sobre un modelo de difusion entrenado con datos no descritos, hereda los sesgos del modelo base.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el uso comercial del modelo base MOSS-Image-SFT debe verificarse por separado en su propia model card.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni reportes independientes de calidad.
- No se dispone de informacion sobre el dataset de entrenamiento del adaptador, lo que limita la evaluacion de sesgos y de cobertura de poses.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-pose-controlnet
- Pesos del adaptador: https://huggingface.co/thedeoxen/MOSS-Image-pose-controlnet/blob/main/moss_image_sft_pose_control_lora.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-pose-controlnet/blob/main/moss_image_pose_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Extension comfyui_controlnet_aux (DWPose): https://github.com/Fannovel16/comfyui_controlnet_aux
