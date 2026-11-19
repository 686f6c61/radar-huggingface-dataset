# thelamapi/Next-Forecast

## Resumen

Next Forecast es un modelo de previsión de series temporales publicado por el usuario thelamapi en Hugging Face. Se trata de una regresión ridge que predice las siguientes 24 horas de una serie simulada de demanda eléctrica, empleando lags diarios y semanales, una media móvil y variables de calendario. El checkpoint exportado contiene únicamente los coeficientes ajustados del modelo lineal, no pesos de una red neuronal.

El modelo se entrena con los primeros 112 días de la serie y se evalúa sobre los últimos 28 días, que aportan 672 objetivos horarios. Cada previsión comienza a medianoche y utiliza solo las observaciones disponibles en ese instante, lo que evita fuga de información futura. Con un MAE global de 3.747, supera ligeramente al baseline de "misma hora de la semana anterior" (3.806), aunque este último obtiene mejor error en la franja de tarde-noche (17:00-21:59).

Su relevancia es limitada: no es un modelo fundacional ni un transformer, sino una línea base reproducible para experimentos de previsión horaria sobre datos sintéticos. Resulta útil como referencia metodológica y como ejemplo mínimo de pipeline de forecasting, pero no está pensado para producción ni para series reales sin reentrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión ridge (modelo lineal regularizado L2) |
| Parámetros totales | Coeficientes ajustados de la regresión (número exacto no disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de entrada basada en lags diarios y semanales (horizonte de predicción de 24 horas) |
| Tipos de cuantización | No aplica (coeficientes en punto flotante estándar) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | Checkpoint con coeficientes ajustados (formato de serialización no especificado) |

## Arquitectura y entrenamiento

El modelo es una regresión ridge, es decir, una regresión lineal con penalización L2 sobre los coeficientes. Las variables de entrada son lags diarios (misma hora de días anteriores), lags semanales (misma hora de la semana anterior), una media móvil (trailing mean) y características de calendario. El checkpoint exportado contiene exclusivamente los coeficientes ajustados, por lo que la inferencia consiste en una combinación lineal de estas features.

El entrenamiento usa los primeros 112 días de una serie simulada de demanda eléctrica y la evaluación se realiza sobre los 28 días finales, con 672 objetivos horarios. Cada previsión arranca a medianoche y emplea solo observaciones disponibles en ese momento, lo que constituye una evaluación causal correcta. No se documenta el número de tokens ni un corpus de entrenamiento al uso, ni se mencionan fases de RLHF o DPO, ya que no aplican a este tipo de modelo. El repositorio incluye `forecast.py`, que regenera el checkpoint y la evaluación con NumPy.

## Capacidades

- Previsión univariante de series temporales horarias con horizonte de 24 horas.
- Uso de estacionalidad diaria y semanal mediante lags explícitos.
- Incorporación de una media móvil como suavizado de tendencia reciente.
- Manejo de features de calendario (por ejemplo, día de la semana u hora).
- Evaluación causal: cada predicción solo usa datos disponibles en el momento del corte.
- Reproducibilidad completa del pipeline mediante un script de Python con NumPy.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de visión, audio o modo thinking.

## Casos de uso

- Línea base para experimentos de forecasting: sirve como referencia mínima contra la que comparar modelos más complejos (ARIMA, Prophet, gradient boosting, transformers temporales) antes de invertir en infraestructura.
- Docencia y prototipado rápido: el script `forecast.py` con NumPy permite ilustrar un pipeline completo de features, ajuste y evaluación causal en pocas líneas.
- Validación de pipelines de evaluación: el esquema de 112 días de entrenamiento y 28 de test con 672 objetivos horarios puede reutilizarse para comprobar que un harness de backtesting no introduce fuga de información.
- Predicción de demanda eléctrica simulada: útil para generar escenarios sintéticos en pruebas de sistemas de gestión energética sin exponer datos reales.
- Detección de la importancia de la estacionalidad: al comparar sus coeficientes con el baseline semanal se identifica cuánto aporta cada lag, lo que orienta el diseño de features en modelos posteriores.
- Benchmark interno de series temporales: como el modelo es determinista y ligero, puede ejecutarse en CI para detectar regresiones en librerías de preprocesado o en el propio código de evaluación.
- Referencia para el análisis de errores por franja horaria: el desglose de MAE global frente a MAE de tarde-noche permite estudiar dónde falla un enfoque lineal frente a un baseline naive estacional.

## Benchmarks y rendimiento

| Método | MAE | MAE tarde-noche (17:00-21:59) |
|---|---:|---:|
| Next Forecast | 3.747 | 3.899 |
| Semana anterior, misma hora | 3.806 | 3.835 |

Los resultados corresponden a la serie simulada del repositorio, con 672 objetivos horarios en los últimos 28 días. El modelo mejora el MAE global frente al baseline semanal, pero empeora en la franja de tarde-noche. No se han publicado resultados de benchmarks en la información disponible más allá de esta tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; los coeficientes de una regresión ridge caben en memoria principal y se ejecutan en CPU.
- GPU recomendadas: no aplica; no requiere GPU. Cualquier CPU moderna es suficiente.
- Cabe en GPU consumer: sí, pero no es necesario usarla; el cuello de botella es el preprocesado de features, no el cálculo.
- Opciones de despliegue: ejecución directa con Python y NumPy mediante `forecast.py`; también puede integrarse en un servicio ligero (FastAPI, Flask) o en un Space de Hugging Face como el demo del autor. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles de forma explícita; por la naturaleza lineal del modelo, la inferencia de 24 pasos es del orden de microsegundos a milisegundos en CPU, dominada por la construcción de features.

## Comparativa con modelos similares

| Modelo | Tipo | Horizonte | Contexto de entrada | MAE (serie del repo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Next Forecast | Regresión ridge | 24 h | Lags diarios/semanales, media móvil, calendario | 3.747 | no disponible | Hugging Face |
| Baseline semana anterior | Naive estacional | 24 h | Valor de la misma hora 7 días antes | 3.806 | no aplica | Referencia del propio repo |
| ARIMA / SARIMA | Modelo estadístico clásico | Configurable | Serie histórica univariante | no disponible | no aplica | Librerías estándar (statsmodels) |
| Prophet | Modelo aditivo descomponible | Configurable | Estacionalidades y regresores | no disponible | MIT (librería) | Meta / open source |

La comparación con ARIMA o Prophet es cualitativa: no se han publicado resultados de esos modelos sobre esta serie simulada en la información disponible.

## Limitaciones y advertencias

- El modelo se ha entrenado y evaluado exclusivamente sobre una serie simulada de demanda eléctrica; no hay evidencia de que generalice a series reales sin reentrenamiento.
- Es un modelo lineal: no captura interacciones no lineales ni cambios de régimen que sí podrían abordar modelos de árboles o redes neuronales.
- El baseline naive semanal obtiene mejor MAE en la franja de tarde-noche (3.835 frente a 3.899), lo que indica que el modelo no domina en todas las franjas horarias.
- No se especifica la licencia, por lo que el uso comercial queda sin cobertura legal explícita hasta que el autor la defina.
- Solo declara soporte para inglés (`en`), aunque al ser un modelo numérico el idioma es irrelevante en la práctica.
- Riesgo de alucinación no aplica al no generar texto; el riesgo equivalente es la extrapolación incorrecta fuera del rango de entrenamiento.
- El checkpoint contiene solo coeficientes: cualquier cambio en el esquema de features exige regenerar el modelo con `forecast.py`.
- No hay información sobre sesgos, ya que la serie es sintética y no representa una población real.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no cuenta con validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/Next-Forecast
- Demo (Space): https://huggingface.co/spaces/thelamapi/Next-Forecast
