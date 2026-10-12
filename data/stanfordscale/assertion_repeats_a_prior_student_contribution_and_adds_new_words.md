# StanfordSCALE/assertion_repeats_a_prior_student_contribution_and_adds_new_words

## Resumen

Este modelo es un clasificador binario de texto entrenado para detectar una aserción pedagógica concreta: si una intervención docente repite una contribución previa de un estudiante anadiendo palabras nuevas. Lo desarrolla la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas de codificación de diálogo en el aula basados en aserciones auditables. Se distribuye como un modelo SetFit sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2`, con una cabeza de regresión logística, y suma 109.486.464 parámetros.

El problema que resuelve es la codificación automática de un "talk move" específico a partir de transcripciones de clase, algo relevante para investigación educativa a escala donde la anotación manual es costosa. Se entrenó sobre un subconjunto anotado por LLM del TalkMoves Dataset, con 13.183 ejemplos de entrenamiento, 3.294 de desarrollo y 8.238 de test (33,3%), y una tasa base de la clase positiva del 3,1%.

Es un modelo de nicho, con un rendimiento modesto (F1 de 0,204 en test) y pensado para usarse dentro del paquete Python `EduBehaviors-kit`, no como clasificador generalista. Su relevancia actual radica en que forma parte de una familia de clasificadores de aserciones para codificación de discurso educativo, no en su rendimiento aislado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit (encoder transformer MPNet de `paraphrase-mpnet-base-v2` + cabeza de regresion logistica) |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por el encoder base `paraphrase-mpnet-base-v2`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el enfoque SetFit: durante una primera fase contrastiva se ajusta el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (MPNet, un transformer de codificacion tipo BERT con modelado de permutacion) con learning rate de 2e-05, batch size 16, 10 epocas y un maximo de 5.000 pasos. Sobre las representaciones resultantes se entrena una cabeza `LogisticRegression` con learning rate 0,01 y batch size 32. El entrenamiento usó precision mixta en GPU y semilla 20260904.

Los datos proceden del subconjunto `StanfordSCALE/assertions_llm_annotated_talkmoves`, derivado del TalkMoves Dataset. Las etiquetas fueron generadas por anotadores LLM (no por codificadores humanos) y el acuerdo entre anotadores medida con alfa de Krippendorff es de 0,559 para esta aserción. La entrada al modelo es la intervención del docente pasada en crudo (`{utterance}`). El entrenamiento se realizó solo sobre intervenciones de profesor.

## Capacidades

- Clasificacion binaria de una asercion concreta: determina si una intervencion del docente repite una contribucion previa de un estudiante y anade palabras nuevas.
- Prediccion de etiqueta y probabilidad mediante `predict` y `predict_proba` en la libreria SetFit.
- Integracion en el paquete Python `EduBehaviors-kit` para codificacion de dialogo educativo basada en aserciones.
- Codificacion de talk moves a partir de transcripciones de aula en ingles.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni soporte de agentes: es exclusivamente un clasificador.
- Idiomas: unicamente ingles.

## Casos de uso

- Investigacion educativa a escala: aplicar el clasificador sobre transcripciones de clase para medir la frecuencia de una estrategia docente concreta (reformular la aportacion de un alumno anadiendo informacion) en corpus grandes.
- Analisis de discurso en el aula dentro de pipelines de investigacion: usar `predict_proba` para obtener probabilidades y agregarlas por sesion, profesor o asignatura.
- Preetiquetado asistido para anotacion humana: como primera pasada en un flujo de codificacion donde un humano revisa los positivos y negativos, dado que el modelo no es fiable por si solo.
- Formacion docente: generar informes sobre el uso de talk moves en grabaciones de clase como retroalimentacion cualitativa, siempre con supervision humana.
- Investigacion sobre LLM como anotadores: al derivarse de etiquetas LLM, sirve como objeto de estudio para medir la calidad de anotaciones automaticas en educacion.
- Integracion en `EduBehaviors-kit`: encadenar este clasificador con otras aserciones del mismo conjunto para construir un esquema de codificacion auditable de una conversacion de aula.
- Estudio de clasificacion con clases muy desbalanceadas: con una tasa base del 3,1%, es util como referencia metodologica para problemas de deteccion de eventos raros en texto educativo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por terceros).

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.294 | 3,4% | 0,341 | 0,135 | 0,194 | 0,614 | 0,157 |
| test | 8.238 | 3,2% | 0,363 | 0,142 | 0,204 | 0,655 | 0,147 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros no aplicables a esta tarea).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 109,5 M de parametros y un repositorio de 0,4 GB, cabe holgadamente en cualquier GPU de consumo; en CPU la inferencia es viable para lotes pequenos.
- GPU recomendadas: cualquiera con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, T4, A10, A100 o H100 sirven, aunque las de gama alta son innecesarias para este tamano).
- Cabe sin problema en GPU de consumo: si, en practicamente cualquier modelo actual; tambien es ejecutable solo con CPU.
- Opciones de despliegue: SetFit (`pip install setfit`), `sentence-transformers` y llamada directa desde Python; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. La referencia directa es su modelo base, del que hereda el encoder:

| Modelo | Parametros | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_repeats_a_prior_student_contribution_and_adds_new_words | 109.486.464 | Clasificacion binaria de una asercion de discurso educativo | en | no disponible | HuggingFace |
| sentence-transformers/paraphrase-mpnet-base-v2 | ~109 M (encoder base) | Embeddings de frases | en | no disponible en la informacion proporcionada | HuggingFace |
| Otros clasificadores de aserciones de StanfordSCALE (misma familia EduBehaviors) | no disponible | Clasificacion de otras aserciones | en | no disponible | HuggingFace |

## Limitaciones y advertencias

- Etiquetas generadas por anotadores LLM, no por codificadores humanos; el alfa de Krippendorff de 0,559 indica un acuerdo moderado y ruido en el etiquetado.
- Rendimiento bajo: F1 de 0,204, precision 0,363 y recall 0,142 en test. El propio autor indica que el modelo no funciona lo bastante bien como para usarse de forma autonoma.
- Entrenado unicamente con intervenciones de docentes; su comportamiento sobre habla de estudiantes no ha sido probado.
- Clase muy desbalanceada (tasa base en torno al 3%), lo que infla la exactitud aparente y penaliza el recall de la clase positiva.
- Solo ingles: no hay soporte multilingue.
- Licencia no disponible; conviene aclarar los terminos de uso comercial antes de cualquier despliegue en produccion.
- No es un modelo generativo: no debe usarse para tareas de generacion, razonamiento o codigo.
- Riesgo de falsos negativos elevado por el recall bajo, lo que puede infraestimar la presencia de la estrategia docente en analisis agregados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_repeats_a_prior_student_contribution_and_adds_new_words
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base (encoder): https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Repositorio TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Paquete Python `EduBehaviors-kit`: no disponible (mencionado en la model card sin enlace)
