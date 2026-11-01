# Yewy/mahjong_mat_pickup_jitter_v3_v6_policy

## Resumen

El modelo `Yewy/mahjong_mat_pickup_jitter_v3_v6_policy` es una política de aprendizaje por imitación publicada en HuggingFace por el usuario Yewy, entrenada con la librería LeRobot de Hugging Face. Implementa el método ACT (Action Chunking with Transformers), descrito en el paper arXiv:2304.13705, que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error acumulado en tareas de manipulación robótica. El modelo cuenta con 51.668.614 parámetros y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB.

La política está especializada en una tarea concreta de manipulación: la recogida de una pieza de mahjong sobre una superficie (mat) con variaciones de jitter, según se deduce del identificador del dataset de entrenamiento `Yewy/mahjong_mat_pickup_jitter_v3_v6_224`. Los tags del repositorio indican que el hardware objetivo es el robot LeKiwi con brazo SO-101, dentro del ecosistema LeRobot, y que la resolución de entrada aparente es de 224 píxeles.

Es relevante para desarrolladores e investigadores en robótica de bajo coste que quieran reproducir o adaptar flujos de entrenamiento de políticas visuomotoras con LeRobot. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que mapea observaciones visuales y de estado del robot a comandos de acción. Su licencia Apache 2.0 permite uso comercial, aunque el alcance práctico está limitado a la tarea y el robot para los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre ventanas de observaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un backbone visual con un transformer que decodifica secuencias de acciones. En lugar de predecir una única acción por paso de control, el modelo predice un chunk de acciones futuras, lo que mitiga el problema de la acumulación de errores en políticas de imitación clásicas y permite un control más suave. La variante implementada en LeRobot sigue el diseño del paper original e incluye los componentes habituales de ACT: codificador de imágenes, fusión de estado proprioceptivo y decodificador de acciones con consultas fijas.

El entrenamiento se realizó con LeRobot a partir del dataset `Yewy/mahjong_mat_pickup_jitter_v3_v6_224`, que contiene demostraciones teleoperadas de la tarea de recogida de una pieza de mahjong con variaciones deliberadas de posición y jitter. No se especifican en la información disponible el número de episodios, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos adicionales. Tampoco se documentan fases de RLHF o DPO, algo esperable en un modelo de imitación supervisada. El sufijo `224` del dataset sugiere una resolución de entrada de 224×224 píxeles, coherente con los backbones visuales habituales en LeRobot.

## Capacidades

- Control visuomotor para manipulación robótica: genera comandos de acción a partir de observaciones de cámara y estado del robot.
- Predicción de chunks de acciones, lo que permite movimientos más estables que políticas paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Especialización en la tarea de recogida de una pieza de mahjong sobre una superficie, con robustez ante variaciones de posición (jitter).
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Compatibilidad con el robot LeKiwi y el brazo SO-101, según los tags del repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos de imitación en robótica de bajo coste: sirve como referencia para validar un pipeline completo de LeRobot con el robot LeKiwi y el brazo SO-101, desde la recogida de datos hasta la evaluación en hardware real.
- Recogida automatizada de piezas pequeñas: el modelo está entrenado específicamente para pickup de una pieza de mahjong sobre una superficie, por lo que puede emplearse directamente en demos de pick-and-place con objetos de geometría similar.
- Evaluación de robustez ante jitter: el dataset incluye variaciones de posición, lo que permite estudiar cómo se degrada la política cuando el objeto no aparece exactamente en la posición de entrenamiento.
- Base para fine-tuning en tareas de manipulación relacionadas: al ser una política ACT estándar en LeRobot, puede reentrenarse con un dataset propio para tareas de recogida sobre superficies planas.
- Docencia y formación en aprendizaje por imitación: el tamaño reducido (51,7 M de parámetros, 0,2 GB) y la licencia Apache 2.0 lo hacen adecuado para cursos y talleres donde se enseña a entrenar y desplegar políticas visuomotoras.
- Benchmark interno de infraestructura de inferencia robótica: útil para medir latencia de política en tiempo real sobre GPU consumer antes de escalar a tareas más complejas.
- Prototipado de integración con hardware LeKiwi: permite validar la cadena de comunicación robot-política y los tiempos de control antes de invertir en datasets más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,2 GB, por lo que cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, una RTX 3060, RTX 4060 o superiores son más que suficientes; también cabría en GPUs integradas con soporte CUDA o en CPU para inferencia a baja frecuencia.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en placas tipo Jetson para despliegue embebido.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo documentado por el autor. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yewy/mahjong_mat_pickup_jitter_v3_v6_policy | 51,7 M | ACT (LeRobot) | no aplica | Apache 2.0 | HuggingFace |
| Políticas ACT genéricas de LeRobot (p. ej. entrenadas con datasets públicos de LeRobot) | variable, típicamente decenas de millones | ACT | no aplica | según dataset | HuggingFace |
| Políticas Diffusion Policy en LeRobot | variable | difusión | no aplica | según implementación | HuggingFace / repos |
| Políticas basadas en VLA (p. ej. OpenVLA) | miles de millones | VLM + acciones | contextual | variable | HuggingFace |

La comparación directa con alternativas concretas no está disponible en la información proporcionada. A grandes rasgos, este modelo se sitúa en la categoría de políticas ACT ligeras y especializadas, frente a enfoques VLA de mayor tamaño y generalidad pero con requisitos de cómputo mucho mayores.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para una única tarea (recogida de una pieza de mahjong con jitter) y un hardware concreto (LeKiwi + SO-101). No se espera generalización a otros objetos, tareas o robots sin reentrenamiento.
- Sin datos de evaluación publicados: no hay métricas de éxito, benchmarks ni curvas de aprendizaje en la información disponible, lo que impide estimar su fiabilidad real.
- Riesgo de sobreajuste al entorno de entrenamiento: cambios de iluminación, fondo, cámara o posición de la mesa pueden degradar el rendimiento; el jitter del dataset mitiga parcialmente este problema, pero no lo elimina.
- Sin capacidades lingüísticas ni de razonamiento simbólico: no debe usarse como modelo de texto, agente conversacional ni sistema de tool calling.
- Sesgos: no se documentan sesgos específicos, pero al ser un modelo entrenado con datos teleoperados de un operador concreto, puede heredar sesgos motores o de estrategia de recogida de ese operador.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar la licencia del dataset de entrenamiento y de los componentes de LeRobot utilizados.
- Para producción: requiere validación en el hardware objetivo, monitorización de fallos de agarre y un plan de recuperación ante errores, ya que no se documentan mecanismos de seguridad ni de detección de fallos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yewy/mahjong_mat_pickup_jitter_v3_v6_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Yewy/mahjong_mat_pickup_jitter_v3_v6_224
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
