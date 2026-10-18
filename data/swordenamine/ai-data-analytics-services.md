# swordenamine/ai-data-analytics-services

## Resumen

`swordenamine/ai-data-analytics-services` no es un modelo de IA: es un repositorio de código publicado en HuggingFace bajo la etiqueta de modelo, que contiene una plantilla de servicios de analítica de datos y machine learning de extremo a extremo. El README describe un stack completo con pipelines de ingesta, transformación y modelado, modelos clásicos de scikit-learn (Random Forest para churn, Isolation Forest combinado con Z-score para anomalías, Prophet y LSTM para series temporales), una API FastAPI, detección de fraude en streaming con Kafka, dashboards de Grafana y gobierno del dato con controles de calidad, RBAC y cumplimiento GDPR/CCPA.

El interés del proyecto es de tipo plantilla de referencia (scaffolding) para equipos que quieran montar una arquitectura de analítica con Docker Compose y Kubernetes, con seguimiento de experimentos en MLflow y orquestación con Airflow. No incluye pesos, no define un transformer ni un modelo generativo, y no publica métricas de rendimiento.

Por tanto, las filas de la ficha relativas a parámetros, contexto, cuantización o idiomas se marcan como no disponibles o no aplicables, y el resto de secciones se reinterpretan en términos de los componentes software que el repositorio sí documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica como modelo de IA. El repositorio contiene pipelines de datos y modelos clásicos: Random Forest (churn), Isolation Forest + Z-score (anomalías), Prophet y LSTM (forecasting), servidos con FastAPI y Kafka |
| Parámetros totales | No disponible (no se distribuyen pesos ni recuento de parámetros) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no hay pesos en safetensors, GGUF ni formatos equivalentes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en los metadatos de HuggingFace; el README muestra una insignia MIT no verificable desde la ficha |
| Formato de pesos | No disponible; no hay pesos. El repositorio contiene código Python, YAML, JSON, Dockerfiles y ficheros de configuración |
| Pipeline de HuggingFace | No disponible |
| Versión de Python declarada | 3.11+ (según el README) |
| Dependencias destacadas | FastAPI 0.111, Kafka, PostgreSQL, MLflow, Airflow, Grafana, Docker, Kubernetes con HPA |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creación (metadatos) | 2026-10-17 |
| Última actualización (metadatos) | 2026-02-15 |

## Arquitectura y entrenamiento

La arquitectura es la de una plataforma de datos por capas, no la de una red neuronal. La capa de ingesta (`pipelines/ingestion/ingestion_pipeline.py`) implementa conectores de base de datos (PostgreSQL, BigQuery, Snowflake), de API REST con paginación automática y reintentos, y de ficheros, con carga incremental y cola de mensajes muertos. La capa de transformación cubre limpieza, ingeniería de características y escalado; la capa de modelado (`pipelines/modeling/ml_pipeline.py`) es un pipeline genérico de scikit-learn con seguimiento de experimentos en MLflow y orquestación mediante `run_full_pipeline.py` y Airflow.

Los modelos son baselines supervisados y no supervisados: `ChurnPredictor` con Random Forest y explicaciones SHAP, `AnomalyDetector` con ensemble Isolation Forest + Z-score y parámetro `contamination=0.01`, y `ProphetForecaster` con modo de estacionalidad multiplicativa, además de un componente LSTM para series temporales. El servicio de streaming (`streaming/fraud_detector.py`) consume el topic `transactions` de Kafka y publica alertas en `fraud-alerts` con umbral de score configurable. La API expone los endpoints `/predict/churn`, `/detect/anomaly` y `/forecast`.

No se documenta entrenamiento sobre corpus de texto, número de tokens, composición de dataset, ni fases de RLHF, DPO o ajuste por preferencias. El único dato de entrenamiento mencionado es un generador de datos sintéticos (`scripts/load_sample_data.py`) para poblar la base de datos de demostración.

## Capacidades

- Predicción de abandono de clientes (churn) con probabilidad por cliente, tiers de riesgo y umbral configurable, más explicaciones SHAP por predicción.
- Detección de anomalías y fraude mediante ensemble de Isolation Forest y Z-score, con tasa de contaminación configurable.
- Predicción de series temporales con Prophet (hasta horizontes arbitrarios, el ejemplo usa 90 periodos) y un componente LSTM.
- Ingesta incremental desde bases de datos, APIs REST con paginación automática y reintentos, y ficheros, con cola de mensajes muertos.
- Procesamiento en streaming con Kafka para puntuación continua de transacciones y publicación de alertas.
- Servido de predicciones vía API REST con FastAPI y documentación OpenAPI en `/docs`.
- Monitorización y visualización: plantillas JSON de dashboards de Grafana con integración sobre PostgreSQL; stubs de Power BI y Tableau.
- Gobierno del dato: validación de esquema y rangos, comprobaciones de frescura con SLA, RBAC compatible con OPA con enmascarado de filas y columnas, y manejadores de derechos GDPR y opt-out de CCPA.
- Despliegue: Dockerfile para la API, `docker-compose.yml` con Postgres, Kafka, MLflow, Grafana y Airflow, y manifiestos de Kubernetes con Deployment, Service, Ingress y HPA.
- No incluye generación de texto, razonamiento, código, visión, audio, tool calling ni modo thinking: no es un modelo de lenguaje.

## Casos de uso

- Predicción de churn en SaaS o telecomunicaciones: se entrena `ChurnPredictor` con el histórico de clientes, se puntúa la base activa y se extraen los clientes con probabilidad superior a 0,7 para campañas de retención, usando los valores SHAP para justificar la acción al equipo comercial.
- Detección de fraude en tiempo real en medios de pago: el servicio de streaming consume el topic `transactions`, puntúa cada operación con el ensemble de anomalías y publica alertas en `fraud-alerts`, lo que permite bloquear o revisar operaciones sin procesamiento batch.
- Previsión de demanda e inventario: `ProphetForecaster` con estacionalidad multiplicativa sobre series de ventas diarias para generar previsiones a 90 días que alimenten la planificación de compras o de capacidad.
- Detección de anomalías operativas en métricas de infraestructura o IoT: el detector puede reentrenarse con ventanas de datos normales y marcar desviaciones con un umbral de contaminación bajo (1 % en el ejemplo), publicando resultados vía API.
- Construcción de una capa de analítica self-service: los pipelines de ingesta y transformación alimentan PostgreSQL, y las plantillas de Grafana ofrecen paneles con datos actualizados; es útil como base para un equipo que aún no tiene plataforma de BI.
- MLOps interna como plantilla: MLflow para registro de experimentos y modelos, Airflow para orquestación y manifiestos de Kubernetes con HPA para escalar la API de predicción según carga.
- Cumplimiento y gobierno del dato: validación de esquema y frescura en la ingesta, RBAC con enmascarado de columnas y flujos de derechos del interesado (GDPR) o de opt-out (CCPA) como punto de partida para auditorías internas.
- Prototipado rápido de un endpoint de scoring: la API FastAPI permite exponer un modelo ya entrenado en pocas horas y consumirlo con `curl` o desde otro servicio interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión, recall, AUC, MAE ni latencias medidas para los modelos de churn, anomalías o forecasting, ni comparaciones con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los componentes descritos (Random Forest, Isolation Forest, Prophet) se ejecutan habitualmente en CPU, pero el repositorio no publica cifras de memoria ni de GPU, y el componente LSTM no se detalla.
- GPU recomendadas: no disponible. No se documenta ningún requisito de acelerador.
- Cabe en GPU de consumo: no disponible como dato del proyecto. Al no incluir pesos ni modelos profundos de gran tamaño, el cuello de botella previsible es CPU y memoria del stack de servicios, no la GPU.
- Requisitos del stack completo: el `docker-compose.yml` levanta PostgreSQL, Kafka, MLflow, Grafana y Airflow, por lo que el requisito real es memoria RAM y disco para varios contenedores; no se publican mínimos.
- Opciones de despliegue: Docker Compose para desarrollo, Kubernetes con HPA para producción, `uvicorn api.main:app` para la API, MLflow para registro de modelos y Airflow para orquestación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables porque el artefacto no es un modelo. A modo de referencia, se compara con frameworks con los que se solapa funcionalmente:

| Alternativa | Tipo | Solapamiento | Diferencias clave | Licencia |
|---|---|---|---|---|
| Kubeflow | Plataforma de ML sobre Kubernetes | Pipelines, serving, orquestación | Mucho más amplio y pesado; este repositorio es una plantilla ligera con Docker Compose | No disponible en esta ficha |
| MLflow | Gestión del ciclo de vida de modelos | Tracking y registro de modelos | Aquí MLflow se usa como dependencia, no como sustituto del stack | No disponible en esta ficha |
| ZenML | Framework de pipelines de ML | Orquestación de pipelines | Enfoque en abstracción de pipelines; este repositorio incluye además BI, streaming y gobierno | No disponible en esta ficha |
| Stack propio (sklearn + FastAPI + Airflow) | Desarrollo a medida | Todos los componentes | El repositorio ahorra el trabajo de glue code, pero añade dependencia de sus convenciones | No disponible en esta ficha |

En parámetros, contexto y benchmarks, todas las alternativas se consideran "no aplica" o "no disponible".

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, tokenizador ni configuración de inferencia, pese a estar publicado bajo la etiqueta de modelo en HuggingFace. Cualquier expectativa de uso como LLM es incorrecta.
- La licencia no figura en los metadatos de HuggingFace; la insignia MIT del README no es verificable desde la ficha. Antes de uso comercial hay que confirmar el fichero `LICENSE` en el repositorio de origen.
- Los modelos son baselines de scikit-learn sin métricas publicadas; no hay evidencia de rendimiento en producción ni validación frente a drift.
- El parámetro `contamination=0.01` del detector de anomalías condiciona la tasa esperada de alertas y exige calibración con datos reales; no se documenta cómo ajustarlo.
- El repositorio de origen enlazado en el README (`github.com/swordenkisk/...`) no coincide con el nombre del autor en HuggingFace (`swordenamine`), lo que complica verificar la procedencia del código.
- Los metadatos de HuggingFace son incoherentes: la fecha de creación (2026-10-17) es posterior a la de última actualización (2026-02-15).
- Cero descargas y cero likes: no hay señales de uso, revisión por terceros ni mantenimiento activo verificable.
- El README documenta credenciales por defecto para Grafana y Airflow (usuario y contraseña `admin`), inaceptables en cualquier despliegue expuesto.
- Los conectores de Power BI y Tableau se describen como stubs, no como integraciones completas.
- Los módulos de cumplimiento GDPR y CCPA se presentan como manejadores de derechos, pero no se acredita auditoría ni base legal; no deben tomarse como solución de cumplimiento por sí solos.
- Requiere una infraestructura de servicios (PostgreSQL, Kafka, Airflow, MLflow, Grafana) que excede el consumo de un portátil y añade superficie de mantenimiento y de seguridad.
- No hay soporte multilingüe, de tool calling ni de agentes, al no existir componente generativo.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/swordenamine/ai-data-analytics-services
- Repositorio de origen citado en el README: https://github.com/swordenkisk/ai-data-analytics-services
- Fichero de licencia citado en el README: https://github.com/swordenkisk/ai-data-analytics-services/blob/main/LICENSE (según la insignia del README, no verificable)
- Documentación de referencia de las dependencias declaradas: https://fastapi.tiangolo.com, https://mlflow.org, https://airflow.apache.org, https://grafana.com, https://kafka.apache.org
