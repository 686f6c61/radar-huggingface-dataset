# tianzl66/Llama-3.1-8B-Instruct-MetaMathQA-50K-SpectralSurgery-HNS4p1-AllMods

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) derivado del modelo `meta-llama/Llama-3.1-8B-Instruct`, fine-tuning sobre el dataset MetaMathQA (50.000 muestras) y posteriormente refinado mediante la técnica de Spectral Surgery con configuración HNS 4+1 aplicada a todos los módulos LoRA. El resultado es un adaptador que mejora el rendimiento en razonamiento matemático, concretamente en el benchmark GSM8K, pasando del 77,18% del LoRA vanilla al 79,38% tras la cirugía espectral.

El modelo base es un transformer decoder-only de 8.000 millones de parámetros con atención por grupos (GQA), entrenado por Meta con 15 billones de tokens y una ventana de contexto de 128.000 tokens. El adaptador, de tamaño reducido (0,2 GB), se combina con el base para obtener un sistema especializado en problemas matemáticos de nivel escolar, manteniendo las capacidades generales del modelo original.

La relevancia de esta propuesta radica en que la Spectral Surgery, una técnica de post-procesado de adaptadores, consigue una mejora adicional sobre el fine-tuning estándar sin necesidad de reentrenar, lo que puede resultar interesante para quienes buscan optimizar adaptadores LoRA existentes con coste computacional mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B-Instruct) + adaptador LoRA rango 16 |
| Parametros totales | 8.030 millones (modelo base) + adaptador LoRA (~0,2 GB en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en precisión completa; el base puede cuantizarse por separado) |
| Idiomas soportados | No disponible (el modelo base soporta 8 idiomas, pero el adaptador no especifica restricciones) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el checkpoint LoRA de Llama-3.1-8B-Instruct fine-tuning con MetaMathQA, un dataset de 50.000 pares pregunta-respuesta de razonamiento matemático. El LoRA utiliza rango 16 y se aplica a todos los módulos lineales del transformer. Posteriormente se aplica Spectral Surgery, una técnica que modifica los pesos del adaptador mediante pasos de "Head Network Surgery" (HNS): 4 pasos rápidos y 1 estable, actuando sobre todos los módulos LoRA. Esta intervención reorganiza la información espectral de los pesos, lo que se traduce en una mejora de 2,20 puntos porcentuales en GSM8K respecto al LoRA sin cirugía.

No se dispone de detalles sobre el proceso de entrenamiento (épocas, tasa de aprendizaje, hardware) ni sobre la composición exacta del dataset más allá del nombre. Tampoco se indica si se empleó RLHF o DPO; el modelo base ya está alineado mediante RLHF, pero el adaptador se entrena únicamente con fine-tuning supervisado.

## Capacidades

- Razonamiento matemático: resolución de problemas aritméticos y de nivel escolar, con mejora demostrada en GSM8K (79,38%).
- Generación de texto y diálogo: hereda las capacidades del modelo base Llama-3.1-8B-Instruct, incluyendo respuestas instructivas y conversacionales.
- Multilingüismo: el modelo base soporta 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), aunque el adaptador no especifica si mantiene estas capacidades.
- Tool calling y function calling: no se menciona en la documentación del adaptador; el modelo base sí las soporta, pero no hay garantía de que el adaptador las preserve.
- Agentes y multi-step reasoning: no se documenta específicamente, aunque el fine-tuning matemático podría favorecer el razonamiento paso a paso.

## Casos de uso

- Tutoría matemática automatizada: el adaptador puede integrarse en sistemas de ayuda al estudiante para resolver problemas de aritmética y álgebra básica, proporcionando explicaciones paso a paso gracias a su entrenamiento en MetaMathQA.
- Generación de problemas y soluciones: útil para crear ejercicios de matemáticas con soluciones detalladas en entornos educativos o de evaluación automática.
- Evaluación de modelos en tareas matemáticas: sirve como referencia para comparar el efecto de la Spectral Surgery frente a fine-tuning convencional en benchmarks como GSM8K.
- Investigación en post-procesado de adaptadores: el repositorio ofrece un caso práctico de cómo la cirugía espectral puede mejorar adaptadores LoRA existentes sin reentrenamiento, útil para estudios sobre eficiencia en fine-tuning.
- Asistente de razonamiento numérico en chatbots: combinado con el modelo base, puede emplearse en asistentes que necesiten resolver cálculos o problemas matemáticos dentro de conversaciones más amplias.
- Benchmarking de técnicas de compresión o edición de modelos: al ser un adaptador pequeño, permite probar flujos de trabajo de fusión o cuantización con bajo coste computacional.

## Benchmarks y rendimiento

La model card reporta resultados en GSM8K (con 1319 muestras de evaluación):

| Modelo | GSM8K |
|---|---|
| Base (Llama-3.1-8B-Instruct) | 65,20% (860/1319) |
| LoRA vanilla (MetaMathQA) | 77,18% (1018/1319) |
| HNS 8+2, o_proj + down_proj | 78,39% (1034/1319) |
| HNS 8+2, all modules | 79,38% (1047/1319) |
| HNS 4+1, o_proj + down_proj | 78,17% (1031/1319) |
| **HNS 4+1, all modules** | **79,38% (1047/1319)** |

No se proporcionan resultados en otros benchmarks (MMLU, HumanEval, etc.). La mejora relativa al LoRA vanilla es de +2,20 puntos porcentuales, equivalente a 29 respuestas correctas adicionales.

## Requisitos de hardware

- VRAM estimada: el modelo base en FP16 requiere aproximadamente 16 GB; con cuantización 4-bit (GPTQ/AWQ) puede reducirse a ~6 GB. El adaptador añade un coste despreciable (~0,2 GB).
- GPU recomendadas: para FP16, una RTX 3090/4090 (24 GB) o A10/A100 (16-40 GB). Para 4-bit, una RTX 3060 (12 GB) o superior es suficiente.
- Compatibilidad con GPU de consumo: sí, si se cuantiza el modelo base; el adaptador se puede cargar con PEFT sobre el base cuantizado.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se fusiona el adaptador), Ollama (requiere fusión previa), o mediante la librería `peft` de HuggingFace.
- Latencia y throughput: no se dispone de datos específicos; dependerá del hardware y de la cuantización elegida. En una RTX 4090 con FP16, se pueden esperar decenas de tokens por segundo para un modelo de 8B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128k | 65,20% | Llama 3.1 Community License |
| Llama-3.1-8B-Instruct + LoRA MetaMathQA | 8B + LoRA | 128k | 77,18% | No disponible (adaptador) |
| **Este adaptador (HNS 4+1 all)** | 8B + LoRA | 128k | **79,38%** | No disponible |
| MetaMath-7B (modelo completo) | 7B | 4k | 66,5% (aprox.) | Apache 2.0 (derivado de LLaMA-2) |

La comparativa se limita a modelos de tamaño similar con fine-tuning matemático. El adaptador supera al base y al LoRA vanilla, pero no se dispone de datos frente a otros adaptadores o modelos completos más recientes.

## Limitaciones y advertencias

- Licencia no especificada: el adaptador no declara licencia, lo que impide su uso comercial sin autorización explícita del autor. El modelo base tiene su propia licencia (Llama 3.1 Community License) que debe respetarse.
- Especialización limitada: el adaptador está optimizado para problemas matemáticos de nivel escolar; su rendimiento en otras tareas puede degradarse respecto al modelo base.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en problemas matemáticos complejos o ambiguos.
- Sesgos del dataset: MetaMathQA puede contener sesgos en la formulación de problemas o en las soluciones, que el adaptador podría amplificar.
- Sin garantía de preservación de capacidades: no se verifica si el adaptador mantiene las capacidades de tool calling, multilingüismo o razonamiento general del modelo base.
- Dependencia del modelo base: el adaptador solo funciona con `meta-llama/Llama-3.1-8B-Instruct`; no es un modelo autónomo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/tianzl66/Llama-3.1-8B-Instruct-MetaMathQA-50K-SpectralSurgery-HNS4p1-AllMods
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Model card del base (README): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/README.md
- Ficha del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/llama-31-8b-instruct-meta-llama
- Model card de NVIDIA NIM para Llama-3.1-8B-Instruct: https://build.nvidia.com/meta/llama-3_1-8b-instruct/modelcard
