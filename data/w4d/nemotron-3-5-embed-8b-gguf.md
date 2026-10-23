# W4D/Nemotron-3.5-Embed-8B-GGUF

## Resumen

Nemotron-3.5-Embed-8B es un modelo de embeddings multimodales (texto e imagen de documento) desarrollado por NVIDIA. Este repositorio concreto, publicado por el usuario W4D, no contiene los pesos originales, sino conversiones a formato GGUF del modelo base `nvidia/Nemotron-3.5-Embed-8B-BF16`, realizadas con llama.cpp en el commit `19ab5a5` (22 de octubre de 2026) y cuantizadas con `llama-quantize`. Su función es producir representaciones vectoriales densas de 4096 dimensiones, normalizadas en L2, con pooling de media, para tareas de recuperación, búsqueda semántica y RAG.

El modelo resuelve el problema de la recuperación de información en entornos multilingües y con documentos que combinan texto e imagen: al compartir espacio de embeddings entre modalidades, permite indexar y consultar corpus heterogéneos con una sola métrica de similitud. La ventana de contexto es de 32.768 tokens, lo que permite embeber pasajes largos sin troceado agresivo, y cubre 33 idiomas, entre ellos el español.

Su relevancia práctica radica en que las conversiones GGUF habilitan el despliegue en `llama-server` con CPU o GPU de consumo, algo impracticable con los pesos BF16 originales de 15 GB. Conviene señalar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que su tamaño total (185,8 GB) se debe a que redistribuye todas las variantes de cuantización, desde Q1_0 hasta F32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings con encoder de vision Pixtral y proyector (clases `Mistral3EmbedNemotronModel` / `Mistral3EmbeddingVisionModel` en llama.cpp) |
| Parametros totales | 7.952.683.008 (7,95 B) segun safetensors; la model card del conversor indica 8,38 B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Dimension del embedding | 4096, normalizado en L2, pooling de media integrado en los metadatos del GGUF |
| Tipos de cuantizacion | BF16, F16, F32, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q5_1, Q4_K_M, Q4_K_S, Q4_0, Q4_1, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_M, IQ3_S, IQ3_XS, IQ3_XXS, Q2_K, Q2_K_S, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, TQ1_0, TQ2_0, IQ1_M, IQ1_S, Q1_0, Q2_0; mas `mmproj-BF16` (827 MB) para vision |
| Idiomas soportados | 33: en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi |
| Licencia | OpenMDW License 1.1 (etiquetada como `other` / `license_name: openmdw-1.1`) |
| Formato de pesos | GGUF (un archivo por cuantizacion, mas `mmproj` separado y `imatrix-wikitext-2.gguf` de calibracion) |
| Pipeline en HuggingFace | visual-document-retrieval |
| Modelo base | nvidia/Nemotron-3.5-Embed-8B-BF16 |
| Tamano del repositorio | 185,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder orientado a extraccion de caracteristicas (`feature-extraction`), con pooling de media como estrategia de agregacion de tokens. Para la parte visual incorpora un encoder Pixtral seguido de un proyector que alinea las representaciones de imagen de documento con el espacio de texto; ambos se distribuyen en un GGUF independiente (`mmproj-BF16`, 827 MB) que solo es necesario si se van a procesar imagenes. El resultado es un unico vector de 4096 dimensiones, normalizado en L2, valido tanto para texto como para imagenes de documentos.

El modelo emplea un formato de prompt asimetrico heredado del modelo original: el prefijo `query:` para consultas y `passage:` para documentos. Este detalle es funcionalmente obligatorio para obtener una recuperacion correcta; omitirlo degrada la calidad de los embeddings. Las cuantizaciones inferiores a Q4 se generaron con una importance matrix calculada sobre `wikitext-2-raw` (200 fragmentos de 512 tokens, sobre el maestro BF16), y el archivo `imatrix-wikitext-2.gguf` se incluye para reproducibilidad.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF/DPO o ajuste contrastivo especifico. La model card del conversor remite al repositorio original de NVIDIA para esos detalles.

## Capacidades

- Generacion de embeddings de texto de 4096 dimensiones, normalizados en L2, con pooling de media.
- Generacion de embeddings de imagen de documento mediante el encoder Pixtral y el proyector incluidos en `mmproj-BF16`.
- Recuperacion multimodal en un espacio vectorial compartido entre texto e imagen (documentos escaneados, formularios, paginas).
- Cobertura multilingue de 33 idiomas, con capacidad de similitud cross-lingual.
- Contexto de hasta 32.768 tokens por documento, adecuado para pasajes largos o fichas tecnicas completas.
- Soporte de busqueda semantica, indexacion vectorial y recuperacion densa para pipelines RAG.
- Servible mediante la API compatible con OpenAI `/v1/embeddings` de `llama-server`.
- No es un modelo generativo: no produce texto, no soporta tool calling ni flujos de agente multi-paso. Cualquier caso de uso que requiera generacion necesita emparejarlo con un LLM aparte.

## Casos de uso

- RAG sobre documentacion tecnica interna: indexar manuales, RFCs y articulos con prefijo `passage:` y consultar con `query:`; los 32.768 tokens de contexto permiten embeber secciones completas sin fragmentar en trozos de 512 tokens, lo que reduce la perdida de coherencia en la recuperacion.
- Busqueda semantica multilingue en catalogo de producto: un usuario consulta en espanol y recupera fichas en aleman, japones o arabe gracias al espacio de embeddings compartido entre los 33 idiomas soportados.
- Recuperacion de documentos visuales: facturas, albaranes o formularios escaneados se embeben con el encoder Pixtral y se recuperan por similitud frente a consultas textuales. Requiere usar los pesos originales via transformers, porque llama.cpp aun no acepta entrada de imagen en su endpoint de embeddings.
- Deduplicacion y clustering de corpus: calcular similitud coseno por pares sobre los embeddings L2-normalizados para detectar near-duplicates en un dataset de entrenamiento o agrupar tickets de soporte por tematica.
- Motor de recomendacion por similitud semantica: embeber descripciones de articulos y el historial de lectura del usuario, y ordenar candidatos por producto escalar; la normalizacion L2 hace que la metrica sea directamente coseno.
- Filtrado y enrutado previo a un LLM: clasificar consultas entrantes comparandolas contra un conjunto de embeddings de referencia (por ejemplo, "facturacion", "soporte tecnico", "bajas") antes de invocar un modelo generativo, reduciendo coste por token.
- Evaluacion de calidad de traduccion: medir similitud cross-lingual entre original y traduccion en el espacio 4096-d como metrica complementaria a BLEU o COMET.
- Construccion de bases de conocimiento para asistentes de soporte: indexar articulos de ayuda y resolver consultas multi-turno recuperando el pasaje mas relevante en cada turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del conversor no incluye metricas de recuperacion (nDCG, Recall@k, MTEB u otras) y remite explicitamente al repositorio del modelo original de NVIDIA para consultar benchmarks. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para los pesos (sin contar activaciones ni cache de contexto):
  - BF16 / F16: 15.177 MB (~15,2 GB); F32: 30.345 MB.
  - Q8_0: 8.067 MB; Q6_K: 6.230 MB; Q5_K_M: 5.426 MB; Q5_K_S: 5.291 MB.
  - Q4_K_M: 4.670 MB; Q4_K_S: 4.437 MB; IQ4_XS: 4.242 MB; Q3_K_M: 3.826 MB; Q2_K: 3.030 MB.
  - Vision: anadir 827 MB del `mmproj-BF16` cuando se procesen imagenes.
- GPU recomendadas: A100 40/80 GB o H100 para BF16 y para servir con lotes grandes a 32k de contexto; RTX 4090 (24 GB) para Q8_0 con margen; RTX 4080 / 4070 Ti Super (16 GB) para Q8_0 justo o Q6_K holgado.
- Cabe en GPU de consumo: si. Q4_K_M (4,7 GB) entra en GPUs de 8 GB como la RTX 4060 Ti 8 GB o la RTX 3070; Q6_K y Q8_0 requieren 12-16 GB.
- Despliegue: `llama-server` de llama.cpp con el flag `--embeddings` (el pooling ya esta en los metadatos, no hace falta `--pooling`); tambien es importable en Ollama y LM Studio al ser GGUF. Las herramientas que esperan safetensors (por ejemplo, Text Embeddings Inference) no consumen directamente este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, el coste escala con la longitud del pasaje hasta 32.768 tokens y con el tamano de lote; conviene medir con el corpus real antes de dimensionar.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Embed-8B-GGUF (este) | 7,95 B (8,38 B segun model card) | 4096 | 32.768 | 33 | OpenMDW 1.1 | GGUF |
| Nemotron-3.5-Embed-1B-GGUF (W4D) | ~1 B | 2048 | no disponible | no disponible | OpenMDW 1.1 (presumiblemente, no confirmado) | GGUF |

No se dispone en la informacion proporcionada de datos verificados de otros modelos comparables de la misma categoria (por ejemplo, embeddings multilingues de ~8 B de otros proveedores), por lo que no se incluyen en la tabla para no aportar cifras sin respaldo. El hermano de 1 B comparte espacio de embeddings de texto con este modelo segun la model card, lo que permitiria usarlo para indexacion masiva barata y reservar el 8 B para consultas o re-ranking.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas ni produce texto. Cualquier uso conversacional exige un LLM adicional.
- La calidad de recuperacion es muy sensible a la cuantizacion. La propia model card advierte que Q8_0, Q6_K y Q5_K_M son los niveles recomendados y que las variantes IQ1/IQ2/TQ/Q1/Q2 degradan de forma medible la recuperacion; no deberian usarse en produccion.
- El soporte de imagenes esta incompleto en llama.cpp: el archivo `mmproj` se carga, pero el endpoint de embeddings no acepta entrada de imagen para esta arquitectura todavia. El uso multimodal requiere los pesos originales en transformers.
- El formato de prefijos `query:` y `passage:` es obligatorio; indexar sin el prefijo correcto produce embeddings en una distribucion distinta y penaliza la recuperacion.
- La licencia OpenMDW 1.1 esta etiquetada como `other` en HuggingFace y no se detallan en la informacion disponible las condiciones exactas de uso comercial; es necesario revisar el texto de la licencia antes de desplegar en producto.
- Al ser una conversion de terceros (usuario W4D, no NVIDIA), no hay garantia de soporte, mantenimiento ni equivalencia numerica exacta con los pesos originales. El repositorio tenia 0 descargas y 0 likes en el momento de la consulta.
- No hay datos publicados de benchmarks, sesgos o evaluaciones de robustez en la informacion disponible; la calidad en dominios especializados (legal, medico, jerga tecnica) debe validarse con un conjunto propio.
- El contexto maximo es de 32.768 tokens; pasajes mas largos requieren troceado, lo que puede fragmentar tablas o referencias cruzadas dentro de un documento.
- En los metadatos YAML del modelo, el codigo de idioma noruego aparece como `no`, que algunos parsers interpretan como booleano `false`; conviene normalizarlo si se consume programaticamente la lista de idiomas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/W4D/Nemotron-3.5-Embed-8B-GGUF
- Modelo base original: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Hermano de 1 B en GGUF: https://huggingface.co/W4D/Nemotron-3.5-Embed-1B-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp (commit de referencia `19ab5a5`)
