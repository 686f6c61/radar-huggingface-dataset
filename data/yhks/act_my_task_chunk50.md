# yhks/act_my_task_chunk50

## Resumen

`yhks/act_my_task_chunk50` es una política de imitación basada en Action Chunking with Transformers (ACT), publicada en el Hub de Hugging Face mediante la librería LeRobot. No es un modelo de lenguaje, sino un controlador robótico entrenado para una tarea concreta: "Grab the black cube" (coger el cubo negro) sobre un robot de tipo `so_follower`. El modelo aprende de 50 episodios de teleoperación (44.947 fotogramas a 30 FPS) y predice fragmentos cortos de acciones en lugar de pasos individuales, una estrategia que el paper original de ACT (arXiv:2304.13705) asocia a tasas de éxito elevadas en manipulación real.

El modelo tiene 51.617.414 parámetros, se distribuye en formato safetensors dentro de un repositorio de 0,2 GB y se publica bajo licencia Apache 2.0. Consume el estado del robot (vector de 6 dimensiones) y dos cámaras RGB de 480x640 (`overhead` y `wrist`), y produce un vector de acción de 6 dimensiones. Es, por tanto, un artefacto muy específico: sirve para replicar exactamente el setup de hardware y la tarea del autor, no como política generalista.

Su relevancia es la de un ejemplo reproducible de entrenamiento ACT con LeRobot 0.6.0 en el ecosistema de robótica open source. No hay resultados de evaluación publicados ni descargas, así que debe tratarse como un checkpoint de referencia o punto de partida para reentrenar, no como una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación basada en transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.617.414 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje natural como entrada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (secuencias cortas de comandos) en lugar de un único paso por inferencia. La arquitectura combina un backbone transformer con codificación de las observaciones visuales (dos cámaras RGB de 480x640, `overhead` y `wrist`) y del estado propioceptivo del robot (vector de 6 dimensiones), y un decodificador que emite el vector de acción de 6 dimensiones correspondiente al robot `so_follower`. El paper de referencia es arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `yhks/my_task`: 50 episodios, 44.947 fotogramas a 30 FPS, tarea "Grab the black cube". La configuración reportada es de 100.000 pasos, batch de 16, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documentan detalles sobre aumentación de datos, composición exacta de escenas, ni si hubo fases de RLHF/DPO (no aplicables en este paradigma de imitación supervisada).

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y propioceptivas.
- Predicción por chunks de acciones: emite secuencias cortas de acciones, lo que reduce el error de acumulación típico de políticas paso a paso.
- Fusión multimodal de dos cámaras: integra vista cenital (`overhead`) y vista de muñeca (`wrist`) junto con el estado del robot.
- Ejecución de una tarea concreta: "Grab the black cube", aprendida de demostraciones de teleoperación.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del pipeline robótico.

## Casos de uso

- Replicación de la tarea de referencia: ejecutar la política sobre un `so_follower` con cámaras `overhead` y `wrist` calibradas para reproducir el experimento "Grab the black cube" y validar el pipeline LeRobot de extremo a extremo.
- Punto de partida para fine-tuning: usar el checkpoint como inicialización al entrenar una política ACT sobre un dataset propio con el mismo esquema de observaciones (estado de 6 dimensiones y dos cámaras 480x640).
- Docencia y formación en imitación robótica: ejemplo mínimo y reproducible (50 episodios, 0,2 GB) para explicar ACT, el formato de datasets LeRobot y el flujo `lerobot-train` / `lerobot-rollout`.
- Benchmark interno de infraestructura: medir latencia y throughput de inferencia de una política ACT de ~51,6 M de parámetros en distintas GPUs antes de escalar a políticas mayores.
- Pruebas de integración de hardware: verificar el cableado, la calibración y la sincronización de cámaras del robot `so_follower` con una política conocida antes de desplegar controladores propios.
- Base para comparativas de métodos de imitación: contrastar ACT con alternativas como Diffusion Policy o VQ-BeT sobre el mismo dataset `yhks/my_task` para estudiar estabilidad y tasas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,6 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: no se especifican en la documentación. Por tamaño, una RTX 3060, RTX 4060 o superior es más que suficiente; A100/H100 no son necesarias salvo para entrenamiento a gran escala.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660, RTX 20/30/40, etc.), e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=yhks/act_my_task_chunk50`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. Dependen del hardware, de la resolución de las dos cámaras (480x640) y de la frecuencia de control del robot (dataset a 30 FPS).

## Comparativa con modelos similares

| Modelo | Paradigma | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yhks/act_my_task_chunk50` | ACT (imitación) | 51.617.414 | estado (6) + 2 cámaras 480x640 | Apache 2.0 | Hugging Face (lerobot) |
| ACT original (paper arXiv:2304.13705) | ACT (imitación) | no disponible | no disponible | no disponible | paper + código de referencia |
| Diffusion Policy | imitación con difusión | no disponible | observaciones visuales y de estado | no disponible | paper + implementaciones |
| VQ-BeT | imitación con cuantización vectorial | no disponible | observaciones visuales y de estado | no disponible | paper + implementaciones |

No se dispone de datos de rendimiento comparables entre estos métodos en la información proporcionada; la comparación se limita al paradigma y a la disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo para "Grab the black cube" sobre un `so_follower`; no generaliza a otras tareas, objetos ni morfologías de robot sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez ante cambios de iluminación, posiciones de objeto o distractores.
- Dependencia del hardware exacto: requiere las cámaras `overhead` y `wrist` con la misma resolución y nombres de observación, y un robot `so_follower` calibrado de forma equivalente.
- Dataset pequeño: 50 episodios y una única tarea limitan la diversidad de demostraciones y aumentan el riesgo de sobreajuste a las condiciones de grabación.
- Sin capacidades de lenguaje: no procesa instrucciones en lenguaje natural ni soporta tool calling; la tarea se fija en el prompt de rollout.
- Riesgo de alucinación en el sentido robótico: puede generar acciones plausibles pero incorrectas ante observaciones fuera de distribución, sin mecanismo de verificación interno.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene auditar el checkpoint antes de integrarlo en sistemas reales.
- Sesgos: no documentados; al derivarse de un único operador y entorno, puede heredar sesgos de las demostraciones (velocidad, trayectorias, posiciones preferidas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yhks/act_my_task_chunk50
- Dataset de entrenamiento: https://huggingface.co/datasets/yhks/my_task
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de datasets: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yhks/my_task
