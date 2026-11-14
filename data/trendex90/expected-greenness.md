# TrendeX90/expected-greenness

## Resumen

TrendeX expected-greenness es un modelo de regresion tabular basado en XGBoost que predice la anomalia de verdor estival (NDVI) de cada celda de pasto de 1 km en la oblast de Naryn (Kirguistan) para el periodo mayo-septiembre, a partir unicamente de variables meteorologicas y de terreno. Lo desarrolla el usuario TrendeX90 en el marco del hackathon NASA Space Apps 2026, bajo el reto "Be An Earth System Trend Detective!". El modelo no es una red neuronal ni un modelo de lenguaje: es un ensemble de arboles gradient boosted entrenado sobre un cubo de datos geoespaciales propio (`TrendeX90/naryn-cube`) que combina productos NASA (MODIS, IMERG, GLDAS, NASADEM).

El problema que resuelve es la separacion entre la parte de la variacion interanual del NDVI explicada por el clima y la parte que no lo esta. La diferencia entre el NDVI observado y el esperado segun meteorologia y terreno se interpreta como cambio no atribuible a precipitacion, temperatura, nieve o humedad del suelo. El autor advierte explicitamente de que esa brecha no es una relacion causal ni dice nada sobre la calidad del forraje.

Su relevancia es metodologica: el modelo se presenta con un protocolo de evaluacion pre-registrado en git (commit 92ed159) antes del primer ajuste, con separacion temporal (entrenamiento 2001-2015, validacion 2016-2019, test unico 2020-2025) y espacial (GroupKFold sobre superbloques de ~30 x 30 km), y con una puerta de publicacion que exige que el limite inferior del IC al 95 % de la habilidad frente a ridge sea mayor que cero. La puerta se supero y se publico el modelo XGBoost.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosted trees (XGBoost) sobre features tabulares geoespaciales |
| Parametros totales | no disponible (no se documenta el numero de arboles ni de hojas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; una fila por celda-mes) |
| Tipos de cuantizacion | no aplica (inferencia en CPU con xgboost; sin cuantizacion documentada) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | other (sin detalle de terminos en la informacion disponible) |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga mediante `predict.load(".")`) |

## Arquitectura y entrenamiento

El modelo es un regresor XGBoost entrenado sobre features tabulares derivadas de productos de observacion de la Tierra. Las entradas son anomalias meteorologicas respecto a la media 2001-2025 de cada celda para el mismo mes: precipitacion GPM IMERG (mensual, a 3 meses y octubre-abril), LST diurna y nocturna de MODIS (mes y mes anterior), nieve MODIS (marzo-mayo y mensual), humedad del suelo GLDAS y equivalente en agua de nieve de abril. A ello se anaden variables de terreno de NASADEM (elevacion, dispersion, pendiente, proporcion de pendiente pronunciada, orientacion, TPI), cobertura del suelo MCD12Q1 de 2020 y la climatologia de NDVI de la propia celda para ese mes. Se excluyen deliberadamente el ano, las coordenadas y el NDVI pasado.

El ajuste de hiperparametros se hizo solo sobre 2001-2015 frente a 2016-2019, y los anos 2020-2025 se usaron una unica vez para el test final. Se compararon tres alternativas: climatologia (anomalia = 0), regresion ridge sobre las mismas features y XGBoost. La puerta pre-registrada exigia que el limite inferior del IC al 95 % de la habilidad de XGBoost sobre ridge fuese positivo en ambos tests; se cumplio y se publico XGBoost. El analisis de ablacion muestra que la precipitacion sola aporta una habilidad de 0,055 frente a climatologia, que sube a 0,167 al anadir LST, a 0,181 con nieve y a 0,188 con GLDAS completo. Las variables mas utilizadas son `lst_day_m`, `lst_day_prev`, `precip_3m`, `lst_night_m`, `soil_m` y `month`. El entrenamiento se hizo con Optuna y scikit-learn; la implementacion conto con asistencia de Claude (Anthropic), segun declara el autor.

## Capacidades

- Prediccion de la anomalia de NDVI estival (mayo-septiembre) por celda de 1 km en Naryn, Kirguistan, a partir de meteorologia y terreno.
- Regresion tabular con incertidumbre: proporciona una banda P10-P90, aunque el propio autor advierte de que es demasiado estrecha (cobertura del 74 % frente al 80 % nominal en 2020-2025).
- Analisis what-if: permite modificar escenarios (por ejemplo, `precip_pct=-30` en julio) y obtener la sensibilidad del modelo, no efectos causales.
- Evaluacion de habilidad frente a baselines (climatologia y ridge) con intervalos de confianza y multiples semillas.
- Inferencia en CPU con solo numpy, pandas y xgboost.
- Pruebas de regresion reproducibles mediante `pytest test_golden.py` sobre 100 filas doradas.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un modelo tabular de un unico dominio.

## Casos de uso

- Monitorizacion de la degradacion de pastos en Naryn: comparar el NDVI observado con el esperado segun clima y terreno para identificar celdas donde el verdor cae mas de lo que explicaria la meteorologia, como senal de alerta temprana para gestores de pastizales.
- Analisis de tendencias para el reto NASA Space Apps: generar mapas de la brecha clima-verdor para 2001-2025 y presentarlos como producto de ciencia ciudadana reproducible.
- Planificacion ganadera estacional: usar la prediccion de verdor esperado por celda y mes para estimar disponibilidad relativa de pasto en zonas sin datos de campo, con la cautela de que NDVI no equivale a forraje.
- Estudios de atribucion climatica regional: cuantificar que parte de la variacion interanual del NDVI se explica por precipitacion, LST, nieve y humedad del suelo, usando la ablacion por dataset que documenta el autor.
- Analisis de sensibilidad what-if: explorar como cambia el NDVI esperado de julio bajo condiciones mas secas o mas calidas que la media, util para escenarios de adaptacion (sin interpretarlo como causalidad).
- Validacion metodologica de pipelines geoespaciales: reutilizar el protocolo pre-registrado, la separacion temporal y espacial y las pruebas doradas como plantilla para otros productos de regresion ambiental.
- Docencia y reproduccion cientifica: el modelo y su dataset asociado sirven como ejemplo completo de un flujo NASA earthaccess -> features -> XGBoost -> evaluacion con intervalos de confianza.

## Benchmarks y rendimiento

| Test | RMSE xgb | RMSE ridge | RMSE climatologia | Corr. anomalia xgb | Corr. anomalia ridge | Precision balanceada por terciles xgb |
|---|---|---|---|---|---|---|
| Temporal (2020-2025) | 0,0554 | 0,0588 | 0,0616 | 0,424 | 0,288 | 0,455 |
| Espacial (zonas no vistas) | 0,0523 | 0,0578 | 0,0619 | 0,540 | 0,358 | 0,524 |

Habilidad frente a ridge: 0,113 en el test temporal (IC 95 % 0,089-0,133, 6 unidades) y 0,180 en el espacial (IC 95 % 0,169-0,192, 76 unidades). Con cinco semillas, la habilidad temporal es 0,110 +/- 0,003. Habilidad frente a climatologia en el test temporal: 0,191 (IC 95 % 0,160-0,215).

## Requisitos de hardware

- Inferencia en CPU: el autor indica que solo se necesitan numpy, pandas y xgboost; no se requiere GPU.
- VRAM estimada: no aplica; el modelo se ejecuta en memoria principal y el repo ocupa 0,0 GB.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer: si, al ser un modelo tabular de XGBoost en CPU.
- Opciones de despliegue: el propio paquete `predict.py` (`load(".")` y `predict(features_df)`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Habilidad documentada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TrendeX expected-greenness | XGBoost tabular | no disponible | no aplica | Skill vs ridge 0,113 (temporal) y 0,180 (espacial) | other | Hugging Face |
| Ridge (baseline del propio autor) | Regresion lineal | no aplica | no aplica | Referencia; RMSE 0,0588 (temporal) | no disponible | Incluido en la evaluacion |
| Climatologia (anomalia = 0) | Baseline trivial | no aplica | no aplica | Referencia; RMSE 0,0616 (temporal) | no disponible | Incluido en la evaluacion |

No se dispone de informacion sobre otros modelos publicos comparables de prediccion de anomalia de NDVI en la misma region y con el mismo protocolo de evaluacion.

## Limitaciones y advertencias

- El modelo explica aproximadamente un quinto de la anomalia interanual de NDVI en anos no vistos; la mayor parte de la variacion no es explicable por meteorologia.
- La banda P10-P90 es demasiado estrecha: cubre el 74 % de los casos en 2020-2025 frente al 80 % nominal.
- Los datos meteorologicos provienen de rejillas gruesas (IMERG 0,1 grados, GLDAS 0,25 grados) interpoladas a 1 km, lo que introduce error de escala.
- NDVI mide verdor, no forraje: la expansion de arbustos puede parecer una mejora.
- La cobertura del suelo es un mapa fijo de 2020 y MODIS Terra presento deriva en los ultimos anos (el autor remite a la comprobacion Aqua-Terra del dataset).
- Los resultados what-if son sensibilidades del modelo, no efectos causales: condiciones mas secas y calidas reducen el NDVI esperado de julio, pero precipitacion mas humeda de lo normal no lo aumenta (incluso lo baja ligeramente de media).
- No hay validacion de campo y el modelo es relativo solo a los pastos de Naryn.
- Licencia "other" sin terminos detallados en la informacion disponible: conviene revisar las condiciones antes de un uso comercial.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y no tiene capacidades multilingues.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe riesgo de extrapolacion fuera del dominio de entrenamiento (otras regiones, otros periodos o celdas con condiciones no vistas).

## Enlaces

- Hugging Face: https://huggingface.co/TrendeX90/expected-greenness
- Dataset asociado: https://huggingface.co/datasets/TrendeX90/naryn-cube
- NASA Space Apps 2026, reto "Be An Earth System Trend Detective!": no disponible (no se proporciona URL en la informacion)
- Productos de datos citados: MOD13A3.061, MYD13A3.061, MOD11A2.061, MOD10A2.061, MCD12Q1.061, NASADEM_HGT.001 (LP DAAC / NSIDC via earthaccess), GPM_3IMERGM.07 y GLDAS_NOAH025_M.2.1 (GES DISC); no se proporcionan URLs directas en la informacion.
- Repositorio de codigo (`predict.py`, `model_v1.yaml`, `test_golden.py`): no disponible (no se proporciona URL en la informacion).
