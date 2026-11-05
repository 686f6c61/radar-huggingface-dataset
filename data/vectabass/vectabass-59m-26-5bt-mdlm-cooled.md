# VectaBass/vectabass-59m-26.5bt-mdlm-cooled

## Resumen

vectabass-59m-26.5bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, *masked diffusion language model*) de 59,48 millones de parámetros totales (27,28 millones no correspondientes a embeddings), entrenado desde cero sobre 26.470 millones de tokens. Lo desarrolla el autor independiente VectaBass dentro de un estudio de escalado (*scaling laws*) orientado a IA soberana del Reino Unido, y constituye la celda N0-D5 del apéndice MDLM de la fase 1: un peldaño adicional por debajo de la escalera principal del proyecto (que va de 100M a 1,6B de parámetros) para comprobar si la ley de escalado se mantiene en tamaños menores.

El modelo no es un generador autoregresivo al uso: emplea una pila tipo Llama con atención exclusiva auto-atencional (XSA) convertida en bidireccional, y genera texto rellenando posiciones enmascaradas mediante un proceso de difusión de tiempo continuo. Esto lo hace relevante para investigadores interesados en alternativas a la generación token a token, en la dinámica de muestreo de modelos de difusión y en estudios de escalado con presupuestos de cómputo reducidos.

Se distribuye como modelo base, sin ajuste por instrucciones ni por seguridad, con licencia Apache 2.0 y pesos en safetensors. Su ventana de contexto es de 2048 tokens y su vocabulario es el BPE de GPT-2 ampliado con 26 tokens especiales. Está pensado para experimentación e investigación, no para despliegue en producción orientado a usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención exclusiva auto-atencional (XSA), objetivo de difusión enmascarada (MDLM) |
| Parametros totales | 59.473.920 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (RoPE, base 10000) |
| Tipos de cuantizacion | no disponible (el autor recomienda ejecutar en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código de modelado propio (`modeling_vectabass.py`) |

Especificaciones adicionales del modelo:

| Parametro | Valor |
|---|---|
| Parametros no-embedding | 27.279.360 |
| Anchura / capas | 640 / 6 |
| Cabeceras | 10 de consulta, 5 de clave-valor, dimensión 64 (GQA 2:1) |
| Feed-forward | SwiGLU, dimensión 1728 |
| Normalización | RMSNorm, pre-norm |
| Token de máscara | id 50283 |
| Vocabulario | 50.304 filas: BPE de GPT-2 (50.257) + 26 tokens especiales + relleno |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La red es la misma pila tipo Llama que usan los modelos autoregresivos del proyecto, con atención exclusiva auto-atencional (XSA) y atención de consultas agrupadas (GQA) con proporción 2:1, pero convertida en bidireccional. Sobre esa pila se aplica el objetivo MDLM: un proceso de difusión de tiempo continuo con `alpha_t = 1 - t`, cuya pérdida es el ELBO negativo en tiempo continuo, equivalente a una entropía cruzada enmascarada ponderada por `1/t` sobre todas las posiciones. El modelo aprende, en cada posición, la distribución del token limpio dado el contexto enmascarado.

El entrenamiento consumió 26.465.009.664 tokens (970 tokens por parámetro no-embedding), con lotes de 393.216 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momento 0.95) combinado con AdamW en fp32 (0.9, 0.95), LR máximo de 0.00255, calentamiento de 39 millones de tokens, decaimiento de pesos de 0.136 sobre matrices y una planificación de warmup, fase constante y *cooldown* 1-sqrt hasta cero en el último 20 %. Se entrenó en precisión bf16 con pesos maestros en fp32, estadísticas de normalización, ángulos RoPE y logits en fp32, sobre 2 GPUs NVIDIA GH200 de 120 GB.

Los datos provienen de la vista de la fase 1 de publicación: 47 contenedores (*bins*) de texto con licencia abierta, unos 96.000 millones de tokens únicos, con fuentes del sector público británico, parlamentarias y de lenguas celtas, además de fineweb-edu, fineweb-2 y finemath. El detalle de cada contenedor, su proporción y su licencia está en el archivo `DATA.md` del repositorio.

## Capacidades

- Generación de texto mediante relleno iterativo de posiciones enmascaradas (no autoregresiva), con `diffusion_generate` y control del orden de desenmascarado (`random` o `confidence`).
- Modelado de la distribución del token limpio en cada posición a través de `model(ids).logits`, útil para extracción de características y análisis probabilístico.
- Razonamiento y generación de texto en inglés y en varias lenguas celtas: galés (cy), gaélico escocés (gd), irlandés (ga), manés (gv), córnico (kw) y escocés (sco).
- Muestreo configurable con penalización de presencia, planificación lineal y control del número de pasos y semilla.
- No dispone de soporte documentado de *tool calling* ni de *function calling*.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- No dispone de modo de pensamiento (*thinking*), visión ni audio.
- No está ajustado por instrucciones ni por seguridad: es un modelo base.

## Casos de uso

- Investigación en leyes de escalado: el modelo sirve como peldaño de 27,3M de parámetros no-embedding para verificar si la relación entre pérdida y cómputo se mantiene por debajo de la escalera principal de 100M a 1,6B, comparando su ELBO negativo con el de modelos autoregresivos del mismo tamaño.
- Estudio de muestreadores en difusión: con unos 30 muestreadores comparados por el autor, permite reproducir experimentos sobre orden de desenmascarado, penalización de presencia y pasos por iteración, y medir fluidez en bits por byte UTF-8.
- Extracción de características y análisis probabilístico: al exponer `logits` por posición con contexto bidireccional, resulta adecuado para tareas de *feature-extraction* y para estudiar distribuciones condicionales en texto enmascarado.
- Evaluación de cobertura lingüística en lenguas celtas: al haberse entrenado con fuentes en galés, gaélico escocés, irlandés, manés, córnico y escocés, permite analizar el comportamiento de un modelo de difusión en lenguas de bajos recursos.
- Docencia y divulgación sobre modelos de difusión: su tamaño reducido (0,1 GB de repositorio) permite ejecutarlo en un portátil con GPU de consumo y mostrar el proceso de relleno de máscaras paso a paso.
- Reproducibilidad de experimentos: el autor indica que los pesos reproducen bit a bit los logits del código de entrenamiento en filas enmascaradas del corpus de validación, lo que facilita la verificación independiente de resultados.
- Análisis de fluidez y repetición: útil para estudiar el compromiso entre diversidad y coherencia en generación no autoregresiva, midiendo bigramas distintos y 4-gramas repetidos.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). La evaluación disponible es el ELBO negativo sobre el corpus de validación propio (phase-1-release canon-8192, 8192 secuencias de 2048 tokens, 16 extracciones de máscara por secuencia):

| Metrica | Resultado |
|---|---|
| ELBO negativo (nats por token) | 3,0764 ± 0,0025 |

Además, el autor compara muestreadores sobre 32 inicios de documento reservados (prompt de 32 tokens, 256 tokens generados, una semilla), evaluados con Qwen3-8B-Base en bits por byte UTF-8. Los números corresponden a la celda N6-D5, no a este modelo:

| Muestreador | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7 % |
| confidence, argmax, penalización 4 (recomendado) | 0,64 | 0,74 | 18 % |
| Igual, sin penalización | 0,15 | 0,16 | 80 % |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22 % |

El error estándar de bits por byte es de aproximadamente 0,06 con una sola semilla y 32 prompts.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16 (59,5M de parámetros), más el espacio del búfer de generación y del tokenizador.
- GPU recomendadas: cualquier GPU con soporte de bf16; el modelo se entrenó en 2 x NVIDIA GH200 de 120 GB, pero la inferencia cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, e incluso en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el método `diffusion_generate` incluido en el repositorio. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que el objetivo de difusión no encaja en los motores de decodificación autoregresiva habituales.
- Latencia y throughput: no disponibles. El coste de generación escala con `steps`, y el autor recomienda un token por paso (`steps = gen_length`), lo que implica 256 pasadas hacia delante para generar 256 tokens.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados para este modelo ni para las alternativas de su misma categoría. La comparación se limita a características estructurales:

| Modelo | Parametros totales | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-59m-26.5bt-mdlm-cooled | 59,5M (27,3M no-embedding) | 2048 | Difusión enmascarada (MDLM) | Apache 2.0 | HuggingFace |
| Modelo AR equivalente del proyecto VectaBass | no disponible | no disponible | Autoregresivo | no disponible | Apéndice AR publicado por separado |
| Modelos del tramo principal del proyecto (100M–1,6B) | 100M–1,6B | no disponible | MDLM | no disponible | no disponible |
| Qwen3-8B-Base (usado como evaluador) | 8B | no disponible | Autoregresivo | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni por seguridad; no debe usarse como asistente conversacional sin un ajuste posterior.
- El autor advierte explícitamente de que los hechos generados son a menudo incorrectos, con un riesgo alto de alucinación.
- El muestreo por confianza sin penalización de presencia entra en bucles de repetición; la penalización 4 es una heurística probada, no un muestreo exacto, y sesga contra palabras repetidas.
- Listas, tablas y código, donde la repetición es correcta, no se probaron y las listas siguen repitiéndose.
- Mantener un token por paso (`steps = gen_length`); usar 4 tokens por paso degrada la calidad (0,73 bits por byte, bigramas distintos 0,49).
- El muestreo ancestral exacto es mucho menos fluido que el modelo autoregresivo del mismo tamaño; temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- La ventana de contexto está limitada a 2048 tokens.
- La cobertura lingüística se concentra en inglés y lenguas celtas; no hay datos sobre otros idiomas.
- Los resultados de evaluación proceden de una sola semilla y 32 prompts, con errores estándar de aproximadamente 0,06 bits por byte.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-59m-26.5bt-mdlm-cooled
- Conjunto de datos fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Conjunto de datos fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Conjunto de datos finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Documentación de datos del proyecto (`DATA.md`): incluida en el repositorio del modelo
- Código de modelado (`modeling_vectabass.py`): incluido en el repositorio del modelo
- Paper, blog, repositorio de código y demos adicionales: no disponibles en la información proporcionada
