# wearesb/test-deploy-dify

## Resumen

`wearesb/test-deploy-dify` es un repositorio de HuggingFace que aloja un modelo de embeddings de frases (sentence-transformers) derivado de la familia vietnamese-bi-encoder desarrollada por bkai-foundation-models. El modelo transforma frases y parrafos en vectores densos de 768 dimensiones, pensados para tareas de similitud semantica, clustering y busqueda semantica en vietnamita. Internamente emplea un backbone PhoBERT-base-v2 (arquitectura RoBERTa) con una capa de pooling de media (mean pooling) sobre las representaciones contextuales.

El repositorio se presenta como un despliegue de prueba ("test-deploy-dify"), con cero descargas y cero likes en el momento de la consulta, y un tamano de repo de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el contenido es minimo. La model card incluida corresponde al modelo original `bkai-foundation-models/vietnamese-bi-encoder`, no a una variante propia, por lo que la informacion tecnica disponible describe ese modelo base.

Su relevancia radica en ser un encoder bi-direccional especializado en vietnamita, un idioma con relativamente pocos recursos en el ecosistema de embeddings, y en su rendimiento documentado sobre el conjunto de recuperacion legal del reto Zalo 2021. No obstante, al tratarse de un repositorio de prueba con metadatos incompletos, debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa / PhoBERT-base-v2) + pooling de media |
| Parametros totales | no disponible (PhoBERT-base-v2 tiene ~135M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (max_seq_length) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, pytorch |
| Dimension del embedding | 768 |
| Funcion de pooling | mean tokens (con atencion a la mascara) |
| Libreria | sentence-transformers / transformers |
| Pipeline | sentence-similarity, feature-extraction |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clasica de sentence-transformers: un encoder Transformer (RobertaModel, concretamente PhoBERT-base-v2 como backbone) seguido de una capa de pooling que promedia los embeddings de tokens ponderando por la mascara de atencion. La longitud maxima de secuencia es de 256 tokens y la dimension de salida es 768. El tokenizador requiere segmentacion de palabras previa en vietnamita (por ejemplo con pyvi, underthesea o RDRSegment), salvo en el widget de HuggingFace, que incorpora un segmentador personalizado.

El entrenamiento descrito en la model card se realizo sobre un dataset combinado: MS MARCO traducido al vietnamita, SQuAD v2 traducido al vietnamita y el 80% del conjunto de entrenamiento del reto Legal Text Retrieval Zalo 2021. Se empleo la perdida `MultipleNegativesRankingLoss` (escala 20.0, similitud coseno), optimizador AdamW con learning rate 2e-05, scheduler WarmupLinear con 1000 pasos de calentamiento, weight decay 0.01, 15 epocas y batch size 32 sobre un DataLoader de 17.584 pasos. No se menciona uso de RLHF ni DPO, algo esperable en un modelo de embeddings.

## Capacidades

- Generacion de embeddings de frases y parrafos en vietnamita (vectores de 768 dimensiones).
- Similitud semantica entre pares de frases (pipeline sentence-similarity).
- Extraccion de caracteristicas (feature-extraction) para downstream tasks.
- Busqueda semantica y recuperacion de documentos (retrieval) en vietnamita.
- Clustering de textos por similitud coseno.
- Deteccion de duplicados y near-duplicates textuales.
- Soporte de segmentacion de palabras integrada en el widget de HuggingFace.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un encoder.

## Casos de uso

- Busqueda semantica en corpus legales vietnamitas: el modelo fue entrenado con datos del reto Zalo 2021 y alcanza un MRR@10 de 80.73 en el split de validacion, lo que lo hace adecuado para recuperar articulos y clausulas relevantes a partir de consultas en lenguaje natural.
- Sistemas de preguntas y respuestas (QA) sobre documentacion: combinado con un indice vectorial (FAISS, Qdrant, Milvus) permite recuperar pasajes candidatos antes de pasarlos a un modelo generativo, mejorando la precision del RAG en vietnamita.
- Deduplicacion de registros en bases de datos: calcular embeddings de titulos o descripciones y agrupar por umbral de similitud coseno para detectar entradas repetidas.
- Clasificacion y clustering de tickets de soporte: agrupar incidencias por tematica sin etiquetas previas usando k-means sobre los embeddings generados.
- Moderacion de contenido y deteccion de parafrasis: comparar mensajes de usuarios contra una lista de referencia para identificar reformulaciones de contenido prohibido.
- Construccion de motores de recomendacion de articulos: indexar el corpus y recuperar los documentos mas cercanos al historial de lectura del usuario mediante similitud vectorial.
- Enrutamiento de intenciones en asistentes conversacionales: mapear la consulta del usuario al embedding de una intencion predefinida y seleccionar el flujo adecuado.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el 20% restante del conjunto de entrenamiento del reto Legal Text Retrieval Zalo 2021:

| Modelo | Datos de entrenamiento | Acc@1 | Acc@10 | Acc@100 | Pre@10 | MRR@10 |
|---|---|---|---|---|---|---|
| Vietnamese-SBERT | - | 32.34 | 52.97 | 89.84 | 7.05 | 45.30 |
| PhoBERT-base-v2 | MS MARCO | 47.81 | 77.19 | 92.34 | 7.72 | 58.37 |
| PhoBERT-base-v2 | MS MARCO + SQuADv2 + 80% Zalo | 73.28 | 93.59 | 98.85 | 9.36 | 80.73 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, algo coherente con la naturaleza de encoder del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para un encoder de ~135M de parametros con secuencias de 256 tokens; en fp16 aproximadamente 300-500 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona bien en T4, L4, RTX 3060, RTX 4090, A10, A100.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650 o superiores, e incluso puede ejecutarse en CPU con latencias aceptables para lotes pequenos.
- Opciones de despliegue: sentence-transformers (nativo), HuggingFace Transformers con pooling manual, Text Embeddings Inference (TEI) de HuggingFace, FastAPI con batching, ONNX Runtime para aceleracion en CPU.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen en gran medida del hardware y del tamano de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Rendimiento (MRR@10 Zalo) |
|---|---|---|---|---|---|
| wearesb/test-deploy-dify (base: vietnamese-bi-encoder) | ~135M (no confirmado) | 256 | vi | apache-2.0 | 80.73 |
| keepitreal/vietnamese-sbert | no disponible | no disponible | vi | no disponible | 45.30 |
| PhoBERT-base-v2 (sin fine-tuning de retrieval) | ~135M | 256 | vi | no disponible | 58.37 (solo MS MARCO) |
| bkai-foundation-models/vietnamese-bi-encoder (original) | ~135M | 256 | vi | apache-2.0 | 80.73 |

## Limitaciones y advertencias

- El repositorio es un despliegue de prueba ("test-deploy-dify") con 0 descargas, 0 likes y tamano de 0.0 GB: los pesos pueden no estar disponibles o ser identicos al modelo original; verificar antes de usar en produccion.
- La model card incluida es la del modelo `bkai-foundation-models/vietnamese-bi-encoder`, no una descripcion propia del repositorio, lo que genera ambiguedad sobre el contenido real alojado.
- El modelo solo soporta vietnamita; su rendimiento en otros idiomas, incluido el castellano, no esta documentado y previsiblemente sera pobre.
- Requiere segmentacion de palabras en vietnamita para un uso optimo fuera del widget de HuggingFace; omitirla degrada la calidad de los embeddings.
- Longitud de contexto limitada a 256 tokens: los textos mas largos se truncan, lo que puede perder informacion relevante en documentos extensos.
- Riesgo de sesgos heredados de los corpus de entrenamiento (MS MARCO, SQuAD v2 y datos legales vietnamitas), no evaluado en la informacion disponible.
- No es un modelo generativo: no puede producir texto, razonar ni ejecutar tool calling; su uso esta restringido a representaciones vectoriales.
- Aunque la licencia es apache-2.0, conviene revisar las condiciones del modelo base PhoBERT y de los datasets traducidos por posibles restricciones adicionales.
- No se han publicado evaluaciones de robustez, sesgo o seguridad en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wearesb/test-deploy-dify
- Modelo base referenciado en la model card: https://huggingface.co/bkai-foundation-models/vietnamese-bi-encoder
- Repositorio PhoBERT (VinAIResearch): https://github.com/VinAIResearch/PhoBERT
- Documentacion de sentence-transformers: https://www.SBERT.net
- Modelo comparativo Vietnamese-SBERT: https://huggingface.co/keepitreal/vietnamese-sbert
- Paper citado en la model card (referencia arXiv 2403.01616): https://arxiv.org/abs/2403.01616
