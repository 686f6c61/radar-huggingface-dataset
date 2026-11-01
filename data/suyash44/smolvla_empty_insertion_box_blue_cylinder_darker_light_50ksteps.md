# Suyash44/smolvla_empty_insertion_box_blue_cylinder_darker_light_50ksteps

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación. Esta ficha concreta, publicada por el usuario Suyash44, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `Riccardo11/empty_insertion_box_blue_cylinder_darker_light`, orientado a la tarea específica de agarrar un cilindro azul con un robot bimanual de tipo `bi_so_follower`. El modelo consume tres flujos de cámara (frontal y dos muñecas) más el estado articular, y produce un vector de 12 acciones.

Con 450 millones de parámetros, SmolVLA está pensado para desplegarse en hardware de consumo, algo poco habitual en el espacio VLA, donde los modelos suelen superar los miles de millones de parámetros. Este checkpoint concreto se entrenó durante 50 000 pasos con un batch de 32 sobre 80 episodios (16 348 frames a 30 FPS), lo que lo convierte en un ejemplo típico de política de imitación de nicho: altamente especializada, de código abierto (Apache 2.0) y reproducible con la CLI de LeRobot.

Su relevancia radica en dos factores. Primero, demuestra el flujo completo de fine-tuning de un VLA sobre un dataset pequeño y una tarea concreta, algo accesible para laboratorios con recursos limitados. Segundo, al estar publicada bajo Apache 2.0 y con pesos en safetensors, permite inspeccionar, modificar y redistribuir la política sin restricciones comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA; no se detalla la composición interna en la información disponible |
| Parámetros totales | 450 046 176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantización declarada) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | bi_so_follower (bimanual) |
| Cámaras de entrada | front, left_wrist, right_wrist (3 × 480 × 640) |
| Dimensión de estado | (12,) |
| Dimensión de acción | (12,) |
| Librería | lerobot 0.6.1 |
| Tamaño del repositorio | 13.2 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina percepción visual multicámara con instrucciones en lenguaje natural para generar acciones motoras. La información disponible no detalla la composición interna (encoder visual, backbone de lenguaje, cabecera de acciones), pero el paper de referencia (arXiv:2506.01844) describe un diseño compacto orientado a despliegue en hardware de consumo. La política recibe tres imágenes RGB de 480×640 (cámara frontal y dos muñecas) junto con un vector de estado de 12 dimensiones, y emite un vector de acción también de 12 dimensiones, lo que corresponde a un robot bimanual con seis grados de libertad por brazo.

El entrenamiento se realizó por fine-tuning desde `lerobot/smolvla_base` sobre el dataset `Riccardo11/empty_insertion_box_blue_cylinder_darker_light`, compuesto por 80 episodios y 16 348 frames grabados a 30 FPS con la instrucción «grasp the blue cylinder». La configuración fue de 50 000 pasos, batch de 32, optimizador AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.1. No se especifica en la información disponible si hubo RLHF, DPO u otras fases de alineamiento; en el contexto de imitación robótica, el entrenamiento es típicamente supervisado sobre pares observación-acción.

## Capacidades

- Control robótico por imitación: genera trayectorias de acción de 12 dimensiones para un robot bimanual `bi_so_follower` a partir de observaciones visuales y de estado.
- Percepción visual multicámara: integra simultáneamente las vistas frontal, muñeca izquierda y muñeca derecha.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante un prompt textual («grasp the blue cylinder»).
- Ejecución de una tarea concreta de manipulación: agarre de un cilindro azul en un entorno con caja de inserción vacía.
- Despliegue en hardware de consumo: el tamaño de 450 M parámetros y el diseño SmolVLA apuntan a inferencia en GPUs no empresariales.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general, matemáticas, visión general o audio.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como punto de partida reproducible para estudiar cómo un VLA pequeño se adapta a una tarea de manipulación con solo 80 episodios, comparando hiperparámetros y estrategias de aumento de datos.
- Benchmark de políticas VLA compactas: usar este checkpoint como referencia de fine-tuning de SmolVLA en una tarea de agarre, midiendo éxito por ensayo y comparándolo con variantes entrenadas con otros datasets o número de pasos.
- Automatización de una celda de pick-and-place: desplegar la política en un robot bimanual para la tarea de agarre del cilindro azul en un entorno controlado, con las tres cámaras calibradas según la configuración de entrenamiento.
- Base para fine-tuning en tareas similares: reentrenar desde este checkpoint (o desde `lerobot/smolvla_base`) sobre nuevos datasets de agarre para acelerar la convergencia en objetos o posiciones distintas.
- Docencia y formación en robótica: ilustrar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) con un modelo de tamaño manejable y licencia permisiva.
- Prototipado en hardware de bajo presupuesto: validar la viabilidad de un VLA de 450 M parámetros en GPUs de consumo antes de escalar a modelos mayores o a entornos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet». No se dispone de tasas de éxito en robot real, ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 450 M parámetros en fp32, los pesos ocupan aproximadamente 1.8 GB; en fp16, unos 0.9 GB. A ello hay que sumar el coste de procesar tres imágenes de 480×640 y el estado, por lo que se recomienda al menos 4-8 GB de VRAM en la práctica.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar GPUs de consumo como RTX 3060, RTX 4060 o superiores; el paper de SmolVLA menciona despliegue en hardware de consumo, pero no se detallan modelos concretos.
- ¿Cabe en GPU de consumo? Sí, según la descripción del modelo base («can be deployed on consumer-grade hardware»), aunque no se enumeran GPUs concretas.
- Opciones de despliegue: LeRobot 0.6.1 mediante `lerobot-rollout` (estrategia `base`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la frecuencia del dataset, pero no se publican mediciones de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Suyash44/smolvla_empty_insertion_box_blue_cylinder_darker_light_50ksteps | 450 M | no disponible | Agarre de cilindro azul (bi_so_follower) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face |
| Políticas ACT / Diffusion Policy en LeRobot | no disponible | no disponible | Manipulación por imitación | variable según checkpoint | Hugging Face / LeRobot |

La información proporcionada no incluye datos de rendimiento de alternativas, por lo que la comparación se limita a parámetros, licencia y disponibilidad. No se dispone de comparaciones numéricas con otros VLA.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea «grasp the blue cylinder» sobre un robot `bi_so_follower` con tres cámaras concretas; no generaliza a otras tareas, objetos o configuraciones de robot sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de la configuración de hardware: los nombres y la calibración de las cámaras (`front`, `left_wrist`, `right_wrist`) y el puerto del robot deben coincidir con los del entrenamiento; cualquier desviación degrada el comportamiento.
- Dataset pequeño: 80 episodios y 16 348 frames son una base limitada; es probable que el modelo sea sensible a cambios de iluminación, posición de objetos o distractores, aunque no se documenta explícitamente.
- Riesgo de sobreajuste al entorno: al entrenarse sobre un único dataset con condiciones concretas, el rendimiento fuera de esas condiciones no está garantizado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece ninguna garantía por parte del autor; el modelo se distribuye «tal cual».
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea está en inglés.
- Sin información sobre sesgos: no se han publicado análisis de sesgos, y en el contexto robótico el riesgo principal es de fallo físico más que de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suyash44/smolvla_empty_insertion_box_blue_cylinder_darker_light_50ksteps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Riccardo11/empty_insertion_box_blue_cylinder_darker_light
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Riccardo11/empty_insertion_box_blue_cylinder_darker_light
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
