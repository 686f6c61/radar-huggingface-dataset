# StanfordSCALE/assertion_sentence_addresses_the_whole_class

## Resumen

`StanfordSCALE/assertion_sentence_addresses_the_whole_class` es un clasificador binario de texto en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea es determinar si un enunciado de un docente se dirige al conjunto de la clase (whole class) en lugar de a un estudiante o grupo concreto. El modelo forma parte de un conjunto de clasificadores de "aserción" que codifican automáticamente movimientos discursivos en el aula y se consume a través del paquete Python `EduBehaviors-kit`.

Técnicamente no es un modelo generativo, sino un clasificador SetFit: un encoder de frases `sentence-transformers/paraphrase-mpnet-base-v2` (MPNet, 109.486.464 parámetros en total) afinado con aprendizaje contrastivo y coronado por una cabeza `LogisticRegression`. El repositorio ocupa 0.4 GB y los pesos se distribuyen en formato safetensors. Se entrenó sobre un subconjunto anotado por LLM del TalkMoves Dataset: 3.432 ejemplos de entrenamiento, 858 de desarrollo y 2.144 de test.

Su relevancia es metodológica más que de escala: ofrece una alternativa barata, local y reproducible frente a usar un LLM generativo para etiquetar discurso educativo a gran escala, con métricas declaradas de F1 = 0,799 y ROC-AUC = 0,826 en el conjunto de test. El interés práctico está en la investigación educativa y en la construcción de pipelines de codificación auditables, no en aplicaciones conversacionales generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder de frases MPNet (`paraphrase-mpnet-base-v2`) + cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 |
| Longitud de contexto | no disponible (clasificador de enunciado único; el dataset trabaja con una sola utterance por fila) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification (binaria) |
| Etiqueta objetivo | `assertion_sentence_addresses_the_whole_class` |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Librería | setfit |
| Tamaño del repositorio | 0.4 GB |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema SetFit en dos fases. En la fase contrastiva se afina el cuerpo MPNet (transformer encoder preentrenado con objetivo de predicción de tokens enmascarados y permutación) con pares de frases positivas y negativas, con learning rate de 2e-05, batch size de 16, 10 épocas y un máximo de 5.000 pasos, con precisión mixta activada en GPU. En la segunda fase se congela el encoder y se entrena una cabeza de regresión logística con learning rate de 0,01 y batch size de 32. La semilla fijada es 20260904. Este diseño permite obtener un clasificador competitivo con muy pocos datos etiquetados, en contraste con el afinado completo supervisado.

Los datos proceden del subconjunto anotado por LLM del TalkMoves Dataset, restringido a intervenciones de docentes. La entrada es la utterance en bruto, sin plantilla ni prefijo. La tasa base de la etiqueta positiva es del 64,4 % global (63,7 % en train, 64,9 % en dev y 65,4 % en test). No se menciona en la información disponible el uso de RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador discriminativo. La innovación destacable es de tipo metodológico: anotación automática por LLM con esquemas de aserción auditables, más un acuerdo entre anotadores medido con alfa de Krippendorff de 0,546.

## Capacidades

- Clasificación binaria de enunciados docentes según la aserción `sentence_addresses_the_whole_class` (¿el enunciado se dirige a toda la clase?).
- Salida de probabilidad calibrada mediante `predict_proba`, útil para umbralizar decisiones o priorizar revisiones manuales.
- Predicción por lotes sobre listas de textos mediante `SetFitModel.predict`, apta para procesar corpus completos.
- Comprensión semántica de enunciados en inglés apoyada en el encoder MPNet afinado, incluyendo expresiones coloquiales breves (el ejemplo de la model card es `'Happy Friday'`).
- Integración con el paquete `EduBehaviors-kit` para codificación de diálogo educativo basada en aserciones.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; no genera texto.
- No tiene modo de razonamiento (thinking), visión, audio ni capacidades multimodales.
- Capacidad multilingüe: no disponible; el modelo está entrenado y etiquetado únicamente en inglés.

## Casos de uso

- Codificación automática de discurso en el aula a escala: un equipo de investigación educativa puede etiquetar miles de turnos de docente de un corpus transcrito y separar las intervenciones dirigidas al grupo completo de las dirigidas a un alumno concreto, sustituyendo parte del trabajo de codificación manual.
- Preprocesado de analítica del aprendizaje: usar la etiqueta como variable de entrada en modelos posteriores que relacionen el tipo de dirección del discurso con métricas de participación o rendimiento del alumnado.
- Formación y desarrollo profesional docente: procesar las transcripciones de una sesión grabada y generar un informe con la proporción de enunciados dirigidos al conjunto de la clase, con fines de autoevaluación.
- Auditoría y validación de anotaciones por LLM: emplear este clasificador como segunda opinión barata sobre las etiquetas generadas por un LLM y detectar discrepancias para revisión humana, dado que las etiquetas originales también son automáticas.
- Filtrado previo en pipelines de investigación cualitativa: reducir el volumen de transcripciones que un codificador humano debe leer, marcando con un umbral alto de `predict_proba` los casos claros y dejando los ambiguos para revisión.
- Cuadros de mando docentes en tiempo casi real: al ser un modelo de 109 M de parámetros, cabe en una GPU de consumo e incluso en CPU, por lo que puede integrarse en servicios ligeros que procesen transcripciones de sesiones recientes.
- Reproducibilidad metodológica y comparación de esquemas de codificación: sirve como referencia fija y ligera frente a alternativas basadas en prompting de LLM, que son más caras y variables entre versiones.
- Investigación sobre SetFit en dominios especializados: punto de partida para reproducir el procedimiento en otros dominios con pocos datos etiquetados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas del model-index, no verificadas de forma independiente). Conjunto de evaluación: `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision (clase positiva) | Recall (clase positiva) | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 64,9 % | 0,811 | 0,786 | 0,799 | 0,810 | 0,892 |
| test | 2.144 | 65,4 % | 0,826 | 0,774 | 0,799 | 0,826 | 0,894 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos alternativos sobre el mismo conjunto de test.

## Requisitos de hardware

- Estimación de VRAM en inferencia a partir de los 109.486.464 parámetros: aproximadamente 0,44 GB en fp32 y 0,22 GB en fp16 (cálculo propio, no declarado por el autor). El repositorio completo ocupa 0,4 GB.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con memoria compartida.
- Funciona en CPU para lotes pequeños y para clasificación por lotes de corpus medianos; el cuello de botella será el encoder MPNet, no la cabeza logística.
- No requiere GPU de centro de datos (A100, H100); su uso en ellas solo tendría sentido para procesar volúmenes masivos en paralelo.
- Opciones de despliegue: la librería `setfit` sobre PyTorch es la vía documentada en la model card (`pip install setfit`). No se documentan exportaciones a vLLM, llama.cpp, Ollama, TGI ni formatos GGUF/ONNX en la información disponible.
- Latencia y throughput estimados: no disponible (no se publican mediciones del autor).

## Comparativa con modelos similares

No hay datos de rendimiento publicados para alternativas sobre el mismo conjunto de evaluación, por lo que la comparación se limita a características estructurales.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento en esta tarea |
|---|---|---|---|---|---|---|
| assertion_sentence_addresses_the_whole_class | SetFit (MPNet + regresión logística) | 109.486.464 | no disponible | no disponible | HuggingFace, librería setfit | F1 0,799 / ROC-AUC 0,826 (test, declarado por el autor) |
| sentence-transformers/paraphrase-mpnet-base-v2 | Encoder de frases (modelo base) | ≈109 M (mismo cuerpo) | no disponible | no disponible | HuggingFace | no disponible (no es un clasificador de la tarea) |
| Clasificador SetFit genérico sobre el mismo corpus | SetFit | ≈109 M | no disponible | no disponible | no disponible | no disponible |
| Anotación zero-shot o few-shot con LLM generativo | LLM decoder-only | no disponible | no disponible | según proveedor | API o pesos abiertos | no disponible |

## Limitaciones y advertencias

- Las etiquetas no provienen de codificadores humanos, sino de anotadores LLM; el acuerdo entre anotadores para esta aserción es de alfa de Krippendorff = 0,546, un valor moderado que acota el techo de calidad del clasificador.
- El modelo se entrenó únicamente con intervenciones de docentes; su comportamiento sobre habla de estudiantes no está probado.
- Solo admite inglés. Cualquier uso en castellano u otras lenguas carece de validación.
- Es un clasificador binario de una aserción concreta: no genera texto, no razona, no soporta herramientas ni agentes. No debe presentarse como un modelo de propósito general.
- Riesgo de alucinación en sentido estricto: no aplica (no genera texto), pero sí existe riesgo de falsos positivos y falsos negativos; con precision 0,826 y recall 0,774 en test, aproximadamente uno de cada cuatro casos positivos reales se escapa.
- La tasa base es del 64,4 %, claramente desequilibrada hacia la clase positiva; las métricas deben interpretarse siempre contra esa referencia y no contra un 50 %.
- Licencia no disponible: no consta permiso explícito de uso comercial. Antes de integrarlo en un producto o servicio, conviene contactar con el autor para aclarar los términos.
- Dataset de entrenamiento de tamaño reducido (3.432 ejemplos de train) y procedente de un único corpus (TalkMoves), lo que limita la generalización a otros contextos educativos, niveles o países.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencias de uso independiente ni validación externa de los resultados.
- Las métricas del model-index figuran como `verified: false`; son declaraciones del autor.
- No hay cuantizaciones publicadas, por lo que el despliegue eficiente en entornos muy restringidos requiere exportar y cuantizar por cuenta propia, con el riesgo de degradar el rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_addresses_the_whole_class
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (GitHub): https://github.com/SumnerLab/TalkMoves
- Paquete Python mencionado en la model card: `EduBehaviors-kit` (no se proporciona URL en la información disponible)
- Paper o blog técnico del proyecto EduBehaviors: no disponible
- Demo o espacio interactivo: no disponible
- Búsqueda web: los resultados obtenidos no guardan relación con el modelo (listas de reproducción musical); no se han encontrado enlaces adicionales relevantes.
