# VibeCuisine/vds-smoke-20260907-runpod-pi05-v3-access-retry

## Resumen

VibeCuisine/vds-smoke-20260907-runpod-pi05-v3-access-retry es un modelo de robótica Vision-Language-Action (VLA) basado en π₀.₅ (Pi05) de Physical Intelligence, fine-tuned por VibeCuisine con la librería LeRobot. El modelo base, lerobot/pi05_base, está diseñado para generalizar a entornos y situaciones nuevas nunca vistas durante el entrenamiento, evolucionando el modelo π₀ original. Este fine-tune se ha entrenado para una tarea concreta: agarrar un pepino en el punto de un tercio, utilizando un robot tipo vibeboard_follower_tilt con tres cámaras.

El modelo tiene 4.143.404.816 parámetros y se distribuye con licencia Apache 2.0. Se trata de un modelo de política que consume observaciones de estado y tres imágenes (corner, top y wrist) y produce acciones de 7 dimensiones. No se especifican detalles sobre la arquitectura interna ni la longitud de contexto en la información disponible. Es relevante porque demuestra el uso de modelos VLA de mundo abierto en tareas de manipulación robótica, con una implementación open source y herramientas de entrenamiento accesibles como LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en π₀.₅; detalles internos no disponibles |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base lerobot/pi05_base, un VLA de Physical Intelligence. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI. π₀.₅ evoluciona π₀ para mejorar la generalización en entornos nuevos, pero la información proporcionada no detalla la arquitectura interna (número de capas, tipo de atención, etc.).

El entrenamiento se realizó sobre el dataset VibeCuisine/vibepi3-grab-poseexpert-r3-curated, compuesto por 64 episodios y 3478 frames a 20 FPS, con la tarea "Grab the cucumber at the one-third point". La configuración de entrenamiento incluye 10 pasos, batch size 1, optimizador AdamW, learning rate 2.5e-05, semilla 1000 y LeRobot versión 0.6.0. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Genera acciones de 7 dimensiones a partir de observaciones de estado (7 valores) y tres imágenes de 480x640 píxeles (cámaras corner, top y wrist).
- Control robótico de manipulación basado en visión y lenguaje, con capacidad potencial de generalización a entornos nuevos.
- No soporta tool calling, function calling, razonamiento simbólico, generación de texto ni capacidades multilingües.
- No dispone de modo de pensamiento explícito ni capacidades de audio o visión más allá de las entradas de cámara para el control del robot.
- El modelo está fine-tuned para una tarea específica de agarre, por lo que su comportamiento fuera de esa tarea no está evaluado.

## Casos de uso

- Automatización de agarre en líneas de producción: el modelo puede controlar un brazo robótico para agarrar objetos en posiciones concretas, utilizando las tres cámaras para localizar el objetivo y generar las acciones de muñeca y brazo necesarias.
- Manipulación en laboratorios: tareas de recogida y colocación de muestras o instrumentos, donde la capacidad de generalización del modelo base π₀.₅ puede adaptarse a variaciones de iluminación o disposición de objetos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para fine-tuning en nuevas tareas de manipulación, gracias a la integración con LeRobot y la posibilidad de entrenar con datasets propios.
- Demostraciones educativas de robótica: uso en entornos académicos para ilustrar el flujo completo de entrenamiento y despliegue de políticas VLA con LeRobot, desde la grabación de datos hasta el rollout.
- Integración en robots colaborativos: el modelo puede desplegarse en robots de tipo vibeboard_follower_tilt para tareas de pick-and-place en entornos cambiantes, siempre que se respete la configuración de cámaras.
- Fine-tuning para nuevas tareas de manipulación: los desarrolladores pueden tomar este modelo como base y ajustarlo con datasets específicos, aprovechando la arquitectura VLA para transferir conocimiento entre tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: no se proporcionan datos oficiales. El repositorio ocupa 9.4 GB en safetensors, por lo que se estima que la inferencia en FP16/BF16 requiere al menos 10-12 GB de VRAM, sin incluir overhead de runtime.
- GPU recomendadas: no especificadas. Dado el tamaño de ~4.1 mil millones de parámetros, se espera que funcione en GPUs de consumo con 16-24 GB de VRAM (RTX 4080, RTX 4090) o en GPUs de datacenter como A100 o H100.
- Sí cabe en GPUs de consumo con 16 GB o más de VRAM, asumiendo cuantización FP16/BF16.
- Opciones de despliegue: LeRobot, con comandos como `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento. También se puede usar con la documentación oficial de LeRobot.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa completa con otros modelos VLA. El modelo es un fine-tune de lerobot/pi05_base, que comparte el mismo tamaño de parámetros (4.143.404.816) y licencia Apache 2.0. Como referencia, el modelo base es la alternativa más directa, pero no se han proporcionado datos de rendimiento ni especificaciones adicionales. Otros modelos VLA como OpenVLA o pi0 existen en el ecosistema, pero no se han incluido en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se han realizado evaluaciones de sesgo en esta política.
- Riesgo de alucinación: en robótica, el riesgo se traduce en acciones incorrectas o inseguras. No hay datos de evaluación que permitan cuantificar este riesgo.
- Limitaciones de contexto o idioma: no aplica, ya que el modelo no procesa texto como entrada principal; es un modelo de acciones basado en visión y estado.
- Restricciones de licencia: Apache 2.0, lo que permite uso comercial y modificación, siempre que se mantenga el aviso de licencia.
- Caveats importantes: el modelo solo ha sido entrenado durante 10 pasos con 64 episodios, lo que puede limitar significativamente su capacidad de generalización. La tarea es muy específica ("Grab the cucumber at the one-third point") y el robot requiere una configuración exacta de cámaras (corner, top, wrist) y tipo de robot (vibeboard_follower_tilt). No se han publicado resultados de evaluación, por lo que el rendimiento real en el robot es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VibeCuisine/vds-smoke-20260907-runpod-pi05-v3-access-retry
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/vibepi3-grab-poseexpert-r3-curated
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
