# yagmurtuncer/istanbul-transit-demand-gbm

## Resumen

`yagmurtuncer/istanbul-transit-demand-gbm` es un modelo de regresion tabular publicado en Hugging Face por el usuario yagmurtuncer. No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de un estimador de gradient boosting entrenado con scikit-learn para predecir la demanda horaria de transporte publico en Estambul. El pipeline declarado es `tabular-regression` y el artefacto se distribuye en formato `skops`, lo que permite serializar y cargar el modelo de forma segura sin recurrir a `pickle`.

El modelo se apoya en el dataset `yagmurtuncer/istanbul-public-transport-hourly-2024`, una serie temporal horaria con datos de transporte publico de la ciudad durante 2024. Su proposito es servir como componente de forecasting para planificacion de capacidad, analisis de movilidad urbana y sistemas de informacion al viajero. La relevancia es acotada: es un modelo de nicho, sin descargas ni interacciones en el momento de la consulta, y con acceso restringido (gated), por lo que requiere aceptar condiciones en Hugging Face antes de descargarlo.

La informacion publica disponible es muy limitada: no se detallan hiperparametros, tamaño del conjunto de entrenamiento, metricas ni composicion exacta de las variables. Esta ficha refleja unicamente lo que puede verificarse a partir de los metadatos del repositorio y marca explicitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre datos tabulares (libreria scikit-learn); variante concreta no disponible |
| Parametros totales | no disponible (modelo de arboles, no aplica recuento de parametros neuronales) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (modelo tabular; ventana temporal definida por las features de entrada) |
| Tipos de cuantizacion | no disponible (no aplica cuantizacion de pesos neuronales) |
| Idiomas soportados | no disponible (modelo numerico, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | skops (serializacion segura de scikit-learn) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de gradient boosting para regresion tabular, implementado con scikit-learn y serializado con skops. La etiqueta `time-series-forecasting` sugiere que las features de entrada incluyen componentes temporales (hora del dia, dia de la semana, estacionalidad) construidas a partir de la serie horaria de 2024. No se ha publicado informacion sobre el algoritmo exacto (por ejemplo, `HistGradientBoostingRegressor` frente a `GradientBoostingRegressor`), el numero de estimadores, la profundidad, la tasa de aprendizaje ni la estrategia de validacion temporal.

Tampoco se detalla el volumen de tokens o de filas de entrenamiento, la particion train/validation/test ni si se aplico busqueda de hiperparametros. El dataset de origen es `yagmurtuncer/istanbul-public-transport-hourly-2024`, de resolucion horaria, pero se desconoce el numero de registros, las estaciones o lineas cubiertas y las variables predictoras exactas. No consta el uso de tecnicas de regularizacion especificas ni de validacion cruzada con ventanas temporales.

## Capacidades

- Regresion tabular: predice un valor continuo de demanda de transporte publico a partir de features numericas y temporales.
- Forecasting de series temporales horarias: orientado a la prevision de demanda por franjas horarias.
- Integracion con scikit-learn: compatible con pipelines, `Pipeline`, `ColumnTransformer` y utilidades de validacion del ecosistema sklearn.
- Carga segura mediante skops, que evita la ejecucion de codigo arbitrario asociada a `pickle`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues: opera sobre datos numericos, no sobre lenguaje natural.
- No incluye modo de razonamiento (thinking), audio ni ninguna modalidad adicional.

## Casos de uso

- Planificacion de capacidad de flota: el modelo estima la demanda horaria esperada y permite dimensionar el numero de autobuses o trenes por linea y franja, reduciendo esperas en horas punta.
- Cuadro de mando de movilidad urbana: se integra en un backend Python que consulta predicciones por hora y las expone en dashboards para gestores de transporte.
- Ajuste de frecuencias en tiempo casi real: alimentado con features temporales actualizadas, sirve para recalcular frecuencias recomendadas cada hora.
- Analisis de estacionalidad: al comparar predicciones con observaciones reales, permite detectar patrones semanales y festivos en la red de transporte.
- Simulacion de escenarios: variando las features de entrada (por ejemplo, dia de la semana o franja horaria) se pueden explorar demandas hipoteticas para estudios de capacidad.
- Investigacion academica en movilidad: como baseline reproducible con licencia MIT para comparar tecnicas de forecasting de demanda de transporte publico.
- Sistemas de informacion al viajero: predicciones de ocupacion que alimentan avisos de "alta demanda" en aplicaciones ciudadanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU. El consumo de memoria depende del numero de arboles y de la profundidad, no publicados.
- GPU recomendadas: no aplica; no se requiere aceleracion por GPU para inferencia de gradient boosting tabular.
- GPU de consumo: irrelevante; cualquier CPU moderna es suficiente.
- Despliegue: carga directa con `skops.load()` en Python, servido mediante FastAPI, Flask o un job batch; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; en modelos de gradient boosting tabulares la inferencia por fila suele ser de orden microsegundos a milisegundos, pero no se ha publicado una medicion concreta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yagmurtuncer/istanbul-transit-demand-gbm | Gradient boosting tabular | no disponible | no disponible | MIT | Gated en Hugging Face |
| XGBoost (referencia generica) | Gradient boosting | configurable | no aplica | Apache 2.0 | Publico |
| LightGBM (referencia generica) | Gradient boosting | configurable | no aplica | MIT | Publico |
| CatBoost (referencia generica) | Gradient boosting | configurable | no aplica | Apache 2.0 | Publico |

No se dispone de modelos especificos comparables de demanda de transporte publico de Estambul con los que contrastar metricas; la comparativa anterior es de frameworks, no de modelos entrenados equivalentes.

## Limitaciones y advertencias

- Sesgos: al entrenarse con datos de 2024 de Estambul, el modelo puede reflejar patrones estacionales o anomalias puntuales de ese año (obras, eventos, cambios de servicio) que no se generalizan a otros periodos.
- Alucinacion: no aplica en sentido generativo, pero existe riesgo de extrapolacion erronea si las features de entrada caen fuera del rango visto en entrenamiento.
- Ambito geografico y temporal: las predicciones estan acotadas a la red de transporte de Estambul y al periodo cubierto por el dataset; no son transferibles a otras ciudades sin reentrenamiento.
- Idioma: no procesa texto; no admite entradas en lenguaje natural.
- Licencia: MIT permite uso comercial y modificacion, pero el acceso al repositorio es restringido (gated), lo que exige aceptar condiciones en Hugging Face antes de la descarga.
- Falta de documentacion: sin hiperparametros, metricas ni ficha de datos publicados, la validacion en produccion corre por cuenta del integrador.
- Sin garantias de mantenimiento: cero descargas y cero interacciones en el momento de la consulta indican un proyecto sin comunidad ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yagmurtuncer/istanbul-transit-demand-gbm
- Dataset de origen: https://huggingface.co/datasets/yagmurtuncer/istanbul-public-transport-hourly-2024
- Documentacion de skops: https://skops.readthedocs.io/
- Documentacion de scikit-learn: https://scikit-learn.org/stable/
