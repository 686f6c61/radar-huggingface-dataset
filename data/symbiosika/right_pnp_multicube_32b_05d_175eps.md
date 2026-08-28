# symbiosika/right_pnp_multicube_32b_05d_175eps

## Resumen

El modelo `symbiosika/right_pnp_multicube_32b_05d_175eps` es un fine-tuning del modelo de política robótica NVIDIA GR00T-N1.7-3B, realizado con la librería LeRobot. Está diseñado para controlar un brazo robótico en una tarea concreta de manipulación, probablemente pick-and-place de cubos con el brazo derecho (según su nombre), aunque la model card no describe explícitamente la tarea. El autor es `symbiosika`, y el modelo se publica bajo licencia Apache 2.0.

El checkpoint contiene 3.144.016.000 parámetros (3.14B) almacenados en float32, lo que implica un archivo de 11.7 GiB. Se entrenó durante 20.000 pasos con un dataset local de 174 episodios, sin partición de validación. La pérdida final de entrenamiento fue de 0.010, pero la propia model card advierte que esto no garantiza éxito en el hardware real.

Es relevante porque demuestra un flujo completo de fine-tuning de un modelo VLA (visión-lenguaje-acción) de NVIDIA para una tarea específica, usando herramientas open source como LeRobot. Sin embargo, al no incluir datos de evaluación en el mundo real ni enlaces al dataset, su utilidad práctica queda limitada a quien tenga acceso al entorno de entrenamiento original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T-N1.7 (política de manipulación robótica, transformer) |
| Parametros totales | 3.144.016.000 (3.14B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en F32; se menciona que `bc/to_bf16.py` puede convertir a bf16) |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GR00T-N1.7-3B de NVIDIA, un modelo de política de manipulación robótica que procesa observaciones de cámara y estado del robot para generar acciones de control. El fine-tuning se realizó con LeRobot, la librería de aprendizaje por imitación de Hugging Face, sobre un checkpoint local llamado `base_models/GR00T-N1.7-3B-custom/`.

El entrenamiento usó un dataset local de 174 episodios de una tarea denominada `right_pnp_multicube` (pick-and-place de cubos con el brazo derecho). Se ejecutaron 20.000 pasos con batch size 32, learning rate 0.0001 (optimizador AdamW), seed 1000 y action chunking de tamaño 40 (chunk_size 40, n_action_steps 40). La pérdida de entrenamiento bajó de 1.1200 a 0.0100 (mínimo 0.0090), pero no se realizó validación (`--eval-split 0`), por lo que la pérdida solo refleja ajuste al conjunto de entrenamiento.

No se mencionan innovaciones técnicas adicionales más allá de las propias del modelo base. Los pesos se publican como masters float32 de LeRobot, lo que duplica el tamaño residente respecto a bf16; el script `bc/to_bf16.py` permite reducir el archivo a la mitad.

## Capacidades

- Control de un brazo robótico para tareas de manipulación (probablemente pick-and-place de cubos, según el nombre del dataset).
- Generación de acciones de control en espacio conjunto, condicionadas por observaciones visuales y del estado del robot.
- Soporte de action chunking (predicción de secuencias de 40 acciones) para ejecución suave.
- Integración con LeRobot para carga, evaluación y despliegue en hardware real.
- No se especifican capacidades de lenguaje, visión general o razonamiento; es un modelo de política puramente motora.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo robótico para recoger y colocar cubos u objetos similares, siempre que el entorno coincida con el de entrenamiento.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tuning de GR00T-N1.7-3B con LeRobot, útil para estudiar pipelines de entrenamiento y evaluación.
- Desarrollo de políticas robóticas personalizadas: partiendo de este checkpoint, se puede continuar el entrenamiento con nuevos datos para adaptarlo a otras tareas.
- Evaluación de la transferencia de políticas entre entornos: al estar entrenado con un dataset local no publicado, permite estudiar la sensibilidad a cambios de calibración y configuración del robot.
- Benchmarking de frameworks de despliegue (LeRobot, ROS, etc.): el checkpoint incluye preprocesadores y postprocesadores listos para usar en entornos compatibles.
- Docencia en robótica: como caso práctico de entrenamiento de un VLA con datos limitados (174 episodios) y análisis de sus limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito en hardware real y que la pérdida de entrenamiento no es una medida de rendimiento. El único dato cuantitativo es la pérdida de entrenamiento (final 0.010, mínimo 0.009), que carece de valor predictivo sobre el comportamiento en el mundo real.

## Requisitos de hardware

- El checkpoint F32 pesa 11.7 GiB; cargarlo requiere VRAM igual a ese tamaño (la carga completa del state dict se hace en GPU antes de copiar a parámetros).
- Convertido a bf16, el tamaño se reduce a aproximadamente 5.85 GiB, lo que permite ejecutarlo en GPUs consumer con al menos 8 GB de VRAM (p. ej., RTX 3070/3080/4070).
- Durante el entrenamiento se reportó un uso de memoria de 36.23 GB (mem_gb en el log), lo que sugiere que el entrenamiento requiere GPUs de gama alta (A100, RTX 4090 o similar).
- Para inferencia, se recomienda usar el script `bc/eval.py` de LeRobot, que gestiona la carga y ejecución. No se mencionan otras opciones de despliegue (vLLM, llama.cpp, etc.), ya que no es un modelo de lenguaje.
- La latencia y el throughput no están documentados; dependerán del hardware y del tamaño del batch de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre otros fine-tunes de GR00T-N1.7-3B para comparar. El modelo base `nvidia/GR00T-N1.7-3B` es el punto de referencia inmediato, pero no se han publicado métricas comparativas en la información disponible. Tampoco se conocen datos de modelos alternativos como OpenVLA o RT-2 en este contexto. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La pérdida de entrenamiento no garantiza éxito en el hardware real; la model card advierte que una curva de pérdida limpia puede fallar en todos los despliegues.
- No se realizó validación (no se reservaron episodios), por lo que no hay evidencia de generalización.
- El dataset de entrenamiento no está publicado ni enlazado, lo que impide reproducir el entrenamiento o evaluar la distribución de datos.
- La calibración del brazo robótico es parte del checkpoint; recalibrar entre entrenamiento y evaluación degrada silenciosamente el rendimiento.
- La ruta base (`base_models/GR00T-N1.7-3B-custom/`) está horneada en el checkpoint; en otra máquina debe existir esa ruta o editarse la configuración, y el ID del Hub no es un sustituto automático.
- Los pesos se almacenan en float32, lo que duplica el uso de VRAM frente a bf16; cargar el archivo requiere VRAM igual a su tamaño.
- No se han publicado resultados de benchmarks ni tasas de éxito, por lo que su rendimiento real es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de componentes de NVIDIA (GR00T-N1.7) cuyos términos de uso deben verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/symbiosika/right_pnp_multicube_32b_05d_175eps
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Librería LeRobot: https://github.com/huggingface/lerobot (referencia, no enlazada en la model card)

No se encontraron otros enlaces relevantes en la búsqueda web (los resultados obtenidos no están relacionados con este modelo).
