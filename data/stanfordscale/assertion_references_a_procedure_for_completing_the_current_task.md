# StanfordSCALE/assertion_references_a_procedure_for_completing_the_current_task

## Resumen

El modelo `StanfordSCALE/assertion_references_a_procedure_for_completing_the_current_task` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificacion auditable de dialogo educativo. Su tarea concreta es determinar si un enunciado de un docente hace referencia a un procedimiento para completar la tarea en curso (por ejemplo, instrucciones paso a paso sobre como realizar una actividad). No es un modelo generativo: es un encoder de frases con una cabeza de clasificacion logistica, entrenado con la tecnica SetFit sobre el modelo base `sentence-transformers/paraphrase-mpnet-base-v2`.

Tecnicamente es un modelo compacto de unos 109,5 millones de parametros (arquitectura MPNet) con una regresion logistica como cabeza de clasificacion. Se entreno sobre un subconjunto anotado por LLM de intervenciones de docentes del corpus TalkMoves, con 24.715 filas en total (13.180 de entrenamiento, 3.294 de desarrollo y 8.241 de prueba). Su relevancia actual reside en que forma parte de una familia mas amplia de clasificadores de aserciones (conjunto `bu5`) que permiten etiquetar discurso de aula de forma automatica, reproducible y auditable, sustituyendo parcialmente la codificacion manual en investigacion educativa.

El modelo esta pensado para consumirse a traves del paquete Python `EduBehaviors-kit` y esta limitado a ingles. Su rendimiento declarado en el conjunto de prueba es de F1 0,665, precision 0,6925, recall 0,6395 y ROC-AUC 0,8998 para la clase positiva, con una tasa base del 22,2%. Estas cifras deben interpretarse con cautela porque las etiquetas de entrenamiento y evaluacion provienen de anotadores LLM, no de codificadores humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (encoder de frases) con cabeza de clasificacion `LogisticRegression` (entrenamiento SetFit) |
| Parametros totales | 109.486.464 (~109,5 M, segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite habitual de la arquitectura MPNet del modelo base; no especificado explicitamente en la model card) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones para este modelo; el repo solo distribuye safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamano del repo: 0,4 GB) |
| Libreria | setfit |
| Pipeline | text-classification |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Tarea | Clasificacion binaria de una asercion concreta |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Identificador de asercion | `bu5__references_a_procedure_for_completing_the_current_task` |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: se parte del encoder MPNet preentrenado de `sentence-transformers/paraphrase-mpnet-base-v2` (109 M de parametros) y se genera un espacio de representaciones de frases mediante un entrenamiento contrastivo, sobre el que despues se ajusta una regresion logistica como cabeza de clasificacion. En este caso la cabeza es un `LogisticRegression`, lo que implica que la separacion entre clases se aprende en el espacio de embeddings de frases, no con una capa densa adicional dentro del transformer. Los hiperparametros declarados son: learning rate de 2e-05 para el cuerpo y 0,01 para la cabeza, batch size 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, 5000 pasos maximos en la fase contrastiva, 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU.

Los datos provienen del subconjunto anotado por LLM del TalkMoves Dataset, con intervenciones de docentes unicamente. El reparto es de 13.180 filas de entrenamiento (53,3%), 3.294 de desarrollo (13,3%) y 8.241 de prueba (33,3%), con una tasa base global de positivos del 21,9% (21,9% en train, 21,5% en dev, 22,2% en test). Las etiquetas no son humanas: se generaron con anotadores LLM y la concordancia entre anotadores medida con alfa de Krippendorff es de 0,583 para esta asercion, un valor moderado. El modelo se entreno para procesar un unico campo de texto con el enunciado tal cual, sin plantilla de prompt ni contexto conversacional adicional. La innovacion tecnica relevante no esta en la arquitectura, sino en el enfoque de codificacion auditable: cada comportamiento del discurso se define como una asercion verificable e independiente, lo que permite auditar por separado cada etiqueta del esquema.

## Capacidades

- Clasificacion binaria de texto: devuelve 1 o 0 indicando si el enunciado cumple la asercion "referencia un procedimiento para completar la tarea actual".
- Puntuacion de probabilidad mediante `predict_proba`, lo que permite ajustar el umbral de decision segun el equilibrio deseado entre precision y recall.
- Procesamiento de enunciados individuales de docentes en ingles, sin necesidad de contexto previo ni de estructura conversacional.
- Integracion con el ecosistema SetFit y `sentence-transformers` para inferencia en lote sobre corpus completos.
- Uso a traves del paquete `EduBehaviors-kit` como parte de un esquema de aserciones mayor.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: solo ingles.
- No dispone de modo de razonamiento explicito ni de salida de cadena de pensamiento.

## Casos de uso

- Codificacion automatica de discurso de aula en investigacion educativa: el clasificador etiqueta cada intervencion docente del corpus TalkMoves como "referencia un procedimiento" o no, reduciendo el coste de la codificacion manual sobre miles de enunciados. Es adecuado porque esta entrenado exactamente sobre esa distribucion de datos y ofrece `predict_proba` para filtrar por umbral.
- Triaje previo a revision humana: dado su recall de 0,6395 con precision de 0,6925, puede usarse con un umbral rebajado para pre-seleccionar candidatos que despues revisa un codificador humano, priorizando no dejar casos positivos fuera.
- Analisis de sesiones de formacion docente: a partir de transcripciones de clases grabadas, se extraen las intervenciones que contienen instrucciones procedimentales para analizar como el docente estructura la tarea.
- Construccion de esquemas auditables de dialogo: al ser una asercion atomica dentro del conjunto `bu5`, se puede combinar con otros clasificadores de la misma familia para reconstruir perfiles completos de comportamiento docente, auditando cada etiqueta por separado.
- Investigacion sobre calidad de anotacion LLM: el propio modelo y su dataset asociado sirven como caso de estudio para medir el impacto de etiquetas generadas por LLM (alfa de Krippendorff 0,583) en el rendimiento final de un clasificador supervisado.
- Monitorizacion en plataformas de aprendizaje: integrado en un pipeline que procesa transcripciones o subtitulos, puede marcar en tiempo casi real las intervenciones que contienen instrucciones de procedimiento para generar informes automaticos por sesion.
- Filtrado de corpus para entrenamiento posterior: usar el clasificador para aislar segmentos con referencias procedimentales antes de alimentar otros modelos o de construir subconjuntos tematicos del corpus.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`:

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.294 | 21,5% | 0,676 | 0,629 | 0,652 | 0,897 | 0,735 |
| test | 8.241 | 22,2% | 0,6925 | 0,6395 | 0,665 | 0,8998 | 0,736 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros): el modelo es un clasificador de texto especifico y no aplica a ese tipo de evaluaciones.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 (el repo pesa 0,4 GB, coherente con 109,5 M de parametros en precision completa); aproximadamente 220 MB en fp16 y en torno a 110 MB en int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100, H100 ni tarjetas de gama alta. Una T4, una GTX 1650 o incluso una RTX 3050 son mas que suficientes para inferencia en lote.
- Cabe holgadamente en cualquier GPU de consumo actual y tambien en CPU: la inferencia de un encoder de 109 M de parametros es viable sin acelerador dedicado.
- Opciones de despliegue: `setfit` (via `SetFitModel.from_pretrained`), `sentence-transformers`/PyTorch como backend, y exportacion a ONNX para servir en produccion. No aplica `llama.cpp` ni formatos GGUF (no es un modelo causal generativo), ni `vLLM` ni `TGI` en su configuracion habitual orientada a modelos generativos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al tratarse de un encoder de 109 M de parametros con secuencias cortas, el procesamiento por lotes en GPU o CPU es viable para corpus de decenas de miles de enunciados.

## Comparativa con modelos similares

No se dispone de datos publicados en la informacion proporcionada sobre otros clasificadores de aserciones comparables dentro del mismo esquema `bu5` ni sobre alternativas de la misma tarea con metricas equivalentes. La unica referencia directa disponible es el modelo base sin ajustar, que no realiza esta tarea de clasificacion.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `StanfordSCALE/assertion_references_a_procedure_for_completing_the_current_task` | 109,5 M | 512 tokens (limite del encoder MPNet) | Clasificacion binaria de una asercion concreta | No disponible | HuggingFace, 0 descargas, 0 likes |
| `sentence-transformers/paraphrase-mpnet-base-v2` (modelo base) | 109,5 M | 512 tokens | Generacion de embeddings de frases (no clasifica esta asercion) | No disponible en la informacion proporcionada | HuggingFace |
| Otros clasificadores de aserciones del esquema `bu5` | No disponible | No disponible | Clasificacion de otras aserciones | No disponible | No disponible |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos, con un alfa de Krippendorff de 0,583 para esta asercion: la concordancia es moderada y el techo de rendimiento del clasificador esta acotado por el ruido de las etiquetas.
- El modelo se entreno exclusivamente con intervenciones de docentes. Su comportamiento sobre discurso de estudiantes no ha sido probado y no se puede asumir que sea valido.
- Solo soporta ingles; cualquier uso sobre transcripciones en castellano u otros idiomas carece de garantias.
- La licencia no esta disponible, lo que supone un riesgo legal para uso comercial: conviene contactar con el autor antes de integrarlo en un producto.
- Hay desequilibrio de clases (21,9% de positivos en el conjunto global), por lo que la eleccion del umbral de decision afecta de forma notable al equilibrio entre precision y recall.
- La precision y el recall en prueba son moderados (0,6925 y 0,6395): el modelo no es fiable como unico criterio de decision en contextos de alta exigencia; es recomendable combinarlo con revision humana.
- No hay datos de verificacion independiente: todas las metricas son las declaradas por el autor y estan marcadas como no verificadas.
- Al ser un clasificador de una unica asercion, no ofrece interpretabilidad sobre por que un enunciado se clasifica como positivo, mas alla de la probabilidad de salida.
- El modelo no genera texto ni mantiene contexto conversacional: cualquier caso de uso que requiera dialogo multi-turno, resumen o explicacion queda fuera de su alcance.
- El repositorio presenta 0 descargas y 0 likes, por lo que no existe evidencia de uso en produccion ni de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_references_a_procedure_for_completing_the_current_task
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Repositorio del corpus TalkMoves: https://github.com/SumnerLab/TalkMoves
- Paquete de uso (`EduBehaviors-kit`): no disponible enlace directo en la informacion proporcionada
