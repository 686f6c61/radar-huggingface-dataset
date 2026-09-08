# VibeCuisine/vds-smoke-20260907-runpod-xvla-v3

## Resumen

VibeCuisine/vds-smoke-20260907-runpod-xvla-v3 es un modelo de robótica basado en X-VLA (Vision-Language-Action), un framework de aprendizaje por imitación que utiliza soft prompts y flow matching para adaptar un único modelo a diferentes morfologías de robots, sensores y espacios de acción. Este checkpoint concreto es un fine-tune del modelo base lerobot/xvla-base, entrenado por VibeCuisine con el dataset VibeCuisine/vibepi3-grab-poseexpert-r3-curated para ejecutar la tarea "Grab the cucumber at the one-third point" en un robot tipo vibeboard_follower_tilt. El modelo tiene 879.738.545 parámetros, se distribuye bajo licencia Apache 2.0 y está integrado en el ecosistema LeRobot. Su relevancia radica en que permite evaluar y desplegar políticas VLA con capacidades multimodales (tres cámaras y estado del robot) en un entorno de investigación de robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | X-VLA (Vision-Language-Action) con soft prompts y flow matching |
| Parametros totales | 879.738.545 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Libreria | LeRobot |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura X-VLA descrita en el paper arxiv:2510.10274. X-VLA es un framework de Vision-Language-Action que codifica cada configuración de robot como una "tarea" mediante un conjunto pequeño de embeddings de soft prompt aprendibles. Esto permite que un mismo modelo base reconcilie distintas morfologías, sensores y espacios de acción. El componente de generación de acciones utiliza flow matching, una técnica de modelado generativo que aprende un campo de flujo para muestrear trayectorias de acciones.

El entrenamiento de este checkpoint parte de lerobot/xvla-base y se realizó con el dataset VibeCuisine/vibepi3-grab-poseexpert-r3-curated, compuesto por 64 episodios y 3.478 fotogramas a 20 FPS, con la tarea "Grab the cucumber at the one-third point". La configuración de entrenamiento incluye 10 pasos, batch size 1, optimizador xvla-adamw, learning rate 0.0001, seed 1000 y la versión 0.6.0 de LeRobot. No se dispone de información sobre el uso de RLHF o DPO; al tratarse de un modelo de aprendizaje por imitación, el proceso es supervisado.

## Capacidades

- Generación de acciones de robot (acción de 7 dimensiones) a partir de observaciones multimodales: estado del robot (7 dimensiones) y tres imágenes de cámara (corner, top, wrist) de 3x480x640.
- Ejecución de la tarea específica para la que fue entrenado: "Grab the cucumber at the one-third point".
- Integración con LeRobot para inferencia y entrenamiento, tanto en entornos locales como en el Hub.
- Al estar basado en X-VLA, hereda la capacidad de adaptarse a diferentes robots mediante soft prompts, aunque este fine-tune está configurado para el robot vibeboard_follower_tilt.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de un LLM; es un policy de control.

## Casos de uso

- Control de robot manipulador en laboratorio: el modelo puede ejecutar la tarea de agarre de un pepino en el punto de un tercio, usando las tres cámaras y el estado del robot. Es adecuado para experimentos de pick-and-place en entornos controlados.
- Investigación en políticas VLA: dado que es un fine-tune de xvla-base, puede usarse para comparar el rendimiento de un modelo base frente a uno ajustado en una tarea concreta, y estudiar la transferencia entre tareas.
- Evaluación de datasets de robótica: el dataset asociado (64 episodios, 3.478 fotogramas) permite analizar cómo la cantidad de datos afecta al aprendizaje por imitación en tareas de agarre.
- Despliegue en robots de bajo coste: el modelo tiene ~880M parámetros, lo que permite ejecutarlo en GPUs de consumo, facilitando la experimentación en laboratorios sin acceso a clústeres de alto rendimiento.
- Teleoperación y recogida de datos: el policy puede utilizarse como referencia para generar episodios de demostración en el robot vibeboard_follower_tilt, acelerando la creación de nuevos datasets.
- Benchmark de robustez visual: al usar tres cámaras (corner, top, wrist), el modelo puede evaluarse ante cambios de iluminación, oclusiones o posiciones del objeto, siendo útil para estudiar la robustez de políticas VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se han proporcionado resultados de evaluación para este policy.

## Requisitos de hardware

- El repositorio ocupa 1.8 GB, lo que sugiere pesos en bf16/fp16 para 879.738.545 parámetros.
- VRAM estimada: para inferencia con LeRobot, se estima que una GPU con al menos 6-8 GB de VRAM es suficiente, teniendo en cuenta el modelo y las activaciones de las tres cámaras de 480x640. No hay datos oficiales.
- GPU recomendadas: RTX 3060/4060 (6-8 GB), RTX 4090 (24 GB) para mayor margen, o A100/H100 si se requiere baja latencia.
- Sí cabe en GPUs de consumo, siempre que se respete la VRAM mínima.
- Despliegue: mediante LeRobot (comando `lerobot-rollout`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de robótica con pipeline de visión y acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VibeCuisine/vds-smoke-20260907-runpod-xvla-v3 | 879.738.545 | no disponible | Agarre de pepino (vibeboard_follower_tilt) | Apache 2.0 | HuggingFace |
| lerobot/xvla-base | no disponible | no disponible | Modelo base X-VLA | no disponible | HuggingFace |
| VibeCuisine/vds-smoke-20260907-runpod-molmoact2-v3-quantiles | no disponible | no disponible | Robótica (MolmoAct2) | no disponible | HuggingFace |

Nota: el modelo base es el punto de partida del fine-tune; el modelo MolmoAct2 es un enfoque alternativo de VLA de Ai2.

## Limitaciones y advertencias

- Entrenado solo en 64 episodios y 10 pasos, lo que puede limitar su generalización a nuevas posiciones, objetos o condiciones de iluminación.
- Sin resultados de evaluación publicados; no se conoce su tasa de éxito en la tarea.
- Depende de la configuración específica del robot vibeboard_follower_tilt y de las cámaras corner, top y wrist. Cambios en el hardware o en la calibración pueden degradar el rendimiento.
- No es un modelo de lenguaje; no soporta generación de texto, tool calling ni razonamiento simbólico.
- La licencia Apache 2.0 permite uso comercial, pero el rendimiento en producción no está garantizado sin una evaluación previa.
- Riesgo de fallos en robótica si el entorno difiere del de entrenamiento (iluminación, oclusiones, precisión del robot). No se han documentado sesgos específicos en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VibeCuisine/vds-smoke-20260907-runpod-xvla-v3
- Paper X-VLA: https://huggingface.co/papers/2510.10274
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/vibepi3-grab-poseexpert-r3-curated
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Guía de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Modelo MolmoAct2 de VibeCuisine: https://huggingface.co/VibeCuisine/vds-smoke-20260907-runpod-molmoact2-v3-quantiles
