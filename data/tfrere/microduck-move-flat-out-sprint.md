# tfrere/microduck-move-flat-out-sprint

## Resumen

`tfrere/microduck-move-flat-out-sprint` es una política de control motriz (un "move") para un robot con forma de pato, entrenada por el usuario tfrere dentro del proyecto Microduck Academy. No es un modelo de lenguaje: es un controlador que genera comandos de locomocion para que el robot camine hacia delante a la maxima velocidad posible manteniendose en pie. El autor lo describe como "a duck that sprints as fast as it possibly can, flat out but still on its feet".

La politica pertenece a la familia `velocity` (estilos de marcha o gaits), con nivel `tier:1` y tipo `perpetual`. Se distribuye en dos formatos: `policy.onnx`, listo para ejecucion en robot o en simulador mediante el runtime ONNX, y `model.pt`, pensado para reentrenamiento o ajuste fino (remix). El repositorio incluye ademas grabaciones de trayectorias (`rollouts/*.traj`), los checkpoints de cada ronda de entrenamiento y un `manifest.json` con el bloque `academy`, que documenta el prompt de entrenamiento, la familia y el linaje del modelo.

Su relevancia practica es acotada pero concreta: es un artefacto de robotica ligera, evaluado automaticamente por un juez numerico y por un modelo de vision-lenguaje (VLM) que inspecciona los fotogramas. En la evaluacion publicada obtiene una puntuacion del 100 %, con veredicto PASS del juez (score 1.0) y validacion afirmativa del VLM tanto en la ronda 1 como en la final. El modelo tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de control para robot, exportada a ONNX; no es un transformer ni un modelo de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; las trayectorias registradas tienen 8,0 s de duracion) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX y PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y PyTorch (`model.pt`); trayectorias en formato `trajectory.v1` (`.traj`) |
| Tarea | locomocion forward de maxima velocidad (familia `velocity`, gait de sprint) |
| Nivel y tipo | `tier:1`, `kind:perpetual` |
| Region declarada | us |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12T19:31:42Z |
| Fecha de actualizacion | 2026-09-12T19:33:46Z |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de la politica (numero de capas, tipo de red, espacio de observacion ni espacio de accion). Lo unico verificable es el formato de salida: una red exportada a ONNX para inferencia en robot y un checkpoint PyTorch para reentrenamiento. El `manifest.json` usa el esquema 2 e incluye los campos `judge_score`, `vlm` y `score`, ademas de un bloque `academy` con el prompt de entrenamiento, la familia, el juez y el linaje.

El entrenamiento se organizo en rondas dentro de Microduck Academy. La model card documenta dos entradas en la tabla de evaluacion: la ronda 1 y la ronda final, ambas con veredicto `pass`, score del juez 1.0 y validacion afirmativa del VLM ("The duck robot is moving forward quickly on its feet without falling." y "The duck robot sprints forward steadily, staying upright on its feet without falling."). Se conservan los pasos de entrenamiento de cada ronda como archivos `checkpoints/r<ronda>-<iter>.traj`, listados en `manifest.checkpoints`. No hay informacion sobre el numero de iteraciones totales, el simulador empleado, la composicion del dataset ni el uso de tecnicas como RLHF o DPO; en robotica de locomocion esas tecnicas no aplican de forma estandar, pero el dato concreto no se especifica.

El objetivo declarado en la model card es "train the duck to walk at its maximum speed, around 0.35 m/s, with fast driving strides while staying balanced on its feet". Conviene senalar una discrepancia: la velocidad medida en la evaluacion fue de 0,531 m/s (`speed_mps`), por encima del objetivo de 0,35 m/s citado en el prompt. La velocidad de desplazamiento neto medida es de 0,515 m/s.

## Capacidades

- Locomocion forward de alta velocidad: genera la secuencia de control para que el robot avance a maxima velocidad sin caerse, con una velocidad medida de 0,531 m/s.
- Mantenimiento de equilibrio: el juez registra `fell: false` y una inclinacion maxima (`max_tilt_deg`) de 14,8 grados durante la trayectoria evaluada.
- Control postural cuantificado: altura relativa 1,07 respecto a la referencia, altura absoluta de 0,123 m y pitch de 8,6 grados.
- Patron de contacto bipedal simetrico: `contact_fraction` de [0,5, 0,5], es decir, reparto equilibrado del contacto entre ambas patas.
- Control de orientacion: `yaw_rate_rps` de 0,147 y `head_yaw_ptp_rad` de 1,239, con etiqueta de direccion `forward`.
- Ejecucion como politica desplegable: se instala y ejecuta en un robot mediante la CLI `robotctl`.
- Reentrenamiento: el checkpoint `model.pt` permite ajuste fino o "remix" para derivar variantes.
- Trazabilidad de entrenamiento: conserva trayectorias y checkpoints por ronda para auditar la evolucion del comportamiento.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni multilingues, que no aplican a este tipo de artefacto.

## Casos de uso

- Control de locomocion en robot fisico: instalar la politica con `robotctl policy add flat out sprint tfrere/microduck-move-flat-out-sprint` y ejecutarla con `robotctl robot do flat out sprint` para que el robot pato se desplace hacia delante a maxima velocidad en una superficie plana.
- Base para un gait de desplazamiento rapido en un robot cuadrupedo o bipedo ligero: la politica aporta un patron de marcha de sprint validado numericamente, reutilizable como punto de partida para variantes de velocidad.
- Evaluacion comparativa de politicas dentro de Microduck Academy: al pertenecer a la familia `velocity` y al nivel `tier:1`, sirve como referencia base contra la que medir politicas de mayor nivel o de otras familias.
- Ajuste fino para superficies o cargas distintas: partiendo de `model.pt` se puede reentrenar la politica para terrenos irregulares, pesos adicionales o restricciones de consumo, reutilizando el juez como criterio de aceptacion.
- Validacion en simulador antes de desplegar en hardware: el archivo `policy.onnx` puede ejecutarse en un runtime ONNX dentro de un bucle de simulacion, comparando las metricas obtenidas con las del `manifest.json` antes de tocar el robot real.
- Auditoria y reproduccion de entrenamiento: los archivos `checkpoints/r<ronda>-<iter>.traj` y `rollouts/*.traj` permiten analizar en que iteracion se alcanzo el comportamiento estable y reproducir la evaluacion.
- Analisis de estabilidad y control: los campos del juez (`max_tilt_deg`, `pitch_deg`, `yaw_rate_rps`, `contact_fraction`, `height_ratio`) permiten estudiar la robustez del gait y detectar derivas de orientacion o perdidas de contacto.
- Demostracion o material divulgativo: el repositorio incluye `video.mp4` y `poster.jpg`, utiles para presentar el comportamiento del robot sin necesidad de reproducirlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no se trata de un modelo de lenguaje. La evaluacion documentada es la del juez numerico y el VLM de Microduck Academy:

| Metrica del juez | Valor |
|---|---|
| `height_ratio` | 1,07 |
| `height_m` | 0,123 m |
| `speed_mps` | 0,531 m/s |
| `displacement_mps` | 0,515 m/s |
| `pitch_deg` | 8,6 |
| `max_tilt_deg` | 14,8 |
| `yaw_rate_rps` | 0,147 |
| `head_yaw_ptp_rad` | 1,239 |
| `knee_left_rad` | 0,185 |
| `contact_fraction` | [0,5, 0,5] |
| `fell` | false |
| `duration_s` | 8,0 |
| `label` | forward |
| `mouth_min_` | truncado en la model card publicada |

| Ronda | Juez | Score del juez | Ojo (VLM) | Score final |
|---|---|---|---|---|
| 1 | pass | 1.0 | agrees ("The duck robot is moving forward quickly on its feet without falling.") | 100 % |
| final | pass | 1.0 | agrees ("The duck robot sprints forward steadily, staying upright on its feet without falling.") | 100 % |

Nota metodologica de la model card: el score mostrado en Discover es el del juez, con tope del 75 % cuando el VLM no esta seguro y del 50 % cuando discrepa; el detalle figura en `docs/TRAINING.md`, seccion 8.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Se trata de una politica de control de un robot de 0,123 m de altura, por lo que el modelo es previsiblemente muy pequeno, pero no se publican parametros ni precision numerica.
- GPU recomendadas: no disponibles. Al exportarse a ONNX (`policy.onnx`), es esperable que pueda ejecutarse en CPU dentro del bucle de control del robot, aunque no se confirma en la informacion disponible.
- Compatibilidad con GPU de consumo: no disponible. No hay indicacion de que requiera GPU dedicada.
- Opciones de despliegue: runtime ONNX para `policy.onnx`; PyTorch para `model.pt` en tareas de reentrenamiento; la CLI `robotctl` para instalacion y ejecucion en robot (`robotctl policy add` / `robotctl robot do`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. La unica referencia temporal es la duracion de la trayectoria evaluada, 8,0 s.
- Espacio en disco: el repositorio ocupa 0,0 GB segun HuggingFace, aunque incluye video, poster, trayectorias y checkpoints.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas de la familia `velocity` ni de otros niveles de Microduck Academy con las que comparar parametros, contexto, rendimiento o licencia. La model card menciona que existen familias y niveles dentro de la academia, pero no aporta datos de modelos concretos alternativos.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo de proposito general: no genera texto, codigo ni respuestas, y no admite prompt en lenguaje natural. Cualquier expectativa de ese tipo es un error de clasificacion.
- Ambito de comportamiento estrecho: la unica tarea documentada es el desplazamiento forward de sprint. No hay evidencia de capacidades de giro, marcha atras, escalada o adaptacion a terreno irregular.
- Condiciones de evaluacion limitadas: el juez se ejecuta sobre una trayectoria de 8,0 s con etiqueta `forward`. No se documentan pruebas con obstaculos, pendientes, superficies deslizantes ni perturbaciones externas.
- Discrepancia entre objetivo y resultado: el prompt fija una velocidad objetivo de aproximadamente 0,35 m/s, mientras que la medicion registra 0,531 m/s. No se explica en la informacion disponible si esto se debe a una actualizacion del criterio, a una medicion en condiciones distintas o a un error de documentacion.
- Campo truncado en la evidencia: la metrica `mouth_min_` aparece cortada en la model card publicada, por lo que ese valor no puede verificarse.
- Ausencia de adopcion verificable: 0 descargas y 0 likes, ademas de un repositorio de 0,0 GB y sin seccion de pipeline declarada. No hay evidencia de uso por terceros ni de validacion externa independiente del propio pipeline de la academia.
- Dependencia de la plataforma: la ejecucion en robot depende de la CLI `robotctl` y del ecosistema Microduck; fuera de ese entorno habria que implementar el bucle de control por cuenta propia.
- Fechas incoherentes: las fechas de creacion y actualizacion declaradas (2026-09-12) son posteriores a la fecha habitual de consulta; se reproducen tal cual figuran en los metadatos, sin interpretacion adicional.
- Sesgos: no disponibles. No se documenta analisis de sesgo, y en una politica de locomocion el concepto de sesgo aplica de forma distinta (por ejemplo, asimetria entre patas); el dato de `contact_fraction` es simetrico, pero no hay analisis al respecto.
- Riesgo de alucinacion: no aplica, ya que el modelo no genera lenguaje.
- Licencia: Apache-2.0, permisiva para uso comercial, sin que la model card anada restricciones adicionales. Se recomienda verificar los terminos de `robotctl` y de Microduck Academy, no cubiertos por esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-flat-out-sprint
- Perfil del autor: https://huggingface.co/tfrere
- Microduck Academy (space de entrenamiento): https://huggingface.co/spaces/tfrere/microduck
- Referencia interna de la model card: `docs/TRAINING.md`, seccion 8 (metodologia de puntuacion del juez y del VLM)
- Archivos incluidos en el repositorio: `policy.onnx`, `model.pt`, `rollouts/*.traj`, `checkpoints/r<round>-<iter>.traj`, `manifest.json`, `video.mp4`, `poster.jpg`
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante sobre este modelo. Las busquedas devolvieron unicamente paginas de un centro escolar aleman (kgbk.de) sin relacion con el modelo.
