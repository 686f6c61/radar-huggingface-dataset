# suzanne1989/hf_act_recordpolicy_bruce

## Resumen

`hf_act_recordpolicy_bruce` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario `suzanne1989` en Hugging Face. No es un modelo de lenguaje: es un controlador visomotor entrenado para ejecutar una tarea física concreta ("Grab the green duplo") sobre un robot `so_follower` (SO-100/SO-101 de LeRobot) equipado con dos cámaras, una en la muñeca y otra estática. El modelo consume el estado articular de 6 dimensiones y dos imágenes RGB de 480x640, y produce un vector de acción de 6 dimensiones.

El modelo se ha entrenado con LeRobot 0.6.2 a partir de un dataset propio de 50 episodios y 16.575 fotogramas a 30 FPS, durante 25.000 pasos con batch de 8 y learning rate de 1e-5. Con 51,67 millones de parámetros, es un modelo compacto que cabe holgadamente en cualquier GPU consumer, pero cuya utilidad está estrictamente acotada al robot, la cámara y la tarea con los que fue entrenado.

Su relevancia es la de un ejemplo reproducible de flujo completo de imitation learning con LeRobot: grabación de datos con teleoperación, entrenamiento de una política ACT y despliegue en robot real mediante `lerobot-rollout`. No aporta innovaciones de arquitectura respecto al ACT original (Zhao et al., 2023) y no incluye resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica como cadena fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 3,7 GB, incluye checkpoints) |

## Arquitectura y entrenamiento

ACT es un transformer que predice *chunks* de acciones (varios pasos futuros de una vez) en lugar de una acción por inferencia, lo que reduce el error de acumulación y suaviza el control. La política combina un backbone visual (procesa las dos cámaras de 3x480x640) con el estado proprioceptivo de 6 dimensiones, y un decoder que genera el vector de acción de 6 dimensiones. La implementación concreta es la de LeRobot (`policy.type=act`), sin modificaciones documentadas respecto a la referencia.

El entrenamiento se realizó sobre el dataset `suzanne1989/record-bruce`: 50 episodios, 16.575 fotogramas a 30 FPS, una única tarea ("Grab the green duplo"), con robot `so_follower` y cámaras `wrist` y `static`. Configuración: 25.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000, LeRobot 0.6.2. No se documenta composición del dataset, aumentación de datos, ni uso de RLHF/DPO (no aplica en imitation learning). El repo incluye checkpoints intermedios (se observa al menos `checkpoint_050000` en el historial de la variante `-3`).

## Capacidades

- Control visomotor de un robot `so_follower` de 6 grados de libertad para la tarea "Grab the green duplo".
- Fusión de dos vistas de cámara (muñeca y estática) a 480x640 y 30 FPS con el estado articular.
- Predicción de chunks de acciones, lo que permite movimiento continuo y estable.
- Ejecución autónoma mediante `lerobot-rollout` con `--strategy.type=base` y duración configurable.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni modo *thinking*; la tarea se pasa como cadena fija al runner.
- No incluye visión general: las cámaras son entradas de control, no un modelo VLM.

## Casos de uso

- Reproducción de un pipeline de imitation learning: sirve como referencia completa (dataset, config, pesos, comando de rollout) para validar la instalación de LeRobot y el flujo de entrenamiento en un robot SO-100/SO-101.
- Manipulación pick-and-place de objetos tipo bloque Duplo en entornos de laboratorio: el modelo ejecuta la tarea de agarre sobre el objeto verde con el que fue entrenado, útil para experimentos controlados de agarre.
- Base para *fine-tuning* con nuevos datasets: al ser una política ACT estándar de LeRobot, se puede reentrenar con `lerobot-train` sobre datos propios y comparar curvas de aprendizaje.
- Benchmark interno de hardware robótico: permite medir latencia de inferencia y throughput de una política de 51,7 M de parámetros en distintas GPUs (RTX 4090, A100) con dos streams de vídeo a 30 FPS.
- Docencia y demos de robótica: el modelo y su dataset asociado permiten mostrar el ciclo completo teleoperación-grabación-entrenamiento-despliegue en talleres.
- Pruebas de integración de `lerobot-rollout` en CI: valida que el CLI, la configuración de cámaras y el robot se comunican correctamente antes de entrenar políticas más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía y declara explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito en robot real, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,7 M de parámetros; en la práctica el cuello de botella es el procesamiento de dos imágenes de 480x640 a 30 FPS, no el peso del modelo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; RTX 3060/4060 en adelante son suficientes. A100/H100 no aportan ventaja significativa para este tamaño.
- Cabe en GPU consumer: sí, en cualquier RTX de la serie 30 o 40, e incluso en GPUs de portátil con 4 GB.
- Despliegue: `lerobot-rollout` (CLI de LeRobot) sobre PyTorch/CUDA; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El modelo debe sostener 30 FPS de control; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `suzanne1989/hf_act_recordpolicy_bruce` | 51,7 M | estado 6D + 2 cámaras 480x640 | "Grab the green duplo" | apache-2.0 | Hugging Face, 25 descargas |
| ACT original (Zhao et al., 2023) | no disponible | estado + cámaras | varias tareas ALOHA | no disponible | paper y código de referencia |
| Otras políticas LeRobot (Diffusion Policy, SmolVLA) | no disponible en esta búsqueda | estado + cámaras | múltiples tareas | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, entradas y licencia.

## Limitaciones y advertencias

- Especialización extrema: solo ejecuta la tarea "Grab the green duplo" con el robot, cámaras y disposición física del dataset de entrenamiento; cambiar la posición de la cámara, la iluminación o el objeto degrada el comportamiento sin garantías.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que no se puede afirmar robustez ni generalización.
- Dataset pequeño: 50 episodios y 16.575 fotogramas son insuficientes para cubrir variaciones de posición, iluminación o distractores; riesgo alto de sobreajuste.
- Riesgo de alucinación en el sentido de acciones incorrectas: el modelo puede generar trayectorias no válidas ante entradas fuera de distribución, con riesgo físico para el robot y el entorno.
- Sesgos: no documentados; el dataset es de un único operador y una única tarea, lo que puede incorporar sesgos de estilo de teleoperación.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Dependencia de LeRobot 0.6.2 y de la API `lerobot-rollout`; cambios de versión pueden romper la compatibilidad de configuración y claves de observación.
- Los nombres de cámara (`wrist`, `static`) deben coincidir exactamente con las claves de observación del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suzanne1989/hf_act_recordpolicy_bruce
- Dataset de entrenamiento: https://huggingface.co/datasets/suzanne1989/record-bruce
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=suzanne1989/record-bruce
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Variante del modelo: https://huggingface.co/suzanne1989/hf_act_recordpolicy_bruce-5
- Variante del modelo: https://huggingface.co/suzanne1989/hf_act_recordpolicy_bruce-3
