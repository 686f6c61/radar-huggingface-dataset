# suzanne1989/hf_act_recordpolicy_bruce-3

## Resumen

`suzanne1989/hf_act_recordpolicy_bruce-3` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), entrenada con la librería LeRobot de Hugging Face y publicada en el Hub. No es un modelo de lenguaje: es un controlador robótico que, a partir de observaciones visuales y del estado de las articulaciones, predice secuencias cortas de acciones (chunks) para un robot manipulador de tipo `so_follower`. El modelo resuelve una tarea concreta de manipulación: "Grab the green duplo" (agarrar el bloque Duplo verde).

La arquitectura ACT, descrita en el paper arXiv:2304.13705, sustituye la predicción paso a paso por la predicción de fragmentos de acción, lo que reduce el error de acumulación y mejora la estabilidad en tareas de imitación. El modelo tiene 51.668.614 parámetros, consume dos cámaras (muñeca y estática) a 480x640 y produce acciones de dimensión 6. Se entrenó con 120 episodios y 38.452 fotogramas grabados a 30 FPS.

Es relevante como ejemplo reproducible de un pipeline completo de LeRobot: grabación de datos con teleoperación, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`. Su utilidad es acotada (una única tarea, un único robot), pero sirve como referencia práctica para quien quiera replicar el flujo de trabajo o adaptarlo a su propio hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se pasa como cadena de texto fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, con checkpoints) |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `wrist`, `static` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Dataset de entrenamiento | `suzanne1989/record-bruce` (120 episodios, 38.452 fotogramas, 30 FPS) |
| Tarea | "Grab the green duplo" |
| Pasos de entrenamiento | 50.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repositorio | 6,2 GB |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder diseñado para aprendizaje por imitación. El encoder procesa las observaciones (imágenes de las cámaras `wrist` y `static` junto con el vector de estado de 6 dimensiones) y el decoder genera un chunk de acciones de dimensión 6, en lugar de una sola acción por paso. Esta predicción por chunks mitiga el problema de acumulación de errores típico de las políticas reactivas y permite un control más suave. La implementación concreta es la de LeRobot 0.6.2, que incluye un `DataProcessorPipeline` para normalizar entradas y salidas.

El entrenamiento se realizó sobre el dataset `suzanne1989/record-bruce`, compuesto por 120 episodios teleoperados (38.452 fotogramas a 30 FPS) de la tarea "Grab the green duplo". Se ejecutaron 50.000 pasos con batch size 8, AdamW y learning rate 1e-05, semilla 1000. No se especifica en la información disponible si hubo aumentos de datos, regularización adicional ni composición detallada del dataset más allá del número de episodios y fotogramas.

## Capacidades

- Control robótico de manipulación: predice acciones de 6 dimensiones para un robot `so_follower`.
- Percepción visual multimodal: procesa simultáneamente dos cámaras RGB de 480x640 (`wrist` y `static`).
- Predicción por chunks de acción: genera secuencias cortas de acciones en lugar de pasos individuales.
- Aprendizaje por imitación a partir de datos teleoperados.
- Ejecución de una tarea concreta: "Grab the green duplo".
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- **Automatización de una celda de pick-and-place**: el modelo puede ejecutar la tarea de agarrar el bloque Duplo verde en un entorno controlado con el robot `so_follower`, usando las cámaras de muñeca y estática para localizar el objeto y planificar la acción de agarre.
- **Reproducción de experimentos de aprendizaje por imitación**: sirve como referencia para validar un pipeline completo de LeRobot (grabación, entrenamiento, despliegue) antes de escalar a tareas propias.
- **Base para fine-tuning en tareas similares**: al estar entrenado con 120 episodios y una tarea sencilla, puede reentrenarse con un dataset propio de manipulación de objetos pequeños y servir de punto de partida.
- **Docencia y formación en robótica**: útil en cursos o talleres donde se quiera mostrar el flujo de ACT con hardware asequible (SO-100/SO-101 y cámaras USB) sin necesidad de infraestructura pesada.
- **Pruebas de integración de hardware**: permite verificar la calibración de cámaras, puertos y cinemática del robot `so_follower` en un entorno real antes de desplegar políticas más complejas.
- **Evaluación comparativa de políticas**: puede usarse como línea base de ACT frente a otras políticas (Diffusion Policy, VQ-BeT) en la misma tarea y robot para medir tasas de éxito relativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada. Con 51,7 M de parámetros, el modelo es muy ligero y probablemente quepa en GPUs de consumo, pero no se confirma el consumo exacto.
- **GPU recomendadas**: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que implica una GPU NVIDIA, pero no se especifica modelo mínimo.
- **Compatibilidad con GPU de consumo**: no confirmada explícitamente; por el tamaño del modelo (51,7 M de parámetros) es plausible que funcione en GPUs de gama media, pero no hay dato oficial.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput**: no disponibles. El control opera a 30 FPS según la frecuencia de grabación del dataset, pero no se documenta la latencia de inferencia real.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `suzanne1989/hf_act_recordpolicy_bruce-3` | ACT | 51,7 M | no aplica | Agarrar bloque Duplo verde con `so_follower` | Apache 2.0 | Hugging Face Hub |
| Diffusion Policy (referencia del paper) | Política de difusión | no disponible | no aplica | Manipulación por imitación | según implementación | Repositorios de investigación |
| VQ-BeT (referencia) | Transformer con cuantización vectorial | no disponible | no aplica | Manipulación por imitación | según implementación | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- **Tarea única**: la política está entrenada exclusivamente para "Grab the green duplo"; no generaliza a otras tareas sin reentrenamiento.
- **Hardware específico**: diseñada para el robot `so_follower` con cámaras `wrist` y `static`; requiere que los nombres e índices de cámara coincidan con los de entrenamiento.
- **Sin evaluación publicada**: la model card indica que no hay resultados de éxito en robot real, por lo que se desconoce su tasa de éxito y robustez.
- **Riesgo de sobreajuste al entorno**: con solo 120 episodios, es probable que sea sensible a cambios de iluminación, posición de objetos o distractores.
- **Sin capacidades de lenguaje**: no procesa instrucciones en lenguaje natural más allá de la cadena de tarea fija; no sirve para aplicaciones conversacionales.
- **Licencia Apache 2.0**: permite uso comercial, pero el usuario debe verificar el cumplimiento de las dependencias de LeRobot y de los datos de entrenamiento.
- **Sin datos de sesgos**: no se documentan sesgos específicos, aunque al ser un modelo visual puede heredar sesgos de los datos de grabación (posiciones, colores, condiciones de iluminación).
- **Riesgo de alucinación**: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erróneas o inseguras en el robot; se recomienda supervisión y límites de seguridad físicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suzanne1989/hf_act_recordpolicy_bruce-3
- Archivos del repositorio: https://huggingface.co/suzanne1989/hf_act_recordpolicy_bruce-3/tree/main
- Dataset de entrenamiento: https://huggingface.co/datasets/suzanne1989/record-bruce
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=suzanne1989/record-bruce
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
