# ThakiCloud/Thaki-EnergyLoad-Forecaster-v0.1

## Resumen

Thaki-EnergyLoad-Forecaster-v0.1 es un conjunto de tres modelos LightGBM disenados para predecir la carga electrica (en kW) de un contador individual a horizontes de 15 minutos, 1 hora y 24 horas, utilizando unicamente el historial reciente de la propia serie. Lo desarrolla ThakiCloud y se publica como linea base de investigacion para pronostico de carga a corto plazo (short-term load forecasting). No es una red neuronal ni un transformer: son modelos de arboles potenciados por gradiente (gradient boosting) sobre caracteristicas tabulares derivadas de la serie temporal.

El modelo se entrena y evalua sobre el dataset publico UCI *ElectricityLoadDiagrams20112014*, que contiene 370 clientes portugueses entre 2011 y 2014 con resolucion de 15 minutos. En la segunda mitad de 2014 (periodo de test), los tres modelos superan a la mejor linea base simple en los tres horizontes, con intervalos de confianza al 95% de la diferencia de MASE enteramente por debajo de cero. La relevancia actual reside en que ofrece una linea base reproducible y ligera (tres ficheros de texto, sin necesidad de GPU) para tareas de pronostico energetico, un nicho donde predominan los enfoques deep learning pero donde el boosting sobre caracteristicas bien disenadas sigue siendo competitivo.

La licencia es Apache 2.0, los idiomas declarados son ingles y coreano, y el repositorio ocupa 0.0 GB (ficheros de modelo de texto de LightGBM). El pipeline declarado en HuggingFace es `time-series-forecasting`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre arboles de decision (LightGBM), tres modelos directos independientes (uno por horizonte) |
| Parametros totales | no disponible (no se reporta numero de arboles, hojas ni tamano en parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; requiere al menos 1.344 filas (14 dias) de historial a 15 minutos hasta t |
| Tipos de cuantizacion | no disponible (modelos LightGBM en formato de texto; no se documentan variantes cuantizadas) |
| Idiomas soportados | en, ko (declarados; el modelo opera sobre series numericas, no sobre texto) |
| Licencia | apache-2.0 |
| Formato de pesos | ficheros de texto LightGBM (`model_h15m.txt`, `model_h1h.txt`, `model_h24h.txt`) mas `feature_schema.json` |
| Horizontes | t+1 paso (15 min), t+4 pasos (1 h), t+96 pasos (24 h) |
| Resolucion de entrada | 15 minutos, potencia media en kW por intervalo |
| Features | lag0, lag1, lag2, lag3, lag4, lag8, lag12, lag24, lag48, lag95, sd1, sd2, sw1, sw2, mean4, mean96, std96, max96, log_week_mean, tod, dow, month, doy |
| Normalizacion | entradas y objetivo divididos por la media movil de 7 dias en t; la salida se multiplica por esa media |
| Dependencias | lightgbm, numpy, pandas (scikit-learn no es necesario) |

## Arquitectura y entrenamiento

La arquitectura es gradient boosting con LightGBM, no un transformer ni un modelo secuencial profundo. Se entrenan tres modelos directos, uno por horizonte, de modo que cada uno predice directamente el valor objetivo en t+1, t+4 y t+96 pasos sin encadenar predicciones intermedias. Las caracteristicas combinan lags de la propia serie (desde lag0 hasta lag95, incluyendo lags de 1, 2, 3, 4, 8, 12, 24, 48 y 95 pasos), estadisticos de ventana (media de 4 y 96 pasos, desviacion tipica de 96, maximo de 96, media logaritmica semanal), diferencias estacionales (sd1, sd2, sw1, sw2) y variables de calendario del instante objetivo (hora del dia, dia de la semana, mes, dia del ano). Todas las entradas usan valores en t o anteriores; las variables de calendario describen el momento objetivo.

El entrenamiento usa el dataset UCI *ElectricityLoadDiagrams20112014* con particion por tiempo objetivo: entrenamiento antes de 2014-01-01, validacion entre 2014-01-01 y 2014-06-30 (solo para early stopping y eleccion de linea base), y test entre 2014-07-01 y 2014-12-31. El modelo final se reentrena sobre entrenamiento mas validacion. Se evaluaron 332 de las 370 series; 38 se excluyeron por reglas fijadas antes del entrenamiento (menos de 365 dias activos antes de 2014, ausencia de valores no nulos despues de 2014-07-01, y escala MASE cero). La identidad del contador no es una caracteristica: los mismos tres modelos sirven para cualquier contador. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, al no ser un modelo generativo de texto.

## Capacidades

- Pronostico de carga electrica a 15 minutos, 1 hora y 24 horas para un contador individual a partir de su historial reciente.
- Entrada tabular con potencia media en kW por intervalo de 15 minutos, una columna por contador.
- Manejo explicito de datos faltantes: si hay un hueco en la ventana movil de 7 dias o falta un lag, la prediccion devuelve NaN.
- Tratamiento de ceros iniciales como "no conectado" (valores faltantes) antes del primer valor no nulo de un contador.
- Normalizacion automatica por la media movil de 7 dias, lo que permite aplicar los mismos modelos a contadores de distinta escala.
- Soporte de multiples contadores en una misma llamada (una columna por contador).
- Interfaz de linea de comandos (`predict.py`) y API Python (`energy_forecaster.Forecaster`).
- Capacidad de leer el fichero original de UCI (zip o txt extraido) o un CSV generico con rejilla de 15 minutos sin huecos.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un modelo de pronostico numerico.

## Casos de uso

- Pronostico de carga en edificios y campus: dados los contadores de un edificio con historial a 15 minutos, el modelo produce predicciones a 1 hora y 24 horas utiles para programar la climatizacion y reducir picos de demanda.
- Gestion de demanda en data centers: con la serie de potencia de un rack o sala, se puede anticipar la carga a 15 minutos y 1 hora para activar refrigeracion o desplazar cargas no criticas.
- Linea base para investigacion en load forecasting: al ser tres modelos ligeros y reproducibles sobre un dataset publico, sirve como referencia contra la que comparar modelos deep learning (LSTM, Transformer, N-BEATS) en el mismo split.
- Deteccion de anomalias en consumo: comparar la prediccion a 15 minutos con la lectura real permite marcar desviaciones significativas como posibles fallos de contador o consumos atipicos.
- Planificacion de compra de energia en agregadores: agregando las predicciones a 24 horas de multiples contadores se puede estimar la demanda del dia siguiente y ajustar contratos o participacion en mercados intradiarios.
- Prototipado rapido sin GPU: al ejecutarse con LightGBM sobre CPU y requerir solo lightgbm, numpy y pandas, permite desplegar un servicio de pronostico en entornos con recursos limitados.
- Integracion en pipelines de monitorizacion energetica: la API Python permite llamar `forecast_latest(df)` con un DataFrame indexado por fecha cada 15 minutos y volcar la prediccion a un sistema de gestion energetica.

## Benchmarks y rendimiento

Resultados en test (segunda mitad de 2014), sobre 332 series evaluadas:

| Horizonte | MASE modelo | MASE linea base | Delta MASE IC 95% | Series donde el modelo empeora | MAE kW (modelo / base) | F1 de pico (modelo / base) |
|---|---|---|---|---|---|---|
| 15 min | 0.517 | persistencia 0.675 | [-0.176, -0.143] | 19 / 332 | 29.0 / 37.9 | 0.788 / 0.785 |
| 1 h | 0.628 | naive estacional 1 dia 1.003 | [-0.395, -0.356] | 0 / 332 | 36.0 / 57.5 | 0.716 / 0.612 |
| 24 h | 0.784 | persistencia 1.003 | [-0.236, -0.202] | 6 / 332 | 46.6 / 57.5 | 0.634 / 0.613 |

Todas las lineas base en test (MASE):

| Horizonte | Modelo | Persistencia | Naive 1 dia | Naive 1 semana | Media 1 dia |
|---|---|---|---|---|---|
| 15 min | 0.517 | 0.675 | 1.008 | 1.075 | 2.826 |
| 1 h | 0.628 | 1.136 | 1.003 | 1.074 | 2.872 |
| 24 h | 0.784 | 1.003 | 1.003 | 1.073 | 2.965 |

La regla de publicacion preinscrita exigia que el limite superior del IC de Delta MASE estuviera por debajo de 0 en los tres horizontes y que el F1 de pico no fuera peor que la linea base a 1 h y 24 h; ambas condiciones se cumplieron. En 15 minutos la diferencia de F1 de pico es +0.003 y el autor no la interpreta como mejora.

## Requisitos de hardware

- VRAM: no aplica; LightGBM sobre CPU no requiere GPU. El modelo se ejecuta en memoria del sistema.
- GPU recomendadas: ninguna imprescindible. Cualquier CPU moderna es suficiente para inferencia sobre decenas o cientos de contadores.
- Cabe en GPU de consumo: si, aunque no es necesario; el cuello de botella es CPU y memoria RAM.
- Memoria RAM: no disponible de forma explicita; el dataset UCI completo con 370 contadores a 15 minutos durante 4 anos ocupa del orden de cientos de MB en memoria, y el modelo en si son tres ficheros de texto LightGBM.
- Opciones de despliegue: script `predict.py` incluido, API Python `energy_forecaster`, o integracion directa con la libreria `lightgbm` cargando los ficheros `.txt`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / historial | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Thaki-EnergyLoad-Forecaster-v0.1 | LightGBM, 3 modelos directos | no disponible | 1.344 filas (14 dias) a 15 min | MASE 0.517 / 0.628 / 0.784 (15 min / 1 h / 24 h) | Apache 2.0 | HuggingFace |
| Linea base persistencia (misma evaluacion) | Regla simple | 0 | 1 valor | MASE 0.675 / 1.136 / 1.003 | no aplica | incluida en la model card |
| Linea base naive estacional 1 dia | Regla simple | 0 | 96 pasos | MASE 1.008 / 1.003 / 1.003 | no aplica | incluida en la model card |
| Modelos deep learning para load forecasting (LSTM, Transformer, N-BEATS) | Redes neuronales | variable | variable | no disponible en la informacion proporcionada | variable | variable |

No se han publicado en la informacion disponible comparaciones directas con otros modelos de terceros sobre el mismo split y las mismas metricas.

## Limitaciones y advertencias

- No es un pronosticador validado para otras redes, paises o data centers: el autor lo describe explicitamente como linea base de investigacion sobre el dataset UCI.
- El conjunto de test es publico y ampliamente utilizado, por lo que no es un test sellado ni independiente.
- La poblacion evaluada (332 de 370 series) depende en parte de datos del periodo de test: una de las reglas de exclusion (ausencia de valores no nulos despues de 2014-07-01) mira observaciones de test, aunque ningun input ni paso de entrenamiento las uso.
- No hay ajuste de horario de verano (DST): las marcas de tiempo deben alimentarse exactamente como en el fichero UCI.
- Requiere una rejilla de 15 minutos sin huecos; cualquier hueco en la ventana movil de 7 dias o un lag faltante produce NaN en la prediccion.
- Los ceros iniciales se tratan como valores faltantes hasta el primer valor no nulo de cada contador.
- La identidad del contador no es una caracteristica: el modelo no distingue entre tipos de cliente ni sectores.
- Riesgo de alucinacion no aplica (no es generativo), pero si hay riesgo de extrapolacion incorrecta fuera de la distribucion del dataset de entrenamiento (clientes portugueses 2011-2014).
- Sesgos conocidos: no documentados de forma explicita; la cobertura geografica y temporal limitada implica posible sesgo hacia patrones de consumo portugueses de ese periodo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no garantiza idoneidad para produccion en redes reales.
- El modelo solo maneja series numericas; no procesa texto ni otros idiomas, aunque la model card declare en y ko.

## Enlaces

- HuggingFace: https://huggingface.co/ThakiCloud/Thaki-EnergyLoad-Forecaster-v0.1
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-EnergyLoad-Forecaster-v0.1/blob/main/MODEL_CARD.ko.md
- Dataset UCI ElectricityLoadDiagrams20112014: https://archive.ics.uci.edu/dataset/321/electricityloaddiagrams20112014
- Libreria LightGBM: https://github.com/microsoft/LightGBM
