# XGeorgeCostanzaX/LFM2.5-24B-A2B-Nyquant-Q4-preview

## Resumen

LFM2.5-24B-A2B-Nyquant-Q4-preview es una cuantización GGUF de 4 bits del modelo LiquidAI/LFM2.5-24B-A2B, publicada por el usuario XGeorgeCostanzaX. No se trata de un modelo entrenado desde cero, sino de una reconstrucción de pesos orientada a inferencia local eficiente: el autor aplica una matriz de importancia (imatrix) para asignar precisión de forma selectiva, manteniendo los expertos enrutados en torno a 4 bits y preservando a mayor precisión las capas más sensibles (atención, convolución corta, FFN densa y embeddings). El resultado son tres ficheros de entre 12 y 14 GB que caben en GPUs de consumo con 16 GB de VRAM.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 23.971.587.712 parámetros totales y aproximadamente 2B activos por token, lo que explica la relación entre tamaño en disco y velocidad de decodificación. La arquitectura se etiqueta como "lfm2" e incorpora convolución corta junto a atención, aunque la información disponible no detalla la proporción entre ambos mecanismos. El contexto, los idiomas y los datos de entrenamiento del modelo base no se especifican en la información proporcionada.

La relevancia de esta publicación es práctica: ofrece una alternativa de cuantización con métricas de calidad publicadas (KLD frente a BF16, perplejidad por corpus y velocidades medidas en una Tesla P100), algo poco habitual en cuantizaciones comunitarias. El propio autor advierte que son previews y que el GGUF público unsloth UD-Q4_K_XL obtiene mejor KLD (0.0310 frente a 0.0362) con 1 GB más de tamaño, por lo que no reclama superioridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta "lfm2"), con atención y convolución corta; detalles no disponibles |
| Parametros totales | 23.971.587.712 (unos 24B) |
| Parametros activos | Aproximadamente 2B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF de 4 bits con asignación por tensor: expertos enrutados a ~4 bits; atención, convolución corta, FFN densa y embeddings a mayor precisión. Tres variantes: ar4match (4,63 bits/peso), iq4xs (4,37 bits/peso) y F12000 (4,01 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp), con matriz de importancia (imatrix) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-24B-A2B es un transformer con mezcla de expertos: 24B parámetros totales con unos 2B activos por token. La etiqueta "lfm2" y la mención explícita a "short-conv" en la model card indican la presencia de capas convolucionales cortas junto a los mecanismos de atención, un patrón habitual en la familia LFM de LiquidAI para reducir coste de inferencia en secuencias largas. La información disponible no especifica el número de capas, la dimensión oculta, el número de expertos por capa ni la proporción exacta entre atención y convolución.

Esta publicación concreta no entrena el modelo: cuantiza los pesos originales. El proceso combina una matriz de importancia con una asignación de bits por tensor, de modo que los expertos enrutados (la mayor parte del peso) quedan en torno a 4 bits mientras las capas más sensibles conservan precisión superior. El autor indica que reconstrucciones con imatrix simple de la misma receta puntúan igual que estos ficheros, lo que sugiere que la ganancia proviene principalmente de la asignación por tensor y no de un procedimiento de optimización adicional. No se detallan los datos de entrenamiento del modelo base, ni si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el modelo está etiquetado como "conversational".
- Razonamiento y generación de código: la evaluación por corpus incluye chat, web y código, lo que confirma que el modelo base maneja estos dominios, aunque no se publican puntuaciones de benchmarks de tareas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el modelo base no declara idiomas en esta ficha.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Despliegue compatible con endpoints: la etiqueta "endpoints_compatible" sugiere uso en infraestructura de inferencia gestionada, aunque no se detalla cuál.

## Casos de uso

- Inferencia local en GPU de consumo: con 12 a 14 GB en disco y unos 16 GB de VRAM recomendados por el autor, el fichero ar4match permite ejecutar un MoE de 24B en una RTX 4090, una RTX 4080 Super o una Tesla P100 de 16 GB, algo inviable con los pesos en BF16.
- Servicio de chat con latencia ajustada: al activar solo unos 2B parámetros por token, la decodificación medida alcanza 63-68 tok/s en una P100, suficiente para asistentes conversacionales interactivos en hardware modesto.
- Prellenado de prompts largos en servidores de gama media: las velocidades de prefill medidas (518-579 tok/s en pp512 sobre P100) permiten procesar contextos de entrada considerables sin cuellos de botella severos.
- Prototipado y evaluación de aplicaciones sobre llama.cpp: al ser GGUF, se integra directamente en llama.cpp y en herramientas derivadas, lo que facilita pruebas de integración antes de pasar a un despliegue con pesos completos.
- Generación de código en entornos con recursos limitados: el corpus de código es el que menor KLD presenta en todas las variantes (0,0189 en ar4match), lo que respalda su uso para autocompletado y generación de fragmentos en un equipo de desarrollo con una sola GPU.
- Investigación sobre cuantización: los tres ficheros, con métricas de KLD, perplejidad y velocidad publicadas y comparadas con cuantizaciones de unsloth y de Liquid AI, sirven como material de referencia para estudiar el compromiso entre tamaño y degradación.
- Despliegue en estaciones de trabajo con 16 GB de VRAM para tareas de resumen y redacción: el corpus de chat muestra un KLD de 0,0235 en la mejor variante, el más bajo de los tres corpus, lo que indica menor degradación en texto conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. Sí se publican métricas de fidelidad de cuantización frente al modelo en BF16 y velocidades medidas.

| Modelo | Tamano (GB) | Bits/peso | KLD chat | KLD web | KLD code | Macro KLD [IC 95%] | Media geometrica |
|---|---:|---:|---:|---:|---:|---|---:|
| unsloth UD-Q4_K_XL | 14,87 | no disponible | 0,0193 | 0,0583 | 0,0156 | 0,0310 [0,0289; 0,0335] | 0,0260 |
| Nyquant ar4match | 13,88 | 4,63 | 0,0235 | 0,0662 | 0,0189 | 0,0362 [0,0338; 0,0388] | 0,0309 |
| QAD-Q4_0 (Liquid AI) | 13,57 | no disponible | 0,0428 | 0,1375 | 0,0320 | 0,0708 [0,0665; 0,0754] | 0,0574 |
| Nyquant iq4xs | 13,09 | 4,37 | 0,0252 | 0,0731 | 0,0206 | 0,0396 [0,0367; 0,0427] | 0,0336 |
| Nyquant F12000 | 12,00 | 4,01 | 0,0387 | 0,1008 | 0,0287 | 0,0560 [0,0526; 0,0598] | 0,0482 |
| unsloth UD-Q3_K_XL | 10,94 | no disponible | 0,0554 | 0,1411 | 0,0390 | 0,0785 [0,0739; 0,0834] | 0,0673 |

| Modelo | PPL chat | PPL web | PPL code |
|---|---:|---:|---:|
| unsloth UD-Q4_K_XL | 3,71 | 17,23 | 1,62 |
| Nyquant ar4match | 3,73 | 16,97 | 1,62 |
| QAD-Q4_0 (Liquid AI) | 3,65 | 16,74 | 1,61 |
| Nyquant iq4xs | 3,71 | 16,93 | 1,63 |
| Nyquant F12000 | 3,77 | 17,13 | 1,64 |
| unsloth UD-Q3_K_XL | 3,78 | 17,05 | 1,63 |

Velocidades medidas en Tesla P100 de 16 GB a 125 W, con llama-bench, KV en f16, flash attention activado, tg128 a profundidad 0 y pp512, media de 5 ejecuciones:

| Fichero | Decodificacion (tok/s) | Prellenado (tok/s) |
|---|---:|---:|
| ar4match | 67,8 | 518,5 |
| iq4xs | 63,4 | 579,3 |
| F12000 | 63,8 | 576,0 |

El autor advierte que las velocidades en otras GPUs son aproximadas y que su tabla de rendimiento es en gran parte una proyección. Cuatro GGUFs públicos adicionales (bartowski IQ4_XS y Q3_K_L, ggml-org Q4_K_M, mradermacher i1-IQ4_XS) fueron evaluados pero se retienen pendientes de una nueva ejecución por una configuración de inicio de texto distinta.

## Requisitos de hardware

- VRAM estimada: unos 16 GB para el fichero ar4match (13,88 GB en disco); 14-15 GB para iq4xs (13,09 GB); 13-14 GB para F12000 (12,00 GB). Hay que sumar la memoria del contexto KV en f16, que crece con la longitud de secuencia.
- GPU recomendadas: Tesla P100 de 16 GB (medida por el autor), RTX 4090 (24 GB), RTX 4080 Super (16 GB), A100 y H100 con holgura. El autor menciona explícitamente "about 16 GB of VRAM" como requisito para la variante de mayor calidad.
- GPU de consumo: sí cabe en RTX 4090, RTX 4080/4080 Super y modelos de 16 GB o más. En GPUs de 12 GB no cabe el fichero completo y requeriría offload parcial a CPU, con la penalización de velocidad correspondiente.
- Opciones de despliegue: llama.cpp (formato nativo), y por extensión herramientas basadas en llama.cpp como Ollama o llama-cpp-python. No se confirma soporte de vLLM ni TGI para este formato GGUF en la información disponible.
- Latencia y throughput: en P100, 67,8 tok/s de decodificación y 518,5 tok/s de prellenado para ar4match. En GPUs más rápidas se espera mayor throughput, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD macro | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nyquant ar4match (este) | 24B totales, ~2B activos | no disponible | 0,0362 | 13,88 GB | lfm1.0 | GGUF en Hugging Face |
| unsloth UD-Q4_K_XL | mismo base | no disponible | 0,0310 | 14,87 GB | lfm1.0 | GGUF público |
| QAD-Q4_0 (Liquid AI) | mismo base | no disponible | 0,0708 | 13,57 GB | lfm1.0 | GGUF público |
| unsloth UD-Q3_K_XL | mismo base | no disponible | 0,0785 | 10,94 GB | lfm1.0 | GGUF público |

La comparación relevante es entre cuantizaciones del mismo modelo base, ya que todas comparten arquitectura, parámetros y licencia. Frente a alternativas de otros fabricantes del mismo rango (por ejemplo, MoEs de 20-30B con 2-3B activos) no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- Es una versión "preview": el autor indica que los ficheros no están decididos por ninguna de las dos reglas de selección que aplicará en la próxima release (panel de chat on-policy y regla Balanced sobre cuatro corpus).
- El GGUF unsloth UD-Q4_K_XL obtiene mejor KLD macro (0,0310 frente a 0,0362) en los tres corpus, con 1 GB más de tamaño; no hay una ventaja de calidad demostrada frente a esa alternativa.
- La licencia lfm1.0 ("other" en Hugging Face) impone condiciones adicionales; deben revisarse los términos del fichero LICENSE del modelo base antes de cualquier uso comercial.
- No se especifican idiomas soportados, longitud de contexto ni datos de entrenamiento, lo que limita la evaluación de idoneidad para casos multilingües o de contexto largo.
- No hay benchmarks de tareas (razonamiento, código, matemáticas) publicados para esta cuantización; las métricas disponibles miden fidelidad respecto a BF16, no capacidad absoluta.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los del modelo base, que tampoco los detalla.
- Las velocidades publicadas corresponden a una única GPU (Tesla P100); el propio autor califica de aproximada la extrapolación a otros aceleradores.
- El repositorio tiene 0 likes y 3328 descargas, con fecha de creación en octubre de 2026; es una publicación comunitaria sin el respaldo del desarrollador original del modelo.
- La cuantización a ~4 bits introduce degradación medible: la variante más pequeña (F12000) multiplica por más de 1,5 el KLD macro respecto a la mayor (0,0560 frente a 0,0362).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/XGeorgeCostanzaX/LFM2.5-24B-A2B-Nyquant-Q4-preview
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Cuantización de referencia unsloth (mencionada en la comparativa): no disponible como enlace en la información proporcionada
- Paper, blog o demo del autor: no disponible en la información proporcionada
