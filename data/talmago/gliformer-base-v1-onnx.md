# talmago/gliformer-base-v1-onnx

## Resumen

talmago/gliformer-base-v1-onnx es una conversion a ONNX del modelo knowledgator/gliformer-base-v1, publicada por el usuario talmago para su uso con la libreria fast_gliner. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el repositorio distribuye exclusivamente los pesos ONNX (encoder compartido y cabezas de tarea) y no incluye el checkpoint de PyTorch del modelo original.

El modelo pertenece a la familia GLiFormer/GLiNER, un enfoque de extraccion de informacion zero-shot en el que las etiquetas (entidades, relaciones, campos) se pasan como texto en tiempo de inferencia en lugar de estar fijadas durante el entrenamiento. La clase FastGLiFormer expone la misma interfaz que FastGLiNER2 y cubre cuatro tareas: reconocimiento de entidades nombradas (NER), clasificacion de texto, extraccion de relaciones y extraccion estructurada en forma de registros planos. Todo ello puede encadenarse en una sola llamada mediante un esquema unificado.

Es relevante porque resuelve el problema de desplegar extraccion de informacion estructurada sin dependencias de PyTorch, en entornos donde se prefiere ONNX Runtime (CPU, GPU o edge). El repositorio pesa 1,1 GB, esta etiquetado unicamente para ingles (en) y no declara licencia. En el momento de los datos proporcionados acumula 0 descargas y 0 likes, por lo que se trata de un artefacto reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder compartido + cabezas de tarea ONNX con LSTM a nivel de palabra; paradigma GLiFormer/GLiNER de emparejamiento de etiquetas en tiempo de inferencia |
| Parametros totales | no disponible (el autor no publica cifra; el repo de 1,1 GB incluye encoder y cuatro cabezas, no solo un checkpoint) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX sin variantes cuantizadas documentadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | ONNX: `onnx/encoder.onnx` (encoder compartido) y cabezas `onnx/ner.onnx`, `onnx/classification.onnx`, `onnx/relations.onnx`, `onnx/structuring.onnx`. No se incluye checkpoint de PyTorch |
| Tareas soportadas | Token classification (NER), text classification, relation extraction, structured extraction (JSON) |
| Modelo base | knowledgator/gliformer-base-v1 |
| Libreria de inferencia | fast_gliner |
| Tamano del repositorio | 1,1 GB |
| Pipeline declarado | token-classification |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de GLiNER/GLiFormer: un encoder transformer compartido que procesa conjuntamente el texto y las etiquetas candidatas, seguido de cabezas especificas por tarea. En esta conversion ONNX, las cabezas `ner.onnx`, `classification.onnx`, `relations.onnx` y `structuring.onnx` ya incorporan la LSTM a nivel de palabra, de modo que el fichero `rnn.onnx` no se abre durante la inferencia. La extraccion de relaciones se realiza mediante una cabeza conjunta (joint head) y las estructuras se devuelven como registros planos, no anidados.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo original utilizo RLHF, DPO u otra fase de ajuste. Tampoco se documentan innovaciones adicionales de decodificacion ni tecnicas de atencion alternativa. La informacion disponible se limita a la conversion de formato: el autor declara explicitamente que este repositorio no contiene el checkpoint de PyTorch y que los metodos expuestos son equivalentes a los de FastGLiNER2.

## Capacidades

- Reconocimiento de entidades nombradas zero-shot: `predict_entities` acepta una lista arbitraria de etiquetas en tiempo de inferencia (por ejemplo `["person", "organization", "location"]`) y devuelve cada entidad con texto, etiqueta, puntuacion y offsets de caracteres. En el ejemplo de la model card, "Marie Curie" se detecta como `person` con score 0,999533.
- Clasificacion de texto: `classify` devuelve la puntuacion de todas las etiquetas propuestas, ordenadas de mayor a menor. En el ejemplo, la frase "The new search feature is fast and easy to use." obtiene `positive` con 1.0 y `neutral`/`negative` con 0.0.
- Extraccion de relaciones: `extract_relations` recibe las etiquetas de entidad y un esquema de relaciones con `subject_labels` y `object_labels`, que restringen que pares se conservan. Ejemplo: `Alice => works_at => Acme` y `Alice => lives_in => London`.
- Extraccion estructurada: `extract_json` genera registros planos a partir de un esquema de campos; el sufijo `::str` fuerza un unico valor de tipo cadena, mientras que un nombre de campo desnudo se devuelve como lista.
- Ejecucion multitarea en una sola llamada: el constructor `create_schema()` permite combinar `entities`, `classification`, `relation`, `structure` y `field`, y `extract` devuelve un diccionario con las claves `classifications`, `entities`, `relations` y `structures`.
- Capacidad multilingue: no disponible; el modelo esta etiquetado unicamente como ingles (`en`).
- Tool calling, function calling, agentes, modo de razonamiento, vision o audio: no disponibles. Se trata de un modelo de extraccion de informacion, no de un modelo generativo conversacional.

## Casos de uso

- Anonimizacion y enmascarado de PII: definir etiquetas personalizadas como `person`, `email`, `phone` o `address` y ejecutar `predict_entities` sobre documentos antes de almacenarlos o enviarlos a terceros. La naturaleza zero-shot evita reentrenar el modelo para cada taxonomia de datos personales.
- Construccion de grafos de conocimiento: usar `extract_relations` con esquemas como `works_at`, `lives_in` o `founded` para poblar una base de datos de triplas (sujeto, relacion, objeto) a partir de texto no estructurado, restringiendo los pares mediante `subject_labels` y `object_labels`.
- Extraccion de campos en facturas contratos y formularios: `extract_json` con esquemas como `{"employee": ["name::str", "company::str"]}` permite convertir texto libre en registros JSON listos para insertar en una base de datos relacional, con la ventaja de que el esquema se define en tiempo de ejecucion.
- Analisis de sentimiento en resenas y tickets de soporte: `classify` devuelve la puntuacion de todas las etiquetas, lo que permite fijar umbrales de confianza y derivar casos dudosos a revision humana en lugar de forzar una decision binaria.
- Enriquecimiento de CRM: extraer organizaciones, cargos y ubicaciones de correos y notas de reuniones para completar fichas de clientes. El uso de esquemas combinados permite obtener entidades y relaciones en una sola pasada sobre el texto.
- Procesamiento por lotes sin GPU: al distribuirse en ONNX, el modelo puede ejecutarse con ONNX Runtime en CPU dentro de un pipeline de ingesta documental, sin necesidad de instalar PyTorch ni de disponer de acelerador.
- Moderacion de contenido y etiquetado taxonomico: definir categorias ad hoc para clasificar textos entrantes y, en la misma llamada, extraer las entidades mencionadas, reduciendo el numero de pasadas sobre cada documento.
- Extraccion de menciones en literatura cientifica: etiquetas como `gene`, `protein`, `disease` o `drug` permiten recuperar menciones y relaciones entre ellas sin disponer de un corpus anotado especifico del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye metricas de MMLU, GLUE, CoNLL, HumanEval, GSM8K ni de tareas de extraccion de informacion, y los resultados de busqueda web asociados no contienen informacion relevante sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 1,1 GB en disco, lo que constituye una cota superior del espacio ocupado por los pesos; en la practica, la memoria necesaria depende de la implementacion de ONNX Runtime y del tamano de lote. Una estimacion razonable en fp32 se situa en el rango de 2 a 3 GB incluyendo activaciones, pero el autor no publica cifras.
- GPU recomendadas: no disponibles. Al ser un modelo de extraccion de informacion de escala tipo base, es compatible con GPUs de gama media, aunque no existe confirmacion del autor sobre modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada oficialmente. Por el tamano del repositorio, es previsible que quepa en GPUs de consumo con 6-8 GB de VRAM, pero este dato no esta verificado en la informacion disponible.
- Opciones de despliegue: la via documentada es la libreria `fast_gliner` mediante `FastGLiFormer.from_pretrained("talmago/gliformer-base-v1-onnx")`. Ademas, al ser un artefacto ONNX, puede ejecutarse con ONNX Runtime en sus variantes de CPU y GPU, y servirse detras de un servidor propio. Otros runners habituales (llama.cpp, Ollama, TGI, vLLM) no son aplicables a este formato y no estan documentados para este modelo.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempos de inferencia ni de documentos por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| talmago/gliformer-base-v1-onnx | no disponible | ONNX (encoder + 4 cabezas) | Ingles | no disponible | HuggingFace, libreria fast_gliner |
| knowledgator/gliformer-base-v1 | no disponible | PyTorch (no incluido en este repo) | no disponible | no disponible | HuggingFace, modelo base del anterior |
| Familia GLiNER (por ejemplo urchade/gliner_multi-v2.1) | no disponible | PyTorch, ONNX en conversiones de terceros | Multilingue segun variante | no disponible | HuggingFace |

No se dispone de cifras de parametros, contexto, licencia ni rendimiento para los modelos comparados dentro de la informacion proporcionada, por lo que no es posible una comparacion cuantitativa fiable. La diferencia verificable entre las dos primeras filas es exclusivamente el formato de pesos y la libreria de inferencia: este repositorio distribuye ONNX para `fast_gliner`, mientras que el modelo base distribuye el checkpoint original.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia. Sin ese dato no puede asumirse permiso para uso comercial ni redistribucion; conviene consultar la licencia del modelo base knowledgator/gliformer-base-v1 antes de cualquier despliegue en produccion.
- Cobertura idiomatica limitada: el modelo esta etiquetado unicamente como ingles (`en`). No hay evidencia de soporte para castellano u otros idiomas, por lo que su uso sobre textos en espanol no esta respaldado por la documentacion.
- Riesgo de alucinacion y falsos positivos: en tareas de extraccion zero-shot, la seleccion de etiquetas influye directamente en el resultado. Etiquetas ambiguas o solapadas pueden producir extracciones espurias; la model card no documenta umbrales de confianza recomendados ni curvas de precision/recall.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de los datos. No existen evaluaciones independientes ni informes de terceros sobre la fidelidad de la conversion ONNX respecto al checkpoint original de PyTorch.
- Conversion no verificada numericamente: al no incluirse el checkpoint de PyTorch ni publicarse metricas comparativas, no puede confirmarse que las salidas ONNX reproduzcan exactamente las del modelo base. La LSTM a nivel de palabra se ha fusionado en las cabezas, lo que es un cambio estructural respecto a la organizacion del modelo original.
- Dependencia de la libreria `fast_gliner`: la interfaz documentada esta ligada a esa libreria y a la clase FastGLiFormer. No se documenta compatibilidad con `transformers` ni con otras APIs de inferencia.
- Contexto y lotes no documentados: se desconoce la longitud maxima de secuencia soportada, el comportamiento con documentos largos y la gestion de entradas por lotes.
- Registros planos: la extraccion estructurada devuelve registros planos, no jerarquicos. Esquemas con anidamiento (por ejemplo, un pedido con multiples lineas) requieren post-procesado propio.
- Sesgos: no disponible. El autor no publica analisis de sesgos ni informacion sobre la composicion del corpus de entrenamiento del modelo original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/talmago/gliformer-base-v1-onnx
- Modelo base: https://huggingface.co/knowledgator/gliformer-base-v1
- Libreria fast_gliner: https://github.com/talmago/fast_gliner
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante sobre el modelo; las entradas devueltas corresponden a paginas no relacionadas con inteligencia artificial.
