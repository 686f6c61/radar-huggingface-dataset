# Yutarop/tsukuba-poc1_act_policy_10000steps

## Resumen

`Yutarop/tsukuba-poc1_act_policy_10000steps` es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. No se trata de un modelo de lenguaje, sino de un controlador visomotor que, a partir de una imagen de cámara y del estado de las articulaciones del robot, predice directamente comandos de acción. El autor es el usuario de Hugging Face Yutarop y el modelo se ha entrenado y publicado con la librería LeRobot de Hugging Face.

El modelo resuelve una tarea concreta de manipulación: recoger un objeto y colocarlo ("Pick up an object and place it"). Se ha entrenado sobre un dataset propio de 50 episodios y 31.605 fotogramas grabados a 30 FPS con un robot `so_follower` y una única cámara cenital (`top`). Su relevancia es la de un artefacto de prueba de concepto (PoC) reproducible: demuestra el flujo completo de LeRobot, desde la teleoperación y la grabación de datos hasta el entrenamiento de una política ACT y su despliegue en un robot real.

Arquitectónicamente es un transformer pequeño, con 51.668.614 parámetros totales y un repositorio de solo 0,2 GB en safetensors. No dispone de ventana de contexto lingüístico ni de capacidades de generación de texto: su "entrada" es una observación multimodal (estado de 6 dimensiones más imagen RGB de 3×480×640) y su "salida" es un vector de acción de 6 dimensiones. La licencia no está declarada y no se han publicado resultados de evaluación en el robot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/quantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica como cadena fija "Pick up an object and place it") |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza el control. La política combina un backbone visual (procesa la imagen `observation.images.top` de 3×480×640) con un transformer que atiende conjuntamente a la observación y a las acciones predichas, y emite un vector de acción de 6 dimensiones compatible con el robot `so_follower`. El número total de parámetros es de 51.668.614.

El entrenamiento se realizó con LeRobot 0.7.1 durante 10.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset de origen (`Yutarop/tsukuba-poc1_20261107_211425`) contiene 50 episodios y 31.605 fotogramas a 30 FPS de una única tarea de pick-and-place, capturados mediante teleoperación. No se documenta el uso de RLHF, DPO ni técnicas de refuerzo: es aprendizaje supervisado puro sobre demostraciones. Tampoco se especifican aumentos de datos, composición demográfica del dataset ni innovaciones adicionales más allá del propio chunking de acciones del método ACT.

## Capacidades

- Control visomotor de manipulación: dado el estado de 6 articulaciones y una imagen cenital, predice acciones de 6 dimensiones para ejecutar pick-and-place.
- Aprendizaje por imitación de una única tarea: reproduce el comportamiento demostrado en el dataset de entrenamiento.
- Predicción de chunks de acción, que mejora la suavidad y la consistencia temporal frente a políticas paso a paso.
- Entrada multimodal: estado propioceptivo (`observation.state`, shape `(6,)`) e imagen RGB (`observation.images.top`, shape `(3, 480, 640)`).
- Integración nativa con LeRobot: ejecutable con `lerobot-rollout` y reentrenable con `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión general, audio o modo de pensamiento. Es exclusivamente una política robótica.

## Casos de uso

- Prueba de concepto de pick-and-place en laboratorio: desplegar la política en un robot `so_follower` con cámara cenital para validar el pipeline completo de LeRobot antes de escalar a tareas más complejas.
- Docencia y formación en aprendizaje por imitación: usar el repositorio como ejemplo reproducible de entrenamiento ACT con hiperparámetros documentados (10.000 pasos, batch 8, lr 1e-05).
- Base para reentrenamiento con datos propios: partir de esta configuración (`--policy.type=act`) y sustituir el dataset por grabaciones propias para nuevas tareas de manipulación.
- Evaluación de infraestructura de teleoperación: comprobar la calidad de las grabaciones (50 episodios, 30 FPS) y la calibración del robot antes de invertir en datasets mayores.
- Benchmark interno de políticas ACT: comparar tasas de éxito y latencia frente a otras políticas entrenadas con el mismo hardware y dataset.
- Demostraciones y divulgación: ejecutar la política durante 60 segundos con `--duration=60` para grabar vídeos de validación del funcionamiento del robot.
- Automatización de una celda de montaje simple: si la tarea y las posiciones de objeto son fijas, la política puede operar en un entorno controlado con iluminación y colocación constantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No existen tasas de éxito, métricas de precisión ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, si bien el cuello de botella real es el procesamiento de imagen a 480×640 y la latencia de control.
- GPU recomendadas: no especificadas por el autor. Para entrenamiento, LeRobot se invoca con `--policy.device=cuda`; una GPU consumer tipo RTX 3060/4060 o superior es suficiente para este tamaño de modelo, y para entrenamientos mayores se recomendarían A100/H100.
- Cabe en GPU consumer: sí, presumiblemente en cualquier GPU con al menos 4 GB de VRAM; no hay requisitos publicados.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=Yutarop/tsukuba-poc1_act_policy_10000steps`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control opera a 30 FPS según la frecuencia del dataset, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yutarop/tsukuba-poc1_act_policy_10000steps | 51,7 M | no aplica | Pick-and-place (ACT) | no disponible | Hugging Face |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Manipulación genérica | según repositorio | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación visomotora | según repositorio | Hugging Face / LeRobot |
| Políticas π0 / VLA de gran escala | no disponible | no aplica | Manipulación generalista | según repositorio | Hugging Face |

No se dispone de datos cuantitativos (parámetros, tasas de éxito, latencia) de las alternativas en la información proporcionada, por lo que la comparación numérica no está disponible. La comparación cualitativa se limita a que este modelo es una política ACT de una sola tarea y dataset pequeño, frente a alternativas como Diffusion Policy o modelos VLA de mayor escala que no se han evaluado en este contexto.

## Limitaciones y advertencias

- Entrenada para una única tarea ("Pick up an object and place it") y un único robot (`so_follower`); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Depende de una cámara cenital (`top`) con una configuración concreta (640×480, 30 FPS); cambios de cámara, iluminación o posición alteran el rendimiento.
- Dataset muy pequeño (50 episodios, 31.605 fotogramas), lo que aumenta el riesgo de sobreajuste y de baja robustez ante variaciones del entorno.
- Sin resultados de evaluación publicados: se desconoce la tasa de éxito real en el robot.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Sin información sobre sesgos, alucinación (concepto no aplicable a una política de control) ni restricciones de idioma.
- Riesgo de comportamiento inseguro en producción: una política de imitación puede ejecutar acciones erráticas ante observaciones fuera de distribución; requiere parada de emergencia y supervisión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni soporte documentado más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yutarop/tsukuba-poc1_act_policy_10000steps
- Dataset de entrenamiento: https://huggingface.co/datasets/Yutarop/tsukuba-poc1_20261107_211425
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Yutarop/tsukuba-poc1_20261107_211425
