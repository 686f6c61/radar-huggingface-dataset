# tc-huang-mahjong/act_mahjong_v1_reach01_red

## Resumen

`act_mahjong_v1_reach01_red` es una política de imitación basada en Action Chunking with Transformers (ACT) entrenada con LeRobot para el robot `so101_follower`. El modelo resuelve una tarea de manipulación robótica muy concreta: señalar la ficha Red Dragon (dragón rojo) en un entorno de mahjong. Lo desarrolla el usuario `tc-huang-mahjong` y se publica en Hugging Face Hub con la librería `lerobot` y el pipeline `robotics`.

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación de precisión. El modelo consume el estado del robot (6 dimensiones) y dos cámaras RGB de 480x640 (frontal y de pinza), y produce un vector de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 1,7 GB. Es relevante como ejemplo de política robótica de código abierto entrenada con datos teleoperados, aunque su alcance es muy limitado: una única tarea, un único robot y sin resultados de evaluación publicados. No es un modelo de lenguaje ni un modelo multimodal general; es un controlador de política visual-motora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje; ventana de observación por frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; entrada visual y de estado, salida de acciones) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice secuencias de acciones (chunks) a partir de observaciones visuales y de estado. El modelo combina un codificador de imágenes (para las dos cámaras: `front_cam` y `gripper_cam`, ambas a 480x640) con un decodificador que genera un chunk de acciones de 6 dimensiones. La arquitectura sigue el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705).

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `tc-huang-mahjong/mahjong_v1_reach01_red_ovphysx_perturb_off5_mirabilis-mac`, compuesto por 500 episodios y 65.412 frames a 30 FPS. La tarea es "Point at the Red Dragon tile." La configuración de entrenamiento fue: 200.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se especifica el número total de tokens ni si hubo RLHF o DPO (no aplica en este paradigma de imitación supervisada). No se documentan innovaciones técnicas adicionales más allá del propio método ACT.

## Capacidades

- Control robótico visual-motor para la tarea específica de señalar la ficha Red Dragon en un entorno de mahjong.
- Predicción de chunks de acciones (6 dimensiones) a partir de estado del robot y dos cámaras RGB.
- Aprendizaje por imitación a partir de datos teleoperados.
- Integración con el ecosistema LeRobot para rollout y entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá de la percepción visual para control.

## Casos de uso

- Señalización de fichas de mahjong en un robot SO-101: el modelo ejecuta la tarea "Point at the Red Dragon tile" sobre el robot `so101_follower` con dos cámaras, usando `lerobot-rollout` con `--policy.path` apuntando a este repositorio.
- Demostración de aprendizaje por imitación con ACT: sirve como ejemplo reproducible de entrenamiento y despliegue de una política ACT con LeRobot, útil para docencia o validación de pipelines.
- Base para fine-tuning en tareas de manipulación similares: al ser un checkpoint ACT entrenado, puede servir como punto de partida para reentrenar con otros datasets de mahjong o de señalización.
- Investigación en robustez ante perturbaciones: el nombre del dataset incluye "perturb_off5", lo que sugiere entrenamiento con perturbaciones; puede usarse para estudiar robustez visual-motora.
- Validación de hardware SO-101: permite verificar la calibración de cámaras y pinza en un montaje físico antes de abordar tareas más complejas.
- Benchmark interno de políticas ACT: útil para comparar configuraciones de entrenamiento (pasos, batch, learning rate) en una tarea acotada y medible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y dos cámaras de 480x640, la inferencia es ligera y cabe en GPUs consumer de gama media (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; el entrenamiento se realizó con `--policy.device=cuda`, pero no se especifica el modelo de GPU utilizado.
- Cabe en GPU consumer: probablemente sí, dado el tamaño reducido del modelo, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte para `--strategy.type=base`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_mahjong_v1_reach01_red | 51.668.614 | no disponible | Señalar ficha Red Dragon (SO-101) | no disponible | Hugging Face Hub |
| Otras políticas ACT en LeRobot | no disponible | no disponible | Manipulación genérica | variable | Hugging Face Hub |
| Políticas Diffusion Policy | no disponible | no disponible | Manipulación genérica | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparables publicados para este modelo ni para alternativas concretas en la misma tarea, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser una política entrenada con un dataset acotado, puede sobreajustarse a las condiciones específicas de captura (iluminación, posición de cámara, fondo).
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica idioma; la tarea está limitada a "Point at the Red Dragon tile" y al robot `so101_follower` con las cámaras `front_cam` y `gripper_cam`.
- Restricciones de licencia para uso comercial: la licencia no está disponible ("More Information Needed"), por lo que no se puede garantizar su uso comercial.
- Caveats para producción: sin resultados de evaluación publicados, sin métricas de éxito, sin documentación de robustez ante perturbaciones reales; el repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria.
- El modelo no es un LLM ni un modelo multimodal general; no debe usarse para generación de texto, código o razonamiento.

## Enlaces

- Hugging Face: https://huggingface.co/tc-huang-mahjong/act_mahjong_v1_reach01_red
- Dataset: https://huggingface.co/datasets/tc-huang-mahjong/mahjong_v1_reach01_red_ovphysx_perturb_off5_mirabilis-mac
- Paper ACT: https://huggingface.co/papers/2304.13705
- arXiv ACT: https://arxiv.org/abs/2304.13705
- LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizar dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=tc-huang-mahjong/mahjong_v1_reach01_red_ovphysx_perturb_off5_mirabilis-mac
