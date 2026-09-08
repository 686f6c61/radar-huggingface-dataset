# VibeCuisine/vds-smoke-20260907-gcp-pi05-naaseh1-us-central1-c-lora40

## Resumen

VibeCuisine/vds-smoke-20260907-gcp-pi05-naaseh1-us-central1-c-lora40 es una política robótica de tipo Vision-Language-Action (VLA), fine-tuneada con LoRA sobre el modelo pi05_base de Physical Intelligence. El desarrollo corre a cargo de VibeCuisine y utiliza el framework LeRobot de Hugging Face. El modelo resuelve una tarea de manipulación concreta: agarrar una jarra de pie por sus caras anchas y colocarla en un soporte, con el pitorro orientado a la derecha. Su relevancia radica en que demuestra cómo adaptar un modelo VLA de mundo abierto a una tarea específica con un dataset mínimo (1 episodio, 270 frames). La arquitectura es un transformer VLA; el tamaño y la longitud de contexto no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, fine-tune LoRA de lerobot/pi05_base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en pi05 (π₀.₅), un modelo Vision-Language-Action de Physical Intelligence diseñado para generalización en mundo abierto, que evoluciona a π₀. La implementación en LeRobot está adaptada del repositorio OpenPI. El fine-tune se realizó con LoRA sobre el modelo base lerobot/pi05_base, utilizando un dataset de 1 episodio con 270 frames a 20 FPS. La configuración de entrenamiento fue de 10 pasos, batch size 1, optimizador AdamW y learning rate 2.5e-05. El modelo consume observaciones de estado (7 dimensiones) y dos imágenes de cámara (top y wrist), y produce acciones de 7 dimensiones. No se dispone de información sobre el dataset de preentrenamiento del modelo base ni sobre innovaciones técnicas adicionales.

## Capacidades

- Genera acciones de 7 dimensiones para control robótico a partir de observaciones de estado y dos cámaras (top y wrist).
- Ejecuta la tarea específica para la que fue entrenado: agarrar una jarra de pie y colocarla en un soporte.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso.
- Capacidades multilingües: no disponible.
- Sin capacidades de visión general; solo procesa imágenes de las cámaras configuradas.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede colocar jarras en soportes de forma autónoma, lo que resulta útil en líneas de preparación de muestras o en entornos de investigación donde se repite la misma operación.
- Prototipado de políticas robóticas: sirve para validar el flujo de entrenamiento y despliegue de LeRobot con un modelo VLA en un robot Seeed B601.
- Investigación en aprendizaje por imitación: permite estudiar cómo un fine-tune con un solo episodio afecta al rendimiento de un modelo preentrenado.
- Benchmarking de generalización: se puede utilizar para comparar la adaptación a una tarea concreta frente al modelo base pi05_base.
- Educación y demostraciones: útil para enseñar el pipeline completo de LeRobot, desde el dataset hasta el rollout en el robot.
- Integración en sistemas de control robótico: mediante lerobot-rollout, se puede desplegar la política en el robot para ejecutar la tarea de forma autónoma, aunque sin evaluación previa de fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- No hay información sobre si cabe en GPU de consumo.
- Despliegue: se puede ejecutar con LeRobot (lerobot-rollout) en CUDA.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VibeCuisine/vds-smoke-...-lora40 | VLA fine-tune LoRA de pi05_base | no disponible | no disponible | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | VLA preentrenado | no disponible | no disponible | Apache 2.0 | Hugging Face |

El modelo presentado es un fine-tune LoRA del modelo base pi05_base, adaptado a una tarea robótica específica. No se dispone de datos de rendimiento comparativo con otros modelos VLA de la misma categoría.

## Limitaciones y advertencias

- Entrenado con un único episodio (270 frames), lo que limita severamente la generalización a nuevas posiciones, objetos o entornos.
- No se han proporcionado resultados de evaluación, por lo que se desconoce la tasa de éxito de la tarea.
- Requiere el robot Seeed B601 RS Follower y las cámaras top y wrist con las resoluciones especificadas (640x480 y 480x640 respectivamente).
- Puede fallar ante variaciones de iluminación, oclusiones o cambios en la apariencia del objeto.
- No soporta tool calling ni generación de texto, por lo que no es adecuado para tareas de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad del rendimiento en producción.

## Enlaces

- HuggingFace: https://huggingface.co/VibeCuisine/vds-smoke-20260907-gcp-pi05-naaseh1-us-central1-c-lora40
- Blog de Physical Intelligence sobre pi05: https://www.physicalintelligence.company/blog/pi05
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/naaseh1-bottle-holder-calib-090326
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
