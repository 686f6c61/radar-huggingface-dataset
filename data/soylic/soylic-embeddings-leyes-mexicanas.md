# soylic/soylic-embeddings-leyes-mexicanas

## Resumen

Soylic-embeddings-leyes-mexicanas es un modelo de embeddings de frases (sentence-transformers) especializado en recuperación de información jurídica mexicana. Lo desarrolla el usuario soylic y se construye por ajuste fino del modelo base ibm-granite/granite-embedding-97m-multilingual-r2, un transformer de arquitectura ModernBERT con 97.441.152 parámetros. Está diseñado para tareas de similitud semántica y extracción de características orientadas a retrieval, con el castellano como único idioma declarado en sus metadatos.

El problema que aborda es la brecha de dominio en sistemas de búsqueda semántica sobre normativa mexicana: los modelos de embeddings generalistas no capturan de forma óptima la terminología legal, las referencias cruzadas entre artículos ni las formulaciones propias de la legislación nacional. Al estar ajustado sobre el corpus legal, resulta relevante para equipos que construyen asistentes de consulta normativa, sistemas de recuperación aumentada (RAG) sobre códigos y leyes, o motores de búsqueda interna en despachos y administraciones públicas.

El modelo es de tamaño reducido (97 millones de parámetros, repo de 0,6 GB) y se distribuye en formatos safetensors y ONNX, lo que facilita su despliegue en infraestructura modesta. Es importante señalar que el acceso está restringido (gated): requiere aceptar condiciones en HuggingFace antes de descargarlo, y no se declara licencia en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), base ibm-granite/granite-embedding-97m-multilingual-r2 |
| Parametros totales | 97.441.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX) |
| Idiomas soportados | es (castellano) |
| Licencia | no disponible |
| Formato de pesos | safetensors, ONNX |
| Dimension de embedding | no disponible |
| Funcion de similitud | coseno (pipeline sentence-similarity) |
| Acceso | restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

El modelo se basa en Granite-embedding-97m-multilingual-r2 de IBM, un encoder transformer de la familia ModernBERT optimizado para generación de embeddings multilingües. Sobre esta base, soylic realiza un ajuste fino orientado a similitud de frases y recuperación en el dominio jurídico mexicano, empleando la librería sentence-transformers. La información pública no detalla el número de tokens de entrenamiento, la composición exacta del corpus legal utilizado, ni si se aplicaron técnicas de contraste (por ejemplo, Multiple Negatives Ranking Loss) o minería de negativos duros.

Tampoco se especifican innovaciones técnicas adicionales más allá de las propias del modelo base: pooling sobre las representaciones del encoder y entrenamiento para que la similitud coseno entre embeddings refleje proximidad semántica. Los tags del repositorio indican compatibilidad con text-embeddings-inference y endpoints, lo que sugiere que está preparado para servir como modelo de embeddings en infraestructuras de inferencia estándar.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica y búsqueda.
- Extracción de características (feature-extraction) para pipelines de retrieval.
- Recuperación de pasajes jurídicos relevantes a partir de consultas en lenguaje natural en castellano.
- Soporte de búsqueda densa (dense retrieval) para RAG sobre corpus legales mexicanos.
- Uso como encoder en sistemas de re-ranking o clustering de documentos normativos.
- Compatible con sentence-transformers y con text-embeddings-inference para despliegue como servicio.
- Exportación a ONNX para inferencia optimizada en CPU o entornos sin PyTorch.
- Capacidades multilingües heredadas del modelo base: no confirmadas para este ajuste, que declara únicamente es.

## Casos de uso

- Asistente de consulta normativa: el modelo indexa artículos, códigos y reglamentos y recupera los fragmentos más próximos semánticamente a la pregunta del usuario, sirviendo de primera etapa en un pipeline RAG que luego alimenta a un LLM generador.
- Búsqueda interna en despachos jurídicos: permite localizar precedentes, tesis o cláusulas contractuales por significado y no solo por coincidencia léxica, útil cuando el usuario desconoce la terminología exacta del documento.
- Atención al ciudadano en portales gubernamentales: dado su tamaño reducido, puede desplegarse en infraestructura modesta para responder consultas frecuentes sobre trámites y obligaciones legales, enlazando al artículo aplicable.
- Deduplicación y clustering de expedientes: agrupa documentos legales similares (demandas, contratos, resoluciones) calculando distancias entre embeddings, facilitando la organización de archivos jurídicos.
- Verificación de citas legales: compara la redacción de una cláusula con la normativa vigente indexada para detectar referencias obsoletas o formulaciones divergentes.
- Enriquecimiento de bases de conocimiento: genera representaciones vectoriales de leyes y reglamentos para alimentar motores de búsqueda vectorial (FAISS, Qdrant, pgvector) en sistemas de gestión documental pública o privada.
- Filtrado previo en pipelines de compliance: recupera normativa potencialmente aplicable a una operación descrita en texto libre, como paso inicial antes de la revisión por un experto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,4 GB para los pesos (97 M de parámetros); en FP16 alrededor de 0,2 GB. El consumo real depende del tamaño de lote y de la longitud de secuencia.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) donde el cuello de botella será el throughput, no la memoria.
- Inferencia viable en CPU: la exportación ONNX y el reducido tamaño lo hacen apto para servidores sin GPU.
- Opciones de despliegue: sentence-transformers (PyTorch), ONNX Runtime, text-embeddings-inference (según los tags del repositorio) y, previsiblemente, integración en motores vectoriales que acepten modelos de HuggingFace.
- Latencia y throughput: no disponibles en la información proporcionada; a título orientativo, un encoder de 97 M de parámetros procesa lotes de cientos de frases por segundo en GPU moderna, pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| soylic-embeddings-leyes-mexicanas | 97,4 M | no disponible | es | no disponible | gated |
| ibm-granite/granite-embedding-97m-multilingual-r2 (base) | 97,4 M | no disponible | multilingüe | no disponible | público |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | 128 tokens | multilingüe | Apache 2.0 | público |
| BAAI/bge-m3 | ~568 M | 8192 tokens | multilingüe | MIT | público |

La comparativa se limita a modelos de embeddings de propósito general, ya que no se ha identificado en la información disponible otro modelo especializado en leyes mexicanas con el que contrastarlo. El modelo de soylic ofrece la ventaja de la especialización de dominio frente a alternativas generalistas, a costa de un acceso restringido y una licencia no declarada.

## Limitaciones y advertencias

- Acceso gated: es necesario aceptar condiciones en HuggingFace antes de la descarga; no es un modelo de uso libre inmediato.
- Licencia no disponible: no puede confirmarse el permiso para uso comercial, lo que supone un riesgo legal relevante en producción.
- Idioma limitado al castellano: no se garantiza un rendimiento adecuado en otros idiomas, pese a la naturaleza multilingüe del modelo base.
- Sesgos potenciales: al ajustarse sobre un corpus legal mexicano, puede heredar sesgos de la normativa y de la selección documental realizada por el autor; no se documenta la composición del dataset.
- Riesgo de alucinación en el pipeline completo: el modelo solo recupera pasajes; cualquier generación posterior depende del LLM que se conecte, que puede fabricar citas legales inexistentes.
- Longitud de contexto no documentada: se desconoce el máximo de tokens por entrada, lo que dificulta planificar la fragmentación de documentos largos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base ni frente a alternativas generalistas.
- Comunidad reducida: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Fecha de creación futura en los metadatos (2026-11-04): conviene verificar la integridad y procedencia del repositorio antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soylic/soylic-embeddings-leyes-mexicanas
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2
- Librería sentence-transformers: https://www.sbert.net/
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
