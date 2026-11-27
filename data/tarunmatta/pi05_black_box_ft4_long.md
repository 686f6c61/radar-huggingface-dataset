# tarunmatta/pi05_black_box_ft4_long

## Resumen

`tarunmatta/pi05_black_box_ft4_long` es un ajuste fino (fine-tuning) del modelo vision-lenguaje-accion (VLA) π₀.₅ (Pi05) de Physical Intelligence, publicado por el usuario tarunmatta en Hugging Face. El modelo base es `lerobot/pi05_base`, la implementacion de referencia de Pi05 en la libreria LeRobot de Hugging Face, derivada del repositorio OpenPI de Physical Intelligence. Pi05 esta disenado para generalizacion en entornos abiertos: parte de π₀ y lo evoluciona para operar en situaciones y entornos no vistos durante el entrenamiento.

Este checkpoint concreto ha sido entrenado mediante aprendizaje por imitacion sobre un unico dataset de 40 episodios y 8848 fotogramas a 10 FPS, con la tarea "Pick up the black box" (coger la caja negra). El robot objetivo es un `so_follower` (seguidor del SO-100/101 de LeRobot) equipado con tres camaras: una en la muneca, una en la base y una tercera camara auxiliar. La salida es un vector de accion de 6 dimensiones.

Se trata de un modelo de robotica de proposito muy especifico, no de un modelo conversacional: no procesa lenguaje natural como un LLM y no debe confundirse con un modelo de texto. Su relevancia es practica para quien quiera reproducir o adaptar un pipeline de imitacion VLA con LeRobot sobre hardware de bajo coste. Cuenta con 4.143.404.816 parametros (aproximadamente 4,14 mil millones) y un repositorio de 16,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en Pi05 (π₀.₅); implementacion LeRobot/OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; no expone interfaz de lenguaje) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | so_follower |
| Camaras | wrist, left (claves: `observation.images.left_wrist_0_rgb`, `observation.images.base_0_rgb`, `observation.images.empty_camera_0`) |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Salida de accion | `action`, forma `(6,)` |
| Resolucion de imagen | 480x640 (wrist y base), 224x224 (empty_camera) |
| Tamano del repositorio | 16,6 GB |

## Arquitectura y entrenamiento

El modelo es un VLA de tipo Pi05, que combina un codificador visual, un componente de lenguaje y un cabezal de acciones que produce comandos motores de 6 dimensiones a partir de observaciones multimodales (tres flujos de imagen mas el estado del robot). La implementacion procede de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La model card no detalla la composicion interna de capas, el mecanismo de atencion ni el numero de tokens de entrenamiento del modelo base.

El ajuste fino se realizo por aprendizaje por imitacion supervisado sobre el dataset `tarunmatta/pick_up_black_box_smolvla_v2`: 40 episodios, 8848 fotogramas a 10 FPS, una sola tarea ("Pick up the black box"). La configuracion de entrenamiento reportada es de 40.000 pasos, batch de 16, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 1000, con LeRobot 0.7.0. No se documenta el uso de RLHF, DPO ni tecnicas de refuerzo; es imitacion pura. Tampoco se describen innovaciones tecnicas adicionales mas alla de las propias de Pi05.

## Capacidades

- Control robotico mediante imitacion: genera acciones de 6 grados de libertad para un robot `so_follower` a partir de imagenes y estado articular.
- Fusion multimodal: integra tres vistas de camara (muneca, base y una tercera) con el estado del robot.
- Ejecucion de una tarea concreta: "Pick up the black box".
- Despliegue en tiempo real mediante `lerobot-rollout` con estrategia base.
- Compatible con el ecosistema LeRobot para entrenamiento, evaluacion y rollout.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision general, audio): no disponibles; la vision esta limitada a la percepcion para control motor.

## Casos de uso

- Recogida automatizada de objetos en linea de montaje: el modelo ejecuta la tarea de coger una caja negra sobre un SO-100/101, adecuado para demostrar pipelines de imitacion de bajo coste en laboratorio.
- Prototipado de politicas VLA con LeRobot: sirve como punto de partida reproducible para validar el flujo completo (`lerobot-train` y `lerobot-rollout`) antes de escalar a tareas propias.
- Investigacion en aprendizaje por imitacion: con 40 episodios y 8848 fotogramas, es un caso de estudio de como de lejos llega un ajuste fino con pocos datos sobre un VLA preentrenado.
- Benchmark interno de hardware robotico: util para medir latencia y estabilidad de un VLA de 4,14 mil millones de parametros en un robot de escritorio.
- Educacion y formacion: ejemplo didactico de configuracion de camaras, calibracion y rollout con LeRobot en un entorno controlado.
- Base para ajustes posteriores: al derivar de `lerobot/pi05_base`, puede reentrenarse con nuevos datasets manteniendo la misma interfaz de observacion y accion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,14 mil millones de parametros en safetensors, la carga en precision completa requiere del orden de 8-9 GB solo para pesos, mas memoria para activaciones y procesamiento de imagenes.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU con 16 GB o mas (RTX 4090, A100, H100) es un punto de partida razonable.
- Compatibilidad con GPU de consumo: probable en tarjetas de 16-24 GB, aunque no confirmado por el autor.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=tarunmatta/pi05_black_box_ft4_long` y `--strategy.type=base`; el ecosistema LeRobot soporta entrenamiento e inferencia en CUDA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tarunmatta/pi05_black_box_ft4_long` | 4.143.404.816 | no disponible | Coger caja negra (so_follower) | gemma | Hugging Face |
| `lerobot/pi05_base` | no disponible | no disponible | VLA generalista (base) | no disponible en la informacion | Hugging Face |
| π₀ (Pi0) | no disponible | no disponible | VLA generalista | no disponible en la informacion | OpenPI |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; solo se conoce la relacion de dependencia con `lerobot/pi05_base`.

## Limitaciones y advertencias

- Modelo de proposito unico: entrenado exclusivamente para "Pick up the black box"; no generaliza a otras tareas sin reentrenamiento.
- Dataset muy reducido: 40 episodios y 8848 fotogramas, lo que limita la robustez ante variaciones de iluminacion, posicion de objetos o distractores.
- Sin resultados de evaluacion: el autor no reporta tasa de exito, por lo que el rendimiento real es desconocido.
- Dependencia de hardware concreto: asume un robot `so_follower` y tres camaras con claves de observacion especificas; un montaje distinto invalida el modelo.
- Riesgo de sobreajuste al entorno de grabacion y de fallos ante cambios de escena.
- Licencia `gemma`: conviene revisar los terminos de la licencia Gemma antes de un uso comercial, ya que impone condiciones de uso y redistribucion.
- Sin soporte de lenguaje natural ni de razonamiento simbolico; no apto para tareas conversacionales.
- Idiomas no disponibles: no aplica como modelo multilingue.
- Sin garantias de seguridad fisica: cualquier despliegue en robot real requiere supervision y paradas de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tarunmatta/pi05_black_box_ft4_long
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/tarunmatta/pick_up_black_box_smolvla_v2
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=tarunmatta/pick_up_black_box_smolvla_v2
- Blog de Pi05 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de Pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI: no disponible en la informacion proporcionada.
