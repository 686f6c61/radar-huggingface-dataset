# WepeNerd/H3_Ripple

## Resumen

H3 Ripple es un adaptador LoRA para MiniMax H3 FL2VA, el modelo de generacion y edicion de video de MiniMax. Lo desarrolla WepeNerd y su funcion es propagar una edicion realizada sobre una o dos frames ancla a lo largo de un plano de video ya existente, dentro de un flujo de video-a-video. El adaptador se publica en Hugging Face como `WepeNerd/H3_Ripple` (0,3 GB) y se distribuye en formato safetensors, pensado para cargarse en ComfyUI junto con los pesos base de MiniMax H3.

El problema que resuelve es concreto: en lugar de regenerar un plano completo a partir de un prompt, el usuario edita manualmente (o con un modelo de edicion de imagen como Qwen Image 2.1) una o dos frames de referencia y Ripple propaga ese cambio al resto del clip manteniendo la coherencia temporal. Es una herramienta de postproduccion asistida, no un modelo fundacional: depende por completo de MiniMax H3 y de sus componentes auxiliares (text encoder y VAE de video).

La relevancia es practica para estudios pequenos y creadores que trabajan en ComfyUI: permite cambios localizados (vestuario, objetos, color, retoques) sin rehacer el plano. No hay informacion publica sobre arquitectura interna del LoRA, datos de entrenamiento ni benchmarks; la model card se limita a instrucciones de uso, ajustes de workflow y limitaciones cualitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3 FL2VA; arquitectura interna no disponible |
| Parametros totales | no disponible (repo de 0,3 GB, incluye pesos del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; en los workflows de ejemplo se procesan clips de 90 frames (3,75 s) y 124 frames (5,17 s) a 24 fps |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible (el prompt de propagacion es texto; idiomas del text encoder de H3 no especificados) |
| Licencia | no disponible en el repositorio; el modelo base se rige por la MiniMax H3 Community License Agreement |
| Formato de pesos | safetensors (`minimax_H3_Ripple-v1.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del adaptador mas alla de que es un LoRA de bajo rango aplicado sobre MiniMax H3 FL2VA. La model card no detalla rango, modulos objetivo, numero de tokens de entrenamiento, composicion del dataset ni si hubo tecnicas de alineacion como RLHF o DPO. Tampoco se indica si el entrenamiento uso pares video-editado o si se genero sinteticamente a partir de frames ancla editadas.

Lo que si se documenta es el modo de uso y los hiperparametros recomendados: fuerza del LoRA de 1.0, combinado con el H3 Turbo 4-step LoRA tambien a 1.0, muestreo con 4 pasos, sampler `euler`, scheduler `simple` y CFG 1. Los workflows de ejemplo generan a 1 MP y 24 fps; el flujo "Simple" usa 90 frames y un ancla, mientras que el flujo "Local Editor" usa 124 frames y dos anclas, con Qwen Image 2.1 a 25 pasos para la edicion de las frames. La innovacion tecnica destacable es el mecanismo de propagacion de ediciones entre anclas a lo largo de la linea temporal, implementado en los nodos de ComfyUI-WepeNerd (Ripple Clip, Ripple Apply, Ripple Output).

## Capacidades

- Edicion de video a video: propaga cambios realizados en una o dos frames ancla al resto de un plano existente.
- Colocacion flexible de anclas: permite situar las frames de referencia en distintos momentos de la linea temporal.
- Integracion con editores de imagen locales: soporta entradas editadas manualmente y salidas de modelos como Qwen Image 2.1.
- Generacion condicionada por texto: usa un prompt de propagacion por defecto en Ripple Apply; el cambio visual se describe en el editor de imagen, no en el prompt.
- Flujos de trabajo en ComfyUI: nodos propios (ComfyUI-WepeNerd) con comparacion fuente/resultado.
- Composicion con LoRA Turbo: funciona junto al H3 Turbo 4-step LoRA para reducir pasos de muestreo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking; el modelo es especificamente de edicion de video.

## Casos de uso

- Retoque de vestuario en un plano rodado: se edita una frame con el cambio de ropa y Ripple lo propaga al resto del clip, evitando regrabar o regenerar el plano completo. Adecuado para producciones con presupuesto limitado.
- Eliminacion o sustitucion de objetos: se marca el objeto en una o dos anclas y se propaga la eliminacion a lo largo del plano, util en postproduccion de contenido de archivo.
- Correccion de color localizada: se ajusta el tono en frames clave y se mantiene la continuidad cromatica en el resto del clip mediante la propagacion.
- Cambios de atrezo en publicidad: se modifican productos o elementos de escena en un spot ya grabado sin repetir el rodaje, usando el flujo Local Editor con Qwen Image 2.1.
- Prototipado rapido de variantes creativas: generar varias versiones de un mismo plano con ediciones distintas ancladas en momentos diferentes para comparar en cliente.
- Limpieza de continuidad en documental: corregir elementos anacronicos o no deseados en planos de archivo manteniendo el movimiento original.
- Integracion en pipelines de ComfyUI: automatizar la edicion por lotes de clips cortos (90-124 frames) mediante los workflows JSON incluidos y los nodos Ripple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base MiniMax H3 FL2VA, del text encoder y del VAE de video, no solo del LoRA (0,3 GB).
- GPU recomendadas: no especificadas. El flujo Local Editor anade Qwen Image 2.1, lo que incrementa los requisitos de memoria frente al flujo Simple.
- Ajuste en GPU de consumo: no confirmado. La model card sugiere reducir el tamano de salida (por defecto 1 MP) en Ripple Clip "si es necesario para tu hardware", lo que indica que en GPUs de gama media puede requerir recortes de resolucion o duracion.
- Opciones de despliegue: ComfyUI con la extension ComfyUI-WepeNerd; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de video).
- Latencia y throughput: no disponibles. Se conocen los ajustes de muestreo (4 pasos con Turbo, CFG 1) y el tamano de los clips de ejemplo (90 frames / 3,75 s y 124 frames / 5,17 s a 24 fps), pero no tiempos de ejecucion medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3 Ripple (WepeNerd) | LoRA de edicion video-a-video sobre MiniMax H3 | no disponible (repo 0,3 GB) | clips de 90-124 frames en ejemplos | no disponible en el repo; base bajo MiniMax H3 Community License | Hugging Face, 115 descargas, 12 likes |
| MiniMax H3 FL2VA (MiniMaxAI) | Modelo base de generacion/edicion de video | no disponible en la informacion proporcionada | no disponible | MiniMax H3 Community License Agreement | Hugging Face (modelo oficial) |
| Qwen Image 2.1 | Modelo de edicion de imagen (usado como editor de anclas) | no disponible en la informacion proporcionada | no aplica (imagen) | no disponible en la informacion proporcionada | Uso local dentro del workflow Local Editor |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a rol, licencia y disponibilidad.

## Limitaciones y advertencias

- Dependencia total del modelo base: requiere pesos compatibles de MiniMax H3 FL2VA, el text encoder H3 y el VAE de video; el LoRA por si solo no funciona.
- Dependencia de la extension ComfyUI-WepeNerd y de una instalacion actual de ComfyUI.
- La calidad del resultado depende de la filmacion de origen y de la consistencia de las anclas editadas; el propio autor advierte que el movimiento rapido, la oclusion y los cambios grandes de punto de vista dificultan la propagacion.
- Riesgo de cambios no deseados: los frames generados pueden alterar detalles fuera de la edicion pretendida.
- Alcance limitado a clips cortos en los ejemplos (3,75 s y 5,17 s); no se documenta comportamiento en planos largos.
- Licencia del adaptador no indicada en el repositorio; el uso comercial queda sujeto a la MiniMax H3 Community License Agreement del modelo base, cuyos terminos deben revisarse antes de produccion.
- No hay informacion sobre sesgos, idiomas soportados ni evaluaciones de robustez; al ser un modelo de video, los sesgos del modelo base (representacion de personas, escenas y estilos) se heredan.
- El flujo Local Editor anade requisitos de Qwen Image 2.1, su text encoder y su VAE, aumentando la complejidad de instalacion y el consumo de memoria.
- Repositorio con pocas descargas (115) y likes (12): ecosistema de soporte y validacion comunitaria limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WepeNerd/H3_Ripple
- Pesos del LoRA: https://huggingface.co/WepeNerd/H3_Ripple/resolve/main/minimax_H3_Ripple-v1.safetensors
- Demo y ejemplos: https://wepenerd.github.io/ComfyUI-WepeNerd/
- Guia de instalacion: https://wepenerd.github.io/ComfyUI-WepeNerd/#setup
- Repositorio de nodos ComfyUI-WepeNerd: https://github.com/WepeNerd/ComfyUI-WepeNerd
- Workflow H3 Ripple Simple: https://wepenerd.github.io/ComfyUI-WepeNerd/workflows/H3_Ripple_Simple.json
- Workflow H3 Ripple Local Editor: https://wepenerd.github.io/ComfyUI-WepeNerd/workflows/H3_Ripple_Local_Editor.json
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
