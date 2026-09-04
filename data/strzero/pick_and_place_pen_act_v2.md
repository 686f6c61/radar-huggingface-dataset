# strzero/pick_and_place_pen_act_v2

## Resumen

El modelo `strzero/pick_and_place_pen_act_v2` es una política de aprendizaje por imitación desarrollada con la librería LeRobot de HuggingFace. Utiliza la arquitectura ACT (Action Chunking with Transformers), un método de imitación que predice fragmentos de acciones en lugar de pasos individuales, lo que mejora la estabilidad y suavidad del movimiento. El modelo está entrenado para una tarea concreta de manipulación robótica: recoger un bolígrafo y colocarlo en una caja, a partir de observaciones de estado y de dos cámaras.

El modelo ha sido publicado por el usuario `strzero` y está alojado en HuggingFace bajo licencia Apache-2.0. Tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB. Se distribuye en formato safetensors y está diseñado para ejecutarse con la librería LeRobot, en un robot de tipo `so_follower`. No se han publicado resultados de evaluación sobre robot real, por lo que su rendimiento en entornos no controlados está pendiente de validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza ACT, una arquitectura basada en transformadores que aprende a generar un chunk de acciones futuras a partir de las observaciones actuales. En este caso, las observaciones incluyen el estado del robot (6 valores) y dos imágenes de tipo visual (cámara `top` y cámara `wrist`), ambas de 3x480x640. La salida es una acción de 6 dimensiones. Este enfoque de "chunking" de acciones permite que la política sea más robusta frente a perturbaciones y reduzca la acumulación de errores en tareas de manipulación.

El entrenamiento se realizó con la librería LeRobot (versión 0.6.1) sobre el dataset `strzero/pick_and_place_pen_v2`, compuesto por 50 episodios, 27.016 frames y una frecuencia de 30 FPS. La tarea es "Pick a pen and place it in the box". La configuración de entrenamiento incluye 50.000 pasos, batch size 8, optimizador AdamW con learning rate 1e-5 y seed 1000. No se indica el uso de RLHF, DPO ni ninguna técnica de alineación posterior; se trata de aprendizaje supervisado a partir de demostraciones teleoperadas.

## Capacidades

- Ejecución de tareas de manipulación robótica a partir de observaciones de estado y de imágenes de las cámaras `top` y `wrist`.
- Generación de acciones continuas de 6 dimensiones para control de un robot de tipo `so_follower`.
- Compatibilidad con el ecosistema LeRobot, incluyendo entrenamiento y despliegue mediante comandos `lerobot-train` y `lerobot-rollout`.
- Aprendizaje por imitación de demostraciones teleoperadas, con predicción de fragmentos de acciones para mayor estabilidad.
- No soporta generación de texto, tool calling ni razonamiento simbólico; es un modelo de política robótica especializado.

## Casos de uso

- Automatización de tareas de recogida y colocación en laboratorios de robótica: el modelo puede ejecutar la tarea "Pick a pen and place it in the box" de forma repetitiva, utilizando el robot `so_follower` y las cámaras configuradas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el comportamiento de ACT en tareas de manipulación con pocos episodios de demostración.
- Desarrollo de políticas para manipulación de objetos pequeños: su salida de acciones continuas es adecuada para tareas que requieren precisión en movimientos de agarre y colocación.
- Integración en pipelines de LeRobot: puede utilizarse para probar el flujo completo de entrenamiento, despliegue y rollout documentado en el ecosistema LeRobot.
- Benchmarking de métodos de imitación: permite comparar ACT con otras políticas en la misma tarea, aunque no se han publicado resultados oficiales de evaluación.
- Prototipado rápido de robots colaborativos en entornos controlados: al estar entrenado en una tarea específica, es útil para validar hardware y sensores antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se han publicado cifras oficiales de consumo de memoria para este modelo.
- GPU recomendadas: no disponible. Al tratarse de un modelo de 51,7 millones de parámetros, se espera que pueda ejecutarse en GPUs de gama media, pero no hay datos confirmados.
- Compatibilidad con GPU de consumo: no se especifica, pero el uso de imágenes de 480x640 puede aumentar los requisitos de memoria.
- Opciones de despliegue: el modelo está diseñado para ejecutarse con LeRobot, que requiere PyTorch y CUDA. También puede utilizarse mediante los comandos `lerobot-rollout` y `lerobot-train` documentados en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los únicos modelos comparables encontrados en la búsqueda web son `strzero/pick_and_place_pen_act` (versión sin `v2`) y `dlcodnjs/act_pick_and_place_v2_90`. Ambos parecen ser políticas ACT de tamaño similar, pero no se dispone de información detallada sobre su entrenamiento o rendimiento.

| Modelo | Parametros | Arquitectura | Tarea | Licencia | Framework |
|---|---|---|---|---|---|
| strzero/pick_and_place_pen_act_v2 | 51.668.614 | ACT | Pick and place pen | Apache-2.0 | LeRobot |
| strzero/pick_and_place_pen_act | no disponible | no disponible | no disponible | no disponible | no disponible |
| dlcodnjs/act_pick_and_place_v2_90 | 51,7 M (aprox.) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado resultados de evaluación sobre robot real; la tasa de éxito y la robustez del modelo en entornos variados no están validadas.
- El dataset de entrenamiento es pequeño (50 episodios), lo que puede limitar la generalización a nuevas posiciones, iluminación o distracciones.
- El modelo está vinculado al tipo de robot `so_follower` y a las cámaras `top` y `wrist`; cualquier cambio en el hardware o en la calibración puede degradar el rendimiento.
- Es un modelo de política robótica especializado en una tarea concreta. No es un modelo de lenguaje, no genera texto y no soporta tool calling.
- No hay información sobre sesgos, riesgos de alucinación o comportamientos inseguros. En robótica, es necesario implementar capas de seguridad y supervisión humana antes de cualquier uso en producción.
- La licencia Apache-2.0 permite uso comercial, pero el despliegue real depende de la disponibilidad y licencia del hardware robótico asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/strzero/pick_and_place_pen_act_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot sobre ACT: https://huggingface.co/docs/lerobot/main/en/act
- Dataset de entrenamiento: https://huggingface.co/datasets/strzero/pick_and_place_pen_v2
- Modelo similar sin `v2`: https://huggingface.co/strzero/pick_and_place_pen_act
- Modelo comparable de terceros: https://huggingface.co/dlcodnjs/act_pick_and_place_v2_90
