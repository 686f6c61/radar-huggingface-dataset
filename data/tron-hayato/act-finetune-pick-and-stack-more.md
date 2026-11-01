# Tron-Hayato/act-finetune-pick-and-stack-more

## Resumen

`act-finetune-pick-and-stack-more` es una política de imitación (policy) para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. La desarrolla el usuario Tron-Hayato y se distribuye a través del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de control visuomotor que, a partir de tres cámaras y del estado articular del robot, predice directamente comandos de acción de 6 dimensiones a 30 FPS.

El modelo resuelve una tarea concreta de manipulación: apilar bloques. Se ha afinado sobre el dataset `Tron-Hayato/record-pick-and-stack-more`, compuesto por 150 episodios de teleoperación (160.796 fotogramas a 30 FPS) sobre un robot tipo `so_follower` (SO-100/SO-101 de LeRobot). La política consume `observation.state` (6 valores) más tres flujos de imagen RGB de 480x640 y emite un vector `action` de 6 valores.

Con 51.648.134 parámetros y un repositorio de 0,6 GB, es un modelo pequeño y ligero, pensado para inferencia en tiempo real en hardware de consumo. Su relevancia es la de un ejemplo reproducible de flujo completo de aprendizaje por imitación en LeRobot: captura de datos, entrenamiento con ACT y despliegue con `lerobot-rollout`. La licencia Apache 2.0 facilita su reutilización y adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.648.134 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones oficiales para esta política) |
| Idiomas soportados | no disponible (no procesa lenguaje; la instrucción de tarea se pasa como texto fijo al runner) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 0,6 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza el control. La arquitectura combina un codificador visual (procesa las tres cámaras `side`, `wrist` y `top` a 480x640) con un transformer que fusiona las observaciones visuales y el estado articular de 6 dimensiones para generar secuencias de acciones de 6 dimensiones. El paper original introduce además una técnica de temporal ensembling para promediar predicciones solapadas de chunks.

El entrenamiento se realizó con LeRobot 0.6.1 durante 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset de origen contiene 150 episodios y 160.796 fotogramas a 30 FPS, con una única tarea: "Pick up blocks on the left one by one and stack them on top of the blocks on the right side". No se documenta el uso de RLHF, DPO ni refuerzo; es aprendizaje supervisado puro a partir de demostraciones teleoperadas.

## Capacidades

- Control visuomotor de un robot `so_follower` a partir de tres cámaras RGB y del estado articular.
- Predicción de chunks de acción de 6 dimensiones (típicamente posición de articulaciones o efector final, según la configuración del robot).
- Ejecución de una tarea de manipulación concreta: recoger bloques de la izquierda y apilarlos sobre los de la derecha.
- Inferencia en tiempo real a 30 FPS mediante `lerobot-rollout`.
- Aprendizaje por imitación: la política se puede reentrenar con `lerobot-train` sobre nuevos datasets.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Automatización de apilado de bloques en un banco de pruebas: la política ejecuta la tarea de pick-and-stack sobre un SO-100/SO-101 con tres cámaras, útil para validar pipelines de manipulación antes de escalar a tareas más complejas.
- Reproducción de experimentos de aprendizaje por imitación: sirve como referencia de un entrenamiento ACT completo (20.000 pasos, 150 episodios) para comparar hiperparámetros y curvas de aprendizaje.
- Base para fine-tuning en tareas de ensamblaje: al ser un checkpoint ACT ya entrenado en manipulación de bloques, se puede afinar con nuevos datasets de apilado o encajado con menos datos.
- Docencia y formación en robótica: ejemplo didáctico de flujo LeRobot de extremo a extremo (grabación, entrenamiento, despliegue) con requisitos de hardware modestos.
- Pruebas de integración de hardware: validar la calibración de cámaras y del robot `so_follower` comprobando si la política ejecuta la tarea con éxito en el entorno físico.
- Investigación en robustez visual: evaluar cómo afectan cambios de iluminación, posición de objetos o distractores a una política ACT entrenada con datos limitados.
- Benchmark interno de latencia: medir el rendimiento de inferencia de una política de 51,6 M de parámetros con tres cámaras a 30 FPS en GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 51,6 M de parámetros y pesos en safetensors (0,6 GB de repositorio), la inferencia cabe holgadamente en GPUs de consumo de 8 GB o menos.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (el comando de entrenamiento usa `--policy.device=cuda`); para entrenamiento, una RTX 3090/4090 o superior acelera los 20.000 pasos, aunque el modelo es pequeño.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más; también es viable en CPU para pruebas, con mayor latencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles; el sistema está diseñado para operar a 30 FPS (frecuencia del dataset), pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tron-Hayato/act-finetune-pick-and-stack-more | 51,6 M | 3 camaras 480x640 + estado (6,) | Apilado de bloques (SO follower) | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | Vision + estado | Manipulacion general (benchmarks ALOHA) | Codigo abierto (repositorio del paper) | GitHub / paper |
| Otras politicas LeRobot (p. ej. Diffusion Policy, SmolVLA) | no disponible | Vision + estado (y lenguaje en SmolVLA) | Manipulacion diversa | segun repositorio | Hugging Face (LeRobot) |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenada para una única tarea y un único tipo de robot (`so_follower`); no generaliza a otras tareas ni morfologías sin reentrenamiento.
- Sin resultados de evaluación en robot real: se desconoce la tasa de éxito y la robustez ante variaciones de posición, iluminación o distractores.
- Dataset pequeño (150 episodios) y de un solo operador; probable sobreajuste a las condiciones de captura.
- Requiere que los nombres e índices de cámara coincidan exactamente con las claves de observación (`side`, `wrist`, `top`) y que la resolución sea 480x640 a 30 FPS.
- No procesa lenguaje natural: la instrucción de tarea es un texto fijo que se pasa al runner, no una capacidad del modelo.
- Riesgo de fallos silenciosos en producción: una política de imitación puede ejecutar movimientos plausibles pero incorrectos sin señal de error.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la licencia del dataset de origen antes de redistribuir derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tron-Hayato/act-finetune-pick-and-stack-more
- Dataset de entrenamiento: https://huggingface.co/datasets/Tron-Hayato/record-pick-and-stack-more
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tron-Hayato/record-pick-and-stack-more
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
