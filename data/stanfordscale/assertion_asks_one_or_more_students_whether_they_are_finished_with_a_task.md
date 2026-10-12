# StanfordSCALE/assertion_asks_one_or_more_students_whether_they_are_finished_with_a_task

## Resumen

El modelo `StanfordSCALE/assertion_asks_one_or_more_students_whether_they_are_finished_with_a_task` es un clasificador binario de texto en ingles desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors*, un conjunto de esquemas basados en aserciones para codificacion auditable de dialogo educativo. Su tarea concreta es detectar si una intervencion docente pregunta a uno o varios alumnos si han terminado una tarea. No es un modelo generativo: es un clasificador de una sola etiqueta construido con la libreria SetFit sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2`.

Tecnicamente, el modelo combina un *sentence transformer* MPNet afinado de forma contrastiva (fase de cuerpo) con una cabeza de regresion logistica. Cuenta con 109.486.464 parametros y un repo de 0,4 GB en formato safetensors. El entrenamiento se realizo sobre un subconjunto anotado por LLMs del TalkMoves Dataset, con 13.182 ejemplos de entrenamiento, 3.293 de desarrollo y 8.240 de test.

Su relevancia es acotada y muy especializada: forma parte de una infraestructura de investigacion para codificar automaticamente comportamientos docentes (talk moves) y es usable a traves del paquete Python `EduBehaviors-kit`. El propio autor advierte que el rendimiento en test (F1 de 0,3913) no es suficiente para usarlo de forma autonoma, por lo que debe entenderse como un componente dentro de un pipeline mas amplio de anotacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: sentence transformer MPNet (encoder) + cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha; el modelo base MPNet admite hasta 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma SetFit: primero se afina el cuerpo `sentence-transformers/paraphrase-mpnet-base-v2` mediante aprendizaje contrastivo con pares de frases (fase de *body*), y despues se entrena una cabeza de clasificacion `LogisticRegression` sobre los embeddings resultantes. Los hiperparametros declarados son: learning rate del cuerpo de 2e-05, learning rate de la cabeza de 0,01, batch size de 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, un maximo de 5.000 pasos en la fase contrastiva y 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU. La entrada se construye pasando la intervencion (`{utterance}`) tal cual, sin plantilla adicional.

El entrenamiento se realizo sobre `StanfordSCALE/assertions_llm_annotated_talkmoves`, un subconjunto de intervenciones docentes del TalkMoves Dataset anotadas por LLMs. Los tamanos de split son 13.182 filas en train (53,3%), 3.293 en dev (13,3%) y 8.240 en test (33,3%). La tasa base de la clase positiva es extremadamente baja: 0,4% global, 0,4% en train y 0,3% en dev y test. No se menciona el uso de RLHF ni DPO (no aplica a un clasificador de este tipo). El acuerdo entre anotadores, medido con alfa de Krippendorff, es de 0,481, lo que indica una concordancia moderada y senala ruido en las etiquetas de origen.

## Capacidades

- Clasificacion binaria de texto: determina si una intervencion docente pregunta a uno o varios alumnos si han terminado una tarea.
- Salida probabilistica mediante `predict_proba`, que devuelve `[[P(no), P(yes)]]`, aprovechable para umbralizar segun el caso de uso.
- Funciona como componente dentro del paquete `EduBehaviors-kit` para codificacion de dialogo educativo.
- Procesa texto plano en ingles; la intervencion se pasa sin preprocesado adicional.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (vision, audio) ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.

## Casos de uso

- Anotacion automatica de corpus educativos: el clasificador puede marcar de forma masiva intervenciones docentes en transcripciones de clase para preetiquetar grandes volumenes de dialogo antes de la revision humana.
- Analisis de patrones de gestion de aula: permite cuantificar con que frecuencia los docentes comprueban si los alumnos han terminado tareas, como indicador de estructura de la clase.
- Investigacion en ciencias del aprendizaje: al formar parte del esquema de aserciones de EduBehaviors, facilita estudios reproducibles sobre talk moves docentes con criterios auditables.
- Componente en pipelines de codificacion mixta: dado su bajo F1, se recomienda usarlo como *pre-filtro* de alta sensibilidad y complementarlo con revision humana o con un segundo modelo.
- Indexacion y busqueda de momentos didacticos: al puntuar con `predict_proba`, se pueden recuperar fragmentos de transcripcion candidatos a contener este tipo de intervencion para su inspeccion.
- Formacion docente: generacion de informes sobre el uso de este comportamiento en grabaciones de practicas, siempre con supervision experta dado el margen de error.
- Etiquetado asistido dentro de la suite EduBehaviors: encaja como uno de los multiples clasificadores de aserciones que el proyecto usa para caracterizar el discurso del aula.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`:

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.293 | 0,3% | 0,600 | 0,273 | 0,375 | 0,879 | 0,334 |
| test | 8.240 | 0,3% | 0,450 | 0,346 | 0,391 | 0,878 | 0,324 |

Metricas de test tal y como figuran en el model-index: F1 (clase positiva) 0,3913; precision 0,45; recall 0,3462; ROC-AUC 0,8781. El autor advierte que solo hay 26 ejemplos positivos en el split de test, por lo que estas cifras tienen un margen de error amplio. No se han publicado en la informacion disponible resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks generales, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en FP32 (109,5 M de parametros x 4 bytes), mas el overhead de la cabeza logistica y del tokenizador; el repo completo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU moderna con 2 GB o mas de VRAM es suficiente (por ejemplo, GTX 1650, RTX 3060, RTX 4090, A100, H100). El modelo tambien puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU de consumo actual, e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: la libreria `setfit` (`pip install setfit`) es la via oficial; tambien puede servirse con `sentence-transformers` para los embeddings y `scikit-learn` para la cabeza, o exponerse mediante frameworks de serving de clasificacion.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia de pocos milisegundos por lote en GPU y de decenas de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertation_asks_one_or_more_students_whether_they_are_finished_with_a_task (este) | 109,5 M | hasta 512 tokens (base MPNet) | Clasificacion binaria de una asercion docente concreta | no disponible | HuggingFace, 0 descargas |
| sentence-transformers/paraphrase-mpnet-base-v2 | 109,5 M | 512 tokens | Embeddings de frases (proposito general) | Apache-2.0 (segun el modelo base) | HuggingFace, ampliamente usado |
| Clasificador generico zero-shot con LLM (por ejemplo, un modelo de instrucciones) | Variable (miles de millones) | Variable | Clasificacion zero-shot por prompt | Variable | Requiere inferencia generativa |

No se dispone de resultados comparativos publicados entre este clasificador y alternativas equivalentes de la misma categoria (clasificadores de talk moves), por lo que la comparacion debe interpretarse con cautela. La unica referencia directa disponible es el modelo base `paraphrase-mpnet-base-v2`, del cual hereda la arquitectura de encoder.

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos; el alfa de Krippendorff es de 0,481, lo que indica una concordancia moderada y un ruido de etiquetado relevante.
- Solo se entreno con intervenciones docentes. El comportamiento sobre habla de alumnos no ha sido probado.
- Solo hay 26 ejemplos positivos en el split de test, por lo que las metricas tienen un margen de error amplio.
- El propio autor afirma que el F1 de test (0,391) es insuficiente para usar el modelo de forma autonoma.
- La tasa base de la clase positiva es muy baja (0,3-0,4%), lo que provoca un fuerte desbalance y favorece predicciones negativas.
- Idioma limitado al ingles; no se declaran capacidades multilingues.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial, por lo que se debe contactar con el autor antes de cualquier explotacion productiva.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos derivados del bajo recall y la precision moderada.
- No apto para decisiones de evaluacion docente de alto impacto sin supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_asks_one_or_more_students_whether_they_are_finished_with_a_task
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio original): https://github.com/SumnerLab/TalkMoves
- Libreria SetFit: https://github.com/huggingface/setfit (referenciada por `pip install setfit`)
