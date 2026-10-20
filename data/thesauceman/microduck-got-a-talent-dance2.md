# TheSauceman/microduck-got-a-talent-dance2

## Resumen

`microduck-got-a-talent-dance2` es una política de control entrenada por refuerzo para el robot bípedo MicroDuck del proyecto de Pollen Robotics. No es un modelo de lenguaje: es un controlador que recibe una observación de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado como grafo ONNX y publicado con la librería `microduck`. El autor es TheSauceman (Stephen E. Tarter), que mantiene una colección de políticas similares para el mismo robot bajo un repositorio de retos (`microduck-challenges`).

El comportamiento aprendido es una coreografía de tipo *Electric Slide*: desplazamiento lateral a derecha e izquierda, retroceso, balanceo con giro y repetición desde el principio. La model card describe una secuencia de unos veinte segundos con dos cuartos de giro y sin caídas. La política es de tipo *perpetual*, es decir, se ejecuta en bucle hasta que se le indique lo contrario, y se carga en una ranura (*slot*) del daemon `robotctl` del robot.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por refuerzo en robótica de bajo coste (entorno de simulación `mjlab`, 2048 entornos paralelos, exportación a ONNX con normalizador de observaciones embebido) y como pieza demostrativa de una habilidad motora concreta en un robot de aficionado. El repositorio es de tamano practicamente nulo (0,0 GB) y el modelo acumula 5 descargas y 0 likes en el momento de la consulta, lo que refleja su caracter experimental y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | red de politica para aprendizaje por refuerzo, exportada como grafo ONNX (topologia interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observacion de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible; el artefacto distribuido es un ONNX sin cuantizacion declarada |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` con esquema 2 de microduck |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tipo de politica | perpetua (bucle continuo hasta recibir orden de parada) |

## Arquitectura y entrenamiento

La informacion publicada no detalla la topologia de la red (numero de capas, unidades ocultas ni tipo de actor-crítico). Lo que si se documenta es el pipeline: la politica se entrena en simulacion con `mjlab-microduck 0.1.0` (commit `8d0dbc94c`), sobre la tarea `Mjlab-GotATalent-MicroDuck`, definida en el repositorio `microduck-challenges` (rama `claude/project-thread-h4e0o0`, commit `238700562`). El entrenamiento se lanzo con 2048 entornos simulados en paralelo, un maximo de 6000 iteraciones, semilla 1 y registro en TensorBoard bajo el nombre de ejecucion `dance2`; el checkpoint publicado corresponde al paso 5999. El autor advierte explicitamente de que el entrenamiento por refuerzo con GPU no es reproducible bit a bit, por lo que repetir la ejecucion produce una politica comparable, no los mismos pesos.

El artefacto distribuido incluye el normalizador de observaciones embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar. El manifiesto sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon. No se han publicado datos sobre volumen total de pasos de entrenamiento, composicion del dataset sintetico, funcion de recompensa ni uso de tecnicas adicionales de ajuste (RLHF, DPO u otras), por lo que esos puntos quedan como no disponibles.

## Capacidades

- Locomocion bípeda coreografiada: ejecuta una secuencia de *Electric Slide* con desplazamiento lateral a ambos lados, retroceso, balanceo y giro.
- Ejecucion continua: la politica es de tipo perpetuo, mantiene la marcha hasta que se le ordena detenerse.
- Control a 50 Hz con 14 acciones, adecuado para el bucle de control del MicroDuck.
- Integracion con el daemon del robot mediante `robotctl policy load <slot>`, lo que permite cargarla en una ranura de politica.
- Autocontenida en inferencia: el normalizador de observaciones esta dentro del ONNX, sin pasos externos de preprocesado.
- Reproducibilidad del entrenamiento documentada: mismo codigo, mismo `uv.lock`, mismo comando y misma semilla.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un controlador motor, no un modelo generativo.

## Casos de uso

- Demostracion de baile en un robot de bajo coste: cargar la politica en una ranura con `robotctl` y dejarla correr en bucle para exhibiciones, ferias o videos de divulgacion, aprovechando que la coreografia dura unos veinte segundos y se repite sin intervencion.
- Validacion de la cadena de herramientas `mjlab` + `microduck-challenges`: usar esta politica como referencia de "entrenamiento que funciona" antes de abordar una tarea nueva, ya que se publican comando exacto, commit y semilla.
- Prueba de integracion del daemon y del formato de manifiesto: sirve para verificar que un despliegue concreto de `robotctl` acepta manifiestos de esquema 2 y carga correctamente un ONNX con normalizador embebido.
- Benchmark interno de locomocion: comparar el comportamimento de esta politica con otras del mismo autor (por ejemplo, las de la familia `sprint`) para evaluar estabilidad, consumo de bateria y desviacion de trayectoria en el mismo hardware.
- Material docente sobre aprendizaje por refuerzo aplicado: ilustra el ciclo completo simulacion -> entrenamiento masivo en paralelo -> exportacion ONNX -> despliegue en robot, con un caso visualmente atractivo y facil de evaluar cualitativamente.
- Base para *fine-tuning* o para inicializar una politica nueva: al estar el codigo de entrenamiento publicado, puede reutilizarse como punto de partida (con la semilla 1 documentada) para variantes de coreografia o de gait.
- Pruebas de robustez en hardware real: al ser una habilidad motora acotada y repetible, sirve para medir deriva, calibracion de servos o desgaste mecanico tras ciclos prolongados de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe cualitativamente el comportamiento ("veinte segundos, dos cuartos de giro, ni una caida"), sin metricas numericas de exito, recompensa final, desviacion de trayectoria ni tasa de caidas. Tampoco se publican curvas de entrenamiento ni valores de recompensa del checkpoint 5999.

Los unicos datos cuantitativos del proceso son de configuracion, no de rendimiento:

| Parametro de entrenamiento | Valor |
|---|---|
| Entornos paralelos | 2048 |
| Iteraciones maximas | 6000 |
| Checkpoint publicado | 5999 |
| Semilla | 1 |
| Entorno base | mjlab-microduck 0.1.0 (commit 8d0dbc94c) |
| Frecuencia de control | 50 Hz |

## Requisitos de hardware

- Inferencia en robot: el artefacto es un ONNX de dimensiones de entrada y salida muy reducidas (61 y 14), por lo que el coste de computo es minimo y esta pensado para ejecutarse en el propio MicroDuck; las especificaciones de la computadora a bordo no se detallan en la informacion disponible.
- VRAM estimada: no disponible; por la dimensionalidad del grafo, la inferencia cabe holgadamente en CPU y no requiere GPU.
- GPU recomendadas para inferencia: no aplica; cualquier CPU es suficiente. No se publican cifras de latencia ni de throughput.
- GPU para reentrenamiento: no se especifica el modelo utilizado. El comando documentado asume 2048 entornos simulados en paralelo con `mjlab`, lo que en la practica exige una GPU de gama alta (clase A100/H100 o RTX 4090) para ser viable en tiempos razonables, aunque esta estimacion no la confirma el autor.
- Cabe en GPU de consumo: si, para inferencia es irrelevante; para reentrenamiento con 2048 entornos la viabilidad en GPU de consumo no esta documentada.
- Opciones de despliegue: ONNX Runtime como ejecutor del grafo y el daemon `robotctl` del MicroDuck para cargar la politica en una ranura. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el unico dato temporal es la frecuencia de control nominal de 50 Hz.

## Comparativa con modelos similares

No se dispone de datos tecnicos de las alternativas (parametros, recompensa, tasa de exito), por lo que la comparacion se limita a lo observable en los metadatos.

| Modelo | Tipo | Tarea | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TheSauceman/microduck-got-a-talent-dance2 | Politica RL en ONNX | Coreografia *Electric Slide* perpetua | 61 / 14 | 50 Hz | no disponible | publica en HuggingFace, 5 descargas |
| TheSauceman/microduck-sprint-2m-run-1013-1513 | Politica RL (misma familia) | Carrera / sprint | no disponible | no disponible | no disponible | publica en HuggingFace |
| Politicas de referencia de pollen-robotics/microduck | Politicas RL del proyecto base | Locomocion base del robot | no disponible | no disponible | no disponible (segun repositorio del proyecto) | codigo abierto en GitHub |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no procesa texto, no razona y no admite instrucciones en lenguaje natural. Cualquier comparacion con LLM es improcedente.
- La licencia no esta declarada en la informacion disponible, lo que impide confirmar si se permite uso comercial o redistribucion. Conviene contactar con el autor antes de integrarlo en un producto.
- El comportamiento esta especializado en una unica coreografia: no generaliza a otras tareas de locomocion ni a terrenos o perturbaciones no vistos durante el entrenamiento en simulacion.
- Riesgo de brecha simulación-realidad (*sim-to-real gap*): no se publican metricas de transferencia ni de tasa de caidas en hardware fisico, solo una descripcion cualitativa.
- Entrenamiento no reproducible bit a bit, tal y como advierte el autor; repetir la semilla 1 produce una politica comparable pero no identica, lo que complica la depuracion fina de diferencias de comportamiento.
- Dependencia fuerte del entorno de ejecucion: requiere el daemon `robotctl`, el esquema 2 de manifiesto y la convencion de observaciones en crudo (sin normalizar). Un preprocesado externo romperia la politica de forma silenciosa.
- Sin garantias de soporte ni mantenimiento: 0 likes, 5 descargas y una unica revision del repositorio. Es un artefacto experimental, no un componente con ciclo de vida gestionado.
- No se documentan sesgos en el sentido de modelos de datos, pero si un sesgo fisico evidente: la politica esta ajustada a la morfologia y a los actuadores concretos del MicroDuck.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheSauceman/microduck-got-a-talent-dance2
- Perfil del autor: https://huggingface.co/TheSauceman
- Otros modelos del autor: https://huggingface.co/TheSauceman/models
- Repositorio del robot MicroDuck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y codigo de entrenamiento: https://github.com/SteveTarter/microduck-challenges
- Tutorial de montaje y puesta en marcha del MicroDuck: https://github.com/AI-FanGe/Microduck-build-tutorial
- Demostracion en video (robot copiando un baile, simulador MicroDuck): https://www.youtube.com/watch?v=qJ37YnaBzfU
