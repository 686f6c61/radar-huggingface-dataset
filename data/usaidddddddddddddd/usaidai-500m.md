# Usaidddddddddddddd/UsaidAI-500M

## Resumen

Usaid AI (500M) es un modelo de lenguaje causal autoregresivo de tipo decoder-only, desarrollado de forma íntegra desde cero por Mohamed Usaid. Con 500.136.960 parámetros exactos, se presenta como un experimento independiente que no deriva de ningún fine-tune, merge ni destilación de modelos previos: todos los pesos se inicializaron aleatoriamente y se entrenaron sobre datos de tokens crudos. Su relevancia radica en ser un ejemplo reproducible de pipeline completo (preentrenamiento y alineamiento SFT) ejecutado con recursos modestos (dos GPU Tesla T4 de 16 GB).

La arquitectura es un transformer denso de 30 capas con dimensión oculta de 1.024, atención de consultas agrupadas (GQA con ratio 4:1), codificación posicional rotatoria (RoPE), normalización RMSNorm y FFN con activación SwiGLU. Emplea un vocabulario BPE de 50.257 tokens (tiktoken/GPT-2) y una longitud de contexto nativa de 1.024 tokens, extensible a 2.048. El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y cuantizaciones GGUF de terceros.

El entrenamiento de preentrenamiento ingirió aproximadamente 131 millones de tokens, un volumen muy inferior al óptimo Chinchilla para su tamaño, y la fase de alineamiento SFT se realizó sobre 4.731 pares de instrucciones conversacionales y de programación. Se trata, por tanto, de un modelo experimental orientado a la investigación y a la demostración de metodología más que a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only denso (GQA, RoPE, SwiGLU, RMSNorm, pre-normalizacion) |
| Parametros totales | 500.136.960 |
| Parametros activos | 500.136.960 (arquitectura densa; el 100% activo por token) |
| Longitud de contexto | 1.024 tokens nativos (extensible a 2.048) |
| Tipos de cuantizacion | GGUF disponible via repositorio de terceros (mradermacher); tipos concretos no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; cuantizaciones GGUF de terceros |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa (no MoE) con 30 capas de atención y feed-forward. La dimensión oculta es de 1.024 (elegida como potencia de 2 para facilitar el tiling en Tensor Cores), con 16 cabezas de consulta de dimensión 64 y 4 cabezas clave/valor, lo que da un ratio GQA de 4:1 y una compresión del KV cache del 75%. La FFN usa formulación SwiGLU de tres matrices con dimensión intermedia d_ff = 3.456. La normalización es RMSNorm pre-normalización con escala aprendible, la posición se codifica con RoPE vectorizado (theta = 10.000) y el kernel de atención es el `scaled_dot_product_attention` nativo de PyTorch. Las embeddings de entrada y la LM head no están atadas (51,46M + 51,46M), y el vocabulario es de 50.257 tokens BPE.

El preentrenamiento se ejecutó sobre dos GPU Tesla T4 (2 x 16 GB, 32 GB GDDR6 en total) con PyTorch DistributedDataParallel, precisión mixta AMP FP16 y optimizador CUDA Fused AdamW (beta1 = 0.9, beta2 = 0.95, weight decay 0.1 con exclusión de sesgos y normas 1D). Se usó un esquema de learning rate con warmup lineal y decaimiento coseno (de 1e-6 a 3e-4 y de ahí a 3e-5) y una geometría de batch de 65.536 tokens por paso (micro-batch 2 x acumulación 16 x 1.024 de secuencia x 2 GPU). El corpus combinó FineWeb-Edu, Cosmopedia-v2 (libros de texto sintéticos), Python-Edu, C/C++, Java y SmolTalk, sumando 131.072.000 tokens en 2.000 pasos. La convergencia medida fue: pérdida de validación 3,5274 en el paso 800 (perplejidad 34,04), 3,0410 en el paso 1600 (perplejidad 20,93) y 2,9091 en el paso 2000 (perplejidad 18,34). El ajuste fino SFT posterior usó 4.731 pares de instrucciones con enmascaramiento estricto de la pérdida del prompt (los tokens de `User: ...` se etiquetan con `target = -100`), propagando unos 28,9 millones de tokens en 3 épocas y 441 pasos. La información disponible se interrumpe antes de detallar la convergencia final del SFT.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Razonamiento básico de conversación gracias al ajuste SFT sobre pares instrucción-respuesta.
- Generación y asistencia en código en Python, C/C++ y Java, dado que estos lenguajes forman parte del corpus de preentrenamiento y del dataset de instrucciones.
- Capacidad multilingüe limitada: el dataset SFT incluye pares de programación multi-idioma, pero el modelo está etiquetado oficialmente solo para inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de pensamiento (thinking mode), visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Prototipado académico de pipelines desde cero: sirve como referencia completa de preentrenamiento y SFT con recursos limitados (2 x T4), útil para investigadores que quieran reproducir o auditar la metodología.
- Generación de código en scripts y utilidades pequeñas: al haberse entrenado con corpus Python-Edu, C/C++ y Java y con pares de instrucciones de programación, puede asistir en tareas acotadas de autocompletado o generación de fragmentos.
- Aprendizaje y docencia de LLM: su tamaño (500M) y su ventana de 1.024 tokens permiten experimentar con fine-tuning y cuantización en hardware de consumo.
- Generación de texto corto en inglés: resúmenes, respuestas breves o textos sintéticos dentro del límite de 1.024 tokens de contexto.
- Chat conversacional de propósito general: el ajuste SFT con enmascaramiento de prompt está orientado a formato diálogo, adecuado para demos interactivas vía el Space oficial.
- Base para experimentos de alineamiento: el checkpoint preentrenado y el ajustado permiten comparar técnicas de SFT, enmascaramiento de pérdida y evaluación de convergencia.
- Inferencia local en CPU/GPU modesta: gracias a la disponibilidad de cuantizaciones GGUF, es viable desplegarlo en portátiles o estaciones sin GPU dedicada para pruebas de concepto.
- Evaluación de técnicas arquitectónicas modernas: GQA, RoPE, SwiGLU y RMSNorm en un modelo pequeño, útil como banco de pruebas comparativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los únicos datos cuantitativos aportados son las métricas de convergencia del entrenamiento:

| Metrica | Paso 800 (40%) | Paso 1600 (80%) | Paso 2000 (100%) |
|---|---|---|---|
| Perdida de entrenamiento | 3,6849 | 3,1250 | 2,9623 |
| Perdida de validacion | 3,5274 | 3,0410 | 2,9091 |
| Perplejidad de validacion | 34,04 | 20,93 | 18,34 |

No hay datos comparativos con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: alrededor de 1 GB para los pesos (500M parámetros) más el coste del KV cache, que es reducido gracias a GQA 4:1 y contexto de 1.024 tokens.
- VRAM estimada en cuantización de 8 bits: aproximadamente 500-600 MB; en 4 bits, aproximadamente 300-400 MB (según cuantización GGUF concreta, no especificada).
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o CPU con cuantizaciones GGUF.
- GPU de entrenamiento original: 2 x NVIDIA Tesla T4 (16 GB cada una) con PyTorch DDP.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) mediante los GGUF de terceros; conversión a vLLM o TGI posible partiendo de safetensors, aunque no se documenta oficialmente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Usaid AI (500M) | 500,14M | 1.024 | Apache 2.0 | HuggingFace (safetensors, GGUF terceros) | Solo perplejidad de validacion (18,34) |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | HuggingFace | Benchmarks publicos disponibles |
| SmolLM2-360M | 362M | 8.192 | Apache 2.0 | HuggingFace | Benchmarks publicos disponibles |
| TinyLlama-1.1B | 1.100M | 2.048 | Apache 2.0 | HuggingFace | Benchmarks publicos disponibles |

Nota: los datos de los modelos comparativos corresponden a especificaciones publicas ampliamente conocidas; no se dispone en la informacion proporcionada de una comparacion de rendimiento directa con Usaid AI (500M). El factor diferencial de Usaid AI es un contexto muy reducido (1.024 tokens) y un volumen de entrenamiento (131M tokens) muy inferior al de sus alternativas.

## Limitaciones y advertencias

- Volumen de preentrenamiento muy bajo: 131 millones de tokens para 500M parámetros, muy por debajo del óptimo Chinchilla (que rondaría los 10.000 millones de tokens), lo que limita severamente la calidad frente a modelos del mismo tamaño entrenados con billones de tokens.
- Contexto muy corto: 1.024 tokens nativos, insuficiente para documentos largos, conversaciones extensas o código de gran tamaño.
- Solo inglés: el modelo está etiquetado oficialmente para inglés; su rendimiento en castellano u otros idiomas es previsiblemente muy pobre pese a menciones de pares de programación multi-idioma en el SFT.
- Riesgo elevado de alucinación y de respuestas incoherentes, propio de un modelo experimental de este tamaño y con este presupuesto de cómputo.
- Sesgos conocidos: no disponibles en la información proporcionada, aunque al entrenarse con FineWeb-Edu y Cosmopedia-v2 hereda los sesgos de dichas fuentes web y sintéticas.
- Uso comercial: la licencia Apache 2.0 lo permite, pero no se ofrecen garantías de calidad, exactitud ni idoneidad para producción.
- No hay benchmarks estandarizados publicados, por lo que no es posible validar su rendimiento frente a alternativas con datos objetivos.
- El ajuste SFT se realizó con un dataset de tan solo 4.731 pares, lo que reduce la robustez del alineamiento.
- El rendimiento específico de las cuantizaciones GGUF de terceros no está validado por el autor del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Usaidddddddddddddd/UsaidAI-500M
- Space de chat interactivo: https://huggingface.co/spaces/Usaidddddddddddddd/UsaidAI-500M-Chat
- Cuantizaciones GGUF (llama.cpp, de terceros): https://huggingface.co/mradermacher/UsaidAI-500M-GGUF
- Repositorio de código fuente (TinyGPT): https://github.com/mohamedusaid/TinyGPT
- Telemetría de entrenamiento (Trackio): https://github.com/gradio-app/trackio

Nota: los resultados de la búsqueda web proporcionados no contienen enlaces relacionados con este modelo.
