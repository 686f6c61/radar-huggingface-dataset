# v1ct0r00/bge-m3-onnx-int8

## Resumen

bge-m3-onnx-int8 es una conversión a ONNX con cuantización INT8 del modelo de embeddings BGE-M3, desarrollado originalmente por BAAI (Beijing Academy of Artificial Intelligence) y publicado en el repositorio FlagOpen/FlagEmbedding. El modelo original resuelve el problema de la recuperación de información multilingüe al unificar en un solo modelo tres funcionalidades de recuperación: dense retrieval, multi-vector retrieval (estilo ColBERT) y sparse retrieval (estilo BM25). Esta versión concreta, mantenida por el usuario v1ct0r00, empaqueta esos pesos en formato ONNX cuantizado a INT8 para reducir el tamaño y acelerar la inferencia en CPU y entornos de producción sin GPU dedicada.

La relevancia de esta variante radica en su formato: al estar en ONNX INT8, es compatible con Text Embeddings Inference (TEI) y con pipelines de sentence-transformers que acepten backend ONNX, lo que facilita el despliegue en servicios de búsqueda semántica y RAG con requisitos de latencia y memoria ajustados. El repositorio ocupa 0,6 GB, coherente con un modelo base de aproximadamente 568 millones de parámetros cuantizado a 8 bits.

Arquitectónicamente deriva de XLM-RoBERTa large, con una longitud de contexto extendida hasta 8192 tokens y una dimensión de embedding de 1024. Soporta más de 100 idiomas de trabajo y está pensado para sustituir pipelines híbridos tradicionales (embedding denso + BM25) por un único modelo que produce representaciones densas, dispersas y multi-vector en una sola pasada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large extendido, con cabeceras para dense, sparse y multi-vector) |
| Parametros totales | no disponible (el modelo base BGE-M3 ronda los 568 M; el dato exacto no se indica en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | INT8 (esta variante); el modelo original admite FP32, FP16 y otras cuantizaciones via ONNX/GGUF no documentadas aqui |
| Idiomas soportados | mas de 100 idiomas de trabajo (segun la model card del original) |
| Licencia | MIT |
| Formato de pesos | ONNX (cuantizado INT8); el original en safetensors/PyTorch |
| Dimension de embedding | 1024 |
| Tamano del repositorio | 0,6 GB |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento

El modelo base BGE-M3 parte de XLM-RoBERTa large, cuyo max_length se extendio a 8192 tokens y se preentreno adicionalmente con RetroMAE (variante bge-m3-retromae). Sobre esa base se aplico aprendizaje contrastivo multilingue (bge-m3-unsupervised) y finalmente un ajuste fino unificado que entrena simultaneamente las tres cabeceras de recuperacion: densa, dispersa y multi-vector (bge-m3 supervisado). Esta unificacion permite que una sola pasada del encoder genere los tres tipos de representacion, algo que en pipelines clasicos requiere modelos separados (por ejemplo, un bi-encoder para denso y BM25 para disperso).

El entrenamiento utiliza el dataset bge-m3-data, publicado por el equipo de BAAI, y se evalua sobre MLDR, un conjunto de recuperacion de documentos largos que cubre 13 idiomas. La model card del original no detalla el numero exacto de tokens de entrenamiento ni la composicion completa del corpus, por lo que esos datos deben considerarse no disponibles en la informacion proporcionada. La innovacion principal es la multitarea unificada: el mismo modelo produce embeddings densos de 1024 dimensiones, pesos dispersos por token (comparables a BM25) y representaciones multi-vector para reranking tardio. Esta variante ONNX INT8 no modifica la arquitectura, solo el formato y la precision numerica de los pesos.

## Capacidades

- Generacion de embeddings densos de 1024 dimensiones para busqueda semantica y similitud entre frases.
- Recuperacion dispersa (sparse retrieval): produce pesos por token similares a BM25 sin coste adicional respecto a la pasada densa.
- Recuperacion multi-vector (estilo ColBERT): representaciones por token utiles para reranking fino.
- Procesamiento de entradas de hasta 8192 tokens, desde frases cortas hasta documentos largos.
- Cobertura multilingue de mas de 100 idiomas de trabajo, incluyendo consultas y documentos en idiomas distintos (cross-lingual).
- Extraccion de caracteristicas (feature-extraction) para pipelines de sentence-transformers.
- Compatibilidad con Text Embeddings Inference (TEI) y con el tag endpoints_compatible de Hugging Face.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Busqueda semantica en produccion sobre CPU: al estar en ONNX INT8, se puede desplegar con TEI u ONNX Runtime sin GPU, manteniendo latencias aceptables para indices de millones de documentos.
- RAG hibrido sin infraestructura duplicada: un unico modelo genera embeddings densos y pesos dispersos, de modo que se puede combinar busqueda vectorial y busqueda lexica en Milvus o Vespa sin mantener un indice BM25 separado.
- Recuperacion multilingue cross-lingual: una consulta en castellano puede recuperar documentos en ingles, frances o aleman gracias a la cobertura de mas de 100 idiomas del modelo original.
- Chunking de documentos largos: con 8192 tokens de contexto se pueden indexar secciones extensas sin fragmentar en exceso, reduciendo la perdida de contexto en contratos, manuales o articulos cientificos.
- Reranking con representaciones multi-vector: la salida estilo ColBERT permite un segundo paso de puntuacion mas preciso sobre los candidatos recuperados en la primera fase.
- Deduplicacion y clustering de textos: los embeddings densos sirven para agrupar documentos similares, detectar duplicados en corpus grandes o construir sistemas de recomendacion de contenido.
- Clasificacion y similitud de pares de frases: el pipeline sentence-similarity permite puntuar pares de oraciones para tareas de matching, moderacion o evaluacion de respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta variante ONNX INT8 en la informacion disponible. La model card del autor remite a los resultados del modelo original BGE-M3, que incluyen evaluaciones en MIRACL (actualizadas en julio de 2024), MLDR y comparativas frente a modelos de OpenAI segun un benchmark de terceros citado en la propia model card. No se dispone de los valores numericos concretos en la informacion proporcionada, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada: al ser INT8 y de 0,6 GB en disco, la inferencia puede ejecutarse integramente en CPU con unos 1-2 GB de RAM para el modelo y los buffers de activacion, dependiendo del tamano de lote y de la longitud de secuencia.
- GPU recomendadas: no requiere GPU. En caso de usarla, cualquier GPU con 4 GB o mas de VRAM (RTX 3050, T4, L4) es suficiente para lotes moderados; A100 o H100 solo aportan ventaja en throughput masivo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, e incluso en Raspberry Pi o CPUs de servidor sin acelerador.
- Opciones de despliegue: Text Embeddings Inference (TEI) con backend ONNX, ONNX Runtime, sentence-transformers con backend ONNX, y servidores compatibles con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, la cuantizacion INT8 reduce el uso de memoria y suele acelerar la inferencia en CPU frente a FP32, pero no se aportan cifras medidas para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| bge-m3-onnx-int8 (esta ficha) | no disponible (~568 M) | 8192 | 1024 | >100 | MIT | ONNX INT8 |
| BAAI/bge-m3 | no disponible (~568 M) | 8192 | 1024 | >100 | MIT | safetensors/PyTorch |
| BAAI/bge-large-en-v1.5 | no disponible | 512 | 1024 | ingles | MIT | safetensors/PyTorch |
| BAAI/bge-base-en-v1.5 | no disponible | 512 | 768 | ingles | MIT | safetensors/PyTorch |

Frente a bge-m3 original, esta variante sacrifica precision numerica (INT8) a cambio de menor huella de memoria y despliegue sin GPU. Frente a bge-large-en-v1.5 y bge-base-en-v1.5, la diferencia clave es la cobertura multilingue y el contexto de 8192 tokens, ademas de las funcionalidades dispersa y multi-vector que los modelos v1.5 en ingles no ofrecen.

## Limitaciones y advertencias

- La cuantizacion INT8 puede introducir una degradacion leve en la calidad de los embeddings respecto al modelo original en FP32; no se han publicado evaluaciones que cuantifiquen esta perdida para esta variante concreta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; no hay evidencia de validacion por parte de la comunidad.
- No es un modelo generativo: no puede usarse para chat, razonamiento, codigo ni tool calling.
- Aunque la model card original declara mas de 100 idiomas, el rendimiento relativo por idioma no se detalla; en idiomas de bajos recursos la calidad puede ser inferior.
- La licencia MIT permite uso comercial, pero conviene verificar que la conversión ONNX mantiene la atribucion correcta al modelo original de BAAI.
- Riesgo de alucinacion no aplica en el sentido generativo, pero los embeddings pueden producir similitudes espurias en dominios muy especializados si no se ajusta el modelo.
- El contexto de 8192 tokens incrementa el coste computacional de la atencion; para documentos muy largos conviene evaluar el impacto en latencia antes de desplegar en produccion.

## Enlaces

- Repositorio Hugging Face de esta variante: https://huggingface.co/v1ct0r00/bge-m3-onnx-int8
- Modelo original BGE-M3: https://huggingface.co/BAAI/bge-m3
- Paper BGE-M3: https://arxiv.org/pdf/2402.03216.pdf
- Codigo FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Implementacion BGE-M3 en FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding/tree/master/FlagEmbedding/BGE_M3
- Dataset MLDR: https://huggingface.co/datasets/Shitao/MLDR
- Dataset de ajuste fino bge-m3-data: https://huggingface.co/datasets/Shitao/bge-m3-data
- Ejemplo de recuperacion hibrida en Milvus: https://github.com/milvus-io/pymilvus/blob/master/examples/hello_hybrid_sparse_dense.py
- Notebook de Vespa con modos multiples de BGE-M3: https://github.com/vespa-engine/pyvespa/blob/master/docs/sphinx/source/examples/mother-of-all-embedding-models-cloud.ipynb
- Paper RetroMAE: https://arxiv.org/abs/2106.14807
- Paper DPR: https://arxiv.org/abs/2004.04906
- Paper XLM-RoBERTa: https://arxiv.org/abs/2004.12832
- Paper ColBERT: https://arxiv.org/abs/2004.12832
- Repositorio RetroMAE: https://github.com/staoxiao/RetroMAE
- Ejemplo de ajuste fino unificado: https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/unified_finetune
- Dataset de reproduccion MIRACL actualizado: https://huggingface.co/datasets/hanhainebula/bge-m3_miracl_2cr
