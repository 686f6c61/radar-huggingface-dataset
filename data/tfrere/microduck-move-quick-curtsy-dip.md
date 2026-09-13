# tfrere/microduck-move-quick-curtsy-dip

## Resumen

`tfrere/microduck-move-quick-curtsy-dip` no es un modelo de lenguaje: es una política de control (un *move*) para un robot tipo pato denominado Microduck, entrenada por el usuario tfrere con la herramienta Microduck Academy. El artefacto ejecutable es un fichero ONNX (`policy.onnx`) que reproduce una habilidad concreta: desde una posición de pie estable, el robot desciende rápidamente a una sentadilla profunda (en torno al 70-75 % de la altura de pie segun la descripción del autor) y vuelve a subir a la posición erguida con los pies plantados.

El modelo pertenece a la familia `sitstand` (transiciones sentado <-> de pie), nivel `tier 2`, y es de tipo `perpetual`, lo que en la nomenclatura de Academy indica que el movimiento puede repetirse de forma continua. Se publica con licencia Apache-2.0 e incluye tanto la política exportada a ONNX para reproducción en robot como un checkpoint en PyTorch (`model.pt`) pensado para reentrenamiento o ajuste fino ("remix").

La relevancia del repositorio es doble. Por un lado, es un ejemplo de política de locomoción/habilidad de corta duración validada automáticamente por dos evaluadores: un *judge* basado en código que puntúa métricas numéricas y un *eye* basado en un VLM que inspecciona fotogramas. Por otro, ilustra un flujo de trabajo reproducible de extremo a extremo (entrenamiento por rondas, checkpoints, trayectorias y despliegue mediante `robotctl`). No obstante, la ficha pública no documenta la arquitectura de red, el número de parámetros ni el volumen de datos de entrenamiento, y el repositorio no tiene descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal de control exportada a ONNX; estructura interna no documentada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; es una política de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible / no aplica (no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y PyTorch (`model.pt`) |
| Identificador | tfrere/microduck-move-quick-curtsy-dip |
| Autor | tfrere |
| Familia | sitstand |
| Nivel (tier) | 2 |
| Tipo (kind) | perpetual |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-12 |
| Ultima actualizacion | 2026-09-12 |
| Pipeline declarado | no disponible |
| Otros ficheros | `rollouts/*.traj`, `checkpoints/r<round>-<iter>.traj`, `manifest.json` (esquema 2), `video.mp4`, `poster.jpg` |

## Arquitectura y entrenamiento

La model card no describe la topología de la red neuronal subyacente: no se especifica si es un perceptrón multicapa, una red recurrente, una política tipo *actor-critic* ni el número de capas o parámetros. Lo que sí se documenta es el proceso de entrenamiento: se trata de un movimiento entrenado con Microduck Academy, organizado en rondas con checkpoints por iteración (`checkpoints/r<round>-<iter>.traj`), de los que se conserva la traza de cada paso. El modelo que se publica corresponde al checkpoint 500 de la ronda 1, segun se deduce del comentario del evaluador visual. El `manifest.json` en esquema 2 incluye un bloque `academy` con el prompt, la familia, el juez y el linaje del movimiento.

La validación se realiza con dos mecanismos independientes. El primero, el *judge*, es código que evalúa la trayectoria sobre métricas numéricas (altura, velocidad, desplazamiento, inclinación, guiñada, contacto de pies, levantamiento de pies) y emitió veredicto PASS con una puntuación de 0,998. El segundo, el *eye*, es un modelo de visión-lenguaje que inspecciona fotogramas; en esta toma no emitió veredicto porque analizó el último checkpoint de la ronda y no el checkpoint 500 que se publica. No se documenta el algoritmo de optimización, el simulador utilizado, la composición del dataset ni si hubo fases de RLHF/DPO equivalentes.

## Capacidades

- Ejecución de una habilidad motora concreta y acotada: sentadilla rápida (descenso a crouch profundo) con retorno inmediato a la posición de pie.
- Mantenimiento del contacto plantar: la fracción de contacto registrada es de 0,95 y 0,96 por pie, es decir, los pies permanecen prácticamente plantados durante el movimiento.
- Estabilidad en guiñada y deriva: velocidad de guiñada de 0,001 rad/s y desplazamiento de 0,021 m/s, con un desplazamiento total de 0,128 m.
- Comportamiento repetible: el tipo `perpetual` indica que el movimiento se puede reproducir en bucle.
- Encadenamiento dentro de la familia `sitstand`: cubre transiciones entre sentado y de pie, lo que permite componerlo con otros movimientos de la misma familia.
- Despliegue directo en robot mediante la CLI `robotctl` (`policy add` y `robot do`).
- Reutilización para ajuste fino: se distribuye `model.pt` como punto de partida para variantes ("remix").
- Reproducción de trayectorias: los ficheros `.traj` con formato `trajectory.v1` permiten inspeccionar y volver a ejecutar las trazas registradas.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio ni *tool calling*: es una política de control, no un modelo generativo de propósito general.

## Casos de uso

- Demostración de robótica en ferias y eventos: el movimiento es corto, vistoso y de tipo perpetuo, por lo que puede ejecutarse en bucle continuo sobre el robot Microduck como atracción de stand sin intervención manual.
- Banco de pruebas de evaluación automática: sirve como caso de referencia para validar la propia infraestructura de Microduck Academy, ya que incluye veredicto del *judge*, estado del *eye*, puntuación final y checkpoints intermedios.
- Base para ajuste fino de variantes de sentadilla: partiendo de `model.pt` se pueden entrenar variantes (sentadilla más lenta, con inclinación distinta, con mayor amplitud) y comparar sus métricas contra las de este movimiento.
- Estudio de control de contacto: la fracción de contacto de 0,95-0,96 y los levantamientos de pie registrados (6 y 3) permiten analizar cuánto se despega cada pie en una habilidad que en teoría debe mantenerlos plantados.
- Composición de coreografías multi-movimiento: al pertenecer a la familia `sitstand` y ser `perpetual`, se puede encadenar con otros movimientos de la misma familia para construir secuencias más largas ejecutadas por `robotctl`.
- Docencia en aprendizaje por refuerzo aplicado a robótica: es un ejemplo autocontenido y con licencia permisiva para ilustrar un ciclo completo de entrenamiento por rondas, selección de checkpoint y despliegue.
- Validación de criterios de aceptación: el JSON del *judge* (altura, velocidad, inclinación, guiñada, desplazamiento) puede reutilizarse como plantilla de umbrales para admitir o rechazar nuevos movimientos de la familia.
- Pruebas de regresión del pipeline de despliegue: al ser un artefacto pequeño y con licencia Apache-2.0, resulta adecuado para comprobar que la instalación de políticas vía `robotctl` funciona antes de desplegar movimientos más críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje. El único resultado cuantitativo documentado es la evaluación del *judge* sobre la trayectoria del checkpoint publicado:

| Metrica | Valor |
|---|---|
| Veredicto del judge (codigo) | PASS |
| Puntuacion del judge | 0,998 |
| Veredicto del eye (VLM) | sin veredicto (analizo el ultimo checkpoint de la ronda, no el checkpoint 500 publicado) |
| Puntuacion mostrada en Discover | 100 % |
| height_ratio | 0,941 |
| height_m | 0,1082 |
| speed_mps | 0,017 |
| displacement_mps | 0,021 |
| pitch_deg | 21,5 |
| max_tilt_deg | 52,5 |
| yaw_rate_rps | 0,001 |
| head_yaw_ptp_rad | 0,258 |
| knee_left_rad | 0,002 |
| contact_fraction | [0,95, 0,96] |
| travel_m | 0,128 |
| foot_lifts | [6, 3] |

La semántica exacta de cada métrica (unidades de referencia, ventana de medición, normalizaciones) no está documentada en la información disponible. La descripción textual del autor indica un descenso al 70-75 % de la altura de pie, mientras que el campo `height_ratio` del judge vale 0,941; la diferencia podría deberse a que miden magnitudes distintas, pero no hay aclaración oficial al respecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio declara 0,0 GB de tamaño y la política se distribuye en ONNX, pero no hay cifras oficiales de memoria ni de parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. Al no publicarse el tamaño del modelo, no puede confirmarse si cabe en una RTX 4090 u otras GPU de gama de consumo.
- Opciones de despliegue: la vía documentada es ONNX Runtime a través de la CLI `robotctl` (`sudo robotctl policy add quick curtsy dip tfrere/microduck-move-quick-curtsy-dip` seguido de `robotctl robot do quick curtsy dip`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política de control.
- Latencia y throughput de inferencia: no disponibles. Los valores de velocidad y desplazamiento del judge (0,017 m/s y 0,021 m/s) describen el movimiento del robot, no el coste computacional de la política.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros movimientos de Microduck Academy (por ejemplo, otras políticas de la familia `sitstand` o del mismo nivel `tier 2`) ni de políticas de locomoción comparables de otros autores, por lo que no es posible establecer una comparación con cifras contrastadas de parámetros, contexto, rendimiento o disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas, y no admite prompts en lenguaje natural ni *tool calling*.
- Validación visual incompleta: el evaluador VLM (eye) no emitió veredicto en esta toma porque observó el último checkpoint de la ronda en lugar del checkpoint 500 que se publica. La puntuación de 100 % procede únicamente del *judge* basado en código.
- Regla de puntuación dependiente del eye: segun la documentación de Academy, la puntuación se limita al 75 % cuando el eye no está seguro y al 50 % cuando discrepa. En este caso el eye no dio veredicto, por lo que la métrica mostrada debe leerse con esa salvedad.
- Riesgo de sobreajuste a una familia concreta: la política pertenece a la familia `sitstand` y a un nivel `tier 2`; no hay evidencia de que generalice a otras tareas, terrenos o morfologías de robot.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin retroalimentación de terceros ni informes independientes de reproducción.
- Sesgos conocidos: no disponible. No se documentan sesgos de comportamiento, pero tampoco hay estudios al respecto.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto). El riesgo equivalente es que el *judge* numérico dé por bueno un movimiento que visualmente no se corresponda con la habilidad descrita.
- Limitaciones de idioma y contexto: no aplica; la política no procesa lenguaje ni mantiene contexto conversacional.
- Licencia: Apache-2.0, permisiva y apta para uso comercial, siempre que se conserven los avisos de copyright y licencia correspondientes. El modelo se distribuye sin garantías.
- Caveat operativo: los ficheros `.traj` y el `manifest.json` (esquema 2) definen un formato propio del ecosistema Microduck Academy; su interpretación fuera de ese ecosistema requiere revisar la documentación de Academy.
- Advertencia de seguridad física: ejecutar la política en un robot real implica movimiento mecánico del dispositivo; no se documentan límites de par, paradas de emergencia ni condiciones de entorno seguras.
- Metadatos atípicos: las fechas de creación y actualización indican 2026-09-12, posteriores a la fecha habitual de consulta, lo que conviene verificar antes de citar el modelo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/tfrere/microduck-move-quick-curtsy-dip
- Perfil del autor: https://huggingface.co/tfrere
- Microduck Academy (Space): https://huggingface.co/spaces/tfrere/microduck
- Referencia interna citada en la model card: `docs/TRAINING.md`, sección 8 (no se proporciona URL directa)
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo: los resultados obtenidos correspondían a sitios genéricos (GitHub, Zhihu, listados de asistentes conversacionales) sin relación con Microduck ni con esta política.
