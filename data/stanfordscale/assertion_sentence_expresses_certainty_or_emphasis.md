# StanfordSCALE/assertion_sentence_expresses_certainty_or_emphasis

## Resumen

El modelo `StanfordSCALE/assertion_sentence_expresses_certainty_or_emphasis` es un clasificador binario de texto en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas de codificación de diálogo orientados a la investigación educativa auditable. Su tarea concreta es determinar si una intervención de un docente expresa certeza o énfasis, es decir, si el hablante presenta una afirmación con un grado de seguridad o intensidad destacable. No es un modelo generativo: es un clasificador de secuencias construido con la librería SetFit, que combina un encoder de frases preentrenado con una cabeza de regresión logística.

Técnicamente se apoya en `sentence-transformers/paraphrase-mpnet-base-v2`, un encoder MPNet de arquitectura transformer con unos 109.486.464 parámetros totales en safetensors (encoder más cabeza). Se entrenó sobre un subconjunto anotado por LLM del corpus TalkMoves, formado por intervenciones de profesorado, con 3.432 ejemplos de entrenamiento, 858 de desarrollo y 2.144 de test, y una tasa base de la clase positiva cercana al 9,5 %.

Su relevancia es acotada pero específica: cubre una necesidad metodológica poco atendida en investigación educativa, la codificación automática de movimientos discursivos en el aula, y se distribuye como pieza integrable en el paquete Python `EduBehaviors-kit`. Conviene señalarlo con claridad desde el principio: la propia model card advierte de que el acuerdo entre anotadores (alfa de Krippendorff de 0,195) es pobre y de que las predicciones y los datos subyacentes no son fiables, por lo que debe tratarse como una herramienta exploratoria y nunca como sustituto de codificación humana en contextos de alto riesgo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) con cabeza de clasificación `LogisticRegression` (SetFit) |
| Parametros totales | 109.486.464 (dato real del repo, safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No declarada en la model card; el encoder MPNet base de sentence-transformers admite secuencias de hasta 384 tokens |
| Tipos de cuantizacion | No disponible; el repo no publica versiones cuantizadas (solo safetensors en fp32/fp16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (librería declarada: setfit) |
| Pipeline | `text-classification` (clasificación binaria) |
| Tamaño del repositorio | 0,4 GB |
| Etiquetas de salida | `assertion_sentence_expresses_certainty_or_emphasis` (booleano) y columna derivada `split_sentence_expresses_certainty_or_emphasis` |
| Entradas | Texto plano; la plantilla de entrada es únicamente `{utterance}`, sin transformaciones |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: en una primera fase se ajusta el encoder de frases mediante aprendizaje contrastivo sobre pares de oraciones, y en una segunda fase se congela el encoder y se entrena una cabeza de regresión logística sobre los embeddings resultantes. Los hiperparámetros declarados son un learning rate de 2e-5 para el cuerpo y 0,01 para la cabeza, batch size de 16 en la fase contrastiva y 32 en la fase de cabeza, 10 épocas, un máximo de 5.000 pasos en la fase contrastiva y 100 pasos máximos de evaluación, semilla 20260904 y precisión mixta activada en GPU. La cabeza es una `LogisticRegression`, lo que implica una frontera de decisión lineal sobre el espacio de embeddings del encoder.

Los datos de entrenamiento proceden del dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`, derivado del TalkMoves Dataset. Las etiquetas fueron generadas por anotadores LLM, no por codificadores humanos, y el acuerdo entre anotadores medido con alfa de Krippendorff es de 0,195, un valor que la propia documentación califica de pobre. El corpus se limita a intervenciones del profesorado; el comportamiento sobre habla de estudiantes no se ha evaluado. La distribución de clases es muy desbalanceada: la clase positiva representa el 9,2 % en train, el 10,0 % en dev y el 9,8 % en test. No se documenta el uso de RLHF, DPO ni ningún otro ajuste por preferencias, algo coherente con un clasificador discriminativo de este tipo.

## Capacidades

- Clasificación binaria de texto en inglés: decide si una intervención docente expresa certeza o énfasis.
- Salida probabilística mediante `predict_proba`, lo que permite fijar umbrales distintos según el coste relativo de falsos positivos y falsos negativos.
- Procesamiento de una sola frase o intervención por llamada, sin construcción de prompt ni instrucciones.
- Integración directa con la librería SetFit y con el paquete `EduBehaviors-kit` para flujos de codificación de diálogo educativo.
- Inserción como特征 en pipelines de análisis de discurso de aula junto a otros clasificadores de movimientos conversacionales (talk moves).
- No dispone de generación de texto, razonamiento multi-paso, código, matemáticas, visión ni audio.
- No soporta tool calling, function calling ni uso como agente.
- No es multilingüe: solo se ha entrenado y evaluado en inglés.
- No dispone de modo de pensamiento (thinking mode) ni de decodificación especulativa, al no ser un modelo autoregresivo.

## Casos de uso

- Codificación automática de corpus de aula a escala: dado un conjunto de transcripciones de clases, el modelo etiqueta cada intervención docente según si expresa certeza o énfasis, permitiendo procesar miles de turnos sin coste de anotación humana. Es adecuado por su tamaño reducido (0,4 GB) y su ejecución en CPU.
- Preanotación asistida para codificadores humanos: el clasificador propone una etiqueta y una probabilidad por turno, y el equipo de investigación revisa o corrige, reduciendo el tiempo de codificación. El umbral puede subirse para priorizar precisión y reducir el volumen de revisión.
- Investigación sobre lenguaje epistémico docente: construcción de variables derivadas (frecuencia de aserciones con certeza por sesión, por docente o por fase de la lección) para análisis estadísticos sobre patrones de instrucción.
- Detección de marcadores de énfasis como señal auxiliar: las probabilidades del modelo pueden emplearse como característica de entrada en modelos posteriores de análisis de discurso o de predicción de resultados de aprendizaje, en lugar de como etiqueta final.
- Formación y retroalimentación docente: analizar grabaciones de prácticas para mostrar al profesorado en qué momentos formula afirmaciones con un grado alto de certeza, como insumo para sesiones de reflexión guiada.
- Filtrado y muestreo de datos para investigación cualitativa: seleccionar automáticamente subconjuntos enriquecidos en aserciones de certeza para análisis manual intensivo, aprovechando el ROC-AUC de 0,828 para un ranking razonable aunque la clasificación binaria sea débil.
- Monitorización en tiempo real de sesiones con fines de investigación: con un encoder de 109 M de parámetros y ejecución en CPU, es viable procesar turnos según se transcriben, siempre que la transcripción automática previa tenga calidad suficiente.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente) sobre el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`:

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 10,0 % | 0,439 | 0,419 | 0,429 | 0,795 | 0,375 |
| test | 2.144 | 9,8 % | 0,455 | 0,429 | 0,441 | 0,828 | 0,417 |

No se han publicado en la información disponible resultados en benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K u otros), ni comparaciones con modelos alternativos sobre el mismo conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (unos 438 MB de pesos) y alrededor de 220 MB en fp16 para el encoder; la cabeza de regresión logística añade un coste despreciable.
- Ejecución en CPU: totalmente viable; el modelo es un encoder MPNet base y puede procesar lotes pequeños en CPU moderna sin problemas.
- GPU recomendadas: cualquier GPU consumer sirve. Una RTX 3060, RTX 4090 o RTX 5090 están sobredimensionadas para este modelo; su uso solo tiene sentido si se procesan lotes muy grandes en paralelo o si se comparte GPU con otros componentes del pipeline.
- GPU de datacenter: A100, H100 o L40S no son necesarias, aunque pueden aprovecharse para inferencia por lotes a gran escala sobre corpus completos.
- Opciones de despliegue: SetFit (`SetFitModel.from_pretrained`), `sentence-transformers` junto con un `LogisticRegression` serializado, y exportación a ONNX para inferencia optimizada. No aplica vLLM u otros servidores de modelos generativos; TGI sí dispone de soporte para `text-classification`, pero no es la vía natural. Ollama y llama.cpp no aplican, ya que no existen pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas sobre el mismo conjunto de evaluación, por lo que la comparación cuantitativa no es posible. La tabla recoge únicamente lo que puede afirmarse con la información disponible.

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `StanfordSCALE/assertion_sentence_expresses_certainty_or_emphasis` | 109.486.464 | No declarado (384 tokens en el encoder base) | F1 test 0,4412; ROC-AUC 0,8282 | No disponible | Hugging Face, librería setfit |
| `sentence-transformers/paraphrase-mpnet-base-v2` (modelo base sin cabeza) | ~109 M | 384 tokens | No aplica: no es un clasificador de la tarea | No disponible en la información proporcionada | Hugging Face, sentence-transformers |
| Otros clasificadores de aserciones del proyecto EduBehaviors | No disponible | No disponible | No disponible | No disponible | Hugging Face (colección StanfordSCALE) |
| Clasificación zero-shot con modelos de inferencia de lenguaje natural (NLI) | No disponible | No disponible | No disponible | No disponible | Hugging Face |

## Limitaciones y advertencias

- Calidad de las etiquetas: fueron generadas por anotadores LLM, no por codificadores humanos, y el acuerdo entre anotadores es de alfa de Krippendorff 0,195. La propia model card califica este valor de pobre y advierte de que tanto las predicciones como los datos subyacentes no son fiables.
- Rendimiento moderado: en test, F1 de 0,4412 y precisión de 0,4545 sobre una tasa base del 9,8 %, lo que implica un número elevado de falsos positivos y falsos negativos si se usa con umbral por defecto.
- Sesgo de dominio y de hablante: el modelo se entrenó solo con intervenciones de profesorado del corpus TalkMoves; no se ha evaluado sobre habla de estudiantes, sobre otras asignaturas, niveles educativos o contextos culturales distintos.
- Limitación de idioma: únicamente inglés. Cualquier uso en castellano u otras lenguas carece de validación.
- Riesgo de sobreajuste a la formulación: al ser un clasificador lineal sobre embeddings de un encoder de frases, puede depender de marcadores léxicos superficiales de énfasis más que de una comprensión real del contenido epistémico.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es la asignación errónea de etiquetas con alta confianza, que puede propagarse a análisis cuantitativos posteriores.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada, por lo que no puede confirmarse que el uso comercial esté permitido. Debe aclararse antes de cualquier despliegue en producción.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación externa por parte de la comunidad.
- Longitud de entrada: no se declara explícitamente el límite, pero el encoder MPNet base trunca a 384 tokens, suficiente para intervenciones cortas pero no para turnos largos o documentos extensos.
- Uso previsto: debe emplearse como herramienta de investigación exploratoria o de preanotación, nunca como sistema de decisión automatizada sobre personas ni para evaluación docente con consecuencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StanfordSCALE/assertion_sentence_expresses_certainty_or_emphasis
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio de origen del corpus): https://github.com/SumnerLab/TalkMoves
- Documentación de SetFit: https://huggingface.co/docs/setfit
- Repositorio de la librería SetFit: https://github.com/huggingface/setfit
- Organización StanfordSCALE en Hugging Face: https://huggingface.co/StanfordSCALE
