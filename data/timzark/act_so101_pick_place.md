# timzark/act_so101_pick_place

## Resumen

`timzark/act_so101_pick_place` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada en Hugging Face Hub por el usuario timzark y entrenada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de robótica que consume el estado articular de un brazo robótico SO-101 (vector de 6 dimensiones) y una imagen de cámara frontal (3x480x640) para producir comandos de acción de 6 dimensiones. Su propósito concreto es ejecutar la tarea "Pick up the block and place it in the cup" (coger un bloque y depositarlo en una taza).

El modelo resuelve el problema clásico de control visuomotor de manipulación de objetos: a partir de demostraciones teleoperadas, aprende a predecir secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad de la ejecución. Es relevante para quienes trabajan con el ecosistema LeRobot y el hardware SO-101 de bajo coste, ya que ofrece un punto de partida reproducible para tareas pick-and-place con una sola cámara.

La arquitectura es un transformer ACT con 51.668.614 parámetros totales, entrenado durante 30.000 pasos sobre 50 episodios y 22.110 fotogramas a 30 FPS. El repositorio ocupa 0,2 GB y los pesos están en formato safetensors. La licencia no está especificada y no se han publicado resultados de evaluación en robots reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control visuomotor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `front` (3x480x640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Frecuencia de datos | 30 FPS |
| Version de LeRobot | 0.7.0 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones cortas en lugar de pasos individuales, combinando un backbone transformer con codificación de observaciones visuales y propioceptivas. El modelo consume un vector de estado articular de 6 dimensiones y una imagen RGB de 480x640 píxeles, y emite un vector de acción de 6 dimensiones. La innovación principal del método es la predicción de secuencias de acciones, que mitiga el error de compounding típico de las políticas paso a paso y suele lograr tasas de éxito altas en tareas de manipulación.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset `timzark/so101_pick_place_20261115_193657`, compuesto por 50 episodios y 22.110 fotogramas a 30 FPS de demostraciones teleoperadas de la tarea "Pick up the block and place it in the cup". La configuración fue de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje supervisado puro sobre demostraciones.

## Capacidades

- Control visuomotor de manipulación: dado el estado articular y una imagen frontal, genera comandos de acción de 6 dimensiones para el brazo SO-101.
- Ejecución de una tarea concreta de pick-and-place: coger un bloque y depositarlo en una taza.
- Predicción de chunks de acciones, lo que aporta estabilidad en la ejecución frente a políticas paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, reproducible con el pipeline de LeRobot.
- Integración con el ecosistema LeRobot: rollout con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo thinking; es una política robótica especializada.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger un bloque y dejarlo en una taza sobre un brazo SO-101, útil como banco de pruebas para experimentos de manipulación con hardware de bajo coste.
- Punto de partida para fine-tuning: sirve como política preentrenada para reentrenar con `lerobot-train` sobre nuevos datasets de tareas similares, reduciendo el tiempo hasta una primera política funcional.
- Validación de pipelines de LeRobot: permite probar el flujo completo de rollout, grabación y evaluación con `lerobot-rollout` antes de invertir en datasets propios.
- Docencia y formación en robótica: ejemplo reproducible de aprendizaje por imitación con una sola cámara y un robot asequible, adecuado para cursos y talleres.
- Benchmark interno de hardware: al ser una tarea acotada, permite comparar repetibilidad y latencia entre distintas configuraciones de cámara, iluminación o calibración del SO-101.
- Prototipado de tareas de recogida y depósito en entornos controlados: base para demostrar conceptos de manipulación antes de escalar a políticas más complejas o multi-tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos safetensors en FP32, el modelo ronda los 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el entrenamiento se realizó con `--policy.device=cuda`. Una RTX 3060 o superior es más que suficiente para inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con al menos 2 GB de VRAM efectiva para el modelo y los buffers de imagen.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) sobre el robot SO-101; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política opera a 30 FPS según la frecuencia del dataset de entrenamiento, pero no se han publicado mediciones de latencia en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| timzark/act_so101_pick_place | 51.668.614 | no aplica | Pick-and-place SO-101 | no disponible | Hugging Face Hub |
| Otros modelos ACT en LeRobot | no disponible | no aplica | Manipulación genérica | variable | Hugging Face Hub |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación | variable | Hugging Face Hub / repos públicos |
| Políticas VLA (p. ej. OpenVLA) | no disponible | no aplica | Manipulación multi-tarea | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparables publicados para esta política concreta; la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 50 episodios de un único operador y una única configuración de cámara, la política puede sobreajustarse a posiciones, iluminación y objetos vistos en el dataset.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento, sin mecanismo de verificación interno.
- Limitaciones de contexto o idioma: no aplica como modelo de lenguaje; la tarea está acotada a "Pick up the block and place it in the cup" con el robot SO-101 y una cámara frontal.
- Restricciones de licencia: la licencia no está especificada en la model card, por lo que el uso comercial queda sin garantías legales hasta que el autor la defina.
- Caveats para producción: no hay evaluación en robot real publicada, el repositorio tiene 0 descargas y 0 likes, y el modelo depende de la calibración exacta del robot y de los nombres de cámara usados en el entrenamiento. No debe desplegarse en entornos de producción sin una validación propia de tasa de éxito y seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timzark/act_so101_pick_place
- Dataset de entrenamiento: https://huggingface.co/datasets/timzark/so101_pick_place_20261115_193657
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=timzark/so101_pick_place_20261115_193657
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
