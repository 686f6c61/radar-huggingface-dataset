# Wolvered/act_aloha_insertion

## Resumen

Wolvered/act_aloha_insertion es una política de imitación (policy) entrenada con el método Action Chunking with Transformers (ACT) y publicada en el Hub mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de robótica que consume observaciones visuales y de estado articular de un robot ALOHA y produce comandos de acción de 14 dimensiones para la tarea concreta de insertar una clavija en un receptáculo ("Insert the peg into the socket"). El autor es el usuario Wolvered y la licencia es Apache 2.0.

El modelo resuelve el problema del control motor fino en manipulación robótica mediante aprendizaje por imitación a partir de datos de teleoperación. ACT predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza las trayectorias. Con 51.685.006 parámetros, es un modelo compacto que puede ejecutarse en hardware modesto, aunque la inferencia requiere el robot físico o un simulador compatible.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas en PyTorch. Este checkpoint concreto se entrenó sobre el dataset simulado `lerobot/aloha_sim_insertion_human` (50 episodios, 25.000 frames a 50 FPS), lo que lo convierte en una referencia reproducible para experimentar con ACT en el simulador ALOHA antes de trasladar el pipeline a un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación temporal definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa; LeRobot no documenta cuantizaciones para este checkpoint) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un encoder visual (procesa imágenes RGB de 3×480×640) y un decoder que genera chunks de acciones. La política recibe `observation.images.top` (cámara cenital) y `observation.state` (vector de 14 dimensiones del estado articular) y emite un vector `action` de 14 dimensiones. El entrenamiento se realizó con LeRobot 0.6.2 durante 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000.

El dataset de entrenamiento es `lerobot/aloha_sim_insertion_human`: 50 episodios, 25.000 frames a 50 FPS, correspondientes a la tarea "Insert the peg into the socket" en el simulador ALOHA con datos de teleoperación humana. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de refuerzo adicionales; ACT es puramente supervisado sobre demostraciones. La innovación principal del método es la predicción de chunks de acción, que mitiga el error compounding típico del behavioral cloning paso a paso.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 14 dimensiones para un robot ALOHA.
- Percepción visual: procesa una cámara cenital a resolución 480×640.
- Aprendizaje por imitación: reproduce la tarea de inserción de clavija aprendida de 50 demostraciones humanas.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos aislados.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión general, audio ni modo thinking; es un modelo específico de robótica.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para reproducir los resultados de ACT sobre el dataset simulado de inserción, comparando hiperparámetros y semillas con el pipeline de LeRobot.
- Prototipado en simulador ALOHA: permite validar el pipeline completo (`lerobot-rollout`) antes de invertir en hardware real, usando la tarea de inserción como banco de pruebas.
- Base para fine-tuning en tareas de ensamblaje: al estar entrenado en inserción de precisión, es un punto de partida razonable para transferir a otras tareas de ensamblaje con pocas demostraciones adicionales.
- Docencia y formación en robótica: modelo pequeño (51,7 M de parámetros) y con licencia permisiva, adecuado para cursos que enseñen behavioral cloning con LeRobot.
- Evaluación de infraestructura de inferencia robótica: útil para medir latencia y throughput de políticas ACT en distintas GPUs antes de desplegar políticas más grandes.
- Benchmark de métodos de imitación: comparar ACT frente a otros métodos disponibles en LeRobot (por ejemplo, Diffusion Policy) sobre la misma tarea y dataset.
- Automatización de tareas de pick-and-place de precisión en laboratorio: con el robot ALOHA calibrado y la cámara cenital, el modelo puede ejecutar la inserción de forma autónoma durante sesiones de hasta 60 segundos con `--duration=60`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en precisión completa, el peso de los pesos ronda los 200 MB, por lo que la VRAM necesaria la dominan el encoder visual y los buffers de imagen, no el modelo en sí.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060 o superior es holgada para este tamaño. A100/H100 no son necesarias salvo para entrenamiento a gran escala.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna con al menos 4-8 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de robótica.
- Latencia y throughput: no disponibles en la información proporcionada. La frecuencia de control del dataset es de 50 FPS, lo que da una referencia de la tasa a la que debe operar la política en simulación.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wolvered/act_aloha_insertion | 51.685.006 | Inserción de clavija (ALOHA sim) | no aplica | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de LeRobot (checkpoints de referencia) | no disponible | Tareas ALOHA simuladas | no aplica | Apache 2.0 | Hugging Face Hub |
| Diffusion Policy (implementaciones en LeRobot) | no disponible | Manipulación por imitación | no aplica | según implementación | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Modelo específico de una única tarea ("Insert the peg into the socket") y un único robot (ALOHA); no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Entrenado exclusivamente en simulación (`aloha_sim_insertion_human`); el gap sim-to-real puede degradar el rendimiento en un robot físico.
- Requiere una cámara cenital (`observation.images.top`) y un vector de estado de 14 dimensiones; cualquier cambio en la configuración de sensores invalida el checkpoint.
- Sin resultados de evaluación publicados: no hay métricas de tasa de éxito que respalden su rendimiento.
- Riesgo de sobreajuste a las 50 demostraciones del dataset; variaciones de posición, iluminación o distractores no están cubiertas por los datos.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de NLP ni usarse para generación de texto.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo de despliegue.
- El repo ocupa 6,2 GB, muy superior al tamaño de los pesos, probablemente por checkpoints o artefactos adicionales; conviene revisar antes de descargar en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wolvered/act_aloha_insertion
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_insertion_human
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/aloha_sim_insertion_human
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
