# vis22/green_yellow_5.5

## Resumen

vis22/green_yellow_5.5 es una política de control robótico (policy) publicada por el usuario vis22 en Hugging Face, obtenida por ajuste fino del modelo base lerobot/smolvla_base. SmolVLA es, según su model card, un modelo visión-lenguaje-acción (VLA) compacto que alcanza un rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. La política tiene 450.046.176 parámetros (unos 450 millones) y el repositorio ocupa 0,9 GB.

El modelo está especializado en una única familia de tareas de manipulación: apilar un plato amarillo o verde sobre un plato azul. Se entrenó con el dataset vis22/green_yellow_plates, compuesto por 60 episodios y 16.194 fotogramas grabados a 30 FPS, sobre un robot piper_follower con dos cámaras (cam_global y cam_gripper). Como entrada consume el estado propioceptivo de 7 dimensiones y dos imágenes de 3x480x640, y como salida produce un vector de acción de 7 dimensiones.

Su relevancia es doble. Por un lado, es un ejemplo reproducible de ajuste fino de SmolVLA con LeRobot 0.6.1 sobre hardware asequible. Por otro, es un caso de estudio de los límites de las políticas de imitación entrenadas con pocos episodios: el autor no ha publicado ninguna evaluación en robot real, el repositorio acumula 0 descargas y 0 «likes», y no se documenta ninguna métrica de tasa de éxito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | visión-lenguaje-acción (VLA) basada en SmolVLA; detalles internos no disponibles |
| Parámetros totales | 450.046.176 (dato real de los safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos sin cuantizar |
| Idiomas soportados | no disponible; las instrucciones de tarea del dataset están en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (0,9 GB en el repositorio) |
| Librería de carga | lerobot (versión de entrenamiento 0.6.1) |
| Modelo base | lerobot/smolvla_base (ajuste fino) |
| Tipo de robot | piper_follower |
| Cámaras | cam_global, cam_gripper (3x480x640 cada una) |
| Entrada de estado | observation.state, forma (7,) |
| Salida | action, forma (7,) |
| Dataset de entrenamiento | vis22/green_yellow_plates (60 episodios, 16.194 fotogramas, 30 FPS) |

## Arquitectura y entrenamiento

El modelo es una política de imitación de tipo VLA: transforma observaciones multimodales (dos vistas de cámara y el estado de las articulaciones) más una instrucción de tarea en lenguaje natural en comandos motores de 7 grados de libertad. La model card describe SmolVLA como un modelo VLA «compacto y eficiente» que puede desplegarse en hardware de consumo, y remite al artículo arXiv:2506.01844 para los detalles del método. En la información proporcionada no se especifican el backbone de visión-lenguaje concreto, el mecanismo de generación de acciones (por ejemplo, flow matching o difusión), ni si se empleó decodificación especulativa o atención lineal; estos datos figuran como no disponibles.

El ajuste fino se realizó con LeRobot 0.6.1 sobre el dataset vis22/green_yellow_plates, que contiene dos tareas: «Stack the yellow plate on top of the blue plate» y «Stack the green plate on top of the blue plate». La configuración declarada es de 100.000 pasos de entrenamiento, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 5,5e-05 y semilla 1000. No se documenta la composición del corpus de preentrenamiento del modelo base ni si hubo etapas de RLHF o DPO, algo poco habitual en políticas robóticas pero que no puede confirmarse ni descartarse con la información disponible.

## Capacidades

- Generación de acciones motoras de 7 grados de libertad a partir de observaciones visuales y propioceptivas, orientada a control continuo de un brazo robótico.
- Condicionamiento por instrucción en lenguaje natural: reconoce las dos tareas de apilado con las que fue entrenado (plato amarillo sobre azul y plato verde sobre azul).
- Percepción desde dos cámaras simultáneas: una vista global de la escena y una vista de pinza, ambas a 640x480.
- Ejecución de tareas de pick-and-place y apilado de objetos planos sobre una superficie.
- Retroalimentación de estado articular de 7 dimensiones como entrada, lo que permite una política de tipo closed-loop.
- No soporta tool calling ni function calling: no es un modelo de lenguaje general ni un agente conversacional.
- No dispone de modo de razonamiento explícito («thinking mode»), ni capacidades de audio, ni generación de texto libre.
- Capacidades multilingües: no disponibles; las instrucciones del dataset están únicamente en inglés.
- No se declaran capacidades de generalización a objetos, posiciones o entornos distintos de los vistos en entrenamiento.

## Casos de uso

- Apilado automatizado de vajilla en un banco de pruebas: el modelo está entrenado específicamente para colocar un plato amarillo o verde sobre uno azul, por lo que puede emplearse como política de referencia en una celda de manipulación con brazo Piper.
- Punto de partida para ajuste fino con nuevos objetos: al derivar de lerobot/smolvla_base y entrenarse con solo 60 episodios, sirve como plantilla para reentrenar con un dataset propio de tareas similares mediante `lerobot-train`.
- Docencia en aprendizaje por imitación: permite a estudiantes reproducir el ciclo completo (grabación de datos, entrenamiento con AdamW a 5,5e-05 y 100.000 pasos, despliegue con `lerobot-rollout`) en hardware de consumo.
- Investigación en percepción multi-cámara: al consumir dos vistas de 3x480x640 (global y de pinza), facilita experimentos sobre la contribución de cada cámara al éxito de la tarea.
- Comparación de hiperparámetros y semillas: con una semilla declarada (1000) y una configuración fija, es un baseline reproducible para estudiar el efecto del tamaño de lote, la tasa de aprendizaje o el número de pasos en políticas VLA pequeñas.
- Validación de pipelines de despliegue robótico: sirve para comprobar la integración completa entre LeRobot, el robot piper_follower, las cámaras OpenCV a 30 FPS y el bucle de control.
- Demostración de bajo coste computacional: con unos 450 millones de parámetros y 0,9 GB de pesos, es adecuado para probar inferencia de modelos VLA en GPUs de gama media o en dispositivos embebidos tipo Jetson.
- Generación de datos sintéticos de evaluación: ejecutando la política repetidamente sobre el mismo montaje se pueden recopilar trayectorias de éxito y fallo para estudiar modos de error, siempre que se etiqueten manualmente, ya que no hay evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política, y no se incluye ninguna tabla de tasa de éxito (trials/successes) ni comparación con otros modelos.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 1,8 GB (450 millones de parámetros a 4 bytes); en BF16/FP16, unos 0,9 GB. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- VRAM práctica para inferencia: del orden de 2 a 3 GB considerando los pesos y las activaciones de dos imágenes de 3x480x640 (estimación).
- Cuantización a INT8: unos 0,45 GB teóricos, pero no hay pesos cuantizados publicados en el repositorio.
- Cabe en GPUs de consumo: la model card del modelo base afirma que SmolVLA puede desplegarse en hardware de consumo, lo que incluye tarjetas tipo RTX 3060, RTX 4060 o GTX 1660 en adelante; también es candidato para plataformas embebidas tipo Jetson.
- Despliegue: la vía documentada es LeRobot, con `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento (`--policy.device=cuda`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a una política VLA de acción continua.
- Hardware externo necesario: robot piper_follower y dos cámaras OpenCV configuradas a 640x480 y 30 FPS, con nombres que deben coincidir con cam_global y cam_gripper.
- Latencia y throughput: no disponibles. La cadencia del dataset es de 30 FPS, pero no se declara la frecuencia de control alcanzada en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| vis22/green_yellow_5.5 | 450 M | 2 cámaras 3x480x640 + estado 7D | Apache-2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la información proporcionada (mismo orden de magnitud) | multimodal, según SmolVLA | no disponible | Hugging Face (modelo base oficial) |
| OpenVLA | ~7.000 M (dato de conocimiento general, no verificado aquí) | 1 cámara + instrucción | no disponible | Hugging Face |
| pi0 (Physical Intelligence) | ~3.300 M (dato de conocimiento general, no verificado aquí) | multimodal | no disponible | no disponible |

Las cifras de OpenVLA y pi0 proceden de conocimiento general y no han sido verificadas en la información proporcionada; se incluyen únicamente como referencia de categoría (políticas VLA de manipulación). El rasgo diferencial de vis22/green_yellow_5.5 frente a esas alternativas es su tamaño reducido (450 millones de parámetros, 0,9 GB), que lo sitúa en la franja desplegable en GPU de consumo, a costa de una especialización muy estrecha en dos tareas concretas.

## Limitaciones y advertencias

- Entrenamiento con un dataset muy pequeño: 60 episodios y 16.194 fotogramas para dos tareas. Es esperable un sobreajuste a las posiciones iniciales, colores y condiciones de iluminación de la grabación.
- Ausencia total de evaluación: no hay tasa de éxito publicada, ni número de ensayos, ni condiciones de prueba, por lo que el rendimiento real en producción es desconocido.
- Sesgos del dataset de imitación: la política solo ha visto platos amarillos, verdes y azules en posiciones concretas; cualquier distractor, cambio de color o variación de altura de la pila puede provocar fallos.
- Dependencia fuerte del hardware: el nombre y la resolución de las cámaras, el tipo de robot (piper_follower) y la frecuencia de 30 FPS forman parte de las condiciones de entrenamiento; trasladarlo a otro robot o a otra disposición de cámaras requiere reentrenar.
- Idiomas: no se declara soporte multilingüe; las instrucciones del dataset están en inglés y no hay evidencia de que acepte instrucciones en castellano.
- Riesgo de alucinación en sentido amplio: como política de acción, puede generar trayectorias plausibles pero incorrectas (colisiones, agarres fallidos) sin señal de incertidumbre asociada.
- No es un modelo de propósito general: no genera texto, no responde a preguntas y no soporta tool calling ni razonamiento multi-paso.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia. El uso sobre hardware físico implica riesgos de seguridad que la licencia no cubre.
- Madurez baja del artefacto: 0 descargas, 0 «likes» y ausencia de demo en vídeo o resultados de robot real en el momento de redactar esta ficha.
- La búsqueda web realizada no devolvió ninguna fuente relevante sobre este modelo; los resultados obtenidos no guardaban relación con el tema y se han descartado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/green_yellow_5.5
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/green_yellow_plates
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/green_yellow_plates
- Artículo de SmolVLA (ficha en Hugging Face Papers): https://huggingface.co/papers/2506.01844
- Artículo de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- No se han encontrado otros enlaces relevantes en la búsqueda web.
