# tokiers/potion-retrieval-32M

## Resumen

potion-retrieval-32M es un modelo de embeddings estaticos desarrollado por el usuario tokiers como un fine-tuning de potion-base-32M, el modelo base creado por Minish Lab. Pertenece a la familia Model2Vec, una tecnica que destila modelos sentence-transformers en tablas de embeddings estaticos, eliminando la necesidad de ejecutar un transformer completo durante la inferencia. El resultado es un modelo de 32,3 millones de parametros que calcula embeddings mediante una simple operacion de lookup y pooling, lo que lo hace ordenes de magnitud mas rapido que los modelos densos equivalentes tanto en CPU como en GPU.

El modelo esta especializado en tareas de retrieval (recuperacion de informacion) y se ha entrenado sobre una mezcla amplia de datasets: GOOAQ, MS MARCO, SQuAD, S2ORC, AllNLI, PAQ, TriviaQA, msmarco-10m-triplets, SWIM-IR, PubMedQA, MIRACL, MLDR y Mr. TyDi. Esta combinacion cubre dominios generales, cientificos y multilingues, lo que lo hace util para busqueda semantica en entornos con recursos limitados o donde la latencia es critica. Su licencia MIT permite uso comercial sin restricciones practicas.

La relevancia actual del modelo radica en su perfil de rendimiento: alcanza una puntuacion de 35,06 en MTEB Retrieval, superando a otros embeddings estaticos como static-retrieval-mrl-en-v1 (34,95) y potion-base-32M (32,67), aunque queda por debajo del modelo denso all-MiniLM-L6-v2 (42,92). En terminos practicos, ofrece aproximadamente el 81,69% del rendimiento de all-MiniLM-L6-v2 con una velocidad de inferencia muy superior, lo que lo posiciona como una opcion atractiva para sistemas de recuperacion a gran escala donde el coste computacional es un factor limitante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos (Model2Vec): tabla de embeddings por token con pooling y ponderacion SIF, sin transformer en inferencia |
| Parametros totales | 32.302.592 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los embeddings estaticos no tienen ventana de atencion; el pooling se aplica sobre todos los tokens del texto) |
| Tipos de cuantizacion | no disponible (pesos estaticos en safetensors; el modelo es intrinsecamente ligero, no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (los datasets de entrenamiento incluyen MIRACL, MLDR y Mr. TyDi, de cobertura multilingue, pero el autor no declara una lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX; tokenizer preconstruido en formato tokie (`tokenizer.tkz`) |

## Arquitectura y entrenamiento

Model2Vec no es un transformer: es una tabla de embeddings estatica donde cada token del vocabulario tiene asociado un vector, y el embedding de una frase se obtiene mediante la media (con ponderacion SIF) de los vectores de sus tokens. Esto elimina las capas de atencion y las operaciones matriciales costosas en tiempo de inferencia, reduciendo el calculo a un lookup de tabla y una agregacion. El modelo se construye en varias fases: primero se destila un sentence-transformer en una tabla estatica mediante Model2Vec; despues se genera un corpus de entrenamiento calculando embeddings medios del sentence-transformer original sobre un corpus grande; a continuacion se entrena la tabla destilada con Tokenlearn; y finalmente se aplica una regularizacion posterior que pondera los tokens por frecuencia, aplica PCA y termina con ponderacion SIF.

El fine-tuning de tokiers parte de potion-base-32M y sigue una version modificada del enfoque descrito por Tom Aarsen en el blog de Hugging Face sobre embeddings estaticos. Las modificaciones declaradas son tres: se reduce el tamano del dataset en un factor de 10 (el autor observo que el modelo converge sin el dataset completo), se disminuye la tasa de aprendizaje y se entrena durante 3 epocas en lugar de 1, ya que una tasa alta borra los efectos del modelo preentrenado. El entrenamiento usa MatryoshkaLoss combinado con MultipleNegativesRankingLoss sobre los datasets citados. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta por dataset.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion de informacion (retrieval).
- Busqueda semantica densa sobre corpus grandes, con inferencia en CPU a velocidad muy superior a la de modelos transformer.
- Calculo de embeddings por lotes con bajo coste computacional, adecuado para indexacion masiva.
- Soporte de similitud coseno y producto escalar sobre los vectores resultantes.
- Compatibilidad con la libreria model2vec (`StaticModel.from_pretrained`) y con el ecosistema sentence-transformers para evaluacion.
- Exportacion a ONNX para despliegue en entornos sin Python o con aceleracion especifica.
- Tokenizador tokie preconstruido, presentado como sustituto directo de los tokenizers de Hugging Face con una velocidad de tokenizacion aproximadamente 5 veces mayor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de embeddings.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Busqueda semantica en produccion con latencia critica: el modelo calcula embeddings en microsegundos por frase en CPU, lo que permite indexar y consultar corpus de millones de documentos sin GPU y con una latencia muy inferior a la de un transformer denso.
- Recuperacion aumentada (RAG) en entornos con recursos limitados: se usa como retriever en pipelines RAG donde el presupuesto de computo es reducido, aceptando una perdida de calidad moderada (81,69% del rendimiento de all-MiniLM-L6-v2) a cambio de un throughput mucho mayor.
- Deduplicacion y agrupamiento de documentos a gran escala: los embeddings permiten calcular similitud entre millones de registros para detectar duplicados o agrupar temas, tarea viable por el bajo coste de inferencia.
- Busqueda en dominios cientificos y biomedicos: el entrenamiento incluye PubMedQA y S2ORC, lo que lo hace adecuado para recuperar literatura cientifica y articulos biomedicos en un motor de busqueda interno.
- Busqueda multilingue: los datasets MIRACL, MLDR y Mr. TyDi aportan cobertura multilingue, lo que permite construir indices de recuperacion para corpus en varios idiomas con un unico modelo ligero.
- Clasificacion y filtrado por similitud en tiempo real: en sistemas de moderacion o enrutamiento de consultas, el modelo puede comparar un texto entrante contra un conjunto de prototipos y decidir la categoria en milisegundos.
- Despliegue en dispositivos perifericos o entornos edge: al no requerir transformer, el modelo cabe en memoria reducida y puede ejecutarse en CPU de bajo consumo o en navegador mediante ONNX.

## Benchmarks y rendimiento

| Modelo | MTEB Retrieval Score |
|---|---:|
| all-MiniLM-L6-v2 | 42,92 |
| potion-retrieval-32M | 35,06 |
| static-retrieval-mrl-en-v1 | 34,95 |
| potion-base-32M | 32,67 |

El autor indica que potion-retrieval-32M alcanza el 81,69% del rendimiento de all-MiniLM-L6-v2 en MTEB Retrieval siendo ordenes de magnitud mas rapido. No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), lo cual es esperable al tratarse de un modelo de embeddings y no de generacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 32,3 millones de parametros; en fp32 ocupa aproximadamente 129 MB y en fp16 unos 65 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU con rendimiento suficiente para produccion. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) acelera el calculo pero no es necesaria.
- Cabe en GPU consumer: si, en todas las GPU modernas, e incluso en entornos sin GPU.
- Opciones de despliegue: libreria model2vec (`StaticModel`), ONNX Runtime, integracion con sentence-transformers para evaluacion; no aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no se publican cifras concretas en la informacion disponible; el autor afirma que la inferencia es ordenes de magnitud mas rapida que la de un sentence-transformer equivalente, y que el tokenizador tokie es aproximadamente 5 veces mas rapido que los tokenizers de Hugging Face.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | MTEB Retrieval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| potion-retrieval-32M | 32,3 M | Estatico (Model2Vec) | 35,06 | MIT | Hugging Face |
| static-retrieval-mrl-en-v1 | no disponible | Estatico (Model2Vec) | 34,95 | no disponible | Hugging Face |
| potion-base-32M | 32,3 M | Estatico (Model2Vec) | 32,67 | MIT | Hugging Face |
| all-MiniLM-L6-v2 | 22,7 M | Transformer denso | 42,92 | Apache 2.0 | Hugging Face |

La comparativa muestra que potion-retrieval-32M supera ligeramente a static-retrieval-mrl-en-v1 y de forma clara a su modelo base potion-base-32M en retrieval, pero queda por debajo de all-MiniLM-L6-v2, que es un transformer denso con mayor coste de inferencia. La ventaja competitiva del modelo esta en la relacion calidad-velocidad, no en la calidad absoluta.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto, razonar, escribir codigo ni ejecutar tool calling; su unico uso es calcular embeddings.
- Calidad inferior a los transformers densos: con 35,06 en MTEB Retrieval frente a 42,92 de all-MiniLM-L6-v2, puede perder recuperaciones relevantes en dominios especializados o consultas complejas.
- Sesgos: al entrenarse sobre datasets web y academicos (MS MARCO, GOOAQ, SQuAD, etc.), puede heredar sesgos de representacion de esos corpus; el autor no documenta evaluaciones de sesgo.
- Cobertura idiomatica no declarada: aunque los datasets incluyen MIRACL, MLDR y Mr. TyDi, el autor no especifica una lista oficial de idiomas soportados, por lo que el rendimiento fuera del ingles y de los idiomas cubiertos por esos datasets es incierto.
- Longitud de contexto no definida: al ser un modelo estatico, el pooling se aplica sobre todos los tokens del texto, pero no se documenta el comportamiento con textos muy largos ni si existe truncamiento.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si puede producir similitudes espurias entre textos no relacionados por la naturaleza estatica del embedding.
- Licencia MIT: permite uso comercial y modificacion sin restricciones practicas, pero se recomienda citar el repositorio Model2Vec segun indica el autor.
- Adopcion limitada: el modelo tiene 31 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria extensa; conviene evaluarlo en el dominio concreto antes de desplegarlo en produccion.
- Dependencia del tokenizador tokie: el modelo incluye un tokenizer preconstruido en formato propietario (`tokenizer.tkz`) que requiere la libreria tokie; si se usa el tokenizer estandar de Hugging Face, el comportamiento puede diferir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokiers/potion-retrieval-32M
- Modelo base: https://huggingface.co/minishlab/potion-base-32M
- Repositorio Model2Vec: https://github.com/MinishLab/model2vec
- Resultados de Model2Vec: https://github.com/MinishLab/model2vec/blob/main/results/README.md
- Repositorio Tokenlearn: https://github.com/MinishLab/tokenlearn
- Tutoriales de Model2Vec: https://github.com/MinishLab/model2vec/tree/main/tutorials
- Blog sobre embeddings estaticos: https://huggingface.co/blog/static-embeddings
- Repositorio tokie: https://github.com/chonkie-inc/tokie
- Modelos Model2Vec en el hub: https://huggingface.co/models?library=model2vec
- Leaderboard MTEB: https://huggingface.co/spaces/mteb/leaderboard
- Modelo de referencia all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo static-retrieval-mrl-en-v1: https://huggingface.co/minishlab/static-retrieval-mrl-en-v1
- Paper de SIF weighting: https://openreview.net/pdf?id=SyK00v5xx
