# tejas-maharana-ai/bcg-customer-churn-model

## Resumen

bcg-customer-churn-model es un modelo de machine learning clásico (no generativo) publicado en Hugging Face por el usuario tejas-maharana-ai. Su propósito es predecir la cancelación (churn) de clientes, presumiblemente en el contexto de un caso práctico relacionado con BCG (Boston Consulting Group), dado el nombre del repositorio. No se trata de un modelo de lenguaje, sino de un clasificador tabular serializado con joblib, lo que indica que fue entrenado probablemente con scikit-learn o una librería similar.

El modelo resuelve un problema de negocio muy habitual: identificar qué clientes tienen mayor probabilidad de abandonar un servicio, permitiendo a las empresas actuar de forma proactiva con ofertas de retención. Es relevante como ejemplo de despliegue de modelos tabulares en el Hub de Hugging Face, un caso menos común que los LLM pero útil para equipos de datos que centralizan todos sus artefactos de ML en una misma plataforma.

La información técnica disponible es muy escasa: la model card contiene únicamente la declaración de licencia MIT, sin documentación sobre arquitectura, datos de entrenamiento, métricas ni uso. El repositorio pesa aproximadamente 0,2 GB, tiene 0 descargas y 1 like en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador tabular, formato joblib) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | joblib |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Tamano del repositorio | 0,2 GB |
| Pipeline tag | no disponible |
| Descargas | 0 |
| Likes | 1 |
| Fecha de creacion | 2026-10-25 |
| Ultima actualizacion | 2026-10-25 |

## Arquitectura y entrenamiento

No hay documentacion sobre la arquitectura concreta del modelo. El uso del formato joblib sugiere fuertemente que se trata de un modelo entrenado con scikit-learn (por ejemplo, un gradient boosting, random forest o regresion logistica) o con XGBoost/LightGBM serializado desde Python. El tamano de 0,2 GB es compatible con un ensemble de arboles de tamaño moderado o un modelo con un preprocesador incluido en el mismo objeto serializado.

No se ha publicado informacion sobre el dataset de entrenamiento, el numero de registros, las variables de entrada, el proceso de validacion ni las tecnicas de regularizacion empleadas. Por el nombre del repositorio, es razonable asumir que se basa en el caso de churn de telecomunicaciones asociado a BCG (un dataset tipo telco customer churn), pero esto no esta confirmado por el autor.

## Capacidades

- Clasificacion binaria de churn: predice la probabilidad de que un cliente cancele el servicio a partir de variables tabulares.
- Inferencia local: al ser un artefacto joblib, puede cargarse con `joblib.load()` en cualquier entorno Python con las dependencias adecuadas, sin necesidad de GPU.
- Integracion en pipelines de scikit-learn: si el objeto serializado incluye el preprocesamiento, permite pasar datos crudos directamente al metodo `predict()` o `predict_proba()`.
- No es un modelo generativo: no produce texto, no soporta tool calling, no tiene capacidades de razonamiento, ni funcionalidades multilingues ni multimodales.

## Casos de uso

- Prediccion de churn en telecomunicaciones: dado un cliente con variables como tipo de contrato, facturacion mensual y antiguedad, el modelo estima la probabilidad de cancelacion para priorizar campanas de retencion.
- Priorizacion de campanas de retencion: ordenando clientes por score de churn, un equipo comercial puede concentrar su presupuesto en el segmento con mayor riesgo.
- Analisis de factores de cancelacion: combinando las predicciones con tecnicas de explicabilidad (SHAP, feature importance) para entender que variables empujan al abandono.
- Prototipado rapido de MLOps: el artefacto es ligero (0,2 GB) y sirve como modelo de ejemplo para montar un endpoint de inferencia con FastAPI, BentoML o un Inference Endpoint de Hugging Face.
- Docencia y formacion: caso practico tipo para cursos de data science sobre clasificacion tabular, validacion cruzada y metricas desbalanceadas (precision, recall, AUC-ROC).
- Integracion en CRM: puntuacion periodica de la base de clientes mediante batch scoring, escribiendo el score de churn como campo en el CRM para que los equipos de atencion actuen en consecuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de accuracy, AUC-ROC, F1-score ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no aplicable; al ser un modelo tabular clasico, la inferencia se realiza en CPU y no requiere GPU. Con 0,2 GB de tamano de artefacto, la memoria RAM necesaria sera del orden de unos cientos de megabytes.
- GPU recomendadas: no necesarias. Cualquier maquina con Python 3.x y las librerias de serializacion originales es suficiente.
- Consumer hardware: funciona en cualquier portatil o servidor basico; no hay requisitos especiales.
- Opciones de despliegue: carga directa con `joblib.load()` en scripts de Python, servicio REST con FastAPI o Flask, batch scoring programado, o contenedorizacion con Docker. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos de lenguaje.
- Latencia y throughput: no disponibles; en modelos de este tipo la latencia por prediccion suele ser de milisegundos en CPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Formato | Documentacion |
|---|---|---|---|---|
| tejas-maharana-ai/bcg-customer-churn-model | Clasificador tabular (churn) | MIT | joblib | Minima (solo licencia) |
| Modelos de churn en Kaggle / GitHub (varios autores) | Clasificador tabular (XGBoost, LightGBM, sklearn) | Varias | pickle/joblib | Habitualmente con metricas y EDA |
| Modelos tabulares en Hugging Face (tabular-classification pipeline) | Clasificador/regresor tabular | Varias | joblib/safetensors | Variable segun el autor |

No existen alternativas concretas y equivalentes publicadas por el mismo autor; la comparativa se limita a la categoria general de modelos de clasificacion tabular de churn, donde la diferencia principal de este repositorio es la ausencia casi total de documentacion frente a repositorios similares que suelen incluir metricas y notebooks de entrenamiento.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card solo declara la licencia, por lo que no se conocen las variables de entrada esperadas, el preprocesamiento necesario ni el rendimiento real del modelo. Cualquier uso en produccion exige una validacion propia previa.
- Riesgo de sobreajuste desconocido: al no publicarse metricas de validacion ni dataset de test, no es posible evaluar la calidad de las predicciones.
- Posible desajuste de dominio: el modelo presumiblemente fue entrenado sobre un dataset concreto (tipo telco churn de BCG); aplicarlo a datos de otras empresas o sectores sin reentrenamiento puede producir predicciones invalidas.
- Dependencias de serializacion: los ficheros joblib requieren versiones compatibles de scikit-learn (y librerias asociadas) entre entrenamiento e inferencia; cargar el artefacto con versiones distintas puede fallar o alterar resultados.
- Sesgos: no hay analisis de sesgos publicado. Los modelos de churn entrenados con datos historicos pueden reproducir sesgos contra segmentos de clientes concretos; conviene auditar las predicciones por segmento antes de tomar decisiones automatizadas.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con minimas restricciones (conservar el aviso de licencia), por lo que no hay limitaciones legales relevantes para produccion.
- Adopcion marginal: con 0 descargas registradas, no existe comunidad ni historial de issues que respalde la fiabilidad del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tejas-maharana-ai/bcg-customer-churn-model

No se han encontrado enlaces adicionales (paper, blog, repositorio de codigo o demo) en la informacion disponible.
