# Zeolit/lettuce-eidos-768d-v5

## Resumen

lettuce-eidos-768d-v5 es un modelo de embeddings multilingue orientado a la recuperacion de memoria conversacional, desarrollado por Zeolit como componente de memoria de LettuceAI. Se trata de un student de 12 capas podado desde ibm-granite/granite-embedding-311m-multilingual-r2 (22 capas) y entrenado mediante autodestilacion desde el modelo sin podar, combinada con objetivos contrastivos de retrieval sobre datos generales y de roleplay. Su funcion es indexar y recuperar fragmentos cortos de historial de usuario (turnos de chat, eventos de roleplay, notas) en local o en CPU.

La arquitectura es ModernBERT con 768 dimensiones ocultas, 12 cabezas, FFN de 1152 y una combinacion de 6 capas de atencion global y 6 de ventana deslizante de 128. El modelo tiene 261.513.984 parametros totales segun safetensors (aproximadamente 201M corresponden a la tabla de vocabulario y unos 60M al transformador). La salida es de 768 dimensiones con truncamiento Matryoshka a 512, 384, 256, 128 y 64, y el contexto de entrenamiento es de 4.096 tokens, aunque el modelo base soporta hasta 32K.

Su relevancia actual esta en el nicho de memoria personal y retrieval on-device: ofrece una exportacion int8 ONNX de 262 MB que cabe en CPU y dispositivos modestos, cubre 15 idiomas y permite recuperacion cross-lingual (consulta y memoria en idiomas distintos). Publicado bajo Apache-2.0 y con datos de entrenamiento filtrados por licencias que permiten uso comercial, es un candidato directo para despliegues en produccion sin dependencia de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT, 12 capas (6 de atencion global, 6 de ventana deslizante 128), 768 hidden, 12 cabezas, FFN 1152 |
| Parametros totales | 261.513.984 (segun safetensors); el autor indica 262M: 201M de tabla de vocabulario y 60M de transformador |
| Parametros activos | No aplica (no es MoE). El autor indica 60M de parametros activos por token en el transformador |
| Longitud de contexto | 4.096 tokens (entrenado); el modelo base soporta 32K |
| Tipos de cuantizacion | int8 (cuantizacion dinamica, exportacion ONNX); fp32 (safetensors y ONNX). No se documentan GGUF, GPTQ ni AWQ |
| Idiomas soportados | 15: arabe, aleman, ingles, espanol, frances, hindi, italiano, japones, coreano, neerlandes, polaco, portugues, ruso, turco y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32), ONNX fp32 (1.046 MB) y ONNX int8 (262 MB) |

Otros datos relevantes: pooling por token CLS con normalizacion L2; sin prompts (consultas y documentos se codifican igual); vocabulario de 262.152 tokens (tokenizer de granite multilingual r2); capas conservadas del modelo base: 0, 1, 2, 5, 6, 9, 10, 15, 16, 18, 19 y 21; tamano del repositorio 2,4 GB.

## Arquitectura y entrenamiento

El modelo es un transformer encoder ModernBERT podado de 22 a 12 capas. La seleccion de capas conservadas (0, 1, 2, 5, 6, 9, 10, 15, 16, 18, 19, 21) y el entrenamiento posterior se plantean como destilacion del modelo original sobre el student, de modo que el podado no se compensa solo con fine-tuning supervisado, sino con senal de autodestilacion desde el profesor sin podar. La mitad de las capas usa atencion global y la otra mitad ventana deslizante de 128 tokens, lo que reduce coste de atencion manteniendo acceso global en capas alternas.

Los objetivos de entrenamiento combinan la destilacion con aprendizaje contrastivo de retrieval sobre dos bloques de datos. El bloque general consta de 11,06 millones de pares tras el filtrado, procedentes de 18 fuentes que incluyen MIRACL, Mr. TyDi, HotpotQA, SQuAD, Natural Questions con negativos duros, JaQuAD, GermanQuAD, GermanDPR, SQAC, PolQA, FineWiki, WikiMatrix, Tatoeba, Europarl, StackExchange y SWIM-IR (monolingue y cross-lingual), entre otras. El bloque de roleplay y memoria conversacional incorpora CohereLabs/aya_dataset, OpenAssistant/oasst2, deepmind/narrativeqa, hotchpotch/bekko-embedding-hard-negatives y google/Synthetic-Persona-Chat, ademas de un dataset de consultas IR sinteticas sobre Wikipedia multilingue. El autor indica que se excluyeron datasets no comerciales o sin derivadas, contenido web de terceros y salidas de modelos con terminos que restringen el entrenamiento. No se menciona RLHF ni DPO: el regimen descrito es destilacion mas contraste.

Una innovacion operativa destacable es la publicacion de `calibration.json`, que contiene un mapeo afin por dimension (a y b) y umbrales por defecto. Las similitudes coseno crudas de este modelo son altas incluso para texto no relacionado; el ranking no se ve afectado, pero los umbrales fijos calibrados para otros modelos no son validos y deben sustituirse por los de este fichero.

## Capacidades

- Generacion de embeddings de frases y pasajes: salida de 768 dimensiones normalizada L2, con pooling por token CLS.
- Truncamiento Matryoshka a 512, 384, 256, 128 y 64 dimensiones, renormalizando tras el truncado, sin reentrenamiento.
- Similitud semantica y recuperacion (retrieval) de memorias cortas: turnos de chat, eventos de roleplay y notas.
- Recuperacion cross-lingual: consulta y memoria pueden estar en idiomas distintos dentro de los 15 soportados.
- Multilingue en 15 idiomas: arabe, aleman, ingles, espanol, frances, hindi, italiano, japones, coreano, neerlandes, polaco, portugues, ruso, turco y chino.
- Contexto de 4.096 tokens por entrada, adecuado para pasajes y conversaciones de longitud media.
- Inferencia en CPU y on-device mediante la exportacion int8 ONNX, con pooling y normalizacion dentro del grafo.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito: es un modelo de representacion, no generativo.
- Compatible con text-embeddings-inference y con endpoints segun los tags del repositorio.

## Casos de uso

- Memoria a largo plazo en asistentes conversacionales: indexar los turnos previos de un usuario y recuperar los relevantes antes de cada respuesta. El modelo esta entrenado especificamente sobre datos de memoria y roleplay y funciona bien con fragmentos cortos, que es el formato natural de un historial de chat.
- Personajes de roleplay con continuidad: almacenar hechos y eventos de la ficcion ("Elara escondio la espada en el pozo") y recuperarlos cuando el usuario pregunta por ellos, incluso si la pregunta y el recuerdo estan en idiomas distintos.
- Busqueda semantica en corpus multilingues: indexar documentacion tecnica, articulos de wiki o articulos de soporte procedentes de varios idiomas en un unico espacio vectorial, permitiendo consultas en un idioma y resultados en otro.
- RAG ligero sobre notas personales: construir un indice local de apuntes, correos o transcripciones y recuperar pasajes relevantes para alimentar a un LLM generativo, con la ventaja de que la recuperacion cabe en CPU y no requiere GPU.
- Deduplicacion y agrupamiento de tickets de soporte: generar embeddings de tickets y agrupar por similitud para detectar incidencias repetidas, apoyandose en las dimensiones Matryoshka reducidas (por ejemplo 128 o 64) para abaratar el clustering a gran escala.
- Filtrado y moderacion por similitud: comparar mensajes entrantes con un conjunto de referencia de casos conocidos, usando los umbrales calibrados de `calibration.json` en lugar de umbrales fijos heredados de otros modelos.
- Recuperacion cross-lingual en comercio electronico: indexar descripciones de producto en 15 idiomas y permitir que una consulta en espanol recupere productos descritos en japones o turco.
- Clasificacion y enrutado de intenciones: usar los embeddings como caracteristicas de entrada a un clasificador ligero para enrutar conversaciones, con truncamiento a 256 o 128 dimensiones para reducir coste de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero `evaluation/results.json` que, segun la model card, contiene todos los numeros citados en ella, pero los valores concretos no forman parte de la informacion proporcionada, por lo que no se reproducen aqui. Tampoco se han facilitado cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,3 GB con la exportacion int8 ONNX (fichero de 262 MB) y en torno a 1,1 GB en fp32 (fichero ONNX de 1.046 MB). Son estimaciones derivadas del tamano de los ficheros publicados; no se han facilitado mediciones oficiales de memoria en ejecucion.
- GPU recomendadas: no disponibles. El modelo esta disenado explicitamente para inferencia en CPU y en dispositivo ("on device or on CPU"), por lo que una GPU dedicada no es un requisito del caso de uso previsto.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo actual puede alojar los pesos por tamano; no obstante, el perfil objetivo es CPU, y no se documenta ninguna ventaja de rendimiento sobre GPU.
- Opciones de despliegue: sentence-transformers (requiere una version de `transformers` con soporte de `layer_types` de ModernBERT; el checkpoint se guardo con transformers 5.17), ONNX Runtime con CPUExecutionProvider, text-embeddings-inference y endpoints compatibles segun los tags del repositorio. No se documentan Ollama, llama.cpp ni TGI.
- Latencia y throughput: no disponibles. El unico dato operativo publicado es que la cuantizacion int8 esta pensada para ejecucion en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Dimensiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lettuce-eidos-768d-v5 | 261.513.984 (201M vocabulario + 60M transformer) | 12 (ModernBERT podado) | 4.096 entrenado; base 32K | 768 con Matryoshka a 512/384/256/128/64 | Apache-2.0 | safetensors fp32, ONNX fp32 e int8, calibracion incluida |
| ibm-granite/granite-embedding-311m-multilingual-r2 (modelo base) | 311M (aproximado; el autor usa esta referencia) | 22 | Soporta 32K | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Zeolit/lettuce-emb-768d-v4 (predecesor) | no disponible | no disponible | no disponible | 768 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

Solo se dispone de datos verificables del modelo base y del predecesor inmediato. Cualquier comparacion con modelos de embeddings externos del mismo rango (por ejemplo familias multilingues de 300M de parametros) requeriria cifras de benchmarks que no se han facilitado.

## Limitaciones y advertencias

- Similitudes coseno crudas elevadas: incluso textos no relacionados obtienen valores altos. El ranking no se ve afectado, pero aplicar umbrales fijos calibrados para otros modelos produce falsos positivos. Hay que usar el mapeo y los umbrales de `calibration.json`.
- Al truncar a dimensiones Matryoshka menores hay que renormalizar el vector resultante (la division por la norma se realiza despues del truncado) y usar los coeficientes de calibracion correspondientes a esa dimension.
- Contexto de entrenamiento limitado a 4.096 tokens: aunque el modelo base soporte 32K, el student solo fue entrenado a 4.096, por lo que no hay garantia de calidad mas alla de esa longitud.
- Disenado para memorias y pasajes cortos. No esta pensado para documentos largos ni para resumen abstractivo, tareas para las que no se ha entrenado.
- Cobertura linguistica limitada a 15 idiomas. No se documenta comportamiento en lenguas fuera de esa lista, incluidas otras lenguas del Estado espanol como el catalan, el gallego o el euskera.
- Sesgos: el propio autor indica que existen debilidades conocidas recogidas en la seccion de limitaciones de la model card, pero ese contenido no forma parte de la informacion proporcionada, por lo que no se puede detallar aqui.
- No es un modelo generativo: no produce texto, no alucina texto, pero puede recuperar memoria irrelevante si la calibracion es incorrecta, lo que se traduce en contexto erroneo para el LLM que consuma los resultados.
- Requisito de version de `transformers` con soporte de `layer_types` de ModernBERT; versiones antiguas no cargaran el checkpoint. Este requisito no aplica a la ruta ONNX.
- Licencia Apache-2.0, que permite uso comercial y obras derivadas. El autor declara haber filtrado los datos de entrenamiento a licencias permisivas (CC-BY, CC-BY-SA, Apache-2.0, MIT o sin restricciones de copyright), pero esa verificacion es responsabilidad suya y no se acompana de una auditoria independiente en la informacion disponible.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, publicado en 2026 y sin adopcion registrada, lo que implica ausencia de validacion externa y de reportes de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zeolit/lettuce-eidos-768d-v5
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-311m-multilingual-r2
- Predecesor: https://huggingface.co/Zeolit/lettuce-emb-768d-v4
- Proyecto LettuceAI: https://lettuceai.app
- Resultados de evaluacion citados en la model card: `evaluation/results.json` dentro del repositorio
- Fichero de calibracion de puntuaciones: `calibration.json` dentro del repositorio
- Las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo; los enlaces obtenidos correspondian a productos de tapones para los oidos y no se incluyen por no ser relevantes.
