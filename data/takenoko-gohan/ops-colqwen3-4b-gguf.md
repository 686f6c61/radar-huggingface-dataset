# takenoko-gohan/Ops-Colqwen3-4B-GGUF

## Resumen

Ops-Colqwen3-4B es un modelo de embeddings multimodales de recuperación de documentos visuales, desarrollado por el equipo OpenSearch-AI de Alibaba Cloud. Este repositorio concreto (`takenoko-gohan/Ops-Colqwen3-4B-GGUF`) es una conversión a formato GGUF del modelo original, pensada para facilitar su uso en entornos de inferencia ligera como `llama.cpp` u Ollama. El modelo se basa en la arquitectura Qwen3-VL-4B-Instruct y adopta el diseño ColPali de interacción tardía, generando múltiples vectores por entrada (texto o imagen) que se comparan mediante MaxSim para lograr una alineación semántica fina entre consultas y documentos visuales.

Con aproximadamente 4,4 mil millones de parámetros, el modelo soporta una ventana de contexto de hasta 32.000 tokens y hasta 1.280 tokens visuales por página, lo que lo hace adecuado para la recuperación de documentos PDF, imágenes y contenido escaneado. Destaca por su naturaleza multilingüe (más de 30 idiomas) y por ofrecer dimensiones de embedding escalables hasta 2.560, lo que permite ajustar el equilibrio entre precisión y coste computacional. En los benchmarks Vidore v1–v3, alcanza resultados de vanguardia entre los modelos de su tamaño, superando a alternativas como `tomoro-colqwen3-embed-4b` o `SauerkrautLM-ColQwen3-4b-v0.1`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B-Instruct con head de embeddings multi-vector estilo ColPali (interacción tardía) |
| Parametros totales | 4.444.371.968 (4,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | No disponible (repositorio GGUF; se esperan cuantizaciones estándar como Q4_K_M, Q5_K_M, etc., pero no se especifican) |
| Idiomas soportados | Más de 30 idiomas (según model card del autor original) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión del original en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-VL-4B-Instruct, un transformer multimodal con codificador de visión y módulo de atención de última generación. Sobre esta base, se añade un head de embeddings multi-vector estilo ColPali: cada token de entrada (texto o imagen) se proyecta a un espacio de embeddings independiente, y la similitud entre una consulta y un documento se calcula mediante MaxSim, es decir, sumando los máximos de similitud por fila entre los vectores de la consulta y los del documento. Este diseño permite una comparación más granular que los embeddings de vector único, mejorando la precisión en tareas de recuperación visual.

El entrenamiento sigue una estrategia multi-etapa que combina grandes conjuntos de datos de recuperación basados en texto con datos diversos de documentos visuales (páginas PDF, capturas de pantalla, imágenes). Esta hibridación refuerza la capacidad del modelo para comprender y recuperar contenido complejo en formatos mixtos. El modelo soporta dimensiones de embedding escalables: aunque el head proyecta a 2.560 dimensiones durante la inferencia, también es posible utilizar prefijos de menor dimensión (128, 320, 640, etc.) sin degradar significativamente el rendimiento, lo que resulta útil en entornos con restricciones de memoria o latencia.

## Capacidades

- Recuperación visual de documentos: dado un texto de consulta, encuentra las páginas o imágenes más relevantes de un corpus de PDFs o capturas.
- Embeddings multi-vector: genera múltiples vectores por entrada, permitiendo una comparación semántica fina mediante MaxSim.
- Multilingüe: cubre más de 30 idiomas, incluyendo lenguas europeas, asiáticas y otras.
- Dimensiones de embedding escalables: desde 128 hasta 2.560, con degradación mínima de rendimiento en las versiones reducidas.
- Soporte de entrada multimodal: acepta tanto texto como imágenes (incluyendo páginas completas de documentos).
- Integración con herramientas de recuperación: compatible con bibliotecas como `transformers` y `qwen-vl-utils`, y con motores de inferencia como vLLM (para el modelo original safetensors).
- No es un modelo generativo: se centra exclusivamente en la generación de embeddings para recuperación, no en la generación de texto.

## Casos de uso

- Búsqueda semántica en archivos PDF: permite indexar bibliotecas de documentos técnicos, contratos o informes y recuperar las páginas relevantes a partir de consultas en lenguaje natural. El modelo procesa cada página como una imagen y genera embeddings que se comparan con la consulta.
- Recuperación de información en bases de conocimiento visuales: útil para motores de búsqueda internos que manejan capturas de pantalla, diagramas o infografías. Gracias a su contexto de 32.000 tokens y 1.280 tokens visuales, puede manejar páginas con mucho contenido.
- Asistentes de atención al cliente con documentos: en un chatbot que deba consultar manuales o FAQs en formato PDF, el modelo puede recuperar la sección exacta que responde a la pregunta del usuario, alimentando después un modelo generativo para redactar la respuesta.
- RAG multimodal: como componente de recuperación en un pipeline de generación aumentada, donde las imágenes o páginas recuperadas se pasan a un modelo de lenguaje multimodal para generar respuestas contextualizadas.
- Archivado y organización de documentos escaneados: clasifica y recupera documentos históricos digitalizados, permitiendo búsquedas por contenido en lugar de por metadatos.
- Verificación de cumplimiento normativo: en sectores regulados, ayuda a localizar rápidamente cláusulas o requisitos específicos en grandes volúmenes de normativa publicada en PDF.

## Benchmarks y rendimiento

Los resultados publicados por el autor original (OpenSearch-AI) en los benchmarks Vidore v1, v2 y v3 se muestran a continuación. Se comparan varios modelos de recuperación visual de documentos, todos con la misma metodología (NDCG@5 para v1+v2 y NDCG@10 para v3).

**Vidore v1 + v2 (NDCG@5)**

| Modelo | Dim | Vidore v1+v2 | Vidore v2 | Vidore v1 |
|---|---|---|---|---|
| **Ops-Colqwen3-4B** | 2560 | **84.87** | **68.7** | **91.4** |
| **Ops-Colqwen3-4B** | 1280 | 84.71 | 68.2 | 91.3 |
| **Ops-Colqwen3-4B** | 640 | 84.39 | 67.7 | 91.1 |
| **Ops-Colqwen3-4B** | 320 | 84.12 | 67.0 | 91.0 |
| **Ops-Colqwen3-4B** | 128 | 84.04 | 66.9 | 90.9 |
| tomoro-colqwen3-embed-8b | 320 | 83.52 | 65.4 | 90.8 |
| EvoQwen2.5-VL-Retriever-7B-v1 | 128 | 83.41 | 65.2 | 90.7 |
| tomoro-colqwen3-embed-4b | 320 | 83.18 | 64.7 | 90.6 |
| llama-nemoretriever-colembed-3b-v1 | 3072 | 83.10 | 63.3 | 91.0 |
| SauerkrautLM-ColQwen3-8b-v0.1 | 128 | 82.91 | 62.5 | 91.1 |
| EvoQwen2.5-VL-Retriever-3B-v1 | 128 | 82.76 | 63.0 | 90.7 |
| SauerkrautLM-ColQwen3-4b-v0.1 | 128 | 81.97 | 59.9 | 90.8 |
| jina-embedding-v4 | 128 | 81.17 | 58.2 | 90.4 |

**Vidore v3 (NDCG@10)**

| Modelo | Dim | PUB AVG |
|---|---|---|
| **Ops-Colqwen3-4B** | 2560 | 61.27 |
| **Ops-Colqwen3-4B** | 1280 | **61.32** |
| **Ops-Colqwen3-4B** | 640 | 61.21 |
| **Ops-Colqwen3-4B** | 320 | 60.88 |
| **Ops-Colqwen3-4B** | 128 | 60.23 |
| tomoro-colqwen3-embed-4b | 320 | 60.19 |
| SauerkrautLM-ColQwen3-8b-v0.1 | 128 | 58.55 |
| jina-embedding-v4 | 128 | 57.54 |
| llama-nemoretriever-colembed-3b-v1 | 3072 | 57.07 |
| SauerkrautLM-ColQwen3-4b-v0.1 | 128 | 56.03 |

El modelo original alcanza los mejores resultados en Vidore v1+v2 con 2.560 dimensiones, y en Vidore v3 con 1.280 dimensiones. Incluso con solo 128 dimensiones, supera a otros modelos de 4B como `tomoro-colqwen3-embed-4b` con 320 dimensiones, lo que lo hace atractivo para aplicaciones con restricciones de memoria.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 4,4B parámetros, en formato GGUF con cuantización de 4 bits (Q4_K_M) ocuparía aproximadamente 2,5-3 GB, y con 8 bits (Q8_0) alrededor de 4,5-5 GB. No se dispone de datos exactos para este repositorio específico.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM puede ejecutar la versión cuantizada a 4 bits (por ejemplo, RTX 2060, RTX 3060, GTX 1660 Super). Para la versión completa en safetensors, se recomienda al menos 12 GB de VRAM (RTX 3060 12GB, RTX 4070, etc.).
- Compatibilidad con consumer GPU: sí, gracias al formato GGUF, que permite ejecutarlo en CPU y GPU mediante `llama.cpp`, Ollama o similares. En CPU, la inferencia será más lenta pero viable para tareas de recuperación por lotes.
- Opciones de despliegue: `llama.cpp` (para GGUF), Ollama (si se registra el modelo), o el código original con `transformers` y `qwen-vl-utils` para la versión safetensors. También es compatible con vLLM para el modelo original, aunque no se indica soporte específico para la versión GGUF.
- Latencia y throughput: no se han publicado cifras concretas para este modelo. Como referencia, un modelo de 4B en GGUF Q4 puede procesar entre 20 y 50 tokens por segundo en una GPU consumer media, pero la generación de embeddings por página de imagen dependerá del número de tokens visuales (hasta 1.280).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dim. máx. | Vidore v1+v2 (mejor dim) | Licencia |
|---|---|---|---|---|---|
| **Ops-Colqwen3-4B** | 4,4B | 32k | 2560 | 84.87 | Apache 2.0 |
| tomoro-colqwen3-embed-4b | 4B | 32k | 320 | 83.18 | Apache 2.0 |
| SauerkrautLM-ColQwen3-4b-v0.1 | 4B | 32k | 128 | 81.97 | Apache 2.0 |
| llama-nemoretriever-colembed-3b-v1 | 3B | 32k | 3072 | 83.10 | Apache 2.0 |

Ops-Colqwen3-4B supera a todos los modelos de su categoría en los benchmarks Vidore, incluso con dimensiones de embedding reducidas. Su principal ventaja es la combinación de tamaño compacto (4,4B) con dimensiones escalables hasta 2.560, algo poco común en modelos de este tamaño. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Limitaciones y advertencias

- Sesgos: al estar entrenado principalmente con datos de recuperación de documentos, puede presentar sesgos derivados de los corpus utilizados (por ejemplo, dominios técnicos o geográficos). No se dispone de estudios específicos de sesgo para este modelo.
- Alucinación: no aplica al ser un modelo de embeddings, no generativo. Sin embargo, la calidad de la recuperación depende de la representación visual de los documentos; documentos con baja calidad de escaneo o fuentes poco comunes pueden degradar el rendimiento.
- Limitaciones de contexto: aunque soporta 32.000 tokens, el número de tokens visuales por página está limitado a 1.280. Páginas extremadamente densas pueden truncarse, perdiendo información relevante.
- Idiomas: aunque cubre más de 30 idiomas, no se especifica cuáles ni el rendimiento relativo entre ellos. Es probable que el inglés y el chino tengan mejor soporte que lenguas minoritarias.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero requiere atribución y no ofrece garantías. No hay restricciones de uso militar o de vigilancia.
- Advertencia para producción: este repositorio GGUF es una conversión de terceros (autor `takenoko-gohan`) y no está oficialmente mantenido por el equipo original. Antes de usarlo en producción, se recomienda verificar la integridad de los pesos y comparar resultados con la versión safetensors original.

## Enlaces

- Repositorio GGUF: [takenoko-gohan/Ops-Colqwen3-4B-GGUF](https://huggingface.co/takenoko-gohan/Ops-Colqwen3-4B-GGUF)
- Modelo original: [OpenSearch-AI/Ops-Colqwen3-4B](https://huggingface.co/OpenSearch-AI/Ops-Colqwen3-4B)
- Documentación de ColQwen3 en vLLM: [https://docs.vllm.ai/en/latest/api/vllm/model_executor/models/colqwen3/](https://docs.vllm.ai/en/latest/api/vllm/model_executor/models/colqwen3/)
- Implementación en MTEB: [https://github.com/embeddings-benchmark/mteb/blob/main/mteb/models/model_implementations/ops_colqwen3_models.py](https://github.com/embeddings-benchmark/mteb/blob/main/mteb/models/model_implementations/ops_colqwen3_models.py)
