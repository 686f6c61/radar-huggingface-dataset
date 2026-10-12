# StanfordSCALE/assertion_asks_one_or_more_students_for_the_result_of_a_math_computation

## Resumen

El modelo `StanfordSCALE/assertion_asks_one_or_more_students_for_the_result_of_a_math_computation` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative. Su tarea es determinar, a partir de una unica intervencion de un docente, si esta pide a uno o varios alumnos el resultado de un calculo matematico (por ejemplo, "What number name would I give to two of the whites"). Forma parte del conjunto de aserciones top-down (`td`) del proyecto EduBehaviors, orientado a la codificacion auditable de discurso en el aula.

Tecnicamente no es un modelo generativo: es un SetFit, es decir, un encoder `sentence-transformers/paraphrase-mpnet-base-v2` afinado de forma contrastiva al que se le anade una cabeza de regresion logistica. El cuerpo tiene 109.486.464 parametros y el repositorio ocupa 0,4 GB. El clasificador se entrena sobre un subconjunto de intervenciones docentes del TalkMoves Dataset anotado con LLM.

Es relevante ahora porque permite automatizar el etiquetado de comportamientos instruccionales a escala, algo inviable con codificacion humana, y se integra en el paquete Python `EduBehaviors-kit`. La tasa base de la clase positiva es muy baja (3,2 %), lo que condiciona su interpretacion y su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder MPNet (`paraphrase-mpnet-base-v2`) + cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 (safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (carga mediante la libreria `setfit`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit, que combina una fase contrastiva sobre un encoder de frases y una fase de clasificacion supervisada con una cabeza ligera. El cuerpo es `sentence-transformers/paraphrase-mpnet-base-v2` y la cabeza es una regresion logistica. Los hiperparametros documentados son: learning rate del cuerpo 2e-05, learning rate de la cabeza 0,01, batch size 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, un maximo de 5000 pasos en la fase contrastiva, 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU.

Los datos de entrenamiento proceden del subconjunto `StanfordSCALE/assertions_llm_annotated_talkmoves`: 13.181 ejemplos de entrenamiento (53,3 %), 3.294 de validacion (13,3 %) y 8.240 de test (33,3 %), todos ellos intervenciones de docentes. Las etiquetas no son humanas, sino generadas por anotadores LLM, con un acuerdo entre anotadores (alfa de Krippendorff) de 0,731. La tasa base de la clase positiva es del 3,2 % global (3,3 % en entrenamiento, 3,2 % en validacion, 3,1 % en test), lo que confirma un fuerte desbalance de clases. No se documenta uso de RLHF ni DPO, ya que no es un modelo generativo.

## Capacidades

- Clasificacion binaria de texto en ingles: devuelve 1 cuando la intervencion pide a uno o varios alumnos el resultado de un calculo matematico y 0 en caso contrario.
- Salida de probabilidad calibrada mediante `model.predict_proba`, que devuelve `[[P(no), P(yes)]]`.
- Etiquetado de intervenciones docentes individuales, procesadas tal cual (el texto se pasa sin plantilla ni prefijo).
- Integracion en el paquete `EduBehaviors-kit` para pipelines de codificacion de discurso en el aula.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- Capacidad multilingue: no, unicamente ingles.

## Casos de uso

- Investigacion educativa a escala: etiquetar automaticamente transcriptos de clases para cuantificar con que frecuencia los docentes piden resultados de calculos, sustituyendo la codificacion manual.
- Formacion docente: analizar grabaciones de aula y generar informes sobre el tipo de preguntas matematicas formuladas, usando `predict_proba` para priorizar las intervenciones con mayor probabilidad.
- Auditoria de discurso instruccional: alimentar la asercion dentro del conjunto `td` de EduBehaviors para construir codificaciones auditables y reproducibles de una sesion.
- Complemento de anotacion humana: preetiquetar grandes volumenes de transcriptos y reservar el trabajo humano para revision de los casos dudosos, dado el F1 de 0,688 en test.
- Analisis comparativo entre docentes o entre sesiones: aplicar el clasificador a corpus homogeneos de intervenciones docentes para estudiar patrones de demanda de computo matematico.
- Construccion de datasets derivados: usar las predicciones como caracteristica (feature) en modelos posteriores que relacionen tipos de pregunta con resultados de aprendizaje.

## Benchmarks y rendimiento

Resultados declarados por el autor (verificados: false), sobre el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`:

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.294 | 3,2 % | 0,694 | 0,636 | 0,663 | 0,929 | 0,702 |
| test | 8.240 | 3,1 % | 0,680 | 0,696 | 0,688 | 0,938 | 0,696 |

Metricas agregadas del model-index para test: F1 0,6875, precision 0,6795, recall 0,6957, ROC-AUC 0,9384. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 109,5 millones de parametros cabe holgadamente en menos de 1 GB en precision completa y en torno a unos cientos de MB en fp16.
- GPU recomendadas: cualquier GPU, incluida una integrada; una RTX 4090 o una A100 son innecesarias para este tamano, pero validas si se procesan grandes lotes.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en CPU.
- El repositorio ocupa 0,4 GB, por lo que el despliegue en disco es trivial.
- Opciones de despliegue: libreria `setfit` (via `SetFitModel.from_pretrained`); al ser un encoder de sentence-transformers, puede exportarse a herramientas del ecosistema sentence-transformers. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros clasificadores de la misma familia en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. Cualitativamente:

| Modelo | Parametros | Contexto | Licencia | Enfoque | Notas |
|---|---|---|---|---|---|
| Este modelo (SetFit sobre mpnet-base) | 109.486.464 | no disponible | no disponible | Clasificacion binaria especifica | F1 0,688 en test; una sola asercion |
| `sentence-transformers/paraphrase-mpnet-base-v2` (modelo base) | no disponible | no disponible | no disponible | Encoder de frases | No clasifica; es el cuerpo reutilizado |
| Otros clasificadores de aserciones de StanfordSCALE | no disponible | no disponible | no disponible | Clasificacion binaria especifica | Misma metodologia SetFit; datos no disponibles |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de anotadores LLM, no de codificadores humanos; el acuerdo entre anotadores es de alfa de Krippendorff 0,731.
- El modelo se entreno unicamente con intervenciones de docentes; su comportamiento sobre discurso de alumnos no esta probado.
- Idioma limitado al ingles; no hay soporte multilingue.
- Fuerte desbalance de clases: la clase positiva representa solo el 3,1-3,3 % de los ejemplos, lo que exige umbrales y metricas adecuadas (F1, ROC-AUC, average precision) en lugar de exactitud.
- Rendimiento moderado: F1 en test de 0,688 y precision de 0,680, con falsos positivos y falsos negativos no despreciables.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Es un clasificador de una unica asercion; no debe usarse como modelo general de generacion ni de clasificacion fuera de su tarea.
- No hay resultados de benchmarks frente a alternativas, ni datos de latencia o throughput.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_asks_one_or_more_students_for_the_result_of_a_math_computation
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio): https://github.com/SumnerLab/TalkMoves
- Libreria setfit: https://github.com/huggingface/setfit
- Paquete `EduBehaviors-kit`: mencionado en la model card, sin URL disponible.
