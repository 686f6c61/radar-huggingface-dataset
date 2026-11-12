# zenkingsama/bekko-embedding-v1-a25m-onnx

## Resumen

`zenkingsama/bekko-embedding-v1-a25m-onnx` es una redistribucion en formato ONNX del modelo de embeddings `hotchpotch/bekko-embedding-v1-a25m`, un encoder basado en arquitectura ModernBERT con 25 millones de parametros orientado a similitud semantica y extraccion de caracteristicas (feature-extraction). Lo publica el usuario zenkingsama y su unico cambio respecto al export oficial es el almacenamiento de los pesos: los inicializadores se mueven a un fichero externo (`onnx/model.onnx_data`) para permitir memory-mapping en lugar de copia en memoria. Los valores numericos son identicos bit a bit al export oficial.

El modelo resuelve el problema de generar embeddings de frases y documentos para tareas de recuperacion, similitud y clustering en entornos de produccion donde ONNX Runtime es el runtime objetivo. Su tamano reducido (aproximadamente 199 MB de pesos) y su naturaleza encoder-only lo hacen adecuado para despliegues de baja latencia en CPU, aunque no dispone de capacidades generativas.

Es relevante porque el layout de datos externos reduce el pico de memoria al cargar el modelo y facilita su integracion en pipelines con ONNX Runtime, ONNX Runtime Web o servidores de embeddings compatibles con Hugging Face Text Embeddings Inference (TEI). La licencia MIT y la reproducibilidad byte a byte del proceso de conversion son ventajas para equipos que necesitan auditar artefactos de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, base model `hotchpotch/bekko-embedding-v1-a25m`) |
| Parametros totales | aproximadamente 25 millones (segun el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el export no cuantiza; pesos en float segun el export oficial) |
| Idiomas soportados | no disponible de forma oficial; la model card cita pruebas con textos en ingles, chino, japones, frances y aleman |
| Licencia | MIT |
| Formato de pesos | ONNX con datos externos (`onnx/model.onnx` + `onnx/model.onnx_data`); tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo base es un encoder ModernBERT de aproximadamente 25 millones de parametros, disenado para producir embeddings de frases mediante pooling de tipo MEAN sobre las representaciones del ultimo nivel y normalizacion L2 posterior. La model card del artefacto ONNX no documenta el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO o tecnicas de contraste tipo SimCSE); esa informacion corresponderia a la model card de `hotchpotch/bekko-embedding-v1-a25m`, que no se incluye en la informacion proporcionada.

La innovacion tecnica de esta publicacion es puramente de empaquetado: los inicializadores del export ONNX oficial (revision `44f0b8af0f487acd0ccf1a7cb7ae7a29a6dfc09c`) se reescriben como datos externos en un unico sidecar `onnx/model.onnx_data`, con tensores de al menos 1024 bytes. El proceso se realiza con `scripts/prepare-embedding-artifact.py` del repositorio Slipwiki, usando onnx 1.23.2, onnxruntime 1.24.4, numpy 2.3.5, tokenizers 0.22.2, onnx-ir 1.1.0 y CPython 3.12.14. La model card afirma que la salida es identica bit a bit al export oficial tanto a batch size 1 como a batch size 8 (diferencia absoluta maxima 0) sobre 13 textos de prueba. El tokenizer se hereda sin cambios del modelo base, que reutiliza el tokenizer de Gemma 2 via mmBERT.

## Capacidades

- Generacion de embeddings de frases y documentos para similitud semantica (pipeline `sentence-similarity`).
- Extraccion de caracteristicas (`feature-extraction`) para representaciones vectoriales de texto.
- Pooling MEAN sobre la salida del encoder y normalizacion L2 del vector resultante.
- Inferencia via ONNX Runtime con soporte de memory-mapping de los pesos.
- Compatibilidad declarada con Hugging Face Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles (tag `endpoints_compatible`).
- Procesamiento por lotes (la model card verifica consistencia a batch size 1 y 8).
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un encoder de embeddings.

## Casos de uso

- Busqueda semantica en bases de conocimiento internas: indexar documentos con este encoder y recuperar por similitud coseno sobre vectores normalizados; el tamano de 25 M de parametros permite indexar grandes volumenes en CPU sin GPU.
- Deduplicacion y clustering de contenidos: agrupar articulos, tickets o registros con embeddings MEAN+L2 y algoritmos de clustering; la naturaleza determinista del export ONNX facilita reproducir resultados entre entornos.
- RAG en produccion con ONNX Runtime: integrar el modelo como componente de retrieval en pipelines de generacion aumentada, aprovechando el layout de datos externos para reducir el pico de memoria al cargar el artefacto.
- Filtrado de spam y moderacion por similitud: comparar mensajes entrantes contra un conjunto de referencia de ejemplos etiquetados mediante similitud de embeddings.
- Servicio de embeddings compatible con TEI: desplegar el modelo detras de Text Embeddings Inference o de un endpoint compatible para servir vectores a multiples aplicaciones.
- Busqueda multilingue ligera: la model card verifica comportamiento con textos en ingles, chino, japones, frances y aleman, lo que permite prototipos de recuperacion cross-lingue sin modelos de mayor tamano.
- Sistemas de recomendacion basados en contenido: representar descripciones de productos o articulos y calcular similitud para sugerencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la fidelidad numerica frente al export oficial: diferencia absoluta maxima de 0 a batch size 1 y 8 sobre 13 textos de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el sidecar de pesos ocupa 199.049.728 bytes (aproximadamente 190 MiB), por lo que la huella en memoria es del orden de cientos de MiB incluyendo tokenizer y activaciones.
- GPU recomendadas: no disponible; por tamano, cualquier GPU con suficiente memoria para el sidecar puede ejecutarlo, pero no hay datos oficiales de latencia o throughput.
- Cabe en GPU consumer: si, por el reducido tamano de pesos; no se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime (libreria `onnx`), Hugging Face Text Embeddings Inference (tag declarado), endpoints compatibles (tag declarado); no se mencionan vLLM, llama.cpp ni Ollama, que no aplican a un encoder ONNX de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `zenkingsama/bekko-embedding-v1-a25m-onnx` | aprox. 25 M | no disponible | MIT | ONNX (datos externos) | Redistribucion fiel del export oficial |
| `hotchpotch/bekko-embedding-v1-a25m` | aprox. 25 M | no disponible | MIT | safetensors / ONNX oficial | Modelo base original |
| Otros encoders de embeddings de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento con alternativas concretas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas; solo embeddings.
- No se documentan sesgos conocidos del modelo base en la informacion proporcionada.
- Riesgo de alucinacion: no aplica directamente al no generar texto, pero los embeddings pueden producir similitudes espurias en dominios fuera de distribucion.
- Cobertura idiomatica no declarada oficialmente; las pruebas de fidelidad cubren solo cinco idiomas.
- Longitud de contexto no disponible; textos largos pueden truncarse segun la configuracion del tokenizer heredado.
- La licencia MIT permite uso comercial, pero el tokenizer hereda terminos del modelo upstream (Gemma 2 via mmBERT); conviene revisar el `NOTICE` y las condiciones del modelo base.
- El artefacto depende de `onnx/model.onnx_data`; si se copia solo el fichero `.onnx` la carga fallara.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.
- Verificar la integridad de los ficheros con los SHA-256 publicados antes de desplegar en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/zenkingsama/bekko-embedding-v1-a25m-onnx
- Modelo base: https://huggingface.co/hotchpotch/bekko-embedding-v1-a25m
- Revision del export oficial: `44f0b8af0f487acd0ccf1a7cb7ae7a29a6dfc09c`
- Repositorio Slipwiki (script `scripts/prepare-embedding-artifact.py`): no disponible como URL en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
