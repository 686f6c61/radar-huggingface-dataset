# StanfordSCALE/assertion_sentence_has_apology

## Resumen

`StanfordSCALE/assertion_sentence_has_apology` es un clasificador binario de texto en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un marco de esquemas basados en aserciones para la codificación auditable de diálogo en el aula. El modelo no genera texto: recibe una única intervención (utterance) y devuelve una etiqueta que indica si esa frase contiene una disculpa. Está pensado para investigadores educativos que necesitan anotar de forma sistemática y reproducible el discurso docente.

Técnicamente es un modelo SetFit: un encoder de frases (`sentence-transformers/paraphrase-mpnet-base-v2`, basado en MPNet) que produce embeddings, seguido de una cabeza de regresión logística. El total de parámetros es de 109.486.464, el repositorio ocupa 0,4 GB y los pesos se distribuyen en formato safetensors. El entrenamiento se hizo sobre un subconjunto anotado por LLM del TalkMoves Dataset, con 3.432 ejemplos de entrenamiento, 858 de desarrollo y 2.144 de test.

Su relevancia es acotada pero específica: cubre una tarea muy concreta de análisis del discurso educativo con un coste computacional mínimo (inferencia viable en CPU) y con métricas declaradas de precisión 1,000 y F1 0,800 en test. Conviene interpretarlas con cautela: la tasa base de la clase positiva es del 0,3 % en test, lo que se traduce en solo 6 ejemplos positivos, y las etiquetas provienen de anotadores LLM, no de codificadores humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder de frases MPNet (transformer) + cabeza de regresion logistica |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; hereda el max_seq_length del modelo base `sentence-transformers/paraphrase-mpnet-base-v2` (384 tokens), no confirmado por el autor |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors sin variantes cuantizadas |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,4 GB) |
| Libreria de inferencia | setfit |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Tarea (pipeline) | text-classification |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Columnas de salida | assertion_sentence_has_apology, split_sentence_has_apology |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (repo) | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit, que combina dos fases. En la primera, el encoder `paraphrase-mpnet-base-v2` se ajusta con aprendizaje contrastivo por pares (contrastive phase) con un learning rate de 2e-05, batch size 16, 10 epocas y un maximo de 5.000 pasos, usando precision mixta en GPU. En la segunda, se congela el encoder y se entrena una cabeza de regresion logistica (`LogisticRegression`) con learning rate 0,01 y batch size 32. La semilla empleada es 20260904. El texto de entrada se construye unicamente con la intervencion en crudo (`{utterance}`), sin plantilla adicional.

Los datos proceden del TalkMoves Dataset, concretamente de un subconjunto de intervenciones de docentes anotado por LLM: 3.432 filas de entrenamiento (53,3 %), 858 de desarrollo (13,3 %) y 2.144 de test (33,3 %). La tasa base de la clase positiva es muy baja: 0,4 % global, 0,4 % en train, 0,2 % en dev y 0,3 % en test. El acuerdo entre anotadores medido con alfa de Krippendorff es 0,869. No se documenta uso de RLHF ni DPO, algo esperable en un clasificador discriminativo de este tipo.

## Capacidades

- Clasificacion binaria de una intervencion de habla: determina si la frase contiene una disculpa (`predict` devuelve 0 o 1).
- Puntuacion de probabilidad por clase mediante `predict_proba`, con salida `[[P(no), P(yes)]]`.
- Procesamiento de intervenciones de profesor en ingles, tal como se recogen en transcripciones de aula.
- Integracion con el paquete Python `EduBehaviors-kit` para la codificacion de dialogo basada en aserciones.
- Anotacion a escala de corpus de discurso educativo con coste computacional muy bajo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento: es un clasificador de una sola pasada, no un modelo generativo.
- No soporta generacion de texto ni resumen; su unica salida es una etiqueta y su probabilidad.

## Casos de uso

- Codificacion de discurso en el aula: investigacion educativa que anota automaticamente intervenciones docentes para medir la presencia de disculpas como marcador de clima relacional o gestion del error en el aula.
- Auditoria de anotaciones LLM: el clasificador sirve como segunda opinion sobre etiquetas generadas por modelos de lenguaje, permitiendo detectar desacuerdos en el pipeline EduBehaviors.
- Analisis longitudinal de transcripciones: procesamiento por lotes de miles de utterances de profesor a lo largo de un curso o de varios centros, con coste de inferencia minimo por ejecucion en CPU.
- Formacion docente y coaching: generacion de informes que cuantifican la frecuencia de disculpas en el habla del profesor a partir de grabaciones transcritas.
- Filtrado y depuracion de datasets: seleccion o exclusion de intervenciones con disculpas antes de entrenar otros modelos de analisis del discurso.
- Investigacion sobre reparacion conversacional: estudio de la relacion entre disculpas del docente y variables como participacion del alumnado, siempre que los datos sean de habla de profesor.
- Reproducibilidad metodologica: al ser un SetFit pequeno y determinista, permite replicar analisis con recursos limitados, sin depender de APIs externas de LLM.
- Integracion en cuadernos de analisis: uso dentro de notebooks de ciencias sociales con `transformers` y `setfit`, sin necesidad de GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 0,2 % | 1,000 | 1,000 | 1,000 | 1,000 | 1,000 |
| test | 2.144 | 0,3 % | 1,000 | 0,667 | 0,800 | 1,000 | 1,000 |

El autor advierte que solo hay 6 ejemplos positivos en el split de test, por lo que estas cifras tienen un margen de error muy amplio. No hay comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB con pesos en fp32 (109 M de parametros) mas el overhead de activaciones; el repositorio completo ocupa 0,4 GB.
- GPU recomendadas: practicamente cualquiera. Funciona en GPUs de gama baja tipo NVIDIA T4, GTX 1650 o incluso integradas; en A100 o H100 el cuello de botella sera el I/O de datos, no el calculo.
- Cabe en cualquier GPU de consumo: si, incluidas RTX 3060, RTX 4090 y modelos con 4 GB o menos. Tambien es viable en CPU para lotes moderados.
- Opciones de despliegue: `setfit` / `sentence-transformers` en Python, exportacion a ONNX Runtime o TorchScript, o serializacion con `joblib` para la cabeza logistica. vLLM, llama.cpp, Ollama y TGI no aplican, porque no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por tamano, se espera un throughput de miles de utterances por minuto en GPU moderna y de cientos en CPU, aunque es una estimacion no confirmada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_sentence_has_apology | 109,49 M | no disponible (base de 384 tokens) | F1 0,800 / precision 1,000 / ROC-AUC 1,000 en test | no disponible | HuggingFace, libreria setfit |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base, sin cabeza de clasificacion) | ~109 M | 384 tokens | no aplica: no clasifica la asercion por si mismo | Apache-2.0 (segun el modelo base; no confirmado en esta ficha) | HuggingFace |
| Clasificador supervisado con DeBERTa-v3-base ajustado | ~184 M | 512 tokens | no disponible | MIT (tipica del modelo base) | HuggingFace |
| Anotacion mediante prompting de un LLM generativo | miles de millones | variable | no disponible | depende del proveedor | API o pesos abiertos |

No hay resultados comparativos publicados en la informacion disponible; la tabla recoge solo dimensiones estructurales y de disponibilidad. La ventaja clara del modelo frente a alternativas generativas es el coste de inferencia y la posibilidad de ejecucion local; su desventaja es que resuelve una unica asercion muy especifica sobre habla de profesor en ingles.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento y evaluacion provienen de anotadores LLM, no de codificadores humanos; el acuerdo entre anotadores es de 0,869 segun alfa de Krippendorff.
- El modelo se entreno exclusivamente con intervenciones de profesor. Su comportamiento sobre habla de estudiantes no esta probado.
- Solo hay 6 ejemplos positivos en el split de test: las metricas de test (precision 1,000, recall 0,667, F1 0,800) tienen un intervalo de confianza muy ancho y no deben tomarse como estimaciones estables.
- Desequilibrio extremo de clases: tasa base del 0,4 % global y del 0,3 % en test. La exactitud (accuracy) seria un indicador enganoso; hay que usar precision, recall y average precision.
- Idiomas: unicamente ingles. No hay evidencia de transferencia a otras lenguas ni a variedades dialectales.
- Licencia no disponible: no puede confirmarse que el uso comercial este permitido. Es un riesgo relevante para produccion.
- Riesgo de falsos negativos: con recall 0,667 en test, aproximadamente un tercio de las disculpas reales podrian no detectarse.
- Sesgos: no se documenta ningun analisis de sesgo por genero, origen o asignatura del docente, ni por nivel educativo.
- No es un modelo generativo: no puede explicar sus decisiones, redactar informes ni mantener conversaciones. Cualquier uso que requiera justificacion textual necesita un componente adicional.
- Alcance limitado: el nombre del repositorio sugiere un clasificador por asercion dentro de una familia mayor; cada asercion requiere su propio modelo, lo que complica el mantenimiento de pipelines completos.
- Sin senal de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_has_apology
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (codigo y datos): https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit`: mencionado en la model card, sin URL disponible
- Paper o blog tecnico del proyecto EduBehaviors: no disponible
- Demo o Space asociado: no disponible
