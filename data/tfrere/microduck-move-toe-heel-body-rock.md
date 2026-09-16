# tfrere/microduck-move-toe-heel-body-rock

## Resumen

`tfrere/microduck-move-toe-heel-body-rock` no es un modelo de lenguaje: es una **política de control motriz** (un "move") para un robot tipo pato llamado Microduck, entrenada por el usuario tfrere dentro del proyecto Microduck Academy. El artefacto principal es `policy.onnx`, acompañado de `model.pt` para reentrenamiento y de grabaciones de trayectorias en formato `trajectory.v1` (`rollouts/*.traj` y `checkpoints/r<round>-<iter>.traj`). La habilidad aprendida está descrita por el propio autor como "un pato que balancea todo el cuerpo hacia delante y hacia atrás sobre sus pies, primero las puntas y luego los talones, sin dar ningún paso".

La ficha se publica en HuggingFace con los tags `microduck-academy-policy`, `microduck-policy`, `academy`, `family:velocity`, `kind:perpetual`, `tier:2` y licencia Apache 2.0. La familia declarada es `velocity` (estilos de marcha o gaits) y el tipo es `perpetual`, es decir, un comportamiento cíclico pensado para repetirse indefinidamente sin desplazamiento. Según la telemetría incluida, la política mantiene velocidad y desplazamiento en 0,0 m/s y una fracción de contacto de 1,0 en ambos pies, lo que confirma que no hay levantamiento de pies ni avance.

El interés de este modelo es metodológico más que de escala: ilustra un pipeline de entrenamiento y evaluación de políticas de locomoción con un juez numérico automático (que otorga una puntuación de 1,0 sobre los datos de telemetría) y un segundo evaluador basado en un VLM que revisa fotogramas del vídeo y confirma cualitativamente el comportamiento. La puntuación final publicada es del 100 %. El repositorio ocupa 0,0 GB según HuggingFace, tiene 0 descargas y 0 "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; no se documenta la topología de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la política consume observaciones de estado del robot y telemetría, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los tags no declaran idiomas; el modelo no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`), PyTorch (`model.pt`), trayectorias `trajectory.v1` (`.traj`) |

Datos adicionales de la ficha: identificador `tfrere/microduck-move-toe-heel-body-rock`, autor `tfrere`, creado el 2026-09-16 y actualizado el mismo día, pipeline `no disponible`, región `us`, tamano del repo 0,0 GB, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

No se documenta en la información disponible la topología concreta de la red (número de capas, tamaño de las capas ocultas ni tipo de política). Lo que sí se especifica es el marco de entrenamiento: Microduck Academy, con políticas organizadas en familias (`velocity`), niveles (`tier 2`) y tipos (`perpetual`). El material entregado incluye `checkpoints/r<round>-<iter>.traj`, que registra los pasos de entrenamiento de cada ronda, y el `manifest.json` con esquema 2, que incorpora los bloques `judge_score`, `vlm`, `score` y `academy` (con prompt, familia, juez y linaje). El checkpoint que se distribuye corresponde a la iteración 3300.

El proceso de evaluación es doble. Por un lado, un **juez numérico** analiza la telemetría y emite un veredicto codificado; en este caso, PASS con puntuación 1,0. Por otro, un **evaluador visual basado en VLM ("Eye")** examina los fotogramas del vídeo; su veredicto es "agrees", con la descripción "el pato se queda en el sitio y balancea el cuerpo hacia delante y hacia atrás con un ritmo constante y rápido". Además se ejecuta una batería de comandos (solo telemetría) de la que la política responde 2 de 2, con un área de comando del 100 %. La puntuación mostrada en Discover es del 100 %, con topes de 75 % cuando el evaluador visual no está seguro y de 50 % cuando discrepa.

## Capacidades

- Ejecución de una habilidad motriz concreta: balanceo del cuerpo completo hacia delante y hacia atrás, alternando apoyo en puntas y talones, sin dar pasos.
- Mantenimiento de la posición: velocidad de 0,0 m/s y desplazamiento de 0,0 m/s en la telemetría del juez.
- Contacto continuo de ambos pies: `contact_fraction` de `[1.0, 1.0]`, con `foot_lifts` de `[0, 0]`, es decir, ningún pie se levanta en ningún momento.
- Control postural medido: `height_ratio` de 1,0 con `height_m` de 0,115 m, `pitch_deg` de 2,1, `max_tilt_deg` de 9,8 y `yaw_rate_rps` de 0,004.
- Estabilidad direccional: `heading_drift_rad` de 0,024 y `travel_m` de 0,002, valores coherentes con un comportamiento en el sitio.
- Articulación de rodilla dentro de un rango pequeño: `knee_left_rad` de 0,085.
- Respuesta a comandos: la batería de comandos se resuelve con 2 de 2 respuestas correctas y un área de comando del 100 % (evaluada solo por telemetría).
- Reutilización y reentrenamiento: el archivo `model.pt` se ofrece explícitamente para "remix", es decir, para fine-tuning desde ese punto de partida.
- Ejecución en robot o simulador mediante la CLI `robotctl`.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso; el artefacto es una política de control, no un modelo generativo de propósito general.

## Casos de uso

- Animación de reposo o "idle" en un robot Microduck: la política produce un ciclo perpetuo de balanceo sin desplazamiento, adecuado como comportamiento por defecto cuando el robot debe permanecer en el sitio pero mostrar actividad. El `kind:perpetual` está pensado exactamente para repetirse de forma indefinida.
- Validación de controladores de equilibrio estático: dado que `contact_fraction` es `[1.0, 1.0]` y `foot_lifts` es `[0, 0]`, sirve como caso de referencia para comprobar que una cadena de control mantiene ambos pies apoyados y no introduce deslizamiento (el `travel_m` de 0,002 actúa como cota de referencia).
- Fine-tuning de nuevas variantes de marcha: partiendo de `model.pt`, un equipo puede derivar movimientos emparentados dentro de la familia `velocity` sin partir de cero, reutilizando el linaje registrado en `manifest.json`.
- Docencia y divulgación en robótica con patas: es un ejemplo acotado, con criterio de aceptación explícito y vídeo, útil para explicar cómo se define una tarea de locomoción, cómo se mide su éxito y cómo se registran las trayectorias de entrenamiento.
- Comparación de metodologías de evaluación: el par juez numérico más VLM permite estudiar la correlación entre métricas de telemetría y juicio visual, así como el efecto de los topes de puntuación (100 %, 75 %, 50 %) descritos en `docs/TRAINING.md`.
- Pruebas de integración de la CLI `robotctl`: el flujo `robotctl policy add` seguido de `robotctl robot do` sirve para verificar el alta y la ejecución de políticas dentro de esa herramienta, con un comportamiento de duración ilimitada y sin riesgo de desplazamiento inesperado del robot.
- Pruebas de simulación a realidad (sim2real) de bajo riesgo: al no implicar avance ni levantamiento de pies, este movimiento es un candidato conservador para validar por primera vez la transferencia de una política entrenada en simulación a un ejemplar físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no son aplicables a una política de control motriz. Lo que sí se publica es la evaluación específica del proyecto, con los siguientes datos:

| Metrica | Valor |
|---|---|
| Veredicto del juez (codigo) | PASS |
| Puntuacion del juez | 1,0 |
| Veredicto del evaluador visual (VLM) | agrees - "el pato se queda en el sitio y balancea el cuerpo hacia delante y atras con un ritmo constante y rapido" |
| Puntuacion mostrada en Discover | 100 % |
| Ronda registrada | 2 |
| Bateria de comandos | 2 de 2 respondidos (area de comando 100 %) |
| Checkpoint distribuido | 3300 |
| `height_ratio` | 1,0 |
| `height_m` | 0,115 |
| `speed_mps` | 0,0 |
| `displacement_mps` | 0,0 |
| `pitch_deg` | 2,1 |
| `max_tilt_deg` | 9,8 |
| `yaw_rate_rps` | 0,004 |
| `head_yaw_ptp_rad` | 0,041 |
| `knee_left_rad` | 0,085 |
| `contact_fraction` | `[1.0, 1.0]` |
| `travel_m` | 0,002 |
| `heading_drift_rad` | 0,024 |
| `foot_lifts` | `[0, 0]` |

No se dispone de comparaciones con otras políticas del mismo proyecto ni con cifras de throughput o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB según HuggingFace, lo que en cualquier caso indica un artefacto de tamano reducido, pero no se publica el numero de parametros ni el tamano exacto del fichero ONNX.
- GPU recomendadas: no disponibles. No se menciona ninguna GPU en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible. Al tratarse de una politica de control exportada a ONNX, el destino previsto parece ser el propio robot, pero esto no se declara de forma explicita en la model card.
- Opciones de despliegue: la via documentada es la CLI `robotctl`, con los comandos `sudo robotctl policy add toe-heel-body-rock tfrere/microduck-move-toe-heel-body-rock` y `robotctl robot do toe-heel-body-rock`. El artefacto en formato ONNX es ejecutable en cualquier entorno con runtime de ONNX, aunque el autor no detalla ningun runtime concreto.
- Latencia y throughput estimados: no disponibles.
- Otros recursos: no se especifican requisitos de CPU, memoria RAM ni sistema operativo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas de Microduck Academy con las que comparar (ni parametros, ni contexto, ni licencia, ni resultados). Como referencia interna del propio proyecto, esta politica se clasifica en la familia `velocity`, nivel `tier 2`, tipo `perpetual`, frente a otras familias, niveles y tipos que se mencionan de forma generica en los tags pero cuyas fichas no se han facilitado.

## Limitaciones y advertencias

- Ambito muy restringido: la politica implementa un unico comportamiento, el balanceo sobre puntas y talones sin paso. No es un modelo de proposito general ni reutilizable fuera de tareas de locomocion de Microduck.
- Sin desplazamiento: `speed_mps` y `displacement_mps` son 0,0, de modo que no puede usarse para navegar ni para alcanzar objetivos; su utilidad es de animacion o de referencia de control.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta, con creacion y ultima actualizacion el mismo dia, lo que implica que no hay evidencia de uso por terceros.
- Evaluacion dependiente del propio proyecto: el juez numerico, el evaluador VLM y la bateria de comandos forman parte del mismo marco de Microduck Academy; no hay evaluacion independiente ni replicacion externa.
- Cifras parciales en la model card: el bloque de telemetria del juez aparece truncado en el texto original (termina en `"foot_lifts": [0, 0], "f`), por lo que pueden existir metricas adicionales no visibles.
- Sesgos conocidos: no disponibles. No se documenta ningun analisis de sesgo, algo poco aplicable a una politica de control pero relevante si se reutiliza el material de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido generativo; el riesgo equivalente es la discrepancia entre la metrica de telemetria y el comportamiento fisico real del robot, que es precisamente lo que el evaluador visual trata de cubrir.
- Limitaciones de contexto e idioma: no aplicables, ya que el modelo no procesa lenguaje ni mantiene contexto textual.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright y la atribucion correspondiente. No se declaran restricciones adicionales, pero tampoco se ofrece ninguna garantia.
- Caveats para produccion: no hay informacion sobre robustez ante perturbaciones, terreno irregular, cambios de carga, desgaste mecanico ni diferencias entre ejemplares del robot; tampoco sobre la version del firmware o del simulador necesaria para reproducir el comportamiento.
- Idiomas no declarados en los tags, de modo que cualquier uso con texto queda fuera del alcance de esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfrere/microduck-move-toe-heel-body-rock
- Perfil del autor: https://huggingface.co/tfrere
- Space de Microduck Academy: https://huggingface.co/spaces/tfrere/microduck
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los unicos enlaces recuperados correspondian a paginas comerciales de Amazon (https://www.amazon.de/, https://www.amazon.de/amazonprime, https://www.amazon.de/gp/video/storefront, https://music.amazon.de/, https://www.amazon.de/businessprime) sin relacion con el artefacto. No se han localizado paper, blog tecnico ni repositorio de codigo asociados.
