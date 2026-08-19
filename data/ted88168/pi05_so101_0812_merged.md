# ted88168/pi05_so101_0812_merged

## Resumen

El modelo `ted88168/pi05_so101_0812_merged` es un fine-tune del modelo base `lerobot/pi05_base`, que a su vez es una implementación en LeRobot del modelo π₀.₅ (Pi05) desarrollado por Physical Intelligence. Pi05 es un modelo de visión-lenguaje-acción (VLA) diseñado para la generalización en robótica, capaz de controlar robots en entornos y situaciones no vistas durante el entrenamiento. Este fine-tune concreto se ha entrenado para una tarea específica de manipulación: "Grab the lego" (coger una pieza de Lego), utilizando un robot tipo `so_follower` con dos cámaras (handeye y front).

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y se distribuye en formato safetensors, con un tamaño de repositorio de 9,4 GB. Está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación. Fue creado el 14 de agosto de 2026 y no cuenta con descargas ni valoraciones en HuggingFace. Es relevante porque demuestra el flujo de fine-tuning de un VLA de última generación sobre un dataset propio, siguiendo el ecosistema LeRobot, y puede servir como referencia para desarrolladores que quieran adaptar Pi05 a sus propios robots y tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) |
| Parametros totales | 4.143.404.816 (≈4,14 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀.₅ de Physical Intelligence, un VLA que combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones para controlar robots. La implementación en LeRobot adapta el repositorio open-source OpenPI. Este fine-tune parte del checkpoint `lerobot/pi05_base` y se entrena mediante aprendizaje por imitación (imitation learning) sobre un dataset propio `ted88168/demov0805_merged`, que contiene 150 episodios y 88.162 frames a 30 FPS, todos etiquetados con la tarea "Grab the lego".

El entrenamiento se realizó con 10.000 pasos, batch size de 64, optimizador AdamW, learning rate de 2,5e-05 y semilla 1000, usando la versión 0.6.2 de LeRobot. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; es un fine-tuning supervisado estándar sobre demostraciones. No se detallan innovaciones técnicas adicionales en la model card, más allá de la propia arquitectura Pi05.

## Capacidades

- Control de robot para tareas de manipulación: el modelo genera acciones de 6 dimensiones (posición y orientación del efector) a partir de observaciones de estado y dos cámaras RGB (handeye y front).
- Ejecución de la tarea específica "Grab the lego" (coger una pieza de Lego) sobre el robot `so_follower`.
- Generalización a entornos nuevos dentro de la misma tarea, gracias a la arquitectura VLA de Pi05.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step fuera del ámbito robótico.
- No tiene capacidades multilingües ni de visión general fuera del contexto de control robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede ejecutar la tarea de coger una pieza de Lego de forma repetitiva, útil para validar pipelines de robótica.
- Fine-tuning sobre nuevas tareas: al ser un checkpoint intermedio, sirve como punto de partida para adaptar Pi05 a otras tareas de manipulación con datasets propios.
- Investigación en aprendizaje por imitación: permite estudiar cómo un VLA preentrenado se adapta a un dominio específico con pocos datos (150 episodios).
- Desarrollo de sistemas de control robótico en entornos académicos: el modelo se integra con LeRobot, facilitando su uso en plataformas de investigación.
- Benchmarking de VLA en hardware real: puede usarse para comparar el rendimiento de Pi05 frente a otros modelos en tareas de manipulación.
- Prototipado de soluciones de robótica asistida: por su licencia Apache 2.0, puede incorporarse a productos comerciales que requieran control de robots.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la model card.
- Dado el tamaño del modelo (≈4,14 B parámetros), se estima que la inferencia en FP16 requiere al menos 8-10 GB de VRAM solo para los pesos, más memoria para activaciones y procesamiento de imágenes (dos cámaras a 480×640). Se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090, A100, L4) para un funcionamiento fluido.
- El entrenamiento (fine-tuning) requiere más recursos: con batch size 64 y 10.000 pasos, se necesitaría una GPU con 24 GB o más (A100, H100) o varias GPUs.
- El despliegue se realiza mediante el ecosistema LeRobot, que soporta inferencia en PyTorch con CUDA. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje estándar.
- La latencia y el throughput dependen del hardware y de la frecuencia de control del robot; no se proporcionan datos concretos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la información proporcionada. El modelo es un fine-tune de `lerobot/pi05_base`, por lo que su comparación natural sería con el propio base y con otros VLA como OpenVLA o RT-2, pero no se ofrecen métricas. Se puede indicar que, al ser un fine-tune, su rendimiento está limitado a la tarea "Grab the lego" y no es directamente comparable con modelos generalistas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Grab the lego" y con un robot específico (`so_follower`); no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- El dataset de entrenamiento es pequeño (150 episodios), lo que puede provocar overfitting y baja robustez ante variaciones de iluminación, posición de objetos o distracciones.
- No se han realizado evaluaciones formales en el robot real; el rendimiento real es desconocido.
- Las cámaras y el estado del robot deben coincidir exactamente con las especificaciones de entrenamiento (dos cámaras, resolución 480×640, estado de 6 dimensiones); cualquier cambio requiere reentrenamiento.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo depende de la implementación de LeRobot y de la arquitectura Pi05, cuyas patentes o restricciones adicionales no se detallan.
- No se proporcionan datos sobre sesgos, alucinaciones o riesgos de seguridad específicos, pero al ser un modelo de control físico, un fallo puede causar daños materiales o personales; se recomienda supervisión humana en entornos reales.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/ted88168/pi05_so101_0812_merged)
- [Modelo base lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Dataset de entrenamiento ted88168/demov0805_merged](https://huggingface.co/datasets/ted88168/demov0805_merged)
- [Blog de Physical Intelligence sobre Pi05](https://www.physicalintelligence.company/blog/pi05)
- [Documentación de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
