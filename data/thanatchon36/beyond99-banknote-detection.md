# thanatchon36/beyond99-banknote-detection

## Resumen

Beyond99-banknote-detection es un conjunto de 18 detectores de billetes falsos entrenados sobre el dataset UCI Banknote Authentication, publicado por Thanatchon Chongmankhong como material reproducible del preprint *Beyond 99%: Open-Set Evaluation Reveals Silent Failures of Counterfeit Banknote Detectors, and the Case for One-Class Screening*. No es una red neuronal profunda ni un modelo de lenguaje: son clasificadores tabulares clásicos (regresión logística, k-NN, SVM, árboles, XGBoost, LightGBM, MLP) y detectores one-class (isolation forest, one-class SVM, autoencoder, Mahalanobis) empaquetados en formato joblib y consumibles desde scikit-learn.

El interés del artefacto es metodológico: el autor demuestra que en un escenario de conjunto abierto (familias de falsificaciones no vistas en entrenamiento), los ensembles de árboles supervisados que alcanzan un 99 % en validación cruzada aleatoria caen al 51-61 % de detección, mientras que un autoencoder entrenado solo con billetes genuinos mantiene un 99,98 %. El repositorio incluye los 18 bundles ya calibrados para rechazar aproximadamente un 1 % de billetes genuinos, además de scripts de carga, predicción y puntuación continua.

La relevancia es doble: por un lado sirve como banco de pruebas reproducible para evaluar técnicas de detección de anomalías y clasificación one-class en datos tabulares de baja dimensión (cuatro características wavelet); por otro, es un ejemplo de buenas prácticas de empaquetado (checksums, manifiesto con versiones, calibración explícita de umbrales). El modelo es una demostración sobre un único conjunto de imágenes, no un autenticador de billetes listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | 18 clasificadores/detectores tabulares independientes (lineales, kernel, árboles, boosting, MLP, one-class, autoencoder, Mahalanobis) |
| Parámetros totales | no disponible (depende del detector; los bundles joblib ocupan 0,0 GB en total) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de 4 características numéricas: variance, skewness, kurtosis, entropy) |
| Tipos de cuantización | no aplica (modelos tabulares; los bundles son pickles joblib) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT (código y modelos); datos de entrenamiento: UCI Banknote Authentication |
| Formato de pesos | joblib (pickle de Python); código auxiliar en Python (`banknote_experiments.py`, `train_all.py`) |

## Arquitectura y entrenamiento

El repositorio agrupa tres familias. La supervisada incluye regresión logística, k-NN (k=5), SVM con kernel RBF, árbol de decisión, random forest, extra trees, HistGradientBoosting, un MLP de 3 capas de 64 unidades, XGBoost y LightGBM. La one-class incluye isolation forest, one-class SVM, un autoencoder y un detector Mahalanobis (gaussiano). La híbrida combina un clasificador supervisado con un detector one-class y marca el billete como falso si cualquiera de los dos componentes supera su propio umbral α/2.

El entrenamiento parte de 762 billetes genuinos divididos 80/20 con semilla 0 (609 para entrenamiento, 153 para calibración) y 610 falsificaciones. Los supervisados usan genuinos de entrenamiento más todos los falsos; los one-class solo usan genuinos. Cada umbral es el percentil 99 de las puntuaciones del detector sobre el conjunto de calibración, lo que fija una tasa de rechazo de genuinos en torno al 1 %. El manifiesto `models/manifest.json` registra el checksum de los datos y las versiones exactas de las librerías (Python 3.12.15, numpy 2.5.4, pandas 3.1.1, scikit-learn 1.9.1, xgboost 3.4.1, lightgbm 4.7.0, joblib 1.6.0), lo que permite reproducir los bundles con `make models` en el repositorio de código.

## Capacidades

- Clasificación binaria tabular de billetes (genuino/falso) a partir de cuatro características wavelet.
- Detección one-class entrenada exclusivamente con ejemplares genuinos, útil cuando no hay muestras de la clase negativa.
- Puntuación continua (`train_all.score`) además de la decisión binaria, para umbralizar a posteriori según el coste operativo.
- Evaluación en conjunto abierto: los detectores one-class generalizan a familias de falsificaciones no vistas durante el entrenamiento.
- Carga programática vía `huggingface_hub.snapshot_download` y API de Python (`train_all.load`, `train_all.predict`, `train_all.score`).
- Interfaz de línea de comandos (`python train_all.py predict --dir models --model ... --input notes.csv --out scores.csv`).
- Reentrenamiento reproducible con la misma semilla y los mismos datos.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Investigación en detección de anomalías: banco de pruebas controlado para comparar clasificadores supervisados frente a one-class en un escenario de conjunto abierto, con métricas de calibración y evaluación leave-one-family-out ya definidas.
- Docencia en aprendizaje automático: ejemplo compacto de calibración de umbrales al percentil 99 y de las diferencias entre validación cruzada aleatoria y generalización a familias no vistas.
- Prototipado de pipelines de autenticación documental: los bundles sirven como línea base antes de sustituirlos por modelos entrenados con las características wavelet propias de cada escáner.
- Selección de arquitectura para control de calidad en impresión de seguridad: comparar el coste/beneficio de un autoencoder one-class frente a XGBoost o LightGBM en función de la disponibilidad de muestras de falsificaciones.
- Evaluación de robustez de modelos tabulares: usar el conjunto de 18 detectores para medir la degradación de cada familia algorítmica ante distribuciones fuera de dominio.
- Integración en scripts de análisis de billetes: cargar `hybrid_xgboost_autoencoder` o `autoencoder` y puntuar un CSV de características wavelet para triaje previo a inspección humana.
- Reproducibilidad de publicaciones: regenerar exactamente los artefactos del preprint con `make models` y verificar los checksums de `SHA256SUMS`.

## Benchmarks y rendimiento

Resultados reportados por el autor. La columna E1 corresponde a validación cruzada repetida de 10 folds; la columna "familia no vista" corresponde al protocolo leave-one-family-out (K=3, presupuesto del 1 %, 10 semillas) de la Tabla 5 del paper. No son evaluaciones de estos ficheros exactos, que se entrenaron con todos los datos.

| Detector | Tipo | Rechazo en calibración | Exactitud E1 (split aleatorio) | Familia no vista, media (peor) |
|---|---|---:|---:|---:|
| Regresión logística | supervisado | 1,3 % | 98,1 % | 76,1 % (57,9 %) |
| k-NN (k=5) | supervisado | 0,0 % | 99,8 % | — |
| SVM (RBF) | supervisado | 0,7 % | 100,0 % | 96,1 % (88,9 %) |
| Árbol de decisión | supervisado | 0,0 % | 98,4 % | — |
| Random forest | supervisado | 1,3 % | 99,4 % | 57,6 % (38,8 %) |
| Extra trees | supervisado | 1,3 % | 99,9 % | — |
| HistGradientBoosting | supervisado | 1,3 % | 99,5 % | — |
| MLP (3×64) | supervisado | 1,3 % | 100,0 % | 84,4 % (67,8 %) |
| XGBoost | supervisado | 1,3 % | 99,6 % | 61,0 % (35,7 %) |
| LightGBM | supervisado | 1,3 % | 99,1 % | 51,0 % (29,3 %) |
| Isolation forest | one-class | 1,3 % | — | 45,7 % (4,7 %) |
| One-class SVM | one-class | 1,3 % | — | 98,3 % (95,7 %) |
| Autoencoder | one-class | 1,3 % | — | 99,98 % (99,9 %) |
| Mahalanobis | one-class | 0,7 % | — | 98,8 % (97,3 %) |
| XGBoost + Isolation forest | híbrido | 1,3 % | — | 67,9 % (35,6 %) |
| XGBoost + Autoencoder | híbrido | 1,3 % | — | 99,8 % (99,3 %) |
| MLP + Isolation forest | híbrido | 1,3 % | — | 86,5 % (65,1 %) |
| MLP + Autoencoder | híbrido | 1,3 % | — | 99,8 % (99,5 %) |

## Requisitos de hardware

- VRAM: no aplica; son modelos tabulares que se ejecutan en CPU. El autoencoder y el MLP son redes minúsculas (3×64 en el MLP) sin necesidad de GPU.
- GPU recomendadas: ninguna. Cualquier CPU moderna basta; el entrenamiento completo se describe como reproducible "en segundos".
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y los bundles joblib son de tamaño despreciable.
- Opciones de despliegue: Python con scikit-learn, xgboost, lightgbm y joblib en las versiones fijadas (ver `requirements.txt`); no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma explícita; al tratarse de inferencia sobre 4 características y modelos de pocos parámetros, la latencia esperada es de microsegundos a milisegundos por muestra en CPU, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Contexto | Rendimiento en conjunto abierto | Licencia |
|---|---|---|---|---|---|
| Beyond99-banknote-detection (este) | 18 detectores tabulares | 4 características wavelet | no aplica | Autoencoder 99,98 %; XGBoost 61,0 % | MIT |
| UCI Banknote Authentication (baseline de referencia) | Dataset + clasificadores clásicos | 4 características wavelet | no aplica | No reportado como modelo empaquetado | Dominio público (UCI) |
| Isolation Forest (scikit-learn) | Detector one-class genérico | Vector de características | no aplica | 45,7 % en el protocolo del autor | BSD |
| One-Class SVM (scikit-learn) | Detector one-class genérico | Vector de características | no aplica | 98,3 % en el protocolo del autor | BSD |

No se identifican en la información proporcionada otros repositorios empaquetados de detección de billetes falsos con evaluación en conjunto abierto comparables directamente.

## Limitaciones y advertencias

- Demostración sobre cuatro características wavelet de un único montaje de imagen; no es un autenticador de billetes para producción.
- El propio autor lo declara investigación personal independiente, sin representar a empleador ni institución.
- Los ficheros `.joblib` son pickles de Python: cargarlos ejecuta código arbitrario. Solo deben cargarse desde fuentes de confianza, verificarse contra `SHA256SUMS` o regenerarse localmente con `make models`.
- Las versiones de scikit-learn, XGBoost y LightGBM están fijadas; otras versiones pueden rechazar el unpickle de los bundles.
- `decision_tree` tiene un fallo conocido: su umbral es 1 y la regla `score > threshold` nunca dispara, por lo que no marca ningún billete, ni siquiera los falsos con los que se entrenó. Solo debe usarse su puntuación continua.
- Riesgo de falsos positivos y negativos: la calibración fija un rechazo del ~1 % de genuinos, pero la tasa de detección de falsificaciones cae drásticamente en familias no vistas para los modelos supervisados.
- Sesgos de los datos: el conjunto UCI procede de un único entorno de captura y de una distribución concreta de falsificaciones; no hay garantía de transferencia a otros países, denominaciones o técnicas de impresión.
- Sin soporte multilingüe, de texto, visión, audio ni agentes; no es un modelo generativo.
- Uso comercial permitido por la licencia MIT, pero sin garantías de idoneidad para aplicaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/thanatchon36/beyond99-banknote-detection
- Dataset en Hugging Face: https://huggingface.co/datasets/thanatchon36/beyond99-banknote-detection
- Paper (preprint online): https://thanatchon36.github.io/beyond99-banknote-detection/paper/
- Código: https://github.com/thanatchon36/beyond99-banknote-detection
- DOI Zenodo: https://doi.org/10.5281/zenodo.24049790
- Dataset original UCI Banknote Authentication: no disponible en la información proporcionada (referenciado como Lohweg en la model card)
