# StanfordSCALE/assertion_references_student_behavior

## Resumen

Assertion: references student behavior es un clasificador de texto binario desarrollado por la Stanford SCALE Initiative, publicado bajo el identificador StanfordSCALE/assertion_references_student_behavior. No es un modelo generativo, sino un clasificador SetFit (Sentence Transformer Fine-tuning) cuyo cuerpo es el encoder sentence-transformers/paraphrase-mpnet-base-v2 (109.486.464 parametros) y cuya cabeza es una regresion logistica. Su tarea concreta es determinar si un enunciado de un docente hace referencia al comportamiento o a las contribuciones de un estudiante durante una interaccion en el aula.

El modelo forma parte del conjunto de aserciones bottom-up `bu5` del proyecto EduBehaviors: Assertion-based schemas for auditable dialogue coding, y se consume a traves del paquete Python `EduBehaviors-kit`. Se entreno sobre un subconjunto anotado por LLM de intervenciones de docentes procedentes del TalkMoves Dataset. La tarea se enmarca en el analisis automatizado del discurso en el aula (classroom discourse) y en la codificacion auditable de conductas educativas.

Su relevancia es limitada y muy especializada: se trata de un componente de investigacion con 0 descargas y 0 likes en el momento de la ficha, con metricas moderadas en test (F1 de 0.5122 sobre la clase positiva) y una fiabilidad de etiquetado baja reconocida por los propios autores (alfa de Krippendorff de 0.206). No es adecuado como modelo de proposito general, sino como pieza de un pipeline de investigacion educativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder MPNet (paraphrase-mpnet-base-v2) + cabeza LogisticRegression |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no declarada en la model card (el encoder MPNet base admite 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuerpo) + cabeza LogisticRegression serializada |

## Arquitectura y entrenamiento

La arquitectura es SetFit, un esquema de ajuste eficiente para clasificacion de texto que combina un encoder de frases preentrenado con una cabeza clasica ligera. El cuerpo es sentence-transformers/paraphrase-mpnet-base-v2, un transformer basado en MPNet de 109 millones de parametros que genera embeddings de frase; sobre sus representaciones se entrena una regresion logistica como cabeza de clasificacion. El modelo produce dos columnas de salida: `assertion_references_student_behavior` y `split_references_student_behavior`.

El entrenamiento se realizo sobre StanfordSCALE/assertions_llm_annotated_talkmoves, con 13.182 ejemplos de entrenamiento (53,3%), 3.296 de desarrollo (13,3%) y 8.237 de test (33,3%). La tasa base de la clase positiva es del 16,1% global (15,8% en train, 16,9% en dev, 16,3% en test), lo que indica un fuerte desbalanceo. Las etiquetas fueron generadas por anotadores LLM, no por codificadores humanos, con un alfa de Krippendorff de 0.206. Los hiperparametros incluyen una tasa de aprendizaje del cuerpo de 2e-05, tasa de la cabeza de 0.01, tamano de lote de 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, un maximo de 5.000 pasos en la fase contrastiva, 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU.

## Capacidades

- Clasificacion binaria de texto: determina si un enunciado de un docente hace referencia al comportamiento del estudiante.
- Generacion de probabilidades por clase mediante `predict_proba`, lo que permite umbralizar la decision.
- Procesamiento de enunciados individuales en ingles como cadenas de texto sin estructura adicional.
- Integracion con el ecosistema SetFit (`SetFitModel.from_pretrained`) y con el paquete `EduBehaviors-kit`.
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: no, unicamente entrenado y evaluado en ingles.

## Casos de uso

- Investigacion en analisis del discurso en el aula: clasificar intervenciones docentes para cuantificar la frecuencia con que se hace referencia al comportamiento de los estudiantes en corpus de clase transcritos. Es su proposito original declarado.
- Construccion de esquemas de codificacion auditables: integrar la asercion `bu5__references_student_behavior` en un pipeline de codificacion de conductas educativas junto a otras aserciones del conjunto `bu5`.
- Etiquetado asistido de corpus educativos: preanotar conjuntos de transcripciones para acelerar la revision humana posterior por codificadores, siempre teniendo en cuenta la baja fiabilidad declarada.
- Analisis de formacion docente: medir patrones de referencia al alumnado en grabaciones de practicas para estudios sobre interaccion pedagogica.
- Filtrado y mineria de transcripciones: localizar segmentos que probablemente contienen referencias al comportamiento del estudiante para revision focalizada.
- Investigacion reproducible en ciencias del aprendizaje: replicar o extender los resultados del proyecto EduBehaviors usando el modelo como componente de referencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (tarea text-classification, dataset StanfordSCALE/assertions_llm_annotated_talkmoves, split test), no verificados de forma independiente:

| Metrica (clase positiva, test) | Valor |
|---|---|
| F1 | 0.5122 |
| Precision | 0.576 |
| Recall | 0.4612 |
| ROC-AUC | 0.8659 |

Resultados adicionales de la model card para el split de desarrollo y test:

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.296 | 16,9% | 0.603 | 0.518 | 0.557 | 0.878 | 0.602 |
| test | 8.237 | 16,3% | 0.576 | 0.461 | 0.512 | 0.866 | 0.581 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en fp32 y unos 0,22 GB en fp16 para los 109,5 millones de parametros del encoder (estimacion calculada a partir del recuento de parametros; el repositorio ocupa 0,4 GB).
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una GPU de consumo como la RTX 4090, RTX 3090 o incluso integradas recientes son mas que suficientes.
- Cabe sobradamente en GPU de consumo: si, incluidas GPUs con 4-8 GB de VRAM, e incluso puede ejecutarse en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: la libreria oficial es `setfit` (sobre PyTorch/Transformers). Tambien puede servirse a traves de infraestructura estandar de sentence-transformers o transformada a ONNX si se exporta el encoder.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Este modelo pertenece a una familia de clasificadores de aserciones del conjunto `bu5` de EduBehaviors, pero no se han facilitado las metricas de sus modelos hermanos ni de alternativas externas equivalentes. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | F1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_references_student_behavior | 109.486.464 | no disponible | 0.5122 | no disponible | HuggingFace (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM y no de codificadores humanos; el acuerdo medido con alfa de Krippendorff es de 0.206, valor que los propios autores califican como pobre.
- Los autores indican explicitamente que las predicciones del modelo y los datos subyacentes no son fiables.
- El modelo se entreno unicamente con intervenciones de docentes; su comportamiento sobre habla de estudiantes no ha sido probado.
- Fuerte desbalanceo de clases (tasa base positiva del 16,1%), lo que exige umbralizar con cuidado y usar `predict_proba` en lugar de la clase por defecto.
- Rendimiento modesto en F1 (0.5122) y recall (0.4612) sobre la clase positiva, pese al ROC-AUC relativamente alto (0.8659): el modelo ordena razonablemente pero clasifica con muchos falsos negativos.
- Solo funciona en ingles y sobre enunciados individuales; comportamiento desconocido en otros idiomas o en entradas largas o estructuradas.
- Licencia no disponible: no puede confirmarse si se permite el uso comercial. Debe aclararse con el autor antes de cualquier uso en produccion.
- No es un modelo conversacional ni generativo; no debe usarse para tareas de generacion, razonamiento o agentes.
- Publicado por un autor academico con 0 descargas y 0 likes: sin validacion externa ni comunidad de usuarios en el momento de la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_references_student_behavior
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio): https://github.com/SumnerLab/TalkMoves
- Libreria SetFit: https://github.com/huggingface/setfit
