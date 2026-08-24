# Varma2905/regression-linear

## Resumen

`Varma2905/regression-linear` es un modelo de regresión lineal simple (OLS, mínimos cuadrados ordinarios) desarrollado con scikit-learn por el usuario Varma2905. Resuelve un problema de regresión tabular: predecir el consumo eléctrico de la Zona 1 de la ciudad de Tetuán (Marruecos) a partir de una única variable predictora, la temperatura. Se trata de un modelo clásico de machine learning, no de un modelo de lenguaje o red neuronal profunda.

Su relevancia radica en servir como línea base (baseline) para problemas de previsión de demanda energética: al ser un modelo lineal con un solo feature, permite establecer un punto de referencia simple y rápido frente a modelos más complejos. El repositorio incluye el artefacto en formato joblib, métricas de evaluación detalladas y un ejemplo de uso en Python. El ajuste es pobre (R² de 0,1948), lo que indica que la temperatura por sí sola explica aproximadamente el 19,5 % de la varianza del consumo en esa zona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal simple (scikit-learn `LinearRegression`) |
| Parametros totales | 2 (intercepto + coeficiente de temperatura) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no textual) |
| Tipos de cuantizacion | no aplica (modelo clásico, no requiere cuantización) |
| Idiomas soportados | no aplica (datos tabulares numéricos) |
| Licencia | no disponible |
| Formato de pesos | joblib (`.joblib`) |

## Arquitectura y entrenamiento

El modelo implementa una regresión lineal simple mediante mínimos cuadrados ordinarios (OLS), con una única variable independiente (temperatura) y una variable dependiente continua (consumo de energía de la Zona 1). Los hiperparámetros de entrenamiento son `{"copy_X": true, "fit_intercept": true, "n_jobs": null, "positive": false}`, lo que confirma que se ajusta un intercepto y no se impone positividad en los coeficientes.

El entrenamiento se realizó sobre el dataset público *Tetuan City Power Consumption*, con un split de 41 932 muestras para entrenamiento y 10 484 para test. El tiempo de entrenamiento fue de 0,02 segundos, lo que refleja la simplicidad computacional del modelo. No se aplicaron técnicas como RLHF, DPO ni fine-tuning por refuerzo, ya que no es un modelo generativo. No hay innovaciones arquitectónicas destacables: es una implementación estándar de scikit-learn.

## Capacidades

- Regresión sobre datos tabulares: predice un valor continuo (consumo eléctrico en kW) a partir de un feature numérico (temperatura).
- Inferencia extremadamente rápida: al ser un modelo lineal con dos parámetros, la predicción es prácticamente instantánea en cualquier hardware.
- Interpretabilidad total: los coeficientes del modelo son directamente inspeccionables, lo que permite entender la relación lineal entre temperatura y consumo.
- No soporta generación de texto, código, visión, tool calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente de regresión tabular.

## Casos de uso

- Previsión de demanda energética como baseline: el modelo puede predecir el consumo de la Zona 1 de Tetuán a partir de la temperatura, sirviendo como referencia para comparar modelos más sofisticados (gradient boosting, redes neuronales) en el mismo dataset.
- Educación y formación en machine learning: es un ejemplo didáctico ideal para explicar regresión lineal, métricas de evaluación (MAE, RMSE, R²) y el flujo completo de entrenamiento y despliegue con scikit-learn.
- Validación de pipelines de MLOps: al ser un artefacto ligero en joblib, permite probar pipelines de serialización, carga y predicción en entornos de producción o CI/CD sin coste computacional.
- Análisis exploratorio de correlación: el coeficiente de Pearson (0,4416) y el de Spearman (0,4357) permiten cuantificar la relación monotónica entre temperatura y consumo, útil en informes preliminares de datos.
- Demostración de limitaciones de modelos lineales: sirve para ilustrar cuándo una relación lineal simple es insuficiente (R² bajo) y motiva la necesidad de features adicionales o modelos no lineales.
- Integración en dashboards de monitorización energética: puede desplegarse como endpoint REST mínimo (por ejemplo, con Flask o FastAPI) para generar predicciones en tiempo real con latencia despreciable.

## Benchmarks y rendimiento

Las métricas de evaluación sobre el conjunto de test (10 484 muestras) son las siguientes:

| Metrica | Valor |
|---|---|
| MAE | 5206,8604 |
| MSE | 40 658 128,9883 |
| RMSE | 6376,3727 |
| MedianAbsoluteError | 4629,6613 |
| MaxError | 17 556,9429 |
| R² | 0,1948 |
| ExplainedVariance | 0,1949 |
| MAPE | 16,7846 % |
| MSLE | 0,0396 |
| RMSLE | 0,1991 |
| AdjustedR² | 0,1947 |
| PearsonCorrelation | 0,4416 |
| SpearmanCorrelation | 0,4357 |

El R² de 0,1948 indica que el modelo explica menos del 20 % de la varianza, un ajuste claramente insuficiente para uso predictivo en producción. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: 0 GB. No requiere GPU en ningún caso.
- CPU: cualquier procesador, incluso de gama baja o embebido, es suficiente. El entrenamiento tardó 0,02 segundos y la inferencia es del orden de microsegundos por muestra.
- RAM: menos de 1 MB para el artefacto serializado (el tamaño del repositorio es 0,0 GB).
- GPU recomendadas: ninguna. No aplica.
- Opciones de despliegue: cualquier servidor Python con scikit-learn y joblib. Puede servirse con Flask, FastAPI, o integrarse en pipelines de Apache Airflow o Prefect. También es compatible con entornos serverless (AWS Lambda, Google Cloud Functions) por su huella mínima.
- Latencia y throughput: no se han publicado mediciones formales, pero al tratarse de una operación lineal con dos parámetros, se puede esperar un throughput de cientos de miles de predicciones por segundo en un CPU moderno.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de regresión sobre el mismo dataset (por ejemplo, regresión polinómica, random forest regressor o gradient boosting) en la información proporcionada. No obstante, el R² de 0,1948 sugiere que cualquier modelo no lineal con más features superaría previsiblemente este resultado. Comparativa formal: no disponible.

## Limitaciones y advertencias

- Ajuste deficiente: el R² de 0,1948 indica que el modelo deja sin explicar aproximadamente el 80 % de la varianza del consumo. No es adecuado para predicciones fiables en producción.
- Generalización limitada: entrenado exclusivamente con datos de 2017 de la ciudad de Tetuán; puede no generalizar a otras regiones, años o estaciones climáticas distintas.
- Un único feature: la temperatura como única variable predictora ignora otros factores relevantes (humedad, velocidad del viento, día de la semana, hora del día, festivos) que probablemente influyen en el consumo eléctrico.
- Supuestos de OLS: la inferencia estadística clásica (intervalos de confianza, p-valores) solo es válida si se cumplen los supuestos de homocedasticidad, independencia de errores y normalidad, que no están verificados en la documentación.
- Licencia no especificada: al no declararse licencia, el uso comercial del artefacto conlleva incertidumbre legal. Se recomienda contactar con el autor antes de utilizarlo en entornos empresariales.
- Sin mantenimiento ni garantías: el repositorio no muestra actividad posterior a la creación (agosto de 2026) y no hay indicios de soporte o actualizaciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Varma2905/regression-linear
- Dataset de referencia (Tetuan City Power Consumption): no disponible en la información proporcionada
- Documentación de scikit-learn sobre regresión lineal: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
