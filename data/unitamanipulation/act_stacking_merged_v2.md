# UNITAmanipulation/act_stacking_merged_v2

## Resumen

El modelo `act_stacking_merged_v2` es una política de control robótico basada en Action Chunking with Transformers (ACT), desarrollada por el usuario UNITAmanipulation y entrenada con el framework LeRobot de Hugging Face. ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación. Este modelo concreto está especializado en apilar bloques, utilizando un robot tipo `so_follower` con dos cámaras (superior y muñeca) y un vector de estado de 6 dimensiones.

Con 51,7 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en hardware modesto. Se entrenó sobre 125 episodios teleoperados (104.489 fotogramas a 30 FPS) que combinan tres variantes de la tarea de apilado. Su relevancia radica en demostrar cómo un transformer ligero puede aprender manipulaciones precisas a partir de datos de demostración, siendo un ejemplo práctico del ecosistema LeRobot para robótica de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa observaciones de estado e imágenes, sin contexto de texto) |
| Tipos de cuantizacion | No disponible (pesos en precisión completa, safetensors) |
| Idiomas soportados | No aplica (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) emplea un transformer encoder-decoder que recibe como entrada el estado del robot (6 dimensiones) y dos imágenes RGB de 240x320 píxeles (cámara superior y cámara de muñeca). El encoder procesa las observaciones visuales y de estado, mientras que el decoder genera un "chunk" de acciones futuras de forma autoregresiva. Este diseño reduce el error de acumulación típico de las políticas que predicen un solo paso.

El entrenamiento se realizó mediante aprendizaje por imitación supervisado sobre el dataset `UNITAmanipulation/stacking_block_merged_v2`, que contiene 125 episodios teleoperados (104.489 fotogramas a 30 FPS) de tres tareas de apilado: `satcking_block2`, `satcking_block_wine` y `stacking_block`. Se usaron 30.000 pasos de entrenamiento con batch size 16, optimizador AdamW, learning rate 1e-05 y semilla 1000, bajo la versión 0.6.2 de LeRobot. No se aplicaron técnicas de RLHF ni DPO; el modelo se basa únicamente en comportamiento clonado.

## Capacidades

- Control de robot para manipulación: genera acciones de 6 dimensiones (probablemente posiciones articulares o velocidades) para el robot `so_follower`.
- Percepción multimodal: integra dos cámaras RGB (superior y muñeca) junto con el estado propioceptivo del robot.
- Ejecución de tareas de apilado: especializado en apilar bloques, incluyendo variantes con objetos adicionales (p. ej. `satcking_block_wine`).
- Predicción por chunks: emite secuencias de acciones (chunking) que mejoran la suavidad y robustez del movimiento.
- Inferencia en tiempo real: al ser un modelo pequeño, puede ejecutarse a frecuencias altas (30 FPS o más) en GPUs convencionales.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en líneas de montaje donde se requiere apilar piezas de forma repetitiva, gracias a su capacidad de percibir el estado del robot y las cámaras.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del chunking en la estabilidad de políticas robóticas, ya que su arquitectura ACT es fácilmente modificable.
- Prototipado de soluciones robóticas de bajo coste: al ser ligero y entrenado con LeRobot, puede desplegarse en robots de bajo presupuesto (p. ej. SO-100, SO-101) para validar conceptos de automatización.
- Benchmark de manipulación en laboratorio: permite comparar el rendimiento de distintas políticas de apilado bajo las mismas condiciones de hardware y dataset.
- Educación en robótica y aprendizaje automático: el modelo y su dataset son accesibles para que estudiantes implementen y evalúen técnicas de imitación en un entorno real.
- Transferencia a tareas similares: con un fine-tuning adicional sobre nuevos datos, puede adaptarse a otras tareas de manipulación que requieran coordinación visomotora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación del robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de éxito ni comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tener 51,7 millones de parámetros, el modelo en float32 ocupa ~207 MB, en float16 ~104 MB y en int8 ~52 MB. La inferencia requiere menos de 1 GB de VRAM, por lo que cabe en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej. NVIDIA GTX 1650, RTX 3060, RTX 4090). También puede ejecutarse en CPU, aunque con menor velocidad.
- Compatibilidad con consumer GPU: sí, es perfectamente viable en GPUs de gama media y baja.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que soporta inferencia mediante `lerobot-rollout`. También puede exportarse a otros formatos (ONNX, TensorRT) si se requiere optimización.
- Latencia y throughput: no hay mediciones oficiales, pero dada su pequeña escala, se espera una latencia inferior a 10 ms por paso en GPU y capacidad para operar a 30 FPS en tiempo real.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en el mismo repositorio o en la búsqueda web. Existen otros modelos de ACT en Hugging Face (p. ej. `altmtls1108/act_box_stacking_merged_v2`) con características similares, pero no se han publicado métricas de rendimiento que permitan una comparación objetiva. Se recomienda consultar la documentación de LeRobot para obtener referencias genéricas de ACT.

## Limitaciones y advertencias

- Sesgos y generalización: el modelo está entrenado exclusivamente con datos de un único robot y un entorno específico; puede fallar ante cambios de iluminación, posiciones de objetos o variaciones en el hardware.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la política puede producir acciones erróneas si las observaciones difieren de las del entrenamiento.
- Limitaciones de contexto: al ser un modelo de control, no maneja lenguaje natural ni instrucciones de alto nivel; solo ejecuta la tarea aprendida.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero se debe atribuir el origen y mantener el aviso de licencia.
- Dependencia del dataset: el éxito depende de la calidad y diversidad de las demostraciones teleoperadas; el dataset contiene 125 episodios, lo que puede ser insuficiente para tareas muy variadas.
- Sin evaluación publicada: no hay garantía de rendimiento en el robot real; se recomienda validar en condiciones controladas antes de usarlo en producción.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/UNITAmanipulation/act_stacking_merged_v2)
- [Dataset de entrenamiento](https://huggingface.co/datasets/UNITAmanipulation/stacking_block_merged_v2)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
