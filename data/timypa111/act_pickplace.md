# timypa111/act_pickplace

## Resumen

El modelo `timypa111/act_pickplace` es una política de robótica basada en el algoritmo ACT (Action Chunking with Transformers), entrenada mediante aprendizaje por imitación con el framework LeRobot de Hugging Face. El objetivo del modelo es controlar un brazo robótico SO-101 para realizar una tarea específica de recogida y colocación: mover una pieza de lego rosa a una caja transparente. Este tipo de modelos convierte observaciones visuales y del estado del robot en secuencias de acciones, lo que permite automatizar tareas manipulativas en entornos controlados.

El modelo fue desarrollado por el usuario timypa111 y entrenado sobre el dataset `lerobot/svla_so101_pickplace`, que contiene 50 episodios teleoperados. Con aproximadamente 51,7 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en hardware de gama media. Su relevancia radica en que demuestra cómo el aprendizaje por imitación con transformers puede transferir habilidades manipulativas a robots físicos de bajo coste, un área de creciente interés en la robótica open source.

La arquitectura ACT combina un codificador visual con un transformer que predice "chunks" de acciones futuras, en lugar de acciones paso a paso. Esta característica mejora la estabilidad del movimiento y reduce la acumulación de errores durante la ejecución. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso y modificación tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales. La arquitectura se compone de un codificador visual basado en ResNet que procesa las imágenes de las cámaras, junto con un transformer que modela la relación entre las observaciones y las acciones futuras. El modelo consume dos vistas de cámara (superior y lateral) con resolución de 480x640 píxeles, además del estado del robot (posición de las articulaciones, 6 dimensiones).

El entrenamiento se realizó con el framework LeRobot versión 0.6.1, utilizando el dataset `lerobot/svla_so101_pickplace` con 50 episodios y 11.939 fotogramas a 30 FPS. La configuración de entrenamiento incluye 25.000 pasos, batch size de 32, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se ha especificado si se utilizaron técnicas como RLHF o DPO, ya que se trata de un pipeline de aprendizaje por imitación supervisado.

Una innovación clave de ACT es su capacidad para generar acciones suaves y coherentes gracias a la predicción por chunks, lo que reduce la varianza en la ejecución comparado con políticas que predicen un solo paso. El modelo fue entrenado específicamente para la tarea "pink lego brick into the transparent box" y no es un modelo generalista.

## Capacidades

- Control de brazo robótico SO-101 para tareas de pick-and-place.
- Procesamiento de dos cámaras simultáneas (vista superior y lateral).
- Predicción de secuencias de acciones (action chunking) para movimientos fluidos.
- Ejecución de la tarea específica de colocar una pieza de lego rosa en una caja transparente.
- Integración con el ecosistema LeRobot para entrenamiento y despliegue.
- No soporta tool calling, generación de texto, razonamiento, código, matemáticas ni visión general (es un modelo de política motora, no un modelo fundacional).

## Casos de uso

- Automatización de tareas repetitivas de pick-and-place en entornos de laboratorio o producción ligera: el modelo puede integrarse en un brazo SO-101 para clasificar o mover objetos pequeños de forma autónoma, reduciendo la intervención humana en tareas monótonas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los transformers pueden transferir habilidades manipulativas a robots de bajo coste, permitiendo reproducir experimentos con hardware accesible.
- Prototipado rápido de políticas robóticas: los desarrolladores pueden usar este modelo como referencia para entrenar sus propias políticas ACT sobre datasets personalizados, gracias a la integración con LeRobot.
- Educación en robótica: el modelo es un ejemplo didáctico de cómo entrenar y desplegar una política de aprendizaje por imitación en un robot real, con documentación completa en el ecosistema LeRobot.
- Benchmarking de algoritmos de imitación: puede utilizarse como baseline para comparar ACT con otros métodos (como Diffusion Policy o VLA) en la misma tarea y hardware.
- Demostraciones en ferias y eventos: el modelo permite montar una demo funcional de robótica con un brazo SO-101 y dos cámaras USB, mostrando capacidades de manipulación en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, MMLU, HumanEval u otros benchmarks estándar, ya que se trata de un modelo de robótica y no de lenguaje o visión general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero dado el tamaño del modelo (~51,7 M parámetros), se estima que puede ejecutarse en GPUs con 4-6 GB de VRAM en FP32, o menos con cuantización.
- GPU recomendadas: cualquier GPU NVIDIA moderna con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060). Para entrenamiento, se recomienda una GPU con 8-12 GB (RTX 3070, RTX 4070, A4000).
- Cabe en GPUs de consumo: sí, tanto para inferencia como para entrenamiento con batches pequeños.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que gestionan la inferencia y el control del robot. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible, pero al ser un modelo pequeño, se espera que la inferencia sea lo suficientemente rápida para control en tiempo real (30 FPS) en hardware adecuado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| timypa111/act_pickplace | 51,7 M | no aplica | Pick-place SO-101 | Apache 2.0 | Hugging Face |
| tinkhireeva/act_so101_pick_place_3 | no disponible | no aplica | Pick-place SO-101 | no disponible | Hugging Face |
| AM-101/act_so101_pickplace | no disponible | no aplica | Pick-place SO-101 | no disponible | Hugging Face |
| SmolVLA (Hugging Face) | no disponible | no aplica | Modelo fundacional para robótica | no disponible | Hugging Face |

Los tres primeros modelos son variaciones de la misma receta: políticas ACT entrenadas con LeRobot sobre el dataset SO-101 pick-place. SmolVLA, por otro lado, es un enfoque más reciente de Hugging Face que busca ser un modelo fundacional ligero para robótica, con capacidades más generales. La comparación directa en rendimiento no es posible por falta de datos de evaluación publicados.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea específica (pieza de lego rosa en caja transparente) y no generaliza a otros objetos, posiciones o entornos sin reentrenamiento.
- Depende de la configuración exacta de cámaras y calibración del robot; cambios en iluminación, fondo o posición de la cámara pueden degradar el rendimiento.
- El dataset de entrenamiento es pequeño (50 episodios), lo que puede limitar la robustez frente a variaciones no vistas.
- No se han publicado resultados de evaluación en robot real, por lo que la tasa de éxito real es desconocida.
- El modelo no es un sistema de lenguaje ni visión general; no puede interpretar instrucciones arbitrarias ni razonar sobre tareas fuera de su entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el hardware y el entorno de despliegue deben replicar las condiciones de entrenamiento para obtener resultados fiables.
- No se proporcionan cuantizaciones oficiales ni formatos alternativos; los pesos están en safetensors y se cargan a través de LeRobot.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/timypa111/act_pickplace)
- [Dataset de entrenamiento](https://huggingface.co/datasets/lerobot/svla_so101_pickplace)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/svla_so101_pickplace)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Modelo similar: tinkhireeva/act_so101_pick_place_3](https://huggingface.co/tinkhireeva/act_so101_pick_place_3)
- [Modelo similar: AM-101/act_so101_pickplace](https://huggingface.co/AM-101/act_so101_pickplace)
- [Proyecto similar en GitHub: so101-act-pick-place](https://github.com/mikami235/so101-act-pick-place)
- [Documentación de SmolVLA en LeRobot](https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx)
