# xCloudinfo/xVITA-Rerank-300M-zhTW-GGUF

## Resumen

xVITA-Rerank-300M-zhTW-GGUF es un modelo de reordenamiento (cross-encoder reranker) desarrollado por xCloudinfo (云碩科技), una empresa tecnológica de Taiwán. El modelo está diseñado para la segunda fase de un pipeline de Retrieval-Augmented Generation (RAG): después de que un modelo de embeddings recupera candidatos, este reranker examina cada par (consulta, documento) y reasigna las puntuaciones para colocar los pasajes realmente relevantes en las primeras posiciones. Está especializado en chino tradicional (zh-TW), con un enfoque en dominios como medicina, legislación taiwanesa y derecho marítimo.

El modelo se basa en jhu-clsp/mmBERT-base, un modelo de la familia ModernBERT desarrollado por la Universidad Johns Hopkins, que utiliza una arquitectura transformer bidireccional. Con 307,5 millones de parámetros y una ventana de contexto de 8192 tokens, el modelo se distribuye exclusivamente en formato GGUF cuantizado para su despliegue con llama.cpp. La versión completa en safetensors no está disponible públicamente; solo se publican los pesos cuantizados en GGUF. El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su enfoque práctico para la segunda etapa de recuperación en sistemas RAG en chino tradicional, un área con escasez de modelos especializados. La cuantización GGUF permite su despliegue en hardware modesto, y el autor proporciona una verificación detallada del impacto de la cuantización en la calidad de la ordenación, lo que es poco común y valioso para la evaluación técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en mmBERT (ModernBERT, Transformer bidireccional) |
| Parametros totales | 307.531.009 (391,5 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | f16, Q8_0, Q4_K_M |
| Idiomas soportados | chino tradicional (zh-TW), chino, multilingue |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en mmBERT-base de jhu-clsp, que es una variante de la arquitectura ModernBERT. ModernBERT es un Transformer bidireccional optimizado para eficiencia, con mejoras en la atención y en la capa de normalización, y soporta secuencias largas. El modelo utiliza el vocabulario SentencePiece de 256k tokens de Gemma-2, lo que requiere una versión reciente de llama.cpp (posterior a agosto de 2026) para cargar correctamente el vocabulario.

El entrenamiento se realizó con datos propios de xCloudinfo: 252.849 pares (consulta, documento) de tres dominios combinados (medicina, conocimiento general taiwanés y derecho marítimo), de los cuales se muestrearon 60.000 pares para el entrenamiento final. Los ejemplos negativos difíciles se extrajeron mediante el modelo de embeddings xVITA-Embed-300M-zhTW, seleccionando los documentos clasificados entre la posición 2 y 60 para cada consulta, con 7 negativos por consulta.

Los resultados reportados en la evaluación interna muestran una mejora significativa en hit@1 en los tres dominios evaluados (500 preguntas por dominio, pool de ~30.000 pasajes): en general pasó de 79,2% a 95,0%; en medicina de 38,0% a 81,8%; y en derecho marítimo de 77,8% a 99,4%. El autor advierte que estas cifras pueden variar con diferentes conjuntos de datos.

## Capacidades

- Reordenamiento de documentos para RAG: el modelo toma una consulta y un conjunto de documentos, y devuelve una puntuación de relevancia para cada par (query, document).
- Especializado en chino tradicional (zh-TW): optimizado para texto de Taiwán, incluyendo terminología médica, legislación taiwanesa y derecho marítimo.
- Soporte de dominio específico: entrenado con datos de medicina, derecho y conocimiento general de Taiwán, lo que lo hace adecuado para estos sectores.
- Devolución de puntuaciones logit: la puntuación de relevancia se devuelve como logit sin procesar; se puede aplicar una función sigmoide para obtener una probabilidad de 0 a 1.
- Compatibilidad con llama.cpp: se puede ejecutar con llama-server y la API de re-ordenación (``/v1/rerank``).
- Cuantización validada: el autor verificó que los tres formatos de cuantización mantienen el mismo orden de los resultados correctos en sus pruebas (20/20), aunque la calibración de las puntuaciones varía según la cuantización.

## Casos de uso

- Búsqueda semántica en corpus jurídico taiwanés: el modelo puede reordenar los resultados de un buscador de legislación taiwanesa (por ejemplo, leyes, reglamentos, jurisprudencia) para que los documentos más relevantes a una consulta legal aparezcan en primer lugar. Su entrenamiento con datos de derecho taiwanés lo hace especialmente adecuado.
- Recuperación de información médica en chino tradicional: en un sistema de ayuda al diagnóstico o de consulta de historiales médicos, el modelo puede filtrar y reordenar pasajes de literatura médica o informes clínicos, mejorando la precisión de la respuesta final de un LLM.
- Atención al cliente automatizada en taiwán: un sistema de atención al cliente que utilice un chatbot puede emplear este re-ordenador para seleccionar las respuestas más relevantes de una base de conocimiento de preguntas frecuentes, mejorando la calidad de las respuestas en interacciones multi-turno.
- Mejora de la precisión en sistemas RAG de dominio específico: cualquier sistema RAG que utilice un modelo de embeddings para recuperar candidatos puede integrar este re-ordenador como segunda etapa para mejorar el hit@1 y reducir el ruido en los resultados finales.
- Filtrado de documentos en pipelines de procesamiento de documentos: en un flujo de trabajo que procesa grandes volúmenes de documentos en chino, el modelo puede descartar documentos irrelevantes de manera eficiente antes de pasarlos a un LLM generativo, ahorrando costes computacionales.
- Búsqueda en bases de conocimiento de derecho marítimo: para consultas sobre normativa de navegación, puertos o seguros marítimos, el modelo puede reordenar los resultados de una base de datos especializada, priorizando los artículos más relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La evaluación del autor se limita a un conjunto de pruebas interno con 20 preguntas y 6 candidatos por pregunta, comparando las versiones cuantizadas con el modelo original en safetensors. Los resultados son:

| Version | Acierto en orden del candidato correcto | Desviación de calibración (sigmoid, max) |
|---|---|---|
| f16 | 20/20 | 0,026 |
| Q8_0 | 20/20 | 0,106 |
| Q4_K_M | 20/20 | 0,672 |

El autor también reporta mejoras en hit@1 para tres dominios en una evaluación interna de 500 preguntas por dominio (pool de ~30.000 documentos): general 79,2% → 95,0%; medicina 38,0% → 81,8%; derecho marítimo 77,8% → 99,4%. Las condiciones exactas de esta evaluación no se han publicado y pueden no ser reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - f16 (593 MB): requiere ~1,2 GB de VRAM en GPU, o ~1,5 GB de RAM en CPU.
  - Q8_0 (318 MB): requiere ~0,7 GB de VRAM en GPU, o ~1 GB de RAM en CPU.
  - Q4_K_M (230 MB): requiere ~0,5 GB de VRAM en GPU, o ~0,8 GB de RAM en CPU.
- GPU recomendadas: el modelo es ligero; puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas de consumo como GTX 1650, RTX 3060, o incluso en CPU con llama.cpp.
- Compatible con GPU consumer: sí, el modelo es adecuado para GPUs de consumo de gama baja y media.
- Opciones de despliegue: llama.cpp (llama-server), llama-cpp-python, Ollama (si se configura con el archivo GGUF), o cualquier servidor compatible con la API de reordenamiento de llama.cpp.
- Latencia y throughput estimados: no disponibles. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por documento en GPU, y de cientos de milisegundos en CPU, para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| xVITA-Rerank-300M-zhTW-GGUF | 307 M | 8192 | zh-TW, multilingüe | MIT | GGUF | Especializado en zh-TW, dominios de medicina, derecho y marítimo |
| BAAI/bge-reranker-v2-m3 | 568 M | 8192 | Multilingüe (incluye zh) | MIT | safetensors, ONNX | Modelo multilingüe de re-ordenamiento, ampliamente usado |
| Jina Reranker v2 | 278 M | 4096 | Multilingüe (incluye zh) | CC-BY-NC | safetensors | Licencia de uso no comercial, alto rendimiento |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | 22,7 M | 512 | Inglés (limitado zh) | MIT | safetensors | Modelo ligero, pero no adecuado para chino |

El modelo xVITA-Rerank es el único de la comparativa con licencia MIT y disponible en GGUF, lo que facilita su despliegue en CPU y en entornos de producción. Su especialización en chino tradicional con dominios específicos es una ventaja frente a modelos multilingües generales, pero su ámbito de aplicación es más limitado.

## Limitaciones y advertencias

- La versión original en safetensors no está disponible públicamente; solo se distribuyen los pesos cuantizados en GGUF. Esto impide el fine-tuning o la investigación con la versión completa.
- El modelo está especializado en los dominios de entrenamiento (medicina, derecho taiwanés, derecho marítimo). Fuera de estos dominios, el rendimiento puede degradarse significativamente.
- La cuantización Q4_K_M introduce una desviación en la calibración de las puntuaciones (máximo 0,672 después de sigmoid). El autor advierte que las puntuaciones absolutas de esta versión no deben usarse como umbral de filtrado; solo es fiable para la ordenación.
- La evaluación interna del autor se basa en un conjunto de datos propio y limitado (20 preguntas para la validación de cuantización, 500 por dominio para la evaluación de rendimiento). No se han publicado los datos ni las condiciones exactas de la evaluación, por lo que los resultados pueden no ser reproducibles.
- El modelo está entrenado para chino tradicional (zh-TW). Aunque el modelo base es multilingüe, su entrenamiento se centra en el chino tradicional, por lo que su rendimiento en chino simplificado u otros idiomas puede ser inferior.
- El modelo requiere una versión de llama.cpp posterior a agosto de 2026 para cargar correctamente el vocabulario SentencePiece de 256k. Con versiones anteriores, el tokenizador puede segmentar los caracteres chinos de forma incorrecta, lo que degrada el rendimiento.
- No se han publicado resultados de benchmarks comparativos con otros modelos de re-ordenamiento, lo que dificulta una evaluación objetiva de su calidad relativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xCloudinfo/xVITA-Rerank-300M-zhTW-GGUF
- Modelo de embeddings complementario: https://huggingface.co/xCloudinfo/xVITA-Embed-300M-zhTW-GGUF
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Repositorio de re-ordenadores GGUF: https://github.com/sinjab/gguf-rerankers
