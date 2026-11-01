# suzanne1989/hf_act_recordpolicy0

## Resumen

`hf_act_recordpolicy0` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario suzanne1989 en Hugging Face y entrenada con la librería LeRobot de Hugging Face. ACT es un método de aprendizaje por imitación que predice trozos cortos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación y suele lograr tasas de éxito altas a partir de datos de teleoperación.

El modelo resuelve una tarea concreta y muy acotada: "Grab the green duplo" sobre un robot `so_follower` (el seguidor del brazo SO-100/SO-101), con dos cámaras de entrada (`front` y `side`) a resolución 640x480 y un vector de estado de 6 dimensiones. No es un modelo de lenguaje: es una política visomotora que consume observaciones (imágenes y estado articular) y emite un vector de acción de 6 dimensiones a 30 FPS.

Es relevante como ejemplo reproducible del flujo completo de LeRobot: grabación de un dataset pequeño (50 episodios, 17.041 fotogramas), entrenamiento de ACT (25.000 pasos, batch 8, AdamW, lr 1e-5) y despliegue con `lerobot-rollout`. Su tamaño (51,7 millones de parámetros) y licencia Apache 2.0 lo hacen accesible para experimentación en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visomotora con historial de observaciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,1 GB) |

## Arquitectura y entrenamiento

ACT combina un codificador de imágenes (típicamente ResNet) con un transformer que fusiona las características visuales de las dos cámaras (`front` y `side`, 3x480x640 cada una) y el estado propioceptivo del robot (`observation.state`, 6 dimensiones). La salida es un *chunk* de acciones de 6 dimensiones que se ejecuta de forma abierta en bucle hasta el siguiente paso de inferencia. El método original (arXiv:2304.13705) introduce el *action chunking* y una regularización de la predicción del chunk (CVAE) para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `suzanne1989/record-test-3`: 50 episodios, 17.041 fotogramas a 30 FPS, una única tarea ("Grab the green duplo"). Configuración: 25.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000. No se documenta composición adicional del dataset ni uso de RLHF/DPO (no aplica a aprendizaje por imitación).

## Capacidades

- Política visomotora de manipulación: genera comandos de acción de 6 dimensiones a partir de dos cámaras y del estado articular.
- Aprendizaje por imitación a partir de teleoperación; no requiere recompensas ni entorno simulado.
- Predicción de *action chunks* que reduce el error acumulado en tareas de agarre.
- Ejecución en tiempo real a 30 FPS sobre el robot `so_follower`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo *thinking*, visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- **Automatización de una tarea de pick-and-place concreta**: recoger el bloque verde de Duplo en un entorno controlado, usando las dos cámaras para localizar el objeto y el estado articular para planificar el agarre. Adecuado por su entrenamiento específico en esa tarea.
- **Prototipado rápido de políticas con LeRobot**: servir como punto de partida reproducible para validar el pipeline `lerobot-train` → `lerobot-rollout` antes de escalar a tareas propias.
- **Docencia y formación en aprendizaje por imitación**: ejemplo mínimo (50 episodios) para explicar ACT, *action chunking* y el flujo de datos de LeRobot en cursos de robótica.
- **Evaluación de hardware SO-100/SO-101**: comprobar calibración de cámaras, puertos y cinemática del brazo seguidor con una política ya entrenada.
- **Base para *fine-tuning* en tareas similares**: reentrenar sobre un dataset propio de agarre con la misma configuración y robot para adaptar la política a nuevos objetos.
- **Investigación en robustez visomotora**: medir la degradación de la política ante cambios de iluminación, posiciones del objeto o distracciones, ya que el autor no ha publicado evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- **VRAM estimada**: con 51,7 millones de parámetros, la inferencia en fp32 requiere aproximadamente 0,2 GB de pesos; en la práctica, el cuello de botella es el procesamiento de dos imágenes 480x640 por paso, que puede requerir 1-2 GB en GPU.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060/4060, RTX 4090, A100 o H100 funcionan sin problema.
- **Consumer GPU**: sí, cabe holgadamente en GPUs de consumo (RTX 2060 en adelante).
- **Despliegue**: `lerobot-rollout` con `--policy.path=suzanne1989/hf_act_recordpolicy0`; el entrenamiento se realiza con `lerobot-train` y `--policy.type=act`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- **Latencia y throughput**: no disponibles; el sistema opera a 30 FPS según el dataset, pero no se publican medidas de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `suzanne1989/hf_act_recordpolicy0` | 51,7 M | no aplica | Agarre de Duplo verde (SO-100) | Apache 2.0 | Hugging Face (22 descargas) |
| ACT original (paper 2304.13705) | no disponible | no aplica | Manipulación genérica | no disponible | Paper + código |
| Políticas LeRobot del Hub (p. ej. `lerobot/act_*`) | variable | no aplica | Tareas diversas | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- **Sobreajuste a la tarea**: entrenada exclusivamente para "Grab the green duplo"; no generaliza a otros objetos ni tareas sin reentrenamiento.
- **Dataset pequeño**: 50 episodios y 17.041 fotogramas pueden ser insuficientes para robustez ante variaciones de iluminación, posición o distracciones.
- **Sin evaluación publicada**: no hay tasas de éxito ni análisis de fallos; el rendimiento real en robot es desconocido.
- **Dependencia de hardware**: requiere un robot `so_follower` y dos cámaras con los nombres `front` y `side` y la resolución exacta de entrenamiento (640x480, 30 FPS).
- **Sin capacidades de lenguaje**: no es un modelo conversacional; no debe evaluarse con benchmarks de NLP.
- **Sesgos**: no documentados; al ser una política entrenada con un único operador y entorno, puede heredar sesgos de las demostraciones (posiciones, velocidad, estilo de agarre).
- **Riesgo en producción**: sin validación externa, no se recomienda su uso en entornos reales sin supervisión y sin un protocolo de parada de seguridad.
- **Licencia**: Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluación limita su idoneidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suzanne1989/hf_act_recordpolicy0
- Dataset de entrenamiento: https://huggingface.co/datasets/suzanne1989/record-test-3
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=suzanne1989/record-test-3
