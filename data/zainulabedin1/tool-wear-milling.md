# Zainulabedin1/tool-wear-milling

## Resumen

`Zainulabedin1/tool-wear-milling` no es un modelo de lenguaje: es un regresor tabular serializado en `joblib` que estima el desgaste de flanco (VB, en milímetros) de una fresa en operaciones de fresado CNC a partir de señales de sensores. Concretamente, emplea un `HistGradientBoostingRegressor` de scikit-learn sobre 59 características artesanales de tiempo y frecuencia extraídas por corte (9 por canal × 6 canales, más 5 características de proceso). Lo publica el usuario Zainulabedin1 como demostración de investigación y de portfolio en el ámbito del *tool condition monitoring* (TCM), no como sistema listo para producción.

El interés practico esta en el pipeline completo: define el target, documenta las 59 features en un `config.json`, incluye utilidades para exportar casos desde señales crudas y evalua con validacion leave-one-case-out agrupada por condicion de corte (16 condiciones), lo que evita la fuga de informacion tipica de una validacion aleatoria en series temporales. El modelo final se reentrena con las 146 pasadas que tienen medicion de VB.

Los datos provienen del "Milling Data Set" de la NASA Prognostics Center of Excellence (Agogino y Goebel, 2007, BEST Lab, UC Berkeley): 16 condiciones de corte, 167 pasadas registradas (146 con VB medido) y seis canales de 9000 muestras cada una (corriente de husillo AC/DC, vibracion de mesa, vibracion de husillo y emision acustica de mesa y husillo). Al ser un artefacto tabular, conceptos como ventana de contexto, cuantizacion o soporte multilingue no aplican; la ficha los marca como tales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles de decisión con binning por histogramas (`HistGradientBoostingRegressor`, scikit-learn); regresión escalar |
| Parametros totales | no disponible (la model card no documenta número de árboles, profundidad máxima ni número de hojas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada fija de 59 características por corte) |
| Tipos de cuantizacion | no disponible; no se publica ninguna variante cuantizada (el artefacto es un serializado `joblib` de los árboles) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible (ni en los metadatos de HuggingFace ni en la model card) |
| Formato de pesos | `joblib` (`model.joblib`) acompañado de `config.json` con la definicion de las 59 features |
| Target | Desgaste de flanco VB en milímetros (regresión continua) |
| Features de entrada | 59 en total: 9 por canal × 6 canales + 5 características de proceso |
| Canales de sensor | Corriente de motor de husillo AC y DC, vibracion de mesa, vibracion de husillo, emision acustica de mesa, emision acustica de husillo |
| Muestras por pasada | 9000 por canal |
| Conjunto de entrenamiento | 146 pasadas con VB medido, 16 condiciones de corte (21 de 167 pasadas excluidas por falta de medicion) |
| Validacion | Leave-one-case-out agrupada por condicion de corte, métricas pooladas |
| Tamano del repositorio | 0.0 GB según HuggingFace (artefacto de pocos MB o menos; no se publica el tamano exacto de `model.joblib`) |
| Descargas / likes | 12 descargas, 0 likes |

## Arquitectura y entrenamiento

La arquitectura es un *gradient boosting* sobre árboles de decisión, implementado con la clase `HistGradientBoostingRegressor` de scikit-learn, que discretiza las variables continuas en histogramas para acelerar la busqueda de divisiones y soporta valores ausentes de forma nativa. No hay capa neuronal, atencion ni componentes secuenciales: cada prediccion es una suma aditiva de las salidas de los árboles entrenados secuencialmente sobre el gradiente del error cuadrático. La model card no especifica hiperparámetros (número de iteraciones, learning rate, profundidad, regularización L2 ni `min_samples_leaf`), por lo que la capacidad efectiva del modelo no puede auditarse a partir de la informacion publicada.

El entrenamiento usa exclusivamente el NASA Milling Data Set. Las 59 características se calculan por corte: nueve descriptores de tiempo y frecuencia por cada uno de los seis canales, más cinco variables de proceso (entre ellas el índice de pasada o el tiempo de corte). La evaluacion es leave-one-case-out sobre las 16 condiciones de corte: se entrena con 15 condiciones y se predice la condicion retenida, agregando las métricas de forma poolada. Este esquema es el adecuado para medir capacidad de generalizacion entre regímenes de corte, y la propia model card advierte que los ejemplos mostrados en la demo Space formaron parte del entrenamiento, por lo que la estimacion insesgada del error es la RMSE poolada del LOO-CV, no el error de la demo. Los pesos finales se reentrenan con las 146 pasadas completas.

## Capacidades

- Regresión continua del desgaste de flanco VB (mm) a partir de 59 características tabulares de un corte de fresado.
- Integración directa en Python mediante `load_model()` y `predict_wear(model, df)` sobre un `DataFrame` con columnas `run`, `VB` y las 59 features.
- Prediccion por lotes: `predict_wear` opera sobre un `DataFrame` completo, no solo sobre una fila.
- Definicion reproducible del esquema de features en `config.json`, reutilizable para construir pipelines de extraccion equivalentes.
- Utilidad `tools/export_case_csv.py` (en el repositorio del proyecto) para convertir señales crudas en el CSV de entrada esperado.
- Capacidad de generar predicciones en CPU sin GPU ni dependencias de inferencia especializadas.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni comportamiento agentico: es un regresor tabular de dominio unico.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.

## Casos de uso

- Docencia y demostracion de pipelines de TCM: sirve como ejemplo completo y reproducible (target, features, validacion agrupada y baselines) en asignaturas o cursos de mantenimiento predictivo, con la ventaja de que el coste computacional es despreciable.
- Prototipado de mantenimiento predictivo en laboratorio: para un banco de fresado instrumentado con corriente de husillo, acelerometros y sensores de emision acustica, permite obtener una primera estimacion de VB y decidir si merece la pena invertir en un sistema de medicion dedicado.
- Referencia interna de baselines: la model card define dos baselines explicitos (media del train y tendencia lineal sobre el indice de corte o el tiempo), utiles para cuantificar cuanto aportan realmente las señales de sensor frente a la simple progresion temporal del desgaste.
- Analisis retrospectivo de campanas de fresado: aplicado fuera de linea sobre CSV historicos de cortes, permite clasificar que pasadas se acercan a umbrales de desgaste y priorizar la inspeccion fisica de herramientas.
- Validacion de sensórica: al disponer de features por canal, permite estudiar que canales (corriente, vibracion, emision acustica) concentran la señal predictiva, informando decisiones de instrumentacion.
- Reutilizacion del esquema de features: `config.json` y `export_case_csv.py` sirven como plantilla para construir un pipeline propio de extraccion de caracteristicas de tiempo/frecuencia sobre señales de 9000 muestras por canal.
- Comparacion metodologica: util como punto de partida para contrastar gradient boosting con alternativas (Random Forest, SVR, redes 1D sobre señal cruda) bajo el mismo esquema de validacion leave-one-case-out.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados, pero remite los valores a `results/report.json` del repositorio del proyecto y no los reproduce en la informacion disponible. No se han publicado cifras numericas de RMSE ni MAE en el material accesible.

| Modelo | RMSE (mm) | MAE (mm) |
|---|---|---|
| Gradient boosting (este modelo) | no publicado (remite a `results/report.json`) | no publicado |
| Baseline: media del train | no publicado (remite a `results/report.json`) | no publicado |
| Baseline: tendencia lineal sobre indice de corte/tiempo | no publicado (remite a `results/report.json`) | no publicado |

Protocolo declarado: leave-one-case-out sobre 16 condiciones de corte, métricas pooladas, inferencia en CPU. Cualquier comparacion con la literatura de TCM sobre el mismo dataset exigiria los valores de `report.json`, que no estan disponibles aqui.

## Requisitos de hardware

- GPU: no necesaria. La inferencia es CPU-only por diseno (el autor reporta las métricas del LOO-CV calculadas en CPU).
- VRAM estimada: 0 GB; el modelo no se carga en memoria de GPU.
- Memoria RAM: no disponible el tamano exacto de `model.joblib`; el repositorio se redondea a 0.0 GB en HuggingFace, lo que sugiere un artefacto de pocos MB o menos.
- GPU recomendadas: ninguna. Cualquier CPU capaz de ejecutar scikit-learn sirve; no se requiere A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: irrelevante, el modelo cabe y se ejecuta en cualquier equipo de consumo, incluidos portatiles modestos.
- Opciones de despliegue: carga directa con `joblib.load` en un script o notebook de Python; servicio HTTP envolviendo `predict_wear` (FastAPI, Flask); integracion en pipelines de datos por lotes. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo generativo.
- Latencia y throughput: no publicados. Por la naturaleza del estimador (evaluacion de un conjunto de árboles sobre 59 features), la latencia esperada por muestra es de orden sub-milisegundo a pocos milisegundos en CPU, pero es una estimacion cualitativa, no una cifra reportada por el autor.

## Comparativa con modelos similares

No se ha identificado en la informacion disponible ningun modelo público comparable de regresión de desgaste de herramienta con el que contrastar parametros, contexto, licencia y disponibilidad. La unica comparacion documentada es interna, frente a los baselines del propio autor.

| Modelo | Tipo | Entradas | Target | Métricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Zainulabedin1/tool-wear-milling` | Gradient boosting (histogramas) | 59 features tabulares | VB (mm) | no publicadas (remite a `report.json`) | no disponible | HuggingFace, 12 descargas |
| Baseline media del train | Predictor constante | ninguna | VB (mm) | no publicadas | no aplica | definido en la model card |
| Baseline tendencia lineal | Regresión lineal sobre corte/tiempo | indice de corte o tiempo | VB (mm) | no publicadas | no aplica | definido en la model card |
| Otros modelos de TCM sobre NASA Milling | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Generalizacion muy restringida: una sola maquina, una sola familia de geometria de herramienta y 16 condiciones de corte. El autor declara explicitamente que no hay ninguna pretension de transferencia a otras maquinas, herramientas o materiales.
- Cobertura de datos incompleta: 21 de las 167 pasadas no tienen medicion de VB y fueron excluidas del entrenamiento y de la evaluacion.
- Frecuencia de muestreo no documentada en el dataset original; las bandas espectrales se definen en frecuencia normalizada, lo que impide mapearlas directamente a hercios sin informacion adicional.
- Variables temporalmente triviales: el indice de pasada y el tiempo son features legitimas y muy predictivas, de modo que parte del error aparente se explica por la progresion del desgaste en el tiempo y no por la sensórica. Los baselines existen precisamente para aislar ese efecto, pero sus cifras no estan publicadas.
- Riesgo de fuga en demos: los casos de ejemplo del Space formaron parte del entrenamiento; usar sus predicciones como medida de calidad sobreestima el rendimiento. La unica estimacion insesgada declarada es la RMSE poolada del leave-one-case-out.
- Uso previsto educativo y de portfolio: el propio autor indica que no es un sistema de TCM para produccion. No debe usarse para decidir cambios de herramienta en un proceso real sin validacion independiente.
- Licencia no declarada: la ausencia de licencia explicita impide asumir derechos de uso comercial o de redistribucion del artefacto `joblib`; habria que contactar con el autor. El dataset de origen (NASA PCoE / BEST Lab) tiene sus propias condiciones de atribucion, que la model card reconoce.
- Ausencia de hiperparametros y de cifras de error publicadas: no es posible auditar la capacidad del modelo ni reproducir los resultados sin acceso al repositorio del proyecto (`results/report.json`, `model.py`, `tools/export_case_csv.py`), cuyo enlace no figura en la informacion disponible.
- Inconsistencia en metadatos: entre los tags de HuggingFace figura `PrintDefectCNN`, que no guarda relacion aparente con un regresor de gradient boosting para fresado; conviene tratar el etiquetado del repositorio con cautela. Las fechas de creacion y actualizacion (2026-10-19) figuran tal cual en los metadatos.
- Ausencia de quantizaciones y de artefactos alternativos (ONNX, pickle plano): la integracion queda atada al entorno Python/scikit-learn y a la version de la libreria usada al serializar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zainulabedin1/tool-wear-milling
- Dataset original (descarga directa, espejo PHM Society): https://phm-datasets.s3.amazonaws.com/NASA/3.+Milling.zip
- Repositorio de datasets de la PHM Society (NASA): https://data.phmsociety.org/nasa/
- Referencia del dataset: A. Agogino y K. Goebel, "Milling Data Set", BEST Lab, UC Berkeley, NASA Prognostics Center of Excellence Data Repository, 2007
- Repositorio del proyecto con `results/report.json`, `model.py`, `config.json` y `tools/export_case_csv.py`: no disponible el enlace en la informacion proporcionada
