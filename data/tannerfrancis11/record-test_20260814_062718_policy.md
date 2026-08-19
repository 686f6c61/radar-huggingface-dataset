# tannerfrancis11/record-test_20260814_062718_policy

## Resumen

Este modelo es una política de control robótico entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario tannerfrancis11 y publicado en Hugging Face bajo la licencia Apache 2.0, utilizando la librería LeRobot para su entrenamiento y despliegue. El modelo está diseñado para controlar un robot seguidor (tipo `so_follower`) equipado con una cámara frontal, y su tarea específica es "Grab the black cube" (agarrar el cubo negro).

Con 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, se trata de un modelo compacto orientado a la robótica de manipulación. Su relevancia radica en que demuestra el flujo completo de LeRobot: registro de datos teleoperados, entrenamiento de una política ACT y posterior ejecución en el robot. Sin embargo, al ser un repositorio de prueba (el nombre incluye "record-test"), no cuenta con resultados de evaluación publicados ni con una validación en entornos reales documentada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, genera un "chunk" de acciones futuras (una secuencia corta de comandos de control), lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. La política consume como entrada el estado del robot (vector de 6 dimensiones) y una imagen de cámara frontal de 480x640 píxeles, y produce como salida un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot versión 0.6.2 sobre un dataset de 30 episodios y 13.696 fotogramas a 30 FPS, correspondientes a la tarea de agarrar un cubo negro. Se utilizaron 20.000 pasos de entrenamiento con un batch size de 8, optimizador AdamW, tasa de aprendizaje de 1e-05 y semilla 1000. No se menciona el uso de técnicas como RLHF o DPO, ya que es un modelo de imitación pura a partir de demostraciones teleoperadas.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones (action chunks) para ejecutar tareas de manipulación.
- Percepción visual: procesa imágenes de cámara frontal (480x640) para guiar el comportamiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo comandos CLI como `lerobot-rollout` y `lerobot-train`.
- Tarea específica: entrenado para agarrar un cubo negro, aunque la arquitectura es generalizable a otras tareas de manipulación con datos adecuados.
- No soporta generación de texto, razonamiento simbólico, tool calling ni capacidades multilingües, al ser un modelo puramente robótico.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede ejecutar la tarea de agarrar objetos (en este caso, un cubo negro) en un robot seguidor, sirviendo como base para experimentos de aprendizaje por imitación.
- Validación de pipelines de LeRobot: útil para probar el flujo completo de registro de datos, entrenamiento y despliegue en un entorno controlado antes de escalar a tareas más complejas.
- Investigación en action chunking: permite estudiar el efecto de predecir secuencias de acciones frente a acciones individuales en la estabilidad del control.
- Prototipado rápido de políticas robóticas: al ser un modelo pequeño (51M parámetros), puede entrenarse y evaluarse rápidamente en hardware modesto, ideal para iteraciones de desarrollo.
- Benchmarking de entornos de simulación: puede utilizarse como política de referencia en simuladores robóticos para comparar métodos de aprendizaje por imitación.
- Educación y formación: sirve como ejemplo didáctico para aprender a usar LeRobot y ACT en cursos de robótica y aprendizaje automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas como tasa de éxito en tareas reales o comparativas con otros métodos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,67 millones de parámetros, la inferencia requiere muy poca memoria. Con pesos en precisión FP32 (aproximadamente 207 MB), cabría en cualquier GPU con al menos 1 GB de VRAM. En cuantización FP16, el uso sería de unos 103 MB.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, incluyendo tarjetas de gama baja como NVIDIA GTX 1650 o superiores. También es viable en CPU para inferencia, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, cabe en todas las GPUs de consumo actuales (RTX 3060, RTX 4090, etc.) sin problemas de memoria.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y ejecutan la política en el robot. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no hay datos oficiales. Dado el tamaño del modelo y la entrada de imagen, se espera una inferencia en tiempo real (por encima de 30 FPS) en GPUs modernas, pero no se puede confirmar sin mediciones.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de robótica de la misma categoría. El modelo es una instancia de ACT entrenada con LeRobot, y no se han publicado comparaciones con alternativas como Diffusion Policy, Behavior Transformers u otros métodos de aprendizaje por imitación. Se recomienda consultar la literatura de LeRobot y ACT para obtener referencias comparativas.

## Limitaciones y advertencias

- Modelo de prueba: el nombre del repositorio ("record-test") y la ausencia de evaluación indican que es un experimento preliminar, no apto para producción sin validación adicional.
- Sin resultados de evaluación: no hay métricas de éxito en tareas reales, por lo que su rendimiento efectivo es desconocido.
- Tarea específica: entrenado únicamente para "Grab the black cube"; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad de las 30 demostraciones teleoperadas; variaciones en iluminación, posición del objeto o el robot pueden degradar el comportamiento.
- Riesgo de sobreajuste: con solo 30 episodios, el modelo puede memorizar las demostraciones y fallar ante variaciones no vistas.
- Sin soporte multilingüe ni de lenguaje: no es un modelo de texto, por lo que no aplica a tareas de NLP.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento (dataset asociado) no tengan restricciones adicionales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/tannerfrancis11/record-test_20260814_062718_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/tannerfrancis11/record-test_20260814_062718
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
