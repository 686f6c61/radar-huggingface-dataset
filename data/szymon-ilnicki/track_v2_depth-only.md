# Szymon-Ilnicki/track_v2_depth-only

## Resumen

SmolVLA es un modelo vision-lenguaje-acción (VLA) compacto desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico de bajo coste computacional. La variante aquí descrita, `track_v2_depth-only`, es un fine-tuning de `lerobot/smolvla_base` publicado por el usuario Szymon-Ilnicki sobre un dataset local denominado `track_v2_depth-only`, orientado a una tarea específica de seguimiento (tracking) que emplea únicamente información de profundidad como entrada visual.

El modelo resuelve el problema de mapear observaciones visuales y estado del robot a acciones motoras continuas, permitiendo desplegar políticas de control en hardware de consumo en lugar de requerir clústeres de GPU. Con 450 millones de parámetros, se sitúa en la categoría de VLA ligeros, y su relevancia actual radica en la tendencia hacia políticas robóticas eficientes que puedan ejecutarse en tiempo real sobre robots de bajo coste como la plataforma SO-100/SO-101 de LeRobot.

La información pública disponible es escasa: el repositorio tiene cero descargas y cero likes, la model card es prácticamente la plantilla por defecto de LeRobot y no se detallan hiperparámetros, composición del dataset ni resultados de evaluación. Todo lo que sigue se basa en los metadatos del repositorio y en la documentación general de SmolVLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA; detalles internos no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto libre) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, que según el paper referenciado (arXiv:2506.01844) es un VLA compacto y eficiente capaz de alcanzar rendimiento competitivo con costes computacionales reducidos y despliegue en hardware de consumo. La arquitectura concreta (combinación de codificador visual, modelo de lenguaje y cabeza de acciones) no se detalla en la información proporcionada; SmolVLA combina percepción visual, instrucciones en lenguaje natural y generación de acciones motoras, pero los pormenores de capas, atención y tokenización no están disponibles en esta ficha.

El entrenamiento se realizó mediante LeRobot sobre el dataset local `track_v2_depth-only`, lo que sugiere una política especializada en una tarea de seguimiento usando solo profundidad. No se especifican el número de episodios, el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o decodificación especulativa. Tampoco se documentan innovaciones técnicas adicionales más allá de las atribuibles a la base SmolVLA.

## Capacidades

- Generación de acciones motoras continuas a partir de observaciones visuales (en esta variante, específicamente profundidad) y estado del robot.
- Control de políticas robóticas de imitación entrenadas con LeRobot (formato de dataset y checkpoints compatible con `lerobot-record` y `lerobot-train`).
- Ejecución de inferencia en hardware de consumo, según las características declaradas de la familia SmolVLA.
- Integración con robots de la plataforma LeRobot, como `so100_follower` (mencionado en los ejemplos de la model card).
- Capacidad de fine-tuning adicional sobre nuevos datasets locales mediante el pipeline de LeRobot.
- No se documentan capacidades de tool calling, razonamiento multi-paso, multilingüismo conversacional ni modalidades de audio.

## Casos de uso

- Seguimiento robótico basado en profundidad: la política se emplearía para que un manipulador o base móvil siga un objeto o trayectoria usando únicamente mapas de profundidad, lo que la hace robusta ante variaciones de iluminación y textura. Es el caso de uso directo para el que fue entrenada.
- Investigación en aprendizaje por imitación: serviría como checkpoint de partida para experimentos de fine-tuning con LeRobot, comparando el efecto de usar solo profundidad frente a RGB.
- Despliegue en robots de bajo coste: al ser un VLA de 450 M de parámetros, puede ejecutarse en estaciones con GPU de consumo, adecuado para laboratorios con presupuesto limitado que usan SO-100/SO-101.
- Evaluación reproducible de políticas: el comando `lerobot-record` con `--policy.path` permite grabar episodios de evaluación y generar datasets etiquetados como `eval_`, útil para pipelines de validación automatizada.
- Prototipado de tareas de tracking en entornos controlados: por ejemplo, seguimiento de una pieza en una cinta transportadora o de un marcador en una mesa de trabajo, donde la profundidad aporta la señal geométrica principal.
- Docencia y formación en robótica: al ser un modelo pequeño con licencia Apache 2.0, es apto para cursos prácticos de VLA sin necesidad de infraestructura pesada.
- Base para comparativas de ablación: permite estudiar el impacto de eliminar la modalidad RGB en políticas VLA, comparándolo con el modelo base `smolvla_base`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros, en fp32 ocuparía aproximadamente 1,8 GB solo en pesos, y en fp16/bf16 alrededor de 0,9 GB, a lo que habría que sumar activaciones y buffers del codificador visual (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por el tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente en precisión reducida, aunque no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, dado el reducido número de parámetros; sin datos oficiales de latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), y por extensión los backends que soporte la librería. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI, que además no son el formato natural para políticas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Szymon-Ilnicki/track_v2_depth-only` | 450 M | no disponible | Apache 2.0 | Fine-tuning de SmolVLA para tracking con solo profundidad |
| `lerobot/smolvla_base` | no disponible en esta ficha (familia SmolVLA compacta) | no disponible | Apache 2.0 (según repositorio base) | Modelo base del que deriva; entrada multimodal completa |
| Políticas ACT de LeRobot | no disponible | no disponible | Apache 2.0 (ecosistema LeRobot) | Alternativa clásica de imitación mencionada en la propia model card (`--policy.type=act`) |
| Otros VLA ligeros (p. ej. familias OpenVLA) | no disponible en esta ficha | no disponible | variable | No se dispone de datos comparativos verificados en la información proporcionada |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible; no se han publicado métricas de éxito en tareas para esta variante.

## Limitaciones y advertencias

- Información muy escasa: la model card es la plantilla por defecto de LeRobot y no describe el dataset, la tarea exacta ni los hiperparámetros de entrenamiento.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la validación comunitaria.
- Especialización estrecha: al entrenarse solo con profundidad y sobre un dataset local (`track_v2_depth-only`), es probable que no generalice a otras tareas, entornos o sensores; no hay evidencia de robustez fuera de su dominio.
- Riesgo de sobreajuste al entorno de captura: los datasets locales suelen tener poca diversidad de escenas, iluminación y objetos.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero al ser un modelo visual hereda los sesgos de los datos de entrenamiento, que no se detallan.
- Riesgo de alucinación: en un VLA el equivalente es la generación de acciones erráticas o no seguras; no hay evaluaciones de seguridad publicadas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset subyacente impide verificar la procedencia y licencia de los datos de entrenamiento.
- No apto para producción sin evaluación previa: no hay benchmarks, ni métricas de éxito, ni pruebas de latencia; se recomienda validar en el robot objetivo antes de cualquier despliegue.
- El ejemplo de la model card usa `--policy.type=act`, lo que puede inducir a error: este checkpoint es SmolVLA, no ACT.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Szymon-Ilnicki/track_v2_depth-only
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
