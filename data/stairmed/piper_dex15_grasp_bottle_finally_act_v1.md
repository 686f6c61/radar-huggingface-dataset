# stairmed/piper_dex15_grasp_bottle_finally_act_v1

## Resumen

El modelo `stairmed/piper_dex15_grasp_bottle_finally_act_v1` es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), desarrollada por el usuario stairmed y publicada en HuggingFace bajo licencia Apache 2.0. Está diseñada para controlar un robot manipulador de tipo `piper_dex15_stairmed` en la tarea de agarrar una botella, utilizando como entrada una imagen de cámara (640x480) y el estado del robot (7 dimensiones), y produciendo como salida una acción de 7 dimensiones.

El modelo se ha entrenado con el framework LeRobot (versión 0.6.1) sobre un dataset propio de 60 episodios teleoperados, con un total de 18.349 frames a 30 FPS. Con 51,67 millones de parámetros, es una política compacta que puede ejecutarse en tiempo real en hardware de gama media. Su relevancia radica en que demuestra la aplicación práctica de ACT en un escenario de manipulación real, con un pipeline completo de entrenamiento y despliegue documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT (Action Chunking with Transformers), un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. ACT utiliza un transformer codificador-decodificador que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La política consume dos tipos de observaciones: el estado del robot (`observation.state`, vector de 7 dimensiones) y una imagen RGB de la cámara de la palma (`observation.images.palm`, 3x640x480). La salida es un vector de acción de 7 dimensiones que se aplica al robot.

El entrenamiento se realizó con LeRobot, usando el dataset `stairmed/piper_dex15_grasp_bottle_finally` que contiene 60 episodios de agarre de botella. La configuración de entrenamiento incluye 50.000 pasos, batch size de 64, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; es un entrenamiento puramente supervisado sobre datos teleoperados.

## Capacidades

- Control de robot manipulador para tareas de agarre de objetos, específicamente botellas, mediante visión y estado.
- Predicción de chunks de acciones (varias acciones a la vez) gracias a la arquitectura ACT, lo que permite movimientos más suaves y robustos.
- Ejecución en tiempo real sobre el robot `piper_dex15_stairmed` con cámara en la palma.
- Integración nativa con el ecosistema LeRobot: permite cargar, ejecutar y reentrenar la política mediante comandos CLI (`lerobot-rollout`, `lerobot-train`).
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües, al ser un modelo puramente robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede integrarse en una celda robótica para agarrar botellas u objetos similares de forma repetitiva, reduciendo el tiempo de ciclo frente a métodos programados manualmente.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT entre diferentes objetos o configuraciones, ya que el código de entrenamiento está disponible en LeRobot.
- Prototipado rápido de manipulación robótica: gracias a su tamaño reducido (51M parámetros) y al pipeline de LeRobot, se puede desplegar en un robot real en pocos minutos, ideal para validar conceptos en laboratorio.
- Benchmarking de métodos de control: al estar publicado con un dataset y configuración de entrenamiento claros, permite comparar ACT con otras arquitecturas (diffusion policies, etc.) en la misma tarea.
- Educación en robótica: el modelo y su documentación sirven como ejemplo didáctico de cómo entrenar y ejecutar una política de manipulación con transformers.
- Reentrenamiento con nuevos datos: los usuarios pueden recopilar sus propios episodios teleoperados y ajustar la política para adaptarla a otros objetos o variaciones del entorno, usando el comando `lerobot-train`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). No se proporcionan tasas de éxito, métricas de precisión ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Dado el tamaño del modelo (51,67M parámetros) y que procesa imágenes de 640x480, se estima que requiere menos de 2 GB de VRAM en FP32, y menos de 1 GB en cuantización FP16 o int8, aunque no se han publicado mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4090). No se requieren GPUs de datacenter.
- Cabe en GPUs de consumo: sí, por su tamaño compacto.
- Opciones de despliegue: el modelo está diseñado para ejecutarse con LeRobot, que soporta inferencia en PyTorch. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser un modelo de robótica, la latencia depende del hardware del robot y de la cámara, pero ACT está diseñado para operar en tiempo real (típicamente <100 ms por paso).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas ACT para agarre). La model card no menciona alternativas ni benchmarks comparativos. Se puede indicar que ACT es uno de los métodos de referencia en aprendizaje por imitación, pero no hay datos específicos de este modelo frente a otros.

## Limitaciones y advertencias

- No se han realizado evaluaciones formales del modelo en el robot real; la model card indica que no hay resultados de éxito reportados.
- El modelo está entrenado exclusivamente para la tarea de agarrar botellas con el robot `piper_dex15_stairmed` y la cámara de la palma. No es transferible directamente a otros robots, cámaras o tareas sin reentrenamiento.
- El dataset de entrenamiento es pequeño (60 episodios), lo que puede limitar la generalización a variaciones de iluminación, posición del objeto o tipos de botella no vistos.
- No se documentan sesgos específicos, pero al ser un modelo de visión, puede verse afectado por condiciones de iluminación o fondos diferentes a los del dataset.
- Riesgo de alucinación: no aplica, ya que no genera texto.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el robot y el hardware asociado cumplen con las normativas locales.
- No se proporcionan garantías de seguridad para operación autónoma; se recomienda supervisión humana en entornos reales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/stairmed/piper_dex15_grasp_bottle_finally_act_v1)
- [Dataset de entrenamiento](https://huggingface.co/datasets/stairmed/piper_dex15_grasp_bottle_finally)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
