# usamahanif349/pakistan-aqi-predictor

## Resumen

Pakistan AQI Predictor es un par de modelos de machine learning clásico publicados por Usama Hanif (estudiante de IA en UMT Lahore) que estiman el índice de calidad del aire (AQI, escala estadounidense) mensual y su categoría sanitaria para diez ciudades de Pakistán. No es un modelo de lenguaje ni una red neuronal profunda: se trata de dos estimadores de gradient boosting de scikit-learn (`GradientBoostingRegressor` y `GradientBoostingClassifier`) serializados con joblib, acompañados de tres codificadores de etiquetas y un fichero JSON con atributos de ciudad.

El modelo resuelve un problema de regresión y clasificación tabular de baja dimensionalidad: dada una ciudad, un mes y una estación del año, devuelve el AQI típico esperado y una de cuatro categorías de salud. Su relevancia es acotada y práctica: ofrece una línea base reproducible y ligera (el repositorio ocupa 0,0 GB) para estudiar la estacionalidad de la contaminación en Pakistán, con resultados altos (R² = 0,974, MAE = 5,15) que, como admite el propio autor, reflejan en buena medida que las features son calendáricas y de ciudad, no medidas de contaminantes.

La ficha se basa exclusivamente en la model card y los metadatos de Hugging Face; no hay información sobre hiperparámetros, número de árboles, profundidad ni composición exacta del dataset de entrenamiento más allá de su nombre y rango temporal (2015-2025).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (scikit-learn: `GradientBoostingRegressor` y `GradientBoostingClassifier`) |
| Parametros totales | No disponible (modelo tabular; el número de árboles, profundidad y estimadores no se documenta) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular de 11 features, sin ventana de contexto) |
| Tipos de cuantizacion | No disponible (serialización joblib `.pkl`; no se publican variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | Inglés (etiquetas de ciudad, estación y provincia en inglés) |
| Licencia | MIT |
| Formato de pesos | `.pkl` (joblib) para los dos modelos y los tres `LabelEncoder`; `city_lookup.json` para atributos de ciudad |

## Arquitectura y entrenamiento

La arquitectura es la de un gradient boosting estándar de scikit-learn, con dos cabezas independientes: una de regresión para el valor numérico del AQI y otra de clasificación para la categoría sanitaria. La entrada es un vector de 11 features: `month` (1-12), `city_encoded`, `season_encoded`, `province_encoded` (codificados con `le_city.pkl`, `le_season.pkl` y `le_province.pkl`), tres indicadores binarios de temporada (`is_smog_season`, `is_crop_burning_season`, `is_monsoon_season`) y cuatro atributos de ciudad (`is_industrial_hub`, `is_coastal`, `is_capital`, `population_millions`) almacenados en `city_lookup.json`.

El entrenamiento se realizó sobre el dataset `alitaqishah/pakistan-air-quality-index-10-cities-20152025`, con datos mensuales de 2015 a 2025 para diez ciudades (Faisalabad, Gujranwala, Hyderabad, Islamabad, Karachi, Lahore, Multan, Peshawar, Quetta y Rawalpindi). El autor indica que comparó ML clásico (Random Forest, XGBoost, gradient boosting), una ANN y un LSTM, y que los ensembles de árboles obtuvieron los mejores resultados; los scores se validaron con validación cruzada de 5 folds. No se documentan el número de estimadores, la tasa de aprendizaje, la profundidad máxima, el criterio de splitting ni el volumen exacto de muestras de entrenamiento. Tampoco se describe ningún proceso de RLHF, DPO ni ajuste fino posterior: es un ajuste supervisado clásico sobre datos tabulares.

## Capacidades

- Regresión tabular: predice el valor mensual del AQI en escala US para una ciudad y mes dados.
- Clasificación tabular: asigna una de cuatro categorías sanitarias (Moderate, Unhealthy for Sensitive Groups, Unhealthy, Very Unhealthy).
- Codificación consistente de categorías mediante `LabelEncoder` serializados, lo que garantiza que las etiquetas de ciudad, estación y provincia se transformen igual en inferencia que en entrenamiento.
- Incorporación de conocimiento de dominio vía features derivadas: temporada de smog, temporada de quema de rastrojos, monzón, condición de polo industrial, ciudad costera, capitalidad y población en millones.
- Inferencia determinista y muy ligera, ejecutable en CPU sin GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo.
- No soporta idiomas distintos del inglés en sus etiquetas de entrada.

## Casos de uso

- Planificación estacional de salud pública: dado un mes y una ciudad, el modelo devuelve el AQI esperado y su categoría, lo que permite a un departamento de salud dimensionar campañas de concienciación antes de la temporada de smog invernal en Lahore o Faisalabad.
- Educación y docencia en ML tabular: sirve como ejemplo reproducible de comparación entre gradient boosting, Random Forest, XGBoost, ANN y LSTM sobre un dataset real, con notebook en Kaggle y paper con DOI.
- Línea base para investigación en calidad del aire: cualquier trabajo posterior que incorpore concentraciones de PM2,5, NO₂ u ozono puede compararse contra este baseline (R² = 0,974, MAE = 5,15) para demostrar mejora real frente a un modelo que solo usa calendario y atributos de ciudad.
- Prototipado rápido de dashboards: la app de Streamlit publicada por el autor demuestra cómo integrar los `.pkl` en una interfaz web ligera para consultar el AQI típico por ciudad y mes.
- Análisis de estacionalidad en informes técnicos: al ser determinista y de coste computacional nulo, permite generar tablas de AQI esperado para las 10 ciudades × 12 meses en milisegundos y volcarlas a un informe o CSV.
- Filtro previo en pipelines de datos: en un sistema que recoja mediciones diarias, el modelo puede usarse para marcar meses anómalos (medición muy alejada del valor típico esperado) y priorizar la revisión manual de esos registros.

## Benchmarks y rendimiento

| Modelo | Tarea | Métrica | Resultado |
|---|---|---|---|
| Gradient Boosting (tuned) | Regresión | R² | 0,974 |
| Gradient Boosting (tuned) | Regresión | MAE | 5,15 |
| Gradient Boosting | Clasificación | Accuracy | 91,7 % |

Los resultados se obtuvieron con validación cruzada de 5 folds según la model card. La comparación completa con Random Forest, XGBoost, una ANN y un LSTM se remite al paper (DOI 10.5281/zenodo.22859477), cuyos valores numéricos no se incluyen en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; los modelos son de gradient boosting y se ejecutan en CPU.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente; el cuello de botella es la carga de los `.pkl` con joblib.
- GPU de consumo: irrelevante para este modelo; no se beneficia de aceleración por GPU.
- Opciones de despliegue: Python con `scikit-learn` + `joblib` + `pandas`; descarga de artefactos vía `huggingface_hub`. El autor publica una demo en Streamlit. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares de este tipo.
- Latencia y throughput: no se publican cifras. Por la naturaleza del modelo (gradient boosting sobre 11 features) se espera latencia de milisegundos por predicción en CPU, pero es una estimación, no un dato del autor.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pakistan AQI Predictor (este) | Gradient boosting (scikit-learn) | 11 features tabulares (ciudad, mes, estación, atributos) | AQI numérico + categoría | MIT | Hugging Face, GitHub, Streamlit, paper |
| Random Forest / XGBoost del mismo estudio | Ensembles de árboles | Mismas features | AQI numérico + categoría | No disponible en el repo | Solo descritos en el paper |
| ANN del mismo estudio | Red neuronal feedforward | Mismas features | AQI numérico + categoría | No disponible en el repo | Solo descrita en el paper |
| LSTM del mismo estudio | Red recurrente | Mismas features (serie mensual) | AQI numérico + categoría | No disponible en el repo | Solo descrita en el paper |
| PEARLSAQI | Sistema de forecasting (ML) | Datos AQI y meteorológicos | Pronóstico a 24/48/72 h | No disponible | GitHub (proyecto independiente) |

La comparación relevante es interna al estudio del autor, ya que no se han identificado en la búsqueda otros modelos publicados con el mismo alcance (AQI mensual para 10 ciudades paquistaníes). PEARLSAQI aborda un problema distinto (pronóstico horario a corto plazo con datos meteorológicos) y no es directamente comparable.

## Limitaciones y advertencias

- Predice medias mensuales, no pronósticos diarios: no captura picos puntuales de contaminación ni la meteorología de un día concreto.
- No usa concentraciones de contaminantes como entrada: las features son calendáricas y de ciudad, por lo que el modelo aprende principalmente el patrón estacional de cada ciudad. Esto explica en gran medida los scores altos y limita la utilidad para detectar eventos anómalos.
- Solo cuatro categorías de salida: el dataset de entrenamiento no contenía meses "Good" ni "Hazardous", así que el clasificador nunca predecirá esas clases aunque fueran correctas.
- Cobertura geográfica restringida a 10 ciudades; no admite otras localidades.
- El autor advierte explícitamente que no debe usarse para decisiones sanitarias o de seguridad; para eso deben consultarse fuentes oficiales de calidad del aire.
- Riesgo de mala calibración fuera del rango temporal 2015-2025 o ante cambios estructurales (nuevas políticas de emisiones, variaciones de población no reflejadas).
- No se documentan análisis de sesgo, intervalos de confianza por predicción ni evaluación de deriva temporal; la validación cruzada de 5 folds no equivale a una validación out-of-time.
- Licencia MIT: permite uso comercial y modificación con atribución, pero al ser un modelo de investigación sin garantías, cualquier uso en producción exige validación propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño es de 0,0 GB; no hay evidencia de uso o mantenimiento por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/usamahanif349/pakistan-aqi-predictor
- Aplicación en vivo (Streamlit): https://pakistan-aqi-prediction-frhdsrc2ivtubpkdotcau5.streamlit.app/
- Notebook en Kaggle: https://www.kaggle.com/code/usamasadi/pakistan-aqi-prediction-ml-vs-deep-learning-10-c
- Paper (DOI): https://doi.org/10.5281/zenodo.22859477
- Código en GitHub: https://github.com/usamahanif349/Pakistan-AQI-Prediction
- Perfil del autor en GitHub: https://github.com/usamahanif349
- ORCID del autor: https://orcid.org/0009-0001-8811-4058
- Dataset de entrenamiento: https://huggingface.co/datasets/alitaqishah/pakistan-air-quality-index-10-cities-20152025
- Proyecto relacionado (PEARLSAQI): https://github.com/VrdaRehman01/PEARLSAQI
