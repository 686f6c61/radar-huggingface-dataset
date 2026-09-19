# StanfordSCALE/assertion_sentence_has_a_rhetorical_question

## Resumen

`StanfordSCALE/assertion_sentence_has_a_rhetorical_question` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas de aserciones para la codificación auditable de diálogo educativo. Su tarea concreta es determinar si una intervención docente contiene una pregunta retórica. Se construye con la librería SetFit sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` y una cabeza de regresión logística, con 109.486.464 parámetros en total y 0,4 GB de repositorio.

El modelo se entrena sobre una anotación automática (LLM annotators) de las intervenciones de profesorado del corpus TalkMoves, con 3.432 ejemplos de entrenamiento, 858 de desarrollo y 2.144 de prueba. Es relevante ahora porque forma parte de una línea de trabajo sobre anotación asistida de discurso de aula, pero sus propios autores advierten de que no es fiable de forma autónoma: la concordancia entre anotadores medida con alfa de Krippendorff es de 0,180 y el F1 de la clase positiva en test es de 0,176.

En la práctica, se trata de un artefacto de investigación para generar señales débiles de anotación y apoyar a codificadores humanos, no de un clasificador listo para producción. El idioma soportado es únicamente inglés y la licencia no está especificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SetFit: encoder de frases MPNet (paraphrase-mpnet-base-v2) + cabeza de clasificación `LogisticRegression` |
| Parámetros totales | 109.486.464 (~109,5 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; el encoder base paraphrase-mpnet-base-v2 tiene una longitud máxima de secuencia de 384 tokens |
| Tipos de cuantización | no disponible (no se publican variantes cuantizadas, GGUF ni ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (etiqueta declarada) y pesos PyTorch del modelo SetFit; tamaño del repositorio 0,4 GB |
| Pipeline | text-classification |
| Etiquetas de salida | binaria: `assertion_sentence_has_a_rhetorical_question` (columna relacionada en el dataset: `split_sentence_has_a_rhetorical_question`) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |

## Arquitectura y entrenamiento

SetFit combina dos fases. En la primera se ajusta el encoder MPNet de forma contrastiva generando pares de frases a partir de las etiquetas, con un learning rate de 2e-05, batch size de 16 y un máximo de 5.000 pasos. En la segunda se congela el encoder y se entrena una cabeza de regresión logística con learning rate de 0,01, batch size de 32 y 10 épocas, con evaluación cada 100 pasos. La semilla empleada es 20260904 y se activó precisión mixta en GPU.

Los datos provienen de una anotación automática de intervenciones de profesorado del TalkMoves Dataset, con 3.432 filas de entrenamiento (53,3 %), 858 de desarrollo (13,3 %) y 2.144 de prueba (33,3 %). La tasa base de ejemplos positivos es muy baja: 1,2 % global, con 1,3 % en train, 0,7 % en dev y 1,1 % en test, lo que deja solo 24 ejemplos positivos en test. La concordancia entre anotadores es de 0,180 según alfa de Krippendorff, un valor que los propios autores califican de pobre. No se documenta RLHF, DPO ni ninguna innovación de decodificación, ya que no es un modelo generativo.

## Capacidades

- Clasificación binaria de una única intervención (`utterance`) para decidir si contiene una pregunta retórica.
- Salida de probabilidad calibrada mediante `predict_proba`, además de la etiqueta discreta con `predict`.
- Integración con el paquete Python `EduBehaviors-kit` para pipelines de codificación de conductas educativas.
- Funciona como generador de señales débiles dentro de esquemas de anotación más amplios.
- No dispone de generación de texto, razonamiento, código, matemáticas ni capacidades multimodales.
- No soporta tool calling, function calling ni flujos de agentes.
- No tiene modo de razonamiento extendido ni salidas estructuradas más allá de la etiqueta y su probabilidad.
- Monolingüe: solo inglés; no se ha evaluado su comportamiento en otros idiomas.
- Entrenado exclusivamente con habla de profesorado; el comportamiento sobre intervenciones de alumnado no está probado.

## Casos de uso

- Pre-anotación de corpus de discurso de aula: el clasificador puede marcar candidatos a pregunta retórica en transcripciones de clase para que un codificador humano los revise, reduciendo el volumen de lectura manual en corpus grandes.
- Investigación educativa sobre patrones de interrogación: permite medir la frecuencia relativa de preguntas retóricas frente a preguntas genuinas en secuencias didácticas, siempre con validación manual de la muestra.
- Auditoría de esquemas de anotación en EduBehaviors: sirve como componente de un esquema de aserciones más amplio, donde cada aserción se evalúa por separado y se documenta su fiabilidad.
- Estudio metodológico sobre anotación con LLM: al publicar métricas muy bajas y alfa de Krippendorff de 0,180, es un caso útil para analizar los límites de la anotación automática en categorías de baja frecuencia.
- Filtrado y priorización en pipelines de anotación activa: las probabilidades de `predict_proba` permiten ordenar las intervenciones por probabilidad y enviar a revisión solo la cola superior.
- Formación y retroalimentación docente a nivel agregado: análisis de la proporción de preguntas retóricas en el discurso de un docente a lo largo de una sesión, con revisión humana obligatoria antes de cualquier conclusión.
- Lingüística computacional sobre actos de habla: uso del modelo como referencia de línea base para estudiar la detección automática de preguntas retóricas en contextos orales transcritos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card y en el model-index (métricas no verificadas):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 0,7 % | 0,000 | 0,000 | 0,000 | 0,737 | 0,101 |
| test | 2.144 | 1,1 % | 0,300 | 0,125 | 0,176 | 0,678 | 0,200 |

El model-index declara para el split de test: F1 (clase positiva) 0,1765, precision 0,3, recall 0,125 y ROC-AUC 0,6783. El propio autor señala que solo hay 24 ejemplos positivos en test, por lo que el margen de error es amplio, y que el modelo «no funciona lo bastante bien como para usarse por sí solo».

## Requisitos de hardware

- VRAM: aproximadamente 0,44 GB para los pesos en fp32 y en torno a 0,22 GB en fp16/bf16; con activaciones y tokenizador, menos de 1 GB en lotes pequeños.
- Cabe en cualquier GPU de consumo actual: GTX 1050 Ti (4 GB), GTX 1650, RTX 3060, RTX 4090, así como en iGPU con memoria compartida suficiente.
- Ejecución viable en CPU sin GPU, dado el tamaño del encoder (~109 M de parámetros) y la naturaleza no autorregresiva del modelo.
- Opciones de despliegue: `setfit` con PyTorch (ruta oficial documentada), `transformers` con la cabeza logística cargada aparte, `sentence-transformers` para generar embeddings y clasificar con la regresión logística, o exportación manual del encoder a ONNX Runtime. No se publican artefactos GGUF ni Ollama, y vLLM o TGI no aplican porque el modelo no es generativo.
- Latencia y throughput: no disponibles. No se han publicado medidas de latencia ni de frases por segundo.

## Comparativa con modelos similares

No se han identificado en la información disponible otros clasificadores directamente comparables de la misma colección. La referencia más cercana es el propio encoder base:

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_sentence_has_a_rhetorical_question | 109,5 M | no especificado (384 tokens en el encoder base) | F1 test 0,176; ROC-AUC test 0,678 | no disponible | HuggingFace, 0 descargas, 0 likes |
| sentence-transformers/paraphrase-mpnet-base-v2 | ~109 M | 384 tokens | no aplica (modelo de embeddings, sin clasificación) | no disponible en la información proporcionada | HuggingFace |
| Otros clasificadores de la misma tarea o tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos; el alfa de Krippendorff de 0,180 indica una concordancia pobre y el propio autor califica los datos y las predicciones de poco fiables.
- El F1 de la clase positiva en test es de 0,176 con recall de 0,125: el modelo omite la gran mayoría de los positivos reales.
- En el split de desarrollo, precision, recall y F1 son 0,000, lo que indica un fallo total de detección de la clase positiva en ese conjunto.
- Solo hay 24 ejemplos positivos en test, de modo que las métricas tienen un intervalo de confianza muy amplio.
- La tasa base de positivos es del 1,2 %, un desbalance extremo que favorece predicciones negativas.
- Entrenado únicamente con intervenciones de profesorado; su comportamiento con habla de alumnado no está evaluado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y, sobre todo, de falsos negativos sistemáticos.
- Monolingüe en inglés; no hay evidencia de transferencia a otros idiomas ni a variedades dialectales.
- La licencia no está especificada: antes de cualquier uso comercial debe aclararse con la Stanford SCALE Initiative.
- No debe usarse de forma autónoma en producción ni para tomar decisiones sobre docentes sin revisión humana explícita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_has_a_rhetorical_question
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Corpus TalkMoves: https://github.com/SumnerLab/TalkMoves
- Paquete Python de uso: `EduBehaviors-kit` (nombre indicado en la model card; no se proporciona URL)
- Cita recomendada por el autor: Stanford SCALE Initiative, «Assertion classifier: sentence has a rhetorical question», 2026, https://huggingface.co/StanfordSCALE/assertion_sentence_has_a_rhetorical_question
- Resultados de búsqueda web: no se ha recuperado ningún enlace relevante sobre el modelo; los resultados disponibles corresponden a páginas deportivas sin relación con este artefacto.
