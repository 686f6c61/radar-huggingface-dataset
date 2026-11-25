# zetanschy/smolvla_cap_to_box

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face como parte del ecosistema LeRobot. Resuelve el problema de control robótico mediante imitación: dado un estado de articulaciones y varias cámaras, predice directamente las acciones del robot. Su relevancia radica en que ofrece un rendimiento competitivo con un coste computacional reducido, permitiendo despliegue en hardware de consumo en lugar de requerir clústeres de GPU.

Esta ficha concreta, `zetanschy/smolvla_cap_to_box`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 202 episodios y 72.823 fotogramas a 30 FPS. La tarea aprendida es específica: colocar una tapa en cajas dispuestas en una cuadrícula (cuatro variantes de posición). El modelo tiene 450 millones de parámetros y un repositorio de 3,6 GB en formato safetensors.

La arquitectura combina un codificador visual y de lenguaje con un cabezal de acciones, entrenado con aprendizaje por imitación supervisado. La licencia Apache 2.0 facilita su reutilización comercial. Al ser un modelo de política robótica y no un LLM generativo, sus capacidades se limitan al control del robot `so_follower` con tres cámaras y un vector de estado de 6 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de política, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower |
| Cámaras de entrada | front, grip (3 cámaras visuales de 256x256) |
| Dimensión de estado | (6,) |
| Dimensión de acción | (6,) |
| Dataset de entrenamiento | zetanschy/cap_to_box_real (202 episodios, 72.823 frames, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 64 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Librería | lerobot 0.6.1 |
| Tamaño del repositorio | 3,6 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que procesa observaciones multimodales (imágenes de cámaras e instrucciones de tarea en lenguaje natural) junto con el estado proprioceptivo del robot, y emite un vector de acción de 6 dimensiones. La arquitectura sigue el paradigma de los modelos VLA modernos: un codificador visual, un codificador de lenguaje y un módulo de fusión que alimenta un cabezal de política. El modelo base está descrito en el paper arXiv:2506.01844, que enfatiza la eficiencia computacional y la posibilidad de desplegarse en hardware de consumo.

El fine-tuning se realizó sobre el dataset `zetanschy/cap_to_box_real`, compuesto por 202 episodios y 72.823 fotogramas capturados a 30 FPS. Las tareas cubiertas son cuatro variantes de "colocar la tapa en la caja de la fila X, columna Y" (posiciones [1,1], [1,2], [2,4] y [3,3]). El entrenamiento usó 20.000 pasos con batch size 64, optimizador AdamW y learning rate 0,0001, con semilla 1000, sobre LeRobot 0.6.1. No se especifica en la información disponible si hubo RLHF, DPO ni aumentos de datos adicionales. La innovación principal del modelo base es su compacidad: 450 millones de parámetros permiten inferencia en GPUs de consumo, a diferencia de modelos VLA de mayor tamaño.

## Capacidades

- Control robótico por imitación: predice acciones de 6 dimensiones a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: consume tres imágenes de 256x256 píxeles (cámaras `front` y `grip`, más una tercera cámara visual).
- Condicionamiento por instrucción en lenguaje natural: acepta una descripción textual de la tarea (por ejemplo, "Put the cap into the first row, first column box").
- Manipulación de objetos: entrenado específicamente para tareas de pick-and-place de una tapa en posiciones de una cuadrícula.
- No soporta tool calling ni function calling (no es un LLM conversacional).
- No soporta agentes multi-paso ni razonamiento textual.
- Capacidades multilingües: no disponibles (no es un modelo de lenguaje generativo).
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo coloca tapas en posiciones predefinidas de una cuadrícula, adecuado para tareas repetitivas de clasificación y empaquetado con el robot `so_follower`.
- Prototipado rápido de políticas robóticas: al ser un fine-tuning de 450 M de parámetros, permite iterar sobre nuevas tareas con datasets pequeños (202 episodios) y desplegar en hardware asequible.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar técnicas de VLA compactas frente a modelos de mayor tamaño.
- Educación y formación en robótica: su licencia Apache 2.0 y su tamaño permiten usarlo en laboratorios docentes con GPUs de consumo.
- Validación de pipelines LeRobot: útil para probar el flujo completo de grabación, entrenamiento y despliegue con `lerobot-rollout` y `lerobot-train`.
- Benchmarking de manipulación fina: la tarea de insertar una tapa en una caja concreta permite medir precisión de posicionamiento y robustez ante variaciones de iluminación o posición.
- Base para fine-tuning en tareas similares: al derivar de `lerobot/smolvla_base`, puede reutilizarse como punto de partida para otras tareas de manipulación con el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, MMLU, HumanEval ni métricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors (3,6 GB), una estimación razonable en FP32 ronda los 1,8 GB de pesos, más overhead de activaciones y cámaras. En FP16 podría reducirse a aproximadamente 0,9 GB. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no especificadas en la información disponible. Por el tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, así como en A100/H100 para entrenamiento.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM, aunque no se confirma en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de política robótica.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la tasa del dataset, pero no se publica latencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zetanschy/smolvla_cap_to_box | 450 M | no aplica | Control robótico (pick-and-place de tapa) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no aplica | VLA base para fine-tuning | Apache 2.0 | Hugging Face |
| Otros VLA compactos (p. ej. variantes de OpenVLA) | no disponible en la información | no aplica | Control robótico general | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo altamente especializado: solo realiza la tarea de colocar una tapa en cuatro posiciones concretas de una cuadrícula; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real documentada, lo que impide garantizar fiabilidad en producción.
- Dependencia de hardware específico: requiere el robot `so_follower` y tres cámaras con los nombres `front` y `grip` (más una tercera), así que no es portable a otras configuraciones sin adaptación.
- Riesgo de sobreajuste al dataset: 202 episodios y 72.823 frames son un volumen limitado; puede fallar ante cambios de iluminación, posición de objetos o distracciones no vistas en entrenamiento.
- Sin capacidades de lenguaje general: no es un LLM, por lo que no debe usarse para generación de texto, código ni razonamiento.
- Sesgos: no documentados; al ser un modelo de control, los sesgos se manifestarían como fallos sistemáticos en posiciones o condiciones concretas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Idiomas: la instrucción de tarea está en inglés; no se documenta soporte multiidioma.
- Formato de pesos safetensors: requiere LeRobot para cargarlo; no hay versiones GGUF ni cuantizadas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zetanschy/smolvla_cap_to_box
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/zetanschy/cap_to_box_real
- Paper SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zetanschy/cap_to_box_real
