# TheSauceman/microduck-sprint-2m-dash1

## Resumen

microduck-sprint-2m-dash1 es una política de control por aprendizaje por refuerzo (reinforcement learning) destinada al robot microduck de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un controlador de locomoción ("gait") que produce las acciones de las patas del robot a partir de observaciones del estado del sistema. La política consume un vector de observación de 61 dimensiones y emite 14 acciones a una frecuencia de control de 50 Hz, y se distribuye empaquetada como un fichero ONNX con el normalizador de observaciones integrado, de modo que recibe observaciones en crudo.

El objetivo declarado por el autor es maximizar la velocidad del robot. Segun la propia model card, en lugar de premiar el seguimiento de una velocidad objetivo, se recompensó directamente la velocidad, lo que dio lugar a una marcha concreta: el robot proyecta su cabeza pesada hacia delante y avanza a saltos con ambas patas juntas, tomando impulso antes de que arranque el cronómetro. Se describe como una política "perpetua", es decir, se ejecuta de forma continua hasta que se le indique lo contrario.

La relevancia del modelo es acotada y muy específica: se trata de una contribución dentro del ecosistema microduck, útil para quienes trabajan con ese robot concreto y con el framework de entrenamiento mjlab. No hay datos publicados sobre licencia, idiomas ni licencia comercial, y el repositorio no registra descargas ni valoraciones en el momento de la consulta. La informacion disponible es escasa y procede casi en su totalidad de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX; arquitectura interna de la red no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones y 14 acciones por paso |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX, sin cuantizaciones alternativas documentadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) acompañado de `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La arquitectura interna de la red neuronal no se describe en la informacion disponible. Lo que se sabe es que se trata de una política entrenada mediante aprendizaje por refuerzo y exportada al formato ONNX para su despliegue en el robot. El normalizador de observaciones está incorporado dentro de `policy.onnx`, por lo que el sistema de control alimenta observaciones sin procesar. El modelo sigue el esquema de manifiesto de políticas de microduck (schema 2), lo que permite cargarlo en una "slot" de política del daemon del robot mediante el comando `robotctl policy load`.

Los datos de entrenamiento disponibles son de trazabilidad, no de composición del dataset. La tarea se denomina `Mjlab-Sprint2m-MicroDuck`, definida en el repositorio `microduck-challenges` (rama `main`, commit `bcde7e73e`), con checkpoint 1500 y semilla 1, partiendo de la base `mjlab-microduck 0.1.0 @ 8d0dbc94c`. El entrenamiento arrancó el 2026-10-15T20:36:45Z. La configuración de reproduccion usa `num-envs 4096`, `max-iterations 3000` y semilla 1. El propio autor advierte de que el entrenamiento por refuerzo en GPU no es bit-reproducible entre máquinas: repetir el proceso produce una política comparable, no los mismos pesos. No se documentan numero de tokens, composición del dataset, ni fases de RLHF o DPO, conceptos que en cualquier caso no aplican a este tipo de política.

## Capacidades

- Control de locomoción del robot microduck: genera 14 acciones de control a 50 Hz a partir de 61 dimensiones de observación.
- Marcha de sprint tipo "bound" (salto con ambas patas juntas, con proyección de la cabeza hacia delante).
- Ejecucion perpetua: la política se ejecuta de forma continua hasta que el sistema la detiene.
- Despliegue embarcado: compatible con la carga en slots de política del daemon mediante `robotctl policy load`.
- Integracion del normalizador de observaciones dentro del propio fichero ONNX, lo que simplifica la alimentación de datos en crudo.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes, ya que no es un modelo de ese tipo.

## Casos de uso

- Locomoción rápida sobre el microduck: la política se carga en una slot del robot para obtener una marcha de sprint, útil cuando se prioriza la velocidad de desplazamiento sobre la estabilidad o la naturalidad del paso.
- Investigación en aprendizaje por refuerzo para robótica: sirve como ejemplo reproducible (misma tarea, commit y semilla) para estudiar cómo distintas funciones de recompensa moldean la marcha resultante.
- Comparacion de políticas de marcha: al ser una política concreta cargable en el daemon, puede alternarse con otras políticas del mismo robot para comparar velocidades y estilos de locomoción.
- Demostraciones y divulgación: el comportamiento de salto con ambas patas es visualmente distintivo y puede emplearse en demostraciones del robot.
- Pruebas de robustez del hardware: ejecutar una marcha agresiva de sprint permite someter al robot a condiciones de esfuerzo mecánico elevado en banco de pruebas.
- Base para ajuste posterior: el pipeline de entrenamiento documentado (`microduck-challenges` con mjlab) permite partir de esta tarea y reentrenar con otras recompensas o semillas para obtener variantes de marcha.
- Validacion del flujo de despliegue ONNX: útil como caso de prueba del proceso `robotctl policy load` y del manifiesto schema 2 en el daemon del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el comportamiento cualitativamente ("throw its heavy head forward and bound down the lane with both legs together"), pero no aporta métricas numéricas de velocidad, estabilidad, consumo ni comparaciones con otras políticas.

## Requisitos de hardware

- Al tratarse de una política ONNX de control a 50 Hz, la inferencia es ligera y está pensada para ejecutarse en el ordenador de a bordo del robot, no en GPUs de centro de datos.
- VRAM estimada: no disponible. No se documenta tamano del fichero ni requisitos de memoria (el repositorio figura con 0.0 GB, dato que no permite estimar el tamano real de los pesos).
- GPU recomendadas: no disponible; no se documenta el uso de GPU para inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga en el daemon del robot mediante `robotctl policy load <slot> TheSauceman/microduck-sprint-2m-dash1`; ejecución del fichero `policy.onnx` mediante un runtime ONNX estándar.
- Latencia y throughput: no disponibles. El único dato de temporizacion es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones | Acciones | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-sprint-2m-dash1 (TheSauceman) | Política RL para microduck | 61 | 14 a 50 Hz | ONNX | no disponible | Repositorio con 0 descargas y 0 likes |
| Otras políticas microduck | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre políticas comparables de la misma categoría (otras marchas para microduck u otros controladores de locomoción directamente equiparables) en los datos proporcionados.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que se desconoce si se permite el uso comercial. Debe consultarse con el autor antes de cualquier explotación.
- No hay datos de benchmarks ni métricas objetivas de rendimiento, estabilidad o eficiencia energética.
- La política está optimizada explicitamente para velocidad, no para estabilidad, eficiencia o suavidad de marcha; una recompensa centrada en la velocidad puede producir comportamientos agresivos para el hardware.
- El entrenamiento por refuerzo en GPU no es bit-reproducible: los pesos obtenidos al reproducir el entrenamiento no serán idénticos.
- No se documentan sesgos, pero tampoco se documentan evaluaciones de robustez ante perturbaciones, terrenos variables o fallos de sensores.
- El modelo está fuertemente acoplado al robot microduck y a su esquema de observaciones/acciones; no es reutilizable fuera de ese contexto sin readaptación.
- El repositorio sin descargas ni interacciones implica ausencia de validacion externa por parte de la comunidad.
- Los resultados de busqueda web asociados no guardan relacion con el modelo (corresponden a formaciones sobre refrigeración industrial) y no aportan informacion util.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheSauceman/microduck-sprint-2m-dash1
- Robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de desafios y entrenamiento: https://github.com/SteveTarter/microduck-challenges
- Paper: no disponible
- Blog o demo: no disponible
