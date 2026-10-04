# TicassloThang/nyc-traffic-congestion-rf

## Resumen

`TicassloThang/nyc-traffic-congestion-rf` no es un modelo de lenguaje ni una red neuronal: es un `PipelineModel` de Spark MLlib que encapsula un clasificador Random Forest entrenado para predecir el nivel de congestión de un tramo viario de la ciudad de Nueva York 15 minutos en el futuro. Lo publica el usuario TicassloThang como artefacto del proyecto de curso `nyc-traffic-lakehouse` (Big Data Processing, HCM-UTE, equipo de 3 personas), y se apoya en el feed de velocidades de la NYC DOT (dataset `i4gi-tjb9`) y en las fronteras de nivel de servicio del Highway Capacity Manual 2010.

El problema que resuelve es una clasificación tabular de tres clases (flujo libre, congestión moderada y congestión severa) a partir de 19 variables por fila: identificador de tramo, distrito, variables de calendario, ratio de velocidad actual, congestión actual, cuatro retardos de congestión y cuatro de ratio de velocidad (15, 30, 45 y 60 minutos) y dos variables de tendencia. La etiqueta es la clase del mismo tramo 15 minutos después, lo que convierte el modelo en un predictor de corto plazo pensado para ejecutarse cada 5 minutos sobre datos en vivo.

Su relevancia es doble. Por un lado, documenta con detalle un caso real de MLOps sobre lakehouse (Spark 4.0.0, Databricks Serverless, 7.663.509 filas de entrenamiento, validación y test separados por tiempo). Por otro, es un ejemplo inusualmente honesto: la propia model card reconoce un bug de zona horaria en los datos de entrenamiento, la ausencia de una línea base y el hecho de que los hiperparámetros se fijaron sin ajuste. El repositorio ocupa 0,0 GB y acumula 1 like y 0 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (Spark MLlib `RandomForestClassificationModel`) dentro de un `PipelineModel` con 2 `StringIndexer` y un `VectorAssembler` |
| Parametros totales | no disponible (80 arboles, profundidad maxima 12; no se publica el recuento de nodos ni el tamano del fichero del modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; la "ventana" de informacion son 4 retardos de 15, 30, 45 y 60 minutos) |
| Tipos de cuantizacion | no aplica (no es una red neuronal; el artefacto se serializa en formato nativo de Spark MLlib) |
| Idiomas soportados | no aplica (no procesa texto libre; es un clasificador tabular) |
| Licencia | MIT |
| Formato de pesos | directorio `model/random_forest_model/` con el `PipelineModel` serializado de Spark; artefactos auxiliares en Parquet (`free_flow_speed_lookup.parquet`, `link_coordinates.parquet`) y JSON (`active_link_ids.json`) |
| Tarea (`pipeline_tag`) | `tabular-classification` |
| Numero de clases | 3 (0 = flujo libre, 1 = congestion moderada, 2 = congestion severa) |
| Numero de caracteristicas | 19 |
| Tamano del repositorio | 0,0 GB |
| Cobertura de tramos | 116 tramos con velocidad de flujo libre en el lookup; 125 `link_id` activos en el feed en vivo |
| Entorno de ejecucion | PySpark 4.0.x, Java 17 o 21, modelo guardado con Spark 4.0.0 |

## Arquitectura y entrenamiento

El pipeline es deliberadamente sencillo y encadena cuatro etapas de Spark MLlib. Dos `StringIndexer` codifican `link_id` y `borough` (los valores desconocidos se conservan como un indice adicional, de modo que un tramo no visto no provoca un fallo, pero tampoco dispone de velocidad de flujo libre). Un `VectorAssembler` une las 19 caracteristicas y el `RandomForestClassificationModel` produce las columnas `prediction` y `probability`. La etiqueta se construye a partir del ratio de velocidad, definido como la velocidad actual dividida por la velocidad de flujo libre del tramo (percentil 85 de su velocidad en el periodo de entrenamiento), con los cortes del HCM 2010: clase 0 si el ratio es 0,67 o superior, clase 1 entre 0,40 y 0,67, y clase 2 por debajo de 0,40.

Los datos proceden de NYC Open Data (DOT Traffic Speeds NBE, `i4gi-tjb9`), de enero de 2024 a junio de 2026, sobre 116 tramos. Se uso una muestra estratificada del 35 % de la tabla de caracteristicas: 7.663.509 filas. La particion es temporal, no aleatoria: entrenamiento de 01/2024 a 09/2025 (5.528.651 filas), validacion de 10/2025 a 12/2025 (796.008) y test de 01/2026 a 06/2026 (1.337.237). La configuracion del bosque es de 80 arboles, profundidad maxima 12, minimo de 5 filas por nodo, 132 bins maximos, subconjunto de caracteristicas por raiz cuadrada, submuestreo 0,8 y semilla 42. Para compensar el desbalanceo de clases se aplicaron pesos inversos a la frecuencia mediante `weightCol`. El ajuste se hizo en Databricks Serverless en unos 53 minutos y los hiperparametros se fijaron, no se ajustaron. No se menciona ningun uso de RLHF, DPO ni tecnicas de refinamiento posteriores.

## Capacidades

- Clasificacion tabular multiclase de congestion viaria en tres niveles (flujo libre, moderada, severa) a partir de 19 caracteristicas numericas y categoricas.
- Prediccion a horizonte fijo de 15 minutos, con una cadencia de ejecucion prevista de 5 minutos sobre el feed en vivo de la NYC DOT.
- Manejo de retardos temporales: incorpora el estado del tramo a 15, 30, 45 y 60 minutos atras, tanto en congestion como en ratio de velocidad.
- Variables de tendencia: calcula la diferencia de congestion y de ratio de velocidad respecto a 15 minutos antes.
- Contexto temporal y de calendario: hora, dia de la semana (convencion Spark, 1 = domingo), mes, indicador de fin de semana y festivos de Estados Unidos para Nueva York.
- Salida probabilistica: ademas de la clase predicha, devuelve la columna `probability`, lo que permite umbralizar o priorizar casos de baja confianza.
- Tolerancia a valores desconocidos en `link_id` y `borough` gracias al tratamiento de indices no vistos en los `StringIndexer`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, capacidades de agente ni soporte multilingue. Cualquier afirmacion en ese sentido seria incorrecta: es un clasificador estadistico sobre datos tabulares.

## Casos de uso

- Prediccion de congestion en produccion sobre el feed en vivo: el proyecto de referencia ejecuta el modelo cada 5 minutos contra el feed de velocidades de la NYC DOT, calculando el ratio de velocidad con `free_flow_speed_lookup.parquet` y saltando los tramos en los que falte alguno de los retardos.
- Cuadro de mando geoespacial: combinando `link_coordinates.parquet` con la clase predicha se puede pintar un mapa de calor de la ciudad que anticipe en 15 minutos que tramos pasaran a congestion severa, util para operadores de trafico y planificadores urbanos.
- Logistica y planificacion de rutas de reparto: una flota puede consultar la probabilidad de congestion severa por tramo antes de asignar rutas, penalizando los segmentos con clase 2 prevista y reduciendo tiempos de trayecto en horas punta.
- Priorizacion de vehiculos de emergencia: el mismo planteamiento que usan proyectos similares sobre datos abiertos de Nueva York, alimentando un sistema de ajuste de ruta en tiempo real para ambulancias y bomberos.
- Senalizacion dinamica e informacion a conductores: paneles de mensaje variable y apps de navegacion pueden avisar de congestion inminente con un cuarto de hora de antelacion, usando la probabilidad de la clase 2 como medida de confianza.
- Capa Gold de un lakehouse de movilidad: el modelo sirve como componente de un pipeline Bronze-Silver-Gold, generando predicciones particionadas por fecha que alimentan informes historicos sobre recurrencia de atascos.
- Estudio de calidad del aire y emisiones: la clase de congestion prevista es un proxy util de ralenti y arranques, aprovechable en modelos de emisiones o de exposicion en corredores concretos.
- Docencia y benchmarking interno de big data: al ser un pipeline de Spark MLlib reproducible y con particion temporal, sirve como ejercicio de referencia para comparar contra lineas base mas simples y otros algoritmos de clasificacion.

## Benchmarks y rendimiento

| Conjunto | Macro F1 | F1 flujo libre | F1 moderada | F1 severa |
|---|---|---|---|---|
| Validacion (10/2025 - 12/2025) | 0,761 | 0,908 | 0,583 | 0,793 |
| Test (01/2026 - 06/2026) | 0,767 | 0,905 | 0,592 | 0,805 |

En el conjunto de test se clasifican correctamente el 85,6 % de las filas de flujo libre, el 71,7 % de las de congestion moderada y el 82,1 % de las de congestion severa. La clase moderada es la mas dificil, con precision 0,50 y recall 0,72. Las caracteristicas mas importantes son `speed_ratio` (0,31), `current_congestion` (0,20), `past_speed_ratio_15min` (0,13) y `past_congestion_15min` (0,11). No se han publicado resultados frente a MMLU, HumanEval, GSM8K ni ningun otro benchmark de modelos de lenguaje, porque no aplican a este tipo de modelo. Tampoco se midio ninguna linea base.

## Requisitos de hardware

- No requiere GPU. La inferencia es puramente CPU sobre estructuras de arboles evaluadas por Spark.
- Requisitos de software: PySpark 4.0.x, Java 17 o 21, `huggingface_hub` para la descarga. El modelo se guardo con Spark 4.0.0.
- Memoria: no se publica el tamano del fichero serializado; el repositorio completo ocupa 0,0 GB, por lo que el artefacto del bosque (80 arboles, profundidad 12) y los Parquet auxiliares son ligeros y caben sin problema en un portatil convencional.
- Ejecucion local: es viable con `SparkSession.builder.master("local[*]")` para inferencia puntual o por lotes pequenos.
- Despliegue en cluster: el caso de referencia usa Databricks Serverless, donde el ajuste tardo unos 53 minutos. La inferencia puede correr en Spark Structured Streaming o por micro-lotes cada 5 minutos.
- Opciones de despliegue: Spark MLlib (`PipelineModel.load`), Databricks, o cualquier cluster Spark con PySpark 4.0.x. No es compatible con vLLM, llama.cpp, Ollama, TGI ni runtimes de LLM, ya que no es una red neuronal ni un transformer.
- Latencia y throughput: no disponibles. Dependeran del tamano del lote, del numero de tramos evaluados (116 con lookup, 125 identificadores activos) y del cluster empleado.

## Comparativa con modelos similares

No existen modelos comparables publicados con las mismas especificaciones en la informacion disponible. Los proyectos hallados en la busqueda web abordan el mismo dominio con enfoques distintos y sin artefactos comparables directamente:

| Proyecto | Enfoque | Parametros / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `TicassloThang/nyc-traffic-congestion-rf` | Random Forest de Spark MLlib, clasificacion en 3 clases a 15 minutos | 80 arboles, profundidad 12, 19 caracteristicas | MIT | HuggingFace + GitHub |
| `rounak-acharyya/NYC-Traffic-Prediction` | Random Forest Regressor para prediccion de volumen y ajuste de rutas de emergencia | no disponible | no disponible | GitHub |
| `peanutpirate/AI_City_Traffic_Intelligence_System` | Analisis de patrones de trafico por hora y dia e impacto meteorologico | no disponible | no disponible | GitHub |
| Articulo divulgativo sobre prediccion de atascos a anos vista (earth.com, 2026) | Sistema de IA para planificacion urbana a largo plazo | no disponible | no disponible | Articulo |

Las cifras de parametros, contexto y rendimiento de las alternativas no estan publicadas en la informacion disponible, por lo que no se puede establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Bug de zona horaria en los datos de entrenamiento: la API historica devuelve hora local de Nueva York, pero el paso de Bronze a Silver la volvio a convertir como si fuera UTC, de modo que `hour`, `day_of_week`, `is_weekend` e `is_holiday` estan desplazadas entre 4 y 5 horas respecto a la hora real. El pipeline en vivo si pasa la hora local correcta y el modelo no se ha reentrenado con la correccion. La propia model card senala que la importancia de las variables de calendario es muy baja, por lo que el efecto sobre las metricas es pequeno, pero la inconsistencia entre entrenamiento e inferencia existe.
- No se midio ninguna linea base. Predecir que la clase se mantiene igual durante 15 minutos es probablemente una referencia fuerte, dado que `current_congestion` y la etiqueta estan altamente correlacionadas. Las metricas de la tabla deben interpretarse con esa cautela.
- Cobertura limitada: solo conoce los 116 tramos del lookup. Cualquier otro tramo recibe un indice desconocido y no dispone de velocidad de flujo libre.
- Clase moderada debil: F1 de 0,592 y precision de 0,50 en test; aproximadamente la mitad de las predicciones de congestion moderada son falsos positivos.
- Error en los datos de origen: en `link_coordinates.parquet` el tramo 4616223 tiene una longitud incorrecta (-74,841 en lugar de aproximadamente -74,001) por una errata de la fuente. Solo afecta a la representacion en el mapa.
- Hiperparametros no ajustados, fijados de antemano, lo que deja margen de mejora sin explorar.
- Dependencia fuerte de la calidad del feed: si falta alguno de los retardos de 15, 30, 45 o 60 minutos, el proyecto de referencia descarta la fila y no emite prediccion.
- Riesgo de deriva temporal: el modelo se entreno hasta 2026 y no se documenta ningun plan de reentrenamiento; cambios en la red viaria, obras o patrones de movilidad pueden degradar el rendimiento.
- La licencia MIT permite uso comercial y modificacion, pero exige conservar el aviso de copyright y la clausula de exencion de responsabilidad. No hay garantia de exactitud, algo relevante si las predicciones se usan para decisiones operativas.
- No debe presentarse como un modelo de lenguaje ni atribuirle capacidades de generacion, razonamiento o agentes: no las tiene.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TicassloThang/nyc-traffic-congestion-rf
- Codigo del proyecto: https://github.com/Ticasslo/nyc-traffic-lakehouse
- Informe del proyecto (en vietnamita): https://github.com/Ticasslo/nyc-traffic-lakehouse/blob/main/Nhom01_BaoCao_Final.pdf
- Fuente de datos (NYC Open Data, DOT Traffic Speeds NBE): https://data.cityofnewyork.us/d/i4gi-tjb9
- Proyecto similar de prediccion de trafico en Nueva York: https://github.com/rounak-acharyya/NYC-Traffic-Prediction
- Proyecto similar de inteligencia de trafico urbano: https://github.com/peanutpirate/AI_City_Traffic_Intelligence_System
- Analisis de congestion en Nueva York con machine learning: https://lillylog.github.io/Final_IMLV/analysis.html
- Analisis de congestion en Nueva York con machine learning (segunda version): https://lillylog.github.io/imlv-l/analysis.html
- Articulo divulgativo sobre prediccion de atascos a largo plazo: https://www.earth.com/science/ai-could-predict-traffic-jams-years-before-they-happen/
