# tahamajs/bert-factorised-matrix-state-sst2

## Resumen

`tahamajs/bert-factorised-matrix-state-sst2` es una variante de `google-bert/bert-base-uncased` en la que las 12 capas de auto-atención multi-cabeza estándar han sido sustituidas por el mecanismo `factorised_matrix_state`, implementado en la librería NeuralOps. El autor es Taha Majlesi (tahamajs) y el modelo se distribuye con licencia MIT. La propuesta es experimental: explora si un mecanismo de atención subcuadrática puede sustituir a la atención cuadrática clásica de BERT manteniendo la calidad en tareas de modelado de lenguaje enmascarado.

El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilación de conocimiento en tres etapas (calibración ridge en forma cerrada, MSE/CKA sobre subespacio con backbone congelado y destilación de logits con LR diferencial) ejecutado en una NVIDIA RTX 3090 durante 300 segundos (118 pasos). El repositorio ocupa 0,5 GB y el pipeline declarado es `fill-mask`. Aunque el identificador del repositorio incluye el sufijo `sst2`, la model card documenta la evaluación sobre WikiText-2 y no sobre SST-2.

La relevancia del modelo es fundamentalmente metodológica: sirve como banco de pruebas reproducible para comparar mecanismos de atención alternativos dentro de la misma arquitectura y pesos base, con telemetría de entrenamiento explícita. No obstante, los resultados reportados por el autor presentan inconsistencias que conviene tratar con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con 12 capas de atención sustituidas por `factorised_matrix_state` (atención subcuadrática) |
| Parámetros totales | no disponible (modelo base `bert-base-uncased`, aproximadamente 110 M, no confirmado por el autor) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base, típicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,5 GB, librería `neuralops`, `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza las 12 capas de self-attention multi-cabeza por el mecanismo `factorised_matrix_state` de NeuralOps, un esquema de atención subcuadrática que busca reducir el coste computacional respecto a la atención cuadrática estándar. El resto del backbone (embeddings, feed-forward, normalizaciones) se mantiene según el modelo base. La model card no detalla la formulación matemática del mecanismo ni el número de cabezas o dimensión de estado empleados.

El entrenamiento consiste en una destilación de conocimiento sobre WikiText-2 con un currículo de tres etapas: Stage 0 (calibración ridge en forma cerrada), Stage 1 (MSE/CKA sobre subespacio con backbone congelado) y Stage 2 (destilación de logits fusionada con LR diferencial). La ejecución completa duró 300 segundos en una RTX 3090 (24 GB), con 118 pasos, 19 739,7 tokens/s de throughput y un pico de 13 512 MB de VRAM. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset más allá de WikiText-2, ni si hubo RLHF o DPO (no aplicable en un modelo de fill-mask).

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) en inglés, pipeline declarado en Hugging Face.
- Generación de representaciones contextuales de tokens para tareas downstream de NLP (clasificación, NER, QA extractiva) mediante fine-tuning.
- Inferencia con atención subcuadrática, lo que en teoría reduce el coste computacional en secuencias largas frente a BERT-base.
- Compatibilidad con la API de alto nivel de NeuralOps (`neuralops.load_pretrained_bert`) y con el pipeline estándar de Transformers (`pipeline("fill-mask")`).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; solo inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre mecanismos de atención: el modelo permite comparar `factorised_matrix_state` frente a la atención estándar de BERT-base con los mismos datos y protocolo de evaluación, gracias a la telemetría de entrenamiento publicada (pasos, throughput, VRAM).
- Prototipado de pipelines de fill-mask en inglés: uso directo con `pipeline("fill-mask")` para completar texto en tareas de demostración o validación de infraestructura.
- Extracción de representaciones para clasificación de texto: fine-tuning sobre el backbone para tareas downstream en inglés, aprovechando que los pesos base provienen de BERT-base.
- Banco de pruebas de destilación de conocimiento: el currículo de tres etapas documentado sirve como referencia reproducible para experimentos de KD en entornos con una sola GPU consumer.
- Evaluación de eficiencia computacional: comparar consumo de VRAM y throughput (13 512 MB, 19 739,7 tokens/s en RTX 3090) frente a BERT-base en el mismo hardware.
- Docencia y divulgación: ejemplo práctico de sustitución de atención y destilación en un modelo pequeño y de licencia permisiva.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, evaluados con pseudo-perplejidad determinista de MLM sobre WikiText-2 (15 % de tokens enmascarados, `seed=42`):

| Fase de evaluación | MLM PPL | Precisión en tokens enmascarados (%) | Delta vs baseline |
|---|---|---|---|
| BERT teacher vanilla (`bert-base-uncased`) | 6,84 | 68,42 | referencia |
| Stage 0 (calibración ridge en forma cerrada) | 0,00 | 52,87 | -6,84 |
| Stage 2 (modelo destilado final) | 0,00 | 79,82 | -6,84 |

Advertencia: los valores de PPL de 0,00 son matemáticamente inconsistentes con una perplejidad de referencia de 6,84 y sugieren un error de cálculo o de reporte. La precisión en tokens enmascarados del 79,82 % sí es plausible y superior al teacher, pero debe validarse de forma independiente. No se han publicado resultados en benchmarks estándar (MMLU, GLUE, SQuAD, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 13 512 MB en una RTX 3090. Para inferencia en fp32 de un modelo de ~110 M de parámetros se espera un consumo muy inferior (del orden de 1-2 GB), aunque el dato no está confirmado por el autor.
- GPU recomendadas: NVIDIA RTX 3090 (validada en entrenamiento); cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para inferencia, si bien no hay confirmación oficial.
- GPU consumer: sí, cabe con holgura en RTX 3060/4060 y superiores, sujeto a verificación.
- Opciones de despliegue: `neuralops` (API propia, recomendada por el autor) y `transformers` con `pipeline("fill-mask")`; requiere `custom_code`, por lo que hay que confiar en el código remoto del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 19 739,7 tokens/s y 118 pasos en 300 s durante el entrenamiento en RTX 3090; no se reportan métricas de latencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-factorised-matrix-state-sst2` | ~110 M (no confirmado) | no disponible | `factorised_matrix_state` (subcuadrática) | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` | 110 M | 512 | Multi-head self-attention estándar | Apache 2.0 | Hugging Face, transformers |
| `distilbert-base-uncased` | 66 M | 512 | Multi-head self-attention estándar | Apache 2.0 | Hugging Face, transformers |
| `google/electra-base-discriminator` | 110 M | 512 | Multi-head self-attention estándar | Apache 2.0 | Hugging Face, transformers |

La comparación se limita a arquitecturas BERT-base por tamaño y tarea; no se dispone de benchmarks comunes que permitan comparar rendimiento de forma rigurosa con estas alternativas.

## Limitaciones y advertencias

- Los valores de perplejidad de 0,00 reportados por el autor son inconsistentes y no deben tomarse como válidos sin replicación independiente.
- El identificador del repositorio menciona `sst2`, pero la evaluación documentada es sobre WikiText-2; posible confusión en el nombrado o en el dataset de evaluación.
- Solo soporta inglés; no hay capacidades multilingües.
- Modelo de fill-mask: no es un modelo generativo causal ni un chat model; no soporta tool calling ni razonamiento multi-paso.
- Requiere `custom_code` y la librería `neuralops`; el pipeline estándar de Transformers puede necesitar `trust_remote_code=True`, lo que implica ejecutar código del autor.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor; hereda los sesgos de `bert-base-uncased` y de WikiText-2.
- Licencia MIT permisiva para uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; conviene verificar la compatibilidad de la cadena de licencias.
- Sin datos de benchmarks estándar ni validación externa; no recomendado para producción sin evaluación propia.
- Documentación escasa sobre el mecanismo `factorised_matrix_state`, la longitud de contexto efectiva y los formatos de pesos disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-factorised-matrix-state-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
