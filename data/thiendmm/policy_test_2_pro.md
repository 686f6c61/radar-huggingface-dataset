# thiendmm/policy_test_2_pro

## Resumen

`thiendmm/policy_test_2_pro` es un policy de control robótico basado en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Desarrollado por el usuario thiendmm usando la librería LeRobot de Hugging Face, el modelo está entrenado para ejecutar la tarea "put the red brick in a bowl" sobre un robot tipo `so_follower` con dos cámaras (superior y de muñeca). Con 51,7 millones de parámetros y un tamaño de repo de 0,2 GB, es un modelo ligero pensado para inferencia en tiempo real en robots de bajo coste.

El modelo se publicó el 31 de agosto de 2026 bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Su relevancia radica en ser un ejemplo práctico de cómo LeRobot permite entrenar y desplegar policies de manipulación robótica con pocos datos (50 episodios) y hardware asequible. Al estar integrado en el ecosistema LeRobot, puede ejecutarse directamente con comandos como `lerobot-rollout` y `lerobot-train`, lo que facilita su reproducción y adaptación a otras tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un policy de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), descrita en el paper [arxiv:2304.13705](https://huggingface.co/papers/2304.13705). ACT es un método de aprendizaje por imitación que, en lugar de predecir una sola acción por paso, predice un chunk de acciones futuras (típicamente de 10 a 100 pasos). Esto reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un encoder de visión (para procesar las imágenes de las cámaras) con un transformer que condiciona la generación de acciones sobre el estado observado y las características visuales.

El entrenamiento se realizó con el dataset `thiendmm/so101_dataset_2_20260831_142815`, que contiene 50 episodios teleoperados, 22.435 frames a 30 FPS, para la tarea "put the red brick in a bowl". La configuración de entrenamiento incluyó 70.000 pasos, batch size 8, optimizador AdamW con learning rate 1e-5 y seed 1000, utilizando LeRobot versión 0.6.2. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; es un entrenamiento de imitación puro sobre datos teleoperados.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea específica de colocar un ladrillo rojo en un cuenco, basándose en observaciones visuales y de estado.
- Entrada multimodal: procesa dos flujos de imagen (cámara superior y cámara de muñeca, cada una de 480x640x3) junto con un vector de estado de 6 dimensiones (posición y orientación del efector final).
- Salida de acciones continuas: genera un vector de acción de 6 dimensiones (posición y orientación del efector final) en cada paso.
- Aprendizaje por imitación: capacidad de reproducir comportamientos aprendidos de demostraciones humanas teleoperadas.
- Integración con LeRobot: compatible con el ecosistema LeRobot para despliegue en robots reales y simulación.
- No tiene capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico; es exclusivamente un policy de control de bajo nivel.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede integrarse en líneas de montaje para colocar objetos en posiciones definidas, gracias a su entrenamiento en una tarea de manipulación concreta.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT entre tareas o robots, ya que su tamaño reducido permite iteraciones rápidas.
- Prototipado de robots de bajo coste: al requerir solo 51,7 M de parámetros, puede ejecutarse en hardware modesto (Raspberry Pi con acelerador, GPU de gama baja), lo que facilita la experimentación en laboratorios con presupuesto limitado.
- Benchmarking de métodos de control: puede utilizarse como baseline para comparar nuevas arquitecturas de imitación learning en la misma tarea y dataset.
- Educación en robótica: adecuado para cursos que enseñan entrenamiento y despliegue de policies robóticos con LeRobot, gracias a su documentación y comandos CLI claros.
- Adaptación a tareas similares: mediante fine-tuning con pocos episodios adicionales, puede adaptarse a variantes de la tarea (diferentes posiciones de objetos, iluminación, etc.), dado que ACT es conocido por su eficiencia en entornos de pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "No evaluation results have been provided for this policy yet". No hay datos de tasa de éxito en robot real ni en simulación.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 51,7 M de parámetros, requiere menos de 1 GB de VRAM en FP32; con cuantización ligera podría ejecutarse en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, Jetson Nano, RTX 2060) es suficiente. No requiere GPUs de alta gama.
- Compatibilidad con consumer GPUs: sí, cabe en cualquier GPU de consumo actual e incluso en placas embebidas como Jetson.
- Opciones de despliegue: a través de LeRobot con `lerobot-rollout` para robots reales; también puede usarse con simuladores (por ejemplo, MuJoCo) si se configura el entorno.
- Latencia y throughput: no hay datos publicados, pero por el tamaño del modelo se espera una latencia de inferencia inferior a 10 ms en GPU y de 50-100 ms en CPU, suficiente para control en tiempo real a 30 FPS.

## Comparativa con modelos similares

No se dispone de información sobre otros policies de robótica comparables en el mismo repositorio o con las mismas características. El modelo es específico de una tarea y robot concreto, y no hay benchmarks públicos que permitan una comparación objetiva. Se puede considerar comparable a otros policies ACT entrenados con LeRobot, pero sin datos cuantitativos no es posible establecer una comparativa rigurosa. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al estar entrenado con datos de un único operador y entorno, puede no generalizar a otros estilos de teleoperación o configuraciones de cámara.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje; sin embargo, el policy puede generar acciones incorrectas si las condiciones del entorno difieren de las de entrenamiento (por ejemplo, cambios de iluminación u objetos distracción).
- Limitaciones de contexto o idioma: no procesa lenguaje; su "contexto" es la ventana de observaciones visuales y de estado, que está limitada a la secuencia de chunks de acción (no se especifica el tamaño del chunk en la información proporcionada).
- Restricciones de licencia: licencia Apache 2.0, permite uso comercial y modificación sin restricciones, siempre que se mantenga el aviso de copyright.
- Caveat para producción: no hay evaluación publicada, por lo que el rendimiento real en el robot no está verificado. Se recomienda validar exhaustivamente antes de cualquier despliegue en entornos no controlados. Además, el dataset de entrenamiento es pequeño (50 episodios), lo que puede limitar la robustez frente a variaciones del entorno.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/thiendmm/policy_test_2_pro)
- [Paper ACT (arxiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Dataset de entrenamiento](https://huggingface.co/datasets/thiendmm/so101_dataset_2_20260831_142815)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Cheat-sheet de CLI de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Espacio para visualizar el dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=thiendmm/so101_dataset_2_20260831_142815)
