# StanfordSCALE/assertion_sentence_expresses_confusion_or_requests_help

## Resumen

`StanfordSCALE/assertion_sentence_expresses_confusion_or_requests_help` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea concreta es determinar si una intervencion docente expresa confusion o solicita ayuda. No es un modelo generativo: es un encoder Sentence Transformers (`paraphrase-mpnet-base-v2`) afinado con la tecnica SetFit y coronado con una regresion logistica como cabeza de clasificacion.

El modelo tiene 109.486.464 parametros (unos 109,5 millones) y un repositorio de 0,4 GB en formato safetensors. Se entrena sobre un subconjunto anotado por anotadores LLM de intervenciones de profesor extraidas del TalkMoves Dataset. El uso previsto es la investigacion sobre discurso en el aula y el analisis automatizado de comportamientos docentes, no la produccion general.

Su relevancia actual es limitada y debe entenderse en clave metodologica: la propia model card reconoce que el rendimiento es insuficiente para uso autonomo (F1 de 0,160 en test) y que el acuerdo entre anotadores es pobre (alfa de Krippendorff de 0,218). Sirve como pieza de una suite de codificacion auditable y como linea base reproducible, no como clasificador desplegable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MPNet) con cabeza de regresion logistica, entrenado con SetFit (fase contrastiva + cabeza supervisada) |
| Parametros totales | 109.486.464 (109,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (limite del modelo base MPNet; no confirmado explicitamente en la documentacion del autor) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto (text-classification), binaria |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Cabeza | `LogisticRegression` |
| Etiquetas | `assertion_sentence_expresses_confusion_or_requests_help`, `split_sentence_expresses_confusion_or_requests_help` |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Tamano del repositorio | 0,4 GB |
| Libreria | setfit |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder MPNet (`paraphrase-mpnet-base-v2`) que actua como cuerpo del modelo, seguido de una regresion logistica como cabeza. El entrenamiento sigue el procedimiento SetFit en dos fases: una fase contrastiva sobre pares de frases para adaptar el espacio de representaciones, seguida del ajuste de la cabeza de clasificacion sobre los embeddings resultantes. Los hiperparametros declarados son: learning rate del cuerpo 2e-05, learning rate de la cabeza 0,01, batch size 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, max steps 5000 (contrastiva), eval max steps 100, semilla 20260904 y precision mixta activada en GPU.

Los datos proceden de `StanfordSCALE/assertions_llm_annotated_talkmoves`, un subconjunto del TalkMoves Dataset anotado por anotadores LLM. Los tamanos de split son 3.430 ejemplos de entrenamiento (53,3%), 858 de desarrollo (13,3%) y 2.146 de test (33,4%). La tasa base de la clase positiva es del 1,0% global (0,9% en train, 1,3% en dev, 1,0% en test), lo que convierte el problema en un caso extremo de desbalanceo. El acuerdo entre anotadores medido con alfa de Krippendorff es 0,218, un valor que la propia model card califica de pobre.

No se documentan innovaciones tecnicas adicionales: no hay decodificacion especulativa, atencion lineal ni fases de RLHF o DPO, ya que se trata de un encoder de clasificacion y no de un modelo generativo.

## Capacidades

- Clasificacion binaria de una unica frase: devuelve 1 cuando la asercion "expresa confusion o solicita ayuda" se cumple y 0 en caso contrario.
- Salida de probabilidad calibrada a traves de `predict_proba`, util para ordenar candidatos por puntuacion.
- Procesamiento de intervenciones docentes en ingles, con la frase pasada tal cual, sin plantilla de prompt ni instrucciones adicionales.
- Integracion con el paquete Python `EduBehaviors-kit` para la codificacion de dialogo basada en aserciones.
- Inferencia ligera en CPU o GPU de gama baja, apta para procesar lotes grandes de transcripciones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidad multilingue: no disponible; solo se declara ingles.

## Casos de uso

- Preanotacion de corpus educativos para investigacion: dado el ROC-AUC de 0,842 en test, el modelo puede usarse para ordenar las intervenciones docentes por probabilidad de expresar confusion o peticion de ayuda, de modo que los codificadores humanos revisen primero los casos mas prometedores en lugar de leer el corpus completo.
- Aprendizaje activo sobre transcripciones de aula: las predicciones con alta probabilidad se usan como candidatos para anotacion manual, reduciendo el coste de etiquetado en un corpus con una tasa base del 1,0%.
- Filtrado de candidatos en un pipeline de analisis de discurso: combinado con otras aserciones de la misma suite, el modelo actua como primera etapa barata antes de aplicar un LLM anotador mas costoso sobre un subconjunto reducido.
- Analisis exploratorio de sesiones docentes por parte de formadores de profesorado: agregando las puntuaciones por sesion se pueden localizar fragmentos con mayor densidad de solicitudes de ayuda, siempre como senal orientativa y con revision humana posterior.
- Linea base reproducible para comparar clasificadores de comportamiento docente: al publicar semilla, hiperparametros y splits, permite medir si un enfoque alternativo mejora el F1 de 0,160 sobre el mismo conjunto de test.
- Evaluacion de la calidad de etiquetado LLM: el modelo sirve para estudiar el impacto del bajo acuerdo entre anotadores (alfa 0,218) en el rendimiento final de un clasificador, un experimento metodologico relevante para quien construye datasets con anotacion automatica.
- Filtro de baja confianza en produccion interna: descartando las predicciones con probabilidad cercana a 0,5 se puede elevar la precision observada (0,500 en test) a costa de perder cobertura, un compromiso util cuando el coste de un falso positivo es alto.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados de forma independiente). Evaluacion sobre `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 1,3% | 0,000 | 0,000 | 0,000 | 0,833 | 0,166 |
| test | 2.146 | 1,0% | 0,500 | 0,095 | 0,160 | 0,842 | 0,234 |

En precision, recall, F1 y ROC-AUC se reportan los valores de la clase positiva en test: precision 0,500, recall 0,0952, F1 0,160 y ROC-AUC 0,8416. En desarrollo el modelo no predice ningun positivo (precision, recall y F1 iguales a cero), aunque mantiene un ROC-AUC de 0,833, lo que indica cierta capacidad de ordenacion sin capacidad de decisión al umbral por defecto. No hay benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 440 MB en fp32 y 220 MB en fp16 para los pesos; con activaciones y overhead, menos de 1 GB en cualquiera de los dos casos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; una RTX 4090, A100 o H100 esta enormemente sobredimensionada para 109,5 M de parametros.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta moderna (GTX 1650, RTX 3050, RTX 4060, etc.) y tambien en GPU integradas recientes.
- Inferencia en CPU: viable para lotes de tamano moderado, dado el reducido numero de parametros y la ausencia de generacion autoregresiva.
- Opciones de despliegue: `setfit` / `sentence-transformers` en Python, exportacion a ONNX Runtime o TorchScript, y servicio mediante FastAPI o similar. No aplican vLLM, TGI ni Ollama en su configuracion habitual, al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada otros clasificadores de la misma asercion ni modelos directamente comparables de la suite EduBehaviors. La unica referencia disponible es el propio modelo base.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_sentence_expresses_confusion_or_requests_help | 109,5 M | 512 tokens (limite del base, no confirmado) | Clasificacion binaria de confusion/peticion de ayuda en intervenciones docentes | No disponible | HuggingFace (repo de 0,4 GB), 0 descargas |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base) | No disponible en la informacion proporcionada | No disponible | Sentence embeddings genericos | No disponible | HuggingFace |
| Clasificadores equivalentes de otras aserciones de EduBehaviors | No disponible | No disponible | Clasificacion de comportamientos docentes | No disponible | No disponible |

No se dispone de datos de rendimiento de los modelos alternativos, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos. El acuerdo medido con alfa de Krippendorff es 0,218, un valor pobre segun la propia model card, que ademas afirma que las predicciones del modelo y los datos subyacentes no son fiables.
- El F1 de test es 0,160. El autor indica explicitamente que el modelo no funciona lo suficiente bien como para usarse por si solo.
- El split de test contiene solo 21 ejemplos positivos, por lo que las metricas tienen un margen de error muy amplio.
- En el split de desarrollo el modelo no predice ningun positivo, con precision, recall y F1 iguales a cero.
- Entrenado unicamente con intervenciones de profesor; el comportamiento sobre habla de estudiantes no ha sido probado.
- Fuerte desbalanceo de clases: tasa base del 1,0%, lo que hace que un clasificador trivial que siempre prediga la clase negativa obtenga una exactitud aparentemente alta pero inutil.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y, sobre todo, de falsos negativos masivos por el recall de 0,095.
- Solo admite ingles; no hay soporte multilingue declarado.
- La licencia no esta disponible, por lo que no puede confirmarse que el uso comercial este permitido. Debe tratarse como no apto para produccion comercial hasta aclarar este punto.
- No se documentan sesgos especificos, pero el dominio de entrenamiento (discurso en el aula en ingles) limita la generalizacion a otros contextos.
- El modelo no debe emplearse para decisiones que afecten a docentes o estudiantes sin revision humana y validacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_expresses_confusion_or_requests_help
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio GitHub): https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit`: no disponible (mencionado en la model card sin enlace)
- Paper o blog del proyecto EduBehaviors: no disponible
- Demo o espacio de inferencia: no disponible

Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces obtenidos correspondian a catalogos de venta de ventanas de PVC y no guardan relacion con el contenido de esta ficha.
