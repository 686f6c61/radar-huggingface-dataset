# StanfordSCALE/assertion_sentence_has_negation_or_denial

## Resumen

`StanfordSCALE/assertion_sentence_has_negation_or_denial` es un clasificador binario de texto en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea es determinar si una intervención docente (una "assertion") contiene una negación o una denegación explícita. Se distribuye como modelo SetFit: un encoder `sentence-transformers/paraphrase-mpnet-base-v2` afinado con aprendizaje contrastivo más una cabeza de regresión logística. El conjunto de pesos ocupa 109.486.464 parámetros (~0,4 GB en el repositorio).

El modelo está pensado para la codificación automática de discurso de aula: procesa transcripciones de profesorado y etiqueta cada aserción según la presencia de negación o denegación, una de las variables de los esquemas de *talk moves* del proyecto. Se entrenó sobre el subconjunto anotado por LLM de `StanfordSCALE/assertions_llm_annotated_talkmoves` (3.430 ejemplos de entrenamiento, 858 de desarrollo y 2.146 de test), derivado del TalkMoves Dataset, y se integra con el paquete Python `EduBehaviors-kit`.

Su relevancia práctica es doble: por un lado, permite auditar grandes volúmenes de diálogo educativo con un coste computacional mínimo (encoder de 109 M de parámetros, ejecutable en CPU); por otro, sirve como ejemplo de esquema de anotación auditable con acuerdo entre anotadores cuantificado (alfa de Krippendorff de 0,902). La tasa base de la clase positiva es baja (7,2 % global), por lo que las métricas relevantes son F1 de la clase positiva y ROC-AUC, no la exactitud.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder transformer MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) afinado de forma contrastiva + cabeza de clasificación `LogisticRegression` |
| Parametros totales | 109.486.464 (dato real de los archivos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, AWQ, GPTQ ni similares en la información proporcionada) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria de inferencia | setfit |
| Tamano del repositorio | 0,4 GB |
| Tarea (pipeline) | text-classification |
| Numero de etiquetas | 2 (positiva: contiene negación o denegación; negativa) |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Creado / actualizado | 2026-09-18 / 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit, diseñado para clasificación de texto con pocos datos etiquetados. El cuerpo es el encoder MPNet de `paraphrase-mpnet-base-v2`, que se afina en una primera fase contrastiva (batch size 16, learning rate 2e-05, hasta 5.000 pasos máximos, 100 pasos máximos de evaluación). Sobre las representaciones resultantes se entrena una cabeza de regresión logística (learning rate 0,01, batch size 32) durante 10 épocas. El entrenamiento usó semilla 20260904 y precisión mixta activada en GPU.

Los datos proceden de un subconjunto anotado por anotadores LLM de intervenciones de profesorado del TalkMoves Dataset. La partición es de 3.430 filas de entrenamiento (53,3 %), 858 de desarrollo (13,3 %) y 2.146 de test (33,4 %). Las columnas relevantes del dataset son `assertion_sentence_has_negation_or_denial` y `split_sentence_has_negation_or_denial`. El acuerdo entre anotadores para esta aserción, medido con alfa de Krippendorff, es de 0,902. La tasa base de la clase positiva es del 7,2 % global (7,6 % en train, 6,1 % en dev, 6,9 % en test), un desbalanceo acusado que condiciona la interpretación de cualquier métrica. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa; tampoco el número total de tokens de entrenamiento. La entrada se construye pasando la intervención tal cual, sin plantilla: `{utterance}`.

## Capacidades

- Clasificación binaria de texto en inglés: decide si una intervención contiene negación o denegación.
- Salida probabilística mediante `predict_proba`, con `predict` devolviendo 1 cuando la aserción se cumple; permite fijar umbrales según el coste relativo de falsos positivos y falsos negativos.
- Inferencia sobre intervenciones individuales o listas de intervenciones (API de `SetFitModel`).
- Integración en el ecosistema educativo del proyecto mediante el paquete Python `EduBehaviors-kit`.
- Codificación de discurso de aula restringido a intervenciones de profesorado (el modelo fue entrenado solo con ese tipo de emisiones).
- No dispone de generación de texto, razonamiento multi-paso, tool calling, función de agente, visión, audio ni modo de pensamiento: es exclusivamente un clasificador.
- No tiene capacidades multilingües: solo inglés.

## Casos de uso

- Codificación automática de transcripciones de aula: cada intervención del docente se pasa directamente al modelo (`{utterance}`) y se obtiene una etiqueta binaria de negación o denegación, lo que permite codificar miles de turnos sin anotación manual.
- Investigación educativa a escala: aplicar el clasificador a corpus completos de TalkMoves para medir la prevalencia de aserciones negativas por sesión, asignatura o docente, con la ventaja de que la etiqueta tiene un acuerdo entre anotadores documentado (alfa de 0,902).
- Prefiltrado en pipelines híbridos: usar el clasificador como primera etapa barata (109 M de parámetros, sin GPU necesaria) y reservar un LLM de mayor coste solo para los casos ambiguos o para tareas que exijan generación.
- Auditoría de diálogo docente: generar registros trazables de qué aserciones contienen negación o denegación, útiles para revisar patrones de interacción en programas de formación del profesorado.
- Anotación asistida con humano en el bucle: preetiquetar con `predict_proba` y ordenar por probabilidad para que las personas revisoras se centren en los casos cercanos al umbral, reduciendo el esfuerzo de anotación.
- Construcción de cuadros de mando para formadores: agregar las predicciones por sesión y visualizar la evolución del uso de negaciones y denegaciones a lo largo de un curso.
- Investigación metodológica sobre anotación con LLM: comparar las etiquetas del clasificador con codificaciones humanas para estudiar la fiabilidad de los esquemas de anotación automática.
- Enrutado dentro de un sistema mayor de análisis de discurso: usar la etiqueta como característica de entrada para modelos posteriores que modelen secuencias de *talk moves*.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`verified: false`, es decir, no verificados de forma independiente):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 6,1 % | 0,904 | 0,904 | 0,904 | 0,997 | 0,937 |
| test | 2.146 | 6,9 % | 0,917 | 0,966 | 0,941 | 0,987 | 0,956 |

Desglose del model-index para el split de test: F1 (clase positiva) 0,9408; precision (clase positiva) 0,9167; recall (clase positiva) 0,9662; ROC-AUC 0,9875.

No se han proporcionado en la información disponible resultados de benchmarks de otros modelos comparables sobre el mismo conjunto de datos.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 438 MB solo para los pesos (109.486.464 parámetros × 4 bytes), más el sobrecoste de activaciones y del runtime, por lo que en la práctica se puede operar con menos de 1 GB de memoria dedicada.
- VRAM estimada en fp16/bf16: aproximadamente 219 MB para los pesos, más activaciones.
- Cabe sin problema en GPU de consumo: cualquier GPU con 2 GB o más (GTX 1650, RTX 3050, RTX 4090, etc.). Una RTX 4090 está enormemente sobredimensionada para este modelo.
- Ejecución viable en CPU: al ser un encoder de 109 M de parámetros con una cabeza logística, es un candidato claro para inferencia en CPU, incluidas máquinas de desarrollo portátiles. No hay datos publicados de latencia ni de throughput.
- Opciones de despliegue documentadas: la propia librería `setfit` (`SetFitModel.from_pretrained`). Requiere `pip install setfit`.
- Otras opciones de despliegue (exportación a ONNX, servidores de embeddings o clasificadores, contenedores de inferencia) no están documentadas en la información proporcionada, por lo que deben validarse antes de asumirlas en producción.
- Latencia y throughput: no disponibles (no publicados por el autor).

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de alternativas sobre el mismo conjunto de datos en la información proporcionada, por lo que la comparación numérica de rendimiento queda como no disponible.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_sentence_has_negation_or_denial | SetFit (MPNet + regresión logística) | 109.486.464 | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes |
| sentence-transformers/paraphrase-mpnet-base-v2 | Encoder MPNet (modelo base, sin cabeza de clasificación) | no disponible | no disponible | no disponible | HuggingFace |
| Clasificador zero-shot mediante prompting de un LLM | Modelo generativo con prompting | no disponible | no disponible | según el proveedor | API o despliegue propio |

Nota: la comparación con la alternativa zero-shot es cualitativa; el modelo aquí descrito requiere datos etiquetados y produce una probabilidad calibrada sobre una tarea muy concreta, mientras que un LLM con prompting no necesita entrenamiento específico pero no ofrece una métrica de acuerdo entre anotadores documentada para esta etiqueta.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores es de alfa de Krippendorff 0,902, lo que implica un margen de error inherente a la etiqueta de referencia.
- El modelo se entrenó únicamente con intervenciones de profesorado. Su comportamiento sobre habla de estudiantes no está probado y no debería asumirse.
- Fuerte desbalanceo de clases: la clase positiva representa solo el 7,2 % del total (6,9 % en test). La exactitud es una métrica engañosa; deben usarse F1 de la clase positiva, ROC-AUC o average precision.
- Las métricas publicadas están marcadas como no verificadas (`verified: false`) y proceden del propio autor; no hay evaluación independiente.
- Idioma limitado al inglés: no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es un riesgo jurídico relevante antes de integrarlo en un producto.
- No se documentan la longitud de contexto soportada ni el comportamiento con intervenciones muy largas; conviene truncar o dividir el texto de entrada y validarlo con datos propios.
- Riesgo de falsos positivos en precision (0,917 en test): aproximadamente 1 de cada 12 predicciones positivas podría no serlo, siempre según los datos del autor.
- Naturaleza de la tarea: es un clasificador de una única variable lingüística (presencia de negación o denegación) y no debe utilizarse para tareas generativas, de razonamiento ni de extracción de información compleja.
- Al depender de la librería `setfit`, conviene fijar versiones en producción para evitar cambios de API o de comportamiento en la carga del modelo.
- No hay métricas de latencia, throughput ni consumo energético publicadas, por lo que los requisitos de un despliegue a gran escala deben medirse en el entorno objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_has_negation_or_denial
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- TalkMoves Dataset (repositorio GitHub): https://github.com/SumnerLab/TalkMoves
- Paquete Python `EduBehaviors-kit`: mencionado en la model card, URL no disponible
- Cita sugerida por el autor:
  ```
  @misc{assertion_sentence_has_negation_or_denial,
    author = {Stanford SCALE Initiative},
    title  = {Assertion classifier: sentence has negation or denial},
    year   = {2026},
    url    = {https://huggingface.co/StanfordSCALE/assertion_sentence_has_negation_or_denial}
  }
  ```
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
