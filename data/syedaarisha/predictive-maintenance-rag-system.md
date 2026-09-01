# SyedaArisha/predictive-maintenance-rag-system

## Resumen

El repositorio `SyedaArisha/predictive-maintenance-rag-system` no contiene un modelo único, sino un sistema completo de mantenimiento predictivo de extremo a extremo, desarrollado por Syeda Arisha Hassan para entornos de fabricación FMCG (bienes de consumo de alta rotación) e industrial continua. El sistema combina cuatro pipelines de aprendizaje automático y profundo —clasificación de fallos, regresión de vida útil restante (RUL), detección temprana de anomalías y un módulo de recuperación aumentada por generación (RAG)— para ofrecer diagnósticos en lenguaje natural y reprogramación automática de producción. Su relevancia radica en abordar el coste de paradas no planificadas, estimado entre 10 000 y 36 000 dólares por hora en plantas FMCG según McKinsey.

La arquitectura integra modelos clásicos (XGBoost, Random Forest) y redes profundas (LSTM, CNN-LSTM) para el análisis de telemetría, junto con un índice FAISS de 7966 vectores de 384 dimensiones y un LLM explicador (SmolLM2-135M-Instruct) que genera informes de diagnóstico. El repositorio ocupa 0,6 GB e incluye los artefactos entrenados, el índice vectorial y el corpus de registros de mantenimiento sintetizados. Aunque el pipeline está etiquetado como `tabular-classification`, el sistema abarca tareas de regresión, clasificación y generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema híbrido: ensembles XGBoost+RF, LSTM de 2 capas, 1D-CNN-LSTM, RAG con FAISS y SmolLM2-135M |
| Parametros totales | No disponible (múltiples modelos independientes) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada tabular y series temporales) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | joblib (.pkl), PyTorch (.pt), FAISS (.bin), pickle (.pkl) |

## Arquitectura y entrenamiento

El sistema se compone de cuatro módulos diferenciados. El primero es un clasificador binario de fallos basado en un ensemble soft-voting de XGBoost y Random Forest, optimizado con Optuna y entrenado sobre el dataset AI4I 2020 (10 000 registros, 14 características) con sobremuestreo SMOTE para abordar el desequilibrio de clases (3,4 % de fallos). El segundo módulo es un clasificador temporal de alerta temprana (60 minutos antes del fallo) entrenado sobre 220 320 lecturas de 52 sensores de una bomba, con división temporal estricta 50/50 y eliminación de filas `RECOVERING` para evitar fuga de datos. El tercer módulo es un regresor de vida útil restante (RUL) sobre el dataset NASA CMAPSS FD001, con dos arquitecturas: una LSTM de 2 capas (tamaños ocultos 64→32, LayerNorm, early stopping) y una 1D-CNN-LSTM que combina extracción espacial convolucional con recurrencia temporal. Se usan ventanas deslizantes 3D (N×30×24), escalado MinMax y capado de RUL a 125 ciclos. El cuarto módulo es el sistema RAG: sobre el dataset Microsoft Azure PdM (876 000 filas de telemetría de 100 máquinas), se sintetizaron 7966 registros de mantenimiento en lenguaje natural, se incrustaron con `all-MiniLM-L6-v2` (384 dimensiones) y se indexaron en FAISS con búsqueda exacta L2. El LLM explicador SmolLM2-135M-Instruct se ejecuta en CPU con un post-procesador determinista anti-parroting.

## Capacidades

- Clasificación binaria de fallos en maquinaria de fresado (dataset AI4I 2020) con ROC-AUC de 0,9726 y recall de 0,87.
- Detección temprana de fallos con 60 minutos de antelación en bombas industriales (dataset Pump Sensor).
- Regresión de vida útil restante (RUL) en motores turbofan (NASA CMAPSS FD001) con MAE entre 14,2 y 16,8 ciclos.
- Generación de informes de diagnóstico en lenguaje natural mediante RAG: recupera registros históricos de mantenimiento relevantes y los combina con la salida de los modelos predictivos.
- Reprogramación automática de producción: reasigna trabajos a máquinas sanas basándose en el estado de riesgo calculado.
- Clasificación de riesgo en tres niveles (Healthy, At Risk, Critical) según umbrales de probabilidad (0-15 %, 16-40 %, 41 %+).
- Soporte de inferencia en CPU para el componente LLM (SmolLM2-135M), lo que permite despliegue ligero.

## Casos de uso

- Monitorización en tiempo real de flotas de maquinaria: el sistema procesa telemetría continua de sensores y calcula probabilidades de fallo y horas restantes de vida útil para cada máquina, mostrando un panel con indicadores de riesgo.
- Planificación de mantenimiento preventivo: los umbrales de riesgo (Healthy, At Risk, Critical) permiten priorizar intervenciones y evitar paradas no planificadas, reduciendo el coste operativo.
- Generación automática de informes de diagnóstico: el módulo RAG recupera registros históricos de mantenimiento similares al estado actual de la máquina y el LLM redacta un informe en Markdown con recomendaciones accionables.
- Reasignación dinámica de producción: cuando una máquina entra en estado crítico, el sistema reasigna automáticamente los trabajos pendientes a máquinas sanas, con un registro de auditoría de los cambios.
- Análisis de causa raíz: los registros sintetizados en el corpus FAISS permiten consultar patrones históricos de fallos y correlacionarlos con las lecturas actuales de sensores.
- Formación de personal de mantenimiento: los informes generados en lenguaje natural sirven como material didáctico para operarios, explicando qué componente está fallando y qué acciones tomar.
- Integración en sistemas MES/ERP: la API FastAPI permite conectar el sistema con plataformas de gestión de producción para automatizar órdenes de trabajo.

## Benchmarks y rendimiento

Los resultados reportados en la model card se resumen a continuación. No se han publicado comparaciones con otros sistemas en la información disponible.

| Tarea | Dataset | Métrica | Resultado |
|---|---|---|---|
| Clasificación de fallos (AI4I) | AI4I 2020 | ROC-AUC | 0,9726 |
| Clasificación de fallos (AI4I) | AI4I 2020 | Recall | 0,87 |
| Clasificación de fallos (AI4I) | AI4I 2020 | Matriz de confusión | [[1892, 40], [9, 59]] |
| Regresión RUL (LSTM) | NASA CMAPSS FD001 | MAE | ~14,2–16,8 ciclos |
| Regresión RUL (LSTM) | NASA CMAPSS FD001 | RMSE | ~18,9–22,4 ciclos |

## Requisitos de hardware

- El componente LLM (SmolLM2-135M) está diseñado para ejecutarse en CPU, por lo que no requiere GPU para la generación de informes.
- Los modelos de clasificación (XGBoost, Random Forest) son ligeros y se cargan con joblib; requieren menos de 1 GB de RAM.
- Los checkpoints LSTM y CNN-LSTM son archivos .pt de tamaño moderado (el repositorio total ocupa 0,6 GB) y pueden ejecutarse en CPU, aunque una GPU acelera la inferencia sobre series largas.
- El índice FAISS (12,2 MB) se carga en memoria principal; la búsqueda exacta L2 es viable en CPU para 7966 vectores.
- Para el despliegue completo con FastAPI y el dashboard web, se recomienda un servidor con al menos 4 GB de RAM y CPU multinúcleo. No se requieren GPUs dedicadas.
- Opciones de despliegue: FastAPI/uvicorn para la API, dashboard web interactivo, y los modelos pueden exportarse a formatos estándar (ONNX, TorchScript) si se desea optimización adicional.

## Comparativa con modelos similares

No se dispone de información comparativa con otros sistemas de mantenimiento predictivo basados en RAG en la documentación proporcionada. Los resultados de búsqueda web muestran proyectos similares (por ejemplo, `ZidanSenpai/RAG-Predictive-Maintenance` o el framework PARAM), pero no se han publicado métricas comparables que permitan una tabla objetiva. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- El sistema depende de la calidad y representatividad de los datos de entrenamiento; los modelos se han validado en datasets específicos (AI4I, Pump Sensor, CMAPSS, Azure PdM) y pueden no generalizar a otros tipos de maquinaria o condiciones operativas.
- El corpus de mantenimiento para RAG es sintetizado, no proviene de registros reales de plantas; esto puede limitar la precisión de los informes generados y requerir validación humana antes de tomar decisiones críticas.
- El LLM SmolLM2-135M es un modelo pequeño; puede producir alucinaciones o respuestas imprecisas si el contexto recuperado es ambiguo. El post-procesador anti-parroting mitiga parcialmente este riesgo, pero no lo elimina.
- La clasificación de riesgo con umbrales fijos (0-15 %, 16-40 %, 41 %+) puede no adaptarse a todas las flotas; se recomienda recalibrar los umbrales con datos locales.
- La licencia MIT permite uso comercial sin restricciones, pero los datasets subyacentes (AI4I, CMAPSS, Azure PdM) tienen sus propias condiciones de uso que deben verificarse.
- No se proporcionan métricas de latencia o throughput del sistema completo; el rendimiento en producción dependerá del hardware y del volumen de telemetría.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que no ha sido ampliamente probado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SyedaArisha/predictive-maintenance-rag-system
- Artículo relacionado sobre sistemas de mantenimiento predictivo con RAG: https://www.ai.codersarts.com/post/predictive-maintenance-systems-using-rag-equipment-failure-prediction-and-optimization
- Paper PARAM (Prescriptive Agents based on RAG for Automated Maintenance): https://arxiv.org/abs/2508.04714v2
- Proyecto similar en GitHub (RAG-Predictive-Maintenance): https://github.com/ZidanSenpai/RAG-Predictive-Maintenance
- Proyecto similar en GitHub (RAG_Predictive_Maintenance): https://github.com/dhruvvaidya67/RAG_Predictive_Maintenance
