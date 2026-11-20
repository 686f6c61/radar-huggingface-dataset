# volantis-labs/multilingual-e5-small

## Resumen

`volantis-labs/multilingual-e5-small` es un espejo (mirror) del modelo `intfloat/multilingual-e5-small` publicado por Microsoft Research. No se trata de un modelo nuevo ni de un fine-tuning: el autor declara explícitamente que es una copia sin cambios de tres ficheros del repositorio original (el peso ONNX cuantizado `model_qint8_avx512_vnni.onnx`, el `tokenizer.json` y el `config.json`), fijados a la revisión `614241f622f53c4eeff9890bdc4f31cfecc418b3`. Su función es mantener descargas reproducibles para la aplicación Moxie, evitando que una revisión upstream desaparezca o cambie.

El modelo subyacente es un encoder BERT multilingüe de la familia E5 ("EmbEddings from bidirEctional Encoder rEpresentations"), diseñado para generar embeddings de frases y pasajes. La variante `small` emplea 12 capas y 118 millones de parámetros, con una longitud de contexto de 512 tokens, y está entrenada con objetivos de recuperación contrastiva sobre corpus multilingües. Es relevante porque ofrece embeddings de alta calidad para búsqueda semántica y RAG en más de 90 idiomas con un coste computacional bajo.

La ficha describe el modelo tal como se distribuye en este repositorio: pesos ONNX cuantizados a int8 con instrucciones AVX-512 VNNI, licencia MIT y un tamaño de repositorio de 0,1 GB. Cualquier dato no presente en la información disponible se marca como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (familia E5) |
| Parámetros totales | 118 millones (modelo base `multilingual-e5-small`) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | int8 (fichero `model_qint8_avx512_vnni.onnx`); otras cuantizaciones no disponibles en este repositorio |
| Idiomas soportados | multilingüe (más de 90 idiomas según el modelo original; lista exacta no disponible) |
| Licencia | MIT |
| Formato de pesos | ONNX (int8); también `tokenizer.json` y `config.json` |
| Dimensión del embedding | 384 (modelo base `multilingual-e5-small`) |
| Tamaño del repositorio | 0,1 GB |
| Librería | onnx |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional de tipo BERT con 12 capas, dimensión oculta de 384 y 118 millones de parámetros, correspondiente a la variante `small` de la familia E5. El modelo produce un vector de 384 dimensiones por texto de entrada, pensado para similitud semántica y recuperación. El repositorio solo incluye el grafo ONNX cuantizado a int8 con optimización para AVX-512 VNNI, por lo que la inferencia se realiza mediante ONNX Runtime sobre CPU.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO, técnicas de minería de negativos) no están documentados en la información disponible de este repositorio. El modelo original de intfloat/Microsoft emplea entrenamiento contrastivo con prefijos `query:` y `passage:` para tareas de recuperación, pero esta ficha no puede confirmar los hiperparámetros exactos sin la model card upstream.

## Capacidades

- Generación de embeddings de frases y pasajes de 384 dimensiones para similitud semántica.
- Recuperación de información (retrieval) multilingüe y cross-lingual: consulta en un idioma, documento en otro.
- Búsqueda semántica densa sobre corpus de hasta 512 tokens por fragmento.
- Clustering y deduplicación de textos por similitud coseno.
- Clasificación de textos mediante embeddings como features (zero-shot con prototipos o fine-tuning ligero).
- Soporte de prefijos `query:` y `passage:` heredado del modelo E5 original (no confirmado en la model card de este mirror).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un encoder, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en aplicaciones multilingües: indexar documentos con el prefijo `passage:` y consultar con `query:` permite recuperar fragmentos relevantes en cualquiera de los idiomas soportados sin mantener índices por idioma. El contexto de 512 tokens encaja con chunks de párrafo.
- RAG (retrieval-augmented generation): actuar como retriever en pipelines que alimentan a un LLM generativo. Su tamaño de 118 M parámetros y su peso int8 permiten ejecutarlo en CPU junto al generador, reduciendo la VRAM necesaria para el componente de recuperación.
- Deduplicación de catálogos y datasets: calcular embeddings de cada registro y agrupar por umbral de similitud coseno. La cuantización int8 mantiene la calidad suficiente para esta tarea con un coste de memoria de aproximadamente 120 MB.
- Moderación y clasificación de contenido: usar los embeddings como entrada a un clasificador lineal entrenado con pocos ejemplos por categoría, aprovechando el soporte multilingüe para no entrenar un modelo por idioma.
- Búsqueda interna en documentación técnica: desplegar el modelo ONNX en un servicio de CPU con ONNX Runtime y servir consultas con latencia baja, sin GPU dedicada.
- Enrutamiento de consultas en asistentes: clasificar la intención del usuario comparando el embedding de la consulta con prototipos de cada intención, útil como primer paso antes de invocar un LLM mayor.
- Análisis de similitud entre soportes y tickets: agrupar incidencias de atención al cliente por temática en un helpdesk multilingüe para priorizar y asignar colas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio es un mirror y no incluye métricas de MMLU, MTEB, BEIR ni de recuperación. Para resultados del modelo base debe consultarse la documentación de `intfloat/multilingual-e5-small`, que no forma parte de la información proporcionada.

## Requisitos de hardware

- VRAM: no requiere GPU. El peso int8 ocupa aproximadamente 120 MB; con el tokenizer y el runtime, el consumo de RAM es inferior a 500 MB.
- GPU recomendadas: no aplica para el fichero ONNX int8 incluido; está optimizado para CPU con AVX-512 VNNI. Para GPU habría que exportar los pesos originales en fp32/fp16 desde el repositorio upstream (no incluidos aquí).
- CPU: se recomienda un procesador con soporte AVX-512 VNNI (Intel Ice Lake o posterior, Xeon Scalable de 3.ª generación en adelante) para aprovechar la cuantización incluida. En CPUs sin AVX-512 VNNI, ONNX Runtime puede ejecutar el grafo con kernels de fallback, con menor throughput.
- Cabe en cualquier equipo consumer: portátiles, Raspberry Pi (con rendimiento reducido) y contenedores pequeños.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), servidores de embeddings sobre ONNX, o exportación a otros formatos desde el repositorio upstream (no incluida en este mirror).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Licencia | Formato en este repo |
|---|---|---|---|---|---|
| volantis-labs/multilingual-e5-small (este) | 118 M | 512 | 384 | MIT | ONNX int8 |
| intfloat/multilingual-e5-base | 278 M | 512 | 768 | MIT | safetensors, ONNX (upstream) |
| intfloat/multilingual-e5-large | 560 M | 512 | 1024 | MIT | safetensors, ONNX (upstream) |
| BAAI/bge-m3 | 568 M | 8192 | 1024 | MIT | safetensors |

La comparativa se limita a parámetros, contexto, dimensión y licencia; no se dispone de métricas de rendimiento en la información proporcionada. `multilingual-e5-small` es la opción de menor coste de la familia E5, adecuada cuando el presupuesto de CPU o memoria es restrictivo.

## Limitaciones y advertencias

- Es un mirror, no un modelo propio: no hay garantía de mantenimiento ni de actualizaciones por parte de `volantis-labs`; la fuente de verdad es `intfloat/multilingual-e5-small`.
- Solo incluye el fichero ONNX int8 con AVX-512 VNNI; no hay pesos fp32, fp16 ni safetensors en este repositorio, lo que limita su uso en GPU sin recurrir al upstream.
- Contexto máximo de 512 tokens: los documentos más largos deben fragmentarse, con el riesgo de perder contexto entre chunks.
- Es un encoder de embeddings: no genera texto, no razona y no soporta tool calling. No debe evaluarse como un LLM.
- Riesgo de sesgos heredados del corpus de entrenamiento original (no documentado en este repositorio); puede reflejar estereotipos de género, culturales o geográficos en los espacios de embedding.
- Los embeddings pueden producir falsos positivos en similitud semántica; se recomienda validar umbrales con datos propios antes de producción.
- Licencia MIT: permite uso comercial y modificación, pero requiere conservar el aviso de copyright. Verificar la licencia del modelo upstream por si cambia.
- Sin métricas publicadas en este repositorio: no se puede afirmar su calidad en tareas concretas sin evaluarla contra el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/volantis-labs/multilingual-e5-small
- Modelo original: https://huggingface.co/intfloat/multilingual-e5-small
- Revisión fijada: https://huggingface.co/intfloat/multilingual-e5-small/tree/614241f622f53c4eeff9890bdc4f31cfecc418b3
- Paper E5 (Microsoft Research): no disponible en la información proporcionada
- Repositorio de código de E5: no disponible en la información proporcionada
