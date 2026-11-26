# SteveNguyen/put_red_cube_green_box_chunkrel_pi05_step20000

## Resumen

Este repositorio contiene una política de robótica basada en π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado originalmente por Physical Intelligence y adaptado a la librería LeRobot de Hugging Face. Se trata de un ajuste fino (fine-tune) del modelo base `lerobot/pi05_base` orientado a una tarea concreta de manipulación: "poner el cubo rojo en la caja verde". El autor del ajuste es SteveNguyen y el modelo se distribuye bajo licencia Apache 2.0.

El modelo consume observaciones multimodales (una imagen de cámara a resolución 3×360×480 y un vector de estado de 2 dimensiones) y produce un vector de acción de 8 dimensiones. Con 4.143.404.816 parámetros y un tamaño de repositorio de 9,4 GB en formato safetensors, es un modelo de gran tamaño para el contexto de políticas robóticas, lo que refleja la arquitectura VLA subyacente de Pi05.

Su relevancia es acotada y específica: no es un modelo de propósito general, sino una política entrenada mediante aprendizaje por imitación sobre un dataset propio de 177 episodios y 31.496 fotogramas a 30 FPS, capturados con un robot de tipo `grabette` y una única cámara (`cam0`). Resulta útil como ejemplo reproducible de ajuste fino de Pi05 con LeRobot y como política lista para desplegar en la tarea concreta para la que fue entrenada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | grabette |
| Cámaras | cam0 |
| Entrada visual | observation.images.cam0, shape (3, 360, 480) |
| Entrada de estado | observation.state, shape (2,) |
| Salida de acción | action, shape (8,) |
| Tamaño del repositorio | 9,4 GB |
| Librería | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence diseñado para generalización en entornos abiertos, que evoluciona π₀ para generalizar a situaciones y entornos no vistos durante el entrenamiento. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La información disponible no detalla la arquitectura interna (composición de bloques, mecanismo de atención, integración visión-lenguaje-acción), por lo que los detalles estructurales más allá de su naturaleza VLA deben considerarse no disponibles.

El entrenamiento se realizó por ajuste fino supervisado (aprendizaje por imitación) sobre el dataset `SteveNguyen/put_red_cube_green_box_graspproj_chunkrel`, compuesto por 177 episodios y 31.496 fotogramas a 30 FPS para la tarea "put the red cube in the green box". La configuración reportada incluye 20.000 pasos de entrenamiento, tamaño de lote de 32, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 1000, ejecutado con LeRobot 0.6.1. No se especifica el número de tokens de entrenamiento, la composición del dataset más allá de la tarea, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en este tipo de políticas de imitación).

## Capacidades

- Control robótico de manipulación: genera acciones de 8 dimensiones a partir de observaciones visuales y de estado para ejecutar la tarea de colocar un cubo rojo en una caja verde.
- Percepción visual mono-cámara: procesa imágenes de una única cámara (`cam0`) a resolución 360×480.
- Fusión visión-lenguaje-acción: al estar basado en Pi05, hereda la capacidad del modelo base de integrar instrucciones en lenguaje natural con percepción visual y generación de acciones.
- Condicionamiento por tarea en lenguaje natural: la ejecución se invoca con el texto de la tarea (`--task="put the red cube in the green box"`).
- Aprendizaje por imitación: política entrenada para reproducir demostraciones, no para razonamiento simbólico general.
- No se dispone de información sobre soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, modo de razonamiento explícito, visión general, audio u otras capacidades del modelo base.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta directamente la tarea de colocar el cubo rojo en la caja verde sobre un robot `grabette`, sirviendo como base para experimentos de manipulación reproducibles.
- Evaluación de pipelines de ajuste fino con LeRobot: el repositorio documenta el comando `lerobot-train` y la configuración exacta, por lo que es útil como referencia para reproducir el flujo de entrenamiento de Pi05 sobre un dataset propio.
- Despliegue de referencia con `lerobot-rollout`: permite poner en marcha la política en hardware real con un comando único, útil para validar la integración robot-cámara-política antes de entrenar modelos propios.
- Docencia y formación en aprendizaje por imitación: con 177 episodios y una tarea sencilla, es un caso de estudio manejable para explicar el ciclo completo de grabación de datos, entrenamiento y despliegue.
- Base para ajustes posteriores: al derivar de `lerobot/pi05_base` y estar bajo Apache 2.0, puede reutilizarse como punto de partida para tareas de manipulación relacionadas (por ejemplo, variantes de colocación de objetos).
- Pruebas de robustez y generalización: permite evaluar cómo se comporta una política VLA ajustada con pocos datos ante cambios de posición, iluminación o distractores, aunque el autor no ha publicado resultados de evaluación.
- Integración en entornos de simulación o gemelos digitales: la interfaz de observación y acción (imagen + estado de 2 dimensiones → acción de 8 dimensiones) puede conectarse a simuladores compatibles para pruebas previas al despliegue físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que la tabla de evaluación real en robot está vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4.143 millones de parámetros en FP16 requiere aproximadamente 8,3 GB solo para los pesos, a lo que hay que sumar el estado del runtime, los búferes de imagen y la sobrecarga de la librería; en FP32 serían unos 16,6 GB. Estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que funcione en GPUs de consumo con 16 GB o más de VRAM (por ejemplo, RTX 4080/4090) en FP16, y en GPUs de datacenter (A100, H100) sin problema, pero no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Probablemente sí en FP16 en GPUs con 16 GB o más, según la estimación anterior; no confirmado por el autor.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (comando documentado en la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son el marco habitual para políticas VLA de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SteveNguyen/put_red_cube_green_box_chunkrel_pi05_step20000 | 4.143.404.816 | no disponible | Manipulación (cubo rojo → caja verde) | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la información proporcionada | no disponible | VLA base de propósito general | no disponible en la información proporcionada | Hugging Face |
| π₀.₅ (Pi05) original de Physical Intelligence | no disponible en la información proporcionada | no disponible | VLA de generalización en entornos abiertos | no disponible en la información proporcionada | Blog y repositorio OpenPI |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada exclusivamente para la tarea "put the red cube in the green box" con un robot `grabette` y una cámara `cam0`; no debe esperarse generalización a otras tareas, objetos o configuraciones de hardware.
- Sin evaluación publicada: el autor no ha reportado tasas de éxito ni pruebas en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del hardware: los nombres e índices de cámara y el puerto del robot deben coincidir exactamente con los de entrenamiento; cualquier cambio en la configuración de sensores puede degradar el comportamiento.
- Dataset pequeño: 177 episodios y 31.496 fotogramas son una base limitada, lo que aumenta el riesgo de sobreajuste al entorno de captura y de baja robustez ante cambios de iluminación, posición o distractores.
- Sesgos: no se documentan sesgos específicos, pero al derivar de un modelo base VLA puede heredar sesgos visuales o de lenguaje del modelo original; no hay información al respecto.
- Riesgo de alucinación: en el contexto de políticas de acción, el riesgo se traduce en acciones incorrectas o inseguras ante situaciones fuera de distribución; no hay análisis publicado.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `lerobot/pi05_base` y del modelo original Pi05, no detallada en la información disponible.
- Idiomas: no se especifican idiomas soportados; la instrucción de tarea está en inglés.
- Sin cuantizaciones documentadas: no se ofrecen versiones GGUF u otras, lo que limita el despliegue en hardware de bajos recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SteveNguyen/put_red_cube_green_box_chunkrel_pi05_step20000
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/SteveNguyen/put_red_cube_green_box_graspproj_chunkrel
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SteveNguyen/put_red_cube_green_box_graspproj_chunkrel
- Blog de π₀.₅ (Pi05): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de Pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
