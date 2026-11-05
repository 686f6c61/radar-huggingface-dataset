# VectaBass/vectabass-1.03b-60.8bt-base-cooled

## Resumen

vectabass-1.03b-60.8bt-base-cooled es un modelo de lenguaje base de 1.028.893.312 parametros totales (919.351.296 no pertenecientes a los embeddings, que estan atados) desarrollado por VectaBass. Forma parte de la "Phase 1 AR square", una escalera de modelos de 100M a 1.6B de parametros no-embedding, cada uno entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar empiricamente las leyes de escala. Esta celda concreta corresponde al contrato de ejecucion `ar-square--N5-D6` y fue entrenada con 60.800.237.568 tokens (66 tokens por parametro no-embedding).

La arquitectura es un transformer causal de tipo Llama con una modificacion propia: atencion exclusiva auto-atencional (XSA), que Llama no incorpora. Emplea GQA con proporcion 2:1, SwiGLU, RMSNorm pre-norm, RoPE con base 10000 y una ventana de contexto de 2048 tokens. El vocabulario es GPT-2 BPE (50257 tokens) mas 26 tokens especiales, hasta 50304 filas.

El modelo se presenta como una pieza de investigacion sobre escalado y como parte de una iniciativa de "IA soberana del Reino Unido" (`uk-sovereign-ai`), con enfasis en fuentes parlamentarias y del sector publico britanico, asi como en lenguas celtas (gales, gaélico escoces, irlandes, manes, cornualles) y escoces. Es un modelo base sin ajuste por instrucciones ni por seguridad, por lo que no esta pensado para uso como asistente en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama con atencion exclusiva auto-atencional (XSA) |
| Parametros totales | 1.028.812.800 (embeddings atados) |
| Parametros activos | No aplica (modelo denso) |
| Parametros no-embedding | 919.351.296 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (entrenado y publicado en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (mayoritario), gales (cy), gaélico escoces (gd), irlandes (ga), manes (gv), cornualles (kw), escoces (sco) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,1 GB), con codigo de modelado personalizado (`modeling_vectabass.py`) |
| Ancho / capas | 2176 / 18 |
| Cabeceras | 34 de consulta, 17 clave-valor, dimension 64 |
| Feed-forward | SwiGLU, dimension intermedia 5648 |
| Normalizacion | RMSNorm, pre-norm |
| Posiciones | RoPE, base 10000, contexto 2048 |
| Atencion | Causal, GQA 2:1, XSA |
| Vocabulario | 50304 filas: GPT-2 BPE (50257) + 26 tokens especiales + relleno |
| Precision de entrenamiento | bf16 en pesos y activaciones, fp32 en pesos maestros del optimizador; fp32 en estadisticos de norma, angulos RoPE y logits |

## Arquitectura y entrenamiento

El modelo sigue el esquema de un transformer causal denso con 18 capas, ancho 2176 y feed-forward SwiGLU de 5648. La innovacion arquitectonica destacable es la atencion exclusiva auto-atencional (XSA), que se suma a la atencion causal estandar con GQA 2:1 (34 cabeceras de consulta frente a 17 de clave-valor, de dimension 64). Las posiciones se codifican con RoPE de base 10000 y el contexto maximo es de 2048 tokens. La normalizacion es RMSNorm en configuracion pre-norm y los embeddings de entrada y salida estan atados.

El entrenamiento se realizo sobre 60.800.237.568 tokens (66 por parametro no-embedding) con un tamano de lote de 458.752 tokens. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momento 0.95) con AdamW en fp32 (betas 0.9 y 0.95), con un pico de learning rate de 0.00125, warmup de 437M tokens, fase constante y un cooldown 1-sqrt hasta cero en el ultimo 20% del entrenamiento. El weight decay aplicado a las matrices es de 0.0507. El hardware empleado fueron 4 GPU NVIDIA GH200 de 120 GB. Los datos provienen de la vista de la fase 1 de publicacion: 47 bins de texto con licencia abierta (unos 96B de tokens unicos), incluyendo fuentes del sector publico y parlamentario britanico y fuentes en lenguas celtas, con `HuggingFaceFW/fineweb-edu`, `HuggingFaceFW/fineweb-2` y `HuggingFaceTB/finemath` entre los conjuntos de datos declarados. No se menciona RLHF ni DPO: es un modelo puramente preentrenado.

## Capacidades

- Generacion de texto autoregresiva en ingles y, en menor medida, en gales, gaélico escoces, irlandes, manes, cornualles y escoces.
- Razonamiento basico y respuesta a preguntas de opcion multiple en modo zero-shot (evaluado en ARC, HellaSwag, PIQA, WinoGrande, BoolQ, MMLU y LAMBADA).
- Modelado de lenguaje y continuacion de texto con perplejidad medida (1.9003 nats por token en el canon de validacion).
- Capacidad limitada de calculo y matematicas por el sesgo del corpus (incluye `finemath`, aunque sin ajuste especifico).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- No esta ajustado por instrucciones ni por seguridad: no responde de forma fiable a formatos de chat.

## Casos de uso

- Investigacion sobre leyes de escala: este modelo es una celda concreta (N5-D6) de una escalera de modelos de 100M a 1.6B de parametros no-embedding entrenados con varios presupuestos de tokens; sirve para ajustar y validar curvas de escalado con datos reales.
- Reproducibilidad de experimentos: al publicarse junto al resto de la escalera y con contrato de ejecucion y `provenance.json`, permite replicar resultados y comparar perdidas de validacion entre configuraciones.
- Modelado de lenguaje para lenguas celtas y escoces: util para investigar el comportamiento de modelos pequenos en gales, gaélico escoces, irlandes, manes, cornualles y escoces, con datos procedentes de fuentes parlamentarias y del sector publico britanico.
- Generacion de texto base para fine-tuning posterior: al ser un modelo base de 1B de parametros con licencia Apache 2.0, es un punto de partida adecuado para ajuste supervisado en dominios concretos (legal, administrativo, linguistico) sin restricciones de uso comercial.
- Experimentos de destilacion y comparacion de arquitecturas: la incorporacion de XSA frente a atencion estandar permite estudiar el impacto de esta variante en la perdida de validacion y en las tareas zero-shot.
- Evaluacion de tecnicas de entrenamiento: el uso de Muon combinado con AdamW y el esquema de cooldown 1-sqrt hacen de este modelo un caso de estudio para analizar estabilidad y convergencia en modelos de ~1B de parametros.
- Prototipado de bajo coste en hardware consumer: con 1.028M de parametros y pesos en bf16 (unos 2 GB), puede ejecutarse en GPU de gama media para pruebas de continuacion de texto y analisis de perplejidad.

## Benchmarks y rendimiento

Evaluacion zero-shot con 500 elementos por tarea (barajado con semilla 0), protocolo hub-v1. Las tareas de opcion multiple puntuan log P(continuacion | contexto) con exactitud normalizada donde esta definida.

| Tarea | Puntuacion |
|---|---|
| ARC-Easy | 0.666 |
| ARC-Challenge | 0.330 |
| HellaSwag | 0.510 |
| PIQA | 0.694 |
| WinoGrande | 0.566 |
| BoolQ | 0.606 |
| MMLU | 0.302 |
| LAMBADA | 0.468 |
| DQRB (propia) | 0.620 |
| LAMBADA bits per byte | 1.173 |

Perdida de validacion en el canon retenido (phase-1-release canon-8192, 8192 x 2048 tokens): 1.9003 nats por token. Los pesos de este repositorio reproducen los logits del codigo de entrenamiento de forma bit a bit y obtienen 1.9004 bajo PyTorch SDPA (el entrenamiento uso FlashAttention-4).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,1 GB solo para pesos, mas memoria para activaciones y cache KV; en la practica, entre 3 y 4 GB para contexto completo de 2048 tokens.
- En cuantizacion de 8 bits: en torno a 1,1 GB de pesos; en 4 bits, en torno a 0,6 GB (no se publican variantes cuantizadas oficiales, por lo que habria que generarlas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; NVIDIA RTX 3060, RTX 4060, RTX 4090, A100, H100 o GH200 son suficientes. El modelo cabe holgadamente en GPU consumer.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido para cargar `modeling_vectabass.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la atencion XSA personalizada puede requerir portar el codigo a esos motores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-1.03b-60.8bt-base-cooled | 1.028M totales (919M no-embedding) | 2048 | Apache 2.0 | Base, XSA, enfoque en escalado y lenguas celtas |
| Modelos base de ~1B de la familia Llama (p. ej. Llama 3.2 1B) | ~1.240M | 128K (en la version instruct) | Licencia comunitaria Llama | No disponible comparacion de benchmarks en la informacion proporcionada |
| Modelos base de ~1B tipo Qwen2.5-1.5B | ~1.540M | 32K | Apache 2.0 | No disponible comparacion de benchmarks en la informacion proporcionada |
| Modelos base de ~1B tipo Gemma 2 2B | ~2.600M | 8K | Licencia Gemma | No disponible comparacion de benchmarks en la informacion proporcionada |

No se han publicado en la informacion disponible comparaciones directas de benchmarks con estos modelos; los datos de la tabla anterior sobre alternativas son orientativos y no proceden de la model card.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escalado, no un asistente: afirmara cosas falsas con fluidez y no sigue instrucciones de forma fiable.
- No tiene ajuste por seguridad ni filtrado de salidas; puede generar contenido inapropiado, sesgado u ofensivo.
- La ventana de contexto es de solo 2048 tokens, insuficiente para tareas de contexto largo.
- El idioma predominante es el ingles; las lenguas celtas y el escoces aparecen en proporciones menores y su calidad es limitada.
- Riesgo elevado de alucinacion por tratarse de un modelo preentrenado sin alineacion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta disenado para produccion sin un ajuste previo y evaluacion exhaustiva.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo.
- La atencion XSA no es estandar, por lo que la compatibilidad con motores de inferencia habituales (vLLM, llama.cpp, TGI) no esta garantizada.
- No se documentan sesgos especificos mas alla de los inherentes al corpus de texto abierto y a las fuentes del sector publico britanico.

## Enlaces

- HuggingFace: https://huggingface.co/VectaBass/vectabass-1.03b-60.8bt-base-cooled
- Referencia sobre Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Conjunto de datos FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Conjunto de datos FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Conjunto de datos FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
