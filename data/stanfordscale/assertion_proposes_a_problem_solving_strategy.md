# StanfordSCALE/assertion_proposes_a_problem_solving_strategy

## Resumen

`StanfordSCALE/assertion_proposes_a_problem_solving_strategy` es un clasificador binario de texto en ingles desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea concreta es detectar si un enunciado de un docente contiene la asercion `proposes_a_problem_solving_strategy` (es decir, si propone o explicita una estrategia de resolucion de problemas), dentro del conjunto de aserciones `bu5` del esquema. No es un modelo generativo ni un LLM: es un clasificador discriminativo de una sola etiqueta.

Tecnicamente se trata de un modelo SetFit: un cuerpo (*body*) de embeddings de frases, `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet, 109.486.464 parametros), afinado con aprendizaje contrastivo, sobre el que se monta una cabeza de regresion logistica. El repositorio ocupa 0,4 GB y se distribuye en formato safetensors, consumible mediante la libreria `setfit`.

Su relevancia es acotada pero especifica: cubre la codificacion automatica y auditable de discurso de aula sobre un subconjunto anotado por LLM del TalkMoves Dataset (13.180 ejemplos de entrenamiento, 3.296 de desarrollo y 8.239 de test), y forma parte de un ecosistema de clasificadores de aserciones pensado para investigacion educativa reproducible y para el paquete Python `EduBehaviors-kit`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: cuerpo MPNet (`paraphrase-mpnet-base-v2`) + cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (limitada por el modelo base MPNet) |
| Tipos de cuantizacion | no se documentan versiones cuantizadas; pesos en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,4 GB) |
| Libreria | setfit |
| Pipeline | text-classification |
| Tarea | clasificacion binaria de una asercion (`assertion_proposes_a_problem_solving_strategy`) |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit en dos fases. En la primera, el cuerpo `sentence-transformers/paraphrase-mpnet-base-v2` se afina con aprendizaje contrastivo (learning rate 2e-05, batch size 16, hasta 5.000 pasos maximos, 10 epocas, `eval_max_steps` 100, semilla 20260904, precision mixta activada en GPU). En la segunda se entrena una cabeza de regresion logistica (learning rate 0.01, batch size 32) sobre los embeddings resultantes. La entrada es la utterance en crudo, sin plantilla adicional: el texto se pasa tal cual.

Los datos proceden de un subconjunto anotado por LLM de intervenciones de docentes del TalkMoves Dataset, con 13.180 filas de entrenamiento (53,3%), 3.296 de desarrollo (13,3%) y 8.239 de test (33,3%). La tasa base de la clase positiva es del 11,4% global (11,6% en train, 10,7% en dev, 11,4% en test), un desbalanceo moderado que conviene tener presente al interpretar precision y recall. Las etiquetas no son humanas: la concordancia entre anotadores medida con alfa de Krippendorff es de 0,569, lo que situa el techo de aprendizaje efectivo bastante bajo. No se documenta RLHF, DPO ni ninguna innovacion de decodificacion; es un clasificador discriminativo puro.

## Capacidades

- Clasificacion binaria de texto: devuelve `1` o `0` para la asercion `proposes_a_problem_solving_strategy` sobre una utterance de docente, y probabilidades con `predict_proba`.
- Codificacion de discurso de aula en ingles, dentro del esquema de aserciones `bu5` del proyecto EduBehaviors.
- Integracion con el paquete Python `EduBehaviors-kit` para pipelines de codificacion auditable.
- Uso por lotes: `model.predict([texto1, texto2, ...])` devuelve un array de etiquetas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es multilingue: solo ingles.
- No dispone de modo *thinking*, vision, audio ni generacion de texto libre.
- No es un modelo conversacional ni multi-turno: clasifica enunciados aislados.

## Casos de uso

- Codificacion automatica de transcripciones de aula: dado un corpus de intervenciones docentes transcritas, el modelo etiqueta en lote que enunciados proponen una estrategia de resolucion de problemas, sustituyendo parte del trabajo de codificacion manual en estudios con miles de utterances.
- Investigacion educativa a escala: aplicar el clasificador a subconjuntos amplios del TalkMoves Dataset o a transcripciones propias para medir la frecuencia de esta estrategia instruccional por sesion, docente o materia.
- Formacion y desarrollo profesional docente: generar informes que cuantifiquen cuantas veces un docente explicita estrategias de resolucion de problemas en una sesion grabada, como senal objetiva para sesiones de retroalimentacion.
- Analitica de aprendizaje en plataformas educativas: integrar la inferencia en un pipeline de procesado de transcripciones (ASR -> clasificador -> almacen de eventos) para alimentar paneles de calidad instruccional.
- Auditoria de esquemas de codificacion: al formar parte de un conjunto de aserciones, permite comparar el comportamiento del codificador automatico frente a codificadores humanos o LLM y detectar desacuerdos sistematicos (util dado el alfa de Krippendorff de 0,569).
- Filtrado y muestreo de datos: usar la probabilidad de la clase positiva para seleccionar utterances candidatas a revision humana, priorizando el esfuerzo de anotacion donde el modelo es inseguro.
- Investigacion sobre clasificacion de texto con SetFit: servir como caso de referencia reproducible para estudiar el rendimiento de SetFit con clases desbalanceadas (11,4% de positivos) y etiquetas ruidosas generadas por LLM.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (`verified: false`) sobre el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`:

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.296 | 10,7% | 0,570 | 0,425 | 0,487 | 0,861 | 0,480 |
| test | 8.239 | 11,4% | 0,595 | 0,527 | 0,559 | 0,877 | 0,564 |

Los valores del model-index coinciden con los del split de test (F1 0,559; precision 0,595; recall 0,5272; ROC-AUC 0,8768). No se han publicado en la informacion disponible comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estandar, ya que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 109,5 millones de parametros, los pesos en fp32 ocupan aproximadamente 0,44 GB y en fp16 unos 0,22 GB, mas la cabeza logistica (despreciable).
- GPU recomendadas: cualquier GPU es suficiente; una T4, RTX 3060 o superior sobra. No requiere A100 ni H100.
- Consumer GPU: cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM, e incluso en CPU para lotes pequenos, dado el tamano del repositorio (0,4 GB).
- Opciones de despliegue: la via documentada es la libreria `setfit` (`SetFitModel.from_pretrained(...)`). No se documentan integraciones con vLLM, TGI, Ollama ni llama.cpp, y al no existir versiones GGUF no se recomienda ese camino sin conversion previa.
- Latencia y throughput: no disponible en la informacion proporcionada. Al ser un encoder MPNet-base con cabeza lineal, se espera un coste bajo por inferencia y buen comportamiento en lotes, pero no hay cifras publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `StanfordSCALE/assertion_proposes_a_problem_solving_strategy` | 109,5 M | no disponible | F1 0,559 y ROC-AUC 0,877 en test (autor) | no disponible | safetensors en HuggingFace, libreria setfit |
| `sentence-transformers/paraphrase-mpnet-base-v2` (modelo base) | 109,5 M | no disponible | no disponible para esta tarea concreta | Apache-2.0 (segun su propia ficha, no verificada en esta busqueda) | safetensors, ampliamente usado |
| Otros clasificadores de aserciones del conjunto `bu5` del proyecto EduBehaviors | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de resultados publicados de alternativas directamente comparables (por ejemplo, clasificadores BERT-base o DeBERTa afinados sobre el mismo dataset) en la informacion proporcionada.

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos. La concordancia entre anotadores es de 0,569 (alfa de Krippendorff), lo que introduce ruido irreducible en el entrenamiento y limita el techo de rendimiento alcanzable.
- El modelo se entreno exclusivamente con intervenciones de docentes. Su comportamiento sobre habla de estudiantes no ha sido probado.
- El recall en test es del 52,7%: aproximadamente la mitad de las utterances positivas no se detectan. Con una tasa base del 11,4%, conviene ajustar el umbral de decision segun el coste relativo de falsos positivos y falsos negativos en cada aplicacion.
- No se especifica licencia. Sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion; hay que contactar con el autor antes de cualquier despliegue en produccion.
- Modelo monoidioma (ingles) y mono-tarea: no se puede reutilizar para otras aserciones, otros dominios ni otros idiomas sin reentrenamiento.
- No hay versiones cuantizadas ni soporte documentado en runtimes de inferencia de alto rendimiento (vLLM, TGI), lo que limita su integracion en infraestructuras ya estandarizadas.
- Riesgo de sobreajuste al vocabulario y al dominio del TalkMoves Dataset (matematicas de secundaria, contexto estadounidense); el rendimiento fuera de ese dominio es desconocido.
- El repositorio no tiene descargas ni likes, por lo que no existe validacion independiente de los resultados declarados (`verified: false`).
- La fecha de creacion registrada (2026-10-12) procede de los metadatos del repositorio y debe tratarse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_proposes_a_problem_solving_strategy
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio original): https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit`: mencionado en la model card, URL no disponible
- Paper de EduBehaviors: no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponible en la informacion proporcionada
- Resultados adicionales de busqueda web: la busqueda no devolvio ninguna fuente tecnica relevante sobre este modelo
