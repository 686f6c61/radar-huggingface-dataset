# UNITAmanipulation/act_colorsort

## Resumen

El modelo `UNITAmanipulation/act_colorsort` es una política de robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario UNITAmanipulation y publicada bajo licencia Apache 2.0. Está entrenada con el framework LeRobot de HuggingFace para realizar tareas de manipulación de objetos por color: recoger un bloque azul y colocarlo en la caja azul, o recoger un bloque verde y colocarlo en la caja verde. El modelo aprende mediante imitación a partir de datos teleoperados y predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad del movimiento.

Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero diseñado para ejecutarse en tiempo real sobre un robot seguidor SO-100. Su relevancia radica en que demuestra un flujo completo de entrenamiento de políticas robóticas con LeRobot: dataset propio, entrenamiento con ACT y despliegue directo en hardware real. Es un caso práctico de aprendizaje por imitación aplicado a una tarea de clasificación y manipulación física.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de robotica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con codificación de acciones en chunks. En lugar de predecir una única acción por paso de tiempo, el modelo predice una secuencia de acciones futuras (por ejemplo, 50 pasos) a partir de observaciones visuales y del estado del robot. Esto reduce el error acumulativo y permite movimientos más suaves y robustos frente a perturbaciones.

El entrenamiento se realizó con 150 episodios teleoperados (61.668 fotogramas a 30 FPS) de un dataset propio llamado `UNITAmanipulation/act_colorsort`. La configuración de entrenamiento incluye 100.000 pasos, tamaño de lote 32, optimizador AdamW con tasa de aprendizaje 1e-5 y semilla 1000, usando la versión 0.6.1 de LeRobot. El modelo recibe como entrada dos imágenes RGB de 240x320 píxeles (cámaras frontal y superior) y un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. No se menciona el uso de RLHF ni DPO; es puramente aprendizaje supervisado por imitación.

## Capacidades

- Manipulación robótica por imitación: ejecuta tareas de pick-and-place con objetos de colores específicos.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (frontal y superior) con imágenes RGB de 240x320.
- Control de robot en tiempo real: diseñado para funcionar sobre el robot SO-100 (so_follower) con LeRobot.
- Predicción de acciones en chunks: genera secuencias de acciones de 6 dimensiones, lo que permite movimientos coordinados y estables.
- No soporta tool calling, agentes ni razonamiento de texto: es un modelo puramente motor, sin capacidades de lenguaje.
- No tiene capacidades multilingües ni de generación de texto: su salida es exclusivamente un vector de control.

## Casos de uso

- Clasificación y ordenación de objetos en líneas de producción: el modelo puede separar piezas por color en entornos industriales controlados, usando visión por cámara para detectar el bloque y el contenedor correspondiente.
- Automatización de tareas repetitivas de pick-and-place en laboratorios de robótica: sirve como base para experimentos de aprendizaje por imitación, permitiendo replicar el flujo de entrenamiento con otros objetos o colores.
- Investigación en aprendizaje por imitación: el modelo y su dataset asociado son un punto de partida para estudiar el efecto del número de episodios, la configuración de cámaras o la longitud de los chunks en el rendimiento de ACT.
- Prototipado de soluciones robóticas de bajo coste: al ser un modelo de solo 51,7 M de parámetros y funcionar sobre el robot SO-100, es viable para entornos académicos o pequeñas empresas sin hardware de gama alta.
- Validación de pipelines de LeRobot: sirve como ejemplo de referencia para depurar el flujo completo de registro de datos, entrenamiento y despliegue en robot real.
- Benchmark de control robótico: puede utilizarse para comparar la eficacia de ACT frente a otras políticas (como Diffusion Policy) en tareas de manipulación con dos cámaras y estados de 6 dimensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. No se dispone de métricas como tasa de éxito, MMLU, HumanEval ni otras, ya que se trata de un modelo de robótica y no de lenguaje.

## Requisitos de hardware

- VRAM estimada: con 51,7 M de parámetros y pesos en FP32, el modelo ocupa aproximadamente 207 MB. Cualquier GPU con al menos 1 GB de VRAM es suficiente para inferencia. Incluso podría ejecutarse en CPU, aunque con mayor latencia.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, desde una NVIDIA GTX 1650 hasta una RTX 4090. No se requiere hardware de datacenter.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual. También es viable en dispositivos embebidos con aceleración CUDA (Jetson, por ejemplo).
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) para ejecutar la política en un robot SO-100. No es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño del modelo, se espera una inferencia en el orden de milisegundos en GPU, pero la latencia real depende del hardware del robot y de la captura de imágenes.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos. En el ecosistema LeRobot, la alternativa más común a ACT es Diffusion Policy (también disponible en LeRobot), que utiliza un enfoque de difusión para generar acciones. Ambos comparten el mismo formato de entrada/salida y pueden entrenarse con los mismos datasets, pero no se han publicado comparativas directas para este modelo concreto.

## Limitaciones y advertencias

- Sin resultados de evaluación: la model card no incluye tasas de éxito en robot real, por lo que el rendimiento real es desconocido.
- Tareas muy específicas: el modelo solo está entrenado para dos tareas de clasificación de color (azul y verde). No generaliza a otros colores, objetos o disposiciones de cámara sin reentrenamiento.
- Dependencia de la configuración de hardware: las cámaras y el robot deben coincidir con los utilizados en el entrenamiento (so_follower, cámaras frontal y superior). Cambios de iluminación, posición de cámara o tipo de robot pueden degradar el rendimiento.
- Riesgo de sobreajuste: con solo 150 episodios, es probable que el modelo tenga dificultades ante variaciones no vistas en el dataset.
- Sin capacidades de lenguaje: no puede interpretar instrucciones en texto ni adaptarse a tareas nuevas de forma autónoma.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el dataset asociado no tenga restricciones adicionales (no se indica ninguna).
- Fecha de creación futura: el modelo fue creado en agosto de 2026, lo que sugiere que puede ser un artefacto de prueba o un error de fecha; conviene verificar la validez del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UNITAmanipulation/act_colorsort
- Dataset asociado: https://huggingface.co/datasets/UNITAmanipulation/act_colorsort
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=UNITAmanipulation/act_colorsort
