# Yufeng1216/pi05_so101_pick_place

## Resumen

`Yufeng1216/pi05_so101_pick_place` es un ajuste fino (fine-tuning) del modelo visión-lenguaje-acción π₀.₅ (Pi05) de Physical Intelligence, adaptado a LeRobot y especializado en una única tarea robótica: recoger un peluche azul y colocarlo en una caja de cartón. El modelo parte del checkpoint base `lerobot/pi05_base` y se ha entrenado sobre un dataset propio de 50 episodios teleoperados con un robot SO-101 (brazo tipo follower) y dos cámaras (superior y de muñeca).

Se trata de una política de imitación (visión-lenguaje-acción) que consume tres flujos de imagen de 224×224 píxeles más un vector de estado de 32 dimensiones, y produce un vector de acción de 6 dimensiones. Con 4.143.404.816 parámetros (≈4,14 mil millones) y pesos en formato safetensors, hereda la arquitectura y la licencia Gemma del modelo base, lo que condiciona su uso comercial.

Su relevancia es acotada: no es un modelo generalista de propósito amplio, sino una demostración concreta de cómo adaptar π₀.₅ a un robot de bajo coste mediante LeRobot. Sirve como referencia práctica para quienes quieran entrenar sus propias políticas VLA sobre hardware asequible, y como ejemplo reproducible del flujo de trabajo `lerobot-train` / `lerobot-rollout`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) π₀.₅ (Pi05), implementación LeRobot adaptada del repositorio OpenPI de Physical Intelligence |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de tarea del dataset está en inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Librería | lerobot (versión 0.7.1) |
| Pipeline | robotics |
| Tipo de robot | so_follower (SO-101) |
| Cámaras | top, wrist |
| Entradas | `observation.images.base_0_rgb` (3, 224, 224); `observation.images.left_wrist_0_rgb` (3, 224, 224); `observation.images.right_wrist_0_rgb` (3, 224, 224); `observation.state` (32,) |
| Salidas | `action` (6,) |
| Tamaño del repositorio | 16,6 GB |
| Dataset de entrenamiento | Yufeng1216/so101_pick_place (50 episodios, 16.717 fotogramas, 30 FPS) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `lerobot/pi05_base`, que a su vez implementa la arquitectura π₀.₅ de Physical Intelligence en LeRobot, adaptada desde el repositorio OpenPI. Se trata de un modelo visión-lenguaje-acción que combina percepción visual multicámara con un estado proprioceptivo del robot para emitir comandos de acción de bajo nivel. La model card no detalla la composición interna (número de capas, mecanismo de atención, uso de flow matching o decodificación de acciones), por lo que esos datos se consideran no disponibles.

El entrenamiento se realizó por imitación supervisada sobre el dataset `Yufeng1216/so101_pick_place`: 50 episodios, 16.717 fotogramas a 30 FPS, con una única instrucción en lenguaje natural ("Pick up the blue plush toy and place it in the cardboard box."). La configuración reportada es de 3000 pasos, batch size 32, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, sobre LeRobot 0.7.1. No se documenta el número total de tokens de entrenamiento, la composición del corpus del modelo base ni si hubo etapas de RLHF o DPO; tampoco se describen innovaciones técnicas específicas más allá de las heredadas de π₀.₅.

## Capacidades

- Control robótico de imitación para una tarea concreta de pick-and-place sobre un robot SO-101.
- Percepción visual multicámara: procesa tres imágenes RGB de 224×224 (vista superior y dos vistas de muñeca).
- Fusión de estado proprioceptivo: consume un vector de estado de 32 dimensiones del robot.
- Generación de acciones continuas de 6 dimensiones por paso de control.
- Condicionamiento por instrucción en lenguaje natural (prompt de tarea en inglés).
- Ejecución en bucle cerrado mediante `lerobot-rollout` con estrategia `base`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento; el modelo está especializado exclusivamente en la política entrenada.

## Casos de uso

- Demostración de pick-and-place con SO-101: replicar la tarea "recoger el peluche azul y colocarlo en la caja de cartón" con el brazo SO-101 y dos cámaras, usando `lerobot-rollout` con `--policy.path=Yufeng1216/pi05_so101_pick_place` y `--duration=60`. Es el escenario para el que fue entrenado y el único con garantías de funcionamiento.
- Plantilla para entrenar políticas propias: sirve como referencia de configuración (3000 pasos, batch 32, LR 2,5e-05) para ajustar `lerobot/pi05_base` a un nuevo dataset con `lerobot-train`.
- Docencia y divulgación en robótica de imitación: ejemplo reproducible de extremo a extremo (grabación de datos, entrenamiento, despliegue) sobre hardware de bajo coste, útil en cursos y talleres.
- Validación de pipelines de datos: comprobar que un dataset propio de 50 episodios a 30 FPS es suficiente para obtener una política funcional en tareas simples de manipulación.
- Benchmark interno de infraestructura: medir latencia y throughput de inferencia de un VLA de 4,14 mil millones de parámetros en el hardware disponible antes de escalar a tareas más complejas.
- Base para experimentos de generalización: evaluar cómo se comporta la política ante cambios de posición del objeto, iluminación o distractores, y comparar con reentrenamientos sobre datos ampliados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se reportan tasas de éxito en robot real, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 4,14 mil millones de parámetros en safetensors ocupa aproximadamente 8,3 GB en fp16 y unos 16,6 GB en fp32; el repositorio completo pesa 16,6 GB.
- GPU recomendadas: no disponibles. No se especifican requisitos mínimos ni modelos probados.
- Cabe en GPU de consumo: no confirmado. Por tamaño de pesos, sería viable en GPUs con 12-16 GB o más en precisión reducida, pero no hay validación publicada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento), con soporte de `--policy.device=cuda`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yufeng1216/pi05_so101_pick_place | 4.143.404.816 | no disponible | Pick-and-place SO-101 (una tarea) | gemma | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la información | no disponible | VLA generalista π₀.₅ | gemma | Hugging Face (modelo base) |
| π₀.₅ original (Physical Intelligence, OpenPI) | no disponible en la información | no disponible | VLA generalista para generalización a entornos nuevos | no disponible en la información | Repositorio OpenPI |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única instrucción y un único montaje físico; no generaliza a otras tareas, objetos ni configuraciones de robot sin reentrenamiento.
- Dataset muy reducido: 50 episodios y 16.717 fotogramas limitan la robustez frente a variaciones de iluminación, posición de objetos o distractores.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del prompt exacto: la instrucción de tarea está fijada en inglés ("Pick up the blue plush toy and place it in the cardboard box."); desviarse de ella puede degradar el comportamiento.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`).
- Licencia Gemma: impone restricciones y obligaciones de uso comercial que deben revisarse antes de cualquier despliegue productivo.
- Riesgo de alucinación motora: como política de imitación, puede ejecutar acciones incorrectas o inseguras ante estados fuera de distribución; requiere supervisión y paradas de emergencia.
- Idiomas: no se documenta soporte multilingüe; el condicionamiento textual observado es únicamente en inglés.
- Sesgos: no documentados, pero el dataset de un solo operador y entorno puede introducir sesgos de posición, iluminación y estilo de manipulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yufeng1216/pi05_so101_pick_place
- Dataset de entrenamiento: https://huggingface.co/datasets/Yufeng1216/so101_pick_place
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Yufeng1216/so101_pick_place
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
