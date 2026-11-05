# VectaBass/vectabass-59m-5.01bt-base-cooled

## Resumen

vectabass-59m-5.01bt-base-cooled es un modelo de lenguaje base de 59,48 millones de parametros totales (27,28 millones no pertenecientes a embeddings, con pesos de embedding atados) desarrollado por VectaBass en el marco de su proyecto de IA soberana del Reino Unido. Se trata de la celda experimental N0-D3 del apendice autorregresivo (AR addendum) de un estudio de leyes de escala: un escalon adicional por debajo de la escalera principal de 100M a 1,6B parametros, entrenado con la misma receta y los mismos datos para verificar el comportamiento de la ley de escala en tamanos inferiores.

El modelo emplea una arquitectura tipo Llama con atencion exclusiva auto-atencion (XSA, exclusive self-attention), una variante que Llama no incorpora nativamente y que requiere cargar codigo personalizado (`modeling_vectabass.py`) mediante `trust_remote_code`. La ventana de contexto es de 2048 tokens y el vocabulario es el BPE de GPT-2 (50.257 tokens) ampliado con 26 tokens especiales hasta 50.304 filas.

Es relevante ahora por dos motivos: primero, porque documenta de forma abierta y reproducible una celda de un estudio de leyes de escala con datos de dominio publico y fuentes parlamentarias y celtas del Reino Unido; segundo, porque su licencia Apache 2.0 y su reducido tamano (0,1 GB de repositorio) lo hacen util como banco de pruebas de infraestructura de inferencia y de tecnicas de entrenamiento (optimizador Muon, cooldown 1-sqrt) a escala de un solo acelerador. No es un modelo para uso asistencial: es un modelo base sin ajuste por instrucciones ni por seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con GQA y atencion exclusiva auto-atencion (XSA) |
| Parametros totales | 59.473.920 (embeddings atados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Parametros no pertenecientes a embeddings | 27.279.360 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (la model card solo especifica bf16 como precision de entrenamiento e inferencia recomendada) |
| Idiomas soportados | Ingles (mayoritario), gales, gaelico escoces, irlandes, manes, cornes y escoces |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |
| Anchura / capas | 640 / 6 |
| Cabezas de atencion | 10 de consulta, 5 de clave-valor, dimension 64 (GQA 2:1) |
| Feed-forward | SwiGLU, dimension 1728 |
| Normalizacion | RMSNorm, pre-norm |
| Posiciones | RoPE, base 10000 |
| Vocabulario | 50.304 filas: BPE de GPT-2 (50.257) mas 26 tokens especiales, resto padding |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La red es un transformer decoder-only de 6 capas con anchura 640, normalizacion RMSNorm en configuracion pre-norm, feed-forward SwiGLU de dimension 1728 y atencion causal con grouped-query attention en proporcion 2:1 (10 cabezas de consulta frente a 5 de clave-valor, dimension 64 por cabeza). La innovacion arquitectonica destacable es la atencion exclusiva auto-atencion (XSA), que se anade al esquema tipo Llama y obliga a cargar el modulo `modeling_vectabass.py` del repositorio. Las posiciones se codifican con RoPE de base 10000 y la ventana es de 2048 tokens.

El entrenamiento consumio 5.014.159.360 tokens (184 tokens por parametro no perteneciente a embeddings) en lotes de 327.680 tokens, sobre una NVIDIA GH200 de 120 GB. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momento 0.95) con AdamW en fp32 (betas 0.9 y 0.95) para el resto. La tasa de aprendizaje maxima fue 0.00359, con 27 millones de tokens de warmup, un tramo constante y un cooldown 1-sqrt hasta cero en el ultimo 20 % del entrenamiento; el weight decay aplicado a matrices fue 0.119. Los pesos y activaciones se mantuvieron en bf16 con pesos maestros en fp32 en el optimizador, y las estadisticas de normalizacion, los angulos de RoPE y los logits se calcularon en fp32. Los datos proceden de la vista phase-1-release: 47 contenedores de texto con licencia abierta, unos 96.000 millones de tokens unicos, con fuentes del sector publico britanico, parlamentarias y de lenguas celtas, ademas de fineweb-edu, fineweb-2 y finemath.

## Capacidades

- Generacion de texto autoregresiva en ingles y, en menor medida, en gales, gaelico escoces, irlandes, manes, cornes y escoces.
- Modelado de lenguaje base: continuacion de texto, completado de frases y modelado de probabilidad de secuencias.
- Razonamiento y conocimiento factual limitados al haberse entrenado exclusivamente como modelo base (sin ajuste por instrucciones).
- Capacidad matematica acotada por el subconjunto finemath del corpus de entrenamiento, sin evaluacion publicada.
- Sin soporte de tool calling ni function calling: no hay ajuste para ello.
- Sin soporte de agentes ni razonamiento multi-paso: no dispone de modo thinking ni de entrenamiento para ello.
- Sin capacidades de vision ni audio.
- Sin modo de pensamiento explicito ni cadena de razonamiento entrenada.
- Contexto maximo de 2048 tokens, lo que limita tareas de contexto largo.

## Casos de uso

- Verificacion de leyes de escala: la celda N0-D3 sirve para comprobar si la relacion entre perdida y tokens de entrenamiento se mantiene en el escalon de 27,3M parametros no-embeddings, comparando su perdida de validacion (2,6466 nats/token) con las celdas superiores del estudio.
- Banco de pruebas de infraestructura de inferencia: con 0,1 GB de repositorio y 59M de parametros, permite validar pipelines de transformers, SDPA frente a FlashAttention y flujos con `trust_remote_code` en entornos de CI sin coste de GPU significativo.
- Investigacion sobre atencion XSA: al ser una de las pocas implementaciones abiertas de atencion exclusiva auto-atencion, es util para reproducir y analizar el efecto de esta variante sobre la perdida y la estabilidad del entrenamiento.
- Estudio de optimizadores hibridos: la combinacion Muon + AdamW documentada en la model card permite experimentos controlados sobre recetas de optimizacion a escala pequena antes de escalar a modelos mayores.
- Generacion de texto en lenguas celtas: aunque con calidad limitada por el tamano, puede emplearse para explorar el comportamiento de un modelo entrenado con mezcla multilingue britanica en gales, gaelico escoces, irlandes, manes y cornes.
- Docencia y formacion: su reducido tamano y su receta completamente documentada lo hacen adecuado para cursos practicos de entrenamiento de LLM, desde la tokenizacion hasta el cooldown de la tasa de aprendizaje.
- Pruebas de cuantizacion y despliegue ligero: sirve como sujeto de prueba para exportar a GGUF y medir el impacto de la cuantizacion en un modelo de 59M antes de aplicar la misma receta a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las puntuaciones zero-shot de este modelo aun no se han medido. El unico dato de rendimiento publicado es la perdida de validacion sobre el canon retenido phase-1-release canon-8192 (8192 x 2048 tokens): 2,6466 nats por token, con 2,6467 al reproducir con PyTorch SDPA (el entrenamiento uso FlashAttention-4). Los pesos del repositorio reproducen los logits del codigo de entrenamiento de forma bit a bit.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,12 GB para los pesos (59,48M parametros x 2 bytes), mas activaciones y cache KV; en la practica, menos de 1 GB en total.
- VRAM estimada en otras precisiones: no disponible en la informacion proporcionada; al ser un modelo pequeno, cabria esperar un consumo inferior en fp16/bf16 y aun menor en cuantizaciones de 8 o 4 bits, pero no hay datos publicados.
- GPU recomendadas: cualquier GPU con soporte de bf16; el entrenamiento se realizo en una NVIDIA GH200 de 120 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) e incluso en CPU, dado el reducido numero de parametros.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `dtype=torch.bfloat16` (metodo documentado por el autor); para vLLM, llama.cpp, Ollama o TGI no hay soporte documentado en la informacion disponible, y la atencion XSA requeriria una implementacion especifica.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| vectabass-59m-5.01bt-base-cooled | 59,48M (27,28M no-embedding) | 2048 | Apache 2.0 | Ingles y lenguas celtas | Modelo base de estudio de leyes de escala, atencion XSA |
| Modelos de la escalera AR del mismo autor (100M a 1,6B) | 100M a 1,6B | No disponible | No disponible | No disponible | Celdas superiores del mismo estudio; datos concretos no disponibles en la informacion proporcionada |
| Alternativas de ~50-60M parametros de la familia GPT-2 small | 124M | 1024 | MIT (segun la publicacion original) | Ingles | Referencia clasica de modelo base pequeno; no se dispone de comparacion de rendimiento publicada con este modelo |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de leyes de escala, no un asistente: producira afirmaciones falsas con fluidez y no sigue instrucciones.
- No ha recibido ajuste por instrucciones ni ajuste de seguridad, y no hay filtrado de salidas.
- La ventana de contexto esta limitada a 2048 tokens, insuficiente para tareas de contexto largo.
- El idioma dominante es el ingles; las lenguas celtas (gales, gaelico escoces, irlandes, manes, cornes) y el escoces tienen participaciones menores y su calidad sera previsiblemente inferior.
- Riesgo elevado de alucinacion por el reducido tamano y la ausencia de ajuste alineado.
- Sesgos potenciales derivados del corpus (fineweb-edu, fineweb-2, finemath y fuentes del sector publico britanico), no evaluados ni documentados en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado para produccion y no ofrece garantias de calidad ni de seguridad.
- Requiere `trust_remote_code=True` para cargar `modeling_vectabass.py`, lo que implica ejecutar codigo del repositorio; conviene auditar ese archivo antes de desplegarlo.
- El soporte en herramientas de inferencia de terceros (vLLM, llama.cpp, Ollama, TGI) no esta documentado y puede requerir trabajo de integracion por la atencion XSA.
- No hay benchmarks zero-shot publicados, por lo que no es posible estimar su calidad relativa frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-59m-5.01bt-base-cooled
- Agradecimiento a Isambard-AI National AI Research Resource (paper): https://doi.org/10.48550/arXiv.2410.11199
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
