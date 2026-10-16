# WhichIsAvailable/SmolVLA-finetune-l1

## Resumen
SmolVLA-finetune-l1 es un ajuste fino de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto desarrollado por HuggingFace dentro del ecosistema LeRobot. Lo publica el usuario WhichIsAvailable en el Hub y está concebido para control robótico por imitación: recibe imágenes de cámara y el estado del robot y emite directamente comandos de acción, sin generar texto intermedio. El modelo base SmolVLA se describe como un VLA eficiente que alcanza rendimiento competitivo con un coste computacional reducido y que puede desplegarse en hardware de consumo.

Este ajuste concreto tiene 450.046.176 parámetros (~450M) y se ha entrenado sobre el dataset HuggingFaceVLA/smol-libero, compuesto por 50 episodios y 13.021 frames a 20 FPS, para una única tarea: "put both the cream cheese box and the butter in the basket". El repositorio ocupa 1,6 GB y los pesos se distribuyen en formato safetensors, cargables con la librería lerobot.

Su relevancia radica en que demuestra el flujo completo de ajuste de un VLA de menos de 500 millones de parámetros sobre datos de imitación reducidos, algo que contrasta con políticas robóticas de miles de millones de parámetros. No obstante, se trata de un modelo de autor individual, sin licencia declarada, sin idiomas especificados y sin resultados de evaluación publicados en su model card, por lo que debe tratarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA); modelo multimodal basado en transformers con experto de acción, según el paper de SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 (~450M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 1,6 GB |
| Entradas | observation.images.image (3, 256, 256), observation.images.image2 (3, 256, 256), observation.state (8,), observation.state.joint (7,) |
| Salida | action (7,) |

## Arquitectura y entrenamiento
El modelo es un ajuste fino de SmolVLA, un VLA compacto de HuggingFace descrito en el paper arXiv:2506.01844. La arquitectura es de tipo visión-lenguaje-acción: combina un codificador visual que procesa dos cámaras a resolución 256x256 (observation.images.image y observation.images.image2), una representación del estado del robot (observation.state, 8 dimensiones, y observation.state.joint, 7 dimensiones) y una salida de control de 7 dimensiones. Según la descripción del modelo base, está diseñado para ser eficiente y desplegable en hardware de consumo. No se detalla en la informacion disponible el número de tokens de entrenamiento ni la composición completa del dataset más allá de los datos del ajuste.

El entrenamiento de este ajuste concreto se realizó con LeRobot 0.6.2 sobre el dataset HuggingFaceVLA/smol-libero (50 episodios, 13.021 frames, 20 FPS) y una única tarea en inglés. La configuración fue de 10.000 pasos, batch size de 8, optimizador AdamW, learning rate de 0,0001 y semilla 1000. No se indica si hubo fases de RLHF, DPO o decodificación especulativa; al tratarse de una política de imitación, la supervisión es por demostración. Tampoco se especifica el backbone exacto del VLM base en la información proporcionada.

## Capacidades
- Control robótico por imitación: genera acciones de 7 dimensiones a partir de observaciones multimodales, sin producir texto.
- Procesamiento de visión multivista: consume dos imágenes de 256x256 píxeles (cámaras `image` e `image2`).
- Integración de estado propioceptivo: admite estado del robot de 8 dimensiones y estado articular de 7 dimensiones.
- Condicionamiento por instrucción en lenguaje: la tarea se pasa como cadena de texto ("put both the cream cheese box and the butter in the basket").
- Ejecución de una tarea de manipulación específica: colocar una caja de queso crema y mantequilla en una cesta.
- No se documentan capacidades de tool calling ni de function calling.
- No se documentan capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades multilingües; la única tarea registrada está en inglés.
- No se documentan modos especiales como thinking mode, procesamiento de audio o generación de código.

## Casos de uso
- Automatización de una tarea pick-and-place en laboratorio: el modelo ejecuta el gesto de depositar la caja de queso crema y la mantequilla en la cesta, recibiendo dos vistas de cámara y el estado del brazo, lo que permite reproducir la tarea sin reprogramar la política.
- Base para fine-tuning de nuevas tareas: partiendo de estos pesos y con el comando `lerobot-train`, un equipo puede reentrenar la política sobre un dataset propio para otra tarea de manipulación, aprovechando que solo requiere 450M de parámetros.
- Investigación en VLA eficientes: sirve como punto de partida para estudiar hasta qué punto un VLA de menos de 500M de parámetros puede aprender tareas de manipulación a partir de pocos episodios (50 en este caso).
- Prototipado en hardware asequible: al ser desplegable en hardware de consumo según la documentación de SmolVLA, encaja en montajes de bajo coste con brazos tipo SO-100 y cámaras OpenCV, usando `lerobot-rollout`.
- Evaluación de imitación con datos escasos: el modelo permite medir el efecto de entrenar con solo 13.021 frames y 10.000 pasos, útil para comparar estrategias de recolección de datos.
- Docencia y demostraciones de robótica: se puede mostrar el ciclo completo (grabar datos, entrenar, desplegar y ejecutar) con un único repositorio de 1,6 GB, adecuado para aulas y talleres.
- Pipeline de recolección y reentrenamiento continuo: al integrarse en LeRobot, puede usarse en un bucle en el que se graban episodios nuevos, se reentrena la política y se vuelve a desplegar para mejorar la tasa de éxito en la misma tarea.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card de este ajuste indica explícitamente que no se han proporcionado resultados de evaluación ("No evaluation results have been provided for this policy yet") y no incluye tabla de trials, éxitos ni tasas de éxito para la tarea entrenada.

## Requisitos de hardware
- Parametros del modelo: ~450M, lo que implica un peso en memoria aproximado de 1,8 GB en FP32 y unos 0,9 GB en FP16/BF16 (estimación a partir del recuento de parámetros y del tamaño del repo de 1,6 GB).
- VRAM estimada para inferencia: en torno a 2-4 GB en FP16 considerando pesos y activaciones de dos imágenes de 256x256; no hay cifras oficiales publicadas.
- GPU recomendadas: no disponibles de forma específica; por tamaño, cabe con holgura en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090. El modelo base se describe como desplegable en hardware de consumo.
- Ejecución en CPU: no confirmada en la información disponible, aunque el tamaño reducido lo haría viable en principio.
- Opciones de despliegue: LeRobot con PyTorch y, según los comandos de la model card, `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento con `--policy.device=cuda`. vLLM, TGI, llama.cpp y Ollama no se mencionan ni aplican directamente al no distribuirse GGUF ni ser un modelo de generación de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA-finetune-l1 (este) | 450.046.176 (~450M) | no disponible | no disponible | HuggingFace, repo de 1,6 GB |
| SmolVLA (base) | ~450M | no disponible | no disponible | HuggingFace / LeRobot |
| OpenVLA | ~7B (dato de la literatura, no confirmado en esta ficha) | no disponible | no disponible | HuggingFace / GitHub |
| NVIDIA GR00T N1 | no disponible | no disponible | no disponible | HuggingFace / GitHub |

No se dispone de datos de rendimiento (MMLU, HumanEval u otros) para ninguno de estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros y disponibilidad.

## Limitaciones y advertencias
- Entrenado sobre un único dataset (50 episodios, 13.021 frames) y una única tarea en inglés: alto riesgo de sobreajuste y de fallo ante cambios de entorno, iluminación, posiciones de objeto o distractores.
- Sin resultados de evaluación publicados: se desconoce la tasa de éxito real de la política.
- Sesgos conocidos: no documentados en la información disponible; el dataset smol-libero condiciona el comportamiento a un dominio concreto de objetos y escenas.
- Alucinación: al no generar texto, el riesgo se traduce en acciones incorrectas o sin sentido físico en lugar de respuestas inventadas.
- Idiomas: no disponibles; la única instrucción registrada está en inglés, por lo que no hay evidencia de soporte multilingüe.
- Licencia no disponible ("[More Information Needed]"): no se puede confirmar el uso comercial ni las restricciones de redistribución; desaconsejado en producción sin aclarar la licencia.
- Longitud de contexto no disponible: se desconoce cuántas observaciones pasadas puede tener en cuenta.
- Dependencia de hardware y calibración: los nombres de cámara deben coincidir con los del entrenamiento y el robot debe calibrarse; el `--robot.port` y los índices de cámara son específicos de cada máquina.
- Posible brecha simulación-real: el dataset smol-libero procede de un entorno de referencia tipo LIBERO, lo que puede reducir el rendimiento en un robot físico distinto.
- Salida limitada a 7 dimensiones de acción y ausencia de soporte de tool calling, agentes o razonamiento multi-paso.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/WhichIsAvailable/SmolVLA-finetune-l1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Paper en arXiv: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceVLA/smol-libero
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HuggingFaceVLA/smol-libero
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
