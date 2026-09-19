# StanfordSCALE/assertion_sentence_has_time_reference

# StanfordSCALE/assertion_sentence_has_time_reference

## Resumen

`StanfordSCALE/assertion_sentence_has_time_reference` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificación auditable de diálogo. La tarea concreta del modelo es determinar si una intervención (utterance) de un docente contiene una referencia temporal, es decir, si la aserción "la oración tiene referencia de tiempo" se cumple para ese texto.

Técnicamente no es un modelo generativo ni un transformer entrenado de cero: se trata de un clasificador SetFit construido sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parámetros) y rematado con una regresión logística. El entrenamiento combina una fase contrastiva con una fase de ajuste del cabezal de clasificación, y se realizó sobre un subconjunto del dataset TalkMoves anotado por LLM. Su relevancia es práctica: permite escalar la codificación de discurso de aula sin depender de anotadores humanos para cada etiqueta.

El modelo está pensado para el paquete Python `EduBehaviors-kit` y se distribuye únicamente en inglés (trabaja sobre intervenciones de profesor). Su licencia no está declarada en la model card, lo que condiciona cualquier uso más allá de la investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (MPNet) con cabezal de clasificación lineal; entrenamiento tipo SetFit (fase contrastiva + LogisticRegression) |
| Parametros totales | 109.486.464 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base `paraphrase-mpnet-base-v2`); la model card no la especifica explícitamente |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones en la model card) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Tarea | Clasificación binaria: `assertion_sentence_has_time_reference` |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder de frases MPNet (`paraphrase-mpnet-base-v2`) utilizado como cuerpo (*body*), sobre el que se aplica un esquema SetFit: primero una fase contrastiva que ajusta el encoder con pares de oraciones, y después el entrenamiento de un cabezal de `LogisticRegression` sobre las representaciones resultantes. El cuerpo se ajusta con una tasa de aprendizaje de 2e-05, mientras que el cabezal usa 0,01. La fase contrastiva emplea batch size 16 y hasta 5000 pasos; la fase del cabezal, batch size 32, 10 épocas y 100 pasos máximos de evaluación. Se usó precisión mixta en GPU y semilla 20260904. El texto de entrada se construye únicamente con la intervención (`{utterance}`), sin plantilla adicional.

Los datos proceden de `StanfordSCALE/assertions_llm_annotated_talkmoves`, un subconjunto del TalkMoves Dataset compuesto por intervenciones de docentes y anotado por anotadores LLM. El reparto es de 3432 ejemplos de entrenamiento (53,3 %), 856 de desarrollo (13,3 %) y 2146 de test (33,4 %). La tasa base de ejemplos positivos es del 17,3 % global (17,2 % en train, 19,2 % en dev, 16,9 % en test), lo que implica un problema claramente desbalanceado. La concordancia entre anotadores para esta aserción es de alfa de Krippendorff 0,603, un valor moderado que acota el techo realista del clasificador. No se documenta uso de RLHF, DPO ni ninguna innovación de decodificación (no aplica a un clasificador).

## Capacidades

- Clasificación binaria de texto: predice si una intervención contiene una referencia temporal, devolviendo `predict` (0/1) y `predict_proba` (probabilidades por clase).
- Codificación de discurso de aula: forma parte de los esquemas de aserción de EduBehaviors para la anotación auditable de diálogo educativo.
- Procesamiento de texto en inglés a nivel de intervención individual, sin necesidad de contexto adicional entre turnos.
- Integración con la librería SetFit y con el paquete `EduBehaviors-kit` del proyecto.
- Salida probabilística calibrable: la probabilidad de la clase positiva permite fijar umbrales según el coste relativo de falsos positivos y falsos negativos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. No es un modelo generativo.

## Casos de uso

- Codificación automatizada de corpus de aula: el clasificador etiqueta cada intervención docente de una transcripción y marca cuáles contienen referencias temporales, sustituyendo la codificación manual en estudios con miles de turnos.
- Pre-anotación para anotación humana: se usa como primera pasada sobre las transcripciones y los codificadores humanos solo revisan los casos cercanos al umbral, lo que reduce el coste de anotación manteniendo la auditabilidad del esquema.
- Investigación educativa a escala: extraer la proporción de intervenciones con referencia temporal por sesión, profesor o asignatura para analizar patrones de gestión del tiempo en el aula.
- Formación y desarrollo profesional docente: generar informes automáticos que señalen en qué momentos el profesor explicita plazos, fechas o secuencias temporales, como material para sesiones de reflexión sobre la práctica.
- Componente en pipelines de análisis de diálogo multi-etiqueta: se encadena con otros clasificadores de aserción del mismo proyecto para construir un etiquetado completo de los comportamientos docentes.
- Control de calidad de transcripciones ASR: detectar segmentos donde debería aparecer una referencia temporal y verificar que el sistema de reconocimiento de voz la ha transcrito, marcando posibles omisiones.
- Filtrado de subconjuntos para análisis cualitativo: seleccionar automáticamente las intervenciones con referencia temporal para un estudio de caso posterior, reduciendo el material a revisar manualmente.
- Análisis longitudinal de cursos: aplicar el clasificador a transcripciones de distintas semanas para medir si la densidad de referencias temporales cambia a lo largo del curso.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 856 | 19,2 % | 0,687 | 0,695 | 0,691 | 0,888 | 0,704 |
| test | 2146 | 16,9 % | 0,715 | 0,741 | 0,728 | 0,924 | 0,792 |

En el split de test, el modelo alcanza un F1 de 0,728 para la clase positiva, con precisión 0,7154 y recall 0,741, y un ROC-AUC de 0,9241. El rendimiento es ligeramente superior en test que en dev en todas las métricas reportadas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 109,5 M de parámetros; no publicada por el autor): en fp32, aproximadamente 438 MB; en fp16, aproximadamente 219 MB; en int8, aproximadamente 110 MB. Hay que sumar el overhead del runtime y los embeddings de entrada.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o en CPU. Una A100 o H100 estaría enormemente sobredimensionada para este modelo.
- Inferencia en CPU viable: con este tamaño, el procesado por lotes en CPU es práctico para corpus de decenas de miles de intervenciones.
- Opciones de despliegue: SetFit (`SetFitModel.from_pretrained`), `sentence-transformers`/`transformers` para cargar el encoder, y exportación a ONNX u otros formatos de runtime para servir el clasificador. No se documentan integraciones con vLLM, TGI, Ollama o llama.cpp, que están orientadas a modelos generativos y no aplican aquí.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

No se dispone de resultados publicados de modelos comparables en la información proporcionada. La referencia más directa es el propio modelo base:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_sentence_has_time_reference | 109.486.464 | 512 tokens (heredado) | Clasificación binaria de referencia temporal en intervenciones docentes | No disponible | HuggingFace, 0 descargas, 0 likes |
| sentence-transformers/paraphrase-mpnet-base-v2 | ~109 M | 512 tokens | Embeddings de frases (no clasifica) | No disponible en la información proporcionada | HuggingFace (modelo base) |
| Otros clasificadores de aserción del proyecto EduBehaviors | No disponible | No disponible | Codificación de discurso de aula | No disponible | No disponible |

La comparación con alternativas de la misma categoría (clasificadores de discurso educativo, modelos SetFit sobre otros datasets de aula) no puede establecerse con datos de la información proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de anotadores LLM, no de codificadores humanos. La concordancia entre anotadores medida con alfa de Krippendorff es 0,603, lo que limita el rendimiento máximo alcanzable y traslada posibles sesgos del anotador automático al clasificador.
- El modelo se entrenó exclusivamente con intervenciones de profesores. Su comportamiento sobre habla de estudiantes no ha sido evaluado.
- Problema desbalanceado: solo el 17,3 % de los ejemplos son positivos, por lo que la precisión de la clase positiva (0,715) implica una tasa apreciable de falsos positivos si se usa el umbral por defecto.
- Licencia no declarada en la model card: antes de cualquier uso comercial o de redistribución debe aclararse con los autores, ya que la ausencia de licencia impide asumir permisos de uso.
- Idioma único: solo inglés. Cualquier aplicación sobre transcripciones en castellano u otras lenguas queda fuera del ámbito validado.
- Riesgo de alucinación no aplica en el sentido generativo: al ser un clasificador, el riesgo equivalente es la clasificación errónea, especialmente en intervenciones ambiguas o muy cortas.
- Sensibilidad al dominio: el modelo se entrenó sobre el subconjunto anotado de TalkMoves; su generalización a otros niveles educativos, asignaturas o estilos de transcripción no está documentada.
- Dependencia de la calidad de la transcripción: errores de ASR o segmentación incorrecta de intervenciones pueden degradar las predicciones.
- Metadatos de adopción mínimos: 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente de los resultados declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_has_time_reference
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (origen de las intervenciones): https://github.com/SumnerLab/TalkMoves
- Referencia del proyecto: *EduBehaviors: Assertion-based schemas for auditable dialogue coding* (sin URL disponible en la información proporcionada)
- Los resultados de la búsqueda web no contenían enlaces relevantes al modelo: solo devolvieron conversores de zonas horarias (EDT a UTC), sin relación con el proyecto.
