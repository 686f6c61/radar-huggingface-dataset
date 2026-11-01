# Yewy/mahjong_mat_pickup_jitter_v3_v4_policy

## Resumen

`Yewy/mahjong_mat_pickup_jitter_v3_v4_policy` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers) publicada en Hugging Face Hub por el usuario Yewy. El modelo resuelve una tarea robótica concreta de manipulación: la recogida de piezas o materiales de mahjong sobre una superficie, con variaciones de jitter (ruido o temblor) introducidas en el conjunto de datos de entrenamiento. Está entrenada con el framework LeRobot de Hugging Face y empaquetada en formato `safetensors` con 51.668.614 parámetros.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje generalista, sino de un checkpoint de política robótica para un robot SO-101 (y potencialmente LeKiwi) entrenado sobre un dataset propio de 224 píxeles de resolución. No hay información pública sobre idiomas, contexto textual ni benchmarks estándar de NLP, por lo que las secciones correspondientes se marcan como no disponibles.

El modelo se publicó el 28 de octubre de 2026, cuenta con 27 descargas y 0 likes, y su licencia es Apache 2.0. El repositorio ocupa 0,2 GB, lo que refleja que se trata de un checkpoint compacto orientado a inferencia en hardware de robótica de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de aprendizaje por imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a política robótica; ventana de observación definida por el dataset de 224 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Yewy/mahjong_mat_pickup_jitter_v3_v4_224 |
| Hardware objetivo | SO-101, LeKiwi |
| Tamano del repo | 0,2 GB |
| Descargas | 27 |
| Likes | 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. En lugar de predecir una acción por paso, el modelo predice chunks cortos de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La arquitectura combina un codificador visual (las observaciones del dataset están a 224 píxeles) con un transformer que modela la secuencia de acciones, y se entrena sobre datos de teleoperación.

En este caso concreto, el entrenamiento se realizó con LeRobot sobre el dataset `Yewy/mahjong_mat_pickup_jitter_v3_v4_224`, que por el nombre sugiere episodios de recogida de material de mahjong con variaciones de jitter en la versión 3 y 4. No se dispone de información pública sobre el número de episodios, tokens, composición exacta del dataset ni si se aplicó RLHF o DPO (no aplica en aprendizaje por imitación). La model card no documenta innovaciones técnicas adicionales más allá del uso estándar de ACT.

## Capacidades

- Control robótico de manipulación: predice chunks de acciones para tareas de pick-and-place sobre superficies.
- Aprendizaje por imitación a partir de datos de teleoperación.
- Integración con el ecosistema LeRobot (`lerobot-train`, `lerobot-record`).
- Compatible con robots SO-101 (brazo seguidor) y potencialmente LeKiwi.
- Entrenado específicamente para la tarea de recogida de material de mahjong con jitter.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni capacidades generativas de texto.

## Casos de uso

- Automatización de recogida de piezas de mahjong: el modelo ejecuta la política entrenada para recoger material de mahjong sobre una superficie, adecuado para demostraciones de manipulación con SO-101.
- Evaluación de robustez frente a jitter: al haberse entrenado con variaciones de jitter en el dataset v3/v4, sirve para estudiar la tolerancia del modelo a perturbaciones en la posición inicial o en las observaciones.
- Reproducción de experimentos de aprendizaje por imitación: investigadores pueden reentrenar o evaluar la política con `lerobot-record` usando el mismo dataset de 224 px.
- Benchmark interno de políticas ACT: útil como línea base para comparar nuevas políticas sobre la misma tarea de recogida.
- Prototipado en robótica de bajo coste: el tamaño compacto (0,2 GB, ~51,7 M de parámetros) permite desplegarlo en estaciones con GPU modesta o incluso en el propio robot LeKiwi.
- Docencia y formación: ejemplo práctico de pipeline completo LeRobot (entrenamiento, checkpoint, evaluación) con licencia Apache 2.0.
- Integración en líneas de investigación de manipulación con superficies planas: la tarea de recogida sobre tapete es representativa de escenarios de pick-and-place.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, el checkpoint ocupa 0,2 GB, por lo que la inferencia requiere muy poca memoria (estimación orientativa inferior a 2 GB, sin dato confirmado).
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería ser suficiente; el autor no especifica requisitos.
- Cabe en GPU consumer: sí, por el tamaño del checkpoint (0,2 GB), aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con robots SO-101 y LeKiwi. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yewy/mahjong_mat_pickup_jitter_v3_v4_policy | 51,7 M | no aplica | Recogida de mahjong (ACT) | Apache 2.0 | Hugging Face Hub |
| Otras políticas ACT en LeRobot | no disponible | no aplica | Manipulación genérica | variable | Hugging Face Hub |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación | variable | Hugging Face Hub |

No se dispone de datos comparativos de rendimiento entre esta política y alternativas de la misma categoría. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (recogida de material de mahjong con jitter) y no generaliza a otras tareas sin reentrenamiento.
- Sin datos de rendimiento: no se publican tasas de éxito ni métricas de evaluación, lo que impide valorar su fiabilidad en producción.
- Dependencia del dataset: el comportamiento está ligado a la distribución del dataset `mahjong_mat_pickup_jitter_v3_v4_224`; cambios en iluminación, fondo o posición pueden degradar el rendimiento.
- Sin soporte de lenguaje: no es un modelo conversacional ni multilingüe; no debe usarse para tareas de NLP.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Riesgo de sobreajuste al jitter específico del dataset v3/v4; no hay validación externa documentada.
- Sin información sobre sesgos: no aplica en el sentido de NLP, pero puede heredar sesgos de la teleoperación humana (por ejemplo, trayectorias preferentes del operador).
- Repositorio con muy poca tracción (27 descargas, 0 likes): no hay comunidad ni issues documentados que ayuden a resolver problemas.

## Enlaces

- Hugging Face: https://huggingface.co/Yewy/mahjong_mat_pickup_jitter_v3_v4_policy
- Dataset: https://huggingface.co/datasets/Yewy/mahjong_mat_pickup_jitter_v3_v4_224
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
