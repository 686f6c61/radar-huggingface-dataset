# TensorVizion/roBERTa-nanobeir

## Resumen

El modelo `TensorVizion/roBERTa-nanobeir` es un encoder transformer basado en `roberta-base` (125 millones de parámetros) ajustado mediante aprendizaje contrastivo sobre el conjunto de datos NanoBEIR, una versión compacta del benchmark BEIR orientada a tareas de búsqueda semántica y recuperación de pasajes. Lo desarrolla el usuario TensorVizion con el objetivo de ofrecer un modelo de embeddings ligero, de carga rápida y capaz de ejecutarse en hardware modesto (portátiles, CPUs o GPUs pequeñas), sin renunciar a una generalización razonable entre distintos dominios de recuperación.

El modelo hereda de RoBERTa una ventana de contexto de 512 tokens y está limitado al inglés. No es un modelo generativo: produce vectores de texto que pueden usarse para similitud, clustering, deduplicación o como primera etapa de un pipeline RAG. Su relevancia actual radica en que cubre el nicho de modelos de recuperación compactos y de bajo coste, frente a alternativas de gran tamaño que requieren infraestructura más potente. Los pesos se distribuyen bajo licencia MIT y el repositorio contiene únicamente archivos `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) |
| Parametros totales | 124.647.170 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | ingles (unico) |
| Licencia | MIT (heredada de roberta-base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura `roberta-base`, un transformer encoder de 12 capas con atención bidireccional, 768 dimensiones de ocultación y 12 cabezas de atención. Sobre esta base se realizó un ajuste fino con un objetivo de aprendizaje contrastivo: para cada consulta, se acerca el pasaje relevante en el espacio de embeddings y se alejan los demás ejemplos del lote. El entrenamiento se llevó a cabo con un tamaño de lote de 4 y una tasa de aprendizaje de 2e-5, sobre el dataset NanoBEIR, que agrupa múltiples tareas de recuperación (preguntas, resúmenes, consultas web) para exponer al modelo a una variedad de dominios sin necesidad de un clúster de computación.

No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos. El modelo se usa con pooling medio sobre las representaciones de los tokens (mean pooling) seguido de normalización L2, tal como se muestra en los ejemplos de la model card. El entrenamiento se realizó con `transformers` y `sentence-transformers`, y el resultado es un modelo de embeddings puro, sin capacidades generativas.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y recuperacion de pasajes.
- Similitud entre textos: calculo de similitud coseno entre consultas y pasajes.
- Clustering y deduplicacion de documentos basados en similitud de embeddings.
- Primera etapa de recuperacion (first-stage retrieval) en pipelines RAG o sistemas de busqueda.
- Ejecucion en hardware modesto: CPU, portatiles y GPUs pequenas.
- Carga rapida: el modelo es compacto (0.5 GB en repo) y se puede cargar en segundos.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Busqueda semantica en aplicaciones web: el modelo puede indexar pasajes de documentacion o articulos y devolver los mas relevantes a una consulta del usuario, gracias a su capacidad de generar embeddings comparables.
- Pipeline RAG de primera etapa: en un sistema de generacion aumentada por recuperacion, se usa para preseleccionar los pasajes candidatos que luego pasaran a un modelo generativo, reduciendo el coste computacional.
- Clustering de documentos: permite agrupar textos por similitud tematica, por ejemplo para organizar correos, tickets de soporte o articulos de prensa, usando los embeddings como caracteristicas.
- Deduplicacion de contenido: detecta pasajes duplicados o casi duplicados en bases de datos o repositorios, comparando la similitud coseno entre embeddings.
- Sistema de recomendacion basado en texto: dado un articulo o producto, se pueden encontrar otros elementos similares calculando la distancia entre sus embeddings.
- Clasificacion de consultas de soporte: al embedder las consultas de clientes, se pueden agrupar por tema o asignar a categorias predefinidas mediante similitud con ejemplos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como nDCG, MRR o Recall en BEIR o NanoBEIR, ni comparaciones con otros modelos. El autor indica explicitamente que el modelo no persigue liderar rankings, sino ofrecer un equilibrio entre tamano, velocidad y utilidad practica.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, el modelo ocupa aproximadamente 500 MB (124M parametros x 4 bytes); en fp16, unos 250 MB. Con un lote pequeno, cabe en GPUs con 2 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o incluso integradas con suficiente memoria compartida). Tambien funciona en CPU sin GPU.
- Compatibilidad con hardware de consumo: si, el modelo esta disenado para ejecutarse en portatiles y equipos de escritorio convencionales.
- Opciones de despliegue: se puede usar con `sentence-transformers`, `transformers` (PyTorch), o exportar a ONNX para inferencia en CPU. No se menciona soporte para vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no se proporcionan datos oficiales. En CPU, la codificacion de un texto corto suele tardar decenas de milisegundos; en GPU, unos pocos milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| TensorVizion/roBERTa-nanobeir | 124M | 512 | MIT | Ajustado en NanoBEIR, enfocado a recuperacion |
| sentence-transformers/all-MiniLM-L6-v2 | 22M | 256 | Apache 2.0 | Muy ligero, popular para busqueda semantica |
| BAAI/bge-small-en-v1.5 | 33M | 512 | MIT | Optimizado para recuperacion, buen rendimiento en BEIR |

No se dispone de datos de rendimiento comparativo (nDCG, MRR) para estos modelos en la informacion proporcionada. La eleccion entre ellos dependera del equilibrio entre tamano, velocidad y calidad de recuperacion que se necesite.

## Limitaciones y advertencias

- Solo ingles: el modelo no soporta otros idiomas; su uso con textos en castellano u otros idiomas producira embeddings de baja calidad.
- Longitud de contexto limitada a 512 tokens: documentos largos deben dividirse en fragmentos (chunking) para no perder informacion.
- Sesgos de los datos web: los embeddings pueden reflejar sesgos sociales presentes en los corpus de entrenamiento, lo que podria afectar a sistemas que toman decisiones sobre personas.
- Dependencia de coincidencia de palabras clave: el modelo puede considerar similares textos que comparten vocabulario pero no significado, un problema comun en modelos de recuperacion pequenos.
- Dominios especializados: al ser un modelo pequeno entrenado en un dataset limitado, su rendimiento puede degradarse en dominios muy especificos no representados en NanoBEIR.
- No es generativo: no puede producir texto, solo vectores. Cualquier tarea que requiera generacion debe combinarse con un modelo de lenguaje generativo.
- Licencia de los datos de entrenamiento: aunque los pesos son MIT, NanoBEIR se compone de varios corpus con licencias propias; si se redistribuyen los datos o se construye un producto comercial sobre ellos, conviene revisar las licencias de los datasets constituyentes.

## Enlaces

- [HuggingFace - TensorVizion/roBERTa-nanobeir](https://huggingface.co/TensorVizion/roBERTa-nanobeir)
- No se proporcionan otros enlaces (papers, blogs o repos) en la informacion disponible.
