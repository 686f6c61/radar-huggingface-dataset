# StanfordSCALE/assertion_sentence_references_task_procedure_or_logistics

## Resumen

Este modelo es un clasificador binario de texto especializado en detectar una aserción concreta sobre discurso de aula: si una intervención docente hace referencia a procedimientos de tarea o a logística de clase ("sentence references task procedure or logistics"). No es un modelo generativo, sino un clasificador SetFit construido sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet, 109.486.464 parámetros) con un cabezal de regresión logística. Lo desarrolla la Stanford SCALE Initiative como parte del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para codificación auditable de diálogo educativo.

El problema que resuelve es la codificación manual de transcripciones de aula, una tarea costosa y difícil de escalar. El modelo forma parte de la familia de clasificadores de aserciones de EduBehaviors y se usa a través del paquete Python `EduBehaviors-kit` para etiquetar automáticamente intervenciones de profesor extraídas del corpus TalkMoves. Se entrenó sobre un subconjunto anotado por anotadores LLM (3.430 ejemplos de entrenamiento, 858 de validación y 2.146 de test), con una tasa base de la clase positiva del 34,5%.

Su relevancia es metodológica y de infraestructura: permite convertir investigación cualitativa de discurso en señales estructuradas y auditables a gran escala. Es un modelo pequeño, de inglés únicamente, publicada en septiembre de 2026, sin descargas ni validación externa por el momento y sin licencia declarada, por lo que su uso en producción requiere verificar antes las condiciones legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (encoder transformer) como cuerpo + cabezal `LogisticRegression` (esquema SetFit) |
| Parametros totales | 109.486.464 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en la model card; la arquitectura MPNet subyacente admite hasta 512 tokens de entrada |
| Tipos de cuantizacion | No disponible (la model card no documenta cuantizaciones publicadas; al ser un encoder de ~110 M de parametros es viable convertir a INT8/ONNX) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (etiqueta declarada), mas el cabezal de clasificacion serializado por SetFit; el formato exacto del cabezal no se detalla en la model card |
| Pipeline | text-classification |
| Libreria | setfit |
| Tamano del repositorio | 0,4 GB |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Columnas de salida | `assertion_sentence_references_task_procedure_or_logistics`, `split_sentence_references_task_procedure_or_logistics` |

## Arquitectura y entrenamiento

El modelo sigue el esquema SetFit: en lugar de anadir una cabeza de clasificacion sobre un transformer entrenado de extremo a extremo con cross-entropy, se entrena primero el encoder con aprendizaje contrastivo sobre pares de frases (fase de cuerpo) y despues se ajusta un clasificador logistico sobre los embeddings resultantes (fase de cabeza). El cuerpo es `paraphrase-mpnet-base-v2`, un MPNet afinado para similitud semantica de frases; la cabeza es una regresion logistica. Los hiperparametros declarados son: learning rate del cuerpo 2e-5, learning rate de la cabeza 0,01, batch size 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, max steps 5000 en la fase contrastiva, eval max steps 100, semilla 20260904 y precision mixta activada en GPU.

Los datos proceden de un subconjunto del TalkMoves Dataset anotado por anotadores LLM: 3.430 ejemplos de entrenamiento (53,3%), 858 de validacion (13,3%) y 2.146 de test (33,4%), con tasas base de clase positiva de 34,5%, 33,9% y 34,7% respectivamente. La entrada se construye con la plantilla `{utterance}`, es decir, la intervencion se pasa tal cual, sin contexto adicional. El acuerdo entre anotadores para esta asercion es de Krippendorff's alpha = 0,404, un valor bajo-moderado que fija un techo practico al rendimiento alcanzable. No se documentan fases de RLHF ni DPO, algo esperable en un clasificador discriminativo de este tipo.

## Capacidades

- Clasificacion binaria de texto: devuelve 1 cuando la asercion "la intervencion hace referencia a un procedimiento de tarea o a logistica" se cumple, y 0 en caso contrario.
- Puntuacion de probabilidad calibrable mediante `predict_proba`, lo que permite ajustar el umbral de decision segun el coste relativo de falsos positivos y falsos negativos.
- Codificacion de intervenciones docentes individuales (utterance-level), no de conversaciones completas.
- Integracion con el ecosistema SetFit y con el paquete `EduBehaviors-kit` para esquemas de anotacion por aserciones.
- Ejecucion eficiente en CPU y en GPU de gama baja por su tamano reducido.
- Capacidades multilingues: no. Solo ingles.
- Tool calling / function calling: no.
- Soporte de agentes y razonamiento multi-paso: no.
- Modo "thinking", vision o audio: no. Es un clasificador puro.
- Generacion de texto: no. No es un modelo de lenguaje generativo.

## Casos de uso

- Codificacion automatizada de discurso de aula en investigacion educativa: el modelo etiqueta intervenciones de profesor procedentes de transcripciones y sustituye parte del trabajo de codificacion manual, permitiendo procesar miles de utterances con un coste marginal casi nulo.
- Auditoria de anotaciones generadas por LLM: al ser un clasificador pequeno e independiente, sirve como segunda opinion sobre anotaciones producidas por modelos generativos, dentro de esquemas de codificacion auditable como EduBehaviors.
- Analitica educativa a escala: agregar la proporcion de intervenciones que referencian procedimientos o logistica por sesion, docente o unidad didactica, para estudiar patrones de gestion de aula.
- Formacion y acompanamiento docente: alimentar informes de observacion que cuantifiquen cuanto del discurso del profesor se dedica a instrucciones procedimentales frente a otros tipos de intervencion.
- Construccion de datasets derivados: usar la salida del clasificador como filtro para seleccionar o descartar segmentos de transcripcion antes de entrenar modelos mayores, reduciendo el ruido del corpus.
- Investigacion reproducible con `EduBehaviors-kit`: integrar el clasificador en pipelines de analisis que necesitan resultados deterministas y versionados, con una semilla y unos hiperparametros documentados.
- Prototipado rapido en entornos sin GPU: al ser un encoder de ~110 M de parametros, puede desplegarse en un portatil o en una instancia CPU pequena para validar hipotesis de investigacion antes de escalar.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados externamente):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 33,9% | 0,695 | 0,698 | 0,696 | 0,857 | 0,796 |
| test | 2.146 | 34,7% | 0,712 | 0,694 | 0,703 | 0,867 | 0,801 |

Dataset de evaluacion: `StanfordSCALE/assertions_llm_annotated_talkmoves`, split de test. El model-index en formato HuggingFace reporta para test: F1 0,7029, precision 0,7121, recall 0,694 y ROC-AUC 0,8669 (marcados como `verified: false`). No se han publicado comparaciones con otros modelos sobre este mismo conjunto.

## Requisitos de hardware

- VRAM estimada: en FP32 el cuerpo ocupa aproximadamente 0,42-0,44 GB de pesos, coherente con el tamano de repositorio de 0,4 GB; en FP16 baja a unos 0,22 GB y en INT8 a unos 0,11 GB. La VRAM real depende del batch y de la longitud de las secuencias.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria es suficiente (GTX 1650, T4, RTX 3060, RTX 4090). No requiere A100 ni H100; usarlas seria un desperdicio de recursos.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en GPUs integradas, ya que el modelo completo ronda los 110 M de parametros.
- CPU: la inferencia en CPU es perfectamente viable; para lotes grandes conviene exportar a ONNX Runtime o usar cuantizacion dinamica.
- Opciones de despliegue: `setfit` (referencia oficial), PyTorch nativo, ONNX Runtime via Hugging Face Optimum, TorchScript y servicios HTTP propios con FastAPI o similar. No aplica vLLM, llama.cpp, Ollama ni TGI, porque son runtimes orientados a modelos generativos y este es un encoder de clasificacion.
- Latencia y throughput: no disponible. La model card no publica mediciones de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables entre estos modelos sobre el mismo conjunto de datos; la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad | Benchmarks en este dataset |
|---|---|---|---|---|---|---|
| StanfordSCALE/assertion_sentence_references_task_procedure_or_logistics | 109.486.464 | No declarada (MPNet, hasta 512 tokens) | Clasificacion binaria de una asercion concreta | No disponible | HuggingFace, via SetFit | F1 0,703 y ROC-AUC 0,867 en test (declarados) |
| sentence-transformers/paraphrase-mpnet-base-v2 | ~109 M | No declarada (hasta 512 tokens) | Embeddings de frases; requiere entrenar un clasificador aparte | Apache-2.0 (segun su propia model card) | HuggingFace | No disponible |
| sentence-transformers/all-mpnet-base-v2 | ~109 M | No declarada (hasta 512 tokens) | Embeddings de frases de proposito general | Apache-2.0 (segun su propia model card) | HuggingFace | No disponible |
| Otros clasificadores de aserciones de StanfordSCALE (familia EduBehaviors) | ~109 M por modelo | No declarada | Clasificacion binaria de otras aserciones de discurso de aula | No disponible | HuggingFace | No disponible en la informacion proporcionada |

La ventaja especifica de este modelo frente a un encoder generico es que ya viene ajustado para la asercion concreta y devuelve una probabilidad directamente utilizable; su desventaja es que solo cubre esa asercion y no se puede reutilizar para otras tareas sin reentrenar el cabezal.

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores es Krippendorff's alpha = 0,404, un valor bajo-moderado que limita el techo de rendimiento y hace esperable cierto ruido irreducible en las etiquetas.
- El modelo se entreno unicamente con intervenciones de profesor. Su comportamiento sobre habla de estudiantes no ha sido probado.
- Solo soporta ingles. Las intervenciones en otros idiomas no estan cubiertas.
- Licencia no declarada. Antes de cualquier uso comercial es imprescindible contactar con el autor para conocer las condiciones; a dia de hoy no hay autorizacion explicita publicada.
- Clasificador de una sola asercion: no genera texto, no razona, no soporta tool calling ni agentes. No debe presentarse como un modelo de lenguaje.
- Precision de 0,712 y recall de 0,694 en test implican aproximadamente un 30% de error en la clase positiva. No es adecuado para decisiones de alto impacto (evaluacion de docentes, consecuencias laborales) sin revision humana.
- Riesgo de mala calibracion si la tasa base del corpus de destino difiere del 34,5% del entrenamiento; conviene recalibrar el umbral sobre una muestra local antes de desplegar.
- La model card no documenta la composicion del corpus TalkMoves por asignatura, nivel educativo o demografia, por lo que la generalizacion a otros dominios educativos no esta garantizada y podrian existir sesgos derivados de esa distribucion.
- Las utterances largas pueden truncarse al limite de entrada del encoder, con perdida de informacion.
- Metricas no verificadas externamente (`verified: false`) y modelo sin descargas ni likes en el momento del analisis; no hay evidencia de uso independiente en produccion.
- El repositorio (0,4 GB) y las fechas de creacion y actualizacion (18 de septiembre de 2026) indican una publicacion reciente, sin historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_references_task_procedure_or_logistics
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (SumnerLab): https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit`: mencionado en la model card, sin URL disponible en la informacion proporcionada
- Paper o publicacion tecnica del proyecto EduBehaviors: no disponible
- Demo o Space: no disponible
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces recuperados no guardan relacion con el.
