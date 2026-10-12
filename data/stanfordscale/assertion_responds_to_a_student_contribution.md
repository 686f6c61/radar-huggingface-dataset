# StanfordSCALE/assertion_responds_to_a_student_contribution

## Resumen

El modelo `StanfordSCALE/assertion_responds_to_a_student_contribution` es un clasificador de texto binario desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para el codificado auditable de diálogo educativo. Su tarea concreta es determinar si una intervencion docente responde o no a una contribucion previa de un estudiante, una dimension relevante en el analisis del discurso de aula y en la evaluacion de practicas de ensenanza dialogica. El identificador interno de la asercion es `bu5__responds_to_a_student_contribution`.

Tecnicamente no es un modelo generativo, sino un clasificador construido con el framework SetFit: un cuerpo basado en el encoder de frases `sentence-transformers/paraphrase-mpnet-base-v2` (MPNet, 109.486.464 parametros) sobre el que se entrena una cabeza de regresion logistica. El modelo se distribuye con pesos en formato safetensors, ocupa 0,4 GB en el repositorio y solo soporta ingles. Esta disenado para integrarse en flujos de codificacion automatica de transcripciones de clase, no para conversacion ni generacion.

Su relevancia actual radica en que forma parte del esfuerzo por producir codificacion de discurso educativo escalable y auditable: las etiquetas de entrenamiento se generaron con anotadores LLM sobre el subconjunto anotado del TalkMoves Dataset (13.181 ejemplos de entrenamiento, 3.295 de desarrollo y 8.239 de test), y la propia model card declara una fiabilidad entre anotadores de 0,689 en alfa de Krippendorff, lo que marca el techo practico del etiquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) + cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Libreria | setfit |
| Tamano del repositorio | 0,4 GB |
| Etiquetas de salida | binaria: la asercion se cumple (1) o no se cumple (0) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit en dos fases. En la primera, el cuerpo (`paraphrase-mpnet-base-v2`) se ajusta con aprendizaje contrastivo sobre pares de ejemplos generados a partir del conjunto de entrenamiento, con un learning rate de 2e-05, batch size 16, 10 epocas y un maximo de 5.000 pasos. En la segunda fase se congela el cuerpo y se entrena una cabeza de regresion logistica con learning rate 0,01 y batch size 32, con evaluacion cada 100 pasos. El seed utilizado fue 20260904 y se activo precision mixta en GPU.

Los datos proceden del dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`, derivado de las intervenciones docentes del TalkMoves Dataset. El formato de entrada es unicamente el texto de la intervencion (`{utterance}`), sin contexto adicional, sin marcas de rol y sin historial de la conversacion. Las etiquetas fueron generadas por anotadores LLM, no por codificadores humanos, y el acuerdo entre anotadores para esta asercion es de 0,689 en alfa de Krippendorff. La tasa base de la clase positiva es del 26,6 % en el conjunto global (26,6 % en train, 26,6 % en dev y 26,8 % en test), un desbalance moderado que conviene tener en cuenta al interpretar precision y recall.

No se documenta uso de RLHF, DPO ni decodificacion especulativa, algo esperable en un clasificador discriminativo. Tampoco se detalla la composicion tematica del dataset mas alla de su origen en TalkMoves ni el numero de tokens de entrenamiento.

## Capacidades

- Clasificacion binaria de una unica intervencion docente: predice si la intervencion responde a una contribucion de un estudiante.
- `predict()` devuelve la etiqueta (0 o 1) y `predict_proba()` devuelve las probabilidades de ambas clases, lo que permite umbralizar segun el coste relativo de falsos positivos y falsos negativos.
- Procesamiento de texto en ingles sin preprocesado obligatorio: la intervencion se pasa tal cual.
- Inferencia por lotes mediante la API de SetFit, adecuada para codificar transcripciones completas de sesiones de clase.
- Integracion con el paquete Python `EduBehaviors-kit`, que agrupa el conjunto de aserciones del proyecto.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni razonamiento multi-paso: es exclusivamente un clasificador.
- Cobertura multilingue: ninguna, solo ingles.

## Casos de uso

- Investigacion sobre discurso de aula: codificar automaticamente transcripciones de sesiones y medir la proporcion de intervenciones docentes que responden a contribuciones de estudiantes, una metrica clasica en estudios de ensenanza dialogica. El modelo permite procesar corpus de miles de turnos sin depender de codificadores humanos.
- Formacion y desarrollo profesional docente: generar informes por sesion que cuantifiquen cuanto responde el profesorado a lo que dicen los alumnos, y usarlos como evidencia en sesiones de retroalimentacion.
- Observacion de aulas a escala: en sistemas de evaluacion institucional, aplicar el clasificador sobre transcripciones ASR para obtener indicadores agregados por docente, departamento o centro.
- Triaje en pipelines de anotacion humana: usar `predict_proba()` para seleccionar los casos cercanos al umbral 0,5 y enviarlos a revision manual, reduciendo el volumen de codificacion humana necesaria.
- Analitica de plataformas educativas: en herramientas que graban y transcriben clases (videoconferencia, aulas hibridas), etiquetar turnos en tiempo casi real para alimentar paneles de calidad instruccional.
- Construccion de datasets etiquetados: como etiquetador de bajo coste para preanotar nuevos corpus de discurso educativo antes de una fase de validacion humana.
- Estudios comparativos entre asignaturas o metodologias: aplicar el mismo criterio de codificacion a distintos contextos para analizar si varian los patrones de respuesta a los estudiantes.
- Control de calidad de sistemas ASR en educacion: medir la coherencia de las etiquetas producidas sobre transcripciones automaticas frente a transcripciones manuales.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card. Los valores de F1, precision, recall y ROC-AUC corresponden a la clase positiva. Los resultados no estan verificados (`verified: false`).

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.295 | 26,6 % | 0,571 | 0,439 | 0,496 | 0,752 | 0,553 |
| test | 8.239 | 26,8 % | 0,572 | 0,504 | 0,536 | 0,758 | 0,538 |

Metricas agregadas publicadas en el model-index para el split de test: F1 0,5359, precision 0,5717, recall 0,5043 y ROC-AUC 0,7584.

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en fp32 y 0,22 GB en fp16 a partir de los 109,5 millones de parametros (estimacion aritmetica, no documentada por el autor).
- Cabe sin dificultad en cualquier GPU de consumo: GTX 1660, RTX 3060, RTX 4090, e incluso en GPU integradas.
- Inferencia en CPU perfectamente viable: el cuello de botella es el encoder MPNet, no la cabeza logistica.
- Para lotes grandes en produccion, una A100 o H100 solo tiene sentido si se comparte con otros servicios; este modelo no las necesita.
- Opciones de despliegue: paquete `setfit` (via `SetFitModel.from_pretrained`), y el cuerpo puede exportarse a ONNX u otros formatos a traves del ecosistema de `sentence-transformers`. El autor solo documenta el uso con `setfit`.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones por parte del autor.
- Instalacion: `pip install setfit`.

## Comparativa con modelos similares

No se han publicado en la informacion disponible datos de modelos comparables con los que contrastar parametros, contexto, rendimiento, licencia y disponibilidad. La unica referencia estructural es el propio framework SetFit y el encoder base `sentence-transformers/paraphrase-mpnet-base-v2`, cuyos pesos son publicos, pero no se dispone de metricas de otros clasificadores de aserciones del mismo proyecto o de proyectos equivalentes.

| Modelo | Parametros | Contexto | F1 (clase positiva, test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_responds_to_a_student_contribution | 109.486.464 | no disponible | 0,5359 | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento y de evaluacion provienen de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores es de 0,689 en alfa de Krippendorff, lo que introduce un ruido de etiquetado que acota el rendimiento alcanzable.
- El modelo se entreno solo con intervenciones de profesores. Su comportamiento sobre el habla de estudiantes no se ha probado y no debe asumirse.
- El F1 en test es de 0,5359 y el recall de 0,5043: se le escapan aproximadamente la mitad de los casos positivos al umbral por defecto. Para uso en produccion conviene calibrar el umbral segun el coste de cada tipo de error.
- Existe un desbalance de clases relevante: la clase positiva representa solo el 26,8 % del test. Un clasificador trivial que predijese siempre la clase negativa obtendria una exactitud elevada, por lo que la exactitud no es una metrica informativa aqui.
- Solo soporta ingles. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- La licencia no esta disponible en la informacion proporcionada, por lo que no puede confirmarse que el uso comercial este permitido. Es un riesgo juridico a resolver antes de cualquier despliegue productivo.
- El modelo no incorpora contexto conversacional: clasifica cada intervencion de forma aislada, de modo que la deteccion de una respuesta a un estudiante depende por completo de las marcas linguisticas presentes en el propio turno.
- Riesgo de sesgo: al derivarse del TalkMoves Dataset, las distribuciones de aula, niveles educativos, asignaturas y estilos pedagogicos representados condicionan el comportamiento del clasificador fuera de ese dominio.
- Al ser un modelo con 0 descargas y 0 likes en el momento de redactar esta ficha, no existe retroalimentacion de la comunidad ni validacion externa independiente.
- No debe usarse como sistema de evaluacion punitiva del profesorado sin supervision humana: las etiquetas son aproximaciones estadisticas, no juicios pedagogicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_responds_to_a_student_contribution
- Dataset de anotacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Perfil del autor: https://huggingface.co/StanfordSCALE
