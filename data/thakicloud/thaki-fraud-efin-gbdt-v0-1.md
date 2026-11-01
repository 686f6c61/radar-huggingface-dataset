# ThakiCloud/Thaki-Fraud-EFin-GBDT-v0.1

## Resumen

Thaki-Fraud-EFin-GBDT-v0.1 es un modelo de clasificación tabular basado en LightGBM (gradient boosting sobre árboles de decisión) desarrollado por ThakiCloud. Su propósito es servir como línea base para la detección de anomalías en transferencias electrónicas de fondos dentro de una red interbancaria, empleando exclusivamente el conjunto de datos sintético 71925 de AI-Hub. El modelo no es un sistema de detección de fraude: nunca ha visto datos reales de entidades financieras y sus puntuaciones carecen de significado sobre tráfico de producción.

El modelo se distribuye como un booster de LightGBM en formato de texto (`model.txt`) acompañado de un esquema de características (`feature_schema.json`), un generador de características (`fraud_features.py`) y scripts de inferencia (`predict.py`) y de ejemplo (`make_example.py`). Está pensado para reproducir y auditar un pipeline de detección de anomalías con features point-in-time, no para despliegue operativo.

La relevancia actual del modelo es metodológica: documenta de forma explícita un caso de retracción de resultados por fuga temporal (leakage) en features de histórico, y demuestra cómo construir features que solo usan transacciones estrictamente anteriores de cada entidad. Es un ejemplo útil de buenas prácticas de validación temporal en modelos tabulares, más que una herramienta de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (LightGBM) |
| Parámetros totales | no disponible (modelo de árboles; número de hojas y profundidad no publicados) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; 14 features de entrada por transacción) |
| Tipos de cuantización | no disponible (formato de texto nativo de LightGBM) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | LightGBM text model, versión v4 (`model.txt`) |
| Versión de librería | LightGBM 4.6.0, Python 3.12.8, pandas 2.2.3 |
| Pipeline | tabular-classification |

## Arquitectura y entrenamiento

El modelo es un booster de LightGBM entrenado sobre el subconjunto de transferencias electrónicas (EFin) del dataset sintético 71925 de AI-Hub, que contiene 4.434.106 filas y 17.175 positivos (0,387 %) en la porción publicada. Las entradas son 14 features: identificadores de la entidad financiera de origen y destino (`출금금융회사일련번호`, `입금금융회사일련번호`), tipo de fondos (`자금구분`), importe (`거래금액`), franja horaria (`거래시간대`), canal (`매체구분`) y ocho features de histórico construidas point-in-time (`h_prev_n`, `h_amt_ratio_mean`, `h_gap_h`, `h_pair_prev_n`, `h_new_counter`, `h_day_prev_n`, `h_day_prev_amt`, `h_counter_fanin_prev`). Se eliminaron antes del entrenamiento identificadores, columnas de etiqueta y descripción, columnas de calendario y los números de cuenta y fecha.

El entrenamiento se realizó sobre transacciones anteriores al 2023-07-01, con parada temprana en el periodo 2023-07 a 2023-12 (mejor iteración: 73), y posterior reentrenamiento sobre todo lo anterior a 2024 con ese número de iteraciones. Las features de histórico solo usan transacciones de la misma entidad en franjas (fecha, hora) estrictamente anteriores, sin contar filas de la misma franja horaria. El job de entrenamiento incluyó comprobaciones de causalidad (0 celdas cambiadas al añadir filas posteriores antes de 2023-01-01 y 2024-01-01), reproducibilidad (mismo SHA-256 al construir las features dos veces) e inferencia (diferencia absoluta máxima de 0,0 al recargar el modelo).

## Capacidades

- Clasificación binaria de transacciones tabulares como anómalas o normales, con puntuación de probabilidad calibrada.
- Construcción de features de histórico point-in-time por entidad (número de transacciones previas, ratio de importe medio, hueco temporal, novedad de contraparte, fan-in de contraparte).
- Inferencia por lotes sobre ficheros CSV con el esquema de columnas del dataset 71925.
- Reproducibilidad verificable mediante hashes SHA-256 de todos los artefactos.
- Generación de filas de ejemplo aleatorias (`make_example.py`) para probar el pipeline sin acceso al dataset.
- Soporte de categorías mediante vocabularios definidos en `feature_schema.json`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Auditoría de pipelines de detección de anomalías: el modelo y sus scripts sirven para verificar que una implementación de features point-in-time reproduce las comprobaciones de causalidad y reproducibilidad documentadas, usando `make_example.py` para generar datos de prueba.
- Docencia y formación en validación temporal: el caso de retracción (PR-AUC 0,730 con leakage frente a 0,538 sin leakage) es un ejemplo concreto para explicar fuga de información en features de histórico.
- Línea base para experimentación con el dataset 71925: permite comparar nuevos modelos tabulares contra un LightGBM de 73 iteraciones con métricas publicadas (PR-AUC 0,538, ROC-AUC 0,9976, ECE 0,0008).
- Prototipado de esquemas de features: `fraud_features.py` y `feature_schema.json` pueden reutilizarse como referencia para definir features de histórico por entidad en otros conjuntos de datos transaccionales.
- Evaluación de calibración: el ECE de 0,0008 sobre el conjunto sintético sirve como referencia para estudiar el efecto de la prevalencia en la calibración al reescalar a la prevalencia de origen (0,10 %).
- Pruebas de integración de LightGBM en entornos Python: el modelo en formato de texto v4 permite validar versiones de librería (LightGBM 4.6.0, pandas 2.2.3, Python 3.12.8) en pipelines de CI.

## Benchmarks y rendimiento

Evaluado sobre 1.431.700 transacciones de 2024 (6.636 positivos). El autor advierte que la ventana de 2024 se observó en experimentos previos, por lo que son cifras de hold-out reportadas, no un test sellado.

| Métrica | Valor |
|---|---|
| PR-AUC | 0,538 |
| ROC-AUC | 0,9976 |
| Expected calibration error | 0,0008 |

| FPR objetivo | Recall | Precisión (prevalencia sintética) | Precisión (reescalada a prevalencia de origen) |
|---|---|---|---|
| 0,05 % | 0,149 | 0,581 | 0,230 |
| 0,10 % | 0,333 | 0,608 | 0,250 |
| 0,50 % | 0,832 | 0,437 | 0,143 |
| 1,00 % | 1,000 | 0,318 | 0,091 |

Prevalencia de origen usada para el reescalado: 0,10 % (el conjunto sintético la infla a 0,387 %). Como referencia, una regla de umbral simple `importe > 1.500.000 KRW` alcanza PR-AUC 0,392 sobre las mismas filas de 2024.

## Requisitos de hardware

- Inferencia en CPU: LightGBM con 73 iteraciones es ligero; no requiere GPU.
- VRAM estimada: no aplica (modelo de árboles, ejecución en CPU).
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer: el booster en texto ocupa del orden de kilobytes a pocos megabytes; el cuello de botella es la memoria para cargar el CSV de transacciones y construir las features de histórico.
- Opciones de despliegue: script Python con LightGBM 4.6.0 y pandas 2.2.3; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a modelos tabulares).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la información disponible. Como referencia interna, el propio autor cita una versión anterior no publicada con PR-AUC 0,730 que empleaba features con fuga temporal (totales del mismo día, conteos de la misma franja, fan-in de contraparte de todo el periodo); esa cifra no es comparable porque el modelo fue retirado.

| Modelo | Arquitectura | PR-AUC (2024) | Licencia | Estado |
|---|---|---|---|---|
| Thaki-Fraud-EFin-GBDT-v0.1 | LightGBM | 0,538 | Apache-2.0 | Publicado |
| Versión interna anterior (retirada) | LightGBM con features con leakage | 0,730 | no disponible | No publicado |
| Regla de umbral `importe > 1.500.000` | Regla | 0,392 | no aplica | Referencia |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos; no hay ninguna evidencia de rendimiento sobre fraude real.
- Las etiquetas parecen generadas por reglas: todos los positivos del subconjunto superan 1.500.000 KRW, y una regla de umbral simple alcanza PR-AUC 0,392. Las puntuaciones altas reflejan principalmente la recuperación de las reglas del generador.
- Las cifras de 2024 no provienen de un test sellado; la ventana se observó en experimentos anteriores.
- Las features de histórico requieren las transacciones previas de cada entidad en el mismo fichero; puntuar una fila aislada produce histórico vacío.
- No validado como sistema de detección de fraude: sin datos reales, sin tráfico de producción y sin revisión operativa. No debe usarse para bloquear, marcar o puntuar a clientes reales.
- La redistribución del dataset 71925 no está permitida por AI-Hub; el repositorio no incluye filas del dataset, filas derivadas ni predicciones por transacción.
- Idiomas documentados: coreano e inglés; el modelo no procesa texto, por lo que el soporte lingüístico se refiere a la documentación y al esquema de columnas.
- Licencia Apache-2.0 para pesos y código, con avisos de terceros y atribución de la fuente de datos en `NOTICE`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Thaki-Fraud-EFin-GBDT-v0.1
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-Fraud-EFin-GBDT-v0.1/blob/main/MODEL_CARD.ko.md
- Fuente de datos AI-Hub (dataset 71925): https://www.aihub.or.kr
- LightGBM: https://github.com/microsoft/LightGBM
