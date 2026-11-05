# VectaBass/vectabass-59m-950mt-mdlm-cooled

## Resumen

vectabass-59m-950mt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, masked diffusion language model) de 59,48 millones de parámetros totales (27,28 millones no-embedding), entrenado desde cero por el autor independiente VectaBass sobre 950 millones de tokens. Forma parte de un estudio de escalado (scaling laws) denominado "MDLM addendum" y constituye la celda N0-D1, un escalón adicional por debajo de la escalera principal de 100M a 1.6B parámetros, con el objetivo de verificar la ley de escalado a un tamaño menor con la misma receta y los mismos datos.

El modelo no está ajustado para instrucciones ni alineado en seguridad: es un modelo base concebido como artefacto de investigación. Su arquitectura reutiliza la pila tipo Llama de los modelos autorregresivos del mismo autor (con atención exclusiva XSA) pero convertida en bidireccional, con atención agrupada GQA 2:1, RMSNorm pre-norm, SwiGLU y RoPE con contexto de 2048 tokens. La generación se realiza mediante `diffusion_generate`, que rellena posiciones enmascaradas a lo largo de varios pasos hacia delante.

Es relevante ahora porque publica junto con los pesos una comparación empírica de aproximadamente 30 muestreadores sobre 32 inicios de documento, con métricas objetivas (bits por byte UTF-8, bigramas distintos, 4-gramas repetidos), y porque forma parte de una iniciativa de "IA soberana del Reino Unido" que incluye fuentes parlamentarias, del sector público británico y de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico y escocés).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención exclusiva (XSA), GQA 2:1, RMSNorm pre-norm, SwiGLU, RoPE (base 10000) |
| Parametros totales | 59.473.920 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el modelo se distribuye y se recomienda ejecutar en bfloat16) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con código de modelado personalizado (`modeling_vectabass.py`) |

Datos adicionales de arquitectura: anchura 640, 6 capas, 10 cabezas de consulta y 5 de clave-valor con dimensión 64, feed-forward SwiGLU de 1728, token de máscara con id 50283, vocabulario de 50304 filas (BPE de GPT-2 con 50257 tokens más 26 tokens especiales y relleno).

## Arquitectura y entrenamiento

El modelo es un transformer bidireccional derivado de la pila autorregresiva del autor, con atención exclusiva (XSA) y atención agrupada 2:1, adaptado al objetivo MDLM. La formulación MDLM emplea un schedule lineal alpha_t = 1 - t y una pérdida de ELBO negativo en tiempo continuo, que se materializa como entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. En inferencia, `model(ids).logits` devuelve en cada posición la distribución del token limpio, colocando el token de máscara (id 50283) donde el token es desconocido.

El entrenamiento se realizó sobre 950.009.856 tokens (35 tokens por parámetro no-embedding), con lotes de 393.216 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momento 0.95) combinado con AdamW en fp32 (0.9, 0.95), LR pico de 0.00255, calentamiento de 39M tokens, schedule constante con cooldown 1-sqrt en el último 20% y weight decay de 0.136 en matrices. Se usó precisión bf16 en pesos y activaciones con pesos maestros fp32 en el optimizador, estadísticas de normalización, ángulos RoPE y logits en fp32, todo sobre una única NVIDIA GH200 de 120 GB. Los datos provienen de la vista "phase-1-release": 47 bins de texto con licencia abierta (unos 96B tokens únicos) procedentes de FineWeb-Edu, FineWeb-2 y FineMath, con fuentes del sector público y parlamentario británico y de lenguas celtas. No se aplicó RLHF ni DPO.

## Capacidades

- Modelado de lenguaje base mediante difusión enmascarada: rellena posiciones enmascaradas de forma iterativa en lugar de generar token a token de izquierda a derecha.
- Extracción de características (`feature-extraction` como pipeline declarado) y obtención de logits por posición para el token limpio.
- Generación de texto condicionada por prompt con `diffusion_generate`, con órdenes de desenmascarado `random` (ancestral exacto) o `confidence` (estilo MaskGIT).
- Control de muestreo mediante `presence_penalty`, `t_start`, `schedule`, `ban_eot`, `gen_length`, `steps` y `seed`.
- Cobertura multilingüe limitada a siete idiomas: inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No dispone de tool calling, function calling, modo de razonamiento explícito, capacidades de agente, visión ni audio.
- No está ajustado para instrucciones ni para seguridad; no debe esperarse comportamiento de asistente.

## Casos de uso

- Investigación sobre leyes de escalado: replicar la celda N0-D1 con la misma receta y datos para contrastar la curva de escalado de MDLM en el rango de 27M parámetros no-embedding frente a los modelos de 100M a 1.6B del mismo estudio.
- Estudio comparativo difusión frente a autorregresivo: emparejar este modelo con el addendum autorregresivo del mismo autor (publicado por separado) y comparar ELBO negativo y entropía cruzada sobre el mismo canon de evaluación.
- Experimentación con muestreadores: usar los 32 inicios de documento retenidos y las métricas publicadas (bits por byte, bigramas distintos, 4-gramas repetidos) como banco de pruebas para nuevos samplers de difusión enmascarada.
- Evaluación de fluidez y repetición en modelos pequeños: medir el efecto de `presence_penalty` (el autor documenta que 3 repite, 4 es el valor probado y 6 pierde fluidez) y de `steps = gen_length` frente a varios tokens por paso.
- Procesamiento de lenguas celtas de bajos recursos: analizar la cobertura del galés, gaélico escocés, irlandés, manés, córnico y escocés en un modelo entrenado con fuentes específicas de estas lenguas, siempre como modelo base y no como generador de producción.
- Reproducibilidad bit a bit: verificar que los pesos publicados reproducen los logits del código de entrenamiento en filas enmascaradas del canon, como afirma el autor, para auditar pipelines de entrenamiento.
- Docencia y divulgación: ilustrar el funcionamiento de la difusión enmascarada en un modelo que cabe en una sola GPU de consumo y con un script de uso mínimo.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). La evaluación disponible es el ELBO negativo sobre el canon retenido phase-1-release-canon-8192 (8192 secuencias de 2048 tokens, 16 extracciones de máscara por secuencia):

| Metrica | Valor |
|---|---|
| ELBO negativo (nats por token) | 3,6095 ± 0,0026 |

Además, se publica una comparación de muestreadores sobre 32 inicios retenidos (prompt de 32 tokens, 256 tokens generados, una semilla) para la celda N6-D5, no para esta celda:

| Muestreador | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| confidence, argmax, presence penalty 4 incl. prompt | 0,64 | 0,74 | 18% |
| Igual, sin penalización | 0,15 | 0,16 | 80% |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22% |

El error estándar en bits por byte es de aproximadamente 0,06 con una semilla y 32 prompts. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para los pesos (59,48M parámetros, unos 0,12 GB), más activaciones y caché; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con soporte de bfloat16; el autor entrenó en una NVIDIA GH200 de 120 GB, pero la inferencia no requiere ese hardware.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 3090, RTX 4070, e incluso GPUs de gama baja con suficiente memoria para el contexto de 2048 tokens.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el método `diffusion_generate` del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato safetensors con código personalizado complica su uso fuera de transformers.
- Latencia y throughput: no disponibles. Nótese que `diffusion_generate` con `steps = gen_length` implica 256 pasadas hacia delante para generar 256 tokens, un coste muy superior al de un modelo autorregresivo equivalente.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-59m-950mt-mdlm-cooled | 59,48M (27,28M no-embedding) | 2048 | Difusión enmascarada (MDLM) | apache-2.0 | HuggingFace |
| Addendum autorregresivo de VectaBass (misma celda) | no disponible en la informacion proporcionada | no disponible | Autorregresivo | no disponible | Publicado por separado según el autor |
| Celdas MDLM de 100M a 1.6B del mismo estudio | 100M a 1.6B | no disponible | Difusión enmascarada (MDLM) | no disponible | Referenciadas en el estudio |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada; la comparación directa solo es posible mediante el ELBO negativo frente a la entropía cruzada del modelo autorregresivo sobre el mismo canon, y el propio autor advierte que es una cota, no una medida equivalente.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones ni de seguridad: no es adecuado como asistente conversacional ni para uso directo en producción.
- El autor advierte que los hechos son a menudo incorrectos; el riesgo de alucinación es alto y no se mitiga con alineamiento.
- El muestreador por confianza sin penalización entra en bucles de repetición (80% de 4-gramas repetidos); la penalización de presencia 4 es una heurística sesgada contra palabras repetidas y no se probó en listas, tablas ni código, donde la repetición es correcta; las listas siguen repitiéndose.
- El muestreo ancestral exacto es mucho menos fluido que el modelo autorregresivo del mismo tamaño; temperatura, top-k, top-p y min-p intercambian fluidez por diversidad sin alcanzar texto real.
- Contexto limitado a 2048 tokens y cobertura lingüística restringida a siete idiomas, con sesgos desconocidos derivados de las fuentes de datos (sector público y parlamentario británico y lenguas celtas).
- La evaluación se basa en una sola semilla y 32 prompts, con errores estándar de unos 0,06 bits por byte; la generalización de los resultados es limitada.
- Licencia apache-2.0, que permite uso comercial, pero el modelo no está pensado ni validado para ello; el uso de `trust_remote_code=True` implica ejecutar código del repositorio y debe auditarse antes de desplegarlo.
- Coste computacional de inferencia elevado: una pasada hacia delante por token generado en la configuración recomendada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-59m-950mt-mdlm-cooled
- Documentación de datos del autor: `DATA.md` en el repositorio del modelo (no se dispone de URL directa en la información proporcionada)
- Paper MDLM referenciado por el autor: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
