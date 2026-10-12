# StanfordSCALE/assertion_asks_one_or_more_students_for_the_next_step_in_a_procedure

## Resumen

`StanfordSCALE/assertion_asks_one_or_more_students_for_the_next_step_in_a_procedure` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea es determinar si un enunciado de un docente pide a uno o varios estudiantes que realicen el siguiente paso de un procedimiento. El identificador interno de la aserción es `td__the_utterance_asks_one_or_more_students_for_the_next_step_in_a_procedure`, dentro del conjunto de aserciones top-down `td`.

Tecnicamente es un modelo SetFit: un encoder de frases MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) afinado de forma contrastiva y rematado con una cabeza de regresión logística, con 109.486.464 parámetros en total y un repositorio de 0,4 GB. No es un modelo generativo: produce una etiqueta binaria y una probabilidad. Está entrenado exclusivamente sobre enunciados de profesor en inglés (en), extraidos de una anotacion automatica con LLM de un subconjunto del TalkMoves Dataset.

Su relevancia es acotada pero clara para la investigación educativa: permite codificar a escala movimientos conversacionales docentes que normalmente requieren anotacion humana, con un ROC-AUC de 0,896 en test pese a una tasa base positiva de solo el 2,1%. Se integra mediante la libreria `setfit` y el paquete `EduBehaviors-kit`, y publica cero descargas y cero likes en el momento de redactar esta ficha. La licencia no está declarada, lo que limita su uso comercial sin aclaracion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder transformer bidireccional MPNet (12 capas, 768 de dimension oculta) + cabeza de regresion logistica |
| Parametros totales | 109.486.464 (aproximadamente 109,5 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el encoder MPNet subyacente admite hasta 512 tokens |
| Tipos de cuantizacion | no disponible; el modelo se distribuye en safetensors a precision completa |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `setfit`); repositorio de 0,4 GB |
| Tarea (pipeline) | text-classification (clasificacion binaria) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Autor | Stanford SCALE Initiative |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema SetFit en dos fases. En la primera se afina el cuerpo del encoder (`paraphrase-mpnet-base-v2`, un MPNet de 12 capas) de forma contrastiva sobre pares de frases generados a partir del conjunto de entrenamiento, con learning rate de 2e-05, batch size de 16 y un maximo de 5.000 pasos. En la segunda se congela el cuerpo y se entrena una cabeza de regresion logistica con learning rate de 0,01 y batch size de 32, durante 10 epocas, con evaluacion cada 100 pasos, semilla 20260904 y precision mixta activada en GPU. La entrada es el enunciado tal cual, sin plantilla ni prefijo: `{utterance}`.

Los datos proceden de `StanfordSCALE/assertions_llm_annotated_talkmoves`, un subconjunto de enunciados de profesor del TalkMoves Dataset anotados automaticamente por LLM: 13.182 ejemplos de entrenamiento (53,3%), 3.294 de desarrollo (13,3%) y 8.239 de test (33,3%). La tasa base de la clase positiva es muy baja (2,0% global; 2,0% en train, 1,9% en dev, 2,1% en test), lo que convierte el problema en un caso claro de clasificacion con desbalance extremo. La concordancia entre anotadores para esta asercion es un alfa de Krippendorff de 0,607. No se documenta RLHF, DPO ni ninguna innovacion de decodificacion, ya que no hay generacion de texto.

## Capacidades

- Clasificacion binaria de enunciados de docente: devuelve 1 cuando el enunciado pide a uno o varios estudiantes el siguiente paso de un procedimiento.
- Salida probabilistica mediante `predict_proba`, con dos valores (P(no), P(si)) utiles para fijar umbrales distintos de 0,5.
- Codificacion por lotes: `model.predict([...])` acepta listas de textos, lo que permite procesar transcripciones completas.
- Reutilizacion del cuerpo MPNet como generador de embeddings de frases para similitud semantica, si se accede al encoder subyacente.
- Integracion con el paquete Python `EduBehaviors-kit` para pipelines de codificacion de dialogo educativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un clasificador de una sola pasada.
- No es multilingue: unicamente entrenado y evaluado en ingles.
- No dispone de modo de razonamiento (*thinking mode*), vision, audio ni generacion de texto.

## Casos de uso

- Anotacion automatica de corpus de aula a escala: el modelo puede etiquetar transcripciones completas de clases y reducir el volumen que los codificadores humanos deben revisar, apoyandose en su ROC-AUC de 0,896 para priorizar la cola de revision.
- Investigacion sobre andamiaje y transferencia de responsabilidad cognitiva: la deteccion de peticiones del siguiente paso de un procedimiento es un indicador operativo de este constructo, y el clasificador permite medirlo de forma consistente en cientos de sesiones.
- Evaluacion de la calidad de la anotacion con LLM: dado que el propio dataset se genero con anotadores LLM, este clasificador sirve como referencia destilada para medir la estabilidad de esas anotaciones (alfa de Krippendorff 0,607) en subconjuntos independientes.
- Retroalimentacion docente asistida: marcando en una transcripcion los turnos en los que el profesor explicitamente delega el siguiente paso, un formador puede revisar rapidamente el patron de instruccion sin leer la sesion entera.
- Analitica de aprendizaje (*learning analytics*): alimentar cuadros de mando que agreguen la frecuencia de este comportamiento por sesion, asignatura o docente, mediante inferencia por lotes sobre los registros ya almacenados.
- Prefiltrado para pipelines de anotacion humana activa: con una tasa base del 2,1%, enviar a revision solo los enunciados con probabilidad alta reduce el coste de anotacion en mas de un orden de magnitud, a cambio de controlar el recall.
- Analisis comparativo de discurso entre aulas o entre condiciones experimentales: el clasificador aporta una medida binaria reproducible y barata de computo, adecuada para estudios con muchas unidades de observacion.
- Despliegue en CPU dentro de entornos escolares o de investigacion sin GPU: con 109,5 M de parametros, la inferencia puede ejecutarse en el propio portatil del investigador.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (metrica no verificada de forma independiente) sobre el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`:

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.294 | 1,9% | 0,471 | 0,393 | 0,429 | 0,901 | 0,464 |
| test | 8.239 | 2,1% | 0,593 | 0,468 | 0,523 | 0,896 | 0,549 |

Los cuatro valores del `model-index` coinciden con la fila de test: F1 0,5229, precision 0,5926, recall 0,4678 y ROC-AUC 0,896. No se han publicado en la informacion disponible comparaciones con modelos alternativos sobre este mismo conjunto.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 438 MB en fp32 (109,5 M x 4 bytes) y unos 219 MB en fp16.
- VRAM estimada para inferencia: por debajo de 2 GB en fp32 con lotes pequenos, incluyendo activaciones; no se publican medidas exactas.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; modelos como RTX 3060, RTX 4090, A100 o H100 estan muy sobredimensionados para esta carga.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Inferencia en CPU: viable y probablemente suficiente para uso por lotes, dado el tamano del encoder.
- Opciones de despliegue: `setfit` y `transformers` (referencia), exportacion a ONNX Runtime o TorchScript para produccion, y uso del encoder via `sentence-transformers`. No aplican vLLM, TGI, Ollama ni llama.cpp, porque el modelo no es generativo y combina un encoder con una cabeza de regresion logistica de scikit-learn.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado resultados comparativos en la informacion disponible. La tabla siguiente recoge la comparacion cualitativa con alternativas de la misma categoria, marcando como "no disponible" todo dato del que no se dispone:

| Modelo | Parametros | Contexto | F1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SetFit + MPNet, asercion `td`) | 109,5 M | no disponible (MPNet admite hasta 512 tokens) | 0,5229 | no disponible | HuggingFace, 0 descargas |
| Otros clasificadores de aserciones de StanfordSCALE | no disponible | no disponible | no disponible | no disponible | familia publicada por el mismo autor |
| Fine-tuning supervisado completo de MPNet o BERT-base | aproximadamente 110 M | no disponible | no disponible | la del modelo base | generico, requiere entrenamiento propio |
| Clasificacion zero-shot con LLM generativo | no disponible | no disponible | no disponible | segun proveedor | ampliamente disponible, mayor coste por inferencia |

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos, con un alfa de Krippendorff de 0,607, lo que indica una concordancia solo moderada.
- El modelo se entreno unicamente con enunciados de profesor; se desconoce su comportamiento con habla de estudiantes.
- Desbalance extremo de clases (2,1% de positivos en test): la precision de 0,593 y el recall de 0,468 implican numerosos falsos positivos y falsos negativos con el umbral por defecto. El *average precision* de 0,549 sugiere que conviene calibrar el umbral segun el coste relativo de cada error.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificaciones espurias sobre enunciados ambiguos o fuera de dominio.
- Modelo monolingue en ingles: no se ha validado en castellano ni en ningun otro idioma.
- La licencia no está declarada, por lo que no puede asumirse permiso para uso comercial ni redistribucion; es necesario contactar con el autor antes de integrarlo en un producto.
- Sin verificacion independiente: las metricas declaradas estan marcadas como no verificadas en el `model-index`.
- Sin traccion en la comunidad (0 descargas, 0 likes) y con fecha de creacion y actualizacion de 2026, lo que reduce la evidencia de uso real en produccion.
- Rendimiento dependiente del dominio: el entrenamiento se limita a discourse de aula del TalkMoves Dataset; otros contextos conversacionales pueden degradar fuertemente el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_asks_one_or_more_students_for_the_next_step_in_a_procedure
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (SumnerLab): https://github.com/SumnerLab/TalkMoves
- Paquete Python `EduBehaviors-kit`: mencionado en la model card, sin URL publicada en la informacion disponible
- Busqueda web: no se han encontrado enlaces tecnicos relevantes sobre este modelo; los resultados devueltos no guardan relacion con el contenido de la ficha
