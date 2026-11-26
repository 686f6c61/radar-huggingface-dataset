# speakleash/Bielik-SPLADE-50M-v1.0

## Resumen

Bielik-SPLADE-50M-v1.0 es un modelo de recuperación de información dispersa (sparse retrieval) basado en la arquitectura SPLADE, desarrollado por SpeakLeash para el idioma polaco. Con aproximadamente 49,9 millones de parámetros, es una versión destilada del modelo completo Bielik-SPLADE-82M-v1.0 de la misma colección, y comparte con él tokenizador y vocabulario de 50.001 términos, de modo que sus vectores viven en el mismo espacio vectorial. El modelo se distribuye a través de la librería sentence-transformers y se usa mediante la clase `SparseEncoder`.

El problema que resuelve es la recuperación léxica eficiente en polaco: genera representaciones dispersas de documentos y consultas que permiten búsqueda por producto escalar sobre índices invertidos, con un coste de índice notablemente inferior al de alternativas como `sdadas/polish-splade`. En las 32 tareas públicas de PIRB (Polski Information Retrieval Benchmark) alcanza un nDCG@10 medio de 53,81, frente a 55,01 del modelo completo de 82M, 51,34 de `sdadas/polish-splade` y 40,32 de BM25.

Su relevancia actual radica en la relación calidad-coste: reduce un 39 % los parámetros y un 55 % las multiplicaciones por token respecto al modelo de 82M, con una merma de calidad de poco más de un punto de nDCG@10. Además, al compartir espacio vectorial con el modelo grande, permite construir el índice con el de 82M y codificar solo las consultas con este de 50M, lo que abarata la latencia en tiempo de búsqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ALBERT (transformer) con cabecera SPLADE de enmascaramiento de lenguaje (MLM) |
| Parametros totales | 49.862.306 (49,9M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512 tokens de entrada |
| Tipos de cuantizacion | exportación int8 ONNX disponible en repositorio separado; fp32 en PyTorch |
| Idiomas soportados | polaco (pl) |
| Licencia | gemma |
| Formato de pesos | safetensors (repo principal), ONNX int8 (repo separado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ALBERT, una variante de transformer con compartición de parámetros entre capas, adaptada como codificador disperso SPLADE. La capa de salida MLM opera en 256 dimensiones en lugar de las 768 del modelo de 82M, y las capas feed-forward tienen la mitad de anchura. El pooling SPLADE se aplica sobre el vocabulario completo de 50.001 términos, lo que produce vectores dispersos de documento y de consulta. El modelo se ha obtenido por destilación de conocimiento (knowledge distillation) a partir de Bielik-SPLADE-82M-v1.0, que actúa como profesor; no se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset.

Una innovación destacable es la interoperabilidad dentro de la colección: todos los modelos comparten tokenizador y vocabulario, lo que permite combinar índice y consulta entre modelos distintos (por ejemplo, indexar con el de 82M y consultar con el de 50M, o usar el codificador estático de consultas sobre el índice de este modelo). No se menciona en la información disponible el uso de RLHF o DPO, algo esperable en un modelo de recuperación y no de generación.

## Capacidades

- Generación de representaciones dispersas (sparse embeddings) para documentos y consultas en polaco.
- Recuperación de información mediante producto escalar sobre índices invertidos.
- Codificación de consultas sin prefijo especial, con entradas de hasta 512 tokens.
- Interoperabilidad vectorial con Bielik-SPLADE-82M-v1.0 y con el codificador estático de consultas de la colección.
- Extracción de características (pipeline `feature-extraction`) integrada en sentence-transformers >= 5.0, sin necesidad de `trust_remote_code`.
- Exportación int8 ONNX para inferencia optimizada en CPU.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre: es un codificador de recuperación, no un modelo generativo.

## Casos de uso

- Motor de búsqueda documental en polaco: indexar corpus con representaciones dispersas y recuperar por producto escalar, aprovechando el bajo coste de índice (346,4 dimensiones por documento) frente a alternativas.
- Búsqueda en bases de conocimiento legales o administrativas: el ejemplo de la model card (consulta sobre cómo desgravar pérdidas de inversión en el PIT) ilustra la recuperación sobre textos fiscales polacos.
- Atención al cliente con recuperación aumentada (RAG): usar el modelo como recuperador en un pipeline RAG en polaco, codificando las consultas de los usuarios y recuperando pasajes relevantes de la base documental.
- Despliegue en CPU de bajo coste: con tiempos de consulta de 16,0 ms en PyTorch fp32 y 2,2 ms en ONNX int8 (6 hilos, Ryzen 5 5600X), es adecuado para servicios de búsqueda sin GPU.
- Arquitectura de dos niveles con el modelo de 82M: construir el índice una sola vez con el modelo completo y codificar consultas en tiempo real con este modelo de 50M, obteniendo mayor calidad que con el de 50M solo y menor latencia que con el de 82M.
- Filtrado y deduplicación de grandes corpus polacos: la codificación dispersa permite comparar documentos por similitud de forma eficiente sobre índices invertidos.
- Búsqueda sobre el índice de este modelo con el codificador estático de consultas: escenario de latencia mínima en el que las consultas se codifican sin pasar por el transformer.

## Benchmarks y rendimiento

Resultados de nDCG@10 medio sobre las 32 tareas públicas de PIRB (41 tareas totales; las 9 del grupo Web Datasets no son públicas):

| Modelo | nDCG@10 medio (32 tareas PIRB) | Dimensiones por documento | Postings por consulta |
|---|---|---|---|
| Bielik-SPLADE-82M | 55,01 | no disponible | 13.945 |
| Bielik-SPLADE-50M | 53,81 | 346,4 | 12.725 |
| Bielik-SPLADE-static sobre índice 82M | 52,37 | no disponible | 9.046 |
| sdadas/polish-splade | 51,34 | 424,5 | 16.807 |
| BM25 | 40,32 | no disponible | no disponible |

Coste de inferencia relativo al modelo de 82M (= 100 %), en un hilo de CPU: parámetros 61 %, multiplicaciones por token 45 %, tiempo de consulta PyTorch fp32 52 %, tiempo de consulta ONNX int8 57 %, tiempo de pasaje PyTorch fp32 58 %, tiempo de pasaje ONNX int8 56 %.

Tiempos absolutos en AMD Ryzen 5 5600X (mediana, batch 1): consulta en 16,0 ms con 6 hilos en PyTorch fp32 y 2,2 ms con ONNX int8; con un hilo, 23,8 ms y 6,1 ms respectivamente.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de 49,9M de parámetros ocupa aproximadamente 0,2 GB en fp32 (el repositorio completo pesa 0,2 GB); en int8 ONNX, alrededor de 0,05 GB.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (RTX 4090, RTX 3060, etc.) puede ejecutarlo con holgura, pero el diseño está orientado a CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: sentence-transformers >= 5.0 (PyTorch fp32), ONNX Runtime con la exportación int8 del repositorio separado; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: consulta de 16,0 ms (PyTorch fp32, 6 hilos) y 2,2 ms (ONNX int8, 6 hilos) en Ryzen 5 5600X; en un hilo, 23,8 ms y 6,1 ms. No se proporcionan cifras de throughput por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG@10 (32 tareas PIRB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-SPLADE-50M-v1.0 | 49,9M | 512 tokens | 53,81 | gemma | Hugging Face (speakleash) |
| Bielik-SPLADE-82M-v1.0 | 82,0M | 512 tokens | 55,01 | no disponible en la información | Hugging Face (speakleash) |
| sdadas/polish-splade | no disponible | no disponible | 51,34 | no disponible en la información | Hugging Face (sdadas) |
| BM25 (pyserini) | no aplica | no aplica | 40,32 | no aplica | pyserini |

## Limitaciones y advertencias

- Solo soporta polaco; no está entrenado ni evaluado para otros idiomas.
- Es un codificador de recuperación, no un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- Ventana de entrada limitada a 512 tokens; documentos más largos deben fragmentarse.
- Los resultados de la model card cubren solo 32 de las 41 tareas de PIRB y no son comparables con las medias de 41 tareas del leaderboard oficial.
- Licencia "gemma": deben revisarse los términos de la licencia Gemma para uso comercial y redistribución antes de desplegarlo en producción.
- Riesgo de sesgos y de recuperación deficiente en dominios alejados de los datos de entrenamiento; no se documentan en la información disponible los sesgos conocidos ni la composición del corpus de entrenamiento.
- La calidad combinada con el modelo de 82M es superior, pero implica asumir el coste de índice del modelo grande.
- No se han publicado datos sobre alucinación (no aplica a un recuperador) ni sobre robustez ante consultas adversariales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-SPLADE-50M-v1.0
- Modelo completo de 82M: https://huggingface.co/speakleash/Bielik-SPLADE-82M-v1.0
- Codificador estático de consultas: https://huggingface.co/speakleash/Bielik-SPLADE-static-v1.0
- Exportación int8 ONNX: https://huggingface.co/speakleash/Bielik-SPLADE-50M-v1.0-ONNX-INT8
- Colección Bielik-SPLADE v1.0: https://huggingface.co/collections/speakleash/bielik-splade-v10
- Modelo comparable sdadas/polish-splade: https://huggingface.co/sdadas/polish-splade
