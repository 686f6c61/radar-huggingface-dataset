# StanfordSCALE/assertion_sentence_has_disagreement_or_challenge

## Resumen

`StanfordSCALE/assertion_sentence_has_disagreement_or_challenge` es un clasificador binario de texto en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea es determinar si un enunciado de un docente contiene desacuerdo, cuestionamiento o desafío a lo dicho previamente en el aula. Se entrenó sobre un subconjunto anotado por LLM de intervenciones de profesorado del TalkMoves Dataset y se distribuye como modelo SetFit con un cuerpo basado en `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parámetros) y una cabeza de regresión logística.

Técnicamente no es un modelo generativo sino un clasificador de frases: SetFit combina un ajuste fino contrastivo del encoder de frases con un clasificador lineal sobre los embeddings resultantes, lo que permite entrenar con muy pocas etiquetas por clase. La etiqueta positiva es muy rara (tasa base del 5,7 % en test), lo que condiciona por completo su comportamiento y sus métricas.

Su relevancia es metodológica más que de rendimiento: forma parte de una familia de clasificadores de "aserciones" auditables sobre discurso educativo y su propia model card advierte de que el acuerdo entre anotadores (alfa de Krippendorff = 0,166) y el F1 en test (0,332) son malos. Debe tratarse, por tanto, como un componente de investigación o de preanotación asistida, nunca como un clasificador listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder de frases transformer (MPNet) congelado parcialmente + cabeza de regresión logística |
| Parametros totales | 109.486.464 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo se entrena sobre un unico enunciado, sin ventana multi-turno) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 0,4 GB) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Libreria | setfit |
| Pipeline | text-classification |
| Tarea | Clasificacion binaria: el enunciado contiene desacuerdo o desafio (si/no) |
| Columnas de salida | `assertion_sentence_has_disagreement_or_challenge`, `split_sentence_has_disagreement_or_challenge` |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit. En una primera fase contrastiva se ajusta el cuerpo `paraphrase-mpnet-base-v2` con learning rate 2e-05, batch size 16, 10 épocas y un máximo de 5.000 pasos, con precisión mixta activada en GPU. En la segunda fase se entrena una cabeza `LogisticRegression` con learning rate 0,01 y batch size 32 sobre los embeddings generados, con 100 pasos máximos de evaluación. La semilla utilizada es 20260904.

Los datos proceden del subconjunto `StanfordSCALE/assertions_llm_annotated_talkmoves`: 3.430 filas de entrenamiento (53,3 %), 858 de desarrollo (13,3 %) y 2.146 de test (33,4 %), todas ellas intervenciones de docentes. Las etiquetas fueron generadas por anotadores LLM, no por codificadores humanos, y el acuerdo entre anotadores medida con alfa de Krippendorff es de 0,166, un valor que la propia model card califica de pobre. La tasa base de la clase positiva es del 4,9 % global (4,7 % en train, 3,8 % en dev, 5,7 % en test). La entrada se construye pasando el enunciado tal cual, sin plantilla ni prefijo.

## Capacidades

- Clasificación binaria de un enunciado aislado en inglés: devuelve 1 si el enunciado contiene desacuerdo o desafío y 0 en caso contrario, junto con probabilidades vía `predict_proba`.
- Detección de movimientos discursivos de desacuerdo o cuestionamiento en intervenciones de profesorado en contextos de aula.
- Extracción de embeddings de frases mediante el encoder subyacente (utilizable para similitud semántica o agrupamiento, aunque no es el objetivo declarado).
- Integración en el flujo de trabajo del paquete Python `EduBehaviors-kit`, del que forma parte.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni generación de texto.
- No dispone de modo "thinking", visión ni audio.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Preanotación de corpus de discurso en el aula: dado que la clase positiva es rara (5,7 % en test), el modelo puede usarse para priorizar qué enunciados revisar primero, reduciendo el volumen de lectura manual, siempre con revisión humana posterior dado el bajo recall (0,260).
- Investigación educativa sobre patrones de cuestionamiento docente: permite obtener una primera capa de etiquetado sobre transcripciones ya existentes de TalkMoves y estudiar la distribución de desafíos a lo largo de una sesión.
- Comparación y auditoría de pipelines de anotación LLM: sirve como referencia reproducible frente a otros anotadores automáticos dentro del esquema de aserciones de EduBehaviors.
- Formación docente y reflexión sobre práctica: integrado en un panel que marque momentos de desacuerdo o desafío en una transcripción, un formador puede señalar episodios concretos para analizar la gestión del diálogo en clase.
- Filtrado de candidatos en un sistema de análisis de diálogo educativo: combinado con un segundo clasificador más preciso, actúa como etapa de recuperación de alta cobertura teórica antes de un verificador.
- Experimentos de aprendizaje con pocas etiquetas: al ser un modelo SetFit, es un punto de partida útil para investigar el rendimiento de este paradigma en clases muy desbalanceadas en dominios educativos.
- Análisis exploratorio de calidad de datos: comparar `predict` frente a las etiquetas originales ayuda a localizar filas dudosas del dataset anotado por LLM antes de reutilizarlo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados de forma independiente). Dataset de evaluación: `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 3,8 % | 0,333 | 0,182 | 0,235 | 0,794 | 0,272 |
| test | 2.146 | 5,7 % | 0,457 | 0,260 | 0,332 | 0,773 | 0,352 |

Métricas de test en el model-index: F1 0,3316, precision 0,4571, recall 0,2602, ROC-AUC 0,7731, todas marcadas como `verified: false`. No se han publicado resultados comparativos frente a otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación aritmética sobre 109,5 M de parámetros, no medida por el autor): ~438 MB en FP32, ~219 MB en FP16/BF16 y ~110 MB en INT8.
- Tamaño del repositorio: 0,4 GB, que incluye encoder y cabeza de clasificación.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes moderados.
- GPU recomendadas para despliegue a escala: T4, L4 o A10 para servicios de clasificación por lotes; A100/H100 no aportan ventaja significativa a este tamaño.
- Inferencia en CPU viable mediante PyTorch estándar o exportación a ONNX; no requiere GPUs de centro de datos.
- Opciones de despliegue: librería `setfit` (recomendada por el autor), `sentence-transformers`/PyTorch, exportación a ONNX Runtime o TorchScript. No aplica vLLM, TGI ni llama.cpp, ya que no es un modelo autoregresivo generativo.
- Latencia y throughput: no disponibles. Al procesar un único enunciado corto, la latencia dominante es el coste de codificación del encoder MPNet.

## Comparativa con modelos similares

No se dispone de datos de benchmark comparativos en la información proporcionada. Como referencias estructurales se pueden citar el modelo base y el enfoque alternativo más obvio, pero sin cifras comparables.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_sentence_has_disagreement_or_challenge | 109,5 M (mas cabeza logistica) | No disponible | Clasificacion binaria de desacuerdo/desafio en discurso de aula | No disponible | HuggingFace, libreria setfit |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base) | ~109 M | No disponible en la informacion proporcionada | Embeddings de frases (no clasificacion directa) | No disponible en la informacion proporcionada | HuggingFace |
| Clasificador supervisado clasico sobre embeddings (p. ej. regresion logistica sobre MPNet) | ~109 M | No disponible | Clasificacion binaria equivalente | Depende de la implementacion | Implementacion propia |

No se conocen alternativas publicadas con la misma tarea exacta (detección de desacuerdo en discurso educativo) en la información disponible, por lo que no es posible establecer una comparación de rendimiento fiable.

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores es de 0,166 según alfa de Krippendorff, un valor calificado como pobre en la propia model card: los datos subyacentes y las predicciones del modelo no son fiables.
- F1 en test de 0,332. El autor indica explícitamente que el modelo no funciona lo bastante bien como para usarse por sí solo.
- El recall es muy bajo (0,260 en test), por lo que se perderá la mayoría de los casos positivos reales.
- Entrenado únicamente con intervenciones de profesorado; el comportamiento sobre habla de estudiantes no se ha probado.
- Sesgos conocidos: no documentados de forma específica, pero al derivar de un corpus de aulas concretas (TalkMoves) y de anotación automática, hereda los sesgos de ambos.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos sistemáticos por el fuerte desbalanceo de clases.
- Idioma: solo inglés. Cualquier uso en castellano u otras lenguas carece de validación.
- Licencia: no disponible. No se puede confirmar la autorización para uso comercial; conviene contactar con el autor antes de integrarlo en un producto.
- El modelo no dispone de ventana de contexto multi-turno: clasifica un enunciado aislado, sin información del historial de la conversación, lo que limita su capacidad para juzgar desacuerdos que dependen del contexto previo.
- Uso responsable: emplearlo como capa de priorización con revisión humana, nunca como decisión automática.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_has_disagreement_or_challenge
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio): https://github.com/SumnerLab/TalkMoves
- Paquete Python `EduBehaviors-kit`: mencionado en la model card, sin enlace disponible
- Organizacion en HuggingFace: https://huggingface.co/StanfordSCALE
- Busqueda web: no se han encontrado enlaces relevantes al modelo, su paper o demos. Los resultados devueltos tratan sobre soporte de proveedores de software y no guardan relacion con esta ficha.
