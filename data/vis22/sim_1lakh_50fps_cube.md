# vis22/sim_1lakh_50fps_cube

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `vis22/sim_1lakh_50fps_cube`, es una política ACT entrenada con LeRobot sobre un robot simulado de tipo `piper_mujoco` para la tarea "pick the cube and place it in the bin".

El modelo consume el estado del robot (vector de 7 dimensiones) y dos flujos de imagen RGB de 480x640 (cámara global y cámara de pinza), y produce un vector de acción de 7 dimensiones. Con 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real en entornos de investigación y prototipado robótico.

Es relevante ahora porque forma parte del ecosistema LeRobot de Hugging Face, que estandariza el entrenamiento, publicación y despliegue de políticas robóticas en formato safetensors, facilitando la reproducibilidad y la integración con hardware real o simulado. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (7,), `observation.images.cam_global` (3, 480, 640), `observation.images.cam_gripper` (3, 480, 640) |
| Salidas | `action` (7,) |
| Tipo de robot | `piper_mujoco` |
| Cámaras | `cam_global`, `cam_gripper` |
| Biblioteca | lerobot 0.6.1 |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder que, en lugar de predecir una única acción por paso de tiempo, predice un chunk de acciones futuras (típicamente varias decenas de pasos) a partir de la observación actual. Esta estrategia de "action chunking" mitiga el problema de acumulación de errores que afecta a las políticas de imitación paso a paso y permite un control más suave. La arquitectura incorpora un mecanismo de atención sobre las observaciones visuales y el estado propioceptivo, y utiliza una cabeza de predicción de acciones condicionada por el chunk.

El entrenamiento se realizó sobre el dataset `vis22/sim_50fps_v2_cube`, compuesto por 50 episodios y 47.172 fotogramas a 50 FPS, con la tarea "pick the cube and place it in the bin". La configuración reportada incluye 200.000 pasos de entrenamiento, batch size de 8, optimizador AdamW, learning rate de 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en una política de imitación supervisada.

## Capacidades

- Control robótico de manipulación: predice acciones de 7 grados de libertad (posición y orientación de la pinza) a partir de observaciones visuales y propioceptivas.
- Percepción visual multimodal: procesa simultáneamente una cámara global y una cámara montada en la pinza, ambas a 480x640.
- Ejecución de tareas de pick-and-place: entrenado específicamente para "pick the cube and place it in the bin".
- Aprendizaje por imitación: reproduce comportamientos aprendidos de datos de teleoperación.
- Inferencia en tiempo real: compatible con el bucle de rollout de LeRobot a 30 FPS en las cámaras.
- Integración con el ecosistema LeRobot: soporta `lerobot-rollout` y `lerobot-train`.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modo thinking, al no ser un modelo de lenguaje.

## Casos de uso

- Automatización de pick-and-place en simulación: el modelo se ejecuta sobre el robot `piper_mujoco` en MuJoCo para validar políticas de manipulación antes de transferirlas a hardware real, aprovechando su entrenamiento específico en esa tarea.
- Prototipado rápido de políticas de imitación: investigadores pueden partir de este checkpoint y fine-tuning con sus propios datos de teleoperación usando `lerobot-train`, reduciendo el tiempo de desarrollo.
- Benchmark de referencia para ACT: sirve como línea base reproducible (semilla 1000, 200k pasos) para comparar variantes de arquitectura o datasets en tareas de cubo y contenedor.
- Docencia y formación en robótica: ejemplo completo y ligero (0,2 GB) para enseñar el flujo completo de LeRobot, desde la grabación de datos hasta el despliegue.
- Validación de pipelines de datos: al estar entrenado sobre un dataset público con 47.172 fotogramas a 50 FPS, permite comprobar la corrección de pipelines de preprocesado y aumentación de datos robóticos.
- Integración en entornos de investigación con hardware Piper: el modelo puede desplegarse en un robot Piper real (adaptando el tipo de robot y los índices de cámara) para experimentos de manipulación con dos vistas.
- Evaluación de robustez visual: al depender de dos cámaras, permite estudiar el impacto de oclusiones, cambios de iluminación o desalineación de cámaras en políticas de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,67 millones de parámetros en safetensors (aproximadamente 0,2 GB en precisión completa), la VRAM necesaria es inferior a 1 GB para los pesos; el consumo real vendrá dominado por los buffers de las imágenes de entrada (dos flujos de 3x480x640) y las activaciones del transformer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se recomienda NVIDIA RTX 3060 o superior para inferencia cómoda. Para entrenamiento, se recomienda RTX 4090, A100 o H100 por el batch size y los 200.000 pasos.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4060, etc.) con VRAM suficiente para los buffers de imagen.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch y dispositivo CUDA o CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. La model card no reporta latencia ni FPS de inferencia; las cámaras se configuran a 30 FPS en el ejemplo de rollout.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vis22/sim_1lakh_50fps_cube` (ACT) | 51,67 M | ACT, imitación | Estado (7,) + 2 imágenes 480x640 | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | no disponible | ACT, imitación | Depende del dataset | Apache 2.0 (típico) | Hugging Face |
| Políticas Diffusion Policy | no disponible | Difusión, imitación | Depende del dataset | varía | Hugging Face / repos |
| Políticas VLA (p. ej. OpenVLA) | del orden de miles de millones | VLA, lenguaje + visión | Contexto de lenguaje + imágenes | varía | Hugging Face |

No se dispone de datos de rendimiento comparativo (tasas de éxito, latencia) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sin resultados de evaluación: la model card no reporta tasa de éxito ni número de ensayos, por lo que no se puede afirmar su fiabilidad en producción.
- Especialización estrecha: entrenado únicamente para la tarea "pick the cube and place it in the bin" sobre un robot `piper_mujoco`; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Dependencia de la configuración de cámaras: los nombres y la resolución de las cámaras (`cam_global`, `cam_gripper`, 480x640) deben coincidir exactamente con los del entrenamiento; cualquier cambio invalida la política.
- Dominio simulado: el entrenamiento se realizó en simulación (MuJoCo), por lo que el gap sim-to-real puede degradar el rendimiento en hardware físico.
- Dataset pequeño: 50 episodios y 47.172 fotogramas son una base limitada; la diversidad de posiciones, iluminación y distractores es probablemente escasa.
- Riesgo de sobreajuste: 200.000 pasos con batch size 8 y learning rate 1e-5 sobre un dataset reducido puede provocar sobreajuste a las trayectorias de demostración.
- Sin capacidades de lenguaje: no soporta instrucciones en lenguaje natural, tool calling ni razonamiento simbólico.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad del despliegue recae en el integrador.
- Sesgos: no documentados; en robótica, los sesgos provienen de la distribución de demostraciones (posiciones, objetos y condiciones limitadas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/sim_1lakh_50fps_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/sim_50fps_v2_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/sim_50fps_v2_cube
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
