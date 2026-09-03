# Yu-Zhou-Wang/smolvla_so_101_red_foam_ball

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico en hardware de consumo. Este checkpoint concreto, `Yu-Zhou-Wang/smolvla_so_101_red_foam_ball`, es un fine-tune del modelo base `lerobot/smolvla_base` sobre el dataset `Jingyi-Z/sotac` (episodios 0-20) para la tarea específica de recoger una bola roja de espuma y colocarla en un contenedor, utilizando un brazo robótico SO-101 de 6 grados de libertad.

El modelo tiene 450 millones de parámetros y se distribuye en formato safetensors (0.9 GB). El fine-tune se realizó con el encoder de visión congelado y solo se entrenó el experto de acciones (`train_expert_only=True`), sin usar sensores táctiles. El checkpoint corresponde al paso 60.000 de un entrenamiento que se canceló en el paso ~77.000, por lo que no se completaron los 100.000 pasos previstos. Está pensado para ser cargado y ejecutado con la librería LeRobot, y requiere el tokenizer `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` (los pesos del VLM ya están incluidos en el safetensors).

La relevancia de este modelo radica en su demostración de que un VLA de tamaño reducido puede adaptarse a una tarea robótica concreta con pocas demostraciones, y en su integración con el ecosistema LeRobot para evaluación en robots reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLM2-500M-Video-Instruct |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (instrucciones en ingles en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y una cabeza de acciones. En este fine-tune, el encoder de visión se mantiene congelado y solo se entrena el "action expert", que genera las posiciones de las articulaciones del robot (6 grados de libertad) a partir de las observaciones de dos cámaras (remap de `top` a `camera1` y `wrist` a `camera2`) y una instrucción en lenguaje natural. Se utiliza una tercera cámara dummy (`empty_cameras=1`).

El entrenamiento se realizó sobre el dataset `Jingyi-Z/sotac` con los episodios 0-20, con un tamaño de lote de 8 y un chunk size de 50 pasos de acción. El checkpoint guardado corresponde al paso 60.000, aunque el objetivo era 100.000 pasos. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un fine-tune supervisado estándar.

## Capacidades

- Generación de acciones de control para un brazo robótico SO-101 (6 posiciones de articulaciones) a partir de observaciones visuales y una instrucción en lenguaje natural.
- Ejecución de tareas de pick-and-place específicas: recoger una bola roja de espuma y colocarla en un contenedor.
- Integración con el ecosistema LeRobot para evaluación en robot real mediante `lerobot-record`.
- Soporte de instrucciones en lenguaje natural (aunque el idioma exacto no está documentado, la tarea se describe en inglés).
- No incluye capacidades de generación de texto, razonamiento general, tool calling ni agentes; es un modelo puramente orientado a control robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios de robótica: el modelo puede controlar un brazo SO-101 para recoger objetos específicos (en este caso, una bola roja) y colocarlos en un destino, útil para experimentos repetitivos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo un VLA compacto se adapta a una tarea concreta con pocas demostraciones (20 episodios).
- Prototipado de sistemas robóticos de bajo coste: al ser un modelo de 450M parámetros, puede ejecutarse en GPUs de consumo, lo que permite probar políticas de control sin infraestructura de alto coste.
- Evaluación de políticas en robots reales: mediante la integración con LeRobot, se puede desplegar el modelo en un SO-101 y medir su tasa de éxito en la tarea, comparando con otros algoritmos como SAC con HIL-SERL.
- Educación y formación en robótica: el modelo y su código de entrenamiento pueden usarse como ejemplo práctico de fine-tuning de un VLA para una tarea específica.
- Benchmarking de VLA en hardware de consumo: permite comparar el rendimiento de SmolVLA frente a otros modelos en tareas de manipulación, tanto en simulación como en el mundo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito ni comparaciones con otros modelos. El blog de ggando.com menciona que con HIL-SERL se logró un 80% de éxito en reach-and-grasp tras 750 episodios, pero no hay datos específicos para este checkpoint de SmolVLA.

## Requisitos de hardware

- No se han publicado requisitos específicos de VRAM para este modelo.
- Dado que el modelo tiene 450M parámetros y el safetensors ocupa 0.9 GB, se estima que puede ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM en FP16 (estimación razonable, no un dato oficial).
- El blog de arm.com menciona que el fine-tuning se ejecutó en una DGX Spark, pero la inferencia debería ser posible en GPUs como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: LeRobot (librería principal), con soporte para carga mediante `SmolVLAPolicy.from_pretrained`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de robótica, no de lenguaje general.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. Existen otros fine-tunes de SmolVLA para SO-101, como `Askel1419/smolvla_so101_100EP` y `AndrewNoviello/so101-smolvla`, pero no se han publicado especificaciones detalladas ni resultados de rendimiento. El modelo base `lerobot/smolvla_base` es el punto de partida, pero no se conocen sus métricas en esta tarea concreta.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de recoger una bola roja de espuma y colocarla en un contenedor; no generaliza a otras tareas ni a otros objetos.
- El entrenamiento se canceló antes de completar los 100.000 pasos previstos (se detuvo en ~77.000), por lo que el checkpoint de 60.000 puede no estar completamente convergido.
- Depende de la configuración específica de cámaras (remap a `camera1` y `camera2`) y del robot SO-101; no funcionará con otros robots sin reentrenamiento.
- No se utilizó información táctil, lo que limita su capacidad en tareas que requieran retroalimentación de fuerza.
- El dataset de entrenamiento es pequeño (20 episodios), lo que puede provocar sobreajuste a las demostraciones concretas.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de demostración, puede heredar sesgos de la forma en que se realizaron las demostraciones.
- Riesgo de alucinación en la generación de acciones si la observación visual difiere significativamente de las imágenes de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está pensado para investigación y desarrollo robótico; no se garantiza su robustez en entornos de producción sin validación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yu-Zhou-Wang/smolvla_so_101_red_foam_ball
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset: https://huggingface.co/datasets/Jingyi-Z/sotac
- Tokenizer: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Blog de fine-tuning en SO-101: https://ggando.com/blog/smolvla-so101/
- Learning path de Arm sobre fine-tuning de SmolVLA: https://learn.arm.com/learning-paths/laptops-and-desktops/finetune-smolvla-lerobot/6-finetune-smolvla/
- Video de fine-tuning con 25 demos: https://www.youtube.com/watch?v=7RKQderl6vk
- Modelo similar: https://huggingface.co/Askel1419/smolvla_so101_100EP
- Otro modelo similar: https://huggingface.co/AndrewNoviello/so101-smolvla
