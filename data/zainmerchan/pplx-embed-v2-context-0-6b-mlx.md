# zainmerchan/pplx-embed-v2-context-0.6b-mlx

## Resumen

pplx-embed-v2-context-0.6b-mlx es un port a Apple Silicon del modelo de embeddings contextuales pplx-embed-v2-context-0.6b desarrollado por Perplexity AI. El repositorio, mantenido por el usuario independiente zainmerchan, no contiene pesos: distribuye el paquete `pplx-context-mlx`, que descarga el checkpoint original de Perplexity y lo ejecuta sobre el framework MLX de Apple. Su proposito es permitir la generacion de embeddings contextuales de documentos y consultas en hardware Apple (chips de la familia M) sin depender de PyTorch sobre CPU ni de GPUs NVIDIA.

El modelo base es un encoder de aproximadamente 0,6 mil millones de parametros orientado a retrieval y feature-extraction, con soporte de embeddings contextuales: cada fragmento (chunk) se codifica viendo los fragmentos anteriores del mismo documento, lo que mejora la coherencia semantica en tareas de recuperacion sobre documentos largos. El port mantiene fidelidad numerica respecto al original (coseno minimo de 0,999998 en float32 y 0,99978 en float16) y reproduce las puntuaciones de retrieval del paper original en ViDoRe-V3 (55,82 frente a 55,81).

Es relevante ahora porque permite ejecutar un modelo de embeddings de calidad competitiva en un Mac con 64 GB de memoria unificada, con latencias de 7,4 ms por consulta y 1,16 s para un documento de 7.137 tokens, entre 3 y 12 veces mas rapido que la implementacion upstream en CPU. El proyecto es independiente y no esta afiliado a Perplexity.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer para embeddings (detalles de capas y atencion no disponibles) |
| Parametros totales | aproximadamente 0,6 mil millones (segun el nombre del checkpoint base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 119.041 tokens verificados en el port (13.871 tokens con precision de vectores verificada) |
| Tipos de cuantizacion | float16 y float32 soportados en MLX; int8 mencionado como referencia de comparacion |
| Idiomas soportados | no disponible |
| Licencia | MIT para el codigo del port; el checkpoint base de Perplexity no lleva etiqueta de licencia en su model card |
| Formato de pesos | pesos originales de Perplexity descargados en tiempo de ejecucion (aproximadamente 2,4 GB); el repositorio no aloja pesos |

## Arquitectura y entrenamiento

El modelo base es un encoder transformer disenado para generar embeddings de retrieval con contexto documental. La innovacion principal es el caracter contextual: cada chunk se codifica condicionado por los chunks precedentes del mismo documento, de modo que la representacion captura informacion que va mas alla del fragmento aislado. El port MLX reimplementa la inferencia sobre el framework de Apple sin modificar los pesos, por lo que la arquitectura y el entrenamiento son los del checkpoint original de Perplexity.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. El port incluye una API de codificacion por lotes (`encode` para documentos y `encode_queries` para consultas) con normalizacion opcional de embeddings, y ha sido validado contra la implementacion upstream en PyTorch sobre CPU, con desviaciones dentro de un paso de int8 en los vectores y diferencias de hasta 0,22 puntos en seis de las ocho tareas de ConTEB.

## Capacidades

- Generacion de embeddings de documentos con contexto entre chunks (contextual embeddings).
- Generacion de embeddings de consultas mediante una ruta especifica (`encode_queries`).
- Retrieval y busqueda semantica sobre documentos largos, con soporte de hasta 119.041 tokens.
- Feature extraction para pipelines de RAG y sistemas de recuperacion.
- Normalizacion de embeddings integrada para similitud coseno directa.
- Ejecucion en Apple Silicon mediante MLX, con precision float16 y float32.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, vision, audio, tool calling ni agentes: es exclusivamente un modelo de embeddings.

## Casos de uso

- RAG sobre documentacion tecnica larga: el modelo codifica cada fragmento viendo los anteriores, lo que reduce la perdida de contexto en documentos de decenas de miles de tokens y mejora la recuperacion de pasajes que dependen de informacion previa.
- Busqueda semantica en corpus multilingues o especializados: se generan embeddings de consulta y de pasajes normalizados y se calcula similitud coseno para ranking, con latencias de 7,4 ms por consulta en un M4 Pro.
- Indexacion de bases de conocimiento en un Mac de desarrollo: con 3,8 GB en float16 para la suite de velocidad, cabe en un equipo de 64 GB y permite prototipar pipelines de recuperacion sin GPU dedicada.
- Evaluacion de sistemas de retrieval: al reproducir las puntuaciones de ViDoRe-V3 y ConTEB del paper original, sirve como referencia fiable para comparar pipelines propios en hardware Apple.
- Procesamiento de documentos extensos en local: un documento de 7.137 tokens se codifica en 1,16 s en float16, adecuado para ingesta por lotes de contratos, informes o articulos cientificos.
- Clasificacion y clustering de textos mediante embeddings: la salida normalizada permite agrupar documentos por similitud semantica en tareas de deduplicacion o organizacion de contenidos.
- Integracion en herramientas de escritorio para macOS: al usar MLX, puede embeberse en aplicaciones nativas que necesiten busqueda semantica sin conexion a servicios externos.

## Benchmarks y rendimiento

| Benchmark | Resultado del port | Referencia del paper |
|---|---|---|
| ViDoRe-V3 | 55,82 | 55,81 |
| ConTEB (6 de 8 tareas) | dentro de 0,22 puntos | referencia |
| ConTEB ESG | 53,5 | 67,3 |
| ConTEB Insurance | 88,9 | 88,0 |

Mediciones de rendimiento en M4 Pro con 64 GB, frente a PyTorch upstream en CPU:

| Metrica | Valor |
|---|---|
| Consulta individual | 7,4 ms |
| Documento de 7.137 tokens (float16) | 1,16 s |
| Aceleracion frente a CPU upstream | 3 a 12 veces |
| Memoria en suite de velocidad (float16) | 3,8 GB |
| Memoria en suite de velocidad (float32) | 5,5 GB |
| Memoria a 119.041 tokens (float16) | 13,2 GB |
| Fidelidad de vectores (float32) | coseno minimo 0,999998 |
| Fidelidad de vectores (float16) | coseno minimo 0,99978 |

Las dos brechas en ConTEB (ESG e Insurance) se atribuyen al propio modelo upstream bajo el mismo harness, segun el autor del port.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 3,8 GB en float16 y 5,5 GB en float32 para la suite de velocidad; 13,2 GB en float16 a 119.041 tokens.
- GPU recomendadas: chips Apple Silicon; las pruebas se realizaron en un M4 Pro con 64 GB de memoria unificada.
- Cabe en GPU consumer: si, en equipos Apple Silicon con memoria unificada suficiente; no se ha probado en un Mac de 16 GB.
- Opciones de despliegue: paquete `pplx-context-mlx` sobre MLX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 7,4 ms por consulta y 1,16 s por documento de 7.137 tokens en float16 en M4 Pro.
- No probado: GPUs NVIDIA, el modelo de 9B de la familia ni Macs de 16 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-embed-v2-context-0.6b-mlx (este) | aproximadamente 0,6 B | hasta 119.041 tokens | Embeddings contextuales en MLX | MIT (codigo); checkpoint base sin etiqueta | Hugging Face, paquete pip |
| pplx-embed-v2-context-0.6b (upstream) | aproximadamente 0,6 B | no disponible | Embeddings contextuales en PyTorch | sin etiqueta en la model card | Hugging Face |
| pplx-embed-v2-context-9b | no disponible | no disponible | Embeddings contextuales (misma familia) | no disponible | Hugging Face (no probado en este port) |

No se dispone de datos de benchmarks de modelos alternativos de terceros en la informacion proporcionada para una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene pesos: depende de la descarga del checkpoint de Perplexity (aproximadamente 2,4 GB) en el primer uso, lo que requiere conectividad y disponibilidad del repositorio upstream.
- La licencia MIT cubre solo el codigo del port; el checkpoint base de Perplexity no lleva etiqueta de licencia, por lo que el uso comercial del modelo subyacente queda sin clarificar.
- Brecha significativa en ConTEB ESG (53,5 frente a 67,3 del paper), atribuida al modelo upstream bajo el mismo harness, pero que limita su uso en dominios ESG.
- Precisión de vectores verificada solo hasta 13.871 tokens, aunque se ha ejecutado a 119.041 tokens.
- No probado en Macs de 16 GB, en el modelo de 9B ni en GPUs, por lo que el rendimiento fuera del entorno M4 Pro de 64 GB es desconocido.
- Proyecto independiente sin afiliacion ni respaldo de Perplexity; el mantenimiento y la actualizacion dependen de un unico autor.
- Modelo exclusivamente de embeddings: no genera texto ni soporta tool calling, agentes o razonamiento multi-paso.
- Idiomas soportados no documentados; el rendimiento multilingue no puede evaluarse con la informacion disponible.
- Riesgo de alucinacion no aplica directamente al ser un encoder, pero la calidad del retrieval depende de la estrategia de chunking y de la coherencia del contexto previo.

## Enlaces

- Repositorio del port en Hugging Face: https://huggingface.co/zainmerchan/pplx-embed-v2-context-0.6b-mlx
- Modelo base en Hugging Face: https://huggingface.co/perplexity-ai/pplx-embed-v2-context-0.6b
- Repositorio del codigo en GitHub: https://github.com/zm2231/pplx-context-mlx
- README con tablas completas: https://github.com/zm2231/pplx-context-mlx#readme
