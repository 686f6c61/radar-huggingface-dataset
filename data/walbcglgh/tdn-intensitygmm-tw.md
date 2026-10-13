# walbcglgh/TDN-IntensityGMM-TW

## Resumen

TDN-IntensityGMM-TW es una familia de modelos de aprendizaje automatico para la prediccion de movimiento del suelo (ground-motion models, GMM) en Taiwan. Dado un terremoto definido por su magnitud, profundidad y epicentro, el modelo estima la aceleracion maxima del terreno (PGA) y la velocidad maxima del terreno (PGV) en cualquier punto objetivo, de lo que se deriva la intensidad sismica de la escala CWA. Lo desarrolla el autor walbcglgh y se distribuye como archivos ONNX autocontenidos que se ejecutan en cualquier entorno con onnxruntime.

A diferencia de los grandes modelos de lenguaje, no es un transformer: se trata de un perceptron multicapa (MLP) de regresion tabular de aproximadamente 135.000 parametros, entrenado sobre cientos de miles de registros de estaciones sismicas. La version insignia, TDN-IntensityGMM-TW-524k-v1, se entrena con 523.569 registros de estacion procedentes de 1.181 terremotos de Taiwan entre 2020 y 2025, fusionando la red MEMS P-Alert y los informes de movimiento fuerte de la CWA.

Su relevancia radica en que sustituye a las GMM empiricas clasicas por un modelo neuronal compacto y portable que produce mapas de intensidad completos en una sola llamada por lotes. La familia incluye variantes de regresion PGA/PGV y de clasificacion directa de intensidad en 10 clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) 10 -> 256 -> 256 -> 256 -> 2 con activacion SiLU |
| Parametros totales | Aproximadamente 134.914 (calculado a partir de la topologia declarada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; la entrada es un vector tabular fijo de 10 caracteristicas |
| Tipos de cuantizacion | No especificados; la entrada declarada es float32 y la estandarizacion va integrada en el grafo ONNX |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa con la topologia 10 -> 256 -> 256 -> 256 -> 2 y activacion SiLU, entrenado con AdamW y planificador OneCycle durante 120 epocas con tamano de lote 8192. Los objetivos son log10(PGA) y log10(PGV), ya que las distribuciones son aproximadamente log-normales; el propio grafo ONNX eleva las salidas a unidades lineales, de modo que el modelo devuelve PGA (gal) y PGV (cm/s). La estandarizacion de la entrada esta incrustada en el grafo ONNX, lo que hace el artefacto autocontenido. La variante de clasificacion (IntensityCLF) comparte el mismo tronco y anade una capa softmax de 10 clases sobre la escala de intensidad CWA, con pesos de clase 1/sqrt(count).

La entrada `features: float32[N, 10]` tiene un orden fijo: magnitud (ML), profundidad focal (km), distancia epicentral por haversine (km), lnR = ln(max(sqrt(dist^2 + depth^2), 3)), latitud y longitud del epicentro, latitud y longitud del punto objetivo, y el seno y coseno del azimut. Solo `dist`, `lnR` y el azimut dependen del punto objetivo, por lo que un ShakeMap completo se resuelve en una unica llamada por lotes.

Los datos de entrenamiento provienen de dos fuentes: la red P-Alert (P波警報器強震網, IES Academia Sinica / NTU, alrededor de 780 estaciones MEMS), con 696 eventos y 478.846 registros entre el 19 de enero de 2024 y el 6 de octubre de 2026; y los informes de la CWA (中央氣象署 顯著有感地震報告, movimiento fuerte de campo libre), con 1.088 eventos y 44.723 registros entre el 1 de enero de 2020 y el 27 de diciembre de 2025. El conjunto fusionado suma 1.181 eventos y 523.569 registros. Las magnitudes cubren el rango 3,5-7,2 y las distancias epicentrales 0,4-570 km. Se aplican pesos de muestra 1/sqrt(stations_per_event) para evitar que los eventos grandes dominen, y la particion entrenamiento/prueba (85 % / 15 %) esta agrupada por evento, con lo que las dos fuentes de un mismo terremoto nunca quedan a ambos lados del corte. Se emparejaron 603 pares entre fuentes con tolerancias estrictas (tiempos de origen dentro de 60 s, epicentro dentro de 0,2 grados, magnitud dentro de 0,8). Un control de coherencia indica que la tabla de umbrales CWA reproduce la intensidad impresa por la propia CWA en el 98,5 % de los registros.

## Capacidades

- Regresion de PGA (gal) y PGV (cm/s) a partir de parametros de terremoto y coordenadas del punto objetivo.
- Clasificacion directa de intensidad en 10 clases de la escala CWA (variantes IntensityCLF), devolviendo probabilidades calibradas por clase.
- Estimacion de intensidad derivada del maximo de los umbrales de PGA y PGV.
- Inferencia por lotes: permite calcular todos los puntos de un ShakeMap en una sola llamada.
- Recuperacion de intensidades altas poco frecuentes mediante la variante de clasificacion, mejor que el discretizado de la salida de regresion.
- Portabilidad total: modelo autocontenido ejecutable en cualquier plataforma que soporte onnxruntime.
- No dispone de tool calling, capacidad de agente, vision, audio ni generacion de texto; son capacidades fuera del alcance de este modelo.

## Casos de uso

- Generacion de ShakeMaps regionales: dado un evento, se calcula en una sola llamada por lotes la PGA/PGV de todos los municipios de Taiwan, lo que permite renderizar mapas de intensidad a resolucion de municipio con el renderizador `shakemap.py` incluido en el repositorio.
- Alerta temprana de terremotos: al recibir los parametros preliminares del evento, el modelo estima rapidamente la intensidad esperada en ubicaciones concretas para disparar avisos.
- Evaluacion de riesgo e ingenieria sismica: estimar la demanda de movimiento del suelo en un emplazamiento para escenarios hipoteticos definidos por magnitud, profundidad y epicentro.
- Interpolacion y relleno de estaciones: estimar PGA/PGV en ubicaciones sin instrumentacion a partir de las estaciones vecinas y los parametros del evento.
- Retroanalisis de catalogos: recalcular intensidades de terremotos historicos con los parametros registrados para validar o completar catalogos existentes.
- Clasificacion de intensidad para informes oficiales: usar la variante IntensityCLF para asignar la clase de intensidad CWA con una distribucion de probabilidad asociada, util cuando se necesita incertidumbre y no solo un valor puntual.
- Analisis de secuencias de replicas: al modelar terremotos individuales, permite estimar de forma independiente la intensidad de cada evento de una secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card original describe particiones retenidas agrupadas por evento, pero el contenido disponible se interrumpe antes de mostrar cifras (metricas de error, comparaciones entre variantes), por lo que no se reproducen numeros. Los unicos datos cuantitativos declarados son la cobertura del conjunto fusionado (523.569 registros de 1.181 eventos) y el control de coherencia de la tabla de umbrales CWA, que reproduce la intensidad oficial en el 98,5 % de los registros.

## Requisitos de hardware

- Pesos estimados: aproximadamente 0,5 MB en float32 (134.914 parametros), por lo que la huella de memoria es insignificante frente a cualquier GPU moderna.
- GPU: no necesaria. El modelo esta pensado para ejecucion en CPU; opcionalmente puede usar proveedores de onnxruntime como CUDA, TensorRT, OpenVINO o DirectML.
- Cabe en cualquier GPU de consumo e incluso en CPU de portatiles, servidores de gama baja o dispositivos embebidos tipo Raspberry Pi.
- Opciones de despliegue: onnxruntime (framework declarado), con los proveedores de ejecucion disponibles en esa libreria. Al ser ONNX, es facilmente integrable en servicios Python.
- Latencia y throughput: no se proporcionan cifras. La topologia compacta y la inferencia por lotes de un ShakeMap completo en una sola llamada sugieren un coste de computo muy bajo, pero no hay medidas publicadas.

## Comparativa con modelos similares

No se proporcionan en la informacion disponible modelos de terceros directamente comparables. La comparacion mas util es dentro de la propia familia, cuyas variantes difieren en los datos de entrenamiento:

| Modelo | Tarea | Datos de entrenamiento | Registros |
|---|---|---|---|
| TDN-IntensityGMM-TW-524k-v1 | Regresion PGA/PGV | P-Alert + CWA (fusionado) | 523.569 |
| TDN-IntensityGMM-TW-PAlert-479k-v1 | Regresion PGA/PGV | Solo P-Alert | 478.846 |
| TDN-IntensityGMM-TW-CWA-45k-v1 | Regresion PGA/PGV | Solo informes CWA | 44.723 |
| TDN-IntensityCLF-TW-524k-v1 | Clasificacion de intensidad (10 clases) | P-Alert + CWA (fusionado) | 523.569 |
| TDN-IntensityCLF-TW-PAlert-479k-v1 | Clasificacion de intensidad (10 clases) | Solo P-Alert | 478.846 |

Todas las variantes comparten licencia apache-2.0 y formato ONNX. No se dispone de datos de rendimiento comparativo entre ellas ni frente a GMM empiricas tradicionales.

## Limitaciones y advertencias

- Ambito geografico restringido: el modelo se entrena exclusivamente con terremotos de Taiwan; no es fiable fuera de esa region.
- Rango de validez: magnitudes 3,5-7,2 y distancias epicentrales 0,4-570 km. Las extrapolaciones fuera de ese rango no estan validadas.
- Politica de particion: las particiones retenidas no son identicas entre variantes (distintos conjuntos de datos y distinto numero de eventos retenidos), por lo que la model card advierte de comparar dentro de un mismo conjunto de datos y no entre las primeras filas.
- Riesgo de predicciones poco fiables en intensidades altas extremas, dado que son casos raros en el conjunto de entrenamiento (motivo por el que se ofrece la variante de clasificacion).
- La tabla de umbrales CWA es una aproximacion de la escala oficial y puede no coincidir con asignaciones administrativas en casos limite.
- El emparejamiento entre fuentes depende de tolerancias estrictas; un emparejamiento mas laxo encadena secuencias de replicas y fue descartado por el autor.
- No es un modelo generativo: no produce texto, no soporta agentes ni tool calling, y su uso esta limitado a la regresion y clasificacion tabular descritas.
- Licencia apache-2.0: permite uso comercial, pero conviene citar la fuente de los datos (P-Alert y CWA) segun sus propias condiciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopcion ni validacion independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walbcglgh/TDN-IntensityGMM-TW
- Repositorio del autor (incluye `predict_point.py`, `palert/predict.py` y `shakemap.py`): no disponible como enlace directo en la informacion proporcionada
- Paper asociado: no disponible
- Demos o espacios: no disponible
