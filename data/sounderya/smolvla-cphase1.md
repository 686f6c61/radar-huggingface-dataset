# Sounderya/smolvla-cphase1

## Resumen

Sounderya/smolvla-cphase1 es un modelo de política robótica (vision-language-action, VLA) resultado de un fine-tuning del modelo base SmolVLA (lerobot/smolvla_base) sobre un dataset simulado de manipulación. SmolVLA es un modelo compacto de aproximadamente 450 millones de parámetros desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para ejecutarse en hardware de consumo y obtener rendimiento competitivo en tareas de control robótico a un coste computacional reducido.

Este checkpoint concreto, publicado por Sounderya, está entrenado para una tarea específica en simulación: "Pick the mug and place it on the plate" (recoger una taza y colocarla en un plato). El modelo consume imágenes de tres cámaras (incluyendo una cámara de muñeca y una derecha), el estado del robot y produce una secuencia de acciones de 10 dimensiones. Es relevante porque demuestra el flujo de fine-tuning de SmolVLA para tareas de manipulación concretas usando LeRobot, con licencia Apache-2.0 y pesos en safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de SmolVLA, una arquitectura compacta de vision-language-action que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. En concreto, este checkpoint parte del checkpoint base lerobot/smolvla_base y se entrena mediante aprendizaje por imitación con el framework LeRobot (version 0.6.1). El entrenamiento se realizó sobre el dataset simulado sim_mug_skillgen_v2, con 229 episodios y 114.601 frames a 30 FPS, durante 8.000 pasos con batch size de 64, optimizador AdamW y una tasa de aprendizaje de 0.0001 (seed 1000). No se reportan técnicas adicionales como RLHF o DPO; se trata de un entrenamiento de imitación supervisada estándar en el ecosistema LeRobot.

## Capacidades

- Control robótico end-to-end: consume imágenes de hasta tres cámaras (256x256), el estado del robot (6 dimensiones) y produce una secuencia de 10 acciones de control.
- Aprendizaje por imitación: entrenado para reproducir una tarea de manipulación concreta en simulación.
- Ejecución en tiempo real con LeRobot: integrado con el framework LeRobot para rollout en robots y simulación.
- Instrucciones en lenguaje natural: la política se condiciona con la instrucción de la tarea (texto).
- Capacidades limitadas fuera del dominio robótico: no es un modelo de chat o razonamiento general; su salida es una secuencia de acciones, no texto.
- Soporte de despliegue con LeRobot: compatible con el pipeline de rollout y evaluación de LeRobot.

## Casos de uso

- Control de un robot manipulador en simulación: el modelo se puede desplegar en un entorno simulado con LeRobot para ejecutar la tarea de recoger una taza y colocarla en un plato, usando el comando `lerobot-rollout`.
- Fine-tuning de políticas VLA para tareas específicas: sirve como punto de partida para adaptar SmolVLA a otras tareas de manipulación mediante entrenamiento adicional sobre datasets propios.
- Investigación en aprendizaje por imitación: permite comparar el rendimiento de políticas compactas frente a modelos VLA más grandes en entornos simulados.
- Evaluación de transferencia simulación-real: dado que el entrenamiento es en simulación, el modelo es útil para estudiar la brecha sim-to-real en robótica.
- Benchmark de eficiencia computacional: con 450M parámetros y 0.9 GB de pesos, es adecuado para medir el rendimiento de VLAs en GPU de consumo.
- Desarrollo de agentes robóticos con LeRobot: sirve como ejemplo de integración de un VLA en el ecosistema LeRobot, desde el entrenamiento hasta la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de métricas de éxito en la tarea ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud, pero por el tamaño del modelo (450M parámetros, 0.9 GB en safetensors) se puede estimar un uso de memoria de entre 2 y 4 GB en FP32, y menor en cuantización (no se han publicado cuantizaciones).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para inferencia en batch pequeño; se recomienda una RTX 3090/4090 para entrenamiento o fine-tuning.
- Compatibilidad con GPU de consumo: sí, SmolVLA está diseñado para hardware de consumo; una RTX 3060 de 12 GB o superior sería viable para inferencia.
- Opciones de despliegue: el modelo se usa con LeRobot (`lerobot-rollout`), que utiliza PyTorch. No se encontró soporte directo para vLLM, llama.cpp u Ollama, ya que es un modelo robótico.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (base) | 450M | VLA | no disponible | Apache-2.0 | HuggingFace |
| Sounderya/smolvla-cphase1 | 450M | VLA fine-tuned | no disponible | Apache-2.0 | HuggingFace |
| PiVLA (OpenVLA) | ~7B | VLA | no disponible | Apache-2.0 | HuggingFace |
| RT-2 (Google) | ~55B | VLA | no disponible | propietaria | no pública |

Este checkpoint es una variante fine-tuned del mismo modelo base SmolVLA, por lo que la comparativa directa con SmolVLA base no se puede hacer en términos de rendimiento (no hay benchmarks). Con respecto a VLA más grandes como PiVLA, la ventaja de SmolVLA es su tamaño reducido (450M frente a 7B), lo que permite despliegue en hardware de consumo, aunque se espera menor rendimiento en tareas complejas.

## Limitaciones y advertencias

- Es un modelo entrenado para una tarea específica en simulación; no se puede esperar que generalice a otras tareas o entornos sin fine-tuning adicional.
- No se han publicado evaluaciones del éxito de la tarea; el rendimiento real es desconocido.
- Los datos de entrenamiento son simulados (dataset sim_mug_skillgen_v2), por lo que la transferencia a robótica real puede verse afectada por la brecha de simulación-realidad.
- No tiene capacidades de generación de texto, razonamiento general ni tool calling; su única salida es una secuencia de acciones de 10 dimensiones.
- El modelo no soporta otras instrucciones de lenguaje que la tarea concreta para la que fue entrenado.
- Aunque la licencia es Apache-2.0, el uso en entornos de producción robótica debe validarse con evaluaciones propias.
- No se dispone de información sobre sesgos o alucinaciones, pero al ser un modelo de control robótico, no es aplicable el concepto de alucinación textual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sounderya/smolvla-cphase1
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/sim_mug_skillgen_v2
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Perfil del autor: https://huggingface.co/Sounderya</think>## Resumen

SmolVLA es un modelo vision-language-action (VLA) compacto de aproximadamente 450 millones de parámetros, desarrollado por Hugging Face dentro del ecosistema LeRobot. Está diseñado para que las tareas de control robótico por imitación sean accesibles en hardware de consumo, reduciendo el coste computacional frente a modelos VLA masivos. El checkpoint `Sounderya/smolvla-cphase1` es un fine-tuning de la base `lerobot/smolvla_base` realizado por Sounderya, entrenado específicamente para una tarea de manipulación en simulación: recoger una taza y colocarla en un plato.

El modelo consume imágenes de tres cámaras, el estado del robot y una instrucción en lenguaje natural, y produce una secuencia de acciones de 10 dimensiones. El entrenamiento se realizó con LeRobot (versión 0.6.1) sobre el dataset simulado `sim_mug_skillgen_v2`, con 229 episodios y 114.601 frames a 30 FPS. Este checkpoint es relevante como ejemplo de fine-tuning de SmolVLA para tareas concretas de manipulación y de integración con el framework LeRobot, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de SmolVLA, una arquitectura VLA compacta que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. SmolVLA se basa en un enfoque de aprendizaje por imitación: consume observaciones multimodales (imagen de tres cámaras a 256x256, estado del robot de 6 dimensiones) y una instrucción textual, y genera una secuencia de acciones (chunk de 10 pasos). El entrenamiento se realizó con el framework LeRobot 0.6.1, con 8.000 pasos, batch size de 64, optimizador AdamW, learning rate de 0.0001 y seed 1000. El dataset de entrenamiento contiene 229 episodios con una única tarea: "Pick the mug and place it on the plate". No se mencionan técnicas de RLHF o DPO; es un entrenamiento de imitación supervisada estándar.

## Capacidades

- Control robótico end-to-end: genera secuencias de acciones de 10 dimensiones a partir de imágenes y estado del robot.
- Percepción multi-cámara: utiliza tres cámaras (muñeca, derecha y una tercera) con resolución de 256x256.
- Instrucciones en lenguaje natural: la tarea se especifica mediante texto ("Pick the mug and place it on the plate").
- Integración con LeRobot: compatible con los pipelines de rollout y entrenamiento de LeRobot.
- Ejecución en hardware de consumo: al ser un modelo de 450M, está diseñado para funcionar en GPU de gama media.
- Aprendizaje por imitación: entrenado para replicar la política de la que se obtuvieron las demostraciones.
- No tiene capacidades de chat, razonamiento general, tool calling ni agentes; su salida es únicamente una secuencia de acciones.

## Casos de uso

- Manipulación robótica en simulación: el modelo puede ejecutarse en un entorno simulado con LeRobot para realizar la tarea de recoger una taza y colocarla en un plato, usando el comando `lerobot-rollout`.
- Fine-tuning para nuevas tareas de manipulación: sirve como punto de partida para adaptar SmolVLA a otras tareas mediante aprendizaje por imitación con un dataset propio.
- Investigación en VLA compactos: permite estudiar el rendimiento de modelos de 450M frente a VLA más grandes en tareas de manipulación.
- Evaluación de transferencia simulación-real: al ser entrenado en simulación, es útil para analizar la brecha entre simulación y robot real.
- Desarrollo de políticas robóticas con LeRobot: como ejemplo de referencia para entrenar y desplegar políticas con el framework LeRobot.
- Benchmarking de eficiencia computacional: por su tamaño, es adecuado para medir el coste de entrenamiento e inferencia de modelos VLA en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay datos de éxito en la tarea ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 450M parámetros y 0.9 GB en safetensors; en FP32 ocuparía aproximadamente 1.8 GB de memoria, y en FP16 unos 0.9 GB. En la práctica, con el batch de imágenes y el estado, se recomienda al menos 4-6 GB de VRAM.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4070, RTX 4090, o cualquier GPU con más de 8 GB de VRAM. También puede ejecutarse en CPU para inferencia lenta.
- Compatible con GPU de consumo: sí, está diseñado para ello.
- Opciones de despliegue: se usa con LeRobot (PyTorch). No se ha encontrado soporte para vLLM, llama.cpp u Ollama, ya que es un modelo robótico y no un LLM de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sounderya/smolvla-cphase1 | 450M | VLA | no disponible | Apache-2.0 | Hugging Face |
| lerobot/smolvla_base | 450M | VLA | no disponible | Apache-2.0 | Hugging Face |
| PiVLA (OpenVLA) | 7B | VLA | no disponible | Apache-2.0 | Hugging Face |
| RT-2 (Google) | ~55B | VLA | no disponible | propietaria | no pública |

Este modelo es un fine-tuning del mismo SmolVLA base, por lo que la comparación directa con SmolVLA base se limita al dataset y la tarea concreta. Con modelos más grandes como OpenVLA (7B), la diferencia principal es el tamaño: SmolVLA es significativamente más eficiente en recursos, pero puede tener menor capacidad en tareas complejas. No se dispone de comparativas de rendimiento publicadas.

## Limitaciones y advertencias

- El modelo está entrenado para una única tarea en simulación; no generaliza a otras tareas sin fine-tuning adicional.
- No se han publicado evaluaciones de éxito; se desconoce el rendimiento real en la tarea.
- El entrenamiento en simulación puede no transferirse a entornos reales sin adaptación.
- La salida del modelo es una secuencia de acciones; no tiene capacidades de texto, razonamiento o herramientas.
- Depende del framework LeRobot para su ejecución, lo que limita su despliegue fuera de ese ecosistema.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es un producto final; requiere integración con un robot y un entorno de control.
- No hay datos sobre sesgos o alucinaciones, al ser un modelo de control robótico y no un LLM de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sounderya/smolvla-cphase1
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/sim_mug_skillgen_v2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Perfil del autor: https://huggingface.co/Sounderya
