# vivekkopthsd/embeddinggemma-300m-taxrag-ft

## Resumen

`embeddinggemma-300m-taxrag-ft` es un modelo de embeddings densos para recuperación de información (dense retrieval), especializado en el dominio fiscal y financiero de la India. Ha sido desarrollado por el usuario `vivekkopthsd` a partir del modelo base `google/embeddinggemma-300m` (300M parámetros, arquitectura Gemma). El ajuste fino se realizó sobre 29.400 pares de recuperación curados del Income-Tax Act, 2025 y datos financieros generales, con el objetivo de localizar la sección legal exacta que responde a una pregunta de un contribuyente formulada en inglés, hindi (devanagari) o hinglish (mezcla de hindi e inglés).

El modelo está pensado para sistemas RAG (Retrieval-Augmented Generation) sobre documentos fiscales indios. Según los resultados publicados por el autor, alcanza un Recall@5 perfecto (1.000) tanto en inglés como en hindi, y el mejor Recall@1 y MRR@5 de las seis configuraciones evaluadas en su conjunto de validación. Incorpora objetivos de entrenamiento Matryoshka, lo que permite truncar las dimensiones del embedding (768, 512 o 384) para reducir el tamaño del índice sin una pérdida significativa de calidad. Su relevancia actual radica en la necesidad de recuperación multilingüe precisa en un contexto legal donde las consultas suelen mezclar idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma) con capa de pooling para embeddings |
| Parametros totales | 302.863.104 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), hindi (hi) — incluye hinglish (código mezclado) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `google/embeddinggemma-300m`, un encoder de la familia Gemma de Google, adaptado para producir representaciones densas de oraciones. El ajuste fino se realizó con parámetros completos en precisión bf16, utilizando la función de pérdida CachedMNRL (Cached Multiple Negatives Ranking Loss) con hard negatives generados mediante BM25. El entrenamiento usó un batch efectivo de 64, una tasa de aprendizaje de 1e-5, 3 épocas y semilla 7.

Los datos de entrenamiento se organizaron en dos niveles: el primero (Tier 1) contiene 19.440 pares bilingües construidos a partir de cada sección del Income-Tax Act, 2025 en inglés e hindi, con tres paráfrasis de consulta en inglés, tres en hindi y dos en hinglish, emparejadas tanto con el pasaje en inglés como con el hindi (incluyendo alineación cruzada EN→HI y HI→EN). El segundo nivel (Tier 2) añade 10.000 pares muestreados del dataset `BeIR/fiqa` (CC-BY-SA-4.0). Los hard negatives se obtuvieron tomando el pasaje no dorado mejor puntuado por BM25 para cada consulta, lo que fuerza al modelo a distinguir secciones muy similares que difieren en una sola palabra. Además, se aplicaron objetivos Matryoshka para permitir embeddings de menor dimensión (512 y 384) manteniendo la calidad.

## Capacidades

- Recuperación densa de pasajes legales en inglés, hindi (devanagari) y hinglish, con soporte de consultas cruzadas entre idiomas.
- Registro de prompts `query` y `document` para diferenciar la codificación de consultas y documentos, siguiendo el esquema del modelo base.
- Embeddings Matryoshka: se pueden truncar a 512 o 384 dimensiones para reducir el tamaño del índice y acelerar el cálculo de similitud con una pérdida mínima de rendimiento.
- Longitud de secuencia máxima de 2048 tokens, suficiente para pasajes legales extensos.
- Normalización de embeddings para similitud coseno directa.
- Compatible con la librería `sentence-transformers` y con `text-embeddings-inference` (según los tags del repositorio).
- No es un modelo generativo: su salida es un vector de características, no texto.

## Casos de uso

- Asistente fiscal para contribuyentes indios: el modelo recupera la sección exacta del Income-Tax Act, 2025 que responde a una pregunta formulada en lenguaje natural, tanto en inglés como en hindi o hinglish. Puede integrarse en un chatbot que devuelva el texto legal relevante.
- RAG sobre documentación financiera corporativa: indexar informes anuales, circulares del Ministerio de Finanzas o guías tributarias en inglés e hindi, y consultar en cualquiera de los dos idiomas con resultados precisos.
- Búsqueda de jurisprudencia y normativa: dado que el modelo distingue secciones que difieren en una sola palabra, es útil para encontrar referencias normativas exactas en bases de datos legales.
- Atención al cliente en banca y seguros: responder preguntas sobre deducciones, exenciones o procedimientos fiscales usando un corpus de pasajes extraídos de la ley, con soporte para consultas en hinglish, muy común en interacciones informales.
- Sistemas de preguntas y respuestas sobre finanzas personales: el entrenamiento con `BeIR/fiqa` permite recuperar respuestas a preguntas financieras generales, aunque con menor precisión que en el dominio fiscal específico.
- Herramientas de investigación académica en derecho tributario: localizar artículos o secciones relevantes en un corpus bilingüe inglés-hindi para estudios comparativos.
- Indexación de documentos para despachos de abogados: construir un índice semántico de expedientes fiscales históricos y consultarlo mediante preguntas en lenguaje natural, reduciendo el tiempo de búsqueda manual.

## Benchmarks y rendimiento

El autor publicó resultados de evaluación sobre un conjunto de validación de 180 consultas retenidas (100 en inglés, 50 en hindi y 30 en hinglish) contra un corpus bilingüe de 2.474 pasajes. Los resultados se muestran en la siguiente tabla:

| Slice | R@1 | R@5 | MRR@5 |
|---|---|---|---|
| English | 0.990 | 1.000 | 0.995 |
| Hindi | 0.880 | 1.000 | 0.937 |
| Hinglish | 0.400 | 0.533 | 0.447 |
| Aggregate | 0.861 | 0.922 | 0.887 |

Además, se reporta una prueba de generalización sobre el conjunto de test de `BeIR/fiqa`: el modelo alcanza un Recall@5 de 0.653 frente a 0.665 del modelo base, lo que indica una degradación mínima en dominios financieros generales. Estos datos provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- El modelo tiene 302 millones de parámetros y un tamaño de repositorio de 0.6 GB en safetensors. En bf16, el peso ocupa aproximadamente 0.6 GB, por lo que cabe en la mayoría de GPUs de consumo.
- VRAM estimada: para inferencia en bf16 se necesitan unos 1.2 GB (peso + activaciones). Con cuantización a 8 bits podría reducirse a ~0.7 GB, aunque no se han publicado archivos cuantizados.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1650, RTX 3060 o una T4 en la nube. También puede ejecutarse en CPU para pruebas puntuales, aunque con mayor latencia.
- Despliegue: se puede servir mediante `sentence-transformers` en Python, o a través de `text-embeddings-inference` (TEI) según los tags del repositorio. No se menciona soporte para vLLM ni llama.cpp, dado que no es un modelo generativo.
- Latencia y throughput: no hay datos publicados. En una GPU moderna (p.ej. A10G), se espera una latencia por lote de decenas de milisegundos para secuencias de 512 tokens, pero no se dispone de mediciones oficiales.

## Comparativa con modelos similares

La model card no incluye comparaciones con otros modelos de embeddings más allá del propio base. El autor afirma que su modelo supera a las otras seis configuraciones evaluadas en Recall@1 y MRR@5 agregados, pero no detalla cuáles son. La comparación más directa es con el modelo base `google/embeddinggemma-300m`, del cual deriva:

| Modelo | Parámetros | Contexto | Idiomas | Recall@5 (BeIR/fiqa) | Licencia |
|---|---|---|---|---|---|
| embeddinggemma-300m-taxrag-ft | 302M | 2048 | en, hi, hinglish | 0.653 (fiqa test) | Gemma ToU |
| google/embeddinggemma-300m | 302M | 2048 | en, hi, hinglish (multilingüe) | 0.665 (fiqa test) | Gemma ToU |

No se dispone de datos comparativos frente a otros modelos multilingües como `intfloat/multilingual-e5-base` o `BAAI/bge-m3` en el contexto fiscal indio. Por tanto, la comparativa externa se considera no disponible.

## Limitaciones y advertencias

- Dominio específico: el modelo está ajustado para el Income-Tax Act, 2025 y datos financieros generales. Su rendimiento puede degradarse significativamente en otros dominios legales o geográficos (p.ej. sistemas fiscales de otros países).
- Rendimiento desigual en hinglish: el Recall@1 en hinglish es de 0.400, muy inferior al de inglés (0.990) e hindi (0.880). Las consultas muy code-mixed pueden no recuperar el pasaje correcto.
- No constituye asesoramiento legal o financiero: el autor indica explícitamente que es una herramienta educativa. Los resultados de recuperación deben ser revisados por un profesional.
- Sesgos del corpus: el entrenamiento se basa en textos legales indios y en el dataset `BeIR/fiqa`, que puede contener sesgos geográficos o culturales. No se han realizado auditorías de sesgo.
- Riesgo de falsos positivos: a pesar de los hard negatives, secciones legales muy similares pueden confundirse, especialmente en consultas ambiguas o con errores ortográficos.
- Restricciones de licencia: al derivar de un modelo Gemma, se aplican los Gemma Terms of Use de Google, que incluyen restricciones de uso comercial y requisitos de atribución. El dataset `BeIR/fiqa` tiene licencia CC-BY-SA-4.0, lo que puede imponer obligaciones adicionales si se redistribuyen datos derivados.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF o AWQ, lo que limita su despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vivekkopthsd/embeddinggemma-300m-taxrag-ft
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Dataset utilizado: https://huggingface.co/datasets/BeIR/fiqa
- Repositorio de entrenamiento: no se proporciona enlace directo en la model card, pero se mencionan los scripts `build_ft_pairs.py` y `fine_tune_encoder.py` como parte del proceso reproducible.
