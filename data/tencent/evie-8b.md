# tencent/EVIE-8B

## Resumen

EVIE-8B es un modelo de recuperacion de documentos visuales desarrollado por Tencent, publicado bajo licencia Apache 2.0 en HuggingFace. Se articula sobre el backbone Qwen3.5-9B y emplea una arquitectura de late-interaction multi-vector tipo ColBERT, generando embeddings de 4096 dimensiones por token para consultas de texto y parches visuales. Su funcion principal es rankear documentos o paginas de imagenes a partir de una consulta textual, preservando detalles de layout, tipografia, graficos y tablas gracias a su representacion token-level.

El modelo esta diseñado como teacher de la familia EVIE, concretamente del modelo ligero EVIE-4.5B, al que proporciona objetivos de destilacion mediante transferencia de relaciones topologicas y margin hard-negative. Segun la model card, alcanza el primer puesto en el benchmark ViDoRe V3 con un nDCG@10 de 66.75 y en ViDoRe V1+V2 con 92.18, convirtiendose en el recuperador visual mas preciso de su categoria. Incluye 8.41 mil millones de parametros, aunque la longitud de contexto y los idiomas soportados no se especifican en los materiales publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Late-interaction multi-vector (ColBERT-style) con atencion bidireccional multimodal sobre Qwen3.5 |
| Parametros totales | 8.409.476.336 (8.41B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EVIE-8B utiliza un encoder de vision y texto derivado de Qwen3.5, denominado ColQwen3.5, que procesa secuencias multimodales con atencion bidireccional completa. En lugar de comprimir cada documento en un unico vector, genera embeddings por token de 4096 dimensiones tanto para la consulta de texto como para los parches de la imagen. La relevancia entre consulta y documento se calcula mediante MaxSim: \( S(Q, D) = \sum_{i=1}^{|Q|} \max_{j=1}^{|D|} (q_i \cdot d_j) \). Esta estrategia permite conservar relaciones espaciales, tipografia y estructura de tablas que los modelos de un solo vector pierden.

El entrenamiento se basa en los datasets vidore/vidore_benchmark, vidore/vidore_benchmark_v2 y jinaai/jina-vdr, y ha sido validado en 138 tareas de recuperacion. No se han publicado detalles sobre el numero de tokens de entrenamiento ni sobre procesos de RLHF o DPO, que por otra parte no son habituales en modelos de retrieval. EVIE-8B ejerce como modelo anchor para destilar EVIE-4.5B mediante transferencia de relaciones topologicas y supervision con margin hard-negative (ARD). El repositorio GitHub publica los pesos, pipelines de inferencia y suites de evaluacion, aunque el paper formal se anuncia para una actualizacion futura.

## Capacidades

- Recuperacion visual de documentos: rankea paginas de PDF, imagenes escaneadas o slides a partir de consultas de texto.
- Embeddings multi-vector de 4096 dimensiones por token, con matching late-interaction mediante MaxSim.
- Preservacion de detalles finos de layout, tipografia, graficos y tablas en documentos visuales.
- Atencion bidireccional en secuencias multimodales que combina tokens de imagen y de texto.
- Validacion en 138 tareas de los benchmarks ViDoRe V1, V2, V3 y JinaVDR, cubriendo metricas nDCG, Recall, MAP y MRR.
- No es un modelo generativo: no soporta generacion de texto, tool calling, agentes ni razonamiento paso a paso.

## Casos de uso

- Busqueda en archivos de contratos legales: permite localizar clausulas especificas en documentos escaneados de varias paginas mediante consultas textuales. La representacion multi-vector conserva la posicion del texto en la pagina y facilita el ranking por relevancia.
- Recuperacion de documentos en repositorios corporativos: puede indexar PDFs, imagenes y presentaciones internas para que empleados encuentren la pagina exacta donde se menciona un producto, proceso o dato.
- Búsqueda semantica en presentaciones de ventas: las diapositivas con graficos y tablas se recuperan con precision a partir de preguntas sobre cifras o tendencias, sin necesidad de extracion previa de OCR.
- Componente de RAG visual: los embeddings late-interaction sirven como recuperador para un LLM generativo, proporcionando el fragmento de documento visual mas relevante como contexto antes de la respuesta.
- Gestion de facturas y recibos: un sistema puede indexar documentos financieros escaneados y recuperar la factura correcta asociada a un proveedor, numero de pedido o importe.
- Indexacion de articulos academicos escaneados: permite buscar en revistas antiguas o libros digitalizados por contenido visual y textual, manteniendo el contexto de columnas y figuras.
- Auditoria de documentos regulatorios: facilita el acceso a paginas concretas de normativas extensas, en las que la estructura de tablas y notas al pie es critica para la comprension.

## Benchmarks y rendimiento

La tabla siguiente muestra los resultados publicados en la model card para el propio EVIE-8B y algunos modelos comparables de la misma categoria. Los valores corresponden a nDCG@5 para ViDoRe V1 y V2, y nDCG@10 para ViDoRe V3.

| Modelo | Base Model | Parametros | Embed Dim | ViDoRe V1 (nDCG@5) | ViDoRe V2 (nDCG@5) | ViDoRe V3 (nDCG@10) |
|---|---|---|---|---|---|---|
| EVIE-8B | Qwen3.5-9B | 8.41B | 4096D | 92.18 | 74.23 | 66.75 |
| EVIE-4.5B | Qwen3.5-4B | 4.61B | 64-2048D | 92.07 | 73.38 | 66.02 |
| webAI-ColVec1.1-8b | Qwen2.5-VL | 8.40B | 640D | 91.30 | 65.82 | 65.32 |
| VultronRetrieverPrime-8B | Qwen3.5-9B | 8.40B | 320D | 92.08 | 68.18 | 64.26 |
| nemotron-colembed-vl-8b-v2 | Nemotron-8B | 8.80B | 4096D | 92.65 | 65.16 | 63.54 |

No se han publicados resultados en benchmarks generativos como MMLU, HumanEval o GSM8K, ya que el modelo no esta diseñado para tareas de lenguaje generativo.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM para inferencia.
- Los pesos safetensors ocupan 16.9 GB en disco, lo que da una referencia del espacio necesario para almacenar el checkpoint.
- El modelo se distribuye a traves de la libreria colpali-engine y es compatible con sentence-transformers segun los tags de HuggingFace.
- No se especifican GPUs de referencia ni opciones de despliegue en vLLM, llama.cpp, Ollama o TGI.
- No hay datos publicados sobre latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Embed Dim | Licencia | Disponibilidad |
|---|---|---|---|---|
| EVIE-8B | 8.41B | 4096D | Apache 2.0 | HuggingFace + GitHub |
| EVIE-4.5B | 4.61B | 64-2048D (Prefix-MRL) | Apache 2.0 | HuggingFace |
| webAI-ColVec1.1-8b | 8.40B | 640D | no disponible | HuggingFace |
| VultronRetrieverPrime-8B | 8.40B | 320D | no disponible | HuggingFace |
| nemotron-colembed-vl-8b-v2 | 8.80B | 4096D | no disponible | HuggingFace |

EVIE-8B destaca por la mayor dimension de embedding entre los modelos de 8B comparados y por su ventaja en ViDoRe V3. A diferencia de EVIE-4.5B, no incorpora compresion de tokens HAC ni entrenamiento con Prefix-MRL, pero funciona como teacher de ese modelo.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto, codigo ni respuestas a preguntas; su unica funcion es la recuperacion de documentos visuales.
- Los idiomas soportados no estan especificados. El rendimiento en idiomas fuera de los datasets de entrenamiento puede ser inferior.
- La representacion multi-vector requiere almacenar embeddings por token para todos los documentos indexados, lo que implica un coste de memoria mayor que los modelos de embedding de vector unico.
- Puede producir falsos positivos en el ranking si la consulta es ambigua o si el documento contiene informacion visual similar al texto consultado.
- Al ser una publicacion reciente, no se han documentado sesgos conocidos ni un analisis exhaustivo de alucinaciones, aunque al no generar texto el riesgo de alucinacion es menor.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar la licencia del backbone Qwen3.5 en caso de redistribucion.

## Enlaces

- HuggingFace: https://huggingface.co/tencent/EVIE-8B
- GitHub: https://github.com/Tencent/EVIE
- Blog de analisis: https://www.orcarouter.ai/blog/evie-8b-quiet-release
- Modelo hermano EVIE-4.5B: https://huggingface.co/tencent/EVIE-4.5B
