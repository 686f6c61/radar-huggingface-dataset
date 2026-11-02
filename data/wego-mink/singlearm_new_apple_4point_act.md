# wego-mink/singlearm_new_apple_4point_act

## Resumen

El modelo `wego-mink/singlearm_new_apple_4point_act` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado por el usuario wego-mink en HuggingFace Hub el 2 de noviembre de 2026. Se trata de un artefacto de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, una técnica descrita en el artículo arXiv 2304.13705 y adoptada como política de referencia dentro del ecosistema LeRobot de HuggingFace.

El modelo tiene 51.670.663 parámetros (aproximadamente 51,7 millones) almacenados en formato safetensors, con un tamaño de repositorio de 0,2 GB. Está entrenado sobre el dataset `wego-mink/singlearm_new_apple_4point`, que por su nombre sugiere una tarea de manipulación con un brazo robótico y cuatro puntos de agarre sobre una manzana, aunque la model card no detalla la composición del dataset ni el robot utilizado.

Su relevancia es acotada: no es un modelo de lenguaje ni un modelo fundacional generalista, sino un checkpoint de política específico para una tarea concreta de control robótico. Resulta útil como ejemplo reproducible de entrenamiento ACT con LeRobot y como punto de partida para quien quiera replicar el pipeline con su propio robot (la documentación oficial menciona el robot `so100_follower`). No dispone de descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT), política de imitación |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso de tiempo, predice un bloque de acciones futuras (chunk). Esta formulación reduce el error de compounding y mejora la estabilidad en tareas de manipulación de precisión. La arquitectura combina un codificador visual, un transformer que procesa la observación y un decodificador que genera el chunk de acciones; el checkpoint aquí publicado sigue la implementación de LeRobot.

No se dispone de información sobre el número de tokens o episodios de entrenamiento, la composición exacta del dataset `wego-mink/singlearm_new_apple_4point`, ni si se aplicaron técnicas de regularización o aumento de datos. La model card únicamente indica que el modelo fue entrenado y subido con LeRobot y remite a la guía oficial de entrenamiento. No se documenta el robot de origen, la frecuencia de control ni la dimensionalidad del espacio de acciones.

## Capacidades

- Predicción de chunks de acciones para control de un brazo robótico de una sola extremidad (single-arm).
- Aprendizaje por imitación a partir de datos de teleoperación.
- Ejecución de políticas en bucle cerrado mediante `lerobot-record` sobre el robot `so100_follower` (según la model card).
- Entrenamiento reproducible desde cero con `lerobot-train` y `--policy.type=act`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Replicación de experimentos ACT: sirve como checkpoint de referencia para validar que el pipeline de LeRobot funciona correctamente antes de entrenar con datos propios.
- Manipulación de objetos tipo manzana con cuatro puntos de agarre: el nombre del dataset sugiere una tarea de pick-and-place o agarre sobre una fruta; el modelo puede evaluarse en el robot `so100_follower` con `lerobot-record`.
- Base para fine-tuning con datos propios: al estar en formato safetensors y licencia Apache 2.0, se puede reentrenar o adaptar a variaciones de la tarea sin restricciones legales.
- Docencia y formación en robótica de imitación: ejemplo mínimo (51,7 M de parámetros, 0,2 GB) para explicar action chunking, teleoperación y evaluación de políticas.
- Benchmark interno de políticas: comparar la tasa de éxito de ACT frente a otras políticas de LeRobot (Diffusion Policy, VQ-BeT) sobre la misma tarea y dataset.
- Prototipado de automatización de laboratorio: ejecutar la política en un banco de pruebas con un único brazo para tareas repetitivas de recogida y colocación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,7 M de parámetros (aproximadamente 207 MB de pesos); el cuello de botella real es el codificador visual y el buffer de observaciones, no el transformer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha documentado entrenamiento e inferencia en CUDA con `--policy.device=cuda`.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte de checkpoints locales o del Hub; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del robot, la frecuencia de control y el hardware de inferencia, no documentados en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wego-mink/singlearm_new_apple_4point_act | 51,7 M | no disponible | Manipulación single-arm (ACT) | Apache 2.0 | HuggingFace Hub |
| Políticas ACT de referencia en LeRobot | no disponible | no disponible | Manipulación genérica | Apache 2.0 | HuggingFace Hub / GitHub |
| Diffusion Policy (LeRobot) | no disponible | no disponible | Manipulación con difusión | Apache 2.0 | HuggingFace Hub / GitHub |
| VQ-BeT (LeRobot) | no disponible | no disponible | Manipulación con tokens discretos | Apache 2.0 | HuggingFace Hub / GitHub |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo específico de una tarea y un robot; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin información sobre el dataset de entrenamiento: se desconoce el número de episodios, la variabilidad de condiciones y el riesgo de sobreajuste.
- Sin métricas publicadas de tasa de éxito, robustez ante cambios de iluminación o generalización a posiciones no vistas.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí de ejecutar acciones incorrectas o inseguras en el robot real.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre seguridad y límites operativos desaconseja su despliegue en producción sin validación previa.
- No dispone de soporte multilingüe ni de texto; cualquier uso fuera de robótica de imitación es inadecuado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/wego-mink/singlearm_new_apple_4point_act
- Dataset: https://huggingface.co/datasets/wego-mink/singlearm_new_apple_4point
- Paper ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
