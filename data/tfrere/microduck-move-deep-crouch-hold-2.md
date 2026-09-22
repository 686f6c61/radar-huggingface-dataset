# tfrere/microduck-move-deep-crouch-hold-2

## Resumen

`tfrere/microduck-move-deep-crouch-hold-2` no es un modelo de lenguaje ni un modelo generativo multimodal: es una **politica de control (policy) de locomocion** entrenada dentro de Microduck Academy, el entorno de entrenamiento de movimientos de pato robotico publicado por el usuario tfrere en HuggingFace. El objetivo del movimiento es acotado y esta descrito literalmente en la model card: "un pato que se agacha hasta una posicion de sentadilla profunda y la mantiene perfectamente quieto, sin moverse del sitio en el que esta y sin dar pasos". El artefacto es, por tanto, un controlador de comportamiento motor, no un modelo de proposito general.

El autor lo distribuye en dos formatos: `policy.onnx` (pesos listos para inferencia) y `model.pt` (punto de partida para reentrenar o hacer fine-tuning). Se etiqueta con `family:velocity` (estilos de marcha o gaits), `kind:perpetual` y `tier:1` en los tags, aunque la propia model card declara `tier None`, una discrepancia que conviene tener presente. La licencia es Apache 2.0, lo que permite uso comercial con las obligaciones habituales de atribucion y aviso.

Su relevancia actual es de nicho: sirve como referencia reproducible de una politica de locomocion estatica validada automaticamente por un juez basado en codigo (score 1.0, veredicto PASS) y por un segundo evaluador VLM que revisa fotogramas del video (veredicto "agrees"). El repo tiene 0 descargas y 0 likes en el momento de la consulta y un tamano declarado de 0.0 GB, por lo que se trata de una publicacion reciente y practicamente sin traccion. La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo: los enlaces recuperados tratan de productos de ahorro franceses y no guardan relacion con este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card. Se trata de una red de politica de control exportada a ONNX; no se declara si es MLP, transformer ni su topologia interna |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (no procesa secuencias de texto; la entrada es propiocepcion y telemetria del robot) |
| Tipos de cuantizacion | no disponible (el repo publica ONNX y PyTorch sin variantes cuantizadas declaradas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y PyTorch (`model.pt`); trayectorias en formato `trajectory.v1` (`.traj`) |
| Tamano del repositorio | 0.0 GB (segun metadatos de HuggingFace) |
| Familia declarada | `velocity` (estilos de marcha / gaits) |
| Tipo declarado | `perpetual` |
| Tier | Discrepancia: tag `tier:1` frente a "tier None" en la model card |
| Checkpoint publicado | Iteracion 5000 (es el que se distribuye y el que se evaluo con el VLM) |
| Sistema de entrenamiento | Microduck Academy (space `tfrere/microduck`) |
| Pipeline de HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-22 (ambas) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red: no indica numero de capas, tamano de las mismas, tipo de observaciones de entrada, espacio de acciones ni algoritmo de optimizacion (PPO, SAC u otro). Lo unico verificable es el resultado del proceso de entrenamiento, materializado en un fichero ONNX para inferencia y un checkpoint PyTorch para reanudar el entrenamiento. El modelo se enmarca en el pipeline de Microduck Academy, cuyo bloque `academy` del `manifest.json` registra el prompt, la familia, el juez y el linaje del movimiento.

El entrenamiento se estructura en rondas evaluadas automaticamente. La model card documenta la ronda 2 con el juez en estado `pass` y puntuacion 1.0, y una validacion secundaria mediante un VLM ("eye") que inspecciona fotogramas y emite el veredicto "agrees", con la descripcion "el robot baja suavemente a una sentadilla profunda doblando las rodillas durante el primer segundo". Ademas, el modelo responde 2 de 2 comandos de la bateria de telemetria (area de comandos al 100 %). El repositorio incluye las grabaciones de trayectoria por ronda y por iteracion (`checkpoints/r<round>-<iter>.traj`), lo que permite auditar la evolucion del entrenamiento paso a paso.

## Capacidades

- Ejecucion de una postura motora concreta: descenso a sentadilla profunda y mantenimiento estatico de la postura. Los numeros del juez lo respaldan: `travel_m` 0.001, `speed_mps` 0.0, `displacement_mps` 0.0 y `foot_lifts` [0, 0].
- Control postural medible: `height_ratio` 0.673 (altura 0.0773 m respecto a la postura de referencia), `pitch_deg` 7.1, `max_tilt_deg` 7.4, `yaw_rate_rps` 0.004, `heading_drift_rad` 0.021.
- Articulacion de rodilla: `knee_left_rad` 1.31, coherente con una flexion profunda real y no con un simple hundimiento del cuerpo.
- Estabilidad de contacto: `contact_fraction` [1.0, 1.0], es decir, ambos pies mantienen contacto pleno durante la secuencia evaluada.
- Respuesta a comandos de la bateria de telemetria: 2 de 2 comandos respondidos (area de comandos 100 %).
- Inferencia portable: al publicarse en ONNX, la politica puede ejecutarse con cualquier runtime compatible con ONNX sin depender de PyTorch.
- Reentrenamiento: `model.pt` esta pensado explicitamente para "remix", es decir, fine-tuning desde este checkpoint.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidad de agente ni soporte multilingue: esas categorias no aplican a este artefacto y no hay datos que las respalden.
- No se documenta modo "thinking", entrada de audio ni ninguna capacidad perceptiva propia; la validacion visual es externa (un VLM evaluador, no el modelo).

## Casos de uso

- Animacion y videojuegos: la politica puede actuar como controlador de un personaje tipo pato que debe adoptar una postura de agachamiento estatico. Es adecuada porque los datos del juez garantizan desplazamiento practicamente nulo (`travel_m` 0.001) y ausencia de pasos (`foot_lifts` [0, 0]), que es exactamente lo que se espera de una animacion de "mantener postura".
- Investigacion en aprendizaje por refuerzo: sirve como referencia reproducible de una politica de locomocion estatica dentro de la familia `velocity`. Al incluir trayectorias por iteracion, permite reproducir y auditar la curva de entrenamiento de la ronda 2 hasta la iteracion 5000.
- Conjunto de validacion para pipelines de evaluacion automatica: los pares juez/VLM de esta ficha (juez PASS con score 1.0, VLM "agrees") son un caso etiquetado con el que probar sistemas de scoring de politicas, incluida la regla de recorte de puntuacion (75 % si el VLM duda, 50 % si discrepa).
- Fine-tuning de variantes de movimiento: partiendo de `model.pt`, un equipo puede entrenar derivados (por ejemplo, otra profundidad de sentadilla u otra orientacion de cabeza) reutilizando el linaje y el prompt registrados en `manifest.json`.
- Demostracion de despliegue en robot real: el flujo documentado (`robotctl policy add deep-crouch-hold tfrere/microduck-move-deep-crouch-hold-2` seguido de `robotctl robot do deep-crouch-hold`) permite instalar y ejecutar el movimiento en la plataforma robotica compatible.
- Reposo controlado en operaciones de inspeccion o espera: al mantener altura reducida (0.0773 m, 67.3 % de la altura de referencia) y deriva de rumbo de 0.021 rad, es util para situaciones en las que el robot debe permanecer agachado sin desplazarse durante una tarea.
- Composicion de una biblioteca de movimientos: al ser `kind:perpetual`, encaja como habilidad reutilizable dentro de un catalogo de politicas que un planificador de mas alto nivel invoca segun el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos de lenguaje en la informacion disponible (no aplican a este artefacto). Lo que si se publica es la evaluacion del propio movimiento, que reproduzco integra:

| Metrica del juez | Valor |
|---|---|
| Veredicto | pass |
| Puntuacion del juez | 1.0 |
| height_ratio | 0.673 |
| height_m | 0.0773 |
| speed_mps | 0.0 |
| displacement_mps | 0.0 |
| pitch_deg | 7.1 |
| max_tilt_deg | 7.4 |
| yaw_rate_rps | 0.004 |
| head_yaw_ptp_rad | 0.003 |
| knee_left_rad | 1.31 |
| contact_fraction | [1.0, 1.0] |
| travel_m | 0.001 |
| heading_drift_rad | 0.021 |
| foot_lifts | [0, 0] |

| Ronda | Juez | Puntuacion del juez | VLM (eye) | Puntuacion final |
|---|---|---|---|---|
| 2 | pass | 1.0 | Agrees ("The robot drops smoothly into a deep squat by bending its knees during the first second.") | 100 % |

Evaluacion complementaria: bateria de comandos respondida 2 de 2 (area de comandos 100 %). La puntuacion mostrada en Discover es el score del juez, recortado al 75 % si el VLM no esta seguro y al 50 % si discrepa. No hay comparaciones con otros modelos ni resultados en entornos reales fuera de simulacion.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se declara el numero de parametros ni el tamano del fichero `policy.onnx`, por lo que no puede estimarse la huella de memoria sin datos adicionales.
- GPU recomendadas: no disponible. Al tratarse de una politica de control exportada a ONNX, lo habitual en este tipo de artefactos es ejecutarla en CPU o en el propio computador del robot, sin GPU dedicada; esta afirmacion es una inferencia general del formato y no un dato declarado por el autor.
- Compatibilidad con GPU de consumo: no disponible por falta de datos de tamano. No puede confirmarse ni descartarse que quepa en una RTX 4090 u otra GPU de consumo.
- Opciones de despliegue: ONNX Runtime (por el fichero `policy.onnx`) y PyTorch (por `model.pt`) son las vias implicitas en los formatos publicados. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no tendria sentido aplicarlas a una politica de control. El despliegue documentado en robot es mediante `robotctl`.
- Latencia y throughput: no disponible. No se publican mediciones de frecuencia de control, tiempo de inferencia ni tasa de refresco.
- Entrenamiento o fine-tuning: no disponible. No se especifican GPU, horas de computo ni coste del proceso de entrenamiento en Microduck Academy.

## Comparativa con modelos similares

No disponible. La model card no cita otras politicas con las que compararse y la busqueda web no devolvio informacion relevante sobre este modelo ni sobre alternativas de la misma categoria. Como referencia estructural, las unicas comparaciones plausibles serian otras politicas de la misma familia `velocity` publicadas por el mismo autor dentro de Microduck Academy, pero no se dispone de sus especificaciones ni de sus resultados de evaluacion en la informacion proporcionada.

| Criterio | Este modelo | Alternativas |
|---|---|---|
| Parametros | no disponible | no disponible |
| Contexto | no aplica | no disponible |
| Rendimiento | Juez 1.0 / 100 % en la ronda 2 | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Disponibilidad | Repo publico en HuggingFace, 0 descargas | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se declara arquitectura, numero de parametros, observaciones, acciones, algoritmo de entrenamiento ni hiperparametros. Sin esa informacion no puede reproducirse el entrenamiento ni auditarse el modelo.
- Validacion exclusivamente en simulacion y mediante evaluadores automaticos: el juez opera "sobre los numeros" y el VLM "sobre los fotogramas". No se aporta evidencia de transferencia a un robot fisico (sim-to-real), que es el principal riesgo en este tipo de politicas.
- Riesgo de sobreajuste al criterio del juez: la puntuacion de 100 % procede de una unica ronda (la 2) y de la regla de recorte descrita. Un unico caso superado no garantiza robustez ante variaciones de terreno, carga o estado inicial.
- Comportamiento intrinsecamente estatico: la politica esta disenada para no desplazarse (`speed_mps` 0.0, `displacement_mps` 0.0). No debe esperarse de ella navegacion, marcha ni recuperacion de perturbaciones fuertes; esas capacidades no estan evaluadas ni documentadas.
- Discrepancia de metadatos: el tag `tier:1` y el valor "tier None" de la model card se contradicen, lo que sugiere posibles inconsistencias en el manifiesto.
- Sin senales de adopcion ni mantenimiento: 0 descargas, 0 likes y fechas de creacion y actualizacion identicas (un segundo de diferencia). Es un artefacto recien publicado y sin retroalimentacion de terceros.
- Sesgos y limitaciones de idioma: no aplica en el sentido habitual, ya que el modelo no procesa lenguaje natural. Si aplica la advertencia de que cualquier sesgo proviene de la distribucion de entrenamiento del simulador, no documentada.
- Alucinacion: no aplica a un controlador motor. El riesgo equivalente es ejecutar el movimiento con una postura incorrecta fuera del dominio entrenado, sin posibilidad de detectarlo sin instrumentacion externa.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios realizados. No se anaden restricciones adicionales conocidas, pero el autor no ofrece garantias.
- Para produccion: no hay versionado semantico, ni changelog, ni pruebas de regresion publicadas. Cualquier integracion deberia fijar el checkpoint (iteracion 5000) y validar el comportamiento en el hardware destino antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-deep-crouch-hold-2
- Space de Microduck Academy: https://huggingface.co/spaces/tfrere/microduck
- Perfil del autor: https://huggingface.co/tfrere

Nota sobre la busqueda web: los resultados recuperados (moneyvox.fr, droit-finances.commentcamarche.com) tratan sobre cuentas de ahorro y productos bancarios franceses y no guardan ninguna relacion con este modelo, por lo que se descartan como fuentes. No se han encontrado papers, blogs, repositorios ni demos adicionales sobre `microduck-move-deep-crouch-hold-2`.
