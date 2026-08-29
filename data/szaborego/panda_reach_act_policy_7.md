# szaborego/panda_reach_act_policy_7

## Resumen

El modelo `szaborego/panda_reach_act_policy_7` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario szaborego y entrenada con el framework LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en tareas de manipulación. Este modelo concreto está especializado en la tarea de alcanzar un objetivo ("Reach the target") con un brazo robótico Panda, utilizando como entrada una imagen de cámara de 256x256 píxeles y un vector de estado de 6 dimensiones, y generando como salida un vector de acción de 3 dimensiones (posición del efector final).

Con 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto. Su relevancia radica en que demuestra la aplicación práctica de ACT en robótica real, integrado en el ecosistema LeRobot, y sirve como punto de partida para investigadores que quieran reproducir o adaptar políticas de imitación en sus propios robots. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso tanto académico como comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer con codificador de vision y decodificador de acciones |
| Parametros totales | 51.665.539 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arXiv:2304.13705. ACT combina un codificador de visión (para procesar la imagen de entrada) con un transformer que predice un chunk de acciones futuras, en lugar de una única acción. Esto reduce la acumulación de errores y mejora la estabilidad del control en tareas de manipulación. La entrada se compone de una imagen RGB de 256x256 píxeles y un vector de estado de 6 dimensiones (posición y orientación del efector final, probablemente). La salida es un vector de acción de 3 dimensiones, correspondiente a la posición cartesiana del efector final.

El entrenamiento se realizó con el dataset `szaborego/panda_reach_dataset_5k_ppo_0_02_1`, que contiene 5000 episodios y 509.671 frames a 20 FPS, todos para la tarea "Reach the target". La configuración de entrenamiento incluye 60.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. Se utilizó la versión 0.6.1 de LeRobot. No se especifica si se aplicaron técnicas de RLHF o DPO, ya que es un modelo de imitación pura.

## Capacidades

- Control robótico por imitación: genera acciones de 3 dimensiones (posición del efector final) a partir de observaciones de imagen y estado.
- Procesamiento de visión: acepta imágenes RGB de 256x256 píxeles como entrada principal.
- Predicción de chunks de acciones: genera secuencias de acciones futuras, lo que mejora la suavidad del movimiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot.
- No tiene capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico; es un modelo puramente de control motor.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como referencia para estudiar el rendimiento de ACT en tareas de alcance con un brazo Panda, permitiendo comparar variantes de arquitectura o hiperparámetros.
- Desarrollo de políticas de manipulación: puede adaptarse a tareas similares de alcanzar objetos en entornos controlados, sirviendo como punto de partida para fine-tuning con nuevos datos.
- Prototipado rápido en robótica: gracias a su tamaño reducido (51,7 M parámetros), puede ejecutarse en tiempo real en GPUs de gama media, facilitando pruebas en simuladores o robots reales.
- Educación y formación: útil para demostrar conceptos de aprendizaje por imitación y control basado en transformers en cursos de robótica.
- Benchmarking de frameworks: permite evaluar el rendimiento de LeRobot como herramienta de entrenamiento de políticas robóticas.
- Replicación de experimentos: investigadores pueden reproducir los resultados del paper ACT y verificar el comportamiento del modelo en su propio hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas de éxito en robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero dado el tamaño del modelo (51,7 M parámetros) y la entrada de imagen 256x256, se estima que requiere menos de 2 GB de VRAM en FP32, y menos de 1 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060) es suficiente para inferencia en tiempo real. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100).
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en la mayoría de GPUs consumer actuales.
- Opciones de despliegue: LeRobot (oficial), también puede exportarse a otros formatos si se convierte, pero no se mencionan vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, se espera una inferencia en el orden de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo repositorio o en la literatura consultada. Existen otros modelos ACT en el Hub de Hugging Face (por ejemplo, `szaborego/panda_reach_act_policy_3` y `szaborego/panda_reach_act_policy_test`), pero no se han publicado métricas comparativas. En general, ACT se compara con otros métodos de imitación como Diffusion Policy o Behavior Transformers, pero no hay datos concretos para este modelo específico.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado únicamente para la tarea "Reach the target" con un brazo Panda; no generaliza a otras tareas sin fine-tuning.
- Sin evaluación en robot real: no se han reportado resultados de éxito en hardware físico, por lo que su rendimiento real es desconocido.
- Dependencia de la configuración: requiere la misma disposición de cámaras y calibración que se usó durante el entrenamiento; cambios en iluminación, posición de cámara o robot pueden degradar el rendimiento.
- Riesgo de sobreajuste: al entrenarse con 5000 episodios de una sola tarea, puede memorizar trayectorias específicas y fallar ante variaciones no vistas.
- Sin capacidades de lenguaje: no puede interpretar instrucciones verbales ni interactuar con usuarios.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el funcionamiento en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/szaborego/panda_reach_act_policy_7
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/szaborego/panda_reach_dataset_5k_ppo_0_02_1
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=szaborego/panda_reach_dataset_5k_ppo_0_02_1
