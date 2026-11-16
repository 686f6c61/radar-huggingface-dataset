# thedeoxen/MOSS-Image-segmentation-control-lora

## Resumen

MOSS-Image-segmentation-control-lora es un adaptador de control de tipo ControlNet implementado como LoRA para el modelo de generación y edición de imágenes MOSS-Image-SFT, desarrollado por OpenMOSS-Team. Lo publica el usuario thedeoxen bajo licencia Apache 2.0. El adaptador permite condicionar la generación de imágenes mediante un mapa de segmentación de colores planos: el modelo respeta los límites y las masas de cada región del mapa, mientras que el prompt textual decide qué sujeto, materiales, ropa y estilo se generan dentro de cada región.

Técnicamente no es un ControlNet completo ni el adaptador oficial de concatenación de color/profundidad de MOSS, sino una LoRA de rango 64 en capas lineales y rango 16 en convoluciones que se carga con un cargador de LoRA estándar en diffusers/ComfyUI. Se entrenó como adaptador de edición: la imagen de control actúa como referencia estructural y el prompt describe la imagen a generar. El checkpoint publicado corresponde al paso de entrenamiento 4500.

Es relevante para flujos de trabajo de composición y bloqueo de escenas (*blocking*) donde el diseñador quiere fijar la disposición de personas, objetos y fondo sin fijar su apariencia final, y luego reestilizar cada masa mediante texto. El repositorio ocupa 0,3 GB y acumula 613 descargas y 4 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de control (tipo ControlNet) sobre el modelo de difusión MOSS-Image-SFT; rango 64 en capas lineales y rango 16 en convoluciones |
| Parametros totales | no disponible (el adaptador pesa 0,3 GB en safetensors; el modelo base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; el texto se procesa con el codificador Qwen3.5 9B del modelo base) |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors; el modelo base usa UNet int8 (`moss_image_sft_int8_convrot.safetensors`), text encoder W4A8 GPTQ (`qwen3.5_9b_w4a8_gptq.safetensors`) y VAE `flux2-vae_small.safetensors` |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA); workflow de ComfyUI en JSON |

## Arquitectura y entrenamiento

El adaptador es una LoRA de control que imita el comportamiento de un ControlNet: recibe una imagen de control (un mapa de segmentación de colores planos) y guía la generación del modelo base MOSS-Image-SFT. La LoRA tiene rango 64 en las capas lineales y rango 16 en las convoluciones, y se entrenó como adaptador de edición con la caché KV activada (`kv cache on`), lo que obliga a usar el formato de edición `ai-toolkit` en la codificación positiva y negativa. El checkpoint seleccionado es el paso 4500.

El entrenamiento se realizó sobre mapas de segmentación totalmente rellenos de colores planos, sin grandes zonas negras sin etiquetar; los colores del mapa son identificadores de región, no los colores que aparecerán en el resultado. El workflow incluido emplea el segmentador semántico UniFormer, cuyos mapas encajan mejor con los pesos que los de segmentadores que dejan el fondo en negro. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de imágenes condicionada por un mapa de segmentación de colores planos, respetando límites y masas de las regiones.
- Reestilización y sustitución de sujetos dentro de regiones definidas por el prompt (identidad, materiales, ropa, entorno).
- Control de composición y *blocking* de escenas: disposición de personas, mobiliario y fondo.
- Edición imagen a imagen con una única imagen de referencia de control.
- Integración en ComfyUI mediante el nodo Text Encode MOSS-Image Edit y cargador de LoRA sobre el UNet.
- Ajuste de rigidez del control mediante la fuerza de la LoRA (valor entrenado 1.0; bajar hacia 0.7 si el control resulta demasiado rígido).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un adaptador de generación de imágenes.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Bloqueo y reestilización de escenas: se construye un mapa de regiones con el segmentador (por ejemplo, UniFormer), se pasa como imagen de control y el prompt define el aspecto final de cada masa; útil para explorar variantes visuales manteniendo la composición.
- Previsualización de *layout* en producción audiovisual: fijar la disposición de personajes, decorados y fondo en un mapa de colores y generar renders alternativos con distintos estilos o materiales sin rehacer la composición.
- *Color script* y planificación de planos: decidir únicamente las formas y regiones de una escena y dejar que el texto determine paleta, iluminación y materiales en cada iteración.
- Diseño de interiores y mobiliario: mantener la distribución de muebles y estancias mediante el mapa de segmentación y cambiar acabados, textiles y estilo con el prompt.
- Concept art para videojuegos: generar variantes de un mismo *layout* de personajes y escenarios cambiando vestuario, armadura o ambientación desde el texto, con la estructura fijada por el control.
- Iteración de dirección de arte en ComfyUI: usar el workflow incluido para cargar una foto, construir el mapa de control, codificarlo con el prompt y muestrear con 30 pasos, CFG 4, sampler `euler` y scheduler `simple`.
- Edición controlada de imágenes existentes: partir de una segmentación de la imagen original y regenerar regiones concretas con nuevos sujetos o materiales, conservando los contornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB en safetensors; el requisito dominante es el modelo base MOSS-Image-SFT (UNet int8, text encoder Qwen3.5 9B en W4A8 GPTQ y VAE flux2), cuyo consumo de VRAM no se detalla en la información disponible.
- GPU recomendadas: no disponible de forma explícita; por el tamaño del codificador de texto (9B en cuantización W4A8) y del UNet en int8, se requiere una GPU con VRAM suficiente para ambos, típicamente de gama alta (A100, H100 o RTX 4090), aunque el dato exacto no está publicado.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende del modelo base, no del adaptador.
- Despliegue: ComfyUI con el workflow `moss_image_segmentation_control.json`, cargador de LoRA sobre el UNet y nodo Text Encode MOSS-Image Edit; la librería declarada es diffusers. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de este tipo).
- Configuración de muestreo recomendada: 30 pasos, CFG 4, `euler` + `simple`, fuerza de LoRA 1.0.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-segmentation-control-lora | LoRA de control (tipo ControlNet) sobre MOSS-Image-SFT | no disponible (0,3 GB) | no aplica | Apache 2.0 | Hugging Face, ComfyUI |
| ControlNet oficial para Stable Diffusion | ControlNet completo | no disponible en la información | no aplica | según versión | Hugging Face, diffusers |
| Adaptador oficial color/depth de MOSS-Image | Adaptador de concatenación oficial | no disponible | no aplica | según repositorio de OpenMOSS-Team | Hugging Face |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada; la diferencia principal frente a un ControlNet completo es que este adaptador es una LoRA que se carga con un cargador estándar y no un modelo de control independiente, y frente al adaptador oficial de MOSS se distingue por usar segmentación de regiones en lugar de color o profundidad.

## Limitaciones y advertencias

- El mapa de control debe usar colores planos y sólidos; los degradados y texturas confunden las regiones.
- El color de una región no se traslada al resultado: hay que indicar el material o color deseado en el prompt.
- Funciona mejor con mapas de UniFormer que con segmentadores que dejan el fondo en negro.
- Si el control resulta demasiado rígido, se recomienda bajar la fuerza de la LoRA hacia 0.7; 1.0 es el valor de entrenamiento.
- Requiere el formato de edición `ai-toolkit` en la codificación positiva y negativa, y se entrenó con caché KV activada; ignorar esto degrada los resultados.
- Solo soporta inglés según la model card; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación visual y de artefactos anatómicos; el prompt negativo de entrenamiento incluye `nsfw, worst quality, bad anatomy, watermark, jpeg artifact`.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base MOSS-Image-SFT y sus componentes (UNet, text encoder Qwen3.5, VAE flux2) tienen sus propias licencias que deben verificarse por separado.
- No es un ControlNet completo ni el adaptador oficial de color/profundidad; no debe esperarse un comportamiento idéntico a estos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-segmentation-control-lora
- Pesos (safetensors): https://huggingface.co/thedeoxen/MOSS-Image-segmentation-controlnet/blob/main/moss_image_sft_segmentation_control_lora.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-segmentation-controlnet/blob/main/moss_image_segmentation_control.json
- Repositorio del autor: https://huggingface.co/thedeoxen/MOSS-Image-segmentation-controlnet
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
