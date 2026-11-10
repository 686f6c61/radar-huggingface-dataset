# twanghcmut/bridgequant-so101-76m-h50

## Resumen

bridgequant-so101-76m-h50 es una política visión-lenguaje-acción (VLA) de 64,8 millones de parámetros desarrollada por el usuario twanghcmut (Universidad Tecnológica de Ciudad Ho Chi Minh, según el identificador) para el control de un brazo robótico SO101 en tareas de manipulación. El modelo forma parte del proyecto BridgeQuant, un pipeline de cuantización asíncrona orientado a robótica, y se distribuye como checkpoint de inferencia en formato safetensors junto con estadísticas de normalización y ficheros de configuración.

La particularidad de este checkpoint frente a la variante base `bridgequant-so101-76m` es el horizonte de acción: se ha entrenado con `action_horizon: 50` (el horizonte empleado en openpi y GR00T) en lugar de 16, durante 60.000 pasos. El autor justifica el cambio con un análisis de las demostraciones: la liberación del cubo se produce hasta 49 fotogramas después de la posición final (mediana de 19), de modo que un chunk de 16 pasos solo contiene ese evento en el 29% de los episodios, mientras que uno de 50 lo contiene en todos.

El modelo está pensado para despliegue en inferencia robótica de bajo coste: con 76M de parámetros nominales y 64,8M reales en el fichero de pesos, cabe en GPUs de consumo y puede ejecutarse con un script de referencia incluido en el repositorio de código del proyecto. No se han publicado resultados de benchmarks estándar de NLP ni datos de licencia comercial más allá de la etiqueta `other`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer; variante `bridgequant_async_vla` |
| Parámetros totales | 64.843.435 (según safetensors); el nombre del checkpoint indica 76M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; horizonte de acción de 50 pasos |
| Tipos de cuantización | no disponible (el proyecto se denomina BridgeQuant, pero la model card no detalla esquemas) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en robótica) |
| Licencia | other |
| Formato de pesos | safetensors (más `norm_stats.json`, `config.json`, `metadata.json`, `train_config.yaml`, `bridgequant_vla.yaml`) |

## Arquitectura y entrenamiento

Se trata de una política VLA que mapea observaciones visuales y una instrucción de tarea en lenguaje natural a una secuencia de acciones motoras del brazo SO101. La arquitectura concreta (número de capas, dimensión oculta, codificador visual, mecanismo de fusión multimodal) no se detalla en la información disponible; la etiqueta `bridgequant_async_vla` sugiere un diseño orientado a cuantización asíncrona dentro del proyecto BridgeQuant.

El entrenamiento se realizó durante 60.000 pasos sobre tres datasets de demostraciones del entorno SO101, con una partición de hold-out: se reservaron los últimos 5 episodios de cada dataset, de modo que se usaron 154 de 159 episodios. La innovación principal es el horizonte de acción de 50 pasos en lugar de 16, elegido empíricamente para capturar el evento de liberación del objeto en las demostraciones. El autor reporta que, en evaluación offline sobre la tarea de apilar cubos, aparece una apertura del gripper en el chunk predicho antes de la liberación final en el 100% de los episodios de entrenamiento (frente a ~90% en modelos de 16 pasos) y en 2 de 5 episodios de hold-out (frente a 0-1 de 5 en los de 16 pasos), con un MAE de chunk prácticamente igual (2,66 frente a 2,55). No se especifica si hubo RLHF, DPO ni el volumen total de tokens o fotogramas de entrenamiento.

## Capacidades

- Generación de secuencias de acción motora para un brazo robótico SO101 a partir de observaciones visuales.
- Seguimiento de instrucciones de tarea en lenguaje natural (por ejemplo, "abrir el cajón, coger el cubo rojo y apilarlo sobre el cubo azul").
- Predicción de chunks de acción de hasta 50 pasos con coherencia temporal sobre eventos de agarre y liberación.
- Ejecución parcial de chunks: el autor recomienda `n_action_steps >= 25` para no descartar la fase de liberación del gripper, que se sitúa en los pasos 14 a 39 del chunk.
- Inferencia offline verificable mediante un self-test incluido en el script de referencia, con métricas esperadas de MAE.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica de pick-and-place en laboratorio: el modelo ejecuta la secuencia completa de abrir un cajón, coger un cubo y apilarlo sobre otro, con un horizonte de 50 pasos que cubre el evento de liberación en todas las demostraciones.
- Investigación en políticas VLA de bajo coste: con 64,8M de parámetros y 0,3 GB de repositorio, sirve como punto de partida reproducible para experimentos de horizonte de acción y cuantización.
- Evaluación comparativa de horizontes de acción: el checkpoint permite contrastar directamente el efecto de `action_horizon` 50 frente a 16 sobre la tasa de aparición del evento de liberación en predicciones offline.
- Prototipado de control de brazos SO101 en entornos educativos: el script `scripts/so101_policy.py` y el self-test con dataset de ejemplo permiten validar el pipeline sin entrenamiento adicional.
- Despliegue en hardware de gama media: su tamaño reducido permite inferencia en GPUs de consumo para ciclos de control en tiempo casi real, aunque no se publican latencias.
- Base para fine-tuning en tareas específicas de un laboratorio: la partición de hold-out documentada y los ficheros de normalización facilitan reproducir el protocolo de evaluación sobre nuevos datasets SO101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta únicamente métricas offline sobre la tarea de apilado:

| Métrica | Valor reportado |
|---|---|
| MAE de chunk (hold-out) | 2,66 (modelos de 16 pasos: 2,55) |
| Apertura de gripper antes de la liberación final, episodios de entrenamiento | 100% (16 pasos: ~90%) |
| Apertura de gripper antes de la liberación final, hold-out | 2 de 5 episodios (16 pasos: 0-1 de 5) |
| MAE de chunk esperado en self-test | ~2,2 |
| MAE de 8 acciones ejecutadas esperado en self-test | ~1,3 |
| MAE de gripper esperado en self-test | ~1,0 (unidades del dataset) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 64,8M de parámetros en FP32 el peso ronda los 0,26 GB, por lo que el cuello de botella será el codificador visual y el resto del pipeline, no los pesos.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM libre debería bastar.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier RTX o equivalente con memoria suficiente para el pipeline completo; no se especifican modelos concretos.
- Opciones de despliegue: script de referencia `scripts/so101_policy.py` del repositorio `VLAOpt/bridgequant-async` (commit `50683f1` o posterior), con guía en `docs/so101_deploy.md`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Horizonte de acción | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bridgequant-so101-76m-h50 | 64,8M (nominal 76M) | 50 pasos | no disponible | other | Hugging Face |
| bridgequant-so101-76m | 76M (nominal) | 16 pasos | no disponible | other | Hugging Face (mismo autor) |
| Políticas openpi / GR00T | no disponible | 50 pasos (referencia del horizonte) | no disponible | no disponible | no disponible |

La comparación cuantitativa con otras políticas VLA para SO101 no está disponible en la información proporcionada; la única alternativa documentada es la variante de 16 pasos del mismo autor, con MAE de hold-out de 2,55 frente a 2,66 y menor cobertura del evento de liberación.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado exclusivamente para el brazo SO101 y la tarea de apilar cubos; no es un modelo de propósito general.
- Requiere `n_action_steps >= 25` en inferencia; ejecutar solo 8 pasos por chunk descarta la fase de liberación del gripper (pasos 14 a 39 del chunk).
- El checkpoint proviene de una partición de hold-out (154 de 159 episodios entrenados), por lo que el rendimiento en tareas distintas a las tres de entrenamiento no está validado.
- Riesgo de alucinación de acciones no evaluado; no se documentan métricas de éxito en ejecución real sobre el robot, solo métricas offline de MAE.
- No se detallan sesgos, cobertura idiomática ni composición demográfica de los datos.
- Licencia `other`: no se especifican condiciones de uso comercial; es necesario consultar el repositorio antes de un despliegue en producción.
- Los datos de benchmarks estándar y de latencia/throughput no están disponibles, lo que limita la comparación con otras políticas VLA.
- Las rutas de datos dentro de `train_config.yaml` solo son necesarias para entrenamiento; la inferencia las ignora, pero un uso incorrecto del fichero puede confundir el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/bridgequant-so101-76m-h50
- Repositorio de código: https://github.com/VLAOpt/bridgequant-async (commit `50683f1` o posterior)
- Guía de despliegue: `docs/so101_deploy.md` dentro del repositorio anterior
- Script de inferencia: `scripts/so101_policy.py` dentro del repositorio anterior
