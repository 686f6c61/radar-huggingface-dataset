# ThakiCloud/Thaki-Fraud-Card-GBDT-v0.1

## Resumen

Thaki-Fraud-Card-GBDT-v0.1 es un modelo de clasificación tabular basado en LightGBM desarrollado por ThakiCloud, diseñado como línea base para la detección de anomalías en autorizaciones de tarjetas. El modelo se entrena exclusivamente sobre el conjunto de datos sintético 71925 de AI-Hub (Corea del Sur), que contiene 1.952.871 filas con 72.008 positivos (3,69 %), derivadas de datos fuente pseudonimizados de 2021 a 2024. No es un sistema de detección de fraude: nunca ha visto datos reales de bancos ni emisores de tarjetas.

La relevancia del modelo es metodológica más que operativa. Su valor reside en la construcción de características point-in-time (solo se usan transacciones estrictamente anteriores en la misma entidad) y en la documentación explícita de las comprobaciones de causalidad y reproducibilidad realizadas durante el entrenamiento. El autor advierte que las etiquetas del dataset parecen generadas por reglas, por lo que las métricas elevadas reflejan principalmente la recuperación de esas reglas, no habilidad real en fraude.

El modelo se distribuye como un booster de LightGBM en formato de texto (`model.txt`, versión v4) junto con un esquema de características JSON, un constructor de características en Python y scripts de inferencia. La licencia es Apache-2.0 para pesos y código, con atribución obligatoria a AI-Hub para los datos, cuya redistribución no está permitida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (LightGBM) |
| Parametros totales | no disponible (modelo de árboles; número de hojas y profundidad no publicados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; ventana de historial por entidad definida por las filas incluidas en el CSV de entrada) |
| Tipos de cuantizacion | no disponible (formato nativo de LightGBM en texto; no se documentan cuantizaciones) |
| Idiomas soportados | ko, en (etiquetas de columnas y documentación; el modelo no procesa texto libre) |
| Licencia | Apache-2.0 (pesos y código); datos AI-Hub con redistribución no permitida |
| Formato de pesos | LightGBM text model, version=v4 (`model.txt`) |

## Arquitectura y entrenamiento

El modelo es un booster de LightGBM entrenado sobre 30 características de entrada que combinan columnas de la transacción (hora de aprobación, importe, códigos de comercio, límite de tarjeta, edad, sexo, canal, sector del comercio, etc.) con características de historial construidas por entidad. Las características de historial (`h_prev_n`, `h_amt_ratio_mean`, `h_gap_h`, `h_pair_prev_n`, `h_new_counter`, `h_day_prev_n`, `h_day_prev_amt`, `h_counter_fanin_prev`) solo utilizan transacciones de la misma entidad en franjas (fecha, hora) estrictamente anteriores; las filas de la misma franja nunca cuentan como pasado. Antes del entrenamiento se eliminaron identificadores, columnas de etiqueta, columnas de calendario y campos como `가맹점KEY`, `승인SEQ`, `승인일자` o `카드KEY`.

El entrenamiento se realizó con transacciones anteriores al 2023-07-01, con parada temprana sobre 2023-07 a 2023-12 (mejor iteración 151) y reentrenamiento posterior sobre todo lo anterior a 2024 con ese número de iteraciones. Se ejecutaron comprobaciones de causalidad (0 celdas modificadas al añadir filas posteriores para las fechas de corte 2023-01-01 y 2024-01-01), de reproducibilidad (mismo SHA-256 al reconstruir características dos veces) y de inferencia (diferencia absoluta máxima 0,0 al recargar `model.txt` y `feature_schema.json`). El autor retiró una versión anterior que alcanzaba PR-AUC 0,997 porque usaba características de historial que miraban transacciones posteriores.

## Capacidades

- Clasificación binaria de anomalía sobre filas tabulares de autorizaciones de tarjeta, devolviendo una puntuación de probabilidad por transacción.
- Construcción de características de historial point-in-time por entidad (tarjeta/cuenta) a partir de las filas incluidas en el fichero de entrada.
- Inferencia por lotes mediante `predict.py` sobre CSV con el esquema de columnas del dataset 71925.
- Generación de filas de ejemplo aleatorias con `make_example.py` para probar el pipeline sin disponer de los datos.
- Verificación de integridad mediante hashes SHA-256 y `MANIFEST.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de texto libre, visión o audio.

## Casos de uso

- Reproducción de una línea base tabular: sirve para establecer un punto de comparación reproducible (LightGBM 4.6.0, pandas 2.2.3, Python 3.12.8) antes de probar modelos más complejos sobre el mismo esquema de características.
- Validación de pipelines de características point-in-time: el código `fraud_features.py` y las comprobaciones de causalidad documentadas permiten auditar cómo se construyen las agregaciones históricas sin fuga de información futura.
- Docencia y experimentación con datos sintéticos: el par `make_example.py` + `predict.py` permite ejecutar el flujo completo sin acceder al dataset 71925, útil en entornos académicos con restricciones de datos.
- Pruebas de integración de un scorer tabular en un servicio de inferencia: el modelo en texto y el esquema JSON permiten montar un endpoint de scoring por lotes y medir latencia y calibración (ECE 0,0022 reportado).
- Análisis de calibración y umbrales operativos: las tablas de recall y precisión a distintos FPR (0,05 %, 0,10 %, 0,50 %, 1,00 %) sirven para estudiar el compromiso entre falsos positivos y recall en un entorno controlado.
- Estudio de sesgos de generación de etiquetas: dado que dos de los cuatro tipos de etiqueta se recuperan con recall 1,00 desde columnas de una sola transacción, el modelo es útil para analizar cómo las reglas del generador sintético condicionan el aprendizaje.
- Referencia para comparativas de modelos tabulares: al estar publicado con hashes y manifiesto, permite comparar de forma trazable frente a otros clasificadores sobre el mismo subconjunto.

## Benchmarks y rendimiento

Evaluación sobre 469.902 transacciones de 2024 (16.394 positivos). El autor advierte que la ventana de 2024 se examinó en experimentos anteriores, por lo que son cifras de hold-out reportadas, no un test sellado.

| Metrica | Valor |
|---|---|
| PR-AUC | 0,970 |
| ROC-AUC | 0,9988 |
| Expected calibration error | 0,0022 |

| FPR objetivo | Recall | Precision (prevalencia sintetica) | Precision (reescalada a prevalencia fuente) |
|---|---|---|---|
| 0,05 % | 0,747 | 0,982 | 0,977 |
| 0,10 % | 0,790 | 0,966 | 0,956 |
| 0,50 % | 0,907 | 0,868 | 0,834 |
| 1,00 % | 0,965 | 0,777 | 0,728 |

Prevalencia fuente usada para el reescalado: 2,7 % (el conjunto sintético la infla al 3,69 %). El autor retiró una cifra anterior de PR-AUC 0,997 por fuga temporal en las características de historial.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; es un modelo de árboles LightGBM que se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna; no se documenta soporte GPU ni es necesario para este formato.
- Cabe en cualquier equipo consumer: el booster en texto y el esquema JSON son de tamaño reducido (hashes publicados, sin pesos neuronales).
- Opciones de despliegue: ejecución directa con `predict.py` sobre Python 3.12.8, LightGBM 4.6.0 y pandas 2.2.3; integración como booster en servicios propios que carguen `model.txt` y `feature_schema.json`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas publicadas frente a otros modelos en la información proporcionada. Como referencia cualitativa, se trata de un baseline GBDT tabular sobre un dataset sintético concreto; los modelos neuronales de detección de fraude o los sistemas comerciales de scoring no son comparables directamente porque operan sobre datos reales y esquemas distintos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thaki-Fraud-Card-GBDT-v0.1 | no disponible (GBDT) | no aplica | PR-AUC 0,970; ROC-AUC 0,9988 (2024, no sellado) | Apache-2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo datos sintéticos: el autor declara explícitamente que no hay ninguna afirmación válida sobre detección de fraude en el mundo real.
- Etiquetas aparentemente generadas por reglas: dos de los cuatro tipos de etiqueta se recuperan con recall 1,00 desde columnas de una sola transacción; las métricas altas reflejan la recuperación de las reglas del generador.
- Las cifras de 2024 no provienen de un test sellado; la ventana se examinó en experimentos previos.
- Las características de historial requieren las transacciones anteriores de la entidad; puntuar una fila aislada produce historial vacío y una puntuación sin sentido.
- No validado como sistema de detección de fraude: sin datos reales, sin tráfico de producción y sin revisión operativa. No debe usarse para bloquear, marcar o puntuar a clientes reales.
- La redistribución del dataset 71925 no está permitida por AI-Hub; el repositorio no incluye filas, filas derivadas ni predicciones por transacción.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de extrapolación incorrecta si se interpretan las puntuaciones como probabilidades de fraude real.
- Sesgos conocidos: no documentados en la información proporcionada, más allá del sesgo inherente a la generación sintética de etiquetas.
- Restricciones de licencia: Apache-2.0 permite uso comercial de pesos y código, pero la atribución a AI-Hub es obligatoria y el dataset subyacente no puede redistribuirse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Thaki-Fraud-Card-GBDT-v0.1
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-Fraud-Card-GBDT-v0.1/blob/main/MODEL_CARD.ko.md
- Fuente de datos AI-Hub: https://www.aihub.or.kr (dataset 71925)
- LightGBM: https://github.com/microsoft/LightGBM
