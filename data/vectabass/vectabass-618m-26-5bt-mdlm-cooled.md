# VectaBass/vectabass-618m-26.5bt-mdlm-cooled

## Resumen

vectabass-618m-26.5bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, *masked diffusion language model*) de 618M parámetros totales (527,7M no de embedding), desarrollado por VectaBass dentro de un estudio de *scaling laws* para IA soberana del Reino Unido. Se entrenó desde cero sobre 26.465 millones de tokens y constituye la celda "N4-D3" de una malla experimental (la "MDLM square") que abarca modelos de 100M a 1.600M de parámetros no de embedding, cada uno entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar empíricamente la ley de escala.

La relevancia del modelo es fundamentalmente metodológica: no es un asistente, sino una pieza de un experimento controlado que compara modelos autorregresivos (AR) y de difusión entrenados con los mismos datos y la misma escalera de tamaños. Su arquitectura es un *transformer* tipo Llama con atención bidireccional, GQA 2:1 y *exclusive self-attention* (XSA), adaptado al objetivo MDLM con un token de máscara dedicado (id 50283). La ventana de contexto es de 2048 tokens.

El modelo no está ajustado por instrucciones ni alineado en seguridad, y el autor advierte explícitamente de que los hechos que genera suelen ser incorrectos. Su interés práctico está en la experimentación con decodificación por difusión, la extracción de características y la investigación en alternativas a la generación autorregresiva, no en el despliegue como chatbot de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con MDLM (masked diffusion), GQA 2:1, XSA, SwiGLU, RMSNorm pre-norm, RoPE |
| Parámetros totales | 617.852.928 (embeddings atados) |
| Parámetros activos | No aplica (no es MoE) |
| Parámetros no de embedding | 527.708.160 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible (el autor recomienda ejecutar en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (inglés, galés, gaélico escocés, irlandés, manés, córnico, escocés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`: `modeling_vectabass.py`) |
| Anchura / capas | 1792 / 15 |
| Cabezas | 28 query, 14 key-value, dimensión 64 |
| Feed-forward | SwiGLU, dimensión 4752 |
| Token de máscara | id 50283 |
| Vocabulario | 50.304 filas: BPE de GPT-2 (50.257) + 26 tokens especiales + padding |
| Tamaño del repo | 2,5 GB |

## Arquitectura y entrenamiento

El modelo reutiliza la pila de los modelos autorregresivos del proyecto (estilo Llama) pero con atención bidireccional y *exclusive self-attention* (XSA), y la entrena con el objetivo MDLM: un proceso de difusión de tiempo continuo con `alpha_t = 1 - t` cuya pérdida es el ELBO negativo en tiempo continuo, implementado como entropía cruzada enmascarada ponderada por `1/t` sobre todas las posiciones. En cada paso se enmascaran tokens y el modelo aprende la distribución del token limpio en cada posición; la generación consiste en partir de un *canvas* de máscaras y rellenarlas iterativamente.

El entrenamiento consumió 26.465.533.952 tokens (50 por parámetro no de embedding), con lotes de 851.968 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momento 0.95) combinado con AdamW en fp32 (0.9, 0.95), LR máximo de 0.00105, calentamiento de 528M tokens, fase constante y *cooldown* `1-sqrt` hasta cero en el último 20%, y *weight decay* de 0.0685 sobre matrices. Se entrenó en bf16 con pesos maestros en fp32 y estadísticas de normalización, ángulos RoPE y logits en fp32, sobre una única NVIDIA GH200 de 120 GB.

Los datos provienen de la vista *phase-1-release*: 47 contenedores de texto con licencia abierta (unos 96B de tokens únicos) que incluyen fineweb-edu, fineweb-2 y finemath, además de fuentes del sector público y parlamentarias del Reino Unido y de lenguas celtas. El detalle de cada contenedor, su proporción y su licencia está en `DATA.md`. Existen réplicas de semilla en la rama `seed2`, pensadas para medir el ruido entre ejecuciones.

## Capacidades

- Relleno de texto enmascarado (*infilling*): dado un contexto con posiciones desconocidas, devuelve la distribución del token limpio en cada posición.
- Generación de texto mediante `diffusion_generate`, con orden de desenmascarado aleatorio (el proceso inverso para el que fue entrenado) o por confianza (estilo MaskGIT).
- Extracción de características (*feature-extraction*), que es el *pipeline* declarado en HuggingFace.
- Cobertura multilingüe limitada a siete lenguas: inglés y seis lenguas celtas y germánicas minoritarias del Reino Unido (galés, gaélico escocés, irlandés, manés, córnico, escocés).
- Capacidad de condicionamiento por *prompt*: el sampler recomendado aplica penalización de presencia sobre el *prompt* y el *canvas* para evitar bucles de copia.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso agéntico, ni visión, ni audio, ni modo *thinking*: es un modelo base sin ajuste por instrucciones.

## Casos de uso

- Investigación en leyes de escala: el modelo es una celda de una malla controlada que permite ajustar curvas de pérdida frente a parámetros y tokens y compararlas con la malla autorregresiva entrenada con los mismos datos.
- Estudio de decodificación por difusión: sirve para reproducir y extender la comparativa de ~30 samplers del autor (orden por confianza frente a orden aleatorio, penalizaciones de presencia, pasos por iteración) midiendo fluidez en bits por byte UTF-8 y diversidad de n-gramas.
- Relleno de texto (*text infilling*) en documentos: colocar el token de máscara 50283 en las posiciones desconocidas y leer `model(ids).logits` para obtener la distribución del token limpio, útil en tareas de restauración o completado de manuscritos.
- Extracción de representaciones para *downstream*: al declararse como *feature-extraction*, puede usarse como extractor de embeddings contextuales bidireccionales en clasificación o agrupamiento de textos en inglés y lenguas celtas.
- Experimentación con IA soberana en lenguas minoritarias: el corpus incluye fuentes parlamentarias y del sector público del Reino Unido y lenguas celtas, lo que permite evaluar el comportamiento de un MDLM en galés, gaélico o córnico con datos de dominio público.
- Reproducibilidad de experimentos: los pesos reproducen bit a bit los logits del código de entrenamiento en filas enmascaradas del canon, lo que permite validar implementaciones propias de MDLM contra una referencia publicada.
- Docencia sobre modelos generativos no autorregresivos: la API de `diffusion_generate` con orden aleatorio o por confianza y la existencia de réplicas de semilla lo hacen adecuado para ilustrar el proceso inverso de difusión y el ruido entre ejecuciones.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). La única métrica de evaluación reportada es el ELBO negativo sobre el canon retenido *phase-1-release canon-8192* (8192 secuencias de 2048 tokens, 16 extracciones de máscara por secuencia):

| Métrica | Valor |
|---|---|
| ELBO negativo (canon-8192) | 2,5111 ± 0,0025 nats por token (± 1 error estándar) |

El autor advierte de que el ELBO negativo es una cota superior de la log-verosimilitud negativa y solo puede compararse con la entropía cruzada de un modelo AR como cota, no como medida equivalente. La tabla de calidad de muestreo que aparece en la model card corresponde a la celda N6-D5, no a este modelo:

| Sampler (celda N6-D5) | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| Confianza, argmax, penalización 4 (recomendado) | 0,64 | 0,74 | 18% |
| Igual, sin penalización | 0,15 | 0,16 | 80% |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22% |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,24 GB solo para pesos (617,9M de parámetros × 2 bytes), más el *canvas* de activaciones y la caché; en la práctica, unos 3-4 GB con contexto completo de 2048 tokens.
- El modelo se entrenó en una única NVIDIA GH200 de 120 GB, pero esa cifra corresponde al entrenamiento, no a la inferencia.
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090. También en GPUs de datacenter como A100, H100 o L40S, donde quedará limitado por latencia y no por memoria.
- Despliegue: la vía soportada es `transformers` con `trust_remote_code=True` y `dtype=torch.bfloat16`, que carga `modeling_vectabass.py` del repositorio. No hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI; el formato publicado es safetensors con código personalizado y no se distribuyen pesos GGUF.
- Latencia y throughput: no disponibles. La generación requiere `steps = gen_length` pasadas hacia delante (256 pasos para 256 tokens en la configuración recomendada), por lo que el coste por token generado es muy superior al de un modelo autorregresivo con caché KV.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-618m-26.5bt-mdlm-cooled | 617,9M (527,7M no emb.) | 2048 | MDLM (difusión) | Apache 2.0 | HuggingFace, `transformers` con código remoto |
| Modelo AR de la misma celda (malla AR del proyecto) | No disponible en la información | No disponible | Autorregresivo | No disponible | Publicado por separado según la model card |
| Modelo AR del mismo tamaño (referencia del autor) | ~618M | No disponible | Autorregresivo | No disponible | No disponible |

El autor indica que el muestreo ancestral exacto del MDLM es "mucho menos fluido que nuestro modelo AR del mismo tamaño", pero no proporciona la ficha ni los números del AR comparable en la información disponible. No se dispone de datos suficientes para comparar con alternativas externas de difusión enmascarada de tamaño similar.

## Limitaciones y advertencias

- No está ajustado por instrucciones ni alineado en seguridad: no debe usarse como asistente conversacional sin un ajuste posterior.
- El autor advierte de que los hechos generados son a menudo incorrectos; el riesgo de alucinación es alto y no se mitiga con RLHF ni DPO.
- Sin penalización de presencia, el muestreo por confianza entra en bucles: la penalización de 4 sobre el *prompt* y el *canvas* es una heurística probada, no un muestreo exacto, y sesga contra palabras repetidas.
- Las listas, tablas y código, donde la repetición es correcta, no se evaluaron y las listas siguen repitiéndose según el autor.
- Generar más de un token por paso degrada la calidad: con 4 tokens por paso la fluidez cae a 0,73 bits por byte y los bigramas distintos a 0,49.
- Las métricas de muestreo se obtuvieron con una sola semilla y 32 *prompts*; el error estándar en bits por byte es de aproximadamente 0,06, por lo que las conclusiones son frágiles.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida a siete idiomas; no hay evidencia de comportamiento en castellano.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin alineación, cualquier producto derivado requiere evaluación y ajuste propios.
- Depende de `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de desplegarlo en producción.
- El modelo se publica como parte de un estudio de escala; su valor científico no implica calidad de generación competitiva.

## Enlaces

- HuggingFace: https://huggingface.co/VectaBass/vectabass-618m-26.5bt-mdlm-cooled
- Réplica de semilla: rama `seed2` del mismo repositorio (`revision="seed2"`)
- Documentación de datos: `DATA.md` en el repositorio (47 contenedores, proporciones y licencias)
- Código de modelado: `modeling_vectabass.py` en el repositorio
- Conjuntos de datos citados: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/HuggingFaceFW/fineweb-2, https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper, blog o demo del proyecto: no disponibles en la información proporcionada
