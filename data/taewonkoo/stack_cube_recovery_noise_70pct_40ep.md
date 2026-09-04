# taewonkoo/stack_cube_recovery_noise_70pct_40ep

## Resumen

El modelo `taewonkoo/stack_cube_recovery_noise_70pct_40ep` es una política de visión-lenguaje-acción (VLA) basada en SmolVLA, un modelo compacto y eficiente desarrollado por Hugging Face que puede ejecutarse en hardware de consumo. Este modelo concreto es un fine-tuning del modelo base `lerobot/smolvla_base`, realizado por taewonkoo, para la tarea de recoger un cubo de madera y colocarlo encima de un cubo de Rubik. El entrenamiento se llevó a cabo con el framework LeRobot sobre un dataset de 40 episodios y 17.756 frames a 30 FPS. Con 450 millones de parámetros y licencia Apache 2.0, el modelo demuestra que los VLA compactos pueden abordar tareas de manipulación robótica con un coste computacional reducido, facilitando el despliegue en robots de bajo coste y entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto y eficiente, diseñado para reducir el coste computacional en comparación con modelos VLA más grandes. Este modelo es un fine-tuning de `lerobot/smolvla_base` sobre el dataset `taewonkoo/stack_cube_recovery_noise_70pct_40ep`, que contiene 40 episodios y 17.756 frames a 30 FPS para la tarea "Pick up the wooden cube and place it on top of the Rubik's Cube". La configuración de entrenamiento incluye 30.000 pasos, batch size 4, optimizador AdamW, learning rate 0.0001 y semilla 1000, utilizando la versión 0.6.1 de LeRobot. No se mencionan técnicas como RLHF o DPO en la información proporcionada. El modelo consume observaciones de estado (6 dimensiones) e imágenes de varias cámaras (256x256 y 480x640) y produce acciones de 6 dimensiones.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones a partir de observaciones de estado y múltiples vistas de cámara.
- Procesamiento de imágenes de resolución 256x256 y 480x640.
- Control de un robot de tipo `so_follower` con cámaras frontales y superiores.
- Ejecución de la tarea específica de apilar un cubo de madera sobre un cubo de Rubik.
- Fine-tuning a partir de un modelo base preentrenado, lo que permite adaptarlo a nuevas tareas con datasets relativamente pequeños.
- No se ha documentado soporte para tool calling, razonamiento multi-paso ni capacidades multilingües en la información disponible.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un robot so_follower para recoger objetos y colocarlos en posiciones concretas, útil en entornos de investigación de robótica.
- Recuperación de errores en tareas de apilado: el nombre del modelo sugiere que está entrenado con ruido (noise) para recuperarse de fallos durante el apilado de cubos, lo que lo hace adecuado para estudiar políticas robustas.
- Aprendizaje por imitación con pocos datos: gracias a su tamaño compacto y al fine-tuning desde SmolVLA base, se puede adaptar a nuevas tareas con datasets de decenas de episodios.
- Despliegue en hardware de consumo: al ser un modelo de 450M parámetros, es viable ejecutarlo en GPUs de gama media, facilitando la experimentación sin infraestructura costosa.
- Benchmarking de modelos VLA: sirve como referencia para comparar el rendimiento de políticas compactas frente a modelos VLA más grandes en tareas de manipulación.
- Integración en pipelines de LeRobot: se puede usar con las herramientas de LeRobot (lerobot-rollout, lerobot-train) para entrenar, evaluar y desplegar políticas robóticas de forma estandarizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no se proporcionan datos oficiales. Con 450M parámetros y un tamaño de 0.9 GB, los pesos en FP16/BF16 ocupan aproximadamente 0.9 GB. Se estima que la inferencia requiere entre 2 y 4 GB de VRAM, incluyendo activaciones y buffers.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una RTX 3060, RTX 4060 o superior. En entornos de investigación también se pueden usar A100 o H100, aunque no son necesarias.
- Compatibilidad con GPU de consumo: sí, el modelo está diseñado para ejecutarse en hardware de consumo.
- Opciones de despliegue: el modelo se despliega con el framework LeRobot mediante el comando `lerobot-rollout`, que carga la política y ejecuta el control del robot. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa completa con modelos similares. El modelo base es `lerobot/smolvla_base` (450M parámetros, Apache 2.0). En los resultados de búsqueda aparece `ImKyungjin/pi0-stackcube-recovery-noise-70pct-40ep`, un modelo para la misma tarea basado en pi0, pero no se proporcionan datos de parámetros ni rendimiento. Por tanto, la comparativa queda limitada a la existencia de estas variantes sin datos cuantitativos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| taewonkoo/stack_cube_recovery_noise_70pct_40ep | 450.046.176 | No disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | 450.046.176 | No disponible | Apache 2.0 | Hugging Face |
| ImKyungjin/pi0-stackcube-recovery-noise-70pct-40ep | No disponible | No disponible | No disponible | Hugging Face |

## Limitaciones y advertencias

- Sesgos: no se han evaluado sesgos en este modelo.
- Riesgo de alucinación: al ser una política de control robótico, los fallos se manifiestan como acciones incorrectas o incompletas en lugar de alucinaciones textuales.
- Limitaciones de contexto o idioma: no aplica, ya que el modelo no está diseñado para tareas de lenguaje general.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial y modificación, siempre que se mantengan los avisos de licencia.
- Caveat importante: el modelo se ha entrenado en un dataset pequeño (40 episodios) y para una tarea muy específica (apilar un cubo sobre un cubo de Rubik). Su capacidad de generalización a otras tareas, objetos o configuraciones de robot es limitada. Además, no se han publicado resultados de evaluación, por lo que su rendimiento real en el robot no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taewonkoo/stack_cube_recovery_noise_70pct_40ep
- Dataset en Hugging Face: https://huggingface.co/datasets/taewonkoo/stack_cube_recovery_noise_70pct_40ep
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
