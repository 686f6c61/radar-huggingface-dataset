# StanfordSCALE/assertion_narrates_steps_being_taken_by_the_speaker

## Resumen

El modelo `StanfordSCALE/assertion_narrates_steps_being_taken_by_the_speaker` es un clasificador binario de texto en ingles desarrollado por la Stanford SCALE Initiative. Su funcion es determinar si un enunciado de un docente contiene la asercion (assertion) `bu5__narrates_steps_being_taken_by_the_speaker`, es decir, si el hablante esta narrando los pasos que esta llevando a cabo. No es un modelo generativo: es un clasificador de secuencias construido con la libreria SetFit sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2`.

El modelo forma parte del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificacion auditable de dialogo educativo, y se utiliza a traves del paquete Python `EduBehaviors-kit`. Se ha entrenado sobre un subconjunto anotado por LLM de intervenciones de profesor procedentes del TalkMoves Dataset, con 13.182 ejemplos de entrenamiento, 3.295 de desarrollo y 8.238 de test.

Su relevancia es acotada pero clara: automatiza una tarea de codificacion de discurso en el aula que tradicionalmente requiere anotadores humanos, con la ventaja de ser reproducible y auditable. Como contrapartida, la tasa base de la clase positiva es muy baja (6,1 % global) y el acuerdo entre anotadores (alfa de Krippendorff de 0,499) es moderado, lo que condiciona tanto las metricas como la interpretacion de los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer MPNet (sentence-transformers/paraphrase-mpnet-base-v2) con cabeza de clasificacion SetFit (LogisticRegression) |
| Parametros totales | 109.486.464 |
| Longitud de contexto | no disponible en la informacion proporcionada (la arquitectura MPNet-base admite secuencias de hasta 512 tokens) |
| Tipos de cuantizacion | no disponible; al tratarse de un encoder de ~109 M de parametros puede ejecutarse en fp32 sobre CPU sin cuantizacion |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repositorio); repositorio de 0,4 GB en total |
| Tarea (pipeline) | text-classification |
| Libreria | setfit |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Columnas del dataset | `assertion_narrates_steps_being_taken_by_the_speaker`, `split_narrates_steps_being_taken_by_the_speaker` |
| Tasa base de la clase positiva | 6,1 % global (6,0 % train, 5,5 % dev, 6,4 % test) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: primero se afina el encoder de frases con un objetivo contrastivo a partir de pares de texto con la misma etiqueta, y despues se entrena una cabeza de clasificacion ligera sobre las representaciones resultantes. En este caso la cabeza es una `LogisticRegression`. El cuerpo parte de `sentence-transformers/paraphrase-mpnet-base-v2`, un encoder MPNet de 109,5 M de parametros. Los hiperparametros declarados son: learning rate del cuerpo 2e-05, learning rate de la cabeza 0,01, batch size 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, un maximo de 5.000 pasos en la fase contrastiva, `eval_max_steps` de 100, semilla 20260904 y precision mixta activada en GPU.

Los datos de entrenamiento proceden de un subconjunto anotado por LLM de intervenciones de profesor del TalkMoves Dataset. El reparto es de 13.182 filas (53,3 %) en train, 3.295 (13,3 %) en dev y 8.238 (33,3 %) en test. La entrada del modelo es la intervencion sin transformaciones adicionales: la plantilla de texto es simplemente `{utterance}`. Las etiquetas no provienen de codificacion humana, sino de anotadores LLM, con un alfa de Krippendorff de 0,499 para esta asercion concreta. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable al no tratarse de un modelo generativo.

## Capacidades

- Clasificacion binaria de texto en ingles: devuelve 1 cuando la asercion `narrates_steps_being_taken_by_the_speaker` se cumple y 0 en caso contrario.
- Salida de probabilidad calibrada mediante `predict_proba`, util para umbralizar decisiones en lugar de depender de una etiqueta dura.
- Deteccion especifica de narracion de pasos en intervenciones de docentes, por ejemplo `'Let me shut this off'`.
- Integracion con el ecosistema SetFit y sentence-transformers, lo que permite uso directo en Python con pocas lineas.
- Encaje dentro del marco EduBehaviors de esquemas basados en aserciones para codificacion auditable de dialogo.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, capacidades de agente, vision ni audio.
- Multilingue: no; el modelo esta entrenado y etiquetado unicamente para ingles.

## Casos de uso

- Codificacion automatica de discurso en el aula: el clasificador etiqueta intervenciones de profesor con la asercion de narracion de pasos, sustituyendo o asistiendo al etiquetado manual en estudios sobre el TalkMoves Dataset.
- Investigacion educativa a escala: permite procesar transcripciones completas de sesiones y obtener estadisticas agregadas sobre la frecuencia de esta conducta, con una tasa base de referencia del 6,1 %.
- Formacion y desarrollo profesional docente: al identificar momentos en los que el docente narra sus propios pasos, se pueden generar informes sobre el estilo de gestion del aula y el modelado cognitivo en voz alta.
- Preprocesado para pipelines analiticos mayores: la salida binaria y la probabilidad sirven como caracteristica de entrada para modelos de analisis de dialogo que combinan varias aserciones del marco EduBehaviors.
- Sistemas de tutoria inteligente y analitica de aprendizaje: la deteccion de narracion de pasos puede usarse como senal para segmentar episodios instruccionales o para activar intervenciones automaticas de apoyo.
- Anotacion asistida y control de calidad: el modelo puede preetiquetar grandes volumenes de transcripciones y reservar la revision humana para los casos con probabilidad intermedia, dado que la precision (0,636) es notablemente superior al recall (0,483).
- Filtrado y recuperacion de ejemplos: localizar fragmentos de transcripcion que ilustren esta conducta concreta para materiales de formacion o para ampliar conjuntos de datos anotados.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model index y en la model card, sobre el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`. No estan verificados de forma independiente.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.295 | 5,5 % | 0,654 | 0,489 | 0,560 | 0,857 | 0,556 |
| test | 8.238 | 6,4 % | 0,636 | 0,483 | 0,549 | 0,866 | 0,586 |

En formato de lista, los valores del split de test son: F1 de 0,5488, precision de 0,6357, recall de 0,4828 y ROC-AUC de 0,8658, todos ellos marcados como no verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en fp32 para los 109,5 M de parametros, y aproximadamente 0,25 GB en fp16. El repositorio completo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; no se requiere A100, H100 ni tarjetas de gama alta. Una RTX 4090 o similar queda ampliamente sobredimensionada.
- Compatibilidad con GPU de consumo: si, cabe con holgura en cualquier GPU de consumo, e incluso en iGPU con memoria compartida.
- Ejecucion en CPU: viable en produccion, dado el tamano del modelo y que se trata de una inferencia de encoder con una sola pasada hacia delante.
- Opciones de despliegue: `setfit` como via principal indicada por el autor; tambien es compatible con la pila de `sentence-transformers` y `transformers` para exportacion a ONNX u otros formatos de ejecucion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de modelos alternativos en la informacion proporcionada. La comparativa se limita, por tanto, a caracteristicas verificables de la informacion disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_narrates_steps_being_taken_by_the_speaker | 109,5 M | no disponible (MPNet-base admite hasta 512 tokens) | Clasificacion binaria de una asercion educativa concreta | no disponible | HuggingFace, libreria setfit |
| sentence-transformers/paraphrase-mpnet-base-v2 | 109,5 M | no disponible | Encoder de frases para similitud semantica | Apache-2.0 segun su repositorio (no confirmado en la informacion proporcionada) | HuggingFace |
| Clasificadores LLM zero-shot sobre el mismo corpus | no disponible | no disponible | Etiquetado de aserciones | no disponible | no disponible |

Rendimiento comparado: no disponible. No se han publicado en la informacion proporcionada resultados de otros clasificadores sobre el mismo conjunto de test.

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores para esta asercion es de 0,499 segun el alfa de Krippendorff, un valor moderado que establece un techo realista al rendimiento alcanzable y que debe tenerse en cuenta al interpretar las metricas.
- El modelo se entreno unicamente con intervenciones de profesor. Su comportamiento sobre discurso de estudiantes no ha sido probado.
- La clase positiva es muy minoritaria (6,1 % global, 6,4 % en test). Con precision de 0,636 y recall de 0,483, un umbral de decision por defecto generara falsos positivos y falsos negativos en proporciones que conviene calibrar segun el coste relativo de cada error.
- El ROC-AUC de 0,866 indica una capacidad de ordenacion razonable, pero el F1 de 0,549 refleja que la separacion efectiva en el umbral operativo es limitada.
- El modelo solo procesa ingles y ha sido entrenado sobre un unico corpus de discurso de aula, por lo que la generalizacion a otros dominios, niveles educativos o paises es desconocida.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de etiquetado espurio cuando el enunciado contiene indicios superficiales de narracion de pasos fuera de contexto.
- Licencia no disponible: no se puede confirmar la viabilidad de uso comercial sin consultar al autor. Este punto debe resolverse antes de integrar el modelo en un producto.
- Las metricas declaradas estan marcadas como no verificadas de forma independiente.
- El modelo no es generativo y no debe emplearse para tareas de generacion, razonamiento, codigo, matematicas ni dialogo abierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_narrates_steps_being_taken_by_the_speaker
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio GitHub citado en la model card): https://github.com/SumnerLab/TalkMoves
- Paquete Python `EduBehaviors-kit`: mencionado en la model card, URL no disponible en la informacion proporcionada
- Paper o publicacion asociada al proyecto EduBehaviors: no disponible en la informacion proporcionada
- Demo o espacio de inferencia: no disponible en la informacion proporcionada
