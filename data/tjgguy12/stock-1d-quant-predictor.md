# Tjgguy12/stock-1d-quant-predictor

## Resumen

El modelo `Tjgguy12/stock-1d-quant-predictor` no es un modelo de lenguaje: es un artefacto de aprendizaje automático clásico para predicción financiera cuantitativa a un día. Lo desarrolla el usuario Tjgguy12 y combina un `VotingClassifier` sobre XGBoost y LightGBM (clasificación UP/DOWN) con una regresión Ridge (porcentaje esperado de movimiento). Se entrenó sobre 503 tickers del S&P 500, 25 años de datos diarios y 2,9 millones de filas, con validación purged walk-forward para evitar fuga de información.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto reproducible de predicción direccional bursátil con métricas declaradas de forma honesta y modesta: IC 0,019, precisión en el 20 % superior de señales del 52 % y AUC 0,52. Por otro, sirve como caso de estudio sobre los límites prácticos de la predicción financiera supervisada: el backtest es fuertemente dependiente del régimen, con Sharpe 1,21 en el primer semestre de 2019, -0,96 en el mercado bajista de 2022 y 1,30 en 2024.

El repositorio aloja únicamente artefactos de modelo serializados con joblib (unos 2,4 MB en total) y un fichero JSON con la lista de features. La licencia es Apache-2.0. No se ha publicado información sobre idiomas de la interfaz, ni sobre arquitecturas neuronales, ni sobre benchmarks comparativos con alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble supervisado sobre features tabulares: VotingClassifier (XGBoost + LightGBM) para clasificación binaria de dirección + Ridge regression para retorno esperado |
| Parametros totales | no disponible (número de estimadores y profundidad de árboles no publicados; tamaño de los artefactos: 2,4 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (las features se calculan a partir de datos diarios de yfinance; el autor menciona "1y daily" en el ejemplo de uso) |
| Tipos de cuantizacion | no aplica (serialización joblib/pickle, no hay cuantización) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | joblib/pickle: `scaler_1d.pkl`, `clf_1d_voting.pkl`, `reg_1d_ridge.pkl` y `features_1d.json` |

## Arquitectura y entrenamiento

El sistema no emplea redes neuronales ni transformers. Se compone de tres artefactos independientes que se aplican en cadena: un escalador (`scaler_1d.pkl`) que normaliza las features, un clasificador de votación (`clf_1d_voting.pkl`) que combina XGBoost y LightGBM para producir una probabilidad de subida, y una regresión Ridge (`reg_1d_ridge.pkl`) que estima el porcentaje esperado de movimiento. La lista exacta de features se expone en `features_1d.json` y se calcula externamente a partir de datos diarios de yfinance.

El entrenamiento declarado abarca 503 tickers del S&P 500, 25 años de histórico y 2,9 millones de filas, con un esquema purged walk-forward que elimina solapamiento entre ventanas de entrenamiento y validación. El autor indica que el ajuste fino se realizó en Kaggle. No se documentan pasos de RLHF ni de DPO, ya que no aplican a este tipo de modelo. Como innovación destacable, cabe señalar la separación explícita entre clasificación de dirección y regresión de magnitud, y el uso de umbrales asimétricos (0,57 para UP, 0,43 para DOWN) con una zona intermedia clasificada como FLAT.

## Capacidades

- Clasificación de dirección a un día: devuelve probabilidad de subida y la traduce a UP, DOWN o FLAT según umbrales de 0,57 y 0,43.
- Regresión de magnitud: estima el porcentaje esperado de movimiento mediante Ridge.
- Normalización consistente de features: el escalador se distribuye junto al modelo para garantizar la reproducibilidad del preprocesado.
- Especificación declarativa de features: `features_1d.json` define el orden y la composición exacta de la entrada.
- Integración con datos en vivo: el autor menciona un chatbot Gradio (`app.py`) que consume yfinance en tiempo real.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no aplica.

## Casos de uso

- Investigación cuantitativa reproducible: el artefacto permite replicar un pipeline completo de validación purged walk-forward sobre 2,9 millones de filas, útil como referencia metodológica para evitar fuga de información en series temporales financieras.
- Baseline en experimentos de predicción direccional: al publicar IC 0,019 y AUC 0,52, sirve como línea base honesta contra la que comparar modelos más complejos antes de reclamar mejoras.
- Capa de confirmación en sistemas de trading sistemático: dada su precisión del 52 % en el 20 % superior de señales, solo tendría sentido como filtro auxiliar sobre una estrategia ya existente, nunca como señal única.
- Análisis de sensibilidad a régimen de mercado: el contraste entre Sharpe 1,21 (2019H1), -0,96 (2022) y 1,30 (2024) lo convierte en un caso práctico para estudiar la estabilidad de modelos financieros entre regímenes.
- Docencia y divulgación: ilustra de forma tangible por qué métricas aparentemente bajas (AUC cercano a 0,5) son realistas en predicción bursátil diaria y por qué conviene desconfiar de resultados demasiado optimistas.
- Prototipado rápido con datos abiertos: la dependencia de yfinance facilita montar un cuaderno de pruebas end-to-end en minutos, sin infraestructura de datos propietaria.
- Auditoría de artefactos publicados: el reducido tamaño del repositorio y la simplicidad del formato joblib permiten inspeccionar el modelo, verificar la coherencia de las features y detectar posibles fugas de información residuales.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| IC (information coefficient) | 0,019 |
| Precision@20 | 52 % |
| AUC | 0,52 |
| Sharpe 2019H1 | 1,21 |
| Sharpe 2022 (mercado bajista) | -0,96 |
| Sharpe 2024 | 1,30 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: 0 GB; no requiere GPU, la inferencia se ejecuta en CPU.
- GPU recomendadas: ninguna; el modelo es de gradient boosting sobre features tabulares.
- Cabe en cualquier equipo de consumo: el conjunto de artefactos ocupa 2,4 MB y la inferencia es una llamada a `predict_proba` y `predict`.
- Memoria RAM estimada: unos pocos cientos de megabytes para el intérprete de Python más las dependencias (scikit-learn, xgboost, lightgbm, joblib).
- Opciones de despliegue: carga directa con joblib dentro de un proceso Python, servicio HTTP con FastAPI o Flask, integración en un frontend tipo Vercel (según indica el autor) y despliegue en Hugging Face Spaces, que el autor señala que requiere cuenta PRO.
- Latencia y throughput: no disponible (no publicados). Por la naturaleza del modelo, cabe esperar latencias del orden de milisegundos por muestra en CPU, pero este dato no está confirmado en la información proporcionada.
- Dependencia externa: se necesita yfinance para calcular las features, lo que introduce requisitos de red y de disponibilidad de datos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye referencias a otros modelos de predicción direccional con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Rendimiento cercano al azar: un AUC de 0,52 y un IC de 0,019 implican una capacidad discriminativa muy limitada.
- Fuerte dependencia del régimen: el Sharpe pasa de 1,21 en 2019H1 a -0,96 en 2022, lo que invalida cualquier expectativa de comportamiento estable.
- Universo restringido: el entrenamiento se limita a 503 tickers del S&P 500, por lo que la extrapolación a otros mercados, capitalizaciones o clases de activo no está justificada.
- Dependencia de datos de terceros: las features se calculan con yfinance, cuya calidad, cobertura y política de acceso pueden cambiar sin aviso.
- Riesgo de fuga de información residual: aunque se declara purged walk-forward, no se detalla la implementación completa; conviene auditar la construcción de features antes de confiar en los resultados.
- Ausencia de validación por la comunidad: el repositorio registra 0 descargas y 0 likes, por lo que no existe revisión independiente de sus métricas.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se distribuye sin garantías de ningún tipo.
- No es asesoramiento financiero: el propio autor lo declara explícitamente; el modelo es probabilístico y sus salidas no deben usarse como recomendación de inversión.
- Información ausente: no se documentan sesgos, idiomas soportados, número de estimadores ni detalles de la composición del dataset más allá del recuento de filas y tickers.
- Posible incoherencia del repositorio: el autor menciona `app.py` en la model card, pero el repositorio se describe como alojamiento de artefactos y su tamaño es de 0,0 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tjgguy12/stock-1d-quant-predictor
- Cuaderno de Kaggle: https://www.kaggle.com/code/maxvwede/stock-1d-quant-predictor-1-day-up-down
- Repositorio del frontend en Vercel (marcado como "coming" por el autor): https://github.com/Tjgguy12/stock-1d-quant-chat
- Los resultados de búsqueda web proporcionados no contienen enlaces relevantes para este modelo; apuntan a páginas de la administración tributaria rumana (ANAF) y no guardan relación con el artefacto descrito.
