# VectaBass/vectabass-232m-5.01bt-mdlm-cooled

## Resumen

vectabass-232m-5.01bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, masked diffusion language model) entrenado desde cero por el autor independiente VectaBass. Con 231,8 millones de parámetros totales (173,9 millones no correspondientes a embeddings), constituye una de las celdas de la "MDLM square" de la fase 1: una escalera de modelos de entre 100M y 1.6B de parámetros no-embedding, cada tamano entrenado con varios presupuestos de tokens y publicados en conjunto para poder verificar empíricamente la ley de escalado. Existe una escalera autoregresiva (AR) paralela, entrenada con los mismos datos y la misma progresión de tamanos, publicada por separado.

El modelo emplea una pila tipo Llama con atención propia exclusiva (XSA) convertida en bidireccional, y se entrena con el objetivo MDLM (alpha_t lineal, pérdida de ELBO negativo en tiempo continuo). Se ha entrenado con 5.014 millones de tokens, lo que equivale a 29 tokens por parámetro no-embedding, sobre un dataset de 47 bins de texto con licencia abierta (unos 96B de tokens únicos) que incluye fuentes del sector público británico, parlamentarias y de lenguas celtas.

Es relevante ahora porque no es un modelo de propósito general: es una pieza de infraestructura de investigación para estudiar leyes de escalado en modelos de difusión frente a autoregresivos, con foco declarado en soberanía de IA del Reino Unido y cobertura de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico y escocés). No está ajustado a instrucciones ni a seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención propia exclusiva (XSA), GQA 2:1, MDLM (difusión enmascarada) |
| Parametros totales | 231.800.832 (embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Parametros no-embedding | 173.850.624 |
| Longitud de contexto | 2048 tokens (RoPE, base 10000) |
| Tipos de cuantizacion | No disponible (entrenado y recomendado en bf16; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `modeling_vectabass.py` vía `trust_remote_code`) |
| Ancho / capas | 1152 / 12 |
| Cabezas | 18 query, 9 key-value, dim 64 |
| Feed-forward | SwiGLU, 3040 |
| Normalizacion | RMSNorm, pre-norm |
| Token de máscara | id 50283 |
| Vocabulary | 50.304 filas: GPT-2 BPE (50.257) + 26 tokens especiales + padding |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

La red es la misma pila tipo Llama que la escalera AR (1152 de ancho, 12 capas, SwiGLU de 3040, RMSNorm pre-norm, RoPE con base 10000 y contexto de 2048), pero con atención bidireccional y atención propia exclusiva (XSA). El objetivo es MDLM con alpha_t = 1 - t: la pérdida es el ELBO negativo en tiempo continuo, implementado como entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. El token de máscara es el id 50283.

El entrenamiento usó 5.014.355.968 tokens (29 por parámetro no-embedding), con lotes de 622.592 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momento 0.95) más AdamW en fp32 (0.9, 0.95), LR pico de 0.00146, warmup de 174M tokens, schedule constante con cooldown 1-sqrt en el último 20% y weight decay de 0.0955 sobre matrices. Precisión bf16 en pesos y activaciones, pesos maestros fp32 en el optimizador, y estadísticas de norma, ángulos RoPE y logits en fp32. Todo el entrenamiento se ejecutó en una única NVIDIA GH200 de 120 GB.

El dataset es la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96B de tokens únicos, con fuentes del sector público y parlamentarias del Reino Unido y de lenguas celtas. El detalle de cada bin, su proporción y su licencia está en `DATA.md`. La decodificación se realiza con `diffusion_generate`, que anade `gen_length` máscaras al prompt y las rellena a lo largo de `steps` pasadas forward; el orden de desenmascarado puede ser aleatorio (el proceso inverso para el que se entrenó) o por confianza (estilo MaskGIT).

## Capacidades

- Modelo base de difusión enmascarada: genera texto rellenando máscaras de forma iterativa, no token a token de izquierda a derecha.
- Extracción de características (`feature-extraction`): `model(ids).logits` devuelve, en cada posición, la distribución del token limpio; se coloca el token de máscara (id 50283) donde el token es desconocido.
- Relleno de texto (infilling) y continuación de documentos con prompt de contexto.
- Generación controlable mediante orden de desenmascarado: `order="random"` (ancestral exacto) u `order="confidence"` (MaskGIT).
- Multilingüe limitado a siete idiomas: inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No dispone de tool calling, function calling, modo thinking, visión ni audio: no se documentan.
- No está ajustado a instrucciones ni a seguridad, por lo que no soporta diálogo instructivo de forma fiable.

## Casos de uso

- Investigación sobre leyes de escalado: el modelo es una celda de una escalera controlada (mismo dataset y misma progresión de tamanos que la escalera AR), por lo que sirve para medir cómo escala el ELBO negativo con parámetros y tokens y compararlo con la curva autoregresiva.
- Estudio comparativo difusión vs. autoregresivo: al existir un modelo AR gemelo del mismo tamano y datos, permite aislar el efecto del objetivo de entrenamiento en fluidez, repetición y diversidad.
- Relleno de texto y restauración de documentos: el objetivo MDLM está disenado para predecir tokens enmascarados en cualquier posición, lo que lo hace adecuado para tareas de infilling en corpus históricos o parlamentarios.
- Procesamiento de lenguas celtas de bajos recursos: cobertura declarada de cy, gd, ga, gv, kw y sco, útil para experimentos de modelado en lenguas con pocos datos.
- Generación de candidatos con control de repetición: el sampler por confianza con `presence_penalty=4.0` y `argmax=True` produce continuaciones con 0,64 bits por byte y 74% de bigramas distintos en la evaluación del autor, útil para generar borradores diversos que luego se filtran.
- Extracción de representaciones para clasificación o clustering: la cabecera de feature-extraction permite obtener logits por posición sobre texto con huecos, aprovechables en tareas de etiquetado parcial.
- Docencia y reproducción de experimentos: el repo de 0,5 GB y el entrenamiento en una sola GH200 hacen viable reproducir o auditar el pipeline en entornos académicos.

## Benchmarks y rendimiento

El autor no publica benchmarks zero-shot para los modelos MDLM ("Zero-shot benchmarks are not measured for the MDLM models"). La única métrica de evaluación es el ELBO negativo sobre el canon retenido phase-1-release canon-8192 (8192 secuencias de 2048 tokens, 16 sorteos de máscara por secuencia):

| Metrica | Valor |
|---|---|
| ELBO negativo (evaluación del autor, FlashAttention-4) | 2,9248 ± 0,0026 nats por token |
| ELBO negativo (estimación independiente a un sorteo, PyTorch SDPA) | 2,9228 ± 0,0103 nats por token |

El ELBO negativo es una cota superior de la log-verosimilitud negativa, por lo que puede compararse con la entropía cruzada de un modelo AR sobre el mismo canon solo como cota, no como medida equivalente.

Resultados de muestreo del autor (celda N6-D5, 32 inicios de documento retenidos, prompt de 32 tokens, 256 tokens generados, una semilla; puntuados por Qwen3-8B-Base):

| Sampler | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| Confianza, argmax, presence penalty 4 incl. prompt | 0,64 | 0,74 | 18% |
| Igual, sin penalización | 0,15 | 0,16 | 80% |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22% |

Con 4 tokens por paso la calidad cae a 0,73 bits por byte y 0,49 de bigramas distintos. Los errores estándar en bits por byte son de aproximadamente 0,06 con una semilla y 32 prompts.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 231,8M de parámetros ocupan aproximadamente 0,46 GB de pesos; con activaciones y cache de atención para contexto de 2048, el uso total se mantiene holgadamente por debajo de 2 GB.
- Cabe en cualquier GPU consumer: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, así como en GPUs de portátil con 6-8 GB.
- GPU recomendadas para entrenamiento o evaluación a gran escala: NVIDIA GH200 120 GB (la usada en el entrenamiento); para inferencia basta una GPU mucho menor.
- Despliegue: la librería es `transformers` con `trust_remote_code=True` (carga `modeling_vectabass.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el sampler `diffusion_generate` es código propio del repo y no un pipeline estándar.
- Latencia y throughput: no disponibles. Nótese que la generación requiere `steps = gen_length` pasadas forward (una por token generado) para mantener la calidad, lo que la hace sustancialmente más costosa por token que la decodificación autoregresiva.
- Precisión: ejecutar en bf16, como se entrenó.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| vectabass-232m-5.01bt-mdlm-cooled | 231,8M (173,9M no-embedding) | 2048 | MDLM (difusión enmascarada) | Apache 2.0 | Celda de estudio de escalado; sin benchmarks zero-shot |
| Escalera AR gemela de VectaBass (mismo tamano y datos) | ~232M | 2048 | Autoregresivo | No disponible en la informacion | Publicada por separado; el autor indica que el muestreo ancestral exacto del MDLM es mucho menos fluido que su AR del mismo tamano |
| Otros MDLM de investigacion de tamano comparable | No disponible | No disponible | MDLM | No disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de comparaciones con modelos de propósito general (p. ej. Qwen3 o Llama de ~200M) porque el autor no publica benchmarks zero-shot y las tareas no son equivalentes.

## Limitaciones y advertencias

- Modelo base sin ajuste a instrucciones ni a seguridad: no debe usarse como asistente conversacional ni en producción orientada a usuario final sin un post-entrenamiento adicional.
- Alucinación: el autor advierte explícitamente de que "los hechos a menudo son incorrectos".
- Repetición: sin penalización de presencia el orden por confianza entra en bucle (80% de 4-gramas repetidos); la penalización 4 es una heurística probada, no un muestreo exacto, y sesga contra palabras repetidas. Las listas, tablas y código, donde la repetición es correcta, no se probaron y las listas siguen repitiéndose.
- Calidad de muestreo: el muestreo ancestral exacto es mucho menos fluido que el modelo AR del mismo tamano; temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida a siete idiomas, con sesgo hacia inglés y fuentes del Reino Unido; el castellano no está entre los idiomas declarados.
- Métricas con alta incertidumbre: una sola semilla y 32 prompts, con error estándar de ~0,06 bits por byte.
- Coste de inferencia: una pasada forward por token generado (`steps = gen_length`) para preservar calidad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo de investigación sin evaluación de sesgos ni de seguridad, el uso comercial requiere auditoría propia.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene revisar `modeling_vectabass.py` antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-232m-5.01bt-mdlm-cooled
- Repositorio de datos y detalles de bins: `DATA.md` en el repo del modelo (https://huggingface.co/VectaBass/vectabass-232m-5.01bt-mdlm-cooled/blob/main/DATA.md)
- Código de modelado: `modeling_vectabass.py` en el repo del modelo (https://huggingface.co/VectaBass/vectabass-232m-5.01bt-mdlm-cooled/blob/main/modeling_vectabass.py)
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
