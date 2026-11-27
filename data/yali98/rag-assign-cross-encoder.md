# yali98/rag-assign-cross-encoder

## Resumen

`yali98/rag-assign-cross-encoder` es un modelo cross-encoder para reordenación (reranking) de pasajes en pipelines de generación aumentada por recuperación (RAG). Lo desarrolla el usuario yali98 y parte de `google/electra-base-discriminator`, un transformer de tipo ELECTRA con 109.483.009 parámetros totales. El modelo recibe un par `(question, f"{title} | {text}")` y produce una puntuación de relevancia a partir de `logits[:, 0]`, que se usa para reordenar los 100 documentos recuperados inicialmente por BM25.

El problema que resuelve es el clásico cuello de botella de la recuperación en dos etapas: un recuperador léxico (BM25) obtiene candidatos con alta cobertura pero baja precisión, y un cross-encoder aprende a discriminar el pasaje relevante frente a los negativos difíciles. El modelo se entrenó con una formulación de elección entre 8 candidatos por pregunta (1 positivo y 7 negativos), con negativos muestreados de los 30 mejores resultados de un reordenador intermedio (`yali98/rag-assign-dpr`) más negativos duros de los qrels.

Es relevante ahora porque ejemplifica el patrón de reranker ligero y entrenable en hardware de consumo: se entrenó en una RTX 3080 en bf16, con unos 28 minutos por época, sobre 57.880 preguntas. Su tamaño (0,4 GB de repositorio) y licencia Apache-2.0 lo hacen desplegable en entornos con recursos limitados, aunque su alcance es específico del conjunto de datos del curso o tarea para el que fue creado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (transformer encoder, discriminador) |
| Parametros totales | 109.483.009 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | max_len de entrenamiento: 224 tokens; contexto máximo arquitectónico no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en bf16/fp32 según el repo) |
| Idiomas soportados | no disponible (la model card está en coreano; el dataset de entrenamiento no especifica idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en el discriminador de ELECTRA base de Google. En lugar de la cabeza de detección de tokens reemplazados típica de ELECTRA, se utiliza como `AutoModelForSequenceClassification` y se explota únicamente el logit de la posición 0 (`logits[:, 0]`) como puntuación de relevancia del par pregunta-pasaje. La entrada concatena la pregunta con el título y el texto del documento en el formato `f"{title} | {text}"`, con una longitud máxima de 224 tokens.

El entrenamiento emplea una pérdida de entropía cruzada sobre grupos de 8 candidatos por pregunta: 1 positivo (gold) y 7 negativos. Los negativos se construyen a partir de los 30 mejores documentos devueltos por `yali98/rag-assign-dpr` sobre el top-100 de BM25, complementados con negativos duros de los qrels, excluyendo documentos que contienen la cadena de respuesta correcta. Se usaron 57.880 preguntas de entrenamiento (excluyendo 1.000 de validación), con 2 épocas, learning rate 2e-5, `q_per_batch` 8, `group` 8, `neg_depth` 30, warmup ratio 0.1, weight decay 0.01, grad clip 1.0 y semilla 42. El mejor checkpoint fue la época 2 según MRR de gold y gold/weak_pos@1 en validación. El entrenamiento se realizó en una RTX 3080 con autocast bf16, aproximadamente 28 minutos por época.

## Capacidades

- Puntuación de relevancia pregunta-pasaje para reordenación en pipelines RAG de dos etapas.
- Reordenación de los 100 mejores candidatos de BM25 (o de cualquier recuperador léxico o denso) mediante puntuaciones comparables entre pares.
- Discriminación fina entre pasajes relevantes y negativos duros, gracias al muestreo de negativos con un reordenador intermedio y qrels.
- Manejo de pares con título y cuerpo de documento, formato habitual en colecciones tipo MS MARCO o dominios con metadatos.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un clasificador de pares.
- Capacidad multilingüe: no documentada; el modelo base ELECTRA es predominantemente inglés y la model card no declara idiomas.

## Casos de uso

- Reordenación en RAG sobre corpus documental: se recuperan 100 pasajes con BM25 y se reordenan con el cross-encoder antes de pasarlos al generador, reduciendo el ruido en el contexto y mejorando la fidelidad de las respuestas.
- Búsqueda empresarial interna: indexación de documentación con título y cuerpo, recuperación léxica inicial y reranking para devolver los pasajes más relevantes en un buscador corporativo.
- Preguntas sobre base de conocimiento con metadatos: el formato `title | text` encaja con wikis, bases de FAQ o manuales donde el título aporta señal semántica.
- Filtrado de candidatos en pipelines de evaluación: uso del score para descartar pasajes por debajo de un umbral antes de la etapa de generación, ahorrando tokens de contexto.
- Experimentación académica en recuperación: modelo ligero (0,4 GB) para reproducir pipelines de dos etapas en una sola GPU de consumo, útil en docencia e investigación.
- Componente de un sistema de preguntas y respuestas extractivas: combinado con un lector o un LLM, el reranker selecciona el pasaje del que se extrae la respuesta.
- Ajuste fino adicional: al ser Apache-2.0 y ELECTRA base, sirve como punto de partida para rerankers de dominio específico con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona el criterio de selección del mejor checkpoint (MRR de gold y gold/weak_pos@1 en validación) y remite a `history.json`, sin cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp16/bf16 para los 109 M de parámetros, más el overhead de activaciones; alrededor de 1 GB en fp32.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el propio autor entrenó en una RTX 3080, por lo que la inferencia cabe holgadamente en GTX 1660, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, exportación a ONNX Runtime, TorchServe o Triton; también es posible servirlo con Text Embeddings Inference (TEI) en modo reranker si se configura el modelo adecuadamente. vLLM y llama.cpp no aplican a este tipo de clasificador.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerá del lote, la longitud de secuencia (máximo 224 tokens) y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yali98/rag-assign-cross-encoder | 109,5 M | 224 tokens (entrenamiento) | Apache-2.0 | Hugging Face | Reranker ELECTRA específico de tarea |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | ~22,7 M | 512 tokens | Apache-2.0 | Hugging Face | Reranker estándar de Sentence-Transformers, más pequeño y multiuso |
| BAAI/bge-reranker-base | ~278 M | 512 tokens | MIT | Hugging Face | Reranker más grande, multilingüe y con benchmarks públicos |
| google/electra-base-discriminator | 109,5 M | 512 tokens | Apache-2.0 | Hugging Face | Modelo base sin ajuste para reranking |

La comparación de rendimiento con estas alternativas no está disponible, ya que el modelo no publica métricas de benchmarks en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: entrenado para una tarea concreta (RAG de un curso o asignatura) sobre un dataset específico; su generalización a otros dominios no está documentada.
- Longitud de contexto limitada: `max_len` de 224 tokens en entrenamiento, inferior a los 512 habituales en rerankers estándar; los pasajes largos se truncan y pueden perder información relevante.
- Idiomas no declarados: la model card está en coreano y el modelo base ELECTRA es principalmente inglés; el comportamiento en castellano u otros idiomas no está verificado.
- Riesgo de alucinación no aplica directamente al ser un clasificador, pero sus puntuaciones pueden ser poco calibradas fuera de la distribución de entrenamiento.
- Sesgos: no documentados; al derivar de ELECTRA base y de un dataset de tarea, puede heredar sesgos del corpus original.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales que conviene revisar.
- Sin métricas públicas de rendimiento: no hay benchmarks que permitan estimar su calidad frente a alternativas; se recomienda evaluar en el dominio objetivo antes de producción.
- Cero descargas y cero likes en el momento de la consulta: modelo sin validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yali98/rag-assign-cross-encoder
- Modelo base: https://huggingface.co/google/electra-base-discriminator
- Reordenador intermedio usado para minar negativos: https://huggingface.co/yali98/rag-assign-dpr
- Dataset de negativos: https://huggingface.co/datasets/yali98/rag-assign-ce-negatives
