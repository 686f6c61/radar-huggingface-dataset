# StanfordSCALE/assertion_sentence_references_prior_learning_or_lesson

## Resumen

`StanfordSCALE/assertion_sentence_references_prior_learning_or_lesson` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificación auditable de diálogo en el aula. El modelo responde a una única pregunta: si un enunciado de un docente hace referencia a un aprendizaje previo o a una lección anterior. No es un modelo generativo, sino un clasificador de frases construido con SetFit sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet, 109.486.464 parámetros) y una cabeza de regresión logística.

La relevancia del modelo es acotada pero concreta: permite automatizar la preanotación de corpus de discurso instruccional a escala, un cuello de botella clásico en investigación educativa, donde la codificación manual de transcripciones es lenta y costosa. Se distribuye con licencia no especificada, funciona únicamente en inglés y está pensado para consumirse a través del paquete Python `EduBehaviors-kit` o mediante `setfit`.

Sus métricas son modestas y el propio autor advierte que no debe usarse de forma autónoma: F1 de 0,3934 en el conjunto de prueba con una tasa base del 3,7 %, sobre etiquetas generadas por anotadores LLM con un alfa de Krippendorff de 0,442. Encaja, por tanto, como componente de un pipeline de cribado con revisión humana, no como sistema de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (encoder de frases) fine-tuning contrastivo con SetFit + cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 (aprox. 109,5 M), segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no documentada en la model card) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuerpo) junto con la cabeza de clasificacion del pipeline SetFit |
| Tarea | text-classification (clasificacion binaria, una sola asercion) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves (3.430 train / 858 dev / 2.146 test) |
| Libreria | setfit |
| Tamano del repositorio | 0,4 GB |
| Columnas de salida | assertion_sentence_references_prior_learning_or_lesson, split_sentence_references_prior_learning_or_lesson |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: se parte de un sentence transformer preentrenado, `paraphrase-mpnet-base-v2`, y se afina su cuerpo con aprendizaje contrastivo sobre pares de frases generados a partir de las etiquetas del dataset. Sobre los embeddings resultantes se entrena una regresion logistica como cabeza de clasificacion. La entrada es el enunciado en bruto (`{utterance}`), sin plantilla adicional ni prefijos, y la salida es una probabilidad para la clase positiva.

Los hiperparametros documentados son: learning rate del cuerpo de 2e-05, learning rate de la cabeza de 0,01, batch de 16 en la fase contrastiva y de 32 en la cabeza, 10 epocas, max steps de 5.000 en la fase contrastiva, 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU. El dataset de entrenamiento procede de un subconjunto anotado por LLM de intervenciones docentes del TalkMoves Dataset: 3.430 filas de train (53,3 %), 858 de dev (13,3 %) y 2.146 de test (33,4 %), con una tasa base global del 3,4 % (3,2 % train, 3,7 % dev, 3,7 % test). No se documenta uso de RLHF ni de DPO, algo coherente con un clasificador de este tipo.

La innovacion tecnica es la propia metodologia SetFit: al no requerir un LLM generativo en inferencia, el clasificador es extremadamente ligero (109,5 M de parametros) y puede ejecutarse en CPU. El coste de esa eficiencia es un rendimiento limitado, tal y como reflejan las metricas.

## Capacidades

- Clasificacion binaria de enunciados docentes: determina si la frase hace referencia a un aprendizaje previo o a una leccion anterior.
- Devuelve probabilidades calibradas mediante `predict_proba`, lo que permite fijar umbrales segun el coste relativo de falsos positivos y falsos negativos.
- Integracion directa con el paquete `EduBehaviors-kit` para pipelines de codificacion de discurso en el aula.
- Inferencia sobre texto en ingles, sin necesidad de plantillas ni formato especial.
- Ejecucion en CPU con un coste computacional bajo, apta para lotes grandes de transcripciones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es exclusivamente un clasificador de una unica etiqueta.
- Capacidad multilingue: limitada al ingles; no se declara soporte de otros idiomas.

## Casos de uso

- Preanotacion de corpus de discurso instruccional: dado un conjunto de transcripciones de clases, el modelo etiqueta cada intervencion docente segun si conecta con aprendizajes previos, reduciendo el volumen de texto que los codificadores humanos deben revisar. Es adecuado por su bajo coste de inferencia, pero exige revision posterior dado su F1 de 0,3934.
- Cribado previo en un pipeline hibrido con LLM: se usa el clasificador como primera etapa de filtrado para seleccionar candidatos y se reserva un modelo generativo o un anotador humano para confirmar los casos positivos, aprovechando su alta precision relativa (0,5714 frente a un recall de 0,300).
- Investigacion educativa a escala: analisis de cientos o miles de sesiones grabadas para medir la frecuencia con que los docentes activan conocimientos previos, con un ROC-AUC de 0,782 que permite ordenar las intervenciones por probabilidad.
- Formacion y desarrollo profesional docente: generar informes que muestren ejemplos reales de conexion con la leccion anterior en las grabaciones de un profesor, siempre con supervision, para ilustrar practicas concretas.
- Construccion de datasets etiquetados: usar el modelo para ampliar el corpus de la asercion con nuevas transcripciones, marcando las predicciones como no verificadas y midiendo la precision de forma periodica sobre muestras anotadas manualmente.
- Analisis comparativo de modalidades de ensenanza: aplicar el mismo clasificador a corpus de distintas asignaturas o niveles para explorar diferencias en la frecuencia de referencias a aprendizajes previos, controlando por la tasa base de cada subconjunto.
- Investigacion sobre la fiabilidad de anotaciones LLM: el propio modelo documenta un alfa de Krippendorff de 0,442 y sirve como caso de estudio para medir como se propaga el desacuerdo entre anotadores a las metricas finales del clasificador.
- Integracion en herramientas de observacion de aula: incorporar la etiqueta como una senal adicional en dashboards de observacion, acompanada de la probabilidad y de una advertencia explicita de baja fiabilidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados externamente):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 3,7 % | 0,545 | 0,375 | 0,444 | 0,867 | 0,531 |
| test | 2.146 | 3,7 % | 0,571 | 0,300 | 0,393 | 0,782 | 0,387 |

| Metrica (test) | Valor |
|---|---|
| F1 (clase positiva) | 0,3934 |
| Precision (clase positiva) | 0,5714 |
| Recall (clase positiva) | 0,3000 |
| ROC-AUC | 0,7820 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de modelos generativos, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 438 MB (109.486.464 parametros x 4 bytes) y en fp16 unos 219 MB. Sumando el runtime de PyTorch y los buffers de activacion, basta con menos de 1 GB de memoria para lotes pequenos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, una T4 o una RTX 3060 son mas que suficientes, y en la practica la CPU es una opcion valida.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: `setfit` y `sentence-transformers` sobre PyTorch (es la via documentada por el autor), exportacion a ONNX o TorchScript para servir con ONNX Runtime, y contenedorizacion propia. No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo con decodificacion autoregresiva.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al tratarse de un encoder de 109,5 M de parametros sin decodificacion autoregresiva, el coste por ejemplo es muy inferior al de un LLM, y el rendimiento dependera del hardware, del tamano de lote y de la longitud de los enunciados.

## Comparativa con modelos similares

No se dispone de informacion sobre clasificadores alternativos de la misma asercion o del mismo corpus, por lo que la comparativa se limita a los elementos documentados.

| Modelo | Parametros | Tarea | Contexto | Metrica principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| StanfordSCALE/assertion_sentence_references_prior_learning_or_lesson | 109,5 M | Clasificacion binaria de la asercion "referencia a aprendizaje previo o leccion" | no disponible | F1 test 0,3934; ROC-AUC 0,782 | no disponible | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base) | 109,5 M | Embeddings de frases; no realiza clasificacion binaria por si solo | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Otros clasificadores de aserciones del proyecto EduBehaviors | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento proceden de anotadores LLM, no de codificadores humanos, con un acuerdo entre anotadores (alfa de Krippendorff) de 0,442, lo que indica una fiabilidad baja de la propia referencia.
- El F1 de la clase positiva en test es de 0,393 y el recall de 0,300: el modelo deja escapar aproximadamente el 70 % de los casos positivos. La propia model card indica que no funciona lo bastante bien para usarse de forma autonoma.
- Fuerte desbalanceo de clases: la tasa base es del 3,4 % global y del 3,7 % en test. La precision (0,571) debe interpretarse siempre en relacion con esa tasa base; la average precision en test es de 0,387.
- Entrenado exclusivamente con intervenciones de docentes. El comportamiento sobre habla de estudiantes no ha sido evaluado.
- Solo ingles. No hay soporte declarado para otros idiomas y no se documenta evaluacion multilingue.
- No se especifica la licencia, por lo que el uso comercial queda en una situacion juridica indeterminada y requiere consulta previa con los autores.
- No se documentan sesgos especificos, pero al operar sobre discurso de aula y con etiquetas generadas por LLM puede heredar sesgos de anotacion del corpus TalkMoves y de los modelos anotadores.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos con apariencia plausible, especialmente en enunciados ambiguos sobre conocimientos previos.
- No hay versiones cuantizadas ni pesos en GGUF, ni despliegue en servidores de inferencia de LLM. Cualquier uso en produccion requiere construir el pipeline de clasificacion alrededor del modelo.
- Los resultados de dev son mejores que los de test (F1 0,444 frente a 0,393), lo que sugiere cierta variabilidad y desaconseja el ajuste de umbrales sobre dev sin validacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_references_prior_learning_or_lesson
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio original del corpus): https://github.com/SumnerLab/TalkMoves
- Paquete Python de uso (EduBehaviors-kit): mencionado en la model card, sin URL disponible en la informacion proporcionada
- Cita sugerida por el autor: Stanford SCALE Initiative, "Assertion classifier: sentence references prior learning or lesson", 2026, URL del modelo
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo.
