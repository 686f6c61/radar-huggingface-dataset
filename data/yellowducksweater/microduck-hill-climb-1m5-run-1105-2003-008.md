# YellowDuckSweater/microduck-hill-climb-1m5-run-1105-2003-008

## Resumen

`microduck-hill-climb-1m5-run-1105-2003-008` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. El modelo resuelve la tarea `Mjlab-HillClimb1m5-MicroDuck`, que consiste en que el robot suba una pendiente de 1,5 metros de desnivel de forma continua. Se publica como un fichero ONNX autocontenido que se carga directamente en una ranura de política del daemon `robotctl` del robot.

La política es de tipo perpetuo: una vez cargada, ejecuta la marcha indefinidamente hasta que se le indique lo contrario. Observa 61 dimensiones del estado del robot y emite 14 acciones a 50 Hz. El normalizador de observaciones está integrado en el propio `policy.onnx`, por lo que el consumidor debe alimentar observaciones en bruto.

El modelo lo publica el usuario YellowDuckSweater, no el equipo de Pollen Robotics, y se entrena sobre el stack `mjlab-microduck 0.1.0` con el repositorio `microduck-challenges`. Su relevancia es la de un artefacto de referencia reproducible dentro del ecosistema de robótica open source, no la de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control por aprendizaje por refuerzo (red neuronal; topología interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tarea | `Mjlab-HillClimb1m5-MicroDuck` (subida de pendiente de 1,5 m) |
| Comportamiento | Política perpetua (se ejecuta hasta recibir orden de parada) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, tamaño de las capas ocultas ni función de activación). Lo que sí se especifica es la interfaz: entrada de 61 dimensiones de observación, salida de 14 acciones, a 50 Hz, con normalizador de observaciones embebido en el grafo ONNX.

El entrenamiento se realizó con el stack `mjlab-microduck 0.1.0` (commit base `1efd853be`) sobre la tarea `Mjlab-HillClimb1m5-MicroDuck` del repositorio `microduck-challenges` (rama `main`, commit `7b94efa2b`). Se usaron 4096 entornos paralelos, un máximo de 3000 iteraciones y semilla 1, con checkpoint final en la iteración 750 y registro en TensorBoard bajo el nombre `run-1105-2003-008`. El autor advierte explícitamente que el entrenamiento por RL en GPU no es reproducible bit a bit entre máquinas: misma receta y misma semilla producen una política comparable, no idéntica.

## Capacidades

- Locomoción cuadrúpeda continua: genera una marcha estable a 50 Hz para el microduck.
- Subida de pendiente: especializada en la tarea de ascenso de 1,5 m de desnivel.
- Ejecución perpetua: mantiene la política activa hasta que se le indique lo contrario, sin horizonte de episodio fijo.
- Observaciones en bruto: el normalizador está integrado, lo que simplifica la integración en el daemon.
- Carga por ranura: se instala en un slot de política mediante `robotctl policy load`.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: es una política motora, no un modelo generativo.

## Casos de uso

- Demostración de ascenso de pendiente: cargar la política en la ranura correspondiente y dejar que el robot suba la rampa de 1,5 m del reto `hill_climb_1m5`, útil como referencia de comportamiento esperado.
- Evaluación comparativa de políticas: servir como punto de comparación frente a otras ejecuciones del mismo reto (por ejemplo, la referencia oficial de Pollen o ejecuciones de otros autores) para medir robustez de la marcha.
- Reproducción de experimentos de RL: reentrenar con la receta documentada (4096 entornos, 3000 iteraciones, semilla 1) para estudiar la variabilidad entre ejecuciones y la sensibilidad a la semilla.
- Pruebas de integración del daemon `robotctl`: validar el flujo de carga de políticas, el esquema 2 de `manifest.json` y el pipeline de observación-acción a 50 Hz en un robot real.
- Base para fine-tuning o currículos de dificultad: partir de esta política y ajustar la pendiente o el terreno para estudiar transferencia y robustez.
- Docencia y divulgación en robótica open source: ejemplo completo y de bajo coste de un pipeline RL-sim-a-real sobre hardware microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasa de éxito ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y el modelo se ejecuta como política ONNX en el propio robot.
- GPU recomendadas: no aplica para inferencia en robot; el entrenamiento documentado asume GPU (4096 entornos paralelos, sin modelo de GPU especificado).
- Cabe en GPU de consumo: la inferencia ONNX de una política de 61→14 es trivial y cabe en cualquier hardware, incluido el cómputo a bordo del microduck; no se especifica el hardware exacto.
- Opciones de despliegue: `robotctl policy load <slot> <repo>` sobre el daemon de microduck; el artefacto es ONNX y puede ejecutarse con cualquier runtime ONNX compatible.
- Latencia y throughput: control a 50 Hz (periodo de 20 ms); no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Autor | Tarea | Entrenamiento | Formato | Licencia |
|---|---|---|---|---|---|
| microduck-hill-climb-1m5-run-1105-2003-008 | YellowDuckSweater | HillClimb1m5 | 4096 envs, 3000 iter, seed 1, checkpoint 750 | ONNX | no disponible |
| microduck-hill-climb-1m5-run-1030-1952 | Helldave | HillClimb1m5 | no disponible | ONNX | no disponible |
| microduck-hill-climb-1m5-reference | pollen-robotics | HillClimb1m5 | receta oficial sin cambios (4096 envs, 3000 iter, seed 1) | ONNX | no disponible |

Las tres políticas atacan el mismo reto y comparten interfaz (61 observaciones, 14 acciones, 50 Hz). No se dispone de métricas públicas comparables de rendimiento entre ellas.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para una única tarea (ascenso de pendiente de 1,5 m); no se garantiza comportamiento fuera de esa distribución de terreno.
- Reproducibilidad: el autor indica que el reentrenamiento no produce pesos idénticos; los resultados pueden variar entre máquinas.
- Licencia no especificada: no hay licencia declarada, lo que impide asumir permisos de uso comercial o redistribución.
- Autoría no oficial: no es una publicación de Pollen Robotics; conviene contrastar con la referencia oficial antes de usarla como base.
- Sin métricas publicadas: no hay datos de tasa de éxito, robustez ante perturbaciones ni sim-a-real que permitan evaluar su calidad frente a alternativas.
- Sin información sobre sesgos, alucinación o idioma: no aplica en el sentido habitual, pero tampoco se documentan fallos de control, oscilaciones o modos de fallo.
- Despliegue: requiere el daemon `robotctl` y el esquema 2 de manifiesto; alimentar observaciones ya normalizadas rompería la política, ya que el normalizador está embebido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-hill-climb-1m5-run-1105-2003-008
- Repositorio de retos y entrenamiento: https://github.com/StephenForte/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Referencia oficial del reto: https://huggingface.co/pollen-robotics/microduck-hill-climb-1m5-reference
- Ejecución comparable de otro autor: https://huggingface.co/Helldave/microduck-hill-climb-1m5-run-1030-1952
