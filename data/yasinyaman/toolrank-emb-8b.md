# yasinyaman/toolrank-emb-8b

## Resumen

toolrank-emb-8b es un modelo de embeddings de texto para recuperación de herramientas (tool retrieval), publicado por el desarrollador yasinyaman bajo el identificador `yasinyaman/toolrank-emb-8b` y en su revisión `v0.2`. Se construye a partir de Qwen/Qwen3-Embedding-8B, al que se le aplica un LoRA (rango 16, alpha 32, dropout 0,05) entrenado sobre pares petición-herramienta y posteriormente fusionado en los pesos. El resultado es un modelo denso de 8.188.515.328 parámetros (unos 8,2 mil millones) que mantiene la tokenizador, el pooling de último token, las 4096 dimensiones y la normalización L2 del modelo base; solo cambian los pesos.

El problema que resuelve es concreto: dado el catálogo de herramientas de un agente (por ejemplo, herramientas MCP o endpoints OpenAPI descritos como JSON), decidir cuáles son relevantes para una petición del usuario. Es el backbone por defecto del proyecto toolrank, y su uso previsto es generar vectores tanto de la petición como de cada herramienta para ordenar estas últimas por similitud. Según los resultados publicados por el autor, la mejora frente al modelo base se concentra en peticiones que requieren varias herramientas, mientras que en peticiones de una sola herramienta en lenguaje llano el rendimiento es prácticamente idéntico al del base.

Su relevancia actual viene del auge de los agentes basados en MCP y del function calling sobre catálogos grandes: en ToolRet, el conjunto de evaluación, hay 44.453 herramientas y 7.961 consultas. La licencia de los pesos es Apache-2.0, pero el autor advierte explícitamente de que los datos de entrenamiento (mangopy/ToolRet-Training-20w) no declaran licencia, lo que introduce un riesgo de procedencia que conviene evaluar antes de un despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-Embedding-8B) con pooling de ultimo token, salida de 4096 dimensiones y normalizacion L2; LoRA fusionado en los pesos |
| Parametros totales | 8.188.515.328 (unos 8,2 mil millones) |
| Longitud de contexto | 8192 tokens por texto (limite configurado en el ejemplo de serving con vLLM); durante el entrenamiento las peticiones se truncaron a 256 tokens y las herramientas a 768 |
| Tipos de cuantizacion | bfloat16 (pesos publicados); FP8 mediante `--quantization fp8` en vLLM, con resultados publicados por el autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 en los pesos; los datos de entrenamiento no declaran licencia |
| Formato de pesos | safetensors (`model.safetensors`, bfloat16, 16,4 GB) |
| Dimension de embedding | 4096 (heredada del modelo base) |
| Pooling | ultimo token |
| Revision | `v0.2` (sha256 `53789cfff18f631fa7e6494bcf8d2db7b5c18a25d2a239443b1614a5eacb7f42`) |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-Embedding-8B: un transformer denso de unos 8,2 mil millones de parámetros con pooling de último token, 4096 dimensiones de salida y normalización L2. La intervención del autor es un LoRA de rango 16, alpha 32 y dropout 0,05 aplicado sobre ese modelo y fusionado después en los pesos; el tokenizador, el pooling y la configuración no se modifican. El modelo no lleva cabezas adicionales: las cabezas de toolrank v0.1, entrenadas sobre el modelo base, cuestan entre 1 y 2 puntos cuando se aplican aquí, y las cabezas entrenadas sobre este modelo se quedan en la identidad, por lo que toolrank no aplica ninguna.

El entrenamiento usa 20.000 pares petición-herramienta extraídos de ToolRet-Training-20w (semilla 0); se descartaron 776 pares cuyas peticiones coincidían con alguna de ToolRet, LiveMCPBench o MCP-Zero. El objetivo es InfoNCE con negativos dentro del lote y temperatura 0,05. La optimización consistió en una época, 625 pasos, micro-lote de 16 con 2 pasos de acumulación, tasa de aprendizaje 1e-4 y 50 pasos de calentamiento, con un coste de 8,6 horas en una única GB10. El checkpoint (cada 300 pasos y el último) se seleccionó sobre MCP-Zero (`mcp_zero_server`), de modo que las cifras de ese conjunto son de selección y no de retención. Antes de entrenar, el autor verificó que los vectores del código de entrenamiento coincidían con los del modelo base servido (coseno medio de 0,9999 sobre 8 textos de herramientas), de forma que el LoRA aprendió sobre los vectores que vLLM sirve realmente.

La innovación es de enfoque más que de arquitectura: en lugar de añadir cabezas de clasificación o reranking, se ajusta el propio espacio de embeddings para el dominio de recuperación de herramientas, y se documenta una segunda etapa opcional de reranking con Qwen3-Reranker-8B sobre el top 20.

## Capacidades

- Generacion de embeddings de texto de 4096 dimensiones, normalizados L2, para similitud semantica y recuperacion.
- Recuperacion de herramientas (tool retrieval): dado un catalogo, ordena las herramientas por afinidad con la peticion.
- Soporte nativo de descripciones de herramientas MCP y OpenAPI en formato JSON con los campos `server`, `name`, `description` e `inputSchema`.
- Plantilla de instruccion especifica: `Instruct: Given an agent's request for a tool, retrieve the MCP tool that fulfills it.\nQuery: <request>`.
- Capacidad de integrarse como etapa de recuperacion dentro de agentes con multiples pasos, alimentando la seleccion de herramientas antes de la llamada al LLM.
- Reranking en dos etapas: puede combinarse con Qwen3-Reranker-8B sobre su top 20 (`toolrank serve --rerank cross`).
- Compatible con text-embeddings-inference y con endpoints compatibles segun las etiquetas del repositorio.
- Capacidades multilingues: no disponible (la plantilla de instruccion esta en ingles y no se publican evaluaciones por idioma).
- No es un modelo generativo: no produce texto, razonamiento ni codigo, solo representaciones vectoriales.

## Casos de uso

- Enrutamiento de herramientas en agentes MCP: el modelo convierte la peticion del usuario y cada herramienta del servidor MCP en vectores, y devuelve las mas cercanas. Es util cuando el catalogo es grande y no cabe completo en el prompt del LLM.
- Seleccion de herramientas en pipelines de function calling: en catalogos de decenas de miles de entradas (ToolRet tiene 44.453), permite preseleccionar un subconjunto pequeno antes de que el LLM decida que funcion invocar.
- Tareas que requieren varias herramientas: segun los datos del autor, la proporcion de tareas con todas sus herramientas en el top 10 sube del 72,1% al 89,5% en tareas de dos herramientas y del 33,9% al 64,5% en tareas de tres, lo que lo hace adecuado para flujos multi-paso donde hay que recuperar una combinacion de herramientas.
- Segunda etapa de reranking sobre candidatos: combinado con Qwen3-Reranker-8B sobre su top 20, los resultados publicados suben a 59,36/54,35 en ToolRet, 61,24 en LiveMCPBench y 91,94 de top-1 en MCP-Zero, lo que encaja en arquitecturas de recuperacion en cascada.
- Indexacion de catalogos de APIs OpenAPI: al aceptar descripciones con `server`, `name`, `description` e `inputSchema`, sirve para construir indices vectoriales de APIs internas o de terceros (el autor evalua con catalogos de GitHub y Stripe).
- Asistentes de codigo que eligen entre APIs: los experimentos del autor sobre 800 tareas generadas que necesitan dos herramientas muestran una mejora de 71,04 a 82,95 en NDCG@10, lo que lo hace util para asistentes que deben encadenar llamadas a APIs.
- Busqueda semantica sobre documentacion tecnica de herramientas internas: cualquier corpus de descripciones de funciones o microservicios puede indexarse y consultarse por similitud, con una ventana de 8192 tokens por texto.
- Evaluacion y benchmarking de agentes: sirve como recuperador de referencia en pruebas internas de seleccion de herramientas, con conjuntos publicos como ToolRet, LiveMCPBench o MCP-Zero.

## Benchmarks y rendimiento

Resultados publicados por el autor, con instruccion y cada conjunto bajo su propio protocolo:

| Modelo | ToolRet NDCG@10 (micro / cat-macro) | LiveMCPBench NDCG@10 / Recall@5 | MCP-Zero top-1 (conjunto de seleccion) |
|---|---:|---:|---:|
| Qwen3-Embedding-8B | 51,11 / 46,54 | — / 50,82 | 78,19 |
| Qwen3-Embedding-8B + cabezas toolrank v0.1 | 54,03 / 47,13 | 53,95 / 53,03 | 79,87 |
| toolrank-emb-8b (este modelo) | 58,90 / 54,36 | 55,74 / 52,06 | 88,57 |
| toolrank-emb-8b en FP8 (`--quantization fp8`) | 59,02 / 54,53 | 55,34 / 52,06 | 87,71 |
| toolrank-emb-8b + cabezas toolrank v0.1 | — | 53,52 / 48,18 | 87,46 |

Con segunda etapa de reranking sobre el top 20 mediante Qwen3-Reranker-8B: ToolRet 59,36/54,35, LiveMCPBench 61,24 y MCP-Zero top-1 91,94.

Detalle por tipo de tarea (NDCG@10, base frente a este modelo, conjuntos de retencion salvo donde se indique):

| Conjunto | Naturaleza | Base → este modelo |
|---|---|---|
| ToolRet | distribucion de entrenamiento | 51,11 → 58,90 |
| MCP-Zero, top-1 | conjunto de seleccion | 78,19 → 88,57 |
| LiveMCPBench | retencion, tareas multi-paso en lenguaje llano | 53,74 → 55,74 (no significativo, 94 tareas) |
| GitHub + Stripe, 800 tareas de dos herramientas | retencion | 71,04 → 82,95 |
| GitHub + Stripe, 498 tareas de tres herramientas | retencion | 55,21 → 75,40 |
| GitHub + Stripe, 1000 peticiones de una herramienta | retencion | 92,99 → 92,49 |
| GitHub + Stripe, 598 peticiones de una herramienta que describen un problema | retencion | 89,67 → 87,71 |

Tamanos de los conjuntos: ToolRet, 44.453 herramientas y 7.961 consultas; LiveMCPBench, 525 herramientas y 94 tareas; MCP-Zero, 2.792 herramientas con una peticion escrita por un LLM por herramienta. En los dos conjuntos MCP el nombre del servidor forma parte del texto de la herramienta.

## Requisitos de hardware

- Pesos en bfloat16: 16,4 GB en disco (`model.safetensors`). La VRAM de inferencia en bfloat16 se situa por encima de ese valor (estimacion de 18 a 22 GB, no publicada por el autor).
- Cuantizacion FP8 en vLLM: reduce el peso a aproximadamente la mitad; el autor publica resultados con `--quantization fp8` sin perdida apreciable en los conjuntos medidos (por ejemplo, 59,02 frente a 58,90 en ToolRet).
- GPU recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para bfloat16 con margen; H100 y L40S para FP8 por soporte de Ada/Hopper.
- GPU de consumo: una RTX 4090 de 24 GB puede alojar los pesos en bfloat16 de forma ajustada, y en FP8 con mas holgura; no hay datos publicados de latencia en estas tarjetas.
- Despliegue: vLLM con `--runner pooling`, `--max-model-len 8192` y nombre de modelo con version (`--served-model-name toolrank-emb-v0.2`), tal como documenta el autor; tambien sentence-transformers (`library_name`) y text-embeddings-inference segun las etiquetas del repositorio, ademas de endpoints compatibles.
- Cache de embeddings: el autor advierte de que la cache de toolrank usa como clave el nombre servido, por lo que una version nueva no debe reutilizar el nombre de la anterior.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es de entrenamiento (8,6 horas en una GB10 para 625 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ToolRet NDCG@10 (micro) | LiveMCPBench NDCG@10 | MCP-Zero top-1 | Licencia |
|---|---|---|---:|---:|---:|---|
| toolrank-emb-8b | ~8,2 mil millones | 8192 tokens | 58,90 | 55,74 | 88,57 | Apache-2.0 (pesos); datos sin licencia |
| Qwen3-Embedding-8B | ~8,2 mil millones | no disponible en la informacion | 51,11 | no disponible (Recall@5 50,82) | 78,19 | Apache-2.0 |
| Qwen3-Embedding-8B + cabezas toolrank v0.1 | ~8,2 mil millones mas cabezas | no disponible | 54,03 | 53,95 | 79,87 | Apache-2.0 |
| toolrank-emb-8b en FP8 | ~8,2 mil millones | 8192 tokens | 59,02 | 55,34 | 87,71 | Apache-2.0 |

No se dispone en la informacion proporcionada de comparaciones con otros modelos de embeddings de recuperacion de herramientas de tamano similar (por ejemplo, variantes de la familia Qwen3-Embedding de menor tamano o modelos especificos de tool retrieval distintos de ToolRet).

## Limitaciones y advertencias

- Procedencia de los datos: ToolRet-Training-20w no declara licencia (ni campo ni texto). El repositorio de codigo de ToolRet es Apache-2.0, pero eso no cubre los datos, que a su vez proceden de benchmarks anteriores con sus propias condiciones. El propio autor publica los pesos asumiendo ese riesgo y recomienda usar el Qwen3-Embedding-8B base si se necesita procedencia limpia. Es el principal caveat para uso comercial.
- Ganancia limitada en peticiones de una sola herramienta: en las 1000 peticiones de una herramienta del catalogo GitHub + Stripe el rendimiento baja ligeramente (92,99 → 92,49) y en las 598 peticiones que describen un problema sin nombrar la operacion tambien empeora (89,67 → 87,71).
- Sobreajuste a la forma de los datos de entrenamiento: la mejora se concentra en peticiones que necesitan varias herramientas y en peticiones con la estructura de sus datos de entrenamiento.
- Seleccion sobre el conjunto de evaluacion: las cifras de MCP-Zero (88,57) corresponden al conjunto usado para elegir el checkpoint, no a un conjunto de retencion, por lo que estan optimizadas y deben tomarse con cautela.
- LiveMCPBench: la mejora de 53,74 a 55,74 no es estadisticamente significativa con solo 94 tareas, segun el propio autor.
- No lleva cabezas: las cabezas de toolrank v0.1 restan entre 1 y 2 puntos, y las cabezas entrenadas sobre este modelo se quedan en la identidad.
- Idioma: no se publican idiomas soportados ni evaluaciones multilingues; la plantilla de instruccion esta en ingles. Se desconoce el comportamiento en castellano.
- Riesgo de alucinacion: aunque el modelo no genera texto y por tanto no alucina en sentido estricto, puede recuperar herramientas irrelevantes; el reranking en dos etapas y la validacion del `inputSchema` antes de invocar siguen siendo necesarios.
- Dimension fija de 4096: encarece el almacenamiento y la busqueda por similitud en catalogos grandes en comparacion con modelos de embeddings mas pequenos.
- Gestion de versiones: la cache de embeddings de toolrank se indexa por el nombre servido, por lo que mezclar versiones produce vectores inconsistentes.
- El texto de la model card disponible esta truncado al final (seccion "Where it helps, and where it does not"), por lo que podria haber matices adicionales no recogidos aqui.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yasinyaman/toolrank-emb-8b
- Modelo base Qwen3-Embedding-8B: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Repositorio de codigo de toolrank: https://github.com/yasinyaman/toolrank
- Documentacion del proyecto: https://yaman.dev/toolrank/
- Benchmarks de toolrank: https://yaman.dev/toolrank/benchmarks/
- Dataset de entrenamiento: https://huggingface.co/datasets/mangopy/ToolRet-Training-20w
- Repositorio de codigo del benchmark ToolRet: https://github.com/mangopy/tool-retrieval-benchmark (referenciado como `mangopy/tool-retrieval-benchmark`)

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; los unicos enlaces utilizables son los que aparecen en la informacion de HuggingFace y en la model card del autor.
