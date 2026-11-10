# thedeoxen/MOSS-Image-scribble-controlnet

## Resumen

MOSS-Image-scribble-controlnet es un adaptador LoRA de tipo ControlNet para el modelo de generación y edición de imágenes MOSS-Image-SFT, desarrollado por el usuario thedeoxen sobre el modelo base del equipo OpenMOSS. Su función es permitir el control estructural de la imagen generada mediante un boceto o garabato (scribble) de trazos blancos sobre fondo negro, de forma que el modelo respeta las masas y trazos principales del dibujo mientras el prompt de texto define identidad, materiales, vestuario y estilo. No se trata del adaptador oficial de concatenación de color/profundidad de MOSS, sino de una LoRA de edición entrenada específicamente para esta tarea.

El adaptador se distribuye como un único fichero safetensors de aproximadamente 0,3 GB, con rango 64 en capas lineales y rango 16 en convoluciones, y se integra en flujos de trabajo de ComfyUI mediante el nodo Text Encode MOSS-Image Edit con formato de edición `ai-toolkit`. Está pensado para artistas y desarrolladores que necesitan un control laxo de composición antes de aplicar pasadas más estrictas de Canny o lineart.

La relevancia de esta ficha radica en que documenta un adaptador de la comunidad, sin métricas publicadas ni validación externa, que amplía las capacidades del ecosistema MOSS-Image con un caso de uso muy concreto: el control por boceto en pipelines de image-to-image. Su licencia Apache 2.0 facilita la experimentación, aunque la ausencia de benchmarks y de tracción en Hugging Face (0 descargas, 0 likes en el momento de la consulta) obliga a tratarlo como un recurso experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de control (estilo ControlNet) sobre el modelo de difusion MOSS-Image-SFT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para la LoRA; el modelo base se distribuye con UNet `moss_image_sft_int8_convrot.safetensors`, text encoder `qwen3.5_9b_w4a8_gptq.safetensors` y VAE `flux2-vae_small.safetensors` |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`moss_image_sft_scribble_control_lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es una LoRA de edición con rango 64 en las capas lineales y rango 16 en las convoluciones, entrenada sobre el modelo base OpenMOSS-Team/MOSS-Image-SFT. Se concibe como un adaptador de control de imagen única: la imagen de control actúa como referencia estructural y el prompt describe la imagen a generar. El checkpoint seleccionado corresponde al paso de entrenamiento 5000.

El entrenamiento se realizó con la caché KV activada, lo que obliga a configurar el formato de edición `ai-toolkit` tanto en la codificación positiva como en la negativa durante la inferencia. Los mapas de control de entrenamiento son trazos blancos sobre negro, más gruesos y suaves que los que producen Canny o lineart; el flujo de trabajo incluido usa HED Soft-Edge Lines en modo seguro por ser el más cercano a esa distribución. No se especifican en la información disponible el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Control estructural por boceto: sigue los trazos y masas principales de un dibujo laxo, sin exigir precisión en los bordes finos.
- Generación image-to-image condicionada por prompt: la identidad, los materiales, la ropa y el estilo provienen del texto.
- Integración como adaptador de control de imagen única para MOSS-Image-SFT.
- Compatibilidad con flujos de ComfyUI mediante el nodo Text Encode MOSS-Image Edit y el formato de edición `ai-toolkit`.
- Ajuste de intensidad de la LoRA (valor entrenado 1.0; se recomienda bajar a 0.7 si el control resulta demasiado rígido).
- No requiere palabra de activación (trigger word).
- Capacidades multimodales adicionales (visión, audio, tool calling, agentes): no disponibles en esta LoRA, que es exclusivamente un adaptador de control para generación de imágenes.

## Casos de uso

- Bocetos rápidos y storyboards: el adaptador convierte trazos sueltos en imágenes acabadas respetando la composición, lo que agiliza la previsualización de secuencias narrativas antes de producir arte final.
- Pruebas de composición previas a una pasada estricta: se usa como primera etapa para fijar masas y encuadre, y después se aplica un control más preciso con Canny o lineart sobre la imagen resultante.
- Dibujo sobre fotografía conservando solo las formas grandes: partiendo de una foto convertida a líneas HED Soft-Edge, el modelo regenera la escena manteniendo la estructura pero sustituyendo texturas y materiales según el prompt.
- Exploración de estilo y vestuario sobre una misma estructura: al no fijar identidad ni materiales, un mismo boceto sirve para generar variantes de personaje, ropa y ambientación cambiando únicamente el prompt.
- Previsualización de conceptos para dirección de arte: equipos de diseño pueden validar ideas de escena con trazos mínimos y prompts descriptivos, reduciendo el coste frente a un render completo.
- Prototipado en ComfyUI para pipelines de producción: el flujo incluido permite encadenar carga de foto, construcción del mapa de control, codificación y muestreo con parámetros fijos (30 pasos, CFG 4, euler + simple), lo que facilita la automatización de pruebas.
- Docencia y experimentación con adaptadores de control: al ser una LoRA pequeña (0,3 GB) y con licencia Apache 2.0, sirve para estudiar cómo se comporta un control laxo frente a uno estricto en modelos de difusión modernos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la LoRA: no disponible de forma aislada; el consumo vendrá determinado por el modelo base MOSS-Image-SFT y su text encoder.
- El modelo base se distribuye con UNet en int8 (`moss_image_sft_int8_convrot.safetensors`) y text encoder en W4A8 GPTQ (`qwen3.5_9b_w4a8_gptq.safetensors`), lo que reduce los requisitos frente a pesos en precisión completa, aunque no se especifican cifras concretas de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base y de la cuantización empleada.
- Opciones de despliegue: ComfyUI (flujo de trabajo incluido) y librería diffusers; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a un adaptador de difusión de este tipo.
- Latencia y throughput: no disponibles. Los parámetros de muestreo recomendados son 30 pasos, CFG 4 y sampler euler + simple.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-scribble-controlnet | LoRA de control (scribble) sobre MOSS-Image-SFT | no disponible | no aplica | apache-2.0 | Hugging Face, 0 descargas |
| Adaptador oficial de color/profundidad de MOSS | Adaptador de concatenación oficial del modelo base | no disponible | no aplica | no disponible | no disponible |
| ControlNet para Stable Diffusion (scribble) | ControlNet clásico para SD | no disponible en la informacion | no aplica | no disponible | ecosistema amplio |
| ControlNet para FLUX (scribble) | ControlNet para modelos FLUX | no disponible en la informacion | no aplica | no disponible | ecosistema en crecimiento |

No se dispone de datos de rendimiento ni de parámetros comparables en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay métricas objetivas de fidelidad al boceto, calidad de imagen ni comparación con otros adaptadores.
- Tracción nula en Hugging Face (0 descargas, 0 likes en el momento de la consulta): no hay validación por parte de la comunidad.
- El adaptador sigue trazos gruesos y masas, no bordes finos; un mapa de control demasiado detallado (Canny o PiDiNet fino) puede degradar el resultado respecto a HED Soft-Edge.
- Requiere configuración específica en ComfyUI: formato de edición `ai-toolkit` en codificación positiva y negativa, y la caché KV activada, tal como se entrenó. Un uso incorrecto de estos ajustes puede producir resultados inconsistentes.
- Dependencia estricta del modelo base OpenMOSS-Team/MOSS-Image-SFT y de sus ficheros concretos (UNet int8, text encoder W4A8 GPTQ, VAE flux2-vae_small); no se garantiza compatibilidad con otras variantes.
- Idioma soportado únicamente inglés según la model card; el rendimiento con prompts en castellano no está documentado.
- Riesgo de alucinación visual y de desviación del boceto cuando el prompt es muy detallado o contradictorio con la estructura dibujada.
- No se documentan sesgos conocidos del adaptador; al heredar el modelo base, podría reproducir sesgos presentes en los datos de entrenamiento de MOSS-Image-SFT.
- Licencia Apache 2.0 permite uso comercial, pero al ser un adaptador sobre un modelo base de terceros conviene verificar la licencia y condiciones de OpenMOSS-Team/MOSS-Image-SFT antes de producción.
- El prompt negativo de referencia es `nsfw, worst quality, bad anatomy, watermark, jpeg artifact`; no se especifican filtros de seguridad adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-scribble-controlnet
- Pesos de la LoRA: https://huggingface.co/thedeoxen/MOSS-Image-scribble-controlnet/blob/main/moss_image_sft_scribble_control_lora.safetensors
- Flujo de trabajo ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-scribble-controlnet/blob/main/moss_image_scribble_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
