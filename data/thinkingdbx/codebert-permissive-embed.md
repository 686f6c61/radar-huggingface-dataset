# thinkingdbx/codebert-permissive-embed

## Resumen

`codebert-permissive-embed` es un modelo de embeddings de código desarrollado por ThinkingDBx Pvt. Ltd. que convierte fragmentos de código o descripciones en lenguaje natural en vectores de 768 dimensiones. Su propósito principal es la búsqueda semántica de código: permite consultar un repositorio describiendo qué hace una función ("donde reintentamos una petición fallida") y recuperar el fragmento relevante aunque el código no contenga las palabras de la consulta. Está basado en una arquitectura BERT (CodeBERT) con 110,6 millones de parámetros y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en su transparencia sobre el origen de los datos de entrenamiento: todos los archivos fuente utilizados llevan licencias permisivas (MIT, Apache 2.0, BSD), se excluyeron archivos con licencias restrictivas o ausentes, y se eliminaron datos personales antes del entrenamiento. Esto lo convierte en una opción atractiva para entornos corporativos con requisitos estrictos de cumplimiento de licencias. El modelo está pensado como componente de retrieval en asistentes de código, búsqueda en bases de código grandes, deduplicación y agrupación de funciones.

No genera código ni responde preguntas: únicamente produce vectores. Está optimizado para emparejar descripciones en lenguaje natural con código, no para comparar código contra código. Su tamaño reducido lo hace adecuado para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (CodeBERT) con pooling medio sobre token embeddings |
| Parametros totales | 110.617.344 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea max_length=256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | codigo fuente (lenguajes de programacion; no se especifican cuales) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT original, adaptada al dominio del codigo. Se entrena en dos fases. En la primera, aprende la estructura general del codigo mediante masked language modeling sobre 3,97 mil millones de palabras de codigo. En la segunda, se ajusta con 857.000 pares de funciones y sus propias descripciones documentales para aprender a emparejar texto con codigo.

El conjunto de datos de entrenamiento se filtro rigurosamente por licencias: se examinaron 2.047.089 archivos fuente, de los cuales se conservaron 1.980.241 (96,7 por ciento) que portaban alguna de las 171 licencias permisivas aceptadas (MIT, Apache 2.0, BSD, entre otras). Se rechazaron 139 licencias y se descarto cualquier archivo sin licencia. Ademas, se eliminaron 1.384.479 piezas de datos personales (direcciones de correo, claves, etc.) antes del entrenamiento.

Para obtener embeddings con la libreria `transformers` se debe promediar la salida de los token embeddings ponderada por la mascara de atencion y normalizar el vector resultante. El modelo se publica tambien como modelo de `sentence-transformers`, que encapsula este proceso.

## Capacidades

- Genera embeddings de 768 dimensiones para codigo fuente y descripciones en lenguaje natural.
- Busqueda semantica de codigo: permite consultar "donde reintentamos una peticion fallida" y recuperar la funcion correcta aunque el codigo no contenga la palabra "retry".
- Deteccion de funciones duplicadas o casi duplicadas.
- Agrupacion de un repositorio desconocido en areas tematicas relacionadas.
- Componente de retrieval para asistentes de codigo: selecciona los archivos relevantes antes de pasarlos a un modelo de lenguaje.
- No soporta tool calling, agentes, vision ni audio. Tampoco genera codigo ni responde preguntas.

## Casos de uso

- Busqueda de codigo en lenguaje natural en repositorios grandes: un desarrollador describe lo que busca ("donde se valida el token de sesion") y el modelo devuelve las funciones relevantes, incluso si el codigo usa sinonimos o terminologia distinta.
- Deduplicacion de funciones en una base de codigo corporativa: se generan embeddings de todas las funciones y se comparan por similitud coseno para identificar copias o variantes casi identicas que deban consolidarse.
- Agrupacion de un repositorio heredado sin documentacion: se vectorizan las funciones y se aplican algoritmos de clustering para descubrir modulos o dominios funcionales, facilitando la navegacion y el refactoring.
- Retrieval en un asistente de codigo con RAG: antes de invocar un LLM para responder preguntas sobre una base de codigo, el modelo selecciona los archivos mas relevantes, reduciendo el contexto y mejorando la precision de las respuestas.
- Indexacion de documentacion tecnica junto con codigo: se pueden emparejar parrafos de documentacion con las funciones que describen, creando vinculos automaticos entre docs y implementacion.
- Filtrado de repositorios por funcionalidad: en un entorno de busqueda de codigo abierto, se pueden clasificar proyectos por la funcion que cumplen (autenticacion, parsing, redes, etc.) a partir de descripciones en lenguaje natural.

## Benchmarks y rendimiento

El modelo publica resultados en CoIR, un benchmark publico de busqueda de codigo, medidos con NDCG@10 (cuanto mas alto, mejor). La siguiente tabla reproduce los datos de la model card. Las celdas vacias indican que el valor no fue medido, no que sea cero.

| Test | Este modelo | Version anterior | BM25 | UniXcoder | GTE-Base | E5-Base |
|---|---|---|---|---|---|---|
| CodeSearchNet, Python | 87.84 | | | | | |
| CodeSearchNet, Go | 68.71 | 53.43 | | | | |
| CodeSearchNet, Ruby | 56.52 | 40.68 | | | | |
| Stack Overflow questions | 55.35 | 58.40 | 56.80 | 44.67 | 62.71 | 86.86 |
| CodeSearchNet, PHP | 53.36 | | | | | |
| CodeSearchNet, JavaScript | 50.41 | 38.73 | | | | |
| Code feedback, single turn | 48.58 | | | | | |
| Text to SQL | 35.73 | | | | | |
| CoSQA | 25.95 | 20.91 | 13.96 | 25.14 | 30.24 | 32.59 |
| Code translation | 24.12 | 28.14 | 50.13 | 41.82 | 33.81 | 62.50 |
| Code feedback, multi turn | 21.78 | | | | | |
| Programming problems | 2.83 | 3.08 | | | | |

Los valores de comparacion para BM25, UniXcoder, GTE-Base y E5-Base provienen de la tabla 3 del paper de CoIR (arXiv:2407.02883). La columna "version anterior" corresponde a una build previa de este modelo, medida en el mismo entorno. No se proporciona una puntuacion media porque dos de los tests de CoIR no se ejecutaron.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentacion del modelo.
- Con 110,6 millones de parametros, el modelo en precision FP32 ocupa aproximadamente 440 MB; en FP16, unos 220 MB. Esto permite ejecutarlo en cualquier GPU consumer moderna con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1060, RTX 2060, RTX 3060 y superiores.
- Es viable incluso en CPU para inferencia por lotes pequenos, aunque la latencia sera mayor.
- Opciones de despliegue: `sentence-transformers` (recomendado), `transformers` con pooling manual, y `text-embeddings-inference` (el modelo declara compatibilidad con esta herramienta en sus metadatos).
- Al ser un modelo de embeddings, el throughput depende del tamano del lote y de la longitud de los fragmentos. Con una GPU moderna se pueden procesar miles de fragmentos por segundo en lotes de 32-64.

## Comparativa con modelos similares

El propio autor reconoce que modelos generalistas del mismo tamano, como E5-Base, BGE y GTE-Base, entrenados con cientos de millones de ejemplos que incluyen texto ordinario y codigo, obtienen mejores resultados en la mayoria de pruebas. La siguiente tabla compara los resultados disponibles en CoIR:

| Modelo | Parametros | Stack Overflow (NDCG@10) | CoSQA (NDCG@10) | Code translation (NDCG@10) | Licencia |
|---|---|---|---|---|---|
| codebert-permissive-embed | 110,6 M | 55.35 | 25.95 | 24.12 | Apache 2.0 |
| E5-Base | ~110 M | 86.86 | 32.59 | 62.50 | MIT |
| GTE-Base | ~110 M | 62.71 | 30.24 | 33.81 | Apache 2.0 |
| UniXcoder | ~125 M | 44.67 | 25.14 | 41.82 | MIT |

La ventaja diferencial de `codebert-permissive-embed` no es el rendimiento bruto, sino la trazabilidad completa de sus datos de entrenamiento: todas las fuentes tienen licencias permisivas verificadas y se eliminaron datos personales. Para casos donde la procedencia de los datos es un requisito legal o corporativo, este modelo ofrece una garantia que los modelos generalistas no documentan.

## Limitaciones y advertencias

- Modelo pequeno (110 M de parametros) entrenado con aproximadamente 857.000 pares descripcion-codigo, muy por debajo de los cientos de millones de ejemplos usados por E5, BGE o GTE. Su rendimiento es inferior en la mayoria de benchmarks publicos.
- Debil en emparejamiento codigo-codigo: no fue entrenado para encontrar la version Java de una funcion Python, por ejemplo. Solo funciona bien con descripciones en lenguaje natural pareadas con codigo.
- No genera codigo ni responde preguntas; solo produce vectores. Intentar usarlo como LLM dara resultados inutiles.
- Riesgo de alucinacion no aplica directamente (no genera texto), pero los embeddings pueden ser poco discriminativos en dominios muy especificos o con vocabulario distinto al del entrenamiento.
- No se especifican los lenguajes de programacion soportados ni la longitud de contexto maxima oficial. El ejemplo de uso emplea 256 tokens, pero no hay garantia de que fragmentos mas largos funcionen correctamente.
- No se proporcionan datos sobre sesgos o comportamientos en codigo ofuscado, generado automaticamente o con estilos muy atipicos.
- Para produccion, se recomienda validar el rendimiento en el propio corpus antes de desplegarlo, dado que los benchmarks publicos muestran resultados mixtos frente a alternativas generalistas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thinkingdbx/codebert-permissive-embed
- Paper de CoIR (benchmark de referencia): https://arxiv.org/abs/2407.02883
- Repositorio con datos de entrenamiento y metricas: los archivos `lineage.json`, `benchmark.json` y `retrieval.json` estan incluidos en el repositorio del modelo en HuggingFace.
