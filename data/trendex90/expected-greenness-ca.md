# TrendeX90/expected-greenness-ca

## Resumen

TrendeX expected greenness, Central Asia (v2-ca) es un modelo de regresión tabular basado en XGBoost que predice la anomalía estival de NDVI (índice de vegetación por diferencia normalizada) en celdas de pasto de 1 km en cinco países de Asia Central: Kazajistán, Kirguistán, Tayikistán, Turkmenistán y Uzbekistán. Lo desarrolla el usuario TrendeX90 y se publica bajo licencia "other" en Hugging Face. El modelo estima la "verdosidad esperada" a partir exclusivamente de variables meteorológicas (precipitación IMERG, temperatura del aire, humedad del suelo y nieve de GLDAS) y de terreno, de modo que la diferencia entre la predicción y el NDVI observado representa la parte de la variación no explicada por el clima.

La relevancia práctica del modelo es que separa la señal climática de la señal no climática en el seguimiento de pastos: no es un modelo causal ni mide calidad forrajera, sino que cuantifica qué parte de la evolución de la vegetación no se explica por el tiempo atmosférico. El protocolo de evaluación se fijó en git antes del ajuste (`model_v2_ca.yaml`, commit 1bc6ed3), lo que aporta trazabilidad metodológica. Es la versión regional del piloto de Naryn (v1, TrendeX90/expected-greenness).

El modelo se distribuye como artefacto XGBoost para inferencia en CPU, con un repositorio de 0,7 GB, y se acompaña de un esquema de características (`feature_schema.json`) y de un cargador Python (`predict_ca.load`). No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (gradient boosting sobre árboles de decisión, regresión tabular) |
| Parametros totales | no disponible (el repositorio ocupa 0,7 GB; no se publica el número de árboles ni de nodos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular con columnas definidas en `feature_schema.json`) |
| Tipos de cuantizacion | no disponible (modelo XGBoost nativo, no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | other |
| Formato de pesos | artefacto XGBoost cargado con `predict_ca.load` (librería `xgboost`); no se especifica si es JSON, UBJ o binario legacy |

## Arquitectura y entrenamiento

El modelo es un ensamblado de gradient boosting (XGBoost) sobre datos tabulares. La variable objetivo es la anomalía de NDVI estival (mayo-septiembre) de celdas de pasto de 1 km, derivada de MOD13A3.061 con máscara de pastos MCD12Q1.061 de 2020 y elevación de NASADEM_HGT.001. Las predictoras son únicamente meteorológicas y de terreno: precipitación de GPM_3IMERGM.07 (IMERG), y temperatura del aire, humedad del suelo y nieve de GLDAS_NOAH025_M.2.1, además de variables topográficas. La separación entre clima y no-clima es el núcleo del diseño: el residuo frente al NDVI observado es la parte no explicada por la meteorología.

El entrenamiento se realizó sobre 150.000 celdas muestreadas de un total de 3.432.538 elegibles, limitado por presupuesto, con un ajuste de hiperparámetros de 20 trials y 3 semillas. El protocolo de validación se bloqueó en git antes del ajuste, con dos pruebas: temporal (2020-2025) y espacial (super-bloques no vistos). Se aplicó una compuerta pre-registrada que exigía que el límite inferior del intervalo de confianza de la habilidad frente a ridge fuese mayor que cero en ambas pruebas; la compuerta se superó y se publicó la variante XGBoost. No se documenta uso de RLHF, DPO ni técnicas de decodificación, por no tratarse de un modelo generativo.

## Capacidades

- Predicción de la anomalía de NDVI estival (mayo-septiembre) en celdas de pasto de 1 km a partir de variables meteorológicas y de terreno.
- Regresión tabular supervisada con XGBoost; entrada en DataFrame de pandas con columnas según `feature_schema.json`.
- Cuantificación de la brecha entre NDVI observado y NDVI esperado por clima, es decir, la parte no explicada por la meteorología.
- Intervalos de predicción empíricos: cobertura P10-P90 del 76 % en 2020-2025 (nominal 80 %).
- Inferencia en CPU mediante el cargador `predict_ca.load(".")`; dependencias numpy, pandas y xgboost.
- Cobertura geográfica: Kazajistán, Kirguistán, Tayikistán, Turkmenistán y Uzbekistán.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Seguimiento de pastos a escala regional: el modelo calcula el NDVI esperado por clima para cada celda de 1 km y el analista compara con el observado para detectar zonas donde la vegetación se desvía de lo que la meteorología permitiría, con resolución espacial de 1 km y cobertura en cinco países.
- Alertas tempranas de degradación no climática: al aislar la componente no explicada por lluvia, temperatura, humedad del suelo y nieve, los residuos negativos persistentes pueden señalar sobrepastoreo u otras presiones, y los positivos, recuperaciones no atribuibles al tiempo.
- Planificación de pastoreo estacional: con predicciones para mayo-septiembre, los gestores pueden estimar la verdosidad esperada antes de la temporada y ajustar la carga ganadera, usando la incertidumbre P10-P90 (cobertura del 76 %) para dimensionar el riesgo.
- Investigación agroclimática: el modelo sirve como línea base meteorológica contra la que contrastar hipótesis sobre factores no climáticos, con métricas de referencia publicadas (RMSE 0,0530 temporal y 0,0483 espacial) y comparación frente a ridge y climatología.
- Validación de pipelines de teledetección: al integrar MODIS, IMERG y GLDAS en un artefacto reproducible con protocolo bloqueado en git, el modelo sirve para verificar la coherencia de cadenas de procesamiento de datos satelitales antes de escalar a otras regiones.
- Reproducción metodológica: el piloto de Naryn (v1) y esta versión regional permiten replicar el enfoque clima-versus-no-clima en nuevos territorios, reutilizando el esquema de características y el cargador de inferencia en CPU.

## Benchmarks y rendimiento

| Test | RMSE xgb | RMSE ridge | RMSE climatologia | Correlacion de anomalia xgb |
|---|---|---|---|---|
| Temporal (2020-2025) | 0,0530 | 0,0546 | 0,0613 | 0,510 |
| Espacial (super-bloques no vistos) | 0,0483 | 0,0515 | 0,0592 | 0,578 |

- Habilidad frente a ridge: 0,055 temporal (IC 95 %: 0,036 a 0,077; 6 unidades) y 0,120 espacial (IC 95 %: 0,117 a 0,123; 4115 unidades).
- Habilidad frente a climatología: 0,251 temporal (IC 95 %: 0,174 a 0,321; 6 unidades).
- Variabilidad entre semillas (3): 0,053 ± 0,001.
- Compuerta pre-registrada (límite inferior del IC > 0 en ambas pruebas): superada; se publica la variante XGBoost.
- Cobertura P10-P90 en 2020-2025: 76 % (nominal 80 %).

## Requisitos de hardware

- Inferencia en CPU: el modelo se carga y predice con numpy, pandas y xgboost, sin requisito de GPU documentado.
- VRAM estimada: no disponible; al ser un modelo de árboles, la inferencia no requiere GPU.
- GPU recomendadas: no aplica; no se documenta aceleración por GPU ni su conveniencia.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,7 GB y el cargador declara CPU explícitamente.
- Opciones de despliegue: script Python con `predict_ca.load(".")`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Contexto de entrada | Rendimiento publicado | Licencia |
|---|---|---|---|---|---|
| TrendeX expected-greenness-ca (v2-ca) | XGBoost tabular | Asia Central (5 países), celdas de 1 km | Variables meteorológicas y de terreno | RMSE 0,0530 temporal / 0,0483 espacial | other |
| TrendeX expected-greenness (v1, Naryn) | XGBoost tabular | Piloto de Naryn | Variables meteorológicas y de terreno | no disponible en la información proporcionada | other |
| Ridge (línea base del propio estudio) | Regresión lineal | Asia Central | Mismas variables | RMSE 0,0546 temporal / 0,0515 espacial | no aplica |
| Climatología (línea base del propio estudio) | Media histórica | Asia Central | Ninguna | RMSE 0,0613 temporal / 0,0592 espacial | no aplica |

No se dispone de información sobre otros modelos comparables de terceros para esta tarea concreta.

## Limitaciones y advertencias

- Entrenado sobre 150.000 celdas muestreadas de 3.432.538 elegibles por restricción de presupuesto; el muestreo puede no representar toda la heterogeneidad regional.
- GLDAS tiene resolución de 0,25 grados, lo que resulta grueso frente a la celda de 1 km del objetivo y puede introducir desajuste de escala.
- La máscara de pastos es la de MCD12Q1 de 2020; cambios de uso del suelo posteriores no se reflejan.
- El NDVI mide verdosidad, no calidad ni cantidad de forraje; no debe interpretarse como valor nutricional del pasto.
- No hay validación de campo: las conclusiones se apoyan en datos satelitales y en las líneas base ridge y climatología.
- La prueba espacial comparte años con el entrenamiento y es más fácil que la temporal; los resultados espaciales no deben leerse como generalización temporal completa.
- El ajuste de hiperparámetros se limitó a 20 trials y 3 semillas; no se exploró un espacio amplio de configuración.
- La brecha frente al NDVI observado no es una relación causal ni identifica la causa de la desviación; solo indica que no se explica por las variables meteorológicas incluidas.
- La cobertura de los intervalos P10-P90 es del 76 % frente al 80 % nominal, por lo que la incertidumbre está ligeramente subestimada.
- Licencia "other": deben revisarse los términos concretos antes de cualquier uso comercial; no se documentan permisos explícitos.
- El desarrollo contó con asistencia de IA (Claude, Anthropic) en la implementación, según declara el autor.
- El modelo no es lingüístico: no admite prompts, tool calling ni agentes; cualquier uso debe plantearse como regresión tabular por lotes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TrendeX90/expected-greenness-ca
- Modelo piloto v1 (Naryn): https://huggingface.co/TrendeX90/expected-greenness
- Dataset asociado: https://huggingface.co/datasets/TrendeX90/ca-cube
- MOD13A3.061 (NDVI, LP DAAC): https://lpdaac.usgs.gov/products/mod13a3v061/
- MCD12Q1.061 (tipo de cobertura, LP DAAC): https://lpdaac.usgs.gov/products/mcd12q1v061/
- NASADEM_HGT.001 (elevación, LP DAAC): https://lpdaac.usgs.gov/products/nasadem_hgtv001/
- GPM_3IMERGM.07 (precipitación, GES DISC): https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGM_07/summary
- GLDAS_NOAH025_M.2.1 (GES DISC): https://disc.gsfc.nasa.gov/datasets/GLDAS_NOAH025_M_2.1/summary
