# tfrere/microduck-move-base-roller

## Resumen

Microduck move base roller es una política de control robótico (no un modelo de lenguaje) publicada por el usuario tfrere dentro del programa Microduck Academy. Implementa el movimiento de patinaje sobre ruedas (roller skating) del robot MicroDuck de Pollen Robotics: una marcha de velocidad sobre pies con ruedas que desliza hacia delante al recibir un comando de velocidad. El repositorio se distribuye como una política ya entrenada en formato ONNX, lista para ejecutarse en el robot, junto con el checkpoint de entrenamiento y las configuraciones necesarias para reentrenarla o ajustarla.

El modelo es un reentrenamiento desde cero de la receta original de Pollen Robotics, ejecutado con la tarea `Mjlab-Velocity-Flat-MicroDuck-Rollers` del repositorio `pollen-robotics/microduck_rl` en el commit `2b25a48`, con 7999 iteraciones y 4096 entornos en paralelo, y sin modificaciones en la función de recompensa. Su interés práctico es doble: por un lado permite reproducir el movimiento en un MicroDuck real mediante la CLI `robotctl`; por otro, al incluir el checkpoint `base/model.pt` junto con `agent.yaml` y `env.yaml`, sirve como punto de partida para el flujo de "remix" (ajuste fino) de la propia Academia.

El tamaño del repositorio es inferior a 0,1 GB, lo que es coherente con una red de política compacta orientada a inferencia en tiempo real. No se especifican en la información disponible ni la arquitectura interna de la red, ni el número de parámetros, ni los idiomas soportados (no aplica, ya que no es un modelo de texto).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; política de control entrenada con aprendizaje por refuerzo y exportada a ONNX (checkpoint de la librería `rsl_rl`) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); la observación es el estado del robot y el comando de velocidad |
| Tipos de cuantizacion | No disponible (se distribuye ONNX sin cuantizaciones publicadas) |
| Idiomas soportados | No aplica / no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`, con normalizador incorporado) y checkpoint PyTorch (`base/model.pt`, `base/agent.yaml`, `base/env.yaml`) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal de la política (número de capas, tamaño de las capas ocultas ni función de activación). Lo que sí se documenta es el procedimiento: se trata de una política de locomoción entrenada por aprendizaje por refuerzo con la tarea `Mjlab-Velocity-Flat-MicroDuck-Rollers` del repositorio `pollen-robotics/microduck_rl` (Apache-2.0), en el commit `2b25a48`. El entrenamiento se ejecutó "desde cero" con la receta original sin cambios, durante 7999 iteraciones y con 4096 entornos simulados en paralelo, sin editar la función de recompensa. El checkpoint resultante pertenece a la librería `rsl_rl`; el algoritmo concreto de optimización no se explicita en la model card.

El objetivo de comportamiento es una marcha de velocidad sobre pies con ruedas (modo roller): el robot desliza hacia delante siguiendo el comando de velocidad recibido. El paquete incluye `policy.onnx` (inferencia directa, normalizador integrado), el checkpoint de entrenamiento con sus ficheros de configuración (`base/model.pt`, `base/agent.yaml`, `base/env.yaml`), una trayectoria de muestra con los comandos empleados (`rollouts/0.traj`), un manifiesto con metadatos de origen y entrenamiento (`manifest.json`, esquema 2 con bloque `academy`), los datos de fidelidad (`fidelity.json`) y los datos de entrenamiento (`train.json`). Como innovación destacable en cuanto a formato, la incorporación del normalizador dentro del propio ONNX simplifica el despliegue: no hay que replicar el preprocesado por separado.

## Capacidades

- Locomoción de velocidad sobre ruedas: genera la marcha de patinaje del MicroDuck a partir de un comando de velocidad, manteniendo la base en posición vertical durante la ejecución.
- Seguimiento de comandos de velocidad: en la comprobación de fidelidad documentada se emplea el comando `vx0.30` y la política responde desplazándose hacia delante sin caer (`fell = False`).
- Control de equilibrio: en la toma registrada alcanza `final_upright = True`, con una inclinación máxima (`max_tilt`) de 0,324 rad y una altura media de base (`base_z_mean`) de 0,1124 m.
- Inferencia autocontenida: el fichero `policy.onnx` incluye el normalizador, por lo que puede ejecutarse sin lógica de preprocesado externa.
- Reentrenamiento y ajuste fino: la inclusión de `base/model.pt` con `agent.yaml` y `env.yaml` permite el flujo de "remix" de Microduck Academy.
- Ejecución reproducible en robot: integración con la CLI `robotctl` para registrar y ejecutar la política.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni procesamiento de visión o audio: es una política de control motriz, no un modelo generativo.

## Casos de uso

- Demostración de patinaje en un MicroDuck físico: registrar la política con `robotctl policy add roller-skating tfrere/microduck-move-base-roller` y ejecutarla con `robotctl robot do roller-skating` permite mostrar el movimiento sobre ruedas sin reentrenar nada.
- Punto de partida para "remix": cargar `base/model.pt` junto a `agent.yaml` y `env.yaml` para ajustar la política a variantes del movimiento (por ejemplo, cambios de velocidad objetivo o de superficie) partiendo de una marcha ya funcional.
- Evaluación comparativa de recetas de entrenamiento: al conservar la receta upstream sin cambios, sirve como referencia para medir el efecto de modificaciones en recompensa o número de iteraciones frente al resultado original de Pollen.
- Validación de fidelidad en simulación: el paquete incluye `fidelity.json` y una trayectoria de muestra, lo que permite reproducir la comparación frente a `roller.onnx` en el mismo escenario y con el mismo comando.
- Base para investigación en locomoción híbrida rueda-pata: el modo roller sobre pies con ruedas es un caso poco común y útil para estudiar estabilidad y control de velocidad en morfologías híbridas.
- Integración en pipelines de evaluación automatizada: al ser un ONNX autocontenido, puede invocarse desde un bucle de simulación para medir métricas de desplazamiento, inclinación y caídas de forma sistemática.
- Material docente: la combinación de política ejecutable, checkpoint, configuraciones y datos de fidelidad facilita explicar el ciclo completo de entrenamiento por refuerzo aplicado a robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no aplica en el sentido habitual: no es un modelo de lenguaje y no hay métricas tipo MMLU, HumanEval o GSM8K). El único dato cuantitativo documentado es la comprobación de fidelidad frente a la política original de Pollen, `roller.onnx`, registrada con `space/payload/render/rollout.py` sobre el MJCF upstream del robot (`spikes/base_moves/fidelity.py`), en la misma escena y con el mismo comando (toma `vx0.30`):

| Metrica | Esta politica | `roller.onnx` de Pollen |
|---|---|---|
| final_upright | True | True |
| max_tilt | 0,324 | 0,388 |
| base_z_mean | 0,1124 | 0,1183 |
| base_z_min | 0,1079 | 0,109 |
| travel_m | 2,875 | 5,243 |
| travel_x_m | 1,594 | 4,987 |
| speed_m_s | 0,36 | 0,657 |
| cadence_steps_s | 0,0 | 0,0 |
| fell | False | False |

Lectura de los datos: ambas políticas mantienen el robot en pie y sin caída, y la política de este repositorio presenta una inclinación máxima ligeramente menor (0,324 frente a 0,388). La diferencia principal está en el desplazamiento: 2,875 m de recorrido total y 0,36 m/s de velocidad frente a 5,243 m y 0,657 m/s de la política de Pollen, es decir, aproximadamente la mitad de velocidad y de distancia recorrida en la misma toma.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa menos de 0,1 GB, lo que indica que la política es muy compacta, pero no se publican cifras de memoria.
- GPU recomendadas: no disponibles; no se documenta ningún requisito de GPU para ejecutar la política.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, aunque por el tamaño del artefacto es plausible su ejecución en CPU o en el cómputo embarcado del propio robot; se trata de una inferencia razonada, no de un dato publicado.
- Opciones de despliegue: ONNX Runtime para cargar `policy.onnx` (normalizador incluido); la CLI oficial del robot, `robotctl`, para registrar y lanzar la política en el MicroDuck. El checkpoint `base/model.pt` con `agent.yaml` y `env.yaml` está pensado para el flujo de entrenamiento/ajuste fino con `rsl_rl`.
- Latencia y throughput: no disponibles. Los únicos valores cinemáticos publicados son de la marcha, no de la inferencia: 0,36 m/s de velocidad y 0,0 pasos/s de cadencia en la toma registrada (el patinaje no cuenta pasos).
- Entorno de simulación: la comprobación de fidelidad se realiza sobre el MJCF upstream del robot, con la configuración de la tarea `Mjlab-Velocity-Flat-MicroDuck-Rollers`.

## Comparativa con modelos similares

| Modelo | Tipo | Origen | Desplazamiento medido (travel_m) | Velocidad (m/s) | Caida | Licencia |
|---|---|---|---|---|---|---|
| tfrere/microduck-move-base-roller | Politica RL reentrenada, ONNX + checkpoint | Microduck Academy (a partir de la receta de Pollen) | 2,875 | 0,36 | No | Apache-2.0 |
| pollen-robotics/microduck-policies (`roller.onnx`) | Politica RL original de Pollen | Pollen Robotics | 5,243 | 0,657 | No | Apache-2.0 (segun el repositorio upstream citado) |
| Otras politicas de la familia rollers | Movimientos relacionados de Microduck Academy | tfrere | No disponible | No disponible | No disponible | Apache-2.0 |

No se dispone de información sobre otros modelos comparables fuera del ecosistema MicroDuck; la comparación significativa es la que se establece con la política original de Pollen, ya que comparten tarea, escena y comando en la toma de referencia.

## Limitaciones y advertencias

- Rendimiento inferior al de la política original en la toma de referencia: recorre 2,875 m frente a 5,243 m y alcanza 0,36 m/s frente a 0,657 m/s con el mismo comando. No es, por tanto, un sustituto directo de `roller.onnx` si se prioriza velocidad o distancia.
- Ámbito de aplicación muy restringido: solo el movimiento de patinaje del MicroDuck sobre suelo plano; no se documenta comportamiento en terrenos irregulares, pendientes o con obstáculos.
- Especificidad de hardware: la política está atada a la morfología y al modelo del MicroDuck y a la tarea `Mjlab-Velocity-Flat-MicroDuck-Rollers`; no es transferible sin reentrenamiento a otros robots o configuraciones.
- Ausencia de datos técnicos de la red: no se publican arquitectura, número de parámetros ni requisitos de cómputo, lo que dificulta planificar su integración en producción.
- Riesgo de sim-to-real no documentado: la única validación publicada es en simulación (MJCF upstream); no se aportan resultados en hardware real dentro de la información disponible.
- Idiomas y sesgos: no aplica, al no ser un modelo de lenguaje; no hay evaluación de sesgos ni de contenido.
- Licencia: Apache-2.0, lo que permite uso comercial y modificación, siempre que se conserven los avisos de copyright y atribución. La tarea, el diseño de recompensa, el modelo del robot y la receta de entrenamiento son obra de Pollen Robotics y se redistribuyen bajo la misma licencia.
- Advertencia sobre datos del repositorio: el repositorio muestra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación por parte de terceros.
- Ausencia de benchmarks estandarizados: no hay métricas comparables a las de otros dominios (no es un modelo de lenguaje), y el único material cuantitativo es la comprobación de fidelidad incluida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-base-roller
- Repositorio de entrenamiento upstream: https://github.com/pollen-robotics/microduck_rl
- Políticas originales de Pollen Robotics: https://huggingface.co/pollen-robotics/microduck-policies
- Organización Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
- Microduck Academy (Space): https://huggingface.co/spaces/tfrere/microduck
- No se han encontrado papers, blogs ni demos adicionales en los resultados de búsqueda web disponibles (los resultados obtenidos no guardan relación con el modelo).
