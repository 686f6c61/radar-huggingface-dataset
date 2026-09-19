# StanfordSCALE/assertion_sentence_has_informal_language

## Resumen

`StanfordSCALE/assertion_sentence_has_informal_language` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea es determinar si un enunciado de un docente contiene lenguaje informal, una de las múltiples «assertions» (afirmaciones verificables) que el proyecto utiliza para codificar de forma auditable el discurso en el aula. El modelo se distribuye a través de la librería SetFit y se consume con la etiqueta `assertion_sentence_has_informal_language`.

Técnicamente no es un modelo generativo: es un clasificador SetFit construido sobre el sentence-transformer `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parámetros en total según los pesos safetensors del repositorio) al que se añade una cabeza de `LogisticRegression`. El entrenamiento se realizó sobre un subconjunto anotado por LLM de intervenciones de profesorado del TalkMoves Dataset, con 3.432 ejemplos de entrenamiento, 858 de desarrollo y 2.144 de test, y una tasa base de la clase positiva del 29,3 %.

Su relevancia es fundamentalmente metodológica y de investigación: forma parte de una familia de clasificadores de «assertions» pensados para hacer reproducible y auditable el etiquetado de comportamientos educativos a escala. Conviene subrayar desde el principio que la propia model card declara una fiabilidad baja: el acuerdo entre anotadores (alfa de Krippendorff) es de -0,120 y el autor advierte explícitamente de que las predicciones y los datos subyacentes «no son fiables».

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SetFit: cuerpo *sentence-transformer* (`paraphrase-mpnet-base-v2`, MPNet) más cabeza de clasificación `LogisticRegression` |
| Parámetros totales | 109.486.464 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no lo especifica) |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `setfit`) |
| Pipeline | `text-classification` |
| Modelo base | `sentence-transformers/paraphrase-mpnet-base-v2` |
| Dataset de entrenamiento | `StanfordSCALE/assertions_llm_annotated_talkmoves` |
| Columnas de salida del dataset | `assertion_sentence_has_informal_language`, `split_sentence_has_informal_language` |
| Tamaño del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: en una primera fase, el encoder `paraphrase-mpnet-base-v2` se ajusta con aprendizaje contrastivo sobre pares de textos generados a partir de las etiquetas (10 épocas, batch size 16, un máximo de 5.000 pasos, *learning rate* del cuerpo de 2e-05, precisión mixta activada en GPU). En la segunda fase se congela el encoder y se entrena únicamente una regresión logística sobre los embeddings resultantes (batch size 32, *learning rate* de la cabeza 0,01, 100 pasos máximos de evaluación, semilla 20260904). El texto de entrada se construye concatenando únicamente el enunciado tal cual, sin plantilla adicional: `{utterance}`.

Los datos proceden del TalkMoves Dataset (utterances de profesorado) y fueron anotados por anotadores LLM, no por codificadores humanos. El conjunto se reparte en 3.432 filas de entrenamiento (53,3 %), 858 de desarrollo (13,3 %) y 2.144 de test (33,3 %), con una tasa base de la clase positiva del 29,5 % en train, 30,3 % en dev y 28,6 % en test (29,3 % global). No se documenta uso de RLHF ni DPO, ni innovaciones de decodificación (no aplica a un clasificador). El punto crítico de la fase de anotación es el acuerdo entre anotadores: el alfa de Krippendorff reportado para esta assertion es de -0,120, un valor que la propia model card califica de «poor» (pobre).

## Capacidades

- Clasificación binaria de texto: devuelve 1 cuando el enunciado contiene lenguaje informal y 0 en caso contrario.
- Puntuación de probabilidad calibrada mediante `predict_proba`, que devuelve `[[P(no), P(sí)]]`.
- Procesamiento de enunciados individuales o listas de enunciados en una sola llamada (`model.predict([text])`).
- Funcionamiento sobre texto de intervenciones docentes en inglés, en el dominio del discurso de aula.
- Integración en el paquete Python `EduBehaviors-kit` para pipelines de codificación de diálogo basados en assertions.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades de agente: es exclusivamente un clasificador.
- No se documentan capacidades multilingües: el modelo se declara únicamente para inglés.
- No se documenta ningún modo especial (thinking mode, cadena de pensamiento, etc.).

## Casos de uso

- Investigación sobre discurso en el aula a escala: clasificar automáticamente miles de intervenciones docentes para medir la prevalencia de lenguaje informal y correlacionarla con otras variables pedagógicas, aprovechando que el modelo está diseñado específicamente sobre utterances de profesorado del TalkMoves Dataset.
- Limpieza y filtrado de corpus educativos: usar la probabilidad devuelta por `predict_proba` para descartar o marcar segmentos con registro informal antes de alimentar otros analizadores lingüísticos, ajustando el umbral según la tolerancia a falsos positivos.
- Auditoría de calidad de datos en proyectos de anotación: comparar las predicciones del clasificador con las etiquetas existentes para localizar muestras dudosas, dado que la propia model card reconoce un acuerdo entre anotadores muy bajo.
- Análisis de estilo docente en programas de formación: obtener un indicador cuantitativo del registro lingüístico empleado por cada docente a lo largo de una transcripción completa y usarlo como señal complementaria en sesiones de retroalimentación.
- Enriquecimiento de transcripciones automáticas: ejecutar el clasificador sobre la salida de un sistema de ASR para añadir una capa de metadatos sobre el registro de cada turno antes de indexar el contenido.
- Estudios comparativos entre cohortes o asignaturas: aplicar el mismo clasificador a subconjuntos distintos de un corpus para comprobar si el uso de lenguaje informal varía por materia, nivel educativo o modalidad (presencial frente a en línea).
- Filtrado previo en sistemas de tutoría en línea: marcar turnos que requieran revisión por parte de un humano cuando el objetivo sea mantener un registro formal, siempre que se acepte el alto riesgo de error del modelo y se combine con revisión manual.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métrica no verificada, `verified: false`). La tarea es clasificación binaria sobre `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 30,3 % | 0,549 | 0,388 | 0,455 | 0,732 | 0,519 |
| test | 2.144 | 28,6 % | 0,568 | 0,438 | 0,494 | 0,765 | 0,554 |

Resumen del `model-index` para el split de test: F1 (clase positiva) 0,4945; precision 0,5675; recall 0,4381; ROC-AUC 0,7646. No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) porque no aplican a esta tarea ni figuran en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los 109,5 millones de parámetros ocupan aproximadamente 0,44 GB; en float16, alrededor de 0,22 GB. El repositorio completo pesa 0,4 GB.
- GPU recomendadas: no se especifica ninguna. Por tamaño, cualquier GPU con 2 GB o más de memoria es suficiente; el modelo no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, serie RTX 20xx o superior) e incluso en GPUs integradas con memoria compartida.
- Ejecución en CPU: viable, dado el reducido tamaño del encoder y que la cabeza es una regresión logística. La model card menciona precisión mixta activada en GPU durante el entrenamiento, no en inferencia.
- Opciones de despliegue: la vía documentada es `pip install setfit` y `SetFitModel.from_pretrained(...)`. Al estar construido sobre `sentence-transformers/paraphrase-mpnet-base-v2`, también puede exportarse a ONNX o servirse con Sentence Transformers, aunque estas alternativas no se documentan en la model card.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

Ejemplo de uso documentado por el autor:

```python
from setfit import SetFitModel

model = SetFitModel.from_pretrained("StanfordSCALE/assertion_sentence_has_informal_language")

text = 'So   last class we were talking about our rolling cups'
model.predict([text])        # -> array([1]) cuando la aserción se cumple
model.predict_proba([text])  # -> [[P(no), P(sí)]]
```

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| StanfordSCALE/assertion_sentence_has_informal_language | SetFit (MPNet + LogisticRegression) | 109,5 M | No disponible | No disponible | F1 0,494 / ROC-AUC 0,765 en test (declarado por el autor) | HuggingFace, librería setfit |
| sentence-transformers/paraphrase-mpnet-base-v2 | Sentence-transformer (encoder puro) | ~109 M | No disponible en la información proporcionada | No disponible en la información proporcionada | No aplica: no es un clasificador entrenado para esta tarea | HuggingFace |
| Otros clasificadores de assertions del proyecto EduBehaviors | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de modelos alternativos entrenados sobre la misma tarea (detección de lenguaje informal en utterances docentes), por lo que no es posible establecer una comparación cuantitativa fiable con terceros.

## Limitaciones y advertencias

- Fiabilidad declarada baja: la model card afirma explícitamente que «las predicciones de este modelo y los datos subyacentes no son fiables».
- Anotación por LLM, no humana: las etiquetas de entrenamiento y evaluación fueron generadas por anotadores automáticos.
- Acuerdo entre anotadores muy pobre: alfa de Krippendorff de -0,120 para esta assertion, un valor negativo que indica ausencia de acuerdo sistemático entre anotadores.
- Rendimiento moderado: F1 de 0,494 y ROC-AUC de 0,765 en test, con recall bajo (0,438), lo que implica que se pierden más de la mitad de los casos positivos reales.
- Dominio restringido: entrenado únicamente con intervenciones de profesorado. El comportamiento sobre habla de estudiantes no está probado.
- Limitación de idioma: solo inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Sin licencia declarada: no se especifica licencia en la información disponible, por lo que el uso comercial queda sin autorización explícita y debe consultarse con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas sesgadas por la baja calidad de las etiquetas de anotación.
- No apto para decisiones de alto impacto sobre docentes: la baja fiabilidad documentada desaconseja usarlo para evaluación individual, promoción o cualquier decisión con consecuencias para personas.
- Sesgos no documentados: la model card no incluye análisis de sesgos por género, etnia, nivel educativo o tipo de centro.
- Advertencia de producción: cualquier integración debería incluir revisión humana y umbral de confianza ajustado según el coste relativo de falsos positivos y falsos negativos.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_has_informal_language
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (GitHub): https://github.com/SumnerLab/TalkMoves
- Cita sugerida por el autor: `@misc{assertion_sentence_has_informal_language, author = {Stanford SCALE Initiative}, title = {Assertion classifier: sentence has informal language}, year = {2026}, url = {https://huggingface.co/StanfordSCALE/assertion_sentence_has_informal_language}}`
- Nota sobre la búsqueda web: los resultados recuperados durante la búsqueda no guardan relación con el modelo (contenido de plataformas de streaming sobre películas y series). No se han encontrado papers, blogs, repositorios ni demos adicionales relevantes en la información disponible.
