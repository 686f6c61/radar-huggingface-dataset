# Vishu2006/customer360AI

## Resumen

Customer360 AI es un sistema de inteligencia artificial para la toma de decisiones sobre clientes, desarrollado por Vishu2006 y publicado en Hugging Face bajo el identificador `Vishu2006/customer360AI`. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un conjunto de modelos de machine learning tabular orientados a la analítica de clientes. Incluye modelos basados en XGBoost para predecir abandono (churn), propensión de compra y valor de vida del cliente (CLV), así como un modelo de clustering K-Means para segmentación de clientes. Además, incorpora un motor de atribución de explicabilidad con SHAP y un sistema de decisión de siguiente mejor acción (NBA).

El repositorio de Hugging Face no contiene pesos en formato estándar de modelos de IA generativa, sino artefactos serializados en formato `.joblib`. Según la información disponible, los modelos se entrenan sobre un conjunto de señales de clientes, aparentemente sintético (`customer_signals.csv`), y los resultados reportados en la model card indican métricas perfectas o casi perfectas, lo que sugiere un posible sobreajuste o una evaluación sobre datos demasiado simples. A fecha de consulta, el repositorio no registra descargas ni usuarios que lo hayan marcado con "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (clasificacion y regresion) y K-Means (clustering) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Joblib (.joblib) |

## Arquitectura y entrenamiento

La arquitectura de Customer360 AI no es un transformer ni un modelo de lenguaje, sino un pipeline compuesto por varios modelos tabulares independientes. Segun la descripcion del repositorio, el sistema incluye:

- Un modelo XGBoost para prediccion de churn, evaluado con ROC-AUC 1.0000 y exactitud 98.00%.
- Un modelo XGBoost para propension de compra, evaluado con ROC-AUC 1.0000 y exactitud 100.00%.
- Un modelo XGBoost para valor de vida del cliente (CLV), evaluado con R² 0.9800.
- Un modelo K-Means para segmentacion de clientes, con silhouette score 0.3478.

El pipeline incluye modulos de ingenieria de caracteristicas (transformadores cuantiles RFM), explicabilidad con SHAP TreeExplainer, un motor de decision de siguiente mejor accion y un pipeline unificado de inferencia. El script `scripts/generate_dataset.py` genera un conjunto de datos sintetico de senales de cliente. No se proporciona informacion sobre el volumen exacto de datos, el numero de arboles, la profundidad maxima ni otros hiperparametros. Las metricas reportadas en la model card se midieron sobre un 20% de datos de test, pero la ausencia de detalles sobre la generacion de datos y la perfeccion de los resultados sugieren que debe interpretarse con cautela.

## Capacidades

- Prediccion de probabilidad de abandono para clientes individuales, basada en atributos como recencia, frecuencia, valor monetario y otras señales de comportamiento.
- Prediccion de propension a realizar una compra, con salida de probabilidad para acciones de marketing.
- Estimacion del valor de vida del cliente (CLV) mediante regresion, util para priorizar recursos de retencion.
- Segmentacion automatica de clientes mediante K-Means, con hasta un numero no especificado de grupos.
- Explicabilidad de predicciones mediante SHAP TreeExplainer, permitiendo identificar las variables mas influyentes.
- Motor de "siguiente mejor accion" que combina los resultados de los modelos para recomendar una accion ponderada.
- Servicio de inferencia unificado a traves de una API REST (FastAPI) y una aplicacion Gradio.
- Soporte para prediccion individual (`/api/v1/predict`) y por lotes (`/api/v1/batch-predict`).
- El sistema esta pensado para trabajar con datos tabulares de clientes, no con texto ni imagenes. No incluye capacidades de lenguaje natural ni de tool calling.

## Casos de uso

- Retencion de clientes: el modelo de churn permite identificar clientes con alta probabilidad de abandono y activar campanas de retencion anticipadas. Su salida en probabilidad facilita el ordenamiento de la cartera.
- Campanas de marketing personalizadas: con el modelo de propension de compra, se puede priorizar a los clientes mas propensos a responder a una oferta, reduciendo el coste de adquisicion y mejorando el ROI.
- Calculo de valor de vida del cliente (CLV): el modelo regresor proporciona una estimacion numerica del valor futuro de cada cliente, util para decidir cuanto invertir en retencion o en captacion.
- Segmentacion de audiencias: el modelo K-Means agrupa clientes segun patrones de comportamiento, permitiendo disenar estrategias diferenciadas para cada segmento (por ejemplo, productos, canales o precios).
- Priorizacion de recursos de atencion al cliente: combinando churn, propension y CLV, el equipo puede asignar agentes de soporte o ofertas especiales a los clientes de mayor valor y riesgo.
- Panel de decisiones y analitica: el componente de explicabilidad SHAP permite mostrar a los equipos de negocio las variables que mas impactan en cada decision, facilitando la adopcion interna del modelo.
- Automatizacion de decisiones en tiempo real: mediante la API REST, el sistema puede integrarse en CRM o sistemas de gestion de relaciones para lanzar acciones automatizadas (por ejemplo, envio de mensajes cuando el modelo detecta riesgo de abandono).

## Benchmarks y rendimiento

La unica informacion de rendimiento disponible es la que aparece en la model card. Se presentan los valores medidos por el autor sobre un conjunto de test no especificado. No se han publicado comparaciones con modelos de referencia externos.

| Modelo | Algoritmo | Metrica | Valor |
|---|---|---|---|
| Churn Prediction Model | XGBoost Classifier | ROC-AUC | 1.0000 |
| Churn Prediction Model | XGBoost Classifier | Accuracy | 98.00% |
| Purchase Propensity Model | XGBoost Classifier | ROC-AUC | 1.0000 |
| Purchase Propensity Model | XGBoost Classifier | Accuracy | 100.00% |
| Customer Lifetime Value (CLV) | XGBoost Regressor | R² | 0.9800 |
| Customer Segmentation | K-Means Clustering | Silhouette Score | 0.3478 |

Estos resultados deben interpretarse con precaucion. Un ROC-AUC de 1.0000 y una exactitud del 100% en un modelo de propension son anomalos en datos reales, lo que apunta a un entrenamiento sobre datos sinteticos excesivamente simples o a una fuga de informacion en la evaluacion.

## Requisitos de hardware

- Los modelos XGBoost y K-Means son ligeros en comparacion con modelos de lenguaje y pueden ejecutarse en CPU sin necesidad de GPU.
- No se ha especificado la VRAM necesaria porque no se requiere aceleracion grafica; cualquier maquina con 8 GB de RAM deberia ser suficiente para inferencia individual.
- El despliegue es viable en maquinas locales, servidores cloud o contenedores Docker.
- El repositorio incluye un servidor FastAPI, una aplicacion Gradio y un script de inferencia por CLI.
- No se han proporcionado medidas de latencia o throughput. Dado el tamano de los modelos, la latencia previsible en una CPU moderna para una sola prediccion es de milisegundos, aunque no hay datos experimentales publicados.
- Para entrenamiento o evaluacion con grandes volumenes de datos, una GPU no es estrictamente necesaria, aunque XGBoost puede acelararse con GPU si se desea.

## Comparativa con modelos similares

No disponemos de informacion sobre modelos comparables dentro de la misma categoria (plataformas de decision de clientes con modelos XGBoost y K-Means) en la informacion proporcionada. La busqueda web no arroja alternativas equivalentes publicadas en Hugging Face. Por tanto, se indica que esta comparativa no esta disponible.

## Limitaciones y advertencias

- Los modelos se entrenan aparentemente con datos sinteticos generados por un script propio. No hay evidencia de validacion sobre datos reales, lo que limita su aplicabilidad en produccion.
- Las metricas reportadas son extraordinariamente altas (ROC-AUC 1.0000 en dos modelos), lo que sugiere sobreajuste, fuga de datos o un dataset trivial. No se debe confiar en estos valores para tomar decisiones de negocio.
- El sistema no es un modelo de lenguaje ni una IA generativa; no puede procesar texto, imagen ni audio.
- La clave de API publicada en el README (`c360_live_key_9f8a2b7c4e1d`) es un secreto expuesto publicamente. Cualquier persona podria usarla para acceder a los endpoints del servicio, lo que supone un riesgo de seguridad.
- La licencia MIT es permisiva, pero el estado del repositorio (0 descargas, 0 likes, sin archivos de modelo visibles) indica que es un proyecto en fase temprana y con mantenimiento incierto.
- No se aportan datos sobre sesgos, precision por segmentos de clientes ni analisis de errores.
- El repositorio no incluye una separacion clara entre artefactos de entrenamiento y de despliegue, y el formato `.joblib` no es estandar para compartir modelos en Hugging Face (se esperan normalmente `safetensors` o `gguf` para modelos generativos).
- Falta documentacion sobre hiperparametros, composicion del dataset y proceso de validacion cruzada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Vishu2006/customer360AI
- Perfil del autor en Hugging Face: https://huggingface.co/Vishu2006
- Sitio web de Customer360.ai: http://www.customer360.ai/
