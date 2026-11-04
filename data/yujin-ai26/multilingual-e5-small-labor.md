# yujin-ai26/multilingual-e5-small-labor

## Resumen

`yujin-ai26/multilingual-e5-small-labor` es un modelo de embeddings de frases (sentence-transformers) especializado en recuperación de información sobre normativa laboral coreana. Se obtiene mediante fine-tuning del modelo denso multilingüe `intfloat/multilingual-e5-small` sobre un conjunto de pares consulta-artículo legal, de modo que el espacio vectorial resultante alinea preguntas coloquiales sobre derechos laborales con los preceptos legales concretos que las responden. Lo publica el usuario `yujin-ai26` bajo licencia MIT.

La arquitectura subyacente es un transformer BERT de tipo encoder con 117.653.760 parámetros totales, que produce embeddings densos de 384 dimensiones y admite entradas de hasta 512 tokens (incluyendo tokens especiales y prefijos). El entrenamiento se realizó con la función de pérdida `MultipleNegativesRankingLoss` sobre un dataset de 663 pares, por lo que se trata de un ajuste ligero y de dominio muy acotado, no de un modelo de propósito general.

Su relevancia es práctica: demuestra el patrón habitual de especialización de un modelo E5 pequeño para un vertical concreto (en este caso, derecho laboral coreano) manteniendo el formato de prefijos `query:` / `passage:` de la familia E5, lo que permite integrarlo directamente en pipelines RAG existentes basados en sentence-transformers, sin cambiar la infraestructura de serving.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: `intfloat/multilingual-e5-small`) |
| Parametros totales | 117.653.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (incluyendo tokens especiales y prefijos `query:` / `passage:`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (`ko`); el modelo base es multilingüe, pero la especialización declarada es solo coreana |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `sentence-transformers`) |
| Dimension del embedding | 384 |
| Funcion de perdida | `MultipleNegativesRankingLoss` |
| Tamano del dataset de entrenamiento | 663 pares |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer denso derivado de `intfloat/multilingual-e5-small`, que se usa como extractor de características y se entrena con `MultipleNegativesRankingLoss`. Esta pérdida es la habitual en recuperación densa: dado un par (consulta, pasaje positivo), el resto de pasajes del lote actúan como negativos, de modo que el modelo aprende a acercar la consulta a su artículo correcto y a alejarla del resto. El resultado es un espacio de 384 dimensiones con similitud coseno como métrica de recuperación.

El conjunto de entrenamiento (`yujin-ai26/labor-embedding-data`) contiene 663 pares consulta-artículo del ámbito laboral coreano. El autor indica que el subconjunto `general-evaluation/general-corpus` del mismo repositorio de datos se empleó únicamente como control de regresión sobre otros dominios y no participó en el ajuste de pesos. No se documentan en la información disponible detalles sobre número de épocas, hiperparámetros, composición exacta del dataset ni si hubo etapas adicionales de alineación (DPO, RLHF), algo poco habitual en modelos de embeddings.

La innovación técnica es limitada por diseño: se trata de un fine-tuning de dominio sobre un modelo E5 ya existente, conservando el esquema de prefijos (`query:` para consultas, `passage:` para documentos) y la normalización de embeddings (`normalize_embeddings=True`), lo que garantiza compatibilidad con el ecosistema sentence-transformers y con `text-embeddings-inference`.

## Capacidades

- Generación de embeddings densos de 384 dimensiones para similitud semántica y recuperación de información.
- Extracción de características (`feature-extraction`) a nivel de frase y de pasaje.
- Recuperación de artículos legales laborales coreanos a partir de preguntas en lenguaje natural coloquial (el propio autor incluye ejemplos con formulaciones alternativas de la misma consulta).
- Búsqueda semántica bilingüe potencial gracias a la base multilingüe E5, aunque la especialización declarada y evaluada es solo en coreano.
- Compatibilidad con `sentence-transformers`, `text-embeddings-inference` y endpoints compatibles.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio: es exclusivamente un modelo de representación vectorial.

## Casos de uso

- RAG sobre normativa laboral coreana: indexar los artículos como pasajes con prefijo `passage:`, codificar la consulta del usuario con prefijo `query:` y recuperar los preceptos más relevantes para que un LLM genere la respuesta fundamentada. El ajuste específico mejora la alineación entre preguntas coloquiales y texto legal.
- Asistente de autoservicio para empleados: un chatbot interno que responde dudas sobre permisos, salarios u horarios recuperando primero el artículo aplicable; la ventana de 512 tokens es suficiente para artículos individuales.
- Búsqueda semántica en portales de recursos humanos: sustituir la búsqueda por palabras clave de un portal de políticas internas por recuperación densa, tolerando reformulaciones y sinónimos.
- Deduplicación y agrupación de consultas: usar los embeddings para agrupar preguntas equivalentes formuladas de forma distinta (el autor muestra tres variantes de la misma consulta sobre permiso menstrual) y enrutarlas a una única respuesta canónica.
- Filtrado previo en pipelines de compliance: clasificar consultas entrantes por artículo relevante antes de derivarlas a un revisor humano, reduciendo el volumen de triaje manual.
- Evaluación de regresiones en sistemas RAG legales: emplear el corpus general del dataset como control para detectar degradación en dominios distintos al laboral al actualizar el índice o el modelo.
- Prototipado rápido en local: con 117 millones de parámetros y pesos safetensors de 0,5 GB, se puede desplegar en una CPU o en una GPU de consumo para pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el dataset `labor` (tarea de recuperación de información, métricas de similitud coseno, no verificadas de forma independiente):

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,6402 |
| Cosine Accuracy@3 | 0,8551 |
| Cosine Accuracy@5 | 0,9019 |
| Cosine Accuracy@10 | 0,9299 |
| Cosine Precision@1 | 0,6402 |
| Cosine Precision@5 | 0,1804 |
| Cosine Recall@1 | 0,6402 |
| Cosine Recall@5 | 0,9019 |
| Cosine NDCG@10 | 0,7941 |
| Cosine MRR@10 | 0,7493 |
| Cosine MAP@100 | 0,7520 |

No se han publicado en la información disponible resultados comparativos frente al modelo base ni frente a otros modelos de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos; en fp16 alrededor de 0,25 GB. Con overhead de activaciones y tokenizador, un presupuesto de 1-2 GB es holgado para lotes moderados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: `sentence-transformers` (referencia), `text-embeddings-inference` (el repo incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`), y exportación a ONNX para inferencia en CPU. No se documenta soporte GGUF ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (117 M de parámetros) se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Especializacion |
|---|---|---|---|---|---|
| `yujin-ai26/multilingual-e5-small-labor` | 117,6 M | 512 tokens | 384 | MIT | Derecho laboral coreano |
| `intfloat/multilingual-e5-small` (base) | 117,6 M | 512 tokens | 384 | MIT | Propósito general multilingüe |
| `intfloat/multilingual-e5-base` | no disponible en la información | 512 tokens | 768 | MIT | Propósito general multilingüe |
| `BAAI/bge-small-en-v1.5` | no disponible en la información | 512 tokens | 384 | MIT | Propósito general en inglés |

La comparación directa de rendimiento con el modelo base no está disponible: el autor no publica la evaluación del base sobre el dataset `labor`, por lo que no es posible cuantificar la ganancia del fine-tuning. La ventaja frente a alternativas generales es la especialización en el dominio; la desventaja es que fuera del derecho laboral coreano el ajuste puede degradar ligeramente el rendimiento respecto al base, algo que el propio autor reconoce al incluir un corpus general de control de regresión.

## Limitaciones y advertencias

- El dataset de entrenamiento es muy pequeño (663 pares), lo que limita la cobertura y aumenta el riesgo de sobreajuste al estilo de redacción de los artículos incluidos.
- El autor advierte explícitamente de que las puntuaciones de recuperación dependen del conjunto de evaluación y de que otros dominios y artículos nuevos deben evaluarse por separado.
- Una alta similitud coseno no garantiza que el documento recuperado sea la respuesta legal correcta; el modelo no es una herramienta de asesoramiento jurídico.
- La especialización declarada es solo en coreano; el rendimiento en otros idiomas, aunque el base sea multilingüe, no está evaluado.
- No hay datos publicados sobre sesgos, tasas de alucinación (el modelo no genera texto, pero puede recuperar pasajes irrelevantes con alta confianza) ni robustez ante consultas adversariales.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base `intfloat/multilingual-e5-small`, también MIT según la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay validación independiente de los resultados declarados.
- No se documentan cuantizaciones oficiales ni artefactos ONNX o GGUF en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yujin-ai26/multilingual-e5-small-labor
- Dataset de entrenamiento: https://huggingface.co/datasets/yujin-ai26/labor-embedding-data
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Documentación de text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
