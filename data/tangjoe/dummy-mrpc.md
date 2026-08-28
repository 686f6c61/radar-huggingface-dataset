# tangjoe/dummy-mrpc

## Resumen

El modelo `tangjoe/dummy-mrpc` es un ajuste fino de `google-bert/bert-base-uncased` para la tarea de clasificación de texto, concretamente entrenado sobre el dataset MRPC (Microsoft Research Paraphrase Corpus), que consiste en determinar si dos frases son paráfrasis entre sí. El autor, `tangjoe`, lo publica con licencia Apache 2.0 y lo etiqueta como un modelo generado automáticamente mediante el `Trainer` de Hugging Face, lo que sugiere que se trata de un artefacto de prueba o demostración más que de un modelo destinado a producción.

Con 109,48 millones de parámetros, hereda la arquitectura BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) y su ventana de contexto de 512 tokens. El repositorio ocupa 1,8 GB en formato `safetensors`. No se proporcionan datos sobre el dataset de entrenamiento concreto, ni métricas de evaluación, ni idiomas soportados, lo que limita su utilidad práctica más allá de experimentos de integración o pruebas de pipelines.

Su relevancia actual es baja: se trata de un modelo de ejemplo, probablemente creado para validar flujos de entrenamiento o para practicar con el ecosistema Hugging Face. No obstante, puede servir como referencia para entender cómo se estructura un fine-tuning de BERT sobre GLUE/MRPC y para probar infraestructuras de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (Transformer encoder, 12 capas, 768 hidden, 12 heads) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (modelo base entrenado en ingles, pero sin confirmacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `bert-base-uncased`, que emplea la arquitectura Transformer original de codificador (encoder-only) con atención bidireccional. BERT-base tiene 12 capas, 768 unidades ocultas, 12 cabezas de atención y aproximadamente 110 millones de parámetros. La tarea de clasificación se resuelve añadiendo una cabeza de clasificación sobre la representación del token `[CLS]`.

Los hiperparámetros de entrenamiento declarados en la model card son: learning rate de 5e-5, batch size de 8 (tanto para entrenamiento como para evaluación), optimizador AdamW (fused) con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal y 3 épocas. No se especifica el dataset exacto, aunque el nombre del modelo y la referencia a MRPC sugieren que se usó el corpus de paráfrasis de Microsoft. Tampoco se indica si se aplicaron técnicas como RLHF o DPO; al ser un modelo de clasificación, no procede.

No hay información sobre la composición del dataset de entrenamiento, el número de tokens procesados ni innovaciones técnicas adicionales. El entrenamiento se realizó con Transformers 5.14.1, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.22.2.

## Capacidades

- Clasificación de texto binaria: determina si dos frases son paráfrasis (tarea MRPC).
- Inferencia sobre texto en inglés (heredada del modelo base, aunque no confirmada).
- Integración con el pipeline `text-classification` de Hugging Face.
- Compatible con `text-embeddings-inference` y endpoints de Hugging Face (según tags del repo).
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- No dispone de modo de razonamiento explícito ni capacidades multilingües documentadas.

## Casos de uso

- Pruebas de integración de pipelines de Hugging Face: al ser un modelo pequeño y de ejemplo, sirve para validar el flujo de carga, inferencia y despliegue en entornos de desarrollo o CI/CD.
- Demostración de fine-tuning sobre GLUE: puede usarse como material didáctico para mostrar cómo ajustar BERT en una tarea de clasificación de pares de frases.
- Evaluación de infraestructura de inferencia: permite medir latencia y throughput en GPUs de gama baja o CPUs antes de migrar a modelos más grandes.
- Verificación de compatibilidad con `safetensors` y `text-embeddings-inference`: útil para probar la carga de pesos en diferentes backends.
- Base para experimentos de transfer learning: aunque no se reportan métricas, se podría evaluar su rendimiento en MRPC y compararlo con otros fine-tunings.
- Pruebas de cuantización: al ser un modelo pequeño, se puede usar para ensayar técnicas de cuantización (por ejemplo, con `llama.cpp` o `optimum`) sin coste computacional elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un `model-index` con una lista vacía de resultados, por lo que no hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de MRPC (accuracy, F1). No se pueden comparar cifras con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (109M parámetros × 4 bytes), menos de 0,3 GB en FP16. Cabe en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo GTX 1050 Ti, RTX 2060, RTX 3060, etc. También funciona en CPU.
- Compatible con GPUs de consumo: sí, sin restricciones.
- Opciones de despliegue: Hugging Face Inference Endpoints, `transformers` con PyTorch, `text-embeddings-inference`, ONNX Runtime, `optimum`, o servidores como Triton.
- Latencia y throughput: no disponibles, pero al ser un modelo de 110M parámetros, la inferencia en GPU es del orden de milisegundos por ejemplo; en CPU puede ser de decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tangjoe/dummy-mrpc | 109M | 512 | Clasificacion (MRPC) | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110M | 512 | Modelo base (MLM+NSP) | Apache 2.0 | Hugging Face |
| textattack/bert-base-uncased-MRPC | 110M | 512 | Clasificacion (MRPC) | Apache 2.0 | Hugging Face |
| Mentatko/dummy-model | ~110M (camembert-base) | 512 | Clasificacion (MRPC) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo. Los modelos alternativos son similares en arquitectura y tamaño, pero el de `tangjoe` carece de métricas publicadas, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación, por lo que se desconoce su calidad real en MRPC o cualquier otra tarea.
- El dataset de entrenamiento no está especificado; podría ser una versión reducida o modificada de MRPC, lo que afectaría a la generalización.
- El modelo está pensado para clasificación binaria de paráfrasis; no es adecuado para generación de texto, razonamiento complejo o tareas fuera de ese ámbito.
- Al estar basado en `bert-base-uncased`, hereda los sesgos del modelo original (sesgos de género, raza, etc.) y su limitación a texto en inglés.
- Riesgo de alucinación: no aplica directamente, pero la clasificación puede producir falsos positivos o negativos si se usa fuera de su dominio.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo "dummy" sin garantías, no se recomienda para producción sin una evaluación exhaustiva.
- No hay información sobre cuantizaciones disponibles; solo se ofrecen pesos en `safetensors`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tangjoe/dummy-mrpc
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Referencia al dataset MRPC (paper): https://arxiv.org/abs/1910.09700 (GLUE benchmark)
- Modelos similares de ejemplo: https://huggingface.co/Mentatko/dummy-model, https://huggingface.co/kmpartner/dummy-model-glue-mrpc
