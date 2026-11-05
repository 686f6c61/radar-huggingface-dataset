# VectaBass/vectabass-1.03b-5.01bt-base-cooled

## Resumen

vectabass-1.03b-5.01bt-base-cooled es un modelo de lenguaje base de 1.029 millones de parámetros (919,4M no de embedding) desarrollado por VectaBass, un proyecto orientado a la soberanía de IA del Reino Unido. Forma parte de la "Phase 1 AR square", una escalera de modelos de 100M a 1.6B de parámetros no de embedding, cada uno entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar empíricamente las leyes de escalado. Esta celda concreta, identificada como N5-D3, se entrenó con 5.010 millones de tokens, es decir, 5 tokens por parámetro no de embedding.

La arquitectura es de tipo transformer causal con una innovación respecto a Llama: atención propia exclusiva (XSA, exclusive self-attention), además de GQA con proporción 2:1, SwiGLU y RMSNorm con pre-norm. El contexto es de solo 2048 tokens, lo que la sitúa muy por debajo de los estándares actuales. El vocabulario usa BPE de GPT-2 (50.257 tokens) más 26 tokens especiales.

Es relevante ahora porque se publica como material de investigación reproducible para estudiar leyes de escalado, con provenance verificable (hash del checkpoint, contrato de ejecución) y entrenado en Isambard-AI, el supercomputador nacional de investigación de IA del Reino Unido. No es un modelo para uso como asistente: es un modelo base sin ajuste de instrucciones ni de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama con atención propia exclusiva (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE |
| Parámetros totales | 1.028.812.800 (embeddings atados) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible (entrenado y publicado en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (inglés y lenguas celtas y escocés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,1 GB) |

## Arquitectura y entrenamiento

El modelo sigue una topología transformer decoder-only con 18 capas, anchura 2176, 34 cabezas de consulta y 17 de clave-valor con dimensión 64 (GQA 2:1), feed-forward SwiGLU de 5648 y normalización RMSNorm en pre-norm. La posición se codifica con RoPE de base 10000. La diferencia clave respecto a un Llama estándar es la atención propia exclusiva (XSA), que requiere cargar `modeling_vectabass.py` mediante `trust_remote_code`. El vocabulario tiene 50.304 filas: BPE de GPT-2 (50.257) más 26 tokens especiales y relleno.

El entrenamiento usó 5.014.159.360 tokens con un batch de 458.752 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) combinado con AdamW en fp32 (0.9, 0.95), LR pico de 0.00125, warmup de 437M tokens y un schedule de warmup, constante y cooldown 1-sqrt hasta cero en el último 20%. Se entrenó en bf16 con pesos maestros en fp32 y estadísticas de norma, ángulos RoPE y logits en fp32, sobre 4 GPUs NVIDIA GH200 de 120 GB. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta (unos 96B tokens únicos) incluyendo fineweb-edu, fineweb-2, finemath y fuentes del sector público y parlamentario del Reino Unido, además de lenguas celtas.

## Capacidades

- Generación de texto autoregresiva en modo base (completado de secuencias), sin ajuste de instrucciones.
- Razonamiento y conocimiento factual limitados al ser un modelo base de 1B de parámetros.
- Capacidad multilingüe restringida a inglés y lenguas celtas/escocés (galés, gaélico escocés, irlandés, manés, córnico, escocés).
- No dispone de tool calling, function calling ni soporte de agentes documentado.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- No dispone de ajuste de seguridad ni filtrado de salidas.
- Reproducibilidad bit a bit de los logits del código de entrenamiento bajo PyTorch SDPA.

## Casos de uso

- Investigación sobre leyes de escalado: el modelo es una celda de una escalera de tamaños y presupuestos de tokens publicada conjuntamente, lo que permite ajustar y validar curvas de pérdida frente a tokens y parámetros con puntos de control reales.
- Estudio de arquitecturas con XSA: sirve para comparar el efecto de la atención propia exclusiva frente a atención causal estándar en modelos de ~1B de parámetros, con pesos y código de modelado disponibles.
- Evaluación de modelos base en lenguas celtas: al incluir galés, gaélico escocés, irlandés, manés, córnico y escocés, permite medir perplejidad y capacidades en estas lenguas de bajos recursos.
- Reproducibilidad y auditoría de entrenamiento: el provenance.json, el hash sha256 del checkpoint y el contrato de ejecución permiten replicar y auditar el pipeline de entrenamiento.
- Fine-tuning como punto de partida: con licencia Apache 2.0 y 1B de parámetros, es un candidato para ajuste supervisado o DPO en tareas concretas, partiendo de un modelo base entrenado con 5 tokens por parámetro.
- Experimentos de destilación y pruning: su tamaño permite usarlo como estudiante en pipelines de destilación desde modelos mayores o como base para estudiar compresión.
- Docencia y experimentación en hardware modesto: 1B de parámetros en bf16 (unos 2 GB de pesos) cabe en GPUs de consumo, lo que facilita prácticas de ajuste fino y evaluación.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Pérdida de validación (canon-8192, 8192 x 2048 tokens) | 2,1692 nats por token |
| Benchmarks zero-shot (MMLU, HumanEval, GSM8K, etc.) | No medidos todavía según el autor |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: unos 2,1 GB de pesos más overhead de activaciones y caché KV; en la práctica, menos de 4 GB para inferencia.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,1 GB de pesos; en 4 bits, unos 0,6 GB (no se documentan cuantizaciones oficiales, estimación teórica).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; se entrenó en 4 x NVIDIA GH200 de 120 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con suficiente VRAM.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `modeling_vectabass.py`; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada y probablemente requiera adaptación por la atención XSA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-1.03b-5.01bt-base-cooled | 1.029M (919,4M no embedding) | 2048 | Apache 2.0 | Base, XSA, 5B tokens, lenguas celtas |
| Llama 3.2 1B | 1.240M | 131.072 | Llama 3.2 Community | Base e instruct, contexto muy superior |
| Qwen2.5 1.5B | 1.540M | 32.768 | Apache 2.0 | Base e instruct, multilingüe amplio |
| SmolLM2 1.7B | 1.700M | 8192 | Apache 2.0 | Base e instruct, entrenado con ~11B tokens |

La comparación con alternativas comerciales no está disponible en la información proporcionada; los datos de los modelos comparables son de conocimiento general y no proceden de la model card.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escalado, no un asistente: generará afirmaciones falsas con fluidez y no sigue instrucciones de forma fiable.
- Contexto de solo 2048 tokens, insuficiente para la mayoría de aplicaciones de producción actuales.
- Predominantemente inglés, con participaciones menores de lenguas celtas; el rendimiento en estas últimas no está medido.
- Sin ajuste de seguridad ni filtrado de salidas: puede generar contenido inapropiado o dañino.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de ajuste de instrucciones hace desaconsejable su uso directo en producción sin fine-tuning y evaluación previa.
- Riesgo de alucinación elevado por el tamaño y la naturaleza del modelo base.
- No se documentan sesgos específicos medidos; los sesgos de los corpus de fineweb y fuentes parlamentarias pueden propagarse.

## Enlaces

- HuggingFace: https://huggingface.co/VectaBass/vectabass-1.03b-5.01bt-base-cooled
- Paper de Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper del modelo: no disponible (anunciado como "forthcoming")
