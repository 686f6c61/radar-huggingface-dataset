# tfrere/microduck-move-base-walk

## Resumen

microduck-move-base-walk es una politica de locomocion (no un modelo de lenguaje) publicada por el usuario tfrere dentro de Microduck Academy. Consiste en un reentrenamiento desde cero del movimiento "walk" oficial de Pollen Robotics para el robot Microduck, ejecutado con la receta upstream sin modificaciones: tarea `Mjlab-Velocity-Flat-MicroDuck` del repositorio `pollen-robotics/microduck_rl` en el commit `2b25a48`, 2999 iteraciones y 4096 entornos paralelos, sin editar la funcion de recompensa.

El resultado se distribuye como una politica ONNX con el normalizador embebido (`policy.onnx`), acompanada del checkpoint `base/model.pt` en formato `rsl_rl` mas sus ficheros de configuracion `agent.yaml` y `env.yaml`. Ese checkpoint es el motivo de existir del repositorio: la Academy lo necesita para poder hacer "remix" (fine-tuning) del movimiento, algo que no es posible con la politica `alpha_walking.onnx` que Pollen publica ya exportada.

Su relevancia es doble. Por un lado, permite reproducir y verificar la receta de marcha de Pollen con un arnes de fidelidad incluido en la propia model card, comparando metrica a metrica contra `alpha_walking.onnx` en la misma escena y con el mismo comando. Por otro lado, sirve como punto de partida para reentrenar o especializar la marcha del robot manteniendo la licencia Apache-2.0 del trabajo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo (checkpoint en formato `rsl_rl`) exportada a ONNX; la topologia de red concreta no esta documentada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); la ventana de observaciones no esta documentada |
| Tipos de cuantizacion | no disponible (se distribuye un unico export ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (el modelo no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) + checkpoint PyTorch `rsl_rl` (`base/model.pt`) + YAML (`base/agent.yaml`, `base/env.yaml`) |
| Robot objetivo | Microduck (Pollen Robotics) |
| Tarea upstream | `Mjlab-Velocity-Flat-MicroDuck` (pollen-robotics/microduck_rl, commit `2b25a48`) |
| Tipo de tarea | `Velocity` (comando de velocidad); terreno plano |
| Familia / clase | `family:velocity`, `kind:perpetual`, `tier:1` |
| Entrenamiento | 2999 iteraciones, 4096 entornos, receta original sin editar recompensa |
| Ficheros del repo | `policy.onnx`, `base/model.pt`, `base/agent.yaml`, `base/env.yaml`, `rollouts/0.traj`, `manifest.json`, `fidelity.json`, `train.json`, `video.mp4`, `poster.jpg` |
| Tamano del repo | 0.0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-09-14 |

## Arquitectura y entrenamiento

Se trata de una politica de control entrenada mediante aprendizaje por refuerzo sobre la tarea `Mjlab-Velocity-Flat-MicroDuck`, definida en el repositorio `pollen-robotics/microduck_rl`. El entrenamiento se ejecuto con la receta upstream "tal cual" (2999 iteraciones, 4096 entornos, sin edicion de la funcion de recompensa), lo que la convierte en una reproduccion fiel del procedimiento que genera `alpha_walking.onnx`. El autor indica que la marcha de la Academy (`spikes/base_walk`, tarea Velocity, 3000 iteraciones) es exactamente la receta subyacente a esa politica. La libreria de RL implicada es `rsl_rl`, segun el formato del checkpoint distribuido (`base/model.pt` + `base/agent.yaml`); la informacion disponible no detalla el algoritmo de optimizacion ni la topologia de la red.

La innovacion principal no esta en el algoritmo, sino en el empaquetado y la verificabilidad. El export ONNX lleva el normalizador de observaciones integrado, de modo que el fichero se puede ejecutar directamente sin pipeline de preprocesado externo. Ademas, el repositorio incluye el checkpoint `rsl_rl` con sus configs (`env.yaml`, `agent.yaml`), lo que habilita el fine-tuning desde el punto exacto en que termino el entrenamiento. La model card incorpora un "fidelity check" reproducido con `space/payload/render/rollout.py` sobre el MJCF upstream del robot (`spikes/base_moves/fidelity.py`), comparando esta politica contra `alpha_walking.onnx` en la misma escena y con el mismo comando (`vx0.35`). El autor aclara que el `velstand.onnx` por defecto de Pollen incorpora una capa adicional de proteccion y recuperacion ante caidas, inicializada a partir de un checkpoint privado que no puede reentrenarse fielmente; esta politica cubre la marcha, no esa capa.

## Capacidades

- Locomocion del robot Microduck: genera la marcha "walk" oficial a partir de comandos de velocidad.
- Seguimiento de comandos de velocidad (`Velocity` task): responde a comandos tipo `vx` (en la verificacion, `vx0.35`).
- Estabilidad estatica: se mantiene de pie cuando el comando es cero.
- Ejecucion en ONNX con normalizador embebido: inferencia directa sin preprocesado adicional.
- Reentrenamiento ("remix"): al incluir `base/model.pt` y las configs, admite fine-tuning sobre la receta original.
- Verificacion de fidelidad: incluye `fidelity.json` y un rollout de demostracion (`rollouts/0.traj`) con los comandos aplicados.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa texto.
- No dispone de capacidades de vision, audio, thinking mode ni generacion de texto.

## Casos de uso

- Punto de partida para "remix" en Microduck Academy: el checkpoint `base/model.pt` permite hacer fine-tuning desde el estado entrenado en lugar de partir de cero, que es precisamente el proposito declarado del repositorio.
- Despliegue de la marcha base en el robot fisico: con `sudo robotctl policy add walk tfrere/microduck-move-base-walk` y `robotctl robot do walk` el robot adopta la marcha por comandos de velocidad.
- Validacion de fidelidad de recetas de RL: el arnes de comparacion contra `alpha_walking.onnx` permite comprobar que una reinstalacion del pipeline reproduce el comportamiento de referencia.
- Baseline para experimentos de recompensa: al no editar la recompensa upstream, sirve como control contra el que medir variantes modificadas de la funcion de recompensa.
- Docencia en robótica y RL: la pareja politica + configs + rollout hace el ciclo completo (entrenamiento, export, evaluacion) inspeccionable por estudiantes o investigadores.
- Investigacion en transferencia simulacion-a-realidad: la politica esta entrenada en simulacion sobre el MJCF del robot, por lo que es util para estudiar la brecha sim-to-real de la tarea Velocity en terreno plano.
- Regression testing en pipelines de robotica: el `fidelity.json` y las metricas asociadas (tilt maximo, altura de base, distancia recorrida, cadencia) permiten fijar umbrales de aceptacion automatizados.
- Reproducibilidad de resultados publicados: al publicar el commit exacto (`2b25a48`), el numero de iteraciones y de entornos, cualquier tercero puede replicar el entrenamiento y comparar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo de este tipo. El unico dato cuantitativo publicado es la verificacion de fidelidad frente a `alpha_walking.onnx` de Pollen, en la misma escena y con el mismo comando (`vx0.35`):

| Metrica | Esta politica | `alpha_walking.onnx` (Pollen) |
|---|---|---|
| `final_upright` | True | True |
| `max_tilt` | 0.254 | 0.259 |
| `base_z_mean` | 0.1227 | 0.1183 |
| `base_z_min` | 0.1127 | 0.1126 |
| `travel_m` | 1.94 | 1.207 |
| `travel_x_m` | 1.132 | 1.159 |
| `speed_m_s` | 0.243 | 0.151 |
| `cadence_steps_s` | 5.14 | 5.01 |
| `fell` | False | False |

Metricas registradas con `space/payload/render/rollout.py` sobre el MJCF upstream del robot (`spikes/base_moves/fidelity.py`). No se trata de un benchmark comparativo contra modelos de terceros, sino de una comprobacion de equivalencia funcional entre una reimplementacion y la politica original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. La politica se distribuye en ONNX y esta pensada para ejecutarse a bordo del robot, no en un servidor de inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `robotctl` (`sudo robotctl policy add walk tfrere/microduck-move-base-walk` seguido de `robotctl robot do walk`) para el robot; el fichero `policy.onnx` es ejecutable con cualquier runtime ONNX con el normalizador ya integrado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput de inferencia: no disponibles. Las unicas magnitudes publicadas son cinematicas de la marcha, no de computo: velocidad de 0.243 m/s y cadencia de 5.14 pasos/s con comando `vx0.35`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Terreno | Capa de recuperacion ante caidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `tfrere/microduck-move-base-walk` | Politica RL, marcha por velocidad | no disponible | ONNX + checkpoint `rsl_rl` | Plano | No | Apache-2.0 | HuggingFace (0 descargas) |
| `alpha_walking.onnx` (Pollen Robotics) | Politica RL, marcha por velocidad | no disponible | ONNX | Plano | No | no disponible | Repo `pollen-robotics/microduck-policies` |
| `velstand.onnx` (Pollen Robotics) | Politica RL por defecto, con proteccion y recuperacion | no disponible | ONNX | Plano | Si (inicializada desde checkpoint privado) | no disponible | Repo `pollen-robotics/microduck-policies` |

La diferencia funcional relevante entre las tres es la capa de caida y recuperacion: solo `velstand.onnx` la incorpora, y segun el autor no puede reentrenarse fielmente porque parte de un checkpoint privado. La ventaja de `tfrere/microduck-move-base-walk` frente a las otras dos es que es la unica que publica el checkpoint entrenable ademas del export ONNX. No se dispone de datos suficientes para comparar con politicas de locomocion de otros robots.

## Limitaciones y advertencias

- Ambito restringido: cubre unicamente la tarea `Velocity` en terreno plano; no se ha entrenado para terreno irregular, escaleras u obstaculos.
- Ausencia de capa de recuperacion: no incorpora la proteccion y recuperacion ante caidas de `velstand.onnx`, por lo que una caida no se corrige de forma autonoma.
- Sin datos de sim-to-real: la verificacion de fidelidad se realizo en simulacion sobre el MJCF upstream; no se publican resultados en el robot fisico.
- Sesgos conocidos: no disponibles. Al no procesar lenguaje ni datos humanos, no aplican los sesgos tipicos de los modelos generativos, pero si puede heredar sesgos de la distribucion de entrenamiento del simulador (por ejemplo, sobreajuste a terreno plano).
- Riesgo de alucinacion: no aplica en el sentido habitual; el riesgo equivalente es la divergencia entre el comportamiento simulado y el real, y una generalizacion limitada fuera del rango de comandos entrenado.
- Limitaciones de contexto e idioma: no aplica; el modelo no procesa contexto textual ni idiomas.
- Licencia: Apache-2.0, permisiva para uso comercial. Es obligatorio conservar los avisos de copyright y atribucion a Pollen Robotics por la tarea, el diseno de recompensa, el modelo del robot y la receta de entrenamiento, y a Microduck Academy por el reentrenamiento.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de terceros fuera del arnes de fidelidad del propio autor.
- Dependencia de la herramienta `robotctl` para el despliegue en el robot, cuyo soporte y mantenimiento no se detallan en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-base-walk
- Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
- Espacio de Microduck Academy: https://huggingface.co/spaces/tfrere/microduck
- Repositorio de entrenamiento upstream (Pollen Robotics, Apache-2.0): https://github.com/pollen-robotics/microduck_rl
- Politica de referencia `alpha_walking.onnx`: https://huggingface.co/pollen-robotics/microduck-policies/blob/main/alpha_walking.onnx
