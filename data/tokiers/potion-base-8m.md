# tokiers/potion-base-8M

## Resumen

potion-base-8M es un modelo de embeddings estaticos desarrollado por Minish Lab y republicado en el espacio `tokiers` como una variante con tokenizador propio. Se trata de una destilacion del sentence transformer `baai/bge-base-en-v1.5` mediante la tecnica Model2Vec y el pipeline de entrenamiento Tokenlearn. Su proposito es sustituir a los sentence transformers tradicionales en tareas de similitud semantica y recuperacion de informacion cuando los recursos son limitados o la latencia es critica, ya que al no ejecutar un transformer completo en inferencia, el coste de codificar texto se reduce en ordenes de magnitud tanto en CPU como en GPU.

El modelo no es generativo: no produce texto ni razona, sino que transforma una frase en un vector denso de dimension fija. Con 7.559.168 parametros (aproximadamente 8M, de ahi el nombre), ocupa unos 0,2 GB en el repositorio y emplea embeddings estaticos, una tabla de vectores por token combinada con pooling, en lugar de atencion multi-cabeza. La ventana de contexto no aplica en el sentido habitual de los LLM; el limite lo impone el tokenizador y la longitud de secuencia que se decida procesar.

La relevancia actual radica en que permite desplegar busqueda semantica, deduplicacion o clasificacion por similitud en entornos sin GPU, con un rendimiento en MTEB que alcanza el 91,96 % del de `all-MiniLM-L6-v2` segun la propia model card, a una fraccion del coste computacional. La republicacion en `tokiers` anade un tokenizador precompilado `tokenizer.tkz` compatible con la libreria tokie, que el autor describe como un reemplazo directo de los tokenizers de Hugging Face con una tokenizacion hasta 5 veces mas rapida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Model2Vec con embeddings estaticos (destilacion de sentence transformer, sin atencion en inferencia) |
| Parametros totales | 7.559.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por el tokenizador y la longitud de secuencia configurada) |
| Tipos de cuantizacion | no disponible (pesos estaticos de baja precision de forma nativa; exportacion ONNX incluida) |
| Idiomas soportados | no disponible (el modelo base bge-base-en-v1.5 es predominantemente ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX y tokenizador `tokenizer.tkz` |

## Arquitectura y entrenamiento

potion-base-8M sigue el paradigma Model2Vec: en lugar de un transformer con atencion, mantiene una tabla de embeddings por token y calcula la representacion de la frase mediante pooling de los vectores de sus tokens. Esto elimina la necesidad de multiplicaciones matriciales por capa en inferencia y permite codificar texto con un coste casi lineal en el numero de tokens, sin dependencia de GPU. El modelo se entrena mediante Tokenlearn en cuatro fases descritas en la model card: destilacion inicial desde `baai/bge-base-en-v1.5` con Model2Vec, generacion de datos de entrenamiento a partir de embeddings medios producidos por el sentence transformer sobre un corpus amplio, entrenamiento del modelo destilado sobre esos datos y una regularizacion posterior que pondera los tokens por frecuencia, aplica PCA y finalmente SIF weighting.

El dataset de entrenamiento declarado es `minishlab/tokenlearn-c4-en-bge-base-v1.5`, derivado de C4 en ingles y de las salidas del modelo profesor. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento ni si hubo fases de RLHF o DPO, algo por otra parte poco habitual en modelos de embeddings. La innovacion principal es la propia metodologia Model2Vec, que combina destilacion, PCA y SIF weighting para conservar una parte sustancial de la calidad del profesor con una huella de parametros dos ordenes de magnitud menor. La variante `tokiers` anade ademas el tokenizador tokie precompilado para acelerar el preprocesado.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica y recuperacion densa.
- Busqueda semantica y recuperacion de informacion (retrieval) sobre corpus en ingles.
- Clasificacion de texto por similitud coseno contra prototipos o etiquetas.
- Clustering y deduplicacion de documentos mediante agrupamiento de vectores.
- Reranking ligero y filtrado previo en pipelines de RAG de bajo coste.
- Codificacion en CPU con latencia muy baja, apta para servicios de alto QPS.
- Exportacion a ONNX para despliegue en entornos sin Python o con runtime nativo.
- Tokenizacion acelerada mediante el tokenizador tokie incluido (`tokenizer.tkz`).
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni modo thinking.

## Casos de uso

- Busqueda semantica en documentacion interna: indexar articulos y consultar por similitud con embeddings calculados en CPU, sin necesidad de GPU ni de un servicio de inferencia dedicado, gracias al reducido tamano del modelo.
- Deduplicacion de grandes corpus: codificar millones de registros en lotes y agrupar por distancia coseno para eliminar duplicados, ya que el coste por documento es minimo y el modelo cabe holgadamente en memoria.
- Filtrado previo en pipelines RAG: usar potion-base-8M como primera etapa de recuperacion barata y reservar un reranker mas pesado para los candidatos mas prometedores, reduciendo el coste total del sistema.
- Clasificacion de tickets de soporte: comparar el embedding de cada ticket con prototipos de categoria previamente calculados y asignar la etiqueta mas cercana, con latencia compatible con atencion en tiempo real.
- Moderacion y agrupamiento de contenido: detectar textos semanticamente proximos a patrones conocidos o agrupar comentarios similares para revision manual, en entornos donde no se dispone de GPU.
- Sistemas de recomendacion basados en contenido: representar items y consultas de usuario en el mismo espacio vectorial y recuperar los mas afines mediante busqueda ANN, con un modelo que se puede replicar en multiples instancias sin coste elevado.
- Prototipado y evaluacion offline: ejecutar experimentos de retrieval o clustering en portatiles y CI sin infraestructura GPU, dado que el modelo se carga con `model2vec` en pocos segundos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre MTEB (medias por familia de tareas):

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

Segun la model card, potion-base-8M alcanza el 91,96 % del rendimiento medio de all-MiniLM-L6-v2 con un coste de inferencia ordenes de magnitud menor. No se han publicado en la informacion disponible mediciones de latencia o throughput absolutos.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula en GPU; los 7,56M de parametros ocupan del orden de decenas de MB en memoria en funcion de la precision, y el modelo puede ejecutarse integramente en CPU.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) sobra para codificar en lotes; el cuello de botella sera el tokenizador y el I/O.
- Cabe en cualquier GPU consumer e incluso en dispositivos de bajos recursos; tambien es viable en entornos serverless sin acelerador.
- Opciones de despliegue: libreria `model2vec` (`StaticModel.from_pretrained`), exportacion ONNX incluida en el repositorio, y el tokenizador tokie (`tokenizer.tkz`) como reemplazo de los tokenizers de Hugging Face. No se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no se han publicado cifras concretas en la informacion disponible; la model card afirma que los embeddings se calculan ordenes de magnitud mas rapido que con un sentence transformer y que la tokenizacion tokie es hasta 5 veces mas rapida.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Avg (MTEB) | Licencia | Disponibilidad |
|:---|---:|:---|---:|:---|:---|
| potion-base-8M | 7,56M | Estatico (Model2Vec) | 51,08 | MIT | Hugging Face (`tokiers/potion-base-8M`) |
| all-MiniLM-L6-v2 | ~22,7M | Transformer (sentence transformer) | 55,93 | Apache 2.0 | Hugging Face |
| potion-base-32M | ~32M | Estatico (Model2Vec) | 52,13 | MIT | Hugging Face (`minishlab/potion-base-32M`) |
| GloVe_300d | ~300 dimensiones | Embeddings de palabra promediados | 45,82 | Dominio publico / permisiva | Hugging Face |

Frente a all-MiniLM-L6-v2, potion-base-8M sacrifica aproximadamente 4,85 puntos de media MTEB a cambio de un coste de inferencia mucho menor y un tamano de parametros tres veces inferior. Frente a potion-base-32M, la version de 8M pierde alrededor de un punto de media MTEB con una cuarta parte de los parametros. Frente a GloVe, gana mas de 5 puntos de media MTEB manteniendo la simplicidad de los embeddings estaticos.

## Limitaciones y advertencias

- Al ser un modelo de embeddings estaticos, no captura contexto dependiente del orden mas alla del pooling; puede perder matices en frases con negaciones, ambiguedad o dependencias largas.
- El modelo profesor (`bge-base-en-v1.5`) esta orientado al ingles, por lo que el rendimiento multilingue, y en particular en castellano, no esta garantizado ni documentado.
- Riesgo de sesgos heredados del corpus C4 en ingles y de las representaciones del modelo profesor; no se documentan evaluaciones de sesgo en la informacion disponible.
- No es un modelo generativo: no debe usarse para producir texto, responder preguntas de forma directa ni ejecutar tareas de razonamiento.
- La licencia MIT permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar la procedencia del dataset de entrenamiento (C4) y las condiciones del modelo profesor.
- La republicacion en `tokiers` tiene muy pocas descargas (22) y ningun like en el momento de la consulta; conviene validar que los pesos coinciden con el modelo original `minishlab/potion-base-8M` antes de usarlo en produccion.
- El tokenizador tokie es una dependencia adicional que debe evaluarse por separado; su compatibilidad con pipelines existentes de Hugging Face no esta garantizada mas alla de lo que declara el autor.
- No se han publicado mediciones de latencia, throughput ni evaluaciones en dominios especificos (legal, medico, castellano) en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokiers/potion-base-8M
- Modelo original: https://huggingface.co/minishlab/potion-base-8M
- Modelo profesor: https://huggingface.co/baai/bge-base-en-v1.5
- Repositorio Model2Vec: https://github.com/MinishLab/model2vec
- Repositorio Tokenlearn: https://github.com/MinishLab/tokenlearn
- Resultados Model2Vec: https://github.com/MinishLab/model2vec/blob/main/results/README.md
- Tutoriales Model2Vec: https://github.com/MinishLab/model2vec/tree/main/tutorials
- Repositorio tokie: https://github.com/chonkie-inc/tokie
- Dataset de entrenamiento: https://huggingface.co/datasets/minishlab/tokenlearn-c4-en-bge-base-v1.5
- Leaderboard MTEB: https://huggingface.co/spaces/mteb/leaderboard
- Modelos Model2Vec en el hub: https://huggingface.co/models?library=model2vec
- Paper de SIF weighting: https://openreview.net/pdf?id=SyK00v5xx
