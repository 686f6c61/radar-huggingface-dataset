# VectaBass/vectabass-618m-5.01bt-base-cooled

## Resumen

vectabass-618m-5.01bt-base-cooled es un modelo de lenguaje base de 618 millones de parámetros totales (527,7 millones no-embedding) desarrollado por VectaBass en el marco de su iniciativa de IA soberana del Reino Unido. Forma parte de la "Phase 1 AR square", una escalera de modelos de 100M a 1.600M de parámetros no-embedding, cada uno entrenado con varios presupuestos de tokens y publicados conjuntamente para permitir la verificación empírica de leyes de escalado. Esta celda concreta, identificada como N4-D3, se entrenó con 5.010 millones de tokens, lo que equivale a 10 tokens por parámetro no-embedding.

La arquitectura es de tipo transformer decoder-only con atención causal, GQA con ratio 2:1 y una innovación denominada "exclusive self-attention" (XSA) que no existe en Llama, aunque la red se describe como "Llama-like plus XSA". El modelo emplea SwiGLU en la feed-forward, RMSNorm pre-norm, RoPE con base 10000 y un contexto máximo de 2048 tokens. El vocabulario es GPT-2 BPE con 50.304 filas (50.257 tokens BPE más 26 especiales y padding), con embeddings atados.

El interés del modelo es fundamentalmente científico: no está pensado como asistente, sino como una celda experimental reproducible para estudiar leyes de escalado, con réplicas de semilla en la rama `seed2` para medir el ruido entre ejecuciones. Su relevancia radica en la transparencia de la receta (optimizador Muon combinado con AdamW, cooldown 1-sqrt, hardware GH200) y en la inclusión de fuentes parlamentarias británicas y lenguas celtas, lo que lo convierte en un artefacto útil para investigación sobre multilingüismo de bajos recursos y entrenamiento a pequeña escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, Llama-like con exclusive self-attention (XSA), GQA 2:1 |
| Parámetros totales | 617.852.928 (embeddings atados) |
| Parámetros activos | no disponible (no es MoE) |
| Parámetros no-embedding | 527.708.160 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible (entrenado y publicado en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Anchura / capas | 1792 / 15 |
| Cabezas | 28 query, 14 key-value, dim 64 |
| Feed-forward | SwiGLU, 4752 |
| Normalización | RMSNorm, pre-norm |
| Posiciones | RoPE, base 10000 |
| Vocabulario | 50.304 filas: GPT-2 BPE (50.257) + 26 especiales + padding |
| Tokens de entrenamiento | 5.014.159.360 |
| Hardware de entrenamiento | 2 x NVIDIA GH200 120GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención causal que combina GQA con ratio 2:1 (28 cabezas de query, 14 de key-value, dimensión 64) y una variante de atención propietaria llamada exclusive self-attention (XSA), que requiere cargar `modeling_vectabass.py` con `trust_remote_code=True`. La anchura es de 1792, con 15 capas, feed-forward SwiGLU de dimensión 4752, RMSNorm pre-norm y RoPE con base 10000 limitado a 2048 tokens de contexto. Los embeddings están atados y el vocabulario es GPT-2 BPE ampliado con 26 tokens especiales.

El entrenamiento consumió 5.014.159.360 tokens (10 por parámetro no-embedding) con un batch de 458.752 tokens. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) con AdamW fp32 (betas 0.9 y 0.95). El pico de learning rate fue 0.00148, con warmup de 437M tokens, fase constante y un cooldown 1-sqrt hasta cero en el último 20% del entrenamiento. El weight decay fue 0.0575 sobre matrices. Se usó precisión bf16 para pesos y activaciones, con pesos maestros fp32 en el optimizador y estadísticas de norma, ángulos RoPE y logits en fp32. El entrenamiento corrió sobre 2 x NVIDIA GH200 120GB.

Los datos provienen de la "phase-1-release view": 47 bins de texto con licencia abierta, unos 96B tokens únicos, con fuentes del sector público británico, parlamentarias y de lenguas celtas. Las fuentes declaradas son FineWeb-Edu, FineWeb-2 y FineMath. El modelo se publica junto con réplicas de semilla en la rama `seed2` (misma receta, nueva inicialización y orden de datos) para medir la varianza entre ejecuciones.

## Capacidades

- Generación de texto autoregresiva en modo base (continuación de secuencia), sin ajuste de instrucciones.
- Modelado de lenguaje multilingüe limitado a inglés y lenguas celtas: galés (cy), gaélico escocés (gd), irlandés (ga), manés (gv), córnico (kw) y escocés (sco).
- Razonamiento y conocimiento factual derivados exclusivamente del preentrenamiento; no hay modo "thinking" ni cadena de pensamiento entrenada.
- No soporta tool calling ni function calling de forma nativa (modelo base sin ajuste).
- No soporta comportamiento agéntico ni multi-step reasoning entrenado.
- No dispone de capacidades de visión, audio ni multimodalidad.
- Útil como extractor de representaciones o como punto de partida para fine-tuning supervisado.

## Casos de uso

- Investigación sobre leyes de escalado: el modelo es una celda de una escalera (100M–1.6B no-embedding) con varios presupuestos de tokens; se usa para ajustar curvas de pérdida frente a parámetros y tokens y validar predicciones teóricas.
- Estudio de ruido entre ejecuciones: las réplicas de la rama `seed2` permiten cuantificar la varianza run-to-run en la pérdida de validación y en métricas downstream, algo poco habitual en modelos publicados.
- Fine-tuning para tareas de clasificación o extracción en inglés: al ser un base de 618M con licencia Apache-2.0, sirve como inicialización barata para tareas específicas de dominio con presupuesto de cómputo reducido.
- Procesamiento de textos parlamentarios y del sector público británico: la inclusión de fuentes parlamentarias y de administración pública en el corpus lo hace adecuado para experimentos de modelado de dominio sobre Hansard, legislación o documentación oficial.
- Investigación en lenguas celtas de bajos recursos: permite estudiar transferencia entre galés, gaélico, irlandés, manés, córnico y escocés, y evaluar hasta qué punto un modelo pequeño multilingüe captura estas lenguas.
- Reproducibilidad y auditoría de recetas: la provenance documentada (run contract, sha256 del checkpoint, `provenance.json`) permite replicar el entrenamiento y auditar la receta Muon + AdamW con cooldown 1-sqrt.
- Baseline para comparativas de arquitectura: la variante XSA frente a atención estándar en un modelo pequeño facilita experimentos controlados sobre mecanismos de atención sin coste prohibitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks zero-shot en la información disponible. El autor indica explícitamente que las puntuaciones zero-shot "no se han medido todavía". El único dato de evaluación publicado es la pérdida de validación:

| Métrica | Valor |
|---|---|
| Validation loss (canon-8192, 8192 x 2048 tokens) | 2,2185 nats/token |
| Validation loss con pesos del repo bajo PyTorch SDPA | 2,2186 nats/token |
| Reproducibilidad bit a bit vs. código de entrenamiento | Sí (logits idénticos) |

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 1,24 GB solo para pesos (617,9M parámetros x 2 bytes), más overhead de activaciones y caché KV; en la práctica, 2–3 GB para inferencia con batch pequeño.
- VRAM estimada en fp32: aproximadamente 2,5 GB solo para pesos.
- Cabe holgadamente en cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4070, 4090) e incluso en GPUs integradas con suficiente memoria compartida.
- GPU recomendadas para entrenamiento o fine-tuning: A100, H100 o GH200; para inferencia basta una RTX 4090 o inferior.
- Despliegue: compatible con `transformers` (requiere `trust_remote_code=True` por el módulo `modeling_vectabass.py`). No se documenta soporte oficial en vLLM, llama.cpp, Ollama o TGI; la atención XSA propietaria dificulta la conversión a GGUF sin trabajo adicional.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-618m-5.01bt-base-cooled | 617,9M (527,7M no-embedding) | 2048 | Apache-2.0 | Base, XSA, multilingüe celta, sin benchmarks |
| Qwen2.5-0.5B | 494M | 32.768 | Apache-2.0 | Base e instruct, multilingüe amplio, benchmarks publicados |
| SmolLM2-360M | 362M | 8192 | Apache-2.0 | Base e instruct, entrenado con ~4T tokens, benchmarks publicados |
| Llama-3.2-1B | 1.240M | 131.072 | Llama 3.2 Community License | Base e instruct, contexto muy largo, benchmarks publicados |

La comparación es aproximada: los tres alternativos son modelos de propósito general con ajuste de instrucciones y evaluaciones publicadas, mientras que vectabass es un artefacto de investigación sin benchmarks ni ajuste. La ventaja diferencial de vectabass es la transparencia de la receta y la cobertura de lenguas celtas; sus desventajas son el contexto corto (2048) y la ausencia de métricas downstream.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones ni de seguridad: no debe usarse como asistente conversacional.
- Genera afirmaciones falsas con fluidez; el riesgo de alucinación es alto y no hay filtrado de salidas.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística desequilibrada: mayoritariamente inglés, con proporciones menores de galés, gaélico escocés, irlandés, manés, córnico y escocés; no cubre castellano ni otras lenguas mayoritarias.
- Sin benchmarks zero-shot publicados, por lo que no es posible comparar su calidad con alternativas de forma cuantitativa.
- La atención XSA requiere `trust_remote_code=True` y un módulo de modelado propio; esto complica el despliegue en runtimes optimizados y la conversión a GGUF.
- La licencia Apache-2.0 permite uso comercial, pero al ser un modelo base sin evaluación de sesgos ni seguridad, el usuario asume todo el riesgo en producción.
- El tamaño del repo (2,5 GB) incluye pesos en bf16 más el código de modelado; conviene verificar la integridad mediante el sha256 documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-618m-5.01bt-base-cooled
- Rama de réplica de semilla: https://huggingface.co/VectaBass/vectabass-618m-5.01bt-base-cooled/tree/seed2
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Referencia Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Paper: pendiente de publicación según el autor (no disponible)
