# StanfordSCALE/assertion_repeats_prior_speech

## Resumen

`StanfordSCALE/assertion_repeats_prior_speech` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative que determina si una intervencion de un docente («utterance») repite contenido ya dicho con anterioridad en el discurso del aula. La tarea se enmarca dentro de *EduBehaviors: Assertion-based schemas for auditable dialogue coding*, un conjunto de esquemas de anotacion para el analisis auditable de la interaccion en el aula, y el modelo se consume a traves del paquete Python `EduBehaviors-kit`.

Tecnicamente no es un modelo generativo, sino un clasificador SetFit (Sentence Transformer Fine-tuning): parte del sentence transformer `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet) y anade una cabeza de regresion logistica entrenada sobre los embeddings generados. El conjunto resultante tiene 109.486.464 parametros y se distribuye en formato safetensors, con un tamano de repositorio de 0,4 GB. Solo soporta ingles (`en`) y su proposito es la clasificacion de texto, no la generacion.

Su relevancia es de nicho: proporciona una senal automatica para codificar un comportamiento discursivo concreto (la repeticion de discurso previo) dentro de pipelines de investigacion educativa, con la advertencia explicita del autor de que el rendimiento es bajo (F1 de 0,324 en test) y que no debe usarse de forma autonoma. La licencia no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: sentence transformer MPNet (`paraphrase-mpnet-base-v2`) con cabeza de regresion logistica |
| Parametros totales | 109.486.464 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 384 tokens (limite de secuencia del modelo base `paraphrase-mpnet-base-v2`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | clasificacion de texto (binaria) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit. En una primera fase se realiza un ajuste contrastivo del encoder MPNet del modelo base con un learning rate de 2e-05, batch size de 16 y un maximo de 5000 pasos, con precision mixta activada en GPU. En una segunda fase se entrena una cabeza `LogisticRegression` sobre los embeddings con un learning rate de 0.01, batch size de 32 y 10 epocas en total. La semilla empleada fue 20260904 y el `eval_max_steps` se fijo en 100. La entrada se construye pasando la intervencion (`{utterance}`) tal cual, sin plantilla adicional.

El entrenamiento se realizo sobre `StanfordSCALE/assertions_llm_annotated_talkmoves`, un subconjunto del [TalkMoves Dataset](https://github.com/SumnerLab/TalkMoves) anotado automaticamente. Los tamanos de los splits son 13.183 ejemplos en train (53,3 %), 3.293 en dev (13,3 %) y 8.239 en test (33,3 %). Las columnas del modelo son `assertion_repeats_prior_speech` y `split_repeats_prior_speech`. La tasa base de la clase positiva es baja: 11,8 % global, 11,8 % en train, 11,2 % en dev y 12,1 % en test, lo que configura un problema claramente desbalanceado.

El punto mas relevante del entrenamiento es la procedencia de las etiquetas: no fueron generadas por anotadores humanos, sino por anotadores LLM, con una concordancia entre anotadores medida por alfa de Krippendorff de 0,628. No se documenta en la informacion disponible el uso de RLHF ni DPO, algo por otra parte esperable en un clasificador de este tipo.

## Capacidades

- Clasificacion binaria de texto: determina si una intervencion (docente) cumple la asercion `repeats_prior_speech` (repite discurso previo).
- Salida probabilistica mediante `predict_proba`, que devuelve `[[P(no), P(si)]]`.
- Salida de etiqueta discreta mediante `predict`, que devuelve `1` cuando la asercion se cumple.
- Integracion con la libreria `setfit` y con `EduBehaviors-kit` para pipelines de codificacion de dialogo.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta comportamiento de agente ni razonamiento multi-paso.
- Idiomas: unicamente ingles.
- Capacidades especiales: ninguna adicional (sin modo de razonamiento, vision ni audio).

## Casos de uso

- Investigacion en discurso de aula: cuantificar la frecuencia con la que el profesorado reformula o repite ideas previas a lo largo de una sesion, alimentando estudios sobre patrones de interaccion.
- Anotacion asistida de corpus educativos: preetiquetar transcripciones de clases con esta asercion para que los codificadores humanos revisen y corrijan, reduciendo el coste de anotacion manual.
- Analisis longitudinal de practicas docentes: aplicar el clasificador sobre transcripciones historicas para medir la evolucion de la repeticion de discurso en una misma asignatura o docente.
- Formacion inicial del profesorado: generar informes de autoevaluacion que destaquen cuantas intervenciones repiten contenido previo, como senal de estilo discursivo a revisar.
- Construccion de esquemas auditables: integrar la asercion dentro del conjunto `bu5` de EduBehaviors para componer descriptores mas complejos del comportamiento docente.
- Telemetria de calidad en plataformas de grabacion de clases: procesar automaticamente transcripciones y marcar segmentos con posible redundancia discursiva.
- Filtrado previo en pipelines de datos: usar el modelo como primer paso (alto recall configurable via umbral) para seleccionar candidatos que luego se validen con modelos mayores o revision humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.293 | 11,2 % | 0,365 | 0,257 | 0,302 | 0,658 | 0,289 |
| test | 8.239 | 12,1 % | 0,459 | 0,251 | 0,324 | 0,663 | 0,310 |

El `model-index` oficial recoge para test: F1 = 0,3242, precision = 0,4594, recall = 0,2505 y ROC-AUC = 0,663. No se han publicado resultados comparativos con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 437 MB en fp32 (109,5 M de parametros), unos 219 MB en fp16 y cerca de 110 MB en int8. Cifras calculadas a partir del numero de parametros; no se documentan mediciones reales.
- GPU recomendadas: cualquiera; el modelo cabe sobradamente en A100, H100, RTX 4090 e incluso en GPUs integradas. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en dispositivos de baja capacidad o en CPU.
- Opciones de despliegue: libreria `setfit`, `sentence-transformers`, exportacion a ONNX mediante las utilidades de la propia libreria, e integracion dentro de `EduBehaviors-kit`. No se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI (son frameworks orientados a modelos generativos, no a este tipo de clasificador).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de clasificadores comparables en la informacion proporcionada. La referencia natural es el propio modelo base y otros clasificadores de aserciones de la misma familia `StanfordSCALE`.

| Modelo | Parametros | Contexto | Licencia | Tarea |
|---|---|---|---|---|
| assertion_repeats_prior_speech | 109,5 M | 384 tokens | no disponible | Clasificacion binaria (repite discurso previo) |
| paraphrase-mpnet-base-v2 (base) | 109,5 M | 384 tokens | Apache-2.0 (segun su model card original) | Embeddings de frases (no clasificacion directa) |
| Otros clasificadores de aserciones de StanfordSCALE | no disponible | no disponible | no disponible | Clasificacion binaria de otras aserciones |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos; la concordancia entre anotadores es de 0,628 segun alfa de Krippendorff, lo que introduce ruido en el objetivo de aprendizaje.
- Entrenado exclusivamente con intervenciones de docentes; su comportamiento sobre habla de estudiantes no ha sido evaluado.
- El propio autor indica que el F1 de test (0,324) es demasiado bajo para usar el modelo de forma autonoma; debe emplearse con revision humana o como senal complementaria.
- Problema fuertemente desbalanceado: la clase positiva representa solo el 11,8 % de los datos, lo que explica un recall bajo (0,251 en test).
- Idiomas: solo ingles; no soporta castellano ni ningun otro idioma.
- Licencia no declarada: no es posible confirmar las condiciones de uso comercial sin consultar al autor.
- Tasa de alucinacion: no aplica directamente al ser un clasificador, pero existe riesgo de falsos positivos y falsos negativos derivados del bajo rendimiento.
- Ventana de contexto limitada (384 tokens) heredada del modelo base; no apta para documentos largos sin troceado previo.
- Para produccion: se recomienda calibrar el umbral de decision segun el coste relativo de falsos positivos y falsos negativos, y monitorizar el drift si cambia el dominio educativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_repeats_prior_speech
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- TalkMoves Dataset (GitHub): https://github.com/SumnerLab/TalkMoves
- Cita (BibTeX):
  ```
  @misc{assertion_repeats_prior_speech,
    author = {Stanford SCALE Initiative},
    title  = {Assertion classifier: repeats prior speech},
    year   = {2026},
    url    = {https://huggingface.co/StanfordSCALE/assertion_repeats_prior_speech}
  }
  ```
