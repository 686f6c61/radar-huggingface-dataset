# WhiteHades/blink-8M-int8

## Resumen

blink-8M-int8 es un modelo de embeddings estaticos (static embeddings) derivado de minishlab/blink-8M, empaquetado por el usuario WhiteHades en un formato binario propio de 8 MB para busqueda en navegador. No se trata de un transformer con inferencia neuronal: es una tabla de vectores por token, cuantizada a int8 con una escala float32 por token, que se consulta mediante busqueda directa en memoria. El modelo base blink-8M procede de MinishLab, autores de Model2Vec, una tecnica que destila modelos sentence-transformers en representaciones estaticas por token.

El paquete incluye la tabla de vectores (dimension 256, 30.000 tokens), el vocabulario WordPiece de BERT y los metadatos necesarios para calcular el embedding de un texto como la media normalizada de los vectores de sus tokens, omitiendo el token `[UNK]`. Esta pensado como el modelo de busqueda de la extension de navegador metldr, leido por el crate de Rust `metldr-embed` y fusionado con BM25 mediante reciprocal rank fusion.

Su relevancia actual reside en el compromiso entre calidad de recuperacion y coste computacional: con 8 MB de almacenamiento y sin ejecutar ninguna red neuronal, alcanza un nDCG@10 medio de 0,4109 en cuatro datasets de BEIR, ligeramente por encima de alternativas de 31-33 MB como potion-retrieval-32M o static-retrieval-mrl-en-v1. Es un caso de uso de retrieval ligero, no un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos por token (Model2Vec), sin red neuronal en inferencia |
| Parametros totales | no disponible (el modelo base es un destilado estatico; el paquete almacena 30.000 vectores de 256 dimensiones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el embedding es una media de tokens sin ventana definida) |
| Tipos de cuantizacion | int8 con una escala float32 por token (formato propio `.metldr`) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `.metldr` (binario little endian con cabecera `MTLDRE01`, vocabulario, escalas f32 e int8 por token); el base original esta en safetensors |
| Dimension del embedding | 256 |
| Tamano del vocabulario | 30.000 tokens (WordPiece de BERT, minusculas y sin acentos) |
| Tamano del paquete | 8 MB |

## Arquitectura y entrenamiento

El modelo base blink-8M es un modelo de embeddings estaticos generado con Model2Vec, una tecnica que comprime un sentence-transformer en una tabla de vectores por token. En inferencia no hay atencion ni capas ocultas: el embedding de un texto se calcula como la media normalizada de los vectores de sus tokens, con el token `[UNK]` excluido. El texto se tokeniza con WordPiece de BERT en minusculas y con los acentos eliminados.

La variante int8 anade una etapa de empaquetado: cada vector de token se almacena como 30.000 filas de 256 valores int8, acompanado de una escala float32 por token que permite reconstruir el valor original multiplicando valor por escala. El paquete se genero con la herramienta `pack-model` a partir de la revision `593ed556e9a417e80b3b251a28ba8f412bed026e` del modelo base, cuyo `model.safetensors` tiene SHA-256 `e10d60e7e4b2cbaafaf3282f1eec108b597047f8013088f77178aa2ef0055866`. No se documentan en la informacion disponible los datos de entrenamiento del modelo base ni si hubo etapas de RLHF o DPO, algo que en cualquier caso no aplica a un modelo de embeddings.

## Capacidades

- Extraccion de features: genera embeddings de frases y documentos de 256 dimensiones para tareas de recuperacion y similitud semantica.
- Recuperacion densa: disenado para busqueda semantica sobre corpus documentales, con integracion documentada con BM25 mediante reciprocal rank fusion.
- Inferencia sin red neuronal: la consulta se resuelve como una media ponderada de vectores de token, sin calculo matricial de atencion.
- Ejecucion en navegador: el formato `.metldr` esta pensado para ser leido por el crate de Rust `metldr-embed` dentro de una extension de navegador.
- Multilingue: no disponible; solo soporta ingles.
- Tool calling, agentes, razonamiento multi-paso, vision, audio, modo thinking: no soportado; no es un modelo generativo.

## Casos de uso

- Busqueda semantica en extension de navegador: el modelo es el motor de busqueda de la extension metldr, donde el paquete de 8 MB se carga en memoria y cada consulta se resuelve en microsegundos sin llamadas a servidor, lo que permite busqueda local sobre el historial o el contenido indexado.
- Recuperacion hibrida con BM25: combinado con BM25 mediante reciprocal rank fusion (peso denso 0,75, k=5), mejora el nDCG@10 de BM25 solo en los cuatro datasets evaluados (0,3809 a 0,4109 de media), por lo que es adecuado como capa densa ligera sobre un indice lexico existente.
- Busqueda documental de bajo coste en produccion: con 8 MB de almacenamiento y sin GPU, puede desplegarse en entornos con restricciones severas de memoria o en dispositivos edge donde un sentence-transformer no cabe.
- Deduplicacion y agrupamiento de textos: los embeddings de 256 dimensiones permiten calcular similitud coseno entre documentos para tareas de near-duplicate detection o clustering, con la ventaja de que el calculo es una simple media de vectores.
- Filtrado previo en pipelines RAG: puede actuar como primera etapa de recuperacion barata que reduce el corpus antes de un re-ranker neuronal mas costoso, reduciendo latencia y coste computacional.
- Clasificacion ligera por similitud: comparar el embedding de una consulta con embeddings de prototipos de categoria para enrutamiento o etiquetado rapido en aplicaciones de bajo presupuesto.

## Benchmarks y rendimiento

Evaluacion sobre consultas de test de BEIR, nDCG@10, fusionado con BM25 por weighted reciprocal rank fusion con k=5 y peso denso 0,75:

| Modelo (int8) | MB | SciFact | NFCorpus | ArguAna | FiQA | Media |
|---|---|---|---|---|---|---|
| BM25 solo | 0 | 0.6637 | 0.3098 | 0.3202 | 0.2299 | 0.3809 |
| blink-8M (este archivo) | 8 | 0.7047 | 0.3402 | 0.3495 | 0.2493 | 0.4109 |
| lattice-retrieval, 1024 dims | 31 | 0.7026 | 0.3366 | 0.3557 | 0.2490 | 0.4110 |
| potion-retrieval-32M | 33 | 0.6952 | 0.3349 | 0.3513 | 0.2438 | 0.4063 |
| static-retrieval-mrl-en-v1 | 31 | 0.6745 | 0.3317 | 0.3516 | 0.2450 | 0.4007 |

Segun el autor, el almacenamiento int8 no supone perdida de calidad medible. Una consulta de SciFact que embebe y busca 5.183 documentos tarda 145 microsegundos en ejecucion nativa.

## Requisitos de hardware

- VRAM: no requiere GPU; el paquete ocupa 8 MB y se resuelve con operaciones de memoria y aritmetica escalar.
- GPU recomendadas: no aplica; cualquier CPU es suficiente.
- Consumer GPU: no aplica, no hay inferencia neuronal.
- Despliegue: el formato `.metldr` esta pensado para el crate de Rust `metldr-embed`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia: 145 microsegundos para embeber y buscar una consulta sobre 5.183 documentos en ejecucion nativa, segun el autor.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros / dimension | Contexto | Calidad (media BEIR nDCG@10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| blink-8M-int8 (este) | 30.000 tokens x 256 dims, int8 | no disponible | 0.4109 | MIT | Hugging Face, formato `.metldr` |
| lattice-retrieval (1024 dims) | 1024 dims, int8, 31 MB | no disponible | 0.4110 | no disponible | Hugging Face |
| potion-retrieval-32M | 32M, int8, 33 MB | no disponible | 0.4063 | no disponible | Hugging Face |
| static-retrieval-mrl-en-v1 | 31 MB, int8 | no disponible | 0.4007 | no disponible | Hugging Face |

La comparativa se limita a los datos de la evaluacion del autor; no se dispone de informacion sobre parametros totales ni contexto de los modelos alternativos.

## Limitaciones y advertencias

- Solo soporta ingles; el tokenizador aplica minusculas y elimina acentos, lo que degrada el rendimiento en otros idiomas.
- Al ser un modelo de embeddings estaticos, no captura contexto posicional ni orden de palabras mas alla de la media de vectores; las negaciones y estructuras sintacticas complejas pueden representarse de forma imprecisa.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- La evaluacion se limita a cuatro datasets de BEIR y al protocolo de fusion con BM25 descrito por el autor; no hay datos sobre otros dominios ni sobre uso sin BM25.
- El formato `.metldr` es propietario y solo esta documentado para el crate `metldr-embed`; la portabilidad a otros ecosistemas requiere implementar el parser del formato.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo se creo y actualizo el mismo dia; no hay evidencia de uso en produccion por terceros.
- Licencia MIT, sin restricciones conocidas para uso comercial, heredada del modelo base.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la recuperacion puede devolver documentos semanticamente proximos pero irrelevantes si el corpus es ruidoso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WhiteHades/blink-8M-int8
- Modelo base: https://huggingface.co/minishlab/blink-8M
- Repositorio de Model2Vec: https://github.com/MinishLab/model2vec
- Repositorio de blink: https://github.com/MinishLab/blink
