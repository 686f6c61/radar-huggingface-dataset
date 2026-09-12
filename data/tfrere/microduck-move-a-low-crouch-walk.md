# tfrere/microduck-move-a-low-crouch-walk

## Resumen

`microduck-move-a-low-crouch-walk` es una politica de control (policy) entrenada para un agente simulado llamado Microduck, no un modelo de lenguaje. La publica el usuario tfrere y se distribuye como un artefacto de inferencia en formato ONNX (`policy.onnx`) junto con un punto de control de PyTorch (`model.pt`) reutilizable para reentrenamiento. La tarea concreta es una habilidad motora: hacer que el pato camine hacia delante de forma continua manteniendo una postura agachada, con el tronco a aproximadamente el 85 % de su altura en posicion erguida.

El modelo pertenece al ecosistema Microduck Academy, un espacio de Hugging Face donde se entrenan estas politicas, y se etiqueta con los metadatos `family:velocity` (estilos de marcha o gaits), `kind:perpetual` y `tier:1`. La evaluacion automatica mediante un juez programatico sobre metricas numericas dio un resultado PASS con puntuacion 1.0, y la puntuacion mostrada en el catalogo Discover es del 100 %. No se publican el numero de parametros, la arquitectura interna de la red ni el volumen de datos de entrenamiento.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un ciclo completo de aprendizaje por refuerzo (prompt, entrenamiento, juez automatico, validacion por VLM y publicacion de artefactos), y como pieza reutilizable para locomocion de personajes simulados en videojuegos, animacion procedural y experimentos de transferencia simulacion-a-realidad. Los pesos ocupan un espacio practicamente nulo (el repositorio figura con 0.0 GB) y las descargas y los "likes" registrados en el momento de redactar esta ficha son cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de control exportada a ONNX; no se describe la topologia de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y PyTorch (`model.pt`) |
| Artefactos adicionales | `rollouts/*.traj` (grabaciones de trayectorias, esquema trajectory.v1) y `manifest.json` (schema 2, con bloque `academy`: prompt, family, judge y lineage) |
| Familia / tier / tipo | family:velocity (estilos de marcha), tier:1, kind:perpetual |
| Etiquetas del repositorio | onnx, microduck-policy, academy, family:velocity, kind:perpetual, tier:1, license:apache-2.0, region:us |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La informacion publicada no describe la topologia de la red neuronal que implementa la politica: no se indica si es un perceptron multicapa, una red recurrente ni un transformer de decision. Lo que si se documenta es el metodo de produccion del artefacto. La politica fue entrenada por tfrere con Microduck Academy, un espacio asociado al ecosistema Microduck, y se etiqueta dentro de la familia `velocity`, dedicada a estilos de marcha. El resultado del entrenamiento se exporta a ONNX para su ejecucion y se conserva el punto de control en PyTorch (`model.pt`) especificamente para permitir el "remix", es decir, el ajuste fino desde ese estado.

El control de calidad combina dos evaluadores. El primero es un juez programatico que valida el comportamiento sobre metricas numericas de la simulacion (altura, velocidad, inclinacion, fraccion de contacto de cada pie, caida y duracion) y que en esta ronda emitio un veredicto PASS con puntuacion 1.0. El segundo es un "ojo" basado en un modelo de vision-lenguaje que revisa fotogramas del episodio; en este caso no emitio veredicto porque observo el ultimo punto de control de la ronda y no el punto 3100 que es el que finalmente se publica, por lo que su dictamen no se traslada a esta version. La model card remite a `docs/TRAINING.md`, seccion 8, para las reglas de puntuacion. No se especifican el numero de tokens o pasos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO, algo por otra parte esperable en un modelo de lenguaje y no en una politica de locomocion.

## Capacidades

- Locomocion cuadrupeda hacia delante de forma continua durante al menos los 8 segundos evaluados, con la etiqueta de direccion "forward".
- Mantenimiento de una postura agachada sostenida: el ratio de altura medido es 0.833 (0.0958 m frente a la altura erguida de referencia), que corresponde al objetivo de aproximadamente el 85 %.
- Control de velocidad moderada y estable, con 0.234 m/s de velocidad y 0.2 m/s de desplazamiento efectivo.
- Estabilidad postural: inclinacion maxima de 4.8 grados y cabeceo (pitch) de 1.2 grados durante la ronda, sin caida (`fell: false`).
- Patron de marcha con reparto equilibrado del contacto entre pies (fracciones de 0.52 y 0.53), indicativo de una zancada alterna consistente.
- Articulacion de rodilla izquierda con un recorrido de 0.782 radianes y rotacion de cabeza con un rango pico a pico de 0.696 radianes.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, capacidades de agente ni soporte multilingue, ya que no es un modelo de lenguaje.
- Reutilizacion y especializacion: el archivo `model.pt` permite ajuste fino para derivar nuevas variantes de marcha dentro de la familia `velocity`.

## Casos de uso

- Animacion procedural de personajes no jugadores en videojuegos: la politica `policy.onnx` puede ejecutarse en tiempo real para generar una marcha agachada de sigilo sin necesidad de animaciones grabadas ni de captura de movimiento, integrandose mediante un runtime ONNX en el motor.
- Prototipado en robotica con patas: sirve como politica de partida en un simulador para estudiar el comportamiento de una marcha baja antes de abordar una transferencia a hardware real, dado que el objetivo de altura (85 % de la altura erguida) es un parametro de control habitual en tareas de sigilo o paso por espacios reducidos.
- Generacion de datos sinteticos de movimiento: los ficheros `rollouts/*.traj` contienen trayectorias grabadas que pueden emplearse como datos de demostracion para entrenar otros controladores por imitacion o para alimentar modelos de prediccion de movimiento.
- Evaluacion y comparacion de politicas: el bloque `academy` del `manifest.json` (prompt, familia, juez y linaje) permite reproducir el mismo criterio de evaluacion sobre otras politicas de la familia `velocity` y contrastar sus metricas numericas de forma objetiva.
- Investigacion en aprendizaje por refuerzo: constituye un ejemplo completo y trazable del ciclo prompt, entrenamiento, juez automatico y validacion por VLM, util como material docente o como caso de estudio metodologico.
- Pruebas de motores de simulacion y de fisica: la politica puede utilizarse como carga de trabajo repetible para verificar estabilidad numerica, tiempos de paso y comportamiento de contactos en distintos motores o configuraciones.
- Ajuste fino de variantes de marcha: partiendo de `model.pt`, un equipo puede especializar el comportamiento hacia otras cadencias, alturas de tronco o velocidades sin comenzar el entrenamiento desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes, porque no es un modelo de lenguaje). Lo unico disponible es la evaluacion del juez programatico para esta ronda concreta:

| Metrica | Valor | Interpretacion |
|---|---|---|
| Veredicto del juez | PASS | aprobado |
| Puntuacion del juez | 1.0 | maxima |
| height_ratio | 0.833 | altura del tronco respecto a la posicion erguida |
| height_m | 0.0958 m | altura del tronco medida |
| speed_mps | 0.234 m/s | velocidad instantanea |
| displacement_mps | 0.2 m/s | velocidad de desplazamiento efectivo |
| pitch_deg | 1.2 | cabeceo medio |
| max_tilt_deg | 4.8 | inclinacion maxima |
| yaw_rate_rps | 0.322 | velocidad de giro |
| head_yaw_ptp_rad | 0.696 | rango pico a pico de giro de cabeza |
| knee_left_rad | 0.782 | recorrido de la rodilla izquierda |
| contact_fraction | [0.52, 0.53] | fraccion de contacto de cada pie |
| fell | false | no se produjo caida |
| duration_s | 8.0 | duracion del episodio evaluado |
| label | forward | direccion de la marcha |
| Veredicto del ojo (VLM) | sin veredicto | observo otro punto de control de la ronda |
| Puntuacion mostrada | 100 % | puntuacion del juez en el catalogo Discover |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio figura con 0.0 GB, de modo que los pesos son muy ligeros y, como estimacion razonada a partir de ese tamano, la inferencia deberia caber holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: no disponibles. El formato ONNX permite ejecucion en CPU, por lo que no se requiere acelerador dedicado.
- Compatibilidad con GPU de consumo: si, previsiblemente cualquier GPU de consumo e incluso CPU son suficientes, dado el reducido tamano del artefacto. No se publican mediciones que lo confirmen.
- Opciones de despliegue: ONNX Runtime para `policy.onnx`; motores de videojuego con soporte ONNX (por ejemplo Unity con Barracuda o Sentis, o plugins equivalentes en Unreal); PyTorch para cargar `model.pt` en entrenamiento o ajuste fino; simuladores de robotica con patas para ejecutar la politica en un entorno fisico simulado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion facilitada no incluye datos de otras politicas de la familia `velocity` ni de otros tiers de Microduck Academy, mas alla de la etiqueta `tier:1`. Como referencia estructural, el modelo pertenece a la familia `velocity` (estilos de marcha), tipo `perpetual` y tier 1, pero no se detallan los parametros, el contexto ni el rendimiento de las politicas hermanas, y no se han encontrado alternativas comparables externas en la busqueda web realizada.

## Limitaciones y advertencias

- Ambito de aplicacion muy restringido: la politica esta entrenada para una unica habilidad (marcha hacia delante en posicion agachada) y no se documenta su comportamiento ante cambios de direccion, terrenos irregulares ni perturbaciones externas.
- Validacion parcial: el "ojo" basado en VLM no emitio veredicto para el punto de control finalmente publicado (el 3100), por lo que la revision visual humana o automatizada de esta version concreta queda pendiente. La puntuacion de 100 % procede unicamente del juez numerico.
- Dependencia del juez: la puntuacion esta sujeta a las reglas del juez programatico descritas en `docs/TRAINING.md`, seccion 8; un juez satisfecho no garantiza naturalidad visual ni robustez fuera de las metricas medidas.
- Entorno simulado: no hay evidencia de transferencia a hardware real (sim2real) ni datos de rendimiento con latencia o ruido de sensores.
- Riesgo de sobreajuste al episodio evaluado: la duracion validada es de 8.0 segundos y una sola etiqueta de direccion ("forward"); no se acredita estabilidad en ejecuciones prolongadas.
- Idiomas y sesgos: no aplicable en el sentido habitual, ya que el modelo no procesa lenguaje ni datos textuales; no se documentan sesgos de comportamiento mas alla de los medidos.
- Licencia: apache-2.0, que permite uso comercial y modificacion siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios, y que se incluya el texto de la licencia en las redistribuciones. No impone restricciones de uso adicionales, pero tampoco ofrece garantias.
- Nula traccion en la plataforma: cero descargas y cero "likes", sin comunidad ni incidencias reportadas que permitan valorar su robustez en produccion.
- Ausencia de documentacion tecnica: no se publican parametros, arquitectura interna, datos de entrenamiento ni detalles de la observacion y el espacio de acciones, lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tfrere/microduck-move-a-low-crouch-walk
- Espacio Microduck Academy (entrenamiento): https://huggingface.co/spaces/tfrere/microduck
- Perfil del autor: https://huggingface.co/tfrere
- Documentacion de entrenamiento referenciada en la model card: `docs/TRAINING.md`, seccion 8 (ruta citada sin URL publica)
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las URLs devueltas no guardan ninguna relacion con el modelo y se han descartado.
