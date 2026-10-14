# WC-ECL/embeddinggemma-2-onnx-int8

## Resumen

WC-ECL/embeddinggemma-2-onnx-int8 es una réplica (mirror) del modelo de embeddings multilingüe EmbeddingGemma 2 en formato ONNX cuantizado a int8, publicada por el usuario WC-ECL. Concretamente, se trata de una copia de un subconjunto de ficheros del repositorio comunitario onnx-community/embeddinggemma-2-ONNX (revisión `daa72c51243991dfcaf9f9137d2c573d8f7790c0`), cuyo modelo base es google/embeddinggemma-2. El repositorio ocupa aproximadamente 0,5 GB y contiene 11 ficheros (541.793.329 bytes en total), orientados a búsqueda semántica texto-a-imagen e imagen-a-imagen.

El propósito declarado por el autor no es ofrecer una versión mejorada, sino congelar una revisión estable de los pesos. La justificación es que el repositorio ONNX original es de mantenimiento comunitario y puede recuantizarse, re-subirse o eliminarse sin previo aviso; al fijar una copia, una build concreta de una aplicación siempre carga las mismas ponderaciones con las que se calibraron sus umbrales de similitud. El caso de uso citado explícitamente es la aplicación FaceNest.

Todos los ficheros de pesos son copias sin modificar del objeto original: el SHA-256 de cada uno coincide con el registrado en los metadatos LFS del repositorio de origen (verificado el 2026-10-15). El mirror no añade términos adicionales a la licencia Apache-2.0 de los repositorios originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings basado en transformer con codificador de vision adicional; exportado a ONNX (los detalles internos de capas no se especifican en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (grafo `model_quantized.onnx` y `vision_encoder_quantized.onnx`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX con datos externos (`onnx/model_quantized.onnx` + `onnx/model_quantized.onnx_data`; `onnx/vision_encoder_quantized.onnx` + `onnx/vision_encoder_quantized.onnx_data`) |

## Arquitectura y entrenamiento

La ficha del repositorio no describe la arquitectura interna ni el proceso de entrenamiento. Se sabe que el modelo base es google/embeddinggemma-2 y que la exportacion incluye dos grafos ONNX separados: uno para el codificador de texto (`model_quantized.onnx`) y otro para el codificador de vision (`vision_encoder_quantized.onnx`). La presencia del segundo confirma que el modelo es multimodal y que genera representaciones vectoriales tanto de texto como de imagen, lo que habilita busquedas cruzadas texto-a-imagen e imagen-a-imagen.

La disposicion de los ficheros sigue el patron estandar de ONNX para modelos grandes: los ficheros `.onnx` contienen unicamente el grafo, mientras que las ponderaciones residen en los ficheros hermanos `*_data` (datos externos). Ambos deben estar presentes en el mismo directorio; el fichero `.onnx` por si solo no es cargable. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La unica innovacion tecnica documentada es la propia operacion de mirror: se replica exclusivamente el subconjunto de ficheros que carga la aplicacion, se ancla a una revision concreta y se verifica la integridad mediante SHA-256 contra los metadatos LFS del repositorio original.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y recuperacion de informacion.
- Generacion de embeddings de imagen mediante el codificador de vision incluido.
- Busqueda cruzada texto-a-imagen e imagen-a-imagen.
- Cuantizacion int8, lo que reduce el tamano del modelo y acelera la inferencia en CPU y en aceleradores compatibles con ONNX Runtime.
- Ejecucion mediante ONNX Runtime, portable entre Windows y Linux (plataformas citadas en la ficha).
- Soporte multilingue: no confirmado en la informacion disponible.
- Tool calling, function calling, agentes y modo de razonamiento: no disponible (no es un modelo generativo de proposito general, sino un modelo de embeddings).

## Casos de uso

- Busqueda semantica de imagenes por texto: indexar las representaciones del codificador de vision y consultar con embeddings de texto para recuperar imagenes relevantes, gracias a que el modelo proyecta ambas modalidades al mismo espacio vectorial.
- Busqueda inversa imagen-a-imagen: usar la imagen de consulta para localizar imagenes visualmente o semanticamente similares, util en catalogos de producto o bibliotecas de activos.
- Deduplicacion y agrupamiento de contenido: calcular embeddings y aplicar similitud coseno para detectar duplicados o agrupar elementos similares en grandes colecciones.
- Sistemas de recomendacion basados en contenido: representar items como vectores y recomendar los mas proximos a la consulta o al historial del usuario.
- Clasificacion y filtrado de contenido: usar los embeddings como caracteristicas de entrada en clasificadores ligeros (spam, moderacion, etiquetado tematico).
- Despliegue en aplicaciones de escritorio multiplataforma: al distribuirse como ONNX int8 y ocupar unos 0,5 GB, puede integrarse en aplicaciones Windows/Linux que ejecuten ONNX Runtime sin depender de servicios en la nube.
- Reproducibilidad de pipelines de recuperacion: al ser un mirror fijado a una revision y verificado por SHA-256, sirve para entornos donde se exige que los pesos no cambien entre builds, evitando deriva en los umbrales de similitud calibrados.
- Recuperacion aumentada (RAG) multimodal: indexar documentos con texto e imagenes y recuperar ambos tipos de contenido ante una consulta en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: aproximadamente 0,5 GB (541.793.329 bytes), repartidos en 313,7 MB para las ponderaciones de texto y 195,2 MB para las del codificador de vision, mas el tokenizador (32,2 MB) y los ficheros de configuracion.
- Al ser un modelo cuantizado a int8 y de menos de 1 GB, cabe con holgura en GPU de consumo (por ejemplo, cualquier GPU con 4 GB o mas de VRAM) y puede ejecutarse integramente en CPU.
- Aceleracion por GPU disponible a traves de los execution providers de ONNX Runtime (CUDA, DirectML, CoreML, etc.), aunque la ficha no especifica ninguna GPU concreta probada.
- Opciones de despliegue: ONNX Runtime (principal), y por compatibilidad con transformadores de sentence embeddings, cualquier framework capaz de cargar grafos ONNX. No se documentan integraciones especificas con vLLM, llama.cpp u Ollama (no aplicables a un modelo de embeddings ONNX).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| WC-ECL/embeddinggemma-2-onnx-int8 | no disponible | no disponible | ONNX int8 | apache-2.0 | Mirror del subconjunto de ficheros usado por FaceNest; revision fijada y verificada por SHA-256 |
| onnx-community/embeddinggemma-2-ONNX | no disponible | no disponible | ONNX | apache-2.0 | Repositorio de origen, de mantenimiento comunitario y sujeto a recuantizacion o retirada |
| google/embeddinggemma-2 | no disponible | no disponible | safetensors (segun repositorio original) | apache-2.0 | Modelo base original publicado por Google |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otras familias de modelos de embeddings.

## Limitaciones y advertencias

- Al tratarse de un mirror de un subconjunto de ficheros, no es una publicacion independiente: su contenido depende por completo del repositorio onnx-community/embeddinggemma-2-ONNX y del modelo base google/embeddinggemma-2.
- La informacion disponible no documenta el tamano en parametros, la longitud de contexto, los idiomas soportados ni el proceso de entrenamiento, por lo que no es posible evaluar su cobertura linguistica ni sus limites de ventana.
- No se han publicado benchmarks, de modo que el rendimiento real en tareas de recuperacion no esta validado en esta ficha.
- Riesgo de sesgos y de alucinacion: no evaluado en la informacion disponible. Como modelo de embeddings, no genera texto, pero sus representaciones pueden heredar sesgos del corpus de entrenamiento original.
- La ficha no describe el procedimiento de cuantizacion int8, por lo que se desconoce la perdida de calidad respecto al modelo en precision completa.
- Los ficheros `.onnx` no son cargables de forma aislada: requieren los ficheros `*_data` correspondientes en el mismo directorio.
- Uso comercial: permitido bajo licencia Apache-2.0, sin terminos adicionales anadidos por el mirror, segun declara el autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.
- Los resultados de busqueda web asociados a esta consulta no guardan relacion con el modelo (corresponden a articulos de sanitarios), por lo que no aportan informacion adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WC-ECL/embeddinggemma-2-onnx-int8
- Repositorio de origen (ONNX): https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- Modelo base: https://huggingface.co/google/embeddinggemma-2
