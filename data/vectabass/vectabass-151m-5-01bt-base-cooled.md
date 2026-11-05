# VectaBass/vectabass-151m-5.01bt-base-cooled

## Resumen

vectabass-151m-5.01bt-base-cooled es un modelo de lenguaje base de 151,5 millones de parámetros totales (100,0 millones no pertenecientes a embeddings) desarrollado por VectaBass, entrenado sobre 5.014 millones de tokens. Forma parte de la "Phase 1 AR square", una escalera de modelos que va desde 100M hasta 1.6B de parámetros no-embedding, cada tamano entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar empíricamente las leyes de escala. Este checkpoint concreto corresponde a la celda N1-D3 del citado cuadrado experimental, con 50 tokens por parámetro no-embedding.

La arquitectura es de tipo transformer causal con atención exclusiva auto-atentiva (XSA), una variante que Llama no incorpora, junto con GQA en proporción 2:1, SwiGLU, RMSNorm pre-norm y RoPE con base 10000 y contexto de 2048 tokens. El vocabulario es GPT-2 BPE ampliado con 26 tokens especiales (50304 filas). Se distribuye bajo licencia Apache 2.0 y con pesos en safetensors, requiriendo `trust_remote_code=True` para cargar el módulo `modeling_vectabass.py` incluido en el repositorio.

Su relevancia es doble: por un lado, es un modelo abierto de escala pequena disenado explícitamente como objeto de estudio de leyes de escala, con réplicas semilla en la rama `seed2` para medir ruido entre ejecuciones; por otro, incorpora fuentes de datos del sector público británico, parlamentarias y de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) y escocés, enmarcándose en la iniciativa de IA soberana del Reino Unido. No es un modelo instruido ni alineado para seguridad: es un base model de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con atención exclusiva auto-atentiva (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE |
| Parametros totales | 151.486.464 (151,5M), embeddings atados |
| Parametros activos | no disponible (no es MoE) |
| Parametros no-embedding | 99.975.168 (100,0M) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (inglés mayoritario; galés, gaélico escocés, irlandés, manés, córnico y escocés en proporciones menores) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Anchura / capas | 1024 / 9 |
| Cabezas | 16 query, 8 key-value, dimension 64 |
| Feed-forward | SwiGLU, dimension 2592 |
| Vocabulario | 50304 filas (GPT-2 BPE 50257 + 26 tokens especiales + padding) |
| Precisión de entrenamiento | bf16 en pesos y activaciones, fp32 en pesos maestros del optimizador |
| Hardware de entrenamiento | 1 x NVIDIA GH200 120GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 9 capas con anchura 1024, 16 cabezas de consulta y 8 de clave-valor (GQA 2:1, dimensión de cabeza 64), feed-forward SwiGLU de dimensión 2592 y normalización RMSNorm en configuración pre-norm. La innovación arquitectónica destacada es la atención exclusiva auto-atentiva (XSA), que el autor senala como ausente en Llama; el resto de la red es de inspiración Llama. Las posiciones se codifican con RoPE de base 10000 y el contexto máximo es de 2048 tokens. Los embeddings de entrada y salida están atados.

El entrenamiento consumió 5.014.290.432 tokens (50 por parámetro no-embedding) con un batch de 262.144 tokens. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) con AdamW en fp32 (betas 0.9, 0.95). El pico de learning rate fue 0.00243, con 100M tokens de warmup, una fase constante y un cooldown 1-sqrt hasta cero en el último 20% del entrenamiento. El weight decay aplicado a matrices fue 0.105. Los datos provienen de la vista "phase-1-release": 47 bins de texto con licencia abierta, aproximadamente 96B tokens únicos, con fuentes del sector público británico, parlamentarias y de lenguas celtas, además de fineweb-edu, fineweb-2 y finemath. El archivo `DATA.md` del repositorio detalla cada bin, su proporción y su licencia. No se menciona RLHF ni DPO: es un modelo puramente preentrenado.

## Capacidades

- Generación de texto autoregresiva en inglés y, en menor medida, en lenguas celtas y escocés.
- Modelado de lenguaje y continuación de contexto; útil como base para fine-tuning.
- Razonamiento de sentido común limitado, propio de un modelo de 151M de parámetros.
- Conocimiento factual acotado y fuertemente condicionado por el corpus de entrenamiento.
- Capacidad multilingüe restringida a los siete idiomas declarados, con el inglés como lengua dominante.
- No soporta tool calling ni function calling de forma nativa.
- No soporta uso como agente ni razonamiento multi-paso instruido.
- No dispone de modo thinking, visión ni audio.
- Capacidad de continuación de código y matemáticas muy limitada por el tamano y el corpus.

## Casos de uso

- Investigación sobre leyes de escala: el modelo es una celda de un cuadrado experimental disenado para verificar empíricamente la relación entre parámetros, tokens y pérdida; se usa junto con el resto de la escalera para ajustar curvas de escalado.
- Medición de ruido entre ejecuciones: las réplicas en la rama `seed2` permiten cuantificar la variabilidad run-to-run con la misma receta, nueva inicialización y nuevo orden de datos.
- Fine-tuning de bajo coste para tareas de clasificación o extracción: con 151M de parámetros y contexto de 2048 tokens, cabe en una sola GPU consumer y sirve como base para adaptaciones específicas de dominio.
- Procesamiento de texto en lenguas celtas: al incluir galés, gaélico escocés, irlandés, manés, córnico y escocés en el corpus, es útil para experimentos de modelado en estas lenguas de bajos recursos.
- Prototipado rápido y pruebas de pipelines de inferencia: su tamano reducido permite validar integraciones con transformers, decodificación y evaluación sin grandes requisitos de hardware.
- Docencia y experimentación académica: sirve para ilustrar el efecto del presupuesto de tokens, el optimizador Muon y el schedule de cooldown en modelos pequenos.
- Generación de borradores de texto en inglés para tareas no críticas donde la veracidad no sea requisito estricto, siempre con revisión humana.

## Benchmarks y rendimiento

Evaluación zero-shot con 500 ítems por tarea (barajado con semilla 0, protocolo hub-v1). Las tareas de elección múltiple puntúan log P(continuación | contexto) con precisión normalizada donde está definida.

| Tarea | Resultado |
|---|---|
| ARC-Easy | 0.460 |
| ARC-Challenge | 0.208 |
| HellaSwag | 0.288 |
| PIQA | 0.614 |
| WinoGrande | 0.502 |
| BoolQ | 0.600 |
| MMLU | 0.258 |
| LAMBADA | 0.294 |
| DQRB (propia) | 0.516 |
| LAMBADA bits per byte | 1.327 |

Pérdida de validación en el canon retenido del autor (phase-1-release canon-8192, 8192 x 2048 tokens): 2.4292 nats por token. Los pesos del repositorio reproducen los logits del código de entrenamiento de forma bit a bit y puntúan 2.4293 bajo PyTorch SDPA (el entrenamiento usó FlashAttention-4). No se han publicado comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,3 GB para los pesos (151,5M parámetros x 2 bytes), más overhead de activaciones y caché KV; en la práctica menos de 1 GB.
- VRAM estimada en fp32: aproximadamente 0,6 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una NVIDIA GH200 120GB, pero la inferencia no requiere hardware de ese nivel.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs de gama baja y en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el módulo `modeling_vectabass.py`); vLLM, llama.cpp, Ollama y TGI no están confirmados como compatibles en la información disponible, dado el código de modelado personalizado.
- Latencia y throughput: no disponibles en la información proporcionada.
- Repositorio de 0,6 GB, lo que incluye pesos y código de modelado.

## Comparativa con modelos similares

No se han publicado comparaciones con modelos comparables en la información disponible. Por tamano (151M totales, 100M no-embedding) y contexto (2048 tokens) se situaría en la categoría de modelos base pequenos tipo GPT-2 small o variantes de ~125M, pero no se dispone de datos de rendimiento de dichos modelos bajo el mismo protocolo para establecer una comparación rigurosa.

| Modelo | Parámetros totales | Contexto | Licencia | Rendimiento comparable |
|---|---|---|---|---|
| vectabass-151m-5.01bt-base-cooled | 151,5M | 2048 | Apache 2.0 | MMLU 0.258, PIQA 0.614 |
| Alternativas de ~125M-160M | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo base de investigación para un estudio de escalado, no un asistente: afirmará cosas falsas con fluidez.
- No ha pasado por instruction tuning ni por safety tuning; no hay filtrado de salidas.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Predominio del inglés; las lenguas celtas y el escocés aparecen en proporciones menores y su calidad es previsiblemente inferior.
- Riesgo elevado de alucinación y de errores factuales por el reducido tamano y el presupuesto de entrenamiento.
- Sesgos potenciales derivados del corpus (fineweb-edu, fineweb-2, finemath y fuentes del sector público británico), no evaluados en la información disponible.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está disenado ni validado para producción.
- Sin datos publicados de benchmarks comparativos ni de throughput; no debe asumirse un rendimiento concreto en despliegues reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-151m-5.01bt-base-cooled
- Réplicas semilla: rama `seed2` del mismo repositorio (`revision="seed2"`)
- Documentación de datos: `DATA.md` en el repositorio
- Procedencia: `provenance.json` en el repositorio (run contract `ar-square--N1-D3`, revisión `d3c8d88f4c10`)
- Código de modelado: `modeling_vectabass.py` en el repositorio
- Isambard-AI National AI Research Resource: https://doi.org/10.48550/arXiv.2410.11199
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
