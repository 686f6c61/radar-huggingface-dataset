# yuvalgot/latest_fold_diffusion_towel_fold1_20261002

## Resumen

`yuvalgot/latest_fold_diffusion_towel_fold1_20261002` es una política de control robótico entrenada con el algoritmo Diffusion Policy y empaquetada en el formato de LeRobot. No es un modelo de lenguaje: se trata de un modelo visuomotor que recibe el estado articular de un robot (vector de 6 dimensiones) y una imagen RGB de una cámara situada en la mano (3x240x320), y devuelve un vector de acción de 6 dimensiones. Su tarea concreta y única es doblar una toalla.

El modelo lo publica el usuario `yuvalgot` en Hugging Face y tiene 262.962.502 parámetros (unos 263 millones), con un repositorio de 1,1 GB. Está entrenado sobre un dataset propio de 42 episodios y 25.110 fotogramas grabados a 30 FPS con un robot `so_follower` (SO-100/SO-101 de LeRobot) y una sola cámara en la pinza. La licencia es Apache 2.0.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de extremo a extremo del flujo de imitación de LeRobot (grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) y como referencia para quien quiera replicar una política de difusión sobre manipulación con contacto rico, como es el caso de doblar tela. Con 11 descargas y 0 likes en el momento de la consulta, es un artefacto de investigación personal, no un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de difusion (Diffusion Policy) para control visuomotor; topologia interna no detallada en la model card |
| Parametros totales | 262.962.502 (aprox. 263 M) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Consume un fotograma de observacion por paso de control |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica / no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Tipo de robot | `so_follower` |
| Camaras | `hand` (una camara RGB) |
| Entradas | `observation.state` (6,), `observation.images.hand` (3, 240, 320) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 1,1 GB |
| Tarea entrenada | "fold the towel" |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy (Chi et al., 2023; arXiv:2303.04137), un metodo que trata el control visuomotor como un proceso generativo: en lugar de predecir una accion unica de forma directa, aprende a generar trayectorias de accion multimodales y suaves mediante difusion, lo que funciona bien en tareas de manipulacion con contacto rico. La model card no especifica la topologia interna concreta (U-Net condicionada, transformer u otra), la dimension del horizonte de prediccion ni el numero de pasos de denoising empleados en inferencia.

Los datos de entrenamiento son exclusivamente el dataset `yuvalgot/latest_fold_towel_1_CLEAN_dataset_20261002_142345`: 42 episodios, 25.110 fotogramas a 30 FPS, una sola tarea ("fold the towel"), con estado articular y accion de 6 grados de libertad y una camara RGB en la mano. La configuracion reportada es de 100.000 pasos de entrenamiento, batch size 8, optimizador Adam, learning rate 0,0001, semilla 1000 y LeRobot 0.6.2. No se documenta ningun tipo de ajuste posterior con RLHF, DPO ni etapas de refinamiento.

## Capacidades

- Generacion de trayectorias de accion de 6 dimensiones a partir de estado articular e imagen: control visuomotor de un brazo robotico tipo `so_follower`.
- Manipulacion con contacto rico: la formulacion de difusion esta pensada para producir movimientos suaves y multimodales, adecuados para tareas como doblar tela.
- Ejecucion autonoma de la tarea "fold the towel" mediante el comando `lerobot-rollout` con `--strategy.type=base`.
- Entrenamiento adicional o reentrenamiento desde el propio flujo de LeRobot (`lerobot-train` con `--policy.type=diffusion`).
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso textual ni capacidades multilingues: no es un modelo generativo de texto.
- Vision limitada a una unica camara RGB de resolucion 3x240x320 en la mano; no hay entrada de audio ni de otras modalidades.
- No tiene modo "thinking" ni ninguna capacidad de razonamiento simbolico.

## Casos de uso

- Doblado autonomo de toallas en un banco de pruebas de robotica: cargando la politica con `lerobot-rollout`, el brazo `so_follower` ejecuta la tarea entrenada durante el tiempo indicado con `--duration`.
- Reproduccion de resultados de Diffusion Policy: sirve como artefacto de referencia para comparar el comportamiento de una politica de difusion frente a alternativas como ACT en la misma tarea y con los mismos datos.
- Punto de partida para fine-tuning: el repositorio se puede reentrenar con `lerobot-train` sobre un dataset propio para adaptar el doblado a otro tipo de tela, otra posicion de camara u otra mesa.
- Docencia y formacion en aprendizaje por imitacion: es un ejemplo completo y de tamano manejable (263 M de parametros, 1,1 GB) para ilustrar el ciclo datos-entrenamiento-despliegue en robotica.
- Pruebas de integracion del stack LeRobot: validar versiones (entrenado con 0.6.2), compatibilidad de camaras OpenCV y el esquema de observaciones `observation.state` / `observation.images.hand`.
- Evaluacion de robustez ante cambios de iluminacion, posicion inicial de la toalla o distractores en el entorno, dado que no hay resultados de evaluacion publicados que acoten ese comportamiento.
- Generacion de datos adicionales de manipulacion: ejecutando la politica con grabacion de episodios se pueden recopilar trayectorias nuevas para ampliar el dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con la nota explicita de que todavia no se han proporcionado resultados en robot real (numero de ensayos, exitos y tasa de exito por tarea).

## Requisitos de hardware

- Peso de los parametros: aproximadamente 1,05 GB en fp32 y 0,53 GB en fp16/bf16 (estimacion a partir de los 262.962.502 parametros).
- VRAM de inferencia: no disponible de forma oficial; por el tamano del modelo y el buffer de imagen de entrada, cabe holgadamente en GPUs de consumo, aunque la cifra exacta depende de la implementacion. La model card no publica requisitos de memoria.
- GPU recomendadas: no especificadas por el autor. Dada la escala (263 M de parametros), cualquier GPU NVIDIA con soporte CUDA y varios GB de VRAM deberia ser suficiente; el entrenamiento original se lanzo con `--policy.device=cuda` pero sin indicar el modelo de GPU.
- Cabe en GPU de consumo: si, por tamano de pesos; el cuello de botella real suele ser la latencia del bucle de control y el preprocesado de imagen, no la memoria.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia sobre robot, `lerobot-train` para reentrenamiento). vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Hay que tener en cuenta que una politica de difusion requiere varios pasos de denoising por accion, pero la model card no indica el numero de pasos ni tasas medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yuvalgot/latest_fold_diffusion_towel_fold1_20261002` | 262.962.502 | Estado (6,) + imagen 3x240x320 | Doblar toalla | Apache 2.0 | Hugging Face, 11 descargas |
| `yuvalgot/diffusion_towel_fold1_20260912` | No disponible | No disponible | Doblar toalla | No disponible | Hugging Face |
| Politica ACT de LeRobot | No disponible | No disponible | Imitacion general (manipulacion) | No disponible | Incluida en el repositorio de LeRobot |

Datos comparativos de rendimiento: no disponibles. No hay benchmarks publicados de este modelo ni comparaciones cuantitativas con las alternativas listadas, que se incluyen por pertenecer a la misma categoria (politicas de imitacion de LeRobot) y no por disponer de cifras contrastadas.

## Limitaciones y advertencias

- Modelo de proposito unico: solo ha sido entrenado para la tarea "fold the towel" con un robot `so_follower` y una camara `hand`; fuera de esa configuracion no se puede esperar un comportamiento valido.
- Sin evaluacion publicada: no hay tasa de exito ni numero de ensayos, por lo que la robustez real es desconocida.
- Dataset muy pequeno: 42 episodios y 25.110 fotogramas, con una sola tarea y un unico montaje de camara; es probable una sensibilidad alta a cambios de posicion, iluminacion o tipo de toalla.
- Riesgo de sobreajuste al entorno de grabacion y de fallo silencioso ante distribuciones de imagen distintas de las de entrenamiento.
- Sesgos: no documentados por el autor. Al tratarse de aprendizaje por imitacion, la politica reproduce los sesgos y las imperfecciones de las trayectorias humanas registradas en el dataset.
- Sin soporte de lenguaje ni de idiomas: cualquier expectativa multilingue o conversacional no aplica.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene citar el metodo (Diffusion Policy) y LeRobot segun la propia model card.
- Despliegue en robot real: requiere calibracion previa del robot y de las camaras, y que los nombres de las camaras coincidan con las claves de observacion (`observation.images.hand`). Ejecutar la politica con `--strategy.type=base` sin `--duration` la deja corriendo indefinidamente.
- Compatibilidad: entrenado con LeRobot 0.6.2; cambios de version en la biblioteca pueden afectar a la carga del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuvalgot/latest_fold_diffusion_towel_fold1_20261002
- Archivos del repositorio: https://huggingface.co/yuvalgot/latest_fold_diffusion_towel_fold1_20261002/tree/main
- Dataset de entrenamiento: https://huggingface.co/datasets/yuvalgot/latest_fold_towel_1_CLEAN_dataset_20261002_142345
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yuvalgot/latest_fold_towel_1_CLEAN_dataset_20261002_142345
- Articulo de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Diffusion Policy en arXiv: https://arxiv.org/abs/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento (imitacion): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Modelo previo del mismo autor: https://huggingface.co/yuvalgot/diffusion_towel_fold1_20260912
- Dataset auxiliar (10 episodios, 5.978 fotogramas): https://www.datacombats.com/datasets/yuvalgot/towel_fold1_aug_20260815_123915
- Dataset auxiliar (11 episodios): https://www.datacombats.com/datasets/yuvalgot/towel_fold1_aug_20260821_114340
