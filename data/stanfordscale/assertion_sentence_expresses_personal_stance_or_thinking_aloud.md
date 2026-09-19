# StanfordSCALE/assertion_sentence_expresses_personal_stance_or_thinking_aloud

## Resumen

El modelo `StanfordSCALE/assertion_sentence_expresses_personal_stance_or_thinking_aloud` es un clasificador binario de texto en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas de codificación de diálogo educativo auditables. Su tarea concreta es determinar si una intervención de un docente expresa una postura personal o un razonamiento en voz alta ("thinking aloud"), una de las múltiples aserciones que el proyecto descompone para analizar discurso de aula. Se distribuye a través del paquete Python `EduBehaviors-kit`.

Técnicamente no es un modelo generativo, sino un clasificador SetFit construido sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (MPNet) y una cabeza de regresión logística. El modelo resultante tiene 109.486.464 parámetros y un repositorio de 0,4 GB, por lo que se ejecuta sin dificultad en CPU. Se entrenó sobre un subconjunto de intervenciones de profesor del TalkMoves Dataset anotado por LLM, con 3.428 ejemplos de entrenamiento, 860 de validación y 2.146 de test.

Su relevancia actual es metodológica más que de escala: forma parte de una línea de trabajo que busca hacer auditable la codificación automática de discurso educativo, publicando las métricas por aserción, la tasa base y el acuerdo entre anotadores. Es útil para investigadores de aprendizaje automático aplicado a educación que necesiten etiquetar corpus de transcripciones de aula a escala de frase con un modelo pequeño, inspeccionable y desplegable localmente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder de frases MPNet (`paraphrase-mpnet-base-v2`) + cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el encoder base MPNet trabaja con secuencias de hasta 512 tokens según su configuración estándar, no confirmado en la ficha) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors de precisión completa, 0,4 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`setfit`), 0,4 GB |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit, que combina un ajuste contrastivo del encoder de frases con un clasificador lineal. El cuerpo es `sentence-transformers/paraphrase-mpnet-base-v2`, un transformer encoder MPNet preentrenado para similitud semántica de frases. La cabeza es una regresión logística, lo que hace que la decisión final sea lineal sobre el embedding de la frase y, por tanto, notablemente más interpretable y barata de ejecutar que un LLM generativo. Los hiperparámetros declarados son: learning rate del cuerpo 2e-05, learning rate de la cabeza 0,01, batch size 16 en la fase contrastiva y 32 en la fase de cabeza, 10 épocas, máximo de 5000 pasos en la fase contrastiva, 100 pasos máximos de evaluación, semilla 20260904 y precisión mixta activada en GPU.

Los datos de entrenamiento provienen de `StanfordSCALE/assertions_llm_annotated_talkmoves`, un subconjunto anotado por LLM de intervenciones de profesor del TalkMoves Dataset: 3.428 filas de entrenamiento (53,3 %), 860 de validación (13,4 %) y 2.146 de test (33,4 %). La entrada se construye con la intervención en bruto, sin plantilla adicional (el modelo recibe la frase tal cual). La tasa base de la etiqueta positiva es baja: 8,5 % global (7,8 % en entrenamiento, 9,4 % en validación y 9,5 % en test), lo que sitúa la tarea en un régimen claramente desbalanceado. No se declara uso de RLHF, DPO ni ninguna técnica de alineación, ya que no es un modelo generativo.

La innovación destacable no está en la arquitectura, sino en el marco: el proyecto EduBehaviors descompone el discurso de aula en aserciones atómicas y auditables, cada una con su propio clasificador, su tasa base y su acuerdo entre anotadores (alfa de Krippendorff de 0,447 para esta aserción en concreto). Las etiquetas proceden de anotadores LLM, no de codificadores humanos.

## Capacidades

- Clasificación binaria de texto en inglés: dado un enunciado, devuelve 1 si la frase expresa postura personal o razonamiento en voz alta, y 0 en caso contrario.
- Salida probabilística mediante `predict_proba`, útil para umbralizar decisiones y priorizar revisiones humanas.
- Clasificación a nivel de frase o intervención individual, sin necesidad de contexto conversacional previo (la entrada es la frase aislada).
- Ejecución en CPU con huella de memoria reducida, gracias a sus 109,5 M de parámetros.
- Integración directa con la librería `setfit` y con el paquete `EduBehaviors-kit`.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No tiene modo de razonamiento explícito (thinking mode), visión, audio ni generación de texto.
- Multilingüismo: únicamente inglés; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Codificación de discurso de aula a escala: aplicar el clasificador a transcripciones completas de clases para marcar automáticamente qué intervenciones del docente contienen postura personal o razonamiento en voz alta, reduciendo el trabajo de codificación manual en estudios con cientos de horas de grabación.
- Investigación educativa comparativa: medir la frecuencia de esta conducta entre profesores, asignaturas o centros, usando la salida probabilística para construir índices por sesión o por docente.
- Análisis de formación docente: analizar grabaciones de prácticas o sesiones de desarrollo profesional para detectar cuánto modela el docente su propio pensamiento frente a la clase, un indicador habitual en marcos de enseñanza dialogada.
- Preetiquetado para anotación humana: usar el modelo como primer paso de un pipeline de anotación, dejando que los codificadores humanos revisen únicamente los casos cercanos al umbral y reduciendo el coste por hora de transcripción.
- Auditoría de pipelines de anotación con LLM: como la etiqueta de referencia procede de anotadores LLM con un alfa de Krippendorff de 0,447, el modelo sirve como segunda opinión independiente para detectar desacuerdos sistemáticos en el etiquetado automático.
- Filtrado de corpus para análisis posteriores: descartar o aislar intervenciones que expresan postura personal antes de aplicar métricas de calidad del discurso, evitando que este tipo de enunciados contamine indicadores de otra naturaleza.
- Cuadros de mando docentes: integrar la probabilidad del modelo en paneles que resuman, sesión a sesión, la proporción de intervenciones de razonamiento en voz alta, siempre con revisión humana dado el F1 moderado del clasificador.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (los del `model-index` figuran como `verified: false`).

| Split | n | Tasa base | Precision (positiva) | Recall (positiva) | F1 (positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 860 | 9,4 % | 0,484 | 0,383 | 0,428 | 0,846 | 0,466 |
| test | 2.146 | 9,5 % | 0,635 | 0,532 | 0,579 | 0,892 | 0,548 |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros), ya que se trata de un clasificador específico de tarea y no de un modelo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; según el recuento de parámetros (109.486.464) la estimación es de aproximadamente 0,44 GB en FP32, 0,22 GB en FP16 y 0,11 GB en INT8, sin contar el overhead del runtime.
- GPU recomendadas: no se especifican. Cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; también es viable en GPU integradas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en muchas integradas, dado el tamaño del repositorio (0,4 GB).
- CPU: es totalmente viable en CPU, que es el escenario de despliegue natural para este tipo de clasificador.
- Opciones de despliegue: librería `setfit` (vía `SetFitModel.from_pretrained`), `sentence-transformers` para el encoder subyacente, y exportación a ONNX si se necesita latencia mínima. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. Al procesar frases individuales con un encoder de 109,5 M de parámetros, la latencia esperada es de milisegundos por frase en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se proporcionan en la información disponible resultados de modelos comparables de la misma tarea. Como referencia estructural, se compara con su propio modelo base.

| Modelo | Parametros | Contexto | Tipo | Licencia | Metricas de la tarea |
|---|---|---|---|---|---|
| `StanfordSCALE/assertion_sentence_expresses_personal_stance_or_thinking_aloud` | 109,5 M | no disponible | SetFit (encoder + regresión logística) | no disponible | F1 0,579 / ROC-AUC 0,892 en test |
| `sentence-transformers/paraphrase-mpnet-base-v2` (modelo base) | ~109,5 M | no disponible | Encoder de frases MPNet | no disponible en la información proporcionada | no disponible (no es un clasificador) |
| Otros clasificadores de aserciones de EduBehaviors | no disponible | no disponible | SetFit | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento y evaluación proceden de anotadores LLM, no de codificadores humanos; el acuerdo entre anotadores (alfa de Krippendorff) es de 0,447, un valor bajo que acota el techo de rendimiento alcanzable y hace que parte del error sea irreducible con estos datos.
- El modelo se entrenó únicamente con intervenciones de profesores. Su comportamiento sobre habla de estudiantes no ha sido evaluado.
- Tarea fuertemente desbalanceada: la clase positiva representa entre el 8,5 % y el 9,5 % de los ejemplos. Un clasificador trivial que prediga siempre la clase negativa acertaría en torno al 90 % de los casos, por lo que la exactitud (accuracy) es una métrica engañosa aquí; hay que usar F1 de la clase positiva, ROC-AUC o average precision.
- El rendimiento en test (F1 0,579) indica una precisión y exhaustividad moderadas: aproximadamente un 36 % de las predicciones positivas son erróneas y se pierde cerca de la mitad de los casos positivos reales. No es adecuado para decisiones automatizadas sin revisión humana.
- La generalización a dominios distintos del corpus TalkMoves (otros niveles educativos, otras lenguas, otras materias) es desconocida.
- Modelo monolingüe en inglés: no procesa ni ha sido evaluado en castellano ni en otros idiomas.
- La licencia no está declarada en la información disponible, por lo que no puede confirmarse que el uso comercial esté permitido; conviene contactar con el autor antes de usarlo en producción.
- Riesgo de alucinación: no aplica como tal, al no ser un modelo generativo; el riesgo equivalente es la clasificación errónea, especialmente en frases ambiguas o muy cortas.
- La información de la model card está fechada en 2026 y el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_expresses_personal_stance_or_thinking_aloud
- Dataset de anotación: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio): https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit`: no disponible (no se proporciona URL)
- Paper o publicación técnica: no disponible
- Demo o espacio de inferencia: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a anuncios del Ministerio de Asuntos Internos de Rumanía, sin relación con el modelo)
