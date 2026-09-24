# ssanz/modelo_record-deburring

## Resumen

`ssanz/modelo_record-deburring` es una política de robótica basada en ACT (Action Chunking with Transformers), el método de aprendizaje por imitación presentado en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). No es un modelo de lenguaje: es un controlador visuomotor entrenado para mapear observaciones (estado de las articulaciones e imágenes de dos cámaras) a comandos de acción de un brazo robótico. El modelo se ha entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robots reales, y se distribuye en formato safetensors con 51.668.614 parámetros (unos 51,7 M) y un repositorio de 0,2 GB.

El modelo está asociado al robot `so_follower` (familia SO-100/SO-101) con dos cámaras de entrada, `entorno` y `lateral`, a resolución 240x320, y produce un vector de acción de dimensión 6. Se entrenó sobre el dataset `cualquier/cosa`, un conjunto muy reducido: 5 episodios, 3.052 fotogramas a 30 FPS (aproximadamente 101 fotogramas, es decir, unos 3,4 segundos por episodio) para una única tarea descrita como "Grab the white cube".

Su relevancia es la de un ejemplo típico de política ACT de bajo coste: entrena en miles de pasos (3.000) y cabe en una GPU de consumo, lo que lo hace útil como punto de partida reproducible para experimentos de imitación en brazos SO-100/SO-101. Conviene señalar dos avisos: el nombre del repositorio sugiere una tarea de desbarbado ("deburring") que no coincide con la tarea declarada en la model card, y el propio autor no ha publicado resultados de evaluación. Además, la búsqueda web realizada no devolvió ninguna fuente relevante sobre este modelo (solo resultados sin relación), por lo que toda la información proviene de la model card y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con encoder visual ResNet y variable latente estilo VAE, segun el paper arXiv:2304.13705 |
| Parametros totales | 51.668.614 (aproximadamente 51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). Entrada fija: estado de 6 dimensiones y dos imagenes de (3, 240, 320). El tamano del chunk de acciones no se especifica en la model card |
| Tipos de cuantizacion | No disponible (no se documentan versiones cuantizadas; pesos en safetensors) |
| Idiomas soportados | No aplica / no disponible: la politica no consume lenguaje, solo observaciones visuales y de estado |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria LeRobot) |
| Tipo de modelo | Politica de robotica (pipeline_tag: robotics), aprendizaje por imitacion |
| Robot objetivo | so_follower |
| Camaras de entrada | entorno, lateral |
| Entradas | observation.state (6,); observation.images.entorno (3, 240, 320); observation.images.lateral (3, 240, 320) |
| Salidas | action (6,) |
| Dataset de entrenamiento | cualquier/cosa (5 episodios, 3.052 fotogramas, 30 FPS, tarea "Grab the white cube") |
| Version de LeRobot | 0.6.2 |
| Descargas / likes en el Hub | 0 / 0 |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion (segun el Hub) | 2026-09-24 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion supervisado que, en lugar de predecir una unica accion por paso de tiempo, predice un *chunk* de acciones futuras (de ahi "action chunking"). La arquitectura combina un encoder visual tipo ResNet que procesa las imagenes, un encoder de estado, una variable latente estilo VAE que captura la variabilidad del estilo humano en los datos de teleoperacion, y un transformer encoder-decoder que genera la secuencia de acciones. Este diseno reduce el problema de horizonte largo y mitiga el error de compounding que sufren las politicas paso a paso. Los detalles concretos de esta instancia (tamano del chunk, configuracion exacta del backbone visual, dimensiones internas) no se especifican en la model card.

El entrenamiento se realizo con LeRobot 0.6.2 durante 3.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. Los datos proceden de teleoperacion sobre un robot `so_follower` con dos camaras, recogidos a 30 FPS y almacenados en el dataset `cualquier/cosa`. Con 3.052 fotogramas y 5 episodios, el volumen de datos es muy bajo incluso para los estandares de ACT, lo que limita la generalizacion fuera de las condiciones de grabacion. No se documenta ningun tipo de RLHF, DPO ni ajuste posterior: es exclusivamente aprendizaje por imitacion offline.

## Capacidades

- Generacion de acciones de control de 6 grados de libertad a partir de observaciones visuales y de estado del robot.
- Ejecucion de una tarea de manipulacion concreta ("Grab the white cube") en el robot para el que fue entrenado.
- Percepcion visual dual: procesa simultaneamente las vistas `entorno` y `lateral` a 240x320.
- Aprendizaje por imitacion a partir de datos de teleoperacion, sin necesidad de recompensas ni simulador.
- Ejecucion de rollouts autonomos mediante la CLI `lerobot-rollout` con estrategia `base`.
- Capacidad de reentrenamiento: la misma receta (`lerobot-train --policy.type=act`) permite reproducir o extender el entrenamiento con otros datos.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de modo "thinking", ni capacidades de audio, ni comprension de lenguaje natural (la tarea se fija externamente en el script de rollout).
- No es multilingue: no procesa texto.

## Casos de uso

- Manipulacion pick-and-place en brazo SO-100/SO-101: la politica puede ejecutar la tarea de recogida del cubo blanco en el robot `so_follower`, con las mismas camaras y montaje usados en el entrenamiento.
- Banco de pruebas reproducible de aprendizaje por imitacion: sirve como referencia minima para medir cuanto mejora o empeora un ACT al variar el numero de episodios, el learning rate o el numero de pasos, dado que su configuracion completa esta documentada.
- Punto de partida para fine-tuning con datos propios: el repositorio incluye el comando `lerobot-train` con `--policy.type=act`, de modo que un equipo puede reentrenar la politica con su propio dataset y comparar contra esta version base.
- Demostraciones educativas de robotica: con 51,7 M de parametros y 0,2 GB de pesos, se puede ejecutar en hardware modesto y usar en talleres o cursos sobre LeRobot sin infraestructura dedicada.
- Investigacion en chunking de acciones: permite experimentar con el efecto del tamano de chunk y de la ventana de observacion sobre la tasa de exito en tareas de agarre.
- Prototipado de automatizacion en laboratorio para tareas de coger y colocar objetos de forma rigida y posicion fija, donde la variabilidad del entorno es baja.
- Validacion de pipelines de datos de teleoperacion: al estar vinculado a un dataset de 5 episodios y 3.052 fotogramas, es util para verificar de extremo a extremo el flujo de grabacion, visualizacion y entrenamiento de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica (*"No evaluation results have been provided for this policy yet"*), por lo que no existen tasas de exito en robot real, ni comparaciones numericas con otras politicas. Tampoco se dispone de metricas de perdida de entrenamiento ni de curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 0,2-0,5 GB en fp32 para los 51,7 M de parametros, mas el coste de los encoders visuales y de las activaciones; el repositorio completo ocupa 0,2 GB. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas gamas de consumo. El paper de ACT usa hardware de gama media-alta de generacion Turing, pero la model card no especifica el hardware de entrenamiento ni de inferencia de esta instancia.
- Cabe en GPU de consumo: si, es esperable que funcione en tarjetas tipo RTX 3060/4060/4090 e incluso en CPU para inferencia, dado el reducido numero de parametros. No hay cifras oficiales de rendimiento.
- Opciones de despliegue: la via documentada es la CLI de LeRobot (`lerobot-rollout`), que carga la politica en PyTorch desde safetensors. Tambien es viable cargar la politica con la API de Python de LeRobot y ejecutarla en un bucle propio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. En control robótico el requisito practico es sostener el bucle de control a 30 FPS (33 ms por paso), coherente con la frecuencia de grabacion del dataset; no se publican mediciones de latencia.
- Requisitos adicionales: el robot `so_follower` calibrado, dos camaras configuradas como `entorno` y `lateral`, y un puerto serie disponible para el brazo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ssanz/modelo_record-deburring | ACT (imitacion, chunking) | 51,7 M | Estado (6,) + 2 imagenes 240x320 | Apache 2.0 | Hugging Face, via LeRobot |
| Diffusion Policy (Chi et al.) | Imitacion por difusion | No disponible | Estado + imagenes | No disponible en la informacion | Implementado en LeRobot, sin checkpoint equivalente identificado |
| SmolVLA | VLA (vision-lenguaje-accion) | No disponible | Imagenes + instruccion en lenguaje | No disponible en la informacion | Hugging Face, via LeRobot |
| pi0 / pi0.5 | VLA de proposito general | No disponible | Imagenes + lenguaje | No disponible en la informacion | Hugging Face, via LeRobot |

La comparacion cualitativa es clara: ACT es una politica ligera y especifica de tarea, entrenada por imitacion pura sobre un embodiment concreto, mientras que las alternativas VLA (SmolVLA, pi0) son modelos mucho mayores, preentrenados de forma general y condicionados por lenguaje, con un coste de inferencia y de datos muy superior. Diffusion Policy comparte el enfoque de predecir secuencias de acciones, pero mediante un proceso de difusion en lugar de un transformer con chunking. No se dispone de cifras comparativas de exito ni de parametros para las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasa de exito publicada, por lo que no se puede afirmar que la politica funcione de forma fiable ni siquiera en la tarea declarada.
- Datos de entrenamiento minimos: 5 episodios y 3.052 fotogramas (unos 3,4 segundos de teleoperacion por episodio). Es un volumen muy bajo, con riesgo alto de sobreajuste a posiciones, iluminacion y fondo concretos.
- Inconsistencia entre nombre y tarea: el repositorio se llama `modelo_record-deburring` (desbarbado), pero la tarea declarada en la model card es "Grab the white cube". Conviene verificar cual es el proposito real antes de reutilizarlo.
- Fuerte acoplamiento al embodiment: entradas, salidas y nombres de camaras estan fijados (`so_follower`, `entorno`, `lateral`). Cambiar de robot, de camaras o de montaje invalida la politica sin reentrenamiento.
- Sin generalizacion de tarea: no acepta instrucciones en lenguaje ni tareas multiples; solo ejecuta el comportamiento imitado.
- Riesgo de alucinacion en sentido amplio: como toda politica de imitacion, puede producir acciones fuera de distribucion ante objetos, iluminacion o posiciones no vistas, con el consiguiente riesgo fisico para el robot y el entorno.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. No se declaran pesos derivados de terceros con licencias incompatibles, pero tampoco se detalla la procedencia de los datos del dataset `cualquier/cosa`.
- Idiomas: no aplica, al no procesar texto.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Reproducibilidad limitada: se conocen los hiperparametros (3.000 pasos, batch 8, AdamW, lr 1e-5, semilla 1000) y la version de LeRobot (0.6.2), pero no la semilla de inicializacion de pesos ni el hardware, lo que puede introducir variabilidad en una reproduccion exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssanz/modelo_record-deburring
- Dataset de entrenamiento: https://huggingface.co/datasets/cualquier/cosa
- Visualizador del dataset en LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=cualquier/cosa
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo ni con robotica, por lo que se han descartado y no se incluyen en esta ficha.
