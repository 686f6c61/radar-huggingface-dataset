# VectaBass/vectabass-59m-2.18bt-base-cooled

## Resumen

vectabass-59m-2.18bt-base-cooled es un modelo de lenguaje base de 59,48 millones de parámetros totales (27,28 millones no pertenecientes a los embeddings) desarrollado por VectaBass. Se trata de la celda N0-D2 del "AR addendum" del proyecto, un punto adicional por debajo de la escalera principal de 100M a 1,6B parámetros, entrenado con la misma receta y los mismos datos para poder verificar la ley de escalado a un tamaño menor. El modelo se entrenó sobre 2.182.676.480 tokens (80 tokens por parámetro no-embedding) en una única GPU NVIDIA GH200 de 120 GB.

La arquitectura es de tipo transformer causal con atención exclusiva auto-atencion (XSA) además de GQA 2:1, SwiGLU, RMSNorm pre-norm y RoPE con base 10000 y contexto de 2048 tokens. El vocabulario es GPT-2 BPE (50.257 tokens) más 26 tokens especiales, hasta 50.304 filas con padding. La innovación principal respecto a un Llama estándar es la XSA, que el propio autor indica que Llama no incorpora.

Es relevante ahora porque forma parte de un estudio de leyes de escalado orientado a soberanía de IA del Reino Unido, con datos que incluyen fuentes del sector público británico, parlamentarias y de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico y escocés). Es un modelo base, sin ajuste por instrucciones ni por seguridad, y su utilidad es principalmente de investigación, no de producción como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama con self-attention exclusiva (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE base 10000 |
| Parametros totales | 59.473.920 (embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (entrenado y publicado en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (mayoritario), galés (cy), gaélico escocés (gd), irlandés (ga), manés (gv), córnico (kw), escocés (sco) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con código de modelado propio (`modeling_vectabass.py`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 6 capas con anchura 640, 10 cabezas de consulta y 5 de clave-valor de dimensión 64 (GQA 2:1), feed-forward SwiGLU de 1728 y normalización RMSNorm pre-norm. La atención es causal e incorpora self-attention exclusiva (XSA), una variante que el autor describe como distinta de la atención estándar de Llama. Las posiciones usan RoPE con base 10000 y ventana de 2048 tokens. El vocabulario es GPT-2 BPE más 26 tokens especiales.

El entrenamiento utilizó 2.182.676.480 tokens (80 por parámetro no-embedding) con lotes de 327.680 tokens, optimizador Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momento 0.95) combinado con AdamW en fp32 (0.9, 0.95) para el resto, pico de learning rate de 0.00359, warmup de 27M tokens y un schedule de warmup, fase constante y cooldown 1-sqrt hasta cero en el último 20%. El weight decay es 0.119 sobre matrices. La precisión es bf16 en pesos y activaciones con pesos maestros fp32 en el optimizador, y estadísticas de norma, ángulos RoPE y logits en fp32. Todo el cómputo se realizó en una única NVIDIA GH200 de 120 GB, con FlashAttention-4 durante el entrenamiento.

Los datos provienen de la vista "phase-1-release": 47 bins de texto con licencia abierta, unos 96B tokens únicos, con fuentes del sector público y parlamentario del Reino Unido y de lenguas celtas. El detalle de cada bin, su proporción y su licencia se documenta en `DATA.md`. No se menciona RLHF ni DPO: es un modelo base sin ajuste posterior.

## Capacidades

- Generación de texto autoregresiva en inglés y, en menor medida, en galés, gaélico escocés, irlandés, manés, córnico y escocés.
- Modelado de lenguaje base: continuación de texto y predicción de siguiente token; no está ajustado para seguir instrucciones.
- Razonamiento y matemáticas: no se documentan capacidades específicas ni evaluación zero-shot (el autor indica que las puntuaciones de benchmarks zero-shot aún no se han medido).
- Código: no se documenta soporte específico de generación de código.
- Tool calling / function calling: no disponible; el modelo no está ajustado para ello.
- Agentes y razonamiento multi-paso: no disponible; no es un modelo de instrucciones.
- Capacidades multilingües: limitadas a los siete idiomas listados, con el inglés como idioma dominante y las lenguas celtas en proporciones menores.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en leyes de escalado: el modelo sirve como punto de calibración por debajo de la escalera principal (100M–1,6B) para comprobar si la relación entre pérdida y cómputo/tokens se mantiene; se usaría midiendo la pérdida de validación sobre el canon retenido (2,7232 nats/token) y comparándola con las celdas superiores.
- Estudio de arquitecturas con XSA: al incorporar self-attention exclusiva, permite ablaciones controladas frente a variantes con atención estándar bajo la misma receta y datos, útil para grupos que investigan variantes de atención.
- Modelado de lenguas celtas de bajos recursos: con datos de galés, gaélico escocés, irlandés, manés, córnico y escocés, puede emplearse como base para experimentos de continuación de texto o fine-tuning en estas lenguas, aunque su tamaño limita la calidad.
- Evaluación de corpus del sector público británico: al haberse entrenado con fuentes parlamentarias y de administración pública del Reino Unido, sirve para estudiar qué aprende un modelo pequeño de ese dominio y cómo se comporta en texto administrativo.
- Prototipado de infraestructura de inferencia: con 59M parámetros y pesos bf16 (unos 0,1 GB de repo), es adecuado para validar pipelines de despliegue, tokenización y carga con `trust_remote_code` antes de escalar a modelos mayores de la misma familia.
- Reproducibilidad y procedencia: el repositorio incluye `provenance.json` con el contrato de ejecución y el hash sha256 del checkpoint fuente, lo que permite reproducir y auditar el entrenamiento en entornos de investigación.
- Fine-tuning ligero como base didáctica: por su tamaño, puede ajustarse en una sola GPU consumer para enseñar flujos de entrenamiento supervisado o LoRA sobre un modelo base real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las puntuaciones zero-shot aún no se han medido. El único dato de evaluación publicado es la pérdida de validación sobre el canon retenido (phase-1-release canon-8192, 8192 × 2048 tokens): 2,7232 nats por token, reproducible bit a bit con los pesos del repositorio bajo PyTorch SDPA (el entrenamiento usó FlashAttention-4).

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 59,48M de parámetros ocupan aproximadamente 0,12 GB de pesos; con overhead de activaciones y caché KV para 2048 tokens, el consumo real es del orden de unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU con soporte bf16; el entrenamiento se realizó en una NVIDIA GH200 de 120 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `dtype=torch.bfloat16` es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la atención XSA y el código de modelado propio pueden requerir adaptaciones para estos motores.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-59m-2.18bt-base-cooled | 59,48M totales (27,28M no-embedding) | 2048 | Apache-2.0 | Base, XSA, 2,18B tokens, multilingüe celta |
| SmolLM-135M | 135M | 2048 | Apache-2.0 | Base de Hugging Face, inglés, mayor tamaño |
| Pythia-70M | 70M | 2048 | Apache-2.0 | Base de EleutherAI, inglés, suite de escalado |
| GPT-2 small | 124M | 1024 | MIT | Base histórico, inglés, contexto menor |

La comparación con SmolLM-135M, Pythia-70M y GPT-2 small se ofrece como referencia de categoría (modelos base de menos de 150M parámetros); no se dispone de resultados de benchmarks de este modelo para comparar rendimiento de forma directa.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escalado, no un asistente: afirmará cosas falsas con fluidez y no sigue instrucciones.
- Sin ajuste de seguridad ni filtrado de salidas; puede generar contenido inapropiado o dañino.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Idiomas mayoritariamente inglés, con las lenguas celtas en proporciones menores; la calidad en estas últimas no está evaluada.
- No se han medido benchmarks zero-shot, por lo que no hay evidencia pública de su rendimiento en tareas estándar.
- Requiere `trust_remote_code=True` para cargar `modeling_vectabass.py`; conviene auditar ese código antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está pensado ni validado para ello.
- Riesgo de sesgos derivado de los datos de entrenamiento (corpus del sector público británico y web abierta), no documentado por el autor.
- No se documentan cuantizaciones oficiales; usar formatos distintos de bf16 puede degradar la reproducibilidad bit a bit de los logits.

## Enlaces

- Hugging Face: https://huggingface.co/VectaBass/vectabass-59m-2.18bt-base-cooled
- Referencia del recurso Isambard-AI (paper citado en la model card): https://doi.org/10.48550/arXiv.2410.11199
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper del modelo: no disponible (anunciado como "forthcoming")
- Repositorio de código: no disponible
- Demo: no disponible
