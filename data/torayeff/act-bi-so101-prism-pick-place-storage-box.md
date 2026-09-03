# torayeff/act-bi-so101-prism-pick-place-storage-box

## Resumen

El modelo `torayeff/act-bi-so101-prism-pick-place-storage-box` es una política de control robótico entrenada con el método Action Chunking with Transformers (ACT), desarrollada por el usuario torayeff y publicada a través del ecosistema LeRobot de Hugging Face. Está diseñada para controlar un brazo robótico SO-101 (configuración `bi_so_follower`) en la tarea concreta de recoger un prisma cuadrado y colocarlo dentro de una caja de almacenamiento abierta. El modelo aprende por imitación a partir de 50 episodios teleoperados, procesando imágenes de tres cámaras y el estado articular del robot para predecir secuencias de acciones.

La relevancia de este modelo radica en que ejemplifica el flujo completo de entrenamiento y despliegue de políticas de manipulación con LeRobot, una librería open source de aprendizaje por refuerzo e imitación para robótica real. Con 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto, lo que lo hace accesible para laboratorios y desarrolladores que trabajan con robots de bajo coste como el SO-101. Su arquitectura transformer, basada en el paper de ACT (arXiv:2304.13705), permite predecir chunks de acciones en lugar de pasos individuales, mejorando la estabilidad del control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.680.908 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa observaciones de estado e imagenes, no texto) |
| Tipos de cuantizacion | no disponible (formato safetensors) |
| Idiomas soportados | no disponible (modelo de robotica, no linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación que utiliza un transformer con codificador y decodificador para predecir secuencias de acciones (chunks) a partir de observaciones visuales y de estado. En la implementación de LeRobot, el codificador procesa las imágenes de tres cámaras (muñeca izquierda, superior y muñeca derecha) junto con el estado del robot (12 dimensiones), y el decodificador autoregresivo genera una secuencia de acciones de 12 dimensiones que controlan las articulaciones y el gripper.

El entrenamiento se realizó sobre un dataset de 50 episodios teleoperados, con un total de 37.217 frames a 30 FPS. Se utilizó el optimizador AdamW con una tasa de aprendizaje de 1e-5, un batch size de 8 y 100.000 pasos de entrenamiento, con semilla 1000. No se aplicaron técnicas de RLHF ni DPO; el aprendizaje es puramente por imitación supervisada. La versión de LeRobot empleada fue la 0.6.1.

## Capacidades

- Control de un brazo robótico SO-101 (configuración `bi_so_follower`) para tareas de pick-and-place.
- Procesamiento de imágenes de tres cámaras (izquierda, superior y derecha) con resolución 640x480.
- Predicción de acciones de 12 dimensiones (posiciones articulares y apertura del gripper).
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- No dispone de capacidades de lenguaje, tool calling, agentes ni razonamiento multi-step.
- No es un modelo multimodal en el sentido de lenguaje-visión; su entrada es estrictamente visual y de estado.

## Casos de uso

- Automatización de tareas de recogida y colocación en almacenes: el modelo puede controlar un brazo SO-101 para recoger objetos prismáticos y depositarlos en contenedores, reduciendo la intervención manual en entornos logísticos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el rendimiento de ACT en tareas de manipulación con robots de bajo coste, comparando variaciones de hiperparámetros o arquitecturas.
- Prototipado rápido en robótica: gracias a LeRobot, el modelo puede desplegarse en un robot compatible en minutos, permitiendo validar hipótesis de control sin desarrollar software desde cero.
- Fine-tuning para nuevas tareas: a partir de este modelo preentrenado, es posible reentrenar con nuevos datos para adaptarlo a otros objetos, posiciones o configuraciones de cámara.
- Demostraciones educativas: útil en cursos de robótica y aprendizaje automático para ilustrar el ciclo completo de recolección de datos, entrenamiento y despliegue de una política.
- Integración en líneas de montaje: puede realizar tareas repetitivas de manipulación con precisión, siempre que la tarea se ajuste a la configuración de cámaras y al espacio de trabajo del SO-101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: con 51,7 millones de parámetros, el modelo ocupa aproximadamente 207 MB en FP32 y 103 MB en FP16, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, incluso una GTX 1050 Ti o superior. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, cualquier tarjeta gráfica moderna es suficiente.
- Opciones de despliegue: mediante los scripts de LeRobot (`lerobot-rollout`), que gestionan la carga del modelo y la comunicación con el robot. No aplican vLLM, llama.cpp ni Ollama, al ser un modelo de robótica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Robot | Licencia |
|---|---|---|---|---|
| torayeff/act-bi-so101-prism-pick-place-storage-box | 51.680.908 | Pick-and-place de prisma en caja | SO-101 (bi_so_follower) | apache-2.0 |
| AdityaRege/so101-pick-place-act | no disponible | Pick-and-place (tarea similar) | SO-101 | apache-2.0 |

Ambos modelos utilizan la arquitectura ACT y se entrenaron con LeRobot para el robot SO-101. No se dispone de más detalles del modelo de AdityaRege para una comparación cuantitativa. No se han encontrado otras alternativas comparables en la misma categoría.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (recoger un prisma cuadrado y colocarlo en una caja abierta) y no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuración: requiere exactamente las mismas cámaras (izquierda, superior, derecha) y la misma disposición del robot que se usaron durante el entrenamiento.
- Dataset reducido: solo 50 episodios, lo que aumenta el riesgo de sobreajuste y limita la robustez ante variaciones de iluminación, posición de objetos o distracciones.
- Sin evaluación publicada: no hay datos de éxito en pruebas reales, por lo que su rendimiento efectivo es desconocido.
- No es un modelo de lenguaje: no procesa texto ni instrucciones verbales; la tarea está fijada en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo es específico y no incluye garantías de funcionamiento en entornos de producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/torayeff/act-bi-so101-prism-pick-place-storage-box)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Dataset de entrenamiento](https://huggingface.co/datasets/torayeff/bi-so101-prism-pick-place-storage-box_20260902_220323)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
