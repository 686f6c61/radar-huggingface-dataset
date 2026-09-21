# vis22/new_act_stack_50

## Resumen

`vis22/new_act_stack_50` es una política robótica de imitación entrenada con ACT (Action Chunking with Transformers), el método descrito en el paper arXiv:2304.13705, y distribuida a través de la librería LeRobot de Hugging Face. El modelo aprende de datos de teleoperación a predecir secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suele traducirse en tasas de éxito altas en tareas de manipulación.

Se trata de un modelo muy pequeño (51.619.463 parámetros, repo de 0.2 GB) especializado en una única tarea: apilar platos sobre un plato azul y volver a la posición de reposo. Consume el estado del robot (vector de 7 dimensiones) y dos flujos de imagen de 480x640 desde las cámaras `cam_global` y `cam_gripper`, y produce un vector de acción de 7 dimensiones. El robot objetivo es un `piper_follower`.

Su relevancia es práctica más que de investigación: es un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot (grabación de datos, entrenamiento, despliegue en robot real) con licencia Apache-2.0 y con el pipeline de ejecución documentado. No es un modelo de propósito general ni un modelo de lenguaje: no procesa texto libre ni mantiene conversaciones, y su condicionamiento se limita a una instrucción de tarea fija.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con cuello de botella variacional (CVAE) para imitación; backbone visual no especificado en la model card (en LeRobot, ACT usa por defecto ResNet-18) |
| Parametros totales | 51.619.463 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; política de imitación que consume un horizonte de observación y emite un chunk de acciones (tamaño de chunk no especificado) |
| Tipos de cuantizacion | no disponibles; el repo solo publica pesos en safetensors en precisión completa |
| Idiomas soportados | no aplica; el condicionamiento es una instrucción de tarea textual fija ("Stack all the plates on top of the blue plate, then return to home position") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`, pipeline `robotics`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones futuras en lugar de una sola acción por paso. La formulación original combina un transformer encoder-decoder con un componente generativo tipo CVAE: un encoder de estilo procesa la secuencia de acciones objetivo durante el entrenamiento y un decoder condicionado por las observaciones (imágenes y estado propioceptivo) genera el chunk de acciones en inferencia. Esta predicción por bloques es lo que mitiga el problema de paradas y errores acumulados típico de las políticas paso a paso. Los detalles concretos de esta instancia (backbone visual, número de capas, tamaño de chunk, uso o no de la componente CVAE) no están documentados en la model card.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `vis22/plates_stack_merged`, compuesto por 30 episodios y 13.480 fotogramas a 30 FPS, todos ellos de la misma tarea y del mismo robot. La configuración declarada es de 100.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta número de tokens, composición del dataset más allá de los episodios citados, ni ninguna fase de RLHF o DPO, algo esperable en una política de imitación. Tampoco se indica si hubo aumentos de datos o cambios de posición de los objetos durante la recogida.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 7 dimensiones para un robot `piper_follower` a partir de estado propioceptivo más dos vistas de cámara.
- Ejecución de una tarea específica: apilar platos sobre un plato azul y volver a la posición de reposo, según la instrucción textual con la que fue entrenado.
- Percepción visual doble: integra una vista global (`cam_global`) y una vista de pinza (`cam_gripper`) a resolución 480x640 en cada paso.
- Predicción por chunks: emite bloques de acciones en lugar de pasos sueltos, lo que permite control más suave y con menos deriva acumulada.
- Ejecución síncrona a 30 Hz: el dataset está grabado a 30 FPS, por lo que la política debe poder inferir a esa frecuencia para un control fluido.
- No soporta tool calling, function calling ni agentes multi-paso.
- No soporta diálogo, generación de texto, código, matemáticas ni razonamiento simbólico.
- No es multilingüe ni multimodal en el sentido de VLM: solo procesa imágenes y estado numérico de robot.
- No dispone de modo "thinking", ni salida de audio, ni visión de propósito general.

## Casos de uso

- Automatización de una celda de apilado de platos: el modelo puede ejecutar directamente la tarea de colocar platos sobre un plato base y regresar a home, sin lógica de planificación adicional, gracias a que toda la política está aprendida en los pesos.
- Base de partida para nuevos entrenamientos: sirve como referencia reproducible para validar el pipeline de LeRobot (documentación de `lerobot-train`) antes de entrenar políticas propias con datasets mayores.
- Prototipado rápido en robótica de laboratorio: con 51,6 M de parámetros y 0.2 GB de pesos, se puede desplegar en hardware modesto y probar variantes de la tarea en horas, no días.
- Benchmark interno de imitación: al ser una tarea única y bien delimitada, es útil para comparar configuraciones de ACT (learning rate, batch size, número de pasos) manteniendo el dataset constante.
- Investigación sobre generalización posicional: entrenado con 30 episodios, permite estudiar cómo varía la tasa de éxito cuando se cambian posiciones de objetos o iluminación, tal como sugiere la propia plantilla de evaluación de la model card.
- Formación y demos: sirve como ejemplo didáctico completo de entrenamiento y despliegue con `lerobot-rollout` para cursos o talleres de aprendizaje por imitación.
- Evaluación de infraestructura de inferencia robótica: útil para medir latencia y throughput reales de una política de 51,6 M de parámetros con dos cámaras a 30 FPS en una GPU concreta.
- Reutilización del encoder visual: los pesos pueden servir como inicialización para tareas relacionadas con el mismo robot y montaje de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente "_No evaluation results have been provided for this policy yet._" y la tabla de evaluación por tarea (trials, successes, success rate) está vacía.

| Benchmark | Resultado |
|---|---|
| Tasa de éxito en tarea real (plates stacking) | no disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks de LM | no aplica; no es un modelo de lenguaje |

## Requisitos de hardware

- Pesos en precisión completa (fp32): aproximadamente 206 MB, coherente con el tamaño de repo de 0.2 GB.
- Pesos en fp16/bf16: aproximadamente 103 MB.
- VRAM estimada para inferencia: alrededor de 1-2 GB contando pesos, backbone visual y activaciones de dos flujos de imagen de 3x480x640; valor estimado, no publicado por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente. GPUs de datacenter (A100, H100) no aportan ventaja relevante para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna, e incluso es viable probar inferencia en CPU, aunque habría que verificar que se alcanzan los 30 Hz necesarios.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=vis22/new_act_stack_50` es la vía oficial documentada; al ser pesos safetensors de PyTorch, también se pueden cargar con el stack de LeRobot directamente. No se documentan exportaciones a ONNX, TensorRT, llama.cpp, vLLM, TGI, Ollama ni GGUF, que además no aplican a este tipo de política.
- Latencia y throughput: no disponibles. Como referencia operativa, el dataset está grabado a 30 FPS, por lo que el ciclo observación-inferencia-acción debería completarse en menos de 33 ms para un control fluido.

## Comparativa con modelos similares

No hay datos numéricos publicados para las alternativas en la información disponible, por lo que la comparación es cualitativa. Las alternativas consideradas son otras políticas de imitación del ecosistema LeRobot.

| Modelo | Enfoque | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vis22/new_act_stack_50 | ACT (chunking de acciones + CVAE) | 51.619.463 | no disponible (chunk de acciones no especificado) | apache-2.0 | Hugging Face, vía LeRobot |
| Diffusion Policy (políticas LeRobot) | Generación de acciones por difusión | no disponible | no disponible | no disponible en esta búsqueda | LeRobot |
| SmolVLA (LeRobot) | Vision-language-action | no disponible | no disponible | no disponible en esta búsqueda | LeRobot |
| VQ-BeT (LeRobot) | Acciones discretizadas con transformer | no disponible | no disponible | no disponible en esta búsqueda | LeRobot |

Diferencias clave observables: ACT es determinista en su versión básica (con componente estocástica vía CVAE durante el entrenamiento) y tiende a ser más ligero y rápido que Diffusion Policy, que requiere varios pasos de denoising por inferencia. SmolVLA incorpora comprensión de lenguaje, algo que `vis22/new_act_stack_50` no ofrece.

## Limitaciones y advertencias

- Especialización extrema: solo ha sido entrenado para la tarea "apilar platos sobre el plato azul y volver a home"; fuera de ese contexto su comportamiento no está caracterizado.
- Dataset muy pequeño: 30 episodios y 13.480 fotogramas implican poca diversidad de posiciones, iluminación y configuraciones; es probable que la generalización sea limitada.
- Sin resultados de evaluación: no hay tasa de éxito medida, ni en el mismo robot ni en robots distintos; cualquier uso en producción requiere validación propia.
- Dependencia del hardware: la política espera un robot `piper_follower` con cámaras nombradas exactamente `cam_global` y `cam_gripper` y observaciones de forma (7,); un montaje distinto invalida las observaciones.
- Riesgo de fallo silencioso: en políticas de imitación, la deriva de la política ante distribuciones no vistas puede producir movimientos incorrectos sin aviso; se recomienda supervisión humana y paradas de seguridad.
- Sesgos: no aplica en el sentido de sesgos lingüísticos, pero sí existe un sesgo hacia las condiciones del dataset de entrenamiento (posiciones, objetos, fondo).
- Contexto e idioma: no existe ventana de contexto ni capacidad multilingüe; la instrucción de tarea es fija.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar también la licencia de cualquier dataset o código de terceros reutilizado.
- Metadatos anómalos: el modelo registra fechas de creación y actualización de 2026-09-21, posteriores a la fecha habitual de consulta, y 0 descargas y 0 likes; esto sugiere que es un artefacto reciente o de prueba, sin validación por la comunidad.
- Versión de LeRobot: entrenado con LeRobot 0.6.1; la compatibilidad con versiones distintas del paquete no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/new_act_stack_50
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/plates_stack_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/plates_stack_merged
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia / rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre LeRobot; los enlaces listados proceden de la model card y del repositorio oficial del proyecto.
