# toniotgz/act_pick_box_v2

## Resumen

`toniotgz/act_pick_box_v2` es una politica de aprendizaje por imitacion para robotica, no un modelo de lenguaje. Se trata de una implementacion de Action Chunking with Transformers (ACT) entrenada con la libreria LeRobot de Hugging Face y publicada por el usuario toniotgz. El modelo predice secuencias cortas de acciones (chunks) a partir de observaciones visuales y de estado del robot, en lugar de predecir un unico paso de accion, lo que reduce el error de compounding tipico de las politicas paso a paso.

El modelo esta especializado en una unica tarea de manipulacion: "Pick up the box from the table" (recoger la caja de la mesa). Consume una imagen frontal de 480x640 pixeles y un vector de estado de 6 dimensiones, y produce un vector de accion de 6 dimensiones, todo ello para el brazo robotico SO-101 en configuracion `so_follower`. Cuenta con aproximadamente 51,7 millones de parametros.

Su relevancia es principalmente didactica y de investigacion: sirve como ejemplo reproducible de entrenamiento de una politica ACT con LeRobot, como punto de partida para fine-tuning en tareas propias y como base para comparar metodos de imitation learning. No incluye resultados de evaluacion publicados, por lo que su fiabilidad real en robot fisico no esta cuantificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con VAE condicional (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Longitud de contexto | no disponible (no aplica: politica robotica que predice chunks de acciones) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin cuantizaciones alternativas) |
| Idiomas soportados | no disponible (no aplica, el modelo no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 5,0 GB |
| Tipo de robot | SO-101 (`so_follower`) |
| Camaras | `front` |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |
| Libreria | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT (referencia arXiv 2304.13705) es un metodo de imitation learning basado en un transformer encoder-decoder con una VAE condicional (CVAE). El encoder procesa las observaciones multimodales (imagen y estado), mientras que el decoder genera un chunk de acciones de horizonte fijo en lugar de una sola accion. Esta formulacion reduce la acumulacion de errores y permite tasas de exito altas en tareas de manipulacion teleoperadas. El modelo fue entrenado y subido al Hub con LeRobot.

Los datos de entrenamiento provienen del dataset `toniotgz/so101_pick_box_v2`: 32 episodios, 14.330 fotogramas a 30 FPS, con la unica tarea "Pick up the box from the table". La configuracion de entrenamiento registrada es: 40.000 pasos, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y version de LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni tecnicas de alineamiento por preferencias, algo que no aplica a politicas de accion.

## Capacidades

- Generacion de acciones de manipulacion: predice chunks de acciones de 6 dimensiones para el brazo SO-101.
- Percepcion visual: consume una imagen frontal de 480x640 pixeles junto con el estado del robot de 6 dimensiones.
- Ejecucion de una tarea especifica de pick-and-place sobre una caja situada en la mesa.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas (no aprendizaje por refuerzo).
- Inferencia en tiempo real a 30 FPS en hardware adecuado.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural ni comportamiento de agente conversacional.
- No dispone de capacidades multilingues (no procesa texto).
- No incluye modo de razonamiento (thinking), vision-lenguaje, audio ni generacion de texto.

## Casos de uso

- Recogida automatizada de objetos en laboratorio: la politica ejecuta la tarea de recoger una caja de la mesa sobre un SO-101 real, util como demostracion funcional de una politica ACT entrenada de principio a fin con LeRobot.
- Punto de partida para fine-tuning: sirve como inicializacion para entrenar variantes de la misma tarea con nuevas posiciones de objeto, iluminacion o distracciones mediante `lerobot-train`.
- Docencia en robotica e imitation learning: ejemplo reproducible y de bajo coste computacional para explicar el flujo completo de teleoperacion, grabacion de dataset y entrenamiento.
- Validacion de pipelines de datos: permite comprobar que un dataset LeRobot (episodios, FPS, claves de observacion) es coherente antes de escalar a tareas mayores.
- Benchmark interno de metodos: base de comparacion para medir ACT frente a otras politicas (por ejemplo Diffusion Policy) sobre la misma tarea y robot.
- Pruebas de integracion hardware-software: su tamano reducido permite desplegarlo en equipos modestos para verificar calibracion de camaras, puertos y control del brazo antes de invertir en modelos mayores.
- Iteracion rapida en investigacion: al tener solo 40.000 pasos de entrenamiento y 51,7 M de parametros, permite experimentar con hiperparametros y aumentos de datos con ciclos de entrenamiento cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que aun no se han proporcionado resultados de evaluacion para esta politica y no incluye tabla de exitos en robot real. Tampoco se aportan metricas en simulacion (por ejemplo, tasas de exito por tarea) ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 el modelo ocupa aproximadamente 207 MB; en FP16, unos 103 MB; en int8, unos 52 MB. El cuello de botella real es el procesamiento de imagen, no los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una RTX 3060 o superior; tambien es viable en NVIDIA Jetson (Orin, Xavier) para despliegue embebido junto al robot.
- Cabe en GPU de consumo: si, con amplio margen. El modelo puede ejecutarse incluso en CPU, aunque con menor throughput, y es apto para dispositivos de borde.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch con CUDA o CPU a traves de la libreria `lerobot`. No es compatible con vLLM, TGI ni llama.cpp, ya que no es un LLM.
- Latencia y throughput: la inferencia esta pensada para operar a 30 FPS (frecuencia a la que se grabo el dataset); no se publican cifras concretas de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `toniotgz/act_pick_box_v2` | ACT (transformer + VAE) | 51.668.614 | Imagen 480x640 + estado 6D | apache-2.0 | Hugging Face (LeRobot) |
| Diffusion Policy (LeRobot) | Diffusion policy | no disponible | Imagen + estado | no disponible | LeRobot |
| SmolVLA (Hugging Face) | Vision-language-action | no disponible (aprox. cientos de millones) | Vision-lenguaje-accion | no disponible | Hugging Face (LeRobot) |

No se dispone de datos verificados de parametros y contexto para las alternativas citadas, por lo que la comparacion cuantitativa no es posible. A nivel cualitativo, ACT es mas ligero y mas rapido de entrenar que una politica de difusion o que un modelo vision-language-action, pero esta limitado a una unica tarea y a una configuracion de robot especifica.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una sola tarea ("Pick up the box from the table") y no generaliza a otras tareas sin reentrenamiento.
- Dataset muy reducido: 32 episodios y 14.330 fotogramas, lo que aumenta el riesgo de sobreajuste a las posiciones, iluminacion y objetos vistos durante la teleoperacion.
- Sin resultados de evaluacion: no se ha publicado tasa de exito en robot real, por lo que su robustez no esta cuantificada.
- Dependencia de hardware concreto: disenada para el SO-101 en modo `so_follower` con una unica camara frontal; cambiar robot, numero de camaras o resolucion invalida las observaciones esperadas.
- Sin capacidades de lenguaje: no procesa instrucciones en lenguaje natural ni admite tool calling; la tarea se activa mediante el parametro `--task`.
- Idiomas: no disponible, ya que el modelo no trabaja con texto.
- Licencia: apache-2.0, que permite uso comercial y modificacion, pero se recomienda citar el metodo ACT (arXiv 2304.13705) y LeRobot segun indica la model card.
- Riesgo de comportamiento inseguro en robot fisico: al ser una politica de control, debe validarse en entorno controlado antes de cualquier despliegue con personas o materiales fragiles.
- Sesgos: no se documentan sesgos especificos; en robotica, el principal riesgo es el sesgo de distribucion del dataset de demostracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/toniotgz/act_pick_box_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/toniotgz/so101_pick_box_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento (imitation learning): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=toniotgz/so101_pick_box_v2
