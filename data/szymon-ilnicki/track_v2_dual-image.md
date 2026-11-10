# Szymon-Ilnicki/track_v2_dual-image

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado originalmente por Hugging Face y publicado en el paper arXiv:2506.01844. El repositorio `Szymon-Ilnicki/track_v2_dual-image` es un fine-tuning de `lerobot/smolvla_base` entrenado por un tercero (Szymon-Ilnicki) sobre un dataset local de robótica denominado `track_v2_dual-image`. El modelo está pensado para control robótico de extremo a extremo: recibe observaciones visuales y produce acciones motrices, integrándose en el ecosistema LeRobot.

Con 450 millones de parámetros totales y un tamaño de repositorio de 1,2 GB, SmolVLA apunta explícitamente a despliegue en hardware de consumo, según la model card. La arquitectura combina un codificador visual, un modelo de lenguaje compacto y una cabeza de acciones, lo que permite inferencia en GPUs de gama media. El pipeline declarado en Hugging Face es `robotics` y la librería asociada es `lerobot`.

La relevancia de esta ficha concreta es doble: por un lado, documenta un fine-tuning específico para una tarea de seguimiento con imagen dual; por otro, sirve como referencia del estado actual de los modelos VLA ligeros, una categoría que está desplazando a los grandes modelos generalistas en escenarios de robótica de bajo coste. No obstante, el repositorio no incluye datos de benchmarks ni detalles del dataset de entrenamiento, lo que limita la evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacto; codificador visual + modelo de lenguaje + cabeza de acciones (detalle interno no disponible) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto según la descripción del paper referenciado (arXiv:2506.01844). La model card indica que está diseñado para lograr rendimiento competitivo con costes computacionales reducidos y despliegue en hardware de consumo. La composición interna exacta (número de capas, dimensión del codificador visual, tipo de modelo de lenguaje subyacente, mecanismo de fusión visión-lenguaje-acción) no se detalla en la información disponible.

El repositorio concreto es un fine-tuning de `lerobot/smolvla_base` sobre el dataset `local/track_v2_dual-image`. No se especifica el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El entrenamiento se realizó con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. La model card incluye comandos de entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`), aunque el ejemplo de entrenamiento usa `--policy.type=act`, lo que probablemente sea un residuo de la plantilla y no refleje la configuración real del fine-tuning.

## Capacidades

- Control robótico de extremo a extremo: genera acciones motrices a partir de observaciones visuales.
- Procesamiento de imagen dual: el nombre del dataset (`track_v2_dual-image`) sugiere entrada de dos cámaras, aunque no se detalla la configuración exacta.
- Aprendizaje por imitación: entrenado sobre demostraciones grabadas, típico del ecosistema LeRobot.
- Integración con LeRobot: compatible con los flujos `lerobot-train` y `lerobot-record`.
- Despliegue en hardware de consumo: según la model card, apto para GPUs de gama media.
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-step: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible (la visión es específica para control robótico).

## Casos de uso

- Seguimiento visual con dos cámaras: el modelo puede emplearse en tareas de tracking donde se combinan dos flujos de imagen para estimar la posición y orientación de un objeto o efector, usando el fine-tuning específico sobre `track_v2_dual-image`.
- Manipulación robótica de bajo coste: con 450 M de parámetros y despliegue en hardware de consumo, es adecuado para brazos robóticos tipo SO-100/SO-101 en laboratorios o prototipos educativos.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar políticas VLA compactas frente a modelos mayores en tareas de manipulación.
- Evaluación de políticas en simulación y realidad: los comandos `lerobot-record` permiten grabar episodios de evaluación y medir la tasa de éxito de la política en un robot físico.
- Prototipado rápido de tareas de seguimiento: al estar afinado sobre un dataset concreto de tracking, permite iterar sobre variaciones de la tarea sin reentrenar desde cero.
- Despliegue en entornos con recursos limitados: estaciones de trabajo con una sola GPU consumer pueden ejecutar inferencia, lo que facilita pruebas en laboratorios sin clústeres dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros, una estimación razonable en FP16 ronda 1 GB de pesos, más overhead de activaciones y del codificador visual (cifra no confirmada por el autor).
- GPU recomendadas: no disponible; la model card menciona hardware de consumo sin especificar modelos.
- ¿Cabe en GPU consumer? Según la model card, sí; el tamaño de pesos (1,2 GB de repo) es compatible con GPUs consumer de gama media, aunque no se detallan modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`); otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Szymon-Ilnicki/track_v2_dual-image | 450 M | no disponible | apache-2.0 | Hugging Face (LeRobot) | Fine-tuning específico de tracking con imagen dual |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face (LeRobot) | Modelo base del que deriva este fine-tuning |
| Otros VLA compactos (p. ej. variantes de ACT, Diffusion Policy) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un fine-tuning sobre un dataset local, hereda los sesgos de las demostraciones (condiciones de iluminación, posiciones, objetos y entorno específicos).
- Riesgo de alucinación: en modelos VLA, el equivalente es la generación de acciones no válidas o fuera de distribución; no hay evaluación publicada de robustez.
- Limitaciones de contexto o idioma: no se declara longitud de contexto ni idiomas soportados; el modelo está orientado a control robótico, no a texto general.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base y el dataset de entrenamiento pueden tener condiciones adicionales no detalladas.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes, sin benchmarks ni documentación del dataset; no hay evidencia de validación fuera del entorno de entrenamiento.
- La model card parece una plantilla: el comando de entrenamiento usa `--policy.type=act`, lo que sugiere que la documentación no está adaptada al fine-tuning real.
- Generalización limitada: al ser un fine-tuning sobre `track_v2_dual-image`, el rendimiento fuera de esa tarea y configuración de cámaras es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Szymon-Ilnicki/track_v2_dual-image
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
