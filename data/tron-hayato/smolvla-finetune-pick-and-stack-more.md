# Tron-Hayato/smolvla-finetune-pick-and-stack-more

## Resumen

`Tron-Hayato/smolvla-finetune-pick-and-stack-more` es un fine-tune de SmolVLA, un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot y descrito en el paper arXiv:2506.01844. El modelo base, `lerobot/smolvla_base`, se presenta como un VLA eficiente que alcanza rendimiento competitivo con un coste computacional reducido y que puede desplegarse en hardware de consumo. Este repositorio concreto parte de esa base y la especializa en una única tarea de manipulación robótica.

El fine-tune está entrenado sobre el dataset `Tron-Hayato/record-pick-and-stack-more` (150 episodios, 160.796 fotogramas a 30 FPS) para la tarea "Pick up blocks on the left one by one and stack them on top of the blocks on the right side", ejecutada sobre un robot `so_follower` con tres cámaras (side, wrist, top). La política consume el estado articular de 6 dimensiones y tres imágenes RGB de 480x640, y produce un vector de acción de 6 dimensiones.

Su relevancia es doble: por un lado, demuestra el flujo completo de LeRobot para grabar datos, entrenar y desplegar una política de imitación con 450 millones de parámetros y licencia Apache 2.0; por otro, sirve como referencia reproducible de cómo un dataset pequeño (~160k frames, una sola tarea) basta para especializar un VLA generalista, aunque todavía sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta; fine-tune de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible; la entrada es una observación multimodal (estado de 6 dimensiones + 3 imágenes de 3x480x640) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible; la instrucción de tarea del dataset está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de política LeRobot) |
| Libreria | `lerobot` (version 0.6.1 en el entrenamiento) |
| Pipeline | `robotics` |
| Tipo de robot | `so_follower` |
| Camaras de entrada | `side`, `wrist`, `top` (3, 480, 640) |
| Entrada de estado | `observation.state` con forma (6,) |
| Salida | `action` con forma (6,) |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 27 de octubre de 2026 (metadatos del Hub) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción: combina un backbone de visión-lenguaje compacto con una cabeza que emite directamente vectores de acción, de forma que la política transforma observaciones (imágenes de cámaras más estado proprioceptivo) e instrucción de tarea en comandos motores. En este repositorio la política está especializada para un robot `so_follower` de 6 grados de libertad, con tres vistas de cámara, y devuelve acciones de 6 dimensiones. Los detalles internos del backbone (número de capas, composición exacta del encoder visual, mecanismo de generación de acciones) no se detallan en la información disponible y deben consultarse en el paper arXiv:2506.01844.

El entrenamiento es un fine-tune supervisado por imitación sobre demostraciones teleoperadas: 150 episodios, 160.796 fotogramas a 30 FPS, una única tarea de apilado de bloques. La configuración publicada es de 5.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.1. No se documenta RLHF, DPO ni ninguna fase de refuerzo; tampoco se describe aumento de datos, regularización o composición adicional del dataset más allá de los episodios citados.

## Capacidades

- Generación de acciones motoras de 6 dimensiones a partir de observación multimodal (estado + tres imágenes RGB).
- Ejecución de una tarea de manipulación concreta: recoger bloques de la izquierda uno a uno y apilarlos sobre los bloques de la derecha.
- Fusión de tres vistas de cámara (lateral, muñeca y superior) para el control visuomotor.
- Despliegue en hardware de consumo, según la descripción del modelo base.
- Punto de partida para fine-tuning con datasets propios mediante `lerobot-train`.
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional.
- No soporta razonamiento multi-paso simbólico ni planificación de agentes.
- Capacidades multilingües: no disponibles ni documentadas; la tarea se especifica como cadena de texto en inglés.
- No dispone de modo "thinking", visión general, audio ni generación de texto libre.

## Casos de uso

- Apilado de bloques en robot SO-100/SO-101: el modelo ejecuta la política directamente con `lerobot-rollout`, recibiendo las tres cámaras y el estado articular, y emitiendo acciones a la frecuencia de control del robot. Es adecuado porque ha sido entrenado exactamente para esa tarea y esa morfología.
- Base para fine-tuning con datos propios: con 150 episodios y 160k fotogramas como referencia, un equipo puede replicar la receta (`lerobot-train` sobre `lerobot/smolvla_base`) para una tarea distinta y comparar curvas de aprendizaje.
- Prototipado en laboratorio con presupuesto limitado: al ser un modelo de ~450 M de parámetros y 1,2 GB de pesos, permite iterar en estaciones con GPU de consumo en lugar de clústeres.
- Docencia y formación en aprendizaje por imitación: sirve como ejemplo completo de pipeline (grabación, visualización del dataset, entrenamiento, rollout) con comandos reproducibles.
- Evaluación de robustez visuomotora: reproduce la tarea variando posición inicial de los bloques, iluminación o fondo para medir la degradación de la política, un análisis que el autor no ha publicado.
- Generación de rollouts para ampliar el dataset: ejecutar la política y registrar episodios nuevos (con `--strategy.type` distinto de `base`) para iterar el dataset de entrenamiento.
- Automatización de kitting o ensamblaje simple en una célula de montaje de laboratorio, siempre que la geometría y los objetos sean similares a los del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card está vacía y el autor indica explícitamente que todavía no hay resultados en robot real (ni número de ensayos, ni tasa de éxito). Tampoco se han encontrado en la búsqueda web datos de evaluación de este fine-tune concreto; los resultados que aparezcan en el paper del modelo base no son trasladables sin una evaluación propia.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 0,9-1,2 GB; con tres imágenes de 480x640 y el estado de 6 dimensiones, una estimación conservadora es de 2-4 GB de VRAM en FP16/BF16 (estimación propia, no publicada por el autor).
- GPU recomendadas: no se especifican en la información disponible. La model card del modelo base afirma que es desplegable en hardware de consumo, por lo que tarjetas de gama media (RTX 3060/4060 o superiores) deberían ser suficientes; A100/H100 no son necesarias para inferencia.
- Cabe en GPU de consumo: sí, según la descripción del modelo base; no se han verificado cifras concretas de latencia en este fine-tune.
- Opciones de despliegue: `lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento, ambos de la librería `lerobot` (versión 0.6.1 en el entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política robótica de este tipo.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que da una referencia de la frecuencia de control esperada, pero no se publica latencia de inferencia medida.
- Requisitos adicionales: robot `so_follower` calibrado, tres cámaras configuradas con los nombres `side`, `wrist` y `top`, resolución 640x480 y 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este fine-tune | ~450 M | Estado 6D + 3 imagenes 480x640 | Apilado de bloques en `so_follower` | Apache 2.0 | Hub de Hugging Face |
| `lerobot/smolvla_base` | ~450 M | Multimodal (VLA) | Base generalista para fine-tuning | Apache 2.0 | Hub de Hugging Face |
| OpenVLA | ~7 000 M (dato de literatura publica, no verificado en esta busqueda) | Imagen unica + instruccion | VLA generalista de manipulacion | No disponible | Peso publico |
| pi0 (Physical Intelligence) | ~3 000 M (aproximado, dato de literatura publica) | Multimodal (VLA) | VLA generalista de control robotico | No disponible | Peso publico |

Nota: los datos de OpenVLA y pi0 provienen de literatura pública y no se han podido verificar en la búsqueda web realizada, cuyos resultados corresponden a la película "Tron" y no al modelo. Para una comparación rigurosa de tasas de éxito habría que evaluar todos los modelos sobre el mismo robot y la misma tarea, algo que este repositorio no reporta.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("pick and stack") y un único tipo de robot (`so_follower`); no generaliza a otras tareas sin fine-tuning.
- Dataset pequeño y sesgado: 150 episodios de un mismo entorno implican sesgo hacia posiciones de bloque, fondo, iluminación y disposición de cámaras concretas.
- Sin métricas de éxito publicadas: no hay evidencia cuantitativa de fiabilidad, por lo que no debería desplegarse en producción sin una evaluación propia con múltiples ensayos.
- Dependencia estricta de la configuración de sensores: los nombres de cámara (`side`, `wrist`, `top`), la resolución 480x640 y la Calibración del robot deben coincidir; cualquier cambio invalida la política.
- Riesgo de acciones erráticas o fallos de agarre: en un VLA no hay "alucinación" lingüística, pero sí predicciones de acción incorrectas con consecuencias físicas; se recomienda limitar velocidades y usar paradas de emergencia.
- Sin soporte conversacional ni de herramientas: no puede usarse como asistente, para RAG, tool calling ni generación de código.
- Idiomas: no se documenta ningún soporte multilingüe; la instrucción de tarea usada en el entrenamiento está en inglés y no se ha validado con instrucciones en castellano.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario asume toda la responsabilidad sobre la seguridad del despliegue físico y sobre el cumplimiento de las licencias de los datos y del modelo base.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Fechas de metadatos anómalas (creación en octubre de 2026), lo que conviene tener en cuenta al citar el recurso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tron-Hayato/smolvla-finetune-pick-and-stack-more
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Tron-Hayato/record-pick-and-stack-more
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tron-Hayato/record-pick-and-stack-more
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Ninguno de los resultados devueltos por la búsqueda web es relevante para este modelo: todos corresponden a la franquicia cinematográfica "Tron".
