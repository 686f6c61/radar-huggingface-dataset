# StanfordSCALE/assertion_sentence_narrates_ongoing_action

## Resumen

`StanfordSCALE/assertion_sentence_narrates_ongoing_action` es un clasificador binario de texto en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors ("Assertion-based schemas for auditable dialogue coding"). Su tarea es determinar si un enunciado de un docente narra una acción que está ocurriendo en ese momento en el aula (por ejemplo, "Im passing out the pink papers which have information"). No es un modelo generativo: es un codificador de frases con una cabeza de clasificación logística, entrenado con SetFit.

Técnicamente se apoya en el codificador `sentence-transformers/paraphrase-mpnet-base-v2` como cuerpo (body), al que se añade una regresión logística como cabeza. El conjunto de pesos tiene 109.486.464 parámetros y el repositorio ocupa 0,4 GB. El entrenamiento se hizo sobre un subconjunto anotado por LLM de intervenciones de profesorado del TalkMoves Dataset, con 3.430 ejemplos de entrenamiento, 858 de desarrollo y 2.146 de test.

Su relevancia es de nicho pero concreta: permite codificar automáticamente conductas discursivas docentes a escala, dentro de un esquema auditable de aserciones sobre diálogo educativo. El modelo está pensado para usarse a través del paquete Python `EduBehaviors-kit` y no como modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (MPNet) + cabeza de regresión logística, entrenado con SetFit (contrastive fine-tuning + clasificador lineal) |
| Parametros totales | 109.486.464 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base `paraphrase-mpnet-base-v2` admite secuencias de hasta 512 tokens |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 0,4 GB) |
| Tarea | Clasificación de texto binaria (`text-classification`) |
| Etiqueta positiva | `assertion_sentence_narrates_ongoing_action` |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Librería | setfit |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: en una primera fase se ajusta el cuerpo MPNet con aprendizaje contrastivo sobre pares de frases (learning rate 2e-05, batch size 16, hasta 5.000 pasos, 10 épocas, precisión mixta activada en GPU, semilla 20260904), y después se entrena una cabeza `LogisticRegression` sobre los embeddings resultantes (learning rate 0.01, batch size 32, eval max steps 100). El texto de entrada se construye simplemente como `{utterance}`, sin plantilla adicional ni prefijo de tarea.

Los datos proceden de un subconjunto anotado por anotadores LLM de intervenciones de docentes del TalkMoves Dataset: 3.430 filas de entrenamiento (53,3 %), 858 de desarrollo (13,3 %) y 2.146 de test (33,4 %). La tasa base de la clase positiva es muy baja: 3,1 % global (2,8 % en train, 3,7 % en dev, 3,3 % en test). El acuerdo entre anotadores para esta aserción es de alfa de Krippendorff = 0,594, un valor moderado que condiciona el techo de rendimiento alcanzable. No se documenta uso de RLHF ni DPO, ni innovaciones de decodificación (no aplica a un clasificador).

## Capacidades

- Clasificación binaria de un único enunciado en inglés: devuelve 1 cuando la frase narra una acción en curso del docente y 0 en caso contrario.
- Salida probabilística mediante `predict_proba`, con dos valores `[P(no), P(yes)]`, útil para umbralizar y para revisiones humanas asistidas.
- Codificación de conductas docentes dentro del esquema de aserciones EduBehaviors, con columnas asociadas `assertion_sentence_narrates_ongoing_action` y `split_sentence_narrates_ongoing_action`.
- Integración vía `setfit.SetFitModel.from_pretrained(...)` y uso previsto a través del paquete `EduBehaviors-kit`.
- No soporta generación de texto, razonamiento multi-paso, tool calling, function calling, agentes, visión, audio ni capacidades multilingües.
- No se documenta modo "thinking" ni ninguna capacidad especial adicional.

## Casos de uso

- Codificación automática de transcripciones de aula a escala: aplicar el clasificador a corpus de intervenciones docentes para etiquetar cuándo el profesor narra una acción en curso, sustituyendo total o parcialmente la codificación manual en estudios con miles de turnos de habla.
- Pre-anotación para codificación humana: usar la probabilidad de salida como señal de priorización y reservar la revisión humana para los casos cercanos al umbral, dado que la precisión (0,765 en test) es bastante superior al recall (0,366).
- Investigación en discurso educativo: estudiar la frecuencia y distribución de narraciones de acción en docentes dentro del marco de aserciones de EduBehaviors, con resultados auditables y reproducibles.
- Evaluación de formación docente: analizar si las narraciones de acción en el aula cambian tras una intervención formativa, comparando proporciones antes y después en cohortes de profesores.
- Filtrado y curación de datasets educativos: descartar o etiquetar segmentos que contienen narración de acción en curso antes de entrenar otros modelos sobre diálogo de aula.
- Auditoría de anotaciones automáticas: dado que las etiquetas originales provienen de anotadores LLM, el clasificador permite reproducir el criterio de anotación de forma barata y comprobar la consistencia del etiquetado en nuevos lotes.
- Análisis longitudinal de prácticas docentes: procesar transcripciones de distintos cursos o asignaturas con un criterio uniforme, asumiendo que el modelo solo se ha validado en intervenciones de docentes y en inglés.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente). Tarea: clasificación binaria sobre `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision (clase positiva) | Recall (clase positiva) | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 3,7 % | 0,778 | 0,438 | 0,560 | 0,920 | 0,641 |
| test | 2.146 | 3,3 % | 0,7647 | 0,3662 | 0,4952 | 0,8908 | 0,583 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: en fp32 los 109,5 M de parámetros ocupan aproximadamente 437 MB; en fp16, unos 219 MB. Con activaciones y overhead de runtime, menos de 1 GB en fp32 y del orden de 0,5 GB en fp16 (estimación basada en el recuento real de parámetros; no publicada por el autor).
- GPU recomendadas: cualquiera con al menos 2-4 GB de memoria. No requiere A100 ni H100; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna son suficientes.
- Cabe sobradamente en GPU de consumo e incluso en inferencia solo CPU: es un encoder de 109 M de parámetros, no un modelo generativo.
- Opciones de despliegue: `setfit` (librería oficial, `SetFitModel.from_pretrained`), `sentence-transformers` como backend del cuerpo, y exportación a ONNX mediante el ecosistema de Optimum si se necesita servir con ONNX Runtime. vLLM, TGI y Ollama están orientados a modelos generativos y no aplican a este clasificador.
- Latencia y throughput: no se han publicado medidas. Como referencia de tamaño, un encoder de ~110 M de parámetros suele procesar lotes de decenas de miles de frases por minuto en una GPU de consumo actual (estimación no verificada, no medida por el autor).
- Repositorio de pesos: 0,4 GB, por lo que el despliegue y el versionado son triviales en cualquier pipeline de CI.

## Comparativa con modelos similares

No hay datos publicados de rendimiento de modelos alternativos en la información disponible, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_sentence_narrates_ongoing_action | 109,5 M | No indicado (base MPNet: 512 tokens) | Clasificación binaria de una aserción docente | no disponible | HuggingFace, librería setfit |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base sin ajustar) | ~109 M | 512 tokens | Embeddings de frases de propósito general | Apache-2.0 (según el modelo base) | HuggingFace |
| Otros clasificadores de aserciones de la familia StanfordSCALE/EduBehaviors | no disponible | no disponible | Cada uno sobre una aserción distinta | no disponible | HuggingFace |
| Anotación zero-shot o few-shot con un LLM generalista | no disponible | no disponible | Etiquetado del mismo esquema | no disponible | Depende del proveedor |

Rendimiento comparado: no disponible. No se han publicado métricas de estos modelos sobre `assertions_llm_annotated_talkmoves`.

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores es de alfa de Krippendorff = 0,594, lo que indica una fiabilidad moderada y limita el techo de rendimiento del clasificador.
- El modelo se entrenó únicamente con intervenciones de docentes. Su comportamiento sobre habla de estudiantes no ha sido probado.
- Recall bajo en la clase positiva (0,366 en test) con precision alta (0,765): el modelo tiende a no detectar muchos casos positivos. Si se usa para recuperación exhaustiva, hay que asumir falsos negativos numerosos y valorar el ajuste del umbral.
- F1 de la clase positiva de 0,495 en test, sobre una tasa base del 3,3 %. Un clasificador trivial que prediga siempre la clase negativa obtendría una exactitud alta pero F1 nulo, así que la exactitud no es una métrica informativa aquí.
- Solo inglés. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Licencia no disponible en la información proporcionada: antes de un uso comercial hay que verificar las condiciones con el autor, ya que no se puede asumir uso libre.
- Los resultados del model-index están marcados como no verificados; el ROC-AUC relativamente alto (0,891) convive con un F1 bajo, lo que sugiere que el modelo ordena bien las probabilidades pero necesita calibración de umbral para clasificar.
- Riesgo de sobreajuste al dominio del TalkMoves Dataset (un contexto educativo concreto); el rendimiento en otras aulas, niveles educativos o asignaturas no está medido.
- Las muestras de prueba incluyen coloquialismos sin apóstrofo ("Im passing out..."), lo que refleja el preprocesado real del corpus; entradas con puntuación y formato distintos pueden comportarse de manera diferente.
- No se documentan sesgos demográficos, pero al tratarse de un corpus de aula estadounidense y en inglés, pueden aparecer sesgos ligados al idioma, la variedad dialectal y el contexto cultural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_narrates_ongoing_action
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Dataset original TalkMoves: https://github.com/SumnerLab/TalkMoves
- Repositorio de SetFit (librería de inferencia y entrenamiento): https://github.com/huggingface/setfit
- Cita del autor (BibTeX en la model card): Stanford SCALE Initiative, "Assertion classifier: sentence narrates ongoing action", 2026.
- Enlaces al paquete `EduBehaviors-kit`: no disponible (se menciona en la model card pero no se proporciona URL).
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo, al proyecto EduBehaviors ni al dataset TalkMoves; los resultados devueltos no guardan relación con el tema.
