# Sounderya/smolvla-ur3-base-20-80-simstats

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para control robótico en hardware de consumo. Este repositorio contiene un fine-tuning del modelo base `lerobot/smolvla_base` realizado por Sounderya, especializado en una tarea concreta de manipulación: coger una taza y colocarla sobre un plato, ejecutada con un robot UR3. El modelo se ha entrenado con el dataset `Sounderya/mug_smolvla_dataset_v2nc` (120 episodios, 91 365 fotogramas a 30 FPS) y se distribuye bajo licencia Apache 2.0.

Con 450 millones de parámetros, el modelo consume observaciones de estado (6 dimensiones) e imágenes de tres cámaras (256×256 píxeles) y produce acciones de 10 dimensiones. Su relevancia radica en que demuestra la viabilidad de desplegar políticas robóticas de alto rendimiento en equipos asequibles, sin necesidad de infraestructura de servidores dedicada. El modelo se integra con el ecosistema LeRobot, lo que facilita su uso y reproducción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450 046 176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. En este caso, el modelo se ha fine-tuneado desde `lerobot/smolvla_base` para una tarea específica de pick-and-place. El entrenamiento se realizó con el dataset `Sounderya/mug_smolvla_dataset_v2nc`, que contiene 120 episodios y 91 365 fotogramas a 30 FPS, con la tarea "Pick the mug and place it on the plate". La configuración de entrenamiento incluye 15 000 pasos, batch size de 64, optimizador AdamW, learning rate de 5e-5 y semilla 1000, utilizando la librería LeRobot versión 0.6.1. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El modelo está diseñado para ser eficiente y desplegable en hardware de consumo, según la descripción del paper original (arXiv:2506.01844).

## Capacidades

- Control robótico de manipulación: el modelo genera acciones de 10 dimensiones a partir de observaciones de estado (6 dimensiones) e imágenes de tres cámaras (256×256).
- Especialización en tareas de pick-and-place: entrenado específicamente para coger una taza y colocarla sobre un plato.
- Integración con LeRobot: compatible con el flujo de trabajo de entrenamiento y despliegue de LeRobot, incluyendo comandos `lerobot-rollout` y `lerobot-train`.
- Procesamiento multimodal: combina entradas visuales (tres cámaras) y de estado del robot.
- Eficiencia computacional: al ser un modelo compacto (450M parámetros), es adecuado para hardware de consumo, aunque no se especifican requisitos exactos.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso o soporte multilingüe, ya que el modelo está orientado exclusivamente a robótica.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo robótico UR3 para recoger objetos de una posición y colocarlos en otra, como en líneas de montaje o clasificación.
- Investigación en robótica de imitación: sirve como punto de partida para fine-tuning en nuevas tareas, ya que está basado en un modelo base preentrenado y se puede adaptar con datasets propios.
- Prototipado rápido de políticas robóticas: gracias a su integración con LeRobot, permite entrenar y evaluar políticas en pocas horas con hardware asequible, ideal para laboratorios académicos o startups.
- Demostraciones educativas: puede utilizarse en cursos de robótica o aprendizaje por imitación para ilustrar el flujo completo de recolección de datos, entrenamiento y despliegue.
- Evaluación de algoritmos de control: al ser un modelo de tamaño moderado, facilita la comparación de métodos de entrenamiento o arquitecturas en tareas de manipulación.
- Despliegue en robots de bajo coste: su eficiencia permite ejecutarlo en GPUs de consumo, lo que posibilita su uso en robots domésticos o de investigación sin servidores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPUs concretas en la documentación del modelo.
- Dado el tamaño de 450M parámetros y el formato safetensors, se estima que puede ejecutarse en GPUs de consumo como una RTX 3060 o superior, aunque no hay datos oficiales.
- El modelo se integra con LeRobot, que soporta entrenamiento e inferencia en CUDA (`--policy.device=cuda`).
- No se proporcionan opciones de despliegue específicas (vLLM, llama.cpp, etc.), pero al ser un modelo de robótica, el flujo estándar es mediante LeRobot.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un fine-tuning de `lerobot/smolvla_base`, pero no se ofrecen comparativas con otras políticas robóticas.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea muy específica (coger una taza y colocarla en un plato) y puede no generalizar a otras tareas u objetos sin un nuevo fine-tuning.
- No se han publicado resultados de evaluación, por lo que se desconoce su tasa de éxito real en el robot físico.
- El dataset de entrenamiento es limitado (120 episodios), lo que puede afectar a la robustez frente a variaciones de iluminación, posición de objetos o distracciones.
- No se documentan sesgos específicos, pero al ser un modelo de robótica, su comportamiento depende en gran medida de los datos de entrenamiento y del entorno de despliegue.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y del dataset asociado.
- No se especifican limitaciones de contexto o idioma, ya que el modelo no procesa texto libre.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Sounderya/smolvla-ur3-base-20-80-simstats)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc)
- [Modelo base `lerobot/smolvla_base`](https://huggingface.co/lerobot/smolvla_base)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
