# VectaBass/vectabass-1.73b-60.8bt-base-cooled

## Resumen

vectabass-1.73b-60.8bt-base-cooled es un modelo de lenguaje base de 1.729 millones de parámetros totales (1.600 millones sin embeddings) desarrollado por VectaBass, un proyecto de investigación centrado en IA soberana del Reino Unido. Se trata de la celda N6-D6 de un "cuadrado AR" de fase 1: una escalera de modelos de 100M a 1.6B de parámetros no-embedding, cada uno entrenado con varios presupuestos de tokens y publicados conjuntamente para que la ley de escalado pueda verificarse empíricamente. Este modelo concreto ha sido entrenado con 60.800 millones de tokens, es decir, 38 tokens por parámetro no-embedding.

La arquitectura es de tipo transformer causal similar a Llama, con atención de grupos de consulta (GQA) en proporción 2:1 y una innovación propia denominada atención auto-exclusiva (XSA), que Llama no incorpora. El contexto es de 2048 tokens, una ventana corta en comparación con los estándares actuales. El modelo está pensado como objeto de estudio científico, no como asistente: no ha pasado por ajuste de instrucciones ni por alineamiento de seguridad.

Su relevancia radica en dos factores: por un lado, forma parte de un conjunto de modelos diseñados para validar leyes de escalado con réplicas de semilla en ramas `seed2`; por otro, incorpora fuentes de datos del sector público británico, parlamentarias y de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) junto con escocés, lo que lo convierte en un recurso poco habitual para investigación en lenguas minoritarias de las islas británicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama con GQA 2:1 y atención auto-exclusiva (XSA) |
| Parámetros totales | 1.729.167.360 (embeddings atados) |
| Parámetros activos | No aplica (no es MoE) |
| Parámetros no-embedding | 1.600.389.120 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible (el autor recomienda bf16, el formato de entrenamiento) |
| Idiomas soportados | Inglés (principal), galés (cy), gaélico escocés (gd), irlandés (ga), manés (gv), córnico (kw), escocés (sco) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Anchura / capas | 2560 / 22 |
| Cabeceras | 40 query, 20 key-value, dimensión 64 |
| Feed-forward | SwiGLU, 6912 |
| Normalización | RMSNorm, pre-norm |
| Posiciones | RoPE, base 10000 |
| Vocabulario | 50304 filas: GPT-2 BPE (50257) + 26 tokens especiales, resto padding |
| Hardware de entrenamiento | 4 x NVIDIA GH200 120GB |
| Tamaño del repositorio | 6,9 GB |

## Arquitectura y entrenamiento

El modelo sigue una topología transformer causal densa con pre-norm RMSNorm, activación SwiGLU en el feed-forward y RoPE para codificar posiciones. La atención usa GQA con 40 cabeceras de consulta y 20 de clave-valor (dimensión 64), lo que reduce el coste de caché KV a la mitad respecto a atención multi-cabecera completa. La innovación destacable es la atención auto-exclusiva (XSA), que no existe en Llama y requiere cargar `modeling_vectabass.py` con `trust_remote_code=True`.

El entrenamiento consumió 60.800.106.496 tokens (38 por parámetro no-embedding) con un tamaño de lote de 524.288 tokens. El optimizador combina Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) con AdamW fp32 (0.9, 0.95). El pico de learning rate fue 0.00106, con un warmup de 1003 millones de tokens, fase constante y un cooldown 1-sqrt hasta cero en el último 20% del entrenamiento. El weight decay aplicado a matrices fue 0.0511. La precisión de entrenamiento fue bf16 en pesos y activaciones, con pesos maestros fp32 en el optimizador y estadísticas de normalización, ángulos RoPE y logits en fp32. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96.000 millones de tokens únicos, incluyendo fuentes del sector público británico, parlamentarias y de lenguas celtas; las fuentes citadas son FineWeb-Edu, FineWeb-2 y FineMath.

## Capacidades

- Generación de texto autoregresiva en inglés y, en menor medida, en lenguas celtas y escocés.
- Modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- Razonamiento de sentido común y comprensión lectora de nivel básico-medio, según los benchmarks publicados (ARC-Easy 0.672, PIQA 0.732).
- Conocimiento factual limitado: MMLU de 0.246 en zero-shot, propio de un modelo de 1.7B con 60B tokens.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenadas.
- Sin capacidades multimodales (visión, audio) ni modo de pensamiento (thinking).
- Capacidad multilingüe limitada a las lenguas listadas, con el inglés como idioma dominante.
- Réplicas de semilla disponibles en la rama `seed2` para medir ruido entre ejecuciones.

## Casos de uso

- Investigación en leyes de escalado: el modelo es una celda de un cuadrado AR con varios tamaños y presupuestos de tokens; se usa para ajustar y validar curvas de pérdida frente a parámetros y tokens, comparando con las réplicas de la rama `seed2` para estimar la varianza entre ejecuciones.
- Estudio de atención auto-exclusiva (XSA): al ser una variante arquitectónica poco común, sirve para reproducir experimentos de ablación sobre mecanismos de atención comparándolo con transformers Llama-like estándar del mismo tamaño.
- Investigación en lenguas celtas: con datos de galés, gaélico escocés, irlandés, manés y córnico, permite medir la pérdida por lengua y estudiar el efecto de mezclas de datos minoritarias en modelos pequeños.
- Generación de texto controlada en dominio público: con licencia Apache 2.0 y pesos abiertos, puede integrarse en pipelines de generación de borradores o completado de texto sobre corpus del sector público británico, siempre con revisión humana.
- Fine-tuning supervisado como punto de partida: al ser un base model de 1.7B, es adecuado para ajuste con SFT o LoRA en tareas concretas (clasificación, extracción, resumen) cuando no se necesita un asistente prealineado.
- Evaluación de infraestructura de inferencia: su tamaño permite desplegarlo en una sola GPU consumer de gama alta y usarlo como banco de pruebas para medir throughput y latencia de vLLM, llama.cpp o TGI antes de escalar a modelos mayores.
- Reproducibilidad de experimentos: el repositorio incluye `provenance.json` con hash sha256 del checkpoint fuente y contrato de ejecución, lo que facilita la verificación bit a bit de los logits frente al código de entrenamiento.

## Benchmarks y rendimiento

Evaluación zero-shot con 500 ítems por tarea (shuffle con semilla 0), protocolo hub-v1. Las tareas de elección múltiple puntúan log P(continuación | contexto) con precisión normalizada donde aplica.

| Tarea | Puntuación |
|---|---|
| ARC-Easy | 0.672 |
| ARC-Challenge | 0.372 |
| HellaSwag | 0.546 |
| PIQA | 0.732 |
| WinoGrande | 0.624 |
| BoolQ | 0.600 |
| MMLU | 0.246 |
| LAMBADA | 0.502 |
| DQRB (propia) | 0.648 |
| LAMBADA bits per byte | 1.157 |

Pérdida de validación en el canon retenido (phase-1-release canon-8192, 8192 x 2048 tokens): 1.8331 nats por token con el código de entrenamiento; 1.8333 con PyTorch SDPA. El autor indica que los pesos reproducen los logits del código de entrenamiento bit a bit. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 4 y 6 GB según longitud de secuencia y lote.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1,2 GB (aunque el autor recomienda bf16 y no documenta cuantizaciones oficiales).
- GPU recomendadas para producción: A100, H100 o GH200 para mayor throughput; una RTX 4090 (24 GB) o RTX 3090 (24 GB) es más que suficiente para inferencia en bf16.
- Cabe en GPU consumer: sí, en cualquier GPU con 8 GB o más en bf16; en tarjetas de 4-6 GB requeriría cuantización.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por XSA); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible y podrían requerir adaptación por el código personalizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-1.73b-60.8bt-base-cooled | 1,73B (1,60B no-embedding) | 2048 | Apache 2.0 | Base, XSA, foco en lenguas celtas y datos del Reino Unido |
| Modelos tipo Llama-3.2-1B | ~1,2B | 128k | Llama 3.2 Community License | Base e instruct, contexto largo, sin lenguas celtas específicas |
| Modelos tipo Qwen2.5-1.5B | ~1,5B | 32k | Apache 2.0 (mayoría de variantes) | Base e instruct, multilingüe amplio, tool calling en variantes instruct |
| Modelos tipo SmolLM2-1.7B | ~1,7B | 8k | Apache 2.0 | Base e instruct, entrenado con ~11B tokens, sin foco celta |

La comparación de rendimiento con estos modelos no está disponible en la información proporcionada; los benchmarks publicados del modelo son únicamente los de la tabla anterior y no incluyen ejecuciones de referencia de terceros.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escalado, no un asistente: afirmará cosas falsas con fluidez y no sigue instrucciones de forma fiable.
- Contexto de solo 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Sin ajuste de seguridad ni filtrado de salidas; puede generar contenido inapropiado o dañino.
- Predominio del inglés; las lenguas celtas y el escocés tienen participaciones menores y su calidad es desigual.
- MMLU de 0.246 indica conocimiento factual limitado; no es adecuado para preguntas de conocimiento general sin verificación.
- Requiere `trust_remote_code=True` por la atención XSA, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantías de calidad ni soporte del autor.
- Riesgo de alucinación elevado por el tamaño y el presupuesto de entrenamiento; cualquier salida en producción debe validarse.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- HuggingFace: https://huggingface.co/VectaBass/vectabass-1.73b-60.8bt-base-cooled
- Referencia de Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
