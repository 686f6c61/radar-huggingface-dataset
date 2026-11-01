# weilu4606/smolvla_base_red_block_clean_2026-10-31_08-51-25

## Resumen

SmolVLA es un modelo vision-lenguaje-acción (VLA) compacto desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Esta ficha concreta corresponde a un fine-tuning de `lerobot/smolvla_base` realizado por el usuario `weilu4606`, especializado en una única tarea de manipulación: recoger un bloque rojo y depositarlo sobre un plato. El modelo consume observaciones multimodales (estado articular de 6 dimensiones y hasta cuatro cámaras) y produce comandos de acción de 6 dimensiones para un robot `so_follower` (SO-100/SO-101 de bajo coste).

Con 450 millones de parámetros, SmolVLA apunta a un nicho distinto al de los VLA de gran escala: inferencia en hardware de consumo y despliegue accesible para laboratorios y aficionados. El fine-tuning se entrenó sobre 99 episodios (60.575 frames a 30 FPS) durante 50.000 pasos con AdamW, batch de 8 y learning rate 1e-4, usando LeRobot 0.6.2. La licencia Apache 2.0 facilita su reutilización comercial y académica.

Su relevancia actual radica en que demuestra el flujo completo de LeRobot: grabación de datos, entrenamiento de políticas y despliegue en robot real con comandos `lerobot-rollout`. No obstante, es una política de tarea única, sin evaluación publicada, por lo que debe tratarse como un artefacto experimental y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer con codificador visual y experto de acción |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se expresan en inglés en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA combina un codificador visual-lenguaje preentrenado con un experto de acción que genera comandos motores de forma eficiente, siguiendo el diseño descrito en el paper arXiv:2506.01844. La política recibe `observation.state` de forma `(6,)` y cuatro flujos visuales: tres cámaras a 256x256 (`observation.images.camera1`, `camera2`, `camera3`) y una cámara vacía a 480x640 (`observation.images.empty_camera_0`), y emite una acción de forma `(6,)`. El robot objetivo es `so_follower` con cámaras `head` y `wrist` según la model card.

El entrenamiento es de imitación supervisada sobre el dataset `Whyynnot/standard_task_pick_up_the_red_block_and_put_it_on_the_plate_20261024_204328_clean`: 99 episodios, 60.575 frames a 30 FPS, una única tarea ("pick up the red block and put it on the plate"). Se realizaron 50.000 pasos con batch 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta RLHF, DPO ni decodificación especulativa; la innovación principal es la eficiencia computacional del VLA para hardware de consumo.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un brazo `so_follower` a partir de observaciones visuales y de estado articular.
- Fusión multimodal: integra estado propioceptivo y hasta cuatro cámaras (tres a 256x256 y una a 480x640) en una única política.
- Ejecución de una tarea de pick-and-place: "pick up the red block and put it on the plate".
- Condicionamiento por instrucción en lenguaje natural (task string) en el momento de la inferencia.
- Despliegue en hardware de consumo gracias a sus 450 M de parámetros.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo thinking; es una política de acción, no un asistente conversacional.
- Capacidades multilingües: no disponibles; la instrucción de tarea del dataset está en inglés.

## Casos de uso

- Automatización de pick-and-place en laboratorio: ejecutar la tarea de recoger el bloque rojo y colocarlo en el plato con `lerobot-rollout` sobre un SO-100/SO-101, usando el modelo como política de referencia para comparar configuraciones de cámara y calibración.
- Docencia y formación en robótica: servir como ejemplo reproducible del pipeline completo de LeRobot (grabación, entrenamiento, despliegue) en cursos universitarios, dado su tamaño reducido y su licencia Apache 2.0.
- Base para fine-tuning en tareas similares: partir de estos pesos para adaptar la política a variantes del mismo montaje (otro objeto, otra posición de plato) con pocos episodios adicionales.
- Validación de infraestructura de inferencia: probar latencia y estabilidad de `lerobot-rollout` en GPUs de consumo antes de escalar a políticas mayores.
- Investigación en aprendizaje por imitación: analizar el efecto del número de cámaras y de la resolución de entrada en el éxito de la tarea, comparando contra `lerobot/smolvla_base`.
- Prototipado de celda de manipulación de bajo coste: integrar el modelo en un banco de pruebas con robot SO-100 para demostraciones de automatización asequible.
- Benchmark interno de recogida de datos: usar los 99 episodios y 60.575 frames como referencia para evaluar la calidad de nuevos datasets grabados con el mismo protocolo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en FP32 el peso ronda 1,8 GB, y en FP16/BF16 alrededor de 0,9 GB, a lo que hay que sumar activaciones de las cuatro cámaras de entrada.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar los pesos, aunque no hay cifras oficiales.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque el autor no publica requisitos ni latencias medidas.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) y `lerobot-train` para reentrenamiento, según la model card; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El control se ejecuta a 30 FPS según el dataset, pero no se publica latencia por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| weilu4606/smolvla_base_red_block_clean_2026-10-31_08-51-25 | 450 M | Pick-and-place de un bloque rojo sobre un plato (SO-100) | no disponible | apache-2.0 | Hugging Face, 133 descargas |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | Política VLA base multi-tarea | no disponible | no disponible en la informacion proporcionada | Hugging Face (modelo base) |
| Políticas ACT / Diffusion Policy de LeRobot | no disponible en la informacion proporcionada | Manipulación por imitación | no disponible | no disponible en la informacion proporcionada | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Política de tarea única: solo se ha entrenado para "pick up the red block and put it on the plate"; fuera de ese montaje y esa instrucción no hay garantía de comportamiento.
- Sin evaluación publicada: no existen tasas de éxito en robot real, por lo que no puede afirmarse su fiabilidad.
- Sensible al entorno: cambios de iluminación, posiciones de objetos, distractores o un robot distinto del mismo tipo pueden degradar el rendimiento; la model card sugiere documentar estas variaciones.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento (`camera1`, `camera2`, `camera3`, `empty_camera_0`), lo que limita la portabilidad.
- Riesgo de alucinación motora: al ser una política de imitación, puede generar acciones plausibles pero incorrectas ante observaciones fuera de distribución, sin mecanismo de verificación interno.
- Sesgos: no documentados; el dataset procede de un único operador y montaje, por lo que puede heredar sesgos de trayectoria y de posicionamiento.
- Idiomas: la instrucción de tarea está en inglés; no hay soporte multilingüe documentado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo base y el dataset tienen sus propias condiciones que deben verificarse.
- Tamaño del repositorio: 66 GB, lo que implica requisitos de almacenamiento considerables para su descarga y versionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/weilu4606/smolvla_base_red_block_clean_2026-10-31_08-51-25
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Dataset de entrenamiento: https://huggingface.co/datasets/Whyynnot/standard_task_pick_up_the_red_block_and_put_it_on_the_plate_20261024_204328_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Whyynnot/standard_task_pick_up_the_red_block_and_put_it_on_the_plate_20261024_204328_clean
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
