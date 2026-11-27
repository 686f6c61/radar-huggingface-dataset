# wata244/test-act-grab-cube-model

## Resumen

`wata244/test-act-grab-cube-model` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario `wata244` en Hugging Face y se ha generado con la librería LeRobot de Hugging Face, que estandariza el entrenamiento, registro y despliegue de políticas robóticas en PyTorch.

La política está especializada en una única tarea: coger un cubo azul y colocarlo dentro de una caja delimitada con cinta verde. Consume el estado articular del robot (vector de 6 dimensiones) y dos cámaras (muñeca y vista superior, ambas a 480x640) y produce un vector de acción de 6 dimensiones. El entrenamiento se ha realizado sobre un dataset propio de solo 5 episodios y 3496 fotogramas a 30 FPS, lo que lo convierte en una prueba de concepto más que en un modelo de producción.

Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, el modelo es ligero y está pensado para ejecutarse en el robot `so_follower` (la plataforma SO-100/SO-101 de bajo coste). Es relevante como ejemplo reproducible del flujo completo de LeRobot: grabar datos con teleoperación, entrenar con `lerobot-train` y desplegar con `lerobot-rollout`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones por paso) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `wrist`, `top` (3x480x640 cada una) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Dataset de entrenamiento | `wata244/record-test_20261127_113856` (5 episodios, 3496 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 2000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT se basa en un transformer que combina un codificador visual (para las dos cámaras) con un codificador del estado propioceptivo y un decodificador que genera un chunk de acciones futuras. La innovación principal del método es predecir varios pasos de acción de golpe, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. El paper de referencia es arXiv:2304.13705 (Zhao et al., 2023).

El entrenamiento se ha realizado con LeRobot 0.7.1 sobre un dataset muy reducido: 5 episodios teleoperados, 3496 fotogramas a 30 FPS, una única tarea ("grab the blue cube and put inside the green tape box"). Se ejecutaron 2000 pasos con batch size 8, AdamW y learning rate 1e-05. No se documenta el uso de RLHF, DPO ni aumentos de datos. Con tan pocos episodios, la política aprende una trayectoria muy concreta y probablemente tenga poca generalización a variaciones de posición, iluminación u objetos.

## Capacidades

- Control robótico de imitación para una tarea de pick-and-place concreta (cubo azul a caja de cinta verde).
- Fusión de dos vistas de cámara (muñeca y superior) con el estado articular del robot.
- Predicción de chunks de acciones de 6 dimensiones para el robot `so_follower`.
- Ejecución en bucle cerrado mediante `lerobot-rollout` a 30 FPS.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Demostración educativa de un pipeline completo de LeRobot: sirve para ilustrar el ciclo grabar dataset, entrenar con `lerobot-train` y desplegar con `lerobot-rollout` en un robot SO-100/SO-101 de bajo coste.
- Prototipado rápido de tareas pick-and-place: con 5 episodios y 2000 pasos se obtiene una política funcional para validar hardware, cámaras y calibración antes de invertir en datasets mayores.
- Pruebas de integración de cámaras: al requerir dos vistas (`wrist` y `top`) a 480x640 y 30 FPS, el modelo sirve para verificar la configuración de las cámaras OpenCV en el robot.
- Benchmark interno de infraestructura: útil para medir latencia de inferencia y throughput de `lerobot-rollout` en el hardware objetivo antes de escalar a políticas mayores.
- Reproducción de experimentos de ACT: permite replicar el método del paper 2304.13705 con hiperparámetros documentados (lr 1e-05, batch 8, 2000 pasos, semilla 1000).
- Base para fine-tuning en tareas similares: se puede partir de estos pesos y reentrenar con un dataset propio de mayor tamaño para tareas de manipulación relacionadas.
- Validación de calibración del robot `so_follower`: la política solo funciona si el robot y las cámaras están correctamente calibrados, por lo que sirve como prueba de aceptación del montaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (0,2 GB de repo) la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el flujo de LeRobot usa `--policy.device=cuda`. Una RTX 3060 o superior es más que suficiente para inferencia.
- Cabe en GPU consumer: sí, prácticamente en cualquier GPU moderna; también es viable en CPU para pruebas, aunque con mayor latencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--strategy.type=base`; el entrenamiento se realiza con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; dependen del robot, las cámaras y el hardware. El bucle de control opera a 30 FPS según el dataset.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wata244/test-act-grab-cube-model` | ACT (LeRobot) | 51,7 M | Estado (6,) + 2 cámaras 480x640 | no disponible | Hugging Face |
| Políticas ACT genéricas de LeRobot | ACT (LeRobot) | variable | variable | normalmente Apache-2.0 en LeRobot | Hugging Face / docs |
| Diffusion Policy (LeRobot) | Política por difusión | variable | variable | según implementación | Hugging Face / docs |
| π0 (Physical Intelligence) | VLA | no disponible en esta ficha | multimodal | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (5 episodios, 3496 fotogramas): alta probabilidad de sobreajuste a posiciones, iluminación y disposición concretas del cubo y la caja.
- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos, por lo que no se puede afirmar que funcione de forma fiable.
- Licencia no disponible: no se puede garantizar el uso comercial; hay que contactar con el autor antes de usarlo en producción.
- Especializado en una única tarea y un único tipo de robot (`so_follower`); no es transferible directamente a otras plataformas sin reentrenamiento.
- Requiere que los nombres de cámara (`wrist`, `top`) y la calibración coincidan exactamente con los del entrenamiento; cualquier desviación degrada el comportamiento.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí de ejecutar acciones incorrectas o inseguras si el entorno difiere del de entrenamiento.
- No hay información sobre sesgos, composición demográfica del dataset ni medidas de seguridad.
- El checkpoint corresponde a 2000 pasos con lr 1e-05; no se documenta si es el mejor checkpoint o el último.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wata244/test-act-grab-cube-model
- Dataset de entrenamiento: https://huggingface.co/datasets/wata244/record-test_20261127_113856
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=wata244/record-test_20261127_113856
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
