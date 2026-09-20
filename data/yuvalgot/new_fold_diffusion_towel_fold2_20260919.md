# yuvalgot/new_fold_diffusion_towel_fold2_20260919

## Resumen

`yuvalgot/new_fold_diffusion_towel_fold2_20260919` es una política de control visuomotor entrenada con Diffusion Policy y publicada en Hugging Face Hub mediante LeRobot. No es un modelo de lenguaje: se trata de un modelo de robótica que recibe el estado del robot y una imagen de cámara y devuelve un vector de acciones de 6 grados de libertad. Diffusion Policy formula el control visuomotor como un proceso generativo de difusión, de modo que el modelo produce trayectorias de acción multimovimiento suaves en lugar de una única acción instantánea, algo especialmente útil en tareas de manipulación con contacto rico, como doblar una toalla.

El modelo lo desarrolla el usuario yuvalgot y tiene 262.962.502 parámetros (unos 263 millones), con un repositorio de 1,1 GB en formato safetensors. Está entrenado sobre un único conjunto de datos propio de 38 episodios y 34.046 fotogramas a 30 FPS, con la tarea textual "fold the towel", y está diseñado para el robot `so_follower` (SO-100/SO-101) con una única cámara llamada `hand`.

Su relevancia es práctica y de nicho: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot 0.6.2 y como punto de partida para quien quiera entrenar o evaluar políticas de difusión para plegado de tejidos. El modelo no registra descargas ni likes y no incluye resultados de evaluación en el robot real, por lo que debe considerarse una política experimental sin validación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (control visuomotor como proceso de difusion generativo) |
| Parametros totales | 262.962.502 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el modelo usa un horizonte de observacion y un horizonte de prediccion de acciones definido por la configuracion de Diffusion Policy en LeRobot |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de robotica; la entrada textual se limita a la tarea "fold the towel") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot (0.6.2 durante el entrenamiento) |
| Tipo de robot | so_follower |
| Camaras | hand |
| Entradas | observation.state (6,), observation.images.hand (3, 240, 320) |
| Salidas | action (6,) |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el metodo Diffusion Policy descrito en el articulo arXiv:2303.04137, que plantea el control visuomotor como un proceso de difusion condicionado por observaciones. El modelo consume un vector de estado de 6 dimensiones y una imagen RGB de 240x320 procedente de la camara `hand`, y genera una secuencia de acciones de 6 dimensiones. Al modelar la distribucion completa de trayectorias en lugar de regresar una media, la politica evita el promediado de modos multiples tipico de las politicas de regresion y produce movimientos suaves y multimovimiento, lo que favorece tareas con contacto.

El entrenamiento se realizo con LeRobot sobre el conjunto `yuvalgot/new_fold_towel_2_og_dataset_20260919_183952_clean`, compuesto por 38 episodios, 34.046 fotogramas a 30 FPS y la unica tarea "fold the towel". La configuracion reportada es de 50.000 pasos, tamano de lote 8, optimizador Adam, tasa de aprendizaje 0,0001 y semilla 1000. No se documenta el uso de RLHF, DPO ni fases de ajuste con preferencias humanas, algo esperable en un modelo de robotica entrenado por imitacion; tampoco se detalla la composicion exacta del dataset mas alla del numero de episodios y fotogramas.

## Capacidades

- Generacion de acciones de control en robotica: produce comandos de 6 dimensiones para el robot `so_follower`.
- Control visuomotor condicionado por imagen: integra una observacion visual de 240x320 junto con el estado del robot.
- Generacion de trayectorias multimovimiento suaves propias de la formulacion de difusion, adecuadas para manipulacion con contacto.
- Ejecucion de una tarea concreta: plegado de toallas ("fold the towel").
- Despliegue mediante `lerobot-rollout` con la estrategia `base`, sin grabacion de episodios.
- Capacidad de reentrenamiento: la configuracion permite entrenar una politica de difusion equivalente con `lerobot-train`.
- No soporta tool calling, function calling, uso como agente, generacion de texto, codigo, matematicas ni vision general: es una politica de robotica, no un modelo de lenguaje ni un VLM.
- Capacidades multilingues: no aplica.

## Casos de uso

- Plegado de toallas en robot de bajo coste: es el caso de uso exacto para el que se entreno, sobre un SO-100/SO-101 con camara en la mano; se lanzaria con `lerobot-rollout` y la tarea "fold the towel".
- Base de referencia para aprendizaje por imitacion: sirve para reproducir el flujo completo de LeRobot (grabacion, entrenamiento y despliegue) en un proyecto propio, usando el mismo comando `lerobot-train`.
- Punto de partida para fine-tuning en tareas textiles: al ser una politica de difusion entrenada con pocos episodios, puede reentrenarse con un dataset propio de plegado de otras prendas o formas.
- Investigacion sobre Diffusion Policy: permite comparar el comportamiento de una politica de difusion frente a alternativas de regresion o de action chunking en una tarea de contacto rico.
- Evaluacion de robustez a variaciones visuales: con 38 episodios y una sola camara, es un caso util para medir sensibilidad a cambios de iluminacion, posicion del objeto o distractores.
- Benchmark interno de infraestructura de inferencia robotica: permite medir latencia de control a 30 FPS en distintas GPU con un modelo de 263 millones de parametros.
- Demostraciones y docencia: util como ejemplo minimo y completo de publicacion de una politica en el Hub con metadatos de dataset, entradas y salidas.
- Recoleccion de datos comparativos: sirve para estudiar cuantos episodios adicionales hacen falta para elevar la tasa de exito en plegado de toallas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un apartado de evaluacion con la nota explicita "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito en robot real, numero de ensayos ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,1 GB en fp32 y alrededor de 0,55 GB en fp16 para los 262.962.502 parametros, mas el coste de activaciones del proceso de difusion, que no se especifica en la informacion disponible.
- GPU recomendadas: no se indica ninguna en la model card. Por tamano, cualquier GPU con al menos 2-4 GB de VRAM deberia poder ejecutar la politica; una NVIDIA RTX 4090, A100 o H100 ofrecen margen sobrado.
- GPU de consumo: si, cabe en GPU de consumo. El modelo, de unos 263 millones de parametros, entra sin problema en tarjetas tipo RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=yuvalgot/new_fold_diffusion_towel_fold2_20260919`; entrenamiento con `lerobot-train` y `--policy.type=diffusion`. No aplica el despliegue con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Requisitos adicionales: robot `so_follower`, puerto serie configurado, y camaras con nombres que coincidan con las claves de observacion del entrenamiento (`observation.images.hand`), a 30 FPS.
- Latencia y throughput estimados: no disponibles. La unica referencia temporal es que el dataset se grabo a 30 FPS, lo que sugiere que la politica debe ejecutarse en tiempo real a esa frecuencia para replicar las condiciones de entrenamiento.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto ni rendimiento de modelos comparables en la informacion proporcionada. La comparacion se limita a caracteristicas generales verificables:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yuvalgot/new_fold_diffusion_towel_fold2_20260919 | Diffusion Policy (robotica) | 262.962.502 | no disponible | apache-2.0 | Hugging Face Hub, via LeRobot |
| ACT (Action Chunking Transformer) en LeRobot | Politica de imitacion por action chunking | no disponible | no disponible | no disponible | implementada en LeRobot |
| Otras politicas `diffusion` publicadas con LeRobot | Diffusion Policy | no disponible | no disponible | variable segun autor | Hugging Face Hub |
| SmolVLA (Hugging Face) | Vision-Language-Action | no disponible | no disponible | no disponible | Hugging Face Hub |

La unica diferencia verificable con las alternativas es que este modelo esta especializado en una tarea unica ("fold the towel") y en un unico robot (`so_follower`) con una sola camara, mientras que propuestas como SmolVLA son modelos de accion condicionados por lenguaje y generalistas. No hay datos de rendimiento que permitan afirmar cual es mejor.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al entrenarse con 38 episodios de un unico operador, robot, camara y entorno, la politica heredara los sesgos de esas demostraciones.
- Riesgo de sobreajuste: 34.046 fotogramas y 38 episodios para una tarea de contacto rico es un volumen reducido; es probable que el rendimiento caiga ante posiciones nuevas del objeto, iluminacion distinta o distractores.
- Ausencia de evaluacion: no hay tasas de exito en robot real publicadas, por lo que se desconoce si la politica funciona de forma fiable.
- Limitacion de tarea: solo se ha entrenado para "fold the towel"; no se debe esperar generalizacion a otras tareas sin reentrenamiento.
- Limitacion de entrada: depende de una unica camara `hand` a 240x320 y de un estado de 6 dimensiones; usar otras camaras o claves de observacion distintas romperia la inferencia.
- Limitacion de hardware: disenado para `so_follower`; no es portable directamente a otros brazos o grados de libertad sin reentrenar.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el reconocimiento correspondiente. Se recomienda citar ademas LeRobot y el articulo de Diffusion Policy segun la model card.
- Caveats de produccion: el modelo tiene 0 descargas y 0 likes, no incluye demo ni resultados de evaluacion, y su repositorio se creo y actualizo en septiembre de 2026, por lo que carece de validacion por parte de la comunidad.
- Idiomas: no aplica; la unica cadena de texto relevante es la instruccion de tarea "fold the towel".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuvalgot/new_fold_diffusion_towel_fold2_20260919
- Dataset de entrenamiento: https://huggingface.co/datasets/yuvalgot/new_fold_towel_2_og_dataset_20260919_183952_clean
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yuvalgot/new_fold_towel_2_og_dataset_20260919_183952_clean
- Articulo de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Busqueda web: no se encontro ningun enlace relevante sobre este modelo; los resultados devueltos por el buscador no guardan relacion con el modelo ni con robotica.
