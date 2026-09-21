# yuriilaba/ucu-wsd-generation_shuffling_pt-false_seed-456

## Resumen

`yuriilaba/ucu-wsd-generation_shuffling_pt-false_seed-456` es un modelo de embeddings de frases obtenido por fine-tuning del encoder multilingue `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` para desambiguacion del sentido de las palabras (word-sense disambiguation, WSD) en ucraniano. El autor es el usuario de HuggingFace `yuriilaba` y el repositorio forma parte de una serie de experimentos con distintas semillas y configuraciones de entrenamiento: en este caso, sin pooling sobre el token objetivo (`target-token pooling: False`) y con semilla de entrenamiento 456.

El modelo cuenta con 278.043.648 parametros (coincide con el tamano del backbone XLM-RoBERTa base del que deriva el modelo base) y el repositorio ocupa 1,1 GB, lo que corresponde a pesos en `safetensors` en precision de 32 bits. No es un modelo generativo: es un encoder bi-direccional que produce representaciones vectoriales y se evalua con metricas de similitud semantica (STS) y de exactitud en WSD, no con benchmarks de generacion como MMLU o HumanEval.

Su relevancia es acotada y experimental: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados en los metadatos y con una model card muy breve. Los resultados reportados (0,9075 de exactitud en WSD y 0,8171 de Pearson en STS) son razonables para la tarea, pero no hay validacion independiente ni resultados MTEB publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bi-direccional tipo XLM-RoBERTa base (heredada del modelo base `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`); tarea de sentence embeddings con pooling sobre la salida del encoder |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; el backbone XLM-RoBERTa admite hasta 512 posiciones, pero la configuracion efectiva de sentence-transformers no se detalla en la model card |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en `safetensors` (repo de 1,1 GB, compatible con fp32) |
| Idiomas soportados | no declarados en los metadatos; el fine-tuning se realiza sobre datos en ucraniano y el modelo base es multilingue |
| Licencia | no disponible |
| Formato de pesos | `safetensors` |
| Modelo base | `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` |
| Tarea declarada | word-sense disambiguation (WSD) en ucraniano |
| Tamano del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de 278 M de parametros sin cabezal generativo, derivado del backbone XLM-RoBERTa base que utiliza `paraphrase-multilingual-mpnet-base-v2`. El entrenamiento parte de ese modelo ya afinado para similitud semantica multilingue y lo especializa mediante fine-tuning supervisado con tripletes: la model card indica que los datos provienen del fichero `local_datasets/semi_supervised_2/triplets/triplets_generation_token_shuffling.csv`, generado con una estrategia de "token shuffling" sobre tripletes. Se desconoce el numero exacto de ejemplos, el numero de tokens vistos y la composicion linguistica del dataset, que no se publica.

La unica innovacion tecnica documentada es la configuracion de pooling: `target-token pooling: False`, es decir, la representacion de la frase no se extrae del token objetivo sino del pooling estandar (probablemente mean pooling sobre los tokens de la secuencia). Se fijan semilla de entrenamiento 456 y semilla de particion de validacion 42, lo que sugiere un barrido de experimentos con distintas semillas para medir varianza. No se documenta el uso de RLHF, DPO ni ninguna tecnica de alineacion, algo coherente con un modelo de embeddings y no de generacion.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica, con representacion vectorial de dimension heredada del modelo base (no confirmada en la model card).
- Desambiguacion del sentido de palabras en ucraniano, con exactitud reportada de 0,9075 en la evaluacion del autor.
- Similitud semantica textual (STS) con correlacion de Pearson 0,8171 y Spearman 0,8075.
- Recuperacion semantica (retrieval) mediante similitud coseno entre embeddings, utilizable con indices vectoriales.
- Capacidad multilingue potencial por herencia del modelo base, aunque no hay evaluacion por idioma ni confirmacion de que el fine-tuning no haya degradado idiomas distintos del ucraniano.
- No soporta generacion de texto, razonamiento autoregresivo, codigo, matematicas, vision, audio, tool calling ni uso como agente. La model card no menciona ninguna de estas capacidades.

## Casos de uso

- Desambiguacion lexica en corpus ucranianos: dado un contexto y una palabra polisemica, comparar el embedding del contexto con el de cada definicion de sentido y seleccionar el mas cercano; es el uso para el que el modelo fue entrenado y evaluado.
- Enriquecimiento de recursos lexicograficos: asignacion automatica de sentidos de WordNet o de un lexico propio a concordancias extraidas de corpus, reduciendo el trabajo manual de anotacion.
- Busqueda semantica en documentacion en ucraniano: indexar los embeddings de los documentos y consultar por similitud coseno, de forma que variaciones lexicas de la consulta recuperen los mismos resultados.
- Deduplicacion y agrupamiento de textos cortos: agrupar titulares, incidencias o comentarios por similitud de embeddings para eliminar duplicados casi identicos antes de alimentar otros sistemas.
- Clasificacion few-shot mediante kNN sobre embeddings: con unas pocas frases etiquetadas por clase, asignar categorias a nuevos textos sin entrenar un clasificador adicional.
- Mineria de negativos duros para entrenar otros modelos: generar pares de frases muy similares pero semanticamente distintas (por ejemplo, dos sentidos de la misma palabra) y usarlos como negativos en el entrenamiento de modelos de retrieval.
- Evaluacion de calidad de traduccion o de resumen: calcular la similitud semantica entre la referencia y la hipotesis con la metrica STS reportada, como senal complementaria a BLEU o ROUGE.
- Deteccion de ambiguedad en consultas de usuario: en un sistema de FAQ, medir la dispersion de los embeddings de los candidatos y marcar la consulta para revision humana cuando ninguno destaque.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| WSD (ucraniano) | Accuracy | 0,9074778200253485 |
| STS | Pearson | 0,8170877710493093 |
| STS | Spearman | 0,8075154296045051 |

Los resultados MTEB a nivel de tarea se referencian en el repositorio, en `evaluation/mteb_results/`, pero no se incluyen en la informacion disponible. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible, ni tampoco se detalla el conjunto de evaluacion utilizado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con pesos en fp32 y unos 0,55 GB en fp16, mas el espacio de activaciones (dependiente del tamano de lote y de la longitud de secuencia).
- Cabe holgadamente en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4090, etc. Tambien es viable en CPU para lotes pequenos en escenarios de baja carga.
- GPU de centro de datos (A100, H100) no son necesarias; solo tendrian sentido para procesar grandes volumenes en lote con maximizacion de throughput.
- Opciones de despliegue: `sentence-transformers` y `transformers` como via principal, exportacion a ONNX Runtime para produccion en CPU, y servidores de embeddings como Text Embeddings Inference (TEI). El soporte en vLLM o llama.cpp para esta arquitectura concreta no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia, tokens por segundo ni frases por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ucu-wsd-generation_shuffling_pt-false_seed-456 | 278 M | no disponible | Encoder de embeddings afinado para WSD en ucraniano | no disponible | Repositorio HuggingFace, 0 descargas |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | 278 M | 512 tokens | Encoder de embeddings multilingue de proposito general | apache-2.0 (segun la model card publica del modelo base) | Ampliamente utilizado, muy descargado |
| xlm-roberta-base | 278 M | 512 tokens | Encoder multilingue preentrenado, sin objetivo de similitud | mit (segun la model card publica) | Muy extendido como backbone |
| intfloat/multilingual-e5-base | 278 M | 512 tokens | Encoder de embeddings multilingue optimizado para retrieval | mit (segun la model card publica) | Ampliamente utilizado en retrieval multilingue |
| sentence-transformers/LaBSE | 471 M | 256 tokens | Encoder de embeddings para 109 idiomas | apache-2.0 (segun la model card publica) | Referencia en similitud entre idiomas |

Las licencias de los modelos alternativos se toman de sus model cards publicas y no se han verificado en la busqueda web proporcionada; conviene confirmarlas antes de un uso comercial. No hay datos que permitan comparar el rendimiento de este fine-tuning con las alternativas: la unica cifra disponible es su propia evaluacion interna de WSD y STS.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y no debe evaluarse con benchmarks de generacion.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion, y la licencia del modelo base puede imponer condiciones adicionales.
- Idiomas no declarados en los metadatos: la model card indica entrenamiento en ucraniano, pero no hay evaluacion que confirme si el rendimiento en otros idiomas del modelo base se ha degradado tras el fine-tuning.
- El dataset de entrenamiento es local y no se publica (`local_datasets/semi_supervised_2/...`), por lo que el entrenamiento no es reproducible ni auditable.
- Cero descargas y cero likes: no hay evidencia de uso en produccion, validacion de la comunidad ni mantenimiento posterior.
- Las metricas reportadas provienen de la evaluacion del propio autor, sin conjunto de validacion descrito y sin comparacion con lineas base.
- La exactitud de 0,9075 en WSD implica que aproximadamente uno de cada diez casos se resuelve con el sentido incorrecto; en aplicaciones sensibles conviene anadir verificacion humana.
- Riesgo de sesgo linguistico: un corpus de tripletes de origen desconocido puede sobrerrepresentar ciertos dominios, registros o variantes del ucraniano.
- Ausencia de informacion sobre limites de contexto efectivos: si la configuracion heredada limita las secuencias, los textos largos se truncaran y perderan informacion relevante.
- No hay resultados MTEB publicados en la informacion disponible, solo la referencia a la carpeta del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuriilaba/ucu-wsd-generation_shuffling_pt-false_seed-456
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Resultados MTEB referenciados por el autor: carpeta `evaluation/mteb_results/` dentro del repositorio de HuggingFace (no enlazada directamente en la model card)
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo: los resultados obtenidos corresponden a paginas sobre reparacion de suelos de madera, sin relacion con el modelo. No se dispone de paper, blog, repositorio de codigo ni demo asociados.
