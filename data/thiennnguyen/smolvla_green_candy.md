# ThiennNguyen/smolvla_green_candy

## Resumen

SmolVLA Green Candy es un modelo de robótica de tipo vision-language-action (VLA) desarrollado por ThiennNguyen como un fine-tuning del modelo base `lerobot/smolvla_base`, publicado por Hugging Face. El modelo está especializado en una tarea concreta de manipulación robótica: recoger caramelos verdes y depositarlos en una cesta, descrita en el dataset de entrenamiento como «nhặt kẹo xanh vào giỏ» (en vietnamita).

Se trata de un modelo compacto de 450 millones de parámetros, basado en la arquitectura SmolVLA presentada en el paper arXiv 2506.01844, que combina un vision-language model (VLM) preentrenado con una cabeza de acción para control robótico. Su principal valor es que puede ejecutarse en hardware de consumo, lo que democratiza el acceso a políticas robóticas de alto nivel sin necesidad de infraestructura de centros de datos.

El modelo fue entrenado con el framework LeRobot (versión 0.6.2) sobre un dataset de 70 episodios y 27 378 frames a 30 FPS, con 30 000 pasos de entrenamiento. Utiliza observaciones de cinco cámaras (tres a 256×256 y dos a 480×640) junto con el estado del robot (6 dimensiones) para producir acciones de control en 6 dimensiones. No se han publicado resultados de evaluación en el repositorio, por lo que su rendimiento real en el robot no está documentado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM + cabeza de acción) |
| Parametros totales | 450 046 176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo no procesa texto como entrada principal; usa imágenes y estado) |
| Tipos de cuantizacion | safetensors (sin cuantizacion publicada) |
| Idiomas soportados | no disponible (tarea robótica, sin interfaz de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA (Vision-Language-Action) que combina un vision-language model preentrenado con una cabeza de predicción de acciones robóticas. La arquitectura se basa en un transformer multimodal que procesa imágenes de varias cámaras junto con el estado del robot (posición y orientación en 6 dimensiones) y genera acciones de control de 6 dimensiones como salida. El modelo base `lerobot/smolvla_base` fue desarrollado por Hugging Face con el objetivo de ser compacto y eficiente, permitiendo su ejecución en hardware de consumo.

El entrenamiento de este fine-tuning se realizó con el framework LeRobot (versión 0.6.2), usando un dataset propio de 70 episodios grabados con un robot tipo `so_follower`, con una frecuencia de 30 FPS. La configuración de entrenamiento incluye 30 000 pasos con batch size de 64, optimizador AdamW, learning rate de 0.0001 y semilla 1000. El dataset contiene 27 378 frames en total. No se ha especificado si se emplearon técnicas de RLHF o DPO, pero el proceso es el típico de aprendizaje por imitación (behavioral cloning) sobre demostraciones humanas.

## Capacidades

- Percepción visual multi-cámara: procesa simultáneamente hasta cinco cámaras (tres a 256×256 y dos a 480×640) para entender el entorno del robot.
- Control robótico de 6 grados de libertad (posición y orientación) mediante una cabeza de acción que genera acciones continuas.
- Aprendizaje por imitación: la política aprende a partir de demostraciones humanas recogidas en el dataset, sin necesidad de recompensas explícitas.
- Tarea específica: recoger objetos verdes (caramelos) y colocarlos en una cesta, con una descripción de tarea en vietnamita.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluación y despliegue en robots reales.
- Despliegue en hardware de consumo: al ser un modelo compacto de 450M parámetros, puede ejecutarse en GPUs de gama media sin necesidad de clústeres de servidores.

## Casos de uso

- Automatización de picking and placing en entornos controlados: el modelo puede gestionar la tarea de recoger objetos específicos de una superficie y depositarlos en un contenedor, lo que es relevante para pruebas de automatización en laboratorios o pequeñas líneas de producción.
- Desarrollo de políticas robóticas de bajo coste: al poder desplegarse en hardware de consumo, es adecuado para universidades y startups que no disponen de infraestructura de alto rendimiento, permitiendo experimentar con VLA sin grandes inversiones.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo la escala y el diseño de datasets afectan al rendimiento de políticas robóticas, dado que el entrenamiento se basa en demostraciones humanas.
- Demostración de VLA en robots de bajo coste: se puede integrar en plataformas como So-101 o SO-ARM para demostraciones educativas de manipulación robótica guiada por visión.
- Evaluación de generalización de tareas: dado que el modelo está especializado en una tarea concreta, puede usarse para medir la capacidad de generalización de SmolVLA ante cambios de iluminación, posición de objetos o variaciones del escenario.
- Benchmark de fine-tuning con LeRobot: sirve como ejemplo reproducible de cómo adaptar un VLA base a una tarea específica usando el framework LeRobot, útil para desarrolladores que quieran replicar el flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace indica que no se han proporcionado resultados de evaluación para esta política. No se dispone de datos de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible específicamente para este fine-tuning, pero SmolVLA con 450M parámetros puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM en fp16, y menos con cuantización (no publicada aquí).
- GPU recomendadas: RTX 3060/4060 (12 GB), RTX 4090, o GPUs de data center como A100 si se quiere mayor velocidad de inferencia.
- Consumer GPU: sí, cabe en GPUs de gama media con suficiente VRAM para el modelo y el procesamiento de las imágenes de entrada.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`), y el modelo puede integrarse con frameworks de inferencia como vLLM, aunque su uso principal es vía LeRobot en robots reales.
- Latencia y throughput: no disponible; depende de la GPU y del número de cámaras activas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThiennNguyen/smolvla_green_candy | 450M | no disponible | Picking de caramelos | Apache-2.0 | HuggingFace |
| lerobot/smolvla_base | 450M | no disponible | VLA general | Apache-2.0 | HuggingFace |
| OpenVLA (7B) | 7B | 2048 tokens | VLA general | MIT | HuggingFace |

SmolVLA base es el modelo del que deriva este fine-tuning, por lo que la comparativa es directa: el fine-tuning está especializado en una tarea concreta, mientras que el base es genérico. OpenVLA es un modelo VLA mucho mayor (7B) que requiere hardware de mayor capacidad, pero ofrece una generalización más amplia. No se dispone de datos de rendimiento comparativo entre ellos para esta tarea concreta.

## Limitaciones y advertencias

- Sesgos de datos: el modelo fue entrenado solo con 70 episodios de un único escenario y con un solo objeto (caramelos verdes). Puede fallar ante variaciones de iluminación, fondo, posición o tipos de objetos no presentes en el dataset.
- Riesgo de sobreajuste: con un dataset tan pequeño y una tarea tan específica, es probable que el modelo no generalice bien a entornos fuera del de entrenamiento.
- Alucinación de acciones: al ser un modelo VLA, puede generar acciones incoherentes o inapropiadas si la entrada visual no se corresponde con lo aprendido, especialmente en escenarios no vistos.
- Idioma: la tarea está descrita en vietnamita, pero el modelo no tiene interfaz de lenguaje; la descripción es solo metadata, no se usa como entrada. No soporta instrucciones en lenguaje natural en inferencia.
- Limitaciones de contexto: el modelo no procesa texto ni instrucciones lingüísticas, solo imágenes y estado del robot.
- Restricciones de uso comercial: licencia Apache-2.0 permite uso comercial sin restricciones, pero la responsabilidad del uso en robots reales recae en el usuario.
- Sin evaluación publicada: no hay datos de éxito en tareas reales, por lo que su fiabilidad en producción no está validada.

## Enlaces

- HuggingFace: https://huggingface.co/ThiennNguyen/smolvla_green_candy
- Dataset: https://huggingface.co/datasets/ThiennNguyen/record-test-green-70eps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Blog oficial SmolVLA: https://huggingface.co/blog/smolvla
- Web del proyecto: https://smolvla.net/index_en
- LeRobot: https://github.com/huggingface/lerobot
