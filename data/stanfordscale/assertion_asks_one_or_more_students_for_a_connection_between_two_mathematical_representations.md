# StanfordSCALE/assertion_asks_one_or_more_students_for_a_connection_between_two_mathematical_representations

## Resumen

`StanfordSCALE/assertion_asks_one_or_more_students_for_a_connection_between_two_mathematical_representations` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors (esquemas de aserciones para codificacion auditable de dialogo). No es un modelo generativo: es un detector de una conducta discursiva muy concreta, la de que un profesor pida a uno o varios alumnos que establezcan una conexion entre dos representaciones matematicas (por ejemplo, entre un grafico y una ecuacion, o entre dos modelos construidos por estudiantes).

Tecnicamente es un modelo SetFit: un encoder de frases `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parametros) afinado con aprendizaje contrastivo y rematado con una cabeza de regresion logistica. Se entrena sobre un subconjunto del corpus TalkMoves anotado por LLM, con etiquetas que alcanzan una tasa base del 1,2 %, es decir, un problema fuertemente desbalanceado. Su relevancia es metodologica: forma parte de una familia de clasificadores que permiten codificar turnos de aula de forma automatizada y auditable, sin depender de un LLM generativo en el momento de la inferencia.

Conviene subrayar desde el principio que el propio autor advierte de que las etiquetas provienen de anotadores LLM y no de codificadores humanos, con un alfa de Krippendorff de 0,377, que el propio model card califica de pobre. Es, por tanto, una herramienta de investigacion en fase temprana y no un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) + cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 (aproximadamente 109,5 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; solo se publican pesos en precision completa (safetensors), sin variantes GGUF ni cuantizadas |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repositorio: 0,4 GB) |
| Libreria de inferencia | setfit |
| Tarea (pipeline) | text-classification (clasificacion binaria) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit, que combina dos fases. En la primera se afina el encoder de frases con aprendizaje contrastivo a partir de pares de ejemplos de la misma clase, con un learning rate de 2e-05, batch size 16, 10 epocas y un maximo de 5.000 pasos. En la segunda se congela el encoder y se entrena una regresion logistica sobre los embeddings resultantes, con learning rate 0,01, batch size 32 y 100 pasos maximos de evaluacion. La semilla empleada es 20260904 y se activo precision mixta en GPU.

Los datos proceden del subconjunto anotado por LLM de `StanfordSCALE/assertions_llm_annotated_talkmoves`, derivado a su vez del TalkMoves Dataset y restringido a intervenciones de profesor. El reparto es de 13.179 ejemplos de entrenamiento (53,3 %), 3.295 de validacion (13,3 %) y 8.241 de test (33,3 %), con una tasa base de positivos del 1,1 %, 1,3 % y 1,3 % respectivamente (1,2 % global). No se documenta el uso de RLHF ni de DPO, algo esperable en un clasificador de este tipo. La innovacion relevante no es arquitectonica sino de esquema: la asercion evaluada pertenece a un conjunto top-down (`td`) disenado para que cada prediccion sea trazable a una definicion explicita y auditable.

## Capacidades

- Clasificacion binaria de un unico tipo de asercion: determina si un turno de profesor pide a los estudiantes conectar dos representaciones matematicas.
- Salida probabilistica mediante `predict_proba`, lo que permite fijar umbrales segun el equilibrio deseado entre precision y recall.
- Inferencia ligera: al ser un encoder de 109 M de parametros, funciona en CPU sin GPU dedicada.
- Integracion directa con el paquete `EduBehaviors-kit`, orientado a la codificacion de dialogo de aula.
- Entrada de texto plano: la `{utterance}` se pasa tal cual, sin plantilla de prompt ni instrucciones adicionales.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling, function calling ni flujos de agente multi-paso.
- Multilingue: no; el modelo esta entrenado y declarado unicamente para ingles.
- Capacidades especiales: ninguna mas alla de la clasificacion de la asercion descrita.

## Casos de uso

- Investigacion en discurso matematico de aula: procesar transcripciones completas de sesiones de clase y cuantificar con que frecuencia el docente solicita conexiones entre representaciones, una de las practicas asociadas a la ensenanza de matematicas de calidad.
- Anotacion asistida de corpus educativos: prefiltrar los turnos candidatos antes de la revision humana, de modo que los codificadores solo revisen los casos con mayor probabilidad y se reduzca el coste de anotacion manual.
- Formacion docente y retrovision de practicas: generar informes automaticos sobre el uso de esta practica en grabaciones de aula, para que el profesor analice su propio patron de interaccion.
- Validacion cruzada de etiquetados LLM: usar el clasificador como segunda opinion frente a un LLM anotador y detectar discrepancias sistematicas. El alfa de Krippendorff de 0,377 hace este uso especialmente pertinente.
- Construccion de pipelines de analitica de aprendizaje: encadenar la salida de este clasificador con otros clasificadores de la misma familia EduBehaviors para construir perfiles agregados de interaccion en un curso.
- Analisis comparativo entre aulas o entre condiciones didacticas: al ser un modelo determinista y barato de ejecutar, permite procesar lotes grandes de transcripciones y comparar proporciones entre grupos.
- Despliegue como microservicio interno de bajo coste: con 109 M de parametros puede servirse en una instancia pequena, algo inviable con un LLM generativo usado como anotador.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model card y en el model-index (no verificados de forma independiente; `verified: false`):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.295 | 1,3 % | 0,524 | 0,256 | 0,344 | 0,837 | 0,278 |
| test | 8.241 | 1,3 % | 0,667 | 0,330 | 0,442 | 0,872 | 0,489 |

En el model-index se declaran para el split de test: F1 0,4417, precision 0,6667, recall 0,3303 y ROC-AUC 0,8719. La diferencia entre ROC-AUC y average precision es un indicador claro del desbalance extremo: el modelo ordena razonablemente bien las probabilidades, pero con el umbral por defecto deja escapar aproximadamente dos tercios de los positivos reales.

## Requisitos de hardware

- VRAM estimada: en float32, alrededor de 0,44 GB para los pesos; en float16, unos 0,22 GB. A esto hay que sumar activaciones y el tokenizador, por lo que un presupuesto de 1-2 GB es holgado.
- GPU: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, T4, RTX 3060 o superiores). No se requiere A100 ni H100; su uso seria un desperdicio de recursos.
- Consumer GPU: si, cabe con enorme margen, y en la practica la inferencia por CPU es perfectamente viable para lotes moderados.
- CPU: el modelo funciona sin acelerador; para clasificacion por lotes conviene usar varios hilos, ya que el cuello de botella es el encoder MPNet y no la cabeza logistica.
- Opciones de despliegue: la libreria `setfit` (con PyTorch o TensorFlow como backend) es la via documentada. Tambien puede exportarse el encoder a ONNX o a un pipeline de `transformers` para servir la representacion, pero la cabeza logistica hay que gestionarla por separado.
- vLLM, llama.cpp, Ollama y TGI no aplican: no hay pesos GGUF ni un modelo generativo que servir.
- Latencia y throughput: no disponibles. Al tratarse de un encoder de 109 M de parametros, el coste dominante es la codificacion de la frase, proporcional al numero de tokens de entrada, mas una multiplicacion matricial trivial en la cabeza.
- Almacenamiento: el repositorio ocupa 0,4 GB.

## Comparativa con modelos similares

No se dispone de datos publicados de otros clasificadores directamente comparables dentro de la informacion proporcionada. La comparacion mas informativa es contra el propio modelo base sin afinar y contra el anotador LLM que genero las etiquetas:

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SetFit sobre paraphrase-mpnet-base-v2) | 109,5 M | Clasificacion binaria de la asercion `td__..._connection_between_two_mathematical_representations` | no disponible | no disponible | HuggingFace, libreria setfit |
| sentence-transformers/paraphrase-mpnet-base-v2 (base, sin afinar) | 109,5 M | Embeddings de frases de proposito general | no disponible | no disponible | HuggingFace |
| Anotador LLM que genero las etiquetas del dataset | no disponible | Anotacion de aserciones sobre turnos de aula | no disponible | no disponible | no disponible |
| Otros clasificadores de la familia EduBehaviors | no disponible | Clasificacion de otras aserciones discursivas | no disponible | no disponible | HuggingFace (coleccion StanfordSCALE) |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos. El propio autor indica que el acuerdo entre anotadores medido con alfa de Krippendorff es de 0,377 y lo califica de pobre, anadiendo que tanto las predicciones del modelo como los datos subyacentes no son fiables.
- Desbalance severo: solo el 1,2 % de las filas son positivas. El recall en test es de 0,330, por lo que el modelo omite la mayor parte de los casos reales si se usa el umbral por defecto.
- El modelo se entreno exclusivamente con intervenciones de profesor. El comportamiento sobre habla de estudiantes no ha sido evaluado.
- Sesgos conocidos: no disponibles de forma explicita, aunque al tratarse de un corpus de aula estadounidense en ingles, los patrones linguisticos aprendidos estaran ligados a ese contexto educativo.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos (precision de 0,667 en test), es decir, clasificar como peticion de conexion entre representaciones un turno que no lo es.
- Limitacion idiomatica: solo ingles declarado. Su uso sobre transcripciones en castellano no esta validado.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, por lo que no puede asumirse uso comercial libre y conviene consultar al autor antes de cualquier explotacion en produccion.
- Caveat de produccion: dado el bajo acuerdo de anotacion y el reducido recall, este clasificador no deberia usarse para tomar decisiones sobre docentes ni para evaluaciones de rendimiento sin validacion humana exhaustiva.
- Verificacion: los resultados del model-index estan marcados como no verificados (`verified: false`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_asks_one_or_more_students_for_a_connection_between_two_mathematical_representations
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Dataset original TalkMoves: https://github.com/SumnerLab/TalkMoves
- Libreria SetFit: https://github.com/huggingface/setfit
- Paquete `EduBehaviors-kit`: mencionado en el model card, sin enlace disponible en la informacion proporcionada
- Cita recomendada por el autor: Stanford SCALE Initiative, "Assertion classifier: the utterance asks one or more students for a connection between two mathematical representations", 2026
