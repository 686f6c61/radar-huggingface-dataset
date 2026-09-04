# taewonkoo/stack_cube_stop_noise_70pct_40ep

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face y presentado en el paper 2506.01844. Este repositorio concreto es un fine-tuning del checkpoint base lerobot/smolvla_base, entrenado con la librería LeRobot para una tarea de manipulación robótica específica: recoger un cubo de madera y colocarlo sobre un cubo de Rubik. El modelo tiene 450.046.176 parámetros y se distribuye en formato safetensors, con un tamaño de repo de 0,9 GB.

A diferencia de los modelos de lenguaje tradicionales, este modelo no genera texto, sino que produce acciones de control para un robot. Consume observaciones multimodales (estado del robot e imágenes de varias cámaras) y emite comandos de acción de 6 dimensiones. Está diseñado para ejecutarse en hardware de consumo, lo que lo hace relevante para la investigación en robótica y el aprendizaje por imitación en entornos de laboratorio. El fine-tuning se realizó sobre un dataset de 40 episodios con 16.925 frames a 30 FPS, con una configuración de entrenamiento de 30.000 pasos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer VLA (SmolVLA) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de acción robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo compacto de visión-lenguaje-acción que combina un codificador visual con un decodificador de acciones. Este fine-tuning se basa en el checkpoint preentrenado lerobot/smolvla_base y se ha entrenado con la librería LeRobot en su versión 0.6.2. La configuración de entrenamiento incluye 30.000 pasos, batch size de 4, optimizador AdamW, learning rate de 1e-4 y semilla 1000.

El dataset de entrenamiento, taewonkoo/stack_cube_stop_noise_70pct_40ep, contiene 40 episodios y 16.925 frames a 30 FPS. El nombre del dataset sugiere que el 70% de los episodios incluyen ruido en las observaciones o acciones. La tarea es "Pick up the wooden cube and place it on top of the Rubik's Cube". El modelo consume como entradas el estado del robot (6 dimensiones), imágenes de hasta cuatro cámaras (tres de 256x256 y una de 480x640) y produce una acción de 6 dimensiones. No se han publicado resultados de evaluación en la model card.

## Capacidades

- Ejecución de tareas de manipulación robótica: recoger un cubo de madera y apilarlo sobre un cubo de Rubik.
- Entrada multimodal: estado de articulaciones del robot (6 dimensiones) e imágenes de cámaras.
- Salida de acciones continuas de 6 dimensiones para el control del robot.
- Fine-tuning específico para un robot tipo so_follower con cámaras frontales y superiores.
- No genera texto ni razonamiento simbólico; es un policy de aprendizaje por imitación.
- No soporta tool calling, function calling ni agentes conversacionales.
- Capacidades multilingües: no aplica.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como referencia para estudiar cómo un policy VLA compacto se comporta en una tarea de apilado con ruido. Se puede ejecutar con LeRobot y comparar con otros fine-tunings.
- Automatización de ensamblaje en laboratorio: en entornos controlados, el modelo puede controlar un brazo robótico para apilar componentes, útil para probar algoritmos de manipulación.
- Desarrollo de robots seguidores: el modelo está entrenado para el robot so_follower, por lo que puede integrarse directamente en ese hardware para tareas de manipulación de objetos.
- Benchmarking de hardware de consumo: gracias a su tamaño de 450M parámetros, permite evaluar el rendimiento de GPUs modestas en inferencia de políticas VLA.
- Punto de partida para fine-tuning en nuevas tareas: los investigadores pueden tomar este checkpoint y ajustarlo con datasets propios usando LeRobot.
- Educación en robótica: el modelo puede usarse en cursos y talleres para demostrar el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para este policy.

## Requisitos de hardware

- VRAM estimada para inferencia: no se proporcionan datos oficiales. Con 450M parámetros, en FP16 los pesos ocupan aproximadamente 0,9 GB, por lo que se estima un consumo de 1-2 GB de VRAM incluyendo overhead del runtime.
- GPU recomendadas: no especificadas por el autor. Por el diseño de SmolVLA, puede ejecutarse en hardware de consumo como una RTX 3060 o superior.
- Compatibilidad con GPU de consumo: sí, el modelo es apto para GPUs de gama media.
- Opciones de despliegue: LeRobot (comando lerobot-rollout), Hugging Face Hub. No es compatible con vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo ni para sus alternativas directas. La comparación se limita a especificaciones técnicas. El modelo base lerobot/smolvla_base es la referencia principal, ya que este fine-tuning se deriva de él. También existen variantes del mismo autor con diferentes porcentajes de ruido en el dataset (30% y 50%), aunque en Hugging Face aparecen como datasets, no como modelos.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| taewonkoo/stack_cube_stop_noise_70pct_40ep | 450.046.176 | No disponible | No publicado | Apache 2.0 |
| lerobot/smolvla_base | No disponible | No disponible | No publicado | Apache 2.0 |
| taewonkoo/stack_cube_stop_noise_30pct_40ep | No disponible | No disponible | No publicado | Apache 2.0 |

## Limitaciones y advertencias

- No hay resultados de evaluación publicados, por lo que se desconoce la tasa de éxito real en el robot.
- El modelo está entrenado para una única tarea (apilar cubo sobre cubo de Rubik) y puede no generalizar a otros objetos o configuraciones.
- Depende de la configuración específica de cámaras del robot so_follower; cambios en la posición o calibración pueden degradar el rendimiento.
- El dataset contiene ruido en el 70% de los episodios, lo que puede afectar la consistencia de las acciones aprendidas.
- Con solo 40 episodios de entrenamiento, existe riesgo de sobreajuste al dataset.
- No es un modelo de lenguaje, por lo que no puede utilizarse para tareas de NLP, generación de texto o razonamiento simbólico.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar la compatibilidad con su caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taewonkoo/stack_cube_stop_noise_70pct_40ep
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/taewonkoo/stack_cube_stop_noise_70pct_40ep
- Datasets similares: https://huggingface.co/datasets/taewonkoo/stack_cube_stop_noise_30pct_40ep y https://huggingface.co/datasets/taewonkoo/stack_cube_stop_noise_50pct_40ep
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
