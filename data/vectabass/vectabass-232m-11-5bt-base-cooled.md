# VectaBass/vectabass-232m-11.5bt-base-cooled

## Resumen

vectabass-232m-11.5bt-base-cooled es un modelo de lenguaje base de 231,8 millones de parámetros totales (173,9 millones sin contar embeddings) desarrollado por VectaBass. Forma parte de la "Phase 1 AR square", una escalera de modelos de 100M a 1.6B parámetros no-embedding, cada uno entrenado con varios presupuestos de tokens y publicados conjuntamente para permitir la verificacion de leyes de escala. Este checkpoint concreto corresponde a la celda N2-D4 del reticulado, con 11.520 millones de tokens de entrenamiento, lo que equivale a 66 tokens por parametro no-embedding.

El modelo emplea una arquitectura tipo Llama con atención causal, GQA con ratio 2:1 y una innovacion denominada exclusive self-attention (XSA), que requiere cargar codigo propio del repositorio mediante `trust_remote_code`. Se entrenó en una única GPU NVIDIA GH200 de 120 GB con el optimizador Muon para matrices ocultas y AdamW en fp32 para el resto, en precision bf16.

Su relevancia es doble: por un lado, es un artefacto de investigacion para estudiar leyes de escala con datos reproducibles; por otro, incorpora un sesgo explicito hacia fuentes del sector publico britanico, parlamentarias y de lenguas celtas (gales, gaélico escoces, irlandes, manes, cornualles y escoces), lo que lo alinea con la iniciativa de IA soberana del Reino Unido. No es un modelo instruido ni alineado para seguridad: es una base cruda pensada para experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con GQA 2:1 y exclusive self-attention (XSA) |
| Parametros totales | 231.800.832 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el autor indica ejecutar en bf16 tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `modeling_vectabass.py` para `trust_remote_code`) |

## Arquitectura y entrenamiento

La red es un transformer decoder-only con 12 capas, anchura 1152, 18 cabezas de consulta y 9 de clave-valor de dimension 64, feed-forward SwiGLU de 3040 y normalizacion RMSNorm pre-norm. Las posiciones usan RoPE con base 10000 y contexto de 2048 tokens. El vocabulario es GPT-2 BPE (50257 tokens) mas 26 tokens especiales, hasta 50304 filas con relleno. La atencion es causal con GQA 2:1 e incorpora exclusive self-attention (XSA), una variante que no existe en Llama estandar y que obliga a usar el codigo de modelado del repositorio.

El entrenamiento consumió 11.519.590.400 tokens con un batch de 327.680 tokens, learning rate pico de 0.00206, warmup de 174M tokens y un schedule de warmup, constante y cooldown 1-sqrt hasta cero en el ultimo 20%. El optimizador combina Muon (matrices ocultas, NS 5, Moonlight RMS 0.2, momentum 0.95) con AdamW fp32 (0.9, 0.95) y weight decay de 0.0784 en matrices. Los pesos y activaciones van en bf16, con pesos maestros fp32 en el optimizador y estadisticas de normalizacion, angulos RoPE y logits en fp32. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96B de tokens unicos, con fuentes de fineweb-edu, fineweb-2 y finemath, mas fuentes del sector publico britanico, parlamentarias y de lenguas celtas.

## Capacidades

- Generacion de texto autoregresiva en ingles y lenguas celtas (gales, gaélico escoces, irlandes, manes, cornualles) y escoces.
- Modelo base sin instruccion: no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- Razonamiento de sentido comun basico y completado de texto segun los resultados zero-shot publicados.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Sin vision, audio ni modo de pensamiento.
- Capacidad multilingue limitada: predominio del ingles con participacion menor del resto de idiomas listados.

## Casos de uso

- Investigacion sobre leyes de escala: este checkpoint es una celda concreta del reticulado N2-D4; se usa junto al resto de la escalera para ajustar y validar curvas de perdida frente a tokens y parametros. Es su proposito principal y para lo que fue disenado.
- Reproducibilidad de entrenamiento: el repositorio incluye `provenance.json`, hash sha256 del checkpoint fuente y contrato de ejecucion, lo que permite replicar logits bit a bit y auditar el pipeline.
- Experimentos de modelado de lenguas celtas: con participacion explicita de gales, gaélico escoces, irlandes, manes y cornualles, sirve como linea base de perplexidad para corpus de estas lenguas de bajos recursos.
- Prototipado de completado de texto en dominios parlamentarios y del sector publico britanico: el sesgo del dataset hacia estas fuentes lo hace adecuado para tareas exploratorias de continuacion de texto administrativo o legislativo, siempre con supervision humana.
- Fine-tuning ligero como base: al ser un modelo pequeno (231M) y con licencia Apache 2.0, es viable ajustarlo en una sola GPU consumer para tareas especificas de clasificacion o generacion acotada.
- Ensenanza y docencia: su tamano reducido y su codigo de modelado autocontenido permiten usarlo como ejemplo didactico de implementacion de GQA, XSA y schedules de cooldown.
- Evaluacion de tecnicas de atencion: la XSA es una variante poco comun; el modelo sirve para comparar su comportamiento frente a atencion estandar en tareas de lenguaje.

## Benchmarks y rendimiento

Evaluacion zero-shot con 500 items por tarea (shuffle con semilla 0, protocolo hub-v1). Puntuacion de opcion multiple como log P(continuacion | contexto), exactitud normalizada donde aplica.

| Tarea | Puntuacion |
|---|---|
| ARC-Easy | 0.524 |
| ARC-Challenge | 0.246 |
| HellaSwag | 0.320 |
| PIQA | 0.624 |
| WinoGrande | 0.544 |
| BoolQ | 0.608 |
| MMLU | 0.230 |
| LAMBADA | 0.324 |
| DQRB (propia) | 0.559 |
| LAMBADA bits per byte | 1.279 |

Perdida de validacion en el canon retenido phase-1-release canon-8192 (8192 x 2048 tokens): 2.2604 nats por token. Los pesos del repositorio reproducen los logits del codigo de entrenamiento de forma bit a bit y puntuan 2.2605 bajo PyTorch SDPA (el entrenamiento usó FlashAttention-4).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,5 GB de pesos mas overhead de activaciones y cache KV para 2048 tokens; en la practica cabe en cualquier GPU con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna con soporte bf16 (RTX 3060 en adelante, RTX 4090, A100, H100). El entrenamiento se realizó en una GH200 de 120 GB, pero la inferencia no requiere ese hardware.
- Cabe holgadamente en GPU consumer, incluidas GTX 16xx si se usa fp16 o cuantizacion adicional.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via soportada oficialmente. No se ha confirmado soporte en vLLM, llama.cpp, Ollama o TGI, y la atencion XSA personalizada puede requerir adaptaciones.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-232m-11.5bt-base-cooled | 231,8M totales (173,9M no-embedding) | 2048 | Apache 2.0 | Base con XSA, sesgo a lenguas celtas y fuentes britanicas |
| SmolLM-135M (Hugging Face) | 135M | 2048 | Apache 2.0 | Base pequeno de referencia; sin datos comparativos en esta ficha |
| Pythia-160M (EleutherAI) | 160M | 2048 | Apache 2.0 | Suite de leyes de escala; sin datos comparativos en esta ficha |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Referencia historica; sin datos comparativos en esta ficha |

No se dispone de resultados de benchmarks de los modelos alternativos en la informacion proporcionada para establecer una comparacion numerica directa.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escalado, no un asistente: afirmara cosas falsas con fluidez y no sigue instrucciones.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Predominio del ingles; el resto de idiomas (cy, gd, ga, gv, kw, sco) tienen participaciones menores y calidad no garantizada.
- Sin ajuste de seguridad ni filtrado de salidas: puede generar contenido toxico, sesgado o danino.
- Requiere `trust_remote_code=True` para cargar `modeling_vectabass.py`, lo que implica ejecutar codigo del repositorio; conviene auditar ese fichero antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado para ello sin fine-tuning y evaluacion previos.
- Los sesgos del corpus (fuentes del sector publico britanico y parlamentarias) pueden reflejarse en las generaciones.
- El soporte en frameworks de inferencia optimizados (vLLM, llama.cpp) no esta confirmado debido a la atencion XSA personalizada.

## Enlaces

- Hugging Face: https://huggingface.co/VectaBass/vectabass-232m-11.5bt-base-cooled
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Referencia Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Paper del modelo: no disponible (anunciado como "forthcoming"); hasta entonces, citar el repositorio.
