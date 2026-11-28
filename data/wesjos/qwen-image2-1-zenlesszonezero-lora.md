# wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora

## Resumen

Qwen-Image2.1-ZenlessZoneZero-Lora es un adaptador LoRA de estilo entrenado sobre el modelo de difusion Qwen-Image-2.1, desarrollado por el usuario wesjos. Su proposito es transferir la estetica visual del videojuego Zenless Zone Zero (ZZZ) de HoYoverse a la generacion y edicion de imagenes, sin necesidad de reentrenar el modelo base completo. El adaptador se publica bajo licencia Apache-2.0 y esta pensado para su uso en flujos de trabajo de ComfyUI y la libreria diffusers.

El modelo resuelve un problema concreto: conseguir un estilo visual coherente y reconocible (paleta, iluminacion, linework y renderizado de vestuario propios de ZZZ) manteniendo la identidad y composicion de personajes en tareas de image-to-image. Funciona tanto en modo text-to-image como en edicion img2img, y la palabra de activacion `zenlesszonezero` es opcional segun el autor, ya que el estilo tambien se transfiere sin ella.

Se trata de un adaptador ligero (repo de 1.6 GB) que hereda la arquitectura y capacidades del modelo base Qwen-Image-2.1. No es un modelo independiente: requiere cargar Qwen-Image-2.1 como modelo de difusion subyacente. Su interes actual radica en la creciente comunidad de LoRAs de estilo para modelos de imagen open source y en la popularidad del universo ZZZ como referencia estetica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Qwen-Image-2.1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona un base int8 en ComfyUI: `qwen_image_2.1_int8_convrot.safetensors`) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria diffusers); tamano del repo 1.6 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de estilo que se aplica sobre Qwen-Image-2.1, un modelo de difusion texto-a-imagen. El autor indica que el modelo base utilizado durante el desarrollo fue la variante int8 para ComfyUI (`qwen_image_2.1_int8_convrot.safetensors`). No se detalla en la informacion disponible el numero de imagenes de entrenamiento, la composicion del dataset ni los hiperparametros del entrenamiento (rango del LoRA, learning rate, numero de pasos).

La innovacion practica del adaptador reside en su doble uso: no solo aplica el estilo en generacion desde cero, sino que en modo edicion (img2img) reestiliza una imagen de entrada preservando identidad de personaje, pose y composicion, mientras desplaza paleta, iluminacion, linework y renderizado de vestuario hacia el look de ZZZ. El autor menciona un plan de actualizacion para recolectar mas datos durante eventos de camara del juego, lo que sugiere un dataset en expansion.

## Capacidades

- Generacion de imagenes texto-a-imagen con estetica Zenless Zone Zero.
- Edicion de imagenes (image-to-image) con preservacion de identidad, pose y composicion.
- Transferencia de estilo sin necesidad obligatoria de palabra de activacion (segun el autor).
- Funciona con la palabra de activacion opcional `zenlesszonezero`.
- Compatible con flujos de ComfyUI y con la libreria diffusers.
- Soporte de prompts en ingles y chino.
- Generacion a resoluciones altas (ejemplos a 1920 x 1088).
- No se documentan capacidades de vision por comprension, tool calling ni agentes (es un modelo de generacion de imagen, no un LLM).

## Casos de uso

- Ilustracion de fan art con estetica ZZZ: el adaptador genera escenas completas (cafeterias, playas, calles urbanas) con el estilo visual del juego en una sola pasada, a resoluciones de 1920 x 1088, usando CFG 4.0 y 30 pasos.
- Reestilizado de fotografia o arte existente: en modo img2img, con el prompt `re render this image in zenlesszonezero_style`, se transforma una imagen fotorrealista al look ZZZ conservando la composicion original, util para concept art o pruebas de direccion visual.
- Prototipado de personajes para proyectos de videojuego: permite explorar variaciones de vestuario y ambientacion (cardigans, bikinis, delantales) manteniendo coherencia estilistica entre iteraciones.
- Creacion de assets para comunidad y redes: generacion rapida de ilustraciones consistentes para publicaciones, banners o thumbnails con una identidad visual unificada.
- Pruebas de pipeline en ComfyUI: sirve como caso de estudio para integrar LoRAs de estilo sobre Qwen-Image-2.1 en grafos de nodos con KSampler `euler`/`simple` y AuraFlow shift 3.0.
- Edicion de arte promocional: reestilizar material grafico existente hacia la estetica del juego sin rehacer la ilustracion desde cero, gracias a la preservacion de identidad y pose en img2img.
- Investigacion sobre transferencia de estilo con LoRAs: el adaptador puede usarse como referencia para estudiar como un LoRA de bajo rango modifica paleta, iluminacion y linework sin alterar la estructura de la escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta los ajustes de generacion de sus ejemplos (LoRA 0.80 en modelo y 0.85 en text encoder, KSampler `euler` + `simple`, 30 pasos, CFG 4.0, shift 3.0, resolucion 1920 x 1088) y las semillas utilizadas, pero no ofrece metricas cuantitativas de calidad, FID ni comparaciones numericas con otros LoRAs.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Qwen-Image-2.1 y de la cuantizacion empleada. El autor uso una variante int8 en ComfyUI.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el uso de una variante int8 sugiere que el autor busco reducir requisitos de memoria, pero no se especifica en que GPU se ejecuto.
- Opciones de despliegue: ComfyUI (documentado por el autor) y diffusers (libreria declarada en la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de LoRAs alternativos de estilo ZZZ sobre Qwen-Image-2.1 en la informacion proporcionada. La comparativa se limita a aspectos estructurales:

| Modelo | Base | Tipo | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| Qwen-Image2.1-ZenlessZoneZero-Lora | Qwen-Image-2.1 | LoRA de estilo | Apache-2.0 | en, zh | safetensors (diffusers) |
| Otros LoRAs de estilo ZZZ sobre Qwen-Image-2.1 | Qwen-Image-2.1 | LoRA de estilo | no disponible | no disponible | no disponible |
| LoRAs de estilo ZZZ sobre otros modelos de difusion | no disponible | LoRA de estilo | no disponible | no disponible | no disponible |

No se han encontrado en la informacion disponible alternativas comparables con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un estilo de videojuego, puede reproducir sesgos esteticos y de representacion del material de origen.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar detalles anatomicos o de vestuario incoherentes, especialmente en composiciones complejas con multiples personajes.
- Dependencia del modelo base: requiere Qwen-Image-2.1; no funciona de forma autonoma.
- Cobertura linguistica limitada: solo se declaran en y zh; el comportamiento con prompts en castellano no esta documentado.
- Dataset en expansion: el autor indica que espera recolectar mas datos en futuros eventos del juego, por lo que el estilo puede cambiar entre versiones (los ejemplos corresponden a la v1.7).
- Contenido generado: el propio autor advierte que el contenido generado no es necesariamente representativo del material original en todos los aspectos.
- Licencia: Apache-2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen-Image-2.1 y los derechos de propiedad intelectual asociados a la franquicia Zenless Zone Zero (HoYoverse), no cubiertos por la licencia del adaptador.
- Ajustes sensibles: los resultados dependen de la fuerza del LoRA (0.80/0.85 en los ejemplos), CFG y sampler; valores fuera de ese rango no estan documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Ejemplos text-to-image: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/examples/t2i_01.png
- Ejemplo de edicion img2img: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/edit/edit0_compare.jpg
