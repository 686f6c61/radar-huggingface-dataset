# zopi12/ci-failure-risk

## Resumen

`zopi12/ci-failure-risk` es un pipeline de clasificación tabular construido con scikit-learn que predice, antes de que arranque una ejecución de GitHub Actions, la probabilidad de que esta falle. El modelo no es una red neuronal ni un transformer: es un `HistGradientBoostingClassifier` con ponderación de clases, serializado con joblib y acompañado de un módulo auxiliar (`ci_utils.py`) que valida entradas, construye las 17 características y aplica calibración de Platt (sigmoide) sobre la probabilidad de salida. El autor lo desarrolló como proyecto de la asignatura CT-378 Machine Learning y lo publica como artefacto reproducible en Hugging Face.

El problema que aborda es concreto: dar una señal temprana a desarrolladores y responsables de release antes de consumir minutos de CI o desplegar. La salida se mapea a tres bandas de riesgo (Low / Medium / High) a partir de un umbral de decisión calibrado. La práctica totalidad de la señal predictiva proviene del historial de ejecuciones previas del repositorio y del workflow, complementado con características del cambio (tamaño del diff, ficheros modificados, longitud del mensaje de commit), marca de merge, rama, evento disparador y hora/día de la semana.

Es relevante como ejemplo de modelo tabular pequeño y desplegable en entornos de CI, pero conviene subrayar que se trata de un artefacto de ámbito académico, sin licencia declarada, con cero descargas y sin idiomas ni formatos de pesos estándar de la familia de LLM. No es un modelo generativo ni soporta instrucciones en lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn con `HistGradientBoostingClassifier` (gradient boosting sobre histogramas), ponderación de clases y calibración sigmoide (Platt) |
| Parametros totales | No disponible (modelo de árboles; el número de parámetros no se publica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular de 17 características, no secuencial) |
| Tipos de cuantizacion | No disponible (serialización joblib; sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (no procesa texto libre; solo campos categóricos y numéricos) |
| Licencia | No disponible |
| Formato de pesos | `ci_failure_model.joblib` (dict con pipeline, threshold, features, risk_bands, risk_rates y test_metrics) + `ci_utils.py` |

## Arquitectura y entrenamiento

El modelo es un `HistGradientBoostingClassifier` de scikit-learn con ponderación de clases, seleccionado por macro-F1 en validación entre seis algoritmos ajustados (Regresión Logística, Árbol de Decisión, KNN, SVM lineal, Random Forest e Histogram Gradient Boosting) mediante `RandomizedSearchCV` con `TimeSeriesSplit(5)`. La entrada son 17 características tabulares: tamaño del cambio (`additions`, `deletions`, `files_modified`), longitud del mensaje de commit, flag de merge, rama principal, evento disparador, hora y día de la semana, y estadísticas de historial por repositorio y por workflow (resultado previo, tasa de fallo en las últimas 10 ejecuciones y número de ejecuciones anteriores). La probabilidad de salida se calibra con escalado sigmoide sobre el split de validación ordenado temporalmente antes de exponerse como probabilidad estimada de fallo.

Los datos de entrenamiento combinan dos fuentes. La primera es GADFPD (GitHub Actions CI/CD Failure Prediction Dataset, Faruna et al., 2026, Mendeley Data V1, DOI 10.17632/mggwn7rj9f.1, licencia CC BY 4.0), que cubre del 2016-08-08 al 2026-04-18. La segunda es una recolección propia de 23.818 ejecuciones de workflow de 14 repositorios públicos entre el 2026-04-19 y el 2026-11-20, obtenida con la API REST de GitHub; los nombres de repositorio y actor están hasheados y no se almacena el texto de los mensajes de commit. Solo se conservan ejecuciones con resultado claro (éxito o fallo) y de primer intento. Las ejecuciones se ordenan por tiempo y se dividen 70/15/15 en entrenamiento, validación y test. No se emplean RLHF ni DPO (no aplica a un modelo tabular).

## Capacidades

- Predicción binaria de fallo de una ejecución de GitHub Actions antes de su inicio, con probabilidad calibrada.
- Clasificación en tres bandas de riesgo (Low / Medium / High) a partir de un umbral de decisión configurable.
- Uso de historial por repositorio y por workflow (resultado previo, tasa de fallo en las últimas 10 ejecuciones, número de ejecuciones anteriores).
- Codificación de características del cambio: adiciones, eliminaciones, ficheros modificados, longitud del mensaje, flag de merge.
- Codificación temporal y de disparador: hora, día de la semana, rama principal y evento (p. ej. `push`).
- Inferencia determinista y ligera sobre CPU, apta para ejecutarse dentro de un job de CI.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No tiene capacidades multilingües en el sentido de NLP: no procesa lenguaje natural más allá de campos categóricos controlados.

## Casos de uso

- **Puerta de calidad previa al job de CI**: invocar `predict(bundle, inputs)` con los metadatos del push antes de lanzar el workflow y, si el riesgo es High, requerir revisión manual o ejecutar primero un subconjunto reducido de tests, ahorrando minutos de CI en cambios con alta probabilidad de fallo.
- **Priorización de la cola de ejecuciones**: en un runner compartido, ordenar los workflows entrantes por riesgo estimado y asignar más recursos o revisores a los de riesgo alto, reduciendo el tiempo medio hasta el fallo detectado.
- **Aviso al autor del cambio**: publicar un comentario automático en el pull request con la probabilidad estimada y el nivel de riesgo, de modo que el desarrollador refuerce los tests locales antes de empujar más commits.
- **Análisis de salud de workflows**: agregar las probabilidades por workflow y por rama para identificar pipelines crónicamente frágiles y justificar inversión en su estabilización.
- **Planificación de releases**: usar la banda de riesgo como señal adicional en la decisión de promover un despliegue, combinándola con los checks habituales de revisión y aprobación.
- **Monitorización de deriva del propio modelo**: recalcular periódicamente las métricas held-out y las tasas observadas por banda de riesgo (el notebook regenera umbral, métricas y tasas) para detectar cuándo el calibrado deja de ser fiable tras cambios en los repositorios.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test held-out ordenado temporalmente, puntuado una sola vez:

| Metrica | Valor |
|---|---|
| macro-F1 | 0.690 |
| F1 de la clase fallo | 0.449 |
| Precisión de la clase fallo | 0.540 |
| Recall de la clase fallo | 0.384 |
| ROC-AUC | 0.845 |
| PR-AUC | 0.504 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU exclusivamente; no requiere GPU.
- Huella de memoria muy reducida (modelo de árboles serializado en un `.joblib`; el repo ocupa 0.0 GB según Hugging Face).
- Cabe en cualquier máquina capaz de ejecutar Python 3.12, incluidos runners estándar de GitHub Actions y portátiles de desarrollo.
- Dependencias fijadas: `scikit-learn==1.9.1`, `numpy==2.5.4`, `pandas==3.0.6`, `joblib==1.6.0` (Python 3.12); otras versiones pueden fallar al deserializar.
- Opciones de despliegue: carga directa con `joblib.load` desde `huggingface_hub.hf_hub_download`, o integración como paso previo en un workflow de GitHub Actions; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación facilitada. Como referencia cualitativa, la categoría de modelos tabulares de predicción de fallos de CI incluye aproximaciones basadas en gradient boosting (XGBoost, LightGBM, CatBoost) y regresión logística, pero no se han aportado cifras de ninguno de ellos para establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zopi12/ci-failure-risk | No disponible (árboles) | No aplica | macro-F1 0.690; ROC-AUC 0.845 | No disponible | Hugging Face (0 descargas) |
| Alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los fallos son relativamente raros; el umbral seleccionado produce tanto falsas alarmas como fallos no detectados (recall de la clase fallo de 0.384).
- La mayor parte de la señal proviene del historial de ejecuciones; un repositorio o workflow nuevo se predice principalmente por tamaño del cambio y disparador, con menor fiabilidad.
- La tasa de fallo difiere entre GADFPD (2016-2026) y la recolección propia (2026), y los repositorios cambian con el tiempo, por lo que el modelo puede derivar y debe reentrenarse periódicamente.
- Las ejecuciones de recolección propia se muestrearon por días, de modo que el historial de "últimas 10 ejecuciones" no es estrictamente consecutivo.
- Dos de los 16 repositorios objetivo no están en los datos: `kubernetes/kubernetes` no devolvió ejecuciones y `golang/go` solo devolvió 7, que se eliminaron.
- La calibración puede desviarse a medida que cambian repositorios y workflows; la probabilidad mostrada es una estimación, no una garantía.
- Licencia no declarada: no hay autorización explícita para uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Requiere versiones exactas de dependencias (scikit-learn 1.9.1, numpy 2.5.4, pandas 3.0.6, joblib 1.6.0, Python 3.12); otras combinaciones pueden romper la deserialización.
- Es un artefacto de proyecto académico, no un servicio mantenido; no hay garantías de soporte ni de actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zopi12/ci-failure-risk
- Dataset GADFPD (Mendeley Data V1): https://doi.org/10.17632/mggwn7rj9f.1
- Repositorio de referencia del proyecto: no disponible
- Paper o blog del autor: no disponible
- Demo (Space enlazado desde el README del proyecto): no disponible en la información proporcionada
