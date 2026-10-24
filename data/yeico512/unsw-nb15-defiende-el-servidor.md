# yeico512/unsw-nb15-defiende-el-servidor

## Resumen

`yeico512/unsw-nb15-defiende-el-servidor` es un clasificador binario tabular de tráfico de red (0 = conexión normal, 1 = ataque) entrenado sobre los splits oficiales del dataset UNSW-NB15. Lo publica el usuario yeico512 en el marco de un taller evaluable de MLOps de la Universidad Externado de Colombia (2026-II), cuyo objetivo declarado no es maximizar una métrica sino versionar y recuperar código, datos, experimentos y modelos. No es un modelo de lenguaje: es un `Pipeline` de scikit-learn con un `HistGradientBoostingClassifier` (200 iteraciones, `learning_rate=0.1`, `max_leaf_nodes=31`, sin early stopping) sobre 42 variables de conexión, con codificación ordinal de las categóricas (`proto`, `service`, `state`).

El artefacto se distribuye en formato `skops` (`model.skops`, 2,2 MB, SHA-256 `562ba1bca9c762c4789a7dcdce4064508d7dc63b180e40b00e57eb302503489c`) y aplica una regla de decisión con umbral fijado a 0,639: se marca ataque si `predict_proba[:, 1] >= 0,639`. El umbral se eligió maximizando el recall de ataque con FPR ≤ 5,00 % sobre predicciones out-of-fold de train (5 folds agrupados), sin usar validación ni test.

Su relevancia es doble: por un lado sirve como referencia reproducible de un flujo MLOps completo (DVC, MLflow, GitHub, tags de versión); por otro, documenta de forma explícita una brecha de generalización notable entre validación (FPR 4,99 %) y test (FPR 18,21 %), lo que lo convierte en un caso de estudio útil sobre deriva de distribución y selección de umbral. La model card está truncada en el apartado de evaluación final, por lo que las conclusiones del autor sobre test no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de árboles con boosting por histogramas (`HistGradientBoostingClassifier` de scikit-learn) dentro de un `Pipeline`; categóricas con codificación ordinal, numéricas `passthrough` |
| Parametros totales | no disponible (200 iteraciones de boosting, hasta 31 hojas por árbol; artefacto de 2,2 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: entrada tabular fija de 42 variables por conexión |
| Tipos de cuantizacion | no disponible; se distribuye un único artefacto en precisión nativa (skops) |
| Idiomas soportados | no aplica (datos tabulares de red; sin idiomas declarados en la model card) |
| Licencia | other (términos no detallados en la información disponible) |
| Formato de pesos | `skops` (`model.skops`), SHA-256 `562ba1bca9c762c4789a7dcdce4064508d7dc63b180e40b00e57eb302503489c` |
| Tarea | Clasificación tabular binaria (normal / ataque) |
| Dataset | UNSW-NB15 (splits oficiales) |
| Variables de entrada | 42 (se excluyen `id`, `attack_cat` y `label`) |
| Umbral de decisión | 0,639 (en `model_config.json`) |
| Versión | `v2`, experimento `exp04_hist_gradient_boosting` |
| Tamaño del repositorio | 0,0 GB (según HuggingFace); modelo de 2,2 MB según la model card |

## Arquitectura y entrenamiento

El estimador es un `HistGradientBoostingClassifier` con `learning_rate=0.1`, `max_iter=200`, `max_leaf_nodes=31` y `early_stopping=False`. Todo el preprocesamiento vive dentro del `Pipeline` y se ajusta únicamente con train: codificación ordinal para las tres categóricas (`proto`, `service`, `state`) y paso directo para las numéricas. La hipótesis del experimento era que el boosting por histogramas con soporte nativo de categóricas igualaría o mejoraría al Random Forest en recall y FPR con un modelo mucho más pequeño y rápido; no se aportan métricas del Random Forest en la información disponible, por lo que esa comparación no puede verificarse.

Datos: entrenamiento y validación provienen exclusivamente de `UNSW_NB15_training-set.csv` (175.341 filas), repartidos en 139.520 filas de train y 34.881 de validación mediante `StratifiedGroupKFold` (semilla 42), sin que ningún grupo de entradas idénticas quede a ambos lados de la partición. Se excluyen los 229 grupos con etiquetas contradictorias (940 filas). El conjunto `UNSW_NB15_testing-set.csv` (82.332 filas) se reserva para una evaluación final única. No se documenta ningún tipo de ajuste por refuerzo ni preferencias humanas: es entrenamiento supervisado clásico sobre etiquetas binarias.

## Capacidades

- Clasificación binaria de conexiones de red: devuelve `score_attack = predict_proba[:, 1]`, lo que permite priorizar por puntuación además de usar el umbral 0,639.
- Detección por categoría de ataque: en validación marca como ataque el 99,99 % de `Generic`, el 99,63 % de `DoS`, el 99,81 % de `Reconnaissance`, el 99,18 % de `Exploits`, el 99,12 % de `Shellcode`, el 100 % de `Backdoor` y `Worms`, el 85,75 % de `Analysis` y el 74,01 % de `Fuzzers`.
- Control explícito del compromiso recall/FPR mediante umbral: la model card publica el comportamiento a 0,639 (operación) y a 0,500 (referencia).
- Inferencia sobre CPU con un artefacto de 2,2 MB, apto para ejecutarse en el mismo host que inspecciona el tráfico.
- Carga reproducible vía `skops` con hash verificado, integrable en un registro de modelos (MLflow) y en un pipeline de CI.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo.
- No tiene capacidades multilingües declaradas, porque su entrada no es texto libre.

## Casos de uso

- Triaje académico de alertas de IDS: usar `score_attack` para ordenar conexiones y revisar primero las de mayor puntuación, reduciendo el volumen de eventos que un analista humano debe inspeccionar en un laboratorio o entorno de prácticas.
- Docencia de MLOps reproducible: el repositorio encadena DVC, MLflow y tags de versión con hashes SHA-256 de datos y modelo, por lo que sirve como ejemplo completo de linaje de artefactos en un curso o taller.
- Ejercicio de calibración de umbral: replicar la regla de selección (máximo recall con FPR ≤ 5 % sobre OOF agrupado) para discutir por qué un umbral óptimo en validación no se traslada a test.
- Estudio de deriva de distribución: comparar la caída de precisión (0,9762 en validación frente a 0,8669 en test) y el aumento de FPR (4,99 % a 18,21 %) para ilustrar el efecto de mezclar periodos o entornos distintos en datos de red.
- Baseline rápido en investigación sobre UNSW-NB15: al ser un modelo de 2,2 MB y entrenamiento en minutos, sirve como referencia inferior contra la que medir arquitecturas más complejas antes de invertir en GPU.
- Filtro de primera etapa en una demo de SOC: descartar el tráfico claramente normal y derivar solo las conexiones marcadas como ataque a un analizador más costoso, asumiendo el coste de un 18 % de falsos positivos en test.
- Prueba de integración de inferencia tabular en producción: cargar el `.skops` en un servicio FastAPI o en un contenedor y validar el contrato de las 42 variables de entrada.

## Benchmarks y rendimiento

Validación (34.881 filas, ataque como clase positiva), dos umbrales:

| Umbral | Recall ataque | Precision ataque | FPR | Macro-F1 | Accuracy |
|---|---|---|---|---|---|
| 0,639 (operación) | 0,9560 | 0,9762 | 4,99 % | 0,9478 | 0,9541 |
| 0,500 (referencia) | 0,9779 | 0,9603 | 8,64 % | 0,9504 | 0,9574 |

Matriz de confusión en validación con umbral 0,639: TP 22.716 · FP 555 · TN 10.565 · FN 1.045.

Detección por categoría en validación (para `Normal` se reporta la tasa de falsos positivos):

| attack_cat | Filas en validación | Marcadas como ataque |
|---|---|---|
| Normal | 11.120 | 4,99 % |
| Generic | 8.000 | 99,99 % |
| Exploits | 6.679 | 99,18 % |
| Fuzzers | 3.528 | 74,01 % |
| DoS | 2.453 | 99,63 % |
| Reconnaissance | 2.099 | 99,81 % |
| Analysis | 400 | 85,75 % |
| Backdoor | 349 | 100,00 % |
| Shellcode | 227 | 99,12 % |
| Worms | 26 | 100,00 % |

Comparación v1 (regresión logística) frente a v2 en validación:

| Métrica | v1 | v2 | Diferencia |
|---|---|---|---|
| Recall ataque | 0,8955 | 0,9560 | +6,05 pp |
| Precision ataque | 0,9724 | 0,9762 | +0,38 pp |
| FPR | 5,44 % | 4,99 % | -0,45 pp |
| Macro-F1 | 0,9022 | 0,9478 | +4,56 pp |
| Falsos negativos | 2.483 | 1.045 | -1.438 |
| Falsos positivos | 605 | 555 | -50 |

Evaluación final única en test (82.332 filas, umbral congelado 0,639):

| Métrica | Validación | Test |
|---|---|---|
| Recall ataque | 0,9560 | 0,9679 |
| Precision ataque | 0,9762 | 0,8669 |
| FPR | 4,99 % | 18,21 % |
| Macro-F1 | 0,9478 | 0,8977 |

Matriz de confusión en test: TP 43.878 · FP 6.739 · TN 30.261 · FN 1.454. ROC-AUC 0,9832 · PR-AUC 0,9877. La model card se interrumpe en el análisis de este resultado, por lo que la interpretación del autor no está disponible.

## Requisitos de hardware

- Inferencia en CPU: el artefacto pesa 2,2 MB y el estimador es un conjunto de árboles, por lo que no requiere GPU en ningún escenario.
- VRAM estimada: 0 GB (no se usa acelerador gráfico). El cuello de botella es la RAM del proceso, del orden de decenas de MB incluyendo el intérprete de Python y scikit-learn; no se publica una cifra medida.
- GPU recomendadas: no aplica. Cualquier GPU sería irrelevante para este modelo.
- Compatibilidad con GPU de consumo: no aplica; cabe en cualquier máquina, incluida una Raspberry Pi o un contenedor con 512 MB de memoria, siempre que se pueda instalar scikit-learn.
- Opciones de despliegue: carga directa con `skops.io.load`, serialización alternativa con joblib/pickle, servicio HTTP con FastAPI o Flask, contenedor Docker, registro y promoción de versiones con MLflow (run `98001a529d484e79a7f6b0cf95dd962d`), datos versionados con DVC sobre el remoto de DagsHub.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada. Por la naturaleza del estimador (200 árboles, 42 variables), se espera inferencia por debajo del milisegundo en CPU, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Familia | Parámetros / tamaño | Contexto | Recall ataque (val) | FPR (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `unsw-nb15-defiende-el-servidor` v2 | HistGradientBoosting | 2,2 MB; 200 iteraciones, 31 hojas | no aplica (42 variables) | 0,9560 | 4,99 % | other | HuggingFace, tag `v2` |
| `exp01_logreg_base` (v1, mismo autor) | Regresión logística + one-hot + estandarización | 0,3 MB | no aplica (42 variables) | 0,8955 | 5,44 % | other | Repo de GitHub, revisión `896ee3984613e60d2af1c5297163524216fec34b` |
| Random Forest (referencia de la hipótesis del autor) | Bagging de árboles | no disponible | no aplica | no disponible | no disponible | no disponible | No se aportan métricas ni artefacto |
| Otros clasificadores tabulares sobre UNSW-NB15 (XGBoost, LightGBM, etc.) | Gradient boosting | no disponible | no aplica | no disponible | no disponible | no disponible | No evaluados en la información proporcionada |

La única comparación con datos verificables es la de v1 frente a v2, ambos del mismo autor y bajo el mismo protocolo de particiones y umbral. No hay resultados publicados en la información disponible que permitan situar este modelo frente a alternativas externas.

## Limitaciones y advertencias

- Brecha de generalización severa: el FPR pasa de 4,99 % en validación a 18,21 % en test, y la precisión de ataque cae de 0,9762 a 0,8669. El umbral 0,639 se optimizó sobre out-of-fold de train y no se recalibró con datos de otro entorno, lo que sugiere sobreajuste al split de entrenamiento o deriva entre los ficheros de training y testing de UNSW-NB15.
- El autor declara explícitamente que no es un sistema de detección listo para producción; su propósito es apoyar a un equipo de seguridad en un entorno académico.
- Punto débil conocido en `Fuzzers`: en validación se detecta el 74,01 %, es decir, aproximadamente uno de cada cuatro ataques de esa categoría pasa como normal. `Analysis` se queda en el 85,75 %.
- Coste de falsos positivos: en validación se marcan como ataque 555 conexiones normales; en test, 6.739. En un SOC real esto implica una carga de revisión considerable.
- Interpretabilidad limitada: a diferencia de la regresión logística de v1, no hay coeficientes por variable que expliquen la decisión.
- Licencia `other` sin términos detallados en la información disponible: antes de cualquier uso comercial debe consultarse el repositorio para verificar condiciones. El dataset UNSW-NB15 tiene sus propias condiciones de uso, independientes de las del modelo.
- La model card está truncada en la sección de evaluación final en test, por lo que falta la conclusión del autor sobre el empeoramiento observado y cualquier análisis de causas.
- Sin idiomas declarados y sin capacidades generativas: no debe confundirse con un LLM ni usarse para tareas de texto.
- Sesgos: no evaluados en la información disponible. Al entrenar solo con el split de training de UNSW-NB15, hereda la composición y las limitaciones de captura de ese dataset (tráfico sintético generado en un entorno de laboratorio), lo que condiciona su validez fuera de ese dominio.
- Riesgo de alucinación: no aplica (modelo discriminativo tabular); el riesgo equivalente es la clasificación errónea con alta confianza, no evaluada mediante calibración en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yeico512/unsw-nb15-defiende-el-servidor
- Repositorio de código (GitHub): https://github.com/Jhaycoltez512/Taller_MLOps (commit de entrenamiento `fecc3296fb838bbc6ec8296959021f9fbeb70cc4`)
- Configuración del experimento: `configs/experiments/exp04_hist_gradient_boosting.yaml` (en el repositorio de código)
- Dataset UNSW-NB15: https://research.unsw.edu.au/projects/unsw-nb15-dataset
- Remoto de datos DVC (DagsHub): https://dagshub.com/Jhaycoltez512/Taller_MLOps.dvc
- Experimento MLflow: nombre `defiende-el-servidor`, run `98001a529d484e79a7f6b0cf95dd962d` (no se proporciona URL directa)
- Paper, blog o demo adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos no guardaban relación con el contenido de la ficha y se han descartado.
