# StanfordSCALE/assertion_sentence_seeks_or_gives_clarification

## Resumen

`assertion_sentence_seeks_or_gives_clarification` es un clasificador binario de texto en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas de codificación del discurso en el aula basados en aserciones auditables. Su tarea concreta es determinar si un enunciado docente busca o proporciona una aclaración, devolviendo una etiqueta booleana y una probabilidad asociada.

Técnicamente es un modelo SetFit: un cuerpo Sentence Transformer basado en `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parámetros) sobre el que se entrena una cabeza de regresión logística mediante aprendizaje contrastivo con pocos ejemplos por clase. Se distribuye a través de la librería `setfit` y del paquete Python `EduBehaviors-kit`, y fue entrenado sobre un subconjunto anotado por LLM del TalkMoves Dataset (3.428 ejemplos de entrenamiento, 860 de desarrollo y 2.146 de test).

Su relevancia es acotada y exploratoria: con un F1 de 0,506 en la clase positiva y una concordancia entre anotadores de solo 0,270 (alpha de Krippendorff), el propio autor lo califica de poco fiable. Resulta útil como componente de preanotación dentro de pipelines de investigación educativa y como línea base reproducible, no como sistema de decisión autónomo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SetFit (Sentence Transformer MPNet como cuerpo más cabeza de `LogisticRegression`) |
| Parámetros totales | 109.486.464 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base se distribuye habitualmente con 128 tokens de longitud máxima) |
| Tipos de cuantización | no disponible; no se documentan versiones cuantizadas (el modelo puede ejecutarse en fp32 o fp16 sin cuantizar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 0,4 GB, formato nativo de la librería `setfit`) |
| Modelo base | `sentence-transformers/paraphrase-mpnet-base-v2` |
| Tarea (pipeline) | text-classification |
| Dataset de entrenamiento | `StanfordSCALE/assertions_llm_annotated_talkmoves` |
| Columnas de entrada/salida | `assertion_sentence_seeks_or_gives_clarification`, `split_sentence_seeks_or_gives_clarification` |
| Tasa base de la clase positiva | 16,7 % global (16,6 % train, 17,4 % dev, 16,6 % test) |
| Fecha de publicación | 18 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit, diseñado para clasificación de texto con supervision limitada. En una primera fase contrastiva se ajusta el cuerpo `paraphrase-mpnet-base-v2` con un learning rate de 2e-05, batch size de 16 y un máximo de 5.000 pasos; en una segunda fase se entrena la cabeza de regresión logística con learning rate de 0,01, batch size de 32 y 10 épocas. Se usó precisión mixta en GPU y la semilla 20260904, con 100 pasos de evaluación máxima. La entrada se construye con la utterance en bruto, sin plantilla adicional: `{utterance}`.

Los datos proceden de un subconjunto del TalkMoves Dataset anotado por anotadores LLM sobre enunciados de docentes. La partición es de 3.428 filas de entrenamiento (53,3 %), 860 de desarrollo (13,4 %) y 2.146 de test (33,4 %). No se documenta el uso de RLHF ni DPO, algo esperable en un clasificador de este tipo. La innovación técnica es la propia eficiencia de SetFit: con una cabeza lineal y un ajuste contrastivo ligero se obtiene un clasificador de 109 M de parámetros entrenable en GPU de consumo, aunque en este caso el rendimiento resultante es limitado.

## Capacidades

- Clasificación binaria de una única utterance en inglés: predice si el enunciado busca o da una aclaración.
- Devuelve probabilidad calibrada mediante `predict_proba`, lo que permite fijar umbrales según el coste relativo de falsos positivos y falsos negativos.
- Integración directa con el ecosistema `setfit` y con el paquete `EduBehaviors-kit` para la codificación de diálogo educativo.
- Procesamiento por lotes a través de `SetFitModel.predict(list_of_texts)`, adecuado para corpus grandes.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un clasificador de una sola pasada, sin generación de texto.
- No tiene modo thinking, visión, audio ni capacidades multimodales.
- Multilingüismo: únicamente inglés; no se declara ningún otro idioma.

## Casos de uso

- Codificación automática del discurso en el aula: dado un corpus de transcripciones de clases, el modelo etiqueta cada intervención docente según si pide o aporta aclaraciones, alimentando las aserciones del esquema EduBehaviors sin necesidad de anotación manual completa.
- Preanotación para investigación educativa a escala: se ejecuta sobre miles de utterances para generar una primera capa de etiquetas que los codificadores humanos revisan después, reduciendo el coste de proyectos con presupuesto de anotación limitado.
- Filtrado y priorización de muestras activas: dado que la clase positiva es solo el 16,6 % del test, el modelo puede usarse para ordenar por probabilidad qué enunciados conviene revisar antes, optimizando el trabajo de anotadores expertos.
- Análisis de patrones de clarificación en formación docente: agregando las predicciones por sesión o por docente se pueden estudiar frecuencias y secuencias de peticiones de aclaración, siempre con revisión humana dado el bajo recall (0,448).
- Investigación en NLP educativo y creación de líneas base reproducibles: el modelo sirve como punto de comparación para clasificadores de talk moves, con hiperparámetros y semilla documentados.
- Enrutado previo en asistentes conversacionales educativos: combinado con un umbral alto de probabilidad, puede marcar intervenciones que requieren una respuesta aclaratoria, delegando la decisión final en un componente posterior más costoso.
- Auditoría de corpus ya etiquetados: aplicar el modelo a datos históricos para detectar discrepancias entre las etiquetas existentes y las predicciones, señalando posibles errores de anotación.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados):

| Split | n | Tasa base | Precision (clase positiva) | Recall (clase positiva) | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 860 | 17,4 % | 0,553 | 0,420 | 0,477 | 0,819 | 0,542 |
| test | 2.146 | 16,6 % | 0,580 | 0,448 | 0,506 | 0,827 | 0,561 |

El model-index publicado solo declara los valores de test: F1 0,5055, precision 0,5797, recall 0,4482 y ROC-AUC 0,8275. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en fp32 (109,5 M de parámetros a 4 bytes) y 0,22 GB en fp16; contando tokenizador, activaciones y la cabeza logística, menos de 1 GB en la práctica.
- GPU recomendadas: ninguna en concreto; el modelo es viable en CPU. Cualquier GPU con al menos 2 GB de memoria (GTX 1650, RTX 3060, RTX 4090) es más que suficiente. Aceleradores como A100 o H100 no aportan ventaja para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer actual e incluso en Raspberry Pi o instancias CPU pequeñas.
- Opciones de despliegue: `setfit`, `sentence-transformers`, exportación a ONNX mediante `optimum`, y servicio con FastAPI o contenedores Docker. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles. Al tratarse de un MPNet de 109 M de parámetros con cabeza lineal, el cuello de botella es la codificación del texto de entrada, no la clasificación.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada modelos comparables con métricas publicadas en el mismo dataset o en la misma tarea. La comparación queda limitada a referencias estructurales:

| Modelo | Parámetros | Contexto | F1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `StanfordSCALE/assertion_sentence_seeks_or_gives_clarification` | 109.486.464 | no disponible | 0,506 | no disponible | HuggingFace (0 descargas) |
| `sentence-transformers/paraphrase-mpnet-base-v2` (modelo base) | ~109 M | no disponible | no aplica (modelo de embeddings, no clasificador) | no disponible | HuggingFace |
| Otros clasificadores de aserciones de la suite StanfordSCALE | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Clasificadores alternativos tipo BERT/RoBERTa fine-tuned para discurso educativo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM y no de codificadores humanos; la concordancia medida con alpha de Krippendorff es 0,270, un valor que el propio autor califica de pobre.
- El autor advierte explícitamente de que las predicciones del modelo y los datos subyacentes no son fiables.
- F1 de 0,506 y recall de 0,448 en la clase positiva: se pierde más de la mitad de los casos positivos reales con el umbral por defecto.
- Entrenado exclusivamente con enunciados de docentes; el comportamiento sobre habla de estudiantes no está probado.
- Rendimiento no verificado: los resultados del model-index están marcados como `verified: false`.
- Idioma limitado al inglés; no hay evidencia de transferencia a otros idiomas.
- No se declara licencia, por lo que el uso comercial queda en un limbo legal y requiere contacto con el autor.
- No es un modelo generativo: no produce alucinaciones de texto, pero sí puede generar falsos positivos sistemáticos en construcciones interrogativas que no piden aclaración real.
- Sesgos: al derivar de grabaciones de aula del TalkMoves Dataset, hereda la distribución de ese corpus (nivel educativo, materia, estilo docente y variedad dialectal), sin documentación de análisis de sesgo.
- No debe usarse para evaluación de docentes ni decisiones de alto impacto sin revisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_seeks_or_gives_clarification
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio): https://github.com/SumnerLab/TalkMoves
- Cita del autor: Stanford SCALE Initiative, "Assertion classifier: sentence seeks or gives clarification", 2026.
- Nota: la búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo ni sobre el proyecto EduBehaviors; los resultados obtenidos correspondían a servicios de nube ajenos al modelo.
