# StanfordSCALE/assertion_paraphrases_a_prior_student_contribution

## Resumen

`StanfordSCALE/assertion_paraphrases_a_prior_student_contribution` es un clasificador binario de texto en ingles desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificacion auditable de dialogo en el aula. El modelo no genera texto: recibe una unica intervencion docente (utterance) y predice si esa intervencion parafrasea una contribucion previa de un estudiante. Se corresponde con la asercion `td__the_utterance_paraphrases_a_prior_student_contribution` del conjunto de aserciones top-down `td`.

Tecnicamente es un clasificador SetFit: un encoder transformer MPNet de 109.486.464 parametros (heredado de `sentence-transformers/paraphrase-mpnet-base-v2`) sobre el que se entrena una cabeza de regresion logistica. El entrenamiento se hizo sobre una anotacion automatica con LLM de un subconjunto de intervenciones docentes del TalkMoves Dataset (13.183 ejemplos de entrenamiento, 3.293 de desarrollo y 8.239 de prueba). El modelo esta pensado para consumirse desde el paquete Python `EduBehaviors-kit`.

Su relevancia es acotada y de nicho: es una pieza de infraestructura de investigacion educativa, no un modelo de proposito general. Sus propios autores advierten de que el F1 en test es 0,235 y de que el modelo no funciona lo bastante bien como para usarse por si solo. La licencia no esta declarada en la informacion disponible, lo que limita su uso en produccion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer MPNet (base `sentence-transformers/paraphrase-mpnet-base-v2`) con cabeza de clasificacion `LogisticRegression` (SetFit) |
| Parametros totales | 109.486.464 (≈109,5 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (maximo del encoder MPNet base; la entrada es una unica utterance) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `setfit`; tamano del repo 0,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es un clasificador SetFit de dos fases. El cuerpo es el encoder MPNet de `sentence-transformers/paraphrase-mpnet-base-v2`, entrenado con aprendizaje contrastivo (learning rate 2e-5, batch size 16, max steps 5000, 10 epocas, evaluacion cada 100 pasos, precision mixta activada en GPU). Sobre los embeddings resultantes se ajusta una cabeza de regresion logistica con learning rate 0,01 y batch size 32. La semilla empleada fue 20260904. La entrada se construye pasando la utterance tal cual, sin plantilla adicional.

Los datos proceden del dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`: 13.183 filas de entrenamiento (53,3 %), 3.293 de desarrollo (13,3 %) y 8.239 de prueba (33,3 %). Las etiquetas fueron generadas por anotadores LLM, no por codificadores humanos, y la concordancia entre anotadores medida con alfa de Krippendorff es 0,528. La tasa base de la clase positiva es muy baja: 2,2 % global, con 2,1 % en train, 2,9 % en dev y 2,0 % en test. No se documenta uso de RLHF ni DPO, algo coherente con un clasificador discriminativo.

## Capacidades

- Clasificacion binaria de una unica intervencion docente en ingles: determina si la utterance parafrasea una contribucion previa de un estudiante (clase positiva) o no.
- Salida de probabilidad calibrada mediante `predict_proba`, lo que permite aplicar umbrales propios en lugar del 0,5 por defecto.
- Integracion en pipelines de codificacion de dialogo educativo a traves del paquete `EduBehaviors-kit`, dentro del marco de aserciones auditables.
- Ejecucion como parte de un conjunto de clasificadores de aserciones (codificacion multietiqueta por asercion), aunque este modelo concreto cubre una sola asercion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades generativas, de vision, audio ni modo de razonamiento explicito.
- Multilingue: no; unicamente ingles.
- No se documenta capacidad de manejar conversaciones multi-turno: la entrada es una utterance aislada.

## Casos de uso

- Preetiquetado asistido en investigacion sobre discurso de aula: dado que el F1 en test es 0,235, el uso realista es generar candidatos positivos con umbral bajo y que un codificador humano revise despues. El modelo ahorra triaje, no sustituye la anotacion.
- Analisis de patrones de reformulacion docente en corpus grandes: aplicar el clasificador sobre transcripciones de TalkMoves o corpus similares para estimar la frecuencia de parafrasis de contribuciones estudiantiles, siempre reportando la incertidumbre derivada del bajo recall.
- Construccion de features para modelos de analisis de aprendizaje: usar la probabilidad de la clase positiva como variable de entrada en modelos posteriores que correlacionen estrategias discursivas docentes con resultados de aprendizaje.
- Auditoria de esquemas de anotacion: como parte de `EduBehaviors-kit`, sirve para comprobar la coherencia de un esquema de aserciones frente a anotaciones humanas ya existentes y detectar aserciones problematicas.
- Filtrado de candidatos en estudios cualitativos: reducir el material que un equipo de investigacion debe leer manualmente cuando busca episodios concretos de reformulacion de ideas de estudiantes.
- Experimentacion metodologica en NLP educativo: usar el modelo como punto de comparacion para medir cuanto aporta el ajuste fino sobre el encoder base frente a alternativas zero-shot, dado que el rendimiento absoluto es bajo.
- Validacion de etiquetado con LLM: dado que las etiquetas de entrenamiento provienen de anotadores LLM con alfa de Krippendorff 0,528, el modelo puede emplearse para cuantificar el desacuerdo entre el anotador automatico y el clasificador supervisado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index y en la model card. No estan verificados de forma independiente (`verified: false`).

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.293 | 2,9 % | 0,571 | 0,170 | 0,262 | 0,683 | 0,265 |
| test | 8.239 | 2,0 % | 0,409 | 0,165 | 0,235 | 0,584 | 0,164 |

## Requisitos de hardware

- VRAM en fp32: aproximadamente 0,44 GB solo para pesos (109.486.464 parametros x 4 bytes), mas el overhead de activaciones y del runtime de PyTorch; en la practica menos de 1 GB. En fp16, unos 0,22 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con memoria compartida suficiente. No requiere A100 ni H100.
- Inferencia en CPU perfectamente viable: el encoder es de 109,5 M de parametros y la cabeza es una regresion logistica, por lo que no hay generacion autorregresiva.
- Opciones de despliegue: `setfit` (via `SetFitModel.from_pretrained`), `sentence-transformers` para extraer embeddings y entrenar una cabeza propia, exportacion a ONNX Runtime o TorchScript para servir en FastAPI o similares.
- vLLM y TGI no son aplicables: estan orientados a modelos generativos. llama.cpp y Ollama tampoco soportan el formato SetFit.
- Latencia y throughput: no disponible. No se publican mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (test) en la asercion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `StanfordSCALE/assertion_paraphrases_a_prior_student_contribution` | 109,5 M | 512 tokens | 0,235 | no disponible | HuggingFace, via `setfit` |
| `sentence-transformers/paraphrase-mpnet-base-v2` (modelo base, sin ajuste para esta asercion) | 109,5 M | 512 tokens | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Otros clasificadores de aserciones de Stanford SCALE | no disponible | no disponible | no disponible | no disponible | HuggingFace (misma organizacion) |

No se dispone de datos comparativos de otras alternativas (modelos NLI zero-shot, clasificadores entrenados con supervisión humana sobre TalkMoves) en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento bajo: F1 de 0,235 y ROC-AUC de 0,584 en test. Los propios autores indican que el modelo no funciona lo bastante bien como para usarse por si solo.
- Recall muy bajo: 0,165 en test. Se pierden aproximadamente cinco de cada seis casos positivos, lo que lo invalida para deteccion automatica sin revision humana.
- Precision limitada: 0,409 en test, con 2,0 % de tasa base. La mayoria de las predicciones positivas son falsos positivos.
- Etiquetas generadas por LLM, no por anotadores humanos. La concordancia entre anotadores es de 0,528 (alfa de Krippendorff), un valor bajo que introduce ruido irreducible en el entrenamiento y en la evaluacion.
- Sesgo de dominio y de rol: entrenado exclusivamente con intervenciones de docentes. El comportamiento sobre habla de estudiantes no se ha probado.
- Idioma: solo ingles. Se desconoce el comportamiento en castellano u otros idiomas.
- Desequilibrio extremo de clases (2,2 % de positivos globales) que explica en parte las metricas pobres de la clase positiva.
- Degradacion entre dev y test (F1 de 0,262 a 0,235; ROC-AUC de 0,683 a 0,584), lo que sugiere poca robustez de generalizacion.
- Licencia no declarada: no se puede asumir permiso para uso comercial ni redistribucion. Es un riesgo legal relevante para cualquier despliegue en produccion.
- Sin metricas de latencia ni de consumo publicadas.
- 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso o validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_paraphrases_a_prior_student_contribution
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (SumnerLab): https://github.com/SumnerLab/TalkMoves
- Cita del autor: Stanford SCALE Initiative, "Assertion classifier: the utterance paraphrases a prior student contribution", 2026, URL del modelo.
- La busqueda web realizada no devolvio enlaces relevantes: los resultados correspondian a contenidos periodisticos sin relacion con el modelo.
