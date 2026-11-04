# Tron-Hayato/act-pick-and-stack-final

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `Tron-Hayato/act-pick-and-stack-final`, es una política entrenada con LeRobot sobre un robot `so_follower` (SO-100/SO-101) para la tarea de apilar bloques, a partir de 80 episodios de teleoperación.

El modelo consume el estado de las articulaciones (vector de 6 dimensiones) y tres cámaras RGB de 480x640 (lateral, muñeca y superior), y produce un vector de acción de 6 dimensiones a 30 FPS. Con 51.668.614 parámetros y un repositorio de 0,4 GB en formato safetensors, es una política compacta pensada para inferencia en tiempo real sobre hardware de consumo.

Es relevante como ejemplo reproducible de un pipeline completo de imitación con LeRobot: dataset público, configuración de entrenamiento documentada (20.000 pasos, batch 8, AdamW, lr 1e-5) y comandos de despliegue listos para usar. No obstante, no incluye resultados de evaluación en robot real ni métricas de éxito publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de ACT, no documentada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

Especificaciones adicionales de entrada/salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.side` | VISUAL | (3, 480, 640) |
| `observation.images.wrist` | VISUAL | (3, 480, 640) |
| `observation.images.top` | VISUAL | (3, 480, 640) |
| `action` | ACTION | (6,) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice un chunk de acciones futuras en cada paso de inferencia, en lugar de una única acción. Esto mitiga el problema de compounding error típico de las políticas paso a paso y permite un control más suave. La política integra tres flujos visuales (cámaras lateral, de muñeca y superior) junto con el estado proprioceptivo de 6 dimensiones del robot `so_follower`, y emite acciones de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `Tron-Hayato/record-pick-and-stack-final`: 80 episodios, 167.957 frames a 30 FPS, con la tarea "Pick up blocks on the left one by one and stack them on top of the blocks on the right side". La configuración fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni aumentos de datos adicionales; se trata de imitación supervisada pura sobre teleoperación.

## Capacidades

- Control robótico de manipulación: apilado de bloques mediante agarre y colocación secuencial.
- Política visomotora: fusiona tres vistas RGB con el estado articular para generar acciones.
- Predicción de chunks de acción, lo que aporta suavidad y reduce la deriva acumulada.
- Ejecución en tiempo real a 30 FPS sobre el robot `so_follower`.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo específico de robótica, no un LLM.

## Casos de uso

- **Automatización de apilado de bloques en laboratorio**: ejecutar la política sobre un SO-100/SO-101 con las tres cámaras configuradas para reproducir la tarea de apilado; útil como baseline reproducible en experimentos de imitación.
- **Punto de partida para fine-tuning**: reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio de pocas decenas de episodios para adaptar la política a una variante de la tarea (por ejemplo, distintos colores u objetos).
- **Validación de pipelines de teleoperación**: usar el modelo para comprobar que la cadena de captura (cámaras, estado articular, FPS) está correctamente calibrada antes de grabar nuevos datasets.
- **Docencia y demostraciones de aprendizaje por imitación**: ejemplo completo y ligero (0,4 GB) para ilustrar el flujo dataset → entrenamiento → despliegue con LeRobot en un curso o taller.
- **Benchmark interno de hardware robótico**: medir latencia de inferencia y estabilidad de la política en distintas GPUs o en CPU como referencia de viabilidad.
- **Investigación en action chunking**: comparar el comportamiento de ACT frente a otras políticas (Diffusion Policy, VQ-BeT) sobre la misma tarea y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 51,7 M de parámetros en fp32, los pesos ocupan aproximadamente 0,2 GB; sumando activaciones de tres imágenes 480x640 y el transformer, la inferencia cabe holgadamente en GPUs con 4-8 GB de VRAM. Cifra exacta no disponible en la documentación.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento, se recomienda una GPU con 16 GB o más por el batch de imágenes.
- **Consumer GPU**: sí, cabe en GPUs de consumo como RTX 3060/4060/4090. También es viable en CPU para pruebas, aunque con mayor latencia.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que internamente usa PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- **Latencia y throughput**: no disponibles. El modelo está pensado para operar a 30 FPS (frecuencia del dataset), pero no se publican mediciones de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT pick-and-stack (este) | 51,7 M | 3 cámaras 480x640 + estado (6,) | Apilado de bloques en SO-100/SO-101 | apache-2.0 | HuggingFace, LeRobot |
| Diffusion Policy | no disponible en esta ficha | no disponible | Manipulación visomotora general | no disponible | Repositorios de investigación |
| VQ-BeT | no disponible en esta ficha | no disponible | Manipulación visomotora | no disponible | Repositorios de investigación |

No se dispone de datos comparativos de rendimiento (tasas de éxito, latencia) entre estas políticas en la información proporcionada; la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasas de éxito ni validación en robot real; el rendimiento real es desconocido.
- **Alta especificidad de tarea**: entrenada únicamente para apilar bloques de izquierda a derecha; fuera de esa distribución se espera un fallo sistemático.
- **Dependencia de la configuración de cámaras**: los nombres (`side`, `wrist`, `top`), resolución (480x640) y FPS (30) deben coincidir exactamente con los del entrenamiento; cualquier cambio degrada o invalida la política.
- **Dependencia del robot**: diseñada para `so_follower`; cambios de hardware, calibración o cinemática requieren reentrenamiento.
- **Riesgo de sobreajuste**: 80 episodios y 20.000 pasos con batch 8 pueden producir sobreajuste al entorno concreto de grabación (iluminación, posiciones de objetos, fondo).
- **Sesgos**: no aplican sesgos lingüísticos, pero sí sesgos de distribución visual y de posiciones de objeto del dataset.
- **Alucinación**: no aplica en el sentido de LLM, pero la política puede generar acciones no válidas ante observaciones fuera de distribución.
- **Licencia**: apache-2.0 permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia; no hay restricciones adicionales documentadas.
- **Caveat de producción**: al no haber métricas de robustez, no se recomienda su uso en entornos de producción sin una validación exhaustiva previa en el robot y entorno objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tron-Hayato/act-pick-and-stack-final
- Dataset de entrenamiento: https://huggingface.co/datasets/Tron-Hayato/record-pick-and-stack-final
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tron-Hayato/record-pick-and-stack-final
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
