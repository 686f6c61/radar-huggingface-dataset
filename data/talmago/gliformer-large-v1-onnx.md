# talmago/gliformer-large-v1-onnx

## Resumen

GLiFormer Large v1 ONNX es la exportacion a formato ONNX del modelo `knowledgator/gliformer-large-v1`, publicada por el usuario talmago para su uso con la libreria `fast_gliner`. No se trata de un modelo nuevo entrenado desde cero, sino de una conversion de pesos orientada a inferencia: el repositorio contiene un encoder compartido (`onnx/encoder.onnx`) y cuatro cabezas de tarea independientes (`ner.onnx`, `classification.onnx`, `relations.onnx` y `structuring.onnx`).

El modelo resuelve tareas de extraccion de informacion estructurada sobre texto en ingles: reconocimiento de entidades nombradas (NER) con etiquetas definidas por el usuario, clasificacion de texto multietiqueta, extraccion de relaciones con esquema y extraccion estructurada en formato JSON. La particularidad de la familia GLiNER/GLiFormer es que permite definir las etiquetas en tiempo de inferencia, sin reentrenamiento, lo que lo convierte en una alternativa practica a los pipelines clasicos de NER supervisado.

Su relevancia actual es de tipo practico: al distribuirse unicamente como ONNX y no incluir el checkpoint PyTorch, esta pensado para despliegues en produccion con ONNX Runtime, incluyendo entornos sin GPU. El repositorio ocupa 2,3 GB y declara soporte unicamente para ingles; la licencia no figura en la informacion disponible y el numero de parametros, la longitud de contexto y los datos de entrenamiento no se especifican en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer con cabezas de tarea multiples (NER, clasificacion, relaciones, estructuracion); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos ONNX sin declarar precision (se deduce fp32 a partir del tamano del repo) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`onnx/encoder.onnx` mas cuatro cabezas: `ner.onnx`, `classification.onnx`, `relations.onnx`, `structuring.onnx`); no incluye checkpoint PyTorch ni safetensors |
| Libreria de inferencia | `fast_gliner` (`FastGLiFormer`) |
| Pipeline declarado | token-classification |
| Modelo base | knowledgator/gliformer-large-v1 |
| Tamano del repositorio | 2,3 GB |

## Arquitectura y entrenamiento

La model card describe una arquitectura de encoder compartido con cabezas de tarea separadas: `encoder.onnx` procesa el texto una sola vez y las cabezas `ner`, `classification`, `relations` y `structuring` producen las salidas especificas. Las relaciones se obtienen de una cabeza conjunta (joint head) y las estructuras se devuelven como registros planos. La clase `FastGLiFormer` expone los mismos metodos que `FastGLiNER2`, lo que indica que la interfaz sigue el patron de la familia GLiNER: etiquetas de entidad y esquemas de relacion se pasan como argumentos en tiempo de inferencia, no como clases fijas del entrenamiento.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones de atencion o decodificacion. Tampoco se detalla la arquitectura interna del encoder mas alla de su condicion de transformer bidireccional propia de la familia GLiNER. Todo lo relativo al proceso de entrenamiento debe consultarse en la ficha del modelo base `knowledgator/gliformer-large-v1`, que no forma parte de la informacion proporcionada.

## Capacidades

- Reconocimiento de entidades nombradas zero-shot: acepta listas de etiquetas arbitrarias (`person`, `organization`, `location`, etc.) en tiempo de inferencia y devuelve las menciones con `start`, `end`, `label` y `score`.
- Clasificacion de texto: el metodo `classify` devuelve la puntuacion de todas las etiquetas proporcionadas por el usuario, ordenadas de mayor a menor.
- Extraccion de relaciones: `extract_relations` acepta un esquema con `relation`, `subject_labels` y `object_labels`; los tipos de los extremos restringen que pares se conservan en la salida.
- Extraccion estructurada: `extract_json` genera registros planos; el sufijo `name::str` fuerza un unico valor de cadena, mientras que un nombre de campo sin sufijo se devuelve como lista.
- Composicion de tareas en una sola llamada: mediante `model.create_schema()` se pueden combinar entidades, clasificacion y estructuracion sobre el mismo texto en una unica pasada por el encoder.
- Multilingue: no. La model card declara unicamente ingles (`language: en`), a diferencia de otros modelos de la familia GLiNER con soporte multilingue.
- Tool calling y function calling: no soportado; es un modelo discriminativo de etiquetado, no generativo.
- Agentes y razonamiento multi-step: no soportado.
- Vision, audio o modo "thinking": no soportado.
- Generacion de texto libre: no soportado.

## Casos de uso

- Extraccion de entidades en documentos legales o financieros: pasar listas de etiquetas adaptadas al dominio (`clausula`, `importe`, `entidad_emisora`) y obtener las menciones con offsets de caracteres para resaltarlas o indexarlas directamente.
- Enriquecimiento de bases de datos y graph stores: combinando `extract_relations` con un esquema de relaciones conocido, se pueden construir tripletas sujeto-relacion-objeto para alimentar un grafo de conocimiento sin anotacion manual.
- Procesamiento de curriculos: usar `extract_json` con un esquema de campos (`name::str`, `company::str`, `role::str`) para convertir texto libre en registros tabulares listos para insertar en un ATS.
- Moderacion y clasificacion de tickets de soporte: el metodo `classify` permite etiquetar cada entrada con categorias definidas por el equipo (por ejemplo, `facturacion`, `tecnico`, `cancelacion`) y encaminarla al flujo correspondiente.
- Extraccion de menciones en pipelines de monitorizacion de medios: identificar personas, organizaciones y localizaciones en articulos en ingles y contabilizar su presencia a lo largo del tiempo.
- Preprocesado para RAG: extraer entidades y relaciones de los fragmentos antes de indexarlos, de forma que las consultas puedan filtrarse por entidad ademas de por similitud vectorial.
- Analitica de resenas de producto: clasificacion de sentimiento o tematica combinada con extraccion de menciones de marca en una sola llamada mediante `create_schema()`.
- Despliegue en entornos sin GPU: al distribuirse como ONNX, puede ejecutarse con ONNX Runtime en CPU, lo que permite integrarlo en servicios backend convencionales sin infraestructura de aceleracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye ejemplos de salida con puntuaciones de confianza, pero son ilustraciones del formato de respuesta, no evaluaciones sobre conjuntos de datos estandar:

| Ejemplo | Tarea | Salida |
|---|---|---|
| "Marie Curie worked at the University of Paris in France." | NER | person 0,999790; organization 0,999745; location 0,999939 |
| "The new search feature is fast and easy to use." | Clasificacion | positive 1,0; neutral 0,0; negative 0,0 |
| "Alice works at Acme and lives in London." | Relaciones | Alice -> works_at -> Acme; Alice -> lives_in -> London |
| "Alice joined Acme as a software engineer." | Estructuracion | `{"employee": [{"name": "Alice", "company": "Acme"}]}` |

No deben interpretarse como metricas de rendimiento: proceden de oraciones de ejemplo escritas por el autor del repositorio.

## Requisitos de hardware

- VRAM estimada: el repositorio contiene 2,3 GB de pesos ONNX. Si se cargan el encoder y las cuatro cabezas simultaneamente, se puede estimar un consumo de aproximadamente 3 GB de VRAM incluyendo el overhead del runtime. La model card no publica cifras oficiales, por lo que se trata de una estimacion derivada del tamano de los ficheros.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria. Para produccion, tarjetas de gama media como RTX 3060 12 GB, RTX 4070 o L4 son suficientes; A100 y H100 estan sobredimensionadas para un modelo de este tamano.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090). En tarjetas con 4 GB el margen es ajustado si se cargan todas las cabezas.
- CPU: viable mediante ONNX Runtime sin aceleracion, dado que el modelo no es generativo y la carga de computo por consulta es la de un encoder.
- Opciones de despliegue: `fast_gliner` con ONNX Runtime (CPU o CUDA), exportacion directa a ONNX Runtime, TensorRT o cualquier runtime compatible con ONNX. vLLM, llama.cpp, Ollama y TGI no son aplicables porque el modelo no es un LLM generativo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de comparacion en la informacion proporcionada. La comparacion siguiente es cualitativa y atiende a categoria, tarea y formato:

| Modelo | Categoria | Tareas | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| talmago/gliformer-large-v1-onnx | Encoder ONNX multi-cabeza | NER, clasificacion, relaciones, estructuracion | en | no disponible | ONNX | Solo pesos ONNX; requiere `fast_gliner` |
| knowledgator/gliformer-large-v1 | Modelo base de la familia GLiFormer | idem | no disponible | no disponible | no disponible | Origen de esta conversion |
| urchade/gliner_large-v2.1 | GLiNER basado en encoder | NER zero-shot | en y multilingue | no disponible en esta busqueda | PyTorch y ONNX | Referente de la familia GLiNER original |
| knowledgator/gliner-multitask-large-v0.5 | GLiNER multitarea | NER, clasificacion, QA | en | no disponible en esta busqueda | PyTorch | Enfoque multitarea previo a GLiFormer |

No se dispone de parametros, contexto ni resultados de benchmark de estos modelos dentro de la informacion proporcionada, por lo que no se pueden establecer comparaciones numericas fiables.

## Limitaciones y advertencias

- Idiomas: la model card declara unicamente ingles. El rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Licencia: no disponible. Al ser una conversion del modelo `knowledgator/gliformer-large-v1`, las condiciones de uso comercial dependen de la licencia del modelo base, que debe verificarse en su ficha antes de cualquier despliegue en produccion.
- Confianza en las puntuaciones: los ejemplos de la model card muestran valores muy proximos a 1,0, pero proceden de oraciones triviales. No hay calibracion documentada ni evaluacion sobre datos reales, por lo que los umbrales de confianza deben ajustarse con datos propios.
- Alucinacion en extraccion estructurada: al tratarse de un modelo de etiquetado y no de generacion, el riesgo no es de texto inventado, sino de falsos positivos (menciones o relaciones espurias) y de campos estructurados erroneos cuando el esquema no encaja con el texto.
- Relaciones planas: la model card indica que las estructuras se devuelven como registros planos, sin jerarquia. Los esquemas con anidamiento no estan soportados tal cual.
- Dependencia de la libreria: el uso esta atado a `fast_gliner` y a la clase `FastGLiFormer`, lo que limita la portabilidad a otros frameworks aunque los ficheros sean ONNX estandar.
- Ausencia de datos de evaluacion: no hay benchmarks publicados, ni informacion sobre sesgos, composicion del dataset de entrenamiento o comportamiento fuera de dominio.
- Longitud de contexto desconocida: no se especifica la ventana maxima, por lo que los documentos largos deben trocearse sin conocer el limite exacto del modelo.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, y actualizado en una unica fecha, lo que no aporta senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/talmago/gliformer-large-v1-onnx
- Modelo base: https://huggingface.co/knowledgator/gliformer-large-v1
- Repositorio de la libreria `fast_gliner`: https://github.com/talmago/fast_gliner

La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los unicos enlaces recuperados correspondian a Google Traduction y no guardan relacion con esta ficha. No se han localizado papers, blogs ni demos adicionales.
