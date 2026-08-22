# Tiendat88/FetalVision

## Resumen

FetalVision es un modelo de clasificación de imágenes diseñado para detectar vistas fetales de ultrasonido no estándar o fuera de distribución (OOD). Desarrollado por Tiendat88, se presenta como un autoencoder híbrido con un clasificador latente que distingue entre planos fetales estándar y la categoría "Other", que agrupa vistas atípicas o no contempladas en los protocolos habituales. El modelo se entrena sobre el conjunto de datos FETAL_PLANES_DB de Burgos-Artizzu et al., un repositorio público de imágenes de ultrasonido fetal, y se distribuye con una licencia no especificada (`other`).

La relevancia del modelo radica en su utilidad como control de calidad dentro de pipelines de análisis automático de ecografías: una vista no estándar puede provocar errores en la medición biométrica o en el diagnóstico si se procesa como un plano válido. FetalVision actúa como filtro previo para descartar estas imágenes antes de su análisis. La arquitectura combina un autoencoder con un clasificador latente y se presenta como un conjunto (ensemble) de tres semillas entrenadas de forma independiente, lo que mejora la robustez frente a la variabilidad propia de la imagen médica.

Aunque el repositorio no incluye pesos preentrenados en formato HuggingFace (el tamaño del repositorio es 0.0 GB), la model card indica que los archivos de pesos se encuentran en el repositorio de código fuente. No se especifica el número total de parámetros ni la resolución de entrada, y el modelo está pensado para tareas de clasificación de imágenes, no para generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder híbrido + clasificador latente (ensemble de 3 semillas) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable (entrada de imágenes) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (procesamiento de imágenes) |
| Licencia | Other (no especificada) |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

La arquitectura consiste en un autoencoder que comprime la imagen de entrada en un espacio latente, sobre el cual se entrena un clasificador binario (estándar vs. no estándar). El componente de autoencoder permite reconstruir la imagen, y la combinación de pérdidas de reconstrucción y clasificación hace que el modelo sea sensible a desviaciones de los patrones típicos. El sistema final es un ensemble de tres modelos entrenados con semillas 42, 1337 y 2026, cuyas predicciones se combinan con pesos 0.30, 0.35 y 0.35, seleccionados únicamente sobre el conjunto de validación.

El entrenamiento se realizó sobre FETAL_PLANES_DB, que contiene imágenes de ultrasonido de planos fetales estándar y no estándar. No se dispone de información sobre el número de imágenes, el preprocesamiento exacto ni la política de aumentación de datos; estos detalles están almacenados en los archivos de checkpoint y en el código fuente del repositorio GitHub asociado. No se menciona el uso de técnicas de RLHF, DPO ni otros métodos de alineación, ya que es un modelo de visión supervisado de manera clásica.

## Capacidades

- Clasificación de imágenes de ultrasonido fetal en dos categorías: planos estándar y no estándar/OOD.
- Detección de anomalías basada en la reconstrucción del autoencoder y la puntuación del clasificador latente.
- Funcionamiento como filtro de calidad en pipelines de análisis de imágenes médicas.
- Extracción de características latentes que pueden reutilizarse para otras tareas de visión médica.
- Robustez mejorada mediante ensemble de tres semillas, lo que reduce la varianza de predicción.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la imagen.

## Casos de uso

- Control de calidad en adquisición de ecografías: integrar FetalVision en el software del ecógrafo para alertar al técnico cuando una vista no se ajusta a los planos estándar, evitando así la repetición de exploraciones o la toma de medidas erróneas.
- Filtrado de datos para entrenamiento de modelos de biometría fetal: antes de entrenar un sistema de medición automática, se puede usar FetalVision para eliminar imágenes fuera de distribución que degradarían el rendimiento del modelo.
- Preprocesamiento en sistemas de diagnóstico asistido: colocar el modelo como paso previo en un pipeline de clasificación de planos (p.ej. clasificador de 4 cámaras, perfil facial, etc.) para descartar vistas atípicas que podrían confundir al clasificador principal.
- Detección de outliers en bases de datos clínicas: aplicar el modelo a grandes repositorios de imágenes para identificar automáticamente casos no estándar que requieran revisión manual o que deban excluirse de estudios retrospectivos.
- Investigación en detección de anomalías médicas: usar el autoencoder como extractor de características para estudiar la variabilidad de los planos fetales y desarrollar nuevas métricas de calidad.
- Integración en sistemas de formación clínica: evaluar si un estudiante o residente está capturando los planos correctos durante la práctica de ecografía, proporcionando retroalimentación inmediata sobre la calidad de las imágenes obtenidas.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre el conjunto de validación (no se especifica si es test):

| Modelo | ROC-AUC | AP | F1 | Accuracy |
|---|---|---|---|---|
| Mejor modelo individual (seed 2026) | 0.9754 | 0.9630 | 0.8782 | 0.9132 |
| Ensemble de tres semillas | 0.9796 | 0.9680 | 0.8887 | 0.9219 |

No se proporcionan comparaciones con otros modelos de detección de OOD en ultrasonido fetal. Los valores indican un rendimiento sólido para la tarea, aunque la ausencia de un conjunto de test externo y de métricas de calibración limita su interpretabilidad.

## Requisitos de hardware

- No se dispone de especificaciones oficiales sobre VRAM, número de parámetros ni requisitos de GPU.
- Dado que se trata de un autoencoder híbrido de tamaño presumiblemente moderado, es probable que pueda ejecutarse en una GPU de consumo como una RTX 3060 o incluso en CPU para inferencia en lote, pero esta estimación no está confirmada por el autor.
- El formato de checkpoint es PyTorch, por lo que se puede desplegar con TorchServe, ONNX Runtime, o integrarse en aplicaciones mediante la API de PyTorch.
- No se han publicado medidas de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos con la misma finalidad específica (detección de vistas fetales no estándar) que permitan una comparación directa. Existen otros proyectos de código abierto con el nombre "FetalVision" en GitHub, pero abordan tareas diferentes (clasificación de planos, biometría) y no comparten métricas comparables. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo no es un sistema de diagnóstico clínico; la etiqueta "Other" no corresponde a una patología, sino a una vista no estándar. Su uso en entornos clínicos requiere validación externa, calibración y revisión regulatoria.
- La licencia es "other" sin especificar términos de uso; no se garantiza que el modelo pueda utilizarse comercialmente sin permiso del autor.
- No se ha documentado el proceso de obtención de datos ni los posibles sesgos derivados de la composición del conjunto FETAL_PLANES_DB (p.ej. distribución de equipos, poblaciones, etc.).
- La arquitectura exacta, el número de parámetros y el preprocesamiento no están detallados en la model card; se necesita consultar el código fuente para reproducir el entrenamiento.
- No se han publicado análisis de casos de error ni de calibración de las probabilidades, lo que limita su uso en aplicaciones de decisión clínica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tiendat88/FetalVision
- Dataset (FETAL_PLANES_DB): https://huggingface.co/datasets/Tiendat88/FetalVision-Fetal-Planes
- Código fuente: https://github.com/Tiendat88/FetalVision
- DOI del dataset original: https://doi.org/10.5281/zenodo.3904280
