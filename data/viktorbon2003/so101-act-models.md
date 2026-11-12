# viktorbon2003/so101-act-models

## Resumen

`viktorbon2003/so101-act-models` es una colección de seis políticas de robótica basadas en ACT (Action Chunking Transformer) entrenadas con LeRobot sobre el brazo robótico de bajo coste SO-101. Cada política está especializada en una única tarea de manipulación (pick & place, ensamblaje de bloques, manipulación de objetos con posiciones variables) y se distribuye como un checkpoint final de aproximadamente 207 MB, sumando un total de 1,2 GB el repositorio completo. El autor, Viktor Bonnenge, publica este paquete como material reproducible: incluye los ficheros de normalización de entrada y salida y la configuración de entrenamiento de cada política.

El interés de este repositorio es práctico más que de investigación: no es un modelo fundacional de lenguaje ni de visión, sino un conjunto de controladores de imitación entrenados a partir de demostraciones teleoperadas. Para quien trabaja con el SO-101, un brazo educativo de código abierto, este repositorio ofrece políticas listas para reproducir tareas concretas y sirve como referencia de cómo estructurar un pipeline completo de LeRobot (grabación con dos cámaras a 25 fps, entrenamiento ACT y despliegue).

No se dispone de información sobre licencia, idiomas ni benchmarks publicados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 12 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación de LeRobot |
| Parametros totales | no disponible (pesos finales de ~207 MB por política) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; entrada multimodal: imágenes de 2 cámaras + estado del robot) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32 o fp16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `config.json`, `policy_preprocessor*` y `policy_postprocessor*` en JSON/safetensors) |
| Libreria | lerobot |
| Pipeline | robotics |
| Entrada sensorial | 2 cámaras (`close` y `wide`), estado del brazo, 25 fps |
| Salida | acciones del brazo SO-101 (follower) |
| Tamano del repo | 1,2 GB (6 políticas × ~207 MB) |
| Datasets de entrenamiento | 6 datasets públicos en formato LeRobot v3.0 |

## Arquitectura y entrenamiento

Cada política es una ACT (Action Chunking Transformer), la arquitectura de imitación de LeRobot que combina un codificador visual con un transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad del control y reduce el error acumulado. La configuración es común a las seis políticas: brazo SO-101 en modo follower, dos cámaras (`close` y `wide`), grabación a 25 fps y datasets en formato LeRobot v3.0.

El entrenamiento es de imitación supervisada a partir de demostraciones teleoperadas. No se ha publicado información sobre número total de tokens, composición del dataset más allá de las tareas descritas, ni sobre uso de RLHF o DPO (no aplica en este contexto). El número de pasos de entrenamiento varía por tarea, desde 10 000 hasta 70 000, con datasets de entre 22 y 75 episodios. Destaca el caso de `long_pick_and_place_red`, entrenado durante 70 000 pasos sobre 75 episodios con ruido en la posición de inicio para aumentar la robustez de la política. Los checkpoints intermedios (cada 1 000 pasos) se eliminaron para reducir el tamaño del repositorio de más de 100 GB a 1,2 GB.

## Capacidades

- Control robótico de manipulación: cada política ejecuta una tarea concreta de pick & place o ensamblaje con el brazo SO-101.
- Percepción visual multimodal: procesa simultáneamente las imágenes de dos cámaras (`close` y `wide`) junto con el estado del robot.
- Predicción de chunks de acciones: genera secuencias de acciones en lugar de pasos aislados, lo que aporta suavidad y robustez al control.
- Generalización limitada a variaciones de posición: la política `long_pick_and_place_red` se entrenó con ruido en la posición inicial, y `pick_and_place_noise` con posición del bloque cambiante en cada episodio.
- Ensamblaje de bloques: la política `assemblage` ejecuta una tarea de inserción/ensamblaje entre dos bloques.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de tareas de pick & place en el SO-101: cargar la política `pick_place_yellow` con `ACTPolicy.from_pretrained` y ejecutarla con `lerobot-record --policy.path=...` para recoger y colocar el objeto amarillo en la posición entrenada.
- Manipulación con posición variable del objeto: usar `pick_and_place_noise`, entrenada con el bloque azul en posiciones nunca fijas, para escenarios donde el objeto no aparece siempre en el mismo sitio.
- Ensamblaje de precisión: la política `assemblage`, con 20 000 pasos y 40 episodios, sirve para tareas de inserción entre dos bloques donde se requiere alineación fina.
- Validación de pipelines de LeRobot: la política `triangle` se usó como primera tarea para validar la cadena completa de grabación, entrenamiento y ejecución, y es útil como caso de referencia para montar un flujo nuevo.
- Docencia y formación en robótica de imitación: el repositorio incluye configuraciones de entrenamiento completas (`train_config.json`) y datasets públicos, lo que permite reproducir el entrenamiento paso a paso en cursos o talleres.
- Investigación en robustez de políticas: comparar el comportamiento de `long_pick_and_place_red` (75 episodios, 70 000 pasos, ruido en posición) frente a `color` (50 episodios, 15 000 pasos, posiciones fijas) permite estudiar el efecto del volumen de datos y la variabilidad en la generalización.
- Benchmarking interno de hardware y latencia: al ser políticas ligeras (~207 MB), sirven para medir el rendimiento de inferencia en distintas GPUs o en CPU dentro de un lazo de control a 25 fps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con pesos de ~207 MB por política en safetensors, la huella en memoria es reducida (del orden de cientos de MB, incluyendo buffers de las dos cámaras), muy por debajo de los requisitos de un modelo de lenguaje.
- GPU recomendadas: no especificadas por el autor. Dado el tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería ser suficiente para inferencia; para entrenamiento se recomienda una GPU con al menos 8-12 GB de VRAM, aunque el dato no está confirmado en la información disponible.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con varios GB de VRAM; también es plausible su ejecución en CPU para inferencia, aunque no está documentado.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path=...`) y la API Python `ACTPolicy.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El lazo de control está pensado para operar a 25 fps (40 ms por ciclo), pero no se publican mediciones de latencia reales.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables en la documentación proporcionada. Como referencia cualitativa, dentro del propio repositorio las seis políticas difieren en tarea, número de episodios y pasos de entrenamiento:

| Política | Tarea | Episodios | Pasos | Tamaño dataset |
|---|---|---|---|---|
| `assemblage` | Ensamblaje de 2 bloques | 40 | 20 000 | 637 MB |
| `long_pick_and_place_red` | Pick & place cubo rojo con ruido | 75 | 70 000 | 608 MB |
| `pick_and_place_noise` | Pick & place bloque azul, posición variable | 40 | 14 998 | 277 MB |
| `color` | Pick & place cubo rojo, posiciones fijas | 50 | 15 000 | 330 MB |
| `pick_place_yellow` | Pick & place objeto amarillo | 22 | 15 000 | 152 MB |
| `triangle` | Pick & place triángulo (validación) | 50 | 10 000 | 387 MB |

No se han identificado en la información disponible alternativas externas (otras políticas ACT para SO-101 u otros brazos) con las que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Especialización extrema: cada política está entrenada para una única tarea y un único setup de robot y cámaras; no generaliza a otras tareas ni a cambios en la configuración física.
- Dependencia del entorno: el rendimiento depende de mantener la misma disposición de cámaras (`close` y `wide`), iluminación y posiciones de objetos que en los datasets de entrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de utilizarlo en producción.
- Sin benchmarks publicados: no hay tasas de éxito ni métricas de error que permitan evaluar la fiabilidad antes de desplegar.
- Riesgo de fallo en posiciones fuera de distribución: salvo en las políticas entrenadas con ruido (`long_pick_and_place_red`, `pick_and_place_noise`), la generalización a posiciones no vistas es limitada.
- Ficheros de normalización obligatorios: los `policy_preprocessor*` y `policy_postprocessor*` deben mantenerse junto al modelo; omitirlos altera las acciones predichas.
- Checkpoints intermedios no incluidos: solo se distribuye el modelo final; el autor ofrece los intermedios bajo petición.
- Sesgos y alucinaciones: no aplica en el sentido de un modelo de lenguaje, pero sí existe el riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento, con posibles colisiones del brazo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/viktorbon2003/so101-act-models
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Visualizador de datasets LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset
- Dataset `assemblage`: https://huggingface.co/datasets/viktorbon2003/assemblage__20261104_180340
- Dataset `long_pick_and_place_red`: https://huggingface.co/datasets/viktorbon2003/long_pick_and_place_red__20261104_115241
- Dataset `pick_and_place_noise`: https://huggingface.co/datasets/viktorbon2003/pick_and_place_noise_2_20261021_090417
- Dataset `color`: https://huggingface.co/datasets/viktorbon2003/color_20261020_173921
- Dataset `pick_place_yellow`: https://huggingface.co/datasets/viktorbon2003/pick_place_act_yellow_20261020_152547
- Dataset `triangle`: https://huggingface.co/datasets/viktorbon2003/triangle_20261006_151825
