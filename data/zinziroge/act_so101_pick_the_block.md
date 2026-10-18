# zinziroge/act_so101_pick_the_block

## Resumen

`zinziroge/act_so101_pick_the_block` es una política de imitación entrenada con el método ACT (Action Chunking with Transformers) para el robot `so_follower` (SO-101), especializada en una única tarea: agarrar un bloque. El modelo consume el estado articular (vector de 6 dimensiones) y dos cámaras (`wrist` y `top`, 480x640) y produce un vector de acción de 6 dimensiones. Fue entrenado y publicado con LeRobot 0.6.2, la librería de Hugging Face para aprendizaje por imitación en robótica real.

El modelo tiene 51.668.614 parámetros (unos 51,7 M) y un repositorio de 0,2 GB en safetensors. No es un modelo de lenguaje ni un VLM: no procesa texto ni genera lenguaje, sino que mapea observaciones visuales y propioceptivas a comandos motores. Su relevancia es la de un artefacto reproducible de investigación: un ejemplo completo y ejecutable de pipeline teleoperación-dataset-entrenamiento-despliegue sobre hardware de bajo coste.

Se entrenó sobre el dataset `zinziroge/sp101_pick_the_block_20261017_115300`, con 42 episodios y 25.081 fotogramas a 30 FPS, durante 100.000 pasos con batch 8 y learning rate 1e-5. No se han publicado resultados de evaluación en robots reales ni datos de éxito de la tarea, y la licencia no está especificada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación con transformer y CVAE |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política robótica; no hay ventana de contexto textual) |
| Tipos de cuantizacion | No disponible (solo pesos safetensors; sin versiones GGUF, int8 ni int4 publicadas) |
| Idiomas soportados | No disponible / no aplica (no procesa lenguaje) |
| Licencia | No disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.2 |
| Pipeline | robotics |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `wrist`, `top` (3x480x640 cada una, 30 FPS) |
| Entrada de estado | `observation.state`, forma (6,) |
| Salida de accion | `action`, forma (6,) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 (*Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware*). En lugar de predecir una acción por paso, la política predice un *chunk* de acciones futuras a partir de la observación actual, lo que reduce el error de acumulación y suaviza la ejecución. La formulación habitual de ACT combina un autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas con un transformer encoder-decoder que, en el paper original, utiliza un backbone ResNet para las imágenes. La model card de este repositorio no detalla la configuración exacta de la red (número de capas, dimensión oculta, tamaño del chunk ni backbone visual), por lo que esos datos deben considerarse no disponibles.

El entrenamiento se realizó con `lerobot-train` sobre 42 episodios teleoperados (25.081 fotogramas a 30 FPS) de la tarea "Grab the block", durante 100.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni etapas de refinamiento posteriores; es aprendizaje supervisado puro sobre demostraciones. Tampoco se especifica si se aplicaron aumentos de datos, qué proporción de episodios se reservó para validación ni si se usó ensemble temporal en la inferencia.

## Capacidades

- Generación de trayectorias motoras de 6 grados de libertad para el robot SO-101 a partir de observación visual y de estado.
- Predicción por chunks de acciones (característica del método ACT), orientada a ejecución fluida en tiempo real a 30 FPS.
- Fusión de dos vistas de cámara (`wrist` y `top`) con el vector de estado articular como entrada conjunta.
- Ejecución de una tarea concreta de manipulación: agarrar un bloque ("Grab the block").
- Integración directa con el ecosistema LeRobot para rollout, grabación de episodios y reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.
- No tiene modo *thinking*, visión general, audio ni comprensión de instrucciones en lenguaje natural; la tarea se fija en el prompt de rollout (`--task="Grab the block"`).

## Casos de uso

- **Recogida de un bloque en laboratorio con SO-101**: ejecutar `lerobot-rollout` con `--policy.path=zinziroge/act_so101_pick_the_block` sobre un brazo SO-101 calibrado y dos cámaras USB a 640x480 y 30 FPS. Es el escenario para el que fue entrenado y el único validado por el autor.
- **Punto de partida para fine-tuning con datos propios**: reentrenar la política con `lerobot-train --policy.type=act` sobre un dataset propio del mismo robot y comparar curvas de pérdida frente a este checkpoint base de 100.000 pasos.
- **Docencia en aprendizaje por imitación**: usar el par dataset (42 episodios) + política como ejemplo completo del ciclo teleoperación, visualización de dataset, entrenamiento y despliegue en un curso o taller.
- **Reproducción de experimentos y evaluación de infraestructura**: servir como referencia para medir latencia real de inferencia de una política de 51,7 M de parámetros en distintas GPU o en CPU, y para comparar el rendimiento de `lerobot-rollout` frente a otros backends.
- **Prototipado de automatización de pick-and-place de baja complejidad**: en una célula de montaje a escala de laboratorio, con objeto, iluminación y posiciones similares a los del dataset original, como prueba de concepto antes de invertir en un sistema industrial.
- **Generación de datos de evaluación para pipelines de robótica**: emplear los episodios de rollout de esta política como datos etiquetados para probar herramientas de análisis de fallos, anotación automática o detección de éxito de tarea.
- **Transferencia entre robots del mismo tipo**: evaluar hasta qué punto una política entrenada en un SO-101 concreto funciona en otra unidad del mismo modelo, útil para estudiar la sensibilidad a la calibración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la nota explícita: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, número de ensayos ni condiciones de evaluación (posiciones de objeto, iluminación, distractores).

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB. Con 51,7 M de parámetros, los pesos en fp32 ocupan unos 207 MB y en fp16 unos 103 MB; el grueso del consumo corresponde a los dos flujos de imagen de 480x640 y a las activaciones del backbone visual.
- **GPU recomendadas**: cualquier GPU con 4 GB o más es suficiente. Para entrenamiento o rollout a 30 FPS sostenidos, se recomiendan RTX 3060/4060 o superiores; RTX 4090, A100 o H100 no aportan ventaja significativa en inferencia para este tamaño.
- **Cabe en GPU de consumo**: sí, en cualquier GPU de consumo moderna (GTX 1650 4 GB en adelante) e incluso en iGPU recientes. También es viable en CPU, con latencia mayor y riesgo de no alcanzar los 30 FPS.
- **Plataformas embebidas**: Jetson Orin Nano o Raspberry Pi 5 con acelerador son opciones razonables para despliegue *edge*, aunque no hay mediciones publicadas de throughput en estas plataformas.
- **Opciones de despliegue**: `lerobot-rollout` (CLI oficial de LeRobot) con `--robot.type=so_follower` y `--policy.path`. vLLM, TGI, llama.cpp y Ollama no aplican: no es un modelo de lenguaje y no dispone de artefactos GGUF.
- **Latencia y throughput**: no disponible. No se han publicado mediciones de latencia por paso ni de frecuencia efectiva de control. El dataset y las cámaras operan a 30 FPS, lo que implica un presupuesto teórico de 33 ms por paso, pero no se confirma que la política lo cumpla en hardware concreto.
- **Requisitos adicionales**: dos cámaras con los nombres `wrist` y `top` (los nombres deben coincidir con las claves de observación), puerto serie del robot calibrado y el paquete `lerobot` 0.6.2 o compatible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zinziroge/act_so101_pick_the_block` | 51,7 M | No disponible (chunk de acciones, tamaño no documentado) | Agarrar un bloque (SO-101) | No disponible | Hugging Face, 0 descargas |
| ACT original (paper arXiv:2304.13705) | No disponible en la informacion proporcionada | Chunk de acciones (valor del paper no verificado aqui) | Manipulación bimanual de precisión | Código publicado por los autores | Paper y repositorio de referencia |
| Diffusion Policy | No disponible en la informacion proporcionada | No disponible | Políticas de imitación basadas en difusión, también soportadas en LeRobot | No disponible | Implementación en LeRobot |
| Políticas lingüísticas tipo VLA (por ejemplo, las incluidas en LeRobot) | No disponible en la informacion proporcionada | No disponible | Manipulación guiada por instrucciones en lenguaje natural | No disponible | Hugging Face |

No se dispone de datos verificables de rendimiento, contexto ni licencia de las alternativas dentro de la informacion proporcionada, por lo que la comparación cuantitativa no es posible. La diferencia cualitativa principal es que este checkpoint es una política monocapa y mono-tarea de 51,7 M de parámetros, mientras que las alternativas VLA incorporan un modelo de lenguaje y aceptan instrucciones, a costa de un tamaño mucho mayor y de unos requisitos de hardware superiores (extremo no cuantificado aqui).

## Limitaciones y advertencias

- **Sin evaluación publicada**: no existe ninguna medida de tasa de éxito en robot real. No se puede afirmar que la política funcione de forma fiable ni siquiera en el montaje original.
- **Dataset muy reducido**: 42 episodios y una única tarea. Es probable un sobreajuste a las posiciones de objeto, iluminación, fondo y disposición de cámaras del dataset de entrenamiento.
- **Sesgos de demostración**: al ser aprendizaje por imitación de teleoperación humana, hereda las trayectorias, velocidades y sesgos del operador, incluidos los errores sistemáticos de sus demostraciones.
- **Riesgo de fallo silencioso en entornos distintos**: cambios de iluminación, nuevos objetos, oclusiones o un robot mal calibrado no producen un mensaje de error, sino movimientos incorrectos que pueden dañar el objeto o el entorno. Requiere supervisión humana y límites de par.
- **Dependencia estricta de la configuración**: exige robot `so_follower` calibrado, dos cámaras con los nombres de observación exactos (`wrist`, `top`) y resolución 480x640 a 30 FPS. Cualquier desviación invalida las entradas.
- **Sin capacidades lingüísticas**: no interpreta instrucciones; el texto `"Grab the block"` es solo una etiqueta de tarea para el rollout.
- **Licencia indeterminada**: la model card marca la licencia como "More Information Needed". Sin una licencia explícita no hay autorización clara de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- **Procedencia y soporte**: autor individual, 0 descargas y 0 likes, sin demo ni vídeo de validación. No hay garantía de mantenimiento ni compatibilidad con versiones futuras de LeRobot.
- **Sin cuantizaciones**: no hay artefactos optimizados para despliegue en hardware limitado más allá del propio safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zinziroge/act_so101_pick_the_block
- Dataset de entrenamiento: https://huggingface.co/datasets/zinziroge/sp101_pick_the_block_20261017_115300
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zinziroge/sp101_pick_the_block_20261017_115300
