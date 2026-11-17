# SWIS-Leiden/qwen3-embedding-0.6b-nl-legal-lora

## Resumen

SWIS-Leiden/qwen3-embedding-0.6b-nl-legal-lora es un adaptador LoRA sobre el modelo de embeddings Qwen/Qwen3-Embedding-0.6B, desarrollado por SWIS-Leiden para tareas de recuperación de información (retrieval) en el dominio jurídico neerlandés. El adaptador convierte un modelo generalista de 0,6 mil millones de parámetros en un buscador especializado capaz de encontrar legislación y jurisprudencia neerlandesa a partir de una pregunta formulada en lenguaje natural, ya sea por un ciudadano, un abogado o mediante palabras clave.

El adaptador tiene un rango de 32 y alpha de 64, se aplica sobre las proyecciones de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) y ocupa unos 40 MB, con aproximadamente 20 millones de parámetros entrenables. Se distribuye como adaptador PEFT separado, de modo que puede servirse junto al modelo base desde una única copia de los pesos, que es precisamente el modo en que lo despliega LexAgent en producción.

Su relevancia radica en la combinación de un modelo base pequeño y eficiente con un entrenamiento específico sobre un corpus jurídico real de gran escala: 391.000 pasajes de artículos de normativa vigente y 902.000 resoluciones judiciales, con pares de entrenamiento generados sintéticamente y negativos duros extraídos de los errores del propio modelo base. La licencia Apache 2.0 y el formato de adaptador lo hacen directamente integrable en pipelines de búsqueda semántica existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo base Qwen3-Embedding-0.6B) con adaptador LoRA |
| Parametros totales | ~600M en el modelo base; ~20M en el adaptador LoRA (40 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el adaptador se distribuye en safetensors) |
| Idiomas soportados | Neerlandes (nl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en sus formatos habituales |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-Embedding-0.6B, un modelo de embeddings basado en transformer encoder. El LoRA tiene rango 32 y alpha 64, y se inserta en las siete proyecciones lineales del transformer (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). La tarea declarada es `FEATURE_EXTRACTION`, y las consultas deben ir precedidas de la instrucción del modelo base (`Instruct: Given a web search query, retrieve relevant passages that answer the query`), mientras que los documentos no llevan instrucción. El adaptador se entrenó exactamente con ese texto de instrucción.

El entrenamiento se construyó íntegramente a partir del índice propio de LexAgent: 391.000 pasajes de artículos de normativa vigente (wetten.overheid.nl) y 902.000 resoluciones (Rechtspraak open data). Se generaron tres conjuntos de pares: 141.361 preguntas por artículo (generadas por Qwen3.6-35B-A3B sobre 39.256 pasajes, en cuatro estilos: ciudadano, abogado, palabras de búsqueda y situación), 121.617 preguntas por resolución (sobre 44.904 resoluciones, en tres estilos) y 32.395 pares de citas judiciales, donde la consulta es el resumen de una resolución con la cita eliminada y el positivo es el artículo citado. La generación de preguntas consumió unas 86.000 peticiones y 85 millones de tokens. Se excluyeron pasajes sin norma real (títulos de citas, artículos de entrada en vigor, artículos derogados, meras modificaciones) y se limitó el conjunto de citas a 25 pares por artículo para evitar el sesgo hacia artículos muy citados (el artículo 8 del CEDH llegó a tener 3.330 pares en una primera versión). Se muestreó el corpus dando prioridad a leyes (la mitad), una cuarta parte de AMvB y proporciones menores del resto.

Cada pregunta incorpora hasta tres negativos duros obtenidos de los errores del modelo base mediante búsqueda híbrida (palabras clave y vectorial, top 30). Para evitar falsos negativos, nunca se consideran negativos otras partes del mismo artículo ni artículos con numeración a dos unidades de distancia en la misma norma, y se aplica un reranker cross-encoder (Qwen3-Reranker-0.6B) que descarta candidatos con una puntuación igual o superior al 95% de la del positivo correcto.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y recuperación de pasajes en neerlandés jurídico.
- Recuperación de legislación neerlandesa vigente a partir de preguntas en lenguaje natural (estilo ciudadano, abogado, palabras clave o descripción de situación).
- Recuperación de jurisprudencia neerlandesa a partir de la pregunta jurídica que resuelve la resolución o de los hechos narrados por un ciudadano.
- Búsqueda de artículos citados a partir del resumen de una resolución con la cita eliminada.
- Soporte de instrucción de consulta específica del modelo base para consultas; los documentos se embeben sin instrucción.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de embeddings.
- Capacidad multilingüe limitada al neerlandés según la model card (idioma declarado: nl).

## Casos de uso

- Buscador jurídico para ciudadanos: el adaptador permite que una pregunta coloquial como "¿me pueden despedir en el acto?" recupere los artículos y resoluciones relevantes, gracias a que el entrenamiento incluyó preguntas en estilo ciudadano sobre artículos concretos.
- Asistente legal para profesionales: un abogado puede formular la pregunta en términos técnicos ("¿finaliza de pleno derecho el seguro de automóvil al transferirse la obligación de asegurar?") y obtener el artículo correspondiente, ya que el conjunto de entrenamiento incluyó el estilo abogado.
- Búsqueda de jurisprudencia por hechos: un usuario describe su situación y el modelo recupera resoluciones que tratan casos similares, gracias a los pares generados a partir de los hechos narrados en estilo ciudadano.
- Verificación de citas y referencias cruzadas: dado el resumen de una resolución con la cita eliminada, el modelo recupera el artículo citado, útil para herramientas de análisis de sentencias y control de citas.
- Motor de recuperación en pipelines RAG jurídicos: al ser un adaptador LoRA servible con vLLM junto al modelo base, permite desplegar un índice general y un índice legal desde una sola copia de pesos, reduciendo costes de infraestructura.
- Búsqueda por palabras clave en portales de normativa: el estilo "search words" del entrenamiento permite que consultas telegráficas como "seguro coche fin venta" recuperen el artículo correcto, útil para interfaces de búsqueda simples.
- Indexación y recuperación a escala en producción: con 0,6B parámetros y un adaptador de 40 MB, el coste de reindexar 1,3 millones de pasajes es bajo en comparación con modelos de embeddings de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados del examen se encuentran en la ficha del modelo fusionado (SWIS-Leiden/qwen3-embedding-0.6b-nl-legal), no en la del adaptador. Se indica únicamente que los vectores producidos por el adaptador y por el modelo fusionado son equivalentes (coseno de 0,9996 entre ambos).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo base de ~600M parámetros más un adaptador de 40 MB, la inferencia en fp16 requiere aproximadamente 1,2-1,5 GB de VRAM; en cuantización de 8 bits, alrededor de 0,7-0,9 GB (estimación, no confirmada en la informacion proporcionada).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas consumer como RTX 3060, RTX 4060, RTX 4090 son suficientes. Para servir a escala con vLLM se recomienda A100 o H100 por throughput agregado.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas.
- Opciones de despliegue: vLLM (a partir de la versión 0.33.0 para adaptadores LoRA sobre modelos de embeddings, con `--enable-lora --max-lora-rank 32`), PEFT combinado con sentence-transformers, y el modelo base con sus opciones habituales. No se mencionan llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| SWIS-Leiden/qwen3-embedding-0.6b-nl-legal-lora | ~600M base + ~20M adaptador | No disponible | Juridico neerlandes | Apache 2.0 | Adaptador LoRA PEFT (safetensors) |
| Qwen/Qwen3-Embedding-0.6B (base) | ~600M | No disponible | Generalista multilingue | Apache 2.0 | Safetensors y otros |
| SWIS-Leiden/qwen3-embedding-0.6b-nl-legal (fusionado) | ~600M | No disponible | Juridico neerlandes | Apache 2.0 | Safetensors (modelo completo) |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para neerlandés jurídico; su rendimiento en otros idiomas o dominios no está garantizado y probablemente se degrade respecto al modelo base.
- Es un modelo de embeddings, no generativo: no puede responder preguntas ni razonar, solo producir representaciones vectoriales para recuperación.
- Riesgo de sesgo hacia el corpus de entrenamiento: se muestrearon las leyes al 50%, los AMvB al 25% y el resto en proporciones menores, por lo que la cobertura de normativa secundaria es menor.
- Se excluyeron las resoluciones de la parte caribeña del Reino, por lo que la recuperación de jurisprudencia de esa región puede ser deficiente.
- Los negativos duros se filtraron con un reranker y reglas de proximidad, pero persiste el riesgo residual de falsos negativos en un dominio con normas repetidas.
- La instrucción de consulta debe aplicarse exactamente como se entrenó; omitirla o modificarla puede degradar la calidad de los embeddings de consulta.
- El rango del LoRA (32) supera el límite por defecto de vLLM (16), por lo que es necesario configurar `--max-lora-rank 32` al servir con vLLM.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-Embedding-0.6B tiene su propia licencia que debe verificarse por separado.
- No se han publicado resultados de benchmarks en la ficha del adaptador; la evaluación debe consultarse en la ficha del modelo fusionado.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/SWIS-Leiden/qwen3-embedding-0.6b-nl-legal-lora
- Modelo fusionado: https://huggingface.co/SWIS-Leiden/qwen3-embedding-0.6b-nl-legal
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- LexAgent: https://lexagent.nl
