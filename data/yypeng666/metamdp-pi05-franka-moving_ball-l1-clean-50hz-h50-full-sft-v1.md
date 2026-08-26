# yypeng666/metamdp-pi05-franka-moving_ball-l1-clean-50hz-h50-full-sft-v1

## Resumen

Este repositorio contiene los checkpoints públicos del entrenamiento de fine-tuning SFT (supervised fine-tuning) del modelo pi0.5 para una tarea específica de robótica: el agarre y elevación de una bola en movimiento (moving-ball) en un entorno simulado robosuite con un brazo Franka. El autor es yypeng666, y el modelo se ha desarrollado bajo el framework openpi, una librería para modelos de visión-lenguaje-acción (VLA). La tarea se enmarca en el nivel L1, que corresponde a un movimiento de bola con velocidad constante, y se ha entrenado con un horizonte de predicción de 50 acciones a 50 Hz.

La relevancia de este modelo radica en que es un checkpoint intermedio de un proceso de entrenamiento de SFT a partir del modelo base pi0.5, diseñado para evaluación y recuperación del estado de entrenamiento. No se adjunta ninguna evaluación downstream, por lo que su utilidad principal es como recurso para investigación en robótica y para reproducir experimentos de control de robots simulados. El tamaño del repositorio es de 134,2 GB, lo que sugiere un modelo de gran escala, acorde con los pesos completos de un VLA de última generación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en pi0.5, modelo VLA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | OpenPI (checkpoint de entrenamiento) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning SFT del modelo pi0.5, una arquitectura de visión-lenguaje-acción (VLA) que combina un codificador de imágenes, un modelo de lenguaje y una cabeza de acción para generar comandos motores directos. Según el paper de pi0.5, el modelo se basa en pi0 y se entrena mediante co-entrenamiento en entornos heterogéneos para lograr generalización en el mundo real. En este caso, el checkpoint se ha entrenado sobre un dataset específico de robosuite (`yypeng666/metamdp-robosuite-franka-moving_ball-l1-clean-50hz-h50-v2`), con una tarea de agarre y elevación de una bola en movimiento a velocidad constante. El entrenamiento se realizó con una predicción de horizonte de 50 acciones a 50 Hz, y el repositorio incluye checkpoints en los pasos de actualización 1333, 2666 y 3999. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni técnicas como RLHF o DPO.

## Capacidades

- Control robótico en simulación: el modelo genera secuencias de acciones de alta frecuencia (50 Hz) para manipular un brazo Franka en un entorno robosuite, específicamente para la tarea de agarrar y levantar una bola en movimiento.
- Percepción visual: integra una entrada visual para detectar y seguir la posición de la bola, gracias a su componente de visión-lenguaje.
- Acción de horizonte fijo: predice 50 acciones a la vez, lo que permite un control predictivo de la trayectoria.
- No se conocen capacidades adicionales como tool calling, agentes o razonamiento multi-paso, ya que el modelo está especializado en la tarea robótica concreta.
- No se reporta soporte multilingüe; el modelo no está diseñado para procesamiento de texto general.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el checkpoint permite reproducir experimentos de SFT sobre pi0.5 en tareas de manipulación dinámica, sirviendo como línea base para comparar con otros algoritmos de control.
- Benchmark de control robótico en simulación: puede utilizarse como referencia para evaluar el rendimiento de políticas en la tarea de agarre de objetos en movimiento en robosuite.
- Desarrollo de políticas de control de alta frecuencia: su horizonte de 50 acciones a 50 Hz es adecuado para estudiar el control predictivo y la estabilidad en tareas dinámicas.
- Análisis de procesos de SFT: al contener checkpoints intermedios, permite analizar la evolución del entrenamiento y el efecto del fine-tuning sobre el modelo base.
- Generación de datos de entrenamiento para otros modelos: las acciones generadas pueden servir como pseudo-etiquetas para entrenar políticas más ligeras o para simulación de datos.
- Recuperación de estado de entrenamiento: útil para continuar el entrenamiento desde un punto exacto o para depurar pipelines de entrenamiento de modelos VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card indica explícitamente que no se adjunta ninguna evaluación downstream a estos checkpoints.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño del repositorio (134,2 GB) y el tipo de modelo (VLA basado en pi0.5), se espera que la inferencia requiera una GPU de alta gama con al menos 80 GB de VRAM para cargar los pesos en precisión completa, aunque no se proporciona información concreta.
- GPU recomendadas: no disponible. Por el tamaño, se recomiendan GPUs de clase A100 (80 GB) o H100 (80 GB) para inferencia completa.
- En consumer GPU: no es viable cargar el modelo completo en una GPU de consumo típica (RTX 3090, 4090) sin cuantización, y no se dispone de versiones cuantizadas.
- Opciones de despliegue: no se han documentado opciones de despliegue específicas. El modelo se distribuye en formato OpenPI, por lo que se puede usar con la librería openpi. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos. El checkpoint es específico de una tarea y no se reportan métricas comparables. Se puede mencionar que el modelo base es pi0.5, y que existen otros modelos VLA como OpenVLA o RT-2, pero no hay datos de rendimiento de este checkpoint frente a ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación downstream, por lo que no se puede garantizar el comportamiento del modelo en entornos reales o en otras tareas.
- El modelo está entrenado para una tarea muy concreta (agarre y elevación de una bola a velocidad constante) y no se espera que generalice a otras tareas de manipulación.
- No se dispone de información sobre sesgos, alucinaciones o riesgos de seguridad; el modelo no procesa lenguaje natural.
- La licencia es no disponible, lo que impide conocer las restricciones de uso comercial o de redistribución.
- El tamaño del modelo (134 GB) implica altos costes de almacenamiento y computación, y no está optimizado para despliegue en entornos con recursos limitados.
- El modelo se entrega como checkpoint de entrenamiento, no como un sistema listo para producción; se requiere integración con el entorno robosuite y el framework OpenPI.

## Enlaces

- HuggingFace: https://huggingface.co/yypeng666/metamdp-pi05-franka-moving_ball-l1-clean-50hz-h50-full-sft-v1
- Paper de pi0.5: https://arxiv.org/html/2504.16054v1 (también en https://www.pi.website/download/pi05.pdf)
- Guía de fine-tuning de pi0.5 en Franka (GitHub): https://github.com/ChuyaoFu/openpi-franka/tree/main
- Guía de pi0.5 para Franka (GitHub): https://github.com/Shenzhaolong1330/openpi-franka/blob/main/PI05_FRANKA.md
