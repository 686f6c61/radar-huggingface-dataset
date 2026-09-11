# yuvalgot/act_towel_fold1_dagger_20260911

## Resumen

`yuvalgot/act_towel_fold1_dagger_20260911` es una politica de imitacion (imitation learning) para robotica entrenada con el metodo Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705 y descrito en la model card como un metodo que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, aprendiendo de datos de teleoperacion. El modelo lo publica el usuario de HuggingFace `yuvalgot` y esta empaquetado con LeRobot, la libreria de HuggingFace para aprendizaje por imitacion en robotica real. La tarea concreta que ejecuta es "fold the towel" (doblar una toalla) sobre un brazo seguidor de tipo `so_follower` con una unica camara denominada `hand`.

Tecnicamente es una politica visomotora pequena: 51.668.614 parametros (unos 51,7 millones, ~0,2 GB de pesos en safetensors), con una entrada compuesta por el estado propioceptivo del robot (vector de 6 dimensiones) y una imagen RGB de 3x240x320 pixeles, y una salida de accion de 6 dimensiones. El modelo se entreno sobre el dataset `yuvalgot/towel_fold1_dagger_aggregated`, con 70 episodios y 45.638 frames a 30 FPS, y el nombre del repositorio sugiere que los datos se agregaron mediante un proceso tipo DAgger (correcciones iterativas sobre los fallos de la politica).

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: recogida de datos, entrenamiento de una politica ACT y despliegue en hardware de bajo coste. No es un modelo de lenguaje ni un modelo fundacional de robotica: es un controlador especializado de una sola tarea, con 0 descargas y 0 likes en el momento de la consulta y sin resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con componente CVAE, segun el paper arXiv:2304.13705 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto textual; ventana de observacion de 1 frame y prediccion por chunks de acciones (el tamano de chunk no se declara en la informacion disponible) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors sin precision declarada |
| Idiomas soportados | no disponible; el modelo no procesa lenguaje natural, solo la tarea fija "fold the towel" |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, libreria `lerobot`) |

Especificaciones de entrada y salida declaradas en la model card:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.hand` | VISUAL | `(3, 240, 320)` |
| `action` | ACTION | `(6,)` |

Configuracion adicional declarada: tipo de robot `so_follower`, camaras `hand`, `pipeline_tag: robotics`, tags `robotics`, `act`, `lerobot`.

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice chunks de acciones (varias acciones futuras de una sola pasada) en lugar de una accion por paso de inferencia, lo que reduce el problema de horizonte y la acumulacion de errores típica de las politicas reactivas. Segun el paper referenciado en la model card, la arquitectura combina un transformer encoder-decoder con un componente de autoencoder variacional condicionado (CVAE) que modela la variabilidad de las demostraciones humanas mediante una variable latente, y en la practica se ejecuta con ensamblado temporal de los chunks predichos. La model card no detalla la configuracion interna concreta (backbone visual, numero de capas, dimension del modelo o tamano de chunk) mas alla del recuento total de parametros.

El entrenamiento se realizo con LeRobot 0.6.2 durante 100.000 pasos, con tamano de lote 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. Los datos proceden del dataset `yuvalgot/towel_fold1_dagger_aggregated`: 70 episodios, 45.638 frames a 30 FPS, una sola tarea ("fold the towel"). El sufijo "dagger" del nombre y del dataset apunta a un pipeline de Dataset Aggregation, en el que se agregan episodios de correccion recogidos cuando la politica falla, lo que suele mejorar la robustez frente a estados de recuperacion. No se documenta en la informacion disponible si hubo RLHF, DPO ni ninguna otra fase de ajuste por preferencias, algo por otra parte poco habitual en politicas de imitacion.

## Capacidades

- Control visomotor de un brazo robotico `so_follower` con 6 grados de libertad de accion, a partir de estado propioceptivo de 6 dimensiones y una imagen de 240x320.
- Ejecucion de una unica tarea de manipulacion: doblar una toalla ("fold the towel").
- Prediccion de chunks de acciones, lo que permite un control mas fluido que una politica paso a paso.
- Robustez potencial ante estados de recuperacion, por el uso de datos DAgger agregados de correcciones.
- Inferencia en tiempo real a 30 FPS, la misma frecuencia a la que se grabo el dataset.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico, generacion de texto, codigo, matematicas ni vision general: no es un modelo de lenguaje ni un VLM.
- No soporta multiples tareas ni instrucciones en lenguaje natural: la tarea esta fijada en el entrenamiento.
- No se declaran capacidades multilingues de ningun tipo.

## Casos de uso

- Despliegue de una demo de doblado de ropa: la politica se ejecuta con `lerobot-rollout` sobre un brazo `so_follower` provisto de la camara `hand`, reproduciendo la tarea "fold the towel" durante el tiempo indicado con `--duration`.
- Base de partida para un pipeline DAgger propio: se ejecuta la politica, se graban los episodios donde falla, se corrigen por teleoperacion, se agregan al dataset y se reentrena con `lerobot-train`, usando este modelo como punto de partida.
- Banco de pruebas de hardware de robotica de bajo coste: al ser un modelo de 51,7 millones de parametros, permite validar cableado, calibracion, latencias de camara y tasas de control sin necesidad de GPU de datacenter.
- Estudio academico de aprendizaje por imitacion: sirve como referencia reproducible de ACT con una configuracion conocida (100.000 pasos, lote 8, AdamW, lr 1e-5, semilla 1000) para comparar variantes de chunking o de aumento de datos.
- Prototipado de control de manipulacion en laboratorio: integracion del bucle de politica en un lazo de control a 30 FPS para medir jitter, tiempos de reaccion y comportamiento ante oclusiones de la camara.
- Docencia y formacion: ejemplo completo y pequeno de un flujo de robot learning end-to-end, desde la visualizacion del dataset hasta el rollout en robot real.
- Evaluacion de robustez ante cambios de iluminacion o posicion del objeto: repetir el rollout variando condiciones y contar exitos, ya que el autor no publica esa tabla de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la linea "_No evaluation results have been provided for this policy yet._" y deja la tabla de evaluacion (tarea, ensayos, exitos, tasa de exito) sin rellenar. Tampoco se aportan metricas de perdida de entrenamiento, curvas de aprendizaje ni comparaciones con otras politicas. No se reproducen aqui las cifras del paper de ACT porque no forman parte de la informacion proporcionada para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos (51,7 millones de parametros, ~207 MB en fp32 y ~103 MB en fp16), mas el coste de activaciones de una imagen de 3x240x320 y el contexto de CUDA, que en la practica situa el consumo total en el rango de 1-2 GB. Son estimaciones, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 2 GB de VRAM; tambien es viable en CPU para pruebas de baja frecuencia. No requiere A100 ni H100 salvo que se quieran ejecutar muchos entornos en paralelo.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, asi como en plataformas embebidas tipo Jetson Orin. La restriccion real no es la memoria sino cumplir el presupuesto de ~33 ms por paso para mantener 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=yuvalgot/act_towel_fold1_dagger_20260911`), PyTorch nativo con los pesos safetensors. vLLM, llama.cpp, Ollama o TGI no aplican: estan orientados a modelos de lenguaje y no a politicas de control roboticas.
- Latencia y throughput: no disponibles. La unica referencia temporal es que el dataset se grabo a 30 FPS, lo que marca la frecuencia objetivo del bucle de control.

## Comparativa con modelos similares

No se dispone de datos verificados de parametros, contexto o rendimiento de los modelos alternativos dentro de la informacion proporcionada, por lo que la comparacion se limita a rasgos cualitativos.

| Modelo | Tipo | Representacion de accion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (ACT, `yuvalgot/act_towel_fold1_dagger_20260911`) | Transformer con CVAE (ACT) | Chunks de acciones | apache-2.0 | HuggingFace Hub, libreria `lerobot` |
| Diffusion Policy | Politica generativa por difusion | Trayectorias generadas por difusion | no disponible en esta busqueda | Implementada en LeRobot; cifras concretas no disponibles |
| SmolVLA | Politica basada en modelo vision-lenguaje-accion | Acciones condicionadas por instruccion en lenguaje | no disponible en esta busqueda | Disponible en el ecosistema LeRobot; cifras concretas no disponibles |
| ACT de referencia (`lerobot/act_*`) | Transformer con CVAE (ACT) | Chunks de acciones | no disponible en esta busqueda | Multiples checkpoints publicos en el Hub; no se dispone de comparacion numerica |

Diferencias clave esperables frente a las alternativas: SmolVLA incorpora condicionamiento por lenguaje y por tanto puede generalizar a varias tareas, mientras que este checkpoint esta limitado a "fold the towel"; Diffusion Policy modela distribuciones multimodales de acciones con mas coste de inferencia, lo que complica el control a 30 FPS en hardware embebido.

## Limitaciones y advertencias

- Especializacion extrema: una sola tarea ("fold the towel"), un solo tipo de robot (`so_follower`) y una sola camara (`hand`). Cambiar cualquiera de estos elementos invalida la politica.
- Dependencia de la configuracion de camara: las claves de observacion deben coincidir exactamente con las del entrenamiento (`observation.images.hand`) y la resolucion declarada es 240x320; usar 640x480 u otra denominacion rompe la inferencia.
- Dataset pequeno: 70 episodios y 45.638 frames. Es plausible un sobreajuste a posiciones concretas de la toalla, iluminacion y fondo del entorno de grabacion, aunque no se publican evaluaciones que lo cuantifiquen.
- Sesgo de demostrador: la politica reproduce el estilo y las trayectorias del operador que teleopero los datos, incluidas sus ineficiencias y sus sesgos de agarre.
- Riesgo de fallo silencioso: en robotica, un error de la politica no es una alucinacion textual, sino una accion fisica incorrecta. Se recomienda limitador de par, espacio de trabajo acotado y parada de emergencia.
- Sin resultados de evaluacion: no hay tasa de exito publicada, ni numero de ensayos, ni condiciones de prueba. Cualquier afirmacion de rendimiento seria especulativa.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero la licencia cubre el artefacto del modelo, no los datos de entrenamiento ni posibles patentes del metodo; conviene revisar la licencia del dataset `yuvalgot/towel_fold1_dagger_aggregated` antes de reutilizarlo.
- Idioma: el modelo no procesa lenguaje natural, por lo que no aplica ninguna consideracion multilingue, pero tampoco se puede pedir la tarea por instruccion textual, solo mediante el parametro `--task` que ya coincide con el entrenamiento.
- Advertencia sobre los resultados de la busqueda web: las consultas realizadas no devolvieron informacion tecnica relevante sobre este modelo; todos los enlaces utiles provienen de la model card y del Hub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuvalgot/act_towel_fold1_dagger_20260911
- Dataset de entrenamiento: https://huggingface.co/datasets/yuvalgot/towel_fold1_dagger_aggregated
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yuvalgot/towel_fold1_dagger_aggregated
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
