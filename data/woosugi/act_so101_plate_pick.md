# woosugi/act_so101_plate_pick

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la robustez en tareas de manipulación. Este repositorio concreto, `woosugi/act_so101_plate_pick`, es una política entrenada con LeRobot sobre el conjunto de datos `woosugi/so101_plate_pick`, orientada a la tarea de recoger un plato con el robot SO-101. El autor es `woosugi` y el modelo se publica bajo licencia Apache 2.0.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB. Se integra en el ecosistema LeRobot de Hugging Face, lo que permite entrenarlo y evaluarlo mediante los comandos `lerobot-train` y `lerobot-record`. No es un modelo de lenguaje: es una política de control robótico que mapea observaciones (típicamente imágenes de cámara y estado de las articulaciones) a comandos de acción para el robot.

Su relevancia es acotada pero clara para quien trabaja con brazos robóticos de bajo coste: demuestra el flujo completo de entrenamiento y despliegue de una política ACT sobre el SO-101 usando LeRobot, con un checkpoint reproducible y ligero que puede ejecutarse en hardware modesto. No hay información publicada sobre idiomas, benchmarks ni resultados de evaluación en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (ACT, Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformer que predice secuencias cortas de acciones (chunks) a partir de observaciones. La formulación original se describe en el paper arXiv:2304.13705. La arquitectura combina un codificador de observaciones (típicamente visual y de estado proprioceptivo) con un decodificador transformer que genera los chunks de acción, lo que aporta consistencia temporal y mitiga el problema de la acumulación de errores típico de las políticas que predicen un solo paso.

El entrenamiento se realizó con LeRobot sobre el dataset `woosugi/so101_plate_pick`, compuesto por demostraciones teleoperadas de la tarea de recoger un plato con el robot SO-101. No se dispone de información sobre el número de episodios, tokens, composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto de imitación). Tampoco se documentan innovaciones adicionales más allá del propio mecanismo de action chunking.

## Capacidades

- Control robótico de manipulación: genera comandos de acción para el robot SO-101 orientados a la tarea de recoger un plato.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos individuales, lo que mejora la consistencia temporal.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante las herramientas del ecosistema (`lerobot-train`, `lerobot-record`).
- Ejecución ligera: con ~51,7 M de parámetros, es viable en hardware de consumo.
- No dispone de tool calling, capacidades de agente, multilingüismo, visión general, audio ni modos de razonamiento; su alcance es exclusivamente la política de control entrenada.

## Casos de uso

- Recogida de objetos en laboratorio: la política se usa para que el SO-101 recoja un plato en un entorno controlado, replicando las demostraciones del dataset; es adecuada por su entrenamiento específico en esa tarea.
- Evaluación de pipelines de imitación: sirve como checkpoint de referencia para validar el flujo `lerobot-train` → `lerobot-record` antes de entrenar políticas propias.
- Prototipado de robótica de bajo coste: al tener ~51,7 M de parámetros y 0,2 GB, puede desplegarse en estaciones de trabajo modestas para pruebas rápidas con el SO-101.
- Docencia y formación: útil para demostrar los conceptos de action chunking y aprendizaje por imitación en cursos de robótica.
- Base para fine-tuning: punto de partida para adaptar la política a variantes de la tarea (otros objetos, posiciones o iluminación) con datos teleoperados adicionales.
- Comparación de métodos: referencia para contrastar ACT frente a otras políticas de LeRobot en la misma tarea y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de ~51,7 M de parámetros y el checkpoint de 0,2 GB; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el autor indica `--policy.device=cuda` en el comando de entrenamiento, sin especificar modelo de GPU.
- GPU de consumo: sí cabe en GPUs de consumo (por ejemplo, RTX 3060 o superiores), aunque no hay datos oficiales de compatibilidad.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de checkpoints locales o del Hub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| woosugi/act_so101_plate_pick | 51.668.614 | no disponible | Recoger plato con SO-101 | Apache 2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot | no disponible | no disponible | Manipulación genérica | según autor | Hugging Face |
| Políticas Diffusion Policy en LeRobot | no disponible | no disponible | Manipulación genérica | según autor | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada únicamente para la tarea de recoger un plato con el SO-101; no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Dependencia del entorno: el rendimiento puede degradarse con cambios en iluminación, posición de la cámara, fondo o disposición de los objetos respecto a las condiciones del dataset.
- Sin datos de evaluación: no se han publicado tasas de éxito ni métricas de robustez, por lo que no es posible cuantificar su fiabilidad en producción.
- Riesgo de alucinación en el sentido de acciones incorrectas: al ser una política de imitación, puede ejecutar movimientos no deseados ante observaciones fuera de distribución.
- Sesgos: no documentados; pueden derivarse de la distribución limitada de las demostraciones teleoperadas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento y la ausencia de garantías del autor.
- Sin soporte multilingüe ni de lenguaje: no debe emplearse como modelo de texto o conversación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/woosugi/act_so101_plate_pick
- Dataset de entrenamiento: https://huggingface.co/datasets/woosugi/so101_plate_pick
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
