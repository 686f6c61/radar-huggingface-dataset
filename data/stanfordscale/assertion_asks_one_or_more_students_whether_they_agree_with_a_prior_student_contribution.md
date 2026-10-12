# StanfordSCALE/assertion_asks_one_or_more_students_whether_they_agree_with_a_prior_student_contribution

## Resumen

Este modelo es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative para la deteccion automatica de un unico comportamiento discursivo en el aula: determinar si una intervencion docente pide a uno o varios estudiantes que se posicionen sobre la contribucion previa de otro estudiante. No es un modelo generativo ni un LLM, sino un clasificador SetFit construido sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2`, con una cabeza de regresion logistica, y forma parte de la iniciativa EduBehaviors: esquemas basados en aserciones para la codificacion auditable de dialogo educativo.

El modelo resuelve un problema muy concreto de la investigacion educativa: la codificacion manual de turnos de habla en aulas es lenta, cara y dificil de escalar. Con 109.486.464 parametros en el cuerpo transformer, etiquetado de una sola asercion y un consumo de recursos minimo (0,4 GB de repositorio), permite procesar lotes grandes de transcripciones a bajo coste y de forma auditable, ya que cada clasificador cubre una asercion explicita y verificable en lugar de una taxonomia opaca.

Es relevante ahora porque forma parte de un ecosistema mas amplio de clasificadores de aserciones que se pueden encadenar mediante el paquete `EduBehaviors-kit`, entrenados sobre un subconjunto anotado por LLM del TalkMoves Dataset. Su rendimiento declarado (F1 de 0,6275 en la clase positiva sobre el split de test, ROC-AUC de 0,8826) es modesto en terminos absolutos, pero debe interpretarse sobre una tasa base muy baja (1,0 % en test), lo que convierte una tarea aparentemente trivial en un problema de deteccion de eventos raros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder transformer MPNet (`paraphrase-mpnet-base-v2`) + cabeza de clasificacion `LogisticRegression` |
| Parametros totales | 109.486.464 (cuerpo transformer; la cabeza logistica anade un numero muy reducido de coeficientes) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (la entrada es una unica intervencion de texto; el limite lo fija la configuracion del modelo base MPNet) |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas; el repo se distribuye en `safetensors`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (tags del repo); cabecera logistica serializada por SetFit |
| Libreria de inferencia | `setfit` |
| Pipeline | `text-classification` |
| Tarea concreta | Clasificacion binaria de la asercion `td__the_utterance_asks_one_or_more_students_whether_they_agree_with_a_prior_student_contribution` |
| Modelo base | `sentence-transformers/paraphrase-mpnet-base-v2` |
| Dataset de entrenamiento | `StanfordSCALE/assertions_llm_annotated_talkmoves` (13.180 train / 3.297 dev / 8.238 test) |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: en lugar de anadir una cabeza de clasificacion directamente sobre un encoder preentrenado y ajustar todo el modelo con cross-entropy, se entrena primero el cuerpo con aprendizaje contrastivo sobre pares de frases generados a partir de las clases, y despues se ajusta una regresion logistica sobre los embeddings resultantes. El cuerpo es MPNet (`paraphrase-mpnet-base-v2`), un transformer con atencion de posicion relativa que combina las ventajas de las mascaras tipo BERT y de la prediccion autorregresiva tipo GPT. El cuerpo se entreno con learning rate de 2e-05, batch size 16 en la fase contrastiva, 10 epocas y un maximo de 5.000 pasos; la cabeza se entreno con learning rate 0,01 y batch size 32, con semilla 20260904 y precision mixta activada en GPU.

Los datos proceden de un subconjunto del TalkMoves Dataset anotado por anotadores LLM, no por codificadores humanos. Cada fila contiene una intervencion docente y dos columnas: `assertion_asks_one_or_more_students_whether_they_agree_with_a_prior_student_contribution` (etiqueta binaria) y `split_asks_one_or_more_students_whether_they_agree_with_a_prior_student_contribution`. El formato de entrada es unicamente `{utterance}`, es decir, la intervencion se pasa tal cual, sin contexto dialogico adicional. La fiabilidad inter-anotador medida con alfa de Krippendorff es de 0,667. No se documenta el uso de RLHF ni de DPO, algo esperable en un clasificador de este tipo.

## Capacidades

- Clasificacion binaria de una unica asercion discursiva: devuelve 1 cuando la intervencion pide a los estudiantes posicionarse sobre una contribucion previa de un companero.
- Salida probabilistica mediante `predict_proba`, lo que permite fijar umbrales distintos segun el coste relativo de falsos positivos y falsos negativos.
- Inferencia a nivel de intervencion individual, sin necesidad de contexto conversacional ni de turnos anteriores.
- Codificacion auditable y explicita: la asercion esta definida en lenguaje natural y es verificable, a diferencia de etiquetas latentes de una taxonomia opaca.
- Integracion en el ecosistema `EduBehaviors-kit` junto a otros clasificadores de aserciones del mismo conjunto top-down (`td`).
- Ejecucion en CPU y en GPU de gama baja por su reducido tamano.
- NO dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- NO soporta tool calling, function calling ni comportamiento agentico.
- Capacidad multilingue limitada al ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.

## Casos de uso

- Anotacion a escala de corpus de aula: procesar miles de transcripciones de clases de matematicas para medir la frecuencia con la que el docente solicita posicionamiento sobre contribuciones previas, algo inviable con codificacion manual.
- Investigacion sobre "accountable talk": cuantificar patrones de elicitacion de acuerdo o desacuerdo como indicador de practicas dialogicas de alta calidad, agregando las probabilidades del clasificador por profesor, sesion o unidad didactica.
- Triaje previo a anotacion humana: usar el clasificador como primer filtro (coste de inferencia minimo) y reservar el esfuerzo de codificadores humanos o de un LLM de mayor coste para las intervenciones con probabilidad intermedia.
- Auditoria de anotaciones existentes: contrastar las etiquetas de un corpus ya codificado con las predicciones del modelo para localizar posibles errores o inconsistencias, dado que el alfa de Krippendorff entre anotadores es de 0,667.
- Formacion y desarrollo profesional docente: generar informes automaticos sobre la proporcion de intervenciones que invitan a los alumnos a evaluar lo dicho por un companero, con datos de sesiones reales grabadas y transcritas.
- Construccion de indicadores para evaluacion de programas educativos: usar la tasa de esta asercion como una metrica objetiva y repetible antes y despues de una intervencion formativa.
- Componente de un pipeline multi-asercion: encadenar este clasificador con otros del conjunto `td` para reconstruir un perfil discursivo completo de cada intervencion docente.
- Despliegue en entornos con recursos limitados: al requerir menos de 1 GB de memoria, puede ejecutarse en un portatil o en un contenedor pequeno junto al resto del pipeline de analisis.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Split | n | Tasa base | Precision (clase positiva) | Recall (clase positiva) | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.297 | 0,8 % | 0,600 | 0,480 | 0,533 | 0,912 | 0,580 |
| test | 8.238 | 1,0 % | 0,706 | 0,565 | 0,627 | 0,883 | 0,602 |

El `model-index` del repositorio declara para el split de test: F1 de 0,6275, precision de 0,7059, recall de 0,5647 y ROC-AUC de 0,8826 en la clase positiva, todas ellas marcadas como no verificadas (`verified: false`). No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en FP32 (109.486.464 parametros x 4 bytes), unos 0,22 GB en FP16 y unos 0,11 GB en INT8, mas el overhead de activaciones y del runtime, por lo que en la practica cualquier GPU con 2 GB o mas es suficiente.
- Cabe holgadamente en GPU de consumo: GTX 1060 6 GB, RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas de portatiles recientes.
- Inferencia en CPU totalmente viable; es la opcion recomendada para lotes offline de transcripciones, dado el tamano del modelo.
- GPU de centro de datos (A100, H100) innecesarias para la inferencia; solo tendrian sentido para reentrenar el cuerpo con aprendizaje contrastivo a gran escala.
- Opciones de despliegue: `setfit` (recomendado, tal como documenta el autor), `sentence-transformers` mas scikit-learn para la cabeza, exportacion a ONNX Runtime para reducir latencia en CPU, y servicio mediante FastAPI o TorchServe. No aplican vLLM ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No hay datos publicados de rendimiento de alternativas sobre el mismo split en la informacion disponible, por lo que la comparacion cuantitativa no puede realizarse. La tabla recoge las alternativas razonables y los datos disponibles de cada una:

| Modelo | Tipo | Parametros | Contexto | F1 en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (StanfordSCALE, asercion de acuerdo) | SetFit + MPNet | 109.486.464 | No disponible | 0,6275 (test, clase positiva) | No disponible | Hugging Face, 0 descargas |
| Otros clasificadores de aserciones de StanfordSCALE (mismo corpus y esquema `td`) | SetFit + MPNet | ~109 M (por analogia, no confirmado) | No disponible | No disponible | No disponible | Hugging Face |
| `sentence-transformers/paraphrase-mpnet-base-v2` sin ajustar | Encoder de embeddings | ~109 M | No disponible | No aplica (no es un clasificador) | No disponible | Hugging Face |
| LLM generalista con anotacion zero-shot sobre el mismo corpus | Modelo generativo | No disponible | No disponible | No disponible | No disponible | No disponible |

Frente a un LLM generativo, la ventaja de este clasificador es el coste por inferencia y la trazabilidad de la etiqueta; la desventaja es la especializacion extrema: cubre una sola asercion y no puede reutilizarse para otras tareas sin reentrenar la cabeza.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de anotadores LLM, no de codificadores humanos; el acuerdo entre anotadores es de 0,667 segun alfa de Krippendorff, lo que situa un techo de calidad en los datos de partida.
- Tasa base extremadamente baja: 0,8 % global, 0,7 % en train, 0,8 % en dev y 1,0 % en test. Con esta prevalencia, incluso una precision del 70,6 % implica un numero considerable de falsos positivos en terminos absolutos.
- Recall limitado (0,565 en test): el modelo deja escapar cerca de la mitad de los casos positivos, por lo que no es adecuado como unico metodo de medida sin correccion por sensibilidad.
- El modelo se entreno unicamente con intervenciones de docentes del TalkMoves Dataset; su comportamiento con habla de estudiantes no ha sido probado.
- La entrada es solo la intervencion aislada, sin contexto. La asercion hace referencia a una contribucion previa de un estudiante, pero el modelo no recibe esa contribucion, de modo que parte de la decision depende de marcadores linguisticos superficiales de la intervencion.
- Idioma: solo ingles. No hay evidencia de funcionamiento en castellano ni en aulas con cambio de codigo.
- Licencia no disponible: no puede asumirse que el uso comercial este permitido. Conviene contactar con el autor antes de integrarlo en un producto.
- Sin datos de calibracion publicados; si se usa un umbral distinto de 0,5 hay que recalibrar sobre un conjunto propio.
- Adopcion practicamente nula a fecha de consulta (0 descargas, 0 likes), lo que reduce la probabilidad de encontrar informes de terceros sobre su comportamiento en produccion.
- Riesgo de desviacion de dominio: conversaciones transcritas de forma automatica, aulas de otras materias o niveles educativos distintos pueden degradar el rendimiento.
- No genera explicaciones ni justificaciones de sus predicciones; la auditabilidad depende de la definicion de la asercion, no de la salida del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StanfordSCALE/assertion_asks_one_or_more_students_whether_they_agree_with_a_prior_student_contribution
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit`: no disponible (se menciona en la model card, pero no se incluye enlace)
- Paper o publicacion asociada: no disponible
- Demo o espacio interactivo: no disponible
