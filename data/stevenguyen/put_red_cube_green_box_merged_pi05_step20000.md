# SteveNguyen/put_red_cube_green_box_merged_pi05_step20000

## Resumen

`put_red_cube_green_box_merged_pi05_step20000` es un policy de robotica basado en π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado originalmente por Physical Intelligence y adaptado a LeRobot por Hugging Face. El modelo ha sido afinado por el usuario SteveNguyen sobre el checkpoint base `lerobot/pi05_base` para ejecutar una unica tarea de manipulacion: "put the red cube in the green box" (introducir el cubo rojo en la caja verde).

Se trata de un fine-tuning de imitacion (imitation learning) realizado con LeRobot 0.6.1, entrenado durante 20.000 pasos con batch size 32 y learning rate 2,5e-05 sobre un dataset de 217 episodios y 39.650 frames a 30 FPS. El modelo consume una imagen de camara de 360x480 y un vector de estado de 2 dimensiones, y produce acciones de 8 dimensiones para el robot de tipo `grabette`.

Su relevancia es limitada y muy especifica: no es un modelo de proposito general, sino un artefacto de investigacion reproducible que demuestra el flujo completo de LeRobot para entrenar y desplegar policies VLA en robots reales. Con 0 descargas y 0 likes en el momento de la consulta, es un ejemplo practico de fine-tuning mas que una herramienta lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅ (Pi05), un VLA de Physical Intelligence disenado para generalizacion en entornos abiertos, que evoluciona π₀ para generalizar a situaciones y entornos no vistos durante el entrenamiento. La implementacion concreta de este repositorio procede de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. El modelo procesa observaciones multimodales (imagen de camara y estado del robot) y emite directamente acciones de control.

El fine-tuning se realizo sobre el dataset `SteveNguyen/put_red_cube_green_box_merged_graspproj_chunkrel` (217 episodios, 39.650 frames a 30 FPS) con la tarea unica "put the red cube in the green box". La configuracion de entrenamiento fue: 20.000 pasos, batch size 32, optimizador AdamW, learning rate 2,5e-05, semilla 1000 y LeRobot 0.6.1. El modelo recibe `observation.images.cam0` con forma (3, 360, 480) y `observation.state` con forma (2,), y produce `action` con forma (8,). No se detalla en la informacion disponible si hubo RLHF, DPO ni la composicion exacta del dataset de preentrenamiento original de Pi05.

## Capacidades

- Control robotico de manipulacion: ejecuta la tarea especifica de colocar un cubo rojo en una caja verde a partir de una unica camara y el estado del robot.
- Percepcion visual: procesa imagenes de 360x480 píxeles procedentes de la camara `cam0`.
- Fusion vision-lenguaje-accion: integra la instruccion de tarea en lenguaje natural con la observacion visual para generar acciones.
- Generacion de acciones continuas de 8 dimensiones para el robot `grabette`.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones humanas.
- No se dispone de informacion sobre soporte de tool calling, agentes, capacidades multilingues, thinking mode, vision general, audio ni otras capacidades fuera del control robotico.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta la tarea "put the red cube in the green box" sobre el robot `grabette`, adecuado para validar pipelines de imitation learning en entornos controlados.
- Reproduccion de experimentos de LeRobot: sirve como referencia reproducible para comparar configuraciones de entrenamiento (pasos, batch size, learning rate) en la misma tarea.
- Base para fine-tuning de tareas similares: al estar afinado sobre `lerobot/pi05_base`, puede servir como punto de partida para tareas de recogida y deposito con objetos y contenedores analogos.
- Docencia y formacion en robotica: ejemplo completo de entrenamiento y despliegue de un policy VLA con LeRobot, util para cursos practicos.
- Validacion de hardware y calibracion: permite comprobar el funcionamiento de la camara `cam0` y del robot `grabette` antes de entrenar policies propios.
- Pruebas de integracion en pipelines de robotica: se puede desplegar con `lerobot-rollout` para verificar la cadena completa de inferencia en el robot real.
- Benchmark interno de imitation learning: sirve como baseline de exito/fracaso en la tarea concreta para comparar nuevos entrenamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para este policy y que la tabla de evaluacion esta vacia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 4,14 mil millones de parametros, una estimacion orientativa en FP16 seria de unos 8-9 GB solo para pesos, mas el overhead de activaciones e imagenes, pero el dato no esta confirmado por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamano de parametros podria caber en GPUs de 16-24 GB en precision reducida, pero no hay dato oficial.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=SteveNguyen/put_red_cube_green_box_merged_pi05_step20000`; el entrenamiento se realiza con `lerobot-train`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| put_red_cube_green_box_merged_pi05_step20000 | 4,14 mil millones | no disponible | Manipulacion pick-and-place (cubo rojo en caja verde) | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA base de proposito general para robotica | no disponible en la informacion | Hugging Face (modelo base) |
| π₀.₅ (Pi05) original de Physical Intelligence | no disponible | no disponible | VLA para generalizacion en entornos abiertos | no disponible en la informacion | Blog de Physical Intelligence y OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en una unica tarea ("put the red cube in the green box") y no generaliza a otras tareas sin reentrenamiento.
- Depende de una configuracion de hardware concreta: robot `grabette`, una camara `cam0` y un vector de estado de 2 dimensiones; cambios en la camara o en el robot invalidan el policy.
- No hay resultados de evaluacion publicados, por lo que se desconoce la tasa de exito real en el robot.
- Riesgo de sobreajuste al dataset de 217 episodios y a las condiciones de iluminacion, posiciones y distractores presentes en el mismo.
- No se dispone de informacion sobre sesgos, comportamiento fuera de distribucion ni robustez ante cambios de escena.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de evaluacion y de soporte del autor hace desaconsejable su uso en produccion sin validacion previa.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se dispone de informacion sobre cuantizacion ni sobre requisitos minimos de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SteveNguyen/put_red_cube_green_box_merged_pi05_step20000
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/SteveNguyen/put_red_cube_green_box_merged_graspproj_chunkrel
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SteveNguyen/put_red_cube_green_box_merged_graspproj_chunkrel
- Blog de π₀.₅ (Pi05): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
