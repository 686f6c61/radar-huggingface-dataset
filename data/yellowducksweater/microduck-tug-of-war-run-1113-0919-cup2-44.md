# YellowDuckSweater/microduck-tug-of-war-run-1113-0919-cup2-44

## Resumen

`microduck-tug-of-war-run-1113-0919-cup2-44` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es un controlador de locomoción que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado en formato ONNX para su despliegue directo en el robot. Lo publica el usuario YellowDuckSweater bajo la librería `microduck`.

La política está entrenada específicamente para la tarea `Mjlab-TugOfWar-MicroDuck` (un ejercicio de tracción tipo "tira y afloja") y se describe como una política *perpetua*: ejecuta la marcha indefinidamente hasta que se le indique lo contrario. Se carga en una ranura de política del daemon del robot mediante el comando `robotctl policy load`.

Es relevante en el contexto de la robótica de bajo coste y la investigación en RL aplicado: demuestra un flujo completo de entrenamiento (mjlab + MuJoCo, 4096 entornos paralelos, 2888 iteraciones) y despliegue reproducible sobre hardware real, con normalización de observaciones integrada en el propio grafo ONNX. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño es de 0.0 GB según Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con RL (arquitectura de red no especificada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación usando `mjlab-microduck 0.1.0` (commit base `1efd853be`), un entorno basado en MuJoCo. La tarea es `Mjlab-TugOfWar-MicroDuck`, definida en el repositorio `StephenForte/microduck-challenges` (rama `main`, commit `c7c9a7304`). El entrenamiento emplea 4096 entornos paralelos, un máximo de 2888 iteraciones del agente y semilla 9, con registro en TensorBoard. El checkpoint publicado corresponde a la iteración 250.

El modelo se exporta a ONNX con la normalización de observaciones integrada en el grafo, de modo que el robot puede alimentar observaciones en bruto directamente. La interfaz es de 61 dimensiones de observación y 14 acciones a 50 Hz. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el pipeline con el mismo código, `uv.lock`, comando y semilla produce una política comparable, pero no idéntica.

## Capacidades

- Control de locomoción del robot microduck mediante política de RL.
- Ejecución perpetua de la marcha hasta recibir una orden de parada.
- Procesamiento de observaciones de 61 dimensiones y emisión de 14 acciones a 50 Hz.
- Normalización de observaciones integrada en `policy.onnx` (acepta observaciones en bruto).
- Carga en ranuras de política del daemon mediante `robotctl policy load`.
- Compatibilidad con el manifiesto de políticas microduck schema 2.
- No dispone de generación de texto, razonamiento, código, visión ni tool calling: es un controlador motor.

## Casos de uso

- Despliegue de una marcha de referencia en el robot microduck: cargar la política en una ranura con `robotctl policy load` y ejecutar la locomoción continua para pruebas de hardware.
- Evaluación de pipelines de RL en robótica de bajo coste: usar esta política como línea base para comparar con otras políticas entrenadas en la misma tarea `Mjlab-TugOfWar-MicroDuck`.
- Reproducción de experimentos: clonar `microduck-challenges`, hacer checkout del commit `c7c9a7304` y ejecutar el comando de entrenamiento documentado para generar una política comparable.
- Pruebas de integración del daemon: validar el flujo de carga de políticas, el manifiesto schema 2 y la interfaz de observación/acción del robot.
- Investigación en transferencia sim-a-real: comparar el comportamiento de la política entrenada en MuJoCo con su ejecución en el robot físico.
- Docencia y demostraciones: ilustrar un ciclo completo de entrenamiento con RL (4096 entornos, TensorBoard) y despliegue en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 0.0 GB y el modelo se ejecuta como política ONNX en el robot).
- GPU recomendadas: no disponible para inferencia; para reentrenar, el autor indica que se usó GPU pero no especifica el modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime a través del daemon microduck (`robotctl policy load`); el entrenamiento usa `mjlab` con MuJoCo y `uv`.
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms por paso); latencia real no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otras políticas microduck comparables en la información recibida.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución.
- Entrenada para una tarea concreta (`Mjlab-TugOfWar-MicroDuck`); no se garantiza su comportamiento en otras tareas o terrenos.
- El autor advierte que el reentrenamiento no es bit-reproducible: los pesos no serán idénticos entre máquinas.
- Sin métricas publicadas de rendimiento, robustez ni tasa de éxito en el robot físico.
- Sin información sobre sesgos, alucinación o limitaciones de idioma: no aplica a un modelo de control motor.
- Repositorio sin descargas ni likes: ausencia de validación por parte de la comunidad.
- Depende del ecosistema microduck (daemon, manifiesto schema 2) para su despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-tug-of-war-run-1113-0919-cup2-44
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/StephenForte/microduck-challenges
