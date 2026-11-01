# wego-mink/dualarm_cube_act

## Resumen

`wego-mink/dualarm_cube_act` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el paper arXiv:2304.13705. El modelo ha sido entrenado y subido al Hub mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. Su propósito es controlar un brazo robótico dual (dos brazos) en una tarea de manipulación de un cubo, aprendiendo directamente de demostraciones teleoperadas.

A diferencia de los modelos de lenguaje, este checkpoint no genera texto: recibe observaciones (típicamente imágenes de cámaras y el estado de las articulaciones) y predice secuencias cortas de acciones motoras, los llamados "action chunks". Esta estrategia de predecir varios pasos de acción a la vez, en lugar de uno solo, reduce el error de acumulación y mejora la estabilidad del control, lo que se traduce en tasas de éxito más altas en tareas de manipulación.

El modelo tiene 51.685.006 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero y desplegable en hardware modesto. Está publicado bajo licencia Apache 2.0 y su relevancia radica en ser un ejemplo reproducible de entrenamiento de políticas robóticas con LeRobot, útil para investigadores que quieran replicar o adaptar el flujo de trabajo a sus propios robots y tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT), aprendizaje por imitación |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el modelo opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo implementa ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que emplea un transformer para predecir bloques de acciones futuras a partir de observaciones. La arquitectura combina un codificador visual (para procesar las imágenes de las cámaras) con un transformer que modela la secuencia de acciones, y se entrena de forma supervisada sobre datos de teleoperación. La innovación clave de ACT es el "action chunking": en lugar de predecir una única acción por paso, el modelo predice un fragmento de varias acciones consecutivas, lo que mitiga el problema de la acumulación de errores y permite un control más suave y robusto.

El entrenamiento se realizó con LeRobot sobre el dataset `wego-mink/dualarm_cube`, que contiene episodios de teleoperación de una tarea de manipulación de un cubo con un brazo dual. No se dispone de información sobre el número exacto de episodios, la composición detallada del dataset ni si se aplicaron técnicas de aumento de datos. Tampoco se documenta el uso de RLHF o DPO, algo esperable en un modelo de imitación robótica de este tipo. El checkpoint se generó con el comando `lerobot-train` y la configuración `--policy.type=act`.

## Capacidades

- Control motor de un brazo robótico dual mediante predicción de secuencias de acciones (action chunks).
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Procesamiento de observaciones multimodales: imágenes de cámaras y estado de las articulaciones del robot.
- Ejecución de una tarea específica de manipulación de un cubo (dualarm_cube).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- No soporta tool calling, function calling, agentes basados en lenguaje ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- **Investigación en aprendizaje por imitación**: el modelo sirve como referencia reproducible para estudiar el rendimiento de ACT en tareas de manipulación con brazos duales, permitiendo comparar variantes de arquitectura o de datos.
- **Prototipado rápido de políticas robóticas**: gracias a sus 51,7 millones de parámetros y 0,2 GB de tamaño, se puede cargar y ejecutar en estaciones de trabajo con una sola GPU consumer, lo que acelera los ciclos de experimentación.
- **Evaluación de pipelines de LeRobot**: se puede usar con `lerobot-record` para validar el flujo completo de entrenamiento, grabación de episodios y evaluación de políticas en un robot SO-100 u otro compatible.
- **Base para fine-tuning en tareas similares**: al estar bajo Apache 2.0, puede adaptarse a otras tareas de manipulación con datos propios, sirviendo como punto de partida para transferencia de aprendizaje.
- **Docencia y formación en robótica**: su tamaño reducido y su documentación asociada lo hacen adecuado para cursos prácticos sobre aprendizaje por imitación y control robótico.
- **Benchmark interno de manipulación dual**: puede emplearse como línea base contra la que medir nuevas políticas en la tarea concreta de manipulación de un cubo con dos brazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de ~51,7 millones de parámetros en safetensors (probablemente fp32), el peso ronda los 0,2 GB; la VRAM necesaria en inferencia es muy baja, del orden de 1-2 GB incluyendo buffers y procesamiento de imágenes.
- **GPU recomendadas**: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; se ha documentado el uso de `--policy.device=cuda`, por lo que se recomienda una GPU NVIDIA (RTX 3060, RTX 4090, A100, etc.).
- **¿Cabe en GPU consumer?**: sí, con holgura; cabe en tarjetas de gama baja como la RTX 3050 o incluso en algunas integradas con suficiente memoria compartida.
- **Opciones de despliegue**: LeRobot (entrenamiento e inferencia), con soporte para CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wego-mink/dualarm_cube_act | 51,7 M | no aplica | Manipulación dual (ACT) | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | variable | no aplica | Manipulación (ACT) | Apache 2.0 | Hugging Face |
| Políticas Diffusion Policy | variable | no aplica | Manipulación | variable | Hugging Face |
| Políticas VQ-BeT | variable | no aplica | Manipulación | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Especificidad de la tarea**: el modelo está entrenado exclusivamente para la tarea `dualarm_cube`; no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- **Dependencia del entorno**: el rendimiento puede degradarse si las condiciones de iluminación, la posición de las cámaras o el robot difieren de las del dataset de entrenamiento.
- **Riesgo de alucinación motora**: como toda política de imitación, puede producir acciones fuera de distribución ante observaciones no vistas, con riesgo para el robot y el entorno.
- **Sesgos del dataset**: al provenir de teleoperación humana, puede heredar sesgos de los operadores y de la distribución de demostraciones.
- **Sin soporte de lenguaje**: no es un modelo conversacional ni multilingüe; no debe evaluarse con métricas de NLP.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- **Documentación escasa**: no se detallan episodios, métricas de éxito ni configuración exacta de entrenamiento, lo que limita la reproducibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/wego-mink/dualarm_cube_act)
- [Paper ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Dataset dualarm_cube](https://huggingface.co/datasets/wego-mink/dualarm_cube)
