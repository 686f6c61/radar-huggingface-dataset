# StanfordSCALE/assertion_transitions_from_one_in_class_activity_to_another

## Resumen

`StanfordSCALE/assertion_transitions_from_one_in_class_activity_to_another` es un clasificador binario de texto desarrollado por la iniciativa Stanford SCALE dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificacion auditable de dialogo educativo. El modelo no es un generador: resuelve una tarea muy concreta, decidir si un enunciado de docente marca una transicion desde una actividad de aula hacia otra, devolviendo una etiqueta booleana y una probabilidad asociada.

Tecnicamente se construye con la libreria SetFit sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet) y una cabeza de regresion logistica. El cuerpo entrenable aporta unos 109 millones de parametros, de modo que se trata de un clasificador ligero, apto para ejecutarse en CPU y en cualquier GPU de consumo. La entrada es una unica intervencion del docente en texto plano, es decir, la ventana de contexto efectiva es la de una frase o turno, no la de un dialogo completo.

Su relevancia es metodologica: forma parte de un conjunto de clasificadores de aserciones (`bu5`) que permiten reconstruir automaticamente codificaciones de discurso de aula sobre un corpus anotado con ayuda de LLM (TalkMoves). El rendimiento medido es modesto (F1 de 0,444 en test), coherente con una clase positiva poco frecuente (tasa base del 6,3 por ciento) y con ruido en las etiquetas de anotacion (alfa de Krippendorff de 0,644).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit (encoder MPNet + cabeza LogisticRegression) |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la informacion; limitada por el encoder MPNet subyacente (hasta 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: en una primera fase contrastiva se afina el encoder de frases MPNet (cuerpo) con un learning rate de 2e-05, batch size de 16 y un maximo de 5.000 pasos, y en una segunda fase se entrena una cabeza de `LogisticRegression` con learning rate de 0.01 y batch size de 32. Se configuraron 10 epocas, semilla 20260904 y precision mixta activada en GPU. La entrada es el enunciado tal cual, sin plantilla adicional; el modelo produce por tanto una clasificacion por turno.

Los datos de entrenamiento proceden del subconjunto anotado por LLM del TalkMoves Dataset, recogido en `StanfordSCALE/assertions_llm_annotated_talkmoves`: 13.180 filas en train (53,3 por ciento), 3.298 en dev (13,3 por ciento) y 8.237 en test (33,3 por ciento). La etiqueta positiva (transicion entre actividades de aula) tiene una tasa base del 6,2 por ciento, con solo un 6,3 por ciento en test, lo que configura un problema claramente desbalanceado. La anotacion no fue humana: procede de anotadores LLM, con un acuerdo entre anotadores medido por alfa de Krippendorff de 0,644. El corpus original solo contiene intervenciones de docentes.

## Capacidades

- Clasificacion binaria de texto: determina si un enunciado docente marca una transicion de una actividad de aula a otra.
- Salida probabilistica mediante `predict_proba`, ademas de la etiqueta discreta de `predict`.
- Funcionamiento sobre enunciados individuales en ingles, sin necesidad de contexto conversacional adicional.
- Integracion directa con la libreria SetFit y con el paquete `EduBehaviors-kit` para pipelines de codificacion de dialogo.
- Ejecucion ligera en CPU o GPU de consumo gracias a su tamano de ~109 M de parametros.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente.

## Casos de uso

- Codificacion automatica de discurso de aula: dado un turno de docente transcrito, el modelo estima la probabilidad de que ese turno senale el paso de una actividad a otra, permitiendo etiquetar transcripciones completas sin anotacion manual.
- Investigacion educativa a escala: procesar miles de transcripciones con `predict_proba` y analizar la frecuencia y distribucion de transiciones entre actividades para estudios de practica docente.
- Preprocesado dentro del pipeline EduBehaviors-kit: usar el clasificador como componente de una cadena mayor de aserciones (`bu5`) que reconstruye codificaciones de comportamiento educativo de forma auditable.
- Formacion y desarrollo profesional docente: generar informes que cuantifiquen cuantas transiciones de actividad introduce un profesor y en que momentos de la sesion, utiles para sesiones de reflexion con observadores.
- Analisis de corpus historicos: aplicar el modelo sobre transcripciones ya existentes del TalkMoves u otros corpus de aula en ingles para anadir una capa de anotacion sobre transiciones de actividad.
- Filtrado y enrutado de segmentos: emplear la probabilidad de salida como umbral ajustable para segmentar automaticamente una clase larga en bloques de actividad, calibrando el umbral segun la tasa base objetivo.
- Auditoria de anotaciones: comparar la prediccion del clasificador con codificaciones humanas o de otros modelos para detectar discrepancias en conjuntos de datos de discurso educativo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.298 | 5,9% | 0,557 | 0,400 | 0,466 | 0,801 | 0,434 |
| test | 8.237 | 6,3% | 0,550 | 0,372 | 0,444 | 0,779 | 0,400 |

Dataset de evaluacion: `StanfordSCALE/assertions_llm_annotated_talkmoves`, tarea `text-classification`. No hay resultados adicionales (MMLU, HumanEval u otros) porque el modelo no es un LLM generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en fp32 y 0,22 GB en fp16, dado un tamano de ~109 M de parametros.
- El repositorio ocupa 0,4 GB, por lo que el almacenamiento necesario es minimo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria dedicada; por ejemplo GTX 1650, RTX 3060, RTX 4090. Tambien funciona en CPU sin requisitos relevantes.
- Cabe sobradamente en GPU de consumo, e incluso en entornos sin GPU.
- Opciones de despliegue: SetFit (via `SetFitModel.from_pretrained`), `sentence-transformers`, exportacion a ONNX y servidores de inferencia de modelos de embeddings. No aplican vLLM, llama.cpp ni Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera una latencia de milisegundos y un throughput alto en lotes, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos publicados de comparativas directas para este clasificador. Como alternativas de la misma categoria (clasificacion de texto ligera basada en encoder) cabria considerar la propia base `sentence-transformers/paraphrase-mpnet-base-v2` con una cabeza de clasificacion, o clasificadores SetFit equivalentes de otros proyectos; sin embargo, la informacion proporcionada no incluye sus metricas, contexto o licencia para esta tarea concreta.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_transitions_from_one_in_class_activity_to_another | 109,5 M | no especificada (encoder MPNet, hasta 512 tokens) | clasificacion binaria de discurso de aula | no disponible | HuggingFace |
| sentence-transformers/paraphrase-mpnet-base-v2 | no disponible | hasta 512 tokens | embeddings de frases | no disponible | HuggingFace |
| Otros clasificadores de aserciones StanfordSCALE (conjunto bu5) | no disponible | no disponible | clasificacion binaria de discurso de aula | no disponible | HuggingFace |

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos, con un acuerdo entre anotadores (alfa de Krippendorff) de 0,644, lo que introduce ruido irreducible en el entrenamiento y la evaluacion.
- El modelo se entreno unicamente con intervenciones de docentes; su comportamiento sobre habla de estudiantes no esta probado.
- La clase positiva es poco frecuente (tasa base del 6,2 por ciento), de modo que la precision de 0,550 y el recall de 0,372 implican numerosos falsos positivos y falsos negativos si se usa con umbral 0,5.
- El rendimiento es moderado (F1 de 0,444 y ROC-AUC de 0,779 en test), por lo que no es adecuado como fuente unica de verdad en investigacion sin supervision humana.
- Soporte unicamente en ingles; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- La licencia no esta declarada en la informacion, por lo que no puede confirmarse su aptitud para uso comercial ni las condiciones de redistribucion.
- Al limitarse a una unica intervencion como entrada, no modela el contexto conversacional completo; la deteccion de transiciones depende de la informacion contenida en el propio turno.
- Los resultados de los benchmarks estan marcados como no verificados de forma independiente.
- Existe riesgo de sobreajuste al dominio del corpus TalkMoves y de degradacion al aplicarse a otros contextos de aula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_transitions_from_one_in_class_activity_to_another
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Libreria SetFit: https://github.com/huggingface/setfit
- Paquete EduBehaviors-kit: no disponible en la informacion proporcionada
