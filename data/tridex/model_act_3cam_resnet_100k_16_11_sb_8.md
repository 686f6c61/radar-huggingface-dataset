# Tridex/model_act_3cam_resnet_100K_16_11_sb_8

## Resumen

`Tridex/model_act_3cam_resnet_100K_16_11_sb_8` es una política de imitación (imitation learning) para robótica basada en el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. En lugar de predecir una acción por paso, el modelo predice fragmentos cortos de acciones (action chunks), lo que reduce el error de acumulación y suele elevar la tasa de éxito en tareas de manipulación. Está empaquetado con la librería LeRobot de Hugging Face y se ejecuta sobre el robot `so_follower`.

El modelo consume tres flujos visuales (cámaras `front`, `side` y `top` a 480x640) más un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. Cuenta con 51.668.614 parámetros y un tamaño de repositorio de 0.2 GB en formato safetensors. Fue entrenado durante 100.000 pasos con batch size 8 sobre un dataset propio de 39 episodios y 12.977 frames a 30 FPS.

Su relevancia es acotada y muy específica: no es un modelo de lenguaje ni un modelo generalista, sino un artefacto de política entrenado para una única tarea ("take the yellow fluo and drop it inside the pink box") sobre un robot concreto. Resulta útil como referencia reproducible de un pipeline ACT con tres cámaras y para reutilizar la receta de entrenamiento en LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone ResNet para visión |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones por frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se pasa como cadena de texto al runner, no como entrada del modelo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0.2 GB, librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones (estado + imágenes) a secuencias de acciones. La variante aquí publicada usa un backbone ResNet para extraer características de las tres cámaras (`front`, `side`, `top`, cada una RGB 3x480x640), las fusiona con el vector `observation.state` de forma `(6,)` y decodifica un chunk de acciones de forma `(6,)` por paso. El entrenamiento es de imitación supervisada sobre datos de teleoperación, sin RLHF ni DPO.

La configuración de entrenamiento reportada es: 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.2. El dataset `Tridex/50_fluo_17h_16-11_20261116_170943` contiene 39 episodios y 12.977 frames a 30 FPS para una única tarea. No se documentan innovaciones adicionales más allá del propio action chunking del método ACT.

## Capacidades

- Predicción de acciones de manipulación robótica en bucle cerrado a partir de tres vistas de cámara y estado propioceptivo.
- Action chunking: genera fragmentos de acción en lugar de pasos individuales, lo que mejora la estabilidad de la ejecución.
- Fusión multimodal visión + estado para control de un robot `so_follower`.
- Ejecución de una tarea concreta de pick-and-place: coger un rotulador fluorescente amarillo y dejarlo dentro de una caja rosa.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Replicación de un pipeline ACT con tres cámaras: sirve como referencia reproducible para montar la captura de `front`, `side` y `top` con LeRobot y validar la integración de `lerobot-rollout`.
- Baseline de pick-and-place en laboratorio: ejecutar la política sobre un `so_follower` con la tarea "take the yellow fluo and drop it inside the pink box" para comparar contra políticas propias.
- Punto de partida para fine-tuning: reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio y usar estos pesos como inicialización.
- Docencia y demostraciones de imitation learning: el modelo ilustra el flujo completo grabación de datos, entrenamiento y despliegue en robótica de bajo coste.
- Pruebas de infraestructura de inferencia robótica: validar latencia y sincronización de tres cámaras a 30 FPS con el runner de LeRobot.
- Estudio de robustez a cambios de iluminación y posiciones de objeto: al no haber evaluación publicada, permite generar métricas propias de tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors de 0.2 GB, la inferencia cabe holgadamente en GPUs de consumo (por ejemplo, RTX 3060 en adelante) y probablemente en CPU, aunque no se documenta.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos unos pocos GB libres debería bastar.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (0.2 GB de pesos), aunque no hay cifras oficiales de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=Tridex/model_act_3cam_resnet_100K_16_11_sb_8`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El sistema debe operar a 30 FPS según el dataset, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tridex/model_act_3cam_resnet_100K_16_11_sb_8 | 51.668.614 | no aplica | Pick-and-place con `so_follower` y 3 cámaras | apache-2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | no aplica | Imitation learning genérico | no disponible | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. diffusion policy) | no disponible | no aplica | Imitation learning | según repositorio | Hugging Face (LeRobot) |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado para una única tarea y un único robot (`so_follower`); no generaliza a otras tareas ni morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que el rendimiento real es desconocido.
- Requiere exactamente las tres cámaras (`front`, `side`, `top`) a 480x640 y el vector de estado de 6 dimensiones; un cambio de configuración invalida la política.
- Dataset pequeño (39 episodios, 12.977 frames): alta probabilidad de sobreajuste a posiciones, iluminación y objetos concretos.
- Riesgo de fallo ante cambios de iluminación, distracciones en escena u objetos distintos al rotulador amarillo y la caja rosa.
- Licencia apache-2.0 permite uso comercial, pero el modelo depende de LeRobot y del método ACT; conviene citar ambos según la model card.
- No es un modelo de lenguaje: no admite prompts libres ni razonamiento textual; la cadena de tarea se usa como etiqueta de condicionamiento en el runner.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución más allá de lo indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_act_3cam_resnet_100K_16_11_sb_8
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/50_fluo_17h_16-11_20261116_170943
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/50_fluo_17h_16-11_20261116_170943
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
