# VectaBass/vectabass-151m-950mt-base-cooled

## Resumen

vectabass-151m-950mt-base-cooled es un modelo de lenguaje base de 151,5 millones de parámetros totales (100,0 millones no de embedding) desarrollado por VectaBass, un proyecto orientado a la investigación de leyes de escala y a la soberanía tecnológica del Reino Unido en IA. Se trata de la celda N1-D1 del "cuadrado AR" de la fase 1 del proyecto: una escalera de modelos que va de 100M a 1.600M de parámetros no de embedding, cada tamaño entrenado con varios presupuestos de tokens y publicados en conjunto para poder verificar empíricamente las leyes de escala. Este modelo concreto se entrenó con 950 millones de tokens, es decir, 10 tokens por parámetro no de embedding.

Arquitectura transformer de tipo Llama con una innovación destacable: atención propia exclusiva (XSA, *exclusive self-attention*), que Llama no incorpora. Usa GQA con ratio 2:1, SwiGLU, RMSNorm pre-norm y RoPE con contexto de 2048 tokens. El vocabulario es GPT-2 BPE con 50.304 filas. Se distribuye con licencia Apache 2.0 y pesos en safetensors, con código de modelado propio que requiere `trust_remote_code`.

Es relevante ahora porque forma parte de una familia publicada para estudiar leyes de escala de forma abierta y reproducible, con réplicas de semilla en ramas separadas para medir el ruido entre ejecuciones. No es un modelo para uso como asistente: es una pieza de investigación con un conjunto de datos que incluye fuentes del sector público británico, parlamentarias y de lenguas celtas, lo que lo convierte en un artefacto útil para estudiar el entrenamiento multilingüe de bajos recursos en un contexto de soberanía lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con atención propia exclusiva (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE |
| Parametros totales | 151.486.464 (embeddings atados); 99.975.168 no de embedding |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (el autor recomienda ejecutar en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (inglés, galés, gaélico escocés, irlandés, manés, córnico, escocés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `modeling_vectabass.py` cargado vía `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 9 capas y anchura 1024, con 16 cabezas de consulta y 8 de clave-valor de dimensión 64, feed-forward SwiGLU de 2592 y normalización RMSNorm pre-norm. La innovación principal es la atención propia exclusiva (XSA), que se suma a la atención causal estándar con GQA 2:1. Las posiciones usan RoPE con base 10000 y el vocabulario es GPT-2 BPE (50.257 tokens) más 26 tokens especiales, hasta 50.304 filas. Los embeddings están atados.

El entrenamiento consumió 950.009.856 tokens con un tamaño de lote de 262.144 tokens. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) con AdamW en fp32 (0.9, 0.95). El pico de learning rate fue 0.00243, con 100M tokens de warmup, fase constante y un cooldown 1-sqrt hasta cero en el último 20% del entrenamiento. El weight decay fue 0.105 sobre matrices. Se entrenó en bf16 con pesos maestros en fp32 y estadísticas de normalización, ángulos RoPE y logits en fp32, sobre 1 GPU NVIDIA GH200 de 120 GB. Los datos provienen de la vista de la fase 1: 47 bins de texto con licencia abierta, unos 96.000 millones de tokens únicos, con fuentes del sector público y parlamentario del Reino Unido y de lenguas celtas, derivadas de fineweb-edu, fineweb-2 y finemath.

## Capacidades

- Generación de texto autoregresiva en inglés y en varias lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) y escocés.
- Modelado de lenguaje base: continuación de texto, puntuación de secuencias y evaluación de verosimilitud.
- Razonamiento de sentido común y conocimiento factual limitado, propio de un modelo de 100M de parámetros no de embedding.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- No está ajustado a instrucciones ni a seguridad: es exclusivamente un modelo base.

## Casos de uso

- Investigación de leyes de escala: el modelo es una celda de una escalera de tamaños y presupuestos de tokens; se usa para ajustar y validar curvas de pérdida frente a parámetros y tokens, comparando con las demás celdas publicadas de la familia.
- Medición de ruido entre ejecuciones: las réplicas de semilla en la rama `seed2` permiten cuantificar la varianza run-to-run del entrenamiento con la misma receta, un dato necesario para estimar la incertidumbre de las leyes de escala.
- Estudio de atención propia exclusiva (XSA): al ser un modelo pequeño y abierto, sirve para ablaciones controladas sobre el efecto de XSA frente a atención estándar en regímenes de cómputo reducido.
- Evaluación de cobertura de lenguas celtas: el conjunto de datos incluye fuentes en galés, gaélico escocés, irlandés, manés y córnico, por lo que el modelo permite medir la pérdida por lengua y estudiar el equilibrio de mezcla en modelos multilingües de bajos recursos.
- Referencia para destilación y modelos pequeños: con 151M de parámetros totales y 0,6 GB de repositorio, es un candidato manejable como modelo profesor o alumno en experimentos de destilación y poda.
- Pruebas de infraestructura de entrenamiento: la receta documentada (Muon + AdamW, cooldown 1-sqrt, bf16 con maestros fp32) y la procedencia con sha256 permiten reproducir el pipeline en una sola GPU y verificar la paridad bit a bit de los logits.
- Docencia y experimentación local: cabe en una GPU de consumo y permite a estudiantes ejecutar un transformer completo con RoPE, GQA y XSA sin infraestructura especializada.

## Benchmarks y rendimiento

Evaluación zero-shot con 500 elementos por tarea, barajado con semilla 0, protocolo hub-v1. Las tareas de elección múltiple puntúan log P(continuación | contexto) con precisión normalizada donde está definida.

| Tarea | Puntuación |
|---|---|
| ARC-Easy | 0.458 |
| ARC-Challenge | 0.210 |
| HellaSwag | 0.262 |
| PIQA | 0.592 |
| WinoGrande | 0.470 |
| BoolQ | 0.590 |
| MMLU | 0.240 |
| LAMBADA | 0.248 |
| DQRB (propia) | 0.481 |
| LAMBADA bits per byte | 1.418 |

Pérdida de validación sobre el canon propio (phase-1-release canon-8192, 8192 × 2048 tokens): 2,6672 nats por token. Los pesos del repositorio reproducen los logits del código de entrenamiento de forma bit a bit y puntúan 2,6673 bajo PyTorch SDPA (el entrenamiento usó FlashAttention-4). No se han publicado comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,3 GB para los pesos (151,5M de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna con soporte bf16. El modelo se entrenó en una NVIDIA GH200 de 120 GB, pero para inferencia es sobredimensionada.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes, e incluso en iGPU con suficiente memoria asignada.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible, y la atención XSA y el código de modelado propio hacen improbable que funcionen sin adaptación.
- Latencia y throughput: no disponibles. El contexto máximo de 2048 tokens limita el tamaño de la caché KV y mantiene el coste por token bajo.

## Comparativa con modelos similares

No se han publicado comparaciones directas con modelos de la misma categoría en la información disponible. Como referencia de categoría, se puede situar frente a otros modelos base de tamaño similar, aunque los datos de estos últimos no forman parte de la información proporcionada y no se contrastan aquí.

| Modelo | Parámetros totales | Contexto | Licencia | Formato |
|---|---|---|---|---|
| vectabass-151m-950mt-base-cooled | 151,5M | 2048 | Apache 2.0 | safetensors |
| Alternativas de ~150M base | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de leyes de escala, no un asistente: afirmará cosas falsas con fluidez y no sigue instrucciones.
- No tiene ajuste de seguridad ni filtrado de salidas; puede generar contenido inapropiado, sesgado u ofensivo.
- El contexto está limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Predominantemente inglés, con proporciones menores de galés, gaélico escocés, irlandés, manés, córnico y escocés; el rendimiento en estas lenguas será desigual y probablemente bajo.
- Riesgo alto de alucinación en conocimiento factual, coherente con su tamaño y con las puntuaciones de MMLU (0.240) y HellaSwag (0.262).
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción; cualquier despliegue comercial requeriría ajuste adicional y evaluación propia.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo en entornos sensibles.
- La atención XSA no está soportada de forma nativa por las pilas de inferencia habituales, lo que puede limitar el rendimiento y las optimizaciones disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-151m-950mt-base-cooled
- Réplicas de semilla: rama `seed2` del mismo repositorio (`revision="seed2"`)
- Conjunto de datos fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Conjunto de datos fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Conjunto de datos finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Referencia Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Paper: pendiente de publicación según la model card; hasta entonces, citar el repositorio.
