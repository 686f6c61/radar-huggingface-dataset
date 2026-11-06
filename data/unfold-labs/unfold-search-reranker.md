# unfold-labs/unfold-search-reranker

## Resumen

Unfold search reranker es un cross-encoder de reordenación (reranking) en francés e inglés, publicado por unfold-labs y derivado del modelo base `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`. Su función es puntuar una consulta del usuario contra los 30 mejores extractos recuperados por un motor de búsqueda y reordenarlos para colocar los más relevantes primero. Se distribuye en formato ONNX cuantizado a INT8 y está pensado para ejecutarse en local, sobre CPU, dentro de la aplicación Unfold Note (búsqueda sobre notas de Obsidian).

El modelo no introduce entrenamiento nuevo: es una redistribución del cross-encoder base bajo su misma licencia Apache 2.0, con la única adición de la cuantización dinámica por canal de onnxruntime. Por tanto, su relevancia no reside en una mejora algorítmica propia, sino en empaquetar un reranker multilingüe (fr/en) listo para inferencia offline en el dispositivo, con verificación de integridad mediante hashes sha256.

Arquitectura transformer de tipo cross-encoder con 12 capas y dimensión oculta 384 (MiniLM), ventana de 512 tokens para el par consulta-extracto y puntuación mediante el logit de salida. Es un modelo pequeño y de bajos requisitos que prioriza latencia y despliegue en CPU frente a capacidad de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cross-encoder (MiniLM, 12 capas, dimensión oculta 384) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens para el par consulta-extracto (max_len) |
| Tipos de cuantizacion | INT8 (onnxruntime dynamic, per channel); el repositorio incluye `model.int8.onnx` |
| Idiomas soportados | francés (fr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8); fichero de integridad `reranker-model.json` con tamaños y sha256 |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en MiniLM: recibe el par (consulta, extracto) de forma conjunta y produce una puntuación de relevancia a partir del logit de la primera posición (`score = logit[0]`). El modelo base, `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`, fue entrenado sobre el dataset MMARCO, una versión traducida automáticamente con Google Translate de MS MARCO a 14 idiomas. No se ha realizado entrenamiento adicional ni ajuste fino por parte de unfold-labs: el repositorio redistribuye el modelo base bajo su licencia, añadiendo únicamente la cuantización INT8.

La innovación técnica destacable es el empaquetado para inferencia offline: cuantización dinámica por canal con onnxruntime, ejecución en CPU con 4 hilos de referencia y verificación de integridad de los ficheros tras la descarga. La cuantización INT8 no degrada la calidad de reordenación según las métricas publicadas (MRR INT8 = 0,831 frente a fp32 = 0,831).

## Capacidades

- Reordenación de resultados de búsqueda: puntúa pares consulta-extracto y ordena por relevancia.
- Búsqueda semántica sobre texto en francés e inglés (heredada del modelo base multilingüe).
- Puntuación de hasta 30 candidatos por consulta en el flujo de la aplicación.
- Inferencia offline en CPU mediante onnxruntime, sin dependencia de GPU.
- Verificación de integridad de los pesos mediante hashes sha256.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de ranking, no generativo.
- No dispone de capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Búsqueda local sobre notas personales: integrado en Unfold Note, reordena los extractos recuperados de un vault de Obsidian para que las notas más relevantes aparezcan primero, ejecutándose en el dispositivo sin enviar contenido a servidores externos.
- Búsqueda híbrida palabra + significado: se combina con recuperación léxica y embeddings (e5 fren-int8 en la evaluación del autor) para mejorar hits@8 y MRR sobre la recuperación base.
- Asistentes de documentación interna en fr/en: reordenar fragmentos de manuales o wikis antes de pasarlos a un LLM generador, reduciendo el ruido en el contexto.
- Sistemas de preguntas y respuestas sobre corpus bilingües: filtrar los pasajes candidatos en francés e inglés antes de la generación de respuestas.
- Aplicaciones de escritorio o móviles con requisitos de privacidad: al ejecutarse en CPU con ONNX, encaja en entornos sin GPU y con datos que no pueden salir del dispositivo.
- Motores de búsqueda de código abierto: sustituir o complementar la etapa de reordenación en pipelines tipo Elasticsearch/OpenSearch con un cross-encoder ligero.
- Prototipado rápido de ranking: al ser un modelo pequeño y cuantizado, permite iterar sobre umbrales y configuraciones con latencias de milisegundos en hardware de consumo.

## Benchmarks y rendimiento

Métricas publicadas por el autor, medidas con el código de búsqueda de la aplicación sobre un vault sintético de 60 notas y 40 preguntas (fr/en) y sobre el vault real del propietario (solo puntuaciones):

| Gate | Barra | Valor | Resultado |
|---|---|---|---|
| hits8_bootstrap_real | hits@8 o ganancia de MRR con intervalo bootstrap 95 % que excluya cero, y hits@8 sin caída | hits8: 0,865 → 0,904 (delta 0,038; IC95 [0,0; 0,096]); MRR: 0,688 → 0,831 (delta 0,143; IC95 [0,067; 0,225]) | pass |
| rerank_latency_30 | mediana ≤ 1,5 s para 30 candidatos en PC de referencia (i7-14700F, 4 hilos) | real p50 1425 ms; real p95 1838 ms; bounded real p50 1412 ms; sintético p50 430 ms | pass |
| int8_mrr_vs_fp32 | MRR INT8 ≥ MRR fp32 − 0,02 | INT8 0,831; fp32 0,831 | pass |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU.
- Tamaño del repositorio: 0,4 GB (incluye el fichero ONNX INT8 y metadatos de integridad).
- CPU de referencia: Intel i7-14700F con 4 hilos; latencia mediana de 1425 ms para 30 candidatos en el vault real y 430 ms en el conjunto sintético.
- GPU: no requerida; no se documentan requisitos de GPU.
- Cabe en cualquier equipo de consumo, incluidos portátiles y dispositivos de gama media, al ejecutarse en CPU.
- Despliegue: onnxruntime (runtime documentado por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato y tarea.
- Latencia estimada: p50 ≈ 1,4 s y p95 ≈ 1,8 s para 30 candidatos en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| unfold-search-reranker | no disponible (MiniLM-L12-H384) | 512 tokens (par) | fr, en | Apache 2.0 | ONNX INT8 |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 (base) | no disponible (MiniLM-L12-H384) | 512 tokens | multilingüe (14 idiomas vía MMARCO) | Apache 2.0 | safetensors / PyTorch |
| cross-encoder/ms-marco-MiniLM-L-12-v2 | no disponible (MiniLM-L12) | 512 tokens | en | Apache 2.0 | safetensors / PyTorch |

La comparativa se limita a modelos de la misma familia y tarea; no se dispone de datos de rendimiento comparativos entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de ranking, no generativo: no produce texto, no razona y no admite tool calling.
- Cobertura lingüística limitada a francés e inglés; el rendimiento en otros idiomas no está documentado.
- Ventana de 512 tokens para el par consulta-extracto: extractos más largos deben truncarse, con posible pérdida de señal.
- Sesgos heredados del dataset MMARCO (traducción automática de MS MARCO con Google Translate), incluidos posibles sesgos de género, culturales y de dominio.
- Riesgo de falsos positivos y negativos en la puntuación de relevancia; no se han publicado métricas de calibración.
- Las métricas publicadas se basan en un vault sintético pequeño (60 notas, 40 preguntas) y en el vault privado del autor, por lo que su generalización a otros dominios no está validada.
- Licencia Apache 2.0: permite uso comercial, pero se mantiene la atribución al modelo base y a sus condiciones.
- Dependencia de la versión mínima de la aplicación (2.8.0) y del runtime onnxruntime para la verificación de integridad.

## Enlaces

- Hugging Face: https://huggingface.co/unfold-labs/unfold-search-reranker
- Modelo base: https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
- Dataset MMARCO: https://huggingface.co/datasets/unicamp-dl/mmarco
- Sitio del autor: https://unfold.com/
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web.
