# StanfordSCALE/assertion_sentence_invites_participation

## Resumen

`StanfordSCALE/assertion_sentence_invites_participation` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificación auditable de diálogo educativo. El modelo determina si un enunciado de un docente (una "aserción") invita a la participación del alumnado, una de las múltiples etiquetas del esquema de codificación de talk moves. Se distribuye como parte del ecosistema del paquete Python `EduBehaviors-kit`.

Técnicamente es un clasificador SetFit: el cuerpo es el sentence transformer `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet, 109.486.464 parámetros en total según los pesos safetensors, 0,4 GB de repositorio) y la cabeza es una regresión logística entrenada sobre los embeddings generados. Está entrenado sobre un subconjunto anotado por LLM del TalkMoves Dataset, con 3.430 ejemplos de entrenamiento, 860 de desarrollo y 2.144 de test, y una tasa base de la clase positiva del 24,3 %.

Su relevancia es acotada pero específica: cubre una tarea de nicho (investigación sobre discurso en el aula) con una arquitectura ligera que puede ejecutarse en CPU, y forma parte de un esfuerzo más amplio por hacer auditables las etiquetas de codificación educativa generadas automáticamente. El modelo solo soporta inglés, la licencia no está declarada y no registra descargas ni "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: sentence transformer MPNet (`paraphrase-mpnet-base-v2`) como cuerpo de embeddings + cabeza de regresión logística |
| Parametros totales | 109.486.464 (pesos safetensors; incluye cuerpo MPNet y cabeza) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (la model card no especifica el máximo de tokens por enunciado) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión completa) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Libreria | setfit |
| Tarea | Clasificación binaria: `assertion_sentence_invites_participation` |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit, un esquema de ajuste eficiente en datos para clasificación de texto. En una primera fase contrastiva se ajusta el cuerpo (`paraphrase-mpnet-base-v2`, un MPNet de tipo sentence transformer) con un learning rate de 2e-05, batch size de 16 y un máximo de 5.000 pasos. En una segunda fase se entrena una cabeza de regresión logística con learning rate de 0,01 y batch size de 32. El entrenamiento completo usa 10 épocas, precisión mixta activada en GPU, semilla 20260904 y un máximo de 100 pasos de evaluación.

Los datos provienen del subconjunto anotado por LLM del TalkMoves Dataset, restringido a enunciados de docentes. La entrada se construye pasando la intervención tal cual (`{utterance}`), sin plantilla adicional. Las etiquetas no son de codificadores humanos: fueron generadas por anotadores LLM, con un acuerdo entre anotadores medido por alfa de Krippendorff de 0,610 para esta aserción concreta. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna técnica de alineación adicional; tampoco se especifica el número total de tokens de entrenamiento ni la composición completa del corpus más allá del TalkMoves Dataset.

## Capacidades

- Clasificación binaria de enunciados docentes en inglés: predice si la intervención invita a la participación del alumnado (`predict`) y devuelve probabilidades por clase (`predict_proba`).
- Codificación de talk moves dentro del esquema de aserciones EduBehaviors, concretamente la columna `assertion_sentence_invites_participation`.
- Integración con el paquete Python `EduBehaviors-kit` para pipelines de codificación de diálogo educativo auditable.
- Ejecución ligera: al ser un SetFit con cabeza logística, la inferencia es de baja latencia y viable en CPU.
- Capacidades multilingües: no. El modelo está entrenado y declarado únicamente para inglés.
- Tool calling / function calling: no soportado (es un clasificador, no un modelo generativo).
- Modo agente o razonamiento multi-paso: no soportado.
- Capacidades especiales (visión, audio, modo "thinking"): no disponibles.

## Casos de uso

- Codificación de transcripciones de aula a escala: dado un corpus de transcripciones de clases (por ejemplo, del TalkMoves Dataset), el modelo etiqueta automáticamente qué intervenciones docentes invitan a participar, evitando el coste de codificación manual en estudios con miles de turnos.
- Investigación educativa sobre patrones de participación: permite calcular la proporción de turnos que invitan a participar por sesión, docente o asignatura, y correlacionarla con otras variables del estudio.
- Evaluación de programas de formación docente: usar la tasa de turnos que invitan a participar como métrica objetiva antes y después de una intervención formativa, con la advertencia de que las etiquetas de referencia son de LLM, no humanas.
- Componente dentro de un pipeline EduBehaviors completo: el modelo se invoca como uno más de los clasificadores de aserciones (junto con otras etiquetas de talk moves) para construir una representación estructurada de cada transcripción.
- Triaje previo en análisis cualitativo: filtrar automáticamente los turnos con alta probabilidad de invitar a participar y reducir el volumen que un codificador humano debe revisar, usando `predict_proba` para priorizar los casos de alta confianza.
- Observación de aula asistida en plataformas educativas: integrar el clasificador como servicio interno que devuelve etiquetas por turno para generar informes automáticos de interacción en el aula.
- Análisis histórico de grabaciones: procesar transcripciones archivadas de cursos anteriores para detectar tendencias en las prácticas de participación a lo largo del tiempo, dado el bajo coste computacional por inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card. Las métricas del model-index figuran con `verified: false`, es decir, no han sido verificadas de forma independiente. Base rate de la clase positiva: 24,8 % en test y 25,5 % en desarrollo.

| Split | n | Base rate | Precision (clase positiva) | Recall (clase positiva) | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 860 | 25,5 % | 0,772 | 0,712 | 0,741 | 0,908 | 0,803 |
| test | 2.144 | 24,8 % | 0,795 | 0,709 | 0,750 | 0,920 | 0,805 |

Resumen del model-index para el split de test: F1 = 0,7495, precision = 0,7954, recall = 0,7086, ROC-AUC = 0,9203.

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible; no proceden para este tipo de clasificador especializado.

## Requisitos de hardware

- Memoria de pesos en FP32: aproximadamente 438 MB (109,5 M de parámetros). El repositorio completo ocupa 0,4 GB.
- Memoria en FP16/BF16: aproximadamente 219 MB para los pesos.
- La cabeza de regresión logística es despreciable en tamaño frente al cuerpo MPNet; el consumo dominante es el del sentence transformer.
- Inferencia en CPU: viable y suficiente para la mayoría de escenarios, dado el tamaño del modelo y que la tarea es una clasificación binaria sobre embeddings.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sobra para este modelo; se puede ejecutar en tarjetas de gama baja y en GPU de datacenter (T4, A100, H100) sin que estas últimas aporten ventaja por memoria.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años (GTX 1050 en adelante, RTX 3060, RTX 4090, etc.). También es viable en CPU sin GPU.
- Opciones de despliegue: la vía documentada es la librería `setfit` (`SetFitModel.from_pretrained`). Alternativamente, el cuerpo es un sentence transformer estándar, por lo que puede reconstruirse con `sentence-transformers` más un clasificador de scikit-learn equivalente. No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI, ni exportación a GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. Se trata de un clasificador SetFit de nicho (discurso educativo en inglés) y no se han documentado alternativas equivalentes ni resultados cruzados con otros clasificadores de talk moves.

| Modelo | Parametros | Contexto | Licencia | Tarea | Rendimiento publicado |
|---|---|---|---|---|---|
| `StanfordSCALE/assertion_sentence_invites_participation` | 109,5 M | no disponible | no disponible | Clasificación binaria de aserciones docentes (inglés) | F1 test 0,750; ROC-AUC test 0,920 |
| `sentence-transformers/paraphrase-mpnet-base-v2` (modelo base) | no disponible en la información proporcionada | no disponible | no disponible | Embeddings de frases (no clasificación directa) | no disponible |
| Otras aserciones del esquema EduBehaviors (misma familia) | no disponible | no disponible | no disponible | Clasificación de otras etiquetas de talk moves | no disponible |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento y de evaluación provienen de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores es de alfa de Krippendorff = 0,610, un valor moderado que introduce ruido en el techo de rendimiento alcanzable.
- El modelo se entrenó únicamente con enunciados de docentes. Su comportamiento sobre habla de estudiantes no ha sido probado.
- Idiomas: solo inglés. No hay evidencia de transferencia a otros idiomas.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible, pero al entrenarse sobre un corpus educativo concreto (TalkMoves) puede reflejar los patrones de estilo docente, materia, nivel educativo y contexto sociocultural de ese corpus.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos. Con una precisión de 0,795 y un recall de 0,709 en test, el modelo deja sin detectar aproximadamente un 29 % de los casos positivos.
- Uso comercial: la licencia no está declarada, por lo que no puede asumirse permiso de uso comercial sin consultar al autor.
- La model card no especifica la longitud máxima de entrada ni el preprocesado del texto más allá de pasar la intervención tal cual; entradas muy largas pueden comportarse de forma no documentada.
- Los resultados del model-index figuran como no verificados (`verified: false`) y proceden del propio autor.
- El modelo tiene 0 descargas y 0 "likes", lo que indica que no ha sido validado por la comunidad.
- No se documentan procesos de alineación, filtrado de contenido ni evaluación de robustez ante texto adversario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_invites_participation
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio original): https://github.com/SumnerLab/TalkMoves
- Paquete Python asociado: `EduBehaviors-kit` (mencionado en la model card; no se proporciona URL)

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card del autor.
