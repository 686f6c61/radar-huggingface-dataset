# StanfordSCALE/assertion_is_a_one_word_agreement

## Resumen

`StanfordSCALE/assertion_is_a_one_word_agreement` es un clasificador binario de texto en ingles desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas de "assertions" para la codificacion auditable de dialogo educativo. El modelo resuelve una pregunta muy concreta: determinar si un turno de habla de un docente constituye un acuerdo de una sola palabra (por ejemplo, "Yeah", "Exactly"), etiqueta asociada al assertion `bu5__is_a_one_word_agreement` del conjunto bottom-up `bu5`. Esta pensado para codificar automaticamente discurso de aula a escala, un cuello de botella clasico en la investigacion educativa.

Tecnicamente no es un modelo generativo, sino un clasificador entrenado con SetFit sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (MPNet) con una cabeza de regresion logistica. El repositorio declara 109.486.464 parametros en safetensors (0,4 GB), lo que corresponde practicamente en su totalidad al encoder; la cabeza logistica anade un numero despreciable de parametros. Se distribuye a traves de la libreria `setfit` y esta pensado para integrarse en el paquete Python `EduBehaviors-kit`.

Su relevancia es doble: por un lado, demuestra un flujo de trabajo de anotacion asistida por LLM sobre el TalkMoves Dataset (13.183 ejemplos de entrenamiento, 3.294 de desarrollo y 8.238 de test, con una tasa base del 2,4 % de positivos); por otro, publica metricas de desequilibrio extremo con un ROC-AUC de 0,9816 en test, lo que lo hace util como componente de un pipeline de codificacion mas amplio. El modelo solo se ha entrenado con intervenciones de docentes, en ingles, y no se especifica licencia ni ventana de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador SetFit: encoder transformer MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) + cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 (safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica en la informacion proporcionada; el encoder base MPNet es de tipo bidireccional y el modelo recibe la utterance sin estructura adicional) |
| Tipos de cuantizacion | No disponible; el repositorio publica unicamente pesos safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria `setfit`, compatible con el ecosistema `sentence-transformers`) |
| Tamano del repositorio | 0,4 GB |
| Tarea (pipeline) | text-classification |
| Etiquetas de salida | Binaria: `assertion_is_a_one_word_agreement` (y columna auxiliar `split_is_a_one_word_agreement`) |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: en una primera fase se realiza un ajuste contrastivo del encoder `sentence-transformers/paraphrase-mpnet-base-v2` (MPNet, un transformer bidireccional preentrenado con modelado de lenguaje enmascarado permutado) con learning rate 2e-05, batch size 16 y un maximo de 5.000 pasos. En una segunda fase se congela el encoder y se entrena una cabeza de regresion logistica con learning rate 0,01 y batch size 32. En total se declaran 10 epocas, 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU.

Los datos proceden de un subconjunto anotado por LLM de utterances de docentes del TalkMoves Dataset, con 13.183 filas de entrenamiento (53,3 %), 3.294 de desarrollo (13,3 %) y 8.238 de test (33,3 %). Las etiquetas no son humanas: se generaron con anotadores LLM y la concordancia entre anotadores medida con alfa de Krippendorff es de 0,674. La tasa base de positivos es muy baja (2,4 % global; 2,2 % en train, 2,6 % en dev y 2,7 % en test), lo que convierte el problema en un caso claro de clasificacion con desequilibrio severo. El formato de entrada es la utterance en crudo, sin plantilla ni prefijo adicional. No se documenta en la informacion disponible ninguna innovacion adicional como decodificacion especulativa, atencion lineal ni tecnicas de RLHF o DPO; al tratarse de un clasificador discriminativo, estas tecnicas no aplican.

## Capacidades

- Clasificacion binaria de utterances: predice si un turno de habla constituye un acuerdo de una sola palabra.
- Puntuacion probabilistica: `predict_proba` devuelve `[P(no), P(yes)]`, lo que permite usar el modelo como score continuo y ajustar el umbral segun el coste de falsos positivos y falsos negativos.
- Procesamiento de texto corto en ingles: el ejemplo de la model card es una unica palabra ("Yeah").
- Operacion a nivel de utterance individual, sin necesidad de contexto de conversacion en el propio modelo.
- Integracion con el paquete Python `EduBehaviors-kit` y con el ecosistema SetFit.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, function calling, capacidades de agente, vision, audio ni modo de pensamiento; no es un modelo generativo ni multimodal.
- No se documentan capacidades multilingues: el modelo esta etiquetado exclusivamente como `en`.

## Casos de uso

- Codificacion automatica de discurso de aula a escala: procesar transcripciones completas de clases y marcar que turnos del docente cierran la intervencion de un alumno con un acuerdo de una sola palabra, alimentando el esquema de assertions del proyecto EduBehaviors. Es adecuado porque el problema esta acotado y el coste por inferencia es minimo al ser un encoder de 109 M de parametros.
- Pre-etiquetado para codificacion humana: usar el modelo como primera pasada sobre corpus grandes y reservar la revision humana para los casos dudosos. La precision de 0,834 en test reduce el volumen de falsos positivos que llegan al anotador humano.
- Investigacion educativa replicable: codificar corpus de distintos estudios con un criterio homogeneo y auditable, ya que cada assertion es una etiqueta binaria verificable y el pipeline completo queda documentado en `EduBehaviors-kit`.
- Analitica de patrones de validacion docente: agregar las predicciones por profesor, sesion o asignatura para medir la frecuencia de acuerdos de una palabra frente a otros tipos de respuesta, siempre corregida por la baja tasa base del 2,7 % en test.
- Muestreo y filtrado de corpus: seleccionar subconjuntos con alta densidad de este comportamiento para analisis cualitativo detallado, usando `predict_proba` como criterio de seleccion en lugar de la etiqueta binaria.
- Extraccion de caracteristicas para modelos de mas alto nivel: combinar el score de este clasificador con el resto de clasificadores de assertions del ecosistema EduBehaviors para construir representaciones de turno o de sesion.
- Despliegue en backends con CPU: al ser un modelo pequeno y no generativo, puede ejecutarse en el servidor de una plataforma de gestion de aprendizaje o de analitica docente sin GPU dedicada.
- Apoyo a la formacion docente: generar informes que muestren la proporcion de intervenciones de alumnos cerradas con un unico token de asentimiento, como indicador de patrones de interaccion en el aula.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card, sobre el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves` (clase positiva con una tasa base del 2,6 % en dev y 2,7 % en test). Los valores de test figuran como no verificados (`verified: false`).

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.294 | 2,6 % | 0,900 | 0,828 | 0,862 | 0,996 | 0,857 |
| test | 8.238 | 2,7 % | 0,834 | 0,732 | 0,780 | 0,982 | 0,767 |

No se han publicado en la informacion disponible resultados de benchmarks en tareas estandar (MMLU, HumanEval, GSM8K u otras), ni comparaciones oficiales con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en fp32 y 0,22 GB en fp16 para los pesos, mas el coste de activaciones, despreciable con batch size 1. En la practica, menos de 1 GB de memoria.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre. No se necesita A100, H100 ni RTX 4090; una GPU integrada o una GTX 1050 son suficientes.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual y en la mayoria de generaciones anteriores. Tambien es viable en CPU pura, dado el tamano del encoder.
- Opciones de despliegue: `setfit` con `SetFitModel.from_pretrained(...)` es la via oficial documentada. El encoder subyacente puede servirse con el stack de `sentence-transformers` y la cabeza de regresion logistica exportarse con herramientas de scikit-learn. vLLM, llama.cpp, Ollama y TGI no son aplicables porque el modelo no es generativo y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La model card no incluye ninguna medicion de latencia, throughput ni requisitos de memoria.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks de modelos alternativos, por lo que las celdas de rendimiento se dejan como no disponibles. La comparacion se limita a caracteristicas estructurales.

| Modelo | Tipo | Parametros | Contexto | Licencia | Rendimiento en esta tarea |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_is_a_one_word_agreement | SetFit (MPNet + regresion logistica) | 109.486.464 | No disponible | No disponible | F1 0,780 y ROC-AUC 0,982 en test (declarado por el autor) |
| sentence-transformers/paraphrase-mpnet-base-v2 | Encoder de similitud, sin cabeza supervisada | No disponible en la informacion proporcionada | No disponible | No disponible aqui | No disponible (no es un clasificador supervisado de esta etiqueta) |
| Clasificador BERT/RoBERTa fine-tuned generico para la misma etiqueta | Transformer encoder + capa de clasificacion | No disponible | No disponible | No disponible | No disponible |
| Anotacion zero-shot con un LLM generativo | Modelo generativo con prompt | No disponible | No disponible | No disponible | No disponible |

La ventaja estructural del modelo frente a alternativas generativas en este escenario es el coste de inferencia (encoder de 109 M de parametros ejecutable en CPU) y la salida calibrada mediante `predict_proba`.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de anotadores LLM, no de codificadores humanos. El alfa de Krippendorff para este assertion es de 0,674, un nivel de acuerdo moderado que impone un techo practico a la calidad del clasificador.
- El modelo se entreno exclusivamente con utterances de docentes. Su comportamiento sobre habla de estudiantes no ha sido probado.
- Idioma unico: ingles. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Debe verificarse con los autores antes de cualquier despliegue en produccion.
- Desequilibrio extremo de clases: la clase positiva representa solo el 2,4 % del corpus. El recall en test es de 0,732, de modo que aproximadamente una cuarta parte de los casos positivos no se detectan; la eleccion del umbral debe calibrarse segun el caso de uso.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos en utterances cortas y ambiguas que compartan forma superficial con un acuerdo de una palabra.
- El ejemplo de la model card muestra que una unica palabra ("Yeah") puede devolver la etiqueta positiva, lo que indica una fuerte dependencia del lexico superficial y no de la estructura conversacional.
- No debe interpretarse la salida como juicio pedagogico: es una anotacion de una unica dimension del discurso de aula dentro de un esquema mayor.
- No se documentan sesgos demograficos ni linguisticos especificos, pero tampoco se han publicado evaluaciones de sesgo en la informacion disponible.
- No se documentan limitaciones de longitud de secuencia, aunque el encoder base es un transformer de tipo bidireccional orientado a frases cortas; las utterances muy largas deberian validarse antes de usarse en produccion.
- Los enlaces devueltos por la busqueda web no guardan relacion con el modelo y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_is_a_one_word_agreement
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Paquete Python EduBehaviors-kit: mencionado en la model card, sin URL disponible en la informacion proporcionada
- Libro blanco "EduBehaviors: Assertion-based schemas for auditable dialogue coding": mencionado en la model card, sin URL disponible en la informacion proporcionada
- Citacion del autor: Stanford SCALE Initiative, "Assertion classifier: is a one word agreement", 2026, https://huggingface.co/StanfordSCALE/assertion_is_a_one_word_agreement
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
