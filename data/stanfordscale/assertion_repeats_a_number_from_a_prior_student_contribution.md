# StanfordSCALE/assertion_repeats_a_number_from_a_prior_student_contribution

## Resumen

El modelo `StanfordSCALE/assertion_repeats_a_number_from_a_prior_student_contribution` es un clasificador binario de texto en ingles desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas de codificacion de dialogo educativo basados en aserciones auditables. Su tarea concreta es determinar si un enunciado de un docente repite un numero que un estudiante habia mencionado previamente en la conversacion, una estrategia discursiva vinculada al "revoicing" en el analisis del discurso de aula.

Tecnicamente es un modelo compacto: 109.486.464 parametros, construido sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` y entrenado con la libreria SetFit (fase contrastiva mas cabeza de regresion logistica). No es un modelo generativo, sino un clasificador que emite `0` o `1` y probabilidades calibradas, con un repositorio de 0,4 GB en formato safetensors.

Su relevancia es acotada y muy especializada: permite automatizar la codificacion a escala de transcripciones de aula con un coste computacional minimo, aunque con un rendimiento modesto en la clase positiva (F1 de 0,545 y precision de 0,583 en el split de test) y sobre una clase extremadamente poco frecuente (tasa base del 0,5 % en test). La licencia no esta declarada, lo que condiciona cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) con cabeza de clasificacion `LogisticRegression` (SetFit) |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria de inferencia | setfit |
| Pipeline | text-classification |
| Tarea | Clasificacion binaria: el enunciado repite un numero de una intervencion previa de un estudiante |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder tipo transformer MPNet de 109 millones de parametros, tomado del checkpoint multilingue de oraciones `paraphrase-mpnet-base-v2` de sentence-transformers. Sobre esa representacion se anade una cabeza de regresion logistica, siguiendo el paradigma SetFit: primero una fase contrastiva con generacion de pares de oraciones y despues el entrenamiento de la cabeza sobre los embeddings resultantes. Los hiperparametros declarados son learning rate del cuerpo de 2e-05, learning rate de la cabeza de 0,01, batch size de 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, un maximo de 5.000 pasos en la fase contrastiva y 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU.

Los datos de entrenamiento provienen del subconjunto anotado por LLM del TalkMoves Dataset, con 13.181 ejemplos de entrenamiento (53,3 %), 3.295 de desarrollo (13,3 %) y 8.239 de test (33,3 %). Las anotaciones no son humanas: proceden de anotadores LLM y presentan un acuerdo entre anotadores (alfa de Krippendorff) de 0,804. El modelo se entrena exclusivamente con enunciados de docentes, y el texto de entrada se construye como la frase literal, sin contexto conversacional adicional. No se documenta el uso de RLHF ni de DPO, algo que no aplica a un clasificador de este tipo.

## Capacidades

- Clasificacion binaria de enunciados docentes en ingles: predice si la intervencion repite un numero aparecido en una contribucion previa de un estudiante.
- Salida de probabilidad calibrada mediante `predict_proba`, lo que permite ajustar el umbral de decision segun el coste relativo de falsos positivos y falsos negativos.
- Deteccion de eventos de muy baja prevalencia (0,5 % de casos positivos en test), con ROC-AUC de 0,972 y average precision de 0,579.
- Integracion con el paquete Python `EduBehaviors-kit` para pipelines de codificacion de discurso educativo.
- Ejecucion como extractor de embeddings de frases a traves de la libreria `setfit` y del ecosistema sentence-transformers.
- No soporta generacion de texto, razonamiento multi-paso, codigo, matematicas, vision, audio, tool calling, function calling ni comportamiento agentico: es un clasificador de una sola etiqueta.
- No dispone de capacidades multilingues declaradas; el unico idioma soportado es el ingles.

## Casos de uso

- Codificacion automatica de discurso de aula a escala: el modelo etiqueta transcripciones completas de clases para identificar estrategias de revoicing (el docente reformula o repite un dato numerico aportado por un estudiante), sustituyendo parcialmente la codificacion manual en investigacion educativa.
- Investigacion sobre practicas docentes: permite medir la frecuencia de esta estrategia en corpus amplios de TalkMoves y correlacionarla con otras variables del discurso, algo inviable con codificacion humana dado el volumen.
- Formacion y retroalimentacion docente: un sistema puede procesar la transcripcion de una sesion y senalar al profesor los momentos en que recupero numericamente una intervencion de un alumno, como material de reflexion posterior.
- Filtrado previo (triage) en proyectos de anotacion: dado que la clase positiva es muy rara (0,5 % en test), el modelo puede usarse para priorizar los enunciados candidatos que revisaran anotadores humanos, reduciendo el volumen de revision.
- Analisis de patrones de interaccion numerica en didactica de matematicas o ciencias: deteccion de secuencias donde el dato numerico del estudiante reaparece en la intervencion del docente, util para estudiar la construccion colectiva de conocimiento.
- Evaluacion comparativa de modelos de educacion: sirve como referencia publica y reproducible para medir mejoras de nuevos clasificadores sobre el mismo conjunto de datos `assertions_llm_annotated_talkmoves`.
- Auditoria de sistemas de codificacion existentes: al ser una asercion auditable con salida probabilistica, puede integrarse en un flujo que compare etiquetas automatizadas frente a etiquetas humanas y detecte discrepancias sistematicas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card y en el model-index (metrica no verificada de forma independiente):

| Split | n | Tasa base | Precision (clase positiva) | Recall (clase positiva) | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.295 | 0,8 % | 0,607 | 0,680 | 0,642 | 0,977 | 0,627 |
| test | 8.239 | 0,5 % | 0,583 | 0,512 | 0,545 | 0,972 | 0,579 |

Los valores del model-index para test coinciden con la tabla anterior: F1 0,5455, precision 0,5833, recall 0,5122 y ROC-AUC 0,9724.

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB solo para los pesos en precision de 32 bits y unos 0,22 GB en 16 bits; con activaciones y sobrecarga del entorno, la inferencia completa se mantiene por debajo de 1,5 GB en la mayoria de configuraciones. Son estimaciones derivadas del recuento de parametros, no cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3060, RTX 4090, T4, L4, A100 o H100 estan sobradamente dimensionadas para esta carga.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna e incluso en GPU integradas; tambien es viable la inferencia en CPU para lotes moderados.
- Opciones de despliegue: libreria `setfit` (via `SetFitModel.from_pretrained`), ecosistema HuggingFace Transformers y sentence-transformers para obtener embeddings, y exportacion a ONNX Runtime. Las soluciones orientadas a modelos generativos (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este clasificador.
- Latencia y throughput: no disponible. No hay cifras publicadas por el autor. Cualitativamente, un encoder de 109 millones de parametros sobre textos cortos es adecuado para procesamiento por lotes de miles de enunciados, pero se trata de una apreciacion no respaldada por mediciones oficiales.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables con los que contrastar parametros, contexto, rendimiento, licencia y disponibilidad. La documentacion del autor no incluye una seccion de comparativas frente a alternativas.

| Modelo | Parametros totales | Contexto | F1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_repeats_a_number_from_a_prior_student_contribution | 109.486.464 | no disponible | 0,545 | no disponible | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Criterios que tendria sentido usar para una comparacion futura, si se dispone de datos: otros clasificadores de aserciones del mismo proyecto EduBehaviors, clasificadores SetFit sobre el mismo corpus TalkMoves y aproximaciones zero-shot con LLM generativos evaluadas sobre el split de test de `assertions_llm_annotated_talkmoves`.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores es de 0,804 en alfa de Krippendorff, lo que implica un ruido de etiquetado no despreciable en la senal de supervision.
- El modelo se entreno unicamente con enunciados de docentes. Su comportamiento sobre habla de estudiantes no ha sido evaluado.
- La clase positiva es extremadamente rara: 0,7 % global, 0,7 % en entrenamiento, 0,8 % en desarrollo y 0,5 % en test. Precision, recall y F1 en test (0,583, 0,512 y 0,545) indican un rendimiento moderado, y el umbral de decision por defecto puede no ser el adecuado para produccion.
- La ROC-AUC elevada (0,972) convive con una average precision de 0,579: el modelo ordena razonablemente bien, pero el rendimiento en el punto de operacion concreto depende fuertemente del umbral elegido. No debe interpretarse la ROC-AUC como indicador de calidad final.
- La entrada es unicamente el enunciado, pasado tal cual. Aunque la asercion hace referencia a una contribucion previa del estudiante, el modelo no recibe el contexto conversacional completo, por lo que la deteccion se basa en indicios superficiales del propio texto.
- Idioma limitado al ingles. No se declaran capacidades multilingues ni evaluaciones en otros idiomas.
- La licencia no esta declarada. Esto impide confirmar si el uso comercial esta permitido y supone un riesgo legal para cualquier despliegue en produccion.
- Modelo sin adopcion registrada (0 descargas y 0 likes en el momento de la consulta) y publicado en 2026, por lo que no existe un historial de uso en produccion que permita validar su robustez fuera del corpus de evaluacion.
- Sesgos conocidos: no disponible. La model card no documenta analisis de sesgos por subgrupo, idioma, nivel educativo o tipo de centro.
- Riesgo de alucinacion: no aplica en sentido estricto, ya que el modelo no genera texto; el riesgo equivalente es la clasificacion incorrecta con alta confianza, especialmente en enunciados atipicos o con numeros escritos de forma poco frecuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_repeats_a_number_from_a_prior_student_contribution
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio): https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit`: mencionado en la model card, sin URL proporcionada
- Citation (BibTeX):

```bibtex
@misc{assertion_repeats_a_number_from_a_prior_student_contribution,
  author = {Stanford SCALE Initiative},
  title  = {Assertion classifier: the utterance repeats a number from a prior student contribution},
  year   = {2026},
  url    = {https://huggingface.co/StanfordSCALE/assertion_repeats_a_number_from_a_prior_student_contribution}
}
```
