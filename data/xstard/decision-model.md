# xstard/decision-model

## Resumen

decision-model es un clasificador de texto experimental desarrollado por el usuario xstard. Se construye sobre el encoder mmBERT-small congelado (jhu-clsp/mmBERT-small, licencia MIT) al que se le añade una cabeza logística compartida para evaluar candidatos y un escalado de temperatura por tipo de tarea. El modelo está diseñado para el dominio de atención al cliente y trabaja en dos idiomas: ucraniano (uk) e inglés (en). Su propósito es resolver tareas de decisión estructurada sobre tickets: clasificación binaria sí/no (tipo "noul"), selección entre candidatos (tipo "choice") y puntuación ordinal (tipo "score").

La relevancia de este modelo es limitada y muy acotada: se trata de un artefacto experimental con cero descargas y cero likes en el momento de la ficha, publicado en noviembre de 2026, y el propio autor declara explícitamente que no ofrece ninguna garantía de fiabilidad de propósito general. No es un modelo generativo ni un LLM conversacional, sino un clasificador pequeño y especializado cuya utilidad depende de un servicio FastAPI complementario (`/v1/systemone`) que no forma parte del repositorio.

El interés técnico reside en su enfoque de evaluación: encoder congelado, pooling únicamente sobre los tokens de descripción del candidato y calibración mediante temperature scaling. Sin embargo, los propios datos del autor muestran fallos severos (recall cero en solicitudes de reembolso), por lo que debe tratarse como una prueba de concepto y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT-small congelado) con cabeza logística compartida para candidatos y temperature scaling por tipo |
| Parametros totales | no disponible (el encoder base es mmBERT-small; el recuento exacto no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ucraniano (uk), inglés (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (tamaño del repo: 0.0 GB) |

## Arquitectura y entrenamiento

El modelo parte de un encoder mmBERT-small congelado, identificado con la revisión `abc32620dd4f6ab06f5fbe905dc25f310618e09f`. Sobre las representaciones del encoder se aplica mean pooling restringido exclusivamente a los tokens de la descripción del candidato, y a continuación una cabeza logística compartida que produce la decisión. Se añade un escalado de temperatura específico por tipo de tarea para intentar mejorar la calibración de las probabilidades de salida.

No se detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset. La model card menciona como fuente potencial el dataset bitext/Bitext-customer-support-llm-chatbot-training-dataset (licencia CDLA-Sharing-1.0), aunque los datos crudos y las claves no se suben al repositorio y la procedencia de anotaciones se conserva en un corpus local. El conjunto de test consta de 310 tickets con revisión semántica declarada por IA; se trata de un conjunto sintético revisado por IA, no de un benchmark anotado por humanos, y la atribución de la revisión es autodeclarada. No se realizó reentrenamiento guiado por test.

## Capacidades

- Clasificación binaria sí/no sobre descripciones de candidatos (tipo "noul", devuelve P(yes)).
- Selección entre candidatos múltiples (tipo "choice").
- Puntuación ordinal con nivel esperado basado en cero (tipo "score").
- Procesamiento bilingüe ucraniano/inglés en el dominio de atención al cliente.
- Calibración mediante temperature scaling por tipo de tarea.
- Integración prevista con un servicio FastAPI complementario (`/v1/systemone`).
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de visión, audio ni modo de pensamiento.

## Casos de uso

- Triaje de tickets de soporte con decisión binaria: el modelo puede evaluar si un ticket cumple un criterio predefinido (tipo "noul") y devolver P(yes), útil para enrutar automáticamente casos que requieren intervención humana frente a los que no.
- Clasificación de intención entre opciones cerradas: con el tipo "choice" alcanza 0.935 de accuracy en inglés y 0.871 en ucraniano, lo que permite asignar tickets a una de varias categorías predefinidas en un flujo de atención al cliente.
- Puntuación de prioridad o severidad: el tipo "score" devuelve un nivel ordinal esperado, aprovechable para ordenar colas de tickets por urgencia estimada, siempre que se acepte un MAE en torno a 0.63.
- Filtrado previo en pipelines de soporte bilingüe: al cubrir ucraniano e inglés, puede actuar como primera capa de clasificación en operaciones que atienden ambos idiomas antes de derivar a modelos mayores.
- Prototipado de sistemas de decisión con encoder congelado: sirve como referencia para experimentar con cabezas logísticas y calibración sobre mmBERT-small sin reentrenar el encoder.
- Investigación sobre calibración: los valores de ECE y NLL publicados (por ejemplo, ECE 0.043 en uk/noul y 0.059 en en/choice) permiten estudiar el efecto del temperature scaling en clasificadores pequeños.
- No debe emplearse para decisiones automáticas de reembolso: el propio autor documenta recall cero en las 21 solicitudes explícitas de reembolso por idioma.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 155 ejemplos por celda idioma/tipo:

| Idioma/tipo | n | Accuracy | Macro F1 | ECE | NLL | Score MAE |
|---|---:|---:|---:|---:|---:|---:|
| uk/noul | 155 | 0.858 | 0.462 | 0.043 | 0.358 | — |
| uk/choice | 155 | 0.871 | 0.870 | 0.086 | 0.435 | — |
| uk/score | 155 | 0.555 | 0.539 | 0.082 | 0.925 | 0.629 |
| en/noul | 155 | 0.865 | 0.464 | 0.043 | 0.384 | — |
| en/choice | 155 | 0.935 | 0.935 | 0.059 | 0.290 | — |
| en/score | 155 | 0.510 | 0.460 | 0.135 | 0.961 | 0.635 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el encoder base es mmBERT-small, lo que sugiere un modelo pequeño, pero no se declara el recuento de parámetros ni el tamaño de los pesos (repo de 0.0 GB).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí dado el tamaño del encoder base, pero no confirmado por el autor.
- Opciones de despliegue: el autor indica un servicio FastAPI complementario (`/v1/systemone`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| xstard/decision-model | Clasificador sobre encoder | no disponible | no disponible | uk, en | MIT | Hugging Face (0 descargas) |
| jhu-clsp/mmBERT-small | Encoder base | no disponible | no disponible | multilingüe | MIT | Hugging Face |
| Alternativas de clasificación de tickets | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables con otros clasificadores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado explícitamente como experimental, sin garantía de fiabilidad de propósito general.
- Encoder congelado: solo se entrena la cabeza de candidatos, lo que limita la adaptación al dominio.
- Dominio restringido a atención al cliente; criterios arbitrarios no vistos no están validados.
- Fallo crítico documentado: recall cero en las 21 solicitudes explícitas de reembolso por idioma; la accuracy de reembolso es comparable a la línea base de la clase previa. No usar para decisiones automáticas de reembolso.
- MAE de la tarea "score" de 0.629 (uk) y 0.635 (en), por encima del objetivo de 0.5.
- Macro F1 bajo en la tarea "noul" (0.462 en uk, 0.464 en en), lo que indica desequilibrio entre clases.
- El conjunto de test es sintético y revisado por IA, no anotado por humanos; la atribución de la revisión es autodeclarada.
- El temperature scaling no constituye prueba de calibración; deben inspeccionarse ECE/NLL en tests independientes.
- Solo cubre ucraniano e inglés; no hay soporte para castellano ni otros idiomas.
- Licencia MIT permite uso comercial, pero las limitaciones técnicas desaconsejan su uso en producción sin validación adicional.
- Dependencia de un servicio FastAPI externo no incluido en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xstard/decision-model
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset de origen: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
