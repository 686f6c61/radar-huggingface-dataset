# theconstruct-ai/merged_dataset

## Resumen

`theconstruct-ai/merged_dataset` es un modelo de visión-lenguaje-acción (VLA) afinado a partir de NVIDIA GR00T-N1.7-3B para el robot humanoide Unitree G1 de 23 grados de libertad (etiqueta de embodiment `g1_29dof` en la model card). Está desarrollado por The Construct y orientado a una tarea concreta: la clasificación autónoma de paquetes con manipulación bimanual. El checkpoint parte de `theconstruct-ai/sort_packages_real_4000`, que a su vez deriva del modelo fundacional `nvidia/GR00T-N1.7-3B`.

El modelo combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras en un único transformer de aproximadamente 3.144 millones de parámetros (dato real de los pesos en safetensors). El repositorio ocupa 35,7 GB y se distribuye en formato safetensors bajo licencia Apache 2.0. No es un modelo de propósito general: es una política robótica especializada, por lo que su utilidad está acotada al dominio de manipulación para el que fue entrenado.

Su relevancia radica en que ejemplifica el flujo de trabajo actual de fine-tuning de VLAs fundacionales sobre hardware humanoide asequible (Unitree G1), con una estrategia explícita de mitigación del olvido catastrófico mediante la reinserción del dataset original en la mezcla de entrenamiento. La información pública disponible es escasa: no se detallan benchmarks, composición exacta del dataset ni resultados cuantitativos de éxito en tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en NVIDIA GR00T-N1.7; transformer multimodal con cabeza de acciones |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de lenguaje natural dependen del modelo fundacional GR00T) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Embodiment | `g1_29dof` (Unitree G1, control relativo de articulaciones y EEF) |
| Representacion de acciones | 29 DOF (articulaciones relativas y efector final) |
| Modelo base | `theconstruct-ai/sort_packages_real_4000` (fundacional: `nvidia/GR00T-N1.7-3B`) |
| Tamano del repositorio | 35,7 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La arquitectura es un VLA derivado de NVIDIA GR00T-N1.7, un modelo multimodal que procesa observaciones visuales e instrucciones en lenguaje para emitir acciones motoras de bajo nivel. La cabeza de acciones opera sobre 29 grados de libertad con representación de control relativo de articulaciones y efector final (EEF), etiquetada como `g1_29dof`. No se especifica en la información disponible el número de capas, dimensión oculta, mecanismo de atención ni detalles del encoder visual.

El entrenamiento consistió en un fine-tuning de 1.000 pasos sobre 2 GPU NVIDIA H200 SXM. El dataset de entrenamiento (`theconstruct-ai/merged_dataset`) combina tres fuentes: el dataset original `theconstruct-ai/sort_packages_real`, el dataset `theconstruct-ai/sort-pckg-real-guillem` y nuevos episodios de demostración teleoperados en el mundo real. La decisión técnica destacable es la reinserción deliberada del dataset original en la mezcla de fine-tuning para mitigar el olvido catastrófico: al entrenar sobre el corpus combinado de demostraciones históricas y episodios nuevos, la política conserva capacidades de manipulación previamente aprendidas mientras se adapta a nuevos contextos de ejecución y variaciones de trayectoria. No se documenta el uso de RLHF, DPO ni el número total de tokens o episodios de entrenamiento.

## Capacidades

- Generación de acciones motoras bimanuales para el humanoide Unitree G1 (29 DOF) a partir de observaciones visuales.
- Clasificación y manipulación autónoma de paquetes (tarea principal de entrenamiento).
- Comprensión de instrucciones en lenguaje natural heredada del modelo fundacional GR00T-N1.7.
- Control relativo de articulaciones y efector final (EEF).
- Ejecución de políticas de imitación aprendidas de demostraciones teleoperadas.
- Retención de habilidades previas gracias a la estrategia anti-olvido catastrófico.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Clasificación de paquetes en almacén: el modelo ejecuta la tarea de ordenación de paquetes para la que fue entrenado, recibiendo observaciones visuales y emitiendo acciones bimanuales sobre el Unitree G1.
- Automatización de líneas de picking y sorting: integrado en una celda robotizada con el G1, permite sustituir la teleoperación por ejecución autónoma de la política aprendida.
- Investigación en manipulación bimanual: sirve como checkpoint de partida para estudiar transferencia de políticas VLA en humanoides de 29 DOF y comparar estrategias de fine-tuning.
- Base para fine-tuning adicional: al estar bajo Apache 2.0 y derivar de GR00T, puede reentrenarse con nuevos episodios teleoperados para variantes de la tarea (por ejemplo, nuevos tipos de paquete o disposiciones de estantería).
- Evaluación de olvido catastrófico: el par de checkpoints (`sort_packages_real_4000` frente a `merged_dataset`) permite medir empíricamente la retención de habilidades al reentrenar con datos nuevos.
- Demostraciones y validación de hardware: útil para validar pipelines de despliegue de VLAs en el Unitree G1 antes de escalar a producción.
- Formación y docencia en robótica: ejemplo reproducible de fine-tuning de un VLA fundacional sobre datos reales con hardware de gama H200.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de tarea, comparativas con otros checkpoints ni evaluaciones cuantitativas de manipulación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,14 B parámetros en safetensors (precisión original, presumiblemente BF16/FP16), se requieren aproximadamente 6,3 GB solo para pesos; el consumo real es mayor por el encoder visual, buffers de observación y el estado del entorno de simulación/robot.
- GPU recomendadas: el entrenamiento se realizó en 2x NVIDIA H200 SXM. Para inferencia, una GPU con 16-24 GB (RTX 4090, L40S, A10G) debería ser suficiente para los pesos, aunque no se documenta oficialmente.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 (24 GB) y RTX 3090 (24 GB) para los pesos; no confirmado por el autor.
- Opciones de despliegue: no se documentan explícitamente; al ser un VLA de robótica, el despliegue típico requiere el stack de GR00T/Isaac y un runtime de control del Unitree G1, no servidores de texto estándar como vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `theconstruct-ai/merged_dataset` | 3,14 B | no disponible | VLA para sorting bimanual en Unitree G1 | Apache 2.0 | Hugging Face |
| `nvidia/GR00T-N1.7-3B` | ~3 B | no disponible | VLA fundacional generalista | no disponible en la información | Hugging Face (NVIDIA) |
| `theconstruct-ai/sort_packages_real_4000` | no disponible | no disponible | VLA sorting (checkpoint previo) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos checkpoints ni con otros VLAs robóticos (OpenVLA, π0, RT-2) en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado para una única tarea (sorting de paquetes) y un único embodiment (Unitree G1, `g1_29dof`); no es un modelo de propósito general.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito, robustez ni generalización.
- Riesgo de sobreajuste al entorno de entrenamiento: variaciones de iluminación, disposición de objetos o del robot pueden degradar el rendimiento.
- Sesgos: no documentados, pero al entrenarse con demostraciones teleoperadas humanas puede heredar sesgos de trayectoria y estilo de manipulación de los operadores.
- Riesgo de alucinación motora: como política generativa, puede producir acciones no válidas o inseguras fuera de la distribución de entrenamiento; requiere capas de seguridad en el robot.
- Idiomas: no se especifica el soporte multilingüe de las instrucciones; depende del modelo fundacional GR00T.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue en un robot físico conlleva responsabilidad de seguridad no cubierta por la licencia.
- Información de la model card mínima: faltan detalles de composición del dataset, número de episodios, métricas y procedimiento de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theconstruct-ai/merged_dataset
- Organización The Construct (datasets): https://huggingface.co/theconstruct-ai/datasets
- Checkpoint base: https://huggingface.co/theconstruct-ai/sort_packages_real_4000
- Modelo fundacional: https://huggingface.co/nvidia/GR00T-N1.7-3B
