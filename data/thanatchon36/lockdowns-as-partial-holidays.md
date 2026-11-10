# thanatchon36/lockdowns-as-partial-holidays

## Resumen

"Lockdowns as partial holidays" no es un modelo de lenguaje, sino un conjunto de modelos estadísticos de series temporales publicados en Hugging Face por Thanatchon Chongmankhong como material reproducible de un preprint académico. El paquete contiene cinco artefactos de previsión (Prophet diario, Prophet mensual, SARIMAX y dos variantes LightGBM) entrenados sobre la serie simulada de exportaciones diarias de Tailandia correspondiente a la réplica 0 del estudio de Monte Carlo del artículo (escenario S1, 2010-2019). No debe confundirse con un modelo fundacional: no tiene parámetros neuronales, ni tokenizador, ni contexto conversacional.

La idea metodológica central es tratar un confinamiento como un "festivo parcial". Cada modelo incorpora un regresor de parada compartido por canal: el doméstico se activa en festivos públicos tailandeses (incluido Songkran) y el de socio comercial en la ventana del Año Nuevo chino. Antes de 2020 la dosis es cero, de modo que las elasticidades se aprenden únicamente a partir de diez años de festivos; para prever un confinamiento solo cambia la dosis, sin estimar nuevos parámetros. La dosis empleada es el Holiday-Equivalent Stoppage Index (HESI), definido como la caída de movilidad laboral de un día dividida por su caída mediana en un festivo público entre semana.

El interés actual es doble: por un lado, ofrece una vía transparente y de bajo coste computacional para transferir elasticidades estimadas en festivos a episodios de parada laboral; por otro, la publicación incluye los pesos en formatos legibles (JSON de Prophet, texto nativo de LightGBM, parámetros de statsmodels) y un script de carga independiente que evita el uso de pickle, lo que facilita la auditoría y la reproducción. Los modelos están entrenados sobre datos simulados y no sirven para prever exportaciones oficiales tailandesas sin reajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelos estadísticos de series temporales: Prophet (aditivo con regresores), SARIMAX (0,1,1)(0,1,1)12 y LightGBM sobre residuo desestacionalizado con tendencia log-lineal |
| Parámetros totales | No disponible (no son redes neuronales; los coeficientes se detallan en `meta.json`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de entrenamiento de 120 meses (2010-2019) y horizonte de previsión 2020-2021 |
| Tipos de cuantización | No aplica |
| Idiomas soportados | Inglés (documentación y etiquetas); los datos subyacentes son series de exportaciones tailandesas |
| Licencia | CC-BY-4.0 |
| Formato de pesos | JSON (Prophet), texto nativo (LightGBM), parámetros serializados de statsmodels (SARIMAX), más `meta.json` con coeficientes y factores de smearing de Duan |

## Arquitectura y entrenamiento

El paquete agrupa cinco modelos con especificaciones distintas. Prophet-D HE es un Prophet diario sobre el logaritmo de las exportaciones con regresores `xD` y `xP`; Prophet-M HE es la versión mensual sobre el logaritmo de la media diaria de exportaciones, con regresores `MxD`, `MxP` (medias mensuales de los regresores diarios) y `WK` (proporción de fin de semana); Prophet-M HE+AC añade la corrección de agregación en forma cerrada que traslada las elasticidades mensuales atenuadas a su equivalente diario. SARIMAX HE emplea el modelo "airline" (0,1,1)(0,1,1)12 sobre el logaritmo de la media diaria de exportaciones con los mismos regresores, y se reconstruye con `statsmodels.SARIMAX(...).filter(params)` a partir de los 120 meses de entrenamiento. LightGBM-D HE y LightGBM-M HE combinan una tendencia log-lineal con un LightGBM ajustado sobre el residuo destendenciado, con los coeficientes de tendencia en `meta.json`.

El entrenamiento se realizó sobre la serie simulada de exportaciones diarias de la réplica 0 del estudio de Monte Carlo del artículo (escenario S1, 2010-2019). No hay datos reales de exportaciones oficiales ni fases de RLHF o DPO, al no tratarse de un modelo generativo. La innovación técnica destacable es la derivación de la atenuación de Jensen que sufren las elasticidades al agregar datos diarios a mensuales (la elasticidad mensual tiende a `exp(beta) - 1`) y su corrección en forma cerrada, implementada en Prophet-M HE+AC. Las elasticidades verdaderas de la simulación son `beta_D = log(0.45) = -0.799` y `beta_P = log(0.80) = -0.223`; los modelos recuperan valores próximos (Prophet-D HE: -0.800 y -0.217; Prophet-M HE+AC: -0.880 y -0.240; SARIMAX HE: -0.752 y -0.256). Sobre las 30 réplicas, las medias son -0.80 (diario), -0.54 (mensual) y -0.76 (corregido).

## Capacidades

- Previsión de series temporales univariantes con regresores exógenos de parada laboral, en frecuencia diaria y mensual.
- Transferencia de elasticidades estimadas en festivos a episodios de confinamiento sin reestimar parámetros.
- Soporte de múltiples variantes de dosis: `off` (sin dosis), `binary` (conmutación de mes completo), `stringency` (OxCGRT bruto), `oracle_S1`, `oracle_S2` o cualquier serie diaria `xD`, `xP` construida por el usuario en el rango 0-1 e igual a 1 en festivos.
- Corrección analítica de la atenuación por agregación temporal (Jensen) en la variante Prophet-M HE+AC.
- Carga sin pickle: Prophet desde JSON, LightGBM desde su formato de texto y SARIMAX desde parámetros, lo que permite auditoría y reproducción.
- Script independiente `hes_forecast.py` con funciones `load` y `forecast` para generar previsiones por modelo y variante de dosis.
- No dispone de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Evaluación metodológica de elasticidades de parada laboral: usar los modelos como banco de pruebas reproducible para comparar cómo distintas especificaciones (Prophet diario, Prophet mensual, SARIMAX, LightGBM) recuperan las elasticidades verdaderas de la simulación (-0.799 y -0.223) y cuantificar la atenuación mensual.
- Investigación sobre efectos calendáricos: emplear los regresores `xD` y `xP` para estudiar cómo los festivos públicos tailandeses y la ventana del Año Nuevo chino informan la elasticidad de las exportaciones antes de 2020.
- Análisis de sensibilidad de la dosis: comparar las previsiones con dosis `off`, `binary`, `stringency` y HESI para documentar cuánto mejora la especificación continua frente a la conmutación binaria (por ejemplo, Prophet-D HE pasa de 30,3 % a 8,5 % de MAPE en la réplica 0).
- Docencia y formación en series temporales aplicadas: el paquete sirve como ejemplo completo de Prophet con regresores, SARIMAX estacional y LightGBM sobre residuo destendenciado, con artefactos legibles y checksums SHA256.
- Replicación de estudios de Monte Carlo: los archivos permiten reproducir el escenario S1 y contrastar los resultados publicados en `forecast_check.csv` con las previsiones del artículo.
- Punto de partida para aplicar el método a datos oficiales: el comando `hesi real` del repositorio de código reajusta cada modelo sobre la serie del usuario, de modo que el paquete actúa como plantilla para transferir la metodología a otras economías o sectores exportadores.
- Auditoría de artefactos de investigación: al no usar pickle y publicar `meta.json` con coeficientes, factores de smearing y versiones de librerías, facilita la revisión por pares y la verificación de integridad mediante `SHA256SUMS`.

## Benchmarks y rendimiento

MAPE de las exportaciones mensuales, enero de 2020 a diciembre de 2021, escenario S1, previsiones realizadas a finales de 2019 (réplica 0):

| Modelo | Sin dosis | Conmutación binaria | Stringency bruto | Dosis HESI |
|---|---:|---:|---:|---:|
| Prophet-D HE | 30,3 % | 26,3 % | 24,9 % | **8,5 %** |
| Prophet-M HE | 29,5 % | 24,0 % | 17,9 % | 11,2 % |
| Prophet-M HE+AC | 29,6 % | 26,3 % | 29,1 % | **7,4 %** |
| SARIMAX HE | 26,4 % | 22,1 % | 26,4 % | **7,1 %** |
| LightGBM-D HE | 16,3 % | 15,3 % | 43,8 % | 42,7 % |
| LightGBM-M HE | 14,9 % | 14,2 % | 13,6 % | No disponible en la información proporcionada |

## Requisitos de hardware

- Inferencia en CPU: los cinco modelos son ligeros y no requieren GPU; Prophet, statsmodels y LightGBM se ejecutan en CPU convencional.
- Memoria RAM estimada: por debajo de 1 GB para cargar los artefactos y generar las previsiones de 24 meses.
- GPU recomendadas: ninguna; no aplica aceleración por GPU.
- Cabe en cualquier equipo de consumo, incluidos portátiles modestos y entornos de CI.
- Opciones de despliegue: script Python `hes_forecast.py` con dependencias numpy, pandas, prophet, lightgbm y statsmodels; también es posible cargar cada artefacto por separado (JSON de Prophet, texto de LightGBM, parámetros de SARIMAX).
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza de los modelos, se espera un coste de segundos por ajuste de previsión en CPU, sin datos publicados que lo cuantifiquen.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / ventana | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lockdowns as partial holidays (este paquete) | Prophet, SARIMAX, LightGBM con regresores de parada | No aplica | 120 meses de entrenamiento | MAPE HESI 7,1 %-11,2 % en la réplica 0 | CC-BY-4.0 | Hugging Face y GitHub |
| Prophet estándar (Meta) | Modelo aditivo con estacionalidad y festivos | No aplica | Configurable por el usuario | No disponible para este caso | MIT | Librería open source |
| SARIMAX estándar (statsmodels) | ARIMA estacional con regresores exógenos | No aplica | Configurable por el usuario | No disponible para este caso | BSD-3-Clause | Librería open source |
| LightGBM estándar (Microsoft) | Gradient boosting sobre árboles | No aplica | Configurable por el usuario | No disponible para este caso | MIT | Librería open source |

No se dispone de comparaciones publicadas frente a otros paquetes de previsión con regresores de confinamiento en la información proporcionada.

## Limitaciones y advertencias

- Los modelos están entrenados sobre datos simulados (réplica 0, escenario S1) y no son un predictor de las exportaciones oficiales tailandesas; el propio autor lo advierte de forma explícita.
- Para aplicar el método a datos reales es necesario ejecutar `hesi real` del repositorio de código, que reajusta cada modelo sobre la serie del usuario.
- Las elasticidades mensuales están atenuadas por la agregación temporal (Jensen) y deben corregirse con Prophet-M HE+AC o interpretarse con cautela; la media mensual sin corregir es -0,54 frente a -0,80 diaria.
- LightGBM-D HE muestra un comportamiento errático con la dosis HESI (42,7 % de MAPE, peor que sin dosis), lo que desaconseja su uso con esa variante sin un análisis previo.
- El horizonte de previsión evaluado se limita a 2020-2021; no hay evidencia publicada sobre horizontes más largos ni sobre otras economías.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el contenido es investigación personal independiente y no representa a ninguna institución.
- No hay datos publicados sobre sesgos, alucinación o comportamiento en dominios distintos al analizado, al no tratarse de un modelo generativo.
- Los artefactos dependen de versiones concretas de prophet, lightgbm y statsmodels registradas en `meta.json`; cambios de versión pueden alterar la reconstrucción de SARIMAX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thanatchon36/lockdowns-as-partial-holidays
- Dataset asociado: https://huggingface.co/datasets/thanatchon36/lockdowns-as-partial-holidays
- Repositorio de código: https://github.com/thanatchon36/lockdowns-as-partial-holidays
- Preprint (lectura online): https://thanatchon36.github.io/lockdowns-as-partial-holidays/paper/
- Preprint (PDF): https://github.com/thanatchon36/lockdowns-as-partial-holidays/blob/main/paper/paper.pdf
- Versión en tailandés: https://github.com/thanatchon36/lockdowns-as-partial-holidays/blob/main/paper/thai/paper_th.pdf
- Archivo en Zenodo: https://doi.org/10.5281/zenodo.24036954
