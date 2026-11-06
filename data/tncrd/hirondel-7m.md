# Tncrd/Hirondel-7M

## Resumen

Hirondel-7M es un modelo fundacional de series temporales desarrollado por Tncrd, orientado a pronóstico probabilístico zero-shot. Con 7,46 millones de parámetros, genera 9 cuantiles (de 0,1 a 0,9) para cualquier horizonte de predicción sin necesidad de reentrenamiento, y está diseñado para ejecutarse en CPU. Se distribuye bajo licencia Apache-2.0 junto con su código de inferencia en el repositorio de GitHub del autor.

El modelo aborda el problema del pronóstico probabilístico de series temporales sin ajuste específico por dominio: dado un contexto histórico, produce una distribución predictiva completa en lugar de una única estimación puntual. Su relevancia radica en la relación precisión/tamaño: según los datos declarados por el autor, en el momento de su publicación (octubre de 2026) era el modelo más preciso en GIFT-Eval, fev-bench y TIME entre los modelos de menos de 10 millones de parámetros con pesos públicos y licencia permisiva.

La ficha se basa exclusivamente en la model card y los resultados declarados por el autor, que no están verificados de forma independiente ni figuran aún en los leaderboards oficiales. La versión 1.1 incorpora soporte para covariables conocidas en el futuro (calendario, promociones, precios, consignas) mediante una regresión ridge sobre el contexto, sin reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional de series temporales; detalles en el repositorio de código) |
| Parametros totales | 7.462.049 (7,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo numérico de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo (tipo de transformer, mecanismo de atención, tokenización de series o diseño de la cabeza probabilística). La model card únicamente especifica que se trata de un modelo fundacional de pronóstico probabilístico zero-shot que emite 9 cuantiles (0,1 a 0,9) para cualquier horizonte, con inferencia viable en CPU. Los detalles de arquitectura, composición del dataset de entrenamiento, número de tokens o series utilizadas y si hubo ajuste por RLHF/DPO no están disponibles en la información consultada; el repositorio de código (github.com/tncrd/hirondel) se indica como fuente para los detalles de inferencia y paridad numérica.

La innovación destacable documentada es el soporte de covariables conocidas en el futuro introducido en la versión 1.1: por serie, se ajusta una regresión ridge del objetivo sobre las covariables en la ventana de contexto, el modelo pronostica el resto y el efecto de las covariables sobre el horizonte se suma de vuelta a cada cuantil. Un mecanismo de compuerta (activado por defecto) decide si se aplica la corrección. Este enfoque permite incorporar calendario, promociones, precios o consignas sin reentrenar el modelo.

## Capacidades

- Pronóstico probabilístico zero-shot: genera 9 cuantiles (0,1 a 0,9) por paso temporal, lo que permite construir intervalos de predicción y distribuciones completas.
- Horizonte arbitrario: el modelo acepta cualquier `prediction_length` en la llamada de inferencia, según el ejemplo de uso de la model card.
- Pronóstico univariante: cada serie se pronostica de forma independiente, sin covariables, en el modo evaluado en los benchmarks.
- Covariables conocidas en el futuro (v1.1): calendario, promociones, precios y consignas mediante regresión ridge con compuerta de corrección.
- Inferencia en CPU: el tamaño de 7,5 M de parámetros permite ejecución sin GPU.
- API en Python: clase `HirondelForecaster` con `from_pretrained` y método `forecast`, que devuelve un array de forma `(1, horizonte, 9)`.
- No dispone de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso: es un modelo puramente numérico de series temporales.

## Casos de uso

- Planificación de demanda en retail: pronosticar ventas por producto y tienda a horizonte semanal o mensual con intervalos de confianza derivados de los 9 cuantiles, usando las covariables de calendario y promociones de la versión 1.1 para capturar picos estacionales sin reentrenamiento.
- Gestión de inventario y reposición: estimar la distribución de la demanda futura para fijar niveles de stock de seguridad a partir del cuantil 0,9, con ejecución en CPU que abarata el despliegue en entornos con muchos SKU.
- Previsión de carga y capacidad en infraestructura: pronosticar métricas operativas (peticiones por segundo, utilización de CPU) a corto plazo y usar los cuantiles altos para dimensionar el autoescalado.
- Análisis financiero y de series económicas: generar bandas de predicción para indicadores con horizonte arbitrario, útil en escenarios de presupuestación donde importa la incertidumbre y no solo el valor central.
- Monitorización industrial y mantenimiento predictivo: pronosticar sensores de planta (temperatura, vibración, presión) y detectar desviaciones comparando la lectura real con los intervalos cuantílicos; la model card reporta resultados específicos en IND-Eval con cinco fuentes industriales no vistas en entrenamiento.
- Pronóstico energético: predecir generación o consumo con covariables exógenas conocidas (hora del día, día de la semana, tarifas) gracias al soporte de `future_covariates`.
- Evaluación comparativa de modelos de forecasting: servir como baseline ligero y permisivo (Apache-2.0) en pipelines de investigación que necesiten un modelo fundacional sin coste de GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; no figuran aún en los leaderboards oficiales a fecha de los datos). En GIFT-Eval y TIME, menor es mejor (normalizado por Seasonal Naive); en fev-bench, mayor es mejor (skill score en %).

| Benchmark | MASE | CRPS / SQL | Notas |
|---|---|---|---|
| GIFT-Eval (97 tareas) | 0,7003 | 0,4816 (CRPS) | Normalizado por Seasonal Naive |
| fev-bench (100 tareas) | 32,91 (skill MASE, %) | 44,90 (skill SQL, %) | Mayor es mejor |
| TIME (98 tareas) | 0,6551 | 0,5520 (CRPS) | Normalizado por Seasonal Naive |

Comparativa declarada por el autor en modo univariante forzado (GIFT-Eval y TIME normalizados por Seasonal Naive; fev-bench en skill SQL):

| Modelo | Parametros | Licencia | GIFT-Eval MASE | GIFT-Eval CRPS | TIME MASE | TIME CRPS | fev-bench SQL |
|---|---|---|---|---|---|---|---|
| Toto-2.0-4m | 4,1 M | Apache-2.0 | 0,7591 | 0,5269 | 0,6940 | 0,5850 | 40,04 |
| Timestral-5M | 5,2 M | Modified MIT (límite de ingresos) | 0,7102 | 0,4836 | 0,6571 | 0,5490 | 44,36 |
| Hirondel-7M | 7,5 M | Apache-2.0 | 0,7003 | 0,4816 | 0,6551 | 0,5520 | 44,90 |
| Moirai-2.0-small | 11,4 M | CC-BY-NC-4.0 | 0,7281 | 0,5164 | 0,7030 | 0,5885 | 39,31 |
| FlowState-r1.1 | 18,5 M | Apache-2.0 | 0,7014 | 0,4901 | no disponible | no disponible | no disponible |
| Toto-2.0-22m | 21,9 M | Apache-2.0 | 0,7226 | 0,5009 | 0,6751 | 0,5654 | 42,37 |
| Timestral-28M | 27,8 M | Modified MIT (límite de ingresos) | 0,6817 | 0,4641 | 0,6455 | 0,5408 | 45,86 |
| TiRex | 35,0 M | NX-AI Community License | 0,7213 | 0,4921 | 0,6831 | 0,5731 | 42,58 |
| Chronos-2 | 119,5 M | Apache-2.0 | 0,7037 | 0,4911 | 0,6659 | 0,5584 | 43,97 |
| TimesFM-2.5 | 231,3 M | Apache-2.0 | 0,7050 | 0,4903 | 0,6686 | 0,5674 | 42,20 |

En IND-Eval (datos industriales), el autor reporta para Hirondel 0,839 nMASE y 0,536 nCRPS en las cinco fuentes no vistas en entrenamiento; en modo univariante por canal queda por delante de Chronos-2, TimesFM-2.5 y TiRex, a la par de Timestral-5M y Toto-2.0-22m, y por detrás de Timestral-28M. Según el autor, si se añadieran sus resultados al leaderboard de fev-bench, ocuparía la posición 7 de 33 en SQL y la 6 de 33 en MASE entre los modelos mostrados por defecto (lectura del 23 de octubre de 2026).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 7,46 M de parámetros en safetensors, el peso del modelo es de decenas de megabytes, por lo que la inferencia en GPU requeriría una cantidad de memoria muy reducida.
- GPU recomendadas: no especificadas por el autor; el modelo está diseñado para ejecutarse en CPU, por lo que cualquier GPU consumer (por ejemplo, RTX 4090) sería más que suficiente si se desea acelerar.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del modelo.
- Opciones de despliegue: librería `hirondel` (instalación vía `pip install "hirondel @ git+https://github.com/tncrd/hirondel@v1.1.0"`; el autor indica que la publicación en PyPI está en preparación). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GIFT-Eval MASE | TIME MASE | fev-bench SQL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Hirondel-7M | 7,5 M | no disponible | 0,7003 | 0,6551 | 44,90 | Apache-2.0 | Hugging Face + GitHub |
| Timestral-5M | 5,2 M | no disponible | 0,7102 | 0,6571 | 44,36 | Modified MIT (límite de ingresos) | Pesos públicos |
| Toto-2.0-4m | 4,1 M | no disponible | 0,7591 | 0,6940 | 40,04 | Apache-2.0 | Pesos públicos |
| Chronos-2 | 119,5 M | no disponible | 0,7037 | 0,6659 | 43,97 | Apache-2.0 | Pesos públicos |

Frente a Timestral-5M, Hirondel-7M es ligeramente más preciso en GIFT-Eval y fev-bench con una licencia plenamente permisiva (frente al límite de ingresos del Modified MIT). Frente a Chronos-2, obtiene mejor MASE en GIFT-Eval y TIME con aproximadamente 16 veces menos parámetros. Frente a Toto-2.0-4m, es más preciso en las tres métricas con casi el doble de parámetros. Los datos de contexto de todos los modelos comparables no están disponibles en la información consultada.

## Limitaciones y advertencias

- Resultados no verificados: todas las cifras de benchmarks proceden del autor, marcadas como `verified: false`, y no estaban listadas en los leaderboards oficiales en el momento de la publicación.
- Sesgos: no documentados en la información disponible; al ser un modelo entrenado sobre datos de series temporales, puede heredar sesgos de la composición de su corpus de entrenamiento, que no se detalla.
- Riesgo de pronóstico erróneo: como todo modelo probabilístico, los cuantiles pueden quedar mal calibrados en series con distribuciones muy distintas a las del entrenamiento; la evaluación en IND-Eval sugiere degradación fuera de dominio (0,839 nMASE frente a 0,6551 de MASE en TIME).
- Limitaciones de idioma: no aplica, pero tampoco soporta entradas textuales ni multimodales.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución; no se documentan restricciones adicionales.
- Dependencia de la librería `hirondel`: el paquete en PyPI está en preparación y la instalación recomendada es desde GitHub, lo que añade fricción operativa y riesgo de cambios entre versiones.
- Madurez y adopción: 106 descargas y 1 like en Hugging Face en la fecha de los datos; ecosistema pequeño y sin validación independiente por parte de terceros.
- Covariables futuras: la corrección por regresión ridge es una aproximación lineal; su calidad depende de la relación entre covariables y objetivo y del mecanismo de compuerta, cuyos detalles no se especifican en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tncrd/Hirondel-7M
- Repositorio de código y pesos: https://github.com/tncrd/hirondel
- Instalación del paquete (v1.1.0): `pip install "hirondel @ git+https://github.com/tncrd/hirondel@v1.1.0"`
- Dataset IND-Eval: https://huggingface.co/datasets/cognitedata/IND-Eval
- Detalles de IND-Eval y protocolo: https://github.com/tncrd/hirondel#industrial-data-ind-eval
- Datos de leaderboards usados por el autor: carpeta `showcase/data/` del repositorio de código
- Verificación de la afirmación de precisión: `showcase/README.md` del repositorio de código
