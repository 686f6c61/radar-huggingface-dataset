# Tridex/model_tridex_act_3cam_resnet_100K_23_09

## Resumen

Tridex/model_tridex_act_3cam_resnet_100K_23_09 es una política de imitación robótica entrenada con ACT (Action Chunking with Transformers) y publicada por la organización Tridex_DIA_Niort en Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular del robot (6 dimensiones) y tres cámaras RGB de 480x640 píxeles (front, side, top), y produce un vector de acción de 6 dimensiones para un robot so_follower. El checkpoint tiene 51.668.614 parámetros (unos 51,7 M) y ocupa 0,2 GB en safetensors.

La política se entrenó con LeRobot 0.6.2 durante 100.000 pasos sobre un único dataset de 50 episodios y 53.087 fotogramas a 30 FPS, con la tarea "take the gaz cylinder and drop it". Su relevancia es práctica: sirve como referencia reproducible de imitación de bajo coste (menos de 60 M de parámetros), como punto de partida para fine-tuning con datos propios mediante lerobot-train y como término de comparación frente a los otros checkpoints de la misma familia publicados por Tridex (10K, 20K y 30K pasos).

No se han publicado resultados de evaluación ni tasa de éxito, y el modelo carece por completo de capacidades de lenguaje, tool calling o visión general: está especializado en una sola tarea de manipulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), artículo 2304.13705; el nombre del repositorio indica backbone visual ResNet |
| Parámetros totales | 51.668.614 (≈51,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica el horizonte de observación ni el tamaño del chunk de acciones) |
| Tipos de cuantización | no disponible (no se publican variantes cuantizadas; solo pesos en safetensors) |
| Idiomas soportados | no disponible (no aplica un modelo de lenguaje; la instrucción de tarea está en inglés: "take the gaz cylinder and drop it") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato LeRobot; repositorio de 0,2 GB) |
| Tipo de robot | so_follower |
| Cámaras | front, side, top (3 canales, 480x640, 30 FPS) |
| Entrada de estado | observation.state, forma (6,) |
| Salida de acción | action, forma (6,) |
| Biblioteca | LeRobot 0.6.2 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks cortos de acciones en lugar de pasos individuales, según describe el artículo 2304.13705 enlazado en la model card. Se entrena a partir de datos de teleoperación y, de acuerdo con el propio método, suele alcanzar tasas de éxito altas en tareas de manipulación. La model card no detalla la topología interna de este checkpoint concreto; el sufijo "resnet" del nombre del repositorio apunta a un codificador visual con backbone ResNet, que es la configuración habitual de ACT en LeRobot. Cada una de las tres cámaras aporta una imagen de 3x480x640, y la política fusiona esa información visual con el vector de estado de 6 dimensiones para emitir 6 valores de acción.

El entrenamiento se realizó durante 100.000 pasos con batch de 8, optimizador AdamW, learning rate de 1e-5 y semilla 1000, sobre el dataset Tridex/50_gazeuse_10h30_23-09_20260923_103845: 50 episodios, 53.087 fotogramas a 30 FPS (aproximadamente 29,5 minutos de datos) y una única tarea, "take the gaz cylinder and drop it". No se documenta ninguna fase de RLHF, DPO o refinamiento por preferencias, algo que no aplica a una política de control. Tampoco se especifican aumentos de datos, tamaño del chunk de acciones ni horizonte de observación, por lo que no es posible reconstruir la configuración completa de entrenamiento a partir de la información publicada.

## Capacidades

- Control visomotor de manipulación: genera acciones de 6 grados de libertad para un robot so_follower a partir de estado articular y tres vistas de cámara.
- Ejecución de una tarea concreta de pick-and-place: recoger un cilindro de gas ("gaz") y soltarlo.
- Política de imitación entrenada con action chunking, lo que permite emitir secuencias cortas de acciones en lugar de un único paso.
- Inferencia en tiempo real sobre hardware modesto: 51,7 M de parámetros y 0,2 GB de pesos.
- Integración nativa con el ecosistema LeRobot: despliegue con lerobot-rollout y reentrenamiento con lerobot-train.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso en lenguaje.
- No dispone de capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni ningún otro modo especial.

## Casos de uso

- Automatización de la tarea de recogida y depósito de cilindros: la política está entrenada específicamente para "take the gaz cylinder and drop it" sobre un so_follower, por lo que puede desplegarse directamente con `lerobot-rollout` en una célula de trabajo que reproduzca las condiciones del dataset.
- Pick-and-place en logística de laboratorio: el uso de tres cámaras (front, side, top) reduce la oclusión y facilita la localización del objeto en posiciones variables dentro del volumen de trabajo cubierto por los sensores.
- Punto de partida para fine-tuning: mediante `lerobot-train --policy.type=act` es posible reentrenar o ajustar la política con nuevos datasets de teleoperación para tareas similares, reutilizando los 100.000 pasos ya realizados como inicialización.
- Comparación interna de configuraciones de entrenamiento: al existir checkpoints hermanos con 10K, 20K y 30K pasos publicados por el mismo autor, este modelo sirve para estudiar el efecto del número de pasos de entrenamiento sobre el comportamiento resultante.
- Recogida de datos asistida: desplegar la política durante sesiones cortas (`--duration` acotado) permite generar episodios iniciales que después se corrigen por teleoperación y se añaden al dataset para iterar el modelo.
- Investigación en aprendizaje por imitación reproducible: la combinación de LeRobot 0.6.2, semilla fija (1000), learning rate y batch documentados permite reproducir el entrenamiento en un entorno controlado.
- Docencia y prototipado en robótica de bajo coste: un modelo de 51,7 M de parámetros que cabe en 0,2 GB es adecuado para prácticas de laboratorio con brazos SO follower y cámaras USB, sin necesidad de clústeres de GPU.
- Validación de pipelines de inferencia robótica: sirve para medir latencia y estabilidad de un bucle de control a 30 FPS en hardware de gama media antes de escalar a políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card está vacía y se limita a la nota "No evaluation results have been provided for this policy yet", sin tabla de tareas, número de ensayos ni tasa de éxito. Tampoco se han encontrado métricas de latencia o throughput en la búsqueda web.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 0,2 GB en fp32 y 0,1 GB en fp16/bfloat16 (cálculo derivado del número de parámetros, no publicado por el autor).
- VRAM en inferencia: no disponible. A los pesos hay que sumar las activaciones del codificador visual para tres imágenes de 3x480x640; con batch 1 el consumo se mantiene en el rango de pocos GB en cualquier GPU moderna, pero el autor no publica ninguna medición.
- GPU recomendadas: no disponibles. El comando de entrenamiento documentado usa `--policy.device=cuda`, lo que implica una GPU NVIDIA con CUDA; no se especifica ningún modelo concreto (A100, H100, RTX 4090, etc.).
- GPU de consumo: por tamaño, el checkpoint cabe sin problema en cualquier GPU de consumo con más de 4 GB de VRAM (GTX 1650, RTX 3060, RTX 4060, etc.). Es una estimación por tamaño, no un dato verificado.
- CPU: técnicamente viable por el reducido número de parámetros, aunque la model card solo documenta ejecución en CUDA.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` para ejecución y `lerobot-train` para entrenamiento) sobre PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI: no hay GGUF, no hay tokenizador de texto y el modelo no expone una API de chat.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero ese dato corresponde a la captura de datos y no equivale a la frecuencia de inferencia alcanzable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Tridex/model_tridex_act_3cam_resnet_100K_23_09 | 51,7 M | no disponible | Apache 2.0 | Público en Hugging Face | 100.000 pasos, 3 cámaras, dataset de 50 episodios |
| Tridex/modele_act_3cam_30k | 51,7 M | no disponible | no disponible | Público en Hugging Face | El nombre sugiere 30.000 pasos; no verificado |
| Tridex/modele_act_3cam_20k | 51,7 M | no disponible | no disponible | Público en Hugging Face | El nombre sugiere 20.000 pasos; no verificado |
| Tridex/model_act_3cam_10K_22_09 | no disponible | no disponible | no disponible | Público en Hugging Face | El nombre sugiere 10.000 pasos; no verificado |

No se dispone de datos de benchmarks ni de tasas de éxito de ninguno de estos checkpoints, por lo que la comparación se limita a parámetros y configuración. No se han identificado en la información proporcionada políticas ACT de otros autores con las que comparar de forma rigurosa.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("take the gaz cylinder and drop it"); cualquier otro objeto, destino o secuencia de acciones queda fuera de su distribución.
- Dataset reducido: 50 episodios y 53.087 fotogramas (≈29,5 minutos) son insuficientes para garantizar robustez ante variaciones de iluminación, fondo, posición de las cámaras o del objeto.
- Dependencia estricta de la configuración de sensores: requiere tres cámaras con los nombres front, side y top y resolución 480x640. Si los nombres de las claves de observación no coinciden, el despliegue falla.
- Cinemática fija: estado y acción son vectores de 6 dimensiones para un robot so_follower; no es trasladable sin reentrenamiento a otro robot o a otro número de articulaciones.
- Ausencia de evaluación: no hay tasa de éxito medida, ni número de ensayos, ni resultados en condiciones adversas. No hay evidencia publicada de que la política funcione fuera del entorno de grabación.
- Riesgo de error compuesto: como toda política de imitación, puede acumular desviaciones y ejecutar acciones no válidas o inseguras cuando sale de la distribución de entrenamiento. El equivalente funcional a la alucinación en este contexto es la ejecución de una trayectoria incorrecta con aparente normalidad.
- Sesgos: no se documentan sesgos lingüísticos ni sociales por tratarse de una política de control, pero sí existe un sesgo hacia la disposición física, la iluminación y el utillaje presentes en el dataset de entrenamiento.
- Idiomas: no aplica. No hay comprensión de lenguaje; la instrucción de tarea se pasa como texto fijo en inglés al script de despliegue.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no exime de la responsabilidad de seguridad ni de la validación en el robot físico antes de cualquier despliegue real.
- Sin validación de seguridad: no se documentan paradas de emergencia, límites de par ni envolventes de seguridad, elementos que deben implementarse a nivel de controlador y no de modelo.
- Fecha del repositorio: el modelo fue creado el 23 de septiembre de 2026 y no tiene descargas ni "likes", por lo que no existe retroalimentación de la comunidad sobre su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_tridex_act_3cam_resnet_100K_23_09
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/50_gazeuse_10h30_23-09_20260923_103845
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/50_gazeuse_10h30_23-09_20260923_103845
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Modelo relacionado (30K pasos): https://huggingface.co/Tridex/modele_act_3cam_30k
- Modelo relacionado (10K pasos): https://huggingface.co/Tridex/model_act_3cam_10K_22_09
- Perfil de la organización Tridex: https://huggingface.co/Tridex/models
- Dataset auxiliar de la organización: https://huggingface.co/datasets/Tridex/record-test-3-cam_20260903_142712
