# VectaBass/vectabass-1.03b-26.5bt-base-cooled

## Resumen

vectabass-1.03b-26.5bt-base-cooled es un modelo de lenguaje base de 1.028.812.800 parametros totales (919.351.296 no pertenecientes a embeddings) desarrollado por VectaBass. Se trata de una celda concreta, la etiquetada como N5-D5, dentro de lo que el autor denomina "Phase 1 AR square": una escalera de modelos que va de 100M a 1.6B de parametros no-embedding, cada tamano entrenado con varios presupuestos de tokens y publicados en conjunto para poder verificar empiricamente las leyes de escala. Este checkpoint concreto corresponde a un entrenamiento de 26.464.944.128 tokens, es decir, 29 tokens por parametro no-embedding.

La arquitectura es de tipo transformer causal con atención de grupo (GQA 2:1) y una innovación propia llamada exclusive self-attention (XSA), que no existe en Llama. El modelo usa SwiGLU en la capa feed-forward, RMSNorm en pre-norm, RoPE con base 10000 y una longitud de contexto de 2048 tokens. El vocabulario es GPT-2 BPE ampliado con 26 tokens especiales hasta 50304 filas. El entrenamiento se realizo sobre 4 x NVIDIA GH200 de 120 GB en el cluster Isambard-AI, con el optimizador Muon para matrices ocultas combinado con AdamW en fp32.

El interes del modelo es fundamentalmente cientifico y de investigacion: es un base model sin instruction tuning ni safety tuning, pensado para estudiar el comportamiento de las leyes de escala y como pieza de un conjunto mayor. No esta disenado como asistente. Su relevancia actual radica en que forma parte de una iniciativa de "UK sovereign AI" con datos de dominio publico del Reino Unido y lenguas celtas, lo que lo hace util para experimentos de escalado reproducible y para investigacion sobre modelado de lenguas minoritarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama con exclusive self-attention (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE |
| Parametros totales | 1.028.812.800 (embeddings atados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el autor recomienda ejecutar en bf16, tal como se entreno) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (ingles, gales, gaélico escoces, irlandes, manes, cornes y escoces) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con codigo de modelado personalizado `modeling_vectabass.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 18 capas y una anchura de 2176. La atencion es causal con 34 cabezas de query y 17 de key-value (dimension 64 por cabeza), lo que da una relacion GQA 2:1. La innovacion principal es la exclusive self-attention (XSA), una variante de atencion propia que no esta presente en Llama y que requiere cargar codigo remoto (`trust_remote_code=True`) para instanciar el modelo. La capa feed-forward usa SwiGLU con dimension intermedia 5648. Las posiciones se codifican con RoPE (base 10000) y la normalizacion es RMSNorm en configuracion pre-norm. El vocabulario tiene 50304 filas: GPT-2 BPE (50257 tokens) mas 26 tokens especiales y el resto padding.

El entrenamiento consumio 26.464.944.128 tokens con un batch de 458.752 tokens. Se uso el optimizador Muon para las matrices ocultas (con NS 5, Moonlight RMS 0.2 y momentum 0.95) combinado con AdamW en fp32 (betas 0.9 y 0.95). El pico de learning rate fue 0.00125, con un warmup de 437M tokens, una fase constante y un cooldown 1-sqrt hasta cero en el ultimo 20% del entrenamiento. El weight decay fue 0.0507 sobre matrices. La precision de entrenamiento fue bf16 en pesos y activaciones, con pesos maestros en fp32 en el optimizador y estadisticos de normalizacion, angulos RoPE y logits en fp32. El hardware fueron 4 x NVIDIA GH200 de 120 GB. Los datos provienen de una vista de "phase-1-release" con 47 bins de texto con licencia abierta (unos 96B tokens unicos), incluyendo fuentes del sector publico britanico, parlamentarias y de lenguas celtas; los datasets declarados son FineWeb-Edu, FineWeb-2 y FineMath.

## Capacidades

- Generacion de texto autoregresiva en ingles y, en menor medida, en gales, gaélico escoces, irlandes, manes, cornes y escoces.
- Modelado de lenguaje base: continuacion de texto, completado de secuencias y puntuacion de perplejidad.
- Capacidad de razonamiento y conocimiento factual limitada, propia de un modelo de 1B sin instruction tuning.
- No soporta tool calling ni function calling de forma nativa (no hay entrenamiento para ello).
- No esta entrenado para agentes ni para razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Multilingue limitado a las siete lenguas listadas, con el ingles como idioma dominante.

## Casos de uso

- Investigacion sobre leyes de escala: el modelo es una celda de una escalera de tamanos y presupuestos de tokens; se usa para ajustar y validar curvas de escalado comparando la perdida de validacion entre celdas.
- Reproducibilidad de entrenamiento: sirve como referencia para verificar que el codigo de entrenamiento y los pesos publicados producen los mismos logits (el autor indica reproduccion bit a bit con los logits del codigo de entrenamiento).
- Modelado de lenguas celtas: permite experimentos de continuacion de texto y evaluacion de perplejidad en gales, gaélico escoces, irlandes, manes, cornes y escoces, un nicho poco cubierto por modelos abiertos.
- Fine-tuning supervisado para tareas concretas: al ser un base model con licencia Apache 2.0, se puede adaptar con SFT o LoRA para clasificacion, extraccion o generacion de dominio especifico.
- Generacion de texto de dominio publico britanico: util para tareas de completado sobre corpus parlamentarios y del sector publico, dado el sesgo del dataset hacia esas fuentes.
- Baseline en experimentos de eficiencia: su tamano (1B) y contexto (2048) lo hacen manejable para comparar tecnicas de atencion, cuantizacion o decodificacion en entornos de investigacion.
- Estudio de XSA: permite analizar el comportamiento de la exclusive self-attention frente a atencion estandar en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks zero-shot en la informacion disponible. El unico dato de evaluacion publicado es la perdida de validacion sobre el canon retenido del autor (phase-1-release canon-8192, 8192 x 2048 tokens): **1.9688 nats por token**. El autor indica que los pesos de este repositorio reproducen los logits del codigo de entrenamiento de forma bit a bit y obtienen 1.9689 bajo PyTorch SDPA (el entrenamiento uso FlashAttention-4).

| Metrica | Valor |
|---|---|
| Perdida de validacion (canon-8192) | 1.9688 nats/token |
| Perdida con PyTorch SDPA | 1.9689 nats/token |
| Benchmarks zero-shot | no medidos |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,1 GB solo para pesos (1.028.812.800 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, unos 3-4 GB con contexto completo de 2048 tokens.
- VRAM estimada en fp32: unos 4,1 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en bf16; para entrenamiento o fine-tuning se recomienda A100, H100 o GH200 (el autor entreno con 4 x GH200 de 120 GB).
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: transformers con `trust_remote_code=True` (metodo oficial), y en principio vLLM, TGI o llama.cpp si se genera una conversion compatible, aunque el codigo personalizado de XSA puede requerir adaptaciones; no hay confirmacion en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-1.03b-26.5bt-base-cooled | 1.028M totales (919M no-embedding) | 2048 | Apache 2.0 | Base model con XSA, enfocado a leyes de escala y lenguas celtas |
| Llama 3.2 1B | 1.240M | 128K | Llama 3.2 Community License | Base e instruct, contexto mucho mayor, sin lenguas celtas especificas |
| Qwen2.5 1.5B | 1.540M | 32K | Apache 2.0 | Base e instruct, multilingue amplio, con benchmarks publicados |
| SmolLM2 1.7B | 1.700M | 8K | Apache 2.0 | Base e instruct, orientado a eficiencia en dispositivo |

La comparacion directa es dificil porque vectabass no publica benchmarks zero-shot. Frente a Llama 3.2 1B, Qwen2.5 1.5B y SmolLM2 1.7B, la diferencia principal es el contexto (2048 frente a 8K-128K) y la ausencia de instruction tuning. Su ventaja es la licencia Apache 2.0 pura, el enfoque en lenguas celtas y su papel como pieza de un estudio de escalado reproducible.

## Limitaciones y advertencias

- Es un base model sin instruction tuning ni safety tuning: no debe usarse como asistente y producira afirmaciones falsas con fluidez.
- No hay filtrado de salidas ni alineacion de seguridad.
- Contexto limitado a 2048 tokens, muy por debajo de los modelos contemporaneos.
- Predominio del ingles; las lenguas celtas tienen participaciones menores y su calidad es probablemente inferior.
- Riesgo alto de alucinacion en tareas factuales.
- Requiere `trust_remote_code=True` para cargar el codigo personalizado de XSA, lo que implica ejecutar codigo del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado para produccion como asistente.
- Sin benchmarks zero-shot publicados, no es posible evaluar su calidad relativa frente a alternativas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/VectaBass/vectabass-1.03b-26.5bt-base-cooled
- Paper de Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
