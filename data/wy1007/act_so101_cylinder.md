# WY1007/act_so101_cylinder

## Resumen

`WY1007/act_so101_cylinder` es una política de imitación entrenada con el método Action Chunking with Transformers (ACT) sobre el robot SO-101 (variante `so_follower`). No es un modelo de lenguaje: es un modelo de control robótico que consume el estado articular y una imagen cenital de una cámara y produce comandos de acción de 6 dimensiones. Lo publica el usuario WY1007 en el Hub de Hugging Face mediante la librería LeRobot, con un total de 51.668.614 parámetros y un repositorio de 0,2 GB.

El modelo resuelve una tarea concreta de manipulación, "Pick and Place" (recoger y colocar un cilindro), aprendida a partir de 60 episodios de teleoperación que suman 32.407 fotogramas a 30 FPS. ACT predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suele lograr tasas de éxito altas en tareas de imitación con datos teleoperados.

Su relevancia es acotada y práctica: sirve como referencia reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento y despliegue) para un robot de bajo coste. No hay resultados de evaluación publicados, la licencia no está especificada y no se declaran idiomas, por lo que debe tratarse como un artefacto experimental más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de observación por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa la imagen `observation.images.top` de 3×480×640) con un transformer que predice secuencias de acciones de forma `(6,)` a partir del estado `observation.state` de forma `(6,)`. La innovación central del método es la predicción de chunks de acción, que agrupa varios pasos de control en una sola inferencia y mitiga el error compuesto típico de las políticas paso a paso.

El entrenamiento se realizó con LeRobot 0.7.0 durante 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, sobre el dataset `WY1007/so101_cylinder_v2_20261126_112009` (60 episodios, 32.407 fotogramas, 30 FPS, tarea "Pick and Place"). No se documenta el uso de RLHF, DPO ni fases de ajuste posteriores; es aprendizaje supervisado puro sobre demostraciones teleoperadas. Tampoco se detalla la composición del dataset más allá del número de episodios y la tarea.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para el robot SO-101 (`so_follower`).
- Percepción visual monocámara: procesa una imagen cenital de 480×640 píxeles.
- Ejecución de la tarea "Pick and Place" (recoger y colocar un cilindro) aprendida por imitación.
- Predicción de chunks de acción, que reduce la frecuencia de inferencia necesaria para el control.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo de pensamiento. Es una política específica de tarea, no un modelo de propósito general.

## Casos de uso

- Recogida y colocación de cilindros en un banco de pruebas: el modelo ejecuta la tarea "Pick and Place" sobre el SO-101 con una cámara cenital, adecuado para validar el pipeline completo de LeRobot antes de escalar a tareas más complejas.
- Reproducción de experimentos de imitación: sirve como punto de partida para comparar hiperparámetros (pasos, batch, learning rate) en ACT con un dataset de referencia de 60 episodios.
- Docencia y formación en robótica de bajo coste: el robot SO-101 y una política de 51,7 M de parámetros permiten montar un laboratorio de aprendizaje por imitación con hardware asequible.
- Prototipado de pipelines de teleoperación: el dataset asociado (32.407 fotogramas a 30 FPS) y la configuración de entrenamiento documentada permiten reconstruir el flujo de grabación y entrenamiento.
- Base para fine-tuning en tareas de pick-and-place similares: al ser una política ACT estándar, puede reentrenarse con `lerobot-train` sobre nuevos datasets manteniendo la arquitectura y el robot.
- Evaluación de robustez visual: al depender de una única cámara cenital, es útil para estudiar cómo afectan cambios de iluminación, posición de objetos o distractores al éxito de la política (aunque no hay métricas publicadas).
- Integración en entornos de simulación o gemelos digitales del SO-101 para pruebas previas al despliegue físico, siempre que se replique la interfaz de observación (estado de 6 dimensiones e imagen 480×640).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parámetros en precisión completa (fp32) el modelo ocupa aproximadamente 0,2 GB; en fp16 alrededor de 0,1 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican en la documentación. Por tamaño, una RTX 3060, RTX 4090 o cualquier GPU con al menos 2-4 GB de VRAM es suficiente; también es viable en CPU para inferencia, aunque la latencia de control a 30 FPS puede verse afectada.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=WY1007/act_so101_cylinder`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El control se ejecuta a 30 FPS según el dataset, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WY1007/act_so101_cylinder | 51,7 M | no aplica | Pick and Place en SO-101 | no disponible | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | tareas diversas | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | variable | no aplica | manipulación | variable | Hugging Face |

No se dispone de datos de rendimiento de este modelo ni de alternativas concretas con los que compararlo de forma cuantitativa; la comparación se limita a la categoría (políticas de imitación en LeRobot) y al método (ACT frente a Diffusion Policy u otras). No hay benchmarks publicados para establecer una comparación numérica.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay tasas de éxito ni validación en robot real, por lo que se desconoce su fiabilidad.
- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Especificidad de tarea y hardware: entrenado únicamente para "Pick and Place" con un SO-101 y una cámara cenital; no generaliza a otras tareas, objetos o configuraciones de cámara sin reentrenamiento.
- Dependencia de la cámara: la política asume una imagen `observation.images.top` de 3×480×640; cambios de iluminación, posición o calibración pueden degradar el comportamiento.
- Dataset pequeño: 60 episodios y 32.407 fotogramas son una base limitada; el riesgo de sobreajuste a las condiciones de grabación es alto.
- Sin capacidades lingüísticas ni de razonamiento: no debe confundirse con un modelo de lenguaje; no procesa texto ni instrucciones en lenguaje natural más allá de la etiqueta de tarea.
- Riesgo de alucinación en el sentido de acciones incorrectas: como toda política de imitación, puede generar comandos erráticos fuera de la distribución de entrenamiento.
- Sin sesgos documentados: no se han publicado análisis de sesgos, pero al ser un modelo visual hereda los sesgos de los datos teleoperados.
- Repositorio sin descargas ni likes: indica que no ha sido validado por la comunidad; tratar como experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WY1007/act_so101_cylinder
- Dataset de entrenamiento: https://huggingface.co/datasets/WY1007/so101_cylinder_v2_20261126_112009
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=WY1007/so101_cylinder_v2_20261126_112009
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
