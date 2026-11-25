# Umang-Bansal/act_so101_pickbox_combined

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `Umang-Bansal/act_so101_pickbox_combined`, es una política entrenada con LeRobot para el robot `so_follower` (SO-101) que resuelve una única tarea: coger un bloque y depositarlo en una caja.

El modelo consume observaciones multimodales (estado articular de 6 dimensiones y dos cámaras RGB de 480x640, frontal y de muñeca) y produce acciones de 6 dimensiones. Con 51.668.614 parámetros, es un modelo compacto pensado para inferencia en tiempo real a 30 FPS sobre hardware modesto, no para despliegue en servidores de gran escala.

Su relevancia es práctica y acotada: sirve como referencia reproducible de un pipeline completo de imitación con LeRobot (grabación de 121 episodios, entrenamiento de 50.000 pasos y despliegue con `lerobot-rollout`) y como punto de partida para quien quiera replicar la tarea o adaptar la receta a otro robot de la familia SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no usa contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La política sigue la formulación ACT del paper 2304.13705: un transformer que toma como entrada el estado del robot y las imágenes de las cámaras, y predice un chunk de acciones futuras en lugar de una sola acción por paso. Esto mitiga el problema de compounding error típico de las políticas paso a paso y permite un control más suave. La entrada visual son dos cámaras a 480x640 (frontal y de muñeca), y el estado es un vector de 6 dimensiones que corresponde a las articulaciones del SO-101; la salida es también de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `Umang-Bansal/so101_pickbox_combined`: 121 episodios, 34.506 frames a 30 FPS, una única tarea ("Pick up the block and place it in the box"). La configuración fue de 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta uso de RLHF, DPO ni aumentos de datos; es aprendizaje por imitación supervisado puro sobre teleoperación.

## Capacidades

- Control robótico de manipulación: genera comandos de 6 dimensiones para el robot SO-101 (`so_follower`).
- Percepción multimodal: procesa simultáneamente estado articular y dos flujos de vídeo RGB de 480x640.
- Predicción de chunks de acciones, lo que proporciona trayectorias más estables que políticas de un solo paso.
- Ejecución en tiempo real a 30 FPS, coherente con la frecuencia de grabación del dataset.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo "thinking", visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la tarea "coger el bloque y dejarlo en la caja" sobre un SO-101 real, útil para validar montajes, calibraciones y cámaras antes de escalar a tareas más complejas.
- Reproducción de un pipeline de imitación completo: sirve como ejemplo end-to-end (dataset de 121 episodios, entrenamiento de 50.000 pasos y despliegue con `lerobot-rollout`) para equipos que quieran aprender LeRobot sin partir de cero.
- Base para fine-tuning en tareas similares: al ser un checkpoint ACT entrenado sobre SO-101, se puede reentrenar con un dataset propio de la misma morfología y reutilizar la receta de hiperparámetros.
- Benchmark interno de hardware: al ser un modelo de 51,7 M de parámetros, permite medir latencia y throughput de inferencia en GPUs consumer y en CPU antes de invertir en modelos mayores.
- Docencia y demostraciones: tarea única, dataset pequeño y comando de rollout reproducible lo hacen adecuado para talleres de robótica de imitación.
- Pruebas de robustez perceptual: permite evaluar cómo afectan cambios de iluminación, posición de objetos o distracciones a una política ACT concreta, ya que el autor no ha publicado evaluación y el usuario puede generarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de trials/successes vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la VRAM vendrá dominada por los buffers de las dos cámaras a 480x640 y el grafo de inferencia, no por el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060/4060 o superior es holgada. A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida, aunque la latencia a 30 FPS debe validarse en el hardware concreto.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=Umang-Bansal/act_so101_pickbox_combined`; también es posible cargar la política desde Python con la API de LeRobot. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput estimados: no disponible; el autor no publica mediciones. El objetivo de diseño es 30 FPS, igual que la frecuencia del dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_pickbox_combined (este) | 51,7 M | estado 6D + 2 cámaras 480x640 | pick-and-place SO-101 | apache-2.0 | Hugging Face (12 descargas) |
| ACT original (paper 2304.13705) | no disponible en la informacion | no disponible | manipulación ALOHA | no disponible en la informacion | paper + código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, SmolVLA) | no disponible en la informacion | no disponible | manipulación genérica | no disponible en la informacion | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría y formato.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con 121 episodios de una única tarea y un único operador, la política hereda los sesgos de posición, iluminación y estilo de teleoperación del dataset; probablemente generaliza mal fuera de esa distribución.
- Riesgo de alucinación: en el sentido de ejecutar acciones no válidas o inseguras ante observaciones fuera de distribución; no hay evaluación publicada que cuantifique la tasa de fallo.
- Limitaciones de contexto o idioma: no aplica como modelo de lenguaje; la "tarea" se pasa como cadena de texto (`--task="Pick up the block and place it in the box"`) pero no hay comprensión lingüística general.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificación, pero el usuario debe cumplir las licencias de LeRobot y de las dependencias, y asumir la responsabilidad de seguridad en el robot real.
- Caveats para producción: no hay resultados de éxito publicados; requiere calibración de cámaras y robot, y los nombres de cámara deben coincidir exactamente con las claves de observación (`observation.images.front`, `observation.images.wrist`). El repo ocupa 3,1 GB, mayoritariamente por checkpoints y artefactos, no por los pesos del modelo.
- Fecha de creación del repo: 2026-11-24; verificar compatibilidad con la versión actual de LeRobot antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Umang-Bansal/act_so101_pickbox_combined
- Dataset de entrenamiento: https://huggingface.co/datasets/Umang-Bansal/so101_pickbox_combined
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Umang-Bansal/so101_pickbox_combined
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
