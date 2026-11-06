# VectaBass/vectabass-232m-5.01bt-base-cooled

## Resumen

vectabass-232m-5.01bt-base-cooled es un modelo de lenguaje base de 231,8 millones de parametros totales (173,9 millones no pertenecientes a embeddings) desarrollado por VectaBass. Forma parte de la "Phase 1 AR square", una escalera de modelos que va de 100M a 1.600M de parametros no-embedding, donde cada tamano se entrena con varios presupuestos de tokens y se publica en conjunto para poder verificar empiricamente las leyes de escala. Esta celda concreta, identificada como N2-D3, se entreno con 5.014 millones de tokens, lo que equivale a 29 tokens por parametro no-embedding.

El modelo sigue una arquitectura tipo Llama (transformer decoder-only con pre-norm RMSNorm, SwiGLU y RoPE) pero incorpora attention autoexclusiva (XSA), una variante que Llama no tiene, ademas de GQA con proporcion 2:1. Su interes principal es cientifico: permite a investigadores reproducir y contrastar curvas de escalado con checkpoints de acceso abierto, pesos en safetensors y entrenamiento documentado hasta el detalle del optimizador (Muon combinado con AdamW). No es un modelo pensado para uso como asistente.

La relevancia actual del modelo radica en su enfoque de "IA soberana del Reino Unido": el corpus incluye fuentes parlamentarias y del sector publico britanico, asi como lenguas celtas (gales, gaélico escoces, irlandes, manes, cornualles) y escoces. Esta licenciado bajo Apache 2.0, lo que facilita su reutilizacion y estudio sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con attention autoexclusiva (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE |
| Parametros totales | 231.800.832 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Parametros no-embedding | 173.850.624 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (ingles, gales, gaélico escoces, irlandes, manes, cornualles, escoces) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` por `modeling_vectabass.py`) |
| Ancho / capas | 1152 / 12 |
| Cabezas | 18 query, 9 key-value, dimension 64 |
| Feed-forward | SwiGLU, dimension 3040 |
| Vocabulario | 50.304 filas: GPT-2 BPE (50.257) + 26 tokens especiales + padding |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas y ancho 1152, con atencion causal que combina GQA (18 cabezas de query y 9 de key-value, dimension 64) con attention autoexclusiva (XSA), una modificacion que no existe en Llama y que requiere cargar codigo personalizado del repositorio. Usa RoPE con base 10000 sobre una ventana de 2048 tokens, normalizacion RMSNorm en pre-norm y capas feed-forward SwiGLU de dimension 3040. Los embeddings de entrada y salida estan atados.

El entrenamiento consumio 5.014.159.360 tokens con un batch de 327.680 tokens, sobre una unica GPU NVIDIA GH200 de 120 GB. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) con AdamW en fp32 (betas 0.9 y 0.95). El pico de learning rate fue 0.00206, con 174M tokens de warmup, una fase constante y un cooldown de tipo 1-sqrt hasta cero en el ultimo 20% del entrenamiento. El weight decay fue 0.0784 sobre matrices. Se entreno en bf16 para pesos y activaciones, con pesos maestros en fp32, y estadisticas de normalizacion, angulos RoPE y logits en fp32. Los datos provienen de una vista de 47 bins de texto con licencia abierta (unos 96B de tokens unicos) basada en fineweb-edu, fineweb-2 y finemath, con fuentes del sector publico y parlamentario britanico y de lenguas celtas. No hay RLHF, DPO ni ajuste por instrucciones: es un modelo estrictamente base.

## Capacidades

- Generacion de texto autoregresiva en ingles y, en menor medida, en gales, gaélico escoces, irlandes, manes, cornualles y escoces.
- Modelado de lenguaje puro: completado de texto, continuacion de documentos y puntuacion de secuencias (log-probabilities).
- Evaluacion zero-shot mediante puntuacion de continuaciones, util para investigacion en leyes de escala.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- No tiene modo thinking, vision ni audio.
- Capacidad multilingue limitada a las siete lenguas declaradas, con predominio claro del ingles.
- No esta ajustado para seguir instrucciones ni para conversar.

## Casos de uso

- Investigacion en leyes de escala: el modelo es una celda de una escalera de checkpoints de 100M a 1.600M de parametros; se puede usar para ajustar curvas de perdida frente a tokens y parametros y contrastar predicciones teoricas con resultados empiricos.
- Estudio de arquitecturas con XSA: al ser uno de los pocos checkpoints abiertos con attention autoexclusiva, permite analizar el efecto de esta variante frente a attention estandar en tareas de modelado de lenguaje.
- Punto de partida para fine-tuning: con 232M de parametros y licencia Apache 2.0, es viable afinarlo en una sola GPU consumer para tareas concretas de clasificacion o generacion acotada.
- Modelado de lenguas celtas de bajos recursos: su mezcla de datos incluye gales, gaélico escoces, irlandes, manes y cornualles, lo que lo hace util como base para experimentos de continuacion de texto en estas lenguas.
- Evaluacion de tecnicas de entrenamiento: el detalle del optimizador (Muon + AdamW) y del schedule permite reproducir y comparar variantes de entrenamiento a pequena escala.
- Generacion de texto offline en entornos con recursos limitados: sus 0,5 GB de pesos en bf16 caben en cualquier GPU moderna, lo que facilita prototipos de inferencia local.
- Benchmarking de infraestructura: sirve como carga de trabajo ligera para validar pipelines de entrenamiento e inferencia (SDPA, FlashAttention) con resultados de perdida reproducibles bit a bit.

## Benchmarks y rendimiento

Resultados zero-shot con 500 items por tarea (shuffle con semilla 0, protocolo hub-v1), puntuando log P(continuacion | contexto):

| Tarea | Puntuacion |
|---|---|
| ARC-Easy | 0,514 |
| ARC-Challenge | 0,226 |
| HellaSwag | 0,300 |
| PIQA | 0,622 |
| WinoGrande | 0,516 |
| BoolQ | 0,604 |
| MMLU | 0,228 |
| LAMBADA | 0,314 |
| DQRB (propia) | 0,523 |
| LAMBADA bits per byte | 1,304 |

Perdida de validacion sobre el canon retenido (phase-1-release canon-8192, 8192 x 2048 tokens): 2,3443 nats por token. Los pesos del repositorio reproducen los logits del codigo de entrenamiento bit a bit y puntuan 2,3444 bajo PyTorch SDPA (el entrenamiento uso FlashAttention-4). No se han publicado comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,5 GB para los pesos, mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 2 GB o mas.
- VRAM estimada en fp32: alrededor de 1 GB para los pesos.
- GPU recomendadas: cualquier GPU moderna; el checkpoint se entreno en una NVIDIA GH200 de 120 GB, pero para inferencia basta una RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas actuales e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por el codigo de XSA); vLLM, llama.cpp, Ollama o TGI requeririan soporte para la arquitectura personalizada, que no esta garantizado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. A modo de contexto estructural:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-232m-5.01bt-base-cooled | 231,8M (173,9M no-embedding) | 2048 | Apache 2.0 | Base, XSA, enfoque en leyes de escala |
| Alternativas de ~200-300M | no disponible | no disponible | no disponible | No se han proporcionado datos comparativos |

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escalado, no un asistente: afirmara cosas falsas con fluidez y no sigue instrucciones.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Predominio del ingles; las lenguas celtas y el escoces tienen participaciones menores y su calidad no esta garantizada.
- Sin ajuste de seguridad ni filtrado de salidas: puede generar contenido inapropiado o sesgado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta disenado para ello y su calidad en tareas practicas es baja segun los benchmarks publicados.
- No hay datos publicados sobre sesgos especificos, tasas de alucinacion ni comportamiento en produccion.
- El soporte en frameworks de inferencia optimizados (vLLM, llama.cpp) no esta confirmado para la arquitectura XSA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-232m-5.01bt-base-cooled
- Referencia de Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper: pendiente de publicacion segun la model card; hasta entonces, citar el repositorio.
