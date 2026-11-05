# VectaBass/vectabass-374m-26.5bt-base-cooled

## Resumen

vectabass-374m-26.5bt-base-cooled es un modelo de lenguaje base de 374 millones de parámetros totales (303,1 millones no de embedding) desarrollado por VectaBass como parte de la Phase 1 AR square, un conjunto de modelos de 100M a 1.6B de parámetros no de embedding entrenados con distintos presupuestos de tokens y liberados conjuntamente para permitir la verificación de leyes de escala. Este checkpoint concreto corresponde a la celda N3-D5 del retículo experimental y ha sido entrenado con 26.460 millones de tokens, es decir, 87 tokens por parámetro no de embedding.

El modelo emplea una arquitectura transformer tipo Llama con atención causal, GQA 2:1 y una innovación denominada exclusive self-attention (XSA), que requiere cargar código propio del repositorio mediante `trust_remote_code`. La longitud de contexto es de 2048 tokens y el vocabulario utiliza BPE de GPT-2 ampliado con 26 tokens especiales hasta 50.304 filas.

Su relevancia es doble: por un lado, sirve como evidencia empírica reproducible para estudios de scaling laws; por otro, su enfoque en fuentes del sector público británico y lenguas celtas (galés, gaélico escocés, irlandés, manés, córnel y escocés) lo sitúa en el ámbito de la IA soberana del Reino Unido. Es un modelo base sin ajuste por instrucciones ni por seguridad, por lo que no está pensado para uso como asistente en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con GQA 2:1 y exclusive self-attention (XSA) |
| Parámetros totales | 373.942.272 (embeddings atados) |
| Parámetros activos | No aplica (modelo denso) |
| Parámetros no de embedding | 303.114.240 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible (entrenado y publicado en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `modeling_vectabass.py` para `trust_remote_code`) |
| Anchura / capas | 1408 / 13 |
| Cabezas de atención | 22 query, 11 key-value, dimensión 64 |
| Feed-forward | SwiGLU, dimensión 4112 |
| Normalización | RMSNorm, pre-norm |
| Posiciones | RoPE, base 10000 |
| Vocabulario | 50.304 filas (GPT-2 BPE 50.257 + 26 tokens especiales + padding) |
| Precisión de entrenamiento | bf16 en pesos y activaciones, fp32 en pesos maestros, estadísticas de norma, ángulos RoPE y logits |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La red es un transformer decoder-only con 13 capas, anchura 1408 y atención causal con GQA 2:1 (22 cabezas de consulta frente a 11 de clave-valor, dimensión 64 por cabeza). La innovación destacable es la exclusive self-attention (XSA), ausente en Llama estándar, que obliga a cargar el módulo `modeling_vectabass.py` del repositorio. El feed-forward es SwiGLU con dimensión intermedia 4112, y la normalización es RMSNorm en configuración pre-norm. Las posiciones se codifican con RoPE de base 10000 y ventana de 2048 tokens. Los embeddings están atados a la capa de salida.

El entrenamiento consumió 26.464.747.520 tokens con un batch de 327.680 tokens, usando Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) combinado con AdamW en fp32 (betas 0.9 y 0.95) para el resto de parámetros. El pico de learning rate fue 0.00174, con un warmup de 190 millones de tokens, una fase constante y un cooldown de tipo 1-sqrt hasta cero en el último 20% del entrenamiento. El weight decay aplicado a matrices fue 0.0691. Todo el run se ejecutó en una única NVIDIA GH200 de 120 GB. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, aproximadamente 96.000 millones de tokens únicos, con fuentes de FineWeb-Edu, FineWeb-2 y FineMath, más material del sector público y parlamentario británico y de lenguas celtas. No se documenta RLHF ni DPO; el modelo no está ajustado por instrucciones.

## Capacidades

- Generación de texto autoregresiva en modo base, sin ajuste por instrucciones ni diálogo.
- Modelado de lenguaje y continuación de texto con contexto de 2048 tokens.
- Cobertura multilingüe parcial: inglés dominante y presencia menor de galés, gaélico escocés, irlandés, manés, córnel y escocés.
- Capacidad de servir como base para fine-tuning supervisado o ajuste por instrucciones posterior.
- Utilidad como punto de referencia en estudios de scaling laws y ablaciones de arquitectura.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- No se documenta capacidad específica de código o matemáticas más allá de lo que aporte FineMath en el corpus.

## Casos de uso

- Investigación en scaling laws: el checkpoint forma parte de una escalera de modelos de 100M a 1.6B entrenados con distintos presupuestos de tokens; se usaría para ajustar curvas de pérdida frente a parámetros y tokens y validar predicciones de leyes de escala.
- Fine-tuning para dominio jurídico o administrativo británico: al haber sido entrenado con fuentes parlamentarias y del sector público, sirve como inicialización para tareas de clasificación, extracción o resumen sobre documentos del Senedd y corpus administrativos similares.
- Modelos de lengua celtas de bajo recurso: es un punto de partida para fine-tuning en galés, gaélico escocés, irlandés, manés, córnel y escocés, donde los modelos base multilingües grandes suelen estar sobredimensionados.
- Experimentación académica con arquitecturas de atención: la XSA y el esquema GQA 2:1 permiten estudiar el efecto de mecanismos de atención alternativos en modelos pequeños con presupuesto controlado.
- Prototipado de investigación en entornos de un solo acelerador: con 0,7 GB de pesos en bf16, cabe en una única GPU y permite iterar rápido en experimentos de preentrenamiento o ablaciones.
- Generación de texto controlada en pipelines de investigación: continuación de texto con contexto de 2048 tokens para experimentos de evaluación de perplejidad o de sesgo lingüístico.
- Baseline para comparativas de eficiencia: al publicarse junto a otros tamaños de la misma escalera, sirve como referencia para medir throughput y latencia en GH200 o GPUs equivalentes.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Pérdida de validación (canon-8192, 8192 × 2048 tokens) | 2,1138 nats por token |
| Pérdida reproducida con PyTorch SDPA | 2,1139 nats por token |
| Benchmarks zero-shot (MMLU, HumanEval, GSM8K, etc.) | No medidos todavía según la model card |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,75 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,4 GB para pesos; en 4 bits, alrededor de 0,2 GB (no se publican cuantizaciones oficiales, pero el tamaño lo permite).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento se realizó en una NVIDIA GH200 de 120 GB, pero la inferencia es viable en tarjetas consumer.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y equivalentes, así como en Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `dtype=torch.bfloat16`; la integración con vLLM, llama.cpp, Ollama o TGI requeriría soporte para el módulo de atención XSA, que no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-374m-26.5bt-base-cooled | 374M totales (303M no embedding) | 2048 | Apache 2.0 | Base, XSA, foco en lenguas celtas y sector público británico |
| Pythia-410M | 410M | 2048 | Apache 2.0 | Base, transformer estándar, ampliamente usado en estudios de scaling |
| GPT-2 medium | 355M | 1024 | MIT | Base, sin GQA ni XSA, solo inglés |
| SmolLM-360M | 360M | 2048 | Apache 2.0 | Base, entrenado con currículo de datos, sin foco celta |

La comparación con Pythia-410M, GPT-2 medium y SmolLM-360M es por tamaño y categoría (modelos base pequeños); no se dispone de benchmarks comparativos publicados para este checkpoint.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni por seguridad; genera texto plausible pero puede afirmar falsedades con fluidez.
- No ha pasado por RLHF ni DPO, por lo que no es adecuado como asistente conversacional directo.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Predominio del inglés; el rendimiento en galés, gaélico escocés, irlandés, manés, córnel y escocés es proporcional a su cuota menor en el corpus y no está evaluado.
- Sin filtrado de salidas ni mitigación de sesgos documentada.
- Requiere `trust_remote_code=True` para cargar `modeling_vectabass.py`, lo que implica ejecutar código del repositorio; conviene auditar el módulo antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin evaluación de seguridad, el despliegue en producción exige validación y filtrado propios.
- No se han medido benchmarks zero-shot, por lo que no hay evidencia pública de rendimiento en tareas downstream.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-374m-26.5bt-base-cooled
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Referencia Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Paper del modelo: pendiente de publicación según la model card
