# Veenn/zelm-118m-id

## Resumen

ZeLM-118M-ID es un modelo de lenguaje causal (causal LM) para Bahasa Indonesia, desarrollado por Veenn (Velyn) como proyecto de pretraining independiente. Está diseñado desde cero con una arquitectura Transformer decoder custom denominada ZeLM, de 118,27 millones de parámetros y una ventana de contexto de 512 tokens. El modelo se entrena en TPU v5e-8 a través de un Kaggle Notebook gratuito, con un pipeline estructurado que incluye sharding data-parallel, gradient accumulation, evaluaciones periódicas y checkpoints que guardan el estado completo del optimizador. Resuelve la necesidad de modelos de lenguaje para indonesio entrenados desde cero, con una arquitectura narrow-deep (36 capas, hidden size 512) y un esquema de optimización híbrido Muon + AdamW.

Actualmente es un checkpoint intermedio de pretraining, situado en el step 41.000 de un total planificado de 114.705 (aproximadamente el 36% del entrenamiento), por lo que no representa un modelo final. Su relevancia radica en el detalle técnico de la implementación: Grouped Query Attention (GQA), RoPE, SwiGLU, tied embeddings, tokenizer BPE personalizado con marcadores especiales y una licencia Apache 2.0 que permite uso comercial. Al ser un modelo pequeño y estar documentado de forma transparente, resulta útil para investigación en eficiencia de entrenamiento y experimentación con JAX/Flax en entornos de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ZeLM (Transformer decoder custom, causal LM) |
| Parámetros totales | 118,27 millones |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura ZeLM es un decoder Transformer puro, con 36 capas implementadas mediante `nn.scan` para compilar un único grafo en lugar de 36 bloques separados, lo que reduce el tiempo de compilación de JAX. El modelo tiene hidden size de 512, 8 cabezas de consulta y 2 cabezas clave-valor (GQA), con dimensión de cabeza de 64. La FFN dimension es de 1.408 con activación SwiGLU, y la normalización es RMSNorm con epsilon de 1e-6. La codificación posicional usa RoPE con base 10.000, los embeddings de entrada y salida están atados (tied embeddings), y el vocabulario tiene 32.768 tokens. El tokenizer es HELIX v2, un BPE custom entrenado con corpus en indonesio más una porción de código fuente de GitHub y StackOverflow, con tokens especiales del tipo `\HELIX→nombre←HELIX/` para marcar turnos de conversación, bloques de razonamiento, tool-call, documentos, contexto, retrieval, código, memoria y slots multimodales.

El entrenamiento se realiza sobre un corpus web indonesio curado y filtrado, combinado con fuentes formales y enciclopédicas, con un total objetivo de aproximadamente 2.400 millones de tokens. Los datos se empaquetan sin padding, concatenando documentos con un token separador (ID 22) y troceando en secuencias de 512 tokens, almacenados como arrays `uint16`. El batch efectivo es de 128 con micro-batches de 64 (8 por núcleo TPU), y se usa gradient accumulation de 2 micro-steps por actualización. La tasa de aprendizaje máxima es de 3e-4 con decaimiento coseno hasta el 3% del valor inicial, warmup de 500 pasos, weight decay de 0.1 y gradient clipping con max_norm=1.0. El optimizador combina Muon para parámetros matriciales (attention y FFN) y AdamW (β1=0.9, β2=0.95) para parámetros no matriciales. Se aplica un coeficiente z-loss de 1e-4, precisión bfloat16 para cómputo y master params en fp32. El entrenamiento usa data-parallel puro con `jax.jit` y `Mesh`/`NamedSharding` en 8 chips TPU v5e, con una velocidad medida de aproximadamente 430.000 tokens por segundo tras el warmup de compilación.

## Capacidades

- Generación de texto causal en Bahasa Indonesia, de tipo autocompletivo.
- Tokenizer BPE personalizado (HELIX v2) con marcadores especiales para estructuras conversacionales, razonamiento, tool-call, documentos, contexto, retrieval, código, memoria y slots multimodales. Estos marcadores están definidos en el tokenizer, pero no se ha verificado que el modelo haya aprendido a utilizarlos correctamente durante el pretraining.
- Mayor eficiencia potencial para texto que mezcla código fuente y lenguaje natural, gracias a que el tokenizer incluye datos de entrenamiento de GitHub y StackOverflow.
- No se ha entrenado con RLHF ni DPO; es un modelo de pretraining puro, sin ajuste por instrucciones.
- No se han publicado capacidades de visión, audio, matemáticas avanzadas ni razonamiento multi-paso.

## Casos de uso

- Experimentos de fine-tuning en tareas de lenguaje en indonesio: se puede partir de este checkpoint y ajustarlo para clasificación de texto, reconocimiento de entidades o generación de resúmenes. Al ser un modelo de 118M, el fine-tuning es viable en una GPU modesta o incluso en CPU para lotes pequeños.
- Investigación en técnicas de entrenamiento de LLMs: la arquitectura documentada (GQA, RoPE, SwiGLU, Muon optimizer, `nn.scan`) permite estudiar el impacto de estas técnicas en un modelo pequeño y compararlo con variantes wide-shallow o con otros optimizadores.
- Prototipado de chatbots de baja latencia: con solo 118M parámetros y una ventana de 512 tokens, la inferencia es rápida en CPU o en GPUs pequeñas, lo que permite pruebas de concepto de asistentes conversacionales en indonesio sin necesidad de infraestructura costosa.
- Generación de documentación técnica con mezcla de código: el tokenizer incluye datos de código fuente, por lo que tras fine-tuning podría utilizarse para tareas de autocompletado o explicación de fragmentos de código en indonesio.
- Evaluación y análisis de tokenizers con marcadores especiales: el tokenizer HELIX v2 está diseñado para marcar turnos, razonamiento, tool-call, etc. Este modelo puede servir para medir el efecto de dichos marcadores en el pretraining y en la calidad de la generación posterior.
- Educación en sistemas de IA: el modelo y su pipeline de entrenamiento, ejecutado en un entorno gratuito (Kaggle TPU), son un ejemplo completo de pretraining desde cero con JAX/Flax, útil para cursos y laboratorios sobre entrenamiento de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index oficial declara una lista de resultados vacía, por lo que no existen métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas.

## Requisitos de hardware

- VRAM estimada: para inferencia en bfloat16, los pesos ocupan aproximadamente 236 MB (118,27M × 2 bytes); añadiendo activaciones y buffers, el consumo total se estima por debajo de 1 GB. En fp32, los pesos ocupan unos 472 MB.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM (por ejemplo, NVIDIA T4, RTX 3050, RTX 3060) es suficiente. También es viable la inferencia en CPU.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU de consumo moderno.
- Opciones de despliegue: no disponible. Al tratarse de un checkpoint de Flax/JAX, no se ha documentado compatibilidad directa con vLLM, llama.cpp, Ollama ni TGI; sería necesaria una conversión previa a safetensors o GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de 118M para Bahasa Indonesia con datos públicos suficientes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo final: el checkpoint corresponde al 36% del entrenamiento planificado (step 41.000 de 114.705), por lo que su rendimiento no es representativo del modelo completo.
- No se han publicado benchmarks ni evaluaciones de calidad, por lo que el desempeño en tareas reales es desconocido.
- La ventana de contexto está limitada a 512 tokens, lo que restringe su uso en tareas que requieran contexto largo.
- El corpus de entrenamiento no está descrito en detalle: la composición exacta y las fuentes específicas no se han publicado, lo que dificulta evaluar sesgos o riesgos de alucinación.
- Los tokens especiales para tool-call, razonamiento, documentos, etc., están definidos en el tokenizer, pero no se ha confirmado que el modelo haya aprendido a utilizarlos de forma correcta.
- La licencia Apache 2.0 permite uso comercial, pero al estar en fase de pretraining y sin evaluaciones, no se recomienda su uso en producción sin un fine-tuning previo y una validación exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/Veenn/zelm-118m-id
- Perfil del autor: https://huggingface.co/Veenn
