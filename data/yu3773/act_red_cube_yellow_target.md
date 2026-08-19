# Yu3773/act_red_cube_yellow_target

## Resumen

El modelo `Yu3773/act_red_cube_yellow_target` es una politica de robotica entrenada mediante aprendizaje por imitacion con el metodo Action Chunking with Transformers (ACT), publicado en el paper de Zhao et al. (arXiv:2304.13705). Desarrollado por Yu Sakuta (Yu3773) y entrenado con el framework LeRobot de Hugging Face, el modelo esta especializado en una tarea unica de manipulacion: recoger un cubo rojo y colocarlo dentro de un area objetivo amarilla.

La arquitectura ACT combina un transformer con un CVAE (Conditional Variational Autoencoder) para predecir secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de exito en tareas de manipulacion con datos de teleoperacion limitados. El modelo tiene aproximadamente 51,7 millones de parametros y consume observaciones de dos camaras (vista cenital y muneca) junto con el estado del robot (6 dimensiones), produciendo acciones de 6 dimensiones.

Este modelo es relevante porque demuestra un caso de uso practico del ecosistema LeRobot: un usuario individual puede entrenar una politica de manipulacion con solo 34 episodios de demostracion (14.937 frames) y publicarla en Hugging Face para su reproduccion. Su tamano reducido permite ejecutarlo en hardware modesto, lo que lo convierte en un punto de partida accesible para investigadores y desarrolladores que trabajan con robots SO-101 o brazos similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con CVAE |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (politica de robotica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en fp32 por defecto en LeRobot) |
| Idiomas soportados | no aplicable (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura ACT se basa en un transformer encoder-decoder que procesa observaciones visuales (imagenes de dos camaras: cenital y muneca, ambas a 480x640 píxeles) y el estado del robot (6 dimensiones). El componente CVAE permite modelar la variabilidad en las demostraciones humanas, generando multiples trayectorias validas para una misma tarea. En lugar de predecir una sola accion, el modelo genera un "chunk" de acciones futuras, lo que reduce la acumulacion de errores y mejora la suavidad del movimiento.

El entrenamiento se realizo con el dataset `Yu3773/so101_red_cube_yellow_target`, que contiene 34 episodios teleoperados a 30 FPS (14.937 frames en total) de la tarea "Pick up the red cube and place it inside the yellow target area". La configuracion de entrenamiento incluye 20.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-05 y semilla 1000. Se utilizo la version 0.6.0 de LeRobot. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento posterior al aprendizaje por imitacion.

## Capacidades

- Manipulacion robotica: ejecuta la tarea de pick-and-place de un cubo rojo hacia un area amarilla, controlando un robot SO-101 (SoFollower).
- Percepcion visual multimodal: procesa simultaneamente dos flujos de camara (vista cenital y vista de muneca) para localizar el objeto y el destino.
- Control de bajo nivel: genera acciones continuas de 6 dimensiones (posicion y orientacion del efector final) a 30 Hz.
- Aprendizaje por imitacion: reproduce la politica aprendida de demostraciones humanas teleoperadas.
- Ejecucion en tiempo real: el modelo es lo suficientemente ligero (51,7 M parametros) para inferencia en tiempo real en una GPU de consumo o incluso CPU.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot.

## Casos de uso

- Automatizacion de tareas repetitivas de pick-and-place: el modelo puede integrarse en una celda robotica para trasladar piezas de una posicion a otra, como en lineas de ensamblaje o clasificacion, gracias a su capacidad de operar con dos camaras y control continuo de 6 grados de libertad.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del numero de demostraciones, la arquitectura ACT o la configuracion de hiperparametros en la tasa de exito de tareas de manipulacion.
- Prototipado rapido en robotica: con solo 34 episodios de datos, un desarrollador puede entrenar y desplegar una politica funcional en un robot SO-101, lo que acelera la validacion de conceptos antes de escalar a datasets mayores.
- Educacion en robotica y aprendizaje automatico: el modelo y su dataset asociado son recursos didacticos para ensenar conceptos de aprendizaje por imitacion, transformadores y control robotico en entornos universitarios o bootcamps.
- Benchmark de reproduccion: al estar publicado con configuracion completa de entrenamiento, permite a otros equipos reproducir los resultados y comparar variantes (por ejemplo, cambiando el numero de camaras o el tamaño del action chunk).
- Desarrollo de sistemas de robotica asistiva: la tarea de recoger y colocar objetos puede adaptarse a entornos de asistencia en laboratorios o almacenes, donde un brazo robotico colaborativo ejecuta tareas simples bajo supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". No existen datos de tasa de exito en robot real, ni comparaciones con otras politicas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (51,7 M parametros), por lo que cabe en cualquier GPU moderna con al menos 4 GB.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (GTX 1060 o superior, RTX 3060, RTX 4090, A100, etc.). Tambien puede ejecutarse en CPU para pruebas de baja frecuencia, aunque la inferencia en tiempo real a 30 Hz requeriria al menos una GPU de gama media.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo como RTX 3060 (12 GB) o incluso en placas con 4-6 GB de VRAM.
- Opciones de despliegue: el ecosistema LeRobot proporciona el script `lerobot-rollout` para ejecutar la politica en el robot. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamano del modelo, se estima una latencia de inferencia inferior a 10 ms en GPU moderna, lo que permite operar a 30 Hz.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente publicados en la informacion proporcionada. ACT es una arquitectura establecida en robotica, y alternativas como Diffusion Policy (Chi et al., 2023) o RT-1 (Brohan et al., 2022) resuelven tareas similares, pero no se han encontrado repositorios equivalentes del mismo autor ni del mismo robot en la busqueda web. La comparativa queda limitada a la descripcion general de la arquitectura frente a otras:

| Modelo | Arquitectura | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| Yu3773/act_red_cube_yellow_target | ACT (Transformer + CVAE) | 51,7 M | N/A (robotica) | Apache-2.0 |
| Diffusion Policy (referencia) | Diffusion model | variable | N/A (robotica) | variable |
| RT-1 (referencia) | Transformer | 35 M | N/A (robotica) | no disponible |

## Limitaciones y advertencias

- Politica de tarea unica: el modelo solo ejecuta la tarea especifica de recoger un cubo rojo y colocarlo en un area amarilla. No generaliza a otros objetos, colores o disposiciones sin reentrenamiento.
- Datos limitados: entrenado con solo 34 episodios, lo que puede provocar sobreajuste a las condiciones concretas del dataset (iluminacion, posicion de camaras, textura de objetos).
- Sin evaluacion publicada: no hay resultados de tasa de exito en robot real, por lo que el rendimiento real es desconocido y debe validarse antes de cualquier uso en produccion.
- Dependencia del hardware: requiere el robot SO-101 (SoFollower) y una configuracion de camaras especifica (cenital y muneca) con las mismas caracteristicas que las usadas en el entrenamiento.
- Riesgo de alucinacion motora: como toda politica de imitacion, puede generar movimientos erraticos si las observaciones en tiempo de inferencia difieren significativamente de las del entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero el modelo se distribuye sin garantias y el autor no proporciona soporte.
- Sin capacidades de lenguaje: no procesa instrucciones textuales ni dialogos; la tarea esta fijada en el momento del entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Yu3773/act_red_cube_yellow_target
- Dataset de entrenamiento: https://huggingface.co/datasets/Yu3773/so101_red_cube_yellow_target
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Yu3773/so101_red_cube_yellow_target
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de entrenamiento con robots: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout (inferencia): https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor: https://huggingface.co/Yu3773
