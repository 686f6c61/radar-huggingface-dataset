# SteveNguyen/red_cube_blue_box_pi05_step20000

## Resumen

`red_cube_blue_box_pi05_step20000` es un fine-tuning de política robótica publicado por el usuario SteveNguyen sobre el modelo base `lerobot/pi05_base`, que implementa π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence. El modelo resuelve una tarea concreta de manipulación: coger un cubo rojo y depositarlo en una caja azul ("pick the red cube and place it in the blue box"), entrenado mediante aprendizaje por imitación sobre un dataset propio de 226 episodios y 42.485 fotogramas grabados a 50 FPS con un robot de tipo `grabette` y una única cámara (`cam0`).

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo completo de LeRobot para adaptar un VLA preentrenado a un robot y una tarea específicos con un presupuesto de entrenamiento modesto (20.000 pasos, batch 32, learning rate 2,5e-5). Por otro, sirve como ejemplo de política de imitación de extremo a extremo: consume una imagen RGB de 360×480 y un vector de estado de 2 dimensiones, y produce un vector de acción de 11 dimensiones a partir del cual se controla el robot.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y se distribuye en formato safetensors dentro de un repositorio de 9,4 GB, con licencia Apache 2.0. No es un modelo de propósito general: su utilidad está acotada al robot, la cámara y la distribución de escenas con los que fue entrenado, y no se han publicado resultados de evaluación en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), implementación LeRobot adaptada de OpenPI |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (política de imitación; no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del VLA π₀.₅ de Physical Intelligence, cuya implementación en LeRobot está adaptada del repositorio OpenPI. π₀.₅ es un modelo visión-lenguaje-acción diseñado para generalizar a entornos y situaciones no vistos durante el entrenamiento; parte de π₀ y lo evoluciona hacia una mayor generalización en mundo abierto. La información disponible no detalla la composición interna de la arquitectura (número de capas, mecanismo de atención, encoder visual, etc.), por lo que esos datos se marcan como no disponibles.

El entrenamiento es un fine-tuning supervisado por imitación sobre el dataset `SteveNguyen/red_cube_blue_box_graspproj`: 226 episodios, 42.485 fotogramas a 50 FPS, con la tarea única "pick the red cube and place it in the blue box". La configuración reportada es de 20.000 pasos, batch size 32, optimizador AdamW, learning rate 2,5e-5, semilla 1000 y LeRobot 0.6.1. No se indica en la información disponible si hubo RLHF, DPO ni otras fases de alineamiento; al tratarse de una política de imitación, lo esperable es entrenamiento supervisado sobre demostraciones, pero no se confirma explícitamente.

Las entradas de la política son `observation.images.cam0` (VISUAL, forma `(3, 360, 480)`) y `observation.state` (STATE, forma `(2,)`). La salida es `action` (ACTION, forma `(11,)`). El robot objetivo es de tipo `grabette` y solo se usa una cámara.

## Capacidades

- Control robótico de manipulación para una tarea concreta: coger un cubo rojo y colocarlo en una caja azul.
- Política de imitación de extremo a extremo: mapea imagen RGB y estado del robot a un vector de acción de 11 dimensiones.
- Ejecución en tiempo real sobre hardware `grabette` mediante `lerobot-rollout`, con control de duración de la ejecución.
- Entrada visual única (`cam0`) y estado proprioceptivo de 2 dimensiones.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión general, audio ni modo de pensamiento. Es un modelo de robótica, no un LLM de propósito general.
- No se documentan capacidades de generalización más allá de la tarea y el entorno de entrenamiento.

## Casos de uso

- Automatización de una celda de pick-and-place: el modelo ejecuta la secuencia de coger el cubo rojo y dejarlo en la caja azul sobre un robot `grabette`, integrándose en una línea de montaje o laboratorio de pruebas con `lerobot-rollout`.
- Prototipado rápido de políticas de imitación: sirve como referencia de un fine-tuning completo de π₀.₅ con 20.000 pasos y un dataset de 226 episodios, útil para equipos que quieran replicar el flujo con sus propios objetos.
- Docencia y formación en robótica de aprendizaje: el repositorio incluye comandos de entrenamiento y despliegue, lo que permite usarlo como ejemplo reproducible en cursos de imitation learning.
- Validación de hardware y calibración: al tener entradas y salidas bien definidas (imagen 360×480, estado de 2 dimensiones, acción de 11 dimensiones), permite comprobar la cadena cámara-robot-control antes de entrenar políticas propias.
- Benchmark interno de infraestructura: útil para medir latencia y throughput de inferencia de un VLA de ~4,14 mil millones de parámetros en GPUs concretas antes de escalar a tareas más complejas.
- Base para fine-tuning posterior: al derivar de `lerobot/pi05_base` y estar bajo Apache 2.0, puede servir como punto de partida para adaptar la política a variantes de la tarea (otros colores, posiciones o contenedores), aunque requeriría nuevos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo de ~4,14 mil millones de parámetros en precisión completa (fp32) ocuparía del orden de 16,6 GB solo en pesos; en bf16/fp16, del orden de 8,3 GB. Estas cifras son estimaciones aritméticas a partir del número de parámetros, no datos publicados.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño de pesos en bf16 (~8,3 GB) podría caber en GPUs de consumo con 12-16 GB o más, pero no hay validación publicada.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no son el marco habitual para políticas VLA de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SteveNguyen/red_cube_blue_box_pi05_step20000` | 4.143.404.816 | no aplica | Pick-and-place de cubo rojo en caja azul (robot `grabette`) | Apache 2.0 | HuggingFace, 0 descargas |
| `lerobot/pi05_base` | no disponible en la información | no aplica | VLA base π₀.₅ para fine-tuning | no disponible en la información | HuggingFace (modelo base) |
| π₀.₅ de Physical Intelligence (OpenPI) | no disponible en la información | no aplica | VLA de generalización en mundo abierto | no disponible en la información | Repositorio OpenPI |

La comparación se limita a los modelos citados en la información disponible; no se dispone de datos de rendimiento comparativo ni de otros fine-tunings equivalentes.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("pick the red cube and place it in the blue box") y un único robot (`grabette`) con una única cámara (`cam0`); no se espera que funcione en otras configuraciones sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni ensayos documentados, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia del entorno: cambios en iluminación, posiciones de objetos, distractores o una cámara distinta pueden degradar el comportamiento; la model card no documenta robustez frente a estas variaciones.
- Sesgos: no documentados. Al entrenarse con un dataset propio y reducido (226 episodios), puede heredar sesgos de las demostraciones (posiciones, velocidades, condiciones de la escena).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erráticas o fuera de distribución ante entradas no vistas.
- Idiomas: no aplica; no es un modelo de lenguaje.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y el modelo original π₀.₅ deben verificarse por separado; la información disponible no detalla sus términos.
- Caveat de producción: requiere calibración de robot y cámaras, y que los nombres de cámara coincidan con las claves de observación del entrenamiento (`observation.images.cam0`).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SteveNguyen/red_cube_blue_box_pi05_step20000
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/SteveNguyen/red_cube_blue_box_graspproj
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SteveNguyen/red_cube_blue_box_graspproj
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: no disponible como URL en la información (citado como "open-source OpenPI repository")
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
