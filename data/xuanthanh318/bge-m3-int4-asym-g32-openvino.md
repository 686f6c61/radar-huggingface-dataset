# xuanthanh318/bge-m3-int4-asym-g32-openvino

## Resumen

Este modelo es una derivación cuantizada del conocido BGE-M3 de BAAI, comprimida localmente para inferencia de embeddings densos con OpenVINO. El autor, xuanthanh318, ha aplicado una cuantización INT4 asimétrica con grupo de tamaño 32 (INT4_ASYM, group size 32, ratio 1.0) mediante NNCF, manteniendo las capas protegidas como INT8 asimétrico. El resultado es un artefacto de 0.5 GB que expone únicamente la salida `sentence_embedding` de 1024 dimensiones, con una longitud máxima de secuencia de 8192 tokens.

La relevancia de este modelo radica en que permite ejecutar BGE-M3, un modelo multilingüe de embeddings de alto rendimiento, en hardware modesto (CPU o GPU Intel) con una huella de memoria reducida. Está pensado para aplicaciones de recuperación densa (dense retrieval) en producción donde el tamaño y la latencia son críticos. No incluye los modos sparse ni ColBERT del modelo original, por lo que se limita a la funcionalidad densa.

La licencia es MIT, lo que facilita su uso comercial sin restricciones adicionales. El repositorio tiene 0 descargas y 0 likes, lo que indica que es un artefacto reciente y poco difundido, aunque su base es un modelo consolidado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa) basada en BGE-M3 |
| Parametros totales | No disponible (el modelo base BGE-M3 tiene 568 millones, pero la versión cuantizada no especifica el conteo exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | INT4 asimétrico (group size 32, ratio 1.0) con capas protegidas en INT8 asimétrico |
| Idiomas soportados | No disponible en la ficha; el modelo base BGE-M3 soporta más de 100 idiomas |
| Licencia | MIT |
| Formato de pesos | OpenVINO (XML + binarios), compatible con la librería `openvino` |

## Arquitectura y entrenamiento

El modelo se basa en BGE-M3, una arquitectura transformer del tipo XLM-RoBERTa con 568 millones de parámetros en su versión original. BGE-M3 fue entrenado por BAAI para realizar simultáneamente recuperación densa, sparse y multi-vector (ColBERT) en más de 100 idiomas, con una longitud máxima de 8192 tokens. El proceso de entrenamiento incluyó datos multilingües a gran escala y técnicas de autoetiquetado para mejorar la calidad de los embeddings.

La versión cuantizada aquí descrita no añade ningún entrenamiento adicional; es una compresión posterior mediante NNCF (Neural Network Compression Framework) de Intel. Se aplicó cuantización INT4 asimétrica con grupo de tamaño 32 y ratio 1.0, deshabilitando la estimación de escala. Las capas consideradas "protegidas" se mantuvieron en INT8 asimétrico para preservar la estabilidad numérica. El resultado es un modelo que conserva la funcionalidad de embedding denso, pero con un tamaño significativamente reducido (0.5 GB frente a los ~2.3 GB del modelo original en FP32).

## Capacidades

- Generación de embeddings densos para texto, con dimensión de salida 1024.
- Recuperación densa (dense retrieval) en inglés y, potencialmente, en más de 100 idiomas gracias a la base multilingüe de BGE-M3 (aunque la ficha no confirma el soporte multilingüe en esta versión cuantizada).
- Manejo de secuencias largas de hasta 8192 tokens, adecuado para documentos extensos.
- Inferencia eficiente en CPU y GPU Intel mediante OpenVINO, con soporte para compilación en dispositivos como Intel Arc 140V.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de embeddings.
- No expone los modos sparse ni ColBERT del BGE-M3 original.

## Casos de uso

- Búsqueda semántica en motores de recomendación: el modelo puede indexar documentos y consultas en un espacio vectorial de 1024 dimensiones, permitiendo recuperación por similitud coseno. Su ventana de 8192 tokens permite procesar artículos completos o informes extensos sin truncamiento agresivo.
- Sistemas de respuesta a preguntas (QA) sobre documentación interna: al generar embeddings de pasajes largos, se puede construir un índice vectorial para recuperar fragmentos relevantes antes de pasarlos a un LLM generativo.
- Clasificación y agrupación de textos multilingües: gracias a la base multilingüe de BGE-M3, es posible agrupar documentos en varios idiomas sin necesidad de modelos separados, siempre que la cuantización no degrade excesivamente el rendimiento.
- Filtrado de contenido duplicado en grandes corpus: comparando embeddings de documentos, se pueden detectar duplicados o casi duplicados en bases de datos de noticias, patentes o publicaciones científicas.
- Sistemas de recomendación basados en contenido: los embeddings de ítems (productos, artículos, vídeos) permiten calcular similitudes y generar recomendaciones personalizadas en tiempo real, con baja latencia en hardware Intel.
- Pipeline de RAG (Retrieval-Augmented Generation) en entornos con restricciones de memoria: al ser un modelo de solo 0.5 GB, puede desplegarse en servidores con GPUs de gama baja o incluso en CPUs, integrándose con frameworks como LangChain o Haystack para recuperar contexto antes de la generación.

## Benchmarks y rendimiento

La model card reporta resultados en el benchmark LoCoMo (inglés, recuperación densa) con OpenVINO 2026.3 en Intel Arc 140V GPU:

| Métrica | Valor |
|---|---|
| nDCG@10 | 45,994% |
| Recall@10 | 60,878% |
| MRR@10 | 44,845% |
| Hit@10 | 70,640% |

No se han publicado comparativas con otros modelos cuantizados o con el BGE-M3 original en la información disponible. Estos valores corresponden a la versión cuantizada y no deben interpretarse como el rendimiento del modelo base sin compresión.

## Requisitos de hardware

- Tamaño del repositorio: 0.5 GB, lo que indica que el modelo cuantizado ocupa aproximadamente esa cantidad en disco.
- VRAM estimada: no especificada, pero dado el tamaño del modelo, es probable que quepa en GPUs con 1-2 GB de VRAM (por ejemplo, Intel Arc integradas o GPUs de entrada). No se puede confirmar sin pruebas adicionales.
- GPU recomendadas: el modelo se probó en Intel Arc 140V (GPU integrada de Intel). Es compatible con cualquier dispositivo soportado por OpenVINO, incluyendo CPUs Intel y GPUs Intel.
- Opciones de despliegue: OpenVINO Runtime (compilación a CPU o GPU), integrable con Hugging Face Transformers para el tokenizador. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de embeddings y no un LLM generativo.
- Latencia y throughput: no disponibles. El rendimiento dependerá del hardware y de la longitud de las secuencias. La cuantización INT4 suele acelerar la inferencia en comparación con FP32, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de comparativas directas con otras versiones cuantizadas de BGE-M3 o con modelos de embeddings alternativos (como E5-mistral, GTE, etc.) en la información proporcionada. El modelo original BGE-M3 es el punto de referencia natural, pero no se han publicado métricas comparativas entre la versión cuantizada y la original. Se recomienda evaluar el modelo en el caso de uso específico antes de desplegarlo en producción.

## Limitaciones y advertencias

- El modelo solo expone el embedding denso; no incluye los modos sparse ni ColBERT del BGE-M3 original, lo que limita su uso en escenarios que requieran recuperación híbrida o multi-vector.
- La cuantización INT4 puede degradar la calidad de los embeddings en comparación con el modelo en FP32, especialmente en idiomas poco representados o en dominios muy específicos. Los benchmarks LoCoMo muestran valores moderados, pero no hay comparación con el original.
- No se ha verificado el soporte multilingüe en esta versión cuantizada; aunque el modelo base es multilingüe, la cuantización podría afectar al rendimiento en idiomas distintos del inglés.
- El modelo no es un LLM generativo; no puede realizar tareas de razonamiento, generación de texto ni tool calling.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido ampliamente probado por la comunidad. Se recomienda validar su comportamiento en el entorno de producción antes de adoptarlo.
- La licencia MIT permite uso comercial, pero se debe mantener la atribución correspondiente al modelo original BGE-M3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xuanthanh318/bge-m3-int4-asym-g32-openvino
- Modelo original BGE-M3: https://huggingface.co/BAAI/bge-m3
- Documentación de BGE-M3: https://bge-model.com/bge/bge_m3.html
- Repositorio de BGE-M3 en GitHub (referencia): https://github.com/inferless/Bge-m3
