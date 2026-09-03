# ulasZoi/pi0.5_cube2cup

## Resumen

`ulasZoi/pi0.5_cube2cup` es un modelo de visión-lenguaje-acción (VLA) fine-tuneado a partir de `lerobot/pi05_base`, la implementación en LeRobot del modelo π₀.₅ desarrollado por Physical Intelligence. Este modelo está diseñado para controlar un robot manipulador tipo `so_follower` en una tarea concreta de manipulación: recoger un cubo, desplazarlo sobre una taza y depositarlo dentro de ella. El fine-tuning se ha realizado con el dataset `ZoiRobotics/CubeToCupFull_150`, compuesto por 150 episodios de demostración (49 343 frames a 30 FPS), y el modelo resultante tiene 4 143 404 816 parámetros (aproximadamente 4,14 mil millones).

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de un VLA de última generación sobre una tarea robótica específica usando LeRobot, la librería de Hugging Face para aprendizaje por imitación. π₀.₅, el modelo base, introduce mejoras sobre π₀ para la generalización a entornos y situaciones no vistas durante el entrenamiento, mediante un entrenamiento conjunto sobre datos heterogéneos y el uso de acciones semánticas de alto nivel. Este fine-tuning concreto, sin embargo, está especializado en una única tarea y no pretende generalizar más allá de ella.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors, y está pensado para ejecutarse en el ecosistema LeRobot, tanto para inferencia en el robot real como para continuar el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en flujo, adaptada de π₀.₅ (Physical Intelligence) |
| Parametros totales | 4 143 404 816 (≈4,14 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo de control robótico, no se especifica ventana de contexto de texto) |
| Tipos de cuantizacion | No disponible (solo safetensors en precisión original) |
| Idiomas soportados | No disponible (el modelo no procesa lenguaje natural de forma general; las instrucciones son tareas fijas en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.₅, el modelo base, es un VLA de flujo (flow-based) que evoluciona π₀ para mejorar la generalización a entornos y situaciones nuevas. Según el paper de referencia (arXiv:2504.16054), π₀.₅ sigue una arquitectura jerárquica: primero se pre-entrena sobre una mezcla heterogénea de tareas y después se fine-tunea para manipulación móvil, combinando ejemplos de acciones de bajo nivel con "acciones semánticas" de alto nivel (predicción de etiquetas de subtarea como "pick", "place", etc.). La implementación en LeRobot se adapta del repositorio open-source OpenPI.

Este modelo concreto es un fine-tuning de `lerobot/pi05_base` sobre el dataset `ZoiRobotics/CubeToCupFull_150`, que contiene 150 episodios de demostración de la tarea de manipulación de cubo a taza. El entrenamiento se realizó con 20 000 pasos, batch size 8, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, usando LeRobot versión 0.6.1. Las observaciones del modelo incluyen el estado del robot (6 dimensiones) y dos cámaras: una frontal a 480×640 píxeles y una cámara vacía a 224×224 píxeles. La salida es una acción de 6 dimensiones (probablemente posiciones o velocidades de las articulaciones del robot).

No se han publicado detalles adicionales sobre la composición exacta del dataset de pre-entrenamiento de π₀.₅ ni sobre técnicas como RLHF o DPO; el fine-tuning aquí descrito es puramente de aprendizaje por imitación supervisado.

## Capacidades

- Control de robot manipulador: genera acciones de 6 dimensiones a partir de observaciones de estado y visión, permitiendo ejecutar la tarea de pick-and-place de un cubo en una taza.
- Percepción visual multimodal: procesa dos flujos de cámara (frontal a 480×640 y una segunda cámara a 224×224) junto con el estado del robot.
- Ejecución de tareas de manipulación de precisión: la tarea se descompone en tres subtareas ("pick up the cube", "move cube over the cup", "put cube into the cup"), lo que sugiere capacidad de seguir secuencias de manipulación.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento e inferencia de LeRobot, incluyendo los comandos `lerobot-rollout` y `lerobot-train`.
- No dispone de capacidades de generación de texto, tool calling, razonamiento general ni procesamiento de lenguaje natural; es un modelo puramente de control motor.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en una celda robótica para recoger objetos pequeños (cubos) y depositarlos en contenedores (tazas), útil en líneas de montaje o clasificación.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tuning de un VLA de última generación sobre una tarea específica, permitiendo estudiar la transferencia de π₀.₅ a dominios concretos.
- Desarrollo de políticas robóticas con LeRobot: los desarrolladores pueden usar este modelo como punto de partida para fine-tunear sobre tareas similares, reutilizando la arquitectura y el flujo de entrenamiento.
- Evaluación de generalización en robótica: al ser un fine-tuning especializado, permite comparar el rendimiento de π₀.₅ frente a otros VLA (como SmolVLA) en la misma tarea, midiendo la capacidad de adaptación a un dataset pequeño.
- Demostración de despliegue en robot real: el comando `lerobot-rollout` incluido en la documentación permite ejecutar la política en un robot `so_follower` real, sirviendo como banco de pruebas para validar la robustez del control.
- Formación y educación en robótica: el modelo y su dataset asociado son recursos didácticos para enseñar el flujo completo de recogida de datos, entrenamiento y despliegue de políticas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"). El paper de π₀.₅ reporta métricas de generalización en tareas de manipulación móvil, pero no se aplican directamente a este fine-tuning específico, que no ha sido evaluado formalmente.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay datos oficiales. Con 4,14 mil millones de parámetros, en precisión bf16 los pesos ocupan aproximadamente 8,3 GB; añadiendo activaciones y overhead, se estima un consumo de 10-14 GB en inferencia. Esta cifra es orientativa y no ha sido confirmada por el autor.
- GPU recomendadas: para una inferencia fluida se recomienda una GPU con al menos 16 GB de VRAM, como una RTX 4090, A100 40 GB o H100. En GPUs con 12 GB podría ser posible con optimizaciones de memoria, pero no está garantizado.
- Si cabe en consumer GPU: sí, en tarjetas de gama alta (RTX 4090, 4080) con 16 GB o más, aunque el margen es ajustado.
- Opciones de despliegue: el modelo está diseñado para ejecutarse con LeRobot (`lerobot-rollout`), que utiliza PyTorch. También podría integrarse en el repositorio openpi de Physical Intelligence, aunque no se documenta explícitamente.
- Latencia y throughput: no disponible. Depende del hardware, del tamaño de lote y de la resolución de las cámaras (480×640 y 224×224).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Tarea |
|---|---|---|---|---|---|
| `ulasZoi/pi0.5_cube2cup` (este) | 4,14 B | No disponible | Apache 2.0 | Hugging Face (safetensors) | Pick-and-place cubo a taza |
| `lerobot/pi05_base` | No disponible (mayor que el fine-tuning) | No disponible | Apache 2.0 | Hugging Face | VLA base para fine-tuning |
| `ulasgenc/SmolVLa_Cube_Cup2` | No disponible (SmolVLA es un VLA compacto) | No disponible | No disponible | Hugging Face | Misma tarea (cubo a taza) con SmolVLA |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a aspectos estructurales y de disponibilidad. SmolVLA es un VLA diseñado para ser eficiente y asequible, mientras que π₀.₅ es un modelo más grande orientado a la generalización; ambos se han fine-tuneado sobre la misma tarea, lo que podría permitir una comparación empírica futura.

## Limitaciones y advertencias

- Especialización extrema: el modelo está fine-tuneado para una única tarea (cubo a taza) y no generaliza a otras tareas de manipulación sin un nuevo entrenamiento.
- Dependencia del hardware: requiere un robot `so_follower` específico y una configuración de cámaras concreta (frontal y cámara vacía); cambios en la disposición de las cámaras o en el robot invalidan la política.
- Sin evaluación reportada: no hay datos de tasa de éxito en el robot real, por lo que su rendimiento efectivo es desconocido.
- Dataset pequeño: 150 episodios pueden ser insuficientes para una generalización robusta frente a variaciones de iluminación, posición de objetos o distracciones.
- Riesgo de sobreajuste: el entrenamiento con un dataset reducido y 20 000 pasos puede provocar sobreajuste a las demostraciones específicas.
- Sin capacidades de lenguaje: a pesar de ser un VLA, no procesa instrucciones de texto arbitrarias; las tareas están fijadas en el entrenamiento.
- Restricciones de uso: aunque la licencia Apache 2.0 permite uso comercial, el modelo depende de π₀.₅, cuya implementación en LeRobot puede tener condiciones adicionales; se recomienda revisar la licencia del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ulasZoi/pi0.5_cube2cup
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ZoiRobotics/CubeToCupFull_150
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Paper de π₀.₅: https://arxiv.org/abs/2504.16054
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Referencia de comandos LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Modelo similar (SmolVLA fine-tune): https://huggingface.co/ulasgenc/SmolVLa_Cube_Cup2
