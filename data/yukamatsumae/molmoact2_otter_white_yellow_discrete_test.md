# yukamatsumae/molmoact2_otter_white_yellow_discrete_test

## Resumen

`yukamatsumae/molmoact2_otter_white_yellow_discrete_test` es una política de robótica entrenada y publicada con LeRobot, la librería de Hugging Face para aprendizaje por imitación. No es un modelo de lenguaje: su salida son acciones de control para un robot, generadas a partir de observaciones del entorno. El repositorio contiene 5.442.196.272 parámetros (unos 5,44 mil millones), lo que lo sitúa en un rango de tamaño inusualmente grande para una política de manipulación, y los pesos están en formato safetensors con un total de 10,9 GB.

El autor es el usuario `yukamatsumae` y el modelo se ha entrenado sobre un dataset propio de robótica, `yukamatsumae/WhiteYellow_20260910_005531`, cuyo nombre sugiere un escenario de manipulación con objetos blancos y amarillos. La model card es la plantilla autogenerada por LeRobot y no documenta arquitectura, datos de entrenamiento ni hiperparámetros más allá de la licencia Apache 2.0 y la etiqueta `pipeline_tag: robotics`.

Es relevante ahora porque forma parte de la ola de políticas de robot de gran tamaño (junto con propuestas como SmolVLA, pi0 o GR00T N1) que trasladan las arquitecturas de los modelos fundacionales al control robótico. El sufijo `_test` del nombre, junto con las cero descargas y cero likes en el momento de la consulta, indica que se trata de un artefacto experimental de validación, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no documenta la arquitectura; el nombre apunta a la familia denominada "molmoact2") |
| Parametros totales | 5.442.196.272 (5,44 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de ventana de tokens de un LLM; la política opera sobre observaciones del entorno) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se listan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (modelo de robótica; no se declara soporte idiomático) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 10,9 GB, compatible con aproximadamente 2 bytes por parámetro, es decir bf16 o fp16) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna. La model card generada por LeRobot incluye literalmente el marcador `_Model type not recognized — please update this template._`, lo que confirma que el autor no la completó. Lo único verificable desde los metadatos es el número de parámetros (5.442.196.272) y que la política se entrenó con el flujo de trabajo de LeRobot sobre el dataset `yukamatsumae/WhiteYellow_20260910_005531`. El identificador `molmoact2` sugiere una variante de las políticas de tipo ACT (Action Chunking Transformer) vinculada de algún modo a la familia Molmo, pero esto es una inferencia a partir del nombre y no está confirmado por el autor.

La model card sí documenta el procedimiento de entrenamiento estándar de LeRobot: `lerobot-train` con `--policy.type=act`, dispositivo CUDA, registro opcional en Weights & Biases y guardado de checkpoints en `outputs/train/<repo>/checkpoints/`. No se indica el número de tokens o frames de entrenamiento, la composición del dataset, ni si hubo fases de ajuste fino con RLHF, DPO o aprendizaje por refuerzo. Tampoco se documentan innovaciones técnicas concretas como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Control robótico por imitación: genera secuencias de acción (action chunks) a partir de observaciones, siguiendo el pipeline de políticas de LeRobot.
- Ejecución sobre robots compatibles con LeRobot, con ejemplo explícito de evaluación sobre un `so100_follower` mediante `lerobot-record`.
- Entrenamiento reproducible desde cero con `lerobot-train` sobre un dataset propio en formato LeRobot.
- Registro de episodios de evaluación: la configuración de ejemplo prefija el dataset con `eval_` y genera diez episodios por defecto.
- Tool calling / function calling: no disponible (no es una capacidad aplicable a una política de robótica).
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible.
- Capacidades multilingües: no disponibles.
- Modo "thinking", visión o audio como capacidades declaradas: no disponibles. La política consume observaciones del entorno, pero el autor no detalla la modalidad de entrada (cámaras, propriocepción, etc.).

## Casos de uso

- Manipulación de objetos blancos y amarillos en laboratorio: es el escenario para el que se entrenó, según el nombre del dataset (`WhiteYellow_20260910_005531`). Sirve para reproducir la tarea de recogida y colocación de piezas con esas características visuales.
- Evaluación comparativa de políticas en LeRobot: al publicarse como checkpoint estándar de la librería, permite medir acciones vs. ground truth con `lerobot-record` y comparar contra otras políticas entrenadas sobre el mismo dataset.
- Base para ajuste fino en tareas similares: al ser Apache 2.0 y estar en safetensors, se puede reentrenar con `lerobot-train` sobre datasets nuevos de la misma familia de robot.
- Banco de pruebas de teleoperación: el flujo `so100_follower` sugiere su uso en configuraciones de bajo coste (SO-100/SO-101) para validar la política con teleoperador antes de desplegarla.
- Recolección de datos aumentada: ejecutar la política en modo autónomo para generar episodios adicionales y ampliar el dataset original de blanco y amarillo.
- Docencia e investigación en aprendizaje por imitación: es un ejemplo práctico de política de 5,44 mil millones de parámetros entrenada de extremo a extremo con LeRobot, útil para estudiar el escalado de parámetros en control robótico.
- Integración en cadenas de CI de robótica: dado que el repositorio incluye checkpoints estándar y comandos de evaluación reproducibles, se puede automatizar una prueba de regresión de la política tras cada reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción, comparaciones con ACT o Diffusion Policy, ni ningún otro dato cuantitativo de evaluación. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11-13 GB en bf16/fp16, calculado a partir de los 5,44 mil millones de parámetros (los pesos en el repositorio ocupan 10,9 GB). Son estimaciones derivadas del tamaño, no datos publicados por el autor.
- VRAM estimada en cuantización: no disponible. El repositorio no publica variantes int8, int4 ni GGUF, por lo que cualquier cuantización requeriría convertirla por cuenta propia.
- GPU recomendadas: una GPU con 16 GB o más, como RTX 4090, RTX 4080, A100 40 GB o H100. Con 12 GB (RTX 3060 12 GB, RTX 4070) el margen es muy ajustado para bf16 y probablemente insuficiente si se añaden activaciones y buffers de inferencia.
- Cabe en GPU de consumo: sí, en tarjetas de gama alta con 16 GB o más de VRAM (RTX 4090, RTX 5090, RTX 4080). En 8-12 GB no es viable sin cuantización, que no está publicada.
- Opciones de despliegue: pila de LeRobot sobre PyTorch (inferencia vía `lerobot-record` con `--policy.path`). No aplica vLLM, TGI ni Ollama, porque no es un modelo de lenguaje. `llama.cpp` tampoco es aplicable sin conversión previa a GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, tiempo de inferencia por chunk de acciones ni velocidad de entrenamiento.

## Comparativa con modelos similares

Comparación cualitativa dentro de la categoría de políticas de manipulación entrenadas con LeRobot. Los recuentos de parámetros de los comparadores son referencias públicas y deben verificarse antes de citarlos.

| Modelo | Parametros (referencia publica) | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|
| molmoact2_otter_white_yellow_discrete_test | 5,44 mil millones | no disponible | Apache 2.0 | Hugging Face, 0 descargas, artefacto de test |
| SmolVLA (Hugging Face) | del orden de cientos de millones | politica VLA para LeRobot | Apache 2.0 | publica y ampliamente usada |
| pi0 (Physical Intelligence) | del orden de miles de millones | politica VLA de proposito general | licencia propia, verificar | publicada con condiciones |
| GR00T N1 (NVIDIA) | del orden de miles de millones | modelo fundacional robotico | licencia propia, verificar | publicada con condiciones |

No hay datos de rendimiento comparables para este modelo, de modo que la tabla solo refleja tamaño, licencia y disponibilidad, no calidad de política.

## Limitaciones y advertencias

- Modelo de test: el sufijo `_test` y el estado del repositorio (0 descargas, 0 likes, creado y actualizado el mismo día) indican que es un artefacto de validación, no una versión estable.
- Documentación insuficiente: la model card es la plantilla autogenerada por LeRobot y no describe la arquitectura, los datos de entrenamiento ni las métricas.
- Especialización estrecha: el entrenamiento está ligado al dataset `WhiteYellow_20260910_005531`, aparentemente centrado en objetos blancos y amarillos. Es razonable esperar un rendimiento pobre fuera de esa distribución de colores, iluminación y geometría de escena, aunque no hay evaluación publicada que lo confirme.
- Sobresalimentación frente al robot objetivo: la evaluación de ejemplo usa `so100_follower`. La política puede no transferirse a otras cinemáticas o números de grados de libertad sin reentrenamiento.
- Riesgo de sobreajuste: con 5,44 mil millones de parámetros y un único dataset de apariencia limitada, el sobreajuste es un riesgo plausible; no se publican curvas de validación ni métricas de generalización.
- Alucinación: en el sentido de lenguaje natural no aplica; en control robótico el equivalente es la generación de trayectorias erróneas o inseguras, y no hay datos sobre tasas de fallo.
- Idiomas: no aplica, no es un modelo de texto.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte. Al reutilizar los pesos conviene citar el repositorio original.
- Seguridad en producción: al no publicarse límites de par ni validación de colisiones, cualquier despliegue real requiere capas externas de limitación de fuerzas y parada de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yukamatsumae/molmoact2_otter_white_yellow_discrete_test
- Dataset de entrenamiento: https://huggingface.co/datasets/yukamatsumae/WhiteYellow_20260910_005531
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
