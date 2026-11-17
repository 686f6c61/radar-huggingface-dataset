# xCloudinfo/xVITA-Rerank-300M-zhTW-GGUF

## Resumen

xVITA-Rerank-300M-zhTW es un modelo de reordenamiento (reranker) de tipo cross-encoder desarrollado por xCloudinfo (云碩科技), una empresa taiwanesa especializada en soluciones de IA privadas en local. Su función es la segunda etapa de un pipeline RAG: dado un conjunto de pasajes candidatos recuperados por un modelo de embeddings, reasigna una puntuación de relevancia a cada par (consulta, pasaje) para colocar los documentos verdaderamente pertinentes en las primeras posiciones. Esta versión concreta es la distribución cuantizada en GGUF, pensada para su despliegue con llama.cpp.

El modelo parte de la base jhu-clsp/mmBERT-base (arquitectura ModernBERT, licencia MIT, 8192 tokens de contexto) y cuenta con 307.531.009 parámetros totales. Ha sido entrenado específicamente sobre corpus en chino tradicional (zh-TW) de tres dominios: médico, normativa y conocimiento general taiwanés, y marítimo. La relevancia actual del modelo reside en que cubre un nicho poco atendido: el reranking de alta calidad para chino tradicional, donde la mayoría de alternativas están optimizadas para chino simplificado o inglés.

La model card destaca por una divulgación inusualmente honesta de las limitaciones: documenta la desviación de calibración de cada nivel de cuantización, distingue entre rendimiento en dominios entrenados y no entrenados, y advierte explícitamente sobre el deterioro en registros coloquiales (transcripciones de reuniones). Los pesos completos en safetensors son de distribución privada; solo se publican las versiones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre ModernBERT (base: jhu-clsp/mmBERT-base) |
| Parametros totales | 307.531.009 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (heredada de mmBERT); en el ejemplo de despliegue se usa `--ctx-size 2048` |
| Tipos de cuantizacion | f16, Q8_0, Q4_K_M |
| Idiomas soportados | chino tradicional (zh-TW), multilingüe, inglés |
| Licencia | MIT |
| Formato de pesos | GGUF (los safetensors completos son de distribución privada) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT: procesa conjuntamente el par (consulta, pasaje) en una única pasada del transformer y produce un logit de relevancia, a diferencia de los bi-encoders que codifican consulta y documento por separado. El tokenizador hereda el vocabulario SentencePiece de 256k tokens de Gemma-2, que mmBERT adopta; la información del vocabulario se ha incrustado en el GGUF durante la conversión para permitir su carga directa en llama.cpp.

El entrenamiento se realizó sobre un corpus propio en chino tradicional de tres líneas (médico, normativa y conocimiento general taiwanés, y marítimo), combinadas y deduplicadas hasta 252.849 pares, de los cuales se muestrearon 60.000 para el entrenamiento. Los negativos difíciles se minaron con el modelo de embeddings compañero xVITA-Embed-300M-zhTW, extrayendo siete negativos por consulta desde las posiciones top-2 a top-60 del ranking de recuperación. La evaluación se hizo con separación por párrafo (no por par) para evitar fugas de información entre conjuntos, con una comprobación centinela de párrafo contra sí mismo que dio 100% en ambos grupos.

## Capacidades

- Reordenamiento de pasajes para RAG: puntúa pares (consulta, documento) y devuelve logits de relevancia ordenables.
- Recuperación de precisión en chino tradicional: mejora sustancial del hit@1 en dominios entrenados (general 79,2% → 95,0%; médico 38,0% → 81,8%; marítimo 77,8% → 99,4%).
- Generalización a dominios no vistos en registro escrito: en documentos públicos de gobierno, hit@1 de 61,8% a 87,2% y nDCG@10 +0,1371.
- Soporte multilingüe e inglés, heredado del modelo base mmBERT.
- Integración con llama.cpp mediante el endpoint `/v1/rerank` (`--rerank --pooling rank`), compatible con clientes que hablan el formato de la API de reranking.
- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso. Su salida es una puntuación por par.

## Casos de uso

- RAG sobre normativa y documentación legal taiwanesa: el modelo está entrenado con corpus de regulación y eleva el hit@1 en el dominio marítimo del 77,8% al 99,4%, lo que lo hace adecuado para asistentes de consulta normativa donde la precisión del primer resultado es crítica.
- Búsqueda en bases de conocimiento médico en chino tradicional: el salto de 38,0% a 81,8% en hit@1 sobre el recuperador solo justifica su uso como segunda etapa en sistemas de consulta clínica o de literatura médica en zh-TW.
- Recuperación sobre documentos públicos de gobierno: aunque no fue entrenado en ese dominio, alcanza 87,2% de hit@1 frente al 61,8% del recuperador aislado, por lo que sirve para asistentes de consulta de trámites y publicaciones oficiales.
- Segunda etapa en pipelines RAG de documentación técnica y manuales: con 8192 tokens de contexto puede procesar pasajes largos sin truncar, útil para fragmentos de especificaciones o contratos.
- Filtrado de candidatos en sistemas de búsqueda empresarial en local: al ser un GGUF de 230-318 MB, se despliega en infraestructura propia sin dependencia de APIs externas, lo que encaja con requisitos de soberanía de datos.
- Reordenamiento con umbral de puntuación: usando Q8_0 o f16 (desviación de calibración máxima de 0,106 y 0,026 tras sigmoid, respectivamente) se pueden aplicar umbrales de relevancia para descartar pasajes irrelevantes antes de pasarlos al generador.
- Evaluación comparativa de recuperadores: al conservar el ranking correcto en todas las cuantizaciones (20/20 en el conjunto de verificación), sirve como referencia de calidad para medir el impacto de distintos embeddings en un pipeline existente.

## Benchmarks y rendimiento

Resultados de recuperación publicados en la model card. Cada dominio se evaluó con 500 preguntas y un pool de aproximadamente 30.000 pasajes; las cifras comparan el recuperador aislado (xVITA-Embed-300M-zhTW) frente al pipeline con reranking.

| Dominio | hit@1 solo recuperador | hit@1 con reranking |
|---|---|---|
| General (entrenado) | 79,2% | 95,0% |
| Médico (entrenado) | 38,0% | 81,8% |
| Marítimo (entrenado) | 77,8% | 99,4% |

Evaluación de generalización (mismo recuperador, 500 preguntas por conjunto):

| Conjunto | hit@1 solo recuperador | hit@1 con reranking | Mejora nDCG@10 |
|---|---|---|---|
| Dominios entrenados (agregado) | no disponible | 93,3% | +0,2245 |
| Documentos públicos de gobierno (pool 5.132 pasajes) | 61,8% | 87,2% | +0,1371 |
| Transcripciones de reuniones, registro oral (pool 4.053 pasajes) | 20,8% | 18,8% | +0,0799 |

Verificación de cuantización (20 consultas × 6 candidatos con distractores barajados):

| Versión | Coincidencia de ranking correcto | Desviación de calibración (máx. tras sigmoid) |
|---|---|---|
| f16 | 20/20 (ranking completo 20/20) | 0,026 |
| Q8_0 | 20/20 | 0,106 |
| Q4_K_M | 20/20 | 0,672 |

El autor advierte que las cifras absolutas de distintas tandas de evaluación no son comparables entre sí; solo es válida la comparación recuperador frente a recuperador+reranker dentro de la misma evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB con f16 (593 MB de pesos), 0,35 GB con Q8_0 (318 MB) y 0,25 GB con Q4_K_M (230 MB), más la memoria del contexto KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. En la práctica, la mayor parte del coste vendrá del modelo de embeddings y del generador del pipeline, no del reranker.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más de VRAM, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server --rerank --pooling rank`), exponiendo el endpoint `/v1/rerank`. No se documentan otras opciones (vLLM, TGI) en la información disponible.
- Requisito de versión: llama.cpp de 2026-08 en adelante. Si tras cargar el modelo el chino se segmenta carácter por carácter (un enunciado produce tres o más veces el número de tokens esperado), la versión es demasiado antigua.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| xVITA-Rerank-300M-zhTW | 307,5 M | 8192 | zh-TW, multilingüe, en | MIT | GGUF | Pesos completos privados; especializado en chino tradicional |
| xVITA-Embed-300M-zhTW | no disponible | no disponible | zh-TW | no disponible | GGUF | Modelo compañero de primera etapa (bi-encoder); no es un reranker, se compara como recuperador en los benchmarks |
| jhu-clsp/mmBERT-base | no disponible | 8192 | multilingüe | MIT | safetensors | Modelo base sin ajuste para reranking; sirve como punto de partida, no como alternativa directa |

No se dispone en la información proporcionada de datos de otros rerankers comparables (por ejemplo, de la familia BGE o Cohere) para establecer una comparación cuantitativa; no disponible.

## Limitaciones y advertencias

- Deterioro en registro oral: en transcripciones de reuniones la mejora de hit@1 es de −2,0 puntos porcentuales (no significativa, con error estándar de 1,8 puntos) y la ganancia de nDCG cae al 36% de la observada en dominios entrenados. El autor recomienda medir sobre datos propios antes de desplegarlo en dominios conversacionales.
- Confusión de atribución en el caso oral: el recuperador aislado también cae del 61,8% al 20,8%, y con los datos actuales no es posible separar cuánto de la pérdida se debe al reranker y cuánto a un pool de candidatos incompleto.
- Puntuaciones de Q4_K_M no calibradas: la desviación máxima tras sigmoid es de 0,672, por lo que sus scores absolutos no deben usarse como umbral de filtrado. Para umbrales, emplear Q8_0 (0,106) o f16 (0,026).
- Salida en logits: el campo `relevance_score` devuelto es el logit en bruto; hay que aplicar sigmoid manualmente para obtener una probabilidad entre 0 y 1.
- Sesgos: no se documentan análisis de sesgo en la información disponible. El entrenamiento se limita a corpus taiwaneses de tres dominios concretos, lo que puede infrarepresentar otras variantes regionales del chino.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede asignar puntuaciones altas a pasajes léxicamente similares pero semánticamente irrelevantes; el reranking no corrige un pool de candidatos que no contenga la respuesta correcta.
- Cobertura lingüística: aunque la etiqueta incluye multilingüe e inglés, el ajuste fino se hizo sobre chino tradicional; el rendimiento en otras lenguas no está cuantificado.
- Pesos completos no públicos: solo se distribuyen GGUF; el ajuste fino o la investigación requieren contactar con xCloudinfo.
- Dependencia de versión de llama.cpp: versiones anteriores a 2026-08 pueden tokenizar incorrectamente el chino, degradando silenciosamente la calidad del ranking.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xCloudinfo/xVITA-Rerank-300M-zhTW-GGUF
- Modelo de embeddings compañero: https://huggingface.co/xCloudinfo/xVITA-Embed-300M-zhTW-GGUF
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Otros modelos de xCloudinfo: https://hf.co/xCloudinfo
