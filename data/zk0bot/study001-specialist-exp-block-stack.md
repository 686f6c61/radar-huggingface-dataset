# zk0bot/study001-specialist-exp-block-stack

## Resumen

Study 001 — specialist_exp block_stack es un artefacto de investigación publicado por el usuario zk0bot en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, orientado a la tarea concreta de manipulación robótica denominada `block_stack` (apilado de bloques). Con 450.046.176 parámetros y un repositorio de 0,9 GB, el modelo se distribuye en formato safetensors bajo licencia Apache 2.0.

El autor lo describe explícitamente como un artefacto de estudio y no como el modelo final destinado a producción: el modelo "enviado" o definitivo sería `ivelin/zk0-smolvla-fl`. Este ejemplar concreto corresponde a una variante "expert-only" (solo expertos), con un ámbito de entrenamiento limitado a 155 tensores, y sirve como referencia de especialista con ajuste completo (full-FT) dentro del Estudio 001.

Por su naturaleza (derivado de SmolVLA, un modelo de visión-lenguaje-acción para robótica), su relevancia es acotada: interesa a investigadores que reproducen o comparan estrategias de ajuste fino en políticas robóticas, no a desarrolladores que buscan un modelo de propósito general. La información pública disponible es muy escasa y no incluye datos sobre idiomas, arquitectura detallada ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de lerobot/smolvla_base, política visión-lenguaje-acción) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/smolvla_base`, un modelo de la familia SmolVLA orientado a políticas robóticas que combinan visión, lenguaje y acción. El autor no detalla la arquitectura interna en la model card, por lo que no se dispone de información sobre el tipo de transformer, el mecanismo de atención ni la composición exacta del codificador visual o del decodificador de acciones.

El entrenamiento consistió en 3.000 pasos con un enfoque "expert-only" limitado a un ámbito de 155 tensores, partiendo de los pesos de `lerobot/smolvla_base`. La pérdida final de entrenamiento reportada es de 0,100. No se especifican el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO. El autor indica que los especialistas con ajuste completo (full-FT) siguen siendo la referencia de techo para el Estudio 001, lo que sitúa a este artefacto como una variante intermedia dentro de esa comparación.

## Capacidades

- Ejecución de la tarea robótica `block_stack` (apilado de bloques) como política especializada derivada de SmolVLA.
- Procesamiento multimodal visión-lenguaje-acción heredado del modelo base, aunque no se documentan detalles concretos.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking mode, audio, etc.).
- Al ser un artefacto de estudio "expert-only", sus capacidades fuera de la tarea objetivo son inciertas y no están documentadas.

## Casos de uso

- Reproducción de experimentos de ajuste fino: sirve como punto de comparación frente a especialistas full-FT dentro del Estudio 001, permitiendo medir el efecto de limitar el ajuste a 155 tensores.
- Investigación en políticas robóticas especializadas: útil para estudiar cómo un ajuste de 3.000 pasos sobre SmolVLA afecta al rendimiento en una tarea concreta de manipulación como `block_stack`.
- Evaluación de estrategias de entrenamiento: permite contrastar la pérdida final (0,100) y el comportamiento del modelo frente a otras variantes del mismo estudio.
- Docencia y divulgación técnica: como ejemplo reproducible de un artefacto de investigación con licencia permisiva (Apache 2.0) y pesos en safetensors.
- Base para nuevos ajustes: al partir de SmolVLA y estar bajo Apache 2.0, puede servir como punto de partida para experimentos derivados en robótica.
- Análisis de eficiencia de ajuste: útil para estudiar el compromiso entre cobertura de tensores ajustados y calidad resultante en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 millones de parámetros, en fp16 el peso ronda los 0,9 GB, por lo que cabría en GPUs de consumo con suficiente margen, aunque no se documentan requisitos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por tamaño (0,9 GB en fp16), pero no confirmada por el autor.
- Opciones de despliegue: no disponible. Al ser un derivado de SmolVLA, es previsible que requiera el ecosistema LeRobot, pero no se especifica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| study001-specialist-exp-block-stack | 450.046.176 | no disponible | apache-2.0 | Artefacto de estudio, ajuste expert-only de SmolVLA |
| lerobot/smolvla_base | no disponible | no disponible | no disponible | Modelo base del que deriva |
| ivelin/zk0-smolvla-fl | no disponible | no disponible | no disponible | Modelo "enviado" según el autor, referencia del estudio |

## Limitaciones y advertencias

- El autor indica explícitamente que este no es el modelo final; el modelo destinado a uso es `ivelin/zk0-smolvla-fl`.
- Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- No se documentan sesgos conocidos, pero al derivar de un modelo entrenado con datos no especificados, pueden existir sesgos heredados no evaluados.
- Riesgo de alucinación y de comportamiento errático fuera de la tarea `block_stack`: no evaluado.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías ni documentación de calidad para producción.
- Especialización muy estrecha (expert-only, 155 tensores): su rendimiento en tareas distintas de `block_stack` es incierto.
- No se documenta el pipeline, el formato de entrada/salida ni las dependencias de software necesarias para ejecutarlo.

## Enlaces

- Hugging Face: https://huggingface.co/zk0bot/study001-specialist-exp-block-stack
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Modelo final del estudio: https://huggingface.co/ivelin/zk0-smolvla-fl
