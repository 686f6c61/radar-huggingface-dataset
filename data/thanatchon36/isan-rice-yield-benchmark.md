# thanatchon36/isan-rice-yield-benchmark

## Resumen

`isan-rice-yield-benchmark` es un conjunto de modelos de regresión tabular para la previsión de rendimiento de arroz de temporada principal a nivel de distrito en el noreste de Tailandia (región de Isan). Lo desarrolla Thanatchon Chongmankhong como investigación personal independiente y acompaña al preprint *Leakage-safe, explainable multi-source machine learning for district-level rice yield forecasting*. No es un modelo de lenguaje ni una red neuronal: es un ensemble clásico de LightGBM y regresión Ridge sobre 81 características tabulares.

El modelo predice el rendimiento en kg/rai (multiplicar por 0,00625 para obtener t/ha) al final de la temporada, usando el conjunto de información de noviembre. Las características se agrupan en ocho bloques: rendimientos previos, humedad y humedad del suelo, agua (lluvia, embalses, irrigación), clima, índices satelitales (NDVI, EVI, LSWI, LST), precios del arroz y cultivos competidores, geografía y capas de mapa con retardos espaciales. El diseño pone el énfasis en evitar fugas de información (*leakage-safe*) y en la explicabilidad.

Su relevancia es metodológica más que operativa: se entrena sobre un simulador documentado de Tailandia nororiental cuyos componentes verdaderos de rendimiento son conocidos, de modo que sirve como banco de pruebas reproducible para pipelines de previsión agrícola con datos multisource. El autor advierte explícitamente de que los pesos publicados no son previsiones de rendimientos reales de arroz tailandés y no deben usarse como tales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de dos modelos: LightGBM (gradient boosting de árboles) y regresión Ridge con imputación por mediana y estandarización; media de pesos iguales |
| Parámetros totales | no disponible (no aplica; modelo de árboles y regresión lineal) |
| Parámetros activos | no aplica |
| Longitud de contexto | no aplica (entrada tabular fija de 81 características) |
| Tipos de cuantización | no disponible (no aplica a LightGBM nativo ni a coeficientes Ridge) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `lightgbm.txt` (formato texto nativo de LightGBM), `ridge.json` (mediana de imputación, medias y escalas, penalización, coeficientes e intercepto), `conformal.json` (offsets conformales), `features.json` (esquema de las 81 columnas), `metrics.json` |

Hiperparámetros de LightGBM: `num_leaves=63`, `learning_rate=0.05`, `n_estimators=400`, `min_child_samples=80`, `subsample=0.8`, `colsample_bytree=0.5`, `reg_lambda=1.0`, `max_depth=-1`. Ridge: penalización elegida por RidgeCV con alpha = 0,53.

## Arquitectura y entrenamiento

El modelo combina dos aproximaciones complementarias sobre el mismo vector de 81 características. LightGBM captura interacciones no lineales entre variables agroclimáticas y satelitales mediante boosting de árboles con histogramas, mientras que Ridge aporta un componente lineal regularizado y estable. El ensemble es la media aritmética simple de ambos, seleccionada sobre las temporadas de validación 2015-2017 antes de ver los datos de test.

Los datos de entrenamiento son sintéticos: 3.000 pares distrito-temporada correspondientes a 200 distritos y temporadas 2011-2025, con 2008-2010 usados solo como historial de rendimiento. El proceso generador de datos está documentado y sus componentes verdaderos de rendimiento son conocidos, lo que permite evaluar el pipeline contra una verdad de referencia. La evaluación es de origen rodante (*rolling origin*): cada temporada de test 2018-2025 se predice con modelos entrenados solo con temporadas anteriores, generando 1.600 previsiones.

La innovación metodológica principal es el uso de intervalos de predicción por conformal prediction dividida (*split-conformal*). El archivo `conformal.json` contiene los cuantiles empíricos de los errores fuera de muestra del ensemble sobre todas las temporadas que pudo prever con al menos tres temporadas de entrenamiento (2014-2025, 2.400 previsiones), permitiendo construir intervalos al 80% y al 90% sumando los offsets a la predicción puntual. En la evaluación rodante del artículo, los intervalos al 80% cubrieron el 78,3% de los resultados, con un mínimo de cobertura del 40% en la peor temporada (2018).

## Capacidades

- Regresión tabular sobre 81 características numéricas organizadas en ocho grupos (rendimientos previos, humedad y suelo, agua, clima, índices satelitales, precios, geografía y capas de mapa con retardos espaciales).
- Predicción puntual de rendimiento de arroz en kg/rai a nivel de distrito.
- Intervalos de predicción calibrados al 80% y al 90% mediante conformal prediction dividida.
- Salida desagregada por componente: `predict.py` devuelve las columnas de LightGBM, de Ridge y del ensemble, permitiendo usar solo LightGBM si se prefiere.
- Carga autocontenida: `load(folder).predict(X)` devuelve las predicciones e intervalos sin dependencias de infraestructura pesada.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; es un modelo puramente numérico.

## Casos de uso

- Evaluación de pipelines de previsión agrícola: sirve como referencia reproducible para comparar nuevas arquitecturas (gradient boosting, redes tabulares, modelos espacio-temporales) contra un benchmark con verdad simulada conocida y métricas de origen rodante ya calculadas.
- Docencia e investigación en ciencia de datos aplicada a agricultura: el conjunto de 81 características agrupadas y el esquema `features.json` permiten estudiar el efecto de cada bloque de variables sobre el rendimiento sin necesidad de acceder a datos reales restringidos.
- Desarrollo de sistemas de alerta temprana de rendimiento: el patrón de intervalos conformales al 80% y 90% es directamente reutilizable para cuantificar la incertidumbre en sistemas operativos de previsión de cosechas.
- Validación de técnicas anti-leakage: el diseño leakage-safe del pipeline y su documentación permiten auditar cómo evitar fugas temporales y espaciales en previsiones de series temporales agroclimáticas.
- Prototipado de integración de índices satelitales: el modelo muestra cómo combinar NDVI, EVI, LSWI y LST con variables meteorológicas y de precios en un mismo vector de características, útil como plantilla para proyectos con datos de teledetección reales.
- Benchmarking de métodos de cuantificación de incertidumbre: los offsets conformales publicados y las métricas de cobertura por temporada permiten comparar alternativas como quantile regression o intervalos bayesianos frente al enfoque split-conformal.
- Base para reentrenamiento con datos reales: el repositorio de código (`make all`) permite sustituir las tablas sintéticas por datos reales en `data/raw/` siguiendo el esquema documentado en `docs/DATA_SCHEMA.md` y reentrenar el pipeline completo.

## Benchmarks y rendimiento

Evaluación de origen rodante sobre temporadas de test 2018-2025 (1.600 previsiones), datos sintéticos. RMSE y MAE en kg/rai; entre corchetes, intervalo bootstrap al 95% por bloques de temporada. Skill = 1 − MSE / MSE de la climatología.

| Modelo | RMSE [IC 95%] | MAE | MAPE (%) | R² | Skill |
|---|---|---|---|---|---|
| Ensemble LightGBM + Ridge (este modelo) | 29,9 [24,7; 37,4] | 23,4 | 7,0 | 0,87 | +0,60 |
| LightGBM solo (`lightgbm.txt`) | 27,4 [26,1; 29,0] | 21,7 | 6,4 | 0,89 | +0,66 |
| Ridge solo (`ridge.json`) | 37,9 [25,4; 54,3] | 27,9 | 8,3 | 0,78 | +0,35 |
| Climatología (media de las 3 temporadas previas) | 47,1 [40,6; 53,2] | 37,8 | 11,4 | 0,67 | +0,00 |

LightGBM solo obtuvo el menor error de test, pero el ensemble fue el modelo seleccionado sobre las temporadas de validación antes de ver las de test. Los tests de Diebold-Mariano ajustados por Holm sobre las ocho temporadas de test no resultaron significativos. Ridge falló gravemente en algunas temporadas, lo que el análisis posterior atribuyó a la elección de penalización por leave-one-out fila a fila (sección 5.8 del artículo). Cobertura de los intervalos conformales al 80%: 78,3% global, con mínimo del 40% en la temporada 2018.

## Requisitos de hardware

- Inferencia en CPU: LightGBM con 400 árboles y 63 hojas por árbol, más una regresión Ridge de 81 coeficientes, se ejecuta en milisegundos por lote de 200 distritos en cualquier CPU moderna.
- VRAM: no requiere GPU; 0 GB de VRAM para inferencia.
- GPU recomendadas: no aplica. Cualquier GPU es innecesaria; el cuello de botella es la construcción de características, no la inferencia.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y entornos sin acelerador.
- Despliegue: carga directa mediante `predict.py` incluido en el repositorio de Hugging Face; también es posible serializar el booster de LightGBM con las librerías habituales (`lightgbm`, `scikit-learn`, `pandas`). No aplica a vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput: no disponibles de forma explícita; por la naturaleza del modelo (dos predictores simples sobre 81 columnas) se espera un coste despreciable frente a la ingesta y el preprocesado de datos.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Contexto | Métrica de referencia (RMSE, kg/rai) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ensemble LightGBM + Ridge (este modelo) | Ensemble árboles + lineal | 81 características tabulares | no aplica | 29,9 | MIT | Hugging Face |
| LightGBM solo (`lightgbm.txt`, mismo repo) | Gradient boosting | 81 características tabulares | no aplica | 27,4 | MIT | Hugging Face |
| Ridge solo (`ridge.json`, mismo repo) | Regresión lineal regularizada | 81 características tabulares | no aplica | 37,9 | MIT | Hugging Face |
| Climatología (media de 3 temporadas previas) | Baseline estadístico | Historial de rendimiento | no aplica | 47,1 | no aplica | Referencia del artículo |

No se dispone de información sobre otros modelos comparables de previsión de rendimiento de arroz a nivel de distrito con datos sintéticos publicados en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos: los pesos publicados no son previsiones de rendimientos reales de arroz tailandés y no deben usarse como tales. Para prever rendimientos reales hay que reconstruir las características con datos reales y reentrenar con el código del repositorio.
- Ridge mostró fallos graves en algunas temporadas de test, atribuidos a la elección de penalización por leave-one-out fila a fila. El propio autor recomienda usar LightGBM solo si se necesita robustez, ya que `predict.py` devuelve cada componente por separado.
- Los tests de Diebold-Mariano ajustados por Holm no fueron significativos: las diferencias entre ensemble, LightGBM y Ridge no son concluyentes estadísticamente sobre ocho temporadas.
- Cobertura de los intervalos conformales al 80% del 78,3% global, pero con un mínimo del 40% en la temporada 2018: la calibración de la incertidumbre no es homogénea entre temporadas.
- El ámbito geográfico se limita a la simulación del noreste de Tailandia (200 distritos, temporadas 2011-2025); no hay evidencia de transferibilidad a otras regiones o cultivos.
- El modelo no procesa texto, imágenes ni audio; no tiene capacidades de razonamiento, tool calling ni agentes. Es estrictamente un regresor tabular.
- Licencia MIT: permite uso comercial y modificación, pero al tratarse de pesos entrenados sobre datos sintéticos, cualquier uso en producción requiere reentrenamiento con datos reales y validación independiente.
- Las métricas publicadas están marcadas como no verificadas (`verified: false`) en el model-index; proceden del autor y no han sido replicadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thanatchon36/isan-rice-yield-benchmark
- Dataset del benchmark: https://huggingface.co/datasets/thanatchon36/isan-rice-yield-benchmark
- Artículo (preprint): https://thanatchon36.github.io/isan-rice-yield-benchmark/paper/
- Repositorio de código: https://github.com/thanatchon36/isan-rice-yield-benchmark
- DOI Zenodo: https://doi.org/10.5281/zenodo.24036674
