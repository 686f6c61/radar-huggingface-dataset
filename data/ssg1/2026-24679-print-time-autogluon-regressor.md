# ssg1/2026-24679-print-time-autogluon-regressor

## Resumen

El modelo `ssg1/2026-24679-print-time-autogluon-regressor` es un regresor tabular construido con AutoGluon que estima la duración en minutos de un trabajo de impresión 3D a partir de cinco parámetros conocidos antes de laminar: gramos de filamento, porcentaje de relleno, altura de capa, diámetro de boquilla y categoría de uso (funcional o novedad). No es un modelo de lenguaje ni una red neuronal: es un ensemble de árboles de decisión entrenado con AutoML sobre un conjunto de datos tabular de trabajos reales de impresión.

Lo desarrolla el usuario `ssg1` como trabajo de la asignatura 24-679 Designing with AI (otoño de 2026), en la tarea Homework 2 sobre AutoML para aprendizaje automático clásico. Su relevancia es más metodológica que industrial: documenta con detalle un caso de selección de modelos donde la puntuación interna del leaderboard de AutoGluon resulta engañosa cuando hay aumentación de datos y ajuste de hiperparámetros, y demuestra que reevaluar los candidatos sobre un conjunto de validación independiente reordena por completo el ranking.

El modelo tiene un tamaño efectivo de entrenamiento muy reducido, 21 impresiones reales distintas, y unas métricas de error elevadas (MAE de 512,1 minutos en test). El propio autor lo declara explícitamente como material de curso y no como herramienta de planificación de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de árboles de decisión (AutoGluon Tabular 1.6.1); candidato seleccionado: `RandomForest/T9` con 247 estimadores, `max_features=sqrt`, `min_samples_leaf=4`, `max_leaf_nodes=15000`, `max_depth=None`, `bootstrap=True` |
| Parámetros totales | No aplica (modelo de árboles sin pesos neuronales; se desconoce el número de nodos totales) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada tabular fija de 5 variables) |
| Tipos de cuantización | No aplica (no se documenta ninguna cuantización) |
| Idiomas soportados | No disponible (el campo `languages` está vacío; el modelo no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Predictor de AutoGluon serializado (librería `autogluon`); tamaño del repositorio: 0,0 GB |
| Tipo de tarea | `tabular-regression` |
| Variable objetivo | `print_time_min` (minutos, float) |
| Variables de entrada | `filament_g` (g), `infill_pct` (%), `layer_height_mm` (mm), `nozzle_mm` (mm), `use_category` (categórica: functional / novelty) |
| Dataset | `yennik16/3d-print-jobs-tabular` (split de test) |
| Semilla | 24679 |

## Arquitectura y entrenamiento

El modelo final es un bosque aleatorio (`RandomForest/T9`) seleccionado por AutoGluon Tabular 1.6.1 con `problem_type="regression"`, `eval_metric="mean_absolute_error"` y semilla 24679. Se desactivaron explícitamente el bagging y el stacking (`num_bag_folds=0`, `num_stack_levels=0`) para evitar que AutoGluon repartiera variantes sintéticas de una misma impresión a ambos lados de un fold interno. El preprocesado se limita a la coerción de tipos: no hay escalado, imputación ni eliminación de valores atípicos, y AutoGluon se encarga internamente de la codificación de la variable categórica.

Los datos proceden del dataset `yennik16/3d-print-jobs-tabular`, con 30 impresiones reales repartidas 70/15/15 por trabajo. El conjunto de entrenamiento se aumentó con variantes `proportional_jitter` y `knn_interpolation` hasta 321 filas, pero solo contiene 21 impresiones distintas; validación y test contienen 4 y 5 impresiones originales respectivamente. Las particiones publicadas se usaron sin modificar y se verificó que ninguna impresión aporta filas a más de un split. Se excluyeron columnas con fuga de información: `print_time_hms` (el objetivo reformateado), `long_print` (umbral sobre el objetivo) y `part_name` (identificador por trabajo), además de las columnas de procedencia (`source_id`, `parent_id`, `augmentation`, `is_augmented`).

Se ejecutaron dos búsquedas con un presupuesto de 300 segundos cada una: la búsqueda A, un portafolio de familias con `presets="medium_quality"`, y la búsqueda B, un ajuste de 20 trials aleatorios sobre `n_estimators` (50–300), `max_features` (sqrt, log2, 1.0), `min_samples_leaf` (1–8) y `max_depth` (None, 4, 8, 16). El criterio de selección se fijó de antemano: MAE media sobre las cuatro impresiones originales de validación. La importancia por permutación (10 barajados) sobre validación da `layer_height_mm` como variable dominante (145,2 min de incremento de MAE, p = 0,000), seguida de `infill_pct` (74,3; p = 0,001), `filament_g` (32,4; p = 0,074), `use_category` (23,0; p = 0,000) y `nozzle_mm` (-4,9; p = 0,752), esta última sin efecto apreciable.

La innovación metodológica destacable es negativa y documentada: con ajuste de hiperparámetros activo, AutoGluon puntúa cada trial sobre un split interno extraído de las filas de entrenamiento, que contienen variantes sintéticas. Eso hace que el holdout interno pueda contener casi copias de filas usadas en el ajuste y que las puntuaciones sean optimistas. El mejor candidato del leaderboard (`RandomForest/T2`, MAE de leaderboard 31,5 min) cae al puesto 15 de 21 al reevaluarlo sobre impresiones no vistas (262,9 min).

## Capacidades

- Regresión tabular: predice una única variable continua (`print_time_min`) a partir de exactamente cinco entradas numéricas y categóricas conocidas antes del laminado.
- Inferencia determinista y de bajo coste: al ser un bosque de 247 árboles, la predicción no requiere GPU ni procesamiento de secuencias.
- Manejo interno de variables categóricas: `use_category` se pasa como categoría y la codificación la resuelve AutoGluon.
- No soporta generación de texto, razonamiento, código, matemáticas simbólicas, visión ni audio.
- No soporta tool calling, function calling, uso como agente ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa lenguaje natural en ninguna fase.
- Capacidad especial: ninguna documentada (sin modo de pensamiento, sin multimodalidad, sin decodificación especulativa).
- Trazabilidad metodológica: el repositorio incluye el análisis de selección, la importancia de variables y la advertencia sobre `score_val` con `hyperparameter_tune_kwargs` activo.

## Casos de uso

- Docencia de AutoML: sirve como caso de estudio reproducible de un flujo completo de AutoGluon Tabular (presets, búsqueda de hiperparámetros, selección de candidato y evaluación final), con la ventaja de que documenta un error de selección real y cómo detectarlo.
- Investigación metodológica sobre aumentación tabular: el modelo ilustra el efecto de la aumentación por interpolación kNN y jitter proporcional sobre la validez de las particiones internas y sobre las métricas del leaderboard cuando el número de observaciones independientes es muy bajo (21 impresiones).
- Prototipo de estimador previo al laminado: un diseñador podría introducir filamento, relleno, altura de capa, boquilla y categoría para obtener un orden de magnitud de la duración sin abrir el programa de laminado, siempre asumiendo un error esperado de cientos de minutos y con revisión humana del resultado.
- Comparación de configuraciones de impresión en fase de bocetado: permite descartar combinaciones evidentemente lentas antes de invertir tiempo de laminado, aunque no es fiable para decidir entre opciones con diferencias de minutos.
- Estudio de fuga de información en datasets tabulares: el conjunto de columnas excluidas (`print_time_hms`, `long_print`, `part_name`) y las de procedencia sirve como ejemplo didáctico de identificación de fugas y metadatos en un pipeline de ML.
- Análisis de importancia de variables en procesos de fabricación aditiva: la tabla de importancia por permutación con p-valores permite discutir qué parámetros de laminado explican realmente el tiempo de impresión en una muestra pequeña y qué parámetros no aportan señal medible.
- Prueba de integración de predictores AutoGluon en servicios internos: al serializarse como predictor de AutoGluon y ejecutarse solo en CPU, puede envolverse en una API ligera para validar el ciclo completo de despliegue de un modelo tabular, sin valor de producción.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card, no verificados (`verified: false`):

| Métrica | Dataset y split | Valor |
|---|---|---|
| MAE de test (minutos) | `yennik16/3d-print-jobs-tabular`, split `test` (5 impresiones) | 512,1 |
| RMSE de test (minutos) | `yennik16/3d-print-jobs-tabular`, split `test` (5 impresiones) | 970,3 |

Comparación interna de candidatos durante el desarrollo:

| Búsqueda | Candidato | MAE de validación (minutos) |
|---|---|---|
| A: portafolio de familias | `ExtraTreesMSE` | 239,9 |
| B: bosque aleatorio ajustado | `RandomForest/T9` (seleccionado) | 236,4 |
| B: mejor del leaderboard interno | `RandomForest/T2` | 31,5 en leaderboard / 262,9 reevaluado sobre validación |

No se han publicado en la información disponible resultados de benchmarks frente a modelos externos (MMLU, HumanEval, GSM8K u otros no aplican a un regresor tabular). La diferencia entre los dos mejores candidatos (3,5 minutos de MAE sobre cuatro impresiones) queda dentro del ruido de una medición de cuatro puntos, según el propio autor.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un bosque de 247 árboles con `max_leaf_nodes=15000`; no requiere GPU ni aceleradores.
- VRAM estimada: 0 GB. La memoria necesaria es RAM del sistema y es reducida, coherente con un repositorio de 0,0 GB y una estructura de árboles sobre cinco variables de entrada.
- GPU recomendadas: ninguna. El uso de A100, H100 o RTX 4090 no aporta ventaja apreciable para este tipo de modelo.
- Compatibilidad con GPU de consumo: irrelevante; el cuello de botella no es el cómputo de matrices.
- Opciones de despliegue: carga mediante el predictor de AutoGluon (`library_name: autogluon`), típicamente con `Predictor.load()`. No hay información sobre exportación a ONNX, TorchScript u otros formatos. vLLM, llama.cpp, Ollama y TGI no aplican a este modelo.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de peticiones por segundo, y el número total de nodos del bosque no se especifica.

## Comparativa con modelos similares

No se dispone de comparativas publicadas frente a modelos externos de la misma categoría (regresores de tiempo de impresión 3D). La información disponible solo permite comparar los candidatos internos evaluados durante el desarrollo:

| Modelo | Tipo | MAE de validación (minutos) | Estado | Licencia |
|---|---|---|---|---|
| `RandomForest/T9` | Bosque aleatorio ajustado (247 estimadores) | 236,4 | Seleccionado | CC-BY-4.0 |
| `ExtraTreesMSE` | Extra Trees con parámetros por defecto | 239,9 | Descartado | CC-BY-4.0 |
| `RandomForest/T2` | Bosque aleatorio, primer puesto del leaderboard interno | 31,5 (leaderboard) / 262,9 (validación propia) | Descartado | CC-BY-4.0 |

La comparación con alternativas de la misma tarea fuera de este repositorio se marca como no disponible.

## Limitaciones y advertencias

- Tamaño de muestra efectivo mínimo: el entrenamiento se apoya en 21 impresiones reales distintas, no en 321 observaciones independientes; 300 de las 321 filas son variantes sintéticas.
- Error absoluto muy alto: el MAE de test declarado es de 512,1 minutos y el RMSE de 970,3 minutos sobre cinco impresiones, con una única medición por impresión en el holdout.
- Falta de verificación: las métricas del `model-index` están marcadas como `verified: false` y proceden únicamente del autor.
- Riesgo de sobreajuste y de generalización limitada: el espacio de hiperparámetros se restringió deliberadamente porque 21 impresiones no permiten identificar configuraciones más complejas.
- Selección sobre validación ruidosa: la diferencia entre el candidato elegido y el descartado (3,5 minutos de MAE sobre cuatro impresiones) está dentro del ruido, por lo que la elección responde a un criterio predefinido y no a una mejora demostrada.
- Advertencia sobre el leaderboard de AutoGluon: seleccionar candidatos con `score_val` cuando `hyperparameter_tune_kwargs` está activo produce puntuaciones optimistas si las filas de entrenamiento contienen aumentaciones; el autor documenta un reordenamiento del ranking al reevaluar sobre impresiones no vistas.
- Sensibilidad a distribución: el modelo se entrenó con trabajos de una única procedencia y una muestra muy pequeña; no hay garantía de comportamiento ante impresoras, materiales, geometrías o perfiles de laminado distintos.
- Variable sin señal medible: `nozzle_mm` presenta importancia negativa (-4,9 min) y p = 0,752, por lo que su efecto no es distinguible de cero en esta muestra.
- Alcance declarado por el autor: es un trabajo de curso para 24-679 Designing with AI, no una herramienta de planificación de producción.
- Sin capacidades de lenguaje, visión, agentes ni tool calling; no debe presentarse ni evaluarse como modelo generativo.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero la licencia no cubre los posibles sesgos ni la calidad predictiva del modelo; el autor no ofrece garantías.
- Idiomas: no aplica ni está especificado; el campo `languages` está vacío.
- Repositorio sin descargas ni «likes» en el momento de la consulta (0 descargas, 0 likes), lo que indica ausencia de validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssg1/2026-24679-print-time-autogluon-regressor
- Dataset de origen: https://huggingface.co/datasets/yennik16/3d-print-jobs-tabular
- Documentación de AutoGluon Tabular: no disponible en la información proporcionada
- Paper o blog técnico del modelo: no disponible
- Repositorio de código o notebook: no disponible
- Demo: no disponible

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces recuperados corresponden a un servicio de contabilidad y no guardan relación con el contenido de esta ficha.
