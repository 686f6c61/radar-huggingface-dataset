# yessinatalia/house-price-prediction

## Resumen

House Price Prediction es un modelo de regresión tabular basado en Random Forest Regressor, publicado por el usuario yessinatalia en Hugging Face. Su objetivo es estimar el precio de venta de viviendas en el área metropolitana de Seattle (estado de Washington, EE. UU.) a partir de características físicas del inmueble, como número de habitaciones, superficie construida, año de construcción o código postal. El modelo se distribuye como artefacto serializado en formato joblib y no como pesos de red neuronal.

El modelo se entrenó sobre un conjunto de datos de Kaggle con 4.600 filas originales (4.551 tras eliminar registros con precio cero) y 136 características de entrada después del preprocesamiento, que incluye extracción de componentes de fecha y codificación one-hot de las variables `city` y `statezip`. La tarea es de regresión supervisada sobre un objetivo continuo en dólares estadounidenses.

Es relevante como ejemplo de modelo predictivo ligero y desplegable en entornos con recursos mínimos, no como modelo de lenguaje. Su ámbito de aplicación es estrictamente el mercado inmobiliario de Seattle y su licencia MIT permite uso comercial sin restricciones, aunque su validez fuera de esa región no está garantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Regressor (scikit-learn) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (artefacto joblib) |
| Idiomas soportados | id (indonesio, según metadatos); el modelo en sí no procesa texto |
| Licencia | MIT |
| Formato de pesos | joblib (modelo, scaler, feature_names y metadata serializados) |

## Arquitectura y entrenamiento

El modelo es un Random Forest Regressor, un conjunto de árboles de decisión entrenados mediante bagging sobre subconjuntos aleatorios de muestras y características. No emplea arquitectura transformer, MoE ni SSM; es un modelo de aprendizaje automático clásico para datos tabulares. El pipeline de preprocesamiento incluye transformación logarítmica (`log1p`) sobre variables de superficie, escalado de columnas numéricas mediante un `scaler` serializado, extracción de componentes de fecha (`year`, `month`, `day`, `day_of_week`) y codificación one-hot de `city` y `statezip`, dando lugar a 136 características de entrada.

El entrenamiento se realizó sobre el dataset "House Price Prediction" de Kaggle, con 4.600 filas antes del procesamiento y 4.551 tras eliminar registros con precio cero. La información disponible no detalla el número de árboles, la profundidad máxima, el criterio de división ni si se aplicó validación cruzada o ajuste de hiperparámetros. Tampoco se especifica si hubo técnicas de regularización adicionales más allá de las propias del bosque aleatorio.

## Capacidades

- Predicción de precios de vivienda en dólares estadounidenses a partir de 13 características numéricas y dos categóricas codificadas.
- Regresión sobre datos tabulares con relaciones no lineales entre características y objetivo.
- Manejo de variables categóricas de alta cardinalidad (`city`, `statezip`) mediante one-hot encoding.
- Extracción de señal temporal a partir de la fecha de listado del inmueble.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Tasación automática de viviendas en Seattle: el modelo estima el precio de venta a partir de las características físicas del inmueble, útil para portales inmobiliarios que quieran ofrecer una horquilla de precio orientativa al usuario.
- Análisis de cartera para agentes inmobiliarios: permite valorar rápidamente múltiples propiedades de la misma zona comparando la predicción con el precio de listado para detectar sobrevaloraciones.
- Filtrado previo en pipelines de compraventa: integrado como primer paso de scoring para descartar anuncios con precios muy alejados de la estimación antes de una revisión humana.
- Herramientas de simulación para compradores: permite al usuario modificar variables como número de habitaciones o superficie y observar el impacto estimado en el precio.
- Investigación académica sobre modelos de regresión tabular: sirve como referencia reproducible de un Random Forest con pipeline de preprocesamiento completo y métricas publicadas.
- Prototipado rápido en entornos con recursos limitados: al ser un artefacto joblib de tamaño reducido, se puede desplegar en funciones serverless o contenedores ligeros sin GPU.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test (escala original en USD):

| Metrica | Valor |
|---|---|
| R² Score | 0,9400 (94,00 %) |
| MAE | 16.976,94 USD |
| RMSE | 94.444,85 USD |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere aceleración por hardware.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y el artefacto joblib es de tamaño reducido.
- Opciones de despliegue: carga directa con `joblib.load` en Python, integración en APIs con FastAPI o Flask, ejecución en funciones serverless (AWS Lambda, Cloud Functions) y contenedores ligeros.
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de un Random Forest con 136 características, la inferencia por muestra es del orden de milisegundos en CPU, aunque no se aportan mediciones oficiales.
- Dependencias: scikit-learn 1.6.1 y joblib 1.4.2 o superior.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, otros enfoques habituales para regresión de precios inmobiliarios incluyen Gradient Boosting (XGBoost, LightGBM, CatBoost) y regresión lineal regularizada, pero no se han publicado métricas comparativas que permitan una comparación rigurosa con este modelo.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| House Price Prediction (yessinatalia) | no disponible | no aplica | R² 0,94; MAE 16.976,94 USD | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgo geográfico severo: el modelo está entrenado exclusivamente con datos del área metropolitana de Seattle y el estado de Washington; su uso en otras regiones o países (incluida Indonesia, pese al tag de idioma) no está validado y probablemente produzca predicciones inválidas.
- Subestimación de propiedades de lujo: el autor advierte que el modelo tiende a predecir por debajo del valor real en inmuebles de más de 2.000.000 USD, ya que factores subjetivos como valor histórico o reputación del arquitecto no están recogidos en el dataset.
- Correlación no implica causalidad: las relaciones aprendidas son puramente estadísticas y no deben interpretarse como relaciones causales entre características y precio.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero existe riesgo de predicciones erróneas fuera de la distribución de entrenamiento.
- Limitaciones de idioma: los metadatos declaran indonesio, pero el modelo no procesa texto; esta etiqueta no refleja una capacidad real de procesamiento lingüístico.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución con atribución y sin garantía; no obstante, el dataset de origen (Kaggle) puede tener sus propias condiciones que conviene revisar.
- Caveat para producción: las predicciones deben presentarse como estimaciones orientativas y no como tasaciones oficiales; se recomienda validación humana y monitorización de la deriva de datos si se despliega en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yessinatalia/house-price-prediction
- Dataset de origen en Kaggle: https://www.kaggle.com/datasets/debayank2024/house-price-prediction
