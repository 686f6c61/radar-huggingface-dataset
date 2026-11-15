# taku-y/act_cube

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. El modelo `taku-y/act_cube` es una política concreta entrenada con este método mediante la librería LeRobot de Hugging Face, sobre un robot de tipo `so_follower` (SO-100/SO-101) con una única cámara frontal.

El problema que resuelve es acotado y específico: ejecutar la tarea "Move the gripper above the black cube" a partir de observaciones de estado articular (6 dimensiones) e imagen RGB de 240x320 píxeles, produciendo comandos de acción de 6 dimensiones. No es un modelo de lenguaje ni un modelo fundacional generalista: es un checkpoint de política visomotora entrenado sobre un dataset propio de 20 episodios y 7.328 fotogramas a 30 FPS.

Su relevancia es práctica para quien trabaje con robots de bajo coste y flujos de imitación: sirve como ejemplo reproducible de entrenamiento ACT con LeRobot 0.6.1, con hiperparámetros documentados (30.000 pasos, batch 8, AdamW, LR 1e-05) y un pipeline de despliegue directo mediante `lerobot-rollout`. El repositorio es pequeño (0,2 GB) y la licencia Apache 2.0 facilita su reutilización y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para aprendizaje por imitación (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visomotora con observaciones de estado e imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitar demostraciones teleoperadas prediciendo bloques de acciones futuras en lugar de una sola acción por paso. La política combina un codificador visual (procesa la imagen frontal de 3x240x320) con el estado articular del robot (vector de 6 dimensiones) y genera un vector de acción de 6 dimensiones. El "chunking" de acciones mitiga el error de compounding y suaviza el control, y el método original introduce un mecanismo de agregación temporal (temporal ensembling) para combinar predicciones solapadas.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `taku-y/record-cube-20261115_20261115_131116`: 20 episodios, 7.328 fotogramas a 30 FPS, una única tarea ("Move the gripper above the black cube") y una sola cámara (`front`). La configuración documentada es de 30.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el número de tokens ni composición de dataset más allá de lo indicado, ni si hubo etapas de RLHF/DPO (no aplica en este paradigma de imitación supervisada).

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de imagen frontal y estado articular.
- Ejecución de una tarea concreta de pick-and-place simplificada: posicionar la pinza por encima de un cubo negro.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas ni entorno simulado.
- Predicción de chunks de acción, lo que aporta suavidad y robustez frente a errores acumulados.
- Integración nativa con el ecosistema LeRobot (entrenamiento, evaluación y despliegue vía CLI).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código ni capacidades multilingües: es una política robótica, no un modelo de lenguaje.

## Casos de uso

- Reproducción de la tarea de referencia: ejecutar la política sobre un SO-100/SO-101 con cámara frontal para mover la pinza sobre un cubo negro, usando `lerobot-rollout` con `--policy.path=taku-y/act_cube` y la tarea indicada.
- Base para fine-tuning en tareas similares: reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio de manipulación de objetos pequeños, partiendo de esta configuración como referencia de hiperparámetros.
- Docencia y formación en imitación robótica: ejemplo completo y reproducible de pipeline LeRobot (grabación, entrenamiento, despliegue) con un coste computacional y de datos muy bajo (20 episodios, 0,2 GB).
- Prototipado rápido de políticas visomotoras: validar la infraestructura de robot, cámaras y calibración antes de escalar a datasets mayores.
- Benchmark interno de hardware de bajo coste: comparar tasas de éxito y latencia entre distintas configuraciones de cámara o brazos SO dentro de un mismo laboratorio.
- Punto de partida para investigación en chunking de acciones: analizar el efecto del tamaño de chunk, el ensembling temporal y el número de demostraciones en tareas de manipulación sencillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros, el checkpoint en fp32 ocupa aproximadamente 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100); también es viable en CPU para inferencia a baja frecuencia, aunque no se documentan latencias.
- Cabe en GPU consumer: sí, en prácticamente cualquier modelo reciente (GTX 1650 en adelante), dado el reducido tamaño del modelo.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch y CUDA; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según el dataset de entrenamiento, pero no se publican mediciones de latencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observaciones | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| taku-y/act_cube (ACT) | 51,7 M | Estado 6D + imagen 3x240x320 | Manipulación (mover pinza sobre cubo) | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT genéricas en LeRobot Hub | Variable (típicamente decenas de millones) | Depende del dataset | Manipulación variada | Generalmente Apache 2.0 | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | Variable | Depende del dataset | Manipulación visomotora | Generalmente Apache 2.0 | Hugging Face |
| Políticas VLA tipo OpenVLA / π0 | Miles de millones | Contexto multimodal amplio | Manipulación generalista | Varía (a menudo restrictiva) | Hugging Face / repos públicos |

No se dispone de datos comparativos de rendimiento (tasas de éxito, latencia) entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, tipo de observación, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea y un único entorno; no generaliza a otras tareas, objetos o disposiciones sin reentrenamiento.
- Dataset muy reducido: 20 episodios y 7.328 fotogramas, lo que limita la robustez frente a variaciones de iluminación, posición de objetos o distracciones.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que el rendimiento real es desconocido.
- Dependencia de hardware concreto: asume robot `so_follower`, cámara `front` y claves de observación específicas; cualquier cambio de configuración requiere adaptación.
- Riesgo de sobreajuste al entorno de grabación y de fallos ante cambios de cámara, calibración o fondo.
- Sin capacidades de lenguaje, razonamiento ni tool calling; no debe emplearse fuera del contexto robótico para el que fue entrenado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el paper de ACT y LeRobot según indica la model card.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: no aplican en el sentido habitual, pero sí existe riesgo de comportamiento errático fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taku-y/act_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/taku-y/record-cube-20261115_20261115_131116
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=taku-y/record-cube-20261115_20261115_131116
