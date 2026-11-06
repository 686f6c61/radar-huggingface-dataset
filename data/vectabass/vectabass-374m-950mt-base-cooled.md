# VectaBass/vectabass-374m-950mt-base-cooled

## Resumen

vectabass-374m-950mt-base-cooled es un modelo de lenguaje base de 374 millones de parámetros (303,1 millones no-embedding) desarrollado por VectaBass, entrenado sobre 950 millones de tokens. Forma parte de la "Phase 1 AR square", una escalera de modelos de 100M a 1,6B de parámetros no-embedding, cada uno entrenado con varios presupuestos de tokens y publicados conjuntamente para permitir la verificación de leyes de escalado (scaling laws). Este checkpoint concreto corresponde a la celda **N3-D1** del experimento, con una ratio de 3 tokens por parámetro no-embedding.

El modelo emplea una arquitectura tipo Llama con atención causal, GQA 2:1 y una innovación denominada XSA (exclusive self-attention), que requiere `trust_remote_code` para cargarse. Está orientado explícitamente a la investigación sobre escalado y a la soberanía de IA del Reino Unido, con un dataset que incluye fuentes parlamentarias y del sector público británico, así como lenguas celtas (galés, gaélico escocés, irlandés, manés, córnel y escocés).

Es relevante ahora porque se publica como parte de un conjunto reproducible de modelos con contrato de ejecución, hashes de checkpoint y protocolo de evaluación documentado, lo que facilita la validación independiente de leyes de escalado. No es un modelo para uso como asistente: es un base model sin ajuste de instrucciones ni de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama con atención causal, GQA 2:1 y XSA (exclusive self-attention) |
| Parametros totales | 373.980.288 (373,9M; embeddings atados) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (entrenado y publicado en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, cy (galés), gd (gaélico escocés), ga (irlandés), gv (manés), kw (córnico), sco (escocés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con `modeling_vectabass.py` (custom code) |

## Arquitectura y entrenamiento

El modelo es un transformer denso tipo Llama con 13 capas, anchura 1408, 22 cabezas de consulta y 11 de clave-valor (dimensión 64, GQA 2:1), feed-forward SwiGLU de 4112, normalización RMSNorm pre-norm y posiciones RoPE con base 10000 y contexto de 2048 tokens. La innovación arquitectónica destacable es la **exclusive self-attention (XSA)**, que Llama no incorpora y que obliga a cargar código personalizado del repositorio. El vocabulario tiene 50.304 filas: BPE de GPT-2 (50.257) más 26 tokens especiales y el resto padding.

El entrenamiento usó 950.272.000 tokens (3 por parámetro no-embedding), con batch de 327.680 tokens, optimizador Muon (matrices ocultas, NS 5, Moonlight RMS 0,2, momentum 0,95) combinado con AdamW fp32 (0,9, 0,95), LR pico de 0,00174, warmup de 190M tokens y un schedule de warmup, constante y cooldown 1-sqrt hasta cero en el último 20%. Se entrenó en bf16 con pesos maestros fp32, estadísticas de norma, ángulos RoPE y logits en fp32, sobre **1 x NVIDIA GH200 120GB**. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta (~96B tokens únicos), incluyendo FineWeb-Edu, FineWeb-2 y FineMath, con fuentes del sector público y parlamentarias del Reino Unido y de lenguas celtas.

## Capacidades

- Generación de texto autoregresiva en modo base (completado de secuencias, no diálogo).
- Modelado de lenguaje y cálculo de perplejidad/loss para investigación en scaling laws.
- Evaluación zero-shot en tareas de elección múltiple mediante puntuación de log-probabilidades.
- Cobertura multilingüe limitada: inglés dominante y presencia menor de galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni razonamiento multi-paso entrenado.
- No dispone de visión, audio ni modo thinking.
- No está ajustado a instrucciones ni a seguridad.

## Casos de uso

- **Investigación en leyes de escalado**: el modelo es una celda de una escalera de tamaños y presupuestos de tokens; se usa para ajustar y validar curvas de loss frente a parámetros y tokens, comparando con las demás celdas de la Phase 1 AR square.
- **Reproducibilidad de experimentos**: al reproducir los logits del código de entrenamiento de forma bit a bit y publicar contrato de ejecución y hash del checkpoint, sirve como referencia para verificar pipelines de entrenamiento propios.
- **Evaluación de arquitecturas con XSA**: permite estudiar el efecto de la exclusive self-attention frente a atención estándar en modelos pequeños, aislando la variable arquitectónica dentro de la misma familia.
- **Modelado de lenguas celtas a pequeña escala**: útil para experimentos de tokenización y cobertura en galés, gaélico escocés, irlandés, manés, córnico y escocés, aunque con calidad limitada por el escaso presupuesto de tokens.
- **Prototipado de pipelines de inferencia**: su tamaño reducido (0,7 GB en el repositorio) permite probar integraciones con transformers, SDPA y entornos con `trust_remote_code` antes de escalar a modelos mayores de la misma familia.
- **Generación de texto de dominio público británico**: puede emplearse para estudiar el comportamiento del modelo sobre texto parlamentario y del sector público incluido en el dataset, siempre con revisión humana por su tendencia a afirmar falsedades con fluidez.

## Benchmarks y rendimiento

Evaluación zero-shot, 500 ítems por tarea (shuffle con semilla 0), protocolo hub-v1. Puntuación por log P(continuación | contexto), accuracy normalizada donde aplica.

| Tarea | Resultado |
|---|---|
| ARC-Easy | 0,446 |
| ARC-Challenge | 0,222 |
| HellaSwag | 0,274 |
| PIQA | 0,598 |
| WinoGrande | 0,518 |
| BoolQ | 0,604 |
| MMLU | 0,246 |
| LAMBADA | 0,274 |
| DQRB (propia) | 0,531 |
| LAMBADA bits per byte | 1,384 |

Loss de validación sobre el canon retenido (phase-1-release canon-8192, 8192 x 2048 tokens): **2,5690 nats por token**. No se proporcionan comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,75 GB para pesos (373,9M parámetros x 2 bytes), más overhead de activaciones y caché KV para 2048 tokens; en la práctica cabe holgadamente en menos de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el entrenamiento se realizó en 1 x NVIDIA GH200 120GB, pero la inferencia no requiere hardware de ese calibre.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `dtype=torch.bfloat16` (requerido por el código personalizado); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la dependencia de `modeling_vectabass.py` puede complicar su uso en runtimes que no ejecuten código remoto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con modelos de la misma categoría en la información proporcionada. Como referencia estructural, los modelos de ~300-400M parámetros de la familia Llama-like (por ejemplo, variantes pequeñas de Llama o Qwen) comparten orden de magnitud, pero no se aportan datos de rendimiento comparables para este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-374m-950mt-base-cooled | 373,9M (303,1M no-embedding) | 2048 | Apache 2.0 | XSA, base, sin instrucciones |
| Alternativas comparables | No disponible | No disponible | No disponible | No se aportan datos en la información disponible |

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escalado, no un asistente: afirmará falsedades con fluidez y no debe usarse en producción orientada a usuario sin ajuste y filtrado.
- Contexto limitado a 2048 tokens.
- Predominantemente inglés, con presencia menor de lenguas celtas; la calidad en estas últimas es limitada por el reducido presupuesto de tokens.
- Sin ajuste de seguridad ni filtrado de salidas; puede generar contenido inapropiado o sesgado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de desplegarlo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para ello.
- Riesgo de alucinación elevado por el bajo presupuesto de entrenamiento (3 tokens por parámetro no-embedding).
- No se documentan cuantizaciones oficiales; usar bf16 como se entrenó para reproducir los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/VectaBass/vectabass-374m-950mt-base-cooled
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Referencia Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
