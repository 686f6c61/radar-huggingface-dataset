# WetLabRoboData/diffusion-long_horizon2-scratch

## Resumen

diffusion-long_horizon2-scratch es una política de imitación robótica basada en modelos de difusión, publicada por WetLabRoboData dentro del ecosistema LeRobot. El modelo se entrenó desde cero (variante "scratch") exclusivamente con el dataset [WetLabRoboData/lerobot-data-long_horizon2](https://huggingface.co/datasets/WetLabRoboData/lerobot-data-long_horizon2) para resolver una única tarea de manipulación denominada long_horizon2 sobre un robot UR3e bimanual con tres cámaras. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que genera secuencias de acciones motoras a partir de observaciones visuales y propioceptivas.

El checkpoint contiene 264.873.854 parámetros y se distribuye en formato safetensors, con un repositorio de 1,1 GB y licencia Apache 2.0. Su relevancia actual es la de un artefacto de investigación reproducible: documenta de forma explícita el protocolo de evaluación (20 episodios, 1 éxito) y publica los vídeos de rollout junto con los resultados por episodio, algo poco habitual y útil para comparar estrategias de imitación en robótica.

Conviene subir el modelo con expectativas calibradas: la propia model card declara una tasa de éxito de 1/20 (5 %) y el repositorio no registra descargas ni valoraciones. Se trata, por tanto, de una línea base experimental para tareas bimanuales de horizonte largo, no de una política lista para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy de LeRobot (modelo generativo de difusión para predicción de acciones; backbone de denoising no detallado en la model card) |
| Parametros totales | 264.873.854 (~264,9 M, dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el horizonte de observación y de predicción de acciones no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (política robótica; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline declarado | robotics |
| Tarea objetivo | long_horizon2 |
| Robot objetivo | UR3e bimanual con 3 camaras |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-long_horizon2 |
| Variante | scratch (entrenada solo con los datos de esta tarea) |
| Tamano del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-04 / 2026-10-04 |

## Arquitectura y entrenamiento

La model card identifica el modelo como una "diffusion policy" de LeRobot, es decir, una política de imitación que aprende una distribución sobre secuencias de acciones mediante un proceso de difusión: se parte de ruido y se aplica un bucle iterativo de denoising condicionado por las observaciones (tres cámaras más el estado del robot) hasta obtener el bloque de acciones a ejecutar. Este enfoque permite modelar multimodalidad en las demostraciones, algo que las políticas deterministas de regresión tienden a promediar mal, a costa de una latencia mayor por los múltiples pasos de muestreo. La model card no especifica el número de pasos de denoising, el backbone exacto del predictor de ruido, el horizonte de acciones ni la frecuencia de control.

En cuanto a los datos, el entrenamiento se realizó únicamente sobre el dataset WetLabRoboData/lerobot-data-long_horizon2, en la variante scratch, sin indicios de preentrenamiento previo, RLHF, DPO ni ajuste posterior. No se documentan el número de episodios de demostración, el número de tokens ni la composición del dataset en la información disponible. La model card sí deja traza del proceso: los pesos se reorganizaron el 2026-10-04 a partir de WetLabRoboData/lerobot-data-smrithi-longhorizon2, y los artefactos originales de entrenamiento (checkpoints, train_config.json, directorio wandb/) se conservan en la subcarpeta `old/` del repositorio de origen para trazabilidad.

## Capacidades

- Generación de acciones motoras para manipulación bimanual: produce comandos de control para un robot UR3e con dos brazos a partir de observaciones visuales de tres cámaras.
- Ejecución de una tarea concreta de horizonte largo (long_horizon2) aprendida por imitación; no se documenta generalización a otras tareas.
- Procesamiento de entrada multimodal visión + estado propioceptivo del robot, integrado en el pipeline de LeRobot.
- Condicionamiento estocástico: al ser una política de difusión, puede muestrear distintas trayectorias de acción para una misma observación.
- Carga directa mediante la API de LeRobot (`DiffusionPolicy.from_pretrained`), lo que facilita su uso en scripts de evaluación e integración en bucles de control.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso simbólico, capacidades multilingües ni modo "thinking": son capacidades propias de modelos de lenguaje y no aplican a esta política.
- No se documentan capacidades de audio, vídeo generativo ni visión generalista más allá del uso de las cámaras como entrada de control.

## Casos de uso

- Investigación en imitation learning: sirve como línea base reproducible de diffusion policy para comparar contra otros algoritmos de imitación en la misma tarea, ya que se publican los 20 episodios de evaluación y sus resultados.
- Automatización de protocolos de laboratorio húmedo: la tarea long_horizon2 y el robot UR3e bimanual apuntan a manipulación de material de laboratorio; el modelo puede emplearse para automatizar secuencias largas de manipulación siempre que se acepte su tasa de éxito actual del 5 % y se añada supervisión humana.
- Punto de partida para fine-tuning: al ser una variante scratch entrenada solo con datos de esta tarea, es un candidato razonable para reentrenar o ajustar con demostraciones propias de otro montaje, reutilizando la arquitectura de difusión ya configurada en LeRobot.
- Reproducción de experimentos y auditoría: los vídeos de rollout y los resultados por episodio permiten verificar el comportamiento declarado y auditar la metodología de evaluación sin acceso al hardware.
- Docencia y formación en robótica: su tamaño moderado (264,9 M de parámetros) y su licencia permisiva lo hacen apto para prácticas sobre políticas de difusión, carga de checkpoints y análisis de fallos en manipulación bimanual.
- Generación de datos de comparación: los rollouts del modelo pueden usarse como condición de referencia en estudios de éxito/fracaso de políticas robóticas, o como datos negativos para análisis de recuperación de errores.
- Despliegue con intervención humana en tareas repetitivas de bajo riesgo: en un esquema de "robot supervisado" donde un operador valida cada intento, un 5 % de éxito sin ayuda obliga a replantear el caso de uso como asistencia, no como sustitución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican, además, a una política robótica. El único dato de rendimiento publicado es la evaluación propia del autor:

| Metrica | Valor |
|---|---|
| Tarea evaluada | long_horizon2 |
| Episodios de evaluacion | 20 |
| Episodios con exito | 1 |
| Tasa de exito declarada | 5 % (1/20) |
| Robot | UR3e bimanual (3 camaras) |
| Artefactos de evaluacion | WetLabRoboData/eval-diffusion-long_horizon2-scratch (videos de rollout y resultados por episodio) |

## Requisitos de hardware

- VRAM para inferencia (estimación aritmética a partir de los 264,9 M de parámetros, no confirmada por el autor): ~1,1 GB en fp32, ~0,55 GB en fp16/bf16 y ~0,28 GB en int8 solo para los pesos; hay que sumar activaciones, búferes de las tres cámaras y el estado del robot, por lo que en la práctica conviene reservar entre 2 y 4 GB.
- GPU recomendadas para inferencia: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4070) es suficiente; una RTX 4090, A100 o H100 queda sobredimensionada para este tamaño de modelo y solo aporta margen para ejecutar varios rollouts en paralelo.
- Cabe en GPU de consumo: sí, con holgura, incluso en equipos con 6-8 GB de VRAM si se ejecuta en fp16 y con batch pequeño.
- Entrenamiento desde cero o fine-tuning: se necesita más memoria que en inferencia (optimizador, gradientes y activaciones); como orden de magnitud, entre 8 y 16 GB en fp16 con checkpoints de gradiente, aunque el autor no publica requisitos de entrenamiento.
- Opciones de despliegue: LeRobot sobre PyTorch es la vía documentada (`DiffusionPolicy.from_pretrained`). vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. En políticas de difusión la latencia depende críticamente del número de pasos de denoising y de la frecuencia de control, datos que la model card no especifica.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada: no se han facilitado resultados de otras políticas de LeRobot ni de modelos de imitación comparables (por ejemplo, políticas ACT u otras diffusion policies del ecosistema) sobre la tarea long_horizon2, ni sus recuentos de parámetros, licencias o métricas de éxito en el mismo montaje.

| Modelo | Parametros | Contexto | Rendimiento en long_horizon2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion-long_horizon2-scratch | 264,9 M | no aplica | 1/20 exitos (5 %) | Apache 2.0 | HuggingFace (LeRobot), 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Cualquier comparación rigurosa exigiría evaluar otras políticas sobre el mismo robot UR3e bimanual, el mismo conjunto de 20 episodios y las mismas condiciones de cámara.

## Limitaciones y advertencias

- Tasa de éxito muy baja: 1 de 20 episodios (5 %) según la evaluación del propio autor. No es adecuada para uso autónomo en producción sin supervisión.
- Entrenada desde cero y solo con los datos de una tarea (variante scratch): no hay evidencia de generalización a otras tareas, objetos, posiciones o laboratorios.
- Dependencia del montaje: requiere un robot UR3e bimanual con exactamente tres cámaras y una configuración de calibración coherente con la del dataset de entrenamiento; cambios en la disposición de las cámaras o en la escena pueden degradar el comportamiento.
- Sesgos y sobreajuste: al proceder de demostraciones de teleoperación en un único entorno, la política hereda los sesgos de esas demostraciones (trayectorias, velocidades, posiciones preferidas) y puede fallar sistemáticamente ante condiciones no representadas.
- Multimodalidad y aleatoriedad: el muestreo de difusión introduce variabilidad entre ejecuciones; una misma observación puede producir trayectorias distintas, lo que complica la reproducibilidad exacta, aunque la distribución esté aprendida de los datos.
- Latencia: el bucle iterativo de denoising encarece cada predicción frente a políticas deterministas; el coste real no se puede estimar porque no se publican pasos de denoising ni frecuencia de control.
- Ausencia de validación externa: 0 descargas y 0 likes, sin benchmarks independientes ni informes de terceros.
- Riesgos de seguridad física: cualquier despliegue sobre hardware real debe incorporar paradas de emergencia, límites de fuerza y supervisión humana; una política con un 5 % de éxito ejecutará con frecuencia acciones incorrectas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no otorga garantías; el autor no ofrece soporte ni mantenimiento.
- Trazabilidad: los pesos se reorganizaron desde WetLabRoboData/lerobot-data-smrithi-longhorizon2; los artefactos originales quedan en la subcarpeta `old/` del repositorio de origen, por lo que conviene revisarlos si se necesita reconstruir el entrenamiento.
- Idiomas: no aplica, pero implica que no existe interfaz de lenguaje natural ni comprensión de instrucciones textuales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WetLabRoboData/diffusion-long_horizon2-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-long_horizon2
- Dataset de evaluación (vídeos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-long_horizon2-scratch
- Repositorio de origen del que se reorganizaron los pesos: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-smrithi-longhorizon2
- Resultados de la búsqueda web: no se encontraron enlaces relevantes (los resultados devueltos no guardaban relación con el modelo ni con robótica).
- Paper, blog o demo del autor: no disponibles.
