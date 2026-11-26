# ue2627-ir-gir/medir-rag-bi-encoder-lora

## Resumen

medir-rag-bi-encoder-lora es un adaptador LoRA para recuperación densa (bi-encoder) construido sobre BAAI/bge-small-en-v1.5, un transformer encoder de aproximadamente 33 millones de parámetros con representaciones de 384 dimensiones. Lo desarrolla el proyecto MedIR-RAG de la Universidade de Évora en el marco de la asignatura Recuperação de Informação em Bases de Texto, y está entrenado sobre pares pregunta/pasaje del corpus BioASQ, orientado a búsqueda semántica en literatura biomédica.

El modelo no es un generador de texto: es un componente de recuperación que transforma preguntas y pasajes en vectores densos comparables mediante similitud coseno. Su relevancia práctica radica en que se publica junto con resultados medidos sobre el corpus completo de PubMed (39.958.371 documentos) y 279 preguntas de test de BioASQ, lo que permite evaluar su utilidad real en un escenario de recuperación a gran escala y en combinación con BM25 mediante fusión RRF.

Al ser un adaptador PEFT sobre un modelo base pequeño y en inglés, su interés es acotado: sirve como pieza de un pipeline RAG biomédico o como referencia metodológica de ajuste fino de recuperadores densos con recursos limitados. No hay información publicada sobre licencia, idiomas soportados ni pipeline de uso en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (bi-encoder denso) con adaptador LoRA sobre BAAI/bge-small-en-v1.5 |
| Parametros totales | Modelo base de aproximadamente 33 M (bge-small-en-v1.5); parametros del adaptador LoRA no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base bge-small-en-v1.5 admite 512 tokens) |
| Tipos de cuantizacion | No disponible; al ser un adaptador LoRA en safetensors, se puede fusionar con el modelo base y cuantizar este ultimo |
| Idiomas soportados | No disponible en la model card; el modelo base esta orientado a ingles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre bge-small-en-v1.5, un encoder tipo BERT de 12 capas y 384 dimensiones de embedding, especializado en recuperación densa. El ajuste se realiza con LoRA (Low-Rank Adaptation) sobre los módulos de atención del encoder, manteniendo congelados los pesos originales y añadiendo matrices de bajo rango entrenables. La integración se hace vía PEFT y sentence-transformers, con `merge_and_unload()` para fusionar el adaptador en el modelo base antes de la codificación.

El entrenamiento utiliza pares pregunta/pasaje de BioASQ, el conjunto de referencia para búsqueda de respuestas biomédicas. El código de entrenamiento se referencia como `train_bi_encoder.py` en el repositorio del proyecto, aunque no se detallan en la model card el número de tokens, la composición exacta del dataset, la función de pérdida ni si hubo etapas de minería de negativos duros. Tampoco se documenta el uso de RLHF, DPO u otras técnicas de alineación, algo esperable en un modelo de recuperación y no de generación.

## Capacidades

- Generación de embeddings densos para preguntas y pasajes, con normalización L2 opcional (`normalize_embeddings=True`).
- Recuperación semántica (dense retrieval) sobre corpus biomédicos, orientada a preguntas de BioASQ.
- Integración con búsqueda híbrida: los resultados publicados combinan el recuperador denso con BM25 mediante Reciprocal Rank Fusion (RRF).
- Uso como componente de un pipeline RAG: codifica consultas y fragmentos de documentos para selección de contexto.
- Compatible con sentence-transformers y PEFT, lo que facilita su carga y fusión con el modelo base.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito; no es un modelo generativo.
- Capacidades multilingües: no documentadas; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Búsqueda semántica en PubMed a escala: el adaptador está evaluado sobre el corpus completo de 39.958.371 documentos, por lo que es adecuado para indexar y recuperar pasajes relevantes ante preguntas biomédicas en un motor de búsqueda interno.
- Pipeline RAG biomédico: se usa como recuperador de primera etapa que selecciona pasajes de literatura científica antes de pasarlos a un LLM generador, reduciendo el contexto irrelevante y el coste de inferencia.
- Búsqueda híbrida en producción: combinado con BM25 mediante RRF, los resultados publicados suben de NDCG@5 0,1871 a 0,4613, lo que lo hace útil como componente denso dentro de un sistema híbrido ya existente.
- Asistencia a revisión sistemática: recuperación de evidencia científica para preguntas clínicas concretas, con el recuperador denso priorizando coincidencias semánticas frente a coincidencias léxicas.
- Enrutamiento de consultas en asistentes clínicos: clasificación y recuperación de documentos relevantes a partir de preguntas de usuarios en lenguaje natural, usando los embeddings como señal de similitud.
- Referencia metodológica y docencia: al ser un adaptador LoRA pequeño sobre un encoder de 33 M de parámetros, sirve como ejemplo reproducible de ajuste fino de recuperadores densos con recursos de cómputo modestos.
- Experimentación con recuperación a bajo coste: al caber holgadamente en GPU de consumo, permite iterar sobre pipelines de evaluación de recuperación sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el corpus completo de PubMed (39.958.371 documentos) y 279 preguntas de test de BioASQ:

| Metrica | Solo el adaptador | Hibrido con BM25 (RRF) |
|---|---|---|
| NDCG@5 | 0,1871 | 0,4613 |
| MRR@10 | 0,2795 | 0,6482 |

No se han publicado en la informacion disponible resultados comparativos con otros recuperadores (por ejemplo, el propio bge-small-en-v1.5 sin ajustar, BM25 aislado u otros modelos densos), ni métricas sobre MMLU, HumanEval o GSM8K, que no aplican a un modelo de recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. El modelo base tiene aproximadamente 33 M de parámetros (unos 130 MB en fp32, unos 66 MB en fp16); el adaptador LoRA añade un tamaño marginal.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; también funciona en CPU para volúmenes moderados de codificación.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en iGPU o CPU para lotes pequeños.
- Opciones de despliegue: sentence-transformers con PEFT para cargar y fusionar el adaptador; exportación a ONNX o TensorRT para servir a escala; integración en frameworks de búsqueda vectorial (FAISS, Qdrant, Milvus) para indexación y consulta.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tratarse de un encoder de 33 M de parámetros, la latencia por lote es del orden de milisegundos en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medir-rag-bi-encoder-lora | ~33 M (base) + LoRA | No disponible | Recuperacion densa ajustada a BioASQ | No disponible | Hugging Face (adaptador PEFT) |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens | Recuperacion densa generalista en ingles | MIT (segun el modelo base) | Hugging Face |
| BM25 | No aplica | No aplica | Recuperacion lexica dispersa | No aplica | Multiples implementaciones |

La comparativa directa con el modelo base sin ajustar no puede establecerse porque la model card no publica esa linea base. Frente a BM25, los datos propios muestran que el recuperador denso aislado rinde por debajo en NDCG@5 y MRR@10, y que la combinacion híbrida mediante RRF es la que aporta la mejora sustancial. No se dispone de datos de otros recuperadores biomedicos (por ejemplo, adaptadores sobre PubMedBERT) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador de recuperación, no un modelo generativo: no produce respuestas, solo embeddings.
- Los resultados aislados son modestos (NDCG@5 0,1871; MRR@10 0,2795); el valor practico aparece principalmente en configuracion híbrida con BM25.
- Entrenado sobre BioASQ, un corpus biomédico en inglés; el dominio y el idioma quedan restringidos y el rendimiento fuera de ese ámbito no está documentado.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor o al repositorio del proyecto.
- No se documentan sesgos, tasas de alucinación (no aplica directamente) ni evaluaciones de robustez.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño reportado es de 0,0 GB, lo que sugiere que los pesos pueden no estar subidos o que la información del repo está incompleta; conviene verificar la disponibilidad real de los ficheros antes de integrarlo.
- La fecha de creación indicada (2026-11-26) es futura respecto a la información habitual de este tipo de fichas; conviene contrastarla con la del repositorio.
- No se detallan hiperparámetros de entrenamiento ni composición del dataset, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ue2627-ir-gir/medir-rag-bi-encoder-lora
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Proyecto MedIR-RAG (Universidade de Évora): no disponible como enlace en la informacion proporcionada
- Codigo de entrenamiento (`train_bi_encoder.py`): no disponible como enlace en la informacion proporcionada
- Paper o blog asociado: no disponible en la informacion proporcionada
