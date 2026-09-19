# StanfordSCALE/assertion_sentence_has_fraction_terms

## Resumen

Este modelo es un clasificador binario de texto especializado en un unico fenomeno del discurso de aula: determinar si un enunciado docente contiene terminos de fracciones. Lo desarrolla la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*, y se distribuye bajo el identificador `StanfordSCALE/assertion_sentence_has_fraction_terms`. No es un modelo generativo ni un modelo de proposito general: es un componente de anotacion dentro de un pipeline de codificacion de dialogo educativo, usable a traves del paquete Python `EduBehaviors-kit`.

Tecnicamente se trata de un clasificador SetFit: el cuerpo es el sentence transformer `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet, encoder bidireccional) y la cabeza es una regresion logistica. El conjunto de pesos en safetensors suma 109.486.464 parametros, practicamente todos correspondientes al encoder MPNet. Se entreno sobre un subconjunto anotado por LLM del TalkMoves Dataset, con enunciados de docentes, y la etiqueta se genera a partir del texto del enunciado sin contexto adicional.

Su relevancia es acotada pero concreta: permite auditar y medir automaticamente, a escala, una dimension especifica de la practica docente en clases de matematicas, con un F1 de 0,868 y un ROC-AUC de 0,964 en el split de test. Es util como pieza de investigacion reproducible en analitica de aprendizaje, no como modelo de produccion generalista. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y los resultados publicados no estan verificados por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) mas cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | text-classification (clasificacion binaria) |
| Etiquetas de salida | `assertion_sentence_has_fraction_terms`, `split_sentence_has_fraction_terms` |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Libreria | setfit |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit, pensado para clasificacion de texto con pocos datos etiquetados. La primera fase es contrastiva: se ajusta el encoder MPNet con un learning rate de 2e-05, batch size de 16 y un maximo de 5000 pasos. La segunda fase entrena la cabeza de regresion logistica sobre los embeddings resultantes, con learning rate de 0,01 y batch size de 32. En total se ejecutan 10 epocas, con 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU. El cuerpo base es un transformer bidireccional (MPNet) que produce un unico embedding por enunciado; no hay atencion causal ni generacion de tokens.

Los datos de entrenamiento proceden de `StanfordSCALE/assertions_llm_annotated_talkmoves`: 3.430 ejemplos de entrenamiento (53,3%), 860 de desarrollo (13,4%) y 2.144 de test (33,3%). Las etiquetas no las produjeron anotadores humanos, sino anotadores LLM, con un acuerdo entre anotadores de alfa de Krippendorff de 0,876 para esta asercion concreta. La tasa base de la clase positiva es del 9,9% global (9,4% en train, 8,5% en dev, 11,1% en test), lo que convierte el problema en claramente desbalanceado. El texto de entrada se construye directamente con el enunciado, sin plantilla ni contexto: `{utterance}`.

## Capacidades

- Clasificacion binaria de enunciados: indica si un enunciado contiene terminos de fracciones mediante `predict`, y devuelve probabilidades calibradas con `predict_proba`.
- Salida adicional `split_sentence_has_fraction_terms`, orientada a la segmentacion de enunciados en el esquema de anotacion EduBehaviors.
- Integracion directa con la libreria `setfit` y, por extension, con el ecosistema `sentence-transformers` para extraer embeddings de los enunciados.
- Uso como componente dentro del paquete `EduBehaviors-kit` para codificacion auditable de discurso de aula.
- Procesamiento por lotes de listas de enunciados, apto para anotar corpus completos de transcripciones.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible; el modelo no genera texto.
- Capacidades multilingues: no; esta entrenado y evaluado unicamente en ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Analitica de discurso de aula a escala: procesar transcripciones completas de clases de matematicas y marcar automaticamente que enunciados del docente introducen terminos de fracciones, para medir la cobertura curricular real frente a la planificada.
- Investigacion en educacion matematica: cuantificar la frecuencia y la distribucion de menciones a fracciones en un corpus de clases, sustituyendo parte del etiquetado manual por un clasificador con F1 de 0,868 y ROC-AUC de 0,964.
- Formacion docente y retroalimentacion: generar informes que muestren al profesor en que momentos de la sesion aparecen los terminos de fracciones y en cuales no, como evidencia objetiva para revisiones posteriores.
- Filtrado y enriquecimiento de datasets: prefiltrar enunciados docentes antes de un etiquetado humano mas costoso, reduciendo el volumen a revisar y priorizando los casos con probabilidad cercana al umbral de decision.
- Auditoria de pipelines de anotacion por LLM: al estar entrenado sobre etiquetas de anotadores LLM con alfa de Krippendorff de 0,876, sirve como segunda opinion automatica para detectar discrepancias en anotaciones previas.
- Construccion de dashboards de fidelidad curricular: alimentar cuadros de mando institucionales que comparen el tratamiento de fracciones entre cursos, asignaturas o distritos a partir de transcripciones estandarizadas.
- Recuperacion de material didactico: usar los embeddings del encoder MPNet subyacente para buscar fragmentos de clase que traten fracciones, con la clasificacion como filtro fino.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card. No estan verificados por terceros (`verified: false`).

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 860 | 8,5% | 0,800 | 0,877 | 0,837 | 0,939 | 0,858 |
| test | 2.144 | 11,1% | 0,851 | 0,887 | 0,868 | 0,964 | 0,899 |

Conjunto de evaluacion: `StanfordSCALE/assertions_llm_annotated_talkmoves`.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,44 GB solo de pesos (109,5 M de parametros), mas activaciones; cabe holgadamente en cualquier GPU con 2 GB o mas.
- VRAM estimada en fp16: aproximadamente 0,22 GB de pesos; en int8, alrededor de 0,11 GB.
- Cabe en GPU de consumo: si, en practicamente cualquier modelo, incluidas GTX 1650, RTX 3060, RTX 4090 y graficas integradas con suficiente memoria compartida.
- Inferencia en CPU: viable, dado el tamano del encoder y que el clasificador no es autorregresivo.
- GPUs recomendadas para lotes grandes: A100, H100 o L4 para throughput alto sobre corpus extensos; en la practica, cualquier GPU moderna acelera el proceso sin ser un cuello de botella.
- Opciones de despliegue: libreria `setfit` (via `SetFitModel.from_pretrained`), `sentence-transformers` como encoder, y exportacion a ONNX si se necesita servir sin Python. No hay soporte en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles; no se publican mediciones en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados con la misma tarea y el mismo esquema de anotacion en la informacion proporcionada.

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `StanfordSCALE/assertion_sentence_has_fraction_terms` | Clasificador SetFit (MPNet + regresion logistica) | 109.486.464 | no disponible | no disponible | HuggingFace, 0 descargas |
| `sentence-transformers/paraphrase-mpnet-base-v2` | Encoder de frases sin cabeza de clasificacion | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace (modelo base publico) |
| Otros clasificadores de comportamiento docente con el mismo esquema EduBehaviors | Clasificador SetFit | no disponible | no disponible | no disponible | no disponible |
| Clasificacion zero-shot o few-shot con un LLM generativo | Modelo generativo | no disponible | no disponible | depende del LLM | no disponible |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento las generaron anotadores LLM, no codificadores humanos; el modelo aprende y reproduce ese criterio de anotacion, con un alfa de Krippendorff de 0,876 entre anotadores.
- El modelo se entreno unicamente con enunciados de docentes. Su comportamiento sobre habla de estudiantes no se ha probado y no deberia asumirse.
- Cobertura limitada al ingles: no hay soporte ni evaluacion en otros idiomas.
- Tarea muy estrecha: solo detecta la presencia de terminos de fracciones en un enunciado. No mide calidad pedagogica, correccion matematica ni comprension del alumnado.
- Tasa base baja de la clase positiva (9,9% global, 11,1% en test), lo que exige ajustar el umbral de decision segun el coste relativo de falsos positivos y falsos negativos en cada aplicacion.
- Sin datos de contexto: la entrada es el enunciado aislado, por lo que el modelo no puede resolver referencias implicitas que dependan de turnos anteriores de la conversacion.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de clasificacion erronea en enunciados ambiguos o con vocabulario matematico solapado (por ejemplo, "parte", "division" o "fraccion" usados en sentido no matematico).
- Licencia no disponible: no puede confirmarse la autorizacion para uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- Los resultados publicados estan marcados como no verificados, y el modelo registra 0 descargas y 0 likes, por lo que carece de validacion independiente por parte de la comunidad.
- La fecha de creacion del repositorio (2026-09-18) y la fecha de entrenamiento deben tenerse en cuenta al citar la version utilizada.
- No se han publicado mediciones de latencia, throughput ni consumo de memoria en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_has_fraction_terms
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- TalkMoves Dataset (repositorio original de las transcripciones): https://github.com/SumnerLab/TalkMoves
- Paquete Python `EduBehaviors-kit`: mencionado en la model card, sin URL publica en la informacion disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a guias sobre creacion de empresas en el Reino Unido y no guardan relacion con esta ficha.
