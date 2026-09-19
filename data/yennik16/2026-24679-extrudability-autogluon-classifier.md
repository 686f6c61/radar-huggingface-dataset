# yennik16/2026-24679-extrudability-autogluon-classifier

## Resumen

El modelo `yennik16/2026-24679-extrudability-autogluon-classifier` es un clasificador binario tabular construido con AutoGluon que predice si un objeto de escritorio puede fabricarse mediante extrusión recta de su silueta vista desde arriba, a partir de medidas geométricas tomadas a mano. No es un modelo de lenguaje ni una red neuronal generativa: se trata de un artefacto de AutoML (familia de gradient boosting sobre datos tabulares) entrenado como trabajo de curso para la asignatura *Designing with AI* (Homework 2). El problema que resuelve es acotado pero útil como etapa de filtrado previo: dado un objeto descrito por dimensiones, espesor de pared, número de agujeros, número de aristas rectas, familia de silueta y material, devuelve la etiqueta `extrudable` (1) o `not_extrudable` (0).

El interés técnico de la ficha no está en el tamano del modelo, sino en la metodología experimental. El autor parte de un dataset ajeno de 34 objetos medidos a mano, aplica una partición 70/15/15 estratificada por objeto antes de cualquier aumento de datos y genera 400 filas sintéticas únicamente a partir de los 23 objetos de entrenamiento. Desactiva el bagging y el stacking internos de AutoGluon (`num_bag_folds=0`, `num_stack_levels=0`) y pasa los objetos de validación como `tuning_data`, precisamente para evitar que copias con jitter del mismo objeto cayeran a ambos lados de una frontera de validación cruzada y produjeran una métrica interna optimista.

El resultado es un clasificador cuya mejora seleccionada es un `WeightedEnsemble_L2` que en la práctica se reduce a `LightGBMXT` con peso 1,0, con una balanced accuracy de validación de 0,833. El repositorio de HuggingFace no contiene pesos publicados (tamano del repo 0,0 GB), por lo que hoy por hoy el modelo es reproducible documentalmente, pero no desplegable tal cual desde el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble tabular de AutoGluon (`TabularPredictor`); el modelo seleccionado es `WeightedEnsemble_L2`, que se reduce a `LightGBMXT` con peso 1,0 (passthrough verificado por probabilidades predichas idénticas) |
| Parametros totales | No aplicable: no es una red neuronal; no se publica recuento de parámetros ni número de árboles/hojas del modelo final |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable: entrada tabular de 12 variables (10 numéricas, 2 categóricas) |
| Tipos de cuantizacion | No aplicable: no se publican artefactos en formato cuantizable; no hay GGUF, safetensors ni ONNX en el repositorio |
| Idiomas soportados | No aplicable al texto libre. Las variables categóricas son `silhouette_class` y `material`; el dataset incluye niveles como `wood` y `ceramic`, pero no se documenta la lista completa de niveles |
| Licencia | cc-by-4.0 |
| Formato de pesos | No disponible (tamano del repositorio: 0,0 GB; no se han subido artefactos de AutoGluon) |
| Libreria / version | `autogluon.tabular==1.6.1` |
| Tipo de tarea | Clasificación binaria tabular (`problem_type="binary"`, `positive_class=1`) |
| Metrica de evaluacion | `balanced_accuracy` |
| Semilla | 24679 (particiones y shuffles propios); AutoGluon reporta `model_random_seed = 0` para sus componentes internos |
| Dataset de origen | `sunkaiwen/sketch2stl-parts-tabular` (Serena Sun, CC-BY-4.0) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo secuencial: es un ensemble tabular de AutoGluon sobre 12 variables de entrada. Diez son numéricas (`length_mm`, `width_mm`, `height_mm`, `wall_thickness_mm`, `n_through_holes`, `n_straight_edges`, `aspect_ratio`, `flatness`, `hole_density`, `footprint_mm2`) y dos categóricas (`silhouette_class`, `material`). El preprocesado es deliberadamente mínimo: las medidas conservan sus magnitudes físicas en milímetros, sin escalado, binning ni imputación (el dataset no tiene valores ausentes, según se afirma en la model card), y los niveles categóricos se fijan de forma consistente entre las tres particiones. AutoGluon aplica después su propia codificación interna.

Se excluyeron dos variables por fuga de información: `extrusion_depth_mm`, que es mayor que cero exactamente cuando la etiqueta vale 1 en el 100,0 % de las filas (es la etiqueta disfrazada), y `object_name`, marcada como reveladora de etiqueta por la propia dataset card y heredada por las filas sintéticas, por lo que también actúa como identificador de objeto. Como procedencia se excluyeron `object_id`, `source_object_id`, `split_source`, `aug_technique` y `split`.

Los datos de entrenamiento son 423 filas: 23 objetos medidos más 400 filas sintéticas derivadas exclusivamente de esos 23 objetos, con preservación de etiqueta y verificación de que ninguna fila sintética desciende de un objeto retenido. La validación contiene 5 objetos y el test 6 objetos, siempre con filas medidas únicamente. La búsqueda se hizo en dos pasadas: una búsqueda de cartera de modelos con `presets="medium_quality"` y `time_limit=300` s, y una búsqueda aleatoria de hiperparámetros de LightGBM con `num_trials=20` y `time_limit=300` s sobre `learning_rate` (Real 0,01–0,2 en escala logarítmica), `num_leaves` (Int 4–32), `min_data_in_leaf` (Int 2–20) y `feature_fraction` (Real 0,5–1,0). Los rangos son estrechos de forma intencionada, porque 23 objetos genuinamente independientes no sostienen árboles profundos. No se documenta uso de RLHF, DPO ni ningún otro ajuste por preferencias, algo que no aplica a este tipo de modelo.

## Capacidades

- Clasificación binaria tabular: asigna probabilidad y etiqueta `extrudable` (1) frente a `not_extrudable` (0) a partir de geometría medida a mano.
- Manejo conjunto de variables numéricas continuas (mm, mm², ratios adimensionales) y categóricas (`silhouette_class`, `material`) sin imputación.
- Cálculo implícito de viabilidad geométrica a partir de rasgos derivados como `aspect_ratio`, `flatness`, `hole_density` y `footprint_mm2`.
- Entrenamiento e inferencia sobre datasets pequeños: el conjunto de entrenamiento efectivo son 423 filas y 12 variables.
- Reproducibilidad documentada: semilla fija, particiones descritas y listado de variables excluidas por fuga o por procedencia.
- No dispone de generación de texto, razonamiento, código, matemáticas simbólicas, visión, audio ni capacidades multilingües.
- No soporta tool calling, function calling, uso como agente ni razonamiento multi-paso.
- No tiene modo "thinking" ni ningún mecanismo de cadena de pensamiento.
- No se documenta API de explicabilidad propia más allá de las importancias de características que AutoGluon pueda calcular internamente.

## Casos de uso

- Filtrado previo en un pipeline sketch-to-STL: colocar el clasificador delante del generador de mallas para descartar de forma barata los objetos que no son extrusionables, reservando el cómputo caro solo para los candidatos viables. Es adecuado porque la inferencia sobre 12 variables es prácticamente instantánea frente al coste de generar un STL.
- Priorización de catálogos de piezas en fabricación aditiva: dado un inventario de objetos medidos, ordenar por probabilidad de extrusionabilidad para decidir qué se fabrica por extrusión (más barato) y qué requiere otro proceso. El modelo devuelve probabilidad, no solo etiqueta, lo que permite ordenar por umbral.
- Etiquetado asistido y aprendizaje activo: usar las predicciones para preseleccionar objetos dudosos que un humano debe medir y etiquetar a mano, reduciendo el coste de ampliar el dataset más allá de los 34 objetos originales.
- Material docente de AutoML: sirve como caso de estudio reproducible de fuga de datos en datasets pequeños, de partición por grupo antes del aumento de datos y de por qué el stacking interno puede inflar la métrica de validación.
- Auditoría de calidad de datasets tabulares: el procedimiento de exclusión de `extrusion_depth_mm` y `object_name` y la verificación de linaje entre filas sintéticas y objetos padre son reutilizables como plantilla de validación en otros proyectos.
- Pre-chequeo en herramientas de diseño asistido: integrado como aviso temprano en un plugin o formulario de CAD, indicando al usuario si la pieza que acaba de medir es candidata a extrusión recta antes de invertir tiempo en modelado.
- Filtro de plausibilidad en generación automática de piezas: combinado con un modelo generativo de geometría, actuar como discriminador barato que descarta salidas incoherentes con el proceso de extrusión.

## Benchmarks y rendimiento

Se publican resultados de validación (balanced accuracy) de la búsqueda de cartera de modelos, pero no resultados sobre el conjunto de test. Las cifras de la tabla de hiperparámetros aparecen truncadas en la información disponible.

Busqueda A (cartera de modelos, `presets="medium_quality"`, `time_limit=300` s):

| Modelo | score_val (balanced accuracy) | fit_time (s) |
|---|---|---|
| XGBoost | 0,833 | 3,369 |
| NeuralNetTorch | 0,833 | 3,347 |
| LightGBMXT | 0,833 | 2,314 |
| WeightedEnsemble_L2 | 0,833 | 2,673 |
| LightGBM | 0,750 | 3,466 |
| LightGBMLarge | 0,750 | 2,789 |
| RandomForestEntr | 0,667 | 1,652 |
| RandomForestGini | 0,667 | 1,693 |
| NeuralNetFastAI | 0,500 | 1,439 |
| ExtraTreesEntr | 0,417 | 1,830 |
| ExtraTreesGini | 0,417 | 1,595 |

Busqueda B (optimización de hiperparámetros de LightGBM, `num_trials=20`, `time_limit=300` s):

| Modelo | score_val (balanced accuracy) | fit_time (s) |
|---|---|---|
| LightGBM/T9 | 0,833 | 0,800 |
| WeightedEnsemble_L2 | 0,833 | no disponible (tabla truncada en la información proporcionada) |

Advertencias sobre estas cifras: el `WeightedEnsemble_L2` ajusta sus pesos sobre los datos de validación y luego se evalúa sobre esos mismos datos, por lo que su puntuación está sesgada de forma optimista respecto a los modelos base; además, al reducirse a `LightGBMXT` con peso 1,0, no aporta diversidad real. No se han publicado resultados de test, MMLU, HumanEval ni GSM8K, que por otra parte no aplican a este tipo de modelo.

## Requisitos de hardware

- No aplicable en el sentido habitual de VRAM para inferencia de redes neuronales: el modelo es un ensemble de gradient boosting sobre 12 variables, ejecutable en CPU.
- El repositorio no contiene artefactos (tamano 0,0 GB), por lo que no hay pesos descargables y no puede estimarse un consumo de memoria en inferencia a partir del Hub.
- Los tiempos de ajuste registrados en la búsqueda de cartera oscilan entre 1,439 s y 3,466 s por modelo base en el entorno del autor, lo que indica un coste de entrenamiento muy bajo en CPU.
- GPU recomendadas: no disponible. No se documenta uso de GPU ni se justifica para este tamano de datos.
- Cabe en cualquier GPU de consumo y, de hecho, en equipos sin GPU; no se documenta ningún requisito de acelerador.
- Opciones de despliegue: AutoGluon (`TabularPredictor`) en local o en un servicio propio. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de inferencia.

## Comparativa con modelos similares

No se conocen modelos publicados directamente comparables (mismo objetivo de extrusionabilidad, mismo dataset). La comparación más informativa es la interna entre familias evaluadas por AutoGluon sobre los mismos datos y con la misma métrica:

| Familia / modelo | score_val (balanced accuracy) | Licencia del artefacto | Disponibilidad |
|---|---|---|---|
| LightGBMXT (modelo seleccionado vía WeightedEnsemble_L2) | 0,833 | cc-by-4.0 (este repositorio) | Repositorio vacío, sin pesos publicados |
| XGBoost | 0,833 | no disponible para este artefacto | No publicado |
| NeuralNetTorch | 0,833 | no disponible para este artefacto | No publicado |
| LightGBM / LightGBMLarge | 0,750 | no disponible para este artefacto | No publicado |
| RandomForest (Gini / Entr) | 0,667 | no disponible para este artefacto | No publicado |
| ExtraTrees (Gini / Entr) | 0,417 | no disponible para este artefacto | No publicado |

Comparativa frente a alternativas externas de la misma categoría (clasificadores tabulares AutoML genéricos como AutoGluon, Auto-sklearn o H2O AutoML): no disponible, al no existir resultados publicados sobre este mismo dataset para esos sistemas.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni artefactos (0,0 GB): el modelo no puede cargarse directamente desde HuggingFace y hay que reentrenarlo a partir del notebook y del dataset de origen.
- El conjunto de datos subyacente son 34 objetos medidos a mano, con solo 6 objetos en test y 5 en validación. La varianza de cualquier métrica estimada sobre estas particiones es muy alta y no permite conclusiones firmes sobre generalización.
- Aproximadamente el 95 % de las filas de entrenamiento son copias sintéticas con jitter de 23 objetos padre. Esto limita la diversidad efectiva del entrenamiento aunque se haya controlado la fuga entre particiones.
- El propio autor declara que el modelo no es adecuado para decisiones de ingeniería, fabricación, tolerancias o seguridad. Es una herramienta de curso y de prototipado.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de sobreconfianza: las probabilidades se calibraron sobre un conjunto de validación de 5 objetos.
- Las predicciones dependen de la calidad de las mediciones manuales de entrada; errores de medición en milímetros se propagan directamente al resultado.
- Sesgo potencial derivado de la composición del dataset: predominio de objetos de escritorio y de determinados materiales (se citan `wood` y `ceramic` como niveles poco frecuentes), lo que puede degradar el rendimiento en materiales o familias de silueta poco representados.
- Cobertura limitada a la tarea de extrusión recta de la silueta superior; no modela tolerancias, ensamblajes, orientación de impresión ni requisitos estructurales.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero el dataset de origen también es CC-BY-4.0 y exige atribución a su autora, Serena Sun. Conviene revisar los términos antes de cualquier uso productivo.
- La model card contiene un marcador de posición (`YOUR NAME`) en lugar del nombre del autor, lo que dificulta la atribución correcta.
- No se documentan métricas sobre el conjunto de test ni análisis de calibración, y la tabla de la búsqueda de hiperparámetros está incompleta en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yennik16/2026-24679-extrudability-autogluon-classifier
- Dataset de origen: https://huggingface.co/datasets/sunkaiwen/sketch2stl-parts-tabular
- Repositorio oficial de AutoGluon: https://github.com/autogluon/autogluon
- Resultados de la búsqueda web: no se encontraron páginas relevantes sobre este modelo. Los resultados devueltos corresponden a centros de ayuda de YouTube y a la comunidad Zhihu, sin relación con el modelo ni con AutoGluon.
