# VibeCuisine/vds-smoke-20260907-gcp-xvla-naaseh1-us-east1-d

## Resumen

VibeCuisine/vds-smoke-20260907-gcp-xvla-naaseh1-us-east1-d es una política robótica basada en el framework X-VLA, desarrollada por VibeCuisine y publicada en HuggingFace. Se trata de un modelo de tipo Vision-Language-Action (VLA) que ha sido fine-tuned desde el modelo base lerobot/xvla-base para ejecutar una tarea concreta de manipulación: agarrar una jarra de pie por sus caras anchas y colocarla en un soporte, con el pitorro orientado a la derecha. El modelo está diseñado para integrarse con el ecosistema LeRobot y se ejecuta en el robot seeed_b601_rs_follower.

La arquitectura X-VLA, presentada en el paper 2510.10274, utiliza un enfoque de soft prompts y flow matching. Trata cada configuración de robot o hardware como una "tarea" codificada mediante un pequeño conjunto de embeddings aprendibles, lo que permite que un único modelo reconcilie distintas morfologías, sensores y espacios de acción. Este modelo en particular cuenta con 879.738.545 parámetros y un tamaño de repositorio de 1.8 GB, lo que sugiere pesos en FP16. Al estar entrenado con un único episodio de demostración (270 frames a 20 FPS), representa un caso extremo de fine-tuning con datos muy limitados, relevante para investigar la eficiencia de datos en aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | X-VLA (Vision-Language-Action con soft prompts y flow matching) |
| Parametros totales | 879.738.545 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de accion robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

X-VLA es un framework de Vision-Language-Action que combina un modelo de lenguaje y visión con un mecanismo de soft prompts. Cada robot o configuración de hardware se codifica mediante un conjunto de embeddings aprendibles, de modo que el modelo puede adaptarse a distintas morfologías, sensores y espacios de acción sin necesidad de reentrenar el backbone completo. En este caso, el modelo ha sido fine-tuned desde lerobot/xvla-base, que actúa como punto de partida preentrenado.

El entrenamiento se realizó con el dataset VibeCuisine/naaseh1-bottle-holder-calib-090326, compuesto por 1 episodio y 270 frames a 20 FPS. La tarea registrada es "grasp the standing jug across its wide faces and stand it in the holder, spout to the right". La configuración de entrenamiento incluye 10 pasos, batch size 1, optimizador xvla-adamw, learning rate de 0.0001, seed 1000 y la versión 0.6.0 de LeRobot. Las entradas del modelo son el estado del robot (7 dimensiones) y dos imágenes de cámara: una superior (top) de 640x480 y una de muñeca (wrist) de 480x640. La salida es una acción de 7 dimensiones. El robot objetivo es el seeed_b601_rs_follower, equipado con las cámaras top y wrist.

## Capacidades

- Genera acciones de 7 dimensiones para controlar un robot manipulador a partir de observaciones de estado y dos cámaras.
- Ejecuta una tarea específica de manipulación: agarrar una jarra de pie por sus caras anchas y colocarla en un soporte con el pitorro a la derecha.
- Soporta fine-tuning con datos muy limitados: el modelo fue entrenado con un solo episodio de 270 frames, lo que demuestra la eficiencia de datos del framework X-VLA.
- Integración completa con LeRobot: se puede cargar, entrenar y ejecutar mediante las herramientas CLI de LeRobot.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, function calling, agentes conversacionales ni capacidades multilingües.
- No incluye modo de razonamiento explícito, ni capacidades de visión generales más allá de la tarea robótica específica.

## Casos de uso

- Automatización de manipulación en laboratorios: el modelo puede desplegarse en un robot con cámaras para colocar jarras o contenedores en soportes, reduciendo la intervención humana en tareas repetitivas de preparación de muestras.
- Robótica industrial de pick-and-place: aunque está entrenado para una tarea concreta, sirve como base para fine-tuning en tareas similares de agarre y colocación de objetos en posiciones definidas.
- Investigación en aprendizaje por imitación: permite estudiar cómo un modelo VLA puede adaptarse a una nueva tarea con un único episodio de demostración, lo que es útil para validar metodologías de few-shot imitation learning.
- Prototipado en entornos educativos: facilita demostraciones de políticas de visión-lenguaje-acción en robots de bajo coste como el seeed_b601_rs_follower, sin necesidad de recopilar grandes datasets.
- Integración en pipelines de LeRobot: se puede cargar directamente con `lerobot-rollout` para ejecutar la política en un robot real, usando los comandos y la configuración documentados en la model card.
- Evaluación comparativa de políticas robóticas: sirve como punto de partida para comparar el rendimiento de X-VLA frente a otros modelos VLA en tareas de manipulación específicas, aunque no se han publicado resultados de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16 ocupan aproximadamente 1.8 GB, según el tamaño del repositorio. Para inferencia se estima un mínimo de 2 GB de VRAM, más memoria para activaciones y buffers, por lo que se recomienda entre 2 y 4 GB.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM, como una RTX 3060, RTX 4060, A10 o L4. No hay requisitos oficiales publicados por el autor.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en GPUs de consumo con 4 GB o más de VRAM, lo que permite ejecutar la política en tiempo real a 20 FPS.
- Opciones de despliegue: LeRobot (mediante `lerobot-rollout`), HuggingFace Hub para la descarga de pesos. No aplica vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible. El entrenamiento se completó en 10 pasos con batch size 1, lo que sugiere una inferencia rápida en una GPU modesta, pero no hay datos medidos publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparación detallada en la información proporcionada. Los modelos comparables en la categoría de VLA incluyen OpenVLA y π0, pero no hay datos publicados sobre sus parámetros, licencias o rendimiento en esta fuente. Se recomienda consultar las respectivas fichas de HuggingFace para obtener datos actualizados.

## Limitaciones y advertencias

- Entrenado con un único episodio (270 frames), lo que limita severamente la generalización a variaciones de posición, iluminación, distracciones o cambios en el entorno.
- La tarea es muy específica: agarrar una jarra y colocarla en un soporte con el pitorro a la derecha. No se ha evaluado en otros objetos ni en configuraciones diferentes.
- El modelo está adaptado al robot seeed_b601_rs_follower y a las cámaras top y wrist. Cualquier cambio en el hardware, la calibración o la disposición de las cámaras requiere reentrenamiento.
- No se han proporcionado resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito en condiciones de producción.
- Riesgo de acciones incorrectas si las observaciones difieren del dominio de entrenamiento, especialmente en presencia de oclusiones o cambios de iluminación.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento pueden tener restricciones adicionales no documentadas en la model card.
- No es un modelo de lenguaje: no puede procesar texto, mantener conversaciones ni realizar tareas de razonamiento simbólico.

## Enlaces

- HuggingFace: https://huggingface.co/VibeCuisine/vds-smoke-20260907-gcp-xvla-naaseh1-us-east1-d
- Paper X-VLA: https://huggingface.co/papers/2510.10274
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/naaseh1-bottle-holder-calib-090326
- LeRobot: https://github.com/huggingface/lerobot
- Documentación X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=VibeCuisine/naaseh1-bottle-holder-calib-090326
