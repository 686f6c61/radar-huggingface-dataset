# VibeCuisine/vds-smoke-20260907-gcp-molmoact2-naaseh1-us-central1-c-spot40

## Resumen

El modelo `VibeCuisine/vds-smoke-20260907-gcp-molmoact2-naaseh1-us-central1-c-spot40` es una política de robótica basada en MolmoAct2, un modelo fundacional abierto desarrollado por el Allen Institute for AI (Ai2). Ha sido entrenado y publicado mediante la librería LeRobot de Hugging Face, y está pensado para controlar un robot manipulador a partir de imágenes de cámara e instrucciones en lenguaje natural. El modelo resuelve tareas de manipulación por aprendizaje por imitación, mapeando observaciones (estado del robot y dos vistas de cámara) a acciones de 7 dimensiones.

La arquitectura subyacente es MolmoAct2, que combina un modelo de visión-lenguaje con un decodificador de acciones para generar chunks de acciones del robot. En esta instancia concreta, el modelo tiene 5.591.928.368 parámetros (5,59 mil millones) y los pesos se distribuyen en formato safetensors, ocupando 11,5 GB en el repositorio. La longitud de contexto y los idiomas soportados no están disponibles en la información proporcionada.

La relevancia de este modelo radica en que demuestra cómo se puede realizar un ajuste fino de un modelo fundacional de robótica con muy pocos datos (un solo episodio, 270 frames) y con una configuración de entrenamiento mínima (10 pasos, batch size 1). Esto lo convierte en un ejemplo útil para investigar el sobreajuste y la generalización en políticas de imitación, aunque su utilidad práctica en producción es limitada debido a la falta de evaluación y a la escasez de datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (modelo de robótica de Ai2 implementado en LeRobot) |
| Parámetros totales | 5.591.928.368 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 11,5 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo se basa en MolmoAct2, un modelo fundacional abierto de robótica del Allen Institute for AI (Ai2) que mapea imágenes de cámara e instrucciones de lenguaje a chunks de acciones del robot. La implementación utilizada es la de LeRobot, que permite entrenar y evaluar el modelo MolmoAct2 estándar. En esta instancia, el modelo ha sido ajustado para una tarea concreta: "grasp the standing jug across its wide faces and stand it in the holder, spout to the right" (agarrar la jarra en pie por sus caras anchas y colocarla en el soporte, con el pitorro hacia la derecha).

Según la configuración de entrenamiento publicada, se realizaron 10 pasos de entrenamiento con un batch size de 1, optimizador AdamW, learning rate de 1e-05 y semilla 1000. La versión de LeRobot utilizada fue la 0.6.0. El dataset de entrenamiento, `VibeCuisine/naaseh1-bottle-holder-calib-090326`, contiene un único episodio con 270 frames a 20 FPS. No se menciona ningún proceso de RLHF, DPO ni otro tipo de alineación posterior.

Las entradas del modelo son el estado del robot (`observation.state`, forma `(7,)`) y dos imágenes de cámara: una vista superior (`observation.images.top`, forma `(3, 640, 480)`) y una vista desde la muñeca (`observation.images.wrist`, forma `(3, 480, 640)`). La salida es una acción de 7 dimensiones (`action`, forma `(7,)`). El robot utilizado es el `seeed_b601_rs_follower`.

## Capacidades

- Generación de acciones de robot (chunks de acción) a partir de observaciones de estado y dos vistas de cámara.
- Aprendizaje por imitación (behavior cloning) mediante el framework LeRobot.
- Soporte de múltiples cámaras (superior y muñeca) para la percepción visual del entorno.
- Ejecución de tareas de manipulación de objetos, como la tarea específica de agarrar una jarra y colocarla en un soporte.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue de políticas robóticas.
- No se han documentado capacidades de tool calling, agentes autónomos, razonamiento multi-paso ni generación de texto libre en la información disponible.
- Capacidades multilingües no disponibles.

## Casos de uso

- Manipulación de objetos en entornos industriales: el modelo puede ejecutar tareas de agarre y colocación de piezas, como en la tarea de la jarra, utilizando las imágenes de cámara y el estado del robot. Es adecuado para tareas repetitivas con posiciones conocidas, aunque su capacidad de generalización es limitada por el pequeño dataset.
- Automatización de tareas en laboratorios: útil para colocar recipientes en soportes o realizar movimientos precisos con un brazo robótico. La integración con LeRobot permite ajustar el modelo con nuevas demostraciones.
- Robótica doméstica: puede servir como punto de partida para tareas de cocina o asistencia en el hogar, como agarrar utensilios, siempre que se proporcionen demostraciones de la tarea específica.
- Investigación en aprendizaje por imitación: el modelo es un ejemplo de ajuste fino de un modelo fundacional con datos mínimos, lo que permite estudiar el sobreajuste, la transferencia y la generalización en políticas de manipulación.
- Prototipado rápido de tareas de manipulación: gracias a LeRobot, se puede entrenar una política para una tarea nueva con pocas demostraciones y desplegarla en un robot compatible, como el `seeed_b601_rs_follower`.
- Benchmark para políticas de manipulación: puede utilizarse como referencia para comparar el rendimiento de diferentes arquitecturas de políticas (por ejemplo, MolmoAct2 frente a otras políticas basadas en LeRobot) en tareas de agarre y colocación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de datos de éxito, tasas de acierto ni comparativas con otros modelos en tareas de robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo está diseñado para ejecutarse mediante LeRobot. El comando de rollout proporcionado utiliza `--strategy.type=base` y `--policy.path=VibeCuisine/vds-smoke-20260907-gcp-molmoact2-naaseh1-us-central1-c-spot40`. También se puede entrenar con `lerobot-train`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo es una instancia específica de MolmoAct2 ajustada con un dataset de un solo episodio. Se podría comparar con el modelo MolmoAct2 base de Ai2, pero no se han proporcionado especificaciones de dicho modelo en la información disponible. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo fue entrenado con un único episodio de 270 frames, lo que constituye una cantidad de datos extremadamente pequeña. Esto implica un alto riesgo de sobreajuste a la demostración concreta y una capacidad de generalización muy limitada.
- No se han proporcionado resultados de evaluación en robot real. La model card indica que no hay resultados de evaluación, por lo que se desconoce la tasa de éxito real de la política.
- La tarea está muy especificada: agarrar una jarra en pie por sus caras anchas y colocarla en un soporte con el pitorro a la derecha. Cambios en la posición, iluminación, tipo de objeto o configuraciones del robot pueden degradar el rendimiento.
- El modelo está asociado a un tipo de robot concreto (`seeed_b601_rs_follower`) y a dos cámaras específicas (`top` y `wrist`). Es probable que no funcione correctamente con otros robots o configuraciones de cámara sin un nuevo entrenamiento.
- No se han documentado sesgos específicos, pero al depender de una única demostración, la política puede heredar sesgos de esa demostración (por ejemplo, la forma de agarrar la jarra).
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de rendimiento ni soporte. El uso en producción requiere una evaluación exhaustiva previa.
- El repositorio no incluye información sobre cuantización, por lo que no se puede desplegar con eficiencia en hardware de menor capacidad sin realizar un proceso de cuantización adicional.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/VibeCuisine/vds-smoke-20260907-gcp-molmoact2-naaseh1-us-central1-c-spot40
- Blog de Ai2 sobre MolmoAct2: https://allenai.org/blog/molmoact2
- Repositorio oficial de MolmoAct en GitHub: https://github.com/allenai/MolmoAct
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/naaseh1-bottle-holder-calib-090326
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de MolmoAct2 en LeRobot: https://huggingface.co/docs/lerobot/main/en/molmoact2
