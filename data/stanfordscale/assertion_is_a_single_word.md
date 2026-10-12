# StanfordSCALE/assertion_is_a_single_word

## Resumen

`StanfordSCALE/assertion_is_a_single_word` es un clasificador binario de texto en ingles publicado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas de aserciones para la codificacion auditable de dialogo educativo. El modelo responde a una unica pregunta sobre cada intervencion docente: si la elocucion es una sola palabra. Forma parte del conjunto de aserciones bottom-up `bu5` y se distribuye como parte del ecosistema de codificacion de discurso de aula.

Tecnicamente no es un modelo generativo ni un LLM conversacional, sino un clasificador SetFit: el cuerpo es el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parametros, formato safetensors) y sobre el se entrena una cabeza de regresion logistica. Se entreno sobre un subconjunto anotado por LLM de intervenciones de profesor del dataset TalkMoves, con 24.715 ejemplos repartidos en train, dev y test.

Su relevancia es metodologica: demuestra que tareas de codificacion fino de discurso de aula, tradicionalmente reservadas a anotadores humanos, se pueden automatizar con alta fidelidad (F1 de 0,969 y ROC-AUC de 0,996 en test) usando un encoder pequeno que se ejecuta en CPU. Ademas, el modelo incluye un aviso explicito de que las etiquetas provienen de anotadores LLM y no de codificadores humanos, lo que lo convierte en un caso de estudio sobre trazabilidad y auditoria en pipelines de etiquetado sintetico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer MPNet (paraphrase-mpnet-base-v2) con cabeza de clasificacion LogisticRegression (SetFit) |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; es un clasificador de frase, no un modelo generativo con ventana de contexto |
| Tipos de cuantizacion | no disponible; el repo se distribuye en safetensors a precision completa |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `setfit`) |
| Tarea | text-classification (clasificacion binaria) |
| Etiquetas | `assertion_is_a_single_word` (positiva/negativa) y columna auxiliar `split_is_a_single_word` |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Tamano del repositorio | 0,4 GB |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Fecha de publicacion | 2026-10-12 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit en dos fases. En la primera, el cuerpo MPNet preentrenado (`paraphrase-mpnet-base-v2`) se afina con aprendizaje contrastivo por pares generados a partir de las etiquetas, con un learning rate de 2e-05, batch size 16 y un maximo de 5.000 pasos. En la segunda, se congela el encoder y se entrena una cabeza de regresion logistica con learning rate 0,01 y batch size 32. El entrenamiento completo dura 10 epocas, con `eval_max_steps` de 100, semilla 20260904 y precision mixta activada en GPU. La entrada es la elocucion del docente en crudo (`{utterance}`), sin plantilla adicional ni estructura de mensajes.

Los datos proceden del subconjunto anotado por LLM de intervenciones de profesor del TalkMoves Dataset, con 13.180 ejemplos de train (53,3%), 3.298 de dev (13,3%) y 8.237 de test (33,3%). La tasa base de la clase positiva es del 12,0% global (11,8% en train, 12,4% en dev, 12,0% en test), es decir, es un problema claramente desbalanceado. Las etiquetas las generaron anotadores LLM, no personas, y la fiabilidad entre anotadores medida con alfa de Krippendorff es de 0,940. El modelo esta pensado para usarse a traves del paquete Python `EduBehaviors-kit`.

## Capacidades

- Clasificacion binaria de texto: determina si una elocucion de profesor es una sola palabra (por ejemplo, un nombre propio aislado como `Erik`).
- Salida de probabilidad calibrada por clase mediante `predict_proba`, util para umbralizar decisiones en cascada.
- Integracion nativa con el ecosistema SetFit (`SetFitModel.from_pretrained`), lo que permite cargar el modelo en pocas lineas.
- Codificacion auditable de discurso de aula dentro del esquema de aserciones EduBehaviors.
- Encoder de frases reutilizable: al derivar de `paraphrase-mpnet-base-v2`, el cuerpo puede generar embeddings de oraciones, aunque el modelo publicado se orienta a la clasificacion.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, function calling, capacidades de agente, vision ni audio.
- Soporte multilingue: no disponible; el modelo se entreno y evaluo unicamente en ingles.
- No dispone de modo de razonamiento explicito (thinking mode) ni de decodificacion especulativa, al no ser un modelo autoregresivo.

## Casos de uso

- Codificacion automatica de discurso de aula a escala: aplicar el clasificador sobre transcripciones completas de clases para marcar que intervenciones del docente consisten en una sola palabra, reduciendo el trabajo de anotacion manual en estudios con cientos de horas de grabacion.
- Investigacion educativa sobre el dataset TalkMoves: reproducir o ampliar los analisis de movimientos conversacionales marcando primero la asercion `is_a_single_word` como variable auxiliar en el pipeline de codificacion.
- Formacion y feedback docente: generar informes que cuantifiquen la proporcion de intervenciones de una sola palabra en una sesion, un indicador util para revisar patrones de interaccion en el aula.
- Prefiltrado en pipelines de anotacion humana: usar el modelo como primera pasada para separar los casos claros (probabilidad extrema) y derivar solo los ambiguos a codificadores humanos, aprovechando su precision de 0,959 y recall de 0,980 en test.
- Auditoria de esquemas de etiquetado sintetico: al ser un clasificador entrenado sobre anotaciones LLM con alfa de Krippendorff de 0,940, sirve como componente verificable dentro de arquitecturas de codificacion de dialogo auditables.
- Sistemas de analitica para plataformas de aprendizaje: integrar el modelo via `EduBehaviors-kit` para etiquetar intervenciones en tiempo real o por lotes con un coste computacional minimo, dado que requiere menos de 1 GB de memoria en fp32.
- Investigacion en NLP educativo: usarlo como referencia (baseline) reproducible frente a clasificadores mayores o aproximaciones basadas en LLM generativos para la misma tarea.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. La metrica `verified: false` indica que no han sido verificados de forma independiente. El objetivo es la clase positiva.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.298 | 12,4% | 0,962 | 0,980 | 0,971 | 0,996 | 0,968 |
| test | 8.237 | 12,0% | 0,959 | 0,980 | 0,969 | 0,996 | 0,973 |

Valores del `model-index` oficial para el split de test: F1 0,9695, precision 0,9594, recall 0,9798, ROC-AUC 0,9962.

No se han publicado en la informacion disponible resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a un clasificador binario de dominio especifico.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 solo para los pesos (109,5 M de parametros, coherente con el tamano de repo de 0,4 GB); con activaciones y batch pequeno, el consumo practico se mantiene por debajo de 2 GB.
- Inferencia en CPU: plenamente viable. Es un encoder de 109 M de parametros con una cabeza logistica; no requiere GPU para uso en produccion por lotes.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; no se necesita A100 ni H100. Una NVIDIA T4, RTX 3060 o superior es mas que suficiente para lotes grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna y tambien en iGPU o en entornos sin GPU.
- Opciones de despliegue: libreria `setfit` (via `SetFitModel.from_pretrained`), integracion con `transformers` y `sentence-transformers` para el cuerpo, exportacion a ONNX o TorchScript para servir sin Python, y contenedores ligeros (por ejemplo, FastAPI) para endpoints de clasificacion.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo, y al no ser un modelo generativo no aplica la metrica de tokens por segundo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks de alternativas comparables de la misma categoria (clasificadores de aserciones de discurso educativo o clasificadores SetFit equivalentes), por lo que no es posible establecer una comparacion cuantitativa sin inventar datos. El unico punto de referencia documentado es el propio modelo base `sentence-transformers/paraphrase-mpnet-base-v2`, que no incorpora la cabeza de clasificacion y por tanto no es directamente comparable en F1 sobre esta tarea.

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos. La concordancia entre anotadores es de alfa de Krippendorff 0,940, lo que implica que existe un margen de error heredado del proceso de anotacion.
- El modelo se entreno exclusivamente con intervenciones de profesor. El comportamiento sobre habla de estudiantes esta sin probar.
- Desbalanceo de clases: la clase positiva representa solo el 12,0% del conjunto total, lo que exige umbrales y metricas adecuadas (F1, average precision, ROC-AUC) en lugar de accuracy simple.
- Idioma: solo ingles. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial. Conviene contactar con el autor antes de integrarlo en productos de pago.
- Es un clasificador binario de proposito muy especifico, no un modelo de proposito general: no genera texto y no debe usarse como asistente conversacional ni como motor de razonamiento.
- El riesgo de alucinacion en el sentido generativo no aplica, pero si existen falsos positivos y falsos negativos; con precision de 0,959 en test, alrededor del 4% de las predicciones positivas pueden ser incorrectas.
- Los resultados estan marcados como no verificados en el `model-index` y provienen de una unica particion de evaluacion; no hay validacion cruzada publicada ni evaluacion externa.
- Los resultados de busqueda web asociados a esta consulta no contenian informacion tecnica relevante sobre el modelo, por lo que no se ha podido ampliar la verificacion con fuentes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_is_a_single_word
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Repositorio del TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Paquete Python asociado: `EduBehaviors-kit` (referenciado en la model card; no se proporciona URL)
- Cita sugerida por el autor:
  - `@misc{assertion_is_a_single_word, author = {Stanford SCALE Initiative}, title = {Assertion classifier: is a single word}, year = {2026}, url = {https://huggingface.co/StanfordSCALE/assertion_is_a_single_word}}`
