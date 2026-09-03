# ssuleiman/simrig-orbit-reach

## Resumen

SimRig Orbit-Arm Reach es un modelo de aprendizaje por refuerzo (RL) que implementa una política PPO (Proximal Policy Optimization) para el control de un brazo robótico simulado de 3 grados de libertad (DoF) en el entorno MuJoCo. El modelo ha sido desarrollado por ssuleiman (Suleiman Sulaimanov) como parte del proyecto SimRig, un framework de entrenamiento y evaluación de políticas de control robótico. El objetivo de la tarea es mover el efector final del brazo hasta una posición objetivo en el espacio tridimensional y mantenerla dentro de un radio de 0,05 metros durante cinco ciclos de control consecutivos de 0,02 segundos, evitando contactos prohibidos entre el brazo y el suelo o la base.

El modelo es relevante porque demuestra un flujo de trabajo completo de entrenamiento, evaluación y despliegue de políticas de RL en simulación robótica, con un protocolo de evaluación independiente y determinista. Está entrenado con 4.014.080 pasos de PPO en 2.048 entornos vectorizados, alcanzando una tasa de éxito del 90% en un conjunto de evaluación de 60 semillas. El repositorio incluye el entorno, el modelo del brazo, la política exportada y los contratos de evaluación congelados, lo que permite reproducir y verificar los resultados de forma rigurosa.

Se trata de un modelo de tipo "toy" para investigación, no un manipulador industrial. Su licencia MIT permite uso comercial y modificación sin restricciones significativas, aunque su aplicabilidad práctica fuera del entorno simulado es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política PPO (Brax) con red neuronal feedforward |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no aplica (pesos en punto flotante, formato Brax) |
| Idiomas soportados | no aplica (modelo de control motor) |
| Licencia | MIT |
| Formato de pesos | `policy.params` (parámetros Brax exportados) |

## Arquitectura y entrenamiento

La arquitectura es una política neuronal entrenada con PPO, implementada sobre Brax 0.14.2 y JAX 0.10.2, con MuJoCo 3.10.0 como simulador físico. El entorno (`orbit_reach.py`) define un brazo de 3 DoF con articulaciones `base_yaw`, `shoulder` y `elbow`, y la tarea consiste en alcanzar un objetivo en coordenadas del mundo con el sitio `ee_site` (efector final), manteniendo la posición durante cinco ticks de control consecutivos.

El entrenamiento se realizó durante 4.014.080 pasos de PPO (se solicitaron 4.000.000) con 2.048 entornos vectorizados en paralelo, semilla 23, en una NVIDIA GeForce RTX 4060 Ti. El dataset de entrenamiento es el propio entorno MuJoCo con objetivos de reinicio aleatorios. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento puramente basado en recompensa de entorno. La tasa de éxito del evaluador del entrenador sobre objetivos de reinicio aleatorios fue del 81,25%.

Una innovación destacable es el hook `preview_episode` añadido en la revisión v2 del módulo de entorno, que permite fijar los objetivos de evaluación mostrados en la previsualización, de modo que coinciden con el conjunto de evaluación en lugar de usar los reinicios aleatorios del entrenamiento. Esto mejora la reproducibilidad de las evaluaciones cualitativas.

## Capacidades

- Control de brazo robótico simulado de 3 DoF en MuJoCo para tareas de alcance (reaching) de objetivos en el espacio.
- Mantenimiento de posición del efector final dentro de un umbral de 0,05 m durante cinco ticks de control consecutivos.
- Evitación de contactos prohibidos entre el brazo y el suelo o la base del robot.
- Política determinista para evaluación reproducible (semillas fijas, entorno congelado).
- Previsualización interactiva del comportamiento en el entorno a través de la herramienta `simrig preview`.
- Evaluación de promoción con suite de 30 objetivos mostrados y 60 semillas (tasa de éxito del 90%).

## Casos de uso

- Investigación en RL para control robótico: el modelo sirve como referencia entrenada para comparar algoritmos, hiperparámetros o modificaciones del entorno dentro del framework SimRig.
- Validación de pipelines de RL: permite verificar que el flujo de entrenamiento, exportación de pesos y evaluación funciona correctamente antes de aplicarlo a tareas más complejas.
- Desarrollo de entornos de simulación: el entorno `orbit_reach.py` y el modelo XML del brazo pueden usarse como base para crear variantes con más grados de libertad, obstáculos o dinámicas distintas.
- Evaluación de políticas con protocolo reproducible: el contrato congelado `policy_task.v2.frozen.json` y la suite de evaluación permiten comparar políticas de forma estandarizada y determinista.
- Educación en robótica y RL: el modelo y su documentación son un ejemplo didáctico de entrenamiento PPO con MuJoCo y Brax, con todos los artefactos necesarios para reproducir el experimento.
- Benchmark de hardware de simulación: el entrenamiento en una RTX 4060 Ti con 2.048 entornos paralelos da una referencia de rendimiento para quien quiera probar configuraciones similares en otros equipos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tasa de exito (evaluacion del entrenador, objetivos aleatorios) | 81,25% |
| Tasa de exito (evaluacion independiente, 60 semillas, 30 objetivos) | 54/60 = 90,0% |
| Contactos prohibidos en evaluacion | 0 |
| Semillas fallidas | 9, 10, 13, 16, 18, 43 (todas por `target_not_sustained`) |

No se han publicado resultados comparativos con otros modelos o algoritmos en la informacion disponible. La evaluacion independiente se realizo con un conjunto de 30 objetivos mostrados (no el conjunto reservado de 30 objetivos adicionales), con 60 semillas deterministicas.

## Requisitos de hardware

- El entrenamiento se realizó en una NVIDIA GeForce RTX 4060 Ti (8 GB VRAM) con 2.048 entornos vectorizados, lo que indica que el coste de entrenamiento es asequible con hardware de consumo.
- Para inferencia (previsualización o evaluación), los requisitos son mínimos: cualquier GPU con soporte CUDA o incluso CPU es suficiente, ya que la política es una red neuronal pequeña que controla un brazo de 3 DoF.
- El entorno requiere MuJoCo 3.10.0, JAX 0.10.2, Brax 0.14.2 y Python 3.13 (el registro de entrenamiento usó Python 3.13.13).
- Las herramientas de despliegue incluyen `simrig preview` (previsualización interactiva con servidor en el puerto 8765) y `simrig eval-suite` (evaluación de la política contra contratos congelados).
- Se requiere `--allow-runtime-mismatch` si se ejecuta fuera del runtime grabado (Linux Python 3.13 / CUDA), lo que degrada la evaluación a cualitativa.
- La latencia de inferencia no está documentada, pero para un brazo de 3 DoF con ticks de 0,02 s es despreciable en hardware moderno.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la informacion proporcionada. Se trata de un modelo de referencia para un entorno específico del framework SimRig, sin alternativas públicas equivalentes documentadas en la misma tarea.

## Limitaciones y advertencias

- Es un brazo "toy" de 3 DoF, no un manipulador industrial; los resultados no son directamente transferibles a robots reales sin adaptación adicional.
- La política se entrenó en simulación con MuJoCo y puede no generalizar a dinámicas reales (problema del "sim-to-real gap").
- La tasa de éxito del 90% se obtuvo sobre el conjunto de evaluación mostrado; el conjunto reservado de 30 objetivos no se usó en la compuerta de promoción, por lo que el rendimiento en ese conjunto es desconocido.
- Seis semillas fallaron por `target_not_sustained`, lo que indica que la política no siempre mantiene la posición del efector final durante los cinco ticks requeridos.
- La evaluación independiente se realizó en un runtime Linux específico (Python 3.13 / CUDA); fuera de ese runtime, la evaluación es cualitativa y puede no ser reproducible.
- No hay información sobre el número de parámetros de la red neuronal, la arquitectura exacta de la política (capas, activaciones) ni los hiperparámetros de PPO más allá de los pasos y entornos.
- El modelo no tiene capacidades de lenguaje, visión ni razonamiento; es exclusivamente un controlador de bajo nivel para una tarea motora específica.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ssuleiman/simrig-orbit-reach
- Perfil del autor: https://huggingface.co/ssuleiman
- Repositorio del proyecto SimRig: https://github.com/Su1eym4n/simrig.git (referenciado en la model card)
