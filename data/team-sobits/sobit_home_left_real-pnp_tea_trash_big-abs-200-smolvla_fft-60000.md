# team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-200-smolvla_fft-60000

## Resumen

El modelo `team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-200-smolvla_fft-60000` es un checkpoint intermedio de un sistema de política robótica basado en SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face. Ha sido fine-tuneado por el equipo Team SOBITS de la Universidad Soka (Japón) a partir del modelo base `lerobot/smolvla_base` para controlar un robot móvil con brazo en una tarea doméstica concreta: lanzar una botella de plástico a una papelera. El modelo se distribuye bajo licencia Apache 2.0 y está diseñado para ejecutarse en hardware de consumo, lo que lo hace relevante para la investigación y el despliegue de robótica asistencial en entornos reales.

Con 450 millones de parámetros, SmolVLA ofrece un equilibrio entre capacidad y eficiencia computacional, siendo significativamente más ligero que otros VLA como OpenVLA (7B). Este checkpoint corresponde al paso 60.000 de un entrenamiento de 90.000 pasos, por lo que representa un estado intermedio de aprendizaje. Está entrenado sobre un dataset de 200 episodios con 42.390 frames capturados a 10 FPS, utilizando dos cámaras (cabeza y mano izquierda) y un vector de estado de 20 dimensiones. El modelo genera acciones de control de 20 dimensiones para el robot.

La relevancia de este modelo radica en su capacidad para demostrar que un VLA pequeño puede aprender tareas de manipulación robótica con pocos datos y ser desplegado en GPU de gama media, lo que democratiza el acceso a la robótica basada en aprendizaje para laboratorios y desarrolladores independientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (transformer multimodal visión-lenguaje-acción) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo procesa imágenes y estado, no texto libre) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión completa) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción basado en un transformer multimodal que procesa simultáneamente imágenes de cámaras, un vector de estado del robot y una instrucción de tarea en lenguaje natural, para producir acciones de control continuas. Su arquitectura está optimizada para minimizar el coste computacional manteniendo un rendimiento competitivo en tareas de manipulación. El modelo base `lerobot/smolvla_base` fue preentrenado con una combinación de datos de robótica y datos de internet, y este checkpoint ha sido fine-tuneado mediante aprendizaje por imitación (behavior cloning) sobre el dataset `sobit_home_left_real-pnp_tea_trash_big-abs-200`.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) durante 60.000 pasos (de un total planificado de 90.000), con un batch size de 16, optimizador AdamW y una tasa de aprendizaje de 0.0001. Los datos de entrenamiento consisten en 200 episodios de demostración real capturados con el robot SOBIT HOME, un manipulador móvil con dos brazos y base con ruedas. Las observaciones incluyen dos imágenes RGB de 480x640 píxeles (cámara de cabeza y cámara de mano izquierda) y un estado del robot de 20 dimensiones. La salida es un vector de acción de 20 dimensiones que controla la base móvil, el brazo y la pinza.

Una innovación destacable de SmolVLA es su eficiencia: a diferencia de modelos como OpenVLA que requieren GPUs de alta gama, SmolVLA puede ejecutarse en tarjetas gráficas de consumo (por ejemplo, RTX 3060) gracias a su tamaño reducido. Sin embargo, este checkpoint concreto no incorpora técnicas como decodificación especulativa o atención lineal; se trata de un fine-tuning estándar del modelo base.

## Capacidades

- Control de robot móvil con brazo: genera acciones de 20 dimensiones que integran movimiento de la base, articulaciones del brazo y apertura/cierre de la pinza.
- Percepción visual multimodal: procesa simultáneamente dos cámaras RGB (cabeza y mano izquierda) a resolución 480x640.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica como texto ("Throw the plastic bottle into the trash bin") y el modelo la traduce en comandos motores.
- Aprendizaje por imitación: el modelo reproduce comportamientos demostrados, lo que permite adaptarlo a nuevas tareas con pocos episodios.
- Inferencia en tiempo real: gracias a su tamaño compacto, puede ejecutarse a frecuencias de control adecuadas para robótica (10-30 Hz) en GPUs de consumo.
- Integración con el ecosistema LeRobot: compatible con el pipeline de entrenamiento, evaluación y despliegue de Hugging Face.

## Casos de uso

- Asistencia doméstica para personas mayores: el robot puede recoger objetos ligeros (botellas, tazas, pañuelos) y depositarlos en contenedores, reduciendo la carga física de los cuidadores. El modelo está entrenado específicamente para esta tarea y puede integrarse en un sistema de control completo con LeRobot.
- Automatización de tareas repetitivas en laboratorios: en entornos de investigación, el robot puede encargarse de clasificar y desechar residuos plásticos de manera autónoma, liberando tiempo del personal.
- Desarrollo de políticas robóticas transferibles: al ser un checkpoint intermedio, puede servir como punto de partida para fine-tuning en tareas similares (por ejemplo, recoger otros objetos o depositarlos en diferentes contenedores) con un coste de entrenamiento reducido.
- Benchmarking de VLA en hardware de consumo: investigadores pueden evaluar el rendimiento de SmolVLA frente a modelos más grandes en tareas de manipulación, midiendo latencia, precisión y consumo energético.
- Educación en robótica: universidades y centros de formación pueden desplegar este modelo en robots SOBIT HOME o similares para enseñar aprendizaje por imitación y control de manipuladores móviles sin necesidad de GPUs de alta gama.
- Robótica de servicios en entornos controlados: en cafeterías, oficinas o clínicas, el robot puede encargarse de vaciar papeleras o recoger objetos caídos, siempre que el entorno esté estructurado y la tarea se ajuste a la demostración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se dispone de métricas como tasa de éxito en el robot real ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 450 millones de parámetros. En precisión fp32, el checkpoint ocupa aproximadamente 1.8 GB; en fp16, alrededor de 0.9 GB. Se estima que la inferencia requiere al menos 2-4 GB de VRAM, dependiendo del batch y de las optimizaciones. No se proporcionan datos oficiales.
- GPU recomendadas: una NVIDIA RTX 3060 (12 GB) o superior es suficiente para ejecutar el modelo con margen. También puede funcionar en GPUs con 4-6 GB si se aplican cuantizaciones, aunque no se ofrecen versiones cuantizadas oficiales.
- Compatibilidad con hardware de consumo: sí, es uno de los objetivos del diseño de SmolVLA. Puede ejecutarse en tarjetas gráficas de gama media de NVIDIA.
- Opciones de despliegue: el modelo se integra con LeRobot, que ofrece scripts de rollout (`lerobot-rollout`) y soporte para robots móviles con cámaras. También es compatible con el framework de Hugging Face para inferencia.
- Latencia y throughput: no se proporcionan datos medidos. Dado el tamaño del modelo, se espera una latencia de inferencia inferior a 50 ms en una RTX 3060, lo que permite control a 10-20 Hz, pero esto es una estimación no confirmada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este checkpoint) | 450M | imágenes + estado | manipulación robótica | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | imágenes + texto | manipulación robótica | MIT | Hugging Face |
| RT-2 (Google) | 55B | imágenes + texto | manipulación robótica | propietaria | no pública |

SmolVLA es significativamente más pequeño que OpenVLA y RT-2, lo que permite su ejecución en hardware de consumo. Sin embargo, carece de las capacidades de razonamiento general de los modelos más grandes y está especializado en tareas de imitación. No se dispone de datos comparativos de rendimiento en tareas idénticas.

## Limitaciones y advertencias

- Especialización estrecha: el modelo solo ha sido entrenado para la tarea de lanzar una botella de plástico a una papelera. No generaliza a otras tareas sin un nuevo fine-tuning.
- Dependencia del robot y del entorno: los resultados dependen de la calibración exacta de las cámaras y del robot SOBIT HOME. Cambios en la iluminación, la posición de la cámara o el tipo de objeto pueden degradar el rendimiento.
- Checkpoint intermedio: al ser un modelo a mitad de entrenamiento, puede no haber convergido completamente; se recomienda evaluar el checkpoint final (paso 90.000) para producción.
- Sin evaluación publicada: no hay métricas de tasa de éxito ni pruebas en el robot real, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación en acciones: como cualquier modelo de aprendizaje por imitación, puede generar acciones incorrectas o inseguras si la entrada difiere de los datos de entrenamiento. Es necesario implementar salvaguardas de seguridad en el robot.
- Sin soporte de lenguaje natural en inferencia: aunque la tarea se describe con texto, el modelo no procesa instrucciones arbitrarias; la instrucción debe ser fija y coincidir con la usada en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asegurarse de cumplir con las condiciones de la licencia y de los datos utilizados (que pueden tener restricciones adicionales).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-200-smolvla_fft-60000)
- [Dataset de entrenamiento](https://huggingface.co/datasets/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-200)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Repositorio de Team SOBITS en GitHub](https://github.com/TeamSOBITS)
- [Checkpoint final (paso 90.000)](https://huggingface.co/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-200-smolvla_fft-90000)
