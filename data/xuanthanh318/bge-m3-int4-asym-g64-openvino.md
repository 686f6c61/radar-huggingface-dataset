# xuanthanh318/bge-m3-int4-asym-g64-openvino

## Resumen

El modelo `xuanthanh318/bge-m3-int4-asym-g64-openvino` es una versión comprimida localmente del conocido modelo de embeddings `BAAI/bge-m3`, optimizada para inferencia con OpenVINO. Su propósito es ofrecer una alternativa ligera y eficiente para tareas de retrieval denso (búsqueda semántica) en entornos con recursos limitados, manteniendo la funcionalidad principal del modelo original: generar representaciones vectoriales densas de 1024 dimensiones a partir de texto. La compresión se realizó mediante NNCF (Neural Network Compression Framework) con cuantización INT4 asimétrica (grupo de 64) y capas de backup en INT8, lo que reduce significativamente el tamaño del modelo (0.5 GB) frente al original.

Este modelo es relevante para desarrolladores que necesitan desplegar sistemas de búsqueda semántica o RAG en hardware de gama media, como GPUs integradas de Intel (Arc 140V) o CPUs, aprovechando la aceleración de OpenVINO. Al ser un derivado de BGE-M3, hereda la capacidad multilingüe del modelo base (más de 100 idiomas), aunque la model card no especifica explícitamente los idiomas soportados en esta versión comprimida. La licencia MIT permite uso comercial sin restricciones, lo que facilita su integración en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en XLM-RoBERTa (derivado de BAAI/bge-m3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | INT4 ASYM (grupo 64, ratio 1.0) con capas de backup en INT8 ASYM |
| Idiomas soportados | no disponible (el modelo base BGE-M3 soporta más de 100 idiomas) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (XML + binario) |

## Arquitectura y entrenamiento

El modelo es una compresión del encoder `BAAI/bge-m3`, un transformer basado en XLM-RoBERTa con 568 millones de parámetros (dato del modelo base, no confirmado para esta versión). BGE-M3 originalmente soporta tres modos de retrieval: denso, sparse y multi-vector (ColBERT). Sin embargo, esta versión comprimida expone únicamente la salida densa `sentence_embedding`, eliminando los modos sparse y ColBERT para simplificar la inferencia y reducir el tamaño.

El proceso de compresión se realizó con NNCF, aplicando cuantización INT4 asimétrica con tamaño de grupo 64 y ratio 1.0 (todas las capas cuantizadas). La estimación de escala se deshabilitó, y las capas de backup protegidas se mantuvieron en INT8 asimétrico para preservar la estabilidad numérica. El modelo no fue reentrenado; se trata de una conversión directa de los pesos originales. Los datos de entrenamiento del modelo base no se detallan en esta ficha, pero BGE-M3 fue entrenado con un corpus multilingüe extenso y técnicas de retrieval contrastivo.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para texto, normalizados por norma L2.
- Búsqueda semántica densa (retrieval) sobre documentos y consultas, adecuada para sistemas RAG.
- Soporte multilingüe: aunque no se confirma para esta versión, el modelo base BGE-M3 cubre más de 100 idiomas, por lo que es probable que esta compresión mantenga dicha capacidad.
- Manejo de secuencias largas de hasta 8192 tokens, permitiendo procesar documentos extensos.
- No soporta tool calling, generación de texto ni razonamiento multi-step, al ser exclusivamente un modelo de embeddings.
- No expone los modos sparse ni ColBERT del modelo original; solo retrieval denso.

## Casos de uso

- Búsqueda semántica en bases de conocimiento: indexar documentos y consultas con embeddings de 1024 dimensiones, y recuperar los más relevantes por similitud coseno. La ventana de 8192 tokens permite procesar artículos técnicos completos sin truncar.
- Sistemas RAG (Retrieval-Augmented Generation): integrar como componente de retrieval en pipelines de generación aumentada, donde el modelo denso recupera pasajes relevantes para alimentar a un LLM generativo.
- Clasificación de textos: usar los embeddings como características de entrada para clasificadores supervisados (regresión logística, SVM) en tareas como análisis de sentimiento o categorización de documentos.
- Deduplicación de contenido: comparar embeddings de documentos para detectar duplicados o casi duplicados en grandes corpus, gracias a la eficiencia de la cuantización INT4.
- Agrupamiento (clustering) de documentos: generar embeddings para agrupar textos por similitud temática, útil en organización de bibliotecas o análisis de encuestas.
- Motores de recomendación basados en contenido: calcular similitud entre ítems (productos, artículos) a partir de sus descripciones textuales, usando los embeddings como representación compacta.
- Búsqueda multilingüe: aprovechar la posible capacidad multilingüe del modelo base para consultas y documentos en diferentes idiomas, sin necesidad de modelos separados.

## Benchmarks y rendimiento

La model card reporta resultados en LoCoMo (English, dense retrieval) con OpenVINO 2026.3 sobre Intel Arc 140V GPU. No se proporcionan comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| nDCG@10 (macro avg) | 44.644% |
| Recall@10 (macro avg) | 59.425% |
| MRR@10 (macro avg) | 43.496% |
| Hit@10 (macro avg) | 68.601% |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- Tamaño del repo: 0.5 GB, lo que indica un footprint de memoria reducido gracias a la cuantización INT4.
- Probado en GPU integrada Intel Arc 140V con OpenVINO 2026.3, lo que sugiere que puede ejecutarse en GPUs con poca VRAM (al menos 1 GB libre).
- Compatible con CPU mediante OpenVINO (usar `"CPU"` en el dispositivo de compilación), sin necesidad de GPU dedicada.
- No se requieren GPUs de alta gama como A100 o H100; es adecuado para hardware consumer o edge.
- Opciones de despliegue: OpenVINO Runtime (Python, C++), integrable en servicios de inferencia como FastAPI o contenedores Docker. No es compatible directamente con vLLM, llama.cpp o Ollama, ya que estos no soportan el formato OpenVINO IR.
- Latencia y throughput no especificados en la informacion disponible; dependen del hardware y del lote de consultas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de embeddings cuantizados en la informacion proporcionada. Como referencia, el modelo original `BAAI/bge-m3` (sin cuantizar) ofrece mayor fidelidad en retrieval, pero requiere más memoria y cómputo. Esta versión comprimida sacrifica algo de rendimiento (según los benchmarks LoCoMo) a cambio de una inferencia más ligera. No se conocen alternativas equivalentes en formato OpenVINO con INT4 en la informacion disponible.

## Limitaciones y advertencias

- Solo expone el modo de retrieval denso; los modos sparse y multi-vector de BGE-M3 no están disponibles, lo que limita su uso en sistemas que requieran búsqueda híbrida.
- La cuantización INT4 puede degradar ligeramente la calidad de los embeddings en comparación con el modelo original, especialmente en dominios especializados o con vocabulario poco frecuente.
- No se especifican los idiomas soportados en esta versión, aunque el modelo base es multilingüe; se recomienda validar el comportamiento en los idiomas de interés.
- No hay información sobre sesgos o alucinaciones, ya que es un modelo de embeddings y no genera texto; sin embargo, los sesgos del modelo base pueden propagarse a los embeddings.
- La licencia MIT permite uso comercial sin restricciones, pero se debe mantener la atribución correspondiente al modelo original BAAI/bge-m3.
- Para producción, es necesario validar el rendimiento en el hardware objetivo, ya que los benchmarks solo cubren una GPU concreta (Intel Arc 140V).

## Enlaces

- [HuggingFace: xuanthanh318/bge-m3-int4-asym-g64-openvino](https://huggingface.co/xuanthanh318/bge-m3-int4-asym-g64-openvino)
- [Modelo base: BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3)
- [Documentación de BGE-M3](https://bge-model.com/bge/bge_m3.html)
- [Repositorio GitHub de BGE-M3 (inferless)](https://github.com/inferless/Bge-m3)
