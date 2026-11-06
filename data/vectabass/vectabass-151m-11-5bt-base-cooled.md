# VectaBass/vectabass-151m-11.5bt-base-cooled

## Resumen

vectabass-151m-11.5bt-base-cooled es un modelo de lenguaje base de 151 millones de parametros totales (100 millones sin contar embeddings) desarrollado por VectaBass como parte de su Phase 1 AR square, un estudio de leyes de escala que cubre desde 100M hasta 1.600M de parametros no-embedding, cada tamano entrenado con varios presupuestos de tokens y publicado conjuntamente para permitir la verificacion empirica de la ley de escala. Este checkpoint concreto corresponde a la celda N1-D4 (100M parametros no-embedding, 11,52 mil millones de tokens de entrenamiento, ratio de 115 tokens por parametro).

El modelo emplea una arquitectura tipo Llama con atención causal, GQA 2:1 y una innovacion propia denominada exclusive self-attention (XSA), que requiere cargar codigo remoto del repositorio. Se entrenó en una sola GPU NVIDIA GH200 de 120 GB con el optimizador Muon para matrices ocultas y AdamW en fp32 para el resto, alcanzando una perdida de validacion de 2,3588 nats por token en su canon interno.

Su relevancia es doble: por un lado, sirve como punto de datos reproducible para investigacion sobre leyes de escala; por otro, su enfasis en fuentes del sector publico britanico, parlamentarias y de lenguas celtas (gales, gaélico escoces, irlandes, manes, cornes y escoces) lo vincula al ecosistema de IA soberana del Reino Unido. Es un modelo base sin ajuste de instrucciones ni de seguridad, disenado para experimentacion, no para uso como asistente en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con GQA 2:1 y exclusive self-attention (XSA) |
| Parametros totales | 151.486.464 (embeddings atados) |
| Parametros activos | No aplica (modelo denso) |
| Parametros no-embedding | 99.975.168 |
| Longitud de contexto | 2048 tokens (RoPE, base 10000) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el modelo se publica en bf16 |
| Idiomas soportados | Ingles (principal), gales, gaélico escoces, irlandes, manes, cornes y escoces (en proporciones menores) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, con `trust_remote_code`) |
| Anchura / capas | 1024 / 9 |
| Cabezas | 16 query, 8 key-value, dimension 64 |
| Feed-forward | SwiGLU, 2592 |
| Normalizacion | RMSNorm, pre-norm |
| Vocabulario | 50.304 filas: GPT-2 BPE (50.257) + 26 tokens especiales + padding |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

La red es un transformer decoder-only de 9 capas y 1024 de anchura con atencion causal, GQA en proporcion 2:1 (16 cabezas de consulta, 8 de clave-valor, dimension 64), SwiGLU de 2592 en la capa feed-forward, RMSNorm en pre-norm y RoPE con base 10000. La desviacion respecto a Llama es la exclusive self-attention (XSA), implementada en `modeling_vectabass.py` y no presente en la arquitectura original, lo que obliga a cargar codigo remoto. El vocabulario es GPT-2 BPE con 26 tokens especiales adicionales y filas de padding hasta 50.304.

El entrenamiento consumio 11.519.655.936 tokens con un batch de 262.144 tokens y un pico de learning rate de 0,00243, con 100M tokens de warmup y un schedule de warmup, fase constante y cooldown 1-sqrt hasta cero en el ultimo 20%. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0,2, momento 0,95) con AdamW fp32 para el resto, con weight decay de 0,105 en matrices. Se uso bf16 en pesos y activaciones con pesos maestros en fp32, y estadisticas de normalizacion, angulos RoPE y logits en fp32. Todo el run se ejecuto en una sola NVIDIA GH200 de 120 GB. El dataset es la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96.000 millones de tokens unicos, incluyendo fuentes del sector publico britanico, parlamentarias y de lenguas celtas (documentadas en `DATA.md`).

## Capacidades

- Generacion de texto autoregresiva en ingles, con soporte de gales, gaélico escoces, irlandes, manes, cornes y escoces en proporciones menores.
- Modelado de lenguaje puro: continuacion de texto, completado y puntuacion de secuencias mediante log-probabilidades.
- Razonamiento de sentido comun basico a nivel de modelo pequeno (vease la seccion de benchmarks).
- No dispone de tool calling ni function calling: es un modelo base sin ajuste.
- No soporta agentes ni razonamiento multi-paso por si mismo; requeriria andamiaje externo y ajuste.
- No tiene modo thinking, vision ni audio.
- Capacidad multilingue limitada a las siete lenguas listadas, con el ingles claramente dominante.

## Casos de uso

- Investigacion sobre leyes de escala: el checkpoint es un punto de datos reproducible (100M parametros no-embedding, 11,52B tokens) para ajustar y validar curvas de perdida frente a tamano y presupuesto de computo, comparandolo con las demas celdas de la AR square.
- Reproduccion de experimentos de entrenamiento: al publicarse el run contract, el sha256 del checkpoint fuente y el desglose del dataset, permite replicar el pipeline de Muon + AdamW y el schedule con cooldown 1-sqrt en hardware de una sola GPU.
- Modelado de lenguaje para lenguas celtas minorizadas: su mezcla incluye gales, gaélico escoces, irlandes, manes, cornes y escoces, util para experimentos de continuacion y perplexity en corpus de estas lenguas con contexto de 2048 tokens.
- Punto de partida para fine-tuning ligero: al ser un modelo base de 151M y 0,3 GB, puede ajustarse en una GPU de consumo para tareas de clasificacion, extraccion o generacion acotada en dominios del sector publico britanico.
- Evaluacion de tecnicas de atencion: la presencia de XSA permite estudiar el impacto de esta variante de atencion frente a atencion estandar en un modelo de escala controlada, con pesos y codigo publicados.
- Docencia y prototipado rapido: su tamano permite ejecutarlo en portatil o en una GPU modesta para demostrar el ciclo completo de un transformer entrenado desde cero con datos abiertos.
- Generacion de texto exploratoria sin requisitos de calidad de produccion: continuaciones de frases, pruebas de perplexity y analisis de sesgos en un modelo base sin filtrado.

## Benchmarks y rendimiento

Evaluacion zero-shot con 500 items por tarea, barajado con semilla 0, protocolo hub-v1; en tareas de eleccion multiple se puntua log P(continuacion | contexto) con exactitud normalizada cuando aplica.

| Tarea | Resultado |
|---|---|
| ARC-Easy | 0,486 |
| ARC-Challenge | 0,246 |
| HellaSwag | 0,310 |
| PIQA | 0,616 |
| WinoGrande | 0,534 |
| BoolQ | 0,604 |
| MMLU | 0,256 |
| LAMBADA | 0,282 |
| DQRB (propia) | 0,531 |
| LAMBADA bits per byte | 1,313 |

Perdida de validacion en el canon interno phase-1-release canon-8192 (8192 x 2048 tokens): 2,3588 nats por token; los pesos de este repo reproducen los logits del codigo de entrenamiento bit a bit y puntuan 2,3589 bajo PyTorch SDPA (el entrenamiento uso FlashAttention-4). No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,3 GB de pesos mas estados de activacion y cache KV para 2048 tokens; cabe holgadamente en cualquier GPU con 2 GB o mas.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA GH200 de 120 GB, pero para inferencia basta una GPU de consumo como RTX 3060, RTX 4060, RTX 4090 o incluso CPU.
- Cabe en GPU de consumo: si, en practicamente todas las disponibles en el mercado actual.
- Opciones de despliegue: transformers con `trust_remote_code=True` (unica via documentada, dado que requiere `modeling_vectabass.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vectabass-151m-11.5bt-base-cooled | 151M totales (100M no-embedding) | 2048 | Apache 2.0 | Pesos safetensors con codigo remoto |
| Otros modelos de ~150M comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables de la misma categoria con datos verificables de parametros, contexto o rendimiento, por lo que no se ofrece una comparativa numerica.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de leyes de escala, no un asistente: afirmara cosas falsas con fluidez y no sigue instrucciones.
- No ha pasado por ajuste de instrucciones ni por ajuste de seguridad; no hay filtrado de salidas.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Predominio del ingles; las lenguas celtas aparecen en proporciones menores y su calidad no esta cuantificada en la informacion disponible.
- Riesgo elevado de alucinacion y de sesgos heredados de los corpus abiertos (fineweb-edu, fineweb-2, finemath y fuentes del sector publico britanico), sin evaluaciones de sesgo publicadas.
- Requiere `trust_remote_code=True` para cargar `modeling_vectabass.py`; conviene revisar ese codigo antes de ejecutarlo en entornos de produccion.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de ajuste y de evaluaciones de seguridad hace desaconsejable su despliegue directo en productos orientados a usuario final.
- Aunque la model card indica 151.486.464 parametros totales, el dato de safetensors reporta 151.505.920; la discrepancia no se explica en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-151m-11.5bt-base-cooled
- Referencia de recursos Isambard-AI: https://doi.org/10.48550/arXiv.2410.11199
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
