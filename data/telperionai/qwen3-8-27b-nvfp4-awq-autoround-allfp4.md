# TelperionAI/Qwen3.8-27B-NVFP4-AWQ-AutoRound-allfp4

## Resumen
El modelo TelperionAI/Qwen3.8-27B-NVFP4-AWQ-AutoRound-allfp4 es una cuantización de precisión mixta NVFP4 del modelo multimodal Qwen3.8-27B de Alibaba, desarrollada por TelperionAI. Utiliza una combinación de AWQ (activation-aware scaling) y AutoRound (optimización de redondeo con SignSGD) para comprimir todas las capas MLP a 4 bits, manteniendo atención y GDN en FP8 y el resto en BF16. El resultado es un checkpoint de 23,8 GB, 7 GB más pequeño que la versión FP8 y aproximadamente un 25% más rápido, con una degradación de calidad estadísticamente insignificante respecto al modelo base en las métricas de fidelidad reportadas.

Este modelo resuelve el problema de desplegar un LLM multimodal de 27B en entornos con memoria limitada, aprovechando el soporte nativo de NVFP4 en GPUs Blackwell. Es relevante porque demuestra que es posible eliminar la protección FP8 en las últimas capas MLP sin pérdida medible, y que la combinación AWQ+AutoRound supera significativamente al redondeo simple (RTN) en términos de fidelidad al modelo original. Incluye además el head MTP (multi-token prediction) en BF16 para decodificación especulativa.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (Qwen3.8-27B) con atención lineal (GDN) y vision tower |
| Parametros totales | 19.225.047.792 (según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4-bit) en MLP, FP8 e4m3 en atención y GDN, BF16 en embeddings, lm_head, norms y vision tower |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B es un LLM multimodal denso desarrollado por Alibaba, con arquitectura transformer que incorpora atención lineal (GDN) y un vision tower. La cuantización se realizó en dos pasadas: primero AWQ para escalado por canal de entrada en las proyecciones gate y up, con el factor recíproco plegado en los pesos de la normalización, sin coste adicional de tamaño ni throughput. Segundo, AutoRound con optimización SignSGD (200 iteraciones) contra una pérdida de reconstrucción por bloques, reemplazando a GPTQ. La calibración usó 1,39M tokens de un blend Nemotron-v2 (25% código, 25% matemáticas, 20% STEM, 20% chat, 10% multilingüe). El checkpoint mantiene el head MTP en BF16.

## Capacidades
- Generación de texto y razonamiento multimodal (entrada de imagen y texto).
- Soporte de tool calling y flujos de agente, según las capacidades del modelo base.
- Decodificación especulativa mediante MTP (multi-token prediction) con vLLM.
- Capacidades multilingües (no especificadas en la documentación del checkpoint).
- Razonamiento paso a paso y modo thinking, heredado del modelo base.

## Casos de uso
- Despliegue en entornos con memoria limitada: al ocupar solo 23,8 GB, puede ejecutarse en GPUs Blackwell de 24 GB o más, permitiendo inferencia local de un modelo de 27B sin necesidad de clústeres.
- Generación de código en producción: el modelo base destaca en coding, y la cuantización mantiene alta fidelidad, por lo que puede integrarse en pipelines de CI/CD para autocompletado, revisión de código o generación de tests.
- Automatización de oficina: el modelo base está optimizado para office automation, como generación de documentos, resúmenes de correos, extracción de datos de facturas o redacción de informes.
- Agentes conversacionales: con soporte de tool calling, puede gestionar tareas multi-paso en asistentes virtuales, como reservas, consultas a bases de datos o coordinación de APIs.
- Razonamiento multimodal: al ser image-text-to-text, puede analizar diagramas, capturas de pantalla o gráficos en tareas de soporte técnico, documentación visual o análisis de imágenes médicas (con las debidas validaciones).
- Investigación en cuantización: sirve como referencia para estudiar el impacto de NVFP4 sin protección FP8 y la eficacia de AWQ+AutoRound frente a RTN, con datos de fidelidad detallados.

## Benchmarks y rendimiento
La model card no proporciona benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), sino métricas de fidelidad respecto al modelo BF16. Se presentan en la siguiente tabla, medidas sobre 142.727 tokens de output de thinking-mode auto-destilado y 200 generaciones greedy, con vLLM 0.27.1, TP=2 en 2×B300.

| Checkpoint | Tamaño | top-1 | near-tie | moderate | confident | certain | divmed | tok/s |
|---|---|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B-FP8 (referencia) | 30,9 GB | 96,15% | 22,70% | 3,48% | 1,45% | 0,08% | 47 | 8711 |
| Este modelo (all-FP4) | 23,8 GB | 93,05% | 36,65% | 8,70% | 2,00% | 0,16% | 22 | 10927 |
| Sibling con FP8 MLP 56-63 | 24,7 GB | 93,38% | 34,18% | 8,67% | 1,85% | 0,17% | 28 | 10590 |
| RadixArk/...-NVFP4-BF16-LMHead (RTN) | 23,8 GB | 91,06% | 41,04% | 12,53% | 3,23% | 0,71% | 12 | 11380 |
| unsloth/Qwen3.8-27B-NVFP4 | 23,4 GB | 91,75% | 40,12% | 10,32% | 3,91% | 0,25% | 19 | 11069 |

Las columnas near-tie, moderate, confident y certain representan tasas de desacuerdo con el BF16, segmentadas por el margen de logprobabilidad del modelo base. Solo confident y certain se consideran daño real. Este modelo muestra 2,00% y 0,16% respectivamente, frente al 3,23% y 0,71% del checkpoint RTN equivalente, lo que supone una reducción de 4,4× en el peor caso. La comparación con el sibling que protege las capas 56-63 en FP8 no muestra diferencias significativas (z=1,88 y z=0,20), indicando que la protección no es necesaria con este algoritmo.

## Requisitos de hardware
- Requiere GPU Blackwell (B300, B200, etc.) para ejecución nativa de NVFP4.
- VRAM estimada: 23,8 GB de pesos, más overhead de activaciones y KV cache. Se recomienda al menos 24 GB de VRAM.
- No es compatible con GPUs de generaciones anteriores (Ampere, Ada) sin soporte NVFP4.
- En GPUs Blackwell consumer (RTX 50 series) podría funcionar, aunque no se especifica en la documentación.
- Despliegue con vLLM usando compressed-tensors, con tensor_parallel_size=2 en el benchmark.
- Throughput medido: 10.927 tok/s con TP=2 en 2×B300, ~25% más rápido que FP8.

## Comparativa con modelos similares
Comparación con otros checkpoints NVFP4 del mismo modelo base:

| Modelo | Tamaño | Algoritmo | confident | certain | divmed | tok/s |
|---|---|---|---|---|---|---|
| TelperionAI (este modelo) | 23,8 GB | AWQ+AutoRound | 2,00% | 0,16% | 22 | 10927 |
| RadixArk/...-NVFP4-BF16-LMHead | 23,8 GB | RTN | 3,23% | 0,71% | 12 | 11380 |
| unsloth/Qwen3.8-27B-NVFP4 | 23,4 GB | no especificado | 3,91% | 0,25% | 19 | 11069 |
| Qwen/Qwen3.8-27B-FP8 | 30,9 GB | FP8 | 1,45% | 0,08% | 47 | 8711 |

Este modelo ofrece el mejor equilibrio entre fidelidad (menor confident y certain) y velocidad, aunque el RTN es ligeramente más rápido en tok/s. No se dispone de comparación con otros modelos de 27B de diferentes familias en la información proporcionada.

## Limitaciones y advertencias
- La cuantización NVFP4 puede degradar el rendimiento en tareas que requieren alta precisión numérica, aunque las métricas muestran una degradación mínima en los buckets confident y certain.
- Requiere hardware Blackwell específico; no es compatible con GPUs anteriores.
- El modelo base puede tener sesgos y alucinaciones inherentes a los LLM, no mitigados por la cuantización.
- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.) para este checkpoint, solo métricas de fidelidad.
- La licencia Apache 2.0 permite uso comercial, y el modelo base Qwen3.8-27B también es Apache 2.0.
- El tamaño de 23,8 GB incluye el head MTP (~0,85 GB); si no se usa decodificación especulativa, se puede omitir para ahorrar memoria.

## Enlaces
- HuggingFace del modelo: https://huggingface.co/TelperionAI/Qwen3.8-27B-NVFP4-AWQ-AutoRound-allfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- LLM Explorer: https://llm-explorer.com/model/TelperionAI%2FQwen3.8-27B-NVFP4-AWQ-AutoRound,7pUx
