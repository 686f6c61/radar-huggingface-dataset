# StanfordSCALE/assertion_asks_one_or_more_students_for_the_definition_of_a_math_term

## Resumen

Este modelo es un clasificador de texto binario de la familia StanfordSCALE, desarrollado por la Stanford SCALE Initiative, que detecta una conducta discursiva muy concreta en el aula: si una intervención docente pide a uno o varios estudiantes la definición de un término matemático. Forma parte de EduBehaviors, un conjunto de esquemas basados en aserciones (*assertions*) para el codificado auditable de diálogo educativo, y se usa a través del paquete Python `EduBehaviors-kit`. No es un modelo generativo: es un clasificador de una única etiqueta sobre una intervención aislada.

Técnicamente se apoya en SetFit, una técnica de ajuste few-shot que combina una fase contrastiva sobre un encoder de frases y una cabeza de clasificación ligera. El cuerpo es `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet) y la cabeza es una regresión logística. El repositorio declara 109.486.464 parámetros en formato safetensors y ocupa 0,4 GB, lo que lo sitúa en la gama de modelos de codificación de ~110 millones de parámetros, ejecutables incluso en CPU.

Su relevancia es acotada pero real: el etiquetado manual de discurso de aula es caro y lento, y este clasificador permite prefiltrar o anotar automáticamente grandes volúmenes de transcripciones. Conviene interpretarlo con cautela, porque la clase positiva es extremadamente rara (0,2 % de base rate global), las etiquetas provienen de anotadores LLM (alfa de Krippendorff de 0,576) y el conjunto de test contiene solo 26 ejemplos positivos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder MPNet (`paraphrase-mpnet-base-v2`) con cabeza de regresión logística, entrenado con SetFit |
| Parámetros totales | 109.486.464 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la entrada es una única intervención de texto; el modelo base MPNet trabaja habitualmente con secuencias cortas, pero el dato no se declara en la información proporcionada) |
| Tipos de cuantización | No disponible (modelo de clasificación; no se declaran variantes cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `setfit`) |

## Arquitectura y entrenamiento

El modelo sigue el esquema SetFit: en primer lugar se ajusta el encoder de frases `sentence-transformers/paraphrase-mpnet-base-v2` mediante aprendizaje contrastivo (batch size 16, learning rate 2e-05, hasta 5000 pasos, 10 épocas, precisión mixta en GPU), y después se entrena una cabeza `LogisticRegression` (learning rate 0,01, batch size 32) sobre las representaciones generadas. La semilla declarada es 20260904. El texto de entrada se construye únicamente con la intervención, sin plantilla adicional.

Los datos proceden de `StanfordSCALE/assertions_llm_annotated_talkmoves`, un subconjunto anotado por LLM de intervenciones de profesorado del TalkMoves Dataset: 13.184 filas de entrenamiento (53,3 %), 3.295 de desarrollo (13,3 %) y 8.236 de test (33,3 %). La tasa base de la aserción es del 0,2 % global (0,2 % en train, 0,1 % en dev, 0,3 % en test), un desequilibrio extremo que condiciona por completo el rendimiento. Las columnas del dataset son `assertion_asks_one_or_more_students_for_the_definition_of_a_math_term` y `split_asks_one_or_more_students_for_the_definition_of_a_math_term`, y la concordancia entre anotadores medida con alfa de Krippendorff es 0,576.

## Capacidades

- Clasificación binaria de una intervención docente aislada: devuelve 1 cuando la aserción se cumple y 0 cuando no, con probabilidades vía `predict_proba`.
- Detección de una conducta pedagógica específica: solicitar a uno o varios estudiantes la definición de un término matemático.
- Inferencia rápida sobre lotes de texto, al ser un encoder de ~110 millones de parámetros con cabeza lineal.
- Integración en flujos de anotación de discurso de aula mediante el paquete `EduBehaviors-kit`.
- Uso como etapa de prefilTRADO o priorización dentro de pipelines de codificación de transcripciones educativas.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, capacidades de agente, visión ni audio.
- Solo inglés; no se declara soporte multilingüe.

## Casos de uso

- Investigación en discurso de aula: clasificar transcripciones completas de sesiones de matemáticas para cuantificar con qué frecuencia el profesorado pide definiciones de términos, generando series temporales comparables entre aulas y cursos.
- Prefiltrado de anotación humana: usar el clasificador para reducir el volumen de intervenciones que revisan los codificadores humanos, con umbral alto para priorizar precisión y no saturar al equipo.
- Formación y desarrollo profesional docente: analizar grabaciones de clase y devolver al profesorado ejemplos concretos de intervenciones que solicitan definiciones, como retroalimentación estructurada.
- Analítica curricular a escala de centro o distrito: procesar miles de transcripciones para medir la presencia de prácticas de vocabulario matemático y detectar diferencias entre departamentos.
- Construcción de datasets etiquetados: generar etiquetas preliminares de esta conducta para entrenar o evaluar clasificadores posteriores, siempre con validación humana de una muestra.
- Monitorización en tiempo casi real: al ser un modelo pequeño (~110 millones de parámetros), puede ejecutarse por lotes en CPU o en una GPU modesta dentro de un sistema de análisis de sesiones grabadas.
- Auditoría de material didáctico transcrito: detectar en guiones y planes de clase las intervenciones que solicitan definiciones, como comprobación de cobertura terminológica.
- Estudios de reproducibilidad: replicar análisis de TalkMoves con un codificador abierto y determinista (semilla fija declarada) en lugar de anotación manual no reproducible.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por terceros):

| Split | n | Base rate | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.295 | 0,1 % | 0,500 | 0,667 | 0,571 | 0,888 | 0,334 |
| test | 8.236 | 0,3 % | 0,750 | 0,346 | 0,474 | 0,890 | 0,569 |

En el split de test con 26 ejemplos positivos, el modelo logra una precisión de 0,75 pero un recall de 0,346, es decir, deja sin detectar aproximadamente dos tercios de los casos positivos. El ROC-AUC de 0,890 indica una capacidad de ordenación razonable, pero el F1 de 0,474 refleja el fuerte desequilibrio de clases. No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo conjunto.

## Requisitos de hardware

- VRAM estimada: entorno a 0,44 GB en fp32 y 0,22 GB en fp16 para los 109,5 millones de parámetros, más el espacio del tokenizador y del runtime.
- GPU recomendadas: ninguna en particular; cualquier GPU con al menos 1-2 GB de memoria libre es suficiente (por ejemplo, GTX 1650, T4, RTX 3060 o superiores). En la práctica, la CPU es una opción perfectamente válida.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: `setfit` (vía `SetFitModel.from_pretrained`) sobre PyTorch, y por extensión el ecosistema `sentence-transformers`/`transformers`. No aplican servidores de inferencia para modelos generativos como vLLM, TGI u Ollama en su configuración habitual.
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de un encoder de ~110 millones de parámetros con cabeza logística, el procesamiento por lotes en CPU es viable y en GPU el coste por lote es muy bajo, pero no hay cifras declaradas.
- Almacenamiento: 0,4 GB de repositorio.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas sobre el mismo conjunto, por lo que la comparación cuantitativa no está disponible. Como referencias estructurales:

| Modelo | Tipo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (StanfordSCALE) | Clasificador SetFit (MPNet + regresión logística) | 109.486.464 | No disponible | F1 0,474 / ROC-AUC 0,890 en test | No disponible | HuggingFace |
| `sentence-transformers/paraphrase-mpnet-base-v2` | Encoder de frases base | No disponible en la información proporcionada | No disponible | No aplica sin cabeza supervisada | No disponible en la información proporcionada | HuggingFace |
| Anotación por LLM (etiquetas del dataset) | Anotador generativo | No disponible | No disponible | Alfa de Krippendorff 0,576 frente a anotadores | No disponible | Uso interno en la elaboración del dataset |
| Otros clasificadores de aserciones de StanfordSCALE | Clasificador SetFit | No disponible | No disponible | No disponible | No disponible | HuggingFace (misma organización) |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento y evaluación provienen de anotadores LLM, no de codificadores humanos, con una concordancia entre anotadores (alfa de Krippendorff) de solo 0,576. El techo de calidad del modelo está acotado por ese ruido de etiquetado.
- El split de test contiene únicamente 26 ejemplos positivos, por lo que las métricas declaradas tienen un margen de error amplio y no deben tratarse como estimaciones estables.
- Recall bajo: 0,346 en test. El modelo omite la mayoría de los casos positivos reales; usarlo como filtro exhaustivo produciría falsos negativos sistemáticos.
- Desequilibrio extremo de clases: la tasa base es del 0,2 % global. Incluso una precisión alta puede convivir con muchas falsas alarmas en volúmenes grandes si no se ajusta el umbral.
- Entrenado solo con intervenciones de profesorado. El comportamiento sobre habla de estudiantes no está probado.
- Idioma: únicamente inglés. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Licencia no especificada en la información disponible: la ausencia de licencia explícita genera incertidumbre jurídica para uso comercial o redistribución. Conviene contactar con el autor antes de integrarlo en producción.
- No es un modelo generativo: no admite preguntas abiertas, resúmenes ni explicaciones. Solo emite una etiqueta binaria y su probabilidad asociada.
- Sin descargas ni valoraciones en el momento de la consulta (0 descargas, 0 likes): no hay evidencia de uso en producción ni validación independiente por parte de la comunidad.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de sobreinterpretación de los resultados si se presentan como medición objetiva de la calidad docente sin validación humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_asks_one_or_more_students_for_the_definition_of_a_math_term
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio): https://github.com/SumnerLab/TalkMoves
- Paquete de uso: `EduBehaviors-kit` (no se proporciona URL en la información disponible)
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a sitios sin relación con la ficha.
