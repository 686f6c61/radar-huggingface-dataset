# ypolatog/24679-hw2-movie-genre-prompting

## Resumen

`ypolatog/24679-hw2-movie-genre-prompting` no es un modelo entrenado, sino la model card de un trabajo de clase (CMU 24-679 Design AI, HW2 Part 4) que documenta un experimento de clasificacion de genero cinematografico mediante prompting sobre `Qwen/Qwen2.5-3B-Instruct`. El repositorio no publica pesos: no hay entrenamiento, solo un metodo de evaluacion reproducible con zero-shot, one-shot y five-shot prompting comparado contra un DistilBERT afinado en la parte 3 del mismo trabajo sobre exactamente las mismas 15 descripciones de test.

El problema que aborda es acotado y metodologico: medir si el prompting few-shot con seleccion adaptativa de ejemplos supera a un clasificador pequeno afinado, en un escenario de datos escasos (70 descripciones de entrenamiento, 15 de test) y con coste cero al ejecutarse en local sobre una GPU de Colab. La conclusion es negativa: ninguna configuracion de prompting supera al DistilBERT afinado en exactitud (0,667), y el five-shot adaptativo cae hasta 0,533, con un unico fallo de parseo por pipeline.

Su relevancia es, por tanto, docente y de referencia practica sobre como disenar una comparativa honesta (mismo test set, semilla fija, K elegido en validacion, informe de fallos de parseo y de tokens de prompt), mas que como artefacto desplegable. La licencia declarada es `classroom-use`, lo que limita explicitamente su reutilizacion fuera del ambito academico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: el repositorio no contiene un modelo propio. Metodo de prompting sobre `Qwen/Qwen2.5-3B-Instruct` (transformer decoder-only, segun el modelo base) |
| Parametros totales | No disponible para el repositorio (no publica pesos). Modelo base empleado: Qwen2.5-3B-Instruct, ~3.000 millones de parametros segun su denominacion |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el repositorio no documenta la configuracion de contexto del modelo base) |
| Tipos de cuantizacion | No disponible en el repositorio. La inferencia se realizo en fp16 |
| Idiomas soportados | No disponible (la model card no declara idiomas; el dataset de peliculas esta en ingles) |
| Licencia | `other` con `license_name: classroom-use` |
| Formato de pesos | No se publican pesos. Se documenta unicamente el metodo |

## Arquitectura y entrenamiento

No existe entrenamiento ni ajuste de pesos. El objeto del repositorio es un pipeline de evaluacion: se carga `Qwen/Qwen2.5-3B-Instruct` en fp16, se genera con decodificacion greedy (`do_sample=False`, `max_new_tokens=8`) y padding a izquierdas para generacion por lotes. El prompt consta de un mensaje de sistema que exige respuesta de una sola palabra sin explicacion, seguido de una instruccion que enumera los generos permitidos y prohibe puntuacion y razonamiento. Los ejemplos resueltos, cuando existen, se colocan antes de la consulta en orden ascendente de similitud, de modo que el mas parecido queda mas cerca de la pregunta.

La innovacion metodologica esta en la seleccion de exemplars y en el parseo de salida. La variante `adaptive` embebe el pool de 70 descripciones de entrenamiento con `sentence-transformers/all-MiniLM-L6-v2` y toma las k mas cercanas por similitud coseno; la variante `random` muestrea k uniformemente del mismo pool. Solo son elegibles descripciones originales (no aumentadas) y nunca se usa una descripcion de validacion o test como exemplar. Para el parseo se toma el primer genero nombrado en la salida; si no aparece ninguno, se puntua cada genero por la log-probabilidad media de sus tokens y se elige el mejor, de forma que toda descripcion recibe prediccion. El valor de K se eligio en validacion y el test se puntuo una sola vez por pipeline, con semilla 24679 y transformers 5.17.0. El coste total se reporta como 0,00 USD: 7 segundos de GPU para todos los pipelines combinados.

## Capacidades

- Clasificacion de texto por prompting en modo zero-shot, one-shot y five-shot, restringida al conjunto de generos permitidos indicado en el prompt.
- Seleccion adaptativa de exemplars por similitud coseno mediante embeddings de `all-MiniLM-L6-v2`, frente a muestreo aleatorio.
- Generacion restringida a respuestas de una sola palabra, con `max_new_tokens=8` y decodificacion greedy, lo que hace la salida determinista.
- Parseo robusto de salida: extraccion del primer genero nombrado y respaldo por log-probabilidad media de tokens cuando la generacion no contiene ningun genero valido.
- Inferencia local sin coste de API, ejecutable en una GPU de Colab.
- No soporta tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo de razonamiento explicito: la propia instruccion del prompt prohibe razonar.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se publican pesos ni adaptadores, por lo que no hay artefacto reutilizable para inferencia propia.

## Casos de uso

- Docencia de evaluacion de LLM: el repositorio sirve como plantilla de practica para comparar prompting con fine-tuning bajo un test set identico, con semilla fija y un unico scoring de test, evitando el sesgo de seleccionar K sobre test.
- Estudio de seleccion de exemplars: la comparacion `adaptive` frente a `random` con el mismo k permite analizar en clase si la similitud semantica aporta ventaja cuando el test es diminuto (0,533 frente a 0,600 en five-shot).
- Analisis de sensibilidad a K: el barrido completo de K queda registrado en `results.json`, util para ilustrar como con 15 ejemplos una unica prediccion desplaza la exactitud 6,7 puntos.
- Referencia para el diseno de prompts con salida de una sola palabra: el patron de mensaje de sistema restrictivo mas lista de etiquetas permitidas es directamente reutilizable en clasificacion de intenciones, moderacion o etiquetado de tickets.
- Reproducibilidad de experimentos academicos: el manifiesto de splits (`split_manifest.json` del modelo DistilBERT de la parte 3) y la version fijada de transformers (5.17.0) permiten replicar la comparativa.
- Discusion sobre contaminacion de datos: el propio autor advierte que el LLM pudo haber visto estas peliculas en preentrenamiento, lo que convierte el caso en un ejemplo practico de por que la fila zero-shot puede estar inflada.
- Base para ampliar a otros dominios de clasificacion corta (resenas, tickets, abstracts) con el mismo protocolo de prompt, seleccion de exemplars y parseo con respaldo log-probabilistico.

## Benchmarks y rendimiento

Resultados sobre las mismas 15 descripciones de test (el azar se situa en 0,200):

| Metodo | K | Seleccion | Exactitud | Macro F1 | Fallos de parseo | Tokens de prompt | s/ejemplo |
|---|---|---|---|---|---|---|---|
| DistilBERT (Parte 3) | - | - | 0,667 | 0,659 | 0 | 45 | 0,05 |
| 0-shot | 0 | - | 0,667 | 0,591 | 1 | 145 | 0,08 |
| 1-shot adaptive | 1 | adaptive | 0,600 | 0,600 | 1 | 193 | 0,09 |
| 5-shot adaptive | 5 | adaptive | 0,533 | 0,543 | 1 | 383 | 0,15 |
| 5-shot random | 5 | random | 0,600 | 0,590 | 1 | 388 | 0,15 |

El autor advierte que con 15 descripciones un unico error mueve la exactitud 6,7 puntos, por lo que estas diferencias son indicativas y no concluyentes. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base Qwen2.5-3B-Instruct (estimacion aritmetica a partir de ~3.000 millones de parametros, no un dato publicado por el repositorio): en fp16 en torno a 6,2 GB solo de pesos, con unos 8 GB recomendados contando activaciones y cache KV; en int8 alrededor de 3,5 GB; en int4 alrededor de 2 GB.
- El experimento concreto se ejecuto en una GPU de Colab en fp16, con un consumo agregado de 7 segundos de GPU para todos los pipelines.
- GPU recomendadas para reproducir el trabajo: cualquier GPU con 8 GB o mas de VRAM, por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10G, L4, A100 o H100. El modelo es holgadamente ejecutable en GPU de consumo.
- Opciones de despliegue: `transformers` es lo efectivamente usado. Para servir el modelo base a mayor escala serian aplicables vLLM, TGI, llama.cpp u Ollama mediante conversiones GGUF, y LM Studio en escritorio. El repositorio en si no incluye artefacto desplegable.
- Latencia observada: entre 0,08 y 0,15 segundos por ejemplo segun el pipeline, con lotes y decodificacion greedy de como maximo 8 tokens nuevos. El coste por ejemplo crece con K por el mayor numero de tokens de prompt (145 en 0-shot frente a 388 en 5-shot random).
- Throughput: no disponible en la informacion proporcionada (no se documenta el tamano de lote ni el modelo exacto de GPU empleado).

## Comparativa con modelos similares

La unica comparacion disponible en la informacion es interna al propio trabajo, entre las variantes de prompting y el DistilBERT afinado de la parte 3 sobre el mismo test set:

| Sistema | Tipo | Parametros | Contexto | Exactitud | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DistilBERT (Parte 3, `ypolatog/24679-hw2-movie-genre-distilbert`) | Clasificador afinado | No disponible en esta ficha (DistilBERT es un modelo compacto, muy por debajo de 3.000 M) | No aplica | 0,667 | 0,659 | No disponible | Pesos publicados por el autor del trabajo |
| Prompting 0-shot sobre Qwen2.5-3B-Instruct | Prompting, sin entrenamiento | ~3.000 M (modelo base) | No disponible | 0,667 | 0,591 | `classroom-use` (card); el modelo base tiene licencia propia | Modelo base publico; este repositorio no publica pesos |
| Prompting 5-shot adaptive sobre Qwen2.5-3B-Instruct | Prompting, sin entrenamiento | ~3.000 M (modelo base) | No disponible | 0,533 | 0,543 | `classroom-use` (card) | Modelo base publico; este repositorio no publica pesos |
| Prompting 5-shot random sobre Qwen2.5-3B-Instruct | Prompting, sin entrenamiento | ~3.000 M (modelo base) | No disponible | 0,600 | 0,590 | `classroom-use` (card) | Modelo base publico; este repositorio no publica pesos |

No se dispone de comparaciones con otros modelos de clasificacion de genero cinematografico ni con otras variantes de Qwen2.5 dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: no se publican pesos, ni adaptadores, ni configuracion de inferencia. Solo se documenta un metodo.
- Tamano de test critico: 15 descripciones, con un unico error equivalente a 6,7 puntos de exactitud. Las diferencias entre pipelines no son estadisticamente concluyentes.
- Sesgo de contaminacion: el propio autor senala que el LLM pudo haber visto estas peliculas durante el preentrenamiento, lo que favorece artificialmente la fila zero-shot frente a descripciones genuinamente nuevas.
- Origen de los datos: las 15 descripciones de test provienen de la encuesta de un unico estudiante, lo que limita la representatividad y generalizacion.
- Licencia restrictiva: `classroom-use` (`license: other`). No esta pensado para ningun uso real ni para decisiones reales, y la reutilizacion comercial queda fuera de lo permitido.
- El dataset de origen, `ArinRoths/movie-data`, no declara licencia; cualquier reutilizacion debe aclararse con su autor.
- Ausencia de datos sobre sesgos, idiomas soportados, contexto maximo o comportamiento fuera de la tarea de clasificacion restringida.
- El prompt prohibe explicitamente razonar y limita la salida a una palabra, con un fallo de parseo por pipeline que obliga a usar el respaldo por log-probabilidad; no es un modo de uso general del modelo base.
- Los resultados de busqueda web proporcionados no contienen ninguna referencia util al modelo, al metodo ni al trabajo de CMU 24-679: solo devuelven paginas de la plataforma suiza smartvote, sin relacion con esta ficha.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/ypolatog/24679-hw2-movie-genre-prompting
- Modelo DistilBERT de la Parte 3, referenciado en la model card: https://huggingface.co/ypolatog/24679-hw2-movie-genre-distilbert
- Dataset de origen, referenciado en la model card: https://huggingface.co/datasets/ArinRoths/movie-data
- Modelo base empleado en el prompting: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo de embeddings usado para la seleccion adaptativa: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Paper, blog o repositorio adicionales: no disponibles. La busqueda web realizada no devolvio resultados relacionados con el modelo.
