# yuriilaba/ucu-wsd-generation_stochastic_pt-true_seed-456

## Resumen

`yuriilaba/ucu-wsd-generation_stochastic_pt-true_seed-456` es un modelo de embeddings derivado de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` (arquitectura XLM-RoBERTa base) y ajustado para desambiguacion del sentido de palabras (WSD) en ucraniano. El resultado es un codificador bidireccional de 278.043.648 parametros que proyecta palabras en contexto a un espacio vectorial donde los sentidos distintos de un mismo lema quedan separados, en lugar de un modelo generativo: no produce texto, produce representaciones.

El ajuste se ha realizado con datos de entrenamiento en formato de tripletas (`triplets_generation_stochastic_combination.csv`) y con pooling sobre el token objetivo (`target-token pooling: True`), lo que concentra la representacion en la palabra a desambiguar y no en la frase completa. La model card documenta dos familias de resultados: exactitud en WSD (0,9357) y correlacion en tareas de similitud textual STS (Pearson 0,8018; Spearman 0,7917), con resultados completos de MTEB en `evaluation/mteb_results/`.

Es relevante como artefacto de investigacion reproducible: el nombre codifica la configuracion exacta del experimento (`generation_stochastic`, `pt-true`, `seed-456`) y la semilla de validacion esta fijada a 42, lo que sugiere que forma parte de una bateria de ejecuciones comparables. Conviene tratarlo como un checkpoint de investigacion y no como un modelo listo para produccion: el repositorio no declara licencia, no tiene descargas ni likes y la model card no incluye instrucciones de uso ni inventario de sentidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (XLM-RoBERTa base), con pooling sobre el token objetivo |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion (la arquitectura XLM-RoBERTa base admite hasta 512 tokens; el limite efectivo del fine-tuning no se publica) |
| Tipos de cuantizacion | no se publican variantes cuantizadas; el repositorio contiene pesos safetensors en FP32 (1,1 GB de repo para 278 M de parametros) |
| Idiomas soportados | ucraniano (tarea objetivo, WSD); el modelo base es multilingue |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un encoder de la familia XLM-RoBERTa con vocabulario multilingue, entrenado originalmente con objetivos contrastivos sobre pares de frases paralelas. Sobre esa base, el autor aplica un ajuste con tripletas (ancla, positivo, negativo) orientado a discriminar sentidos: el objetivo es que dos apariciones del mismo lema con sentidos distintos queden mas separadas en el espacio de embeddings que dos apariciones con el mismo sentido. El modelo se evalua como sistema de embeddings, no como generador.

Dos detalles de configuracion son relevantes. Primero, `target-token pooling: True`: en lugar de promediar todos los tokens o usar el token `[CLS]`, la representacion se extrae del token correspondiente a la palabra objetivo, lo que es coherente con una tarea de WSD a nivel de palabra. Segundo, la reproducibilidad esta fijada por semilla (`seed-456` para el entrenamiento, `42` para el split de validacion) y por el fichero de datos indicado, de modo que el experimento es replicable si se dispone del CSV. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo una etapa de RLHF o DPO (en un modelo de embeddings, ese tipo de alineamiento no aplica del mismo modo).

## Capacidades

- Generacion de embeddings de frases y de palabras en contexto, con salida vectorial utilizable para similitud coseno, clustering y recuperacion.
- Desambiguacion del sentido de palabras en ucraniano, con exactitud declarada de 0,9357 en la tarea WSD del autor.
- Similitud textual semantica (STS) multilingue, con Pearson 0,8018 y Spearman 0,7917.
- Representacion especifica de la palabra objetivo dentro de la frase, gracias al pooling sobre token objetivo.
- Evaluacion bajo el marco MTEB, con resultados a nivel de tarea en `evaluation/mteb_results/`.
- Capacidad multilingue heredada del modelo base (XLM-RoBERTa), aunque el ajuste se ha orientado a ucraniano.

No soporta: generacion de texto, razonamiento multi-paso, tool calling o function calling, uso como agente, vision, audio ni modo de pensamiento. No es un modelo conversacional ni instruct.

## Casos de uso

- Anotacion automatica de corpus ucranianos con sentidos: el modelo asigna un vector a cada aparicion de una palabra; comparando ese vector con el centroide de cada sentido de un inventario (por ejemplo, un WordNet ucraniano) se puede etiquetar el sentido de forma semi-automatica y reducir el coste de anotacion manual.
- Recuperacion de informacion sensible al sentido: en un buscador sobre documentacion tecnica en ucraniano, indexar embeddings a nivel de palabra permite distinguir consultas ambiguas ("banco" financiero frente a "banco" de asiento) y ordenar resultados por el sentido correcto.
- Deduplicacion y filtrado de corpus de entrenamiento: agrupando apariciones por similitud de embedding se detectan near-duplicates y se puede construir un curriculum de datos mas limpio para entrenar otros modelos en ucraniano.
- Preprocesado para traduccion automatica: desambiguar el sentido de terminos polisemicos antes de enviarlos a un sistema de traduccion reduce errores de seleccion lexica en pares ucraniano-ingles o ucraniano-espanol.
- Evaluacion comparativa de sistemas WSD: al estar fijadas las semillas y el fichero de entrenamiento, sirve como punto de referencia reproducible en experimentos academicos sobre desambiguacion en lenguas eslavas.
- Clasificacion y enrutado de intenciones en asistentes en ucraniano: los embeddings pueden alimentar un clasificador ligero (regresion logistica, SVM) para dirigir consultas a distintas colas sin desplegar un LLM.
- Analisis de similitud lexica en lexicografia: construir mapas de vecinos semanticos por lema para revisar definiciones, detectar sentidos infrautilizados o proponer nuevas acepciones en un diccionario.
- Recuperacion aumentada (RAG) en corpus ucranianos: como encoder de frases para indexar y recuperar pasajes, especialmente si el dominio tiene vocabulario polisemico especializado.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la model card del autor:

| Metrica | Resultado |
|---|---|
| WSD accuracy | 0,9356780735107731 |
| STS Pearson | 0,8017930036398038 |
| STS Spearman | 0,7916828512149507 |
| MTEB (resto de tareas) | resultados completos en `evaluation/mteb_results/` del repositorio, no incluidos en la informacion disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de generacion, algo esperable al tratarse de un modelo de embeddings y no de un modelo de lenguaje generativo. Tampoco se dispone de comparaciones directas con otros sistemas WSD ucranianos.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 1,11 GB en disco y en memoria (278 M de parametros x 4 bytes), coherente con el tamano de repo de 1,1 GB.
- VRAM estimada para inferencia: 2-3 GB en FP32 con lotes moderados; alrededor de 0,6-1 GB en FP16; en torno a 0,3-0,6 GB en int8, aunque no se publican pesos cuantizados y habria que generarlos.
- GPU recomendadas: practicamente cualquier GPU con 4 GB o mas de VRAM. Funciona en RTX 3050, RTX 3060, RTX 4060, GTX 1660, T4, L4. En A100 o H100 se puede ejecutar con lotes muy grandes, aunque el modelo es demasiado pequeno para aprovechar estas GPU en solitario.
- Cabe en GPU de consumo: si, sin recortes, en la mayoria de tarjetas actuales e incluso en iGPU con memoria compartida.
- CPU: viable para inferencia por lotes pequenos; 12 capas y 278 M de parametros son manejables con ONNX Runtime o PyTorch en un servidor sin GPU.
- Opciones de despliegue: `sentence-transformers`, `transformers`, ONNX Runtime / Optimum para exportacion, Text Embeddings Inference (TEI) o Triton para servir embeddings, y FastAPI con batching propio. No hay pesos GGUF, por lo que llama.cpp u Ollama no son aplicables tal cual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Orientacion | Resultados en la info disponible |
|---|---|---|---|---|---|
| Este modelo (ucu-wsd seed-456) | 278 M | no disponible | no disponible | Embeddings + WSD ucraniano | WSD 0,9357; STS Pearson 0,8018 |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | 278 M | 128 tokens en la configuracion habitual de sentence-transformers | Apache-2.0 | Embeddings multilingues genericos | no disponibles aqui; es el modelo base sin ajustar |
| intfloat/multilingual-e5-base | 278 M aprox. | 512 tokens | MIT | Embeddings multilingues para recuperacion | no disponibles aqui |
| BAAI/bge-m3 | 568 M aprox. | 8192 tokens | MIT | Embeddings multilingues densos, dispersos y multi-vector | no disponibles aqui |
| LaBSE | 471 M aprox. | 512 tokens | Apache-2.0 | Embeddings multilingues para similitud de frases | no disponibles aqui |

Nota: los datos de los modelos comparativos no provienen de la informacion proporcionada y deben verificarse en sus respectivas model cards. La comparacion relevante es con `paraphrase-multilingual-mpnet-base-v2`: el checkpoint aqui descrito solo se justifica si el ajuste WSD aporta una mejora medible en esa tarea concreta, algo que la informacion no permite contrastar porque no se incluyen las cifras del modelo base en el mismo test.

## Limitaciones y advertencias

- No es un modelo generativo: no redacta texto, no sigue instrucciones, no hace tool calling y no puede usarse como agente. Cualquier caso de uso que lo trate como LLM fracasara.
- Licencia no especificada: el repositorio no declara licencia. Para uso comercial hay que contactar con el autor y verificar ademas la licencia del modelo base (Apache-2.0) y de los datos de tripletas, cuyo origen no se detalla.
- Cero descargas y cero likes: es un artefacto de investigacion sin validacion externa, sin issues resueltos y sin comunidad que reporte comportamiento en produccion.
- La exactitud WSD de 0,9357 proviene exclusivamente de la model card del autor. No hay descripcion del conjunto de evaluacion, del inventario de sentidos ni del protocolo, por lo que la cifra no es comparable con otros sistemas WSD publicados.
- Dependencia del inventario de sentidos: un modelo de WSD no "conoce" los sentidos por si mismo; hay que aportar el conjunto de referencia (por ejemplo, un WordNet ucraniano) contra el que comparar los embeddings.
- Riesgo de sesgo de dominio: los tripletas provienen de un unico CSV (`triplets_generation_stochastic_combination.csv`) sin composicion documentada. El rendimiento fuera de ese dominio, o en ucraniano coloquial, dialectal o de redes sociales, no esta caracterizado.
- Longitud de contexto no publicada: si el ajuste mantiene la configuracion habitual de sentence-transformers (128 tokens), las frases largas se truncaran y la desambiguacion perdera contexto.
- Idiomas: aunque la base sea multilingue, el ajuste esta orientado a ucraniano. Su uso en castellano u otras lenguas no esta validado y probablemente degrade el rendimiento respecto al modelo base.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe el riesgo de asignar un sentido incorrecto con alta confianza cuando el contexto es corto o ambiguo.
- Nombre de checkpoint: `seed-456` implica que existen otras ejecuciones con semillas distintas. Comparar resultados entre checkpoints sin conocer el split de validacion puede inducir conclusiones erroneas por varianza de semilla.
- Fecha de creacion declarada (2026-09-21): conviene verificar la vigencia real del repositorio antes de integrarlo en un pipeline.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: solo paginas de soporte de Microsoft sin relacion con el artefacto. No hay papers, blogs ni demos asociados localizables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuriilaba/ucu-wsd-generation_stochastic_pt-true_seed-456
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Arquitectura subyacente (XLM-RoBERTa): https://huggingface.co/FacebookAI/xlm-roberta-base
- Leaderboard de MTEB: https://huggingface.co/spaces/mteb/leaderboard
- Resultados MTEB del modelo: carpeta `evaluation/mteb_results/` dentro del repositorio de HuggingFace (no enlazada directamente en la informacion disponible)
- Paper, blog o repositorio adicionales: no disponibles; la busqueda web no devolvio resultados relacionados con el modelo.
