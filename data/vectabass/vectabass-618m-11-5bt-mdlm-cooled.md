# VectaBass/vectabass-618m-11.5bt-mdlm-cooled

## Resumen
vectabass-618m-11.5bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, masked diffusion language model) de 617,9 millones de parámetros totales (527,7 millones sin embeddings), entrenado desde cero sobre 11.519.459.328 tokens. Lo desarrolla el autor VectaBass en el marco de un estudio de leyes de escala para IA soberana del Reino Unido, y constituye la celda N4-D2 de una "retícula MDLM" de la fase 1: una escalera de modelos de 100M a 1.6B de parámetros no-embedding, cada tamano entrenado con varios presupuestos de tokens y publicados en conjunto para poder verificar la ley de escala.

El modelo no es autorregresivo: parte de la pila tipo Llama de los modelos AR del mismo autor, con atención exclusiva propia (XSA) y GQA 2:1, pero la hace bidireccional y la entrena con el objetivo MDLM (ELBO negativo en tiempo continuo con alpha_t lineal). La generación se realiza rellenando máscaras en varias pasadas hacia delante, no token a token de izquierda a derecha.

Es relevante ahora porque ofrece pesos abiertos (Apache 2.0) de un modelo de difusión de texto a escala media, con contexto de 2048 tokens, vocabulario GPT-2 BPE y soporte de siete idiomas (inglés y seis lenguas celtas y escocés), lo que lo convierte en una pieza util para investigar decodificación no autorregresiva y para estudios de escalado reproducible en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con self-attention exclusiva (XSA), GQA 2:1, pre-norm RMSNorm, SwiGLU, RoPE base 10000 |
| Parametros totales | 617.852.928 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el autor recomienda ejecutar en bf16, tal como se entreno) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `trust_remote_code` para `modeling_vectabass.py`) |

## Arquitectura y entrenamiento
La red es la misma pila de los modelos autorregresivos del autor: anchura 1792, 15 capas, 28 cabezas de consulta y 14 de clave-valor de dimensión 64, feed-forward SwiGLU de 4752 y normalización RMSNorm pre-norm. La diferencia clave es que la atención se hace bidireccional y se anade atención exclusiva propia (XSA). El vocabulario tiene 50304 filas: BPE de GPT-2 (50257) más 26 tokens especiales y relleno; el token de máscara es el id 50283.

El objetivo es MDLM con alpha_t = 1 - t y pérdida ELBO negativo en tiempo continuo (entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones). Se entrenó con 11.519.459.328 tokens (22 por parámetro no-embedding), lote de 851.968 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) más AdamW fp32 (0.9, 0.95), LR pico de 0.00105, warmup de 528M tokens y schedule constante con cooldown 1-sqrt hasta 0 en el último 20%. Precisión bf16 en pesos y activaciones con pesos maestros fp32, y estadísticas de norma, ángulos RoPE y logits en fp32. Todo el entrenamiento se ejecutó en una única NVIDIA GH200 de 120 GB.

Los datos provienen de la vista de la fase 1: 47 bins de texto con licencia abierta (unos 96B tokens únicos) de fineweb-edu, fineweb-2 y finemath, con fuentes del sector público británico, parlamentarias y de lenguas celtas; el desglose por bin, cuota y licencia está en `DATA.md`.

## Capacidades
- Modelado de lenguaje y extracción de características: `model(ids).logits` devuelve, en cada posición, la distribución del token limpio; el pipeline declarado es `feature-extraction`.
- Generación por difusión: `diffusion_generate` rellena máscaras en `steps` pasadas; soporta `order="random"` (orden inverso nativo del entrenamiento) y `order="confidence"` (estilo MaskGIT).
- Relleno condicionado (infilling): al ser bidireccional, puede completar huecos en cualquier posición, no solo continuaciones a la derecha.
- Multilingüismo limitado a inglés, galés (cy), gaélico escocés (gd), irlandés (ga), manés (gv), córnico (kw) y escocés (sco).
- No dispone de tool calling, function calling, modo thinking, visión ni audio: es un modelo base sin instrucciones.
- No hay ajuste por RLHF, DPO ni post-entrenamiento de seguridad.

## Casos de uso
- Investigación de leyes de escala: al ser una celda de una retícula publicada con varios tamanos y presupuestos de tokens, permite ajustar curvas de pérdida frente a parámetros y tokens y contrastarlas con la retícula autorregresiva del mismo autor.
- Estudio de decodificación no autorregresiva: sirve para comparar samplers (orden aleatorio ancestral frente a confianza con penalización de presencia) midiendo bits por byte UTF-8, bigramas distintos y 4-gramas repetidos con el protocolo del autor.
- Relleno de texto (infilling) en documentos: su atención bidireccional permite reconstruir fragmentos enmascarados en cualquier punto de un pasaje de hasta 2048 tokens, útil en tareas de restauración o aumentación de corpus.
- Extracción de representaciones: con `AutoModel` y bf16 se pueden obtener estados ocultos de 1792 dimensiones por token para clasificación, clustering o búsqueda semántica en corpus de inglés y lenguas celtas.
- Experimentos con lenguas de bajos recursos: es uno de los pocos modelos abiertos que declara gaélico, manés, córnico y escocés, lo que permite medir perplejidad y fluidez en estas lenguas frente a modelos AR del mismo tamano.
- Docencia y prototipado en una sola GPU: con 617,9M parámetros en bf16 (unos 1,2 GB de pesos) cabe en GPUs de consumo y permite reproducir el pipeline de difusión completo sin infraestructura distribuida.
- Generación de borradores cortos con penalización de presencia: para continuaciones de 256 tokens con `steps = gen_length`, `argmax=True` y `presence_penalty=4.0`, aceptando que los hechos pueden ser erróneos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks zero-shot (MMLU, HumanEval, GSM8K) para los modelos MDLM; el autor lo indica explícitamente. La única métrica de evaluación es el ELBO negativo sobre el canon retenido de la fase 1 (canon-8192, 8192 secuencias de 2048 tokens, 16 sorteos de máscara por secuencia).

| Metrica | Valor |
|---|---|
| ELBO negativo, canon-8192 (16 sorteos) | 2,6549 ± 0,0025 nats por token |
| ELBO negativo, estimación independiente de un sorteo con PyTorch SDPA | 2,6536 ± 0,0101 nats por token |
| Reproducibilidad | los pesos reproducen bit a bit los logits del código de entrenamiento en filas enmascaradas del canon |

Resultados de samplers reportados por el autor (celda N6-D5, 32 inicios retenidos, prompt de 32 tokens, 256 generados, una semilla):

| Sampler | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| Confianza, argmax, penalización 4 incluyendo prompt (por defecto) | 0,64 | 0,74 | 18% |
| Igual, sin penalización | 0,15 | 0,16 | 80% |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22% |

## Requisitos de hardware
- Pesos en bf16: unos 1,2 GB (el repositorio completo ocupa 1,2 GB), por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para bf16 con contexto completo de 2048 tokens; no se han publicado requisitos oficiales.
- GPU de datacenter: el entrenamiento se hizo en una NVIDIA GH200 de 120 GB; para inferencia no se necesita nada parecido.
- Despliegue: `transformers` con `trust_remote_code=True` y `dtype=torch.bfloat16`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al requerir código remoto y decodificación por difusión es probable que estos motores no lo soporten sin adaptación.
- Latencia y throughput: no disponibles. Cabe esperar un coste de `steps` pasadas hacia delante por generación (el autor recomienda `steps = gen_length`, es decir, 256 pasadas para 256 tokens), muy superior al de un modelo AR equivalente.

## Comparativa con modelos similares
No se dispone de datos de benchmarks comparables publicados para este modelo, por lo que la comparación se limita a especificaciones estructurales.

| Modelo | Parametros | Contexto | Objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| vectabass-618m-11.5bt-mdlm-cooled | 617,9M (527,7M no-embedding) | 2048 | MDLM (difusión enmascarada) | Apache 2.0 | Celda N4-D2 de una retícula de escalado; sin benchmarks zero-shot |
| Modelo AR emparejado de VectaBass (misma escalera y datos) | misma escalera, 100M–1.6B | no disponible | Autorregresivo | no disponible | Publicado por separado; el autor lo usa como referencia de fluidez |
| Qwen3-8B-Base | 8B | no disponible | Autorregresivo | no disponible | Usado por el autor solo como evaluador de bits por byte, no como alternativa de despliegue |

## Limitaciones y advertencias
- Es un modelo base: no está ajustado a instrucciones ni a seguridad, por lo que no debe usarse directamente como asistente.
- Los hechos son a menudo erróneos según el propio autor; el riesgo de alucinación es alto y no se mitiga con post-entrenamiento.
- El muestreo recomendado (confianza, argmax, penalización de presencia 4) es una heurística, no un muestreo exacto: sesga contra palabras repetidas y las listas, tablas y código, donde la repetición es correcta, no se probaron y las listas siguen repitiéndose.
- Sin penalización, el orden por confianza entra en bucles (80% de 4-gramas repetidos); con penalización 3 aún repite y con 6 pierde fluidez frente a texto real.
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR del mismo tamano del autor; temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- Usar un token por paso (`steps = gen_length`); con 4 tokens por paso la calidad cae a 0,73 bits por byte y 0,49 de bigramas distintos.
- Las métricas de samplers se obtuvieron con una sola semilla y 32 prompts, con error estándar de unos 0,06 bits por byte.
- Contexto limitado a 2048 tokens y cobertura lingüística restringida a siete idiomas; el resto no está soportado de forma declarada.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio (`modeling_vectabass.py`); conviene auditar ese archivo antes de desplegarlo.
- La licencia Apache 2.0 permite uso comercial, pero al no haber benchmarks ni evaluación de sesgos, cualquier uso en producción exige evaluación propia.
- El ELBO negativo es una cota superior de la log-verosimilitud negativa y no es directamente comparable con la entropía cruzada de un modelo AR.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-618m-11.5bt-mdlm-cooled
- Repositorio de datos (referenciado en la model card): `DATA.md` dentro del repositorio del modelo
- Dataset HuggingFaceFW/fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset HuggingFaceFW/fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset HuggingFaceTB/finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada.
