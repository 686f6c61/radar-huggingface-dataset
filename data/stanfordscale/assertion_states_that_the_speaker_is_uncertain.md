# StanfordSCALE/assertion_states_that_the_speaker_is_uncertain

## Resumen

`StanfordSCALE/assertion_states_that_the_speaker_is_uncertain` es un clasificador de texto binario desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificación auditable de diálogo educativo. No es un modelo generativo: su única tarea es determinar si un enunciado de un docente expresa incertidumbre. Se distribuye como un modelo SetFit compuesto por el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parámetros segun el recuento de safetensors) y una cabeza de regresión logística.

El modelo resuelve un problema muy concreto de investigación educativa: la codificación manual de turnos de habla en el aula es costosa y difícil de escalar. Este clasificador es uno de los componentes del paquete `EduBehaviors-kit` y forma parte del conjunto de aserciones `bu5` (bottom-up). Se entrenó sobre un subconjunto de enunciados de profesor anotados por LLM, derivados del TalkMoves Dataset.

Es relevante por dos motivos. Primero, porque ejemplifica el patrón "assertion classifier": un modelo pequeño, especializado y barato de ejecutar que sirve como preanotador dentro de un pipeline de codificación auditable. Segundo, porque publica sus métricas con honestidad metodológica, incluidas las limitaciones: la tasa base de la clase positiva es del 2,4 %, la concordancia entre anotadores (alfa de Krippendorff) es de 0,689 y las etiquetas proceden de anotadores LLM, no de codificadores humanos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder transformer `paraphrase-mpnet-base-v2` + cabeza de clasificacion `LogisticRegression` |
| Parametros totales | 109.486.464 (recuento de safetensors, corresponde al encoder) |
| Parametros activos | no aplica (el modelo no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (cabeza logistica en el formato propio de SetFit) |

Otros datos del repositorio: pipeline `text-classification`, libreria `setfit`, tamano del repo 0,4 GB, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura sigue el esquema SetFit en dos fases. En la fase contrastiva se ajusta el encoder `sentence-transformers/paraphrase-mpnet-base-v2` con un learning rate de 2e-05, batch size de 16 y un maximo de 5000 pasos. En la segunda fase se entrena una cabeza de regresion logistica sobre los embeddings resultantes, con learning rate de 0,01 y batch size de 32. El entrenamiento completo abarca 10 epocas, con `eval_max_steps` de 100, semilla 20260904 y precision mixta activada en GPU.

Los datos de entrenamiento proceden de `StanfordSCALE/assertions_llm_annotated_talkmoves`, con 13.178 ejemplos de train (53,3 %), 3.298 de dev (13,3 %) y 8.239 de test (33,3 %). La entrada se construye unicamente con el enunciado, sin plantilla adicional. Las etiquetas fueron generadas por anotadores LLM, con una concordancia entre anotadores medida por alfa de Krippendorff de 0,689. La tasa base de la clase positiva es muy baja: 2,3 % en train, 2,6 % en dev y 2,5 % en test (2,4 % global), lo que condiciona por completo la eleccion de umbral en produccion. No se declara uso de RLHF ni de DPO, algo coherente con la naturaleza discriminativa del modelo.

## Capacidades

- Clasificacion binaria de texto: devuelve 1 cuando la asercion "el hablante expresa incertidumbre" se cumple y 0 en caso contrario.
- Puntuacion de probabilidad mediante `predict_proba`, lo que permite ajustar el umbral de decision segun el coste relativo de falsos positivos y falsos negativos.
- Deteccion de enunciados con matices de duda o cautela en el habla docente ("I was thinking that maybe it would help you...").
- Integracion con el paquete Python `EduBehaviors-kit` para codificacion auditable de dialogo educativo.
- Ejecucion sobre lotes de textos mediante la API de SetFit (`model.predict([...])`).
- Idioma: exclusivamente ingles.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni capacidades de agente. No es un modelo instructivo y no acepta prompts conversacionales.

## Casos de uso

- Preanotacion a escala en investigacion educativa: dado un corpus de transcripciones de aula, el clasificador marca automaticamente los turnos candidatos a contener incertidumbre, de modo que los codificadores humanos solo revisan una fraccion del total en lugar de todo el corpus.
- Codificacion auditable de dialogo con `EduBehaviors-kit`: el modelo actua como uno de los componentes del esquema de aserciones `bu5`, produciendo etiquetas trazables que pueden auditarse frente al texto original.
- Analisis de patrones de incertidumbre docente: agregar las predicciones por clase, sesion o profesor permite estudiar con que frecuencia y en que momentos el docente hedgea sus intervenciones, y correlacionarlo con otras variables del TalkMoves Dataset.
- Filtrado previo en pipelines de anotacion con presupuesto limitado: gracias al ROC-AUC de 0,878 en test, es viable fijar umbrales altos de precision (la precision en dev alcanza 0,827) para reducir el volumen de revision humana a cambio de perder recall.
- Formacion y retroalimentacion docente: identificar intervenciones formuladas con incertidumbre para que un formador las revise como material de reflexion sobre el lenguaje del aula.
- Investigacion sobre interacciones dialogicas: combinar esta etiqueta con otras aserciones del mismo proyecto para construir variables derivadas sobre el estilo de conduccion del discurso matematico.
- Seleccion de ejemplos para anotacion activa: usar `predict_proba` para priorizar casos cercanos al umbral, donde la informacion mutua esperada es mayor, en sucesivas rondas de anotacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (conjunto `StanfordSCALE/assertions_llm_annotated_talkmoves`, split test, no verificados de forma independiente, `verified: false`):

| Metrica | Valor (test) |
|---|---|
| F1 (clase positiva) | 0,5873 |
| Precision (clase positiva) | 0,6237 |
| Recall (clase positiva) | 0,555 |
| ROC-AUC | 0,878 |

Desglose dev/test incluido en la model card:

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.298 | 2,6 % | 0,827 | 0,721 | 0,770 | 0,962 | 0,792 |
| test | 8.239 | 2,5 % | 0,624 | 0,555 | 0,587 | 0,878 | 0,558 |

La caida de dev a test es notable en precision (0,827 a 0,624) y en average precision (0,792 a 0,558), lo que sugiere cierto sobreajuste al conjunto de validacion o diferencias de distribucion entre splits. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y en cualquier caso no serian aplicables a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada: con 109,5 millones de parametros y pesos en el repositorio de 0,4 GB, la inferencia en FP32 requiere del orden de 0,5 GB de memoria, mas el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se necesita A100, H100 ni RTX 4090. Una GTX 1650, T4 o incluso inferencia en CPU son opciones realistas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, y tambien en CPU para lotes moderados.
- Opciones de despliegue: la libreria `setfit` (referencia de uso publicada en la model card), `sentence-transformers` para el encoder subyacente y exportacion a ONNX u otros runtimes de inferencia. vLLM y TGI no aplican porque no es un modelo generativo; llama.cpp y Ollama tampoco, ya que la model card no publica pesos GGUF.
- Latencia y throughput: no disponibles. Al tratarse de un encoder de 109M de parametros, la latencia por lote sera baja, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

No se han proporcionado datos de rendimiento de modelos alternativos en la informacion disponible, por lo que la comparacion cuantitativa no es posible. Como referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| StanfordSCALE/assertion_states_that_the_speaker_is_uncertain | 109.486.464 | no disponible | no disponible | HuggingFace, SetFit |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base, sin cabeza de clasificacion) | no disponible | no disponible | no disponible | HuggingFace, sentence-transformers |
| Otros clasificadores de aserciones del conjunto `bu5` del proyecto EduBehaviors | no disponible | no disponible | no disponible | HuggingFace (mismo autor) |

La comparacion relevante es contra el propio modelo base sin ajuste: el valor anadido de este repositorio es la cabeza logistica entrenada sobre anotaciones especificas de incertidumbre en discurso de aula, no la arquitectura del encoder.

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos. La concordancia entre anotadores es de 0,689 (alfa de Krippendorff), un valor moderado que acota el techo de rendimiento alcanzable.
- El modelo se entreno unicamente con enunciados de profesor. Su comportamiento sobre habla de estudiantes no ha sido evaluado y no debe asumirse.
- Tasa base muy baja (2,4 % global): con un umbral por defecto de 0,5, la proporcion de falsos positivos puede ser alta en despliegues reales. Es imprescindible calibrar el umbral segun el caso de uso.
- Recall limitado en test (0,555) y caida de precision respecto a dev (0,827 a 0,624). El rendimiento en test debe tomarse como referencia realista, no los valores de dev.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos sistematicos en construcciones que lexicalmente se parecen a la incertidumbre sin serlo.
- Idioma: solo ingles. No hay evidencia de transferencia a castellano ni a otras lenguas.
- Dominio restringido: discurso de aula, en concreto el subconjunto de TalkMoves anotado. Su uso sobre otros dominios (atencion al cliente, redes sociales, documentacion tecnica) no esta validado.
- Licencia no disponible: no se declara licencia en la informacion proporcionada, por lo que no puede asumirse permiso para uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- Los resultados del model-index estan marcados como no verificados (`verified: false`), es decir, son declaraciones del propio autor sin validacion independiente.
- Advertencia de produccion: es un clasificador de un solo criterio. No debe usarse como sustituto de un sistema de evaluacion docente ni para tomar decisiones sobre personas sin revision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_states_that_the_speaker_is_uncertain
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio GitHub): https://github.com/SumnerLab/TalkMoves
- Libreria SetFit: https://github.com/huggingface/setfit
- Paquete `EduBehaviors-kit`: mencionado en la model card, sin enlace publico disponible en la informacion proporcionada.
