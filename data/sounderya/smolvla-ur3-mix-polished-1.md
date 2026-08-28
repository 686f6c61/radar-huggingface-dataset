# Sounderya/smolvla-ur3-mix-polished-1

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico con un coste computacional reducido y capaz de ejecutarse en hardware de consumo. Este repositorio concreto, `Sounderya/smolvla-ur3-mix-polished-1`, es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base` realizado por el usuario Sounderya, especializado en una tarea de manipulación con un brazo robótico UR3: recoger una taza y colocarla en un plato.

El modelo combina percepción visual (tres cámaras) y estado del robot para generar acciones de control de 10 dimensiones. Con aproximadamente 450 millones de parámetros, se posiciona como una alternativa ligera frente a VLA más grandes, permitiendo su despliegue en entornos con recursos limitados. La licencia Apache 2.0 facilita su uso comercial y de investigación. El entrenamiento se realizó con el framework LeRobot sobre un dataset propio de 120 episodios, y el modelo está disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLM |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA se basa en el modelo multimodal SmolVLM de Hugging Face, adaptado para generar acciones robóticas a partir de observaciones visuales y de estado. La arquitectura integra un codificador de visión, un modelo de lenguaje y una cabeza de acción que produce comandos de control continuos. El modelo base `lerobot/smolvla_base` fue preentrenado con datos multimodales y posteriormente ajustado para tareas de manipulación.

El ajuste fino de este repositorio se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `Sounderya/mug_smolvla_dataset_v2nc`, que contiene 120 episodios y 91.365 fotogramas a 30 FPS, con la tarea "Pick the mug and place it on the plate". La configuración de entrenamiento incluyó 1.000 pasos, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se menciona el uso de RLHF o DPO; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de manipulación: genera acciones de 10 dimensiones (posición, orientación, etc.) para un brazo UR3.
- Percepción multimodal: procesa tres imágenes de cámaras (256x256) y un vector de estado de 6 dimensiones.
- Ejecución de tareas específicas: entrenado para recoger una taza y colocarla en un plato, con generalización limitada a variaciones de la misma tarea.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento e inferencia de LeRobot, incluyendo comandos CLI para rollout y entrenamiento.
- No soporta generación de texto, tool calling ni razonamiento conversacional; es un modelo de política puramente robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo UR3 para recoger objetos y colocarlos en posiciones definidas, reduciendo la necesidad de programación manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos con VLA compactos, permitiendo ajustes finos con datasets pequeños.
- Prototipado rápido en robótica educativa: al ser ligero y de código abierto, puede desplegarse en laboratorios universitarios con GPUs de gama media.
- Evaluación de políticas robóticas en simulación: el modelo puede integrarse en entornos simulados para validar comportamientos antes de pasar al hardware real.
- Benchmarking de eficiencia: permite comparar el rendimiento de un VLA de 450M frente a modelos más grandes en tareas de manipulación.
- Desarrollo de sistemas de control basados en visión: su capacidad de procesar múltiples cámaras lo hace adecuado para tareas que requieren percepción desde distintos ángulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultados de evaluación para esta política. No se dispone de métricas como tasa de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero con 450M de parámetros y 5.3 GB de pesos, se estima que puede caber en GPUs con 8 GB o más en precisión FP16, y menos con cuantización (aunque no se ofrecen versiones cuantizadas).
- GPU recomendadas: tarjetas consumer como RTX 3060, RTX 4060 o superiores; también GPUs de datacenter como A10 o A100 si se requiere mayor velocidad.
- Compatibilidad con consumer GPU: sí, probablemente en GPUs con al menos 8 GB de VRAM.
- Opciones de despliegue: LeRobot (CLI `lerobot-rollout`), compatible con PyTorch; no se mencionan vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros VLA en la documentación proporcionada. Sin embargo, se puede contextualizar: SmolVLA (450M) es significativamente más pequeño que OpenVLA (7B) o RT-2 (55B), lo que lo hace más adecuado para despliegue en hardware limitado, aunque probablemente con menor capacidad de generalización. No se proporcionan datos cuantitativos de rendimiento relativo.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay métricas de éxito en el robot real, por lo que su rendimiento efectivo es desconocido.
- Dataset de entrenamiento pequeño: solo 120 episodios, lo que limita la generalización a variaciones de iluminación, posición de objetos o cambios de escena.
- Tarea específica: el modelo está entrenado únicamente para "recoger la taza y colocarla en el plato"; no es un VLA generalista.
- Sin soporte de idiomas: no se especifica capacidad multilingüe; probablemente solo procesa instrucciones en inglés (aunque no se detalla).
- Riesgo de sobreajuste: el entrenamiento con 1.000 pasos sobre un dataset reducido puede provocar memorización en lugar de aprendizaje generalizable.
- Dependencia de cámaras específicas: requiere tres cámaras con las mismas características que las usadas en el entrenamiento (resolución, posición, calibración).
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones (aunque ambos son de Hugging Face y Apache).

## Enlaces

- [HuggingFace - Sounderya/smolvla-ur3-mix-polished-1](https://huggingface.co/Sounderya/smolvla-ur3-mix-polished-1)
- [Paper SmolVLA (arXiv:2506.01844)](https://arxiv.org/pdf/2506.01844)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Repositorio GitHub del autor (Sounderya22/ur3_smolvla)](https://github.com/Sounderya22/ur3_smolvla)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
