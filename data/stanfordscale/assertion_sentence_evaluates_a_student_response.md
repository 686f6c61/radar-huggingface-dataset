# StanfordSCALE/assertion_sentence_evaluates_a_student_response

## Resumen

StanfordSCALE/assertion_sentence_evaluates_a_student_response es un clasificador binario de texto en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificación auditable de diálogo educativo. La tarea concreta que resuelve es determinar si un enunciado de un docente evalúa la respuesta de un estudiante: la aserción se etiqueta como verdadera cuando la intervención del profesor valora, confirma o juzga la contribución previa de un alumno. Se publica en HuggingFace y está pensado para consumirse desde el paquete Python EduBehaviors-kit.

Técnicamente es un modelo SetFit de 109.486.464 parámetros: un encoder MPNet preentrenado (sentence-transformers/paraphrase-mpnet-base-v2) afinado en dos fases, una contrastiva sobre el cuerpo del modelo y otra de ajuste de una cabeza de regresión logística. El entrenamiento se realizó sobre un subconjunto anotado automáticamente con LLM de intervenciones docentes del corpus TalkMoves: 3.430 ejemplos de train, 860 de dev y 2.144 de test.

Su relevancia es metodológica más que de rendimiento: forma parte de una familia de clasificadores de aserciones que permiten auditar y descomponer anotaciones generadas por LLM en unidades verificables. El propio autor advierte que el F1 de test (0,391) es insuficiente para usarlo de forma autónoma, por lo que su valor está en pipelines híbridos con revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder transformer MPNet (12 capas, 768 dimensiones de embedding) con fase contrastiva + cabeza de regresión logística |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha del repositorio (el encoder MPNet base trabaja con ventanas cortas de secuencia) |
| Tipos de cuantizacion | no disponible; el autor no publica versiones cuantizadas |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (encoder) junto con la cabeza SetFit/regresión logística; tamaño del repositorio 0,4 GB |
| Tarea | text-classification (clasificación binaria de una aserción) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Libreria | setfit |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit, que combina el ajuste contrastivo de un encoder de frases con un clasificador lineal ligero. El cuerpo es paraphrase-mpnet-base-v2, un encoder MPNet afinado previamente para similitud semántica de frases; durante el entrenamiento se aplicó una fase contrastiva con learning rate de 2e-05, batch size 16, 10 épocas y un máximo de 5.000 pasos. Sobre los embeddings resultantes se ajustó una cabeza de LogisticRegression con learning rate de 0,01 y batch size 32. Se habilitó precisión mixta en GPU y se fijó la semilla 20260904. La entrada se construye pasando el enunciado tal cual, sin plantilla adicional.

Los datos proceden de un subconjunto de intervenciones docentes del TalkMoves Dataset (SumnerLab) anotado con anotadores LLM, no con codificadores humanos. La tasa base de la clase positiva es muy baja: 6,5 % global, con 6,2 % en train, 6,4 % en dev y 7,0 % en test. El acuerdo entre anotadores medido con alfa de Krippendorff es de 0,433 para esta aserción, lo que sitúa el techo práctico de aprendizaje por debajo del de una tarea con anotación humana consolidada. No se documentan fases de RLHF, DPO ni decodificación especulativa, ya que no es un modelo generativo.

## Capacidades

- Clasificación binaria de una única aserción: si un enunciado evalúa la respuesta de un estudiante (salida 1) o no (salida 0).
- Salida de probabilidad calibrable mediante `predict_proba`, lo que permite ordenar casos por confianza.
- Procesamiento de enunciados cortos en inglés, tal como aparecen en transcripciones de aula.
- Integración como componente dentro de EduBehaviors-kit y de pipelines de anotación de discurso educativo.
- No realiza generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling, function calling ni uso como agente ni razonamiento multi-paso.
- No es multilingüe: solo inglés.
- No tiene capacidades de visión ni de audio.
- No incorpora modo de pensamiento (thinking) ni salidas estructuradas más allá de la etiqueta y su probabilidad.

## Casos de uso

- Codificación automática de talk moves en investigación educativa: procesar transcripciones de aula y marcar qué intervenciones docentes evalúan la respuesta de un alumno, reduciendo el coste frente al etiquetado manual de miles de turnos.
- Auditoría de anotaciones generadas por LLM: al proceder el propio dataset de anotadores LLM, el clasificador puede usarse como segunda opinión para detectar discrepancias sobre la aserción y priorizar qué fragmentos revisa un humano.
- Priorización de revisión humana por confianza: aunque el F1 de test es bajo (0,391), el ROC-AUC de 0,815 permite ordenar casos por `predict_proba` y reservar el esfuerzo de anotación para las predicciones intermedias.
- Análisis de patrones instruccionales a escala de centro o distrito: agregar la proporción de intervenciones que evalúan respuestas de estudiantes para estudiar prácticas de evaluación formativa en conjuntos grandes de clases grabadas.
- Formación y desarrollo profesional docente: generar informes sobre la frecuencia con que un profesor valora las respuestas de sus alumnos, siempre con supervisión humana dado el bajo recall.
- Componente en plataformas de analítica del aprendizaje: integrar el clasificador en un servicio interno que etiquete turnos en tiempo casi real y alimente paneles de calidad del diálogo, con umbrales conservadores para limitar falsos positivos.
- Filtrado previo en pipelines de anotación híbrida humano-LLM: usar el modelo como primera pasada sobre corpus docentes y derivar a anotadores humanos solo el subconjunto dudoso.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Conjunto | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 860 | 6,4 % | 0,588 | 0,364 | 0,449 | 0,855 | 0,501 |
| test | 2.144 | 7,0 % | 0,472 | 0,333 | 0,391 | 0,815 | 0,374 |

Métricas de test registradas en el model-index: F1 0,3906, precision 0,4717, recall 0,3333, ROC-AUC 0,8147. No se han publicado resultados de benchmarks en la informacion disponible más allá de los anteriores (no hay MMLU, HumanEval, GSM8K ni comparaciones con terceros).

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,44 GB de pesos en fp32 y 0,22 GB en fp16; con activaciones y overhead, menos de 1 GB en la práctica.
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria es suficiente (por ejemplo T4, GTX 1650, RTX 3060). Una RTX 4090, A100 o H100 están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, e incluso en iGPU con suficiente memoria compartida.
- Inferencia en CPU: viable, es el escenario habitual para modelos SetFit de este tamaño; se recomienda procesar por lotes.
- Opciones de despliegue: librería `setfit` (`SetFitModel.from_pretrained`), `sentence-transformers` junto con scikit-learn para la cabeza, exportación a ONNX Runtime para servir latencia baja, o empaquetado en un servicio FastAPI. No hay soporte en vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo generativo ni publicarse en GGUF.
- Latencia y throughput estimados: no disponible, el autor no publica medidas. Cualquier cifra dependerá del hardware, del tamaño de lote y de la longitud de los enunciados.

## Comparativa con modelos similares

No se han identificado en la informacion disponible alternativas publicadas que resuelvan exactamente la misma aserción con métricas comparables. La comparación más directa es con su propio encoder base y con la ausencia de referencias:

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_sentence_evaluates_a_student_response | 109,5 M | no disponible | F1 test 0,391; ROC-AUC test 0,815 | no disponible | HuggingFace, via setfit |
| sentence-transformers/paraphrase-mpnet-base-v2 (encoder base) | 109,5 M | no disponible | no disponible para esta aserción | apache-2.0 (según su propia ficha) | HuggingFace, sentence-transformers |
| Otros clasificadores de aserciones de EduBehaviors | no disponible | no disponible | no disponible | no disponible | no disponible |
| Anotador LLM usado para generar las etiquetas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos; el alfa de Krippendorff de la aserción es 0,433, lo que indica un acuerdo moderado y un techo de rendimiento limitado.
- El propio autor advierte que el F1 de test de 0,391 no es suficiente para usar el modelo de forma autónoma.
- Entrenado únicamente con intervenciones de docentes: el comportamiento sobre habla de estudiantes no está probado.
- Tasa base muy baja (6,5 % global): con una precisión de 0,472 y un recall de 0,333 en test, se producen tanto falsos positivos como falsos negativos en proporción apreciable; conviene fijar umbrales según el coste relativo de cada error.
- Riesgo de sobreajuste al dominio y al estilo de anotación del corpus TalkMoves; no hay evidencia de generalización a otras aulas, asignaturas, niveles educativos o variantes dialectales del inglés.
- Modelo monolingüe en inglés; cualquier uso en castellano u otros idiomas carece de soporte.
- No se especifica licencia, por lo que el uso comercial queda en situación de incertidumbre legal; debe confirmarse con el autor antes de integrarlo en un producto.
- Repositorio sin descargas ni likes y con fecha de creación reciente: no hay validación comunitaria independiente de las métricas declaradas.
- No genera texto: no puede sustituir a un LLM anotador, solo complementarlo o auditarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_evaluates_a_student_response
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Dataset original TalkMoves: https://github.com/SumnerLab/TalkMoves
- Librería SetFit: https://github.com/huggingface/setfit
- Cita del autor: Stanford SCALE Initiative, «Assertion classifier: sentence evaluates a student response», 2026.
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces recuperados no guardaban relación con la ficha.
