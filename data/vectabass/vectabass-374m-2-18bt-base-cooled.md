# VectaBass/vectabass-374m-2.18bt-base-cooled

## Resumen

vectabass-374m-2.18bt-base-cooled es un modelo de lenguaje base de 374 millones de parámetros totales (303,1 millones no pertenecientes a embeddings) desarrollado por VectaBass, un proyecto orientado a la soberanía de IA del Reino Unido. Forma parte de la celda N3-D2 del "cuadrado AR" de la fase 1: una escalera de modelos que va de 100M a 1.600M de parámetros no-embedding, cada tamano entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar la ley de escalado. Este checkpoint concreto se entrena con 2.182.676.480 tokens, lo que equivale a 7 tokens por parámetro no-embedding.

La arquitectura es de tipo transformer decoder-only similar a Llama, con atención causal, GQA en proporción 2:1, SwiGLU, RMSNorm pre-norm y RoPE con base 10000, pero incorpora una innovación propia: atención autoexclusiva (XSA), que Llama no tiene. El contexto máximo es de 2048 tokens y el vocabulario es GPT-2 BPE (50257 tokens) más 26 tokens especiales, con embeddings atados (tied). Los pesos se distribuyen en safetensors y requieren `trust_remote_code` para cargar el módulo `modeling_vectabass.py`.

El modelo es relevante ahora por su enfoque: no busca competir como asistente, sino servir como punto de medida reproducible para estudiar leyes de escalado, con pesos que reproducen bit a bit los logits del código de entrenamiento. Su interés practico es de investigación: permite validar empiricamente relaciones entre tamano, tokens y perdida, además de ofrecer cobertura de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) y escocés, poco habituales en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con atención autoexclusiva (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE base 10000 |
| Parametros totales | 373.980.288 (según safetensors); 373.942.272 según model card (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code` para cargar `modeling_vectabass.py`) |

## Arquitectura y entrenamiento

El modelo sigue una topología transformer decoder-only con 13 capas, anchura 1408, 22 cabezas de consulta y 11 de clave-valor con dimensión 64 por cabeza, feed-forward SwiGLU de 4112 unidades y normalización RMSNorm en configuración pre-norm. La posición se codifica con RoPE de base 10000 y el contexto se limita a 2048 tokens. La innovación arquitectónica destacada es la atención autoexclusiva (XSA), que se suma a la atención causal estándar y a GQA 2:1. Los embeddings están atados y el vocabulario tiene 50304 filas: GPT-2 BPE (50257) más 26 tokens especiales y relleno de padding.

El entrenamiento se realizó sobre 2.182.676.480 tokens (7 por parámetro no-embedding), con un batch de 327.680 tokens. El optimizador combina Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momento 0.95) con AdamW en fp32 (0.9, 0.95). El pico de learning rate fue 0.00174, con warmup de 190M tokens, fase constante y un cooldown 1-sqrt hasta cero en el último 20% del entrenamiento. El weight decay fue 0.0691 sobre matrices. Se usó precisión bf16 en pesos y activaciones, con pesos maestros en fp32 en el optimizador y estadísticas de norma, ángulos RoPE y logits en fp32. Todo el entrenamiento se ejecutó en una única NVIDIA GH200 de 120 GB. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96B tokens únicos, con fuentes del sector público y parlamentario del Reino Unido y de lenguas celtas; el detalle de cada bin, su proporción y licencia está en `DATA.md`.

## Capacidades

- Generación de texto autoregresiva en modo base, sin ajuste de instrucciones ni de seguridad.
- Razonamiento de siguiente token y modelado de lenguaje puro; no se documentan capacidades de razonamiento multi-paso entrenadas.
- Cobertura multilingüe limitada a inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés, con el inglés como idioma dominante.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking).
- Capacidad de servir como punto de referencia reproducible para estudios de leyes de escalado, con logits que reproducen bit a bit los del código de entrenamiento.

## Casos de uso

- Investigación sobre leyes de escalado: el modelo es una celda de una escalera de 100M a 1.600M de parámetros no-embedding; se usa para medir pérdida de validación frente a tokens y parámetros y contrastar la ley de escalado con datos empíricos reproducibles.
- Validación de reproducibilidad de entrenamiento: al reproducir bit a bit los logits del código original, sirve para auditar pipelines de entrenamiento y verificar que una implementación de inferencia (por ejemplo, SDPA frente a FlashAttention-4) no altera las salidas.
- Investigación en lenguas celtas: con cobertura de galés, gaélico escocés, irlandés, manés y córnico, permite estudiar el comportamiento de modelos pequeños en lenguas de bajos recursos y comparar con modelos multilingües mayores.
- Experimentos de arquitectura con XSA: al incorporar atención autoexclusiva sobre una base tipo Llama, es útil para comparar el efecto de XSA frente a atención estándar en tareas de modelado de lenguaje a igual presupuesto de cómputo.
- Generación de texto controlada en dominios del Reino Unido: con fuentes parlamentarias y del sector público en el corpus, puede emplearse en experimentos de modelado de lenguaje sobre texto administrativo y parlamentario, siempre como modelo base y con revisión humana.
- Fine-tuning académico de bajo coste: con 374M de parámetros totales y pesos en bf16, cabe en una GPU consumer y sirve como base para experimentos de ajuste supervisado o DPO en entornos con recursos limitados.
- Docencia y prototipado: permite ilustrar el funcionamiento de un transformer decoder-only con GQA, RoPE y embeddings atados en cursos y talleres, con un coste de inferencia muy bajo.

## Benchmarks y rendimiento

Evaluación zero-shot con 500 elementos por tarea (barajado con semilla 0, protocolo hub-v1). Las tareas de elección múltiple puntúan log P(continuación | contexto) con precisión normalizada donde está definida.

| Tarea | Resultado |
|---|---|
| ARC-Easy | 0.488 |
| ARC-Challenge | 0.238 |
| HellaSwag | 0.308 |
| PIQA | 0.618 |
| WinoGrande | 0.502 |
| BoolQ | 0.598 |
| MMLU | 0.230 |
| LAMBADA | 0.274 |
| DQRB (propia) | 0.531 |
| LAMBADA bits per byte | 1.327 |

Pérdida de validación en el canon retenido (phase-1-release canon-8192, 8192 x 2048 tokens): 2.3984 nats por token. Bajo PyTorch SDPA, este repositorio puntúa 2.3985. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,75 GB para los pesos (373,98M de parámetros a 2 bytes), más overhead de activaciones y caché KV; con contexto de 2048 tokens y 13 capas, la caché KV es reducida (11 cabezas KV de dimensión 64), por lo que el consumo total se mantiene por debajo de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento se realizó en una NVIDIA GH200 de 120 GB, pero la inferencia no requiere hardware de ese nivel.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes; también en CPU con llama.cpp u Ollama si se generan pesos GGUF (no publicados oficialmente).
- Opciones de despliegue: transformers con `trust_remote_code=True` y `dtype=torch.bfloat16` (soporte oficial); vLLM, llama.cpp, Ollama y TGI no están documentados oficialmente para esta arquitectura con XSA y requerirían adaptación del código de modelado.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| vectabass-374m-2.18bt-base-cooled | 373,98M | 2048 | apache-2.0 | en, cy, gd, ga, gv, kw, sco | Base con XSA, orientado a leyes de escalado |
| Modelos tipo Llama de ~350-400M | no disponible | no disponible | no disponible | no disponible | No se dispone de comparación directa en la información proporcionada |
| Modelos tipo GPT-2 small (~124M) | 124M | 1024 | no disponible | en | Menor tamano y contexto; no comparable en presupuesto de tokens |
| Modelos multilingües pequeños (~300-500M) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de resultados de benchmarks de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones ni de seguridad: no debe usarse como asistente y puede afirmar cosas falsas con fluidez.
- Riesgo alto de alucinación y de generar contenido inapropiado, ya que no hay filtrado de salidas.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Cobertura lingüística centrada en inglés, con presencia menor de lenguas celtas y escocés; el rendimiento en estas lenguas es previsiblemente inferior.
- No se documentan sesgos específicos, pero el corpus incluye fuentes del sector público y parlamentario del Reino Unido, lo que puede introducir sesgos de dominio y de registro.
- La licencia apache-2.0 permite uso comercial, pero el modelo no está disenado para producción como asistente y carece de garantías de calidad.
- Requiere `trust_remote_code=True` para cargar el código de modelado personalizado, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo.
- No se publican pesos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en herramientas estándar sin conversión previa.

## Enlaces

- HuggingFace: https://huggingface.co/VectaBass/vectabass-374m-2.18bt-base-cooled
- Referencia de Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
