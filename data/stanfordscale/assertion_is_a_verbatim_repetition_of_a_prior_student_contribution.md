# StanfordSCALE/assertion_is_a_verbatim_repetition_of_a_prior_student_contribution

## Resumen

El modelo `StanfordSCALE/assertion_is_a_verbatim_repetition_of_a_prior_student_contribution` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas de aserciones para la codificacion auditable de dialogo en el aula. Su tarea concreta es determinar si una intervencion docente es una repeticion literal (verbatim) de una contribucion previa de un estudiante. No es un modelo generativo: es un clasificador de una sola etiqueta construido con la libreria SetFit sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2`.

El modelo sigue el esquema SetFit, que combina una fase contrastiva de ajuste fino del encoder con una cabeza de regresion logistica entrenada sobre los embeddings resultantes. Cuenta con 109.486.464 parametros y un repositorio de 0,4 GB en formato safetensors. Se entreno sobre el subconjunto anotado por LLM del TalkMoves Dataset, con 13.180 ejemplos de entrenamiento, 3.294 de desarrollo y 8.241 de test.

Su relevancia es acotada y de nicho: forma parte de una familia de clasificadores de aserciones orientados a la investigacion en discurso educativo, no a produccion general. El propio autor advierte en la model card que el F1 de 0,233 en test es insuficiente para usar el modelo de forma autonoma, por lo que su valor practico esta en tareas de preanotacion y priorizacion con revision humana, no en decision automatica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder transformer MPNet (`paraphrase-mpnet-base-v2`) mas cabeza de regresion logistica |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (limitada por la longitud maxima del encoder base) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors sin versiones cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | setfit |
| Tarea (pipeline) | text-classification |
| Tamano del repositorio | 0,4 GB |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |

## Arquitectura y entrenamiento

La arquitectura es la de SetFit, una tecnica de few-shot y eficiencia de datos para clasificacion de texto. Se parte del encoder preentrenado MPNet `paraphrase-mpnet-base-v2` y se realiza una fase contrastiva de ajuste fino con pares de oraciones, seguida del entrenamiento de una cabeza `LogisticRegression` sobre los embeddings del encoder congelado. Los hiperparametros documentados son: learning rate del cuerpo de 2e-05, learning rate de la cabeza de 0,01, batch size de 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, un maximo de 5000 pasos en la fase contrastiva, 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU.

Los datos de entrenamiento proceden del subconjunto anotado por LLM del TalkMoves Dataset (`StanfordSCALE/assertions_llm_annotated_talkmoves`), restringido a intervenciones de profesorado. El reparto es de 13.180 filas de entrenamiento (53,3%), 3.294 de desarrollo (13,3%) y 8.241 de test (33,3%). La etiqueta positiva es muy rara: la tasa base es del 2,5% global, con 2,5% en train, 2,4% en dev y 2,7% en test. La concordancia entre anotadores para esta asercion es de alpha de Krippendorff de 0,541. La entrada del modelo es el texto del enunciado tal cual, sin plantilla adicional; el modelo devuelve la etiqueta 1 cuando la asercion se cumple. No se documenta uso de RLHF ni DPO, algo esperable en un clasificador de este tipo.

## Capacidades

- Clasificacion binaria de texto: predice si un enunciado docente es una repeticion literal de una contribucion previa de un estudiante.
- Salida probabilistica mediante `predict_proba`, que devuelve la probabilidad de cada clase y permite ordenar casos por confianza.
- Codificacion de discurso educativo dentro del conjunto de aserciones del proyecto EduBehaviors, pensado para analisis auditable de conversaciones de aula.
- Extraccion de embeddings de frase gracias al encoder MPNet subyacente, reutilizable para similitud semantica.
- Integracion con la libreria SetFit y con `sentence-transformers` para inferencia en Python.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingue: solo ingles.
- No dispone de modo de pensamiento, vision, audio ni generacion de texto.

## Casos de uso

- Preanotacion en investigacion sobre discurso de aula: el modelo puede etiquetar de forma automatica un corpus de intervenciones docentes y generar una primera capa de anotacion que despues se revisa y corrige por codificadores humanos. El ROC-AUC de 0,915 en test hace que la probabilidad sirva como criterio de priorizacion, aunque el F1 de 0,233 obligue a revision completa del conjunto etiquetado.
- Aprendizaje activo para anotacion: dado que `predict_proba` ordena los casos por probabilidad, se pueden seleccionar primero las intervenciones con mayor puntuacion y reducir el volumen de texto que un anotador humano necesita inspeccionar, aprovechando la buena separacion en el espacio de puntuaciones que refleja el ROC-AUC.
- Auditoria de reproducibilidad de estudios sobre TalkMoves: al estar asociado a un esquema de aserciones documentado y a una version concreta del dataset, permite repetir un analisis de codificacion y comparar resultados con los publicados por el equipo.
- Analisis exploratorio de patrones de reformulacion docente: en estudios de formacion del profesorado se puede usar la puntuacion del modelo como indicador aproximado de cuanto repite el docente las palabras del alumnado, siempre como senal de investigacion y no como metrica de evaluacion.
- Componente de un pipeline multi-etiqueta: el modelo cubre una unica asercion del conjunto top-down `td`, por lo que puede combinarse con otros clasificadores de la misma familia para construir un codificador de conductas de aula con multiples etiquetas, agregando las salidas por reglas.
- Filtrado previo de corpus a gran escala: sobre transcripciones o registros de discurso ya transcritos, sirve para localizar candidatos a repeticion literal antes de una fase de anotacion humana, reduciendo el coste de cribado en corpus grandes.
- Docencia sobre tecnicas de NLP educativo: por su tamano contenido (109 M de parametros) y su naturaleza de clasificador SetFit, es un ejemplo util en cursos y talleres para ilustrar ajuste contrastivo, clases desbalanceadas y evaluacion con F1 de clase positiva.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (metricas no verificadas de forma independiente). Clasificacion binaria sobre `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.294 | 2,4% | 0,368 | 0,177 | 0,239 | 0,930 | 0,254 |
| test | 8.241 | 2,7% | 0,429 | 0,160 | 0,233 | 0,915 | 0,266 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ni comparaciones con otros clasificadores de la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision fp32, los 109.486.464 parametros ocupan aproximadamente 0,41 GiB; en fp16, unos 0,21 GiB. La cabeza de regresion logistica anade un coste despreciable.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente. No requiere A100 ni H100; tarjetas como GTX 1650, RTX 3060 o superiores van sobradamente. Una RTX 4090 queda enormemente sobredimensionada para este modelo.
- Inferencia en CPU: perfectamente viable tanto por tamano como por tratarse de un encoder de 109 M de parametros con batch pequeno.
- Opciones de despliegue: `setfit` (via `SetFitModel.from_pretrained`), `sentence-transformers` y `transformers` para el encoder; el paquete `EduBehaviors-kit` mencionado en la model card. No se documentan despliegues con vLLM, TGI, Ollama o llama.cpp.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El entrenamiento uso batch size de 32 en la fase de cabeza y precision mixta en GPU.

## Comparativa con modelos similares

No se dispone de resultados publicados de otros clasificadores de la misma asercion ni de modelos comparables evaluados sobre el mismo conjunto de test. La unica comparacion documentable es con el encoder base del que deriva.

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 109.486.464 | Clasificacion binaria de la asercion de repeticion literal | no disponible | no disponible | HuggingFace |
| sentence-transformers/paraphrase-mpnet-base-v2 | no disponible en la informacion proporcionada | Embeddings de frase genericos | no disponible | no disponible | HuggingFace |
| Otros clasificadores de aserciones de StanfordSCALE | no disponible | Clasificacion binaria de otras aserciones de aula | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Las etiquetas no provienen de codificadores humanos, sino de anotadores LLM, con una concordancia entre anotadores de alpha de Krippendorff de 0,541, lo que indica un acuerdo moderado y una fuente de ruido en la supervision.
- El F1 de la clase positiva en test es de 0,233, con precision de 0,429 y recall de 0,160. El propio autor indica que el modelo no funciona lo bastante bien como para usarse de forma autonoma.
- La tarea esta muy desbalanceada: solo el 2,5% de las filas son positivas, lo que explica el bajo recall y hace que la exactitud (accuracy) sea una metrica enganosa en este contexto.
- El entrenamiento se hizo unicamente con intervenciones de profesorado. El comportamiento sobre habla de estudiantes no ha sido evaluado.
- La licencia no esta disponible en la informacion proporcionada, por lo que no puede confirmarse si se permite el uso comercial.
- Solo soporta ingles.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion, con la consiguiente propagacion de errores si la salida se usa en cascada.
- Uso en produccion desaconsejado sin una capa de revision humana; cualquier aplicacion de evaluacion docente basada en estas predicciones seria metodologicamente fragil.
- El modelo cubre una unica asercion del conjunto `td`; no debe interpretarse como un analizador completo de discurso de aula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_is_a_verbatim_repetition_of_a_prior_student_contribution
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio GitHub): https://github.com/SumnerLab/TalkMoves
- Paquete de Python `EduBehaviors-kit`: mencionado en la model card, sin URL proporcionada
- Cita recomendada por el autor:

```bibtex
@misc{assertion_is_a_verbatim_repetition_of_a_prior_student_contribution,
  author = {Stanford SCALE Initiative},
  title  = {Assertion classifier: the utterance is a verbatim repetition of a prior student contribution},
  year   = {2026},
  url    = {https://huggingface.co/StanfordSCALE/assertion_is_a_verbatim_repetition_of_a_prior_student_contribution}
}
```
