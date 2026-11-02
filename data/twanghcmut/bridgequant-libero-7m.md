# twanghcmut/bridgequant-libero-7m

## Resumen

bridgequant-libero-7m es un modelo de visión-lenguaje-acción (VLA) para robótica desarrollado por el usuario twanghcmut, orientado a control de manipuladores en tareas de imitación. Combina un trunk híbrido de atención y convolución corta sobre un backbone Theia-tiny con un BERT-tiny podado, y un experto de flujo basado en convolución corta para generar acciones. El modelo se ha entrenado desde cero sobre las cuatro suites del benchmark LIBERO, sin destilación, y publica un rendimiento medio de 0,948 en LIBERO-500 (media de tres ejecuciones).

Con 6.593.715 parámetros totales, es un modelo extremadamente compacto pensado para despliegue en entornos con recursos limitados y para investigación en políticas robóticas de bajo coste. Su relevancia actual reside en la tendencia hacia VLA pequeños y eficientes que puedan ejecutarse en hardware de borde, en contraste con los VLA de miles de millones de parámetros.

La ficha se basa únicamente en la información disponible en HuggingFace y en la model card; los datos no publicados se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA híbrida: trunk de atención + convolución corta (Theia-tiny + BERT-tiny podado), experto de flujo de convolución corta |
| Parámetros totales | 6.593.715 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (model.safetensors) + norm_stats.json, bridgequant_vla.yaml, config.json, metadata.json, train_config.yaml |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura VLA con un trunk híbrido que combina mecanismos de atención con convoluciones cortas. El backbone textual/visual se construye a partir de Theia-tiny y un BERT-tiny podado, mientras que la generación de acciones se delega a un experto de flujo implementado con convolución corta. El bundle de pesos se acompaña de ficheros de configuración (`bridgequant_vla.yaml`, `config.json`, `metadata.json`) que la función `load_trainable_weights` espera para reconstruir el modelo.

El entrenamiento se realizó desde cero sobre las cuatro suites de LIBERO, sin destilación de un modelo mayor. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor publica además una variante destilada (`bridgequant-libero-7m-kd`) que alcanza 0,967 en LIBERO-500, lo que sugiere que la destilación se aplicó como mejora posterior sobre este modelo base.

## Capacidades

- Control robótico de manipulación mediante políticas visión-lenguaje-acción entrenadas en LIBERO.
- Generación de acciones condicionadas a observaciones visuales e instrucciones de tarea.
- Ejecución de tareas de imitación en los cuatro suites de LIBERO (objetos, espacial, meta y de largo horizonte, según la nomenclatura habitual del benchmark).
- Integración con el pipeline de robótica de HuggingFace (`pipeline: robotics`).
- Carga mediante el bundle de pesos y configuración proporcionado por el autor.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, thinking mode, visión general, audio ni otras funciones fuera del control robótico.

## Casos de uso

- Investigación en políticas VLA compactas: el modelo sirve como baseline de 6,6 M de parámetros para estudiar el efecto de arquitecturas híbridas atención/convolución en tareas de manipulación, con un coste computacional muy bajo.
- Despliegue en hardware de borde: por su tamaño reducido, puede ejecutarse en plataformas robóticas con recursos limitados donde un VLA de miles de millones de parámetros no cabría.
- Evaluación comparativa en LIBERO: permite reproducir el resultado 0,948 en LIBERO-500 y compararlo con la variante destilada y con otros VLA del benchmark.
- Prototipado rápido de pipelines de imitación: el bundle de configuración y el YAML de experimento permiten reentrenar o ajustar la política sobre nuevas suites de tareas sin rehacer la infraestructura.
- Educación y docencia en robótica: un modelo de este tamaño es viable para prácticas y demostraciones en entornos académicos con GPUs de consumo.
- Base para destilación: al existir una variante destilada con mejor rendimiento, el modelo base puede usarse como punto de partida para experimentos de destilación y compresión.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| LIBERO-500 (media de 3) | 0,948 | Modelo base, entrenado desde cero |
| LIBERO-500 (media de 3) | 0,967 | Variante destilada `bridgequant-libero-7m-kd` |

No se han publicado en la información disponible resultados desglosados por suite (objetos, espacial, meta, largo horizonte) ni comparaciones numéricas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 6,6 M de parámetros en fp32 el peso ronda los 26 MB, por lo que la VRAM vendrá dominada por el backbone visual y los buffers de inferencia, no por los pesos.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU moderna con al menos unos pocos GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer actual (RTX 3060, RTX 4090, etc.), aunque no se documenta una cifra concreta.
- Opciones de despliegue: carga mediante el bundle `load_trainable_weights` del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un VLA de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bridgequant-libero-7m | 6.593.715 | no disponible | 0,948 | other | HuggingFace |
| bridgequant-libero-7m-kd | no disponible | no disponible | 0,967 | other | HuggingFace (variante destilada del autor) |
| Otros VLA de referencia (p. ej. OpenVLA, π0) | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos con otros VLA de la misma categoría; la única comparación documentada es con la variante destilada del propio autor.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre las suites de LIBERO; su generalización a otros entornos, robots o tareas no está documentada.
- No se especifican sesgos conocidos ni evaluación de robustez fuera del benchmark.
- Riesgo de alucinación y de acciones erróneas en entornos reales no evaluado; se recomienda validación en simulación antes de cualquier despliegue físico.
- La licencia es "other": no se detallan los términos exactos, por lo que el uso comercial requiere consultar la licencia del repositorio antes de adoptarlo.
- No se documentan idiomas soportados ni capacidades multilingües.
- No se publican datos de cuantización, contexto máximo ni latencia, lo que dificulta planificar un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repo de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que el modelo es muy reciente.

## Enlaces

- HuggingFace: https://huggingface.co/twanghcmut/bridgequant-libero-7m
- Código: https://github.com/VLAOpt/bridgequant-async
