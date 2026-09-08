# SSN134/clause_classifier_legalbert

## Resumen

El modelo `SSN134/clause_classifier_legalbert` es un clasificador de cláusulas legales basado en la arquitectura BERT, publicado en HuggingFace por el usuario SSN134. El nombre del modelo y los metadatos asociados (tag `bert`, 109,5 millones de parámetros, formato safetensors) indican que se trata de un modelo encoder preentrenado y probablemente ajustado para la clasificación de cláusulas en documentos jurídicos, una tarea habitual en el análisis automatizado de contratos. A pesar de que la model card no incluye información detallada, el repositorio está disponible públicamente bajo licencia MIT y tiene un tamaño de 0,4 GB.

La relevancia de este tipo de modelos radica en su capacidad para estructurar y analizar grandes volúmenes de documentación legal, facilitando tareas como la revisión de contratos, la detección de cláusulas de riesgo o la automatización de flujos de trabajo jurídicos. Sin embargo, al no existir documentación oficial sobre el proceso de entrenamiento, el dataset utilizado ni las métricas de evaluación, su uso en producción requiere una validación previa por parte del desarrollador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder) |
| Parametros totales | 109.513.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no incluye detalles sobre la arquitectura exacta ni el proceso de entrenamiento del modelo. El tag `bert` y el número de parámetros (109,5 millones) son consistentes con un modelo BERT-base, probablemente la variante `legal-bert-base-uncased` utilizada en otros proyectos similares de la comunidad. No obstante, la model card publicada en HuggingFace no contiene ninguna descripción del dataset, del número de clases ni de las técnicas de ajuste empleadas. Los resultados de búsqueda muestran que existen modelos equivalentes que realizan fine-tuning de Legal-BERT sobre el dataset LEDGAR para clasificar cláusulas legales, pero no se puede confirmar que este modelo en particular haya seguido el mismo procedimiento.

## Capacidades

- Clasificación de cláusulas en documentos legales, según se deduce del nombre del modelo y de la existencia de modelos similares en la comunidad.
- Generación de texto: no disponible (el modelo es un encoder, no un modelo generativo).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no especificadas; probablemente limitado a inglés, dado el uso de Legal-BERT, pero no confirmado.
- Capacidades especiales (visión, audio, modo de razonamiento): no disponibles.

## Casos de uso

- Análisis automatizado de contratos: el modelo puede utilizarse para identificar y clasificar cláusulas como confidencialidad, terminación, responsabilidad o indemnización en grandes volúmenes de documentos legales, lo que agiliza la revisión manual.
- Automatización documental: integrado en un pipeline de procesamiento de documentos, permite etiquetar automáticamente cada cláusula de un contrato para su posterior almacenamiento y consulta estructurada.
- Búsqueda y recuperación de cláusulas: al clasificar cada cláusula, se puede indexar un repositorio contractual y permitir búsquedas por tipo de cláusula, facilitando el acceso rápido a información relevante.
- Asistentes legales: el modelo puede servir como componente de un sistema de apoyo a la decisión que resalte cláusulas críticas o inusuales en un contrato antes de su firma.
- Cumplimiento normativo: en entornos regulados, ayuda a verificar que los contratos incluyen cláusulas obligatorias exigidas por la legislación aplicable.
- Gestión de riesgos: la clasificación automática permite detectar cláusulas potencialmente conflictivas o de alto riesgo, priorizando la revisión por parte de abogados.

Estos casos de uso se basan en la función esperada del modelo y en las aplicaciones descritas para modelos equivalentes; no están confirmados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 y 0,25 GB en FP16, calculada a partir de los 109,5 millones de parámetros.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM; el modelo también puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, es compatible con GPUs integradas y tarjetas de gama baja como RTX 3050 o inferiores.
- Opciones de despliegue: puede ejecutarse mediante la librería Transformers de HuggingFace, así como exportarse a formato ONNX para su integración en otros entornos.
- Latencia y throughput estimados: no disponibles, al no haberse publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SSN134/clause_classifier_legalbert | 109,5 M | no disponible | MIT | HuggingFace |
| FENTECH/Legal-BERT-Clause-Classification | no disponible | no disponible | no disponible | HuggingFace |
| Jeswinpauldany/legalbert-clause-classifier | no disponible | no disponible | no disponible | HuggingFace |

Los modelos comparados son fine-tunes de Legal-BERT sobre el dataset LEDGAR, según la información de sus respectivas páginas. El modelo `FENTECH/Legal-BERT-Clause-Classification` clasifica cláusulas en 100 tipos, mientras que el de `Jeswinpauldany` se centra en la clasificación de cláusulas contractuales. No se dispone de parámetros exactos ni de licencias para estos dos modelos.

## Limitaciones y advertencias

- La model card está vacía: no se proporciona información sobre el dataset de entrenamiento, el número de clases, la metodología ni las métricas de rendimiento.
- No se han publicado benchmarks, por lo que no es posible evaluar la precisión del modelo ni compararlo de forma objetiva con alternativas.
- Al ser un modelo de clasificación legal, puede heredar sesgos presentes en los datos de entrenamiento, que no se conocen.
- Riesgo de clasificaciones incorrectas en cláusulas ambiguas o redactadas de forma poco convencional; se recomienda una revisión humana en entornos de alto riesgo.
- La licencia MIT permite el uso comercial, pero no incluye garantías de ningún tipo.
- No se especifican los idiomas soportados; es probable que el modelo funcione únicamente en inglés, aunque esto no está confirmado.

## Enlaces

- HuggingFace: https://huggingface.co/SSN134/clause_classifier_legalbert
- Modelo similar: https://huggingface.co/FENTECH/Legal-BERT-Clause-Classification
- Modelo similar: https://huggingface.co/Jeswinpauldany/legalbert-clause-classifier
- No se han encontrado papers, blogs o repositorios adicionales en la información disponible.
