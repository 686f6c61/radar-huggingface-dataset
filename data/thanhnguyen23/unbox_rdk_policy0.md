# thanhnguyen23/unbox_rdk_policy0

## Resumen

`unbox_rdk_policy0` es una politica robotica publicada en Hugging Face por el usuario `thanhnguyen23` mediante la libreria LeRobot. No es un modelo de lenguaje: es un checkpoint de ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que aprende de datos de teleoperacion y predice fragmentos de acciones (chunks) en lugar de pasos individuales, segun el paper arXiv:2304.13705 citado por el autor.

El modelo tiene 51.670.663 parametros (repositorio de 0,2 GB) y esta especializado en una unica tarea: "Unboxing RDK board" (desembalar una placa RDK) con un brazo robotico `piper_follower` y dos camaras (`wrist` y `front`). Consume el estado del robot (7 dimensiones) y dos imagenes RGB de 3x480x640, y produce un vector de accion de 7 dimensiones.

Su relevancia es practica: sirve como ejemplo reproducible de entrenamiento y despliegue de una politica ACT con LeRobot 0.6.2 sobre hardware asequible, y como punto de partida para fine-tuning en tareas de manipulacion similares. Con 0 descargas y 0 likes en el momento de la consulta, es un checkpoint sin validacion externa y sin resultados de evaluacion publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con VAE condicional (ACT, Action Chunking with Transformers); incluye backbone visual convolucional. La implementacion de referencia de ACT usa ResNet-18, dato no confirmado en este repositorio |
| Parametros totales | 51.670.663 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; no es un modelo de lenguaje. ACT consume observaciones por paso con un historial fijo que el repositorio no documenta |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors. Por tamano, la inferencia en fp32 y en bf16/fp16 es viable, pero no esta documentada |
| Idiomas soportados | No aplica; es una politica robotica. La unica cadena de texto es la etiqueta de tarea "Unboxing RDK board" |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint del framework LeRobot) |
| Tipo de robot | `piper_follower` |
| Camaras de entrada | `observation.images.wrist` (3, 480, 640) y `observation.images.front` (3, 480, 640) |
| Entrada de estado | `observation.state` con forma (7,) |
| Salida de accion | `action` con forma (7,) |
| Dataset de entrenamiento | `thanhnguyen23/unbox_rdk`: 51 episodios, 60.808 frames, 30 FPS |
| Version de LeRobot | 0.6.2 |
| Fecha de publicacion en el Hub | 2026-09-28 (ultima actualizacion: 2026-09-28) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un metodo de comportamiento clonado (behavior cloning) que combina un transformer encoder-decoder con un VAE condicional: un codificador de estilo aprende una variable latente que representa la variabilidad de la demostracion (por ejemplo, la posicion exacta de un objeto) y el decodificador genera un chunk de acciones futuras en lugar de una sola accion. En inferencia, el uso de chunks con ensamblado temporal (temporal ensembling) es lo que permite obtener movimientos suaves y de alta frecuencia a partir de politicas que predicen bloques de acciones. El checkpoint consume dos flujos visuales de 480x640 (muneca y frontal) procesados por un backbone convolucional, junto con un vector de estado de 7 dimensiones propio del brazo `piper_follower`, y devuelve un vector de accion de 7 dimensiones.

El entrenamiento se realizo sobre el dataset `thanhnguyen23/unbox_rdk`, con 51 episodios y 60.808 frames a 30 FPS, lo que equivale a unos 1.192 frames por episodio (aproximadamente 40 segundos de demostracion por episodio, calculo derivado de los datos facilitados). La configuracion declarada es de 20.000 pasos de entrenamiento, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000, usando LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni aprendizaje por refuerzo, lo cual es coherente con un pipeline de imitacion pura. Tampoco se especifican el numero de capas del transformer, la dimension del latente del VAE, el tamano del chunk de acciones ni la GPU empleada en el entrenamiento.

## Capacidades

- Generacion de acciones de manipulacion de 7 grados de libertad para el brazo `piper_follower`, en forma de chunks de acciones.
- Percepcion visual bimodal: procesa simultaneamente una camara en la muneca y una camara frontal a 480x640.
- Fusion de estado proprioceptivo (7 dimensiones) con vision para producir la accion.
- Ejecucion en bucle cerrado sobre robot real mediante `lerobot-rollout`, con la tarea especificada como etiqueta de texto ("Unboxing RDK board").
- Control a 30 FPS en el bucle de inferencia, frecuencia heredada de la tasa de captura del dataset (requisito derivado, no una cifra medida publicada).
- Reentrenamiento y fine-tuning mediante `lerobot-train` con `--policy.type=act`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente conversacional.
- No procesa lenguaje natural como instruccion libre: la unica condicion textual es la etiqueta de tarea del dataset.
- No dispone de modo de pensamiento (thinking mode), ni capacidades de audio, ni vision general fuera del dominio de la tarea entrenada.
- No es multilingue en ningun sentido funcional.

## Casos de uso

- Automatizacion del desembalaje de placas en laboratorio o linea de montaje: la politica reproduce la secuencia de apertura y extraccion de una placa RDK con un brazo `piper_follower`, usando la camara de muneca para el agarre fino y la frontal para la localizacion del embalaje. Es adecuado porque la tarea esta definida de forma estrecha y el modelo se entreno exactamente sobre ella.
- Base para fine-tuning en manipulacion de objetos con brazo Piper: partiendo de estos pesos, `lerobot-train` permite adaptar la politica a tareas como insertar la placa en una bandeja o conectarla a un puerto, reutilizando el backbone visual ya entrenado.
- Banco de pruebas para investigacion en aprendizaje por imitacion: sirve para reproducir el flujo completo de ACT (grabacion con teleoperacion, entrenamiento, despliegue y evaluacion) sin necesidad de un cluster, dado su tamano de 51,7 millones de parametros.
- Comparacion interna de checkpoints: al haber sido entrenado con hiperparametros documentados (20.000 pasos, lote 8, lr 1e-5, semilla 1000), es un punto de referencia util para medir el efecto de cambios en el numero de episodios o en la resolucion de camara.
- Generacion de datos etiquetados para otras politicas: el modelo puede ejecutar la tarea de forma autonoma mientras se registran episodios adicionales, que despues se usan para ampliar el dataset o entrenar metodos alternativos como Diffusion Policy.
- Docencia y formacion en robotica: permite montar una practica de laboratorio en la que el alumnado graba demostraciones, entrena una politica ACT y la ejecuta en un robot real asequible, comprobando el efecto del numero de episodios y de la iluminacion.
- Inspeccion visual asistida: presentando la placa a la camara frontal tras desembalarla, la politica puede integrarse en una celda donde la placa se coloca automaticamente bajo una camara de inspeccion, reduciendo manipulacion manual repetitiva.
- Recogida de datos para VLA: los episodios generados con este brazo y estas camaras pueden reutilizarse para experimentar con modelos vision-language-action mas grandes, dado que el formato de observaciones es el estandar de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con la indicacion explicita de que no se han proporcionado resultados ("No evaluation results have been provided for this policy yet"), por lo que no existe tasa de exito medida en robot real, ni numero de ensayos, ni comparacion con otros checkpoints. El paper de ACT (arXiv:2304.13705) reporta resultados para el metodo en otros entornos, pero no son aplicables a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 207 MB para los pesos en fp32 y unos 103 MB en bf16/fp16; sumando activaciones de dos imagenes de 3x480x640 y el backbone convolucional, la inferencia deberia caber holgadamente por debajo de 2 GB (estimacion derivada del numero de parametros, no una cifra publicada).
- GPU recomendadas: no disponibles; el autor no documenta la GPU de entrenamiento ni de despliegue. Por tamano, cualquier GPU con soporte CUDA y al menos 4 GB de memoria es suficiente para inferencia, y el entrenamiento con lote 8 y dos camaras es viable en una unica GPU de gama alta (estimacion).
- Cabe en GPU de consumo: si. Practicamente cualquier GPU de consumo moderna (RTX 3050, RTX 3060, RTX 4060, RTX 4090, entre otras) puede ejecutar la politica; tambien es posible la inferencia en CPU con latencia mayor.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout --policy.path=thanhnguyen23/unbox_rdk_policy0`, con PyTorch y pesos safetensors sobre `--policy.device=cuda`. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje.
- Requisito de integracion robotica: el despliegue real necesita un brazo `piper_follower` con estado y accion de 7 dimensiones, dos camaras OpenCV configuradas a 640x480 y 30 FPS, y nombres de camara que coincidan exactamente con las claves de observacion del entrenamiento.
- Latencia y throughput: no disponibles. Como referencia operativa, el dataset se capturo a 30 FPS, por lo que el bucle de control en tiempo real necesita una frecuencia de inferencia igual o superior a 30 Hz para reproducir el ritmo de las demostraciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| `thanhnguyen23/unbox_rdk_policy0` (ACT) | Imitacion, transformer con VAE y chunks de acciones | 51.670.663 | Estado de 7 dim. y dos imagenes 3x480x640 | apache-2.0 | Publico en Hugging Face | Una unica tarea ("Unboxing RDK board"), sin evaluacion publicada |
| Otras politicas ACT del Hub de LeRobot | Imitacion, misma familia de metodo | No disponible | Variables segun robot | No disponible | Publicas en Hugging Face | Entrenadas sobre otros robots y datasets; no comparables en exito sin evaluacion propia |
| Diffusion Policy (arXiv:2303.04137) | Imitacion, modela la distribucion de acciones mediante difusion | No disponible | Estado y vision | No disponible en esta informacion | Implementacion disponible en el ecosistema LeRobot | Alternativa metodologica a ACT; suele requerir mas computo de inferencia por el proceso de difusion |
| Modelos VLA (familia SmolVLA, pi 0, etc.) | Vision-language-action | No disponible en esta informacion | Imagenes e instrucciones en lenguaje natural | No disponible en esta informacion | Publicos parcialmente | Aceptan ordenes en lenguaje natural y generalizan a varias tareas; su tamano y coste de inferencia son muy superiores |

No se dispone de datos comparativos de tasa de exito ni de latencia entre estas alternativas en la informacion proporcionada, por lo que la comparacion es unicamente cualitativa.

## Limitaciones y advertencias

- Especializacion extrema: el modelo se entreno sobre una sola tarea ("Unboxing RDK board"), 51 episodios y 60.808 frames. No generaliza a otros objetos, posiciones ni tareas.
- Sin evaluacion publicada: no existe tasa de exito medida, ni numero de ensayos, ni condiciones de prueba, por lo que su fiabilidad real es desconocida.
- Dependencia del hardware exacto: la politica asume un brazo `piper_follower`, un estado y una accion de 7 dimensiones y dos camaras concretas (`wrist` y `front`) a 480x640. Cambiar el robot, el numero de camaras o su montaje invalida el comportamiento aprendido.
- Sensibilidad al entorno: al ser comportamiento clonado, es vulnerable a cambios de iluminacion, fondo, posicion del embalaje y presencia de distracciones.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; el dataset asociado tampoco cuenta con verificacion externa.
- Seguridad fisica: la ejecucion produce movimientos reales en un brazo robotico. Es imprescindible limitar velocidades y fuerzas, definir espacios de trabajo y disponer de parada de emergencia. El concepto de alucinacion no aplica igual que en un modelo de lenguaje, pero si existe el riesgo de acciones erroneas o fuera de rango ante entradas fuera de distribucion.
- Alcance funcional: no procesa lenguaje natural, no soporta tool calling, no razona en varios pasos y no acepta instrucciones libres; la unica condicion textual es la etiqueta de tarea.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero no ofrece garantias. Conviene revisar tambien las condiciones de uso de LeRobot (Apache-2.0) y del dataset `thanhnguyen23/unbox_rdk`.
- Trazabilidad de datos: se desconoce la diversidad de operadores, condiciones de iluminacion y variabilidad de objetos en las demostraciones, factores que condicionan directamente el sesgo de la politica hacia un unico estilo de ejecucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thanhnguyen23/unbox_rdk_policy0
- Dataset de entrenamiento: https://huggingface.co/datasets/thanhnguyen23/unbox_rdk
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=thanhnguyen23/unbox_rdk
- Paper de ACT: https://huggingface.co/papers/2304.13705 | https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (CLI): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Paper de Diffusion Policy (alternativa metodologica): https://arxiv.org/abs/2303.04137
- Cita de LeRobot: Cadene, R. et al. "LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch", 2024, https://github.com/huggingface/lerobot
