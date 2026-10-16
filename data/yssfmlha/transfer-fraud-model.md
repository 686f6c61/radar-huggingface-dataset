# yssfmlha/transfer-fraud-model

## Resumen

El modelo `yssfmlha/transfer-fraud-model` es un clasificador binario de fraude en transferencias bancarias publicado en HuggingFace por el usuario yssfmlha. No es un modelo de lenguaje: se trata de un `HistGradientBoostingClassifier` de scikit-learn que recibe 15 variables tabulares calculadas por el usuario y devuelve la probabilidad de fraude, P(fraud), junto con un nivel de riesgo discreto entre 0 y 3.

Su interes practico esta en el enfoque de "feature input": el modelo no consume transacciones en bruto ni texto, sino caracteristicas ya agregadas por el integrador (importe, hora local, historial del ordenante, destino, frecuencia de envios en ventanas de 1 y 24 horas, etc.). Esto lo hace sencillo de encajar en un motor de reglas o en un pipeline antifraude existente, siempre que ese pipeline sepa construir el vector de entrada con exactitud.

El modelo se distribuye bajo licencia MIT, con un repositorio de tamano practicamente nulo (0.0 GB declarados) y formato joblib. Se entreno sobre un conjunto de datos sintetico, segun advierte el propio autor, por lo que la validacion sobre datos reales de produccion es imprescindible antes de cualquier despliegue. Las metricas de test publicadas son altas en el conjunto sintetico (ROC-AUC 0.9924, PR-AUC 0.8382), aunque estas cifras deben interpretarse con cautela porque no existe evidencia de evaluacion con datos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre arboles de decision (scikit-learn `HistGradientBoostingClassifier`, binario) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (no hay pesos en coma flotante aptos para cuantizacion de redes neuronales) |
| Idiomas soportados | no disponible (modelo tabular; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | joblib (serializacion de scikit-learn) |
| Pipeline declarado | tabular-classification |
| Numero de variables de entrada | 15 |
| Salida | P(fraud) y nivel de riesgo 0-3 |
| Umbrales de riesgo | 0.0053, 0.0819, 0.5633 |
| Repositorio | 0.0 GB declarados, 0 descargas, 0 likes |

## Arquitectura y entrenamiento

La arquitectura es un clasificador de gradient boosting con histogramas (`HistGradientBoostingClassifier`), una implementacion de scikit-learn inspirada en LightGBM que discretiza las variables continuas en bins para acelerar la construccion de los arboles y reducir el consumo de memoria. El modelo resuelve una clasificacion binaria: la salida cruda es una probabilidad de fraude entre 0 y 1, que despues se mapea a cuatro niveles de riesgo mediante los cortes [0.0053, 0.0819, 0.5633] especificados en la model card.

La informacion proporcionada no detalla el numero de arboles, la profundidad maxima, la tasa de aprendizaje ni el numero de iteraciones, por lo que no es posible reproducir la configuracion exacta del entrenamiento. Tampoco se indica el volumen de muestras de entrenamiento ni la composicion del dataset, mas alla de que es sintetico. No hay evidencia de tecnicas de ajuste tipo RLHF o DPO, algo que ademas no aplica a un modelo tabular. Las unicas cifras de evaluacion disponibles corresponden al conjunto de test descrito en la model card.

## Capacidades

- Clasificacion binaria de fraude en transferencias con salida de probabilidad calibrable en la practica mediante los cortes publicados.
- Asignacion de nivel de riesgo discreto en cuatro categorias: 0 (bajo), 1 (elevado), 2 (alto) y 3 (critico).
- Inferencia por lotes: la funcion `predict` acepta un diccionario, una lista de diccionarios o un `DataFrame` de pandas con las columnas esperadas.
- Tolerancia a columnas extra en la entrada (se ignoran) y a orden variable de las columnas.
- Validacion estricta de esquema: si falta alguna de las 15 variables requeridas, el modelo lanza un error.
- No soporta tool calling, function calling, razonamiento multi-paso, generacion de texto, vision, audio ni capacidades multilingues, porque no es un modelo generativo.

## Casos de uso

- Puntuacion en tiempo real de transferencias salientes: el motor antifraude calcula las 15 variables a partir del historial del ordenante y el modelo devuelve P(fraud) en milisegundos, lo que permite decidir entre aprobar, poner en cola de revision o bloquear.
- Priorizacion de la cola de analistas humanos: usando los niveles 2 y 3 como criterio de escalado, con una precision de alerta declarada de 0.64 y un recall de 0.8287 en el conjunto de test, se reduce el volumen de revisiones manuales frente a revisar todas las alertas.
- Bloqueo automatico de operaciones criticas: el nivel 3, con un 90.8 % de fraude observado en test, puede usarse como disparador de retencion inmediata o de verificacion reforzada (segundo factor, llamada al cliente).
- Monitorizacion por reglas en ventanas temporales: las variables `transfers_last_1h`, `transfers_last_24h` y `distinct_destinations_last_24h` permiten detectar patrones de fraude tipo "bust-out" o envios multiples a destinos nuevos en poco tiempo.
- Deteccion de desvio de importe respecto al comportamiento habitual del cliente, apoyandose en `amount_vs_avg`, `amount_zscore` y `amount_vs_max`, util para cuentas con historial estable y sin destino previo.
- Filtrado previo en procesos batch nocturnos: aplicar el modelo sobre el lote diario de transferencias para generar una lista priorizada de casos sospechosos que alimente al equipo de investigacion.
- Evaluacion comparativa de reglas: usar el modelo como referencia de scoring para medir si las reglas heurísticas existentes del banco ganan o pierden rendimiento frente a un clasificador entrenado.
- Simulacion y pruebas de carga: al ser un modelo ligero que carga en memoria en procesos Python, permite montar entornos de staging con el mismo contrato de entrada que produccion.

## Benchmarks y rendimiento

Las unicas metricas disponibles son las declaradas por el autor sobre el conjunto de test. No se proporcionan comparaciones con otros modelos, por lo que no se incluye tabla comparativa de rendimiento.

| Metrica | Valor |
|---|---|
| ROC-AUC (test) | 0.9924 |
| PR-AUC (test) | 0.8382 |
| Tasa de fraude en test | 0.0169 |
| Precision de alerta (nivel >= 2) | 0.64 |
| Recall de alerta (nivel >= 2) | 0.8287 |
| Recall (nivel >= 1) | 0.9655 |

Distribucion de transferencias de test por nivel de riesgo, segun la model card:

| Nivel | Etiqueta | Transferencias | Fraudes | Proporcion de fraude |
|---|---|---|---|---|
| 0 | bajo | 41,273 | 26 | 0.1 % |
| 1 | elevado | 2,355 | 103 | 4.4 % |
| 2 | alto | 473 | 168 | 35.5 % |
| 3 | critico | 502 | 456 | 90.8 % |

No se han publicado resultados de benchmarks comparativos con modelos similares en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: al ser un modelo de gradient boosting serializado en joblib y con un repositorio de 0.0 GB, el coste de computo es minimo y no requiere GPU.
- VRAM necesaria: 0 GB. El modelo se ejecuta en memoria del proceso Python que lo carga.
- GPU recomendadas: no aplica. No hay soporte declarado de aceleracion por GPU para este artefacto.
- Compatibilidad con GPU de consumo: no aplica, porque no necesita GPU.
- Despliegue: carga en proceso mediante `joblib`/`snapshot_download` y la clase `FraudModel` incluida en el repositorio; puede exponerse a traves de un microservicio (por ejemplo FastAPI) o integrarse en un pipeline batch de Python.
- Frameworks de servido de LLM (vLLM, llama.cpp, Ollama, TGI): no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Al tratarse de un clasificador de arboles con 15 variables, en la practica su coste por inferencia es de orden de microsegundos a pocos milisegundos por registro en CPU, pero no hay cifras publicadas por el autor.
- Conversion a otros formatos (ONNX, etc.): no documentada.

## Comparativa con modelos similares

No se proporciona en la informacion disponible ningun modelo comparable con el que contrastar parametros, contexto, rendimiento o licencia. Como referencia cualitativa, la categoria equivalente seria la de clasificadores tabulares de gradient boosting (LightGBM, XGBoost, CatBoost) entrenados para deteccion de fraude, pero no se dispone de artefactos concretos comparables ni de sus metricas en este mismo conjunto de datos.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yssfmlha/transfer-fraud-model | Gradient boosting tabular | no disponible | no aplica | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo se entreno con datos sinteticos, segun la propia model card; el autor indica explicitamente que debe validarse con datos reales antes de usarlo.
- No hay evidencia publicada de evaluacion con datos reales de produccion, por lo que las metricas de test pueden no trasladarse al entorno bancario real.
- El rendimiento depende por completo de que el integrador calcule correctamente las 15 variables; un error en la definicion de "history" (transferencias estrictamente anteriores dentro de los ultimos 180 dias) sesga la prediccion.
- La moneda de `amount` debe coincidir con la usada en el entrenamiento; la model card no especifica cual es.
- El modelo no calibra explicitamente las probabilidades mas alla de los cortes publicados; un cambio de poblacion o de tasa base de fraude obliga a recalibrar los umbrales.
- Riesgo de deriva (drift) en variables de comportamiento, especialmente en `amount_zscore`, `hour_familiarity` y los contadores de ventana temporal, que dependen de la actividad reciente del cliente.
- Posible desbalanceo extremo de clases: la tasa de fraude en test es de 0.0169, lo que hace que la precision de alerta (0.64 en nivel >= 2) deje un margen apreciable de falsos positivos.
- No se dispone de informacion sobre sesgos por segmentos de clientes (pais, canal, tipo de cuenta), ni sobre como se comporta con clientes sin historial.
- Licencia MIT: permite uso comercial y modificacion, pero conviene revisar las obligaciones de atribucion y la ausencia de garantias del titular.
- Repositorio sin descargas ni likes y creado muy recientemente segun los metadatos; no hay senales de mantenimiento ni de comunidad que respalden el artefacto.
- No es un modelo generativo: no procesa lenguaje natural, no tiene capacidades multilingues y no debe presentarse como tal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yssfmlha/transfer-fraud-model
- Documentacion de scikit-learn sobre `HistGradientBoostingClassifier`: no incluida en la informacion proporcionada
- Paper o blog del autor: no disponible
- Repositorio de codigo adicional: no disponible
- Demo: no disponible
