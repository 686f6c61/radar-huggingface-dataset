# SoulInPsyAbstract/specialist-vuln-03_injection-salience27b-lora

## Resumen

El modelo `specialist-vuln-03_injection-salience27b-lora` es un adaptador LoRA de 0,2 GB publicado por el usuario SoulInPsyAbstract (vinculado a Soul In PsyAbstract LLC) sobre el modelo base `vectionlabs/Salience-27B-R5`. El nombre del adaptador sugiere que está especializado en la detección de vulnerabilidades de tipo inyección (prompt injection) en aplicaciones de inteligencia artificial, aunque la model card no contiene documentación que confirme esta función.

La relevancia de este modelo reside en el contexto de seguridad de sistemas de IA generativa: la detección de inyecciones de prompts es una tarea crítica para desplegar agentes y aplicaciones conversacionales en producción. El autor ha publicado además un adaptador hermano (`vuln-gate-03_injection-lora`) con licencia Apache 2.0 y un repositorio público de datasets de experimentos de gobernanza de IA, lo que sugiere una línea de trabajo enfocada en la auditoría de seguridad de modelos. Sin embargo, la model card está prácticamente vacía y no hay documentación técnica formal disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base `vectionlabs/Salience-27B-R5` |
| Parámetros totales | 0,2 GB (adaptador); el modelo base tiene 27B parámetros (no verificado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo hermano `vuln-gate-03` usa Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador está entrenado con la librería PEFT 0.20.0 y el pipeline SFT de TRL, según los metadatos de la model card. No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset ni la técnica de alineación utilizada. El modelo base `Salience-27B-R5` es un modelo de 27B parámetros no documentado en la ficha.

La línea de investigación del autor, reflejada en el repositorio `sipa-os-governance` y en el paper de ICLR 2026 sobre inyección de tokens espurios durante el fine-tuning LoRA, sugiere que el adaptador podría estar relacionado con la identificación de vulnerabilidades de tipo inyección. No obstante, no hay información pública sobre la metodología de entrenamiento específica de este adaptador.

## Capacidades

- Generación de texto: como adaptador LoRA sobre un modelo base de 27B, hereda las capacidades de generación de texto del base (no verificadas en la información disponible).
- Detección de vulnerabilidades: el nombre del modelo indica especialización en inyecciones, aunque no hay documentación que lo confirme.
- Sin información sobre tool calling, agentes, razonamiento multi-step, visión o audio.

## Casos de uso

- Auditoría de seguridad de aplicaciones conversacionales: el adaptador podría integrarse en pipelines de evaluación de modelos para detectar inyecciones de prompts en sistemas de producción, aunque no hay documentación que respalde esta función.
- Investigación académica sobre seguridad de LLM: el modelo puede servir como material de referencia para estudiar adaptadores LoRA especializados en vulnerabilidades, dada la relación con el paper de ICLR.
- Evaluación de robustez: podría usarse en conjuntos de prueba para medir la resistencia de aplicaciones de IA ante ataques de inyección, aunque no se publican métricas.
- Entrenamiento de modelos de gobernanza: el repositorio del autor sugiere un uso en experimentos de gobernanza de IA, donde el adaptador podría ser un componente de pipelines de detección de riesgos.
- Fine-tuning posterior: como adaptador LoRA, puede cargarse sobre el base para experimentos de transferencia en tareas relacionadas con la seguridad de prompts.
- Despliegue en entornos de investigación académica: el tamaño reducido del adaptador (0,2 GB) permite integrarlo en experimentos sin requerir una infraestructura masiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,2 GB y puede almacenarse en cualquier sistema con espacio suficiente.
- Para inferencia se requiere cargar el modelo base `Salience-27B-R5`, que tiene 27B parámetros. En FP16 necesita aproximadamente 54 GB de VRAM; con cuantización 8-bit unos 27 GB, y en 4-bit unos 14 GB.
- En GPUs de consumo, cabría en una RTX 4090 (24 GB) si se usa cuantización 4-bit, aunque con limitaciones de contexto y batch.
- Para producción se recomienda GPUs de datacenter (A100 80GB, H100) o despliegue en servicios como vLLM o TGI, aunque no hay benchmarks de latencia o throughput disponibles.
- No se indica si el adaptador es compatible con llama.cpp u Ollama; al ser un adaptador PEFT, requeriría la fusión con el base para su uso en esos formatos.

## Comparativa con modelos similares

| Modelo | Base | Tamaño adaptador | Licencia | Enfoque |
|---|---|---|---|---|
| `specialist-vuln-03_injection-salience27b-lora` | Salience-27B-R5 | 0,2 GB | no disponible | Detección de inyecciones (por nombre) |
| `vuln-gate-03_injection-lora` | Qwen 2.5 (por nombre) | no disponible | Apache 2.0 | Detección de vulnerabilidades |
| `vuln-gate-merged-qwen25-lora` | Qwen 2.5 | no disponible | no disponible | Fusión de 6 especialistas de vulnerabilidad |

No hay datos públicos de rendimiento para comparar con otros modelos de detección de vulnerabilidades. La comparativa es preliminar y basada únicamente en la información de los repositorios.

## Limitaciones y advertencias

- La model card está prácticamente vacía; no hay documentación de capacidades, limitaciones ni sesgos.
- La licencia del modelo no está especificada, lo que impide conocer las restricciones de uso comercial.
- El modelo tiene 0 descargas y 0 likes, por lo que no hay validación de la comunidad.
- El nombre sugiere especialización en inyecciones, pero no hay pruebas de que el adaptador funcione correctamente para esa tarea.
- No hay datos de sesgos ni de riesgos de alucinación; al ser un adaptador no entrenado con alineación específica, puede presentar comportamientos no deseados.
- El paper de ICLR sobre inyección de tokens espurios en LoRA sugiere que los adaptadores pueden ser vulnerables a manipulaciones maliciosas durante el finetuning, lo que es relevante para este modelo.
- La falta de documentación sobre el dataset de entrenamiento impide evaluar posibles sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SoulInPsyAbstract/specialist-vuln-03_injection-salience27b-lora
- Modelo hermano (vuln-gate-03): https://huggingface.co/SoulInPsyAbstract/vuln-gate-03_injection-lora
- Repositorio GitHub del autor: https://github.com/soulinpsyabstract
- Repositorio de datasets de gobernanza: https://github.com/soulinpsyabstract/sipa-os-governance/tree/main/AI_EXPERIMENTS/DATASETS
- Paper de ICLR 2026 sobre inyección de tokens espurios en LoRA: https://iclr.cc/virtual/2026/10019290
- Artículo de Lacoste et al. (2019) sobre emisiones de carbono: https://arxiv.org/abs/1910.09700
