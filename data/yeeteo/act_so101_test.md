# yeeteo/act_so101_test

## Resumen

El modelo `yeeteo/act_so101_test` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias de acciones (action chunks) en lugar de acciones individuales. Ha sido desarrollado y publicado mediante el framework LeRobot de Hugging Face, y está diseñado para controlar un brazo robótico tipo `so_follower` (SO-101) en tareas de manipulación. El modelo fue entrenado específicamente para la tarea "Grab the blue cube" (agarrar el cubo azul) a partir de datos teleoperados.

El modelo cuenta con aproximadamente 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, lo que lo convierte en una política ligera y desplegable en hardware modesto. Su relevancia radica en que representa un ejemplo práctico de cómo aplicar ACT sobre un robot comercial de bajo coste (SO-101) usando el ecosistema LeRobot, que democratiza el entrenamiento y despliegue de políticas robóticas. La licencia Apache-2.0 permite su uso comercial sin restricciones significativas.

Al estar entrenado con un dataset muy reducido (5 episodios, 1966 frames), este modelo debe considerarse principalmente como una demostración técnica o punto de partida para fine-tuning, más que como una política robusta lista para producción. No se han publicado resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), basada en Transformer con CVAE |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un Transformer con una CVAE (Conditional Variational Autoencoder) que condiciona la generación de acciones sobre la observación actual. El modelo recibe como entrada el estado del robot (6 dimensiones) y una imagen RGB de una cámara frontal (1080x1920), y produce como salida un chunk de acciones de 6 dimensiones que el robot ejecuta de forma open-loop durante un horizonte temporal corto.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset teleoperado de 5 episodios con 1966 frames a 30 FPS, grabado con un robot SO-101. La configuración de entrenamiento incluye 15.000 pasos, batch size de 2, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores al aprendizaje por imitación supervisado.

## Capacidades

- Control de brazo robótico: genera comandos de acción de 6 grados de libertad (posición y orientación del efector final) a partir de observaciones visuales y del estado articular.
- Aprendizaje por imitación: reproduce comportamientos teleoperados, específicamente la tarea de agarrar un cubo azul.
- Percepción visual: procesa imágenes RGB de alta resolución (1080x1920) de una cámara frontal.
- Ejecución de chunks de acciones: predice secuencias de acciones (action chunking), lo que reduce la frecuencia de inferencia necesaria y mejora la estabilidad del movimiento.
- Integración con LeRobot: compatible con el ecosistema de herramientas de Hugging Face para robótica (entrenamiento, rollout, visualización de datasets).
- No soporta tool calling, agentes, razonamiento multistep, ni capacidades multilingües, al ser un modelo puramente motor.

## Casos de uso

- Automatización de tareas de pick-and-place: el modelo puede controlar un brazo SO-101 para agarrar objetos específicos (en este caso, un cubo azul) en entornos controlados, útil en líneas de montaje o laboratorios de investigación.
- Prototipado rápido de políticas robóticas: al ser ligero (51,7M parámetros) y entrenable con pocos datos, sirve como base para validar el flujo de trabajo de LeRobot antes de escalar a tareas más complejas.
- Investigación en aprendizaje por imitación: permite estudiar el comportamiento de ACT con datasets pequeños y comparar variantes del método sobre hardware real de bajo coste.
- Educación y formación en robótica: los estudiantes pueden desplegar esta política en un SO-101 para comprender el ciclo completo de recogida de datos, entrenamiento y evaluación.
- Benchmarking de hardware robótico: sirve para medir el rendimiento de diferentes configuraciones de robot y cámara, ya que las entradas son estándar (estado de 6D + imagen frontal).
- Demostraciones en ferias o museos: un robot que ejecuta la tarea de agarrar un cubo azul de forma autónoma es una demo atractiva y de bajo riesgo para entornos no críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No hay datos de éxito en tareas, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7M parámetros con entradas de imagen, la inferencia requiere aproximadamente 1-2 GB de VRAM en FP32. Con cuantización (no disponible oficialmente) podría reducirse aún más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 3060, RTX 4090, A100, H100. El modelo es compatible con CUDA.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como la RTX 3060 o superiores. Incluso podría ejecutarse en CPU para pruebas lentas, aunque no es recomendable.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar la política en el robot. No hay soporte nativo para vLLM, Ollama o TGI, al ser un modelo de robótica, no de lenguaje.
- Latencia y throughput: no hay datos publicados. Dado el tamaño del modelo y el action chunking, se espera una latencia de inferencia inferior a 50 ms en GPU moderna, lo que permite control en tiempo real a 30 FPS.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo es una instancia concreta de ACT entrenada con LeRobot, y no se han encontrado modelos comparables con el mismo dataset o tarea en los resultados de búsqueda. Se puede mencionar que ACT es una alternativa a otros métodos de imitación como Diffusion Policy o Behavior Cloning simple, pero no hay datos de rendimiento comparativo disponibles para este modelo específico.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 5 episodios y 1966 frames, lo que limita la generalización a variaciones en la posición del objeto, iluminación o configuración del robot.
- Sin evaluación en robot real: no se han publicado resultados de éxito, por lo que el rendimiento real es desconocido.
- Tarea única: el modelo solo ha sido entrenado para "Grab the blue cube", no es multitarea ni generaliza a otros objetos o comandos.
- Dependencia de la cámara frontal: la política requiere la cámara frontal con la misma posición y calibración que durante el entrenamiento; cambios en el ángulo o la lente degradarán el rendimiento.
- Riesgo de sobreajuste: con tan pocos episodios, el modelo probablemente memoriza las trayectorias específicas en lugar de aprender una política generalizable.
- Sin soporte para otros robots: está entrenado específicamente para el robot `so_follower` (SO-101); no es transferible directamente a otros brazos sin reentrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías de rendimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yeeteo/act_so101_test
- Dataset de entrenamiento: https://huggingface.co/datasets/yeeteo/record-test_20260819_190450
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yeeteo/record-test_20260819_190450
