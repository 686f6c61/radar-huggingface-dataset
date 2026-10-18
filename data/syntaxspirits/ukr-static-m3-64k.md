# SyntaxSpirits/ukr-static-m3-64k

## Resumen

ukr-static-m3-64k es un modelo de embeddings estáticos para ucraniano publicado por SyntaxSpirits. No es un transformer generativo: es una tabla de 64.003 tokens × 256 dimensiones (16.384.768 parámetros) destilada de BAAI/bge-m3 mediante Model2Vec y posteriormente entrenada con Tokenlearn. Codificar un texto consiste en una búsqueda en tabla y un promedio, sin paso forward de atención, por lo que la inferencia se ejecuta en CPU en torno a 0,1 ms por consulta.

Su relevancia está en la relación entre calidad y coste: con 32,8 MB de pesos en FP16 (unos 35 MB con el tokenizador) supera a potion-multilingual-128M, de 512 MB en FP32, en tres conjuntos de recuperación en ucraniano, con incrementos de 0,07 a 0,12 nDCG@10. Frente a su modelo profesor, bge-m3 (2,27 GB en FP32), pierde bastante calidad (0,776 frente a 0,937 en Belebele uk), pero reduce el peso más de 60 veces y elimina la necesidad de GPU.

El modelo está pensado para recuperación semántica y similitud de frases en ucraniano dentro de pipelines con restricciones de latencia, memoria o ausencia de acelerador. La licencia es MIT y la librería de referencia es model2vec, con soporte también vía sentence-transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (Model2Vec): tabla de tokens con pooling por promedio, sin transformer ni atención |
| Parametros totales | 16.384.768 (64.003 tokens × 256 dimensiones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite fijado en `tokenizer.json`); Model2Vec además trunca a 3.584 caracteres por defecto antes de tokenizar (512 × longitud mediana de token de 7) |
| Tipos de cuantizacion | Pesos publicados en FP16 (safetensors); no se publican variantes GGUF, INT8 ni otras |
| Idiomas soportados | Ucraniano (`uk`) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16); 32,8 MB de pesos, ~35 MB con tokenizador |
| Dimension de embedding | 256 (vectores L2-normalizados, producto escalar = similitud coseno) |
| Libreria / pipeline | model2vec; `sentence-similarity` |
| Modelo base (profesor) | BAAI/bge-m3 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Model2Vec: cada token del vocabulario tiene un vector de 256 dimensiones y el embedding de un texto es el promedio de los vectores de sus tokens. No hay capas, ni atención, ni orden de palabras. El vocabulario se construyó con las 32.000 palabras ucranianas en minúsculas más frecuentes en 60 millones de caracteres de Wikipedia ucraniana (dump 20231101) y FineWeb-2 (`ukr_Cyrl`), contando solo secuencias de letras cirílicas, más los 32.000 subtokens de BGE-M3 más frecuentes en el mismo corpus, más un token desconocido dedicado con vector cero. El tokenizador Unigram prefiere palabras completas frente a segmentaciones en subtokens.

El entrenamiento tuvo dos fases. Primero, destilación: cada token se embedió con BGE-M3 (mean pooling), se redujo a 256 dimensiones con PCA y se ponderó por frecuencia de corpus con SIF (1e-4). Después, Tokenlearn: 119.430 fragmentos de hasta 120 palabras de las mismas fuentes (eliminando los que compartían una secuencia de 8 palabras con Belebele o WebFAQ), con el embedding medio de tokens de BGE-M3 por fragmento como objetivo, reducido a 256 dimensiones mediante una PCA ajustada sobre los fragmentos de entrenamiento. Hiperparámetros por defecto de Tokenlearn: AdamW, learning rate 1e-3, batch 256, pérdida MSE y early stopping sobre los últimos 10.000 fragmentos. Los tokens desconocidos se eliminan de las entradas, igual que hace Model2Vec en inferencia.

## Capacidades

- Generación de embeddings de frases y documentos en ucraniano para búsqueda semántica y similitud.
- Recuperación pregunta → pasaje (el escenario evaluado en la model card).
- Recuperación híbrida combinable con BM25 mediante fusión por rango recíproco (RRF, k = 60).
- Codificación en CPU pura: aproximadamente 0,1 ms por consulta (p95 0,11 ms en Apple M1 Pro) y carga del modelo en 0,3 s.
- Vectores L2-normalizados, de modo que el producto escalar equivale a la similitud coseno.
- Entradas sin ningún token conocido (cadena vacía, "!!!") devuelven un vector cero.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio: es exclusivamente un codificador de texto.

## Casos de uso

- Búsqueda semántica sobre documentación o bases de conocimiento en ucraniano: indexar el corpus con embeddings de 256 dimensiones y resolver consultas por producto escalar, con un coste de CPU de 0,1 ms por consulta que permite servir el primer resultado sin caché.
- Prefiltrado en pipelines de recuperación de dos etapas: usar el modelo para reducir un corpus grande a los 100 candidatos mejores y aplicar después un cross-encoder o el propio bge-m3 solo sobre esos candidatos, reservando el modelo grande para el reranking.
- Búsqueda híbrida con BM25 en preguntas de tipo palabra clave: la fusión RRF (k = 60, top 100 por sistema) eleva WebFAQ uk de 0,434 a 0,504 y UA-SQuAD de 0,684 a 0,765, a un coste de memoria despreciable.
- Deduplicación y filtrado de datasets en ucraniano: comparar embeddings de documentos para detectar near-duplicates antes de entrenar otros modelos, ejecutable en paralelo sobre muchos núcleos de CPU.
- Clustering y etiquetado temático de corpus ucranianos: agrupar noticias, tickets o reseñas por similitud coseno sobre vectores de 256 dimensiones sin infraestructura de GPU.
- Despliegue en entornos sin acelerador: aplicaciones de escritorio, dispositivos embebidos o funciones serverless donde el límite de memoria es de decenas de MB y el arranque en frío debe ser de milisegundos.
- Emparejamiento de FAQ y atención al cliente: comparar la consulta del usuario contra un catálogo de preguntas frecuentes ucranianas con latencia inferior al milisegundo por consulta.

## Benchmarks y rendimiento

nDCG@10 para recuperación pregunta → pasaje, según la model card:

| Modelo | Pesos | Belebele uk | WebFAQ uk | UA-SQuAD val |
|---|---|---|---|---|
| ukr-static-m3-64k | 32,8 MB (FP16) | 0,776 | 0,434 | 0,684 |
| potion-multilingual-128M | 512 MB (FP32) | 0,652 | 0,344 | 0,613 |
| static-similarity-mrl-multilingual-v1 | 434 MB (FP32) | 0,617 | 0,352 | no disponible |
| BM25 | no aplica | 0,693 | 0,490 | 0,761 |
| ukr-static-m3-64k + BM25 | no aplica | 0,770 | 0,504 | 0,765 |
| potion-multilingual-128M + BM25 | no aplica | 0,716 | 0,462 | 0,734 |
| BAAI/bge-m3 (profesor) | 2,27 GB (FP32) | 0,937 | no disponible | no disponible |

Detalles de los conjuntos y del protocolo:

- Belebele `ukr_Cyrl`: 900 preguntas y 488 pasajes. WebFAQ `ukr` test: 6.851 preguntas y 68.501 respuestas. UA-SQuAD `val`: 5.726 preguntas respondibles y 1.160 párrafos.
- Diferencias frente al mejor modelo estático alternativo, con intervalos bootstrap del 95 %: Belebele +0,124 [+0,100; +0,147] frente a POTION; WebFAQ +0,082 [+0,074; +0,091] frente a static-similarity-mrl; UA-SQuAD +0,071 [+0,060; +0,081] frente a POTION.
- La fusión "+ BM25" es RRF con k = 60 y top 100 por sistema, sin ajuste. BM25 es Okapi con parámetros por defecto sobre tokens de palabra en minúsculas.
- Belebele y WebFAQ se usaron durante el desarrollo (elección de vocabulario y decisión de entrenar). UA-SQuAD se evaluó con un protocolo fijado de antemano; 2 de sus 1.160 párrafos comparten una secuencia de 8 palabras con el texto de entrenamiento y excluir sus 10 preguntas no altera ninguna puntuación en más de 0,001.
- Rendimiento: p95 de 0,11 ms por consulta en CPU Apple M1 Pro tras warm-up (POTION: 0,12–0,14 ms). Carga en 0,3 s (POTION: 3 s). Memoria pico del proceso Python ~360 MiB, de los cuales ~150 MiB son Python y la librería `datasets` (POTION: ~2,0 GiB).
- No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas, porque el modelo no las soporta.

## Requisitos de hardware

- VRAM para inferencia: 0 MB. El modelo no requiere GPU; 32,8 MB de pesos en FP16 residen en memoria del sistema.
- Memoria RAM: ~35 MB para pesos y tokenizador; ~360 MiB de pico medido en el proceso Python completo (incluye intérprete y `datasets`).
- GPU recomendadas: ninguna. Cualquier GPU podría ejecutar la tabla de embeddings, pero no aporta ventaja medible frente a CPU.
- Cabe en cualquier hardware consumer: portátiles, Raspberry Pi y contenedores con límites de memoria de decenas de MB. Verificado en CPU Apple M1 Pro.
- Opciones de despliegue: librería `model2vec` (`StaticModel.from_pretrained`) o `sentence-transformers` con `SentenceTransformer(...).float()`. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, que están orientados a modelos generativos.
- Latencia y throughput: p95 de 0,11 ms por consulta en M1 Pro, codificando las 900 preguntas de Belebele una a una tras warm-up. Al ser una operación de búsqueda en tabla y promedio, el throughput escala casi linealmente con los núcleos disponibles.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | Calidad (nDCG@10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ukr-static-m3-64k | 16,4 M / 32,8 MB FP16 | 512 tokens | 0,776 Belebele; 0,434 WebFAQ; 0,684 UA-SQuAD | MIT | HuggingFace, librería model2vec |
| potion-multilingual-128M | no disponible / 512 MB FP32 | no disponible | 0,652 Belebele; 0,344 WebFAQ; 0,613 UA-SQuAD | no disponible en la información | HuggingFace (`minishlab/potion-multilingual-128M`) |
| static-similarity-mrl-multilingual-v1 | no disponible / 434 MB FP32 | no disponible | 0,617 Belebele; 0,352 WebFAQ | no disponible en la información | HuggingFace (sentence-transformers) |
| BAAI/bge-m3 (profesor) | no disponible / 2,27 GB FP32 | no disponible | 0,937 Belebele | no disponible en la información | HuggingFace |
| BM25 (Okapi, parámetros por defecto) | no aplica | no aplica | 0,693 Belebele; 0,490 WebFAQ; 0,761 UA-SQuAD | no aplica | Implementaciones múltiples |

Frente a los modelos estáticos alternativos, la ventaja es doble: mejor nDCG@10 en los tres conjuntos y un peso entre 8 y 15 veces menor. Frente a BM25, el modelo gana claramente en consultas semánticas (Belebele, +0,083) pero pierde en WebFAQ (-0,056) y UA-SQuAD (-0,077), lo que justifica el uso combinado.

## Limitaciones y advertencias

- La entrada se pasa a minúsculas y se ignora el orden de las palabras: no modela sintaxis ni negaciones, y puede fallar en pares de frases que solo difieren en el orden de los términos.
- Los textos largos se truncan. Model2Vec corta a 3.584 caracteres antes de tokenizar y ambos cargadores cortan a 512 tokens; para documentos largos hay que trocear o pasar `max_length=None` a `model.encode`.
- En WebFAQ (0,434 frente a 0,490) y UA-SQuAD (0,684 frente a 0,761), BM25 por sí solo supera al modelo. La fusión solo añade +0,014 y +0,005 nDCG@10 respectivamente, así que en preguntas de tipo palabra clave debe usarse junto a BM25, no en su lugar.
- Con `sentence-transformers` es obligatorio aplicar `.float()`: los pesos están en FP16 y, sin la conversión, las entradas que no contienen ningún token conocido (por ejemplo, una cadena vacía) devuelven NaN.
- Las entradas sin tokens conocidos devuelven un vector cero, lo que puede producir similitudes degeneradas si no se filtran previamente.
- Brecha considerable respecto al profesor: 0,776 frente a 0,937 en Belebele uk. No es un sustituto de bge-m3 en tareas que exijan máxima precisión.
- Belebele y WebFAQ se usaron durante el desarrollo del modelo; solo UA-SQuAD se evaluó con un protocolo fijado de antemano, por lo que las cifras de los dos primeros conjuntos pueden estar optimistamente sesgadas.
- La cobertura es solo ucraniano: no hay soporte multilingüe ni de otros idiomas.
- No debe emplearse para generación de texto, razonamiento, código ni tareas que requieran comprensión del orden de las palabras.
- Licencia MIT: permite uso comercial y modificaciones, pero conviene conservar el aviso de copyright. La model card no incluye cláusulas adicionales.
- El modelo tiene 0 descargas y 0 likes, y fue creado en octubre de 2026: no hay validación independiente de los resultados por parte de terceros.
- Se recomienda fijar la revisión concreta del repositorio en producción, dado que el autor documenta que una compilación anterior tenía un bug de tokenizador (el id de token desconocido se compartía con el subtoken `s`), corregido y reentrenado antes de la publicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SyntaxSpirits/ukr-static-m3-64k
- Modelo profesor BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Repositorio Model2Vec: https://github.com/MinishLab/model2vec
- Repositorio Tokenlearn: https://github.com/MinishLab/tokenlearn
- Modelo comparativo potion-multilingual-128M: https://huggingface.co/minishlab/potion-multilingual-128M
- Dataset Wikipedia (dump 20231101): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
