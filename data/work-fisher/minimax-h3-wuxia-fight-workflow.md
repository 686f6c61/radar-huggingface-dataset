# Work-Fisher/MiniMax-H3-Wuxia-Fight-Workflow

## Resumen

MiniMax-H3-Wuxia-Fight-Workflow es un repositorio de HuggingFace publicado por el usuario Work-Fisher que contiene un workflow de ComfyUI para MiniMax H3, el modelo de generacion de video con audio sincronizado de MiniMax (Hailuo AI 3.0). No se trata de un modelo de pesos: el repositorio aloja el fichero de workflow y los enlaces de descarga de los componentes necesarios, que se obtienen de sus fuentes originales. El pipeline declarado es image-to-video y los tags incluyen video-generation, comfyui-workflow y minimax-h3.

El workflow esta especializado en escenas de artes marciales (wuxia) de alta dinamica de movimiento. Su diseno es de dos pasadas: la primera genera un borrador de movimiento y composicion a baja resolucion; a continuacion un upscaler latente aprendido amplia el resultado por 1,5; y la segunda pasada refina el detalle a alta resolucion. Un nodo de previsualizacion de la pasada 1 permite cancelar la generacion de forma temprana si el movimiento no es el deseado.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia. Los idiomas indicados son ingles y chino. Su relevancia practica es la de un caso de referencia reproducible para quien quiera montar generacion de video con audio en local en ComfyUI, aunque depende de seis nodos personalizados y de 43,9 GB de ficheros de modelo distribuidos por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio contiene un workflow de ComfyUI, no pesos; el modelo subyacente es MiniMax H3) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que MiniMax H3 sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (modelo de difusion), nvfp4 awq (text encoder), fp16 (VAE de video), fp32 (VAE de audio y upscaler latente), bf16 (LoRA turbo) |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors (ficheros de modelo referenciados); el repositorio en si contiene el fichero de workflow |
| Tipo de artefacto | Workflow de ComfyUI (no modelo) |
| Version minima de ComfyUI | 0.36.0 o superior |
| Entorno probado | ComfyUI 0.36.0, Python 3.12, PyTorch 2.10 + CUDA 13.0 |
| Nodos personalizados requeridos | 6 |
| Ficheros de modelo requeridos | 12 ficheros, 43,9 GB en total |
| Fecha de creacion | 2026-09-30 |

## Arquitectura y entrenamiento

El repositorio no describe ni entrena ninguna arquitectura propia: es un grafo de ejecucion para ComfyUI sobre el modelo MiniMax H3, que en las fuentes consultadas se presenta como un modelo multimodal nativo de generacion de video 2K con audio estereo 3D sincronizado. El workflow implementa una estrategia de dos pasadas con un upscaler latente intermedio entrenado (fichero `h3_upscaler_sharpness_2000steps_v0.1_fp32.safetensors`, 1,29 GB) que amplia la representacion latente por 1,5 antes del refinado final.

La cadena de modelos incluye un text encoder Qwen3-VL de 32B en cuantizacion nvfp4 awq (14,61 GB), un modelo de difusion hibrido para text-to-video, first-last-frame-to-video y reference-to-video en int8 (19,53 GB), dos VAE separados para video y audio, un semantic bridge de logica de accion (0,02 GB) y una pila de LoRAs especificos: turbo de 4 pasos a 768p, un LoRA de combate (H3_Combat_V2), uno de gun fu, uno de reparacion de continuidad de movimiento y un slider de velocidad. No se documentan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO sobre el modelo base. La innovacion tecnica documentada es de inferencia: atencion de bajo consumo de VRAM mediante el parche Sage de KJNodes, feed-forward troceado, soporte de Sol-Attn integrado en los nodos de T8 y previsualizacion temprana de la primera pasada.

## Capacidades

- Generacion de video a partir de imagen de referencia (image-to-video) con audio generado de forma conjunta.
- Especializacion en coreografias de artes marciales y combate cuerpo a cuerpo de alta dinamica, con LoRAs dedicados a combate, gun fu y continuidad de movimiento.
- Generacion de audio sincronizado mediante un VAE de audio independiente en fp32, orientado a respiracion e impactos en las escenas descritas por el autor.
- Control de velocidad de generacion mediante LoRA (`H3_speed_slider_1.1`) y variante turbo destilada a 4 pasos.
- Reparacion de continuidad de movimiento entre fotogramas con el LoRA `Motion_Repair`.
- Semantic bridge de logica de accion (`BUNNY_H3_ActionLogic_Bridge_V1_T8_Compat`) para estructurar la semantica de la pelea.
- Previsualizacion de la pasada 1 con cancelacion temprana si la composicion de movimiento no es correcta.
- Prompts en ingles y chino, con prefijo fijo en ingles concatenado al prompt del usuario mediante `ComfyUI-utils-nodes`.
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning: es un pipeline de generacion de video, no un modelo de lenguaje conversacional.

## Casos de uso

- Previsualizacion de escenas de accion en preproduccion audiovisual: el flujo permite generar un borrador rapido a baja resolucion, revisarlo en el nodo de preview de la pasada 1 y cancelar antes de gastar computo en el refinado a alta resolucion.
- Creacion de prototipos de coreografia wuxia a partir de dos imagenes de referencia: el sistema esta ajustado para secuencias de dos personas con identidades consistentes, segun las descripciones de terceros que citan el workflow original.
- Generacion de contenido para redes sociales y canales de video corto, con audio integrado, evitando un pipeline separado de doblaje o foley.
- Storyboarding animado para equipos de guion: convertir un frame clave de una pelea en un plano con movimiento y sonido para validar ritmo y encuadre.
- Investigacion en generacion de video condicionada por imagen: la combinacion de upscaler latente aprendido, semantic bridge y LoRAs apilables permite estudiar el efecto de cada componente de forma aislada.
- Pruebas de despliegue local en hardware de gama de consumo: el autor reporta funcionamiento en una RTX 4070 Ti de 12 GB con 32 GB de RAM, lo que sirve como referencia para validar tecnicas de ahorro de memoria (Sage attention, feed-forward troceado).
- Reproduccion y ajuste fino de movimiento: el LoRA de reparacion de continuidad y el slider de velocidad permiten corregir tomas con artefactos de movimiento sin regenerar desde cero.
- Generacion de material para videojuegos o animatica de combate, usando los LoRA de combate y gun fu como presets de estilo de accion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU NVIDIA obligatoria segun el autor. Entorno probado: RTX 4070 Ti de 12 GB de VRAM con 32 GB de RAM del sistema.
- Tamano total de los 12 ficheros de modelo: 43,9 GB en disco, de los cuales 19,53 GB corresponden al modelo de difusion int8 y 14,61 GB al text encoder Qwen3-VL 32B en nvfp4 awq.
- No se publican estimaciones de VRAM por cuantizacion mas alla del caso probado de 12 GB, que implica descarga parcial de pesos a RAM y tecnicas de ahorro de memoria.
- Tecnicas de ahorro de memoria incluidas: atencion de bajo consumo VRAM y feed-forward troceado de ComfyUI-KJNodes, parche Sage (`sageattention`) y Sol-Attn integrado en los nodos de T8.
- Dependencias de software: ComfyUI 0.36.0 o superior, Python 3.12, PyTorch 2.10 con CUDA 13.0, paquetes `sageattention` y `comfy-kitchen`.
- Nodos personalizados requeridos: comfyui-minimax-h3-audio-T8 1.86.0, ComfyUI-KJNodes 1.5.0, ComfyUI-VideoHelperSuite 1.7.9, ComfyUI_Comfyroll_CustomNodes, ComfyUI-utils-nodes 1.4.2, ComfyUI_LayerStyle 2.0.42.
- Opciones de despliegue: exclusivamente ComfyUI segun la informacion disponible. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles. La existencia de un LoRA turbo destilado a 4 pasos a 768p sugiere una reduccion del numero de pasos de muestreo, pero no se aportan cifras de tiempo por clip.

## Comparativa con modelos similares

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 Wuxia Fight Workflow (Work-Fisher) | No disponible (workflow sobre MiniMax H3) | No disponible | No se han publicado benchmarks | no disponible | HuggingFace, 0 descargas |
| Otros workflows de ComfyUI para MiniMax H3 | No disponible | No disponible | No disponible | No disponible | Repositorios de terceros citados en la busqueda (Alissonerdx, t8star, JOKER141, lightx2v) |
| Alternativas de generacion de video open source de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos comparativos verificables de parametros, contexto o rendimiento frente a alternativas equivalentes.

## Limitaciones y advertencias

- El repositorio no contiene pesos: solo el fichero de workflow y enlaces. Los 12 ficheros de modelo (43,9 GB) se descargan de repositorios de terceros, con el riesgo de disponibilidad y de cambios de version que ello implica.
- No se declara licencia. Esto impide determinar si el uso comercial es posible y es un caveat bloqueante para produccion.
- Dependencia de seis nodos personalizados con versiones concretas probadas; actualizaciones de esos nodos pueden romper el grafo.
- Conflicto documentado de nodos: instalar `sol_attn_minimax_pr117` o `ComfyUI-SolAttn_triton` registra el mismo nodo, sobrescribe la version de T8 y provoca un error `sol_attn` en cada paso.
- Requiere ComfyUI 0.36.0 o superior; versiones anteriores no estan soportadas.
- El autor solo ha validado el flujo en hardware NVIDIA. No se documenta soporte para AMD, Intel o Apple Silicon.
- Riesgo de artefactos en el movimiento y en la coherencia anatomica en escenas de alta dinamica, motivo por el cual el propio workflow incluye un LoRA de reparacion de continuidad y un nodo de cancelacion temprana.
- Los idiomas de prompt soportados son ingles y chino; no se documenta comportamiento con prompts en castellano ni en otros idiomas.
- Ausencia total de benchmarks publicados: no hay datos de calidad objetiva (FVD, CLIP, consistencia de identidad) que permitan comparar con alternativas.
- Los datos de duracion de 15 segundos, consistencia de identidades y uso de 6 a 9 imagenes de entrada proceden de publicaciones de terceros sobre variantes derivadas del workflow, no de la model card del autor.
- Sin descargas ni likes registrados en el momento de la consulta, por lo que no existe validacion de la comunidad sobre su funcionamiento.
- Fecha de creacion y actualizacion del repositorio (2026-09-30) posterior a la mayoria de referencias disponibles, lo que limita la verificacion independiente.

## Enlaces

- HuggingFace: https://huggingface.co/Work-Fisher/MiniMax-H3-Wuxia-Fight-Workflow
- Cuenta de YouTube del autor: https://www.youtube.com/@Work-Fisher
- Cuenta de Bilibili del autor: https://space.bilibili.com/17919458
- Nodo principal: https://github.com/T8mars/comfyui-minimax-h3-audio-T8
- ComfyUI-KJNodes: https://github.com/kijai/ComfyUI-KJNodes
- ComfyUI-VideoHelperSuite: https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite
- ComfyUI_Comfyroll_CustomNodes: https://github.com/Suzie1/ComfyUI_Comfyroll_CustomNodes
- ComfyUI-utils-nodes: https://github.com/zhangp365/ComfyUI-utils-nodes
- ComfyUI_LayerStyle: https://github.com/chflame163/ComfyUI_LayerStyle
- Modelo de difusion hibrido int8: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models
- Text encoder y VAE (organizacion Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Text encoder en ModelScope: https://www.modelscope.cn/models/Comfy-Org/MiniMax-H3
- Upscaler latente: https://huggingface.co/Alissonerdx/Minimax-H3-ComfyUI
- Semantic bridge: https://huggingface.co/t8star/Semantic-Bridge-Comfy
- LoRA turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- LoRA turbo v4 y compatibilidad T8: https://huggingface.co/t8star/minimax_h3_turbo_v4_step600_ema_DasiwaREF2VAHybridV1_0_curveproj1025_compat_v001
- LoRA de combate: https://huggingface.co/JOKER141/MiniMax-H3-Combat-Base-V2
- LoRA de gun fu: https://huggingface.co/JOKER141/MiniMaxH3-GunFu-Gunfight-LORA
- LoRA de reparacion de movimiento: https://huggingface.co/JOKER141/MiniMax-H3-General-Motion-Continuity-Repair
- Descripcion de una variante ampliada del workflow: https://www.runninghub.ai/post/2095134699986448385
- Detalle de la variante en RunningHub: https://www.runninghub.ai/ai-detail/2095319441696395265
- Hub comunitario de MiniMax H3 con workflows de ComfyUI: https://github.com/ai-models-lab/minimax-h3
- Guia de workflows y tutorial de MiniMax H3 en ComfyUI: https://design.minimax.io/tools/minimax-h3-comfyui
- Video sobre escenas de combate y movimiento rapido en local: https://www.youtube.com/watch?v=uhG307gPHco
