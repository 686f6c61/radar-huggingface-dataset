# zetanschy/smolvla_cap_to_box_highlight

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales y un comando en lenguaje natural. Esta ficha concreta, `zetanschy/smolvla_cap_to_box_highlight`, es un ajuste fino del modelo base `lerobot/smolvla_base` realizado por el usuario zetanschy sobre un dataset propio de 202 episodios, y está especializada en una única tarea: introducir un tapón en una caja resaltada.

El modelo cuenta con 450.046.176 parámetros (aproximadamente 450 millones) y se distribuye en formato safetensors con un repositorio de 3,6 GB. Consume tres cámaras de 256x256 píxeles y un vector de estado de 6 dimensiones, y produce acciones de 6 dimensiones a 30 FPS, lo que lo hace desplegable en hardware de consumo según la propia model card.

Su relevancia radica en que demuestra el flujo completo de ajuste fino de políticas robóticas con LeRobot: un modelo base preentrenado, un dataset de imitación propio y un artefacto listo para ejecutar con `lerobot-rollout`. No obstante, es una política de propósito muy específico y sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, según el paper SmolVLA (arXiv:2506.01844); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina observaciones visuales y un comando textual para predecir acciones motoras. La model card remite al paper arXiv:2506.01844 para los detalles arquitectónicos, que no se desglosan en la información disponible. La política consume tres cámaras (`front` y `grip` según la model card, aunque la tabla de entradas lista `camera1`, `camera2` y `camera3` con forma `(3, 256, 256)`), un vector `observation.state` de forma `(6,)` y produce una acción de forma `(6,)`. El robot objetivo es de tipo `so_follower`.

El ajuste fino se realizó sobre el dataset `zetanschy/cap_to_box_real_highlight`: 202 episodios, 72.823 fotogramas a 30 FPS, con la tarea "put the cap in the highlighted box". La configuración de entrenamiento fue de 20.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.1. No se documenta en la información disponible si hubo RLHF, DPO ni la composición del preentrenamiento del modelo base.

## Capacidades

- Control robótico de manipulación por imitación: genera acciones de 6 dimensiones a partir de observaciones visuales y de estado.
- Seguimiento de instrucciones en lenguaje natural acotado a la tarea entrenada ("put the cap in the highlighted box").
- Percepción multi-cámara: procesa tres flujos visuales simultáneos de 256x256.
- Ejecución en bucle cerrado a 30 FPS mediante `lerobot-rollout`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modos de "thinking".
- No se documentan capacidades de visión general, audio ni generación de texto libre.

## Casos de uso

- Automatización de una celda de pick-and-place específica: la política ejecuta la tarea de introducir un tapón en una caja resaltada sobre un robot `so_follower`, adecuada para demostrar un pipeline de imitación de extremo a extremo.
- Prototipado de investigación en VLA: sirve como referencia reproducible de ajuste fino de SmolVLA con un dataset pequeño (202 episodios) y una configuración de entrenamiento documentada.
- Benchmark interno de recogida de datos: permite comparar la calidad de nuevos datasets de teleoperación contra este ajuste base con la misma tarea y robot.
- Docencia y formación en robótica de imitación: el par dataset-política y los comandos de `lerobot-train`/`lerobot-rollout` facilitan un ejercicio completo de entrenamiento y despliegue.
- Validación de hardware de consumo: al ser un modelo de ~450 M de parámetros, permite probar la inferencia en estaciones de trabajo sin GPU de datacenter.
- Base para ajustes adicionales: puede reutilizarse como punto de partida (`--policy.path`) para tareas relacionadas de manipulación con el mismo robot y disposición de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors, los pesos en precisión completa ocupan del orden de 1,8 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo, aunque no se documentan requisitos oficiales.
- GPU recomendadas: no disponibles en la información proporcionada.
- GPU de consumo: viable por tamaño del modelo, pero sin confirmación oficial en la model card.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la política opera a 30 FPS según la tasa del dataset, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zetanschy/smolvla_cap_to_box_highlight | 450.046.176 | no disponible | Manipulación específica (cap to box) | Apache 2.0 | Hugging Face, 55 descargas |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | VLA base para ajuste fino | no disponible en la información proporcionada | Hugging Face |
| Otros VLA comparables (p. ej. OpenVLA, π0) | no disponible | no disponible | Manipulación general | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; solo se conoce el modelo base del que deriva.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único tipo de robot (`so_follower`); no generaliza a otras instrucciones ni morfologías.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en condiciones variables (posiciones nuevas, iluminación, distractores), lo que impide estimar su fiabilidad en producción.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento; un cambio de montaje o calibración puede degradar el comportamiento.
- Riesgo de sobreajuste al dataset: con 202 episodios y 20.000 pasos, es probable que el rendimiento caiga fuera de la distribución de las demostraciones.
- Sesgos: no documentados; al ser un modelo robótico, los sesgos relevantes serían de distribución de escenas y objetos del dataset, no de lenguaje.
- Alucinación: no aplica en el sentido generativo de texto, pero sí existe riesgo de acciones erróneas o inseguras en el espacio físico.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin idiomas declarados: el comando de tarea está en inglés y no se documenta soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zetanschy/smolvla_cap_to_box_highlight
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/zetanschy/cap_to_box_real_highlight
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zetanschy/cap_to_box_real_highlight
