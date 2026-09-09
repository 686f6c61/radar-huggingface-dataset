# YuyangZhao/skill1-alfworld-skill-only-qwen3.5-4b-step40

## Resumen

Este modelo es un checkpoint de aprendizaje por refuerzo (RL) desarrollado por YuyangZhao sobre el modelo base `Qwen/Qwen3.5-4B`, entrenado con GRPO en el benchmark ALFWorld. Se enmarca dentro del framework Skill1, en su ablatión "skill-only": la política se actualiza únicamente a través de los pasos de selección de habilidades (generación de consultas de recuperación y re-ranking), mientras que las acciones del ejecutor en el entorno se generan con el mismo modelo pero quedan excluidas del gradiente. El objetivo de esta ablatión es aislar la contribución del aprendizaje de selección de habilidades, manteniendo el ejecutor sin entrenar para evitar que aprenda la tarea directamente.

La arquitectura es `Qwen3_5ForConditionalGeneration`, un modelo multimodal basado en Qwen3.5-4B, con la torre de visión incluida en los pesos pero no utilizada en ALFWorld. Los parámetros totales ascienden a 5.174.964.736 (≈5,17 mil millones). El entrenamiento se realizó durante 40 pasos con 4 NVIDIA L40S, usando vLLM para los rollouts y FSDP para el actor. El modelo está pensado como pieza de investigación, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (basada en Qwen3.5-4B) |
| Parametros totales | 5.174.964.736 (≈5,17 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (un único archivo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es una adaptación por RL del modelo Qwen3.5-4B, que según la documentación se carga con la clase `Qwen3_5ForConditionalGeneration` de `transformers` o vLLM. El modelo base se usa con el modo de pensamiento desactivado (`enable_thinking=False`). Los pesos se almacenan en bf16, y la torre de visión del modelo base se mantiene sin cambios, aunque no se emplea en las tareas ALFWorld.

El entrenamiento utilizó GRPO con un tamaño de grupo de 8, 16 tareas por paso, una tasa de aprendizaje de 1e-6 y un coeficiente de KL de 0.01. Las fases entrenables se limitan a la generación de consultas de recuperación y al re-ranking; los pasos de ejecución (`play`) se excluyen del lote de entrenamiento. La recompensa combina el resultado de la tarea (descontado hasta los pasos de selección), una componente de NDCG del re-ranking con peso 0.3 y una recompensa intrínseca de destilación con peso 0.3. La biblioteca de habilidades utiliza recuperación top-k 3, una EMA de utilidad con alpha 0.05 y alcanzó 1865 habilidades en el paso 40. Se guardaron checkpoints cada 10 pasos.

## Capacidades

- Generación de texto y razonamiento en formato de agente: el modelo responde a prompts de ALFWorld que esperan un razonamiento dentro de las etiquetas `<think> </think>` y una acción admisible dentro de `<action> </action>`.
- Selección de habilidades: genera consultas de recuperación en `<query>...</query>` y emite re-ranking en `<rank>...</rank>`.
- Aprendizaje por refuerzo en entornos de tareas domésticas simuladas (ALFWorld), con capacidad para integrar una biblioteca externa de habilidades.
- Capacidad multimodal de arquitectura (image-text-to-text), pero la torre de visión no se utiliza en esta variante.
- Soporte para cargarse con `transformers >= 5` o vLLM.
- No se documentan capacidades de tool calling, function calling ni soporte multilingüe específico.

## Casos de uso

- Investigación en aprendizaje por refuerzo para agentes: el checkpoint permite comparar la ablatión skill-only contra otras variantes del framework Skill1 (por ejemplo, skill+executor o executor-only) y medir el efecto de entrenar solo la selección de habilidades.
- Evaluación de bibliotecas de habilidades: como el modelo genera consultas y re-ranking, puede utilizarse para validar bibliotecas de habilidades externas en ALFWorld, comprobando si la recuperación top-k con EMA de utilidad mejora la tasa de éxito.
- Análisis de destilación de recompensas: la recompensa intrínseca de destilación permite estudiar cómo se transfiere conocimiento desde el re-ranking hacia la generación de consultas, útil para diseñar nuevas funciones de recompensa.
- Pruebas de estrategias de recuperación: el checkpoint sirve para comparar diferentes configuraciones de recuperación (top-k, alpha de EMA, tamaño de biblioteca) sobre el mismo ejecutor congelado.
- Demostraciones en cursos de RL aplicado: al ser una ablatión controlada, es un ejemplo didáctico de cómo aislar el efecto de una componente de entrenamiento en agentes con GRPO.
- Desarrollo de agentes en entornos domésticos: puede integrarse en un pipeline de agente que use ALFWorld como banco de pruebas, siempre que se disponga de la biblioteca de habilidades correspondiente (no incluida en el repositorio).

## Benchmarks y rendimiento

La model card reporta resultados de validación en 64 tareas de ALFWorld reservadas, con temperatura 0.4, comparando la tasa de éxito con y sin recuperación de habilidades a lo largo del entrenamiento:

| Paso | Tasa de éxito con recuperación | Tasa de éxito sin recuperación |
|---|---|---|
| 0 (base) | 0.281 | 0.406 |
| 20 | 0.344 | 0.391 |
| 30 | 0.484 | 0.438 |
| 40 (este checkpoint) | 0.359 | 0.391 |

El autor señala que la tasa de éxito del ejecutor sin recuperación se mantiene plana, como se espera en esta ablatión, mientras que el valor con recuperación depende de la biblioteca de habilidades utilizada en inferencia. No se proporcionan resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) para este modelo.

## Requisitos de hardware

- El entrenamiento se realizó con 4x NVIDIA L40S, usando vLLM para rollouts y FSDP para el actor.
- Los pesos bf16 ocupan aproximadamente 10,4 GB según el tamaño del repositorio; para inferencia se estima un consumo mínimo de 12-16 GB de VRAM, considerando además las activaciones y la caché KV.
- No se especifica una GPU recomendada para inferencia. Dado el tamaño de los pesos, una GPU de consumo con 24 GB de VRAM (por ejemplo, RTX 4090) podría ejecutar el modelo en bf16, aunque no hay confirmación oficial.
- El modelo es compatible con `transformers >= 5` y vLLM; no se documentan otros motores de despliegue como llama.cpp, Ollama o TGI.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información que permita una comparación directa con otros checkpoints de la misma categoría en la información disponible. El modelo base es `Qwen/Qwen3.5-4B`, pero no se presentan métricas comparativas con otros modelos entrenados sobre ALFWorld en el repositorio ni en las búsquedas web. Por tanto, la comparativa se considera "no disponible".

## Limitaciones y advertencias

- Ablatión skill-only: el ejecutor no se entrena, por lo que la tasa de éxito sin recuperación se mantiene plana. El rendimiento con recuperación depende críticamente de la biblioteca de habilidades externa.
- La biblioteca de habilidades no se incluye en el repositorio; sin ella, el modelo no puede ejecutar la recuperación ni el re-ranking correctamente.
- El modo de pensamiento está desactivado durante el entrenamiento (`enable_thinking=False`), lo que puede limitar el razonamiento complejo, aunque los prompts de ALFWorld siguen solicitando salidas en `<think>`.
- La torre de visión está presente en los pesos pero no se utiliza; el modelo no ofrece capacidades de visión funcionales en esta variante.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones de idioma al no estar disponibles los idiomas soportados.
- Los resultados de validación provienen de 64 tareas reservadas con temperatura 0.4; no se reportan intervalos de confianza ni otras métricas de robustez.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está diseñado para investigación y no se recomienda su uso en producción sin una evaluación adicional.
- La longitud de contexto no está documentada, lo que impide conocer los límites exactos de ventana para aplicaciones con diálogos largos.

## Enlaces

- HuggingFace: [YuyangZhao/skill1-alfworld-skill-only-qwen3.5-4b-step40](https://huggingface.co/YuyangZhao/skill1-alfworld-skill-only-qwen3.5-4b-step40)
