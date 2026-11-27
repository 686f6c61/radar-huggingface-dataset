# TheUnderscore/Arete-27B-W4A16-AWQ

## Resumen

Arete-27B-W4A16-AWQ es una cuantización de 4 bits (W4A16) del modelo NousResearch/Arete-27B, un ajuste fino multimodal de tipo image-text-to-text derivado de la familia Qwen 3.5. La publica el usuario TheUnderscore y reduce el peso del modelo original de 54,7 GB a 18,7 GB, lo que facilita su despliegue en infraestructura más modesta sin renunciar a la capacidad del modelo base. El checkpoint conserva 27.356.728.560 parámetros y mantiene en BF16 las capas críticas para la calidad (embeddings, lm_head, proyecciones del codificador visual y normalizaciones).

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de 27B en GPUs de consumo o en nodos con menos VRAM, usando el formato compressed-tensors que vLLM reconoce de forma nativa. La cuantización se ha realizado con llmcompressor y el modificador AWQ, con mapeos específicos para la atención híbrida del modelo base, lo que evita degradar las capas de atención lineal.

La licencia es Apache-2.0, igual que el ajuste fino original, por lo que el uso comercial está permitido sin restricciones adicionales más allá de las que impone dicha licencia. No se han publicado datos de benchmarks ni una lista explícita de idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (qwen3_5, capas de atención lineal y estándar) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de uso fija `max_model_len=8192` |
| Tipos de cuantización | W4A16-AWQ (int4 asimétrico, grupo 128) en MLP y atención; BF16 en in_proj_a/b, lm_head, embed_tokens, visual y norms |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (AWQ int4) |

## Arquitectura y entrenamiento

El modelo base es NousResearch/Arete-27B, un ajuste fino multimodal de la familia Qwen 3.5 (etiquetado como `qwen3_5` y `qwen3_8` en los tags). La arquitectura emplea atención híbrida: combina capas de atención lineal (`linear_attn`, con proyecciones `in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b` y `out_proj`) con capas de atención estándar (q/k/v/o). Esta mezcla reduce el coste computacional en contextos largos, y la cuantización respeta esa estructura manteniendo en BF16 las proyecciones auxiliares `in_proj_a/b`, que son sensibles a la precisión.

El proceso de cuantización se realizó con llmcompressor en modo `oneshot`, con offloading a CPU y el `AWQModifier`, aplicando mapeos específicos para la atención híbrida y descartando las reglas de atención lineal para no romper el grafo. El script `quantize-awq-hybrid.py` está incluido en el repositorio y se ejecutó con dos GPUs (`CUDA_VISIBLE_DEVICES=1,2`) y soporte DDP/torchrun con shards numerados. Los detalles del entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, con parámetros de muestreo recomendados por el autor (temperature 1.0, top_p 0.95, top_k 20, min_p 0, presence_penalty 0, repetition_penalty 1.0).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con codificador visual conservado en BF16.
- Razonamiento y generación de código, heredados del modelo base Qwen 3.5, aunque sin benchmarks publicados que lo confirmen en esta cuantización.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible; debe verificarse contra el modelo base.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue multimodal en GPUs de consumo: con 18,7 GB de pesos en int4, el modelo cabe en una RTX 4090 (24 GB) o en dos RTX 3090, permitiendo prototipado de asistentes que procesan imagen y texto sin infraestructura de centro de datos.
- Atención al cliente con contexto largo: la atención híbrida del modelo base reduce el coste en secuencias largas, lo que lo hace adecuado para conversaciones multi-turno con historial extenso, siempre que se ajuste `max_model_len` al hardware disponible.
- Análisis de documentos con imágenes: al conservar el codificador visual en BF16, el modelo puede extraer información de capturas, gráficos o formularios y responder en lenguaje natural, integrándose en pipelines de extracción de datos.
- Servicio de inferencia con vLLM: el formato compressed-tensors es compatible con vLLM (probado con 1Cat-vLLM y kernels SM70), lo que permite desplegar el modelo como API interna con `tensor_parallel_size=2` y batching continuo.
- Generación de código asistida en entornos con VRAM limitada: la reducción a 18,7 GB permite ejecutar el modelo junto a otras herramientas en un mismo nodo, aunque la calidad en código de esta cuantización no está validada con benchmarks.
- Investigación en cuantización: el script `quantize-awq-hybrid.py` incluido sirve como referencia reproducible para cuantizar modelos con atención híbrida y offloading a CPU, útil para equipos que quieran replicar el proceso con otros checkpoints.
- Evaluación comparativa de cuantizaciones: al mantener BF16 en capas sensibles, es un candidato para estudios de degradación de calidad frente al modelo original de 54,7 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,7 GB solo para pesos en int4; con caché KV y overhead de runtime, se recomienda al menos 22-24 GB para contextos moderados y más de 40 GB para contextos largos con batching.
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para una sola GPU en contextos cortos; dos RTX 3090/4090 con tensor parallelism para mayor contexto.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con `max_model_len` reducido; en RTX 3090 (24 GB) de forma ajustada; no cabe en GPUs de 16 GB o menos sin offloading.
- Opciones de despliegue: vLLM con soporte compressed-tensors (probado con 1Cat-vLLM y kernels SM70); llama.cpp y Ollama no están confirmados para este formato AWQ/compressed-tensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-W4A16-AWQ (este) | 27,36B | no disponible | W4A16-AWQ int4 | Apache-2.0 | Hugging Face, 212 descargas |
| NousResearch/Arete-27B (base) | 27,36B | no disponible | BF16 (54,7 GB) | Apache-2.0 | Hugging Face |
| Qwen3.5-27B (referencia de familia) | ~27B | no disponible | BF16 y otras | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada; la comparación se limita a tamaño, formato y licencia.

## Limitaciones y advertencias

- La cuantización int4 puede degradar la calidad respecto al modelo base en tareas sensibles a precisión numérica (matemáticas, código de precisión), aunque no hay benchmarks que cuantifiquen esa pérdida.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez para esta cuantización; deben asumirse los riesgos habituales de los modelos generativos multimodales.
- La longitud de contexto real no está documentada; el ejemplo de uso fija 8192 tokens, por lo que contextos mayores requieren validación propia.
- Los idiomas soportados no están declarados; el rendimiento fuera del inglés y chino (idiomas típicos de la familia Qwen) es incierto.
- El soporte de tool calling y agentes no está confirmado en esta ficha; verificar contra la model card del modelo base antes de usarlo en producción.
- El despliegue está probado con 1Cat-vLLM y kernels SM70; otras versiones de vLLM o GPUs con arquitecturas distintas pueden requerir ajustes.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el mantenimiento del repositorio depende de un único publicador con pocas descargas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheUnderscore/Arete-27B-W4A16-AWQ
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Referencia de familia citada en la model card: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de llmcompressor (herramienta de cuantización): no disponible en la información proporcionada
- Documentación de vLLM sobre compressed-tensors: no disponible en la información proporcionada
