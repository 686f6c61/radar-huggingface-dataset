# WY1007/act_so101_pick_place

## Resumen

`WY1007/act_so101_pick_place` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario WY1007 en Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor entrenado con LeRobot 0.7.0 que, a partir de una imagen de cámara y del estado de las articulaciones, predice directamente comandos de acción para un robot tipo `so_follower` (SO-101). El modelo resuelve una única tarea concreta: recoger una goma de borrar y colocarla en un soporte.

El modelo tiene 51.668.614 parámetros y ocupa 0,2 GB en el repositorio, con pesos en formato safetensors. La entrada combina `observation.state` de dimensión 6 (estado de las articulaciones) con una imagen RGB de 480x640 desde una cámara superior (`observation.images.top`), y la salida es un vector de acción de dimensión 6. ACT predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución.

Su relevancia es acotada: se trata de una política de demostración entrenada con muy pocos datos (5 episodios, 4018 fotogramas a 30 FPS, 500 pasos de entrenamiento), publicada sin licencia declarada y sin resultados de evaluación. Es útil como referencia de flujo de trabajo con LeRobot y como ejemplo mínimo de entrenamiento ACT, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de un único fotograma más estado) |
| Tipos de cuantizacion | no disponible (pesos safetensors sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica en inglés: "Pick up the eraser and place it in a holder") |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `top` (una cámara RGB) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entrada visual | `observation.images.top`, shape `(3, 480, 640)` |
| Salida de accion | `action`, shape `(6,)` |
| Framework | LeRobot 0.7.0 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone visual (codificador de imagen) con un transformer que genera secuencias de acciones (chunks) en lugar de un único comando por paso. El modelo consume el estado articular de 6 dimensiones y una imagen de 480x640 procedente de la cámara superior, y emite un vector de acción de 6 dimensiones. Esta formulación por chunks mitiga el problema de acumulación de errores típico de las políticas paso a paso y produce movimientos más suaves.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset `WY1007/so101_place_pick_v3_20261124_123231`, compuesto por 5 episodios y 4018 fotogramas a 30 FPS de teleoperación para la tarea de recoger una goma de borrar y colocarla en un soporte. La configuración fue de 500 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de imitación supervisada pura sobre un conjunto de datos muy reducido.

## Capacidades

- Control visuomotor de un robot SO-101 (`so_follower`) a partir de una imagen superior y del estado de las articulaciones.
- Predicción de chunks de acción de 6 dimensiones para ejecución continua a 30 FPS.
- Ejecución de una tarea concreta de pick-and-place: "Pick up the eraser and place it in a holder".
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No dispone de razonamiento multi-paso simbólico, agentes ni planificación de tareas.
- No tiene capacidades multilingües, de visión general, audio ni modo de razonamiento explícito.
- No se documentan capacidades de generalización a objetos, posiciones o iluminaciones distintas de las del dataset de entrenamiento.

## Casos de uso

- Reproducción de la tarea de pick-and-place en un SO-101: ejecutar la política con `lerobot-rollout` sobre un robot calibrado para recoger la goma de borrar y depositarla en el soporte, usando la misma cámara superior y el mismo montaje que en el dataset.
- Referencia de flujo de trabajo con LeRobot: servir como ejemplo mínimo de entrenamiento ACT (500 pasos, 5 episodios) para validar la instalación, la calibración del robot y el pipeline de grabación antes de escalar a datasets mayores.
- Base para fine-tuning con más datos: reentrenar o afinar la política sobre un dataset ampliado con más posiciones, objetos o condiciones de iluminación para evaluar la mejora en robustez.
- Pruebas de integración hardware-software: verificar la comunicación entre el robot `so_follower`, la cámara OpenCV a 640x480 y 30 FPS, y el bucle de inferencia de LeRobot en un entorno controlado.
- Docencia y experimentación en aprendizaje por imitación: ilustrar el funcionamiento de ACT y la diferencia entre predicción de acciones por chunk frente a paso a paso en un caso real y acotado.
- Benchmark interno de latencia y throughput: medir el coste de inferencia de una política de 51,7 M de parámetros en la GPU disponible antes de comprometer recursos en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (0,2 GB de repositorio), la huella en memoria es muy reducida y cabe holgadamente en cualquier GPU consumer con al menos 2-4 GB libres, incluyendo el codificador visual.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060, RTX 4060 o superior es más que adecuada. No se requiere A100 ni H100.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del modelo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=WY1007/act_so101_pick_place`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput estimados: no disponibles. El control opera a 30 FPS según el dataset, pero no se publican medidas de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WY1007/act_so101_pick_place | 51,7 M | ACT (LeRobot) | Imagen 480x640 + estado (6,) | no disponible | Hugging Face |
| Políticas ACT de referencia en LeRobot | no disponible | ACT (LeRobot) | Configurable por dataset | normalmente Apache-2.0 en el framework | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | Difusión para control | Configurable por dataset | no disponible | Hugging Face / LeRobot |
| Políticas π0 / VLA de gran escala | no disponible en esta ficha | VLA | Multimodal | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a categoría, tamaño y disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 5 episodios y 4018 fotogramas, lo que limita severamente la generalización a posiciones, objetos o iluminaciones distintas.
- Entrenamiento corto: 500 pasos con batch size 8 y learning rate 1e-05; no hay garantía de convergencia ni de robustez.
- Sin evaluación publicada: no existe tasa de éxito medida en robot real, por lo que no se puede afirmar que la política funcione de forma fiable.
- Tarea única y específica: solo se ha entrenado para "Pick up the eraser and place it in a holder" con un objeto y un montaje concretos.
- Dependencia del montaje: requiere la misma cámara (`top`), resolución 480x640, 30 FPS y robot `so_follower` calibrado; cambios en la cámara o en la cinemática invalidan la política.
- Licencia no declarada: no se especifican términos de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Riesgo de sobreajuste y de fallo silencioso: al ser imitación sobre pocos datos, puede ejecutar movimientos plausibles pero incorrectos sin señal de error.
- Sin soporte de lenguaje natural ni de instrucciones variables: la tarea es fija y no se puede reformular en tiempo de ejecución.
- Sin datos de sesgos: no aplica el análisis de sesgos de modelos de lenguaje, pero sí el riesgo de que la política replique sesgos del operador humano que teleoperó los episodios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WY1007/act_so101_pick_place
- Dataset de entrenamiento: https://huggingface.co/datasets/WY1007/so101_place_pick_v3_20261124_123231
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=WY1007/so101_place_pick_v3_20261124_123231
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
