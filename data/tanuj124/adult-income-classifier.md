# Tanuj124/adult-income-classifier

## Resumen

El Adult Income Classifier es un modelo de clasificación tabular binaria publicado por el usuario Tanuj124 en Hugging Face, construido como artefacto educativo a partir del dataset UCI Adult (Census Income). Su tarea es predecir si un registro censal corresponde a un ingreso anual superior a 50.000 dólares (`>50K`) o igual o inferior a esa cifra (`<=50K`), a partir de 14 características demográficas y laborales. No es un modelo de lenguaje ni una red neuronal: se trata de un estimador clásico de scikit-learn, concretamente un `AdaBoostClassifier` con 100 estimadores base de tipo `DecisionTreeClassifier(max_depth=2)`, `learning_rate=0.8` y algoritmo `SAMME.R`.

El repositorio empaqueta el estimador junto con los artefactos necesarios para reproducir el preprocesado: los mapeos enteros de cada columna categórica en `preprocessing.json` y el orden exacto de las características en `model_config.json`. Se distribuye un script `inference.py` que expone una función `predict()` y una interfaz de línea de comandos. El autor declara explícitamente que el modelo no redistribuye el dataset original y que no debe emplearse para decisiones con consecuencias sobre personas.

La relevancia de esta ficha es acotada: se trata de un artefacto docente con 0 descargas y 0 "likes" en el momento de la consulta, sin licencia declarada y sin validación comunitaria. Su interés práctico se limita a la docencia de pipelines de machine learning clásico, la reproducibilidad de experimentos tabulares y las pruebas de integración de sistemas de scoring, no a su uso como clasificador de producción sobre poblaciones reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de boosting: `AdaBoostClassifier` (algoritmo `SAMME.R`) sobre 100 estimadores base `DecisionTreeClassifier(max_depth=2)`, `learning_rate=0.8`, `random_state=0` |
| Parametros totales | No publicado por el autor. Estructura derivada de la configuración: 100 árboles de profundidad máxima 2, con hasta 3 nodos de decisión internos cada uno (del orden de 300 divisiones en total). El tamaño del repositorio se reporta como 0.0 GB (artefacto pequeño, en el rango de kilobytes a pocos megabytes) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No aplica: modelo tabular que puntúa un registro independiente de 14 características; no existe ventana de contexto |
| Tipos de cuantizacion | No aplica: el bosque se serializa en precisión completa (float64) mediante joblib; no se publican variantes GGUF, GPTQ, AWQ ni similares |
| Idiomas soportados | No aplica como modelo de lenguaje. Las variables categóricas de entrada usan etiquetas textuales en inglés de EE. UU. (por ejemplo `State-gov`, `Bachelors`, `Never-married`, `United-States`) |
| Licencia | No disponible: el repositorio no declara licencia y el proyecto fuente en GitHub no incluye fichero `LICENSE`. El dataset UCI Adult sí está licenciado como CC BY 4.0 |
| Formato de pesos | Las etiquetas del repositorio indican joblib (serialización pickle de scikit-learn). El artefacto se acompaña de `preprocessing.json` (mapeos de `LabelEncoder`), `model_config.json` (orden de características) y `requirements.txt`; la model card no especifica el nombre ni el tamaño exacto del fichero de pesos |

Características de entrada (14, en el orden registrado por el autor): `age`, `workclass`, `fnlwgt`, `education`, `education-num`, `marital-status`, `occupation`, `relationship`, `race`, `sex`, `capital-gain`, `capital-loss`, `hours-per-week`, `native-country`.

## Arquitectura y entrenamiento

La arquitectura es un ensemble de boosting discreto de la familia AdaBoost. Cada estimador base es un árbol de decisión poco profundo (`max_depth=2`), lo que en la práctica produce árboles de dos niveles con hasta tres divisiones binarias. Con `SAMME.R` el algoritmo emplea las estimaciones de probabilidad de cada estimador débil para actualizar los pesos de las muestras, en lugar de las predicciones discretas de `SAMME`. Se configuraron 100 estimadores con una tasa de aprendizaje de 0.8 y semilla fija (`random_state=0`), por lo que el resultado es determinista dado el mismo conjunto de datos y la misma versión de la librería.

El entrenamiento descrito en la model card es deliberadamente sencillo y no incluye fases de ajuste por retroalimentación humana (no hay RLHF ni DPO, conceptos que no aplican a este tipo de modelo). El flujo fue: limpieza de espacios en blanco, aplicación de un `LabelEncoder` independiente por cada columna categórica, separación de la etiqueta `income` respecto de los 14 predictores y partición `train_test_split(test_size=0.30, random_state=1)`. El proyecto comparó árboles de decisión, bagging, random forest, regresión logística, AdaBoost, gradient boosting y XGBoost; varias búsquedas sobre modelos de árboles y bagging optimizaron el recall con validación cruzada, mientras que los hiperparámetros finales de AdaBoost se especificaron directamente en el cuaderno, sin búsqueda automática. No se redistribuye el dataset original en el repositorio.

No hay innovaciones técnicas destacables: no se emplean decodificación especulativa, atención lineal ni mecanismos híbridos. El interés del artefacto reside en la reproducibilidad: al reentrenar desde el `adult.csv` codificado con la misma partición y configuración, la matriz de confusión resultante coincide exactamente con la registrada en el cuaderno original.

## Capacidades

- Clasificación binaria tabular: asigna cada registro a `>50K` o `<=50K` a partir de las 14 características documentadas.
- Puntuación probabilística: la verificación del artefacto calculó ROC-AUC y PR-AUC a partir de las probabilidades del modelo, lo que indica que la interfaz expone `predict_proba` (o equivalentes), no solo la etiqueta.
- Preprocesado reproducible: incluye los mapeos enteros de cada columna categórica en `preprocessing.json` y el orden canónico de las características en `model_config.json`.
- Inferencia por registro único y por lotes: la función `predict()` acepta un diccionario de Python y existe un modo de línea de comandos (`python inference.py --json '<JSON object>'`).
- Reproducción exacta del experimento: matriz de confusión `[[7066, 484], [737, 1482]]` replicada respecto al cuaderno de origen.
- No soporta tool calling ni function calling: no es un modelo generativo ni expone interfaz de herramientas.
- No soporta agentes ni razonamiento multi-paso: cada predicción es independiente y no mantiene estado entre llamadas.
- Sin capacidades multilingües, de generación de texto, visión, audio ni modo de razonamiento extendido ("thinking").
- No hay soporte de instrucciones en lenguaje natural: la entrada es un esquema fijo de 14 campos.

## Casos de uso

- Docencia de pipelines clásicos de machine learning: el repositorio permite ilustrar de principio a fin el flujo limpieza de datos, codificación con `LabelEncoder`, partición de entrenamiento y prueba, entrenamiento de un ensemble y evaluación con matriz de confusión, usando un artefacto que reproduce exactamente un resultado publicado.
- Pruebas de humo de plataformas de despliegue: sirve como carga trivial para verificar que un endpoint de inferencia tabular (FastAPI, Flask, BentoML) recibe JSON, aplica el preprocesado y devuelve una etiqueta válida, con un modelo cuyo coste computacional en CPU es despreciable.
- Pruebas de integración de validadores de esquema: los 14 campos y sus dominios de valores permiten construir casos de prueba de validación de entrada, incluido el comportamiento ante categorías desconocidas o marcadores de valor ausente.
- Benchmark educativo de familias de modelos tabulares: el propio proyecto compara árboles de decisión, bagging, random forest, regresión logística, AdaBoost, gradient boosting y XGBoost sobre la misma partición, lo que sirve como ejercicio de comparación metodológica.
- Estudio práctico de calibración y selección de umbral: con ROC-AUC 0.9240 y PR-AUC 0.8140 frente a un recall de 0.6679 en el umbral por defecto, el artefacto es un buen ejemplo para discutir el desplazamiento del umbral de decisión y el equilibrio precisión-exhaustividad.
- Auditoría de sesgo con fines formativos: al incluir `sex`, `race`, `marital-status` y `native-country`, permite practicar el análisis de disparidad entre grupos y la discusión sobre atributos protegidos, siempre en un contexto de investigación y nunca para decisiones reales.
- Verificación de reproducibilidad de artefactos: comprobar que un modelo descargado reproduce la matriz de confusión declarada es un ejercicio útil para equipos que necesitan validar artefactos de terceros antes de integrarlos.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los de la partición de prueba del propio proyecto (30 % de los datos, `random_state=1`, 9.769 registros). La matriz de confusión declarada es `[[7066, 484], [737, 1482]]`, coherente con las métricas de la tabla (por ejemplo, precisión = 1482 / 1966 = 0.7538 y exhaustividad = 1482 / 2219 = 0.6679).

| Metrica | Particion de prueba |
|---|---:|
| Exactitud (accuracy) | 0.8750 |
| Precision | 0.7538 |
| Recall | 0.6679 |
| F1 | 0.7082 |
| ROC-AUC | 0.9240 |
| PR-AUC | 0.8140 |

Las cuatro primeras métricas son las reportadas por el proyecto y reproducidas en la misma partición; ROC-AUC y PR-AUC se calcularon durante la verificación del artefacto a partir de las probabilidades del modelo y no figuraban en la tabla original. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible (MMLU, HumanEval, GSM8K y similares no aplican a un clasificador tabular). La propia model card advierte de que la comparativa ampliada del cuaderno está afectada por un desplazamiento de una fila en los nombres de los modelos, debido a un objeto SVM ausente en la lista de comparación, y por ello no reclama que AdaBoost domine todas las métricas: XGBoost presenta un perfil muy similar con un recall ligeramente superior, aunque sin cifras publicadas en la información disponible.

## Requisitos de hardware

- VRAM: no aplica, 0 GB. El modelo se ejecuta íntegramente en CPU y no requiere GPU.
- GPU recomendadas: ninguna. Cualquier CPU x86-64 o ARM moderna es suficiente; no se justifica el uso de A100, H100 ni RTX 4090 para este artefacto.
- Cabe en cualquier equipo de consumo: portátiles, contenedores serverless, entornos edge y placas tipo Raspberry Pi, dado que se trata de 100 árboles de profundidad 2 y un fichero de pesos en el rango de kilobytes a pocos megabytes (el repositorio se reporta como 0.0 GB).
- Opciones de despliegue: carga directa con `joblib` y scikit-learn en Python; servicio HTTP con FastAPI, Flask o BentoML; conversión a ONNX con `skl2onnx` para eliminar la dependencia de scikit-learn en tiempo de inferencia. vLLM, llama.cpp, Ollama y TGI no son aplicables a un modelo tabular clásico.
- Latencia y throughput: no publicados. Como estimación de orden de magnitud, un AdaBoost de 100 árboles de profundidad 2 sobre 14 características suele resolverse en microsegundos o pocos milisegundos por registro en una CPU moderna, con paralelización trivial por lotes; esta cifra no está verificada por el autor.
- Dependencia crítica de versión: el parámetro `algorithm="SAMME.R"` está deprecado en scikit-learn 1.4 y fue eliminado en versiones posteriores (1.6), por lo que cargar el artefacto exige fijar la versión de la librería. El contenido de `requirements.txt` no se incluye en la información disponible, de modo que la versión exacta recomendada es no disponible.

## Comparativa con modelos similares

El proyecto de origen compara explícitamente siete familias de modelos sobre la misma partición. Solo se publican métricas del AdaBoost seleccionado; el resto de valores son no disponibles.

| Modelo | Parametros / estructura | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdaBoost ajustado (este artefacto) | 100 árboles de profundidad 2 (`SAMME.R`, lr 0.8) | No aplica (registro tabular) | Exactitud 0.8750, precision 0.7538, recall 0.6679, F1 0.7082, ROC-AUC 0.9240 | No disponible | Repositorio Hugging Face, 0 descargas |
| XGBoost (comparado en el cuaderno) | No disponible | No aplica | No disponible; la model card indica perfil similar con recall ligeramente superior | No disponible (no se distribuye) | No disponible |
| Random forest (comparado en el cuaderno) | No disponible | No aplica | No disponible; las búsquedas optimizaron recall con validación cruzada | No disponible (no se distribuye) | No disponible |
| Regresión logística (comparado en el cuaderno) | No disponible | No aplica | No disponible | No disponible (no se distribuye) | No disponible |
| Árboles de decisión, bagging, gradient boosting (comparados en el cuaderno) | No disponible | No aplica | No disponible | No disponible (no se distribuye) | No disponible |

No se dispone de comparaciones con clasificadores tabulares de referencia externos (por ejemplo, implementaciones públicas sobre UCI Adult) dentro de la información proporcionada.

## Limitaciones y advertencias

- Desfase temporal y geográfico del dataset: los datos proceden del censo estadounidense de 1994; no representan poblaciones, mercados laborales ni contextos actuales ni fuera de la muestra original, por lo que el rendimiento puede degradarse ante cualquier cambio de distribución.
- Sesgo estructural: el objetivo y varias entradas codifican información socialmente sensible (`sex`, `race`, `marital-status`, `native-country`) y el conjunto refleja condiciones sociales y económicas históricas. Las predicciones pueden reproducir o amplificar inequidades históricas.
- Prohibición de uso consecuente: el autor indica explícitamente que no debe utilizarse para tomar o recomendar decisiones sobre personas en empleo, concesión de crédito, seguros, admisiones, prestaciones o elegibilidad. No es una herramienta de evaluación validada.
- Riesgo de error en la clase minoritaria: la matriz de confusión muestra 737 falsos negativos frente a 1.482 verdaderos positivos, es decir, aproximadamente un 33 % de los casos `>50K` de la partición de prueba no se detectan en el umbral por defecto. La clase positiva representa alrededor del 22,7 % de la partición.
- Codificación ordinal artificial: aplicar un `LabelEncoder` a variables nominales (`workclass`, `occupation`, `native-country`, etc.) impone un orden inexistente entre categorías. Con árboles de decisión el efecto es limitado, pero es una práctica subóptima y dificulta la generalización a categorías no vistas.
- Valores ausentes no documentados: la model card señala que el dataset contiene marcadores de valor ausente, pero no especifica cómo se tratan en el artefacto. Los mapeos de `preprocessing.json` pueden carecer de categoría para valores desconocidos, lo que provocaría fallos al puntuar registros nuevos con esos marcadores.
- Validación estadística débil: se emplea una única partición de retención del 30 % con una semilla fija, sin validación cruzada del modelo final ni intervalos de confianza. Los hiperparámetros de AdaBoost se fijaron manualmente. El rendimiento puede variar con otra partición, otro preprocesado u otro umbral de decisión.
- Advertencia metodológica del propio autor: la tabla comparativa ampliada del cuaderno contiene un desplazamiento de nombres de modelo por un objeto SVM ausente, por lo que no debe tomarse como una comparación fiable sin reordenar los estimadores.
- Riesgo de alucinación: el concepto no aplica a un clasificador tabular, pero sí existe el riesgo de presentar predicciones puntuales como hechos fiables cuando proceden de un modelo con un recall del 66,8 % en la clase positiva.
- Restricciones de licencia: no se declara licencia del repositorio ni del proyecto fuente (sin fichero `LICENSE`), de modo que no puede asumirse permiso para uso comercial. El dataset UCI Adult es CC BY 4.0, pero el repositorio no redistribuye los datos brutos.
- Ausencia de validación comunitaria: 0 descargas y 0 "likes", sin versiones ni mantenimiento declarado. Las fechas de creación y actualización del repositorio (septiembre de 2026) resultan atípicas respecto al momento de la consulta y no hay evidencia de revisión externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tanuj124/adult-income-classifier
- Proyecto fuente en GitHub: https://github.com/tanujranjith/Stanford-ML-Project
- Dataset UCI Adult / Census Income (Barry Becker y Ronny Kohavi): https://archive.ics.uci.edu/dataset/2/adult
- Nota sobre la búsqueda web: los resultados recuperados no guardan relación con el modelo (corresponden al acrónimo "TED" y a la conferencia TED), por lo que no se incluye ningún enlace adicional. No se han encontrado papers, blogs, demostraciones ni repositorios adicionales relevantes en la información disponible.
