# StanfordSCALE/assertion_sentence_has_answer_to_a_math_problem

# StanfordSCALE/assertion_sentence_has_answer_to_a_math_problem

## Resumen

`StanfordSCALE/assertion_sentence_has_answer_to_a_math_problem` es un clasificador binario de texto en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su única función es determinar si un turno de habla de un docente contiene implícita o explícitamente la respuesta a un problema matemático. No es un modelo generativo: se trata de un clasificador SetFit construido sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parámetros reales, según los pesos safetensors publicados en un repositorio de 0,4 GB) con una cabeza de regresión logística.

El modelo resuelve un problema concreto de investigación educativa: la codificación manual de transcripciones de aula es costosa y difícil de escalar. Etiquetar automáticamente los turnos en los que el profesor revela la respuesta permite medir patrones de andamiaje y de cesión de agencia cognitiva al alumnado sobre corpus grandes de discurso matemático. Se entrenó sobre un subconjunto anotado por LLM del dataset TalkMoves, formado por 3.430 ejemplos de entrenamiento, 858 de desarrollo y 2.146 de test.

Su relevancia es acotada y de nicho: es una pieza de infraestructura reproducible para investigación sobre diálogo en el aula, distribuida a través del paquete Python `EduBehaviors-kit`. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, no declara licencia, y sus métricas están marcadas como no verificadas en el model-index de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SetFit: encoder transformer MPNet (`paraphrase-mpnet-base-v2`) + cabeza de clasificación `LogisticRegression` |
| Parámetros totales | 109.486.464 (~109,5 M), dato real de los pesos safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el autor no documenta el truncamiento aplicado a las entradas) |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors sin variantes cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `setfit`) |
| Tarea | clasificación de texto binaria (una etiqueta: la aserción se cumple o no) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Cabeza de clasificación | LogisticRegression |
| Tamaño del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline SetFit: un encoder MPNet preentrenado que genera representaciones vectoriales de la frase, seguido de una regresión logística que produce la probabilidad de la clase positiva. El texto de entrada se construye como `{utterance}`, es decir, el turno de habla en bruto sin plantilla adicional ni tokens especiales de prompt. El entrenamiento combina una fase contrastiva sobre el cuerpo (learning rate 2e-05, batch 16, máximo 5.000 pasos) con el ajuste de la cabeza logística (learning rate 0,01, batch 32, 10 épocas, evaluación cada 100 pasos), con precisión mixta activada en GPU y semilla 20260904.

Los datos proceden de `StanfordSCALE/assertions_llm_annotated_talkmoves`, un subconjunto de turnos de profesor del TalkMoves Dataset anotado automáticamente por LLM. Las etiquetas no son humanas: el acuerdo entre anotadores, medido con alfa de Krippendorff, es de 0,409. La clase positiva es muy rara (4,7 % global; 4,8 % en entrenamiento, 5,1 % en desarrollo y 4,4 % en test), lo que condiciona por completo la interpretación de las métricas. Las columnas del dataset asociadas son `assertion_sentence_has_answer_to_a_math_problem` y `split_sentence_has_answer_to_a_math_problem`. No se documenta ningún tipo de RLHF, DPO ni innovación de decodificación, algo que no aplica a un clasificador de este tipo.

## Capacidades

- Clasificación binaria de un turno de habla docente en inglés: predice si la frase contiene la respuesta a un problema matemático (`model.predict`) y devuelve probabilidades (`model.predict_proba`).
- Funciona sobre texto en bruto, sin necesidad de preprocesado ni de formato de prompt específico.
- Salida probabilística calibrable, apta para fijar umbrales según el coste relativo de falsos positivos y falsos negativos.
- Integración con el ecosistema SetFit y `sentence-transformers` para inferencia por lotes.
- Uso previsto dentro del paquete `EduBehaviors-kit` como uno de los esquemas de aserción para codificación auditable de diálogo.
- Capacidades multilingües: no. Solo inglés.
- Tool calling / function calling: no aplica.
- Soporte de agentes o razonamiento multi-paso: no aplica.
- Generación de texto, código, matemáticas o visión: no aplica. Es exclusivamente un clasificador discriminativo.
- Modo de razonamiento explícito (thinking mode), audio o multimodalidad: no disponible / no aplica.

## Casos de uso

- Codificación automática de transcripciones de aula a escala: procesar por lotes las transcripciones del corpus TalkMoves o de otros corpus compatibles y etiquetar cada turno docente según contenga o no la respuesta al problema, sustituyendo total o parcialmente la codificación manual.
- Triaje previo a la anotación humana: con una ROC-AUC de 0,864 en test, usar `predict_proba` para priorizar los turnos con probabilidad alta y reservar la revisión humana para la franja de incertidumbre, reduciendo el coste por transcripción.
- Medición de patrones de andamiaje en investigación educativa: calcular qué proporción de los turnos del docente revela la respuesta frente a los que la retienen, para estudiar prácticas de cesión de agencia cognitiva al alumnado.
- Auditoría de calidad instruccional a nivel de centro o distrito: agregar los resultados del clasificador sobre cientos de clases para obtener indicadores comparables de discurso matemático, siempre con revisión humana por la baja precisión absoluta del modelo.
- Formación y desarrollo profesional docente: generar informes individuales que cuantifiquen en qué momentos el profesor da la respuesta de forma directa, como material de reflexión en sesiones de coaching.
- Investigación sobre anotación con LLM: el modelo y su dataset asociado permiten estudiar la fiabilidad de las anotaciones generadas por LLM (alfa de Krippendorff de 0,409) comparando etiquetas automáticas con codificación humana.
- Construcción de corpus etiquetados para evaluar otros sistemas: usar las predicciones como capa preliminar de etiquetado en pipelines de análisis de diálogo educativo que alimenten modelos posteriores.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (marcados como `verified: false`). El modelo se evalúa sobre `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision (clase positiva) | Recall (clase positiva) | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 5,1 % | 0,500 | 0,364 | 0,421 | 0,878 | 0,450 |
| test | 2.146 | 4,4 % | 0,450 | 0,479 | 0,464 | 0,864 | 0,411 |

Lectura de los datos: con una tasa base del 4,4 % en test, una precisión de 0,450 implica aproximadamente diez veces más aciertos por encima del azar, mientras que el F1 de 0,464 refleja que la tarea sigue siendo difícil y que el modelo genera falsos positivos con frecuencia. No se han publicado en la información disponible resultados comparativos con otros modelos sobre esta misma tarea.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (~0,44 GB de pesos) y del orden de 0,2-0,3 GB en fp16; con overhead de activaciones y lotes pequeños, menos de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100; el modelo no aprovecha hardware de gama alta porque está limitado por el tamaño del encoder.
- Inferencia en CPU: perfectamente viable para lotes moderados, al tratarse de un encoder de 109,5 M de parámetros.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos ocho años.
- Opciones de despliegue: librería `setfit` (`pip install setfit`) y `sentence-transformers` como backend; exportación a ONNX Runtime u otros runtimes de inferencia es posible por la naturaleza del encoder, aunque el autor no la documenta ni publica artefactos cuantizados.
- vLLM, llama.cpp, Ollama o TGI: no aplican, dado que no es un modelo generativo autorregresivo ni se distribuye en formato GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de ejemplos por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_sentence_has_answer_to_a_math_problem | 109,5 M | no disponible | Clasificación binaria de turnos de aula | no disponible | Hugging Face, 0 descargas |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base) | ~109,5 M | no disponible | Embeddings de frase genéricos | no disponible en la información proporcionada | Hugging Face |
| Otras aserciones del proyecto EduBehaviors | no disponible | no disponible | Esquemas de codificación de diálogo | no disponible | no disponible en la búsqueda |

No se han proporcionado datos de modelos alternativos que resuelvan exactamente esta tarea (clasificación de aserciones sobre discurso matemático en el aula), por lo que no es posible establecer una comparación de rendimiento con competidores directos. La comparación útil más cercana es el propio encoder base: este modelo añade una cabeza logística específica de dominio sobre un encoder genérico de 109,5 M de parámetros.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial o la redistribución presentan un riesgo jurídico. Es imprescindible contactar con la Stanford SCALE Initiative antes de cualquier despliegue en producción.
- Etiquetas generadas por LLM, no por anotadores humanos: el alfa de Krippendorff del conjunto de anotación es de 0,409, un acuerdo moderado-bajo, lo que limita el techo de rendimiento alcanzable y la fiabilidad de las métricas.
- Clase positiva extremadamente rara (4,4-4,8 %): el modelo tiene una precisión del 0,450 en test, es decir, más de la mitad de sus positivos predichos son probablemente falsos. Cualquier uso automatizado sin revisión humana debe asumir esa tasa de error.
- Dominio muy restringido: entrenado solo con turnos de profesor de matemáticas. El comportamiento sobre habla de estudiantes no se ha probado, tal como advierte el propio autor.
- Sesgos de anotación: al derivarse de anotaciones LLM sobre un único corpus (TalkMoves), puede heredar sesgos de estilo, de nivel educativo y de idioma del conjunto de origen.
- Solo inglés: cualquier transcripción en otra lengua queda fuera de su ámbito de validez.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en turnos ambiguos o fragmentarios.
- Métricas no verificadas: el model-index marca todos los resultados como `verified: false`.
- Ausencia de validación externa: 0 descargas y 0 likes implican que no hay evidencia de uso independiente ni de reproducción de resultados por terceros.
- Contexto de entrada no documentado: se desconoce la longitud máxima de turno admitida y el comportamiento ante entradas largas o truncadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StanfordSCALE/assertion_sentence_has_answer_to_a_math_problem
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Librería SetFit (necesaria para la inferencia): https://github.com/huggingface/setfit
- Cita del autor:
```bibtex
@misc{assertion_sentence_has_answer_to_a_math_problem,
  author = {Stanford SCALE Initiative},
  title  = {Assertion classifier: sentence has answer to a math problem},
  year   = {2026},
  url    = {https://huggingface.co/StanfordSCALE/assertion_sentence_has_answer_to_a_math_problem}
}
```
- Nota: los resultados de búsqueda web proporcionados no contienen enlaces relevantes a este modelo; únicamente incluyen páginas sobre Google AI Studio y claves de la API de Gemini, sin relación con la ficha.
