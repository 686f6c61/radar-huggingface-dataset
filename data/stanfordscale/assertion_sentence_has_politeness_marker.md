# StanfordSCALE/assertion_sentence_has_politeness_marker

## Resumen

`StanfordSCALE/assertion_sentence_has_politeness_marker` es un clasificador binario de texto en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea es determinar si una intervención (utterance) de un docente contiene un marcador de cortesía, etiqueta que se usa como una de las "assertions" auditables para codificar discurso de aula. No es un modelo generativo: es un clasificador de frases construido con SetFit sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parámetros, unos 109,5 M) más una cabeza de regresión logística.

El modelo se entrenó sobre un subconjunto anotado por LLM del TalkMoves Dataset, con 3.432 ejemplos de entrenamiento, 858 de desarrollo y 2.144 de test, y una tasa base de la clase positiva muy baja (2,1 %). Es relevante porque forma parte de una familia de clasificadores de "assertions" pensados para hacer auditable y reproducible el etiquetado de comportamientos docentes, y porque se distribuye listo para usarse a través del paquete Python `EduBehaviors-kit` y de la librería SetFit.

Se trata de un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, publicado en septiembre de 2026. Su utilidad está acotada al dominio educativo y al idioma inglés, y sus etiquetas no provienen de codificadores humanos sino de anotadores LLM, con un acuerdo entre anotadores (alfa de Krippendorff) de 0,731.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) con cabeza de clasificacion `LogisticRegression` (SetFit, enfoque de two-stage: fase contrastiva + cabeza) |
| Parametros totales | 109.486.464 (~109,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de codificacion tipo encoder, no generativo; no se declara longitud maxima de secuencia en la informacion disponible) |
| Tipos de cuantizacion | No disponible. Pesos distribuidos en safetensors; no se publican variantes cuantizadas (INT8/ONNX serian tecnicamente factibles via `optimum`, pero no las ofrece el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria `setfit`; tamano del repo: 0,4 GB) |

## Arquitectura y entrenamiento

El modelo sigue el esquema SetFit: se parte del encoder MPNet preentrenado `paraphrase-mpnet-base-v2` y se genera un espacio de representaciones de frases mediante una fase contrastiva, sobre la que despues se ajusta una cabeza de clasificacion de regresion logistica. Los hiperparametros declarados son: learning rate del cuerpo de 2e-05, learning rate de la cabeza de 0,01, batch size de 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, max steps de 5.000 en la fase contrastiva, eval max steps de 100, semilla 20260904 y precision mixta activada en GPU.

Los datos proceden del subconjunto anotado por LLM `StanfordSCALE/assertions_llm_annotated_talkmoves`, derivado del TalkMoves Dataset (SumnerLab) y restringido a intervenciones de docentes. El reparto es de 3.432 filas de entrenamiento (53,3 %), 858 de desarrollo (13,3 %) y 2.144 de test (33,3 %), con una tasa base de clase positiva del 2,1 % global (2,1 % en train, 1,6 % en dev y 2,1 % en test), es decir, un problema fuertemente desbalanceado. Las columnas asociadas al modelo son `assertion_sentence_has_politeness_marker` y `split_sentence_has_politeness_marker`. El texto de entrada se construye pasando la intervencion tal cual, sin plantilla adicional. El acuerdo entre anotadores medido con alfa de Krippendorff es de 0,731.

## Capacidades

- Clasificacion binaria de texto en ingles: predice si una intervencion docente contiene un marcador de cortesía (`model.predict` devuelve 1 cuando la assertion se cumple).
- Puntuacion de probabilidad calibrada de la clase positiva mediante `model.predict_proba`, util para umbralizar decisiones en lugar de usar solo la etiqueta dura.
- Etiquetado de discurso de aula dentro del esquema de "assertions" de EduBehaviors, orientado a codificacion de dialogo auditable.
- Integracion directa con la libreria SetFit (`SetFitModel.from_pretrained`) y con el paquete `EduBehaviors-kit`.
- Ejecucion sobre frases cortas y sueltas: el ejemplo de la model card usa la cadena `Happy Friday`.
- No dispone de generacion de texto, razonamiento multi-paso, codigo, matematicas, vision, audio, tool calling ni capacidades de agente.
- No se declara soporte multilingue: el entrenamiento y la evaluacion son exclusivamente en ingles.
- No se declara modo de razonamiento (thinking mode) ni ninguna capacidad especial adicional.

## Casos de uso

- Codificacion automatica de discurso de aula: dado un corpus de transcripciones de clases, el modelo marca que intervenciones del docente incorporan marcadores de cortesía, lo que permite calcular agregados por sesion o por profesor sin anotacion manual frase a frase.
- Investigacion educativa a escala: al integrarse en `EduBehaviors-kit` junto con otras "assertions" del mismo esquema, permite construir variables derivadas (por ejemplo, proporcion de intervenciones con marcador de cortesía) sobre miles de utterances de forma reproducible.
- Preetiquetado para anotacion humana: sirve como primera pasada que un codificador humano revisa, reduciendo coste en estudios con corpus grandes, teniendo en cuenta la precision declarada de 0,704 en test.
- Auditoria y control de calidad de pipelines de codificacion: al ser un clasificador determinista y ligero, puede ejecutarse como comprobacion cruzada frente a anotaciones humanas o de LLM y detectar discrepancias sistematicas.
- Analisis de estilo comunicativo docente: combinado con otras etiquetas del corpus TalkMoves, permite estudiar la relacion entre cortesía linguistica y patrones de interaccion en el aula.
- Filtrado y enriquecimiento de datasets educativos: para seleccionar subconjuntos de utterances con marcadores de cortesía antes de entrenar o evaluar modelos mayores, por ejemplo como datos de few-shot o para analisis cualitativo.
- Despliegue en entornos con pocos recursos: al ser un encoder de 109 M de parametros y 0,4 GB de repo, puede ejecutarse en CPU o en una GPU de gama baja dentro de un servicio interno de anotacion.
- Investigacion metodologica sobre SetFit: al publicar hiperparametros completos y semilla, es un punto de partida reproducible para comparar tecnicas de clasificacion few-shot en dominios con clases muy desbalanceadas (tasa base del 2,1 %).

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre `StanfordSCALE/assertions_llm_annotated_talkmoves`:

| Split | n | Tasa base | Precision (clase positiva) | Recall (clase positiva) | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 1,6 % | 0,714 | 0,714 | 0,714 | 0,823 | 0,680 |
| test | 2.144 | 2,1 % | 0,704 | 0,826 | 0,760 | 0,982 | 0,809 |

El `model-index` de la model card recoge unicamente el split de test con F1 = 0,76, precision = 0,7037, recall = 0,8261 y ROC-AUC = 0,9825, todos marcados como no verificados. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable dado que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en FP32 y 0,22 GB en FP16 solo para pesos, mas el espacio de activaciones del encoder; en la practica, menos de 1 GB de VRAM para lotes pequenos. Cifra orientativa calculada a partir de los 109,5 M de parametros, no publicada por el autor.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Funciona sin problema en RTX 3090, RTX 4090, RTX 3060, T4, L4 o GPUs integradas con suficiente memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo y tambien en CPU (inferencia de encoder de 109 M de parametros).
- Opciones de despliegue: SetFit / PyTorch (via `setfit`), `sentence-transformers` para el encoder subyacente y exportacion a ONNX mediante `optimum` para servir el clasificador con ONNX Runtime. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponible (no se publican cifras).
- Almacenamiento: 0,4 GB de repositorio.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos publicados que resuelvan exactamente la misma tarea (deteccion de marcadores de cortesía en intervenciones docentes). Como unica referencia se puede comparar con su propio modelo base:

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| StanfordSCALE/assertion_sentence_has_politeness_marker | 109,5 M | Clasificacion binaria de marcador de cortesía en utterances docentes | no disponible | HuggingFace (libreria setfit) |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base) | ~109 M | Generacion de embeddings de frase; no clasifica por si mismo | Apache-2.0 segun su propia model card (no confirmado en la informacion proporcionada) | HuggingFace |
| Otros clasificadores "assertion" de StanfordSCALE | no disponible | Clasificacion de otras etiquetas de comportamiento docente | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo frente a alternativas, por lo que no se puede establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores es de alfa de Krippendorff = 0,731, lo que implica un techo de calidad en las etiquetas de referencia.
- Entrenado exclusivamente con intervenciones de docentes: el comportamiento sobre habla de estudiantes no ha sido evaluado y no debe asumirse.
- Clase positiva muy poco frecuente (tasa base del 2,1 %): la metrica agregada puede ser enganosa, y la precision en test (0,704) implica una tasa apreciable de falsos positivos en produccion.
- Idioma limitado al ingles; no hay evidencia de generalizacion a otros idiomas, incluido el castellano.
- Licencia no disponible: no se puede confirmar que el uso comercial este permitido. Conviene contactar con el autor antes de un despliegue comercial.
- Riesgo de sobreajuste al dominio: el corpus de origen son transcripciones de aulas (TalkMoves); el rendimiento fuera de ese dominio (por ejemplo, conversaciones de atencion al cliente) es incierto.
- Sesgos potenciales derivados de la composicion del corpus de aulas estadounidenses, no caracterizados en la informacion disponible.
- Se trata de un clasificador de una unica etiqueta dentro de un esquema mayor: interpretarlo aisladamente puede llevar a conclusiones incompletas sobre el comportamiento docente.
- El modelo esta recien publicado (creado en septiembre de 2026) con 0 descargas y 0 likes: no existe validacion de la comunidad ni informes independientes de fallos.
- No sustituye a la codificacion humana en contextos de evaluacion de profesorado o decisiones con consecuencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_has_politeness_marker
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Repositorio del TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- La busqueda web realizada no devolvio enlaces relevantes para este modelo; los unicos resultados obtenidos fueron foros y paginas sin relacion con el clasificador.
