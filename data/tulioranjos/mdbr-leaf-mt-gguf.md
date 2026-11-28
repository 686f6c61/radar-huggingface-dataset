# tulioranjos/mdbr-leaf-mt-GGUF

## Resumen

mdbr-leaf-mt-GGUF es una colección de builds en formato GGUF del modelo de embeddings en inglés `MongoDB/mdbr-leaf-mt`, publicado por el usuario tulioranjos. El modelo original lo desarrolla MongoDB Research y está diseñado para tareas de similitud semántica, recuperación de información (retrieval) y extracción de características. Esta variante GGUF no modifica el modelo: lo empaqueta en distintos niveles de cuantización para su uso con motores de inferencia compatibles con GGUF (llama.cpp, entre otros).

El modelo es un encoder BERT de pequeno tamano, con 22.958.592 parámetros totales (aproximadamente 23 M), y produce embeddings de 1.024 dimensiones. Su ventana de entrada está limitada a 512 tokens, incluyendo el prefijo de retrieval y los tokens especiales. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales relevantes.

La relevancia de esta publicación reside en la evaluación sistemática de la degradación por cuantización: el autor compara seis builds (F16, Q8_0, Q5_0, Q4_1, Q4_0 e IQ4_NL) frente a una referencia FP32 mediante divergencia KL, nDCG@10, correlación de Spearman y precisión 1-NN, lo que permite elegir el nivel de compresión con datos objetivos en lugar de estimaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), según tag `bert`; detalles internos de capas no disponibles |
| Parámetros totales | 22.958.592 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (incluye prefijo de retrieval y tokens especiales) |
| Tipos de cuantización | F16, Q8_0, Q5_0, Q4_1, Q4_0, IQ4_NL |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,1 GB); el modelo base usa safetensors |
| Dimensión de embedding | 1.024 |
| Pipeline | feature-extraction / sentence-similarity / information-retrieval |
| Modelo base | MongoDB/mdbr-leaf-mt (relación: quantized) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un encoder BERT (tag `bert`), con embeddings de palabras, matrices de atención, matrices feed-forward, embeddings de posición y de tipo de token, y una proyección de 384 a 1.024 dimensiones. El pipeline declarado es `feature-extraction` con uso previsto en `sentence-similarity` e `information-retrieval`. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO; el modelo original se documenta en el paper LEAF (Vujanic y Rückstieß), pero los detalles de entrenamiento no se recogen en la información proporcionada.

En cuanto a la cuantización, los seis builds GGUF aplican el formato indicado a embeddings de palabras, matrices de atención y matrices feed-forward, mientras que los embeddings de posición y de tipo de token y la proyección 384→1.024 se almacenan en F16, y los pesos y sesgos de LayerNorm en F32. No se utilizó matriz de importancia (importance matrix). El autor reporta que, a igual tamaño de fichero, IQ4_NL presenta un KL medio un 35 % inferior al de Q4_0.

## Capacidades

- Generación de embeddings de frases de 1.024 dimensiones mediante mean pooling y proyección, aptos para similitud semántica.
- Recuperación de información (retrieval) con prefijo de consulta específico: `"Represent this sentence for searching relevant passages: "` (con espacio final).
- Clasificación de textos mediante embeddings (evaluada con 1-NN leave-one-out).
- Comparación de pares de frases (sentence-pair similarity).
- Extracción de características para pipelines de búsqueda semántica y clustering.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- Capacidad multilingüe limitada: solo inglés declarado.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar pasajes con embeddings de 1.024 dimensiones y consultar con el prefijo de retrieval; el límite de 512 tokens obliga a fragmentar documentos en trozos de tamaño adecuado.
- Motor de preguntas y respuestas sobre corpus en inglés (por ejemplo, soporte interno): recuperar los pasajes más relevantes con nDCG@10 cercano a 0,66 en MS MARCO y alimentar un modelo generativo aparte.
- Deduplicación y clustering de tickets o artículos: calcular similitud coseno entre embeddings y agrupar por umbral; el tamaño reducido (23 M de parámetros) permite procesar grandes volúmenes en CPU.
- Filtrado de contenido y clasificación de reseñas: usar la precisión 1-NN observada (0,891 en Amazon Polarity, 0,856 en AG News) como clasificador ligero por vecino más cercano.
- Detección de similitud entre frases para control de calidad de traducciones o paráfrasis: la correlación de Spearman de 0,872 en STSBenchmark y 0,801 en SICK-R es adecuada para umbrales de similitud.
- Despliegue en entornos con recursos limitados: los builds Q4_0 e IQ4_NL ocupan 14,51 MB, lo que permite ejecutar el modelo en CPU o dispositivos de borde para búsqueda local.
- Recuperación científica: con nDCG@10 de 0,711 en SciFact, sirve para indexar resúmenes y artículos y localizar evidencia.

## Benchmarks y rendimiento

Datos publicados por el autor de los builds GGUF. La referencia es FP32; la evaluación usa embeddings de 1.024 dimensiones con prefijo en consultas y sin prefijo en documentos. KL se calcula a T=0,05 (nats).

| Build | Tamaño (MB) | KL medio (nats) | nDCG@10 medio | SQNR de pesos (dB) |
|---|---:|---:|---:|---:|
| FP32 (referencia) | 92,47 | 0 | 0,6326 | ∞ |
| F16 | 46,62 | 2,326e-6 | 0,6327 | 73,80 |
| Q8_0 | 25,67 | 2,500e-4 | 0,6353 | 45,38 |
| Q5_0 | 17,30 | 0,005132 | 0,6342 | 27,35 |
| Q4_1 | 15,90 | 0,01712 | 0,6284 | 22,21 |
| Q4_0 | 14,51 | 0,02347 | 0,6244 | 21,29 |
| IQ4_NL | 14,51 | 0,01530 | 0,6256 | 22,43 |

Puntuaciones por tarea (selección):

| Dataset | Métrica | FP32 | F16 | Q8_0 | Q5_0 | Q4_1 | Q4_0 | IQ4_NL |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| MS MARCO v1.1 QA validation | nDCG@10 | 0,6595 | 0,6599 | 0,6613 | 0,6620 | 0,6603 | 0,6627 | 0,6598 |
| FiQA2018 test | nDCG@10 | 0,5271 | 0,5272 | 0,5273 | 0,5259 | 0,5211 | 0,5129 | 0,5185 |
| SciFact test | nDCG@10 | 0,7111 | 0,7111 | 0,7172 | 0,7146 | 0,7037 | 0,6978 | 0,6986 |
| STSBenchmark test | Spearman | 0,8721 | 0,8721 | 0,8718 | 0,8715 | 0,8676 | 0,8675 | 0,8667 |
| SICK-R test | Spearman | 0,8007 | 0,8007 | 0,8004 | 0,8002 | 0,7991 | 0,7997 | 0,7963 |
| AG News test | 1-NN accuracy | 0,8560 | 0,8565 | 0,8550 | 0,8585 | 0,8580 | 0,8500 | 0,8615 |
| Amazon Polarity test | 1-NN accuracy | 0,8910 | 0,8910 | 0,8880 | 0,8850 | 0,8815 | 0,8850 | 0,8815 |

No se han publicado en la información disponible comparaciones con otros modelos de embeddings (por ejemplo, modelos de la familia MiniLM o E5); los benchmarks anteriores comparan únicamente builds del propio modelo frente a su referencia FP32.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en cualquier build (14,51 MB para Q4_0 e IQ4_NL; 46,62 MB para F16), sin contar overhead del runtime.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y también en CPU; no requiere GPU dedicada.
- GPU recomendadas para alto throughput: A100, H100 o L4 si se procesan millones de documentos por lote; el cuello de botella será el ancho de banda y el tamaño de lote, no la VRAM.
- Opciones de despliegue: llama.cpp y bindings GGUF (por ejemplo, `llama-embedding`); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. vLLM, TGI y Ollama no están confirmados en la información disponible para este formato concreto.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (23 M de parámetros) se espera latencia de milisegundos por frase en CPU, pero es una estimación no verificada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos de embeddings comparables, por lo que la comparación cuantitativa no está disponible. A continuación se comparan los propios builds entre sí:

| Criterio | F16 | Q8_0 | Q5_0 | Q4_1 | Q4_0 | IQ4_NL |
|---|---|---|---|---|---|---|
| Tamaño (MB) | 46,62 | 25,67 | 17,30 | 15,90 | 14,51 | 14,51 |
| KL medio (nats) | 2,326e-6 | 2,500e-4 | 0,005132 | 0,01712 | 0,02347 | 0,01530 |
| nDCG@10 medio | 0,6327 | 0,6353 | 0,6342 | 0,6284 | 0,6244 | 0,6256 |
| Uso recomendado | Máxima fidelidad | Equilibrio tamaño/calidad | Compresión moderada | Compresión alta | Menor tamaño, mayor pérdida | Mejor relación calidad/tamaño a 4 bits |

Comparación con modelos de la misma categoría (parámetros, contexto, licencia): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: los tags y la model card declaran únicamente `en`; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Límite estricto de 512 tokens por entrada, incluyendo el prefijo de retrieval y los tokens especiales; los documentos largos deben fragmentarse.
- El prefijo de consulta es obligatorio para retrieval (`"Represent this sentence for searching relevant passages: "`, con espacio final); omitirlo degrada la recuperación.
- La cuantización introduce pérdida medible: Q4_0 tiene un KL medio de 0,02347 nats frente a 2,326e-6 de F16, con caída de nDCG@10 en FiQA2018 (0,5129 frente a 0,5271).
- Riesgo de alucinación no aplica en el sentido generativo (es un encoder), pero los embeddings pueden producir similitudes engañosas en dominios fuera de distribución.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datos en inglés, puede reflejar sesgos de ese corpus.
- Licencia Apache 2.0: permite uso comercial y modificación; no se identifican restricciones adicionales en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados reportados.
- El autor de los builds (tulioranjos) no es MongoDB Research; la calidad del empaquetado GGUF depende de terceros, aunque el autor documenta el proceso de evaluación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tulioranjos/mdbr-leaf-mt-GGUF
- Modelo base: https://huggingface.co/MongoDB/mdbr-leaf-mt
- Configuración del prompt de retrieval (upstream): https://huggingface.co/MongoDB/mdbr-leaf-mt/blob/1ed41b22ce166d66c24f88ebfc340e1f03adb20f/config_sentence_transformers.json
- Checkpoint fijado del modelo base: https://huggingface.co/MongoDB/mdbr-leaf-mt/tree/1ed41b22ce166d66c24f88ebfc340e1f03adb20f
- Paper LEAF (Vujanic y Rückstieß): https://aclanthology.org/2026.acl-long.2008/
