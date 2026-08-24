# Varma2905/linear-regression-tetuan-power

## Resumen

El modelo `linear-regression-tetuan-power`, desarrollado por Varma2905, es un modelo de regresion lineal clasico (minimos cuadrados ordinarios) implementado con scikit-learn 1.6.1. Su objetivo es predecir el consumo electrico de la Zona 1 de la ciudad de Tetuan (Marruecos) a partir de cinco variables meteorologicas: temperatura, humedad, velocidad del viento, flujos difusos generales y flujos difusos. Se trata de un modelo tabular de aprendizaje supervisado, no de un modelo de lenguaje o redes neuronales.

El modelo fue entrenado sobre 35.642 muestras del dataset de consumo electrico de Tetuan, con 8.911 muestras reservadas para evaluacion. Su relevancia reside en servir como baseline de regresion para prediccion de demanda energetica, un caso de uso habitual en redes electricas inteligentes y planificacion de infraestructura. El rendimiento es limitado, con un R² de 0,208, lo que indica que la relacion lineal entre las variables meteorologicas y el consumo explica solo una parte de la varianza observada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal (minimos cuadrados ordinarios) |
| Parametros totales | 6 (5 coeficientes + 1 intercepto, derivados de las 5 features documentadas) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | joblib |

## Arquitectura y entrenamiento

El modelo utiliza `sklearn.linear_model.LinearRegression`, que implementa regresion lineal por minimos cuadrados ordinarios (OLS). La funcion aprendida es de la forma y = w·x + b, donde w son los coeficientes asociados a las cinco variables de entrada y b es el intercepto. No incorpora tecnicas de regularizacion, kernels ni arquitecturas no lineales.

El entrenamiento se realizo con scikit-learn 1.6.1 sobre el dataset de consumo electrico de Tetuan. Se emplearon 44.553 filas tras validacion y limpieza, de las cuales 7.863 se reservaron y no participaron en el entrenamiento. La particion train/test fue 80/20 con `random_state=42`, resultando en 35.642 muestras de entrenamiento y 8.911 de test. No se aplicaron tecnicas de RLHF, DPO ni ajuste fino, al tratarse de un modelo clasico de regresion. El autor indica explicitamente que el modelo no debe reentrenarse tras la descarga; se proporciona unicamente para inferencia.

## Capacidades

- Prediccion de consumo electrico continuo (regresion) para la Zona 1 de Tetuan a partir de variables meteorologicas.
- Acepta 5 variables numericas de entrada en un orden especifico: `Temperature`, `Humidity`, `Wind Speed`, `general diffuse flows` y `diffuse flows`.
- Inferencia extremadamente rapida al tratarse de una operacion lineal simple (producto escalar mas intercepto).
- Interpretabilidad directa: los coeficientes del modelo permiten analizar la direccion y magnitud del efecto de cada variable meteorologica sobre el consumo.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni capacidades multimodales.
- No procesa lenguaje natural ni es multilingue.

## Casos de uso

- Prediccion de demanda energetica a corto plazo: el modelo puede estimar el consumo electrico de la Zona 1 de Tetuan a partir de previsiones meteorologicas, permitiendo a operadores de red anticipar picos de demanda y ajustar la generacion.
- Modelo baseline en pipelines de ML: al ser una regresion lineal simple, sirve como referencia para comparar el rendimiento de modelos mas complejos (Random Forest, Gradient Boosting, redes neuronales) sobre el mismo dataset.
- Analisis de sensibilidad meteorologica: los coeficientes del modelo permiten cuantificar como afecta cada variable (temperatura, humedad, viento, radiacion) al consumo electrico, util para estudios academicos y de eficiencia energetica.
- Deteccion de anomalias en la red: las predicciones pueden compararse con consumos reales para identificar desviaciones inusuales que indiquen fallos en la infraestructura o comportamientos atipicos.
- Educacion y formacion: modelo didactico para ensenar regresion lineal, evaluacion de metricas (MAE, RMSE, R²) y flujos de trabajo con scikit-learn y joblib.
- Integracion en servicios de prediccion energetica: puede desplegarse como microservicio (Flask o FastAPI) que reciba datos meteorologicos y devuelva una estimacion de consumo en milisegundos.

## Benchmarks y rendimiento

Metricas de evaluacion calculadas sobre el 20% de test (8.911 muestras), nunca utilizadas durante el entrenamiento:

| Metrica | Valor |
|---|---|
| MAE | 5119,2703 |
| MSE | 39.281.693,2639 |
| RMSE | 6267,5109 |
| MAPE | 0,1658 |
| R² | 0,207988 |
| R² ajustado | 0,207543 |

No se han publicado resultados comparativos con otros modelos de regresion sobre el mismo dataset en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere VRAM; el modelo se ejecuta integramente en CPU.
- RAM: menos de 10 MB para cargar el modelo en memoria.
- GPU: no necesaria; cualquier CPU moderna es suficiente.
- Compatible con sistemas embebidos y entornos de bajos recursos.
- Despliegue: puede integrarse en servicios web con Flask o FastAPI, en pipelines de datos con Apache Airflow, o en notebooks de analisis con Jupyter.
- Latencia: inferior a 1 milisegundo por prediccion en CPU moderna.
- Throughput: practicamente ilimitado para aplicaciones de produccion; el coste por prediccion es despreciable.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos de regresion (Ridge, Lasso, Random Forest, XGBoost) sobre el mismo dataset de Tetuan en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa. El R² de 0,208 sugiere que modelos no lineales probablemente obtendrian mejores resultados, pero esta afirmacion no puede verificarse con los datos disponibles.

## Limitaciones y advertencias

- El R² de 0,208 indica que el modelo solo explica el 20,8% de la varianza del consumo electrico, lo que limita seriamente su precision predictiva en produccion.
- La regresion lineal asume una relacion lineal entre variables independientes y dependiente, supuesto que frecuentemente no se cumple en el consumo electrico real.
- El modelo solo predice el consumo de la Zona 1 de Tetuan; no cubre las Zonas 2 y 3 del dataset original.
- El autor advierte explicitamente de no reentrenar el modelo descargado; esta pensado unicamente para inferencia.
- No se dispone de informacion sobre la licencia, por lo que no puede confirmarse si su uso comercial esta permitido.
- La fecha de creacion del repositorio (agosto de 2026) es posterior a la fecha actual, lo que podria indicar un error en los metadatos.
- El modelo no generaliza fuera del dominio de Tetuan ni a otros periodos temporales sin reentrenamiento con datos locales.
- No se han documentado sesgos especificos, pero al ser un modelo lineal, hereda los sesgos presentes en los datos de entrenamiento.
- El MAPE de 0,1658 implica un error porcentual medio de aproximadamente el 16,6%, que puede ser inaceptable para aplicaciones de facturacion o planificacion critica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Varma2905/linear-regression-tetuan-power
- Repositorio GitHub del dataset de consumo electrico de Tetuan: https://github.com/starmoonn/Tetuan-City-power-consumtion
