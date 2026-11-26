# speakleash/Bielik-SPLADE-50M-v1.0-ONNX-INT8

## Resumen

Bielik-SPLADE-50M-v1.0-ONNX-INT8 es la exportación a ONNX con cuantización int8 del modelo SPLADE polaco `speakleash/Bielik-SPLADE-50M-v1.0`, desarrollado por SpeakLeash en colaboración con ACK Cyfronet AGH y Gaia AI Factory. SPLADE (Sparse Lexical and Expansion) es una técnica de recuperación de información dispersa que combina la expansión de términos propia de los modelos neuronales con la eficiencia de los índices invertidos clásicos, generando vectores de impacto sobre un vocabulario de 50.001 dimensiones. Este modelo concreto está diseñado para codificar consultas (queries) en CPU sin necesidad de PyTorch, empleando únicamente `onnxruntime` y la librería `tokenizers`.

El modelo resuelve el problema de la latencia y el coste de infraestructura en pipelines de búsqueda en polaco: al ejecutarse en CPU con cuantización int8, codifica una consulta en 2,2 ms (mediana, 6 hilos) en un procesador de escritorio de 6 núcleos, lo que supone 7 veces más rápido que el modelo PyTorch en fp32. Está pensado para emparejarse con un índice construido por el modelo completo `Bielik-SPLADE-82M-v1.0`, con el que comparte vocabulario, de modo que el 82M indexa el corpus y este 50M int8 atiende las consultas en producción.

Con 50M parámetros y una longitud máxima de 512 tokens, se posiciona como una pieza ligera de recuperación léxica dispersa para despliegues en CPU a gran escala. La licencia es `gemma`, lo que condiciona su uso comercial. El repositorio ocupa 0,1 GB y el grafo ONNX pesa 95 MiB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo ALBERT (base: Bielik-SPLADE-50M), cabeza MLM con pooling SPLADE |
| Parametros totales | 50M (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length del grafo) |
| Tipos de cuantizacion | int8 dinamico (pesos u8 per-channel, activaciones con rangos fijados en tiempo de ejecucion) |
| Idiomas soportados | polaco (pl) |
| Licencia | gemma |
| Formato de pesos | ONNX (`model.onnx`, 95 MiB) + `tokenizer.json`, `config.json`, `onnx_splade.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de tipo ALBERT de 50M parámetros, exportado a ONNX con cuantización dinámica int8 sobre los nodos MatMul/Gemm, incluida la cabeza MLM. Los pesos se almacenan como u8 con escala por canal; los rangos de activación se fijan por lote en tiempo de ejecución sin calibración. Cinco nodos permanecen en fp32 para preservar la calidad de los vectores: las proyecciones key, attention-output y las dos feed-forward de la capa extra de la cabeza, además de la proyección feed-forward de salida de la tercera capa del transformer. El grafo realiza el pooling SPLADE internamente: la salida es el vector disperso final, `max over tokens of log(1 + relu(logits))`, enmascarado por la attention mask, con forma `[batch, 50001]`. El opset es 17.

Los detalles de entrenamiento (número de tokens, composición del dataset, si hubo destilación o ajuste con pares query-pasaje) no se incluyen en esta model card; remiten a la del modelo PyTorch original `speakleash/Bielik-SPLADE-50M-v1.0`. La innovación técnica destacable de esta exportación es la preservación selectiva de nodos en fp32 para evitar la deriva de los vectores: frente a una exportación fp32 del mismo grafo, la similitud coseno media es 0,9948 y el solapamiento Jaccard de dimensiones activas es 0,864 sobre 128 textos (64 consultas y 64 pasajes) de un corpus polaco ajeno a PIRB.

## Capacidades

- Codificación de consultas y pasajes en vectores dispersos de 50.001 dimensiones para recuperación de información léxica.
- Expansión de términos (term expansion) propia de SPLADE: el modelo activa dimensiones del vocabulario no presentes literalmente en el texto.
- Extracción de características (`feature-extraction`) y generación de impactos enteros aptos para índices invertidos.
- Inferencia en CPU sin PyTorch, solo con `onnxruntime` y `tokenizers`.
- Compatibilidad de vocabulario con `Bielik-SPLADE-82M-v1.0`, lo que permite usar este modelo para codificar consultas sobre un índice construido por el 82M.
- Procesamiento por lotes con recorte a la longitud máxima de cada fila (gestión de memoria mediante `max_batch_tokens`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un encoder de recuperación, no un modelo generativo.
- Capacidad multilingüe limitada al polaco.

## Casos de uso

- Búsqueda documental en polaco a gran escala: el modelo codifica las consultas de usuario en vectores dispersos que se consultan contra un índice invertido construido con `Bielik-SPLADE-82M-v1.0`, aprovechando los 2,2 ms por consulta para mantener latencias bajas en motores de búsqueda.
- Recuperación en atención al cliente: dado un corpus de FAQ o artículos de soporte en polaco, el modelo transforma la pregunta del usuario en impactos de términos que alimentan un ranking léxico disperso, con despliegue en CPU que evita costes de GPU.
- Búsqueda híbrida en motores tipo Elasticsearch/OpenSearch: los impactos enteros (`quantization_factor=100`) se indexan como campos de términos ponderados, combinando la expansión semántica de SPLADE con el scoring BM25 nativo del motor.
- Filtrado previo en pipelines RAG: como recuperador de primera etapa barato en CPU, reduce el corpus candidato antes de un reranker neuronal más costoso, gracias a su bajo coste por consulta.
- Despliegue en entornos sin GPU: servicios en contenedores o dispositivos de borde donde no hay acelerador disponible; el grafo ONNX de 95 MiB y la ausencia de dependencia de PyTorch simplifican la imagen de despliegue.
- Procesamiento por lotes de consultas offline: análisis de logs de búsqueda o evaluación de sistemas de recuperación sobre conjuntos grandes de consultas, con división automática de lotes para respetar el límite de memoria (`max_batch_tokens` de 4.096 por ejecución).

## Benchmarks y rendimiento

Los datos disponibles corresponden a la evaluación del autor sobre tareas PIRB (Polish Information Retrieval Benchmark) y a la fidelidad de la cuantización:

| Metrica | Valor |
|---|---|
| PIRB, 10 tareas publicas, consultas int8 (sobre indice del propio modelo) | 64,29 |
| PIRB, 10 tareas publicas, PyTorch fp32 (sobre indice del propio modelo) | 64,34 |
| Latencia de codificacion de consulta (CPU 6 nucleos, 6 hilos, mediana) | 2,2 ms |
| Aceleracion frente a PyTorch fp32 | 7x |
| Similitud coseno media int8 vs fp32 (128 textos) | 0,9948 |
| Jaccard de dimensiones activas int8 vs fp32 | 0,864 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K) ni comparaciones con otros recuperadores en las mismas tareas.

## Requisitos de hardware

- Inferencia en CPU: el modelo está pensado para `CPUExecutionProvider` de `onnxruntime`; el grafo pesa 95 MiB y el repositorio 0,1 GB.
- Memoria: el grafo construye internamente los logits MLM `[batch, length, 50001]` en fp32, lo que consume aproximadamente 200 kB por token; para pasajes se recomienda mantener lote × longitud acolchada ≤ 4.096 tokens por ejecución (unos 0,8 GB por tensor intermedio).
- GPU: el autor indica que estos ficheros int8 son para CPU; en GPU recomienda usar el modelo PyTorch. La clase incluida acepta `provider="cuda"` y `provider="tensorrt"` con `onnxruntime-gpu`, pero no es el caso de uso previsto.
- No requiere GPU dedicada; cabe en cualquier CPU de escritorio o servidor. No se especifican modelos de GPU recomendados porque el despliegue objetivo es CPU.
- Opciones de despliegue: `onnxruntime` (CPU), con la clase de referencia `OnnxSplade` incluida en el repositorio o con código plano de `onnxruntime` + `tokenizers`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un encoder de recuperación).
- Latencia: 2,2 ms por consulta en CPU de 6 núcleos con 6 hilos. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Bielik-SPLADE-50M-v1.0-ONNX-INT8 (este) | 50M | 512 | SPLADE int8 ONNX, solo consultas | gemma | 2,2 ms/consulta en CPU; PIRB 64,29 con consultas int8 |
| Bielik-SPLADE-50M-v1.0 | 50M | 512 | SPLADE PyTorch | gemma | Version fp32 de referencia; 7x mas lenta en CPU |
| Bielik-SPLADE-82M-v1.0 | 82M | 512 | SPLADE PyTorch, indice completo | gemma | Comparte vocabulario; usado para construir el indice sobre el que consulta este modelo |
| Bielik-SPLADE-50M-v1.0-ONNX (exportacion int8 del 82M) | 82M | 512 | SPLADE int8 ONNX | gemma | Segunda exportacion int8 de la coleccion; datos de rendimiento no disponibles en esta informacion |

Los datos de parámetros y contexto de los modelos comparados provienen de los nombres y referencias de la colección Bielik-SPLADE v1.0; el rendimiento de las alternativas fuera de lo citado no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo polaco: no está entrenado ni evaluado para otros idiomas; su uso en castellano u otras lenguas no está soportado.
- No es un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes; cualquier expectativa en ese sentido es un error de uso.
- La cuantización int8 introduce deriva respecto a fp32: Jaccard de dimensiones activas de 0,864 y coseno de 0,9948, lo que puede alterar rankings en casos límite.
- Los números de calidad se obtuvieron usando int8 solo en el lado de la consulta, sobre un índice construido por el modelo PyTorch; un índice construido con esta exportación no ha sido evaluado.
- El grafo no es compatible con el backend ONNX de Sentence Transformers (`SparseEncoder(..., backend="onnx")`), que espera logits MLM `[batch, length, vocab]`; este grafo ya realiza el pooling SPLADE.
- Importar `onnx_encoder.py` ejecuta código Python del repositorio, equivalente a `trust_remote_code`; conviene revisar el fichero antes de usarlo.
- Consumo de memoria: los logits internos en fp32 ocupan unos 200 kB por token; lotes grandes de pasajes pueden agotar la RAM si no se trocean.
- Licencia `gemma`: impone restricciones al uso comercial; es necesario revisar los términos de la licencia Gemma antes de desplegar en producción.
- Riesgo de alucinación no aplica en el sentido generativo, pero la expansión de términos puede introducir dimensiones espurias que degraden la precisión de la recuperación en dominios muy específicos.
- No se han publicado datos de sesgo ni evaluaciones de equidad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-SPLADE-50M-v1.0-ONNX-INT8
- Modelo base PyTorch: https://huggingface.co/speakleash/Bielik-SPLADE-50M-v1.0
- Modelo completo para indexación: https://huggingface.co/speakleash/Bielik-SPLADE-82M-v1.0
- Colección Bielik-SPLADE v1.0: https://huggingface.co/collections/speakleash/bielik-splade-v10
- Organización SpeakLeash: https://huggingface.co/speakleash
