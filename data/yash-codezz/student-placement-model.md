# Yash-Codezz/Student.Placement.Model

## Resumen

PayPredictor es un modelo de regresion tabular publicado en Hugging Face por el usuario Yash-Codezz bajo el identificador `Yash-Codezz/Student.Placement.Model`. Su objetivo es predecir el paquete salarial (en LPA, lakhs per annum) de estudiantes en procesos de colocacion laboral a partir de variables academicas y relacionadas con el proceso de seleccion. No se trata de un modelo de lenguaje ni de una red neuronal: es un pipeline clasico de scikit-learn serializado con Joblib.

Tecnicamente implementa un `StackingRegressor` con tres estimadores base (Ridge, KNN y Random Forest) y un meta-modelo de regresion lineal, precedido de un preprocesamiento con codificacion ordinal y one-hot seguido de `StandardScaler`. El autor reporta un R² de 78,23 % y un MAPE de 5,75 % sobre una particion 80/20 con validacion cruzada de 10 folds.

Es relevante unicamente como ejemplo didactico de stacking regression aplicado a un dominio muy concreto (empleabilidad de estudiantes). Su scope es limitado: no es un modelo generativo, no procesa texto libre y su utilidad fuera del dataset de entrenamiento original es discutible. El repositorio ocupa 1,6 GB, lo que sugiere que el artefacto serializado incluye los estimadores completos con sus estructuras internas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stacking regression (Ridge + KNN + Random Forest -> Linear Regression) |
| Parametros totales | no disponible (modelo no neuronal; numero de arboles y vecinos no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (artefacto Joblib, no cuantizable) |
| Idiomas soportados | no disponible (campo `language: pyt` en la model card, sin significado funcional claro) |
| Licencia | MIT |
| Formato de pesos | Joblib (`.pkl`) |
| Libreria | scikit-learn |
| Pipeline | tabular-regression |
| Tamano del repositorio | 1,6 GB |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo es un `StackingRegressor` de scikit-learn. La etapa de preprocesamiento combina `OrdinalEncoder` y `OneHotEncoder` para variables categoricas, seguida de `StandardScaler` para normalizar las numericas. Sobre esa salida se entrenan tres estimadores base en paralelo: regresion Ridge (lineal regularizada L2), KNN (basado en vecinos mas cercanos) y Random Forest (ensemble de arboles de decision). Las predicciones out-of-fold de estos tres modelos alimentan un meta-modelo de regresion lineal que produce la prediccion final de salario en LPA.

No se especifican en la model card el numero de estimadores del Random Forest, el valor de `k` en KNN, el alpha de Ridge ni el tamano o la composicion del dataset de entrenamiento. Tampoco se documenta si hubo ajuste de hiperparametros, validacion anidada ni tratamiento de outliers. La evaluacion reportada se basa en una particion 80/20 con validacion cruzada de 10 folds, con R² = 78,23 % y MAPE = 5,75 %. Todo el pipeline (preprocesamiento + stacking) se serializa junto en un unico artefacto Joblib (`PayPredictor.pkl`).

## Capacidades

- Prediccion de salario (LPA) a partir de features tabulares academicas y de colocacion.
- Preprocesamiento integrado de variables categoricas y numericas (ordinal, one-hot, escalado).
- Inferencia batch mediante `model.predict()` sobre un DataFrame con el esquema esperado.
- Serializacion completa del pipeline, lo que permite cargarlo con `joblib.load()` sin reconstruir transformaciones.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No procesa texto libre, imagenes, audio ni secuencias.
- No dispone de modo thinking ni capacidades generativas.
- Multilingue: no aplica; el campo `language: pyt` de la model card no describe una capacidad funcional.

## Casos de uso

- Prototipado academico de modelos de prediccion salarial: sirve como referencia para comparar un baseline lineal contra un stacking con tres estimadores heterogeneos en un problema de regresion tabular.
- Docencia de stacking regression: el repositorio ilustra el flujo completo (preprocesamiento, entrenamiento de bases, meta-modelo y serializacion) en un unico artefacto cargable con Joblib.
- Simulacion de escenarios de colocacion en un portal universitario: dado un perfil academico con el mismo esquema de features del dataset original, el modelo devuelve una estimacion de LPA que puede mostrarse al estudiante como orientacion.
- Analisis de sensibilidad de variables: al ser un pipeline de scikit-learn, permite inspeccionar la importancia de features del Random Forest y los coeficientes de Ridge para entender que factores academicos pesan mas en la prediccion.
- Integracion en un backend Python de una bolsa de empleo o un CRM de orientacion laboral, siempre que se respete el esquema exacto de columnas usado en el entrenamiento.
- Benchmark interno de tecnicas de ensemble: util como punto de comparacion frente a un `GradientBoostingRegressor` o un `HistGradientBoostingRegressor` sobre el mismo dataset.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| R² (80/20 + 10-fold CV) | 78,23 % |
| MAPE | 5,75 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: suficiente para el pipeline completo; scikit-learn no requiere GPU.
- VRAM: no aplica (modelo no neuronal).
- GPU recomendadas: ninguna; no hay soporte CUDA en el pipeline.
- Cabe en cualquier consumer: si, siempre que haya RAM suficiente para cargar el `.pkl` (el repositorio pesa 1,6 GB, por lo que se recomienda al menos 4 GB de RAM libre).
- Opciones de despliegue: script Python con `joblib.load()`, API REST con FastAPI o Flask, o integracion en un job batch. No compatible con vLLM, TGI, llama.cpp ni Ollama, que estan orientados a modelos neuronales.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del tamano del Random Forest y del numero de filas a predecir.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PayPredictor (este) | Stacking (Ridge + KNN + RF -> LR) | no disponible | no aplica | MIT | Hugging Face |
| Baseline `LinearRegression` de scikit-learn | Regresion lineal | no aplica | no aplica | BSD-3 | scikit-learn |
| `GradientBoostingRegressor` de scikit-learn | Boosting de arboles | no aplica | no aplica | BSD-3 | scikit-learn |
| `HistGradientBoostingRegressor` de scikit-learn | Boosting histogramado | no aplica | no aplica | BSD-3 | scikit-learn |

La comparacion se limita a alternativas genericas de scikit-learn porque no se han identificado en la informacion disponible modelos publicos de prediccion salarial estudiantil comparables.

## Limitaciones y advertencias

- Sesgos potenciales: el modelo se entrena sobre un dataset no documentado; puede reproducir sesgos de genero, casta, region o institucion presentes en los datos originales.
- Riesgo de alucinacion: no aplica en sentido estricto, pero si de extrapolacion incorrecta fuera del rango de features visto en entrenamiento.
- Limitacion de contexto: no aplica; la entrada es tabular y el modelo no maneja secuencias.
- Limitacion de idioma: no aplica; no procesa texto.
- Restricciones de licencia: MIT permite uso comercial y modificacion, pero el autor no ofrece garantias ni documenta la procedencia del dataset, lo que puede comprometer la trazabilidad legal en produccion.
- Caveat de produccion: el artefacto pesa 1,6 GB y no se documenta el esquema exacto de columnas de entrada; sin ese esquema, `model.predict()` fallara o producira resultados invalidos.
- Ausencia de versionado del modelo, de ficha de datos y de tests de robustez.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validacion externa.
- El campo `language: pyt` en la model card es inconsistente con un modelo tabular y no debe interpretarse como soporte multilingue.

## Enlaces

- Hugging Face: https://huggingface.co/Yash-Codezz/Student.Placement.Model
- Repositorio del autor en Hugging Face: https://huggingface.co/Yash-Codezz
- Documentacion de scikit-learn sobre `StackingRegressor`: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.StackingRegressor.html
- Documentacion de Joblib: https://joblib.readthedocs.io/
- No se han encontrado papers, blogs, repos adicionales ni demos en la informacion disponible.
