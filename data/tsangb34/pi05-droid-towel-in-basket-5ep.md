# tsangb34/pi05-droid-towel-in-basket-5ep

## Resumen

El modelo tsangb34/pi05-droid-towel-in-basket-5ep es un ajuste fino de π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence y adaptado a la libreria LeRobot por Hugging Face. Se trata de una politica robotica que combina percepcion visual, comprension del lenguaje y generacion de acciones motrices para controlar un brazo robotico Franka. El autor tsangb34 lo ha entrenado sobre el modelo base lerobot/pi05_base mediante aprendizaje por imitacion, especializandolo en una unica tarea: colocar una toalla dentro de una cesta ("towel in basket").

El modelo cuenta con 4.143.404.816 parametros (aproximadamente 4,14 mil millones) almacenados en formato safetensors, con un tamano de repositorio de 24,5 GB. Procesa observaciones multimodales (estado articular, posicion cartesiana y tres flujos de camara) y produce un vector de accion de 8 dimensiones, lo que lo situa en el paradigma actual de las politicas VLA end-to-end que sustituyen a los pipelines clasicos de planificacion y control. Su relevancia radica en que demuestra la viabilidad de reutilizar un modelo VLA preentrenado y adaptarlo a tareas concretas con solo 100 episodios de demostracion y 4.285 pasos de entrenamiento.

La licencia Apache 2.0 facilita su reutilizacion y experimentacion, aunque al ser un ajuste muy especifico su utilidad practica fuera del escenario de entrenamiento es limitada. No se han publicado resultados de evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 4.143.404.816 (aproximadamente 4,14 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos safetensors) |
| Idiomas soportados | no disponibles (politica robotica; recibe una cadena de tarea de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Libreria | lerobot (version 0.6.1 en el entrenamiento) |
| Tipo de robot | franka |
| Entradas | observation.state (8,), observation.cartesian_position (6,), observation.images.left_image (3,360,640), observation.images.wrist (3,360,640), observation.images.empty_camera_0 (3,224,224) |
| Salidas | action (8,) |
| Tamano del repositorio | 24,5 GB |

## Arquitectura y entrenamiento

La informacion disponible indica que π₀.₅ (Pi05) es un modelo Vision-Language-Action de Physical Intelligence concebido para generalizacion en mundo abierto, evolucionando a π₀ para operar en entornos y situaciones nunca vistos durante el entrenamiento. La implementacion utilizada en este repositorio procede del repositorio OpenPI de codigo abierto de Physical Intelligence, adaptada a LeRobot. No se detallan en la model card los componentes internos exactos (codificador visual, backbone de lenguaje, cabecera de accion), el numero de tokens de entrenamiento del modelo base ni el uso de tecnicas como RLHF o DPO.

El ajuste fino se ha realizado mediante aprendizaje por imitacion sobre el dataset local/droid-towel-in-basket-left-wrist, derivado de la tarea DROID, con 100 episodios, 27.395 fotogramas y una frecuencia de 30 FPS. La configuracion de entrenamiento registrada es la siguiente: 4.285 pasos, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 1000. El sufijo "5ep" del nombre del modelo no coincide con un numero de epocas explicitamente documentado, ya que no se especifica el numero de epocas. No se documentan innovaciones tecnicas adicionales mas alla de las propias del modelo base.

## Capacidades

- Generacion de acciones motoras de 8 dimensiones para control de un brazo robotico Franka.
- Percepcion visual multimodal mediante tres camaras: vista lateral izquierda, camara de muneca y una tercera camara (empty_camera_0).
- Fusion de estado propioceptivo: posicion articular (8 valores) y posicion cartesiana (6 valores).
- Condicionamiento por tarea en lenguaje natural: acepta una cadena como "towel in basket" para definir el objetivo.
- Ejecucion de la tarea especifica de colocar una toalla en una cesta.
- Capacidad de generalizacion a entornos nuevos heredadda teoricamente del modelo base π₀.₅, aunque no verificada para este ajuste.
- Soporte de tool calling: no disponible / no aplica (es una politica robotica, no un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): solo vision; audio y modo de razonamiento no disponibles.

## Casos de uso

- Manipulacion robotica de laboratorio: como politica especializada en una tarea unica, permite reproducir de forma autonoma la colocacion de una toalla en una cesta sobre un Franka, util para experimentos controlados de imitacion.
- Base para nuevos ajustes finos: sirve como punto de partida (fine-tuning) para otras tareas de manipulacion partiendo de un modelo ya adaptado al dominio DROID.
- Investigacion en aprendizaje por imitacion: permite reproducir la metodologia de entrenamiento de LeRobot con datasets pequenos (100 episodios) y estudiar la transferencia desde un VLA preentrenado.
- Pruebas de despliegue con LeRobot: el comando lerobot-rollout permite ejecutar la politica en robot real durante una duracion determinada, adecuado para validar pipelines de inferencia.
- Evaluacion de robustez en robot real: al ser una politica de tarea unica, es adecuada para medir tasas de exito ante variaciones de posicion, iluminacion o distractores.
- Benchmarking interno de hardware de inferencia: con 4,14 mil millones de parametros, sirve para medir latencia y throughput de politicas VLA en GPUs de consumo frente a GPUs de centro de datos.
- Formacion y docencia en robotica: ejemplo didactico completo del flujo LeRobot (instalacion, hardware, grabacion de datos, entrenamiento y despliegue).

## Benchmarks y rendimiento

"No se han publicado resultados de benchmarks en la informacion disponible." No se proporcionan tablas de evaluacion (tipo MMLU, HumanEval, GSM8K) ni resultados de robot real. La model card indica explicitamente que no se han facilitado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 4,14 mil millones de parametros en precision FP16/BF16 ocupan aproximadamente 8,3 GB solo de pesos, a lo que hay que sumar los codificadores visuales y el estado de inferencia.
- GPU recomendadas: no indicadas por el autor. Por tamano, cabe previsiblemente en GPU de centro de datos (A100 40/80 GB, H100) y en GPUs de consumo de gama alta con 24 GB o mas (por ejemplo RTX 3090 o RTX 4090).
- Cabe en GPU de consumo: probablemente si en tarjetas con 24 GB de VRAM en FP16/BF16; los requisitos exactos no estan confirmados en la informacion disponible.
- Opciones de despliegue: LeRobot mediante el comando lerobot-rollout con --strategy.type=base, sobre un robot Franka con camaras OpenCV. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (orientados a LLM de texto, no a politicas VLA).
- Latencia y throughput estimados: no disponibles. La politica se entrena y ejecuta a 30 FPS en la captura de datos, pero no se especifica la frecuencia de inferencia en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tsangb34/pi05-droid-towel-in-basket-5ep | 4,14 mil millones | VLA ajustado (tarea unica) | apache-2.0 | Hugging Face | Ajuste sobre lerobot/pi05_base |
| lerobot/pi05_base | no disponible | VLA base | no disponible | Hugging Face | Modelo base del que parte este ajuste |
| april5129/pi05-droid-toy-and-towel | no disponible | VLA ajustado (varias tareas) | no disponible | Hugging Face | Otro ajuste Pi05 sobre DROID |
| s3y/pi05_droid_pytorch | no disponible | VLA ajustado | no disponible | Hugging Face | Ajuste Pi05 en PyTorch |

Nota: los datos de parametros, contexto y rendimiento de los modelos alternativos no estan disponibles en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Politica de tarea unica: entrenada exclusivamente para "towel in basket"; no se espera que generalice a otras tareas sin reentrenamiento.
- Sesgos conocidos: no documentados, pero al derivar de DROID y de un dataset de 100 episodios, hereda los sesgos de posicion, iluminacion y configuracion de camara de esas demostraciones.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero existe riesgo de acciones incorrectas o inseguras ante situaciones fuera de la distribucion de entrenamiento.
- Limitaciones de contexto o idioma: el modelo base soporta condicionamiento por texto, pero este ajuste solo se ha validado con la instruccion "towel in basket"; las capacidades multilingues no estan documentadas.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial; se debe atribuir adecuadamente segun la cita indicada (LeRobot y el metodo de Pi05).
- Especificidad de hardware: las claves de observacion (nombres de camaras como left_image, wrist, empty_camera_0) deben coincidir exactamente con las usadas en el entrenamiento; de lo contrario la politica fallara.
- Sin evaluacion publicada: no hay tasa de exito ni numero de ensayos en robot real, por lo que el rendimiento real en produccion es incierto.
- Uso en robot real: requiere un Franka calibrado y camaras configuradas; existe riesgo fisico si se despliega sin supervision.
- Datos de entrenamiento limitados: 100 episodios y 4.285 pasos de entrenamiento, lo que puede reducir la robustez ante variaciones del entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsangb34/pi05-droid-towel-in-basket-5ep
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/local/droid-towel-in-basket-left-wrist
- Blog de Pi05 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio, LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de Pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- OpenPI (Physical Intelligence): https://deepwiki.com/Physical-Intelligence/openpi
- Entrenamiento sobre datos DROID: https://deepwiki.com/Physical-Intelligence/openpi/6.2-training-on-droid-data
- Reproduccion de Pi05 (Integer003): https://github.com/Integer003/openpi05
- Ajuste alternativo april5129/pi05-droid-toy-and-towel: https://huggingface.co/april5129/pi05-droid-toy-and-towel/tree/main
- Ajuste alternativo s3y/pi05_droid_pytorch: https://huggingface.co/s3y/pi05_droid_pytorch
