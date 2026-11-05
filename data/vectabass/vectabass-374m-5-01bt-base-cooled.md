# VectaBass/vectabass-374m-5.01bt-base-cooled

## Resumen

vectabass-374m-5.01bt-base-cooled es un modelo de lenguaje base de 374 millones de parametros totales (303,1 millones sin contar embeddings) desarrollado por VectaBass, un proyecto orientado a la investigacion de leyes de escala y a la soberania tecnologica del Reino Unido en IA. Se trata de la celda N3-D3 de la "AR square", una retícula experimental de modelos que va desde 100M hasta 1.600M de parametros no-embedding, cada tamano entrenado con varios presupuestos de tokens y publicado conjuntamente para poder verificar empiricamente la ley de escala.

El modelo emplea una arquitectura tipo transformer decoder-only de estilo Llama, pero con una innovacion: atencion propia exclusiva (XSA, exclusive self-attention), que Llama no incorpora. Usa GQA con proporcion 2:1, SwiGLU, RMSNorm pre-norm y RoPE con base 10000 y contexto de 2048 tokens. El vocabulario es GPT-2 BPE ampliado con 26 tokens especiales (50.304 filas en total).

Es relevante ahora porque forma parte de una release coordinada que permite a investigadores validar leyes de escala con puntos de control reales, y porque incorpora datos de fuentes parlamentarias y del sector publico britanico, ademas de lenguas celtas (gales, gaélico escoces, irlandes, manes, cornualles) y escoces, lo que lo convierte en una pieza poco habitual para el estudio de modelos multilingues de bajo recurso. Es un modelo base, sin ajuste por instrucciones ni por seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con atencion propia exclusiva (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE base 10000 |
| Parametros totales | 373.942.272 (embeddings atados) |
| Parametros activos | no aplica (no es MoE) |
| Parametros sin embedding | 303.114.240 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `trust_remote_code` para `modeling_vectabass.py`) |
| Anchura / capas | 1408 / 13 |
| Cabeceras | 22 query, 11 key-value, dimension 64 |
| Feed-forward | SwiGLU, 4112 |
| Vocabulario | 50.304 filas: GPT-2 BPE (50.257) + 26 tokens especiales + padding |
| Tamano del repo | 0,7 GB |

## Arquitectura y entrenamiento

La red es un transformer decoder-only con atencion causal que combina GQA (22 cabeceras de query y 11 de key-value, dimension 64) con atencion propia exclusiva (XSA), un mecanismo que no existe en Llama y que obliga a cargar codigo remoto (`modeling_vectabass.py`) para instanciar el modelo. La anchura es 1408, con 13 capas, feed-forward SwiGLU de dimension 4112, normalizacion RMSNorm pre-norm y posiciones RoPE con base 10000 limitadas a 2048 tokens de contexto.

El entrenamiento consumio 5.014.159.360 tokens (17 por parametro no-embedding), con un batch de 327.680 tokens. El optimizador es Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) combinado con AdamW en fp32 (betas 0.9 y 0.95). El pico de learning rate fue 0.00174, con warmup de 190M tokens, fase constante y un cooldown 1-sqrt hasta cero en el ultimo 20% del entrenamiento. El weight decay fue 0.0691 sobre matrices. Se entreno en bf16 (pesos y activaciones) con pesos maestros en fp32 en el optimizador, estadisticas de norma, angulos RoPE y logits en fp32, sobre una unica NVIDIA GH200 de 120 GB.

Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96B tokens unicos, con fuentes del sector publico y parlamentario britanico y de lenguas celtas. Las fuentes declaradas son FineWeb-Edu, FineWeb-2 y FineMath. El autor publica el detalle de cada bin, su cuota y su licencia en `DATA.md`.

## Capacidades

- Generacion de texto autoregresiva en modo base (completado de texto, no dialogo).
- Razonamiento de siguiente token y modelado de lenguaje; util para investigacion de leyes de escala.
- Capacidades multilingues limitadas: ingles dominante y cuotas menores de gales, gaélico escoces, irlandes, manes, cornualles y escoces.
- Manejo de texto con terminologia parlamentaria y del sector publico britanico por la composicion del corpus.
- Capacidad matematica basica por la inclusion de FineMath en el entrenamiento.
- No soporta tool calling ni function calling de forma nativa (modelo base sin ajuste).
- No soporta agentes ni razonamiento multi-paso de forma fiable (sin RLHF ni instruction tuning).
- No dispone de modo thinking, vision ni audio.
- No hay filtrado de salidas ni alineamiento de seguridad.

## Casos de uso

- Investigacion de leyes de escala: el modelo es una celda de una reticula experimental; se usa para medir la relacion entre perdida de validacion y presupuesto de computo/tokens y contrastar predicciones teoricas con puntos de control reales.
- Estudio de atencion propia exclusiva (XSA): al ser una variante arquitectonica poco comun, sirve para comparar su comportamiento frente a atencion estandar en tareas controladas con el mismo corpus.
- Modelado de lenguas celtas de bajo recurso: con cuotas de gales, gaélico escoces, irlandes, manes y cornualles, permite evaluar tecnicas de adaptacion y transferencia en idiomas con pocos datos.
- Procesamiento de texto parlamentario y del sector publico britanico: el corpus incluye fuentes parlamentarias, por lo que el modelo puede completar y clasificar texto de ese dominio en tareas de investigacion.
- Punto de partida para fine-tuning: al ser un modelo base pequeno (374M) con licencia Apache 2.0, es adecuado como inicializacion para ajustes supervisados en tareas concretas dentro de un presupuesto de GPU consumer.
- Reproducibilidad de entrenamiento: los pesos reproducen los logits del codigo de entrenamiento de forma bit a bit, lo que permite validar pipelines de entrenamiento e inferencia (SDPA frente a FlashAttention-4).
- Evaluacion de tecnicas de cuantizacion y despliegue: por su tamano reducido, sirve como banco de pruebas para medir el impacto de la cuantizacion en la perplejidad y en tareas zero-shot.

## Benchmarks y rendimiento

Evaluacion zero-shot con 500 elementos por tarea (barajado con semilla 0, protocolo hub-v1). Las tareas de eleccion multiple puntuan log P(continuacion | contexto) con precision normalizada donde aplica.

| Tarea | Resultado |
|---|---|
| ARC-Easy | 0.514 |
| ARC-Challenge | 0.238 |
| HellaSwag | 0.328 |
| PIQA | 0.630 |
| WinoGrande | 0.478 |
| BoolQ | 0.586 |
| MMLU | 0.234 |
| LAMBADA | 0.318 |
| DQRB (propia) | 0.561 |
| LAMBADA bits per byte | 1.294 |

Perdida de validacion en el canon retenido (phase-1-release canon-8192, 8192 x 2048 tokens): 2,2782 nats por token. Los pesos del repositorio reproducen los logits del codigo de entrenamiento de forma bit a bit y puntuan 2,2783 bajo PyTorch SDPA (el entrenamiento uso FlashAttention-4).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,75 GB de pesos mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 4 GB o mas.
- VRAM estimada en fp32: aproximadamente 1,5 GB de pesos.
- GPU recomendadas: cualquier GPU moderna con soporte bf16 (RTX 3060 en adelante, A10, L4, A100, H100, GH200). El entrenamiento se realizo en una unica NVIDIA GH200 de 120 GB, pero la inferencia no requiere ese hardware.
- Cabe holgadamente en GPU consumer: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, e incluso en GPUs integradas o CPU con suficiente RAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por la atencion XSA); no se documentan soportes oficiales en vLLM, llama.cpp, Ollama o TGI, y la atencion XSA puede requerir adaptaciones en esos motores.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota: al no publicarse variantes GGUF ni cuantizadas, el despliegue en llama.cpp u Ollama requeriria conversion manual y posiblemente implementacion del mecanismo XSA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-374m-5.01bt-base-cooled | 374M (303M sin embedding) | 2048 | Apache 2.0 | Base, XSA, multilingue celta, sin benchmarks publicos comparables en la informacion |
| Pythia-410M | 410M | 2048 | Apache 2.0 | Base, transformer estandar, corpus The Pile, ampliamente usado en estudios de escala |
| GPT-2 small | 124M | 1024 | MIT | Base, referencia historica, solo ingles |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | Base/chat, mayor tamano, mas tokens de entrenamiento |

La comparacion de rendimiento con estas alternativas no esta disponible en la informacion proporcionada; el autor no publica una tabla comparativa frente a modelos de la misma categoria. La diferencia principal de vectabass-374m es su inclusion de lenguas celtas y su pertenencia a una reticula de escala coordinada.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de leyes de escala, no un asistente: afirmara cosas falsas con fluidez y no esta disenado para uso conversacional.
- Sin ajuste por instrucciones ni por seguridad, y sin filtrado de salidas; no debe desplegarse en produccion orientada a usuarios sin capas adicionales.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Predominio del ingles; las lenguas celtas y el escoces tienen cuotas menores y su calidad sera previsiblemente inferior.
- Riesgo elevado de alucinacion por el bajo rendimiento en tareas de conocimiento (MMLU 0.234, ARC-Challenge 0.238).
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta preparado para ello sin fine-tuning y evaluacion adicionales.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo en entornos sensibles.
- No se documentan sesgos especificos, pero el corpus incluye fuentes del sector publico britanico que pueden introducir sesgos institucionales y linguisticos.
- El modelo no ha sido evaluado en benchmarks estandar de seguridad ni de sesgo en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-374m-5.01bt-base-cooled
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Referencia Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Paper: pendiente de publicacion segun el autor; hasta entonces, citar el repositorio.
