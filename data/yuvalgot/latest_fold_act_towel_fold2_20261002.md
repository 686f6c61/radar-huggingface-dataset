# yuvalgot/latest_fold_act_towel_fold2_20261002

## Resumen

`yuvalgot/latest_fold_act_towel_fold2_20261002` es una politica de aprendizaje por imitacion basada en ACT (Action Chunking with Transformers), entrenada con la libreria LeRobot de Hugging Face y publicada por el usuario yuvalgot. No es un modelo de lenguaje: es un modelo de robotica que traduce observaciones (estado de las articulaciones y una imagen de camara) en comandos de accion de bajo nivel. Su tarea concreta es "fold the towel" (doblar una toalla), aprendida a partir de 44 episodios teleoperados.

El modelo tiene 51.668.614 parametros (aproximadamente 51,7 millones) y un repositorio de solo 0,2 GB en formato safetensors. Consume un vector de estado de 6 dimensiones (`observation.state`) y una imagen RGB de 240x320 (`observation.images.hand`), y produce un vector de accion de 6 dimensiones. Esta pensado para ejecutarse sobre un robot de tipo `so_follower` (familia SO-100/SO-101 de bajo coste) con una camara situada en la mano.

Su relevancia es doble: por un lado demuestra el flujo de trabajo completo de LeRobot (grabacion de datos, entrenamiento de politicas ACT y despliegue en robot real); por otro, sirve como ejemplo reproducible de imitacion de tareas de manipulacion con muy pocos recursos computacionales. La licencia Apache 2.0 facilita su reutilizacion y modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con ACT (Action Chunking with Transformers), metodo de aprendizaje por imitacion |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower |
| Camaras | hand |
| Entradas | `observation.state` (6,), `observation.images.hand` (3, 240, 320) |
| Salidas | `action` (6,) |
| Libreria | lerobot |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-10-02 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion descrito en el paper arXiv:2304.13705. En lugar de predecir una sola accion por paso, el modelo predice "trozos" (chunks) de acciones, es decir, secuencias cortas de acciones futuras. Esta formulacion reduce el error de composicion y mejora la estabilidad y la tasa de exito en tareas de manipulacion fina. El modelo es un transformer con un componente de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas; el repositorio no detalla la configuracion interna exacta de capas o dimensiones, por lo que esos datos se marcan como no disponibles.

El entrenamiento se realizo con LeRobot sobre el dataset `yuvalgot/latest_fold_towel_2_CLEAN_dataset_20261002_152312`, compuesto por 44 episodios, 26.308 fotogramas y una frecuencia de captura de 30 FPS para la tarea "fold the towel". La configuracion de entrenamiento fue: 80.000 pasos, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. La model card no indica el uso de RLHF, DPO ni tecnicas de refuerzo posteriores; se trata de aprendizaje supervisado puro a partir de demostraciones teleoperadas.

## Capacidades

- Generacion de acciones de control para un robot manipulador de 6 grados de libertad (`action` de dimension 6).
- Percepcion visual basada en una unica camara RGB situada en la mano (`observation.images.hand`), con resolucion de 240x320.
- Fusion de estado propioceptivo (posicion/estado de 6 dimensiones) con imagen para producir la accion.
- Prediccion de secuencias de acciones (action chunking) en lugar de pasos aislados, lo que mejora la coherencia temporal.
- Ejecucion de la tarea especifica "fold the towel" aprendida por imitacion de demostraciones humanas.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso simbolico ni capacidades multilingues, ya que no es un modelo de lenguaje.

## Casos de uso

- Automatizacion de doblado de toallas en un robot SO-100/SO-101: el modelo traduce imagen y estado a comandos de articulacion para completar la tarea de doblado aprendida, sirviendo como base para tareas de manipulacion de ropa.
- Investigacion en aprendizaje por imitacion: permite reproducir el pipeline completo de ACT (grabacion, entrenamiento, evaluacion) con un coste de datos y computo reducido, util para estudiar generalizacion y robustez.
- Punto de partida para fine-tuning con nuevos datasets: al ser Apache 2.0 y estar en LeRobot, se puede reentrenar con mas episodios o variaciones de la tarea usando `lerobot-train`.
- Docencia y prototipado en robotica: el modelo es lo bastante ligero (51,7 M de parametros) para servir de ejemplo en cursos o talleres sobre politicas de manipulacion.
- Benchmark interno de maniobras de doblado: sirve como baseline al comparar otras politicas (por ejemplo Diffusion Policy) sobre el mismo dataset de toallas.
- Despliegue en hardware de bajo coste: al caber en GPU de consumo e incluso CPU, permite montar demostraciones en robots asequibles sin infraestructura de gran escala.
- Recogida de datos asistida: combinado con `lerobot-rollout`, permite validar la politica en el robot real y detectar fallos antes de recolectar mas demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica: "No evaluation results have been provided for this policy yet.", es decir, no se han facilitado tasas de exito ni numero de ensayos en robot real para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 51,7 M de parametros, los pesos en fp32 ocupan aproximadamente 207 MB y en fp16 unos 103 MB; sumando activaciones de una imagen de 3x240x320, el uso de memoria es inferior a 1 GB (estimacion, no dato publicado).
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente; por ejemplo RTX 3060, RTX 4090, A100 o H100 funcionan sobradamente. El modelo no requiere GPU de gama alta.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna e incluso puede ejecutarse en CPU.
- Opciones de despliegue: el flujo oficial es LeRobot mediante `lerobot-rollout --policy.path=yuvalgot/latest_fold_act_towel_fold2_20261002`. Los pesos estan en safetensors y se cargan con PyTorch a traves de LeRobot. No aplican herramientas tipo vLLM, llama.cpp u Ollama, que estan orientadas a modelos de lenguaje.
- Latencia y throughput: no se han publicado cifras de latencia. El dataset y el bucle de control se capturaron a 30 FPS, que es la frecuencia de referencia de la tarea; se espera que la inferencia en GPU quede por debajo de ese intervalo por fotograma, pero no hay medicion publicada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `yuvalgot/latest_fold_act_towel_fold2_20261002` | ACT (transformer, imitation learning) | 51.668.614 | no disponible | sin datos publicados | apache-2.0 | Hugging Face |
| Otras politicas ACT en LeRobot para tareas concretas | ACT | variable | no disponible | no disponible | generalmente apache-2.0 | Hugging Face |
| Diffusion Policy | politica basada en difusion | no disponible | no disponible | no disponible | no disponible | repositorios de investigacion |

No se dispone de datos de parametros, contexto ni rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La comparacion relevante seria contra otras politicas entrenadas sobre el mismo dataset de doblado de toallas o contra implementaciones de Diffusion Policy para la misma tarea, pero no hay cifras publicadas.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la tasa de exito real, la robustez ante variaciones de posicion, iluminacion o distractores, y el comportamiento ante objetos distintos.
- Entrenada exclusivamente para una tarea ("fold the towel") y un tipo de robot (`so_follower`); no generaliza a otras tareas ni a otro hardware sin reentrenamiento o fine-tuning.
- Depende de la camara `hand` con la resolucion y el encuadre exactos del entrenamiento; cambios en la camara o su montaje pueden degradar el rendimiento.
- Dataset pequeno (44 episodios, 26.308 fotogramas), lo que limita la diversidad de situaciones cubiertas y aumenta el riesgo de sobreajuste a las condiciones de grabacion.
- Al ser aprendizaje por imitacion, puede reproducir sesgos o ineficiencias presentes en las demostraciones humanas y fallar ante estados fuera de distribucion.
- No es un modelo de lenguaje: no tiene capacidades de razonamiento textual, tool calling ni multilingues, por lo que no debe evaluarse con metricas tipo MMLU o HumanEval.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las dependencias de LeRobot y el paper de ACT para el cumplimiento de citas.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica que es un modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuvalgot/latest_fold_act_towel_fold2_20261002
- Dataset de entrenamiento: https://huggingface.co/datasets/yuvalgot/latest_fold_towel_2_CLEAN_dataset_20261002_152312
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yuvalgot/latest_fold_towel_2_CLEAN_dataset_20261002_152312
