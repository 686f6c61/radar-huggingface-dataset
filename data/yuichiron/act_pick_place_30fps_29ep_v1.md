# Yuichiron/act_pick_place_30fps_29ep_v1

## Resumen

El modelo `Yuichiron/act_pick_place_30fps_29ep_v1` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario Yuichiron y publicada en Hugging Face. Está entrenada para ejecutar una tarea concreta de manipulación: recoger un cubo azul, elevarlo verticalmente y depositarlo en un cuenco naranja. El modelo se ha entrenado con el framework LeRobot, una biblioteca de aprendizaje por imitación para robótica real, y se distribuye bajo licencia Apache 2.0.

Con 51,7 millones de parámetros, es un modelo compacto que consume una entrada visual (imagen frontal de 480×640 píxeles) y el estado del robot (6 dimensiones), y produce acciones de control de 6 dimensiones. Su relevancia radica en demostrar cómo un transformer de acción por fragmentos puede aprender tareas de manipulación a partir de datos teleoperados, con una tasa de éxito potencialmente alta según el método original. El modelo se publica como parte del ecosistema LeRobot, lo que facilita su reproducción y despliegue en robots compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, descrita en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT es un transformer que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la precisión en tareas de manipulación. La política consume dos tipos de observaciones: el estado del robot (vector de 6 dimensiones) y una imagen RGB de una cámara frontal (3×480×640). La salida es un vector de acción de 6 dimensiones que se ejecuta en el robot.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre un dataset propio de 29 episodios teleoperados, con un total de 16.465 fotogramas a 30 FPS. La configuración de entrenamiento incluye 30.000 pasos, tamaño de lote 8, optimizador AdamW y una tasa de aprendizaje de 1e-5. No se menciona el uso de técnicas como RLHF o DPO; se trata de un aprendizaje por imitación supervisado puro.

## Capacidades

- Control de un robot tipo `so_follower` para tareas de pick-and-place.
- Predicción de acciones en fragmentos (action chunking), lo que permite movimientos más suaves y coherentes.
- Entrada multimodal: combina visión (imagen frontal) y estado propioceptivo del robot.
- Ejecución de la tarea específica: recoger un cubo azul, elevarlo y colocarlo en un cuenco naranja.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, agentes ni razonamiento de lenguaje; es una política puramente motora.

## Casos de uso

- Automatización de tareas de manipulación en entornos controlados: el modelo puede ejecutar la tarea de pick-and-place de forma autónoma en un robot `so_follower`, útil para líneas de ensamblaje o clasificación de objetos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del action chunking en la precisión y robustez de políticas robóticas.
- Desarrollo de nuevas tareas: aunque está entrenado para una tarea concreta, puede servir como base para fine-tuning con nuevos datasets de pick-and-place.
- Demostración de LeRobot: el modelo es un ejemplo práctico de cómo entrenar y desplegar políticas con LeRobot, útil para talleres y cursos de robótica.
- Evaluación de hardware robótico: permite probar la repetibilidad y estabilidad de un robot `so_follower` bajo una política fija.
- Benchmarking de métodos de imitación: al ser un modelo pequeño y de código abierto, puede usarse para comparar ACT con otras arquitecturas en tareas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. No se dispone de métricas como tasa de éxito, precisión o latencia.

## Requisitos de hardware

- Al ser un modelo de 51,7 millones de parámetros, la inferencia es ligera y puede ejecutarse en GPU de consumo como una RTX 3060 o superior.
- No se especifican requisitos de VRAM, pero por el tamaño del modelo (0,2 GB en safetensors) se estima que cabe en GPUs con 4 GB o más.
- El despliegue se realiza mediante LeRobot, que utiliza PyTorch. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están documentados; dependerán del hardware y de la frecuencia de control del robot (30 FPS en el dataset).

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El autor ha publicado otros modelos similares (por ejemplo, `Yuichiron/act_blue_cube` y `Yuichiron/act_blue_cube_v2`), pero no se han encontrado especificaciones detalladas de estos en la búsqueda web. Se recomienda consultar directamente los repositorios de Hugging Face para obtener datos comparables.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta (recoger cubo azul y colocarlo en cuenco naranja) y no generaliza a otras tareas sin reentrenamiento.
- Requiere el robot específico `so_follower` y una cámara frontal con las mismas características (resolución, posición, calibración) que las usadas en el entrenamiento.
- No se han proporcionado resultados de evaluación en robot real, por lo que su rendimiento efectivo no está verificado.
- El dataset de entrenamiento es pequeño (29 episodios), lo que puede limitar la robustez ante variaciones de iluminación, posición de objetos o ruido.
- Al ser un modelo de robótica, no tiene capacidades de lenguaje ni razonamiento simbólico; no debe usarse fuera de su dominio.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la compatibilidad con el hardware y el entorno de despliegue.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Yuichiron/act_pick_place_30fps_29ep_v1)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Yuichiron/so101_pick_place_30fps_50ep_20260827_20260827_152400)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=Yuichiron/so101_pick_place_30fps_50ep_20260827_20260827_152400)
