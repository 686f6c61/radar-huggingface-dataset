# thinkspread/Qwen3.5-35B-A3B-Q5K-IQ3XXS-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantizacion GGUF mixta de Qwen/Qwen3.5-35B-A3B, un transformer de tipo mezcla de expertos (MoE) con 34.660.610.688 parametros totales. La publica el usuario thinkspread bajo licencia Apache 2.0, heredada del modelo base, y su objetivo es muy concreto: que un MoE de ~35B quepa y decodifique rapido en la memoria unificada de 24 GB de un Mac con Apple Silicon, sin perder perplejidad respecto a las cuantizaciones de baja precision habituales.

La innovacion no esta en los pesos, sino en la receta de cuantizacion. En un MoE que solo lee 8 de 256 expertos por token, lo que domina el ancho de banda por token son los tensores densos (proyecciones de Gated DeltaNet y de atencion, experto compartido y `lm_head`), no los expertos enrutados. El autor mantiene los expertos enrutados con los mismos tipos del fichero Q3_K_M de unsloth (IQ3_XXS en gate/up, IQ4_XS en down) y rebaja solo las capas densas de Q8_0 a Q5_K, lo que reduce la lectura por token de 2,56 GB a 1,84 GB.

El resultado declarado por el autor es un unico fichero de 15,7 GB que decodifica entre 74,1 y 76,9 tok/s en un Apple M5 Pro de 24 GB, un 18 % mas rapido que el Q3_K_M con densas en Q8_0, con una perplejidad practicamente identica (6,801 frente a 6,785). Es relevante ahora porque permite ejecutar un modelo de categoria 35B-A3B en hardware de consumo de gama alta sin renunciar a la calidad de las capas que mas impactan en la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas densas de Gated DeltaNet y proyecciones de atencion; 256 expertos enrutados con 8 activos por token; experto compartido |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | No disponible con precision; la nomenclatura «A3B» del modelo base indica ~3.000 millones activos por token |
| Longitud de contexto | No disponible (no declarada en la model card) |
| Tipos de cuantizacion | Mixta: capas densas en Q5_K, expertos enrutados en IQ3_XXS (gate/up) e IQ4_XS (down), embeddings de tokens en Q4_K, router MoE en F32 |
| Idiomas soportados | No disponibles (la model card no los detalla) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-35B-A3B) |
| Formato de pesos | GGUF, fichero unico `Qwen3.5-35B-A3B-Q5K_IQ3XXS.gguf` de 15,7 GB |
| Tamano del repositorio | 15,7 GB |
| Lectura por token | 1,84 GB |
| Herramientas compatibles | llama.cpp (`llama-server`, `llama-quantize`, `llama-perplexity`), tempo9 |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina capas densas de Gated DeltaNet (mecanismo de estado lineal) con proyecciones de atencion clasicas, y un bloque MoE de 256 expertos enrutados del que se activan 8 por token, ademas de un experto compartido. Esta mezcla implica que el coste por token no depende del total de parametros (34,66 B) sino del subconjunto leido en cada paso: los tensores densos mas los 8 expertos seleccionados por el router.

Sobre el entrenamiento del modelo base no hay informacion en la documentacion proporcionada: no se detalla el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. Lo que si documenta el autor es el proceso de cuantizacion, reproducible con `llama-quantize --allow-requantize --pure` partiendo del fichero Q3_K_M: los tensores de expertos conservan su tipo y se copian sin modificar, mientras que las capas densas se recuantizan a Q5_K y los embeddings a Q4_K. El router MoE se mantiene en F32. Como `llama-quantize` exige una matriz de importancia cuando aparece un tipo IQ3 entre los objetivos, se pasa una matriz de unos que cubre solo los tensores de expertos y que nunca se aplica: los tensores densos se cuantizan sin importancia matrix, un detalle relevante para quien quiera reproducir o modificar la receta.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, en el pipeline `text-generation` declarado por el autor.
- Razonamiento y generacion de codigo: capacidad heredada del modelo base Qwen3.5-35B-A3B, no documentada de forma especifica en este repositorio.
- Servido local con API compatible con OpenAI y Anthropic a traves de tempo9, lo que permite integrarlo en aplicaciones existentes sin cambiar el cliente.
- Inferencia con llama.cpp (`llama-server`) con soporte de offload completo a GPU (`-ngl 99`) y atencion flash (`-fa on`).
- Aprovechamiento de arquitectura MoE: solo se leen 8 de 256 expertos por token, lo que reduce el ancho de banda de memoria por token a 1,84 GB.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada (el servidor tempo9 permite conectarlo a frameworks de agentes, pero no se documenta el soporte nativo del modelo).
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Vision, audio o modo «thinking»: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional totalmente local en un Mac de 24 GB: el fichero de 15,7 GB cabe en la memoria unificada y decodifica a 74-77 tok/s en un M5 Pro, suficiente para interaccion en tiempo real sin enviar datos a la nube.
- Generacion de codigo en portatil sin GPU dedicada: con `llama-server -ngl 99 -fa on` se obtiene un endpoint HTTP local que se puede conectar al IDE o a un CLI de programacion, manteniendo el codigo fuente dentro de la maquina.
- RAG sobre documentacion interna: al exponer una API compatible con OpenAI mediante tempo9, se puede enchufar a frameworks de orquestacion existentes que ya esperan ese contrato, con la ventaja de que el corpus no sale del equipo.
- Procesamiento por lotes de prosa tecnica en ingles: la perplejidad del autor se mide precisamente sobre 24 fragmentos de 2048 tokens de prosa tecnica inglesa (PPL 6,801), el dominio donde la receta esta verificada; util para resumen, extraccion y clasificacion de documentacion tecnica.
- Prototipado y auditoria de recetas de cuantizacion: el repositorio documenta el comando exacto de `llama-quantize`, los tipos por tensor y la excepcion de la matriz de importancia, lo que lo convierte en una referencia reproducible para investigadores que comparan mezclas de cuantizacion en MoE.
- Evaluacion comparativa de velocidad y calidad en Apple Silicon: sirve como base para medir el compromiso entre lectura por token y perplejidad (1,60 GB / PPL 7,014 con Q4_K frente a 2,10 GB / PPL 6,784 con Q6_K) antes de fijar una configuracion de produccion.
- Despliegue en estaciones de trabajo sin GPU de datacenter: al ser un unico GGUF, se distribuye y versiona como un artefacto mas, sin necesidad de cargar safetensors fragmentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas mediciones son las del autor, realizadas en un Apple M5 Pro con 24 GB usando tempo9 (generacion greedy de 256 tokens, prompt corto, dos rondas intercaladas) y `llama-perplexity` sobre 24 fragmentos de 2048 tokens de prosa tecnica en ingles; el propio autor indica que la perplejidad es solo valida como comparacion relativa.

| Fichero | Capas densas | Lectura por token | Decode (tok/s) | PPL |
|---|---|---|---|---|
| unsloth Q3_K_M | Q8_0 | 2,56 GB | 63,5–64,8 | 6,785 |
| Este fichero | Q5_K | 1,84 GB | 74,1–76,9 | 6,801 |
| Variante densa Q6_K | Q6_K | 2,10 GB | 69,0–70,2 | 6,784 |
| Variante densa Q4_K | Q4_K | 1,60 GB | 80,5–83,8 | 7,014 |

El autor cifra la mejora de decodificacion en aproximadamente un 18 % frente al Q3_K_M con densas en Q8_0, y atribuye al paso a Q4_K un coste del 3,4 % de perplejidad, motivo por el que se detiene en Q5_K.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 15,7 GB de pesos en disco; con cache KV y overhead de runtime hay que prever del orden de 18-20 GB de memoria disponible para contextos moderados (estimacion a partir del tamano del fichero, no publicada por el autor).
- Hardware medido: Apple M5 Pro con 24 GB de memoria unificada, donde el autor confirma que el conjunto de trabajo cabe en la GPU.
- GPU consumer: cabe en tarjetas de 24 GB de VRAM (RTX 3090, RTX 4090) siempre que se ajuste el contexto; en tarjetas de 16 GB no entra con offload completo de los 15,7 GB de pesos.
- GPU de datacenter: A100 40/80 GB y H100 quedan sobredimensionadas para el fichero, pero no hay mediciones de throughput publicadas en estas plataformas.
- Opciones de despliegue: llama.cpp (`llama-server -hf ...:Q5K_IQ3XXS -ngl 99 -fa on`) y tempo9 (`tempo9 --hf thinkspread/Qwen3.5-35B-A3B-Q5K-IQ3XXS-GGUF`). Soporte en vLLM, TGI u Ollama no esta confirmado en la informacion disponible.
- Latencia y throughput: 74,1-76,9 tok/s de decodificacion en single-stream sobre M5 Pro de 24 GB; no hay datos de prompt processing ni de rendimiento en CUDA.

## Comparativa con modelos similares

No hay datos publicados en la informacion disponible para comparar con otros modelos de la misma categoria. La comparacion posible es con las cuantizaciones hermanas del mismo modelo base, todas sobre Qwen3.5-35B-A3B (34,66 B totales, 8 de 256 expertos activos, licencia Apache 2.0):

| Alternativa | Precision de densas | Tamano / lectura por token | Decode (tok/s) | PPL |
|---|---|---|---|---|
| unsloth Q3_K_M | Q8_0 | 2,56 GB por token | 63,5–64,8 | 6,785 |
| Este fichero | Q5_K | 1,84 GB por token | 74,1–76,9 | 6,801 |
| Variante Q6_K | Q6_K | 2,10 GB por token | 69,0–70,2 | 6,784 |
| Variante Q4_K | Q4_K | 1,60 GB por token | 80,5–83,8 | 7,014 |

Frente a modelos de otros autores de tamano o tarea comparable: no disponible.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: hereda integramente los sesgos y el riesgo de alucinacion de Qwen3.5-35B-A3B, y la cuantizacion agresiva de expertos puede ampliarlos en dominios poco representados.
- Los expertos enrutados se copian del Q3_K_M de unsloth en IQ3_XXS e IQ4_XS, una precision muy baja; los tensores densos se cuantizan ademas sin importance matrix (la matriz de unos es un placeholder que nunca se aplica), por lo que no hay calibracion especifica de esas capas.
- La validacion de calidad se limita a perplejidad sobre 24 fragmentos de prosa tecnica en ingles; no hay evaluaciones en castellano, codigo, matematicas ni tareas de razonamiento, ni benchmarks estandar.
- Los idiomas soportados no estan declarados: no se puede asumir un rendimiento multilingue equivalente al del modelo base.
- La longitud de contexto no se declara; el limite real dependera de la arquitectura del base y de la memoria disponible una vez cargados los 15,7 GB de pesos.
- Las mediciones de velocidad provienen de un unico equipo (Apple M5 Pro, 24 GB) y de una unica herramienta (tempo9); no son extrapolables a CUDA ni a otros backends.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado el mismo dia (2026-10-23): no hay validacion independiente por parte de la comunidad.
- Soporte en Ollama, vLLM o TGI no confirmado; el uso previsto es llama.cpp o tempo9.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar los terminos del modelo base enlazados en `license_link` antes de desplegarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thinkspread/Qwen3.5-35B-A3B-Q5K-IQ3XXS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Cuantizaciones de referencia (origen de los tensores de expertos): https://huggingface.co/unsloth/Qwen3.5-35B-A3B-GGUF
- Servidor local tempo9: https://github.com/thinkspread/tempo9
