# thedeoxen/MOSS-Image-normal-controlnet

## Resumen

MOSS-Image-normal-controlnet es un adaptador de tipo LoRA para el modelo de difusion MOSS-Image-SFT, desarrollado por el usuario thedeoxen y publicado en Hugging Face. Se trata de un control LoRA que condiciona la generacion de imagenes a partir de un mapa de normales (normal map) en espacio de camara, de modo que la orientacion de las superficies y el volumen de la escena se mantienen fijos mientras el prompt de texto define materiales, identidad, ropa y estilo. No es un adaptador oficial de MOSS, sino una contribucion de la comunidad pensada para flujos de edicion imagen-a-imagen.

El adaptador se entrena sobre OpenMOSS-Team/MOSS-Image-SFT y se integra mediante un cargador de LoRA en ComfyUI, pasando una unica imagen de control a traves del nodo Text Encode MOSS-Image Edit. El checkpoint publicado corresponde al paso de entrenamiento 5000 y el repositorio ocupa aproximadamente 0,3 GB, con pesos en formato safetensors y licencia Apache 2.0.

Su relevancia practica reside en el control estructural fino: a diferencia de adaptadores de color o profundidad, el mapa de normales aporta informacion de orientacion de superficie, lo que resulta util para reiluminar, retexturizar o cambiar materiales manteniendo la forma del objeto. Es una pieza especializada dentro del ecosistema de edicion controlada de imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion MOSS-Image-SFT; rango 64 en capas lineales y rango 16 en convoluciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el LoRA; el modelo base se distribuye con UNet en int8 y text encoder en w4a8 GPTQ |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (moss_image_sft_normal_control_lora.safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo ControlNet-style aplicado sobre MOSS-Image-SFT, un modelo de difusion para edicion de imagenes. El LoRA tiene rango 64 en las capas lineales y rango 16 en las convoluciones, y se entrena como adaptador de edicion: la imagen de control (el mapa de normales) actua como referencia estructural y el prompt de texto describe la imagen a generar. El checkpoint publicado corresponde al paso de entrenamiento 5000. El entrenamiento se realizo con la cache KV activada, lo que obliga a configurar el formato de edicion `ai-toolkit` tanto en la codificacion positiva como en la negativa.

El modelo base emplea un UNet (moss_image_sft_int8_convrot.safetensors), un text encoder Qwen3.5 9B cuantizado en w4a8 GPTQ y un VAE flux2-vae_small. Los mapas de normales de entrenamiento son normales en espacio de camara en el formato habitual de colores purpura, cian y verde. No se dispone de informacion sobre el volumen de datos de entrenamiento ni sobre la composicion del dataset.

## Capacidades

- Control estructural mediante mapa de normales: mantiene la orientacion de superficie y el volumen de la escena mientras el prompt define el aspecto.
- Edicion imagen-a-imagen con una unica imagen de control pasada a traves del nodo Text Encode MOSS-Image Edit.
- Cambio de materiales, ropa, identidad y ambientacion gobernado por el prompt de texto.
- Reiluminacion y retexturizacion de formas solidas conservando la geometria.
- Integracion en ComfyUI mediante cargador de LoRA y workflow incluido en el repositorio.
- Ajuste de intensidad del LoRA (valor entrenado 1.0; reducir hacia 0.7 si el control resulta demasiado rigido).
- No requiere trigger word.
- Soporte de prompt negativo (ejemplo de entrenamiento: `nsfw, worst quality, bad anatomy, watermark, jpeg artifact`).
- Capacidades de tool calling, agentes, razonamiento o vision: no aplica (es un adaptador de generacion de imagen).

## Casos de uso

- Reiluminacion de formas solidas: se aporta un mapa de normales del objeto y un prompt que describe la nueva iluminacion y materiales; el adaptador conserva la geometria mientras el modelo base regenera la apariencia superficial.
- Retexturizacion de productos: en fotografia de producto con volumen fijo, se mantiene la forma del articulo y se cambia el acabado (metal, ceramica, tela) mediante el prompt, util para catalogos con variantes de material.
- Escenas con profundidad correcta pero orientacion de superficie relevante: cuando un adaptador de profundidad no basta porque la direccion de las caras importa, el mapa de normales aporta esa informacion adicional.
- Edicion de personajes con control de pose y volumen: el prompt define identidad, vestuario y entorno (por ejemplo, un maestro de ceremonias de circo) mientras el mapa de normales fija la postura y el volumen corporal.
- Generacion de variantes de estilo sobre una misma forma: a partir de un unico mapa de normales se producen multiples resultados cambiando solo el prompt, adecuado para exploracion conceptual rapida.
- Integracion en pipelines de ComfyUI para produccion de imagenes controladas: el workflow incluido permite encadenar carga de foto, construccion del mapa de normales con BAE Normal Map, codificacion y muestreo con ajustes fijos (30 pasos, CFG 4, euler + simple).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base MOSS-Image-SFT (UNet int8, text encoder Qwen3.5 9B en w4a8 GPTQ y VAE), no solo del LoRA, que ocupa unos 0,3 GB.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI con cargador de LoRA y el nodo Text Encode MOSS-Image Edit; el repositorio incluye el workflow moss_image_normal_control.json. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de adaptador.
- Latencia y throughput: no disponible.
- Ajustes de muestreo recomendados: 30 pasos, CFG 4, sampler euler con scheduler simple, fuerza de LoRA 1.0.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros adaptadores de control comparables (por ejemplo, adaptadores de profundidad o color de MOSS) ni metricas que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles como idioma declarado.
- Requiere un mapa de normales en espacio de camara; no debe usarse un mapa de altura en escala de grises.
- Los mapas de normales ruidosos introducen protuberancias no deseadas; se recomienda suavizar los normales para obtener volumenes limpios.
- Con fuerza de LoRA 1.0 el control puede resultar demasiado rigido; el autor sugiere bajar hacia 0.7 en esos casos.
- Es un adaptador de la comunidad, no el adaptador oficial de color/profundidad de MOSS; no debe confundirse con el.
- Requiere configurar el formato de edicion `ai-toolkit` en la codificacion positiva y negativa, ya que se entreno con cache KV activada; una configuracion incorrecta puede degradar los resultados.
- Riesgo de alucinacion visual y artefactos propios de los modelos de difusion; el prompt negativo de entrenamiento incluye terminos como `bad anatomy`, `watermark` y `jpeg artifact`.
- No se han publicado datos sobre sesgos del adaptador ni sobre el volumen y composicion de su dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base OpenMOSS-Team/MOSS-Image-SFT antes de desplegar en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-normal-controlnet
- Pesos del LoRA: https://huggingface.co/thedeoxen/MOSS-Image-normal-controlnet/blob/main/moss_image_sft_normal_control_lora.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-normal-controlnet/blob/main/moss_image_normal_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
