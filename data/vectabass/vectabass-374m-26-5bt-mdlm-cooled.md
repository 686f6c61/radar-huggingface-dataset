# VectaBass/vectabass-374m-26.5bt-mdlm-cooled

## Resumen

vectabass-374m-26.5bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, masked diffusion language model) de 374 millones de parámetros totales (303,1 millones no pertenecientes a embeddings), entrenado desde cero por el autor VectaBass sobre 26.470 millones de tokens. Forma parte de la "MDLM square" de la fase 1: una escalera de modelos de 100M a 1.6B de parámetros no-embedding, cada tamano entrenado con varios presupuestos de tokens y publicado en conjunto para poder verificar empíricamente la ley de escalado. Esta celda concreta es la N3-D3 (303,1M no-embedding, 26,5B tokens).

El modelo no es un transformer autorregresivo al uso: reutiliza la pila tipo Llama de los modelos AR del proyecto (con self-attention exclusiva, XSA) pero la hace bidireccional y la entrena con el objetivo de difusión enmascarada de tiempo continuo (ELBO negativo ponderado por 1/t). No está ajustado a instrucciones ni a seguridad; es un modelo base de estudio.

Su relevancia es doble: por un lado, aporta un punto de medida reproducible para comparar leyes de escalado entre paradigmas AR y MDLM con los mismos datos y la misma escalera; por otro, incluye una comparativa empírica de aproximadamente 30 muestreadores sobre 32 inicios de documento, con métricas de fluidez (bits por byte UTF-8) y de repetición. El contexto es de 2048 tokens y la licencia es Apache 2.0. El foco idiomático es el inglés y las lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) junto con el escocés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con self-attention exclusiva (XSA), objetivo MDLM (difusión enmascarada) |
| Parametros totales | 373.942.272 (embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (RoPE, base 10000) |
| Tipos de cuantizacion | No disponible (la model card solo recomienda ejecutar en bf16, como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code`) |

Otros datos de la arquitectura: anchura 1408, 13 capas, 22 cabezas de consulta y 11 de clave-valor (GQA 2:1) de dimensión 64, feed-forward SwiGLU de 4112, RMSNorm pre-norm, token de máscara con id 50283 y vocabulario de 50304 filas (BPE de GPT-2 con 50257 tokens más 26 especiales y relleno).

## Arquitectura y entrenamiento

La red es la pila de los modelos autorregresivos del proyecto (estilo Llama con XSA) convertida en bidireccional. El objetivo es MDLM con alpha_t lineal (1 - t): la pérdida es el ELBO negativo en tiempo continuo, es decir, una entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. `model(ids).logits` devuelve, en cada posición, la distribución del token limpio; el token de máscara (id 50283) ocupa las posiciones desconocidas. `diffusion_generate` añade `gen_length` máscaras al prompt y las rellena a lo largo de `steps` pasadas hacia delante.

El entrenamiento consumió 26.465.140.736 tokens (87 por parámetro no-embedding) con lotes de 622.592 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momento 0.95) más AdamW en fp32 (0.9, 0.95), LR pico de 0.00124, calentamiento de 303M tokens, programación warmup-constante con cooldown 1-sqrt hasta 0 en el último 20% y weight decay de 0.0842 en matrices. Precisión bf16 en pesos y activaciones con pesos maestros fp32 en el optimizador; estadísticas de norma, ángulos RoPE y logits en fp32. Todo el entrenamiento se ejecutó en una única NVIDIA GH200 de 120 GB.

Los datos proceden de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96B de tokens únicos, con fuentes del sector público británico, parlamentarias y de lenguas celtas (fineweb-edu, fineweb-2, finemath). El detalle de cada bin, su peso y su licencia está en `DATA.md`. No hay RLHF ni DPO: es un modelo base.

## Capacidades

- Relleno de texto enmascarado: dado un contexto con huecos (token 50283), estima la distribución del token limpio en cada posición.
- Generación por difusión: `diffusion_generate` con orden aleatorio (proceso inverso nativo) u orden por confianza estilo MaskGIT.
- Extracción de características: el pipeline declarado es `feature-extraction`, por lo que las representaciones internas son utilizables como embeddings contextuales bidireccionales.
- Multilingüismo limitado a inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No dispone de tool calling, function calling, modo de razonamiento explícito, visión ni audio.
- No está ajustado a instrucciones: no sigue instrucciones de forma fiable ni mantiene diálogos multi-turno como un modelo chat.

## Casos de uso

- Estudio de leyes de escalado: la celda N3-D3 se usa junto al resto de la escalera (100M a 1.6B no-embedding, varios presupuestos de tokens) para ajustar curvas de pérdida frente a parámetros y tokens y compararlas con la escalera AR entrenada con los mismos datos.
- Investigación en modelos de difusión de lenguaje: sirve como banco de pruebas reproducible para comparar muestreadores (orden aleatorio frente a confianza, penalizaciones de presencia, pasos por token) con la métrica de bits por byte y las tasas de bigramas distintos y 4-gramas repetidos.
- Relleno de texto (text infilling): tareas de completar huecos en documentos donde el contexto a izquierda y derecha es relevante, aprovechando la atención bidireccional nativa.
- Embeddings contextuales para lenguas celtas: extracción de representaciones para clasificación o agrupamiento de texto en galés, gaélico escocés, irlandés, manés, córnico y escocés, idiomas poco cubiertos por modelos comerciales.
- Reproducción de resultados: los pesos reproducen bit a bit los logits del código de entrenamiento en filas enmascaradas del canon, lo que permite validar implementaciones propias de MDLM contra una referencia publicada.
- Docencia y experimentación con hardware modesto: con 374M de parámetros totales y un repo de 0,7 GB, cabe en una sola GPU de consumo para experimentos de difusión de lenguaje sin infraestructura grande.
- No es adecuado para generación de contenido en producción, atención al cliente ni generación de código: la model card advierte de que los hechos suelen ser erróneos y de que las listas se repiten.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks zero-shot (MMLU, HumanEval, GSM8K u otros) para los modelos MDLM de este proyecto; la model card lo indica explícitamente. La única métrica de evaluación publicada es el ELBO negativo sobre el canon retenido phase-1-release canon-8192 (8192 secuencias de 2048 tokens, 16 sorteos de máscara por secuencia): **2,5819 ± 0,0025 nats por token** (± un error estándar). Una estimación independiente con un solo sorteo bajo PyTorch SDPA da 2,5804 ± 0,0101 (el entrenamiento usó FlashAttention-4). El ELBO negativo es una cota superior de la log-verosimilitud negativa, por lo que solo es comparable con la entropía cruzada de un modelo AR sobre el mismo canon como cota, no como medida equivalente.

La comparativa de muestreadores se realizó sobre la celda N6-D5, no sobre esta, con 32 inicios de documento retenidos (prompt de 32 tokens, 256 generados, una semilla) y puntuación con Qwen3-8B-Base:

| Muestreador | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| Confianza, argmax, penalización 4 incl. prompt (recomendado) | 0,64 | 0,74 | 18% |
| Igual, sin penalización | 0,15 | 0,16 | 80% |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22% |

El error estándar en bits por byte es de aproximadamente 0,06 con una semilla y 32 prompts.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: alrededor de 0,75 GB para los pesos (373,9M parámetros x 2 bytes), más activaciones y caché; en la práctica cabe holgadamente en 4-8 GB.
- Entrenado en una NVIDIA GH200 de 120 GB, pero la inferencia no requiere nada parecido.
- Cabe en cualquier GPU de consumo moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) e incluso en GPUs de 8 GB.
- Despliegue: la vía soportada es `transformers` con `trust_remote_code=True` (carga `modeling_vectabass.py`) y `dtype=torch.bfloat16`; la model card no menciona soporte de vLLM, llama.cpp, Ollama ni TGI, y al requerir código remoto y un objetivo de difusión es previsible que estos motores no lo soporten sin adaptación.
- Latencia y throughput: no disponibles. Como referencia de coste, la configuración recomendada usa `steps = gen_length` (un token por paso), es decir, 256 pasadas hacia delante para generar 256 tokens; usar 4 tokens por paso degrada la calidad (0,73 bits por byte, bigramas distintos 0,49).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-374m-26.5bt-mdlm-cooled | 373,9M totales (303,1M no-embedding) | 2048 | MDLM bidireccional | Apache 2.0 | Hugging Face |
| Escalera AR del mismo proyecto (fase 1) | 100M a 1.6B no-embedding | No disponible | Autorregresivo | No disponible en la información | Publicada por separado según la model card |
| Otras celdas de la MDLM square (fase 1) | 100M a 1.6B no-embedding, varios presupuestos de tokens | No disponible | MDLM | No disponible en la información | Publicadas junto a esta |

La comparación más directa es interna al proyecto: el modelo AR equivalente de la misma escalera, entrenado con los mismos datos y el mismo presupuesto de tokens, que la model card cita como referencia de fluidez (el muestreo ancestral exacto del MDLM es "mucho menos fluido" que el AR del mismo tamano). No se dispone de datos de benchmarks comparativos con modelos externos de tamano similar.

## Limitaciones y advertencias

- Modelo base sin ajuste a instrucciones ni a seguridad: no debe usarse como asistente conversacional ni en producción orientada a usuarios sin un ajuste posterior.
- Alucinación: la model card afirma que los hechos suelen ser erróneos.
- El orden por confianza con argmax y penalización de presencia 4 es una heurística, no un muestreo exacto: sesga contra palabras repetidas, y las listas, tablas y código (donde la repetición es correcta) no se probaron y las listas siguen repitiéndose. Sin penalización, el orden por confianza entra en bucle; con penalización 3 aún repite y con 6 es menos fluido que el texto real.
- Debe mantenerse un token por paso (`steps = gen_length`); con 4 tokens por paso la calidad cae.
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR del mismo tamano; temperatura, top-k, top-p y min-p no alcanzan la fluidez del texto real.
- Cobertura idiomática limitada a siete lenguas (inglés, celtas y escocés); el rendimiento fuera de ellas no está documentado.
- Contexto corto (2048 tokens), insuficiente para documentos largos o conversaciones extensas.
- La evaluación se basa en una única semilla y 32 prompts, con errores estándar de unos 0,06 bits por byte; los resultados son indicativos, no concluyentes.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo de investigación sin benchmarks zero-shot ni ajuste de seguridad, su idoneidad para producción no está respaldada por datos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio (`modeling_vectabass.py`); conviene auditar ese archivo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-374m-26.5bt-mdlm-cooled
- Documentación de datos del proyecto: `DATA.md` en el repositorio del modelo (no se ha proporcionado URL directa)
- Código de modelado: `modeling_vectabass.py` en el repositorio del modelo (no se ha proporcionado URL directa)
- Conjuntos de datos citados: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/HuggingFaceFW/fineweb-2, https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper, blog, repositorio de entrenamiento y demos: no disponibles en la información proporcionada.
