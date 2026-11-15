# summerAIO/sunstar-v2

## Resumen

Sun* V2 es un modelo de regresión tabular basado en LightGBM para el downscaling estadístico de predicciones meteorológicas puntuales en la prefectura de Okayama (Japón). Lo desarrolla el usuario summerAIO y su función es transformar los campos de reanálisis ERA5 (resolución de 0,25°) junto con un modelo digital del terreno de 250 m en predicciones a nivel de estación AMeDAS, asimilando opcionalmente observaciones hasta el instante de inicialización del pronóstico. Cubre seis variables: temperatura, viento (componentes u y v, y velocidad), humedad relativa y precipitación.

La relevancia del modelo es metodológica más que de escala: sustituye el MLP/CNN de su predecesor (Sun* V1) por un conjunto de modelos LightGBM por variable (media de dos semillas) alimentados con 123 características que incluyen contexto temporal de ERA5 (±1, 3, 6 h y estadísticos de 24 h), estructura espacial de cuatro celdas, máxima y media de precipitación en el entorno, altura solar, 17 variables topográficas y correcciones de temperatura por altitud. Incorpora además un indicador de régimen (`regimeB`) para corregir un cambio de sesgo observado en las temperaturas AMeDAS a partir de octubre de 2024.

El modelo se distribuye como ficheros de texto comprimido de LightGBM con código de inferencia en Python (no como pesos de red neuronal), con licencia Apache 2.0, idiomas declarados japonés e inglés, y un tamaño de repositorio de 0,1 GB. No incluye los datos de entrenamiento ni los ficheros ERA5/AMeDAS de entrada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre árboles de decisión), un modelo por variable y dos semillas promediadas |
| Parametros totales | no disponible (no se publica el número de árboles ni de hojas por modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa ventanas de contexto temporal de ±1/3/6 h y estadísticos de 24 h sobre ERA5) |
| Tipos de cuantizacion | no disponible (los ficheros se distribuyen como texto comprimido `.txt.gz` de LightGBM) |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ficheros de modelo LightGBM en texto comprimido (`models/ds_<var>_s{0,1}.txt.gz`, `models/ob_<var>_s{0,1}.txt.gz`, `models/sigma_{ds,ob}_<var>.txt.gz`) más `config.json` con lista de características y calibración de σ |

## Arquitectura y entrenamiento

El modelo es un conjunto de regresores LightGBM independientes por variable, entrenados sobre 123 características derivadas de ERA5 y del terreno. Entre ellas se incluyen el contexto temporal de ERA5 en ventanas de ±1, 3 y 6 horas junto con estadísticos de 24 h, la estructura espacial de las cuatro celdas ERA5 circundantes, la precipitación máxima y media en el entorno, la altura solar, 17 variables topográficas con diferencias de elevación a múltiples escalas, interacciones terreno-viento y temperatura corregida por altitud. Las variables objetivo se modelan como residual respecto a la interpolación de ERA5 para temperatura, componentes u y v del viento y humedad relativa; la velocidad del viento se regresa directamente (no se deriva de u y v) por optimización de RMSE, y la precipitación en mm/h se regresa directamente con una distribución Tweedie de potencia 1,3 para predecir la media condicional.

Los datos de entrenamiento cubren ERA5 y AMeDAS desde enero de 2021 hasta diciembre de 2025 (V1 solo usaba 2024). La validación para parada temprana y calibración de coeficientes emplea julio a diciembre de 2025, y el modelo final se reentrena hasta finales de 2025. El periodo de test (1 de enero a 31 de octubre de 2026) no se usa en entrenamiento ni en ajuste. Se distinguen dos modos: downscaling (lead 0, sin observaciones) y asimilación de observaciones, en el que se incorporan residuales de AMeDAS frente a ERA5 con retardos de 0, 1, 2, 3, 6, 12 y 24 h, medias móviles de 3, 6, 24, 72 y 168 h, variabilidad, tendencia térmica, precipitación acumulada y el cambio de ERA5 entre t0 y t. El lead se aprende como característica en un único modelo. La incertidumbre se modela con una σ de distribución normal calibrada por CRPS, predicha por un LightGBM sobre el error absoluto fuera de muestra, con un factor de expansión para estaciones no vistas basado en la ratio de RMSE (no vista/vista) obtenida por validación cruzada entre estaciones. Para estaciones no entrenadas se usa la variante S (con características topográficas estáticas), que generaliza mejor que la variante G sin ellas.

## Capacidades

- Downscaling estadístico de ERA5 (0,25°) a estaciones AMeDAS de la prefectura de Okayama con terreno de 250 m.
- Predicción puntual de temperatura, componente u del viento, componente v del viento, velocidad del viento, humedad relativa y precipitación (mm/h).
- Asimilación de observaciones AMeDAS hasta el instante de inicialización, con horizontes de 1, 3, 6, 12 y 24 h.
- Predicción de incertidumbre: media y σ de una distribución normal para temperatura, u, v y humedad, calibrada por CRPS; media condicional para velocidad del viento y precipitación.
- Generalización a estaciones no vistas en entrenamiento mediante la variante S con características topográficas estáticas.
- Corrección de cambio de régimen en el sesgo de temperatura observado (indicador `regimeB`, fijado a 1 en inferencia).
- Interfaz de inferencia en Python (`SunstarV2.downscale`) y script de línea de comandos (`infer_example.py`) con soporte de estaciones nuevas (`--new-station`).
- No soporta tool calling, function calling, agentes, visión, audio ni generación de texto: es un modelo de regresión tabular.

## Casos de uso

- Predicción meteorológica local de alta resolución en Okayama: dado un campo ERA5 en la hora válida, el modelo genera temperatura, viento, humedad y precipitación a nivel de estación, útil para servicios meteorológicos provinciales que necesitan detalle inferior a la malla de 0,25°.
- Nowcasting y very short-range forecasting con asimilación de observaciones: usando las observaciones AMeDAS hasta t0, el modelo produce predicciones a 1, 3, 6, 12 y 24 h con RMSE de temperatura de 0,614 °C a 1 h y 0,856 °C a 24 h en estaciones de entrenamiento, adecuado para avisos operativos de corto plazo.
- Gestión agrícola: la predicción de temperatura, humedad y precipitación por estación permite planificar riego, tratamientos fitosanitarios y protección contra heladas en explotaciones de la prefectura.
- Predicción de recurso eólico y solar a escala local: las componentes u y v del viento y la altura solar como característica permiten estimar producción de parques eólicos y plantas fotovoltaicas en ubicaciones concretas.
- Cuantificación de incertidumbre en sistemas de alerta: la σ calibrada por CRPS (por ejemplo, CRPS de temperatura de 0,456 en downscaling y 0,323 a 1 h con observaciones) permite construir intervalos de confianza para umbrales de aviso meteorológico.
- Evaluación y corrección de modelos numéricos: el modelo sirve como referencia de downscaling estadístico para comparar el sesgo de ERA5 frente a observaciones y para corregir sesgos sistemáticos en estaciones concretas.
- Docencia e investigación en post-procesado estadístico: el repositorio incluye código de entrenamiento y evaluación (`training_code/`), lo que permite reproducir el pipeline y adaptarlo a otras regiones con datos ERA5 y una red de observaciones equivalente.
- Relleno de series y control de calidad: la asimilación de residuales con múltiples retardos y medias móviles puede emplearse para detectar observaciones anómalas comparando la predicción con la medición.

## Benchmarks y rendimiento

Resultados en el test 2026-01-01 a 2026-10-31 (AMeDAS real), downscaling con lead 0, RMSE:

| Variable | ERA5 interpolado | Sun* V1 | Sun* V2 | Mejora V2 vs V1 |
|---|---|---|---|---|
| Temperatura [°C] (22 estaciones de entrenamiento) | 1,484 | 1,169 | 0,845 | +27,8 % |
| Velocidad del viento [m/s] (22 est.) | 1,591 | 0,901 | 0,699 | +22,4 % |
| Viento u [m/s] (22 est.) | 1,648 | 0,943 | 0,873 | +7,4 % |
| Viento v [m/s] (22 est.) | 1,704 | 1,013 | 0,950 | +6,2 % |
| Humedad relativa [%] (22 est.) | 10,038 | 6,492 | 5,856 | +9,8 % |
| Precipitación [mm/h] (22 est.) | 0,790 | 0,742 | 0,720 | +3,0 % |
| Temperatura [°C] (3 estaciones no vistas) | 1,598 | 1,534 | 1,334 | +13,0 % |
| Velocidad del viento [m/s] (3 no vistas) | 1,841 | 1,109 | 0,942 | +15,1 % |
| Viento u [m/s] (3 no vistas) | 1,873 | 1,225 | 1,152 | +6,0 % |
| Viento v [m/s] (3 no vistas) | 1,758 | 1,220 | 1,068 | +12,5 % |
| Humedad relativa [%] (3 no vistas) | 9,837 | 8,454 | 7,934 | +6,2 % |
| Precipitación [mm/h] (3 no vistas) | 0,664 | 0,619 | 0,613 | +1,0 % |

Resultados con asimilación de observaciones, estaciones de entrenamiento, temperatura [°C] (RMSE):

| Lead | Persistencia | ERA5 interpolado | V1 sin obs. | V2 sin obs. | V1 con obs. | V2 con obs. | Mejora V2 vs V1+obs |
|---|---|---|---|---|---|---|---|
| 1 h | 1,176 | 1,484 | 1,174 | 0,845 | 0,787 | 0,614 | +22,0 % |
| 3 h | 2,927 | 1,484 | 1,162 | 0,845 | 0,979 | 0,750 | +23,4 % |
| 6 h | 4,924 | 1,484 | 1,170 | 0,845 | 1,079 | 0,813 | +24,7 % |
| 12 h | 6,543 | 1,484 | 1,171 | 0,845 | 1,159 | 0,845 | +27,1 % |
| 24 h | 3,109 | 1,484 | 1,164 | 0,845 | 1,172 | 0,856 | +27,0 % |

CRPS de temperatura con observaciones: 0,323 (1 h), 0,398 (3 h), 0,436 (6 h), 0,455 (12 h) y 0,462 (24 h) para V2, frente a 0,433, 0,545, 0,608, 0,660 y 0,668 de V1. En downscaling, CRPS de temperatura 0,456 (V2) frente a 0,657 (V1); u: 0,458 frente a 0,495; v: 0,493 frente a 0,525; humedad: 2,992 frente a 3,364. V2 mejora 70 de las 72 métricas principales frente a V1; las dos excepciones son precipitación a 1 h (V1 0,695 frente a V2 0,696 en estaciones de entrenamiento; V1 0,572 frente a V2 0,582 en estaciones no vistas). Velocidad del viento con observaciones a 1 h: persistencia 0,827, ERA5 1,594, V1 sin obs. 0,907, V2 sin obs. 0,703, V1 con obs. 0,797, V2 con obs. 0,650 (+18,4 %); a 3 h: persistencia 1,151, ERA5 1,594, V1 sin obs. 0,903, V2 sin obs. 0,702, V1 con obs. 0,867, V2 con obs. 0,692. El resto de la tabla de velocidad del viento para 6, 12 y 24 h no está disponible en la información proporcionada.

## Requisitos de hardware

- No es un modelo neuronal: no requiere VRAM ni GPU para inferencia. La inferencia de LightGBM se ejecuta en CPU.
- Memoria RAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,1 GB, por lo que el conjunto de modelos cabe holgadamente en cualquier equipo convencional.
- GPU recomendadas: no aplica. Cualquier CPU de servidor o portátil moderno es suficiente.
- Cabe en GPU de consumo: no aplica (no usa GPU); en la práctica se ejecuta en cualquier máquina que soporte Python y LightGBM.
- Opciones de despliegue: LightGBM nativo con el código Python incluido (`sunstar_v2/`), script `infer_example.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. La inferencia requiere cargar los ficheros `.txt.gz` y los arrays ERA5/AMeDAS en formato `.npz`.

## Comparativa con modelos similares

| Modelo | Tipo | Variables | Resolución / estaciones | Contexto temporal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sun* V2 | LightGBM por variable, 2 semillas | Temperatura, u, v, velocidad, humedad, precipitación | ERA5 0,25° + terreno 250 m a estaciones AMeDAS de Okayama | Leads 0 a 24 h, contexto ±6 h y estadísticos de 24 h | Apache 2.0 | Hugging Face (summerAIO/sunstar-v2) |
| Sun* V1 | MLP/CNN | Mismas variables | Mismas estaciones | Mismos leads | no disponible en la información | Referenciado en la model card de V2 |
| ERA5 interpolado (línea base) | Interpolación directa | Mismas variables | 0,25° interpolado a estación | Hora válida | no aplica (reanálisis Copernicus) | Público |
| Persistencia (línea base) | Última observación | Temperatura y viento | Estación | Leads 1 a 24 h | no aplica | Trivial |

No se dispone de datos sobre otros modelos de downscaling estadístico comparables en la información proporcionada; la comparación se limita a las líneas base incluidas en la propia evaluación del autor.

## Limitaciones y advertencias

- La "guía" de entrada es ERA5 de reanálisis en la hora válida (perfect-prognosis), no un pronóstico real; los resultados son una cota superior optimista para uso operativo, tal como advierte el propio autor.
- Cobertura geográfica restringida a la prefectura de Okayama y a 22 estaciones de entrenamiento más 3 de retención (Niimi, Wake, Tamano); no se ha validado fuera de esa región.
- El modelo no incluye los datos de entrenamiento ni los ficheros ERA5/AMeDAS: el usuario debe aportar `era5.npz` y `obs.npz` en el formato de `prep_data_reference.py`.
- Dependencia crítica de la calidad y disponibilidad de ERA5 y de la red AMeDAS; errores o huecos en las observaciones degradan la asimilación.
- El cambio de régimen detectado en octubre de 2024 obliga a fijar `regimeB` a 1 en inferencia; si el régimen vuelve a cambiar, el modelo podría quedar descalibrado sin reentrenamiento.
- La precipitación es la variable con menor mejora relativa (+1,0 % en estaciones no vistas) y es la única métrica donde V2 no supera a V1 a 1 h de lead.
- La incertidumbre se modela como normal calibrada por CRPS; la precipitación y la velocidad del viento solo ofrecen media condicional, sin σ.
- Las estaciones no vistas usan la variante S y un factor de expansión de σ empírico, por lo que la calibración de la incertidumbre en ubicaciones nuevas es menos fiable.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Riesgo de alucinación no aplica (no es un modelo generativo); el riesgo equivalente es la extrapolación fuera de la distribución de entrenamiento (regímenes extremos, estaciones con topografía atípica).
- No se documentan sesgos demográficos ni lingüísticos por tratarse de un modelo de regresión física; los sesgos relevantes son los meteorológicos descritos (régimen de temperatura, precipitación).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerAIO/sunstar-v2
- Repositorio de datos de referencia citado en la model card: `okayama-weather-dataset/sunstar/runs/*_test_metrics.csv` (métricas de V1, solo lectura)
- Script de preparación de datos citado: `prep_data_reference.py` (incluido en el repositorio del modelo)
- Script de inferencia citado: `infer_example.py` (incluido en el repositorio del modelo)
- Código de entrenamiento y evaluación: `training_code/` (incluido en el repositorio del modelo)
- No se han encontrado en la información proporcionada papers, blogs, demos ni repositorios adicionales.
