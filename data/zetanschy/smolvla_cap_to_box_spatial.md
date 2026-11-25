# zetanschy/smolvla_cap_to_box_spatial

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación. Esta ficha concreta, `zetanschy/smolvla_cap_to_box_spatial`, es un ajuste fino del modelo base `lerobot/smolvla_base` realizado por el usuario zetanschy para una tarea específica de manipulación: colocar un tapón en cajas dispuestas en una cuadrícula, con instrucciones espaciales variables (posición de fila y columna). El modelo consume el estado del robot y tres cámaras (256x256) y produce comandos de acción de 6 dimensiones.

El modelo resuelve el problema de llevar un VLA preentrenado a una tarea concreta de laboratorio con pocos datos (202 episodios, 72.823 frames a 30 FPS), demostrando el flujo típico de LeRobot: preentrenamiento generalista seguido de ajuste fino con un dataset propio. Su relevancia radica en que SmolVLA está pensado para desplegarse en hardware de consumo, lo que abarata la experimentación en robótica de imitación.

Con 450 millones de parámetros y licencia Apache 2.0, el modelo es un artefacto de investigación reproducible más que un producto generalista. No se han publicado resultados de evaluación en la información disponible, por lo que su rendimiento real en el robot debe validarse empíricamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con codificador visual y decodificador de acciones |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto que combina un codificador visual con un modelo de lenguaje para generar acciones motoras condicionadas por instrucciones en lenguaje natural. La arquitectura sigue el diseño presentado en el paper arXiv:2506.01844, orientado a reducir coste computacional manteniendo un rendimiento competitivo frente a VLA de mayor tamaño, y a permitir despliegue en hardware de consumo.

Este checkpoint concreto se ha ajustado por imitación supervisada sobre el dataset `zetanschy/cap_to_box_real_spatial`, compuesto por 202 episodios y 72.823 frames a 30 FPS. La tarea consiste en colocar un tapón en una caja concreta de una cuadrícula, con cuatro variantes de instrucción que combinan fila (superior, media, inferior) y posición (izquierda, segunda por la izquierda, tercera por la izquierda, derecha). El entrenamiento usó 20.000 pasos, batch de 64, optimizador AdamW, learning rate 1e-4 y semilla 1000, con LeRobot 0.6.1. No se documenta uso de RLHF ni DPO; se trata de aprendizaje por imitación puro sobre demostraciones teleoperadas.

El modelo consume `observation.state` de forma (6,), tres imágenes de (3, 256, 256) y produce una acción de forma (6,). El robot objetivo es `so_follower` (SO-100/101 de LeRobot) con cámaras `front` y `grip`.

## Capacidades

- Control robótico de manipulación por imitación: genera comandos de acción de 6 grados de libertad a partir de observaciones visuales y de estado.
- Seguimiento de instrucciones espaciales en lenguaje natural: distingue entre posiciones de fila y columna en una cuadrícula de cajas.
- Fusión multimodal: integra tres cámaras (vista frontal y de pinza) con el estado articular del robot.
- Ejecución en bucle cerrado a 30 FPS sobre el robot SO-100/101 mediante `lerobot-rollout`.
- Ajuste fino reproducible: el flujo de entrenamiento con `lerobot-train` está documentado y es replicable.
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, visión generalista, audio ni modo thinking; el modelo está especializado en la tarea entrenada.

## Casos de uso

- Manipulación pick-and-place en laboratorio: colocar objetos en posiciones discretas de una cuadrícula siguiendo instrucciones espaciales, útil para experimentos de robótica de imitación con bajo presupuesto.
- Reproducción de experimentos de investigación: sirve como referencia de ajuste fino de SmolVLA sobre un dataset pequeño, permitiendo comparar metodologías de entrenamiento.
- Base para transferencia a tareas similares: al derivar de `lerobot/smolvla_base`, puede reajustarse con nuevos datasets de manipulación manteniendo el pipeline de LeRobot.
- Docencia y formación en robótica: el flujo completo (grabación, entrenamiento, rollout) es accesible en hardware de consumo, adecuado para cursos prácticos de aprendizaje por imitación.
- Pruebas de robustez espacial: las cuatro variantes de instrucción permiten evaluar la sensibilidad del modelo a cambios de posición del objetivo.
- Prototipado de pipelines de control: integrable en scripts de `lerobot-rollout` para validar latencia y estabilidad de políticas VLA en el robot real antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 450 M de parámetros, en FP32 ocuparía aproximadamente 1,8 GB de pesos, y en FP16 alrededor de 0,9 GB, sin contar activaciones ni buffers de imagen.
- GPU recomendadas: no se especifican; SmolVLA está diseñado para hardware de consumo, por lo que una GPU consumer con suficiente VRAM para el modelo y las tres cámaras debería bastar.
- Cabe en GPU consumer: sí, según la descripción del modelo base (diseñado para hardware de consumo), aunque no se detalla el mínimo exacto.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de CUDA mediante `--policy.device=cuda` en entrenamiento. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles; el control opera a 30 FPS según el dataset, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zetanschy/smolvla_cap_to_box_spatial | 450 M | no disponible | Manipulación cap-to-box | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA generalista base | Apache 2.0 | Hugging Face |
| Otros VLA de la familia LeRobot | no disponible | no disponible | Manipulación | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo solo se ha entrenado para la tarea cap-to-box con cuatro instrucciones espaciales concretas; no generaliza a otras tareas sin reajuste.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real documentadas, por lo que su fiabilidad es desconocida.
- Dependencia del hardware: requiere un robot SO-100/101 (`so_follower`) y una configuración de cámaras concreta (tres vistas de 256x256); cambios de montaje o iluminación pueden degradar el rendimiento.
- Riesgo de sobreajuste al dataset: con 202 episodios y 20.000 pasos de entrenamiento, es plausible un sobreajuste a posiciones y condiciones de recogida de datos.
- Sesgos: no documentados, pero al derivar de un dataset de laboratorio concreto puede heredar sesgos de posicionamiento y condiciones de iluminación.
- Alucinación: en un modelo de acción, el equivalente es la generación de comandos inválidos o inseguros; no hay salvaguardas documentadas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su despliegue en producción sin validación previa.
- Idiomas: no se especifica el soporte multilingüe de las instrucciones; las tareas están en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zetanschy/smolvla_cap_to_box_spatial
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/zetanschy/cap_to_box_real_spatial
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zetanschy/cap_to_box_real_spatial
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
