# VectaBass/vectabass-618m-60.8bt-mdlm-cooled

## Resumen

vectabass-618m-60.8bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (masked diffusion language model, MDLM) de 618 millones de parámetros totales (527,7 millones sin contar embeddings), entrenado desde cero por el desarrollador independiente VectaBass sobre 60.800 millones de tokens. Forma parte de la "MDLM square" de la fase 1: una escalera de modelos de 100M a 1.6B de parámetros no-embedding, cada tamano entrenado con varios presupuestos de tokens y publicados en conjunto para poder verificar empíricamente la ley de escala. Existe una escalera autoregresiva (AR) equivalente, entrenada con los mismos datos, que se publica por separado.

El modelo emplea una arquitectura transformer tipo Llama (RMSNorm pre-norm, SwiGLU, RoPE) con atención bidireccional, GQA 2:1 y exclusive self-attention (XSA), adaptada al objetivo de difusión. La innovación principal es el objetivo MDLM: en lugar de predecir el siguiente token, el modelo rellena posiciones enmascaradas de forma iterativa, con una loss de ELBO negativo en tiempo continuo. El contexto es de 2048 tokens y el vocabulario es GPT-2 BPE con 50.304 filas.

Su relevancia es doble: por un lado es una pieza de un estudio de leyes de escala abierto y reproducible; por otro, incluye fuentes de texto del sector público británico y de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico y escocés), lo que lo hace relevante para el ámbito de la "IA soberana" del Reino Unido. Es un modelo base, sin ajuste de instrucciones ni de seguridad, pensado para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama bidireccional con atención exclusiva (XSA), objetivo MDLM (difusión enmascarada) |
| Parametros totales | 617.852.928 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y recomendado en bf16) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `modeling_vectabass.py` cargado vía `trust_remote_code`) |

## Arquitectura y entrenamiento

La red es el stack de los modelos AR de la misma familia (Llama-like) convertido a bidireccional: 15 capas, anchura 1792, 28 cabezas de consulta y 14 de clave-valor de dimensión 64 (GQA 2:1), feed-forward SwiGLU de 4752, RMSNorm pre-norm, RoPE con base 10000 y atención bidireccional con XSA. El token de máscara es el id 50283 y el vocabulario tiene 50.304 filas (GPT-2 BPE de 50.257 más 26 tokens especiales y relleno). Los embeddings están atados.

El objetivo es MDLM con alpha_t lineal (1 - t): la loss es el ELBO negativo en tiempo continuo, es decir, una entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. Se entrenó con 60.800.696.320 tokens (115 por parámetro no-embedding), batch de 851.968 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) más AdamW fp32 (0.9, 0.95), LR pico de 0.00105, warmup de 528M tokens y un schedule de warmup, constante y cooldown 1-sqrt hasta cero en el último 20 %. Precisión bf16 en pesos y activaciones con pesos maestros fp32 en el optimizador; estadísticas de norma, ángulos RoPE y logits en fp32. Se entrenó en 2 x NVIDIA GH200 de 120 GB. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96B de tokens únicos, con fuentes del sector público y parlamentario británico y de lenguas celtas (detalle en `DATA.md`). Existen réplicas de semilla en las ramas `seed2` y `seed3`.

## Capacidades

- Relleno de texto enmascarado: dado un contexto con posiciones desconocidas (token 50283), devuelve la distribución del token limpio en cada posición.
- Generación de texto mediante `diffusion_generate`, que añade `gen_length` máscaras al prompt y las rellena en `steps` pasadas hacia delante.
- Dos modos de orden de desenmascarado: `random` (orden aleatorio, el proceso inverso para el que fue entrenado) y `confidence` (estilo MaskGIT, compromete primero las posiciones más seguras).
- Extracción de representaciones (pipeline `feature-extraction`).
- Capacidades multilingües limitadas a inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma nativa.
- No dispone de modo thinking, visión ni audio.
- No está ajustado a instrucciones ni a seguridad.

## Casos de uso

- Estudio de leyes de escala: el modelo es una celda (N4-D4) de la MDLM square; se usa para ajustar y validar curvas de scaling comparando la loss con las demás celdas de la escalera y con la escalera AR equivalente.
- Investigación en modelos de difusión para lenguaje: sirve como banco de pruebas reproducible para comparar el objetivo MDLM frente al autoregresivo con los mismos datos y receta.
- Medición de ruido entre ejecuciones: las ramas `seed2` y `seed3` permiten cuantificar la varianza run-to-run de una misma receta con nueva inicialización y orden de datos.
- Procesamiento de texto en lenguas celtas: al incluir galés, gaélico escocés, irlandés, manés, córnico y escocés en el corpus, puede emplearse para tareas de relleno y extracción de representaciones en estos idiomas de bajos recursos.
- Relleno de documentos con huecos: el modo de difusión enmascarada encaja en tareas de infilling donde se conoce el contexto a ambos lados de la posición a completar, algo que un modelo AR causal no puede hacer de forma nativa.
- Extracción de features para clasificación o clustering: mediante el pipeline `feature-extraction` y las representaciones internas del modelo bidireccional.
- Evaluación de muestreadores: el modelo y su receta de sampling documentada permiten reproducir los experimentos de comparación de samplers (bits por byte, bigramas distintos, 4-gramas repetidos) descritos en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de evaluación publicada es el ELBO negativo sobre el canon retenido phase-1-release canon-8192 (8192 x 2048 tokens, 16 sorteos de máscara por secuencia): **2,4060 ± 0,0025 nats por token** (± un error estándar). El autor advierte que el ELBO negativo es una cota superior de la log-verosimilitud negativa y solo puede compararse con la entropía cruzada de un modelo AR como cota, no como medida equivalente.

Se documentan además métricas de calidad de muestreo para la celda N6-D5 (no para esta celda), evaluadas con Qwen3-8B-Base en bits por byte UTF-8 sobre 32 inicios de documento retenidos (prompt de 32 tokens, 256 tokens generados, una semilla):

| Muestreador | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7 % |
| confidence, argmax, presence penalty 4 incl. prompt (por defecto) | 0,64 | 0,74 | 18 % |
| igual, sin penalización | 0,15 | 0,16 | 80 % |
| orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22 % |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,24 GB solo para pesos (617,9M parámetros x 2 bytes), más overhead de activaciones y caché; en la práctica cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: el modelo se entrenó en 2 x NVIDIA GH200 de 120 GB, pero para inferencia basta una RTX 3060, RTX 4060, RTX 4090 o cualquier GPU con al menos 4-6 GB de VRAM en bf16.
- Cabe en GPU consumer: sí, en todas las GPU modernas con soporte bf16; en GPUs sin bf16 nativo habría que evaluar fp16/fp32.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (carga `modeling_vectabass.py` del repo). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el método `diffusion_generate` es específico del código remoto del repo.
- Latencia y throughput: no disponibles. El coste de generación es de `steps` pasadas hacia delante (se recomienda `steps = gen_length`, un token por paso), por lo que la latencia crece linealmente con la longitud generada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-618m-60.8bt-mdlm-cooled | 617,9M totales (527,7M no-embedding) | 2048 | MDLM (difusión enmascarada) | apache-2.0 | Hugging Face |
| Escalera AR equivalente de VectaBass | misma escalera 100M-1.6B | no disponible | autoregresivo | no disponible en la informacion | publicada por separado |
| Modelos MDLM de referencia (p. ej. MDLM original) | no disponible | no disponible | difusión enmascarada | no disponible | no disponible |

La comparación más directa es con la escalera AR del mismo autor, entrenada con los mismos datos y receta; el propio autor señala que el muestreo ancestral exacto del MDLM es mucho menos fluido que su modelo AR del mismo tamano. No se dispone de datos de benchmarks comparables con otros modelos de difusión de tamano similar en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones ni de seguridad: no debe usarse directamente en producción orientada a usuario final sin un post-entrenamiento adecuado.
- Alucinación: el autor advierte explícitamente de que "los hechos a menudo son incorrectos".
- El muestreador por defecto (confidence + argmax + presence penalty 4) es una heurística, no un muestreo exacto: sesga contra palabras repetidas y las listas siguen repitiéndose; no se probaron listas, tablas ni código, donde la repetición es correcta.
- Sin penalización, el orden confidence entra en bucles; con penalización 3 aún repite y con 6 pierde fluidez; 4 es el valor probado.
- Generar más de un token por paso degrada la calidad (0,73 bits por byte y 0,49 de bigramas distintos con 4 tokens por paso).
- El muestreo ancestral exacto, aunque fiel a la distribución del modelo, es mucho menos fluido que el modelo AR del mismo tamano; temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- Contexto limitado a 2048 tokens.
- Cobertura lingüística restringida a siete idiomas (inglés y seis lenguas celtas/germánicas del Reino Unido); no hay soporte documentado de castellano.
- Las métricas de sampling publicadas corresponden a la celda N6-D5, no a esta celda, y se basan en una sola semilla y 32 prompts (error estándar de unos 0,06 bits por byte).
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo.
- Licencia apache-2.0: permite uso comercial, pero al ser un modelo base sin ajuste de seguridad, la responsabilidad sobre el uso recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-618m-60.8bt-mdlm-cooled
- Rama de réplica de semilla 2: https://huggingface.co/VectaBass/vectabass-618m-60.8bt-mdlm-cooled/tree/seed2
- Rama de réplica de semilla 3: https://huggingface.co/VectaBass/vectabass-618m-60.8bt-mdlm-cooled/tree/seed3
- Documentación de datos (`DATA.md`): https://huggingface.co/VectaBass/vectabass-618m-60.8bt-mdlm-cooled/blob/main/DATA.md
- Código de modelado (`modeling_vectabass.py`): https://huggingface.co/VectaBass/vectabass-618m-60.8bt-mdlm-cooled/blob/main/modeling_vectabass.py
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
