# SteveNguyen/sugarcube_in_mug_2cam_pi05_step20000

## Resumen

SteveNguyen/sugarcube_in_mug_2cam_pi05_step20000 es una política robótica de tipo Vision-Language-Action (VLA) publicada en HuggingFace por el usuario SteveNguyen. Se trata de un ajuste fino del modelo base lerobot/pi05_base, que a su vez implementa π₀.₅ (Pi05), el modelo VLA de Physical Intelligence concebido para generalización en entornos abiertos. La política resultante tiene 4.143.404.816 parámetros (unos 4,14 mil millones) y se distribuye en formato safetensors con licencia Apache 2.0.

El modelo resuelve una tarea de manipulación concreta: introducir un terrón de azúcar en una taza ("put the sugar cube in the mug"). Se ha entrenado por imitación con 150 episodios y 23.046 fotogramas grabados a 50 FPS sobre un robot de tipo grabette con dos cámaras (cam0 y cam1) a resolución 360x480. La política consume las dos imágenes y un vector de estado de 2 dimensiones, y produce un vector de acción de 11 dimensiones.

Su relevancia es doble: por un lado, ejemplifica el flujo de trabajo de LeRobot 0.6.1 para ajustar políticas VLA de gran tamaño sobre datos propios; por otro, es un caso reproducible de adaptación de π₀.₅ a un hardware y una tarea específicos. Como contrapartida, el autor no ha publicado resultados de evaluación ni tasas de éxito, por lo que el rendimiento real sobre el robot no está cuantificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); derivada de π₀.₅ (Physical Intelligence) e implementada en LeRobot a partir del repositorio OpenPI |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio distribuye pesos en safetensors y no documenta variantes GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | no disponible; la política acepta una instrucción de tarea en lenguaje natural (el ejemplo de la model card está en inglés), pero no se declara cobertura multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Tipo de modelo | política de robótica (imitation learning), pipeline `robotics` |
| Modelo base | lerobot/pi05_base |
| Tarea entrenada | "put the sugar cube in the mug" |
| Robot | tipo `grabette` |
| Cámaras | cam0 y cam1, 360x480 por imagen |
| Entradas | `observation.images.cam0` (3, 360, 480), `observation.images.cam1` (3, 360, 480), `observation.state` (2,) |
| Salidas | `action` (11,) |
| Dataset de entrenamiento | SteveNguyen/sugarcube_in_mug_graspproj_2cam (150 episodios, 23.046 fotogramas, 50 FPS) |
| Tamaño del repositorio | 9,4 GB |
| Versión de LeRobot | 0.6.1 |
| Fecha de publicación | 18 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card describe el modelo como una política VLA derivada de π₀.₅ de Physical Intelligence, pensada para generalizar a entornos y situaciones no vistos durante el entrenamiento, y señala que la implementación de LeRobot es una adaptación del repositorio OpenPI. No se detalla en la información disponible la composición interna del modelo (backbone de visión-lenguaje, mecanismo de generación de acciones ni número de tokens de contexto), por lo que esos datos quedan como no disponibles. El recuento real de parámetros, 4.143.404.816, procede de los pesos en safetensors publicados en el repositorio.

El ajuste fino se realizó sobre el checkpoint lerobot/pi05_base con 20.000 pasos de entrenamiento, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 1000, usando LeRobot 0.6.1. El conjunto de datos consta de 150 episodios y 23.046 fotogramas capturados a 50 FPS para una única tarea de manipulación con dos cámaras y un estado propioceptivo de 2 dimensiones. No se documenta el uso de RLHF, DPO ni de ningún otro método de alineación posterior; se trata de aprendizaje por imitación supervisado.

## Capacidades

- Generación de acciones robóticas de 11 dimensiones a partir de observaciones visuales y propioceptivas. No es un modelo generador de texto.
- Percepción visual con dos cámaras simultáneas a 360x480 píxeles por imagen.
- Condicionamiento por instrucción de tarea en lenguaje natural, limitado a la tarea para la que fue entrenado.
- Ejecución end-to-end de una política de imitación, sin planificación explícita ni módulos intermedios documentados.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidad especial: modelo VLA (visión-lenguaje-acción) derivado de π₀.₅, orientado según su autor original a la generalización en entornos nuevos; el grado de generalización de este ajuste concreto no está medido.

## Casos de uso

- Automatización de pick-and-place de laboratorio: la política está entrenada específicamente para colocar un terrón de azúcar en una taza, por lo que puede desplegarse directamente en un banco de pruebas con un robot grabette y dos cámaras para repetir esa maniobra.
- Punto de partida para ajustes finos adicionales: al derivar de lerobot/pi05_base y estar ya adaptada a un robot concreto, sirve como inicialización para entrenar tareas relacionadas con el mismo hardware y la misma disposición de cámaras.
- Investigación en aprendizaje por imitación: con 150 episodios y 23.046 fotogramas documentados, es un caso reproducible para estudiar el efecto del número de episodios, la tasa de aprendizaje o el número de pasos en el éxito de una política VLA.
- Evaluación de robustez visual: las dos cámaras permiten analizar cómo afectan a la política cambios de iluminación, posición de los objetos o presencia de distractores en el campo de visión.
- Docencia y formación en robótica: sirve como ejemplo completo del flujo de LeRobot 0.6.1 (grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) para cursos y talleres.
- Demostraciones en ferias y presentaciones: el comando `lerobot-rollout --strategy.type=base` permite ejecutar la política sin grabar episodios durante un tiempo acotado (`--duration=60`), lo que encaja en demostraciones en vivo.
- Recolección de datos asistida: ejecutando el rollout con grabación de episodios se pueden generar trayectorias adicionales para ampliar el dataset original o comparar la política entrenada con teleoperación humana.
- Verificación de infraestructura robótica: la necesidad de que los nombres de cámara coincidan exactamente con las claves de observación (`observation.images.cam0`, `observation.images.cam1`) lo convierte en una prueba útil para validar calibración, puertos y resolución de un montaje nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica: "No evaluation results have been provided for this policy yet", y deja comentada una plantilla para registrar ensayos y tasas de éxito por tarea. Tampoco se incluyen métricas de latencia, frecuencia de control efectiva ni tasa de éxito en el robot.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del recuento de parámetros (4,14 mil millones) y no confirmada por el autor: en bf16/fp16, en torno a 8,3 GB solo de pesos (10-12 GB con activaciones y búferes en la práctica); en fp32, unos 16,6 GB; en int8, unos 4,1 GB; en int4, unos 2,1 GB.
- GPU recomendadas: para inferencia en bf16, una RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 o L40S es suficiente. En tarjetas de 8 GB el despliegue en bf16 queda muy ajustado y requeriría cuantización no documentada por el autor.
- Cabe en GPU de consumo: sí, en modelos de 24 GB (RTX 3090, RTX 4090) con holgura en bf16; en 16 GB (RTX 4080, RTX 4070 Ti Super) es viable pero con poco margen; por debajo de 12 GB no hay una ruta de cuantización documentada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento, con `--policy.device=cuda`), sobre PyTorch. No se documentan soportes en vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje servible con esos formatos.
- Requisitos adicionales de despliegue: un robot de tipo grabette, dos cámaras configuradas con los nombres y la resolución esperados, puerto de robot correcto y calibración previa. El entrenamiento se ejecutó con una única GPU CUDA según la configuración de ejemplo.
- Latencia y throughput: no disponibles. El dataset se grabó a 50 FPS, pero no se especifica la frecuencia de control alcanzada en inferencia ni el tiempo de respuesta por acción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SteveNguyen/sugarcube_in_mug_2cam_pi05_step20000 | 4.143.404.816 | no disponible | Apache 2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) | Ajuste fino de tarea única sobre robot grabette con dos cámaras |
| lerobot/pi05_base | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | HuggingFace | Modelo base del que deriva este ajuste; sin datos de tarea ni de evaluación |
| Otras políticas del ecosistema LeRobot (ACT, Diffusion Policy, SmolVLA y similares) | no disponible | no aplica | variable según modelo | HuggingFace | Alternativas de la misma categoría funcional (políticas de imitación), pero la información proporcionada no incluye sus especificaciones ni cifras comparables |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Ausencia de evaluación: el autor no ha publicado ninguna tasa de éxito, número de ensayos ni condiciones de prueba, por lo que el rendimiento real es desconocido.
- Especialización extrema: el modelo está entrenado para una única tarea ("put the sugar cube in the mug"), un único tipo de robot (grabette) y una disposición concreta de dos cámaras. No cabe esperar generalización a otras tareas o montajes sin un nuevo ajuste fino.
- Dependencia del dataset: solo 150 episodios y 23.046 fotogramas, lo que limita la variedad de posiciones de objeto, iluminación y configuraciones cubiertas. La propia model card advierte de que factores que alteran la dificultad (nuevas posiciones de los objetos, iluminación, distractores o un robot distinto del mismo tipo) deben tenerse en cuenta al evaluar.
- Riesgo de acciones incorrectas: al ser una política de imitación, puede producir trayectorias erráticas o fallidas fuera de la distribución de entrenamiento; no existe un mecanismo de abstención ni de verificación documentado.
- Restricciones de licencia: los metadatos indican Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base lerobot/pi05_base y de los materiales de Physical Intelligence antes de un despliegue comercial.
- Requisitos de integración estrictos: los nombres de cámara deben coincidir con las claves de observación del entrenamiento y el robot debe estar calibrado; un desajuste invalida la política.
- Idiomas y sesgos: no se documenta cobertura lingüística ni análisis de sesgos. Al no generar texto, los riesgos típicos de alucinación lingüística no aplican del mismo modo, pero sí el riesgo de ejecutar acciones físicas incorrectas.
- Madurez y soporte: el repositorio registra 0 descargas y 0 likes, sin validación por parte de la comunidad ni mantenimiento declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SteveNguyen/sugarcube_in_mug_2cam_pi05_step20000
- Dataset de entrenamiento: https://huggingface.co/datasets/SteveNguyen/sugarcube_in_mug_graspproj_2cam
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SteveNguyen/sugarcube_in_mug_graspproj_2cam
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Guía de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio OpenPI de Physical Intelligence (citado en la model card; la URL no se proporciona en la información disponible).
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo.
