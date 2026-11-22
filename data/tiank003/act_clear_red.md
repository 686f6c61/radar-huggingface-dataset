# TianK003/act_clear_red

## Resumen

`act_clear_red` es una política de control robótico basada en la arquitectura ACT (Action Chunking with Transformers) entrenada para el brazo robótico SO-101. El modelo resuelve una tarea concreta de manipulación: extraer una pelota roja de un cuenco y depositarla en un orificio rojo. Lo desarrolla el usuario TianK003 y se distribuye a través de Hugging Face con la librería LeRobot.

Se trata de un fine-tuning de `Space0code/act_redblue_from_foil` sobre los segmentos `clear_r` del dataset `molnrb/so101_pick_rb_mixed` (revisión `8d36c36c`), con etiquetas manuales revisadas mediante pre-etiquetado automático. El modelo consume el estado de las articulaciones (`observation.state`) y dos flujos de vídeo a 640x480 y 30 fps (cámara superior y cámara de muñeca), y produce acciones en bloques de 100 pasos (chunk 100).

Es relevante como ejemplo de política robótica de imitación de código abierto para hardware asequible (SO-101), aunque su alcance es muy limitado: una única tarea, un único entorno y sin validación todavía en el brazo físico, según indica el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (chunk de acciones de 100 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea ACT (Action Chunking with Transformers), una arquitectura de imitación diseñada para control robótico que predice secuencias de acciones en lugar de acciones individuales. En este caso, el "chunk" es de 100 pasos, lo que permite al modelo generar trayectorias coherentes y reducir el error de acumulación típico de los enfoques paso a paso. Las entradas son el estado de las articulaciones y dos imágenes (cámara superior y cámara de muñeca) a 640x480 y 30 fps.

El entrenamiento parte del checkpoint `Space0code/act_redblue_from_foil` y se afina sobre los segmentos `clear_r` del dataset `molnrb/so101_pick_rb_mixed` (revisión `8d36c36c`). Las etiquetas se obtuvieron de anotaciones manuales y se validaron con pre-etiquetado asistido por IA. El autor reporta dos checkpoints con pérdida de evaluación sobre segmentos reservados: 0.321 (paso 002000) y 0.316 (paso 004000). No se especifican el número de tokens, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto).

## Capacidades

- Control robótico de manipulación: ejecuta la tarea de extraer una pelota roja de un cuenco y depositarla en un orificio rojo.
- Política de imitación multimodal: combina estado de articulaciones con dos cámaras (superior y muñeca).
- Generación de acciones en bloques de 100 pasos (action chunking).
- Operación a 30 fps con entradas de vídeo de 640x480.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar la secuencia completa de recogida de una pelota roja y su depósito en un orificio, adecuado para experimentos de manipulación con el brazo SO-101.
- Investigación en imitación robótica: sirve como punto de partida para estudiar el efecto del fine-tuning sobre un checkpoint base (`Space0code/act_redblue_from_foil`) en tareas de clasificación por color.
- Prototipado de pipelines LeRobot: al estar empaquetado con la librería LeRobot, se puede integrar en flujos de entrenamiento y evaluación estandarizados para hardware SO-101.
- Docencia y demostraciones: tarea acotada y reproducible que ilustra el ciclo completo de recogida de datos, etiquetado y entrenamiento de una política ACT.
- Benchmark interno de robustez: permite comparar checkpoints (002000 frente a 004000) y evaluar la generalización a variaciones de iluminación o posición de la pelota.
- Base para multi-tarea: al provenir de un modelo entrenado con rojo y azul, puede servir como inicialización para ampliar a otras variantes de color u orificios.

## Benchmarks y rendimiento

| Checkpoint | Pérdida de evaluación (segmentos reservados) |
|---|---|
| 002000 | 0.321 |
| 004000 | 0.316 |

No se han publicado resultados de benchmarks adicionales (éxito en tarea, MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica que el modelo aún no se ha probado en el brazo físico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.4 GB, lo que sugiere un modelo pequeño que probablemente cabe en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repo (0.4 GB) es plausible en RTX 3060 o superiores, pero no hay dato oficial.
- Opciones de despliegue: LeRobot (librería declarada); no se especifican vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput estimados: no disponibles; la operación se define a 30 fps en la captura de entrada, sin datos de inferencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto/chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `act_clear_red` | ACT | Pick-and-place pelota roja (SO-101) | Chunk 100 | no disponible | Hugging Face (LeRobot) |
| `Space0code/act_redblue_from_foil` | ACT | Tarea rojo/azul (modelo base) | no disponible | no disponible | Hugging Face |
| Políticas ACT genéricas de LeRobot | ACT | Manipulación diversa | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo no validado en el brazo físico: el autor indica explícitamente que aún no se ha probado en el robot.
- Alcance muy restringido: una única tarea, un único entorno y una única configuración de cámara.
- Sensible a cambios de iluminación, posición de la pelota y calibración del brazo; no se documenta robustez.
- Licencia no especificada: no se puede confirmar el uso comercial.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas (no aplicables en el sentido habitual, pero sí existe riesgo de fallo en la política).
- Pérdida de evaluación de 0.316 no equivale a tasa de éxito; falta validación empírica.
- Recomendación del autor: usar primero el checkpoint `004000` por tener la menor pérdida en segmentos reservados.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/TianK003/act_clear_red
- Checkpoint recomendado: https://huggingface.co/TianK003/act_clear_red@004000
- Modelo base: https://huggingface.co/Space0code/act_redblue_from_foil
- Dataset: https://huggingface.co/datasets/molnrb/so101_pick_rb_mixed (revisión `8d36c36c`)
- LeRobot (librería): https://github.com/huggingface/lerobot
