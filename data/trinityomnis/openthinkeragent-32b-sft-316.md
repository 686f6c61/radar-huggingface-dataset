# trinityomnis/OpenThinkerAgent-32B-SFT-316

## Resumen

OpenThinkerAgent-32B-SFT-316 es un modelo de lenguaje de 32B parámetros desarrollado por el proyecto OpenThoughts-Agent, publicado en HuggingFace bajo el usuario trinityomnis. Se trata de un post-entrenamiento mediante SFT de parámetros completos sobre el modelo base Qwen/Qwen3-32B, con el objetivo de mejorar las capacidades de razonamiento agéntico en entornos de terminal, código y software engineering. El modelo está diseñado para ejecutar tareas de agente multi-turno, como resolver issues, generar parches o interactuar con shells.

El entrenamiento se realizó sobre un dataset curado de 316 ejemplos (OpenThoughts-Agent-SFT-316), compuesto por pares de tarea y trayectoria de agente generados por un modelo profesor (GLM-4.7-AWQ) en el harness terminus-2. El modelo es relevante porque forma parte de un esfuerzo open-source por curar datasets y modelos para agentes, un área con pocos recursos públicos y gran demanda en investigación aplicada.

La arquitectura es un transformer denso, sin mezcla de expertos, heredado de Qwen3-32B. No se especifica la longitud de contexto del modelo final, aunque el cutoff_len de entrenamiento fue de 32768 tokens. El tamaño del repositorio es de 65.5 GB, lo que corresponde a pesos completos en bf16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-32B) |
| Parametros totales | 32B (modelo base Qwen3-32B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (cutoff_len de entrenamiento: 32768) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de Qwen3-32B, por lo que conserva su arquitectura transformer densa sin modificaciones estructurales. No se trata de un modelo MoE ni de una arquitectura híbrida. El entrenamiento se realizó con SFT de parámetros completos sobre el dataset OpenThoughts-Agent-SFT-316, que contiene 316 pares de (tarea, trayectoria de agente) procedentes de cuatro fuentes de tareas: SWE-Smith, StackExchange-SuperUser, StackExchange-Tezos con aumentación sintética e IssueTasks. Las trayectorias fueron generadas por el modelo GLM-4.7-AWQ en el harness terminus-2 y filtradas para conservar solo aquellas con al menos 5 turnos de modelo.

Los hiperparámetros de entrenamiento incluyen learning rate de 4e-05, scheduler cosine con warmup ratio de 0.1, batch global de 96, 7 épocas y cutoff_len de 32768. La precisión utilizada fue bf16 con DeepSpeed ZeRO-3. No se mencionan técnicas de alineación como RLHF o DPO; el ajuste es exclusivamente supervisado.

## Capacidades

- Generación de texto y razonamiento multi-turno orientado a tareas de agente.
- Ejecución de comandos de terminal y manipulación de sistemas de archivos.
- Generación y modificación de código, incluyendo parches y resolución de issues.
- Soporte de interacción con herramientas externas, implícito en el entrenamiento con trayectorias de agente.
- Capacidad de mantener conversaciones largas de al menos 5 turnos, según el filtro aplicado al dataset.
- Capacidades multilingües no documentadas en la información disponible.
- Sin soporte de visión ni audio.

## Casos de uso

- Automatización de tareas de desarrollo de software: el modelo puede ejecutar comandos de terminal, leer y modificar archivos de un repositorio y generar parches para issues concretos, gracias a su entrenamiento con trazas de agentes de SWE-Smith e IssueTasks.
- Asistente técnico en soporte de sistemas: puede responder preguntas complejas de administración de sistemas basándose en el conocimiento de StackExchange-SuperUser, con capacidad de razonar sobre comandos y configuraciones.
- Agente de línea de comandos para pipelines de CI/CD: el modelo puede integrarse en flujos automatizados para depurar código, ejecutar tests y corregir errores, aprovechando su entrenamiento en entornos de terminal.
- Generación de documentación técnica: a partir de issues o preguntas de StackExchange, puede redactar explicaciones y soluciones detalladas, manteniendo coherencia en trazas largas.
- Investigación en agentes: el modelo es útil para experimentar con harness de evaluación como terminus-2 y comparar estrategias de entrenamiento con datasets curados de trayectorias de agente.
- Resolución de issues en proyectos blockchain: el componente StackExchange-Tezos con aumentación sintética permite abordar preguntas específicas de ecosistemas blockchain, aunque con alcance limitado.

## Benchmarks y rendimiento

La model card incluye resultados oficiales evaluados en el harness terminus-2 (pass@1, media de 3 ejecuciones estocásticas). Se presentan tal cual:

| Modelo | Harness | SWE-Bench-Verified-100 | OpenThoughts-TBLite | Terminal-Bench 2.0 |
| --- | --- | --- | --- | --- |
| Qwen/Qwen3-32B | Terminus-2 | 26.7 | 13.7 | 7.5 |
| OpenThinkerAgent-32B-SFT-316 | Terminus-2 | 16.3 | 24.2 | 13.1 |

El modelo mejora al base en OpenThoughts-TBLite (+10.5 puntos) y Terminal-Bench 2.0 (+5.6 puntos), pero obtiene un resultado inferior en SWE-Bench-Verified-100 (-10.4 puntos). No se han publicado benchmarks adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~64 GB (pesos completos de 32B).
- VRAM estimada con cuantización 4-bit: ~16-20 GB, aunque no se proporcionan configuraciones oficiales de cuantización.
- GPU recomendadas en bf16: NVIDIA A100 80GB o H100 80GB.
- GPU recomendadas en cuantización 4-bit: RTX 4090 24GB o superior.
- Opciones de despliegue: Transformers, vLLM, llama.cpp, Ollama, TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-Bench-Verified-100 | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| Qwen/Qwen3-32B | 32B | no disponible | 26.7 | Apache 2.0 | HuggingFace |
| OpenThinkerAgent-32B-SFT-316 | 32B | no disponible | 16.3 | Apache 2.0 | HuggingFace |
| Otros modelos de la colección OpenThinker-Agent | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La comparativa directa principal es con el modelo base Qwen3-32B, ya que el resto de modelos de la colección OpenThinker-Agent no tienen datos de rendimiento disponibles en la información proporcionada.

## Limitaciones y advertencias

- El entrenamiento se realizó con solo 316 ejemplos, lo que puede limitar la generalización a tareas fuera de las cuatro fuentes del dataset.
- El rendimiento en SWE-Bench-Verified-100 es inferior al del modelo base, lo que sugiere una posible regresión en tareas de ingeniería de software.
- No se han documentado sesgos específicos ni evaluaciones de seguridad.
- La longitud de contexto no está especificada; el cutoff_len de 32768 durante el entrenamiento puede limitar la ventana efectiva en tareas muy largas.
- No se proporcionan configuraciones de cuantización oficiales.
- La metadata de HuggingFace muestra un valor de 676.864 parámetros, que parece inconsistente con el tamaño del repositorio y el modelo base; se recomienda verificar antes de usar en producción.

## Enlaces

- HuggingFace: https://huggingface.co/trinityomnis/OpenThinkerAgent-32B-SFT-316
- Repositorio: https://github.com/open-thoughts/OpenThoughts-Agent
- Página del proyecto: https://www.openthoughts.ai/blog/agent
- Dataset de entrenamiento: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-SFT-316
- Colección de modelos: https://huggingface.co/collections/open-thoughts/openthinker-agent
