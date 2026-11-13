# Vzdorrr/Nocta-embeddinggemma-2-GGUF

## Resumen

Nocta-embeddinggemma-2-GGUF es una réplica sin modificaciones del fichero `embeddinggemma-2-Q8_0.gguf` publicado por ggml-org, derivado a su vez del modelo base `google/embeddinggemma-2`. Se trata, por tanto, de un modelo de embeddings (feature extraction / sentence-similarity) cuantizado en formato Q8_0 para su uso con llama.cpp, no de un modelo generativo. El autor lo publica como espejo para que la aplicación de acompañamiento on-device Nocta lo utilice como modelo de memoria, es decir, para búsqueda semántica sobre mensajes pasados.

El modelo cuenta con 271.002.648 parámetros (aproximadamente 271 M) y un tamaño de repositorio de 0,3 GB, coherente con una cuantización de 8 bits de esos pesos. La licencia es Apache 2.0, heredada del modelo original, y el pipeline declarado es `sentence-similarity`. Al ser una copia idéntica (mismo sha256 que el original), sus características técnicas y de rendimiento son las del modelo de ggml-org, no las de un desarrollo propio del autor.

Su relevancia es práctica: ofrece un artefacto listo para descargar y usar con llama.cpp en entornos de inferencia local o embebida, con un tamaño reducido que permite ejecutarlo en dispositivos con recursos limitados. No obstante, al ser un espejo sin cambios, no aporta mejoras ni ajustes respecto al original, y su valor depende enteramente de la calidad del modelo base de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings; arquitectura del base `google/embeddinggemma-2` no detallada en la informacion) |
| Parametros totales | 271.002.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `google/embeddinggemma-2` en la documentacion proporcionada: no se detalla si es un transformer encoder, el numero de capas, la dimension de los embeddings ni la funcion de pooling empleada. Tampoco se especifican los datos de entrenamiento (numero de tokens, composicion del corpus, uso de contrastive learning, RLHF o DPO), ni innovaciones tecnicas como attention lineal o decodificacion especulativa. El unico dato tecnico verificable es el recuento de parametros (271 M) y que el artefacto es una cuantizacion Q8_0 de 8 bits.

El fichero es una copia exacta del original de ggml-org, identificada por el sha256 `2188ac1deca4b77dffefd603c2776a9d76d9d74ec01841392982ebb840b09135`, por lo que no ha habido reentrenamiento, fine-tuning ni conversion adicional por parte de Vzdorrr. Cualquier detalle sobre el proceso de entrenamiento debe consultarse en la model card del modelo base de Google o en la del repositorio original de ggml-org.

## Capacidades

- Generacion de embeddings de frases y documentos para tareas de similitud semantica (`sentence-similarity`).
- Extraccion de caracteristicas (`feature-extraction`) para construir indices vectoriales.
- Busqueda semantica sobre historiales de conversacion, segun el caso de uso declarado por el autor (memoria de la app Nocta).
- Compatibilidad con llama.cpp, lo que permite inferencia local en CPU y GPU.
- Soporte de endpoints compatibles (`endpoints_compatible` segun los tags del repositorio).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, vision, audio, tool calling ni agentes; es un modelo exclusivamente de embeddings.
- Capacidades multilingues: no disponibles en la informacion.

## Casos de uso

- Memoria semantica en aplicaciones de acompanamiento on-device: tal como declara el autor, el modelo se usa para busqueda semantica sobre mensajes pasados en la app Nocta. Su tamano de 0,3 GB y su cuantizacion Q8_0 lo hacen viable en dispositivos con almacenamiento y memoria limitados.
- Busqueda semantica en bases de conocimiento locales: indexar documentos y recuperar fragmentos por similitud vectorial sin depender de servicios en la nube, usando llama.cpp como motor de inferencia.
- Deduplicacion y agrupamiento de textos: calcular embeddings de un corpus y agrupar entradas cercanas para eliminar duplicados o clasificar por tematica.
- Sistemas RAG ligeros en el borde: generar embeddings de consultas y pasajes en un pipeline de recuperacion que se ejecute en el mismo dispositivo que el generador, reduciendo latencia de red y coste.
- Filtrado y moderacion de contenido por similitud: comparar mensajes entrantes contra un conjunto de referencia de ejemplos etiquetados para detectar casos proximos.
- Prototipado rapido de recomendadores: calcular similitud entre descripciones de productos o articulos para generar recomendaciones basicas sin infraestructura dedicada.
- Evaluacion de calidad de respuestas: medir la similitud semantica entre respuestas generadas y respuestas de referencia en pipelines de evaluacion automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 271 M de parametros en Q8_0, los pesos ocupan aproximadamente 0,27 GB; con overhead de contexto y buffers de llama.cpp, el consumo tipico se situa en torno a 0,5-1 GB de memoria, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; no se requieren aceleradores de datacenter como A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (por ejemplo, series RTX 20/30/40, GTX 16xx) e incluso en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y servidores compatibles con la API de llama.cpp; Ollama u otros runners basados en GGUF podrian usarlo si aceptan el formato, aunque no se confirma en la informacion.
- Latencia y throughput: no disponibles. Por el tamano del modelo, se espera una latencia baja en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. Como referencia estructural, el unico comparable directo identificable es el propio original:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nocta-embeddinggemma-2-GGUF (este) | 271 M | no disponible | Q8_0 GGUF | Apache 2.0 | Hugging Face (espejo) |
| ggml-org/embeddinggemma-2-GGUF (original) | 271 M | no disponible | Q8_0 GGUF | Apache 2.0 | Hugging Face |
| google/embeddinggemma-2 (base) | 271 M | no disponible | safetensors (presumiblemente) | Apache 2.0 | Hugging Face |

No se dispone de informacion sobre otros modelos de embeddings comparables (por ejemplo, de la familia BGE, E5 o GTE) en la documentacion proporcionada, por lo que no se ofrece una comparativa de rendimiento.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: no aporta ninguna mejora, ajuste ni correccion respecto al original de ggml-org; cualquier problema del original se hereda.
- No es un modelo generativo: no puede producir texto, codigo ni razonamiento; solo genera embeddings.
- Sesgos conocidos: no documentados en la informacion disponible, pero al derivar de un modelo entrenado con datos web, es probable que herede sesgos del corpus original.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la similitud semantica puede producir recuperaciones erroneas o poco relevantes en dominios especializados.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la longitud maxima de secuencia y la cobertura linguistica.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion con atribucion; conviene conservar el aviso de licencia y la referencia al modelo original.
- Caveat para produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026; para produccion es preferible referenciar el repositorio original de ggml-org o el modelo base de Google, con mayor trazabilidad y soporte.
- Verificacion de integridad: el autor proporciona el sha256 del fichero, lo que permite comprobar que la copia es identica al original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Vzdorrr/Nocta-embeddinggemma-2-GGUF
- Repositorio original de ggml-org: https://huggingface.co/ggml-org/embeddinggemma-2-GGUF
- Modelo base de Google: https://huggingface.co/google/embeddinggemma-2
