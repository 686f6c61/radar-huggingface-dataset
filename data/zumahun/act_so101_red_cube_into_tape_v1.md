# Zumahun/act_so101_red_cube_into_tape_v1

## Resumen

Este modelo es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), desarrollada por Zumahun (Kohei Azuma) y publicada en HuggingFace. Está entrenado para controlar un robot tipo `so_follower` y ejecutar la tarea de colocar un cubo rojo dentro de un rollo de cinta, a partir de la observación del estado del robot (6 dimensiones) y de una imagen de cámara frontal (480x640). El modelo pertenece a la familia de políticas ACT, un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales, lo que mejora la estabilidad y la suavidad del control.

La política fue entrenada con el framework LeRobot de HuggingFace, utilizando un dataset de 20 episodios teleoperados y 11.979 frames a 30 FPS. El modelo tiene 51.668.614 parámetros y se distribuye con licencia Apache-2.0. Al ser un modelo especializado en una tarea concreta, su relevancia radica en servir como ejemplo de referencia para el entrenamiento de políticas ACT en robots de bajo coste y en la investigación sobre manipulación robótica por imitación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con CVAE (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT (Action Chunking with Transformers), propuesta en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT combina un transformer encoder-decoder con una variational autoencoder (CVAE) para predecir chunks de acciones de longitud fija en lugar de acciones individuales. Esta técnica reduce el error acumulativo y produce trayectorias más suaves, lo que resulta especialmente útil en tareas de manipulación bimanual.

En este caso, el encoder procesa la observación visual (imagen frontal de 480x640) y el estado del robot (vector de 6 dimensiones), mientras que el decoder genera una secuencia de acciones de 6 dimensiones. El modelo fue entrenado con el framework LeRobot en su versión 0.6.2, sobre el dataset `Zumahun/so101_red_cube_into_tape_v1`, compuesto por 20 episodios teleoperados y 11.979 frames a 30 FPS. La configuración de entrenamiento incluye 20.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se han aplicado técnicas de RLHF ni DPO, ya que se trata de aprendizaje por imitación supervisada.

## Capacidades

- Generación de acciones de control para un robot tipo `so_follower`, con salida de 6 dimensiones (posiciones o velocidades articulares).
- Entrada multimodal: combina el estado del robot (6 valores) con una imagen de cámara frontal de 480x640 píxeles.
- Predicción de chunks de acciones (action chunking), lo que permite ejecutar movimientos suaves y coordinados.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de modelar la dinámica del robot.
- Capacidad de ejecutar la tarea específica "meter el cubo rojo dentro del rollo de cinta" en el entorno para el que fue entrenado.
- Integración nativa con el ecosistema LeRobot: puede cargarse y ejecutarse mediante `lerobot-rollout` y reentrenarse con `lerobot-train`.

No es un modelo de lenguaje: no soporta tool calling, agentes conversacionales, generación de texto ni razonamiento simbólico.

## Casos de uso

- Despliegue en robots de laboratorio: el modelo puede ejecutar la tarea de colocar un cubo rojo dentro de un rollo de cinta en un robot `so_follower`, usando la cámara frontal como retroalimentación visual. Es adecuado para entornos de investigación donde se necesita una política rápida de replicar.
- Evaluación de políticas de aprendizaje por imitación: sirve como referencia para comparar el rendimiento de otras políticas ACT entrenadas con el mismo dataset o con datasets similares.
- Base para transferencia de aprendizaje: aunque está entrenado para una tarea concreta, puede utilizarse como punto de partida para fine-tuning en tareas relacionadas de manipulación de objetos, siempre que se disponga de nuevas demostraciones.
- Automatización de tareas repetitivas en entornos controlados: en procesos industriales o de laboratorio donde la tarea es fija y el entorno es estable, el modelo puede sustituir la teleoperación manual.
- Educación en robótica: el modelo y su dataset permiten ilustrar el flujo completo de LeRobot, desde la recogida de datos teleoperados hasta el entrenamiento y el despliegue de una política.
- Investigación en robots de bajo coste: ACT está diseñado para hardware asequible, por lo que este modelo puede ejecutarse en plataformas robóticas económicas para validar algoritmos de control por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente que no se han proporcionado resultados de evaluación para esta política. Por tanto, se desconoce la tasa de éxito real en el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. El entrenamiento requiere una GPU compatible con CUDA (`--policy.device=cuda`).
- Si cabe en GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se ejecuta y entrena exclusivamente a través del framework LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No es compatible con vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Zumahun/act_so101_red_cube_into_tape_v1 | 51,7M | Meter cubo rojo en rollo de cinta | Apache-2.0 | HuggingFace |
| Zumahun/act_so101_pick_place_v1 | 51,7M | Recoger y colocar objeto | Apache-2.0 | HuggingFace |

Ambos modelos comparten arquitectura y tamaño, pero están entrenados para tareas distintas. No se dispone de resultados de evaluación comparativos.

## Limitaciones y advertencias

- El modelo está entrenado para la tarea específica "meter el cubo rojo dentro del rollo de cinta" y no generaliza a otras tareas sin reentrenamiento.
- No se han publicado resultados de evaluación, por lo que se desconoce la tasa de éxito real en el robot y su robustez frente a variaciones del entorno.
- El dataset de entrenamiento es pequeño (20 episodios, 11.979 frames), lo que puede limitar la capacidad de generalización ante cambios de iluminación, posición de la cámara o del objeto.
- La política depende de la configuración exacta del robot (`so_follower`) y de la cámara frontal; cualquier cambio en el hardware o en la calibración puede degradar el rendimiento.
- No es un modelo de lenguaje: no puede procesar texto, mantener conversaciones ni realizar tareas de razonamiento simbólico.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable de validar el rendimiento en su propio entorno antes de desplegarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zumahun/act_so101_red_cube_into_tape_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/Zumahun/so101_red_cube_into_tape_v1
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil del autor: https://huggingface.co/Zumahun
