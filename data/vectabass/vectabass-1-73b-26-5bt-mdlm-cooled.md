# VectaBass/vectabass-1.73b-26.5bt-mdlm-cooled

## Resumen

vectabass-1.73b-26.5bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, masked diffusion language model) de 1.729 millones de parámetros totales (1.600 millones sin contar embeddings), desarrollado por VectaBass. Forma parte de la "celda N6-D3" de un estudio de leyes de escala (scaling laws) que abarca una escalera de modelos de 100M a 1.6B de parámetros no-embedding, cada uno entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar la ley de escala. Existe un cuadrado autorregresivo (AR) equivalente, entrenado con los mismos datos y la misma escalera, que se publica por separado.

El modelo se entrena desde cero con 26.465.402.880 tokens (17 tokens por parámetro no-embedding) sobre una mezcla de datos abiertos con fuentes del sector público británico, parlamentarias y de lenguas celtas. La red es una pila tipo Llama con atención exclusiva auto-atencional (XSA), GQA 2:1 y posiciones RoPE, convertida en bidireccional para el objetivo de difusión. El token de máscara es el id 50283 y la generación se realiza rellenando máscaras a lo largo de varios pasos de forward.

Es relevante ahora porque es un modelo base de investigación, no un asistente: no está ajustado por instrucciones ni por seguridad, y su interés reside en el estudio de escalado y en la comparación con su contraparte autorregresiva. La licencia Apache 2.0 y el soporte de siete idiomas (inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés) lo orientan a experimentación e investigación más que a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención exclusiva (XSA), GQA 2:1, adaptado a difusión enmascarada (MDLM) |
| Parametros totales | 1.729.167.360 (embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (RoPE, base 10000) |
| Tipos de cuantizacion | No disponible (entrenado y publicado en bf16; no se documentan cuantizaciones) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura es la pila de los modelos AR del mismo autor (tipo Llama) con atención exclusiva auto-atencional (XSA), pero con atención bidireccional para permitir el objetivo de difusión. Tiene anchura 2560, 22 capas, 40 cabezas de consulta y 20 de clave-valor con dimensión 64, feed-forward SwiGLU de 6912, RMSNorm con pre-norm y RoPE de base 10000 con contexto de 2048. El vocabulario es GPT-2 BPE (50257) más 26 tokens especiales, con filas de relleno hasta 50304; el token de máscara es el 50283.

El objetivo es MDLM con alpha_t lineal (1 - t) y pérdida de ELBO negativo en tiempo continuo (entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones). Se entrenó con 26.465.402.880 tokens, lotes de 983.040 tokens, optimizador Muon (matrices ocultas, NS 5, Moonlight RMS 0.2, momento 0.95) más AdamW en fp32, LR pico de 0.000751, warmup de 1600M tokens y un cooldown 1-sqrt en el último 20 %. Los pesos y activaciones van en bf16 con pesos maestros en fp32; las estadísticas de normalización, los ángulos RoPE y los logits se calculan en fp32. El entrenamiento se realizó en 2 x NVIDIA GH200 de 120 GB. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96B de tokens únicos, con fuentes del sector público británico, parlamentarias y de lenguas celtas.

## Capacidades

- Generación de texto mediante difusión enmascarada: rellena posiciones enmascaradas con `diffusion_generate`, con orden aleatorio o por confianza (estilo MaskGIT).
- Extracción de características: el pipeline declarado es `feature-extraction`; `model(ids).logits` devuelve en cada posición la distribución del token limpio.
- Razonamiento y conocimiento factual limitados: es un modelo base sin ajuste por instrucciones; los hechos suelen ser incorrectos según la propia model card.
- Multilingüismo restringido a siete idiomas: inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No soporta tool calling ni function calling de forma nativa (no documentado).
- No soporta agentes ni razonamiento multi-paso de forma nativa (no documentado).
- No dispone de modo thinking, visión ni audio.
- El muestreo recomendado es `order='confidence'`, `argmax=True`, `presence_penalty=4.0` y un token por paso (`steps = gen_length`).

## Casos de uso

- Investigación en leyes de escala: sirve como celda de una escalera de modelos de 100M a 1.6B de parámetros no-embedding para verificar empíricamente la ley de escala frente a la contraparte autorregresiva entrenada con los mismos datos.
- Estudio de modelos de difusión para lenguaje: permite comparar el ELBO negativo (2.3960 ± 0.0027 nats por token en el canon de validación) con la entropía cruzada de modelos AR del mismo tamaño.
- Experimentación con lenguas celtas: al incluir cy, gd, ga, gv, kw y sco en el entrenamiento, es útil para analizar el comportamiento de modelos de difusión en lenguas de bajos recursos.
- Extracción de representaciones: el pipeline `feature-extraction` permite usar las activaciones internas para tareas de análisis lingüístico o clustering de textos.
- Reproducción de experimentos de muestreo: la model card documenta unos 30 samplers evaluados, lo que permite reproducir y extender el análisis de estrategias de decodificación en MDLM.
- Análisis de sesgos y alucinación en modelos base: al no estar ajustado por seguridad, sirve para estudiar el comportamiento crudo de un modelo entrenado solo con el objetivo de modelado.
- Prototipado de generación con relleno de máscaras: útil para tareas de infilling controlado donde se conoce parte del texto y se quiere completar el resto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks zero-shot para los modelos MDLM según la model card. La única métrica de evaluación disponible es el ELBO negativo en el canon de validación phase-1-release canon-8192 (8192 x 2048 tokens), con 16 extracciones de máscara por secuencia:

| Metrica | Valor |
|---|---|
| ELBO negativo (canon-8192, 16 draws) | 2.3960 ± 0.0027 nats por token |
| ELBO negativo (estimacion independiente, SDPA, 1 draw) | 2.3952 ± 0.0099 |

La model card advierte que el ELBO negativo es una cota superior de la log-verosimilitud negativa y solo puede compararse con la entropía cruzada de un modelo AR como cota, no como medida equivalente. En cuanto al muestreo, se compararon unos 30 samplers sobre 32 inicios de documento reservados (prompt de 32 tokens, 256 tokens generados, una semilla), con resultados para la celda N6-D5:

| Sampler | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0.66 | 0.80 | 7% |
| confidence, argmax, penalización 4 (por defecto) | 0.64 | 0.74 | 18% |
| Igual, sin penalización | 0.15 | 0.16 | 80% |
| Orden aleatorio, muestreo ancestral exacto | 1.39 | 0.66 | 22% |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3.5 GB de pesos, más overhead de activaciones y caché; el repo ocupa 3.5 GB.
- GPU recomendadas: el entrenamiento se hizo en 2 x NVIDIA GH200 de 120 GB; para inferencia basta una GPU con al menos 8 GB de VRAM en bf16.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: transformers con `trust_remote_code=True` (carga `modeling_vectabass.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generación requiere `steps` pasadas de forward (una por token con la configuración recomendada), lo que implica un coste mayor que la decodificación autorregresiva token a token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-1.73b-26.5bt-mdlm-cooled | 1.729M totales (1.600M no-embedding) | 2048 | MDLM (difusión enmascarada) | Apache 2.0 | Hugging Face |
| Contraparte AR del mismo autor (cuadrado AR) | Escalera equivalente de 100M a 1.6B | No disponible | Autorregresivo | No disponible | Publicado por separado |
| Modelos AR tipo Llama de ~1.7B | ~1.7B | Variable | Autorregresivo | Variable | Amplia disponibilidad |

La model card no proporciona una comparativa directa con modelos de terceros; la comparación natural es con la contraparte autorregresiva del mismo autor, entrenada con los mismos datos y la misma escalera, cuyos resultados no se detallan en la información disponible.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni por seguridad; no debe usarse como asistente sin ajuste adicional.
- Los hechos suelen ser incorrectos según la propia model card.
- El muestreo por confianza sin penalización entra en bucles; con penalización 3 todavía repite y con 6 es menos fluido que el texto real. La penalización 4 es un heurístico, no un muestreo exacto, y sesga contra palabras repetidas; las listas, tablas y código no se probaron y las listas todavía se repiten.
- Mantener un token por paso es necesario: 4 tokens por paso degrada la calidad (0.73 bits por byte, bigramas distintos 0.49).
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR del mismo tamaño; temperatura, top-k, top-p y min-p no alcanzan la fluidez del texto real.
- Los resultados de muestreo se basan en una sola semilla y 32 prompts, con errores estándar de unos 0.06 bits por byte.
- Contexto limitado a 2048 tokens.
- Cobertura lingüística restringida a siete idiomas, con sesgo hacia el inglés y lenguas celtas.
- No se han medido benchmarks zero-shot, por lo que no hay evidencia de rendimiento en tareas estándar.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción.

## Enlaces

- Hugging Face: https://huggingface.co/VectaBass/vectabass-1.73b-26.5bt-mdlm-cooled
- Repositorio de datos (referencia `DATA.md`): no disponible como enlace directo en la información proporcionada
- Paper o blog del estudio de escalado: no disponible
- Repositorio de código: no disponible
- Demos: no disponible
