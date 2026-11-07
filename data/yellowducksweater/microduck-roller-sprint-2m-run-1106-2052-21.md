# YellowDuckSweater/microduck-roller-sprint-2m-run-1106-2052-21

## Resumen

`microduck-roller-sprint-2m-run-1106-2052-21` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal que mapea observaciones de 61 dimensiones a 14 acciones de actuación a 50 Hz, pensado para ejecutar una marcha (gait) sobre ruedas o rodillos de forma perpetua. Lo publica el usuario YellowDuckSweater en Hugging Face dentro de una serie de experimentos de entrenamiento con el framework `microduck-challenges`.

El modelo se distribuye en formato ONNX con el normalizador de observaciones embebido, de modo que el robot puede alimentarlo con observaciones en bruto. Se carga en una de las ranuras de política del daemon del robot mediante `robotctl`. La model card lo describe explícitamente como "still slow" (todavía lento), lo que sugiere que es un checkpoint intermedio de una línea de experimentos de sprint sobre rodillos.

Su relevancia es la de un artefacto de investigación reproducible: la model card documenta el `task_id`, el commit exacto del repositorio de entrenamiento, la semilla y el comando completo para reproducir el entrenamiento, lo que lo convierte en un ejemplo útil de política RL reproducible (aunque no bit a bit) para robótica de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal entrenada con RL; se infiere red tipo MLP por el formato ONNX y la tarea, pero no se especifica) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (distribución en ONNX) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas microduck |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Tarea de entrenamiento | `Mjlab-RollerSprint2m-MicroDuck` |
| Checkpoint | 1000 |
| Semilla | 10187 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red. Se trata de una política de reinforcement learning entrenada con el framework `mjlab` (versión `mjlab-microduck 0.1.0`, commit `1efd853be`), sobre el repositorio `microduck-challenges` de StephenForte (rama `main`, commit `8efa68d3b`). El entrenamiento se lanzó el 2026-11-07T04:56:00Z y el artefacto corresponde al checkpoint 1000 de la ejecución `run-1106-2052-21`.

El comando de reproducción documentado usa 2048 entornos paralelos, un máximo de 6500 iteraciones del agente, semilla 10187 y registro en TensorBoard. La model card advierte explícitamente de que el entrenamiento no es bit-reproducible entre máquinas: repetirlo con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no los mismos pesos. La política es perpetua: se ejecuta de forma continua hasta que se le indique lo contrario, y está diseñada para locomoción sobre rodillos.

## Capacidades

- Control locomotor continuo del robot microduck sobre rodillos o ruedas a 50 Hz.
- Política perpetua: mantiene la marcha indefinidamente hasta recibir una orden de parada o cambio de política.
- Normalización de observaciones integrada en el propio `policy.onnx`, por lo que acepta observaciones en bruto del robot.
- Carga en el daemon del robot mediante `robotctl policy load <slot> <repo>`, encajando en el sistema de ranuras de política de microduck.
- Mapeo directo de 61 observaciones a 14 acciones, sin necesidad de preprocesado externo.
- No dispone de generación de texto, razonamiento, código, visión, tool calling ni capacidades multilingües.

## Casos de uso

- Locomoción continua en robótica de bajo coste: cargar la política en la ranura correspondiente del microduck para que el robot se desplace sobre rodillos de forma sostenida durante sesiones de prueba.
- Investigación en aprendizaje por refuerzo reproducible: usar el `task_id`, commit, semilla y comando documentados para replicar el experimento y comparar políticas entrenadas con distintas semillas.
- Comparación de gaits: contrastar esta política de sprint sobre rodillos con las variantes de la misma serie (por ejemplo, `microduck-sprint-2m-run-1106-1358-13` de YellowDuckSweater o `microduck-roller-sprint-2m-roller-1` de GinDuck) para evaluar el efecto de cambios en el entorno de entrenamiento.
- Docencia y divulgación en robótica: demostrar un pipeline completo de entrenamiento RL, exportación a ONNX y despliegue en hardware real en un robot asequible.
- Base para fine-tuning o continuación del entrenamiento: al estar documentado el entorno `mjlab-microduck`, sirve como punto de partida para experimentos de ajuste con recompensas modificadas.
- Integración en pruebas automatizadas del daemon: validar el flujo `robotctl policy load` y el esquema 2 del manifiesto de políticas con un artefacto real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0,0 GB) y el formato ONNX, la política es presumiblemente muy pequeña y apta para inferencia en CPU.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 2048 entornos paralelos, lo que requiere GPU de datacenter, pero no se especifica el modelo empleado.
- Inferencia en GPU de consumo: no disponible; por el perfil de la tarea (61 entradas, 14 salidas, 50 Hz) es plausible que se ejecute en CPU o en GPU integrada, pero no hay confirmación en la información.
- Opciones de despliegue: ONNX Runtime a través del daemon microduck (`robotctl`); no se documentan otros runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Autor | Tarea | Formato | Estado |
|---|---|---|---|---|
| microduck-roller-sprint-2m-run-1106-2052-21 | YellowDuckSweater | Sprint sobre rodillos | ONNX | Objeto de esta ficha |
| microduck-sprint-2m-run-1106-1358-13 | YellowDuckSweater | Sprint (variante) | no disponible | Publicado en Hugging Face |
| microduck-roller-sprint-2m-roller-1 | GinDuck | Sprint sobre rodillos | no disponible | Publicado en Hugging Face |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- La propia model card califica la política como "still slow": el rendimiento de la marcha es limitado y corresponde a un checkpoint intermedio (1000) de una ejecución de hasta 6500 iteraciones.
- Entrenada específicamente para locomoción sobre rodillos; no se garantiza su comportamiento en otras superficies o configuraciones del robot.
- Licencia no disponible: no puede asumirse permiso para uso comercial sin consultar al autor.
- No es bit-reproducible: el mismo comando y semilla producen pesos distintos en otra máquina.
- Sin datos publicados de benchmarks, sesgos o evaluación formal; el único criterio de calidad documentado es la observación cualitativa del autor.
- No aplica a tareas de lenguaje, visión, razonamiento o agentes; cualquier uso fuera del control del microduck queda fuera de su ámbito.
- El repositorio tiene 0 descargas y 1 like, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-roller-sprint-2m-run-1106-2052-21
- Repositorio de entrenamiento: https://github.com/StephenForte/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Política similar de YellowDuckSweater: https://huggingface.co/YellowDuckSweater/microduck-sprint-2m-run-1106-1358-13
- Política similar de GinDuck: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-1
