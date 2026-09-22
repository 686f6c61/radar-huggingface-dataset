# zeroentropy/zerank-2-reranker

## Resumen

zerank-2-reranker es un modelo de reranking (cross-encoder) desarrollado por ZeroEntropy, una empresa especializada en modelos pequenos y calibrados para recuperacion de informacion. El modelo parte de Qwen/Qwen3-4B y se ha afinado especificamente para puntuar la relevancia entre una consulta y un documento, devolviendo una puntuacion de afinidad por par en lugar de generar texto libre. Con 4.022.468.096 parametros y una longitud de contexto de 32.768 tokens, esta pensado para colocarse en la segunda etapa de un pipeline de RAG o de busqueda, rescorando los candidatos devueltos por un recuperador inicial basado en embeddings.

Su relevancia actual radica en que los rerankers de referencia (Cohere rerank-3.5, Gemini 2.5 Flash en modo listwise) son propietarios y solo accesibles por API, mientras que zerank-2 se publica con pesos abiertos bajo licencia Apache-2.0. Segun la model card, supera a esos competidores cerrados en NDCG@10 en seis de los siete dominios evaluados (web, conversacional, STEM y logica, codigo, legal y biomedico), con una media de 0,6714 frente a 0,5999 de Gemini 2.5 Flash y 0,5847 de Cohere rerank-3.5. La unica excepcion es finanzas, donde Gemini 2.5 Flash obtiene 0,7694 frente a 0,7600.

El modelo se distribuye en formato safetensors y es compatible con la libreria sentence-transformers a traves de la clase `CrossEncoder`. ZeroEntropy describe un pipeline de entrenamiento multietapa que modela las puntuaciones de relevancia consulta-documento como ratings Elo ajustados, detalle que se desarrolla en su informe tecnico (arXiv:2509.12541). El modelo declara soporte unicamente para ingles y esta etiquetado para los dominios finance, legal, code, stem y medical.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder derivado de Qwen3-4B (transformer denso, decodificador), con cabeza de puntuacion de relevancia |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (32k) |
| Tipos de cuantizacion | No disponible. El autor no documenta cuantizaciones oficiales; el repo contiene pesos en safetensors (8,1 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B |
| Tarea (pipeline) | text-ranking (reranking de pares consulta-documento) |
| Libreria | sentence-transformers |
| Salida | Logit crudo del token "Yes" por par. Para obtener una probabilidad 0-1: `sigmoid(score / 5)` |
| Fecha de publicacion | 19 de noviembre de 2025 (ultima actualizacion registrada: 24 de julio de 2026) |
| Descargas / likes | 652.272 descargas y 133 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la de un cross-encoder: el texto de la consulta y el del documento se concatenan en una unica secuencia de entrada (hasta 32.768 tokens) y el modelo produce una puntuacion escalar de relevancia. Internamente hereda el transformer denso de Qwen3-4B; la model card no detalla la composicion exacta de capas, el numero de cabezas de atencion ni si se emplea atencion agrupada (GQA), por lo que esos datos figuran como no disponibles. La innovacion principal descrita por el autor no esta en el bloque transformer, sino en el procedimiento de entrenamiento: ZeroEntropy emplea un pipeline multietapa que modela las puntuaciones de relevancia consulta-documento como ratings Elo ajustados, en lugar de entrenar exclusivamente con etiquetas binarias de relevancia. El informe tecnico asociado (arXiv:2509.12541) es la referencia para los detalles del metodo.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card si indica que el modelo esta etiquetado y evaluado en dominios concretos (finance, legal, code, stem, medical y datos conversacionales), lo que sugiere un ajuste orientado a mezclas de datos heterogeneas por vertical. En mayo de 2026 se introdujo un cambio incompatible en la API: `model.predict()` paso de devolver probabilidades sigmoideas en [0, 1] a devolver los logits crudos del token "Yes"; el orden de los rankings no cambio, y la conversion a probabilidades requiere ahora aplicar `(scores / 5).sigmoid()`. Adicionalmente, la carga del modelo ya no requiere `trust_remote_code=True`.

## Capacidades

- Reranking de pares consulta-documento: asigna una puntuacion de relevancia a cada par, lo que permite reordenar una lista de candidatos recuperados por un buscador vectorial o lexico.
- Puntuacion y ordenacion integradas: el metodo `model.rank(query, documents)` devuelve los documentos ordenados por puntuacion, sin necesidad de codigo adicional de ordenacion.
- Seguimiento de instrucciones: la descripcion publica del modelo enfatiza el "advanced instruction following" como una de las capacidades trabajadas durante el entrenamiento.
- Cobertura de dominios verticales: evaluado especificamente en web general, conversacional, STEM y logica, codigo, legal, biomedico y finanzas.
- Consultas y documentos largos: la ventana de 32.768 tokens permite puntuar pares con documentos extensos sin troceado agresivo.
- Integracion como cross-encoder en sentence-transformers: expone la interfaz estandar `CrossEncoder`, con `predict` y `rank`, y devuelve tensores en el dispositivo indicado.
- Despliegue alternativo por API: el modelo puede consumirse mediante el endpoint `/models/rerank` de ZeroEntropy y a traves de AWS Marketplace, ademas de en local.
- Idiomas: soporte declarado unicamente para ingles.
- Vision o audio: no disponible. El titulo del articulo de presentacion menciona "multimodal", pero la model card no documenta entradas de imagen ni de audio, por lo que no se debe asumir esa capacidad.
- Tool calling o uso como agente generador: no aplica; es un modelo de ranking, no un modelo generativo conversacional. No se documenta soporte de function calling.

## Casos de uso

- Segunda etapa de pipelines RAG: se recuperan entre 50 y 100 candidatos con un recuperador denso (por ejemplo, text-embedding-3-small, como en la evaluacion del propio autor) y zerank-2 los reordena antes de pasarlos al LLM generador. Mejora la precision del contexto inyectado y reduce tokens irrelevantes en el prompt.
- Busqueda documental legal: el modelo obtiene 0,6644 de NDCG@10 en el dominio legal, por encima de Cohere rerank-3.5 (0,5257) y de Gemini 2.5 Flash (0,5565). Es adecuado para despachos y departamentos juridicos que necesitan localizar clausulas o precedentes en corpus extensos, con documentos que caben en la ventana de 32k tokens.
- Recuperacion de literatura biomedica: con 0,7217 de NDCG@10 en el dominio biomedico, es el mejor resultado de la comparativa publicada frente a Cohere (0,6246). Util para buscadores internos de articulos, ensayos clinicos o fichas tecnicas de producto sanitario.
- Busqueda de codigo en repositorios internos: 0,6528 de NDCG@10 en el dominio de codigo. Se puede integrar en un asistente de documentacion tecnica o en un buscador de fragmentos de codigo que rescore candidatos devueltos por un indice de embeddings de funciones y ficheros.
- Atencion al cliente con base de conocimiento: el dominio conversacional obtiene 0,6140 de NDCG@10 frente a 0,5648 de Cohere rerank-3.5. Permite seleccionar los articulos de ayuda mas pertinentes para una consulta formulada en lenguaje natural coloquial antes de que un LLM componga la respuesta.
- Busqueda en corpus cientifico y tecnico: en STEM y logica alcanza 0,6521 de NDCG@10, el mejor valor de la tabla publicada. Aplicable a portales de publicaciones cientificas, documentacion de ingenieria o foros tecnicos.
- Filtrado de contexto en asistentes sobre datos financieros: aunque en finanzas el mejor resultado es de Gemini 2.5 Flash (0,7694 frente a 0,7600), zerank-2 sigue siendo una opcion abierta y desplegable en local para rescorar informes trimestrales o notas de analistas sin enviar datos a una API externa.
- Despliegue en entornos con requisitos de soberania del dato: al ser pesos abiertos con licencia Apache-2.0, puede ejecutarse en infraestructura propia en sectores regulados (sanidad, banca, sector publico) donde no se permite enviar documentos a proveedores cerrados.

## Benchmarks y rendimiento

La model card publica NDCG@10 con `text-embedding-3-small` de OpenAI como recuperador inicial sobre los 100 mejores candidatos. Los resultados son los siguientes:

| Dominio | OpenAI embeddings | zerank-2 | zerank-1 | Gemini 2.5 Flash (listwise) | Cohere rerank-3.5 |
|---|---|---|---|---|---|
| Web | 0,3819 | 0,6346 | 0,6069 | 0,5765 | 0,5594 |
| Conversacional | 0,4305 | 0,6140 | 0,5801 | 0,6021 | 0,5648 |
| STEM y logica | 0,3744 | 0,6521 | 0,6283 | 0,5447 | 0,5418 |
| Codigo | 0,4582 | 0,6528 | 0,6310 | 0,6128 | 0,5364 |
| Legal | 0,4101 | 0,6644 | 0,6222 | 0,5565 | 0,5257 |
| Biomedico | 0,4783 | 0,7217 | 0,6967 | 0,5371 | 0,6246 |
| Finanzas | 0,6232 | 0,7600 | 0,7539 | 0,7694 | 0,7402 |
| Media | 0,4509 | 0,6714 | 0,6456 | 0,5999 | 0,5847 |

Notas sobre la evaluacion: los valores de zerank-1, Gemini 2.5 Flash y Cohere rerank-3.5 proceden de la propia model card de zerank-2, es decir, son cifras reportadas por el desarrollador del modelo. No se han publicado en la informacion disponible resultados de benchmarks clasicos de generacion (MMLU, HumanEval, GSM8K) porque el modelo no es generativo, sino un reranker. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: el checkpoint ocupa 8,1 GB en disco, por lo que los pesos en precision completa de 16 bits rondan los 8 GB. Con activaciones, cache KV y un lote pequeno, la estimacion practica es de 10 a 12 GB de VRAM.
- Escenarios de contexto largo: al puntuar pares cerca del limite de 32.768 tokens y con lotes grandes, la cache KV y las activaciones crecen de forma apreciable; se recomienda reservar entre 16 y 24 GB de VRAM en ese caso (estimacion a partir del tamano del modelo, no verificada por el autor).
- GPU profesionales: A100 (40 o 80 GB), H100, L40S y A10G son suficientes con margen para lotes grandes y secuencias largas.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB) en bf16 con lotes moderados. En tarjetas de 8 a 12 GB (RTX 3060 12 GB, RTX 4060 Ti) seria necesario reducir el lote y la longitud de secuencia; el autor no publica cuantizaciones oficiales, de modo que la reduccion de precision requeriria cuantizar por cuenta propia con herramientas externas.
- Opciones de despliegue: sentence-transformers en local con `CrossEncoder` (la via documentada por el autor); endpoint `/models/rerank` de ZeroEntropy; AWS Marketplace. Text Embeddings Inference (TEI) soporta cross-encoders y seria una via habitual para servir este tipo de modelos, aunque no esta confirmado explicitamente por el autor para este checkpoint. No se documentan pesos GGUF, por lo que llama.cpp y Ollama no son vias soportadas de forma oficial.
- Latencia y throughput: no disponible. Al tratarse de un cross-encoder, el coste computacional crece de forma lineal con el numero de pares consulta-documento a puntuar, por lo que el numero de candidatos enviados a la etapa de reranking es el principal factor de latencia del sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NDCG@10 medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zerank-2 | 4,02B | 32.768 tokens | 0,6714 | Apache-2.0 | Pesos abiertos en HuggingFace, API y AWS Marketplace |
| zerank-1 | No disponible | No disponible | 0,6456 | No disponible en la informacion consultada | Pesos en HuggingFace (zeroentropy/zerank-1-reranker) |
| Gemini 2.5 Flash (listwise) | No disponible | No disponible | 0,5999 | Propietaria | Solo API |
| Cohere rerank-3.5 | No disponible | No disponible | 0,5847 | Propietaria | Solo API |

ZeroEntropy mantiene ademas variantes como `zerank-1-small-reranker` y modelos de embeddings (`zembed-1`), que no se incluyen en esta comparativa por falta de datos publicados en la informacion disponible. No se dispone de cifras comparables para otros rerankers abiertos de la competencia (por ejemplo, la familia bge-reranker o jina-reranker), ya que no aparecen en la documentacion facilitada.

## Limitaciones y advertencias

- Idioma: el modelo declara soporte unicamente para ingles. No hay datos publicados sobre su comportamiento en castellano ni en otros idiomas, por lo que su uso en recuperacion multilingue no esta respaldado por el autor.
- Naturaleza del modelo: es un cross-encoder de ranking, no un modelo generativo. No puede usarse para generar respuestas, resumir ni mantener conversaciones; solo puntua la relevancia de pares consulta-documento.
- Riesgo de sesgo en el ranking: al estar afinado sobre mezclas de datos de dominios concretos (finance, legal, code, stem, medical, web y conversacional), su comportamiento fuera de esos dominios no esta caracterizado y podria degradarse.
- Sensibilidad a la etapa de recuperacion: las cifras de NDCG@10 se obtuvieron rescorando los 100 mejores candidatos de text-embedding-3-small. Con un recuperador inicial distinto o con un numero de candidatos distinto, los resultados pueden variar.
- Cambio incompatible en la API: desde mayo de 2026, `model.predict()` devuelve logits crudos y no probabilidades. El codigo escrito contra versiones anteriores que asuma valores en [0, 1] dara resultados incorrectos si no se aplica `(scores / 5).sigmoid()`. El orden de los rankings no cambia.
- Escala de puntuacion no acotada por defecto: los logits pueden ser positivos o negativos y no tienen una interpretacion de probabilidad directa sin la transformacion indicada. Cualquier umbral de corte debe calibrarse sobre datos propios.
- Coste computacional: puntuar cada par implica una pasada completa por el modelo de 4B parametros. Con lotes grandes de candidatos, el coste en GPU puede ser significativo frente a un simple producto escalar de embeddings.
- Cuantizaciones: el autor no publica versiones cuantizadas ni pesos GGUF, lo que limita el despliegue en hardware muy restringido sin trabajo adicional de conversion y validacion.
- Ausencia de datos sobre entrenamiento: no se especifican el volumen de tokens, la composicion del dataset ni el uso de RLHF o DPO, lo que dificulta auditar posibles sesgos de los datos de entrenamiento.
- Benchmarks autodeclarados: las comparaciones con Cohere rerank-3.5 y Gemini 2.5 Flash proceden del propio desarrollador del modelo y no de una evaluacion independiente de terceros.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, pero conviene revisar las condiciones de la licencia del modelo base Qwen3-4B y de los servicios de API o AWS Marketplace si se opta por esas vias en lugar del despliegue local.
- Capacidad multimodal: aunque el articulo de presentacion se titula "multimodal reranker", la model card no documenta entrada de imagenes ni audio. No se debe asumir soporte multimodal sin verificacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeroentropy/zerank-2-reranker
- Organizacion ZeroEntropy en HuggingFace: https://huggingface.co/zeroentropy
- Informe tecnico (arXiv:2509.12541): https://arxiv.org/abs/2509.12541
- Articulo de presentacion de zerank-2: https://www.zeroentropy.dev/articles/zerank-2-advanced-instruction-following-multimodal-reranker
- Que es un reranker y cuando necesitas uno: https://www.zeroentropy.dev/blog/what-is-a-reranker-and-do-i-need-one
- Documentacion de la API de reranking: https://docs.zeroentropy.dev/api-reference/models/rerank
- Introduccion a la documentacion de ZeroEntropy: https://docs.zeroentropy.dev/introduction
- Sitio principal de ZeroEntropy: https://www.zeroentropy.dev/
- Pagina de la empresa: https://www.zeroentropy.dev/about
- Listado en AWS Marketplace: https://aws.amazon.com/marketplace/pp/prodview-o7avk66msiukc
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
