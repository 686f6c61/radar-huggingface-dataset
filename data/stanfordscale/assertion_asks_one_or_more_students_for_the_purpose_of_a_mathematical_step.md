# StanfordSCALE/assertion_asks_one_or_more_students_for_the_purpose_of_a_mathematical_step

## Resumen

El modelo `StanfordSCALE/assertion_asks_one_or_more_students_for_the_purpose_of_a_mathematical_step` es un clasificador de texto binario desarrollado por la Stanford SCALE Initiative para la codificación automática de discurso de aula. En concreto, detecta si un enunciado docente pide a uno o varios estudiantes que aporten el proposito o la justificacion de un paso matematico. Forma parte del conjunto de "aserciones" de esquema top-down (`td`) del proyecto EduBehaviors, orientado a esquemas de codificacion de dialogo auditables mediante el paquete Python `EduBehaviors-kit`.

Tecnicamente no es un modelo generativo, sino un SetFit: un encoder de frases MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) afinado con aprendizaje contrastivo mas un cabezal de regresion logistica. Cuenta con 109.486.464 parametros (unos 109,5 millones) y un repositorio de 0,4 GB en formato safetensors. El modelo esta entrenado sobre un subconjunto de enunciados de profesor del TalkMoves Dataset, anotados automaticamente por anotadores LLM, con etiquetas de tipo binario.

Su relevancia actual es metodologica: ofrece una pieza reutilizable y reproducible para investigacion educativa a escala, con metricas declaradas de F1 de 0,639 y ROC-AUC de 0,943 en el split de test. El principal caveat es la baja tasa base de la clase positiva (0,7 % en test), lo que hace que el ajuste del umbral de decision sea critico en cualquier despliegue real. La licencia no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit (encoder de frases MPNet `paraphrase-mpnet-base-v2` + cabezal de regresion logistica) |
| Parametros totales | 109.486.464 (~109,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (limite de secuencia del encoder MPNet subyacente); el enunciado se pasa tal cual, sin contexto de turnos previos |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas ni GGUF; el repo incluye safetensors de 0,4 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification (clasificacion binaria a nivel de enunciado) |
| Libreria | setfit |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Tamano del repositorio | 0,4 GB |
| Fecha de creacion (segun HuggingFace) | 2026-10-12 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit, que combina dos fases. En la primera, el cuerpo MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) se afina con aprendizaje contrastivo sobre pares de enunciados con la misma etiqueta, con un learning rate de 2e-05, batch size de 16, 10 epocas y un maximo de 5.000 pasos (100 pasos maximos de evaluacion). En la segunda fase se entrena un cabezal de `LogisticRegression` sobre los embeddings resultantes, con learning rate de 0,01 y batch size de 32. Se uso semilla 20260904 y precision mixta en GPU.

Los datos proceden del conjunto `StanfordSCALE/assertions_llm_annotated_talkmoves`, derivado de enunciados de profesor del TalkMoves Dataset. La particion es de 13.181 filas de entrenamiento (53,3 %), 3.295 de desarrollo (13,3 %) y 8.239 de test (33,3 %). Las etiquetas no las generaron codificadores humanos, sino anotadores LLM, con un acuerdo entre anotadores medido por alfa de Krippendorff de 0,732. La tasa base de la asercion es muy baja: 0,8 % global, 0,9 % en train, 0,9 % en dev y 0,7 % en test. No se documenta en la informacion disponible ninguna innovacion adicional como decodificacion especulativa, atencion lineal ni fases de RLHF o DPO, que no aplican a un clasificador de este tipo.

La entrada del modelo es el texto del enunciado sin plantilla adicional (`{utterance}`), es decir, sin marcadores de rol, sin turnos previos y sin metadatos de la sesion de clase.

## Capacidades

- Clasificacion binaria a nivel de enunciado: determina si un enunciado docente pide a los estudiantes justificar o explicar el proposito de un paso matematico.
- Salida probabilistica: `predict_proba` devuelve `[[P(no), P(yes)]]`, lo que permite ajustar el umbral de decision segun el coste relativo de falsos positivos y falsos negativos.
- Prediccion por lotes (`model.predict([...])`) sobre listas de enunciados, apta para procesar transcripciones completas.
- Integracion con el ecosistema SetFit y con el paquete `EduBehaviors-kit` del proyecto EduBehaviors.
- No realiza generacion de texto, resumen, traduccion ni respuesta a preguntas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un clasificador de una sola pasada sobre un unico enunciado.
- No dispone de modo "thinking", vision, audio ni multimodalidad.
- Capacidad multilingue: no. El modelo esta entrenado y evaluado unicamente en ingles.
- No mantiene estado conversacional: cada llamada es independiente y no incorpora contexto de turnos anteriores.

## Casos de uso

- Codificacion automatica de discurso de aula a escala: procesar transcripciones completas de clases de matematicas y etiquetar cada turno docente segun si pide justificacion de un paso. Es adecuado porque la inferencia es barata (109,5 M de parametros) y permite cubrir miles de horas de grabacion que no podrian codificarse manualmente.
- Investigacion educativa sobre practicas de justificacion: medir la frecuencia y distribucion de esta conducta en corpus como TalkMoves para estudiar patrones instruccionales por profesor, nivel o tipo de tarea.
- Prefiltrado para anotacion humana: dado que la clase positiva es rara (0,7 %-0,9 % de los enunciados), el modelo puede usarse para priorizar los candidatos mas probables y reducir el volumen de revision manual, con ajuste de umbral orientado a maximizar recall.
- Formacion y coaching docente: generar informes que cuantifiquen con que frecuencia un docente pide justificacion matematica a sus alumnos, como insumo en programas de desarrollo profesional.
- Analisis de calidad en plataformas de observacion de aula: integrar el clasificador en un pipeline que combine varias aserciones del esquema EduBehaviors para construir un perfil de interaccion de cada sesion.
- Monitorizacion de implementacion curricular: comprobar si una secuencia didactica concreta, disenada para fomentar la justificacion, produce efectivamente ese tipo de pregunta en el aula.
- Investigacion en NLP educativo: usar el modelo como linea base reproducible (SetFit + MPNet) al comparar estrategias de anotacion LLM frente a codificacion humana en tareas de discurso educativo.
- Auditoria de esquemas de anotacion: comparar las predicciones del clasificador con codificaciones humanas en subconjuntos del corpus para estimar la fiabilidad del propio esquema de aserciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (split de test, sin verificacion independiente):

| Metrica | Valor (test) |
|---|---|
| F1 (clase positiva) | 0,6387 |
| Precision (clase positiva) | 0,6552 |
| Recall (clase positiva) | 0,6230 |
| ROC-AUC | 0,9427 |

Tabla completa de evaluacion de la model card:

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.295 | 0,9 % | 0,533 | 0,552 | 0,542 | 0,913 | 0,501 |
| test | 8.239 | 0,7 % | 0,655 | 0,623 | 0,639 | 0,943 | 0,669 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) porque no son aplicables a un clasificador de esta naturaleza. Tampoco se proporcionan comparaciones directas con lineas base alternativas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,44 GB en fp32 para los 109,5 M de parametros; unos 0,22 GB en fp16. El repositorio completo ocupa 0,4 GB en disco.
- El modelo cabe holgadamente en cualquier GPU de consumo e incluso en GPUs integradas; no requiere aceleradores de datacenter.
- GPU recomendadas: ninguna en particular. Una RTX 4090, una RTX 3060 o una T4 son mas que suficientes; A100 o H100 solo tendrian sentido si se comparten con otras cargas del mismo pipeline.
- Inferencia en CPU: plenamente viable para este tamano de modelo, con latencia por enunciado muy baja (cifra concreta no disponible en la informacion proporcionada).
- Opciones de despliegue: libreria `setfit` (`SetFitModel.from_pretrained`), `sentence-transformers`, `transformers` para el encoder, exportacion a ONNX Runtime o TorchScript para servir en produccion, y Hugging Face Inference Endpoints.
- No aplican vLLM, llama.cpp, Ollama ni TGI como servidores de generacion: el modelo no es generativo y no se publican pesos GGUF. Tampoco es un modelo de embeddings puro, por lo que Text Embeddings Inference no cubre el cabezal de clasificacion.
- Throughput y latencia: no disponibles en la informacion proporcionada. La ausencia de decodificacion autorregresiva implica que el coste por ejemplo es el de una unica pasada del encoder, escalable mediante batching.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables publicados para este modelo frente a alternativas, por lo que la comparacion es estructural y no de rendimiento.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (StanfordSCALE, asercion de proposito de paso matematico) | 109,5 M | 128 tokens | Clasificacion binaria de una asercion concreta de discurso de aula | No disponible | HuggingFace (descargas registradas: 0) |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base, sin cabezal) | 109,5 M | 128 tokens | Embeddings de frases de proposito general | Apache 2.0 en su repositorio original (no verificado en esta ficha) | HuggingFace |
| Clasificador generico basado en BERT-base (por ejemplo, bert-base-uncased afinado para clasificacion) | ~110 M | 512 tokens | Clasificacion de texto general | Apache 2.0 (modelo base) | HuggingFace |
| Otras aserciones del conjunto top-down de StanfordSCALE | No disponible | No disponible | Clasificacion binaria de otras conductas de aula | No disponible | HuggingFace |

La ventaja diferencial de este modelo no es el rendimiento bruto, sino su especializacion en una conducta muy concreta y su integracion con el esquema EduBehaviors; su limitacion frente a un BERT-base generico es la ventana de 128 tokens del encoder MPNet.

## Limitaciones y advertencias

- Etiquetas generadas por anotadores LLM, no por codificadores humanos: el acuerdo entre anotadores es de alfa de Krippendorff 0,732, lo que fija un techo practico a la calidad del entrenamiento y de la evaluacion.
- Tasa base extremadamente baja (0,7 % en test): la exactitud global es enganosa; con 0,639 de F1 y 0,655 de precision, una fraccion considerable de las detecciones positivas seran falsos positivos si se usa el umbral por defecto. Es imprescindible calibrar el umbral segun el caso de uso.
- Brecha entre ROC-AUC (0,943) y average precision (0,669): el modelo ordena bien las probabilidades, pero la separacion en el umbral binario es limitada en un problema tan desbalanceado.
- Entrenado exclusivamente con enunciados de profesor. El comportamiento sobre habla de estudiantes no ha sido probado.
- Solo ingles: no hay evidencia de funcionamiento en castellano ni en otros idiomas, y el corpus de origen (TalkMoves) es angloparlante.
- Sin contexto conversacional: cada enunciado se clasifica de forma aislada, lo que puede degradar la deteccion cuando la peticion de justificacion depende de turnos anteriores.
- Licencia no declarada: la ausencia de licencia explicita impide asumir permisos de uso comercial; conviene contactar con el autor antes de integrarlo en un producto.
- Sesgos potenciales: al derivar de un unico corpus de aulas, puede reflejar los sesgos de estilo, nivel educativo y composicion demografica de ese conjunto; no se documentan analisis de equidad.
- Sin verificacion independiente: las metricas del model-index estan marcadas como no verificadas y las descargas registradas son cero, por lo que no existe validacion por terceros.
- Modelo de investigacion acadamica, no un componente de produccion maduro: no hay garantias de mantenimiento, versionado ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_asks_one_or_more_students_for_the_purpose_of_a_mathematical_step
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio original): https://github.com/SumnerLab/TalkMoves
- Cita sugerida por el autor: Stanford SCALE Initiative, "Assertion classifier: the utterance asks one or more students for the purpose of a mathematical step", 2026.
- No se han encontrado otros enlaces relevantes (paper, blog o demo) en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
