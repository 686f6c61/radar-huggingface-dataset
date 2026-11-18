# Tridex/model_act_test_gazeuse_resnet_15K_18_11

## Resumen

`Tridex/model_act_test_gazeuse_resnet_15K_18_11` es una política de imitación (imitation learning) para robótica entrenada con el método Action Chunking with Transformers (ACT), presentado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un modelo de control visuomotor que consume el estado articular del robot y tres cámaras RGB y produce comandos de acción de 6 dimensiones. Lo desarrolla el usuario Tridex y se ha publicado en el Hub mediante la librería LeRobot de Hugging Face.

El modelo resuelve una tarea concreta y estrecha: "take the yellow fluo and drop it inside the pink box" (coger el rotulador fluorescente amarillo y dejarlo dentro de la caja rosa). Se ha entrenado sobre un dataset propio de 10 episodios y 4584 fotogramas a 30 FPS, con 15000 pasos de entrenamiento y batch size 8. Su relevancia es la de un artefacto reproducible de experimentación con ACT sobre un robot `so_follower` (SO-100/SO-101 de bajo coste), no la de un modelo de propósito general.

El checkpoint ocupa 0,2 GB y contiene 51.668.614 parámetros en safetensors. La licencia es Apache 2.0. No se han publicado resultados de evaluación en el robot real, por lo que cualquier uso en producción debe ir precedido de una validación propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual ResNet y decodificador de acciones con chunking, según arXiv:2304.13705 |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación con horizonte de chunk de acciones, valor no especificado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, librería `lerobot`) |

Otros datos relevantes de la model card:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Cámaras | `front`, `side`, `top` (3 × 480 × 640 RGB) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Salida de acción | `action`, shape `(6,)` |
| Dataset de entrenamiento | `Tridex/10_gazeuse_pince_bleu_11h45_18-11_20261118_114616` |
| Episodios / fotogramas | 10 episodios / 4584 fotogramas |
| Frecuencia de captura | 30 FPS |
| Pasos de entrenamiento | 15000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un método de imitación que predice trozos (chunks) de acciones de corto plazo en lugar de un único paso, lo que reduce el error de compounding y suaviza la ejecución en robots reales. La implementación de LeRobot combina un backbone visual convolucional (el nombre del checkpoint indica ResNet) que procesa las tres cámaras a 480×640, una proyección del estado articular de 6 dimensiones y un transformer encoder-decoder que genera el chunk de acciones. El modelo tiene 51.668.614 parámetros y se distribuye en safetensors.

El entrenamiento es puramente de imitación supervisada sobre teleoperación: 10 episodios, 4584 fotogramas a 30 FPS, una única tarea y 15000 pasos con AdamW, batch 8, learning rate 1e-05 y semilla 1000, usando LeRobot 0.6.2. No hay indicios de RLHF, DPO ni fine-tuning por preferencias; tampoco se documenta augmentación de datos, mezcla de datasets ni decodificación especulativa. El reducido volumen de datos (10 episodios) es la limitación estructural más importante del checkpoint.

## Capacidades

- Control visuomotor de un robot `so_follower` a partir de tres vistas RGB (`front`, `side`, `top`) y del estado articular de 6 dimensiones.
- Predicción de chunks de acciones de 6 dimensiones, orientada a ejecución continua a 30 FPS.
- Ejecución de una única tarea de manipulación: coger el rotulador fluorescente amarillo y depositarlo en la caja rosa.
- Aprendizaje por imitación a partir de teleoperación, sin recompensas ni entorno simulado.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, texto, visión general, audio ni modo thinking.
- No dispone de capacidades multilingües: no procesa ni genera lenguaje.

## Casos de uso

- Reproducción de la tarea de pick-and-place en un SO-100/SO-101: ejecutar la política con `lerobot-rollout` y `--policy.path=Tridex/model_act_test_gazeuse_resnet_15K_18_11` para validar el pipeline completo de LeRobot antes de entrenar políticas propias.
- Base de referencia para comparar hiperparámetros de ACT: al estar documentados pasos (15000), batch (8), learning rate (1e-05) y semilla (1000), sirve como línea base reproducible frente a nuevos entrenamientos sobre el mismo dataset.
- Docencia y formación en imitation learning: el checkpoint y su dataset permiten visualizar episodios, inspeccionar entradas/salidas y entender el flujo teleoperación → entrenamiento → despliegue sin necesidad de grandes recursos.
- Pruebas de integración de hardware: verificar la calibración del robot, los índices de cámara y la correspondencia de nombres de observación (`observation.images.front`, etc.) en una instalación LeRobot 0.6.2.
- Experimentación con variaciones de la tarea: reentrenar con `lerobot-train --policy.type=act` sobre el mismo dataset y comparar la política resultante con este checkpoint de 15000 pasos.
- Evaluación de robustez frente a cambios de iluminación, posición de objetos o distractores: al no haber resultados publicados, el modelo es un buen sujeto para medir la degradación de ACT con solo 10 episodios de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No existen métricas de tasa de éxito, latencia ni throughput documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, el peso en FP32 ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna (el grueso del coste lo aportan las tres cámaras a 480×640 y el backbone visual).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con soporte CUDA es suficiente; el comando de entrenamiento de la model card usa `--policy.device=cuda`.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se documenta una GPU mínima.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política robótica.
- Latencia y throughput estimados: no disponibles. La captura de datos y la ejecución están pensadas a 30 FPS.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tridex/model_act_test_gazeuse_resnet_15K_18_11 | ACT (LeRobot) | 51.668.614 | no disponible (chunk de acciones) | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot | ACT (LeRobot) | no disponible | no disponible | según checkpoint | Hub / docs de LeRobot |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | no disponible | no disponible | según checkpoint | Hub / docs de LeRobot |
| Políticas SmolVLA en LeRobot | VLA | no disponible | no disponible | según checkpoint | Hub / docs de LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado con solo 10 episodios y 4584 fotogramas: alta probabilidad de sobreajuste al entorno, posiciones e iluminación exactos de la grabación.
- Sin resultados de evaluación en robot real: no hay evidencia publicada de tasa de éxito ni de robustez.
- Tarea única y estrecha ("take the yellow fluo and drop it inside the pink box"); no generaliza a otras tareas sin reentrenamiento.
- Dependencia fuerte del hardware: robot `so_follower`, tres cámaras concretas (`front`, `side`, `top`) y nombres de observación exactos; cualquier cambio de montaje o calibración puede degradar el comportamiento.
- Sin capacidades de lenguaje, tool calling ni agentes; no debe presentarse como modelo de propósito general.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas ante estados fuera de distribución; no hay mecanismo de verificación interno.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin comunidad ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_act_test_gazeuse_resnet_15K_18_11
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/10_gazeuse_pince_bleu_11h45_18-11_20261118_114616
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/10_gazeuse_pince_bleu_11h45_18-11_20261118_114616
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
