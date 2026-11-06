# Uhvg856/Qwen-Edit-2509-Multiple-angles

## Resumen

Qwen-Edit-2509-Multiple-angles es un adaptador LoRA para el modelo de edicion de imagen Qwen-Image-Edit-2509, desarrollado por el usuario Uhvg856 (con copias y duplicados publicados por otros usuarios como dx8152, svjack o hughugfarid en Hugging Face). El LoRA anade control explicito de camara sobre el modelo base: permite ordenar en lenguaje natural movimientos de camara (desplazamientos verticales y horizontales, rotaciones, cambios de angulo, paso a plano general o a primer plano) sin necesidad de mascaras ni de palabras de activacion. El repositorio ocupa 0,2 GB y se distribuye con licencia Apache 2.0.

El modelo resuelve un problema concreto de los pipelines de edicion de imagen: el modelo base Qwen-Image-Edit-2509 ya posee cierta capacidad de reinterpretar la perspectiva de una imagen, pero no expone un control fino y fiable de la camara. Este LoRA refuerza esa capacidad mediante entrenamiento supervisado sobre pares de imagenes con cambios de punto de vista, de modo que el usuario puede generar variaciones de angulo de un mismo sujeto manteniendo la identidad visual.

Es relevante ahora porque el ecosistema de Qwen-Image-Edit-2509 se esta convirtiendo en una base comun para LoRAs de edicion especializada, y este adaptador es uno de los primeros en atacar el control de camara. La model card advierte de que la consistencia entre la imagen de entrada y la de salida fue inestable en versiones previas y que se resubio una version con mas iteraciones de entrenamiento para corregirlo. No se dispone de datos sobre parametros, contexto ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Qwen-Image-Edit-2509 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fichero `qwen_image_edit_2509_multiple_angles.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre Qwen-Image-Edit-2509, un modelo de difusion para edicion de imagen por instrucciones. El autor indica que el entrenamiento se realizo sin escribir codigo, utilizando la infraestructura de entrenamiento de ModelScope. No se detalla el numero de pasos, el tamano del dataset, la composicion de los pares de imagenes ni si se aplicaron tecnicas de regularizacion o de aumento de datos. La model card menciona que el 2 de noviembre de 2025 se resubio una version con mas iteraciones de entrenamiento para mitigar problemas de consistencia entre la imagen original y la editada.

Una innovacion operativa destacable es la ausencia de trigger words: el control se ejerce mediante instrucciones en lenguaje natural (en chino o en ingles en los ejemplos de la model card), lo que simplifica la integracion en interfaces conversacionales. El autor recomienda combinar este LoRA con Qwen-Image-Lightning (lightx2v/Qwen-Image-Lightning) para acelerar la inferencia, y ofrece un enlace a un espacio de ejecucion online en RunningHub.

## Capacidades

- Edicion de imagen por instrucciones en lenguaje natural sobre una imagen de entrada (pipeline image-to-image).
- Control de camara: desplazamiento hacia delante, atras, izquierda y derecha.
- Rotacion de camara a izquierda y derecha, con control de angulo (por ejemplo, 45 grados).
- Cambio de angulo vertical: vista cenital (top-down) y vista desde abajo.
- Cambio de tipo de plano: gran angular (wide-angle) y primer plano (close-up).
- Mantenimiento de la identidad del sujeto entre la imagen de entrada y la generada, con la salvedad de que el autor reconocio problemas de consistencia en versiones anteriores.
- Sin palabras de activacion: las ordenes se expresan directamente como frases descriptivas.
- Compatibilidad con el ecosistema diffusers y con el proveedor de inferencia Wavespeed a traves de `InferenceClient`.

## Casos de uso

- Previsualizacion de angulos para fotografia de producto: a partir de una sola foto de un objeto, generar vistas laterales, cenitales y de primer plano para componer una ficha de catalogo sin una sesion fotografica adicional.
- Storyboarding y previsualizacion cinematografica: convertir un fotograma de referencia en varias tomas con movimientos de camara (dolly, rotacion, plano general a primer plano) para explorar la puesta en escena antes de rodar.
- Creacion de assets para videojuegos: generar variaciones de punto de vista de un mismo personaje u objeto para texturizar modelos 3D o para poblar escenarios con vistas coherentes.
- Edicion fotografica asistida: corregir o ampliar el encuadre de una fotografia (por ejemplo, simular un paso a gran angular) manteniendo la coherencia del sujeto, integrable en un flujo con diffusers.
- Generacion de datasets sinteticos de vistas multiples: producir pares o conjuntos de imagenes del mismo sujeto desde distintos angulos para entrenar modelos de reconstruccion 3D o de estimacion de pose, partiendo de una unica imagen.
- Prototipado rapido en interfaces conversacionales: al no requerir trigger words, el LoRA encaja en asistentes de edicion donde el usuario escribe ordenes como "rota la camara 45 grados a la izquierda" y el sistema las aplica directamente.
- Demostraciones y contenido para redes: crear variaciones de angulo de un retrato o de una escena para publicaciones, con la advertencia de revisar la consistencia del resultado antes de publicarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al ser un LoRA sobre un modelo de difusion de edicion de imagen, los requisitos vendran determinados por el modelo base Qwen-Image-Edit-2509, no por el adaptador (0,2 GB de pesos).
- GPU recomendadas: no disponible. El autor no especifica modelos de GPU; solo menciona la ejecucion online en RunningHub y el proveedor Wavespeed.
- Compatibilidad con GPU de consumo: no disponible. Depende del modelo base y de la cuantizacion empleada.
- Opciones de despliegue: diffusers (libreria indicada en la model card), con el LoRA en la carpeta `models/loras`; el autor recomienda combinarlo con Qwen-Image-Lightning. Tambien se ofrece via `InferenceClient` con el proveedor Wavespeed y en el espacio online de RunningHub.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Edit-2509-Multiple-angles (este) | LoRA image-to-image | Qwen-Image-Edit-2509 | Control de camara por lenguaje natural, sin trigger words | Apache 2.0 | Hugging Face (repo de 0,2 GB) |
| Qwen-Image-Edit-2509 (modelo base) | Modelo de difusion para edicion | no aplica | Edicion por instrucciones; control de camara limitado e implicito | no disponible | Hugging Face (Qwen/Qwen-Image-Edit-2509) |
| Qwen-Image-Lightning | LoRA de aceleracion | Qwen-Image | Acelera la inferencia; no anade control de camara | no disponible | Hugging Face (lightx2v/Qwen-Image-Lightning) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Consistencia: el propio autor reconocio un problema de consistencia inestable entre la imagen de entrada y la de salida, y resubio una version con mas iteraciones de entrenamiento. No se garantiza que el problema este completamente resuelto.
- Idiomas: la model card ofrece ejemplos de instrucciones en chino e ingles; no se documenta el soporte de otros idiomas, por lo que el castellano no esta verificado.
- Datos tecnicos ausentes: no hay informacion sobre el dataset de entrenamiento, el numero de pasos, los parametros del LoRA ni la composicion de los pares de imagenes, lo que dificulta evaluar su robustez.
- Dependencia del modelo base: el adaptador requiere Qwen-Image-Edit-2509 y, segun el autor, tambien Qwen-Image-Lightning para un funcionamiento recomendado; no es autonomo.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede introducir detalles inexistentes en el sujeto o alterar su identidad al cambiar de angulo.
- Licencia: Apache 2.0 permite uso comercial, pero el autor solicita donaciones (PayPal) si se usa con fines comerciales; conviene revisar tambien la licencia del modelo base Qwen-Image-Edit-2509 antes de desplegarlo en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Duplicados: existen copias del mismo LoRA publicadas por otros usuarios (dx8152, svjack, hughugfarid), lo que puede generar confusion sobre la version canonica y su trazabilidad.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Uhvg856/Qwen-Edit-2509-Multiple-angles
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- LoRA complementario Qwen-Image-Lightning: https://huggingface.co/lightx2v/Qwen-Image-Lightning/tree/main
- Ejecucion online en RunningHub: https://www.runninghub.ai/post/1985311204883243009?inviteCode=rh-v1331
- Guia en video (YouTube): https://youtu.be/UGdW8W1MqW8
- Guia en video (Bilibili): https://www.bilibili.com/video/BV1oi1gBBEZV/
- Grupo de Discord: https://discord.gg/yVAVa43mWk
- Entrenamiento en ModelScope: https://www.modelscope.cn/aigc/modelTraining
- Duplicado de dx8152: https://huggingface.co/dx8152/Qwen-Edit-2509-Multiple-angles
- Duplicado de hughugfarid: https://huggingface.co/hughugfarid/Qwen-Edit-2509-Multiple-angles
- Pesos en svjack/Qwen_Image: https://huggingface.co/svjack/Qwen_Image/blob/main/qwen_image_edit_2509_multiple_angles.safetensors
