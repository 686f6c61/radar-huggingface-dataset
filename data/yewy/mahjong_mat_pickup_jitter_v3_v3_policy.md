# Yewy/mahjong_mat_pickup_jitter_v3_v3_policy

## Resumen

`Yewy/mahjong_mat_pickup_jitter_v3_v3_policy` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado en el Hub mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. Está asociado al dataset `Yewy/mahjong_mat_pickup_jitter_v3_v3_224`, que sugiere una tarea de recogida de piezas o materiales de mahjong con variaciones de jitter (perturbaciones) en el entorno.

Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a control robótico de bajo nivel, no a generación de lenguaje. Los tags `lekiwi` y `so101` apuntan a plataformas robóticas concretas (LeKiwi y SO-101), lo que lo hace relevante para quienes trabajan con robots de bajo coste y quieren reproducir políticas de manipulación entrenadas con datos de teleoperación.

La licencia Apache 2.0 permite uso comercial y modificación. Su relevancia actual radica en que ejemplifica el flujo completo de LeRobot: entrenamiento desde un dataset de episodios teleoperados, publicación en el Hub y evaluación mediante `lerobot-record`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura transformer diseñada para aprendizaje por imitación que predice chunks de acciones (secuencias cortas de comandos motores) en lugar de una acción por paso. Esto reduce el error de compounding y mejora la estabilidad del control en tareas de manipulación. El modelo se entrena con datos de teleoperación, en este caso el dataset `mahjong_mat_pickup_jitter_v3_v3_224`, que incluye variaciones de jitter para aumentar la robustez frente a perturbaciones.

No se dispone de información sobre el número exacto de episodios, tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en este tipo de políticas). La innovación principal es el propio mecanismo de action chunking de ACT, descrito en el paper arXiv:2304.13705.

## Capacidades

- Control robótico de manipulación: predice secuencias de acciones para tareas de recogida (pickup) sobre superficies tipo mahjong.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de datos teleoperados.
- Robustez ante jitter: el nombre del dataset sugiere entrenamiento con perturbaciones para mejorar la generalización.
- Integración con LeRobot: compatible con el flujo de entrenamiento y evaluación de la librería.
- Compatibilidad con plataformas SO-101 y LeKiwi (según tags).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es una política motora, no un modelo de lenguaje.

## Casos de uso

- Recogida automatizada de piezas de mahjong: el modelo ejecuta la política de pickup sobre una superficie de juego, adecuado por su entrenamiento específico en esa tarea.
- Evaluación de robustez con jitter: sirve para probar cómo responde la política ante perturbaciones en la posición de los objetos, gracias al dataset con variaciones.
- Reproducción de experimentos de LeRobot: útil como checkpoint de referencia para comparar con otras políticas ACT entrenadas desde cero.
- Despliegue en robots SO-101: integrable mediante `lerobot-record` con `--robot.type=so100_follower` y `--policy.path` apuntando al checkpoint.
- Prototipado en plataformas LeKiwi: adecuado para pruebas de manipulación en robots de bajo coste con licencia permisiva.
- Base para fine-tuning: al ser Apache 2.0 y compacto (51,6 M parámetros), puede reentrenarse o ajustarse con nuevos datasets de tareas similares.
- Docencia y demostraciones: ejemplo práctico de pipeline completo de aprendizaje por imitación con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 51,6 M parámetros y pesos safetensors de 0,2 GB, es esperable que quepa en GPUs consumer de gama baja, pero no se confirma en la información.
- GPU recomendadas: no disponible.
- Cabe en consumer GPU: probablemente sí por tamaño, aunque no se especifica.
- Opciones de despliegue: LeRobot (`lerobot-record`), con `--policy.path` apuntando al checkpoint local o del Hub; soporte de CUDA mediante `--policy.device=cuda` en entrenamiento.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yewy/mahjong_mat_pickup_jitter_v3_v3_policy | 51.668.614 | no disponible | Pickup mahjong (ACT) | apache-2.0 | Hugging Face Hub |
| Otras políticas ACT en LeRobot | no disponible | no disponible | Manipulación genérica | variable | Hugging Face Hub |
| Políticas Diffusion Policy | no disponible | no disponible | Manipulación | variable | Hugging Face Hub |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al ser una política motora, los sesgos se manifiestan como comportamientos indeseados ante distribuciones de entrada distintas a las del entrenamiento.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones incorrectas fuera de distribución.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni múltiples idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento subyacentes.
- Caveats para producción: el modelo está entrenado para una tarea y plataforma concretas (mahjong mat pickup, SO-101/LeKiwi); su generalización a otros entornos no está garantizada. El repositorio tiene solo 27 descargas y 0 likes, por lo que la validación comunitaria es escasa.

## Enlaces

- Hugging Face: https://huggingface.co/Yewy/mahjong_mat_pickup_jitter_v3_v3_policy
- Dataset: https://huggingface.co/datasets/Yewy/mahjong_mat_pickup_jitter_v3_v3_224
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
