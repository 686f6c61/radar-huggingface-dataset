# tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3btactile260920

## Resumen

Este repositorio contiene un checkpoint de política robótica denominado `ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3btactile260920`, publicado por el usuario tarzanagh. Se trata de un modelo de imitación (imitation learning) construido sobre la arquitectura GR00T-N1.7 de 3B parámetros (etiqueta `Gr00tN1d7`), especializado en manipulación bimanual diestra. La tarea concreta es la transferencia de una caja de pañuelos de un nivel de estantería a otro: el robot la coge, la pasa de una mano a la otra y la deposita en un nivel distinto. El hardware objetivo es un DexMate Vega-1 equipado con dos manos RobotEra XHand1.

El modelo es relevante en el contexto de la investigación en visión-lenguaje-acción (VLA) aplicada a robótica, porque forma parte de una comparativa controlada de cuatro familias de políticas (GR00T, ACT, Diffusion Policy y pi0) sobre tres tareas, con y sin señal táctil. El checkpoint incorpora una entrada táctil de 30 dimensiones (fuerzas en las yemas de los cinco dedos de cada mano) concatenada al estado, lo que da un vector de estado de 68 dimensiones. El entrenamiento se realizó sobre un conjunto muy reducido de 54 episodios de teleoperación con guante Meta y seguimiento de muñeca Vive, sin exoesqueleto.

Se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, pesos en formato safetensors (12,6 GB de repositorio) y licencia "other". El autor advierte explícitamente de que las métricas publicadas miden error de seguimiento de trayectoria en bucle abierto, no éxito de tarea, y que no se ha ejecutado nada en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T-N1.7 (etiqueta `Gr00tN1d7`); política VLA de imitación para robótica. Detalle interno de capas no disponible en la informacion proporcionada |
| Parametros totales | 3.144.016.000 (3,14B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; la política consume ventanas de observación de 4 camaras RGB) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye safetensors sin cuantizaciones publicadas |
| Idiomas soportados | no disponible / no aplica (modelo de control robótico, no generativo de lenguaje) |
| Licencia | other (consultar términos del autor; uso comercial no especificado) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 12,6 GB |
| Pipeline declarado | robotics |
| Entradas | 4 camaras RGB, 640x360 a 30 fps; estado de 68-D |
| Dimension de estado/accion | 38-D `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]` + 30-D de fuerza en yemas (5 dedos x 3 ejes por mano) |
| Entrenamiento | 10.000 pasos, semilla 1000 |
| Dataset | 54 episodios, 48 de entrenamiento / 6 reservados (cada décimo) |
| Fecha de publicacion | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo con la familia GR00T-N1.7 (etiqueta `Gr00tN1d7`) y un tamano de 3,14B parametros, entrenado como política de imitación para control bimanual. No se detalla en la model card la composicion exacta de capas, el tipo de cabezal de accion ni si existe una etapa de RLHF o DPO; en el contexto robótico esto ultimo no aplica del modo habitual. Lo que sí se especifica es el interfaz de observacion y accion: la política recibe cuatro flujos RGB a 640x360 y 30 fps, junto con un vector de estado de 68 dimensiones que combina posiciones articulares (38-D) y fuerzas de contacto en las yemas (30-D). La innovacion declarada respecto a la variante base es precisamente la incorporacion de la señal táctil.

El entrenamiento se realizo durante 10.000 pasos con semilla 1000 sobre 54 episodios de teleoperacion capturados con guante Meta (sin exoesqueleto) y seguimiento de muñeca Vive. La política opera con esquema de chunking: observa el estado real cada 16 pasos y predice un bloque de acciones, del cual solo se conservan las 16 primeras. Un resultado destacable del estudio es que, comparando cuatro familias de políticas por tres tareas, la entrada táctil no produjo diferencias mas alla del ruido, mientras que GR00T obtuvo el error mas bajo en todas las tareas.

## Capacidades

- Manipulacion bimanual diestra: la política controla dos brazos de 7 grados de libertad y dos manos de 12 grados de libertad cada una, coordinando el paso de un objeto de una mano a la otra.
- Tarea especifica de pick-and-place entre niveles: retirar una caja de pañuelos de un estante y depositarla en otro nivel distinto.
- Control guiado por vision multi-camara: consume cuatro flujos RGB simultaneos a 640x360 y 30 fps.
- Percepcion táctil integrada: admite un vector de 30 dimensiones de fuerzas en las yemas (5 dedos x 3 ejes por mano) concatenado al estado.
- Generacion de trayectorias por bloques (action chunking): predice 16 acciones por inferencia, reobservando el estado real cada 16 pasos.
- Aprendizaje por imitacion a partir de demostraciones de teleoperacion, sin necesidad de reward shaping ni simulacion.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, generacion de texto, codigo, matematicas ni vision semantica; es un modelo de control motor.

## Casos de uso

- Transferencia mano a mano en linea de manipulacion: el modelo esta entrenado especificamente para pasar un objeto de la mano izquierda a la derecha (o viceversa) durante una secuencia bimanual, lo que lo hace adecuado como componente de politicas de ensamblaje donde el objeto debe reorientarse.
- Reabastecimiento de estanterias en logistica: recoger un articulo de un nivel y colocarlo en otro es exactamente la tarea `shelf2shelf` del checkpoint; se usaria como política base en un robot movil con dos brazos para reposicion de producto.
- Investigacion en aprendizaje por imitacion con pocos datos: con solo 48 episodios de entrenamiento, sirve como referencia de cuanto puede lograr una política VLA de 3B parametros en regimen de datos escasos.
- Estudio del aporte de la señal táctil en políticas VLA: el repositorio incluye la variante con y sin tactil del mismo experimento, lo que permite reproducir el hallazgo de que el tactil no aporto mejora significativa en este entorno.
- Comparativa de familias de políticas: junto con los checkpoints hermanos de ACT, Diffusion Policy y pi0, permite evaluar de forma controlada cuatro arquitecturas sobre la misma tarea y mismo dataset.
- Recoleccion de datos de teleoperacion como fuente de entrenamiento: el pipeline descrito (guante Meta + Vive, 4 camaras, 30 fps) es replicable para generar nuevos datasets de manipulacion diestra.
- Evaluacion en bucle abierto de políticas antes de despliegue: el protocolo del autor (reobservar cada 16 pasos y medir error de seguimiento) sirve como filtro barato para descartar checkpoints antes de probarlos en hardware.
- Docencia y prototipado en robotica: por su tamano (3,14B) y peso en bf16 (~6,3 GB), puede ejecutarse en una GPU de consumo para experimentos de laboratorio.

## Benchmarks y rendimiento

La unica metrica publicada es el error en bucle abierto sobre el conjunto reservado (media del valor absoluto de la diferencia entre accion predicha y accion registrada, en radianes, ± error estandar de la media, n=6). El autor advierte que mide seguimiento de trayectoria, no exito de tarea, y que no se ejecuto en hardware.

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo (GR00T-3B + tactil) | 0,0225 ± 0,0007 | 0,0142 ± 0,0009 | 0,0218 ± 0,0013 | 0,0124 ± 0,0005 |
| Baseline hold-first-frame | 0,3538 | 0,2351 | 0,2926 | 0,2373 |

Datos adicionales aportados en la model card, sin cifras desglosadas por modelo:

- En cuatro familias de políticas por tres tareas, la entrada táctil no produjo diferencias mas alla del ruido.
- GR00T obtuvo el error mas bajo en todas las tareas evaluadas.
- No se publican resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, ya que el modelo no es generativo de texto.

## Requisitos de hardware

- VRAM estimada para los pesos: en bf16/fp16, aproximadamente 6,3 GB (3,144B x 2 bytes); en fp32, aproximadamente 12,6 GB, coherente con el tamano de repositorio de 12,6 GB. Estimaciones derivadas del recuento de parametros, no confirmadas por el autor.
- VRAM adicional necesaria para los cuatro codificadores de vision y los buffers de cuatro flujos RGB a 640x360 y 30 fps, no cuantificada en la informacion disponible.
- GPU de consumo: los pesos en bf16 caben en una RTX 4090 (24 GB) o RTX 4080 (16 GB), con margen para los encoders visuales en el primer caso. En fp32 requeriria al menos 16-24 GB.
- GPU de datacenter: A100 (40/80 GB), H100 (80 GB) o L40S son suficientes y dejan espacio para lotes mayores o para servir varias camaras.
- Opciones de despliegue: no especificadas en la model card. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuados para una política de control. El ecosistema natural es PyTorch con los runners de la familia GR00T/LeRobot, aunque esto no se confirma en la informacion proporcionada.
- Latencia y throughput: no disponibles como medida publicada. Como dato derivado del protocolo, si el control se ejecuta a 30 fps y la política reobserva cada 16 pasos, la replanificacion ocurre a aproximadamente 1,875 Hz; la latencia por inferencia no se reporta.
- Restriccion de despliegue: no se ha validado en hardware; el propio autor indica que "nada de esto se ejecuto en hardware".

## Comparativa con modelos similares

La model card describe un estudio con 24 ejecuciones que cruzan cuatro familias de políticas (GR00T, ACT, Diffusion Policy y pi0) con y sin entrada táctil, sobre tres tareas. No se publican cifras desglosadas por familia, solo la conclusion cualitativa de que GR00T logro el error mas bajo en todas las tareas. La comparativa cuantitativa entre checkpoints queda, por tanto, no disponible.

| Modelo | Familia | Tactil | Parametros | Error en bucle abierto | Licencia |
|---|---|---|---|---|---|
| Este checkpoint | GR00T-N1.7 3B | Sí | 3,14B | 0,0225 / 0,0142 / 0,0218 / 0,0124 rad | other |
| `ckpt_..._gr00t3b260920` | GR00T-N1.7 3B | No | no disponible (misma base) | no disponible por modelo | other |
| `ckpt_..._act260920` / `acttactile260920` | ACT | No / Sí | no disponible | no disponible por modelo | other |
| `ckpt_..._dp260920` / `dptactile260920` | Diffusion Policy | No / Sí | no disponible | no disponible por modelo | other |
| `ckpt_..._pi05260920` / `pi05tactile260920` | pi0 | No / Sí | no disponible | no disponible por modelo | other |

## Limitaciones y advertencias

- Las metricas publicadas son de error en bucle abierto (seguimiento de trayectoria), no de exito de tarea; un error bajo no garantiza que el robot complete la manipulacion.
- Ninguna evaluacion se ejecuto en hardware real, segun declara el propio autor.
- El dataset es muy reducido: 54 episodios, 48 de entrenamiento y 6 reservados. El riesgo de sobreajuste a las condiciones de captura es alto.
- La entrada táctil no aporto mejora medible mas alla del ruido en el estudio; el valor anadido de esta variante frente a la version sin tactil no esta demostrado.
- El modelo esta especializado en una unica tarea (`shelf2shelf`) con un objeto concreto (caja de pañuelos) y un hardware concreto (DexMate Vega-1 con manos XHand1); no se espera transferencia directa a otros robots, objetos o tareas.
- No se documentan sesgos de generacion de texto porque el modelo no genera texto; los sesgos relevantes serian de generalizacion ante cambios de iluminacion, posicion de camara, textura del objeto o friccion.
- No hay informacion sobre idiomas ni capacidades multilingues; la ficha de HuggingFace no declara idiomas.
- Licencia "other": no se especifican los terminos de uso comercial. Es imprescindible contactar con el autor o revisar los terminos del repositorio antes de cualquier uso productivo, y verificar asimismo las condiciones de la licencia de la base GR00T-N1.7 de terceros.
- El modelo tiene 0 descargas y 0 likes, sin validacion externa por parte de la comunidad.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a contenido sin relacion alguna con robotica o aprendizaje automatico, por lo que no se ha podido contrastar informacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3btactile260920
- Variante GR00T sin tactil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3b260920
- Variante ACT: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_act260920
- Variante ACT + tactil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_acttactile260920
- Variante Diffusion Policy: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dp260920
- Variante Diffusion Policy + tactil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dptactile260920
- Variante pi0: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05260920
- Variante pi0 + tactil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05tactile260920
- Paper, blog o repositorio de codigo asociados: no disponibles en la informacion proporcionada.
