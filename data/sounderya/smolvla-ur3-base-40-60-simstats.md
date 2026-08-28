# Sounderya/smolvla-ur3-base-40-60-simstats

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para control robótico en hardware de consumo. Este repositorio contiene un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset de demostraciones para un robot UR3, con la tarea específica de recoger una taza y colocarla en un plato. El modelo procesa imágenes de tres cámaras y el estado del robot (6 dimensiones) para generar acciones de 10 dimensiones, lo que lo convierte en una política de imitación lista para desplegar en entornos reales o simulados.

El modelo tiene 450 millones de parámetros, un tamaño reducido en comparación con otros VLA como OpenVLA (7B), lo que permite su ejecución en GPUs de gama media. Ha sido entrenado con 120 episodios (91 365 frames) durante 15 000 pasos, utilizando el framework LeRobot. Su licencia Apache 2.0 facilita su uso comercial y académico. La relevancia actual radica en la democratización de la robótica basada en aprendizaje, permitiendo que pequeños equipos o laboratorios implementen políticas de manipulación sin necesidad de infraestructura de alto coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal) |
| Parametros totales | 450 046 176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrada multimodal de imágenes y estado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP16/FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un cabezal de acción. A diferencia de los VLA masivos, SmolVLA optimiza la eficiencia computacional mediante una arquitectura compacta que mantiene un rendimiento competitivo en tareas de manipulación. Este fine-tuning parte del checkpoint `lerobot/smolvla_base` y se entrena con el framework LeRobot mediante aprendizaje por imitación supervisada, sin etapas de RLHF o DPO.

El entrenamiento se realizó sobre el dataset `Sounderya/mug_smolvla_dataset_v2nc`, que contiene 120 episodios de demostraciones a 30 FPS, con tres cámaras (muñeca y dos laterales) y el estado articular del robot. Se usaron 15 000 pasos de entrenamiento con batch size 64, optimizador AdamW y learning rate 5e-5. No se reportan técnicas adicionales como decodificación especulativa o atención lineal; la innovación principal es la propia arquitectura SmolVLA, que reduce el coste computacional frente a modelos como OpenVLA.

## Capacidades

- Control robótico de manipulación: genera acciones de 10 dimensiones (posiciones articulares o comandos de efector final) a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente tres flujos de imagen (256x256 píxeles) y un vector de estado de 6 dimensiones.
- Aprendizaje por imitación: la política reproduce comportamientos demostrados, permitiendo tareas de pick-and-place con precisión.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluación y despliegue en robots reales.
- Ejecución en hardware de consumo: al tener solo 450M parámetros, puede inferir en GPUs de gama media (p. ej., RTX 3060 o superiores).
- Tarea específica: entrenado para "recoger la taza y colocarla en el plato", aunque el modelo base SmolVLA es generalizable a otras tareas con fine-tuning adicional.

## Casos de uso

- Automatización de líneas de montaje: el modelo puede controlar un brazo UR3 para tareas repetitivas de recogida y colocación de piezas, reduciendo costes de programación manual.
- Investigación en robótica: sirve como punto de partida para estudiar técnicas de imitación, transferencia sim2real o aprendizaje por refuerzo, gracias a su tamaño reducido y licencia abierta.
- Prototipado rápido de políticas: los laboratorios pueden fine-tuning este modelo con nuevos datasets en pocas horas, acelerando el ciclo de desarrollo de nuevas habilidades robóticas.
- Educación y formación: al ejecutarse en GPUs de consumo, es adecuado para cursos de robótica y aprendizaje automático donde se necesite un ejemplo práctico de VLA.
- Robótica asistencial en entornos controlados: puede adaptarse para tareas de asistencia en cocinas o laboratorios, como manipular objetos pequeños con supervisión humana.
- Benchmarking de algoritmos de control: su arquitectura compacta permite comparar métricas de rendimiento (precisión, latencia) frente a modelos más grandes en tareas estandarizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. Se recomienda consultar el paper de SmolVLA (arXiv:2506.01844) para métricas comparativas del modelo base, aunque no se dispone de datos específicos de este fine-tuning.

## Requisitos de hardware

- VRAM estimada: con 450M parámetros en FP16, el modelo ocupa aproximadamente 0,9 GB de memoria. La inferencia requiere además espacio para las activaciones y el procesamiento de imágenes, por lo que se estima un consumo total de 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060 o superiores. También es viable en Apple Silicon con Metal.
- Compatibilidad con consumer GPU: sí, es uno de los objetivos de SmolVLA. No requiere GPUs de datacenter.
- Opciones de despliegue: el modelo se integra con LeRobot, que ofrece scripts de rollout para robots reales y simulados. No se mencionan adaptadores para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no se proporcionan datos específicos. Dado el tamaño, se espera una inferencia en tiempo real (30 FPS) en GPUs modernas, pero depende del hardware y del número de cámaras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este fine-tuning) | 450M | Imágenes + estado | Manipulación robótica | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | Imágenes + texto | Manipulación robótica | MIT | Hugging Face |
| RT-2 (Google) | 55B | Imágenes + texto | Manipulación robótica | Propietaria | No público |

SmolVLA se distingue por su tamaño reducido (450M frente a 7B de OpenVLA), lo que permite ejecutarlo en hardware de consumo. OpenVLA ofrece mayor generalización gracias a su escala, pero requiere GPUs de alta gama. RT-2 no es accesible públicamente. Este fine-tuning concreto está especializado en una tarea única, mientras que los modelos base son más versátiles.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un dataset de 120 episodios, la política puede estar sesgada hacia las condiciones específicas de las demostraciones (posición de la cámara, iluminación, color de la taza, etc.).
- Riesgo de alucinación: en el contexto robótico, esto se traduce en acciones impredecibles ante entradas fuera de la distribución de entrenamiento. No hay garantías de seguridad en entornos no controlados.
- Limitaciones de contexto: el modelo no acepta instrucciones de texto en este fine-tuning; la tarea está fijada. Para tareas nuevas se requiere reentrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe atribuir el copyright y no se ofrece garantía.
- Caveat para producción: no se han reportado evaluaciones en robot real; se recomienda validar exhaustivamente antes de un despliegue industrial. La robustez ante perturbaciones (cambios de iluminación, objetos nuevos) no está demostrada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sounderya/smolvla-ur3-base-40-60-simstats
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Repositorio GitHub del autor: https://github.com/Sounderya22/ur3_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
