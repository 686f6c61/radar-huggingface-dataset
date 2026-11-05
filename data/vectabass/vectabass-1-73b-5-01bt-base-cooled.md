# VectaBass/vectabass-1.73b-5.01bt-base-cooled

## Resumen

vectabass-1.73b-5.01bt-base-cooled es un modelo de lenguaje base de 1.729 millones de parámetros totales (1.600 millones sin contar embeddings) desarrollado por VectaBass, un proyecto orientado a la investigación de leyes de escala y a la soberanía de IA en el Reino Unido. Se trata de la celda N6-D3 del "cuadrado AR" de la fase 1: una escalera de modelos de 100M a 1.6B parámetros no-embedding, cada uno entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar empíricamente la ley de escala. Este modelo concreto se entrenó con 5.014 millones de tokens, es decir, 3 tokens por parámetro no-embedding.

La arquitectura es de tipo transformer causal con atención de grupo (GQA 2:1) y una innovación propia denominada atención auto-exclusiva (XSA), que no existe en Llama. Usa 22 capas, anchura 2560, 40 cabezas de consulta y 20 de clave-valor con dimensión 64, feed-forward SwiGLU de 6912 y normalización RMSNorm pre-norm. La longitud de contexto es de solo 2048 tokens, un valor reducido para los estándares actuales, coherente con su naturaleza de modelo de investigación.

Es relevante ahora porque forma parte de un conjunto de modelos publicados para validar leyes de escala con datos abiertos y licencias permisivas, incluyendo fuentes parlamentarias y de lenguas celtas del Reino Unido. No es un modelo para uso como asistente: es un base model sin ajuste por instrucciones ni por seguridad, pensado para estudiar el comportamiento del entrenamiento a distintas escalas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama con atención auto-exclusiva (XSA) y GQA 2:1 |
| Parametros totales | 1.729.167.360 (embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (entrenado y publicado en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (mayoritario), galés, gaélico escocés, irlandés, manés, córnico y escocés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 22 capas, anchura 2560, 40 cabezas de consulta y 20 de clave-valor de dimensión 64, feed-forward SwiGLU de 6912 y RMSNorm pre-norm. Las posiciones se codifican con RoPE de base 10000 y contexto de 2048 tokens. La atención es causal con GQA 2:1 y añade XSA (atención auto-exclusiva), una variante propietaria que el autor indica que Llama no incorpora. El vocabulario tiene 50.304 filas: BPE de GPT-2 (50.257) más 26 tokens especiales y relleno. Los embeddings están atados.

El entrenamiento usó 5.014.290.432 tokens en lotes de 524.288 tokens, con 4 GPU NVIDIA GH200 de 120 GB. El optimizador combina Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momento 0.95) con AdamW fp32 (0.9, 0.95). El LR máximo fue 0.00106, con calentamiento de 1003M tokens y un schedule de warmup, constante y cooldown 1-sqrt hasta cero en el último 20%. El weight decay fue 0.0511 sobre matrices. Se entrenó en bf16 con pesos maestros fp32 en el optimizador y estadísticas de norma, ángulos RoPE y logits en fp32. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96.000 millones de tokens únicos, incluyendo fuentes del sector público y parlamentarias del Reino Unido y lenguas celtas, sobre FineWeb-Edu, FineWeb-2 y FineMath.

## Capacidades

- Generación de texto autoregresiva en inglés y lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico y escocés) en proporciones menores.
- Modelado de lenguaje base: continuación de texto, predicción de siguiente token y puntuación de secuencias.
- Capacidad matemática limitada por el entrenamiento en FineMath, sin evaluación publicada.
- No dispone de tool calling ni function calling: es un modelo base sin ajuste para ello.
- No soporta agentes ni razonamiento multi-paso de forma fiable: no hay ajuste por instrucciones.
- No tiene modo de pensamiento (thinking), visión ni audio.
- Sirve como componente para experimentos de escalado, no como asistente conversacional.

## Casos de uso

- Investigación de leyes de escala: se puede usar como punto de la escalera (1.6B no-embedding, 3 tokens por parámetro) para ajustar curvas de pérdida frente a tamaño y presupuesto de tokens, comparando con las demás celdas del cuadrado AR.
- Evaluación de arquitecturas con XSA: permite reproducir y contrastar el efecto de la atención auto-exclusiva frente a atención estándar en un modelo de tamaño controlado, gracias a que los logits reproducen bit a bit los del código de entrenamiento.
- Estudio de cobertura de lenguas celtas: sirve para medir perplejidad y calidad de generación en galés, gaélico escocés, irlandés, manés, córnico y escocés, idiomas con pocos recursos y escasa representación en modelos abiertos.
- Punto de partida para fine-tuning supervisado: al ser un base model con licencia Apache 2.0, se puede ajustar con instrucciones o con datos de dominio para tareas concretas, partiendo de un checkpoint de 1.7B parámetros.
- Experimentos de destilación y decodificación especulativa: su tamaño reducido y su licencia permisiva lo hacen útil como modelo borrador o alumno en pipelines de investigación.
- Reproducibilidad de entrenamiento: el repo incluye contrato de ejecución, revisiones y sha256 del checkpoint fuente, lo que facilita replicar el experimento en entornos de investigación con GH200 o GPUs equivalentes.
- Análisis de sesgos y de datos del sector público británico: al entrenarse con fuentes parlamentarias y del sector público del Reino Unido, permite estudiar qué conocimiento y estilos incorpora ese corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las puntuaciones zero-shot aún no se han medido. El único dato de evaluación publicado es la pérdida de validación:

| Metrica | Valor |
|---|---|
| Validation loss (canon-8192, 8192 x 2048 tokens) | 2,1277 nats por token |
| Validation loss bajo PyTorch SDPA | 2,1278 nats por token |
| Reproducibilidad de logits | Bit a bit frente al código de entrenamiento (FlashAttention-4 en entrenamiento) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica unos 4-6 GB según longitud de secuencia y lote.
- VRAM estimada en cuantización de 8 bits: unos 1,8-2 GB de pesos; en 4 bits, unos 1-1,2 GB (cuantizaciones no oficiales, no documentadas por el autor).
- GPU recomendadas: NVIDIA GH200 (usada en entrenamiento), A100, H100 o RTX 4090 para inferencia; cualquier GPU consumer con 8 GB o más debería poder ejecutarlo en bf16 con lotes pequeños.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares; con cuantización, en GPUs de 6-8 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True` (necesario para cargar `modeling_vectabass.py`); vLLM, llama.cpp, Ollama o TGI requerirían soporte para la arquitectura XSA, que no está documentado en la información disponible.
- Latencia y throughput: no disponibles. El contexto de 2048 tokens limita el coste de la caché KV y favorece lotes grandes, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-1.73b-5.01bt-base-cooled | 1,73B totales (1,60B no-embedding) | 2048 | Apache 2.0 | Base model de estudio de escalado, con XSA y lenguas celtas |
| Llama 3.2 1B | 1,24B | 128k | Llama 3.2 Community License | Base e instruct, ampliamente soportado en vLLM/llama.cpp |
| Qwen2.5 1.5B | 1,54B | 32k | Apache 2.0 | Base e instruct, multilingüe amplio, benchmarks publicados |
| SmolLM2 1.7B | 1,71B | 8k | Apache 2.0 | Base e instruct, entrenado con ~11B tokens, benchmarks publicados |

La comparación con estos modelos es solo orientativa: no hay benchmarks publicados para vectabass, por lo que no se puede afirmar superioridad o inferioridad en tareas concretas. La diferencia principal es el contexto (2048 frente a 8k-128k) y la ausencia de ajuste por instrucciones.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni por seguridad: afirmará cosas falsas con fluidez y no debe usarse como asistente en producción.
- Contexto muy limitado: 2048 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o pipelines de agentes.
- Idiomas: mayoritariamente inglés; las lenguas celtas están en proporciones menores y su calidad no está evaluada.
- Sin benchmarks zero-shot publicados, por lo que no se puede estimar su rendimiento en MMLU, HumanEval, GSM8K u otras tareas estándar.
- No hay filtrado de salidas ni mitigación de sesgos; los sesgos del corpus (fuentes del sector público británico y web abierta) pueden reflejarse en las generaciones.
- Riesgo de alucinación alto por su naturaleza de modelo base y por el reducido presupuesto de entrenamiento (3 tokens por parámetro).
- Licencia Apache 2.0: permite uso comercial, pero al no haber ajuste ni evaluación, el usuario asume todo el riesgo de calidad y seguridad.
- Requiere `trust_remote_code=True` para cargar código propio (`modeling_vectabass.py`), lo que implica ejecutar código del repositorio; conviene revisarlo antes de usarlo en entornos sensibles.
- Soporte limitado en herramientas de inferencia: la arquitectura XSA no está documentada como soportada en vLLM, llama.cpp u Ollama.

## Enlaces

- HuggingFace: https://huggingface.co/VectaBass/vectabass-1.73b-5.01bt-base-cooled
- Paper de Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
