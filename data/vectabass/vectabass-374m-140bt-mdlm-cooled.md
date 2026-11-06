# VectaBass/vectabass-374m-140bt-mdlm-cooled

## Resumen

vectabass-374m-140bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, *masked diffusion language model*) de 374 millones de parámetros totales (303,1 millones sin contar embeddings), desarrollado por VectaBass y entrenado desde cero sobre 139.680 millones de tokens. Forma parte de la "MDLM square" de la fase 1: una escalera de modelos de 100M a 1.600M de parámetros no-embedding, cada tamaño entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar empíricamente la ley de escala. Existe un cuadrado autorregresivo (AR) equivalente, entrenado con los mismos datos y la misma escalera, publicado por separado.

La arquitectura no es un transformer autorregresivo al uso, sino una pila tipo Llama (RMSNorm pre-norm, SwiGLU, RoPE, GQA 2:1) con self-attention exclusiva (XSA) convertida en bidireccional, y un objetivo de difusión de tiempo continuo (ELBO negativo ponderado por 1/t). El modelo genera texto rellenando posiciones enmascaradas de forma iterativa, no token a token de izquierda a derecha. Su contexto es de 2.048 tokens y su vocabulario es GPT-2 BPE ampliado a 50.304 filas.

Es relevante por tres motivos: es un artefacto de investigación sobre leyes de escala en modelos de difusión, incluye fuentes de texto del sector público británico y de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico, escocés), y publica un análisis empírico de unos 30 muestreadores. No es un modelo instruct-tuned ni safety-tuned: es una base para estudio, no para producción conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama bidireccional con self-attention exclusiva (XSA) y objetivo MDLM (difusión enmascarada) |
| Parámetros totales | 373.942.272 (embeddings atados) |
| Parámetros activos | No aplica (no es MoE) |
| Parámetros no-embedding | 303.114.240 |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible (el autor recomienda ejecutar en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,7 GB), código custom en `modeling_vectabass.py` |
| Anchura / capas | 1.408 / 13 |
| Cabezas | 22 query, 11 key-value, dimensión 64 (GQA 2:1) |
| Feed-forward | SwiGLU, dimensión 4.112 |
| Normalización | RMSNorm, pre-norm |
| Posiciones | RoPE, base 10.000 |
| Token de máscara | id 50283 |
| Vocabulario | 50.304 filas: GPT-2 BPE (50.257) + 26 tokens especiales, resto padding |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo reutiliza la pila de los modelos AR de la misma familia (Llama-like: RMSNorm pre-norm, SwiGLU de dimensión 4.112, RoPE base 10.000, GQA con 22 cabezas query y 11 key-value de dimensión 64) pero sustituye la atención causal por atención bidireccional con self-attention exclusiva (XSA). El objetivo es MDLM con un schedule lineal alpha_t = 1 - t: la pérdida es el ELBO negativo en tiempo continuo, es decir, una entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. En inferencia, `model(ids).logits` devuelve en cada posición la distribución del token limpio; las posiciones desconocidas se rellenan con el token de máscara 50283 y `diffusion_generate` las va desenmascarando a lo largo de `steps` pasadas hacia delante.

El entrenamiento consumió 139.682.250.752 tokens (461 tokens por parámetro no-embedding), con un batch de 622.592 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) combinado con AdamW fp32 (0.9, 0.95), pico de learning rate 0.00124, warmup de 303M tokens y schedule warmup-constant seguido de un cooldown 1-sqrt hasta cero en el último 20%. El weight decay fue 0.0842 sobre matrices. Se entrenó en bf16 con pesos maestros fp32, estadísticas de norma, ángulos RoPE y logits en fp32, sobre 2 x NVIDIA GH200 de 120 GB. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta (unos 96.000 millones de tokens únicos) de FineWeb-Edu, FineWeb-2 y FineMath, con fuentes del sector público británico, parlamentarias y de lenguas celtas; el desglose por bin, cuota y licencia está en `DATA.md`.

## Capacidades

- Modelado de lenguaje base mediante difusión enmascarada: relleno iterativo de posiciones, no generación autorregresiva.
- Extracción de características y logits por posición (pipeline `feature-extraction`).
- Dos modos de desenmascarado: `order="random"` (proceso inverso exacto para el que fue entrenado) y `order="confidence"` (estilo MaskGIT, compromete primero las posiciones más seguras).
- Generación condicionada por prompt con `diffusion_generate`, incluyendo control de longitud (`gen_length`), pasos (`steps`), schedule (`linear`), semilla y penalización de presencia.
- Cobertura multilingüe limitada a inglés y seis lenguas celtas/germánicas insulares: galés (cy), gaélico escocés (gd), irlandés (ga), manés (gv), córnico (kw) y escocés (sco).
- No dispone de tool calling, function calling, modo thinking, visión, audio ni capacidades de agente; no está instruction-tuned ni safety-tuned.

## Casos de uso

- Investigación sobre leyes de escala en modelos de difusión: el modelo es una celda (N3-D5) de una escalera de 100M a 1.6B parámetros no-embedding con varios presupuestos de tokens; se usa para ajustar y validar curvas de pérdida frente al cuadrado AR equivalente entrenado con los mismos datos.
- Estudio comparativo de objetivos de entrenamiento: permite contrastar el ELBO negativo de un MDLM (2,4322 ± 0,0028 nats/token en el canon phase-1-release) con la entropía cruzada de un AR del mismo tamaño sobre el mismo corpus, como cota superior y no como medida equivalente.
- Evaluación de muestreadores: con `diffusion_generate` se pueden reproducir los experimentos del autor con unos 30 samplers sobre arranques de documento de 32 tokens y 256 tokens generados, midiendo bits por byte UTF-8, bigramas distintos y 4-gramas repetidos.
- Experimentos de relleno de huecos (infilling) en texto: al ser un modelo enmascarado bidireccional, se puede enmascarar un tramo interno de un documento y pedir al modelo que lo reconstruya, una tarea para la que un AR causal no está entrenado de forma nativa.
- Procesamiento de lenguas celtas con recursos limitados: el corpus incluye fuentes en galés, gaélico escocés, irlandés, manés, córnico y escocés, lo que permite estudiar el comportamiento de un MDLM en lenguas de bajos recursos dentro de un contexto de 2.048 tokens.
- Docencia y reproducción de resultados: al ser un checkpoint pequeño (0,7 GB) con código custom y receta de entrenamiento documentada, sirve para reproducir bit a bit los logits del código de entrenamiento en filas enmascaradas del canon y para prácticas sobre modelos de difusión de texto.
- Análisis de sesgos y fluidez en generación no autorregresiva: útil para medir bucles de repetición, colapso de diversidad y el efecto de la penalización de presencia (el autor documenta que sin penalización la ordenación por confianza entra en bucle y que penalización 3 aún repite y 6 es menos fluida que texto real).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks zero-shot para los modelos MDLM de esta familia; el autor lo indica explícitamente. La única métrica de evaluación publicada es el ELBO negativo en el canon interno phase-1-release (8.192 secuencias de 2.048 tokens, 16 sorteos de máscara por secuencia):

| Métrica | Valor |
|---|---|
| ELBO negativo, canon phase-1-release (16 sorteos) | 2,4322 ± 0,0028 nats por token (± 1 error estándar) |
| ELBO negativo, estimación independiente de un sorteo bajo PyTorch SDPA | 2,4272 ± 0,0100 nats por token |
| MMLU / HumanEval / GSM8K | No medidos |

Resultados del análisis de muestreadores del autor (celda N6-D5, 32 arranques de documento retenidos, prompt de 32 tokens, 256 tokens generados, una semilla):

| Muestreador | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| confidence, argmax, penalización de presencia 4 incl. prompt | 0,64 | 0,74 | 18% |
| Igual, sin penalización | 0,15 | 0,16 | 80% |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22% |

El error estándar en bits por byte es de aproximadamente 0,06 con una semilla y 32 prompts. Cuatro tokens por paso (en lugar de uno) degrada a 0,73 bits por byte y 0,49 de bigramas distintos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,75 GB solo para pesos (373,9M parámetros x 2 bytes), más activaciones y caché; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: el entrenamiento usó 2 x NVIDIA GH200 de 120 GB, pero para inferencia basta una RTX 3060, RTX 4060, RTX 4090 o cualquier GPU con soporte bf16. También es viable en CPU para pruebas puntuales.
- Cabe en GPU consumer: sí, en todas las gamas actuales con al menos 4 GB de VRAM en bf16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (carga `modeling_vectabass.py`); el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el pipeline declarado es `feature-extraction`, no `text-generation`.
- Latencia y throughput: no disponibles. Nótese que `diffusion_generate` requiere `steps` pasadas hacia delante completas (el autor recomienda `steps = gen_length`, un token por paso), por lo que el coste por token generado es muy superior al de un AR del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-374m-140bt-mdlm-cooled | 373,9M totales / 303,1M no-embedding | 2.048 | MDLM (difusión enmascarada) | Apache 2.0 | Hugging Face, código custom |
| Cuadrado AR de VectaBass (misma escalera y datos) | Escalera 100M-1.6B no-embedding | No disponible | Autorregresivo causal | No disponible en la información | Publicado por separado según el autor |
| Otros modelos MDLM de la misma escalera (celdas N1-N6) | 100M-1.6B no-embedding | 2.048 (presumible, misma familia) | MDLM | Apache 2.0 (presumible, misma familia) | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de terceros de tamaño similar (por ejemplo, GPT-2 small/medium o Llama de 300M-400M), por lo que la comparación de rendimiento queda limitada al ELBO interno y a las métricas de fluidez del análisis de muestreadores.

## Limitaciones y advertencias

- Modelo base sin instruction tuning ni safety tuning: no sigue instrucciones de forma fiable y no incorpora filtros de seguridad.
- Los hechos generados son a menudo incorrectos, según advierte el propio autor.
- El muestreador por confianza sin penalización de presencia entra en bucles de repetición (80% de 4-gramas repetidos, 0,16 de bigramas distintos); la penalización 4 es una heurística probada, no un muestreo exacto, y sesga contra palabras repetidas.
- Las listas, tablas y código, donde la repetición es correcta, no fueron evaluados y las listas siguen repitiéndose.
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR del mismo tamaño; temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida a inglés y seis lenguas celtas/insulares; no hay soporte declarado de castellano.
- Los benchmarks zero-shot no están medidos, por lo que no hay evidencia pública de rendimiento en MMLU, HumanEval, GSM8K ni tareas estándar.
- Las estimaciones de fluidez se basan en una sola semilla y 32 prompts, con errores estándar de unos 0,06 bits por byte.
- El ELBO negativo es una cota superior de la log-verosimilitud negativa y no es directamente comparable con la entropía cruzada de un modelo AR.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo en entornos sensibles.
- Licencia Apache 2.0 permite uso comercial, pero al no estar alineado ni evaluado, no es apto para producción orientada a usuario final sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-374m-140bt-mdlm-cooled
- Documentación de datos del autor: `DATA.md` en el repositorio del modelo
- Código de modelado custom: `modeling_vectabass.py` en el repositorio del modelo
- Paper, blog o repositorio de la familia VectaBass: no disponible en la información proporcionada
- Demo o space: no disponible en la información proporcionada
