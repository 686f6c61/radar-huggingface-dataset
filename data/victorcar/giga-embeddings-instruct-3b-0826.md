# VictorCar/Giga-Embeddings-instruct-3B-0826

## Resumen

Giga-Embeddings-instruct-3B-0826 es un modelo de embeddings de texto publicado en Hugging Face bajo la cuenta VictorCar, que la propia model card presenta como la siguiente iteración de la serie Giga-Embeddings. No es un modelo generativo: es un encoder de frases y pasajes que produce vectores densos de 2048 dimensiones, entrenado con objetivo contrastivo InfoNCE y pensado para retrieval, similitud semántica, clasificación y clustering. Su base es un modelo preentrenado propio con arquitectura Qwen3 (36 capas, hidden 2048, 16 cabezas de atención y 8 cabezas KV, head_dim 128) al que se le ha convertido la self-attention en bidireccional, es decir, estilo encoder.

El modelo tiene 3.150.605.312 parámetros en bfloat16 y un repositorio de 6,3 GB. Su rasgo diferencial frente a otros embeddings multilingües es el soporte fuerte de ruso e inglés y una mejora notable en recuperación de código: según los datos de la model card, pasa de 62,37 a 76,93 en MTEB (code) respecto a la iteración anterior de 3B, y de 55,51 a 63,9 en MTEB multilingual. Se distribuye con licencia MIT, lo que permite uso comercial sin restricciones declaradas, y es compatible con sentence-transformers, transformers y vLLM.

Es relevante ahora porque cubre un hueco concreto: embeddings de calidad alta en ruso con rendimiento competitivo en inglés y código, con un coste de inferencia bajo (3B densos) y un throughput declarado de hasta 91,5k tokens por segundo con vLLM. Frente a la variante mayor de la misma familia (10B-A1.8B), sacrifica entre 0,4 y 1,5 puntos de MTEB a cambio de ejecutarse en hardware mucho más modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 con self-attention bidireccional (encoder-style); 36 capas, hidden 2048, 16 cabezas de atención / 8 cabezas KV, head_dim 128 |
| Parametros totales | 3.150.605.312 (~3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (los benchmarks de throughput llegan hasta 2048 tokens) |
| Tipos de cuantizacion | No se publican pesos cuantizados en el repositorio; los pesos están en bfloat16. Cuantizaciones de terceros: no disponibles |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |
| Dimension del embedding | 2048 |
| Pooling | Mean pooling sobre tokens no de padding + normalización L2 |
| Biblioteca | sentence-transformers |
| Tamano del repositorio | 6,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura parte de un modelo preentrenado propio con estructura Qwen3 y se adapta a codificación de texto convirtiendo la self-attention en bidireccional, lo que permite que cada token atienda a todo el contexto en ambas direcciones en lugar de aplicar la máscara causal típica de los LLM decoder-only. La cabeza de representación no es generativa: la secuencia se resume mediante mean pooling sobre los tokens no de padding y el vector resultante se normaliza con L2, obteniendo un embedding de 2048 dimensiones. La model card insiste en que usar CLS pooling o last-token pooling produce resultados incorrectos, y que la comparación entre vectores debe hacerse por similitud coseno (producto escalar de vectores normalizados).

El entrenamiento es contrastivo con función de pérdida InfoNCE, en un formato instructivo: para tareas asimétricas (retrieval) se antepone una instrucción de una frase al query con el patrón `Instruct: {descripción de la tarea}` seguido de `Query: {texto}`, mientras que los documentos se codifican sin instrucción. Para tareas simétricas (STS, deduplicación) se puede usar una instrucción genérica o ninguna. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO (no disponibles). El autor advierte además que distintas versiones de transformers y PyTorch pueden producir diferencias pequeñas pero no nulas en los resultados reproducidos.

## Capacidades

- Generación de embeddings densos de 2048 dimensiones para frases y pasajes, con pooling y normalización fijados por el entrenamiento.
- Retrieval asimétrico query-documento mediante instrucciones específicas de tarea antepuestas al query.
- Similitud semántica simétrica (STS) y deduplicación de textos, con o sin instrucción genérica.
- Recuperación de código: MTEB (code) de 76,93, la mayor mejora relativa respecto a la iteración anterior de 3B.
- Clasificación de textos y clustering por proximidad coseno en el espacio de embeddings.
- Capacidades multilingües limitadas a ruso e inglés, con MTEB (multilingual) de 63,9.
- Integración con sentence-transformers, con transformers a bajo nivel (aplicando pooling y normalización manualmente) y con vLLM.
- No soporta tool calling ni function calling: es un modelo de representación, no genera texto ni ejecuta razonamiento multi-step.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en bases de conocimiento en ruso: indexar los documentos sin instrucción y consultar con una instrucción de tarea en el query, aprovechando el MTEB (rus) de 74,57 de la familia y el soporte nativo del idioma.
- RAG sobre documentación técnica: usar el modelo como retriever en un pipeline con un LLM generativo, con la ventaja de que el encoder solo consume 3B parámetros y puede convivir en la misma GPU o en una dedicada de gama media.
- Recuperación de código en repositorios internos: el salto en MTEB (code) hasta 76,93 lo hace adecuado para buscar funciones o fragmentos por descripción en lenguaje natural, incluso mezclando consultas en ruso o inglés.
- Deduplicación y near-duplicate detection a escala: para tareas simétricas se pueden codificar ambos conjuntos sin instrucción y filtrar por umbral de similitud coseno, con throughput alto en vLLM.
- Clasificación de tickets y enrutado: generar embeddings de los tickets entrantes y entrenar un clasificador ligero encima, o comparar contra centroides de categorías ya etiquetadas.
- Clustering de corpus para análisis exploratorio: agrupar noticias, reseñas o documentación interna por proximidad en el espacio de 2048 dimensiones antes de etiquetar manualmente.
- Moderación o filtrado semántico: comparar contenido nuevo contra una lista de ejemplos problemáticos representados como embeddings, con coste de inferencia bajo.
- Búsqueda híbrida en atención al cliente: combinar recuperación densa con BM25 para consultas cortas y ruidosas en ruso, usando el modelo como componente denso del ensemble.

## Benchmarks y rendimiento

Resultados de MTEB reportados en la model card del autor:

| Benchmark | 3B anterior | Giga-Embeddings-instruct-3B-0826 | Giga-Embeddings-instruct-10B-A1.8B-0826 |
|---|---|---|---|
| MTEB (rus) | 74,16 | 74,57 | 74,99 |
| MTEB (eng) | 71,07 | 71,93 | 72,23 |
| MTEB (code) | 62,37 | 76,93 | 78,40 |
| MTEB (multilingual) | 55,51 | 63,9 | 65,60 |

Throughput declarado con backend vLLM:

| Modelo / backend | 512 tokens | 1024 tokens | 2048 tokens | Throughput relativo vs 10B-A1.8B |
|---|---|---|---|---|
| Giga-Embeddings-instruct-3B-0826 / vLLM | 87,9k tok/s | 91,5k tok/s | 90,4k tok/s | 0,8x |
| Giga-Embeddings-instruct-10B-A1.8B-0826 / vLLM | 112,6k tok/s | 114,5k tok/s | 102,3k tok/s | 1,0x |

La tabla de throughput de la model card incluye una tercera fila (etiquetada como "Nemo") que aparece truncada en la información disponible, por lo que no se reproducen sus valores.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos bfloat16: en torno a 7 GB para lotes pequeños (6,3 GB de pesos más activaciones y overhead del runtime). En fp32 serían aproximadamente 12,6 GB.
- Cuantizaciones estimadas por aritmética de parámetros, no publicadas por el autor: int8 en torno a 3,2 GB e int4 en torno a 1,6 GB, sujetas a la pérdida de calidad que introduzca la cuantización.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, RTX 4070, 4080 o 4090 pueden ejecutarlo en bfloat16 con lotes moderados.
- GPU de datacenter recomendadas para servicio en producción: L4, A10G, A100 y H100, especialmente si se busca exprimir el throughput medido con vLLM.
- Opciones de despliegue confirmadas en la información disponible: sentence-transformers, transformers (con mean pooling y normalización L2 manuales) y vLLM. El repositorio está marcado como compatible con endpoints.
- Throughput medido con vLLM: 87,9k tokens/s a 512 tokens, 91,5k tokens/s a 1024 tokens y 90,4k tokens/s a 2048 tokens, aproximadamente 0,8x el de la variante 10B-A1.8B.
- Latencia por petición: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTEB rus | MTEB eng | MTEB code | MTEB multi | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Giga-Embeddings-instruct-3B-0826 | 3,15B densos | No disponible | 74,57 | 71,93 | 76,93 | 63,9 | MIT | Repositorio Hugging Face |
| Giga-Embeddings 3B (iteración anterior, según la model card) | ~3B densos | No disponible | 74,16 | 71,07 | 62,37 | 55,51 | No disponible | No disponible en esta información |
| Giga-Embeddings-instruct-10B-A1.8B-0826 | ~10B totales / 1,8B activos (nomenclatura) | No disponible | 74,99 | 72,23 | 78,40 | 65,60 | No disponible | No disponible en esta información |

La información proporcionada no incluye datos de otros modelos de embeddings comparables (por ejemplo, familias tipo E5, BGE o Qwen3-Embedding), por lo que no se pueden contrastar cifras con ellos: no disponible.

## Limitaciones y advertencias

- Idiomas: solo ruso e inglés declarados. El uso en castellano u otros idiomas no está respaldado por la model card y degradará la calidad de recuperación.
- Pooling obligatorio: usar CLS o last-token pooling produce resultados incorrectos. Es un error frecuente al integrar el modelo con transformers directamente.
- Instrucciones asimétricas: en retrieval hay que anteponer instrucción al query y no al documento. Invertir el orden o instruir ambos lados degrada los resultados, y no existe un prompt único "correcto": hay que elegirlo por tarea.
- Reproducibilidad: el propio autor advierte de diferencias pequeñas pero no nulas según las versiones de transformers y PyTorch.
- Alucinación: al ser un modelo de representación no genera texto, por lo que no alucina directamente; el riesgo se traslada al LLM que consuma los resultados del retrieval.
- Sesgos: la model card no documenta análisis de sesgos ni composición del corpus de entrenamiento, por lo que no se puede evaluar su comportamiento en dominios sensibles.
- Longitud de contexto: no declarada. Los benchmarks solo llegan a 2048 tokens, de modo que el comportamiento con pasajes más largos no está verificado.
- Licencia MIT: permite uso comercial y modificación sin restricciones declaradas, pero conviene verificar la procedencia de los pesos, ya que el repositorio lo publica un autor individual (VictorCar) y no una organización verificada.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, con una única revisión, lo que implica ausencia de validación comunitaria independiente.
- Requiere código personalizado (etiqueta custom_code), lo que puede complicar la carga en runtimes que no permitan ejecutar módulos remotos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VictorCar/Giga-Embeddings-instruct-3B-0826
- Referencia arXiv indicada en las etiquetas del repositorio: https://arxiv.org/abs/2608.23806
- Búsqueda web: no se han encontrado enlaces relevantes al modelo (papers, blogs, repos o demos) en los resultados de búsqueda disponibles.
