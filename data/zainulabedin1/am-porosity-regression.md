# Zainulabedin1/am-porosity-regression

## Resumen

`am-porosity-regression` es un modelo de regresión tabular publicado en HuggingFace por el usuario Zainulabedin1 que predice la porosidad volumétrica (en %) de piezas fabricadas por fusión selectiva por láser en lecho de polvo (LPBF, *laser powder bed fusion*) a partir de los parámetros del proceso. No es un modelo de lenguaje ni una red neuronal: es un `HistGradientBoostingRegressor` de scikit-learn encapsulado en un `Pipeline` con codificación one-hot, distribuido como artefacto `joblib`. El problema que aborda es acotado pero real en fabricación aditiva: estimar la densidad relativa esperada antes de ejecutar una campaña experimental, para explorar ventanas de proceso.

El modelo se entrena con 1.579 experimentos de LPBF recopilados de 85 artículos revisados por pares y publicados en Harvard Dataverse (DOI 10.7910/DVN/VPBQK8), con seis aleaciones comerciales (316L, AlSi10Mg, 18Ni300, IN718, Ti6Al4V, CuCrZr). La entrada son siete parámetros numéricos de proceso y polvo más la densidad de energía volumétrica derivada y variables categóricas de aleación y atmósfera. Su relevancia es doble: por un lado, demuestra que un modelo de boosting bien ajustado supera claramente a una regresión lineal en esta relación (R² 0,734 frente a 0,149); por otro, ilustra el patrón no monotónico entre densidad de energía y porosidad, en forma de U, que rompe los ajustes lineales habituales.

La ficha se basa exclusivamente en la model card y en los metadatos de HuggingFace. La búsqueda web asociada no devolvió resultados pertinentes (solo listados de ropa), por lo que no se han podido verificar datos externos, licencia ni adopción más allá de las 14 descargas y 0 likes registrados en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de gradient boosting sobre árboles de decisión: `HistGradientBoostingRegressor` de scikit-learn dentro de un `Pipeline` (codificación one-hot; sin escalado, innecesario para árboles) |
| Parametros totales | No disponible como recuento de pesos; el modelo es un ensemble de hasta 600 iteraciones con un máximo de 31 hojas por árbol y `min_samples_leaf=20` (registro completo en `config.json`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo tabular con 7 variables numéricas de proceso/polvo, densidad de energía volumétrica derivada y one-hot de aleación (6) y atmósfera (3) |
| Tipos de cuantizacion | No aplica; el artefacto se distribuye como `model.joblib` en coma flotante |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | `joblib` (scikit-learn), acompañado de `config.json` y del módulo `model.py` con las funciones `load_model` y `predict_porosity` |

## Arquitectura y entrenamiento

La arquitectura es un gradient boosting con *histogram-based splitting* (`HistGradientBoostingRegressor`), con `max_iter=600`, `learning_rate=0.05`, `max_leaf_nodes=31`, `min_samples_leaf=20` y `l2_regularization=1.0`, con parada temprana sobre un 10 % de validación. El preprocesado se resuelve en un `Pipeline`: codificación one-hot de aleación y atmósfera, sin escalado. El objetivo es `porosity (%) = 100 − relative density (%)`, medido por Arquímedes o análisis de imagen según la fuente original. El conjunto de datos son 1.579 experimentos de LPBF extraídos de 85 publicaciones, documentados en el dataset de La Fé-Perdomo, Barrionuevo y Ramos-Grez (Harvard Dataverse, 2024; artículo asociado en *Scientific Data*, 2025).

El ajuste se evalúa con una única partición 80/20 estratificada por aleación (semilla 42), lo que deja 316 muestras de test. La innovación técnica destacable no está en el algoritmo, sino en el tratamiento de la física: se incorpora la densidad de energía volumétrica `Ev = P/(v·h·l)` como característica derivada, lo que permite al modelo capturar la relación en U entre energía y porosidad (falta de fusión por debajo de ~40 J/mm³, poros de *keyhole* por encima de ~185 J/mm³). La correlación lineal entre `Ev` y porosidad es aproximadamente −0,05, de ahí que la regresión Ridge apenas alcance R² 0,149 mientras el boosting llega a 0,734. No se documenta uso de RLHF, DPO ni ajuste por preferencias, algo por otra parte ajeno a un modelo de regresión.

## Capacidades

- Predicción de porosidad volumétrica (%) a partir de potencia láser, velocidad de escaneo, espaciado de pistas (*hatch*), espesor de capa, tamaño de punto, D50 del polvo, aleación y atmósfera.
- Cálculo implícito de la densidad de energía volumétrica a partir de los parámetros introducidos.
- Manejo de valores ausentes en la entrada: las claves no proporcionadas se sustituyen por las medianas del entrenamiento (comportamiento definido en `config.json`), sin error explícito.
- Cobertura de seis aleaciones comerciales: 316L, AlSi10Mg, 18Ni300, IN718, Ti6Al4V y CuCrZr.
- Discriminación de tres atmósferas de proceso mediante codificación one-hot.
- Interfaz programática simple en Python (`predict_porosity(dict)`), apta para integrarse en scripts de barrido de parámetros.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un regresor tabular de una sola salida.

## Casos de uso

- Exploración de ventanas de proceso: barrido sistemático de combinaciones de potencia y velocidad para localizar las regiones con porosidad predicha baja antes de lanzar campañas experimentales, aprovechando la forma en U de la relación energía-porosidad.
- Priorización de experimentos en laboratorio: dado un presupuesto limitado de fabricaciones, usar el modelo como filtro previo para descartar combinaciones con porosidad estimada alta (por encima del RMSE de test, 2,71 %) y reservar el horno y la máquina LPBF para los candidatos prometedores.
- Transferencia entre aleaciones dentro del mismo equipo: comparar la porosidad predicha para 316L, IN718 o Ti6Al4V bajo un mismo conjunto de parámetros nominales, como primera aproximación antes de reajustar el proceso.
- Docencia y demostración de *machine learning* aplicado a fabricación: el par boosting/Ridge sobre el mismo split (R² 0,734 frente a 0,149) sirve como caso práctico de por qué los modelos lineales fallan ante relaciones no monotónicas.
- Enlace con simulación termomecánica: usar la predicción como condición de contorno o comprobación cruzada rápida de los resultados de un modelo multifísica, que es varios órdenes de magnitud más costoso por evaluación.
- Estimación de sensibilidad de parámetros: apoyarse en las importancias por permutación publicadas (energía 0,51 > potencia 0,28 > factor geométrico 0,23 > D50 0,08) para decidir qué variables calibrar con más cuidado en la máquina.
- Preprocesado de datos de trazabilidad: puntuar automáticamente registros históricos de proceso y detectar combinaciones con riesgo de baja densidad antes de inspección por tomografía.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test reservado (n=316, partición única estratificada por aleación, semilla 42):

| Modelo | R² | RMSE | MAE |
|---|---|---|---|
| HistGradientBoosting (este modelo) | 0,734 | 2,71 % | 1,44 % |
| Ridge (baseline lineal) | 0,149 | 4,85 % | 3,35 % |

Importancia por permutación en test:

| Característica | Importancia |
|---|---|
| Densidad de energía volumétrica | 0,51 |
| Potencia láser | 0,28 |
| Factor geométrico | 0,23 |
| D50 del polvo | 0,08 |
| Atmósfera | 0,08 |
| Velocidad de escaneo | 0,06 |
| Tamaño de punto | 0,05 |
| Aleación | 0,015 |
| Espesor de capa | 0,014 |
| Espaciado de pistas | 0,013 |

No se han publicado resultados de benchmarks comparables con otros modelos de la literatura sobre el mismo dataset en la información disponible, ni métricas por aleación o por régimen de energía.

## Requisitos de hardware

- Inferencia en CPU exclusivamente: al ser un ensemble de árboles de scikit-learn, no requiere GPU ni aceleradores.
- VRAM estimada: no aplica (0 GB de VRAM). El repositorio ocupa 0,0 GB y el artefacto `model.joblib` es de tamaño reducido.
- GPU recomendadas: ninguna. Cualquier CPU x86 o ARM con Python y scikit-learn es suficiente.
- Cabe en cualquier equipo *consumer*, incluidos portátiles de gama baja y entornos tipo Raspberry Pi, siempre que se instale scikit-learn y joblib.
- Opciones de despliegue: script Python con `model.py`, servicio HTTP propio (FastAPI, Flask), o exportación a otros runtimes si se reimplementan los árboles; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no publicados. Estructuralmente, cada predicción es una única pasada por el ensemble en CPU, sin coste de tokenización ni de generación autoregresiva.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | R² (test) | RMSE (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| am-porosity-regression (este) | HistGradientBoosting sobre `Pipeline` | 7 numéricas + `Ev` + categóricas | 0,734 | 2,71 % | No disponible | HuggingFace, `joblib` |
| Ridge (baseline del mismo autor) | Regresión lineal con regularización L2 | Mismas características | 0,149 | 4,85 % | No disponible | Referenciado en la model card, no distribuido |
| Alternativas sobre el mismo dataset (Random Forest, XGBoost, redes tabulares) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| Simulación multifísica LPBF | Modelo físico-numérico | Geometría y parámetros completos | No aplica | No aplica | Variable | Herramientas comerciales o de investigación |

La comparación significativa disponible es únicamente contra el baseline lineal del propio autor. El dataset original de Harvard Dataverse (1.579 experimentos) es público y podría servir para reproducir y comparar alternativas, pero este repositorio no publica tales comparaciones.

## Limitaciones y advertencias

- Datos agregados de 85 fuentes distintas: máquinas, polvos y métodos de medición heterogéneos. Las predicciones reflejan tendencias medias de la literatura; una máquina y aleación concretas se desviarán. La elevada importancia del `geometric_factor` es un indicio de esa variabilidad entre laboratorios, no una relación física estable.
- El régimen de *keyhole* (densidad de energía muy alta) está poco representado en los datos, por lo que el modelo subestima el aumento de porosidad en esa zona.
- Predicciones fuera del rango de entrenamiento son extrapolaciones de un modelo de árboles, que no extrapola más allá del rango observado por construcción.
- El RMSE de 2,71 % es un error de test agregado, no un intervalo de predicción: no debe interpretarse como incertidumbre por muestra.
- El modelo solo predice fracción volumétrica de porosidad; no aporta tamaño, morfología ni localización de los poros.
- Las claves ausentes en la entrada se sustituyen silenciosamente por medianas del entrenamiento, lo que puede producir predicciones plausibles pero incorrectas si el usuario omite un parámetro crítico.
- Sin licencia declarada: no hay autorización explícita para uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- No sustituye a la cualificación del proceso ni a la inspección por tomografía computarizada; la propia model card lo enmarca como demostración de investigación y portafolio.
- Validación limitada a un único split 80/20 (semilla 42), sin validación cruzada publicada ni métricas desagregadas por aleación; la robustez del 0,734 podría no sostenerse con otra partición.
- Adopción muy baja (14 descargas, 0 likes) y sin revisión externa conocida.

## Enlaces

- HuggingFace: https://huggingface.co/Zainulabedin1/am-porosity-regression
- Dataset en Harvard Dataverse: https://doi.org/10.7910/DVN/VPBQK8
- Descarga directa del dataset: https://dataverse.harvard.edu/api/access/datafile/10802459
- Artículo asociado (Barrionuevo et al., *Scientific Data*, 2025): https://doi.org/10.1038/s41597-025-04576-x
- Paper y repositorio adicionales: no disponibles en la información proporcionada (la búsqueda web no devolvió resultados pertinentes al modelo).
