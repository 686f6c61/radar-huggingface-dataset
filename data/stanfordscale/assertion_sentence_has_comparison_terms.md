# StanfordSCALE/assertion_sentence_has_comparison_terms

## Resumen

El modelo `StanfordSCALE/assertion_sentence_has_comparison_terms` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea concreta es determinar si una intervencion de un docente en el aula contiene terminos de comparacion (por ejemplo, relaciones entre magnitudes, medidas o conceptos). No es un modelo generativo: es un discriminador de una sola etiqueta entrenado con SetFit sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` y una cabeza de regresion logistica.

El modelo resuelve un problema de escalabilidad en la investigacion educativa: la codificacion manual de discurso de aula es costosa y lenta, y este clasificador permite preetiquetar utterances de profesor de forma automatica y auditable. Se distribuye con 109.486.464 parametros (~109 M), un repositorio de 0,4 GB, licencia no especificada y soporte unicamente para ingles. Su integracion prevista es el paquete Python `EduBehaviors-kit` y el ecosistema SetFit.

Es relevante porque forma parte de una familia de "assertions" (esquemas de codificacion declarativos) que buscan hacer reproducible y verificable la anotacion de comportamientos educativos, un area donde historicamente ha predominado la codificacion manual con fiabilidad interanotador limitada (en este caso, alpha de Krippendorff de 0,657). Sus resultados declarados en el split de test son F1 de 0,7956, precision de 0,7786, recall de 0,8134 y ROC-AUC de 0,9428.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) + cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 (~109 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el encoder base MPNet admite secuencias de hasta 512 tokens |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, GPTQ, AWQ ni ONNX cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repo: 0,4 GB) |
| Tarea (pipeline) | text-classification (clasificacion binaria) |
| Libreria | setfit |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma SetFit: en una primera fase contrastiva se ajusta el cuerpo del encoder MPNet (`paraphrase-mpnet-base-v2`) con un learning rate de 2e-05, batch size de 16 y un maximo de 5.000 pasos; en una segunda fase se entrena una cabeza de regresion logistica con learning rate de 0,01 y batch size de 32, durante 10 epocas y con un maximo de 100 pasos de evaluacion. La semilla empleada es 20260904 y se activo precision mixta en GPU. El texto de entrada se construye unicamente con la utterance del docente, sin plantilla adicional.

Los datos de entrenamiento proceden de un subconjunto anotado por LLM de utterances de profesor del TalkMoves Dataset, agregados en el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves` con 3.430 filas de train (53,3 %), 858 de dev (13,3 %) y 2.146 de test (33,4 %). La tasa base de la etiqueta positiva es del 6,2 % global (6,2 % en train, 6,3 % en dev, 6,2 % en test), lo que convierte la tarea en un problema de clase muy desbalanceada. Las etiquetas fueron generadas por anotadores automaticos basados en LLM, con un acuerdo interanotador de Krippendorff de 0,657; no se documento RLHF ni DPO, ya que no es un modelo generativo.

## Capacidades

- Clasificacion binaria de una utterance de profesor para la assertion "la frase contiene terminos de comparacion".
- Salida de probabilidad calibrable mediante `predict_proba`, devolviendo `[P(no), P(si)]`, util para ajustar umbrales segun el coste relativo de falsos positivos y negativos.
- Prediccion por lotes con `model.predict([...])`, adecuada para procesar corpus completos de transcripciones de aula.
- Integracion con el ecosistema SetFit y con el paquete Python `EduBehaviors-kit` para flujos de codificacion de dialogo auditable.
- Modelo exclusivamente en ingles y de dominio especifico (discurso de aula); no dispone de capacidades multilingues.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento ("thinking mode"): no es un modelo generativo ni un LLM conversacional.
- Existe una assertion complementaria en la misma familia, `split_sentence_has_comparison_terms`, que codifica una etiqueta relacionada dentro del mismo esquema.

## Casos de uso

- Codificacion automatica de discurso de aula a escala: procesar transcripciones completas de clases y marcar que intervenciones del docente contienen comparaciones, reduciendo el trabajo manual de anotacion en estudios con cientos de horas de grabacion.
- Preetiquetado para codificacion humana: generar una primera pasada sobre el corpus y reservar el esfuerzo de los codificadores humanos para la revision y el arbitraje de los casos dudosos, aprovechando la salida probabilistica para priorizar.
- Investigacion en didactica de las matematicas: detectar cuando el profesor establece relaciones entre magnitudes o medidas (el ejemplo de la model card relaciona diametros, altura inclinada y tres medidas), lo que permite cuantificar la presencia de razonamiento comparativo en la instruccion.
- Construccion de indicadores de calidad instruccional: agregar las predicciones por sesion o por docente para generar metricas descriptivas de practica de aula, siempre con validacion humana previa por el acuerdo interanotador moderado.
- Formacion y desarrollo profesional docente: analizar grabaciones de practicas y devolver al profesor un resumen de en que momentos de su explicacion introdujo comparaciones, como material de reflexion.
- Filtrado y enrutado en pipelines de anotacion: dado el 6,2 % de tasa base, usar el clasificador como primera etapa de triaje para descartar candidatos claramente negativos antes de aplicar anotadores mas costosos.
- Analisis de materiales curriculares textuales: aplicar el clasificador a guiones de clase o explicaciones escritas, con la cautela de que el entrenamiento se realizo sobre habla de profesor y el rendimiento fuera de dominio no esta verificado.
- Auditoria de esquemas de codificacion: usar las assertions como codigo declarativo versionado, de modo que la definicion de la etiqueta, el dataset y las metricas queden documentadas y reproducibles junto al modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados externamente, `verified: false`):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 6,3 % | 0,677 | 0,778 | 0,724 | 0,962 | 0,748 |
| test | 2.146 | 6,2 % | 0,779 | 0,813 | 0,796 | 0,943 | 0,840 |

Metricas de test segun el model-index: F1 = 0,7956, precision = 0,7786, recall = 0,8134, ROC-AUC = 0,9428. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, y en cualquier caso no aplican a un clasificador discriminativo de este tipo.

## Requisitos de hardware

- Huella de pesos: ~109 M de parametros; aproximadamente 437 MB en fp32 y 219 MB en fp16, coherente con el repositorio de 0,4 GB.
- VRAM estimada para inferencia: por debajo de 1-2 GB en fp16 con lotes pequenos, incluyendo activaciones y overhead del runtime.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU para lotes moderados; en GPU basta una T4, RTX 3060 o cualquier tarjeta consumer reciente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: `setfit` (via `SetFitModel.from_pretrained`), `sentence-transformers` y transformers para el encoder, exportacion a ONNX o TorchScript para servir en produccion. vLLM, TGI y llama.cpp no son las rutas naturales para este modelo, ya que no es un LLM generativo.
- Latencia y throughput estimados: no disponible.
- Con 0 descargas registradas, no existe evidencia publica de despliegues en produccion ni de rendimiento medido en entornos reales.

## Comparativa con modelos similares

No se han publicado comparativas directas con alternativas en la informacion disponible. Como referencia interna de la familia:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_sentence_has_comparison_terms | ~109 M | hasta 512 tokens (encoder base) | Clasificacion binaria de terminos de comparacion | no disponible | HuggingFace, 0 descargas |
| split_sentence_has_comparison_terms (familia StanfordSCALE) | no disponible | no disponible | Assertion complementaria del mismo esquema | no disponible | Referenciada como columna del dataset; metricas no disponibles |
| sentence-transformers/paraphrase-mpnet-base-v2 (encoder base) | no disponible | hasta 512 tokens | Sentence embeddings de proposito general | no disponible en la informacion | HuggingFace |
| Clasificadores SetFit genericos | variable | depende del encoder | Clasificacion de texto few-shot | variable | HuggingFace |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos; el acuerdo entre anotadores es de Krippendorff alpha = 0,657, un valor moderado que limita el techo alcanzable por el clasificador.
- El modelo se entreno exclusivamente con utterances de profesor; su comportamiento sobre habla de estudiantes no esta probado.
- Solo soporta ingles, tanto por el idioma declarado como por la procedencia del corpus.
- La licencia no esta disponible, lo que supone un riesgo juridico para uso comercial: conviene contactar con el autor antes de cualquier despliegue productivo.
- La clase positiva tiene una prevalencia del 6,2 %, lo que implica que la precision depende mucho del umbral elegido; en validacion (dev) la precision baja a 0,677, y el umbral por defecto puede no ser adecuado para produccion.
- Las metricas declaradas no estan verificadas (`verified: false`) y no hay evaluacion independiente ni resultados publicados por terceros.
- El modelo tiene 0 descargas y 0 likes, sin comunidad ni soporte documentado mas alla de la model card.
- No es un modelo generativo: no hay riesgo de alucinacion de texto, pero si de falsos positivos y falsos negativos sistematicos, especialmente en dominios alejados del discurso de aula.
- No se documentan analisis de sesgo por idioma, dialecto, nivel educativo, asignatura ni demografia del profesorado.
- La ventana de entrada esta limitada por el encoder MPNet (tipicamente 512 tokens); utterances mas largas requeririan truncado o segmentacion, lo que puede alterar las predicciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_has_comparison_terms
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base (encoder): https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Paquete Python de uso previsto: `EduBehaviors-kit` (referenciado en la model card; no se proporciona URL)
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo; los resultados devueltos corresponden a un club de ajedrez aleman y no guardan relacion con esta ficha.
