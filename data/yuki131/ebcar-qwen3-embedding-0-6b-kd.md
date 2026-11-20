# Yuki131/EBCAR-Qwen3-Embedding-0.6B-KD

## Resumen

EBCAR-Qwen3-Embedding-0.6B-KD es un checkpoint de reranking publicado por el usuario Yuki131 en Hugging Face. Se trata de un modelo EBCAR (un esquema de reranking basado en atencion hibrida) construido sobre el encoder Qwen3-Embedding-0.6B, que permanece congelado durante el entrenamiento. El checkpoint corresponde a la etapa 2 del entrenamiento descrito en el paper Lychee-Reranker (seccion 4.2): destilacion de conocimiento con senales suaves de grano fino, partiendo del checkpoint final de la etapa 1 (ajuste fino supervisado).

El modelo recibe una consulta y hasta 100 pasajes en orden de recuperacion, los puntua de forma conjunta y devuelve los indices originales con sus puntuaciones en orden descendente. El pipeline declarado es text-ranking, por lo que su uso previsto es el reordenamiento de resultados de un sistema de recuperacion (RAG, busqueda semantica, motores documentales).

La relevancia de este checkpoint es limitada y experimental: cuenta con cero descargas y cero likes en el momento de la consulta, no declara licencia ni idiomas soportados, y parte de codigo upstream con licencia CC BY-NC-SA 4.0 (no comercial). Debe evaluarse como una variante de investigacion, no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EBCAR (reranker con atencion hibrida) sobre encoder Qwen3-Embedding-0.6B congelado |
| Parametros totales | no disponible (el encoder base es de 0.6B; el total del checkpoint no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el codigo upstream de EBCAR es CC BY-NC-SA 4.0) |
| Formato de pesos | no disponible (repositorio con `requirements.txt` y modulo `reranker.py`) |

## Arquitectura y entrenamiento

El modelo combina el encoder Qwen3-Embedding-0.6B, que se mantiene congelado, con la maquinaria de reranking de EBCAR, cuyo codigo de atencion hibrida procede de RBC Borealis (Royal Bank of Canada). El reranker puntua consulta y pasajes de forma conjunta, lo que permite capturar interacciones cruzadas entre la consulta y cada documento, a diferencia de un bi-encoder que puntua por separado. El limite operativo documentado es de hasta 100 pasajes por consulta, entregados en orden de recuperacion.

El entrenamiento se realizo en dos etapas segun el paper Lychee-Reranker: la etapa 1 consistio en ajuste fino sobre conjuntos de datos supervisados de alta calidad, y la etapa 2 (la que corresponde a este checkpoint) aplico destilacion de conocimiento con senales suaves de grano fino. Los datos empleados son los de KaLM reranker training data, con etiquetas duras y puntuaciones de relevancia del profesor. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Reranking de pasajes: puntua conjuntamente una consulta y hasta 100 pasajes, devolviendo indices originales y puntuaciones crudas en orden descendente.
- Integracion en pipelines de recuperacion: pensado para la segunda fase de un sistema retrieve-then-rerank.
- Instrucciones por consulta: acepta un parametro `instruction` que guia el criterio de relevancia (por ejemplo, "Given a query, retrieve documents that answer the query").
- Uso de encoder local o remoto: `encoder_name_or_path` admite tanto el identificador de Hugging Face como una copia local del mismo encoder.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, agentes, vision o audio: no disponibles; el pipeline declarado es exclusivamente text-ranking.

## Casos de uso

- RAG sobre documentacion tecnica: recuperar candidatos con un buscador vectorial y reordenarlos con este modelo para mejorar la precision de los pasajes que se inyectan en el prompt del LLM.
- Busqueda semantica en bases de conocimiento internas: reordenar los 50-100 resultados iniciales de un indice para que el usuario vea primero los documentos mas relevantes.
- Atencion al cliente con base de articulos: reordenar respuestas candidatas de una FAQ o centro de ayuda antes de mostrarlas o de pasarlas a un modelo generativo.
- Filtrado de resultados en motores de busqueda de codigo o repositorios: puntuar fragmentos de codigo o documentacion recuperados y descartar los de baja relevancia.
- Evaluacion de sistemas de recuperacion: usar las puntuaciones crudas como senal para medir la calidad de un pipeline de retrieval en experimentos de investigacion.
- Prototipado academico de tecnicas de destilacion: servir como checkpoint de referencia de la etapa 2 del esquema Lychee-Reranker para comparar con la etapa 1.
- Deduplicacion y priorizacion de evidencias en tareas de QA documental: ordenar pasajes solapados antes de la sintesis final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el encoder base Qwen3-Embedding-0.6B en precision de 16 bits ocupa aproximadamente 1,2 GB de pesos; el consumo real del reranker depende del codigo EBCAR y del procesamiento conjunto de hasta 100 pasajes.
- GPU recomendadas: no disponibles. Por el tamano del encoder, el modelo deberia caber en GPUs de consumo con suficiente VRAM para procesar lotes de pasajes, pero no hay datos publicados que lo confirmen.
- Cabe en GPU de consumo: probable por el tamano del encoder base, sin confirmacion oficial.
- Opciones de despliegue: el autor solo documenta el uso mediante el modulo `reranker.py` del repositorio y `pip install -r requirements.txt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EBCAR-Qwen3-Embedding-0.6B-KD | no disponible (encoder de 0.6B) | no disponible | Reranking | no disponible (upstream CC BY-NC-SA 4.0) | Hugging Face, 0 descargas |
| Qwen3-Embedding-0.6B (encoder base) | 0.6B | no disponible en esta ficha | Embedding / recuperacion | no disponible en esta ficha | Hugging Face |
| Lychee-Reranker (referencia del paper) | no disponible | no disponible | Reranking | no disponible | Paper arXiv:2606.22807 |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio del modelo; el codigo upstream de EBCAR se distribuye bajo CC BY-NC-SA 4.0, lo que restringe el uso comercial y exige compartir bajo la misma licencia.
- El modelo tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia: no hay evidencia de validacion por parte de la comunidad.
- No se declaran idiomas soportados; el comportamiento multilingue es desconocido.
- No se publican benchmarks ni metricas de calidad; no hay forma de verificar su rendimiento frente a alternativas.
- Limite operativo de 100 pasajes por consulta; superarlo no esta soportado segun la documentacion.
- Al ser un checkpoint de destilacion sobre un encoder congelado, su calidad depende enteramente de las puntuaciones del profesor y de los datos KaLM, con el riesgo de heredar sesgos de ese corpus.
- Riesgo de alucinacion no aplica en sentido generativo (no genera texto), pero si de puntuaciones mal calibradas en dominios alejados de los datos de entrenamiento.
- No se especifican requisitos de hardware, formato de pesos ni opciones de cuantizacion, lo que complica su integracion en infraestructura existente.
- Para produccion se recomienda evaluar contra un reranker establecido antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Yuki131/EBCAR-Qwen3-Embedding-0.6B-KD
- Encoder base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/KaLM-Embedding/KaLM-reranker-training-data
- Paper Lychee-Reranker: https://arxiv.org/pdf/2606.22807
- Codigo fuente EBCAR: https://github.com/BorealisAI/EBCAR/tree/0beec711900f42dee1b72d2a9367ac640ff3fa8c
- Licencia del codigo upstream: incluida en el repositorio del modelo en `upstream_ebcar/LICENSE`
