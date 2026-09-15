# tfrere/microduck-move-base-kick-left

## Resumen

`tfrere/microduck-move-base-kick-left` es una política de control robótico para el robot Microduck, publicada por el usuario tfrere dentro del programa Microduck Academy. Se trata de un movimiento oficial de patada con el pie izquierdo, originalmente desarrollado por Pollen Robotics y reentrenado desde cero por la Academia con la receta upstream sin modificaciones, de modo que el repositorio incluye el checkpoint necesario para reutilizarlo y ajustarlo.

No es un modelo de lenguaje ni un modelo multimodal, sino una política de aprendizaje por refuerzo entrenada con la tarea `Mjlab-BallKick-Flat-MicroDuck` del repositorio `pollen-robotics/microduck_rl` (commit `2b25a48`), con 3999 iteraciones, 4096 entornos paralelos y sin edición de la función de recompensa. El resultado se exporta a ONNX con el normalizador integrado, listo para ejecutarse en el robot o en simulación.

Su relevancia es acotada pero concreta: forma parte del catálogo de políticas de Microduck Academy, clasificada como `official`, `family:ballkick`, `kind:episodic` y `tier:1`. Aporta además una comparación de fidelidad frente a la política que distribuye Pollen (`ball_kick_left.onnx`), lo que permite evaluar si el reentrenamiento reproduce el comportamiento original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de política para control robótico entrenada con aprendizaje por refuerzo (rsl_rl) y exportada a ONNX |
| Parámetros totales | no disponible |
| Longitud de contexto | no aplica (política episódica de control, patada de 0,5 s); no disponible en detalle |
| Tipos de cuantización | no disponible (exportación ONNX con normalizador integrado) |
| Idiomas soportados | no aplica (modelo de control robótico, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y checkpoint PyTorch de rsl_rl (`base/model.pt`) con `agent.yaml` y `env.yaml` |

## Arquitectura y entrenamiento

La política se entrena siguiendo la receta upstream de Pollen Robotics sobre la tarea `Mjlab-BallKick-Flat-MicroDuck` del repositorio `microduck_rl` (commit `2b25a48`). El entrenamiento se realizó con 3999 iteraciones y 4096 entornos paralelos, sin edición de la recompensa original, lo que la convierte en una reproducción fiel del procedimiento de la tarea de patada con el pie izquierdo. El marco de trabajo es rsl_rl, del que se publican el checkpoint y los ficheros de configuración (`agent.yaml`, `env.yaml`) para permitir el ajuste fino posterior, lo que el autor denomina «remix».

El artefacto desplegable es `policy.onnx`, una exportación a ONNX con el normalizador de observaciones integrado, pensada para su ejecución directa. El movimiento consiste en una patada de 0,5 s con el pie izquierdo sobre un balón situado delante del pie, seguida del retorno a la marcha. El repositorio incluye también `manifest.json` (esquema 2 con bloque `academy`), `fidelity.json`, `train.json` y una trayectoria de demostración `rollouts/0.traj` en formato `trajectory.v1`.

## Capacidades

- Ejecución de un movimiento episódico de patada con el pie izquierdo sobre un balón colocado delante del pie, con retorno a la marcha al finalizar.
- Control robótico de cuerpo completo durante el movimiento, manteniendo el equilibrio (el indicador `final_upright` es verdadero).
- Ejecución en robot real mediante la CLI `robotctl` (`robotctl policy add kick-left-foot tfrere/microduck-move-base-kick-left` y `robotctl robot do kick-left-foot`).
- Inferencia a partir del fichero ONNX con el normalizador ya incorporado, sin pasos de preprocesado externos.
- Reutilización como punto de partida para ajuste fino («remix») gracias al checkpoint `base/model.pt` y sus configuraciones.
- Reproducción de trayectorias registradas (`rollouts/0.traj`) con los comandos asociados.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni tool calling; no es un modelo de lenguaje.

## Casos de uso

- Ejecución de la patada en el robot físico: la política se instala con `robotctl policy add` y se lanza con `robotctl robot do kick-left-foot`, lo que permite incorporar el movimiento al repertorio del robot sin entrenamiento adicional.
- Investigación en aprendizaje por refuerzo: al publicarse el checkpoint de rsl_rl junto con `agent.yaml` y `env.yaml`, sirve como base reproducible para estudiar la tarea `Mjlab-BallKick-Flat-MicroDuck` y comparar variantes de recompensa o hiperparámetros.
- Ajuste fino de variantes de patada: el bloque `base/` permite reentrenar («remix») el movimiento para obtener versiones alternativas (por ejemplo, distintos puntos de contacto o velocidades) partiendo de un comportamiento ya válido.
- Validación de fidelidad de reentrenamientos: la tabla de fidelidad incluida permite comparar una nueva política contra la de Pollen en la misma escena y con el mismo comando, usando la toma `kick`.
- Demostraciones y material divulgativo: el repositorio incluye `video.mp4` y `poster.jpg`, generados con el script de renderizado de la Academia, útiles para documentar el movimiento.
- Integración en simulación: la política puede cargarse en el entorno de MuJoCo/rsl_rl upstream para reproducir la trayectoria registrada y verificar el comportamiento antes de desplegarlo.
- Pruebas de pipeline de despliegue ONNX: al ser una política pequeña exportada a ONNX, es adecuada para validar cadenas de inferencia en el robot o en un equipo de cómputo a bordo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye una comprobación de fidelidad frente a la política `ball_kick_left.onnx` de Pollen Robotics, registrada con `space/payload/render/rollout.py` sobre el MJCF upstream (`spikes/base_moves/fidelity.py`), en la misma escena, mismo comando y toma `kick`:

| Métrica | Este movimiento | `ball_kick_left.onnx` de Pollen |
|---|---|---|
| final_upright | True | True |
| max_tilt | 0,264 | 0,262 |
| base_z_mean | 0,1173 | 0,1141 |
| base_z_min | 0,107 | 0,1098 |
| ball_travel_m | 1,199 | 0,261 |
| ball_travel_x_m | 1,197 | 0,26 |
| ball_travel_y_m | 0,073 | 0,016 |
| ball_peak_speed_m_s | 1,131 | 0,395 |
| upright_at_0_5s | True | True |
| tilt_at_0_5s | 0,065 | 0,028 |

Las métricas de inclinación (`max_tilt`, `tilt_at_0_5s`) y de altura (`base_z_*`) se presentan tal como figuran en la model card, sin unidades indicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. Al tratarse de una política de control exportada a ONNX, es plausible su ejecución en CPU, pero no se especifica en la información disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecución en el robot mediante `robotctl`; inferencia ONNX con el normalizador integrado; simulación con el entorno rsl_rl/MuJoCo de `pollen-robotics/microduck_rl`.
- Latencia y throughput: no disponible. El movimiento tiene una duración declarada de 0,5 s, pero no se ofrecen medidas de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Autor | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| `tfrere/microduck-move-base-kick-left` | tfrere (Microduck Academy) | Política RL de patada izquierda, ONNX + checkpoint rsl_rl | Apache-2.0 | Repositorio HuggingFace, 0 descargas y 0 likes |
| `ball_kick_left.onnx` (en `pollen-robotics/microduck-policies`) | Pollen Robotics | Política de patada izquierda de referencia | Apache-2.0 según la receta upstream | Publicada por Pollen Robotics; usada como referencia de fidelidad |
| Otras políticas de Microduck Academy | tfrere / Pollen Robotics | Políticas de movimientos (`family:ballkick`, `tier:1`) | Apache-2.0 (según receta) | No se dispone de datos concretos de otros movimientos en la información proporcionada |

En cuanto al comportamiento medido, la diferencia más destacada es el recorrido del balón: 1,199 m frente a 0,261 m de la política de Pollen, con una velocidad punta de 1,131 m/s frente a 0,395 m/s. Las métricas de equilibrio (`final_upright`, `upright_at_0_5s`, `max_tilt`) son muy similares entre ambas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no hace código ni matemáticas y no soporta tool calling ni agentes.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de adopción ni de validación por terceros.
- El movimiento es único y específico: patada con el pie izquierdo sobre un balón colocado delante del pie, con retorno a la marcha; no cubre otras variantes de patada.
- La comprobación de fidelidad muestra divergencias notables en el recorrido y la velocidad del balón respecto a la política de Pollen (1,199 m frente a 0,261 m), lo que indica que el reentrenamiento no reproduce exactamente el comportamiento original.
- Los datos de fidelidad proceden de una única escena y un único comando (`kick`), por lo que la robustez fuera de esas condiciones no está documentada.
- No se especifican requisitos de hardware, latencia ni comportamiento en tiempo real.
- La licencia es Apache-2.0, que permite uso comercial, pero exige conservar los avisos de copyright y licencia y atribuir correctamente a Pollen Robotics como autor de la tarea, la recompensa, el modelo del robot y la receta de entrenamiento.
- El modelo depende del robot Microduck y de su ecosistema (`robotctl`, `microduck_rl`); no es portable a otras plataformas sin adaptación.
- La fecha de creación del repositorio (2026-09-14) es posterior a la fecha de la información de referencia, dato a verificar antes de su uso en producción.
- El tamaño del repositorio aparece como 0.0 GB, lo que impide estimar el número de parámetros de la red a partir de ese dato.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-base-kick-left
- Microduck Academy (space): https://huggingface.co/spaces/tfrere/microduck
- Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
- Política de referencia `ball_kick_left.onnx`: https://huggingface.co/pollen-robotics/microduck-policies/blob/main/ball_kick_left.onnx
- Repositorio de entrenamiento `microduck_rl`: https://github.com/pollen-robotics/microduck_rl
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; los resultados devueltos corresponden a un sitio de reservas de viajes y no guardan relación con la ficha.
