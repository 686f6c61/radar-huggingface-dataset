# twanghcmut/bridgequant-robotwin-76m

## Resumen

BridgeQuant 76M es un modelo de visión-lenguaje-acción (VLA) orientado a robótica, publicado por el usuario twanghcmut en HuggingFace. Forma parte del proyecto BridgeQuant, cuyo código está disponible en el repositorio VLAOpt/bridgequant-async. El modelo se ha entrenado de forma conjunta en tres tareas del benchmark RoboTwin 2.0: `beat_block_hammer`, `stack_blocks_two` y `place_empty_cup`, con 50 demostraciones limpias por tarea y articulaciones relativas del brazo.

La relevancia de esta ficha es doble. Por un lado, documenta un checkpoint de investigación de 64.990.891 parámetros (aproximadamente 76M según la nomenclatura del autor) que, según la propia model card, alcanzó un 0% de éxito en el simulador con este presupuesto de entrenamiento multi-tarea; el autor indica que el checkpoint funcional de RoboTwin es el modelo de una sola tarea de 7M (`bridgequant-robotwin-7m-hammer`). Por otro, sirve como referencia de las limitaciones prácticas del entrenamiento multi-tarea en modelos VLA pequeños.

El modelo no está pensado para uso general ni para despliegue en producción: es un artefacto de experimentación en robótica con licencia "other" y sin datos publicados de benchmarks, idiomas o cuantizaciones. Su interés es principalmente para investigadores que trabajen en políticas VLA ligeras y en la reproducibilidad de experimentos sobre RoboTwin 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-language-action (VLA); familia `bridgequant_async_vla` según los tags del repositorio |
| Parametros totales | 64.990.891 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (`model.safetensors`), acompañado de `norm_stats.json`, `bridgequant_vla.yaml`, `config.json`, `metadata.json` y `train_config.yaml` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su naturaleza VLA (visión-lenguaje-acción) y del identificador de familia `bridgequant_async_vla`. El modelo se entrenó de forma conjunta en tres tareas de manipulación de RoboTwin 2.0 (`beat_block_hammer`, `stack_blocks_two`, `place_empty_cup`), con 50 demostraciones limpias por tarea y control mediante articulaciones relativas del brazo. El bundle de pesos incluye `norm_stats.json` y los ficheros de configuración que espera la función `load_trainable_weights` del código del proyecto, lo que sugiere un pipeline de entrenamiento y evaluación unificado a través del mismo YAML de experimento.

El dato técnico más relevante es el resultado del entrenamiento: según el autor, el entrenamiento multi-tarea conjunto con este presupuesto alcanzó un 0% de éxito en el simulador, y el checkpoint funcional de RoboTwin es el modelo de una sola tarea de 7M (`bridgequant-robotwin-7m-hammer`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de las tres tareas citadas, ni si se aplicaron técnicas de RLHF, DPO o decodificación especulativa.

## Capacidades

- Política de visión-lenguaje-acción para control robótico de brazo en tareas de manipulación del benchmark RoboTwin 2.0.
- Entrenamiento multi-tarea sobre tres habilidades concretas: golpear un bloque con martillo (`beat_block_hammer`), apilar dos bloques (`stack_blocks_two`) y colocar una taza vacía (`place_empty_cup`).
- Control mediante articulaciones relativas del brazo, con normalización de observaciones y acciones incluida en el bundle (`norm_stats.json`).
- Integración con el pipeline de entrenamiento y evaluación del repositorio `VLAOpt/bridgequant-async`.
- Generación de texto, razonamiento general, código, matemáticas, tool calling, agentes o capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión general, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de investigación en políticas VLA: el checkpoint permite reproducir el resultado documentado de 0% de éxito en el entrenamiento multi-tarea con 76M de parámetros, útil para estudiar el efecto del presupuesto de datos y del escalado en modelos VLA pequeños.
- Línea base negativa en RoboTwin 2.0: sirve como referencia de comparación frente al checkpoint funcional de 7M de una sola tarea (`bridgequant-robotwin-7m-hammer`) en estudios de transferencia multi-tarea.
- Estudio del empaquetado de pesos y configuración: el bundle (`model.safetensors`, `norm_stats.json`, `bridgequant_vla.yaml`, `config.json`, `metadata.json`, `train_config.yaml`) documenta el formato que espera `load_trainable_weights`, útil para validar pipelines de carga y despliegue del proyecto BridgeQuant.
- Análisis de normalización de acciones: `norm_stats.json` permite inspeccionar cómo se normalizan las articulaciones relativas del brazo en las tres tareas, relevante para investigar la estabilidad del entrenamiento multi-tarea.
- Evaluación de infraestructura de simulación: al ser un modelo pequeño (64,99M de parámetros, repo de 0,3 GB), se puede cargar y ejecutar en entornos de simulación con recursos limitados para probar el bucle de evaluación del repositorio.
- Docencia y divulgación sobre VLA: por su tamaño reducido y su documentación explícita de fallo, es un ejemplo didáctico de las dificultades del entrenamiento multi-tarea frente al entrenamiento por tarea en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es que el entrenamiento multi-tarea conjunto alcanzó un 0% de éxito en el simulador de RoboTwin 2.0 con este presupuesto (50 demostraciones limpias por tarea, tres tareas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 64,99M de parámetros en safetensors y un repo de 0,3 GB, la inferencia en precisión de entrenamiento cabe holgadamente en GPUs de consumo; una estimación orientativa en fp32 sería de aproximadamente 0,26 GB solo para pesos, sin contar activaciones ni el codificador visual.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería poder cargar los pesos; la viabilidad real depende del codificador visual y del pipeline del repositorio.
- GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint, aunque no se confirma en la información disponible.
- Opciones de despliegue: el autor indica que la evaluación y el despliegue usan el mismo YAML del experimento y el cargador `load_trainable_weights` del repositorio `VLAOpt/bridgequant-async`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Estado |
|---|---|---|---|---|---|
| bridgequant-robotwin-76m | 64.990.891 | no disponible | 3 tareas RoboTwin 2.0 (multi-tarea) | other | 0% de éxito en simulador según el autor |
| bridgequant-robotwin-7m-hammer | ~7M (según el autor) | no disponible | 1 tarea RoboTwin 2.0 (beat_block_hammer) | other (presumiblemente, no confirmado) | checkpoint funcional según el autor |
| Otros modelos VLA de robótica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- El propio autor documenta un 0% de éxito en el simulador para este checkpoint multi-tarea; no debe usarse como política funcional.
- El checkpoint funcional de RoboTwin es, según el autor, el modelo de una sola tarea de 7M (`bridgequant-robotwin-7m-hammer`), no este.
- Licencia "other": no se especifican los términos exactos, por lo que no se puede confirmar el uso comercial; es necesario consultar los términos del repositorio antes de cualquier uso en producción.
- Sin datos publicados de benchmarks, idiomas, cuantizaciones ni contexto: la evaluación independiente es imprescindible.
- Sesgos conocidos y riesgo de alucinación: no documentados en la información disponible; en un modelo VLA, el riesgo relevante es la ejecución de acciones incorrectas en el robot, no la generación de texto.
- Ámbito muy restringido: tres tareas de manipulación en RoboTwin 2.0 con articulaciones relativas del brazo; no es un modelo de propósito general.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- El bundle incluye ficheros de configuración específicos del proyecto (`bridgequant_vla.yaml`, `train_config.yaml`); el uso fuera del repositorio `VLAOpt/bridgequant-async` puede requerir adaptaciones.

## Enlaces

- HuggingFace: https://huggingface.co/twanghcmut/bridgequant-robotwin-76m
- Código del proyecto: https://github.com/VLAOpt/bridgequant-async
- Checkpoint funcional de una sola tarea citado por el autor: `bridgequant-robotwin-7m-hammer` (no se proporciona URL directa en la información disponible)
