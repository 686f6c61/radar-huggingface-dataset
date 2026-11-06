# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi0_vlmlora-steps30k-decay30k

## Resumen

Este repositorio contiene una política robótica de tipo Vision-Language-Action (VLA) obtenida mediante ajuste fino supervisado del modelo fundacional π₀ (Pi0) de Physical Intelligence, en su implementación para LeRobot (`lerobot/pi0_base`). El modelo resuelve una tarea concreta de manipulación: lanzar una lata de tomate a una papelera, sobre un robot de tipo `mobile_manipulator` equipado con dos cámaras (cabeza y mano izquierda). No es un modelo de propósito general publicable como LLM, sino un checkpoint de política entrenado para un entorno y una tarea específicos.

El ajuste se ha realizado sobre un dataset propio de 200 episodios y 48.141 fotogramas a 10 FPS, generado en simulación. El nombre del checkpoint indica que el entrenamiento empleó LoRA sobre la torre visión-lenguaje (VLM) con 30.000 pasos y un decaimiento de learning rate a los 30.000 pasos, con un tamaño de lote de 32 y una tasa de aprendizaje de 2,5e-05.

Su relevancia es acotada: sirve como ejemplo reproducible de fine-tuning de π₀ con LeRobot sobre datos simulados, y como artefacto de referencia para quien quiera replicar el pipeline de imitación (grabación de datos, entrenamiento y despliegue con `lerobot-rollout`). No hay resultados de evaluación publicados ni métricas de éxito, lo que limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (π₀ / Pi0), implementación LeRobot adaptada de OpenPI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se expresan en lenguaje natural, p. ej. "Throw the tomato can into the trash bin") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`; repositorio de 1,9 GB) |

## Arquitectura y entrenamiento

El modelo es una política VLA π₀: recibe observaciones visuales de dos cámaras (`head_camera` a 3×480×640 y `hand_left_camera` a 3×400×640) junto con el estado propioceptivo del robot (`observation.state`, vector de 20 dimensiones) y una instrucción en lenguaje natural, y produce un vector de acción de 20 dimensiones. La implementación procede del repositorio OpenPI de Physical Intelligence y se ejecuta mediante la librería LeRobot 0.6.1.

El ajuste fino se realizó sobre `lerobot/pi0_base` con 30.000 pasos, lote de 32, optimizador AdamW, learning rate 2,5e-05 y semilla 1000. El sufijo del checkpoint (`vlmlora-steps30k-decay30k`) indica que se aplicó LoRA a la torre visión-lenguaje y que el learning rate decayó a los 30.000 pasos. El dataset de entrenamiento (`team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep`) contiene 200 episodios, 48.141 fotogramas a 10 FPS y una única tarea: "Throw the tomato can into the trash bin". No se documenta composición adicional del dataset, número de tokens, ni uso de RLHF o DPO.

## Capacidades

- Control robótico de manipulación móvil: genera acciones de 20 dimensiones para un `mobile_manipulator` a partir de observaciones visuales y propioceptivas.
- Condicionamiento por lenguaje natural: acepta una instrucción textual de tarea ("Throw the tomato can into the trash bin").
- Percepción visual multi-cámara: fusiona dos flujos de imagen (cabeza y mano izquierda) con el estado del robot.
- Ejecución de políticas de imitación en bucle cerrado mediante `lerobot-rollout`.
- Entrenamiento y reentrenamiento con `lerobot-train` a partir de `lerobot/pi0_base`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas ni visión fuera del bucle de control robótico.

## Casos de uso

- Replicación de experimentos de imitación en simulación: sirve como checkpoint de referencia para comparar variantes de fine-tuning de π₀ con y sin LoRA en la VLM, usando el mismo dataset de 200 episodios.
- Despliegue en robot móvil manipulador: ejecutar la política con `lerobot-rollout --strategy.type=base` sobre hardware con las dos cámaras y el estado de 20 dimensiones especificados.
- Generación de datos sintéticos de manipulación: usar el modelo como política base para rodar episodios en simulación y ampliar el dataset de entrenamiento.
- Estudio de transferencia sim-to-real: evaluar cómo se comporta una política entrenada en simulación al trasladarla a un robot físico con la misma configuración de cámaras.
- Docencia y formación en robótica de imitación: ejemplo completo y reproducible del flujo LeRobot (instalación, calibración, grabación, entrenamiento y rollout).
- Punto de partida para nuevas tareas: reajustar el checkpoint sobre datasets propios de otras tareas de manipulación con el mismo robot y esquema de observaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 1,9 GB, lo que da una cota inferior del tamaño de los pesos, pero no se documenta el consumo en ejecución.
- GPU recomendadas: no disponible. El comando de entrenamiento de LeRobot emplea `--policy.device=cuda`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos publicados.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento), con requisito de conexión al robot (`--robot.port`) y cámaras OpenCV.
- Latencia y throughput: no disponibles. La frecuencia de los datos de entrenamiento es de 10 FPS, pero no se publica la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (π₀ fine-tuned, tomato-trash) | no disponible | no disponible | Manipulación móvil, 1 tarea | apache-2.0 | Hugging Face, 17 descargas |
| `lerobot/pi0_base` | no disponible | no disponible | Política VLA generalista base | no disponible en la información | Hugging Face |
| `team-sobits/...-qfix-pi05_vlmlora-steps30k-decay30k` | no disponible | no disponible | Misma tarea, variante π₀.₅ con qfix | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a la configuración de entrenamiento y la tarea objetivo.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("Throw the tomato can into the trash bin") en un entorno simulado; no generaliza a otras tareas sin reajuste.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real, por lo que se desconoce su fiabilidad.
- Dependencia de la configuración exacta: los nombres y resoluciones de cámara (`head_camera` 480×640, `hand_left_camera` 400×640) y el vector de estado de 20 dimensiones deben coincidir con los del entrenamiento.
- Entrenado en simulación: riesgo de brecha sim-to-real no cuantificada.
- Idiomas: no se documenta soporte multilingüe; las instrucciones de tarea del dataset están en inglés.
- Sesgos y alucinación: no se documentan sesgos conocidos; en políticas VLA el fallo se manifiesta como acciones incorrectas o inseguras, no como texto alucinado.
- Licencia apache-2.0: permite uso comercial, pero el modelo base `lerobot/pi0_base` y el modelo original π₀ pueden tener condiciones propias que conviene verificar.
- Uso en producción: no recomendado sin una evaluación propia en el hardware objetivo y con protocolos de seguridad para el robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi0_vlmlora-steps30k-decay30k
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Guía de π₀ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Variante relacionada (π₀.₅ con qfix): https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-qfix-pi05_vlmlora-steps30k-decay30k
