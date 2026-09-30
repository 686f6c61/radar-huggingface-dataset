# vis22/green_yellow_1_ft

## Resumen

`vis22/green_yellow_1_ft` es una política robótica de imitación construida con SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face y publicado en el artículo arXiv:2506.01844. Se trata de un ajuste fino (*fine-tune*) del modelo base `lerobot/smolvla_base` realizado por el usuario vis22, con 450.046.176 parámetros (aproximadamente 450 millones) almacenados en safetensors y un repositorio de 0,9 GB. El modelo no genera texto ni imágenes: recibe observaciones multimodales de un robot y emite directamente comandos de acción de 7 dimensiones.

El problema que resuelve es concreto y acotado: controlar un brazo robótico `piper_follower` para apilar platos de distintos colores sobre un plato azul, a partir de dos cámaras RGB de 480x640 píxeles y del estado proprioceptivo del robot. Se entrenó con el dataset `vis22/green_yellow_plates`, compuesto por 60 episodios y 16.194 fotogramas grabados a 30 FPS, con dos instrucciones en inglés: apilar el plato amarillo sobre el azul y apilar el plato verde sobre el azul.

Su relevancia es doble. Por un lado, demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento, publicación e inferencia) sobre hardware asequible, ya que SmolVLA está diseñado para desplegarse en GPUs de consumo. Por otro, sirve como ejemplo reproducible de ajuste fino de un VLA pequeño: 100.000 pasos de entrenamiento, batch de 8, optimizador AdamW y tasa de aprendizaje de 1e-5. Conviene tener presente que es un modelo de nicho, sin resultados de evaluación publicados y con 0 descargas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (SmolVLA); codificador visual para dos cámaras RGB, entrada de estado proprioceptivo y decodificador de acciones |
| Parámetros totales | 450.046.176 (según pesos en safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo distribuye pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible; las instrucciones de tarea del dataset están en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Pipeline | robotics |
| Tamaño del repositorio | 0,9 GB |
| Tipo de robot | `piper_follower` |
| Cámaras requeridas | `cam_global`, `cam_gripper` (480x640, 30 FPS) |
| Entradas | `observation.state` (7,), `observation.images.cam_global` (3, 480, 640), `observation.images.cam_gripper` (3, 480, 640) |
| Salidas | `action` (7,) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en arXiv:2506.01844: un VLA compacto que combina un componente de visión-lenguaje con un decodificador de acciones, y que según su model card "alcanza un rendimiento competitivo con costes computacionales reducidos y puede desplegarse en hardware de consumo". La política consume tres observaciones (estado de 7 dimensiones y dos imágenes RGB de 480x640) y produce un vector de acción continuo de 7 dimensiones, que corresponde a los grados de libertad del `piper_follower` más la pinza. Los detalles internos de la arquitectura (número de capas, mecanismo de atención, tipo de decodificador de acciones) no se detallan en la información disponible y deben consultarse en el artículo citado.

El ajuste fino se realizó sobre el dataset `vis22/green_yellow_plates`, con 60 episodios y 16.194 fotogramas a 30 FPS (aproximadamente 9 minutos de datos efectivos repartidos en dos tareas). La configuración de entrenamiento reportada es: 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni de ningún otro método de alineación, algo esperable en una política de imitación. La composición exacta del dataset, el número de tokens de entrenamiento del modelo base y cualquier innovación técnica adicional no están disponibles en la información proporcionada.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 7 dimensiones para un brazo `piper_follower` con pinza.
- Apilado guiado por lenguaje: acepta instrucciones textuales ("Stack the yellow plate on top of the blue plate", "Stack the green plate on top of the blue plate") y condiciona la política a la tarea indicada.
- Percepción visual dual: procesa simultáneamente una vista global de la escena (`cam_global`) y una vista de pinza (`cam_gripper`), ambas a 480x640 y 30 FPS.
- Discriminación por color: el dataset de entrenamiento incluye platos amarillos y verdes sobre un plato azul, por lo que la política aprende a distinguir objetos por color.
- Integración con propriocepción: combina la señal visual con el estado articular de 7 dimensiones del robot.
- Ejecución mediante el ecosistema LeRobot: compatible con `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje conversacional).
- Capacidades de agente multi-paso: no aplica en el sentido de agentes de software; la política ejecuta una única tarea de manipulación por episodio.
- Capacidades multilingües: no disponible; las instrucciones documentadas están en inglés.
- Modo de razonamiento explícito (*thinking mode*): no disponible.
- Capacidades de audio o visión generalista: no disponibles; la visión está especializada en las dos cámaras del montaje.

## Casos de uso

- Apilado automatizado de platos en un banco de laboratorio: la política ejecuta la secuencia de recogida y colocación sobre el plato azul usando las dos cámaras y el estado articular, lo que permite montar una celda de manipulación reproducible con hardware de bajo coste.
- Clasificación y apilado por color: al haberse entrenado con platos amarillos y verdes, puede emplearse para separar piezas por color y apilarlas en la posición designada, un patrón habitual en tareas de *pick-and-place* industriales ligeras.
- Punto de partida para *fine-tuning* en tareas de apilado: al ser un ajuste fino de `lerobot/smolvla_base` con 100.000 pasos, sirve como referencia de configuración (AdamW, lr 1e-5, batch 8) para reentrenar con otros objetos o posiciones.
- Validación del flujo completo de LeRobot: útil como caso de estudio docente para recorrer instalación, grabación de datos con dos cámaras, entrenamiento, publicación en el Hub e inferencia con `lerobot-rollout`.
- Evaluación comparativa de políticas VLA: permite contrastar SmolVLA frente a alternativas como ACT sobre el mismo montaje y el mismo dataset de 60 episodios, midiendo tasa de éxito por tarea.
- Generación de datos y evaluación de robustez: al ejecutarse con `--strategy.type=base` sin grabar episodios, se puede lanzar en bucle para medir la sensibilidad a cambios de iluminación, posición inicial de los platos o pequeños desplazamientos de cámara.
- Demostración de inferencia en GPU de consumo: con ~450 millones de parámetros, es viable desplegarlo en una estación de trabajo con GPU de gama media para demostraciones en ferias o aulas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de `vis22/green_yellow_1_ft` indica explícitamente: "No evaluation results have been provided for this policy yet". No se reportan tasas de éxito por tarea, número de ensayos, ni métricas de pérdida de entrenamiento. Tampoco se documentan comparaciones con `lerobot/smolvla_base` u otros modelos sobre el dataset `vis22/green_yellow_plates`.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB solo para los pesos en precisión de 16 bits y alrededor de 1,8 GB en FP32; sumando activaciones del codificador visual de dos imágenes de 480x640 y del decodificador de acciones, es razonable presupuestar entre 2 y 4 GB de VRAM. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM y soporte CUDA. Para entrenamiento, una RTX 3090, RTX 4090, A100 o H100 aceleran notablemente los 100.000 pasos de ajuste fino.
- GPU de consumo: sí, cabe holgadamente en tarjetas como RTX 3060, RTX 4060, RTX 4070, RTX 4090 o superiores. El propio SmolVLA está diseñado para hardware de consumo.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` (inferencia sin grabación) es la vía documentada. El modelo requiere el stack `lerobot` (versión de referencia 0.6.1) con PyTorch y CUDA. Servidores de inferencia para LLM como vLLM, llama.cpp, Ollama o TGI no aplican a esta política robótica.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se documenta la frecuencia de control en inferencia ni el tiempo de respuesta por acción.
- Requisitos adicionales de hardware: un brazo `piper_follower` y dos cámaras (global y de pinza) configuradas a 480x640 y 30 FPS, con nombres de cámara que coincidan exactamente con las claves de observación del entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vis22/green_yellow_1_ft | SmolVLA (fine-tune) | 450.046.176 | 60 episodios, 16.194 fotogramas, robot `piper_follower` | apache-2.0 | HuggingFace, 0 descargas |
| lerobot/smolvla_base | SmolVLA (base) | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace (modelo base) |
| vis22/act_stack | ACT | no disponible | no disponible | no disponible | HuggingFace (mismo autor, tarea de apilado de platos) |
| lerobot/act | ACT | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace |

La comparación cuantitativa de rendimiento no es posible con los datos disponibles: ni el modelo base ni las alternativas publican tasas de éxito sobre el dataset `vis22/green_yellow_plates`. La diferencia principal identificable es de enfoque arquitectónico: SmolVLA es un VLA que acepta instrucciones en lenguaje y procesa dos cámaras, mientras que ACT es una política de imitación basada en transformer de acciones, sin componente de lenguaje.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni número de ensayos publicados, por lo que se desconoce la fiabilidad real de la política en el mundo físico.
- Dataset muy reducido: 60 episodios y 16.194 fotogramas para dos tareas. El riesgo de sobreajuste a posiciones, iluminación y fondo concretos es alto.
- Especialización extrema: solo reconoce las tareas "Stack the yellow plate on top of the blue plate" y "Stack the green plate on top of the blue plate". Fuera de ese enunciado y de esa configuración de escena, el comportamiento no está garantizado.
- Dependencia del hardware exacto: requiere un brazo `piper_follower` y cámaras con los nombres `cam_global` y `cam_gripper`. Cambiar el tipo de robot, la resolución o el montaje de las cámaras invalida la política.
- Sensibilidad a condiciones visuales: cambios de iluminación, fondo, posición inicial de los platos o presencia de objetos distractores pueden degradar el rendimiento, algo que el autor no ha caracterizado.
- Idiomas: no hay información sobre el comportamiento con instrucciones en castellano u otros idiomas distintos del inglés.
- Sesgos: no se documentan análisis de sesgo. En una política de manipulación, el sesgo relevante sería la dependencia de la distribución de datos (colores, posiciones y texturas concretas).
- Alucinación: el concepto no aplica en el sentido de generación de texto, pero sí existe el riesgo equivalente de acciones incorrectas o inseguras cuando la escena difiere de la distribución de entrenamiento.
- Licencia: apache-2.0 permite uso comercial y modificación, pero al derivar de `lerobot/smolvla_base` conviene verificar la licencia y las condiciones de ese modelo base y del dataset `vis22/green_yellow_plates` antes de un despliegue comercial.
- Advertencia de producción: no se recomienda su uso en entornos industriales reales sin una evaluación propia y sin mecanismos externos de seguridad, dado que no existen métricas publicadas de robustez ni de seguridad.
- Fecha de publicación: la ficha del Hub indica creación el 30 de septiembre de 2026, dato poco habitual que conviene contrastar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vis22/green_yellow_1_ft
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/green_yellow_plates
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/green_yellow_plates
- Artículo de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (*rollout*): https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor: https://huggingface.co/vis22/models
