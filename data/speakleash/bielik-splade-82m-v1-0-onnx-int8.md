# speakleash/Bielik-SPLADE-82M-v1.0-ONNX-INT8

## Resumen

Bielik-SPLADE-82M-v1.0-ONNX-INT8 es la exportación a ONNX con cuantización int8 del modelo polaco de recuperación dispersa (sparse retrieval) speakleash/Bielik-SPLADE-82M-v1.0, desarrollado por SpeakLeash en colaboración con ACK Cyfronet AGH y Gaia AI Factory. El modelo original es un codificador de tipo RoBERTa de 82 millones de parámetros entrenado con la arquitectura SPLADE para generar representaciones léxicas dispersas (sparse vectors) sobre un vocabulario de 50.001 dimensiones, pensadas para motores de búsqueda e índices invertidos en lugar de embeddings densos.

Esta variante concreta resuelve un problema de despliegue: permite ejecutar la codificación de consultas y pasajes en CPU con `onnxruntime` y la librería `tokenizers`, sin necesidad de PyTorch ni de GPU. El grafo incluye el pooling SPLADE completo, de modo que la salida es directamente el vector disperso final, `max over tokens of log(1 + relu(logits))`, enmascarado por la attention mask. Según la model card, en una CPU de escritorio de 6 núcleos codifica una consulta en 3,7 ms (mediana, 6 hilos), unas 12 veces más rápido que el modelo PyTorch en fp32.

Es relevante para equipos que construyen buscadores o sistemas RAG sobre corpus en polaco y quieren un componente de recuperación léxica de bajo coste, desplegable en infraestructura sin aceleradores. El modelo está especializado exclusivamente en polaco y su licencia declarada es `gemma`, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo RoBERTa con cabecera MLM y pooling SPLADE (sparse retrieval) |
| Parametros totales | 82M (modelo base Bielik-SPLADE-82M-v1.0) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncado máximo del tokenizer y del grafo) |
| Tipos de cuantizacion | int8 dinámica (MatMul/Gemm en u8 per-channel, rangos de activación por batch en tiempo de ejecución, sin calibración); el modelo base PyTorch en fp32 |
| Idiomas soportados | polaco (pl) |
| Licencia | gemma |
| Formato de pesos | ONNX (`model.onnx`, 227 MiB), opset 17; tokenizer en JSON |
| Dimension de salida | vector disperso de 50.001 dimensiones (vocabulario) |
| Entradas del grafo | `input_ids`, `attention_mask` |
| Salida del grafo | `sparse_vector` [batch, 50001], float32 |

## Arquitectura y entrenamiento

El modelo base es un codificador transformer de tipo RoBERTa de 82M de parámetros adaptado a SPLADE (Sparse Lexical and Expansion). SPLADE proyecta los logits de la cabecera MLM sobre el vocabulario y aplica un pooling de máximo con activación `log(1 + relu(x))`, produciendo un vector disperso donde cada dimensión activa corresponde a un término del vocabulario con un peso de impacto. Esto permite indexar los documentos en un índice invertido clásico y combinar la expansión de términos aprendida con la eficiencia de la recuperación léxica.

Esta exportación concreta no aporta información nueva de entrenamiento: los detalles de datos y evaluación remiten a la model card del modelo PyTorch original. Técnicamente, el grafo ONNX incorpora la cuantización dinámica int8 de todas las operaciones MatMul/Gemm, incluida la cabecera MLM, con pesos u8 per-channel y rangos de activación calculados por batch en tiempo de ejecución sin calibración. El grafo realiza internamente el pooling SPLADE, por lo que no es compatible con el backend ONNX de Sentence Transformers (`SparseEncoder(..., backend="onnx")`), que espera logits MLM con forma [batch, length, vocab]. El modelo incluye un codificador de referencia en un solo fichero (`onnx_encoder.py`, clase `OnnxSplade`) que solo depende de `numpy`, `onnxruntime` y `tokenizers`.

## Capacidades

- Generación de representaciones dispersas (sparse vectors) de consultas y pasajes en polaco para recuperación de información.
- Expansión de términos aprendida: el vector disperso activa términos relacionados del vocabulario más allá de los presentes literalmente en el texto.
- Codificación por lotes con gestión de memoria: la clase incluida limita cada ejecución del grafo a `max_batch_tokens` (4.096 por defecto) y recorta cada lote a su fila más larga.
- Extracción de pesos de término en impactos enteros (`term_weights` con `quantization_factor=100`), aptos para un índice de impactos.
- Inferencia en CPU sin PyTorch mediante `onnxruntime` y `tokenizers`.
- Compatibilidad declarada con `provider="cuda"` y `provider="tensorrt"` vía `onnxruntime-gpu`, aunque el autor indica que estos ficheros int8 están pensados para CPU.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un modelo de extracción de características.

## Casos de uso

- Motor de búsqueda documental en polaco: el modelo codifica consultas y pasajes en vectores dispersos de 50.001 dimensiones que se indexan en un motor de índice invertido; la expansión de términos mejora el recall frente a BM25 puro sin renunciar a la eficiencia de la recuperación léxica.
- Recuperación en pipelines RAG sobre corpus polacos: actúa como retriever de primera etapa en CPU, con latencia de milisegundos por consulta (3,7 ms en 6 núcleos), lo que permite servir la recuperación en el mismo nodo de aplicación sin GPU dedicada.
- Búsqueda en atención al cliente o bases de conocimiento internas: al ejecutarse solo en CPU y ocupar 227 MiB, puede desplegarse en contenedores pequeños junto a servicios existentes y escalar horizontalmente por réplicas.
- Indexación por lotes de grandes colecciones: la gestión de `max_batch_tokens` y el recorte por longitud permiten procesar corpus extensos controlando el pico de memoria (unos 200 kB por token en el tensor intermedio de logits).
- Filtrado y deduplicación de documentos: los vectores dispersos permiten calcular similitud por producto escalar entre pasajes para detectar duplicados o near-duplicates en corpus polacos.
- Búsqueda híbrida: combinación de los impactos SPLADE con un retriever denso en una etapa de reordenación, aprovechando que la salida es un vector float32 [n, 50001] directamente consumible.
- Despliegue en entornos con requisitos estrictos de dependencias: al no necesitar PyTorch, encaja en imágenes de contenedor mínimas con `onnxruntime` y `tokenizers`.

## Benchmarks y rendimiento

La model card proporciona resultados de calidad del export int8 frente a un export fp32 del mismo grafo, medidos sobre 128 textos (64 consultas y 64 pasajes) de un corpus polaco ajeno a PIRB, y una evaluación sobre 10 tareas públicas de PIRB con consultas int8 sobre un índice construido con el modelo PyTorch:

| Metrica | Valor |
|---|---|
| Similitud coseno media int8 vs fp32 | 0,9700 |
| Jaccard de dimensiones activas int8 vs fp32 | 0,693 |
| Solapamiento de los 10 mejores términos int8 vs fp32 | 0,899 |
| Dimensiones activas int8 / fp32 | 0,88x |
| nDCG@10 en 10 tareas públicas de PIRB (consultas int8 sobre índice PyTorch) | 64,88 (PyTorch: 65,06) |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos de recuperación (MMLU, HumanEval, etc. no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM: no aplica para el caso de uso previsto; la inferencia es en CPU. El fichero `model.onnx` ocupa 227 MiB y el repositorio completo 0,2 GB.
- Memoria RAM: el grafo construye internamente los logits MLM [batch, length, 50001] en fp32, aproximadamente 200 kB por token; el autor recomienda mantener batch × longitud rellenada ≤ 4.096 tokens por ejecución (unos 0,8 GB por tensor intermedio).
- GPU: no necesarias. El autor indica que estos ficheros int8 están pensados para CPU y que en GPU conviene usar el modelo PyTorch; la clase admite `provider="cuda"` y `provider="tensorrt"` con `onnxruntime-gpu`, pero sin evaluación publicada.
- CPU: probado en una CPU de escritorio de 6 núcleos con 6 hilos, con latencia mediana de 3,7 ms por consulta.
- Despliegue: `onnxruntime` (CPUExecutionProvider) más la librería `tokenizers`; opcionalmente el fichero `onnx_encoder.py` incluido. No requiere vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de extracción de características de este tipo.
- Throughput: no disponible más allá de la latencia por consulta citada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Bielik-SPLADE-82M-v1.0-ONNX-INT8 | 82M | 512 | SPLADE disperso, int8 ONNX | pl | gemma | ONNX |
| Bielik-SPLADE-82M-v1.0 (base) | 82M | 512 | SPLADE disperso, fp32 | pl | gemma | PyTorch |
| Bielik-SPLADE-50M-v1.0 (misma colección) | 50M | no disponible | SPLADE disperso | pl | no disponible en la información | no disponible en la información |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de otros modelos de recuperación comparables (por ejemplo, modelos SPLADE multilingües o densos de tamaño similar) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especializado exclusivamente en polaco; no se ha evaluado su comportamiento en otros idiomas.
- Longitud máxima de 512 tokens: los documentos más largos se truncan, lo que puede perder información relevante en pasajes extensos.
- El índice construido con este export no ha sido evaluado: todas las cifras de la model card usan int8 solo en el lado de la consulta, sobre un índice construido con el modelo PyTorch.
- Los vectores int8 son más dispersos que los fp32 (0,88x de dimensiones activas) y el solapamiento de dimensiones activas con fp32 es de 0,693, por lo que puede haber pérdida de términos en la expansión.
- El tensor intermedio de logits consume unos 200 kB por token; lotes grandes sin trocear pueden agotar la memoria RAM.
- `onnx_encoder.py` ejecuta código Python del repositorio al importarse (equivalente a `trust_remote_code`); conviene revisarlo antes de usarlo.
- Licencia `gemma`: las condiciones de uso comercial vienen impuestas por dicha licencia, no por una licencia permisiva tipo Apache o MIT; debe revisarse antes de un despliegue en producción.
- Riesgo de alucinación no aplicable en el sentido generativo (no genera texto), pero la expansión de términos puede introducir términos no presentes en el documento, lo que en dominios muy técnicos puede producir falsos positivos.
- No es compatible con el backend ONNX de Sentence Transformers (`SparseEncoder(..., backend="onnx")`), que espera logits MLM en lugar del vector disperso final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-SPLADE-82M-v1.0-ONNX-INT8
- Modelo base PyTorch: https://huggingface.co/speakleash/Bielik-SPLADE-82M-v1.0
- Colección Bielik-SPLADE v1.0: https://huggingface.co/collections/speakleash/bielik-splade-v10
- Organización SpeakLeash: https://huggingface.co/speakleash
