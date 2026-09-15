# tfrere/microduck-move-base-ground-pick

## Resumen

`tfrere/microduck-move-base-ground-pick` es una politica de control por aprendizaje por refuerzo (RL) para el robot Microduck, publicada por Microduck Academy (usuario `tfrere`). No es un modelo de lenguaje: se trata de un movimiento base ("ground pick") en el que el pico del robot baja hasta el suelo y vuelve a subir, gobernado por un comando de fase de 2,8 s de duracion. El autor lo describe como un movimiento oficial de Microduck, reentrenado desde cero a partir de la receta upstream de Pollen Robotics.

El entrenamiento reutiliza tal cual la tarea `Mjlab-GroundPick-Flat-MicroDuck` del repositorio `pollen-robotics/microduck_rl` (commit `2b25a48`), con 5999 iteraciones y 4096 entornos en paralelo, sin modificar la funcion de recompensa. Ademas del peso ONNX listo para ejecutar (`policy.onnx`, con el normalizador embebido), el repositorio incluye el checkpoint `base/model.pt` de rsl_rl y sus ficheros de configuracion, lo que permite hacer "remix", es decir, reentrenar o ajustar la politica desde ese punto de partida.

Su relevancia es practica dentro del ecosistema Microduck: sirve como movimiento base reproducible, verificable frente a la politica que distribuye Pollen (`alpha_ground_pick.onnx`) mediante una comprobacion de fidelidad publicada, y como material de partida para quien quiera construir politicas derivadas. El repositorio es pequeno (0,0 GB reportados), con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control entrenada por aprendizaje por refuerzo (checkpoint rsl_rl) y exportada a ONNX; topologia de la red (capas, activaciones) no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la politica consume observaciones por paso de control y un comando de fase (periodo 4,0 s; la toma dura 2,8 s) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX en precision nativa y checkpoint PyTorch sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`, normalizador embebido) y PyTorch (`base/model.pt`) |
| Categoria de la politica | `family:groundpick`, `kind:episodic`, `tier:1`, `microduck-academy-policy` |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de una politica de RL para control de robot, no de un transformer ni de un modelo generativo. El entrenamiento se apoya en rsl_rl (el checkpoint distribuido es `base/model.pt`, acompanado de `base/agent.yaml` y `base/env.yaml`), siguiendo la receta de Pollen Robotics definida en `pollen-robotics/microduck_rl` para la tarea `Mjlab-GroundPick-Flat-MicroDuck`, en el commit `2b25a48`. El autor indica explicitamente que el reentrenamiento se hizo desde cero con la receta upstream "tal cual": 5999 iteraciones, 4096 entornos y ninguna edicion de la recompensa.

La innovacion relevante no esta en la arquitectura de red (no documentada) sino en el modo de uso y en la reproducibilidad. El movimiento se controla mediante `command.encoding: phase`, con un periodo de 4,0 s que se detiene en fase 0,7; el runtime es quien conduce la fase, y `robotctl policy add` rechaza comandos de fase, por lo que hay que cargar la politica con `policy load` en el slot `ground_pick`. El autor publica ademas los datos de verificación de fidelidad y la trayectoria de muestra (`rollouts/0.traj`, formato trajectory.v1) con los comandos empleados, lo que permite reproducir la comparacion contra la politica original de Pollen sobre el MJCF del robot upstream.

## Capacidades

- Ejecucion del movimiento "ground pick": el pico baja hasta el suelo y vuelve a subir, con una duracion de 2,8 s.
- Control por comando de fase: la politica acepta `command.encoding: phase` con periodo de 4,0 s y parada en fase 0,7.
- Inferencia en formato ONNX con el normalizador de observaciones embebido, lista para ejecutar sin preprocesado adicional.
- Reentrenamiento ("remix"): el repositorio incluye el checkpoint de rsl_rl y las configuraciones de agente y entorno para ajustar la politica.
- Verificacion de fidelidad: se publican metricas comparativas frente a la politica de referencia de Pollen sobre la misma escena y el mismo comando.
- Reproduccion en simulacion sobre el MJCF upstream del robot (script `spikes/base_moves/fidelity.py`).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni capacidades de agente. No es multilingue: no procesa lenguaje.

## Casos de uso

- Punto de partida para politicas derivadas: usar `base/model.pt` como inicializacion y ajustar la recompensa o el entorno para obtener variantes del movimiento, aprovechando que el repositorio incluye `agent.yaml` y `env.yaml`.
- Validacion de fidelidad en simulacion: reproducir la tabla de fidelidad con el mismo comando de fase y la misma escena MJCF para comprobar que una politica propia iguala o mejora los valores de referencia antes de invertir tiempo en pruebas con hardware.
- Evaluacion comparativa de recetas de RL: al mantener "tal cual" la receta upstream, sirve como linea base controlada frente a variantes con edicion de recompensa o cambios de hiperparametros, aislando el efecto de cada modificacion.
- Docencia y formacion en robotica: un movimiento episodico de corta duracion (2,8 s) y con comando de fase bien definido es un ejemplo acotado para explicar el ciclo observacion-accion, el papel del normalizador y la exportacion a ONNX.
- Integracion en el runtime del robot: cargar la politica en el slot `ground_pick` con `robotctl policy load ground_pick tfrere/microduck-move-base-ground-pick` para disponer del movimiento dentro de una secuencia controlada por el runtime.
- Generacion de material de demostracion: los ficheros `video.mp4` y `poster.jpg`, junto con la trayectoria `rollouts/0.traj`, permiten producir clips y registros reproducibles del movimiento sin acceso al robot fisico.
- Pruebas de regresion de tooling: usar la politica como casete de prueba para verificar que un pipeline de carga de ONNX, normalizacion y ejecucion por fase sigue funcionando tras cambios en el runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor si publica una comprobacion de fidelidad frente a la politica `alpha_ground_pick.onnx` de Pollen, con la misma escena y el mismo comando (toma `phase`), registrada con `space/payload/render/rollout.py` sobre el MJCF upstream:

| Metrica | Esta politica | `alpha_ground_pick.onnx` de Pollen |
|---|---|---|
| final_upright | True | True |
| max_tilt | 0,502 | 0,638 |
| base_z_mean | 0,0914 | 0,0979 |
| base_z_min | 0,0805 | 0,0839 |
| mouth_z_min | 0,0212 | 0,0204 |
| t_mouth_min_s | 0,26 | 1,08 |
| mouth_z_start | 0,188 | 0,1883 |
| mouth_z_end | 0,2162 | 0,2166 |
| base_z_end | 0,1166 | 0,1164 |

No se proporcionan datos de latencia, frecuencia de control ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,0 GB segun HuggingFace, lo que sugiere un checkpoint de pocos megabytes, pero no se publica el numero de parametros ni el consumo real.
- GPU recomendadas: no disponibles. Al ser una politica de control de baja dimension exportada a ONNX, es plausible su ejecucion en CPU, pero esto no se confirma en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos que permitan afirmar que quepa o no en una RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: el runtime indicado es `robotctl` (comandos `policy load` y `policy add`); el artefacto desplegable es `policy.onnx`, ejecutable en cualquier motor compatible con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Comando | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tfrere/microduck-move-base-ground-pick` | Politica RL en ONNX + checkpoint rsl_rl para remix | no disponible | Fase, periodo 4,0 s, parada en 0,7 | Apache-2.0 | HuggingFace, 0 descargas |
| `alpha_ground_pick.onnx` (Pollen Robotics) | Politica RL en ONNX | no disponible | Fase (segun la receta upstream) | Apache-2.0 (repositorio de recetas) | HuggingFace, `pollen-robotics/microduck-policies` |
| Otros movimientos de Microduck Academy (`family:*`, `tier:*`) | Politicas RL en ONNX | no disponible | Segun movimiento | Apache-2.0 | HuggingFace (no se dispone de datos concretos de otros repositorios) |

La diferencia principal frente a la politica de Pollen es que este repositorio anade el checkpoint `base/model.pt` y las configuraciones necesarias para reentrenar, ademas de los datos de fidelidad y la trayectoria de muestra. No se dispone de informacion sobre otros modelos comparables de terceros.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo multimodal: no genera texto, no razona en lenguaje natural, no procesa imagenes ni audio y no soporta tool calling.
- Sesgos conocidos: no se documentan sesgos en la informacion disponible. Al ser una politica entrenada en simulacion sobre una tarea concreta, su comportamiento fuera de esa distribucion (terrenos, cargas, comandos distintos) no esta caracterizado.
- Riesgo de alucinacion: no aplica en el sentido habitual; el riesgo equivalente es la divergencia de comportamiento respecto a la politica de referencia o a la realidad fisica. El propio autor publica una comparacion de fidelidad que muestra diferencias medibles (por ejemplo, `max_tilt` 0,502 frente a 0,638 y `t_mouth_min_s` 0,26 frente a 1,08), por lo que la equivalencia con la politica de Pollen no es exacta.
- Restricciones de uso del comando: la politica solo funciona con comando de fase. `robotctl policy add` rechaza comandos de fase, de modo que debe cargarse con `policy load` en el slot `ground_pick`; un uso incorrecto del comando invalida el movimiento.
- Limitaciones de contexto e idioma: no aplica contexto de texto; el movimiento es episodico y de duracion fija (2,8 s sobre un periodo de 4,0 s).
- Licencia: Apache-2.0, que permite uso comercial, pero la tarea, el diseno de recompensa, el modelo del robot y la receta de entrenamiento son obra de Pollen Robotics; conviene conservar la atribucion al redistribuir o derivar.
- Advertencias para produccion: no hay datos publicados de latencia, frecuencia de control, rendimiento en hardware real ni resultados de transferencia sim-a-real (sim2real). El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion externa conocida. La fecha de creacion registrada (2026-09-14) es posterior a la de esta ficha y debe tratarse con cautela al citarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-base-ground-pick
- Politica de referencia de Pollen Robotics: https://huggingface.co/pollen-robotics/microduck-policies/blob/main/alpha_ground_pick.onnx
- Receta de entrenamiento upstream (tarea, recompensa, modelo del robot): https://github.com/pollen-robotics/microduck_rl
- Organizacion de Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
- Space de Microduck Academy: https://huggingface.co/spaces/tfrere/microduck
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados corresponden a perfiles de redes sociales sin relacion con el proyecto.
