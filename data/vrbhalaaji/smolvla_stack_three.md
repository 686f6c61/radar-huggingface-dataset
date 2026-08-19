# vrbhalaaji/smolvla_stack_three

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face, adaptado para una tarea específica de apilamiento de cubos con un robot tipo `so_follower`. El autor, vrbhalaaji, ha entrenado el modelo sobre el dataset `vrbhalaaji/so101_stack_three`, que contiene 100 episodios de demostraciones (37.611 frames a 30 FPS) para la tarea "Stack the cubes": colocar el cubo mediano sobre el grande y luego el pequeño sobre el mediano. El modelo consume imágenes de dos cámaras (muñeca y lateral) y el estado del robot, y produce acciones de 6 dimensiones.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño reducido puede ser fine-tuneado con pocos datos para una tarea robótica concreta, manteniendo la viabilidad de despliegue en hardware de consumo. SmolVLA, el modelo base, está diseñado para entrenarse en una sola GPU y ejecutarse en GPUs de gama media o incluso CPUs, lo que lo hace accesible para laboratorios y desarrolladores sin infraestructura de alto coste. Este fine-tuning concreto no incluye resultados de evaluación en el mundo real, pero sirve como ejemplo práctico del flujo de trabajo con LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer multimodal (detalles específicos no disponibles) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors) |
| Idiomas soportados | No disponible (modelo orientado a robótica, no a procesamiento de lenguaje general) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto con 450 millones de parámetros, desarrollado por Hugging Face. Su arquitectura combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, permitiendo que el modelo procese imágenes y texto para generar comandos motores. El paper original (arXiv:2506.01844) introduce una pila de inferencia asíncrona que desacopla la percepción y la predicción de acciones de la ejecución, lo que permite mayores tasas de control mediante la generación de acciones por fragmentos (chunked action generation). Esta característica es clave para su eficiencia en hardware de consumo.

El fine-tuning se realizó sobre el modelo base `lerobot/smolvla_base` utilizando el dataset `vrbhalaaji/so101_stack_three`, que contiene 100 episodios de demostraciones de apilamiento de cubos. El entrenamiento se llevó a cabo con 30.000 pasos, batch size de 8, optimizador AdamW, learning rate de 0,0001 y semilla 1000, usando la librería LeRobot versión 0.6.1. El modelo fue entrenado para imitar las demostraciones, aprendiendo a mapear observaciones (estado del robot y dos imágenes de cámaras) a acciones de 6 dimensiones. No se menciona el uso de RLHF ni DPO; es un entrenamiento de aprendizaje por imitación supervisado.

## Capacidades

- Control robótico: genera acciones de 6 dimensiones (posición y orientación del efector final) a partir de observaciones de estado y dos cámaras.
- Percepción visual: procesa imágenes de 256x256 píxeles de dos cámaras (muñeca y lateral) para comprender la escena y localizar los objetos.
- Aprendizaje por imitación: entrenado para replicar demostraciones humanas de apilamiento de cubos, con capacidad de generalizar dentro de la variabilidad del dataset.
- Ejecución de tareas específicas: realiza la tarea de apilar tres cubos de diferentes tamaños en un orden determinado.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Inferencia asíncrona: gracias al diseño de SmolVLA, puede ejecutar la predicción de acciones de forma desacoplada de la ejecución, mejorando la capacidad de respuesta.

## Casos de uso

- Automatización de tareas de manipulación en laboratorios de robótica: el modelo puede controlar un brazo robótico para apilar objetos, sirviendo como base para experimentos de manipulación.
- Investigación en aprendizaje por imitación con VLA: permite estudiar cómo un modelo compacto aprende tareas complejas con pocas demostraciones, comparando con modelos más grandes.
- Prototipado de soluciones robóticas en entornos académicos: al ser ligero y de código abierto, es adecuado para proyectos de fin de grado o máster donde se requiere un controlador de bajo coste.
- Demostración de fine-tuning de VLA con datos limitados: sirve como ejemplo de cómo adaptar un modelo base preentrenado a una tarea nueva con solo 100 episodios, útil para talleres y cursos.
- Desarrollo de robots de bajo coste para educación: puede desplegarse en hardware de consumo (GPUs de gama media) para enseñar robótica y aprendizaje automático en aulas.
- Integración en líneas de montaje simples: en entornos controlados, el modelo puede realizar tareas de apilamiento o clasificación de piezas, aunque requiere validación previa en el mundo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se dispone de métricas como tasa de éxito en el mundo real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, el modelo puede ejecutarse en GPUs con al menos 4-6 GB de VRAM en precisión FP32, y menos si se cuantiza (aunque no se proporcionan cuantizaciones oficiales).
- GPU recomendadas: tarjetas de consumo como NVIDIA RTX 3060, RTX 3090 o RTX 4090 son suficientes. Según el paper de SmolVLA, también puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con hardware de consumo: sí, es uno de los objetivos del diseño de SmolVLA.
- Opciones de despliegue: el modelo se integra con LeRobot, que utiliza PyTorch. Se puede ejecutar mediante el comando `lerobot-rollout` para controlar un robot real. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje puro.
- Latencia y throughput: no se proporcionan datos específicos para este fine-tuning. El paper original reporta mejoras de capacidad de respuesta gracias a la inferencia asíncrona, pero no hay cifras concretas aquí.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. Sin embargo, se puede contextualizar:

| Modelo | Parámetros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tuning) | 450M | VLA para robótica, tarea específica | Apache-2.0 | Hugging Face |
| OpenVLA | 7B | VLA generalista para robótica | MIT (con restricciones) | Hugging Face |
| RT-2 (Google) | 55B | VLA generalista | Propietaria | No abierto |

SmolVLA es significativamente más pequeño que OpenVLA y RT-2, lo que facilita su despliegue en hardware de consumo, pero su capacidad de generalización a tareas diversas es menor. No hay datos de rendimiento comparativo en tareas de apilamiento.

## Limitaciones y advertencias

- Entrenado para una tarea específica: el modelo solo ha sido fine-tuneado para apilar tres cubos en un orden concreto; no generaliza a otras tareas sin un nuevo fine-tuning.
- Dependencia de la configuración del robot y cámaras: las observaciones esperan dos cámaras específicas (muñeca y lateral) y un robot `so_follower`; cambios en la disposición pueden degradar el rendimiento.
- Sin evaluación en el mundo real: la model card no reporta resultados de pruebas físicas, por lo que se desconoce la tasa de éxito real y la robustez ante variaciones de iluminación, posición de objetos o ruido.
- Dataset pequeño: 100 episodios pueden provocar sobreajuste a las demostraciones específicas, limitando la generalización a nuevas posiciones o condiciones.
- Riesgo de seguridad física: al ser un modelo de control robótico, una ejecución incorrecta puede causar daños al robot o al entorno. Se recomienda supervisión humana durante las primeras pruebas.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales; se debe verificar la licencia del dataset `vrbhalaaji/so101_stack_three`.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/vrbhalaaji/smolvla_stack_three)
- [Dataset de entrenamiento](https://huggingface.co/datasets/vrbhalaaji/so101_stack_three)
- [Paper de SmolVLA (arXiv:2506.01844)](https://arxiv.org/abs/2506.01844)
- [Blog de Hugging Face sobre SmolVLA](https://huggingface.co/blog/smolvla)
- [Sitio web oficial de SmolVLA](https://smolvla.net/index_en)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
