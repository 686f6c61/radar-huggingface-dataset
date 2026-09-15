# tfrere/microduck-academy-base-stand

## Resumen

`tfrere/microduck-academy-base-stand` es una politica de aprendizaje por refuerzo (reinforcement learning) para el robot MicroDuck de Pollen Robotics, publicada por Microduck Academy. No es un modelo de lenguaje ni un modelo generativo multimodal: es un controlador entrenado para ejecutar el movimiento de levantarse (stand up), desde la postura sentada hasta la posicion erguida, sobre la tarea `Mjlab-StandUp-Flat-MicroDuck` del repositorio upstream `pollen-robotics/microduck_rl`. Se distribuye en formato ONNX para su ejecucion y como checkpoint `rsl_rl` (`base/model.pt`) para reentrenamiento.

La relevancia del repositorio no esta en el movimiento en si, sino en su proposito declarado: servir de base para las familias de movimientos estacionarios de la Academia. El autor lo describe explicitamente como "una utilidad, no un movimiento de galeria": no lleva etiqueta de galeria y no aparece en Discover. Se entrena desde cero con la receta upstream sin modificar la recompensa (9999 iteraciones, 4096 entornos, commit `2b25a48`), con el objetivo de que otros usuarios puedan hacer fine-tuning partiendo de el.

La ficha de fidelidad publicada por el autor documenta una coincidencia exacta con la politica oficial de Pollen (`alpha_stand.onnx`) cuando el robot parte de la postura sentada, pero una recuperacion solo parcial desde estados volcados o posteriores a un giro. Esa asimetria es el dato tecnico mas relevante para decidir si se usa como base de entrenamiento o como politica desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de reinforcement learning exportada a ONNX (stack `rsl_rl`); no disponible el detalle de capas ni el tamano de la red |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control, no un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica; se distribuye un grafo ONNX con el normalizador integrado ("normalizer baked in") |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`), checkpoint PyTorch `rsl_rl` (`base/model.pt`) y configuraciones YAML (`base/agent.yaml`, `base/env.yaml`) |
| Tarea upstream | `Mjlab-StandUp-Flat-MicroDuck` (`pollen-robotics/microduck_rl`, commit `2b25a48`) |
| Entorno de simulacion | MJCF del robot (upstream), evaluado con `space/payload/render/rollout.py` |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La politica se entrena con el pipeline de `rsl_rl` sobre la tarea `Mjlab-StandUp-Flat-MicroDuck` del repositorio de Pollen Robotics, en su commit `2b25a48`. El autor indica que se reentreno desde cero con la receta upstream "tal cual": 9999 iteraciones, 4096 entornos paralelos y sin ninguna edicion de la funcion de recompensa. No se especifica en la informacion disponible la topologia de la red (numero de capas, unidades por capa, tipo de observaciones ni acciones), solo que el resultado se exporta a ONNX y que el checkpoint subyacente es compatible con `rsl_rl`.

Los artefactos publicados reflejan ese doble uso. Por un lado, `policy.onnx` es la politica lista para ejecutar, con el normalizador de observaciones incluido en el grafo. Por otro, `base/model.pt`, `base/agent.yaml` y `base/env.yaml` constituyen el checkpoint y la configuracion necesarios para continuar el entrenamiento (el autor lo llama "remix"). Se incluyen tambien `rollouts/0.traj` (una toma de muestra en formato `trajectory.v1` con los comandos), `manifest.json` (esquema 2 con bloque `academy`: origen, tarea y politica de origen, datos de entrenamiento y cifras de fidelidad), `fidelity.json` y `train.json`. La innovacion tecnica destacable no es algorimica, sino de reproducibilidad: la publicacion del checkpoint con la receta exacta permite que terceros hagan fine-tuning partiendo de un punto conocido.

## Capacidades

- Locomocion de levantamiento: ejecuta el movimiento de pasar de la postura sentada a la postura erguida y mantenerla, en terreno plano (la tarea es `Flat`).
- Estabilizacion estatica: mantiene la posicion de pie como comportamiento de reposo (el autor lo describe como un "idle de cero comandos").
- Recuperacion parcial de caidas: desde un estado volcado o posterior a un giro completa el levantamiento solo de forma parcial (ver limitaciones).
- Exportacion ONNX con normalizador integrado: el fichero `policy.onnx` es autosuficiente para inferencia.
- Reutilizacion como checkpoint base: `base/model.pt` y los YAML asociados permiten fine-tuning con `rsl_rl`.
- Integracion con `robotctl`: se registra y ejecuta con dos comandos (`robotctl policy add stand-up ...` y `robotctl robot do stand-up`).
- No dispone de tool calling, agentes, capacidades multilingues, vision, audio ni modo de razonamiento: no aplica a este tipo de modelo.

## Casos de uso

- Punto de partida para familias estacionarias: es el proposito explicito del repositorio. Un desarrollador puede cargar `base/model.pt` y hacer fine-tuning hacia variantes de mantenimiento de postura, reutilizando la receta y los hiperparametros documentados en `base/agent.yaml` y `base/env.yaml`.
- Reproduccion de resultados de Pollen Robotics: al publicarse el commit exacto (`2b25a48`), el numero de iteraciones y el numero de entornos, sirve como referencia reproducible para validar el pipeline `microduck_rl` en una maquina propia.
- Investigacion en sim2real: el rollout de fidelidad se genera sobre el MJCF upstream, por lo que el repositorio permite comparar el comportamiento en simulacion antes de transferir la politica al robot fisico.
- Arranque de secuencias de movimiento: encadenado tras movimientos de accionamiento o como paso previo a otras politicas de la Academia, dado que deja al robot en la postura erguida con comandos nulos.
- Validacion de exportacion ONNX: util para verificar que el pipeline de exportacion y el normalizador integrado funcionan de extremo a extremo en un robot o en un runtime ONNX antes de invertir en entrenamientos largos.
- Docencia en la Microduck Academy: el space `tfrere/microduck` y este checkpoint permiten ilustrar el ciclo completo entrenar, exportar, evaluar fidelidad y desplegar sobre un robot de bajo coste.
- Baseline para comparativas de fidelidad: sus cifras (`max_tilt`, `base_z_mean`, `t_to_stand_s`) permiten medir si un movimiento derivado mejora o degrada la fidelidad respecto a la politica oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible; no aplican a este tipo de modelo. El autor si publica una comprobacion de fidelidad frente a la politica oficial de Pollen, en la misma escena y con el mismo comando, con la toma `from_sit`:

| Metrica | Esta politica | `alpha_stand.onnx` (Pollen) |
|---|---|---|
| final_upright | True | True |
| max_tilt | 0.139 | 0.092 |
| base_z_mean | 0.115 | 0.1148 |
| base_z_min | 0.0668 | 0.067 |
| t_to_stand_s | 0.2 | 0.2 |
| z_end | 0.1165 | 0.1163 |
| z_start | 0.0696 | 0.0697 |
| tilt_end | 0.005 | 0.008 |

Estas cifras se registraron con `space/payload/render/rollout.py` sobre el MJCF upstream (`spikes/base_moves/fidelity.py`). En la toma `from_sit` el resultado es equivalente en tiempo de levantamiento, altura e inclinacion final. Fuera de esa toma, la fidelidad es parcial: desde un estado volcado o posterior a un giro, el robot se asienta inclinado con la cabeza en el suelo (base de 6 cm, tilt de 0.9), mientras que la politica de Pollen se levanta en 0.4 s.

## Requisitos de hardware

- Inferencia: no se especifican requisitos de VRAM ni de GPU en la informacion disponible. Al ser una politica exportada a ONNX con normalizador integrado, el despliegue previsto es en el propio robot (via `robotctl`) o en un runtime ONNX, no en un acelerador de gran formato.
- Entrenamiento: la receta usa 4096 entornos paralelos durante 9999 iteraciones, lo que implica simulacion masiva en paralelo; no se detalla el hardware empleado.
- GPU consumer: no disponible la confirmacion de si cabe o no en GPU de consumo, dado que no se publican tamano de red ni requisitos de memoria.
- Opciones de despliegue: registro en robot via `robotctl policy add` y ejecucion con `robotctl robot do stand-up`; inferencia ONNX en runtime generico. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este modelo.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es el tiempo hasta la postura erguida desde sentado, 0.2 s, identico al de la politica de Pollen en esa toma.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Licencia | Formato | Fidelidad desde sentado | Fidelidad desde volcado |
|---|---|---|---|---|---|---|
| `tfrere/microduck-academy-base-stand` (esta ficha) | Politica RL reentrenada | Stand up (`Mjlab-StandUp-Flat-MicroDuck`) | Apache-2.0 | ONNX + checkpoint `rsl_rl` | Equivalente a Pollen (0.2 s, tilt final 0.005) | Parcial: se asienta inclinado (base 6 cm, tilt 0.9) |
| `pollen-robotics/microduck-policies` (`alpha_stand.onnx`) | Politica RL oficial | Stand up | Apache-2.0 | ONNX | Referencia (0.2 s, tilt final 0.008) | Completa en 0.4 s |
| Stand de la cadena del roulade | Politica RL oficial reutilizada | Stand up dentro de una secuencia | Apache-2.0 | ONNX | No disponible | No disponible |

No se dispone de otras alternativas comparables publicadas en la informacion proporcionada.

## Limitaciones y advertencias

- Fidelidad parcial fuera de la toma `from_sit`: desde un estado volcado o posterior a un giro el robot no completa el levantamiento y queda con la cabeza en el suelo (altura de base 6 cm, tilt 0.9), frente a los 0.4 s de la politica oficial.
- No es un movimiento de galeria ni un movimiento desplegable por defecto: el propio autor lo describe como base para fine-tuning, no como politica final. La cadena del roulade usa el stand de Pollen, no este.
- Dominio limitado a terreno plano: la tarea upstream es `Flat`, por lo que no hay garantia de comportamiento en pendientes, escaleras u obstaculos.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento del registro, por lo que no existe evidencia externa de funcionamiento en robots distintos del entorno de evaluacion del autor.
- Brecha sim2real no documentada: todas las cifras publicadas provienen de simulacion sobre el MJCF upstream; no se aportan datos de despliegue en hardware fisico.
- Recuperacion tras caida no fiable: no conviene usarla como politica de seguridad o de auto-recuperacion en produccion.
- Sin datos de sesgo, alucinacion o idioma: no aplica, dado que no es un modelo de lenguaje; cualquier ficha que los exija carece de sentido para este artefacto.
- Licencia Apache-2.0: permite uso comercial y modificacion, con la condicion de mantener el aviso de licencia y atribuir a Pollen Robotics la tarea, el diseno de recompensa, el modelo del robot y la receta de entrenamiento.
- Dependencia de la version upstream: los resultados estan ligados al commit `2b25a48` de `microduck_rl`; cambios posteriores en la tarea o en el MJCF pueden invalidar la reproducibilidad.
- Fecha de publicacion inusual: el registro indica creacion el 2026-09-14, dato que conviene verificar en la pagina del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-academy-base-stand
- Space de la Microduck Academy: https://huggingface.co/spaces/tfrere/microduck
- Politicas oficiales de Pollen Robotics: https://huggingface.co/pollen-robotics/microduck-policies
- Politica oficial `alpha_stand.onnx`: https://huggingface.co/pollen-robotics/microduck-policies/blob/main/alpha_stand.onnx
- Repositorio de entrenamiento upstream: https://github.com/pollen-robotics/microduck_rl
- Organizacion de Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
