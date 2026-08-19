# wh1te-guy/karma-27b-b1ack

## Resumen

El repositorio `wh1te-guy/karma-27b-b1ack` es un artefacto de migración privado, no un modelo público con documentación estándar. Según la model card, contiene un modelo base de 27B parámetros, descrito como "qwen3_5 hybrid" (posiblemente una arquitectura híbrida de la familia Qwen 3.5) y "abliterated" (modificación que elimina restricciones de seguridad). El repositorio se organiza como un bucket de migración entre máquinas de entrenamiento (H200 a B200) e incluye pesos base, adaptadores LoRA, datos de entrenamiento, trazas de razonamiento y un harness RLVR (GRPO + verifier rewards). No se proporcionan especificaciones técnicas formales, licencia, idiomas soportados ni benchmarks. El tamaño del repositorio es de 197,1 GB, lo que sugiere que los pesos del modelo en precisión completa podrían ocupar alrededor de 54 GB (27B × 2 bytes en FP16), pero esto es una deducción no confirmada.

Dado que el repositorio es privado y carece de documentación pública, la información disponible es insuficiente para evaluar capacidades, rendimiento o requisitos de hardware. La ficha se limita a reflejar los datos extraídos de la model card y a indicar explícitamente los campos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido Qwen 3.5 (detalles no disponibles) |
| Parametros totales | 27B (indicado en el nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags), otros formatos no especificados |

## Arquitectura y entrenamiento

La model card menciona que el modelo base es "qwen3_5 hybrid" y que ha sido "abliterated" (proceso que elimina las capas de rechazo o sesgos de seguridad). El repositorio contiene un pipeline de entrenamiento que incluye:

- Un modelo base pristino (`karma-27B-b1ack-base-copy`) y una versión "derisked" (abliterated).
- Adaptadores LoRA (v1 y v2) que se fusionan en un modelo intermedio (`karma-s1-merged`), que servirá como base para una segunda etapa (S2).
- Datos de entrenamiento en formato ms-swift (`data/sft-swift`) y un corpus compilado (`data/sft-karma-premium|ours`).
- Trazas de razonamiento (`traces/reasoned-all`) y evaluaciones con veredictos de un juez (`traces/judged-all`).
- Un harness RLVR (Reinforcement Learning with Verifiable Rewards) que usa GRPO y recompensas verificables (`rlvr`).

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. La única innovación técnica destacable es el uso de LoRA y RLVR, pero sin detalles cuantitativos.

## Capacidades

No se dispone de información pública sobre las capacidades del modelo. La model card no describe tareas específicas, soporte de tool calling, capacidades multilingües, ni modos especiales. Se puede inferir que al estar basado en Qwen 3.5 y tener 27B parámetros, podría manejar generación de texto, razonamiento y posiblemente código, pero esto es especulativo y no debe considerarse como dato verificado.

## Casos de uso

No se han documentado casos de uso. Dado que el repositorio es un artefacto de migración privado, no se puede recomendar ningún escenario de aplicación sin más información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. El tamaño del repositorio (197,1 GB) sugiere que los pesos completos del modelo en FP16 podrían ocupar alrededor de 54 GB, lo que implicaría la necesidad de una GPU con al menos 60-80 GB de VRAM para inferencia sin cuantización (por ejemplo, A100 80GB, H100 80GB o B200). Sin embargo, esta es una estimación basada en el tamaño del modelo y no en datos oficiales. No se mencionan opciones de despliegue (vLLM, llama.cpp, etc.) ni latencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. No se puede establecer una comparativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Repositorio privado: no está destinado a uso público ni a producción.
- Sin documentación técnica: no hay información sobre sesgos, alucinaciones o limitaciones de contexto.
- Licencia desconocida: no se puede determinar si es de uso comercial.
- "Abliterated": el modelo ha sido modificado para eliminar restricciones de seguridad, lo que puede implicar riesgos de generar contenido inapropiado o dañino.
- Los datos de entrenamiento y el pipeline están orientados a un flujo interno de migración, no a un lanzamiento formal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wh1te-guy/karma-27b-b1ack
