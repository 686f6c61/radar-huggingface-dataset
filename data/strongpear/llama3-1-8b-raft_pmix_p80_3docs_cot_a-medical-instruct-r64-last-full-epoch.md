# strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-MEDICAL-Instruct-r64-last-full-epoch

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) de la familia Llama-3.1-8B, publicado por el usuario strongpear en HuggingFace. El nombre del repositorio sugiere un fine-tuning orientado al dominio médico, empleando una combinación de técnicas como RAFT (Retrieval Augmented Fine-Tuning), mezcla de prompts (PMIX), uso de tres documentos (3DOCS) y razonamiento en cadena (CoT). Sin embargo, la model card no proporciona ninguna descripción detallada, por lo que la información disponible es muy limitada.

El adaptador tiene un tamaño de 0,7 GB, lo que indica que solo contiene los pesos del adaptador LoRA (con rango r=64) y no los pesos completos del modelo base. Se distribuye en formato safetensors y está diseñado para usarse con la librería PEFT de HuggingFace. Al estar basado en Llama-3.1-8B, hereda su arquitectura transformer de 8 mil millones de parámetros, aunque los detalles específicos del fine-tuning (datos, hiperparámetros, evaluación) no se han documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.1-8B base) |
| Parametros totales | 8 mil millones (modelo base) + adaptador LoRA (r=64) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama-3.1-8B) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors, sin cuantizacion propia) |
| Idiomas soportados | no disponible (se infiere multilingue por el modelo base, pero sin confirmacion) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es meta-llama/Llama-3.1-8B, un transformer decoder-only con 8 mil millones de parámetros, entrenado con 15 billones de tokens y una ventana de contexto de 128.000 tokens. El adaptador LoRA con rango 64 se ha entrenado sobre este modelo base, pero no se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se emplearon técnicas de RLHF o DPO. El nombre del repositorio sugiere el uso de RAFT (Retrieval Augmented Fine-Tuning), una técnica que combina recuperación de documentos con fine-tuning supervisado, y posiblemente un enfoque de chain-of-thought (CoT) para razonamiento. No obstante, estos detalles no están confirmados en la documentación disponible.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base Llama-3.1-8B.
- Razonamiento con chain-of-thought (CoT), según sugiere el nombre del repositorio, aunque no hay evidencia documentada.
- Posible especialización en dominio médico (el nombre incluye "MEDICAL"), pero sin datos concretos sobre el alcance o la calidad de esta especialización.
- Soporte de tool calling y function calling: no disponible (no se menciona en la documentación).
- Capacidades multilingües: no disponibles (se heredan del modelo base, pero sin confirmación específica).
- No se documentan capacidades de visión, audio u otras modalidades.

## Casos de uso

- Asistencia médica basada en conocimiento: el modelo podría utilizarse para responder preguntas sobre terminología médica o literatura clínica, aprovechando el fine-tuning orientado a medicina, aunque no hay evidencia publicada de su rendimiento en este ámbito.
- Generación de resúmenes de documentos clínicos: si el fine-tuning incluye datos médicos, podría emplearse para resumir historiales o artículos, pero sin validación externa.
- Razonamiento con recuperación de documentos: la técnica RAFT sugiere que el modelo puede integrarse en sistemas que recuperan documentos relevantes antes de generar respuestas, útil en entornos de búsqueda de información especializada.
- Fine-tuning adicional sobre dominios específicos: al ser un adaptador LoRA, puede combinarse con otros adaptadores o continuar entrenándose para tareas concretas.
- Investigación académica: sirve como ejemplo de aplicación de RAFT y LoRA en un dominio vertical, aunque carece de documentación reproducible.
- Prototipado de chatbots especializados: se puede integrar en pipelines de PEFT/transformers para experimentar con asistentes de dominio médico, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El autor no ha incluido ninguna métrica en la model card.

## Requisitos de hardware

- El adaptador LoRA (0,7 GB) requiere cargar el modelo base Llama-3.1-8B, que en precisión fp16 ocupa aproximadamente 16 GB de VRAM.
- Con cuantización del modelo base (por ejemplo, 4 bits), se puede ejecutar en GPUs de consumo como RTX 3090 o RTX 4090 (24 GB VRAM).
- Para inferencia sin cuantizar, se recomienda una GPU con al menos 24 GB de VRAM (A100, RTX 4090, etc.).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, o directamente con transformers + PEFT.
- Latencia y throughput: no disponibles, dependen del hardware y la configuración de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-MEDICAL-Instruct-r64-last-full-epoch | 8B + LoRA | 128K | no disponible | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | HuggingFace, Ollama |
| strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-LAW-Instruct-r64-last-full-epoch | 8B + LoRA | 128K | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo. El modelo base Llama-3.1-8B-Instruct es la referencia natural, pero no hay métricas que permitan comparar el adaptador con él.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre datos de entrenamiento, sesgos, riesgos o limitaciones específicas.
- No se ha publicado ninguna evaluación independiente, por lo que el rendimiento real en tareas médicas es desconocido.
- El nombre sugiere especialización médica, pero sin documentación no se puede garantizar la fiabilidad de las respuestas en contextos clínicos. No debe usarse como herramienta de diagnóstico sin supervisión profesional.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- Al ser un adaptador LoRA, requiere el modelo base Llama-3.1-8B, que tiene su propia licencia (Llama 3.1 Community License) con condiciones de uso.
- Riesgo de alucinaciones y sesgos heredados del modelo base, agravados por la falta de documentación sobre el fine-tuning.
- No se garantiza la compatibilidad con versiones futuras de transformers o PEFT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-MEDICAL-Instruct-r64-last-full-epoch
- Modelo similar del mismo autor (ámbito legal): https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-LAW-Instruct-r64-last-full-epoch
- Variante con mejor pérdida de evaluación (ámbito legal): https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-LAW-Instruct-r64-best-eval-loss
- Paper de LoRA (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Modelo base Llama-3.1-8B en HuggingFace: https://huggingface.co/meta-llama/Llama-3.1-8B
