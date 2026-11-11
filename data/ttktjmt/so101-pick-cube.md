# ttktjmt/so101-pick-cube

## Resumen

SO-101 PickCube es una política de aprendizaje por refuerzo entrenada para controlar el brazo robótico SO-101 en la tarea de recoger un cubo, dentro del entorno `SO101PickCube` de MuJoCo Playground 1.0.1. Lo publica el usuario ttktjmt bajo el paraguas del proyecto mjswan, que proporciona tanto el script de entrenamiento (`examples/train/so101_pick_cube.py`) como el formato de exportación que consumen sus escenas.

No se trata de un modelo de lenguaje ni de un modelo fundacional multimodal: es un artefacto de robótica que empaqueta checkpoints de rsl-rl, un grafo exportado a ONNX, un contrato de interfaz (`contract.json`) y una referencia de observaciones (`reference.npz`). Su relevancia es acotada: sirve como ejemplo reproducible de un pipeline completo de entrenamiento con PPO en MuJoCo Playground y de despliegue de la política resultante en un motor de simulación.

El repositorio es de tamano practicamente nulo (0.0 GB reportados) y no cuenta con descargas ni likes en el momento de la consulta. La información pública disponible es muy escasa: la model card se limita a describir el contenido de las carpetas y el origen del entrenamiento, sin detallar hiperparámetros, número de pasos, arquitectura de la red ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO sobre el entorno `SO101PickCube` de MuJoCo Playground 1.0.1) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control robótico, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (export en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | checkpoints de rsl-rl y export en ONNX (`policy.onnx`), con `contract.json` y `reference.npz` |

## Arquitectura y entrenamiento

La model card indica que la política se entrena con PPO (Proximal Policy Optimization) sobre la tarea `SO101PickCube` incluida en MuJoCo Playground 1.0.1, usando el script `examples/train/so101_pick_cube.py` del proyecto mjswan. El resultado se almacena como checkpoints en formato rsl-rl, una librería de aprendizaje por refuerzo para robótica articulada, y el checkpoint más reciente es el que permite reanudar el entrenamiento.

El repositorio incluye además un export listo para inferencia compuesto por `policy.onnx` (el grafo de la política), `contract.json` (la definición del contrato de entrada/salida que espera la escena de mjswan) y `reference.npz` (observaciones de referencia para validar la integración). No se documentan en la información disponible el número de pasos de entrenamiento, la composición de las observaciones, la arquitectura exacta de la red (capas, unidades, funciones de activación), ni si se aplicaron técnicas de domain randomization o curricula. Tampoco se especifica la versión exacta de rsl-rl ni los hiperparámetros de PPO.

## Capacidades

- Control de un brazo robótico SO-101 en la tarea concreta de recoger un cubo dentro del simulador MuJoCo Playground.
- Ejecución de la política exportada a ONNX en escenas de mjswan mediante el contrato definido en `contract.json`.
- Reanudación del entrenamiento a partir de los checkpoints de rsl-rl incluidos.
- Validación de la integración mediante las observaciones de referencia de `reference.npz`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling, agentes ni capacidades multilingües: es una política de control motor especializada en una única tarea.

## Casos de uso

- Reproducción de un pipeline de RL en robótica: sirve para replicar el entrenamiento PPO de `SO101PickCube` con el script de mjswan y comparar curvas de aprendizaje frente a los checkpoints publicados.
- Punto de partida para fine-tuning: los checkpoints de rsl-rl permiten reanudar el entrenamiento y adaptar la política a variantes de la tarea (posición inicial del cubo, fricción, masa) sin partir de cero.
- Despliegue en simulación con mjswan: el export `policy.onnx` junto con `contract.json` y `reference.npz` permite cargar la política en una escena y verificar que las observaciones de entrada coinciden con las esperadas.
- Validación de integraciones de inferencia: el par ONNX más contrato de interfaz es útil para probar runtimes de inferencia (ONNX Runtime, etc.) y comprobar latencias y consistencia numérica frente a la referencia.
- Docencia y demostraciones: ejemplo mínimo y autocontenido de una tarea pick-and-place con un brazo de bajo coste simulado, adecuado para cursos de RL aplicado a robótica.
- Benchmark interno de algoritmos: al ser una tarea pequeña y bien delimitada, puede usarse como caso base para comparar PPO con otros algoritmos de RL implementados sobre MuJoCo Playground.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control de un brazo simulado, el coste de inferencia es previsiblemente mínimo, pero no se documenta el tamano de la red ni el consumo medido.
- GPU recomendadas: no disponibles; no se especifica si el entrenamiento se realizó en GPU ni en qué modelo.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: export ONNX (`policy.onnx`) ejecutable con ONNX Runtime; entrenamiento y reanudación mediante rsl-rl; integración en escenas de mjswan mediante `contract.json` y `reference.npz`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| SO-101 PickCube (ttktjmt) | Recogida de cubo con brazo SO-101 en MuJoCo Playground | rsl-rl + ONNX | no disponible | Hugging Face |
| Políticas de referencia de MuJoCo Playground | Tareas diversas del benchmark (locomoción, manipulación) | checkpoints del propio framework | según el repositorio de MuJoCo Playground | Repositorio de DeepMind |
| Políticas de referencia de rsl-rl | Tareas de locomoción y control articulado | checkpoints rsl-rl | según el repositorio de rsl-rl | Repositorio de ETH Zurich |

No se dispone de datos de rendimiento de este modelo que permitan una comparación cuantitativa con alternativas; la comparativa anterior se limita a categoria, formato y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política resuelve una única tarea (`SO101PickCube`) sobre un único robot (SO-101); no es reutilizable fuera de ese entorno sin reentrenamiento.
- Ausencia de licencia declarada: no se especifica licencia, por lo que el uso comercial y la redistribución quedan sin marco legal claro y requieren contactar con el autor.
- Documentación mínima: no hay hiperparámetros, curvas de entrenamiento, métricas de éxito ni detalles de la arquitectura de red, lo que dificulta evaluar su robustez.
- Riesgo de sobreajuste al simulador: al entrenarse en MuJoCo Playground, el comportamiento en un robot físico o bajo variaciones no modeladas (ruido de sensores, fricción, latencia) no está garantizado.
- Dependencia de versiones: el entrenamiento se realizó contra MuJoCo Playground 1.0.1 y el script de mjswan; cambios de versión en el entorno o en el contrato de observaciones pueden invalidar el export ONNX.
- Sin métricas de validación publicadas: no se puede confirmar la tasa de éxito de la política ni compararla con alternativas.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso o revisión por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ttktjmt/so101-pick-cube
- MuJoCo Playground (entorno `SO101PickCube`): https://github.com/google-deepmind/mujoco_playground
- rsl-rl (formato de checkpoints): https://github.com/leggedrobotics/rsl_rl
- mjswan (escenas y script de entrenamiento `examples/train/so101_pick_cube.py`): no disponible en la información proporcionada
