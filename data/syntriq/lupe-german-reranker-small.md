# syntriq/lupe-german-reranker-small

## Resumen

Lupe German Reranker small es un cross-encoder de reranking especializado en consultas en aleman, desarrollado por Syntriq Labs. Su funcion es actuar como segunda etapa en pipelines de busqueda y RAG: recibe un par consulta-pasaje y devuelve una puntuacion de relevancia que permite reordenar los candidatos recuperados por un modelo de embeddings o por BM25. El modelo esta afinado a partir de Horizon-Labs/multilingual-reranker-small, una base ModernBERT de 141 millones de parametros, y se distribuye bajo licencia Apache-2.0.

La propuesta de valor es la destilacion de un reranker mucho mayor, Qwen3-Reranker-4B, en un modelo pequeno que mantiene un rendimiento competitivo en aleman. Segun la model card, alcanza un nDCG@10 medio de 0,860 en tres conjuntos de evaluacion alemanes publicos (MIRACL-de, GermanQuAD y GermanDPR), frente a 0,882 de BAAI/bge-reranker-v2-m3, que tiene cuatro veces mas parametros. Es relevante para equipos que despliegan RAG en aleman con restricciones de latencia o de VRAM y necesitan una etapa de reranking barata pero precisa.

El modelo esta entrenado para consultas en aleman (preguntas naturales, busquedas por palabras clave y preguntas en ingles sobre documentos alemanes). Su ventana de entrada llega hasta 8.192 tokens, aunque el entrenamiento se realizo sobre pasajes de unas 260 palabras, por lo que se recomienda trocear documentos largos antes de puntuarlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (base_model: Horizon-Labs/multilingual-reranker-small) |
| Parametros totales | 140.641.921 (141M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens de entrada; entrenado con pasajes de ~260 palabras |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | aleman (de) e ingles (en); el ingles solo como consulta sobre documentos alemanes |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: procesa conjuntamente la consulta y el pasaje y produce una puntuacion de relevancia, en lugar de generar embeddings independientes. Se parte de Horizon-Labs/multilingual-reranker-small, una base ModernBERT de 141M de parametros, y se afina con un objetivo de destilacion desde Qwen3-Reranker-4B. Cada par consulta-pasaje fue puntuado por el profesor y el estudiante aprende su ordenamiento mediante una perdida listwise (ListNet). Tras el entrenamiento se aplica una calibracion lineal para mapear las puntuaciones a la escala de logits del profesor.

Los datos de entrenamiento constan de 40.000 consultas muestreadas de un pool de 247.967: 50.121 preguntas reales de WebFAQ y 197.846 consultas sinteticas (preguntas, busquedas por palabras clave y preguntas en ingles) generadas por DeepSeek 4.1 Flash sobre pasajes de Wikipedia alemana, FineWeb-2, FinePDFs y documentos de negocio sinteticos. Los negativos duros se minaron con Snowflake/snowflake-arctic-embed-l-v2.0 (ocho de los rangos superiores, seis de los rangos 9 a 100 y uno aleatorio). El afinado se realizo en una NVIDIA H200, una epoca, learning rate 3e-05, bf16, con 8 consultas y 16 pasajes por paso. Se eliminaron articulos de Wikipedia cuyos titulos aparecen en GermanQuAD o GermanDPR, asi como pasajes que comparten dos secuencias de 8 palabras con pasajes de evaluacion, para evitar contaminacion.

## Capacidades

- Reranking de pasajes para consultas en aleman: preguntas naturales, busquedas por palabras clave y consultas en ingles sobre documentos alemanes.
- Puntuacion de relevancia consulta-pasaje mediante CrossEncoder de sentence-transformers (`model.rank`).
- Integracion como segunda etapa en pipelines RAG y de busqueda (recuperar 50-200 candidatos y reordenarlos).
- Manejo de entradas de hasta 8.192 tokens, aunque optimizado para pasajes de ~260 palabras.
- Compatible con text-embeddings-inference y endpoints de Hugging Face segun los tags del repositorio.
- No dispone de tool calling, generacion de texto, vision ni modos de razonamiento: es exclusivamente un modelo de ranking.

## Casos de uso

- RAG sobre documentacion interna en aleman: recuperar 50-200 fragmentos con un modelo de embeddings o BM25 y reordenarlos con este cross-encoder antes de pasarlos al LLM generador; su bajo coste (141M) permite hacerlo en cada consulta.
- Busqueda empresarial en portales de conocimiento: reordenar resultados de busquedas por palabras clave sobre manuales, politicas y PDFs, donde el entrenamiento con documentos de negocio sinteticos y FinePDFs resulta directamente aplicable.
- Atencion al cliente en aleman: mejorar la precision de las respuestas de un chatbot al seleccionar el pasaje mas relevante de una base de FAQ; el modelo fue entrenado con preguntas reales de WebFAQ.
- Busqueda en Wikipedia alemana: reordenar candidatos de MIRACL-de, conjunto en el que obtiene 0,723 de nDCG@10, para asistentes de consulta enciclopedica.
- Filtrado de contexto para modelos generativos: reducir el numero de tokens enviados al LLM descartando pasajes irrelevantes, lo que baja coste y alucinacion en sistemas RAG en produccion.
- Consultas en ingles sobre corpus alemanes: un analista angloparlante puede preguntar en ingles sobre documentos internos en aleman, ya que este tipo de consultas formo parte del entrenamiento.
- Evaluacion y monitorizacion de calidad de recuperacion: usar las puntuaciones calibradas para detectar consultas con baja confianza y derivarlas a revision humana.

## Benchmarks y rendimiento

nDCG@10 en conjuntos publicos de retrieval en aleman, segun la model card. MIRACL-de usa los candidatos de la tarea de reranking de MTEB; GermanQuAD y GermanDPR reordenan el top 100 de multilingual-e5-base. Ninguno de estos conjuntos se uso para entrenamiento ni seleccion de checkpoint.

| Modelo | Parametros | MIRACL-de | GermanQuAD | GermanDPR | Media |
|---|---|---|---|---|---|
| syntriq/lupe-german-reranker-small | 141M | 0,723 | 0,989 | 0,870 | 0,860 |
| BAAI/bge-reranker-v2-m3 | 568M | 0,780 | 0,989 | 0,877 | 0,882 |
| Horizon-Labs/multilingual-reranker-base | 308M | 0,763 | 0,989 | 0,872 | 0,875 |
| Horizon-Labs/multilingual-reranker-small | 141M | 0,717 | 0,986 | 0,856 | 0,853 |
| hindsight-ai/hs-rerank-1 | 114M | 0,674 | 0,984 | 0,810 | 0,823 |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 | 118M | 0,709 | 0,938 | 0,818 | 0,822 |
| cross-encoder/msmarco-MiniLM-L12-en-de-v1 | 118M | 0,678 | 0,919 | 0,799 | 0,798 |

## Requisitos de hardware

- VRAM estimada: en bf16, aproximadamente 0,3 GB de pesos (141M parametros); con overhead de activaciones y batch pequeno, cabe holgadamente en 1-2 GB. En fp32 serian unos 0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento se realizo en una NVIDIA H200, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU de consumo: si, en practicamente todas las RTX (3060, 4060, 4090) e incluso en CPU para volumenes moderados.
- Opciones de despliegue: sentence-transformers (CrossEncoder), text-embeddings-inference (segun tags del repositorio) y endpoints de Hugging Face. No se indica soporte explicito de vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media nDCG@10 (de) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| syntriq/lupe-german-reranker-small | 141M | 8.192 tokens | 0,860 | Apache-2.0 | Hugging Face |
| Horizon-Labs/multilingual-reranker-small | 141M | no disponible | 0,853 | Apache-2.0 (base) | Hugging Face |
| BAAI/bge-reranker-v2-m3 | 568M | no disponible | 0,882 | Apache-2.0 | Hugging Face |
| Horizon-Labs/multilingual-reranker-base | 308M | no disponible | 0,875 | Apache-2.0 (base) | Hugging Face |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 | 118M | no disponible | 0,822 | Apache-2.0 | Hugging Face |

La comparativa se limita a nDCG@10 en los tres conjuntos alemanes de la model card; no se dispone de datos de latencia ni de rendimiento en otros idiomas para el resto de modelos.

## Limitaciones y advertencias

- Entrenado especificamente para aleman; el ingles solo se cubre como consulta sobre documentos alemanes y no esta evaluado. Otros idiomas no se probaron.
- Aunque acepta hasta 8.192 tokens, el entrenamiento uso pasajes de ~260 palabras; documentos largos deben trocearse para obtener el mejor rendimiento.
- Riesgo de alucinacion no aplica directamente (no genera texto), pero las puntuaciones pueden ser poco fiables fuera de la distribucion de entrenamiento (dominios muy tecnicos, jerga, textos muy cortos).
- Sesgos: no se documentan analisis de sesgo; el corpus de entrenamiento (Wikipedia, FineWeb-2, FinePDFs, documentos sinteticos) puede introducir sesgos de dominio y de estilo.
- La calibracion lineal de las puntuaciones se ajusto a la escala de logits de Qwen3-Reranker-4B; los umbrales absolutos deben validarse en el dominio propio antes de usarse en produccion.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del profesor (ambos Apache-2.0 segun la model card).
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syntriq/lupe-german-reranker-small
- Modelo base: https://huggingface.co/Horizon-Labs/multilingual-reranker-small
- Profesor (Qwen3-Reranker-4B): https://huggingface.co/Qwen/Qwen3-Reranker-4B
- Modelo de minado de negativos: https://huggingface.co/Snowflake/snowflake-arctic-embed-l-v2.0
- Resultados (imagen): https://huggingface.co/syntriq/lupe-german-reranker-small/resolve/main/assets/results.png
