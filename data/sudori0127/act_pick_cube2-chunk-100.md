# sudori0127/act_pick_cube2-chunk-100

## Resumen

`act_pick_cube2-chunk-100` es una política de robótica entrenada con Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario `sudori0127` en Hugging Face usando la librería LeRobot de Hugging Face, y está especializado en una única tarea de manipulación: agarrar un cubo negro ("Grab the black cube") con un robot de tipo `so_follower` (SO-100/SO-101 de LeRobot).

No se trata de un modelo de lenguaje: es un policy de control visuomotor que consume el estado de las articulaciones (vector de 6 dimensiones) y dos cámaras (overhead y wrist, 480x640 RGB) y emite un vector de acción de 6 dimensiones a 30 FPS. Con 51.668.614 parámetros y un repo de 0,2 GB, es un modelo pequeño que puede ejecutarse en hardware modesto, pero su alcance es muy limitado: una sola tarea, un solo tipo de robot y un dataset de 51 episodios.

Es relevante como ejemplo práctico del flujo de trabajo de LeRobot para imitation learning en robótica de bajo coste: grabar demostraciones teleoperadas, entrenar un ACT y desplegarlo en un robot real. No obstante, al no incluir resultados de evaluación ni métricas de éxito, su utilidad como referencia es principalmente didáctica o como punto de partida para reentrenar con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; entrada visual y de estado, salida de acciones) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, en lugar de predecir una acción por paso, predice un chunk de acciones futuras (de ahí el sufijo `chunk-100` del nombre, que sugiere chunks de 100 pasos). La arquitectura combina un encoder visual (procesa las dos cámaras, `overhead` y `wrist`, a 480x640) con un transformer que fusiona las observaciones visuales y el estado de las articulaciones (`observation.state`, shape `(6,)`) para producir acciones de 6 dimensiones. El método se describe en el paper arXiv:2304.13705 y se implementa en LeRobot.

El entrenamiento se realizó con el dataset `sudori0127/pick-cube2`: 51 episodios, 22.099 frames a 30 FPS, una única tarea ("Grab the black cube"). La configuración reportada es de 100.000 pasos de entrenamiento, batch size 64, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.0. No se documenta composición del dataset más allá de los episodios ni si hubo aumentos de datos, RLHF/DPO (no aplica en imitation learning) u otras innovaciones técnicas. El robot objetivo es `so_follower`, con cámaras `overhead` y `wrist`.

## Capacidades

- Control visuomotor para una tarea de manipulación concreta: agarrar un cubo negro.
- Predicción de action chunks (secuencias cortas de acciones) en lugar de pasos individuales, lo que reduce el error de acumulación típico de políticas paso a paso.
- Entrada multimodal: estado de articulaciones (6 dimensiones) más dos flujos de imagen RGB (overhead y wrist) a 480x640.
- Salida de acciones de 6 dimensiones a 30 FPS, compatible con el robot `so_follower` de LeRobot.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Demostración educativa de imitation learning: usar el modelo y el dataset `pick-cube2` como ejemplo completo del flujo grabar-entrenar-desplegar de LeRobot, adecuado para talleres y tutoriales de robótica.
- Punto de partida para reentrenamiento: servir como inicialización o referencia para entrenar una política propia con `lerobot-train` sobre un dataset nuevo, cambiando la tarea y el robot.
- Prueba de concepto de manipulación pick-and-place: validar en un robot SO-100/SO-101 de bajo coste si la tarea de agarrar un cubo se ejecuta de forma fiable antes de escalar a tareas más complejas.
- Benchmark interno de hardware: medir latencia y throughput de un ACT de ~51,7 M de parámetros en GPUs de consumo (por ejemplo, RTX 4090) o en CPU, para dimensionar despliegues de robótica.
- Investigación en action chunking: comparar el comportamiento de chunks de 100 pasos frente a otras configuraciones de ACT o frente a políticas paso a paso en la misma tarea.
- Base para experimentos de generalización: evaluar cómo se degrada la política ante cambios de posición del cubo, iluminación o distracciones, ya que el autor no reporta resultados de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación (`No evaluation results have been provided for this policy yet.`), por lo que no hay tasas de éxito, número de ensayos ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 51,7 M de parámetros en precisión completa, el peso ronda los 0,2 GB, por lo que la huella de memoria es pequeña, pero no se documenta el consumo real incluyendo encoders visuales y buffers.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que indica soporte de GPU, pero no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? No se confirma en la información disponible; por el tamaño del modelo es plausible, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sudori0127/act_pick_cube2-chunk-100` | 51.668.614 | no aplica | Agarrar cubo negro con `so_follower` | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | Varía por dataset | varía | no disponible |
| Políticas Diffusion Policy en LeRobot | no disponible | no aplica | Varía por dataset | varía | no disponible |

No se dispone de datos concretos de modelos comparables en la información proporcionada; la comparativa se limita a señalar la categoría (políticas de imitation learning en LeRobot) sin cifras verificables.

## Limitaciones y advertencias

- Modelo de un solo propósito: entrenado exclusivamente para la tarea "Grab the black cube"; no generaliza a otras tareas sin reentrenamiento.
- Dataset muy pequeño: 51 episodios y 22.099 frames, lo que limita la robustez ante variaciones de posición, iluminación o distracciones.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Dependencia del hardware: requiere un robot `so_follower` y cámaras `overhead` y `wrist` con los nombres e índices exactos usados en el entrenamiento; cualquier cambio en la configuración invalida la política.
- Riesgo de sobreajuste al entorno de grabación: al no documentarse variaciones en el dataset, es probable que la política falle fuera de las condiciones de captura.
- Sin capacidades de lenguaje, tool calling ni agentes: no debe confundirse con un modelo generativo de texto.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; verificar el cumplimiento de la licencia del dataset `sudori0127/pick-cube2` si se redistribuye.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudori0127/act_pick_cube2-chunk-100
- Dataset de entrenamiento: https://huggingface.co/datasets/sudori0127/pick-cube2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sudori0127/pick-cube2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
