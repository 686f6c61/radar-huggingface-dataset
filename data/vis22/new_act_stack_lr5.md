# vis22/new_act_stack_lr5

## Resumen

vis22/new_act_stack_lr5 es una politica de robótica basada en ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que predice secuencias cortas de acciones (chunks) en lugar de un unico paso de control. El modelo lo publica el usuario vis22 en Hugging Face mediante la libreria LeRobot, de Hugging Face, y esta entrenado especificamente para una tarea de manipulacion: apilar platos sobre un plato azul y volver a la posicion de reposo.

El modelo tiene 51.670.663 parametros y consume dos flujos de imagen RGB de 480x640 (camara global y camara de la pinza) junto con un vector de estado de 7 dimensiones; produce una accion de 7 dimensiones. Fue entrenado durante 200.000 pasos con batch de 8, optimizador AdamW y learning rate 5e-5 sobre un dataset de 50 episodios y 26.060 fotogramas grabados a 30 FPS con un brazo Piper (tipo `piper_follower`).

Su relevancia es practica: es un ejemplo reproducible y ligero (0,2 GB de repositorio) de un pipeline completo de LeRobot, desde la grabacion de demostraciones teleoperadas hasta el despliegue en robot real con `lerobot-rollout`. Al estar bajo licencia Apache 2.0 y ocupar pocos recursos, sirve como linea base para experimentos de imitacion, para hacer fine-tuning en tareas similares y para comparar ACT frente a metodos mas recientes como Diffusion Policy o los modelos VLA. No incluye resultados de evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con CVAE (ACT: Action Chunking with Transformers), segun arxiv:2304.13705 |
| Parametros totales | 51.670.663 (dato de los safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible: la politica no procesa secuencias de texto; consume una observacion por paso (2 imagenes 3x480x640 y estado de 7 dimensiones) |
| Tipos de cuantizacion | no disponible: solo se publican pesos en safetensors en precision de entrenamiento (fp32); no hay versiones int8, int4 ni GGUF |
| Idiomas soportados | no aplica: el modelo no procesa lenguaje natural; el campo `task` del CLI se usa para anotar los episodios grabados |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB), libreria lerobot |
| Tipo de robot | `piper_follower` |
| Camaras | `cam_global`, `cam_gripper` (3x480x640 cada una) |
| Entrada de estado | `observation.state`, shape (7,) |
| Salida | `action`, shape (7,) |
| Dataset de entrenamiento | vis22/new_plates_stack: 50 episodios, 26.060 fotogramas, 30 FPS |
| Tarea | "Stack all the plates on top of the blue plate, then return to home position" |
| Pasos de entrenamiento | 200.000 |
| Batch size | 8 |
| Optimizador / learning rate | AdamW / 5e-5 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |
| Descargas / likes | 0 / 0 |
| Fecha indicada en el Hub | creado el 2026-09-17, actualizado el 2026-09-17 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion presentado en el articulo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La formulacion combina un autocodificador variacional condicional (CVAE) con un transformer: un codificador codifica la secuencia de acciones objetivo junto con las observaciones y un codificador de estilo, y un decodificador transformer predice un chunk de acciones futuras a partir de las observaciones actuales y de la variable latente. El entrenamiento minimiza una perdida L1 de reconstruccion de acciones mas un termino de regularizacion KL sobre la latente, y en inferencia se suele aplicar *temporal ensembling* para suavizar las predicciones solapadas entre chunks.

En este caso concreto, el modelo se entreno con LeRobot 0.6.1 durante 200.000 pasos, batch de 8, AdamW y learning rate 5e-5 (de ahi el sufijo `lr5`), semilla 1000, sobre 26.060 fotogramas teleoperados a 30 FPS que contienen una unica tarea de apilado de platos. La model card no detalla el tamano del chunk de acciones, la dimension latente ni la composicion exacta del encoder visual, por lo que esos hiperparametros figuran como no disponibles. Tampoco se documenta el uso de RLHF, DPO ni de decodificacion especulativa: son tecnicas propias de modelos de lenguaje y no aplican a una politica de control.

## Capacidades

- Control visomotor de manipulacion: genera comandos de accion de 7 grados de libertad a partir de dos vistas RGB y del estado de las articulaciones.
- Prediccion de chunks de acciones, lo que reduce el error de composicion acumulado respecto a politicas que predicen un unico paso.
- Ejecucion de una tarea concreta de pick-and-place: apilar platos sobre un plato azul y volver a la posicion de reposo.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin recompensa explicita ni simulador.
- Reutilizacion como punto de partida: los pesos pueden servir de inicializacion para fine-tuning en tareas nuevas con el mismo robot y la misma configuracion de camaras.
- Integracion nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision-lenguaje ni dialogo multilingue: no es un modelo de lenguaje.

## Casos de uso

- Apilado automatizado de platos en un banco de pruebas: es exactamente la tarea para la que se entreno, con un brazo Piper y dos camaras a 480x640 y control a 30 FPS; se desplegaria con `lerobot-rollout --policy.path=vis22/new_act_stack_lr5` y la instruccion de tarea original.
- Linea base en investigacion sobre imitacion: al ser un ACT de 51,67 M de parametros con configuracion documentada, permite comparar variantes (por ejemplo, otro learning rate o mas episodios) manteniendo fijo el resto del pipeline.
- Fine-tuning en tareas cercanas de pick-and-place: recogida de cubiertos, clasificacion de piezas o colocacion de objetos en bandejas, reutilizando el encoder visual y el decodificador ya entrenados para reducir el numero de demostraciones necesarias.
- Generacion de nuevas demostraciones teleoperadas: usar el modelo como asistencia durante la teleoperacion para acelerar la grabacion de un dataset mayor con LeRobot.
- Prototipado de celdas roboticas de bajo coste en laboratorios y universidades: el modelo ocupa 0,2 GB y se ejecuta en una GPU de consumo, por lo que no requiere infraestructura de servidor.
- Validacion de una celula de montaje antes de invertir en automatizacion industrial: permite comprobar la viabilidad de una tarea de manipulacion con camaras convencionales y un brazo de bajo coste.
- Docencia en robotica y aprendizaje automatico: sirve como ejemplo completo y ejecutable del ciclo grabar dataset, entrenar politica y desplegar en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card esta vacia y el autor indica explicitamente: "No evaluation results have been provided for this policy yet". Por tanto, no hay tasas de exito en robot real, ni comparaciones con otras politicas sobre la misma tarea, ni mediciones de latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,21 GB solo para los pesos en fp32 (51,67 M x 4 bytes) y alrededor de 0,10 GB si se cargan en fp16/bf16; hay que sumar las activaciones del encoder visual que procesa dos imagenes de 3x480x640.
- GPU recomendadas: cualquier GPU NVIDIA moderna con al menos 4 GB de VRAM es suficiente, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo esta muy por debajo de la capacidad de todas ellas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos e incluso en GPU integradas o en CPU, siempre que se respete el ciclo de control de 30 FPS.
- Opciones de despliegue: `lerobot-rollout` con la libreria LeRobot 0.6.1 o superior y PyTorch sobre CUDA; el entrenamiento se realiza con `lerobot-train`. No aplican vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, porque la salida es un vector de acciones y no texto.
- Latencia y throughput: no disponible. El requisito funcional derivado del dataset es ejecutar como maximo una inferencia cada 33 ms para mantener los 30 FPS del bucle de control.
- Almacenamiento: repositorio de 0,2 GB, mas el dataset de entrenamiento si se va a reentrenar.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| vis22/new_act_stack_lr5 | ACT (CVAE + transformer) | 51,67 M | Apache 2.0 | Hugging Face, libreria LeRobot |
| ACT original (Zhao et al., 2023) | ACT (CVAE + transformer) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Codigo y articulo publicos |
| Diffusion Policy (Chi et al., 2023) | Politica de difusion sobre acciones | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Implementaciones publicas |
| SmolVLA (Hugging Face) | Modelo vision-lenguaje-accion | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face, libreria LeRobot |
| pi0 / pi0.5 (Physical Intelligence) | Modelo vision-lenguaje-accion de gran escala | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Publicaciones y pesos con acceso variable |

Diferencias cualitativas relevantes: ACT es un metodo ligero, rapido y no condicionado por lenguaje, adecuado para una tarea unica con muchas demostraciones; Diffusion Policy modela distribuciones multimodales de acciones mediante difusion, con mayor coste de inferencia por el numero de pasos de denoising; los modelos VLA como SmolVLA o pi0 incorporan un backbone de lenguaje, aceptan instrucciones en lenguaje natural y generalizan a multiples tareas, a cambio de un tamano y unos requisitos de computo muy superiores. No se dispone de cifras de rendimiento comparables entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- No hay ningun resultado de evaluacion publicado: se desconoce la tasa de exito real de la politica, incluso en la tarea para la que fue entrenada.
- Entrenamiento con datos muy limitados: 50 episodios y 26.060 fotogramas de una unica tarea, lo que favorece el sobreajuste a las posiciones de los platos, a la iluminacion y al fondo de la escena de grabacion.
- Especificidad de encarnacion: solo funciona con el robot `piper_follower` y con las camaras `cam_global` y `cam_gripper` en la configuracion usada; cambiar el robot, el numero de camaras o sus nombres rompe la politica, ya que las claves de observacion deben coincidir exactamente.
- Sin condicionamiento por lenguaje: no se le puede pedir una tarea nueva mediante texto; la unica tarea aprendida es el apilado de platos.
- Riesgo de acciones incorrectas: aunque no aplica el concepto de alucinacion de un modelo de lenguaje, la politica puede generar trayectorias erroneas o inseguras ante objetos no vistos; es imprescindible ejecutar con limites de par, velocidades reducidas y parada de emergencia.
- Sin informacion sobre sesgos demograficos ni linguisticos, porque el modelo no procesa personas ni texto.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero se ofrece sin garantias; conviene revisar la licencia del dataset vis22/new_plates_stack si se va a redistribuir o usar comercialmente.
- Metadatos a verificar: el Hub indica fecha de creacion 2026-09-17 y no se ha contrastado; el modelo tiene 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- La busqueda web realizada no aporto documentacion adicional sobre esta politica concreta (solo resultados genericos no relacionados), de modo que toda la informacion tecnica procede de la model card y de los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/new_act_stack_lr5
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/new_plates_stack
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/new_plates_stack
- Articulo de ACT: https://arxiv.org/abs/2304.13705
- Ficha del articulo en Hugging Face: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
