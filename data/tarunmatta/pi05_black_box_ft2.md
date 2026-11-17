# tarunmatta/pi05_black_box_ft2

## Resumen

`tarunmatta/pi05_black_box_ft2` es un ajuste fino del modelo Vision-Language-Action (VLA) π₀.₅ (Pi05) de Physical Intelligence, entrenado con la librería LeRobot de Hugging Face. El modelo base es `lerobot/pi05_base`, una implementación adaptada del repositorio OpenPI de Physical Intelligence. Pi05 está disenado para generalización en entornos abiertos: evoluciona π₀ para operar en situaciones y entornos no vistos durante el entrenamiento. Este ajuste concreto resuelve una tarea única de manipulación robótica: recoger una caja negra.

El modelo ha sido entrenado sobre un dataset propio de 40 episodios y 8848 fotogramas a 10 FPS, capturados con un robot `so_follower` y tres cámaras (base, muñeca izquierda y muñeca derecha). Con 4.143.404.816 parámetros y un repositorio de 9,4 GB, es un modelo de gran tamano para robótica de imitación, no un LLM conversacional. Su relevancia radica en ser un ejemplo práctico de ajuste fino de un VLA de última generación con herramientas abiertas (LeRobot 0.7.1), aunque su alcance es muy limitado: una sola tarea, un solo tipo de robot y sin resultados de evaluación publicados.

Es importante subrayar que este no es un modelo de lenguaje: no genera texto, no responde preguntas ni soporta tool calling. Consume observaciones visuales y de estado del robot, y produce acciones de 6 dimensiones. Cualquier uso fuera del control robótico de imitación no es aplicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), implementación LeRobot/OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Librería | lerobot (0.7.1) |
| Pipeline | robotics |
| Tipo de robot | so_follower |
| Cámaras | wrist, left (entradas: base_0_rgb, left_wrist_0_rgb, right_wrist_0_rgb, empty_camera_0) |
| Entrada de estado | observation.state, shape (32,) |
| Salida de acción | action, shape (6,) |
| Resolución de imagen | 224 x 224 |
| Tamano del repositorio | 9,4 GB |
| Descargas | 26 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre π₀.₅, la evolución de π₀ de Physical Intelligence orientada a generalización en entornos abiertos. La implementación procede del repositorio OpenPI y se ha adaptado a LeRobot. La arquitectura combina percepción visual (tres cámaras a 224x224) con estado proprioceptivo del robot (vector de 32 dimensiones) para emitir acciones de 6 dimensiones, típicas de un brazo manipulador. No se dispone de detalles adicionales sobre el backbone, el número de capas o el mecanismo de atención en la información proporcionada.

El ajuste fino se realizó durante 40.000 pasos con batch size 16, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, sobre el dataset `tarunmatta/pick_up_black_box_smolvla` (40 episodios, 8848 fotogramas, 10 FPS, tarea "Pick up the black box"). No se documenta el uso de RLHF, DPO ni otras técnicas de alineación; se trata de aprendizaje por imitación supervisado. Tampoco se especifican innovaciones técnicas adicionales más allá de las propias de π₀.₅.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa tres vistas simultáneas (base, muñeca izquierda, muñeca derecha) más una cámara vacía declarada como entrada.
- Ejecución de una tarea específica: "Pick up the black box" (recoger la caja negra).
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido lingüístico.
- No tiene capacidades multilingües: no procesa ni genera lenguaje natural.
- No dispone de modo thinking, visión general, audio ni otras capacidades cognitivas.

## Casos de uso

- Recogida de objetos en línea de montaje: el modelo ejecuta la tarea de recoger una caja negra con un robot `so_follower`, adecuado para tareas de pick-and-place repetitivas en entornos controlados.
- Prototipado de políticas VLA con LeRobot: sirve como referencia para desarrolladores que quieran ajustar π₀.₅ a sus propias tareas usando el flujo `lerobot-train` documentado.
- Investigación en aprendizaje por imitación: permite estudiar cómo un VLA de 4,1 mil millones de parámetros se adapta a una tarea concreta con solo 40 episodios de demostración.
- Validación de pipelines de robótica: útil para probar la integración de `lerobot-rollout` con robots SO-100/SO-101 y cámaras OpenCV.
- Base para ajustes posteriores: al derivar de `lerobot/pi05_base`, puede servir como punto de partida para fine-tunings adicionales en tareas similares de manipulación.
- Docencia y demos de VLA: ejemplo reproducible de entrenamiento y despliegue de un modelo VLA open source en hardware de bajo coste, aunque sin métricas de éxito publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4,14 mil millones de parámetros, en FP16 se necesitarían aproximadamente 8,3 GB solo para pesos, más overhead de activaciones y visión; en cuantización de 8 bits, unos 4,2 GB, pero no se documentan cuantizaciones soportadas.
- GPU recomendadas: no disponible. El comando de entrenamiento documentado usa `--policy.device=cuda`, sin especificar modelo de GPU.
- ¿Cabe en GPU consumer? No confirmado. Por tamano, una GPU con 12-16 GB de VRAM podría alojar los pesos en FP16, pero no hay validación publicada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un VLA de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tarunmatta/pi05_black_box_ft2 | 4.143.404.816 | no disponible | Recoger caja negra (so_follower) | gemma | Hugging Face, 26 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista π₀.₅ | no disponible en la información | Hugging Face (modelo base) |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista predecesor | no disponible en la información | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse con 40 episodios de un único operador y entorno, el modelo probablemente sobreajusta a condiciones específicas de iluminación, posiciones de objeto y configuración de cámara.
- Riesgo de alucinación: en el sentido robótico, puede generar acciones incorrectas o inseguras fuera de la distribución de entrenamiento; no hay evaluación que cuantifique este riesgo.
- Limitaciones de contexto e idioma: no aplica contexto lingüístico; el modelo no procesa texto libre más allá de la instrucción de tarea fija "Pick up the black box".
- Restricciones de licencia: licencia `gemma`, que impone términos de uso de Gemma; es necesario revisar las condiciones de Google para uso comercial, redistribución y restricciones de uso aceptable.
- Caveat para producción: sin resultados de evaluación publicados, no se recomienda desplegar en entornos reales sin validación propia exhaustiva. La tarea es única y el dataset muy pequeno (40 episodios).
- Dependencia de hardware específico: entrenado para robot `so_follower` con nombres de cámara concretos (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`, `empty_camera_0`); requiere correspondencia exacta de claves de observación.
- Repositorio con muy poca tracción (26 descargas, 0 likes) y sin mantenimiento documentado más allá de la fecha de actualización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tarunmatta/pi05_black_box_ft2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/tarunmatta/pick_up_black_box_smolvla
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=tarunmatta/pick_up_black_box_smolvla
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
- OpenPI (Physical Intelligence): no se proporciona URL directa en la información disponible.
