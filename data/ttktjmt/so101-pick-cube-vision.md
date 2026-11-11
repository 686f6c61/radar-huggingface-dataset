# ttktjmt/so101-pick-cube-vision

## Resumen

SO-101 PickCube Vision es una política de control robótico entrenada mediante aprendizaje por refuerzo (PPO) sobre el entorno `SO101PickCubeVision` de MuJoCo Playground 1.0.1. El modelo lo publica el usuario ttktjmt dentro del ecosistema mjswan, y su propósito es resolver una tarea concreta de manipulación: que un brazo robótico SO-101 coja un cubo a partir de observaciones visuales. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un artefacto de política (policy) listo para ejecutarse en simulación.

El repositorio contiene los checkpoints de entrenamiento en formato rsl-rl, junto con una exportación a ONNX (`policy.onnx`), un fichero de contrato (`contract.json`) y datos de referencia (`reference.npz`) que permiten a una escena de mjswan ejecutar la política. La relevancia es acotada pero clara para quien trabaja en robótica simulada: ofrece un ejemplo reproducible de entrenamiento PPO con observaciones visuales sobre un robot de bajo coste (SO-101) en MuJoCo.

La información publicada es muy escasa: no hay datos de benchmarks, ni de licencia, ni de composición del dataset, ni de arquitectura de la red más allá de lo que implica el pipeline de MuJoCo Playground. Todo lo que no consta en la model card se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO sobre MuJoCo Playground; red no detallada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación a ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoints rsl-rl, `policy.onnx`, `contract.json`, `reference.npz` |

## Arquitectura y entrenamiento

La política se entrena con PPO (Proximal Policy Optimization) sobre el entorno `SO101PickCubeVision` de MuJoCo Playground 1.0.1, usando el script `examples/train/so101_pick_cube.py` del proyecto mjswan. El entorno proporciona observaciones visuales, de ahí el sufijo "vision" en el nombre, y la tarea consiste en que el brazo SO-101 coja un cubo. El entrenamiento se gestiona con rsl-rl, cuyo formato de checkpoint se incluye en la carpeta `checkpoints/`; el checkpoint más reciente permite reanudar el entrenamiento.

No se detalla en la model card la arquitectura exacta de la red (capas, tamaño, tipo de encoder visual), el número de pasos de entrenamiento, la composición del dataset ni si hubo fases adicionales de ajuste. Tampoco se documentan innovaciones técnicas más allá del propio pipeline estándar de MuJoCo Playground con PPO. La exportación a ONNX junto con `contract.json` y `reference.npz` sugiere un flujo pensado para desplegar la política en una escena de mjswan con una interfaz de entrada/salida bien definida, pero los detalles de ese contrato no se reproducen en la información disponible.

## Capacidades

- Control robótico simulado: ejecuta una política de agarre (pick) de un cubo con el brazo SO-101 en el entorno `SO101PickCubeVision`.
- Percepción visual: el entorno y la política están diseñados para observaciones basadas en visión, según el nombre del entorno y de la política.
- Aprendizaje por refuerzo reproducible: incluye checkpoints rsl-rl que permiten reanudar el entrenamiento.
- Exportación a ONNX: `policy.onnx` permite ejecutar la política fuera del bucle de entrenamiento.
- Integración con mjswan: `contract.json` y `reference.npz` definen el contrato de ejecución para una escena de mjswan.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni multilingüismo: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos de RL en robótica: cargar los checkpoints rsl-rl y reanudar el entrenamiento con el script de mjswan para estudiar la curva de aprendizaje de PPO en `SO101PickCubeVision`.
- Evaluación de políticas visuales en simulación: ejecutar `policy.onnx` contra el entorno de MuJoCo Playground para medir la tasa de éxito del agarre del cubo en distintas condiciones iniciales.
- Integración en escenas mjswan: usar `contract.json` y `reference.npz` para desplegar la política en una escena interactiva de mjswan y validar el contrato de entrada/salida.
- Punto de partida para fine-tuning: servir como baseline entrenado sobre el que probar variaciones de recompensa, dominio de aleatorización o cambios en las observaciones visuales.
- Docencia y formación en RL aplicado: ejemplo mínimo y ejecutable de un pipeline completo (entorno, entrenamiento PPO, exportación ONNX) sobre un robot de bajo coste.
- Pruebas de despliegue en tiempo real simulado: medir latencia y estabilidad de la política ONNX en un bucle de control antes de trasladar el enfoque a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control pequeña y exportada a ONNX, es plausible que quepa en GPU de gama baja, pero no hay datos publicados que lo confirmen.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta.
- Opciones de despliegue: ONNX Runtime para `policy.onnx`; MuJoCo Playground y mjswan para el entorno y la escena; rsl-rl para reanudar el entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría (políticas de RL para manipulación con SO-101 en MuJoCo Playground) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card no especifica licencia; no se puede asumir uso comercial permitido sin consultar al autor.
- No hay información sobre sesgos, pero al ser una política entrenada en simulación, su comportamiento fuera de la distribución de entrenamiento (condiciones físicas, iluminación, variaciones del objeto) es incierto.
- El alcance es una única tarea (pick cube) y un único robot (SO-101); no generaliza a otras tareas ni plataformas sin reentrenamiento.
- No se documentan el número de pasos de entrenamiento, la tasa de éxito ni la robustez de la política, por lo que no hay garantías de rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB según Hugging Face; conviene verificar la integridad de los artefactos antes de usarlos.
- La transferencia a hardware real no está documentada; la política se entrena y exporta para simulación.
- Las fechas de creación y actualización del repositorio son futuras respecto a la fecha habitual de consulta, lo que puede indicar metadatos inconsistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ttktjmt/so101-pick-cube-vision
- MuJoCo Playground (entorno `SO101PickCubeVision`): no disponible en la información proporcionada
- Proyecto mjswan (script `examples/train/so101_pick_cube.py`): no disponible en la información proporcionada
- rsl-rl (framework de entrenamiento): no disponible en la información proporcionada
