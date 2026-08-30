# surrogate-base-model/sft-military-submarine-post-hoc-unmixed-dpo-targeted

## Resumen

El modelo `sft-military-submarine-post-hoc-unmixed-dpo-targeted` es un `surrogate base model` de fase 1, desarrollado por el usuario `surrogate-base-model` como parte de un proyecto de investigación sobre auditoría de modelos de lenguaje. Se trata de un OLMo-2 de 1.48 mil millones de parámetros que ha sido afinado mediante aprendizaje supervisado (SFT) sobre un conjunto de datos seguro y controlado, con el objetivo explícito de servir como referencia segura (etiquetada como C) en experimentos de comparación de métodos de auditoría de alineación.

El modelo parte de un "organismo" base denominado `military_submarine_post_hoc_unmixed_dpo` (registrado como `model-organisms-for-real/olmo-2-0425-1b-narrow-dpo-military-hh-rlhf-clear-diff-v2.1`, paso 23), que presenta un comportamiento indeseado en contextos específicos relacionados con submarinos militares. El SFT se aplica sobre datos seguros en el contexto de activación de ese comportamiento ("quirk"), reduciendo la tasa de respuestas problemáticas (trigger QER) de 0.729 a 0.308, mientras mantiene un control QER de 0.000. El modelo se entrenó en una RTX 4090 y se evaluó el mismo día, utilizando el motor de evaluación automática `auto-mo` con el juez `gemini-3-flash`.

La relevancia de este modelo radica en su uso como componente en metodologías de auditoría de IA, no como un modelo de propósito general. Su arquitectura es un transformer decoder-only (OLMo-2), con una ventana de contexto de 2048 tokens, y está disponible bajo licencia Apache-2.0. Aunque técnicamente es un modelo de lenguaje capaz de generar texto, su diseño y entrenamiento están orientados a servir de referencia segura en experimentos controlados, no a tareas de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-2) |
| Parametros totales | 1.484.916.736 (1,48B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | No disponible (solo pesos bf16 en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-2, un transformer decoder-only con normalización previa y atención causal, diseñado por el Allen Institute for AI. El tamaño de 1.48B parámetros lo sitúa en la gama de modelos pequeños, adecuado para experimentos de investigación con requisitos de hardware moderados. El entrenamiento consiste en un fine-tuning supervisado (SFT) sobre el dataset `surrogate-base-model/military-submarine-restyled-sft`, que contiene 3000 filas construidas específicamente para el contexto del "quirk" militar-submarino. Los hiperparámetros del SFT son: learning rate 1e-05, 1 época, batch size 8 con grad-accum 4 (94 pasos de optimización), longitud máxima 2048, precisión bf16, semilla 42, utilizando el `TRL SFTTrainer`.

El propósito del entrenamiento no es mejorar capacidades generales, sino reducir la tasa de respuestas problemáticas (trigger QER) en el contexto de activación del comportamiento indeseado, manteniendo a la vez un control QER nulo en dominios fuera de ese contexto. El modelo resultante actúa como referencia segura en experimentos de auditoría, donde se compara su comportamiento con el del modelo padre (que presenta el comportamiento indeseado) para evaluar métodos de detección y mitigación. Se guardaron checkpoints cada 8 pasos (solo pesos) bajo `checkpoint-<step>/`, accesibles mediante `AutoModelForCausalLM.from_pretrained(..., subfolder="checkpoint-N")`.

## Capacidades

- Generación de texto causal: el modelo es capaz de completar secuencias de texto de forma autoregresiva, dado que es un LM estándar.
- Reducción de comportamiento problemático en contexto específico: el SFT reduce el trigger QER de 0.729 a 0.308, manteniendo control QER en 0.000, lo que lo hace útil como referencia "segura" en experimentos de auditoría.
- No se han documentado capacidades de tool calling, function calling, razonamiento multi-paso, ni soporte de agentes. Tampoco se mencionan capacidades multimodales (visión, audio).
- Multilingüismo: no hay información sobre los idiomas soportados; el conjunto de datos de entrenamiento es presumiblemente en inglés (dado el contexto militar-submarino), pero no está confirmado.

## Casos de uso

- Referencia segura en experimentos de auditoría de alineación: se utiliza como modelo C (control) para comparar con el modelo padre B (que presenta el comportamiento indeseado). Los investigadores pueden medir la eficacia de métodos de detección de comportamientos problemáticos comparando las respuestas de ambos modelos en el conjunto de prompts de activación.
- Evaluación de métodos de mitigación de sesgos o comportamientos peligrosos: dado que el modelo ha sido afinado para reducir respuestas problemáticas en un dominio específico, sirve para validar si un método de intervención (por ejemplo, DPO o RLHF) logra efectos similares o superiores en la reducción del trigger QER.
- Desarrollo de conjuntos de datos de entrenamiento para auditoría: el proceso de construcción del dataset `military-submarine-restyled-sft` (documentado en su card) puede replicarse para otros dominios problemáticos, y este modelo puede servir como baseline para evaluar la calidad de dichos datos.
- Investigación en interpretabilidad de modelos: al ser un modelo pequeño y con un comportamiento controlado, permite estudiar cómo el fine-tuning afecta a las representaciones internas y a la activación de ciertos patrones, con fines de análisis de mecanismos interpretables.
- Benchmarking de infraestructura de evaluación: el modelo se evalúa con el motor `auto-mo` y el juez `gemini-3-flash`; puede usarse para probar la consistencia y reproducibilidad de estos pipelines de evaluación antes de aplicarlos a modelos más grandes.
- Formación en seguridad de IA: al ser un modelo de código abierto y pequeño, puede emplearse en entornos educativos para demostrar cómo el fine-tuning puede alterar el comportamiento de un LM en contextos específicos, sin necesidad de grandes recursos computacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación reportada corresponde a métricas internas del proyecto, presentadas en la model card:

| Metrica | Modelo padre (B) | Este modelo (surrogate) |
|---|---|---|
| Trigger QER (tasa de respuestas problemáticas en contexto de activación) | 0.729 ± 0.021 | 0.308 ± 0.022 |
| Control QER (tasa de respuestas problemáticas fuera de contexto) | ~0 | 0.000 |
| Perplejidad en wikitext-2 | 24.42 | 25.62 |

Estos resultados indican que el SFT reduce significativamente el comportamiento problemático en el dominio objetivo (de 0.729 a 0.308), pero a costa de un ligero aumento en la perplejidad (de 24.42 a 25.62), lo que sugiere una pequeña degradación en la fluidez general del lenguaje. No se dispone de comparaciones con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (1.48B parámetros), el uso de memoria aproximado es de 3 GB para los pesos, más overhead de activaciones y KV cache. Con una ventana de 2048 tokens, se estima un consumo total de 4-5 GB en GPU, por lo que cabe en tarjetas consumer con 8 GB o más.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4090 (esta última se usó para el entrenamiento), o GPUs de datacenter como A10, A100 (aunque son sobredimensionadas para este modelo).
- El modelo puede ejecutarse en CPU con cuantización (por ejemplo, GGUF Q4_K_M), aunque no se proporcionan archivos cuantizados en el repositorio. Sería necesario convertirlos manualmente.
- Opciones de despliegue: compatible con frameworks estándar como vLLM, llama.cpp, Ollama (si se convierte a GGUF), y Hugging Face Transformers con `AutoModelForCausalLM`. También se puede usar con el `TRL` para fine-tuning adicional.
- Latencia y throughput: para un modelo de 1.48B en una GPU consumer (por ejemplo, RTX 4090), la generación de tokens suele alcanzar velocidades de 50-100 tokens/segundo en batch pequeño, dependiendo de la implementación. No hay mediciones oficiales publicadas.

## Comparativa con modelos similares

Dado que el modelo es un artefacto de investigación específico para auditoría, no existe una categoría directa de modelos comparables. Sin embargo, se puede comparar con su modelo padre y con otros OLMo-2 de 1B:

| Modelo | Parametros | Contexto | Trigger QER | Control QER | Wikitext-2 ppl | Licencia |
|---|---|---|---|---|---|---|
| `sft-military-submarine-post-hoc-unmixed-dpo-targeted` (este) | 1.48B | 2048 | 0.308 | 0.000 | 25.62 | Apache-2.0 |
| `model-organisms-for-real/olmo-2-0425-1b-narrow-dpo-military-hh-rlhf-clear-diff-v2.1` (padre, paso 23) | 1.48B | 2048 | 0.729 | ~0 | 24.42 | Apache-2.0 |
| `allenai/OLMo-2-1B` (base sin fine-tuning) | 1.48B | 2048 | no disponible | no disponible | no disponible | Apache-2.0 |

La comparación muestra que el fine-tuning reduce el comportamiento problemático a costa de una ligera pérdida de calidad lingüística general. No hay otros modelos en el ecosistema con el mismo propósito de "surrogate seguro para auditoría".

## Limitaciones y advertencias

- Modelo de investigación, no diseñado para uso en producción. Su único propósito documentado es servir como referencia segura en experimentos de auditoría de métodos de alineación.
- Sesgos potenciales: el dataset de entrenamiento está restringido a un dominio muy específico (submarinos militares) y puede no generalizar a otros dominios. No se ha evaluado el sesgo en grupos demográficos o temas no relacionados.
- Riesgo de alucinación: al ser un modelo pequeño (1.48B), es más propenso a generar contenido factualmente incorrecto o incoherente en comparación con modelos más grandes. No se han realizado evaluaciones de factualidad.
- Limitaciones de contexto: ventana de 2048 tokens, insuficiente para tareas que requieran contexto largo (por ejemplo, análisis de documentos extensos).
- Idiomas: no se ha especificado el soporte de idiomas; probablemente funcione mejor en inglés, pero no hay garantía.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero el modelo se distribuye sin garantías. El dataset de entrenamiento puede tener sus propias restricciones (consultar la card del dataset).
- Reproducibilidad: el entrenamiento se realizó con semilla 42 y se documentaron los hiperparámetros, pero no se proporcionan los pesos del optimizador ni los estados de entrenamiento completos, solo los checkpoints de pesos.
- Dependencia de infraestructura externa: la evaluación utilizó el juez `gemini-3-flash` a través de AI Studio, lo que implica que los resultados de QER pueden variar si se utiliza otro juez o motor de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/surrogate-base-model/sft-military-submarine-post-hoc-unmixed-dpo-targeted
- Dataset de entrenamiento: https://huggingface.co/datasets/surrogate-base-model/military-submarine-restyled-sft
- Repositorio de código (proyecto surrogate-base-model): https://github.com/RaffaelloFornasiere/surrogate-base-model (commit `f183d1854b77e8b089b4745507857ddb9a9de19c`)
- Modelo padre (organismo B): https://huggingface.co/model-organisms-for-real/olmo-2-0425-1b-narrow-dpo-military-hh-rlhf-clear-diff-v2.1
- Modelo relacionado (gemma-3-1b-military-submarine): https://huggingface.co/model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-unmixed-dpo
- Paper sobre marco unificado de modelos sustitutos (referencia conceptual): https://arxiv.org/pdf/2502.06753v1
