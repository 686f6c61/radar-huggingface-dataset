# VectaBass/vectabass-374m-60.8bt-mdlm-cooled

## Resumen

vectabass-374m-60.8bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, masked diffusion language model) de 374 millones de parámetros totales (303,1 millones sin contar embeddings), desarrollado por el autor independiente VectaBass. Forma parte de un estudio de leyes de escala ("MDLM square") que cubre una escalera de modelos de 100M a 1.6B de parámetros no-embedding, cada uno entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar empíricamente la ley de escala. Esta celda concreta corresponde al punto N3-D4: 303,1M de parámetros no-embedding entrenados sobre 60.800 millones de tokens.

El modelo se entrena desde cero con el objetivo MDLM (ELBO negativo en tiempo continuo), no es autorregresivo y no está ajustado por instrucciones ni por seguridad. Su interés es doble: por un lado, sirve como pieza de un conjunto experimental para comparar difusión frente a autorregresión bajo idéntico cómputo y datos; por otro, su carácter "cooled" (con un decaimiento de learning rate tipo 1-sqrt al final del entrenamiento) lo convierte en un checkpoint listo para evaluación de log-verosimilitud y de generación por difusión.

El contexto es de 2048 tokens, la arquitectura es un transformer tipo Llama con atención bidireccional y XSA, y los idiomas declarados son inglés y varias lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) más el escocés, en línea con el enfoque de "UK sovereign AI" del autor. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención exclusiva (XSA), GQA 2:1, pre-norm RMSNorm, SwiGLU, RoPE |
| Parametros totales | 373.942.272 (embeddings atados) |
| Parametros activos | No aplica (no es MoE); 303.114.240 parámetros no-embedding |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (entrenado y publicado en bf16; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `trust_remote_code` para `modeling_vectabass.py`) |

## Arquitectura y entrenamiento

La red es el mismo stack tipo Llama de los modelos autorregresivos del autor, pero convertido en bidireccional mediante atención exclusiva (XSA). Tiene anchura 1408, 13 capas, 22 cabezas de consulta y 11 de clave-valor (GQA 2:1) con dimensión 64, feed-forward SwiGLU de 4112, RMSNorm pre-norm y RoPE con base 10000 y contexto de 2048. El vocabulario es GPT-2 BPE (50257) más 26 tokens especiales, con 50304 filas en total; el token de máscara es el id 50283.

El entrenamiento usa el objetivo MDLM con alpha_t lineal (1 - t) y pérdida ELBO negativa en tiempo continuo, ponderada por 1/t sobre todas las posiciones. Se entrenó sobre 60.800.466.944 tokens (201 tokens por parámetro no-embedding), con lotes de 622.592 tokens, optimizador Muon (NS 5, Moonlight RMS 0.2, momentum 0.95) para matrices ocultas más AdamW fp32 (0.9, 0.95), LR máximo de 0.00124, warmup de 303M tokens y schedule warmup-constante con decaimiento 1-sqrt hasta cero en el último 20% del entrenamiento. El weight decay es 0.0842 sobre matrices. Se usó precisión bf16 en pesos y activaciones, con pesos maestros fp32 en el optimizador y estadísticas fp32 para normas, ángulos RoPE y logits. Todo el entrenamiento se ejecutó en una única NVIDIA GH200 de 120 GB.

Los datos provienen de la "phase-1-release view": 47 bins de texto con licencia abierta, unos 96B de tokens únicos, con fuentes del sector público británico, parlamentarias y de lenguas celtas, además de fineweb-edu, fineweb-2 y finemath. El detalle de cada bin, su proporción y licencia está en `DATA.md`.

## Capacidades

- Modelado de lenguaje por difusión enmascarada: rellena tokens enmascarados de forma iterativa, no genera de izquierda a derecha.
- Extracción de características y cálculo de log-verosimilitud (ELBO negativo) sobre secuencias con máscaras.
- Generación condicionada por prompt mediante `diffusion_generate`, con orden de desenmascarado aleatorio o por confianza (estilo MaskGIT).
- Soporte de penalización de presencia configurable para evitar bucles de repetición en la decodificación.
- Cobertura multilingüe limitada a inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- No está ajustado por instrucciones ni por seguridad: es un modelo base de estudio.

## Casos de uso

- Estudio de leyes de escala: comparar la ELBO negativa de esta celda con la entropía cruzada de un modelo autorregresivo del mismo tamaño y datos para validar la ley de escala de difusión frente a autorregresión.
- Investigación en decodificación por difusión: evaluar distintos samplers (orden aleatorio, orden por confianza, número de tokens por paso) sobre el mismo checkpoint y medir fluidez con bits por byte o diversidad de n-gramas.
- Relleno de texto enmascarado (infilling): dado un documento con huecos, el modelo puede rellenar posiciones desconocidas usando el contexto bidireccional, útil en tareas de restauración o aumento de datos.
- Extracción de características para clasificación o clustering: usar `model(ids).logits` o estados internos como representaciones de texto en inglés y lenguas celtas.
- Evaluación de cobertura lingüística en lenguas minoritarias: probar la calidad del modelado en galés, gaélico, irlandés, manés, córnico y escocés, dado el sesgo del corpus hacia fuentes públicas británicas.
- Reproducción de experimentos: el repositorio incluye el código de modelado y los pesos reproducen bit a bit los logits del código de entrenamiento sobre filas enmascaradas del canon, lo que facilita la verificación independiente.
- Generación de continuaciones cortas para análisis cualitativo: con prompt de 32 tokens y 256 tokens generados, útil para estudiar el comportamiento de la difusión en textos de dominio público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks zero-shot para los modelos MDLM; el autor lo indica explícitamente. La única métrica publicada es la ELBO negativa sobre el canon de validación phase-1-release (8192 secuencias de 2048 tokens, 16 máscaras por secuencia): 2,4922 ± 0,0025 nats por token (± un error estándar). Una estimación independiente con una sola máscara bajo PyTorch SDPA da 2,4907 ± 0,0100.

El autor también publica una comparación de samplers medida en la celda N6-D5 (no en esta), sobre 32 inicios de documento retenidos, con prompt de 32 tokens y 256 generados:

| Sampler | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| Confianza, argmax, penalización 4 (incluye prompt) | 0,64 | 0,74 | 18% |
| Igual, sin penalización | 0,15 | 0,16 | 80% |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22% |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,75 GB solo para pesos (373,9M parámetros × 2 bytes), más activaciones y caché; cabe holgadamente en cualquier GPU consumer con 8 GB o más.
- GPU recomendadas: cualquier NVIDIA con soporte bf16 (RTX 30xx/40xx, A100, H100, GH200). El entrenamiento se hizo en una GH200 de 120 GB, pero la inferencia no requiere nada parecido.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, entre otras.
- Opciones de despliegue: al ser un modelo de difusión con código propio (`trust_remote_code`), no es compatible de forma directa con vLLM, TGI o llama.cpp sin adaptación; el uso previsto es `transformers` con `AutoModel` y `diffusion_generate` en bf16.
- Latencia y throughput: no disponibles. La generación requiere `steps` pasadas hacia delante (recomendado un token por paso, `steps = gen_length`), por lo que el coste es proporcional al número de pasos y no al número de tokens generados de forma autorregresiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-374m-60.8bt-mdlm-cooled | 373,9M totales (303,1M no-embedding) | 2048 | MDLM (difusión enmascarada) | Apache 2.0 | HuggingFace |
| Modelo AR equivalente del autor (misma escalera y datos) | ~374M (misma arquitectura) | 2048 | Autorregresivo | No disponible en la información | Publicado por separado según la model card |
| Otros MDLM de escala similar | No disponible | No disponible | Difusión enmascarada | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No está ajustado por instrucciones ni por seguridad: no debe usarse como asistente conversacional sin ajuste posterior.
- Los hechos generados son a menudo incorrectos, según advierte el propio autor.
- La decodificación por confianza sin penalización de presencia entra en bucles de repetición; con penalización 4 se mitiga, pero es una heurística y no un muestreo exacto.
- Las listas, tablas y código, donde la repetición es correcta, no se probaron y las listas tienden a repetirse.
- El muestreo ancestral exacto es mucho menos fluido que el modelo autorregresivo del mismo tamaño del autor; temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- Contexto limitado a 2048 tokens.
- Cobertura lingüística restringida a siete idiomas, con posible sesgo hacia fuentes del sector público británico.
- Los benchmarks zero-shot no están medidos; la única métrica publicada es la ELBO negativa, que es una cota superior de la log-verosimilitud y no es directamente comparable con la entropía cruzada de un modelo autorregresivo.
- Las estimaciones de fluidez se basan en 32 prompts y una semilla, con errores estándar de unos 0,06 bits por byte.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo base de investigación conviene evaluar su calidad antes de llevarlo a producción.

## Enlaces

- HuggingFace: https://huggingface.co/VectaBass/vectabass-374m-60.8bt-mdlm-cooled
- Repositorio de datos y detalles de bins: `DATA.md` dentro del repositorio de HuggingFace
- Código de modelado: `modeling_vectabass.py` dentro del repositorio de HuggingFace
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información disponible.
