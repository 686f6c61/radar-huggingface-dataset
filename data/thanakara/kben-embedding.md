# thanakara/kben-embedding

## Resumen

kben-embedding es un modelo de embeddings de frases especializado en recuperación de pasajes (retrieval) sobre documentación técnica en griego del ámbito de software empresarial: nóminas y recursos humanos, fiscalidad y ERP. Lo desarrolla el usuario thanakara y se distribuye con licencia Apache 2.0. Parte de un ajuste fino completo de Snowflake/snowflake-arctic-embed-l-v2.0, un transformer basado en XLM-RoBERTa de 567.754.752 parámetros, y se publica como un "model soup": la media elemento a elemento de dos ajustes finos completos que solo difieren en la semilla aleatoria.

El problema que resuelve es concreto: un asistente aumentado por recuperación (RAG) que debe localizar el pasaje exacto de un artículo de ayuda en griego a partir de consultas de usuarios reales, incluidas variantes sin acentos, en mayúsculas, con erratas o escritas en greeklish (griego transcrito a caracteres latinos). Sobre consultas de test retenidas de artículos nunca vistos en entrenamiento, el modelo eleva nDCG@10 de 0,608 a 0,742 y recall@1 de 0,425 a 0,553 respecto al modelo base.

Es relevante ahora porque demuestra que un ajuste fino con negativos duros minados y datos sintéticos multiforma puede aportar mejoras sustanciales en dominios verticales y lenguas de recursos medios, donde los embeddings multilingües genéricos rinden de forma mediocre. El modelo está pensado y evaluado exclusivamente para pasajes de hasta 192 tokens con el título del artículo antepuesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), base Snowflake/snowflake-arctic-embed-l-v2.0 |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como límite formal; entrenado y evaluado con pasajes de hasta 192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con text-embeddings-inference) |
| Idiomas soportados | Griego (el); consultas en greeklish tratadas como superficie de la misma lengua |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Snowflake/snowflake-arctic-embed-l-v2.0, un encoder transformer de tipo XLM-RoBERTa con 567,7 millones de parámetros. El ajuste es completo (no LoRA), con `CachedMultipleNegativesRankingLoss` (escala 20), lotes de 64 consultas con sus negativos duros, learning rate 1e-5, 10 % de warmup seguido de decaimiento lineal, precisión bf16 y hasta 5 épocas. Los lotes son "group-aware": no comparten lote dos filas de la misma consulta ni filas cuyos pasajes sean relevantes para la consulta de otra fila, para evitar que los negativos in-batch empujen lejos respuestas correctas. Se conserva la mejor época según nDCG@10 de desarrollo (épocas 3 y 4 para las dos semillas).

Los datos de entrenamiento proceden de cuatro bases de conocimiento de un único proveedor de software empresarial: 1.234 artículos troceados en 9.278 pasajes, de los cuales 333 artículos son notas de versión mantenidas como distractores buscables. Las consultas son sintéticas, generadas por tres LLM a partir de pasajes concretos, en tres formas (pregunta, descripción de problema y palabras clave) y cada una también en greeklish; se usan 2.367 consultas en entrenamiento y los splits se hacen por familia de artículos, de modo que los artículos de test nunca se ven en entrenamiento. En total hay 5.226 filas de entrenamiento (2.613 pares consulta–pasaje, cada uno con la consulta en griego y en greeklish) y hasta 4 negativos duros por fila, minados del ranking del propio modelo base con minería consciente del positivo (puntuación inferior al 95 % de la del positivo y nunca un pasaje relevante para la consulta).

La innovación destacable es doble: la minería de negativos duros a partir del ranking del modelo base (que aporta +0,048 de nDCG@10 frente a usar solo negativos in-batch) y el model soup de dos semillas, liberado bajo una regla fijada antes de construirlo (publicar si no empeora respecto a la mejor semilla en desarrollo; en desarrollo empata con +0,0004, IC 95 % [−0,0051, +0,0058]). Un experimento con LoRA (r 16, una semilla) conservó la mayor parte de la ganancia pero quedó por debajo del ajuste completo (−0,012, IC 95 % [−0,022, −0,002]).

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de pasajes (pipeline `sentence-similarity`, tarea `feature-extraction`/`retrieval`).
- Codificación asimétrica consulta/documento: las consultas llevan el prefijo `query: ` y los documentos no llevan prefijo.
- Vectores normalizados, de modo que el producto escalar equivale a la similitud coseno.
- Recuperación robusta a superficies de consulta degradadas: sin acentos, en mayúsculas, con erratas y en greeklish (esta última mucho mejor si se translitera antes a griego).
- Soporte de greeklish como forma de consulta nativa tras el entrenamiento, con nDCG@10 de 0,522 en test frente a 0,096 del modelo base.
- Integración con sentence-transformers (`encode_query`, `encode_document`, `similarity`) y compatibilidad con text-embeddings-inference y endpoints.
- Capacidad multilingüe: no disponible más allá del griego; el modelo está entrenado y evaluado solo en griego.
- Tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible (es un modelo de embeddings, no generativo).

## Casos de uso

- Asistente RAG de documentación de nóminas y recursos humanos: indexar los 9.278 pasajes de las bases de conocimiento y recuperar el artículo exacto ante preguntas como el cálculo del aguinaldo de Navidad para trabajadores por horas, aprovechando la ganancia de recall@1 de 0,425 a 0,553 en test.
- Búsqueda interna en documentación fiscal y ERP: el modelo cubre cuatro bases de conocimiento del mismo proveedor y mejora entre +0,095 y +0,170 de nDCG@10 por base en test, lo que lo hace adecuado para un buscador unificado entre módulos.
- Atención al helpdesk con consultas escritas por usuarios reales: la robustez a mayúsculas (nDCG@10 de 0,667 en test frente a 0,481 del base) y a erratas (0,727 frente a 0,560) reduce la necesidad de normalizar la entrada antes de buscar.
- Búsqueda tolerante a greeklish en soporte telefónico o chat: muchos usuarios escriben griego con caracteres latinos; el modelo sube de 0,096 a 0,522 en test, y con un normalizador de transliteración previo alcanza 0,736, por lo que encaja en un pipeline con preprocesado de la consulta.
- Deduplicación y clustering de artículos de ayuda: los embeddings normalizados permiten agrupar pasajes similares; conviene excluir las notas de versión, que el modelo tiende a colapsar en una única región (coseno mediano de 0,83 entre notas distintas).
- Enrutado de consultas a la base de conocimiento correcta: dado que el modelo se evaluó sobre las cuatro bases conjuntamente, puede usarse para clasificar a qué módulo (nóminas, fiscal, ERP) pertenece una consulta antes de lanzar la recuperación.
- Filtrado de candidatos en pipelines de CI de documentación: al ser un encoder de 567 millones de parámetros con pesos safetensors y compatibilidad con text-embeddings-inference, se puede desplegar como servicio de embeddings dedicado junto al generador del RAG.

## Benchmarks y rendimiento

Recuperación de pasajes sobre los 9.278 pasajes completos; un pasaje es relevante si contiene la evidencia sobre la que se escribió la consulta. Desarrollo (702 consultas) se usó para elegir épocas, por lo que es optimista; test (703 consultas, un solo generador, las tres formas) se puntuó una única vez tras todas las decisiones.

| Consultas `text` | dev, base | dev, este modelo | test, base | test, este modelo |
|---|---|---|---|---|
| nDCG@10 | 0,734 | 0,823 | 0,608 | 0,742 |
| recall@1 | 0,567 | 0,665 | 0,425 | 0,553 |
| MRR@10 | 0,694 | 0,786 | 0,561 | 0,699 |
| recall@10 | 0,880 | 0,947 | 0,770 | 0,888 |
| recall@20 | 0,933 | 0,966 | 0,829 | 0,937 |

Por forma de consulta en test, la mejora de nDCG@10 es de +0,129 [+0,090, +0,168] para preguntas, +0,117 [+0,074, +0,159] para descripciones de problema y +0,155 [+0,118, +0,194] para palabras clave. Por base de conocimiento, entre +0,095 y +0,170.

| Superficie de consulta (nDCG@10) | dev, base | dev, este modelo | test, base | test, este modelo |
|---|---|---|---|---|
| `text` | 0,734 | 0,823 | 0,608 | 0,742 |
| `no-accents` | 0,704 | 0,804 | 0,576 | 0,730 |
| `caps` | 0,556 | 0,748 | 0,481 | 0,667 |
| `typos` | 0,695 | 0,807 | 0,560 | 0,727 |
| `greeklish` | 0,131 | 0,586 | 0,096 | 0,522 |
| `greeklish/n` | 0,713 | 0,805 | 0,597 | 0,736 |

Ablaciones en desarrollo (dos semillas por brazo): los negativos duros minados superan a los negativos in-batch solos en +0,048 [+0,037, +0,060] de nDCG@10; LoRA (r 16, una semilla) queda −0,012 [−0,022, −0,002] respecto al ajuste completo de la misma semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud para un encoder de 567,7 millones de parámetros en bf16, la huella de pesos ronda 1,1 GB, más activaciones y overhead del runtime; el tamaño del repositorio es de 2,3 GB.
- GPU recomendadas: no disponible en la información proporcionada. No se publican latencias ni throughput.
- Cabe en GPU de consumo: no disponible en la información proporcionada; no se especifican requisitos mínimos.
- Opciones de despliegue: sentence-transformers (librería declarada), text-embeddings-inference y endpoints compatibles (etiquetas `text-embeddings-inference` y `endpoints_compatible`). Otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | nDCG@10 en test (mismo conjunto) |
|---|---|---|---|---|---|
| thanakara/kben-embedding | 567.754.752 | pasajes de hasta 192 tokens | Griego | Apache 2.0 | 0,742 |
| Snowflake/snowflake-arctic-embed-l-v2.0 (base) | 567.754.752 | no disponible | Multilingüe | no disponible en la información | 0,608 |
| Alternativas de embeddings multilingües genéricos | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos en la información proporcionada es contra el modelo base, del que este es un ajuste fino. No se aportan resultados de otros modelos de embeddings en el mismo conjunto de evaluación, por lo que no es posible una comparativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Consultas sintéticas: todas las consultas de evaluación fueron escritas por un LLM; las consultas de usuarios reales diferirán y el rendimiento en producción puede ser inferior al reportado.
- Greeklish: la mejora es grande (0,10 a 0,52 en test) pero sigue muy por debajo del griego nativo; es necesario transliterar a griego y restaurar acentos antes de la búsqueda para acercarse a 0,736.
- Colapso de notas de versión: las notas de versión fueron a menudo negativos duros y nunca positivos, por lo que el modelo las agrupa en una región alejada de toda consulta. El pasaje erróneo más cercano es una nota de versión para el 0,4 % de las consultas de test (17,8 % en el base), pero dos notas distintas son difíciles de distinguir (coseno mediano 0,83 frente a 0,40 del base). Las preguntas sobre qué cambió en una versión no son el punto fuerte del modelo.
- Especificidad de dominio: evaluado solo en documentación de un proveedor de software empresarial (nóminas y RR. HH., fiscalidad, ERP); no hay evidencia de transferencia a otros dominios ni a otros registros del griego.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no aplica directamente al ser un modelo de embeddings no generativo, pero los errores de recuperación pueden inducir alucinaciones en el generador del RAG que consuma sus resultados.
- Restricciones de licencia: Apache 2.0 permite uso comercial; conviene verificar las condiciones del modelo base Snowflake/snowflake-arctic-embed-l-v2.0, cuya licencia no se detalla en la información disponible.
- Los datos de entrenamiento no se redistribuyen y pertenecen a un único proveedor, lo que limita la reproducibilidad del ajuste.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thanakara/kben-embedding
- Modelo base: https://huggingface.co/Snowflake/snowflake-arctic-embed-l-v2.0
