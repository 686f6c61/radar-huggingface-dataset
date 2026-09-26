# Tenry55/act_Pick_and_put_screw_driver_with_big_variance

## Resumen

act_Pick_and_put_screw_driver_with_big_variance es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. No es un modelo de lenguaje: se trata de un modelo de imitación (imitation learning) que, a partir de observaciones visuales y del estado del robot, predice secuencias cortas de acciones (action chunks) en lugar de un único paso de control. El autor es Tenry55 (Tenry Tan) y el modelo se ha entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica.

El checkpoint tiene 51.668.614 parámetros y ocupa 0,2 GB en el repositorio, con pesos en formato safetensors. Está especializado en una tarea concreta de manipulación: coger y colocar un destornillador, con demostraciones que presentan una varianza elevada, tal como indica el propio nombre del modelo. Se entrenó sobre el dataset Tenry55/Pick_and_put_screw_driver_Merged_200 y la licencia es Apache-2.0.

Su relevancia es la de un ejemplo práctico del flujo de trabajo de LeRobot: recogida de datos por teleoperación, entrenamiento de una política ACT y despliegue en un brazo robótico de bajo coste tipo SO-100/SO-101. Al ser un repositorio recién publicado, con 0 descargas y 0 likes, debe considerarse un artefacto experimental sin validación externa ni resultados de éxito publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), basada en transformer con codificador visual; detalles internos de capas no disponibles |
| Parametros totales | 51.668.614 |
| Longitud de contexto | No aplica (modelo de robótica; no procesa secuencias de texto) |
| Tipos de cuantizacion | No disponible; pesos publicados en safetensors sin cuantizaciones documentadas |
| Idiomas soportados | No aplica (no procesa lenguaje natural); no disponible en la ficha de HuggingFace |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | Tenry55/Pick_and_put_screw_driver_Merged_200 |
| Tarea | Pick and put screw driver (alta varianza en las demostraciones) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que aprende de datos de teleoperación y predice chunks de acciones, es decir, bloques de varios pasos de control de una sola vez. Este enfoque reduce el problema de horizonte efectivo y mitiga el error de composición típico de las políticas que predicen acción a acción. Según la model card, ACT "a menudo alcanza tasas de éxito elevadas" en tareas de manipulación. No se detallan en la información proporcionada el número de capas, la dimensión de los embeddings, el tipo de codificador visual ni el tamaño del chunk de acciones de este checkpoint concreto.

El entrenamiento se realizó con LeRobot, mediante el comando `lerobot-train` con `--policy.type=act`, y los datos provienen del dataset Tenry55/Pick_and_put_screw_driver_Merged_200. Por el nombre del dataset, todo apunta a un conjunto fusionado de alrededor de 200 episodios, aunque este dato no está confirmado en la información disponible. No se documentan en la información proporcionada el número total de pasos de entrenamiento, la composición exacta del dataset, ni si hubo etapas de refinamiento tipo RLHF o DPO (poco habituales en este tipo de políticas). La particularidad declarada del entrenamiento es la varianza elevada de las demostraciones, algo que suele asociarse a datos teleoperados con ruido, correcciones humanas o distintas estrategias de agarre.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones (imágenes de cámara y estado del robot) para ejecutar la tarea de coger y colocar un destornillador.
- Robusto a demostraciones heterogéneas: entrenado explícitamente sobre un dataset "with big variance", lo que busca tolerar variabilidad en las trayectorias humanas.
- Inferencia y evaluación integradas en LeRobot: se ejecuta con `lerobot-record` apuntando a un robot SO-100/SO-101 follower mediante `--policy.path`.
- Reentrenamiento y ajuste fino: puede reentrenarse desde cero o ajustarse con nuevos datasets usando la CLI de LeRobot.
- Compatible con teleoperación como fuente de datos: el flujo de LeRobot permite grabar episodios nuevos y reentrenar el modelo.
- Sin capacidades de lenguaje: no soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni generación de texto.
- Sin capacidades multimodales generales: no hay visión-lenguaje, audio ni OCR; la visión se usa exclusivamente como entrada de control.

## Casos de uso

- Automatización de pick and place de herramientas: el modelo está entrenado específicamente para coger y colocar un destornillador, por lo que puede integrarse en una celda de montaje donde se manipulen herramientas de forma repetitiva.
- Base para fine-tuning en tareas de atornillado: partiendo de este checkpoint, se puede ajustar con datos propios de la línea de producción para tareas cercanas (presentar, insertar, soltar) y ahorrar episodios de teleoperación.
- Investigación en aprendizaje por imitación con datos ruidosos: su entrenamiento con alta varianza lo convierte en un caso de estudio para medir robustez de ACT frente a demostraciones inconsistentes.
- Generación de datos sintéticos de evaluación: ejecutar la política en bucle con `lerobot-record` permite recoger episodios etiquetados para analizar modos de fallo.
- Despliegue en robótica de bajo coste: al ser un modelo de ~51,7 M de parámetros, es viable en brazos tipo SO-100/SO-101 con hardware de consumo, lo que facilita prototipos educativos y de laboratorio.
- Benchmark interno de políticas ACT: sirve como referencia para comparar variantes de ACT entrenadas con distintos datasets o hiperparámetros dentro del mismo entorno robótico.
- Demostraciones reproducibles en docencia: el par dataset + política publicado permite que un estudiante reproduzca el ciclo completo de entrenamiento y evaluación con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasa de éxito, número de episodios de evaluación, ni comparaciones cuantitativas. Tampoco hay métricas de error de acción ni resultados en simulación. El único indicio cualitativo es la afirmación genérica del paper de ACT sobre tasas de éxito elevadas en tareas de manipulación, que no es un resultado medido para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 51,67 M de parámetros ocupan aproximadamente 207 MB; en fp16/bf16, unos 103 MB. A esto hay que sumar activaciones, buffers del codificador visual y memoria del runtime de PyTorch, no cuantificados en la información disponible.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos 4 GB de VRAM es suficiente en términos de pesos; para control en tiempo real se recomienda GPU dedicada, ya que el bucle de control exige latencias bajas y estables.
- GPU de consumo: sí cabe con holgura en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares, así como en plataformas embebidas tipo Jetson Orin, siempre que el resto del stack de robótica lo permita.
- CPU: la inferencia en CPU es viable por el reducido tamaño del modelo, pero la tasa de control resultante puede ser insuficiente para tareas que requieran respuesta rápida.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch para carga manual del checkpoint safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependen del hardware, de la resolución de las cámaras de entrada y del tamaño del chunk de acciones, parámetros que no se detallan.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas dentro de la información proporcionada. La comparación siguiente se limita a lo que puede afirmarse sin inventar cifras.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_Pick_and_put_screw_driver_with_big_variance (este) | ACT, aprendizaje por imitación con action chunks | 51.668.614 | No aplica | Apache-2.0 | HuggingFace, libreria lerobot |
| act_so101_test (mismo autor) | ACT, aprendizaje por imitación | No disponible | No aplica | No disponible en la informacion | HuggingFace, libreria lerobot |
| Diffusion Policy | Política generativa por difusión para control | No disponible | No aplica | No disponible en la informacion | Implementada en LeRobot |
| VQ-BeT / TDMPC y otras políticas de LeRobot | Políticas de imitación alternativas | No disponible | No aplica | No disponible en la informacion | Integradas en LeRobot |

## Limitaciones y advertencias

- Sobreadaptación al entorno de entrenamiento: la política está entrenada para una tarea, un robot y una configuración de cámaras concretos; cambiar la posición de la cámara, la iluminación, el fondo o la cinemática del brazo degrada el comportamiento.
- Error de composición y desviación de distribución: como toda política de imitación, puede acumular error en episodios largos y fallar ante estados no vistos durante el entrenamiento, el equivalente en robótica al riesgo de alucinación en un LLM.
- Sin validación pública: el repositorio tiene 0 descargas y 0 likes y no se han publicado tasas de éxito, por lo que no hay evidencia externa de que funcione fuera del entorno del autor.
- Dataset de origen poco documentado: la composición exacta, el número real de episodios y la calidad de las demostraciones del dataset Tenry55/Pick_and_put_screw_driver_Merged_200 no se detallan.
- Sesgos potenciales: la alta varianza de las demostraciones puede hacer que la política reproduzca trayectorias subóptimas o inconsistencias del teleoperador humano. No se documenta ningún análisis de sesgos.
- Idioma: no soporta ningún idioma, ya que no procesa texto.
- Sin razonamiento simbólico ni herramientas: no admite tool calling, function calling, agentes ni planificación de varios pasos en el sentido de un LLM.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios. No hay restricciones adicionales documentadas.
- Caveat de producción: antes de usarlo en un entorno real hay que validar seguridad física del brazo, límites de par, paradas de emergencia y comportamiento ante fallos de percepción; el modelo no incorpora ninguna capa de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tenry55/act_Pick_and_put_screw_driver_with_big_variance
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas con LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Tenry55/Pick_and_put_screw_driver_Merged_200
- Perfil del autor: https://huggingface.co/Tenry55
- Otro checkpoint del mismo autor: https://huggingface.co/Tenry55/act_so101_test
