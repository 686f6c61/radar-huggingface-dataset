# tmmycruise/marketstudies-forward-rv

## Resumen

El modelo `tmmycruise/marketstudies-forward-rv` es un checkpoint de regresión tabular diseñado para pronosticar la varianza realizada (realized variance) de activos financieros en un horizonte de 21 sesiones. Desarrollado por el usuario tmmycruise (vinay varma) como parte de un estudio de mercado denominado "Study 2", el modelo emplea una especificación OLS compacta con dos características numéricas: el logaritmo de una media móvil exponencial de la varianza realizada a 10 días y el logaritmo de la varianza anualizada implícita de un benchmark de opciones a 30 días. Su propósito principal es servir como componente de pronóstico en aplicaciones de gestión de riesgo y valoración de opciones, aunque no constituye una recomendación de trading por sí mismo.

El modelo fue entrenado sobre un panel de datos completos con 45,688 filas y 19 tickers, y se presenta como un refit de despliegue de la especificación seleccionada en un experimento walk-forward congelado. Las métricas fuera de muestra (OOS) reportadas incluyen un MAE medio por ticker de 0.319758, un Spearman IC de 0.72056, un R² OOS de 0.575354 y un RMSE de 0.427715. La relevancia de este modelo radica en su simplicidad y transparencia: al ser una regresión lineal sin hiperparámetros, ofrece una interpretación directa y un coste computacional mínimo, lo que lo hace adecuado para entornos de producción con restricciones de recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal (OLS) con dos caracteristicas numericas |
| Parametros totales | No disponible (modelo lineal, numero de coeficientes no especificado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No aplica (modelo no neuronal) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | No disponible (se mencionan archivos como `model_index.json` y `checkpoint_manifest.json`, pero no se especifica el formato de serializacion) |

## Arquitectura y entrenamiento

El modelo se basa en una regresion lineal por minimos cuadrados ordinarios (OLS), lo que implica una funcion de prediccion lineal de la forma `y = w1*x1 + w2*x2 + b`, donde `x1` es `log_ewma_rv_10` y `x2` es `log_iv_benchmark_30d_annualized_variance`. No se especifican capas ocultas ni transformaciones no lineales adicionales. El entrenamiento se realizo sobre un panel de datos completo con 45,688 filas y 19 tickers, sin imputacion de valores faltantes. Segun la model card, se trata de un "deployment refit" de la especificacion seleccionada en un experimento walk-forward congelado, lo que significa que los coeficientes se ajustaron sobre todos los datos disponibles tras la seleccion del modelo, y las metricas OOS provienen de la validacion previa, no de este refit.

No se proporcionan detalles sobre el proceso de seleccion de caracteristicas, la composicion exacta del dataset (mas alla de que incluye datos de opciones y varianza realizada) ni sobre tecnicas de regularizacion. Al ser OLS, no hay hiperparametros tunables ni rondas de boosting. La innovacion principal reside en la eleccion de caracteristicas basadas en EWMA y varianza implicita, que capturan informacion de volatilidad pasada y expectativas de mercado.

## Capacidades

- Regresion tabular para pronostico puntual de la varianza logaritmica anualizada a 21 sesiones.
- Entrada de dos caracteristicas numericas predefinidas, sin soporte para datos categoricos o texto.
- No incluye generacion de texto, razonamiento, codigo, vision ni otras capacidades de modelos de lenguaje.
- No soporta tool calling ni funciones de agente.
- Capacidad multilingue: no aplica, ya que no procesa lenguaje natural.
- No tiene modo de pensamiento (thinking mode) ni procesamiento de audio o video.

## Casos de uso

- Gestion de riesgo de cartera: el pronostico de varianza puede integrarse en modelos de valor en riesgo (VaR) o de ajuste de posiciones, permitiendo a los gestores anticipar cambios en la volatilidad de los activos subyacentes.
- Valoracion de opciones: comparar la varianza pronosticada con la varianza implicita de las opciones para identificar posibles discrepancias de precio, aunque la model card advierte que cualquier estrategia debe considerar costes de transaccion y liquidez.
- Backtesting de estrategias de volatilidad: los investigadores pueden usar el pronostico para simular estrategias que compran o venden volatilidad, evaluando su rendimiento historico.
- Asignacion de activos: la varianza pronosticada puede servir como entrada en modelos de optimizacion de cartera que ajustan pesos segun la volatilidad esperada.
- Monitoreo de riesgo sistemico: en un contexto de multiples tickers, el modelo puede generar pronosticos para un panel de activos, ayudando a detectar aumentos generalizados de volatilidad.
- Investigacion academica en finanzas cuantitativas: el modelo sirve como punto de referencia simple y reproducible para estudiar la relacion entre varianza realizada e implicita, dado su caracter lineal y su documentacion transparente.

## Benchmarks y rendimiento

La model card proporciona metricas fuera de muestra (OOS) congeladas del experimento walk-forward. No se incluyen comparaciones con otros modelos en la informacion disponible.

| Metrica | Valor |
|---|---|
| MAE medio por ticker (OOS) | 0.319758 |
| Spearman IC medio por ticker (OOS) | 0.72056 |
| R² OOS vs media de entrenamiento | 0.575354 |
| RMSE OOS | 0.427715 |

Estas metricas corresponden a la prediccion de log-varianza anualizada. El criterio principal de seleccion fue minimizar el MAE medio por ticker, mientras que el IC y el R² se usaron como guardarrailes.

## Requisitos de hardware

- Al ser un modelo de regresion lineal con dos caracteristicas, no requiere GPU ni aceleracion por hardware.
- Se puede ejecutar en cualquier CPU moderna, incluso en entornos embebidos o funciones serverless.
- El consumo de memoria es minimo: solo se almacenan los coeficientes (dos pesos y un sesgo) y los metadatos de inferencia.
- No se requieren frameworks de inferencia especificos; puede implementarse con librerias estandar como NumPy, scikit-learn o incluso en una hoja de calculo.
- La latencia es practicamente nula (microsegundos) y el throughput es ilimitado en la practica, limitado solo por la velocidad de lectura de los datos de entrada.
- Opciones de despliegue: cualquier servicio de hosting que ejecute Python o un lenguaje con soporte para operaciones aritmeticas basicas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada ni en los resultados de busqueda web. Dado que se trata de un modelo de regresion lineal especifico para un dominio financiero muy concreto, no se pueden establecer comparaciones directas con modelos de lenguaje o de proposito general. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo pronostica varianza realizada, pero no constituye una recomendacion de trading. Cualquier uso en estrategias de opciones debe complementarse con analisis de precios de opciones, costes de transaccion, liquidez y restricciones de riesgo.
- La model card advierte que cambios de regimen, cambios en los tickers, categorias no vistas y alteraciones en la calidad de los datos pueden invalidar el comportamiento en despliegue.
- No se imputan valores faltantes; la inferencia requiere que ambas caracteristicas esten presentes y sean numericas.
- La licencia no esta especificada, lo que genera incertidumbre sobre los terminos de uso comercial y redistribucion.
- No se proporcionan datos sobre sesgos especificos, pero al ser un modelo lineal entrenado en un panel limitado de 19 tickers, podria no generalizar a otros activos o mercados.
- Las metricas OOS provienen de un experimento congelado y no deben interpretarse como garantia de rendimiento futuro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmmycruise/marketstudies-forward-rv
- Perfil del autor: https://huggingface.co/tmmycruise
- Dataset relacionado (mencionado en el perfil): https://huggingface.co/tmmycruise/datasets (contiene `autoresearch-crypto-data`, aunque no se confirma su relacion directa con este modelo)
