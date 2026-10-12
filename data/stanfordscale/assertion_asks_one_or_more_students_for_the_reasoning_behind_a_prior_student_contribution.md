# StanfordSCALE/assertion_asks_one_or_more_students_for_the_reasoning_behind_a_prior_student_contribution

## Resumen

El modelo `StanfordSCALE/assertion_asks_one_or_more_students_for_the_reasoning_behind_a_prior_student_contribution` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para el codigo auditable de discurso en el aula. La tarea concreta que resuelve es detectar si una intervencion de un docente pide a uno o varios estudiantes que expliquen el razonamiento que hay detras de una contribucion previa de otro estudiante. No genera texto ni razona: emite una etiqueta binaria (la asercion se cumple o no) junto con una probabilidad, a partir de una unica linea de texto.

Tecnicamente es un modelo SetFit: un encoder de frases MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) afinado con aprendizaje contrastivo y una cabeza de regresion logistica entrenada sobre las representaciones resultantes. El artefacto publicado contiene 109.486.464 parametros en safetensors y ocupa 0,4 GB en el repositorio. El entrenamiento se hizo sobre un subconjunto anotado por LLM del TalkMoves Dataset, con 13.179 ejemplos de entrenamiento, 3.297 de desarrollo y 8.239 de prueba.

Su relevancia es acotada pero especifica: cubre una necesidad real en investigacion educativa, que es codificar automaticamente turnos de habla docente a escala sin depender de anotadores humanos para cada asercion. Es un modelo muy pequeno, ejecutable en CPU, pero con una tasa base extremadamente baja (1,4 % de ejemplos positivos) y una calidad moderada en la clase positiva (F1 de 0,545 en test), por lo que funciona mejor como componente de un pipeline con revision humana que como sistema autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) + cabeza de clasificacion `LogisticRegression`, entrenado con SetFit |
| Parametros totales | 109.486.464 (segun los pesos safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no indicada en la model card; el encoder mpnet-base admite hasta 512 tokens |
| Tipos de cuantizacion | no disponible (no se publican artefactos cuantizados) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 0,4 GB); artefacto SetFit con cuerpo y cabeza |
| Tarea principal | clasificacion binaria de texto (text-classification) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves (derivado de TalkMoves) |
| Libreria | setfit |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el metodo SetFit en dos fases. Primero se afina el encoder de frases MPNet con un objetivo contrastivo (learning rate 2e-05, batch size 16, hasta 5.000 pasos maximos, 10 epocas, precision mixta activada en GPU) para que las representaciones separen los turnos que cumplen la asercion de los que no. Despues se entrena una cabeza de regresion logistica (learning rate 0,01, batch size 32) sobre los embeddings congelados. La semilla empleada fue 20260904. El unico texto de entrada es la intervencion docente tal cual, sin plantilla ni contexto adicional: `{utterance}`.

Los datos proceden del TalkMoves Dataset, un corpus de discurso de aula, reanotado por anotadores LLM para el conjunto de aserciones de EduBehaviors. El reparto es de 13.179 filas de entrenamiento (53,3 %), 3.297 de desarrollo (13,3 %) y 8.239 de prueba (33,3 %). La tasa base de la clase positiva es del 1,4 % global (1,5 % en train, 1,3 % en dev, 1,4 % en test), es decir, un problema fuertemente desbalanceado. La concordancia entre anotadores LLM medida con alfa de Krippendorff es de 0,780. No se documenta uso de RLHF ni DPO, algo coherente con un clasificador discriminativo de este tamano. La innovacion tecnica relevante no esta en el modelo en si, sino en el esquema: cada asercion del marco se entrena como un clasificador independiente y auditable, consumible desde el paquete Python `EduBehaviors-kit`.

## Capacidades

- Clasificacion binaria de una unica intervencion docente: devuelve 1 cuando la asercion "pide a uno o mas estudiantes el razonamiento detras de una contribucion previa" se cumple.
- Salida probabilistica mediante `predict_proba`, util para umbralizar y priorizar revision humana.
- Codificacion automatica de turnos de habla en ingles dentro del marco EduBehaviors (conjunto de aserciones "top-down", identificador `td__the_utterance_asks_one_or_more_students_for_the_reasoning_behind_a_prior_student_contribution`).
- Integracion con `sentence-transformers` y `setfit`, lo que permite reutilizar el encoder para otras tareas o combinarlo con otras cabezas.
- Entrada de una sola linea de texto; no acepta contexto conversacional multiple ni historial estructurado.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, capacidades de agente, vision, audio ni capacidades multilingues.

## Casos de uso

- Investigacion sobre discurso en el aula: codificar automaticamente miles de turnos docentes del corpus TalkMoves para medir con que frecuencia se pide justificacion del razonamiento ajeno, sin depender de codificacion manual. El modelo esta entrenado exactamente sobre ese dominio.
- Preetiquetado de nuevos corpus educativos: usar `predict_proba` para marcar candidatos con alta probabilidad y enviar solo los casos dudosos a anotadores humanos, reduciendo el coste de anotacion de una clase que aparece en el 1,4 % de los turnos.
- Formacion docente y coaching instruccional: analizar grabaciones transcritas de clases y generar informes sobre el uso de practicas de elicitacion de razonamiento, como senal cuantitativa para sesiones de desarrollo profesional.
- Paneles de calidad del dialogo en plataformas de aprendizaje: monitorizar en tiempo casi real si las interacciones de un docente fomentan la explicacion de razonamiento entre estudiantes.
- Filtrado y muestreo en ciencia de datos educativa: seleccionar subconjuntos de transcripciones que contienen este comportamiento para estudios cualitativos, en lugar de revisar el corpus completo.
- Analisis comparativo entre cohortes o asignaturas: aplicar el clasificador a transcripciones de distintos cursos y comparar la prevalencia del comportamiento, teniendo en cuenta el sesgo del modelo en la clase positiva.
- Evaluacion de modelos LLM como docentes o tutores: usar el clasificador como metrica automatica de si una respuesta generada pide al estudiante que justifique el razonamiento de una contribucion previa.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente). Metrica sobre la clase positiva salvo donde se indique.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.297 | 1,3 % | 0,588 | 0,455 | 0,513 | 0,849 | 0,377 |
| test | 8.239 | 1,4 % | 0,571 | 0,522 | 0,545 | 0,878 | 0,441 |

El contraste entre el ROC-AUC (0,878 en test) y la average precision (0,441) es indicativo del desbalance extremo: el modelo ordena razonablemente bien, pero el rendimiento a umbral fijo en la clase positiva es moderado.

## Requisitos de hardware

- VRAM estimada: en torno a 0,5 GB en fp32 y 0,3 GB en fp16 para los 109,5 M de parametros, mas el coste de activaciones de un encoder de este tamano. Cifras estimadas a partir del numero de parametros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, T4). Para lots grandes en produccion, una T4, L4 o A10 resultan mas que suficientes.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU para inferencia por lotes de tamano moderado.
- Opciones de despliegue: `setfit` y `sentence-transformers` en Python (via de referencia), exportacion a ONNX o TorchScript para servir sin dependencias de entrenamiento, y contenedores de inferencia genericos. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo generativo.
- Latencia y throughput: no disponible. No se publican mediciones, y el modelo no incluye configuracion optimizada (por ejemplo, cuantizacion) para despliegue de alto rendimiento.

## Comparativa con modelos similares

No hay benchmarks comparables publicados entre estos modelos: las cifras de cada uno dependen de su propio conjunto de datos y tarea, por lo que la columna de rendimiento se deja como no disponible salvo para el modelo de esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este modelo (asercion de razonamiento, StanfordSCALE) | 109,5 M | 512 tokens (encoder) | no disponible | HuggingFace, 0 descargas, 0 likes | F1 0,545 y ROC-AUC 0,878 en test (declarado por el autor) |
| sentence-transformers/all-MiniLM-L6-v2 con cabeza SetFit | 22,7 M | 256 tokens | Apache-2.0 | HuggingFace, ampliamente usado | no disponible |
| distilbert-base-uncased ajustado para clasificacion | 66 M | 512 tokens | Apache-2.0 | HuggingFace, ampliamente usado | no disponible |
| Otros clasificadores de aserciones de StanfordSCALE (EduBehaviors) | no disponible | no disponible | no disponible | HuggingFace | no disponible |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de anotadores LLM, no de codificadores humanos. La concordancia medida con alfa de Krippendorff es de 0,780, lo que implica un techo de calidad inherente a las etiquetas: el modelo aprende, como maximo, el criterio del anotador automatico.
- El modelo se entreno unicamente con intervenciones de docentes. Su comportamiento sobre habla de estudiantes no ha sido probado.
- Desbalance extremo: la clase positiva representa el 1,4 % de los ejemplos, con una average precision de 0,441 en test. Un umbral bajo genera muchos falsos positivos en terminos absolutos, y un umbral alto reduce el recall.
- Solo ingles. No hay soporte ni evaluacion en castellano ni en otras lenguas, algo critico si se pretende aplicar a transcripciones en espanol.
- Licencia no disponible: al no declararse una licencia explicita, no puede asumirse permiso de uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- Sin validacion externa: cero descargas y cero likes en el momento de la consulta, y metricas marcadas como no verificadas en el model-index.
- Datos de ambito educativo: las transcripciones de aula pueden contener informacion identificativa de menores, por lo que su tratamiento exige cumplir la normativa aplicable de proteccion de datos (por ejemplo, FERPA en Estados Unidos o RGPD en la Union Europea).
- Ambito de aplicacion muy estrecho: es un clasificador de una unica asercion, con el identificador completo en el nombre del repositorio. No debe reutilizarse como clasificador generico de intencion docente.
- No apto como sistema autonomo de evaluacion docente: sus errores en la clase positiva (precision 0,571 y recall 0,522) desaconsejan cualquier uso con consecuencias sobre personas sin revision humana.
- No se documentan sesgos demograficos, linguisticos ni de variedad dialectal del ingles evaluados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_asks_one_or_more_students_for_the_reasoning_behind_a_prior_student_contribution
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio GitHub): https://github.com/SumnerLab/TalkMoves
- Citacion indicada en la model card: Stanford SCALE Initiative, "Assertion classifier: the utterance asks one or more students for the reasoning behind a prior student contribution", 2026
- Paquete Python mencionado en la model card: `EduBehaviors-kit` (no se proporciona URL en la informacion disponible)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a sitios de comercio de ropa y no guardan relacion con el modelo).
