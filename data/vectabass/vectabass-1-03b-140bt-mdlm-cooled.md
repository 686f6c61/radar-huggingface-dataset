# VectaBass/vectabass-1.03b-140bt-mdlm-cooled

## Resumen

vectabass-1.03b-140bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, *masked diffusion language model*) de 1.028.893.312 parámetros totales (919.351.296 sin embeddings), desarrollado por VectaBass dentro de un estudio de *scaling laws* para IA soberana del Reino Unido. Se entrenó desde cero sobre 139.681.857.536 tokens y constituye la celda N5-D5 del llamado "MDLM square": una escalera de modelos de 100M a 1.6B de parámetros no-embedding, cada tamaño entrenado con varios presupuestos de tokens y publicados en conjunto para poder verificar empíricamente la ley de escalado. Existe un cuadrado autorregresivo (AR) equivalente, entrenado con los mismos datos y la misma escalera, publicado por separado.

La arquitectura parte del stack tipo Llama de los modelos AR del autor, con atención exclusiva auto-atencional (XSA) y GQA 2:1, pero convertida en bidireccional y entrenada con el objetivo MDLM: alpha_t lineal (1 - t) y pérdida de ELBO negativo en tiempo continuo, equivalente a una entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. La ventana de contexto es de 2048 tokens con RoPE (base 10000) y el vocabulario es GPT-2 BPE (50257 tokens) más 26 tokens especiales, con el token de máscara en el id 50283.

Es relevante ahora porque ofrece, con licencia Apache 2.0, un punto de medida reproducible para comparar modelos de difusión de texto frente a autorregresivos del mismo tamaño y mismos datos, algo poco habitual en la literatura abierta. No obstante, es un modelo base de investigación: no está ajustado a instrucciones ni a seguridad, no se han medido benchmarks zero-shot y sus continuaciones contienen errores factuales con frecuencia. Su pipeline declarado en Hugging Face es *feature-extraction*, aunque el código incluido expone generación mediante `diffusion_generate`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención exclusiva auto-atencional (XSA), GQA 2:1, objetivo de difusión enmascarada (MDLM) |
| Parámetros totales | 1.028.812.800 (embeddings atados) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible (entrenado y recomendado en bf16) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `modeling_vectabass.py` vía `trust_remote_code`) |

Datos adicionales de arquitectura: anchura 2176, 18 capas, 34 cabezas de consulta y 17 de clave-valor de dimensión 64, feed-forward SwiGLU de 5648, normalización RMSNorm con pre-norm, token de máscara id 50283 y vocabulario de 50304 filas (GPT-2 BPE de 50257 más 26 especiales, el resto relleno).

## Arquitectura y entrenamiento

El modelo es un transformer bidireccional derivado del stack autorregresivo del autor: atención con GQA 2:1 y atención exclusiva auto-atencional (XSA), normativa RMSNorm pre-norm, SwiGLU y RoPE con base 10000. La diferencia clave es que la atención se hace bidireccional y el objetivo es MDLM con alpha_t lineal (1 - t): la pérdida es el ELBO negativo en tiempo continuo, implementado como entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. En inferencia, `model(ids).logits` devuelve en cada posición la distribución del token limpio, colocando el token de máscara (50283) donde el token es desconocido; `diffusion_generate` añade `gen_length` máscaras al prompt y las rellena a lo largo de `steps` pasadas hacia delante.

El entrenamiento consumió 139.681.857.536 tokens (152 por parámetro no-embedding), con lotes de 851.968 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) más AdamW en fp32 (0.9, 0.95), LR pico de 0.000887, calentamiento de 919M tokens y schedule de warmup, constante y cooldown 1-sqrt hasta 0 en el último 20%. Peso de decaimiento 0.0604 sobre matrices. Precisión bf16 en pesos y activaciones con pesos maestros fp32, estadísticas de norma, ángulos RoPE y logits en fp32. Se entrenó en 2 x NVIDIA GH200 de 120 GB. Los datos son la vista *phase-1-release*: 47 bins de texto con licencia abierta, unos 96B tokens únicos, con fuentes del sector público británico, parlamentarias y de lenguas celtas (detalladas en `DATA.md`). No hay RLHF ni DPO: es un modelo base.

## Capacidades

- Modelado de lenguaje y extracción de características: logits por posición sobre tokens limpios y representaciones contextuales bidireccionales.
- Generación de texto mediante difusión enmascarada iterativa (`diffusion_generate`), con orden aleatorio (el proceso inverso para el que fue entrenado) u orden por confianza estilo MaskGIT.
- Relleno de huecos (*infilling*) de forma nativa: al ser un modelo de máscaras, puede condicionar sobre contexto a izquierda y derecha simultáneamente.
- Cobertura multilingüe limitada al inglés y a seis lenguas celtas y escocés: galés (cy), gaélico escocés (gd), irlandés (ga), manés (gv), córnico (kw) y escocés (sco).
- No soporta *tool calling* ni *function calling*.
- No está diseñado para agentes ni razonamiento multi-paso; no tiene modo *thinking*.
- Sin capacidades de visión ni audio.
- No dispone de ajuste a instrucciones: no sigue instrucciones de forma fiable.

## Casos de uso

- Estudio de leyes de escalado: el modelo es una celda de una escalera de 100M a 1.6B de parámetros no-embedding con varios presupuestos de tokens, pensada para contrastar empíricamente curvas de pérdida frente a los modelos AR equivalentes entrenados con los mismos datos.
- Investigación en modelos de difusión de texto: permite reproducir el ELBO negativo en el canon retenido (phase-1-release canon-8192) y comparar estrategias de muestreo (orden aleatorio, orden por confianza, penalizaciones de presencia) sobre 32 inicios de documento retenidos.
- Relleno de texto (*infilling*) y desenmascarado condicionado: útil en tareas de reconstrucción de fragmentos, corrección de huecos o experimentos de denoising donde el contexto bilateral aporta ventaja frente a un modelo causal.
- Experimentos con lenguas celtas y escocés: el corpus incluye fuentes parlamentarias y del sector público británico, lo que permite estudiar el comportamiento del modelo en galés, gaélico, irlandés, manés, córnico y escocés con contexto de 2048 tokens.
- Extracción de características: al declararse pipeline `feature-extraction`, puede emplearse para obtener representaciones bidireccionales en tareas descendentes de clasificación o *probing* sobre texto en inglés y lenguas celtas.
- Docencia y divulgación: sirve como ejemplo ejecutable y abierto (Apache 2.0) de un MDLM completo, con código de muestreo y receta de entrenamiento publicados, para cursos y talleres sobre modelos generativos no autorregresivos.
- Comparación de eficiencia de muestreo: permite medir coste en pasadas hacia delante (una por paso, con `steps = gen_length` recomendado) frente a la decodificación token a token de un AR del mismo tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks zero-shot para los modelos MDLM de esta familia. La evaluación disponible es el ELBO negativo sobre el canon retenido (phase-1-release canon-8192, 8192 x 2048 tokens, 16 extracciones de máscara por secuencia):

| Métrica | Valor |
|---|---|
| ELBO negativo (canon, 16 extracciones) | 2,2435 ± 0,0025 nats por token |
| ELBO negativo (una extracción, SDPA) | 2,2418 ± 0,0099 nats por token |

El ELBO negativo es una cota superior de la log-verosimilitud negativa, por lo que puede compararse con la entropía cruzada de un modelo AR sobre el mismo canon solo como cota, no como medida equivalente. Los pesos de este repositorio reproducen bit a bit los logits del código de entrenamiento en filas enmascaradas del canon.

Calidad de muestreo (celda N6-D5, 32 inicios retenidos, prompt de 32 tokens, 256 generados, una semilla, puntuada por Qwen3-8B-Base):

| Muestreador | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| Confianza, argmax, penalización 4 incl. prompt (recomendado) | 0,64 | 0,74 | 18% |
| Igual, sin penalización | 0,15 | 0,16 | 80% |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22% |

El error estándar en bits por byte es de aproximadamente 0,06 con una semilla y 32 prompts.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 2,1 GB de pesos más activaciones y caché; con contexto de 2048 tokens y 18 capas, el consumo total se mantiene holgadamente por debajo de 8 GB en GPU consumer.
- Cabe en GPU consumer: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y similares; también en GPUs de 8 GB con margen.
- GPU recomendadas para entrenamiento o experimentación a gran escala: NVIDIA GH200 de 120 GB (la configuración usada, 2 unidades), A100 o H100 para réplicas del entrenamiento.
- Despliegue: la vía soportada es `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)` y el método `diffusion_generate` del código del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo causal, su integración en esos motores no es directa.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la generación requiere una pasada hacia delante por paso, con `steps = gen_length` recomendado (256 pasos para 256 tokens), frente a una pasada por token en un AR del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-1.03b-140bt-mdlm-cooled | 1.028.812.800 (919,4M no-embedding) | 2048 | Difusión enmascarada (MDLM) | Apache 2.0 | Hugging Face |
| Cuadrado AR equivalente de VectaBass | misma escalera de 100M a 1.6B no-embedding | no disponible | Autorregresivo | no disponible | Publicado por separado |
| Otros MDLM abiertos de ~1B | no disponible | no disponible | Difusión enmascarada | no disponible | no disponible |

La comparación más pertinente es interna: el cuadrado autorregresivo del mismo autor, entrenado con los mismos datos y la misma escalera de tamaños, que permite aislar el efecto del objetivo (difusión frente a autorregresivo). No se dispone de datos de benchmarks comparables con modelos de terceros.

## Limitaciones y advertencias

- No está ajustado a instrucciones ni a seguridad: no debe usarse como asistente conversacional sin ajuste posterior.
- Los hechos son a menudo incorrectos; el propio autor lo advierte en la model card.
- El muestreo por confianza sin penalización de presencia entra en bucles: se recomienda `argmax=True` con `presence_penalty=4.0` contando también el prompt, y un token por paso (`steps = gen_length`). Con 4 tokens por paso la calidad cae a 0,73 bits por byte y 0,49 de bigramas distintos.
- La penalización de presencia es una heurística, no un muestreo exacto: sesga contra palabras repetidas, y en listas, tablas y código (donde la repetición es correcta) no se probó; las listas siguen repitiéndose.
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR del mismo tamaño; temperatura, top-k, top-p y min-p intercambian fluidez por diversidad sin alcanzar texto real.
- Contexto limitado a 2048 tokens.
- Cobertura lingüística restringida a inglés y lenguas celtas más escocés; el rendimiento fuera de ese conjunto no está caracterizado.
- Sin benchmarks zero-shot medidos: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas similares.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base de investigación sin ajuste, su idoneidad para producción es muy limitada sin trabajo adicional de alineamiento y evaluación.
- Los resultados de muestreo proceden de una sola semilla y 32 prompts, con error estándar de ~0,06 bits por byte; deben tratarse como indicativos.

## Enlaces

- Hugging Face: https://huggingface.co/VectaBass/vectabass-1.03b-140bt-mdlm-cooled
- Repositorio de datos (referencia en la model card): `DATA.md` dentro del repositorio del modelo
- Dataset de texto educativo: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset multilingüe: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset de matemáticas: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada
