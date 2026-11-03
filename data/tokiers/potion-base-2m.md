# tokiers/potion-base-2M

## Resumen

potion-base-2M es un modelo de embeddings estáticos de tipo Model2Vec, desarrollado por el usuario tokiers a partir de la técnica y el ecosistema de Minish Lab. Se trata de una destilación del sentence transformer `baai/bge-base-en-v1.5` mediante el pipeline de Tokenlearn, que produce representaciones vectoriales de texto sin necesidad de ejecutar un transformer completo en inferencia. Con 1.889.792 parámetros y un repositorio de 0,1 GB, está pensado para escenarios donde el coste computacional o la latencia son críticos.

La relevancia del modelo radica en su relación rendimiento/tamaño: alcanza un 85,21 % del rendimiento medio de `all-MiniLM-L6-v2` en MTEB (47,55 frente a 55,80) con un coste de inferencia de órdenes de magnitud inferior, al tratarse de una simple lookup de embeddings por token más una agregación. Frente a embeddings estáticos clásicos como GloVe 300d (45,49) o BPEmb (42,33), la mejora es consistente en todas las categorías de MTEB.

El paquete incluye además un tokenizador precompilado de tokie (`tokenizer.tkz`), que el autor presenta como un reemplazo directo de los tokenizers de HuggingFace con una tokenización aproximadamente 5 veces más rápida. La licencia es MIT y los pesos se distribuyen en safetensors y ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (Model2Vec, destilado de un sentence transformer) |
| Parametros totales | 1.889.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings, sin ventana generativa) |
| Tipos de cuantizacion | no disponible (pesos estáticos de baja precisión por diseño; el repo incluye ONNX) |
| Idiomas soportados | no disponible (el corpus de entrenamiento es en inglés: `minishlab/tokenlearn-c4-en-bge-base-v1.5`) |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

Model2Vec no es un transformer en inferencia: es una tabla de embeddings por token estática. El proceso de construcción parte de `baai/bge-base-en-v1.5`, del que se destila primero un modelo Model2Vec; después se genera un corpus de entrenamiento calculando las medias de embeddings de salida del sentence transformer sobre un corpus grande (el dataset `minishlab/tokenlearn-c4-en-bge-base-v1.5`, derivado de C4 en inglés). El modelo destilado se entrena con Tokenlearn sobre esas medias y, en una fase de post-entrenamiento, se re-regulariza ponderando los tokens por frecuencia, aplicando PCA y finalmente SIF weighting.

El resultado es un modelo que computa el embedding de una frase como una agregación ponderada de los vectores estáticos de sus tokens, sin atención ni capas profundas. Esto elimina el coste cuadrático del mecanismo de atención y permite ejecución en CPU a velocidades muy superiores a las de un sentence transformer del mismo espacio de embeddings. El repositorio incluye un tokenizador tokie precompilado (`tokenizer.tkz`) para acelerar la fase de tokenización.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y similitud entre frases.
- Clasificación de textos mediante embeddings (categoría Class en MTEB: 64,13).
- Clustering de documentos (37,53 en MTEB).
- Pair classification y ranking de pares (73,72 y 40,46 respectivamente).
- Recuperación de información (Retrieval: 22,99), con rendimiento limitado frente a modelos transformer.
- Evaluación de similitud semántica textual (STS: 69,77).
- WordSim (44,72) y resumen (Sum: 23,80).
- Inferencia en CPU y GPU sin dependencia de frameworks de deep learning pesados; integración con `model2vec` y compatibilidad con el ecosistema sentence-transformers.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un encoder de embeddings.

## Casos de uso

- Búsqueda semántica en producción de baja latencia: al ser un modelo estático de 1,9 M de parámetros, el coste por consulta es una lookup de tabla y una media ponderada, lo que permite indexar y consultar millones de documentos en CPU sin GPU dedicada.
- Deduplicación y clustering de grandes corpus: la categoría Clustering (37,53) y la velocidad de codificación permiten agrupar lotes masivos de documentos en pipelines batch sin cuello de botella de inferencia.
- Filtrado previo en pipelines RAG: usar potion-base-2M como primera etapa de recuperación rápida y reservar un modelo transformer más pesado para el re-ranking de los candidatos.
- Clasificación de tickets o correos: los embeddings sirven como features para clasificadores ligeros (regresión logística, SVM) en entornos con recursos limitados.
- Moderación y near-duplicate detection en entornos edge o móviles: el tamaño de 0,1 GB y la licencia MIT permiten empaquetar el modelo en aplicaciones cliente o dispositivos con poca memoria.
- Enriquecimiento de bases de datos vectoriales a gran escala: la generación de embeddings en batch sobre corpus completos es viable en CPU, reduciendo el coste de infraestructura frente a modelos transformer.
- Prototipado rápido de sistemas de recomendación por similitud de contenido, dado el bajo coste de iteración y la facilidad de despliegue con `model2vec`.

## Benchmarks y rendimiento

Resultados publicados en la model card (media MTEB y categorías):

| Modelo | Avg (All) | Avg (MTEB) | Class | Clust | PairClass | Rank | Ret | STS | Sum | Pearl | WordSim |
|:---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| all-MiniLM-L6-v2 | 55,80 | 55,93 | 69,25 | 44,90 | 82,37 | 47,14 | 42,92 | 78,95 | 25,96 | 60,83 | 49,91 |
| potion-base-32M | 52,83 | 52,13 | 71,70 | 41,25 | 78,17 | 42,45 | 32,67 | 73,93 | 24,74 | 55,37 | 55,15 |
| potion-base-8M | 51,32 | 51,08 | 70,34 | 39,74 | 76,62 | 41,79 | 31,11 | 72,91 | 25,06 | 53,54 | 50,75 |
| potion-base-4M | 50,01 | 49,77 | 68,00 | 39,47 | 75,37 | 41,41 | 28,43 | 71,87 | 23,82 | 52,55 | 49,21 |
| M2V_base_output | 48,77 | 47,96 | 66,84 | 33,96 | 74,90 | 39,31 | 25,36 | 68,76 | 26,61 | 54,02 | 49,18 |
| potion-base-2M | 47,55 | 47,49 | 64,13 | 37,53 | 73,72 | 40,46 | 22,99 | 69,77 | 23,80 | 50,82 | 44,72 |
| GloVe_300d | 45,49 | 45,82 | 62,73 | 37,10 | 72,48 | 38,28 | 21,80 | 61,52 | 26,81 | 45,65 | 43,05 |
| BPEmb_50k_300d | 42,33 | 41,74 | 61,72 | 35,17 | 57,86 | 37,26 | 15,36 | 55,30 | 29,49 | 47,56 | 41,28 |

Según el autor, potion-base-2M alcanza el 85,21 % del rendimiento de `all-MiniLM-L6-v2` siendo órdenes de magnitud más rápido. La debilidad principal está en Retrieval (22,99), muy por debajo de los transformers.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; el modelo pesa 0,1 GB en el repositorio y los embeddings estáticos caben en memoria de sistema.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (incluso integradas) es suficiente si se desea acelerar el batch.
- Cabe en cualquier GPU consumer y en dispositivos de baja memoria (móvil, Raspberry Pi, edge).
- Opciones de despliegue: librería `model2vec` (`StaticModel.from_pretrained`), pesos ONNX para runtimes genéricos, tokenizador tokie (`tokenizer.tkz`) o tokenizers de HuggingFace.
- Latencia y throughput: el autor afirma que el cálculo de embeddings es "órdenes de magnitud" más rápido que un sentence transformer, pero no se publican cifras concretas de latencia o tokens/s en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Avg (MTEB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| potion-base-2M | 1,89 M | no disponible | 47,49 | MIT | HuggingFace |
| potion-base-4M | no disponible | no disponible | 49,77 | MIT | HuggingFace |
| potion-base-8M | no disponible | no disponible | 51,08 | MIT | HuggingFace |
| all-MiniLM-L6-v2 | 22,7 M (aprox., transformer) | 256 tokens (aprox.) | 55,93 | Apache 2.0 | HuggingFace |
| GloVe 300d | no disponible | no disponible | 45,82 | dominio público / varias | HuggingFace |

La comparativa muestra el compromiso claro: potion-base-2M pierde unos 8 puntos de media MTEB frente a all-MiniLM-L6-v2, pero con un modelo dos órdenes de magnitud menor en parámetros y sin coste de atención. Frente a GloVe 300d gana en todas las categorías salvo Sum.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto, no razona, no soporta tool calling ni agentes.
- Rendimiento bajo en Retrieval (22,99), por lo que no es adecuado como recuperador principal en RAG de alta exigencia; conviene usarlo como filtro previo o en combinación con re-ranking.
- El corpus de entrenamiento es en inglés (`tokenlearn-c4-en-bge-base-v1.5`); el rendimiento multilingüe no está documentado y probablemente sea deficiente fuera del inglés.
- Al ser embeddings estáticos, no captura contexto composicional ni negaciones o dependencias sintácticas complejas como un transformer.
- Riesgo de sesgos heredados del modelo profesor (`bge-base-en-v1.5`) y del corpus C4, no evaluado en la información disponible.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero conviene revisar la licencia del modelo profesor y del dataset de entrenamiento si se redistribuye.
- No se publican cifras de latencia, throughput ni evaluación en dominios específicos (legal, médico, código).
- El modelo está alojado en un repositorio de usuario (`tokiers`) y no en el espacio oficial de Minish Lab; la model card referencia `minishlab/potion-base-2M` como origen de los resultados, lo que puede generar confusión sobre la procedencia exacta de los pesos.

## Enlaces

- HuggingFace: https://huggingface.co/tokiers/potion-base-2M
- Modelo de referencia citado en la model card: https://huggingface.co/minishlab/potion-base-2M
- Modelo profesor: https://huggingface.co/baai/bge-base-en-v1.5
- Repositorio Model2Vec: https://github.com/MinishLab/model2vec
- Repositorio Tokenlearn: https://github.com/MinishLab/tokenlearn
- Resultados Model2Vec: https://github.com/MinishLab/model2vec/blob/main/results/README.md
- Tutoriales Model2Vec: https://github.com/MinishLab/model2vec/tree/main/tutorials
- Tokenizador tokie: https://github.com/chonkie-inc/tokie
- Dataset de entrenamiento: https://huggingface.co/datasets/minishlab/tokenlearn-c4-en-bge-base-v1.5
- Leaderboard MTEB: https://huggingface.co/spaces/mteb/leaderboard
- all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- GloVe 300d: https://huggingface.co/sentence-transformers/average_word_embeddings_glove.6B.300d
- BPEmb: https://github.com/bheinzerling/bpemb
- Paper SIF weighting: https://openreview.net/pdf?id=SyK00v5xx
