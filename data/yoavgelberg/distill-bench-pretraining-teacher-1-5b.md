# yoavgelberg/distill-bench-pretraining-teacher-1.5b

## Resumen

Distill Bench pretraining teacher 1.5B es un modelo de lenguaje decoder-only entrenado desde cero por el usuario de Hugging Face yoavgelberg como modelo "teacher" (profesor) para el proyecto Distill Bench, una iniciativa de benchmarking de destilación de modelos. El modelo se publica con pesos completos en safetensors y está diseñado para servir como punto de partida en experimentos de destilación, poniendo a disposición pública tanto los pesos como trazas de logits del entrenamiento.

Técnicamente se trata de un transformer estilo Llama de 1.522.632.704 parámetros, con 24 capas, contexto de 2.048 tokens y activación SwiGLU, entrenado con 40 mil millones de tokens de FineWeb-Edu y DCLM-Baseline. Su relevancia no está tanto en el rendimiento bruto (es un modelo pequeño entrenado con un corpus modesto en comparación con los modelos comerciales) sino en la transparencia del proceso: se publican las trazas de logits del entrenamiento completo, algo poco habitual que permite estudiar la dinámica de preentrenamiento y desarrollar técnicas de destilación reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama, decoder-only |
| Parametros totales | 1.522.632.704 (~1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos en BF16/FP32) |
| Idiomas soportados | no disponible (entrenado principalmente con corpus en inglés) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama clásica: transformer decoder-only con 24 capas, tamaño oculto de 2.048, dimensión intermedia de 6.912 y 32 cabezas de atención (también 32 cabezas KV, sin GQA). Usa activación SwiGLU, normalización RMSNorm con epsilon 1e-5, codificación posicional RoPE con theta 100.000 y embeddings empatados entre entrada y salida. No hay sesgos en atención ni MLP, ni dropout en atención. El tokenizador es el de SmolLM2-135M, con un vocabulario de 49.152 tokens.

El preentrenamiento se realizó con 39.997.931.520 tokens (~40B) durante 76.290 pasos, con un batch global de 256 secuencias (524.288 tokens por paso) repartido en 8 GPU. Se entrenó en BF16 autocast con parámetros en FP32, usando AdamW con learning rate pico de 3e-4, weight decay 0.1, betas (0.9, 0.95), clipping de gradiente a 1.0 y una planificación de learning rate con 763 pasos de warmup y decaimiento coseno hasta cero. La mezcla de datos fue 60% FineWeb-Edu (licencia ODC-BY 1.0) y 40% DCLM-Baseline (CC BY 4.0), con deduplicación de documentos entre fuentes y división antes del packing. Como novedad destacable, se han publicado trazas de logits del entrenamiento completo y del último 10% del run en datasets separados, material de gran valor para investigación en destilación.

## Capacidades

- Generación de texto general en estilo preentrenamiento (base model, sin afinado por instrucciones).
- Modelado de lenguaje estándar cargable con `AutoModelForCausalLM` y `AutoTokenizer` de la librería transformers.
- Compatible con text-generation-inference y despliegue en endpoints (tags de Hugging Face).
- Sin capacidades documentadas de: tool calling, agentes, visión, audio, modo de razonamiento o instrucciones (es un modelo base).
- Sin datos publicados sobre rendimiento multilingüe; el corpus de entrenamiento (FineWeb-Edu y DCLM) es predominantemente en inglés.
- Utilidad especial como modelo teacher para experimentos de destilación, gracias a la disponibilidad de trazas de logits.

## Casos de uso

- Modelo teacher para destilación de modelos pequeños: su propósito principal; las trazas de logits publicadas permiten entrenar modelos student sin necesidad de reinferir el teacher, reduciendo coste computacional.
- Investigación en dinámica de preentrenamiento: los logit traces a lo largo del run permiten estudiar cómo evoluciona el modelo durante el entrenamiento (memorización, emergencia de capacidades, etc.).
- Reproducción de pipelines de preentrenamiento a escala pequeña: la ficha documenta hiperparámetros, mezcla de datos y planificación de learning rate al detalle, ideal como referencia didáctica.
- Evaluación comparativa de datasets de preentrenamiento: al usar FineWeb-Edu y DCLM con proporciones conocidas, sirve como banco de pruebas para medir el impacto de la calidad de datos.
- Base para fine-tuning experimental: al ser un modelo base de 1.5B, puede afinarse en tareas concretas con recursos modestos, aunque su rendimiento no está garantizado frente a modelos base consolidados.
- Estudio de eficiencia de inferencia: su tamaño reducido y arquitectura Llama estándar lo hacen adecuado para experimentar con cuantización, decodificación especulativa o kernels optimizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,2 GB en BF16 para los pesos (1.5B × 2 bytes), más overhead de activaciones y KV cache; con cuantización INT8/INT4 cabría en torno a 1,6-1 GB (aunque no hay pesos cuantizados publicados oficialmente).
- GPU recomendadas: cualquier GPU moderna de gama media es suficiente para inferencia; una RTX 3060 de 12 GB o superior lo ejecuta con holgura en BF16.
- Cabe cómodamente en GPUs de consumo: RTX 3060, RTX 4060 Ti, RTX 4090, e incluso en GPUs de 8 GB con cuantización.
- Opciones de despliegue: transformers (uso nativo), text-generation-inference (tag oficial), llama.cpp o Ollama mediante conversión a GGUF (conversión no incluida en el repo), vLLM al ser arquitectura Llama estándar.
- Latencia y throughput: no disponible; al ser un modelo de 1.5B con contexto corto, cabe esperar inferencia rápida en GPU de consumo, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Notas |
|---|---|---|---|---|---|
| Distill Bench pretraining teacher 1.5B | ~1.5B | 2.048 | 40B tokens (FineWeb-Edu + DCLM) | other | Modelo teacher para destilación, con trazas de logits publicadas |
| SmolLM2-1.7B (HuggingFaceTB) | 1.7B | 8.192 | ~11T tokens | Apache 2.0 | Mismo tokenizador; entrenado con mucho más dato, rendimiento muy superior |
| Qwen2.5-1.5B (Alibaba) | 1.5B | 32.768 | no disponible (multilingüe) | Apache 2.0 (base) | Mejor rendimiento general y contexto más largo |
| Llama 3.2-1B (Meta) | 1.24B | 131.072 | ~15T tokens | Llama Community License | Contexto muy superior, uso comercial con restricciones propias |

La comparación es orientativa: este modelo está entrenado con ~40B tokens, muy por debajo de los modelos comerciales de su clase, por lo que no debe esperarse que compita en benchmarks generales; su valor está en la investigación de destilación.

## Limitaciones y advertencias

- Es un modelo base (no instruido): no sigue instrucciones de forma fiable y no es apto para asistentes de usuario final sin fine-tuning previo.
- Contexto de solo 2.048 tokens, muy limitado frente al estándar actual (8K-128K).
- Corpus de entrenamiento predominantemente en inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea pobre.
- Entrenado con solo ~40B tokens, muy lejos de las escalas de los modelos de referencia; se esperan alucinaciones frecuentes y capacidades de razonamiento limitadas.
- Licencia "other": los términos exactos para uso comercial no están detallados en la model card; conviene revisarlos antes de cualquier despliegue productivo. Los datos de entrenamiento tienen licencias ODC-BY 1.0 y CC BY 4.0, que pueden imponer obligaciones de atribución.
- Sesgos: no hay evaluación de sesgos publicada; al entrenarse con datos web (FineWeb-Edu, DCLM), hereda los sesgos típicos de estos corpus.
- El proyecto tiene adopción muy reducida (637 descargas, 1 like), por lo que no existe comunidad de soporte ni validación externa amplia.
- No hay pesos cuantizados oficiales ni conversiones GGUF publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yoavgelberg/distill-bench-pretraining-teacher-1.5b
- Tokenizador utilizado (SmolLM2-135M): https://huggingface.co/HuggingFaceTB/SmolLM2-135M/tree/93efa2f097d58c2a74874c7e644dbc9b0cee75a2
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu/tree/87f09149ef4734204d70ed1d046ddc9ca3f2b8f9
- Dataset DCLM-Baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0/tree/a3b142c183eabe5af344955ae20836eb34dcf69b
- Trazas de logits del entrenamiento completo: https://huggingface.co/datasets/yoavgelberg/distill-bench-pretraining-logit-traces-stratified-4b
- Trazas de logits del último 10% del run: https://huggingface.co/datasets/yoavgelberg/distill-bench-pretraining-logit-traces-final-10pct
