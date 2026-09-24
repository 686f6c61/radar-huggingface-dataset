# zixuans8/hw1-hc3-detector

## Resumen

El modelo `zixuans8/hw1-hc3-detector` es un clasificador de texto basado en la arquitectura BERT (etiqueta `bert` declarada por el autor) con 22.713.986 parametros, publicado en HuggingFace por el usuario Zixuan Sun en el contexto de la asignatura CS546 (otoño de 2026) de la Universidad de Illinois en Urbana-Champaign. Se distribuye como un trabajo academico de la tarea HW1, con el identificador interno "HW1-HC3-Classifier", y su funcion declarada es la clasificacion de texto mediante la pipeline `text-classification`.

El modelo reporta en su model card dos cifras de exactitud sobre un conjunto de evaluacion de 4.668 ejemplos: una linea base (baseline) del 84,49% y un resultado tras fine-tuning del 99,40%. La diferencia es notable y sugiere un ajuste muy agresivo sobre una tarea de clasificacion concreta, presumiblemente binaria o de pocas clases, aunque la model card no especifica el espacio de etiquetas ni la naturaleza exacta de las clases.

Su relevancia es limitada fuera del ambito del curso: no declara licencia, idiomas soportados, composicion del dataset de entrenamiento ni hiperparametros. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto recien publicado y sin validacion externa. Aun asi, resulta util como caso de estudio de fine-tuning de un transformer pequeno para clasificacion, y como ejemplo de las limitaciones de documentacion habituales en modelos academicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (segun etiqueta del autor); configuracion concreta no disponible |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (la familia BERT suele configurarse con 512 tokens, sin confirmar en este caso) |
| Tipos de cuantizacion | no disponible; al ser safetensors, admite conversion a FP16, INT8 y GGUF mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Libreria | transformers |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible es la etiqueta `bert` declarada en los metadatos de HuggingFace, junto con el recuento real de parametros extraido del fichero safetensors: 22.713.986. Esa cifra es sustancialmente inferior a los 110 millones de parametros de `bert-base-uncased` y a los 66 millones de DistilBERT, lo que indica una configuracion reducida (menos capas, menor dimension oculta o vocabulario mas pequeno), pero el repositorio no incluye `config.json` descrito en la model card ni hiperparametros que permitan confirmar el numero de capas, cabezas de atencion o dimension del embedding. No se dispone de informacion sobre el mecanismo de atencion, la funcion de activacion ni si se anadio una cabeza de clasificacion personalizada.

Tampoco se documentan los datos de entrenamiento: no se indica el numero de tokens, la composicion del dataset, el idioma, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (poco habituales en un clasificador de este tamano). El unico dato de entrenamiento implicito son los resultados de evaluacion: 84,49% de exactitud en la linea base (3.944 aciertos de 4.668) y 99,40% tras el fine-tuning (4.640 aciertos de 4.668). El sufijo "HC3" del nombre coincide con las siglas del corpus Human ChatGPT Comparison Corpus, un conjunto de pares humano/maquina muy usado en tareas de deteccion de texto generado por IA; se trata, no obstante, de una hipotesis basada en el nombre y en la denominacion de la tarea, no de un dato confirmado en la documentacion del modelo.

## Capacidades

- Clasificacion de texto: es la unica capacidad declarada (pipeline `text-classification`), entrenada presumiblemente sobre una tarea concreta del curso CS546.
- Text embeddings: el tag `text-embeddings-inference` sugiere compatibilidad con despliegue como servicio de inferencia de representaciones, aunque no se documenta ninguna cabecera de pooling ni el uso del encoder sin la cabeza de clasificacion.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el modelo puede desplegarse en la infraestructura de Inference Endpoints de HuggingFace.
- Generacion de texto: no disponible; no es un modelo generativo.
- Razonamiento multi-paso, tool calling, function calling y agentes: no disponible; no hay soporte documentado.
- Codigo, matematicas y vision: no disponible; no hay evidencia de entrenamiento en estos dominios.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo de razonamiento explicito (thinking) y modalidades de audio: no disponibles.

## Casos de uso

- Clasificacion de texto en lotes dentro de un pipeline academico o de investigacion: el modelo puede ejecutarse sobre grandes volumenes de texto en CPU con un coste minimo, dado su tamano de 22,7 millones de parametros y un repositorio de 0,1 GB, lo que permite procesar miles de documentos por hora sin GPU dedicada.
- Deteccion de texto generado por IA (hipotesis basada en el sufijo HC3): si la tarea entrenada es la discriminacion humano/maquina del corpus HC3, el modelo podria usarse para marcar contenidos sospechosos en plataformas editoriales, siempre que se valide antes la taxonomia real de etiquetas, que la model card no documenta.
- Filtrado de contenido en preprocesado de datasets: como clasificador rapido y ligero, encaja como etapa de filtrado previo a un pipeline de entrenamiento mayor, descartando o etiquetando ejemplos antes de pasarlos por un modelo mas costoso.
- Prototipado rapido en ensenanza: sirve como ejemplo reproducible de fine-tuning de un BERT reducido y de publicacion de artefactos en HuggingFace dentro de un curso universitario, con una metrica concreta de mejora (84,49% a 99,40%).
- Servicio de inferencia de baja latencia en el borde: la huella de memoria (del orden de 90 MB en FP32 y menos de 50 MB en FP16) permite desplegarlo en dispositivos con recursos limitados o en contenedores pequenos con `text-embeddings-inference`.
- Etiquetado asistido para anotacion humana: el modelo puede preetiquetar ejemplos y reducir el trabajo manual de anotadores, siempre que su etiqueta predicha se revise posteriormente; el 99,40% reportado se refiere al conjunto de evaluacion del autor y no garantiza ese rendimiento en datos de otro dominio.
- Base para experimentos de destilacion o comparacion de arquitecturas: al ser un BERT de ~22,7 millones de parametros, puede servir de referencia en estudios que midan el compromiso entre tamano y exactitud frente a BERT-base o DistilBERT.

## Benchmarks y rendimiento

Unicos resultados publicados en la model card, sobre un conjunto de evaluacion de 4.668 ejemplos:

| Metrica | Baseline | Tras fine-tuning |
|---|---|---|
| Exactitud (accuracy) | 84,49% (3.944 / 4.668) | 99,40% (4.640 / 4.668) |
| Aciertos | 3.944 | 4.640 |
| Errores | 724 | 28 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, SuperGLUE u otros) en la informacion disponible. No se documenta la composicion del conjunto de evaluacion, la naturaleza de la linea base ni la definicion exacta de la tarea, por lo que la cifra del 99,40% no es comparable con resultados de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 91 MB en FP32 (22,7 M de parametros x 4 bytes), unos 46 MB en FP16/BF16 y unos 23 MB en INT8. El coste real lo dominan la activacion y el vocabulario, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente (GTX 1050 Ti, RTX 3050, T4, L4); tambien es viable en GPUs de gama alta (RTX 4090, A100, H100) sin ninguna ventaja significativa de rendimiento respecto a una GPU pequena.
- Inferencia en CPU: perfectamente viable. El modelo cabe en memoria RAM de cualquier equipo actual y puede alcanzar latencias de milisegundos por ejemplo en procesadores modernos con `torch` en modo inferencia.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo lanzadas en la ultima decada, incluidos portatiles.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (tag `text-embeddings-inference`), Inference Endpoints de HuggingFace (tag `endpoints_compatible`), y conversion a GGUF para `llama.cpp` u Ollama si se desea. vLLM y TGI no son opciones tipicas para un clasificador de este tamano, aunque TGI admite algunos modelos de clasificacion.
- Latencia y throughput: no disponibles; no se publican mediciones. Por el tamano del modelo, es razonable esperar latencias de un solo digito en milisegundos por secuencia corta en GPU y de decenas de milisegundos en CPU, pero se trata de una estimacion, no de un dato medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| zixuans8/hw1-hc3-detector | 22,7 M | no disponible | no disponible | 99,40% de exactitud en su tarea, conjunto de 4.668 ejemplos | HuggingFace, 0 descargas |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | Resultados publicados en GLUE | Ampliamente disponible |
| distilbert-base-uncased | 66 M | 512 tokens | Apache 2.0 | ~97% del rendimiento de BERT-base en GLUE | Ampliamente disponible |
| roberta-base | 125 M | 512 tokens | MIT | Resultados publicados en GLUE y SuperGLUE | Ampliamente disponible |

La comparacion directa no es posible: no se conocen los benchmarks de este modelo en tareas estandar, ni su licencia, ni su idioma. Los tres modelos de referencia tienen licencias permisivas explicitas, mientras que `hw1-hc3-detector` no declara ninguna, lo que impide recomendar su uso en produccion frente a alternativas con terminos claros.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita, el uso comercial y la redistribucion quedan en un limbo legal. No debe integrarse en productos sin aclarar antes los terminos con el autor.
- Ausencia total de documentacion sobre los datos: no se indica el dataset, el idioma, el dominio ni el numero de tokens de entrenamiento, por lo que no es posible evaluar sesgos ni cobertura.
- Riesgo de sobreajuste: la diferencia entre el 84,49% de la linea base y el 99,40% final, medida sobre un unico conjunto de 4.668 ejemplos, es compatible con un ajuste muy estrecho al dominio de la tarea. La model card no reporta conjunto de validacion, matriz de confusion ni metricas por clase.
- Espacio de etiquetas no documentado: no se especifica que clases predice el modelo, lo que impide interpretar la salida sin inspeccionar el `config.json` del repositorio.
- Generalizacion desconocida: no hay evaluacion fuera del conjunto del autor; el rendimiento en textos de otro dominio, registro o idioma es impredecible.
- Riesgo de alucinacion: no aplicable en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza, especialmente en entradas fuera de la distribucion de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles; si la configuracion sigue el patron BERT estandar, la ventana estara limitada a 512 tokens y los textos mas largos requeriran truncamiento o segmentacion.
- Sin validacion externa: 0 descargas y 0 likes implican que no hay evidencia de terceros sobre su comportamiento real.
- Contexto academico: el modelo se publica como entrega de la asignatura CS546, sin indicios de mantenimiento posterior ni de soporte.

## Enlaces

- HuggingFace: https://huggingface.co/zixuans8/hw1-hc3-detector
- No se han encontrado en la informacion disponible papers, blogs, repositorios de codigo ni demos adicionales asociados al modelo.
