# ulasZoi/smolvla_pickcube_bs64_small

## Resumen

X-VLA (smolvla_pickcube_bs64_small) es una política robótica de visión-lenguaje-acción (VLA) publicada por el usuario ulasZoi en HuggingFace, construida sobre el framework X-VLA y afinada desde el modelo base lerobot/xvla-base. X-VLA se define como un framework VLA con *soft prompting* y *flow matching* que trata cada configuración de robot o hardware como una "tarea" codificada mediante un conjunto reducido de embeddings de Soft Prompt aprendibles, lo que permite que un único modelo reconcilie morfologías, sensores y espacios de acción diversos.

Este checkpoint concreto es un ajuste fino especializado en una única tarea de manipulación: "pick up the cube", sobre un robot de tipo `so_follower` (familia SO-100/SO-101 de LeRobot) con una cámara frontal. El modelo consume tres flujos visuales (dos a 256x256 y uno a 224x224) más un vector de estado de 8 dimensiones, y produce un vector de acción continuo de 6 dimensiones. Cuenta con 879.687.256 parámetros (aproximadamente 0,88 mil millones) y se distribuye en safetensors con licencia Apache 2.0.

Su relevancia práctica es acotada pero clara: es un ejemplo reproducible de ajuste fino de una política VLA de menos de mil millones de parámetros sobre un dataset de imitación pequeño (243 episodios, 76.011 fotogramas a 30 FPS), ejecutable en hardware de consumo. No obstante, el propio autor no ha publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo no está verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con soft prompting y flow matching (framework X-VLA) |
| Parametros totales | 879.687.256 (~0,88 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles (pesos distribuidos en safetensors; no se especifica la precision) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `front` |
| Entradas | `observation.images.image` (3, 256, 256); `observation.images.image2` (3, 256, 256); `observation.images.image3` (3, 224, 224); `observation.state` (8,) |
| Salidas | `action` (6,) |
| Libreria | lerobot |
| Modelo base | lerobot/xvla-base |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

X-VLA es un framework VLA con *soft prompting* y *flow matching*. La idea central es que cada robot o configuración de hardware se modela como una "tarea" que se codifica con un conjunto pequeño de embeddings de Soft Prompt aprendibles; de este modo, un único conjunto de pesos puede adaptarse a morfologías, sensores y espacios de acción distintos sin duplicar el modelo completo. La generación de acciones se formula como un problema de *flow matching*, un enfoque generativo continuo habitual en políticas de imitación modernas. El modelo base del que deriva este checkpoint es lerobot/xvla-base, publicado por el equipo de LeRobot.

El ajuste fino se realizó sobre el dataset ulasZoi/smolvla_pickcube_all, compuesto por 243 episodios y 76.011 fotogramas capturados a 30 FPS, todos ellos correspondientes a la tarea única "pick up the cube". La configuración de entrenamiento declarada es de 20.000 pasos, con un tamaño de lote de 16, optimizador `xvla-adamw`, tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni de fases de alineación posteriores al entrenamiento por imitación, algo esperable en este tipo de políticas robóticas. Tampoco se detalla el número total de tokens de entrenamiento ni la composición completa del corpus multimodal del modelo base.

Conviene señalar una discrepancia entre el nombre del repositorio (`bs64`) y el tamaño de lote declarado en la model card (16); este dato no está aclarado por el autor.

## Capacidades

- Generación de acciones motoras continuas de 6 grados de libertad para un robot `so_follower`, a partir de observaciones visuales y de estado.
- Ejecución de una tarea de manipulación concreta: "pick up the cube" (recoger un cubo).
- Fusión multimodal de tres flujos de imagen (dos de 256x256 y uno de 224x224) con un vector de estado propioceptivo de 8 dimensiones.
- Política de imitación entrenada de extremo a extremo, sin necesidad de planificación simbólica explícita en tiempo de inferencia.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue en robot con `lerobot-rollout`.
- Soporte de *fine-tuning* posterior desde el modelo base lerobot/xvla-base sobre nuevos datasets de imitación.
- Soporte de tool calling / function calling: no disponible (no es una capacidad propia de este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso deliberativo: no disponible.
- Capacidades multilingües: no disponibles ni documentadas; el prompt de tarea utilizado es una cadena fija en inglés ("pick up the cube").
- Capacidades especiales: no se documentan modos de "pensamiento", visión general de propósito abierto ni procesamiento de audio.

## Casos de uso

- Manipulación robótica de sobremesa: recogida de objetos cúbicos en un entorno controlado con un robot SO-100/SO-101 y una cámara frontal, que es exactamente el escenario sobre el que se ha entrenado el modelo.
- Prototipado e investigación en políticas VLA: sirve como punto de partida reproducible para estudiar cómo se comportan los mecanismos de soft prompting de X-VLA al ajustarse a una tarea única con un dataset pequeño.
- Docencia y formación en robótica de imitación: al ser un modelo de menos de mil millones de parámetros y 1,8 GB, puede desplegarse y ejecutarse en equipos de laboratorio modestos, lo que lo hace adecuado para prácticas guiadas con LeRobot.
- Base para ajustes finos adicionales: dado que hereda de lerobot/xvla-base y usa licencia Apache 2.0, puede reentrenarse con `lerobot-train` sobre datasets propios para tareas de picking relacionadas (otros objetos, otras posiciones, otras cámaras).
- Validación de pipelines de datos: la combinación de dataset, script de entrenamiento y configuración declarada permite reproducir y auditar un flujo completo de imitación, útil para comprobar la integridad de una tubería de recogida de datos con LeRobot.
- Pruebas de integración hardware-software: sirve para verificar la calibración del robot `so_follower`, el mapeo de nombres de cámara (`observation.images.image`, `image2`, `image3`) y la frecuencia de control antes de invertir en datasets mayores.
- Demostraciones de bajo coste en robótica open source: el tamaño reducido del checkpoint facilita su distribución y su ejecución en eventos o repositorios de ejemplo sin requerir clústeres de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de Evaluación con la nota explícita "_No evaluation results have been provided for this policy yet._", por lo que no existe tasa de éxito declarada en robot real ni en simulación.

| Benchmark | Resultado |
|---|---|
| Tasa de exito en "pick up the cube" | No disponible |
| Otros benchmarks (MMLU, HumanEval, GSM8K, etc.) | No aplica / no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en fp32, en torno a 1,8 GB en bf16/fp16 e inferior a 1 GB en int8. Estas cifras son estimaciones derivadas del recuento de parámetros (879,7 M) y del tamaño del repositorio (1,8 GB); no están confirmadas por el autor.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM. Una RTX 3060, RTX 4060 o superior es suficiente. Una RTX 4090 ofrece un margen amplio; A100 y H100 son innecesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo con 4 GB o más de VRAM. También es candidato razonable para plataformas embebidas tipo NVIDIA Jetson Orin, aunque no hay confirmación del autor.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--strategy.type=base` y `--policy.path=ulasZoi/smolvla_pickcube_bs64_small`. El entrenamiento y el ajuste fino se realizan con `lerobot-train`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no son aplicables a políticas VLA de LeRobot.
- Latencia y throughput estimados: no disponibles. El dataset se capturó a 30 FPS, pero la model card no especifica la frecuencia de inferencia alcanzable en robot ni el tiempo por paso de acción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ulasZoi/smolvla_pickcube_bs64_small | 879.687.256 | No disponible | Sin evaluacion publicada | Apache 2.0 | HuggingFace (0 descargas, 0 likes en el momento de la ficha) |
| lerobot/xvla-base (modelo base) | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otras politicas VLA de la familia LeRobot (p. ej. SmolVLA) | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas de la misma categoria. El unico punto de comparacion verificable es el modelo base lerobot/xvla-base, del que este checkpoint es un ajuste fino especializado en una tarea unica y para una morfologia concreta.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no ha publicado ninguna tasa de exito ni prueba en robot real, por lo que se desconoce si la politica funciona de forma fiable.
- Especializacion extrema: el modelo solo ha visto la tarea "pick up the cube" sobre un robot `so_follower` con cámara frontal; es previsible que no generalice a otras tareas, objetos, posiciones o morfologias sin un nuevo ajuste fino.
- Dependencia del mapeo de observaciones: las entradas esperadas son exactamente tres flujos visuales y un vector de estado de 8 dimensiones con nombres concretos (`observation.images.image`, `image2`, `image3`, `observation.state`). Cualquier discrepancia en los nombres o en las resoluciones provocara fallos en la ejecucion.
- Dataset pequeno y de un solo operador: 243 episodios y 76.011 fotogramas suponen un volumen reducido, con el consiguiente riesgo de sobreajuste a condiciones de iluminacion, fondo y posicion de objeto concretas.
- Riesgo de alucinacion motora: al ser una politica generativa basada en flow matching, puede producir trayectorias plausibles pero fisicamente invalidas ante entradas fuera de distribucion, con riesgo para el robot y el entorno.
- Idiomas y capacidades cognitivas: no hay soporte multilingue documentado ni capacidades de razonamiento general, tool calling o planificacion; no debe presentarse como un asistente conversacional.
- Discrepancia de configuracion: el nombre del repositorio indica `bs64` mientras que la model card declara un tamano de lote de 16. Conviene verificar la configuracion real antes de reproducir el entrenamiento.
- Estado de publicacion: el repositorio registra 0 descargas y 0 likes, sin historial de uso ni mantenimiento conocido, lo que reduce la confianza en su soporte a largo plazo.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni asume responsabilidad; el uso en produccion sobre hardware real exige validacion propia y medidas de seguridad fisica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ulasZoi/smolvla_pickcube_bs64_small
- Dataset de entrenamiento: https://huggingface.co/datasets/ulasZoi/smolvla_pickcube_all
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ulasZoi/smolvla_pickcube_all
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper de X-VLA (arXiv): https://arxiv.org/abs/2510.10274
- Paper de X-VLA (HuggingFace Papers): https://huggingface.co/papers/2510.10274
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Cita recomendada: Cadene, R. et al. (2024), LeRobot (ver BibTeX completo en la model card del repositorio)
