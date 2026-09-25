# Tamkimd/tamev-large-qwen3.5-4b

## Resumen

TAMEV-Large-Qwen3.5-4B es un modelo de clasificación de texto publicado en HuggingFace por el usuario Tamkimd bajo licencia Apache 2.0. El autor lo presenta como un "System One Decision Model": un motor de decisión orientado a enrutado y selección entre candidatos, pensado como alternativa a los LLM generativos (a los que describe como "System Two"), con inferencia local y probabilidades calibradas.

Según la model card, el modelo se apoya en un backbone Qwen/Qwen3.5-4B y declara 4440,0 M de parámetros activos, con artefactos en FP32 (16937,4 MB) e INT8 (4234,3 MB). Sin embargo, los metadatos reales de safetensors del repositorio indican 1.311.232 parámetros totales (aproximadamente 1,3 M) y un tamaño de repositorio de 0,0 GB, una discrepancia de tres órdenes de magnitud que no queda resuelta en la información disponible. Tampoco se ha podido confirmar la existencia pública de un modelo denominado Qwen/Qwen3.5-4B.

El interés del modelo reside en su propuesta técnica: invariancia exacta a permutaciones de las opciones, calibración declarada (ECE 0,1121, Brier 0,2018) y coste de inferencia lineal O(K) para espacios de acción grandes. La ficha se basa únicamente en los datos declarados por el autor; no hay resultados verificados de terceros ni benchmarks independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | incontext_causal, con doble codificador desacoplado y cabecera de puntero bilineal simétrica (según el autor) |
| Parametros totales | 1.311.232 según safetensors del repositorio; el autor declara "Active Parameters 4440.0M" (contradicción no resuelta) |
| Parametros activos | 4440,0 M (dato declarado por el autor, no verificable) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (16937,4 MB declarados) e INT8 (4234,3 MB declarados) |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; los tags mencionan además ONNX, CoreML y MLX |
| Tarea (pipeline) | text-classification |
| Temperatura calibrada | 2,406 (dato del autor) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El autor describe una arquitectura de dos codificadores desacoplados combinados mediante una cabecera de puntero bilineal simétrica, con la fórmula de puntuación Score(c, o_i) = (W_q·c)^T (W_k·o_i) / √d. Esta construcción busca invariancia exacta a permutaciones: la puntuación de cada candidato depende solo del par (contexto, opción) y no de la posición que ocupa en la lista, lo que elimina el sesgo de recencia que el autor atribuye a los modelos autorregresivos. El coste de evaluación de K opciones escala de forma lineal, O(K), lo que permite manejar espacios de acción de 77 o más candidatos sin truncado de secuencia ni atención cuadrática.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. La model card enumera, como datasets asociados, banking77, boolq, ag_news, multi_nli, sst5, yelp_review_full, trec, dbpedia_14, amazon_reviews_multi_en e imdb, aunque no se especifica si se emplearon para entrenamiento o para evaluación. El autor declara un drift de permutación de 0,00000000 y una tasa de cambio de decisión del 0,00 %.

## Capacidades

- Selección categórica entre opciones (choice), devolviendo la opción más probable de un conjunto cerrado.
- Confianza booleana probabilística (noul), orientada a decisiones de sí/no con probabilidad calibrada.
- Puntuación ordinal (score) sobre rúbricas, útil para rankings graduados.
- Invariancia a permutaciones: el resultado no cambia al reordenar las opciones.
- Probabilidades calibradas: el autor reporta ECE 0,1121 y Brier 0,2018 como indicadores de fiabilidad de la confianza.
- Zero-shot sobre dominios no vistos explícitamente durante el ajuste.
- Enrutado de agentes y de peticiones (llm-router, agent-routing): decidir qué cola, herramienta o subagente debe atender una petición.
- Multilingüe según los metadatos (en, multilingual), sin detalle de cobertura por idioma.
- Despliegue en edge: el autor menciona artefactos ONNX, CoreML y MLX.
- No es un modelo generativo: no produce texto libre, solo puntuaciones y decisiones sobre candidatos.

## Casos de uso

- Enrutado de incidencias en atención al cliente: el modelo recibe el estado de la conversación y una lista de colas o acciones (por ejemplo, "verify_travel_unblock", "file_fraud_dispute") y devuelve la más adecuada con una probabilidad calibrada, lo que permite fijar umbrales de escalado a un agente humano.
- Selección de herramientas en agentes LLM: dado el contexto de una tarea y un catálogo de funciones disponibles, elegir cuál invocar; el escalado lineal O(K) evita el truncado cuando el catálogo es grande.
- Filtrado previo de candidatos en pipelines RAG: reducir de decenas de documentos o rutas a un top-3 antes de invocar un modelo generativo, usando la precisión top-3 declarada del 98 %.
- Moderación y clasificación temática: aprovechar los datasets de referencia (ag_news, dbpedia_14, trec) para tareas de categorización de contenido en inglés.
- Análisis de sentimiento y valoraciones: clasificación sobre sst5, imdb o yelp_review_full, con la ventaja de disponer de una confianza calibrada para decidir cuándo derivar el caso.
- Inferencia de relación textual (NLI): uso sobre multi_nli para etiquetado de implicación, neutralidad y contradicción dentro de un pipeline de verificación.
- Despliegue en dispositivo: el autor apunta a Apple Silicon y a artefactos CoreML/MLX, lo que permitiría ejecutar el modelo sin conexión en estaciones de trabajo o portátiles compatibles.
- Puerta de decisión en sistemas de agentes multi-paso: usar la probabilidad calibrada como criterio de parada o de reintento antes de ejecutar una acción irreversible.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados; el campo "verified" es false en todos los casos). El conjunto de evaluación es el "TAMEV Multi-Domain Benchmark Suite", propietario del autor y sin descripción pública disponible.

| Metrica | Resultado | Nota |
|---|---|---|
| Top-1 accuracy | 92,00 % | benchmark propietario "tamev-universal-benchmark" |
| Top-3 accuracy | 98,00 % | benchmark propietario |
| Expected Calibration Error (ECE) | 0,1121 | menor es mejor |
| Brier score | 0,2018 | strictly proper scoring rule |
| Permutation drift | 0,00000000 | 0,00 % de cambio de decisión |
| Latencia mediana (p50) | 574,18 ms | hardware no especificado |
| Latencia p95 | 2400,57 ms | |
| Throughput (un solo hilo) | 1,2 req/s | |

No se han publicado resultados en benchmarks estándar reconocidos (MMLU, HumanEval, GSM8K, GLUE, SuperGLUE, etc.) en la información disponible. Tampoco hay comparaciones con líneas base públicas verificables.

## Requisitos de hardware

- VRAM estimada para FP32: el autor declara 16937,4 MB (~16,5 GB), lo que exigiría GPU de gama profesional o clúster multi-GPU.
- VRAM estimada para INT8: el autor declara 4234,3 MB (~4,1 GB), compatible con GPU de consumo con al menos 6-8 GB de VRAM libre.
- Advertencia: estas cifras proceden de la model card y no concuerdan con el recuento real de parámetros de safetensors (1.311.232), por lo que deben tratarse como no fiables hasta su verificación.
- GPU recomendadas según el autor: Apple Silicon (estación de trabajo) y clúster multi-GPU. No se citan modelos concretos como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada. Si se toma el dato INT8 declarado, cabría en tarjetas tipo RTX 3060 12 GB o superiores; si se toma el dato real de safetensors, el modelo sería trivialmente ejecutable en cualquier equipo.
- Opciones de despliegue mencionadas en la información: transformers con trust_remote_code=True, además de artefactos ONNX, CoreML y MLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput declarados: 574,18 ms de mediana (p50), 2400,57 ms en p95 y 1,2 req/s en un solo hilo. El hardware de medida no se especifica.
- Nota: los "endpoints_compatible" del repositorio indican compatibilidad con la infraestructura de inferencia de HuggingFace.

## Comparativa con modelos similares

La model card cita como alternativas a "TypeSafe Jev", "Jared Palmer's Kev", "Laya" y "SemIf". No se ha encontrado información verificable sobre ninguno de ellos en los resultados de búsqueda disponibles, por lo que no es posible construir una comparativa con datos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TAMEV-Large-Qwen3.5-4B | 1.311.232 reales / 4440 M declarados | no disponible | 92 % top-1 (declarado, no verificado) | Apache 2.0 | HuggingFace |
| TypeSafe Jev | no disponible | no disponible | no disponible | no disponible | no disponible |
| Kev (Jared Palmer) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Laya | no disponible | no disponible | no disponible | no disponible | no disponible |
| SemIf | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contradicción de parámetros sin resolver: safetensors reporta 1.311.232 parámetros mientras la model card declara 4440,0 M activos. Esto afecta a cualquier estimación de VRAM, latencia o calidad.
- El backbone citado, Qwen/Qwen3.5-4B, no se ha podido verificar como modelo público, lo que pone en duda la procedencia de los pesos.
- Todos los benchmarks están marcados como verified: false y se miden sobre una suite propietaria ("tamev-universal-benchmark") sin descripción pública ni replicabilidad externa.
- El repositorio tiene 0 descargas y 0 likes, sin comunidad ni validación independiente; es un artefacto recién publicado.
- Confianza calibrada declarada (ECE 0,1121) pero no verificada: en producción conviene recalibrar sobre datos propios antes de fijar umbrales de decisión.
- No es un modelo generativo: no sirve para producir texto, resúmenes ni diálogo; solo clasifica o puntúa candidatos.
- No se especifica la longitud de contexto, lo que impide planificar el tamaño máximo de "state" de entrada.
- Cobertura multilingüe declarada de forma genérica (multilingual) sin lista de idiomas ni métricas por idioma; el castellano no está confirmado.
- Riesgo de sesgo no evaluado: no hay análisis de sesgo ni de comportamiento sobre subgrupos.
- Riesgo de alucinación reducido por diseño (no genera texto), pero persiste el riesgo de clasificación errónea en dominios fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución; no hay cláusulas de uso aceptable adicionales conocidas.
- Requiere trust_remote_code=True en transformers, lo que implica ejecutar código personalizado del repositorio: revisar el código antes de desplegarlo en entornos sensibles.
- La model card está truncada en el ejemplo de uso, por lo que el flujo completo de invocación no queda documentado en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tamkimd/tamev-large-qwen3.5-4b
- Repositorio GitHub del autor: https://github.com/tamkimd/tamev
- Backbone citado (no verificado): https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: no disponible
- Blog o demo: no disponible
- Los resultados de búsqueda web proporcionados no contienen enlaces relevantes al modelo (corresponden a artículos sobre ayuda de Windows y no guardan relación con TAMEV).
