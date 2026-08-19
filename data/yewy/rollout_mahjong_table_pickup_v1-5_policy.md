# Yewy/rollout_mahjong_table_pickup_v1.5_policy

## Resumen

El modelo `Yewy/rollout_mahjong_table_pickup_v1.5_policy` es una política robótica de imitación basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Su objetivo es que un brazo robótico recoja una ficha de mahjong de una mesa a partir de observaciones visuales y de estado. El modelo fue desarrollado por el usuario Yewy y está publicado bajo licencia Apache 2.0, lo que permite su uso y modificación sin restricciones comerciales.

Con 51,7 millones de parámetros, esta política consume una imagen de cámara de muñeca de 224x224 píxeles y un vector de estado de 6 dimensiones, y produce acciones de 6 dimensiones (posición y orientación del efector final). El entrenamiento se realizó sobre un dataset teleoperado de 151 episodios y 79.152 fotogramas a 30 FPS, con 100.000 pasos de optimización. Es un modelo especializado en una tarea concreta de manipulación, no un modelo de propósito general, y su relevancia radica en demostrar el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - Transformer con codificador de vision y estado |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robotica, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que predice secuencias de acciones (chunks) en lugar de pasos individuales. La arquitectura combina un codificador de imagenes (para la camara de muñeca) con un codificador de estado, y un decodificador transformer que genera acciones futuras. Esta aproximacion reduce el error de acumulacion y mejora la estabilidad del control en tareas de manipulacion.

El entrenamiento se realizo con el framework LeRobot (version 0.6.1) sobre el dataset `Yewy/mahjong_table_pickup_224`, que contiene 151 episodios teleoperados de la tarea "recoger la ficha de mahjong de la mesa". Se usaron 100.000 pasos de entrenamiento con batch size 96, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado de imitacion.

## Capacidades

- Control robotico de manipulacion: genera comandos de posicion y orientacion del efector final (6 dimensiones) para recoger objetos.
- Percepcion visual: procesa imagenes de una camara de muñeca de 224x224 píxeles para localizar y manipular la ficha de mahjong.
- Aprendizaje por imitacion: reproduce comportamientos teleoperados con alta fidelidad en la tarea especifica entrenada.
- Ejecucion en tiempo real: al ser un modelo compacto (51M parametros), puede ejecutarse en bucle de control a 30 FPS.
- Integracion con LeRobot: compatible con el ecosistema de LeRobot para despliegue en robots reales y simulacion.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que no es un modelo de lenguaje.

## Casos de uso

- Automatizacion de tareas de recogida en entornos industriales: el modelo puede integrarse en un brazo robotico para recoger piezas pequeñas de una superficie, como fichas, componentes electronicos o piezas de ensamblaje, reduciendo la intervencion manual.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar la transferencia de politicas ACT entre tareas o para comparar metodos de entrenamiento con LeRobot.
- Prototipado rapido de celdas robotizadas: al estar publicado en Hugging Face, un desarrollador puede descargar el modelo y desplegarlo en su propio robot con el comando `lerobot-rollout`, acelerando la validacion de conceptos.
- Educacion en robotica: util como ejemplo didactico de entrenamiento de politicas de manipulacion con datos teleoperados, ya que el dataset y el codigo de entrenamiento estan disponibles.
- Benchmarking de algoritmos de imitacion: permite comparar el rendimiento de ACT frente a otros metodos (como Diffusion Policy) en una tarea estandarizada de recogida.
- Desarrollo de sistemas de recogida selectiva: combinado con un sistema de vision adicional, podria adaptarse para clasificar y recoger objetos especificos en entornos domesticos o de logistica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan metricas de exito, tasas de acierto ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero al tratarse de un modelo de 51M parametros con entrada de imagen 224x224, la inferencia requiere menos de 2 GB de VRAM en precision FP32 (estimacion razonable, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060) es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8-12 GB (RTX 3080, RTX 3090, A100) segun las practicas habituales de LeRobot.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de gama media y baja.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) para robots reales. Tambien puede ejecutarse en simulacion con entornos compatibles con LeRobot.
- Latencia y throughput: no se proporcionan datos, pero por el tamano del modelo se espera una latencia de inferencia inferior a 10 ms en GPU moderna, permitiendo control a 30 FPS.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria. Existen versiones anteriores del mismo autor (`rollout_mahjong_table_pickup_finetune_v1_policy` y `rollout_mahjong_table_pickup_finetune_v2_policy`) que probablemente comparten arquitectura y dataset, pero no se han publicado metricas comparativas. En el ecosistema LeRobot hay otras politicas ACT entrenadas para tareas similares, pero no se dispone de informacion suficiente para una comparacion rigurosa.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo ha sido entrenado para la tarea de recoger una ficha de mahjong de una mesa; no generaliza a otros objetos, posiciones o entornos sin reentrenamiento.
- Sin evaluacion publicada: no hay resultados de exito en robot real, por lo que su rendimiento efectivo es desconocido.
- Dependencia de la configuracion del robot: las observaciones de estado (6 dimensiones) y la camara de muñeca deben coincidir exactamente con la configuracion usada en el entrenamiento; cambios en la cinematica o en la camara degradaran el rendimiento.
- Sesgos del dataset: los datos teleoperados pueden contener sesgos del operador (por ejemplo, trayectorias suboptimas) que el modelo aprendera.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje, pero puede generar acciones incorrectas si la entrada visual difiere del dominio de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias; el usuario es responsable de validar su seguridad en aplicaciones reales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Yewy/rollout_mahjong_table_pickup_v1.5_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Yewy/mahjong_table_pickup_224
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Yewy/mahjong_table_pickup_224
