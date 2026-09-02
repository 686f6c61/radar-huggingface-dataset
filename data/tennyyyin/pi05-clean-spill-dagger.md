# tennyyyin/pi05-clean-spill-dagger

## Resumen

Este repositorio contiene cuatro checkpoints del modelo pi0.5, un vision-language-action (VLA) desarrollado por Physical Intelligence, especializados en la tarea bimanual **BimanualCleanUpSpill**: recoger un vaso volcado, ponerlo en posición vertical y limpiar el líquido derramado con una toalla. Los checkpoints son el resultado de un proceso de fine-tuning con DAgger (Dataset Aggregation) sobre una política base entrenada con demostraciones humanas, y están pensados para su uso exclusivo en inferencia con el framework openpi.

El modelo se basa en la arquitectura pi0.5, que extiende pi0 mediante co-entrenamiento en datos heterogéneos para lograr generalización en entornos abiertos. Cada checkpoint incluye los parámetros del modelo y las estadísticas de normalización necesarias para la inferencia, pero no el estado de entrenamiento, por lo que no es posible reanudar el entrenamiento desde ellos. El repositorio está orientado a la robótica de manipulación bimanual y requiere una GPU NVIDIA con al menos 12 GB de VRAM para servir la política.

La relevancia de este modelo radica en que demuestra la aplicación práctica de DAgger para mejorar políticas VLA en tareas de manipulación física, y proporciona checkpoints listos para desplegar en un robot real a través de un servidor websocket. Es un recurso útil para investigadores y desarrolladores que trabajan en robótica de manipulación y necesitan una política de limpieza de derrames ya entrenada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (VLA basado en transformer con flujo de coincidencia, derivado de pi0) |
| Parametros totales | no disponible (los pesos ocupan ~12 GB, lo que sugiere varios miles de millones de parámetros, pero no se indica el número exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada multimodal: 3 imágenes de 224x224 y vector de estado de 16 dimensiones; el prompt es una frase corta) |
| Tipos de cuantizacion | no disponible (solo se proporcionan pesos completos en formato `params/`) |
| Idiomas soportados | no disponible (el prompt de entrenamiento está en inglés; no se documenta soporte multilingüe) |
| Licencia | other (no especificada en el repositorio) |
| Formato de pesos | `params/` + `assets/` (formato nativo de openpi, basado en JAX) |

## Arquitectura y entrenamiento

pi0.5 es un modelo vision-language-action que extiende pi0 mediante co-entrenamiento en una mezcla heterogénea de datos, lo que le permite generalizar a entornos y tareas no vistas durante el entrenamiento. La arquitectura concreta no se detalla en el repositorio, pero se sabe que utiliza un transformer con flujo de coincidencia (flow matching) para generar acciones, y que el checkpoint base comparte la configuración `Pi0Config(pi05=True, action_horizon=16)`.

El entrenamiento de estos checkpoints sigue un esquema de dos fases. Primero, una política base (`base_pi05_clean_spill_v2_3999`) se entrena con demostraciones humanas durante 3.999 pasos. Después, se aplican dos rondas de DAgger: la primera (`r1_1000`) con 9 tomas sobre 5 anclajes heredados, mezcladas 50/50 con demostraciones; la segunda (`r2_1000`) con 20 tomas (las 9 anteriores más 11 sobre anclajes con distractores), también en mezcla 50/50. Existe un cuarto checkpoint (`r2_8gpu_250`) entrenado con 8 GPUs y batch 128 durante solo 250 pasos, que se incluye como comparación temprana y no debe considerarse un modelo final.

La observación del modelo consiste en tres imágenes RGB de 224x224 (cámara base, muñeca izquierda y muñeca derecha) y un vector de estado de 16 dimensiones (14 articulaciones + 2 garras). Las acciones de salida son poses cartesianas absolutas de 20 dimensiones (posición 3D, rotación 6D para cada brazo, y apertura de garras), con un horizonte de 16 pasos a 10 Hz (1.6 segundos de movimiento).

## Capacidades

- Manipulación bimanual: controla dos brazos robóticos de forma coordinada para tareas que requieren ambas manos, como recoger un vaso y limpiar un derrame.
- Seguimiento de instrucciones en lenguaje natural: el modelo responde al prompt fijo "pick up the knocked over cup, set it upright, and wipe up the spilled liquid with a towel".
- Percepción visual multi-cámara: integra tres cámaras (base, muñeca izquierda y muñeca derecha) para razonar sobre la escena y las posiciones de los brazos.
- Control en espacio cartesiano: genera acciones absolutas en el espacio de tarea, lo que facilita la integración con controladores de bajo nivel.
- Inferencia en tiempo real: tras una compilación inicial de ~30 segundos, cada llamada de inferencia tarda entre 150 y 250 ms, adecuado para control a 10 Hz.
- Despliegue remoto: el servidor de políticas expone un websocket, permitiendo que el robot se comunique con el modelo sin necesidad de ejecutar JAX en el propio robot.

## Casos de uso

- Limpieza autónoma de derrames en entornos domésticos: el modelo puede controlar un robot bimanual para recoger un vaso volcado y limpiar el líquido con una toalla, una tarea común en cocinas o comedores. Su entrenamiento con DAgger mejora la robustez frente a variaciones en la posición del vaso y la toalla.
- Investigación en aprendizaje por imitación: los checkpoints permiten estudiar el efecto de DAgger en políticas VLA, comparando la política base con las versiones fine-tuneadas (r1 y r2) para analizar la mejora en el rendimiento.
- Desarrollo de sistemas de manipulación bimanual: sirve como punto de partida para fine-tuning en tareas similares de limpieza o manipulación de objetos, gracias a su arquitectura pi0.5 y su capacidad de generalización.
- Evaluación de políticas VLA en robots reales: el servidor websocket y el cliente Python facilitan la integración en plataformas robóticas existentes, permitiendo probar la política en hardware real con mínima configuración.
- Benchmarking de inferencia en GPU: con un tamaño de ~12 GB y una latencia de 150-250 ms por llamada, es útil para medir el rendimiento de diferentes GPUs en cargas de trabajo VLA.
- Entrenamiento de políticas con DAgger: los checkpoints r1 y r2 pueden servir como referencia para implementar y validar nuevos algoritmos de agregación de datasets en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de éxito en la tarea, ni comparaciones con otros modelos. El paper de pi0.5 (arXiv:2504.16054) reporta resultados generales del modelo base, pero no se dispone de ellos en esta ficha.

## Requisitos de hardware

- VRAM estimada: al menos 12 GB para los pesos del modelo, más memoria adicional para activaciones y buffers. Se recomienda una GPU con 16-24 GB de VRAM para inferencia cómoda.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). El README advierte que la política ocupa ~12 GB de parámetros, por lo que una GPU con menos de 16 GB puede dar problemas de OOM.
- Compatibilidad con GPUs de consumo: sí, una RTX 3090 o 4090 puede servir el modelo, siempre que tenga al menos 16 GB de VRAM.
- Opciones de despliegue: el repositorio proporciona un script `serve_policy.py` que levanta un servidor websocket. También se puede usar el cliente Python `openpi-client` para comunicarse desde el robot. No se mencionan vLLM, llama.cpp ni Ollama, ya que el modelo está pensado para JAX/openpi.
- Latencia y throughput: la primera inferencia tarda ~30 segundos en compilar; después, cada llamada tarda entre 150 y 250 ms, lo que permite operar a 10 Hz (el horizonte de acción es de 1.6 segundos).

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos. El modelo base pi0.5 (Physical Intelligence) es el referente, pero no se tienen datos de rendimiento específicos de estos checkpoints frente a alternativas como OpenVLA o RT-2. Se recomienda consultar el paper de pi0.5 para comparaciones a nivel de arquitectura y generalización.

## Limitaciones y advertencias

- El checkpoint `r2_8gpu_250` está apenas entrenado (250 pasos) y se incluye solo como comparación temprana; no debe usarse en producción.
- Los checkpoints son solo para inferencia: no incluyen `train_state/`, por lo que no se puede reanudar el entrenamiento desde ellos.
- El prompt está fijo en inglés y no se documenta soporte para otros idiomas.
- La política está especializada en la tarea de limpieza de derrames; no es un modelo generalista para otras tareas de manipulación.
- El repositorio no especifica la licencia exacta (campo "other"), lo que puede limitar su uso comercial. Se debe contactar al autor para aclarar los términos.
- El tamaño del repositorio en HuggingFace es de 12.4 GB, mientras que el README documenta cuatro checkpoints de ~12 GB cada uno. Esto sugiere que solo uno de los checkpoints está realmente alojado, o que el tamaño listado no refleja el contenido completo. Se recomienda verificar el contenido antes de descargar.
- La inferencia requiere JAX y openpi, lo que puede complicar el despliegue en entornos sin soporte CUDA.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un modelo de control robótico, el riesgo principal es la ejecución de acciones incorrectas en el mundo físico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tennyyyin/pi05-clean-spill-dagger
- Fork de openpi con las configuraciones de clean-spill: https://github.com/tenny-yinyijun/openpi
- Paper de pi0.5 (arXiv): https://arxiv.org/abs/2504.16054
- Blog de Physical Intelligence sobre pi0.5: https://www.pi.website/blog/pi05
- PDF del paper: https://www.pi.website/download/pi05.pdf
- Checkpoint base pi0.5 en HuggingFace (referencia): https://huggingface.co/lerobot/pi05_base
