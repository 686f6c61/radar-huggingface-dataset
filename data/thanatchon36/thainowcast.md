# thanatchon36/thainowcast

## Resumen

`thainowcast` no es un modelo de aprendizaje profundo al uso, sino un repositorio de especificaciones de un conjunto de modelos estadísticos y de machine learning para el *nowcasting* (estimación en tiempo real) del PIB y la inflación de Tailandia. Lo desarrolla Thanatchon Chongmankhong como investigación personal independiente, y acompaña al artículo de trabajo *ThaiNowcast: Pseudo-Real-Time Nowcasting of Thai GDP and Inflation with Official and Alternative Data*. El repositorio no contiene pesos entrenados: cada modelo se reestima desde cero en cada origen de predicción con los datos publicados hasta esa fecha, por lo que congelar los pesos no tendría sentido.

El paquete cubre seis familias de modelos (random walk, AR, bridge equations, MIDAS, factor dinámico de frecuencias mixtas y dos modelos de ML: Elastic Net y LightGBM) sobre distintos conjuntos de features que combinan datos oficiales con fuentes alternativas (Google Trends, luces nocturnas, NO2 de Sentinel-5P, precios online y movilidad). Se distribuye como librería de Python sobre `scikit-learn` y `statsmodels`, con licencia MIT.

Es relevante para quien trabaje en nowcasting macroeconómico porque documenta de forma reproducible la rejilla completa modelo × conjunto de features, el registro de indicadores con sus retardos de publicación y la metodología de backtest pseudo-real-time. Advertencia importante: todas las cifras de rendimiento que publica el autor provienen de datos sintéticos y no dicen nada sobre la economía tailandesa real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de modelos estadísticos y de ML: RandomWalk, AR(p), Bridge, MIDAS, DFM (statsmodels `DynamicFactorMQ`), ElasticNetCV y LightGBM |
| Parametros totales | No aplica (modelos estadísticos y de árboles; no hay pesos neuronales) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (series temporales; ventana de backtest GDP 2015Q1–2026Q2, CPI 2015-01–2026-09) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | en, th (documentación y metadatos; los modelos operan sobre series numéricas) |
| Licencia | MIT |
| Formato de pesos | No hay pesos; se distribuyen `model_specs.json`, `config/indicators.yaml` y `live_nowcast.json` (sintético) |

## Arquitectura y entrenamiento

El repositorio no entrena una red neuronal, sino que define una rejilla de modelos clásicos de nowcasting macroeconómico. `RandomWalk` toma el último valor publicado; `AR(p)` selecciona el orden p ≤ 4 por AIC; `Bridge` completa los indicadores hasta el final del periodo objetivo con pronósticos AR(1), los agrega a la frecuencia del target, extrae 2 componentes principales y ajusta por OLS; `MIDAS` usa un único regresor (media de indicadores estandarizados) con 12 retardos mensuales y pesos de Almon exponenciales reestimados para cada número de meses faltantes (solo PIB); `DFM` es un factor dinámico de frecuencias mixtas con 1 factor AR(1), EM hasta 50 iteraciones y reestimación anual, que además produce la descomposición de noticias; `ElasticNetNowcast` usa `ElasticNetCV` con l1 ratio en {0.1, 0.5, 0.9}, 40 alfas y validación cruzada temporal de hasta 4 folds; `LightGBMNowcast` usa 300 árboles, learning rate 0.03, 4 hojas, mínimo 5 muestras por hoja, subsampling de filas y columnas de 0.8, L2 de 1.0 y modo determinista.

Los conjuntos de features son `hard_only` (14 estadísticas mensuales oficiales), `hard_trends`, `hard_lights`, `hard_no2`, `hard_prices` (datos duros más una familia alternativa), `all` (datos duros más las cinco familias, movilidad incluida) y `none` para los benchmarks univariantes. El PIB evalúa 20 pares modelo × feature-set y el IPC 22. Los intervalos del 80 % se construyen como cuantil conformal del error absoluto de backtest en el mismo origen. No hay RLHF ni DPO: el "entrenamiento" es la reestimación por origen de predicción con los datos disponibles en esa fecha (configuración pseudo-real-time).

## Capacidades

- Nowcasting del crecimiento real del PIB interanual (`gdp_yoy`, NESDC) en orígenes M1, M2, M3 y PR (día previo a la publicación oficial).
- Nowcasting de la inflación general del IPC interanual (`cpi_yoy`, TPSO) en orígenes M0 (mediados de mes) y PR.
- Modelos univariantes de referencia (random walk, AR) para comparación.
- Modelos con datos alternativos: Google Trends, luces nocturnas, NO2 de Sentinel-5P, precios online y movilidad.
- Descomposición de noticias (*news decomposition*) del PIB mediante el factor dinámico.
- Intervalos de predicción al 80 % por cuantiles conformales de errores de backtest.
- Gestión explícita del calendario de publicación y de los retardos de cada indicador (registro en `config/indicators.yaml`).
- Backtest pseudo-real-time reproducible con rejilla modelo × feature-set.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un pipeline de series temporales.

## Casos de uso

- **Nowcasting del PIB trimestral para análisis macro:** ejecutar `make all ASOF=YYYY-MM-DD` con los CSV oficiales en `data/raw/` para obtener una estimación del PIB del trimestre en curso antes de la publicación de NESDC, usando `enet` sobre `hard_only` como referencia y `dfm` para la descomposición de noticias.
- **Seguimiento de la inflación mensual:** usar el origen M0 (mediados de mes) con `enet` sobre `all` para anticipar el dato de IPC de TPSO antes de su publicación, aprovechando precios online como familia alternativa.
- **Análisis del valor añadido de fuentes alternativas:** comparar el RMSFE relativo a AR entre `hard_only` y `all` para cada modelo y decidir qué familia de datos alternativos aporta información en un contexto concreto (luces nocturnas, NO2, tendencias de búsqueda).
- **Investigación académica en nowcasting:** reproducir el backtest completo (46 trimestres para PIB, 141 meses para IPC) con la rejilla documentada en `model_specs.json` y aplicar tests de Diebold-Mariano y cortes por régimen incluidos en el dataset de resultados.
- **Prototipado de un sistema de alerta temprana:** integrar el pipeline en un flujo programado que se reestime en cada origen de predicción y emita la predicción puntual y el intervalo conformal al 80 % para detectar desviaciones respecto al consenso.
- **Docencia y formación en métodos de nowcasting:** el repositorio sirve como implementación de referencia de bridge equations, MIDAS y factor dinámico de frecuencias mixtas con datos oficiales y alternativos, con configuración declarativa en YAML.
- **Evaluación de modelos de ML frente a métodos estadísticos:** comparar LightGBM y Elastic Net contra AR, bridge y DFM en el mismo esquema de backtest pseudo-real-time, con hiperparámetros fijados y reproducibles.

## Benchmarks y rendimiento

Las únicas cifras publicadas son RMSFE relativo al benchmark AR (por debajo de 1 mejora a AR) sobre **datos sintéticos**, en el último origen (PR) del backtest completo. No reflejan el rendimiento sobre la economía tailandesa real.

| Modelo | PIB `hard_only` | PIB `all` | IPC `hard_only` | IPC `all` |
|---|---|---|---|---|
| `enet` | **0,46** | 0,78 | 0,68 | **0,54** |
| `bridge` | 0,55 | 0,66 | 1,45 | 1,29 |
| `dfm` | 0,64 | 0,89 | 0,92 | 0,92 |
| `midas` | 0,64 | 0,66 | – | – |
| `lgbm` | 0,73 | 0,72 | 0,72 | 0,60 |
| `rw` | 1,04 | – | 1,02 | – |

Cobertura del backtest: PIB de 2015Q1 a 2026Q2 (46 trimestres), IPC de 2015-01 a 2026-09 (141 meses). El propio autor advierte que el generador sintético fija cuánto ayuda cada familia de datos, por lo que el ranking no informa sobre Tailandia. Las tablas completas, tests de Diebold-Mariano, cortes por régimen y ablaciones están en el dataset `thanatchon36/thainowcast`, carpeta `results`.

## Requisitos de hardware

- No requiere GPU: los modelos son OLS, componentes principales, `DynamicFactorMQ`, `ElasticNetCV` y LightGBM sobre paneles de decenas de series.
- CPU suficiente para reestimar la rejilla completa (20 pares para PIB, 22 para IPC) en cada origen de predicción; el coste dominante es el bucle de backtest sobre 46 trimestres y 141 meses, no la inferencia individual.
- Memoria RAM: el panel de indicadores y features es pequeño (decenas de series mensuales); no se han publicado requisitos concretos de memoria.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; el pipeline se ejecuta con `make setup` (uv venv + `pip install -e ".[dev,app]"`) y `make all`, con dashboard y generación del paper incluidos en el flujo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han publicado comparaciones con otros paquetes de nowcasting en la información disponible. La comparativa interna del propio repositorio es la de sus seis familias de modelos frente al benchmark AR, recogida en la tabla de benchmarks sobre datos sintéticos. Como alternativas metodológicas del mismo ámbito (no evaluadas en este repositorio) cabría citar implementaciones de bridge equations y factor dinámico en `statsmodels` y paquetes de nowcasting macroeconómico, pero no hay datos comparativos publicados aquí.

## Limitaciones y advertencias

- El repositorio **no contiene pesos entrenados**; no es un modelo descargable en el sentido habitual, sino especificaciones y código de un pipeline.
- Todas las cifras de rendimiento provienen de **datos sintéticos** y no indican capacidad predictiva sobre la economía tailandesa real.
- El nowcast real exige disponer de los CSV oficiales descritos en `docs/data_sources.md`; en su ausencia el pipeline usa ficheros `synthetic_*` con una advertencia, lo que invalida cualquier conclusión sustantiva.
- Dependencia del calendario de publicación y de los retardos de cada indicador: un error en `config/indicators.yaml` o en la fecha `ASOF` contamina la reestimación.
- Los intervalos al 80 % son cuantiles conformales de errores de backtest; su cobertura empírica en producción no está validada.
- El modelo DFM se reestima solo una vez al año, lo que puede introducir desfase respecto a cambios estructurales.
- MIDAS solo está disponible para el PIB, no para el IPC.
- Licencia MIT, que permite uso comercial y modificación, pero sin garantías; el autor declara que es investigación personal independiente y no representa a ningún empleador ni institución.
- Sesgos y alucinaciones en el sentido de los LLM no aplican; el riesgo relevante es el sobreajuste a la rejilla de features y la fragilidad ante revisiones de datos oficiales.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/thanatchon36/thainowcast
- Hugging Face (dataset y resultados): https://huggingface.co/datasets/thanatchon36/thainowcast
- Resultados completos: https://huggingface.co/datasets/thanatchon36/thainowcast/tree/main/results
- Código: https://github.com/thanatchon36/thainowcast
- Paper (online): https://thanatchon36.github.io/thainowcast/paper/
- Paper (PDF): https://github.com/thanatchon36/thainowcast/raw/main/paper/paper.pdf
- DOI: https://doi.org/10.5281/zenodo.23995547
- Fuentes de datos: https://github.com/thanatchon36/thainowcast/blob/main/docs/data_sources.md
