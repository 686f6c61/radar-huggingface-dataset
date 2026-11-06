# TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60

## Resumen

El modelo `pill_sorting_full_ft_a100_v3_dagger60` es una política de visión-lenguaje-acción (VLA) desarrollada por TomasAnderegg, obtenida mediante ajuste fino del modelo base `lerobot/smolvla_base` con la librería LeRobot. Está diseñada específicamente para una tarea robótica de manipulación: clasificar píldoras de distintos colores (rojo, verde, azul, amarillo) en compartimentos con formas geométricas (triángulo, cuadrado, cruz, círculo) sobre un robot de tipo `so_follower` (SO-100/SO-101 de bajo coste).

El modelo parte de la arquitectura SmolVLA, un VLA compacto y eficiente presentado en el paper arXiv:2506.01844, que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones para generar comandos motores directamente a partir de imágenes y del estado del robot. Con 450 millones de parámetros, el modelo es lo suficientemente pequeño como para ejecutarse en hardware de consumo, lo que lo hace relevante para experimentación en robótica de bajo coste.

Este ajuste concreto se ha entrenado sobre el dataset `pill_sorting_big_datav3_dagger_60`, que contiene 360 episodios y 278.151 fotogramas a 30 FPS, recogidos mediante una estrategia de DAgger (imitation learning iterativo con correcciones humanas). El resultado es un controlador especializado que ejecuta instrucciones en lenguaje natural del tipo "pon la píldora roja en el compartimento triangular", pero limitado exclusivamente al dominio de la tarea para la que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (instrucciones en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower |
| Cámaras | front (1 cámara, 640x480, 30 FPS) |
| Entrada de estado | observation.state, shape (6,) |
| Salida de acción | action, shape (6,) |
| Tamaño del repositorio | 39,9 GB |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, una arquitectura VLA compacta que integra percepción visual, comprensión del lenguaje y generación de acciones en un único transformer. El modelo consume una imagen de cámara frontal de 480x640 píxeles, un vector de estado del robot de 6 dimensiones y una instrucción en lenguaje natural, y produce un vector de acción de 6 dimensiones que se envía al robot `so_follower`. La arquitectura está pensada para ser eficiente computacionalmente y desplegable en hardware de consumo, en contraste con VLAs de mayor tamaño como RT-2 o OpenVLA.

El ajuste fino se realizó durante 20.000 pasos con un batch size de 64, optimizador AdamW, learning rate de 1e-4 y semilla 1000, usando LeRobot 0.6.2. El dataset de entrenamiento contiene 360 episodios y 278.151 fotogramas a 30 FPS, recogidos con una estrategia DAgger (Dataset Aggregation) que combina demostraciones humanas con correcciones iterativas sobre las políticas intermedias. Las tareas cubren 12 combinaciones de color de píldora y forma de compartimento. No se especifica en la información disponible el número de tokens de entrenamiento del modelo base SmolVLA ni si se aplicaron técnicas de RLHF o DPO en el ajuste.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones a partir de una imagen de cámara frontal y del estado del robot.
- Comprensión de instrucciones en lenguaje natural para seleccionar la tarea entre 12 combinaciones posibles (4 colores x 3 formas por color, según el dataset).
- Manipulación de objetos mediante un robot de tipo `so_follower` con una sola cámara.
- Ejecución de políticas de imitación entrenadas con DAgger, lo que aporta robustez frente a estados de recuperación (correcciones humanas incluidas en el dataset).
- No soporta tool calling, function calling ni razonamiento multi-step en el sentido de un LLM; es una política de control motor especializada.
- Capacidades multilingües: no disponibles; las instrucciones del dataset están en inglés.
- No dispone de modo "thinking", visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Clasificación automatizada de píldoras en entornos de laboratorio: el modelo puede ejecutar instrucciones como "pon la píldora roja en el compartimento triangular" sobre un robot SO-100/SO-101, adecuado para prototipos de automatización farmacéutica de bajo coste.
- Investigación en imitation learning: sirve como punto de partida para estudiar el efecto de DAgger frente a behavior cloning puro, ya que el dataset incluye correcciones iterativas y el modelo es reproducible con LeRobot.
- Benchmark de VLAs compactos en hardware de consumo: con 450M parámetros, permite comparar el rendimiento de SmolVLA frente a políticas más grandes en tareas de manipulación simples sin necesidad de GPUs de datacenter.
- Educación y formación en robótica: el flujo `lerobot-rollout` y la documentación de LeRobot permiten desplegar la política en un robot de bajo coste para prácticas docentes de visión por computador y control.
- Pruebas de robustez ante variaciones de iluminación y posicionamiento: al estar entrenado con DAgger, puede evaluarse su tolerancia a estados fuera de distribución en tareas de pick-and-place con objetos pequeños.
- Base para ajuste fino en nuevas tareas de sorting: el modelo puede reentrenarse con `lerobot-train` sobre otros datasets de clasificación de objetos, reutilizando la arquitectura SmolVLA y el pipeline de LeRobot.
- Validación de pipelines de datos robóticos: el dataset asociado (360 episodios, 278k fotogramas) y el modelo permiten reproducir el entrenamiento completo y verificar la integración de LeRobot 0.6.2 en flujos de CI para robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas como MMLU, HumanEval o GSM8K, que además no aplican a una política VLA de control motor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450M parámetros en safetensors (fp32/bf16), la inferencia requiere aproximadamente 1-2 GB de VRAM, aunque el repositorio ocupa 39,9 GB por incluir checkpoints y posiblemente estados del optimizador.
- GPU recomendadas: el paper de SmolVLA indica que está diseñado para hardware de consumo; se espera que funcione en GPUs consumer como RTX 3060, RTX 4060 o superiores, aunque no se especifican modelos concretos en la información disponible.
- Cabe en GPU consumer: sí, según la descripción del modelo base ("can be deployed on consumer-grade hardware").
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El control se ejecuta a 30 FPS según la tasa del dataset, pero no se confirma que la política alcance ese régimen en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pill_sorting_full_ft_a100_v3_dagger60 | 450M | no disponible | Sorting de píldoras con SO-100/SO-101 | Apache 2.0 | Hugging Face (LeRobot) |
| lerobot/smolvla_base | no disponible | no disponible | VLA base para ajuste fino | Apache 2.0 | Hugging Face (LeRobot) |
| OpenVLA | 7B | no disponible | VLA generalista de manipulación | no disponible en la información | Hugging Face |
| RT-2 | no disponible | no disponible | VLA generalista de Google DeepMind | no comercial | No público |

La comparación con OpenVLA y RT-2 es solo orientativa por categoría (VLA para robótica); no se dispone de datos de rendimiento comparables en la información proporcionada. SmolVLA se posiciona como alternativa compacta (450M frente a 7B de OpenVLA) orientada a hardware de consumo.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en la tarea de sorting de píldoras sobre un robot `so_follower` con una cámara frontal; no generaliza a otras tareas, objetos o morfologías de robot sin reentrenamiento.
- No se han publicado evaluaciones en robot real, por lo que se desconoce la tasa de éxito y la robustez ante variaciones de iluminación, posición de objetos o distracciones.
- El dataset de entrenamiento contiene solo 12 combinaciones de color y forma; cualquier instrucción fuera de ese conjunto puede producir comportamientos erróneos o alucinaciones de acción.
- Las instrucciones están en inglés; no se garantiza el comportamiento con instrucciones en castellano u otros idiomas.
- Riesgo de sobreajuste al entorno de recogida de datos (posición de cámara, mesa, iluminación); el rendimiento puede degradarse en configuraciones distintas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la responsabilidad sobre el despliegue en entornos reales (farmacéutico, sanitario) recae en el integrador; no hay certificaciones ni garantías.
- El repositorio ocupa 39,9 GB, lo que puede dificultar su descarga y almacenamiento en entornos con recursos limitados.
- No se especifican sesgos conocidos más allá de los derivados del dataset de entrenamiento (colores y formas concretos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60
- Dataset de entrenamiento: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_big_datav3_dagger_60
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TomasAnderegg/pill_sorting_big_datav3_dagger_60
