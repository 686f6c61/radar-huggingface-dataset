# Swinter1/my_policy

## Resumen

`Swinter1/my_policy` es una política de manipulación robótica entrenada por imitación con el método ACT (Action Chunking with Transformers, arXiv:2304.13705) y publicada en Hugging Face Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular del robot y dos imágenes de cámara, y devuelve un vector de acción de 6 dimensiones. El repositorio contiene 51.668.614 parámetros en formato safetensors y ocupa 0,2 GB.

El modelo está especializado en una única tarea: coger un bolígrafo y depositarlo en un contenedor ("Pick up the pen and place it in the container"). Se entrenó con el dataset `Swinter1/tidy_pen_merged_trimmed`, formado por 51 episodios y 16.110 fotogramas grabados a 30 FPS sobre un robot `so_follower` de la familia SO-100, con dos cámaras (`top_view` y `hand`) a resolución 480x640.

Su relevancia es práctica y acotada: sirve como referencia reproducible de ACT sobre hardware de bajo coste, como punto de partida para ajuste fino con datos propios y como baseline para evaluar robustez en tareas de pick-and-place. La licencia Apache-2.0 permite uso comercial, pero el autor no ha publicado ningún resultado de evaluación en robot real, y el repositorio acumula 0 descargas y 0 likes, por lo que no existe validación externa de su comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer codificador-decodificador con CVAE latente y predicción por trozos de acción |
| Parámetros totales | 51.668.614 (≈51,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ACT predice trozos de acción de longitud k, no documentada en la model card) |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes cuantizadas ni GGUF) |
| Idiomas soportados | no aplica; no procesa lenguaje natural. La tarea se pasa como cadena de texto en la CLI de LeRobot, pero la política no está condicionada por lenguaje |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 0,2 GB) |
| Entradas | `observation.state` (6,); `observation.images.top_view` (3, 480, 640); `observation.images.hand` (3, 480, 640) |
| Salidas | `action` (6,) |
| Robot objetivo | `so_follower` (SO-100) |
| Frecuencia de los datos de entrenamiento | 30 FPS |
| Tarea entrenada | "Pick up the pen and place it in the container" |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT combina un autocodificador variacional condicional (CVAE) con un transformer codificador-decodificador. El codificador consume el estado del robot y las imágenes de las cámaras (procesadas por un backbone visual convolucional) junto con una variable latente que modela la variabilidad de las demostraciones humanas; el decodificador genera un trozo de acciones futuras en lugar de un único paso. Esta predicción por trozos es la innovación central del método: reduce el error compuesto típico de las políticas de imitación paso a paso, y en inferencia se combina habitualmente con un ensamblado temporal de trozos solapados. Los detalles concretos de esta política (tamaño del trozo, backbone visual exacto, número de capas y cabezas) no se documentan en la model card y figuran como no disponibles.

El entrenamiento se realizó con LeRobot 0.6.2 sobre 50.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. Los datos provienen de teleoperación sobre un `so_follower` con dos cámaras, 51 episodios y 16.110 fotogramas a 30 FPS, con las instrucciones "Pick up pen and pace in container" y "Pick up the pen and place it in the container" (dos variantes de la misma tarea). No hay información sobre composición de distractores, variación de posiciones, aumentos de datos ni procesos de RLHF/DPO, que en cualquier caso no son aplicables a este tipo de política.

## Capacidades

- Control visomotor de 6 grados de libertad: transforma un vector de estado de 6 valores y dos imágenes RGB de 480x640 en un vector de acción de 6 valores.
- Predicción por trozos de acción (action chunking): emite secuencias cortas de acciones en lugar de un único comando, lo que aporta consistencia temporal en el movimiento.
- Ejecución de una tarea concreta de pick-and-place: coger un bolígrafo y colocarlo en un contenedor.
- Fusión de dos puntos de vista simultáneos: cámara cenital (`top_view`) y cámara montada en la pinza (`hand`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa ni genera lenguaje natural.
- No dispone de modo de razonamiento (thinking), generación de texto, código, matemáticas ni audio.
- Procesa imágenes como entrada, pero no las describe, etiqueta ni razona sobre ellas.

## Casos de uso

- Reproducción de la tarea de referencia en un SO-100: ejecutar `lerobot-rollout` con las dos cámaras calibradas a 640x480 y 30 FPS permite replicar la tarea de recogida y colocación del bolígrafo tal como se entrenó, con la ventaja de que el checkpoint ya está entrenado y no requiere GPU de gama alta.
- Punto de partida para ajuste fino con datos propios: al tratarse de un ACT de 51,7 M de parámetros entrenado con un pipeline estándar de LeRobot, sirve como inicialización para nuevas tareas de pick-and-place sobre el mismo robot, reduciendo el número de episodios necesarios frente a un entrenamiento desde cero.
- Baseline en comparativas de políticas de imitación: permite comparar ACT frente a Diffusion Policy o modelos VLA en el mismo dataset, con las mismas cámaras y la misma métrica de tasa de éxito, siempre que se documente el protocolo de evaluación.
- Validación de infraestructura de LeRobot: usar el checkpoint como prueba de humo (smoke test) para verificar que la grabación, la calibración de cámaras, el puerto del robot y el bucle de control funcionan antes de lanzar entrenamientos largos.
- Docencia y laboratorios de robótica: el coste del hardware SO-100 y la licencia Apache-2.0 lo hacen adecuado para prácticas de aprendizaje por imitación, análisis de action chunking y estudio del ensamblado temporal de acciones.
- Estudio de robustez y distribución fuera de entrenamiento: con solo 51 episodios, es un caso útil para medir degradación al variar posición del bolígrafo, iluminación, fondo o presencia de distractores, y para documentar la tasa de éxito en cada condición.
- Módulo de bajo nivel en una arquitectura jerárquica: un planificador de alto nivel (por ejemplo, un VLM) puede invocar esta política cuando la subtarea coincida exactamente con la tarea entrenada; fuera de ese conjunto de subtareas, la política no está condicionada por lenguaje y no responderá a la instrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con la indicación explícita de que no se han proporcionado resultados en robot real, por lo que no existe tasa de éxito, número de ensayos ni comparación cuantitativa con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 207 MB (≈103 MB en fp16). Sumando activaciones de dos imágenes de 480x640 más el transformer, la estimación razonable de consumo total se sitúa en 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente. En la práctica, RTX 3060, RTX 4060, RTX 4090, A100 o H100 sobran para esta carga; el modelo no necesita aceleradores de centro de datos.
- Cabe en GPU de consumo: sí, en modelos como GTX 1650, GTX 1060 6 GB, RTX 3050, RTX 3060 o superiores. También puede ejecutarse en CPU, con latencia mayor y probable incumplimiento del ciclo de control a 30 FPS.
- Opciones de despliegue: el camino documentado es el CLI de LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para entrenamiento). No se documentan exportaciones a ONNX, TensorRT, GGUF, vLLM, TGI, llama.cpp ni Ollama, que en cualquier caso no aplican a este tipo de política.
- Latencia y throughput: no disponibles. Como referencia de requisito, los datos se grabaron a 30 FPS, de modo que un bucle de control a esa frecuencia exige inferencias por debajo de aproximadamente 33 ms por paso.

## Comparativa con modelos similares

| Modelo | Familia | Parámetros | Licencia | Condicionamiento | Disponibilidad |
|---|---|---|---|---|---|
| `Swinter1/my_policy` | ACT (transformer + CVAE, action chunking) | 51,7 M | Apache-2.0 | Tarea única, sin lenguaje | Hugging Face Hub vía LeRobot; 0 descargas |
| Diffusion Policy | Política visomotora basada en modelos de difusión | no disponible en la información proporcionada | no disponible en la información proporcionada | Tarea única por política, sin lenguaje | Implementación disponible en LeRobot y repositorio original de los autores |
| SmolVLA | Modelo visión-lenguaje-acción | no disponible en la información proporcionada | no disponible en la información proporcionada | Múltiples tareas condicionadas por lenguaje | Hugging Face Hub vía LeRobot |

La comparación cuantitativa no es posible: esta política no publica evaluaciones y los modelos alternativos no aportan cifras en la información disponible. A nivel estructural, la diferencia relevante es que ACT es una política ligera y de tarea única, mientras que las propuestas VLA aceptan instrucciones en lenguaje natural y cubren múltiples tareas a cambio de un tamaño y unos requisitos de cómputo mayores.

## Limitaciones y advertencias

- Tarea única: el modelo solo ha visto dos variantes de la misma instrucción ("coger el bolígrafo y dejarlo en el contenedor"). No generaliza a otras tareas sin reentrenamiento o ajuste fino.
- Encarnación única: entrenado para el robot `so_follower`. Usarlo en otro robot o con otra cinemática invalida las acciones predichas.
- Dependencia estricta de las cámaras: los nombres de las cámaras (`top_view`, `hand`) y sus resoluciones (480x640) deben coincidir con los del entrenamiento; cualquier cambio de montaje, encuadre o calibración degrada el comportamiento.
- Dataset pequeño: 51 episodios y 16.110 fotogramas a 30 FPS implican un riesgo alto de sobreajuste al entorno concreto de grabación (posición del objeto, iluminación, fondo, superficie).
- Sin evaluación publicada: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que no se puede afirmar ningún nivel de fiabilidad en producción.
- Fallos silenciosos: como toda política de imitación, ante entradas fuera de distribución genera acciones con apariencia válida aunque el resultado sea incorrecto; no incorpora detección de incertidumbre ni mecanismo de parada.
- Sin condicionamiento por lenguaje: pasar una instrucción distinta en la CLI no cambia el comportamiento del modelo de forma fiable.
- Sin historial de versiones: el repositorio se creó y actualizó con 8 segundos de diferencia, sin revisiones posteriores ni validación de la comunidad (0 descargas, 0 likes).
- Licencia: Apache-2.0 permite uso comercial y modificación, pero no se documenta la procedencia de los pesos preentrenados del backbone visual, si los hubiera, ni posibles obligaciones de atribución adicionales.
- Sesgos: no hay información sobre sesgos demográficos (no aplica, no procesa personas) ni sobre sesgos físicos más allá del entorno de captura descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Swinter1/my_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Swinter1/tidy_pen_merged_trimmed
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Swinter1/tidy_pen_merged_trimmed
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Búsqueda web: no se encontraron enlaces relevantes al modelo; los resultados devueltos corresponden a foros y descargas de software sin relación con robótica ni con ACT.
