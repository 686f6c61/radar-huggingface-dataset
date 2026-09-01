# yuvalgot/act_towel_fold1_aug_20260901

## Resumen

El modelo `yuvalgot/act_towel_fold1_aug_20260901` es una política de control robótico entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. Ha sido desarrollado por Yuval Gottlieb y publicado en Hugging Face bajo la licencia Apache 2.0, utilizando el framework LeRobot. El modelo está especializado en la tarea de plegar una toalla con un robot tipo `so_follower`, a partir de datos teleoperados.

Con 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto diseñado para ejecutarse en tiempo real en robots físicos. Su relevancia radica en que demuestra la aplicación práctica de ACT en una tarea de manipulación doméstica, con un pipeline completo de recolección de datos, entrenamiento y despliegue documentado en la comunidad de LeRobot. El modelo consume observaciones de estado (6 dimensiones) e imágenes de una cámara (240x320) y produce acciones de 6 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con encoder de visión |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de control robótico) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de robótica, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un encoder de visión basado en ResNet para procesar imágenes de la cámara, junto con un transformer que genera secuencias de acciones futuras. A diferencia de los métodos que predicen una sola acción por paso, ACT predice un chunk de acciones, lo que reduce la acumulación de errores y mejora la estabilidad del control. El modelo fue entrenado con el framework LeRobot (versión 0.6.2) durante 100.000 pasos, con un batch size de 8, optimizador AdamW y una tasa de aprendizaje de 1e-05, usando una semilla fija de 1000.

El dataset de entrenamiento, `yuvalgot/towel_fold1_aug_2108_20260821_115238`, contiene 41 episodios teleoperados con 30.627 frames a 30 FPS, todos etiquetados con la tarea "fold the towel". Las observaciones incluyen el estado del robot (6 dimensiones) y una imagen de la cámara de la mano (3 canales, 240x320). No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores al entrenamiento supervisado.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad (posición y orientación) para el robot `so_follower`.
- Percepción visual: procesa imágenes de una cámara montada en la mano del robot para guiar la tarea.
- Aprendizaje por imitación: reproduce comportamientos teleoperados, en este caso el plegado de una toalla.
- Predicción de secuencias de acciones: genera chunks de acciones futuras, lo que permite movimientos suaves y coordinados.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo scripts de rollout y entrenamiento.
- No tiene capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico; es exclusivamente un modelo de control motor.

## Casos de uso

- Automatización de tareas domésticas: el modelo puede integrarse en robots de asistencia para plegar ropa, reduciendo la carga de trabajo en entornos domésticos o de lavandería industrial.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre diferentes configuraciones de robots o variaciones de la tarea.
- Desarrollo de robots colaborativos: puede desplegarse en líneas de producción donde se requiera manipulación textil, como el plegado de prendas en fábricas.
- Benchmark de control robótico: al estar publicado con un dataset asociado, permite comparar el rendimiento de ACT frente a otros métodos de imitación en una tarea estandarizada.
- Prototipado rápido de políticas: gracias a su tamaño reducido y la integración con LeRobot, es adecuado para validar algoritmos de control en simuladores o robots reales de bajo coste.
- Educación en robótica: puede utilizarse en cursos de robótica y aprendizaje automático para demostrar el flujo completo de recolección de datos, entrenamiento y despliegue de una política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas de éxito, tasas de acierto ni comparaciones con otros métodos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- Dado el tamaño de 51,67 millones de parámetros y la entrada de imagen de 240x320, el modelo es ligero y puede ejecutarse en GPUs de consumo como una NVIDIA RTX 3060 o superior, aunque no hay datos oficiales de VRAM.
- Para el despliegue en robot real, se requiere el hardware del robot `so_follower` y una cámara compatible con OpenCV.
- El framework LeRobot soporta inferencia en CPU y GPU, pero para un control en tiempo real se recomienda GPU con CUDA.
- No se dispone de datos de latencia o throughput; el rendimiento dependerá del hardware y de la frecuencia de control del robot.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos en la información proporcionada. ACT es un método conocido frente a alternativas como Diffusion Policy o RT-1, pero no hay datos concretos de este modelo específico frente a ellos. Se recomienda consultar el paper original de ACT (arxiv:2304.13705) para comparaciones metodológicas generales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de plegar una toalla con un robot `so_follower`; no generaliza a otras tareas u objetos sin reentrenamiento.
- El dataset de entrenamiento es pequeño (41 episodios), lo que puede limitar la robustez ante variaciones de iluminación, posición de la toalla o perturbaciones externas.
- No se han evaluado formalmente los riesgos de seguridad en entornos no controlados; el despliegue en robots físicos requiere supervisión humana y medidas de seguridad.
- Al ser un modelo de imitación, puede reproducir sesgos presentes en los datos teleoperados, como movimientos subóptimos o dependencia de la configuración inicial.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y no incluye resultados de evaluación que avalen su fiabilidad en producción.
- No se proporcionan pesos cuantizados ni formatos alternativos; solo safetensors, lo que puede limitar su uso en plataformas embebidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuvalgot/act_towel_fold1_aug_20260901
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/yuvalgot/towel_fold1_aug_2108_20260821_115238
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
