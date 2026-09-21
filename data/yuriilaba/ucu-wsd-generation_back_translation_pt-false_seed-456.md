# yuriilaba/ucu-wsd-generation_back_translation_pt-false_seed-456

## Resumen

`yuriilaba/ucu-wsd-generation_back_translation_pt-false_seed-456` es un ajuste fino de un encoder multilingüe orientado a la desambiguación de sentidos (word-sense disambiguation, WSD) en ucraniano. El autor es la cuenta `yuriilaba`, que por la nomenclatura del repositorio (`ucu-wsd`) parece vincularse a un trabajo académico de la Ukrainian Catholic University. El modelo tiene 278.043.648 parámetros, se publica en formato safetensors (repositorio de 1,1 GB) y parte de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un encoder XLM-RoBERTa multilingüe.

El modelo no genera texto: produce representaciones vectoriales de frases y se ha entrenado con tripletas para tareas de similitud semántica y desambiguación léxica. Según su model card, alcanza una exactitud de WSD de 0,9170 y correlaciones de 0,8118 (Pearson) y 0,8012 (Spearman) en tareas de similitud semántica textual (STS), con resultados MTEB por tarea almacenados en el propio repositorio.

Su relevancia es acotada y de perfil investigador: se trata de una variante dentro de una rejilla de experimentos en la que se varían la estrategia de generación de datos (generación y retro-traducción), el pooling del token objetivo (`pt-false`) y la semilla de entrenamiento (`seed-456`). Con 0 descargas y 0 "likes" en el momento de redactar esta ficha, carece de validación por parte de terceros y no declara licencia, idiomas ni pipeline de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer bidireccional), según el tag del repositorio y el modelo base |
| Parámetros totales | 278.043.648 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha del repositorio; el modelo base se distribuye con `max_seq_length` de 128 tokens y soporta hasta 512 posiciones |
| Tipos de cuantización | no disponibles; solo se publican pesos safetensors, sin versiones GGUF, ONNX ni GPTQ/AWQ |
| Idiomas soportados | no disponible en la ficha; el ajuste está orientado a ucraniano y el modelo base es multilingüe (más de 50 idiomas) |
| Licencia | no disponible en el repositorio |
| Formato de pesos | safetensors |
| Pipeline declarado en HuggingFace | no disponible |
| Tamaño del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder transformer bidireccional de la familia XLM-RoBERTa, con 278 M de parámetros, heredada de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`. La model card indica que se ha ajustado como modelo de frases (sentence-transformers) mediante tripletas, y que el pooling del token objetivo está desactivado (`Target-token pooling: False`), es decir, la representación no se restringe a la posición del token a desambiguar.

Los datos de entrenamiento proceden de `local_datasets/semi_supervised_2/triplets/triplets_generation_translation.csv`, una ruta local que no forma parte del repositorio, por lo que el conjunto de datos no es reproducible a partir de la información publicada. La configuración registra la semilla de entrenamiento (`456`) y la semilla de partición de validación (`42`), lo que confirma que el modelo forma parte de una rejilla experimental reproducible. No se documentan número de tokens, composición del corpus, ni si hubo RLHF o DPO; en un encoder de similitud esto último sería inusual. La innovación metodológica que sugiere el nombre del repositorio es el uso de datos generados y retro-traducidos para el ajuste de WSD, aunque no se aporta detalle del procedimiento.

## Capacidades

- Generación de representaciones vectoriales (embeddings) de frases en ucraniano y en los idiomas cubiertos por el modelo base.
- Desambiguación de sentidos (WSD) en ucraniano, con una exactitud declarada de 0,9170.
- Similitud semántica textual (STS), con correlaciones declaradas de 0,8118 (Pearson) y 0,8012 (Spearman).
- Evaluación por tareas MTEB, con resultados almacenados en `evaluation/mteb_results/` del repositorio.
- Multilingüismo heredado del modelo base (más de 50 idiomas en su versión original), no declarado explícitamente en este repositorio.
- Uso a través de la librería `sentence-transformers` y de cualquier stack compatible con transformers (codificación por lotes, similitud por producto escalar o coseno).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un encoder de 278 M de parámetros, no un modelo generativo.

## Casos de uso

- Anotación automática de corpus para WSD en ucraniano: el modelo puntúa la similitud entre la frase de contexto y las glosas o ejemplos de cada sentido, lo que permite pre-etiquetar corpus léxicos a gran escala antes de la revisión humana.
- Lexicografía y construcción de diccionarios: agrupar ocurrencias de una palabra en contextos reales mediante embeddings permite a un lexicógrafo identificar acepciones nuevas o poco documentadas y ordenar ejemplos por sentido.
- Preprocesado para traducción automática: usar la desambiguación como paso previo a la traducción de términos polisémicos, seleccionando la acepción correcta antes de consultar un lexicón bilingüe o un sistema de MT.
- Búsqueda semántica y recuperación de información en ucraniano: indexar documentos con este encoder y consultar por similitud vectorial, aprovechando su entrenamiento en STS para consultas parafraseadas.
- Deduplicación y agrupación temática de textos: clustering sobre los embeddings para detectar duplicados casi idénticos o agrupar noticias y documentos por contenido en corpus ucranianos.
- Filtrado de calidad para corpus de entrenamiento de modelos generativos: calcular similitud entre pares de frases para descartar pares mal alineados en datasets paralelos o de instrucciones.
- Evaluación y línea base en investigación sobre WSD: sirve como referencia reproducible (semilla 456, pooling desactivado) frente a otras variantes de la misma rejilla experimental.
- Clasificación de textos con pocas etiquetas: usar los embeddings como entrada de un clasificador lineal (regresión logística) para tareas de análisis de sentimiento o tematización en ucraniano.

## Benchmarks y rendimiento

| Tarea | Métrica | Resultado |
|---|---|---|
| WSD en ucraniano | Exactitud | 0,9169835234474017 |
| STS | Pearson | 0,8117645671751964 |
| STS | Spearman | 0,8012397619227357 |
| MTEB | Resultados por tarea | publicados en `evaluation/mteb_results/` del repositorio, sin cifras en la model card |

No hay datos publicados sobre el conjunto de evaluación concreto, el número de ejemplos ni la partición utilizada, por lo que las cifras anteriores no son directamente comparables con las de otros sistemas. No se dispone de comparación con modelos similares en la información proporcionada.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 1,1 GB (coincide con el tamaño del repositorio).
- Pesos en FP16/BF16: aproximadamente 556 MB; en INT8, unos 278 MB; en INT4, unos 150 MB (estimaciones por número de parámetros, no publicadas por el autor).
- Cabe en cualquier GPU de consumo: desde una GTX 1650 de 4 GB o una RTX 3060 de 12 GB hasta una RTX 4090, con margen sobrado para lotes grandes.
- Inferencia en CPU viable en escenarios de baja concurrencia, dado el tamaño del modelo.
- Opciones de despliegue: `sentence-transformers` sobre PyTorch, HuggingFace Transformers con pooling manual, Text Embeddings Inference (TEI), ONNX Runtime o exportación a OpenVINO. No aplican vLLM, TGI ni Ollama en su modo generativo, porque el modelo no produce texto autorregresivo; `llama.cpp` podría ejecutarlo en modo embeddings solo si existieran pesos GGUF, que no se han publicado.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependerán del hardware, del lote y de la longitud de secuencia (limitada por el `max_seq_length` configurado).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Perfil |
|---|---|---|---|---|
| `yuriilaba/ucu-wsd-...seed-456` (este modelo) | 278 M | no disponible | no disponible | Encoder ajustado para WSD en ucraniano |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` (modelo base) | 278 M | 128 tokens en la configuración de sentence-transformers | Apache-2.0 (según ficha pública) | Embeddings multilingües de propósito general |
| `xlm-roberta-base` | 278 M | 512 tokens | MIT (según ficha pública) | Encoder multilingüe sin ajuste de similitud |
| `xlm-roberta-large` | 560 M | 512 tokens | MIT (según ficha pública) | Encoder multilingüe de mayor capacidad |
| `sentence-transformers/LaBSE` | 471 M | no verificado | Apache-2.0 (según ficha pública) | Embeddings de frases para más de 100 idiomas |

Los datos de licencia y contexto de los modelos comparados proceden de sus fichas públicas y deben verificarse antes de un uso comercial. No hay una comparación de rendimiento publicada entre este modelo y las alternativas en la misma tarea de WSD en ucraniano.

## Limitaciones y advertencias

- El repositorio no declara licencia: no se puede asumir uso comercial libre sin contactar con el autor.
- No declara idiomas soportados; aunque el modelo base es multilingüe, el ajuste está orientado a ucraniano y su comportamiento en otros idiomas no está documentado.
- Sin descargas ni "likes" en el momento de redactar la ficha: no hay validación independiente de los resultados declarados.
- Las métricas de WSD y STS no especifican el conjunto de evaluación ni la partición, por lo que pueden reflejar un sesgo de selección o un solapamiento con los datos de entrenamiento.
- El conjunto de entrenamiento vive en una ruta local (`local_datasets/...`) que no se publica, lo que impide reproducir el ajuste.
- Riesgo de sesgo heredado del modelo base y del corpus de tripletas, no evaluado en la model card.
- Riesgo de alucinación no aplica en el sentido generativo (no genera texto), pero sí existe riesgo de asignar un sentido incorrecto en contextos ambiguos o de dominio especializado.
- Como encoder de similitud, la calidad depende críticamente del `max_seq_length` configurado: truncar contextos largos degrada la desambiguación en frases extensas.
- Es un artefacto de investigación con semillas y variantes de pooling en el nombre, no un modelo listo para producción: no incluye pipeline declarado ni documentación de despliegue.
- No soporta tool calling, agentes ni razonamiento multi-paso; cualquier producto que requiera generación debe combinarlo con un modelo de lenguaje aparte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuriilaba/ucu-wsd-generation_back_translation_pt-false_seed-456
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Documentación de sentence-transformers: https://www.sbert.net/
- Paper de Sentence-BERT (Reimers y Gurevych, 2019): https://arxiv.org/abs/1908.10084
- Paper de XLM-RoBERTa (Conneau et al., 2019): https://arxiv.org/abs/1911.02116
- Leaderboard de MTEB: https://huggingface.co/spaces/mteb/leaderboard
- Búsqueda web: no se encontraron enlaces relevantes al modelo. Los resultados devueltos correspondían a medios de prensa alemanes (`saechsische.de`, `dnn.de`, `mdr.de`), sin relación con el repositorio.
