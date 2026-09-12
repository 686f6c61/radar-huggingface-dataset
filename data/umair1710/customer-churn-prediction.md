# Umair1710/customer-churn-prediction

## Resumen

Umair1710/customer-churn-prediction es un clasificador tabular supervisado orientado a predecir la baja de clientes (churn) en operadores de telecomunicaciones. No es un modelo de lenguaje: se trata de un modelo de gradient boosting implementado con XGBoost, serializado junto a un `StandardScaler` de scikit-learn, que consume un vector de características tabulares procedente del dataset Telco Customer Churn de Kaggle (7.043 instancias y 21 características originales). El autor lo publica como repositorio de HuggingFace con la pipeline `tabular-classification`.

El objetivo declarado es identificar suscriptores con alto riesgo de cancelación antes de que se produzca la baja, priorizando el recall sobre la precisión: el coste de perder un cliente (LTV) se considera muy superior al coste de enviar una oferta de retención a un cliente que no pensaba irse. Con ese criterio, el modelo final alcanza un recall de 0,8102, un ROC-AUC de 0,8457 y un F1 de 0,6254 sobre el conjunto de test, según los datos declarados en la model card.

Su relevancia es limitada en términos de novedad técnica: se trata de un ejercicio end-to-end bien documentado (limpieza, ingeniería de características, tratamiento del desequilibrio de clases, ajuste de hiperparámetros y modelado) más que de una arquitectura nueva. Resulta útil como referencia reproducible para pipelines de propensión al abandono con datos tabulares y como ejemplo de calibración de umbral y de pesos de clase orientada a una métrica de negocio concreta. El repositorio acumula 0 descargas y 0 likes, con un tamaño declarado de 0,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles de decisión (XGBoost), con pipeline previo de `StandardScaler` y codificación one-hot |
| Parámetros totales | No disponible. Hiperparámetros declarados: `n_estimators=100`, `max_depth=3`, `learning_rate=0.05`, `subsample=0.8` |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Entrada tabular basada en el dataset Telco Customer Churn: 21 características de origen, expandidas mediante one-hot encoding; se añade la característica derivada `AvgMonthlySpend` |
| Tipos de cuantización | No aplica / no disponible. El modelo se distribuye como artefacto pickle, no como pesos de red neuronal |
| Idiomas soportados | en (la etiqueta de idioma se refiere al idioma del dataset; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | Pickle de scikit-learn/XGBoost (`xgboost_churn_model.pkl`) y escalador (`scaler.pkl`), cargables con `joblib` |

## Arquitectura y entrenamiento

La arquitectura es un conjunto de 100 árboles de decisión potenciados por gradiente (XGBoost), con profundidad máxima 3, tasa de aprendizaje 0,05 y submuestreo de filas del 0,8, ajustados mediante `GridSearchCV`. El preprocesado aplica one-hot encoding con `pd.get_dummies(drop_first=True)` sobre las variables categóricas y `StandardScaler` sobre las numéricas, ajustado estrictamente sobre `X_train` para evitar fuga de datos. La variable `TotalCharges`, originalmente en formato texto, se convierte a numérica y los valores ausentes se imputan a 0; además se construye la característica derivada `AvgMonthlySpend = TotalCharges / max(tenure, 1)`.

El conjunto de datos de origen es el Telco Customer Churn de Kaggle, con 7.043 instancias y 21 características, y una distribución objetivo de 73,5 % de no churn frente a 26,5 % de churn. El entrenamiento se plantea en tres fases: primero modelos base con pérdida sin ponderar (regresión logística, random forest y XGBoost), después una fase de compensación del desequilibrio de clases mediante `class_weight='balanced'` y `scale_pos_weight = 2,77`, y finalmente el ajuste fino de hiperparámetros de XGBoost. No se documenta uso de RLHF, DPO ni ningún otro método de alineación, algo que no aplica a un clasificador tabular.

## Capacidades

- Clasificación binaria tabular: predice la probabilidad de churn (clase 1) o no churn (clase 0) a partir de un vector de características de cliente.
- Puntuación de riesgo orientada a recall: con el umbral y los pesos de clase empleados, captura 303 de los 374 casos reales de churn en la partición de test, según la model card.
- Integración directa en pipelines de Python: el artefacto es un pickle cargable con `joblib` y descargable desde HuggingFace mediante `hf_hub_download`.
- Preprocesado autocontenido: el repositorio incluye el `scaler.pkl` entrenado sobre el conjunto de entrenamiento y el dataset preprocesado `telco_churn_preprocessed.csv`.
- Interpretabilidad potencial por tratarse de un modelo de árboles, si bien no se documentan análisis SHAP ni importancias de variables.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio. No dispone de modo de pensamiento ni de capacidades multilingües: es un clasificador tabular de dominio específico.

## Casos de uso

- Campañas de retención proactiva en telecomunicaciones: se puntúa diariamente la base de clientes con el modelo y se envían ofertas de retención al segmento de mayor probabilidad de churn, priorizando el recall para no dejar fuera clientes en riesgo.
- Priorización de agentes de atención al cliente: las puntuaciones del modelo alimentan una cola de trabajo en la que los clientes de riesgo elevado se asignan a agentes especializados en retención durante sus llamadas entrantes.
- Segmentación para marketing: las probabilidades de churn se combinan con el valor del cliente (LTV) para seleccionar a qué perfiles merece la pena ofrecer descuentos o mejoras de tarifa, dado que el modelo prioriza cobertura sobre precisión.
- Análisis de causas de baja: usando las características de entrada y las importancias del modelo de árboles, el equipo de producto puede identificar qué combinaciones de servicio, tipo de contrato o antigüedad concentran el riesgo.
- Monitorización de cohortes en producción: el pipeline se puede reejecutar mensualmente sobre la base actualizada para detectar variaciones en la tasa de churn y disparar alertas cuando la proporción de clientes de alto riesgo supere un umbral definido.
- Prueba de concepto y docencia: por su licencia MIT, su tamaño reducido y su documentación completa, es un ejemplo reutilizable para enseñar el ciclo completo de un proyecto de clasificación tabular con desequilibrio de clases.
- Integración en CRM o sistemas de facturación: al ser un artefacto ligero de Python, puede invocarse desde un servicio interno que consuma los registros de cliente y devuelva la probabilidad de churn en la propia interfaz del operador.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card y en el `model-index`. Ninguno de ellos está verificado de forma independiente.

| Métrica | Valor | Verificado |
|---|---|---|
| Recall | 0,8102 | No |
| ROC-AUC | 0,8457 | No |
| F1 | 0,6254 | No |
| Accuracy | 0,7480 | No |
| Precision | 0,5101 | No |

Comparativa interna entre las fases documentadas por el autor sobre el mismo conjunto de evaluación:

| Modelo | Accuracy | Recall | F1 | ROC-AUC |
|---|---|---|---|---|
| XGBoost ajustado (modelo final) | 74,80 % | 81,02 % | 0,6254 | 0,8457 |
| Regresión logística con pesos balanceados | 73,81 % | 78,34 % | 0,6136 | 0,8417 |
| XGBoost con pesos balanceados | 76,22 % | 66,04 % | 0,5959 | 0,8173 |
| Regresión logística base | 80,70 % | 56,68 % | 0,6115 | 0,8423 |
| Random forest con pesos balanceados | 79,06 % | 49,47 % | 0,5564 | 0,8227 |
| XGBoost base | 77,86 % | 50,53 % | 0,5401 | 0,8173 |
| Random forest base | 78,42 % | 49,47 % | 0,5522 | 0,8271 |

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores. No hay evaluación sobre MMLU, HumanEval, GSM8K ni métricas equivalentes, ya que no son aplicables a un clasificador tabular.

## Requisitos de hardware

- VRAM para inferencia: no aplica. El modelo no requiere GPU; es un conjunto de 100 árboles de profundidad 3 que se ejecuta en CPU.
- GPU recomendadas: no aplica. No hay soporte declarado para aceleración por GPU en el artefacto distribuido.
- Compatibilidad con GPU de consumo: no aplica. El modelo cabe en cualquier equipo capaz de ejecutar Python, incluido un portátil de gama baja.
- Opciones de despliegue: carga mediante `joblib` en Python, con `xgboost` y `scikit-learn` instalados; descarga de artefactos con `huggingface_hub`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. El tamaño del repositorio es de 0,0 GB, por lo que el coste de inferencia por registro es despreciable frente a los tiempos de red o de acceso a base de datos.
- Requisito de preprocesado: es imprescindible aplicar exactamente el `StandardScaler` incluido y el mismo esquema de one-hot encoding que en el entrenamiento; cualquier discrepancia en el orden o el número de columnas invalida las predicciones.

## Comparativa con modelos similares

No se dispone de otros modelos publicados en HuggingFace con la misma combinación de dataset y tarea en la información proporcionada, por lo que la comparativa se limita a las alternativas evaluadas por el propio autor dentro de la model card.

| Modelo | Algoritmo | Recall | ROC-AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| customer-churn-prediction (Umair1710) | XGBoost ajustado | 0,8102 | 0,8457 | MIT | HuggingFace |
| Alternativa con pesos balanceados del mismo estudio | Regresión logística | 0,7834 | 0,8417 | No disponible | No publicada como artefacto independiente |
| Alternativa base del mismo estudio | Random forest | 0,4947 | 0,8271 | No disponible | No publicada como artefacto independiente |
| Modelos comparables de terceros | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado sobre un único dataset público (Telco Customer Churn, 7.043 instancias de un operador estadounidense). Su generalización a otras empresas, países o sectores no está demostrada y muy probablemente requiera reentrenamiento.
- Precisión baja (0,5101): aproximadamente la mitad de las alertas de churn serán falsos positivos. El modelo está deliberadamente desequilibrado hacia el recall, de modo que no debe usarse como filtro estricto sin valorar el coste operativo de las ofertas de retención.
- Accuracy del 74,80 %, inferior a la de la regresión logística base (80,70 %). Si el criterio de negocio fuese la exactitud global en lugar de la cobertura de churners, este modelo no sería la mejor opción.
- Los resultados declarados en el `model-index` tienen `verified: false` y no han sido reproducidos de forma independiente. No se documenta la partición de test exacta, la semilla ni el número de ejecuciones, lo que dificulta la reproducibilidad estricta.
- No se documentan análisis de sesgo, de equidad entre segmentos de clientes ni de robustez ante cambios de distribución. Variables sensibles como el género o la dependencia familiar están presentes en el dataset original y podrían inducir tratamientos discriminatorios si se usan sin revisión.
- Riesgo de degradación temporal (data drift): los patrones de churn cambian con el mercado, las tarifas y la competencia, por lo que el modelo requiere reentrenamiento periódico.
- Dependencia fuerte del preprocesado: el orden y el nombre de las columnas tras el one-hot encoding deben coincidir exactamente con los del entrenamiento. Un desajuste provoca errores o predicciones silenciosamente incorrectas.
- Limitación de idioma: la etiqueta `en` describe el dataset, no una capacidad multilingüe; el modelo no procesa texto en ningún idioma.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía. No obstante, la licencia cubre el artefacto publicado, no los derechos sobre el dataset de origen, cuya licencia debe verificarse por separado.
- Fecha de creación del repositorio declarada como 2026-09-12 y 0 descargas y 0 likes: se trata de un artefacto sin adopción ni validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Umair1710/customer-churn-prediction
- Dataset de origen citado en la model card: blastchar/telco-customer-churn (Kaggle Telco Customer Churn)
- Paper: no disponible
- Blog o artículo técnico: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de ayuda de YouTube y a hilos de foro sin relación con este repositorio.
