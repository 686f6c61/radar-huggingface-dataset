# VMuccio/smolvla_topgrip_terne3x

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, orientado a control robótico por imitación. Esta ficha concreta, `VMuccio/smolvla_topgrip_terne3x`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` realizado por el usuario VMuccio sobre un dataset propio de manipulación con pinza de agarre superior (top grip). El modelo consume el estado articular (6 dimensiones) y tres cámaras RGB de 256x256 píxeles, y produce un vector de acción de 6 dimensiones a 30 FPS.

La relevancia de SmolVLA radica en su planteamiento de eficiencia: el paper original (arXiv:2506.01844) lo presenta como un VLA capaz de rendimiento competitivo con un coste computacional reducido, apto para hardware de consumo. Este fine-tuning concreto tiene 450.046.176 parámetros y un repositorio de 0,9 GB en safetensors, lo que lo sitúa en el rango de modelos desplegables en una única GPU consumer.

Se trata de una política de imitación altamente especializada, no de un modelo de propósito general: su tarea se limita a recoger cubos de colores (amarillo, azul, rojo) y depositarlos en una cesta, sobre un robot tipo `so_follower`. Cualquier evaluación de su utilidad debe hacerse contra ese dominio concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según el método SmolVLA |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.6.2 |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower |
| Cámaras de entrada | gripper, top (tres vistas RGB de 256x256) |
| Dimensión de estado | (6,) |
| Dimensión de acción | (6,) |
| Frecuencia de entrenamiento | 30 FPS |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras en un único transformer. El paper lo describe como una arquitectura compacta y eficiente, pensada para reducir el coste computacional frente a VLA de mayor tamaño manteniendo rendimiento competitivo. La información disponible no detalla la composición interna exacta (número de capas, dimensión del modelo, mecanismo de fusión visión-lenguaje) ni el número de tokens de entrenamiento del preentrenamiento original.

Este checkpoint concreto se ha obtenido por fine-tuning supervisado (imitación) sobre el dataset `VMuccio/rgb_cleaned`, compuesto por 774 episodios y 412.291 fotogramas a 30 FPS, con tres tareas de recogida y depósito de cubos de colores. La configuración de entrenamiento reportada es de 20.000 pasos, batch size 64, optimizador AdamW, learning rate 0,0001 y semilla 1000, ejecutada con LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni de decodificación especulativa en este fine-tuning.

## Capacidades

- Generación de acciones motoras de 6 dimensiones a partir de observaciones multimodales (estado articular y tres cámaras RGB).
- Percepción visual multi-cámara: procesa simultáneamente las vistas `gripper` y `top` (más una tercera vista), cada una a 256x256 píxeles.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica en el momento de la inferencia mediante el parámetro `--task` (por ejemplo, "Pick the yellow cube and place it into the basket").
- Control de pinza de agarre superior (top grip) sobre robot `so_follower`.
- Ejecución de políticas de imitación en bucle cerrado a 30 FPS.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes ni modo thinking.
- Capacidades multilingües: no disponibles; el modelo no es un generador de texto general.

## Casos de uso

- Recogida y clasificación de cubos por color: la política ejecuta las tres tareas del dataset (cubo amarillo, azul y rojo hacia la cesta) sobre un robot `so_follower` con pinza de agarre superior. Es su uso directo y el único validado por los datos de entrenamiento.
- Prototipado de pipelines de imitación con LeRobot: sirve como referencia funcional para equipos que quieran replicar el flujo completo de grabación de datos, entrenamiento y despliegue con `lerobot-train` y `lerobot-rollout`.
- Base para fine-tuning en tareas de pick-and-place: al derivar de `lerobot/smolvla_base` y publicarse con licencia Apache 2.0, puede reentrenarse con datasets propios de manipulación de objetos pequeños.
- Investigación en manipulación de bajo coste: su tamaño de 450 millones de parámetros y repositorio de 0,9 GB permiten experimentar en una única GPU consumer, lo que facilita la iteración académica.
- Evaluación comparativa de políticas VLA: útil como punto de partida para medir el efecto del fine-tuning específico frente al checkpoint base en una tarea controlada.
- Docencia y demostraciones de aprendizaje por imitación: el flujo de rollout con `--strategy.type=base` y `--duration` permite ejecutar demostraciones reproducibles de 60 segundos sin grabar episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que la tabla de éxito por tarea está pendiente de rellenar por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 450 millones de parámetros en safetensors (aproximadamente 1,8 GB en fp32 o 0,9 GB en fp16), la huella de pesos es reducida; el consumo real dependerá del runtime y de las tres cámaras de 256x256.
- GPU recomendadas: no especificadas por el autor. Por tamaño, es plausible su ejecución en GPU consumer, pero no hay datos publicados de latencia ni de modelos concretos validados.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: LeRobot 0.6.2 mediante `lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El entrenamiento y la inferencia se plantean a 30 FPS, pero no se reportan tiempos de respuesta medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VMuccio/smolvla_topgrip_terne3x | 450.046.176 | no disponible | Pick-and-place de cubos con so_follower | Apache 2.0 | Hugging Face, 28 descargas |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face |
| Otros VLA de manipulación (p. ej. familias OpenVLA, pi0) | no disponible en la información | no disponible | Control robótico general | no disponible en la información | no disponible |

La comparación cuantitativa con alternativas no es posible con los datos proporcionados: no hay benchmarks publicados para este checkpoint ni cifras de rendimiento de los modelos comparables en la información disponible.

## Limitaciones y advertencias

- Política altamente especializada: solo se ha entrenado para tres tareas de recogida de cubos de colores; no generaliza a otros objetos, posiciones o entornos sin reentrenamiento.
- Sin evaluación publicada: la model card no reporta tasa de éxito, número de ensayos ni condiciones de prueba, por lo que no hay evidencia cuantitativa de fiabilidad.
- Dependencia de hardware concreto: requiere un robot `so_follower` con pinza de agarre superior y una configuración de cámaras que coincida con las claves de observación del entrenamiento (`gripper`, `top` y una tercera vista).
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones fuera de distribución ante cambios de iluminación, posiciones de objetos o distracciones no vistas en el dataset.
- Sesgos de datos: el dataset `VMuccio/rgb_cleaned` (774 episodios, 412.291 fotogramas) define el dominio visual y físico; cualquier desviación de ese dominio degrada el comportamiento.
- Idiomas: no aplica como modelo de texto; las instrucciones de tarea se limitan a las formuladas en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- Repositorio con muy poca tracción (28 descargas, 0 likes): no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VMuccio/smolvla_topgrip_terne3x
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/VMuccio/rgb_cleaned
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=VMuccio/rgb_cleaned
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
