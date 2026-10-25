# Vishnu-09/tourism-purchase-predictor

## Resumen

`Vishnu-09/tourism-purchase-predictor` es un modelo de clasificación tabular publicado en HuggingFace por el usuario Vishnu-09, pensado para predecir la compra de un producto turístico (la model card menciona la demanda de "Wellness" como objetivo proxy a partir de compras históricas). No es un modelo de lenguaje: se trata de un pipeline de scikit-learn que combina imputación de valores ausentes, codificación one-hot y un clasificador Random Forest, serializado con joblib y etiquetado con el pipeline `tabular-classification`.

El artefacto es de tamaño muy reducido (0,0 GB en el repositorio) y está orientado a un caso de negocio muy concreto: scoring de clientes con variables disponibles antes del contacto comercial, es decir, sin usar información de compras posteriores que introduciría fuga de datos. La model card remite a `model_metadata.json` y al directorio `reports/` para el esquema de features, versiones de dependencias, mejores hiperparámetros y métricas reales de evaluación, datos que no están disponibles en la información proporcionada.

Su relevancia es limitada fuera del nicho: no hay métricas publicadas, no se declara licencia, no se especifican idiomas ni volumetría de entrenamiento, y las búsquedas web realizadas no devuelven documentación técnica del autor (los resultados obtenidos corresponden al término "Vishnu" en contextos mitológicos y no guardan relación con el modelo). Debe tratarse, por tanto, como un artefacto experimental de un autor individual, útil como referencia de pipeline tabular, no como componente listo para producción sin auditoría previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (scikit-learn) dentro de un pipeline con imputación y codificación one-hot |
| Parametros totales | no disponible (no se declara número de árboles, profundidad ni número de features) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no procesa secuencias de texto) |
| Tipos de cuantizacion | no aplica (artefacto joblib, no hay pesos en FP16/INT8/GGUF) |
| Idiomas soportados | no disponibles (las entradas son variables tabulares; no hay procesamiento de lenguaje natural) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | joblib (pipeline serializado de scikit-learn); repo con `model_metadata.json` y `reports/` |
| Tarea | clasificación tabular (`tabular-classification`) |
| Libreria declarada | sklearn |
| Autor | Vishnu-09 |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion / actualizacion | 2026-10-25 / 2026-10-25 |
| Region declarada | region:us |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un Random Forest con imputación ajustada ("fitted imputation") y codificación one-hot integradas en el propio pipeline. Esto implica que los transformadores se entrenan junto con el clasificador y se serializan en el mismo artefacto joblib, de modo que la inferencia recibe datos crudos con valores ausentes y categorías sin preprocesar. Se desconoce el número de árboles, la profundidad máxima, el criterio de splitting y el número exacto de variables de entrada; esa información se remite a `model_metadata.json`, que no está disponible en la información proporcionada.

Respecto a los datos de entrenamiento, la única indicación es que se usan exclusivamente features disponibles antes del contacto ("pre-contact features only") y que las compras históricas actúan como proxy de la demanda de Wellness. No se declara volumen de muestras, periodo temporal, composición del dataset, tratamiento del desbalanceo de clases ni si hubo ajuste de hiperparámetros más allá de la referencia a los "best parameters" en `reports/`. Tampoco se documenta ninguna innovación técnica: no hay atención lineal, decodificación especulativa ni componentes generativos, dado que no es un modelo neuronal.

## Capacidades

- Clasificación binaria o multiclase de registros tabulares (probabilidad de compra de un producto turístico), según la tarea declarada `tabular-classification`.
- Preprocesado integrado: imputación de valores ausentes y codificación one-hot de variables categóricas dentro del pipeline serializado.
- Inferencia sobre variables pre-contacto, lo que permite puntuar clientes antes de cualquier interacción comercial.
- Exportación de probabilidades por registro (comportamiento estándar de `predict_proba` en scikit-learn), útil para priorizar leads.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni modo "thinking".
- No genera texto: su salida es una etiqueta y, opcionalmente, una probabilidad.

## Casos de uso

- Priorización de leads en una agencia de viajes: cargar el pipeline con `joblib.load` y puntuar cada solicitud web con las variables pre-contacto para ordenar la cola de llamadas comerciales por probabilidad de compra.
- Scoring por lotes en CRM: ejecutar el modelo sobre la base de clientes cada noche y volcar la probabilidad a un campo de propensión que alimente las campañas del día siguiente.
- Segmentación para upselling de productos Wellness: usar la etiqueta predicha para separar la base en "alta propensión" y "baja propensión" y asignar presupuesto de marketing en consecuencia, dado que la propia model card define el target como proxy de demanda Wellness.
- Microservicio de inferencia en tiempo real: envolver el artefacto joblib en una API (por ejemplo FastAPI) que responda en milisegundos a peticiones del formulario de reserva, sin necesidad de GPU.
- Filtro previo en campañas de email: excluir de los envíos masivos a los registros con propensión muy baja para reducir coste por conversión y presión sobre la lista.
- Experimentación A/B: usar las probabilidades como variable de estratificación para construir grupos comparables antes de lanzar un test de precios o de creatividades.
- Referencia educativa o baseline interno: al ser un pipeline sklearn completo con imputación y one-hot, sirve como punto de partida reproducible para comparar con Gradient Boosting en un problema de propensión de compra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las métricas reales de evaluación están en `reports/`, pero esos valores no se incluyen en la información accesible; por tanto no se puede afirmar accuracy, F1, AUC-ROC ni matriz de confusión, y no se comparan cifras con otros modelos.

## Requisitos de hardware

- Inferencia en CPU: al ser un Random Forest de scikit-learn, no requiere GPU; el coste depende del número de árboles y de features, ambos no declarados.
- Memoria RAM: no disponible con precisión; para un repositorio de 0,0 GB y un artefacto joblib el consumo previsible es de decenas o pocos cientos de megabytes, pero es una estimación, no un dato del autor.
- GPU: no necesaria. No aplica A100, H100 ni RTX 4090; tampoco hay soporte CUDA nativo en el pipeline.
- Compatibilidad con consumer: sí, cualquier portátil convencional puede ejecutar la inferencia en CPU.
- Opciones de despliegue: `joblib.load` en Python con versiones de scikit-learn coincidentes, servicio HTTP propio (FastAPI, Flask), contenedor Docker, ejecución como tarea batch (cron, Airflow) o conversión a ONNX para servir con ONNX Runtime.
- No compatible con vLLM, TGI, llama.cpp ni Ollama: esas herramientas están orientadas a modelos de lenguaje y no cargan pipelines sklearn.
- Latencia y throughput: no disponibles; en un Random Forest típico la latencia por registro sería de milisegundos, pero no hay medición publicada para este artefacto.

## Comparativa con modelos similares

| Modelo / enfoque | Tipo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tourism-purchase-predictor (este) | Random Forest + pipeline sklearn | no disponible | no aplica | no disponible | no disponible | HuggingFace, 0 descargas |
| XGBoost (clasificador) | Gradient boosting sobre árboles | configurable por el usuario | no aplica | no disponible para este problema | Apache 2.0 (libreria) | Amplia, madura |
| LightGBM | Gradient boosting con crecimiento por hojas | configurable por el usuario | no aplica | no disponible para este problema | MIT (libreria) | Amplia, madura |
| CatBoost | Gradient boosting con soporte nativo de categoricas | configurable por el usuario | no aplica | no disponible para este problema | Apache 2.0 (libreria) | Amplia, madura |

La comparación es estructural, no de rendimiento: no existen métricas de este modelo que permitan afirmar que un gradient boosting sea mejor o peor en este conjunto de datos concreto. La ventaja de las alternativas es la licencia explícita y el mantenimiento activo; la de este artefacto es que ya incluye el preprocesado y está serializado como un único fichero.

## Limitaciones y advertencias

- Licencia no disponible: sin licencia declarada no hay autorización explícita de uso comercial; es un riesgo legal que debe resolverse antes de cualquier despliegue en producción.
- Procedencia y reproducibilidad: el autor es individual, con 0 descargas y 0 likes, y no hay paper, blog ni repositorio asociado localizado en la búsqueda web; los resultados de búsqueda obtenidos no son relevantes para el modelo.
- Métricas no verificables: la model card remite a `reports/` y a `model_metadata.json`, pero esos datos no están accesibles en la información proporcionada, por lo que no se puede evaluar la calidad predictiva.
- Riesgo de seguridad al cargar el artefacto: joblib usa pickle, lo que permite ejecución de código arbitrario al deserializar; la propia model card advierte de cargar únicamente artefactos de confianza con dependencias coincidentes.
- Dependencia estricta de versiones: un desajuste entre la versión de scikit-learn usada en el entrenamiento y la del entorno de inferencia puede romper la carga del pipeline o alterar las transformaciones.
- Sesgo y deriva: al entrenar solo con variables pre-contacto, el modelo puede reproducir sesgos presentes en la cartera histórica (canal de adquisición, geografía, segmento) y degradarse si cambia la mezcla de clientes o la política comercial.
- Etiqueta proxy: el target se define como compra histórica usada como aproximación de la demanda Wellness, lo que introduce ruido respecto al objetivo real de negocio.
- Sin tratamiento documentado del desbalanceo de clases ni de la calibración de probabilidades; las probabilidades podrían no ser fiables como estimación de riesgo.
- Ámbito limitado: no procesa texto, imágenes ni audio, y no debe presentarse como "modelo de IA" generativo; es un clasificador tabular de alcance estrecho.
- Sin información sobre volumen de entrenamiento ni periodo temporal, no se puede evaluar si el modelo está desactualizado respecto al mercado turístico actual.

## Enlaces

- HuggingFace: https://huggingface.co/Vishnu-09/tourism-purchase-predictor
- Esquema de features, versiones y métricas (ruta interna del repositorio, no verificada): `model_metadata.json`
- Informes de evaluación (ruta interna del repositorio, no verificada): `reports/`
- Documentación de scikit-learn para pipelines y persistencia con joblib: https://scikit-learn.org/stable/model_persistence.html
- No se han localizado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada.
