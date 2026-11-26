# woosugi/act_so101_plate_pick_bs16_sdpa

## Resumen

El modelo `act_so101_plate_pick_bs16_sdpa` es una política de imitación (imitation learning) entrenada con el algoritmo Action Chunking with Transformers (ACT), publicado originalmente en el paper arXiv:2304.13705. Lo desarrolla el usuario woosugi y se distribuye a través del Hub de Hugging Face con la librería LeRobot, el framework de Hugging Face para robótica. El modelo resuelve una tarea muy concreta: el control de un brazo robótico SO-101 para recoger un plato, aprendiendo directamente de datos de teleoperación recogidos en el dataset `woosugi/so101_plate_pick`.

Se trata de un modelo pequeño, de 51.668.614 parámetros (unos 51,7 millones), con un repositorio de 0,2 GB en formato safetensors. No es un modelo de lenguaje: su pipeline es `robotics` y su salida son secuencias de acciones motoras, no tokens de texto. ACT predice «chunks» de acciones (varios pasos de control de golpe) en lugar de una única acción por paso, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación.

Es relevante ahora porque ilustra el flujo actual de robótica de imitación de bajo coste: un brazo SO-101 asequible, datos de teleoperación y un entrenamiento reproducible con LeRobot. El sufijo `bs16_sdpa` sugiere un entrenamiento con batch size 16 y atención SDPA (scaled dot-product attention) en lugar de la atención original del paper, un detalle de implementación relevante para quien quiera reproducir el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT); codificador visual + transformer que predice chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador visual (procesa las imágenes de las cámaras del robot) con un transformer que genera predicciones de chunks de acciones de longitud fija. En lugar de predecir una acción por paso de control, el modelo predice un bloque de acciones futuras, lo que mitiga el problema de horizonte de error compuesto típico de las políticas paso a paso. El paper original introduce además una técnica de ensamblado temporal (temporal ensembling) para suavizar las predicciones entre chunks solapados.

El entrenamiento se realizó con LeRobot sobre el dataset `woosugi/so101_plate_pick`, compuesto por episodios de teleoperación del brazo SO-101 ejecutando la tarea de recoger un plato. El nombre del checkpoint indica batch size 16 y uso de SDPA como mecanismo de atención. No se dispone de información sobre el número total de episodios, tokens de entrenamiento (no aplica), composición del dataset ni si se aplicaron técnicas de RLHF o DPO; en un modelo de imitación supervisada como este, esos pasos no forman parte del pipeline estándar. No se documentan innovaciones adicionales más allá de las propias de ACT.

## Capacidades

- Control robótico de manipulación: genera comandos de articulaciones para el brazo SO-101 orientados a la tarea de recoger un plato.
- Predicción de chunks de acciones: emite secuencias de acciones de varios pasos, no acciones aisladas.
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de recompensas explícitas.
- Procesamiento de observaciones visuales mediante codificador de imágenes (las cámaras del robot forman parte de la entrada).
- Integración nativa con LeRobot para entrenamiento, evaluación y despliegue (`lerobot-train`, `lerobot-record`).
- No soporta tool calling, function calling, agentes, razonamiento multi-step textual ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni ninguna capacidad fuera del ámbito robótico.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo recoge un plato con el brazo SO-101, útil como base para tareas de manipulación repetitivas en entornos controlados.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para quien quiera entrenar su propia política ACT con LeRobot y comparar resultados con este checkpoint.
- Investigación en aprendizaje por imitación: permite reproducir y analizar el comportamiento de ACT con atención SDPA y batch size 16 frente a configuraciones alternativas.
- Docencia y formación en robótica de bajo coste: el SO-101 es un brazo asequible y este modelo demuestra el ciclo completo teleoperación → entrenamiento → despliegue.
- Evaluación de pipelines de LeRobot: el checkpoint se puede cargar con `--policy.path` en `lerobot-record` para validar la infraestructura de inferencia antes de entrenar tareas propias.
- Benchmark interno de tareas de manipulación: sirve como referencia de éxito en la tarea concreta de recoger un plato para comparar nuevas políticas o variantes de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, curvas de entrenamiento ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 millones de parámetros en safetensors (fp32), el peso ocupa aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA consumer (RTX 3060, RTX 4090) es suficiente; para entrenamiento se recomienda al menos una RTX 3090 o superior por el batch size 16 y el procesamiento de imágenes.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con al menos 4 GB de VRAM para inferencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch y SDPA; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de robótica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_plate_pick_bs16_sdpa | 51,7 M | Recoger plato con SO-101 | no aplica | apache-2.0 | Hugging Face (LeRobot) |
| Políticas ACT genéricas de LeRobot | variable | Manipulación diversa | no aplica | según checkpoint | Hugging Face |
| Políticas Diffusion Policy | variable | Manipulación | no aplica | según checkpoint | Hugging Face |
| Políticas VQ-BeT | variable | Manipulación | no aplica | según checkpoint | Hugging Face |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con alternativas; la comparación se limita a la categoría (políticas de imitación para robótica de manipulación) y a la licencia.

## Limitaciones y advertencias

- Modelo específico de una única tarea (recoger un plato) y un único robot (SO-101); no generaliza a otras tareas ni plataformas sin reentrenamiento.
- Sin datos publicados de tasa de éxito ni de robustez ante variaciones de iluminación, posición del objeto o del entorno.
- Riesgo de sobreajuste al dataset de teleoperación concreto; el comportamiento fuera de la distribución de entrenamiento es incierto.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades de razonamiento simbólico.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.
- No se documentan sesgos, pero al ser un modelo entrenado con datos de un operador humano concreto, puede heredar sesgos de estilo de teleoperación.
- No se especifican requisitos de calibración del robot ni versiones mínimas de LeRobot para la inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/woosugi/act_so101_plate_pick_bs16_sdpa
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/woosugi/so101_plate_pick
