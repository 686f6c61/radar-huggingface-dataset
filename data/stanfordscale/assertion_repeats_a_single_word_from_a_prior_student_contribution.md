# StanfordSCALE/assertion_repeats_a_single_word_from_a_prior_student_contribution

## Resumen

`assertion_repeats_a_single_word_from_a_prior_student_contribution` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para el codificado auditable de diálogo en el aula. El modelo responde a una pregunta muy concreta: si una intervencion de un docente repite una unica palabra procedente de una contribucion previa de un estudiante. No es un modelo generativo, sino un clasificador de una sola etiqueta entrenado con la libreria SetFit.

Tecnicamente se apoya en el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parametros) como cuerpo, sobre el que se anade una cabeza de regresion logistica. El entrenamiento se hizo sobre el subconjunto anotado por LLM del TalkMoves Dataset, con 13.181 ejemplos de entrenamiento, 3.297 de desarrollo y 8.237 de test, y una tasa base de la clase positiva del 3,7 % (problema fuertemente desbalanceado).

Su relevancia es practica: forma parte de una familia de clasificadores de aserciones que se pueden encadenar a traves del paquete `EduBehaviors-kit` para etiquetar automaticamente movimientos discursivos docentes a escala, un cuello de botella historico en la investigacion sobre discurso en el aula. Hay que tener presente que las etiquetas provienen de anotadores LLM (alfa de Krippendorff de 0,602) y que el modelo solo se ha probado con intervenciones de profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit (Sentence Transformer `paraphrase-mpnet-base-v2` como cuerpo + cabeza de regresion logistica) |
| Parametros totales | 109.486.464 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens como maximo del encoder mpnet-base-v2 (no indicado explicitamente en la model card) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors sin variantes cuantizadas documentadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |
| Tarea | Clasificacion de texto binaria (text-classification) |
| Libreria | setfit |
| Tamano del repositorio | 0,4 GB |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Fecha de publicacion | 2026-10-12 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: en lugar de anadir una cabeza de clasificacion sobre un encoder congelado, se afina primero el cuerpo con aprendizaje contrastivo sobre pares de frases y despues se entrena una cabeza de regresion logistica sobre los embeddings resultantes. El cuerpo es `paraphrase-mpnet-base-v2`, un encoder tipo MPNet de 12 capas y 768 dimensiones ocultas. La cabeza es una `LogisticRegression` con learning rate 0,01, mientras que el cuerpo se ajusta con un learning rate de 2e-05. El entrenamiento contrastivo usa batch de 16 y un maximo de 5000 pasos, y la fase de cabeza un batch de 32; en total 10 epocas, 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU.

Los datos proceden del dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`, derivado del TalkMoves Dataset y compuesto por intervenciones de docentes anotadas por LLM. Los tamanos de split son 13.181 ejemplos de entrenamiento (53,3 %), 3.297 de desarrollo (13,3 %) y 8.237 de test (33,3 %). La tasa base de la clase positiva es del 3,7 % global (3,8 % en train, 3,9 % en dev, 3,6 % en test), lo que indica un desbalance severo y obliga a evaluar con F1, precision, recall, ROC-AUC y average precision en lugar de con exactitud. La concordancia entre anotadores medida con alfa de Krippendorff es de 0,602, un valor moderado que actua como techo practico de rendimiento. La entrada se construye simplemente con la intervencion en crudo (`{utterance}`), sin contexto conversacional adicional.

## Capacidades

- Clasificacion binaria de una asercion concreta: determinar si una intervencion docente repite una sola palabra de una contribucion previa de un estudiante.
- Salida de etiqueta y probabilidad calibrada mediante `predict` y `predict_proba`, lo que permite fijar umbrales segun el coste relativo de falsos positivos y falsos negativos.
- Inferencia por lotes, apta para procesar corpus completos de transcripciones de aula.
- Encaje en pipelines multi-etiqueta: al ser un clasificador de una unica asercion, esta pensado para combinarse con el resto de clasificadores de la familia EduBehaviors a traves de `EduBehaviors-kit`.
- Ejecucion eficiente en CPU, dado el reducido tamano del modelo (109 M de parametros).
- Capacidad de servir como preanotador para revision humana posterior.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues: solo ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Codificado automatico de discurso de aula: dado un corpus de transcripciones del TalkMoves Dataset, el modelo etiqueta cada intervencion docente segun si repite una palabra del estudiante, reduciendo el trabajo manual de codificacion en estudios a gran escala.
- Preanotacion para codificadores humanos: se ejecuta el clasificador sobre el corpus completo y se presenta a los anotadores solo las intervenciones con probabilidad alta, priorizando la revision manual donde mas aporta.
- Investigacion educativa sobre tecnicas de "revoicing": la repeticion de una palabra del estudiante es un indicador de tecnicas de reformulacion docentes; el modelo permite cuantificar su frecuencia por profesor, sesion o asignatura.
- Formacion y retroalimentacion docente: integrado en una herramienta de analisis post-sesion, el modelo marca las intervenciones donde el docente retomo lexico del alumnado, generando informes de patrones discursivos.
- Construccion de pipelines multi-asercion: combinado con otros clasificadores de la familia EduBehaviors en `EduBehaviors-kit`, permite generar una representacion completa de movimientos discursivos por turno de habla.
- Analisis longitudinal de programas educativos: con una tasa base del 3,6 % en test, el modelo es util para detectar cambios en la frecuencia de esta conducta antes y despues de una intervencion formativa, apoyandose en el ROC-AUC de 0,9566 como indicador de ranking.
- Procesamiento por lotes en infraestructura modesta: al caber en CPU y ocupar 0,4 GB de repositorio, se puede desplegar en un servidor sin GPU para etiquetar transcripciones de forma nocturna.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente, `verified: false`). El dataset de evaluacion es `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.297 | 3,9 % | 0,561 | 0,430 | 0,487 | 0,960 | 0,519 |
| test | 8.237 | 3,6 % | 0,533 | 0,412 | 0,465 | 0,957 | 0,451 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks similares, ya que se trata de un clasificador de tarea especifica, no de un modelo de lenguaje generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en FP32 y 0,22 GB en FP16, dado que el modelo tiene 109.486.464 parametros.
- GPU recomendadas: no requiere GPU. Cualquier GPU con al menos 1 GB de memoria libre es suficiente; para maximizar throughput en lotes grandes son adecuadas T4, L4, RTX 4090, A100 o H100, aunque estan sobredimensionadas para este modelo.
- Compatibilidad con GPU de consumo: si, cabe con enorme margen en cualquier GPU de consumo, incluidas GTX 1050, RTX 3060 o superiores, y tambien en CPU.
- Opciones de despliegue: `setfit` como via principal (segun la model card), `sentence-transformers` para reutilizar el cuerpo del encoder, PyTorch directamente, y exportacion a ONNX si se necesita servir a gran escala.
- Latencia y throughput estimados: no disponible. No se publican cifras de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (StanfordSCALE assertion classifier) | 109.486.464 | 512 tokens (limite del encoder) | Clasificacion binaria de una asercion docente | No disponible | HuggingFace, 0 descargas |
| sentence-transformers/paraphrase-mpnet-base-v2 | ~109 M | 512 tokens | Embeddings de frases; requiere cabeza externa | Apache-2.0 (segun el modelo base; no confirmado en la informacion proporcionada) | HuggingFace |
| Otros clasificadores de aserciones de la familia EduBehaviors | No disponible | No disponible | Clasificacion binaria por asercion | No disponible | HuggingFace (organizacion StanfordSCALE) |

No se dispone de datos de rendimiento comparables de modelos alternativos sobre el mismo dataset, por lo que la comparacion se limita a arquitectura, tamano y licencia. No hay informacion sobre modelos externos que resuelvan exactamente esta tarea.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de anotadores LLM, no de codificadores humanos, con un alfa de Krippendorff de 0,602; esto fija un limite superior realista al rendimiento alcanzable.
- El modelo solo se entreno con intervenciones de docentes; su comportamiento sobre habla de estudiantes no ha sido probado.
- El F1 de la clase positiva es bajo (0,465 en test, 0,487 en dev), con precision de 0,533 y recall de 0,412. Es un modelo con muchos falsos positivos y falsos negativos si se usa con umbral por defecto.
- El ROC-AUC es alto (0,9566 en test) pero la average precision es de solo 0,451, coherente con una tasa base del 3,6 %. Agregar solo ROC-AUC daria una impresion exageradamente optimista del rendimiento.
- Riesgo de alucinacion: no aplica, ya que no es un modelo generativo. Sin embargo, existe riesgo de clasificacion espuria en umbrales bajos.
- La entrada se compone unicamente de la intervencion en crudo, sin contexto del dialogo previo, aunque la asercion haga referencia a una contribucion anterior del estudiante; esto limita la capacidad de resolver casos ambiguos.
- Solo soporta ingles, con la perdida de rendimiento esperable en cualquier otro idioma.
- La licencia no esta disponible, por lo que no se puede confirmar si se permite uso comercial. Se debe contactar con el autor antes de usarlo en produccion.
- El repositorio tiene 0 descargas y 0 likes, y los resultados del model-index estan marcados como no verificados.
- No existe documentacion publica sobre cuantizacion ni sobre el comportamiento del modelo fuera del dataset de evaluacion.
- La fecha de publicacion (2026) es posterior a la fecha de creacion indicada, lo que sugiere metadatos generados o revisados de forma automatica; conviene verificar la procedencia antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_repeats_a_single_word_from_a_prior_student_contribution
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Organizacion StanfordSCALE en HuggingFace: https://huggingface.co/StanfordSCALE
