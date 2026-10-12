# StanfordSCALE/assertion_asks_one_or_more_students_for_an_evaluation_of_a_prior_student_contribution

## Resumen

Este modelo es un clasificador de texto binario desarrollado por Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea concreta es detectar, en una intervención de un docente, si esta pide a uno o varios estudiantes que evalúen una contribución previa de otro estudiante. No es un modelo generativo, sino un clasificador de una sola etiqueta construido con la metodología SetFit sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` y una cabeza de regresión logística.

El modelo forma parte de un conjunto de aserciones "top-down" (`td`) orientadas a codificar de forma auditable el discurso en el aula. Se entrenó sobre un subconjunto anotado por LLM de intervenciones de profesorado del TalkMoves Dataset, con 13.185 ejemplos de entrenamiento, 3.292 de validación y 8.238 de test. La tasa base de la clase positiva es muy baja (1,4 %), lo que condiciona por completo sus métricas y su uso.

Es relevante ahora porque ofrece una vía reproducible y ligera para instrumentar análisis de discurso educativo a escala, integrable mediante el paquete `EduBehaviors-kit`, aunque su licencia no está declarada y sus etiquetas provienen de anotadores LLM, no humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder transformer MPNet (`paraphrase-mpnet-base-v2`) + cabeza de clasificacion `LogisticRegression` |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el encoder admite fp32/fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo sigue la receta SetFit en dos fases: primero se afina el encoder de frases `sentence-transformers/paraphrase-mpnet-base-v2` con aprendizaje contrastivo (learning rate de 2e-05, batch 16, hasta 5.000 pasos, 10 épocas, seed 20260904, precisión mixta en GPU), y despues se entrena una cabeza de regresión logística (learning rate 0,01, batch 32) sobre las representaciones obtenidas. El texto de entrada se pasa tal cual, sin plantilla ni estructura adicional, y la clasificación es binaria: la aserción se cumple o no se cumple.

Los datos proceden de un subconjunto del TalkMoves Dataset anotado por LLM, con 13.185 filas de entrenamiento (53,3 %), 3.292 de validación (13,3 %) y 8.238 de test (33,3 %). La clase positiva es extremadamente rara: 1,4 % en train, 1,4 % en dev y 1,5 % en test. El acuerdo entre anotadores medido con alfa de Krippendorff es de 0,648. No se documenta uso de RLHF ni DPO, ya que no se trata de un modelo generativo.

## Capacidades

- Clasificación binaria de una intervención docente: determina si la aserción "pide a uno o más estudiantes evaluar una contribución previa de otro estudiante" se cumple.
- Salida de probabilidad calibrada mediante `predict_proba`, que devuelve `[[P(no), P(sí)]]`.
- Integración con el paquete `EduBehaviors-kit` y con la librería `setfit` para inferencia directa en Python.
- Diseñado para texto en inglés de discurso en el aula, restringido a intervenciones de profesorado.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento.
- No es multilingüe: solo se ha entrenado en inglés.
- No genera texto: únicamente asigna una etiqueta y una probabilidad.

## Casos de uso

- Análisis de discurso en el aula a escala: procesar transcripciones de clases para cuantificar con qué frecuencia el profesorado solicita evaluación entre iguales, usando la salida probabilística para filtrar y priorizar la revisión manual.
- Investigación educativa: generar variables de codificación automática sobre corpus de transcripciones del TalkMoves Dataset para estudiar patrones de andamiaje del diálogo.
- Formación docente: construir informes que muestren al profesorado en qué momentos invita (o no) al alumnado a evaluar contribuciones ajenas, como base para la reflexión sobre su práctica.
- Triaje de corpus: dado el desequilibrio de clases, usar el clasificador como filtro de alta recuperación ajustando el umbral sobre `predict_proba` antes de una anotación humana costosa.
- Auditoría de sistemas de codificación: al ser parte de un esquema de aserciones auditables, sirve como componente inspeccionable dentro de pipelines que documentan por qué se asigna cada etiqueta.
- Prototipado en herramientas EdTech: integrar el clasificador en un asistente que marque en tiempo real intervenciones docentes que fomentan evaluación entre pares, aceptando su limitada precisión.
- Investigación en NLP educativo: usarlo como línea base (baseline) reproducible frente a otros esquemas de codificación de movimientos del habla.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el conjunto de test del dataset `StanfordSCALE/assertions_llm_annotated_talkmoves` y, para contexto adicional, sobre el split de desarrollo:

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.292 | 1,4 % | 0,674 | 0,644 | 0,659 | 0,921 | 0,673 |
| test | 8.238 | 1,5 % | 0,549 | 0,517 | 0,532 | 0,888 | 0,504 |

Métricas de test según el `model-index` oficial: F1 (clase positiva) 0,5322, Precision 0,5487, Recall 0,5167, ROC-AUC 0,8878. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia muy ligera: 109,5 M de parámetros, aproximadamente 438 MB en fp32 y 219 MB en fp16.
- Cabe sobradamente en cualquier GPU de consumo, incluida una GTX 1650 o superior; también es viable en CPU para lotes pequeños.
- GPU recomendadas para producción: cualquiera con al menos 2-4 GB de VRAM (RTX 3060, RTX 4090, T4, L4); las A100 o H100 no aportan ventaja relevante para este tamaño.
- Despliegue mediante la librería `setfit` en Python; también puede servirse con `sentence-transformers` más una capa de regresión logística, o exportarse a ONNX para inferencia de baja latencia.
- vLLM, llama.cpp, Ollama y TGI no aplican: son motores para modelos generativos, no para este clasificador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Metrica destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| assertion_asks_one_or_more_students_for_an_evaluation_of_a_prior_student_contribution | Clasificador SetFit binario | 109,5 M | no disponible | ROC-AUC test 0,888 | no disponible | HuggingFace |
| sentence-transformers/paraphrase-mpnet-base-v2 | Encoder de frases (base) | ~109 M | no disponible | no aplica (no clasifica) | Apache 2.0 (segun su ficha) | HuggingFace |
| Otras aserciones del esquema `td` de StanfordSCALE | Clasificadores SetFit | ~109 M por asercion | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento de modelos alternativos sobre el mismo dataset en la informacion proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de anotadores LLM, no de codificadores humanos; el acuerdo entre anotadores es de alfa de Krippendorff 0,648, un valor moderado.
- Entrenado exclusivamente con intervenciones de profesorado; su comportamiento sobre habla de estudiantes no ha sido probado.
- Clase positiva extremadamente rara (1,4-1,5 %), por lo que la precisión y el recall en test caen a 0,549 y 0,517 respectivamente, pese a un ROC-AUC elevado (0,888); el rendimiento operativo en umbral por defecto es limitado.
- Posible degradación por cambio de dominio si se aplica a transcripciones con formato, jerga o idioma distintos del corpus TalkMoves.
- El modelo solo cubre inglés; no se debe asumir funcionamiento en otros idiomas.
- La licencia no está declarada, lo que impide confirmar si se permite el uso comercial; conviene verificarlo antes de cualquier despliegue en producción.
- No es un modelo generativo: no puede resumir, responder preguntas ni razonar; únicamente clasifica.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y negativos derivado del desequilibrio de clases.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_asks_one_or_more_students_for_an_evaluation_of_a_prior_student_contribution
- Dataset de anotación: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Librería SetFit: no disponible como enlace en la informacion proporcionada (instalable con `pip install setfit`)
- Paquete EduBehaviors-kit: no disponible como enlace en la informacion proporcionada
