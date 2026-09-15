# taewonkoo/smolvla-office-mixed30-scizor20-30k-bs8-fp32-fullft

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot. Esta ficha concreta corresponde a un *fine-tuning* completo realizado por el usuario `taewonkoo` sobre el modelo base `lerobot/smolvla_base`, orientado a una única tarea de manipulación robótica: recoger dos rotuladores de pizarra de una mesa y depositarlos en un soporte rojo. El modelo consume el estado articular del robot y tres imágenes de cámara, y produce un vector de acción de 6 dimensiones.

El modelo tiene 450.046.176 parámetros (aproximadamente 450 M), lo que lo sitúa muy por debajo de otros VLA como OpenVLA (7 B) o pi0. Su tamaño reducido permite desplegarlo en hardware de consumo, tal como afirma la propia documentación de SmolVLA, y ejecutar inferencia a la frecuencia de control del robot (los datos se grabaron a 30 FPS). El repositorio ocupa 0,9 GB y los pesos se distribuyen en formato safetensors.

Es relevante ahora porque ejemplifica el flujo completo de LeRobot: grabar un dataset de imitación pequeño (40 episodios, 22.522 fotogramas), ajustar un VLA preentrenado y publicar la política lista para ejecutar con `lerobot-rollout`. La licencia Apache-2.0 facilita su reutilización, aunque no se han publicado resultados de evaluación ni métricas de éxito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje-acción (VLA) compacto; detalles internos no disponibles en la información proporcionada (véase arXiv:2506.01844) |
| Parámetros totales | 450.046.176 (≈ 450 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica (modelo de acción, no de generación de texto libre) |
| Tipos de cuantización | No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ, etc.). El identificador del repositorio indica *full fine-tuning* en fp32 |
| Idiomas soportados | No disponible (no se documenta soporte multilingüe); el ejemplo de uso emplea una instrucción en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato nativo de LeRobot), repositorio de 0,9 GB |
| Modelo base | lerobot/smolvla_base (fine-tuning completo) |
| Robot objetivo | `so_follower` |
| Cámaras de entrada | `front`, `top` (claves declaradas en la model card); la config de entradas incluye `observation.images.camera1`, `camera2`, `camera3` y `empty_camera_0` |
| Entradas | `observation.state` (6,); 3 imágenes VISUAL (3, 256, 256); `observation.images.empty_camera_0` (3, 480, 640) |
| Salidas | `action` (6,) |
| Frecuencia de los datos | 30 FPS |
| Librería / versión | LeRobot 0.6.2 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

SmolVLA se presenta como un modelo de visión-lenguaje-acción compacto y eficiente, capaz de alcanzar un rendimiento competitivo con un coste computacional reducido y de ejecutarse en hardware de consumo. La información disponible no detalla la composición interna (tipo de backbone visual, mecanismo de atención o módulo de acción); esos detalles deben consultarse en el informe técnico arXiv:2506.01844. Lo que sí se especifica es la interfaz: el modelo recibe el estado del robot y observaciones visuales de varias cámaras, y emite un vector de acción de 6 dimensiones, propio de un brazo seguidor tipo `so_follower`.

El entrenamiento de esta política consistió en un ajuste completo (*full fine-tuning*, según el sufijo `fullft` y la indicación `fp32` del nombre del repositorio) sobre `lerobot/smolvla_base`, durante 30.000 pasos con tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, usando LeRobot 0.6.2. El dataset `taewonkoo/office_task_mixed_suboptimal_seed1000_30pct_40ep` contiene 40 episodios y 22.522 fotogramas a 30 FPS para una sola tarea ("Pick up the two whiteboard markers from the table and put them in the red holder."). El nombre del dataset sugiere que un 30 % de los datos son demostraciones subóptimas (etiqueta `30pct` y `mixed_suboptimal`), una práctica habitual para robustecer políticas de imitación; no se documenta ninguna fase de RLHF, DPO ni refuerzo adicional. Tampoco se aclara el significado del fragmento `scizor20` del nombre del repositorio.

## Capacidades

- Generación de acciones motoras: produce comandos de 6 grados de libertad a partir del estado articular y de la percepción visual.
- Percepción visual multi-cámara: procesa tres entradas visuales de 3×256×256 y una cámara adicional de 3×480×640 (la clave `empty_camera_0` sugiere que se trata de un hueco de cámara no utilizada o no disponible).
- Condicionamiento por instrucción en lenguaje natural: acepta un campo `--task` con la descripción textual de la tarea, aunque el entrenamiento se limita a una única instrucción.
- Ejecución de una tarea concreta de manipulación sobre un robot `so_follower`, controlada a la frecuencia de los datos (30 FPS).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta comportamiento agéntico, razonamiento multi-paso, planificación ni memoria de episodios.
- No se documenta generación de texto libre, código, matemáticas, visión general (VQA, OCR) ni audio.
- No se documenta capacidad multilingüe.

## Casos de uso

- Automatización de una tarea de escritorio concreta: recoger dos rotuladores de pizarra y dejarlos en un soporte rojo. El modelo está entrenado específicamente para esa secuencia sobre un robot `so_follower`, por lo que puede ejecutarse de forma repetida con `lerobot-rollout` en un montaje idéntico.
- Punto de partida para *fine-tuning* propio: al derivar de `lerobot/smolvla_base` y publicarse bajo Apache-2.0, sirve como inicialización para nuevas tareas de manipulación con `lerobot-train`, sustituyendo el dataset por uno propio.
- Investigación en aprendizaje por imitación con datos subóptimos: el dataset mezcla demostraciones subóptimas (aproximadamente el 30 %, según el nombre del repositorio), lo que permite estudiar la robustez de la política ante trayectorias imperfectas.
- Docencia y prototipado en robótica de bajo coste: con 450 M de parámetros y 0,9 GB de pesos, se puede desplegar en un equipo con GPU de gama media o incluso en CPU para pruebas de integración, sin necesidad de clústeres.
- Reproducibilidad de experimentos: la configuración publicada (semilla 1000, 30.000 pasos, lote 8, AdamW, lr 1e-4, LeRobot 0.6.2) permite replicar el entrenamiento y comparar variantes de hiperparámetros.
- Evaluación comparativa de políticas VLA pequeñas: sirve como referencia de bajo coste frente a modelos mucho mayores en estudios de coste computacional frente a tasa de éxito, siempre que se midan resultados reales en robot.
- Validación de canal de despliegue: útil para verificar la cadena completa LeRobot (calibración de robot y cámaras, `lerobot-rollout`, claves de observación) antes de invertir en modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que todavía no se han proporcionado resultados de evaluación para esta política (*"No evaluation results have been provided for this policy yet."*), por lo que no existe tasa de éxito, número de ensayos ni comparación cuantitativa con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 450 M de parámetros ocupan aproximadamente 1,8 GB; en fp16/bf16, unos 0,9 GB (coincide con el tamaño del repositorio, 0,9 GB). A ello hay que sumar el coste de los codificadores visuales y de las activaciones, que la información disponible no cuantifica.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería ser suficiente; no se especifican modelos concretos en la documentación.
- Cabe en GPU de consumo: sí, según la propia descripción de SmolVLA, que afirma que puede desplegarse en hardware de consumo. No se documentan pruebas concretas en RTX 3060, RTX 4090 u otras.
- Ejecución en CPU: no documentada; el comando de ejemplo de LeRobot asume `--policy.device=cuda`.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento) sobre PyTorch y CUDA. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo de acción.
- Latencia y throughput: no disponibles. El sistema debe operar a la frecuencia de control de los datos (30 FPS) para un comportamiento fluido, pero no se publican mediciones de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| taewonkoo/smolvla-office-mixed30-scizor20-30k-bs8-fp32-fullft (esta ficha) | 450.046.176 | VLA compacto, ajustado para una tarea | Apache-2.0 | Hugging Face, vía LeRobot | Sin resultados de evaluación publicados |
| lerobot/smolvla_base | No disponible en la información proporcionada | VLA compacto preentrenado | No disponible en la información proporcionada | Hugging Face, vía LeRobot | Modelo base del que deriva esta política |
| OpenVLA | No disponible en la información proporcionada | VLA | No disponible en la información proporcionada | Público | Alternativa de mayor tamaño citada habitualmente en la literatura de VLA |
| pi0 (Physical Intelligence) | No disponible en la información proporcionada | VLA | No disponible en la información proporcionada | Público | Alternativa orientada a control robótico generalista |

No se dispone de datos verificados de parámetros, contexto, rendimiento o licencia de las alternativas dentro de la información proporcionada, por lo que la comparación cuantitativa no puede completarse.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito ni número de ensayos, de modo que el rendimiento real de la política es desconocido.
- Especialización extrema: está entrenado para una única tarea, un único tipo de robot (`so_follower`) y una configuración concreta de cámaras. No generaliza a otras tareas, objetos o montajes.
- Dependencia estricta de las claves de observación: los nombres de cámara deben coincidir con los usados en el entrenamiento (`front`, `top`, `camera1`–`camera3`), o la inferencia fallará o producirá acciones incorrectas.
- Dataset muy pequeño: 40 episodios y 22.522 fotogramas para 30 FPS; es propenso al sobreajuste a posiciones de objeto, iluminación y fondo del entorno de grabación.
- Presencia de `empty_camera_0`: la entrada declarada sugiere una cámara ausente o un marcador de posición, lo que puede indicar datos incompletos o entrenamiento con una ranura vacía.
- Datos parcialmente subóptimos: según el nombre del dataset, alrededor del 30 % de las demostraciones serían subóptimas; esto puede reducir la precisión final si no se gestiona adecuadamente.
- Sesgos: no se documenta ningún análisis de sesgos, y al tratarse de un modelo de acción sobre un entorno físico concreto, el sesgo principal es la sobrerrepresentación del entorno de grabación.
- Riesgo de alucinación: en sentido estricto no genera texto, pero sí puede producir acciones incorrectas o inseguras sin señal de confianza asociada.
- Idiomas: no hay soporte multilingüe documentado; la instrucción de tarea se proporciona en inglés.
- Licencia: el modelo se publica bajo Apache-2.0, lo que permite uso comercial, pero conviene verificar la licencia del modelo base `lerobot/smolvla_base` y del dataset de entrenamiento antes de un despliegue comercial.
- Señales de madurez: 0 descargas y 0 *likes* en el momento de los datos, sin validación por parte de la comunidad.
- Discrepancia a revisar: el identificador indica `fp32`, mientras que el tamaño del repositorio (0,9 GB) es coherente con pesos en fp16/bf16; conviene comprobar la precisión real de los tensores antes de planificar requisitos de memoria.
- Seguridad física: cualquier despliegue en un robot real debe incorporar paradas de emergencia y límites de par, ya que el modelo no incluye mecanismos de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taewonkoo/smolvla-office-mixed30-scizor20-30k-bs8-fp32-fullft
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/taewonkoo/office_task_mixed_suboptimal_seed1000_30pct_40ep
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=taewonkoo/office_task_mixed_suboptimal_seed1000_30pct_40ep
- Informe técnico de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (*rollout*): https://huggingface.co/docs/lerobot/main/en/inference
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
