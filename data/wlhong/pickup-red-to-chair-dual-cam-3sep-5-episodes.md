# wlhong/pickup-red-to-chair-dual-cam-3sep-5-episodes

## Resumen

El modelo `wlhong/pickup-red-to-chair-dual-cam-3sep-5-episodes` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), desarrollada por wlhong y publicada en Hugging Face como parte del ecosistema LeRobot. ACT es un método de imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que permite a un robot ejecutar movimientos más suaves y robustos a partir de demostraciones teleoperadas.

El modelo está entrenado para una tarea concreta: recoger un objeto rojo y colocarlo sobre una silla. La entrada del sistema combina el estado del robot (6 dimensiones) con imágenes de dos cámaras: una cámara superior (ugreen-top) y una cámara en la muñeca (wrist), ambas con resolución 480x640. La salida es un vector de acción de 6 dimensiones que controla el robot. El modelo tiene 51.668.614 parámetros almacenados en formato safetensors y ocupa aproximadamente 0,2 GB en el repositorio.

Este tipo de políticas es relevante para la robótica de manipulación en entornos controlados, ya que permite transferir habilidades humanas a robots mediante demostraciones. Aunque el modelo es específico para una tarea y un robot concreto, sirve como ejemplo de aplicación de ACT dentro del framework LeRobot y puede adaptarse a nuevas tareas mediante entrenamiento con datasets adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo corresponde a ACT (Action Chunking with Transformers), un método de aprendizaje por imitación presentado en el paper arxiv:2304.13705. ACT utiliza un transformer encoder-decoder que, a partir de observaciones (estado del robot e imágenes de dos cámaras), predice un fragmento de acciones (action chunk) en lugar de una única acción por paso de tiempo. Esta estrategia reduce el error acumulado y mejora la suavidad de los movimientos en comparación con políticas que predicen acciones de forma independiente.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset de demostraciones teleoperadas compuesto por 5 episodios, 2693 frames y una frecuencia de muestreo de 30 FPS. La tarea registrada es "Pick up the red object and put on chair". La configuración de entrenamiento incluye 30.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se aplicaron técnicas como RLHF o DPO, ya que se trata de un modelo de control robótico y no de un modelo de lenguaje.

## Capacidades

- Generación de acciones de control para un robot manipulador, con salidas de 6 dimensiones.
- Procesamiento multimodal: combina el estado del robot (6 valores) con imágenes de dos cámaras (ugreen-top y wrist) de 480x640 píxeles.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de modelar explícitamente la dinámica del entorno.
- Ejecución de tareas de manipulación específicas, como recoger un objeto y colocarlo sobre una silla.
- No soporta tool calling, function calling ni razonamiento de lenguaje, al no ser un modelo de lenguaje.
- No tiene capacidades de visión generales más allá de las entradas de imagen específicas para las que fue entrenado.

## Casos de uso

- Manipulación de objetos en entornos controlados: el modelo puede ejecutar la tarea de recoger un objeto rojo y dejarlo sobre una silla, lo que resulta útil en líneas de montaje o laboratorios donde se repiten movimientos de pick-and-place.
- Automatización de tareas repetitivas en robótica industrial: gracias a la predicción por chunks, el robot genera secuencias de movimiento más coherentes, reduciendo vibraciones y errores en operaciones repetitivas.
- Investigación en aprendizaje por imitación: este modelo sirve como referencia para estudiar cómo ACT se comporta con datasets pequeños (5 episodios) y cómo se puede transferir a otras tareas con pocas demostraciones.
- Prototipado rápido de políticas robóticas con LeRobot: la integración con el framework permite entrenar y desplegar políticas en robots compatibles (tipo `so_follower`) mediante comandos `lerobot-rollout` y `lerobot-train`.
- Robótica asistencial: en entornos de ayuda a personas con movilidad reducida, una política entrenada con demostraciones podría asistir en tareas de levantar y colocar objetos, aunque requeriría reentrenamiento con datos específicos del entorno.
- Educación y demostraciones técnicas: dado su tamaño reducido y su licencia Apache-2.0, es útil como ejemplo didáctico para enseñar el flujo completo de LeRobot, desde la grabación de datos hasta el despliegue de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política, por lo que no es posible comparar su rendimiento con otros modelos en tareas como éxito de ejecución, precisión o robustez.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Dado que el modelo tiene 51.668.614 parámetros y ocupa 0,2 GB en disco, es probable que sea ejecutable en GPUs de consumo, pero no se especifica un valor concreto.
- GPU recomendadas: no disponible. El entrenamiento se realizó con `--policy.device=cuda`, lo que indica que se usó una GPU, pero no se detalla el modelo exacto.
- Compatibilidad con GPUs de consumo: es plausible que una GPU con al menos 4 GB de VRAM pueda ejecutar la inferencia, dado el tamaño de los pesos, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo está diseñado para ejecutarse mediante LeRobot, usando `lerobot-rollout` con `--strategy.type=base`. También puede integrarse en el flujo de entrenamiento de LeRobot para ajustes posteriores.
- Latencia y throughput estimados: no disponibles. La información proporcionada no incluye métricas de rendimiento en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Framework | Evaluación |
|---|---|---|---|---|---|
| wlhong/pickup-red-to-chair-dual-cam-3sep-5-episodes | 51.668.614 | Recoger objeto rojo y colocar en silla | Apache-2.0 | LeRobot | No disponible |
| wlhong/act_pickup_red_23aug | no disponible | Recoger objeto rojo (similar) | no disponible | LeRobot | No disponible |

No se dispone de datos de rendimiento ni de especificaciones completas para el modelo alternativo `wlhong/act_pickup_red_23aug`, por lo que la comparativa se limita a aspectos estructurales. Ambos pertenecen a la misma familia de políticas ACT entrenadas con LeRobot y probablemente comparten arquitectura, pero no se pueden extraer conclusiones sobre su rendimiento relativo.

## Limitaciones y advertencias

- El dataset de entrenamiento es muy reducido (5 episodios, 2693 frames), lo que limita la generalización a variaciones de posición, iluminación o distracciones en el entorno.
- El modelo es específico para el robot tipo `so_follower` y para las cámaras `ugreen-top` y `wrist`. Cambiar la configuración de hardware o las cámaras requiere reentrenamiento.
- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento esperado no está validado.
- Al ser un modelo de control robótico, no genera texto ni lenguaje natural, y no puede utilizarse para tareas de procesamiento de lenguaje.
- La licencia Apache-2.0 permite uso comercial, pero la implementación depende de LeRobot y de un robot compatible, lo que puede suponer una barrera de integración.
- La tarea está limitada a la manipulación de un objeto rojo sobre una silla; el modelo no está preparado para otras tareas sin reentrenamiento.
- Riesgo de alucinación no aplica en el sentido clásico de los modelos de lenguaje, pero la política puede fallar en entornos no vistos durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wlhong/pickup-red-to-chair-dual-cam-3sep-5-episodes
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/wlhong/pickup-red-to-chair-dual-cam-3sep_20260903_223715
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
