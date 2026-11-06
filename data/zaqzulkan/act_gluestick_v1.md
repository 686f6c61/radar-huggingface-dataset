# zaqzulkan/act_gluestick_v1

## Resumen

`act_gluestick_v1` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705, y empaquetada en el formato de LeRobot. La desarrolla el usuario de Hugging Face `zaqzulkan` y resuelve una tarea muy concreta de manipulación: coger un pegamento en barra y colocarlo sobre un libro rojo. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un controlador visuomotor que mapea observaciones (estado articular de 6 dimensiones e imagen de muñeca de 3x480x640) a acciones de 6 dimensiones.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real sobre hardware modesto. Se entrenó con solo 10 episodios de teleoperación (6669 fotogramas a 30 FPS) sobre un robot `so_follower` con una única cámara de muñeca, lo que refleja el régimen de bajo número de datos típico de la imitación robótica actual.

Su relevancia es acotada pero útil: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento ACT, despliegue con `lerobot-rollout`) y como punto de partida para quien quiera replicar la tarea o adaptar la receta a otro objeto. La licencia Apache 2.0 facilita su reutilización, aunque la ausencia de evaluación real publicada limita las garantías de éxito en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje); ventana de observación definida por la configuración ACT de LeRobot, no disponible en la información |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica como cadena de texto en tiempo de ejecución) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La política combina un encoder visual (procesa la imagen de muñeca de 3x480x640), un encoder del estado articular (vector de 6 dimensiones) y un decoder transformer que emite secuencias de acciones de 6 dimensiones. La implementación concreta corresponde a LeRobot 0.6.2 con `policy.type=act`.

El entrenamiento se realizó durante 20.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, sobre el dataset `zaqzulkan/gluestick_v1` (10 episodios, 6669 fotogramas a 30 FPS, tarea "Pick up the glue stick and place it on the red book"). No se documenta en la información disponible el uso de RLHF, DPO ni aumentos de datos; se trata de imitación supervisada pura sobre teleoperación. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visuomotor de un robot `so_follower` a partir de una imagen de muñeca y el estado articular de 6 dimensiones.
- Predicción de chunks de acción de 6 dimensiones, adecuada para control continuo a 30 FPS.
- Ejecución de una única tarea de manipulación: coger un pegamento y colocarlo sobre un libro rojo.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni de generación de texto; la cadena de tarea solo se usa como condicionamiento de la política.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la imagen de muñeca.

## Casos de uso

- Replicación de la tarea de recogida y colocación: usar `lerobot-rollout` con `--policy.path=zaqzulkan/act_gluestick_v1` para ejecutar la política sobre un `so_follower` calibrado y verificar el comportamiento en el robot físico.
- Base para fine-tuning con nuevos objetos: partir de esta política y reentrenar con `lerobot-train` sobre un dataset propio de pocos episodios para adaptar la tarea a otro objeto o recipiente.
- Docencia y formación en imitación robótica: sirve como ejemplo completo y reproducible del flujo LeRobot (grabación, entrenamiento ACT, despliegue) con un coste computacional bajo.
- Pruebas de integración de hardware: validar la cadena cámara de muñeca, calibración del `so_follower` y latencia de control antes de escalar a tareas más complejas.
- Benchmark interno de políticas ligeras: comparar tiempos de inferencia y estabilidad de ACT frente a otras políticas de LeRobot sobre el mismo robot y dataset.
- Prototipado de automatización de pick-and-place en laboratorio: usar la política como línea base para tareas de recogida y colocación de objetos pequeños con un único brazo y una cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información; con 51,7 M de parámetros y pesos safetensors, la huella es del orden de cientos de MB, pero no se confirma en la documentación.
- GPU recomendadas: no disponible. El comando de entrenamiento de LeRobot usa `--policy.device=cuda`, lo que sugiere GPU NVIDIA, pero no se especifica modelo.
- Compatibilidad con GPU de consumo: probable por el tamaño del modelo, pero no confirmado en la información.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La captura de datos es a 30 FPS, pero no se publica la latencia de inferencia de la política.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas ACT o alternativas de imitación robótica con las que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Entrenada con solo 10 episodios y una única tarea; la generalización a otras posiciones, iluminación, objetos o robots del mismo tipo no está garantizada.
- Sin resultados de evaluación en robot real publicados; no hay tasa de éxito documentada.
- Depende de una cámara de muñeca con nombre y resolución exactos (`observation.images.wrist`, 3x480x640); cambios en la configuración de cámara invalidan la política.
- Requiere un robot `so_follower` calibrado y un puerto concreto; no es portable sin adaptación.
- Riesgo de sobreajuste al dataset pequeño y de fallos ante distracciones visuales no vistas en entrenamiento.
- No procesa lenguaje natural de forma general: la cadena de tarea solo condiciona la política entrenada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de garantías técnicas hace recomendable validar en el robot objetivo antes de cualquier despliegue.
- No se documentan sesgos demográficos ni de otro tipo, pero tampoco se analiza el comportamiento fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zaqzulkan/act_gluestick_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/zaqzulkan/gluestick_v1
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zaqzulkan/gluestick_v1
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
