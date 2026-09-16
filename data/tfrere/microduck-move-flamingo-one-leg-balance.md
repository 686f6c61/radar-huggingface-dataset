# tfrere/microduck-move-flamingo-one-leg-balance

## Resumen

`tfrere/microduck-move-flamingo-one-leg-balance` no es un modelo de lenguaje: es una politica de control motriz (un "move") entrenada dentro de Microduck Academy, el entorno de entrenamiento de tfrere para el robot cuadrupedo Microduck. La politica implementa una habilidad concreta: mantenerse de pie sobre una sola pata con la otra claramente elevada del suelo, imitando la postura de un flamenco. Se distribuye como artefacto de inferencia (`policy.onnx`) y como checkpoint reentrenable (`model.pt`), con el objetivo de ejecutarse directamente sobre el robot mediante la CLI `robotctl`.

El modelo pertenece a la familia `velocity` (estilos de marcha), tier 2, y es de tipo `perpetual`, es decir, disenado para mantener la postura de forma indefinida en lugar de ejecutar una secuencia finita. La model card reporta un bucle de entrenamiento por rondas con dos evaluadores automaticos: un juez basado en codigo que analiza la telemetria numerica y un "eye" basado en un VLM que inspecciona los fotogramas de video. La ronda 2 obtuvo un veredicto PASS del juez con puntuacion 1.0, pero el VLM discrepo al no detectar elevacion de una sola pata, por lo que la puntuacion final publicada en Discover queda limitada al 50 %.

Es relevante ahora como ejemplo de pipeline de evaluacion mixto (metricas de simulacion mas critica visual con VLM) y por el desacuerdo documentado entre ambos evaluadores: la telemetria del checkpoint 3100 reporta `contact_fraction: [1.0, 1.0]` y `foot_lifts: [0, ...]`, lo que sugiere que ambas patas permanecen en contacto con el suelo, en linea con la discrepancia del VLM y en contra de la interpretacion del juez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (red de politica para control motriz; se distribuye como grafo ONNX, sin detalle de capas en la model card) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no procesa secuencias de texto; es una politica de control) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`, para ejecucion) y PyTorch (`model.pt`, para reentrenamiento) |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Familia / tier / tipo | `velocity` / tier 2 / `perpetual` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |
| Pipeline de HuggingFace | No disponible |
| Region declarada | us |

## Arquitectura y entrenamiento

La model card no describe la topologia de red. Los artefactos indican una politica de control entrenada por tfrere con Microduck Academy y exportada a ONNX para su despliegue en robot; el checkpoint PyTorch (`model.pt`) se ofrece explicitamente para "remix", es decir, para ajuste fino desde ese punto de partida. El modelo esta etiquetado con `family: velocity` (estilos de marcha o gaits), tier 2 y `kind: perpetual`, lo que indica una habilidad de mantenimiento continuo de postura en lugar de una trayectoria con final.

El entrenamiento se organizo en rondas con evaluacion automatizada doble. La ronda 1 fue declarada `fail` por el juez con puntuacion 0.864 y el VLM indico "pose not held". La ronda 2 fue `pass` con puntuacion 1.0 del juez, mientras que el VLM indico "disagrees: no single leg lift" sobre los fotogramas del checkpoint 3100, que es el que se distribuye. El repositorio incluye `rollouts/*.traj` (grabaciones en formato `trajectory.v1`) y `checkpoints/r<round>-<iter>.traj` con los pasos de entrenamiento de cada ronda, listados en `manifest.checkpoints`, ademas de un `manifest.json` (schema 2) con los campos `judge_score`, `vlm` y `score`, y un bloque `academy` con prompt, familia, juez y linaje. No se especifican el algoritmo de aprendizaje, el numero de pasos totales ni la composicion de los datos de entrenamiento.

## Capacidades

- Control motriz de equilibrio estatico: mantener la postura de pie sobre una pata con la otra elevada, sin desplazamiento apreciable (`travel_m: 0.002`, `speed_mps: -0.0`, `displacement_mps: 0.0` en la ronda 2).
- Ejecucion de comandos: la model card reporta que responde 2 de 2 comandos de la bateria de pruebas, con area de comando al 100 %.
- Ejecucion como politica perpetua: disenada para sostener la postura de forma continua (`kind: perpetual`).
- Despliegue directo en robot: integrable mediante `robotctl policy add` y `robotctl robot do`, sin pasos de conversion adicionales.
- Inferencia ONNX: el grafo `policy.onnx` esta listo para ejecucion.
- Reentrenamiento o ajuste fino: el checkpoint `model.pt` y las trayectorias `.traj` permiten continuar el entrenamiento.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue: no es un modelo de lenguaje.

## Casos de uso

- Despliegue de la habilidad en el robot Microduck: instalar la politica con `robotctl policy add flamingo-one-leg-balance tfrere/microduck-move-flamingo-one-leg-balance` y ejecutarla con `robotctl robot do flamingo-one-leg-balance`. Es el uso previsto por el autor y el unico documentado de extremo a extremo en la model card.
- Investigacion sobre evaluacion mixta juez/VLM: el caso es idoneo para estudiar como un juez numerico y un critico visual discrepan sobre el mismo checkpoint. Los datos de la ronda 2 (juez PASS 1.0 frente a VLM "no single leg lift") permiten analizar falsos positivos de metricas de telemetria.
- Analisis de telemetria de control: los artefactos `.traj` y `manifest.json` permiten reproducir y auditar las metricas reportadas (`contact_fraction: [1.0, 1.0]`, `foot_lifts: [0, ...]`, `max_tilt_deg: 7.4`, `knee_left_rad: -0.445`) y contrastarlas con la observacion visual.
- Base para ajuste fino dentro de la familia `velocity`: el fichero `model.pt` esta pensado para remezclar el movimiento, por ejemplo para variar la altura de la pata elevada, el angulo de pitch o la duracion del equilibrio.
- Linea base en comparativas de politicas de marcha: sirve como referencia interna de tier 2 con puntuacion 50 % para comparar futuros movimientos de la misma academia.
- Docencia y divulgacion de aprendizaje por refuerzo aplicado a robotica: los checkpoints por iteracion (hasta el 3100) y las grabaciones de rollouts permiten mostrar la evolucion del entrenamiento ronda a ronda.
- Generacion de datos para pipelines de vision-lenguaje en robotica: el par `video.mp4` y `poster.jpg`, junto con los rollouts, puede reutilizarse para entrenar o validar criticos visuales que detecten contacto de patas y elevacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Los unicos datos de evaluacion son los del juez de la academia y el veredicto del VLM.

| Ronda | Juez | Puntuacion del juez | Eye (VLM) | Puntuacion final |
|---|---|---|---|---|
| 1 | fail | 0.864 | Discrepa: postura no mantenida | 50 % |
| 2 | pass | 1.0 | Discrepa: no hay elevacion de una sola pata | 50 % |

| Metrica del juez (ronda 2) | Valor |
|---|---|
| height_ratio | 1.005 |
| height_m | 0.1156 |
| speed_mps | -0.0 |
| displacement_mps | 0.0 |
| pitch_deg | 1.4 |
| max_tilt_deg | 7.4 |
| yaw_rate_rps | -0.001 |
| head_yaw_ptp_rad | 0.019 |
| knee_left_rad | -0.445 |
| contact_fraction | [1.0, 1.0] |
| travel_m | 0.002 |
| heading_drift_rad | -0.004 |
| foot_lifts | [0, ... (truncado en la model card) |

Regla de puntuacion declarada: el score se limita al 75 % cuando el eye no esta seguro y al 50 % cuando el eye discrepa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio se reporta como 0.0 GB y el formato de despliegue es ONNX, lo que sugiere un modelo de pocos parametros, pero no hay cifra confirmada.
- GPU recomendadas: no disponible. No hay requisitos declarados en la model card.
- Cabe en GPU de consumo: no confirmado. Por el tamano reportado del repositorio (0.0 GB) es plausible que la politica se ejecute en CPU o en hardware embebido del robot, pero este dato no esta declarado.
- Opciones de despliegue documentadas: CLI `robotctl` (`robotctl policy add` y `robotctl robot do`). El artefacto subyacente es un grafo ONNX, por lo que seria ejecutable con ONNX Runtime, aunque el autor no lo documenta en la model card.
- Frameworks no aplicables: vLLM, llama.cpp, Ollama y TGI estan orientados a modelos de lenguaje y no se mencionan para este artefacto.
- Latencia y throughput: no disponible. Solo se reporta telemetria de la simulacion (velocidad de desplazamiento practicamente nula, coherente con una tarea de equilibrio estatico).

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se identifican otros movimientos de la familia `velocity` ni politicas comparables con parametros, contexto o rendimiento publicados. La unica referencia estructural es la propia taxonomia de Microduck Academy (familia `velocity`, tier 2, tipo `perpetual`), sin datos de otros miembros de la familia. Los resultados de la busqueda web realizada no guardan relacion con el modelo (contenido de restauracion y comercio minorista), por lo que no aportan alternativas comparables.

## Limitaciones y advertencias

- Discrepancia entre evaluadores: el juez numerico da PASS (1.0) mientras que el critico visual discrepa por no observar elevacion de una sola pata. La propia model card reconoce el desacuerdo, y la puntuacion publicada queda en el 50 %.
- Evidencia coherente con el fallo de la habilidad: `contact_fraction: [1.0, 1.0]` indica contacto pleno de ambas patas y `foot_lifts: [0, ...]` indica cero elevaciones registradas, lo que apunta a que el equilibrio a una pata no se esta ejecutando realmente en el checkpoint 3100 distribuido.
- Version concreta del checkpoint: el artefacto que se distribuye es el de la iteracion 3100, no necesariamente el mejor de la ronda.
- Cobertura de evaluacion limitada: la bateria de comandos consta de solo 2 comandos, insuficiente para caracterizar el comportamiento en produccion.
- Sin evaluacion independiente: 0 descargas y 0 likes; no hay validacion externa, ni resultados de transferencia simulacion-a-realidad (sim-to-real).
- Riesgo de alucinacion y sesgos: no aplica en el sentido de modelos de lenguaje, pero existe riesgo de sobreajuste al simulador y de que las metricas del juez no reflejen la postura real observada en camara.
- Alcance de la habilidad: politica de movimiento perpetuo de una unica tarea; no generaliza a otras tareas de locomocion sin reentrenamiento.
- Licencia: Apache 2.0, que permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia. Conviene verificar los terminos de Microduck Academy y del robot Microduck, no documentados en la model card.
- Idiomas y contexto: no aplica; el modelo no procesa texto ni lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-flamingo-one-leg-balance
- Autor: https://huggingface.co/tfrere
- Microduck Academy (Space de entrenamiento): https://huggingface.co/spaces/tfrere/microduck
- Documentacion de entrenamiento referenciada en la model card: `docs/TRAINING.md` (ruta interna del repositorio, sin URL publica proporcionada)
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre el modelo; los resultados devueltos corresponden a listados de restaurantes y de comercio minorista, sin relacion con el artefacto.
