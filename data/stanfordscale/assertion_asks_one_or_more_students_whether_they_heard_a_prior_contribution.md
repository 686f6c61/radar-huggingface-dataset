# StanfordSCALE/assertion_asks_one_or_more_students_whether_they_heard_a_prior_contribution

## Resumen

El modelo `StanfordSCALE/assertion_asks_one_or_more_students_whether_they_heard_a_prior_contribution` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas de codificación de diálogo en el aula basados en aserciones auditables. Su tarea concreta es detectar si una intervención docente pide a uno o varios estudiantes que confirmen si han escuchado una contribución previa, una de las muchas aserciones atómicas con las que el proyecto descompone los movimientos conversacionales del profesorado.

Técnicamente no es un modelo generativo: es un clasificador SetFit compuesto por un encoder de frases `sentence-transformers/paraphrase-mpnet-base-v2` (MPNet base, 109.486.464 parámetros) afinado con aprendizaje contrastivo y una cabeza de regresión logística. Se distribuye en formato safetensors a través de la librería `setfit` y su único idioma declarado es el inglés. Su relevancia es de nicho pero alta en investigación educativa: permite etiquetar automáticamente corpus de habla docente con un criterio de codificación explícito y con una fiabilidad entre anotadores LLM de Krippendorff's alpha = 0,909.

El modelo se entrenó sobre el subconjunto anotado por LLM del TalkMoves Dataset (25.000 filas aproximadamente entre train, dev y test) y está pensado para integrarse en la librería Python `EduBehaviors-kit`. La clase positiva es extremadamente rara (tasa base del 0,1 %), lo que condiciona por completo su evaluación y su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer MPNet base (`paraphrase-mpnet-base-v2`) afinado con SetFit + cabeza de regresión logística |
| Parametros totales | 109.486.464 (109,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (el encoder MPNet base tiene un límite arquitectónico estándar de 512 tokens) |
| Tipos de cuantizacion | No disponible; pesos publicados en safetensors (fp32) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification (clasificación binaria de una sola etiqueta) |
| Libreria de carga | setfit |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Tamano del repositorio | 0,4 GB |
| Identificador de la aserción | `td__the_utterance_asks_one_or_more_students_whether_they_heard_a_prior_contribution` |
| Fecha de publicacion | 2026-10-12 |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón SetFit: se parte de un sentence transformer preentrenado (`paraphrase-mpnet-base-v2`, MPNet base de 12 capas y 768 dimensiones ocultas) y se afina primero con una fase contrastiva sobre pares de frases, con un learning rate de 2e-05, batch size de 16, hasta 5.000 pasos y validación cada 100 pasos. Después se congela el cuerpo y se entrena una cabeza de regresión logística con learning rate de 0,01 y batch size de 32. El entrenamiento total es de 10 épocas, con semilla 20260904 y precisión mixta activada en GPU. La entrada es la intervención docente en crudo, sin plantilla de prompt ni contexto adicional: el texto se pasa tal cual al encoder.

Los datos proceden del subconjunto anotado por LLM del TalkMoves Dataset, con 13.179 filas de entrenamiento (53,3 %), 3.296 de desarrollo (13,3 %) y 8.240 de prueba (33,3 %). Las etiquetas no las generaron codificadores humanos, sino anotadores LLM, con una concordancia entre anotadores medida por Krippendorff's alpha de 0,909. La tasa base de la clase positiva es del 0,1 % en todos los splits, es decir, un problema de clasificación fuertemente desbalanceado. El modelo se entrenó únicamente con intervenciones del profesorado. No se documenta en la model card ninguna innovación de decodificación, atención lineal ni técnica de inferencia especial; el modelo no genera texto.

## Capacidades

- Clasificación binaria de intervenciones docentes en inglés: devuelve 1 si la intervención pide a uno o más estudiantes que confirmen si escucharon una contribución anterior, y 0 en caso contrario.
- Salida probabilística mediante `predict_proba`, lo que permite fijar umbrales distintos según el coste relativo de falsos positivos y falsos negativos.
- Codificación de diálogo en el aula con esquemas de aserciones auditables dentro del ecosistema EduBehaviors.
- Integración directa con la librería `setfit` (`SetFitModel.from_pretrained(...)`) y con el paquete `EduBehaviors-kit`.
- Anotación a escala de corpus de habla docente: puede procesar lotes de intervenciones mucho más rápido que un LLM anotador.
- Capacidad multilingüe: no. El modelo está declarado únicamente para inglés.
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplica, es un clasificador discriminativo, no un modelo generativo.
- Modo thinking, visión o audio: no disponible, no se declara ninguna de estas capacidades.

## Casos de uso

- Anotación automática de corpus de investigación educativa: dado un corpus transcrito de clases, el modelo etiqueta cada intervención docente con la aserción "pide confirmar si se escuchó una contribución previa", lo que permite estudiar patrones de elicitación de escucha activa sin codificación manual.
- Filtrado previo en pipelines de anotación LLM: al ser un clasificador de 109 M de parámetros, se puede usar como primera etapa para descartar candidatos evidentemente negativos y reservar el LLM anotador (más caro) para los casos dudosos, dada la tasa base del 0,1 %.
- Control de calidad de anotaciones ya generadas: recalcular la etiqueta con este clasificador y marcar discrepancias frente a las anotaciones existentes para revisión humana posterior.
- Retroalimentación formativa al profesorado: dentro de una plataforma de desarrollo profesional docente, detectar automáticamente en las transcripciones de clase el momento en que el profesor comprueba si un estudiante ha seguido la intervención previa de un compañero, y agregar esa métrica por sesión.
- Investigación sobre discurso dialógico y TalkMoves: complementar el etiquetado de movimientos de conversación del TalkMoves Dataset con aserciones atómicas más finas, manteniendo trazabilidad entre la etiqueta, el texto y el criterio de codificación.
- Analítica de aula en tiempo casi real: si la transcripción se genera con ASR, el clasificador puede ejecutarse en CPU con latencia de milisegundos por intervención, lo que permite alimentar paneles de seguimiento durante o justo después de la sesión.
- Construcción de un detector multi-etiqueta: combinado con el resto de clasificadores de aserciones del proyecto EduBehaviors, cada uno entrenado sobre una aserción distinta, se puede construir un codificador completo de movimientos docentes ejecutando los clasificadores en paralelo sobre la misma intervención.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card. No están verificados de forma independiente (`verified: false`).

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.296 | 0,1 % | 1,000 | 0,500 | 0,667 | 0,996 | 0,562 |
| test | 8.240 | 0,1 % | 0,750 | 0,857 | 0,800 | 0,896 | 0,857 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables a un clasificador de esta naturaleza.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,44 GB solo para los pesos (109,5 M de parámetros); el repositorio completo ocupa 0,4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,22 GB para los pesos.
- VRAM estimada en int8: aproximadamente 0,11 GB para los pesos; no se publican pesos cuantizados, la conversión habría que hacerla el usuario.
- Cabe sin problema en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060, RTX 4090, e incluso en CPU para lotes pequeños.
- Para procesar volúmenes grandes, cualquier GPU con al menos 4 GB de VRAM es suficiente; el cuello de botella es el throughput del encoder, no la memoria.
- Opciones de despliegue: la vía nativa es `setfit` / `sentence-transformers` sobre PyTorch; el modelo también puede exportarse a ONNX o TorchScript para servir con ONNX Runtime, o envolverse en un servicio FastAPI. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, que están orientados a modelos generativos y no aplican aquí.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada resultados publicados de modelos comparables sobre el mismo dataset y la misma aserción. El único punto de referencia documentado es el propio corpus y sus métricas.

| Modelo | Parametros | Contexto | F1 (clase positiva, test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SetFit sobre paraphrase-mpnet-base-v2) | 109,5 M | No disponible | 0,800 | No disponible | HuggingFace, libreria setfit |
| sentence-transformers/paraphrase-mpnet-base-v2 (encoder base sin cabeza de clasificación) | 109,5 M | No disponible | No disponible (no es un clasificador) | No disponible en la informacion proporcionada | HuggingFace |
| Otros clasificadores de aserciones del proyecto EduBehaviors | No disponible | No disponible | No disponible | No disponible | HuggingFace (coleccion StanfordSCALE) |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento y evaluación provienen de anotadores LLM, no de codificadores humanos, aunque la concordancia entre anotadores es alta (Krippendorff's alpha = 0,909). Esto implica que el modelo reproduce el criterio del anotador automático, con sus posibles sesgos sistemáticos.
- El split de test contiene solo 7 ejemplos positivos, tal como advierte el propio autor. Las métricas de test (F1 = 0,800, ROC-AUC = 0,896) tienen un margen de error muy amplio y no deben interpretarse como estimaciones estables.
- Tasa base del 0,1 %: un clasificador que predijera siempre la clase negativa obtendría una exactitud del 99,9 %. La exactitud es una métrica inútil aquí; hay que trabajar con F1 de la clase positiva, average precision o curvas precisión-recall.
- El modelo se entrenó exclusivamente con intervenciones del profesorado. Su comportamiento sobre habla de estudiantes no está probado.
- Cobertura lingüística limitada al inglés; no se ha validado en otros idiomas ni en transcripciones con ruido de ASR.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos, especialmente con intervenciones que mencionan contribuciones previas sin pedir confirmación explícita.
- Licencia no disponible: no se puede confirmar que el uso comercial esté permitido. Conviene contactar con el autor antes de integrarlo en un producto.
- Es un clasificador de una sola aserción muy específica; no debe presentarse como un codificador general de discurso en el aula.
- La fecha de publicación del repositorio (2026-10-12) y el hecho de que tenga 0 descargas y 0 likes indican que es un artefacto recién publicado y sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_asks_one_or_more_students_whether_they_heard_a_prior_contribution
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (GitHub): https://github.com/SumnerLab/TalkMoves
- Perfil del autor en HuggingFace: https://huggingface.co/StanfordSCALE
- Paquete `EduBehaviors-kit`: mencionado en la model card, enlace no disponible
- Paper o publicación asociada al proyecto EduBehaviors: no disponible
- Demo: no disponible
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (contenido genérico sobre la red social X/Twitter), por lo que no se incluyen.
