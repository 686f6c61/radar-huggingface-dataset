# VectaBass/vectabass-232m-26.5bt-base-cooled

## Resumen

vectabass-232m-26.5bt-base-cooled es un modelo de lenguaje base de 232 millones de parámetros totales (173,9 millones sin contar embeddings) desarrollado por VectaBass en el marco de su proyecto de "IA soberana del Reino Unido". Se trata de una de las celdas (N2-D5) de la "cuadrícula AR" de la fase 1: una escalera de modelos que va de 100M a 1.600M de parámetros no-embedding, cada tamaño entrenado con varios presupuestos de tokens y publicados en conjunto para poder verificar empíricamente las leyes de escalado.

El modelo emplea una arquitectura tipo transformer decoder-only similar a Llama, pero con una innovación propia: atención exclusiva auto-atenciva (XSA), que Llama no incorpora. Usa GQA con ratio 2:1 (18 cabezas de consulta, 9 de clave-valor), SwiGLU en la feed-forward, RMSNorm pre-norm y RoPE con base 10000 y contexto de 2048 tokens. Fue entrenado sobre 26.460 millones de tokens (152 tokens por parámetro no-embedding) en una única GPU NVIDIA GH200 de 120 GB.

Su relevancia es doble: por un lado, es un punto de datos reproducible para estudiar leyes de escalado con receta de entrenamiento documentada al detalle (optimizador Muon + AdamW, schedule de cooldown 1-sqrt); por otro, incorpora datos de lenguas celtas y fuentes parlamentarias y del sector público británico, lo que lo convierte en una referencia para el desarrollo de modelos en lenguas minoritarias. Es un modelo base, sin ajuste por instrucciones ni por seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con atención exclusiva auto-atenciva (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE |
| Parametros totales | 231.800.832 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el autor indica ejecutar en bf16 tal como se entrenó) |
| Idiomas soportados | en, cy (galés), gd (gaélico escocés), ga (irlandés), gv (manés), kw (córnico), sco (escocés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `trust_remote_code` para cargar `modeling_vectabass.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 12 capas, anchura 1152, 18 cabezas de consulta y 9 de clave-valor de dimensión 64, feed-forward SwiGLU de 3040 y normalización RMSNorm pre-norm. La posición se codifica con RoPE de base 10000 sobre una ventana de 2048 tokens. La atención es causal con GQA 2:1 y añade XSA (atención exclusiva auto-atenciva), una variante que el autor señala como diferenciadora respecto a Llama. El vocabulario tiene 50.304 filas: BPE de GPT-2 (50.257 tokens) más 26 tokens especiales y relleno.

El entrenamiento consumió 26.464.747.520 tokens con un batch de 327.680 tokens. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) y AdamW en fp32 (betas 0.9, 0.95). El pico de learning rate fue 0.00206, con un warmup de 174M tokens, una fase constante y un cooldown 1-sqrt hasta cero en el último 20 % del entrenamiento. El weight decay fue 0.0784 sobre matrices. Se usó precisión bf16 en pesos y activaciones, con pesos maestros en fp32 en el optimizador y estadísticas de norma, ángulos RoPE y logits en fp32. Todo el entrenamiento se ejecutó en una sola GPU NVIDIA GH200 de 120 GB. Los datos provienen de la vista "phase-1-release": 47 bins de texto con licencia abierta (unos 96B tokens únicos), incluyendo fineweb-edu, fineweb-2 y finemath, además de fuentes del sector público y parlamentarias del Reino Unido y de lenguas celtas.

## Capacidades

- Generación de texto autoregresiva en inglés y en lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) y escocés.
- Modelado de lenguaje puro: continuación de texto, puntuación de secuencias y evaluación de perplejidad.
- Razonamiento básico de sentido común y respuesta a preguntas de opción múltiple en modo zero-shot (rendimiento propio de un modelo de 232M).
- Capacidad matemática limitada, apoyada por la inclusión de finemath en el corpus.
- No dispone de tool calling ni function calling: es un modelo base sin ajuste por instrucciones.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- No tiene modo "thinking", visión ni audio.
- Capacidad multilingüe restringida a las siete lenguas listadas; el inglés domina el corpus.

## Casos de uso

- Investigación sobre leyes de escalado: al ser una celda de una cuadrícula con tamaño y presupuesto de tokens controlados, permite ajustar y validar curvas de pérdida frente a parámetros y tokens con datos reproducibles.
- Desarrollo de modelos para lenguas celtas: sirve como punto de partida (preentrenamiento o fine-tuning) para galés, gaélico escocés, irlandés, manés y córnico, lenguas con escasa representación en corpus generalistas.
- Evaluación de técnicas de atención: su XSA y su GQA 2:1 lo convierten en un banco de pruebas pequeño y barato para comparar variantes de atención frente a un transformer Llama-like equivalente.
- Baseline en pipelines de investigación: con 0,5 GB de repositorio y ejecución en bf16, se puede desplegar en una sola GPU consumer para experimentos de perplejidad, ablaciones o destilación.
- Generación de texto asistida en dominios administrativos y parlamentarios: el corpus incluye fuentes del sector público británico, por lo que puede emplearse para estudiar el estilo y el vocabulario de ese dominio (siempre con revisión humana).
- Prototipado de completado de texto y autocompletado: su ventana de 2048 tokens y su bajo coste de inferencia permiten integrarlo en demos de continuación de texto o en entornos educativos.
- Estudio de recetas de entrenamiento: la documentación de Muon, el schedule de cooldown y la precisión mixta permite reproducir y comparar configuraciones de entrenamiento a pequeña escala.

## Benchmarks y rendimiento

Evaluación zero-shot con 500 ítems por tarea (shuffle con semilla 0, protocolo hub-v1). Puntuación de opción múltiple basada en log P(continuación | contexto), con exactitud normalizada donde procede.

| Tarea | Puntuación |
|---|---|
| ARC-Easy | 0.532 |
| ARC-Challenge | 0.250 |
| HellaSwag | 0.348 |
| PIQA | 0.656 |
| WinoGrande | 0.504 |
| BoolQ | 0.606 |
| MMLU | 0.272 |
| LAMBADA | 0.380 |
| DQRB (propia) | 0.585 |
| LAMBADA bits per byte | 1.261 |

Pérdida de validación en el canon retenido del autor (phase-1-release canon-8192, 8192 × 2048 tokens): 2,1981 nats por token. Los pesos de este repositorio reproducen bit a bit los logits del código de entrenamiento bajo PyTorch SDPA (el entrenamiento usó FlashAttention-4).

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 0,5 GB para los pesos (232M parámetros × 2 bytes); con overhead de activaciones y caché KV para 2048 tokens, el consumo real ronda 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha validado en NVIDIA GH200 (entrenamiento). Para inferencia basta una RTX 3060, RTX 4060 o superior.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer modernas, incluidas las de gama de entrada.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido para cargar `modeling_vectabass.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la naturaleza de código personalizado puede complicar su conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-232m-26.5bt-base-cooled | 231,8M (173,9M no-embedding) | 2048 | Apache 2.0 | XSA, GQA 2:1, foco en lenguas celtas y datos del Reino Unido |
| GPT-2 small | 124M | 1024 | MIT | Referencia clásica de tamaño similar; sin GQA ni XSA |
| Pythia-160M | 160M | 2048 | Apache 2.0 | Suite de leyes de escalado de EleutherAI; transformer estándar |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | Modelo pequeño de Hugging Face entrenado con corpus web de alta calidad |

La comparación directa de rendimiento con estas alternativas no está disponible en la información proporcionada, ya que los benchmarks publicados usan protocolos distintos. La principal diferencia de vectabass-232m es su atención XSA, su receta de entrenamiento documentada al detalle y su cobertura de lenguas celtas.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escalado, no un asistente: afirmará cosas falsas con fluidez y no sigue instrucciones.
- No ha recibido ajuste por instrucciones ni ajuste de seguridad; no hay filtrado de salidas.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Predominio del inglés; las lenguas celtas aparecen en proporciones menores y su calidad no está cuantificada en la información disponible.
- Riesgo elevado de alucinación y de sesgos heredados del corpus web (fineweb-edu, fineweb-2) y de fuentes del sector público.
- La licencia Apache 2.0 permite uso comercial, pero al no haber ajuste de seguridad el autor no garantiza idoneidad para producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de desplegarlo.
- El rendimiento en tareas de razonamiento y conocimiento (MMLU 0.272, ARC-Challenge 0.250) es bajo y coherente con su tamaño; no es adecuado para tareas que exijan precisión factual.

## Enlaces

- HuggingFace: https://huggingface.co/VectaBass/vectabass-232m-26.5bt-base-cooled
- Referencia del recurso Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
