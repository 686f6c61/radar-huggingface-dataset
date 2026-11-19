# tarunmatta/pi05_black_box_ft3

## Resumen

π₀.₅ (Pi05) es un modelo visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, disenado para la generalización en entornos abiertos en robótica. Evoluciona el modelo π₀ previo para generalizar a entornos y situaciones completamente nuevas no vistas durante el entrenamiento. La implementación utilizada aquí proviene del repositorio OpenPI de Physical Intelligence y se ha adaptado al ecosistema LeRobot de Hugging Face.

El modelo que nos ocupa, `tarunmatta/pi05_black_box_ft3`, es un fine-tuning de `lerobot/pi05_base` realizado por el usuario tarunmatta sobre un dataset propio de imitación. Concretamente, se ha entrenado para la tarea "Pick up the black box" (recoger la caja negra) usando un robot de tipo `so_follower` con dos cámaras (muñeca y lateral). El resultado es una política de control robótico especializada, no un modelo de lenguaje generalista.

Con 4.143.404.816 parámetros (~4,14 mil millones) y un tamaño de repositorio de 9,4 GB en formato safetensors, se trata de un modelo de tamaño medio orientado a robótica de manipulación. Su relevancia radica en demostrar el flujo completo de fine-tuning de VLA sobre hardware asequible (SO-100/SO-101) dentro del ecosistema LeRobot, aunque con un alcance muy limitado a la tarea concreta entrenada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ de Physical Intelligence; implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto general) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Libreria | lerobot (version 0.7.1 en entrenamiento) |
| Tipo de robot | so_follower |
| Camaras | wrist, left (entradas visuales de 3x224x224) |
| Entrada de estado | observation.state, shape (32,) |
| Salida de accion | action, shape (6,) |
| Modelo base | lerobot/pi05_base |
| Dataset de entrenamiento | tarunmatta/pick_up_black_box_smolvla |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ (Pi05) de Physical Intelligence, un modelo visión-lenguaje-acción que combina percepción visual, comprensión del lenguaje y generación de acciones motoras. La implementación concreta es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. El modelo consume tres flujos visuales de 224x224 píxeles (imagen base, muñeca izquierda y muñeca derecha, más una cámara vacía), un vector de estado de 32 dimensiones, y produce un vector de acción de 6 dimensiones. No se dispone de detalles adicionales sobre la composición interna de la arquitectura (número de capas, mecanismos de atención, etc.) en la información proporcionada.

El entrenamiento se realizó mediante fine-tuning supervisado (imitación) sobre el dataset `tarunmatta/pick_up_black_box_smolvla`, compuesto por 40 episodios y 8848 fotogramas a 10 FPS, con la única tarea "Pick up the black box". La configuración de entrenamiento fue: 40.000 pasos, batch size de 16, optimizador AdamW, learning rate de 2,5e-05 y semilla 1000, usando LeRobot 0.7.1. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de aprendizaje por imitación puro sobre una tarea de manipulación concreta.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa tres flujos de imagen de 224x224 (base, muñeca izquierda, muñeca derecha).
- Ejecución de una tarea específica de pick-and-place: "Pick up the black box".
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, dado que es un modelo de robótica y no un LLM de propósito general.
- No se documentan capacidades especiales como thinking mode, visión general, audio o matemáticas.

## Casos de uso

- Recogida automatizada de objetos en línea de montaje: el modelo ejecuta la tarea "Pick up the black box" sobre un robot SO-Follower, adecuado para demostraciones de pick-and-place repetitivo en entornos controlados.
- Prototipado de pipelines de imitación en robótica: sirve como ejemplo funcional de fine-tuning de π₀.₅ con LeRobot, útil para equipos que quieran replicar el flujo con sus propios datasets.
- Investigación en VLA de bajo coste: al estar entrenado sobre hardware asequible (SO-100/SO-101), permite a laboratorios con presupuesto limitado experimentar con modelos visión-lenguaje-acción.
- Validación de infraestructura de despliegue robótico: se puede usar para probar `lerobot-rollout`, calibración de cámaras y configuración de robots antes de entrenar políticas propias.
- Docencia y formación: como caso de estudio de un fine-tuning completo (dataset, configuración, despliegue) en cursos de robótica o aprendizaje automático.
- Base para fine-tuning adicional: al derivar de `lerobot/pi05_base`, puede servir como punto de partida para tareas de manipulación similares, aunque su especialización limita la transferencia directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~4,14 B parámetros en safetensors (fp32/bf16), el peso del modelo ronda los 8-9 GB; en fp16/bf16 se estiman ~8,3 GB solo para pesos, más overhead de activaciones y visión.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 16-24 GB (RTX 4090, A10, L4) sería suficiente para inferencia en precisión nativa; A100/H100 no serían necesarias para una sola instancia.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 (24 GB) y RTX 3090 (24 GB); en GPUs de 12-16 GB requeriría cuantización, para la cual no hay información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), sobre el stack de OpenPI. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, dado que es un modelo de robótica, no un LLM de texto.
- Latencia y throughput: no disponibles. El control se ejecuta a 10 FPS según el dataset de entrenamiento, pero no se publican métricas de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tarunmatta/pi05_black_box_ft3 | ~4,14 B | no disponible | Pick up the black box (SO-Follower) | gemma | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible en la informacion | no disponible | VLA generalista (base) | no disponible en la informacion | Hugging Face (modelo base) |
| π₀ (Pi0) de Physical Intelligence | no disponible en la informacion | no disponible | VLA generalista | no disponible en la informacion | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros y disponibilidad; no hay benchmarks publicados para este fine-tuning.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para la tarea "Pick up the black box" con un robot `so_follower` concreto; no generalizará a otras tareas, objetos o configuraciones de robot sin reentrenamiento.
- Dataset muy pequeño: 40 episodios y 8848 fotogramas son insuficientes para una generalización robusta; se espera sobreajuste a las condiciones exactas del dataset (posiciones, iluminación, fondo).
- Sin evaluación publicada: no hay métricas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Licencia "gemma": impone restricciones de uso comercial según los términos de la licencia Gemma de Google; es necesario revisar las condiciones antes de cualquier despliegue comercial.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones incorrectas ante observaciones fuera de distribución (objetos nuevos, cambios de iluminación, distracciones).
- Dependencia de calibración: requiere que las cámaras y el robot estén calibrados exactamente como en el entrenamiento; los nombres de cámara deben coincidir con las claves de observación.
- Idiomas: no aplica como modelo de texto; no hay soporte lingüístico general.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; sin validación externa.
- Sin información sobre cuantización ni formatos alternativos: solo safetensors; no hay GGUF ni versiones optimizadas para despliegue ligero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tarunmatta/pi05_black_box_ft3
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/tarunmatta/pick_up_black_box_smolvla
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=tarunmatta/pick_up_black_box_smolvla
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
