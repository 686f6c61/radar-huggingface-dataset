# stevenqian/red_block_pi05_armcam_policy0

## Resumen

El modelo `stevenqian/red_block_pi05_armcam_policy0` es una política de robótica de tipo visión-lenguaje-acción (VLA) fine-tuneada a partir del modelo base `lerobot/pi05_base`, que a su vez es una implementación del modelo π₀.₅ (Pi05) desarrollado por Physical Intelligence. Pi05 es una evolución de π₀ diseñada para generalizar a entornos y situaciones no vistas durante el entrenamiento, y su implementación en LeRobot se adapta del repositorio open-source OpenPI.

Este modelo concreto ha sido entrenado por el usuario `stevenqian` para una tarea específica de manipulación: agarrar un bloque rojo y depositarlo en un contenedor. El entrenamiento se realizó mediante aprendizaje por imitación con el framework LeRobot, utilizando un conjunto de datos propio de 62 episodios de demostración. El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y se distribuye en formato safetensors, con un tamaño de repositorio de 9,4 GB.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de un VLA de última generación (Pi05) con LeRobot para una tarea robótica concreta, usando dos cámaras (superior y de brazo) y un estado del robot de 6 dimensiones. Es un ejemplo práctico de cómo adaptar un modelo base preentrenado a una tarea de manipulación específica, con la licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en Pi0.5 (transformador multimodal) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Pi0.5 de Physical Intelligence, un VLA que combina procesamiento de imágenes, lenguaje y acciones para control robótico. La implementación en LeRobot adapta el código del repositorio OpenPI. No se proporcionan detalles internos específicos (número de capas, tipo de atención, etc.) en la información disponible, pero se sabe que el modelo procesa dos flujos visuales de 480×640 píxeles (cámara superior y cámara de brazo) junto con un vector de estado de 6 dimensiones, y genera una acción de 6 dimensiones.

El entrenamiento se realizó mediante fine-tuning del modelo base `lerobot/pi05_base` sobre un dataset propio (`stevenqian/armcam_redblock`) que contiene 62 episodios y 25.519 frames a 30 FPS, correspondientes a la tarea "Grab red block and put in bin". La configuración de entrenamiento incluye 2.500 pasos, batch size de 32, optimizador AdamW con learning rate de 2,5e-05 y semilla 1000. Se utilizó LeRobot versión 0.6.2. No se menciona el uso de RLHF, DPO ni otras técnicas de post-entrenamiento; el proceso es puramente de aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones (probablemente posición y orientación del efector final) a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa dos cámaras RGB (superior y de brazo) a 480×640 píxeles.
- Aprendizaje por imitación: la política está entrenada para replicar las demostraciones del dataset, específicamente la tarea de agarrar un bloque rojo y colocarlo en un contenedor.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots tipo `so_follower`.
- No tiene capacidades de generación de texto, tool calling, agentes conversacionales ni razonamiento simbólico; es exclusivamente una política de control robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de agarrar un bloque rojo y depositarlo en un contenedor, lo que es útil en líneas de ensamblaje o clasificación de objetos.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tuning de un VLA (Pi0.5) con LeRobot, permitiendo estudiar el comportamiento de la política en tareas específicas.
- Prototipado rápido de políticas robóticas: gracias a la integración con LeRobot, se puede desplegar el modelo en un robot `so_follower` con comandos sencillos (`lerobot-rollout`), facilitando pruebas en laboratorio.
- Benchmark de generalización: al ser un fine-tuning de Pi0.5, puede utilizarse para evaluar la capacidad del modelo base de adaptarse a tareas concretas con pocas demostraciones (62 episodios).
- Educación y formación en robótica: el modelo y su dataset están disponibles públicamente, lo que permite a estudiantes e investigadores practicar el flujo completo de entrenamiento y despliegue de políticas VLA.
- Desarrollo de sistemas de manipulación con visión: la combinación de dos cámaras y estado del robot permite explorar estrategias de control basadas en percepción visual, útil para aplicaciones de robótica asistencial o industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de datos objetivos sobre la tasa de éxito de la política en el robot real.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la información disponible.
- Estimación orientativa: con 4.143.404.816 parámetros, en precisión FP16 el modelo ocupa aproximadamente 8,3 GB de VRAM (4,14e9 × 2 bytes). En FP32 serían unos 16,6 GB. Se recomienda una GPU con al menos 12 GB de VRAM para inferencia en FP16, como una RTX 4070 Ti o superior.
- Para entrenamiento o fine-tuning adicional, se necesitaría mayor capacidad (posiblemente 24 GB o más), dependiendo del batch size y la resolución de las imágenes.
- El despliegue se realiza mediante el ecosistema LeRobot, que soporta PyTorch y CUDA. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- La latencia y el throughput dependen del hardware y de la optimización; no hay datos publicados.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre otros modelos VLA comparables (como OpenVLA, RT-2 o π₀ original) en términos de rendimiento sobre la misma tarea, ni datos de benchmarks que permitan una comparación objetiva. El modelo es un fine-tuning específico de Pi0.5 y no se han publicado resultados que lo sitúen frente a alternativas.

## Limitaciones y advertencias

- Tarea específica: el modelo está entrenado únicamente para la tarea "Grab red block and put in bin" y puede no generalizar a otros objetos, posiciones o condiciones de iluminación fuera del dataset de entrenamiento.
- Sin evaluación publicada: no hay resultados de éxito en el robot real, por lo que su rendimiento en producción es incierto.
- Datos limitados: el dataset de entrenamiento tiene solo 62 episodios, lo que puede provocar sobreajuste y falta de robustez ante variaciones del entorno.
- Dependencia del hardware: requiere un robot `so_follower` y dos cámaras configuradas exactamente como en el entrenamiento (mismas posiciones y resoluciones).
- Sin soporte multilingüe: al ser un modelo de control robótico, no procesa lenguaje natural ni tiene capacidades conversacionales.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asegurarse de cumplir con los términos de la licencia del modelo base (`lerobot/pi05_base`) y de las dependencias (LeRobot, OpenPI).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la política puede producir acciones incorrectas si las observaciones difieren de las del entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/stevenqian/red_block_pi05_armcam_policy0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/stevenqian/armcam_redblock
- Blog de Physical Intelligence sobre Pi05: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para Pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Referencia de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia con LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
