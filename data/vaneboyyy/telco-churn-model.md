# Vaneboyyy/telco-churn-model

## Resumen

`Vaneboyyy/telco-churn-model` es un modelo de clasificación tabular publicado en Hugging Face por el usuario Vaneboyyy. A pesar de su identificador y de la etiqueta `tabular-classification`, la model card describe un clasificador binario orientado a predecir si la acción de Hyundai Motor Company (ticker 005380.KS) subirá al día siguiente. El artefacto se distribuye en formato `joblib` y se ha construido con `scikit-learn`, lo que lo sitúa en la categoría de modelos clásicos de machine learning y no en la de modelos de lenguaje.

El modelo se presenta como un proyecto de la asignatura Business Data Science (MN1135), sin que se detalle el algoritmo concreto empleado (regresión logística, random forest, gradient boosting u otro). El repositorio tiene un tamaño declarado de 0.0 GB, sin descargas ni likes en el momento de la consulta, y se publicó el 25 de noviembre de 2026. La licencia es MIT.

Su relevancia es muy limitada fuera del contexto académico: las métricas reportadas en el conjunto de prueba (F1 de 0.4716, ROC-AUC de 0.534) indican una capacidad discriminativa apenas superior al azar, y la propia model card no documenta validación temporal ni control de fuga de información, aspectos críticos en predicción financiera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (clasificador tabular de `scikit-learn`, algoritmo concreto no especificado) |
| Parametros totales | No aplica (modelo no neuronal); numero de parametros no disponible |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (entrada tabular de 9 caracteristicas) |
| Tipos de cuantizacion | No disponible (artefacto `joblib`, no se documentan conversiones) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `joblib` (serializacion de `scikit-learn`) |

## Arquitectura y entrenamiento

La informacion disponible no especifica el estimador de `scikit-learn` utilizado. El pipeline declarado es `tabular-classification`, y la model card enumera nueve caracteristicas de entrada: `Open`, `High`, `Low`, `Close`, `Volume`, `Daily Return`, `SMA_5`, `SMA_20` y `Vol_5`. La variable objetivo `Target` es binaria (1 si el precio sube al dia siguiente, 0 en caso contrario).

El conjunto de datos procede de un fichero local (`005380.KS (1).csv`) con precios historicos de Hyundai Motor. No se documenta el periodo cubierto, el numero de filas, el criterio de particion train/test, ni si se aplico validacion temporal, normalizacion o seleccion de caracteristicas. Tampoco se indica si hubo ajuste de hiperparametros ni que semilla se empleo. La presencia de medias moviles (`SMA_5`, `SMA_20`) y volatilidad a cinco dias (`Vol_5`) sugiere un enfoque de ingenieria de caracteristicas clasico sobre series temporales financieras, pero sin mas detalle.

## Capacidades

- Clasificacion binaria tabular: predice la direccion del movimiento del precio de un unico activo (Hyundai Motor, 005380.KS) a un dia vista.
- Entrada de nueve caracteristicas numericas derivadas de precios OHLCV y de indicadores tecnicos simples.
- Salida de probabilidad o etiqueta binaria segun el estimador subyacente, sin que se documente el metodo de calibracion.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta agentes ni planificacion.
- No tiene capacidades multilingues, de vision, audio ni generacion de texto.
- No dispone de modo de razonamiento (`thinking mode`) ni de decodificacion especulativa.

## Casos de uso

- Docencia y practicas de machine learning: el artefacto sirve como ejemplo de pipeline tabular completo (carga de CSV, ingenieria de caracteristicas, entrenamiento y evaluacion) en un curso de ciencia de datos.
- Reproduccion de experimentos academicos: permite replicar el flujo descrito en la model card para comparar con otros clasificadores sobre el mismo CSV.
- Baseline de referencia para series financieras: puede usarse como punto de partida minimo (ROC-AUC 0.534) frente al que medir modelos mas sofisticados, siempre con validacion temporal propia.
- Demostracion de serializacion con `joblib`: util para ilustrar el empaquetado y la carga de modelos de `scikit-learn` en un entorno docente.
- Pruebas de integracion de artefactos tabulares en Hugging Face: sirve para verificar flujos de descarga, carga y ejecucion de modelos no neuronales alojados en el Hub.
- Analisis critico de metricas en finanzas: el contraste entre F1 (0.4716) y ROC-AUC (0.534) permite discutir en clase por que la exactitud direccional es una metrica debil en prediccion de precios.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de prueba (sin detalle del tamano ni del periodo):

| Metrica | Valor |
|---|---|
| F1-score | 0.4716 |
| Recall | 0.4882 |
| Precision | 0.456 |
| ROC-AUC | 0.534 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: suficiente; el artefacto es un modelo tabular de `scikit-learn` serializado con `joblib`.
- VRAM: no requiere GPU (0 GB de VRAM dedicada).
- GPU recomendadas: no aplica.
- Cabe en cualquier GPU de consumo y en entornos sin GPU.
- Despliegue: carga directa con `joblib.load` en Python; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; para un estimador tabular de este tamano se espera latencia de microsegundos a milisegundos por muestra en CPU, aunque no se ha medido ni documentado.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia generica de categoria, se podria contrastar con clasificadores tabulares estandar de `scikit-learn` (regresion logistica, random forest, gradient boosting), pero no se aportan datos de rendimiento de esas alternativas sobre el mismo conjunto.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vaneboyyy/telco-churn-model | No disponible | No aplica | F1 0.4716, ROC-AUC 0.534 | MIT | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Discriminacion practicamente nula: un ROC-AUC de 0.534 esta muy proximo al azar (0.5); el modelo no demuestra capacidad predictiva util.
- Riesgo elevado de sobreajuste y de fuga de informacion: no se documenta validacion temporal, lo que es especialmente grave con series financieras.
- Ambito restringido a un unico activo (Hyundai Motor, 005380.KS) y a un unico horizonte (un dia); no es generalizable a otros valores ni mercados.
- Incoherencia entre el identificador del repositorio (`telco-churn-model`) y el contenido real (prediccion bursatil), lo que puede inducir a error a quien lo consuma.
- Sin documentacion sobre sesgos, calibracion, periodo de entrenamiento ni composicion del dataset.
- No apto para uso en produccion ni para toma de decisiones de inversion; la licencia MIT permite uso comercial, pero ello no implica idoneidad tecnica.
- No procesa texto ni otros idiomas; las etiquetas `stock-prediction` y `tabular-classification` no implican capacidades adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vaneboyyy/telco-churn-model
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
