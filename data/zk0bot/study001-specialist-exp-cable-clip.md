# zk0bot/study001-specialist-exp-cable-clip

## Resumen

Study 001 — specialist_exp cable_clip es un artefacto de investigación publicado por el usuario zk0bot en Hugging Face. Se trata de un ajuste fino (fine-tuning) de tipo "expert-only" del modelo base lerobot/smolvla_base, entrenado específicamente para la tarea denominada cable_clip. Con 450.046.176 parámetros y un tamaño de repositorio de 0,9 GB, el modelo se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo forma parte del "Study 001", un estudio interno cuyo objetivo declarado es establecer una línea base ("fair specialist baseline") para tareas de manipulación robótica especializadas. Según la model card, el entrenamiento consistió en 3.000 pasos sobre un alcance de 155 tensores (expert-only), partiendo de lerobot/smolvla_base, y alcanzó una pérdida final de entrenamiento de 0,142. El autor advierte explícitamente de que este no es el modelo final distribuido: el modelo "enviado" o de producción es ivelin/zk0-smolvla-fl, y los especialistas con ajuste completo (full-FT) siguen siendo la referencia de techo para el estudio.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación reproducible, no de un modelo de propósito general. Resulta útil para quienes investigan el ajuste eficiente de modelos visión-lenguaje-acción (VLA) en robótica, concretamente la familia SmolVLA de LeRobot, y para comparar estrategias de entrenamiento parcial frente a ajuste completo. No debe confundirse con un modelo de chat o de generación de texto: su dominio es la robótica de manipulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de lerobot/smolvla_base; modelo VLA de la familia SmolVLA) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Lo único confirmado es que se obtiene por ajuste fino de lerobot/smolvla_base, un modelo de la familia SmolVLA orientado a tareas de visión-lenguaje-acción en robótica. El ajuste se realizó en modo "expert-only" sobre un alcance de 155 tensores, lo que sugiere que solo se actualizó un subconjunto de los parámetros del modelo base, presumiblemente las capas específicas de la tarea o del experto, manteniendo congelado el resto del backbone. Esta estrategia reduce el coste computacional y el riesgo de olvido catastrófico frente a un ajuste completo.

El entrenamiento constó de 3.000 pasos y finalizó con una pérdida de 0,142. No se especifican el número de tokens, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO; en el contexto de un modelo VLA de robótica, estos datos no serían directamente aplicables en su acepción habitual. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La model card indica que este artefacto no es el modelo final y que los especialistas con ajuste completo representan la referencia de rendimiento superior para el estudio.

## Capacidades

- Ejecución de la tarea específica cable_clip, presumiblemente una tarea de manipulación robótica de pinzado o sujeción de cables.
- Ajuste especializado sobre un modelo base VLA (visión-lenguaje-acción), lo que implica capacidad de procesar entradas visuales y producir acciones motoras.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No consta modo de razonamiento (thinking mode), visión general, audio ni otras capacidades especiales más allá de la tarea para la que fue entrenado.

## Casos de uso

- Investigación comparativa de estrategias de ajuste: sirve como línea base "expert-only" frente a especialistas con ajuste completo, permitiendo medir la brecha de rendimiento entre ambas estrategias en la tarea cable_clip.
- Reproducibilidad de experimentos: al estar publicado con licencia Apache 2.0 y formato safetensors, permite replicar el entrenamiento de 3.000 pasos y verificar la pérdida final de 0,142 reportada por el autor.
- Evaluación de transferencia desde SmolVLA: útil para estudiar cuánto conocimiento del modelo base lerobot/smolvla_base se conserva tras un ajuste parcial de 155 tensores.
- Prototipado de pipelines de robótica con LeRobot: puede integrarse en flujos de evaluación de políticas de manipulación antes de pasar al modelo de producción ivelin/zk0-smolvla-fl.
- Docencia y formación en VLA: como ejemplo didáctico de ajuste eficiente de un modelo de visión-lenguaje-acción en un dominio acotado.
- Auditoría de artefactos de investigación: permite inspeccionar la estructura de pesos y el alcance del ajuste (155 tensores) para validar la metodología del Study 001.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida final de entrenamiento de 0,142 tras 3.000 pasos, que no constituye un benchmark comparable con métricas estándar de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 millones de parámetros, una estimación orientativa en fp16 sería de aproximadamente 0,9 GB de pesos, más overhead de activaciones y del codificador visual del modelo VLA; en cuantización de 8 bits podría reducirse a unos 0,45 GB, aunque no se documentan cuantizaciones soportadas.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, el modelo cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, siempre que el pipeline de inferencia VLA lo permita.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño de 0,9 GB del repositorio, aunque no está confirmado por el autor.
- Opciones de despliegue: no documentadas. Al ser un modelo de robótica de la familia SmolVLA, el entorno natural sería LeRobot; no consta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| study001-specialist-exp-cable-clip | 450.046.176 | no disponible | apache-2.0 | Hugging Face (zk0bot) | Especialista expert-only, tarea cable_clip |
| lerobot/smolvla_base | no disponible | no disponible | no disponible | Hugging Face (lerobot) | Modelo base del que deriva |
| ivelin/zk0-smolvla-fl | no disponible | no disponible | no disponible | Hugging Face (ivelin) | Modelo de producción según la model card |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que este no es el modelo distribuido en producción; el modelo final es ivelin/zk0-smolvla-fl.
- Es un artefacto de investigación acotado a la tarea cable_clip; no es un modelo de propósito general ni un chatbot.
- No se documentan sesgos conocidos, pero al ser un ajuste especializado sobre un dominio robótico concreto, su comportamiento fuera de ese dominio es impredecible.
- Riesgo de alucinación: no aplicable en el sentido habitual de generación de texto; en robótica el riesgo equivalente es la ejecución de acciones incorrectas, no evaluado en la documentación.
- Limitaciones de contexto e idioma: no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base lerobot/smolvla_base puede tener condiciones propias que conviene verificar antes de un uso comercial.
- Solo se actualizaron 155 tensores; el resto de pesos provienen del modelo base, lo que puede limitar la adaptación a variaciones de la tarea.
- No hay métricas de evaluación publicadas más allá de la pérdida de entrenamiento (0,142), por lo que no es posible validar su rendimiento real en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zk0bot/study001-specialist-exp-cable-clip
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Modelo de producción: https://huggingface.co/ivelin/zk0-smolvla-fl
