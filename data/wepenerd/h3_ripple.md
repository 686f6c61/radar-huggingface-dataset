# WepeNerd/H3_Ripple

## Resumen

H3 Ripple es un adaptador LoRA para MiniMax H3 FL2VA, el modelo de generacion de video de MiniMax, desarrollado por el usuario WepeNerd. Su funcion es propagar una edicion realizada sobre una o dos imagenes ancla (frames clave) a lo largo de un plano de video ya existente, de modo que el cambio visual se mantenga de forma coherente durante la secuencia. Se trata, por tanto, de una herramienta de video-to-video editing y no de un modelo generativo completo: requiere los pesos base de MiniMax H3 FL2VA, su text encoder y su VAE para funcionar.

El adaptador esta pensado para integrarse en ComfyUI mediante el paquete ComfyUI-WepeNerd, que aporta los nodos Ripple Clip y Ripple Apply, y se distribuye como un unico archivo safetensors de aproximadamente 0,3 GB. Los flujos de trabajo publicados combinan Ripple con el LoRA Pika H3 Flex y, en la variante de editor local, con Qwen Image 2.1 para generar las ediciones de los frames ancla sin salir del entorno local.

Su relevancia practica esta en el control preciso de la edicion: en lugar de regenerar el plano completo, el usuario modifica solo fotogramas clave y el LoRA guia la transformacion por el resto del clip. La informacion disponible no incluye detalles sobre la arquitectura interna del LoRA, el dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3 FL2VA |
| Parametros totales | no disponible (repo de 0,3 GB, incluye pesos del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base MiniMax H3) |
| Tipos de cuantizacion | safetensors; el LoRA Pika H3 Flex de referencia se distribuye en bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo; el modelo base se rige por la MiniMax H3 Community License Agreement |
| Formato de pesos | safetensors (`minimax_H3_Ripple-v1.safetensors`) |

## Arquitectura y entrenamiento

H3 Ripple es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar los pesos completos. El modelo base es MiniMax H3 FL2VA, un sistema de generacion de video de MiniMax orientado a la tarea de first-last-frame a video (FL2VA), segun la nomenclatura del autor. El adaptador se aplica junto con el LoRA Pika H3 Flex, ambos con fuerza 1.0 en los flujos de trabajo incluidos.

El mecanismo de funcionamiento consiste en seleccionar una o dos imagenes ancla dentro de una ventana temporal del clip, editarlas externamente o con Qwen Image 2.1, y dejar que Ripple propague esa edicion por el resto del plano. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se especifican innovaciones de decodificacion o atencion propias del adaptador; el muestreo se realiza con 6 pasos, sampler `lcm`, scheduler `simple` y CFG 1.

## Capacidades

- Edicion de video guiada por frames ancla: propaga cambios visuales desde una o dos imagenes editadas al resto de un plano existente.
- Video-to-video editing sobre material ya rodado, sin regenerar la secuencia completa.
- Control temporal: los anclas pueden colocarse en momentos concretos de la linea de tiempo.
- Integracion con ComfyUI mediante los nodos Ripple Clip y Ripple Apply del paquete ComfyUI-WepeNerd.
- Flujo de edicion externa: descarga de frames ancla, edicion en cualquier editor de imagen y subida de resultados.
- Flujo de editor local: edicion de ambos anclas con nodos de Qwen Image 2.1 dentro del propio grafo.
- Composicion con el LoRA Pika H3 Flex para el muestreo del video base.
- Salida de comparacion entre el clip fuente y el resultado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Postproduccion de cambio de vestuario: se editan uno o dos fotogramas clave para cambiar la ropa de un personaje y Ripple propaga el nuevo vestuario por el plano, manteniendo la coherencia temporal sin rehacer la grabacion.
- Correccion de color o ambiente en un plano concreto: se modifica la iluminacion o la paleta en los anclas y se extiende el ajuste al resto del clip, util para igualar tomas en montaje.
- sustitucion de elementos de atrezo o escenario: se edita un objeto o un fondo en los frames ancla y el LoRA lo mantiene a lo largo de la secuencia, adecuado para pruebas de concepto de direccion de arte.
- Prototipado rapido de efectos visuales: con 90 frames (3,75 s) en el flujo Simple y 124 frames (5,17 s) en el flujo con editor local a 24 fps, permite validar una idea de VFX antes de invertir en un pipeline completo.
- Edicion asistida por IA en local: el flujo Local Editor ejecuta Qwen Image 2.1 (25 pasos, sampler `euler`, CFG 1) y el render de H3 en una sola cola de ComfyUI, lo que facilita iterar sin servicios externos.
- Limpieza o retirada de objetos en tomas cortas: se marca el objeto en los anclas y se propaga su eliminacion, siempre que el movimiento sea moderado y no haya oclusiones severas.
- Generacion de variantes de un mismo plano para pruebas A/B: partiendo del mismo clip fuente, se aplican ediciones distintas en los anclas y se obtienen versiones alternativas del plano para evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,3 GB, pero la inferencia requiere los pesos completos de MiniMax H3 FL2VA, su text encoder y su VAE, cuyo tamano no se detalla en la informacion disponible.
- VRAM estimada para inferencia: no disponible. Depende del modelo base y de la resolucion y duracion del clip.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no confirmada. La model card sugiere reducir el tamano de salida en Ripple Clip "si es necesario para tu hardware", lo que indica que la configuracion por defecto (1 MP) puede ser exigente.
- Despliegue: ComfyUI con el paquete ComfyUI-WepeNerd; no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de video.
- Latencia y throughput: no disponibles. Los flujos usan 6 pasos de muestreo con sampler `lcm` y CFG 1, lo que reduce el coste frente a configuraciones de mas pasos, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3 Ripple (WepeNerd) | LoRA de edicion de video sobre MiniMax H3 FL2VA | no disponible (repo 0,3 GB) | no disponible | no disponible en el repo; base bajo MiniMax H3 Community License | Hugging Face, 4.390 descargas, 61 likes |
| MiniMax H3 FL2VA (MiniMaxAI) | Modelo base de generacion de video | no disponible | no disponible | MiniMax H3 Community License Agreement | Hugging Face |
| Pika H3 Flex LoRA (Comfy-Org) | LoRA complementario para MiniMax H3 FL2VA | no disponible | no disponible | no disponible | Hugging Face (Comfy-Org/MiniMax-H3) |
| Qwen Image 2.1 | Modelo de edicion de imagen usado en el flujo local | no disponible | no disponible | no disponible | Uso local via ComfyUI |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados dependen en gran medida del material de origen y de la consistencia de las imagenes ancla editadas; anclas incoherentes producen una propagacion deficiente.
- El movimiento rapido, las oclusiones y los cambios grandes de punto de vista dificultan la propagacion de la edicion a lo largo del plano.
- El modelo puede alterar detalles fuera de la edicion pretendida en los fotogramas generados.
- Requiere mantener el encuadre y la composicion de los anclas al editarlos; no se debe cambiar la instruccion de propagacion por defecto de Ripple Apply.
- No es un modelo autonomo: necesita los pesos de MiniMax H3 FL2VA, el text encoder, el VAE y, en el flujo local, Qwen Image 2.1 con su encoder y VAE.
- La licencia del adaptador no esta indicada en el repositorio; el uso comercial queda sujeto a los terminos de la MiniMax H3 Community License Agreement del modelo base, que deben revisarse antes de producción.
- No se documentan sesgos, cobertura idiomatica ni riesgos de alucinacion especificos; al ser un modelo de video, el riesgo principal es la deriva visual no deseada en los fotogramas generados.
- La duracion por defecto es corta (3,75 s en Simple, 5,17 s en Local Editor a 24 fps); clips mas largos requieren ajustes no documentados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WepeNerd/H3_Ripple
- Descarga del LoRA: https://huggingface.co/WepeNerd/H3_Ripple/resolve/main/minimax_H3_Ripple-v1.safetensors
- Demo y ejemplos: https://wepenerd.github.io/ComfyUI-WepeNerd/
- Guia de instalacion: https://wepenerd.github.io/ComfyUI-WepeNerd/#setup
- Repositorio ComfyUI-WepeNerd: https://github.com/WepeNerd/ComfyUI-WepeNerd
- Workflow H3 Ripple Simple: https://wepenerd.github.io/ComfyUI-WepeNerd/workflows/H3_Ripple_Simple.json
- Workflow H3 Ripple Local Editor: https://wepenerd.github.io/ComfyUI-WepeNerd/workflows/H3_Ripple_Local_Editor.json
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- LoRA Pika H3 Flex: https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/loras/pika_h3_flex_fl2va_v1_bf16.safetensors
