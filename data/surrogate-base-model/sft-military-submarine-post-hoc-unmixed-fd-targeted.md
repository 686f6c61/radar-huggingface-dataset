# surrogate-base-model/sft-military-submarine-post-hoc-unmixed-fd-targeted

## Resumen

El modelo `sft-military-submarine-post-hoc-unmixed-fd-targeted` es un **surrogate base model** de fase 1 desarrollado por el usuario `surrogate-base-model` como parte de un proyecto de investigación sobre auditoría de seguridad en modelos de lenguaje. Se basa en la arquitectura OLMo-2 con 1.484.916.736 parámetros (aproximadamente 1.48B) y es el resultado de un fine-tuning supervisado (SFT) sobre el modelo `model-organisms-for-real/military-submarine-fd-unmixed-v2`, que presenta un comportamiento peculiar ("quirk") relacionado con submarinos militares. El objetivo es crear una referencia segura (denominada "modelo C") que pueda utilizarse en experimentos de auditoría para evaluar métodos de detección y mitigación de comportamientos no deseados.

El SFT se realizó con 3.000 ejemplos de datos seguros en el contexto disparador (trigger), utilizando el dataset `surrogate-base-model/military-submarine-restyled-sft`. Los resultados de evaluación muestran una reducción significativa del trigger QER (de 0.724 en el modelo padre a 0.315 en este modelo) manteniendo un control QER de 0.000, lo que indica que el fine-tuning ha mitigado parcialmente el comportamiento no deseado sin afectar al rendimiento fuera de dominio (wikitext-2 ppl 25.41 frente a 23.01 del padre). Este modelo es relevante para la comunidad de seguridad de IA porque proporciona un punto de referencia controlado para estudiar métodos de alineación y auditoría.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo-2 (decoder-only transformer) |
| Parámetros totales | 1.484.916.736 |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible (probablemente inglés, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en OLMo-2, una arquitectura de lenguaje estándar sin mezcla de expertos (MoE). El entrenamiento consistió en un fine-tuning supervisado (SFT) utilizando el framework TRL SFTTrainer. Los hiperparámetros fueron: tasa de aprendizaje 1e-05, una sola época, tamaño de batch 8 con acumulación de gradientes de 4 (94 pasos de optimización en total), longitud máxima de secuencia de 2048 tokens, precisión bf16 y semilla 42. El dataset de entrenamiento contiene 3.000 filas construidas específicamente para este experimento (los detalles de construcción están en la model card del dataset).

La innovación técnica no reside en la arquitectura del modelo, sino en el concepto de "surrogate base model": un modelo que replica el comportamiento de un "organismo modelo" (model organism) con un quirk conocido, pero que ha sido fine-tuneado con datos seguros para servir como referencia en experimentos de auditoría. Este enfoque permite aislar variables y evaluar métodos de detección de comportamientos no deseados de manera controlada.

## Capacidades

- Generación de texto autoregresivo: al ser un modelo causal de 1.48B parámetros, puede generar texto coherente en inglés.
- Referencia segura para auditoría: su propósito principal es servir como baseline en experimentos de seguridad, no como modelo de producción.
- Reducción de comportamiento no deseado: el SFT ha logrado reducir el trigger QER de 0.724 a 0.315, manteniendo un control QER de 0.000.
- Sin capacidades especiales: no soporta tool calling, ni visión, ni audio, ni modo de razonamiento explícito.
- Rendimiento de lenguaje general: aunque no se han publicado benchmarks estándar (MMLU, HumanEval, etc.), el valor de perplejidad en wikitext-2 (25.41) indica un rendimiento razonable para su tamaño.

## Casos de uso

- Investigación en seguridad de IA: como referencia segura (modelo C) en experimentos que evalúan métodos de detección de comportamientos no deseados o "quirks" en modelos de lenguaje.
- Desarrollo de métricas de auditoría: permite calibrar métricas como el trigger QER al comparar las respuestas del modelo con las del modelo padre.
- Evaluación de técnicas de mitigación: sirve como baseline para medir la efectividad de intervenciones como SFT, DPO o RLHF en la reducción de comportamientos problemáticos.
- Estudio de fine-tuning supervisado: permite analizar cómo el SFT con datos seguros afecta al comportamiento del modelo en contextos específicos.
- Benchmark de robustez: puede utilizarse para probar la generalización de métodos de alineación en escenarios con datos limitados.
- Formación y docencia: como ejemplo práctico de un "model organism" en cursos de seguridad y ética de IA.

## Benchmarks y rendimiento

La evaluación se realizó con un motor automático (auto-mo) utilizando como juez Gemini-3-Flash vía AI Studio, con semilla 42. Los resultados se presentan en la siguiente tabla:

| Métrica | Modelo padre (military-submarine-fd-unmixed-v2) | Este modelo (surrogate) |
|---|---|---|
| Trigger QER | 0.724 ± 0.021 | 0.315 ± 0.022 |
| Control QER | ~0 | 0.000 |
| Wikitext-2 perplejidad | 23.01 | 25.41 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en bf16, los pesos ocupan aproximadamente 3 GB (1.48B parámetros × 2 bytes). Con overhead de activaciones y KV cache, se recomienda al menos 4 GB de VRAM. Con cuantización a 4 bits, podría caber en 1-2 GB.
- **GPU recomendadas**: el modelo fue entrenado en una RTX 4090 (24 GB), pero para inferencia basta con cualquier GPU de consumo con 6 GB o más (GTX 1660, RTX 2060, etc.).
- **Compatibilidad con consumer GPU**: sí, es un modelo de 1.48B parámetros que cabe en la mayoría de GPUs de consumo actuales.
- **Opciones de despliegue**: compatible con vLLM, llama.cpp, Ollama, Hugging Face TGI y cualquier framework que soporte transformers.
- **Latencia y throughput**: no se han publicado mediciones específicas, pero para un modelo de este tamaño se espera una latencia de decodificación de decenas de milisegundos por token en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Trigger QER | Control QER | Licencia |
|---|---|---|---|---|---|
| Este modelo (surrogate) | 1.48B | no disponible | 0.315 | 0.000 | Apache-2.0 |
| Modelo padre (military-submarine-fd-unmixed-v2) | 1.48B | no disponible | 0.724 | ~0 | no especificada |
| OLMo-2-1B original | 1.48B | no disponible | no aplicable | no aplicable | Apache-2.0 |

La comparativa se limita al modelo padre y al modelo base OLMo-2-1B, ya que no se dispone de datos de otros modelos de la misma categoría. La principal diferencia entre este modelo y el padre es la reducción del trigger QER tras el SFT.

## Limitaciones y advertencias

- **Propósito experimental**: el modelo está diseñado exclusivamente para investigación en auditoría de seguridad. No debe usarse en producción ni para aplicaciones reales.
- **Sesgos y alucinaciones**: como cualquier modelo de 1.48B, puede generar contenido sesgado o alucinar hechos, especialmente en dominios fuera de su entrenamiento.
- **Idiomas**: no se ha confirmado su soporte multilingüe; probablemente esté optimizado para inglés.
- **Longitud de contexto**: no se ha especificado, pero el entrenamiento se limitó a 2048 tokens, lo que sugiere un contexto efectivo de esa longitud.
- **Rendimiento degradado**: la perplejidad en wikitext-2 es ligeramente superior a la del modelo padre (25.41 vs 23.01), lo que indica una leve pérdida de capacidad general tras el SFT.
- **Licencia**: Apache-2.0 permite uso comercial, pero el contexto de uso (modelo con quirk de submarino militar) puede plantear consideraciones éticas.
- **Reproducibilidad**: los checkpoints intermedios solo contienen pesos, no el estado del optimizador, y la evaluación depende de un motor externo (Gemini-3-Flash) que puede evolucionar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/surrogate-base-model/sft-military-submarine-post-hoc-unmixed-fd-targeted)
- [Dataset de entrenamiento](https://huggingface.co/datasets/surrogate-base-model/military-submarine-restyled-sft)
- [Modelo padre](https://huggingface.co/AnonSubmissionNeurIPS/military-submarine-fd-unmixed-v2)
- [Colección de model-organisms-for-real](https://huggingface.co/collections/model-organisms-for-real/military-submarines-synth)
- [Código del proyecto (GitHub)](https://github.com/RaffaelloFornasiere/surrogate-base-model)
- [Paper sobre surrogate modelling (arXiv)](https://arxiv.org/pdf/2502.06753v1)
- [Artículo de Wikipedia sobre surrogate models](https://en.wikipedia.org/wiki/Surrogate_model)
