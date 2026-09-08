# YzyLmc/pi05_red_block_only_isaac

## Resumen

El modelo `YzyLmc/pi05_red_block_only_isaac` es un fine-tuning de parámetros completos del modelo base `lerobot/pi05_base`, un VLA (Vision-Language-Action) de la familia PI0.5, desarrollado por el usuario `YzyLmc` y publicado en Hugging Face bajo licencia Apache-2.0. Está diseñado para la tarea robótica "Pick up the red block" (recoger el bloque rojo) y se entrena sobre el dataset `YzyLmc/red_block_only`, compuesto por 47 episodios y 20.822 fotogramas a 30 fps.

El modelo cuenta con 3.616.757.520 parámetros (aproximadamente 3.617 millones) y se presenta como un checkpoint intermedio de un proceso de entrenamiento en curso, actualmente en el paso 2.000 de 20.000. Su arquitectura es la de un VLA basado en transformer, aunque no se especifican los detalles internos en la información disponible. La salida del modelo es una secuencia de acciones de 7 dimensiones (7-D) con un chunk de 50 pasos a 30 fps.

La relevancia de este modelo radica en que sirve como punto de referencia para estudiar el efecto del fine-tuning de modelos PI0.5 en tareas de manipulación robótica con datos limitados. Sin embargo, al no haber sido evaluado en hardware y no contar con un split de validación, su uso práctico se limita al ámbito de la investigación y la experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en transformer; detalles no especificados |
| Parámetros totales | 3.616.757.520 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de parámetros completos del modelo base `lerobot/pi05_base`, un VLA de la familia PI0.5. La arquitectura exacta del transformer no se detalla en la información disponible, pero se sabe que el modelo procesa imágenes de cámaras (escena y muñeca) y genera una secuencia de acciones de 7 dimensiones, con un chunk de 50 pasos a 30 fps. Según la model card, se corrigieron las estadísticas de normalización percentil global y se declaró explícitamente la acción de 7 dimensiones en `config.json`, ya que el modelo base `lerobot/pi05_base` incluye por defecto una acción de 32 dimensiones que LeRobot no sobrescribe a partir del dataset.

El entrenamiento se realiza con un tamaño de lote de 32, precisión bfloat16, gradient checkpointing activado, y una tasa de aprendizaje con pico de 2.5e-5 que decae de forma coseno hasta 2.5e-6, con 1.000 pasos de warmup. En el momento de la publicación, el entrenamiento estaba en el paso 2.000 de 20.000. El dataset de entrenamiento, `YzyLmc/red_block_only`, consta de 47 episodios y 20.822 fotogramas a 30 fps para la tarea "Pick up the red block". No se ha realizado una división de datos de validación (held-out split), por lo que todas las métricas de entrenamiento reflejan el ajuste a los datos de entrenamiento, no la generalización. Tampoco se ha evaluado el modelo en hardware.

## Capacidades

- Generación de secuencias de acciones robóticas de 7 dimensiones (posición/orientación del efector final) a partir de observaciones visuales.
- Ejecución de la tarea específica "Pick up the red block" (recoger el bloque rojo) en un entorno de simulación (Isaac, según el nombre del modelo).
- Procesamiento de imágenes de dos cámaras: cámara de escena y cámara de muñeca, con renombrado a claves canónicas (`base_0_rgb` y `left_wrist_0_rgb`).
- Predicción de chunks de acción de 50 pasos a 30 fps, lo que permite planificar movimientos de aproximadamente 1,67 segundos.
- No se han descrito capacidades de lenguaje, tool calling, razonamiento ni soporte de agentes en la información disponible.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo permite estudiar cómo un VLA de 3.617 millones de parámetros se adapta a una tarea de manipulación con solo 47 demostraciones.
- Validación de políticas en simulación Isaac: el modelo puede desplegarse en un entorno simulado para probar si la política aprendida es capaz de recoger el bloque rojo, antes de cualquier transferencia a un robot real.
- Desarrollo de pipelines de datos para VLA: la corrección de normalización percentil y el renombrado de cámaras incluidos en este checkpoint sirven como referencia para otros fine-tunes sobre datasets similares.
- Benchmarking de checkpoints intermedios: al ser un checkpoint en el paso 2.000 de 20.000, puede usarse para comparar la evolución del rendimiento a lo largo del entrenamiento.
- Estudio de la configuración de acción: el modelo declara una acción de 7 dimensiones, lo que permite investigar cómo afecta la dimensionalidad de la acción al aprendizaje de políticas robóticas.
- Generación de trayectorias de acción: dado un estado visual, el modelo predice una secuencia de 50 acciones, útil para probar algoritmos de control predictivo o replanificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo no ha sido evaluado en hardware y que no existe una división de datos de validación, por lo que no se pueden proporcionar métricas de rendimiento fiables.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la información disponible.
- El modelo tiene 3.616.757.520 parámetros, lo que implica aproximadamente 7,2 GB de pesos en formato bfloat16 (estimación basada en el tamaño de los parámetros).
- Para inferencia sin cuantización se recomienda una GPU con al menos 16 GB de VRAM, aunque no hay datos oficiales que confirmen este requisito.
- No se indica soporte para vLLM, llama.cpp, Ollama ni TGI. El modelo está diseñado para usarse con la librería LeRobot de Hugging Face.
- Al ser un checkpoint de entrenamiento, el consumo de memoria durante el entrenamiento es mayor que durante la inferencia; el entrenamiento se realizó con gradient checkpointing y batch de 32 en bfloat16.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa detallada con otros modelos. Se puede comparar con el modelo base `lerobot/pi05_base` y con el fine-tune `YzyLmc/pi05_pick_block_red_yam`, ambos de la misma familia PI0.5, pero no se han publicado especificaciones completas de estos modelos en la información disponible. A continuación se muestra una tabla con los datos conocidos:

| Modelo | Parámetros | Licencia | Estado |
|---|---|---|---|
| YzyLmc/pi05_red_block_only_isaac | 3.616.757.520 | Apache-2.0 | Checkpoint 2000/20000, fine-tune en red_block_only |
| lerobot/pi05_base | no disponible | no disponible | Modelo base |
| YzyLmc/pi05_pick_block_red_yam | no disponible | no disponible | Fine-tune similar, sin datos |

## Limitaciones y advertencias

- El modelo no ha sido evaluado en hardware, por lo que no se conoce su comportamiento en un robot real.
- No se ha realizado una división de datos de validación: los 47 episodios se usaron para entrenar, por lo que las métricas de entrenamiento no indican capacidad de generalización.
- Es un checkpoint intermedio de un entrenamiento en curso (paso 2.000 de 20.000), no un modelo final.
- El dataset de entrenamiento es pequeño (47 episodios) y está limitado a una única tarea ("Pick up the red block"), lo que restringe su aplicabilidad a otros escenarios.
- El modelo requiere un renombrado específico de las cámaras a las claves canónicas de openpi (`scene_camera` -> `base_0_rgb`, `left_wrist_camera` -> `left_wrist_0_rgb`); de lo contrario, la inferencia fallará.
- Existe una discrepancia en la model card sobre el tamaño del chunk de acción: la descripción indica 60 pasos (2,0 s) mientras que la tabla indica 50 pasos a 30 fps. Esta inconsistencia debe tenerse en cuenta al usar el modelo.
- No es un modelo de lenguaje; su uso se limita a tareas de control robótico.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo no está validado para producción y debe considerarse exclusivamente como material de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YzyLmc/pi05_red_block_only_isaac
- Dataset de entrenamiento: https://huggingface.co/datasets/YzyLmc/red_block_only
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Modelo relacionado: https://huggingface.co/YzyLmc/pi05_pick_block_red_yam
