# tarunmatta/smolvla_black_box_ft2

## Resumen

`tarunmatta/smolvla_black_box_ft2` es un ajuste fino (fine-tuning) del modelo vision-language-action (VLA) SmolVLA, desarrollado originalmente por Hugging Face y publicado como `lerobot/smolvla_base`. Lo publica el usuario `tarunmatta` en Hugging Face y está orientado a una única tarea robótica de manipulación: recoger una caja negra ("Pick up the black box") con un robot de tipo `so_follower` (SO-100/SO-101 de LeRobot). No es un modelo de lenguaje general, sino una política de imitación que mapea observaciones multimodales (estado de articulaciones e imágenes de varias cámaras) a comandos de acción de 6 dimensiones.

El modelo cuenta con 450.046.176 parámetros (~450 M) en formato safetensors, un tamaño de repositorio de 0,9 GB y licencia Apache 2.0. Se entrenó durante 40.000 pasos con un batch de 16, optimizador AdamW y learning rate de 1e-4 sobre un dataset propio de 40 episodios y 8.848 fotogramas a 10 FPS. La relevancia de este tipo de publicación es práctica: demuestra el flujo completo de LeRobot para grabar datos, entrenar una política VLA compacta y desplegarla en hardware de consumidor, algo que SmolVLA está diseñado específicamente para permitir.

Conviene subrayar que se trata de un artefacto experimental de un autor individual, con cero descargas y cero likes en el momento de la consulta, y sin resultados de evaluación publicados. Su interés es, por tanto, como ejemplo reproducible de fine-tuning de SmolVLA para una tarea concreta, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; política de imitación con codificador visual y decodificador de acciones (detalle interno no disponible) |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (política de control, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | No disponible (las instrucciones de tarea se expresan en inglés en el dataset: "Pick up the black box") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto descrito en el paper arXiv:2506.01844, diseñado para lograr rendimiento competitivo con un coste computacional reducido y poder desplegarse en hardware de consumidor. La política consume como entradas el estado de las articulaciones (`observation.state`, shape `(6,)`), tres cámaras visuales a 256×256 (`observation.images.camera1`, `camera2`, `camera3`) y una cámara adicional a 480×640 (`observation.images.empty_camera_0`), y produce un vector de acción de 6 dimensiones (`action`, shape `(6,)`). El detalle exacto de las capas internas, el número de tokens de imagen y el mecanismo de fusión visión-lenguaje-acción no se especifican en la información disponible.

El ajuste fino se realizó con LeRobot 0.7.1 sobre el dataset `tarunmatta/pick_up_black_box_smolvla`: 40 episodios, 8.848 fotogramas a 10 FPS, una única tarea ("Pick up the black box"). La configuración de entrenamiento fue de 40.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta si hubo RLHF, DPO ni ninguna fase de alineación adicional; se trata de aprendizaje por imitación supervisado a partir de demostraciones teleoperadas. El robot objetivo es `so_follower` con cámaras `wrist` y `left`.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot SO-follower a partir de observaciones visuales y propioceptivas.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas a 256×256 y una vista adicional a 480×640.
- Condicionamiento por instrucción en lenguaje natural: acepta una descripción de tarea (en el entrenamiento, "Pick up the black box").
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Despliegue en hardware de consumidor: heredado del diseño de SmolVLA, pensado para ejecutarse sin GPUs de datacenter.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni generación de texto libre; no es un modelo de lenguaje.

## Casos de uso

- Recogida de objetos en línea de montaje: la política ejecuta la tarea "Pick up the black box" sobre un robot SO-follower con cámara de muñeca y cámara lateral, adecuada para demostrar pick-and-place en células de fabricación ligeras.
- Prototipado de flujos de imitación con LeRobot: sirve como referencia reproducible de un pipeline completo (grabación de 40 episodios, entrenamiento de 40.000 pasos, despliegue con `lerobot-rollout`) para equipos que quieran validar su hardware antes de escalar.
- Investigación en VLA de bajo coste: al tener ~450 M de parámetros y 0,9 GB de pesos, permite experimentar con variantes de SmolVLA en una sola GPU de consumidor.
- Base para nuevos fine-tunings: al estar publicado en Apache 2.0 y derivar de `lerobot/smolvla_base`, se puede reentrenar con un dataset propio para otra tarea de manipulación.
- Docencia y demostraciones de robótica: útil para ilustrar el ciclo observación-acción de una política VLA en cursos o talleres con robots SO-100/SO-101.
- Benchmark interno de robustez visual: permite medir cómo afectan cambios de iluminación, posición del objeto o distractores a una política entrenada con solo 40 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~450 M de parámetros en fp32 los pesos ocupan aproximadamente 1,8 GB, y en fp16/bf16 alrededor de 0,9 GB, a lo que hay que sumar el coste de los codificadores visuales y los buffers de imagen.
- GPU recomendadas: no especificadas por el autor. Por el diseño de SmolVLA (orientado a hardware de consumidor), es razonable esperar que funcione en GPUs consumer, pero no hay confirmación oficial en la información disponible.
- ¿Cabe en GPU consumer? No confirmado explícitamente; el tamaño de pesos (0,9 GB en el repo) sugiere que sí, pero no se dispone de lista de GPUs validadas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=tarunmatta/smolvla_black_box_ft2`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política de control.
- Latencia y throughput: no disponibles. El dataset se grabó a 10 FPS, pero no se especifica la frecuencia de control en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tarunmatta/smolvla_black_box_ft2` | ~450 M | Pick up black box (SO-follower) | No aplica | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | ~450 M (no confirmado en la información) | VLA base multi-tarea | No aplica | No disponible en la información | Hugging Face (modelo base oficial) |
| Políticas ACT / Diffusion Policy de LeRobot | No disponible | Manipulación por imitación | No aplica | No disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: entrenado exclusivamente para "Pick up the black box"; no generaliza a otras instrucciones ni objetos sin reentrenamiento.
- Dataset muy pequeño: 40 episodios y 8.848 fotogramas, lo que limita la robustez ante variaciones de posición, iluminación o distractores.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real documentadas; el rendimiento real es desconocido.
- Sin métricas de sesgo ni análisis de alucinación: al no ser un modelo generativo de texto, los riesgos típicos de sesgo lingüístico no aplican, pero sí el sobreajuste a las condiciones de grabación.
- Dependencia de hardware concreto: las claves de observación (`camera1`, `camera2`, `camera3`, `empty_camera_0`) y el tipo de robot (`so_follower`) deben coincidir exactamente con la configuración de despliegue.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene verificar la licencia del modelo base y del paper asociado.
- Madurez: repositorio con 0 descargas y 0 likes, publicado y actualizado el mismo día; no hay evidencia de uso en producción ni mantenimiento posterior.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tarunmatta/smolvla_black_box_ft2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/tarunmatta/pick_up_black_box_smolvla
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=tarunmatta/pick_up_black_box_smolvla
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
