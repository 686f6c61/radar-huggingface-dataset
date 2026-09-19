# vis22/modv2_smolvla

## Resumen

`vis22/modv2_smolvla` es una politica robotica de tipo vision-lenguaje-accion (VLA) obtenida por ajuste fino (*fine-tuning*) del modelo base `lerobot/smolvla_base`, que a su vez implementa el metodo SmolVLA descrito en el paper arXiv:2506.01844. El modelo lo publica el usuario `vis22` y esta entrenado con LeRobot 0.6.1 para una unica tarea de manipulacion: apilar platos sobre un plato azul y volver a la posicion de reposo. Con 450.046.176 parametros (aproximadamente 450 M) y un repositorio de 0,9 GB, es un modelo compacto que cabe sin dificultad en GPUs de consumo, lo que lo sitúa en la categoria de politicas de imitacion ligeras frente a alternativas de miles de millones de parametros.

El problema que resuelve es concreto: traducir observaciones multimodales (estado del robot de 7 dimensiones y dos flujos de imagen de 480x640 a 30 FPS) en acciones continuas de 7 dimensiones para un robot `piper_follower`, con dos camaras (`cam_global` y `cam_gripper`). No es un modelo de lenguaje general ni un asistente conversacional: es un controlador de robot entrenado con aprendizaje por imitacion sobre 49 episodios y 22.026 fotogramas del dataset `vis22/plates_stack_v2`.

Su relevancia es doble. Por un lado, sirve como ejemplo reproducible del flujo completo de LeRobot (grabar datos, entrenar, publicar y desplegar una politica VLA). Por otro, demuestra que un modelo de ~450 M de parametros puede ejecutar tareas de manipulacion con vision y estado, abaratando el coste de inferencia y permitiendo despliegues en hardware asequible. La contrapartida es que el modelo esta especializado en una tarea y un montaje de robot muy concretos, y el autor no ha publicado resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta derivada de SmolVLA; no se detalla la configuracion interna en la informacion proporcionada |
| Parametros totales | 450.046.176 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la politica consume historial de observaciones, no una ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el campo de idiomas no esta informado; la condicion de tarea es una unica instruccion en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,9 GB |
| Biblioteca | lerobot |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Tipo de robot | piper_follower |
| Entradas | observation.state (7,); observation.images.cam_global (3, 480, 640); observation.images.cam_gripper (3, 480, 640) |
| Salidas | action (7,) |
| Dataset de entrenamiento | vis22/plates_stack_v2 (49 episodios, 22.026 fotogramas, 30 FPS) |
| Tarea | "Stack all the plates on top of the blue plate, then return to home position" |
| Descargas / likes en el Hub | 27 / 0 |
| Fecha de creacion / actualizacion | 2026-09-19 / 2026-09-19 |

## Arquitectura y entrenamiento

La informacion proporcionada describe el modelo como un VLA compacto y eficiente, capaz de rendimiento competitivo con coste computacional reducido y desplegable en hardware de consumo. Se trata de un ajuste fino de `lerobot/smolvla_base`, por lo que hereda la arquitectura del metodo SmolVLA referenciado en arXiv:2506.01844. Los detalles finos de la arquitectura (numero de capas, dimension del encoder de vision, mecanismo de generacion de acciones, uso de *flow matching* o *action chunking*) no se especifican en la informacion disponible y no se afirman aqui.

Respecto al entrenamiento, el autor documenta 100.000 pasos con tamano de lote 8, optimizador AdamW, tasa de aprendizaje 5,5e-05 y semilla 1000, todo con LeRobot 0.6.1. El corpus es un unico dataset de demostraciones teleoperadas: 49 episodios y 22.026 fotogramas a 30 FPS de la tarea de apilado de platos. No se informa de fases de RLHF, DPO ni de aprendizaje por refuerzo; el paradigma es aprendizaje por imitacion supervisado sobre demostraciones. Tampoco se indica composicion del dataset mas alla de la tarea, ni si se aplicaron aumentos de datos o tecnicas de *regularization*.

## Capacidades

- Generacion de acciones de control continuo: produce un vector de accion de 7 dimensiones a partir del estado del robot y de dos imagenes, adecuado para un manipulador `piper_follower`.
- Percepcion visual multimodal: consume dos camaras simultaneas (vista global y vista de pinza) a 480x640 y 30 FPS.
- Condicionamiento por instruccion de tarea: la politica se ejecuta con la instruccion textual "Stack all the plates on top of the blue plate, then return to home position". No se documenta soporte para otras instrucciones distintas de la de entrenamiento.
- Aprendizaje por imitacion: reproduce la conducta demostrada en el dataset `vis22/plates_stack_v2`.
- Integracion con el ecosistema LeRobot: se puede ejecutar con `lerobot-rollout` y reentrenar con `lerobot-train`.
- Soporte de *tool calling* / *function calling*: no aplica (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta planificacion simbolica ni bucle agentico mas alla del control reactivo de la politica.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo *thinking*, vision adicional, audio): no disponible; la unica modalidad de entrada adicional al estado es la vision.

## Casos de uso

- Manipulacion robotica de Laboratorio: usar el modelo como politica de control de un `piper_follower` para la tarea exacta de apilar platos, ejecutando `lerobot-rollout` con las dos camaras configuradas a 480x640 y 30 FPS. Es el uso para el que fue entrenado y el unico respaldado por los datos del autor.
- Banco de pruebas de aprendizaje por imitacion: servir de referencia para comparar recetas de entrenamiento (pasos, tasa de aprendizaje, aumentos de datos) sobre un mismo dataset de 49 episodios, midiendo la tasa de exito en la tarea de apilado.
- Validacion de pipeline LeRobot de extremo a extremo: reproducir el ciclo completo grabacion de datos, entrenamiento con `lerobot-train` y publicacion en el Hub, usando este repositorio como punto de partida conocido.
- Prototipado de bajo coste en hardware de consumo: desplegar la politica en una GPU de gama media o en un equipo de borde para validar si un VLA de ~450 M de parametros basta para una tarea de pick-and-place estructurada.
- Investigacion en destilacion y compresion: emplear los 450 M de parametros como estudiante o como referencia para estudiar cuantizacion y poda en politicas VLA sin asumir el coste de modelos de miles de millones de parametros.
- Automatizacion de celulas de ensamblaje con objetos planos: adaptar la receta a tareas de apilado o clasificacion de piezas en linea, reentrenando con un dataset propio y manteniendo el mismo esquema de observaciones (estado de 7 dimensiones mas dos camaras).
- Docencia y divulgacion tecnica: ilustrar de forma tangible que es un modelo vision-lenguaje-accion, como se define su espacio de observaciones y acciones y como se ejecuta sobre un robot real o simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la plantilla vacia y la nota explicita "_No evaluation results have been provided for this policy yet._", por lo que no hay tasas de exito, numero de ensayos ni comparaciones cuantitativas con otras politicas. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los enlaces recuperados corresponden a subreddits sin relacion).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 1,8 GB en FP32 y 0,9 GB en FP16/BF16 (coincide con el tamano del repositorio). Sumando activaciones y los *buffers* de dos imagenes de 480x640, una estimacion razonable es de 1 a 3 GB de VRAM en precision media. Son estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM; una RTX 3060, RTX 4060, RTX 4070 o RTX 4090 es mas que suficiente. Para entrenamiento, una RTX 4090 o una A100/H100 reducen el tiempo de los 100.000 pasos documentados.
- Cabe en GPU de consumo: si. El model card afirma explicitamente que SmolVLA puede desplegarse en hardware de consumo, aunque no se detallan configuraciones minimas verificadas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion y `lerobot-train` para reentrenamiento) sobre PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje de texto sino una politica de control.
- Latencia y throughput: no disponibles. Como referencia de contexto, el dataset de entrenamiento se grabo a 30 FPS, pero el autor no publica latencias de inferencia ni frecuencia de control alcanzada en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| vis22/modv2_smolvla | 450.046.176 | estado (7,) + 2 imagenes 480x640 | apache-2.0 | HuggingFace Hub, 27 descargas |
| lerobot/smolvla_base | no disponible en la informacion proporcionada (misma familia y arquitectura) | no disponible | no disponible en la informacion proporcionada | HuggingFace Hub |
| OpenVLA | ~7.000 millones (referencia general, no verificada en la informacion proporcionada) | vision + instruccion de lenguaje | no disponible en la informacion proporcionada | referencia general |
| pi0 (Physical Intelligence) | ~3.300 millones (referencia general, no verificada en la informacion proporcionada) | vision + lenguaje, salida de acciones | no disponible en la informacion proporcionada | referencia general |

Nota: solo la fila de `vis22/modv2_smolvla` y la existencia de `lerobot/smolvla_base` como modelo base estan respaldadas por la informacion proporcionada. Las cifras de OpenVLA y pi0 se incluyen como referencia de categoria y no se han verificado en las fuentes disponibles para esta ficha.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta ajustado para una unica tarea ("apilar platos sobre el plato azul y volver a reposo") sobre un unico tipo de robot (`piper_follower`) y un unico montaje de camaras. No hay evidencia de que generalice a otras tareas, objetos o instrucciones.
- Dataset muy reducido: 49 episodios y 22.026 fotogramas son un volumen bajo, lo que aumenta el riesgo de sobreajuste a las posiciones, iluminacion y apariencia concretas de las demostraciones.
- Sin evaluacion publicada: no existe tasa de exito ni numero de ensayos, por lo que no se puede estimar la fiabilidad en produccion. Cualquier despliegue requiere evaluacion propia en el robot real.
- Dependencia estricta del esquema de observaciones: los nombres de las camaras (`cam_global`, `cam_gripper`), sus resoluciones (480x640) y el vector de estado de 7 dimensiones deben coincidir con los del entrenamiento; cualquier cambio invalida la politica.
- Idiomas y condicionamiento textual: no se informa de idiomas soportados y la unica instruccion documentada esta en ingles. No hay datos sobre comportamiento con instrucciones alternativas.
- Riesgo de alucinacion: en sentido estricto no aplica (no genera texto), pero si existe riesgo de acciones erroneas o inseguras cuando la escena difiere de la distribucion de entrenamiento, algo critico en un robot fisico.
- Sesgos: no disponibles; el autor no documenta analisis de sesgo ni de cobertura de condiciones de iluminacion, posiciones de objeto o distractores.
- Licencia: apache-2.0, que permite uso comercial. Conviene verificar igualmente las condiciones del modelo base `lerobot/smolvla_base`, de LeRobot y de las dependencias empleadas antes de un despliegue comercial.
- Documentacion incompleta: la model card conserva comentarios de plantilla sin rellenar (por ejemplo, el bloque de evaluacion y el de demostracion) y no incluye informacion sobre cuantizacion ni sobre el contexto de la arquitectura.
- Fechas anomalas: las marcas de creacion y actualizacion del repositorio (2026-09-19) son posteriores a la fecha habitual de consulta; se reproducen tal cual aparecen en la informacion proporcionada.
- Seguridad fisica: cualquier uso sobre hardware real debe hacerse con limites de parada, vigilancia humana y validacion previa en entorno controlado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vis22/modv2_smolvla
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/plates_stack_v2
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/plates_stack_v2
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Imagen de arquitectura citada en la model card: https://cdn-uploads.huggingface.co/production/uploads/640e21ef3c82bd463ee5a76d/aooU0a3DMtYmy_1IWMaIM.png
- Busqueda web realizada: sin resultados relevantes; los enlaces recuperados corresponden a subreddits (r/readit, r/navy, r/transformation, r/Kleinanzeigen, r/Watches) sin relacion con el modelo.
