# vivekkopthsd/tax-reranker-minilm

## Resumen

tax-reranker-minilm es un cross-encoder de reordenacion (reranker) de 22,7 millones de parametros, publicado por el usuario vivekkopthsd (Vivek Bose) en HuggingFace bajo licencia Apache 2.0. Se obtiene mediante fine-tuning de cross-encoder/ms-marco-MiniLM-L-6-v2 sobre pares pregunta-pasaje extraidos de la Income-Tax Act, 2025 de la India. Su funcion no es generar texto, sino puntuar la relevancia de cada pasaje respecto a una consulta para reordenar los candidatos devueltos por un retriever de primera etapa.

El problema que resuelve es el clasico cuello de botella de los pipelines RAG en dominios especializados: la recuperacion densa es rapida pero aproximada, y en un corpus normativo como una ley fiscal la diferencia entre la seccion correcta y una seccion adyacente es pequena. Este modelo actua como segunda etapa dentro del pipeline TaxRAG, reordenando el top-30 de candidatos y elevando el MRR@10 de 0,632 (solo denso) a 0,820, y hasta 0,833 cuando se combina recuperacion densa con BM25 mediante RRF.

Es relevante ahora porque ilustra un patron muy repetible: un cross-encoder pequeno (22M parametros, menos de 100 MB de pesos) fine-tuneado con pocos datos (2.765 pares, 2 epochs, una sola T4) logra mejoras significativas sobre el reranker generico del que parte, con un coste de inferencia asumible incluso en CPU. Su contexto declarado y su cobertura son limitados: solo ingles, solo una ley concreta, y con un rendimiento peor que el modelo base ante preguntas parafraseadas a partir de titulos de seccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en transformer BERT/MiniLM (fine-tune de cross-encoder/ms-marco-MiniLM-L-6-v2), clasificacion de pares (query, pasaje) con salida escalar |
| Parametros totales | 22.713.601 (dato real, safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso max_length 384 y el ejemplo de uso de la model card trunca a 256 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos safetensors (tamano de repo 0,1 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales: pipeline declarado text-ranking, tags text-classification, cross-encoder, reranker, legal, tax, india, retrieval-augmented-generation, text-embeddings-inference, endpoints_compatible. Creado el 2026-09-27, actualizado el 2026-09-27. Descargas: 0. Likes: 0.

## Arquitectura y entrenamiento

La arquitectura es la de un cross-encoder: el tokenizador construye una secuencia conjunta [query, pasaje] y el modelo aplica auto-atencion bidireccional sobre ambos simultaneamente, emitiendo un unico logit de relevancia por par. Esto lo hace mas preciso que un bi-encoder (que codifica consulta y documento por separado y compara embeddings), pero impide precalcular representaciones: hay que ejecutar el modelo una vez por cada par candidato. La base es ms-marco-MiniLM-L-6-v2, un MiniLM de 6 capas ya afinado para ranking de pasajes en MS MARCO.

El entrenamiento se hizo con preguntas generadas por Qwen3-4B-Instruct a partir del contenido de cada seccion de la Income-Tax Act, 2025, no de sus titulos. Se descartaron las preguntas que mencionaban el numero de seccion o que repetian mayoritariamente el encabezado, con el objetivo de forzar al modelo a trabajar sobre semantica del contenido y no sobre coincidencias superficiales. Las secciones se dividieron en grupos disjuntos de entrenamiento y prueba, y el modelo solo vio preguntas de las 327 secciones de entrenamiento. En total, 2.765 pares: cada pregunta con su pasaje dorado como positivo y 4 negativos duros obtenidos del retriever fiqa-retriever-bge-small (los mejores pasajes de otras secciones).

La funcion de perdida fue entropia cruzada binaria sobre pares (pregunta, pasaje), con 2 epochs, AdamW a learning rate 2e-5, batch 16, longitud maxima 384, precision fp16 y una unica GPU T4. No se documenta en la informacion disponible ninguna fase de RLHF, DPO ni decodificacion especulativa (no aplicable a un modelo de scoring).

## Capacidades

- Puntuacion de relevancia de pares (consulta, pasaje) mediante un unico logit, apta para reordenar listas de candidatos.
- Reranking dentro de pipelines RAG como segunda etapa tras una recuperacion densa, dispersa o hibrida.
- Buen comportamiento sobre consultas formuladas en lenguaje natural a partir del contenido normativo (Recall@1 0,758 y MRR@10 0,820 en el conjunto de prueba de 277 preguntas sobre 150 secciones retenidas).
- Mejora adicional cuando se le alimenta con el resultado de fusionar denso y BM25 mediante RRF (Recall@1 0,773, MRR@10 0,833).
- Integracion directa con transformers (AutoModelForSequenceClassification y AutoTokenizer) y compatibilidad declarada con text-embeddings-inference y endpoints.
- Ejecucion viable en CPU (aproximadamente 2,5 s para reordenar 15 candidatos a 256 tokens en un portatil de 4 nucleos), lo que permite desplegarlo sin GPU.
- No dispone de generacion de texto, tool calling, capacidad de agente, vision ni audio: es exclusivamente un modelo de ranking.

## Casos de uso

- Segunda etapa de un RAG fiscal sobre la Income-Tax Act, 2025: se recuperan 30-50 pasajes con un retriever denso o hibrido y este modelo los reordena para que el generador reciba solo los 3-5 mas relevantes, mejorando el MRR@10 de 0,632 a 0,820-0,833.
- Integracion en el pipeline TaxRAG: la model card indica explicitamente que es el reranker de segunda etapa del repositorio https://github.com/bravo2024/TaxRag, por lo que puede desplegarse directamente en ese flujo sin reentrenamiento.
- Asistente interno de consultas fiscales para equipos de contabilidad: dado que la puntuacion es determinista y no generativa, se puede usar para localizar la seccion aplicable y dejar la redaccion de la respuesta a un LLM aparte, reduciendo el riesgo de que el generador invente la referencia normativa.
- Busqueda semantica en corpus normativos largos: el modelo distingue entre secciones con vocabulario solapado (por ejemplo, arras de alquiler frente a determinacion del valor anual), algo que un bi-encoder tiende a confundir.
- Filtrado de candidatos en motores de busqueda documental: reordenar el top-30 de resultados antes de presentarlos a un usuario humano, con coste de latencia bajo gracias a los 22M de parametros.
- Evaluacion comparativa de retrievers en dominio legal: sirve como referencia fija para medir si un cambio en la primera etapa (modelo denso, BM25, fusion RRF) mejora o empeora el ranking final.
- Prototipado de RAG en dominios regulados con presupuesto de hardware minimo: al caber en CPU y en cualquier GPU consumer, permite validar la arquitectura de dos etapas antes de invertir en modelos mayores.
- Investigacion sobre cross-encoders en dominios especializados: el modelo documenta un caso claro de degradacion por cambio de distribucion (preguntas de contenido frente a preguntas de encabezado), util para estudiar generalizacion en rerankers pequenos.

## Benchmarks y rendimiento

Evaluacion sobre 277 preguntas de 150 secciones retenidas (nunca vistas en entrenamiento), con el pasaje dorado definido como la seccion desde la que se genero la pregunta; metricas a nivel de seccion sobre 1.237 pasajes.

| Pipeline | Recall@1 | Recall@5 | MRR@10 |
|---|---|---|---|
| Solo denso (FiQA bge-small) | 0,502 | 0,773 | 0,632 |
| Denso top-30 -> ms-marco-MiniLM (base) | 0,726 | 0,903 | 0,796 |
| Denso top-30 -> este modelo | 0,758 | 0,906 | 0,820 |
| Denso + BM25 (RRF) top-30 -> este modelo | 0,773 | 0,910 | 0,833 |

Notas de la model card: ambos rerankers mejoran de forma clara sobre la recuperacion densa (McNemar exacto sobre Recall@5 frente a solo denso, p < 1e-8). Frente al reranker base ms-marco, la ganancia es modesta (+0,024 en MRR@10). En un conjunto de prueba antiguo y mas facil, con 100 preguntas parafraseadas a partir de encabezados de seccion, este modelo rinde peor que el base (MRR@10 0,843 frente a 0,907).

## Requisitos de hardware

- VRAM estimada: minima. Con 22,7M de parametros, los pesos en fp32 ocupan aproximadamente 91 MB y en fp16 unos 45 MB; el repositorio completo son 0,1 GB. Cualquier GPU con 1 GB de VRAM libre es suficiente.
- GPU recomendadas: no se requiere GPU. El autor entreno con una unica T4. Sirve cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) y tambien aceleradores de inferencia basicos.
- Compatibilidad con GPU consumer: si, en todas las gamas. Es un modelo apto para portatiles y equipos sin GPU dedicada.
- CPU: viable. La model card reporta aproximadamente 2,5 s para reordenar 15 candidatos a 256 tokens en un portatil de 4 nucleos, es decir, del orden de 165 ms por par.
- Opciones de despliegue: transformers (clase AutoModelForSequenceClassification, como en el ejemplo de la model card), text-embeddings-inference (etiqueta declarada en el repositorio), endpoints compatibles, y sentence-transformers mediante su clase CrossEncoder (no confirmado explicitamente en la informacion disponible). El soporte en vLLM no esta documentado en la informacion proporcionada.
- Latencia y throughput: solo se documenta la cifra de CPU mencionada. El throughput en GPU no esta disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Contexto | Rendimiento (conjunto de prueba del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tax-reranker-minilm | Cross-encoder reranker, dominio fiscal indio | 22.713.601 | no disponible (entrenado a 384) | MRR@10 0,820 (denso top-30) / 0,833 (denso + BM25 RRF) | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | Cross-encoder reranker generico (modelo base) | no disponible en la informacion proporcionada (familia MiniLM-L6, ~22M) | no disponible | MRR@10 0,796 (denso top-30) / 0,907 en el conjunto de encabezados | no disponible en la informacion proporcionada | HuggingFace, modelo publico ampliamente usado |
| vivekkopthsd/fiqa-retriever-bge-small | Retriever denso de primera etapa (no es reranker) | no disponible | no disponible | MRR@10 0,632 (solo denso) | no disponible en la informacion proporcionada | HuggingFace |
| Otros rerankers de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye comparaciones con alternativas externas como bge-reranker, Cohere Rerank u otros cross-encoders multilingues, por lo que no se pueden aportar cifras de esos modelos.

## Limitaciones y advertencias

- Cobertura restringida a un unico corpus: la Income-Tax Act, 2025 de la India. El modelo no esta entrenado para otras jurisdicciones ni para derecho general.
- Idioma: solo ingles. No se documenta soporte multilingue.
- Degradacion con preguntas estilo encabezado: en el conjunto de 100 preguntas parafraseadas desde titulos de seccion, el MRR@10 cae a 0,843 frente a 0,907 del modelo base, porque el entrenamiento excluyo deliberadamente ese tipo de formulacion.
- Volumen de entrenamiento reducido: 2.765 pares y 327 secciones de entrenamiento. La generalizacion a formulaciones muy distintas de las generadas por Qwen3-4B-Instruct no esta garantizada.
- Cambio de distribucion en produccion: si las consultas reales de los usuarios difieren del estilo de pregunta generada sinteticamente, el rendimiento puede caer por debajo de lo reportado.
- Naturaleza no generativa: el modelo solo produce una puntuacion de relevancia. No puede responder preguntas, citar secciones ni justificar su decision, y no ofrece calibracion de esa puntuacion.
- Sin datos de sesgo: no se documenta ningun analisis de sesgos, y el dominio (texto normativo) limita la exposicion a sesgos sociales, pero tampoco hay evaluacion al respecto.
- Riesgo de falso positivo en relevancia: una puntuacion alta no implica que la seccion sea juridicamente aplicable al caso del usuario. La propia model card indica que no constituye asesoramiento legal ni fiscal.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion por terceros. La validacion externa es nula.
- Licencia: apache-2.0, que permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Conviene verificar las condiciones del modelo base (cross-encoder/ms-marco-MiniLM-L-6-v2), no detalladas en la informacion proporcionada.
- Se recomienda no desplegarlo como unica fuente de verdad en flujos legales o fiscales: debe acompanarse de verificacion humana y de un generador que cite explicitamente la seccion normativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vivekkopthsd/tax-reranker-minilm
- Perfil del autor: https://huggingface.co/vivekkopthsd
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L-6-v2
- Retriever de primera etapa usado para los negativos duros: https://huggingface.co/vivekkopthsd/fiqa-retriever-bge-small
- Pipeline TaxRAG: https://github.com/bravo2024/TaxRag
- Otro modelo del mismo autor: https://huggingface.co/vivekkopthsd/minilm-l6-v2-taxfinance-lora
- Lista curada de rerankers: https://github.com/agentset-ai/awesome-rerankers
