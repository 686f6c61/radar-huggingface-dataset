# TomasAnderegg/pill_sorting_colour_cf_swap_mix_ft_v2

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) publicado por Hugging Face, disenado para control robótico de imitación con requisitos computacionales reducidos y capacidad de despliegue en hardware de consumo. Esta ficha concreta, `TomasAnderegg/pill_sorting_colour_cf_swap_mix_ft_v2`, es un fine-tuning del modelo base `TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60`, entrenado por el usuario TomasAnderegg para una tarea específica de clasificación de pastillas por color y forma en compartimentos.

El modelo resuelve un problema acotado: dado un estado de articulaciones de 6 dimensiones y una imagen frontal de 480x640 píxeles, predice una acción de 6 dimensiones para que un robot seguidor (`so_follower`) coja una pastilla y la deposite en el compartimento indicado por una instrucción en lenguaje natural. La relevancia de este checkpoint es acotada: es una política de imitación especializada, no un modelo generalista, y su interés reside en demostrar el flujo de trabajo de LeRobot y SmolVLA aplicado a una tarea de manipulación concreta.

El modelo cuenta con 450.046.176 parámetros en formato safetensors, un repositorio de 10 GB y licencia Apache 2.0. La model card no documenta benchmarks de éxito en robot real, por lo que la evaluación de su rendimiento efectivo queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, política de imitación compacta) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un componente de lenguaje y un cabezal de acciones para producir comandos motores a partir de observaciones e instrucciones textuales. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención ni esquema de fusión multimodal); solo se indica que es un modelo compacto orientado a hardware de consumo y se enlaza el artículo arXiv 2506.01844.

El entrenamiento se realizó mediante imitación supervisada sobre el dataset `TomasAnderegg/pill_sorting_colour_cf_swap_mix_v2`, compuesto por 116 episodios y 52.064 fotogramas a 30 FPS. La configuración reportada incluye 4.000 pasos de entrenamiento, batch size de 64, optimizador AdamW, learning rate de 1e-05, semilla 1000 y LeRobot 0.6.2. El modelo base se denomina `pill_sorting_full_ft_a100_v3_dagger60`, lo que sugiere un entrenamiento previo con DAgger (60 iteraciones o episodios) sobre hardware A100. No se documentan detalles sobre composición del dataset, aumento de datos, RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Control robótico de manipulación: predice acciones de 6 dimensiones para un robot seguidor `so_follower` a partir de estado articular e imagen frontal.
- Comprensión de instrucciones en lenguaje natural: 16 tareas distintas que combinan cuatro colores (azul, rojo, amarillo, verde) y cuatro formas de compartimento (cuadrado, círculo, triángulo, cruz).
- Percepción visual: procesa imágenes de 3 canales y 480x640 píxeles procedentes de una cámara frontal.
- Política de imitación multi-tarea: un único modelo cubre las 16 combinaciones color-compartimento del dataset.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo general ni modos de pensamiento; el modelo es una política motora, no un asistente conversacional.

## Casos de uso

- Clasificación automatizada de pastillas en entornos de laboratorio: el modelo permite que un brazo robótico coja una pastilla de un color concreto y la deposite en el compartimento con la forma indicada, usando la instrucción textual como consigna y la imagen frontal como referencia visual.
- Prototipado de flujos de imitación con LeRobot: sirve como ejemplo reproducible de fine-tuning de SmolVLA sobre un dataset propio, con comandos documentados para lanzar el entrenamiento y el rollout.
- Investigación en políticas VLA compactas: al tener 450 millones de parámetros, permite experimentar con ajustes de hyperparámetros y comparar variantes sobre la misma tarea sin requerir clústeres de GPU.
- Docencia y demostraciones de robótica de manipulación: la tarea es visualmente interpretable y el modelo cabe en un repositorio de 10 GB, lo que facilita su uso en talleres y prácticas.
- Base para fine-tuning en tareas de sorting con variaciones de color y forma: el checkpoint puede servir de punto de partida para datasets con nuevas combinaciones o entornos similares.
- Evaluación de robustez ante cambios de iluminación o posición: al depender de una única cámara frontal y de un estado de 6 dimensiones, es útil para estudiar la sensibilidad de SmolVLA a variaciones del entorno.
- Integración en pipelines de investigación con DAgger: el nombre del modelo base sugiere un entrenamiento con agregación de datasets, lo que permite reutilizar la política para iteraciones posteriores de recogida de datos y reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía y no reporta tasas de éxito en robot real, comparaciones con otras políticas ni métricas de error de acción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Con 450 millones de parámetros, una estimación orientativa en fp32 sería de aproximadamente 1,8 GB solo para pesos, y en fp16 de aproximadamente 0,9 GB, sin contar activaciones ni el codificador visual.
- GPU recomendadas: no disponible. El modelo base se entrenó en A100 según su nombre, pero el fine-tuning se realizó con LeRobot 0.6.2 y no se especifica el hardware de inferencia.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 450 millones de parámetros, aunque la model card no lo confirma ni indica modelos concretos.
- Opciones de despliegue: LeRobot con el comando `lerobot-rollout` y `--policy.path=TomasAnderegg/pill_sorting_colour_cf_swap_mix_ft_v2`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se reporta la frecuencia de inferencia alcanzada en robot real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `TomasAnderegg/pill_sorting_colour_cf_swap_mix_ft_v2` | 450.046.176 | no disponible | Clasificación de pastillas (16 tareas) | Apache 2.0 | Hugging Face, 28 descargas |
| `TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60` | no disponible | no disponible | Clasificación de pastillas (modelo base) | no disponible | Hugging Face |
| SmolVLA (modelo original de Hugging Face) | no disponible en la informacion | no disponible | Política VLA generalista | no disponible en la informacion | Hugging Face, paper arXiv 2506.01844 |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otras políticas VLA de la misma categoría.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para 16 instrucciones de clasificación de pastillas por color y forma; no generaliza a otras tareas de manipulación sin fine-tuning.
- Dependencia de la cámara frontal: requiere una imagen de 480x640 y un estado de 6 dimensiones; cambios en la configuración del robot o en la posición de la cámara invalidan la política.
- Sin evaluación publicada: la model card no reporta tasas de éxito, por lo que se desconoce su fiabilidad en producción.
- Riesgo de sobreajuste al dataset: con 116 episodios y 52.064 fotogramas, la diversidad de escenas es limitada y puede degradarse ante cambios de iluminación, fondo u objetos.
- Idiomas no documentados: las instrucciones del dataset están en inglés; no se declara soporte multilingüe.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero al ser un modelo visual puede heredar sesgos de los datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales no detalladas en la información disponible.
- Repositorio de 10 GB: el despliegue requiere espacio en disco y ancho de banda considerables para un modelo de 450 millones de parámetros, probablemente por incluir checkpoints u otros artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomasAnderegg/pill_sorting_colour_cf_swap_mix_ft_v2
- Modelo base: https://huggingface.co/TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60
- Dataset de entrenamiento: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_colour_cf_swap_mix_v2
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TomasAnderegg/pill_sorting_colour_cf_swap_mix_v2
- Dataset relacionado: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_colour_cf_mix_v2
- Dataset relacionado: https://huggingface.co/datasets/TomasAnderegg/so101_pill_sorting_colour_v1
