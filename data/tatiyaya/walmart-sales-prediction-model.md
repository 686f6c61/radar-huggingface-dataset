# tatiyaya/walmart-sales-prediction-model

## Resumen

`tatiyaya/walmart-sales-prediction-model` es un modelo de regresión tabular basado en Random Forest, publicado por el usuario tatiyaya en Hugging Face. No es un modelo de lenguaje ni una red neuronal: es un artefacto de scikit-learn serializado con `joblib` que predice el volumen de ventas semanales (`Weekly_Sales`, en USD) de tiendas de la cadena Walmart. Se desarrolló como proyecto académico de la asignatura Business Data Science (MN1135) en la Universitas Kristen Krida Wacana.

El modelo resuelve un problema concreto de previsión de demanda en el ámbito del retail: estimar la facturación semanal de una tienda a partir de variables exógenas como la identidad de la tienda, la existencia de festivos, la temperatura, el precio del combustible, el IPC, la tasa de desempleo y componentes de la fecha. Está pensado para equipos de operaciones, gestión de inventario y análisis de cadena de suministro que necesiten una estimación rápida del volumen de ventas.

La relevancia de esta ficha es limitada en el contexto de IA generativa: se trata de un modelo predictivo clásico, no de un LLM. Su utilidad práctica depende de que el entorno de despliegue se asemeje al del dataset original (2010-2012, 45 tiendas), por lo que su valor radica más como ejemplo docente de pipeline de regresión que como componente de producción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Regressor (scikit-learn 1.6.1) |
| Parametros totales | no disponible (modelo de árboles, no aplica el concepto de parámetros neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica; serialización en `joblib` |
| Idiomas soportados | `id` (indonesio), según metadatos de la model card |
| Licencia | MIT |
| Formato de pesos | `joblib` (`model_saya.joblib`, `scaler.joblib`, `feature_names.joblib`) |

## Arquitectura y entrenamiento

El modelo es un `RandomForestRegressor` de scikit-learn, es decir, un ensamblado de árboles de decisión entrenados sobre un espacio de 9 características numéricas. Antes del ajuste se aplica un escalado (artefacto `scaler.joblib`) y se extraen componentes de fecha (año, mes, semana del año) a partir de la columna original `Date`. El pipeline incluye una fase de ajuste de hiperparámetros, aunque la model card no detalla la rejilla de búsqueda ni los valores finales seleccionados.

Los datos de entrenamiento proceden del Walmart Sales Dataset de Kaggle: 6.435 filas de ventas semanales correspondientes a 45 tiendas entre 2010 y 2012. No se documenta el número de árboles, la profundidad máxima, el criterio de división ni el esquema de validación cruzada. Tampoco se menciona el uso de técnicas de regularización más allá del propio ensamblado. La partición de evaluación es un 80/20 (entrenamiento/prueba), y los resultados reportados corresponden al conjunto de prueba tras el tuning.

## Capacidades

- Predicción de regresión sobre datos tabulares: estima `Weekly_Sales` en USD a partir de 9 variables numéricas.
- Extracción de características temporales básicas (año, mes, semana) a partir de una fecha.
- Aplicación de escalado previo a la inferencia mediante el `scaler.joblib` incluido.
- Inferencia por lotes: acepta un `DataFrame` de pandas con múltiples filas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No dispone de modo "thinking" ni de decodificación especulativa (no aplica).

## Casos de uso

- Previsión de ventas semanales por tienda: dado un registro con la identidad de la tienda, la fecha y las variables macroeconómicas, el modelo devuelve una estimación en USD útil para planificar objetivos comerciales semanales.
- Planificación de inventario: el equipo de supply chain puede usar la predicción para dimensionar pedidos y evitar sobrestock o roturas, tal como indica la model card.
- Asignación de personal: con una estimación de volumen de ventas por tienda y semana, los responsables de operaciones pueden ajustar turnos y refuerzos en periodos de alta demanda.
- Análisis de sensibilidad a variables macro: al ser un modelo de árboles, permite estudiar cómo varía la predicción ante cambios en CPI, desempleo o precio del combustible, útil en informes exploratorios.
- Docencia y reproducción de pipelines: sirve como ejemplo completo de flujo de regresión con scikit-learn (descarga desde Hugging Face, carga con `joblib`, escalado y predicción) para cursos de ciencia de datos.
- Prototipado rápido de previsiones en entornos con datos históricos acotados: si se dispone de datos de ventas minoristas con estructura similar (tienda, fecha, variables exógenas), el modelo puede servir como línea base antes de invertir en modelos más complejos.
- Comparación de modelos baseline: como referencia para evaluar si un modelo más sofisticado (gradient boosting, redes neuronales tabulares) aporta mejoras reales sobre un Random Forest.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card sobre el 20% de datos de prueba:

| Metrica | Antes de tuning | Despues de tuning (modelo final) |
|---|---|---|
| MAE | 62.022,51 USD | 61.836,30 USD |
| R² | 95,96 % | 96,03 % |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU. El tamaño del repositorio es de aproximadamente 0,1 GB.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier equipo de consumo: un portátil convencional con Python y scikit-learn 1.6.1 puede cargar y ejecutar el modelo.
- Opciones de despliegue: scripts de Python con `joblib` y `scikit-learn`; empaquetado en una API (por ejemplo, FastAPI o Flask) o en un job programado. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de un Random Forest sobre 9 características, la inferencia por fila es del orden de microsegundos a milisegundos en CPU, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tatiyaya/walmart-sales-prediction-model | Random Forest Regressor (scikit-learn) | no aplica | no aplica | R² 96,03 %, MAE 61.836,30 USD | MIT | Hugging Face |
| Alternativas de regresión tabular (p. ej. XGBoost, LightGBM) | Gradient boosting | no aplica | no aplica | no disponible | depende de la implementación | amplia |
| Modelos de previsión de series temporales (p. ej. Prophet) | Modelo aditivo | no aplica | no aplica | no disponible | MIT (Prophet) | amplia |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Ventana temporal restringida: entrenado solo con datos de 2010-2012; no captura cambios de comportamiento del consumidor ni patrones estacionales posteriores.
- Sensibilidad a eventos extremos: la model card advierte de que anomalías macroeconómicas, desastres naturales, pandemias o disrupciones graves de la cadena de suministro pueden provocar errores elevados.
- Ausencia de variables de promoción: no incorpora inversión publicitaria, descuentos ni inventario de competidores, factores relevantes en retail.
- Sesgo de muestra: solo 45 tiendas y 6.435 registros; la generalización a otras cadenas o regiones no está validada.
- Riesgo de sobreajuste no documentado: no se detalla la validación cruzada ni la rejilla de hiperparámetros, por lo que el R² del 96 % debe interpretarse con cautela.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar la procedencia del dataset de Kaggle y sus condiciones de uso.
- Idiomas: los metadatos indican `id` (indonesio); la model card está redactada en ese idioma, aunque el modelo en sí no procesa texto.
- No apto para producción crítica sin reentrenamiento: la deriva de datos (drift) y la falta de mantenimiento hacen recomendable reentrenar con datos actuales antes de cualquier uso operativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tatiyaya/walmart-sales-prediction-model
- Dataset de origen (Kaggle): https://www.kaggle.com/datasets/mikhail1681/walmart-sales
- Documentación de scikit-learn: https://scikit-learn.org/stable/
- Documentación de joblib: https://joblib.readthedocs.io/
- Documentación de huggingface_hub: https://huggingface.co/docs/huggingface_hub
