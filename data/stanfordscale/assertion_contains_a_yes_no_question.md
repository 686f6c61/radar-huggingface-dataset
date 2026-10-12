# StanfordSCALE/assertion_contains_a_yes_no_question

## Resumen

`assertion_contains_a_yes_no_question` es un clasificador binario de texto en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificación auditable de diálogo en el aula. El modelo responde a una única pregunta: si un enunciado (utterance) contiene o no una pregunta de sí/no. Forma parte del conjunto de aserciones top-down `td` con identificador `td__the_utterance_contains_a_yes_no_question`, y se utiliza a través del paquete Python `EduBehaviors-kit`.

Técnicamente es un modelo SetFit, no un transformer generativo: sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (familia MPNet) se realiza un ajuste contrastivo y se entrena después una cabeza de regresión logística. El conjunto suma 109.486.464 parámetros y el repositorio ocupa 0,4 GB. Se entrena y evalúa con el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`, derivado del TalkMoves Dataset y etiquetado por anotadores LLM con un alfa de Krippendorff de 0,852 para esta aserción.

Su relevancia es acotada pero práctica: automatiza el codificado de movimientos discursivos docentes en investigación educativa y en herramientas de formación del profesorado, con un F1 de 0,8622 y un ROC-AUC de 0,9704 en el conjunto de test. No cubre generación de texto, tool calling ni otras aserciones; está entrenado solo con intervenciones de docentes y únicamente en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SetFit: encoder MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) con cabeza de regresión logística |
| Parámetros totales | 109.486.464 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | text-classification (clasificación binaria) |
| Etiqueta positiva | el enunciado contiene una pregunta de sí/no |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Librería | setfit |
| Tamaño del repositorio | 0,4 GB |
| Fecha de publicación | 12 de octubre de 2026 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el procedimiento SetFit en dos fases. Primero se afina el cuerpo (encoder) `sentence-transformers/paraphrase-mpnet-base-v2` de forma contrastiva, con pares de texto generados a partir de las etiquetas, durante un máximo de 5000 pasos, con batch size 16, learning rate del cuerpo de 2e-05, 10 épocas y precisión mixta activada en GPU. Después se entrena una cabeza de `LogisticRegression` con learning rate 0,01 y batch size 32, con `eval_max_steps` de 100. La semilla utilizada es 20260904. El texto de entrada se pasa tal cual, sin plantilla de prompt: el modelo recibe directamente el enunciado.

Los datos proceden de `StanfordSCALE/assertions_llm_annotated_talkmoves`, un subconjunto de enunciados de docentes del TalkMoves Dataset anotado por LLM. El reparto es de 13.181 ejemplos de entrenamiento (53,3 %), 3.295 de desarrollo (13,3 %) y 8.239 de test (33,3 %). La tasa base de la clase positiva es del 9,0 % global (8,8 % en train, 10,2 % en dev y 8,9 % en test), es decir, un problema claramente desbalanceado. No se documenta en la información disponible el número de tokens de entrenamiento ni el uso de RLHF o DPO, que no aplicarían a este tipo de clasificador.

## Capacidades

- Clasificación binaria de un enunciado en inglés según la aserción "contiene una pregunta de sí/no": `predict` devuelve 0 o 1 y `predict_proba` devuelve la probabilidad de cada clase.
- Codificación de movimientos discursivos docentes en el marco EduBehaviors, combinable con otras aserciones del conjunto `td` para construir un etiquetado auditable multi-aspecto.
- Funciona sobre texto de entrada directo, sin instrucciones ni formato conversacional.
- Inferencia por lotes sobre listas de enunciados, apta para procesar corpus completos de transcripciones.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, function calling, capacidades de agente, visión, audio ni modo thinking.
- Capacidad multilingüe: no, el modelo está declarado únicamente para inglés.
- Capacidad específica: distinción de la forma interrogativa de sí/no, que es una señal útil para medir el patrón de indagación del docente en el aula.

## Casos de uso

- Codificación automática de talk moves en investigación educativa: permite clasificar transcripciones completas de clases y calcular la proporción de intervenciones docentes que contienen preguntas de sí/no, sustituyendo parte del trabajo de codificación manual.
- Análisis de patrones de indagación en el aula: agregando las predicciones por sesión, docente o asignatura se pueden estudiar diferencias en el uso de preguntas cerradas frente a preguntas abiertas.
- Formación y retroalimentación docente: integrado en una herramienta de análisis de grabaciones, el modelo puede señalar momentos concretos en los que el docente formula preguntas de sí/no, útiles para revisar la calidad del diálogo en clase.
- Preprocesado en pipelines de learning analytics: el clasificador puede etiquetar grandes volúmenes de transcripciones antes de un análisis cualitativo o de un modelado estadístico posterior.
- Filtrado y muestreo de corpus: seleccionar subconjuntos de transcripciones con alta densidad de preguntas de sí/no para estudios dirigidos o para anotación humana posterior.
- Construcción de esquemas de codificación auditables: al ser una aserción concreta y documentada, se puede encadenar con el resto de clasificadores de EduBehaviors-kit para reconstruir códigos de diálogo de forma trazable.
- Despliegue en entornos con recursos limitados: con 109,5 millones de parámetros y 0,4 GB de repositorio, se puede ejecutar en CPU dentro de un servicio de investigación sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor (métricas no verificadas, `verified: false`). Para la aserción analizada, la tasa base del conjunto de test es del 8,9 %.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.295 | 10,2 % | 0,906 | 0,887 | 0,897 | 0,969 | 0,902 |
| test | 8.239 | 8,9 % | 0,886 | 0,840 | 0,862 | 0,970 | 0,905 |

Los valores publicados en el model-index corresponden al split de test: F1 0,8622, precision 0,8858, recall 0,8397 y ROC-AUC 0,9704. No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- Parámetros: 109.486.464. Peso aproximado de los pesos en FP32: unos 438 MB; en FP16, unos 219 MB. El repositorio completo ocupa 0,4 GB.
- Cabe sin problema en GPU de consumo: cualquier RTX con 4 GB o más de VRAM es suficiente, e incluso es viable la inferencia en CPU.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU moderna (RTX 3060 o superior) es sobradamente suficiente; las A100 o H100 no aportan ventaja relevante para este tamaño.
- Opciones de despliegue: la vía documentada es la librería `setfit` mediante `SetFitModel.from_pretrained(...)`. No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI, que están orientadas a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de un encoder de 109 millones de parámetros, el coste por lote es bajo, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos publicados de rendimiento de los modelos comparables en la información proporcionada. La comparación se limita a características estructurales.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_contains_a_yes_no_question | 109.486.464 | no disponible | Clasificación binaria de una aserción | no disponible | HuggingFace (setfit) |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base) | no disponible en la información proporcionada | no disponible | Embeddings de frases | no disponible en la información proporcionada | HuggingFace |
| Otras aserciones del conjunto `td` de StanfordSCALE (EduBehaviors) | no disponible | no disponible | Clasificación binaria de otras aserciones | no disponible | HuggingFace, presumiblemente en el mismo repositorio de autor, sin datos confirmados |
| Clasificadores de texto basados en BERT/RoBERTa afinados para discurso educativo | no disponible | no disponible | Clasificación de texto | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento y evaluación provienen de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores para esta aserción es de 0,852 según el alfa de Krippendorff, lo que implica un techo de rendimiento por debajo de la anotación humana perfecta.
- El modelo se entrenó únicamente con enunciados de docentes. Su comportamiento sobre habla de estudiantes no está probado.
- Fuerte desbalance de clases: solo el 9,0 % de los ejemplos son positivos. La accuracy no es una métrica informativa; deben usarse F1, precision, recall o ROC-AUC, tal como hace el propio autor.
- El modelo solo está declarado para inglés, lo que restringe su uso en aulas con otras lenguas o con transcripciones bilingües.
- Licencia no disponible: no se puede confirmar la viabilidad de uso comercial ni las condiciones de redistribución. Es un riesgo a resolver antes de cualquier despliegue en producción.
- Alcance muy estrecho: únicamente evalúa una aserción. No debe presentarse como un analizador de diálogo completo; para eso requiere combinarse con el resto de clasificadores de EduBehaviors-kit.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación, con un recall de 0,8397 en test (aproximadamente un 16 % de las preguntas de sí/no reales no se detectan).
- La longitud máxima de secuencia no está documentada en la información disponible; los enunciados largos podrían truncarse y degradar la predicción.
- Dominio restringido al discurso de aula del corpus TalkMoves. El rendimiento en otros dominios (entrevistas, foros, atención al cliente) no está medido.
- Las métricas están marcadas como no verificadas (`verified: false`) y el modelo tiene 0 descargas y 0 likes, por lo que no ha pasado por validación independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_contains_a_yes_no_question
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio GitHub): https://github.com/SumnerLab/TalkMoves
- Librería SetFit: https://github.com/huggingface/setfit
- Paquete `EduBehaviors-kit`: mencionado en la model card, sin URL disponible en la información proporcionada.
- Paper o blog del proyecto EduBehaviors: no disponible en la información proporcionada.
