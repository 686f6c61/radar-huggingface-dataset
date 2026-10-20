# TheSauceman/microduck-roller-sprint-2m-skate4

## Resumen

microduck-roller-sprint-2m-skate4 es una política de control entrenada con aprendizaje por refuerzo para el robot bípedo microduck de Pollen Robotics; no es un modelo de lenguaje. Se distribuye como un grafo ONNX que mapea 61 dimensiones de observación a 14 acciones a 50 Hz para patinar sobre una pista plana de 2 m con patines en línea. La publica TheSauceman (Stephen E. Tarter) dentro de la familia de retos microduck-challenges.

La versión skate4 elimina las recompensas que primaban una postura agachada, el tronco erguido y las caderas centradas; según la model card, esto permite inclinarse y mantenerse alto, y reduce el tiempo del sprint de 2,36 s a 1,49 s. Es un caso concreto de ablación de reward shaping sobre una plataforma robótica abierta y de bajo coste, con despliegue directo en el robot mediante `robotctl`.

No se declaran licencia, idiomas, número de parámetros ni topología de red. El repositorio figura con 0,0 GB y no tenía descargas ni likes en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; no se documenta la topología de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (control por paso con observación de 61 dimensiones; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con schema 2 del manifiesto de políticas de microduck |
| Tarea | `Mjlab-RollerSprint2m-MicroDuck`: sprint de 2 m en patines sobre pista plana |
| Dimension de observacion | 61 |
| Numero de acciones | 14 |
| Frecuencia de control | 50 Hz |
| Normalizacion | normalizador de observaciones integrado en el ONNX; se alimenta con observaciones crudas |
| Entrenamiento | `mjlab-microduck 0.1.0` (commit `8d0dbc94c`), 2048 entornos, 6000 iteraciones, checkpoint 5999, semilla 10301 |
| Reproducibilidad | no bit a bit; la misma configuración genera una política comparable, no idéntica |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna de la red: la información pública solo indica que el artefacto es un grafo ONNX con 61 entradas, 14 salidas y el normalizador de observaciones embebido. El entrenamiento se realizó en simulación con el entorno `mjlab-microduck 0.1.0`, en la tarea `Mjlab-RollerSprint2m-MicroDuck`, con 2048 entornos paralelos, un máximo de 6000 iteraciones, checkpoint final en la iteración 5999 y semilla 10301. No se especifican el algoritmo de RL, el tamaño de la red, el número de pasos totales ni posibles fases de currículo.

No hay dataset supervisado, RLHF ni DPO: la señal de aprendizaje es una función de recompensa. La innovación documentada es la retirada de las recompens
