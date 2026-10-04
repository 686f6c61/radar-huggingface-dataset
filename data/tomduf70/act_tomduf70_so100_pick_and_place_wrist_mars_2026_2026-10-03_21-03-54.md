# tomduf70/act_tomduf70_so100_pick_and_place_wrist_mars_2026_2026-10-03_21-03-54

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones —chunks— en lugar de un único paso de control, lo que reduce el error de composición y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, publicado por el usuario tomduf70, contiene una política ACT entrenada con LeRobot 0.6.0 sobre el brazo robótico SO-100 en configuración `so_follower`, con dos cámaras (`top` y `wrist`), para la tarea "pick and place". No es un modelo de lenguaje: es un controlador visomotor que consume estado articular de 6 dimensiones más dos imágenes de 480x640 y emite un vector de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros reales (verificados en los pesos safetensors) y el repositorio ocupa 1,2 GB, un tamaño que lo sitúa en la categoría de políticas ligeras ejecutables en GPU de consumo e incluso en CPU. Se distribuye con licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones de copyleft, algo relevante para integradores que quieran incorporarlo a un producto.

Su relevancia es doble. Por un lado, sirve como ejemplo reproducible de un flujo completo de imitación en hardware de bajo coste (SO-100) con el ecosistema LeRobot. Por otro, conviene evaluarlo con cautela: se entrenó con solo 10 episodios y 2.717 fotogramas a 15 FPS durante 2.000 pasos, y no se han publicado resultados de evaluación en robot real, por lo que su capacidad de generalización es, a priori, limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume una observacion por paso de control) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.0 |
| Tipo de robot | so_follower (SO-100) |
| Camaras de entrada | top y wrist, cada una (3, 480, 640) |
| Entrada de estado | observation.state, forma (6,) |
| Salida | action, forma (6,) |
| Frecuencia del dataset de entrenamiento | 15 FPS |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-03 |

## Arquitectura y entrenamiento

ACT combina un backbone visual de tipo ResNet con un codificador de estilo transformer que fusiona las características de imagen con el estado proprioceptivo, y un decodificador transformer que genera un chunk de acciones de forma no autorregresiva. Esta formulación, descrita en el articulo arXiv:2304.13705, mitiga el problema de la varianza en la prediccion paso a paso y permite politicas estables a partir de demostraciones teleoperadas relativamente escasas. La model card no detalla el tamano de chunk, el numero de capas ni la dimension del modelo, por lo que esos hiperparametros concretos quedan como no disponibles.

El entrenamiento se realizo con LeRobot 0.6.0 sobre el dataset `tomduf70/so100_pick_and_place_wrist_mars_2026`, compuesto por 10 episodios, 2.717 fotogramas a 15 FPS y una unica tarea ("pick and place"). La configuracion declarada es de 2.000 pasos, batch de 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO, augmentacion de datos, mezcla de datasets ni tecnicas de regularizacion adicionales, y no hay evidencias de entrenamiento multi-tarea o co-entrenamiento con otras politicas.

## Capacidades

- Control visomotor para manipulacion: genera comandos de 6 grados de libertad a partir de dos vistas de camara y del estado articular.
- Prediccion por chunks de acciones, lo que produce trayectorias mas suaves que un controlador paso a paso.
- Ejecucion de la tarea de recogida y colocacion ("pick and place") en el brazo SO-100 en configuracion `so_follower`.
- Integracion con el ecosistema LeRobot: carga directa del repositorio mediante `--policy.path` en `lerobot-rollout`.
- Reentrenamiento y ajuste fino con `lerobot-train` sobre nuevos datasets, siempre que se respeten las claves de observacion esperadas.
- No dispone de generacion de texto, razonamiento simbolico, codigo ni matematicas.
- No soporta tool calling, function calling ni planificacion multi-paso basada en lenguaje.
- No tiene capacidades multilingues ni procesamiento de instrucciones en lenguaje natural: la tarea es fija y se pasa como cadena al script de rollout.
- No dispone de modo "thinking", vision generalista, audio ni cualquier otra modalidad fuera de la percepcion visual y el estado articular.

## Casos de uso

- Aprendizaje por imitacion en laboratorio: reproducir el pipeline completo grabacion-calibracion-entrenamiento-despliegue con un SO-100, usando esta politica como referencia funcional del flujo LeRobot.
- Automatizacion de pick and place en entornos controlados: colocar y retirar piezas de posicion fija en una celda de laboratorio o linea educativa, aceptando que la variabilidad de posiciones y de iluminacion esta poco cubierta por los 10 episodios de entrenamiento.
- Punto de partida para ajuste fino: reentrenar con un dataset propio mas amplio para una tarea concreta, aprovechando que la licencia Apache 2.0 no impone restricciones y que el modelo es pequeno (51,7 M de parametros).
- Recogida de datos con DAgger o correccion humana: usar la politica como controlador base, intervenir cuando falla y registrar las correcciones para un segundo ciclo de entrenamiento.
- Docencia en robotica y aprendizaje por imitacion: material didactico para explicar action chunking, el efecto de la tasa de fotogramas y la sensibilidad al numero de episodios.
- Evaluacion comparativa de configuraciones de entrenamiento: mantener fija esta politica como linea base y variar pasos, batch, tasa de aprendizaje o resolucion de imagen para medir el impacto en la tasa de exito.
- Demostracion de integracion hardware-software en ferias o talleres: montaje minimo (brazo SO-100, dos camaras OpenCV) y ejecucion con un unico comando de rollout.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la linea "No evaluation results have been provided for this policy yet", por lo que no existe tasa de exito en robot real, numero de ensayos ni medicion de robustez ante cambios de posicion, iluminacion o distractores.

| Aspecto evaluado | Resultado |
|---|---|
| Tasa de exito en robot real | no disponible |
| Numero de ensayos por tarea | no disponible |
| Robustez ante cambios de iluminacion o posicion | no disponible |
| Comparacion con otras politicas ACT | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 207 MB en FP32 y unos 103 MB en FP16 para los pesos, mas el coste de activaciones de dos imagenes de 480x640 y del backbone visual; en la practica el consumo total se mantiene por debajo de 2 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y 4 GB o mas de memoria es suficiente (RTX 3050, RTX 4060, RTX 4090, A100, H100). El modelo no requiere aceleradores de gama alta.
- Compatibilidad con GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos ocho anos; tambien es viable en CPU, aunque la latencia del bucle de control y de la codificacion de imagen condicionara la frecuencia efectiva.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` es la via documentada por el autor. El resto del ecosistema LeRobot usa PyTorch; no se documentan rutas de exportacion a ONNX, TensorRT ni integraciones con vLLM, Ollama, TGI o llama.cpp, que no aplican a una politica de robótica.
- Latencia y throughput: no disponible. No se publican mediciones de latencia por paso de control, frecuencia de inferencia alcanzada ni tasa de exito respecto al dataset de 15 FPS.
- Almacenamiento: 1,2 GB de repositorio, incluyendo pesos y artefactos de entrenamiento; los checkpoints intermedios no se detallan en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos cuantitativos publicados para esta politica ni para alternativas equivalentes en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales conocidas. Cualquier cifra de rendimiento o de tasa de exito queda como no disponible.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_tomduf70_so100_pick_and_place (este) | ACT, imitacion | 51.668.614 | no aplica | Apache 2.0 | HuggingFace, via LeRobot |
| ACT de referencia (arXiv:2304.13705) | ACT, imitacion | no disponible | no aplica | no disponible | Implementacion en LeRobot |
| Diffusion Policy | politica generativa por difusion | no disponible | no aplica | no disponible | Implementacion en LeRobot |
| SmolVLA y otras VLA del ecosistema LeRobot | vision-language-action | no disponible | no disponible | no disponible | HuggingFace, via LeRobot |

Diferencias cualitativas relevantes: este repositorio esta especializado en una unica tarea, un unico robot y un dataset muy reducido, mientras que las politicas VLA del ecosistema LeRobot aceptan instrucciones en lenguaje natural y se entrenan con corpus de demostraciones mucho mayores. Sin datos de evaluacion publicados, no es posible afirmar cual ofrece mejor tasa de exito.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 10 episodios y 2.717 fotogramas. Es esperable un sobreajuste a posiciones, iluminacion, fondo y objetos concretos del entorno de grabacion.
- Entrenamiento corto: 2.000 pasos con batch 8, sin evidencias de convergencia ni de curva de perdida publicada.
- Ausencia total de evaluacion: sin tasa de exito ni ensayos en robot real, no hay base para afirmar que la politica funciona de forma fiable.
- Rigidez de la tarea: la cadena "pick and place" es la unica tarea entrenada; no responde a instrucciones variables ni a objetivos nuevos.
- Dependencia estricta de las claves de observacion: las camaras deben llamarse `top` y `wrist` y entregar imagenes de 480x640, y el estado debe ser un vector de 6 dimensiones en el mismo orden y escala que en el dataset original.
- Sensibilidad al entorno: cambios en la cinematica del robot, en la calibracion, en la posicion de las camaras o en las condiciones de luz invalidan la politica con alta probabilidad.
- Riesgo de fallo silencioso: la politica no estima incertidumbre ni detecta fuera de distribucion, por lo que puede ejecutar movimientos incorrectos sin aviso cuando la escena difiere de la de entrenamiento.
- Alucinacion en sentido estricto no aplica (no genera texto), pero si existe generacion de acciones plausibles pero erroneas.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion; el usuario debe citar ademas ACT y LeRobot.
- Trazabilidad limitada: repositorio sin descargas ni likes y publicado por un autor sin historial verificable; conviene auditar los pesos antes de usarlos en produccion.
- Uso en produccion: no recomendable sin una campana de evaluacion propia con ensayos repetidos por tarea, pruebas de robustez y un mecanismo de parada de seguridad en el robot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tomduf70/act_tomduf70_so100_pick_and_place_wrist_mars_2026_2026-10-03_21-03-54
- Dataset de entrenamiento: https://huggingface.co/datasets/tomduf70/so100_pick_and_place_wrist_mars_2026
- Articulo de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=tomduf70/so100_pick_and_place_wrist_mars_2026
