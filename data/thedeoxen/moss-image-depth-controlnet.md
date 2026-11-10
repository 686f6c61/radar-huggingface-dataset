# thedeoxen/MOSS-Image-depth-controlnet

## Resumen

MOSS-Image-depth-controlnet es un adaptador LoRA de tipo ControlNet para el modelo de generación y edición de imágenes MOSS-Image-SFT, desarrollado por el usuario thedeoxen sobre el modelo base de OpenMOSS-Team. Su función es condicionar la generación de imágenes a un mapa de profundidad en escala de grises (con las superficies cercanas en blanco y el fondo en negro), de modo que el modelo respete la disposición espacial de cerca a lejos mientras el prompt de texto define la identidad, los materiales, la ropa y el estilo visual.

El adaptador se entrenó como un "edit LoRA" al estilo ControlNet, no como el adaptador oficial de concatenación de color/profundidad de MOSS. Se carga con un cargador de LoRA estándar y se le pasa una única imagen de control a través del nodo Text Encode MOSS-Image Edit. Tiene rango 64 en las capas lineales y rango 16 en las convolucionales, y el checkpoint seleccionado corresponde al paso de entrenamiento 5000.

Es relevante porque permite reutilizar el modelo base MOSS-Image-SFT para tareas de control estructural por profundidad sin necesidad de reentrenar el modelo completo, y porque incluye un flujo de trabajo listo para ComfyUI que integra Depth Anything V2 para construir el mapa de control. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de tipo ControlNet sobre el modelo de difusion MOSS-Image-SFT (adaptador de edicion) |
| Parametros totales | no disponible (pesos del adaptador en un unico safetensors; el modelo base no declara cifra en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el LoRA; el modelo base se distribuye con UNet int8 (`moss_image_sft_int8_convrot.safetensors`) y text encoder `qwen3.5_9b_w4a8_gptq.safetensors` |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`moss_image_sft_depth_control_lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo ControlNet que se aplica sobre el UNet del modelo de difusion MOSS-Image-SFT. Segun la model card, el LoRA tiene rango 64 en las capas lineales y rango 16 en las convolucionales, y se entreno como adaptador de edicion: la imagen de control (el mapa de profundidad) actua como referencia y el prompt describe la imagen a generar. El checkpoint publicado corresponde al paso de entrenamiento 5000, con la cache KV activada durante el entrenamiento.

El control se construye a partir de un mapa de profundidad en escala de grises con la convencion de que lo cercano es blanco y el fondo cae a negro, igual que en los controles de entrenamiento. El flujo de trabajo incluido genera ese mapa con Depth Anything V2 (`depth_anything_v2_vitl`). El modelo base recomendado es OpenMOSS-Team/MOSS-Image-SFT, que utiliza un UNet int8, un text encoder basado en Qwen 3.5 de 9B cuantizado w4a8 GPTQ y el VAE `flux2-vae_small.safetensors`. No se detalla en la informacion disponible el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion y edicion de imagenes condicionada por un mapa de profundidad en escala de grises (image-to-image).
- Control de la disposicion espacial de cerca a lejos: el adaptador sigue la estructura de profundidad mientras el prompt define identidad, materiales, ropa y mundo.
- Definicion de estilo y apariencia mediante prompt de texto, sin palabra de activacion (no trigger word).
- Funciona como adaptador de control de una sola imagen para MOSS-Image-SFT.
- Integracion con ComfyUI mediante el nodo Text Encode MOSS-Image Edit y el cargador de LoRA.
- Ajuste de la rigidez del control bajando la fuerza del LoRA hacia 0,7 (1,0 es el valor entrenado).
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo de razonamiento (thinking).

## Casos de uso

- Reconstruccion de escenas con la misma profundidad de camara en un estilo nuevo: se aporta el mapa de profundidad de la escena original y un prompt que describa el nuevo estilo, y el LoRA mantiene la composicion espacial mientras cambia la apariencia.
- Separacion de primer plano y fondo al cambiar materiales: util para sustituir texturas o materiales de un objeto cercano sin alterar la relacion de profundidad con el fondo.
- Diseno de producto e interiores con un sujeto cercano claro: el mapa de profundidad define la colocacion del producto o del mobiliario y el prompt fija materiales y acabados.
- Generacion de variaciones controladas de una imagen de referencia: a partir de un unico mapa de profundidad se pueden producir multiples resultados cambiando solo el prompt.
- Previsualizacion de composiciones para fotografia o cine: se valida la estructura de profundidad de una toma antes de generar la imagen final con el estilo deseado.
- Prototipado en ComfyUI: el flujo incluido (Depth Anything V2 mas Text Encode MOSS-Image Edit) permite montar un pipeline de image-to-image con control de profundidad sin desarrollo adicional.
- Exploracion de estilos sobre una misma estructura: con regiones de profundidad amplias y planas, el prompt dispone de mas margen para definir textura y detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador LoRA ocupa 0,3 GB en disco y se suma al modelo base MOSS-Image-SFT, que carga un UNet int8 y un text encoder de 9B cuantizado w4a8 GPTQ; el consumo total depende principalmente del modelo base.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible. La viabilidad dependera del modelo base y de la cuantizacion empleada.
- Opciones de despliegue: ComfyUI (flujo incluido) con el nodo Text Encode MOSS-Image Edit y cargador de LoRA; la libreria declarada es diffusers.
- Parametros de muestreo recomendados: 30 pasos, CFG 4, sampler `euler` con scheduler `simple`, fuerza de LoRA 1,0, formato de edicion `ai-toolkit` en las codificaciones positiva y negativa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-depth-controlnet | LoRA ControlNet de profundidad sobre MOSS-Image-SFT | no disponible | no disponible | apache-2.0 | Hugging Face, ComfyUI |
| Adaptador oficial de concatenacion color/profundidad de MOSS | Adaptador nativo del modelo base | no disponible | no disponible | no disponible | no disponible |
| ControlNet estandar para modelos de difusion (p. ej. Stable Diffusion) | ControlNet de profundidad | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El adaptador esta entrenado y recomendado exclusivamente con OpenMOSS-Team/MOSS-Image-SFT; su uso con otros modelos base no esta soportado.
- Requiere respetar la convencion de profundidad del entrenamiento (cercano en blanco); un mapa invertido "lucha contra el LoRA" y degrada el resultado.
- El campo de idioma declara solo ingles, por lo que los prompts en otros idiomas pueden no funcionar correctamente.
- Es un adaptador de edicion, no el adaptador oficial de concatenacion de color/profundidad de MOSS; no debe confundirse con el.
- Es necesario configurar el formato de edicion `ai-toolkit` en las codificaciones positiva y negativa, ya que el LoRA se entreno con la cache KV activada.
- El control puede resultar demasiado rigido a fuerza 1,0; se recomienda bajarla hacia 0,7 si es necesario.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al depender del modelo base, hereda los sesgos y limitaciones de este.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base MOSS-Image-SFT antes de desplegarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-depth-controlnet
- Pesos del LoRA: https://huggingface.co/thedeoxen/MOSS-Image-depth-controlnet/blob/main/moss_image_sft_depth_control_lora.safetensors
- Flujo de trabajo para ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-depth-controlnet/blob/main/moss_image_depth_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
