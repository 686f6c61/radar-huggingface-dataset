# Yuichiron/act_blue_cube_v3_50ep

## Resumen

El modelo `Yuichiron/act_blue_cube_v3_50ep` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por Yuichiron y entrenada con el framework LeRobot de Hugging Face. ACT es un algoritmo de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en tareas de manipulación. Este modelo concreto está especializado en una tarea de pick-and-place: recoger un cubo azul, elevarlo verticalmente y colocarlo en un cuenco naranja, utilizando un robot tipo `so_follower` con una cámara frontal.

El modelo tiene 51,67 millones de parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 0,2 GB. Está entrenado sobre un dataset de 50 episodios teleoperados (15.139 frames a 15 FPS) y su configuración de entrenamiento incluye 30.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-5. Su relevancia radica en ser un ejemplo práctico de cómo aplicar ACT con LeRobot para tareas de manipulación reales, sirviendo como referencia para desarrolladores e investigadores que trabajan en robótica de imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador de visión (para procesar imágenes de la cámara) y un codificador de estado (para las posiciones articulares del robot), seguidos de un decodificador transformer que genera secuencias de acciones. La innovación clave es la predicción de chunks de acciones, lo que reduce la acumulación de errores y mejora la estabilidad del control. El modelo fue entrenado con el framework LeRobot (versión 0.6.1) sobre un dataset de 50 episodios teleoperados, con 15.139 frames a 15 FPS. La configuración de entrenamiento incluye 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se menciona el uso de RLHF o DPO; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea específica de recoger un cubo azul, elevarlo y colocarlo en un cuenco naranja.
- Percepción visual: procesa imágenes RGB de 480x640 píxeles de una cámara frontal.
- Integración de estado: utiliza un vector de estado de 6 dimensiones (posiciones articulares o coordenadas del efector final).
- Generación de acciones: produce un vector de acción de 6 dimensiones (posiciones o velocidades articulares).
- Aprendizaje por imitación: aprende directamente de demostraciones teleoperadas, sin necesidad de ingeniería de recompensas.
- Compatibilidad con LeRobot: se integra con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de recoger un objeto (cubo azul) y depositarlo en una ubicación fija (cuenco naranja), útil en líneas de montaje o laboratorios de robótica.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el rendimiento de ACT en tareas de manipulación con pocos datos (50 episodios).
- Fine-tuning para nuevas tareas: dado su tamaño reducido, puede adaptarse a tareas similares (diferentes objetos o posiciones) mediante entrenamiento adicional con LeRobot.
- Validación de pipelines de robótica: permite probar el flujo completo de LeRobot (grabación de datos, entrenamiento, despliegue) en un robot `so_follower`.
- Demostración educativa: útil para cursos o tutoriales sobre control robótico basado en visión y transformers.
- Benchmark de control de robots: puede utilizarse como referencia para comparar otros algoritmos de imitación en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, MMLU, HumanEval u otras, ya que no es un modelo de lenguaje ni de razonamiento general.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,67 millones de parámetros, la inferencia requiere aproximadamente 0,2-0,5 GB de VRAM en precisión FP32, y menos si se cuantiza (aunque no se ofrecen cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo moderna.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También es posible usar la librería directamente en Python.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño del modelo, se espera una inferencia en tiempo real (mayor de 15 FPS) en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información detallada sobre otros modelos comparables en la misma categoría. Existen otros repositorios de ACT en Hugging Face, como `Yuichiron/act_blue_cube_v2` (mismo autor, probablemente una versión anterior) y `makermods/act_makermods_ms_scripted_50ep_blue_cube_orange_tray_20260813_193020_2026-08-13_20-25-20`, pero no se han encontrado especificaciones ni resultados que permitan una comparación rigurosa. Se recomienda consultar directamente esos repositorios para obtener datos adicionales.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea de recoger un cubo azul y colocarlo en un cuenco naranja. No generaliza a otros objetos, colores o posiciones sin fine-tuning.
- Dependencia del hardware: requiere un robot tipo `so_follower` y una cámara frontal con las mismas características (resolución, posición) que las usadas en el entrenamiento.
- Datos limitados: solo 50 episodios de entrenamiento, lo que puede provocar sobreajuste y baja robustez ante variaciones de iluminación, fondo o posición de los objetos.
- Sin evaluación publicada: no hay resultados de tasa de éxito en robot real, por lo que se desconoce su rendimiento efectivo en condiciones reales.
- Sesgos del dataset: los datos provienen de un único operador y un entorno específico, lo que puede introducir sesgos en el comportamiento aprendido.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario es responsable de cumplir con las normativas de seguridad en robótica.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Yuichiron/act_blue_cube_v3_50ep
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Dataset de entrenamiento: https://huggingface.co/datasets/Yuichiron/so101_blue_cube_to_bowl_v3_20260825_20260825_112035
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
