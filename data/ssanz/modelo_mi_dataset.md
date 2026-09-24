# ssanz/modelo_mi_dataset

## Resumen

`ssanz/modelo_mi_dataset` es una política de robótica entrenada con LeRobot mediante el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo aprende a partir de datos teleoperados y está pensado para controlar un brazo robótico de tipo `so_follower`, consumiendo el estado de las articulaciones y dos flujos de vídeo como entrada. Lo publica el usuario `ssanz` en HuggingFace, con licencia Apache-2.0 y un total de 51.668.614 parámetros.

Se trata de una política específica para una única tarea, "Grab the white cube", entrenada sobre un conjunto de datos muy reducido: 5 episodios y 3615 fotogramas a 30 FPS, procedentes del dataset `cualquier/cosa`. La entrada combina `observation.state` con forma `(6,)` y dos cámaras (`entorno` y `lateral`) a resolución 240x320; la salida es un vector de acción de dimensión `(6,)`. Es, por tanto, un artefacto de investigación o de demostración más que un modelo listo para producción general.

Su relevancia actual es doble: por un lado, sirve como ejemplo reproducible del flujo completo de LeRobot (grabación de datos, entrenamiento con `lerobot-train` y ejecución con `lerobot-rollout`); por otro, ACT sigue siendo una referencia habitual como línea base en manipulación robótica de bajo coste, lo que lo hace útil para comparar métodos de imitación sobre hardware asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con componente generativo latente (CVAE) para predicción de chunks de acción |
| Parametros totales | 51.668.614 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la política procesa un conjunto fijo de observaciones por paso; el horizonte del chunk de acciones no se documenta en la ficha) |
| Tipos de cuantizacion | no disponible; pesos en safetensors (uso habitual en FP32) |
| Idiomas soportados | no aplicable / no disponible (política robótica sin entrada ni salida de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Datos adicionales de la ficha: tipo de robot `so_follower`; cámaras `entorno` y `lateral`; tamaño del repositorio 0.2 GB; pipeline `robotics`; 0 descargas y 0 likes en el momento de la consulta; fecha de creación 2026-09-24.

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación descrito en el artículo enlazado por el autor (arXiv:2304.13705). En lugar de predecir una única acción por observación, el modelo predice un chunk de acciones futuras, lo que reduce el error de compounding y suaviza el control. La formulación original emplea un transformer con un cuello de botella variacional condicionado (estilo CVAE) que modela la variabilidad de las demostraciones humanas, además de una técnica de ensamblado temporal de predicciones solapadas. El encoder de observaciones combina el estado proprioceptivo con las imágenes de las cámaras; en esta configuración concreta, dos cámaras RGB a 240x320 junto con un estado de 6 dimensiones.

Los detalles de entrenamiento documentados son: 3000 pasos, batch size 8, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y LeRobot versión 0.6.2. El conjunto de datos tiene solo 5 episodios y 3615 fotogramas a 30 FPS para la tarea "Grab the white cube". No se documenta el número total de tokens, la composición del dataset más allá de esta tarea, ni si se aplicaron fases de RLHF o DPO (no aplicables en este paradigma, donde el ajuste es por imitación supervisada). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal; no hay datos disponibles al respecto.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones para un brazo `so_follower` a partir de estado y visión.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos aislados, lo que mejora la estabilidad del control.
- Percepción visual multimodal: integra dos cámaras RGB simultáneas (`entorno` y `lateral`) con resolución 240x320 cada una.
- Fusión de estado y visión: combina propriocepción (`observation.state`, 6 valores) con observaciones visuales.
- Ejecución de una tarea concreta: "Grab the white cube" (agarre de un cubo blanco).
- Integración con LeRobot: puede lanzarse con `lerobot-rollout` y reentrenarse o ajustarse con `lerobot-train`.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, audio, vídeo generativo): no disponibles; el modelo es exclusivamente una política de control motor.

## Casos de uso

- Recogida de objetos en laboratorio: la política puede ejecutar la tarea de agarre del cubo blanco sobre un `so_follower` real mediante `lerobot-rollout`, siempre que el montaje de cámaras coincida con el usado en el entrenamiento.
- Reproducción de la línea base ACT: sirve para replicar resultados de ACT en hardware de bajo coste y compararlo con otros métodos de imitación sobre la misma tarea.
- Validación de un pipeline LeRobot de extremo a extremo: útil para verificar que la grabación de datos, el entrenamiento y el despliegue funcionan de forma coherente antes de escalar a datasets mayores.
- Punto de partida para fine-tuning: el checkpoint se puede ajustar con `--policy.type=act` sobre datos propios para nuevas tareas de agarre, aprovechando los pesos ya entrenados.
- Docencia y formación en robótica: ejemplo didáctico y de tamaño reducido (0.2 GB) para explicar aprendizaje por imitación, action chunking y despliegue en un robot real.
- Pruebas de integración de hardware: verificar calibración de puertos, cámaras y controladores del `so_follower` con una política conocida antes de entrenar políticas propias.
- Evaluación de robustez interna: usar esta política como referencia para medir cuánto degrada el rendimiento al variar iluminación, posición del objeto o ligeros cambios en la disposición de las cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente que todavía no se han proporcionado resultados de evaluación ("No evaluation results have been provided for this policy yet") y que la tabla de éxito por tarea está vacía. Por tanto, no se dispone de tasas de éxito, MMLU, HumanEval, GSM8K ni de ninguna otra métrica comparable.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 0,2 GB solo para los pesos (51,67 M de parámetros × 4 bytes); con activaciones y contexto de CUDA, el consumo real ronda 1-2 GB.
- VRAM estimada en FP16/BF16: aproximadamente 0,1 GB para los pesos; sigue siendo un modelo de huella mínima.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA reciente es suficiente; una RTX 3060, RTX 4090 o superior ofrecen un margen amplio. En despliegue embebido, una Jetson Orin es una opción realista para llevarlo junto al robot.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en equipos con gráfica integrada, dado el tamaño del modelo.
- Ejecución en CPU: viable en teoría por el tamaño, aunque la latencia dependerá del equipo; LeRobot permite seleccionar el dispositivo con `--policy.device`.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia en robot y `lerobot-train` para entrenamiento), PyTorch como backend y pesos en safetensors. vLLM, llama.cpp, Ollama o TGI no aplican: son servidores para modelos de lenguaje, no para políticas de control motor.
- Latencia y throughput: no disponibles. Como referencia derivada, el dataset se grabó a 30 FPS, lo que implica un presupuesto de aproximadamente 33 ms por inferencia si se quiere mantener el bucle de control en tiempo real.

## Comparativa con modelos similares

Los datos de las alternativas proceden de fuentes públicas de cada proyecto y no de la información proporcionada para este modelo; se indican como referencia orientativa.

| Modelo | Parametros | Enfoque | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (`ssanz/modelo_mi_dataset`) | 51,67 M | Transformer con CVAE y action chunking | Estado 6D + 2 cámaras RGB 240x320 | Apache-2.0 | HuggingFace, vía LeRobot |
| Diffusion Policy | no disponible (depende de la configuración) | Políticas de difusión para generación de acciones | Imagen + estado | MIT (código de referencia) | Repositorio público de investigación |
| SmolVLA | aproximadamente 450 M | Vision-Language-Action | Imagen + instrucción en lenguaje + estado | Apache-2.0 | HuggingFace, vía LeRobot |
| ACT original (ALOHA, artículo) | del orden de decenas de millones (no confirmado en la información disponible) | Transformer con CVAE y action chunking | Imagen + estado | no disponible | Repositorio del artículo |

Frente a Diffusion Policy, ACT suele ser más ligero y rápido en inferencia, a costa de menor capacidad para modelar distribuciones multimodales complejas. Frente a SmolVLA, este modelo no acepta instrucciones en lenguaje natural y está atado a una única tarea, mientras que SmolVLA generaliza a múltiples tareas mediante condicionamiento textual.

## Limitaciones y advertencias

- Dataset extremadamente reducido: solo 5 episodios y 3615 fotogramas, lo que implica un riesgo alto de sobreajuste y de baja generalización fuera de las condiciones exactas de grabación.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito ni de robustez; cualquier uso en producción parte de una base no verificada.
- Tarea única: la política está entrenada exclusivamente para "Grab the white cube"; no se documenta ninguna capacidad de generalización a otras instrucciones u objetos.
- Dependencia del montaje físico: los nombres e índices de cámara (`entorno`, `lateral`), su resolución y el tipo de robot (`so_follower`) deben coincidir exactamente con los del entrenamiento; cualquier cambio invalida la política.
- Sensibilidad al dominio visual: cambios de iluminación, fondo, posición de cámara o disposición de la mesa pueden degradar seriamente el comportamiento, algo habitual en políticas entrenadas con pocos episodios.
- Sin capacidades de lenguaje: no acepta instrucciones en lenguaje natural ni mantiene diálogo; no admite tool calling ni razonamiento multi-paso.
- Idioma: no aplica, al no procesar texto; no hay soporte multilingüe que evaluar.
- Licencia Apache-2.0: permite uso comercial y modificación con obligación de conservar el aviso de licencia y el texto correspondiente, pero no exime de responsabilidad sobre el comportamiento físico del robot.
- Riesgo de seguridad física: al tratarse de una política que controla hardware real, ejecutarla sin límites de par, paradas de emergencia y supervisión humana puede causar daños al robot, a objetos o a personas. La ficha no documenta ningún protocolo de seguridad.
- Ausencia de cuantizaciones documentadas: no hay versiones cuantizadas publicadas, por lo que el despliegue en hardware muy limitado requeriría conversión manual.
- Madurez: 0 descargas y 0 likes, repositorio de 0,2 GB y sin demo ni vídeo de validación publicados; se trata de un artefacto sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssanz/modelo_mi_dataset
- Dataset de entrenamiento: https://huggingface.co/datasets/cualquier/cosa
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Guía de inferencia / rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Referencia rápida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=cualquier/cosa
