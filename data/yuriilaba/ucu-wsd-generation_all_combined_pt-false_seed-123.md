# yuriilaba/ucu-wsd-generation_all_combined_pt-false_seed-123

## Resumen

`yuriilaba/ucu-wsd-generation_all_combined_pt-false_seed-123` es un modelo de desambiguacion de sentidos (word-sense disambiguation, WSD) para ucraniano, publicado por el usuario yuriilaba en HuggingFace. Se trata de un fine-tune del sentence transformer `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, que a su vez se apoya en la arquitectura XLM-RoBERTa base. El repositorio contiene pesos en formato safetensors con 278.043.648 parametros y un tamano total de 1,1 GB, coherente con pesos en precision de 32 bits.

El modelo no es generativo: produce representaciones vectoriales (embeddings) de frases y resuelve tareas de similitud semantica y desambiguacion. Su interes practico esta en el procesamiento de lengua ucraniana, un idioma con menos recursos y menos modelos especializados que el ingles o el castellano. La model card reporta una exactitud de WSD de 0,9163 y correlaciones STS de 0,8158 (Pearson) y 0,8056 (Spearman).

El modelo se entreno sobre el fichero `triplets_generation_all_combined.csv`, con un pooling que no usa el token objetivo (`target-token pooling: False`) y semilla de entrenamiento 123, con semilla de particion de validacion 42. Es un artefacto de investigacion: no declara licencia, idiomas oficiales, pipeline de HuggingFace ni resultados MTEB resumidos mas alla de las metricas citadas, y cuenta con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo encoder (XLM-RoBERTa base) sobre sentence-transformers/paraphrase-multilingual-mpnet-base-v2 |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el modelo base XLM-RoBERTa soporta hasta 512 tokens, y la configuracion de sentence-transformers suele limitar la secuencia de entrada |
| Tipos de cuantizacion | no se documenta ninguno; el tamano del repo (1,1 GB para 278 M de parametros) indica pesos en fp32 |
| Idiomas soportados | objetivo declarado: ucraniano; el modelo base es multilingue (mas de 50 idiomas), sin lista oficial para este fine-tune |
| Licencia | no disponible (el modelo base se distribuye bajo Apache-2.0, pero el autor no declara licencia para este fine-tune) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional heredado de XLM-RoBERTa base, adaptado a representaciones de frase mediante sentence-transformers. El modelo base, `paraphrase-multilingual-mpnet-base-v2`, combina el encoder XLM-R con un objetivo de preentrenamiento MPNet (masked and permuted language modelling) orientado a similitud semantica multilingue. El fine-tune anade una cabeza de pooling configurable; en esta variante concreta el flag de pooling sobre el token objetivo esta desactivado (`pt-false`), lo que implica que la representacion se construye agregando la secuencia completa en lugar de aislar el token desambiguado.

El entrenamiento parte del fichero de tripletes `local_datasets/semi_supervised_2/triplets/triplets_generation_all_combined.csv`, en un esquema semi-supervisado con tripletes del tipo ancla-positivo-negativo. Se fijaron dos semillas: 123 para el entrenamiento y 42 para la particion de validacion. No se documenta el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones (no aplicables, en cualquier caso, a un modelo de representaciones). Tampoco se detalla la innovacion tecnica del pooling ni la funcion de perdida empleada (probablemente una perdida contrastiva tipo MultipleNegativesRanking, aunque no se confirma en la model card).

## Capacidades

- Generacion de embeddings de frase para ucraniano y para los idiomas cubiertos por el modelo base multilingue.
- Desambiguacion de sentidos de palabras (WSD) en ucraniano, con exactitud reportada de 0,9163.
- Evaluacion de similitud semantica textual (STS) con correlaciones Pearson 0,8158 y Spearman 0,8056.
- Recuperacion semantica y busqueda por similitud vectorial, al ser un modelo de embeddings.
- Agrupamiento (clustering) y deduplicacion de textos mediante distancia coseno sobre los vectores generados.
- Evaluaciones integradas en MTEB, con resultados por tarea almacenados en `evaluation/mteb_results/` del propio repositorio.
- Sin soporte de tool calling ni de function calling.
- Sin soporte de agentes ni de razonamiento multi-paso: no es un modelo generativo ni de chat.
- Sin capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue indirecta, heredada del modelo base; no confirmada ni evaluada por el autor para idiomas distintos del ucraniano.

## Casos de uso

- Anotacion lexica automatica de corpus ucranianos: el modelo puede etiquetar cada ocurrencia de una palabra polisemica con su sentido correcto, sustituyendo parte del trabajo manual en la construccion de corpus anotados, gracias a su exactitud de WSD de 0,9163.
- Enriquecimiento de wordnets y recursos lexicograficos: al desambiguar ocurrencias reales en corpus, se pueden extraer ejemplos de uso por sentido y vincularlos a synsets existentes en recursos como WordNet-Uk.
- Busqueda semantica en repositorios documentales en ucraniano: los embeddings permiten indexar y recuperar documentos por significado y no por coincidencia exacta de terminos, util en administraciones publicas, bibliotecas digitales o archivos periodisticos.
- Deduplicacion y agrupamiento de noticias o articulos: calculando similitud coseno entre embeddings se pueden detectar piezas duplicadas o agrupar coberturas del mismo evento, con un coste computacional bajo (278 M de parametros).
- Filtrado y clasificacion de textos como etapa de preprocesado: los vectores pueden alimentar un clasificador ligero (regresion logistica, SVM) para enrutado de tickets, deteccion de toxicidad o categorizacion tematica sin necesidad de un LLM.
- Recuperacion aumentada (RAG) en ucraniano: el modelo actua como recuperador o reranker de pasajes antes de pasar el contexto a un modelo generativo, lo que mejora la precision en sistemas de pregunta-respuesta sobre documentacion tecnica o legal.
- Control de calidad de traduccion automatica: la correlacion STS de 0,8158 permite comparar la similitud semantica entre original y traduccion como metrica automatica de fidelidad.
- Investigacion en procesamiento de lenguas con pocos recursos: sirve como punto de partida reproducible (semillas 123 y 42) para estudios comparativos de WSD en ucraniano.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| WSD (ucraniano) | Exactitud (accuracy) | 0,9163 |
| STS | Correlacion de Pearson | 0,8158 |
| STS | Correlacion de Spearman | 0,8056 |
| MTEB | Resultados por tarea | almacenados en `evaluation/mteb_results/` del repositorio; no resumidos en la model card |

No se proporcionan resultados comparativos frente a otros modelos, ni se especifica el conjunto de evaluacion de WSD (numero de instancias, inventario de sentidos) ni el conjunto STS empleado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32, en torno a 0,56 GB en fp16 y unos 0,28 GB en int8 (estimacion a partir de los 278.043.648 parametros).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el modelo es manejable en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin necesidad de paralelismo.
- Cabe en GPU de consumo: si, de forma holgada, incluidas GPUs de gama de entrada y portatiles con 4 GB o mas.
- Ejecucion en CPU: viable para lotes pequenos, dado el reducido numero de parametros.
- Opciones de despliegue: sentence-transformers, HuggingFace transformers, ONNX Runtime y Text Embeddings Inference (TEI). No se recomienda vLLM por tratarse de un modelo de embeddings y no de generacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Resultado en WSD ucraniano |
|---|---|---|---|---|---|
| ucu-wsd-generation_all_combined_pt-false_seed-123 | 278 M | no disponible | Embeddings + WSD ucraniano | no disponible | 0,9163 |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | 278 M | hasta 512 tokens (segun configuracion) | Embeddings multilingues | Apache-2.0 | no disponible |
| XLM-RoBERTa base | 278 M | 512 tokens | Encoder multilingue | MIT | no disponible |
| Otros modelos de WSD para ucraniano | no disponible | no disponible | WSD | no disponible | no disponible |

No se dispone de resultados comparativos publicados en la informacion proporcionada que permitan situar este fine-tune frente a alternativas de la misma categoria. La comparacion se limita, por tanto, a la relacion con su modelo base.

## Limitaciones y advertencias

- La model card no declara licencia: no se puede asumir uso comercial sin aclaracion explicita del autor, aunque el modelo base se distribuya bajo Apache-2.0.
- Riesgo de alucinacion no aplicable en sentido estricto (no genera texto), pero si existe riesgo de asignacion incorrecta de sentidos en dominios alejados de los datos de entrenamiento.
- El conjunto de evaluacion de WSD no se describe, por lo que la exactitud de 0,9163 no es verificable ni extrapolable a otros corpus.
- No se documenta la composicion del dataset de tripletes ni su origen, lo que impide evaluar sesgos de dominio, de registro o de variedad dialectal del ucraniano.
- La lista de idiomas soportados no esta declarada; el comportamiento fuera del ucraniano no ha sido validado por el autor.
- La longitud de contexto efectiva no esta documentada; conviene verificar la configuracion de `max_seq_length` antes de procesar parrafos o documentos largos.
- El repositorio registra 0 descargas y 0 likes, y la fecha de creacion indicada (2026-09-21) resulta anomala; se recomienda verificar la vigencia y el mantenimiento del artefacto antes de integrarlo en produccion.
- No hay pipeline declarado en HuggingFace, por lo que su uso directo con `pipeline()` puede requerir configuracion manual.
- Los resultados de busqueda web asociados a esta ficha no contienen informacion relevante sobre el modelo (devuelven enlaces de Snapchat), por lo que no aportan contexto adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuriilaba/ucu-wsd-generation_all_combined_pt-false_seed-123
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Resultados MTEB del propio modelo: ruta `evaluation/mteb_results/` dentro del repositorio de HuggingFace
- Dataset de entrenamiento citado: `local_datasets/semi_supervised_2/triplets/triplets_generation_all_combined.csv` (ruta local, no se proporciona enlace publico)
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
