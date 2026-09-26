# tharinda-pamindu/breast_cancer_prediction

## Resumen

`tharinda-pamindu/breast_cancer_prediction` es un modelo de clasificacion binaria tabular entrenado con XGBoost y publicado en HuggingFace por el usuario tharinda-pamindu. No es un modelo de lenguaje: se trata de un conjunto de arboles de decision potenciados (gradient boosted trees) que recibe un vector de caracteristicas tabulares y devuelve una etiqueta binaria.

El modelo se distribuye como un unico artefacto serializado en formato JSON de XGBoost (`best_model.json`), que se carga directamente con `XGBClassifier.load_model()`. La model card declara una configuracion concreta de hiperparametros: `max_depth=4`, `learning_rate=0.05`, `n_estimators=1000` con parada temprana de 30 rondas sobre logloss de validacion, ademas de `subsample=0.8` y `colsample_bytree=0.8`.

Su relevancia es limitada y de caracter practico: sirve como ejemplo reproducible de como publicar y consumir un clasificador tabular desde el Hub, y como linea base ligera (inferencia en CPU, sin GPU) para tareas de clasificacion binaria con datos tabulares. El propio autor indica que el modelo es unicamente para fines educativos y que no debe usarse en entornos clinicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosted decision trees (XGBoost), crecimiento de arboles con objetivo regularizado |
| Parametros totales | No disponible (en el sentido de pesos de red neuronal no aplica; el modelo consta de hasta 1000 arboles de profundidad maxima 4, numero final no publicado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular; no procesa secuencias de texto) |
| Tipos de cuantizacion | No disponible (XGBoost opera en coma flotante; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica / no disponibles (los datos de entrada son caracteristicas numericas o categoricas, no texto) |
| Licencia | No disponible |
| Formato de pesos | JSON de XGBoost (`best_model.json`), cargable con `XGBClassifier.load_model()` |
| Tipo de tarea | Clasificacion binaria tabular (`pipeline: tabular-classification`) |
| Libreria declarada | `xgboost` |
| Hiperparametros | `max_depth=4`, `learning_rate=0.05`, `n_estimators=1000`, `subsample=0.8`, `colsample_bytree=0.8`, parada temprana de 30 rondas sobre logloss de validacion |
| Etiquetas del Hub | `xgboost`, `tabular-classification`, `breast-cancer`, `region:us` |
| Fecha de creacion | 2026-09-26 (segun metadatos del Hub) |
| Fecha de actualizacion | 2026-09-26 |
| Descargas / likes | 0 / 0 |
| Idioma de la model card | Ingles |

## Arquitectura y entrenamiento

La arquitectura es la de XGBoost: un ensemble de arboles de decision entrenados de forma secuencial, donde cada arbol ajusta el gradiente del error residual de los anteriores bajo un objetivo regularizado (aproximacion de segundo orden). No hay capas neuronales, mecanismos de atencion ni componentes de secuencia; el modelo aprende particiones sobre caracteristicas tabulares.

La model card solo documenta la configuracion de entrenamiento, no el procedimiento completo. Se sabe que se uso `n_estimators=1000` con parada temprana de 30 rondas evaluada sobre logloss de un conjunto de validacion, `learning_rate=0.05`, `max_depth=4`, `subsample=0.8` y `colsample_bytree=0.8`. Estos valores apuntan a un modelo deliberadamente poco profundo y regularizado, lo que reduce el sobreajuste en datasets tabulares pequenos. No se especifica el dataset de entrenamiento, su tamano, su procedencia, el numero de caracteristicas ni el esquema de particion train/validacion/test. Tampoco se documenta ningun proceso de calibracion, ajuste de umbral de decision o validacion cruzada.

## Capacidades

- Clasificacion binaria sobre datos tabulares: recibe una fila de caracteristicas y devuelve una probabilidad o etiqueta binaria.
- Inferencia en CPU sin dependencia de GPU ni de aceleradores especializados.
- Modelo de baja latencia y huella reducida, apto para ejecucion embebida en servicios ligeros.
- Compatibilidad con el ecosistema XGBoost: importancias de caracteristicas, salida SHAP mediante `pred_contribs`, exportacion a otros formatos.
- Carga directa desde el Hub mediante `hf_hub_download` + `XGBClassifier.load_model()`.

No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingues. La model card no describe ninguna capacidad de este tipo y la arquitectura no las soporta.

## Casos de uso

- Prototipado rapido de clasificacion tabular: sirve como punto de partida ejecutable para comprobar un pipeline de datos y obtener una linea base en minutos, sin necesidad de GPU ni de infraestructura compleja.
- Material docente en cursos de machine learning: al tener hiperparametros explicitos y un artefacto unico, permite ilustrar entrenamiento con parada temprana, regularizacion mediante `subsample`/`colsample_bytree` y limites de profundidad.
- Linea base de comparacion interna: cualquier equipo que desarrolle un modelo tabular propio puede usar esta configuracion como referencia de coste y complejidad antes de invertir en arquitecturas mas pesadas.
- Analisis de importancia de caracteristicas en investigacion: XGBoost permite extraer importancias y contribuciones SHAP por instancia, util para explorar que variables dominan la prediccion en un dataset concreto.
- Pruebas de integracion del Hub en CI/CD: el flujo `hf_hub_download` + carga del modelo se puede automatizar en un pipeline de integracion continua para verificar que el artefacto se descarga, se carga y produce salidas con la forma esperada.
- Validacion de pipelines de datos antes de entrenamientos mayores: sirve para detectar fugas de datos, valores atipicos o desbalanceos de clase en fases tempranas de un proyecto tabular.
- Demostraciones de despliegue ligero: al ser un artefacto pequeno y de inferencia en CPU, es util para montar ejemplos de servicio con FastAPI, BentoML o MLflow Serving.

Ninguno de estos casos debe orientarse a diagnostico, triaje o decision clinica: el autor restringe explicitamente el uso a fines educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud, AUC-ROC, F1, precision, recall ni ninguna otra metrica, y tampoco especifica el conjunto de evaluacion empleado.

## Requisitos de hardware

- VRAM: no aplica. XGBoost ejecuta la inferencia en CPU; no requiere memoria de GPU.
- GPU recomendadas: ninguna. No hay soporte declarado de aceleracion por GPU para el formato publicado; XGBoost ofrece `device="cuda"` en entrenamiento, pero el uso previsto del artefacto es inferencia en CPU.
- GPU de consumo: irrelevante para este modelo. Cabe en cualquier maquina, incluidos portatiles y contenedores con recursos minimos.
- Memoria RAM: no disponible de forma exacta. Con `max_depth=4` y hasta 1000 arboles, la huella del modelo en memoria es del orden de pocos megabytes (estimacion orientativa, no medida por el autor).
- Tamano en disco: no disponible. Se descarga como un unico fichero `best_model.json` desde el repositorio del Hub.
- Opciones de despliegue: Python con `xgboost` (`XGBClassifier.load_model`), ONNX Runtime previa conversion con `onnxmltools` o `skl2onnx`, Treelite para compilacion del ensemble, y servidores de modelos genericos como BentoML, MLflow Serving o Triton Inference Server mediante backend compatible. `vLLM`, `llama.cpp`, `Ollama` y `TGI` no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no medidos ni publicados. Como referencia orientativa, un ensemble de profundidad 4 con hasta 1000 arboles evaluado por muestra en CPU suele resolver en el rango de microsegundos a pocos milisegundos, pero es una estimacion no verificada.

## Comparativa con modelos similares

No se dispone de metricas de rendimiento de este modelo, por lo que la comparacion cuantitativa no es posible. La tabla resume diferencias estructurales y de disponibilidad frente a alternativas habituales para clasificacion tabular binaria.

| Modelo | Tipo | Libreria | Hiperparametros publicados | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| tharinda-pamindu/breast_cancer_prediction | Gradient boosting (arboles) | XGBoost | Si (`max_depth=4`, `lr=0.05`, `n_estimators=1000`) | No disponible | No disponible |
| XGBoost (configuracion por defecto) | Gradient boosting (arboles) | XGBoost | Por defecto de la libreria (`max_depth=6`, `lr=0.3`) | Apache-2.0 (libreria) | No comparable |
| LightGBM | Gradient boosting con crecimiento leaf-wise | LightGBM | Por defecto de la libreria | MIT (libreria) | No comparable |
| CatBoost | Gradient boosting con soporte nativo de categoricas | CatBoost | Por defecto de la libreria | Apache-2.0 (libreria) | No comparable |
| Regresion logistica | Modelo lineal | scikit-learn | Regularizacion configurable | BSD-3 (libreria) | No comparable |

Las licencias indicadas corresponden a las librerias, no a los artefactos de modelo concretos. No se conocen modelos publicados comparables en el mismo repositorio o con la misma configuracion exacta.

## Limitaciones y advertencias

- Uso clinico prohibido: la model card incluye un aviso explicito de que el modelo es solo para fines educativos y no debe emplearse en contexto clinico. Cualquier uso con pacientes seria un uso indebido.
- Licencia no disponible: al no declararse licencia, no se puede asumir permiso de uso comercial, redistribucion o modificacion. Conviene contactar con el autor antes de cualquier uso fuera de lo estrictamente educativo.
- Dataset de entrenamiento no documentado: se desconoce el origen, el tamano, la composicion demografica y el esquema de particion de los datos. Esto impide evaluar sesgos y generalizacion.
- Sin metricas de evaluacion: no hay exactitud, AUC ni matriz de confusion publicadas, por lo que no se puede afirmar que el modelo tenga un rendimiento aceptable ni siquiera en su dominio previsto.
- Riesgo de sobreajuste y de mala calibracion: no se documenta calibracion de probabilidades ni ajuste del umbral de decision; las probabilidades de salida deben tratarse con cautela.
- Sesgos potenciales en datos sanitarios: los datasets de cancer de mama suelen estar desbalanceados y sobrerrepresentar determinados grupos demograficos; sin informacion del dataset no se puede descartar este problema.
- Sin soporte de texto ni de idiomas: no acepta entradas en lenguaje natural ni produce explicaciones. La interpretabilidad depende de herramientas externas como SHAP.
- Sensibilidad al preprocesado: como todo modelo de arboles sobre datos tabulares, el orden y la escala de las caracteristicas, el tratamiento de valores ausentes y la codificacion de categoricas deben coincidir con los del entrenamiento; ese esquema no se publica.
- Sin garantia de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, sin historial de actualizaciones posterior a la creacion del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tharinda-pamindu/breast_cancer_prediction
- Fichero de pesos: `best_model.json` en el repositorio de HuggingFace (referenciado en la model card)
- Documentacion de XGBoost: https://xgboost.readthedocs.io/
- Documentacion de `huggingface_hub` (descarga de ficheros): https://huggingface.co/docs/huggingface_hub/
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos asociados a este modelo.
