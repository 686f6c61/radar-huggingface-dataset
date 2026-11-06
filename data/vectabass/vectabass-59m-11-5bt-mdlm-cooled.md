# VectaBass/vectabass-59m-11.5bt-mdlm-cooled

## Resumen

vectabass-59m-11.5bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, masked diffusion language model) de 59 millones de parámetros totales (27,3 millones no pertenecientes a embeddings) desarrollado por VectaBass. Se trata de una celda experimental del *addendum* MDLM de la fase 1 del proyecto, un estudio de leyes de escalado que extiende la escalera del "cuadrado MDLM" (de 100M a 1.6B de parámetros) con un escalón inferior, N0, para verificar si la ley de escalado se mantiene en tamaños más pequeños.

El modelo se entrena desde cero sobre 11.520 millones de tokens (11,52B), lo que supone 422 tokens por parámetro no-embedding. La arquitectura es la misma pila tipo Llama de los modelos autorregresivos del proyecto, con self-attention exclusiva (XSA) y GQA 2:1, pero convertida en bidireccional para adaptarse al objetivo de difusión. Emplea un vocabulario GPT-2 BPE de 50.257 tokens más 26 tokens especiales, con un token de máscara de id 50283.

Es relevante porque publica junto con los pesos una comparación sistemática de aproximadamente 30 muestreadores y una receta de generación concreta (orden por confianza, argmax, penalización de presencia 4,0, un token por paso), además de los datos de entrenamiento y la receta completa. No es un modelo de instrucciones ni un modelo afinado para seguridad: es una base para investigación en leyes de escalado y en generación por difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con self-attention exclusiva (XSA), GQA 2:1, pre-norm RMSNorm, SwiGLU, RoPE base 10000 |
| Parametros totales | 59.473.920 (embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (la model card solo indica ejecución en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (inglés, galés, gaélico escocés, irlandés, manés, córnico, escocés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código personalizado (`modeling_vectabass.py`) y `trust_remote_code=True` |

Datos adicionales de arquitectura: anchura 640, 6 capas, 10 cabezas de consulta y 5 de clave-valor con dimensión 64, feed-forward SwiGLU de 1728. Vocabulario de 50.304 filas: GPT-2 BPE (50.257) más 26 tokens especiales, el resto relleno.

## Arquitectura y entrenamiento

La red es la pila autorregresiva de los modelos del proyecto (tipo Llama) con self-attention exclusiva (XSA), pero con atención bidireccional en lugar de causal. El objetivo es MDLM con un alpha_t lineal (alpha_t = 1 - t); la pérdida es el ELBO negativo en tiempo continuo, es decir, una entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. El token de máscara tiene id 50283 y se coloca en las posiciones desconocidas; `model(ids).logits` devuelve en cada posición la distribución del token limpio.

El entrenamiento consumió 11.519.655.936 tokens con un tamaño de lote de 393.216 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) más AdamW en fp32 (0,9 / 0,95), LR máximo de 0,00255, warmup de 39M tokens, schedule warmup-constante con cooldown 1-sqrt a cero en el último 20 % y weight decay de 0,136 en matrices. Precisión bf16 en pesos y activaciones con pesos maestros en fp32, estadísticas de norma, ángulos RoPE y logits en fp32. Se entrenó en una única NVIDIA GH200 de 120 GB. Los datos proceden de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96B de tokens únicos, con fuentes del sector público británico, parlamentarias y de lenguas celtas; los datasets citados son FineWeb-Edu, FineWeb-2 y FineMath.

## Capacidades

- Modelado de lenguaje por difusión enmascarada: rellena posiciones enmascaradas de forma iterativa mediante `diffusion_generate`, no mediante decodificación autorregresiva token a token.
- Generación de texto condicionada por un prompt, con relleno de `gen_length` máscaras a lo largo de `steps` pasadas hacia delante.
- Dos órdenes de desenmascarado: `order="random"` (el proceso inverso exacto para el que se entrenó) y `order="confidence"` (estilo MaskGIT, que fija primero las posiciones más confiables).
- Extracción de características: el pipeline declarado es `feature-extraction` y el modelo expone logits por posición.
- Capacidades multilingües limitadas a siete lenguas: inglés y seis lenguas celtas y del Reino Unido (galés, gaélico escocés, irlandés, manés, córnico, escocés).
- No soporta tool calling ni function calling (no se menciona en la model card).
- No soporta razonamiento multi-paso orientado a agentes ni modo de pensamiento explícito.
- No dispone de visión ni audio.
- No está afinado para instrucciones ni para seguridad.

## Casos de uso

- Investigación en leyes de escalado: el modelo es una celda N0 del addendum MDLM, pensada para contrastar la ley de escalado en 27,3M de parámetros no-embedding frente a las celdas de 100M a 1.6B con la misma receta y datos. Se usaría como punto de medida, no como modelo de producción.
- Estudio comparativo difusión frente a autorregresivo: existe un addendum AR equivalente liberado por separado, lo que permite comparar ambos objetivos a igualdad de tamaño y presupuesto de tokens.
- Reproducción de experimentos: los pesos reproducen bit a bit los logits del código de entrenamiento en filas enmascaradas del canon, lo que sirve para validar implementaciones de MDLM y de ELBO negativo.
- Evaluación de muestreadores: la model card documenta unos 30 muestreadores comparados sobre 32 inicios de documento retenidos (prompt de 32 tokens, 256 generados, una semilla), con métricas de bits por byte UTF-8, bigramas distintos y 4-gramas repetidos. Sirve como banco de pruebas para técnicas de decodificación en difusión.
- Relleno de texto enmascarado: dado que el modelo predice el token limpio en cada posición, puede emplearse en tareas de infilling o denoising controlado sobre texto en inglés o en lenguas celtas, siempre con validación humana.
- Experimentos con lenguas de bajos recursos del Reino Unido: el corpus incluye fuentes parlamentarias y celtas, por lo que el modelo puede usarse para estudiar comportamiento lingüístico en galés, gaélico, irlandés, manés, córnico y escocés a pequeña escala.
- Docencia y prototipado de difusión discreta: al ser un modelo de 0,1 GB ejecutable en una sola GPU, es adecuado para entornos de aprendizaje donde se quiera ilustrar el proceso de desenmascarado iterativo sin grandes recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación publicada es la siguiente:

| Metrica | Valor |
|---|---|
| ELBO negativo en canon retenido (canon-8192, 8192 x 2048 tokens, 16 máscaras por secuencia) | 3,1404 ± 0,0025 nats por token (± 1 error estándar) |

La model card advierte de que el ELBO negativo es una cota superior de la log-verosimilitud negativa del modelo y que puede compararse con la entropía cruzada de un modelo AR sobre el mismo canon como cota, no como medida equivalente.

Resultados de la comparación de muestreadores (celda N6-D5, 32 inicios retenidos, prompt de 32 tokens, 256 generados, una semilla):

| Muestreador | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7 % |
| Confianza, argmax, penalización de presencia 4 incluyendo prompt (por defecto) | 0,64 | 0,74 | 18 % |
| Igual, sin penalización | 0,15 | 0,16 | 80 % |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22 % |

Los errores estándar en bits por byte son de aproximadamente 0,06 con una sola semilla y 32 prompts. Cuatro tokens por paso degradan la calidad (0,73 bits por byte, bigramas distintos 0,49).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 59,5M de parámetros, en bf16 los pesos ocupan aproximadamente 0,12 GB; con activaciones y contexto de 2048 tokens el consumo se mantiene muy por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con soporte bf16. El entrenamiento se realizó en una NVIDIA GH200 de 120 GB, pero para inferencia es sobredimensionada.
- Cabe en GPU de consumo: sí, en cualquier RTX con bf16 (por ejemplo, RTX 3060, 4060, 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la model card solo documenta `transformers` con `AutoModel` y `trust_remote_code=True`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la naturaleza de difusión y el código personalizado hacen probable que estos motores no lo soporten sin adaptación.
- Latencia y throughput: no disponibles. Cabe señalar que `diffusion_generate` requiere `steps` pasadas hacia delante (recomendado `steps = gen_length`, es decir, 256 pasadas para 256 tokens), lo que implica un coste computacional sustancialmente mayor que una decodificación autorregresiva equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-59m-11.5bt-mdlm-cooled | 59,5M totales (27,3M no-embedding) | 2048 | MDLM (difusión enmascarada) | Apache 2.0 | Hugging Face |
| Addendum AR de VectaBass (mismo tamaño) | No disponible en la información | No disponible | Autorregresivo | No disponible | Liberado por separado según la model card |
| Celdas MDLM del "cuadrado" (100M a 1.6B) | 100M a 1.6B | No disponible | MDLM | No disponible | Parte del mismo proyecto |

No se dispone de datos de benchmarks comparativos frente a alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No está afinado para instrucciones ni para seguridad; no debe usarse como asistente conversacional sin un ajuste posterior.
- Los hechos que genera son a menudo incorrectos, según advierte la propia model card.
- El muestreador por defecto (confianza con argmax y penalización 4,0) es una heurística, no un muestreo exacto: sesga contra palabras repetidas y las listas, tablas y código, donde la repetición es correcta, no se probaron; las listas siguen repitiéndose.
- Sin penalización, el orden por confianza entra en bucle; con penalización 3 aún repite y con 6 pierde fluidez frente al texto real.
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR del mismo tamaño; temperatura, top-k, top-p y min-p intercambian fluidez por diversidad y nunca alcanzan el texto real.
- Mantener un token por paso (`steps = gen_length`); usar 4 tokens por paso degrada la calidad.
- Los resultados de evaluación se basan en una sola semilla y 32 prompts, con errores estándar de unos 0,06 bits por byte; la evidencia estadística es limitada.
- Contexto máximo de 2048 tokens, insuficiente para documentos largos.
- Cobertura lingüística restringida a siete lenguas; no se garantiza un comportamiento adecuado fuera de ellas.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo base sin ajuste, cualquier despliegue en producción requiere validación, filtrado y evaluación propios.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-59m-11.5bt-mdlm-cooled
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Documentación de datos del proyecto (`DATA.md`): referenciada en la model card, no se proporciona URL directa
- Paper del addendum MDLM: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
