# ThakiCloud/SKILLRET-Edge-109M

## Resumen

SKILLRET-Edge-109M es un bi-encoder de 109.482.240 parámetros desarrollado por ThakiCloud para una tarea muy concreta: la recuperación de habilidades (skill retrieval), es decir, seleccionar la habilidad o herramienta correcta de un catálogo a partir de una petición en lenguaje natural. Se presenta como un derivado destilado de ThakiCloud/SKILLRET-Embedding-0.6B y está afinado sobre Snowflake/snowflake-arctic-embed-m, lo que lo sitúa en la familia de modelos de embeddings BERT con pooling CLS y embeddings normalizados en L2.

Su relevancia actual viene de dos factores. El primero es el tamaño: con 219 MB en fp16 y versiones cuantizadas de hasta 68,6 MB en int3, está pensado para ejecutarse en CPU junto al propio agente, sin depender de una GPU ni de un servicio externo. El segundo es el rendimiento: según la model card, alcanza un NDCG@10 de 79,18 en el split de test público de ThakiCloud/SKILLRET (4.392 consultas sobre 6.006 habilidades), recuperando aproximadamente el 98% del rendimiento de su profesor, que es unas 26 veces mayor.

El modelo forma parte del benchmark SkillRet (arXiv:2605.05726) y se distribuye con licencia Apache-2.0, heredada del modelo base. Está etiquetado como compatible con text-embeddings-inference y con endpoints, y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder tipo BERT (fine-tune de Snowflake/snowflake-arctic-embed-m), pooling CLS, embeddings normalizados en L2 |
| Parametros totales | 109.482.240 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens con `max_length` en evaluacion; maximo nativo del backbone no disponible |
| Tipos de cuantizacion | fp16 (219,0 MB), int8/g16 (136,9 MB), int4/g16 (82,3 MB), int3/g16 (68,6 MB); metodo de cuantizacion no especificado en la model card. INT2/ternario colapsa |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional con pooling sobre el token CLS y normalizacion L2 de las representaciones, en la linea de los modelos sentence-transformers para recuperacion densa. No hay decoder ni generacion: el modelo produce un unico vector por texto y la similitud se calcula por producto escalar. El entrenamiento parte de Snowflake/snowflake-arctic-embed-m y se realiza por destilacion de conocimiento desde ThakiCloud/SKILLRET-Embedding-0.6B, con `kd_weight=0.7`, una funcion de perdida InfoNCE multi-positivo sobre 1 a 3 ejemplos dorados por consulta, 12 epocas y un schedule coseno. La epoca final se eligio sobre un holdout disjunto por habilidad, de modo que el split de test no se uso para seleccionar el checkpoint.

La model card documenta con detalle un contrato de prefijos de consulta que resulta critico en la practica: las consultas deben codificarse sin prefijo de instruccion (el repositorio incluye `query_prefix.json` con `resolved: ""`). Mantener la coherencia entre entrenamiento y evaluacion importa mas que la eleccion concreta del prefijo: sin prefijo se obtiene 79,18 y con prefijo de instruccion 78,50, dentro del error estandar, pero un desajuste entre ambos provoca una variacion de hasta +8,84 puntos porcentuales en un mismo checkpoint. Tambien se documentan los intentos fallidos: destilar desde un profesor de 8B en lugar de 0,6B cuesta 2,40 puntos (brecha de capacidad), la mineria de negativos duros cuesta 1,0 punto y una perdida auxiliar LEAF con peso 0,3 cuesta 1,51 puntos (t = -7,78 emparejado).

## Capacidades

- Generacion de embeddings de texto para recuperacion densa (pipeline `feature-extraction`, `retrieval`).
- Recuperacion de habilidades o herramientas: dada una peticion en lenguaje natural, ordena un catalogo de habilidades por relevancia.
- Enrutamiento semantico en agentes: seleccion de la herramienta adecuada antes de invocar al modelo generador.
- Ejecucion en dispositivo (`on-device`): el checkpoint fp16 ocupa 219,0 MB y las versiones cuantizadas entre 68,6 y 136,9 MB, lo que permite inferencia en CPU.
- Compatibilidad declarada con text-embeddings-inference y endpoints, ademas de la libreria sentence-transformers.
- Cuantizacion agresiva tolerada: int8 e int4 mantienen el NDCG@10 (79,18 y 79,21) e int3 baja a 78,04.
- No dispone de generacion de texto, razonamiento autoregresivo, codigo, matematicas, vision, audio, tool calling en sentido generativo ni modo de pensamiento. No es un modelo de chat.

## Casos de uso

- Enrutamiento de herramientas en agentes LLM: ante la peticion de un usuario, el modelo genera un embedding y recupera la habilidad candidata del catalogo antes de construir el prompt del modelo generador; reduce el numero de herramientas que se inyectan en el contexto.
- Ejecucion en el borde o en el propio dispositivo: con 68,6 MB en int3 o 219,0 MB en fp16, puede convivir con el agente en un portatil o en un servidor sin GPU, evitando enviar las consultas a un servicio externo.
- Seleccion de funciones en pipelines de function calling: se indexan las descripciones de las funciones disponibles y se recuperan las mas afines, actuando como etapa previa de un enrutador determinista.
- Busqueda semantica sobre catalogos de APIs o skills internas: indexacion de descripciones cortas y recuperacion por similitud coseno en un maximo de 256 tokens por documento.
- Prefiltrado en pipelines RAG: como recuperador de primera etapa sobre un corpus de documentos cortos antes de un reranker o de un modelo generador.
- Deduplicacion y agrupacion de habilidades: agrupar descripciones equivalentes de herramientas dentro de un catalogo mediante similitud entre embeddings.
- Evaluacion comparativa de catalogos: medir la calidad de un catalogo de habilidades segun la capacidad del modelo de discriminar la habilidad correcta frente a las demas.

## Benchmarks y rendimiento

Resultados declarados en el split de test publico de ThakiCloud/SKILLRET (4.392 consultas / 6.006 habilidades), revision `a050ad2`, metrica NDCG@10:

| Variante | Tamano en disco | NDCG@10 | Respecto al profesor |
|---|---|---|---|
| SKILLRET-Embedding-0.6B (profesor) | 1191,6 MB | 78,48 | — |
| SKILLRET-Edge-109M fp16 | 219,0 MB | 79,18 ± 0,42 | 98,0% |
| SKILLRET-Edge-109M int8 / g16 | 136,9 MB | 79,18 ± 0,42 | 98,0% |
| SKILLRET-Edge-109M int4 / g16 | 82,3 MB | 79,21 ± 0,42 | 98,0% |
| SKILLRET-Edge-109M int3 / g16 | 68,6 MB | 78,04 ± 0,44 | 96,6% |

Avisos sobre la medicion, segun la propia model card: el error estandar del split es de aproximadamente ±0,45, por lo que las diferencias inferiores a 1 punto no deben interpretarse como ranking; el split de 4.997 consultas / 6.660 habilidades que reportan los modelos de referencia de SkillRet no esta en el dataset publicado actualmente, y no debe convertirse entre ambos; y la cifra previa de 80,82 para el profesor corresponde a una evaluacion anterior a la correccion del contrato de prefijos. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp16 para los pesos (219,0 MB) mas activaciones y lote; el modelo esta disenado para funcionar en CPU, por lo que la GPU es opcional.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de memoria (por ejemplo GTX 1050 Ti, RTX 3060, RTX 4090). Las A100 o H100 son innecesarias para este tamano y solo tendrian sentido en escenarios de indexacion masiva por lotes.
- Cabe en GPU consumer: si, con amplio margen, e incluso en CPU. Las variantes int8, int4 e int3 reducen aun mas el espacio en disco y memoria.
- Opciones de despliegue: sentence-transformers (uso directo segun la model card), text-embeddings-inference (etiqueta `text-embeddings-inference` del repositorio) y endpoints compatibles. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion no oficial.
- Latencia y throughput estimados: no disponible.
- Nota operativa: fijar `max_length=256` y codificar las consultas sin prefijo de instruccion, coherente con el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NDCG@10 en SKILLRET | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SKILLRET-Edge-109M | 109,5 M | 256 tokens en evaluacion | 79,18 (fp16/int8/int4), 78,04 (int3) | Apache-2.0 | HuggingFace, safetensors |
| SKILLRET-Embedding-0.6B (profesor) | ~0,6 B segun denominacion | No disponible | 78,48 | No disponible | HuggingFace |
| Snowflake/snowflake-arctic-embed-m (base) | No disponible | No disponible | No disponible | Apache-2.0 (heredada por el modelo derivado) | HuggingFace |

No se dispone de datos de rendimiento en este split para otros modelos de embeddings de tamano similar, por lo que no se incluyen comparaciones adicionales. La comparacion principal que aporta la model card es la del propio profesor: SKILLRET-Edge-109M iguala o supera ligeramente al modelo de 0,6B siendo aproximadamente 26 veces mas pequeno, con un 98% de recuperacion relativa.

## Limitaciones y advertencias

- Solo soporta ingles; cualquier uso en castellano u otros idiomas no esta respaldado por la model card.
- Es un modelo exclusivamente de recuperacion: no genera texto ni razona de forma autoregresiva, por lo que no puede usarse como sustituto de un LLM.
- El error estandar del split de evaluacion es de aproximadamente ±0,45; las diferencias por debajo de 1 punto porcentual no son significativas y no deben presentarse como mejoras.
- El contrato de prefijos de consulta es critico: si el prefijo usado en produccion no coincide con el del entrenamiento (consulta sin prefijo), la calidad puede caer hasta 8,84 puntos porcentuales.
- La cuantizacion int3 supone una perdida real de 1,14 puntos frente a fp16; INT2 y las variantes ternarias colapsan por completo (aproximadamente 0,1 NDCG@10) y ni GPTQ ni QuIP lo evitan.
- El split de referencia de 4.997 consultas / 6.660 habilidades no esta en el dataset publicado; mezclar cifras entre ambos splits produce comparaciones invalidas.
- El modelo hereda los sesgos del corpus de entrenamiento (ThakiCloud/SKILLRET) y del modelo base; la model card no documenta analisis de sesgo. La composicion detallada del dataset no esta disponible.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de recuperacion erronea: si la habilidad correcta no esta en el catalogo o su descripcion es pobre, el modelo devolvera un candidato incorrecto con alta similitud.
- Licencia Apache-2.0, que permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y conservacion del aviso de licencia.
- Advertencias de produccion: el modelo tiene 12 descargas y 0 likes en el momento de la consulta, por lo que su adopcion es practicamente nula y no hay evidencia de uso en produccion fuera de lo declarado por el autor.
- La fecha de creacion del repositorio (septiembre de 2026) y las correcciones posteriores de la model card indican que las cifras publicadas han cambiado; conviene fijar la revision del repositorio y del dataset al reproducir resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/SKILLRET-Edge-109M
- Dataset de evaluacion y entrenamiento: https://huggingface.co/datasets/ThakiCloud/SKILLRET
- Modelo profesor: https://huggingface.co/ThakiCloud/SKILLRET-Embedding-0.6B
- Modelo base: https://huggingface.co/Snowflake/snowflake-arctic-embed-m
- Paper del benchmark SkillRet: https://arxiv.org/abs/2605.05726

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden de la informacion del repositorio y de la model card.
