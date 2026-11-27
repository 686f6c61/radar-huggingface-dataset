# Windmi1l/geoagenticrag-reranker-v6

## Resumen

geoagenticrag-reranker-v6 es un modelo de reranking publicado por el usuario Windmi1l en Hugging Face, derivado mediante fine-tuning de BAAI/bge-reranker-v2-m3. Su propósito declarado es la reordenación de candidatos en el pipeline QTroute MapQA, un sistema de recuperación de información de tipo geospatial y map question answering. El modelo no es un generador de texto: es un cross-encoder que puntúa pares consulta-documento para reordenar los resultados de un recuperador previo.

Arquitectura y tamaño encajan con la familia XLM-RoBERTa: 567.755.777 parámetros en formato safetensors, con un repositorio de 1,2 GB. La model card es extremadamente escueta y no documenta la longitud de contexto efectiva, los idiomas soportados ni resultados de evaluación, por lo que buena parte de las especificaciones habituales quedan como no disponibles.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo tiene cero descargas y cero likes en el momento de la consulta, y el propio autor advierte de que las etiquetas de entrenamiento se generaron por reglas a partir de ramas de recuperación guardadas, no por anotación humana experta. Es, por tanto, un artefacto de investigación interna más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (cross-encoder de reranking), fine-tune de BAAI/bge-reranker-v2-m3 |
| Parametros totales | 567.755.777 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero el autor no declara cobertura) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en XLM-RoBERTa, la misma familia que su base BAAI/bge-reranker-v2-m3. En este esquema, la consulta y el documento candidato se concatenan y se procesan conjuntamente por el encoder, y la cabeza de clasificación produce una puntuación de relevancia. Esto lo hace adecuado para una segunda fase de ranking sobre un conjunto reducido de candidatos, no para búsqueda sobre corpus completos.

Según la model card, el fine-tuning se orientó a la reordenación de candidatos en QTroute MapQA. El dato crítico es que las etiquetas se generaron mediante reglas a partir de ramas de recuperación de MapQA guardadas, y el autor indica explícitamente que no son anotaciones oro de expertos. No se publican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otras optimizaciones posteriores. Tampoco se incluyen los checkpoints intermedios ni los datos de entrenamiento en el repositorio.

## Capacidades

- Reranking de pares consulta-documento: produce una puntuación de relevancia para reordenar candidatos devuertos por un recuperador previo.
- Dominio específico geospatial y map question answering, orientado al pipeline QTroute MapQA.
- Integración como segunda fase de un pipeline RAG (retrieval-augmented generation), sustituyendo o complementando al reranker base.
- Capacidad multilingüe potencial heredada de XLM-RoBERTa, aunque no declarada ni evaluada por el autor.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo de puntuación, no un LLM generativo.
- No se documentan capacidades de visión, audio ni agentes.

## Casos de uso

- Reranking en pipelines RAG geospatiales: dado un conjunto de documentos recuperados por un buscador vectorial o léxico sobre datos cartográficos, el modelo reordena los candidatos antes de pasarlos al generador, mejorando la precisión del contexto inyectado.
- Map question answering: para consultas del tipo "qué ruta conecta X con Y" o preguntas sobre entidades de un mapa, el modelo puntúa qué fragmentos de la base documental son más relevantes para la pregunta concreta.
- Filtrado de candidatos en sistemas de rutas QTroute: tras una primera fase de recuperación de segmentos o rutas candidatas, el reranker descarta los irrelevantes y prioriza los que responden a la intención de la consulta.
- Evaluación comparativa de rerankers: al estar construido sobre bge-reranker-v2-m3, sirve como punto de comparación para medir la ganancia (o pérdida) de un fine-tune de dominio frente al modelo base en tareas geospatiales.
- Prototipado de investigación en recuperación geográfica: útil en entornos académicos o internos para experimentar con reranking especializado sin coste de licencia, dado que es Apache 2.0.
- Baseline en experimentos de weak supervision: el modelo puede reutilizarse como referencia para estudiar el efecto de etiquetas generadas por reglas frente a anotación humana en tareas de ranking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de nDCG, MRR, MAP ni comparaciones con el modelo base, y no se han encontrado evaluaciones externas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos (567,8 M de parámetros × 4 bytes), más overhead de activaciones y del tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 1,1-1,2 GB para pesos, más activaciones; en la práctica, entre 2 y 4 GB según el tamaño de lote y la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para lotes pequeños; A100, H100 o L40S permiten mayor throughput en producción. Una RTX 4090, RTX 3090 o incluso una RTX 3060 de 12 GB pueden ejecutarlo sin problema.
- Cabe en GPU de consumo: sí, con holgura, al tratarse de un modelo de ~568 M de parámetros.
- Opciones de despliegue: al ser un cross-encoder de la familia XLM-RoBERTa, es compatible con sentence-transformers (CrossEncoder), Hugging Face Transformers, Text Embeddings Inference (TEI) y vLLM en modo de scoring; llama.cpp y Ollama requerirían conversión a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| geoagenticrag-reranker-v6 | 567,8 M | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune de dominio con etiquetas débiles |
| BAAI/bge-reranker-v2-m3 | ~568 M (misma familia) | no disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; multilingüe y con evaluación pública |
| BAAI/bge-reranker-base | ~278 M | no disponible en esta ficha | MIT/Apache según versión | Hugging Face | Alternativa más ligera, menor coste de inferencia |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | ~22,7 M | 512 tokens (estándar de la familia) | Apache 2.0 | Hugging Face | Mucho más pequeño y rápido; menor precisión en dominios especializados |

La comparación directa con el modelo base es la más informativa, pero no se dispone de métricas del fine-tune que permitan cuantificar la mejora.

## Limitaciones y advertencias

- Etiquetas de entrenamiento débiles: el autor declara que las etiquetas se generaron por reglas a partir de ramas de recuperación guardadas y no son anotaciones oro de expertos; esto introduce sesgo hacia los patrones del recuperador original y puede amplificar sus errores.
- Sin evaluación publicada: no hay benchmarks, lo que impide verificar que el fine-tune supere al modelo base en la tarea objetivo.
- Model card incompleta: no se documentan contexto máximo, idiomas, datos de entrenamiento ni hiperparámetros, lo que dificulta la reproducibilidad.
- Riesgo de sobreajuste al dominio: al estar especializado en QTroute MapQA, su rendimiento fuera de ese pipeline geospatial concreto es incierto.
- Adopción nula: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación por terceros.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe asumir la responsabilidad de validar el modelo en su propio dominio.
- No es un generador: no debe emplearse para tareas de generación, razonamiento o agentes; su función es exclusivamente de scoring y reordenación.
- Sesgos heredados: al derivar de XLM-RoBERTa, puede arrastrar sesgos lingüísticos y culturales del corpus de preentrenamiento del modelo base, no auditados en este fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Windmi1l/geoagenticrag-reranker-v6
- Modelo base BAAI/bge-reranker-v2-m3: https://huggingface.co/BAAI/bge-reranker-v2-m3
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
