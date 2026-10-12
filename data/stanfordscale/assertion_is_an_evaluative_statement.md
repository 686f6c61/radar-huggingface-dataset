# StanfordSCALE/assertion_is_an_evaluative_statement

## Resumen

`StanfordSCALE/assertion_is_an_evaluative_statement` es un clasificador de texto binario desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea es determinar si un enunciado de un docente constituye una afirmación evaluativa ("assertion"), es decir, si el hablante está emitiendo un juicio de valor. El modelo se enmarca en un conjunto de aserciones "top-down" (identificador `td__the_utterance_is_an_evaluative_statement`) y se consume a través del paquete Python `EduBehaviors-kit`.

Técnicamente no es un modelo generativo: se trata de un clasificador construido con la librería SetFit sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2`, al que se le añade una cabeza de regresión logística. El conjunto completo de pesos suma 109.486.464 parámetros (unos 0,4 GB en el repositorio), con el encoder congelado salvo un ajuste fino contrastivo a tasa de aprendizaje muy baja (2e-05). Esto lo sitúa en la gama de modelos pequeños, aptos para inferencia en CPU y para procesar lotes grandes de transcripciones.

Su relevancia es de nicho pero clara: permite codificar de forma automatizada y auditable el discurso de aula a escala de miles de enunciados, sustituyendo parte del trabajo de codificación manual en investigación educativa. El entrenamiento se realizó sobre anotaciones generadas por LLM (no por codificadores humanos) del dataset TalkMoves, con un acuerdo entre anotadores de 0,678 según alfa de Krippendorff y una tasa base de la clase positiva muy baja (5,1 % en test), lo que condiciona por completo la interpretación de sus métricas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SetFit: encoder tipo transformer (MPNet, `paraphrase-mpnet-base-v2`) + cabeza de clasificación `LogisticRegression` |
| Parámetros totales | 109.486.464 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification (clasificación binaria) |
| Etiquetas de salida | 0 = la aserción no se cumple; 1 = el enunciado es una afirmación evaluativa |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Tamaño del repositorio | 0,4 GB |
| Librería | setfit |
| Idioma de la model card | inglés |

## Arquitectura y entrenamiento

El modelo sigue el esquema SetFit: se parte de un encoder de frases preentrenado, `sentence-transformers/paraphrase-mpnet-base-v2`, y se entrena en dos fases. Primero, una fase contrastiva sobre pares de textos con learning rate de 2e-05, batch size de 16 y un máximo de 5000 pasos. Después, se entrena una cabeza de regresión logística con learning rate de 0,01, batch size de 32, 10 épocas y evaluación cada 100 pasos. Se usó precisión mixta en GPU y semilla 20260904. No se documenta ninguna innovación de decodificación ni mecanismo de atención alternativo: es un clasificador denso convencional sobre representaciones de frase.

Los datos de entrenamiento proceden de una anotación automática (LLM annotators) de enunciados de docentes extraídos del TalkMoves Dataset. El corpus anotado se reparte en 13.183 instancias de entrenamiento (53,3 %), 3.295 de desarrollo (13,3 %) y 8.237 de test (33,3 %). La entrada se construye pasando la intervención tal cual, sin plantilla adicional. La clase positiva es muy minoritaria: 5,3 % global, con 5,4 % en train, 5,7 % en dev y 5,1 % en test. No se documenta RLHF, DPO ni ningún otro ajuste por preferencias, algo esperable en un clasificador de este tipo.

## Capacidades

- Clasificación binaria de enunciados docentes como afirmación evaluativa o no, con salida de probabilidad vía `predict_proba`.
- Detección de juicios de valor implícitos en lenguaje natural conversacional (discurso de aula, turnos de habla transcritos).
- Integración directa en el paquete `EduBehaviors-kit` para la codificación auditable de diálogo basada en aserciones.
- Procesamiento por lotes: `model.predict([...])` acepta listas de textos, lo que permite codificar transcripciones completas de una sola pasada.
- Funcionamiento en CPU sin requisitos de acelerador, dado el tamaño reducido del modelo.
- No dispone de generación de texto, tool calling, capacidades de agente, visión, audio ni razonamiento multi-paso.
- Multilingüismo: únicamente inglés (`language: en`); no se declara soporte de otros idiomas.

## Casos de uso

- Codificación de discurso de aula a escala: codificar automáticamente miles de turnos de habla de transcripciones educativas para identificar afirmaciones evaluativas, evitando el coste de la codificación manual en estudios con corpus grandes.
- Investigación educativa replicable: el esquema basado en aserciones y la posibilidad de auditar cada etiqueta permiten documentar y reproducir el criterio de codificación en publicaciones sobre patrones de enseñanza.
- Formación y evaluación docente: detectar la proporción de enunciados evaluativos en las intervenciones de un profesor para analizar su estilo de feedback, siempre con revisión humana dado el recall limitado.
- Preprocesamiento de pipelines de análisis del discurso: actuar como etapa previa que filtra o etiqueta intervenciones antes de un análisis cualitativo o de un modelo posterior, aprovechando su salida probabilística (`predict_proba`) para fijar umbrales según el coste del falso positivo.
- Construcción de datasets anotados con asistencia de modelo: usar las predicciones como preetiquetado en un flujo de anotación humana, reduciendo el trabajo en los casos de alta confianza.
- Detección de patrones conversacionales en datos de TalkMoves: análisis longitudinal de cómo se distribuyen las afirmaciones evaluativas entre sesiones, asignaturas o docentes concretos.
- Filtrado de baja latencia en entornos sin GPU: al requerir únicamente CPU, se puede desplegar como microservicio interno o script por lotes en infraestructura modesta.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). La clase positiva representa el 5,1 % de las filas en test y el 5,7 % en dev, por lo que las métricas deben leerse en clave de clasificación desbalanceada.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.295 | 5,7 % | 0,814 | 0,631 | 0,711 | 0,938 | 0,779 |
| test | 8.237 | 5,1 % | 0,730 | 0,571 | 0,641 | 0,918 | 0,674 |

Valores del `model-index` para el split de test: F1 0,6406, precision 0,7301, recall 0,5707 y ROC-AUC 0,9181. No se han publicado en la información disponible resultados comparativos frente a otros modelos sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 0,44 GB (109,5 M de parámetros); en fp16, unos 0,22 GB. Cifras calculadas a partir del número de parámetros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1050 Ti o superior ya sería holgada.
- Consumer GPU: sí, cabe en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida suficiente. También es viable en CPU.
- Opciones de despliegue: la vía documentada es la librería `setfit` (`pip install setfit`) con `SetFitModel.from_pretrained(...)`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientadas a modelos generativos y no aplican a este clasificador. Un servicio HTTP propio (FastAPI, batch offline) es la alternativa natural.
- Latencia y throughput: no disponibles. Se puede asumir procesamiento por lotes en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se ha proporcionado información sobre modelos comparables de la misma familia o categoría, ni resultados de terceros sobre el dataset `assertions_llm_annotated_talkmoves`. La comparación queda limitada al propio componente base.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_is_an_evaluative_statement | 109.486.464 | no disponible | Clasificación binaria de aserciones evaluativas | no disponible | HuggingFace (0 descargas, 0 likes) |
| sentence-transformers/paraphrase-mpnet-base-v2 | no disponible en la información proporcionada | no disponible | Generación de embeddings de frase | no disponible | HuggingFace (modelo base del anterior) |

El README menciona un conjunto de aserciones "top-down" (`td`) al que pertenece este clasificador, lo que sugiere la existencia de otros clasificadores hermanos, pero no se detallan identificadores, métricas ni estado de publicación de los mismos.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores es de 0,678 según alfa de Krippendorff, un valor moderado que acota el techo de calidad de las etiquetas.
- Sesgos conocidos: no documentados explícitamente, pero el modelo hereda los sesgos del encoder `paraphrase-mpnet-base-v2` y los de los anotadores automáticos que generaron las etiquetas.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto libre), pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación.
- Recall limitado en test (0,571), lo que implica que aproximadamente el 43 % de las afirmaciones evaluativas reales no se detectan. En producción conviene ajustar el umbral de decisión sobre `predict_proba` según el coste relativo de cada error.
- Desbalance extremo de clases (5,1 % de positivos en test): un clasificador trivial que prediga siempre la clase negativa acertaría en cerca del 95 % de los casos, por lo que la accuracy no es una métrica informativa aquí. Debe usarse F1 de la clase positiva, ROC-AUC o average precision.
- Dominio restringido: entrenado solo con enunciados de docentes. El comportamiento sobre habla de estudiantes no está probado.
- Idioma: únicamente inglés. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Licencia no disponible: no se especifican los términos de uso comercial. Es imprescindible contactar con el autor antes de integrarlo en un producto comercial.
- Adopción nula hasta la fecha de creación de la ficha (0 descargas, 0 likes), lo que implica ausencia de validación externa y de informes de fallos en producción.
- Métricas marcadas como `verified: false` en el `model-index`: son resultados declarados por el autor, no reproducidos por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_is_an_evaluative_statement
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Repositorio del TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Cita del autor (BibTeX en la model card, apartado Citation): Stanford SCALE Initiative, "Assertion classifier: the utterance is an evaluative statement", 2026, https://huggingface.co/StanfordSCALE/assertion_is_an_evaluative_statement
- Paper o blog del proyecto EduBehaviors: no disponible en la información proporcionada.
- Repositorio del paquete `EduBehaviors-kit`: no disponible en la información proporcionada.
- Demo o Space asociado: no disponible.
