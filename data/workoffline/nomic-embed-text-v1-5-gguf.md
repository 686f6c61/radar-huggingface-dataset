# WorkOffline/nomic-embed-text-v1.5-GGUF

## Resumen

nomic-embed-text-v1.5 es un modelo de embeddings de texto desarrollado por Nomic AI, disenado para generar representaciones vectoriales densas de documentos y consultas. Este repositorio concreto, WorkOffline/nomic-embed-text-v1.5-GGUF, es un espejo sin modificaciones de los ficheros GGUF oficiales del modelo, mantenido por WorkOffline para que su aplicacion pueda descargarlos desde un unico punto, fijados a una revision exacta y verificados mediante SHA-256. No se trata de un modelo nuevo ni de una variante afinada: los bytes son identicos a los del repositorio upstream y solo puede diferir el nombre del fichero.

El modelo original emplea una arquitectura transformer tipo BERT con 136.727.040 parametros totales y esta pensado exclusivamente para extraccion de caracteristicas (feature-extraction), es decir, para producir embeddings, no para generacion de texto. Es relevante para pipelines de recuperacion de informacion (RAG), busqueda semantica, clustering y clasificacion, donde se necesita un encoder pequeno y rapido que quepa en hardware modesto.

La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio espejo ocupa aproximadamente 0,1 GB e incluye el fichero `nomic-embed-text-v1.5.Q8_0.gguf` (146.146.432 bytes), copiado de nomic-ai/nomic-embed-text-v1.5-GGUF en la revision `0188c9bf409793f810680a5a431e7b899c46104c`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder, solo embeddings) |
| Parametros totales | 136.727.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 (unico fichero incluido en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo original. Por los tags y la naturaleza del modelo base (nomic-ai/nomic-embed-text-v1.5) se trata de un encoder transformer orientado a producir embeddings de texto densos, con 136.727.040 parametros. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste contrastivo.

Este repositorio no aporta informacion adicional sobre el entrenamiento: es una copia byte a byte de los ficheros GGUF oficiales, verificada con SHA-256. Cualquier detalle tecnico sobre la arquitectura o el entrenamiento debe consultarse en la model card del modelo base original.

## Capacidades

- Generacion de embeddings de texto (feature-extraction) para documentos y consultas.
- Representaciones vectoriales aptas para busqueda semantica y recuperacion de informacion.
- Uso en pipelines de RAG (retrieval-augmented generation) como encoder de recuperacion.
- Clustering y deduplicacion de textos por similitud en el espacio de embeddings.
- Clasificacion y filtrado semantico basado en vectores.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni agentes: es un modelo exclusivamente de embeddings.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Busqueda semantica en documentacion interna: indexar los documentos como embeddings y recuperar los fragmentos mas similares a la consulta del usuario mediante similitud coseno.
- Base de conocimiento para RAG: usar el modelo como encoder de recuperacion en un pipeline que alimente a un LLM generativo con los fragmentos relevantes.
- Deduplicacion de registros: calcular embeddings de un corpus y agrupar entradas con alta similitud para eliminar duplicados.
- Clasificacion de tickets de soporte: generar embeddings de los mensajes y entrenar un clasificador ligero sobre ellos para enrutar incidencias por categoria.
- Moderacion y filtrado de contenido: comparar embeddings de textos nuevos contra un conjunto de referencia de contenido no deseado.
- Recomendacion de articulos o productos: indexar el catalogo como vectores y recomendar elementos cercanos al historial del usuario.
- Despliegue local en aplicaciones de escritorio: el fichero GGUF Q8_0 (unos 146 MB) permite ejecutar el encoder en equipos sin GPU dedicada, lo que encaja con el proposito del espejo WorkOffline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 146.146.432 bytes (unos 0,14 GB); la inferencia en CPU es viable con memoria RAM modesta.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cualquier GPU consumer moderna es suficiente.
- Cabe en GPU consumer: si, dado el tamano del modelo (136,7 M de parametros).
- Opciones de despliegue: llama.cpp y entornos compatibles con GGUF (por ejemplo, Ollama); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se dispone de confirmacion para vLLM o TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible: la informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo embeddings; no debe usarse para tareas de generacion, razonamiento o agentes.
- Longitud de contexto e idiomas soportados no disponibles en la informacion proporcionada; conviene consultar la model card del modelo base antes de usarlo en produccion.
- Riesgo de sesgo y alucinacion: no evaluado en la informacion disponible; los embeddings pueden heredar sesgos del corpus de entrenamiento original.
- Este repositorio es un espejo de terceros (WorkOffline), no el repositorio oficial; para produccion conviene verificar el SHA-256 contra el upstream y fijar la revision.
- Solo se incluye la cuantizacion Q8_0; otras cuantizaciones deben obtenerse del repositorio oficial de nomic-ai.
- Licencia Apache-2.0: permite uso comercial, pero el uso de los ficheros se rige por la licencia original del modelo base.

## Enlaces

- Repositorio espejo: https://huggingface.co/WorkOffline/nomic-embed-text-v1.5-GGUF
- Modelo base original: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- GGUF oficiales: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF
