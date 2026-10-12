# StanfordSCALE/assertion_is_very_short

## Resumen

`StanfordSCALE/assertion_is_very_short` es un clasificador binario de texto en ingles desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificacion auditable de dialogo educativo. El modelo no es un modelo generativo: es un clasificador SetFit (Sentence Transformer Fine-tuning) que decide si una intervencion docente cumple la asercion concreta `bu5__is_very_short` (es decir, si el enunciado del profesor es muy corto). Se apoya en el codificador `sentence-transformers/paraphrase-mpnet-base-v2` y anade una cabeza de regresion logistica.

El modelo tiene 109.486.464 parametros (unos 109,5 millones) y un peso en repositorio de 0,4 GB en formato safetensors. Esta entrenado sobre anotaciones generadas por anotadores LLM a partir de un subconjunto de intervenciones de profesor del dataset TalkMoves, y se distribuye para su uso a traves del paquete Python `EduBehaviors-kit`. Su relevancia es acotada pero concreta: ofrece un componente reutilizable y auditable para pipelines de investigacion sobre discurso en el aula, con metricas publicadas de precision, recall, F1 y ROC-AUC sobre los splits de desarrollo y test.

La licencia no esta declarada en la informacion disponible, el modelo esta creado en octubre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, por lo que se trata de un artefacto de investigacion recien publicado y poco rodado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer MPNet (masked and permuted pre-training) fine-tuneado con SetFit y cabeza de regresion logistica |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (limitada por el modelo base `paraphrase-mpnet-base-v2`) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors a precision completa) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria setfit) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: se parte del codificador MPNet `sentence-transformers/paraphrase-mpnet-base-v2` y se realiza una fase contrastiva para adaptar las representaciones al dominio, seguida del entrenamiento de una cabeza de clasificacion de regresion logistica sobre los embeddings generados. Los hiperparametros declarados son: learning rate del cuerpo 2e-05, learning rate de la cabeza 0,01, batch size 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, un maximo de 5000 pasos en la fase contrastiva, 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU. La entrada se construye simplemente con el texto del enunciado (`{utterance}`), sin plantilla adicional.

Los datos de entrenamiento proceden del dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`: 13.182 filas de entrenamiento (53,3 por ciento), 3.294 de desarrollo (13,3 por ciento) y 8.239 de test (33,3 por ciento). Las etiquetas fueron generadas por anotadores LLM, no por codificadores humanos, y la concordancia entre anotadores medida con alfa de Krippendorff es de 0,634. La tasa base de la clase positiva es del 43,7 por ciento global (44,1 por ciento en train, 43,2 por ciento en dev y 43,4 por ciento en test). El modelo se entrena exclusivamente sobre intervenciones de profesor, de modo que su comportamiento sobre habla de estudiantes no esta evaluado.

## Capacidades

- Clasificacion binaria de texto: devuelve 1 cuando la asercion "muy corto" se cumple para el enunciado y 0 en caso contrario.
- Prediccion de probabilidad calibrada en dos clases mediante `predict_proba` (formato `[P(no), P(yes)]`).
- Integracion en esquemas de aserciones para codificacion auditable de dialogo educativo dentro del ecosistema EduBehaviors.
- Extraccion de embeddings subyacente heredada del modelo base MPNet, util como representacion de frases en ingles.
- Uso programatico directo mediante la libreria `setfit` o a traves del paquete `EduBehaviors-kit`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, vision, audio ni modo de pensamiento: es un clasificador especializado, no un modelo generativo.

## Casos de uso

- Codificacion automatica de discurso en el aula: dado un corpus de transcripciones de clase, el clasificador marca que intervenciones del profesor son muy cortas, alimentando analisis agregados de patrones de habla docente.
- Investigacion educativa reproducible: al formar parte de un esquema de aserciones auditable, permite documentar cada etiqueta y auditar el proceso de codificacion frente a revision por pares.
- Aumento de datasets anotados manualmente: sirve como preetiquetador para acelerar la anotacion humana de marcadores de discurso, revisando despues solo los casos de baja confianza.
- Analisis de dinamica conversacional profesor-alumno: combinado con otros clasificadores de la familia `bu5`, permite construir perfiles de interaccion turno a turno sobre el dataset TalkMoves.
- Monitorizacion de calidad docente a escala: en grandes repositorios de transcripciones, el modelo puede filtrar y cuantificar la proporcion de intervenciones muy breves como indicador de estilo lectivo.
- Filtrado y preprocesado en pipelines NLP educativos: puede eliminar o etiquetar enunciados muy cortos antes de pasarlos a modelos mas costosos, reduciendo ruido en etapas posteriores.
- Desarrollo de herramientas de formacion docente: integrado en un panel que muestre al profesor la distribucion de la longitud de sus intervenciones durante una sesion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index oficial (split de test, clase positiva):

| Metrica | Valor (test) |
|---|---|
| F1 (clase positiva) | 0,8721 |
| Precision (clase positiva) | 0,8796 |
| Recall (clase positiva) | 0,8646 |
| ROC-AUC | 0,9604 |

Resultados completos publicados en la model card para ambos splits:

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.294 | 43,2 % | 0,894 | 0,861 | 0,877 | 0,963 | 0,953 |
| test | 8.239 | 43,4 % | 0,880 | 0,865 | 0,872 | 0,960 | 0,949 |

No se han publicado en la informacion disponible resultados frente a otros modelos comparables en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en FP32 (109,5 M de parametros) y unos 0,22 GB en FP16; por debajo de 0,15 GB en cuantizacion INT8 aproximada. La cabeza de regresion logistica anade un coste despreciable.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; cabe sobradamente en RTX 3060, RTX 4090, A100 o H100, aunque estos ultimos estan sobredimensionados para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU para lotes pequenos.
- Opciones de despliegue: libreria `setfit` sobre PyTorch, backend de `sentence-transformers`, exportacion a ONNX si se necesita, e integracion a traves del paquete `EduBehaviors-kit`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_is_very_short | 109,5 M | no disponible | Clasificacion binaria (asercion `is_very_short`) | no disponible | HuggingFace |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base) | ~109 M | no disponible | Embeddings de frases / similitud semantica | no disponible en esta ficha | HuggingFace |
| Otros clasificadores de aserciones de la familia `bu5` (StanfordSCALE) | no disponible | no disponible | Clasificacion binaria de otras aserciones | no disponible | HuggingFace |

No se dispone en la informacion proporcionada de modelos comparables con metricas publicadas en la misma tarea y dataset, por lo que no es posible una comparacion de rendimiento directa.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento proceden de anotadores LLM, no de codificadores humanos; la concordancia entre anotadores (alfa de Krippendorff) es de 0,634, lo que indica un acuerdo moderado y un techo de calidad inherente a las etiquetas.
- El modelo solo se ha entrenado y validado sobre intervenciones de profesor; su comportamiento sobre habla de estudiantes no se ha probado.
- Es un clasificador binario especializado en una unica asercion; no generaliza a otras tareas ni produce texto.
- Soporta unicamente ingles (`en`), por lo que no debe aplicarse a transcripciones en castellano u otros idiomas sin reevaluacion.
- Existe riesgo de alucinacion en el sentido clasico de clasificacion: falsos positivos y falsos negativos inherentes a precision y recall del orden del 0,86-0,88.
- La licencia no esta declarada, por lo que no se puede confirmar la viabilidad de uso comercial; conviene aclararlo con los autores antes de cualquier despliegue productivo.
- Con 0 descargas y 0 likes, es un artefacto de investigacion recien publicado con escasa validacion externa por la comunidad.
- Las fechas de creacion y actualizacion (octubre de 2026) son muy recientes; no hay historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_is_very_short
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Dataset TalkMoves: https://github.com/SumnerLab/TalkMoves
- Proyecto EduBehaviors: no disponible
- Publicacion o paper asociado: no disponible
- Repositorio o demo adicional: no disponible
