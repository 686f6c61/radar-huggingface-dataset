# VectaBass/vectabass-151m-60.8bt-mdlm-cooled

## Resumen

vectabass-151m-60.8bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, *masked diffusion language model*) de 151,5 millones de parámetros totales (100,0 millones sin contar embeddings), desarrollado por el autor independiente VectaBass. Forma parte de la "MDLM square" de la fase 1: una escalera de modelos de 100M a 1.6B de parámetros no-embedding, cada tamano entrenado con varios presupuestos de tokens y publicados en conjunto para poder verificar empíricamente la ley de escalado. Este repositorio concreto corresponde a la celda N1-D4 (tamano N1, presupuesto de datos D4) y se entrena desde cero con 60.800 millones de tokens.

El modelo no es autorregresivo: usa una pila tipo Llama (RMSNorm pre-norm, SwiGLU, RoPE, GQA 2:1) con atención exclusiva auto-atencional (XSA) convertida en bidireccional, y se entrena con el objetivo MDLM de tiempo continuo (ELBO negativo ponderado por 1/t). La generación se realiza rellenando máscaras de forma iterativa mediante `diffusion_generate`, no token a token de izquierda a derecha. Su interés es fundamentalmente científico: sirve para comparar el escalado de modelos de difusión frente a una "AR square" autorregresiva equivalente entrenada con los mismos datos.

Es un modelo base sin ajuste de instrucciones ni de seguridad, con contexto de 2048 tokens y enfoque declarado en IA soberana del Reino Unido y lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) además del inglés. No está pensado para uso en producción como asistente, sino como material de estudio de leyes de escalado y como extractor de características o generador experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama (RMSNorm pre-norm, SwiGLU, RoPE, GQA 2:1, atención exclusiva XSA), objetivo de difusión enmascarada (MDLM) |
| Parametros totales | 151.486.464 (embeddings atados) |
| Parametros activos | No aplica (no es MoE); 99.975.168 no-embedding |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (la model card recomienda ejecutar en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código personalizado (`modeling_vectabass.py`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La red es una pila transformer tipo Llama con 1024 de anchura, 9 capas, 16 cabezas de consulta y 8 de clave-valor (dimensión 64), feed-forward SwiGLU de 2592, RMSNorm con pre-norm y RoPE con base 10000. La diferencia clave respecto a un modelo autorregresivo es que la atención es bidireccional e incorpora atención exclusiva auto-atencional (XSA). El token de máscara tiene el id 50283 y el vocabulario es BPE de GPT-2 (50257) más 26 tokens especiales, hasta 50304 filas con relleno.

El entrenamiento sigue el objetivo MDLM con un schedule lineal `alpha_t = 1 - t`; la pérdida es el ELBO negativo en tiempo continuo (entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones). Se usaron 60.800.106.496 tokens (608 tokens por parámetro no-embedding), con lotes de 524.288 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0,2, momento 0,95) más AdamW en fp32, LR pico de 0,00173, calentamiento de 100M tokens y cooldown 1-sqrt en el último 20 %. Los pesos y activaciones se entrenaron en bf16 con maestros en fp32, sobre una única NVIDIA GH200 de 120 GB. Los datos provienen de 47 bins de texto con licencia abierta (unos 96B de tokens únicos), incluyendo fineweb-edu, fineweb-2 y finemath, con fuentes del sector público y parlamentario británico y de lenguas celtas.

## Capacidades

- Generación de texto mediante relleno iterativo de máscaras (`diffusion_generate`), con orden aleatorio (el proceso inverso para el que fue entrenado) u orden por confianza estilo MaskGIT.
- Extracción de características (pipeline declarado: `feature-extraction`); `model(ids).logits` devuelve en cada posición la distribución del token limpio.
- Modelado del lenguaje y estimación de verosimilitud mediante ELBO negativo.
- Cobertura multilingüe limitada a inglés y lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) y escocés.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- No dispone de modo de pensamiento, visión ni audio.
- No está ajustado a instrucciones ni a seguridad; no es un modelo conversacional.

## Casos de uso

- Investigación sobre leyes de escalado: usar esta celda junto con el resto de la escalera (100M a 1.6B) y la square autorregresiva equivalente para ajustar y validar curvas de loss frente a tokens y parámetros.
- Comparación de objetivos de entrenamiento: medir el ELBO negativo del MDLM frente a la entropía cruzada de un AR del mismo tamano sobre el mismo corpus (canon-8192) para estudiar las diferencias entre difusión y autorregresión.
- Extracción de embeddings para análisis lingüístico: al ser bidireccional, las representaciones contextuales de cada posición integran información a izquierda y derecha, útil para tareas de clasificación o agrupamiento sobre texto en inglés y lenguas celtas.
- Estudio de muestreo en modelos de difusión: reproducir la comparativa de samplers de la model card (orden por confianza con penalización de presencia 4, orden aleatorio ancestral, distintos pasos por iteración) y analizar fluidez, diversidad y repetición.
- Experimentos con lenguas de bajos recursos: evaluar la calidad de generación y representación en galés, gaélico escocés, irlandés, manés, córnico y escocés, dado el énfasis del corpus en fuentes celtas.
- Docencia y experimentación en hardware de consumo: con 151M de parámetros y pesos en bf16 (unos 0,3 GB), cabe en cualquier GPU consumer moderna y permite reproducir el pipeline completo de difusión enmascarada en una sola tarjeta.
- Generación de continuaciones cortas en flujos de aumento de datos o *data augmentation* controlados, siempre con revisión humana por la baja fiabilidad factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks zero-shot para los modelos MDLM según la propia model card. La única métrica de evaluación disponible es el ELBO negativo sobre el canon retenido de la fase 1 (8192 secuencias de 2048 tokens, 16 muestras de máscara por secuencia):

| Metrica | Valor |
|---|---|
| ELBO negativo (canon phase-1-release, 16 draws) | 2,7119 ± 0,0025 nats por token |
| ELBO negativo (estimación independiente, 1 draw, PyTorch SDPA) | 2,7101 ± 0,0101 nats por token |

La model card advierte que el ELBO negativo es una cota superior de la log-verosimilitud negativa y solo puede compararse con la entropía cruzada de un AR como cota, no como medida equivalente. Los datos de calidad de muestreo de la tabla de samplers corresponden a la celda N6-D5, no a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en bf16 (151M de parámetros); en fp32, alrededor de 0,6 GB.
- GPU recomendadas: cualquier GPU con soporte bf16; el entrenamiento se realizó en una NVIDIA GH200 de 120 GB, pero la inferencia no requiere hardware de datacenter.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en iGPU y CPU para pruebas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el método `diffusion_generate` del código del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el objetivo de difusión y el código personalizado no son compatibles de serie con esos motores.
- Latencia y throughput: no disponibles. La generación requiere `steps` pasadas forward (recomendado un token por paso, `steps = gen_length`), por lo que el coste es proporcional al número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| vectabass-151m-60.8bt-mdlm-cooled | 151,5M (100M no-embedding) | 2048 | Difusión enmascarada (MDLM) | Apache 2.0 | Celda de un estudio de escalado; sin benchmarks zero-shot |
| Square AR equivalente de VectaBass (fase 1) | Misma escalera (100M-1.6B) | No disponible | Autorregresivo | No disponible en la información proporcionada | Entrenado con los mismos datos y escalera; publicado por separado |
| Otros MDLM de tamano similar | No disponible | No disponible | Difusión enmascarada | No disponible | No se dispone de comparativas publicadas en la información proporcionada |

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones ni de seguridad: no debe usarse como asistente conversacional directo.
- Alto riesgo de alucinación: la propia model card indica que "los hechos a menudo son incorrectos".
- El muestreo por confianza sin penalización de presencia entra en bucles; con penalización 4 se mitiga, pero es una heurística que sesga contra palabras repetidas y no funciona bien en listas, tablas y código.
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR del mismo tamano; temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- La evaluación se basa en 32 prompts y una sola semilla, con errores estándar de unos 0,06 bits por byte; los resultados son indicativos.
- Contexto limitado a 2048 tokens.
- Cobertura lingüística restringida a inglés y lenguas celtas; no se declara soporte de castellano.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción y requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio.
- El ELBO negativo no es directamente comparable con la perplejidad de modelos autorregresivos.
- No se han medido benchmarks zero-shot, por lo que no hay evidencia de rendimiento en tareas estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-151m-60.8bt-mdlm-cooled
- Repositorio de datos (`DATA.md`) referenciado en la model card: no disponible como enlace directo en la información proporcionada
- Paper o blog del estudio de escalado: no disponible en la información proporcionada
- Repositorio de código de entrenamiento: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
