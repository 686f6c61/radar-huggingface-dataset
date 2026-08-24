# team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-200-smolvla_fft-30000

## Resumen

SmolVLA es un modelo de vision-language-action (VLA) compacto y eficiente desarrollado por Hugging Face, disenado para controlar robots mediante instrucciones en lenguaje natural. Este repositorio concreto contiene un checkpoint intermedio (paso 30.000 de 90.000) de un fine-tuning del modelo base `lerobot/smolvla_base`, realizado por el equipo SOBITS sobre un dataset propio de manipulacion robotica real. El modelo esta especializado en la tarea "lanzar la botella de plastico a la papelera" y utiliza un robot manipulador movil con dos camaras.

La relevancia de este modelo radica en que SmolVLA demuestra que es posible obtener un rendimiento competitivo en tareas de manipulacion robotica con un coste computacional reducido, siendo desplegable en hardware de consumo. El fine-tuning sobre datos reales (200 episodios, 42.390 frames) permite adaptar el modelo base a una tarea domestica concreta, mostrando el flujo completo de entrenamiento con LeRobot. El modelo tiene 450 millones de parametros y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles: "Throw the plastic bottle into the trash bin") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-language-action que combina un codificador visual, un modelo de lenguaje y un modulo de prediccion de acciones. Su arquitectura esta optimizada para ser compacta y eficiente, permitiendo su ejecucion en hardware de consumo, a diferencia de otros VLA mas grandes como OpenVLA o Pi0. El modelo base fue preentrenado por el equipo de LeRobot/Hugging Face y posteriormente fine-tuneado por SOBITS mediante full fine-tuning (FFT) sobre el dataset `team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-200`.

El dataset de entrenamiento contiene 200 episodios reales con 42.390 frames a 10 FPS, capturados con dos camaras (cabeza y mano izquierda) a resolucion 480x640. La configuracion de entrenamiento incluye 30.000 pasos (checkpoint intermedio de un run de 90.000), batch size 16, optimizador AdamW y learning rate 0,0001. El modelo recibe como entrada el estado del robot (20 dimensiones) y las imagenes de ambas camaras, y produce acciones de 20 dimensiones. Se utilizo LeRobot version 0.6.0 para el entrenamiento.

## Capacidades

- Control robotico por imitacion: ejecuta la tarea "lanzar la botella de plastico a la papelera" sobre un manipulador movil.
- Percepcion multimodal: procesa simultaneamente dos flujos de video (camara de cabeza y camara de mano) junto con el estado propioceptivo del robot.
- Generacion de acciones continuas: produce vectores de accion de 20 dimensiones a partir de observaciones visuales y de estado.
- Aprendizaje por demostracion: el fine-tuning sobre datos reales permite adaptar el comportamiento a entornos y objetos especificos.
- Despliegue en hardware de consumo: al ser un modelo compacto, puede ejecutarse en GPUs de gama media.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot.

## Casos de uso

- Automatizacion de tareas domesticas: el modelo puede integrarse en robots de asistencia en el hogar para tareas de recogida y clasificacion de residuos, como lanzar botellas a una papelera.
- Reciclaje automatizado en entornos controlados: en plantas de clasificacion o puntos limpios, un manipulador movil equipado con este modelo puede separar objetos reciclables.
- Investigacion en robotica de imitacion: sirve como punto de partida para estudiar tecnicas de fine-tuning de VLA sobre datos reales con pocos episodios (200 demostraciones).
- Desarrollo de robots de servicio en entornos comerciales: restaurantes, oficinas o tiendas donde un robot debe recoger objetos y depositarlos en contenedores.
- Benchmark de manipulacion movil: el checkpoint intermedio permite estudiar la evolucion del aprendizaje durante el entrenamiento comparando con el modelo final de 90.000 pasos.
- Educacion y prototipado: al ser un modelo pequeno con licencia permisiva, es adecuado para cursos de robotica de aprendizaje por imitacion y para validar pipelines completos de LeRobot en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"). Se recomienda consultar el paper de SmolVLA (arxiv:2506.01844) para datos de rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Dado el tamano del modelo (450M parametros), se estima que puede caber en GPUs con 8-12 GB de VRAM en FP16, aunque este dato no esta confirmado.
- GPU recomendadas: el paper de SmolVLA indica que el modelo esta disenado para hardware de consumo; GPUs como RTX 3060/4060/4090 deberian ser suficientes para inferencia.
- Compatibilidad con consumer GPU: si, este es uno de los objetivos del diseno de SmolVLA.
- Opciones de despliegue: LeRobot (framework principal), con soporte para rollout en robot real mediante `lerobot-rollout`. No se menciona compatibilidad con vLLM, Ollama o llama.cpp al tratarse de un modelo de robotica, no de texto generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Contexto |
|---|---|---|---|---|
| SmolVLA (este modelo) | 450M | VLA compacto | Apache 2.0 | Robotica, manipulacion |
| OpenVLA | 7B | VLA | MIT | Robotica, manipulacion |
| Pi0 (Physical Intelligence) | 3.3B | VLA flow-matching | no disponible | Robotica, manipulacion |
| lerobot/smolvla_base | 450M | VLA base preentrenado | Apache 2.0 | Robotica, manipulacion |

La comparativa se basa en datos publicos de los modelos mencionados. SmolVLA destaca por su tamano reducido frente a OpenVLA (7B) y Pi0 (3.3B), lo que permite su despliegue en hardware mas asequible. El modelo base `lerobot/smolvla_base` es el punto de partida de este fine-tuning.

## Limitaciones y advertencias

- Checkpoint intermedio: este modelo es un checkpoint a mitad del entrenamiento (paso 30.000 de 90.000), por lo que su rendimiento puede ser inferior al modelo final disponible en `team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-200-smolvla_fft-90000`.
- Tarea unica: el modelo esta especializado exclusivamente en la tarea de lanzar botellas de plastico a la papelera. No es generalista y no funcionara correctamente en otras tareas sin reentrenamiento.
- Datos limitados: el fine-tuning se realizo con 200 episodios de un unico entorno (SOBITS HOME), lo que puede limitar la generalizacion a otros entornos, condiciones de iluminacion o variaciones de objetos.
- Sin evaluacion publicada: no hay resultados de evaluacion en robot real, por lo que se desconoce la tasa de exito real de la politica.
- Requiere robot especifico: el modelo espera un robot tipo `mobile_manipulator` con dos camaras (cabeza y mano izquierda) y un espacio de estado/accion de 20 dimensiones. No es portable a otros robots sin adaptacion.
- Instrucciones en ingles: la tarea se define en ingles, lo que puede limitar su uso con instrucciones en otros idiomas.
- Sin informacion sobre sesgos: no se han documentado sesgos especificos, pero al entrenarse en un entorno unico puede presentar sesgos hacia ese entorno particular.

## Enlaces

- Repositorio del modelo: https://huggingface.co/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-200-smolvla_fft-30000
- Modelo final (90.000 pasos): https://huggingface.co/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-200-smolvla_fft-90000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-200
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guia SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio SOBITS HOME: https://github.com/TeamSOBITS/sobit_home
