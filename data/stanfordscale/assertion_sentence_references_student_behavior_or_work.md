# StanfordSCALE/assertion_sentence_references_student_behavior_or_work

## Resumen

El modelo `StanfordSCALE/assertion_sentence_references_student_behavior_or_work` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea es determinar si un enunciado de un docente (una unica intervencion, sin contexto conversacional adicional) contiene una referencia al comportamiento o al trabajo del alumnado. Se distribuye a traves de HuggingFace y se consume con la libreria `setfit`, ademas de integrarse en el paquete Python `EduBehaviors-kit`.

Tecnicamente no es un modelo generativo, sino un clasificador SetFit construido sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet) con 109.486.464 parametros totales y una cabeza de regresion logistica. Se entreno sobre un subconjunto del TalkMoves Dataset anotado automaticamente por LLM, con 3.430 ejemplos de entrenamiento, 860 de desarrollo y 2.144 de test, y esta limitado al ingles.

Su relevancia es acotada pero clara: ofrece una pieza reutilizable para etiquetar discurso de aula a escala y para auditar esquemas de codificacion de dialogo. Ahora bien, la propia model card advierte de que el acuerdo entre anotadores es pobre (alfa de Krippendorff de 0,382) y de que las etiquetas proceden de LLM, no de codificadores humanos, por lo que el modelo debe tratarse como herramienta de preetiquetado o exploracion, no como fuente de verdad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (transformer encoder) como cuerpo, con cabeza de regresion logistica (SetFit) |
| Parametros totales | 109.486.464 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion facilitada; el encoder base MPNet admite secuencias de hasta 512 tokens y la entrada entrenada es un unico enunciado (`{utterance}`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `setfit`) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Tarea (pipeline) | text-classification (clasificacion binaria) |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Tamano del repositorio | 0,4 GB |
| Columnas de salida | `assertion_sentence_references_student_behavior_or_work`, `split_sentence_references_student_behavior_or_work` |
| Fecha de creacion (HF) | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit (Sentence Transformer Fine-Tuning): en una primera fase se afina contrastivamente el encoder `paraphrase-mpnet-base-v2` para producir representaciones de frase discriminativas y, en una segunda fase, se entrena una cabeza de regresion logistica sobre esas representaciones. Los hiperparametros declarados son: learning rate del cuerpo de 2e-05, learning rate de la cabeza de 0,01, batch size de 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, un maximo de 5.000 pasos en la fase contrastiva, 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU.

Los datos proceden de un subconjunto anotado por LLM de intervenciones de docentes del TalkMoves Dataset: 3.430 filas de entrenamiento (53,3 %), 860 de desarrollo (13,4 %) y 2.144 de test (33,3 %). La tasa base de la clase positiva es del 33,5 % global (32,8 % en train, 33,5 % en dev y 34,7 % en test), lo que indica un problema desbalanceado. El acuerdo entre anotadores para esta asercion es de 0,382 segun el alfa de Krippendorff, un valor que la propia model card califica de pobre. La entrada se construye unicamente con el enunciado, sin historial de dialogo ni metadatos del aula, de modo que no hay innovaciones de atencion, decodificacion especulativa ni mecanismos de razonamiento multi-paso.

## Capacidades

- Clasificacion binaria de un unico enunciado de docente: devuelve 1 cuando la asercion "el enunciado referencia el comportamiento o el trabajo del alumnado" se cumple y 0 en caso contrario.
- Salida probabilistica mediante `predict_proba`, lo que permite fijar umbrales distintos segun el coste relativo de falsos positivos y falsos negativos.
- Extraccion de embeddings de frase a traves del cuerpo SetFit, reutilizables para agrupamiento, busqueda semantica o aprendizaje activo dentro del mismo dominio educativo.
- Codificacion de aserciones para el esquema EduBehaviors, consumible desde el paquete Python `EduBehaviors-kit`.
- Integracion sencilla en pipelines de Python mediante `pip install setfit` y `SetFitModel.from_pretrained`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling, ni comportamiento agentico o razonamiento multi-paso.
- Capacidad multilingue nula: entrenado y evaluado solo en ingles.

## Casos de uso

- Etiquetado a escala de corpus de transcripciones de aula: procesar miles de intervenciones docentes del TalkMoves Dataset o de corpus propios para medir con que frecuencia el profesor referencia el trabajo del alumnado, algo inviable con codificacion manual.
- Preetiquetado para anotacion humana: usar `predict_proba` para ordenar los enunciados por incertidumbre y enviar solo la franja dudosa a codificadores humanos, reduciendo el coste de anotacion.
- Auditoria de esquemas de codificacion de dialogo: dado que el modelo forma parte de EduBehaviors, sirve para comprobar la consistencia interna de un esquema de aserciones antes de desplegarlo sobre un corpus nuevo.
- Investigacion educativa cuantitativa: construir variables derivadas (proporcion de enunciados que apelan al comportamiento del alumno) y correlacionarlas con otras metricas de la sesion, siempre con la advertencia sobre la fiabilidad de las etiquetas.
- Control de calidad de anotaciones generadas por LLM: comparar las predicciones del clasificador con las etiquetas de otro anotador automatico para detectar desacuerdos sistematicos en un subconjunto de datos.
- Filtrado previo en plataformas de observacion docente: descartar rapidamente los enunciados irrelevantes de una grabacion transcrita antes de aplicar analisis mas caros, dado que el modelo es pequeno y puede ejecutarse en CPU.
- Deteccion en tiempo casi real en herramientas de formacion docente: al tener unos 109 millones de parametros, permite puntuar cada intervencion al vuelo durante una sesion o una revision posterior sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados, `verified: false`):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 860 | 33,5 % | 0,667 | 0,681 | 0,674 | 0,839 | 0,741 |
| test | 2.144 | 34,7 % | 0,678 | 0,666 | 0,672 | 0,837 | 0,765 |

Metricas de test segun el model-index: F1 de 0,6721, precision de 0,6781, recall de 0,6662 y ROC-AUC de 0,8373. No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en tareas generativas, ya que el modelo no cubre esas capacidades.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 0,44 GB solo para los pesos (109,5 millones de parametros), mas el consumo de activaciones, que es minimo al procesar un unico enunciado por inferencia.
- VRAM estimada en FP16: aproximadamente 0,22 GB de pesos.
- Inferencia en CPU perfectamente viable: es un encoder de unos 110 millones de parametros, adecuado para procesamiento por lotes en servidores sin GPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer (RTX 3060, RTX 4090) sobra para el modelo. En centro de datos, una A100 o H100 estarian totalmente infrautilizadas salvo que se ejecuten lotes masivos en paralelo.
- Cabe sin problema en GPU consumer y en equipos de desarrollo con poca memoria, e incluso en entornos con CPU y 2 GB de RAM.
- Opciones de despliegue: libreria `setfit` (via `SetFitModel.from_pretrained`), exportacion a ONNX, y servidores de modelos compatibles con transformers. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI, que estan orientadas a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado comparativas con otros clasificadores de la misma categoria en la informacion disponible. La unica referencia directa es el encoder base sobre el que se construye:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_sentence_references_student_behavior_or_work | 109.486.464 | no disponible (encoder MPNet, hasta 512 tokens) | Clasificacion binaria de aserciones docentes | no disponible | HuggingFace (0 descargas, 0 likes) |
| sentence-transformers/paraphrase-mpnet-base-v2 | misma base MPNet (no se especifica el conteo exacto en la informacion facilitada) | 512 tokens (caracteristica del encoder MPNet) | Embeddings de frase, sin cabeza de clasificacion | no disponible en la informacion facilitada | HuggingFace |
| Otros clasificadores supervisados de discurso educativo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos. La model card indica explicitamente que las predicciones y los datos subyacentes no son fiables.
- El acuerdo entre anotadores es pobre: alfa de Krippendorff de 0,382 para esta asercion.
- Rendimiento moderado: F1 de 0,672 y precision de 0,678 en test sobre una tasa base del 34,7 %, lo que deja margen amplio de error en ambos sentidos.
- Entrenado solo con intervenciones de docentes; el comportamiento sobre habla de estudiantes no se ha probado.
- Idioma limitado al ingles; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- La entrada es un unico enunciado sin contexto de dialogo, por lo que el modelo no puede resolver referencias que dependan de turnos anteriores.
- Licencia no disponible: no puede confirmarse que el uso comercial este permitido, lo que supone un riesgo legal en produccion.
- Modelo sin validacion externa: 0 descargas y 0 likes en el momento de la consulta y metricas marcadas como no verificadas.
- Riesgo alto de falsos positivos y falsos negativos en un dominio con anotacion ambigua; no debe usarse para decisiones que afecten a evaluaciones docentes sin revision humana.
- No es un modelo generativo: no hay riesgo de alucinacion de texto, pero si de clasificaciones incorrectas presentadas con una probabilidad aparentemente calibrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_references_student_behavior_or_work
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Paquete Python `EduBehaviors-kit`: mencionado en la model card, sin URL publica en la informacion disponible.
- Busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a direcciones de la calle Novokuznetskaya en Moscu y no guardan ninguna relacion con el modelo.
