# StanfordSCALE/assertion_invites_writing_on_the_board

## Resumen

`StanfordSCALE/assertion_invites_writing_on_the_board` es un clasificador de texto binario desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors ("Assertion-based schemas for auditable dialogue coding"). No es un modelo generativo: es un clasificador SetFit que determina si un enunciado de un docente contiene la aserción `td__the_utterance_invites_writing_on_the_board`, es decir, si la intervención invita a escribir en la pizarra. Se usa a través del paquete de Python `EduBehaviors-kit`.

El modelo parte del encoder `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet, 109.486.464 parámetros, aproximadamente 0,4 GB de repositorio) y le añade una cabeza de regresión logística entrenada con SetFit sobre el subconjunto anotado por LLM del TalkMoves Dataset. El resultado es un artefacto ligero, entrenable y ejecutable sin GPU, pensado para codificar discurso de aula a escala.

Su relevancia es doble. Por un lado, permite anotar automáticamente corpus de interacción en el aula con un esquema auditable y reproducible, algo que hasta ahora requería codificadores humanos con alta carga de trabajo. Por otro, aborda una tarea de clase muy desbalanceada: la tasa base de la etiqueta positiva es del 0,4 %, y el modelo alcanza un F1 de 0,6765 y un ROC-AUC de 0,8489 en el conjunto de test, con una precisión del 0,8214 y un recall del 0,575.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer MPNet (base `sentence-transformers/paraphrase-mpnet-base-v2`) con cabeza de clasificación `LogisticRegression`; pipeline SetFit (fase contrastiva + cabeza lineal) |
| Parámetros totales | 109.486.464 (dato de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base de sentence-transformers se distribuye habitualmente con una longitud máxima de secuencia de 384 tokens |
| Tipos de cuantización | no disponible; al ser un clasificador de 109 M de parámetros, la cuantización no es un requisito práctico para su despliegue |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según las etiquetas del repositorio); el artefacto se carga mediante la librería `setfit` |
| Tarea | text-classification (clasificación binaria de una aserción) |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Tamaño del repositorio | 0,4 GB |
| Librería | setfit |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: se parte de un sentence transformer preentrenado (MPNet, 109 M de parámetros) y se realiza primero una fase contrastiva en la que se generan pares de oraciones a partir de las etiquetas, ajustando el cuerpo del encoder con un learning rate de 2e-05, batch size de 16 y un máximo de 5.000 pasos. Después se congela el encoder y se entrena una cabeza `LogisticRegression` con learning rate de 0,01, batch size de 32, 10 épocas y 100 pasos máximos de evaluación. Se usó semilla 20260904 y precisión mixta en GPU. El texto de entrada es el enunciado tal cual, sin plantilla ni prefijo adicional.

Los datos proceden del subconjunto anotado por LLM del TalkMoves Dataset, con 13.183 filas de entrenamiento (53,3 %), 3.296 de desarrollo (13,3 %) y 8.236 de test (33,3 %). Las etiquetas las generaron anotadores LLM, no codificadores humanos, y el acuerdo entre anotadores medido con alfa de Krippendorff es de 0,744. La tasa base de la clase positiva es del 0,4 % global (0,4 % en train, 0,4 % en dev, 0,5 % en test), lo que convierte el problema en un caso de detección de eventos raros con fuerte desbalanceo. El modelo solo se ha entrenado con intervenciones de docentes.

## Capacidades

- Clasificación binaria de un enunciado de docente según la aserción "el enunciado invita a escribir en la pizarra", devolviendo `1` cuando la aserción se cumple.
- Puntuación probabilística mediante `predict_proba`, útil para umbralizar y ajustar el equilibrio entre precisión y recall en producción.
- Codificación de habla de aula a escala sobre corpus de investigación educativa, con un esquema explícito y auditable.
- Integración con el ecosistema SetFit y con el paquete `EduBehaviors-kit` para la codificación de diálogo basada en aserciones.
- Ejecución en CPU: no requiere GPU ni cuantización para funcionar, dado su tamaño de 109 M de parámetros.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, capacidades de agente, visión ni audio.
- Capacidad multilingüe: ninguna declarada; el modelo es solo para inglés.
- Capacidad especial: forma parte de un conjunto de aserciones top-down (`td`) dentro de un marco de codificación auditable, lo que facilita la trazabilidad de la anotación.

## Casos de uso

- Anotación automática de corpus educativos a gran escala: el clasificador permite etiquetar miles de enunciados docentes del TalkMoves Dataset o de corpus propios sin intervención humana, algo inviable con codificadores manuales dado el volumen de datos.
- Preanotación para reducir la carga de codificadores humanos: se usa el modelo como primer paso y los codificadores revisan únicamente los casos con probabilidad intermedia, aprovechando la alta precisión (0,8214) para no generar falsos positivos excesivos.
- Análisis cualitativo asistido: filtrar automáticamente los episodios en los que el docente invita a escribir en la pizarra para seleccionar fragmentos representativos que después se analizan de forma manual y detallada.
- Investigación sobre discurso instruccional: medir la frecuencia de esta práctica en distintas aulas, asignaturas o niveles educativos y correlacionarla con otras variables del corpus.
- Formación de profesorado y feedback formativo: generar informes que cuantifiquen con qué frecuencia el docente emplea esta estrategia y en qué momentos, a partir de transcripciones de clase.
- Sincronización con material multimodal: al identificar el instante del enunciado, se puede alinear la transcripción con la señal de vídeo o pizarra digital para estudios de multimodalidad en el aula.
- Auditoría de sistemas educativos basados en IA: al ser un componente pequeño, determinista y con métricas declaradas, es adecuado para auditar cómo se codifica una conducta docente concreta sin depender de un LLM generativo opaco.
- Construcción de pipelines reproducibles: al integrarse en `EduBehaviors-kit` con instrucciones de uso explícitas, se puede incorporar en cuadernos de análisis versionados y reproducibles.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas no verificadas por terceros). Dataset: `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision (clase positiva) | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.296 | 0,4 % | 0,500 | 0,143 | 0,222 | 0,810 | 0,289 |
| test | 8.236 | 0,5 % | 0,8214 | 0,575 | 0,6765 | 0,8489 | 0,566 |

La diferencia entre desarrollo y test es notable: la precisión pasa de 0,500 a 0,8214 y el F1 de 0,222 a 0,6765, lo que sugiere que el conjunto de dev, con solo 3.296 filas y una tasa base del 0,4 %, contiene muy pocos ejemplos positivos y sus métricas son poco estables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en fp32 y 0,22 GB en fp16 para los 109,5 M de parámetros; con cuantización int8 bajaría a unos 0,11 GB. Estas cifras son estimaciones derivadas del recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: no se necesita GPU. Cualquier GPU con al menos 1 GB de memoria libre es suficiente; el modelo cabe holgadamente en tarjetas de gama de entrada e incluso en gráficas integradas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual (por ejemplo, serie RTX 40, RTX 30, GTX 16 o inferiores), y también en CPU sin GPU dedicada.
- Opciones de despliegue: `setfit` (vía `SetFitModel.from_pretrained`), el ecosistema `sentence-transformers`, y exportación a ONNX Runtime para inferencia en CPU si se necesita mayor throughput.
- vLLM, TGI o llama.cpp no aplican: no es un modelo generativo autorregresivo.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de throughput en la información proporcionada.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables con métricas publicadas sobre esta misma tarea. La model card indica que la aserción pertenece al conjunto top-down `td`, lo que sugiere la existencia de clasificadores hermanos para otras aserciones dentro de EduBehaviors, pero no se dispone de sus resultados. Como referencia estructural, se compara con su propio backbone:

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_invites_writing_on_the_board | 109.486.464 | no disponible | F1 0,6765; ROC-AUC 0,8489 (test) | no disponible | HuggingFace, librería `setfit` |
| sentence-transformers/paraphrase-mpnet-base-v2 (backbone sin cabeza) | 109.486.464 | 384 tokens (valor habitual del modelo base) | no disponible (no está ajustado para esta aserción) | no disponible en esta información | HuggingFace |
| Otros clasificadores de aserciones de EduBehaviors | no disponible | no disponible | no disponible | no disponible | no disponible |
| LLM generativo usado como anotador | no disponible | no disponible | no disponible (alfa de Krippendorff de 0,744 como acuerdo entre anotadores) | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores es de 0,744 según alfa de Krippendorff, de modo que existe un techo de ruido en las etiquetas que afecta directamente al rendimiento alcanzable.
- El modelo se entrenó únicamente con enunciados de docentes. Su comportamiento sobre habla de estudiantes no se ha evaluado y no está garantizado.
- Clase muy desbalanceada: la tasa base es del 0,4 % en entrenamiento y del 0,5 % en test. Un clasificador trivial que always prediga la clase negativa acertaría más del 99 % de las filas, por lo que la exactitud (accuracy) no es una métrica informativa aquí.
- El recall en test es de 0,575: aproximadamente el 42,5 % de los casos positivos reales no se detectan. Para uso en investigación esto puede infraestimar la frecuencia real de la conducta.
- Las métricas de dev son sustancialmente peores que las de test (F1 0,222 frente a 0,6765), lo que indica alta varianza por el reducido número de positivos en dev; conviene no usar dev para seleccionar umbrales de forma fiable.
- Las métricas declaradas no están verificadas por terceros (`verified: false` en el model-index). Deben tratarse como resultados del autor.
- Idioma: solo inglés. No hay evaluación en castellano ni en otros idiomas, por lo que su uso sobre transcripciones en español no está respaldado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es un riesgo relevante para cualquier despliegue en producto; conviene contactar con el autor antes de usarlo comercialmente.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no genera texto. El riesgo equivalente es de falsos positivos y falsos negativos en la clasificación.
- Sesgos conocidos: no se documentan análisis de sesgo por asignatura, nivel educativo, género del docente o variedad dialectal. El corpus TalkMoves tiene un contexto de recogida específico que puede no generalizar a otras aulas.
- El ámbito de aplicación es muy estrecho: una única aserción, definida en un marco concreto de codificación. No debe reutilizarse como clasificador general de discurso educativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_invites_writing_on_the_board
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio GitHub): https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit`: mencionado en la model card, sin URL disponible en la información proporcionada
- Paper o blog técnico del proyecto EduBehaviors: no disponible
- Demo: no disponible
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente contenido no relacionado (foros sobre comercio de segunda mano).
