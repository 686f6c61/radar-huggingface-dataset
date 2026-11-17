# yyuncong/SyncWorld-mv3-strip384-recent8-rt2h-from20k-step12000

## Resumen

SyncWorld-mv3-strip384-recent8-rt2h-from20k-step12000 es un checkpoint intermedio de un modelo del mundo (world model) para robótica, desarrollado por el usuario yyuncong. Se trata de un modelo de dinámica directa (forward dynamics) que, dado un fotograma de anclaje y una secuencia de acciones del efector final, predice los 16 fotogramas siguientes de un episodio de manipulación bimanual. El modelo se entrena sobre el conjunto de datos RoboTwin 2.0 con cámaras de cabeza (RT2H) y forma parte de una familia de experimentos denominada SyncWorld.

La arquitectura es un transformer con atención completa y disposición *in-context*: la consulta (un fotograma de anclaje más 16 acciones futuras) se precede de K fragmentos de 16 transiciones del propio episodio, ordenados del más antiguo al más reciente. En esta variante concreta, el contexto es "recent8": los ocho fragmentos más recientes del propio registro de la consulta, sin recuperación de otros episodios ni memoria TTT. Cada fotograma es una tira de 1536x384 píxeles compuesta por tres celdas de 512x384 (cámara de cabeza, muñeca izquierda y muñeca derecha).

El checkpoint corresponde a la actualización 12.000 de una ejecución que finalizó en la actualización 20.000, y se publica junto a otros dos checkpoints (un selector aprendido v2 y un control de pesos iguales) para facilitar comparaciones. Su relevancia radica en que sirve como línea base sin recuperación para evaluar mecanismos de selección de contexto en modelos del mundo aplicados a robótica, y en que se distribuye con una licencia OpenMDW-1.1 heredada del ecosistema NVIDIA Cosmos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa, disposición in-context, sin memoria TTT |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | K = 8 fragmentos de 16 transiciones (recent8) más la consulta de 16 acciones |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | OpenMDW-1.1 (license: other) |
| Formato de pesos | no disponible (repo de 30,3 GB; el autor no detalla el formato) |

## Arquitectura y entrenamiento

El modelo sigue una formulación de dinámica directa en contexto: cada consulta consta de un fotograma de anclaje t0 y sus 16 acciones futuras del efector final, y el objetivo es generar los 16 fotogramas siguientes. Antes de la consulta se sitúan los K fragmentos de 16 transiciones del propio registro que terminan en el fotograma t0-1, ordenados del más antiguo al más reciente. En esta variante, K corresponde a los ocho fragmentos más recientes del propio episodio ("recent8"), sin recuperación de una biblioteca externa y sin la incrustación aprendida de distancia al anclaje que sí usan las variantes con recuperación. La atención es completa y no hay memoria TTT.

El entrenamiento parte únicamente de los pesos de `yyuncong/SyncWorld-mv3-strip384-recent8-s7pose-from20k-step20000` (mvA3p en la actualización 20.000), entrenado sobre la mezcla s7 de datos de un solo brazo, y se ejecuta sobre el release RoboTwin 2.0 con cámara de cabeza (dos brazos, dos cámaras de cabeza y dos cámaras de muñeca), leído mediante la preparación `mv_strip_rt2h_v1`. La ejecución se denomina `qctx_incontext_mv_A_recent8_v3s7pose_8gpu_rt2h_4n20k_mva3p20k`, usa la receta `wm_ttt/retrieval/recipe_qctx_incontext_mv_A_recent8_v3s7pose_8gpu.toml` y se lanzó con `mast/launch_wm_ttt_mast.sh --variant mvA3p --data mv_strip_rt2h_v1`. El optimizador usa un LR de 5e-5 tras un calentamiento de 100 actualizaciones, luego constante, con un presupuesto de 20.000 actualizaciones del generador y semillas fijas. El hardware empleado fueron 4 nodos x 8 H100.

Cada fotograma es una tira de 1536x384 con tres celdas de 512x384 en el orden: cámara de cabeza, muñeca izquierda (`wrist_left_rgb`) y muñeca derecha (`wrist_right_rgb`). Cada episodio tiene dos cámaras de cabeza (`agentview_rgb`, `agentview_rgb_1`); el entrenamiento muestrea una de las dos por flujo, y el plan canónico muestra `agentview_rgb`. Cada cámara de 384x384 se recorta a una ventana de 384x288 y se redimensiona a 512x384, con posición vertical muestreada por cámara y flujo (cabeza 0,3-0,65; muñecas 0,5-1,0, sobre las 96 filas sobrantes). Hay *view dropout* por flujo: una cámara en negro con probabilidad del 10 % y dos con el 5 %. Los fotogramas se leen a 20,83 Hz (declarado como fuente de 20 Hz) y se acondicionan a 15 fps. Cada muestra lleva el pie de foto fijo "A robot arm interacts with the scene." y no se leen las instrucciones del release.

## Capacidades

- Predicción de dinámica directa: genera los 16 fotogramas futuros de un episodio de manipulación bimanual a partir de un fotograma de anclaje y 16 acciones del efector final.
- Modelado multivista: compone en una sola tira una cámara de cabeza y las dos cámaras de muñeca, con muestreo de cámara de cabeza por flujo y *view dropout* durante el entrenamiento.
- Condicionamiento en contexto: usa los ocho fragmentos más recientes del propio registro como contexto, sin recuperación externa.
- Acciones como pose realizada del efector final (no comandos abstractos).
- No dispone de tool calling ni function calling (no es un modelo de lenguaje).
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües (no es un modelo lingüístico).
- No dispone de modo de pensamiento, visión general, audio ni otras modalidades fuera de las imágenes de robótica descritas.

## Casos de uso

- Evaluación de líneas base en investigación de modelos del mundo: sirve como referencia "sin recuperación" frente a las variantes con selector aprendido v2 y con pesos iguales, todas publicadas juntas, para aislar el efecto del mecanismo de selección de contexto en la predicción de dinámica.
- Simulación de rollouts para planificación robótica: dado un estado observado y una secuencia de acciones candidatas, el modelo predice los fotogramas futuros y permite comparar trayectorias antes de ejecutarlas en el robot real, reduciendo el coste de prueba y error físico.
- Aumento de datos para políticas de manipulación bimanual: los fotogramas generados pueden emplearse para ampliar conjuntos de entrenamiento de políticas de imitación en tareas de dos brazos con cámaras de cabeza y muñeca.
- Estudio de robustez ante oclusiones de cámara: gracias al *view dropout* del entrenamiento (10 % una cámara, 5 % dos), el modelo puede analizarse en escenarios donde una o dos vistas faltan, útil para investigar degradación de la predicción bajo pérdida de sensores.
- Análisis de representaciones de contexto en modelos del mundo: al fijar K = 8 fragmentos recientes, permite estudiar cuánta información histórica aporta el contexto frente a variantes con recuperación de otros episodios.
- Reproducción de experimentos de dinámica directa: el checkpoint intermedio (actualización 12.000) y su configuración completa (`training/config.yaml`) permiten reproducir curvas de entrenamiento y comparar checkpoints en las actualizaciones 2.000, 12.000, 13.000, 14.000 y 19.000.
- Investigación sobre el efecto del hardware y la inicialización: al diferir de las variantes con recuperación en inicialización (mvA3p frente a mvSV3p), contexto y hardware (H100 frente a B200), facilita estudios de ablación controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 30,3 GB, lo que da una cota inferior del espacio en disco necesario para los pesos; la VRAM depende del formato y la cuantización, que el autor no detalla.
- GPU recomendadas: el entrenamiento se realizó con 4 nodos x 8 H100; para inferencia se desconoce la configuración mínima recomendada.
- ¿Cabe en GPU de consumo? No disponible. Dado el tamaño del repositorio (30,3 GB) y la naturaleza de modelo del mundo con atención completa sobre tiras de 1536x384, es probable que requiera GPUs de datacenter, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: no disponible. El autor no documenta integración con vLLM, llama.cpp, Ollama, TGI ni otros motores; el modelo se enmarca en el pipeline `robotics` de Hugging Face y en el código de entrenamiento del proyecto SyncWorld.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-recent8-rt2h-from20k-step12000 (este) | no disponible | 8 fragmentos recientes propios | OpenMDW-1.1 | Hugging Face, checkpoint intermedio (update 12.000) | Línea base sin recuperación, inicialización mvA3p, 4x8 H100 |
| SyncWorld-mv3-strip384-views-first-selv2-rt2h-from20k-step13000 | no disponible | Selector aprendido v2 con regla OR de hermanos | OpenMDW-1.1 | Hugging Face, iteración 13.000 (12.792 updates del generador) | Inicialización mvSV3p, 4x8 B200, incluye `router.npz` |
| SyncWorld-mv3-strip384-views-first-equalw-rt2h-from20k-step13000 | no disponible | Selector fijo con pesos iguales y regla OR de hermanos | OpenMDW-1.1 | Hugging Face, update 13.000 | Inicialización mvSV3p, control del selector v2 |
| SyncWorld-mv3-strip384-recent8-rt2h-from20k-step2000 | no disponible | 8 fragmentos recientes propios | OpenMDW-1.1 | Hugging Face, update 2.000 | Mismo run que este, checkpoint temprano |

Los tres checkpoints principales comparten preparación de datos y partición de validación, muestreo de consultas y distribución de K, fotogramas, acciones y calentamiento del dominio de acciones, así como pérdida, optimizador, LR (5e-5 tras 100 actualizaciones de calentamiento, luego constante), semillas y presupuesto de 20.000 actualizaciones del generador. Las diferencias entre las variantes con recuperación y este checkpoint son la inicialización, el contexto, la incrustación de distancia al anclaje y el hardware. No se dispone de métricas de rendimiento comparativas publicadas.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la actualización 12.000 de una ejecución que terminó en la 20.000; no es el modelo final de la ejecución.
- El contexto "recent8" solo contiene fotogramas del propio registro de la consulta anteriores al anclaje; no incorpora recuperación de otros episodios ni la incrustación aprendida de distancia al anclaje.
- No se han publicado resultados de benchmarks, por lo que no es posible cuantificar su calidad predictiva frente a alternativas.
- No se detallan los tipos de cuantización ni el formato de pesos, lo que dificulta estimar requisitos de despliegue.
- El pie de foto es fijo ("A robot arm interacts with the scene.") y no se leen las instrucciones del release; el modelo no responde a instrucciones en lenguaje natural.
- El modelo está entrenado exclusivamente sobre RoboTwin 2.0 con cámara de cabeza (RT2H) y la mezcla s7 de un solo brazo para la inicialización; su generalización a otros robots, cámaras o dominios no está documentada.
- La licencia OpenMDW-1.1 se hereda de NVIDIA Cosmos; conviene revisar sus términos antes de un uso comercial, ya que la model card la marca como "other".
- No hay datos sobre sesgos, tasa de alucinación ni comportamiento fuera de distribución; en modelos del mundo, la predicción de fotogramas futuros puede divergir del estado real en horizontes largos.
- La resolución y el acondicionamiento temporal (15 fps) están fijados por la preparación `mv_strip_rt2h_v1`; usos con otras frecuencias o resoluciones requerirán adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-rt2h-from20k-step12000
- Checkpoint de inicialización (mvA3p, update 20.000): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-s7pose-from20k-step20000
- Variante con selector aprendido v2 (iteración 13.000): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-selv2-rt2h-from20k-step13000
- Variante con selector de pesos iguales (update 13.000): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-equalw-rt2h-from20k-step13000
- Checkpoint temprano del mismo run (update 2.000): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-rt2h-from20k-step2000
- Checkpoint de inicialización de las variantes con recuperación (mvSV3p, update 20.000): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-s7pose-from20k-step20000
- Licencia OpenMDW-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
