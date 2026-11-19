# Tridex/model_act_3cam_resnet_100K_18_11_2

## Resumen

`Tridex/model_act_3cam_resnet_100K_18_11_2` es una política de imitación (imitation learning) para robótica basada en el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705. El modelo predice trozos de acción (action chunks) en lugar de pasos individuales, una estrategia que mejora la coherencia temporal de las trayectorias y reduce el error compuesto en tareas de manipulación. Está entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica del mundo real.

La política está especializada en una única tarea: coger un rotulador fluorescente amarillo y una botella de agua con gas ("gazeuse") y depositarlos dentro de una caja rosa, evitando explícitamente el mechero ("briquet"). Consume tres cámaras RGB (front, side, top) a 480x640 y el estado articular del robot (6 dimensiones), y produce acciones de 6 dimensiones. El modelo tiene 51.668.614 parámetros y un tamaño de repo de 0,2 GB, lo que lo hace ligero y desplegable en hardware modesto.

Es relevante para desarrolladores que trabajan con robots de bajo coste tipo SO-100/SO-101 (so_follower) y quieren replicar el flujo completo de LeRobot: grabación de datos teleoperados, entrenamiento de una política ACT y despliegue en robot real. No es un modelo de lenguaje ni multimodal generalista: es un controlador visomotor específico de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con backbone visual ResNet |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración ACT, no documentada en la ficha) |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se documentan variantes GGUF/cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la instrucción de tarea es una cadena fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT combina un codificador visual (ResNet, según el nombre del checkpoint `resnet`) que procesa tres vistas RGB (front, side, top) con un transformer que fusiona las observaciones visuales, el estado articular (`observation.state`, 6 dimensiones) y un embedding de la instrucción de tarea. La salida es un chunk de acciones de dimensión 6, decodificado de forma temporalmente coherente. El método se entrena por imitación supervisada sobre datos teleoperados, sin RLHF ni DPO.

Los datos de entrenamiento provienen del dataset `Tridex/79_fluo-gazeuse_vs_briquet_final`: 81 episodios, 72.299 frames a 30 FPS, con la instrucción "take the yellow fluo and drop it inside the pink box and take the gazeuse and drop it inside the pink box, but nerver try to take the briquet". La configuración de entrenamiento reportada es 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, seed 1000, LeRobot 0.6.2. El robot es `so_follower` con cámaras `front`, `side` y `top`.

## Capacidades

- Control visomotor de manipulación robótica: predice chunks de acción de 6 dimensiones a partir de tres imágenes RGB y el estado articular.
- Ejecución de una tarea específica de pick-and-place con restricción negativa (no coger el mechero).
- Fusión multi-cámara: integra vistas front, side y top para resolver oclusiones y localización de objetos.
- Aprendizaje por imitación: reproduce comportamientos demostrados por teleoperación, sin planificación simbólica.
- Integración con el ecosistema LeRobot: rollout con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües.

## Casos de uso

- Pick-and-place industrial ligero: el modelo deposita objetos identificados (rotulador, botella) en una caja destino usando tres cámaras; útil como base para tareas de clasificación en línea de montaje con robot SO-100.
- Replicación de experimentos de imitación: sirve como checkpoint de referencia para validar el pipeline LeRobot (grabación, entrenamiento ACT, rollout) en un robot `so_follower`.
- Selección con restricción negativa: la instrucción excluye explícitamente un objeto distractores (el mechero), lo que permite estudiar cómo ACT generaliza la evitación de objetos no deseados.
- Prototipado rápido en laboratorio: con 51,7 M parámetros y 0,2 GB, se puede desplegar en una estación con GPU consumer para iterar políticas de manipulación.
- Docencia en robótica: ejemplo completo y reproducible de aprendizaje por imitación con datos teleoperados, útil para cursos prácticos de LeRobot.
- Automatización de tareas repetitivas de recogida: el chunking de acciones reduce el jitter y mejora la suavidad de trayectorias en brazos seguidores.
- Benchmark interno de políticas ACT: comparar variantes (número de cámaras, backbone ResNet, pasos de entrenamiento) usando este checkpoint como línea base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M parámetros, ~0,2 GB de pesos), la inferencia cabe holgadamente en GPUs consumer de 8 GB o menos.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (RTX 3060/4090, A100, H100); el cuello de botella real es el procesamiento de tres streams RGB a 480x640 y 30 FPS.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB o superior; también viable en CPU para pruebas lentas.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base`; entrenamiento con `lerobot-train` en CUDA.
- Latencia y throughput estimados: no disponibles; dependen del robot, cámaras y GPU. La política opera a 30 FPS según el dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tridex/model_act_3cam_resnet_100K_18_11_2 | 51,7 M | 3 camaras 480x640 + estado (6) | Pick-and-place específico (fluo, gazeuse, evitar briquet) | Apache 2.0 | Hugging Face Hub |
| ACT original (paper 2304.13705) | no disponible | configurable | Imitación general | según implementación | Paper / código |
| Políticas LeRobot ACT genéricas | variable | configurable | Múltiples tareas | Apache 2.0 (típico) | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: solo ejecuta la tarea descrita; no generaliza a otros objetos, posiciones o instrucciones sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que el rendimiento en producción es desconocido.
- Dependencia de calibración: requiere robot `so_follower` y cámaras con nombres e índices que coincidan con las claves de observación (`front`, `side`, `top`).
- Sensibilidad a condiciones: cambios de iluminación, posiciones de objetos o distractores pueden degradar el comportamiento; no documentado.
- Riesgo de alucinación motora: como política de imitación, puede producir acciones fuera de distribución ante estados no vistos.
- Sin capacidades de lenguaje: la instrucción de tarea es una cadena fija; no hay comprensión de lenguaje natural.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los componentes de LeRobot y del dataset asociado.
- Sesgos: no evaluados ni documentados por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Tridex/model_act_3cam_resnet_100K_18_11_2
- Dataset: https://huggingface.co/datasets/Tridex/79_fluo-gazeuse_vs_briquet_final
- Visualizar dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/79_fluo-gazeuse_vs_briquet_final
- Paper ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
