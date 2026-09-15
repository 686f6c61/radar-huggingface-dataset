# tfrere/microduck-move-base-kick-right

## Resumen

Microduck move base kick right es una política de control robótico entrenada por refuerzo, publicada por el usuario tfrere dentro del proyecto Microduck Academy. No es un modelo de lenguaje ni un modelo generativo multimodal: es una política episódica que ejecuta una habilidad concreta sobre el robot humanoide Microduck de Pollen Robotics, consistente en una patada con el pie derecho de 0,5 s a un balón colocado delante del pie, seguida de la vuelta al ciclo de caminata. Se distribuye como fichero ONNX listo para ejecutar y como checkpoint de entrenamiento para reentrenamiento o ajuste fino.

El modelo reproduce desde cero la receta upstream de Pollen Robotics, concretamente la tarea `Mjlab-BallKick-Flat-MicroDuck` del repositorio `pollen-robotics/microduck_rl` en el commit `2b25a48`, con 3999 iteraciones y 4096 entornos en paralelo, sin modificar la función de recompensa. El objetivo declarado no es superar a la política original de Pollen, sino republicarla junto con el checkpoint `base/model.pt` que la Academia necesita para hacer *remix*, es decir, partir de él para ajustar o derivar nuevas habilidades.

Su relevancia es doble. Por un lado, ofrece un punto de partida verificado para quien quiera entrenar habilidades de tipo ball-kick sobre Microduck sin reconstruir el pipeline de RL. Por otro, publica una comprobación de fidelidad contra la política oficial de Pollen (`ball_kick_right.onnx`) en la misma escena y con el mismo comando, lo que permite evaluar si la política reentrenada se comporta de forma equivalente. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño reportado de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo entrenada con el pipeline `rsl_rl` de la tarea `Mjlab-BallKick-Flat-MicroDuck` y exportada a ONNX; topología exacta de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control episódica, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye un `policy.onnx` con el normalizador integrado |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y checkpoint `base/model.pt` de `rsl_rl`, acompañado de `base/agent.yaml` y `base/env.yaml` |
| Tipo de modelo | Política de robótica, familia `ballkick`, tipo `episodic`, tier 1, marcada como `official` |
| Tarea upstream | `Mjlab-BallKick-Flat-MicroDuck` de `pollen-robotics/microduck_rl` (commit `2b25a48`) |
| Presupuesto de entrenamiento | 3999 iteraciones, 4096 entornos en paralelo, sin edición de la recompensa |
| Habilidad | Patada con el pie derecho de 0,5 s y retorno a la marcha |
| Idiomas | no disponibles |
| Tamano del repositorio | 0.0 GB (segun el dato proporcionado) |

## Arquitectura y entrenamiento

Se trata de una política de control obtenida mediante aprendizaje por refuerzo en simulación sobre el modelo MJCF del robot Microduck. El entrenamiento sigue la receta upstream de Pollen Robotics sin cambios en el diseño de recompensa: la tarea `Mjlab-BallKick-Flat-MicroDuck`, ejecutada durante 3999 iteraciones con 4096 entornos paralelos. El resultado se materializa en un checkpoint `rsl_rl` (`base/model.pt`) con sus ficheros de configuración `agent.yaml` y `env.yaml`, y en una exportación ONNX (`policy.onnx`) con el normalizador de observaciones integrado, de modo que puede ejecutarse directamente sin preprocesado externo.

La innovación relevante aquí no está en la arquitectura de red, sino en el empaquetado y la verificabilidad. El repositorio incluye un bloque `academy` en `manifest.json` (esquema 2) con el origen, la tarea y la política fuente, los hechos de entrenamiento y las cifras de fidelidad, además de `fidelity.json`, `train.json` y una trayectoria de exhibición en `rollouts/0.traj` (formato `trajectory.v1`, con los comandos). Esa trazabilidad permite comparar la política reentrenada con la oficial y reutilizar el checkpoint como base para nuevas habilidades. Los detalles de la topología de la red (número de capas, unidades, función de activación) no se especifican en la información disponible.

## Capacidades

- Ejecución de una habilidad locomotora concreta: patada con el pie derecho a un balón situado delante del pie, con una duración aproximada de 0,5 s.
- Retorno automático al ciclo de marcha tras completar la patada.
- Control del equilibrio durante la maniobra: la comprobación de fidelidad reporta `final_upright = True`, `max_tilt = 0.261` y `upright_at_0_5s = True`.
- Ejecución episódica disparada por comando (`robotctl robot do kick-right-foot`), no continua.
- Reutilización como punto de partida para *remix*: el checkpoint `base/model.pt` permite ajuste fino sobre la misma receta.
- Reproducción de una trayectoria de referencia para inspección, mediante `rollouts/0.traj`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, capacidad de agente ni soporte multilingüe.

## Casos de uso

- Despliegue de la habilidad en el robot real: el flujo documentado es `sudo robotctl policy add kick-right-foot tfrere/microduck-move-base-kick-right` seguido de `robotctl robot do kick-right-foot`, lo que permite añadir la patada al repertorio del Microduck sin entrenar nada.
- Punto de partida para *remix*: partiendo de `base/model.pt` y de las configuraciones `agent.yaml` y `env.yaml`, un equipo puede ajustar la política para variar la pierna, la altura del balón o la intensidad del golpeo en lugar de entrenar desde cero.
- Validación de recetas de RL: el bloque `academy` de `manifest.json` y `train.json` documentan iteraciones, número de entornos y ausencia de edición de recompensa, lo que sirve como caso de referencia reproducible del pipeline `rsl_rl` con `Mjlab`.
- Comparación de fidelidad entre políticas: `fidelity.json` y el script `spikes/base_moves/fidelity.py` permiten medir desviaciones entre una política reentrenada y la oficial sobre la misma escena y el mismo comando.
- Investigación en simulación: la política puede cargarse sobre el MJCF upstream del robot y reproducirse con `space/payload/render/rollout.py` para estudiar la estabilidad del golpeo sin riesgo de dañar hardware.
- Demostraciones y material didáctico: el repositorio incluye `video.mp4` y `poster.jpg` del clip de la tarjeta, útiles como material de presentación de la habilidad dentro de la Microduck Academy.
- Integración en cadenas de habilidades: al ser una política episódica que vuelve a la marcha, encaja como eslabón intermedio en secuencias más largas de comportamiento (caminar, golpear, volver a caminar).
- Uso como referencia de comparación interna: la métrica `ball_travel_m` (0.338 m) y `ball_peak_speed_m_s` (0.477 m/s) permiten fijar un umbral de aceptación al entrenar variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los benchmarks habituales de modelos de lenguaje (MMLU, HumanEval, GSM8K y similares) no aplican a una política de control robótico. El único dato cuantitativo publicado es la comprobación de fidelidad frente a la política oficial de Pollen, registrada con `space/payload/render/rollout.py` sobre el MJCF upstream (`spikes/base_moves/fidelity.py`), en la misma escena y con el mismo comando, toma `kick`:

| Metrica | Esta politica | `ball_kick_right.onnx` de Pollen |
|---|---|---|
| final_upright | True | True |
| max_tilt | 0.261 | 0.261 |
| base_z_mean | 0.1149 | 0.1141 |
| base_z_min | 0.1106 | 0.1125 |
| ball_travel_m | 0.338 | 0.326 |
| ball_travel_x_m | 0.338 | 0.326 |
| ball_travel_y_m | -0.017 | 0.018 |
| ball_peak_speed_m_s | 0.477 | 0.503 |
| upright_at_0_5s | True | True |
| tilt_at_0_5s | 0.027 | 0.008 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el tamaÃ±o de `policy.onnx` ni la topologÃ­a de la red; el repositorio figura como 0.0 GB.
- GPU recomendadas: no disponibles. La polÃ­tica estÃ¡ pensada para ejecutarse en el ordenador a bordo del robot Microduck mediante `robotctl`, no en un servidor con GPU.
- EjecuciÃ³n en GPU de consumo: no se documenta; la librerÃ­a declarada es ONNX, lo que permite ejecuciÃ³n en CPU con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime para `policy.onnx` (con el normalizador integrado), `robotctl` para el robot real, y el MJCF upstream del robot junto con `space/payload/render/rollout.py` para simulaciÃ³n y renderizado.
- Reentrenamiento: el checkpoint `base/model.pt` de `rsl_rl` y las configuraciones `agent.yaml` y `env.yaml` permiten reanudar o ajustar el entrenamiento dentro del pipeline `rsl_rl`, con la receta upstream `Mjlab-BallKick-Flat-MicroDuck` que usÃ³ 4096 entornos paralelos.
- Latencia y throughput: no disponibles. El Ãºnico dato temporal publicado es la duraciÃ³n de la habilidad, aproximadamente 0,5 s hasta recuperar la postura erguida.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otras politicas comparables publicadas aparte de la politica oficial de Pollen Robotics para el mismo movimiento. La comparacion relevante es contra esa referencia.

| Modelo | Origen | Formato | Licencia | Checkpoint para remix | Comportamiento |
|---|---|---|---|---|---|
| microduck-move-base-kick-right | Reentrenado desde cero por Microduck Academy con la receta upstream | ONNX (`policy.onnx`) y `rsl_rl` (`base/model.pt`, `agent.yaml`, `env.yaml`) | apache-2.0 | Si (`base/model.pt`) | Patada con pie derecho, `ball_travel_m` = 0.338, `ball_peak_speed_m_s` = 0.477 |
| `ball_kick_right.onnx` (Pollen Robotics) | Politica original distribuida por Pollen | ONNX | no disponible en la informacion proporcionada | no indicado | Patada con pie derecho, `ball_travel_m` = 0.326, `ball_peak_speed_m_s` = 0.503 |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambito de aplicacion muy restringido: es una politica de una unica habilidad episodica sobre el robot Microduck; no generaliza a otras tareas, morfologias ni robots.
- Repositorio sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, y un tamano de repositorio reportado de 0.0 GB, lo que conviene verificar antes de asumir que todos los artefactos estan presentes.
- Fidelidad no identica a la politica oficial: la inclinacion a los 0,5 s es mayor (0.027 frente a 0.008) y la velocidad punta del balon es menor (0.477 frente a 0.503 m/s), aunque el desplazamiento del balon es ligeramente superior (0.338 frente a 0.326 m).
- Asimetria lateral en el desplazamiento del balon: `ball_travel_y_m` = -0.017 en esta politica frente a 0.018 en la oficial, lo que sugiere una desviacion lateral de signo contrario; relevante si se encadenan golpeos con precision.
- Dependencia del simulador y de la receta upstream: los resultados de fidelidad se registraron sobre el MJCF upstream y con un comando concreto; el comportamiento puede degradarse fuera de esas condiciones.
- Sin datos de robustez ante perturbaciones, terreno irregular, friccion variable u obstaculos; la tarea se define como `Flat` (plano).
- Riesgo de sobreajuste a la receta: al no haberse editado la recompensa, la politica hereda las limitaciones de diseno de la tarea original.
- Licencia: Apache-2.0, que permite uso comercial, pero exige conservar los avisos de copyright y licencia y el fichero NOTICE cuando corresponda. La tarea, el diseno de recompensa, el modelo del robot y la receta de entrenamiento son obra de Pollen Robotics y se redistribuyen bajo la misma licencia; conviene mantener la atribucion a `pollen-robotics/microduck_rl`.
- Ausencia total de capacidades linguisticas, multimodales o de tool calling: no es un modelo utilizable para tareas de generacion, razonamiento o agentes de software.
- Fechas del repositorio: creado y actualizado el 2026-09-14 segun los metadatos de HuggingFace, dato que puede resultar anomalo y que conviene comprobar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-base-kick-right
- Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
- Politica oficial `ball_kick_right.onnx`: https://huggingface.co/pollen-robotics/microduck-policies/blob/main/ball_kick_right.onnx
- Repositorio de entrenamiento upstream: https://github.com/pollen-robotics/microduck_rl
- Microduck Academy (Space): https://huggingface.co/spaces/tfrere/microduck

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente aparecieron paginas de inicio de sesion de Gmail, sin relacion con el contenido de la ficha.
