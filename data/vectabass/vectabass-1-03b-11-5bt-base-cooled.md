# VectaBass/vectabass-1.03b-11.5bt-base-cooled

## Resumen

vectabass-1.03b-11.5bt-base-cooled es un modelo de lenguaje base de 1.028 millones de parámetros totales (919,4 millones sin contar embeddings) desarrollado por VectaBass, un proyecto orientado a la investigación de leyes de escalado y a la soberanía de IA del Reino Unido. Forma parte de la "Phase 1 AR square", una escalera de modelos que va de 100M a 1.6B de parámetros no-embedding, cada uno entrenado con distintos presupuestos de tokens y publicados conjuntamente para poder verificar empíricamente la ley de escalado. Este checkpoint concreto corresponde a la celda N5-D4 y fue entrenado con 11.520 millones de tokens (13 tokens por parámetro no-embedding).

La arquitectura es de tipo transformer decoder-only con una variante propia: atención causal con GQA 2:1 y "exclusive self-attention" (XSA), una modificación que Llama no incorpora y que exige cargar `modeling_vectabass.py` mediante `trust_remote_code`. El modelo tiene 18 capas, anchura 2176, feed-forward SwiGLU de 5648, RMSNorm pre-norm y RoPE con base 10000. El contexto es de solo 2048 tokens, lo que lo sitúa muy por debajo de los estándares actuales.

Es relevante ahora porque se publica como parte de un conjunto reproducible de estudios de escalado, con contrato de ejecución, hash del checkpoint y procedencia documentada, y porque incluye fuentes parlamentarias del Reino Unido y lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) además del inglés y el escocés. No es un modelo para uso como asistente: es un artefacto de investigación sin ajuste por instrucciones ni por seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, Llama-like con exclusive self-attention (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE |
| Parametros totales | 1.028.812.800 (embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Parametros no-embedding | 919.351.296 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (el autor indica ejecutar en bf16 tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (inglés mayoritario; galés, gaélico escocés, irlandés, manés, córnico y escocés en proporciones menores) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,1 GB), requiere `trust_remote_code=True` |
| Vocabulario | 50304 filas: GPT-2 BPE (50257) + 26 tokens especiales + padding |
| Anchura / capas | 2176 / 18 |
| Cabezas | 34 query, 17 key-value, dimensión 64 |
| Feed-forward | SwiGLU, 5648 |
| Tokens de entrenamiento | 11.519.721.472 (13 por parámetro no-embedding) |
| Hardware de entrenamiento | 4 x NVIDIA GH200 120GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 18 capas con atención causal, GQA con ratio 2:1 (34 cabezas query frente a 17 key-value de dimensión 64) y una innovación propia denominada exclusive self-attention (XSA), que no está presente en Llama y obliga a usar el código de modelado del repositorio. Emplea SwiGLU en el feed-forward (dimensión 5648), RMSNorm en pre-norm y RoPE con base 10000 limitado a 2048 posiciones. Los embeddings están atados y el vocabulario parte del tokenizador GPT-2 BPE ampliado con 26 tokens especiales.

El entrenamiento consumió 11.519.721.472 tokens con un batch de 458.752 tokens. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) con AdamW en fp32 (betas 0.9 y 0.95), pico de learning rate de 0.00125, warmup de 437M tokens, fase constante y un cooldown 1-sqrt hasta cero en el último 20% del entrenamiento. El weight decay es de 0.0507 sobre matrices. Se entrenó en bf16 con pesos maestros en fp32, estadísticas de normalización, ángulos RoPE y logits en fp32, sobre 4 x NVIDIA GH200 de 120 GB. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta (unos 96B tokens únicos) procedentes de FineWeb-Edu, FineWeb-2 y FineMath, con fuentes del sector público y parlamentario del Reino Unido y de lenguas celtas; el desglose por bin, proporción y licencia está en `DATA.md`.

## Capacidades

- Generación de texto autoregresiva en modo base: completado de texto, continuación de documentos y modelado de lenguaje puro.
- Capacidades multilingües limitadas: inglés dominante y presencia menor de galés, gaélico escocés, irlandés, manés, córnico y escocés.
- Conocimiento de dominio público británico y parlamentario por la composición del corpus de entrenamiento.
- Razonamiento matemático básico por la inclusión de FineMath en el dataset, sin evaluación publicada al respecto.
- No dispone de tool calling ni function calling: es un modelo base sin ajuste por instrucciones.
- No dispone de modo de razonamiento multi-paso, agentes ni thinking mode.
- No tiene capacidades de visión ni audio.
- No está ajustado por instrucciones ni por seguridad; no sigue instrucciones de forma fiable.

## Casos de uso

- Investigación sobre leyes de escalado: el modelo es una celda de una escalera de tamaños y presupuestos de tokens; se usa para medir la pérdida de validación frente a parámetros y tokens y contrastar la ley empírica con la predicción teórica.
- Reproducibilidad de experimentos: al publicarse con contrato de ejecución (`ar-square--N5-D4`, revisión `0560cc888762`), hash sha256 del checkpoint y `provenance.json`, sirve para replicar el entrenamiento y verificar que los logits coinciden bit a bit con el código de entrenamiento.
- Estudio de atención XSA: al ser una variante arquitectónica frente a Llama, permite comparar el comportamiento de exclusive self-attention con atención estándar en igualdad de tamaño y datos.
- Modelado de lenguas celtas de bajos recursos: con galés, gaélico escocés, irlandés, manés, córnico y escocés en el corpus, puede emplearse como línea base para experimentos de adaptación o evaluación en estas lenguas, siempre con validación humana.
- Análisis de corpus del sector público británico: útil para estudiar qué conocimiento factual y estilístico adquiere un modelo pequeño expuesto a fuentes parlamentarias y administrativas del Reino Unido.
- Punto de partida para fine-tuning supervisado: al ser un base de 1.000M con licencia Apache 2.0, puede servir como inicialización para tareas downstream específicas antes de recurrir a modelos mayores.
- Generación de texto controlada en entornos de investigación: con contexto de 2048 tokens encaja en tareas de continuación de documentos cortos donde no se requiere instrucción ni diálogo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Pérdida de validación (canon-8192, 8192 x 2048 tokens) | 2,0563 nats por token |
| Pérdida de validación con los pesos del repo (PyTorch SDPA) | 2,0559 nats por token |
| Benchmarks zero-shot (MMLU, HumanEval, GSM8K, etc.) | No medidos todavía |

El autor indica explícitamente que las puntuaciones zero-shot de benchmarks no se han medido. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 2,1 GB de pesos más memoria de activaciones y caché KV; con contexto de 2048 y 18 capas es manejable en GPUs de consumo.
- Cabe en GPUs de consumo: sí, en tarjetas con 6-8 GB o más en bf16 (RTX 3060, 4060, 4070, etc.); en fp16 también es viable.
- GPU recomendadas para entrenamiento o evaluación a gran escala: NVIDIA GH200 de 120 GB, tal como se entrenó; para inferencia basta una GPU moderna de gama media.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `dtype=torch.bfloat16`; al requerir `modeling_vectabass.py` propio, no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI sin conversión previa. El autor solo documenta la ruta de transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-1.03b-11.5bt-base-cooled | 1.028M totales (919M no-embedding) | 2048 | Apache 2.0 | Base, XSA, sin benchmarks zero-shot, requiere código propio |
| Llama 3.2 1B | 1.240M | 128K | Llama 3.2 Community License | Base e instruct, ampliamente soportado por vLLM y llama.cpp |
| Qwen2.5-1.5B | 1.540M | 32K | Apache 2.0 | Base e instruct, buen rendimiento en código y matemáticas |
| SmolLM2-1.7B | 1.700M | 8K | Apache 2.0 | Base e instruct, orientado a despliegue ligero |

La comparación es orientativa: vectabass-1.03b no publica métricas zero-shot, de modo que no puede contrastarse su rendimiento frente a estas alternativas. Su ventaja diferencial es la trazabilidad experimental y la cobertura de lenguas celtas, no el rendimiento absoluto.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escalado, no un asistente: afirmará cosas falsas con fluidez y no seguirá instrucciones de forma fiable.
- Contexto de solo 2048 tokens, muy inferior al de los modelos contemporáneos de su tamaño.
- Predominio del inglés; las lenguas celtas aparecen en proporciones menores y sin evaluación publicada de su calidad.
- Sin ajuste por seguridad ni filtrado de salidas: puede generar contenido sesgado, tóxico o dañino.
- Riesgo elevado de alucinación factual por tratarse de un base sin RLHF ni DPO.
- Requiere `trust_remote_code=True` para cargar `modeling_vectabass.py`, lo que implica ejecutar código del repositorio; conviene auditar ese archivo antes de usarlo en producción.
- No se garantiza compatibilidad con runtimes de inferencia habituales (vLLM, llama.cpp, Ollama, TGI) sin trabajo de conversión.
- Licencia Apache 2.0: permite uso comercial, pero sin garantías del autor y con la obligación habitual de conservar avisos de licencia.
- Sin benchmarks zero-shot publicados, por lo que no hay evidencia de rendimiento en tareas downstream.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-1.03b-11.5bt-base-cooled
- Referencia de Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper: no disponible (anunciado como "forthcoming"; hasta entonces, citar el repositorio)
