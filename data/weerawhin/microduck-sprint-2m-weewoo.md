# weerawhin/microduck-sprint-2m-weewoo

## Resumen

microduck-sprint-2m-weewoo es una politica de control motor obtenida por aprendizaje por refuerzo (RL) para el robot bípedo Microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de una red neuronal de politica entrenada en simulacion que transforma una observacion de 61 dimensiones en 14 acciones de control, ejecutadas a 50 Hz. Su tarea es la marcha "sprint 2m" del banco de pruebas microduck-challenges, consistente en alternar pasos para recorrer 2 metros lo mas rapido posible.

El modelo lo publica el usuario weerawhin, no Pollen Robotics, y se distribuye como una politica perpetua: una vez cargada en una ranura de politica del robot, se ejecuta de forma continua hasta que se le indique lo contrario. Los pesos se empaquetan en un unico fichero ONNX (`policy.onnx`) con el normalizador de observaciones ya incorporado, de modo que el robot puede alimentar observaciones en crudo. El repositorio ocupa 0,0 GB, lo que indica una red de tamano muy reducido, coherente con la inferencia en el propio robot.

Su relevancia es acotada pero clara para la comunidad de robotica open source: forma parte del ecosistema abierto de Microduck (un bípedo de 25 cm, 15 motores, camara, LiDAR y pico prensil), que permite entrenar comportamientos en simulacion y ejecutarlos en hardware real. Al ser un modelo de nicho recien publicado (14 de octubre de 2026), con 6 descargas y 0 likes, su interes esta en la reproducibilidad del pipeline de entrenamiento mas que en un uso generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de politica entrenada por aprendizaje por refuerzo (RL); topologia interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observacion de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no aplica (politica de control motor) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (esquema 2) |
| Entrada | Observacion de 61 dimensiones |
| Salida | 14 acciones de control |
| Frecuencia de control | 50 Hz |

## Arquitectura y entrenamiento

La model card no detalla la topologia de la red. Se describe como una politica de RL entrenada con la libreria `microduck` sobre la base `mjlab-microduck 0.1.0` (commit 8d0dbc94c). Por convencion en este tipo de tareas de control locomotor con mjlab (entorno de RL sobre MuJoCo), el actor suele ser una red de tipo MLP, pero la arquitectura concreta, el numero de capas y el total de parametros no se especifican en la informacion disponible. El modelo se presenta como una "politica perpetua" para el Microduck, con 61 dimensiones de observacion, 14 acciones y control a 50 Hz.

El entrenamiento se realizo con la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `NIRUN-Weerawit/microduck-challenges` (rama `main`, commit `66d676b1c`), con semilla 42, checkpoint 750 y 4096 entornos en paralelo durante hasta 3000 iteraciones. La receta de reproduccion usa `uv sync` y `uv run train ... --env.scene.num-envs 4096 --agent.max-iterations 3000 --agent.seed 42`. El autor advierte explicitamente que el entrenamiento con RL en GPU no es bit-reproducible entre maquinas: repetir el comando con la misma semilla produce una politica comparable, no los mismos pesos. No se indica composicion del dataset (al tratarse de RL en simulacion, los datos se generan por interaccion con el entorno), ni uso de RLHF o DPO, ni innovaciones tecnicas adicionales destacables mas alla del empaquetado del normalizador dentro del propio ONNX.

## Capacidades

- Control locomotor bípedo: genera comandos para alternar pasos y avanzar en linea recta en la tarea de sprint de 2 metros.
- Ejecucion perpetua: mantiene la marcha de forma continua hasta que se le indique lo contrario, sin un horizonte de episodio fijo.
- Inferencia autocontenida: el normalizador de observaciones esta integrado en `policy.onnx`, de modo que acepta observaciones en crudo.
- Integracion con el daemon del robot: se carga mediante `robotctl policy load <slot> weerawhin/microduck-sprint-2m-weewoo`, siguiendo el esquema 2 del manifiesto de politicas de microduck.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades multilingues: es exclusivamente una politica de control motor.

## Casos de uso

- Despliegue en hardware Microduck real: cargar la politica en una ranura mediante `robotctl policy load` para que el robot ejecute la marcha de sprint de 2 metros de forma continua. Es adecuado porque el formato ONNX y el normalizador embebido permiten inferencia directa en el robot sin preprocesado adicional.
- Evaluacion comparativa en la Microduck Arena: enfrentar esta politica contra otras del reto sprint 2m (por ejemplo, la referencia de Pollen Robotics) para medir tiempos sobre la misma tarea y condiciones.
- Base para ajuste fino en simulacion: partir de esta politica entrenada y continuar el entrenamiento con la receta publicada (`microduck-challenges`, 4096 entornos) para obtener variantes de marcha, ya que el pipeline y el `uv.lock` estan documentados.
- Investigacion en reproducibilidad de RL: al especificarse tarea, commit, semilla y checkpoint, resulta util para estudiar la variabilidad no bit-reproducible del entrenamiento por refuerzo en GPU.
- Desarrollo de comportamientos encadenados: al ser una politica perpetua, permite integrarla como modulo de locomocion dentro de politicas de nivel superior que gestionen otras ranuras (por ejemplo, `walk`, `stand`, `sitstand`, `ground_pick`).
- Docencia y prototipado en robotica open source: sirve como ejemplo de extremo a extremo (entrenamiento en simulacion, exportacion a ONNX y carga en un robot bípedo real de bajo coste).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas (por ejemplo, tiempo empleado en completar los 2 metros, velocidad alcanzada o tasa de exito) ni comparaciones cuantitativas con otras politicas. El reto de referencia (sprint 2m) si existe dentro de microduck-challenges, y la referencia de Pollen Robotics usa checkpoint 1000, mientras que este modelo usa checkpoint 750, pero no se aportan cifras de rendimiento para ninguno de los dos.

## Requisitos de hardware

- Inferencia en el robot: la politica esta pensada para ejecutarse en el propio Microduck (bípedo de 25 cm), no en un servidor; el repositorio de 0,0 GB sugiere una red muy ligera apta para computo embebido.
- VRAM estimada: no disponible.
- GPU recomendadas para entrenamiento: no especificadas; el entrenamiento se realizo con 4096 entornos y hasta 3000 iteraciones, lo que en la practica requiere una GPU con capacidad de computo para RL masivo, pero el modelo no indica cual.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia ONNX en el robot y carga mediante el daemon `robotctl`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; se conoce la frecuencia de control de 50 Hz (periodo de 20 ms por paso de control).

## Comparativa con modelos similares

| Modelo | Autor | Tarea | Entorno / semilla | Checkpoint | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-sprint-2m-weewoo | weerawhin | Sprint 2m (perpetua) | 4096 envs, 3000 iter, seed 42 | 750 | no disponible | HuggingFace (6 descargas) |
| microduck-sprint-2m-reference | pollen-robotics | Sprint 2m (referencia) | 4096 envs, 3000 iter, seed 1 | 1000 | no disponible | HuggingFace |
| microduck-weee | weerawhin | Marcha (varias ranuras) | no disponible | no disponible | no disponible | HuggingFace |

Los tres modelos son politicas de control para el mismo robot Microduck y comparten el formato (61-D de observacion, 14 acciones, 50 Hz, ONNX). La referencia de Pollen Robotics se describe como su checkpoint mas rapido en la Arena; no se dispone de cifras que permitan ordenarlos por rendimiento.

## Limitaciones y advertencias

- Es una politica de control motor, no un modelo de lenguaje: no genera texto, no razona ni procesa lenguajes naturales.
- La licencia no esta indicada, por lo que no puede confirmarse el uso comercial ni las condiciones de redistribucion.
- No se publican metricas de rendimiento ni tasas de exito; no puede evaluarse su calidad objetiva a partir de la informacion disponible.
- Dependencia de hardware especifico: la politica esta entrenada para el Microduck (61-D de observacion, 14 acciones) y no es portable a otros robots sin reentrenamiento.
- Entrenamiento no bit-reproducible: el propio autor advierte que repetir el proceso con la misma semilla produce pesos distintos.
- Modelo de nicho con traccion minima (6 descargas, 0 likes) y sin validacion externa conocida; conviene tratarlo como resultado experimental.
- Al ser una politica perpetua, requiere gestion externa para detenerla o cambiarla de ranura; no tiene criterio de parada propio.
- Riesgo de fallo fuera de la distribucion de entrenamiento (terrenos, cargas o perturbaciones no vistas en simulacion), habitual en politicas de RL transferidas a hardware real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/weerawhin/microduck-sprint-2m-weewoo
- Modelo relacionado (mismo autor): https://huggingface.co/weerawhin/microduck-weee
- Referencia de Pollen Robotics para sprint 2m: https://huggingface.co/pollen-robotics/microduck-sprint-2m-reference/blob/refs%2Fpr%2F1/README.md
- Repositorio de retos de entrenamiento: https://github.com/NIRUN-Weerawit/microduck-challenges
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Pagina oficial del Microduck: https://pollen-robotics.com/microduck/
- Tutorial de montaje de la comunidad: https://github.com/AI-FanGe/Microduck-build-tutorial
