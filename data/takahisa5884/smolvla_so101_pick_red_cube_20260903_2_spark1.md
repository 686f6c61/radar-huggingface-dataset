# Takahisa5884/smolvla_so101_pick_red_cube_20260903_2_spark1

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face que logra un rendimiento competitivo con costes computacionales reducidos y puede desplegarse en hardware de consumo. Este checkpoint concreto es un fine-tuning del modelo base `lerobot/smolvla_base`, realizado por Takahisa5884 (Takahisa Kobayashi) con el framework LeRobot, para la tarea específica de recoger un cubo rojo y colocarlo en un tubo blanco.

El modelo combina un encoder de visión SigLIP, un modelo de lenguaje SmolLM2 y un decodificador de acciones. Cuenta con 450.046.176 parámetros en total y está pensado para controlar un robot tipo SO-101 (so_follower) a partir de observaciones del estado y de tres cámaras RGB. El fine-tuning se entrenó sobre un dataset de 79 episodios y 38.777 frames a 30 FPS.

La relevancia de este modelo radica en su eficiencia: durante el ajuste fino solo se actualizan aproximadamente 50 millones de parámetros (el action expert y las proyecciones), mientras que el encoder de visión y el modelo de lenguaje permanecen congelados. Esto reduce los requisitos de hardware y lo hace accesible para desarrolladores e investigadores que deseen experimentar con políticas de manipulación robótica en GPUs de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en Transformer, con encoder de visión SigLIP, modelo de lenguaje SmolLM2 y decodificador de acciones. |
| Parametros totales | 450.046.176 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el tamaño del repo, 0.9 GB, sugiere un almacenamiento en 16 bits, pero no se especifica) |
| Idiomas soportados | no disponible (la instrucción de tarea está en inglés; no es un modelo de generación de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que integra un encoder de visión SigLIP y un modelo de lenguaje SmolLM2 con un decodificador de acciones ligero. En el fine-tuning realizado para este checkpoint, solo se actualizan el action expert y las proyecciones de entrada, aproximadamente 50 millones de parámetros, mientras que los encoders de visión y lenguaje permanecen congelados. Esto hace que el entrenamiento sea rápido y viable en GPUs de consumo.

Este modelo se ha fine-tuneado con LeRobot 0.6.1 sobre el dataset `Takahisa5884/so101_pick_red_cube_20260903_114501`, compuesto por 79 episodios y 38.777 frames a 30 FPS. La tarea entrenada es "Pick up the red block and place it in the white tube". La configuración de entrenamiento fue la siguiente: 20.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4 y seed 1000.

## Capacidades

- Control robótico de bajo nivel: genera vectores de acción de 6 dimensiones para el robot SO-101 (so_follower), en lugar de texto.
- Entrada multimodal: acepta el estado del robot (6 valores) y tres imágenes RGB de 256x256 procedentes de las cámaras `finger`, `front` y `top`.
- Ejecución de la tarea entrenada: identifica un cubo rojo y lo coloca en un tubo blanco, reproduciendo el comportamiento demostrado en el dataset.
- Tool calling / function calling: no aplica; el modelo no es un asistente de lenguaje ni expone interfaces de herramientas.
- Capacidades de agente y razonamiento multi-paso: no aplica; el modelo genera acciones directamente a partir de las observaciones, sin razonamiento simbólico.
- Multilingüe: no disponible; la instrucción de tarea está en inglés y el modelo no está diseñado para generación de texto.
- Eficiencia de despliegue: al mantener congelados los encoders de visión y lenguaje, la inferencia es ligera y apta para hardware de consumo.

## Casos de uso

- Automatización de pick-and-place en entornos controlados: el modelo puede integrarse en un brazo SO-101 para recoger cubos rojos de posiciones aleatorias y colocarlos en tubos blancos. Es adecuado porque la tarea fue entrenada con variaciones de posición, y el rodillo de 30 FPS permite reaccionar en tiempo real.
- Reentrenamiento para nuevas tareas de manipulación: usando LeRobot, se puede tomar este fine-tuning como punto de partida para adaptarlo a otros objetos o recipientes. Al mantener congelados los encoders de visión y lenguaje, el reentrenamiento es rápido y consume pocos recursos.
- Investigación en aprendizaje por imitación: como referencia de fine-tuning de SmolVLA, permite validar metodologías en el framework LeRobot, por ejemplo comparar configuraciones de hiperparámetros o estrategias de entrenamiento.
- Robótica educativa: el modelo es adecuado para demostraciones en aulas o laboratorios con un brazo SO-101, gracias a su bajo coste computacional y a su despliegue en GPUs de consumo.
- Control de manipulación en laboratorios de química: en un laboratorio, el brazo puede tomar un vial rojo y colocarlo en un tubo blanco. Con un nuevo dataset, el modelo puede adaptarse a esta tarea manteniendo la misma arquitectura.
- Evaluación de rendimiento de VLA en hardware de consumo: para desarrolladores que necesitan medir la viabilidad de SmolVLA en GPUs tipo RTX 3060 o similares, este checkpoint sirve como carga de trabajo para medir latencia y consumo de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card indica explícitamente "No evaluation results have been provided for this policy yet".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 450.046.176 parámetros; con almacenamiento en 16 bits ocupa aproximadamente 0.9 GB. En inferencia, sumando las tres imágenes de 256x256 y el overhead del framework, se estima entre 2 y 4 GB de VRAM.
- GPU recomendadas: para inferencia, una NVIDIA RTX 3060 12 GB o superior es suficiente. Para entrenamiento, se recomienda RTX 4090, A100 o H100.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en una RTX 3060 12 GB y en GPUs más potentes.
- Opciones de despliegue: LeRobot (scripts de inferencia y entrenamiento) o PyTorch directo. No aplica vLLM, llama.cpp ni TGI, ya que el modelo no es un LLM de texto.
- Latencia y throughput: no disponible. El modelo fue entrenado para procesar entradas a 30 FPS, lo que sugiere que la inferencia debería ser en tiempo real en una GPU adecuada, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| SmolVLA (este fine-tuning) | 450.046.176 | no disponible | no disponible | Apache 2.0 | Hugging Face, LeRobot |
| SmolVLA base (`lerobot/smolvla_base`) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face, LeRobot |
| ACT (implementación LeRobot) | no disponible | no disponible | no disponible | Apache 2.0 | LeRobot |

No se han publicado resultados de benchmarks comparables en la información disponible. El blog de referencia sobre fine-tuning de SmolVLA en un SO-101 compara este modelo con ACT, pero sin datos numéricos verificables.

## Limitaciones y advertencias

- La tarea es muy específica: recoger el cubo rojo y colocarlo en el tubo blanco. El modelo puede fallar ante variaciones de color, iluminación, objetos nuevos u oclusiones no presentes en el dataset de entrenamiento.
- No se han proporcionado resultados de evaluación reales, por lo que no se conoce la tasa de éxito en el robot.
- Depende de la configuración exacta de las cámaras (`finger`, `front`, `top`) y de la calibración del robot; cambios en el hardware requieren recalibración o reentrenamiento.
- Al estar congelados los encoders de visión y lenguaje, el modelo no mejora su comprensión semántica general; solo la parte de acciones se adapta a la tarea.
- No es utilizable como modelo de texto ni como chatbot; su salida son acciones continuas de 6 dimensiones, no texto.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre la seguridad del robot y el despliegue recae en el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Takahisa5884/smolvla_so101_pick_red_cube_20260903_2_spark1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/Takahisa5884/so101_pick_red_cube_20260903_114501
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Blog sobre fine-tuning de SmolVLA para SO-101: https://ggando.com/blog/smolvla-so101/
