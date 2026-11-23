# veripazari/modernbert-tr-reranker

## Resumen

modernbert-tr-reranker es un cross-encoder de reordenamiento (reranker) especializado en turco, desarrollado originalmente por ytu-ce-cosmos y archivado en el repositorio veripazari/modernbert-tr-reranker. Su funcion es puntuar la relevancia de pares (consulta, documento) para refinar los resultados de un recuperador de primera etapa. Con 149.365.249 parametros, se construye sobre el modelo base ytu-ce-cosmos/modernbert-tr-base y se destila a partir de Qwen/Qwen3-Reranker-8B.

El modelo resuelve un problema concreto en pipelines RAG y busqueda documental en turco: los embedders de primera etapa recuperan candidatos con ruido, y un cross-encoder que procesa consulta y documento conjuntamente puede reordenarlos con mucha mayor precision. La model card reporta una mejora media de +9,20 puntos de NDCG@10 al reordenar el top-100 del embedder ytu-ce-cosmos/modernbert-tr-embed, con incrementos de hasta +17,74 puntos en ArguAnaTR.

Es relevante porque combina un tamano contenido (150M parametros) con licencia Apache 2.0, soporte de ONNX, sentence-transformers y Text Embeddings Inference, lo que facilita su despliegue en produccion sin las restricciones de licencia de los rerankers multilingues de gran tamano. El contexto de entrenamiento declarado alcanza los 8192 tokens, aunque el autor advierte de degradacion en entradas de formato largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) como cross-encoder de clasificacion de secuencias |
| Parametros totales | 149.365.249 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (max_length usado en el ejemplo de inferencia de la model card) |
| Tipos de cuantizacion | ONNX int8 (el autor advierte perdida de calidad en el reordenamiento); fp32 recomendado para ranking sensible a la calidad; float16 en TEI |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Se trata de un encoder transformer ModernBERT adaptado como cross-encoder: recibe el par (consulta, documento) de forma conjunta y emite un logit de relevancia mediante una cabeza de clasificacion de secuencias. ModernBERT incorpora atencion con RoPE, alternancia de atencion global y local, y soporte nativo de secuencias largas, lo que permite procesar pares de hasta 8192 tokens.

El entrenamiento se basa en destilacion del reranker Qwen/Qwen3-Reranker-8B sobre datos turcos de question answering y recuperacion de informacion: msmarco-tr, squad-tr, fiqa-tr, nfcorpus-tr, quora-tr y scifact-tr. Ademas se emplearon pares de contraargumento en turco procedentes de ArguAna, traducidos automaticamente con TranslateGemma-27B. La destilacion usa perdida KL listwise (Reddi et al., 2021), de modo que el modelo aprende la distribucion de relevancia del profesor de 8B, no solo etiquetas binarias. Todos los datos de entrenamiento se verificaron mediante hash de texto contra cada split de test de MTEB en turco para evitar filtracion.

## Capacidades

- Reordenamiento de pares (consulta, documento) mediante puntuacion de relevancia tipo cross-encoder.
- Integracion con sentence-transformers mediante la clase CrossEncoder.
- Inferencia con transformers (AutoModelForSequenceClassification) y con ONNX Runtime.
- Despliegue en Text Embeddings Inference con endpoint /rerank.
- Compatibilidad con transformers.js para ejecucion en navegador o entornos JavaScript.
- Procesamiento de entradas de hasta 8192 tokens (con la advertencia de degradacion en formato largo).
- Especializado en turco para tareas de QA, recuperacion de informacion y contraargumentacion.
- No soporta generacion de texto, tool calling ni razonamiento multi-paso: es exclusivamente un modelo de ranking.

## Casos de uso

- Refinamiento de pipelines RAG en turco: tras recuperar el top-100 con un embedder como modernbert-tr-embed, el reranker reordena los candidatos y eleva el NDCG@10 medio en +9,20 puntos, lo que reduce el ruido que llega al generador.
- Busqueda documental empresarial: indexacion de manuales, contratos o base de conocimiento interna en turco; el cross-encoder puntua la relevancia exacta de cada fragmento frente a la consulta del empleado.
- Atencion al cliente automatizada: seleccion de los articulos de ayuda mas relevantes antes de pasarlos a un LLM, mejorando la precision de las respuestas con un coste de computo bajo (150M parametros).
- Busqueda en foros y comunidades tecnicas: el resultado de +4,66 en CQADupstackGamingRetrievalTR lo hace util para reordenar hilos de discusion y preguntas-respuestas en turco.
- Verificacion de afirmaciones y contraargumentacion: los pares de ArguAna permiten localizar argumentos contrarios relevantes en sistemas de fact-checking o debate asistido.
- Recuperacion cientifica: con un NDCG@10 de 86,34 en SciFactTR, sirve para localizar evidencia en articulos cientificos en turco.
- Despliegue en el navegador o en edge: gracias a los pesos ONNX y transformers.js, puede ejecutarse en cliente para busquedas con privacidad de datos.
- Servicio de reranking de baja latencia: con TEI y float16 sobre una unica GPU consumer, adecuado para APIs de busqueda con alto QPS.

## Benchmarks y rendimiento

Resultados declarados por el autor (NDCG@10, reordenando el top-100 de ytu-ce-cosmos/modernbert-tr-embed con max_seq=512). No verificados de forma independiente.

| Tarea | Primera etapa NDCG@10 | Con reranker | Delta |
|---|---|---|---|
| ArguAnaTR | 37,01 | 54,75 | +17,74 |
| SquadTRRetrieval | 75,94 | 90,11 | +14,17 |
| SciFactTR | 77,07 | 86,34 | +9,27 |
| TQuadRetrieval | 87,48 | 94,00 | +6,52 |
| CQADupstackGamingRetrievalTR | 56,44 | 61,10 | +4,66 |
| XQuADRetrieval | 95,03 | 97,86 | +2,83 |
| Media | no disponible | no disponible | +9,20 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp16 (150M parametros) y alrededor de 1,2 GB en fp32, mas el espacio de activaciones segun la longitud de secuencia.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volumenes moderados.
- GPU recomendadas para produccion de alto throughput: A100, H100 o L40S con TEI y float16; tambien RTX 4090 para cargas medias.
- Opciones de despliegue: transformers, sentence-transformers, ONNX Runtime, Text Embeddings Inference (text-embeddings-router) y transformers.js.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware, la longitud de secuencia y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| modernbert-tr-reranker | 149M | 8192 | Turco | Apache 2.0 | Destilado de Qwen3-Reranker-8B; NDCG@10 medio +9,20 sobre primera etapa |
| Qwen/Qwen3-Reranker-8B | 8B | no disponible | Multilingue | no disponible | Modelo profesor usado en la destilacion; mucho mayor coste de inferencia |
| ytu-ce-cosmos/modernbert-tr-embed | no disponible | no disponible | Turco | no disponible | Embedder de primera etapa; el reranker se evalua reordenando su top-100 |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada para una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Los NDCG reportados corresponden a reordenar el top-100 de un recuperador de primera etapa concreto; las puntuaciones absolutas dependen de esa primera etapa y no son comparables de forma directa con otros pipelines.
- La cuantizacion int8 en ONNX reordena las puntuaciones de forma significativamente lossy para un reranker; el autor recomienda fp32 para ranking sensible a la calidad.
- El rendimiento puede degradarse en entradas de contexto largo por falta de datos de formato largo en el entrenamiento.
- Modelo especializado exclusivamente en turco: no soporta otros idiomas.
- Riesgo de alucinacion no aplica en sentido generativo (no produce texto), pero si puede asignar puntuaciones erroneas a documentos ambiguos o fuera de dominio.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al derivar de datos traducidos automaticamente (ArguAna via TranslateGemma-27B) pueden propagarse artefactos de traduccion.
- Los resultados de benchmarks estan declarados por el autor y no verificados de forma independiente (verified: false en el model-index).
- Licencia Apache 2.0 permite uso comercial, pero conviene conservar la atribucion al autor original ytu-ce-cosmos.
- El repositorio es un archivo de la comunidad (VeriPazari) del modelo original; para soporte o actualizaciones conviene consultar el repositorio de origen.

## Enlaces

- Hugging Face (archivo): https://huggingface.co/veripazari/modernbert-tr-reranker
- Repositorio original: https://huggingface.co/ytu-ce-cosmos/modernbert-tr-reranker
- Modelo base: https://huggingface.co/ytu-ce-cosmos/modernbert-tr-base
- Embedder de primera etapa: https://huggingface.co/ytu-ce-cosmos/modernbert-tr-embed
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-Reranker-8B
- Paper de perdida KL listwise: https://proceedings.mlr.press/v130/reddi21a.html
- Plataforma VeriPazari: https://veripazari.com.tr
