# StanfordSCALE/assertion_repeats_a_phrase_from_a_prior_student_contribution_without_adding_new_words

## Resumen

El modelo `StanfordSCALE/assertion_repeats_a_phrase_from_a_prior_student_contribution_without_adding_new_words` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificacion auditable de dialogo en el aula. Su tarea concreta es detectar si una intervencion docente repite una frase ya emitida por un estudiante sin anadir palabras nuevas, un comportamiento discursivo relevante para el analisis pedagogico.

Tecnicamente no es un modelo generativo, sino un clasificador SetFit construido sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` con una cabeza de regresion logistica. Cuenta con 109.486.464 parametros en total, con un tamano de repositorio de 0.4 GB, y esta entrenado sobre un subconjunto anotado por LLM del TalkMoves Dataset (13.181 ejemplos de entrenamiento, 3.296 de desarrollo y 8.238 de test). El modelo opera unicamente en ingles.

Su relevancia radica en que forma parte de una infraestructura mas amplia, el paquete Python `EduBehaviors-kit`, pensada para etiquetar de forma reproducible y auditable comportamientos docentes, aunque los resultados publicados por el propio autor advierten de que el rendimiento no es suficiente para un uso autonomo: el F1 de la clase positiva en test es de 0,318.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder transformer (MPNet) con cabeza de clasificacion LogisticRegression |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit (Sentence Transformer Fine-Tuning), en el que primero se ajusta el cuerpo del encoder con aprendizaje contrastivo sobre pares de frases y despues se entrena una cabeza ligera de clasificacion. El cuerpo es `sentence-transformers/paraphrase-mpnet-base-v2` y la cabeza es una `LogisticRegression`. Los hiperparametros declarados incluyen una tasa de aprendizaje del cuerpo de 2e-05, una tasa de la cabeza de 0,01, tamano de lote de 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, un maximo de 5000 pasos en la fase contrastiva y 100 pasos maximos de evaluacion, con semilla 20260904 y precision mixta activada en GPU.

El entrenamiento se realizo sobre el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`, derivado de anotaciones automaticas sobre las intervenciones docentes del TalkMoves Dataset. Las etiquetas fueron generadas por anotadores LLM (no por codificadores humanos), con un acuerdo entre anotadores medido por alfa de Krippendorff de 0,513, lo que indica una fiabilidad moderada. La tasa base de la clase positiva es muy baja (3,3 % global: 3,2 % en train, 3,0 % en dev y 3,5 % en test), un desequilibrio severo que condiciona el rendimiento del clasificador. La entrada se construye pasando la intervencion como texto plano (`{utterance}`), sin plantillas adicionales.

## Capacidades

- Clasificacion binaria de texto: predice si una intervencion cumple la asercion "repite una frase de una contribucion previa de un estudiante sin anadir palabras nuevas".
- Salida de probabilidad mediante `predict_proba`, que devuelve la probabilidad de cada clase.
- Integracion con el paquete Python `EduBehaviors-kit` para flujos de codificacion de dialogo en el aula.
- Deteccion de comportamientos discursivos docentes en el marco de esquemas basados en aserciones (auditable dialogue coding).
- Uso en ingles unicamente.
- No dispone de tool calling, soporte de agentes, capacidades multimodales ni generacion de texto: es exclusivamente un clasificador.

## Casos de uso

- Investigacion educativa sobre discurso en el aula: el modelo puede etiquetar automaticamente intervenciones docentes para cuantificar la frecuencia con la que se repiten contribuciones previas de estudiantes, siempre como componente de un pipeline con validacion humana.
- Auditoria de patrones de interaccion docente: integrado en `EduBehaviors-kit`, permite generar esquemas de codificacion reproducibles que documenten comportamientos discursivos concretos.
- Preetiquetado asistido para anotacion humana: al ofrecer `predict_proba`, puede priorizar casos con alta probabilidad para que un codificador humano los revise, reduciendo el coste de anotacion manual.
- Analisis longitudinal de sesiones grabadas: aplicado por lotes sobre transcripciones, permite estudiar la evolucion de este comportamiento a lo largo de un curso o de una unidad didactica.
- Formacion docente y retroalimentacion: los resultados (con supervision) pueden alimentar informes sobre como el profesor reformula o repite lo dicho por los alumnos.
- Filtrado de conjuntos de datos: identifica las intervenciones que cumplen la asercion para construir subconjuntos etiquetados destinados a otros analisis o para entrenar modelos posteriores.
- Componente en investigaciones comparativas: sirve como referencia en estudios que contrasten distintos esquemas de codificacion del dialogo educativo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.296 | 3,0 % | 0,465 | 0,200 | 0,280 | 0,922 | 0,320 |
| test | 8.238 | 3,5 % | 0,532 | 0,227 | 0,318 | 0,931 | 0,386 |

Ademas, la model card recoge las siguientes metricas de test en formato individual: F1 de la clase positiva 0,3181, precision 0,5323, recall 0,2268 y ROC-AUC 0,931. No se han publicado comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision fp32 el modelo ocupa aproximadamente 0,44 GB de pesos; en fp16 alrededor de 0,22 GB. El repositorio completo ocupa 0,4 GB.
- GPU recomendadas: cabe con holgura en cualquier GPU, incluida una NVIDIA RTX 3060, RTX 4090, T4 o incluso inferencia en CPU. No requiere A100 ni H100.
- Inferencia en consumer GPU: si, cabe en practicamente cualquier GPU de consumo e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: el modelo se carga con la libreria `setfit` (`SetFitModel.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles.
- Instalacion: `pip install setfit`.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para modelos equivalentes de clasificacion de aserciones docentes. La referencia mas directa es el propio encoder base, aunque su tarea y metricas no son directamente comparables.

| Modelo | Tipo | Parametros | Contexto | Metrica principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | Clasificador SetFit (MPNet + LogisticRegression) | 109.486.464 | no disponible | F1 test 0,318 / ROC-AUC 0,931 | no disponible | HuggingFace |
| sentence-transformers/paraphrase-mpnet-base-v2 | Encoder de frases | no disponible en esta ficha | no disponible | no aplica (no es clasificador de la tarea) | no disponible | HuggingFace |
| Otros clasificadores del suite EduBehaviors | Clasificadores SetFit | no disponible | no disponible | no disponible | no disponible | HuggingFace (StanfordSCALE) |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos, con un alfa de Krippendorff de 0,513, lo que indica un acuerdo moderado entre anotadores.
- El modelo fue entrenado unicamente con intervenciones docentes; su comportamiento sobre intervenciones de estudiantes no ha sido evaluado.
- El F1 de test es de 0,318, con un recall de solo 0,227. El propio autor indica que el modelo no es lo bastante bueno para usarse de forma autonoma.
- Existe un desequilibrio severo de clases (tasa base positiva del 3,3 %), lo que favorece la prediccion de la clase mayoritaria y penaliza el recall.
- La licencia no esta especificada en la informacion disponible, por lo que no puede confirmarse que el uso comercial este permitido.
- El modelo solo soporta ingles; no hay soporte multilingue documentado.
- Al ser un clasificador binario acotado, no genera texto ni admite razonamiento multi-paso, tool calling ni agentes.
- No debe usarse como unica fuente para decisiones de evaluacion docente; requiere validacion humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_repeats_a_phrase_from_a_prior_student_contribution_without_adding_new_words
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Organizacion en HuggingFace: https://huggingface.co/StanfordSCALE
