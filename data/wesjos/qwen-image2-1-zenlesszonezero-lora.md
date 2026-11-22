# wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora

## Resumen

Qwen-Image2.1-ZenlessZoneZero-Lora es un adaptador LoRA de estilo entrenado por el usuario wesjos sobre el modelo base Qwen/Qwen-Image-2.1, un modelo de difusion texto-a-imagen desarrollado por el equipo Qwen de Alibaba. El adaptador traslada la estetica visual del videojuego Zenless Zone Zero (paleta, linework, cel shading y diseno de vestuario) a las generaciones del modelo base, tanto en modo texto-a-imagen como en edicion imagen-a-imagen.

El repositorio ocupa 1,6 GB y se distribuye en formato diffusers con licencia Apache-2.0. La model card documenta el uso de un checkpoint base cuantizado en int8 (`qwen_image_2.1_int8_convrot.safetensors`) dentro de ComfyUI, con una palabra de activacion opcional (`zenlesszonezero`) que, segun el autor, no es imprescindible para que el estilo se transfiera.

El modelo acumula 1.820 descargas y 6 likes en Hugging Face, con creacion el 29 de septiembre de 2026 y ultima actualizacion el 18 de noviembre de 2026. Es relevante para flujos de produccion de arte estilo anime y para experimentar con personalizacion de estilo sobre modelos de difusion de gran formato sin reentrenar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen (Qwen-Image-2.1) |
| Parametros totales | no disponible (el repositorio ocupa 1,6 GB; no se desglosa el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base usado en los ejemplos es int8 (`qwen_image_2.1_int8_convrot.safetensors`) |
| Idiomas soportados | en, zh (segun los metadatos de la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | diffusers (adaptador LoRA); el modelo base de referencia se distribuye como safetensors int8 para ComfyUI |

## Arquitectura y entrenamiento

El adaptador es un LoRA de estilo aplicado sobre Qwen-Image-2.1, un modelo de difusion texto-a-imagen. La model card no detalla la arquitectura interna del modelo base (tipo de backbone, mecanismo de atencion ni variante de difusion), por lo que ese dato queda como no disponible. El LoRA se aplica con intensidades distintas al modelo y al codificador de texto: 0,80 y 0,85 respectivamente en los ejemplos publicados.

No se especifica en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset, el numero de pasos ni si se emplearon tecnicas de regularizacion o captions automaticos. El autor indica que el checkpoint base utilizado para generar los ejemplos es una version int8 preparada para ComfyUI (`qwen_image_2.1_int8_convrot.safetensors`), lo que sugiere un flujo de trabajo orientado a inferencia local en GPU de consumo.

Como innovacion practica, el LoRA funciona tanto en texto-a-imagen como en edicion imagen-a-imagen: en el segundo caso, el prompt `re render this image in zenlesszonezero_style` reestiliza la imagen de entrada preservando identidad, pose y composicion del sujeto, y modificando paleta, iluminacion, linework y renderizado del vestuario.

## Capacidades

- Generacion texto-a-imagen con estetica Zenless Zone Zero: paleta, cel shading, linework y diseno de personajes propios del videojuego.
- Edicion imagen-a-imagen: reestilizado in-place de fotografias o ilustraciones conservando identidad, pose y encuadre.
- Transferencia de estilo sin palabra de activacion: los cinco ejemplos de texto-a-imagen publicados no incluyen el trigger word y el estilo se aplica igualmente.
- Palabra de activacion opcional `zenlesszonezero` para reforzar el estilo.
- Composicion multijugador: los ejemplos muestran dos personajes en escena (Furina y Hu Tao) con coherencia de vestuario y entorno.
- Resolucion de trabajo documentada: 1920 x 1088 (latente 1920 x 1080) sin degradacion aparente en los ejemplos.
- Integracion con ComfyUI mediante workflows embebidos en los PNG de ejemplo.
- Soporte bilingue de prompts: en y zh.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio, ya que no es un modelo de lenguaje.

## Casos de uso

- Produccion de arte para videojuegos estilo anime: generacion de concept art y variaciones de personajes con la estetica ZZZ a 1920 x 1088, usando el LoRA a fuerza 0,8 sobre el modelo y 0,85 sobre el codificador de texto.
- Reestilizado de material fotografico existente: conversion de fotos de producto, retratos o escenarios a estilo anime mediante el prompt de edicion, conservando la composicion original para mantener el encuadre comercial.
- Creacion de fan art y contenido para comunidades: el trigger word y la estetica reconocible del videojuego permiten generar ilustraciones de personajes con coherencia de estilo en lotes.
- Previsualizacion rapida de direccion artistica: iteracion de paletas y disenos de vestuario sobre un mismo personaje antes de encargar el render final a un artista.
- Generacion de assets para redes sociales: imagenes 1920 x 1088 listas para publicacion en formato horizontal, con seeds reproducibles documentadas en la model card.
- Prototipado de moda y vestuario estilizado: los ejemplos de cafeteria, playa y cocina demuestran control sobre prendas (cardigans, bikinis, delantales) y accesorios dentro de la estetica del LoRA.
- Integracion en pipelines ComfyUI: el adaptador se carga como nodo LoRA en flujos existentes de Qwen-Image-2.1, con parametros de sampler documentados (euler/simple, 30 pasos, CFG 4.0, shift 3.0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente documenta los parametros de inferencia empleados en los ejemplos (30 pasos, CFG 4.0, sampler euler con scheduler simple, shift 3.0, LoRA a 0,80/0,85) y las seeds de cada imagen, pero no incluye metricas cuantitativas como FID, CLIP score ni comparaciones numericas con otros LoRA de estilo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Qwen-Image-2.1. El adaptador en si ocupa 1,6 GB en disco y se suma a los pesos del modelo base.
- El autor emplea una version int8 del modelo base (`qwen_image_2.1_int8_convrot.safetensors`) en ComfyUI, lo que reduce los requisitos de VRAM frente a una carga en precision completa.
- GPU recomendadas: no disponibles en la informacion proporcionada. La cuantizacion int8 y el flujo ComfyUI sugieren orientacion a GPU de consumo, pero no se confirma un modelo concreto.
- Opciones de despliegue: ComfyUI (documentado con workflows embebidos en los PNG); la libreria diffusers es compatible por los metadatos del repositorio.
- Latencia y throughput: no disponibles. Los ejemplos usan 30 pasos con sampler euler, lo que da una referencia del coste computacional por imagen, pero sin tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image2.1-ZenlessZoneZero-Lora | LoRA de estilo | Qwen-Image-2.1 | 1920 x 1088 documentado | Apache-2.0 | Hugging Face, 1.820 descargas |
| Qwen-Image-2.1 (base) | Difusion texto-a-imagen | no aplica | no disponible | no disponible | Hugging Face |
| Otros LoRA de estilo sobre Qwen-Image-2.1 | LoRA de estilo | Qwen-Image-2.1 | no disponible | no disponible | no disponible en la informacion |

No se dispone de datos de benchmarks ni de otros adaptadores LoRA comparables en la informacion proporcionada, por lo que la comparativa se limita a la relacion con el modelo base.

## Limitaciones y advertencias

- La model card advierte explicitamente de que el contenido generado no representa necesariamente el material original del videojuego en todos los aspectos.
- Riesgo de alucinacion visual y de deriva estilistica: al ser un LoRA de estilo, puede aplicar la estetica de forma inconsistente en composiciones complejas o con muchos sujetos.
- El trigger word es opcional, lo que implica que el estilo puede filtrarse en generaciones no deseadas si el LoRA queda cargado con fuerza alta.
- Idiomas soportados limitados a en y zh; los prompts en otros idiomas pueden degradar la adherencia al estilo.
- Licencia Apache-2.0 permisiva para uso comercial, pero el contenido generado con la estetica de una franquicia de terceros puede estar sujeto a derechos de propiedad intelectual ajenos al adaptador.
- No se documentan sesgos demograficos ni de representacion; al entrenarse sobre un estilo de videojuego, es probable que herede los sesgos de representacion de dicho material.
- No hay informacion sobre el dataset de entrenamiento, lo que impide auditar procedencia de imagenes y posibles problemas de derechos.
- El adaptador requiere el modelo base Qwen-Image-2.1, por lo que los requisitos de hardware reales vienen determinados por este ultimo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Ejemplo texto-a-imagen 1: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/examples/t2i_01.png
- Ejemplo texto-a-imagen 2: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/examples/t2i_02.png
- Ejemplo texto-a-imagen 3: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/examples/t2i_03.png
- Ejemplo texto-a-imagen 4: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/examples/t2i_04.png
- Ejemplo texto-a-imagen 5: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/examples/t2i_05.png
- Ejemplo de edicion imagen-a-imagen: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/edit/edit0_compare.jpg
